import { randomBytes } from "node:crypto";
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
  ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Sql } from "postgres";
import { PG } from "../../db/db.module";
import { EmailOutboxService } from "../../email/email-outbox.service";
import { UsersRepository } from "../../users/users.repository";
import { PlansRepository } from "../plans.repository";
import { SubscriptionsRepository } from "../subscriptions.repository";
import { SubscriptionsService } from "../subscriptions.service";
import { toPublicPlan } from "../billing.types";
import type { PublicPlan } from "../billing.types";
import { ClickCardService } from "./click-card.service";
import { ClickConfig } from "./click.config";
import { ClickFiscalService } from "./click-fiscal.service";
import { ClickOrdersRepository } from "./click-orders.repository";
import {
  buildCompleteSignString,
  buildPrepareSignString,
  verifySignString,
} from "./click.signature";
import {
  CLICK_ACTION_COMPLETE,
  CLICK_ACTION_PREPARE,
  CLICK_ERROR_NOTES,
  ClickError,
  clickAmountToMinor,
  minorToClickAmount,
  toPublicClickOrder,
} from "./click.types";
import type {
  ClickCheckoutHandle,
  ClickCompleteRequest,
  ClickCompleteResponse,
  ClickErrorResponse,
  ClickOrderRow,
  ClickPrepareRequest,
  ClickPrepareResponse,
  PublicClickOrder,
} from "./click.types";

// Outcome of handling a callback. `verdict` and `orderId` are for the callback
// log; `response` is what goes back to Click on the wire.
export interface CallbackOutcome<T> {
  response: T;
  verdict: string;
  orderId: string | null;
}

// Click gives us 30 seconds to answer a callback. These keep a single request
// comfortably inside that budget even when it contends for the per-order
// advisory lock. Deliberately well under 30s: a fast failure Click can retry
// beats a slow success they never hear about.
const CALLBACK_LOCK_TIMEOUT_MS = 5000;
const CALLBACK_STATEMENT_TIMEOUT_MS = 15000;

@Injectable()
export class ClickService {
  private readonly log = new Logger(ClickService.name);

  constructor(
        private readonly cards: ClickCardService,
@Inject(PG) private readonly sql: Sql,
    private readonly config: ClickConfig,
    private readonly orders: ClickOrdersRepository,
    private readonly plans: PlansRepository,
    private readonly subs: SubscriptionsRepository,
    private readonly subscriptions: SubscriptionsService,
    private readonly fiscal: ClickFiscalService,
    private readonly users: UsersRepository,
    private readonly outbox: EmailOutboxService,
    private readonly appConfig: ConfigService
  ) {}

  // ── User-facing ──────────────────────────────────────────────────────────

  // Plans a user can actually buy: active, premium tier, priced. Same filter
  // the retired P2P panel used, kept identical so the picker doesn't change
  // behaviour with the payment rail.
  async listPurchasablePlans(): Promise<PublicPlan[]> {
    const rows = await this.plans.findAll(/* includeInactive */ false);
    return rows
      .filter(
        (p) => p.tier === "premium" && p.price_minor !== null && p.currency !== null
      )
      .map(toPublicPlan);
  }

  // Create an order and hand back everything both payment buttons need.
  //
  // Nothing is granted here. The subscription appears only when Click's
  // Complete callback confirms the money moved.
  async createOrder(input: {
    userId: string;
    planId: string;
  }): Promise<ClickCheckoutHandle> {
    const core = this.config.core;
    if (!this.config.enabled || !core) {
      throw new ServiceUnavailableException(
        `online payments are not available (${this.config.configProblem() ?? "not configured"})`
      );
    }

    const plan = await this.plans.findById(input.planId);
    if (!plan || !plan.is_active) {
      throw new BadRequestException("unknown or inactive plan");
    }
    if (plan.tier !== "premium") {
      throw new BadRequestException("this plan is not purchasable");
    }
    if (plan.price_minor === null || plan.currency === null) {
      throw new BadRequestException("this plan has no price configured");
    }

    // An open-ended subscription (lifetime, or an admin grant with no expiry)
    // can't be extended - SubscriptionsService treats extend on ends_at=NULL as
    // a no-op, and a chained grant would start at a date that never arrives.
    // Taking money in that state would be charging for nothing, so we refuse
    // before any payment surface opens.
    const active = await this.subs.findActiveForUser(input.userId);
    if (active && active.ends_at === null) {
      throw new ConflictException(
        "you already have an open-ended premium subscription - there is nothing to extend"
      );
    }

    const merchantTransId = await this.generateMerchantTransId();

    const order = await this.orders.create({
      user_id: input.userId,
      plan_id: plan.id,
      merchant_trans_id: merchantTransId,
      amount_minor: plan.price_minor,
      currency: plan.currency,
      // Orders created while fiscalization is off are marked not_required so a
      // later config change doesn't retroactively sweep them into filing.
      fiscal_status: this.config.fiscalEnabled ? "pending" : "not_required",
      metadata: { plan_name: plan.name },
    });

    return this.toCheckoutHandle(order, core.merchantId, core.serviceId);
  }

