import { Injectable } from "@nestjs/common";
import type {
  QuestionRow,
  Lang,
  TrueFalsePayload,
  MatchingPayload,
} from "../content/content.types";

export interface GradeResult {
  was_correct: boolean;
  // Stored in attempts.llm_grade_json. Always null now - grading is fully
  // deterministic (mcq / number_entry) and no LLM is involved in the grading
  // path. The column is retained for historical rows and a possible future
  // authoring-side use; the grader never populates it.
  llm_grade_json: unknown | null;
}

// Grading is locked to DETERMINISTIC objective question types only:
//   mcq, mcq_multi, true_false, matching, number_entry.
// See the Grading Spec: ACCA auto-marks only objective formats (single-answer
// MCQ, multiple-response, true/false-style statement sets, matching, numeric
// fill-in-the-blank) - all of which are exact, rule-based marks. Free-text
// short_answer is not a real auto-marked exam format, so it was retired from
// the question bank; the grader has no code path for it. No fuzzy string
// matching, no synonym sets, and no LLM anywhere in the grading path - that is
// what produced the "Zero based budgeting marked wrong" trust bug. The
// multi-part types (mcq_multi, true_false, matching) are marked ALL-OR-NOTHING
// per question, matching how ACCA marks objective items.

@Injectable()
export class GraderService {
  // No dependencies: grading is self-contained and deterministic. The
  // LlmGraderService is intentionally NOT injected here anymore - it stays
  // dormant in the tree (no callers) for a possible future authoring-side use.

  // user_id and lang are kept in the signature for caller compatibility and
  // future use; deterministic grading doesn't need either (option keys and
  // numeric values are language-neutral).
  async grade(
    question: QuestionRow,
    _user_id: string,
    user_answer: string,
    _lang: Lang
  ): Promise<GradeResult> {
    if (question.type === "mcq") {
      return this.gradeMcq(question, user_answer);
    }
    if (question.type === "mcq_multi") {
      return this.gradeMcqMulti(question, user_answer);
    }
    if (question.type === "true_false") {
      return this.gradeTrueFalse(question, user_answer);
    }
    if (question.type === "matching") {
      return this.gradeMatching(question, user_answer);
    }
    if (question.type === "number_entry") {
      const numeric = this.gradeNumber(question, user_answer);
      // Parse failure (gibberish / unparseable input) is simply WRONG. We do
      // NOT fall through to any LLM or fuzzy path - there is none. Returning
      // incorrect directly keeps grading deterministic and dispute-free.
      if (numeric === null) {
        return { was_correct: false, llm_grade_json: null };
      }
      return numeric;
    }
    // Any non-deterministic type (e.g. a stray legacy short_answer that wasn't
    // migrated) is not auto-gradable. Fail closed: mark incorrect rather than
    // silently passing, and never invoke an LLM. Once the short_answer audit /
    // migration (Grading Spec steps 1-6) lands, no such rows should remain.
    return { was_correct: false, llm_grade_json: null };
  }

  private gradeMcq(question: QuestionRow, user_answer: string): GradeResult {
    // MCQ correct_answer_en stores the option key (e.g. "A"). The key is the same
    // across languages, so no language switch needed here. Compare case-insensitively
    // and trim - admins sometimes save "A " with trailing space.
    const expected = question.correct_answer_en.trim().toUpperCase();
    const actual = user_answer.trim().toUpperCase();
    return { was_correct: expected === actual, llm_grade_json: null };
  }

  // ------------------------------------------------------------------
  // Multi-part objective graders (mcq_multi / true_false / matching).
  //
  // WIRE FORMAT of user_answer (what the client submits) - the client is
  // responsible for producing exactly this; grading is strict and any deviation
  // marks the attempt WRONG (never throws, never falls back to fuzzy/LLM):
  //   - mcq_multi : the selected option KEYS. JSON array (e.g. ["B","C"]) or a
  //                 comma/space-delimited string ("B,C"). Order-insensitive.
  //   - true_false: the chosen CANONICAL (English) label per statement, in
  //                 statement order, as a JSON array (e.g. ["No","Yes"]). The
  //                 client maps the displayed label (which may be RU) back to
  //                 its canonical English form via payload.labels before
  //                 sending, so grading stays language-neutral.
  //   - matching  : the chosen CANONICAL (English) option value per row, in row
  //                 order, as a JSON array (e.g. ["$121,991","nil"]). Values can
  //                 contain commas, so this MUST be JSON (no delimiter fallback).
  // All three are ALL-OR-NOTHING: every part must match to score the mark.
  // ------------------------------------------------------------------

  private gradeMcqMulti(question: QuestionRow, user_answer: string): GradeResult {
    // correct_answer_en holds the sorted correct keys (e.g. "B,C"). Compare as
    // sets so submission order doesn't matter.
    const expected = this.parseKeySet(question.correct_answer_en);
    const actual = this.parseKeySet(user_answer);
    const correct =
      expected.size > 0 &&
      expected.size === actual.size &&
      [...expected].every((k) => actual.has(k));
    return { was_correct: correct, llm_grade_json: null };
  }

  private gradeTrueFalse(question: QuestionRow, user_answer: string): GradeResult {
    const payload = question.payload as TrueFalsePayload | null;
    if (payload === null || !Array.isArray(payload.statements)) {
      // Shape guaranteed by chk_question_type_shape; fail closed if somehow off.
      return { was_correct: false, llm_grade_json: null };
    }
    const userLabels = this.parseAnswerList(user_answer);
    if (
      userLabels === null ||
      userLabels.length !== payload.statements.length
    ) {
      // Missing / extra answers, or unparseable input, is simply wrong.
      return { was_correct: false, llm_grade_json: null };
    }
    const correct = payload.statements.every((s, i) =>
      this.labelEq(userLabels[i], s.answer)
    );
    return { was_correct: correct, llm_grade_json: null };
  }

