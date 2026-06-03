// Badges (3.4) - two-table design:
//
//   badges       - static catalog. Code is the stable key referenced in code
//                  and in user_badges. Display copy is bilingual. icon is a
//                  short emoji/symbol rendered in the UI (kept as text rather
//                  than asset paths so we don't depend on a build step). The
//                  table is seeded from src/seed/data/badges.ts and updates
//                  there are upserted by the seed runner - no migrations
//                  needed for copy changes.
//
//   user_badges  - earned events. UNIQUE(user_id, badge_code) so a re-run of
//                  the evaluator can't double-insert. ON DELETE CASCADE from
//                  users so account deletion sweeps badges automatically.
//                  badge_code references badges(code) with ON DELETE RESTRICT
//                  so we can't accidentally drop a catalog row that users
//                  have already earned.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('badges', {
    code: { type: 'text', primaryKey: true },
    name_en: { type: 'text', notNull: true },
    name_ru: { type: 'text' },
    description_en: { type: 'text', notNull: true },
    description_ru: { type: 'text' },
    icon: { type: 'text', notNull: true, default: '★' },
    sort_order: { type: 'integer', notNull: true, default: 0 },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });

  pgm.createTable('user_badges', {
    id: { type: 'bigserial', primaryKey: true },
    user_id: {
      type: 'bigint',
      notNull: true,
      references: 'users(id)',
      onDelete: 'CASCADE',
    },
    badge_code: {
      type: 'text',
      notNull: true,
      references: 'badges(code)',
      onDelete: 'RESTRICT',
    },
    earned_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });

  // One earn per (user, badge). The evaluator relies on this to be idempotent.
  pgm.addConstraint('user_badges', 'uq_user_badge', {
    unique: ['user_id', 'badge_code'],
  });

  // Fast path for "all badges this user has earned", used by the profile grid.
  pgm.createIndex('user_badges', 'user_id', { name: 'idx_user_badges_user' });

  // Auto-update updated_at on badges (the trigger function already exists from
  // 20260511000003_content_and_srs).
  pgm.sql(`
    CREATE TRIGGER trg_badges_updated_at
      BEFORE UPDATE ON badges
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `);
};

exports.down = (pgm) => {
  pgm.sql('DROP TRIGGER IF EXISTS trg_badges_updated_at ON badges');
  pgm.dropTable('user_badges');
  pgm.dropTable('badges');
};
