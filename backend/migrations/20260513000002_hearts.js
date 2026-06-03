// Hearts - per-session state. Spec: 3 hearts at start, -1 per wrong,
// session auto-ends at 0. We also flag the reason for completion so the
// frontend can show an "out of hearts" finale instead of the normal one.
//
// Defaults: hearts_remaining=3 (matches HEARTS_PER_SESSION in the service),
// ended_out_of_hearts=false. Both are NOT NULL so we can read without coalescing.
// Existing rows (already completed sessions) backfill to hearts_remaining=0 and
// ended_out_of_hearts=false - historical sessions never had hearts to begin with,
// so 0 reflects "no hearts available" rather than "lost all hearts".

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns('lesson_sessions', {
    hearts_remaining: { type: 'integer', notNull: true, default: 3 },
    ended_out_of_hearts: { type: 'boolean', notNull: true, default: false },
  });
  // Sanity check: 0..3 is the valid range. The service enforces decrements,
  // but a CHECK makes accidental rogue updates fail loudly.
  pgm.addConstraint('lesson_sessions', 'chk_hearts_range', {
    check: 'hearts_remaining BETWEEN 0 AND 3',
  });

  // Backfill: zero out hearts on already-existing rows. Their sessions are
  // either completed (so hearts don't matter) or in-flight from before this
  // migration. The latter is the weird case - they'll see "0 hearts left" and
  // be forced to end on the next wrong answer. That's an acceptable transition
  // for the tiny dev/staging population.
  pgm.sql(`UPDATE lesson_sessions SET hearts_remaining = 0 WHERE completed_at IS NOT NULL`);
};

exports.down = (pgm) => {
  pgm.dropConstraint('lesson_sessions', 'chk_hearts_range');
  pgm.dropColumns('lesson_sessions', ['hearts_remaining', 'ended_out_of_hearts']);
};
