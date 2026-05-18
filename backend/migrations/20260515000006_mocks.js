// Mocks (4.1) — extend lesson_sessions rather than create a new table.
//
// Why extend instead of branch:
//   - 95% of the lesson-session machinery (queue, attempts, completion, XP,
//     streak) is identical for mocks. A separate table would force us to
//     duplicate that code path or join across both kinds for the same
//     attempts ⊆ session FK.
//   - The differences (no hearts, top-down timer, section breakdown summary,
//     no SRS interleave with regular due-queue) are small and well isolated
//     to the queue-builder and the UI.
//
// Columns added:
//   - mode: enum 'lesson' | 'mock'. Default 'lesson' so historical rows are
//     correctly classified. NOT NULL.
//   - time_limit_seconds: how long the user has. NULL for lessons; set for
//     mocks. Soft limit — frontend enforces UI countdown; backend doesn't
//     auto-fail when the timer hits zero, but does record the started_at so
//     analytics can spot late finishes.
//   - paper_id: nullable FK to papers. Mocks are paper-scoped (questions
//     pulled from one paper only). For regular lessons we leave NULL (they
//     can mix papers based on the user's preferred_paper_id and weak LOs).
//     ON DELETE SET NULL so dropping a paper doesn't cascade-wipe history.
//   - source_session_id: nullable self-FK to lesson_sessions. When a user
//     starts a "review session" of wrong questions from a finished mock, the
//     new (regular) session is linked back so we can show "Reviewing mock
//     from <date>" in the UI and analytics can pair them. ON DELETE SET NULL.
//
// Indexes:
//   - lesson_sessions(user_id, mode, started_at DESC) so the dashboard can
//     pull "your last mock" / "your last lesson" cheaply.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createType('session_mode', ['lesson', 'mock']);

  pgm.addColumns('lesson_sessions', {
    mode: { type: 'session_mode', notNull: true, default: 'lesson' },
    time_limit_seconds: { type: 'integer' },
    paper_id: { type: 'bigint', references: 'papers(id)', onDelete: 'SET NULL' },
    // Self-reference: the regular lesson session created from a mock's wrong
    // questions points back to the mock. NULL for all standalone sessions.
    source_session_id: {
      type: 'bigint',
      references: 'lesson_sessions(id)',
      onDelete: 'SET NULL',
    },
  });

  // Sanity: mocks must have a paper_id (they're paper-scoped); lessons may
  // optionally have one (e.g. user picked a paper from the dashboard).
  // Enforced via CHECK so we don't accidentally create an unrooted mock.
  pgm.addConstraint('lesson_sessions', 'chk_mock_has_paper', {
    check: `mode = 'lesson' OR paper_id IS NOT NULL`,
  });

  // Sanity: time_limit_seconds, when set, is in a reasonable range. 5 min to
  // 4 hours covers anything from speed drills to a full mock CBE.
  pgm.addConstraint('lesson_sessions', 'chk_time_limit_range', {
    check: `time_limit_seconds IS NULL OR (time_limit_seconds BETWEEN 300 AND 14400)`,
  });

  pgm.createIndex('lesson_sessions', ['user_id', 'mode', { name: 'started_at', sort: 'DESC' }], {
    name: 'idx_sessions_user_mode_started',
  });
};

exports.down = (pgm) => {
  pgm.dropIndex('lesson_sessions', ['user_id', 'mode', 'started_at'], {
    name: 'idx_sessions_user_mode_started',
  });
  pgm.dropConstraint('lesson_sessions', 'chk_time_limit_range');
  pgm.dropConstraint('lesson_sessions', 'chk_mock_has_paper');
  pgm.dropColumns('lesson_sessions', [
    'mode',
    'time_limit_seconds',
    'paper_id',
    'source_session_id',
  ]);
  pgm.dropType('session_mode');
};
