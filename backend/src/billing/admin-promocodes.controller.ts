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
  IsISO8601,
  IsOptional,
  IsString,
  Length,
  Min,
  MaxLength,
} from "class-validator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminWith2faGuard } from "../auth/guards/admin-with-2fa.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AccessTokenPayload } from "../auth/auth.service";
import { PromocodesRepository } from "./promocodes.repository";
import { PromocodesService } from "./promocodes.service";
import { toPublicPromocode } from "./billing.types";

// DTOs are inline so the admin surface stays contained in one file. Same
// pattern as admin-whitelist.controller.ts; only auth/profile have shared
// dto/ subdirs because their DTOs are reused elsewhere.

class CreatePromocodeDto {
  @IsString()
  @Length(3, 64)
  code!: string;

  @IsString()
  // Plan id is a slug ('premium_monthly' etc.), not a UUID. Bound generously
  // to leave room for future slugs without another migration.
  @Length(1, 64)
  grant_plan_id!: string;

  // null/undefined → use the plan's own period_days. Positive int otherwise.
  @IsOptional()
  @IsInt()
  @Min(1)
  grant_days?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  max_redemptions?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  per_user_limit?: number;

  @IsOptional()
  @IsISO8601()
  valid_from?: string | null;

  @IsOptional()
  @IsISO8601()
  valid_until?: string | null;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string | null;
}

class SetActiveDto {
  @IsBoolean()
  is_active!: boolean;
}

// Admin CRUD over promocodes + a read-only view of their redemption history.
// Mounted under /api/admin/promocodes to sit alongside the other admin
// endpoints. Edit-after-create is deliberately limited: only the active flag
// is mutable here. Anything else (window, plan, days) should be done by
// creating a new code - keeps the redemption audit trail sane.
@Controller("admin/promocodes")
@UseGuards(JwtAuthGuard, AdminWith2faGuard)
export class AdminPromocodesController {
  constructor(
    private readonly promocodes: PromocodesService,
    private readonly repo: PromocodesRepository
  ) {}

  @Get()
  async list() {
    const rows = await this.promocodes.list();
    return rows.map(toPublicPromocode);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() dto: CreatePromocodeDto,
    @CurrentUser() current: AccessTokenPayload
  ) {
    const created = await this.promocodes.create({
      code: dto.code,
      grantPlanId: dto.grant_plan_id,
      grantDays: dto.grant_days ?? null,
      maxRedemptions: dto.max_redemptions ?? null,
      perUserLimit: dto.per_user_limit,
      validFrom: dto.valid_from ? new Date(dto.valid_from) : null,
      validUntil: dto.valid_until ? new Date(dto.valid_until) : null,
      isActive: dto.is_active,
      notes: dto.notes ?? null,
      createdByUserId: current.sub,
    });
    return toPublicPromocode(created);
  }

  // Toggle is_active. Disabling preserves the row + redemption history;
  // deletion is intentionally not exposed - once a code has been redeemed it
  // anchors subscription metadata + audit events.
  @Patch(":id/active")
  async setActive(@Param("id") id: string, @Body() dto: SetActiveDto) {
    const updated = await this.promocodes.setActive(id, dto.is_active);
    return toPublicPromocode(updated);
  }

  // Per-code redemption list - who used it, when, and which subscription it
  // anchored. Returns enriched rows (user display_name + email, plan_id) so
  // the admin UI can show a name + link to the user page instead of raw
  // UUIDs. The bare row shape is still used internally by the redeem path;
  // only this admin-facing GET uses the JOIN variant.
  @Get(":id/redemptions")
  async listRedemptions(@Param("id") id: string) {
    const promo = await this.repo.findById(id);
    if (!promo) throw new NotFoundException("promocode not found");
    const rows = await this.repo.findRedemptionsForCodeWithDetails(id);
    return {
      promocode: toPublicPromocode(promo),
      redemptions: rows.map((r) => ({
        id: r.id,
        promocode_id: r.promocode_id,
        user_id: r.user_id,
        subscription_id: r.subscription_id,
        redeemed_at: r.redeemed_at.toISOString(),
        user_display_name: r.user_display_name,
        user_email: r.user_email,
        subscription_plan_id: r.subscription_plan_id,
        subscription_status: r.subscription_status,
        subscription_ends_at: r.subscription_ends_at
          ? r.subscription_ends_at.toISOString()
          : null,
      })),
    };
  }
}
