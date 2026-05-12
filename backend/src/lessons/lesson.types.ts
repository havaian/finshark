// Mirrors db/migrations/20260511000003_content_and_srs.sql

export interface LessonSessionRow {
  id: string;
  user_id: string;
  started_at: Date;
  completed_at: Date | null;
  question_count: number;
  correct_count: number;
}

export interface AttemptRow {
  id: string;
  session_id: string;
  user_id: string;
  question_id: string;
  user_answer: string;
  was_correct: boolean;
  llm_grade_json: unknown;        // JSONB; specific shape defined in slice 7
  answered_at: Date;
}

export interface UserQuestionStateRow {
  user_id: string;
  question_id: string;
  ease_factor: number;
  interval_days: number;
  repetitions: number;
  due_date: Date;
  mastery_score: number;
  times_seen: number;
  times_correct: number;
  last_seen_at: Date | null;
  created_at: Date;
  updated_at: Date;
}
