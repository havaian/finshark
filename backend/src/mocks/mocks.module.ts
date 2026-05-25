import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { LessonsModule } from "../lessons/lessons.module";
import { ContentModule } from "../content/content.module";
import { UsersModule } from "../users/users.module";
import { BillingModule } from "../billing/billing.module";
import { MocksController } from "./mocks.controller";
import { MocksService } from "./mocks.service";

// Mocks depend on:
//   - AuthModule for JwtAuthGuard
//   - LessonsModule for LessonsService + the session/attempt repositories
//     (which we re-use unchanged for mock sessions)
//   - ContentModule for QuestionsRepository + PapersRepository
//   - UsersModule for UsersRepository (user timezone for monthly quota window)
//   - BillingModule for EntitlementsService (free-tier gates)
@Module({
  imports: [AuthModule, LessonsModule, ContentModule, UsersModule, BillingModule],
  controllers: [MocksController],
  providers: [MocksService],
})
export class MocksModule {}
