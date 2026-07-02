import { Inject, Injectable } from "@nestjs/common";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";
import type {
  McqOption,
  QuestionDifficulty,
  QuestionPayload,
  QuestionRow,
  QuestionType,
} from "./content.types";

const COLS = `
  id, lo_id, type, difficulty,
  prompt_en, prompt_ru,
  options, payload,
  correct_answer_en, correct_answer_ru,
  explanation_en, explanation_ru,
  concept_bite_en, concept_bite_ru,
  exhibit_en, exhibit_ru,
  acceptable_tolerance,
  external_ref,
  is_active,
  created_at, updated_at
`;

@Injectable()
export class QuestionsRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  async findByLo(
    lo_id: string,
    opts?: { activeOnly?: boolean }
  ): Promise<QuestionRow[]> {
    const activeOnly = opts?.activeOnly ?? false;
    return this.sql<QuestionRow[]>`
      SELECT ${this.sql.unsafe(COLS)}
      FROM questions
      WHERE lo_id = ${lo_id}
        ${activeOnly ? this.sql`AND is_active = TRUE` : this.sql``}
      ORDER BY id ASC
    `;
  }

  async findById(id: string): Promise<QuestionRow | null> {
    const rows = await this.sql<QuestionRow[]>`
      SELECT ${this.sql.unsafe(COLS)} FROM questions WHERE id = ${id} LIMIT 1
    `;
    return rows[0] ?? null;
  }

  async create(input: {
    lo_id: string;
    type: QuestionType;
    difficulty: QuestionDifficulty;
    prompt_en: string;
    prompt_ru: string | null;
    options: McqOption[] | null;
    payload?: QuestionPayload | null; // true_false / matching only
    correct_answer_en: string;
    correct_answer_ru: string | null;
    explanation_en: string;
    explanation_ru: string | null;
    concept_bite_en: string | null;
    concept_bite_ru: string | null;
    exhibit_en?: string | null;
    exhibit_ru?: string | null;
    acceptable_tolerance?: number | null; // number_entry only
    external_ref?: string | null; // set by the bank importer
    is_active?: boolean; // default true - new in question-generator
  }): Promise<QuestionRow> {
    // postgres.js: passing a JS array/object as a JSONB param via sql.json.
    // The `as any` is postgres.js's overly strict JSONValue type rejecting typed
    // objects; runtime is fine with anything JSON-serializable.
    const optionsParam =
      input.options === null || input.options === undefined
        ? null
        : this.sql.json(input.options as any);
    const payloadParam =
      input.payload === null || input.payload === undefined
        ? null
        : this.sql.json(input.payload as any);
    // is_active default mirrors the schema default of TRUE. The generator uses
    // FALSE so admin-generated drafts don't appear in lessons until reviewed.
    const isActive = input.is_active ?? true;
    const tolerance = input.acceptable_tolerance ?? null;

    const rows = await this.sql<QuestionRow[]>`
      INSERT INTO questions (
        lo_id, type, difficulty,
        prompt_en, prompt_ru,
        options, payload,
        correct_answer_en, correct_answer_ru,
        explanation_en, explanation_ru,
        concept_bite_en, concept_bite_ru,
        exhibit_en, exhibit_ru,
        acceptable_tolerance,
        external_ref,
        is_active
      )
      VALUES (
        ${input.lo_id},
        ${input.type},
        ${input.difficulty},
        ${input.prompt_en},
        ${input.prompt_ru},
        ${optionsParam},
        ${payloadParam},
        ${input.correct_answer_en},
        ${input.correct_answer_ru},
        ${input.explanation_en},
        ${input.explanation_ru},
        ${input.concept_bite_en},
        ${input.concept_bite_ru},
        ${input.exhibit_en ?? null},
        ${input.exhibit_ru ?? null},
        ${tolerance},
        ${input.external_ref ?? null},
        ${isActive}
      )
      RETURNING ${this.sql.unsafe(COLS)}
    `;
    return rows[0];
  }

  async update(
    id: string,
    input: {
      type?: QuestionType;
      difficulty?: QuestionDifficulty;
      prompt_en?: string;
      prompt_ru?: string | null;
      options?: McqOption[] | null;
      payload?: QuestionPayload | null;
      correct_answer_en?: string;
      correct_answer_ru?: string | null;
      explanation_en?: string;
      explanation_ru?: string | null;
      concept_bite_en?: string | null;
      concept_bite_ru?: string | null;
      exhibit_en?: string | null;
      exhibit_ru?: string | null;
      acceptable_tolerance?: number | null;
      external_ref?: string | null;
      is_active?: boolean;
    }
  ): Promise<QuestionRow | null> {
    const sets: Record<string, unknown> = {};
    if (input.type !== undefined) sets.type = input.type;
    if (input.difficulty !== undefined) sets.difficulty = input.difficulty;
    if (input.prompt_en !== undefined) sets.prompt_en = input.prompt_en;
    if (input.prompt_ru !== undefined) sets.prompt_ru = input.prompt_ru;
    if (input.options !== undefined) {
      sets.options =
        input.options === null ? null : this.sql.json(input.options as any);
    }
    if (input.payload !== undefined) {
      sets.payload =
        input.payload === null ? null : this.sql.json(input.payload as any);
    }
    if (input.correct_answer_en !== undefined)
      sets.correct_answer_en = input.correct_answer_en;
    if (input.correct_answer_ru !== undefined)
      sets.correct_answer_ru = input.correct_answer_ru;
    if (input.explanation_en !== undefined)
      sets.explanation_en = input.explanation_en;
    if (input.explanation_ru !== undefined)
      sets.explanation_ru = input.explanation_ru;
    if (input.concept_bite_en !== undefined)
      sets.concept_bite_en = input.concept_bite_en;
    if (input.concept_bite_ru !== undefined)
      sets.concept_bite_ru = input.concept_bite_ru;
    if (input.exhibit_en !== undefined) sets.exhibit_en = input.exhibit_en;
    if (input.exhibit_ru !== undefined) sets.exhibit_ru = input.exhibit_ru;
    if (input.acceptable_tolerance !== undefined)
      sets.acceptable_tolerance = input.acceptable_tolerance;
    if (input.external_ref !== undefined) sets.external_ref = input.external_ref;
    if (input.is_active !== undefined) sets.is_active = input.is_active;

    if (Object.keys(sets).length === 0) return this.findById(id);

    const rows = await this.sql<QuestionRow[]>`
      UPDATE questions SET ${this.sql(sets)}
      WHERE id = ${id}
      RETURNING ${this.sql.unsafe(COLS)}
    `;
    return rows[0] ?? null;
  }

  // Hard delete - only safe if no attempts reference it.
  // attempts.question_id has ON DELETE RESTRICT, so this throws if attempts exist.
  // Admin UI should prefer setting is_active=false to retire instead.
  async delete(id: string): Promise<boolean> {
    const rows = await this
      .sql`DELETE FROM questions WHERE id = ${id} RETURNING id`;
    return rows.length > 0;
  }

  // Batch set is_active for a set of question IDs. Returns the updated rows.
  // No transaction needed - single UPDATE is atomic in Postgres.
  // Empty input → returns []. No error on missing IDs (just returns the ones
  // that existed and matched).
  async setActiveMany(
    ids: string[],
    is_active: boolean
  ): Promise<QuestionRow[]> {
    if (ids.length === 0) return [];
    return this.sql<QuestionRow[]>`
      UPDATE questions
      SET is_active = ${is_active}
      WHERE id IN ${this.sql(ids)}
      RETURNING ${this.sql.unsafe(COLS)}
    `;
  }

  // Batch hard delete. Wrapped in a transaction so if ANY id has dependent
  // attempts (RESTRICT FK), the whole batch rolls back - leaving the admin
  // with a clean error rather than a partial delete. Returns the count of
  // rows that actually deleted. The caller is responsible for handling the
  // RESTRICT error (Postgres code 23503) and mapping it to a useful message.
  async deleteMany(ids: string[]): Promise<number> {
    if (ids.length === 0) return 0;
    const rows = await this.sql<Array<{ id: string }>>`
      DELETE FROM questions
      WHERE id IN ${this.sql(ids)}
      RETURNING id
    `;
    return rows.length;
  }

  // Mock question sampler. Returns N active questions from the given paper,
  // distributed across LOs as evenly as possible.
  //
  // Strategy: window-rank by random per LO so each LO contributes proportionally,
  // then take the top N globally. Postgres `random()` is fine for this scale -
  // ~hundreds of questions per paper, not millions. Repeated calls return
  // different selections.
  //
  // If the paper has fewer than N active questions, returns whatever exists.
  async findRandomForMock(
    paper_id: string,
    count: number
  ): Promise<QuestionRow[]> {
    const safeCount = Math.max(1, Math.min(200, count));
    // We embed ${this.sql.unsafe(COLS)} inside the SELECT after q.* expansion
    // would be ambiguous. Instead we use a two-step SELECT: outer pulls fully-
    // qualified column list from the CTE.
    return this.sql<QuestionRow[]>`
      WITH ranked AS (
        SELECT
          q.id, q.lo_id, q.type, q.difficulty,
          q.prompt_en, q.prompt_ru,
          q.options, q.payload,
          q.correct_answer_en, q.correct_answer_ru,
          q.explanation_en, q.explanation_ru,
          q.concept_bite_en, q.concept_bite_ru,
          q.exhibit_en, q.exhibit_ru,
          q.acceptable_tolerance, q.external_ref,
          q.is_active,
          q.created_at, q.updated_at,
          ROW_NUMBER() OVER (PARTITION BY q.lo_id ORDER BY random()) AS lo_rank,
          random() AS rnd
        FROM questions q
        JOIN learning_objectives lo ON lo.id = q.lo_id
        WHERE lo.paper_id = ${paper_id}
          AND q.is_active = TRUE
      )
      SELECT ${this.sql.unsafe(COLS)}
      FROM ranked
      ORDER BY lo_rank ASC, rnd ASC
      LIMIT ${safeCount}
    `;
  }

  // Like findRandomForMock, but excludes a set of question ids already chosen
  // for earlier sections of the same mock, so a question never appears twice
  // in one exam. Used by the section-based mock builder: each section calls
  // this with the union of ids picked by prior sections. Empty exclude set
  // behaves exactly like findRandomForMock.
  async findRandomForMockExcluding(
    paper_id: string,
    count: number,
    exclude_ids: string[]
  ): Promise<QuestionRow[]> {
    const safeCount = Math.max(1, Math.min(200, count));
    if (exclude_ids.length === 0) {
      return this.findRandomForMock(paper_id, safeCount);
    }
    return this.sql<QuestionRow[]>`
      WITH ranked AS (
        SELECT
          q.id, q.lo_id, q.type, q.difficulty,
          q.prompt_en, q.prompt_ru,
          q.options, q.payload,
          q.correct_answer_en, q.correct_answer_ru,
          q.explanation_en, q.explanation_ru,
          q.concept_bite_en, q.concept_bite_ru,
          q.exhibit_en, q.exhibit_ru,
          q.acceptable_tolerance, q.external_ref,
          q.is_active,
          q.created_at, q.updated_at,
          ROW_NUMBER() OVER (PARTITION BY q.lo_id ORDER BY random()) AS lo_rank,
          random() AS rnd
        FROM questions q
        JOIN learning_objectives lo ON lo.id = q.lo_id
        WHERE lo.paper_id = ${paper_id}
          AND q.is_active = TRUE
          AND q.id NOT IN ${this.sql(exclude_ids)}
      )
      SELECT ${this.sql.unsafe(COLS)}
      FROM ranked
      ORDER BY lo_rank ASC, rnd ASC
      LIMIT ${safeCount}
    `;
  }

  // Fixed-mock playback: pick ONE active mock_exam for the paper at random and
  // return its questions in stored (position) order, each carrying its
  // section_code + marks from mock_exam_questions. Returns null when the paper
  // has no active mock (the caller then falls back to the dynamic sampler).
  //
  // Only ACTIVE questions are returned: an imported mock that still has
  // blank-answer rows (is_active=false, pending an answer) simply serves fewer
  // than its full membership until those rows are completed, rather than
  // serving an ungradeable question. COLS is unqualified but unambiguous here -
  // none of its column names exist on mock_exam_questions.
  async findRandomActiveMockWithQuestions(paper_id: string): Promise<{
    mock_id: string;
    code: string;
    duration_seconds: number;
    pass_mark_pct: number;
    questions: Array<QuestionRow & { section_code: string | null; marks: number }>;
  } | null> {
    const mocks = await this.sql<
      Array<{
        id: string;
        code: string;
        duration_seconds: number;
        pass_mark_pct: number;
      }>
    >`
      SELECT id::text, code, duration_seconds, pass_mark_pct
      FROM mock_exams
      WHERE paper_id = ${paper_id} AND is_active = TRUE
      ORDER BY random()
      LIMIT 1
    `;
    if (mocks.length === 0) return null;
    const mock = mocks[0];

    const questions = await this.sql<
      Array<QuestionRow & { section_code: string | null; marks: number }>
    >`
      SELECT ${this.sql.unsafe(COLS)},
             meq.section_code AS section_code,
             meq.marks::int   AS marks
      FROM mock_exam_questions meq
      JOIN questions q ON q.id = meq.question_id
      WHERE meq.mock_id = ${mock.id}
        AND q.is_active = TRUE
      ORDER BY meq.position ASC
    `;

    return {
      mock_id: mock.id,
      code: mock.code,
      duration_seconds: mock.duration_seconds,
      pass_mark_pct: mock.pass_mark_pct,
      questions,
    };
  }

  // Used by the post-mock review-session flow: fetch the full question rows
  // for the IDs the user got wrong. Filters to active only so we don't preload
  // a retired question into a review session. Empty input → empty output.
  async findManyByIds(
    ids: string[],
    opts?: { activeOnly?: boolean }
  ): Promise<QuestionRow[]> {
    if (ids.length === 0) return [];
    if (opts?.activeOnly) {
      return this.sql<QuestionRow[]>`
        SELECT ${this.sql.unsafe(COLS)}
        FROM questions
        WHERE id IN ${this.sql(ids)} AND is_active = TRUE
      `;
    }
    return this.sql<QuestionRow[]>`
      SELECT ${this.sql.unsafe(COLS)}
      FROM questions
      WHERE id IN ${this.sql(ids)}
    `;
  }
}
