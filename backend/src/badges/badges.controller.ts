import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AccessTokenPayload } from "../auth/auth.service";
import { Lang } from "../content/lang.decorator";
import type { Lang as LangType } from "../content/content.types";
import { BadgesService } from "./badges.service";

// Mounted at /me/badges (not /badges/me) to keep the "things about the current
// user" surface clustered with /me/preferences and /me/stats from the profile
// module. We use a separate controller (instead of folding into profile) so
// the badges module stays self-contained and can be deleted/disabled without
// touching profile.
@Controller("me/badges")
@UseGuards(JwtAuthGuard)
export class BadgesController {
  constructor(private readonly badges: BadgesService) {}

  // Full badge catalog with earned status for the current user. Greyed-out
  // unearned badges are part of the design - they motivate by showing what's
  // achievable - so we always return the full list, not just earned ones.
  @Get()
  list(@CurrentUser() current: AccessTokenPayload, @Lang() lang: LangType) {
    return this.badges.getForUser(current.sub, lang);
  }
}
