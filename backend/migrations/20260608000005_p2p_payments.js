// P2P (peer-to-peer card transfer) payment flow.
//
// No PSP / webhook involved. The flow is manual-review:
//   1. Admin maintains a set of receiving cards (payment_cards) shown to users.
//   2. User picks a plan, transfers money to a card out-of-band, uploads a
//      payment slip (image/PDF), which creates a payment_submissions row in
//      status='pending'. NO subscription is created yet.
//   3. Admin reviews the slip and either approves (-> SubscriptionsService.grant
//      with source='manual', linking subscription_id) or rejects (with a note).
//
// We deliberately do NOT add a 'p2p' value to the subscription_source enum:
//   - Postgres enum changes can't run inside a transaction, complicating
//     migrations.
//   - The grant is genuinely a manual/admin action at approval time, so
//     source='manual' is accurate. The P2P origin is recorded on the
//     subscription via metadata ({ origin: 'p2p', submission_id }) and on the
//     submission row itself.
//
// Card numbers are stored as plain text ON PURPOSE: these are the operator's
// OWN receiving cards, meant to be displayed publicly to users for transfer.
// They are NOT customer PANs - no cardholder payment data is collected or
// stored anywhere in this flow (the user only uploads a transfer receipt).
//
// Slips are stored on disk under <project-root>/uploads/payment-slips/ (a
// docker named volume in prod). Only the relative path + mime + size live in
// the DB; bytes never touch Postgres. Slips are private - served back only via
// an admin-authenticated streaming route, never statically.

exports.shorthands = undefined;

exports.up = (pgm) => {
  // pgcrypto (gen_random_uuid) is already enabled by the billing-core
  // migration; the IF NOT EXISTS keeps this safe if ordering ever changes.
  pgm.sql('CREATE EXTENSION IF NOT EXISTS pgcrypto');

  // -- payment status enum ---------------------------------------------------
  // pending -> awaiting admin review (initial state on upload)
  // approved -> admin confirmed transfer, subscription granted
  // rejected -> admin rejected (e.g. unreadable / wrong amount); review_note explains
  pgm.createType('payment_submission_status', ['pending', 'approved', 'rejected']);

  // -- payment_cards ---------------------------------------------------------
  // Admin-editable receiving cards. Multiple can be active; the user UI shows
  // all active cards (ordered by sort_order) so the operator can rotate or
  // offer several banks.
  pgm.createTable('payment_cards', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    card_number: { type: 'text', notNull: true },   // operator's OWN receiving card (see header note)
    holder_name: { type: 'text', notNull: true },   // name printed on the card, for the transfer
    bank_label: { type: 'text' },                    // optional human label, e.g. 'Uzcard - Kapitalbank'
    is_active: { type: 'boolean', notNull: true, default: true },
    sort_order: { type: 'integer', notNull: true, default: 0 },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
  // The user-facing "active cards" query filters is_active and orders by
  // sort_order; this index serves it directly.
  pgm.createIndex('payment_cards', ['is_active', 'sort_order'], {
    name: 'idx_payment_cards_active_sort',
  });

  // -- payment_submissions ---------------------------------------------------
  pgm.createTable('payment_submissions', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: { type: 'bigint', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    // Plan the user is paying for. RESTRICT: don't allow deleting a plan that
    // has submissions pointing at it (mirrors subscriptions.plan_id).
    plan_id: { type: 'text', notNull: true, references: 'plans(id)', onDelete: 'RESTRICT' },
    // Which card they say they paid to. SET NULL on delete so removing a
    // rotated-out card doesn't blow away historical submissions; the slip and
    // amount still tell the story.
    card_id: { type: 'uuid', references: 'payment_cards(id)', onDelete: 'SET NULL' },
    // Amount the user claims to have paid, snapshotted from the plan at submit
    // time (plans.price_minor can change later). Minor units, like plans.
    amount_minor: { type: 'integer', notNull: true },
    currency: { type: 'text', notNull: true },       // ISO 4217, snapshotted from plan
    // Slip file: relative path under the uploads root, original filename (for
    // display/download), detected mime, and size in bytes. Bytes live on disk.
    slip_path: { type: 'text', notNull: true },
    slip_original_name: { type: 'text', notNull: true },
    slip_mime: { type: 'text', notNull: true },
    slip_size: { type: 'integer', notNull: true },
    status: { type: 'payment_submission_status', notNull: true, default: 'pending' },
    review_note: { type: 'text' },                   // admin's note on approve/reject
    reviewed_by_user_id: { type: 'bigint', references: 'users(id)', onDelete: 'SET NULL' },
    reviewed_at: { type: 'timestamptz' },
    // Set when an approval grants premium; links the resulting subscription so
    // the admin UI can jump from submission -> subscription. SET NULL if the
    // subscription row is ever removed.
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

  // Admin review queue: list submissions by status, newest first. Composite
  // (status, created_at DESC) serves "all pending, newest first" without a sort.
  pgm.createIndex('payment_submissions', ['status', { name: 'created_at', sort: 'DESC' }], {
    name: 'idx_payment_subs_status_created',
  });
  // "My submissions" lookup for a user, newest first.
  pgm.createIndex('payment_submissions', ['user_id', { name: 'created_at', sort: 'DESC' }], {
    name: 'idx_payment_subs_user_created',
  });

  // -- updated_at triggers (set_updated_at() lives in content_and_srs.js) ----
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

exports.down = (pgm) => {
  pgm.sql('DROP TRIGGER IF EXISTS trg_payment_subs_updated_at  ON payment_submissions');
  pgm.sql('DROP TRIGGER IF EXISTS trg_payment_cards_updated_at ON payment_cards');
  pgm.dropTable('payment_submissions');
  pgm.dropTable('payment_cards');
  pgm.dropType('payment_submission_status');
};
