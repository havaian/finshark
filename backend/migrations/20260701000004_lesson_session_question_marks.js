// backend/migrations/20260701000004_lesson_session_question_marks.js
// Per-question marks for FIXED (imported) mocks. When a mock is played from a
// curated mock_exam, each queued question's marks (from mock_exam_questions) is
// stamped here at start time so the breakdown can score by real per-question
// marks. NULL for dynamic/legacy mocks and for regular lessons/reviews, where
// marks come from the paper's exam_structure marks_each (or don't apply). This
// is purely additive - existing rows and flows are unaffected.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumn('lesson_session_questions', {
    marks: { type: 'integer', notNull: false },
  });
  // A stamped mark, when present, must be positive. NULL stays allowed (the
  // dynamic/lesson case).
  pgm.addConstraint('lesson_session_questions', 'chk_lsq_marks_positive', {
    check: 'marks IS NULL OR marks > 0',
  });
};

exports.down = (pgm) => {
  pgm.dropConstraint('lesson_session_questions', 'chk_lsq_marks_positive');
  pgm.dropColumn('lesson_session_questions', 'marks');
};
