// backend/migrations/20260511000004_add_is_admin.js
// Adds is_admin flag to users.
// After registering yourself, run manually:
//   UPDATE users SET is_admin = TRUE WHERE email = 'you@example.com';

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns('users', {
    is_admin: { type: 'boolean', notNull: true, default: false },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('users', ['is_admin']);
};