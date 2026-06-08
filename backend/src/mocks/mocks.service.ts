import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
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
import { PapersRepository } from "../content/papers.repository";
import { UsersRepository } from "../users/users.repository";
import { EntitlementsService } from "../billing/entitlements.service";
import type {
  LessonQuestion,
  LessonTheoryBite,
} from "../lessons/lessons.service";
import type {
  Lang,
  LocalizedMcqOption,
  QuestionDifficulty,
  QuestionType,
  McqOption,
  ExamStructure,
  ExamSection,
} from "../content/content.types";
import {
  pickLocalized,
  pickLocalizedNullable,
  validateExamStructure,
  examTotalMarks,
} from "../content/content.types";

// Free-tier monthly mock quota. Premium = unlimited. Single edit if product
// later wants 2/month free.
const FREE_MOCKS_PER_MONTH = 1;

// MocksService runs alongside LessonsService and reuses much of its surface
// area. The mock is just a lesson_session with mode='mock' - the attempt
// endpoint, complete endpoint, SRS updates, badge evaluation all flow through
// the same machinery. The only mock-specific bits live here:
//   - start: pick N random active questions from a paper, create a session
//     with mode='mock', return the same shape as start-lesson.
//   - breakdown: per-LO accuracy summary after completion.
//   - review: take the wrong-answer question IDs from a completed mock and
//     create a regular lesson session preloaded with them.

// A built section of a started mock: which queue positions belong to it and
// the marks rule that applies. The frontend uses this to render section
// headers ("Section A") and a marks summary; scoring uses it to attribute
// marks per question.
export interface StartMockSection {
  code: string;
  kind: ExamSection["kind"];
  // Number of questions actually placed in this section (may be less than the
  // structure asked for if the paper's pool was short).
  question_count: number;
  // Inclusive queue position range [start_position, end_position] this section
  // occupies, in the flat questions array. end_position < start_position would
  // mean an empty section (shouldn't happen - empty sections are dropped).
  start_position: number;
  end_position: number;
  marks_each: number | null;
  marks_total: number | null;
}

export interface StartMockResult {
  session_id: string;
  questions: LessonQuestion[];
  // Always 3 for mocks (we don't decrement), but kept in the response shape
  // so the frontend can use the same SessionDetail type as for lessons.
  hearts_remaining: number;
  // No theory primer in mocks - they're exam-style, not learn-style. Always [].
  theory_bites: LessonTheoryBite[];
  // Mock-specific extras:
  // Fixed by the paper's exam_structure.duration_seconds (no longer user-set).
  time_limit_seconds: number | null;
  paper_id: string;
  // The exam layout this mock was built to. Lets the frontend show section
  // headers, total available marks, and the pass threshold.
  sections: StartMockSection[];
  total_marks: number;
  pass_mark_pct: number;
}

export interface MockBreakdownEntry {
  lo_id: string;
  lo_code: string;
  lo_title: string;
  total: number;
  correct: number;
  accuracy_pct: number; // 0..100, rounded
}

// Per-section marks summary for a completed mock. marks_available is what the
// section could award (correct count is scored against this); marks_awarded is
// what the candidate earned. For ot sections marks come from marks_each; mtq
// sections are not scored yet (marks_available/awarded both 0) and flagged via
// `scored: false` so the UI can label them "not marked".
export interface MockSectionScore {
  code: string;
  kind: ExamSection["kind"];
  scored: boolean;
  total: number; // questions in the section
  correct: number; // correct answers in the section
  marks_available: number;
  marks_awarded: number;
}

