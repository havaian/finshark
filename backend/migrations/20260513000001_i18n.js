// Localization (i18n) — schema additions.
//
// Two parts:
//   A) Per-language columns on papers / learning_objectives / questions for UGC.
//      English fields are NOT NULL (required canonical form). Russian fields are
//      NULL-able; the frontend falls back to English when the Russian translation
//      is missing. This pattern lets us add more languages later without
//      backfilling everything at once.
//
//   B) ui_translations(key, lang, value) — DB-backed overrides for UI strings.
//      The frontend ships static locale files as the source of truth; rows in
//      this table override individual keys at runtime so admins can fix wording
//      without a redeploy.
//
// MCQ options: questions.options is JSONB. We change the inner shape from
// {key, text} to {key, text_en, text_ru?}. The application layer is responsible
// for that shape — the existing CHECK constraint only requires the JSON be an array.

exports.shorthands = undefined;

exports.up = (pgm) => {
  // ── A) UGC i18n columns ────────────────────────────────────

  // papers.name → name_en (NOT NULL), name_ru (NULL).
  // Use rename + add rather than drop, so any existing dev rows keep their text in EN.
  pgm.renameColumn('papers', 'name', 'name_en');
  pgm.addColumns('papers', {
    name_ru: { type: 'text' }, // nullable; frontend falls back to name_en
  });

  // learning_objectives: title + description.
  pgm.renameColumn('learning_objectives', 'title', 'title_en');
  pgm.renameColumn('learning_objectives', 'description', 'description_en');
  pgm.addColumns('learning_objectives', {
    title_ru: { type: 'text' },
    description_ru: { type: 'text' },
  });

  // questions: prompt + explanation + concept_bite + correct_answer (only short_answer).
  // correct_answer for MCQ is an option KEY (e.g. "A") so it doesn't need translation.
  // correct_answer for short_answer is the canonical answer text — translated
  // separately so RU grading can match RU input.
  pgm.renameColumn('questions', 'prompt', 'prompt_en');
  pgm.renameColumn('questions', 'explanation', 'explanation_en');
  pgm.renameColumn('questions', 'concept_bite', 'concept_bite_en');
  pgm.renameColumn('questions', 'correct_answer', 'correct_answer_en');
  pgm.addColumns('questions', {
    prompt_ru: { type: 'text' },
    explanation_ru: { type: 'text' },
    concept_bite_ru: { type: 'text' },
    correct_answer_ru: { type: 'text' },
  });

  // ── B) UI translations table ───────────────────────────────

  pgm.createTable('ui_translations', {
    // No surrogate key — natural composite PK on (key, lang).
    key: { type: 'text', notNull: true },           // e.g. 'dashboard.welcome'
    lang: { type: 'text', notNull: true },           // 'en' | 'ru' — app-validated
    value: { type: 'text', notNull: true },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.addConstraint('ui_translations', 'ui_translations_pkey', {
    primaryKey: ['key', 'lang'],
  });
  // Cheap lookup of "all overrides for language X" — used by frontend on app boot.
  pgm.createIndex('ui_translations', 'lang', { name: 'idx_ui_translations_lang' });

  // The same updated_at trigger that fires on the other tables. The trigger
  // function (set_updated_at) was created in the content migration.
  pgm.sql(`
    CREATE TRIGGER trg_ui_translations_updated_at
      BEFORE UPDATE ON ui_translations
      FOR EACH ROW
      EXECUTE FUNCTION set_updated_at()
  `);
};

exports.down = (pgm) => {
  // ── B) Drop ui_translations ────────────────────────────────
  pgm.sql('DROP TRIGGER IF EXISTS trg_ui_translations_updated_at ON ui_translations');
  pgm.dropTable('ui_translations');

  // ── A) Drop _ru columns and rename _en back to original names ──
  pgm.dropColumns('questions', [
    'prompt_ru',
    'explanation_ru',
    'concept_bite_ru',
    'correct_answer_ru',
  ]);
  pgm.renameColumn('questions', 'prompt_en', 'prompt');
  pgm.renameColumn('questions', 'explanation_en', 'explanation');
  pgm.renameColumn('questions', 'concept_bite_en', 'concept_bite');
  pgm.renameColumn('questions', 'correct_answer_en', 'correct_answer');

  pgm.dropColumns('learning_objectives', ['title_ru', 'description_ru']);
  pgm.renameColumn('learning_objectives', 'title_en', 'title');
  pgm.renameColumn('learning_objectives', 'description_en', 'description');

  pgm.dropColumns('papers', ['name_ru']);
  pgm.renameColumn('papers', 'name_en', 'name');
};
