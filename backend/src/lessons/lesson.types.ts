// Mirrors db/migrations/20260511000003_content_and_srs.sql
//                  + db/migrations/20260513000002_hearts.js
//                  + db/migrations/20260515000006_mocks.js

export type SessionMode = 'lesson' | 'mock';

export interface LessonSessionRow {
  id: string;
  user_id: string;
  started_at: Date;
  completed_at: Date | null;
  question_count: number;
  correct_count: number;
  hearts_remaining: number;       // 0..3 (unused for mocks but column still set to 3)
  ended_out_of_hearts: boolean;   // true if completed because hearts hit 0
  // Mocks (4.1)
  mode: SessionMode;
  time_limit_seconds: number | null;     // null for lessons; set for mocks
  paper_id: string | null;               // NOT NULL for mocks (CHECK enforces)
  source_session_id: string | null;      // mock → review-lesson link
}

export interface AttemptRow {
  id: string;
  session_id: string;
  user_id: string;
  question_id: string;
  user_answer: string;
  was_correct: boolean;
  llm_grade_json: unknown;        // JSONB; specific shape defined in slice 7
  // XP awarded for this single attempt. Used by the leaderboard window
  // queries; on old rows (created before the column was added) this is 0.
  xp_earned: number;
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
