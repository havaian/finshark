import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";
import { PlansRepository } from "./plans.repository";
import { PromocodesRepository } from "./promocodes.repository";
import { SubscriptionEventsRepository } from "./subscription-events.repository";
import { SubscriptionsRepository } from "./subscriptions.repository";
import { SubscriptionsService } from "./subscriptions.service";
import {
  normalisePromocode,
  periodEnd,
  type PromocodeRow,
  type RedeemResult,
} from "./billing.types";

// PromocodesService owns code lifecycle (admin: create/list/disable) and the
// user-facing redeem path. Redemption is a critical atomic operation:
//   1. lock the promocode row (FOR UPDATE)
//   2. validate it (active / within window / has redemptions left)
//   3. check this user hasn't already redeemed (unique constraint enforces 1
//      redemption per user per code at the limit=1 default)
//   4. either CREATE a fresh subscription or EXTEND an existing active one
//   5. insert the promocode_redemption row
//   6. bump promocodes.redemption_count
//   7. write subscription_events
// All inside a single transaction. The CHECK on promocodes
// (redemption_count <= max_redemptions) provides a final hard ceiling - if
// two redemptions race past the in-app check, the bump in step 6 throws and
// the tx rolls back.

@Injectable()
export class PromocodesService {
  constructor(
    @Inject(PG) private readonly sql: Sql,
    private readonly codes: PromocodesRepository,
    private readonly subs: SubscriptionsRepository,
    private readonly plans: PlansRepository,
    private readonly events: SubscriptionEventsRepository,
    // Only used for the email-send side effect after a successful redeem.
    // We don't call its grant() / extend() because those would wrap the
    // operation in a second transaction; the redeem flow is intentionally
    // self-contained in one tx (lock the promocode row, write the sub +
    // redemption + events together). The service is injected purely to
    // borrow its notifyPremiumGranted() helper.
    private readonly subscriptions: SubscriptionsService
  ) {}

  // ── Admin operations ─────────────────────────────────────────────────

  async list(): Promise<PromocodeRow[]> {
    return this.codes.findAll();
  }

  async create(input: {
    code: string;
    grantPlanId: string;
    grantDays: number | null;
    maxRedemptions: number | null;
    perUserLimit?: number;
    validFrom?: Date | null;
    validUntil?: Date | null;
    isActive?: boolean;
    notes?: string | null;
    createdByUserId: string | null;
  }): Promise<PromocodeRow> {
    const code = normalisePromocode(input.code);
    if (code.length < 3 || code.length > 64) {
      throw new BadRequestException("code must be 3..64 characters");
    }
    // DB has chk_promocodes_code_lowercased; normalise above already enforces
    // it, but we also reject anything that came in with whitespace inside.
    if (/\s/.test(code)) {
      throw new BadRequestException("code cannot contain whitespace");
    }

    const plan = await this.plans.findById(input.grantPlanId);
    if (!plan) throw new BadRequestException(`unknown plan: ${input.grantPlanId}`);
    if (plan.tier !== "premium") {
      // Granting "free" via a promocode is nonsense - if we ever support
      // it (e.g. a "downgrade" code), revisit this guard.
      throw new BadRequestException("promocodes must grant a premium plan");
    }

    if (input.grantDays !== null && input.grantDays !== undefined && input.grantDays <= 0) {
      throw new BadRequestException("grantDays must be positive when provided");
    }
    if (
      input.maxRedemptions !== null &&
      input.maxRedemptions !== undefined &&
      input.maxRedemptions <= 0
    ) {
      throw new BadRequestException("maxRedemptions must be positive when provided");
    }

    const inserted = await this.codes.insert({
      code,
      grant_plan_id: input.grantPlanId,
      grant_days: input.grantDays ?? null,
      max_redemptions: input.maxRedemptions ?? null,
      per_user_limit: input.perUserLimit ?? 1,
      valid_from: input.validFrom ?? null,
      valid_until: input.validUntil ?? null,
      is_active: input.isActive ?? true,
      notes: input.notes?.trim() || null,
      created_by_user_id: input.createdByUserId,
    });
    if (!inserted) {
      throw new ConflictException(`code "${code}" already exists`);
    }
    return inserted;
  }

  async setActive(id: string, isActive: boolean): Promise<PromocodeRow> {
    const updated = await this.codes.setActive(id, isActive);
    if (!updated) throw new NotFoundException("promocode not found");
    return updated;
  }

  // ── Redemption path (user-facing) ────────────────────────────────────

