import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import type { Sql, TransactionSql } from "postgres";
import * as XLSX from "xlsx";
import { PG } from "../db/db.module";
import type {
  McqOption,
  QuestionPayload,
  QuestionType,
  TrueFalsePayload,
  MatchingPayload,
} from "./content.types";

// ---------------------------------------------------------------------------
// Bank importer. Reads the master mock workbook (the "Questions" sheet) and
// upserts each row into `questions` (keyed on question_ref via external_ref),
// then rebuilds the fixed `mock_exams` / `mock_exam_questions` for each mock_set.
//
// This is deterministic parsing of a known 28(+3)-column layout - it does NOT
// invent content. Rows it cannot represent safely (missing answer, answer key
// not matching options, unknown true_false label, missing LO tag) are still
// imported but flagged is_active=false with a reason, or skipped when there's
// no LO to attach them to. Everything runs in one transaction; a hard DB error
// rolls the whole import back. The return value is a structured report.
// ---------------------------------------------------------------------------

const SHEET = "Questions";

// Workbook type string -> question_type enum value.
const TYPE_MAP: Record<string, QuestionType> = {
  mcq_single: "mcq",
  mcq_multi: "mcq_multi",
  number_entry: "number_entry",
  true_false: "true_false",
  matching: "matching",
};

// Option column headers, in key order A..H.
const OPTION_COLS = [
  "option_a", "option_b", "option_c", "option_d",
  "option_e", "option_f", "option_g", "option_h",
];
const OPTION_KEYS = ["A", "B", "C", "D", "E", "F", "G", "H"];

// true_false label families. A statement answer is matched (case-insensitively)
// to the family that contains it, and the full ordered family becomes the
// choices shown for every statement in that question. Sourced from the
// workbook's Lists sheet plus the labels actually used in the bank.
const LABEL_FAMILIES: string[][] = [
  ["Yes", "No"],
  ["True", "False"],
  ["Provision", "Accrual"],
  ["Correct", "Incorrect"],
  ["Understated", "Overstated"],
  ["Increase", "Reduce", "Do not change"],
  ["Over absorbed", "Under absorbed"],
];

export interface ImportReport {
  total_rows: number;
  questions_inserted: number;
  questions_updated: number;
  questions_inactive: Array<{ ref: string; reason: string }>;
  rows_skipped: Array<{ ref: string; reason: string }>;
  mocks: Array<{ code: string; question_count: number }>;
}

// A row parsed into storage shape. is_active=false carries an inactive_reason.
interface ParsedRow {
  ref: string;
  paper_code: string;
  lo_code: string;
  mock_set: string;
  section_code: string;
  marks: number;
  type: QuestionType;
  prompt_en: string;
  exhibit_en: string | null;
  options: McqOption[] | null;
  payload: QuestionPayload | null;
  correct_answer_en: string; // canonical; never empty for active rows
  explanation_en: string;
  is_active: boolean;
  inactive_reason: string | null;
}

@Injectable()
export class QuestionImportService {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  async importWorkbook(buffer: Buffer): Promise<ImportReport> {
    const raw = this.readRows(buffer);
    const report: ImportReport = {
      total_rows: 0,
      questions_inserted: 0,
      questions_updated: 0,
      questions_inactive: [],
      rows_skipped: [],
      mocks: [],
    };

    // Resolve (paper_code, lo_code) -> lo_id and paper_code -> paper meta up
    // front so per-row work is a map lookup.
    const papers = await this.loadPapers();
    const los = await this.loadLos();

    // Parse every row into storage shape (pure). Rows with no LO tag or no
    // matching LO are skipped (can't attach without lo_id).
    const parsed: ParsedRow[] = [];
    for (const row of raw) {
      const ref = str(row["question_ref"]);
      if (!ref) continue; // truly empty line
      report.total_rows += 1;
      const paperCode = str(row["paper"]);
      const loCode = str(row["lo"]).toUpperCase();
      if (!loCode) {
        report.rows_skipped.push({ ref, reason: "no lo tag in workbook" });
        continue;
      }
      const loId = los.get(`${paperCode}::${loCode}`);
      if (!loId) {
        report.rows_skipped.push({
          ref,
          reason: `no learning objective ${paperCode}-${loCode} (seed the paper first)`,
        });
        continue;
      }
      const p = this.buildRow(row, ref, paperCode, loCode);
      if (typeof p === "string") {
        // Unrepresentable even as inactive (should be rare) -> skip.
        report.rows_skipped.push({ ref, reason: p });
        continue;
      }
      parsed.push(p);
    }

