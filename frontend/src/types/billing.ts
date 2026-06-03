// Mirrors backend/src/billing/billing.types.ts public projections (the
// `toPublicXxx` helpers). All Date fields are ISO strings here since they
// arrived over JSON.

export type Tier = "free" | "premium";

export type SubscriptionStatus =
  | "active"
  | "expired"
  | "cancelled"
  | "pending";

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

export interface Plan {
  id: string;
  name: string;
  tier: Tier;
  period_days: number | null;
  price_minor: number | null;
  currency: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
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
  created_at: string;
  updated_at: string;
}

export interface SubscriptionEvent {
  id: string;
  subscription_id: string | null;
  user_id: string | null;
  kind: SubscriptionEventKind;
  actor_user_id: string | null;
  reason: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface Promocode {
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

export interface PromocodeRedemption {
  id: string;
  promocode_id: string;
  user_id: string;
  subscription_id: string | null;
  redeemed_at: string;
  // Enriched by the admin drill-in endpoint (GET /admin/promocodes/:id/
  // redemptions). Absent on shapes returned by other paths. The fields let
  // the UI render a name + email + plan label instead of raw UUIDs.
  user_display_name?: string;
  user_email?: string;
  subscription_plan_id?: string | null;
  subscription_status?: string | null;
  subscription_ends_at?: string | null;
}

// Shape returned by GET /api/me/entitlement. Premium users get `limit: null`
// on each quota; the UI hides quota chips when limit is null. For premium the
// `hearts.pool` is also null (per-session model - no daily pool to display).
export interface MyEntitlement {
  tier: Tier;
  plan_id: string;
  subscription_id: string | null;
  ends_at: string | null;
  source: SubscriptionSource | null;
  lessons: { used: number; limit: number | null };
  mocks: { used: number; limit: number | null };
  hearts: { pool: number | null; max: number | null };
}

// Result of POST /api/me/promocodes/redeem. is_new_subscription is true when
// a brand-new sub was created vs an extend on an existing premium row - the
// UI uses this to pick between "welcome" vs "extended" toasts.
export interface RedeemResult {
  is_new_subscription: boolean;
  promocode: Promocode;
  subscription: Subscription;
}