  // Poll target for the return page. Scoped to the owner so one user can't read
  // another's order by guessing a uuid.
  async getOwnOrder(input: {
    userId: string;
    orderId: string;
  }): Promise<PublicClickOrder> {
    const order = await this.orders.findById(input.orderId);
    if (!order || order.user_id !== input.userId) {
      throw new NotFoundException("order not found");
    }
    return this.withCoverage(order);
  }

  async listMyOrders(userId: string): Promise<PublicClickOrder[]> {
    const rows = await this.orders.findByUser(userId);
    return Promise.all(rows.map((row) => this.withCoverage(row)));
  }

  // Turn an order row into its public shape, resolving coverage dates from the
  // linked subscription when the order is paid. Only paid orders carry a
  // subscription_id, so unpaid ones simply come back with null coverage - the
  // base mapper already defaults them, so this adds one lookup only where it
  // pays off.
  private async withCoverage(order: ClickOrderRow): Promise<PublicClickOrder> {
    const base = toPublicClickOrder(order);
    if (!order.subscription_id) return base;
    const sub = await this.subs.findById(order.subscription_id);
    if (!sub) return base;
    return {
      ...base,
      coverage_starts_at: sub.starts_at.toISOString(),
      // ends_at is null only for open-ended subscriptions, which Click orders
      // never produce (lifetime is refused at order-create), but guard anyway.
      coverage_ends_at: sub.ends_at ? sub.ends_at.toISOString() : null,
    };
  }

  private toCheckoutHandle(
    order: ClickOrderRow,
    merchantId: string,
    serviceId: string
  ): ClickCheckoutHandle {
    const amount = minorToClickAmount(order.amount_minor);
    const params = new URLSearchParams({
      service_id: serviceId,
      merchant_id: merchantId,
      amount,
      transaction_param: order.merchant_trans_id,
      return_url: this.config.returnUrlFor(order.id),
    });
    return {
      order_id: order.id,
      merchant_trans_id: order.merchant_trans_id,
      amount,
      amount_minor: order.amount_minor,
      currency: order.currency,
      plan_id: order.plan_id,
      merchant_id: merchantId,
      service_id: serviceId,
      pay_url: `${this.config.payUrlBase}?${params.toString()}`,
      checkout_js_url: this.config.checkoutJsUrl,
    };
  }

  // Opaque, short, URL-safe. Click echoes this back in every callback and it
  // ends up in a query string, so it stays alphanumeric. The DB has a UNIQUE
  // index; the retry loop covers the (vanishingly unlikely) collision so a
  // clash surfaces as a retry rather than a 500 in the user's face.
  // Delegates to the repository: auto-renewal mints ids too, and two copies of
  // the uniqueness loop would be two places to get it wrong.
  private async generateMerchantTransId(): Promise<string> {
    try {
      return await this.orders.generateMerchantTransId();
    } catch {
      throw new ServiceUnavailableException(
        "could not allocate a payment reference - please try again"
      );
    }
  }

  // ── Prepare (action = 0) ─────────────────────────────────────────────────

