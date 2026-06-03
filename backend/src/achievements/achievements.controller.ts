import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AccessTokenPayload } from "../auth/auth.service";
import { Lang } from "../content/lang.decorator";
import type { Lang as LangType } from "../content/content.types";
import { AchievementsService } from "./achievements.service";

// Routes:
//   GET /me/achievements       - full catalog + progress for the current user
//                                (locked tiles included so the UI can show
//                                progress bars and "next level: X").
//   GET /users/:id/achievements - earned-only (level >= 1) for someone else's
//                                public profile. Same auth requirement as
//                                /users/:id/public-profile.
//
// Kept in a separate AchievementsController (not folded into ProfileController)
// because the achievements module is self-contained and parallel to badges -
// deleting the module shouldn't touch profile.
@Controller()
@UseGuards(JwtAuthGuard)
export class AchievementsController {
  constructor(private readonly achievements: AchievementsService) {}

  // Full payload for own profile. Always returns the full catalog; locked
  // tiles render greyed-out client-side.
  @Get("me/achievements")
  listMine(@CurrentUser() current: AccessTokenPayload, @Lang() lang: LangType) {
    return this.achievements.getForUser(current.sub, lang);
  }

  // Earned-only for someone else. No throw on empty - returns []. The 404
  // case (user doesn't exist) is intentionally NOT handled here: this route
  // is queried alongside the existing /users/:id/public-profile route which
  // already enforces existence. If you hit this directly with a bogus id
  // you'd get [] back, which is fine - no info leak.
  @Get("users/:id/achievements")
  listForUser(@Param("id") id: string, @Lang() lang: LangType) {
    return this.achievements.getEarnedForUser(id, lang);
  }
}