  async redeem(input: {
    userId: string;
    rawCode: string;
  }): Promise<RedeemResult> {
    const code = normalisePromocode(input.rawCode);
    if (!code) throw new BadRequestException("code is required");

    // Everything inside one transaction so concurrent redemptions of the
    // same code serialise on the FOR UPDATE lock. We capture the result
    // and then fire the welcome email AFTER commit - see the
    // notifyPremiumGranted call below for why it lives outside the tx.
    const result = await this.sql.begin(async (tx) => {
      const promo = await this.codes.findByCodeForUpdate(code, tx);
      if (!promo) {
        // Don't disclose whether the code exists but is expired/used vs
        // never existed - keeps enumeration attacks pointless.
        throw new NotFoundException("invalid or expired code");
      }

      this.assertRedeemable(promo);

      // Per-user limit. For limit=1 the DB unique index catches duplicates,
      // but we still want a cheap pre-check to return a clean error rather
      // than the integrity violation. For limit>1 the count check IS the
      // enforcement.
      const userPriorCount = await this.codes.countUserRedemptions(
        promo.id,
        input.userId,
        tx
      );
      if (userPriorCount >= promo.per_user_limit) {
        throw new ForbiddenException("you have already redeemed this code");
      }

      // Decide: create new sub vs extend existing.
      // We extend when the user has an active sub on the SAME plan AND that
      // sub has a finite ends_at. Mixed-plan grants always create a new row
      // - easier to reason about, and the entitlement query picks the
      // longest-running one.
      const existing = await this.subs.findActiveForUser(input.userId);

      const plan = await this.plans.findById(promo.grant_plan_id);
      if (!plan) {
        // Defensive - promocodes.grant_plan_id has a FK so this shouldn't
        // happen unless the plan was deleted out-of-band.
        throw new BadRequestException(
          `promocode references missing plan ${promo.grant_plan_id}`
        );
      }

      // Days the code grants. grant_days overrides plan.period_days; both
      // null means "lifetime" (only valid when plan itself is lifetime).
      const days =
        promo.grant_days !== null ? promo.grant_days : plan.period_days;

      let subscriptionRow: import("./billing.types").SubscriptionRow;
      let isNew: boolean;

      if (
        existing &&
        existing.plan_id === promo.grant_plan_id &&
        existing.ends_at !== null &&
        days !== null
      ) {
        // Extend in place. Anchor at max(NOW(), ends_at) so an already-
        // expired (but still status='active' between cron runs) sub doesn't
        // grant a retroactive window.
        const now = new Date();
        const anchor = existing.ends_at > now ? existing.ends_at : now;
        const newEnd = new Date(anchor.getTime() + days * 86_400_000);
        const updated = await this.subs.setEndsAt(existing.id, newEnd, tx);
        if (!updated) throw new NotFoundException("subscription disappeared mid-redeem");
        subscriptionRow = updated;
        isNew = false;
      } else {
        // Fresh subscription. days=null is allowed when the plan itself is
        // lifetime; periodEnd returns null in that case.
        const startsAt = new Date();
        const endsAt = periodEnd(startsAt, days);
        subscriptionRow = await this.subs.insert(
          {
            user_id: input.userId,
            plan_id: promo.grant_plan_id,
            source: "promocode",
            source_ref: promo.id,
            starts_at: startsAt,
            ends_at: endsAt,
            metadata: { promocode_id: promo.id, code: promo.code },
          },
          tx
        );
        isNew = true;
      }

      // Insert redemption row. The (promocode_id, user_id) unique constraint
      // is the final guard against a race; we caught the duplicate above,
      // but if two requests pass the pre-check simultaneously the DB will
      // reject the second one here and the tx rolls back.
      await this.codes.insertRedemption(
        {
          promocode_id: promo.id,
          user_id: input.userId,
          subscription_id: subscriptionRow.id,
        },
        tx
      );

      // Bump redemption_count. The CHECK constraint enforces
      // redemption_count <= max_redemptions, so a race past the assertRedeemable
      // check fails here and rolls back.
      await this.codes.incrementRedemptionCount(promo.id, tx);

      await this.events.insert(
        {
          subscription_id: subscriptionRow.id,
          user_id: input.userId,
          kind: isNew ? "granted" : "extended",
          reason: `promocode ${promo.code}`,
          metadata: {
            promocode_id: promo.id,
            code: promo.code,
            plan_id: promo.grant_plan_id,
            ...(days !== null ? { days } : {}),
          },
        },
        tx
      );

      return {
        promocode: promo,
        subscription: subscriptionRow,
        isNewSubscription: isNew,
      };
    });

    // Welcome / extension email. Fire-and-forget AFTER the redemption tx
    // commits so a flaky SMTP can't roll back a paid grant. Promocodes
    // currently only ever grant premium tier (PromocodesService.create
    // refuses to create a code that grants 'free'), so we don't need to
    // tier-check before notifying.
    void this.subscriptions.notifyPremiumGranted(result.subscription);

    return result;
  }

  // Pure validation - throws the appropriate exception type so the redeem
  // path stays linear. Kept private; admin UI uses the row + UI logic to
  // surface the same info.
  private assertRedeemable(promo: PromocodeRow): void {
    if (!promo.is_active) {
      throw new ForbiddenException("this code is no longer active");
    }
    const now = new Date();
    if (promo.valid_from && promo.valid_from > now) {
      throw new ForbiddenException("this code is not yet valid");
    }
    if (promo.valid_until && promo.valid_until < now) {
      throw new ForbiddenException("this code has expired");
    }
    if (
      promo.max_redemptions !== null &&
      promo.redemption_count >= promo.max_redemptions
    ) {
      throw new ForbiddenException("this code has reached its redemption limit");
    }
  }
}
