import type { McqOption, QuestionDifficulty, QuestionType } from "./content";

// Session mode mirrors backend's session_mode enum. 'lesson' is the default
// for ordinary sessions; 'mock' is a CBE-style timed practice with no hearts.
export type SessionMode = "lesson" | "mock";

// Question shape returned in a lesson queue — no correct_answer or explanation
// (those come back with each attempt).
export interface LessonQuestion {
  id: string;
  type: QuestionType;
  difficulty: QuestionDifficulty;
  prompt: string;
  options: McqOption[] | null;
  concept_bite: string | null;
  // For number_entry: optional ±tolerance hint. Null for other types and for
  // number_entry questions that require exact match.
  acceptable_tolerance: number | null;
}

// Per-LO theory primer shown at the top of a lesson. One entry per distinct
// LO in queue order, only for LOs whose theory_en is populated.
export interface LessonTheoryBite {
  lo_id: string;
  lo_code: string;
  lo_title: string;
  theory: string;
}

export interface StartLessonResult {
  session_id: string;
  questions: LessonQuestion[];
  hearts_remaining: number;
  theory_bites: LessonTheoryBite[];
}

export interface SessionDetail {
  session_id: string;
  completed_at: string | null;
  question_count: number;
  correct_count: number;
  hearts_remaining: number;
  ended_out_of_hearts: boolean;
  questions: LessonQuestion[];
  answered_question_ids: string[];
  theory_bites: LessonTheoryBite[];
  // Mock-mode metadata. For ordinary lessons mode='lesson', time_limit_seconds
  // is null, paper_id may be null. For mocks all three are set.
  mode: SessionMode;
  time_limit_seconds: number | null;
  paper_id: string | null;
  // ISO timestamp. The frontend computes "seconds remaining" as
  // started_at + time_limit_seconds - now, so resuming a mock mid-session
  // shows the correct countdown rather than restarting from the full budget.
  started_at: string;
}

export interface AttemptResult {
  was_correct: boolean;
  correct_answer: string;
  explanation: string;
  mastery_score: number;
  next_due_date: string;
  xp_earned: number;
  hearts_remaining: number;
  // True when this wrong answer triggered out-of-hearts auto-end.
  session_ended_out_of_hearts: boolean;
}

export interface CompleteLessonResult {
  session_id: string;
  question_count: number;
  correct_count: number;
  xp_earned: number;
  new_xp: number;
  new_level: number;
  new_streak: number;
  // Streak-freeze fields, mirroring backend CompleteLessonResult (added in
  // migration 20260525000002_streak_freezes). new_streak_freezes is the
  // post-session count; the booleans drive the "saved by a freeze!" /
  // "+1 freeze!" banners on the finale.
  new_streak_freezes: number;
  freeze_consumed: boolean;
  freeze_granted: boolean;
  ended_out_of_hearts: boolean;
  // Badge codes earned by this session completion. Empty when none.
  // The lesson page renders these as a brief toast on the summary screen.
  newly_earned_badges: string[];
}
