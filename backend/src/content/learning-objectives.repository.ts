import { Inject, Injectable } from "@nestjs/common";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";
import type { LearningObjectiveRow } from "./content.types";

const COLS = `
  id, paper_id, code,
  title_en, title_ru, description_en, description_ru,
  theory_en, theory_ru,
  sort_order, created_at, updated_at
`;

@Injectable()
export class LearningObjectivesRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  async findByPaper(paper_id: string): Promise<LearningObjectiveRow[]> {
    return this.sql<LearningObjectiveRow[]>`
      SELECT ${this.sql.unsafe(COLS)}
      FROM learning_objectives
      WHERE paper_id = ${paper_id}
      ORDER BY sort_order ASC, code ASC
    `;
  }

  async findById(id: string): Promise<LearningObjectiveRow | null> {
    const rows = await this.sql<LearningObjectiveRow[]>`
      SELECT ${this.sql.unsafe(
        COLS
      )} FROM learning_objectives WHERE id = ${id} LIMIT 1
    `;
    return rows[0] ?? null;
  }

  // Batch fetch by id, used by the lesson service to assemble per-LO theory
  // bites for a queue without N+1 single-row reads. Order of returned rows
  // is NOT guaranteed to match the input — caller must re-index by id.
  async findManyByIds(ids: string[]): Promise<LearningObjectiveRow[]> {
    if (ids.length === 0) return [];
    return this.sql<LearningObjectiveRow[]>`
      SELECT ${this.sql.unsafe(COLS)}
      FROM learning_objectives
      WHERE id IN ${this.sql(ids)}
    `;
  }

  async create(input: {
    paper_id: string;
    code: string;
    title_en: string;
    title_ru: string | null;
    description_en: string | null;
    description_ru: string | null;
    theory_en?: string | null;
    theory_ru?: string | null;
    sort_order: number;
  }): Promise<LearningObjectiveRow> {
    const rows = await this.sql<LearningObjectiveRow[]>`
      INSERT INTO learning_objectives (
        paper_id, code,
        title_en, title_ru, description_en, description_ru,
        theory_en, theory_ru,
        sort_order
      )
      VALUES (
        ${input.paper_id},
        ${input.code},
        ${input.title_en},
        ${input.title_ru},
        ${input.description_en},
        ${input.description_ru},
        ${input.theory_en ?? null},
        ${input.theory_ru ?? null},
        ${input.sort_order}
      )
      RETURNING ${this.sql.unsafe(COLS)}
    `;
    return rows[0];
  }

  async update(
    id: string,
    input: {
      code?: string;
      title_en?: string;
      title_ru?: string | null;
      description_en?: string | null;
      description_ru?: string | null;
      theory_en?: string | null;
      theory_ru?: string | null;
      sort_order?: number;
    }
  ): Promise<LearningObjectiveRow | null> {
    const sets: Record<string, string | number | null> = {};
    if (input.code !== undefined) sets.code = input.code;
    if (input.title_en !== undefined) sets.title_en = input.title_en;
    if (input.title_ru !== undefined) sets.title_ru = input.title_ru;
    if (input.description_en !== undefined)
      sets.description_en = input.description_en;
    if (input.description_ru !== undefined)
      sets.description_ru = input.description_ru;
    if (input.theory_en !== undefined) sets.theory_en = input.theory_en;
    if (input.theory_ru !== undefined) sets.theory_ru = input.theory_ru;
    if (input.sort_order !== undefined) sets.sort_order = input.sort_order;

    if (Object.keys(sets).length === 0) return this.findById(id);

    const rows = await this.sql<LearningObjectiveRow[]>`
      UPDATE learning_objectives SET ${this.sql(sets)}
      WHERE id = ${id}
      RETURNING ${this.sql.unsafe(COLS)}
    `;
    return rows[0] ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const rows = await this
      .sql`DELETE FROM learning_objectives WHERE id = ${id} RETURNING id`;
    return rows.length > 0;
  }
}
