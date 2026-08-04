import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";
import { EmailTemplatesService } from "../email/email-templates.service";
import { SubscriptionsRepository } from "./subscriptions.repository";

// Warns users whose premium is about to lapse.
//
// This is the counterpart to auto-renewal, not a duplicate of it. Anyone with
// auto_renew ON is excluded by the query: they are being charged, and telling
// them their access is ending would be both wrong and alarming. The warning is
// for people who chose prepaid, which - given card behaviour in Uzbekistan and
// study patterns around exam sittings - will be most of them.
//
// The subscription_expiring template has existed since the original billing
// migration with the note "NOT wired to a cron yet - future epic". This is that
// wiring; the template is used as-is.
//
// WARN_DAYS_BEFORE is 7, matching what the template's copy already promises.
// Changing it means changing the seeded body text too.

const WARN_DAYS_BEFORE = 7;
const SWEEP_BATCH_SIZE = 200;

@Injectable()
export class SubscriptionExpiryService {
  private readonly log = new Logger(SubscriptionExpiryService.name);

  constructor(
    private readonly subs: SubscriptionsRepository,
    private readonly templates: EmailTemplatesService,
    private readonly config: ConfigService
  ) {}

  // Daily rather than hourly: the warning is a date-granularity event, and an
  // hourly sweep would only add 23 no-op queries a day. 09:00 UTC is inside
  // working hours across Central Asia.
  @Cron("0 9 * * *", { name: "subscription-expiry-warnings" })
  async runScheduled(): Promise<void> {
    await this.runOnce();
  }

  // Public so an admin endpoint can trigger it without waiting a day.
  async runOnce(): Promise<{ sent: number; failed: number }> {
    let due;
    try {
      due = await this.subs.findExpiringForWarning({
        days: WARN_DAYS_BEFORE,
        limit: SWEEP_BATCH_SIZE,
      });
    } catch (e) {
      this.log.error(
        `expiry warning query failed: ${e instanceof Error ? e.message : String(e)}`
      );
      return { sent: 0, failed: 0 };
    }
    if (due.length === 0) return { sent: 0, failed: 0 };

    const appUrl = this.config
      .getOrThrow<string>("APP_PUBLIC_URL")
      .replace(/\/$/, "");

    let sent = 0;
    let failed = 0;
    for (const row of due) {
      // Mark BEFORE sending. If the process dies mid-send the user loses one
      // warning; marking afterwards would re-select the same row on the next
      // run and mail them repeatedly. A missed warning is recoverable, a mail
      // loop is not.
      try {
        await this.subs.markExpiryWarned(row.id);
      } catch (e) {
        failed++;
        this.log.error(
          `could not mark subscription ${row.id} warned: ${
            e instanceof Error ? e.message : String(e)
          }`
        );
        continue;
      }

      const daysLeft = Math.max(
        1,
        Math.ceil((row.ends_at.getTime() - Date.now()) / 86_400_000)
      );

      try {
        await this.templates.sendByTemplate({
          templateKey: "subscription_expiring",
          to: row.email,
          lang: "en",
          variables: {
            display_name: row.display_name,
            days_left: daysLeft,
            ends_on: row.ends_at.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              timeZone: "UTC",
            }),
            app_url: appUrl,
          },
        });
        sent++;
      } catch (e) {
        failed++;
        this.log.warn(
          `expiry warning to ${row.email} failed: ${
            e instanceof Error ? e.message : String(e)
          }`
        );
      }
    }

    this.log.log(`expiry warnings: ${sent} sent, ${failed} failed`);
    return { sent, failed };
  }
}
