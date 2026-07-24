import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PlansRepository } from "../plans.repository";
import { ClickConfig } from "./click.config";
import type { ClickFiscalConfig } from "./click.config";
import { ClickOrdersRepository } from "./click-orders.repository";
import { ClickMerchantClient } from "./click-merchant.client";
import type { ClickFiscalItem } from "./click-merchant.client";
import type { ClickOrderRow } from "./click.types";

// OFD (fiscal receipt) submission for completed Click payments.
//
// Under PKM No. 943 every settlement with the public has to be registered with
// a fiscal data operator. Click files the receipt on our behalf through their
// Merchant API, but only if we tell them what was sold: the MXIK/SPIC code,
// the package code, the VAT treatment and our TIN.
//
// Design rules, in order of importance:
//
//   1. Fiscalization NEVER unwinds a payment. The customer has been charged and
//      the subscription is already granted by the time we get here. A failure
//      leaves fiscal_status='failed' and a legible error for the admin panel.
//   2. We never invent tax data. If the plan has no fiscal_item_name, or the
//      env config is incomplete, we fail loudly rather than filing a receipt
//      with a placeholder. A wrong receipt is worse than a missing one because
//      it has to be corrected through the tax authority, not just re-sent.
//   3. Retries are bounded. A receipt rejected for a structurally bad MXIK will
//      be rejected every time; after MAX_FISCAL_ATTEMPTS the order stops being
//      swept and waits for a human.
//
// Amount handling: plans.price_minor is already in tiyin, which is exactly what
// Click's fiscal Price/VAT fields want, so no conversion happens here. The
// division by 100 that the payment side needs applies only to Click's `amount`
// parameter, not to fiscal fields.

const MAX_FISCAL_ATTEMPTS = 5;
const SWEEP_BATCH_SIZE = 20;

@Injectable()
export class ClickFiscalService {
  private readonly log = new Logger(ClickFiscalService.name);

  constructor(
    private readonly config: ClickConfig,
    private readonly orders: ClickOrdersRepository,
    private readonly plans: PlansRepository,
    private readonly merchant: ClickMerchantClient
  ) {}

  // Fire-and-forget entry point used right after a successful Complete. Errors
  // are swallowed - the caller is inside the payment callback and must answer
  // Click regardless of what happens here.
  fireAndForget(orderId: string): void {
    void this.submitForOrder(orderId).catch((e) => {
      this.log.error(
        `fiscalization threw for order ${orderId}: ${
          e instanceof Error ? e.message : String(e)
        }`
      );
    });
  }

  // Build and submit the receipt for one paid order. Returns true on success.
  // Safe to call repeatedly: an order already in fiscal_status='submitted' is
  // skipped rather than double-filed.
  async submitForOrder(orderId: string): Promise<boolean> {
    const order = await this.orders.findById(orderId);
    if (!order) {
      this.log.warn(`fiscalization skipped: order ${orderId} not found`);
      return false;
    }
    if (order.status !== "paid") {
      this.log.warn(
        `fiscalization skipped: order ${orderId} is ${order.status}, not paid`
      );
      return false;
    }
    if (order.fiscal_status === "submitted") {
      return true;
    }
    if (order.fiscal_status === "not_required") {
      // Fiscalization was off when this order was paid. Filing it now would
      // date the receipt to today for a payment taken earlier, which is an
      // accounting decision rather than an automatic one.
      return false;
    }

    const fiscal = this.config.fiscal;
    if (!fiscal) {
      const problem =
        this.config.fiscalConfigProblem() ?? "fiscalization is disabled";
      await this.orders.markFiscalFailed({
        id: order.id,
        error: `config: ${problem}`,
      });
      this.log.error(`fiscalization config unusable for ${orderId}: ${problem}`);
      return false;
    }

    if (!order.click_paydoc_id) {
      await this.orders.markFiscalFailed({
        id: order.id,
        error: "missing click_paydoc_id - cannot key the receipt",
      });
      return false;
    }

    const plan = await this.plans.findById(order.plan_id);
    if (!plan) {
      await this.orders.markFiscalFailed({
        id: order.id,
        error: `plan ${order.plan_id} no longer exists`,
      });
      return false;
    }
    const itemName = plan.fiscal_item_name?.trim();
    if (!itemName) {
      // Deliberate hard stop. The receipt line is a legal document field; we do
      // not fall back to plan.name or synthesise one.
      await this.orders.markFiscalFailed({
        id: order.id,
        error: `plan ${plan.id} has no fiscal_item_name configured`,
      });
      this.log.error(
        `fiscalization blocked: plan ${plan.id} needs a fiscal_item_name (set it in Admin > Payments)`
      );
      return false;
    }

    const item = this.buildItem({
      name: itemName,
      amountMinor: order.amount_minor,
      fiscal,
    });

    const res = await this.merchant.submitFiscalItems({
      paymentId: order.click_paydoc_id,
      items: [item],
      // The Complete callback carries no instrument breakdown, so the full
      // amount is reported as a card settlement. Both Click payment surfaces we
      // expose are card-funded (Uzcard/Humo directly, or a Click wallet topped
      // up by card), so this is accurate in practice. If the accountant wants
      // it split, this is the line to change.
      receivedCard: order.amount_minor,
      receivedCash: 0,
      receivedEcash: 0,
    });

    if (!res.ok) {
      const note =
        res.errorNote ??
        `HTTP ${res.status}${res.errorCode !== null ? ` code ${res.errorCode}` : ""}`;
      await this.orders.markFiscalFailed({ id: order.id, error: note });
      this.log.error(`fiscalization rejected for order ${order.id}: ${note}`);
      return false;
    }

    await this.orders.markFiscalSubmitted({ id: order.id, qr_url: null });
    this.log.log(`fiscal receipt filed for order ${order.id}`);

    // Best-effort follow-up for the receipt URL. The OFD usually needs a moment,
    // so a miss here is expected and non-fatal; the sweep below picks it up.
    void this.refreshQrUrl(order.id, order.click_paydoc_id);
    return true;
  }

