-- migrate:up

-- Original question queue for a lesson session, recorded at start time.
-- Lets the frontend resume after reload by intersecting this list with attempts.
CREATE TABLE lesson_session_questions (
  session_id   BIGINT NOT NULL REFERENCES lesson_sessions(id) ON DELETE CASCADE,
  question_id  BIGINT NOT NULL REFERENCES questions(id) ON DELETE RESTRICT,
  position     INT    NOT NULL,
  PRIMARY KEY (session_id, position)
);

CREATE INDEX idx_lsq_session ON lesson_session_questions(session_id);

-- migrate:down

DROP TABLE IF EXISTS lesson_session_questions;
