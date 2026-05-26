import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AccessTokenPayload } from "../auth/auth.service";
import { UsersRepository } from "../users/users.repository";
import { toPublicUser } from "../users/user.types";
import { Lang } from "../content/lang.decorator";
import type { Lang as LangType } from "../content/content.types";
import { ProfileStatsService } from "./profile-stats.service";
import { UpdateDisplayNameDto, DeleteAccountDto } from "./dto/profile.dto";
import { UpdatePreferencesDto } from "./dto/preferences.dto";
import { EntitlementsService } from "../billing/entitlements.service";
import { LessonSessionsRepository } from "../lessons/lesson-sessions.repository";
import { SubscriptionsService } from "../billing/subscriptions.service";
import { toPublicSubscription } from "../billing/billing.types";

// Free-tier limits surfaced on /me/entitlement. Mirror the constants in the
// corresponding service files — kept literal here because the values are part
// of the user-facing contract (and the frontend needs them to render the UI
// before any quota call happens).
const FREE_LESSONS_PER_DAY = 3;
const FREE_MOCKS_PER_MONTH = 1;
const FREE_HEARTS_PER_DAY = 3;

@Controller("me")
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    private readonly users: UsersRepository,
    private readonly stats: ProfileStatsService,
    private readonly entitlements: EntitlementsService,
    private readonly sessions: LessonSessionsRepository,
    private readonly subscriptions: SubscriptionsService
  ) {}

  // GET /api/me — full public profile including created_at (joined date).
  // Distinct from /api/auth/me which is the same data: kept both for clarity
  // (auth.me is "verify my session", this is the profile endpoint).
  @Get()
  async getMe(@CurrentUser() current: AccessTokenPayload) {
    const user = await this.users.findById(current.sub);
    if (!user) throw new NotFoundException("user not found");
    return {
      ...toPublicUser(user),
      created_at: user.created_at.toISOString(),
    };
  }

  @Patch()
  async patchMe(
    @CurrentUser() current: AccessTokenPayload,
    @Body() dto: UpdateDisplayNameDto
  ) {
    const trimmed = dto.display_name.trim();
    const updated = await this.users.updateDisplayName(current.sub, trimmed);
    if (!updated) throw new NotFoundException("user not found");
    return toPublicUser(updated);
  }

  // GET /api/me/stats — everything the profile page's charts need in one call.
  @Get("stats")
  async getStats(
    @CurrentUser() current: AccessTokenPayload,
    @Lang() lang: LangType
  ) {
    return this.stats.getForUser(current.sub, lang);
  }

  // GET /api/me/entitlement — tier + quota state for the gating UI.
  //
  // The shape covers:
  //   - tier / plan_id / ends_at: from EntitlementsService.
  //   - lessons.used / lessons.limit: lessons-today vs FREE_LESSONS_PER_DAY.
  //   - mocks.used / mocks.limit: mocks-this-month vs FREE_MOCKS_PER_MONTH.
  //   - hearts.pool / hearts.max: current free heart pool (post-refill) vs cap.
  //
  // For premium users, the limit fields are `null` (unlimited) but `used` is
  // still computed — the frontend can hide quota chips when limit is null.
  // We refill the heart pool here too so a fresh app boot for a free user
  // sees today's pool even if they haven't started a lesson yet.
  @Get("entitlement")
  async getEntitlement(@CurrentUser() current: AccessTokenPayload) {
    const user = await this.users.findById(current.sub);
    if (!user) throw new NotFoundException("user not found");

    const ent = await this.entitlements.getEntitlement(current.sub);
    const isFree = ent.tier === "free";

    // Refill the heart pool when reading entitlement for a free user. The
    // refill is idempotent (it only writes when the date rolls over), so this
    // is cheap when called repeatedly and keeps the displayed pool fresh
    // without requiring the user to start a lesson first.
    const heartPool = isFree
      ? await this.users.ensureFreeHeartPoolRefilled(current.sub)
      : null;

    const [lessonsToday, mocksThisMonth] = await Promise.all([
      this.sessions.countLessonsTodayInTimezone(current.sub, user.timezone),
      this.sessions.countMocksThisMonthInTimezone(current.sub, user.timezone),
    ]);

    return {
      tier: ent.tier,
      plan_id: ent.planId,
      subscription_id: ent.subscriptionId,
      ends_at: ent.endsAt ? ent.endsAt.toISOString() : null,
      source: ent.source,
      lessons: {
        used: lessonsToday,
        limit: isFree ? FREE_LESSONS_PER_DAY : null,
      },
      mocks: {
        used: mocksThisMonth,
        limit: isFree ? FREE_MOCKS_PER_MONTH : null,
      },
      hearts: {
        // For premium users, the per-session model is unchanged — there's no
        // "pool" to surface. We send null so the frontend can hide the pool
        // chip and just trust session.hearts_remaining like before.
        pool: heartPool,
        max: isFree ? FREE_HEARTS_PER_DAY : null,
      },
    };
  }

  // GET /api/me/subscriptions — user-facing history of their OWN subscriptions
  // (admin grants, promocode redemptions, future PSP payments). Same shape as
  // the admin endpoint /admin/users/:id/subscriptions; backend just uses the
  // current user's id and skips the admin guard. Used by the Payments section
  // on the profile page.
  @Get("subscriptions")
  async getMySubscriptions(@CurrentUser() current: AccessTokenPayload) {
    const rows = await this.subscriptions.history(current.sub);
    return rows.map(toPublicSubscription);
  }

  // PATCH /api/me/preferences — update lesson/notification preferences.
  // Returns the full updated PublicUser so the frontend can refresh state in one call.
  @Patch("preferences")
  async updatePreferences(
    @CurrentUser() current: AccessTokenPayload,
    @Body() dto: UpdatePreferencesDto
  ) {
    // The DTO's regex catches obvious shape errors, but only the runtime can
    // tell us whether the IANA name actually exists. We do the canonical
    // check here so a typo like "Asia/Foo" is rejected before the DB write
    // — otherwise the bad value would propagate to the heart-pool refill
    // SQL (`NOW() AT TIME ZONE timezone`) and surface as a 500 there.
    if (dto.timezone !== undefined) {
      try {
        new Intl.DateTimeFormat("en-US", { timeZone: dto.timezone });
      } catch {
        throw new BadRequestException(
          `unknown IANA timezone: ${dto.timezone}`
        );
      }
    }
    const updated = await this.users.updatePreferences(current.sub, dto);
    if (!updated) throw new NotFoundException("user not found");
    return toPublicUser(updated);
  }

  // DELETE /api/me — hard delete. Requires the user to retype their own email
  // as a safety prompt. Returns 204 on success.
  @Delete()
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteMe(
    @CurrentUser() current: AccessTokenPayload,
    @Body() dto: DeleteAccountDto
  ): Promise<void> {
    const user = await this.users.findById(current.sub);
    if (!user) throw new NotFoundException("user not found");
    // Case-insensitive email compare; Google emails are case-insensitive in practice.
    if (dto.confirm_email.trim().toLowerCase() !== user.email.toLowerCase()) {
      throw new BadRequestException(
        "confirm_email does not match the account email"
      );
    }
    const ok = await this.users.deleteUser(current.sub);
    if (!ok) throw new NotFoundException("user not found");
    // The user's refresh tokens cascade away with the user row. Access tokens
    // are stateless — they remain valid until they expire (≤15m typically),
    // but they reference a user_id that no longer exists, so JwtAuthGuard's
    // re-lookup will fail for any subsequent call.
  }
}
