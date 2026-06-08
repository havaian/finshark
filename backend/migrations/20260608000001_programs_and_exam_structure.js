// Multi-program foundation + per-paper exam structure.
//
// This is the schema layer that lets ACCA papers coexist with CFA (and any
// future certification) under one content tree, and that lets the mock engine
// build a real exam from data instead of hardcoded "F3 = 35 Q / 120 min".
//
// THREE things happen here, all additive to existing data:
//
//   A) programs table. A program is a certification track (ACCA, CFA, ...).
//      We seed exactly one row - 'acca' - and backfill every existing paper
//      to it. The hierarchy becomes:
//         programs -> papers -> learning_objectives -> questions
//      "Paper" stays the unit a user studies and sits a mock for. For ACCA a
//      paper is an exam (F1, F2, ...); for CFA a paper will be a level
//      (Level I, II, III). Same shape, different data - a new program/level
//      is an INSERT, not a code change.
//
//   B) papers.program_id (FK -> programs). Added nullable, backfilled to the
//      seeded 'acca' program for every existing row, THEN set NOT NULL. The
//      ordering matters: setting NOT NULL before the backfill would fail on
//      existing rows. After this migration every paper belongs to exactly one
//      program and that invariant is enforced.
//
//   C) papers.exam_structure (JSONB). The data-driven definition of how a mock
//      for this paper is built and scored. Shape (validated at the app layer,
//      not in the DB beyond "is an object"):
//        {
//          "duration_seconds": 7200,
//          "pass_mark_pct": 50,
//          "sections": [
//            { "code": "A", "kind": "ot", "question_count": 35, "marks_each": 2 }
//          ]
//        }
//      - kind "ot"  : objective test (MCQ / number_entry). Uniform marks via
//                     marks_each. This is all F1-F3 use, and all CFA Level I
//                     will use - same schema.
//      - kind "mtq" : multi-task / constructed response (ACCA F4-F9 Section B).
//                     Carries marks_total (non-uniform, part-marked). Defined
//                     here as a forward-compatible shape but DORMANT: there is
//                     no MTQ question type and no MTQ grader yet, so no seeded
//                     paper uses it. F1-F3 have a single "ot" section only.
//      Added nullable, backfilled for the three seeded papers (F1/F2/F3) to
//      the real ACCA Applied Knowledge CBE structure, THEN set NOT NULL so
//      "every paper knows how its mock works" is an enforced invariant. The
//      mock engine therefore never has to defensively handle a paper with no
//      structure.
//
//   D) users.preferred_program_id (FK -> programs). Mirrors the existing
//      preferred_paper_id. Backfilled to 'acca' for all existing users so the
//      program is always known. ON DELETE SET NULL like preferred_paper_id.
//
// NOTE ON BACKFILL VALUES: the three seeded ACCA papers (F1, F2, F3) are all
// Applied Knowledge exams: 120 minutes, a single objective-test section of 35
// questions worth 2 marks each (70 marks), 50% pass mark. That is the real
// live CBE format. The uploaded F3 "Mock A" PDF carries an extra constructed-
// response Section B; that is NOT how the live F3 CBE works (F3 is 100%
// objective) so it is intentionally NOT modelled. Papers that exist in the DB
// but aren't in this known set (shouldn't happen in practice) get the same
// safe Applied-Knowledge default so the NOT NULL set succeeds.
//
// REVERSIBILITY: fully reversible. down() drops the two paper columns, the
// users column, and the programs table (after the FKs referencing it are gone).

exports.shorthands = undefined;

// The real ACCA Applied Knowledge (F1-F3) CBE structure, used to backfill the
// three seeded papers and as the safe default for any other pre-existing row.
// Kept as a JS object here (migration-local) so the backfill is self-contained
// and doesn't depend on importing application code into a migration.
const APPLIED_KNOWLEDGE_STRUCTURE = {
  duration_seconds: 7200, // 120 minutes
  pass_mark_pct: 50,
  sections: [
    { code: 'A', kind: 'ot', question_count: 35, marks_each: 2 },
  ],
};

