// Mirrors db/migrations/20260511000003_content_and_srs.js
//                  + db/migrations/20260513000001_i18n.js

// short_answer retired (Grading Spec): no faithful auto-marked ACCA format.
// Legacy rows are converted/removed by migration 20260524000002; the grader
// still fails closed on any unexpected type value as a defensive backstop.
export type QuestionType = "mcq" | "number_entry";
export type QuestionDifficulty = "easy" | "medium" | "hard";

// ----------------------------------------------------------------
// Exam structure (per-paper mock definition)
// ----------------------------------------------------------------
// Mirrors papers.exam_structure JSONB (migration
// 20260608000001_programs_and_exam_structure). This is the data-driven
// description of how a mock for a paper is built and scored - the mock engine
// reads it instead of hardcoding question counts / durations per paper.
//
// A section is one of two kinds:
//   - "ot"  : objective test (mcq / number_entry). Uniform marks via
//             marks_each. correct => marks_each, wrong/unanswered => 0.
//             This is all ACCA Applied Knowledge (F1-F3) and all CFA Level I
//             use - same shape, different data.
//   - "mtq" : multi-task / constructed response (ACCA F4-F9 Section B).
//             Non-uniform, part-marked, carries marks_total. Defined here as a
//             forward-compatible shape but DORMANT: there is no MTQ question
//             type and no MTQ grader yet, so no seeded paper uses an mtq
//             section. The mock engine recognises the kind and refuses to
//             build/score it until the grader exists, rather than guessing.
export type ExamSectionKind = "ot" | "mtq";

export interface ExamSection {
  // Section label as shown to the candidate, e.g. "A". Unique within a paper.
  code: string;
  kind: ExamSectionKind;
  // How many questions this section draws. For "ot" this is the count of
  // objective questions pulled from the paper's pool.
  question_count: number;
  // Uniform marks per question. Required for "ot"; the section's available
  // marks = question_count * marks_each. Omitted for "mtq".
  marks_each?: number;
  // Total marks for a non-uniform section. Used by "mtq" (part-marked);
  // omitted for "ot" where marks are derived from marks_each.
  marks_total?: number;
}

export interface ExamStructure {
  // Total exam time in seconds (e.g. 7200 = 120 min). The mock countdown and
  // the stored time_limit_seconds derive from this.
  duration_seconds: number;
  // Pass threshold as a percentage of available marks (0..100). ACCA = 50.
  pass_mark_pct: number;
  sections: ExamSection[];
}

// Runtime validation for an exam_structure JSONB blob read from the DB or sent
// by an admin. The DB only guarantees "is a JSON object"; this enforces the
// detailed shape so the mock engine can trust what it reads. Returns the
// validated structure (same reference) or throws Error with a precise reason.
export function validateExamStructure(input: unknown): ExamStructure {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new Error("exam_structure must be a JSON object");
  }
  const s = input as Record<string, unknown>;
  if (typeof s.duration_seconds !== "number" || s.duration_seconds <= 0) {
    throw new Error("exam_structure.duration_seconds must be a positive number");
  }
  if (
    typeof s.pass_mark_pct !== "number" ||
    s.pass_mark_pct < 0 ||
    s.pass_mark_pct > 100
  ) {
    throw new Error("exam_structure.pass_mark_pct must be between 0 and 100");
  }
  if (!Array.isArray(s.sections) || s.sections.length === 0) {
    throw new Error("exam_structure.sections must be a non-empty array");
  }
  const seenCodes = new Set<string>();
  const sections: ExamSection[] = s.sections.map((raw, i) => {
    if (typeof raw !== "object" || raw === null || Array.isArray(raw)) {
      throw new Error(`exam_structure.sections[${i}] must be an object`);
    }
    const sec = raw as Record<string, unknown>;
    if (typeof sec.code !== "string" || sec.code.trim() === "") {
      throw new Error(`exam_structure.sections[${i}].code must be a non-empty string`);
    }
    if (seenCodes.has(sec.code)) {
      throw new Error(`exam_structure.sections[${i}].code "${sec.code}" is duplicated`);
    }
    seenCodes.add(sec.code);
    if (sec.kind !== "ot" && sec.kind !== "mtq") {
      throw new Error(`exam_structure.sections[${i}].kind must be "ot" or "mtq"`);
    }
    if (
      typeof sec.question_count !== "number" ||
      !Number.isInteger(sec.question_count) ||
      sec.question_count <= 0
    ) {
      throw new Error(
        `exam_structure.sections[${i}].question_count must be a positive integer`
      );
    }
    if (sec.kind === "ot") {
      if (
        typeof sec.marks_each !== "number" ||
        sec.marks_each <= 0
      ) {
        throw new Error(
          `exam_structure.sections[${i}] (ot) requires a positive marks_each`
        );
      }
    } else {
      // mtq
      if (
        typeof sec.marks_total !== "number" ||
        sec.marks_total <= 0
      ) {
        throw new Error(
          `exam_structure.sections[${i}] (mtq) requires a positive marks_total`
        );
      }
    }
    return {
      code: sec.code,
      kind: sec.kind,
      question_count: sec.question_count,
      marks_each: typeof sec.marks_each === "number" ? sec.marks_each : undefined,
      marks_total:
        typeof sec.marks_total === "number" ? sec.marks_total : undefined,
    };
  });
  return {
    duration_seconds: s.duration_seconds,
    pass_mark_pct: s.pass_mark_pct,
    sections,
  };
}

