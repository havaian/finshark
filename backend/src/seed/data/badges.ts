// Static catalog of badges. Seeded into the badges table on `npm run db:seed`.
// Updates to copy/icon/sort_order are upserted (idempotent) on every run.
//
// Rules: never rename a `code`. It's the stable key referenced in
//   - src/badges/rules.ts (rule evaluator)
//   - user_badges.badge_code FK
//
// Adding a new badge:
//   1) Append a record here.
//   2) Add the matching rule in src/badges/rules.ts.
//   3) Run the seed; existing users will earn it on their next session if they
//      satisfy the rule.

export interface SeedBadge {
  code: string;
  name_en: string;
  name_ru: string;
  description_en: string;
  description_ru: string;
  icon: string;
  sort_order: number;
}

// Streak / XP threshold badges were removed in migration
// 20260525000001_drop_duplicate_streak_xp_badges — the streak_days and
// xp_earned achievement ladders already cover those milestones with the
// same thresholds. Keep this catalog reserved for discovery / event-style
// recognition (first lesson, cross-paper learner, LO mastery, etc.).
export const BADGES: SeedBadge[] = [
  // ── Paper exploration ──────────────────────────────────────────────
  {
    code: "paper_started",
    name_en: "First step",
    name_ru: "Первый шаг",
    description_en: "Completed your first lesson.",
    description_ru: "Завершили первый урок.",
    icon: "◐",
    sort_order: 30,
  },
  {
    code: "paper_explorer",
    name_en: "Cross-trainer",
    name_ru: "Кросс-тренинг",
    description_en: "Studied lessons across 3 different papers.",
    description_ru: "Занимались по 3 разным предметам.",
    icon: "◑",
    sort_order: 31,
  },

  // ── Mastery ────────────────────────────────────────────────────────
  {
    code: "lo_mastered_1",
    name_en: "Topic locked in",
    name_ru: "Тема освоена",
    description_en: "Reached 90% mastery on a learning objective.",
    description_ru: "Достигли 90% освоения темы.",
    icon: "✓",
    sort_order: 40,
  },
  {
    code: "lo_mastered_10",
    name_en: "Specialist",
    name_ru: "Специалист",
    description_en: "Reached 90% mastery on 10 learning objectives.",
    description_ru: "Достигли 90% освоения по 10 темам.",
    icon: "✓",
    sort_order: 41,
  },
];

// Codes a backend rule evaluator must recognize. Used by tests / sanity checks
// to assert that every catalog entry has a corresponding rule.
export const BADGE_CODES = BADGES.map((b) => b.code);
