// Per-user lesson/notification preferences. All have sensible defaults so
// existing users get reasonable behaviour out of the box.
//
// reminder_hour_utc: 0..23. Defaults to 18 to match the historical default
// REMINDER_CRON of "0 18 * * *". The cron now reads each user's preferred
// hour and only emails users whose hour has passed for today.
//
// preferred_difficulty: NULL = "auto" (use the level-based heuristic).
// Concrete values override the heuristic for new questions pulled from weak LOs.
//
// lesson_size: 3..10 — small bounds so we don't burn through the queue or make
// lessons too tiny to feel meaningful. Default 5 matches the historical hard-coded value.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns('users', {
    reminder_hour_utc: { type: 'integer', notNull: true, default: 18 },
    preferred_difficulty: { type: 'question_difficulty' }, // nullable = auto
    lesson_size: { type: 'integer', notNull: true, default: 5 },
  });
  pgm.addConstraint('users', 'chk_reminder_hour_range', {
    check: 'reminder_hour_utc BETWEEN 0 AND 23',
  });
  pgm.addConstraint('users', 'chk_lesson_size_range', {
    check: 'lesson_size BETWEEN 3 AND 10',
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('users', 'chk_lesson_size_range');
  pgm.dropConstraint('users', 'chk_reminder_hour_range');
  pgm.dropColumns('users', [
    'reminder_hour_utc',
    'preferred_difficulty',
    'lesson_size',
  ]);
};
