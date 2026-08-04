// Shared types for the billing layer. Row shapes mirror the migrations:
//   20260525000004_plans_and_subscriptions.js
//   20260525000005_promocodes.js
// Keep in sync.

export type Tier = "free" | "premium";

export type SubscriptionStatus =
  | "active"
  | "expired"
  | "cancelled"
  | "pending";

// Sources mirror the subscription_source enum. 'manual' = admin-granted,
// 'promocode' = user redeemed a code, 'trial' = automatic onboarding trial,
// PSP names speak for themselves.
export type SubscriptionSource =
  | "manual"
  | "promocode"
  | "trial"
  | "payme"
  | "click"
  | "stripe";

export type SubscriptionEventKind =
  | "granted"
  | "extended"
  | "revoked"
  | "cancelled"
  | "expired"
  | "renewed"
  | "webhook"
  | "note";

// ── Row shapes (from postgres.js - bigint comes back as string) ────────────

export interface PlanRow {
  id: string;            // 'free' | 'premium_monthly' | ...
  name: string;
  tier: Tier;
  period_days: number | null;
  price_minor: number | null;
  currency: string | null;
  is_active: boolean;
  sort_order: number;
  // Receipt line printed on the OFD fiscal check when this plan is bought via
  // Click. Must end with the unit, per the OFD item spec (e.g. "Finshark
  // Premium 30 kun, 1 dona"). NULL blocks fiscalization for the plan rather
  // than falling back to `name` - see click/click-fiscal.service.ts.
  fiscal_item_name: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface SubscriptionRow {
  id: string;            // uuid
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  source: SubscriptionSource;
  source_ref: string | null;
  starts_at: Date;
  ends_at: Date | null;
  cancelled_at: Date | null;
  created_by_user_id: string | null;
  metadata: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
  // Recurring billing. auto_renew defaults FALSE - subscriptions bought before
  // this feature existed were one-off purchases.
  auto_renew: boolean;
  renew_card_token_id: string | null;
  renew_attempts: number;
  renew_last_attempt_at: Date | null;
  renew_last_error: string | null;
}

export interface SubscriptionEventRow {
  id: string;
  subscription_id: string | null;
  user_id: string | null;
  kind: SubscriptionEventKind;
  actor_user_id: string | null;
  reason: string | null;
  metadata: Record<string, unknown>;
  created_at: Date;
}

export interface PromocodeRow {
  id: string;            // uuid
  code: string;          // always lowercased
  grant_plan_id: string;
  grant_days: number | null;
  max_redemptions: number | null;
  redemption_count: number;
  per_user_limit: number;
  valid_from: Date | null;
  valid_until: Date | null;
  is_active: boolean;
  notes: string | null;
  created_by_user_id: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface PromocodeRedemptionRow {
  id: string;
  promocode_id: string;
  user_id: string;
  subscription_id: string | null;
  redeemed_at: Date;
}

// ── Service-level shapes ───────────────────────────────────────────────────

// What every gate / quota check ultimately consumes. Computed by
// EntitlementService and cached per-request.
export interface Entitlement {
  tier: Tier;
  planId: string;               // 'free' if no active subscription
  subscriptionId: string | null; // null when tier='free' (no active sub)
  endsAt: Date | null;          // null = open-ended (lifetime or admin grant)
  source: SubscriptionSource | null;
}

// Promocode redemption result. Returned to the caller so the UI can show
// "You've been upgraded until <date>" or similar.
export interface RedeemResult {
  promocode: PromocodeRow;
  subscription: SubscriptionRow;
  // True if this redemption created a brand-new subscription; false if it
  // extended an existing one (user was already premium).
  isNewSubscription: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────

// Compute period end given a start and a number of days. Returns null when
// `days` is null (open-ended grant - lifetime plan or admin grant w/o expiry).
export function periodEnd(start: Date, days: number | null): Date | null {
  if (days === null) return null;
  const ms = days * 24 * 60 * 60 * 1000;
  return new Date(start.getTime() + ms);
}

// Canonical lowercase + trim for promocodes. The DB has chk_promocodes_code_lowercased
// so this is also what we must store; redeem-path callers should use the same fn.
export function normalisePromocode(raw: string): string {
  return raw.trim().toLowerCase();
}

// ── Public projections (controller responses) ─────────────────────────────
//
// Same pattern as users/user.types.ts toPublicUser - flatten Date columns to
// ISO strings so JSON responses are stable across runtimes / serialisers.
// Promocode `code` is exposed as-is to admins; users only ever see the code
// they typed in the redeem flow, so no separate "user-safe" projection
// (admins can already see the full row).

export interface PublicPlan {
  id: string;
  name: string;
  tier: Tier;
  period_days: number | null;
  price_minor: number | null;
  currency: string | null;
  is_active: boolean;
  sort_order: number;
  fiscal_item_name: string | null;
  created_at: string;
  updated_at: string;
}

export function toPublicPlan(row: PlanRow): PublicPlan {
  return {
    id: row.id,
    name: row.name,
    tier: row.tier,
    period_days: row.period_days,
    price_minor: row.price_minor,
    currency: row.currency,
    is_active: row.is_active,
    sort_order: row.sort_order,
    fiscal_item_name: row.fiscal_item_name,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

export interface PublicSubscription {
  id: string;
  user_id: string;
  plan_id: string;
  status: SubscriptionStatus;
  source: SubscriptionSource;
  source_ref: string | null;
  starts_at: string;
  ends_at: string | null;
  cancelled_at: string | null;
  created_by_user_id: string | null;
  metadata: Record<string, unknown>;
  // Whether this subscription will renew itself. The card behind it is NOT
  // exposed here - the saved-card endpoint owns that.
  auto_renew: boolean;
  created_at: string;
  updated_at: string;
}

export function toPublicSubscription(row: SubscriptionRow): PublicSubscription {
  return {
    id: row.id,
    user_id: row.user_id,
    plan_id: row.plan_id,
    status: row.status,
    source: row.source,
    source_ref: row.source_ref,
    starts_at: row.starts_at.toISOString(),
    ends_at: row.ends_at ? row.ends_at.toISOString() : null,
    cancelled_at: row.cancelled_at ? row.cancelled_at.toISOString() : null,
    created_by_user_id: row.created_by_user_id,
    metadata: row.metadata,
    auto_renew: row.auto_renew,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

export interface PublicSubscriptionEvent {
  id: string;
  subscription_id: string | null;
  user_id: string | null;
  kind: SubscriptionEventKind;
  actor_user_id: string | null;
  reason: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export function toPublicSubscriptionEvent(
  row: SubscriptionEventRow
): PublicSubscriptionEvent {
  return {
    id: row.id,
    subscription_id: row.subscription_id,
    user_id: row.user_id,
    kind: row.kind,
    actor_user_id: row.actor_user_id,
    reason: row.reason,
    metadata: row.metadata,
    created_at: row.created_at.toISOString(),
  };
}

export interface PublicPromocode {
  id: string;
  code: string;
  grant_plan_id: string;
  grant_days: number | null;
  max_redemptions: number | null;
  redemption_count: number;
  per_user_limit: number;
  valid_from: string | null;
  valid_until: string | null;
  is_active: boolean;
  notes: string | null;
  created_by_user_id: string | null;
  created_at: string;
  updated_at: string;
}

export function toPublicPromocode(row: PromocodeRow): PublicPromocode {
  return {
    id: row.id,
    code: row.code,
    grant_plan_id: row.grant_plan_id,
    grant_days: row.grant_days,
    max_redemptions: row.max_redemptions,
    redemption_count: row.redemption_count,
    per_user_limit: row.per_user_limit,
    valid_from: row.valid_from ? row.valid_from.toISOString() : null,
    valid_until: row.valid_until ? row.valid_until.toISOString() : null,
    is_active: row.is_active,
    notes: row.notes,
    created_by_user_id: row.created_by_user_id,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

export interface PublicPromocodeRedemption {
  id: string;
  promocode_id: string;
  user_id: string;
  subscription_id: string | null;
  redeemed_at: string;
  // Enriched fields (set by the admin drill-in endpoint; null on shapes that
  // come from the bare row). The admin UI uses display_name + email so the
  // redemption list isn't a wall of UUIDs.
  user_display_name?: string;
  user_email?: string;
  subscription_plan_id?: string | null;
  subscription_status?: string | null;
  subscription_ends_at?: string | null;
}

export function toPublicPromocodeRedemption(
  row: PromocodeRedemptionRow
): PublicPromocodeRedemption {
  return {
    id: row.id,
    promocode_id: row.promocode_id,
    user_id: row.user_id,
    subscription_id: row.subscription_id,
    redeemed_at: row.redeemed_at.toISOString(),
  };
}
