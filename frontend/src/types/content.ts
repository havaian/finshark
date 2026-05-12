// Mirrors backend/src/content/content.types.ts (public-facing fields)

export type QuestionType = 'mcq' | 'short_answer';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';

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
