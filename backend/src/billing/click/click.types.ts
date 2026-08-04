// Types for the Click (click.uz) SHOP API integration. Row shapes mirror the
// migration 20260724000001_click_payments.js - keep in sync.

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

// Click's action codes on the callback endpoints.
export const CLICK_ACTION_PREPARE = 0;
export const CLICK_ACTION_COMPLETE = 1;

// Click's standard response error codes. We return these in the `error` field
// of every callback response; Click branches on them.
//
// Codes are fixed by Click's spec - do not renumber. SUCCESS=0 means "accepted",
// everything negative is a rejection with a defined meaning on their side.
export const ClickError = {
  SUCCESS: 0,
  SIGN_CHECK_FAILED: -1,
  INCORRECT_AMOUNT: -2,
  ACTION_NOT_FOUND: -3,
  ALREADY_PAID: -4,
  USER_NOT_EXIST: -5,
  TRANSACTION_NOT_EXIST: -6,
  FAILED_TO_UPDATE_USER: -7,
  ERROR_IN_REQUEST: -8,
  TRANSACTION_CANCELLED: -9,
} as const;

export type ClickErrorCode = (typeof ClickError)[keyof typeof ClickError];

// Human-readable notes paired with the codes above. Click surfaces these in
// their merchant cabinet and their support team reads them, so they stay in
// English and stay terse.
export const CLICK_ERROR_NOTES: Record<number, string> = {
  [ClickError.SUCCESS]: "Success",
  [ClickError.SIGN_CHECK_FAILED]: "SIGN CHECK FAILED",
  [ClickError.INCORRECT_AMOUNT]: "Incorrect parameter amount",
  [ClickError.ACTION_NOT_FOUND]: "Action not found",
  [ClickError.ALREADY_PAID]: "Already paid",
  [ClickError.USER_NOT_EXIST]: "User does not exist",
  [ClickError.TRANSACTION_NOT_EXIST]: "Transaction does not exist",
  [ClickError.FAILED_TO_UPDATE_USER]: "Failed to update user",
  [ClickError.ERROR_IN_REQUEST]: "Error in request from click",
  [ClickError.TRANSACTION_CANCELLED]: "Transaction cancelled",
};

// ── Row shapes (postgres.js; bigint -> string) ─────────────────────────────

export interface ClickOrderRow {
  id: string; // uuid
  user_id: string;
  plan_id: string;
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
  fiscal_submitted_at: Date | null;
  prepared_at: Date | null;
  paid_at: Date | null;
  cancelled_at: Date | null;
  metadata: Record<string, unknown>;
  created_at: Date;
  updated_at: Date;
}

export interface ClickCallbackLogRow {
  id: string;
  order_id: string | null;
  action: number | null;
  click_trans_id: string | null;
  merchant_trans_id: string | null;
  request_body: Record<string, unknown>;
  request_headers: Record<string, unknown>;
  response_body: Record<string, unknown> | null;
  error_code: number | null;
  verdict: string | null;
  ip: string | null;
  created_at: Date;
}

// ── Callback payloads ──────────────────────────────────────────────────────
//
// Click POSTs application/x-www-form-urlencoded, so EVERY field arrives as a
// string. We keep the raw string form here because the signature is an MD5 over
// the concatenated raw values - reformatting `amount` before hashing (e.g.
// 1000.00 -> 1000) breaks verification. Numeric coercion happens only after the
// signature has been checked.

export interface ClickPrepareRequest {
  click_trans_id: string;
  service_id: string;
  click_paydoc_id: string;
  merchant_trans_id: string;
  amount: string;
  action: string;
  error: string;
  error_note?: string;
  sign_time: string;
  sign_string: string;
}

export interface ClickCompleteRequest extends ClickPrepareRequest {
  merchant_prepare_id: string;
}

export interface ClickPrepareResponse {
  click_trans_id: number;
  merchant_trans_id: string;
  merchant_prepare_id: number;
  error: number;
  error_note: string;
}

export interface ClickCompleteResponse {
  click_trans_id: number;
  merchant_trans_id: string;
  merchant_confirm_id: number | null;
  error: number;
  error_note: string;
}

// Rejection responses can't always fill in the ids (e.g. unparsable body), so
// the error-only shape is what the controller falls back to.
export interface ClickErrorResponse {
  error: number;
  error_note: string;
}

// ── Public (API) shapes ────────────────────────────────────────────────────

// What the frontend needs to open either payment surface. Both the redirect
// button and the checkout.js overlay consume the same fields; the frontend
// decides which one to render.
export interface ClickCheckoutHandle {
  order_id: string;
  merchant_trans_id: string;
  // Amount formatted the way Click wants it in the pay URL / JS call: N.NN
  amount: string;
  amount_minor: number;
  currency: string;
  plan_id: string;
  // Click-issued ids, sourced from backend env so the frontend has no
  // Click-specific build config of its own.
  merchant_id: string;
  service_id: string;
  // Fully-qualified my.click.uz URL for the redirect button, return_url baked in.
  pay_url: string;
  // URL of Click's checkout.js, loaded on demand by the card-payment button.
  checkout_js_url: string;
}

