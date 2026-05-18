// Number-entry question type — for F3-style "calculate the closing balance"
// questions where the user types a numeric answer.
//
// Three changes:
//  1) Extend the question_type enum with 'number_entry'.
//  2) Add acceptable_tolerance (REAL, nullable) — when set, an answer within
//     ±tolerance of correct_answer_en (parsed as a number) grades as correct.
//     NULL = exact match required.
//  3) Update chk_mcq_options to allow number_entry rows (must have no options
//     array, same as short_answer).
//
// Down migration:
//  - Restoring the old constraint is straightforward, but you cannot DROP a
//    value from a Postgres enum once added. The down path leaves 'number_entry'
//    in the enum and just unsets the column + constraint. Anyone who was using
//    this migration in dev should re-init their DB if they need a fully clean
//    rollback.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addTypeValue('question_type', 'number_entry', { ifNotExists: true });

  pgm.addColumns('questions', {
    // Absolute tolerance for number_entry matching. NULL = exact match required.
    // Example: correct_answer_en='12.5', tolerance=0.05 → accepts 12.45..12.55.
    acceptable_tolerance: { type: 'real' },
  });

  // Replace the constraint to cover the new type. number_entry behaves like
  // short_answer w.r.t. options (must be NULL) but stores its canonical value
  // as a numeric string in correct_answer_en. We don't validate "is this a
  // valid number?" at the DB layer — the app validates on insert/update.
  pgm.dropConstraint('questions', 'chk_mcq_options');
  pgm.addConstraint('questions', 'chk_question_type_options', {
    check: `
      (type = 'mcq'          AND options IS NOT NULL AND jsonb_typeof(options) = 'array')
      OR
      (type = 'short_answer' AND options IS NULL)
      OR
      (type = 'number_entry' AND options IS NULL)
    `,
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('questions', 'chk_question_type_options');
  pgm.addConstraint('questions', 'chk_mcq_options', {
    check: `
      (type = 'mcq'          AND options IS NOT NULL AND jsonb_typeof(options) = 'array')
      OR
      (type = 'short_answer' AND options IS NULL)
    `,
  });
  pgm.dropColumns('questions', ['acceptable_tolerance']);
  // NOTE: 'number_entry' value remains in the enum (Postgres limitation).
};
