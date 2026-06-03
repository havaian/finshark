import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { LeaderboardsController } from "./leaderboards.controller";
import { LeaderboardsService } from "./leaderboards.service";
import { LeaderboardsRepository } from "./leaderboards.repository";

// Leaderboards is read-only and depends only on existing tables (users +
// attempts + papers/LOs). No imports from other feature modules needed -
// the repo holds the SQL directly rather than reaching into UsersRepository.
@Module({
  imports: [AuthModule],
  controllers: [LeaderboardsController],
  providers: [LeaderboardsService, LeaderboardsRepository],
})
export class LeaderboardsModule {}
