// Leaderboards (3.3) support:
//
//   - users.leaderboard_opt_in: privacy default is OFF. Users only appear on
//     leaderboards if they explicitly enable this (from Settings or onboarding).
//
//   - attempts.xp_earned: needed for window-based leaderboards (XP this week,
//     this month). Historically XP was only summed onto users.xp at attempt
//     time; we couldn't reconstruct "XP earned in this window" from existing
//     data. Going forward we record it per attempt with a 0 default so old
//     rows don't break the new SUM aggregation — they just contribute 0,
//     which is the right semantics ("we don't know historical XP per attempt,
//     so it doesn't count toward windowed totals"). All-time XP for the
//     leaderboard still uses users.xp so existing users have a fair starting
//     score there.
//
//   - Supporting index on attempts(answered_at, user_id): the window query
//     filters by date and groups by user. Without this index, weekly/monthly
//     leaderboards would do a full attempts scan once user count grows.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns('users', {
    leaderboard_opt_in: { type: 'boolean', notNull: true, default: false },
  });

  pgm.addColumns('attempts', {
    xp_earned: { type: 'integer', notNull: true, default: 0 },
  });

  // For window queries: filter by answered_at, group by user_id. Composite
  // index ordered (answered_at, user_id) supports range-scan-then-group.
  // We don't need to include xp_earned (it's only summed) but Postgres can
  // index-only-scan if it's in the index — skip that optimization for now.
  pgm.createIndex('attempts', ['answered_at', 'user_id'], {
    name: 'idx_attempts_answered_user',
  });
};

exports.down = (pgm) => {
  pgm.dropIndex('attempts', ['answered_at', 'user_id'], {
    name: 'idx_attempts_answered_user',
  });
  pgm.dropColumns('attempts', ['xp_earned']);
  pgm.dropColumns('users', ['leaderboard_opt_in']);
};
