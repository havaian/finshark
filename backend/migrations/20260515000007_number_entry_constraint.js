// Number-entry question type — STAGE 2 of 2.
//
// See 20260515000001_number_entry_questions.js for the why-this-is-split
// explanation. By the time this migration runs, the 'number_entry' value
// has already been committed to the question_type enum, so we can safely
// reference it in a CHECK constraint inside a normal transaction.
//
// Changes:
//  - Add acceptable_tolerance column (REAL, nullable). When set, answers
//    within ±tolerance grade as correct; NULL = exact match required.
//  - Replace chk_mcq_options with chk_question_type_options, which permits
//    number_entry rows (must have no options, same as short_answer).
//
// Down migration restores the old constraint and drops the column. The enum
// value itself stays — see stage 1.

exports.shorthands = undefined;

exports.up = (pgm) => {
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
};
