import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Cron } from "@nestjs/schedule";
import { UsersRepository } from "../users/users.repository";
import { EmailService } from "../email/email.service";
import { EmailTemplatesService } from "../email/email-templates.service";
import { ReminderEmailsSentRepository } from "./reminder-emails-sent.repository";
import { UnsubscribeTokens } from "./unsubscribe.tokens";
import { toUtcDateOnly } from "../lessons/srs";
import type { UserRow } from "../users/user.types";

// Default cron: hourly. Each run picks up users whose current local hour
// (computed from `reminder_hour_local` + their IANA `timezone`) matches the
// real-world wall-clock hour in that timezone. Override via REMINDER_CRON env.
// The @Cron decorator's expression is evaluated at class-load time, so we read
// the env value at the top of the file. To DISABLE entirely, set REMINDER_CRON
// to an obviously-impossible-but-valid expression like '0 0 31 2 *' (Feb 31),
// or comment out the @Cron decorator below before building.
//
// History: started as '0 18 * * *' (single global UTC hour) → '0 * * * *'
// when per-user `reminder_hour_utc` was introduced → still '0 * * * *' but
// now interpreting the stored hour in the user's timezone after the
// 20260526000001 rename.
const CRON_EXPR = process.env.REMINDER_CRON?.trim() || "0 * * * *";

// Current wall-clock hour (0..23) in the given IANA timezone. Uses
// Intl.DateTimeFormat so DST and offset edges are handled correctly without
// us doing any date math. An invalid timezone string would throw - we treat
// users with bad timezone data as "skip this hour" rather than crash the cron
// (the value is validated on write but we don't trust historical rows).
function currentHourInTimezone(tz: string, now: Date = new Date()): number | null {
  try {
    const fmt = new Intl.DateTimeFormat("en-GB", {
      timeZone: tz,
      hour: "2-digit",
      hour12: false,
    });
    // en-GB returns "HH" for the hour part; parseInt drops any leading zero.
    return parseInt(fmt.format(now), 10);
  } catch {
    return null;
  }
}

@Injectable()
export class RemindersService {
  private readonly log = new Logger(RemindersService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly users: UsersRepository,
    private readonly email: EmailService,
    private readonly templates: EmailTemplatesService,
    private readonly sent: ReminderEmailsSentRepository,
    private readonly tokens: UnsubscribeTokens
  ) {}

  // The decorator argument is read once at import time.
  @Cron(CRON_EXPR, { name: "daily-reminder-emails" })
  async runScheduled(): Promise<void> {
    await this.runOnce();
  }

  // Public for testability + manual triggering from an admin endpoint.
  // When called from the cron we keep users whose `reminder_hour_local`
  // matches the current wall-clock hour in their timezone. When called from
  // the admin trigger we bypass that filter (admin probably wants to test
  // the whole pipeline).
  async runOnce(opts?: {
    allHours?: boolean;
  }): Promise<{ sent: number; skipped: number; failed: number }> {
    const today = toUtcDateOnly(new Date());
    const allRecipients = await this.users.findReminderRecipients(today);
    const now = new Date();
    const recipients = opts?.allHours
      ? allRecipients
      : allRecipients.filter((u) => {
          const hourLocal = currentHourInTimezone(u.timezone, now);
          return hourLocal !== null && hourLocal === u.reminder_hour_local;
        });

    let sent = 0;
    let skipped = 0;
    let failed = 0;

    for (const u of recipients) {
      // tryClaim: race-safe dedup via (user_id, reminder_date) PK.
      const claimed = await this.sent.tryClaim(u.id, today);
      if (!claimed) {
        skipped++;
        continue;
      }
      try {
        // Prefer the DB-backed template so admins can tune copy from the
        // admin panel without a redeploy. Two keys correspond to the two
        // copy variants (with/without streak). If the template is missing
        // or disabled, fall back to the hard-coded body - we'd rather ship
        // a slightly-stale reminder than skip the user entirely.
        const templateKey =
          u.streak_count >= 2 ? "reminder_daily_streak" : "reminder_daily";
        const variables = this.templateVarsFor(u);
        const used = await this.templates.sendByTemplate({
          templateKey,
          to: u.email,
          // We don't track preferred reminder language explicitly yet - the
          // template falls back to EN when subject_ru/body_ru are NULL, which
          // is the safe default for a global EN-first product.
          lang: "en",
          variables,
        });
        if (!used) {
          // Fallback path: hard-coded copy (the original implementation).
          // Kept so a deleted/disabled template can't break the cron.
          await this.email.send({
            to: u.email,
            from: this.config.getOrThrow<string>("EMAIL_FROM"),
            subject: this.subjectFor(u),
            text: this.bodyFor(u),
          });
        }
        sent++;
      } catch (err) {
        // Don't try to "un-claim" - better to skip this user today than risk doubles
        // if the send actually succeeded but our connection dropped on the response.
        // The next day they'll be eligible again if still inactive.
        failed++;
        this.log.error(
          `failed to send reminder to user ${u.id}: ${(err as Error).message}`
        );
      }
    }

    this.log.log(
      `reminder run finished: sent=${sent} skipped=${skipped} failed=${failed} (provider=${
        this.email.isRealProvider() ? "real" : "log"
      })`
    );
    return { sent, skipped, failed };
  }

  // ---- email content ----

  // Variable map handed to EmailTemplatesService. Mirrors the placeholders
  // documented on the two reminder templates' `variables` jsonb column
  // (display_name / streak / app_url / unsubscribe_url). The unsubscribe
  // URL embeds a signed token so the link works without an auth session.
  private templateVarsFor(u: UserRow): Record<string, string | number> {
    const appUrl = this.config
      .getOrThrow<string>("APP_PUBLIC_URL")
      .replace(/\/$/, "");
    const unsubToken = this.tokens.sign(u.id);
    const unsubUrl = `${appUrl}/unsubscribe?token=${encodeURIComponent(
      unsubToken
    )}`;
    return {
      display_name: u.display_name,
      streak: u.streak_count,
      app_url: appUrl,
      unsubscribe_url: unsubUrl,
    };
  }

  private subjectFor(u: UserRow): string {
    if (u.streak_count >= 2)
      return `🔥 Keep your ${u.streak_count}-day ACCA streak`;
    return `Time for today's ACCA lesson`;
  }

  private bodyFor(u: UserRow): string {
    const appUrl = this.config
      .getOrThrow<string>("APP_PUBLIC_URL")
      .replace(/\/$/, "");
    const unsubToken = this.tokens.sign(u.id);
    const unsubUrl = `${appUrl}/unsubscribe?token=${encodeURIComponent(
      unsubToken
    )}`;

    const streakLine =
      u.streak_count >= 2
        ? `You're on a ${u.streak_count}-day streak. Don't break it today.`
        : `Ten minutes of practice goes a long way.`;

    return [
      `Hi ${u.display_name},`,
      ``,
      streakLine,
      ``,
      `Pick up where you left off: ${appUrl}/dashboard`,
      ``,
      `- Finshark`,
      ``,
      `--`,
      `Don't want these emails? Unsubscribe: ${unsubUrl}`,
    ].join("\n");
  }
}
