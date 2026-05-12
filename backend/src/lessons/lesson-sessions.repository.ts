import { Inject, Injectable } from '@nestjs/common';
import type { Sql } from 'postgres';
import { PG } from '../db/db.module';
import type { LessonSessionRow } from './lesson.types';

const COLS = `id, user_id, started_at, completed_at, question_count, correct_count`;

@Injectable()
export class LessonSessionsRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  async create(input: { user_id: string; question_count: number }): Promise<LessonSessionRow> {
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
}
