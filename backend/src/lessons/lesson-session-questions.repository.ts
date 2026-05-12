import { Inject, Injectable } from '@nestjs/common';
import type { Sql } from 'postgres';
import { PG } from '../db/db.module';

@Injectable()
export class LessonSessionQuestionsRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  // Bulk-insert the queue at session creation. Order matters → positions are explicit.
  async insertMany(session_id: string, question_ids: string[]): Promise<void> {
    if (question_ids.length === 0) return;
    const rows = question_ids.map((qid, i) => ({
      session_id,
      question_id: qid,
      position: i,
    }));
    // postgres.js helpers: pass an array of objects to `sql(rows, 'session_id', 'question_id', 'position')`
    // to build a multi-row VALUES list with the named columns.
    await this.sql`
      INSERT INTO lesson_session_questions ${this.sql(rows, 'session_id', 'question_id', 'position')}
    `;
  }

  // Return question_ids in original queue order.
  async findBySession(session_id: string): Promise<string[]> {
    const rows = await this.sql<Array<{ question_id: string }>>`
      SELECT question_id FROM lesson_session_questions
      WHERE session_id = ${session_id}
      ORDER BY position ASC
    `;
    return rows.map((r) => r.question_id);
  }
}
