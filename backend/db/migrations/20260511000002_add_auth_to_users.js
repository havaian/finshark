// backend/migrations/20260511000002_add_auth_to_users.js
// Adds password/profile/streak columns to users and the refresh_tokens table.
// (password_hash is later dropped by the google_auth migration. Kept here so
// migrating from scratch produces the same intermediate schema as the original
// SQL series — easier to reason about if you ever roll back partially.)

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns('users', {
    password_hash: { type: 'text', notNull: true },
    display_name: { type: 'text', notNull: true },
    streak_count: { type: 'integer', notNull: true, default: 0 },
    xp: { type: 'integer', notNull: true, default: 0 },
    level: { type: 'integer', notNull: true, default: 1 },
    last_active_date: { type: 'date' },
  });

  // Refresh tokens are stored hashed so they can be revoked.
  // One row per active refresh token; rotated on each /auth/refresh call.
  pgm.createTable('refresh_tokens', {
    id: { type: 'bigserial', primaryKey: true },
    user_id: { type: 'bigint', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    token_hash: { type: 'text', notNull: true, unique: true },
    expires_at: { type: 'timestamptz', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    revoked_at: { type: 'timestamptz' },
  });

  pgm.createIndex('refresh_tokens', 'user_id', { name: 'idx_refresh_tokens_user_id' });
  pgm.createIndex('refresh_tokens', 'expires_at', { name: 'idx_refresh_tokens_expires_at' });
};

exports.down = (pgm) => {
  pgm.dropTable('refresh_tokens');
  pgm.dropColumns('users', [
    'last_active_date',
    'level',
    'xp',
    'streak_count',
    'display_name',
    'password_hash',
  ]);
};