  async handlePrepare(
    body: ClickPrepareRequest
  ): Promise<CallbackOutcome<ClickPrepareResponse | ClickErrorResponse>> {
    const core = this.config.core;
    if (!core) {
      return this.reject(
        ClickError.ERROR_IN_REQUEST,
        "click_not_configured",
        null
      );
    }

    // Signature first, always. Nothing downstream may touch the database on
    // behalf of an unverified caller.
    const expected = buildPrepareSignString(
      {
        click_trans_id: body.click_trans_id,
        service_id: body.service_id,
        merchant_trans_id: body.merchant_trans_id,
        amount: body.amount,
        action: body.action,
        sign_time: body.sign_time,
      },
      core.secretKey
    );
    if (!verifySignString(expected, body.sign_string)) {
      return this.reject(ClickError.SIGN_CHECK_FAILED, "bad_sign", null);
    }

    if (Number(body.action) !== CLICK_ACTION_PREPARE) {
      return this.reject(ClickError.ACTION_NOT_FOUND, "wrong_action", null);
    }

    // Guard against a callback signed with our key but aimed at a different
    // service id - a misconfigured second service in the same cabinet.
    if (String(body.service_id) !== String(core.serviceId)) {
      return this.reject(
        ClickError.ERROR_IN_REQUEST,
        "service_id_mismatch",
        null
      );
    }

    const order = await this.orders.findByMerchantTransId(body.merchant_trans_id);
    if (!order) {
      return this.reject(
        ClickError.TRANSACTION_NOT_EXIST,
        "order_not_found",
        null
      );
    }

    const amountMinor = clickAmountToMinor(body.amount);
    if (amountMinor === null || amountMinor !== order.amount_minor) {
      return this.reject(
        ClickError.INCORRECT_AMOUNT,
        "amount_mismatch",
        order.id
      );
    }

    if (order.status === "paid") {
      return this.reject(ClickError.ALREADY_PAID, "already_paid", order.id);
    }
    if (order.status === "cancelled" || order.status === "failed") {
      return this.reject(
        ClickError.TRANSACTION_CANCELLED,
        `order_${order.status}`,
        order.id
      );
    }

    // Replay of a Prepare we already answered: same order, same Click
    // transaction. Return the merchant_prepare_id we minted the first time
    // instead of allocating a new one, otherwise Complete would arrive quoting
    // an id we no longer recognise.
    if (order.status === "prepared") {
      if (
        order.click_trans_id === String(body.click_trans_id) &&
        order.merchant_prepare_id !== null
      ) {
        return {
          response: {
            click_trans_id: Number(body.click_trans_id),
            merchant_trans_id: order.merchant_trans_id,
            merchant_prepare_id: Number(order.merchant_prepare_id),
            error: ClickError.SUCCESS,
            error_note: CLICK_ERROR_NOTES[ClickError.SUCCESS],
          },
          verdict: "prepare_replay",
          orderId: order.id,
        };
      }
      // A different Click transaction trying to prepare an order that is
      // already mid-payment. Refuse - two payment attempts must not converge on
      // one order.
      return this.reject(
        ClickError.TRANSACTION_CANCELLED,
        "order_already_prepared_by_other_txn",
        order.id
      );
    }

    const merchantPrepareId = await this.orders.nextMerchantPrepareId();
    const updated = await this.orders.markPrepared({
      id: order.id,
      click_trans_id: String(body.click_trans_id),
      click_paydoc_id: String(body.click_paydoc_id),
      merchant_prepare_id: merchantPrepareId,
    });
    if (!updated) {
      // Status guard didn't match - a concurrent Prepare won. Safe to refuse;
      // Click retries and hits the replay branch above.
      return this.reject(
        ClickError.TRANSACTION_CANCELLED,
        "prepare_race_lost",
        order.id
      );
    }

    return {
      response: {
        click_trans_id: Number(body.click_trans_id),
        merchant_trans_id: updated.merchant_trans_id,
        merchant_prepare_id: Number(merchantPrepareId),
        error: ClickError.SUCCESS,
        error_note: CLICK_ERROR_NOTES[ClickError.SUCCESS],
      },
      verdict: "prepared",
      orderId: updated.id,
    };
  }

  // ── Complete (action = 1) ────────────────────────────────────────────────

