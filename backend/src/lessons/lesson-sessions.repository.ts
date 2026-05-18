import { Inject, Injectable } from "@nestjs/common";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";
import type { LessonSessionRow, SessionMode } from "./lesson.types";

const COLS = `
  id, user_id, started_at, completed_at,
  question_count, correct_count,
  hearts_remaining, ended_out_of_hearts,
  mode, time_limit_seconds, paper_id, source_session_id
`;

@Injectable()
export class LessonSessionsRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  // Defaults: mode='lesson', time_limit_seconds=null, paper_id=null,
  // source_session_id=null. Mock sessions and review-of-mock sessions pass
  // these explicitly. The chk_mock_has_paper CHECK constraint enforces that
  // mock mode requires paper_id NOT NULL — caller MUST supply it.
  async create(input: {
    user_id: string;
    question_count: number;
    mode?: SessionMode;
    time_limit_seconds?: number | null;
    paper_id?: string | null;
    source_session_id?: string | null;
  }): Promise<LessonSessionRow> {
    const mode = input.mode ?? "lesson";
    const rows = await this.sql<LessonSessionRow[]>`
      INSERT INTO lesson_sessions (
        user_id, question_count,
        mode, time_limit_seconds, paper_id, source_session_id
      )
      VALUES (
        ${input.user_id},
        ${input.question_count},
        ${mode},
        ${input.time_limit_seconds ?? null},
        ${input.paper_id ?? null},
        ${input.source_session_id ?? null}
      )
      RETURNING ${this.sql.unsafe(COLS)}
    `;
    return rows[0];
  }

  async findById(id: string): Promise<LessonSessionRow | null> {
    const rows = await this.sql<LessonSessionRow[]>`
      SELECT ${this.sql.unsafe(
        COLS
      )} FROM lesson_sessions WHERE id = ${id} LIMIT 1
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
