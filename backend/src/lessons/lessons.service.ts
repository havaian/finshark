import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";
import { QuestionsRepository } from "../content/questions.repository";
import { UsersRepository } from "../users/users.repository";
import { LessonSessionsRepository } from "./lesson-sessions.repository";
import { LessonSessionQuestionsRepository } from "./lesson-session-questions.repository";
import { AttemptsRepository } from "./attempts.repository";
import { UserQuestionStateRepository } from "./user-question-state.repository";
import { GraderService } from "./grader.service";
import {
  applyMastery,
  applySm2,
  levelFromXp,
  nextStreak,
  qualityFromCorrect,
  toUtcDateOnly,
  XP_PER_CORRECT,
  type SrsState,
} from "./srs";
import type {
  Lang,
  LocalizedMcqOption,
  QuestionRow,
  QuestionDifficulty,
} from "../content/content.types";
import { pickLocalized, pickLocalizedNullable } from "../content/content.types";

// Public shape returned in the lesson queue. Note: NO correct_answer or explanation.
// Those are only revealed in the attempt response, per question, after answering.
// Fields are LANGUAGE-RESOLVED — frontend receives a single string per field.
export interface LessonQuestion {
  id: string;
  type: "mcq" | "short_answer";
  difficulty: QuestionDifficulty;
  prompt: string;
  options: LocalizedMcqOption[] | null; // for MCQ
  concept_bite: string | null;
}

export interface StartLessonResult {
  session_id: string;
  questions: LessonQuestion[];
  hearts_remaining: number;
}

export interface AttemptResult {
  was_correct: boolean;
  correct_answer: string;
  explanation: string;
  mastery_score: number;
  next_due_date: string; // 'YYYY-MM-DD'
  xp_earned: number; // just for this attempt
  hearts_remaining: number;
  // True when this wrong answer triggered out-of-hearts auto-end. Frontend uses
  // this to show the "out of hearts" finale instead of advancing to the next question.
  session_ended_out_of_hearts: boolean;
}

export interface CompleteLessonResult {
  session_id: string;
  question_count: number;
  correct_count: number;
  xp_earned: number;
  new_xp: number;
  new_level: number;
  new_streak: number;
  ended_out_of_hearts: boolean;
}

// Returned by GET /lessons/:id — used to resume in-progress sessions after reload.
// `questions` is the FULL original queue; `answered_question_ids` lets the UI skip ahead.
export interface SessionDetail {
  session_id: string;
  completed_at: string | null;
  question_count: number;
  correct_count: number;
  hearts_remaining: number;
  ended_out_of_hearts: boolean;
  questions: LessonQuestion[];
  answered_question_ids: string[];
}

const DEFAULT_LESSON_SIZE = 5;

@Injectable()
export class LessonsService {
  constructor(
    @Inject(PG) private readonly sql: Sql,
    private readonly users: UsersRepository,
    private readonly questions: QuestionsRepository,
    private readonly sessions: LessonSessionsRepository,
    private readonly sessionQuestions: LessonSessionQuestionsRepository,
    private readonly attempts: AttemptsRepository,
    private readonly uqs: UserQuestionStateRepository,
    private readonly grader: GraderService
  ) {}

  // ---- start ----

  async start(
    user_id: string,
    lang: Lang,
    opts: { paper_id?: string; size?: number }
  ): Promise<StartLessonResult> {
    // Resolve lesson size precedence: explicit request param > user's saved
    // preference > module default. The settings UI doesn't currently send size
    // per-call — it just updates the stored preference — but accepting both
    // keeps the API flexible (e.g. for future "extra practice" buttons).
    let size = opts.size;
    if (size === undefined) {
      const user = await this.users.findById(user_id);
      size = user?.lesson_size ?? DEFAULT_LESSON_SIZE;
    }

    const queue = await this.buildQueue(user_id, opts.paper_id ?? null, size);

    if (queue.length === 0) {
      throw new BadRequestException(
        "no questions available — either the paper has no questions yet, or you have nothing due and no new content to learn"
      );
    }

    const session = await this.sessions.create({
      user_id,
      question_count: queue.length,
    });

    await this.sessionQuestions.insertMany(
      session.id,
      queue.map((q) => q.id)
    );

    return {
      session_id: session.id,
      questions: queue.map((q) => this.toLessonQuestion(q, lang)),
      hearts_remaining: session.hearts_remaining,
    };
  }

  // ---- get (for resume) ----

