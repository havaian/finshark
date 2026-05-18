// Mirrors backend/src/content/content.types.ts.
// Two flavours per entity:
//  - "Raw" (admin) — both _en and _ru fields. Used in admin editor pages.
//  - Localized   (public) — single resolved string per field. Used in dashboard, lesson, progress.

export type QuestionType = "mcq" | "short_answer" | "number_entry";
export type QuestionDifficulty = "easy" | "medium" | "hard";

// ---- Raw (admin) shapes ----

export interface PaperRaw {
  id: string;
  code: string;
  name_en: string;
  name_ru: string | null;
  created_at: string;
  updated_at: string;
}

export interface LearningObjectiveRaw {
  id: string;
  paper_id: string;
  code: string;
  title_en: string;
  title_ru: string | null;
  description_en: string | null;
  description_ru: string | null;
  // Long-form theory (150-300 words, Kaplan-style). Optional per LO.
  theory_en: string | null;
  theory_ru: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface McqOptionRaw {
  key: string;
  text_en: string;
  text_ru: string | null;
  // Per-option "why this is wrong" explanations, shown after a wrong MCQ answer.
  // Always null on the correct option (storage invariant).
  why_wrong_en: string | null;
  why_wrong_ru: string | null;
}

export interface QuestionRaw {
  id: string;
  lo_id: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;

  prompt_en: string;
  prompt_ru: string | null;

  options: McqOptionRaw[] | null;

  correct_answer_en: string;
  correct_answer_ru: string | null;

  explanation_en: string;
  explanation_ru: string | null;

  concept_bite_en: string | null;
  concept_bite_ru: string | null;

  // number_entry only: absolute ±tolerance; null = exact match.
  acceptable_tolerance: number | null;

  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ---- Localized (public) shapes ----

export interface Paper {
  id: string;
  code: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface LearningObjective {
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

export interface McqOption {
  key: string;
  text: string;
  // Resolved per-option "why this is wrong" — null on the correct option, or
  // when the admin hasn't written one yet.
  why_wrong: string | null;
}

export interface Question {
  id: string;
  lo_id: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  prompt: string;
  options: McqOption[] | null;
  correct_answer: string;
  explanation: string;
  concept_bite: string | null;
  acceptable_tolerance: number | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ---- UI translations (admin localization editor) ----
// Overrides are stored as JSON files on the backend (backend/locales/{lang}.json)
// rather than a DB table, so there are no per-key timestamps. The admin page
// already ignored them; keeping the type lean.

export interface UiTranslation {
  key: string;
  lang: "en" | "ru";
  value: string;
}

// ---- Admin content browser ----

// Shape returned by GET /admin/content/tree — papers with nested LO summaries.
// Powers the sidebar tree on the unified admin content browser. Includes
// per-LO question counts so the UI can badge each LO without follow-up calls.
export interface ContentTreeLo {
  id: string;
  code: string;
  title_en: string;
  title_ru: string | null;
  sort_order: number;
  // True when the LO has a non-null theory_en (a primer is available).
  has_theory: boolean;
  active_count: number;
  draft_count: number;
}

export interface ContentTreePaper {
  id: string;
  code: string;
  name_en: string;
  name_ru: string | null;
  learning_objectives: ContentTreeLo[];
}
