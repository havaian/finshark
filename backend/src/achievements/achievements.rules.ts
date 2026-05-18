import { Inject, Injectable } from "@nestjs/common";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";

// Snapshot of the user-level metrics every achievement maps to. Built ONCE
// per evaluation so we don't fan out into one query per achievement.
//
// Each field name corresponds 1:1 with an achievement `code` in
// src/seed/data/achievements.ts via METRICS_BY_CODE below. Adding a new
// achievement:
//   1) Add the metric field here.
//   2) Add the SQL aggregate in build() below.
//   3) Add the catalog entry in src/seed/data/achievements.ts.
//   4) Wire the code → field name mapping in METRICS_BY_CODE.
export interface AchievementMetrics {
  // Total completed lesson_sessions in mode='lesson'. Mocks tracked separately
  // — so this is just regular learning sessions.
  lessons_completed: number;
  // Current streak count on users.streak_count.
  streak_days: number;
  // Cumulative XP on users.xp.
  xp_earned: number;
  // Completed lesson sessions (mode='lesson') where correct_count ==
  // question_count AND question_count > 0. Zero-question sessions don't count.
  perfect_lessons: number;
  // Completed mock sessions where correct_count / question_count >= 0.5.
  // We treat >=50% as "passed" per the seed's threshold semantics.
  mocks_passed: number;
}

// Maps catalog code → which metric key is the progress value. Keeping this
// mapping explicit means an evaluator pass over the catalog reads the right
// field for each row without dispatching through a switch.
export const METRICS_BY_CODE: Record<string, keyof AchievementMetrics> = {
  lessons_completed: "lessons_completed",
  streak_days: "streak_days",
  xp_earned: "xp_earned",
  perfect_lessons: "perfect_lessons",
  mocks_passed: "mocks_passed",
};

@Injectable()
export class AchievementMetricsRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  // Single query collecting every metric. Subqueries (rather than one big
  // JOIN) keep each aggregate independent — the lessons aggregate doesn't
  // care about the mocks aggregate, etc. All defaults are 0 via COALESCE.
  //
  // perfect_lessons: question_count > 0 guard avoids treating a zero-attempt
  // session as a perfect run, which would be nonsense.
  //
  // mocks_passed: 50% threshold matches the seed's "pass" definition. If we
  // ever want stricter thresholds we'd add a separate metric (don't conflate).
  async build(user_id: string): Promise<AchievementMetrics> {
    const rows = await this.sql<
      Array<{
        lessons_completed: number;
        streak_days: number;
        xp_earned: number;
        perfect_lessons: number;
        mocks_passed: number;
      }>
    >`
      SELECT
        COALESCE(u.xp, 0)            AS xp_earned,
        COALESCE(u.streak_count, 0)  AS streak_days,
        (
          SELECT COUNT(*)::int
          FROM lesson_sessions s
          WHERE s.user_id = u.id
            AND s.mode = 'lesson'
            AND s.completed_at IS NOT NULL
        )                            AS lessons_completed,
        (
          SELECT COUNT(*)::int
          FROM lesson_sessions s
          WHERE s.user_id = u.id
            AND s.mode = 'lesson'
            AND s.completed_at IS NOT NULL
            AND s.question_count > 0
            AND s.correct_count = s.question_count
        )                            AS perfect_lessons,
        (
          SELECT COUNT(*)::int
          FROM lesson_sessions s
          WHERE s.user_id = u.id
            AND s.mode = 'mock'
            AND s.completed_at IS NOT NULL
            AND s.question_count > 0
            AND (s.correct_count::float / s.question_count::float) >= 0.5
        )                            AS mocks_passed
      FROM users u
      WHERE u.id = ${user_id}
    `;

    const r = rows[0];
    if (!r) {
      // User vanished mid-eval — return zero metrics rather than throwing.
      // The evaluator already swallows errors; this just keeps the SQL path
      // clean.
      return {
        lessons_completed: 0,
        streak_days: 0,
        xp_earned: 0,
        perfect_lessons: 0,
        mocks_passed: 0,
      };
    }
    return r;
  }
}
