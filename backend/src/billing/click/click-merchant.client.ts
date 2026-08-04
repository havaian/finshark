import { Injectable, Logger } from "@nestjs/common";
import { ClickConfig } from "./click.config";
import { buildMerchantAuthHeader } from "./click.signature";

// Thin client for Click's Merchant API (api.click.uz/v2/merchant).
//
// This is the OUTBOUND direction - us calling Click - and is entirely separate
// from the SHOP API callbacks Click makes to us. Only the pieces we actually
// use are implemented: fiscal receipt submission, fiscal receipt lookup, and a
// payment status probe for reconciliation.
//
// Every request carries the Auth header:
//   Auth: merchant_user_id:sha1(timestamp + SECRET_KEY):timestamp
// with a freshly minted timestamp, because Click rejects stale ones.

// An OFD receipt line. Field names are PascalCase because that is what Click's
// fiscalization endpoint expects verbatim - this is their wire format, not our
// house style.
export interface ClickFiscalItem {
  Name: string;
  SPIC: string;
  PackageCode: string;
  GoodPrice?: number;
  Price: number;
  Amount: number;
  VAT: number;
  VATPercent: number;
  Units?: number;
  CommissionInfo: {
    TIN?: string;
    PINFL?: string;
  };
}

export interface ClickApiResult<T> {
  ok: boolean;
  status: number;
  errorCode: number | null;
  errorNote: string | null;
  data: T | null;
}

const REQUEST_TIMEOUT_MS = 15_000;

function notConfigured<T>(): ClickApiResult<T> {
  return {
    ok: false,
    status: 0,
    errorCode: null,
    errorNote: "Click is not configured",
    data: null,
  };
}

@Injectable()
export class ClickMerchantClient {
  private readonly log = new Logger(ClickMerchantClient.name);

  constructor(private readonly config: ClickConfig) {}

  // Submit the fiscal receipt for a completed payment.
  //
  // `paymentId` is Click's click_paydoc_id from the Complete callback, NOT our
  // order id and NOT click_trans_id. Filing against the wrong id produces a
  // receipt Click can't match to a payment.
  //
  // The received_* split reports how the customer paid. The Complete callback
  // does not tell us which instrument was used, so the whole amount is reported
  // as card. See the note in click-fiscal.service.ts.
  async submitFiscalItems(input: {
    paymentId: string;
    items: ClickFiscalItem[];
    receivedCard: number;
    receivedCash?: number;
    receivedEcash?: number;
  }): Promise<ClickApiResult<Record<string, unknown>>> {
    const core = this.config.core;
    if (!core) {
      return {
        ok: false,
        status: 0,
        errorCode: null,
        errorNote: "Click is not configured",
        data: null,
      };
    }

    return this.request<Record<string, unknown>>({
      method: "POST",
      path: "/payment/ofd_data/submit_items",
      body: {
        service_id: Number(core.serviceId),
        payment_id: Number(input.paymentId),
        items: input.items,
        received_ecash: input.receivedEcash ?? 0,
        received_cash: input.receivedCash ?? 0,
        received_card: input.receivedCard,
      },
    });
  }

  // Fetch the OFD receipt URL for a payment. Click populates this once the OFD
  // has processed the submission, which is not instantaneous, so a miss right
  // after submitting is normal and not an error worth retrying hard.
  async getFiscalData(
    paymentId: string
  ): Promise<ClickApiResult<{ paymentId: number; qrCodeURL: string }>> {
    const core = this.config.core;
    if (!core) {
      return {
        ok: false,
        status: 0,
        errorCode: null,
        errorNote: "Click is not configured",
        data: null,
      };
    }
    return this.request<{ paymentId: number; qrCodeURL: string }>({
      method: "GET",
      path: `/payment/ofd_data/${core.serviceId}/${paymentId}`,
    });
  }

  // Reconciliation probe: ask Click what it thinks the state of a payment is,
  // keyed on our merchant_trans_id. Used by the admin panel when an order is
  // stuck, to answer "did the money actually move" without leaving the app.
  async getPaymentStatusByMerchantTransId(
    merchantTransId: string
  ): Promise<
    ClickApiResult<{ payment_id: number; merchant_trans_id: string }>
  > {
    const core = this.config.core;
    if (!core) {
      return {
        ok: false,
        status: 0,
        errorCode: null,
        errorNote: "Click is not configured",
        data: null,
      };
    }
    return this.request<{ payment_id: number; merchant_trans_id: string }>({
      method: "GET",
      path: `/payment/status_by_mti/${core.serviceId}/${encodeURIComponent(
        merchantTransId
      )}`,
    });
  }

  // ── transport ────────────────────────────────────────────────────────────

