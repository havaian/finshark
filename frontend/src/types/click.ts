// Frontend types for the Click payment flow. Mirror the backend DTOs in
// backend/src/billing/click/click.types.ts - keep in sync.

export type ClickOrderStatus =
  | "created"
  | "prepared"
  | "paid"
  | "cancelled"
  | "failed";

export type ClickFiscalStatus =
  | "not_required"
  | "pending"
  | "submitted"
  | "failed";

// Whether the payment UI should render, plus the checkout.js URL. Sourced from
// the API rather than a VITE_ build var so there is one source of truth for
// Click configuration and no Click ids baked into the bundle.
export interface ClickConfigResponse {
  enabled: boolean;
  checkout_js_url: string;
}

// Everything both payment buttons need, returned when an order is created.
// The redirect button uses pay_url; the card overlay uses merchant_id /
// service_id / merchant_trans_id / amount. Same order behind both.
export interface ClickCheckoutHandle {
  order_id: string;
  merchant_trans_id: string;
  // Already formatted N.NN the way Click expects it.
  amount: string;
  amount_minor: number;
  currency: string;
  plan_id: string;
  merchant_id: string;
  service_id: string;
  pay_url: string;
  checkout_js_url: string;
}

// Order state as polled by the return page.
export interface ClickOrder {
  id: string;
  plan_id: string;
  amount_minor: number;
  currency: string;
  status: ClickOrderStatus;
  error_note: string | null;
  subscription_id: string | null;
  created_at: string;
  paid_at: string | null;
}

// Admin view of an order: Click's ids and the fiscal receipt state.
export interface AdminClickOrder {
  id: string;
  user_id: string;
  user_email: string | null;
  user_name: string | null;
  plan_id: string;
  plan_name: string | null;
  merchant_trans_id: string;
  amount_minor: number;
  currency: string;
  status: ClickOrderStatus;
  click_trans_id: string | null;
  click_paydoc_id: string | null;
  merchant_prepare_id: string | null;
  merchant_confirm_id: string | null;
  error_code: number | null;
  error_note: string | null;
  subscription_id: string | null;
  fiscal_status: ClickFiscalStatus;
  fiscal_attempts: number;
  fiscal_last_error: string | null;
  fiscal_qr_url: string | null;
  fiscal_submitted_at: string | null;
  prepared_at: string | null;
  paid_at: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

// One logged callback: what Click sent us and what we answered.
export interface AdminClickCallbackLog {
  id: string;
  order_id: string | null;
  action: number | null;
  click_trans_id: string | null;
  merchant_trans_id: string | null;
  request_body: Record<string, unknown>;
  response_body: Record<string, unknown> | null;
  error_code: number | null;
  verdict: string | null;
  ip: string | null;
  created_at: string;
}

// Config health for the admin panel. Never carries the secret key.
export interface ClickHealth {
  payments_enabled: boolean;
  payments_problem: string | null;
  fiscal_enabled: boolean;
  fiscal_problem: string | null;
}

export interface ClickFiscalRetryResult {
  ok: boolean;
  fiscal_status: ClickFiscalStatus;
  fiscal_last_error: string | null;
  fiscal_qr_url: string | null;
}

// Read-only probe against Click's own records. Shape of `data` is whatever
// Click returns, so it stays unknown rather than being modelled.
export interface ClickRemoteStatus {
  ok: boolean;
  http_status: number;
  error_code: number | null;
  error_note: string | null;
  data: unknown;
}

// ── checkout.js ────────────────────────────────────────────────────────────

// Payload for Click's createPaymentRequest, per their pay-by-card docs.
export interface ClickPaymentRequestParams {
  service_id: number;
  merchant_id: number;
  amount: number;
  transaction_param: string;
  merchant_user_id?: string;
  card_type?: "uzcard" | "humo";
}

// Status codes the overlay reports back on close:
//   < 0 error, 0 created, 1 processing, 2 successfully paid
export interface ClickPaymentRequestResult {
  status: number;
}

// checkout.js attaches createPaymentRequest to window. Declared here so the
// overlay call site is typed rather than reaching through `any`.
declare global {
  interface Window {
    createPaymentRequest?: (
      params: ClickPaymentRequestParams,
      callback: (data: ClickPaymentRequestResult) => void
    ) => void;
  }
}