export interface MockBreakdown {
  session_id: string;
  paper_id: string;
  total: number;
  correct: number;
  per_lo: MockBreakdownEntry[];
  // Per-section marks. Empty for legacy flat mocks (no section_code stamped) -
  // those fall back to a single implicit section and rely on per-LO + the
  // overall marks fields below.
  per_section: MockSectionScore[];
  // Overall marks scoring. marks_available is summed across scored sections;
  // marks_awarded is what the candidate earned; percent is the ratio; passed
  // compares percent against the paper's pass mark. pass_mark_pct echoes the
  // threshold used so the UI doesn't need to re-fetch the paper.
  marks_available: number;
  marks_awarded: number;
  percent: number; // 0..100, rounded to 1 dp
  pass_mark_pct: number;
  passed: boolean;
  // Question IDs the user got wrong, in queue order. The frontend uses these
  // to feed POST /mocks/:id/review.
  wrong_question_ids: string[];
}

// One row per question in the mock queue, in queue order. Includes the
// canonical answer + explanation + per-option why-wrong text so the
// frontend can render a read-only review UI (no resubmission). user_answer
// + was_correct are null when the user didn't reach this question (e.g.
// time ran out before they got there).
export interface MockAnswerEntry {
  position: number;
  question_id: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  prompt: string;
  options: LocalizedMcqOption[] | null;
  correct_answer: string;
  explanation: string;
  concept_bite: string | null;
  acceptable_tolerance: number | null;
  lo_code: string;
  lo_title: string;
  user_answer: string | null;
  was_correct: boolean | null;
}

export interface MockAnswers {
  session_id: string;
  paper_id: string;
  total: number;
  correct: number;
  entries: MockAnswerEntry[];
}

@Injectable()
export class MocksService {
  private readonly log = new Logger(MocksService.name);

  constructor(
    @Inject(PG) private readonly sql: Sql,
    private readonly sessions: LessonSessionsRepository,
    private readonly sessionQuestions: LessonSessionQuestionsRepository,
    private readonly attempts: AttemptsRepository,
    private readonly questions: QuestionsRepository,
    private readonly papers: PapersRepository,
    private readonly users: UsersRepository,
    private readonly entitlements: EntitlementsService,
    private readonly lessons: LessonsService
  ) {}

