// Billing core: plans catalog + subscriptions (history-preserving) +
// subscription_events (append-only audit log).
//
// Design notes:
//   - plans.id is text, not bigserial. The id IS the stable identifier used
//     by code paths (entitlement gates, PSP webhooks, promocode grants), so a
//     human-readable slug avoids the indirection. Seeded rows below.
//   - subscriptions.id is uuid so PSP callbacks can round-trip safely without
//     leaking sequential ids.
//   - subscriptions is history-preserving: one row per granted period. The
//     "is this user currently premium" lookup is a single indexed query that
//     finds the active row whose [starts_at, ends_at) covers NOW(). Multiple
//     active rows are allowed (e.g. an admin grant overlapping a paid one);
//     the entitlement service picks the most generous tier.
//   - ends_at NULL = open-ended (lifetime plan or admin grant w/o expiry).
//   - source records *how* the subscription came into existence so the audit
//     log + admin UI can explain it later. source_ref holds the PSP txn id,
//     promocode redemption id, or admin user id depending on source.
//   - subscription_events is the append-only audit log. Every grant / revoke /
//     extend / webhook event writes here so the admin panel can show "why is
//     this user premium" with full context.

exports.shorthands = undefined;

exports.up = (pgm) => {
  // pgcrypto for gen_random_uuid(). Idempotent - safe if already enabled.
  pgm.sql('CREATE EXTENSION IF NOT EXISTS pgcrypto');

  // ── ENUMs ─────────────────────────────────────────────────────────
  pgm.createType('subscription_status', ['active', 'expired', 'cancelled', 'pending']);
  // Sources of a subscription. Extend by adding values when new PSPs land.
  pgm.createType('subscription_source', ['manual', 'promocode', 'trial', 'payme', 'click', 'stripe']);
  // Event kinds for the audit log. 'webhook' covers raw PSP callbacks before
  // we know if they resulted in a grant/extend; the metadata jsonb holds the
  // raw payload for forensic use.
  pgm.createType('subscription_event_kind', [
    'granted',
    'extended',
    'revoked',
    'cancelled',
    'expired',
    'renewed',
    'webhook',
    'note',
  ]);

  // ── plans ─────────────────────────────────────────────────────────
  pgm.createTable('plans', {
    id: { type: 'text', primaryKey: true },         // 'free' | 'premium_monthly' | etc.
    name: { type: 'text', notNull: true },          // display name
    tier: { type: 'text', notNull: true },          // 'free' | 'premium' - what gates check
    period_days: { type: 'integer' },               // null = open-ended (lifetime, free)
    price_minor: { type: 'integer' },               // price in minor units; null for non-purchasable
    currency: { type: 'text' },                     // ISO 4217, e.g. 'UZS'
    is_active: { type: 'boolean', notNull: true, default: true },
    sort_order: { type: 'integer', notNull: true, default: 0 },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.addConstraint('plans', 'chk_plans_tier', {
    check: `tier IN ('free', 'premium')`,
  });
  pgm.addConstraint('plans', 'chk_plans_period_days_positive', {
    check: 'period_days IS NULL OR period_days > 0',
  });
  pgm.addConstraint('plans', 'chk_plans_price_consistent', {
    // Either both price_minor and currency are set, or neither (free plan).
    check: '(price_minor IS NULL AND currency IS NULL) OR (price_minor IS NOT NULL AND currency IS NOT NULL)',
  });

  // ── subscriptions ─────────────────────────────────────────────────
  pgm.createTable('subscriptions', {
    id: { type: 'uuid', primaryKey: true, default: pgm.func('gen_random_uuid()') },
    user_id: { type: 'bigint', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    plan_id: { type: 'text', notNull: true, references: 'plans(id)', onDelete: 'RESTRICT' },
    status: { type: 'subscription_status', notNull: true, default: 'active' },
    source: { type: 'subscription_source', notNull: true },
    source_ref: { type: 'text' },                                // PSP txn id, promocode redemption id, admin user id
    starts_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    ends_at: { type: 'timestamptz' },                            // null = open-ended
    cancelled_at: { type: 'timestamptz' },
    created_by_user_id: {                                        // admin who issued a manual grant, if any
      type: 'bigint',
      references: 'users(id)',
      onDelete: 'SET NULL',
    },
    metadata: { type: 'jsonb', notNull: true, default: pgm.func(`'{}'::jsonb`) },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
  // Entitlement query: WHERE user_id = ? AND status = 'active' AND (ends_at IS NULL OR ends_at > NOW())
  pgm.createIndex('subscriptions', ['user_id', 'status', 'ends_at'], {
    name: 'idx_subs_user_status_ends',
  });
  pgm.createIndex('subscriptions', ['user_id', { name: 'created_at', sort: 'DESC' }], {
    name: 'idx_subs_user_created',
  });
  pgm.addConstraint('subscriptions', 'chk_subs_ends_after_starts', {
    check: 'ends_at IS NULL OR ends_at > starts_at',
  });

  // ── subscription_events ───────────────────────────────────────────
  pgm.createTable('subscription_events', {
    id: { type: 'bigserial', primaryKey: true },
    subscription_id: {
      type: 'uuid',
      references: 'subscriptions(id)',
      onDelete: 'CASCADE',
      // nullable: raw webhook payloads from PSPs may arrive before we've
      // matched them to a subscription. We log them with subscription_id=NULL
      // and a user_id (if recoverable from the payload) for later triage.
    },
    user_id: { type: 'bigint', references: 'users(id)', onDelete: 'CASCADE' },
    kind: { type: 'subscription_event_kind', notNull: true },
    actor_user_id: {                                            // admin who took the action, or NULL for system / PSP
      type: 'bigint',
      references: 'users(id)',
      onDelete: 'SET NULL',
    },
    reason: { type: 'text' },                                   // optional human-readable note
    metadata: { type: 'jsonb', notNull: true, default: pgm.func(`'{}'::jsonb`) },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.createIndex('subscription_events', ['subscription_id', { name: 'created_at', sort: 'DESC' }], {
    name: 'idx_sub_events_sub_created',
  });
  pgm.createIndex('subscription_events', ['user_id', { name: 'created_at', sort: 'DESC' }], {
    name: 'idx_sub_events_user_created',
  });

  // updated_at triggers (set_updated_at() lives in 20260511000003_content_and_srs.js)
  pgm.sql(`
    CREATE TRIGGER trg_plans_updated_at
      BEFORE UPDATE ON plans
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `);
  pgm.sql(`
    CREATE TRIGGER trg_subs_updated_at
      BEFORE UPDATE ON subscriptions
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `);

  // ── seed plans ────────────────────────────────────────────────────
  // Prices are placeholders - the real PSP integration will set actual values.
  // The 'free' plan exists so subscription rows can reference it explicitly
  // (e.g. a "downgraded to free" event), and so the admin UI can list it.
  pgm.sql(`
    INSERT INTO plans (id, name, tier, period_days, price_minor, currency, sort_order)
    VALUES
      ('free',              'Free',              'free',    NULL, NULL,    NULL,  0),
      ('premium_monthly',   'Premium (monthly)', 'premium', 30,   4900000, 'UZS', 10),
      ('premium_yearly',    'Premium (yearly)',  'premium', 365,  49000000,'UZS', 20),
      ('premium_lifetime',  'Premium (lifetime)','premium', NULL, 199000000,'UZS', 30)
    ON CONFLICT (id) DO NOTHING
  `);
};

exports.down = (pgm) => {
  pgm.sql('DROP TRIGGER IF EXISTS trg_subs_updated_at  ON subscriptions');
  pgm.sql('DROP TRIGGER IF EXISTS trg_plans_updated_at ON plans');
  pgm.dropTable('subscription_events');
  pgm.dropTable('subscriptions');
  pgm.dropTable('plans');
  pgm.dropType('subscription_event_kind');
  pgm.dropType('subscription_source');
  pgm.dropType('subscription_status');
  // pgcrypto is left in place - other features may depend on it.
};
