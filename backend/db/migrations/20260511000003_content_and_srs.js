// backend/migrations/20260511000003_content_and_srs.js
// Content (papers/LOs/questions), per-user SRS state, lesson sessions + attempts,
// and an updated_at trigger function applied to several tables.

exports.shorthands = undefined;

exports.up = (pgm) => {
  // ── Content tables ─────────────────────────────────────────────────
  pgm.createTable('papers', {
    id: { type: 'bigserial', primaryKey: true },
    code: { type: 'text', notNull: true, unique: true }, // e.g. 'F1', 'F5'
    name: { type: 'text', notNull: true },               // e.g. 'Business & Technology'
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });

  pgm.createTable('learning_objectives', {
    id: { type: 'bigserial', primaryKey: true },
    paper_id: { type: 'bigint', notNull: true, references: 'papers(id)', onDelete: 'CASCADE' },
    code: { type: 'text', notNull: true },              // e.g. 'LO1', 'A1', '1.1'
    title: { type: 'text', notNull: true },
    description: { type: 'text' },
    sort_order: { type: 'integer', notNull: true, default: 0 },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.addConstraint('learning_objectives', 'learning_objectives_paper_id_code_key', {
    unique: ['paper_id', 'code'],
  });
  pgm.createIndex('learning_objectives', 'paper_id', { name: 'idx_los_paper_id' });

  // ENUMs — node-pg-migrate has pgm.createType for these.
  pgm.createType('question_difficulty', ['easy', 'medium', 'hard']);
  pgm.createType('question_type', ['mcq', 'short_answer']);

  // Questions. correct_answer holds the MCQ option key OR the short-answer ground truth.
  // The chk_mcq_options constraint enforces that MCQs have an options array and
  // short_answer questions do not. Inner shape of options is validated at the app layer.
  pgm.createTable('questions', {
    id: { type: 'bigserial', primaryKey: true },
    lo_id: { type: 'bigint', notNull: true, references: 'learning_objectives(id)', onDelete: 'CASCADE' },
    type: { type: 'question_type', notNull: true },
    difficulty: { type: 'question_difficulty', notNull: true, default: 'medium' },
    prompt: { type: 'text', notNull: true },
    options: { type: 'jsonb' },                          // only set when type = 'mcq'
    correct_answer: { type: 'text', notNull: true },
    explanation: { type: 'text', notNull: true },            // shown after answer regardless
    concept_bite: { type: 'text' },                           // optional pre-question explainer
    is_active: { type: 'boolean', notNull: true, default: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.addConstraint('questions', 'chk_mcq_options', {
    check: `
      (type = 'mcq'          AND options IS NOT NULL AND jsonb_typeof(options) = 'array')
      OR
      (type = 'short_answer' AND options IS NULL)
    `,
  });
  pgm.createIndex('questions', 'lo_id', { name: 'idx_questions_lo_id' });
  pgm.createIndex('questions', ['lo_id', 'is_active', 'difficulty'], { name: 'idx_questions_lo_active_diff' });

  // ── Per-user SRS + mastery state ───────────────────────────────────
  // (user_id, question_id) composite PK — one row per pair, lazy-created.
  pgm.createTable('user_question_state', {
    user_id: { type: 'bigint', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    question_id: { type: 'bigint', notNull: true, references: 'questions(id)', onDelete: 'CASCADE' },
    ease_factor: { type: 'real', notNull: true, default: 2.5 },           // SM-2 starts at 2.5
    interval_days: { type: 'integer', notNull: true, default: 0 },
    repetitions: { type: 'integer', notNull: true, default: 0 },
    due_date: { type: 'date', notNull: true, default: pgm.func('CURRENT_DATE') },
    mastery_score: { type: 'integer', notNull: true, default: 0 },             // 0..100
    times_seen: { type: 'integer', notNull: true, default: 0 },
    times_correct: { type: 'integer', notNull: true, default: 0 },
    last_seen_at: { type: 'timestamptz' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.addConstraint('user_question_state', 'user_question_state_pkey', {
    primaryKey: ['user_id', 'question_id'],
  });
  pgm.addConstraint('user_question_state', 'chk_mastery_range', {
    check: 'mastery_score BETWEEN 0 AND 100',
  });
  pgm.addConstraint('user_question_state', 'chk_ease_min', {
    check: 'ease_factor >= 1.3',
  });
  pgm.createIndex('user_question_state', ['user_id', 'due_date'], { name: 'idx_uqs_user_due' });

  // ── Lesson sessions + attempts ─────────────────────────────────────
  pgm.createTable('lesson_sessions', {
    id: { type: 'bigserial', primaryKey: true },
    user_id: { type: 'bigint', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    started_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    completed_at: { type: 'timestamptz' },                                   // null = in progress / abandoned
    question_count: { type: 'integer', notNull: true },
    correct_count: { type: 'integer', notNull: true, default: 0 },
  });
  pgm.createIndex('lesson_sessions', ['user_id', { name: 'started_at', sort: 'DESC' }], {
    name: 'idx_sessions_user_started',
  });

  pgm.createTable('attempts', {
    id: { type: 'bigserial', primaryKey: true },
    session_id: { type: 'bigint', notNull: true, references: 'lesson_sessions(id)', onDelete: 'CASCADE' },
    user_id: { type: 'bigint', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    question_id: { type: 'bigint', notNull: true, references: 'questions(id)', onDelete: 'RESTRICT' },
    user_answer: { type: 'text', notNull: true },
    was_correct: { type: 'boolean', notNull: true },
    llm_grade_json: { type: 'jsonb' },                                          // null for MCQ
    answered_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.createIndex('attempts', 'session_id', { name: 'idx_attempts_session' });
  pgm.createIndex('attempts', ['user_id', 'question_id'], { name: 'idx_attempts_user_qid' });

  // ── updated_at triggers ────────────────────────────────────────────
  // Postgres has no built-in auto-update; we use a tiny plpgsql function
  // attached as a BEFORE UPDATE trigger to each table that has updated_at.
  pgm.sql(`
    CREATE OR REPLACE FUNCTION set_updated_at()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.updated_at = NOW();
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `);
  for (const tbl of ['papers', 'learning_objectives', 'questions', 'user_question_state', 'users']) {
    pgm.sql(`
      CREATE TRIGGER trg_${tbl === 'user_question_state' ? 'uqs' : tbl === 'learning_objectives' ? 'los' : tbl}_updated_at
        BEFORE UPDATE ON ${tbl}
        FOR EACH ROW EXECUTE FUNCTION set_updated_at();
    `);
  }
};

exports.down = (pgm) => {
  // Reverse order. Triggers and function first, then dependent tables, then ENUMs.
  pgm.sql('DROP TRIGGER IF EXISTS trg_users_updated_at     ON users');
  pgm.sql('DROP TRIGGER IF EXISTS trg_uqs_updated_at       ON user_question_state');
  pgm.sql('DROP TRIGGER IF EXISTS trg_questions_updated_at ON questions');
  pgm.sql('DROP TRIGGER IF EXISTS trg_los_updated_at       ON learning_objectives');
  pgm.sql('DROP TRIGGER IF EXISTS trg_papers_updated_at    ON papers');
  pgm.sql('DROP FUNCTION IF EXISTS set_updated_at()');

  pgm.dropTable('attempts');
  pgm.dropTable('lesson_sessions');
  pgm.dropTable('user_question_state');
  pgm.dropTable('questions');
  pgm.dropType('question_type');
  pgm.dropType('question_difficulty');
  pgm.dropTable('learning_objectives');
  pgm.dropTable('papers');
};