import { Inject, Injectable } from '@nestjs/common';
import type { Sql } from 'postgres';
import { PG } from '../db/db.module';
import type { PaperRow } from './content.types';

const COLS = `id, code, name, created_at, updated_at`;

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

  async create(input: { code: string; name: string }): Promise<PaperRow> {
    const rows = await this.sql<PaperRow[]>`
      INSERT INTO papers (code, name)
      VALUES (${input.code}, ${input.name})
      RETURNING ${this.sql.unsafe(COLS)}
    `;
    return rows[0];
  }

  async update(id: string, input: { code?: string; name?: string }): Promise<PaperRow | null> {
    // Build a partial UPDATE without an ORM. Empty patch → just return current row.
    const sets: Record<string, string> = {};
    if (input.code !== undefined) sets.code = input.code;
    if (input.name !== undefined) sets.name = input.name;

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
