// Collapse the four per-paper achievement ladders (f1/f2/f3/f5_lessons_completed)
// into a single "paper_specialist" achievement. Rationale documented in the
// gamification audit: four identical-threshold ladders for separate papers
// produced a wall of locked tiles without meaningfully motivating cross-paper
// study. The new single achievement rewards depth in any one paper:
// "first paper to 50 / 100 / 200 lessons."
//
// Migration responsibilities:
//   1. Delete user_achievement_progress rows for the four obsolete codes.
//      Required because achievements.code has ON DELETE RESTRICT — we can't
//      drop the catalog row while progress references it.
//   2. Delete the four catalog rows from achievements.
//   3. The new 'paper_specialist' catalog row is inserted by the seed
//      (src/seed/data/achievements.ts), not here — keeps the catalog source
//      of truth in one place. Run `pnpm db:seed` after migrating.
//
// Down: re-inserts the four catalog rows so the migration is reversible.
// Progress rows are NOT restored — we deleted them above and don't have a
// way to recompute them. Existing users would start fresh on the ladders.

exports.shorthands = undefined;

const OBSOLETE_CODES = [
  'f1_lessons_completed',
  'f2_lessons_completed',
  'f3_lessons_completed',
  'f5_lessons_completed',
];

exports.up = (pgm) => {
  // Order matters: progress rows reference the catalog with ON DELETE RESTRICT.
  pgm.sql(`
    DELETE FROM user_achievement_progress
    WHERE achievement_code = ANY(ARRAY[${OBSOLETE_CODES.map((c) => `'${c}'`).join(', ')}])
  `);
  pgm.sql(`
    DELETE FROM achievements
    WHERE code = ANY(ARRAY[${OBSOLETE_CODES.map((c) => `'${c}'`).join(', ')}])
  `);
};

exports.down = (pgm) => {
  // Restore catalog rows from the seed shape verbatim so a roll-back leaves
  // the achievements catalog in the same state as before this migration.
  // Sort_order values match the original seed at the time of writing.
  pgm.sql(`
    INSERT INTO achievements (code, name_en, name_ru, description_en, description_ru, icon, sort_order, levels)
    VALUES
      ('f1_lessons_completed', 'F1 lessons completed', 'Завершено уроков по F1',
       'Complete lessons covering F1 — Business and Technology.',
       'Завершите уроки по предмету F1 — Бизнес и технологии.',
       '🏢', 110,
       '[{"level":1,"threshold":3,"name_en":"Trainee","name_ru":"Стажёр"},{"level":2,"threshold":15,"name_en":"Affiliate","name_ru":"Аффилиат"},{"level":3,"threshold":50,"name_en":"Member","name_ru":"Член ACCA"}]'::jsonb),
      ('f2_lessons_completed', 'F2 lessons completed', 'Завершено уроков по F2',
       'Complete lessons covering F2 — Management Accounting.',
       'Завершите уроки по предмету F2 — Управленческий учёт.',
       '📊', 120,
       '[{"level":1,"threshold":3,"name_en":"Trainee","name_ru":"Стажёр"},{"level":2,"threshold":15,"name_en":"Affiliate","name_ru":"Аффилиат"},{"level":3,"threshold":50,"name_en":"Member","name_ru":"Член ACCA"}]'::jsonb),
      ('f3_lessons_completed', 'F3 lessons completed', 'Завершено уроков по F3',
       'Complete lessons covering F3 — Financial Accounting.',
       'Завершите уроки по предмету F3 — Финансовый учёт.',
       '📒', 130,
       '[{"level":1,"threshold":3,"name_en":"Trainee","name_ru":"Стажёр"},{"level":2,"threshold":15,"name_en":"Affiliate","name_ru":"Аффилиат"},{"level":3,"threshold":50,"name_en":"Member","name_ru":"Член ACCA"}]'::jsonb),
      ('f5_lessons_completed', 'F5 lessons completed', 'Завершено уроков по F5',
       'Complete lessons covering F5 — Performance Management.',
       'Завершите уроки по предмету F5 — Управление эффективностью.',
       '📈', 140,
       '[{"level":1,"threshold":3,"name_en":"Trainee","name_ru":"Стажёр"},{"level":2,"threshold":15,"name_en":"Affiliate","name_ru":"Аффилиат"},{"level":3,"threshold":50,"name_en":"Member","name_ru":"Член ACCA"}]'::jsonb)
    ON CONFLICT (code) DO NOTHING
  `);
};
