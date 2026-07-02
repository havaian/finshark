// Curated fixed mocks - a named, ordered, fixed set of questions per paper.
//
// The existing mock engine builds a mock by RANDOM sampling from a paper's
// question pool (see 20260515000006_mocks + questions.repository.findRandomForMock).
// That stays in place for now. These two tables add the alternative the
// product is moving to: a mock is a specific list of questions in a specific
// order, with per-question section + marks captured from the source paper.
// A user starting a mock for a paper is given one of that paper's active
// mock_exams AT RANDOM (no picker), and plays exactly its questions. The
// playback path in mocks.service is wired in a later change; this migration is
// only the schema and is inert until the importer populates it.
//
// mock_exams: one row per curated mock (e.g. "F1 Mock 1 (Sep2020-Aug2021)").
//   - paper_id  : the paper this mock belongs to (CASCADE - dropping a paper
//                 drops its mocks).
//   - code      : stable external key (the workbook's mock_set string). UNIQUE
//                 so the importer can upsert a mock by name without duplicating.
//   - name_en/ru: display name (name_ru falls back to name_en in clients).
//   - duration_seconds / pass_mark_pct: how this mock is timed and passed.
//                 Sourced per paper (FA2 = 120 min / 50%); kept on the mock row
//                 so a mock carries its own rules independent of the paper's
//                 pool-mode exam_structure.
//   - source    : provenance note (where the mock came from). Nullable.
//   - is_active : whether this mock is eligible for the random pick. Lets an
//                 admin stage a mock without exposing it.
//   - sort_order: display/tie-break ordering.
//
// mock_exam_questions: the fixed, ordered membership.
//   - mock_id/question_id: composite PK (a question appears at most once in a
//                 mock). question_id is ON DELETE RESTRICT - a question that
//                 belongs to a mock cannot be hard-deleted out from under it
//                 (retire via is_active instead), mirroring attempts /
//                 lesson_session_questions. See the seed reseed note below.
//   - position  : 0-based order within the mock. UNIQUE per mock.
//   - section_code: 'A' / 'B' / NULL - the section this question sits in for
//                 THIS mock (from the workbook's section column).
//   - marks     : marks this question is worth in THIS mock (from the workbook).
//                 All-or-nothing at grade time, matching ACCA objective marking.
//
// RESEED ORDERING (handled in seed.service.dropAndReseedContent): because
//   mock_exam_questions.question_id is RESTRICT, those rows must be deleted
//   BEFORE papers are dropped (dropping a paper cascades into questions, and a
//   still-referencing mock_exam_questions row would block that cascade). The
//   reseed path now deletes mock_exam_questions + mock_exams up front. On a DB
//   with no imported mocks these deletes are harmless no-ops.
//
// REVERSIBILITY: fully reversible - drop both tables (child first) + trigger.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('mock_exams', {
    id: { type: 'bigserial', primaryKey: true },
    paper_id: {
      type: 'bigint',
      notNull: true,
      references: 'papers(id)',
      onDelete: 'CASCADE',
    },
    code: { type: 'text', notNull: true, unique: true }, // workbook mock_set
    name_en: { type: 'text', notNull: true },
    name_ru: { type: 'text' }, // nullable; falls back to name_en
    duration_seconds: { type: 'integer', notNull: true },
    pass_mark_pct: { type: 'integer', notNull: true },
    source: { type: 'text' },
    is_active: { type: 'boolean', notNull: true, default: true },
    sort_order: { type: 'integer', notNull: true, default: 0 },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.addConstraint('mock_exams', 'chk_mock_pass_mark_range', {
    check: 'pass_mark_pct BETWEEN 0 AND 100',
  });
  // Same sane bound as lesson_sessions.time_limit_seconds (5 min .. 4 hours).
  pgm.addConstraint('mock_exams', 'chk_mock_duration_range', {
    check: 'duration_seconds BETWEEN 300 AND 14400',
  });
  pgm.createIndex('mock_exams', 'paper_id', { name: 'idx_mock_exams_paper_id' });

  // Shared updated_at trigger (function created in the content migration).
  pgm.sql(`
    CREATE TRIGGER trg_mock_exams_updated_at
      BEFORE UPDATE ON mock_exams
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at()
  `);

  pgm.createTable('mock_exam_questions', {
    mock_id: {
      type: 'bigint',
      notNull: true,
      references: 'mock_exams(id)',
      onDelete: 'CASCADE',
    },
    question_id: {
      type: 'bigint',
      notNull: true,
      references: 'questions(id)',
      onDelete: 'RESTRICT', // can't delete a question that's in a mock
    },
    position: { type: 'integer', notNull: true }, // 0-based order in the mock
    section_code: { type: 'text' }, // 'A' / 'B' / NULL
    marks: { type: 'integer', notNull: true },
  });
  pgm.addConstraint('mock_exam_questions', 'mock_exam_questions_pkey', {
    primaryKey: ['mock_id', 'question_id'],
  });
  // Positions are unique within a mock so ordering is unambiguous.
  pgm.addConstraint('mock_exam_questions', 'uq_meq_mock_position', {
    unique: ['mock_id', 'position'],
  });
  pgm.addConstraint('mock_exam_questions', 'chk_meq_marks_positive', {
    check: 'marks > 0',
  });
  // Lookups: "which mocks use this question" (RESTRICT checks + the future
  // lesson-pool exclusion of mock questions).
  pgm.createIndex('mock_exam_questions', 'question_id', {
    name: 'idx_meq_question_id',
  });
};

exports.down = (pgm) => {
  pgm.dropTable('mock_exam_questions');
  pgm.sql('DROP TRIGGER IF EXISTS trg_mock_exams_updated_at ON mock_exams');
  pgm.dropTable('mock_exams');
};
