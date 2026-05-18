import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Inject } from "@nestjs/common";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";
import { LessonsService } from "../lessons/lessons.service";
import { LessonSessionsRepository } from "../lessons/lesson-sessions.repository";
import { LessonSessionQuestionsRepository } from "../lessons/lesson-session-questions.repository";
import { AttemptsRepository } from "../lessons/attempts.repository";
import { QuestionsRepository } from "../content/questions.repository";
import type {
  LessonQuestion,
  LessonTheoryBite,
} from "../lessons/lessons.service";
import type { Lang } from "../content/content.types";

// MocksService runs alongside LessonsService and reuses much of its surface
// area. The mock is just a lesson_session with mode='mock' — the attempt
// endpoint, complete endpoint, SRS updates, badge evaluation all flow through
// the same machinery. The only mock-specific bits live here:
//   - start: pick N random active questions from a paper, create a session
//     with mode='mock', return the same shape as start-lesson.
//   - breakdown: per-LO accuracy summary after completion.
//   - review: take the wrong-answer question IDs from a completed mock and
//     create a regular lesson session preloaded with them.

export interface StartMockResult {
  session_id: string;
  questions: LessonQuestion[];
  // Always 3 for mocks (we don't decrement), but kept in the response shape
  // so the frontend can use the same SessionDetail type as for lessons.
  hearts_remaining: number;
  // No theory primer in mocks — they're exam-style, not learn-style. Always [].
  theory_bites: LessonTheoryBite[];
  // Mock-specific extras:
  time_limit_seconds: number | null;
  paper_id: string;
}

export interface MockBreakdownEntry {
  lo_id: string;
  lo_code: string;
  lo_title: string;
  total: number;
  correct: number;
  accuracy_pct: number; // 0..100, rounded
}

export interface MockBreakdown {
  session_id: string;
  paper_id: string;
  total: number;
  correct: number;
  per_lo: MockBreakdownEntry[];
  // Question IDs the user got wrong, in queue order. The frontend uses these
  // to feed POST /mocks/:id/review.
  wrong_question_ids: string[];
}

@Injectable()
export class MocksService {
  constructor(
    @Inject(PG) private readonly sql: Sql,
    private readonly sessions: LessonSessionsRepository,
    private readonly sessionQuestions: LessonSessionQuestionsRepository,
    private readonly attempts: AttemptsRepository,
    private readonly questions: QuestionsRepository,
    private readonly lessons: LessonsService
  ) {}

  // POST /mocks — start a new mock for the given paper.
  async start(
    user_id: string,
    lang: Lang,
    opts: {
      paper_id: string;
      question_count: number;
      time_limit_seconds?: number;
    }
  ): Promise<StartMockResult> {
    const queue = await this.questions.findRandomForMock(
      opts.paper_id,
      opts.question_count
    );

    if (queue.length === 0) {
      throw new BadRequestException(
        "no active questions available for this paper — admin must add or activate questions first"
      );
    }

    const session = await this.sessions.create({
      user_id,
      question_count: queue.length,
      mode: "mock",
      paper_id: opts.paper_id,
      time_limit_seconds: opts.time_limit_seconds ?? null,
    });

    await this.sessionQuestions.insertMany(
      session.id,
      queue.map((q) => q.id)
    );

    return {
      session_id: session.id,
      questions: queue.map((q) => this.lessons.toLessonQuestion(q, lang)),
      hearts_remaining: session.hearts_remaining,
      theory_bites: [],
      time_limit_seconds: session.time_limit_seconds,
      paper_id: opts.paper_id,
    };
  }

