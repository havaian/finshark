// users.timezone — IANA timezone name (e.g. 'Asia/Tashkent', 'Europe/London').
// Needed by the billing layer to refill free-tier heart pools at the user's
// local midnight. reminder_hour_utc remains the reminder preference; this
// column is the user's actual timezone for all "what is today for this user"
// calculations.
//
// Default 'Asia/Tashkent' matches the UZ-focused launch market. Existing rows
// are backfilled to the same value; users can change theirs from settings /
// onboarding later. The CHECK keeps obviously-bogus values out at the DB layer
// — full IANA validation lives in the app (Intl.DateTimeFormat will throw on
// an invalid name, which is the canonical runtime check).

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns('users', {
    timezone: { type: 'text', notNull: true, default: 'Asia/Tashkent' },
  });
  pgm.addConstraint('users', 'chk_users_timezone_nonempty', {
    check: `LENGTH(timezone) > 0 AND timezone NOT LIKE '% %'`,
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('users', 'chk_users_timezone_nonempty');
  pgm.dropColumns('users', ['timezone']);
};
