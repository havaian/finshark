import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AccessTokenPayload } from "../auth/auth.service";
import { Lang } from "../content/lang.decorator";
import type { Lang as LangType } from "../content/content.types";
import { MocksService } from "./mocks.service";
import { StartMockDto } from "./dto/start-mock.dto";

// Mocks live under their own /mocks prefix rather than overloading /lessons,
// to keep the API surface readable. The actual session lifecycle (attempt,
// complete) still flows through /lessons/:id endpoints - a mock IS a session
// row, just with mode='mock'. This is just the start + post-completion ops.
@Controller("mocks")
@UseGuards(JwtAuthGuard)
export class MocksController {
  constructor(private readonly mocks: MocksService) {}

  // POST /mocks → start a new mock session for a paper.
  @Post()
  start(
    @CurrentUser() current: AccessTokenPayload,
    @Lang() lang: LangType,
    @Body() dto: StartMockDto
  ) {
    return this.mocks.start(current.sub, lang, {
      paper_id: dto.paper_id,
      question_count: dto.question_count,
      time_limit_seconds: dto.time_limit_seconds,
    });
  }

  // GET /mocks/:id/breakdown → per-LO accuracy after completion + wrong IDs.
  @Get(":session_id/breakdown")
  breakdown(
    @CurrentUser() current: AccessTokenPayload,
    @Param("session_id") session_id: string
  ) {
    return this.mocks.breakdown(current.sub, session_id);
  }

  // GET /mocks/:id/answers → per-question review payload (prompt, options,
  // correct answer, explanation, user's answer, per-option why-wrong). The
  // frontend renders this as a stack of read-only review cards - distinct
  // from POST /:id/review which spins up a re-practice lesson session.
  @Get(":session_id/answers")
  answers(
    @CurrentUser() current: AccessTokenPayload,
    @Lang() lang: LangType,
    @Param("session_id") session_id: string
  ) {
    return this.mocks.answers(current.sub, session_id, lang);
  }

  // POST /mocks/:id/review → spin up a regular lesson session preloaded with
  // the wrong-answer questions from this mock. Returns the same shape as
  // start-mock so the frontend can use the same UI; mode is 'lesson'.
  @Post(":session_id/review")
  startReview(
    @CurrentUser() current: AccessTokenPayload,
    @Lang() lang: LangType,
    @Param("session_id") session_id: string
  ) {
    return this.mocks.startReview(current.sub, session_id, lang);
  }
}
