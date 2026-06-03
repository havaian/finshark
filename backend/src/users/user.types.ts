// Row shape returned by `SELECT * FROM users`. Mirrors the migrations.
// Keep in sync with db/migrations/*_users*.sql, *_google_auth.sql,
// *_user_preferences.sql, *_onboarding.sql
export type QuestionDifficulty = "easy" | "medium" | "hard";
export type BgLevel = "beginner" | "intermediate" | "advanced";

export interface UserRow {
  id: string; // bigint comes back as string from postgres.js
  email: string;
  google_sub: string; // Google's stable user identifier (sub claim)
  display_name: string;
  streak_count: number;
  // See migration 20260525000002 - count of streak freezes the user can
  // spend to cover a single missed day. Granted at every 14-day streak
  // milestone, capped at MAX_FREEZES (src/lessons/srs.ts).
  streak_freezes_remaining: number;
  xp: number;
  level: number;
  last_active_date: Date | null;
  is_admin: boolean;
  email_reminders_enabled: boolean;
  // Hour-of-day (0..23) in the user's `timezone` to send the reminder.
  // Renamed from reminder_hour_utc in 20260526000001 - see that migration
  // for the rationale.
  reminder_hour_local: number;
  preferred_difficulty: QuestionDifficulty | null; // null = auto
  lesson_size: number; // 3..10
  // Onboarding fields (3.1)
  bg_level: BgLevel | null; // null = skipped or pre-onboarding
  time_budget_minutes: number; // 5..60, defaults 15
  preferred_paper_id: string | null; // FK to papers.id, nullable
  onboarded_at: Date | null; // null = still needs to onboard
  // Leaderboards (3.3). Opt-in default false - users only appear if they
  // explicitly enable this from Settings or onboarding.
  leaderboard_opt_in: boolean;
  // 2FA TOTP (admin-only enforcement). totp_secret stores the base32 secret
  // shared with the user's authenticator app; NULL means not enrolled.
  // totp_enrolled_at is set on first successful setup-verify and cleared on
  // disable, kept in lockstep with totp_secret.
  totp_secret: string | null;
  totp_enrolled_at: Date | null;
  // IANA timezone name. Default 'Asia/Tashkent' (UZ launch market). Used by
  // the billing layer to refill the free-tier heart pool at the user's local
  // midnight. See migration 20260525000003_add_user_timezone.js.
  timezone: string;
  // Free-tier daily heart pool. Premium users ignore these (their session
  // hearts come from the per-session default). For free users, the pool IS
  // the session hearts: a session starts with min(pool, 3), wrong answer
  // deducts 1 from the pool, refill at local midnight via
  // ensureFreeHeartPoolRefilled() lazily on the next heart-touching call.
  free_hearts_pool: number; // 0..3
  free_hearts_pool_date: Date | null; // the local date the pool corresponds to
  created_at: Date;
  updated_at: Date;
}

// Public-safe shape - never expose google_sub (it's stable identifying data).
export interface PublicUser {
  id: string;
  email: string;
  display_name: string;
  streak_count: number;
  streak_freezes_remaining: number;
  xp: number;
  level: number;
  last_active_date: string | null;
  is_admin: boolean;
  email_reminders_enabled: boolean;
  reminder_hour_local: number;
  // IANA timezone - exposed to the frontend so Settings can show the picker
  // and the dashboard can localise dates.
  timezone: string;
  preferred_difficulty: QuestionDifficulty | null;
  lesson_size: number;
  bg_level: BgLevel | null;
  time_budget_minutes: number;
  preferred_paper_id: string | null;
  onboarded_at: string | null; // ISO timestamp or null
  leaderboard_opt_in: boolean;
  // 2FA enrollment flag. We expose the boolean only - never the secret or
  // the enrolled-at timestamp leaks beyond this property. The frontend uses
  // this to render "2FA: on/off" in settings and to decide whether to show
  // the enable vs disable affordance.
  totp_enabled: boolean;
}

export function toPublicUser(row: UserRow): PublicUser {
  return {
    id: row.id,
    email: row.email,
    display_name: row.display_name,
    streak_count: row.streak_count,
    streak_freezes_remaining: row.streak_freezes_remaining,
    xp: row.xp,
    level: row.level,
    last_active_date: row.last_active_date
      ? row.last_active_date.toISOString().slice(0, 10)
      : null,
    is_admin: row.is_admin,
    email_reminders_enabled: row.email_reminders_enabled,
    reminder_hour_local: row.reminder_hour_local,
    timezone: row.timezone,
    preferred_difficulty: row.preferred_difficulty,
    lesson_size: row.lesson_size,
    bg_level: row.bg_level,
    time_budget_minutes: row.time_budget_minutes,
    preferred_paper_id: row.preferred_paper_id,
    onboarded_at: row.onboarded_at ? row.onboarded_at.toISOString() : null,
    leaderboard_opt_in: row.leaderboard_opt_in,
    totp_enabled: row.totp_secret !== null,
  };
}
