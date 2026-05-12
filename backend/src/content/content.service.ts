import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PapersRepository } from './papers.repository';
import { LearningObjectivesRepository } from './learning-objectives.repository';
import { QuestionsRepository } from './questions.repository';
import type {
  LearningObjectiveRow,
  McqOption,
  PaperRow,
  QuestionRow,
} from './content.types';
import type { CreatePaperDto, UpdatePaperDto } from './dto/paper.dto';
import type { CreateLoDto, UpdateLoDto } from './dto/learning-objective.dto';
import type { CreateQuestionDto, UpdateQuestionDto } from './dto/question.dto';

@Injectable()
export class ContentService {
  constructor(
    private readonly papers: PapersRepository,
    private readonly los: LearningObjectivesRepository,
    private readonly questions: QuestionsRepository,
  ) {}

  // ---- papers ----

  listPapers(): Promise<PaperRow[]> {
    return this.papers.findAll();
  }

  async getPaper(id: string): Promise<PaperRow> {
    const paper = await this.papers.findById(id);
    if (!paper) throw new NotFoundException('paper not found');
    return paper;
  }

  async createPaper(dto: CreatePaperDto): Promise<PaperRow> {
    const existing = await this.papers.findByCode(dto.code);
    if (existing) throw new BadRequestException(`paper code "${dto.code}" already exists`);
    return this.papers.create(dto);
  }

  async updatePaper(id: string, dto: UpdatePaperDto): Promise<PaperRow> {
    await this.getPaper(id);
    const updated = await this.papers.update(id, dto);
    if (!updated) throw new NotFoundException('paper not found after update');
    return updated;
  }

  async deletePaper(id: string): Promise<void> {
    const ok = await this.papers.delete(id);
    if (!ok) throw new NotFoundException('paper not found');
  }

  // ---- learning objectives ----

  async listLos(paper_id: string): Promise<LearningObjectiveRow[]> {
    await this.getPaper(paper_id);  // 404 if paper missing
    return this.los.findByPaper(paper_id);
  }

  async getLo(id: string): Promise<LearningObjectiveRow> {
    const lo = await this.los.findById(id);
    if (!lo) throw new NotFoundException('learning objective not found');
    return lo;
  }

  async createLo(paper_id: string, dto: CreateLoDto): Promise<LearningObjectiveRow> {
    await this.getPaper(paper_id);
    return this.los.create({
      paper_id,
      code: dto.code,
      title: dto.title,
      description: dto.description ?? null,
      sort_order: dto.sort_order ?? 0,
    });
  }

  async updateLo(id: string, dto: UpdateLoDto): Promise<LearningObjectiveRow> {
    await this.getLo(id);
    const updated = await this.los.update(id, dto);
    if (!updated) throw new NotFoundException('lo not found after update');
    return updated;
  }

  async deleteLo(id: string): Promise<void> {
    const ok = await this.los.delete(id);
    if (!ok) throw new NotFoundException('learning objective not found');
  }

  // ---- questions ----

  async listQuestions(lo_id: string): Promise<QuestionRow[]> {
    await this.getLo(lo_id);
    return this.questions.findByLo(lo_id);
  }

  async getQuestion(id: string): Promise<QuestionRow> {
    const q = await this.questions.findById(id);
    if (!q) throw new NotFoundException('question not found');
    return q;
  }

  async createQuestion(lo_id: string, dto: CreateQuestionDto): Promise<QuestionRow> {
    await this.getLo(lo_id);
    const { type, options, correct_answer } = dto;

    this.validateQuestionShape(type, options ?? null, correct_answer);

    return this.questions.create({
      lo_id,
      type: dto.type,
      difficulty: dto.difficulty,
      prompt: dto.prompt,
      options: type === 'mcq' ? (options as McqOption[]) : null,
      correct_answer,
      explanation: dto.explanation,
      concept_bite: dto.concept_bite ?? null,
    });
  }

  async updateQuestion(id: string, dto: UpdateQuestionDto): Promise<QuestionRow> {
    const current = await this.getQuestion(id);

    // Determine the post-update shape so we can re-validate.
    const nextType = dto.type ?? current.type;
    const nextOptions =
      dto.options !== undefined ? dto.options : current.options;
    const nextCorrect =
      dto.correct_answer !== undefined ? dto.correct_answer : current.correct_answer;

    this.validateQuestionShape(nextType, nextOptions ?? null, nextCorrect);

    // Normalise: if type is short_answer, force options to null.
    const patch: UpdateQuestionDto = { ...dto };
    if (nextType === 'short_answer') patch.options = null;

    const updated = await this.questions.update(id, patch);
    if (!updated) throw new NotFoundException('question not found after update');
    return updated;
  }

  async deleteQuestion(id: string): Promise<void> {
    try {
      const ok = await this.questions.delete(id);
      if (!ok) throw new NotFoundException('question not found');
    } catch (err) {
      // attempts.question_id is ON DELETE RESTRICT — if attempts exist, PG throws 23503.
      // Map to a friendlier 400.
      const code = (err as { code?: string }).code;
      if (code === '23503') {
        throw new BadRequestException(
          'cannot delete: question has attempts. Set is_active=false to retire instead.',
        );
      }
      throw err;
    }
  }

  // ---- helpers ----

  private validateQuestionShape(
    type: 'mcq' | 'short_answer',
    options: McqOption[] | null,
    correct_answer: string,
  ): void {
    if (type === 'mcq') {
      if (!options || options.length < 2) {
        throw new BadRequestException('mcq questions require at least 2 options');
      }
      const keys = new Set<string>();
      for (const opt of options) {
        if (keys.has(opt.key)) {
          throw new BadRequestException(`duplicate option key "${opt.key}"`);
        }
        keys.add(opt.key);
      }
      if (!keys.has(correct_answer)) {
        throw new BadRequestException(
          `correct_answer "${correct_answer}" must match one of the option keys`,
        );
      }
    } else {
      if (options && options.length > 0) {
        throw new BadRequestException('short_answer questions must not have options');
      }
      if (!correct_answer.trim()) {
        throw new BadRequestException('short_answer requires a non-empty correct_answer');
      }
    }
  }
}
