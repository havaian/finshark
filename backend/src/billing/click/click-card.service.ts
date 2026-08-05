import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ClickCardTokensRepository } from "./click-card-tokens.repository";
import { ClickConfig } from "./click.config";
import { ClickMerchantClient } from "./click-merchant.client";
import { ClickOrdersRepository } from "./click-orders.repository";
import { PlansRepository } from "../plans.repository";
import { SubscriptionsRepository } from "../subscriptions.repository";
import { ConfigService } from "@nestjs/config";
import { EmailOutboxService } from "../../email/email-outbox.service";
import { UsersRepository } from "../../users/users.repository";
import type { ClickCardTokenRow } from "./click.types";

// Saved cards and automatic subscription renewal.
//
// HOW A RENEWAL ACTUALLY RUNS
//
// Click confirmed (2026-08-03) that a card_token/payment charge drives the SAME
// Prepare -> Complete callbacks as a hosted payment. So this service does NOT
// grant anything itself: it creates an order exactly as checkout does, asks
// Click to charge the saved token against that order's merchant_trans_id, and
// then the existing callback handlers do the rest - advisory locking, amount
// validation, idempotency, subscription grant and fiscal filing all unchanged.
//
// That is why there is no "renewal grant" path here. Duplicating it would mean
// two ways to create a subscription and two places for a bug to hide.
//
// WHEN THE CHARGE HAPPENS
//
// On the day the subscription ENDS, not before. Taking money days early means
// billing someone for a period they have not reached yet, and if they cancel in
// between they have already been charged for it.
//
// What happens 3 days out is a NOTICE, not a charge: renewal_upcoming tells the
// user the exact date and amount so the debit is never a surprise. That is the
// part users actually need early; the money is not.
//
// The sweep runs hourly, so "on the day" means within an hour of expiry.
const MAX_RENEW_ATTEMPTS = 3;
const RENEW_RETRY_HOURS = 24;
const SWEEP_BATCH_SIZE = 50;

@Injectable()
export class ClickCardService {
  private readonly log = new Logger(ClickCardService.name);

  constructor(
    private readonly config: ClickConfig,
    private readonly merchant: ClickMerchantClient,
    private readonly tokens: ClickCardTokensRepository,
    private readonly orders: ClickOrdersRepository,
    private readonly plans: PlansRepository,
    private readonly subs: SubscriptionsRepository,
    private readonly outbox: EmailOutboxService,
    private readonly users: UsersRepository,
    private readonly appConfig: ConfigService
  ) {}

  // ── Binding ──────────────────────────────────────────────────────────────

  // Step 1, CORS fallback only.
  //
  // The browser should call Click's card_token/request directly - it is the one
  // endpoint needing no Auth header, precisely so the card number never reaches
  // a merchant server. This method exists for when that direct call is blocked.
  //
  // `cardNumber` is a request-scoped argument. It is not stored, not logged,
  // and not included in any error surfaced to the caller. Keep it that way.
  async requestBinding(input: {
    userId: string;
    cardNumber: string;
    expireDate: string;
  }): Promise<{ token_id: string; phone_masked: string | null }> {
    this.assertEnabled();

    const res = await this.merchant.requestCardToken({
      cardNumber: input.cardNumber,
      expireDate: input.expireDate,
    });
    if (!res.ok || !res.data?.card_token) {
      // res.errorNote comes from Click and describes the card, never quotes it.
      throw new BadRequestException(
        res.errorNote ?? "could not start card binding"
      );
    }

    const row = await this.tokens.insertPending({
      userId: input.userId,
      cardToken: res.data.card_token,
      phoneMasked: res.data.phone_number ?? null,
    });
    return { token_id: row.id, phone_masked: row.phone_masked };
  }

  // Step 1 alternative: the browser already has a token from calling Click
  // directly, and only needs us to record it before the SMS step.
  async adoptBinding(input: {
    userId: string;
    cardToken: string;
    phoneMasked: string | null;
  }): Promise<{ token_id: string; phone_masked: string | null }> {
    this.assertEnabled();
    const row = await this.tokens.insertPending({
      userId: input.userId,
      cardToken: input.cardToken,
      phoneMasked: input.phoneMasked,
    });
    return { token_id: row.id, phone_masked: row.phone_masked };
  }

