/* eslint-disable camelcase */

// Durable queue for transactional email.
//
// Why this exists: every transactional send was fire-and-forget. The caller
// awaited EmailTemplatesService.sendByTemplate, caught whatever came back and
// logged a warning. That is correct for a PERMANENT failure and wrong for a
// TEMPORARY one - and SMTP distinguishes the two deliberately.
//
// On 2026-08-05 a paid subscription produced:
//   451 4.7.1 Service unavailable - try again later
// from our own relay (rspamd milter soft-reject). 451 is 4xx: the server is
// explicitly saying "ask me again". Nothing asked again, so a user who had
// been charged never got a receipt. There was no record that the email had
// even been attempted beyond one WARN line in the container log.
//
// The retry model here mirrors ClickFiscalService: bounded attempts, a
// last_error the admin panel can read, and a cron that sweeps what is due.
//
// status is text + CHECK rather than a Postgres enum on purpose. Adding a
// value to an enum cannot run inside a transaction, which has already bitten
// this codebase once (see 20260524000003_drop_short_answer_enum_value.js).
// A CHECK constraint is a plain ALTER and costs nothing here.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql('CREATE EXTENSION IF NOT EXISTS pgcrypto');

  pgm.createTable('email_outbox', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },

    // Rendered lazily at drain time, not at enqueue time. An admin who fixes a
    // typo in a template while the queue is backed up gets the corrected copy,
    // and a template that was briefly inactive can still go out once re-enabled.
    template_key: { type: 'text', notNull: true },
    to_email: { type: 'text', notNull: true },
    lang: { type: 'text', notNull: true, default: 'en' },
    variables: { type: 'jsonb', notNull: true, default: pgm.func(`'{}'::jsonb`) },

    // pending -> waiting for the next drain
    // sent    -> relay accepted it (250)
    // failed  -> permanent rejection, or attempts exhausted. Never retried.
    status: { type: 'text', notNull: true, default: 'pending' },

    attempts: { type: 'integer', notNull: true, default: 0 },
    last_error: { type: 'text' },

    // The drain picks up rows where next_attempt_at <= NOW(). Backoff pushes
    // this forward after each failure.
    next_attempt_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    sent_at: { type: 'timestamptz' },

    // Free-form origin marker so the admin panel can say WHY an email exists
    // ("click order <id>", "manual grant"). Not used for logic.
    context: { type: 'text' },

    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });

  pgm.addConstraint('email_outbox', 'email_outbox_status_check', {
    check: "status IN ('pending', 'sent', 'failed')",
  });

  // The drain's only query: pending rows that are due, oldest first. Partial
  // index so the sent/failed history does not weigh on it as the table grows.
  pgm.createIndex('email_outbox', ['next_attempt_at'], {
    name: 'idx_email_outbox_due',
    where: "status = 'pending'",
  });

  // For the admin panel's failure list.
  pgm.createIndex('email_outbox', [{ name: 'created_at', sort: 'DESC' }], {
    name: 'idx_email_outbox_created',
  });

  pgm.sql(`
    CREATE TRIGGER trg_email_outbox_updated_at
      BEFORE UPDATE ON email_outbox
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `);
};

exports.down = (pgm) => {
  pgm.sql('DROP TRIGGER IF EXISTS trg_email_outbox_updated_at ON email_outbox');
  pgm.dropTable('email_outbox');
};
