import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { ConfigService } from "@nestjs/config";
import { EmailOutboxService } from "../../email/email-outbox.service";
import { UsersRepository } from "../../users/users.repository";
import { ClickConfig } from "./click.config";
import { ClickOrdersRepository } from "./click-orders.repository";

// Closes out Click orders the user opened and never completed.
//
// Why this exists: before it, the only scheduled job in the Click module was
// the fiscal retry sweep. Nothing ever touched order STATUS, so an order that
// reached 'prepared' and never received a Complete stayed 'prepared'
// permanently. Three consequences, all of which only show up under real
// traffic:
//
//   1. Prepare deliberately refuses to let a second payment attempt converge on
//      an order that is already prepared (see click.service, the
//      'order_already_prepared_by_other_txn' branch). Correct on its own, but
//      combined with nothing ever expiring the old row it meant a user who
//      abandoned a checkout could be stuck against their own dead order.
//   2. The admin order queue filled with permanently-pending rows and no way to
//      tell "in flight right now" from "dead three weeks ago".
//   3. Any future reporting on conversion would count abandoned attempts as
//      still-open forever.
//
// What it deliberately does NOT do:
//
//   - It does not talk to Click. We only close our own side. Click's own
//     transaction timeout governs whether the customer is charged, and second
//     -guessing that from here would be worse than leaving it alone.
//   - It does not touch 'paid', 'cancelled' or 'failed' orders. Terminal is
//     terminal.
//   - It does not re-open or refund anything. A swept order is a dead attempt,
//     not a reversal.
//
// Ordering hazard worth understanding before changing the windows: if we expire
// a 'prepared' order and a Complete arrives afterwards, click.service answers
// TRANSACTION_CANCELLED and Click reverses on their side. That is the safe
// direction (the customer gets their money back rather than paying for nothing)
// but it is still a bad experience, which is why the prepared window defaults
// to 24h - comfortably beyond any plausible Click transaction lifetime. Shorten
// it only once Click have confirmed their actual timeout.

const SWEEP_BATCH_SIZE = 50;

@Injectable()
export class ClickOrderExpiryService {
  private readonly log = new Logger(ClickOrderExpiryService.name);

  constructor(
    private readonly config: ClickConfig,
    private readonly orders: ClickOrdersRepository,
    private readonly users: UsersRepository,
    private readonly outbox: EmailOutboxService,
    private readonly appConfig: ConfigService
  ) {}

  // Every 15 minutes. The windows are measured in hours, so the sweep cadence
  // only controls how promptly a dead order is tidied, not correctness.
  @Cron(CronExpression.EVERY_30_MINUTES, { name: "click-order-expiry" })
  async sweep(): Promise<void> {
    // Nothing to sweep when the integration is dormant - no orders can be
    // created in that state, and running the query anyway would just be noise
    // in the logs of every environment that has Click switched off.
    if (!this.config.enabled) return;

    const createdTtlMinutes = this.config.orderCreatedTtlMinutes;
    const preparedTtlMinutes = this.config.orderPreparedTtlMinutes;

    let candidates;
    try {
      candidates = await this.orders.findExpirableOrders({
        createdTtlMinutes,
        preparedTtlMinutes,
        limit: SWEEP_BATCH_SIZE,
      });
    } catch (e) {
      this.log.error(
        `expiry sweep query failed: ${e instanceof Error ? e.message : String(e)}`
      );
      return;
    }
    if (candidates.length === 0) return;

    let expired = 0;
    let skipped = 0;
    for (const order of candidates) {
      // The note distinguishes a swept order from one Click cancelled, so the
      // admin panel can tell "the user walked away" from "the card declined".
      const note =
        order.status === "created"
          ? `expired: no payment attempt within ${createdTtlMinutes}m`
          : `expired: prepared but never completed within ${preparedTtlMinutes}m`;
      try {
        const updated = await this.orders.expireOrder({
          id: order.id,
          merchantTransId: order.merchant_trans_id,
          createdTtlMinutes,
          preparedTtlMinutes,
          errorNote: note,
        });
        // null means the row settled between our SELECT and the locked UPDATE -
        // a Complete landed in the gap. Expected under load, not an error.
        if (updated) {
          expired++;
          // Only 'created' orders get the email. A 'prepared' order may still
          // have money moving on Click's side - telling that user nothing was
          // charged could be wrong, and a wrong reassurance about money is
          // worse than silence.
          if (order.status === "created") {
            void this.notifyAbandoned(order);
          }
        } else skipped++;
      } catch (e) {
        // One bad row must not abort the batch.
        this.log.error(
          `failed to expire order ${order.id}: ${
            e instanceof Error ? e.message : String(e)
          }`
        );
      }
    }

    if (expired > 0 || skipped > 0) {
      this.log.log(
        `order expiry sweep: ${expired} expired, ${skipped} settled mid-sweep`
      );
    }
  }

  // Queued, never sent inline: the sweep must finish its batch regardless of
  // what the mail path is doing. Failures are logged and swallowed, and the
  // outbox owns retry from there.
  private async notifyAbandoned(order: {
    id: string;
    user_id: string;
    metadata?: Record<string, unknown> | null;
  }): Promise<void> {
    try {
      const user = await this.users.findById(order.user_id);
      if (!user) return;
      const appUrl = this.appConfig
        .getOrThrow<string>("APP_PUBLIC_URL")
        .replace(/\/$/, "");
      // plan_name is written onto the order at creation time by both the
      // hosted-checkout and renewal paths. Falling back to a generic label
      // rather than inventing a plan name if it is ever absent.
      const planName =
        typeof order.metadata?.plan_name === "string"
          ? order.metadata.plan_name
          : "Finshark Premium";
      await this.outbox.enqueue({
        templateKey: "checkout_abandoned",
        to: user.email,
        lang: "en",
        variables: {
          display_name: user.display_name,
          plan_name: planName,
          app_url: appUrl,
        },
        context: `click order ${order.id} abandoned`,
      });
    } catch (e) {
      this.log.warn(
        `checkout_abandoned enqueue failed for order ${order.id}: ${
          e instanceof Error ? e.message : String(e)
        }`
      );
    }
  }
}
