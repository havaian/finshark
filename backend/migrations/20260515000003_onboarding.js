// Onboarding columns on users.
//
// bg_level: ACCA background level the user picked at signup. Used ONLY to
//   initialise preferred_difficulty + lesson_size for new accounts; the
//   algorithm itself never reads bg_level afterwards. We keep the column so
//   we can show "you said you were a beginner" on the profile if we ever
//   want to, and so onboarding can pre-fill it when a user revisits it.
//
// time_budget_minutes: how many minutes per day the user wants to study.
//   Used by the lesson queue to derive lesson_size if the user didn't override
//   it. Range 5..60 - outside that is unrealistic for both ends.
//
// preferred_paper_id: their target paper (e.g. the F3 ID). Used to pre-select
//   the paper picker on the dashboard. NULL = no preference set.
//
// onboarded_at: timestamp the user completed (or skipped) onboarding. NULL =
//   still needs to onboard. Frontend guard redirects to /onboarding when NULL.
//   For existing users at migration time we backfill with created_at so they
//   don't get interrupted on their next login.
//
// IMPORTANT: bg_level uses a NEW enum type. Enum extension in Postgres is
//   forward-only (cannot be removed once added) - same situation as the
//   question_type enum extension. The down migration drops the enum entirely;
//   if you've added bg_level values in production this rollback won't be
//   reversible without a full schema rebuild.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createType('bg_level', ['beginner', 'intermediate', 'advanced']);

  pgm.addColumns('users', {
    bg_level: { type: 'bg_level' }, // nullable - never set = skipped or pre-onboarding user
    time_budget_minutes: { type: 'integer', notNull: true, default: 15 },
    preferred_paper_id: {
      type: 'bigint',
      references: 'papers(id)',
      onDelete: 'SET NULL', // paper deleted -> just unset, don't cascade-delete the user
    },
    onboarded_at: { type: 'timestamptz' }, // nullable; null = needs onboarding
  });

  pgm.addConstraint('users', 'chk_time_budget_range', {
    check: 'time_budget_minutes BETWEEN 5 AND 60',
  });

  // Grandfather existing users: anyone who already exists at migration time
  // is treated as "onboarded" with their created_at timestamp so they don't
  // get the wizard on next login. New signups still get NULL → onboarding.
  pgm.sql(`UPDATE users SET onboarded_at = created_at WHERE onboarded_at IS NULL`);
};

exports.down = (pgm) => {
  pgm.dropConstraint('users', 'chk_time_budget_range');
  pgm.dropColumns('users', [
    'bg_level',
    'time_budget_minutes',
    'preferred_paper_id',
    'onboarded_at',
  ]);
  pgm.dropType('bg_level');
};
