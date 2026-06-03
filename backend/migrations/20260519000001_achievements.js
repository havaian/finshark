// Achievements - a parallel, multi-level progression system that lives ALONGSIDE
// the existing binary `badges` system (don't conflate the two).
//
// Design:
//   achievements              - static catalog. `code` is the stable key
//                               referenced from src/achievements/achievements.rules.ts
//                               and from user_achievement_progress.achievement_code.
//                               `levels` is a jsonb array - each element shaped
//                               as { level: int, threshold: int, name_en: text,
//                               name_ru: text }. We keep levels inline (rather
//                               than a separate achievement_levels table) because
//                               we'll only ever query the whole achievement
//                               row together with its levels; a join here would
//                               just add round-trips for no payoff.
//
//   user_achievement_progress - one row per (user, achievement). Tracks the
//                               raw metric value (e.g. lessons completed),
//                               the highest level the user has unlocked so far
//                               (0 = none yet), and a jsonb map of
//                               { "1": "2026-05-19T...", "2": "..." } recording
//                               when each level was first crossed. The map is
//                               additive - never overwritten - so we can show
//                               "earned Trainee on X date" later.
//
// Why a single `current_value` instead of recomputing per-rule on the fly?
//   The evaluator pushes the value in (computed from raw metrics), so the
//   row is the authoritative cache for the progress bar. Recomputing in the
//   API request path would mean re-running the aggregate queries on every
//   profile page load. The evaluator already runs after every session
//   completion, so the row is always within one session's lag of the truth.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('achievements', {
    code: { type: 'text', primaryKey: true },
    name_en: { type: 'text', notNull: true },
    name_ru: { type: 'text' },
    description_en: { type: 'text', notNull: true },
    description_ru: { type: 'text' },
    icon: { type: 'text', notNull: true, default: '✦' },
    sort_order: { type: 'integer', notNull: true, default: 0 },
    // jsonb array of { level: int, threshold: int, name_en: text, name_ru: text }
    // ordered ascending by `level`. Threshold semantics: current_value >= threshold
    // unlocks that level. The seeder validates the shape; we don't add a CHECK
    // constraint because jsonb constraints get clumsy.
    levels: { type: 'jsonb', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });

  pgm.createTable('user_achievement_progress', {
    id: { type: 'bigserial', primaryKey: true },
    user_id: {
      type: 'bigint',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    achievement_code: {
      type: 'text',
      notNull: true,
      references: 'achievements(code)',
      // RESTRICT so we never accidentally drop a catalog row that users have
      // progress against. Mirrors how user_badges.badge_code behaves.
      onDelete: 'RESTRICT',
    },
    // Latest cached metric value (e.g. 47 lessons completed). NOT NULL with
    // default 0 so the row can be inserted before the evaluator has run.
    current_value: { type: 'integer', notNull: true, default: 0 },
    // Highest unlocked level. 0 means "in catalogue but not unlocked yet".
    current_level: { type: 'integer', notNull: true, default: 0 },
    // { "1": "ISO8601 timestamp", "2": "...", ... } - earned-at per level.
    // jsonb (not jsonb[]) because we want key-based lookups / partial updates.
    unlocked_at_per_level: {
      type: 'jsonb',
      notNull: true,
      default: pgm.func(`'{}'::jsonb`),
    },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });

  // One progress row per (user, achievement). The evaluator relies on this
  // uniqueness for its INSERT ... ON CONFLICT upsert path.
  pgm.addConstraint('user_achievement_progress', 'uq_user_achievement', {
    unique: ['user_id', 'achievement_code'],
  });

  // Fast path for "all achievements for user X" (profile page render).
  pgm.createIndex('user_achievement_progress', 'user_id', {
    name: 'idx_user_achievement_progress_user',
  });

  // Auto-update updated_at on both tables. The set_updated_at() trigger
  // function already exists from 20260511000003_content_and_srs.
  pgm.sql(`
    CREATE TRIGGER trg_achievements_updated_at
      BEFORE UPDATE ON achievements
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `);
  pgm.sql(`
    CREATE TRIGGER trg_user_achievement_progress_updated_at
      BEFORE UPDATE ON user_achievement_progress
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `);
};

exports.down = (pgm) => {
  pgm.sql('DROP TRIGGER IF EXISTS trg_user_achievement_progress_updated_at ON user_achievement_progress');
  pgm.sql('DROP TRIGGER IF EXISTS trg_achievements_updated_at ON achievements');
  pgm.dropTable('user_achievement_progress');
  pgm.dropTable('achievements');
};
