import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ContentModule } from '../content/content.module';
import { LessonsController } from './lessons.controller';
import { LessonsService } from './lessons.service';
import { LessonSessionsRepository } from './lesson-sessions.repository';
import { LessonSessionQuestionsRepository } from './lesson-session-questions.repository';
import { AttemptsRepository } from './attempts.repository';
import { UserQuestionStateRepository } from './user-question-state.repository';
import { GraderService } from './grader.service';

@Module({
  imports: [AuthModule, UsersModule, ContentModule],
  controllers: [LessonsController],
  providers: [
    LessonsService,
    LessonSessionsRepository,
    LessonSessionQuestionsRepository,
    AttemptsRepository,
    UserQuestionStateRepository,
    GraderService,
  ],
  exports: [LessonsService, GraderService],
})
export class LessonsModule {}