  // ── Card tokens (recurring) ──────────────────────────────────────────────
  //
  // NOTE ON card_token/request: it is the only Click endpoint that takes no
  // Auth header, which is what makes it callable straight from the browser so
  // the card number never reaches our servers. This method exists ONLY as a
  // fallback for when the browser cannot reach Click directly (CORS), and the
  // PAN it receives is a request-scoped argument that is never persisted or
  // logged. Do not add it to any log line, error message or database column.
  async requestCardToken(input: {
    cardNumber: string;
    expireDate: string; // MMYY
  }): Promise<
    ClickApiResult<{
      card_token: string;
      phone_number?: string;
      temporary?: boolean;
    }>
  > {
    const core = this.config.core;
    if (!core) return notConfigured();

    // temporary: 0 - a permanent token. Temporary tokens are deleted by Click
    // after a single payment, which is the opposite of what recurring needs.
    return this.request({
      method: "POST",
      path: "/card_token/request",
      body: {
        service_id: Number(core.serviceId),
        card_number: input.cardNumber,
        expire_date: input.expireDate,
        temporary: 0,
      },
      skipAuth: true,
    });
  }

  // Confirm a freshly requested token with the SMS code Click sent to the
  // cardholder. Returns the masked PAN, which is the only card identifier we
  // keep.
  async verifyCardToken(input: {
    cardToken: string;
    smsCode: string;
  }): Promise<ClickApiResult<{ card_number?: string }>> {
    const core = this.config.core;
    if (!core) return notConfigured();

    return this.request({
      method: "POST",
      path: "/card_token/verify",
      body: {
        service_id: Number(core.serviceId),
        card_token: input.cardToken,
        sms_code: Number(input.smsCode),
      },
    });
  }

  // Charge a verified token. Click then drives the SAME Prepare/Complete
  // callbacks as a hosted payment (confirmed by Click support, 2026-08-03), so
  // the grant, idempotency and fiscalization paths are all reused - the
  // response here only tells us the charge was accepted for processing.
  //
  // `transaction_parameter` is our merchant_trans_id, so the callbacks arrive
  // already matched to the order we created.
  async payWithCardToken(input: {
    cardToken: string;
    amount: number; // major units, as Click's SHOP API expects
    merchantTransId: string;
  }): Promise<ClickApiResult<{ payment_id: number; payment_status: number }>> {
    const core = this.config.core;
    if (!core) return notConfigured();

    return this.request({
      method: "POST",
      path: "/card_token/payment",
      body: {
        service_id: Number(core.serviceId),
        card_token: input.cardToken,
        amount: input.amount,
        transaction_parameter: input.merchantTransId,
      },
    });
  }

  // Unbind. Click offers the cardholder no way to do this from their own app,
  // so this call is the only off switch that exists.
  async deleteCardToken(cardToken: string): Promise<ClickApiResult<unknown>> {
    const core = this.config.core;
    if (!core) return notConfigured();

    return this.request({
      method: "DELETE",
      path: `/card_token/${core.serviceId}/${encodeURIComponent(cardToken)}`,
    });
  }

  private async request<T>(input: {
    method: "GET" | "POST" | "DELETE";
    path: string;
    body?: unknown;
    // card_token/request is documented without an Auth header. Sending one
    // anyway is not obviously harmful, but the header carries a secret-derived
    // digest and there is no reason to put it on a call that does not want it.
    skipAuth?: boolean;
  }): Promise<ClickApiResult<T>> {
    const core = this.config.core;
    if (!core) {
      return {
        ok: false,
        status: 0,
        errorCode: null,
        errorNote: "Click is not configured",
        data: null,
      };
    }

    const url = `${this.config.merchantApiBase}${input.path}`;
    const auth = buildMerchantAuthHeader({
      merchantUserId: core.merchantUserId,
      secretKey: core.secretKey,
    });

    // AbortController rather than relying on the platform default: a hung
    // fiscal call must not pin a worker, especially inside the retry cron.
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(url, {
        method: input.method,
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          ...(input.skipAuth ? {} : { Auth: auth }),
        },
        body: input.body === undefined ? undefined : JSON.stringify(input.body),
        signal: controller.signal,
      });

      const text = await res.text();
      let parsed: unknown = null;
      if (text) {
        try {
          parsed = JSON.parse(text);
        } catch {
          // Click occasionally answers with a bare string on infrastructure
          // errors. Keep the text as the note rather than throwing.
          return {
            ok: false,
            status: res.status,
            errorCode: null,
            errorNote: text.slice(0, 500),
            data: null,
          };
        }
      }

      const obj = (parsed ?? {}) as Record<string, unknown>;
      const errorCode =
        typeof obj.error_code === "number" ? obj.error_code : null;
      const errorNote =
        typeof obj.error_note === "string" ? obj.error_note : null;

      // Click signals application-level failure through error_code, not the
      // HTTP status - a 200 with error_code=-1 is a failure. Both are checked.
      const ok = res.ok && (errorCode === null || errorCode === 0);

      return {
        ok,
        status: res.status,
        errorCode,
        errorNote,
        data: ok ? (parsed as T) : null,
      };
    } catch (e) {
      const message =
        e instanceof Error
          ? e.name === "AbortError"
            ? `request timed out after ${REQUEST_TIMEOUT_MS}ms`
            : e.message
          : String(e);
      this.log.warn(`Click merchant API ${input.method} ${input.path}: ${message}`);
      return {
        ok: false,
        status: 0,
        errorCode: null,
        errorNote: message,
        data: null,
      };
    } finally {
      clearTimeout(timer);
    }
  }
}
