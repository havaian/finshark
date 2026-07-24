import { Body, Controller, Post, Req } from "@nestjs/common";
import { SkipThrottle } from "@nestjs/throttler";
import type { Request } from "express";
import { ClickCallbackLogRepository } from "./click-callback-log.repository";
import { ClickService } from "./click.service";
import {
  CLICK_ACTION_COMPLETE,
  CLICK_ACTION_PREPARE,
  CLICK_ERROR_NOTES,
  ClickError,
} from "./click.types";
import type {
  ClickCompleteRequest,
  ClickErrorResponse,
  ClickPrepareRequest,
} from "./click.types";

// Click SHOP API callback endpoints. These are the two URLs registered in the
// Click merchant cabinet:
//
//   https://finshark.uz/api/billing/click/prepare
//   https://finshark.uz/api/billing/click/complete
//
// Three things about this controller are deliberate and easy to break:
//
// 1. NO AUTH GUARD. Click's servers call these; they have no session. Security
//    comes from the MD5 sign_string, verified in ClickService before anything
//    touches the database.
//
// 2. @SkipThrottle. The global ThrottlerGuard allows 60 requests/minute per IP.
//    Every Click callback arrives from the same small set of Click IPs, so
//    under any real load the throttler would start rejecting genuine payment
//    confirmations. Rate limiting is the wrong tool here; the signature is the
//    gate.
//
// 3. @Body() is typed as Record<string, unknown>, NOT a DTO class. The global
//    ValidationPipe in main.ts runs with forbidNonWhitelisted:true, which 400s
//    any request carrying a property the DTO doesn't declare - and Click adds
//    parameters over time. ValidationPipe skips parameters whose metatype is a
//    plain object, so this typing sidesteps it entirely and we validate by
//    hand below.
//
//    It also keeps every field as the RAW STRING Click sent. The signature is
//    an MD5 over concatenated raw values, so coercing `amount` from "49000.00"
//    to 49000 before hashing would break verification on every payment.
//
// Click posts application/x-www-form-urlencoded; Nest's default Express body
// parser handles that with no extra configuration.
@Controller("billing/click")
@SkipThrottle()
export class ClickCallbackController {
  constructor(
    private readonly click: ClickService,
    private readonly callbackLog: ClickCallbackLogRepository
  ) {}

  @Post("prepare")
  async prepare(
    @Body() body: Record<string, unknown>,
    @Req() req: Request
  ): Promise<unknown> {
    const raw = body ?? {};
    const parsed = parsePrepare(raw);

    if (!parsed) {
      const response = malformed();
      await this.callbackLog.record({
        action: CLICK_ACTION_PREPARE,
        merchant_trans_id: asString(raw.merchant_trans_id),
        click_trans_id: asString(raw.click_trans_id),
        request_body: raw,
        request_headers: pickHeaders(req),
        response_body: response as unknown as Record<string, unknown>,
        error_code: response.error,
        verdict: "malformed_body",
        ip: req.ip ?? null,
      });
      return response;
    }

    const outcome = await this.click.handlePrepare(parsed);
    await this.callbackLog.record({
      order_id: outcome.orderId,
      action: CLICK_ACTION_PREPARE,
      click_trans_id: parsed.click_trans_id,
      merchant_trans_id: parsed.merchant_trans_id,
      request_body: raw,
      request_headers: pickHeaders(req),
      response_body: outcome.response as unknown as Record<string, unknown>,
      error_code: outcome.response.error,
      verdict: outcome.verdict,
      ip: req.ip ?? null,
    });
    return outcome.response;
  }

  @Post("complete")
  async complete(
    @Body() body: Record<string, unknown>,
    @Req() req: Request
  ): Promise<unknown> {
    const raw = body ?? {};
    const parsed = parseComplete(raw);

    if (!parsed) {
      const response = malformed();
      await this.callbackLog.record({
        action: CLICK_ACTION_COMPLETE,
        merchant_trans_id: asString(raw.merchant_trans_id),
        click_trans_id: asString(raw.click_trans_id),
        request_body: raw,
        request_headers: pickHeaders(req),
        response_body: response as unknown as Record<string, unknown>,
        error_code: response.error,
        verdict: "malformed_body",
        ip: req.ip ?? null,
      });
      return response;
    }

    const outcome = await this.click.handleComplete(parsed);
    await this.callbackLog.record({
      order_id: outcome.orderId,
      action: CLICK_ACTION_COMPLETE,
      click_trans_id: parsed.click_trans_id,
      merchant_trans_id: parsed.merchant_trans_id,
      request_body: raw,
      request_headers: pickHeaders(req),
      response_body: outcome.response as unknown as Record<string, unknown>,
      error_code: outcome.response.error,
      verdict: outcome.verdict,
      ip: req.ip ?? null,
    });
    return outcome.response;
  }
}

// ── Manual parsing ───────────────────────────────────────────────────────────

function malformed(): ClickErrorResponse {
  return {
    error: ClickError.ERROR_IN_REQUEST,
    error_note: CLICK_ERROR_NOTES[ClickError.ERROR_IN_REQUEST],
  };
}

// Coerce a form field to a string. Form encoding gives us strings already, but
// a JSON-posting client would send numbers, and repeated keys arrive as arrays.
// Anything that isn't a scalar becomes null so the required-field check rejects
// it rather than stringifying "[object Object]" into a signature.
function asString(v: unknown): string | null {
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "bigint") return String(v);
  return null;
}

const PREPARE_REQUIRED = [
  "click_trans_id",
  "service_id",
  "click_paydoc_id",
  "merchant_trans_id",
  "amount",
  "action",
  "error",
  "sign_time",
  "sign_string",
] as const;

function parsePrepare(raw: Record<string, unknown>): ClickPrepareRequest | null {
  const out: Record<string, string> = {};
  for (const key of PREPARE_REQUIRED) {
    const v = asString(raw[key]);
    if (v === null) return null;
    out[key] = v;
  }
  const errorNote = asString(raw.error_note);
  return {
    click_trans_id: out.click_trans_id,
    service_id: out.service_id,
    click_paydoc_id: out.click_paydoc_id,
    merchant_trans_id: out.merchant_trans_id,
    amount: out.amount,
    action: out.action,
    error: out.error,
    error_note: errorNote ?? undefined,
    sign_time: out.sign_time,
    sign_string: out.sign_string,
  };
}

function parseComplete(raw: Record<string, unknown>): ClickCompleteRequest | null {
  const base = parsePrepare(raw);
  if (!base) return null;
  const prepareId = asString(raw.merchant_prepare_id);
  if (prepareId === null) return null;
  return { ...base, merchant_prepare_id: prepareId };
}

// Only the headers worth keeping for debugging. A blanket header dump would
// pull in cookies and any proxy-injected credentials; Click's support team
// needs none of that.
function pickHeaders(req: Request): Record<string, unknown> {
  const wanted = [
    "content-type",
    "user-agent",
    "x-forwarded-for",
    "x-real-ip",
    "host",
  ];
  const out: Record<string, unknown> = {};
  for (const name of wanted) {
    const v = req.headers[name];
    if (v !== undefined) out[name] = v;
  }
  return out;
}
