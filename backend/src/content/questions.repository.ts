import { Inject, Injectable } from "@nestjs/common";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";
import type {
  McqOption,
  QuestionDifficulty,
  QuestionRow,
  QuestionType,
} from "./content.types";

const COLS = `
  id, lo_id, type, difficulty,
  prompt_en, prompt_ru,
  options,
  correct_answer_en, correct_answer_ru,
  explanation_en, explanation_ru,
  concept_bite_en, concept_bite_ru,
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
    correct_answer_en: string;
    correct_answer_ru: string | null;
    explanation_en: string;
    explanation_ru: string | null;
    concept_bite_en: string | null;
    concept_bite_ru: string | null;
    is_active?: boolean;       // default true — new in question-generator
  }): Promise<QuestionRow> {
    // postgres.js: passing a JS array as a JSONB param via sql.json.
    // The `as any` is postgres.js's overly strict JSONValue type rejecting typed
    // object arrays; runtime is fine with anything JSON-serializable.
    const optionsParam =
      input.options === null ? null : this.sql.json(input.options as any);
    // is_active default mirrors the schema default of TRUE. The generator uses
    // FALSE so admin-generated drafts don't appear in lessons until reviewed.
    const isActive = input.is_active ?? true;

    const rows = await this.sql<QuestionRow[]>`
      INSERT INTO questions (
        lo_id, type, difficulty,
        prompt_en, prompt_ru,
        options,
        correct_answer_en, correct_answer_ru,
        explanation_en, explanation_ru,
        concept_bite_en, concept_bite_ru,
        is_active
      )
      VALUES (
        ${input.lo_id},
        ${input.type},
        ${input.difficulty},
        ${input.prompt_en},
        ${input.prompt_ru},
        ${optionsParam},
        ${input.correct_answer_en},
        ${input.correct_answer_ru},
        ${input.explanation_en},
        ${input.explanation_ru},
        ${input.concept_bite_en},
        ${input.concept_bite_ru},
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
      correct_answer_en?: string;
      correct_answer_ru?: string | null;
      explanation_en?: string;
      explanation_ru?: string | null;
      concept_bite_en?: string | null;
      concept_bite_ru?: string | null;
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
    if (input.correct_answer_en !== undefined)
      sets.correct_answer_en = input.correct_answer_en;
    if (input.correct_answer_ru !== undefined)
      sets.correct_answer_ru = input.correct_answer_ru;
    if (input.explanation_en !== undefined) sets.explanation_en = input.explanation_en;
    if (input.explanation_ru !== undefined) sets.explanation_ru = input.explanation_ru;
    if (input.concept_bite_en !== undefined)
      sets.concept_bite_en = input.concept_bite_en;
    if (input.concept_bite_ru !== undefined)
      sets.concept_bite_ru = input.concept_bite_ru;
    if (input.is_active !== undefined) sets.is_active = input.is_active;

    if (Object.keys(sets).length === 0) return this.findById(id);

    const rows = await this.sql<QuestionRow[]>`
      UPDATE questions SET ${this.sql(sets)}
      WHERE id = ${id}
      RETURNING ${this.sql.unsafe(COLS)}
    `;
    return rows[0] ?? null;
  }

  // Hard delete — only safe if no attempts reference it.
  // attempts.question_id has ON DELETE RESTRICT, so this throws if attempts exist.
  // Admin UI should prefer setting is_active=false to retire instead.
  async delete(id: string): Promise<boolean> {
    const rows = await this
      .sql`DELETE FROM questions WHERE id = ${id} RETURNING id`;
    return rows.length > 0;
  }
}