// Total available marks across all sections of a structure. For "ot" sections
// this is question_count * marks_each; for "mtq" it's marks_total.
export function examTotalMarks(structure: ExamStructure): number {
  return structure.sections.reduce((sum, sec) => {
    if (sec.kind === "ot") return sum + sec.question_count * (sec.marks_each ?? 0);
    return sum + (sec.marks_total ?? 0);
  }, 0);
}

// Total question count across all sections.
export function examTotalQuestions(structure: ExamStructure): number {
  return structure.sections.reduce((sum, sec) => sum + sec.question_count, 0);
}

// The real ACCA Applied Knowledge (F1-F3) CBE structure: 120 minutes, a single
// objective-test section of 35 questions worth 2 marks each (70 marks), 50%
// pass. Used as the default when an admin creates a paper without specifying a
// structure, and by the seed runner for the seeded F-papers. Kept in sync with
// the migration's own (migration-local) copy in
// 20260608000001_programs_and_exam_structure.js - migrations can't import app
// code, so the value is duplicated there by necessity; if you change the
// canonical exam format, update both.
export const ACCA_APPLIED_KNOWLEDGE_STRUCTURE: ExamStructure = {
  duration_seconds: 7200,
  pass_mark_pct: 50,
  sections: [{ code: "A", kind: "ot", question_count: 35, marks_each: 2 }],
};

// The default program every paper falls back to when none is specified. ACCA
// is the only program shipped today.
export const DEFAULT_PROGRAM_CODE = "acca";

// Supported UI/content languages. Add to this tuple to add a language;
// the type system will then force every consumer to handle it.
export const SUPPORTED_LANGS = ["en", "ru"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];
// Default for requests with no explicit language signal (no ?lang, no X-Lang,
// no matching Accept-Language). The ACCA exam is in English, so EN is the
// sensible fallback. Authenticated clients send X-Lang from the user's saved
// locale, so this only affects anonymous/headerless requests.
export const DEFAULT_LANG: Lang = "en";

// Raw row shapes - store BOTH languages. _en is required (canonical), _ru is optional.
// Frontend / public-facing layer either picks one (via Accept-Language) and
// resolves with fallback, or returns both (for the admin editor).

// A certification track (ACCA, CFA, ...). Mirrors the programs table from
// migration 20260608000001. Papers belong to exactly one program. unit_noun is
// a labelling hint ('paper' for ACCA, 'level' for CFA) the frontend maps to an
// i18n string; it carries no behaviour.
export interface ProgramRow {
  id: string;
  code: string;
  name_en: string;
  name_ru: string | null;
  unit_noun: string;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface PaperRow {
  id: string;
  code: string;
  name_en: string;
  name_ru: string | null;
  // Whether this paper is reachable on the free tier. Default true on creation;
  // admin can flip it to lock a paper behind premium. See migration
  // 20260525000006_papers_free_accessible.js.
  free_accessible: boolean;
  // FK to programs.id (migration 20260608000001). NOT NULL at the DB level -
  // every paper belongs to a program. Existing papers were backfilled to ACCA.
  program_id: string;
  // Per-paper mock definition (sections / marks / duration / pass mark). NOT
  // NULL at the DB level - every paper knows how its mock is built. Stored as
  // JSONB; postgres.js returns it already parsed. Validate with
  // validateExamStructure() before trusting the detailed shape.
  exam_structure: ExamStructure;
  created_at: Date;
  updated_at: Date;
}

export interface LearningObjectiveRow {
  id: string;
  paper_id: string;
  code: string;
  title_en: string;
  title_ru: string | null;
  description_en: string | null;
  description_ru: string | null;
  // Long-form theory (150-300 words, Kaplan-style). Optional; surfaces as a
  // pre-lesson primer. _en is canonical; _ru optional and falls back to _en.
  theory_en: string | null;
  theory_ru: string | null;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

// Inner shape of questions.options JSONB for MCQ.
export interface McqOption {
  key: string; // "A" | "B" | ... - admin-defined but app validates
  text_en: string;
  text_ru: string | null; // optional; falls back to text_en in clients
  // Per-option "why this is wrong" explanations, shown to the user after
  // submitting a wrong answer on MCQ. Always null for the correct option.
  // Optional during content authoring; admin UI shows a hint when missing.
  why_wrong_en?: string | null;
  why_wrong_ru?: string | null;
}

export interface QuestionRow {
  id: string;
  lo_id: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;

  prompt_en: string;
  prompt_ru: string | null;

  options: McqOption[] | null; // only set when type = 'mcq'

