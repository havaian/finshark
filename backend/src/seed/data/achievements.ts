// Static catalog of achievements. Seeded into the `achievements` table on
// `npm run db:seed` and re-upserted on every reseed.
//
// Achievements differ from badges in three ways:
//   1) Multi-level. Each achievement has 3 levels (Trainee / Affiliate /
//      Member — ACCA-themed) with ascending thresholds.
//   2) Progress is tracked continuously (current_value), not just earned/not.
//   3) Evaluator pushes a metric value in — see src/achievements/achievements.rules.ts.
//
// Adding a new achievement:
//   1) Append a record here.
//   2) Add the matching metric in src/achievements/achievements.rules.ts.
//   3) Run the seed; existing users will start tracking on their next
//      lesson completion (the evaluator inserts the progress row on first
//      evaluation).
//
// Rules: never rename a `code`. It's the stable key referenced in
//   - src/achievements/achievements.rules.ts (metric mapping)
//   - user_achievement_progress.achievement_code FK

export interface SeedAchievementLevel {
  level: number;       // 1, 2, 3
  threshold: number;   // current_value >= threshold unlocks this level
  name_en: string;     // e.g. "Trainee"
  name_ru: string;
}

export interface SeedAchievement {
  code: string;
  name_en: string;
  name_ru: string;
  description_en: string;
  description_ru: string;
  icon: string;
  sort_order: number;
  levels: SeedAchievementLevel[];
}

// ACCA-themed level names — same trio across all achievements so the
// progression terminology is consistent.
const LEVEL_NAMES = {
  trainee:   { name_en: 'Trainee',   name_ru: 'Стажёр'  },
  affiliate: { name_en: 'Affiliate', name_ru: 'Аффилиат' },
  member:    { name_en: 'Member',    name_ru: 'Член ACCA' },
};

export const ACHIEVEMENTS: SeedAchievement[] = [
  {
    code: 'lessons_completed',
    name_en: 'Lessons completed',
    name_ru: 'Завершено уроков',
    description_en: 'Complete lesson sessions.',
    description_ru: 'Завершите уроки.',
    icon: '📚',
    sort_order: 10,
    levels: [
      { level: 1, threshold: 10,  ...LEVEL_NAMES.trainee   },
      { level: 2, threshold: 50,  ...LEVEL_NAMES.affiliate },
      { level: 3, threshold: 200, ...LEVEL_NAMES.member    },
    ],
  },
  {
    code: 'streak_days',
    name_en: 'Daily streak',
    name_ru: 'Серия дней',
    description_en: 'Study on consecutive days.',
    description_ru: 'Занимайтесь несколько дней подряд.',
    icon: '🔥',
    sort_order: 20,
    levels: [
      { level: 1, threshold: 3,  ...LEVEL_NAMES.trainee   },
      { level: 2, threshold: 14, ...LEVEL_NAMES.affiliate },
      { level: 3, threshold: 30, ...LEVEL_NAMES.member    },
    ],
  },
  {
    code: 'xp_earned',
    name_en: 'XP earned',
    name_ru: 'Заработано XP',
    description_en: 'Accumulate experience points.',
    description_ru: 'Накопите очки опыта.',
    icon: '✨',
    sort_order: 30,
    levels: [
      { level: 1, threshold: 500,   ...LEVEL_NAMES.trainee   },
      { level: 2, threshold: 2500,  ...LEVEL_NAMES.affiliate },
      { level: 3, threshold: 10000, ...LEVEL_NAMES.member    },
    ],
  },
  {
    code: 'perfect_lessons',
    name_en: 'Perfect lessons',
    name_ru: 'Идеальные уроки',
    description_en: 'Complete lessons with 100% accuracy.',
    description_ru: 'Завершите уроки со 100% точностью.',
    icon: '💎',
    sort_order: 40,
    levels: [
      { level: 1, threshold: 5,   ...LEVEL_NAMES.trainee   },
      { level: 2, threshold: 25,  ...LEVEL_NAMES.affiliate },
      { level: 3, threshold: 100, ...LEVEL_NAMES.member    },
    ],
  },
  {
    code: 'mocks_passed',
    name_en: 'Mocks passed',
    name_ru: 'Сданные mock-экзамены',
    description_en: 'Pass mock exams (≥50% score).',
    description_ru: 'Сдайте mock-экзамены (≥50% правильных).',
    icon: '🎓',
    sort_order: 50,
    levels: [
      { level: 1, threshold: 1,  ...LEVEL_NAMES.trainee   },
      { level: 2, threshold: 5,  ...LEVEL_NAMES.affiliate },
      { level: 3, threshold: 20, ...LEVEL_NAMES.member    },
    ],
  },
];
