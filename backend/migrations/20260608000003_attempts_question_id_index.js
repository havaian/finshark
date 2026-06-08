// Standalone index on attempts.question_id.
//
// WHY: several read paths join or group attempts by question_id ALONE:
//   - profile-stats accuracyByPaper / difficultyBreakdown / typeBreakdown
//     (attempts -> questions -> ... GROUP BY drives off question_id)
//   - the global per-question error-rate aggregation used by the lesson
//     queue builder (findUnseenInLo error_rate_bias branch, and the
//     question_error_rates summary refreshed by cron)
//
// The existing composite index idx_attempts_user_qid is keyed (user_id,
// question_id). Postgres can only use that for a leading-column lookup, so a
// query filtering/grouping on question_id WITHOUT a user_id predicate cannot
// use it - it falls back to a sequential scan of attempts, the largest and
// fastest-growing table. This single-column index serves those question_id-
// leading accesses.
//
// We keep idx_attempts_user_qid as-is: the per-user "has this user attempted
// question X" lookups (findUnseenInLo's NOT EXISTS, the double-answer guard)
// still want the (user_id, question_id) order.
//
// REVERSIBILITY: trivially reversible - drop the index.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createIndex('attempts', 'question_id', {
    name: 'idx_attempts_question_id',
  });
};

exports.down = (pgm) => {
  pgm.dropIndex('attempts', 'question_id', {
    name: 'idx_attempts_question_id',
  });
};
