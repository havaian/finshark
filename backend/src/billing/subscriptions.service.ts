import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";
import { EmailTemplatesService } from "../email/email-templates.service";
import { UsersRepository } from "../users/users.repository";
import { PlansRepository } from "./plans.repository";
import { SubscriptionEventsRepository } from "./subscription-events.repository";
import { SubscriptionsRepository } from "./subscriptions.repository";
import {
  periodEnd,
  type SubscriptionRow,
  type SubscriptionSource,
} from "./billing.types";

// SubscriptionsService owns the lifecycle of subscription rows: grant,
// extend, revoke, cancel. Each mutating call writes an audit row to
// subscription_events in the same transaction so the timeline stays
// consistent.
//
// Promocode redemption lives in PromocodesService and calls grant() with
// source='promocode'. PSP webhook handlers (Payme/Click later) will do the
// same with source='payme' / 'click' / etc.
//
// Email notifications (premium_granted template) fire AFTER the transaction
// commits and are best-effort: a failed send logs a warning but does NOT
// roll back the grant - the user's premium is real even if their email
// bounced.

@Injectable()
export class SubscriptionsService {
  private readonly log = new Logger(SubscriptionsService.name);

  constructor(
    @Inject(PG) private readonly sql: Sql,
    private readonly subs: SubscriptionsRepository,
    private readonly plans: PlansRepository,
    private readonly events: SubscriptionEventsRepository,
    private readonly users: UsersRepository,
    private readonly templates: EmailTemplatesService,
    private readonly config: ConfigService
  ) {}

  // Create a new subscription. Resolves the plan to compute ends_at when
  // `days` is not explicitly provided:
  //   - days given → ends_at = starts_at + days (overrides plan period)
  //   - days null + plan.period_days != null → ends_at = starts_at + period_days
  //   - both null (e.g. lifetime plan, admin "no expiry" grant) → ends_at = null
  //
  // Writes the 'granted' event in the same tx. Returns the new sub row.
  async grant(input: {
    userId: string;
    planId: string;
    source: SubscriptionSource;
    sourceRef?: string | null;
    days?: number | null;          // explicit override for plan.period_days
    startsAt?: Date;
    createdByUserId?: string | null;
    reason?: string | null;
    metadata?: Record<string, unknown>;
    // Suppresses the premium_granted email. Set by callers that send their own,
    // more specific notification for the same event - an auto-renewal tells the
    // user we charged their saved card and how to stop, which premium_granted
    // does not say. Two emails for one charge is worse than either alone.
    suppressNotification?: boolean;
  }): Promise<SubscriptionRow> {
    const plan = await this.plans.findById(input.planId);
    if (!plan) throw new BadRequestException(`unknown plan: ${input.planId}`);
    if (!plan.is_active) {
      throw new BadRequestException(`plan ${input.planId} is not active`);
    }

    const startsAt = input.startsAt ?? new Date();
    // `days` undefined  → fall back to plan.period_days
    // `days` null       → explicit "no expiry" (caller's choice)
    // `days` positive   → use that many days
    const effectiveDays =
      input.days === undefined ? plan.period_days : input.days;
    const endsAt = periodEnd(startsAt, effectiveDays);

    const sub = await this.sql.begin(async (tx) => {
      const row = await this.subs.insert(
        {
          user_id: input.userId,
          plan_id: input.planId,
          source: input.source,
          source_ref: input.sourceRef ?? null,
          starts_at: startsAt,
          ends_at: endsAt,
          created_by_user_id: input.createdByUserId ?? null,
          metadata: input.metadata ?? {},
        },
        tx
      );
      await this.events.insert(
        {
          subscription_id: row.id,
          user_id: input.userId,
          kind: "granted",
          actor_user_id: input.createdByUserId ?? null,
          reason: input.reason ?? null,
          metadata: {
            plan_id: input.planId,
            source: input.source,
            ...(effectiveDays !== null ? { days: effectiveDays } : {}),
          },
        },
        tx
      );
      return row;
    });

    // Fire-and-forget email AFTER the tx commits so a flaky SMTP doesn't
    // roll back the grant. Only sends for premium-tier plans - granting a
    // 'free' subscription (e.g. an explicit downgrade record) doesn't
    // warrant a "welcome to premium" email. Errors are logged inside the
    // helper and swallowed here.
    if (plan.tier === "premium") {
      if (!input.suppressNotification) void this.notifyPremiumGranted(sub);
    }

    return sub;
  }