  // Ask Click for the OFD receipt URL and store it if present.
  async refreshQrUrl(orderId: string, paydocId: string): Promise<void> {
    try {
      const res = await this.merchant.getFiscalData(paydocId);
      const url = res.data?.qrCodeURL;
      if (res.ok && typeof url === "string" && url.length > 0) {
        await this.orders.setFiscalQrUrl(orderId, url);
      }
    } catch (e) {
      this.log.warn(
        `could not fetch fiscal QR for order ${orderId}: ${
          e instanceof Error ? e.message : String(e)
        }`
      );
    }
  }

  // Build the single receipt line for a subscription purchase.
  //
  // Quantity is always 1 - a subscription is one indivisible item - so Price
  // (line total) and GoodPrice (unit price) are the same figure.
  //
  // VAT maths, both in tiyin:
  //   inclusive: VAT = round(Price * pct / (100 + pct))   [extracted]
  //   exclusive: VAT = round(Price * pct / 100)           [added on top]
  // At pct = 0 both collapse to 0, which is what an IT Park resident files.
  private buildItem(input: {
    name: string;
    amountMinor: number;
    fiscal: ClickFiscalConfig;
  }): ClickFiscalItem {
    const { name, amountMinor, fiscal } = input;
    const pct = fiscal.vatPercent;

    let vat = 0;
    if (pct > 0) {
      vat = fiscal.priceIncludesVat
        ? Math.round((amountMinor * pct) / (100 + pct))
        : Math.round((amountMinor * pct) / 100);
    }

    const item: ClickFiscalItem = {
      Name: name,
      SPIC: fiscal.spic,
      PackageCode: fiscal.packageCode,
      GoodPrice: amountMinor,
      Price: amountMinor,
      Amount: 1,
      VAT: vat,
      VATPercent: pct,
      CommissionInfo: fiscal.tin ? { TIN: fiscal.tin } : { PINFL: fiscal.pinfl! },
    };
    if (fiscal.units !== null) {
      item.Units = fiscal.units;
    }
    return item;
  }

  // ── Retry sweep ──────────────────────────────────────────────────────────
  //
  // Hourly rather than every-few-minutes: a receipt filed an hour late is fine,
  // and a slow cadence keeps a systematically-rejected batch from hammering
  // Click's API. Bounded by MAX_FISCAL_ATTEMPTS so bad config surfaces in the
  // admin panel instead of retrying forever.
  @Cron(CronExpression.EVERY_HOUR, { name: "click-fiscal-retry" })
  async retryPendingFiscal(): Promise<void> {
    if (!this.config.fiscalEnabled) return;
    if (this.config.fiscal === null) {
      this.log.warn(
        `fiscal retry skipped: ${this.config.fiscalConfigProblem() ?? "config unusable"}`
      );
      return;
    }

    const pending = await this.orders.findFiscalPending({
      limit: SWEEP_BATCH_SIZE,
      maxAttempts: MAX_FISCAL_ATTEMPTS,
    });
    if (pending.length === 0) return;

    this.log.log(`fiscal retry: ${pending.length} order(s) to file`);
    for (const order of pending) {
      // Sequential on purpose. These are low-volume and Click's API is not
      // something to fan out against.
      await this.submitForOrder(order.id);
    }

    // Backfill receipt URLs for anything filed earlier that still lacks one.
    await this.backfillQrUrls();
  }

  // Orders whose receipt was accepted but whose QR URL hadn't materialised yet
  // when we first asked (the OFD lags behind the submission). Cheap follow-up
  // so the admin panel can link straight to the receipt.
  private async backfillQrUrls(): Promise<void> {
    const missing = await this.orders.findSubmittedWithoutQr(SWEEP_BATCH_SIZE);
    for (const order of missing) {
      if (!order.click_paydoc_id) continue;
      await this.refreshQrUrl(order.id, order.click_paydoc_id);
    }
  }

  // Admin re-fire. Resets nothing - submitForOrder handles the state checks -
  // but is exposed separately so the controller reads clearly.
  async retryOne(orderId: string): Promise<{ ok: boolean; order: ClickOrderRow | null }> {
    const ok = await this.submitForOrder(orderId);
    const order = await this.orders.findById(orderId);
    return { ok, order };
  }
}
