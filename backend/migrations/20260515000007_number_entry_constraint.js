// Number-entry question type — STAGE 2 of 2.
//
// See 20260515000001_number_entry_questions.js for STAGE 1 (the enum value
// extension itself).
//
// IMPORTANT — Postgres enum-in-transaction rule:
//   node-pg-migrate batches multiple migrations into ONE outer transaction
//   when you run `migrate:up`. Even though STAGE 1 has disableTransaction=true,
//   the new enum value is NOT yet committed by the time the runner reaches
//   this migration in the same batch — Postgres rejects any constraint that
//   names the new value as a literal.
//
//   Workaround: cast `type` to text in the CHECK. `type::text = 'number_entry'`
//   compares against a plain string literal, not an enum literal, so it
//   bypasses Postgres's "new enum value must be committed" safety check.
//   The constraint still enforces exactly what we want — only the literal-vs-
//   typed comparison changes.
//
// Changes:
//  - Add acceptable_tolerance column (REAL, nullable). When set, answers
//    within ±tolerance grade as correct; NULL = exact match required.
//  - Replace chk_mcq_options with chk_question_type_options, which permits
//    number_entry rows (must have no options, same as short_answer).
//
// Down migration restores the old constraint and drops the column. The enum
// value itself stays — see STAGE 1.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns('questions', {
    // Absolute tolerance for number_entry matching. NULL = exact match required.
    // Example: correct_answer_en='12.5', tolerance=0.05 → accepts 12.45..12.55.
    acceptable_tolerance: { type: 'real' },
  });

  // Use type::text comparisons so the constraint doesn't reference enum
  // literals — see header comment for the Postgres reasoning.
  pgm.dropConstraint('questions', 'chk_mcq_options');
  pgm.addConstraint('questions', 'chk_question_type_options', {
    check: `
      (type::text = 'mcq'          AND options IS NOT NULL AND jsonb_typeof(options) = 'array')
      OR
      (type::text = 'short_answer' AND options IS NULL)
      OR
      (type::text = 'number_entry' AND options IS NULL)
    `,
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('questions', 'chk_question_type_options');
  pgm.addConstraint('questions', 'chk_mcq_options', {
    check: `
      (type::text = 'mcq'          AND options IS NOT NULL AND jsonb_typeof(options) = 'array')
      OR
      (type::text = 'short_answer' AND options IS NULL)
    `,
  });
  pgm.dropColumns('questions', ['acceptable_tolerance']);
};
