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
// The workbook is trilingual: every user-visible column has an optional _ru
// and _uz sibling (question_text_ru, option_a_uz, statement_1_ru, ...). A blank
// translation cell means "no translation supplied", which on re-import
// PRESERVES whatever is already stored rather than wiping it - see
// upsertQuestion and mergeTranslations. That matters because the first import
// of this bank was English-only, and re-running it must not undo translation
// work done since.
//
// This is deterministic parsing of a known layout - it does NOT
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

// Option column headers, in key order A..H. Each has optional _ru / _uz
// siblings (option_a_ru, option_a_uz, ...).
const OPTION_COLS = [
  "option_a", "option_b", "option_c", "option_d",
  "option_e", "option_f", "option_g", "option_h",
];
const OPTION_KEYS = ["A", "B", "C", "D", "E", "F", "G", "H"];

// The non-canonical languages the workbook can carry. Column names are formed
// as `<base>_<lang>`, so adding a language here plus a column in the sheet is
// all it takes.
const IMPORT_LANGS = ["ru", "uz"] as const;

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
  prompt_ru: string | null;
  prompt_uz: string | null;
  exhibit_en: string | null;
  exhibit_ru: string | null;
  exhibit_uz: string | null;
  options: McqOption[] | null;
  payload: QuestionPayload | null;
  correct_answer_en: string; // canonical; never empty for active rows
  explanation_en: string;
  explanation_ru: string | null;
  explanation_uz: string | null;
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
      // Pre-load the stored options/payload for every ref we're about to
      // upsert. The scalar _ru/_uz columns are protected by COALESCE in the
      // upsert, but options and payload are single JSONB values that get
      // replaced wholesale - so any translation living INSIDE them (option
      // text, statement text, matching labels) would be lost when the workbook
      // leaves those cells blank. mergeTranslations folds the stored values
      // back in first. One query, not one per row.
      const existingBodies = await this.loadExistingBodies(
        tx,
        parsed.map((p) => p.ref)
      );

      // ref -> question id (for mock membership).
      const idByRef = new Map<string, string>();
      for (const p of parsed) {
        const loId = los.get(`${p.paper_code}::${p.lo_code}`)!;
        this.mergeTranslations(p, existingBodies.get(p.ref));
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
      prompt_ru: str(row["question_text_ru"]) || null,
      prompt_uz: str(row["question_text_uz"]) || null,
      exhibit_en: str(row["exhibit"]) || null,
      exhibit_ru: str(row["exhibit_ru"]) || null,
      exhibit_uz: str(row["exhibit_uz"]) || null,
      explanation_en: str(row["explanation"]),
      explanation_ru: str(row["explanation_ru"]) || null,
      explanation_uz: str(row["explanation_uz"]) || null,
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

  // Option text plus its optional translations. why_wrong has no workbook
  // column in any language - it's authored in the admin editor - so it stays
  // null here and the upsert never overwrites a stored value with that null.
  private readOptions(row: Record<string, unknown>): McqOption[] {
    const out: McqOption[] = [];
    OPTION_COLS.forEach((colName, i) => {
      const text = str(row[colName]);
      if (text) {
        out.push({
          key: OPTION_KEYS[i],
          text_en: text,
          text_ru: str(row[`${colName}_ru`]) || null,
          text_uz: str(row[`${colName}_uz`]) || null,
          why_wrong_en: null,
          why_wrong_ru: null,
          why_wrong_uz: null,
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
      statements.push({
        text_en: text,
        text_ru: str(row[`statement_${i}_ru`]) || null,
        text_uz: str(row[`statement_${i}_uz`]) || null,
        answer,
      });
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
    // Translated label sets come from dedicated pipe-delimited columns
    // (labels_ru / labels_uz) and are only accepted when they align 1:1 with
    // the canonical family - a mismatched set would put the wrong choice under
    // a statement, so it is dropped rather than half-applied.
    const alignedLabels = (colName: string): string[] | null => {
      const parts = splitPipe(str(row[colName]));
      if (parts.length !== labels.length) return null;
      if (parts.some((p) => p === "")) return null;
      return parts;
    };
    return {
      payload: {
        labels,
        labels_ru: alignedLabels("labels_ru"),
        labels_uz: alignedLabels("labels_uz"),
        statements,
      },
      canonical,
    };
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
    // Translated row labels / option values arrive as parallel pipe-delimited
    // columns. They are used only when the element count matches the canonical
    // list exactly; a mismatched column is ignored wholesale rather than
    // applied positionally to the wrong entries.
    const aligned = (colName: string, expected: number): string[] | null => {
      const parts = splitPipe(str(row[colName]));
      if (parts.length !== expected) return null;
      if (parts.some((p) => p === "")) return null;
      return parts;
    };
    const rowLabelsRu = aligned("match_rows_ru", rowTexts.length);
    const rowLabelsUz = aligned("match_rows_uz", rowTexts.length);
    const optValuesRu = aligned("match_options_ru", optTexts.length);
    const optValuesUz = aligned("match_options_uz", optTexts.length);

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
        label_ru: rowLabelsRu ? rowLabelsRu[i] : null,
        label_uz: rowLabelsUz ? rowLabelsUz[i] : null,
        correct_value_en: canonicalValue,
      });
    }
    const options = optTexts.map((v, i) => ({
      value_en: v,
      value_ru: optValuesRu ? optValuesRu[i] : null,
      value_uz: optValuesUz ? optValuesUz[i] : null,
    }));
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

  // Upsert one parsed row.
  //
  // TRANSLATION PRESERVATION is the important part of the ON CONFLICT clause.
  // English columns are authoritative and overwrite unconditionally - the
  // workbook is the source of truth for EN. Every _ru / _uz column instead uses
  // COALESCE(EXCLUDED.x, questions.x): a filled workbook cell wins, a blank one
  // leaves what's stored alone.
  //
  // The previous version did `prompt_ru = EXCLUDED.prompt_ru` where EXCLUDED
  // was hardcoded null, so any re-import silently wiped every translation on
  // the imported bank. Do not "simplify" these back to bare EXCLUDED.
  //
  // options / payload are JSONB and carry their translations inside, so they
  // can't be COALESCEd column-wise. mergeTranslations() (called before this)
  // has already folded any stored translations into the incoming JSON for
  // fields the workbook left blank, so a plain overwrite is safe here.
  //
  // concept_bite has no workbook column in any language (it's authored in the
  // admin editor) and so is absent from the update list entirely - inserting
  // null on first import, untouched on every re-import.
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
        prompt_en, prompt_ru, prompt_uz,
        options, payload,
        correct_answer_en, correct_answer_ru, correct_answer_uz,
        explanation_en, explanation_ru, explanation_uz,
        concept_bite_en, concept_bite_ru, concept_bite_uz,
        exhibit_en, exhibit_ru, exhibit_uz,
        acceptable_tolerance,
        external_ref,
        is_active
      ) VALUES (
        ${loId}, ${p.type}, 'medium',
        ${p.prompt_en}, ${p.prompt_ru}, ${p.prompt_uz},
        ${optionsParam}, ${payloadParam},
        ${p.correct_answer_en}, ${null}, ${null},
        ${p.explanation_en}, ${p.explanation_ru}, ${p.explanation_uz},
        ${null}, ${null}, ${null},
        ${p.exhibit_en}, ${p.exhibit_ru}, ${p.exhibit_uz},
        ${null},
        ${p.ref},
        ${p.is_active}
      )
      ON CONFLICT (external_ref) WHERE external_ref IS NOT NULL DO UPDATE SET
        lo_id = EXCLUDED.lo_id,
        type = EXCLUDED.type,
        prompt_en = EXCLUDED.prompt_en,
        prompt_ru = COALESCE(EXCLUDED.prompt_ru, questions.prompt_ru),
        prompt_uz = COALESCE(EXCLUDED.prompt_uz, questions.prompt_uz),
        options = EXCLUDED.options,
        payload = EXCLUDED.payload,
        correct_answer_en = EXCLUDED.correct_answer_en,
        explanation_en = EXCLUDED.explanation_en,
        explanation_ru = COALESCE(EXCLUDED.explanation_ru, questions.explanation_ru),
        explanation_uz = COALESCE(EXCLUDED.explanation_uz, questions.explanation_uz),
        exhibit_en = EXCLUDED.exhibit_en,
        exhibit_ru = COALESCE(EXCLUDED.exhibit_ru, questions.exhibit_ru),
        exhibit_uz = COALESCE(EXCLUDED.exhibit_uz, questions.exhibit_uz),
        acceptable_tolerance = EXCLUDED.acceptable_tolerance,
        is_active = EXCLUDED.is_active,
        updated_at = NOW()
      RETURNING id, (xmax = 0) AS inserted
    `;
    return rows[0];
  }

  // Fetch the currently-stored options / payload for a set of external_refs.
  // Refs that don't exist yet simply don't appear in the map (first import).
  private async loadExistingBodies(
    tx: TransactionSql,
    refs: string[]
  ): Promise<
    Map<
      string,
      { options: McqOption[] | null; payload: QuestionPayload | null }
    >
  > {
    const map = new Map<
      string,
      { options: McqOption[] | null; payload: QuestionPayload | null }
    >();
    if (refs.length === 0) return map;
    const rows = await tx<
      Array<{
        external_ref: string;
        options: McqOption[] | null;
        payload: QuestionPayload | null;
      }>
    >`
      SELECT external_ref, options, payload
      FROM questions
      WHERE external_ref IN ${tx(refs)}
    `;
    for (const r of rows) {
      map.set(r.external_ref, { options: r.options, payload: r.payload });
    }
    return map;
  }

  // Fold stored translations into a parsed row wherever the workbook supplied
  // none. Mutates p.options / p.payload in place.
  //
  // Matching strategy per structure:
  //   - options    : by option KEY ("A".."H"). Keys are stable across edits, so
  //                  this survives an option being reworded in English.
  //   - statements : by INDEX, and only when the counts still match. If the
  //                  author added or removed a statement the old translations
  //                  no longer line up with the new statements, and carrying
  //                  them over positionally would attach the wrong Russian text
  //                  to the wrong claim - worse than having none.
  //   - tf labels  : whole array at a time, only when it aligns 1:1 with the
  //                  canonical labels.
  //   - match rows : by INDEX under the same count guard as statements.
  //   - match opts : by canonical value_en, which is the stable identity here.
  //
  // Never overwrites something the workbook DID supply - the sheet always wins
  // when it has a value.
  private mergeTranslations(
    p: ParsedRow,
    existing:
      | { options: McqOption[] | null; payload: QuestionPayload | null }
      | undefined
  ): void {
    if (!existing) return;

    // ---- options ----
    if (p.options !== null && Array.isArray(existing.options)) {
      const byKey = new Map(
        existing.options.map((o) => [o.key.trim().toUpperCase(), o])
      );
      for (const opt of p.options) {
        const prev = byKey.get(opt.key.trim().toUpperCase());
        if (!prev) continue;
        opt.text_ru = opt.text_ru ?? prev.text_ru ?? null;
        opt.text_uz = opt.text_uz ?? prev.text_uz ?? null;
        // why_wrong has no workbook column at all, so the stored value is the
        // only source there is.
        opt.why_wrong_en = opt.why_wrong_en ?? prev.why_wrong_en ?? null;
        opt.why_wrong_ru = opt.why_wrong_ru ?? prev.why_wrong_ru ?? null;
        opt.why_wrong_uz = opt.why_wrong_uz ?? prev.why_wrong_uz ?? null;
      }
    }

    if (p.payload === null || existing.payload === null) return;

    // ---- true_false ----
    if (p.type === "true_false") {
      const next = p.payload as TrueFalsePayload;
      const prev = existing.payload as TrueFalsePayload;
      if (!Array.isArray(prev.statements)) return;

      if (
        next.labels_ru == null &&
        Array.isArray(prev.labels_ru) &&
        prev.labels_ru.length === next.labels.length
      ) {
        next.labels_ru = prev.labels_ru;
      }
      if (
        next.labels_uz == null &&
        Array.isArray(prev.labels_uz) &&
        prev.labels_uz.length === next.labels.length
      ) {
        next.labels_uz = prev.labels_uz;
      }
      if (prev.statements.length === next.statements.length) {
        next.statements.forEach((st, i) => {
          st.text_ru = st.text_ru ?? prev.statements[i].text_ru ?? null;
          st.text_uz = st.text_uz ?? prev.statements[i].text_uz ?? null;
        });
      }
      return;
    }

    // ---- matching ----
    if (p.type === "matching") {
      const next = p.payload as MatchingPayload;
      const prev = existing.payload as MatchingPayload;
      if (!Array.isArray(prev.rows) || !Array.isArray(prev.options)) return;

      if (prev.rows.length === next.rows.length) {
        next.rows.forEach((r, i) => {
          r.label_ru = r.label_ru ?? prev.rows[i].label_ru ?? null;
          r.label_uz = r.label_uz ?? prev.rows[i].label_uz ?? null;
        });
      }
      const prevByValue = new Map(
        prev.options.map((o) => [o.value_en.trim().toLowerCase(), o])
      );
      for (const o of next.options) {
        const match = prevByValue.get(o.value_en.trim().toLowerCase());
        if (!match) continue;
        o.value_ru = o.value_ru ?? match.value_ru ?? null;
        o.value_uz = o.value_uz ?? match.value_uz ?? null;
      }
    }
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
