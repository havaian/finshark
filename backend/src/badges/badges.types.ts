// DB row shapes
export interface BadgeRow {
  code: string;
  name_en: string;
  name_ru: string | null;
  description_en: string;
  description_ru: string | null;
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

// Localized shape sent to the frontend — single language string per copy
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

export type Lang = 'en' | 'ru';

export function toPublicBadge(
  row: BadgeRow,
  earned_at: Date | null,
  lang: Lang,
): PublicBadge {
  return {
    code: row.code,
    name: lang === 'ru' && row.name_ru ? row.name_ru : row.name_en,
    description:
      lang === 'ru' && row.description_ru
        ? row.description_ru
        : row.description_en,
    icon: row.icon,
    sort_order: row.sort_order,
    earned: earned_at !== null,
    earned_at: earned_at ? earned_at.toISOString() : null,
  };
}