    // Upsert questions + rebuild mocks in one transaction.
    await this.sql.begin(async (tx) => {
      // ref -> question id (for mock membership).
      const idByRef = new Map<string, string>();
      for (const p of parsed) {
        const loId = los.get(`${p.paper_code}::${p.lo_code}`)!;
        const { id, inserted } = await this.upsertQuestion(tx, loId, p);
        idByRef.set(p.ref, id);
        if (inserted) report.questions_inserted += 1;
        else report.questions_updated += 1;
        if (!p.is_active) {
          report.questions_inactive.push({
            ref: p.ref,
            reason: p.inactive_reason ?? "inactive",
          });
        }
      }

      // Rebuild mock_exams / mock_exam_questions, mock_set by mock_set in first
      // -seen order. Membership is a full delete+reinsert so re-importing a
      // trimmed sheet doesn't leave stale rows.
      const byMock = groupByMock(parsed);
      for (const [code, rowsInMock] of byMock) {
        const paperCode = rowsInMock[0].paper_code;
        const paper = papers.get(paperCode);
        if (!paper) {
          // Shouldn't happen (LO lookup already succeeded), but be safe.
          continue;
        }
        const mockId = await this.upsertMock(tx, code, paper);
        await tx`DELETE FROM mock_exam_questions WHERE mock_id = ${mockId}`;
        let position = 0;
        for (const p of rowsInMock) {
          const qid = idByRef.get(p.ref);
          if (!qid) continue;
          await tx`
            INSERT INTO mock_exam_questions
              (mock_id, question_id, position, section_code, marks)
            VALUES (${mockId}, ${qid}, ${position}, ${p.section_code}, ${p.marks})
          `;
          position += 1;
        }
        report.mocks.push({ code, question_count: position });
      }
    });

    return report;
  }

  // ---- workbook reading ----

  private readRows(buffer: Buffer): Array<Record<string, unknown>> {
    let wb: XLSX.WorkBook;
    try {
      wb = XLSX.read(buffer, { type: "buffer" });
    } catch {
      throw new BadRequestException("could not read the uploaded file as .xlsx");
    }
    const ws = wb.Sheets[SHEET];
    if (!ws) {
      throw new BadRequestException(`workbook has no "${SHEET}" sheet`);
    }
    // header:1 -> array-of-arrays. Row 1 is the merged group banner; row 2 is
    // the real column header; data starts at row 3.
    const grid = XLSX.utils.sheet_to_json<unknown[]>(ws, {
      header: 1,
      defval: null,
      blankrows: false,
    });
    if (grid.length < 3) {
      throw new BadRequestException("workbook has no data rows");
    }
    const header = (grid[1] as unknown[]).map((h) => str(h));
    if (!header.includes("question_ref")) {
      throw new BadRequestException(
        'header row (row 2) is missing "question_ref"'
      );
    }
    const rows: Array<Record<string, unknown>> = [];
    for (let i = 2; i < grid.length; i++) {
      const cells = grid[i] as unknown[];
      const obj: Record<string, unknown> = {};
      header.forEach((h, c) => {
        if (h) obj[h] = cells[c] ?? null;
      });
      rows.push(obj);
    }
    return rows;
  }

  // ---- per-row build (pure) ----

  private buildRow(
    row: Record<string, unknown>,
    ref: string,
    paperCode: string,
    loCode: string
  ): ParsedRow | string {
    const rawType = str(row["type"]);
    const type = TYPE_MAP[rawType];
    if (!type) return `unknown type "${rawType}"`;

    const base: Omit<
      ParsedRow,
      "type" | "options" | "payload" | "correct_answer_en" | "is_active" | "inactive_reason"
    > = {
      ref,
      paper_code: paperCode,
      lo_code: loCode,
      mock_set: str(row["mock_set"]) || paperCode,
      section_code: str(row["section"]) || "A",
      marks: toMarks(row["marks"]),
      prompt_en: str(row["question_text"]),
      exhibit_en: str(row["exhibit"]) || null,
      explanation_en: str(row["explanation"]),
    };

    const inactive = (
      partial: Pick<ParsedRow, "options" | "payload" | "correct_answer_en">,
      reason: string
    ): ParsedRow => ({
      ...base,
      type,
      ...partial,
      is_active: false,
      inactive_reason: reason,
    });
    const active = (
      partial: Pick<ParsedRow, "options" | "payload" | "correct_answer_en">
    ): ParsedRow => ({
      ...base,
      type,
      ...partial,
      is_active: true,
      inactive_reason: null,
    });

    if (type === "mcq" || type === "mcq_multi") {
      const options = this.readOptions(row);
      const keys = new Set(options.map((o) => o.key.toUpperCase()));
      const rawCa = str(row["correct_answer"]);
      if (options.length < 2) {
        return inactive({ options, payload: null, correct_answer_en: rawCa }, "fewer than 2 options");
      }
      if (!rawCa) {
        return inactive({ options, payload: null, correct_answer_en: "" }, "missing correct_answer");
      }
      const picked = rawCa.split(",").map((k) => k.trim().toUpperCase()).filter(Boolean);
      const unknown = picked.filter((k) => !keys.has(k));
      if (picked.length === 0 || unknown.length > 0) {
        return inactive(
          { options, payload: null, correct_answer_en: rawCa },
          `correct key(s) ${unknown.join(",") || "(none)"} not in options`
        );
      }
      const canonical = [...new Set(picked)].sort().join(",");
      return active({ options, payload: null, correct_answer_en: canonical });
    }

    if (type === "number_entry") {
      const rawCa = str(row["correct_answer"]);
      if (!rawCa) {
        return inactive({ options: null, payload: null, correct_answer_en: "" }, "missing correct_answer");
      }
      return active({ options: null, payload: null, correct_answer_en: rawCa });
    }

    if (type === "true_false") {
      const built = this.buildTrueFalse(row);
      if (typeof built === "string") {
        return inactive({ options: null, payload: null, correct_answer_en: "" }, built);
      }
      return active({ options: null, payload: built.payload, correct_answer_en: built.canonical });
    }

    // matching
    const built = this.buildMatching(row);
    if (typeof built === "string") {
      return inactive({ options: null, payload: null, correct_answer_en: "" }, built);
    }
    return active({ options: null, payload: built.payload, correct_answer_en: built.canonical });
  }

