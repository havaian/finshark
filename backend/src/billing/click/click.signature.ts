import { createHash, timingSafeEqual } from "node:crypto";

// Signature helpers for Click.
//
// Two unrelated schemes live here because both are Click's and both key off the
// same SECRET_KEY:
//
//   1. SHOP API callbacks (Prepare / Complete) - an MD5 over concatenated
//      request fields. This is what proves an incoming callback really came
//      from Click.
//   2. Merchant API requests (fiscalization) - a SHA-1 based `Auth` header on
//      OUTBOUND calls. This is what proves to Click that we are us.
//
// MD5 is Click's choice, not ours. It is fixed by their spec and cannot be
// changed unilaterally. It is used purely as a shared-secret MAC over
// server-to-server traffic, and the comparison below is constant-time, so the
// practical exposure is limited to Click's own protocol design.

// Prepare (action=0):
//   md5(click_trans_id + service_id + SECRET_KEY + merchant_trans_id
//       + amount + action + sign_time)
//
// Complete (action=1) inserts merchant_prepare_id after merchant_trans_id:
//   md5(click_trans_id + service_id + SECRET_KEY + merchant_trans_id
//       + merchant_prepare_id + amount + action + sign_time)
//
// CRITICAL: every component must be the RAW string exactly as Click sent it.
// Click's `amount` arrives as e.g. "49000.00"; normalising it to "49000" before
// hashing produces a different digest and every payment fails verification.
// That is why the callback DTOs keep everything as strings.

export interface PrepareSignInput {
  click_trans_id: string;
  service_id: string;
  merchant_trans_id: string;
  amount: string;
  action: string;
  sign_time: string;
}

export interface CompleteSignInput extends PrepareSignInput {
  merchant_prepare_id: string;
}

export function buildPrepareSignString(
  input: PrepareSignInput,
  secretKey: string
): string {
  const raw =
    input.click_trans_id +
    input.service_id +
    secretKey +
    input.merchant_trans_id +
    input.amount +
    input.action +
    input.sign_time;
  return md5Hex(raw);
}

export function buildCompleteSignString(
  input: CompleteSignInput,
  secretKey: string
): string {
  const raw =
    input.click_trans_id +
    input.service_id +
    secretKey +
    input.merchant_trans_id +
    input.merchant_prepare_id +
    input.amount +
    input.action +
    input.sign_time;
  return md5Hex(raw);
}

function md5Hex(raw: string): string {
  return createHash("md5").update(raw, "utf8").digest("hex");
}

// Constant-time comparison of two hex digests. Case-insensitive because Click's
// docs don't pin the case of the hex they send, and some of their client
// libraries emit uppercase.
//
// Returns false rather than throwing on a malformed candidate (wrong length,
// non-hex) so callers can treat "unverifiable" and "wrong" identically.
export function verifySignString(expected: string, received: string): boolean {
  if (typeof received !== "string" || received.length !== expected.length) {
    return false;
  }
  const a = Buffer.from(expected.toLowerCase(), "utf8");
  const b = Buffer.from(received.toLowerCase(), "utf8");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

// ── Merchant API auth (outbound) ───────────────────────────────────────────
//
// Header format, per Click's Merchant API docs:
//   Auth: merchant_user_id:digest:timestamp
//   digest    = sha1(timestamp + SECRET_KEY)
//   timestamp = UNIX seconds, 10 digits
//
// A fresh timestamp is generated per call; Click rejects stale ones.
export function buildMerchantAuthHeader(input: {
  merchantUserId: string;
  secretKey: string;
  // Injectable for deterministic tests; defaults to now.
  timestampSeconds?: number;
}): string {
  const ts = String(
    input.timestampSeconds ?? Math.floor(Date.now() / 1000)
  );
  const digest = createHash("sha1")
    .update(ts + input.secretKey, "utf8")
    .digest("hex");
  return `${input.merchantUserId}:${digest}:${ts}`;
}
