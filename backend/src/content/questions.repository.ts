import { Inject, Injectable } from '@nestjs/common';
import type { Sql } from 'postgres';
import { PG } from '../db/db.module';
import type {
  McqOption,
  QuestionDifficulty,
  QuestionRow,
  QuestionType,
} from './content.types';

const COLS = `
  id, lo_id, type, difficulty, prompt, options,
  correct_answer, explanation, concept_bite, is_active,
  created_at, updated_at
`;

@Injectable()
export class QuestionsRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  async findByLo(lo_id: string, opts?: { activeOnly?: boolean }): Promise<QuestionRow[]> {
    const activeOnly = opts?.activeOnly ?? false;
    return this.sql<QuestionRow[]>`
      SELECT ${this.sql.unsafe(COLS)}
      FROM questions
      WHERE lo_id = ${lo_id}
        ${activeOnly ? this.sql`AND is_active = TRUE` : this.sql``}
      ORDER BY id ASC
    `;
  }

  async findById(id: string): Promise<QuestionRow | null> {
    const rows = await this.sql<QuestionRow[]>`
      SELECT ${this.sql.unsafe(COLS)} FROM questions WHERE id = ${id} LIMIT 1
    `;
    return rows[0] ?? null;
  }

  async create(input: {
    lo_id: string;
    type: QuestionType;
    difficulty: QuestionDifficulty;
    prompt: string;
    options: McqOption[] | null;
    correct_answer: string;
    explanation: string;
    concept_bite?: string | null;
  }): Promise<QuestionRow> {
    // postgres.js: passing a JS array/object as a JSONB-typed param works directly.
    // We use sql.json(...) explicitly to be safe — avoids the array being treated as a postgres array.
    const optionsParam = input.options === null ? null : this.sql.json(input.options);

    const rows = await this.sql<QuestionRow[]>`
      INSERT INTO questions (
        lo_id, type, difficulty, prompt, options,
        correct_answer, explanation, concept_bite
      )
      VALUES (
        ${input.lo_id},
        ${input.type},
        ${input.difficulty},
        ${input.prompt},
        ${optionsParam},
        ${input.correct_answer},
        ${input.explanation},
        ${input.concept_bite ?? null}
      )
      RETURNING ${this.sql.unsafe(COLS)}
    `;
    return rows[0];
  }

  async update(
    id: string,
    input: {
      type?: QuestionType;
      difficulty?: QuestionDifficulty;
      prompt?: string;
      options?: McqOption[] | null;
      correct_answer?: string;
      explanation?: string;
      concept_bite?: string | null;
      is_active?: boolean;
    },
  ): Promise<QuestionRow | null> {
    const sets: Record<string, unknown> = {};
    if (input.type !== undefined) sets.type = input.type;
    if (input.difficulty !== undefined) sets.difficulty = input.difficulty;
    if (input.prompt !== undefined) sets.prompt = input.prompt;
    if (input.options !== undefined) {
      sets.options = input.options === null ? null : this.sql.json(input.options);
    }
    if (input.correct_answer !== undefined) sets.correct_answer = input.correct_answer;
    if (input.explanation !== undefined) sets.explanation = input.explanation;
    if (input.concept_bite !== undefined) sets.concept_bite = input.concept_bite;
    if (input.is_active !== undefined) sets.is_active = input.is_active;

    if (Object.keys(sets).length === 0) return this.findById(id);

    const rows = await this.sql<QuestionRow[]>`
      UPDATE questions SET ${this.sql(sets)}
      WHERE id = ${id}
      RETURNING ${this.sql.unsafe(COLS)}
    `;
    return rows[0] ?? null;
  }

  // Hard delete — only safe if no attempts reference it.
  // attempts.question_id has ON DELETE RESTRICT, so this throws if attempts exist.
  // Admin UI should prefer setting is_active=false to retire instead.
  async delete(id: string): Promise<boolean> {
    const rows = await this.sql`DELETE FROM questions WHERE id = ${id} RETURNING id`;
    return rows.length > 0;
  }
}
