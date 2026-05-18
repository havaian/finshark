// Mirrors backend/src/users/user.types.ts PublicUser
export type BgLevel = "beginner" | "intermediate" | "advanced";

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
  preferred_difficulty: "easy" | "medium" | "hard" | null;
  lesson_size: number;
  // Onboarding (3.1)
  bg_level: BgLevel | null;
  time_budget_minutes: number;
  preferred_paper_id: string | null;
  onboarded_at: string | null; // ISO timestamp or null (null = still needs to onboard)
  // Leaderboards (3.3). Privacy default false — user must opt in.
  leaderboard_opt_in: boolean;
  // 2FA enrollment flag. Boolean only — never the secret. Used by Settings
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