  // Extend an existing subscription by N days. If the sub had already expired,
  // we anchor the extension at NOW() so the user doesn't get a retroactive
  // window they can't use. Lifetime subs (ends_at = NULL) can't be extended;
  // returns the unchanged row and logs a 'note' event.
  async extend(input: {
    subscriptionId: string;
    days: number;
    actorUserId?: string | null;
    reason?: string | null;
  }): Promise<SubscriptionRow> {
    if (input.days <= 0) {
      throw new BadRequestException("days must be positive");
    }
    const existing = await this.subs.findById(input.subscriptionId);
    if (!existing) throw new NotFoundException("subscription not found");
    if (existing.ends_at === null) {
      // Open-ended; nothing to do but record the attempt.
      await this.events.insert({
        subscription_id: existing.id,
        user_id: existing.user_id,
        kind: "note",
        actor_user_id: input.actorUserId ?? null,
        reason:
          input.reason ?? "extend skipped: subscription is open-ended (lifetime)",
      });
      return existing;
    }

    const now = new Date();
    const anchor = existing.ends_at > now ? existing.ends_at : now;
    const newEnd = new Date(anchor.getTime() + input.days * 86_400_000);

    const updated = await this.sql.begin(async (tx) => {
      const row = await this.subs.setEndsAt(existing.id, newEnd, tx);
      if (!row) throw new NotFoundException("subscription not found");
      await this.events.insert(
        {
          subscription_id: existing.id,
          user_id: existing.user_id,
          kind: "extended",
          actor_user_id: input.actorUserId ?? null,
          reason: input.reason ?? null,
          metadata: { days: input.days, new_ends_at: newEnd.toISOString() },
        },
        tx
      );
      return row;
    });

    // Same fire-and-forget notification as grant. We reuse the premium_granted
    // template intentionally - copy reads cleanly for both "you're now
    // premium until X" and "your premium is now active until X". A future
    // dedicated "premium_extended" template can replace this call by key
    // without changing the wiring.
    void this.notifyPremiumGranted(updated);

    return updated;
  }

  // Mark cancelled. User keeps remaining paid time - billing systems should
  // not yank access already paid for. The entitlement query filters by
  // status='active' so once status flips to 'cancelled', the user immediately
  // drops to free. (Two interpretations exist; this codebase picks "cancel =
  // immediately revoke paid access from the catalog perspective". Switch to
  // a delayed model later if product wants it - that's a one-line query
  // change in subscriptions.repository.findActiveForUser.)
  async cancel(input: {
    subscriptionId: string;
    actorUserId?: string | null;
    reason?: string | null;
  }): Promise<SubscriptionRow> {
    return this.sql.begin(async (tx) => {
      const updated = await this.subs.markCancelled(input.subscriptionId, tx);
      if (!updated) throw new NotFoundException("subscription not found");
      await this.events.insert(
        {
          subscription_id: updated.id,
          user_id: updated.user_id,
          kind: "cancelled",
          actor_user_id: input.actorUserId ?? null,
          reason: input.reason ?? null,
        },
        tx
      );
      return updated;
    });
  }

  // Hard revoke (admin abuse / refund flow). Forces ends_at=NOW() so even the
  // remaining paid window is gone. Logs the actor + reason for compliance.
  async revoke(input: {
    subscriptionId: string;
    actorUserId?: string | null;
    reason?: string | null;
  }): Promise<SubscriptionRow> {
    return this.sql.begin(async (tx) => {
      const updated = await this.subs.revoke(input.subscriptionId, tx);
      if (!updated) throw new NotFoundException("subscription not found");
      await this.events.insert(
        {
          subscription_id: updated.id,
          user_id: updated.user_id,
          kind: "revoked",
          actor_user_id: input.actorUserId ?? null,
          reason: input.reason ?? null,
        },
        tx
      );
      return updated;
    });
  }

