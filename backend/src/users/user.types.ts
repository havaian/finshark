// Row shape returned by `SELECT * FROM users`. Mirrors the migrations.
// Keep in sync with db/migrations/*_users*.sql, *_google_auth.sql,
// *_user_preferences.sql, *_onboarding.sql
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type BgLevel = 'beginner' | 'intermediate' | 'advanced';

export interface UserRow {
  id: string;                // bigint comes back as string from postgres.js
  email: string;
  google_sub: string;        // Google's stable user identifier (sub claim)
  display_name: string;
  streak_count: number;
  xp: number;
  level: number;
  last_active_date: Date | null;
  is_admin: boolean;
  email_reminders_enabled: boolean;
  reminder_hour_utc: number;                  // 0..23
  preferred_difficulty: QuestionDifficulty | null; // null = auto
  lesson_size: number;                        // 3..10
  // Onboarding fields (3.1)
  bg_level: BgLevel | null;                   // null = skipped or pre-onboarding
  time_budget_minutes: number;                // 5..60, defaults 15
  preferred_paper_id: string | null;          // FK to papers.id, nullable
  onboarded_at: Date | null;                  // null = still needs to onboard
  // Leaderboards (3.3). Opt-in default false — users only appear if they
  // explicitly enable this from Settings or onboarding.
  leaderboard_opt_in: boolean;
  created_at: Date;
  updated_at: Date;
}

// Public-safe shape — never expose google_sub (it's stable identifying data).
export interface PublicUser {
  id: string;
  email: string;
  display_name: string;
  streak_count: number;
  xp: number;
  level: number;
  last_active_date: string | null;
  is_admin: boolean;
  email_reminders_enabled: boolean;
  reminder_hour_utc: number;
  preferred_difficulty: QuestionDifficulty | null;
  lesson_size: number;
  bg_level: BgLevel | null;
  time_budget_minutes: number;
  preferred_paper_id: string | null;
  onboarded_at: string | null; // ISO timestamp or null
  leaderboard_opt_in: boolean;
}

export function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    email: row.email,
    display_name: row.display_name,
    streak_count: row.streak_count,
    xp: row.xp,
    level: row.level,
    last_active_date: row.last_active_date
      ? row.last_active_date.toISOString().slice(0, 10)
      : null,
    is_admin: row.is_admin,
    email_reminders_enabled: row.email_reminders_enabled,
    reminder_hour_utc: row.reminder_hour_utc,
    preferred_difficulty: row.preferred_difficulty,
    lesson_size: row.lesson_size,
    bg_level: row.bg_level,
    time_budget_minutes: row.time_budget_minutes,
    preferred_paper_id: row.preferred_paper_id,
    onboarded_at: row.onboarded_at ? row.onboarded_at.toISOString() : null,
    leaderboard_opt_in: row.leaderboard_opt_in,
  };
}