  private readOptions(row: Record<string, unknown>): McqOption[] {
    const out: McqOption[] = [];
    OPTION_COLS.forEach((colName, i) => {
      const text = str(row[colName]);
      if (text) {
        out.push({
          key: OPTION_KEYS[i],
          text_en: text,
          text_ru: null,
          why_wrong_en: null,
          why_wrong_ru: null,
        });
      }
    });
    return out;
  }

  private buildTrueFalse(
    row: Record<string, unknown>
  ): { payload: TrueFalsePayload; canonical: string } | string {
    const statements: TrueFalsePayload["statements"] = [];
    for (let i = 1; i <= 4; i++) {
      const text = str(row[`statement_${i}`]);
      if (!text) continue;
      const answer = str(row[`statement_${i}_answer`]);
      if (!answer) return `statement ${i} has no answer`;
      statements.push({ text_en: text, text_ru: null, answer });
    }
    if (statements.length === 0) return "no statements";
    const distinct = [...new Set(statements.map((s) => s.answer.toLowerCase()))];
    // Match to a label family that contains every answer used.
    let labels: string[] | null = null;
    for (const fam of LABEL_FAMILIES) {
      const low = fam.map((l) => l.toLowerCase());
      if (distinct.every((d) => low.includes(d))) {
        labels = fam;
        break;
      }
    }
    if (!labels) {
      // No known family: fall back to the distinct answers if there are >= 2,
      // otherwise we can't offer a meaningful choice.
      const seen = statements.map((s) => s.answer);
      const uniq = [...new Set(seen)];
      if (uniq.length >= 2) labels = uniq;
      else return `unknown true_false label(s): ${uniq.join(", ")}`;
    }
    const canonical = statements.map((s) => s.answer).join(",");
    return { payload: { labels, labels_ru: null, statements }, canonical };
  }

  private buildMatching(
    row: Record<string, unknown>
  ): { payload: MatchingPayload; canonical: string } | string {
    const rowTexts = splitPipe(str(row["match_rows"]));
    const optTexts = splitPipe(str(row["match_options"]));
    const ca = str(row["correct_answer"]);
    if (rowTexts.length === 0) return "no match_rows";
    if (optTexts.length < 2) return "fewer than 2 match_options";
    if (!ca) return "missing correct_answer";
    const pairs = splitPipe(ca);
    if (pairs.length !== rowTexts.length) {
      return `pairs (${pairs.length}) != rows (${rowTexts.length})`;
    }
    const optLower = new Map(optTexts.map((o) => [o.toLowerCase(), o]));
    const rows: MatchingPayload["rows"] = [];
    for (let i = 0; i < rowTexts.length; i++) {
      const eq = pairs[i].indexOf("=");
      if (eq < 0) return `pair "${pairs[i]}" has no =`;
      const value = pairs[i].slice(eq + 1).trim();
      const canonicalValue = optLower.get(value.toLowerCase());
      if (!canonicalValue) return `value "${value}" not in match_options`;
      rows.push({
        label_en: rowTexts[i],
        label_ru: null,
        correct_value_en: canonicalValue,
      });
    }
    const options = optTexts.map((v) => ({ value_en: v, value_ru: null }));
    const canonical = rows
      .map((r) => `${r.label_en}=${r.correct_value_en}`)
      .join(" | ");
    return { payload: { rows, options }, canonical };
  }

  // ---- DB helpers ----

