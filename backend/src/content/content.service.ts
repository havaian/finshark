import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PapersRepository } from "./papers.repository";
import { LearningObjectivesRepository } from "./learning-objectives.repository";
import { QuestionsRepository } from "./questions.repository";
import type {
  LearningObjectiveRow,
  McqOption,
  PaperRow,
  QuestionRow,
  QuestionType,
} from "./content.types";
import type { CreatePaperDto, UpdatePaperDto } from "./dto/paper.dto";
import type { CreateLoDto, UpdateLoDto } from "./dto/learning-objective.dto";
import type {
  CreateQuestionDto,
  McqOptionDto,
  UpdateQuestionDto,
} from "./dto/question.dto";

// Admin-facing service. Always returns RAW rows (with both _en and _ru) so the
// admin UI can edit either language. Public read endpoints in other controllers
// use the toLocalized* helpers from content.types to project to a single language.

@Injectable()
export class ContentService {
  constructor(
    private readonly papers: PapersRepository,
    private readonly los: LearningObjectivesRepository,
    private readonly questions: QuestionsRepository
  ) {}

  // ---- papers ----

  listPapers(): Promise<PaperRow[]> {
    return this.papers.findAll();
  }

  async getPaper(id: string): Promise<PaperRow> {
    const paper = await this.papers.findById(id);
    if (!paper) throw new NotFoundException("paper not found");
    return paper;
  }

  async createPaper(dto: CreatePaperDto): Promise<PaperRow> {
    const existing = await this.papers.findByCode(dto.code);
    if (existing)
      throw new BadRequestException(`paper code "${dto.code}" already exists`);
    return this.papers.create({
      code: dto.code,
      name_en: dto.name_en,
      name_ru: dto.name_ru ?? null,
      free_accessible: dto.free_accessible,
    });
  }

  async updatePaper(id: string, dto: UpdatePaperDto): Promise<PaperRow> {
    await this.getPaper(id);
    const updated = await this.papers.update(id, dto);
    if (!updated) throw new NotFoundException("paper not found after update");
    return updated;
  }

  async deletePaper(id: string): Promise<void> {
    const ok = await this.papers.delete(id);
    if (!ok) throw new NotFoundException("paper not found");
  }

  // ---- content tree (admin browser) ----

  // Returns nested papers → LOs with question counts per LO. Used by the
  // unified admin content browser as a single payload to render the sidebar
  // tree with badges/counts.
  async getContentTree(): Promise<
    Array<{
      id: string;
      code: string;
      name_en: string;
      name_ru: string | null;
      learning_objectives: Array<{
        id: string;
        code: string;
        title_en: string;
        title_ru: string | null;
        sort_order: number;
        has_theory: boolean;
        active_count: number;
        draft_count: number;
      }>;
    }>
  > {
    const flat = await this.papers.findContentTreeFlat();

    // Group by paper_id, in encountered order (the query orders by paper code,
    // so this is stable). LOs come pre-sorted by sort_order/code within each
    // paper. Skip rows where lo_id is null — those represent papers with no
    // LOs yet (LEFT JOIN result).
    const byPaper = new Map<
      string,
      {
        id: string;
        code: string;
        name_en: string;
        name_ru: string | null;
        learning_objectives: Array<{
          id: string;
          code: string;
          title_en: string;
          title_ru: string | null;
          sort_order: number;
          has_theory: boolean;
          active_count: number;
          draft_count: number;
        }>;
      }
    >();

    for (const row of flat) {
      let paper = byPaper.get(row.paper_id);
      if (!paper) {
        paper = {
          id: row.paper_id,
          code: row.paper_code,
          name_en: row.paper_name_en,
          name_ru: row.paper_name_ru,
          learning_objectives: [],
        };
        byPaper.set(row.paper_id, paper);
      }
      if (row.lo_id) {
        paper.learning_objectives.push({
          id: row.lo_id,
          code: row.lo_code!,
          title_en: row.lo_title_en!,
          title_ru: row.lo_title_ru,
          sort_order: row.lo_sort_order ?? 0,
          has_theory: row.lo_has_theory,
          active_count: row.active_count,
          draft_count: row.draft_count,
        });
      }
    }

    return Array.from(byPaper.values());
  }

  // ---- batch operations ----

