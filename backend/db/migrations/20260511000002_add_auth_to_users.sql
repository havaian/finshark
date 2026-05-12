-- migrate:up

ALTER TABLE users
  ADD COLUMN password_hash      TEXT        NOT NULL,
  ADD COLUMN display_name       TEXT        NOT NULL,
  ADD COLUMN streak_count       INT         NOT NULL DEFAULT 0,
  ADD COLUMN xp                 INT         NOT NULL DEFAULT 0,
  ADD COLUMN level              INT         NOT NULL DEFAULT 1,
  ADD COLUMN last_active_date   DATE;

-- Refresh tokens are stored hashed so they can be revoked.
-- One row per active refresh token; rotated on each /auth/refresh call.
CREATE TABLE refresh_tokens (
  id            BIGSERIAL PRIMARY KEY,
  user_id       BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash    TEXT        NOT NULL UNIQUE,
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  revoked_at    TIMESTAMPTZ
);

CREATE INDEX idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX idx_refresh_tokens_expires_at ON refresh_tokens(expires_at);

-- migrate:down

DROP TABLE IF EXISTS refresh_tokens;

ALTER TABLE users
  DROP COLUMN IF EXISTS last_active_date,
  DROP COLUMN IF EXISTS level,
  DROP COLUMN IF EXISTS xp,
  DROP COLUMN IF EXISTS streak_count,
  DROP COLUMN IF EXISTS display_name,
  DROP COLUMN IF EXISTS password_hash;
