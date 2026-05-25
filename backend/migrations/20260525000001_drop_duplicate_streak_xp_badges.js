// Drop the streak_7/30/100 and xp_500/2500/10000 badges from the catalog.
//
// CONTEXT: these six badges duplicated thresholds already covered by the
//   `streak_days` and `xp_earned` achievement ladders (3 levels each). Two
//   surfaces telling the user the same thing was visual clutter on the
//   profile and made achievements feel less differentiated. Badges going
//   forward are reserved for discovery/event recognition (first lesson,
//   cross-trainer, LO mastery), not threshold mirrors.
//
// ORDER MATTERS: user_badges.badge_code REFERENCES badges(code) ON DELETE
//   RESTRICT, so we MUST sweep user_badges first, then the catalog rows.
//
// IRREVERSIBLE FOR USER DATA: down recreates the catalog rows from the seed
//   spec (so the schema/catalog is restored) but cannot resurrect the
//   per-user earned_at timestamps. Document in the team channel before
//   running. The achievements ladder already credits the same milestones via
//   the streak_days/xp_earned codes, so users don't lose recognition for
//   reaching the threshold — only the badge tile disappears.
//
// SEED ALIGNMENT: src/seed/data/badges.ts is updated in the same commit to
//   drop these codes from the static catalog, so a future reseed will not
//   reintroduce them.

const DROPPED_CODES = [
  'streak_7',
  'streak_30',
  'streak_100',
  'xp_500',
  'xp_2500',
  'xp_10000',
];

// Inlined IN list. node-pg-migrate's pgm.sql() takes a string only — it does
// NOT accept a {text, values} parameterised form. Inlining is safe here
// because the values are hardcoded constants from this file, not user input,
// so there's nothing to SQL-inject.
const IN_LIST = DROPPED_CODES.map((c) => `'${c}'`).join(', ');

exports.shorthands = undefined;

exports.up = (pgm) => {
  // 1) Sweep earned rows for the dropped codes. user_badges.badge_code is
  //    ON DELETE RESTRICT, so we MUST clear referrers before deleting the
  //    catalog rows below.
  pgm.sql(`DELETE FROM user_badges WHERE badge_code IN (${IN_LIST})`);

  // 2) Drop the catalog rows. Now safe because the FK has nothing to RESTRICT.
  pgm.sql(`DELETE FROM badges WHERE code IN (${IN_LIST})`);
};

exports.down = (pgm) => {
  // Recreate the catalog rows so the schema matches a pre-deletion snapshot.
  // Copy the original copy from src/seed/data/badges.ts as it existed before
  // this migration. The seed runner will upsert again on next reseed anyway,
  // but having the rows back keeps any historical analytics that reference
  // these codes resolvable.
  //
  // Per-user earnings cannot be reconstructed — see header.
  pgm.sql(`
    INSERT INTO badges (code, name_en, name_ru, description_en, description_ru, icon, sort_order)
    VALUES
      ('streak_7',   'On a roll',          'В ритме',             'Studied for 7 days in a row.',   'Занимались 7 дней подряд.',   '🔥', 10),
      ('streak_30',  'Month of momentum',  'Месяц подряд',        'Studied for 30 days in a row.',  'Занимались 30 дней подряд.',  '🔥', 11),
      ('streak_100', 'Centurion',          'Сто дней',            'Studied for 100 days in a row.', 'Занимались 100 дней подряд.', '🔥', 12),
      ('xp_500',     'Getting started',    'Старт',               'Earned 500 XP total.',           'Набрали 500 опыта.',          '✦', 20),
      ('xp_2500',    'Building up',        'Набирает обороты',    'Earned 2,500 XP total.',         'Набрали 2 500 опыта.',        '✦', 21),
      ('xp_10000',   'Marathon mind',      'Марафонец',           'Earned 10,000 XP total.',        'Набрали 10 000 опыта.',       '✦', 22)
    ON CONFLICT (code) DO NOTHING
  `);
};
