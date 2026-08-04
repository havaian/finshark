import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { SubscriptionExpiryService } from "./subscription-expiry.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminWith2faGuard } from "../auth/guards/admin-with-2fa.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AccessTokenPayload } from "../auth/auth.service";
import { EntitlementsService } from "./entitlements.service";
import { PlansRepository } from "./plans.repository";
import { SubscriptionEventsRepository } from "./subscription-events.repository";
import { SubscriptionsRepository } from "./subscriptions.repository";
import { SubscriptionsService } from "./subscriptions.service";
import {
  toPublicPlan,
  toPublicSubscription,
  toPublicSubscriptionEvent,
} from "./billing.types";

// Admin surface for subscriptions: read history, grant manually, extend,
// cancel, revoke. PSP-driven creation (Payme / Click webhooks) lands later
// as a separate router that reaches into SubscriptionsService.grant directly
// - it doesn't go through this controller.

class GrantDto {
  @IsString()
  @Length(1, 64)
  plan_id!: string;

  // Override the plan's period. `null` = explicit "no expiry" (open-ended
  // grant). `undefined` (omitted) = use plan.period_days. Positive int otherwise.
  @IsOptional()
  @IsInt()
  @Min(1)
  days?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

class ExtendDto {
  @IsInt()
  @Min(1)
  days!: number;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

class ReasonDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  reason?: string;
}

// Admin plan edit: price and/or active toggle. Both optional so the admin can
// change just one. price_minor is in MINOR units (e.g. tiyin for UZS), matching
// the column and the rest of the billing layer. Must be a positive integer -
// we don't allow setting a premium plan's price to 0 or null via this path.
class UpdatePlanDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  name?: string;

  // How many days a purchase of this plan grants. Affects FUTURE grants only -
  // existing subscriptions hold concrete dates. Capped at 10 years: anything
  // longer is meant to be a lifetime plan, which is period_days = NULL and a
  // structural choice, not a very large number.
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(3650)
  period_days?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  price_minor?: number;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  // Receipt line for the OFD fiscal check, printed when this plan is bought
  // through Click. Nullable: passing null clears it, which stops fiscalization
  // for the plan instead of filing an invented description. Must end with the
  // unit per the OFD spec, e.g. "Finshark Premium 30 kun, 1 dona".
  @IsOptional()
  @IsString()
  @MaxLength(63)
  fiscal_item_name?: string | null;
}

@Controller("admin")
@UseGuards(JwtAuthGuard, AdminWith2faGuard)
export class AdminSubscriptionsController {
  constructor(
    private readonly subs: SubscriptionsService,
    private readonly subsRepo: SubscriptionsRepository,
    private readonly events: SubscriptionEventsRepository,
    private readonly plans: PlansRepository,
    private readonly entitlements: EntitlementsService,
    private readonly expiry: SubscriptionExpiryService
  ) {}

  // ── Plans (read-only) ───────────────────────────────────────────────

  // /api/admin/plans - used by the admin UI to populate the plan picker on
  // the manual-grant + promocode-create forms. Includes inactive plans so
  // admins can see retired ones, but filtered downstream by the UI when
  // building new grants.
  @Get("plans")
  async listPlans() {
    const rows = await this.plans.findAll(/* includeInactive */ true);
    return rows.map(toPublicPlan);
  }

  // /api/admin/plans/:id - edit a plan's price and/or active flag. This is the
  // "adjustable amount from the admin panel" path: an admin changes
  // price_minor and the user-facing payment picker + the price snapshotted onto
  // new payment submissions reflect it immediately. After the write we bust the
  // entitlement service's plan cache so the change takes effect now, not after
  // the cache TTL.
  //
  // Only premium plans are sensibly editable (the free plan has no price); we
  // don't hard-block editing 'free' here, but the DTO requires a positive price
  // so you can't accidentally give the free plan a price without also tripping
  // the table's price/currency-consistency CHECK (free has NULL currency).
  //
  // `tier` stays structural - entitlement gates key off it. name, period_days,
  // price and the receipt line are all editable, and should be kept consistent
  // with each other: a plan named "monthly" that grants 45 days will print
  // that contradiction onto a fiscal receipt.
  @Patch("plans/:id")
  async updatePlan(@Param("id") id: string, @Body() body: UpdatePlanDto) {
    // fiscal_item_name is forwarded only when the key was actually sent, so an
    // edit that touches price alone can't blank the receipt line. Presence with
    // an empty value means "clear it".
    const patch: {
      name?: string;
      period_days?: number;
      price_minor?: number;
      is_active?: boolean;
      fiscal_item_name?: string | null;
    } = {
      name: body.name?.trim() || undefined,
      period_days: body.period_days,
      price_minor: body.price_minor,
      is_active: body.is_active,
    };
    if ("fiscal_item_name" in body) {
      const trimmed = body.fiscal_item_name?.trim();
      patch.fiscal_item_name = trimmed ? trimmed : null;
    }
    const updated = await this.plans.update(id, patch);
    if (!updated) throw new NotFoundException("plan not found");
    // Take effect immediately for cached readers (entitlement + payment price
    // snapshot). See EntitlementsService.invalidatePlan for the multi-instance
    // caveat (TTL covers other instances; payment price is re-read uncached).
    this.entitlements.invalidatePlan(id);
    return toPublicPlan(updated);
  }

