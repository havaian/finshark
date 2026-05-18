// Contract every grading provider must satisfy.
//
// The grader passes the question, canonical correct answer, and user answer.
// The provider returns a structured verdict OR throws/times out, in which case
// the caller falls back to exact-match grading.

export interface GradeRequest {
  question_prompt: string;
  correct_answer: string; // canonical, from admin-authored content
  user_answer: string; // raw user input (un-normalized)
}

export interface GradeVerdict {
  is_correct: boolean;
  confidence: number; // 0..1
  reasoning: string; // human-readable, surfaced in attempts.llm_grade_json
  provider: "openai" | "anthropic";
  model: string;
}

export interface LlmGradingProvider {
  name: "openai" | "anthropic";
  grade(req: GradeRequest, opts: { timeoutMs: number }): Promise<GradeVerdict>;
}
