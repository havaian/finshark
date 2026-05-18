// Number-entry question type — STAGE 1 of 2.
//
// Postgres won't let you use a newly-added enum value inside the same
// transaction that added it ("unsafe use of new value ... New enum values
// must be committed before they can be used"). node-pg-migrate runs each
// migration in a transaction by default, so we MUST split:
//
//   - This migration: only ALTER TYPE ... ADD VALUE, with disableTransaction
//     so the new value is committed immediately.
//   - The next migration (20260515000001b_number_entry_constraint.js):
//     adds the column and the CHECK constraint that references the new
//     enum value.
//
// Down migration:
//   - You cannot DROP a value from a Postgres enum once added. The down path
//     here is a no-op for the enum. Anyone who needs a clean rollback should
//     re-init the DB.

exports.shorthands = undefined;

// Run this migration outside a transaction so the ADD VALUE commits before
// the next migration tries to use it. This is the magic flag.
exports.up = (pgm) => {
  pgm.addTypeValue('question_type', 'number_entry', { ifNotExists: true });
};
exports.up.disableTransaction = true;

exports.down = (pgm) => {
  // NOTE: 'number_entry' value remains in the enum (Postgres limitation).
  // No-op intentionally — see header comment.
};
