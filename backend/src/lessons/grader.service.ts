import { Injectable } from "@nestjs/common";
import type { QuestionRow, Lang } from "../content/content.types";

export interface GradeResult {
  was_correct: boolean;
  // Stored in attempts.llm_grade_json. Always null now — grading is fully
  // deterministic (mcq / number_entry) and no LLM is involved in the grading
  // path. The column is retained for historical rows and a possible future
  // authoring-side use; the grader never populates it.
  llm_grade_json: unknown | null;
}

// Grading is locked to DETERMINISTIC question types only (mcq, number_entry).
// See the Grading Spec: ACCA auto-marks only objective formats (MCQ,
// multiple-response, matching, numeric fill-in-the-blank). Free-text
// short_answer is not a real auto-marked exam format, so it is being retired
// from the question bank; the grader no longer has a code path for it. No fuzzy
// string matching, no synonym sets, and no LLM in the grading path — that is
// what produced the "Zero based budgeting marked wrong" trust bug.

@Injectable()
export class GraderService {
  // No dependencies: grading is self-contained and deterministic. The
  // LlmGraderService is intentionally NOT injected here anymore — it stays
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
    if (question.type === "number_entry") {
      const numeric = this.gradeNumber(question, user_answer);
      // Parse failure (gibberish / unparseable input) is simply WRONG. We do
      // NOT fall through to any LLM or fuzzy path — there is none. Returning
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
    // and trim — admins sometimes save "A " with trailing space.
    const expected = question.correct_answer_en.trim().toUpperCase();
    const actual = user_answer.trim().toUpperCase();
    return { was_correct: expected === actual, llm_grade_json: null };
  }

  // number_entry grader. Returns null on parse failure (caller falls through
  // to LLM path). Tolerance is taken from question.acceptable_tolerance —
  // NULL means exact match required.
  //
  // Normalisation handled:
  //  - thousands separators ("1,000" → 1000) — strip commas
  //  - leading/trailing whitespace
  //  - both "." and "," as decimal mark — but only when unambiguous (one of
  //    them present; if both are present, comma is thousands sep and dot is
  //    decimal — standard English convention.)
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
      // Only comma — treat as decimal mark (single comma) or thousands sep
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
