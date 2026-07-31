import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";
import { QuestionsRepository } from "../content/questions.repository";
import { LearningObjectivesRepository } from "../content/learning-objectives.repository";
import { PapersRepository } from "../content/papers.repository";
import { UsersRepository } from "../users/users.repository";
import type { UserRow } from "../users/user.types";
import { LessonSessionsRepository } from "./lesson-sessions.repository";
import { LessonSessionQuestionsRepository } from "./lesson-session-questions.repository";
import { AttemptsRepository } from "./attempts.repository";
import { UserQuestionStateRepository } from "./user-question-state.repository";
import { GraderService } from "./grader.service";
import { BadgesService } from "../badges/badges.service";
import {
  AchievementsService,
  type AchievementUnlock,
} from "../achievements/achievements.service";
import { EntitlementsService } from "../billing/entitlements.service";
import type { SessionMode } from "./lesson.types";
import {
  applyMastery,
  applySm2,
  levelFromXp,
  nextStreak,
  qualityFromCorrect,
  streakXpMultiplier,
  toUtcDateOnly,
  xpForAttempt,
  type SrsState,
} from "./srs";
import type {
  Lang,
  LocalizedMcqOption,
  QuestionRow,
  QuestionDifficulty,
  QuestionType,
  LessonQuestionPayload,
} from "../content/content.types";
import {
  pickLocalized,
  pickLocalizedNullable,
  toAnswerFreePayload,
} from "../content/content.types";

// Public shape returned in the lesson queue. Note: NO correct_answer or explanation.
// Those are only revealed in the attempt response, per question, after answering.
// Fields are LANGUAGE-RESOLVED - frontend receives a single string per field.
export interface LessonQuestion {
  id: string;
  // short_answer retired. Widened to the full objective set because MocksService
  // reuses this projection for mock sessions, which can include mcq_multi /
  // true_false / matching. The answer-free structured body (payload) + exhibit
  // for those types are threaded through when fixed-mock playback lands; the
  // daily lesson pool itself still serves mcq / number_entry.
  type: QuestionType;
  difficulty: QuestionDifficulty;
  prompt: string;
  options: LocalizedMcqOption[] | null; // for MCQ
  // Answer-free structured body for true_false / matching (statements+labels or
  // rows+options, WITHOUT the correct answer). null for mcq / mcq_multi /
  // number_entry. Lets a mock render these types without leaking the answer.
  payload: LessonQuestionPayload | null;
  // Localized exhibit panel (e.g. a data extract) shown above the prompt;
  // null when the question has none.
  exhibit: string | null;
  concept_bite: string | null;
  // Sent to the frontend so it can hint "±X" near the number_entry input.
  // null for non-number_entry questions, and for number_entry questions that
  // require an exact match.
  acceptable_tolerance: number | null;
}

// Per-LO theory primer shown at the top of a lesson. One entry per distinct
// LO in the queue (deduped), in the order the LOs first appear. Frontend can
// show them as a stack of cards before the question flow starts. Optional -
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
  // Mastery delta from this single attempt (+10 correct / -20 wrong, clamped
  // by the [0,100] mastery range). Surfaced so the lesson-feedback UI can
  // render a "Mastery 64 → 74 (+10)" chip per attempt - landing the
  // learning signal on every question instead of only at the syllabus
  // heat-map. See applyMastery() in srs.ts.
  mastery_delta: number;
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
  // Total XP awarded for this session, AFTER the streak multiplier is
  // applied. xp_base + xp_streak_bonus = xp_earned. The frontend renders
  // a "+X XP (incl. +Y streak bonus)" line on the finale screen - that's
  // why we surface the breakdown rather than just the total.
  xp_earned: number;
  xp_base: number;
  xp_streak_bonus: number;
  new_xp: number;
  new_level: number;
  new_streak: number;
  // Streak-freeze fields (see srs.ts nextStreak / migration
  // 20260525000002_streak_freezes). new_streak_freezes is the post-session
  // stockpile; the two booleans let the lesson finale render a
  // "Streak saved by a freeze!" / "+1 streak freeze!" banner without the
  // frontend having to diff before/after.
  new_streak_freezes: number;
  freeze_consumed: boolean;
  freeze_granted: boolean;
  ended_out_of_hearts: boolean;
  // Badge codes earned by this session-completion. Empty array if none.
  // Frontend uses these to render a one-time toast on the completion screen.
  newly_earned_badges: string[];
  // Achievement LEVELS crossed during this session, not whole achievements:
  // these are tiered, so the same code can appear again later at a higher
  // level. Previously computed and thrown away with `void` - the client now
  // celebrates them alongside badges.
  newly_unlocked_achievements: AchievementUnlock[];
}

