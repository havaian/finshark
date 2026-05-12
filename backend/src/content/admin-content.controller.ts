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
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { ContentService } from './content.service';
import { CreatePaperDto, UpdatePaperDto } from './dto/paper.dto';
import { CreateLoDto, UpdateLoDto } from './dto/learning-objective.dto';
import { CreateQuestionDto, UpdateQuestionDto } from './dto/question.dto';

// All routes under /api/admin require an authenticated admin user.
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminContentController {
  constructor(private readonly content: ContentService) {}

  // ---- papers ----

  @Get('papers')
  listPapers() {
    return this.content.listPapers();
  }

  @Post('papers')
  @HttpCode(HttpStatus.CREATED)
  createPaper(@Body() dto: CreatePaperDto) {
    return this.content.createPaper(dto);
  }

  @Get('papers/:id')
  getPaper(@Param('id') id: string) {
    return this.content.getPaper(id);
  }

  @Patch('papers/:id')
  updatePaper(@Param('id') id: string, @Body() dto: UpdatePaperDto) {
    return this.content.updatePaper(id, dto);
  }

  @Delete('papers/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deletePaper(@Param('id') id: string) {
    await this.content.deletePaper(id);
  }

  // ---- LOs ----

  @Get('papers/:paper_id/los')
  listLos(@Param('paper_id') paper_id: string) {
    return this.content.listLos(paper_id);
  }

  @Post('papers/:paper_id/los')
  @HttpCode(HttpStatus.CREATED)
  createLo(@Param('paper_id') paper_id: string, @Body() dto: CreateLoDto) {
    return this.content.createLo(paper_id, dto);
  }

  @Get('los/:id')
  getLo(@Param('id') id: string) {
    return this.content.getLo(id);
  }

  @Patch('los/:id')
  updateLo(@Param('id') id: string, @Body() dto: UpdateLoDto) {
    return this.content.updateLo(id, dto);
  }

  @Delete('los/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteLo(@Param('id') id: string) {
    await this.content.deleteLo(id);
  }

  // ---- questions ----

  @Get('los/:lo_id/questions')
  listQuestions(@Param('lo_id') lo_id: string) {
    return this.content.listQuestions(lo_id);
  }

  @Post('los/:lo_id/questions')
  @HttpCode(HttpStatus.CREATED)
  createQuestion(@Param('lo_id') lo_id: string, @Body() dto: CreateQuestionDto) {
    return this.content.createQuestion(lo_id, dto);
  }

  @Get('questions/:id')
  getQuestion(@Param('id') id: string) {
    return this.content.getQuestion(id);
  }

  @Patch('questions/:id')
  updateQuestion(@Param('id') id: string, @Body() dto: UpdateQuestionDto) {
    return this.content.updateQuestion(id, dto);
  }

  @Delete('questions/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteQuestion(@Param('id') id: string) {
    await this.content.deleteQuestion(id);
  }
}
