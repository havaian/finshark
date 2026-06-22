// Mirrors backend/src/users/user.types.ts PublicUser
export type BgLevel = "beginner" | "intermediate" | "advanced";

export interface PublicUser {
  id: string;
  email: string;
  display_name: string;
  streak_count: number;
  // Stockpile of streak freezes the user can spend to cover a 1-day gap.
  // Granted at every 14-day streak milestone, capped at 2.
  // See backend src/lessons/srs.ts (MAX_FREEZES / FREEZE_GRANT_INTERVAL).
  streak_freezes_remaining: number;
  xp: number;
  level: number;
  last_active_date: string | null;
  is_admin: boolean;
  email_reminders_enabled: boolean;
  // Hour-of-day (0..23) in the user's `timezone` to send the daily reminder.
  reminder_hour_local: number;
  // IANA timezone name. Used by Settings to render the picker and by any
  // "local time" display logic.
  timezone: string;
  preferred_difficulty: "easy" | "medium" | "hard" | null;
  lesson_size: number;
  // Onboarding (3.1)
  bg_level: BgLevel | null;
  time_budget_minutes: number;
  preferred_paper_id: string | null;
  // Program the user is studying (FK to programs). ACCA today; CFA later.
  preferred_program_id: string | null;
  onboarded_at: string | null; // ISO timestamp or null (null = still needs to onboard)
  // Next exam date as 'YYYY-MM-DD' or null. Drives the dashboard countdown and
  // pre-fills the Settings date field. Mirrors backend users.exam_date.
  exam_date: string | null;
  // Leaderboards (3.3). Privacy default false - user must opt in.
  leaderboard_opt_in: boolean;
  // 2FA enrollment flag. Boolean only - never the secret. Used by Settings
  // to render enable vs disable affordance.
  totp_enabled: boolean;
}

// Mirrors backend/src/auth/auth.service.ts AuthTokens
export interface AuthTokens {
  access_token: string;
  refresh_token: string;
}

export interface AuthResult {
  user: PublicUser;
  tokens: AuthTokens;
}
