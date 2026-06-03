// 2FA hardening - two additions on top of 20260519000002_totp_2fa.js:
//
//   user_totp_failed_attempts - per-user lockout. We log every failed
//     verify attempt with a timestamp. The verifier counts recent failures
//     in a sliding window and refuses to proceed once a threshold is hit.
//     Lockout is time-based (not row-counted), so it auto-expires without
//     a cron job. Successful verify clears the table for that user.
//
//     Why per-user (not per-IP) on top of the existing throttle? The
//     ThrottlerModule guards against scripted brute-force from a single
//     IP. A distributed attack across many IPs would slip past that. The
//     per-user lockout caps the total attack rate against ONE account at
//     N attempts per window regardless of source IP.
//
//   user_totp_audit_log - append-only audit of 2FA state changes
//     (enrolled, disabled, regenerated codes, recovery code consumed,
//     locked-out). We don't audit every successful TOTP verify - that
//     would be too noisy and the refresh_tokens table already records
//     login activity. We DO audit security-relevant transitions.
//
//     Indexed on (user_id, created_at DESC) so per-user history reads
//     stay fast as the table grows.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('user_totp_failed_attempts', {
    id: { type: 'bigserial', primaryKey: true },
    user_id: {
      type: 'bigint',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    // Source IP, best-effort - extracted via req.ip in the controller. NULL
    // when not available (rare). Stored for forensics, not used in lockout
    // logic (which is per-user, not per-IP).
    ip: { type: 'text', notNull: false },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });

  // Lockout query: COUNT(*) WHERE user_id=? AND created_at > NOW() - INTERVAL.
  // This index makes that O(log n + matched_rows).
  pgm.createIndex(
    'user_totp_failed_attempts',
    ['user_id', 'created_at'],
    { name: 'idx_user_totp_failed_attempts_user_time' },
  );

  pgm.createTable('user_totp_audit_log', {
    id: { type: 'bigserial', primaryKey: true },
    user_id: {
      type: 'bigint',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    // Free-form event code - enum-like in practice. Values defined in
    // src/totp/totp.audit.ts as a union type. Kept as text rather than a
    // PG ENUM so adding a new event doesn't require a migration.
    event: { type: 'text', notNull: true },
    ip: { type: 'text', notNull: false },
    // Optional context as jsonb. Used e.g. for { recovery_codes_remaining: 3 }
    // on a recovery-code-consumed event. Never store the actual code or
    // secret here.
    meta: { type: 'jsonb', notNull: true, default: pgm.func(`'{}'::jsonb`) },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });

  // Reading "audit log for user X" most recent first is the common access
  // pattern. created_at DESC index covers it without a separate sort.
  pgm.createIndex(
    'user_totp_audit_log',
    ['user_id', { name: 'created_at', sort: 'DESC' }],
    { name: 'idx_user_totp_audit_log_user_time' },
  );
};

exports.down = (pgm) => {
  pgm.dropTable('user_totp_audit_log');
  pgm.dropTable('user_totp_failed_attempts');
};
