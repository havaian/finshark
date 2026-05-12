-- migrate:up

-- Hard cutover to Google-only auth.
-- After this runs, email/password is gone. No existing-user transition logic.
--
-- google_sub = Google's stable user identifier ("sub" claim in their ID token).
-- This NEVER changes for a given Google account even if email changes, so it's
-- the right join key. Email is kept on the user row (Google gives it to us)
-- but should be treated as derived data, not the auth key.

BEGIN;

-- Remove password-based auth column. No data to preserve in a hard cutover.
ALTER TABLE users
  DROP COLUMN password_hash;

-- Stable Google identifier. Required for any user logging in via Google.
ALTER TABLE users
  ADD COLUMN google_sub TEXT NOT NULL UNIQUE;

-- Helpful index on email for the auto-link lookup. Email is already unique
-- from the original migration (citext + UNIQUE), so this just speeds lookups.
-- (No-op if the existing unique constraint already provides a usable btree.)

-- refresh_tokens table is unchanged; it's keyed by user_id, not auth method.

COMMIT;

-- migrate:down

BEGIN;

-- Re-adding password_hash as NOT NULL would fail on any existing rows.
-- Make it nullable on rollback; if you genuinely need to roll back you'll need
-- to populate it out-of-band.
ALTER TABLE users
  ADD COLUMN password_hash TEXT;

ALTER TABLE users
  DROP COLUMN google_sub;

COMMIT;
