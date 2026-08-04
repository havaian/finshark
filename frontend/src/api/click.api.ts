import { api } from "./client";
import type { Plan } from "../types/billing";
import type {
  AdminClickCallbackLog,
  AdminClickOrder,
  ClickCheckoutHandle,
  ClickConfigResponse,
  ClickFiscalRetryResult,
  ClickHealth,
  ClickOrder,
  ClickOrderStatus,
  ClickRemoteStatus,
  CardBindingStarted,
  SavedCard,
} from "../types/click";

// User-facing Click endpoints. All require auth (enforced server-side).
export const clickApi = {
  // Whether to render the payment UI at all, plus the checkout.js URL.
  config: async (): Promise<ClickConfigResponse> =>
    (await api.get<ClickConfigResponse>("/billing/click/config")).data,

  // Purchasable plans (active premium plans with a price).
  listPlans: async (): Promise<Plan[]> =>
    (await api.get<Plan[]>("/billing/click/plans")).data,

  // Create an order. Returns everything both payment buttons need. Grants
  // nothing - premium appears only after Click confirms the payment.
  createOrder: async (planId: string): Promise<ClickCheckoutHandle> =>
    (
      await api.post<ClickCheckoutHandle>("/billing/click/orders", {
        plan_id: planId,
      })
    ).data,

  // Poll one order. Scoped to the caller server-side.
  getOrder: async (orderId: string): Promise<ClickOrder> =>
    (await api.get<ClickOrder>(`/billing/click/orders/${orderId}`)).data,

  listMyOrders: async (): Promise<ClickOrder[]> =>
    (await api.get<ClickOrder[]>("/billing/click/orders")).data,
  // ── Saved cards ───────────────────────────────────────────────────────────
  //
  // BINDING IS TWO STEPS and the card number is deliberately not one of them
  // on this side: the browser posts the PAN straight to Click, whose
  // card_token/request needs no Auth header precisely so merchants never
  // handle it. We then adopt the returned token and confirm it by SMS.

  getSavedCard: async (): Promise<SavedCard | null> =>
    (await api.get<SavedCard | null>("/billing/click/cards")).data,

  // Step 1, preferred: browser already holds a token from Click.
  adoptCard: async (input: {
    card_token: string;
    phone_masked?: string | null;
  }): Promise<CardBindingStarted> =>
    (await api.post<CardBindingStarted>("/billing/click/cards/adopt", input)).data,

  // Step 1, fallback for when the browser cannot reach Click directly. The
  // card number transits our backend in memory and is never stored.
  requestCard: async (input: {
    card_number: string;
    expire_date: string;
  }): Promise<CardBindingStarted> =>
    (await api.post<CardBindingStarted>("/billing/click/cards/request", input)).data,

  // Step 2: confirm with the SMS code Click sent to the cardholder.
  verifyCard: async (input: {
    token_id: string;
    sms_code: string;
  }): Promise<SavedCard> =>
    (await api.post<SavedCard>("/billing/click/cards/verify", input)).data,

  removeCard: async (): Promise<void> => {
    await api.delete("/billing/click/cards");
  },

  setAutoRenew: async (enabled: boolean): Promise<void> => {
    await api.post("/billing/click/cards/auto-renew", { enabled });
  },
};
// Admin Click endpoints. Require admin + an elevated 2FA session.
export const adminClickApi = {
  health: async (): Promise<ClickHealth> =>
    (await api.get<ClickHealth>("/admin/click/health")).data,

  listOrders: async (status?: ClickOrderStatus): Promise<AdminClickOrder[]> => {
    const qs = status ? `?status=${status}` : "";
    return (await api.get<AdminClickOrder[]>(`/admin/click/orders${qs}`)).data;
  },

  // The full callback trail for one order - what goes into a Click support
  // ticket when a payment misbehaves.
  orderCallbacks: async (orderId: string): Promise<AdminClickCallbackLog[]> =>
    (
      await api.get<AdminClickCallbackLog[]>(
        `/admin/click/orders/${orderId}/callbacks`
      )
    ).data,

  // Recent callbacks across all orders, including ones that never matched an
  // order (bad signature, unknown reference) and so are invisible per-order.
  recentCallbacks: async (limit = 100): Promise<AdminClickCallbackLog[]> =>
    (
      await api.get<AdminClickCallbackLog[]>(
        `/admin/click/callbacks?limit=${limit}`
      )
    ).data,

  retryFiscal: async (orderId: string): Promise<ClickFiscalRetryResult> =>
    (
      await api.post<ClickFiscalRetryResult>(
        `/admin/click/orders/${orderId}/fiscal-retry`,
        {}
      )
    ).data,

  // Read-only: asks Click what it thinks happened. Does not change our state.
  remoteStatus: async (orderId: string): Promise<ClickRemoteStatus> =>
    (
      await api.get<ClickRemoteStatus>(
        `/admin/click/orders/${orderId}/remote-status`
      )
    ).data,
};

