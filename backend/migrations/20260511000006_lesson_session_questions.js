// backend/migrations/20260511000006_lesson_session_questions.js
// Records the original question queue for a lesson session at start time, so
// the frontend can resume after reload by intersecting this with attempts.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('lesson_session_questions', {
    session_id: { type: 'bigint', notNull: true, references: 'lesson_sessions(id)', onDelete: 'CASCADE' },
    question_id: { type: 'bigint', notNull: true, references: 'questions(id)', onDelete: 'RESTRICT' },
    position: { type: 'integer', notNull: true },
  });
  pgm.addConstraint('lesson_session_questions', 'lesson_session_questions_pkey', {
    primaryKey: ['session_id', 'position'],
  });
  pgm.createIndex('lesson_session_questions', 'session_id', { name: 'idx_lsq_session' });
};

exports.down = (pgm) => {
  pgm.dropTable('lesson_session_questions');
};