// Returned by GET /lessons/:id - used to resume in-progress sessions after reload.
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

// Free-tier daily lesson quota. Mirrors the spec ("3 lessons/day" free).
// Premium = unlimited. Kept here so the gate is a single edit if product
// later wants 5/day or per-paper limits.
const FREE_LESSONS_PER_DAY = 3;

@Injectable()
export class LessonsService {
  private readonly log = new Logger(LessonsService.name);

  constructor(
    @Inject(PG) private readonly sql: Sql,
    private readonly users: UsersRepository,
    private readonly questions: QuestionsRepository,
    private readonly los: LearningObjectivesRepository,
    private readonly papers: PapersRepository,
    private readonly sessions: LessonSessionsRepository,
    private readonly sessionQuestions: LessonSessionQuestionsRepository,
    private readonly attempts: AttemptsRepository,
    private readonly uqs: UserQuestionStateRepository,
    private readonly grader: GraderService,
    private readonly badges: BadgesService,
    private readonly achievements: AchievementsService,
    private readonly entitlements: EntitlementsService
  ) {}

  // Daily refresh of the question_error_rates summary table. The lesson queue
  // builder reads error rates from that table (via findUnseenInLo) instead of
  // aggregating the whole attempts table on every weak-LO lookup. Error rates
  // drift slowly, so once-a-day freshness is plenty.
  //
  // Runs at 00:45 UTC - staggered after the mastery-snapshot job (00:30, in
  // ProfileStatsService) so the two heavy nightly aggregations don't contend.
  // Failure is logged and swallowed: a stale error-rate table just means the
  // often-wrong weighting uses yesterday's numbers, which is harmless. The
  // queue builder also tolerates an entirely empty table (neutral default).
  @Cron("45 0 * * *", {
    name: "question-error-rates",
  })
  async refreshErrorRatesJob(): Promise<void> {
    try {
      const n = await this.uqs.refreshErrorRates();
      this.log.log(`refreshed error rates for ${n} questions`);
    } catch (e) {
      this.log.error(
        `question error-rate refresh failed: ${(e as Error).message}`
      );
    }
  }

  // ---- start ----