  private gradeMatching(question: QuestionRow, user_answer: string): GradeResult {
    const payload = question.payload as MatchingPayload | null;
    if (payload === null || !Array.isArray(payload.rows)) {
      return { was_correct: false, llm_grade_json: null };
    }
    // Matching values may themselves contain commas ("$14,862"), so the answer
    // MUST be a JSON array - no delimiter fallback - to stay unambiguous.
    const userValues = this.parseJsonStringArray(user_answer);
    if (userValues === null || userValues.length !== payload.rows.length) {
      return { was_correct: false, llm_grade_json: null };
    }
    const correct = payload.rows.every((r, i) =>
      this.labelEq(userValues[i], r.correct_value_en)
    );
    return { was_correct: correct, llm_grade_json: null };
  }

  // Case-insensitive, whitespace-trimmed equality for labels / option values.
  // These come from a FIXED set the student selected (option keys, labels,
  // values), so this is exact selection matching - not fuzzy text matching.
  private labelEq(a: string, b: string): boolean {
    return a.trim().toLowerCase() === b.trim().toLowerCase();
  }

  // Parse selected option keys from either a JSON array (["B","C"]) or a
  // comma/space-delimited string ("B,C"). Keys are short separator-free tokens,
  // so splitting is safe. Normalised to trimmed uppercase; blanks dropped.
  private parseKeySet(raw: string): Set<string> {
    const arr = this.parseJsonStringArray(raw);
    const tokens = arr !== null ? arr : raw.split(/[,\s]+/);
    const set = new Set<string>();
    for (const t of tokens) {
      const k = t.trim().toUpperCase();
      if (k !== "") set.add(k);
    }
    return set;
  }

  // Parse a JSON array of strings. Returns null unless the input is a JSON array
  // whose every element is a string. Non-string elements are REJECTED (not
  // coerced), keeping grading strict and predictable.
  private parseJsonStringArray(raw: string): string[] | null {
    const s = raw.trim();
    if (!s.startsWith("[")) return null;
    let parsed: unknown;
    try {
      parsed = JSON.parse(s);
    } catch {
      return null;
    }
    if (!Array.isArray(parsed)) return null;
    if (!parsed.every((x) => typeof x === "string")) return null;
    return parsed as string[];
  }

  // JSON array of strings, with a comma-delimited fallback for the true_false
  // wire format (labels are known to be comma-free). Empty input => null.
  private parseAnswerList(raw: string): string[] | null {
    const json = this.parseJsonStringArray(raw);
    if (json !== null) return json;
    const s = raw.trim();
    if (s === "") return null;
    return s.split(",").map((x) => x.trim());
  }

  // number_entry grader. Returns null on parse failure (caller falls through
  // to LLM path). Tolerance is taken from question.acceptable_tolerance -
  // NULL means exact match required.
  //
  // Normalisation handled:
  //  - thousands separators ("1,000" → 1000) - strip commas
  //  - leading/trailing whitespace
  //  - both "." and "," as decimal mark - but only when unambiguous (one of
  //    them present; if both are present, comma is thousands sep and dot is
  //    decimal - standard English convention.)
  //  - leading + sign or surrounding parentheses for negatives ("(150)" = -150)
  private gradeNumber(
    question: QuestionRow,
    user_answer: string
  ): GradeResult | null {
    const userNum = this.parseNumber(user_answer);
    const expectedNum = this.parseNumber(question.correct_answer_en);
    if (userNum === null || expectedNum === null) return null;

    const tol = question.acceptable_tolerance;
    const wasCorrect =
      tol === null
        ? userNum === expectedNum
        : Math.abs(userNum - expectedNum) <= tol;

    return { was_correct: wasCorrect, llm_grade_json: null };
  }

  private parseNumber(raw: string): number | null {
    let s = raw.trim();
    if (s === "") return null;

    // Accountancy convention: (123) means -123.
    let negative = false;
    if (s.startsWith("(") && s.endsWith(")")) {
      negative = true;
      s = s.slice(1, -1).trim();
    }

    // Decimal mark resolution:
    //   "1,234.56" → US/UK: comma is thousands, dot is decimal.
    //   "1.234,56" → EU: dot is thousands, comma is decimal.
    //   "1234,56"  → ambiguous; treat comma as decimal (no dot present).
    //   "1234.56"  → standard.
    const hasDot = s.includes(".");
    const hasComma = s.includes(",");
    if (hasDot && hasComma) {
      // Whichever appears LAST in the string is the decimal mark.
      const lastDot = s.lastIndexOf(".");
      const lastComma = s.lastIndexOf(",");
      if (lastComma > lastDot) {
        // EU: dot=thousands, comma=decimal
        s = s.replace(/\./g, "").replace(",", ".");
      } else {
        // US/UK: comma=thousands, dot=decimal
        s = s.replace(/,/g, "");
      }
    } else if (hasComma) {
      // Only comma - treat as decimal mark (single comma) or thousands sep
      // (multiple commas / comma not in 3-digits-from-end pattern). Simplest
      // heuristic: if there's exactly one comma followed by 1-2 digits, it's
      // a decimal. Otherwise treat as thousands sep.
      const m = s.match(/^-?\d+,(\d{1,2})$/);
      if (m) s = s.replace(",", ".");
      else s = s.replace(/,/g, "");
    }

    // Drop a leading '+' since parseFloat handles signs but not all whitespace.
    if (s.startsWith("+")) s = s.slice(1);

    const n = parseFloat(s);
    if (!Number.isFinite(n)) return null;
    return negative ? -n : n;
  }
}
