import { Injectable } from '@nestjs/common';
import type { QuestionRow } from '../content/content.types';
import { LlmGraderService } from '../llm/llm-grader.service';

export interface GradeResult {
  was_correct: boolean;
  // Stored in attempts.llm_grade_json. Null for MCQ (no provider involved).
  // For short_answer this is the structured verdict from LlmGraderService.
  llm_grade_json: unknown | null;
}

@Injectable()
export class GraderService {
  constructor(private readonly llm: LlmGraderService) {}

  // user_id is required so LLM grading can enforce its per-user daily cap.
  async grade(
    question: QuestionRow,
    user_id: string,
    user_answer: string,
  ): Promise<GradeResult> {
    if (question.type === 'mcq') {
      return this.gradeMcq(question, user_answer);
    }
    const verdict = await this.llm.grade(question, user_id, user_answer);
    return {
      was_correct: verdict.was_correct,
      llm_grade_json: verdict.llm_grade_json,
    };
  }

  private gradeMcq(question: QuestionRow, user_answer: string): GradeResult {
    // MCQ correct_answer stores the option key (e.g. "A"). Compare case-insensitively
    // and trim — admins sometimes save "A " with trailing space.
    const expected = question.correct_answer.trim().toUpperCase();
    const actual = user_answer.trim().toUpperCase();
    return { was_correct: expected === actual, llm_grade_json: null };
  }
}
