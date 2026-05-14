// Mirrors db/migrations/20260511000003_content_and_srs.js
//                  + db/migrations/20260513000001_i18n.js

export type QuestionType = 'mcq' | 'short_answer';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

// Supported UI/content languages. Add to this tuple to add a language;
// the type system will then force every consumer to handle it.
export const SUPPORTED_LANGS = ['en', 'ru'] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];
export const DEFAULT_LANG: Lang = 'ru';

// Raw row shapes — store BOTH languages. _en is required (canonical), _ru is optional.
// Frontend / public-facing layer either picks one (via Accept-Language) and
// resolves with fallback, or returns both (for the admin editor).

export interface PaperRow {
  id: string;
  code: string;
  name_en: string;
  name_ru: string | null;
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
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

// Inner shape of questions.options JSONB for MCQ.
export interface McqOption {
  key: string;             // "A" | "B" | ... — admin-defined but app validates
  text_en: string;
  text_ru: string | null;  // optional; falls back to text_en in clients
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
}

export interface LocalizedPaper {
  id: string;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface LocalizedLearningObjective {
  id: string;
  paper_id: string;
  code: string;
  title: string;
  description: string | null;
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
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ----------------------------------------------------------------
// Helpers
// ----------------------------------------------------------------

// Pick a localized string with fallback to EN. Used pervasively.
export function pickLocalized(en: string, ru: string | null, lang: Lang): string {
  if (lang === 'ru') return ru ?? en;
  return en;
}
export function pickLocalizedNullable(
  en: string | null,
  ru: string | null,
  lang: Lang,
): string | null {
  if (lang === 'ru') return ru ?? en;
  return en;
}

export function toLocalizedPaper(row: PaperRow, lang: Lang): LocalizedPaper {
  return {
    id: row.id,
    code: row.code,
    name: pickLocalized(row.name_en, row.name_ru, lang),
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

export function toLocalizedLo(
  row: LearningObjectiveRow,
  lang: Lang,
): LocalizedLearningObjective {
  return {
    id: row.id,
    paper_id: row.paper_id,
    code: row.code,
    title: pickLocalized(row.title_en, row.title_ru, lang),
    description: pickLocalizedNullable(row.description_en, row.description_ru, lang),
    sort_order: row.sort_order,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

export function toLocalizedQuestion(
  row: QuestionRow,
  lang: Lang,
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
          })),
    correct_answer:
      row.type === 'mcq'
        ? row.correct_answer_en // option key — same in every language
        : pickLocalized(row.correct_answer_en, row.correct_answer_ru, lang),
    explanation: pickLocalized(row.explanation_en, row.explanation_ru, lang),
    concept_bite: pickLocalizedNullable(row.concept_bite_en, row.concept_bite_ru, lang),
    is_active: row.is_active,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}