  async getSession(
    user_id: string,
    lang: Lang,
    session_id: string
  ): Promise<SessionDetail> {
    const session = await this.sessions.findById(session_id);
    if (!session) throw new NotFoundException("session not found");
    if (session.user_id !== user_id)
      throw new ForbiddenException("session belongs to another user");

    const queueIds = await this.sessionQuestions.findBySession(session_id);
    // Re-hydrate to QuestionRow → LessonQuestion, preserving order.
    const hydrated: LessonQuestion[] = [];
    for (const qid of queueIds) {
      const q = await this.questions.findById(qid);
      if (!q) continue; // a question was hard-deleted; skip (rare)
      hydrated.push(this.toLessonQuestion(q, lang));
    }

    const answered = await this.attempts.questionIdsInSession(session_id);

    return {
      session_id: session.id,
      completed_at: session.completed_at
        ? session.completed_at.toISOString()
        : null,
      question_count: session.question_count,
      correct_count: session.correct_count,
      hearts_remaining: session.hearts_remaining,
      ended_out_of_hearts: session.ended_out_of_hearts,
      questions: hydrated,
      answered_question_ids: answered,
    };
  }

  // ---- attempt ----

  async submitAttempt(
    user_id: string,
    lang: Lang,
    session_id: string,
    question_id: string,
    user_answer: string
  ): Promise<AttemptResult> {
    const session = await this.sessions.findById(session_id);
    if (!session) throw new NotFoundException("session not found");
    if (session.user_id !== user_id)
      throw new ForbiddenException("session belongs to another user");
    if (session.completed_at)
      throw new BadRequestException("session already completed");

    // Defense in depth: if hearts hit 0 we already auto-completed on the previous
    // attempt. This branch only fires if the client raced before getting the
    // completed_at marker; clean response so the client can show the finale.
    if (session.hearts_remaining <= 0) {
      throw new BadRequestException("session ended: no hearts remaining");
    }

    const question = await this.questions.findById(question_id);
    if (!question) throw new NotFoundException("question not found");
    if (!question.is_active)
      throw new BadRequestException("question is retired");

    // Prevent double-answering the same question within a session.
    const answeredIds = await this.attempts.questionIdsInSession(session_id);
    if (answeredIds.includes(question_id)) {
      throw new BadRequestException(
        "question already answered in this session"
      );
    }

    // Grade.
    // Kept OUTSIDE the transaction: short-answer grading may call an external LLM
    // and can take seconds. Holding a Postgres connection open across that is bad
    // for connection-pool throughput.
    const grade = await this.grader.grade(question, user_id, user_answer, lang);

    // Pre-compute SRS deltas using the latest state, so the transaction body is purely writes.
    const prevState = await this.uqs.findOne(user_id, question_id);
    const today = toUtcDateOnly(new Date());

    const srsPrev: SrsState = prevState
      ? {
          ease_factor: prevState.ease_factor,
          interval_days: prevState.interval_days,
          repetitions: prevState.repetitions,
          due_date: prevState.due_date,
        }
      : {
          ease_factor: 2.5,
          interval_days: 0,
          repetitions: 0,
          due_date: today,
        };

    const srsNext = applySm2(
      srsPrev,
      qualityFromCorrect(grade.was_correct),
      today
    );
    const masteryNext = applyMastery(
      prevState?.mastery_score ?? 0,
      grade.was_correct
    );

    // All three writes (attempt, session counter, SRS state) succeed or fail together.
    // postgres.js: sql.begin gives a transaction-scoped Sql; we use raw SQL here rather
    // than refactoring every repo to accept an optional tx handle, which would be churn
    // for one critical path.
    const newState = await this.sql.begin(async (tx) => {
      // 1) Record the attempt.
      // `as any`: postgres.js's JSONValue is overly strict; runtime accepts any JSON-serializable value.
      const llmParam =
        grade.llm_grade_json === null
          ? null
          : tx.json(grade.llm_grade_json as any);
      await tx`
        INSERT INTO attempts (session_id, user_id, question_id, user_answer, was_correct, llm_grade_json)
        VALUES (
          ${session_id},
          ${user_id},
          ${question_id},
          ${user_answer},
          ${grade.was_correct},
          ${llmParam}
        )
      `;

      // 2) Bump the session's correct_count if applicable, OR decrement hearts
      // on a wrong answer. Either way we read back hearts_remaining for the response.
      // GREATEST(hearts_remaining - 1, 0) prevents underflow against the CHECK constraint
      // even if something else has already zeroed it; we treat zero as terminal regardless.
      const sessionRows = await tx<Array<{ hearts_remaining: number }>>`
        UPDATE lesson_sessions
        SET
          correct_count    = correct_count + ${grade.was_correct ? 1 : 0},
          hearts_remaining = ${grade.was_correct
            ? tx`hearts_remaining`
            : tx`GREATEST(hearts_remaining - 1, 0)`}
        WHERE id = ${session_id}
        RETURNING hearts_remaining
      `;
      const heartsAfter = sessionRows[0]?.hearts_remaining ?? 0;

      // 3) Upsert SRS + mastery state.
      const rows = await tx<Array<{ mastery_score: number; due_date: Date }>>`
        INSERT INTO user_question_state (
          user_id, question_id, ease_factor, interval_days, repetitions, due_date,
          mastery_score, times_seen, times_correct, last_seen_at
        )
        VALUES (
          ${user_id},
          ${question_id},
          ${srsNext.ease_factor},
          ${srsNext.interval_days},
          ${srsNext.repetitions},
          ${srsNext.due_date},
          ${masteryNext},
          1,
          ${grade.was_correct ? 1 : 0},
          NOW()
        )
        ON CONFLICT (user_id, question_id) DO UPDATE SET
          ease_factor    = EXCLUDED.ease_factor,
          interval_days  = EXCLUDED.interval_days,
          repetitions    = EXCLUDED.repetitions,
          due_date       = EXCLUDED.due_date,
          mastery_score  = EXCLUDED.mastery_score,
          times_seen     = user_question_state.times_seen + 1,
          times_correct  = user_question_state.times_correct + ${
            grade.was_correct ? 1 : 0
          },
          last_seen_at   = NOW()
        RETURNING mastery_score, due_date
      `;
      return { mastery: rows[0], hearts_remaining: heartsAfter };
    });

    // Out-of-hearts auto-end. Runs OUTSIDE the attempt tx so the attempt is
    // persisted even if the end-session write hits a transient error — we'd
    // rather have an attempt recorded with stale completed_at than lose both.
    // markEndedOutOfHearts is idempotent (returns null if already completed).
    let sessionEnded = false;
    if (newState.hearts_remaining <= 0) {
      const ended = await this.sessions.markEndedOutOfHearts(session_id);
      sessionEnded = ended !== null;
    }

    // Resolve language-specific output strings shown after the attempt.
    // For MCQ correct_answer is the option key (language-neutral).
    // For short_answer it's the canonical answer in the user's language.
    const correctAnswerForResponse =
      question.type === 'mcq'
        ? question.correct_answer_en
        : pickLocalized(question.correct_answer_en, question.correct_answer_ru, lang);

    const explanationForResponse = pickLocalized(
      question.explanation_en,
      question.explanation_ru,
      lang,
    );

    return {
      was_correct: grade.was_correct,
      correct_answer: correctAnswerForResponse,
      explanation: explanationForResponse,
      mastery_score: newState.mastery.mastery_score,
      next_due_date: this.toDateString(newState.mastery.due_date),
      xp_earned: grade.was_correct ? XP_PER_CORRECT : 0,
      hearts_remaining: newState.hearts_remaining,
      session_ended_out_of_hearts: sessionEnded,
    };
  }

