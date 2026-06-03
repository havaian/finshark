// Retire the short_answer question format - STAGE 2b: drop the enum value.
//
// CONTEXT: STAGE 2a (20260524000002) converted any remaining short_answer rows
//   to number_entry, so no row carries 'short_answer' anymore. Now we remove
//   the value from the question_type enum entirely.
//
// WHY A FULL TYPE REBUILD (not "DROP VALUE"):
//   Postgres has no "ALTER TYPE ... DROP VALUE". The supported way to remove an
//   enum value is to build a new enum type with the values you want and migrate
//   the column onto it. The USING cast below will ERROR if any row still holds
//   'short_answer' - which is exactly why STAGE 2a must run first. That error,
//   if it ever fired, would be a safety feature, not a bug.
//
// STEPS (up):
//   1. Drop the CHECK constraint that names short_answer
//      (chk_question_type_options from 20260515000007).
//   2. Rename the existing enum:  question_type -> question_type_old.
//   3. Create the new enum:       question_type = ('mcq','number_entry').
//   4. Rewrite the column:        ALTER COLUMN type TYPE question_type
//                                 USING type::text::question_type.
//      (Defaults: the column has no enum default to worry about - difficulty
//       has a default, type does not - so no default needs dropping/re-adding.)
//   5. Drop question_type_old.
//   6. Re-add the CHECK constraint, now covering only mcq + number_entry.
//
// TRANSACTION NOTE: unlike ADD VALUE, a full type swap is safe inside a
//   transaction, so this migration runs transactionally (no disableTransaction).
//   The new enum value is never used as a literal before commit - the column
//   cast goes through ::text, and the CHECK uses ::text comparisons.
//
// IMPLICATIONS:
//   - Any application code, view, or function that still references the
//     'short_answer' enum literal at the DB level would break. The app layer
//     has already dropped short_answer from QuestionType / QUESTION_TYPES, and
//     all CHECKs here use type::text, so there are no such literal references.
//   - This is destructive to the enum definition. The down migration recreates
//     the enum WITH short_answer so the schema shape is restored, but it cannot
//     resurrect which rows were originally short_answer (see STAGE 2a).
//
// DOWN: reverse the swap, recreating question_type as
//   ('mcq','short_answer','number_entry') and restoring the prior CHECK.

exports.shorthands = undefined;

exports.up = (pgm) => {
  // 1. Remove the constraint that references short_answer.
  pgm.dropConstraint('questions', 'chk_question_type_options');

  // 2-5. Rebuild the enum without short_answer and migrate the column onto it.
  pgm.sql(`ALTER TYPE question_type RENAME TO question_type_old`);
  pgm.sql(`CREATE TYPE question_type AS ENUM ('mcq', 'number_entry')`);
  pgm.sql(`
    ALTER TABLE questions
      ALTER COLUMN type TYPE question_type
      USING type::text::question_type
  `);
  pgm.sql(`DROP TYPE question_type_old`);

  // 6. Re-add the options constraint, now covering only the surviving types.
  //    type::text comparisons kept for consistency with prior migrations.
  pgm.addConstraint('questions', 'chk_question_type_options', {
    check: `
      (type::text = 'mcq'          AND options IS NOT NULL AND jsonb_typeof(options) = 'array')
      OR
      (type::text = 'number_entry' AND options IS NULL)
    `,
  });
};

exports.down = (pgm) => {
  // Reverse: recreate the enum WITH short_answer and restore the prior CHECK.
  pgm.dropConstraint('questions', 'chk_question_type_options');

  pgm.sql(`ALTER TYPE question_type RENAME TO question_type_old`);
  pgm.sql(
    `CREATE TYPE question_type AS ENUM ('mcq', 'short_answer', 'number_entry')`
  );
  pgm.sql(`
    ALTER TABLE questions
      ALTER COLUMN type TYPE question_type
      USING type::text::question_type
  `);
  pgm.sql(`DROP TYPE question_type_old`);

  // Restore the constraint shape that existed after 20260515000007.
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
