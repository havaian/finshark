import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/users.module";
import { ContentModule } from "../content/content.module";
import { OnboardingController } from "./onboarding.controller";
import { OnboardingService } from "./onboarding.service";

// Same pattern as AdminUsersModule + ContentModule: imports AuthModule (for
// guards/current-user decorator) and UsersModule (for the repo). ContentModule
// is imported for PapersRepository, used to derive the user's program from
// their chosen paper at onboarding time. No circular dep because
// OnboardingModule isn't imported by anything else.
@Module({
  imports: [AuthModule, UsersModule, ContentModule],
  controllers: [OnboardingController],
  providers: [OnboardingService],
})
export class OnboardingModule {}
