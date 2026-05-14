// Mirrors backend/src/users/user.types.ts PublicUser
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
  preferred_difficulty: 'easy' | 'medium' | 'hard' | null;
  lesson_size: number;
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