  // Step 2: confirm with the SMS code. Only after this can the card be charged.
  async verifyBinding(input: {
    userId: string;
    tokenId: string;
    smsCode: string;
  }): Promise<ClickCardTokenRow> {
    this.assertEnabled();

    const row = await this.tokens.findById(input.tokenId);
    // Same message for "no such token" and "not yours" - a differing response
    // would let one user probe for another's token ids.
    if (!row || row.user_id !== input.userId) {
      throw new NotFoundException("card binding not found");
    }
    if (row.status !== "pending_sms") {
      throw new BadRequestException("this card binding is no longer pending");
    }

    const res = await this.merchant.verifyCardToken({
      cardToken: row.card_token,
      smsCode: input.smsCode,
    });
    if (!res.ok) {
      throw new BadRequestException(res.errorNote ?? "invalid SMS code");
    }

    const verified = await this.tokens.markVerified({
      id: row.id,
      cardMasked: res.data?.card_number ?? null,
    });
    if (!verified) throw new BadRequestException("card binding failed");
    return verified;
  }

  async getSavedCard(userId: string): Promise<ClickCardTokenRow | null> {
    return this.tokens.findActiveForUser(userId);
  }

  // Unbind. Click is told first: if we dropped our row and their call failed,
  // the token would keep living at Click with no record of it here.
  //
  // Auto-renew is switched off for every subscription pointing at this card in
  // the same breath. Leaving auto_renew on with no card would produce a renewal
  // that fails forever and emails the user about it.
  async removeCard(userId: string): Promise<void> {
    const row = await this.tokens.findActiveForUser(userId);
    if (!row) throw new NotFoundException("no saved card");

    const res = await this.merchant.deleteCardToken(row.card_token);
    if (!res.ok) {
      this.log.warn(
        `Click refused to delete card token for user ${userId}: ${res.errorNote}`
      );
    }
    await this.subs.disableAutoRenewForCard(row.id);
    await this.tokens.markRemoved(row.id);
  }

  // ── Subscribe now ────────────────────────────────────────────────────────

  // Start a subscription in one action: charge the saved card immediately for
  // the first period, and have the resulting subscription come out with
  // auto-renew already on.
  //
  // This exists because the toggle alone cannot start anything. setAutoRenew
  // requires an ACTIVE subscription, so without this a new user had to buy
  // one-time, then save a card, then find a toggle - three steps to reach the
  // thing the page should have offered first.
  //
  // Nothing is granted here. The charge drives Click's normal Prepare/Complete
  // callbacks, and `enable_auto_renew` in the order metadata tells the grant
  // path to switch renewal on once the subscription actually exists. Doing it
  // that way means one grant path, not two.
  async subscribeNow(input: {
    userId: string;
    planId: string;
  }): Promise<{ order_id: string; merchant_trans_id: string }> {
    this.assertEnabled();

    const card = await this.tokens.findActiveForUser(input.userId);
    if (!card) {
      throw new BadRequestException("save a card before subscribing");
    }

    const plan = await this.plans.findById(input.planId);
    if (!plan || !plan.is_active || plan.tier !== "premium") {
      throw new BadRequestException("plan is not available");
    }
    if (plan.price_minor === null || plan.currency === null) {
      throw new BadRequestException("plan has no price");
    }
    if (plan.period_days === null) {
      // A lifetime plan has nothing to renew; buying it is a one-time purchase.
      throw new BadRequestException("this plan cannot be subscribed to");
    }

    // Refuse while another order for this plan is still settling, same guard
    // the renewal sweep uses - a double-tap must not become two charges.
    const openOrder = await this.orders.findOpenForUserPlan(
      input.userId,
      plan.id
    );
    if (openOrder) {
      throw new BadRequestException(
        "a payment for this plan is already in progress"
      );
    }

    const merchantTransId = await this.orders.generateMerchantTransId();
    const order = await this.orders.create({
      user_id: input.userId,
      plan_id: plan.id,
      merchant_trans_id: merchantTransId,
      amount_minor: plan.price_minor,
      currency: plan.currency,
      fiscal_status: this.config.fiscalEnabled ? "pending" : "not_required",
      metadata: {
        plan_name: plan.name,
        // Read by ClickService.grantForOrder once the subscription exists.
        enable_auto_renew: true,
        card_token_id: card.id,
      },
    });

    const res = await this.merchant.payWithCardToken({
      cardToken: card.card_token,
      amount: plan.price_minor / 100,
      merchantTransId,
    });
    if (!res.ok) {
      const note = res.errorNote ?? "card charge was declined";
      await this.tokens.setLastError(card.id, note);
      await this.orders.markFailed({
        id: order.id,
        error_note: `subscribe declined: ${note}`,
      });
      throw new BadRequestException(note);
    }

    await this.tokens.setLastError(card.id, null);
    return { order_id: order.id, merchant_trans_id: merchantTransId };
  }

