import type { McqOption, QuestionDifficulty, QuestionType } from './content';

// Question shape returned in a lesson queue — no correct_answer or explanation
// (those come back with each attempt).
export interface LessonQuestion {
  id: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  prompt: string;
  options: McqOption[] | null;
  concept_bite: string | null;
}

export interface StartLessonResult {
  session_id: string;
  questions: LessonQuestion[];
}

export interface SessionDetail {
  session_id: string;
  completed_at: string | null;
  question_count: number;
  correct_count: number;
  questions: LessonQuestion[];
  answered_question_ids: string[];
}

export interface AttemptResult {
  was_correct: boolean;
  correct_answer: string;
  explanation: string;
  mastery_score: number;
  next_due_date: string;
  xp_earned: number;
}

export interface CompleteLessonResult {
  session_id: string;
  question_count: number;
  correct_count: number;
  xp_earned: number;
  new_xp: number;
  new_level: number;
  new_streak: number;
}