  // POST /mocks - start a new mock for the given paper.
  //
  // The exam format comes entirely from the paper's exam_structure: sections,
  // how many questions each draws, the marks rule, and the duration. We build
  // the queue section by section (in structure order), never repeating a
  // question across sections, stamp each queued row with its section code, and
  // set the session's time limit from the structure's duration.
  async start(
    user_id: string,
    lang: Lang,
    opts: {
      paper_id: string;
    }
  ): Promise<StartMockResult> {
    const paper = await this.papers.findById(opts.paper_id);
    if (!paper) throw new NotFoundException("paper not found");

    // Trust-but-verify the stored structure. The DB guarantees it's a JSON
    // object; this enforces the detailed shape (section kinds, marks rules) so
    // a hand-edited or legacy row can't make the builder misbehave.
    let structure: ExamStructure;
    try {
      structure = validateExamStructure(paper.exam_structure);
    } catch (e) {
      throw new BadRequestException(
        `paper ${paper.code} has an invalid exam_structure: ${
          e instanceof Error ? e.message : "unknown error"
        }`
      );
    }

    // Free-tier gates. Mocks don't touch hearts, so only paper-access and
    // monthly quota apply. Premium users bypass both.
    const entitlement = await this.entitlements.getEntitlement(user_id);
    if (entitlement.tier === "free") {
      if (!paper.free_accessible) {
        throw new ForbiddenException(
          "this paper is available to premium members only"
        );
      }
      const user = await this.users.findById(user_id);
      if (!user) throw new NotFoundException("user not found");
      const mocksThisMonth = await this.sessions.countMocksThisMonthInTimezone(
        user_id,
        user.timezone
      );
      if (mocksThisMonth >= FREE_MOCKS_PER_MONTH) {
        throw new ForbiddenException(
          `free tier: ${FREE_MOCKS_PER_MONTH} mock per month reached - upgrade or wait until next month`
        );
      }
    }

    // ── Build the queue section by section ────────────────────────────
    // We accumulate the flat question list plus a parallel section-code array
    // (one entry per question), and a section layout describing position
    // ranges + marks rules for the response.
    const queue: LessonQuestion[] = [];
    const rawQueueIds: string[] = [];
    const sectionCodes: string[] = [];
    const builtSections: StartMockSection[] = [];

    for (const section of structure.sections) {
      if (section.kind === "mtq") {
        // MTQ (multi-task / constructed response) is scaffolded but DORMANT:
        // there's no MTQ question type and no grader yet. Skip it rather than
        // fabricate objective questions in its place. A paper whose ONLY
        // section is mtq therefore can't yet produce a playable mock - that's
        // correct: we don't ship a broken exam. F1-F3 have no mtq sections.
        this.log.warn(
          `paper ${paper.code} section ${section.code} is kind 'mtq' - skipped (MTQ not yet implemented)`
        );
        continue;
      }

      // OT section: pull `question_count` active questions from the paper's
      // pool, excluding anything earlier sections already took.
      const rows = await this.questions.findRandomForMockExcluding(
        opts.paper_id,
        section.question_count,
        rawQueueIds
      );
      if (rows.length === 0) {
        // Nothing available for this section - skip it (don't emit an empty
        // section in the layout). If every section ends up empty we fail below.
        continue;
      }

      const startPos = queue.length;
      for (const q of rows) {
        queue.push(this.lessons.toLessonQuestion(q, lang));
        rawQueueIds.push(q.id);
        sectionCodes.push(section.code);
      }
      const endPos = queue.length - 1;

      builtSections.push({
        code: section.code,
        kind: section.kind,
        question_count: rows.length,
        start_position: startPos,
        end_position: endPos,
        marks_each: section.marks_each ?? null,
        marks_total: section.marks_total ?? null,
      });
    }

    if (queue.length === 0) {
      throw new BadRequestException(
        "no active questions available for this paper - admin must add or activate questions first"
      );
    }

    // Total available marks reflects what was ACTUALLY built (clamped to the
    // questions present), not the idealised structure - so a short paper
    // doesn't claim marks it can't award. For OT that's per-section
    // question_count * marks_each; mtq sections contribute nothing here since
    // they're skipped.
    const totalMarks = builtSections.reduce((sum, s) => {
      if (s.kind === "ot" && s.marks_each !== null) {
        return sum + s.question_count * s.marks_each;
      }
      return sum;
    }, 0);

    const session = await this.sessions.create({
      user_id,
      question_count: queue.length,
      mode: "mock",
      paper_id: opts.paper_id,
      time_limit_seconds: structure.duration_seconds,
    });

    await this.sessionQuestions.insertMany(
      session.id,
      rawQueueIds,
      sectionCodes
    );

    return {
      session_id: session.id,
      questions: queue,
      hearts_remaining: session.hearts_remaining,
      theory_bites: [],
      time_limit_seconds: session.time_limit_seconds,
      paper_id: opts.paper_id,
      sections: builtSections,
      total_marks: totalMarks,
      pass_mark_pct: structure.pass_mark_pct,
    };
  }

  // GET /mocks/:id/breakdown - per-LO accuracy after a mock completes.
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
        "mock has no paper_id - should not happen given chk_mock_has_paper"
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

