// backend/migrations/20260511000007_email_reminders.js
// Adds email_reminders_enabled to users and a dedup table for sent reminders.
// (user_id, reminder_date) is the natural key — prevents duplicate sends from
// cron retries or multi-instance deploys.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.addColumns('users', {
    email_reminders_enabled: { type: 'boolean', notNull: true, default: true },
  });

  pgm.createTable('reminder_emails_sent', {
    user_id: { type: 'bigint', notNull: true, references: 'users(id)', onDelete: 'CASCADE' },
    reminder_date: { type: 'date', notNull: true },
    sent_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.addConstraint('reminder_emails_sent', 'reminder_emails_sent_pkey', {
    primaryKey: ['user_id', 'reminder_date'],
  });
};

exports.down = (pgm) => {
  pgm.dropTable('reminder_emails_sent');
  pgm.dropColumns('users', ['email_reminders_enabled']);
};