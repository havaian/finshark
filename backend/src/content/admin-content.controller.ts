import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminWith2faGuard } from "../auth/guards/admin-with-2fa.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AccessTokenPayload } from "../auth/auth.service";
import { ContentService } from "./content.service";
import { QuestionGenerationService } from "./question-generation.service";
import { CreatePaperDto, UpdatePaperDto } from "./dto/paper.dto";
import { CreateLoDto, UpdateLoDto } from "./dto/learning-objective.dto";
import { CreateQuestionDto, UpdateQuestionDto } from "./dto/question.dto";
import { GenerateQuestionsDto } from "./dto/generate-questions.dto";
import {
  BatchQuestionIdsDto,
  BatchSetActiveDto,
} from "./dto/batch-questions.dto";

// All routes under /api/admin require an authenticated admin user.
@Controller("admin")
@UseGuards(JwtAuthGuard, AdminWith2faGuard)
export class AdminContentController {
  constructor(
    private readonly content: ContentService,
    private readonly generator: QuestionGenerationService
  ) {}

  // ---- programs ----

  // List certification programs (acca, cfa, ...). Feeds the program dropdown
  // on the paper editor so an admin can assign a paper to a program.
  @Get("programs")
  listPrograms() {
    return this.content.listPrograms();
  }

  // ---- papers ----

  // Admin content tree - papers with their LOs and per-LO question counts.
  // Used by the unified content browser (/admin/content) to render the sidebar
  // in one network round-trip.
  @Get("content/tree")
  getContentTree() {
    return this.content.getContentTree();
  }

  @Post("papers")
  @HttpCode(HttpStatus.CREATED)
  createPaper(@Body() dto: CreatePaperDto) {
    return this.content.createPaper(dto);
  }

  @Get("papers/:id")
  getPaper(@Param("id") id: string) {
    return this.content.getPaper(id);
  }

  @Patch("papers/:id")
  updatePaper(@Param("id") id: string, @Body() dto: UpdatePaperDto) {
    return this.content.updatePaper(id, dto);
  }

  @Delete("papers/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePaper(@Param("id") id: string) {
    await this.content.deletePaper(id);
  }

  // ---- LOs ----

  @Get("papers/:paper_id/los")
  listLos(@Param("paper_id") paper_id: string) {
    return this.content.listLos(paper_id);
  }

  @Post("papers/:paper_id/los")
  @HttpCode(HttpStatus.CREATED)
  createLo(@Param("paper_id") paper_id: string, @Body() dto: CreateLoDto) {
    return this.content.createLo(paper_id, dto);
  }

  @Get("los/:id")
  getLo(@Param("id") id: string) {
    return this.content.getLo(id);
  }

  @Patch("los/:id")
  updateLo(@Param("id") id: string, @Body() dto: UpdateLoDto) {
    return this.content.updateLo(id, dto);
  }

  @Delete("los/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLo(@Param("id") id: string) {
    await this.content.deleteLo(id);
  }

  // ---- questions ----

  @Get("los/:lo_id/questions")
  listQuestions(@Param("lo_id") lo_id: string) {
    return this.content.listQuestions(lo_id);
  }

  @Post("los/:lo_id/questions")
  @HttpCode(HttpStatus.CREATED)
  createQuestion(
    @Param("lo_id") lo_id: string,
    @Body() dto: CreateQuestionDto
  ) {
    return this.content.createQuestion(lo_id, dto);
  }

  // Generate draft questions via LLM. Inserts them as is_active=false so they
  // don't appear in lessons until an admin reviews and activates them.
  // Returns the inserted rows so the frontend can refresh its list.
  // Rate-limited per admin user; see QuestionGenerationService for the caps.
  @Post("los/:lo_id/questions/generate")
  @HttpCode(HttpStatus.CREATED)
  generateQuestions(
    @Param("lo_id") lo_id: string,
    @Body() dto: GenerateQuestionsDto,
    @CurrentUser() current: AccessTokenPayload
  ) {
    return this.generator.generate({
      admin_user_id: current.sub,
      lo_id,
      count: dto.count,
      hints: dto.hints ?? "",
    });
  }

  @Get("questions/:id")
  getQuestion(@Param("id") id: string) {
    return this.content.getQuestion(id);
  }

  @Patch("questions/:id")
  updateQuestion(@Param("id") id: string, @Body() dto: UpdateQuestionDto) {
    return this.content.updateQuestion(id, dto);
  }

  @Delete("questions/:id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuestion(@Param("id") id: string) {
    await this.content.deleteQuestion(id);
  }

  // ---- batch operations (admin content browser) ----

  // Bulk set is_active for many question IDs. Returns the updated rows so the
  // UI can refresh without a follow-up GET.
  @Post("questions/batch/active")
  @HttpCode(HttpStatus.OK)
  setQuestionsActive(@Body() dto: BatchSetActiveDto) {
    return this.content.setQuestionsActive(dto.ids, dto.is_active);
  }

  // Bulk hard delete. Rolls back the whole batch if ANY id has dependent
  // attempts (FK RESTRICT). Returns count actually deleted.
  @Post("questions/batch/delete")
  @HttpCode(HttpStatus.OK)
  async deleteQuestionsMany(@Body() dto: BatchQuestionIdsDto) {
    const deleted = await this.content.deleteQuestionsMany(dto.ids);
    return { deleted };
  }
}
