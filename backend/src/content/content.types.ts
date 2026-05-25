// Mirrors db/migrations/20260511000003_content_and_srs.js
//                  + db/migrations/20260513000001_i18n.js

// short_answer retired (Grading Spec): no faithful auto-marked ACCA format.
// Legacy rows are converted/removed by migration 20260524000002; the grader
// still fails closed on any unexpected type value as a defensive backstop.
export type QuestionType = "mcq" | "number_entry";
export type QuestionDifficulty = "easy" | "medium" | "hard";

// Supported UI/content languages. Add to this tuple to add a language;
// the type system will then force every consumer to handle it.
export const SUPPORTED_LANGS = ["en", "ru"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];
// Default for requests with no explicit language signal (no ?lang, no X-Lang,
// no matching Accept-Language). The ACCA exam is in English, so EN is the
// sensible fallback. Authenticated clients send X-Lang from the user's saved
// locale, so this only affects anonymous/headerless requests.
export const DEFAULT_LANG: Lang = "en";

// Raw row shapes — store BOTH languages. _en is required (canonical), _ru is optional.
// Frontend / public-facing layer either picks one (via Accept-Language) and
// resolves with fallback, or returns both (for the admin editor).

export interface PaperRow {
  id: string;
  code: string;
  name_en: string;
  name_ru: string | null;
  // Whether this paper is reachable on the free tier. Default true on creation;
  // admin can flip it to lock a paper behind premium. See migration
  // 20260525000006_papers_free_accessible.js.
  free_accessible: boolean;
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
  key: string; // "A" | "B" | ... — admin-defined but app validates
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

  // For MCQ, correct_answer_en holds the option KEY (e.g. "A") — same across
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
// Localized projection — what we return on PUBLIC (non-admin) endpoints.
// Single resolved string per field, computed from (lang, fallback to _en).
// ----------------------------------------------------------------

export interface LocalizedMcqOption {
  key: string;
  text: string;
  // Per-option "why this is wrong" — language-resolved. Null for the correct
  // option, or for options where the admin didn't provide an explanation.
  why_wrong: string | null;
}

export interface LocalizedPaper {
  id: string;
  code: string;
  name: string;
  free_accessible: boolean;
  created_at: string;
  updated_at: string;
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

export function toLocalizedPaper(row: PaperRow, lang: Lang): LocalizedPaper {
  return {
    id: row.id,
    code: row.code,
    name: pickLocalized(row.name_en, row.name_ru, lang),
    free_accessible: row.free_accessible,
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
        ? row.correct_answer_en // option key — same in every language
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
