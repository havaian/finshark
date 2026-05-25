import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";
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

@Injectable()
export class SubscriptionsService {
  constructor(
    @Inject(PG) private readonly sql: Sql,
    private readonly subs: SubscriptionsRepository,
    private readonly plans: PlansRepository,
    private readonly events: SubscriptionEventsRepository
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

    return this.sql.begin(async (tx) => {
      const sub = await this.subs.insert(
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
          subscription_id: sub.id,
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
      return sub;
    });
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

    return this.sql.begin(async (tx) => {
      const updated = await this.subs.setEndsAt(existing.id, newEnd, tx);
      if (!updated) throw new NotFoundException("subscription not found");
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
      return updated;
    });
  }

  // Mark cancelled. User keeps remaining paid time — billing systems should
  // not yank access already paid for. The entitlement query filters by
  // status='active' so once status flips to 'cancelled', the user immediately
  // drops to free. (Two interpretations exist; this codebase picks "cancel =
  // immediately revoke paid access from the catalog perspective". Switch to
  // a delayed model later if product wants it — that's a one-line query
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

  // Read-only helpers for admin UI consumers (controllers land in a later
  // slice). Kept here so the service surface is symmetric.
  async history(userId: string): Promise<SubscriptionRow[]> {
    return this.subs.findHistoryForUser(userId);
  }

  async getById(id: string): Promise<SubscriptionRow | null> {
    return this.subs.findById(id);
  }
}
