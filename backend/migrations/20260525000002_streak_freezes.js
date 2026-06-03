// Add streak_freezes_remaining to users.
//
// CONTEXT: Streaks today are brittle - a single missed day vapourises any
//   accumulated streak, regardless of how long the run was. For the target
//   audience (working professionals studying for ACCA) a single business
//   trip is enough to break weeks of progress, which deflates the mechanic.
//
//   This adds a Duolingo-style "streak freeze" stockpile: at every 14-day
//   streak milestone the user is granted +1 freeze (capped at MAX_FREEZES,
//   defined in srs.ts), and a single 1-day gap consumes one freeze instead
//   of resetting the streak. Consumption + grant logic lives in srs.ts.
//
// SCHEMA: one column. We do NOT track per-event freeze history at the DB
//   level - the count is the only thing the runtime cares about, and any
//   audit need can be reconstructed from lesson_sessions.completed_at +
//   last_active_date deltas if it ever matters.
//
// DEFAULT: 0. Existing users start with no freezes; they'll earn their
//   first one the next time they hit a 14-day streak. We deliberately do
//   NOT seed a starter freeze to all existing users - that would suddenly
//   change behaviour for users whose streak is mid-flight and could mask a
//   reset that the user expected to happen.
//
// REVERSAL: down drops the column. No data is needed by other tables;
//   nothing FKs against it.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumn('users', {
    streak_freezes_remaining: {
      type: 'integer',
      notNull: true,
      default: 0,
    },
  });

  // Defence in depth: a CHECK so the runtime can't accidentally write a
  // negative value (which would silently extend streaks if the freeze
  // consumption logic ever mishandled the bound).
  pgm.addConstraint('users', 'chk_streak_freezes_nonneg', {
    check: 'streak_freezes_remaining >= 0',
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('users', 'chk_streak_freezes_nonneg');
  pgm.dropColumn('users', 'streak_freezes_remaining');
};
