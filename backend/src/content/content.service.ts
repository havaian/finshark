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
import type {
  CreateQuestionDto,
  McqOptionDto,
  UpdateQuestionDto,
} from './dto/question.dto';

// Admin-facing service. Always returns RAW rows (with both _en and _ru) so the
// admin UI can edit either language. Public read endpoints in other controllers
// use the toLocalized* helpers from content.types to project to a single language.

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
    return this.papers.create({
      code: dto.code,
      name_en: dto.name_en,
      name_ru: dto.name_ru ?? null,
    });
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
      title_en: dto.title_en,
      title_ru: dto.title_ru ?? null,
      description_en: dto.description_en ?? null,
      description_ru: dto.description_ru ?? null,
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

    const opts = this.normalizeOptions(dto.options ?? null);
    this.validateQuestionShape(dto.type, opts, dto.correct_answer_en);

    return this.questions.create({
      lo_id,
      type: dto.type,
      difficulty: dto.difficulty,
      prompt_en: dto.prompt_en,
      prompt_ru: dto.prompt_ru ?? null,
      options: dto.type === 'mcq' ? opts : null,
      correct_answer_en: dto.correct_answer_en,
      correct_answer_ru: dto.type === 'mcq' ? null : (dto.correct_answer_ru ?? null),
      explanation_en: dto.explanation_en,
      explanation_ru: dto.explanation_ru ?? null,
      concept_bite_en: dto.concept_bite_en ?? null,
      concept_bite_ru: dto.concept_bite_ru ?? null,
    });
  }

  async updateQuestion(id: string, dto: UpdateQuestionDto): Promise<QuestionRow> {
    const current = await this.getQuestion(id);

    // Determine the post-update shape so we can re-validate.
    const nextType = dto.type ?? current.type;
    const nextOptions =
      dto.options !== undefined
        ? this.normalizeOptions(dto.options)
        : current.options;
    const nextCorrect =
      dto.correct_answer_en !== undefined
        ? dto.correct_answer_en
        : current.correct_answer_en;

    this.validateQuestionShape(nextType, nextOptions, nextCorrect);

    // Normalise: if type is short_answer, force options to null.
    // If type is mcq, force correct_answer_ru to null (option keys are language-neutral).
    const patch: Parameters<QuestionsRepository['update']>[1] = {
      type: dto.type,
      difficulty: dto.difficulty,
      prompt_en: dto.prompt_en,
      prompt_ru: dto.prompt_ru,
      options: dto.options !== undefined ? nextOptions : undefined,
      correct_answer_en: dto.correct_answer_en,
      correct_answer_ru: dto.correct_answer_ru,
      explanation_en: dto.explanation_en,
      explanation_ru: dto.explanation_ru,
      concept_bite_en: dto.concept_bite_en,
      concept_bite_ru: dto.concept_bite_ru,
      is_active: dto.is_active,
    };
    if (nextType === 'short_answer') patch.options = null;
    if (nextType === 'mcq') patch.correct_answer_ru = null;

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

  // Convert the DTO option shape (where text_ru is optional/undefined) into the
  // strict storage shape (text_ru is `string | null`).
  private normalizeOptions(opts: McqOptionDto[] | null): McqOption[] | null {
    if (opts === null) return null;
    return opts.map((o) => ({
      key: o.key,
      text_en: o.text_en,
      text_ru: o.text_ru ?? null,
    }));
  }

  private validateQuestionShape(
    type: 'mcq' | 'short_answer',
    options: McqOption[] | null,
    correct_answer_en: string,
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
      if (!keys.has(correct_answer_en)) {
        throw new BadRequestException(
          `correct_answer "${correct_answer_en}" must match one of the option keys`,
        );
      }
    } else {
      if (options && options.length > 0) {
        throw new BadRequestException('short_answer questions must not have options');
      }
      if (!correct_answer_en.trim()) {
        throw new BadRequestException('short_answer requires a non-empty correct_answer_en');
      }
    }
  }
}
