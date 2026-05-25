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
  // Per-paper lesson counts. Counted as "any completed lesson_session whose
  // attempts touched a question whose LO belongs to this paper" — so a
  // mixed-paper session counts toward every paper it touched. Rationale:
  // diversified-due queue means a single lesson commonly spans multiple
  // papers, and we don't want users to feel the "F1 ladder" stuck because
  // their lessons happened to be cross-paper.
  f1_lessons_completed: number;
  f2_lessons_completed: number;
  f3_lessons_completed: number;
  f5_lessons_completed: number;
  // Rolling-30-day accuracy as an integer percentage (0-100). Gated to 0
  // until the user has ROLLING_ACCURACY_MIN_ATTEMPTS attempts in the window
  // so a new user with one lucky right answer doesn't insta-unlock 100%.
  // See the SQL below for the gating math.
  accuracy_rolling_30: number;
}

// Minimum attempt volume inside the 30-day window before accuracy_rolling_30
// is computed. Below this, the metric reports 0 so the achievement stays
// locked. Tuned for a target learner doing 3-5 lessons/week — 20 attempts
// is roughly one solid week of practice.
export const ROLLING_ACCURACY_MIN_ATTEMPTS = 20;

// Maps catalog code → which metric key is the progress value. Keeping this
// mapping explicit means an evaluator pass over the catalog reads the right
// field for each row without dispatching through a switch.
export const METRICS_BY_CODE: Record<string, keyof AchievementMetrics> = {
  lessons_completed: "lessons_completed",
  streak_days: "streak_days",
  xp_earned: "xp_earned",
  perfect_lessons: "perfect_lessons",
  mocks_passed: "mocks_passed",
  f1_lessons_completed: "f1_lessons_completed",
  f2_lessons_completed: "f2_lessons_completed",
  f3_lessons_completed: "f3_lessons_completed",
  f5_lessons_completed: "f5_lessons_completed",
  accuracy_rolling_30: "accuracy_rolling_30",
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
    // Per-paper aggregate (DISTINCT s.id grouped by paper code) is computed
    // once as a CTE and pivoted into individual columns via FILTER. This is
    // cheaper than four near-identical subqueries and keeps the join graph
    // visible in one place.
    //
    // accuracy_rolling_30 uses a CASE-gated NULLIF so the integer divide
    // returns 0 (not NULL) when the user is below ROLLING_ACCURACY_MIN_ATTEMPTS,
    // which matches the interface contract.
    const minAttempts = ROLLING_ACCURACY_MIN_ATTEMPTS;
    const rows = await this.sql<
      Array<{
        lessons_completed: number;
        streak_days: number;
        xp_earned: number;
        perfect_lessons: number;
        mocks_passed: number;
        f1_lessons_completed: number;
        f2_lessons_completed: number;
        f3_lessons_completed: number;
        f5_lessons_completed: number;
        accuracy_rolling_30: number;
      }>
    >`
      WITH per_paper AS (
        SELECT
          p.code AS paper_code,
          COUNT(DISTINCT s.id)::int AS sessions
        FROM lesson_sessions s
        JOIN attempts a            ON a.session_id = s.id
        JOIN questions q           ON q.id = a.question_id
        JOIN learning_objectives lo ON lo.id = q.lo_id
        JOIN papers p              ON p.id = lo.paper_id
        WHERE s.user_id = ${user_id}
          AND s.mode = 'lesson'
          AND s.completed_at IS NOT NULL
        GROUP BY p.code
      ),
      rolling AS (
        SELECT
          COUNT(*)::int                                                   AS total_attempts,
          SUM(CASE WHEN was_correct THEN 1 ELSE 0 END)::int               AS correct_attempts
        FROM attempts
        WHERE user_id = ${user_id}
          AND answered_at >= NOW() - INTERVAL '30 days'
      )
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
        )                            AS mocks_passed,
        COALESCE((SELECT sessions FROM per_paper WHERE paper_code = 'F1'), 0) AS f1_lessons_completed,
        COALESCE((SELECT sessions FROM per_paper WHERE paper_code = 'F2'), 0) AS f2_lessons_completed,
        COALESCE((SELECT sessions FROM per_paper WHERE paper_code = 'F3'), 0) AS f3_lessons_completed,
        COALESCE((SELECT sessions FROM per_paper WHERE paper_code = 'F5'), 0) AS f5_lessons_completed,
        (
          SELECT CASE
            WHEN r.total_attempts < ${minAttempts} THEN 0
            ELSE (r.correct_attempts * 100 / NULLIF(r.total_attempts, 0))
          END
          FROM rolling r
        )                            AS accuracy_rolling_30
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
        f1_lessons_completed: 0,
        f2_lessons_completed: 0,
        f3_lessons_completed: 0,
        f5_lessons_completed: 0,
        accuracy_rolling_30: 0,
      };
    }
    return r;
  }
}
