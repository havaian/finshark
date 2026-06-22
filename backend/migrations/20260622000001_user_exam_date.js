// users.exam_date - the date the user is sitting their next exam.
//
// Captured (optionally) during onboarding and editable from Settings. Drives
// the dashboard countdown ("F2 exam in 47 days") and is the data hook for any
// future exam-aware pacing. NULL = the user hasn't told us a date (e.g. they
// haven't booked yet).
//
// Plain nullable `date` column - no enum, so this is a single ordinary
// migration. We intentionally DO NOT add a "must be in the future" CHECK:
// Postgres rejects a CHECK that references NOW()/CURRENT_DATE as non-immutable,
// so the today-or-later + sane-upper-bound rule lives in the app layer
// (src/users/exam-date.util.ts, used by both the onboarding and preferences
// paths). Storing a past date is harmless at the DB level - the UI just shows
// a "passed" state and prompts the user to update it.
//
// REVERSIBILITY: fully reversible. down() drops the column.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns('users', {
    exam_date: { type: 'date' }, // nullable; NULL = no exam date set
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('users', ['exam_date']);
};