exports.up = (pgm) => {
  // ── A) programs table ──────────────────────────────────────────────
  pgm.createTable('programs', {
    id: { type: 'bigserial', primaryKey: true },
    code: { type: 'text', notNull: true, unique: true }, // e.g. 'acca', 'cfa'
    name_en: { type: 'text', notNull: true },
    name_ru: { type: 'text' }, // nullable; frontend falls back to name_en
    // Whether papers under this program label their study unit "Paper" (ACCA)
    // or "Level" (CFA) etc. Stored as a free key the frontend maps to an i18n
    // string; defaults to 'paper'. This is purely a labelling hint - it does
    // not change any behaviour, and the relabel UI work is deferred until CFA
    // actually launches.
    unit_noun: { type: 'text', notNull: true, default: 'paper' },
    sort_order: { type: 'integer', notNull: true, default: 0 },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });

  // Seed the one program we ship today. CFA (and others) are added later as
  // plain INSERTs - no schema change needed.
  pgm.sql(`
    INSERT INTO programs (code, name_en, name_ru, unit_noun, sort_order)
    VALUES ('acca', 'ACCA', 'ACCA', 'paper', 0)
  `);

  // Reuse the shared updated_at trigger (created in the content migration).
  pgm.sql(`
    CREATE TRIGGER trg_programs_updated_at
      BEFORE UPDATE ON programs
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at()
  `);

  // ── B) papers.program_id ───────────────────────────────────────────
  // Add nullable first so existing rows are valid, then backfill, then lock.
  pgm.addColumns('papers', {
    program_id: {
      type: 'bigint',
      references: 'programs(id)',
      onDelete: 'RESTRICT', // can't delete a program while papers reference it
    },
  });

  // Backfill: every existing paper belongs to ACCA.
  pgm.sql(`
    UPDATE papers
    SET program_id = (SELECT id FROM programs WHERE code = 'acca')
    WHERE program_id IS NULL
  `);

  // Now safe to enforce NOT NULL.
  pgm.alterColumn('papers', 'program_id', { notNull: true });

  pgm.createIndex('papers', 'program_id', { name: 'idx_papers_program_id' });

  // ── C) papers.exam_structure ───────────────────────────────────────
  pgm.addColumns('papers', {
    exam_structure: { type: 'jsonb' }, // nullable first; backfilled below then locked
  });

  // Backfill the three seeded Applied Knowledge papers (F1, F2, F3) with the
  // real CBE structure. Any other pre-existing paper gets the same safe
  // Applied-Knowledge default so the NOT NULL set below cannot fail.
  const structureJson = JSON.stringify(APPLIED_KNOWLEDGE_STRUCTURE).replace(/'/g, "''");
  pgm.sql(`
    UPDATE papers
    SET exam_structure = '${structureJson}'::jsonb
    WHERE exam_structure IS NULL
  `);

  // Enforce the invariant: every paper defines how its mock works.
  pgm.alterColumn('papers', 'exam_structure', { notNull: true });

  // Defensive shape check: exam_structure must be a JSON object (not an array
  // or scalar). The detailed section shape is validated in the app layer, but
  // this keeps obviously-malformed rows out at the DB boundary.
  pgm.addConstraint('papers', 'chk_exam_structure_is_object', {
    check: `jsonb_typeof(exam_structure) = 'object'`,
  });

  // ── D) users.preferred_program_id ──────────────────────────────────
  pgm.addColumns('users', {
    preferred_program_id: {
      type: 'bigint',
      references: 'programs(id)',
      onDelete: 'SET NULL', // program deleted -> unset, don't cascade-delete the user
    },
  });

  // Backfill existing users to ACCA so the preferred program is always known
  // for anyone who onboarded before multi-program existed.
  pgm.sql(`
    UPDATE users
    SET preferred_program_id = (SELECT id FROM programs WHERE code = 'acca')
    WHERE preferred_program_id IS NULL
  `);

  pgm.createIndex('users', 'preferred_program_id', { name: 'idx_users_preferred_program_id' });
};

exports.down = (pgm) => {
  // Drop in reverse dependency order. The users + papers FKs to programs must
  // go before the programs table itself.

  // D)
  pgm.dropIndex('users', 'preferred_program_id', { name: 'idx_users_preferred_program_id' });
  pgm.dropColumns('users', ['preferred_program_id']);

  // C)
  pgm.dropConstraint('papers', 'chk_exam_structure_is_object');
  pgm.dropColumns('papers', ['exam_structure']);

  // B)
  pgm.dropIndex('papers', 'program_id', { name: 'idx_papers_program_id' });
  pgm.dropColumns('papers', ['program_id']);

  // A)
  pgm.sql('DROP TRIGGER IF EXISTS trg_programs_updated_at ON programs');
  pgm.dropTable('programs');
};
