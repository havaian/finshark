import { Inject, Injectable } from "@nestjs/common";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";
import type { ProgramRow } from "./content.types";

// Programs are a tiny, slow-changing catalog (acca, cfa, ...). This repository
// is read-mostly: list them, resolve a code to an id (used when creating a
// paper), fetch one by id/code. There's no admin "create program" UI yet -
// new programs are added by seed/migration - so there's deliberately no
// create/update/delete here. Add them when a program-management screen exists.
const COLS = `id, code, name_en, name_ru, name_uz, unit_noun, sort_order, created_at, updated_at`;

@Injectable()
export class ProgramsRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  async findAll(): Promise<ProgramRow[]> {
    return this.sql<ProgramRow[]>`
      SELECT ${this.sql.unsafe(COLS)} FROM programs
      ORDER BY sort_order ASC, code ASC
    `;
  }

  async findById(id: string): Promise<ProgramRow | null> {
    const rows = await this.sql<ProgramRow[]>`
      SELECT ${this.sql.unsafe(COLS)} FROM programs WHERE id = ${id} LIMIT 1
    `;
    return rows[0] ?? null;
  }

  async findByCode(code: string): Promise<ProgramRow | null> {
    const rows = await this.sql<ProgramRow[]>`
      SELECT ${this.sql.unsafe(COLS)} FROM programs WHERE code = ${code} LIMIT 1
    `;
    return rows[0] ?? null;
  }
}
