import { Inject, Injectable } from "@nestjs/common";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";
import type { UserQuestionStateRow } from "./lesson.types";

const COLS = `
  user_id, question_id, ease_factor, interval_days, repetitions, due_date,
  mastery_score, times_seen, times_correct, last_seen_at, created_at, updated_at
`;

@Injectable()
export class UserQuestionStateRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  async findOne(
    user_id: string,
    question_id: string
  ): Promise<UserQuestionStateRow | null> {
    const rows = await this.sql<UserQuestionStateRow[]>`
      SELECT ${this.sql.unsafe(COLS)}
      FROM user_question_state
      WHERE user_id = ${user_id} AND question_id = ${question_id}
      LIMIT 1
    `;
    return rows[0] ?? null;
  }

  // Diversified due-question fetch: at most ONE question per LO. Picks the
  // most-overdue from each LO (ties broken by random). Used by the lesson queue
  // builder to avoid serving two questions from the same LO back-to-back. When
  // the user has fewer overdue LOs than the requested limit, this returns
  // fewer rows than `limit` - the caller is expected to fall back to extras
  // via findDueQuestionsExtras() when starved.
  //
  // Uses DISTINCT ON (lo_id) which Postgres pairs with a matching ORDER BY
  // prefix (lo_id first, then ranking). We then re-sort the result set in a
  // wrapper subquery so the final order is most-overdue-first across LOs.
  async findDueQuestionsDiversified(input: {
    user_id: string;
    paper_id?: string | null;
    limit: number;
  }): Promise<
    Array<{
      question_id: string;
      lo_id: string;
      difficulty: string;
      due_date: Date;
    }>
  > {
    const paperFilter = input.paper_id
      ? this.sql`AND lo.paper_id = ${input.paper_id}`
      : this.sql``;
    return this.sql<
      Array<{
        question_id: string;
        lo_id: string;
        difficulty: string;
        due_date: Date;
      }>
    >`
      SELECT question_id, lo_id, difficulty, due_date FROM (
        SELECT DISTINCT ON (q.lo_id)
          uqs.question_id, q.lo_id, q.difficulty::text AS difficulty, uqs.due_date
        FROM user_question_state uqs
        JOIN questions q ON q.id = uqs.question_id
        JOIN learning_objectives lo ON lo.id = q.lo_id
        WHERE uqs.user_id = ${input.user_id}
          AND uqs.due_date <= CURRENT_DATE
          AND q.is_active = TRUE
          ${paperFilter}
        ORDER BY q.lo_id, uqs.due_date ASC, random()
      ) per_lo
      ORDER BY due_date ASC, random()
      LIMIT ${input.limit}
    `;
  }

  // "Extras" path: due questions NOT already picked by the diversified query.
  // Used as a fallback when the user has fewer distinct overdue LOs than the
  // requested lesson size. Caller passes the IDs already chosen so we exclude
  // them. Returns whatever's left, oldest-due first.
  async findDueQuestionsExtras(input: {
    user_id: string;
    paper_id?: string | null;
    exclude_ids: string[];
    limit: number;
  }): Promise<
    Array<{
      question_id: string;
      lo_id: string;
      difficulty: string;
      due_date: Date;
    }>
  > {
    if (input.limit <= 0) return [];
    const paperFilter = input.paper_id
      ? this.sql`AND lo.paper_id = ${input.paper_id}`
      : this.sql``;
    // Only emit the NOT IN clause when there's something to exclude - an empty
    // `IN ()` is a syntax error in Postgres. Building the fragment conditionally
    // (same idiom as paperFilter above) avoids the previous all-zero sentinel
    // UUID, which relied on a magic value never colliding with a real id.
    const excludeFilter =
      input.exclude_ids.length > 0
        ? this.sql`AND uqs.question_id NOT IN ${this.sql(input.exclude_ids)}`
        : this.sql``;
    return this.sql<
      Array<{
        question_id: string;
        lo_id: string;
        difficulty: string;
        due_date: Date;
      }>
    >`
      SELECT uqs.question_id, q.lo_id, q.difficulty::text AS difficulty, uqs.due_date
      FROM user_question_state uqs
      JOIN questions q ON q.id = uqs.question_id
      JOIN learning_objectives lo ON lo.id = q.lo_id
      WHERE uqs.user_id = ${input.user_id}
        AND uqs.due_date <= CURRENT_DATE
        AND q.is_active = TRUE
        ${excludeFilter}
        ${paperFilter}
      ORDER BY uqs.due_date ASC, random()
      LIMIT ${input.limit}
    `;
  }

  // For the "fill with new questions from weak LOs" path: returns LOs ordered by
  // worst (lowest avg mastery) first. LOs the user has never touched come back
  // with avg_mastery = NULL, which we sort first (treated as "weakest = unknown").
  async findWeakLos(input: {
    user_id: string;
    paper_id?: string | null;
    limit: number;
  }): Promise<Array<{ lo_id: string; avg_mastery: number | null }>> {
    const paperFilter = input.paper_id
      ? this.sql`AND lo.paper_id = ${input.paper_id}`
      : this.sql``;
    return this.sql<Array<{ lo_id: string; avg_mastery: number | null }>>`
      SELECT lo.id AS lo_id,
             AVG(uqs.mastery_score)::float AS avg_mastery
      FROM learning_objectives lo
      LEFT JOIN questions q
        ON q.lo_id = lo.id AND q.is_active = TRUE
      LEFT JOIN user_question_state uqs
        ON uqs.question_id = q.id AND uqs.user_id = ${input.user_id}
      WHERE 1=1
        ${paperFilter}
      GROUP BY lo.id
      ORDER BY avg_mastery ASC NULLS FIRST, lo.id ASC
      LIMIT ${input.limit}
    `;
  }

  // Pull N unseen questions for a given LO, biased by difficulty preference.
  // "Unseen" = no row in user_question_state for that user.
  //
  // When `error_rate_bias` is true, we additionally weight toward questions
  // with higher GLOBAL error rates (wrong attempts / total attempts across all
  // users). Rationale: questions that lots of users get wrong are usually
  // harder or trickier and benefit from more exposure. Questions with no
  // attempts yet (no row in question_error_rates) are treated as mid-bias so
  // brand-new content isn't starved.
  //
  // The error rate is read from the precomputed question_error_rates summary
  // table (refreshed daily by ProfileStats cron), NOT aggregated inline. The
  // old inline form scanned the entire attempts table once per call, and
  // buildQueue calls this once per weak LO - so a single lesson start could
  // scan the whole attempts table 8+ times. The join here is a point lookup
  // per candidate question against the summary PK. Behaviour on missing data
  // is identical: COALESCE(..., 0.4) supplies the same neutral default the
  // old query used for questions with no attempts.
  //
  // The bias is gentle - it's a secondary sort key after the difficulty match,
  // so a question matching the user's preferred difficulty always wins over
  // one that doesn't, even if the latter has a higher error rate.
  async findUnseenInLo(input: {
    user_id: string;
    lo_id: string;
    limit: number;
    preferred_difficulty: "easy" | "medium" | "hard";
    error_rate_bias?: boolean;
  }): Promise<Array<{ id: string; difficulty: string }>> {
    if (input.error_rate_bias) {
      return this.sql<Array<{ id: string; difficulty: string }>>`
        SELECT q.id, q.difficulty::text AS difficulty
        FROM questions q
        LEFT JOIN question_error_rates er ON er.question_id = q.id
        WHERE q.lo_id = ${input.lo_id}
          AND q.is_active = TRUE
          AND NOT EXISTS (
            SELECT 1 FROM user_question_state uqs
            WHERE uqs.user_id = ${input.user_id} AND uqs.question_id = q.id
          )
        ORDER BY
          CASE q.difficulty::text WHEN ${input.preferred_difficulty} THEN 0 ELSE 1 END,
          COALESCE(er.error_rate, 0.4) DESC,
          random()
        LIMIT ${input.limit}
      `;
    }
    return this.sql<Array<{ id: string; difficulty: string }>>`
      SELECT q.id, q.difficulty::text AS difficulty
      FROM questions q
      WHERE q.lo_id = ${input.lo_id}
        AND q.is_active = TRUE
        AND NOT EXISTS (
          SELECT 1 FROM user_question_state uqs
          WHERE uqs.user_id = ${input.user_id} AND uqs.question_id = q.id
        )
      ORDER BY
        CASE q.difficulty::text WHEN ${input.preferred_difficulty} THEN 0 ELSE 1 END,
        random()
      LIMIT ${input.limit}
    `;
  }

  // Rebuild the question_error_rates summary table from attempts in one pass.
  // Called by a daily cron (see ProfileStatsService). This is the ONLY place
  // the full attempts table is aggregated for error rates - the hot lesson
  // path reads the materialized result via findUnseenInLo.
  //
  // Upsert semantics: refresh existing rows, insert newly-attempted questions.
  // We deliberately do NOT delete rows for questions that lost all their
  // attempts (effectively impossible - attempts are never bulk-deleted outside
  // a full reseed, and a reseed CASCADE-drops these rows via the FK anyway).
  // Returns the number of question rows refreshed (for the cron log).
  async refreshErrorRates(): Promise<number> {
    const rows = await this.sql<Array<{ question_id: string }>>`
      INSERT INTO question_error_rates (question_id, error_rate, attempts_count, computed_at)
      SELECT
        a.question_id,
        COUNT(*) FILTER (WHERE a.was_correct = FALSE)::real
          / NULLIF(COUNT(*), 0)                              AS error_rate,
        COUNT(*)::int                                        AS attempts_count,
        NOW()                                                AS computed_at
      FROM attempts a
      GROUP BY a.question_id
      ON CONFLICT (question_id) DO UPDATE SET
        error_rate     = EXCLUDED.error_rate,
        attempts_count = EXCLUDED.attempts_count,
        computed_at    = EXCLUDED.computed_at
      RETURNING question_id
    `;
    return rows.length;
  }
}
