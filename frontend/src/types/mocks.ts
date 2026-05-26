// Mirrors backend src/mocks/mocks.service.ts return shapes.
//
// StartMockResult is API-shape: the response from POST /mocks. The frontend
// then navigates to /lesson/:session_id and the existing LessonPage handles
// the rest, with mock-specific decorations driven by the session's `mode`
// field returned from GET /lessons/:id/session.

import type { LessonQuestion, LessonTheoryBite } from "./lesson";

export interface StartMockResult {
  session_id: string;
  questions: LessonQuestion[];
  hearts_remaining: number;
  theory_bites: LessonTheoryBite[];
  time_limit_seconds: number | null;
  paper_id: string;
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

export interface MockBreakdown {
  session_id: string;
  paper_id: string;
  total: number;
  correct: number;
  per_lo: MockBreakdownEntry[];
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