  // Turn auto-renew on for a subscription the grant path just created. Called
  // from ClickService, which knows when the row exists.
  async enableAutoRenewForNewSubscription(input: {
    userId: string;
    subscriptionId: string;
  }): Promise<void> {
    try {
      const card = await this.tokens.findActiveForUser(input.userId);
      if (!card) return;
      await this.subs.setAutoRenew({
        id: input.subscriptionId,
        enabled: true,
        cardTokenId: card.id,
      });
    } catch (e) {
      // The payment succeeded and access was granted; failing to flip a flag
      // must not undo that. The user can still toggle it by hand.
      this.log.warn(
        `could not enable auto-renew on ${input.subscriptionId}: ${
          e instanceof Error ? e.message : String(e)
        }`
      );
    }
  }

  // ── Auto-renew toggle ────────────────────────────────────────────────────

  async setAutoRenew(input: {
    userId: string;
    enabled: boolean;
  }): Promise<void> {
    const sub = await this.subs.findActiveForUser(input.userId);
    if (!sub) throw new NotFoundException("no active subscription");

    if (!input.enabled) {
      await this.subs.setAutoRenew({ id: sub.id, enabled: false, cardTokenId: null });
      return;
    }

    // Turning it ON requires a usable card and a subscription that actually
    // ends. An open-ended grant has nothing to renew.
    const card = await this.tokens.findActiveForUser(input.userId);
    if (!card) {
      throw new BadRequestException("save a card before enabling auto-renew");
    }
    if (sub.ends_at === null) {
      throw new BadRequestException(
        "this subscription has no end date, so there is nothing to renew"
      );
    }
    await this.subs.setAutoRenew({
      id: sub.id,
      enabled: true,
      cardTokenId: card.id,
    });
  }

  // ── Renewal sweep ────────────────────────────────────────────────────────

  @Cron(CronExpression.EVERY_HOUR, { name: "click-subscription-renewal" })
  async renewalSweep(): Promise<void> {
    if (!this.config.enabled) return;

    let due;
    try {
      due = await this.subs.findDueForRenewal({
        maxAttempts: MAX_RENEW_ATTEMPTS,
        retryHours: RENEW_RETRY_HOURS,
        limit: SWEEP_BATCH_SIZE,
      });
    } catch (e) {
      this.log.error(
        `renewal sweep query failed: ${e instanceof Error ? e.message : String(e)}`
      );
      return;
    }
    if (due.length === 0) return;

    let charged = 0;
    let failed = 0;
    for (const sub of due) {
      try {
        const ok = await this.attemptRenewal(sub.id);
        if (ok) charged++;
        else failed++;
      } catch (e) {
        failed++;
        this.log.error(
          `renewal failed for subscription ${sub.id}: ${
            e instanceof Error ? e.message : String(e)
          }`
        );
      }
    }
    this.log.log(`renewal sweep: ${charged} charged, ${failed} failed`);
  }