// ── Order polling ──────────────────────────────────────────────────────────

// Both payment surfaces need the same thing after the user finishes paying:
// wait for Click's Complete callback to land on our server, then react.
//
// Polling rather than anything push-based because the two events are genuinely
// unordered. The browser returns (redirect) or the overlay closes at whatever
// moment Click decides, and the server-to-server Complete callback arrives on
// its own schedule - sometimes before the user is back, sometimes after. A
// poll handles both without caring which won.
//
// Resolves with the last order state seen: 'paid' on success, 'cancelled' or
// 'failed' on a definitive end, or whatever it was still sitting at when the
// attempts ran out (the caller then shows "still processing" rather than
// claiming failure, because a slow callback is not a failed payment).
export async function pollClickOrder(
  orderId: string,
  opts: {
    intervalMs?: number;
    maxAttempts?: number;
    onTick?: (order: ClickOrder) => void;
    signal?: { cancelled: boolean };
  } = {}
): Promise<ClickOrder | null> {
  const interval = opts.intervalMs ?? 2000;
  const maxAttempts = opts.maxAttempts ?? 30;

  let last: ClickOrder | null = null;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    if (opts.signal?.cancelled) return last;
    try {
      const order = await clickApi.getOrder(orderId);
      last = order;
      opts.onTick?.(order);
      if (
        order.status === "paid" ||
        order.status === "cancelled" ||
        order.status === "failed"
      ) {
        return order;
      }
    } catch {
      // Transient network blip or a 401 mid-refresh. Keep polling; the
      // attempt cap bounds it.
    }
    if (opts.signal?.cancelled) return last;
    await new Promise((r) => setTimeout(r, interval));
  }
  return last;
}

// ── checkout.js loader ─────────────────────────────────────────────────────

// Click's overlay script is loaded on demand rather than from index.html.
// Reasons: it is a third-party script from my.click.uz, and pulling it into
// every page load would add a request and an external dependency to routes that
// never take a payment. Loading it when the payment panel mounts means a
// failure degrades only the card button.
//
// The promise is cached so repeated mounts reuse one <script> tag.
let checkoutJsPromise: Promise<void> | null = null;

export function loadClickCheckoutJs(url: string): Promise<void> {
  if (checkoutJsPromise) return checkoutJsPromise;

  checkoutJsPromise = new Promise<void>((resolve, reject) => {
    // Already present (e.g. a previous SPA route mounted the panel and the
    // module-level cache was reset by HMR).
    const existing = document.querySelector<HTMLScriptElement>(
      `script[data-click-checkout="true"]`
    );
    if (existing) {
      if (window.createPaymentRequest) {
        resolve();
        return;
      }
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () =>
        reject(new Error("failed to load Click checkout.js"))
      );
      return;
    }

    const script = document.createElement("script");
    script.src = url;
    script.async = true;
    script.dataset.clickCheckout = "true";
    script.addEventListener("load", () => resolve());
    script.addEventListener("error", () => {
      // Clear the cache so a later attempt can retry rather than replaying a
      // rejected promise forever.
      checkoutJsPromise = null;
      script.remove();
      reject(new Error("failed to load Click checkout.js"));
    });
    document.head.appendChild(script);
  });

  return checkoutJsPromise;
}
