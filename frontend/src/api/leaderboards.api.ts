import { api } from "./client";

// Mirrors backend src/leaderboards/leaderboards.repository.ts LeaderboardRow.
export interface LeaderboardEntry {
  rank: number;
  user_id: string; // used by the page to mark "this is you"; not shown
  display_name: string;
  level: number;
  // With no paper filter this equals users.xp (the cumulative total shown on
  // the dashboard/profile). With a paper filter it's the summed per-paper
  // xp_earned - a different quantity the page labels "Paper XP".
  xp_in_window: number;
  streak_count: number;
}

export const leaderboardsApi = {
  // GET /leaderboards?paper_id=&limit=
  // Auth required; server caps limit at 100 regardless of what's sent.
  // No paper_id -> all-time cumulative board ranked by users.xp.
  // With paper_id -> all-time per-paper board ranked by summed xp_earned.
  get: async (opts: {
    paper_id?: string | null;
    limit?: number;
  }): Promise<LeaderboardEntry[]> => {
    const params: Record<string, string | number> = {};
    if (opts.paper_id) params.paper_id = opts.paper_id;
    if (opts.limit) params.limit = opts.limit;
    return (await api.get<LeaderboardEntry[]>("/leaderboards", { params }))
      .data;
  },
};
