// Email whitelist - only listed addresses (or any address under a listed
// domain) are allowed to sign in.
//
// Table shape:
//   id           bigserial PK
//   pattern      text NOT NULL UNIQUE. Two flavours:
//                  - 'user@example.com'  (exact email match; case-insensitive)
//                  - '@example.com'      (domain match; any email at that domain)
//                The leading '@' is the discriminator. We validate the shape
//                at the app layer; here we just store text.
//   note         text NULL. Optional admin note (who/why added).
//   created_at   timestamptz default NOW()
//   created_by_user_id bigint NULL → users(id) ON DELETE SET NULL.
//                Tracks which admin added the entry. NULL for auto-created
//                rows during the initial backfill.
//
// Backfill on up():
//   Existing users.email values are inserted as exact-match patterns so the
//   gate doesn't immediately lock everyone out the moment whitelist enforcement
//   ships. ON CONFLICT DO NOTHING in case of any pre-existing rows.
//
// citext: emails are stored as citext in users - the whitelist column is
// regular text and matching is done with explicit LOWER() on the app side,
// because patterns include both exact emails AND '@domain' entries (and we
// don't want citext semantics applied to the domain prefix accidentally).

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('email_whitelist', {
    id: { type: 'bigserial', primaryKey: true },
    pattern: { type: 'text', notNull: true, unique: true },
    note: { type: 'text' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    created_by_user_id: {
      type: 'bigint',
      references: 'users(id)',
      onDelete: 'SET NULL',
    },
  });

  // We match patterns case-insensitively (emails are not case-sensitive in
  // practice; domains never are). Store the canonical form lowercased.
  pgm.addConstraint('email_whitelist', 'chk_pattern_lowercased', {
    check: `pattern = LOWER(pattern)`,
  });
  // Shape constraint: either an exact email (contains exactly one '@' NOT in
  // first position) or a domain prefix ('@domain.tld' - starts with '@', has
  // no other '@'). Belt-and-braces with app validation.
  pgm.addConstraint('email_whitelist', 'chk_pattern_shape', {
    check: `
      (pattern LIKE '@%' AND pattern NOT LIKE '@%@%' AND LENGTH(pattern) > 1)
      OR
      (pattern NOT LIKE '@%' AND pattern LIKE '%@%' AND pattern NOT LIKE '%@%@%')
    `,
  });

  // Backfill: insert existing user emails as exact patterns so admins
  // already in the system stay reachable. note column gets a sentinel so
  // the admin UI can show "imported from users on migration" if desired.
  // ON CONFLICT DO NOTHING in case any pre-seeded row exists.
  pgm.sql(`
    INSERT INTO email_whitelist (pattern, note, created_by_user_id)
    SELECT LOWER(email), 'auto-backfilled from existing users', NULL
    FROM users
    ON CONFLICT (pattern) DO NOTHING
  `);
};

exports.down = (pgm) => {
  pgm.dropTable('email_whitelist');
};
