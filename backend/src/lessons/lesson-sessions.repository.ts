import { Inject, Injectable } from '@nestjs/common';
import type { Sql } from 'postgres';
import { PG } from '../db/db.module';
import type { LessonSessionRow } from './lesson.types';

const COLS = `
  id, user_id, started_at, completed_at,
  question_count, correct_count,
  hearts_remaining, ended_out_of_hearts
`;

@Injectable()
export class LessonSessionsRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  async create(input: { user_id: string; question_count: number }): Promise<LessonSessionRow> {
    // hearts_remaining defaults to 3 in the schema; we don't need to specify it
    // unless we ever want to vary the starting count per user.
    const rows = await this.sql<LessonSessionRow[]>`
      INSERT INTO lesson_sessions (user_id, question_count)
      VALUES (${input.user_id}, ${input.question_count})
      RETURNING ${this.sql.unsafe(COLS)}
    `;
    return rows[0];
  }

  async findById(id: string): Promise<LessonSessionRow | null> {
    const rows = await this.sql<LessonSessionRow[]>`
      SELECT ${this.sql.unsafe(COLS)} FROM lesson_sessions WHERE id = ${id} LIMIT 1
    `;
    return rows[0] ?? null;
  }

  // Atomically bump correct_count when a correct attempt lands.
  async incrementCorrect(id: string): Promise<void> {
    await this.sql`
      UPDATE lesson_sessions
      SET correct_count = correct_count + 1
      WHERE id = ${id}
    `;
  }

  async markCompleted(id: string): Promise<LessonSessionRow | null> {
    const rows = await this.sql<LessonSessionRow[]>`
      UPDATE lesson_sessions
      SET completed_at = NOW()
      WHERE id = ${id} AND completed_at IS NULL
      RETURNING ${this.sql.unsafe(COLS)}
    `;
    return rows[0] ?? null;
  }

  // Mark a session as completed due to running out of hearts.
  // Uses the WHERE-completed_at-is-null guard for idempotency on races.
  async markEndedOutOfHearts(id: string): Promise<LessonSessionRow | null> {
    const rows = await this.sql<LessonSessionRow[]>`
      UPDATE lesson_sessions
      SET completed_at = NOW(),
          ended_out_of_hearts = TRUE,
          hearts_remaining = 0
      WHERE id = ${id} AND completed_at IS NULL
      RETURNING ${this.sql.unsafe(COLS)}
    `;
    return rows[0] ?? null;
  }
}
