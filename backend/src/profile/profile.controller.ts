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

@Controller("me")
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(
    private readonly users: UsersRepository,
    private readonly stats: ProfileStatsService
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

  // PATCH /api/me/preferences — update lesson/notification preferences.
  // Returns the full updated PublicUser so the frontend can refresh state in one call.
  @Patch("preferences")
  async updatePreferences(
    @CurrentUser() current: AccessTokenPayload,
    @Body() dto: UpdatePreferencesDto
  ) {
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
