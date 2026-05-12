-- migrate:up

-- ============================================================
-- Content tables (read-mostly; admin tool writes, lessons read)
-- ============================================================

-- ACCA papers — F1, F5, etc. Seeded by admin tool, not here.
CREATE TABLE papers (
  id            BIGSERIAL PRIMARY KEY,
  code          TEXT        NOT NULL UNIQUE,  -- e.g. 'F1', 'F5'
  name          TEXT        NOT NULL,         -- e.g. 'Business & Technology'
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Learning Objectives, scoped to a paper.
-- A paper has many LOs; each LO has many questions.
CREATE TABLE learning_objectives (
  id            BIGSERIAL PRIMARY KEY,
  paper_id      BIGINT      NOT NULL REFERENCES papers(id) ON DELETE CASCADE,
  code          TEXT        NOT NULL,         -- e.g. 'LO1', 'A1', '1.1' — admin's choice
  title         TEXT        NOT NULL,
  description   TEXT,
  sort_order    INT         NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (paper_id, code)
);

CREATE INDEX idx_los_paper_id ON learning_objectives(paper_id);

-- Difficulty enum: small fixed set, used to adapt selection per user.
CREATE TYPE question_difficulty AS ENUM ('easy', 'medium', 'hard');

-- Question type enum.
CREATE TYPE question_type AS ENUM ('mcq', 'short_answer');

-- Questions belong to an LO. options is JSONB for MCQ (array of {key,text}); NULL for short_answer.
-- correct_answer: for MCQ stores the option key ("A".."D"); for short_answer stores the
--   canonical correct response (used as ground truth for LLM fuzzy-match).
CREATE TABLE questions (
  id              BIGSERIAL PRIMARY KEY,
  lo_id           BIGINT              NOT NULL REFERENCES learning_objectives(id) ON DELETE CASCADE,
  type            question_type       NOT NULL,
  difficulty      question_difficulty NOT NULL DEFAULT 'medium',
  prompt          TEXT                NOT NULL,
  options         JSONB,                                      -- only set when type = 'mcq'
  correct_answer  TEXT                NOT NULL,
  explanation     TEXT                NOT NULL,               -- shown after answer regardless of correctness
  concept_bite    TEXT,                                       -- optional pre-question explainer
  is_active       BOOLEAN             NOT NULL DEFAULT TRUE,  -- soft "retirement" without delete
  created_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ         NOT NULL DEFAULT NOW(),

  -- Integrity: MCQ must have options array; short_answer must not.
  -- (JSONB check; relies on jsonb_typeof. Doesn't validate inner shape — app layer enforces.)
  CONSTRAINT chk_mcq_options
    CHECK (
      (type = 'mcq'          AND options IS NOT NULL AND jsonb_typeof(options) = 'array')
      OR
      (type = 'short_answer' AND options IS NULL)
    )
);

CREATE INDEX idx_questions_lo_id            ON questions(lo_id);
CREATE INDEX idx_questions_lo_active_diff   ON questions(lo_id, is_active, difficulty);

-- ============================================================
-- Per-user SRS + mastery state
-- ============================================================

-- One row per (user, question) pair, lazily created on first encounter.
-- SM-2 fields: ease_factor, interval_days, repetitions, due_date.
-- Plus mastery tracking for the "weak LO" selection logic.
CREATE TABLE user_question_state (
  user_id         BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id     BIGINT      NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  ease_factor     REAL        NOT NULL DEFAULT 2.5,           -- SM-2 starts at 2.5
  interval_days   INT         NOT NULL DEFAULT 0,             -- days until next due
  repetitions     INT         NOT NULL DEFAULT 0,             -- successful reviews in a row
  due_date        DATE        NOT NULL DEFAULT CURRENT_DATE,  -- new items due immediately
  mastery_score   INT         NOT NULL DEFAULT 0,             -- 0..100, +10/-20 per the spec
  times_seen      INT         NOT NULL DEFAULT 0,
  times_correct   INT         NOT NULL DEFAULT 0,
  last_seen_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, question_id),
  CONSTRAINT chk_mastery_range  CHECK (mastery_score BETWEEN 0 AND 100),
  CONSTRAINT chk_ease_min       CHECK (ease_factor >= 1.3)    -- SM-2 floor
);

-- Hot path: "give me this user's due items" — index on (user_id, due_date).
CREATE INDEX idx_uqs_user_due ON user_question_state(user_id, due_date);

-- ============================================================
-- Lesson sessions + attempts
-- ============================================================

-- A "lesson" = one queue of N questions the user works through in one sitting.
CREATE TABLE lesson_sessions (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  started_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at  TIMESTAMPTZ,                                 -- null = in progress / abandoned
  question_count INT        NOT NULL,                        -- how many Qs were queued
  correct_count  INT        NOT NULL DEFAULT 0
);

CREATE INDEX idx_sessions_user_started ON lesson_sessions(user_id, started_at DESC);

-- One row per question attempt. Captures both the user's input and what the grader decided.
-- llm_grade_json is JSONB so we can store provider, raw score, reasoning, model name, etc.
CREATE TABLE attempts (
  id              BIGSERIAL PRIMARY KEY,
  session_id      BIGINT      NOT NULL REFERENCES lesson_sessions(id) ON DELETE CASCADE,
  user_id         BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  question_id     BIGINT      NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
  user_answer     TEXT        NOT NULL,
  was_correct     BOOLEAN     NOT NULL,                       -- denormalized for analytics
  llm_grade_json  JSONB,                                      -- null for MCQ; populated for short_answer
  answered_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_attempts_session ON attempts(session_id);
CREATE INDEX idx_attempts_user_qid ON attempts(user_id, question_id);

-- ============================================================
-- updated_at triggers (Postgres doesn't auto-update timestamps)
-- ============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_papers_updated_at
  BEFORE UPDATE ON papers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_los_updated_at
  BEFORE UPDATE ON learning_objectives
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_questions_updated_at
  BEFORE UPDATE ON questions
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_uqs_updated_at
  BEFORE UPDATE ON user_question_state
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Also retroactively cover users (slice 1's table doesn't have a trigger yet).
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- migrate:down

DROP TRIGGER IF EXISTS trg_users_updated_at      ON users;
DROP TRIGGER IF EXISTS trg_uqs_updated_at        ON user_question_state;
DROP TRIGGER IF EXISTS trg_questions_updated_at  ON questions;
DROP TRIGGER IF EXISTS trg_los_updated_at        ON learning_objectives;
DROP TRIGGER IF EXISTS trg_papers_updated_at     ON papers;
DROP FUNCTION IF EXISTS set_updated_at();

DROP TABLE IF EXISTS attempts;
DROP TABLE IF EXISTS lesson_sessions;
DROP TABLE IF EXISTS user_question_state;
DROP TABLE IF EXISTS questions;
DROP TYPE  IF EXISTS question_type;
DROP TYPE  IF EXISTS question_difficulty;
DROP TABLE IF EXISTS learning_objectives;
DROP TABLE IF EXISTS papers;