  // Revoke a user's premium in one action.
  //
  // This exists because per-subscription revoke cannot do the job. Purchases
  // chain into separate rows, so a user with ten months has ten active rows and
  // entitlement passes on any one of them - revoking them individually means
  // ten clicks, and missing one silently leaves the user with full access while
  // the admin believes it is gone.
  //
  // One transaction: a partial revoke is the exact failure mode being fixed, so
  // it must not be reachable by a mid-loop error either.
  async revokeAllForUser(input: {
    userId: string;
    actorUserId?: string | null;
    reason?: string | null;
  }): Promise<{ revoked: number }> {
    return this.sql.begin(async (tx) => {
      const active = await this.subs.findAllGrantingAccess(input.userId, tx);
      for (const sub of active) {
        const updated = await this.subs.revoke(sub.id, tx);
        if (!updated) continue;
        await this.events.insert(
          {
            subscription_id: updated.id,
            user_id: updated.user_id,
            kind: "revoked",
            actor_user_id: input.actorUserId ?? null,
            reason: input.reason ?? null,
          },
          tx
        );
      }
      return { revoked: active.length };
    });
  }

  // Read-only helpers for admin UI consumers (controllers land in a later
  // slice). Kept here so the service surface is symmetric.
  async history(userId: string): Promise<SubscriptionRow[]> {
    return this.subs.findHistoryForUser(userId);
  }

  async getById(id: string): Promise<SubscriptionRow | null> {
    return this.subs.findById(id);
  }

  // ── Email notification ────────────────────────────────────────────────
  //
  // Fires the 'premium_granted' template after a successful grant or extend.
  // Variables fed to the template (declared in the seed):
  //   display_name   - user's first-line greeting
  //   period_clause  - "until 15 Jul 2026" OR "for life" (when ends_at = NULL)
  //   app_url        - APP_PUBLIC_URL, used in the CTA link
  //
  // All failures are swallowed with a warning log. Reasoning: a successful
  // grant is the contractual state; an email-send failure is operational
  // noise the user can recover from (they can see their premium in the
  // app). Surfacing this as a 500 would block the admin grant flow on
  // SMTP availability, which is wrong.
  //
  // Public so PromocodesService.redeem can call it after its own tx
  // commits. Keeping the helper here (instead of duplicating in
  // PromocodesService) means the period-clause formatter has a single
  // source of truth - important when we eventually replace it with a
  // per-user-locale version.
  async notifyPremiumGranted(sub: SubscriptionRow): Promise<void> {
    try {
      const user = await this.users.findById(sub.user_id);
      if (!user) {
        this.log.warn(
          `premium_granted email skipped: user ${sub.user_id} not found`
        );
        return;
      }
      const appUrl = this.config
        .getOrThrow<string>("APP_PUBLIC_URL")
        .replace(/\/$/, "");
      // Period phrasing. ends_at = NULL → lifetime (no expiry). Otherwise
      // format the date in en-US (matching the EN-only email language for
      // now; per-user language preference is a future epic). Locale-aware
      // formatting once we add user.email_language.
      const periodClause =
        sub.ends_at === null
          ? "for life"
          : `until ${sub.ends_at.toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
              timeZone: "UTC",
            })}`;
      const sent = await this.templates.sendByTemplate({
        templateKey: "premium_granted",
        to: user.email,
        lang: "en",
        variables: {
          display_name: user.display_name,
          period_clause: periodClause,
          app_url: appUrl,
        },
      });
      if (!sent) {
        this.log.warn(
          `premium_granted template not available; user ${sub.user_id} got no welcome email`
        );
      }
    } catch (err) {
      this.log.warn(
        `failed to send premium_granted email to user ${sub.user_id}: ${
          err instanceof Error ? err.message : String(err)
        }`
      );
    }
  }
}
