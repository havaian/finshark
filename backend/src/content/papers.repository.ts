import { Inject, Injectable } from "@nestjs/common";
import type { Sql, JSONValue as PgJson } from "postgres";
import { PG } from "../db/db.module";
import type { PaperRow, ExamStructure } from "./content.types";

const COLS = `id, code, name_en, name_ru, name_uz, free_accessible, program_id, exam_structure, created_at, updated_at`;

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
    name_uz: string | null;
    // Default true (matches the DB default) so old admin UIs that don't send
    // this still produce a paper visible to free users.
    free_accessible?: boolean;
    // NOT NULL in the DB. The service resolves a program_code (defaulting to
    // 'acca') to this id before calling create, so there's no default here -
    // the caller must supply it.
    program_id: string;
    // NOT NULL in the DB. The service supplies the ACCA Applied Knowledge
    // default when the caller omits a structure, so this is always set here.
    exam_structure: ExamStructure;
  }): Promise<PaperRow> {
    const free = input.free_accessible ?? true;
    const structureJson = this.sql.json(
      input.exam_structure as unknown as PgJson
    );
    const rows = await this.sql<PaperRow[]>`
      INSERT INTO papers (code, name_en, name_ru, name_uz, free_accessible, program_id, exam_structure)
      VALUES (${input.code}, ${input.name_en}, ${input.name_ru}, ${input.name_uz}, ${free}, ${input.program_id}, ${structureJson})
      RETURNING ${this.sql.unsafe(COLS)}
    `;
    return rows[0];
  }

  // Partial update. Pass `null` to explicitly clear name_ru / name_uz; omit
  // (undefined) to leave it.
  async update(
    id: string,
    input: {
      code?: string;
      name_en?: string;
      name_ru?: string | null;
      name_uz?: string | null;
      free_accessible?: boolean;
      // Resolved by the service from program_code. Omit to leave unchanged.
      program_id?: string;
      // Full replacement of the mock definition. Omit to leave unchanged.
      exam_structure?: ExamStructure;
    }
  ): Promise<PaperRow | null> {
    // Build a partial UPDATE without an ORM. Empty patch → just return current row.
    // Note: postgres.js sql(record) treats null as NULL, undefined keys are skipped
    // by us here explicitly so the helper sees only the columns we want to set.
    // The value type is intentionally wide: exam_structure is set via
    // this.sql.json(...) which returns postgres.js's Parameter wrapper (not a
    // plain JSONValue), so we accept ReturnType<Sql["json"]> alongside scalars.
    const sets: Record<
      string,
      string | null | boolean | ReturnType<Sql["json"]>
    > = {};
    if (input.code !== undefined) sets.code = input.code;
    if (input.name_en !== undefined) sets.name_en = input.name_en;
    if (input.name_ru !== undefined) sets.name_ru = input.name_ru;
    if (input.name_uz !== undefined) sets.name_uz = input.name_uz;
    if (input.free_accessible !== undefined)
      sets.free_accessible = input.free_accessible;
    if (input.program_id !== undefined) sets.program_id = input.program_id;
    if (input.exam_structure !== undefined)
      sets.exam_structure = this.sql.json(
        input.exam_structure as unknown as PgJson
      );

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
      paper_name_uz: string | null;
      lo_id: string | null;
      lo_code: string | null;
      lo_title_en: string | null;
      lo_title_ru: string | null;
      lo_title_uz: string | null;
      lo_sort_order: number | null;
      // theory_en non-null = LO has a primer. We send only the flag, not the
      // full text, to keep this payload tiny.
      lo_has_theory: boolean;
      active_count: number;
      draft_count: number;
      // "Retired" = used to be active and then turned off. There's no formal
      // distinction between "draft" and "retired" at the schema level - both
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
        paper_name_uz: string | null;
        lo_id: string | null;
        lo_code: string | null;
        lo_title_en: string | null;
        lo_title_ru: string | null;
        lo_title_uz: string | null;
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
        p.name_uz                               AS paper_name_uz,
        lo.id::text                             AS lo_id,
        lo.code                                 AS lo_code,
        lo.title_en                             AS lo_title_en,
        lo.title_ru                             AS lo_title_ru,
        lo.title_uz                             AS lo_title_uz,
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

  // Active-question count per paper, in a single grouped query. Used by the
  // public paper listing so the onboarding goal step (and any picker) can tell
  // which papers actually have content to study, and avoid offering an empty
  // paper as a first-lesson target. Papers with no LOs/questions come back
  // with active_count 0 (LEFT JOINs + COALESCE), so every paper is represented.
  async countActiveByPaper(): Promise<
    Array<{ paper_id: string; active_count: number }>
  > {
    return this.sql<Array<{ paper_id: string; active_count: number }>>`
      SELECT
        p.id::text AS paper_id,
        COALESCE(SUM(CASE WHEN q.is_active = TRUE THEN 1 ELSE 0 END), 0)::int AS active_count
      FROM papers p
      LEFT JOIN learning_objectives lo ON lo.paper_id = p.id
      LEFT JOIN questions q            ON q.lo_id = lo.id
      GROUP BY p.id
    `;
  }
}