  async handleComplete(
    body: ClickCompleteRequest
  ): Promise<CallbackOutcome<ClickCompleteResponse | ClickErrorResponse>> {
    const core = this.config.core;
    if (!core) {
      return this.reject(
        ClickError.ERROR_IN_REQUEST,
        "click_not_configured",
        null
      );
    }

    const expected = buildCompleteSignString(
      {
        click_trans_id: body.click_trans_id,
        service_id: body.service_id,
        merchant_trans_id: body.merchant_trans_id,
        merchant_prepare_id: body.merchant_prepare_id,
        amount: body.amount,
        action: body.action,
        sign_time: body.sign_time,
      },
      core.secretKey
    );
    if (!verifySignString(expected, body.sign_string)) {
      return this.reject(ClickError.SIGN_CHECK_FAILED, "bad_sign", null);
    }

    if (Number(body.action) !== CLICK_ACTION_COMPLETE) {
      return this.reject(ClickError.ACTION_NOT_FOUND, "wrong_action", null);
    }
    if (String(body.service_id) !== String(core.serviceId)) {
      return this.reject(
        ClickError.ERROR_IN_REQUEST,
        "service_id_mismatch",
        null
      );
    }

    // Serialise everything touching this order behind an advisory lock keyed on
    // merchant_trans_id. Click retries Complete when it doesn't get a timely
    // answer, so two in-flight completions for one order is a real scenario,
    // and without this both could grant a subscription.
    //
    // The lock is transaction-scoped: it releases on commit/rollback, including
    // if this handler throws. SubscriptionsService.grant runs on its own pooled
    // connection and never contends for this key, so there is no deadlock path.
    return this.sql.begin(async (tx) => {
      // Fail fast rather than queue behind a stalled transaction.
      //
      // Click confirmed a 30-SECOND timeout on their side: if we have not
      // answered within 30s they hang up. But pg_advisory_xact_lock waits
      // FOREVER by default, so a contended lock would leave this handler
      // blocked long past that point - and worse, our transaction would carry
      // on and commit after Click had already given up, leaving them believing
      // the call failed while we recorded it as settled.
      //
      // With lock_timeout the contended case throws instead, Click gets an
      // error they can retry, and the two sides stay in agreement.
      // statement_timeout bounds the rest of the transaction for the same
      // reason. SET LOCAL scopes both to this transaction, so long-running
      // admin work (reseed, workbook import) on other connections is untouched.
      // sql.unsafe, not a template value: SET LOCAL does not accept a bound
      // parameter (`SET LOCAL lock_timeout = $1` is a syntax error), and
      // postgres.js binds every interpolated value. Both numbers are
      // compile-time constants, so there is nothing to inject.
      await tx.unsafe(`SET LOCAL lock_timeout = ${CALLBACK_LOCK_TIMEOUT_MS}`);
      await tx.unsafe(
        `SET LOCAL statement_timeout = ${CALLBACK_STATEMENT_TIMEOUT_MS}`
      );
      await tx`SELECT pg_advisory_xact_lock(hashtextextended(${body.merchant_trans_id}, 0))`;

      const order = await this.orders.findByMerchantTransId(
        body.merchant_trans_id,
        tx
      );
      if (!order) {
        return this.reject(
          ClickError.TRANSACTION_NOT_EXIST,
          "order_not_found",
          null
        );
      }

      // The prepare id Click quotes must be the one we issued. A mismatch means
      // this Complete belongs to a different payment attempt.
      if (
        order.merchant_prepare_id === null ||
        String(order.merchant_prepare_id) !== String(body.merchant_prepare_id)
      ) {
        return this.reject(
          ClickError.TRANSACTION_NOT_EXIST,
          "merchant_prepare_id_mismatch",
          order.id
        );
      }

      const amountMinor = clickAmountToMinor(body.amount);
      if (amountMinor === null || amountMinor !== order.amount_minor) {
        return this.reject(
          ClickError.INCORRECT_AMOUNT,
          "amount_mismatch",
          order.id
        );
      }

      // Idempotency: a repeat Complete for an order we already settled gets
      // ALREADY_PAID, never a second grant.
      if (order.status === "paid") {
        return this.reject(ClickError.ALREADY_PAID, "already_paid", order.id);
      }

      // Click reporting a failure on its side (card declined, user aborted,
      // reversal). Per their spec we cancel our side and answer -9.
      const clickError = Number(body.error);
      if (Number.isFinite(clickError) && clickError < 0) {
        await this.orders.markCancelled(
          {
            id: order.id,
            error_code: clickError,
            error_note: body.error_note ?? null,
          },
          tx
        );
        // The user attempted a payment and it was refused. Auto-renewal
        // declines are NOT sent this: they get renewal_failed from
        // ClickCardService, which says we charged a saved card and how to stop
        // that. Sending both for one decline would be two emails saying
        // different things about the same event.
        if (order.metadata?.auto_renew !== true) {
          void this.notifyPaymentFailed(order);
        }
        return this.reject(
          ClickError.TRANSACTION_CANCELLED,
          "cancelled_by_click",
          order.id
        );
      }

      if (order.status === "cancelled" || order.status === "failed") {
        return this.reject(
          ClickError.TRANSACTION_CANCELLED,
          `order_${order.status}`,
          order.id
        );
      }
      if (order.status !== "prepared") {
        // 'created' - Complete without a Prepare we recognise.
        return this.reject(
          ClickError.TRANSACTION_NOT_EXIST,
          "order_not_prepared",
          order.id
        );
      }

      // Money has moved. From here on, failures are OUR problem to reconcile,
      // never a reason to tell Click the payment failed.
      let subscriptionId: string;
      try {
        subscriptionId = await this.grantForOrder(order);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        await this.orders.markFailed(
          { id: order.id, error_note: `grant failed: ${message}` },
          tx
        );
        this.log.error(
          `PAYMENT TAKEN BUT NOT GRANTED - order ${order.id} (click_trans_id=${body.click_trans_id}, paydoc=${body.click_paydoc_id}): ${message}. Manual reconciliation required.`
        );
        // Click's spec: once funds are withdrawn the Complete response must not
        // be an error, or the payment hangs for their support team. We accept
        // the payment and carry the failure on our side where we can fix it.
        return {
          response: {
            click_trans_id: Number(body.click_trans_id),
            merchant_trans_id: order.merchant_trans_id,
            merchant_confirm_id: null,
            error: ClickError.SUCCESS,
            error_note: CLICK_ERROR_NOTES[ClickError.SUCCESS],
          },
          verdict: "paid_grant_failed",
          orderId: order.id,
        };
      }

      // merchant_confirm_id is ours to choose; reusing merchant_prepare_id
      // keeps the pair traceable in Click's cabinet.
      const confirmId = String(order.merchant_prepare_id);
      const paid = await this.orders.markPaid(
        {
          id: order.id,
          merchant_confirm_id: confirmId,
          subscription_id: subscriptionId,
        },
        tx
      );

      if (!paid) {
        // Should be unreachable under the advisory lock. If it ever fires, a
        // duplicate subscription exists - revoke it rather than leave a silent
        // double grant, and shout.
        this.log.error(
          `order ${order.id} lost the paid-transition race despite the advisory lock; revoking duplicate subscription ${subscriptionId}`
        );
        await this.safeRevoke(subscriptionId, order.id);
        return this.reject(ClickError.ALREADY_PAID, "already_paid", order.id);
      }

      // Fiscalization runs after the response, outside this transaction. It
      // must never delay or fail the answer to Click.
      if (paid.fiscal_status === "pending") {
        this.fiscal.fireAndForget(paid.id);
      }

      return {
        response: {
          click_trans_id: Number(body.click_trans_id),
          merchant_trans_id: paid.merchant_trans_id,
          merchant_confirm_id: Number(confirmId),
          error: ClickError.SUCCESS,
          error_note: CLICK_ERROR_NOTES[ClickError.SUCCESS],
        },
        verdict: "paid",
        orderId: paid.id,
      };
    });
  }

