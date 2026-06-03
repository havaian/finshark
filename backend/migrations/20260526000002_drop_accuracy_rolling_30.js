// Drop the `accuracy_rolling_30` achievement. The progress bar mechanics
// (current % vs target %) and the hidden 20-attempt activation gate made it
// confusing - users couldn't tell why their progress was "stuck at 0" or
// what they had to do to advance. The `perfect_lessons` achievement already
// rewards quality, so removing this one isn't a net loss.
//
// Same shape as 20260525000008_collapse_paper_achievements.js:
//   1. Delete user_achievement_progress rows (ON DELETE RESTRICT on the FK
//      means we have to clear progress before dropping the catalog row).
//   2. Delete the catalog row.
//
// Down: re-insert the catalog row verbatim from the original seed shape.
// Progress is NOT restored - we have no way to recompute the historical
// values, and the catalog re-insert is enough to make the migration
// technically reversible (users would start at 0% on rollback).

exports.shorthands = undefined;

const OBSOLETE_CODE = 'accuracy_rolling_30';

exports.up = (pgm) => {
  pgm.sql(`
    DELETE FROM user_achievement_progress
    WHERE achievement_code = '${OBSOLETE_CODE}'
  `);
  pgm.sql(`
    DELETE FROM achievements
    WHERE code = '${OBSOLETE_CODE}'
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    INSERT INTO achievements (code, name_en, name_ru, description_en, description_ru, icon, sort_order, levels)
    VALUES (
      'accuracy_rolling_30',
      'Rolling 30-day accuracy',
      'Точность за 30 дней',
      'Your % correct across the last 30 days. Needs at least 20 attempts in that window to start counting. Unlock the next tier by hitting 60% → 75% → 90%.',
      'Ваш % правильных ответов за последние 30 дней. Нужно минимум 20 ответов за этот срок. Открывайте следующий уровень при 60% → 75% → 90%.',
      '🎯', 200,
      '[{"level":1,"threshold":60,"name_en":"Trainee","name_ru":"Стажёр"},{"level":2,"threshold":75,"name_en":"Affiliate","name_ru":"Аффилиат"},{"level":3,"threshold":90,"name_en":"Member","name_ru":"Член ACCA"}]'::jsonb
    )
    ON CONFLICT (code) DO NOTHING
  `);
};