  // For MCQ, correct_answer_en holds the option KEY (e.g. "A") - same across
  // languages, so correct_answer_ru is always NULL for MCQ.
  // For short_answer, both _en and _ru can hold canonical strings; the grader
  // matches against whichever the user is currently answering in.
  correct_answer_en: string;
  correct_answer_ru: string | null;

  explanation_en: string;
  explanation_ru: string | null;

  concept_bite_en: string | null;
  concept_bite_ru: string | null;

  // number_entry questions: absolute tolerance for matching. NULL for mcq /
  // short_answer (and for number_entry questions that require exact match).
  acceptable_tolerance: number | null;

  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// ----------------------------------------------------------------
// Localized projection - what we return on PUBLIC (non-admin) endpoints.
// Single resolved string per field, computed from (lang, fallback to _en).
// ----------------------------------------------------------------

export interface LocalizedMcqOption {
  key: string;
  text: string;
  // Per-option "why this is wrong" - language-resolved. Null for the correct
  // option, or for options where the admin didn't provide an explanation.
  why_wrong: string | null;
}

export interface LocalizedProgram {
  id: string;
  code: string;
  name: string;
  unit_noun: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface LocalizedPaper {
  id: string;
  code: string;
  name: string;
  free_accessible: boolean;
  program_id: string;
  // The mock definition is language-neutral structural data, so it passes
  // through unchanged on the localized projection - the frontend needs it to
  // show "35 questions, 120 min" on the mock start screen.
  exam_structure: ExamStructure;
  created_at: string;
  updated_at: string;
}

// The public paper listing (GET /papers) shape: a localized paper plus the
// number of active questions it has. The onboarding goal step uses the count
// to mark empty papers as "coming soon" and keep them out of the first-lesson
// target selection. Computed at the controller layer (the count isn't a column
// on the paper row), so it lives as a distinct type rather than on LocalizedPaper.
export interface PublicPaperListItem extends LocalizedPaper {
  active_question_count: number;
}

export interface LocalizedLearningObjective {
  id: string;
  paper_id: string;
  code: string;
  title: string;
  description: string | null;
  theory: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface LocalizedQuestion {
  id: string;
  lo_id: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  prompt: string;
  options: LocalizedMcqOption[] | null;
  correct_answer: string;
  explanation: string;
  concept_bite: string | null;
  acceptable_tolerance: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

// Pick a localized string with fallback to EN. Used pervasively.
export function pickLocalized(
  en: string,
  ru: string | null,
  lang: Lang
): string {
  if (lang === "ru") return ru ?? en;
  return en;
}
export function pickLocalizedNullable(
  en: string | null,
  ru: string | null,
  lang: Lang
): string | null {
  if (lang === "ru") return ru ?? en;
  return en;
}

export function toLocalizedProgram(
  row: ProgramRow,
  lang: Lang
): LocalizedProgram {
  return {
    id: row.id,
    code: row.code,
    name: pickLocalized(row.name_en, row.name_ru, lang),
    unit_noun: row.unit_noun,
    sort_order: row.sort_order,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

export function toLocalizedPaper(row: PaperRow, lang: Lang): LocalizedPaper {
  return {
    id: row.id,
    code: row.code,
    name: pickLocalized(row.name_en, row.name_ru, lang),
    free_accessible: row.free_accessible,
    program_id: row.program_id,
    exam_structure: row.exam_structure,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

export function toLocalizedLo(
  row: LearningObjectiveRow,
  lang: Lang
): LocalizedLearningObjective {
  return {
    id: row.id,
    paper_id: row.paper_id,
    code: row.code,
    title: pickLocalized(row.title_en, row.title_ru, lang),
    description: pickLocalizedNullable(
      row.description_en,
      row.description_ru,
      lang
    ),
    theory: pickLocalizedNullable(row.theory_en, row.theory_ru, lang),
    sort_order: row.sort_order,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

export function toLocalizedQuestion(
  row: QuestionRow,
  lang: Lang
): LocalizedQuestion {
  return {
    id: row.id,
    lo_id: row.lo_id,
    type: row.type,
    difficulty: row.difficulty,
    prompt: pickLocalized(row.prompt_en, row.prompt_ru, lang),
    options:
      row.options === null
        ? null
        : row.options.map((opt) => ({
            key: opt.key,
            text: pickLocalized(opt.text_en, opt.text_ru, lang),
            why_wrong: pickLocalizedNullable(
              opt.why_wrong_en ?? null,
              opt.why_wrong_ru ?? null,
              lang
            ),
          })),
    correct_answer:
      row.type === "mcq"
        ? row.correct_answer_en // option key - same in every language
        : pickLocalized(row.correct_answer_en, row.correct_answer_ru, lang),
    explanation: pickLocalized(row.explanation_en, row.explanation_ru, lang),
    concept_bite: pickLocalizedNullable(
      row.concept_bite_en,
      row.concept_bite_ru,
      lang
    ),
    acceptable_tolerance: row.acceptable_tolerance,
    is_active: row.is_active,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}