  // One renewal attempt. Returns true when Click ACCEPTED the charge - not when
  // the subscription has been extended. The extension happens later, in the
  // Complete callback, exactly as it does for a hosted payment.
  private async attemptRenewal(subscriptionId: string): Promise<boolean> {
    const sub = await this.subs.findById(subscriptionId);
    if (!sub || !sub.auto_renew || sub.renew_card_token_id === null) return false;

    const card = await this.tokens.findById(sub.renew_card_token_id);
    if (!card || card.status !== "active") {
      await this.subs.recordRenewalFailure(sub.id, "saved card is no longer available");
      return false;
    }

    const plan = await this.plans.findById(sub.plan_id);
    if (!plan || !plan.is_active || plan.price_minor === null || plan.currency === null) {
      await this.subs.recordRenewalFailure(sub.id, "plan is no longer purchasable");
      return false;
    }

    // Guard against double-charging: if an order for this user and plan is
    // already open, a previous sweep got as far as creating one and the
    // callbacks may still be in flight.
    const openOrder = await this.orders.findOpenForUserPlan(sub.user_id, plan.id);
    if (openOrder) {
      this.log.log(
        `renewal for ${sub.id} skipped - order ${openOrder.merchant_trans_id} still open`
      );
      return false;
    }

    const merchantTransId = await this.orders.generateMerchantTransId();
    const order = await this.orders.create({
      user_id: sub.user_id,
      plan_id: plan.id,
      merchant_trans_id: merchantTransId,
      amount_minor: plan.price_minor,
      currency: plan.currency,
      fiscal_status: this.config.fiscalEnabled ? "pending" : "not_required",
      metadata: { plan_name: plan.name, auto_renew: true, subscription_id: sub.id },
    });

    // Click's SHOP API works in major units; our orders are stored in minor.
    const res = await this.merchant.payWithCardToken({
      cardToken: card.card_token,
      amount: plan.price_minor / 100,
      merchantTransId,
    });

    await this.subs.recordRenewalAttempt(sub.id);

    if (!res.ok) {
      const note = res.errorNote ?? "card charge was declined";
      await this.subs.recordRenewalFailure(sub.id, note);
      await this.tokens.setLastError(card.id, note);
      await this.orders.markFailed({
        id: order.id,
        error_note: `auto-renew declined: ${note}`,
      });

      // Email on the FIRST failure and on the LAST, never in between. Three
      // near-identical emails across a three-day retry window would train the
      // user to ignore the one that actually matters.
      //
      // recordRenewalAttempt already ran, so renew_attempts counts this try.
      const attemptsSoFar = sub.renew_attempts + 1;
      if (attemptsSoFar === 1) {
        await this.notify({
          userId: sub.user_id,
          templateKey: "renewal_failed",
          endsAt: sub.ends_at,
          reason: note,
        });
      } else if (attemptsSoFar >= MAX_RENEW_ATTEMPTS) {
        await this.notify({
          userId: sub.user_id,
          templateKey: "renewal_abandoned",
          endsAt: sub.ends_at,
        });
      }
      return false;
    }

    // A successful response only means the charge was accepted. payment_status
    // 2 is success, 1 is still processing - either way the Prepare/Complete
    // callbacks are what actually settle it, so we do not branch on the code
    // here beyond recording that the attempt went through.
    await this.tokens.setLastError(card.id, null);
    return true;
  }

  // Called by ClickService once an auto-renewal order has actually granted.
  // Lives here rather than there because this service owns renewal messaging,
  // and the success email has to say the same things as the failure ones.
  async notifyRenewalSucceeded(
    userId: string,
    endsAt: Date | null
  ): Promise<void> {
    await this.notify({
      userId,
      templateKey: "renewal_succeeded",
      endsAt,
    });
  }

  // ── Notifications ────────────────────────────────────────────────────────
  //
  // Fire-and-forget, like every other transactional email here: a renewal that
  // succeeded is the contractual state, and an SMTP outage must not turn it
  // into a failure. Failures are logged, never thrown.
  private async notify(input: {
    userId: string;
    templateKey: string;
    endsAt: Date | null;
    reason?: string;
  }): Promise<void> {
    try {
      const user = await this.users.findById(input.userId);
      if (!user) return;
      const appUrl = this.appConfig
        .getOrThrow<string>("APP_PUBLIC_URL")
        .replace(/\/$/, "");
      const endsOn =
        input.endsAt === null
          ? "-"
          : input.endsAt.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              timeZone: "UTC",
            });
      await this.outbox.enqueue({
        templateKey: input.templateKey,
        to: user.email,
        lang: "en",
        variables: {
          display_name: user.display_name,
          ends_on: endsOn,
          app_url: appUrl,
          reason: input.reason ?? "",
        },
        context: `renewal user ${input.userId}`,
      });
    } catch (e) {
      this.log.warn(
        `${input.templateKey} email failed: ${
          e instanceof Error ? e.message : String(e)
        }`
      );
    }
  }

  private assertEnabled(): void {
    if (!this.config.enabled || !this.config.core) {
      throw new ServiceUnavailableException(
        `online payments are not available (${this.config.configProblem() ?? "not configured"})`
      );
    }
  }
}
