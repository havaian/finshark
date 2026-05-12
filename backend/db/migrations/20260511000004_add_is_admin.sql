-- migrate:up

ALTER TABLE users
  ADD COLUMN is_admin BOOLEAN NOT NULL DEFAULT FALSE;

-- After registering yourself, run manually:
--   UPDATE users SET is_admin = TRUE WHERE email = 'you@example.com';

-- migrate:down

ALTER TABLE users
  DROP COLUMN IF EXISTS is_admin;
