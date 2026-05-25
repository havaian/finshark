// Promocodes — redeemable codes that grant a subscription (typically premium
// for N days). Designed to be admin-issued for launch, influencer, and support
// scenarios. PSP-driven discount coupons (e.g. Stripe Coupons / Payme promos)
// are NOT modelled here — those live with the PSP and are referenced via
// subscriptions.metadata when relevant.
//
// Schema notes:
//   - code is stored lowercased + uniquely indexed; the redeem path lowers
//     user input before lookup. citext would also work but text + LOWER() keeps
//     this consistent with the email_whitelist migration's pattern.
//   - grant_plan_id is what the user becomes on redemption. grant_days extends
//     the existing subscription if the user is already premium; if they're
//     free, a new subscription is created.
//   - max_redemptions NULL = unlimited (e.g. a public launch code).
//   - per_user_limit = how many times a single user can redeem the same code.
//     Defaults to 1; promocode_redemptions has a unique (promocode_id, user_id)
//     index that enforces per_user_limit=1 — higher limits are enforced in the
//     app layer with row counting (rare case; not worth bending the unique).
//   - valid_from / valid_until bound when redemption is allowed; both NULL
//     means "always valid while is_active = true".
//   - redemption_count is denormalised so the admin UI can show "37 / 100 used"
//     without aggregating promocode_redemptions on every load. Maintained by
//     the service inside the same tx as the redemption insert.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('promocodes', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    code: { type: 'text', notNull: true, unique: true },
    grant_plan_id: { type: 'text', notNull: true, references: 'plans(id)', onDelete: 'RESTRICT' },
    grant_days: { type: 'integer' },                  // null = use plan.period_days (e.g. lifetime)
    max_redemptions: { type: 'integer' },             // null = unlimited
    redemption_count: { type: 'integer', notNull: true, default: 0 },
    per_user_limit: { type: 'integer', notNull: true, default: 1 },
    valid_from: { type: 'timestamptz' },
    valid_until: { type: 'timestamptz' },
    is_active: { type: 'boolean', notNull: true, default: true },
    notes: { type: 'text' },                          // admin-facing only
    created_by_user_id: {
      type: 'bigint',
      references: 'users(id)',
      onDelete: 'SET NULL',
    },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.addConstraint('promocodes', 'chk_promocodes_code_lowercased', {
    check: 'code = LOWER(code)',
  });
  pgm.addConstraint('promocodes', 'chk_promocodes_code_nonempty', {
    check: 'LENGTH(code) BETWEEN 3 AND 64',
  });
  pgm.addConstraint('promocodes', 'chk_promocodes_grant_days_positive', {
    check: 'grant_days IS NULL OR grant_days > 0',
  });
  pgm.addConstraint('promocodes', 'chk_promocodes_max_redemptions_positive', {
    check: 'max_redemptions IS NULL OR max_redemptions > 0',
  });
  pgm.addConstraint('promocodes', 'chk_promocodes_per_user_limit_positive', {
    check: 'per_user_limit > 0',
  });
  pgm.addConstraint('promocodes', 'chk_promocodes_validity_window', {
    check: 'valid_from IS NULL OR valid_until IS NULL OR valid_from < valid_until',
  });
  pgm.addConstraint('promocodes', 'chk_promocodes_redemption_count_bounded', {
    check: 'redemption_count >= 0 AND (max_redemptions IS NULL OR redemption_count <= max_redemptions)',
  });

  pgm.createTable('promocode_redemptions', {
    id: { type: 'bigserial', primaryKey: true },
    promocode_id: { type: 'uuid', notNull: true, references: 'promocodes(id)', onDelete: 'CASCADE' },
    user_id: { type: 'bigint', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    subscription_id: { type: 'uuid', references: 'subscriptions(id)', onDelete: 'SET NULL' },
    redeemed_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.addConstraint('promocode_redemptions', 'uq_redemptions_code_user', {
    unique: ['promocode_id', 'user_id'],
  });
  pgm.createIndex('promocode_redemptions', ['user_id', { name: 'redeemed_at', sort: 'DESC' }], {
    name: 'idx_redemptions_user_redeemed',
  });

  pgm.sql(`
    CREATE TRIGGER trg_promocodes_updated_at
      BEFORE UPDATE ON promocodes
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `);
};

exports.down = (pgm) => {
  pgm.sql('DROP TRIGGER IF EXISTS trg_promocodes_updated_at ON promocodes');
  pgm.dropTable('promocode_redemptions');
  pgm.dropTable('promocodes');
};
