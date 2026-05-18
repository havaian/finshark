import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { BadgesController } from "./badges.controller";
import { BadgesService } from "./badges.service";
import { BadgesRepository } from "./badges.repository";
import { BadgeContextRepository } from "./badges.rules";

// Exports BadgesService so LessonsModule can call evaluateAfterSession on
// completion. Imports AuthModule for the JwtAuthGuard used by the controller.
@Module({
  imports: [AuthModule],
  controllers: [BadgesController],
  providers: [BadgesService, BadgesRepository, BadgeContextRepository],
  exports: [BadgesService],
})
export class BadgesModule {}
