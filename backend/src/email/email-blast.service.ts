import { BadRequestException, Inject, Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as jwt from "jsonwebtoken";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";
import { EmailTemplatesService } from "./email-templates.service";

// Manual email blasts triggered by an admin. Distinct from the
// reminders.service cron path:
//   - the reminder cron is on a schedule and picks recipients by activity;
//     this is a one-shot blast keyed to an admin's "send this template to X
//     users now" decision.
//   - reminders are dedup'd per (user, date) via reminder_emails_sent;
//     blasts intentionally don't dedup - an admin sending the same template
//     twice in a row should send twice. Use the audience filter to scope
//     intent.
//
// Per-user substitution: each recipient gets their own personalised
// variables (display_name, streak, app_url, unsubscribe_url, etc.). Any
// variable the admin supplies at the call site (extra_variables) overrides
// the per-user ones for that key.

export type BlastAudience =
  | "all"
  | "premium"
  | "free"
  | "reminders_enabled"
  | "ids";

// The single source of truth for which variables an email template may use.
// The admin editor renders this as an insert-palette ("click to add
// {{streak}}"), and the preview/blast resolve each key per-recipient. Adding a
// variable here + wiring it in buildUserVariables() makes it available
// everywhere; nothing else needs to change. `sample` is what the preview uses
// when no concrete user is selected, so the admin still sees a realistic
// render. Descriptions are i18n KEYS (admin.email_templates.var_desc_*) the
// frontend localises - we keep the catalogue itself language-neutral.
export interface EmailVariableDef {
  key: string;
  // i18n key for the human description shown in the editor palette.
  desc_key: string;
  // Placeholder value used in previews when no real user is chosen.
  sample: string | number;
}

export const EMAIL_VARIABLE_CATALOGUE: EmailVariableDef[] = [
  { key: "display_name", desc_key: "admin.email_templates.var_desc_display_name", sample: "Alex" },
  { key: "email", desc_key: "admin.email_templates.var_desc_email", sample: "alex@example.com" },
  { key: "streak", desc_key: "admin.email_templates.var_desc_streak", sample: 12 },
  { key: "xp", desc_key: "admin.email_templates.var_desc_xp", sample: 3400 },
  { key: "level", desc_key: "admin.email_templates.var_desc_level", sample: 7 },
  { key: "premium_status", desc_key: "admin.email_templates.var_desc_premium_status", sample: "premium" },
  { key: "current_plan", desc_key: "admin.email_templates.var_desc_current_plan", sample: "premium_yearly" },
  { key: "streak_freezes_remaining", desc_key: "admin.email_templates.var_desc_streak_freezes", sample: 2 },
  { key: "timezone", desc_key: "admin.email_templates.var_desc_timezone", sample: "Asia/Tashkent" },
  { key: "reminder_hour_local", desc_key: "admin.email_templates.var_desc_reminder_hour", sample: 19 },
  { key: "app_url", desc_key: "admin.email_templates.var_desc_app_url", sample: "https://app.example.com" },
  { key: "unsubscribe_url", desc_key: "admin.email_templates.var_desc_unsubscribe_url", sample: "https://app.example.com/unsubscribe?token=…" },
];

export interface BlastInput {
  templateKey: string;
  audience: BlastAudience;
  // Required when audience='ids'. Otherwise ignored.
  user_ids?: string[];
  lang?: "en" | "ru";
  // Admin-supplied additional variables merged into each recipient's
  // computed variable map. Override per-user values for the same key.
  extra_variables?: Record<string, string | number>;
  // When true, ignore the `email_reminders_enabled` opt-out flag. Reserved
  // for legally-required transactional emails (e.g. account closure,
  // billing receipts). Default false - operational blasts respect opt-out.
  ignore_opt_out?: boolean;
  // Cap per-call to protect against accidental "send to everyone" clicks.
  // The endpoint surfaces this as an error rather than silently truncating.
  max_recipients?: number;
}

export interface BlastResult {
  recipients_targeted: number;
  sent: number;
  skipped_opt_out: number;
  failed: number;
  // First ~10 recipient emails (for the admin confirmation UI). Truncated
  // server-side so a 500-user blast doesn't dump the whole list back.
  sample_recipients: string[];
}

// ~10 messages per second per node. Tunable via env if a future SMTP
// provider has a stricter limit. We sleep BETWEEN sends rather than batching
// because most providers throttle on per-message basis.
const DEFAULT_SEND_INTERVAL_MS = 100;
const MAX_PER_BLAST_DEFAULT = 5000;

interface RecipientRow {
  id: string;
  email: string;
  display_name: string;
  email_reminders_enabled: boolean;
  streak_count: number;
  xp: number;
  level: number;
  timezone: string;
  reminder_hour_local: number;
  // From a LEFT JOIN on the active subscription (null when the user is free).
  // Drive the premium_status / current_plan template variables.
  active_plan_id: string | null;
  // streak_freezes_remaining is a plain users column; include for the
  // {{streak_freezes_remaining}} variable.
  streak_freezes_remaining: number;
}

@Injectable()
export class EmailBlastService {
  private readonly log = new Logger(EmailBlastService.name);

  constructor(
    @Inject(PG) private readonly sql: Sql,
    private readonly templates: EmailTemplatesService,
    private readonly config: ConfigService
  ) {}

  async run(input: BlastInput): Promise<BlastResult> {
    const audience = input.audience;
    const cap = input.max_recipients ?? MAX_PER_BLAST_DEFAULT;
    const recipients = await this.findRecipients(audience, input.user_ids);
    if (recipients.length > cap) {
      throw new BadRequestException(
        `audience exceeds the per-blast cap (${recipients.length} > ${cap}). Tighten the filter or raise max_recipients.`
      );
    }

    let sent = 0;
    let skippedOptOut = 0;
    let failed = 0;
    const sampleRecipients: string[] = [];

    const appUrl = this.config
      .getOrThrow<string>("APP_PUBLIC_URL")
      .replace(/\/$/, "");
    const unsubSecret = this.config.getOrThrow<string>("UNSUBSCRIBE_SECRET");

    for (const r of recipients) {
      // Opt-out gate. The reminder cron also enforces this via its own
      // findReminderRecipients query, but the blast surface is broader -
      // we re-check here so an admin can't accidentally skip the check by
      // selecting audience='all'.
      if (!input.ignore_opt_out && !r.email_reminders_enabled) {
        skippedOptOut++;
        continue;
      }

      const unsubToken = jwt.sign(
        { sub: r.id, purpose: "unsub" },
        unsubSecret
      );
      const unsubUrl = `${appUrl}/unsubscribe?token=${encodeURIComponent(
        unsubToken
      )}`;

      const variables: Record<string, string | number> = {
        ...this.buildUserVariables(r, appUrl, unsubUrl),
        // Admin-supplied vars win - they're the "global" customisation for
        // this blast (e.g. campaign-specific copy slot).
        ...(input.extra_variables ?? {}),
      };

      try {
        const ok = await this.templates.sendByTemplate({
          templateKey: input.templateKey,
          to: r.email,
          lang: input.lang ?? "en",
          variables,
        });
        if (ok) {
          sent++;
          if (sampleRecipients.length < 10) sampleRecipients.push(r.email);
        } else {
          // Template missing/inactive - log once and stop. Continuing would
          // just spam the same warning per recipient.
          this.log.error(
            `blast aborted: template "${input.templateKey}" not active`
          );
          throw new BadRequestException(
            `template "${input.templateKey}" not found or inactive`
          );
        }
      } catch (e) {
        failed++;
        this.log.error(
          `blast send failed to ${r.email}: ${(e as Error).message}`
        );
      }

      // Throttle between sends. setTimeout is fine here; the controller
      // request is async-await all the way down.
      await sleep(DEFAULT_SEND_INTERVAL_MS);
    }

    this.log.log(
      `blast finished: template=${input.templateKey} audience=${audience} ` +
        `targeted=${recipients.length} sent=${sent} skipped_opt_out=${skippedOptOut} failed=${failed}`
    );

    return {
      recipients_targeted: recipients.length,
      sent,
      skipped_opt_out: skippedOptOut,
      failed,
      sample_recipients: sampleRecipients,
    };
  }

  // Resolve the full per-recipient variable map from a recipient row. The
  // single place that maps DB columns → template variable names, so the blast
  // and the admin preview render identically. Keep in sync with
  // EMAIL_VARIABLE_CATALOGUE above (every catalogue key should be produced
  // here).
  private buildUserVariables(
    r: RecipientRow,
    appUrl: string,
    unsubUrl: string
  ): Record<string, string | number> {
    return {
      display_name: r.display_name,
      email: r.email,
      streak: r.streak_count,
      xp: r.xp,
      level: r.level,
      premium_status: r.active_plan_id ? "premium" : "free",
      current_plan: r.active_plan_id ?? "free",
      streak_freezes_remaining: r.streak_freezes_remaining,
      timezone: r.timezone,
      reminder_hour_local: r.reminder_hour_local,
      app_url: appUrl,
      unsubscribe_url: unsubUrl,
    };
  }

  // Build the variable map for a PREVIEW (dry-run, no send). If a user_id is
  // given, resolve that user's real values via the same path the blast uses,
  // so the admin sees exactly what that recipient would get. With no user_id,
  // fall back to the catalogue's sample values so the preview still renders
  // realistically. Admin-supplied extra_variables override either way.
  async previewVariables(opts: {
    user_id?: string;
    extra_variables?: Record<string, string | number>;
  }): Promise<Record<string, string | number>> {
    const appUrl = this.config
      .getOrThrow<string>("APP_PUBLIC_URL")
      .replace(/\/$/, "");

    let base: Record<string, string | number>;
    if (opts.user_id) {
      const rows = await this.findRecipients("ids", [opts.user_id]);
      const r = rows[0];
      if (r) {
        // A throwaway unsubscribe URL so the preview shows a real-shaped link
        // without minting/persisting anything meaningful.
        const unsubUrl = `${appUrl}/unsubscribe?token=preview`;
        base = this.buildUserVariables(r, appUrl, unsubUrl);
      } else {
        base = this.sampleVariables(appUrl);
      }
    } else {
      base = this.sampleVariables(appUrl);
    }
    return { ...base, ...(opts.extra_variables ?? {}) };
  }

  // Catalogue sample values, used when previewing with no concrete user. app_url
  // and unsubscribe_url get real-shaped values off the configured base URL.
  private sampleVariables(appUrl: string): Record<string, string | number> {
    const out: Record<string, string | number> = {};
    for (const def of EMAIL_VARIABLE_CATALOGUE) {
      out[def.key] = def.sample;
    }
    out.app_url = appUrl;
    out.unsubscribe_url = `${appUrl}/unsubscribe?token=preview`;
    return out;
  }

  // Resolve the audience filter to a concrete user list. Each branch
  // returns the columns we need to build per-user variables; the SQL stays
  // narrow so we don't paginate millions of users into memory.
  private async findRecipients(
    audience: BlastAudience,
    user_ids: string[] | undefined
  ): Promise<RecipientRow[]> {
    if (audience === "ids") {
      const ids = (user_ids ?? []).filter((s) => typeof s === "string" && s.length > 0);
      if (ids.length === 0) {
        throw new BadRequestException(
          "audience=ids requires a non-empty user_ids array"
        );
      }
      return this.sql<RecipientRow[]>`
        SELECT u.id::text, u.email, u.display_name, u.email_reminders_enabled,
               u.streak_count, u.xp, u.level, u.timezone, u.reminder_hour_local,
               u.streak_freezes_remaining,
               (SELECT s.plan_id FROM subscriptions s
                  WHERE s.user_id = u.id AND s.status = 'active'
                  ORDER BY s.created_at DESC LIMIT 1) AS active_plan_id
        FROM users u
        WHERE u.id = ANY(${this.sql.array(ids)})
      `;
    }

    if (audience === "premium") {
      return this.sql<RecipientRow[]>`
        SELECT u.id::text, u.email, u.display_name, u.email_reminders_enabled,
               u.streak_count, u.xp, u.level, u.timezone, u.reminder_hour_local,
               u.streak_freezes_remaining,
               (SELECT s2.plan_id FROM subscriptions s2
                  WHERE s2.user_id = u.id AND s2.status = 'active'
                  ORDER BY s2.created_at DESC LIMIT 1) AS active_plan_id
        FROM users u
        WHERE EXISTS (
          SELECT 1 FROM subscriptions s
          WHERE s.user_id = u.id AND s.status = 'active'
        )
      `;
    }

    if (audience === "free") {
      return this.sql<RecipientRow[]>`
        SELECT u.id::text, u.email, u.display_name, u.email_reminders_enabled,
               u.streak_count, u.xp, u.level, u.timezone, u.reminder_hour_local,
               u.streak_freezes_remaining,
               NULL::text AS active_plan_id
        FROM users u
        WHERE NOT EXISTS (
          SELECT 1 FROM subscriptions s
          WHERE s.user_id = u.id AND s.status = 'active'
        )
      `;
    }

    if (audience === "reminders_enabled") {
      return this.sql<RecipientRow[]>`
        SELECT u.id::text, u.email, u.display_name, u.email_reminders_enabled,
               u.streak_count, u.xp, u.level, u.timezone, u.reminder_hour_local,
               u.streak_freezes_remaining,
               (SELECT s.plan_id FROM subscriptions s
                  WHERE s.user_id = u.id AND s.status = 'active'
                  ORDER BY s.created_at DESC LIMIT 1) AS active_plan_id
        FROM users u
        WHERE u.email_reminders_enabled = TRUE
      `;
    }

    // audience === 'all'
    return this.sql<RecipientRow[]>`
      SELECT u.id::text, u.email, u.display_name, u.email_reminders_enabled,
             u.streak_count, u.xp, u.level, u.timezone, u.reminder_hour_local,
             u.streak_freezes_remaining,
             (SELECT s.plan_id FROM subscriptions s
                WHERE s.user_id = u.id AND s.status = 'active'
                ORDER BY s.created_at DESC LIMIT 1) AS active_plan_id
      FROM users u
    `;
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