  // ── Subscription read ───────────────────────────────────────────────

  // Full history for a user, newest first. Both active and inactive rows.
  @Get("users/:userId/subscriptions")
  async listForUser(@Param("userId") userId: string) {
    const rows = await this.subs.history(userId);
    return rows.map(toPublicSubscription);
  }

  // Per-user audit log. Useful for "why is this user not premium" debugging
  // - includes events from subscriptions that have since been cancelled or
  // expired, since subscription_events.user_id is set independently of
  // subscription_id.
  @Get("users/:userId/subscription-events")
  async eventsForUser(@Param("userId") userId: string) {
    const rows = await this.events.findForUser(userId);
    return rows.map(toPublicSubscriptionEvent);
  }

  @Get("subscriptions/:id")
  async getOne(@Param("id") id: string) {
    const row = await this.subs.getById(id);
    if (!row) throw new NotFoundException("subscription not found");
    return toPublicSubscription(row);
  }

  // Audit trail for a single subscription. Granular events: granted /
  // extended / cancelled / revoked / renewed / webhook / note.
  @Get("subscriptions/:id/events")
  async eventsForSubscription(@Param("id") id: string) {
    const rows = await this.events.findForSubscription(id);
    return rows.map(toPublicSubscriptionEvent);
  }

  // ── Subscription write ──────────────────────────────────────────────

  // Manual grant. Source='manual'; created_by_user_id set to the admin
  // performing the grant so the audit log says "alice@admin gave bob 30
  // days of premium". `days` semantics match SubscriptionsService.grant:
  //   omitted → use the plan's own period
  //   null    → open-ended (no expiry)
  //   N>0     → exactly N days from now
  @Post("users/:userId/subscriptions")
  @HttpCode(HttpStatus.CREATED)
  async grant(
    @Param("userId") userId: string,
    @Body() dto: GrantDto,
    @CurrentUser() current: AccessTokenPayload
  ) {
    const row = await this.subs.grant({
      userId,
      planId: dto.plan_id,
      source: "manual",
      // Distinguish "use plan period" (key absent) from "open-ended" (key=null)
      days: "days" in dto ? dto.days : undefined,
      createdByUserId: current.sub,
      reason: dto.reason,
    });
    return toPublicSubscription(row);
  }

  @Post("subscriptions/:id/extend")
  @HttpCode(HttpStatus.OK)
  async extend(
    @Param("id") id: string,
    @Body() dto: ExtendDto,
    @CurrentUser() current: AccessTokenPayload
  ) {
    const row = await this.subs.extend({
      subscriptionId: id,
      days: dto.days,
      actorUserId: current.sub,
      reason: dto.reason ?? null,
    });
    return toPublicSubscription(row);
  }

  // Soft cancel - keeps remaining paid time visible in the audit, but the
  // entitlement query treats status='cancelled' as immediately non-active.
  // See SubscriptionsService.cancel for the documented interpretation.
  @Post("subscriptions/:id/cancel")
  @HttpCode(HttpStatus.OK)
  async cancel(
    @Param("id") id: string,
    @Body() dto: ReasonDto,
    @CurrentUser() current: AccessTokenPayload
  ) {
    const row = await this.subs.cancel({
      subscriptionId: id,
      actorUserId: current.sub,
      reason: dto.reason ?? null,
    });
    return toPublicSubscription(row);
  }

  // Hard revoke - for refund / abuse. Forces ends_at=NOW().
  @Post("subscriptions/:id/revoke")
  @HttpCode(HttpStatus.OK)
  async revoke(
    @Param("id") id: string,
    @Body() dto: ReasonDto,
    @CurrentUser() current: AccessTokenPayload
  ) {
    const row = await this.subs.revoke({
      subscriptionId: id,
      actorUserId: current.sub,
      reason: dto.reason ?? null,
    });
    return toPublicSubscription(row);
  }
  // ADMIN - run the expiry-warning sweep now instead of waiting for 09:00 UTC.
  // Sends real email, so it is a test of the whole pipeline rather than a dry
  // run: subscriptions it warns are marked and will not be warned again.
  // POST /api/admin/subscriptions/expiry-warnings/run
  @Post("subscriptions/expiry-warnings/run")
  @HttpCode(HttpStatus.OK)
  async runExpiryWarnings(): Promise<{ sent: number; failed: number }> {
    return this.expiry.runOnce();
  }
}