  // A user-initiated payment that Click refused. Queued rather than sent so
  // the Complete callback answers Click on time no matter what mail is doing.
  private async notifyPaymentFailed(order: ClickOrderRow): Promise<void> {
    try {
      const user = await this.users.findById(order.user_id);
      if (!user) return;
      const appUrl = this.appConfig
        .getOrThrow<string>("APP_PUBLIC_URL")
        .replace(/\/$/, "");
      const planName =
        typeof order.metadata?.plan_name === "string"
          ? order.metadata.plan_name
          : "Finshark Premium";
      await this.outbox.enqueue({
        templateKey: "payment_failed",
        to: user.email,
        lang: "en",
        variables: {
          display_name: user.display_name,
          plan_name: planName,
          app_url: appUrl,
        },
        context: `click order ${order.id} declined`,
      });
    } catch (e) {
      this.log.warn(
        `payment_failed enqueue failed for order ${order.id}: ${
          e instanceof Error ? e.message : String(e)
        }`
      );
    }
  }

  // Financial record for a completed payment. Queued like every other
  // transactional email, so a mail outage defers it rather than losing it.
  private async notifyPaymentReceipt(
    order: ClickOrderRow,
    endsAt: Date | null
  ): Promise<void> {
    try {
      const user = await this.users.findById(order.user_id);
      if (!user) return;
      const appUrl = this.appConfig
        .getOrThrow<string>("APP_PUBLIC_URL")
        .replace(/\/$/, "");
      const planName =
        typeof order.metadata?.plan_name === "string"
          ? order.metadata.plan_name
          : "Finshark Premium";

      const fmtDate = (d: Date) =>
        d.toLocaleDateString("en-US", {
          year: "numeric",
          month: "short",
          day: "numeric",
          timeZone: "UTC",
        });

      await this.outbox.enqueue({
        templateKey: "payment_receipt",
        to: user.email,
        lang: "en",
        variables: {
          display_name: user.display_name,
          plan_name: planName,
          // amount_minor is in tiyin; group thousands so 100000 reads as
          // "1,000 UZS" rather than an unreadable run of digits.
          amount: `${new Intl.NumberFormat("en-US", {
            maximumFractionDigits: 2,
          }).format(order.amount_minor / 100)} ${order.currency}`,
          paid_on: fmtDate(order.paid_at ?? new Date()),
          // merchant_trans_id, not the internal UUID: this is the reference
          // Click support and the fiscal receipt both use.
          order_number: order.merchant_trans_id,
          ends_on: endsAt === null ? "further notice" : fmtDate(endsAt),
          app_url: appUrl,
        },
        context: `receipt for click order ${order.id}`,
      });
    } catch (e) {
      this.log.warn(
        `payment_receipt enqueue failed for order ${order.id}: ${
          e instanceof Error ? e.message : String(e)
        }`
      );
    }
  }

