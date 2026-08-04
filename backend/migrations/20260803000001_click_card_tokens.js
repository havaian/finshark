/* eslint-disable camelcase */

// Recurring subscriptions: stored Click card tokens + auto-renew.
//
// WHAT IS AND IS NOT STORED
//
// This table stores Click's card TOKEN and nothing else that identifies a card
// beyond a masked display string ("8600 55** **** 3244") that Click itself
// returns from card_token/verify.
//
// The card NUMBER is never stored, never logged, and never written to disk in
// any form. It travels from the user's browser to Click's card_token/request
// endpoint - which is the one Click endpoint requiring no Auth header, and is
// therefore callable directly from the client - and if it ever has to transit
// our backend (CORS fallback) it exists only as a request-scoped variable.
//
// Do not add a card_number column here. "Store it briefly and delete it" is how
// a PAN ends up in a backup, a WAL segment and a debug log line, and deleting
// the row unwinds none of that.
//
// TOKEN LIFECYCLE
//
//   pending_sms  card_token/request succeeded, awaiting the SMS code
//   active       card_token/verify succeeded, usable for charges
//   removed      user unbound it, or Click rejected it permanently
//
// Click cannot unbind a card from their own app (confirmed by Click support,
// 2026-08-03) - our DELETE is the only route - so the row is the authoritative
// record of the binding and the cancellation UI is a hard requirement, not a
// nicety.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createType('click_card_token_status', ['pending_sms', 'active', 'removed']);

  pgm.createTable('click_card_tokens', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: {
      type: 'bigint',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    // Click's opaque token. This is the only credential we hold.
    card_token: { type: 'text', notNull: true },
    // Masked PAN exactly as Click returns it from verify, for display only.
    card_masked: { type: 'text' },
    // Masked phone Click returns from card_token/request, so the user knows
    // which number the SMS went to.
    phone_masked: { type: 'text' },
    status: { type: 'click_card_token_status', notNull: true, default: 'pending_sms' },
    verified_at: { type: 'timestamptz' },
    removed_at: { type: 'timestamptz' },
    // Last failure text from Click, surfaced to the user when a renewal fails.
    last_error: { type: 'text' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });

  // One ACTIVE token per user. Partial unique index rather than a plain one:
  // removed tokens are kept for audit, and a user rebinding the same card would
  // otherwise collide with their own history.
  pgm.createIndex('click_card_tokens', ['user_id'], {
    name: 'uq_click_card_tokens_active_user',
    unique: true,
    where: "status = 'active'",
  });
  pgm.createIndex('click_card_tokens', ['status', 'created_at'], {
    name: 'idx_click_card_tokens_status_created',
  });

  pgm.sql(`
    CREATE TRIGGER trg_click_card_tokens_updated_at
      BEFORE UPDATE ON click_card_tokens
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `);

  // ── Auto-renew on subscriptions ────────────────────────────────────────
  //
  // Default FALSE, deliberately. Every subscription bought before this feature
  // existed was a one-off purchase, and flipping those to auto-renew would
  // charge people who never agreed to a recurring payment.
  pgm.addColumns('subscriptions', {
    auto_renew: { type: 'boolean', notNull: true, default: false },
    // Token used for the renewal attempt. SET NULL rather than CASCADE: losing
    // the card must not delete the subscription record.
    renew_card_token_id: {
      type: 'uuid',
      references: 'click_card_tokens(id)',
      onDelete: 'SET NULL',
    },
    // Bookkeeping for the renewal cron.
    renew_attempts: { type: 'integer', notNull: true, default: 0 },
    renew_last_attempt_at: { type: 'timestamptz' },
    renew_last_error: { type: 'text' },
  });

  // The renewal sweep looks for: auto_renew AND status='active' AND ends_at
  // inside the renewal window. Partial index so it stays small - the vast
  // majority of rows will never be auto-renewing.
  pgm.createIndex('subscriptions', ['ends_at'], {
    name: 'idx_subscriptions_autorenew_due',
    where: 'auto_renew = TRUE',
  });
};

exports.down = (pgm) => {
  pgm.dropIndex('subscriptions', ['ends_at'], {
    name: 'idx_subscriptions_autorenew_due',
    ifExists: true,
  });
  pgm.dropColumns('subscriptions', [
    'auto_renew',
    'renew_card_token_id',
    'renew_attempts',
    'renew_last_attempt_at',
    'renew_last_error',
  ]);
  pgm.sql(
    'DROP TRIGGER IF EXISTS trg_click_card_tokens_updated_at ON click_card_tokens'
  );
  pgm.dropTable('click_card_tokens', { ifExists: true });
  pgm.dropType('click_card_token_status', { ifExists: true });
};
