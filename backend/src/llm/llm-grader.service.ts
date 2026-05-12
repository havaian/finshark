import { Inject, Injectable, Logger, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { QuestionRow } from '../content/content.types';
import { LlmGradeCacheRepository } from './llm-grade-cache.repository';
import type {
  GradeVerdict,
  LlmGradingProvider,
} from './providers/provider.interface';

// Result returned to the grader service. Shape stored in attempts.llm_grade_json.
// Note: we deliberately include `provider` and `model` at the top level so the
// per-user-daily-cap query can filter by provider.
export interface ShortAnswerGradeResult {
  was_correct: boolean;
  llm_grade_json: {
    method: 'llm' | 'exact_match' | 'cache_hit';
    provider: string;
    model: string;
    confidence: number | null;
    reasoning: string | null;
    normalized_user: string;
  };
}

export const LLM_PROVIDER_TOKEN = Symbol('LLM_PROVIDER');

@Injectable()
export class LlmGraderService {
  private readonly log = new Logger(LlmGraderService.name);

  constructor(
    private readonly config: ConfigService,
    private readonly cache: LlmGradeCacheRepository,
    // Provider is optional — when LLM_PROVIDER=none, nothing is registered.
    @Optional() @Inject(LLM_PROVIDER_TOKEN) private readonly provider: LlmGradingProvider | null,
  ) {}

  // Public entry. Takes the user_id so we can enforce the daily cap.
  async grade(
    question: QuestionRow,
    user_id: string,
    user_answer: string,
  ): Promise<ShortAnswerGradeResult> {
    const normalized = this.normalize(user_answer);
    const expectedNorm = this.normalize(question.correct_answer);

    // 1) Trivial fast path: exact match against the canonical answer.
    // Avoids both a DB hit AND an LLM call for the most common "right answer" case.
    if (normalized === expectedNorm && normalized.length > 0) {
      return this.exactMatchResult(true, normalized);
    }

    // 2) Cache lookup.
    const cached = await this.cache.find(question.id, normalized);
    if (cached) {
      return {
        was_correct: cached.is_correct,
        llm_grade_json: {
          method: 'cache_hit',
          provider: cached.provider,
          model: cached.model,
          confidence: cached.confidence,
          reasoning: cached.reasoning,
          normalized_user: normalized,
        },
      };
    }

    // 3) If no provider configured, fall back to exact-match (already false at this point).
    if (!this.provider) {
      return this.exactMatchResult(false, normalized);
    }

    // 4) Per-user daily cap. Above the cap, we degrade to exact-match for the rest of the day.
    const cap = parseInt(this.config.get<string>('LLM_GRADES_PER_USER_PER_DAY') ?? '200', 10);
    const todays = await this.cache.countTodaysGradesForUser(user_id);
    if (todays >= cap) {
      this.log.warn(`user ${user_id} hit daily LLM grade cap (${cap}); falling back to exact-match`);
      return this.exactMatchResult(false, normalized);
    }

    // 5) Real LLM call.
    const timeoutMs = parseInt(this.config.get<string>('LLM_GRADE_TIMEOUT_MS') ?? '10000', 10);
    let verdict: GradeVerdict;
    try {
      verdict = await this.provider.grade(
        {
          question_prompt: question.prompt,
          correct_answer: question.correct_answer,
          user_answer,
        },
        { timeoutMs },
      );
    } catch (err) {
      this.log.error(`LLM grading failed for question ${question.id}: ${(err as Error).message}`);
      return this.exactMatchResult(false, normalized);
    }

    // 6) Persist to cache (best-effort — failures shouldn't break the user-facing flow).
    try {
      await this.cache.upsert({
        question_id: question.id,
        normalized_user_answer: normalized,
        is_correct: verdict.is_correct,
        confidence: verdict.confidence,
        reasoning: verdict.reasoning,
        provider: verdict.provider,
        model: verdict.model,
      });
    } catch (err) {
      this.log.warn(`failed to cache grade verdict: ${(err as Error).message}`);
    }

    return {
      was_correct: verdict.is_correct,
      llm_grade_json: {
        method: 'llm',
        provider: verdict.provider,
        model: verdict.model,
        confidence: verdict.confidence,
        reasoning: verdict.reasoning,
        normalized_user: normalized,
      },
    };
  }

  // Lowercase, trim, collapse internal whitespace. Same normalisation used for cache key.
  private normalize(s: string): string {
    return s.trim().toLowerCase().replace(/\s+/g, ' ');
  }

  private exactMatchResult(was_correct: boolean, normalized_user: string): ShortAnswerGradeResult {
    return {
      was_correct,
      llm_grade_json: {
        method: 'exact_match',
        provider: 'exact_match',
        model: 'exact_match',
        confidence: was_correct ? 1.0 : 0.0,
        reasoning: was_correct ? 'exact match' : 'no provider available; exact-match used',
        normalized_user,
      },
    };
  }
}
