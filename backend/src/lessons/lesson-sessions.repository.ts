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
  // mock mode requires paper_id NOT NULL - caller MUST supply it.
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

  // Override the session's starting hearts. Used by the free-tier gate so a
  // fresh session inherits whatever is left in the user's daily pool
  // (min(pool, 3)) instead of the per-session default. Premium users never
  // call this - they get the default 3.
  async overrideHearts(id: string, hearts: number): Promise<void> {
    await this.sql`
      UPDATE lesson_sessions SET hearts_remaining = ${hearts}
      WHERE id = ${id}
    `;
  }

  // Count regular lesson sessions started by this user since the start of
  // today in their timezone. Used to enforce the free-tier "3 lessons/day"
  // quota. Mocks are excluded; mode='lesson' only.
  //
  // "Started" = started_at >= local-midnight-today. Incomplete sessions count
  // (you can't farm starts to dodge the limit). Review sessions from a mock
  // ALSO count - they're created with mode='lesson'. This is deliberate: a
  // review session is still a lesson interaction. If product wants reviews
  // exempt later, add WHERE source_session_id IS NULL.
  async countLessonsTodayInTimezone(
    userId: string,
    timezone: string
  ): Promise<number> {
    const rows = await this.sql<Array<{ count: string }>>`
      SELECT COUNT(*)::text AS count
      FROM lesson_sessions
      WHERE user_id = ${userId}
        AND mode = 'lesson'
        AND started_at >= (
          (NOW() AT TIME ZONE ${timezone})::date::timestamp
          AT TIME ZONE ${timezone}
        )
    `;
    return parseInt(rows[0]?.count ?? "0", 10);
  }

  // Count mock sessions started by this user since the start of the current
  // calendar month in their timezone. Used to enforce the free-tier
  // "1 mock/month" quota. Status doesn't matter - once you start a mock the
  // month-quota slot is spent.
  async countMocksThisMonthInTimezone(
    userId: string,
    timezone: string
  ): Promise<number> {
    const rows = await this.sql<Array<{ count: string }>>`
      SELECT COUNT(*)::text AS count
      FROM lesson_sessions
      WHERE user_id = ${userId}
        AND mode = 'mock'
        AND started_at >= (
          date_trunc('month', NOW() AT TIME ZONE ${timezone})
          AT TIME ZONE ${timezone}
        )
    `;
    return parseInt(rows[0]?.count ?? "0", 10);
  }
}
