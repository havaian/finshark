import { Controller, Get, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AccessTokenPayload } from "../auth/auth.service";
import { ProgressService } from "./progress.service";
import { Lang } from "../content/lang.decorator";
import type { Lang as LangType } from "../content/content.types";

@Controller("progress")
@UseGuards(JwtAuthGuard)
export class ProgressController {
  constructor(private readonly progress: ProgressService) {}

  @Get()
  get(@CurrentUser() user: AccessTokenPayload, @Lang() lang: LangType) {
    return this.progress.getForUser(user.sub, lang);
  }
}
