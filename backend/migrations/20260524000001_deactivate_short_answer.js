// Retire the short_answer question format from circulation — STAGE 1 of 2.
//
// WHY (see "Finshark — Spec: Deterministic Short-Answer Grading"):
//   short_answer is a free-text auto-marked format that does NOT exist on the
//   real ACCA exam. ACCA auto-marks only objective formats (MCQ, multiple-
//   response, matching, numeric fill-in-the-blank); written prose is human-
//   marked. The format produced the "correct answer marked wrong" trust bug
//   (e.g. "Zero based budgeting"), and the grader has already been locked to
//   deterministic types only (mcq, number_entry) — so any short_answer reaching
//   the grader is now marked incorrect. Leaving these rows ACTIVE would surface
//   questions that can never be graded correctly.
//
// WHAT THIS MIGRATION DOES (and deliberately does NOT do):
//   - Sets is_active = FALSE for every short_answer row. Lesson and mock
//     selection both filter on is_active = TRUE (user-question-state.repository,
//     lessons.service), so this immediately removes them from circulation
//     without deleting any data. Fully reversible.
//   - It does NOT drop the 'short_answer' enum value, and does NOT delete or
//     convert any rows. That is STAGE 2, gated behind the content audit
//     (reclassify concept-recall items to MCQ; fold open definitions into LO
//     theory). Dropping the enum value while rows still use it would fail.
//
// ENUM-IN-CHECK CAVEAT: we compare type::text = 'short_answer' (a plain string
// literal) rather than the enum literal, matching the convention established in
// 20260515000007_number_entry_constraint.js. Not strictly required for an
// UPDATE, but kept for consistency and to avoid any batched-transaction enum
// surprises.
//
// DOWN: reactivates only the rows this migration deactivated. NOTE: because we
// can't perfectly distinguish rows that were already inactive before this ran,
// the down migration reactivates ALL short_answer rows. If some short_answer
// questions were intentionally inactive beforehand, re-deactivate them manually
// after rolling back. (In the current seed all short_answers are active, so
// this is exact in practice.)

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    UPDATE questions
    SET is_active = FALSE,
        updated_at = NOW()
    WHERE type::text = 'short_answer'
      AND is_active = TRUE
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    UPDATE questions
    SET is_active = TRUE,
        updated_at = NOW()
    WHERE type::text = 'short_answer'
      AND is_active = FALSE
  `);
};
