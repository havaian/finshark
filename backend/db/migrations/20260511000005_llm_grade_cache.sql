-- migrate:up

-- Cache of LLM grading verdicts.
-- Key: question_id + normalized user answer (lowercased, trimmed, single-spaced).
-- We dedupe identical answers across users so the LLM is only called once per
-- (question, distinct-answer) pair.
CREATE TABLE llm_grade_cache (
  id                       BIGSERIAL PRIMARY KEY,
  question_id              BIGINT      NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
  normalized_user_answer   TEXT        NOT NULL,
  is_correct               BOOLEAN     NOT NULL,
  confidence               REAL,                                  -- 0..1, nullable for older verdicts
  reasoning                TEXT,                                  -- human-readable explanation from the model
  provider                 TEXT        NOT NULL,                  -- 'openai' | 'anthropic' | 'exact_match'
  model                    TEXT        NOT NULL,                  -- model id used
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (question_id, normalized_user_answer)
);

CREATE INDEX idx_llm_grade_cache_question ON llm_grade_cache(question_id);

-- migrate:down

DROP TABLE IF EXISTS llm_grade_cache;