// Order status as polled by the return page. Deliberately narrow - no Click
// internals, no merchant ids, nothing an end user shouldn't see.
//
// fiscal_qr_url is the ONE fiscal field that crosses this line, and it does so
// on purpose: under PKM No. 943 the fiscal receipt belongs to the CUSTOMER, not
// to us. Withholding it would mean filing a receipt in someone's name and never
// showing it to them. Everything else about fiscalization (status, attempt
// count, OFD error text) stays admin-only - those describe OUR filing pipeline,
// not the customer's document.
export interface PublicClickOrder {
  id: string;
  plan_id: string;
  amount_minor: number;
  currency: string;
  status: ClickOrderStatus;
  error_note: string | null;
  subscription_id: string | null;
  // The window this payment bought, filled in once the order is paid and its
  // subscription is known. Because grants are CHAINED (a renewal starts when the
  // current period ends, not today), these are the actual covered dates, which
  // can begin in the future - the success screen shows them so a renewal buyer
  // understands why their new period doesn't start immediately.
  coverage_starts_at: string | null;
  coverage_ends_at: string | null;
  created_at: string;
  paid_at: string | null;
  // Link to the customer's fiscal receipt. NULL is the normal state for a
  // freshly paid order - the OFD lags behind submission, so the return page
  // must treat "no link yet" as pending rather than as an error, and the
  // hourly backfill sweep fills it in shortly after.
  fiscal_qr_url: string | null;
}

export function toPublicClickOrder(row: ClickOrderRow): PublicClickOrder {
  return {
    id: row.id,
    plan_id: row.plan_id,
    amount_minor: row.amount_minor,
    currency: row.currency,
    status: row.status,
    // Click's raw error_note is written for their support team, not for
    // students. The frontend maps status -> localized copy; we pass the note
    // through only so a stuck payment has something concrete in support chats.
    error_note: row.error_note,
    subscription_id: row.subscription_id,
    // Populated by ClickService once the subscription row is loaded - this pure
    // mapper has no DB access, so it can't resolve the dates itself.
    coverage_starts_at: null,
    coverage_ends_at: null,
    created_at: row.created_at.toISOString(),
    paid_at: row.paid_at ? row.paid_at.toISOString() : null,
    fiscal_qr_url: row.fiscal_qr_url,
  };
}

// Admin view: everything, including Click ids and fiscal state.
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

export function toAdminClickCallbackLog(
  row: ClickCallbackLogRow
): AdminClickCallbackLog {
  return {
    id: row.id,
    order_id: row.order_id,
    action: row.action,
    click_trans_id: row.click_trans_id,
    merchant_trans_id: row.merchant_trans_id,
    request_body: row.request_body,
    response_body: row.response_body,
    error_code: row.error_code,
    verdict: row.verdict,
    ip: row.ip,
    created_at: row.created_at.toISOString(),
  };
}

// ── Amount helpers ─────────────────────────────────────────────────────────

// plans.price_minor is in tiyin (1 soum = 100 tiyin). Click's `amount` is in
// SOUMS, formatted N.NN. These two conversions are the only place that
// distinction is handled - everything else stays in minor units.
export function minorToClickAmount(minor: number): string {
  return (minor / 100).toFixed(2);
}

// Parse Click's `amount` back to minor units for comparison against the order.
// Returns null when the string isn't a finite number, so the caller can reject
// with INCORRECT_AMOUNT rather than comparing against NaN.
export function clickAmountToMinor(raw: string): number | null {
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  // Round rather than truncate: Click sends floats, and 49000.00 can arrive as
  // 48999.999999 through a float round-trip.
  return Math.round(n * 100);
}

// ── Stored card tokens (recurring) ──────────────────────────────────────────

export type ClickCardTokenStatus = "pending_sms" | "active" | "removed";

// A binding between a user and a card held at Click.
//
// There is no card_number field and there must never be one. `card_masked` is
// the display string Click returns from verify ("8600 55** **** 3244"); the
// real PAN never reaches our servers except, in the CORS-fallback path, as a
// request-scoped variable that is never written anywhere.
export interface ClickCardTokenRow {
  id: string;
  user_id: string;
  card_token: string;
  card_masked: string | null;
  phone_masked: string | null;
  status: ClickCardTokenStatus;
  verified_at: Date | null;
  removed_at: Date | null;
  last_error: string | null;
  created_at: Date;
  updated_at: Date;
}

// What the client is allowed to see about a saved card. Deliberately excludes
// card_token itself - it is a payment credential, and nothing in the UI needs
// it.
export interface PublicCardToken {
  id: string;
  card_masked: string | null;
  phone_masked: string | null;
  status: ClickCardTokenStatus;
  last_error: string | null;
  created_at: string;
}

export function toPublicCardToken(row: ClickCardTokenRow): PublicCardToken {
  return {
    id: row.id,
    card_masked: row.card_masked,
    phone_masked: row.phone_masked,
    status: row.status,
    last_error: row.last_error,
    created_at: row.created_at.toISOString(),
  };
}
