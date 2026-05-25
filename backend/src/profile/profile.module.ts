import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/users.module";
import { BadgesModule } from "../badges/badges.module";
import { BillingModule } from "../billing/billing.module";
import { LessonsModule } from "../lessons/lessons.module";
import { ProfileController } from "./profile.controller";
import { ProfileStatsRepository } from "./profile-stats.repository";
import { ProfileStatsService } from "./profile-stats.service";
import { PublicProfileController } from "./public-profile.controller";
import { PublicProfileService } from "./public-profile.service";

// BillingModule + LessonsModule are imported so the /me/entitlement endpoint
// can read the user's tier and current quota usage (lessons today, mocks this
// month) via EntitlementsService and LessonSessionsRepository. UsersModule
// supplies UsersRepository for the timezone needed by quota window queries.
@Module({
  imports: [AuthModule, UsersModule, BadgesModule, BillingModule, LessonsModule],
  controllers: [ProfileController, PublicProfileController],
  providers: [
    ProfileStatsRepository,
    ProfileStatsService,
    PublicProfileService,
  ],
})
export class ProfileModule {}
