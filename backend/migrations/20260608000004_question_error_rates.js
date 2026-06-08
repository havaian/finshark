// Precomputed global error rate per question.
//
// WHY: the lesson queue builder biases new-question selection toward questions
// a lot of users get wrong ("often-wrong weighting"). Previously this was
// computed inline as a correlated aggregation over the ENTIRE attempts table -
//   SELECT question_id, COUNT(*) FILTER (WHERE NOT was_correct) / COUNT(*)
//   FROM attempts GROUP BY question_id
// with no WHERE filter - and that subquery ran once PER weak LO inside
// buildQueue, i.e. up to ~8+ full attempts-table scans for a single lesson
// start. As attempts grows, every lesson start degrades linearly.
//
// This table holds the same aggregate, materialized. A daily cron
// (ProfileStats-style) refreshes it. buildQueue then reads a single indexed
// row per question instead of re-aggregating the whole table. Error rates
// drift slowly, so once-a-day freshness is plenty - a question's global
// difficulty doesn't meaningfully change within a day.
//
// SHAPE: one row per question that has at least one attempt. Questions with
// no attempts simply have no row here; the queue builder treats a missing
// row as the neutral default (the same 0.4 fallback the old inline query
// used via COALESCE), so brand-new content isn't starved.
//
//   question_id  - FK to questions, CASCADE so retiring a question cleans up.
//   error_rate   - wrong attempts / total attempts, 0..1 (real).
//   attempts_count - total attempts feeding the rate (kept for debugging /
//                    future confidence-weighting; not currently read).
//   computed_at  - when this row was last refreshed.
//
// REVERSIBILITY: trivially reversible - drop the table. buildQueue tolerates
// an empty/absent table (every question falls back to the neutral default),
// so dropping it degrades gracefully rather than breaking lessons.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('question_error_rates', {
    question_id: {
      type: 'bigint',
      notNull: true,
      references: 'questions(id)',
      onDelete: 'CASCADE',
    },
    error_rate: { type: 'real', notNull: true }, // 0..1
    attempts_count: { type: 'integer', notNull: true },
    computed_at: {
      type: 'timestamptz',
      notNull: true,
      default: pgm.func('NOW()'),
    },
  });
  pgm.addConstraint('question_error_rates', 'question_error_rates_pkey', {
    primaryKey: ['question_id'],
  });
  // Read path is a point lookup by question_id (the PK covers it). No extra
  // index needed.
};

exports.down = (pgm) => {
  pgm.dropTable('question_error_rates');
};
