// lesson_session_questions.section_code - which exam section each queued
// question belongs to, captured at mock-start time.
//
// WHY: a mock is built from a paper's exam_structure, section by section (see
// 20260608000001). To score per section - and to compute marks, since marks
// are a property of the section (ot: marks_each; mtq: marks_total) - we need
// to know, unambiguously, which section every queued question belongs to.
// Deriving it after the fact from positions + structure is fragile: if a
// section is under-filled (fewer active questions than the structure asks
// for), position ranges no longer line up with the structure and a question
// can be attributed to the wrong section. Persisting the section at start time
// removes that ambiguity for good and makes multi-section papers (the future
// ACCA F4-F9 MTQ format) correct by construction.
//
// SHAPE: nullable text. NULL means "not part of a structured mock" - i.e.
// every existing row (regular lessons, and the flat mocks created before this
// change) stays NULL and is untouched. New structured-mock sessions stamp each
// row with its section code (e.g. 'A'). Regular lesson sessions continue to
// insert NULL here (lessons have no exam sections). We deliberately do NOT
// backfill historical mock rows: those mocks were built by the old flat
// sampler with no section concept, so any value would be invented. Their
// breakdown/scoring keeps working because scoring treats a missing section as
// a single implicit section (see mocks.service).
//
// No CHECK tying section_code to mode: lesson_session_questions has no mode
// column (mode lives on lesson_sessions), and adding a cross-table constraint
// for this is more machinery than it's worth. The application layer is the
// authority on when section_code is set.
//
// REVERSIBILITY: trivially reversible - drop the column.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns('lesson_session_questions', {
    // e.g. 'A'. NULL for non-mock sessions and for legacy flat mocks.
    section_code: { type: 'text' },
  });
};

exports.down = (pgm) => {
  pgm.dropColumns('lesson_session_questions', ['section_code']);
};
