// Mirrors backend src/mocks/mocks.service.ts return shapes.
//
// StartMockResult is API-shape: the response from POST /mocks. The frontend
// then navigates to /lesson/:session_id and the existing LessonPage handles
// the rest, with mock-specific decorations driven by the session's `mode`
// field returned from GET /lessons/:id/session.

import type { LessonQuestion, LessonTheoryBite } from "./lesson";
import type { ExamSectionKind } from "./content";

// One built section of a started mock. Tells the frontend which queue
// positions belong to the section and the marks rule that applies, so it can
// render section headers and a marks summary.
export interface StartMockSection {
  code: string;
  kind: ExamSectionKind;
  question_count: number;
  start_position: number;
  end_position: number;
  marks_each: number | null;
  marks_total: number | null;
}

export interface StartMockResult {
  session_id: string;
  questions: LessonQuestion[];
  hearts_remaining: number;
  theory_bites: LessonTheoryBite[];
  // Fixed by the paper's exam_structure.duration_seconds.
  time_limit_seconds: number | null;
  paper_id: string;
  // Exam layout this mock was built to.
  sections: StartMockSection[];
  total_marks: number;
  pass_mark_pct: number;
}

export interface MockBreakdownEntry {
  lo_id: string;
  lo_code: string;
  lo_title: string;
  total: number;
  correct: number;
  // 0..100, rounded by the backend.
  accuracy_pct: number;
}

// Per-section marks summary for a completed mock. `scored: false` marks an mtq
// section that isn't auto-marked yet (marks_available/awarded both 0).
export interface MockSectionScore {
  code: string;
  kind: ExamSectionKind;
  scored: boolean;
  total: number;
  correct: number;
  marks_available: number;
  marks_awarded: number;
}

export interface MockBreakdown {
  session_id: string;
  paper_id: string;
  total: number;
  correct: number;
  per_lo: MockBreakdownEntry[];
  // Per-section marks. Empty for legacy flat mocks (no section_code stamped).
  per_section: MockSectionScore[];
  // Overall marks scoring.
  marks_available: number;
  marks_awarded: number;
  // 0..100, rounded to 1 dp.
  percent: number;
  pass_mark_pct: number;
  passed: boolean;
  // Question IDs the user got wrong, in queue order. The frontend uses these
  // to enable/disable the "Start review session" button (hide if empty).
  wrong_question_ids: string[];
}

// Per-question review payload. Returned by GET /mocks/:id/answers.
export interface MockAnswerOption {
  key: string;
  text: string;
  why_wrong: string | null;
}

export interface MockAnswerEntry {
  position: number;
  question_id: string;
  type: "mcq" | "number_entry";
  difficulty: "easy" | "medium" | "hard";
  prompt: string;
  options: MockAnswerOption[] | null;
  correct_answer: string;
  explanation: string;
  concept_bite: string | null;
  acceptable_tolerance: number | null;
  lo_code: string;
  lo_title: string;
  // null when the user didn't reach this question (timeout etc).
  user_answer: string | null;
  was_correct: boolean | null;
}

export interface MockAnswers {
  session_id: string;
  paper_id: string;
  total: number;
  correct: number;
  entries: MockAnswerEntry[];
}
