// Mirrors backend/src/content/content.types.ts.
// Two flavours per entity:
//  - "Raw" (admin) - both _en and _ru fields. Used in admin editor pages.
//  - Localized   (public) - single resolved string per field. Used in dashboard, lesson, progress.

// short_answer retired (Grading Spec): no faithful ACCA auto-marked format.
// Mirrors the backend QuestionType, which now permits only these two.
export type QuestionType = "mcq" | "number_entry";
export type QuestionDifficulty = "easy" | "medium" | "hard";

// ---- Raw (admin) shapes ----

export interface PaperRaw {
  id: string;
  code: string;
  name_en: string;
  name_ru: string | null;
  name_uz: string | null;
  // Free-tier access flag. When false, only premium users can start lessons
  // or mocks against this paper. Admin can toggle from the paper edit form
  // in AdminContentPage. See backend migration 20260525000006.
  free_accessible: boolean;
  created_at: string;
  updated_at: string;
}

export interface LearningObjectiveRaw {
  id: string;
  paper_id: string;
  code: string;
  title_en: string;
  title_ru: string | null;
  title_uz: string | null;
  description_en: string | null;
  description_ru: string | null;
  description_uz: string | null;
  // Long-form theory (150-300 words, Kaplan-style). Optional per LO.
  theory_en: string | null;
  theory_ru: string | null;
  theory_uz: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface McqOptionRaw {
  key: string;
  text_en: string;
  text_ru: string | null;
  text_uz: string | null;
  // Per-option "why this is wrong" explanations, shown after a wrong MCQ answer.
  // Always null on the correct option (storage invariant).
  why_wrong_en: string | null;
  why_wrong_ru: string | null;
  why_wrong_uz: string | null;
}

export interface QuestionRaw {
  id: string;
  lo_id: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;

  prompt_en: string;
  prompt_ru: string | null;
  prompt_uz: string | null;

  options: McqOptionRaw[] | null;

  correct_answer_en: string;
  correct_answer_ru: string | null;
  correct_answer_uz: string | null;

  explanation_en: string;
  explanation_ru: string | null;
  explanation_uz: string | null;

  concept_bite_en: string | null;
  concept_bite_ru: string | null;
  concept_bite_uz: string | null;

  // number_entry only: absolute ±tolerance; null = exact match.
  acceptable_tolerance: number | null;

  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ---- Localized (public) shapes ----

// Mirrors backend content.types ExamSection / ExamStructure. The mock start
// screen reads this off the paper to show the fixed exam format (e.g.
// "35 questions, 120 minutes") instead of asking the user to choose.
export type ExamSectionKind = "ot" | "mtq";

export interface ExamSection {
  code: string;
  kind: ExamSectionKind;
  question_count: number;
  marks_each?: number;
  marks_total?: number;
}

export interface ExamStructure {
  duration_seconds: number;
  pass_mark_pct: number;
  sections: ExamSection[];
}

export interface Paper {
  id: string;
  code: string;
  name: string;
  // Whether this paper is reachable on the free tier. Exposed even on the
  // public listing so the picker UI can render a lock badge; backend still
  // enforces the gate on lesson/mock start.
  free_accessible: boolean;
  // Program this paper belongs to (FK to programs). ACCA today; CFA later.
  program_id: string;
  // The fixed mock definition for this paper - sections, marks, duration, pass
  // mark. The mock start screen derives the exam format from this.
  exam_structure: ExamStructure;
  // Number of active questions under this paper. Surfaced by GET /papers so the
  // onboarding goal step can mark empty papers as "coming soon" and keep them
  // out of the first-lesson target selection.
  active_question_count: number;
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
  // Resolved per-option "why this is wrong" - null on the correct option, or
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

// Shape returned by GET /admin/content/tree - papers with nested LO summaries.
// Powers the sidebar tree on the unified admin content browser. Includes
// per-LO question counts so the UI can badge each LO without follow-up calls.
export interface ContentTreeLo {
  id: string;
  code: string;
  title_en: string;
  title_ru: string | null;
  title_uz: string | null;
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
  name_uz: string | null;
  learning_objectives: ContentTreeLo[];
}
