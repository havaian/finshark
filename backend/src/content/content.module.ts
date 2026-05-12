import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { AdminContentController } from './admin-content.controller';
import { PublicPapersController } from './public-papers.controller';
import { ContentService } from './content.service';
import { PapersRepository } from './papers.repository';
import { LearningObjectivesRepository } from './learning-objectives.repository';
import { QuestionsRepository } from './questions.repository';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [AdminContentController, PublicPapersController],
  providers: [
    ContentService,
    PapersRepository,
    LearningObjectivesRepository,
    QuestionsRepository,
  ],
  exports: [
    ContentService,
    PapersRepository,
    LearningObjectivesRepository,
    QuestionsRepository,
  ],
})
export class ContentModule {}
