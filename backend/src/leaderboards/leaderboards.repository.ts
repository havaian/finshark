import { Inject, Injectable } from "@nestjs/common";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";

// One row per ranked user. The window query computes XP differently:
//   - 'week' / 'month': sum attempts.xp_earned where answered_at >= cutoff
//   - 'all':            users.xp directly (no attempts join)
// We never return user_id or email - display_name is the only identifying
// field so the leaderboard reads as a public-style list.
export interface LeaderboardRow {
  rank: number;
  user_id: string; // included so the frontend can mark "this is me"; not displayed
  display_name: string;
  level: number;
  xp_in_window: number; // for window=all, equals users.xp
  streak_count: number;
}

export type LeaderboardWindow = "week" | "month" | "all";

@Injectable()
export class LeaderboardsRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  // The query strategy splits cleanly on window:
  //   'all'              - single users-table SELECT, ORDER BY xp DESC. No
  //                        join needed. Fast even at large scale.
  //   'week' or 'month'  - join users to attempts (with xp_earned > 0 to skip
  //                        the historical zero-rows from before this feature
  //                        existed and wrong attempts), filter by answered_at
  //                        cutoff, optionally filter by paper through
  //                        questions→learning_objectives. SUM and ORDER BY.
  //
  // Both paths filter to opt-in users only. `limit` is capped server-side.
  async getLeaderboard(opts: {
    window: LeaderboardWindow;
    paper_id: string | null;
    limit: number;
  }): Promise<LeaderboardRow[]> {
    const limit = Math.max(1, Math.min(100, opts.limit));

    if (opts.window === "all") {
      // Paper filter on the all-time board uses summed xp_earned restricted
      // to that paper. We do this regardless of window to keep semantics
      // consistent - "all-time XP for paper X". If paper_id is null we just
      // use users.xp, which covers all papers and works for old data.
      if (opts.paper_id) {
        return this.sumByPaperSql(opts.paper_id, null, limit);
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

    // Window queries - compute the cutoff in app-land so the query stays
    // portable across timezones. Postgres NOW() is UTC; cutoff is naive
    // ISO timestamp.
    const days = opts.window === "week" ? 7 : 30;
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    return this.sumByPaperSql(opts.paper_id, cutoff, limit);
  }

  // Shared helper for "sum xp_earned with optional paper + optional cutoff".
  // Filters out users with zero windowed XP (nothing to rank).
  private async sumByPaperSql(
    paper_id: string | null,
    cutoff: Date | null,
    limit: number
  ): Promise<LeaderboardRow[]> {
    const cutoffFilter = cutoff
      ? this.sql`AND a.answered_at >= ${cutoff}`
      : this.sql``;
    const paperJoin = paper_id
      ? this.sql`
          INNER JOIN questions q ON q.id = a.question_id
          INNER JOIN learning_objectives lo ON lo.id = q.lo_id AND lo.paper_id = ${paper_id}
        `
      : this.sql``;

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
      ${paperJoin}
      WHERE u.leaderboard_opt_in = TRUE
        AND a.xp_earned > 0
        ${cutoffFilter}
      GROUP BY u.id
      HAVING COALESCE(SUM(a.xp_earned), 0) > 0
      ORDER BY xp_in_window DESC, u.id ASC
      LIMIT ${limit}
    `;
    return rows.map((r, i) => ({ rank: i + 1, ...r }));
  }
}
