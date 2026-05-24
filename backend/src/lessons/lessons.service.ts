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
import { LearningObjectivesRepository } from "../content/learning-objectives.repository";
import { UsersRepository } from "../users/users.repository";
import { LessonSessionsRepository } from "./lesson-sessions.repository";
import { LessonSessionQuestionsRepository } from "./lesson-session-questions.repository";
import { AttemptsRepository } from "./attempts.repository";
import { UserQuestionStateRepository } from "./user-question-state.repository";
import { GraderService } from "./grader.service";
import { BadgesService } from "../badges/badges.service";
import { AchievementsService } from "../achievements/achievements.service";
import type { SessionMode } from "./lesson.types";
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
  // short_answer retired: lessons only serve active mcq/number_entry questions.
  type: "mcq" | "number_entry";
  difficulty: QuestionDifficulty;
  prompt: string;
  options: LocalizedMcqOption[] | null; // for MCQ
  concept_bite: string | null;
  // Sent to the frontend so it can hint "±X" near the number_entry input.
  // null for non-number_entry questions, and for number_entry questions that
  // require an exact match.
  acceptable_tolerance: number | null;
}

// Per-LO theory primer shown at the top of a lesson. One entry per distinct
// LO in the queue (deduped), in the order the LOs first appear. Frontend can
// show them as a stack of cards before the question flow starts. Optional —
// only LOs with theory_en populated appear here.
export interface LessonTheoryBite {
  lo_id: string;
  lo_code: string;
  lo_title: string;
  theory: string;
}

export interface StartLessonResult {
  session_id: string;
  questions: LessonQuestion[];
  hearts_remaining: number;
  theory_bites: LessonTheoryBite[];
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
  // Badge codes earned by this session-completion. Empty array if none.
  // Frontend uses these to render a one-time toast on the completion screen.
  newly_earned_badges: string[];
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
  theory_bites: LessonTheoryBite[];
  // Session metadata (mocks). For regular lessons, mode='lesson',
  // time_limit_seconds is null, paper_id is null. For mocks, all three are
  // set and the frontend uses them to render the timer + skip the hearts UI.
  mode: SessionMode;
  time_limit_seconds: number | null;
  paper_id: string | null;
  // ISO timestamp of when the session was created. Used by the frontend to
  // compute remaining time on resume: started_at + time_limit_seconds - now.
  started_at: string;
}

const DEFAULT_LESSON_SIZE = 5;