    // Per-section correctness, keyed by the section_code stamped on each
    // queued question at start time. Legacy flat mocks have section_code NULL
    // for every row - those collapse into a single NULL-keyed bucket which we
    // handle below as an implicit single section.
    type SectionRow = {
      section_code: string | null;
      total: number;
      correct: number;
    };
    const sectionRows = await this.sql<SectionRow[]>`
      SELECT
        lsq.section_code                                       AS section_code,
        COUNT(*)::int                                          AS total,
        SUM(CASE WHEN a.was_correct THEN 1 ELSE 0 END)::int    AS correct
      FROM attempts a
      JOIN lesson_session_questions lsq
        ON lsq.session_id = a.session_id AND lsq.question_id = a.question_id
      WHERE a.session_id = ${session_id}
      GROUP BY lsq.section_code
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

    // Resolve the paper's exam_structure so we know each section's marks rule.
    // If it's missing/invalid we still return per-LO results, but marks scoring
    // degrades gracefully to an unmarked single section.
    const paper = await this.papers.findById(session.paper_id);
    let structure: ExamStructure | null = null;
    if (paper) {
      try {
        structure = validateExamStructure(paper.exam_structure);
      } catch {
        structure = null;
      }
    }

    // Build per-section scores. We join the attempt-derived counts
    // (sectionRows) to the structure's marks rules by section code. A section
    // present in attempts but not in the structure (or a NULL legacy code) is
    // scored as an unmarked ot-style bucket using the structure's first ot
    // marks_each when available, else not marked.
    const structureByCode = new Map<string, ExamSection>();
    if (structure) {
      for (const s of structure.sections) structureByCode.set(s.code, s);
    }

    const per_section: MockSectionScore[] = sectionRows.map((sr) => {
      const code = sr.section_code ?? "";
      const def = sr.section_code ? structureByCode.get(sr.section_code) : undefined;

      // mtq sections are not scored yet.
      if (def && def.kind === "mtq") {
        return {
          code,
          kind: "mtq",
          scored: false,
          total: sr.total,
          correct: sr.correct,
          marks_available: 0,
          marks_awarded: 0,
        };
      }

      // ot section (defined) or legacy/implicit section (no def): uniform marks.
      // For a defined ot section use its marks_each. For a legacy NULL-coded
      // mock we can't know marks_each, so treat each question as 1 mark - the
      // percent then equals raw accuracy, which is the only sensible fallback.
      const marksEach = def?.marks_each ?? 1;
      return {
        code: code || "A",
        kind: "ot",
        scored: true,
        total: sr.total,
        correct: sr.correct,
        marks_available: sr.total * marksEach,
        marks_awarded: sr.correct * marksEach,
      };
    });

    // Overall marks: sum across scored sections only.
    const marks_available = per_section
      .filter((s) => s.scored)
      .reduce((sum, s) => sum + s.marks_available, 0);
    const marks_awarded = per_section
      .filter((s) => s.scored)
      .reduce((sum, s) => sum + s.marks_awarded, 0);
    const percent =
      marks_available > 0
        ? Math.round((marks_awarded / marks_available) * 1000) / 10
        : 0;
    const pass_mark_pct = structure?.pass_mark_pct ?? 50;
    const passed = marks_available > 0 && percent >= pass_mark_pct;

    return {
      session_id,
      paper_id: session.paper_id,
      total,
      correct,
      per_lo,
      per_section,
      marks_available,
      marks_awarded,
      percent,
      pass_mark_pct,
      passed,
      wrong_question_ids: wrongRows.map((r) => r.question_id),
    };
  }

  // GET /mocks/:id/answers - full per-question review payload. Same access
  // checks as breakdown(): mock-mode session, completed, owned by user. The
  // response is a flat list ordered by queue position so the frontend can
  // render a stack of "review cards" with the user's answer + the correct
  // answer + the explanation. Questions the user didn't reach come back with
  // user_answer = null / was_correct = null so the UI can mark them
  // "unanswered".
  async answers(
    user_id: string,
    session_id: string,
    lang: Lang
  ): Promise<MockAnswers> {
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
        "mock has no paper_id - should not happen given chk_mock_has_paper"
      );

    type Row = {
      position: number;
      question_id: string;
      q_type: QuestionType;
      difficulty: QuestionDifficulty;
      prompt_en: string;
      prompt_ru: string | null;
      options: McqOption[] | null;
      correct_answer_en: string;
      correct_answer_ru: string | null;
      explanation_en: string;
      explanation_ru: string | null;
      concept_bite_en: string | null;
      concept_bite_ru: string | null;
      acceptable_tolerance: number | null;
      lo_code: string;
      lo_title_en: string;
      lo_title_ru: string | null;
      user_answer: string | null;
      was_correct: boolean | null;
    };

    // LEFT JOIN attempts so questions the user never reached still appear in
    // the list (with user_answer = NULL, was_correct = NULL). Ordering by
    // lsq.position keeps the review in the same order the user saw them.
    const rows = await this.sql<Row[]>`
      SELECT
        lsq.position::int                              AS position,
        q.id::text                                     AS question_id,
        q.type                                         AS q_type,
        q.difficulty                                   AS difficulty,
        q.prompt_en                                    AS prompt_en,
        q.prompt_ru                                    AS prompt_ru,
        q.options                                      AS options,
        q.correct_answer_en                            AS correct_answer_en,
        q.correct_answer_ru                            AS correct_answer_ru,
        q.explanation_en                               AS explanation_en,
        q.explanation_ru                               AS explanation_ru,
        q.concept_bite_en                              AS concept_bite_en,
        q.concept_bite_ru                              AS concept_bite_ru,
        q.acceptable_tolerance                         AS acceptable_tolerance,
        lo.code                                        AS lo_code,
        lo.title_en                                    AS lo_title_en,
        lo.title_ru                                    AS lo_title_ru,
        a.user_answer                                  AS user_answer,
        a.was_correct                                  AS was_correct
      FROM lesson_session_questions lsq
      JOIN questions q             ON q.id = lsq.question_id
      JOIN learning_objectives lo  ON lo.id = q.lo_id
      LEFT JOIN attempts a         ON a.session_id = lsq.session_id
                                    AND a.question_id = lsq.question_id
      WHERE lsq.session_id = ${session_id}
      ORDER BY lsq.position ASC
    `;

    const entries: MockAnswerEntry[] = rows.map((r) => ({
      position: r.position,
      question_id: r.question_id,
      type: r.q_type,
      difficulty: r.difficulty,
      prompt: pickLocalized(r.prompt_en, r.prompt_ru, lang),
      options:
        r.options === null
          ? null
          : r.options.map((opt) => ({
              key: opt.key,
              text: pickLocalized(opt.text_en, opt.text_ru, lang),
              why_wrong: pickLocalizedNullable(
                opt.why_wrong_en ?? null,
                opt.why_wrong_ru ?? null,
                lang
              ),
            })),
      // For MCQ correct_answer is the option key (language-neutral).
      // For number_entry it's the canonical value in the user's language.
      correct_answer:
        r.q_type === "mcq"
          ? r.correct_answer_en
          : pickLocalized(r.correct_answer_en, r.correct_answer_ru, lang),
      explanation: pickLocalized(r.explanation_en, r.explanation_ru, lang),
      concept_bite: pickLocalizedNullable(
        r.concept_bite_en,
        r.concept_bite_ru,
        lang
      ),
      acceptable_tolerance: r.acceptable_tolerance,
      lo_code: r.lo_code,
      lo_title: pickLocalized(r.lo_title_en, r.lo_title_ru, lang),
      user_answer: r.user_answer,
      was_correct: r.was_correct,
    }));

    const total = entries.length;
    const correct = entries.filter((e) => e.was_correct === true).length;

    return {
      session_id,
      paper_id: session.paper_id,
      total,
      correct,
      entries,
    };
  }

  // POST /mocks/:id/review - create a regular lesson session preloaded with the
  // wrong-answer questions from the mock. The new session is linked back via
  // source_session_id so analytics can pair them.
  //
  // If the mock had no wrong answers, returns 400 with a friendly message -
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
        "all wrong-answer questions have been retired - nothing to review"
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
      // Review sessions DO get theory bites - they're a learning flow, unlike
      // the original mock. Reuse the lessons-service helper.
      theory_bites: await this.lessons.buildTheoryBites(questionRows, lang),
      time_limit_seconds: null,
      paper_id: session.paper_id!,
      // A review session is a lesson flow, not a timed exam: it has no exam
      // sections and no marks. These fields are part of the shared response
      // shape, so we return empty/zero values rather than fabricate a structure.
      sections: [],
      total_marks: 0,
      pass_mark_pct: 0,
    };
  }
}