  async start(
    user_id: string,
    lang: Lang,
    opts: { paper_id?: string; size?: number }
  ): Promise<StartLessonResult> {
    // Free-tier gates. Premium users skip every check below - they get the
    // pre-billing behavior unchanged.
    //
    // We load the user row once and reuse it. The entitlement query is a
    // separate cheap indexed lookup.
    const user = await this.users.findById(user_id);
    if (!user) throw new NotFoundException("user not found");

    const entitlement = await this.entitlements.getEntitlement(user_id);
    const isFree = entitlement.tier === "free";

    // Free-tier heart pool, captured from the refill below so the post-session
    // hearts clamp can reuse it without a second user SELECT. Stays null for
    // premium (no pool concept).
    let freeHeartPool: number | null = null;

    if (isFree) {
      // 1. Paper-access gate. If the user picked a paper that's marked
      //    premium-only, refuse. We resolve the paper by id (preferred when
      //    explicit) or by the user's saved preferred_paper_id; both can be
      //    null (the queue builder will fall back to global LO selection).
      const paperIdForGate = opts.paper_id ?? user.preferred_paper_id;
      if (paperIdForGate) {
        const paper = await this.papers.findById(paperIdForGate);
        if (paper && !paper.free_accessible) {
          throw new ForbiddenException(
            "this paper is available to premium members only"
          );
        }
      }

      // 2. Daily lesson quota. count BEFORE we create the new session so the
      //    cap is a hard stop, not "you can have 4 if you race".
      const lessonsToday = await this.sessions.countLessonsTodayInTimezone(
        user_id,
        user.timezone
      );
      if (lessonsToday >= FREE_LESSONS_PER_DAY) {
        throw new ForbiddenException(
          `free tier: ${FREE_LESSONS_PER_DAY} lessons/day reached - upgrade or come back tomorrow`
        );
      }

      // 3. Heart pool. Refill if it's a new local day, then refuse if empty.
      //    The pool IS the session hearts: the new session below is created
      //    with the default 3 by the repo, then we override it to min(pool, 3)
      //    so the user can't get more hearts than the pool allows. We keep the
      //    refilled value around (freeHeartPool) so the clamp below doesn't
      //    have to re-read the user row.
      const pool = await this.users.ensureFreeHeartPoolRefilled(user_id);
      freeHeartPool = pool;
      if (pool <= 0) {
        throw new ForbiddenException(
          "you're out of hearts for today - come back tomorrow or upgrade to premium"
        );
      }
    }

    // Resolve lesson size precedence: explicit request param > user's saved
    // preference > module default. The settings UI doesn't currently send size
    // per-call - it just updates the stored preference - but accepting both
    // keeps the API flexible (e.g. for future "extra practice" buttons).
    const size = opts.size ?? user.lesson_size ?? DEFAULT_LESSON_SIZE;

    const queue = await this.buildQueue(user, opts.paper_id ?? null, size, lang);

    if (queue.length === 0) {
      // With B3 in force, "nothing available" now has a third cause beyond
      // "empty paper" and "nothing due": the paper has questions, but none of
      // them are translated into the language the user is studying in. Say so,
      // otherwise this reads as a bug to anyone on RU/UZ.
      throw new BadRequestException(
        lang === "en"
          ? "no questions available - either the paper has no questions yet, or you have nothing due and no new content to learn"
          : "no questions available in your language yet - this paper has no content translated into the language you're studying in"
      );
    }

    const session = await this.sessions.create({
      user_id,
      question_count: queue.length,
    });

    // For free users: clamp the session's starting hearts to the daily pool.
    // For premium: leave the default 3 untouched.
    let heartsForResponse = session.hearts_remaining;
    if (isFree) {
      // Reuse the pool value captured from ensureFreeHeartPoolRefilled above
      // (same request, refilled microseconds ago) rather than re-SELECTing the
      // user row. freeHeartPool is guaranteed non-null here because isFree
      // means we ran the refill branch.
      const pool = freeHeartPool ?? 0;
      const startingHearts = Math.min(pool, session.hearts_remaining);
      if (startingHearts !== session.hearts_remaining) {
        await this.sessions.overrideHearts(session.id, startingHearts);
        heartsForResponse = startingHearts;
      }
    }

    await this.sessionQuestions.insertMany(
      session.id,
      queue.map((q) => q.id)
    );

    return {
      session_id: session.id,
      questions: queue.map((q) => this.toLessonQuestion(q, lang)),
      hearts_remaining: heartsForResponse,
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
    //
    // One batched fetch instead of a per-id findById loop. We deliberately do
    // NOT filter to active-only here: a resume must replay the FULL original
    // queue even if a question was retired mid-session, otherwise the answered-
    // question indexing on the frontend skips the wrong slots. Only genuinely
    // hard-deleted rows (absent from the map) are dropped, matching the old
    // `if (!q) continue` behaviour.
    const byId = await this.fetchQuestionsById(queueIds);
    const hydrated: LessonQuestion[] = [];
    const hydratedRows: QuestionRow[] = [];
    for (const qid of queueIds) {
      const q = byId.get(qid);
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
      // Skip theory bites for mocks - they're exam-style, no primer. For
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
    //
    // Scoring is now difficulty-weighted via xpForAttempt() - see srs.ts for the
    // tables. Hard correct = 14 XP, easy correct = 10 XP, etc. Repeat wrongs
    // still award 0; first-encounter wrongs get partial credit scaled by
    // difficulty (2/3/4). Streak bonus is applied at session-complete, not
    // per-attempt, so the per-attempt response shows the base XP a user can
    // mentally tally.
    // Mocks award no XP. The exam-style flow is the reward - adding XP per
    // attempt blurred the line between "study to learn" (lessons) and "test
    // yourself" (mocks). Streak still ticks for mock completion (sessions
    // count as activity); only the XP credit is zeroed here.
    const isFirstEncounter = prevState === null;
    const xpForThisAttempt =
      session.mode === "mock"
        ? 0
        : xpForAttempt({
            difficulty: question.difficulty,
            was_correct: grade.was_correct,
            is_first_encounter: isFirstEncounter,
          });
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

    // Free-tier pool deduction. Mirrors the session-level decrement above but
    // on users.free_hearts_pool so the cap persists across sessions. Done
    // OUTSIDE the attempt tx - losing the pool delta is acceptable (worst case
    // the user gets one bonus heart back tomorrow); losing the attempt isn't.
    //
    // Skipped for: mocks (no heart penalty), correct answers, and premium users.
    // We only check entitlement on wrong answers in non-mock sessions, so the
    // hot path of premium players answering correctly stays a no-op here.
    if (session.mode !== "mock" && !grade.was_correct) {
      const entitlement = await this.entitlements.getEntitlement(user_id);
      if (entitlement.tier === "free") {
        await this.users.consumeFreeHeart(user_id);
      }
    }

    // Out-of-hearts auto-end. Runs OUTSIDE the attempt tx so the attempt is
    // persisted even if the end-session write hits a transient error - we'd
    // rather have an attempt recorded with stale completed_at than lose both.
    // markEndedOutOfHearts is idempotent (returns null if already completed).
    //
    // Mocks skip this entirely - they end only when the user submits the final
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
            question.correct_answer_uz,
            lang
          );

    const explanationForResponse = pickLocalized(
      question.explanation_en,
      question.explanation_ru,
      question.explanation_uz,
      lang
    );

    // Mastery delta = the change between the pre-attempt mastery (0 if this
    // is the user's first encounter) and the post-attempt mastery. The
    // applyMastery() function in srs.ts already clamps to [0, 100], so the
    // delta naturally compresses near the bounds (e.g. a wrong answer at
    // mastery=10 produces -10, not -20).
    const masteryBefore = prevState?.mastery_score ?? 0;
    const masteryAfter = newState.mastery.mastery_score;
    const masteryDelta = masteryAfter - masteryBefore;

    return {
      was_correct: grade.was_correct,
      correct_answer: correctAnswerForResponse,
      explanation: explanationForResponse,
      mastery_score: newState.mastery.mastery_score,
      mastery_delta: masteryDelta,
      next_due_date: this.toDateString(newState.mastery.due_date),
      xp_earned: xpForThisAttempt,
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
        xp_base: 0,
        xp_streak_bonus: 0,
        new_xp: user.xp,
        new_level: user.level,
        new_streak: user.streak_count,
        // Idempotent re-call: freeze movement already happened on the first
        // complete, so we report the steady-state count with both flags off.
        new_streak_freezes: user.streak_freezes_remaining,
        freeze_consumed: false,
        freeze_granted: false,
        ended_out_of_hearts: session.ended_out_of_hearts,
        // Idempotent re-call: we don't re-evaluate badges. Any badges earned
        // by the original completion were toasted at that time; surfacing them
        // again would re-toast on every page reload.
        newly_earned_badges: [],
        newly_unlocked_achievements: [],
      };
    }

    const completed = await this.sessions.markCompleted(session_id);
    if (!completed) {
      // Race: someone else completed it in between. Re-fetch and treat as idempotent.
      return this.complete(user_id, session_id);
    }

    // Compute the deltas.
    //
    // 1. Base XP = sum of per-attempt xp_earned (already difficulty-weighted).
    //    We deliberately do NOT derive XP from correct_count * XP_PER_CORRECT
    //    because that would discard partial-credit XP and difficulty weighting.
    //
    // 2. Streak XP bonus = multiplier on top of base, gated on the streak
    //    AFTER applying nextStreak() - so a session that bumps the streak
    //    1 → 2 uses the new value (2 days × 1% = +2%). This matches the
    //    user expectation that "today's lesson keeps my streak going" should
    //    immediately count in the bonus.
    //
    // Out-of-hearts sessions still get XP/streak for the questions they DID
    // answer correctly - running out of hearts is a soft fail, not a forfeit.
    const xpBase = await this.attempts.sumXpInSession(session_id);
    const user = await this.users.findById(user_id);
    if (!user) throw new NotFoundException("user not found");

    const today = toUtcDateOnly(new Date());
    const streakResult = nextStreak(
      user.streak_count,
      user.last_active_date,
      today,
      user.streak_freezes_remaining
    );

    const multiplier = streakXpMultiplier(streakResult.streak);
    // Round half-up so the user sees clean integers in the UI. The base value
    // is already integer (sum of integers), so the streak bonus is the only
    // fractional source.
    const xpEarned = Math.round(xpBase * multiplier);
    const xpStreakBonus = xpEarned - xpBase;
    const newXp = user.xp + xpEarned;
    const newLevel = levelFromXp(newXp);

    const updated = await this.users.applySessionResult({
      id: user_id,
      xp: newXp,
      level: newLevel,
      streak_count: streakResult.streak,
      streak_freezes_remaining: streakResult.freezes_remaining,
      last_active_date: today,
    });

    // Evaluate badges AND achievements AFTER the user row is updated - both
    // read post-completion users.xp / users.streak_count (and completed-session
    // counts), so they need the updated values. They're independent of each
    // other and each swallows its own errors internally (returning []), so we
    // run them concurrently - one failing can't reject the other, and it halves
    // the post-completion latency on the user's path to the finale screen.
    //
    // newlyUnlockedAchievements is not yet surfaced to the frontend (no toast
    // wiring); we still evaluate it so progress advances, and discard the
    // return for now. A future UI iteration can show "Level 2 reached!".
    const [newlyEarnedBadges, newlyUnlockedAchievements] = await Promise.all([
      this.badges.evaluateAfterSession(user_id),
      this.achievements.evaluateAfterSession(user_id),
    ]);

    return {
      session_id: completed.id,
      question_count: completed.question_count,
      correct_count: completed.correct_count,
      xp_earned: xpEarned,
      xp_base: xpBase,
      xp_streak_bonus: xpStreakBonus,
      new_xp: updated.xp,
      new_level: updated.level,
      new_streak: updated.streak_count,
      new_streak_freezes: updated.streak_freezes_remaining,
      freeze_consumed: streakResult.freeze_consumed,
      freeze_granted: streakResult.freeze_granted,
      ended_out_of_hearts: completed.ended_out_of_hearts,
      newly_earned_badges: newlyEarnedBadges,
      newly_unlocked_achievements: newlyUnlockedAchievements,
    };
  }

