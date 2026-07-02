import { Inject, Injectable } from "@nestjs/common";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";

@Injectable()
export class LessonSessionQuestionsRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  // Bulk-insert the queue at session creation. Order matters → positions are explicit.
  //
  // section_codes, when provided, must align 1:1 with question_ids by index
  // and stamps each row's exam section (used by structured mocks for per-section
  // scoring). When omitted, section_code is left NULL - the case for regular
  // lessons and review sessions, which have no exam sections.
  //
  // marks, when provided, likewise aligns 1:1 and stamps each row's marks -
  // used by FIXED (imported) mocks so the breakdown scores by real per-question
  // marks. Omitted (NULL) for dynamic mocks and lessons/reviews, whose marks
  // come from the exam_structure or don't apply.
  async insertMany(
    session_id: string,
    question_ids: string[],
    section_codes?: Array<string | null>,
    marks?: Array<number | null>
  ): Promise<void> {
    if (question_ids.length === 0) return;
    const rows = question_ids.map((qid, i) => ({
      session_id,
      question_id: qid,
      position: i,
      section_code: section_codes ? section_codes[i] ?? null : null,
      marks: marks ? marks[i] ?? null : null,
    }));
    // postgres.js helpers: pass an array of objects to
    // `sql(rows, 'session_id', 'question_id', 'position', 'section_code', 'marks')`
    // to build a multi-row VALUES list with the named columns.
    await this.sql`
      INSERT INTO lesson_session_questions ${this.sql(
        rows,
        "session_id",
        "question_id",
        "position",
        "section_code",
        "marks"
      )}
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
