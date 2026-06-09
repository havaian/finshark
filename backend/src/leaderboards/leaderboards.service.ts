import { Injectable } from "@nestjs/common";
import {
  LeaderboardsRepository,
  type LeaderboardRow,
} from "./leaderboards.repository";

@Injectable()
export class LeaderboardsService {
  constructor(private readonly repo: LeaderboardsRepository) {}

  async get(opts: {
    paper_id: string | null;
    limit?: number;
  }): Promise<LeaderboardRow[]> {
    return this.repo.getLeaderboard({
      paper_id: opts.paper_id,
      limit: opts.limit ?? 50,
    });
  }
}
