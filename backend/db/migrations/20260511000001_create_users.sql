-- migrate:up

-- citext extension is required for case-insensitive email uniqueness.
-- If your DB role lacks privileges to CREATE EXTENSION, run as a superuser once:
--   CREATE EXTENSION IF NOT EXISTS citext;
-- and remove the line below before re-running the migration.
CREATE EXTENSION IF NOT EXISTS citext;

CREATE TABLE users (
  id            BIGSERIAL PRIMARY KEY,
  email         CITEXT NOT NULL UNIQUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- migrate:down
DROP TABLE IF EXISTS users;
-- We deliberately do NOT drop the citext extension in down(); other schemas may use it.
