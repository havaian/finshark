import { Injectable, Logger } from "@nestjs/common";
import { PlansRepository } from "./plans.repository";
import { SubscriptionsRepository } from "./subscriptions.repository";
import type { Entitlement } from "./billing.types";

// EntitlementService is the single source of truth for "what tier is this
// user, right now". Everything that gates behaviour on premium status (lessons
// quota, mocks quota, heart pool, gated achievements, paper access) should go
// through this service rather than reading subscriptions directly.
//
// The free baseline:
//   tier='free', planId='free', subscriptionId=null, endsAt=null, source=null.
// Returned when the user has no currently-active subscription row.
//
// Caching: we deliberately do NOT cache here. The subscriptions query is a
// single indexed lookup, and callers that need request-level memoization can
// wrap with a per-request store later. Premature caching would risk handing
// out stale "still premium" answers after a revoke.

@Injectable()
export class EntitlementsService {
  private readonly log = new Logger(EntitlementsService.name);

  // Stable baseline for users with no active sub. Shared instance so
  // equality checks (tier === entitlement.tier) stay cheap if a caller
  // wants to optimise.
  private static readonly FREE_BASELINE: Entitlement = {
    tier: "free",
    planId: "free",
    subscriptionId: null,
    endsAt: null,
    source: null,
  };

  constructor(
    private readonly subs: SubscriptionsRepository,
    private readonly plans: PlansRepository
  ) {}

  // Single hot-path call. O(1) lookup via idx_subs_user_status_ends.
  async getEntitlement(userId: string): Promise<Entitlement> {
    const sub = await this.subs.findActiveForUser(userId);
    if (!sub) return EntitlementsService.FREE_BASELINE;

    // Resolve the plan to learn its tier. Cheap point lookup; if performance
    // ever matters we can cache the tiny plans table in-process.
    const plan = await this.plans.findById(sub.plan_id);
    if (!plan) {
      // Should never happen — plan_id has a FK constraint. If it does, log
      // loudly and fail back to free so the user isn't stuck in an undefined
      // state. The repair is a DB-level investigation.
      this.log.error(
        `subscription ${sub.id} references missing plan ${sub.plan_id}; falling back to free`
      );
      return EntitlementsService.FREE_BASELINE;
    }

    return {
      tier: plan.tier,
      planId: plan.id,
      subscriptionId: sub.id,
      endsAt: sub.ends_at,
      source: sub.source,
    };
  }

  // Convenience for code paths that only need the boolean. Same cost as
  // getEntitlement; use whichever reads better at the call site.
  async isPremium(userId: string): Promise<boolean> {
    const ent = await this.getEntitlement(userId);
    return ent.tier === "premium";
  }
}
