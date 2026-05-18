import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AccessTokenPayload } from "../auth/auth.service";
import { LessonsService } from "./lessons.service";
import { StartLessonDto } from "./dto/start-lesson.dto";
import { SubmitAttemptDto } from "./dto/submit-attempt.dto";
import { Lang } from "../content/lang.decorator";
import type { Lang as LangType } from "../content/content.types";

@Controller("lessons")
@UseGuards(JwtAuthGuard)
export class LessonsController {
  constructor(private readonly lessons: LessonsService) {}

  @Post("start")
  @HttpCode(HttpStatus.CREATED)
  start(
    @CurrentUser() user: AccessTokenPayload,
    @Lang() lang: LangType,
    @Body() dto: StartLessonDto
  ) {
    return this.lessons.start(user.sub, lang, {
      paper_id: dto.paper_id,
      size: dto.size,
    });
  }

  @Get(":session_id")
  getSession(
    @CurrentUser() user: AccessTokenPayload,
    @Lang() lang: LangType,
    @Param("session_id") session_id: string
  ) {
    return this.lessons.getSession(user.sub, lang, session_id);
  }

  @Post(":session_id/attempt")
  @HttpCode(HttpStatus.OK)
  attempt(
    @CurrentUser() user: AccessTokenPayload,
    @Lang() lang: LangType,
    @Param("session_id") session_id: string,
    @Body() dto: SubmitAttemptDto
  ) {
    return this.lessons.submitAttempt(
      user.sub,
      lang,
      session_id,
      dto.question_id,
      dto.user_answer
    );
  }

  @Post(":session_id/complete")
  @HttpCode(HttpStatus.OK)
  complete(
    @CurrentUser() user: AccessTokenPayload,
    @Param("session_id") session_id: string
  ) {
    return this.lessons.complete(user.sub, session_id);
  }
}