  // ============================================================
  // Queue construction
  // ============================================================
  //
  // Algorithm (current - revised July 2026):
  //  1. Diversified due fetch - at most ONE question per LO, oldest-due first.
  //     This is the key change over textbook SRS: even if 4 questions in the
  //     same LO are all due today, we only pull one of them now. Stops the
  //     "got PESTEL question yesterday, got another PESTEL question today"
  //     pattern that came from packing multiple same-LO items into one lesson.
  //
  //  2. Fill remaining slots with NEW questions from weak LOs (lowest avg
  //     mastery first). One question per LO here too. Within each LO,
  //     prefer questions matching the user's difficulty preference AND with
  //     a high global error rate ("often-wrong weighting" - high error rate
  //     = users get this wrong a lot = worth more exposure).
  //
  //  2b. SECOND SWEEP. Pass 2 is capped at one question per LO, so a paper
  //     with 6 LOs could never build a lesson longer than 6 no matter what
  //     the user set in Settings - which is exactly the "asked for 10, got 6"
  //     report. Once every distinct LO has contributed, sweep the weak-LO list
  //     again (still weakest-first) taking a 2nd, then 3rd, ... question per
  //     LO until the queue reaches `size` or the eligible pool is exhausted.
  //     Diversification is preserved as a PRIORITY rather than a hard cap:
  //     every LO gets one slot before any LO gets two.
  //
  //  3. If we STILL don't have `size` questions, fall back to "extras" -
  //     additional DUE questions from LOs already covered. This only helps
  //     returning users (it reads user_question_state, which is empty for a
  //     new account), which is why the second sweep above is the real fix.
  //
  // Difficulty preference: derived from user's saved preference, or, if NULL
  // ("auto"), the level-based heuristic (level 1-2 easy, 3-5 medium, 6+ hard).
  //
  // Language (B3): every pass filters to questions fully translated into
  // `lang`, in SQL rather than after hydration - otherwise a LIMIT would be
  // spent on rows we then discard, producing short lessons again.
  //
  // `user` is passed in by the caller (start()) which has already loaded the
  // row - avoids a redundant findById here on the hot path.
  private async buildQueue(
    user: UserRow,
    paper_id: string | null,
    size: number,
    lang: Lang
  ): Promise<QuestionRow[]> {
    const user_id = user.id;

    // ----- 1. Diversified due fetch -----
    const dueDiversified = await this.uqs.findDueQuestionsDiversified({
      user_id,
      paper_id,
      limit: size,
      lang,
    });

    // Batch-fetch the question rows in ONE query, then re-order to match the
    // diversified result (oldest-due first). findManyByIds doesn't guarantee
    // input order, so we index by id and walk the original sequence. activeOnly
    // pushes the is_active filter into SQL so we don't hydrate retired rows.
    const dueIds = dueDiversified.map((d) => d.question_id);
    const dueById = await this.fetchQuestionsById(dueIds, { activeOnly: true });
    const queue: QuestionRow[] = [];
    for (const id of dueIds) {
      const q = dueById.get(id);
      if (q) queue.push(q);
    }

    // Track LOs covered AND question IDs already picked, so subsequent passes
    // can deduplicate. Both are needed because LO-tracking handles "no two from
    // the same LO" and ID-tracking handles "never the same question twice."
    const coveredLos = new Set<string>(queue.map((q) => q.lo_id));
    const pickedIds = new Set<string>(queue.map((q) => q.id));

    if (queue.length >= size) return queue.slice(0, size);

    // ----- 2. Fill from weak LOs (NEW questions, one per LO, error-biased) -----
    const preferred =
      user.preferred_difficulty ?? this.preferredDifficulty(user.level);

    // Over-fetch weak LOs since some may already be covered or have no unseen
    // questions left. Cap at a reasonable upper bound.
    const remaining = size - queue.length;
    const weakLos = await this.uqs.findWeakLos({
      user_id,
      paper_id,
      limit: Math.max(remaining * 3, 8),
      lang,
    });

    // Gather one candidate id per eligible weak LO first, then hydrate them all
    // in a single batched query. findUnseenInLo only returns ids+difficulty
    // (cheap), so the per-LO loop stays one query each; the expensive full-row
    // fetch is collapsed into one findManyByIds call instead of one per pick.
    const weakCandidateIds: string[] = [];
    const weakCoveredLos = new Set<string>(coveredLos);
    for (const lo of weakLos) {
      if (weakCandidateIds.length >= remaining) break;
      // Topical diversification: skip LOs that already have a question in the
      // queue. We come back to them only via the extras fallback below.
      if (weakCoveredLos.has(lo.lo_id)) continue;

      const unseen = await this.uqs.findUnseenInLo({
        user_id,
        lo_id: lo.lo_id,
        // Fetch a small candidate set so the bias can pick a good one; we only
        // take the top one from this LO regardless.
        limit: 3,
        preferred_difficulty: preferred,
        error_rate_bias: true,
        lang,
      });

      // Take the first candidate from this LO that isn't already picked. We
      // tentatively reserve the LO so two weak LOs can't both contribute the
      // same (shared) id; final is_active filtering happens after hydration.
      for (const u of unseen) {
        if (pickedIds.has(u.id)) continue;
        if (weakCandidateIds.includes(u.id)) continue;
        weakCandidateIds.push(u.id);
        weakCoveredLos.add(lo.lo_id);
        break; // ← one question per LO; on to the next weak LO.
      }
    }

    const weakById = await this.fetchQuestionsById(weakCandidateIds, {
      activeOnly: true,
    });
    for (const id of weakCandidateIds) {
      if (queue.length >= size) break;
      const q = weakById.get(id);
      if (!q) continue; // retired between the id fetch and now, or inactive
      if (pickedIds.has(q.id)) continue;
      if (coveredLos.has(q.lo_id)) continue;
      queue.push(q);
      coveredLos.add(q.lo_id);
      pickedIds.add(q.id);
    }

    if (queue.length >= size) return queue.slice(0, size);

    // ----- 2b. Second sweep: revisit weak LOs for additional questions -----
    // Pass 2 hard-capped itself at one question per LO. With F1 at 6 LOs, F2 at
    // 6 and F3 at 7, that made those numbers the real ceiling on lesson length
    // regardless of the user's Settings choice. Now that every distinct LO has
    // had its turn, go round again - weakest LO first - taking one more
    // question per LO per round until we hit `size` or run out of eligible
    // unseen questions.
    //
    // Round-robin rather than draining one LO at a time: a user who asks for
    // 10 on a 6-LO paper gets 6 distinct LOs then a 2nd question from the four
    // weakest, instead of four extra questions all from the single weakest LO.
    //
    // `lastRoundAdded` guards termination: if a full round adds nothing (every
    // remaining LO is out of unseen, translated questions) we stop rather than
    // loop forever.
    if (queue.length < size && weakLos.length > 0) {
      let lastRoundAdded = 1;
      while (queue.length < size && lastRoundAdded > 0) {
        lastRoundAdded = 0;
        for (const lo of weakLos) {
          if (queue.length >= size) break;

          const more = await this.uqs.findUnseenInLo({
            user_id,
            lo_id: lo.lo_id,
            limit: 1,
            preferred_difficulty: preferred,
            error_rate_bias: true,
            lang,
            // Exclude everything already queued so each round returns a
            // genuinely new row for this LO.
            exclude_ids: Array.from(pickedIds),
          });
          if (more.length === 0) continue;

          const hydrated = await this.fetchQuestionsById(
            more.map((m) => m.id),
            { activeOnly: true }
          );
          for (const cand of more) {
            if (queue.length >= size) break;
            const q = hydrated.get(cand.id);
            if (!q) continue; // retired between the id fetch and now
            if (pickedIds.has(q.id)) continue;
            queue.push(q);
            pickedIds.add(q.id);
            coveredLos.add(q.lo_id);
            lastRoundAdded++;
          }
        }
      }
    }

    if (queue.length >= size) return queue.slice(0, size);

    // ----- 3. Extras fallback (starvation path) -----
    // We exhausted distinct LOs AND every unseen question in them, but still
    // need more. Pull additional overdue items, allowing the same LO to appear
    // twice (last resort). Only helps returning users - user_question_state is
    // empty for a new account, which is why 2b above is the real fix for the
    // "asked for 10, got 6" case.
    const extras = await this.uqs.findDueQuestionsExtras({
      user_id,
      paper_id,
      exclude_ids: Array.from(pickedIds),
      limit: size - queue.length,
      lang,
    });
    const extraIds = extras.map((e) => e.question_id);
    const extraById = await this.fetchQuestionsById(extraIds, {
      activeOnly: true,
    });
    for (const id of extraIds) {
      if (queue.length >= size) break;
      const q = extraById.get(id);
      if (!q) continue;
      if (pickedIds.has(q.id)) continue;
      queue.push(q);
      pickedIds.add(q.id);
    }

    return queue;
  }

