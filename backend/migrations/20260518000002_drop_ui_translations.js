// Drop the ui_translations table.
//
// Overrides are now stored as JSON files on the backend filesystem
// (backend/locales/en.json, ru.json). The admin API and public read endpoint
// keep the same shape — only the storage layer changed.
//
// Migration cost: a no-op for fresh installs, a single DROP for installs that
// had overrides. Any rows currently in the table are intentionally NOT
// migrated to the JSON files — admin overrides historically have been used
// only for fixing copy after a release, so the small one-time loss is
// acceptable. If your installation had important overrides, export them
// manually before running this migration:
//
//   SELECT json_object_agg(key, value) FROM ui_translations WHERE lang = 'en';
//   SELECT json_object_agg(key, value) FROM ui_translations WHERE lang = 'ru';
//
// and paste each result into backend/locales/{en,ru}.json.

exports.shorthands = undefined;

exports.up = (pgm) => {
  // Trigger first (FK to the trigger fn), then table.
  pgm.sql('DROP TRIGGER IF EXISTS trg_ui_translations_updated_at ON ui_translations');
  pgm.dropTable('ui_translations', { ifExists: true });
};

// Rollback recreates the empty table — useful if you `db:down` to a state
// before this migration and want to re-test the old DB-backed path.
// Note: it does NOT repopulate rows from the JSON files; you'd need a manual
// import step for that, mirroring the up() comment above in reverse.
exports.down = (pgm) => {
  pgm.createTable('ui_translations', {
    key: { type: 'text', notNull: true },
    lang: { type: 'text', notNull: true },
    value: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.addConstraint('ui_translations', 'ui_translations_pkey', {
    primaryKey: ['key', 'lang'],
  });
  pgm.createIndex('ui_translations', 'lang', { name: 'idx_ui_translations_lang' });
  pgm.sql(`
    CREATE TRIGGER trg_ui_translations_updated_at
      BEFORE UPDATE ON ui_translations
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at()
  `);
};
