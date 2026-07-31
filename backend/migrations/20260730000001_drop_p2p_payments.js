/* eslint-disable camelcase */

// Drop the P2P (card-transfer) payment flow.
//
// The flow was decommissioned at the Click cutover (20260724000001), which
// deactivated every payment_cards row but deliberately kept the tables because
// they would have held real settlement records. They never did: the app has not
// been in production and no money moved through this flow, so there is nothing
// to retain and the application code has now been removed entirely.
//
// Dropped here:
//   payment_submissions   (+ its two indexes, two check constraints, trigger)
//   payment_cards         (+ its index, trigger)
//   payment_submission_status  enum type
//
// Order matters: payment_submissions references payment_cards(id), and the enum
// is still in use by payment_submissions.status, so the enum can only go once
// the table using it is gone. Triggers and indexes drop with their table, but
// the triggers are dropped explicitly so the intent is readable rather than
// implied.
//
// Slip files: the uploader wrote to <project-root>/uploads/payment-slips/.
// A migration cannot clear a filesystem, so remove that directory by hand on
// any environment where the old flow ran.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`DROP TRIGGER IF EXISTS trg_payment_subs_updated_at ON payment_submissions`);
  pgm.sql(`DROP TRIGGER IF EXISTS trg_payment_cards_updated_at ON payment_cards`);

  pgm.dropTable('payment_submissions', { ifExists: true });
  pgm.dropTable('payment_cards', { ifExists: true });

  pgm.dropType('payment_submission_status', { ifExists: true });
};

// Recreates the structure exactly as 20260608000005 defined it, including the
// updated_at triggers. The DATA is gone and is not recoverable from here - this
// exists so `migrate down` leaves a schema matching the migration immediately
// before it, not so the flow can be resurrected.
exports.down = (pgm) => {
  pgm.createType('payment_submission_status', ['pending', 'approved', 'rejected']);

  pgm.createTable('payment_cards', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    card_number: { type: 'text', notNull: true },
    holder_name: { type: 'text', notNull: true },
    bank_label: { type: 'text' },
    is_active: { type: 'boolean', notNull: true, default: true },
    sort_order: { type: 'integer', notNull: true, default: 0 },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.createIndex('payment_cards', ['is_active', 'sort_order'], {
    name: 'idx_payment_cards_active_sort',
  });

  pgm.createTable('payment_submissions', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: { type: 'bigint', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    plan_id: { type: 'text', notNull: true, references: 'plans(id)', onDelete: 'RESTRICT' },
    card_id: { type: 'uuid', references: 'payment_cards(id)', onDelete: 'SET NULL' },
    amount_minor: { type: 'integer', notNull: true },
    currency: { type: 'text', notNull: true },
    slip_path: { type: 'text', notNull: true },
    slip_original_name: { type: 'text', notNull: true },
    slip_mime: { type: 'text', notNull: true },
    slip_size: { type: 'integer', notNull: true },
    status: { type: 'payment_submission_status', notNull: true, default: 'pending' },
    review_note: { type: 'text' },
    reviewed_by_user_id: { type: 'bigint', references: 'users(id)', onDelete: 'SET NULL' },
    reviewed_at: { type: 'timestamptz' },
    subscription_id: { type: 'uuid', references: 'subscriptions(id)', onDelete: 'SET NULL' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });

  pgm.addConstraint('payment_submissions', 'chk_payment_amount_positive', {
    check: 'amount_minor > 0',
  });
  pgm.addConstraint('payment_submissions', 'chk_payment_slip_size_positive', {
    check: 'slip_size > 0',
  });

  pgm.createIndex('payment_submissions', ['status', { name: 'created_at', sort: 'DESC' }], {
    name: 'idx_payment_subs_status_created',
  });
  pgm.createIndex('payment_submissions', ['user_id', { name: 'created_at', sort: 'DESC' }], {
    name: 'idx_payment_subs_user_created',
  });

  pgm.sql(`
    CREATE TRIGGER trg_payment_cards_updated_at
      BEFORE UPDATE ON payment_cards
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `);
  pgm.sql(`
    CREATE TRIGGER trg_payment_subs_updated_at
      BEFORE UPDATE ON payment_submissions
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `);
};
