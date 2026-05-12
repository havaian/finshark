// backend/migrations/20260512000001_google_auth.js
// Hard cutover to Google-only auth.
// Drops password_hash, adds google_sub (Google's stable user identifier from the
// "sub" claim in their ID token). google_sub NEVER changes for a given Google
// account even if email changes, so it's the right join key. Email is kept on
// the row (Google gives it to us) but is treated as derived data, not the auth key.
//
// Down restores password_hash as NULLABLE — re-adding it NOT NULL would fail on
// any existing rows. If you genuinely need to roll back you'll need to populate
// it out-of-band.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.dropColumns('users', ['password_hash']);
  pgm.addColumns('users', {
    google_sub: { type: 'text', notNull: true, unique: true },
  });
  // refresh_tokens table is unchanged; it's keyed by user_id, not auth method.
};

exports.down = (pgm) => {
  pgm.addColumns('users', {
    password_hash: { type: 'text' },                     // nullable on rollback (see header)
  });
  pgm.dropColumns('users', ['google_sub']);
};