  // ---- complete ----

  async complete(
    user_id: string,
    session_id: string
  ): Promise<CompleteLessonResult> {
    const session = await this.sessions.findById(session_id);
    if (!session) throw new NotFoundException("session not found");
    if (session.user_id !== user_id)
      throw new ForbiddenException("session belongs to another user");

    // Idempotent-ish: if already completed, surface the existing state rather than re-bumping XP.
    if (session.completed_at) {
      const user = await this.users.findById(user_id);
      if (!user) throw new NotFoundException("user not found");
      return {
        session_id: session.id,
        question_count: session.question_count,
        correct_count: session.correct_count,
        xp_earned: 0,
        new_xp: user.xp,
        new_level: user.level,
        new_streak: user.streak_count,
        ended_out_of_hearts: session.ended_out_of_hearts,
      };
    }

    const completed = await this.sessions.markCompleted(session_id);
    if (!completed) {
      // Race: someone else completed it in between. Re-fetch and treat as idempotent.
      return this.complete(user_id, session_id);
    }

    // Compute the deltas. XP comes from correct attempts in this session;
    // streak is based on the user's last_active_date.
    // Out-of-hearts sessions still get XP/streak for the questions they DID answer
    // correctly — running out of hearts is a soft fail, not a forfeit.
    const xpEarned = completed.correct_count * XP_PER_CORRECT;
    const user = await this.users.findById(user_id);
    if (!user) throw new NotFoundException("user not found");

    const today = toUtcDateOnly(new Date());
    const newXp = user.xp + xpEarned;
    const newLevel = levelFromXp(newXp);
    const newStreak = nextStreak(
      user.streak_count,
      user.last_active_date,
      today
    );

    const updated = await this.users.applySessionResult({
      id: user_id,
      xp: newXp,
      level: newLevel,
      streak_count: newStreak,
      last_active_date: today,
    });

    return {
      session_id: completed.id,
      question_count: completed.question_count,
      correct_count: completed.correct_count,
      xp_earned: xpEarned,
      new_xp: updated.xp,
      new_level: updated.level,
      new_streak: updated.streak_count,
      ended_out_of_hearts: completed.ended_out_of_hearts,
    };
  }

