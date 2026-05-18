import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { LessonsModule } from '../lessons/lessons.module';
import { ContentModule } from '../content/content.module';
import { MocksController } from './mocks.controller';
import { MocksService } from './mocks.service';

// Mocks depend on:
//   - AuthModule for JwtAuthGuard
//   - LessonsModule for LessonsService + the session/attempt repositories
//     (which we re-use unchanged for mock sessions)
//   - ContentModule for QuestionsRepository (random sampler + by-IDs lookup)
//
// All repositories used by MocksService are already provided & exported by
// LessonsModule and ContentModule, so we just import them.
@Module({
  imports: [AuthModule, LessonsModule, ContentModule],
  controllers: [MocksController],
  providers: [MocksService],
})
export class MocksModule {}
