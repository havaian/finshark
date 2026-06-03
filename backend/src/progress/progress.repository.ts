import { Inject, Injectable } from "@nestjs/common";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";

// Row returned by the heat map query - one per LO, with paper context for grouping.
// avg_mastery is NULL when the user has no state rows for any question in the LO.
//
// Note: we select BOTH _en and _ru text columns and resolve language in the
// service layer. Doing the COALESCE in SQL would also work but keeping the
// resolution rule in TypeScript (pickLocalized) means there's one source of truth.
export interface HeatMapRow {
  paper_id: string;
  paper_code: string;
  paper_name_en: string;
  paper_name_ru: string | null;
  lo_id: string;
  lo_code: string;
  lo_title_en: string;
  lo_title_ru: string | null;
  lo_sort_order: number;
  total_questions: number; // questions in the LO (active only)
  seen_questions: number; // distinct questions the user has state for
  avg_mastery: number | null; // average mastery_score over user's state rows in this LO
}

export interface WeakTopicRow {
  lo_id: string;
  lo_code: string;
  lo_title_en: string;
  lo_title_ru: string | null;
  paper_code: string;
  avg_mastery: number;
  seen_questions: number;
}

export interface RecentSessionRow {
  id: string;
  started_at: Date;
  completed_at: Date | null;
  question_count: number;
  correct_count: number;
}

@Injectable()
export class ProgressRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  // One row per LO across all papers. LEFT JOINs so LOs with no questions
  // or no user state still appear (gray on the heat map).
  async heatMap(user_id: string): Promise<HeatMapRow[]> {
    return this.sql<HeatMapRow[]>`
      SELECT
        p.id              AS paper_id,
        p.code            AS paper_code,
        p.name_en         AS paper_name_en,
        p.name_ru         AS paper_name_ru,
        lo.id             AS lo_id,
        lo.code           AS lo_code,
        lo.title_en       AS lo_title_en,
        lo.title_ru       AS lo_title_ru,
        lo.sort_order     AS lo_sort_order,
        COUNT(DISTINCT q.id) FILTER (WHERE q.is_active)::int AS total_questions,
        COUNT(DISTINCT uqs.question_id)::int                  AS seen_questions,
        AVG(uqs.mastery_score)::float                         AS avg_mastery
      FROM papers p
      JOIN learning_objectives lo ON lo.paper_id = p.id
      LEFT JOIN questions q
        ON q.lo_id = lo.id AND q.is_active = TRUE
      LEFT JOIN user_question_state uqs
        ON uqs.question_id = q.id AND uqs.user_id = ${user_id}
      GROUP BY p.id, p.code, p.name_en, p.name_ru, lo.id, lo.code, lo.title_en, lo.title_ru, lo.sort_order
      ORDER BY p.code ASC, lo.sort_order ASC, lo.code ASC
    `;
  }

  // Weakest LOs the user has actually touched (so brand-new LOs don't dominate the list).
  async weakTopics(user_id: string, limit: number): Promise<WeakTopicRow[]> {
    return this.sql<WeakTopicRow[]>`
      SELECT
        lo.id                                AS lo_id,
        lo.code                              AS lo_code,
        lo.title_en                          AS lo_title_en,
        lo.title_ru                          AS lo_title_ru,
        p.code                               AS paper_code,
        AVG(uqs.mastery_score)::float        AS avg_mastery,
        COUNT(DISTINCT uqs.question_id)::int AS seen_questions
      FROM user_question_state uqs
      JOIN questions q             ON q.id = uqs.question_id
      JOIN learning_objectives lo  ON lo.id = q.lo_id
      JOIN papers p                ON p.id = lo.paper_id
      WHERE uqs.user_id = ${user_id}
      GROUP BY lo.id, lo.code, lo.title_en, lo.title_ru, p.code
      ORDER BY avg_mastery ASC, seen_questions DESC
      LIMIT ${limit}
    `;
  }

  // Last N completed-or-started sessions, newest first.
  async recentSessions(
    user_id: string,
    limit: number
  ): Promise<RecentSessionRow[]> {
    return this.sql<RecentSessionRow[]>`
      SELECT id, started_at, completed_at, question_count, correct_count
      FROM lesson_sessions
      WHERE user_id = ${user_id}
      ORDER BY started_at DESC
      LIMIT ${limit}
    `;
  }
}