  // Chained grant: one subscription row per payment, but the new period starts
  // where the current one ends rather than at NOW(). Buying twice in a week
  // therefore stacks two full periods instead of overlapping them and burning
  // paid days.
  //
  // Open-ended active subscriptions are refused at order-create time, so the
  // ends_at read here is always a real date when a subscription exists.
  private async grantForOrder(order: ClickOrderRow): Promise<string> {
    const now = new Date();
    // Orders opened by the renewal sweep carry this marker. They get
    // renewal_succeeded instead of premium_granted: the user did not press
    // anything, so the email has to say we charged a saved card and how to
    // turn that off.
    const isAutoRenewal = order.metadata?.auto_renew === true;
    const active = await this.subs.findActiveForUser(order.user_id);
    const startsAt =
      active && active.ends_at !== null && active.ends_at > now
        ? active.ends_at
        : now;

    const sub = await this.subscriptions.grant({
      userId: order.user_id,
      planId: order.plan_id,
      source: "click",
      sourceRef: order.click_trans_id
        ? `click_trans_id:${order.click_trans_id}`
        : `click_order:${order.id}`,
      startsAt,
      reason: isAutoRenewal
        ? "Click auto-renewal completed"
        : "Click payment completed",
      suppressNotification: isAutoRenewal,
      metadata: {
        origin: "click",
        order_id: order.id,
        merchant_trans_id: order.merchant_trans_id,
        click_trans_id: order.click_trans_id,
        click_paydoc_id: order.click_paydoc_id,
        amount_minor: order.amount_minor,
        currency: order.currency,
        ...(startsAt > now ? { chained_from: active?.id ?? null } : {}),
      },
    });

    if (isAutoRenewal) {
      void this.cards.notifyRenewalSucceeded(order.user_id, sub.ends_at);
    }

    // Receipt goes out for EVERY paid order, regardless of which path produced
    // it. The other emails describe what happened to the subscription; this one
    // is the financial record - amount, date, order number.
    void this.notifyPaymentReceipt(order, sub.ends_at);
    // First payment of a subscription: the order asked for renewal to be on,
    // and only now does a subscription row exist to set it on.
    if (order.metadata?.enable_auto_renew === true) {
      void this.cards.enableAutoRenewForNewSubscription({
        userId: order.user_id,
        subscriptionId: sub.id,
      });
    }
    return sub.id;
  }

  private async safeRevoke(subscriptionId: string, orderId: string): Promise<void> {
    try {
      await this.subscriptions.revoke({
        subscriptionId,
        reason: `duplicate grant for click order ${orderId}`,
      });
    } catch (e) {
      this.log.error(
        `failed to revoke duplicate subscription ${subscriptionId}: ${
          e instanceof Error ? e.message : String(e)
        }`
      );
    }
  }

  private reject(
    code: number,
    verdict: string,
    orderId: string | null
  ): CallbackOutcome<ClickErrorResponse> {
    return {
      response: {
        error: code,
        error_note: CLICK_ERROR_NOTES[code] ?? "Error",
      },
      verdict,
      orderId,
    };
  }
}
