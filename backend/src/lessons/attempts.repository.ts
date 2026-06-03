import { Inject, Injectable } from "@nestjs/common";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";
import type { AttemptRow } from "./lesson.types";

const COLS = `id, session_id, user_id, question_id, user_answer, was_correct, llm_grade_json, xp_earned, answered_at`;

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
    // Persist alongside the attempt so windowed leaderboards can SUM by
    // answered_at without us needing to reconstruct XP per session.
    // Default 0 in the DB matches semantics for historical rows.
    xp_earned: number;
  }): Promise<AttemptRow> {
    // `as any` works around postgres.js's overly strict JSONValue narrowing.
    // Runtime: sql.json accepts anything JSON-serializable.
    const llmParam =
      input.llm_grade_json === null
        ? null
        : this.sql.json(input.llm_grade_json as any);
    const rows = await this.sql<AttemptRow[]>`
      INSERT INTO attempts (session_id, user_id, question_id, user_answer, was_correct, llm_grade_json, xp_earned)
      VALUES (
        ${input.session_id},
        ${input.user_id},
        ${input.question_id},
        ${input.user_answer},
        ${input.was_correct},
        ${llmParam},
        ${input.xp_earned}
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

  // Total XP awarded across every attempt in a session. Used at session
  // complete to derive the XP bump applied to users.xp - preferable to
  // re-deriving from correct_count * XP_PER_CORRECT because that loses any
  // partial-credit XP (see XP_PER_FIRST_WRONG in srs.ts) and any future
  // scoring nuances that vary per attempt rather than per outcome.
  async sumXpInSession(session_id: string): Promise<number> {
    const rows = await this.sql<{ total: number }[]>`
      SELECT COALESCE(SUM(xp_earned), 0)::int AS total
      FROM attempts
      WHERE session_id = ${session_id}
    `;
    return rows[0]?.total ?? 0;
  }
}
