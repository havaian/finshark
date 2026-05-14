// Mirrors backend/src/content/content.types.ts.
// Two flavours per entity:
//  - "Raw" (admin) — both _en and _ru fields. Used in admin editor pages.
//  - Localized   (public) — single resolved string per field. Used in dashboard, lesson, progress.

export type QuestionType = 'mcq' | 'short_answer';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

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
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface McqOptionRaw {
  key: string;
  text_en: string;
  text_ru: string | null;
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
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface McqOption {
  key: string;
  text: string;
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
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ---- UI translations (admin localization editor) ----

export interface UiTranslation {
  key: string;
  lang: 'en' | 'ru';
  value: string;
  created_at: string;
  updated_at: string;
}
