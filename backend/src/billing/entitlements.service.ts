import { Injectable, Logger } from "@nestjs/common";
import { PlansRepository } from "./plans.repository";
import { SubscriptionsRepository } from "./subscriptions.repository";
import type { Entitlement, PlanRow } from "./billing.types";

// EntitlementService is the single source of truth for "what tier is this
// user, right now". Everything that gates behaviour on premium status (lessons
// quota, mocks quota, heart pool, gated achievements, paper access) should go
// through this service rather than reading subscriptions directly.
//
// The free baseline:
//   tier='free', planId='free', subscriptionId=null, endsAt=null, source=null.
// Returned when the user has no currently-active subscription row.
//
// Caching: the subscriptions lookup is per-user and NOT cached (a revoke must
// take effect immediately). The plans table, by contrast, is tiny and
// effectively immutable at runtime - it's only ever written by migrations /
// seed, never by request handlers (verified: no INSERT/UPDATE/DELETE on plans
// outside migrations). So we memoize plan lookups in-process behind a short
// TTL. The TTL is a pure safety valve: any real plan change ships as a
// migration + redeploy, which clears this cache anyway. This removes one DB
// round-trip from every premium-user entitlement resolution (lesson start,
// each wrong attempt, mocks, gated achievements).

const PLAN_CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

@Injectable()
export class EntitlementsService {
  private readonly log = new Logger(EntitlementsService.name);

  // Per-plan-id memo. Value is the row (or null for a genuinely missing id,
  // cached too so a bad reference doesn't re-hit the DB every call). `expires`
  // is an epoch-ms stamp; entries past it are re-fetched lazily on read.
  private planCache = new Map<
    string,
    { row: PlanRow | null; expires: number }
  >();

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

  // Cached plan-by-id lookup. See the caching note above for why this is safe.
  private async getPlanCached(planId: string): Promise<PlanRow | null> {
    const now = Date.now();
    const hit = this.planCache.get(planId);
    if (hit && hit.expires > now) return hit.row;

    const row = await this.plans.findById(planId);
    this.planCache.set(planId, { row, expires: now + PLAN_CACHE_TTL_MS });
    return row;
  }

  // Drop a cached plan (or the whole cache when no id is given). Called by the
  // admin plan-edit path so a price/active change takes effect immediately
  // rather than waiting out the TTL. Entitlement GATING doesn't depend on
  // price (tier is what gates check, and tier isn't editable here), but other
  // readers of the cached PlanRow - the payment flow snapshots price at submit
  // time - want the fresh value, so we bust on any plan write.
  //
  // NOTE: this clears only THIS process's cache. Under multiple backend
  // instances each has its own in-process cache; the others still expire via
  // the TTL (<=5 min). For the current single-instance deployment that's moot,
  // and the payment flow re-reads price through PlansRepository.findById (not
  // the cache) at submission time regardless, so a stale cache never produces
  // a wrong charge.
  invalidatePlan(planId?: string): void {
    if (planId === undefined) {
      this.planCache.clear();
      return;
    }
    this.planCache.delete(planId);
  }

  // Single hot-path call. O(1) lookup via idx_subs_user_status_ends.
  async getEntitlement(userId: string): Promise<Entitlement> {
    const sub = await this.subs.findActiveForUser(userId);
    if (!sub) return EntitlementsService.FREE_BASELINE;

    // Resolve the plan to learn its tier. Served from the in-process cache;
    // see the caching note on the class.
    const plan = await this.getPlanCached(sub.plan_id);
    if (!plan) {
      // Should never happen - plan_id has a FK constraint. If it does, log
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