@Injectable()
export class LessonsService {
  constructor(
    @Inject(PG) private readonly sql: Sql,
    private readonly users: UsersRepository,
    private readonly questions: QuestionsRepository,
    private readonly los: LearningObjectivesRepository,
    private readonly sessions: LessonSessionsRepository,
    private readonly sessionQuestions: LessonSessionQuestionsRepository,
    private readonly attempts: AttemptsRepository,
    private readonly uqs: UserQuestionStateRepository,
    private readonly grader: GraderService,
    private readonly badges: BadgesService,
    private readonly achievements: AchievementsService
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
      theory_bites: await this.buildTheoryBites(queue, lang),
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
    // Re-hydrate to QuestionRow → LessonQuestion, preserving order. Keep the
    // raw rows around so we can derive theory bites from their lo_id fields
    // (theory is per-LO, not per-question).
    const hydrated: LessonQuestion[] = [];
    const hydratedRows: QuestionRow[] = [];
    for (const qid of queueIds) {
      const q = await this.questions.findById(qid);
      if (!q) continue; // a question was hard-deleted; skip (rare)
      hydratedRows.push(q);
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
      // Skip theory bites for mocks — they're exam-style, no primer. For
      // lessons (and post-mock review sessions), surface bites as usual.
      theory_bites:
        session.mode === "mock"
          ? []
          : await this.buildTheoryBites(hydratedRows, lang),
      mode: session.mode,
      time_limit_seconds: session.time_limit_seconds,
      paper_id: session.paper_id,
      started_at: session.started_at.toISOString(),
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
    // Mocks ignore hearts entirely (no penalty for wrong answers in CBE-style
    // practice) so the check is gated on mode.
    if (session.mode !== "mock" && session.hearts_remaining <= 0) {
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
    //
    // xp_earned mirrors what we return in the response and what gets summed onto
    // users.xp at session-complete. Persisting it per-attempt lets the leaderboards
    // module compute "XP earned in last N days" without us needing to reconstruct
    // it from correct_count after the fact (which wouldn't survive a future change
    // to scoring rules).
    const xpForThisAttempt = grade.was_correct ? XP_PER_CORRECT : 0;
    const newState = await this.sql.begin(async (tx) => {
      // 1) Record the attempt.
      // `as any`: postgres.js's JSONValue is overly strict; runtime accepts any JSON-serializable value.
      const llmParam =
        grade.llm_grade_json === null
          ? null
          : tx.json(grade.llm_grade_json as any);
      await tx`
        INSERT INTO attempts (session_id, user_id, question_id, user_answer, was_correct, llm_grade_json, xp_earned)
        VALUES (
          ${session_id},
          ${user_id},
          ${question_id},
          ${user_answer},
          ${grade.was_correct},
          ${llmParam},
          ${xpForThisAttempt}
        )
      `;

      // 2) Bump the session's correct_count if applicable, OR decrement hearts
      // on a wrong answer. Either way we read back hearts_remaining for the response.
      // GREATEST(hearts_remaining - 1, 0) prevents underflow against the CHECK constraint
      // even if something else has already zeroed it; we treat zero as terminal regardless.
      //
      // Mocks: never decrement hearts. CBE-style practice doesn't penalize wrong
      // answers mid-session; you just see the section breakdown at the end.
      const isMock = session.mode === "mock";
      const sessionRows = await tx<Array<{ hearts_remaining: number }>>`
        UPDATE lesson_sessions
        SET
          correct_count    = correct_count + ${grade.was_correct ? 1 : 0},
          hearts_remaining = ${
            grade.was_correct || isMock
              ? tx`hearts_remaining`
              : tx`GREATEST(hearts_remaining - 1, 0)`
          }
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
    //
    // Mocks skip this entirely — they end only when the user submits the final
    // answer or hits the time limit (frontend-driven).
    let sessionEnded = false;
    if (session.mode !== "mock" && newState.hearts_remaining <= 0) {
      const ended = await this.sessions.markEndedOutOfHearts(session_id);
      sessionEnded = ended !== null;
    }

    // Resolve language-specific output strings shown after the attempt.
    // For MCQ correct_answer is the option key (language-neutral).
    // For short_answer it's the canonical answer in the user's language.
    const correctAnswerForResponse =
      question.type === "mcq"
        ? question.correct_answer_en
        : pickLocalized(
            question.correct_answer_en,
            question.correct_answer_ru,
            lang
          );

    const explanationForResponse = pickLocalized(
      question.explanation_en,
      question.explanation_ru,
      lang
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
        // Idempotent re-call: we don't re-evaluate badges. Any badges earned
        // by the original completion were toasted at that time; surfacing them
        // again would re-toast on every page reload.
        newly_earned_badges: [],
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

    // Evaluate badges AFTER the user row is updated — the rules read from
    // users.xp / users.streak_count, so they need the post-completion values.
    // Failure here is swallowed by BadgesService and returns []; a badge bug
    // never blocks a lesson completion.
    const newlyEarnedBadges = await this.badges.evaluateAfterSession(user_id);

    // Achievements run on the same hook for the same reason — they read
    // xp / streak / completed-session counts from the post-update state.
    // Failure is swallowed inside AchievementsService and returns []; a
    // bad achievement rule never breaks lesson completion. The unlocks
    // payload is not yet surfaced to the frontend (no toast wiring); we
    // return it so a future UI iteration can show "Level 2 reached!" on
    // the lesson-finale screen.
    const newlyUnlockedAchievements =
      await this.achievements.evaluateAfterSession(user_id);
    void newlyUnlockedAchievements;

    return {
      session_id: completed.id,
      question_count: completed.question_count,
      correct_count: completed.correct_count,
      xp_earned: xpEarned,
      new_xp: updated.xp,
      new_level: updated.level,
      new_streak: updated.streak_count,
      ended_out_of_hearts: completed.ended_out_of_hearts,
      newly_earned_badges: newlyEarnedBadges,
    };
  }

  // ============================================================
  // Queue construction
  // ============================================================
  //
  // Algorithm (current — revised May 2026):
  //  1. Diversified due fetch — at most ONE question per LO, oldest-due first.
  //     This is the key change over textbook SRS: even if 4 questions in the
  //     same LO are all due today, we only pull one of them now. Stops the
  //     "got PESTEL question yesterday, got another PESTEL question today"
  //     pattern that came from packing multiple same-LO items into one lesson.
  //
  //  2. Fill remaining slots with NEW questions from weak LOs (lowest avg
  //     mastery first). One question per LO here too. Within each LO,
  //     prefer questions matching the user's difficulty preference AND with
  //     a high global error rate ("often-wrong weighting" — high error rate
  //     = users get this wrong a lot = worth more exposure).
  //
  //  3. If we STILL don't have `size` questions (i.e. the user has fewer
  //     candidate LOs than the requested lesson size), fall back to "extras"
  //     — additional due questions from LOs already covered. This is the
  //     starvation path; without it, a user with content in only 2 LOs would
  //     get a 2-question lesson even when they asked for 5.
  //
  // Difficulty preference: derived from user's saved preference, or, if NULL
  // ("auto"), the level-based heuristic (level 1-2 easy, 3-5 medium, 6+ hard).
  private async buildQueue(
    user_id: string,
    paper_id: string | null,
    size: number
  ): Promise<QuestionRow[]> {
    // ----- 1. Diversified due fetch -----
    const dueDiversified = await this.uqs.findDueQuestionsDiversified({
      user_id,
      paper_id,
      limit: size,
    });

    const dueQuestions = await Promise.all(
      dueDiversified.map((d) => this.questions.findById(d.question_id))
    );
    const queue: QuestionRow[] = dueQuestions.filter(
      (q): q is QuestionRow => !!q && q.is_active
    );

    // Track LOs covered AND question IDs already picked, so subsequent passes
    // can deduplicate. Both are needed because LO-tracking handles "no two from
    // the same LO" and ID-tracking handles "never the same question twice."
    const coveredLos = new Set<string>(queue.map((q) => q.lo_id));
    const pickedIds = new Set<string>(queue.map((q) => q.id));

    if (queue.length >= size) return queue.slice(0, size);

    // ----- 2. Fill from weak LOs (NEW questions, one per LO, error-biased) -----
    const user = await this.users.findById(user_id);
    if (!user) throw new NotFoundException("user not found");
    const preferred =
      user.preferred_difficulty ?? this.preferredDifficulty(user.level);

    // Over-fetch weak LOs since some may already be covered or have no unseen
    // questions left. Cap at a reasonable upper bound.
    const remaining = size - queue.length;
    const weakLos = await this.uqs.findWeakLos({
      user_id,
      paper_id,
      limit: Math.max(remaining * 3, 8),
    });

    for (const lo of weakLos) {
      if (queue.length >= size) break;
      // Topical diversification: skip LOs that already have a question in the
      // queue. We come back to them only via the extras fallback below.
      if (coveredLos.has(lo.lo_id)) continue;

      const unseen = await this.uqs.findUnseenInLo({
        user_id,
        lo_id: lo.lo_id,
        // Fetch a small candidate set so the bias can pick a good one; we only
        // take the top one from this LO regardless.
        limit: 3,
        preferred_difficulty: preferred,
        error_rate_bias: true,
      });

      for (const u of unseen) {
        if (pickedIds.has(u.id)) continue;
        const q = await this.questions.findById(u.id);
        if (!q || !q.is_active) continue;
        queue.push(q);
        coveredLos.add(q.lo_id);
        pickedIds.add(q.id);
        break; // ← one question per LO; on to the next weak LO.
      }
    }

    if (queue.length >= size) return queue.slice(0, size);

    // ----- 3. Extras fallback (starvation path) -----
    // We exhausted distinct LOs but still need more questions. Pull additional
    // overdue items, allowing the same LO to appear twice (last resort).
    const extras = await this.uqs.findDueQuestionsExtras({
      user_id,
      paper_id,
      exclude_ids: Array.from(pickedIds),
      limit: size - queue.length,
    });
    const extraQuestions = await Promise.all(
      extras.map((e) => this.questions.findById(e.question_id))
    );
    for (const q of extraQuestions) {
      if (queue.length >= size) break;
      if (!q || !q.is_active) continue;
      if (pickedIds.has(q.id)) continue;
      queue.push(q);
      pickedIds.add(q.id);
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
  // why_wrong on each option is shipped along with the option text so the
  // frontend can render per-option explanations on the feedback screen after
  // a wrong answer — no extra API call needed.
  //
  // Public so MocksService can reuse the localization projection for mock
  // sessions without duplicating it.
  toLessonQuestion(q: QuestionRow, lang: Lang): LessonQuestion {
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
              why_wrong: pickLocalizedNullable(
                opt.why_wrong_en ?? null,
                opt.why_wrong_ru ?? null,
                lang
              ),
            })),
      concept_bite: pickLocalizedNullable(
        q.concept_bite_en,
        q.concept_bite_ru,
        lang
      ),
      acceptable_tolerance: q.acceptable_tolerance,
    };
  }

  private toDateString(d: Date): string {
    return d.toISOString().slice(0, 10);
  }

  // Derive per-LO theory bites from a question queue. One entry per distinct
  // LO in the order they first appear, only for LOs whose theory_en is non-null.
  // The LO repo is hit ONCE (batch fetch) regardless of queue size.
  //
  // Public so MocksService can call it when building the mock start response.
  async buildTheoryBites(
    queue: QuestionRow[],
    lang: Lang
  ): Promise<LessonTheoryBite[]> {
    if (queue.length === 0) return [];

    // Distinct LO ids, in first-appearance order.
    const seen = new Set<string>();
    const ordered: string[] = [];
    for (const q of queue) {
      if (seen.has(q.lo_id)) continue;
      seen.add(q.lo_id);
      ordered.push(q.lo_id);
    }

    const rows = await this.los.findManyByIds(ordered);
    const byId = new Map(rows.map((r) => [r.id, r]));

    const bites: LessonTheoryBite[] = [];
    for (const loId of ordered) {
      const lo = byId.get(loId);
      if (!lo) continue;
      const theory = pickLocalizedNullable(lo.theory_en, lo.theory_ru, lang);
      if (!theory) continue; // skip LOs with no theory yet — opt-in per LO
      bites.push({
        lo_id: lo.id,
        lo_code: lo.code,
        lo_title: pickLocalized(lo.title_en, lo.title_ru, lang),
        theory,
      });
    }
    return bites;
  }
}
