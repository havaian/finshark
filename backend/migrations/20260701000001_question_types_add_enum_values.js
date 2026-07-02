// New objective question types - STAGE 1 of 2 (enum values only).
//
// Adds three ACCA objective formats to the question_type enum:
//   - mcq_multi   : multiple-response MCQ (more than one correct option).
//   - true_false  : classify 1-4 short statements, each with a two/three-way
//                   label (Yes/No, True/False, Provision/Accrual, ...).
//   - matching    : choose a value for each row from a shared list.
// All three are deterministically auto-markable (see grader.service) and are
// exactly the formats ACCA CBE uses alongside mcq / number_entry.
//
// WHY SPLIT (same reasoning as 20260515000001_number_entry_questions):
//   Postgres forbids using a newly-added enum value inside the same
//   transaction that added it. node-pg-migrate wraps each migration in a
//   transaction by default, so the ADD VALUEs must run on their own with
//   disableTransaction so they commit before the next migration (which adds
//   the columns + the CHECK constraint referencing these values) runs.
//
// DOWN:
//   Postgres has no ALTER TYPE ... DROP VALUE, so this down is a no-op for the
//   enum (the values remain, exactly like number_entry did). The paired
//   constraint migration's down restores the constraint to mcq + number_entry
//   only, so the extra values are simply unreferenced. A clean rollback that
//   removes the values needs a full enum rebuild / DB re-init.

exports.shorthands = undefined;

// Run outside a transaction so each ADD VALUE commits before the next
// migration uses these values as literals. This is the required flag.
exports.up = (pgm) => {
  pgm.addTypeValue('question_type', 'mcq_multi', { ifNotExists: true });
  pgm.addTypeValue('question_type', 'true_false', { ifNotExists: true });
  pgm.addTypeValue('question_type', 'matching', { ifNotExists: true });
};
exports.up.disableTransaction = true;

exports.down = (pgm) => {
  // NOTE: the three values remain in the enum (Postgres limitation).
  // No-op intentionally - see header comment.
};