  // GET /mocks/:id/breakdown — per-LO accuracy after a mock completes.
  // Returns 404 if the session doesn't exist or isn't a mock; 403 if it's
  // someone else's; 400 if it hasn't been completed yet.
  async breakdown(user_id: string, session_id: string): Promise<MockBreakdown> {
    const session = await this.sessions.findById(session_id);
    if (!session) throw new NotFoundException("session not found");
    if (session.mode !== "mock")
      throw new NotFoundException("not a mock session");
    if (session.user_id !== user_id)
      throw new ForbiddenException("session belongs to another user");
    if (!session.completed_at)
      throw new BadRequestException("mock not completed yet");
    if (!session.paper_id)
      throw new BadRequestException(
        "mock has no paper_id — should not happen given chk_mock_has_paper"
      );

    // One SQL: attempts + question→lo join + LO title + correct/total per LO.
    // We pre-aggregate at the LO grain so the response is naturally per-LO.
    type Row = {
      lo_id: string;
      lo_code: string;
      lo_title_en: string;
      total: number;
      correct: number;
    };
    const rows = await this.sql<Row[]>`
      SELECT
        lo.id::text                                              AS lo_id,
        lo.code                                                  AS lo_code,
        lo.title_en                                              AS lo_title_en,
        COUNT(*)::int                                            AS total,
        SUM(CASE WHEN a.was_correct THEN 1 ELSE 0 END)::int      AS correct
      FROM attempts a
      JOIN questions q             ON q.id = a.question_id
      JOIN learning_objectives lo  ON lo.id = q.lo_id
      WHERE a.session_id = ${session_id}
      GROUP BY lo.id
      ORDER BY lo.sort_order ASC, lo.code ASC
    `;

    // Wrong-answer question_ids, preserving session queue order so the review
    // session presents them in the same sequence the user encountered.
    type WrongRow = { question_id: string };
    const wrongRows = await this.sql<WrongRow[]>`
      SELECT a.question_id::text AS question_id
      FROM attempts a
      JOIN lesson_session_questions lsq
        ON lsq.session_id = a.session_id AND lsq.question_id = a.question_id
      WHERE a.session_id = ${session_id}
        AND a.was_correct = FALSE
      ORDER BY lsq.position ASC
    `;

    const per_lo: MockBreakdownEntry[] = rows.map((r) => ({
      lo_id: r.lo_id,
      lo_code: r.lo_code,
      lo_title: r.lo_title_en,
      total: r.total,
      correct: r.correct,
      accuracy_pct: r.total > 0 ? Math.round((r.correct / r.total) * 100) : 0,
    }));

    const total = per_lo.reduce((s, e) => s + e.total, 0);
    const correct = per_lo.reduce((s, e) => s + e.correct, 0);

    return {
      session_id,
      paper_id: session.paper_id,
      total,
      correct,
      per_lo,
      wrong_question_ids: wrongRows.map((r) => r.question_id),
    };
  }

  // POST /mocks/:id/review — create a regular lesson session preloaded with the
  // wrong-answer questions from the mock. The new session is linked back via
  // source_session_id so analytics can pair them.
  //
  // If the mock had no wrong answers, returns 400 with a friendly message —
  // the frontend should hide the review button in that case but we double-check.
  async startReview(
    user_id: string,
    mock_session_id: string,
    lang: Lang
  ): Promise<StartMockResult> {
    const session = await this.sessions.findById(mock_session_id);
    if (!session) throw new NotFoundException("session not found");
    if (session.mode !== "mock")
      throw new NotFoundException("not a mock session");
    if (session.user_id !== user_id)
      throw new ForbiddenException("session belongs to another user");
    if (!session.completed_at)
      throw new BadRequestException("mock not completed yet");

    // Pull the wrong question_ids ordered by their position in the mock queue.
    type WrongRow = { question_id: string };
    const wrongRows = await this.sql<WrongRow[]>`
      SELECT a.question_id::text AS question_id
      FROM attempts a
      JOIN lesson_session_questions lsq
        ON lsq.session_id = a.session_id AND lsq.question_id = a.question_id
      WHERE a.session_id = ${mock_session_id}
        AND a.was_correct = FALSE
      ORDER BY lsq.position ASC
    `;

    if (wrongRows.length === 0) {
      throw new BadRequestException("no wrong questions to review");
    }

    // Load full question rows, filtering out anything that was retired since
    // the mock was taken (rare but possible). If everything got retired, fail
    // gracefully so the frontend can show a helpful message.
    const ids = wrongRows.map((r) => r.question_id);
    const questionRows = await this.questions.findManyByIds(ids, {
      activeOnly: true,
    });
    if (questionRows.length === 0) {
      throw new BadRequestException(
        "all wrong-answer questions have been retired — nothing to review"
      );
    }

    // Preserve the original mock order. Build a lookup so we can re-sort the
    // questionRows (returned in arbitrary DB order) to match the wrong order.
    const wrongOrder = new Map(ids.map((id, i) => [id, i]));
    questionRows.sort(
      (a, b) => (wrongOrder.get(a.id) ?? 0) - (wrongOrder.get(b.id) ?? 0)
    );

    const review = await this.sessions.create({
      user_id,
      question_count: questionRows.length,
      mode: "lesson",
      paper_id: session.paper_id,
      source_session_id: mock_session_id,
    });

    await this.sessionQuestions.insertMany(
      review.id,
      questionRows.map((q) => q.id)
    );

    return {
      session_id: review.id,
      questions: questionRows.map((q) =>
        this.lessons.toLessonQuestion(q, lang)
      ),
      hearts_remaining: review.hearts_remaining,
      // Review sessions DO get theory bites — they're a learning flow, unlike
      // the original mock. Reuse the lessons-service helper.
      theory_bites: await this.lessons.buildTheoryBites(questionRows, lang),
      time_limit_seconds: null,
      paper_id: session.paper_id!,
    };
  }
}