  private async loadPapers(): Promise<
    Map<string, { id: string; duration_seconds: number; pass_mark_pct: number }>
  > {
    const rows = await this.sql<
      Array<{ id: string; code: string; exam_structure: unknown }>
    >`SELECT id, code, exam_structure FROM papers`;
    const map = new Map<
      string,
      { id: string; duration_seconds: number; pass_mark_pct: number }
    >();
    for (const r of rows) {
      const es = (r.exam_structure ?? {}) as {
        duration_seconds?: number;
        pass_mark_pct?: number;
      };
      map.set(r.code, {
        id: r.id,
        // Fall back to the standard 2h / 50% if a paper somehow lacks it.
        duration_seconds: es.duration_seconds ?? 7200,
        pass_mark_pct: es.pass_mark_pct ?? 50,
      });
    }
    return map;
  }

  private async loadLos(): Promise<Map<string, string>> {
    const rows = await this.sql<
      Array<{ id: string; code: string; paper_code: string }>
    >`
      SELECT lo.id, lo.code, p.code AS paper_code
      FROM learning_objectives lo
      JOIN papers p ON p.id = lo.paper_id
    `;
    const map = new Map<string, string>();
    for (const r of rows) map.set(`${r.paper_code}::${r.code}`, r.id);
    return map;
  }

  private async upsertQuestion(
    tx: TransactionSql,
    loId: string,
    p: ParsedRow
  ): Promise<{ id: string; inserted: boolean }> {
    const optionsParam = p.options === null ? null : tx.json(p.options as any);
    const payloadParam = p.payload === null ? null : tx.json(p.payload as any);
    const rows = await tx<Array<{ id: string; inserted: boolean }>>`
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
      ) VALUES (
        ${loId}, ${p.type}, 'medium',
        ${p.prompt_en}, ${null},
        ${optionsParam}, ${payloadParam},
        ${p.correct_answer_en}, ${null},
        ${p.explanation_en}, ${null},
        ${null}, ${null},
        ${p.exhibit_en}, ${null},
        ${null},
        ${p.ref},
        ${p.is_active}
      )
      ON CONFLICT (external_ref) WHERE external_ref IS NOT NULL DO UPDATE SET
        lo_id = EXCLUDED.lo_id,
        type = EXCLUDED.type,
        prompt_en = EXCLUDED.prompt_en,
        options = EXCLUDED.options,
        payload = EXCLUDED.payload,
        correct_answer_en = EXCLUDED.correct_answer_en,
        correct_answer_ru = EXCLUDED.correct_answer_ru,
        explanation_en = EXCLUDED.explanation_en,
        exhibit_en = EXCLUDED.exhibit_en,
        exhibit_ru = EXCLUDED.exhibit_ru,
        acceptable_tolerance = EXCLUDED.acceptable_tolerance,
        is_active = EXCLUDED.is_active,
        updated_at = NOW()
      RETURNING id, (xmax = 0) AS inserted
    `;
    return rows[0];
  }

  private async upsertMock(
    tx: TransactionSql,
    code: string,
    paper: { id: string; duration_seconds: number; pass_mark_pct: number }
  ): Promise<string> {
    const rows = await tx<Array<{ id: string }>>`
      INSERT INTO mock_exams
        (paper_id, code, name_en, name_ru, duration_seconds, pass_mark_pct, source)
      VALUES (
        ${paper.id}, ${code}, ${code}, ${null},
        ${paper.duration_seconds}, ${paper.pass_mark_pct},
        ${"mock workbook import"}
      )
      ON CONFLICT (code) DO UPDATE SET
        paper_id = EXCLUDED.paper_id,
        name_en = EXCLUDED.name_en,
        duration_seconds = EXCLUDED.duration_seconds,
        pass_mark_pct = EXCLUDED.pass_mark_pct,
        updated_at = NOW()
      RETURNING id
    `;
    return rows[0].id;
  }
}

// ---- small pure helpers ----

function str(v: unknown): string {
  if (v === null || v === undefined) return "";
  return String(v).trim();
}

function toMarks(v: unknown): number {
  if (typeof v === "number" && Number.isFinite(v)) return Math.trunc(v);
  const n = parseInt(str(v), 10);
  // Default to the standard 2-mark objective question when blank/unparseable.
  return Number.isFinite(n) && n > 0 ? n : 2;
}

function splitPipe(s: string): string[] {
  if (!s) return [];
  return s.split("|").map((x) => x.trim()).filter((x) => x.length > 0);
}

function groupByMock(rows: ParsedRow[]): Map<string, ParsedRow[]> {
  const m = new Map<string, ParsedRow[]>();
  for (const r of rows) {
    const arr = m.get(r.mock_set);
    if (arr) arr.push(r);
    else m.set(r.mock_set, [r]);
  }
  return m;
}
