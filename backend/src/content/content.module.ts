import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/users.module";
import { AdminContentController } from "./admin-content.controller";
import { PublicPapersController } from "./public-papers.controller";
import { PublicUiTranslationsController } from "./public-ui-translations.controller";
import { AdminUiTranslationsController } from "./admin-ui-translations.controller";
import { ContentService } from "./content.service";
import { UiTranslationsService } from "./ui-translations.service";
import { UiTranslationsFileStore } from "./ui-translations.file-store";
import { QuestionGenerationService } from "./question-generation.service";
import { PapersRepository } from "./papers.repository";
import { ProgramsRepository } from "./programs.repository";
import { LearningObjectivesRepository } from "./learning-objectives.repository";
import { QuestionsRepository } from "./questions.repository";

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
    // File-backed override store. Replaces the previous DB-backed
    // UiTranslationsRepository.
    UiTranslationsFileStore,
    QuestionGenerationService,
    PapersRepository,
    ProgramsRepository,
    LearningObjectivesRepository,
    QuestionsRepository,
  ],
  exports: [
    ContentService,
    PapersRepository,
    ProgramsRepository,
    LearningObjectivesRepository,
    QuestionsRepository,
  ],
})
export class ContentModule {}
