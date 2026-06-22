import { BadRequestException } from "@nestjs/common";

// Shared exam_date validation + normalization for the two write paths that
// accept it (onboarding completion and the /me/preferences patch). Keeping it
// in one place stops the two paths from drifting on the accepted range.
//
// Semantics of the three input states (mirrors the optional+nullable DTO
// fields elsewhere):
//   undefined -> caller passes undefined through (leave the column alone)
//   null      -> caller clears the column (user removed their exam date)
//   string    -> must be a calendar date 'YYYY-MM-DD', today-or-later and
//                within MAX_YEARS_AHEAD; returned normalized to 'YYYY-MM-DD'
//
// "Today" is computed in UTC. Exam dates are coarse (day granularity), so the
// timezone boundary doesn't matter in practice and we avoid threading the
// user's IANA zone into this check.

const MAX_YEARS_AHEAD = 3;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

// Today's date as 'YYYY-MM-DD' in UTC.
function todayUtcISO(): string {
  return new Date().toISOString().slice(0, 10);
}

// Validate + normalize an exam_date input. Throws BadRequestException on a
// malformed or out-of-range date. Passes undefined/null through unchanged so
// the repository's "undefined = leave alone, null = clear" contract holds.
export function normalizeExamDate(
  input: string | null | undefined
): string | null | undefined {
  if (input === undefined) return undefined;
  if (input === null) return null;

  if (typeof input !== "string" || !DATE_RE.test(input)) {
    throw new BadRequestException(
      "exam_date must be a calendar date in YYYY-MM-DD format"
    );
  }

  // Parse as a UTC calendar date. Appending T00:00:00Z avoids local-tz drift.
  const parsed = new Date(`${input}T00:00:00Z`);
  if (Number.isNaN(parsed.getTime())) {
    throw new BadRequestException("exam_date is not a valid date");
  }

  // Round-trip check rejects impossible dates that Date silently rolls over
  // (e.g. 2026-02-31 -> 2026-03-03).
  if (parsed.toISOString().slice(0, 10) !== input) {
    throw new BadRequestException("exam_date is not a valid calendar date");
  }

  const today = todayUtcISO();
  if (input < today) {
    throw new BadRequestException("exam_date cannot be in the past");
  }

  const maxDate = new Date(`${today}T00:00:00Z`);
  maxDate.setUTCFullYear(maxDate.getUTCFullYear() + MAX_YEARS_AHEAD);
  if (input > maxDate.toISOString().slice(0, 10)) {
    throw new BadRequestException(
      `exam_date cannot be more than ${MAX_YEARS_AHEAD} years away`
    );
  }

  return input;
}
