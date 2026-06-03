// Retire the short_answer question format - STAGE 2a of the enum drop.
//
// CONTEXT (continues 20260524000001_deactivate_short_answer.js):
//   All short_answer CONTENT in the seed has been rewritten as mcq/number_entry,
//   so a freshly-seeded DB has zero short_answer rows. But a DB that was seeded
//   BEFORE this work still holds the old short_answer rows (now is_active=FALSE
//   from STAGE 1). Before we can remove 'short_answer' from the question_type
//   enum (STAGE 2b), no row may still carry that value.
//
// WHY CONVERT INSTEAD OF DELETE:
//   attempts.question_id and lesson_session_questions.question_id are FKs with
//   onDelete: 'RESTRICT' (see 20260511000003_content_and_srs.js). Any legacy
//   short_answer question that a user has ever attempted CANNOT be deleted -
//   the RESTRICT FK would abort the migration. Deleting would also destroy
//   historical attempt/answer records. So we CONVERT the leftover rows to a
//   surviving enum value instead, preserving all history and FKs intact.
//
// WHAT THIS DOES:
//   Re-labels any remaining short_answer rows as 'number_entry'. number_entry
//   is chosen (not mcq) because the chk_question_type_options constraint allows
//   number_entry to have NULL options - exactly the shape these rows already
//   have. mcq would require a non-null options array these rows don't have, so
//   it would violate the constraint. The rows stay is_active=FALSE (set in
//   STAGE 1), so this relabelling never surfaces them in lessons or mocks, and
//   the deterministic grader is never asked to grade them.
//
//   This is intentionally conservative: it does not touch prompt/answer text,
//   does not reactivate anything, and only affects rows that are still
//   short_answer. On a freshly-seeded DB it updates zero rows (a safe no-op).
//
// IMPLICATIONS / THINGS TO KNOW:
//   - These converted rows now have type=number_entry but their correct_answer
//     is free text, not numeric. That is harmless ONLY because they remain
//     inactive. If anyone manually reactivates one, the grader would try to
//     parse its answer as a number and (correctly) fail it closed. Do not
//     reactivate converted legacy rows; recreate them as real questions instead.
//   - type::text comparison is used (not an enum literal) for consistency with
//     20260515000007 and to avoid batched-transaction enum-literal issues.
//
// DOWN: there is no reliable way to tell which number_entry rows were once
//   short_answer (the original type is not retained). The down migration is a
//   no-op; rolling back STAGE 2b restores the enum value, but these specific
//   rows stay labelled number_entry. A clean rollback needs a DB re-init/re-seed.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    UPDATE questions
    SET type = 'number_entry',
        options = NULL,
        updated_at = NOW()
    WHERE type::text = 'short_answer'
  `);
};

exports.down = () => {
  // Intentional no-op - original type not retained. See header comment.
};
