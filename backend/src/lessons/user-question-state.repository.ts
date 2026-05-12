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
  async findUnseenInLo(input: {
    user_id: string;
    lo_id: string;
    limit: number;
    preferred_difficulty: 'easy' | 'medium' | 'hard';
  }): Promise<Array<{ id: string; difficulty: string }>> {
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
