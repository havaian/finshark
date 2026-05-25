import { Inject, Injectable } from "@nestjs/common";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";
import type { PaperRow } from "./content.types";

const COLS = `id, code, name_en, name_ru, free_accessible, created_at, updated_at`;

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
    // Default true (matches the DB default) so old admin UIs that don't send
    // this still produce a paper visible to free users.
    free_accessible?: boolean;
  }): Promise<PaperRow> {
    const free = input.free_accessible ?? true;
    const rows = await this.sql<PaperRow[]>`
      INSERT INTO papers (code, name_en, name_ru, free_accessible)
      VALUES (${input.code}, ${input.name_en}, ${input.name_ru}, ${free})
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
      free_accessible?: boolean;
    }
  ): Promise<PaperRow | null> {
    // Build a partial UPDATE without an ORM. Empty patch → just return current row.
    // Note: postgres.js sql(record) treats null as NULL, undefined keys are skipped
    // by us here explicitly so the helper sees only the columns we want to set.
    const sets: Record<string, string | null | boolean> = {};
    if (input.code !== undefined) sets.code = input.code;
    if (input.name_en !== undefined) sets.name_en = input.name_en;
    if (input.name_ru !== undefined) sets.name_ru = input.name_ru;
    if (input.free_accessible !== undefined)
      sets.free_accessible = input.free_accessible;

    if (Object.keys(sets).length === 0) return this.findById(id);

    const rows = await this.sql<PaperRow[]>`
      UPDATE papers SET ${this.sql(sets)}
      WHERE id = ${id}
      RETURNING ${this.sql.unsafe(COLS)}
    `;
    return rows[0] ?? null;
  }

  async delete(id: string): Promise<boolean> {
    const rows = await this
      .sql`DELETE FROM papers WHERE id = ${id} RETURNING id`;
    return rows.length > 0;
  }

  // Full admin content tree: papers → LOs → question counts (by status).
  // One query with two left joins so the sidebar has everything it needs to
  // render counts without N+1 follow-up requests. Returns flat rows; the
  // service layer assembles them into the nested shape.
  //
  // Counts use FILTER (WHERE …) on a single COUNT(*) per status; questions.id
  // can be NULL when the LO has no questions yet, so we wrap in COALESCE 0.
  async findContentTreeFlat(): Promise<
    Array<{
      paper_id: string;
      paper_code: string;
      paper_name_en: string;
      paper_name_ru: string | null;
      lo_id: string | null;
      lo_code: string | null;
      lo_title_en: string | null;
      lo_title_ru: string | null;
      lo_sort_order: number | null;
      // theory_en non-null = LO has a primer. We send only the flag, not the
      // full text, to keep this payload tiny.
      lo_has_theory: boolean;
      active_count: number;
      draft_count: number;
      // "Retired" = used to be active and then turned off. There's no formal
      // distinction between "draft" and "retired" at the schema level — both
      // are is_active=false. We currently group all is_active=false as drafts.
      // If we add a review_status column later this can split.
    }>
  > {
    return this.sql<
      Array<{
        paper_id: string;
        paper_code: string;
        paper_name_en: string;
        paper_name_ru: string | null;
        lo_id: string | null;
        lo_code: string | null;
        lo_title_en: string | null;
        lo_title_ru: string | null;
        lo_sort_order: number | null;
        lo_has_theory: boolean;
        active_count: number;
        draft_count: number;
      }>
    >`
      SELECT
        p.id::text                              AS paper_id,
        p.code                                  AS paper_code,
        p.name_en                               AS paper_name_en,
        p.name_ru                               AS paper_name_ru,
        lo.id::text                             AS lo_id,
        lo.code                                 AS lo_code,
        lo.title_en                             AS lo_title_en,
        lo.title_ru                             AS lo_title_ru,
        lo.sort_order                           AS lo_sort_order,
        (lo.theory_en IS NOT NULL)              AS lo_has_theory,
        COALESCE(SUM(CASE WHEN q.is_active = TRUE  THEN 1 ELSE 0 END), 0)::int AS active_count,
        COALESCE(SUM(CASE WHEN q.is_active = FALSE THEN 1 ELSE 0 END), 0)::int AS draft_count
      FROM papers p
      LEFT JOIN learning_objectives lo ON lo.paper_id = p.id
      LEFT JOIN questions q            ON q.lo_id = lo.id
      GROUP BY p.id, lo.id
      ORDER BY p.code ASC, lo.sort_order ASC NULLS LAST, lo.code ASC NULLS LAST
    `;
  }
}
