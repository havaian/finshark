// Mirrors db/migrations/20260511000003_content_and_srs.sql

export type QuestionType = 'mcq' | 'short_answer';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

export interface PaperRow {
  id: string;
  code: string;
  name: string;
  created_at: Date;
  updated_at: Date;
}

export interface LearningObjectiveRow {
  id: string;
  paper_id: string;
  code: string;
  title: string;
  description: string | null;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

// Inner shape of questions.options JSONB for MCQ.
export interface McqOption {
  key: string;     // "A" | "B" | "C" | "D" — admin-defined but app validates
  text: string;
}

export interface QuestionRow {
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
  created_at: Date;
  updated_at: Date;
}
