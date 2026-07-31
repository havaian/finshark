import { Inject, Injectable } from "@nestjs/common";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";

export interface OverallStatsRow {
  total_sessions_completed: number;
  total_questions_answered: number;
  total_correct: number;
}

export interface AccuracyByPaperRow {
  paper_id: string;
  paper_code: string;
  paper_name_en: string;
  paper_name_ru: string | null;
  paper_name_uz: string | null;
  attempts: number;
  correct: number;
}

export interface DifficultyBreakdownRow {
  difficulty: "easy" | "medium" | "hard";
  attempts: number;
  correct: number;
}

export interface TypeBreakdownRow {
  type: "mcq" | "number_entry";
  attempts: number;
  correct: number;
}

// One row per local-date in the last N days where the user had ≥1 attempt.
// `attempts_count` is what the heatmap colour intensity is keyed on.
export interface ActivityHeatmapRow {
  day: Date;
  attempts_count: number;
}

export interface MasterySnapshotRow {
  snap_date: Date;
  avg_mastery: number;
}

@Injectable()
export class ProfileStatsRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  // Top-line numbers.
  async overall(user_id: string): Promise<OverallStatsRow> {
    const rows = await this.sql<
      Array<{
        total_sessions_completed: string;
        total_questions_answered: string;
        total_correct: string;
      }>
    >`
      SELECT
        (SELECT COUNT(*)::text FROM lesson_sessions WHERE user_id = ${user_id} AND completed_at IS NOT NULL) AS total_sessions_completed,
        (SELECT COUNT(*)::text FROM attempts WHERE user_id = ${user_id})                                      AS total_questions_answered,
        (SELECT COUNT(*)::text FROM attempts WHERE user_id = ${user_id} AND was_correct = TRUE)               AS total_correct
    `;
    const r = rows[0];
    return {
      total_sessions_completed: parseInt(r.total_sessions_completed, 10),
      total_questions_answered: parseInt(r.total_questions_answered, 10),
      total_correct: parseInt(r.total_correct, 10),
    };
  }

  // Attempts grouped by paper. Paper labels include both languages so the
  // service can localise.
  async accuracyByPaper(user_id: string): Promise<AccuracyByPaperRow[]> {
    return this.sql<AccuracyByPaperRow[]>`
      SELECT
        p.id         AS paper_id,
        p.code       AS paper_code,
        p.name_en    AS paper_name_en,
        p.name_ru    AS paper_name_ru,
        p.name_uz    AS paper_name_uz,
        COUNT(a.id)::int                                AS attempts,
        COUNT(a.id) FILTER (WHERE a.was_correct)::int   AS correct
      FROM attempts a
      JOIN questions q            ON q.id = a.question_id
      JOIN learning_objectives lo ON lo.id = q.lo_id
      JOIN papers p               ON p.id = lo.paper_id
      WHERE a.user_id = ${user_id}
      GROUP BY p.id, p.code, p.name_en, p.name_ru
      ORDER BY p.code ASC
    `;
  }

  async difficultyBreakdown(
    user_id: string
  ): Promise<DifficultyBreakdownRow[]> {
    return this.sql<DifficultyBreakdownRow[]>`
      SELECT
        q.difficulty                                    AS difficulty,
        COUNT(a.id)::int                                AS attempts,
        COUNT(a.id) FILTER (WHERE a.was_correct)::int   AS correct
      FROM attempts a
      JOIN questions q ON q.id = a.question_id
      WHERE a.user_id = ${user_id}
      GROUP BY q.difficulty
    `;
  }

  async typeBreakdown(user_id: string): Promise<TypeBreakdownRow[]> {
    return this.sql<TypeBreakdownRow[]>`
      SELECT
        q.type                                          AS type,
        COUNT(a.id)::int                                AS attempts,
        COUNT(a.id) FILTER (WHERE a.was_correct)::int   AS correct
      FROM attempts a
      JOIN questions q ON q.id = a.question_id
      WHERE a.user_id = ${user_id}
      GROUP BY q.type
    `;
  }

  // Per-day attempt counts over the last `days` calendar days (UTC).
  // Days with zero attempts are not in the result - frontend fills in zeros
  // when rendering the heatmap grid.
  async activityHeatmap(
    user_id: string,
    days: number
  ): Promise<ActivityHeatmapRow[]> {
    return this.sql<ActivityHeatmapRow[]>`
      SELECT
        (a.answered_at AT TIME ZONE 'UTC')::date  AS day,
        COUNT(*)::int                             AS attempts_count
      FROM attempts a
      WHERE a.user_id = ${user_id}
        AND a.answered_at >= NOW() - (${days}::int || ' days')::interval
      GROUP BY day
      ORDER BY day ASC
    `;
  }

  // Daily mastery snapshots for the chart. Limited to the last `days` days.
  async masteryHistory(
    user_id: string,
    days: number
  ): Promise<MasterySnapshotRow[]> {
    return this.sql<MasterySnapshotRow[]>`
      SELECT snap_date, avg_mastery
      FROM mastery_snapshots
      WHERE user_id = ${user_id}
        AND snap_date >= CURRENT_DATE - (${days}::int || ' days')::interval
      ORDER BY snap_date ASC
    `;
  }

  // Cron path: upsert today's snapshot for every user that has any
  // user_question_state rows. Idempotent within a day (ON CONFLICT DO UPDATE).
  async writeTodaysSnapshots(): Promise<number> {
    const rows = await this.sql<Array<{ user_id: string }>>`
      INSERT INTO mastery_snapshots (user_id, snap_date, avg_mastery)
      SELECT
        user_id,
        CURRENT_DATE        AS snap_date,
        AVG(mastery_score)  AS avg_mastery
      FROM user_question_state
      GROUP BY user_id
      ON CONFLICT (user_id, snap_date) DO UPDATE SET
        avg_mastery = EXCLUDED.avg_mastery
      RETURNING user_id
    `;
    return rows.length;
  }
}
