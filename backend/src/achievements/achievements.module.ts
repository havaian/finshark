import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AchievementsController } from "./achievements.controller";
import { AchievementsService } from "./achievements.service";
import { AchievementsRepository } from "./achievements.repository";
import { AchievementMetricsRepository } from "./achievements.rules";

// Exports AchievementsService so LessonsModule can call evaluateAfterSession
// from the same hook point that already drives badges. Mirrors BadgesModule.
@Module({
  imports: [AuthModule],
  controllers: [AchievementsController],
  providers: [
    AchievementsService,
    AchievementsRepository,
    AchievementMetricsRepository,
  ],
  exports: [AchievementsService],
})
export class AchievementsModule {}
