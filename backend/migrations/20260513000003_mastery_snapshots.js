// Daily snapshots of each user's average mastery score across all their
// user_question_state rows. Powers the "mastery over time" chart on the
// profile page.
//
// One row per (user_id, snap_date). A daily cron job inserts today's row
// per user. The query for the chart is just a date-bounded SELECT — cheap.
//
// snap_date is a DATE (no time component) since the cron runs once per day
// and we don't care about within-day fluctuations.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('mastery_snapshots', {
    user_id:    { type: 'bigint', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    snap_date:  { type: 'date', notNull: true },
    avg_mastery: { type: 'real', notNull: true },  // 0..100
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.addConstraint('mastery_snapshots', 'mastery_snapshots_pkey', {
    primaryKey: ['user_id', 'snap_date'],
  });
  // Read path: WHERE user_id = ? AND snap_date >= ?  ORDER BY snap_date
  // The PK already covers (user_id, snap_date) — no extra index needed.
};

exports.down = (pgm) => {
  pgm.dropTable('mastery_snapshots');
};
