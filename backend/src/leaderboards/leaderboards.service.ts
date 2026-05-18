import { Injectable } from "@nestjs/common";
import {
  LeaderboardsRepository,
  type LeaderboardRow,
  type LeaderboardWindow,
} from "./leaderboards.repository";

@Injectable()
export class LeaderboardsService {
  constructor(private readonly repo: LeaderboardsRepository) {}

  async get(opts: {
    window: LeaderboardWindow;
    paper_id: string | null;
    limit?: number;
  }): Promise<LeaderboardRow[]> {
    return this.repo.getLeaderboard({
      window: opts.window,
      paper_id: opts.paper_id,
      limit: opts.limit ?? 50,
    });
  }
}
