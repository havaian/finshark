// backend/migrations/20260511000001_create_users.js
// Creates the users table. citext is required for case-insensitive email uniqueness.
// If the DB role lacks CREATE EXTENSION privileges, run once as superuser:
//   CREATE EXTENSION IF NOT EXISTS citext;
// and remove the pgm.sql line below before re-running.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql('CREATE EXTENSION IF NOT EXISTS citext');

  pgm.createTable('users', {
    id: { type: 'bigserial', primaryKey: true },
    email: { type: 'citext', notNull: true, unique: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('users');
  // Deliberately do NOT drop the citext extension; other schemas may use it.
};