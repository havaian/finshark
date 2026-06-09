import { Inject, Injectable } from "@nestjs/common";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";

// One row per ranked user. The XP figure depends on whether a paper filter is
// applied:
//   - no paper:    users.xp directly - the user's cumulative total, identical
//                  to what the dashboard / profile show.
//   - with paper:  SUM(attempts.xp_earned) restricted to that paper's
//                  questions. This is a DIFFERENT quantity (per-paper base XP,
//                  no streak bonus, all-time) and the frontend labels the
//                  column "Paper XP" to make that explicit. We can't show the
//                  cumulative total per-paper because users.xp is a single
//                  aggregate that isn't broken down by paper anywhere.
// We never return email - display_name is the only identifying field so the
// leaderboard reads as a public-style list.
export interface LeaderboardRow {
  rank: number;
  user_id: string; // included so the frontend can mark "this is me"; not displayed
  display_name: string;
  level: number;
  xp_in_window: number; // users.xp (no paper) OR summed per-paper xp_earned
  streak_count: number;
}

@Injectable()
export class LeaderboardsRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  // The query strategy splits on whether a paper filter is present:
  //   no paper  - single users-table SELECT, ORDER BY xp DESC. No join needed.
  //               Fast even at large scale. This is the all-time cumulative
  //               board and the default view.
  //   paper     - join users to attempts (with xp_earned > 0 to skip the
  //               historical zero-rows and wrong attempts), filter the
  //               attempts to that paper through questions->learning_objectives,
  //               SUM and ORDER BY. All-time (no date cutoff).
  //
  // Both paths filter to opt-in users only. `limit` is capped server-side.
  async getLeaderboard(opts: {
    paper_id: string | null;
    limit: number;
  }): Promise<LeaderboardRow[]> {
    const limit = Math.max(1, Math.min(100, opts.limit));

    if (opts.paper_id) {
      return this.sumByPaperSql(opts.paper_id, limit);
    }

    const rows = await this.sql<
      Array<{
        user_id: string;
        display_name: string;
        level: number;
        xp_in_window: number;
        streak_count: number;
      }>
    >`
      SELECT
        u.id::text                AS user_id,
        u.display_name            AS display_name,
        u.level                   AS level,
        u.xp                      AS xp_in_window,
        u.streak_count            AS streak_count
      FROM users u
      WHERE u.leaderboard_opt_in = TRUE
      ORDER BY u.xp DESC, u.id ASC
      LIMIT ${limit}
    `;
    return rows.map((r, i) => ({ rank: i + 1, ...r }));
  }

  // Shared helper for "sum xp_earned for a given paper, all-time".
  // Filters out users with zero paper XP (nothing to rank).
  private async sumByPaperSql(
    paper_id: string,
    limit: number
  ): Promise<LeaderboardRow[]> {
    const rows = await this.sql<
      Array<{
        user_id: string;
        display_name: string;
        level: number;
        xp_in_window: number;
        streak_count: number;
      }>
    >`
      SELECT
        u.id::text                              AS user_id,
        u.display_name                          AS display_name,
        u.level                                 AS level,
        COALESCE(SUM(a.xp_earned), 0)::int      AS xp_in_window,
        u.streak_count                          AS streak_count
      FROM users u
      INNER JOIN attempts a ON a.user_id = u.id
      INNER JOIN questions q ON q.id = a.question_id
      INNER JOIN learning_objectives lo ON lo.id = q.lo_id AND lo.paper_id = ${paper_id}
      WHERE u.leaderboard_opt_in = TRUE
        AND a.xp_earned > 0
      GROUP BY u.id
      HAVING COALESCE(SUM(a.xp_earned), 0) > 0
      ORDER BY xp_in_window DESC, u.id ASC
      LIMIT ${limit}
    `;
    return rows.map((r, i) => ({ rank: i + 1, ...r }));
  }
}
