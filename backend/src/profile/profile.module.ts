import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/users.module";
import { BadgesModule } from "../badges/badges.module";
import { ProfileController } from "./profile.controller";
import { ProfileStatsRepository } from "./profile-stats.repository";
import { ProfileStatsService } from "./profile-stats.service";
import { PublicProfileController } from "./public-profile.controller";
import { PublicProfileService } from "./public-profile.service";

@Module({
  imports: [AuthModule, UsersModule, BadgesModule],
  controllers: [ProfileController, PublicProfileController],
  providers: [
    ProfileStatsRepository,
    ProfileStatsService,
    PublicProfileService,
  ],
})
export class ProfileModule {}