  // Batch-hydrate question rows by id into a Map keyed by id, preserving
  // nothing about order (callers re-order from their own id sequence). Empty
  // input short-circuits to an empty map with no query. Centralised so the
  // three buildQueue passes and getSession share one batched fetch instead of
  // looping findById per id (the old N+1).
  private async fetchQuestionsById(
    ids: string[],
    opts?: { activeOnly?: boolean }
  ): Promise<Map<string, QuestionRow>> {
    if (ids.length === 0) return new Map();
    const rows = await this.questions.findManyByIds(ids, opts);
    return new Map(rows.map((r) => [r.id, r]));
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
  // a wrong answer - no extra API call needed.
  //
  // Public so MocksService can reuse the localization projection for mock
  // sessions without duplicating it.
  toLessonQuestion(q: QuestionRow, lang: Lang): LessonQuestion {
    return {
      id: q.id,
      type: q.type,
      difficulty: q.difficulty,
      prompt: pickLocalized(q.prompt_en, q.prompt_ru, q.prompt_uz, lang),
      options:
        q.options === null
          ? null
          : q.options.map((opt) => ({
              key: opt.key,
              text: pickLocalized(
                opt.text_en,
                opt.text_ru,
                opt.text_uz ?? null,
                lang
              ),
              why_wrong: pickLocalizedNullable(
                opt.why_wrong_en ?? null,
                opt.why_wrong_ru ?? null,
                opt.why_wrong_uz ?? null,
                lang
              ),
            })),
      // Answer-free body for true_false / matching; null for the other types.
      payload: toAnswerFreePayload(q, lang),
      // Localized exhibit panel; null when the question has none.
      exhibit: pickLocalizedNullable(
        q.exhibit_en,
        q.exhibit_ru,
        q.exhibit_uz,
        lang
      ),
      concept_bite: pickLocalizedNullable(
        q.concept_bite_en,
        q.concept_bite_ru,
        q.concept_bite_uz,
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
      // B3 applied to theory: an LO primer that has no translation in the
      // active language is SKIPPED, not shown in English. Theory bites are
      // already opt-in per LO (missing theory just omits the card), so
      // dropping one degrades cleanly - whereas an English primer above
      // Uzbek questions is exactly the mixed-language reading experience the
      // rule exists to prevent.
      const theory =
        lang === "en"
          ? lo.theory_en
          : lang === "ru"
            ? lo.theory_ru
            : lo.theory_uz;
      if (!theory || theory.trim() === "") continue; // no primer in this language
      bites.push({
        lo_id: lo.id,
        lo_code: lo.code,
        lo_title: pickLocalized(lo.title_en, lo.title_ru, lo.title_uz, lang),
        theory,
      });
    }
    return bites;
  }
}
