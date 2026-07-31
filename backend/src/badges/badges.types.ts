// DB row shapes
export interface BadgeRow {
  code: string;
  name_en: string;
  name_ru: string | null;
  name_uz: string | null;
  description_en: string;
  description_ru: string | null;
  description_uz: string | null;
  icon: string;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface UserBadgeRow {
  id: string;
  user_id: string;
  badge_code: string;
  earned_at: Date;
}

// Localized shape sent to the frontend - single language string per copy
// field plus the earned flag. `earned_at` is null when the badge is in the
// catalog but the user hasn't unlocked it yet (greyed-out in UI).
export interface PublicBadge {
  code: string;
  name: string;
  description: string;
  icon: string;
  sort_order: number;
  earned: boolean;
  earned_at: string | null;
}

export type Lang = "en" | "ru" | "uz";

// Badge copy falls back to EN when a translation is missing. Unlike question
// content (which is hidden outright when untranslated - see isQuestionTranslated)
// a badge is chrome: showing an English badge name is far better than hiding
// the user's achievement.
function pickLang(en: string, ru: string | null, uz: string | null, lang: Lang) {
  if (lang === "ru") return ru || en;
  if (lang === "uz") return uz || en;
  return en;
}

export function toPublicBadge(
  row: BadgeRow,
  earned_at: Date | null,
  lang: Lang
): PublicBadge {
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
    earned: earned_at !== null,
    earned_at: earned_at ? earned_at.toISOString() : null,
  };
}
