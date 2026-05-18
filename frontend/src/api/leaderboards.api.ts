import { api } from './client';

// Mirrors backend src/leaderboards/leaderboards.repository.ts LeaderboardRow.
export interface LeaderboardEntry {
  rank: number;
  user_id: string;        // used by the page to mark "this is you"; not shown
  display_name: string;
  level: number;
  xp_in_window: number;   // for window='all' this equals users.xp
  streak_count: number;
}

export type LeaderboardWindow = 'week' | 'month' | 'all';

export const leaderboardsApi = {
  // GET /leaderboards?window=&paper_id=&limit=
  // Auth required; server caps limit at 100 regardless of what's sent.
  get: async (opts: {
    window: LeaderboardWindow;
    paper_id?: string | null;
    limit?: number;
  }): Promise<LeaderboardEntry[]> => {
    const params: Record<string, string | number> = { window: opts.window };
    if (opts.paper_id) params.paper_id = opts.paper_id;
    if (opts.limit) params.limit = opts.limit;
    return (await api.get<LeaderboardEntry[]>('/leaderboards', { params })).data;
  },
};
