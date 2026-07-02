import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PapersRepository } from "./papers.repository";
import { ProgramsRepository } from "./programs.repository";
import { LearningObjectivesRepository } from "./learning-objectives.repository";
import { QuestionsRepository } from "./questions.repository";
import type {
  LearningObjectiveRow,
  McqOption,
  MatchingPayload,
  PaperRow,
  ProgramRow,
  QuestionPayload,
  QuestionRow,
  QuestionType,
  TrueFalsePayload,
  ExamStructure,
} from "./content.types";
import {
  ACCA_APPLIED_KNOWLEDGE_STRUCTURE,
  DEFAULT_PROGRAM_CODE,
  validateExamStructure,
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
    private readonly programs: ProgramsRepository,
    private readonly los: LearningObjectivesRepository,
    private readonly questions: QuestionsRepository
  ) {}

  // ---- programs ----

  // List all certification programs (acca, cfa, ...). Used by the admin paper
  // editor's program dropdown and by program-aware listing elsewhere.
  listPrograms(): Promise<ProgramRow[]> {
    return this.programs.findAll();
  }

  // ---- papers ----

  listPapers(): Promise<PaperRow[]> {
    return this.papers.findAll();
  }

  // Active-question count per paper id, as a Map for O(1) lookup when projecting
  // the public paper listing. Papers with no active questions map to 0.
  async activeQuestionCountsByPaper(): Promise<Map<string, number>> {
    const rows = await this.papers.countActiveByPaper();
    return new Map(rows.map((r) => [r.paper_id, r.active_count]));
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

    // Resolve the program (default to ACCA when not specified) to its id, since
    // papers.program_id is NOT NULL and stores the id, not the code.
    const programCode = dto.program_code ?? DEFAULT_PROGRAM_CODE;
    const program = await this.programs.findByCode(programCode);
    if (!program)
      throw new BadRequestException(`unknown program code "${programCode}"`);

    // Validate the supplied structure, or fall back to the ACCA Applied
    // Knowledge default. validateExamStructure enforces the ot/mtq marks rules
    // and unique section codes; a bad structure is a 400, not a 500.
    let structure: ExamStructure;
    try {
      structure = dto.exam_structure
        ? validateExamStructure(dto.exam_structure)
        : ACCA_APPLIED_KNOWLEDGE_STRUCTURE;
    } catch (e) {
      throw new BadRequestException(
        e instanceof Error ? e.message : "invalid exam_structure"
      );
    }

    return this.papers.create({
      code: dto.code,
      name_en: dto.name_en,
      name_ru: dto.name_ru ?? null,
      free_accessible: dto.free_accessible,
      program_id: program.id,
      exam_structure: structure,
    });
  }

  async updatePaper(id: string, dto: UpdatePaperDto): Promise<PaperRow> {
    await this.getPaper(id);

    // Resolve program_code -> program_id if the caller is moving the paper.
    let program_id: string | undefined;
    if (dto.program_code !== undefined) {
      const program = await this.programs.findByCode(dto.program_code);
      if (!program)
        throw new BadRequestException(
          `unknown program code "${dto.program_code}"`
        );
      program_id = program.id;
    }

    // Validate a replacement structure if one was sent.
    let exam_structure: ExamStructure | undefined;
    if (dto.exam_structure !== undefined) {
      try {
        exam_structure = validateExamStructure(dto.exam_structure);
      } catch (e) {
        throw new BadRequestException(
          e instanceof Error ? e.message : "invalid exam_structure"
        );
      }
    }

    const updated = await this.papers.update(id, {
      code: dto.code,
      name_en: dto.name_en,
      name_ru: dto.name_ru,
      free_accessible: dto.free_accessible,
      program_id,
      exam_structure,
    });
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
    // paper. Skip rows where lo_id is null - those represent papers with no
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
    const payload = this.normalizePayload(dto.type, dto.payload ?? null);
    // Validates the per-type shape AND returns the canonical correct_answer_en
    // to store (option key for mcq; sorted keys for mcq_multi; numeric string
    // for number_entry; derived from payload for true_false / matching).
    const canonicalCorrect = this.validateAndCanonicalize(
      dto.type,
      opts,
      payload,
      dto.correct_answer_en
    );

    const isMcqLike = dto.type === "mcq" || dto.type === "mcq_multi";
    const hasPayload = dto.type === "true_false" || dto.type === "matching";

    // Canonicalize: correct option(s) must have why_wrong = null in storage so
    // the frontend can rely on "why_wrong present ⇒ this option was wrong".
    const storedOptions = isMcqLike
      ? this.scrubCorrectOptionWhyWrong(opts, dto.type, canonicalCorrect)
      : null;

    return this.questions.create({
      lo_id,
      type: dto.type,
      difficulty: dto.difficulty,
      prompt_en: dto.prompt_en,
      prompt_ru: dto.prompt_ru ?? null,
      options: storedOptions,
      payload: hasPayload ? payload : null,
      correct_answer_en: canonicalCorrect,
      // All five live types have a language-neutral canonical answer (an option
      // key / sorted keys, a numeric value, or an EN-canonical serialization of
      // the payload), so correct_answer_ru is always null. (short_answer, the
      // only type that used _ru, is retired.)
      correct_answer_ru: null,
      explanation_en: dto.explanation_en,
      explanation_ru: dto.explanation_ru ?? null,
      concept_bite_en: dto.concept_bite_en ?? null,
      concept_bite_ru: dto.concept_bite_ru ?? null,
      exhibit_en: dto.exhibit_en ?? null,
      exhibit_ru: dto.exhibit_ru ?? null,
      acceptable_tolerance:
        dto.type === "number_entry" ? dto.acceptable_tolerance ?? null : null,
      external_ref: null, // admin-created; the bank importer sets its own refs
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
    // payload not resent => keep current (already domain-shaped from the DB).
    const nextPayload =
      dto.payload !== undefined
        ? this.normalizePayload(nextType, dto.payload)
        : current.payload;

    const canonicalCorrect = this.validateAndCanonicalize(
      nextType,
      nextOptions,
      nextPayload,
      dto.correct_answer_en ?? current.correct_answer_en
    );

    const isMcqLike = nextType === "mcq" || nextType === "mcq_multi";
    const hasPayload = nextType === "true_false" || nextType === "matching";

    // Canonicalize: correct option(s)' why_wrong = null in storage.
    const storedOptions = isMcqLike
      ? this.scrubCorrectOptionWhyWrong(nextOptions, nextType, canonicalCorrect)
      : null;

    // options / payload / tolerance are always set to the value implied by
    // nextType, so a type change clears the fields that no longer apply and the
    // chk_question_type_shape invariant always holds.
    const patch: Parameters<QuestionsRepository["update"]>[1] = {
      type: dto.type,
      difficulty: dto.difficulty,
      prompt_en: dto.prompt_en,
      prompt_ru: dto.prompt_ru,
      options: storedOptions,
      payload: hasPayload ? nextPayload : null,
      correct_answer_en: canonicalCorrect,
      // Language-neutral canonical answer for every live type (see createQuestion).
      correct_answer_ru: null,
      explanation_en: dto.explanation_en,
      explanation_ru: dto.explanation_ru,
      concept_bite_en: dto.concept_bite_en,
      concept_bite_ru: dto.concept_bite_ru,
      exhibit_en: dto.exhibit_en,
      exhibit_ru: dto.exhibit_ru,
      acceptable_tolerance: dto.acceptable_tolerance,
      is_active: dto.is_active,
    };
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
      // attempts.question_id is ON DELETE RESTRICT - if attempts exist, PG throws 23503.
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

  // Storage invariant: the correct option(s) must have why_wrong_{en,ru} = null.
  // We don't fail validation if the admin/LLM left text there - we just scrub
  // it on the way to the DB. This keeps the frontend rule "why_wrong present ⇒
  // wrong option" reliable regardless of input quality. Applies to mcq and
  // mcq_multi (which can have several correct options).
  private scrubCorrectOptionWhyWrong(
    opts: McqOption[] | null,
    type: QuestionType,
    canonicalCorrect: string
  ): McqOption[] | null {
    if ((type !== "mcq" && type !== "mcq_multi") || opts === null) return opts;
    // canonicalCorrect is the option key (mcq) or the sorted keys "B,C"
    // (mcq_multi). Scrub why_wrong on every correct option.
    const correctKeys = new Set(
      canonicalCorrect.split(",").map((k) => k.trim().toUpperCase())
    );
    return opts.map((o) =>
      correctKeys.has(o.key.trim().toUpperCase())
        ? { ...o, why_wrong_en: null, why_wrong_ru: null }
        : o
    );
  }

  // Validates the per-type shape AND returns the canonical correct_answer_en to
  // store. Throws BadRequestException with a clear message on any violation.
  //   mcq          -> the option key (must match one option)
  //   mcq_multi    -> sorted unique correct keys, e.g. "B,C" (each must match)
  //   number_entry -> the numeric string (must parse as a finite number)
  //   true_false   -> derived from payload: statement answers joined by ","
  //   matching     -> derived from payload: "label=value" rows joined by " | "
  private validateAndCanonicalize(
    type: QuestionType,
    options: McqOption[] | null,
    payload: QuestionPayload | null,
    correct_answer_en?: string
  ): string {
    if (type === "mcq" || type === "mcq_multi") {
      if (payload !== null) {
        throw new BadRequestException(
          `${type} questions must not have a payload`
        );
      }
      if (!options || options.length < 2) {
        throw new BadRequestException(
          `${type} questions require at least 2 options`
        );
      }
      const keys = new Set<string>();
      for (const opt of options) {
        const k = opt.key.trim().toUpperCase();
        if (keys.has(k)) {
          throw new BadRequestException(`duplicate option key "${opt.key}"`);
        }
        keys.add(k);
      }
      if (correct_answer_en === undefined || !correct_answer_en.trim()) {
        throw new BadRequestException(`${type} requires correct_answer_en`);
      }
      if (type === "mcq") {
        const c = correct_answer_en.trim().toUpperCase();
        if (!keys.has(c)) {
          throw new BadRequestException(
            `correct_answer "${correct_answer_en}" must match one of the option keys`
          );
        }
        return correct_answer_en.trim(); // preserve the admin's key text
      }
      // mcq_multi: parse the comma-separated correct keys.
      const raw = correct_answer_en
        .split(",")
        .map((k) => k.trim())
        .filter((k) => k !== "");
      if (raw.length === 0) {
        throw new BadRequestException(
          "mcq_multi requires at least one correct option key in correct_answer_en"
        );
      }
      const canonical = new Set<string>();
      for (const k of raw) {
        const up = k.toUpperCase();
        if (!keys.has(up)) {
          throw new BadRequestException(
            `mcq_multi correct key "${k}" must match one of the option keys`
          );
        }
        canonical.add(up);
      }
      return [...canonical].sort().join(","); // "B,C"
    }

    if (type === "number_entry") {
      if (options && options.length > 0) {
        throw new BadRequestException(
          "number_entry questions must not have options"
        );
      }
      if (payload !== null) {
        throw new BadRequestException(
          "number_entry questions must not have a payload"
        );
      }
      if (correct_answer_en === undefined || !correct_answer_en.trim()) {
        throw new BadRequestException(
          "number_entry requires a non-empty correct_answer_en"
        );
      }
      // Lightweight finite-number check. The grader's parser is more forgiving
      // on purpose; this just rejects clearly non-numeric canonical answers.
      const n = parseFloat(correct_answer_en.replace(/,/g, ""));
      if (!Number.isFinite(n)) {
        throw new BadRequestException(
          `number_entry correct_answer_en "${correct_answer_en}" must be a valid number`
        );
      }
      return correct_answer_en.trim();
    }

    // true_false / matching: shape already guaranteed by normalizePayload;
    // options must be absent. The canonical answer is DERIVED from the payload.
    if (options && options.length > 0) {
      throw new BadRequestException(`${type} questions must not have options`);
    }
    if (type === "true_false") {
      const p = payload as TrueFalsePayload | null;
      if (p === null) {
        throw new BadRequestException("true_false requires a payload");
      }
      return p.statements.map((s) => s.answer).join(",");
    }
    // matching
    const p = payload as MatchingPayload | null;
    if (p === null) {
      throw new BadRequestException("matching requires a payload");
    }
    return p.rows.map((r) => `${r.label_en}=${r.correct_value_en}`).join(" | ");
  }

  // Validate + normalize a raw DTO payload into the strict storage shape for
  // true_false / matching. Returns null for types that don't use a payload (and
  // throws if one was supplied for such a type). Throws BadRequestException with
  // a clear, path-qualified message on any shape violation.
  private normalizePayload(
    type: QuestionType,
    raw: Record<string, unknown> | null
  ): QuestionPayload | null {
    if (type !== "true_false" && type !== "matching") {
      if (raw !== null && raw !== undefined) {
        throw new BadRequestException(
          `payload is not allowed for type "${type}"`
        );
      }
      return null;
    }
    if (raw === null || raw === undefined) {
      throw new BadRequestException(`${type} requires a payload`);
    }
    return type === "true_false"
      ? this.normalizeTrueFalsePayload(raw)
      : this.normalizeMatchingPayload(raw);
  }

  private normalizeTrueFalsePayload(
    raw: Record<string, unknown>
  ): TrueFalsePayload {
    const labels = this.asStringArray(raw.labels, "payload.labels");
    if (labels.length < 2 || labels.length > 4) {
      throw new BadRequestException(
        "true_false payload.labels must have 2-4 labels"
      );
    }
    let labels_ru: string[] | null = null;
    if (raw.labels_ru !== undefined && raw.labels_ru !== null) {
      labels_ru = this.asStringArray(raw.labels_ru, "payload.labels_ru");
      if (labels_ru.length !== labels.length) {
        throw new BadRequestException(
          "true_false payload.labels_ru must align 1:1 with labels"
        );
      }
    }
    const rawStatements = raw.statements;
    if (!Array.isArray(rawStatements) || rawStatements.length === 0) {
      throw new BadRequestException(
        "true_false payload.statements must be a non-empty array"
      );
    }
    const labelSet = new Set(labels.map((l) => l.trim().toLowerCase()));
    const statements = rawStatements.map((s, i) => {
      if (typeof s !== "object" || s === null) {
        throw new BadRequestException(`true_false statement ${i} must be an object`);
      }
      const obj = s as Record<string, unknown>;
      const text_en = this.asNonEmptyString(obj.text_en, `statement ${i} text_en`);
      const text_ru = this.asNullableString(obj.text_ru, `statement ${i} text_ru`);
      const answer = this.asNonEmptyString(obj.answer, `statement ${i} answer`);
      if (!labelSet.has(answer.trim().toLowerCase())) {
        throw new BadRequestException(
          `true_false statement ${i} answer "${answer}" must be one of the labels`
        );
      }
      return { text_en, text_ru, answer };
    });
    return { labels, labels_ru, statements };
  }

  private normalizeMatchingPayload(
    raw: Record<string, unknown>
  ): MatchingPayload {
    const rawOptions = raw.options;
    if (!Array.isArray(rawOptions) || rawOptions.length < 2) {
      throw new BadRequestException(
        "matching payload.options must have at least 2 values"
      );
    }
    const options = rawOptions.map((o, i) => {
      if (typeof o !== "object" || o === null) {
        throw new BadRequestException(`matching option ${i} must be an object`);
      }
      const obj = o as Record<string, unknown>;
      const value_en = this.asNonEmptyString(obj.value_en, `option ${i} value_en`);
      const value_ru = this.asNullableString(obj.value_ru, `option ${i} value_ru`);
      return { value_en, value_ru };
    });
    const valueSet = new Set<string>();
    for (const o of options) {
      const v = o.value_en.trim().toLowerCase();
      if (valueSet.has(v)) {
        throw new BadRequestException(
          `duplicate matching option value "${o.value_en}"`
        );
      }
      valueSet.add(v);
    }
    const rawRows = raw.rows;
    if (!Array.isArray(rawRows) || rawRows.length === 0) {
      throw new BadRequestException(
        "matching payload.rows must be a non-empty array"
      );
    }
    const rows = rawRows.map((r, i) => {
      if (typeof r !== "object" || r === null) {
        throw new BadRequestException(`matching row ${i} must be an object`);
      }
      const obj = r as Record<string, unknown>;
      const label_en = this.asNonEmptyString(obj.label_en, `row ${i} label_en`);
      const label_ru = this.asNullableString(obj.label_ru, `row ${i} label_ru`);
      const correct_value_en = this.asNonEmptyString(
        obj.correct_value_en,
        `row ${i} correct_value_en`
      );
      if (!valueSet.has(correct_value_en.trim().toLowerCase())) {
        throw new BadRequestException(
          `matching row ${i} correct_value_en "${correct_value_en}" must be one of the option values`
        );
      }
      return { label_en, label_ru, correct_value_en };
    });
    return { rows, options };
  }

  // ---- small validation primitives (payload parsing) ----
  private asStringArray(v: unknown, field: string): string[] {
    if (!Array.isArray(v) || !v.every((x) => typeof x === "string")) {
      throw new BadRequestException(`${field} must be an array of strings`);
    }
    const arr = (v as string[]).map((x) => x.trim());
    if (arr.some((x) => x === "")) {
      throw new BadRequestException(`${field} must not contain empty strings`);
    }
    return arr;
  }
  private asNonEmptyString(v: unknown, field: string): string {
    if (typeof v !== "string" || v.trim() === "") {
      throw new BadRequestException(`${field} must be a non-empty string`);
    }
    return v;
  }
  private asNullableString(v: unknown, field: string): string | null {
    if (v === undefined || v === null) return null;
    if (typeof v !== "string") {
      throw new BadRequestException(`${field} must be a string or null`);
    }
    return v.trim() === "" ? null : v;
  }
}
