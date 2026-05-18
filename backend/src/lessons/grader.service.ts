import { Injectable } from "@nestjs/common";
import type { QuestionRow, Lang } from "../content/content.types";
import { LlmGraderService } from "../llm/llm-grader.service";

export interface GradeResult {
  was_correct: boolean;
  // Stored in attempts.llm_grade_json. Null for MCQ (no provider involved).
  // For short_answer this is the structured verdict from LlmGraderService.
  llm_grade_json: unknown | null;
}

@Injectable()
export class GraderService {
  constructor(private readonly llm: LlmGraderService) {}

  // user_id is required so LLM grading can enforce its per-user daily cap.
  // lang determines which language's correct_answer / prompt we compare against
  // for short-answer grading. MCQ and number_entry are language-neutral
  // (we compare option keys / numeric values).
  async grade(
    question: QuestionRow,
    user_id: string,
    user_answer: string,
    lang: Lang
  ): Promise<GradeResult> {
    if (question.type === "mcq") {
      return this.gradeMcq(question, user_answer);
    }
    if (question.type === "number_entry") {
      const numeric = this.gradeNumber(question, user_answer);
      // If the user submitted gibberish that didn't parse, fall through to the
      // LLM path so the verdict is reasoned about (and may catch "12 (rounded)"
      // or similar near-valid inputs). Cheap because most number_entry answers
      // parse cleanly on the first try.
      if (numeric !== null) return numeric;
    }
    const verdict = await this.llm.grade(question, user_id, user_answer, lang);
    return {
      was_correct: verdict.was_correct,
      llm_grade_json: verdict.llm_grade_json,
    };
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
