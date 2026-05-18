import { Controller, Get, Param, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { Lang } from "../content/lang.decorator";
import type { Lang as LangType } from "../content/content.types";
import { PublicProfileService } from "./public-profile.service";

// Public-profile endpoint mounted under /users/:id to keep it separate from
// /me (which is "things about the current user"). Auth is still required so
// non-logged-in scrapers can't iterate user ids — it's "public to logged-in
// users", not "public to the internet".
@Controller("users")
@UseGuards(JwtAuthGuard)
export class PublicProfileController {
  constructor(private readonly publicProfile: PublicProfileService) {}

  @Get(":id/public-profile")
  async getOne(@Param("id") id: string, @Lang() lang: LangType) {
    return this.publicProfile.getById(id, lang);
  }
}
