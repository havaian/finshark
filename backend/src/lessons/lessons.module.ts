import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ContentModule } from '../content/content.module';
import { BadgesModule } from '../badges/badges.module';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { LessonSessionsRepository } from './lesson-sessions.repository';
import { LessonSessionQuestionsRepository } from './lesson-session-questions.repository';
import { AttemptsRepository } from './attempts.repository';
import { UserQuestionStateRepository } from './user-question-state.repository';
import { GraderService } from './grader.service';

@Module({
  imports: [AuthModule, UsersModule, ContentModule, BadgesModule],
  controllers: [LessonsController],
  providers: [
    LessonsService,
    LessonSessionsRepository,
    LessonSessionQuestionsRepository,
    AttemptsRepository,
    UserQuestionStateRepository,
    GraderService,
  ],
  // Export the service + grader plus the session-level repositories so
  // MocksModule can reuse them without re-instantiating (which would create
  // separate DB connection-pool clients per provider).
  exports: [
    LessonsService,
    GraderService,
    LessonSessionsRepository,
    LessonSessionQuestionsRepository,
    AttemptsRepository,
  ],
})
export class LessonsModule {}
