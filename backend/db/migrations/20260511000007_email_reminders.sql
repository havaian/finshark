-- migrate:up

ALTER TABLE users
  ADD COLUMN email_reminders_enabled BOOLEAN NOT NULL DEFAULT TRUE;

-- One row per (user, reminder_date). Dedups duplicate sends from cron retries or
-- multi-instance deployments. (user_id, reminder_date) is the natural key.
CREATE TABLE reminder_emails_sent (
  user_id        BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  reminder_date  DATE   NOT NULL,
  sent_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, reminder_date)
);

-- migrate:down

DROP TABLE IF EXISTS reminder_emails_sent;

ALTER TABLE users
  DROP COLUMN IF EXISTS email_reminders_enabled;