  // ============================================================
  // Queue construction
  // ============================================================
  //
  // Algorithm:
  //  1. Fill with overdue items (due_date <= today) — pure SRS reviews.
  //  2. If short, fill with new questions from weak LOs (lowest avg mastery first,
  //     LOs the user has never touched go first since avg_mastery is NULL).
  //  3. Difficulty preference is derived from how the user is doing globally:
  //     - level 1-2  → prefer easy
  //     - level 3-5  → prefer medium
  //     - level 6+   → prefer hard
  //     (Crude but enough for MVP. Better heuristic later.)
  private async buildQueue(
    user_id: string,
    paper_id: string | null,
    size: number
  ): Promise<QuestionRow[]> {
    const due = await this.uqs.findDueQuestions({
      user_id,
      paper_id,
      limit: size,
    });

    // Hydrate due IDs into full questions.
    const dueQuestions = await Promise.all(
      due.map((d) => this.questions.findById(d.question_id))
    );
    const queue: QuestionRow[] = dueQuestions.filter(
      (q): q is QuestionRow => !!q && q.is_active
    );

    if (queue.length >= size) return queue.slice(0, size);

    // Need more — pull from weak LOs.
    const user = await this.users.findById(user_id);
    if (!user) throw new NotFoundException("user not found");
    // User-set preference overrides the level-based heuristic. NULL = "auto".
    const preferred = user.preferred_difficulty ?? this.preferredDifficulty(user.level);
    const remaining = size - queue.length;

    // Pick weak LOs to pull from. We over-fetch a bit so we have alternatives if
    // a given LO has no unseen questions left.
    const weakLos = await this.uqs.findWeakLos({
      user_id,
      paper_id,
      limit: Math.max(remaining * 2, 5),
    });

    // Question IDs we already have queued (don't dup).
    const seen = new Set(queue.map((q) => q.id));

    for (const lo of weakLos) {
      if (queue.length >= size) break;
      const need = size - queue.length;
      const unseen = await this.uqs.findUnseenInLo({
        user_id,
        lo_id: lo.lo_id,
        limit: need,
        preferred_difficulty: preferred,
      });
      for (const u of unseen) {
        if (queue.length >= size) break;
        if (seen.has(u.id)) continue;
        const q = await this.questions.findById(u.id);
        if (!q || !q.is_active) continue;
        queue.push(q);
        seen.add(q.id);
      }
    }

    return queue;
  }

  // ---- helpers ----

  private preferredDifficulty(level: number): "easy" | "medium" | "hard" {
    if (level <= 2) return "easy";
    if (level <= 5) return "medium";
    return "hard";
  }

  // Project a raw QuestionRow to the language-resolved client shape.
  private toLessonQuestion(q: QuestionRow, lang: Lang): LessonQuestion {
    return {
      id: q.id,
      type: q.type,
      difficulty: q.difficulty,
      prompt: pickLocalized(q.prompt_en, q.prompt_ru, lang),
      options:
        q.options === null
          ? null
          : q.options.map((opt) => ({
              key: opt.key,
              text: pickLocalized(opt.text_en, opt.text_ru, lang),
            })),
      concept_bite: pickLocalizedNullable(q.concept_bite_en, q.concept_bite_ru, lang),
    };
  }

  private toDateString(d: Date): string {
    return d.toISOString().slice(0, 10);
  }
}
