// DB row shapes

export interface AchievementLevelRow {
  level: number;
  threshold: number;
  name_en: string;
  name_ru: string | null;
  // Optional: older seeded `levels` jsonb blobs predate Uzbek support, so a
  // missing key is normal and resolves to the EN name.
  name_uz?: string | null;
}

export interface AchievementRow {
  code: string;
  name_en: string;
  name_ru: string | null;
  name_uz: string | null;
  description_en: string;
  description_ru: string | null;
  description_uz: string | null;
  icon: string;
  sort_order: number;
  // jsonb column - postgres.js returns it pre-parsed.
  levels: AchievementLevelRow[];
  created_at: Date;
  updated_at: Date;
}

export interface UserAchievementProgressRow {
  id: string;
  user_id: string;
  achievement_code: string;
  current_value: number;
  current_level: number;
  // jsonb map: { "1": "ISO timestamp", "2": "..." }
  unlocked_at_per_level: Record<string, string>;
  created_at: Date;
  updated_at: Date;
}

export type Lang = "en" | "ru" | "uz";

// What the frontend consumes - localised, with progress-bar fields pre-computed
// so the UI doesn't need to think about thresholds.
export interface PublicAchievementLevel {
  level: number;
  threshold: number;
  name: string; // localised (en/ru)
  unlocked: boolean;
  unlocked_at: string | null; // ISO timestamp, null if not unlocked
}

export interface PublicAchievement {
  code: string;
  name: string;
  description: string;
  icon: string;
  sort_order: number;
  current_value: number;
  current_level: number; // 0..N
  max_level: number; // total levels defined
  // Highest level the user has unlocked (mirrors current_level, or null if 0).
  // Helps the UI render "Trainee / Affiliate / Member" badge text.
  current_level_name: string | null;
  // Threshold of the NEXT level the user is working towards. null if they've
  // already maxed out (current_level == max_level), in which case the progress
  // bar should render as full.
  next_threshold: number | null;
  next_level_name: string | null;
  levels: PublicAchievementLevel[];
}

// Earned-only shape for the public profile (someone else's view). Strips
// progress info - outsiders only see the highest unlocked level + when.
export interface PublicEarnedAchievement {
  code: string;
  name: string;
  description: string;
  icon: string;
  sort_order: number;
  current_level: number;
  current_level_name: string; // we only include earned (level >= 1) so this is non-null
  unlocked_at: string | null; // when current_level was unlocked
}

// Achievement copy falls back to EN when a translation is missing - same
// reasoning as badges: chrome, not exam content.
function pickLang(
  en: string,
  ru: string | null,
  uz: string | null | undefined,
  lang: Lang
): string {
  if (lang === "ru") return ru || en;
  if (lang === "uz") return uz || en;
  return en;
}

// Build the full public payload (used on /me/achievements). Includes locked
// achievements with current_level=0 and a 0 / threshold-1 progress bar.
export function toPublicAchievement(
  row: AchievementRow,
  progress: UserAchievementProgressRow | null,
  lang: Lang
): PublicAchievement {
  // Sort levels ascending by `level` defensively - the seed gives us ascending
  // order already, but jsonb makes no ordering guarantees on insertion.
  const sorted = [...row.levels].sort((a, b) => a.level - b.level);

  const currentValue = progress?.current_value ?? 0;
  const currentLevel = progress?.current_level ?? 0;
  const unlockedMap = progress?.unlocked_at_per_level ?? {};

  const levels: PublicAchievementLevel[] = sorted.map((lv) => ({
    level: lv.level,
    threshold: lv.threshold,
    name: pickLang(lv.name_en, lv.name_ru, lv.name_uz, lang),
    unlocked: lv.level <= currentLevel,
    unlocked_at: unlockedMap[String(lv.level)] ?? null,
  }));

  const current_level_name =
    currentLevel > 0
      ? levels.find((l) => l.level === currentLevel)?.name ?? null
      : null;

  const nextLevelRow = sorted.find((lv) => lv.level === currentLevel + 1);
  const next_threshold = nextLevelRow?.threshold ?? null;
  const next_level_name = nextLevelRow
    ? pickLang(
        nextLevelRow.name_en,
        nextLevelRow.name_ru,
        nextLevelRow.name_uz,
        lang
      )
    : null;

  return {
    code: row.code,
    name: pickLang(row.name_en, row.name_ru, row.name_uz, lang),
    description: pickLang(
      row.description_en,
      row.description_ru,
      row.description_uz,
      lang
    ),
    icon: row.icon,
    sort_order: row.sort_order,
    current_value: currentValue,
    current_level: currentLevel,
    max_level: sorted.length,
    current_level_name,
    next_threshold,
    next_level_name,
    levels,
  };
}

// Strip down to earned-only view for the public-profile endpoint. Returns
// null if the user hasn't unlocked level >= 1 (caller should filter these out).
export function toPublicEarnedAchievement(
  row: AchievementRow,
  progress: UserAchievementProgressRow | null,
  lang: Lang
): PublicEarnedAchievement | null {
  const currentLevel = progress?.current_level ?? 0;
  if (currentLevel < 1) return null;

  const sorted = [...row.levels].sort((a, b) => a.level - b.level);
  const lvRow = sorted.find((lv) => lv.level === currentLevel);
  if (!lvRow) return null;

  const unlockedMap = progress?.unlocked_at_per_level ?? {};

  return {
    code: row.code,
    name: pickLang(row.name_en, row.name_ru, row.name_uz, lang),
    description: pickLang(
      row.description_en,
      row.description_ru,
      row.description_uz,
      lang
    ),
    icon: row.icon,
    sort_order: row.sort_order,
    current_level: currentLevel,
    current_level_name: pickLang(lvRow.name_en, lvRow.name_ru, lvRow.name_uz, lang),
    unlocked_at: unlockedMap[String(currentLevel)] ?? null,
  };
}
