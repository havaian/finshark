import { Inject, Injectable } from '@nestjs/common';
import type { Sql } from 'postgres';
import { PG } from '../db/db.module';
import type { AttemptRow } from './lesson.types';

const COLS = `id, session_id, user_id, question_id, user_answer, was_correct, llm_grade_json, answered_at`;

@Injectable()
export class AttemptsRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  async create(input: {
    session_id: string;
    user_id: string;
    question_id: string;
    user_answer: string;
    was_correct: boolean;
    llm_grade_json: unknown | null;
  }): Promise<AttemptRow> {
    const llmParam =
      input.llm_grade_json === null ? null : this.sql.json(input.llm_grade_json);
    const rows = await this.sql<AttemptRow[]>`
      INSERT INTO attempts (session_id, user_id, question_id, user_answer, was_correct, llm_grade_json)
      VALUES (
        ${input.session_id},
        ${input.user_id},
        ${input.question_id},
        ${input.user_answer},
        ${input.was_correct},
        ${llmParam}
      )
      RETURNING ${this.sql.unsafe(COLS)}
    `;
    return rows[0];
  }

  // Used by the queue builder to skip questions the user has already answered in this session.
  async questionIdsInSession(session_id: string): Promise<string[]> {
    const rows = await this.sql<{ question_id: string }[]>`
      SELECT question_id FROM attempts WHERE session_id = ${session_id}
    `;
    return rows.map((r) => r.question_id);
  }
}
