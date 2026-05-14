import { Inject, Injectable } from '@nestjs/common';
import type { Sql } from 'postgres';
import { PG } from '../db/db.module';
import type { PaperRow } from './content.types';

const COLS = `id, code, name_en, name_ru, created_at, updated_at`;

@Injectable()
export class PapersRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  async findAll(): Promise<PaperRow[]> {
    return this.sql<PaperRow[]>`
      SELECT ${this.sql.unsafe(COLS)} FROM papers ORDER BY code ASC
    `;
  }

  async findById(id: string): Promise<PaperRow | null> {
    const rows = await this.sql<PaperRow[]>`
      SELECT ${this.sql.unsafe(COLS)} FROM papers WHERE id = ${id} LIMIT 1
    `;
    return rows[0] ?? null;
  }

  async findByCode(code: string): Promise<PaperRow | null> {
    const rows = await this.sql<PaperRow[]>`
      SELECT ${this.sql.unsafe(COLS)} FROM papers WHERE code = ${code} LIMIT 1
    `;
    return rows[0] ?? null;
  }

  async create(input: {
    code: string;
    name_en: string;
    name_ru: string | null;
  }): Promise<PaperRow> {
    const rows = await this.sql<PaperRow[]>`
      INSERT INTO papers (code, name_en, name_ru)
      VALUES (${input.code}, ${input.name_en}, ${input.name_ru})
      RETURNING ${this.sql.unsafe(COLS)}
    `;
    return rows[0];
  }

  // Partial update. Pass `null` to explicitly clear name_ru; omit (undefined) to leave it.
  async update(
    id: string,
    input: {
      code?: string;
      name_en?: string;
      name_ru?: string | null;
    },
  ): Promise<PaperRow | null> {
    // Build a partial UPDATE without an ORM. Empty patch → just return current row.
    // Note: postgres.js sql(record) treats null as NULL, undefined keys are skipped
    // by us here explicitly so the helper sees only the columns we want to set.
    const sets: Record<string, string | null> = {};
    if (input.code !== undefined) sets.code = input.code;
    if (input.name_en !== undefined) sets.name_en = input.name_en;
    if (input.name_ru !== undefined) sets.name_ru = input.name_ru;

    if (Object.keys(sets).length === 0) return this.findById(id);

    const rows = await this.sql<PaperRow[]>`
      UPDATE papers SET ${this.sql(sets)}
      WHERE id = ${id}
      RETURNING ${this.sql.unsafe(COLS)}
    `;
    return rows[0] ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const rows = await this.sql`DELETE FROM papers WHERE id = ${id} RETURNING id`;
    return rows.length > 0;
  }
}
