// Row shape returned by `SELECT * FROM users`. Mirrors the migrations.
// Keep in sync with db/migrations/*_users*.sql + *_google_auth.sql
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
  };
}
