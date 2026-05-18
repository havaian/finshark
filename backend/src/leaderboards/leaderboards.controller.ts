import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { LeaderboardsService } from './leaderboards.service';
import { GetLeaderboardDto } from './dto/get-leaderboard.dto';

// Auth-required so the leaderboard isn't a public scrape target. The actual
// data shown is the same display_name + XP that opted-in users have agreed to
// expose; auth gate is mostly to discourage casual harvesting.
@Controller('leaderboards')
@UseGuards(JwtAuthGuard)
export class LeaderboardsController {
  constructor(private readonly leaderboards: LeaderboardsService) {}

  @Get()
  get(@Query() dto: GetLeaderboardDto) {
    return this.leaderboards.get({
      window: dto.window,
      paper_id: dto.paper_id ?? null,
      limit: dto.limit,
    });
  }
}
