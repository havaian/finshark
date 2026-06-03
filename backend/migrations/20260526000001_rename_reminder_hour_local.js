// Reminder hour is now interpreted in the user's timezone, not UTC. The
// column was originally added as `reminder_hour_utc` (see
// 20260513000004_user_preferences.js) when reminders fired at a single
// global UTC hour. Per-user `timezone` (20260525000003_add_user_timezone.js)
// makes the UTC interpretation incorrect - a user in Asia/Tashkent who set
// "18:00" expected 18:00 local, not 18:00 UTC (= 23:00 local).
//
// We rename the column and its CHECK constraint to match the new semantics.
// Existing values stay as-is: a row with 18 now means 18 local, which is
// what users intended in the first place. Anyone who was relying on the
// old UTC interpretation is being explicitly opted into the local one.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.dropConstraint('users', 'chk_reminder_hour_range');
  pgm.renameColumn('users', 'reminder_hour_utc', 'reminder_hour_local');
  pgm.addConstraint('users', 'chk_reminder_hour_range', {
    check: 'reminder_hour_local BETWEEN 0 AND 23',
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('users', 'chk_reminder_hour_range');
  pgm.renameColumn('users', 'reminder_hour_local', 'reminder_hour_utc');
  pgm.addConstraint('users', 'chk_reminder_hour_range', {
    check: 'reminder_hour_utc BETWEEN 0 AND 23',
  });
};
