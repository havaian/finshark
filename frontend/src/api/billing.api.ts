import { api } from "./client";
import type {
  MyEntitlement,
  Plan,
  Promocode,
  PromocodeRedemption,
  RedeemResult,
  Subscription,
  SubscriptionEvent,
} from "../types/billing";

// User-facing endpoints. The redeem endpoint maps server-side errors to
// regular axios rejections - the caller is responsible for surfacing them
// (the redeem widget translates the error message via i18n keys keyed on the
// HTTP status, falling back to the backend message string).
export const billingApi = {
  getMyEntitlement: async (): Promise<MyEntitlement> =>
    (await api.get<MyEntitlement>("/me/entitlement")).data,

  redeemPromocode: async (code: string): Promise<RedeemResult> =>
    (await api.post<RedeemResult>("/me/promocodes/redeem", { code })).data,

  // History of the current user's own subscriptions - admin grants, promocode
  // redemptions, future PSP payments. Same shape as the admin per-user
  // endpoint, but limited to the caller's own user_id by the backend.
  getMySubscriptions: async (): Promise<Subscription[]> =>
    (await api.get<Subscription[]>("/me/subscriptions")).data,
};

// Admin endpoints. All require admin auth (server enforces); the frontend
// only renders the admin nav for users where auth.user.is_admin is true.
export const adminBillingApi = {
  // ---- Plans ----
  listPlans: async (): Promise<Plan[]> =>
    (await api.get<Plan[]>("/admin/plans")).data,

  // ---- Promocodes ----
  listPromocodes: async (): Promise<Promocode[]> =>
    (await api.get<Promocode[]>("/admin/promocodes")).data,

  createPromocode: async (input: {
    code: string;
    grant_plan_id: string;
    grant_days?: number | null;
    max_redemptions?: number | null;
    per_user_limit?: number;
    valid_from?: string | null;
    valid_until?: string | null;
    is_active?: boolean;
    notes?: string | null;
  }): Promise<Promocode> =>
    (await api.post<Promocode>("/admin/promocodes", input)).data,

  setPromocodeActive: async (
    id: string,
    is_active: boolean
  ): Promise<Promocode> =>
    (
      await api.patch<Promocode>(`/admin/promocodes/${id}/active`, {
        is_active,
      })
    ).data,

  // Drill-in: who used this code, when, and which sub it created/extended.
  listRedemptions: async (
    id: string
  ): Promise<{ promocode: Promocode; redemptions: PromocodeRedemption[] }> =>
    (
      await api.get<{
        promocode: Promocode;
        redemptions: PromocodeRedemption[];
      }>(`/admin/promocodes/${id}/redemptions`)
    ).data,

  // ---- Subscriptions ----
  listSubscriptionsForUser: async (userId: string): Promise<Subscription[]> =>
    (await api.get<Subscription[]>(`/admin/users/${userId}/subscriptions`))
      .data,

  // Per-user audit log. Includes events for subscriptions that have since
  // been cancelled or expired - backend keeps them keyed on user_id too.
  listSubscriptionEventsForUser: async (
    userId: string
  ): Promise<SubscriptionEvent[]> =>
    (
      await api.get<SubscriptionEvent[]>(
        `/admin/users/${userId}/subscription-events`
      )
    ).data,

  getSubscription: async (id: string): Promise<Subscription> =>
    (await api.get<Subscription>(`/admin/subscriptions/${id}`)).data,

  listSubscriptionEvents: async (
    id: string
  ): Promise<SubscriptionEvent[]> =>
    (
      await api.get<SubscriptionEvent[]>(`/admin/subscriptions/${id}/events`)
    ).data,

  // `days` semantics (mirrored from the backend DTO):
  //   omitted → use plan's period_days
  //   null    → open-ended (no expiry)
  //   N > 0   → exactly N days
  // The frontend grant form expresses these three states explicitly so the
  // wire payload distinguishes "use plan default" from "no expiry".
  grant: async (
    userId: string,
    input: { plan_id: string; days?: number | null; reason?: string }
  ): Promise<Subscription> =>
    (
      await api.post<Subscription>(
        `/admin/users/${userId}/subscriptions`,
        input
      )
    ).data,

  extend: async (
    id: string,
    input: { days: number; reason?: string }
  ): Promise<Subscription> =>
    (await api.post<Subscription>(`/admin/subscriptions/${id}/extend`, input))
      .data,

  // Absolute replacement for ends_at, as opposed to extend()'s relative days.
  setEndDate: async (
    id: string,
    input: { ends_at: string; reason?: string }
  ): Promise<Subscription> =>
    (await api.post<Subscription>(`/admin/subscriptions/${id}/end-date`, input))
      .data,

  cancel: async (
    id: string,
    input: { reason?: string }
  ): Promise<Subscription> =>
    (await api.post<Subscription>(`/admin/subscriptions/${id}/cancel`, input))
      .data,

  revoke: async (
    id: string,
    input: { reason?: string }
  ): Promise<Subscription> =>
    (await api.post<Subscription>(`/admin/subscriptions/${id}/revoke`, input))
      .data,

  // Removes ALL of a user's access at once. Purchases chain into separate
  // subscription rows, so revoking them one by one is both tedious and unsafe -
  // missing one leaves the user fully entitled.
  revokeAllForUser: async (
    userId: string,
    input: { reason?: string }
  ): Promise<{ revoked: number }> =>
    (
      await api.post<{ revoked: number }>(
        `/admin/users/${userId}/subscriptions/revoke-all`,
        input
      )
    ).data,
};
