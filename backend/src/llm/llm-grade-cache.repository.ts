import { Inject, Injectable } from "@nestjs/common";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";

export interface LlmGradeCacheRow {
  id: string;
  question_id: string;
  normalized_user_answer: string;
  is_correct: boolean;
  confidence: number | null;
  reasoning: string | null;
  provider: string;
  model: string;
  created_at: Date;
}

const COLS = `
  id, question_id, normalized_user_answer, is_correct, confidence,
  reasoning, provider, model, created_at
`;

@Injectable()
export class LlmGradeCacheRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  async find(
    question_id: string,
    normalized_user_answer: string
  ): Promise<LlmGradeCacheRow | null> {
    const rows = await this.sql<LlmGradeCacheRow[]>`
      SELECT ${this.sql.unsafe(COLS)}
      FROM llm_grade_cache
      WHERE question_id = ${question_id}
        AND normalized_user_answer = ${normalized_user_answer}
      LIMIT 1
    `;
    return rows[0] ?? null;
  }

  // Insert; ON CONFLICT do nothing - first writer wins on race.
  async upsert(input: {
    question_id: string;
    normalized_user_answer: string;
    is_correct: boolean;
    confidence: number | null;
    reasoning: string | null;
    provider: string;
    model: string;
  }): Promise<void> {
    await this.sql`
      INSERT INTO llm_grade_cache (
        question_id, normalized_user_answer, is_correct, confidence,
        reasoning, provider, model
      )
      VALUES (
        ${input.question_id},
        ${input.normalized_user_answer},
        ${input.is_correct},
        ${input.confidence},
        ${input.reasoning},
        ${input.provider},
        ${input.model}
      )
      ON CONFLICT (question_id, normalized_user_answer) DO NOTHING
    `;
  }

  // Daily counter - counts CACHE WRITES (i.e., real LLM calls) by user
  // by JOINing attempts. Used for the per-user daily cap.
  // Subtle: counts attempts that resulted in a real LLM call (llm_grade_json
  // provider != 'exact_match'). Bounded scan via the user_id+answered_at index.
  async countTodaysGradesForUser(user_id: string): Promise<number> {
    const rows = await this.sql<Array<{ n: string }>>`
      SELECT COUNT(*)::text AS n
      FROM attempts a
      WHERE a.user_id = ${user_id}
        AND a.answered_at >= DATE_TRUNC('day', NOW())
        AND a.llm_grade_json ->> 'provider' IN ('openai', 'anthropic')
    `;
    return parseInt(rows[0]?.n ?? "0", 10);
  }
}
