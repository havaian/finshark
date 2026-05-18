// 2FA TOTP — admin-only second factor on top of Google OAuth.
//
// Design:
//   users.totp_secret           — base32-encoded TOTP secret. NULL = not
//                                 enrolled. Set during setup-verify, cleared
//                                 by disable. We store it in plaintext: it's
//                                 already a shared secret with the user's
//                                 authenticator app, and encrypting it at
//                                 rest would just shift the problem to "where
//                                 do we store the key" without raising the
//                                 bar (the DB compromise that exposes this
//                                 column would expose any decryption key
//                                 living in env/code too).
//
//   users.totp_enrolled_at      — timestamp of successful setup-verify. NULL
//                                 mirrors totp_secret IS NULL. Stored
//                                 separately for audit ("admin enabled 2FA
//                                 on date X") and for ordering admin lists.
//
//   user_totp_recovery_codes    — separate table because (a) array-of-text
//                                 makes per-code "mark used" updates clumsy
//                                 with postgres.js, and (b) we want UNIQUE
//                                 on the hash to make collision detection
//                                 cheap. One row per code; used_at flips
//                                 from NULL when consumed. We hash the codes
//                                 with scrypt (Node built-in, no native dep)
//                                 — they're low-entropy enough that they
//                                 need a slow KDF.
//
// Enforcement story (lives in auth.service.ts, not this migration):
//   - Google callback returns the user. If is_admin AND totp_secret IS NOT
//     NULL, we DON'T issue regular tokens. Instead we mint a short-lived
//     "pending 2FA" JWT (separate secret, 5min TTL, marked typ='pending_2fa')
//     and redirect the frontend to /2fa-verify.
//   - POST /auth/2fa-verify takes that pending token + a 6-digit code (or
//     a recovery code) and issues real access/refresh tokens.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns('users', {
    // Base32 TOTP secret. otplib generates these; we store as-is.
    totp_secret:       { type: 'text', notNull: false },
    // Set on first successful TOTP verification during setup.
    totp_enrolled_at:  { type: 'timestamptz', notNull: false },
  });

  pgm.createTable('user_totp_recovery_codes', {
    id: { type: 'bigserial', primaryKey: true },
    user_id: {
      type: 'bigint',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    // scrypt hash of the code in the format "salt:derivedKey" (both hex).
    // We store the salt inline rather than in a separate column because the
    // verifier reads them as a unit and never separately.
    code_hash:    { type: 'text', notNull: true },
    used_at:      { type: 'timestamptz', notNull: false },
    created_at:   { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });

  // UNIQUE on (user_id, code_hash) so the verifier can probe each code by
  // hash without scanning. Also makes "duplicate code generated" detection
  // cheap during setup (vanishingly unlikely with 80 bits of entropy, but
  // the constraint is free).
  pgm.addConstraint('user_totp_recovery_codes', 'uq_user_totp_recovery_code_hash', {
    unique: ['user_id', 'code_hash'],
  });

  // Fast path for "all unused codes for this user" during verification.
  pgm.createIndex('user_totp_recovery_codes', ['user_id', 'used_at'], {
    name: 'idx_user_totp_recovery_codes_user_unused',
    where: 'used_at IS NULL',
  });
};

exports.down = (pgm) => {
  pgm.dropTable('user_totp_recovery_codes');
  pgm.dropColumns('users', ['totp_secret', 'totp_enrolled_at']);
};
