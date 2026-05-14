import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { AdminContentController } from './admin-content.controller';
import { PublicPapersController } from './public-papers.controller';
import { PublicUiTranslationsController } from './public-ui-translations.controller';
import { AdminUiTranslationsController } from './admin-ui-translations.controller';
import { ContentService } from './content.service';
import { UiTranslationsService } from './ui-translations.service';
import { QuestionGenerationService } from './question-generation.service';
import { PapersRepository } from './papers.repository';
import { LearningObjectivesRepository } from './learning-objectives.repository';
import { QuestionsRepository } from './questions.repository';
import { UiTranslationsRepository } from './ui-translations.repository';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [
    AdminContentController,
    PublicPapersController,
    PublicUiTranslationsController,
    AdminUiTranslationsController,
  ],
  providers: [
    ContentService,
    UiTranslationsService,
    QuestionGenerationService,
    PapersRepository,
    LearningObjectivesRepository,
    QuestionsRepository,
    UiTranslationsRepository,
  ],
  exports: [
    ContentService,
    PapersRepository,
    LearningObjectivesRepository,
    QuestionsRepository,
  ],
})
export class ContentModule {}