  // Bulk activate/deactivate. Empty list is a no-op; bad IDs are silently
  // dropped (no error if some don't exist).
  async setQuestionsActive(
    ids: string[],
    is_active: boolean
  ): Promise<QuestionRow[]> {
    return this.questions.setActiveMany(ids, is_active);
  }

  // Bulk delete. If any ID has dependent attempts (FK RESTRICT), the whole
  // batch rolls back and we return a friendly 400. Otherwise returns the
  // count of rows actually deleted.
  async deleteQuestionsMany(ids: string[]): Promise<number> {
    try {
      return await this.questions.deleteMany(ids);
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code === "23503") {
        throw new BadRequestException(
          "cannot delete: one or more questions have attempts. Retire them with is_active=false instead."
        );
      }
      throw err;
    }
  }

  // ---- learning objectives ----

  async listLos(paper_id: string): Promise<LearningObjectiveRow[]> {
    await this.getPaper(paper_id); // 404 if paper missing
    return this.los.findByPaper(paper_id);
  }

  async getLo(id: string): Promise<LearningObjectiveRow> {
    const lo = await this.los.findById(id);
    if (!lo) throw new NotFoundException("learning objective not found");
    return lo;
  }

  async createLo(
    paper_id: string,
    dto: CreateLoDto
  ): Promise<LearningObjectiveRow> {
    await this.getPaper(paper_id);
    return this.los.create({
      paper_id,
      code: dto.code,
      title_en: dto.title_en,
      title_ru: dto.title_ru ?? null,
      description_en: dto.description_en ?? null,
      description_ru: dto.description_ru ?? null,
      theory_en: dto.theory_en ?? null,
      theory_ru: dto.theory_ru ?? null,
      sort_order: dto.sort_order ?? 0,
    });
  }

  async updateLo(id: string, dto: UpdateLoDto): Promise<LearningObjectiveRow> {
    await this.getLo(id);
    const updated = await this.los.update(id, dto);
    if (!updated) throw new NotFoundException("lo not found after update");
    return updated;
  }

  async deleteLo(id: string): Promise<void> {
    const ok = await this.los.delete(id);
    if (!ok) throw new NotFoundException("learning objective not found");
  }

  // ---- questions ----

  async listQuestions(lo_id: string): Promise<QuestionRow[]> {
    await this.getLo(lo_id);
    return this.questions.findByLo(lo_id);
  }

  async getQuestion(id: string): Promise<QuestionRow> {
    const q = await this.questions.findById(id);
    if (!q) throw new NotFoundException("question not found");
    return q;
  }

  async createQuestion(
    lo_id: string,
    dto: CreateQuestionDto
  ): Promise<QuestionRow> {
    await this.getLo(lo_id);

    const opts = this.normalizeOptions(dto.options ?? null);
    this.validateQuestionShape(dto.type, opts, dto.correct_answer_en);

    // Canonicalize: correct option must have why_wrong = null in storage so the
    // frontend can rely on "why_wrong present ⇒ this option was wrong".
    const cleanedOpts = this.scrubCorrectOptionWhyWrong(
      opts,
      dto.type,
      dto.correct_answer_en
    );

    return this.questions.create({
      lo_id,
      type: dto.type,
      difficulty: dto.difficulty,
      prompt_en: dto.prompt_en,
      prompt_ru: dto.prompt_ru ?? null,
      options: dto.type === "mcq" ? cleanedOpts : null,
      correct_answer_en: dto.correct_answer_en,
      // Created questions are always deterministic (mcq / number_entry), and for
      // both the correct answer is language-neutral (an option key, or a numeric
      // value), so correct_answer_ru is always null. (short_answer, the only type
      // that used _ru, is retired and cannot be created.)
      correct_answer_ru: null,
      explanation_en: dto.explanation_en,
      explanation_ru: dto.explanation_ru ?? null,
      concept_bite_en: dto.concept_bite_en ?? null,
      concept_bite_ru: dto.concept_bite_ru ?? null,
      acceptable_tolerance:
        dto.type === "number_entry" ? dto.acceptable_tolerance ?? null : null,
    });
  }

  async updateQuestion(
    id: string,
    dto: UpdateQuestionDto
  ): Promise<QuestionRow> {
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

    // Canonicalize: correct option's why_wrong = null in storage.
    const cleanedNextOptions =
      dto.options !== undefined
        ? this.scrubCorrectOptionWhyWrong(nextOptions, nextType, nextCorrect)
        : undefined;

    // Normalise: number_entry forces options to null.
    // mcq or number_entry forces correct_answer_ru to null.
    // Anything other than number_entry forces acceptable_tolerance to null.
    const patch: Parameters<QuestionsRepository["update"]>[1] = {
      type: dto.type,
      difficulty: dto.difficulty,
      prompt_en: dto.prompt_en,
      prompt_ru: dto.prompt_ru,
      options: cleanedNextOptions,
      correct_answer_en: dto.correct_answer_en,
      correct_answer_ru: dto.correct_answer_ru,
      explanation_en: dto.explanation_en,
      explanation_ru: dto.explanation_ru,
      concept_bite_en: dto.concept_bite_en,
      concept_bite_ru: dto.concept_bite_ru,
      acceptable_tolerance: dto.acceptable_tolerance,
      is_active: dto.is_active,
    };
    if (nextType === "number_entry") patch.options = null;
    if (nextType === "mcq" || nextType === "number_entry")
      patch.correct_answer_ru = null;
    if (nextType !== "number_entry") patch.acceptable_tolerance = null;

    const updated = await this.questions.update(id, patch);
    if (!updated)
      throw new NotFoundException("question not found after update");
    return updated;
  }

  async deleteQuestion(id: string): Promise<void> {
    try {
      const ok = await this.questions.delete(id);
      if (!ok) throw new NotFoundException("question not found");
    } catch (err) {
      // attempts.question_id is ON DELETE RESTRICT — if attempts exist, PG throws 23503.
      // Map to a friendlier 400.
      const code = (err as { code?: string }).code;
      if (code === "23503") {
        throw new BadRequestException(
          "cannot delete: question has attempts. Set is_active=false to retire instead."
        );
      }
      throw err;
    }
  }

  // ---- helpers ----

  // Convert the DTO option shape (where text_ru / why_wrong_* are optional/undefined)
  // into the strict storage shape (all nullable string fields normalised to null).
  private normalizeOptions(opts: McqOptionDto[] | null): McqOption[] | null {
    if (opts === null) return null;
    return opts.map((o) => ({
      key: o.key,
      text_en: o.text_en,
      text_ru: o.text_ru ?? null,
      why_wrong_en: o.why_wrong_en ?? null,
      why_wrong_ru: o.why_wrong_ru ?? null,
    }));
  }

  // Storage invariant: the correct option must have why_wrong_{en,ru} = null.
  // We don't fail validation if the admin/LLM left text there — we just scrub
  // it on the way to the DB. This keeps the frontend rule "why_wrong present ⇒
  // wrong option" reliable regardless of input quality.
  private scrubCorrectOptionWhyWrong(
    opts: McqOption[] | null,
    type: QuestionType,
    correct_answer_en: string
  ): McqOption[] | null {
    if (type !== "mcq" || opts === null) return opts;
    return opts.map((o) =>
      o.key === correct_answer_en
        ? { ...o, why_wrong_en: null, why_wrong_ru: null }
        : o
    );
  }

  private validateQuestionShape(
    type: QuestionType,
    options: McqOption[] | null,
    correct_answer_en: string
  ): void {
    if (type === "mcq") {
      if (!options || options.length < 2) {
        throw new BadRequestException(
          "mcq questions require at least 2 options"
        );
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
          `correct_answer "${correct_answer_en}" must match one of the option keys`
        );
      }
    } else {
      // number_entry.
      if (options && options.length > 0) {
        throw new BadRequestException(
          "number_entry questions must not have options"
        );
      }
      if (!correct_answer_en.trim()) {
        throw new BadRequestException(
          "number_entry requires a non-empty correct_answer_en"
        );
      }
      // Must parse as a finite number. Same parser the grader uses would be
      // ideal, but a lightweight check here suffices — the grader is more
      // forgiving than the validator on purpose.
      const n = parseFloat(correct_answer_en.replace(/,/g, ""));
      if (!Number.isFinite(n)) {
        throw new BadRequestException(
          `number_entry correct_answer_en "${correct_answer_en}" must be a valid number`
        );
      }
    }
  }
}
