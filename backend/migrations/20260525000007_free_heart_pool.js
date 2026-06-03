// Free-tier daily heart pool. For free users, the daily pool IS the session
// hearts (see plan): a session starts with min(3, pool), wrong answer
// deducts 1 from the pool, session ends when pool hits 0, pool refills at
// the user's local midnight (computed using users.timezone added in
// 20260525000003_add_user_timezone).
//
// Columns:
//   free_hearts_pool         integer NOT NULL DEFAULT 3
//     Current pool. Always 0..3; refilled to 3 on the first heart-consuming
//     call of a new local day. Premium users ignore this - their session
//     starts at HEARTS_PER_SESSION (3) every time.
//   free_hearts_pool_date    date    NULL
//     The user's local date the pool currently corresponds to. NULL = never
//     touched (first session will treat as "today" and use the default 3).
//     On entry, the service computes "today in user.timezone"; if it differs
//     from this column, the pool is reset to 3 and this column updated, all
//     in one UPDATE.
//
// Defaults make the migration non-disruptive: every existing user gets a
// fresh 3-heart pool. If they're premium, this column is simply unread.
//
// CHECK bounds 0..3 so an accidental rogue update fails at the DB layer
// rather than silently giving a user 9999 hearts.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns('users', {
    free_hearts_pool: { type: 'integer', notNull: true, default: 3 },
    free_hearts_pool_date: { type: 'date' },
  });
  pgm.addConstraint('users', 'chk_free_hearts_pool_range', {
    check: 'free_hearts_pool BETWEEN 0 AND 3',
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('users', 'chk_free_hearts_pool_range');
  pgm.dropColumns('users', ['free_hearts_pool', 'free_hearts_pool_date']);
};
