import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { UsersRepository } from '../users/users.repository';
import { EmailService } from '../email/email.service';
import { ReminderEmailsSentRepository } from './reminder-emails-sent.repository';
import { UnsubscribeTokens } from './unsubscribe.tokens';
import { toUtcDateOnly } from '../lessons/srs';
import type { UserRow } from '../users/user.types';

// Default cron: hourly. Each run picks up users whose reminder_hour_utc
// matches the current UTC hour. Override via REMINDER_CRON env.
// The @Cron decorator's expression is evaluated at class-load time, so we read
// the env value at the top of the file. To DISABLE entirely, set REMINDER_CRON
// to an obviously-impossible-but-valid expression like '0 0 31 2 *' (Feb 31),
// or comment out the @Cron decorator below before building.
//
// Note: changed from '0 18 * * *' to '0 * * * *' when per-user reminder hours
// were introduced. If you want every user to receive their email at the same
// fixed hour regardless of their preference, override REMINDER_CRON and remove
// the hour filter in runOnce (or simply set everyone's reminder_hour_utc to
// the chosen hour via SQL).
const CRON_EXPR = process.env.REMINDER_CRON?.trim() || '0 * * * *';

@Injectable()
export class RemindersService {
  private readonly log = new Logger(RemindersService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly users: UsersRepository,
    private readonly email: EmailService,
    private readonly sent: ReminderEmailsSentRepository,
    private readonly tokens: UnsubscribeTokens,
  ) {}

  // The decorator argument is read once at import time.
  @Cron(CRON_EXPR, { name: 'daily-reminder-emails' })
  async runScheduled(): Promise<void> {
    await this.runOnce();
  }

  // Public for testability + manual triggering from an admin endpoint.
  // When called from the cron we filter to users whose reminder_hour_utc
  // matches the current UTC hour. When called from the admin trigger we
  // bypass that filter (admin probably wants to test the whole pipeline).
  async runOnce(opts?: { allHours?: boolean }): Promise<{ sent: number; skipped: number; failed: number }> {
    const today = toUtcDateOnly(new Date());
    const allRecipients = await this.users.findReminderRecipients(today);
    const currentHour = new Date().getUTCHours();
    const recipients = opts?.allHours
      ? allRecipients
      : allRecipients.filter((u) => u.reminder_hour_utc === currentHour);

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
        await this.email.send({
          to: u.email,
          from: this.config.getOrThrow<string>('EMAIL_FROM'),
          subject: this.subjectFor(u),
          text: this.bodyFor(u),
        });
        sent++;
      } catch (err) {
        // Don't try to "un-claim" — better to skip this user today than risk doubles
        // if the send actually succeeded but our connection dropped on the response.
        // The next day they'll be eligible again if still inactive.
        failed++;
        this.log.error(
          `failed to send reminder to user ${u.id}: ${(err as Error).message}`,
        );
      }
    }

    this.log.log(
      `reminder run finished: sent=${sent} skipped=${skipped} failed=${failed} (provider=${this.email.isRealProvider() ? 'real' : 'log'})`,
    );
    return { sent, skipped, failed };
  }

  // ---- email content ----

  private subjectFor(u: UserRow): string {
    if (u.streak_count >= 2) return `🔥 Keep your ${u.streak_count}-day ACCA streak`;
    return `Time for today's ACCA lesson`;
  }

  private bodyFor(u: UserRow): string {
    const appUrl = this.config.getOrThrow<string>('APP_PUBLIC_URL').replace(/\/$/, '');
    const unsubToken = this.tokens.sign(u.id);
    const unsubUrl = `${appUrl}/unsubscribe?token=${encodeURIComponent(unsubToken)}`;

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
      `— ACCA Duo`,
      ``,
      `--`,
      `Don't want these emails? Unsubscribe: ${unsubUrl}`,
    ].join('\n');
  }
}
