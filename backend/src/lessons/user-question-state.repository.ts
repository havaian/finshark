import { Inject, Injectable } from '@nestjs/common';
import type { Sql } from 'postgres';
import { PG } from '../db/db.module';
import type { UserQuestionStateRow } from './lesson.types';

const COLS = `
  user_id, question_id, ease_factor, interval_days, repetitions, due_date,
  mastery_score, times_seen, times_correct, last_seen_at, created_at, updated_at
`;

@Injectable()
export class UserQuestionStateRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  async findOne(user_id: string, question_id: string): Promise<UserQuestionStateRow | null> {
    const rows = await this.sql<UserQuestionStateRow[]>`
      SELECT ${this.sql.unsafe(COLS)}
      FROM user_question_state
      WHERE user_id = ${user_id} AND question_id = ${question_id}
      LIMIT 1
    `;
    return rows[0] ?? null;
  }

  // Due questions for a user, joined with question metadata so the lesson selector
  // can pick by LO + difficulty in one query. paper_id optional filter.
  // Returns oldest-due-first; ties broken by random for variety.
  async findDueQuestions(input: {
    user_id: string;
    paper_id?: string | null;
    limit: number;
  }): Promise<Array<{ question_id: string; lo_id: string; difficulty: string; due_date: Date }>> {
    const paperFilter = input.paper_id
      ? this.sql`AND lo.paper_id = ${input.paper_id}`
      : this.sql``;
    return this.sql<Array<{ question_id: string; lo_id: string; difficulty: string; due_date: Date }>>`
      SELECT uqs.question_id, q.lo_id, q.difficulty::text AS difficulty, uqs.due_date
      FROM user_question_state uqs
      JOIN questions q ON q.id = uqs.question_id
      JOIN learning_objectives lo ON lo.id = q.lo_id
      WHERE uqs.user_id = ${input.user_id}
        AND uqs.due_date <= CURRENT_DATE
        AND q.is_active = TRUE
        ${paperFilter}
      ORDER BY uqs.due_date ASC, random()
      LIMIT ${input.limit}
    `;
  }

  // Diversified due-question fetch: at most ONE question per LO. Picks the
  // most-overdue from each LO (ties broken by random). Used by the lesson queue
  // builder to avoid serving two questions from the same LO back-to-back. When
  // the user has fewer overdue LOs than the requested limit, this returns
  // fewer rows than `limit` — the caller is expected to fall back to extras
  // via findDueQuestionsExtras() when starved.
  //
  // Uses DISTINCT ON (lo_id) which Postgres pairs with a matching ORDER BY
  // prefix (lo_id first, then ranking). We then re-sort the result set in a
  // wrapper subquery so the final order is most-overdue-first across LOs.
  async findDueQuestionsDiversified(input: {
    user_id: string;
    paper_id?: string | null;
    limit: number;
  }): Promise<Array<{ question_id: string; lo_id: string; difficulty: string; due_date: Date }>> {
    const paperFilter = input.paper_id
      ? this.sql`AND lo.paper_id = ${input.paper_id}`
      : this.sql``;
    return this.sql<Array<{ question_id: string; lo_id: string; difficulty: string; due_date: Date }>>`
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
  }): Promise<Array<{ question_id: string; lo_id: string; difficulty: string; due_date: Date }>> {
    if (input.limit <= 0) return [];
    const paperFilter = input.paper_id
      ? this.sql`AND lo.paper_id = ${input.paper_id}`
      : this.sql``;
    // postgres.js: empty array via `IN ()` would be a syntax error. Use a
    // sentinel UUID that can never match a real question.id (UUIDv4 is all-zero).
    const excludeIds =
      input.exclude_ids.length > 0
        ? input.exclude_ids
        : ['00000000-0000-0000-0000-000000000000'];
    return this.sql<Array<{ question_id: string; lo_id: string; difficulty: string; due_date: Date }>>`
      SELECT uqs.question_id, q.lo_id, q.difficulty::text AS difficulty, uqs.due_date
      FROM user_question_state uqs
      JOIN questions q ON q.id = uqs.question_id
      JOIN learning_objectives lo ON lo.id = q.lo_id
      WHERE uqs.user_id = ${input.user_id}
        AND uqs.due_date <= CURRENT_DATE
        AND q.is_active = TRUE
        AND uqs.question_id NOT IN ${this.sql(excludeIds)}
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
  // attempts yet (NULL error rate) are treated as mid-bias so brand-new
  // content isn't starved.
  //
  // The bias is gentle — it's a secondary sort key after the difficulty match,
  // so a question matching the user's preferred difficulty always wins over
  // one that doesn't, even if the latter has a higher error rate.
  async findUnseenInLo(input: {
    user_id: string;
    lo_id: string;
    limit: number;
    preferred_difficulty: 'easy' | 'medium' | 'hard';
    error_rate_bias?: boolean;
  }): Promise<Array<{ id: string; difficulty: string }>> {
    if (input.error_rate_bias) {
      return this.sql<Array<{ id: string; difficulty: string }>>`
        SELECT q.id, q.difficulty::text AS difficulty
        FROM questions q
        LEFT JOIN (
          SELECT question_id,
                 COUNT(*) FILTER (WHERE was_correct = FALSE)::float
                   / NULLIF(COUNT(*), 0) AS error_rate
          FROM attempts
          GROUP BY question_id
        ) er ON er.question_id = q.id
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

  // Upsert: insert if missing, otherwise update the SRS + mastery fields.
  // Called by the grader after each attempt.
  async upsertAfterAttempt(input: {
    user_id: string;
    question_id: string;
    ease_factor: number;
    interval_days: number;
    repetitions: number;
    due_date: Date;
    mastery_score: number;
    was_correct: boolean;
  }): Promise<UserQuestionStateRow> {
    const rows = await this.sql<UserQuestionStateRow[]>`
      INSERT INTO user_question_state (
        user_id, question_id, ease_factor, interval_days, repetitions, due_date,
        mastery_score, times_seen, times_correct, last_seen_at
      )
      VALUES (
        ${input.user_id},
        ${input.question_id},
        ${input.ease_factor},
        ${input.interval_days},
        ${input.repetitions},
        ${input.due_date},
        ${input.mastery_score},
        1,
        ${input.was_correct ? 1 : 0},
        NOW()
      )
      ON CONFLICT (user_id, question_id) DO UPDATE SET
        ease_factor    = EXCLUDED.ease_factor,
        interval_days  = EXCLUDED.interval_days,
        repetitions    = EXCLUDED.repetitions,
        due_date       = EXCLUDED.due_date,
        mastery_score  = EXCLUDED.mastery_score,
        times_seen     = user_question_state.times_seen + 1,
        times_correct  = user_question_state.times_correct + ${input.was_correct ? 1 : 0},
        last_seen_at   = NOW()
      RETURNING ${this.sql.unsafe(COLS)}
    `;
    return rows[0];
  }
}
