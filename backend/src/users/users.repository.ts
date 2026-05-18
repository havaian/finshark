import { Inject, Injectable } from "@nestjs/common";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";
import type { UserRow } from "./user.types";

// Centralised so every SELECT * matches the UserRow shape.
const USER_COLS = `
  id, email, google_sub, display_name, streak_count, xp, level,
  last_active_date, is_admin, email_reminders_enabled,
  reminder_hour_utc, preferred_difficulty, lesson_size,
  bg_level, time_budget_minutes, preferred_paper_id, onboarded_at,
  leaderboard_opt_in,
  totp_secret, totp_enrolled_at,
  created_at, updated_at
`;

@Injectable()
export class UsersRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  async findById(id: string): Promise<UserRow | null> {
    const rows = await this.sql<UserRow[]>`
      SELECT ${this.sql.unsafe(USER_COLS)}
      FROM users
      WHERE id = ${id}
      LIMIT 1
    `;
    return rows[0] ?? null;
  }

  async findByEmail(email: string): Promise<UserRow | null> {
    const rows = await this.sql<UserRow[]>`
      SELECT ${this.sql.unsafe(USER_COLS)}
      FROM users
      WHERE email = ${email}
      LIMIT 1
    `;
    return rows[0] ?? null;
  }

  // Google's stable identifier — the primary lookup once a user has logged in once.
  async findByGoogleSub(google_sub: string): Promise<UserRow | null> {
    const rows = await this.sql<UserRow[]>`
      SELECT ${this.sql.unsafe(USER_COLS)}
      FROM users
      WHERE google_sub = ${google_sub}
      LIMIT 1
    `;
    return rows[0] ?? null;
  }

  // New user from Google's verified profile.
  async createFromGoogle(input: {
    email: string;
    google_sub: string;
    display_name: string;
  }): Promise<UserRow> {
    const rows = await this.sql<UserRow[]>`
      INSERT INTO users (email, google_sub, display_name)
      VALUES (${input.email}, ${input.google_sub}, ${input.display_name})
      RETURNING ${this.sql.unsafe(USER_COLS)}
    `;
    return rows[0];
  }

  // Auto-link: an account exists for this email but has no google_sub yet
  // (e.g. created out-of-band, or pre-migration). Attach Google's sub to it.
  // Returns the updated row; throws if google_sub is already in use by ANOTHER
  // user (which would mean the same Google account is linked twice — a bug).
  async attachGoogleSubByEmail(input: {
    email: string;
    google_sub: string;
  }): Promise<UserRow | null> {
    const rows = await this.sql<UserRow[]>`
      UPDATE users
      SET google_sub = ${input.google_sub}
      WHERE email = ${input.email}
      RETURNING ${this.sql.unsafe(USER_COLS)}
    `;
    return rows[0] ?? null;
  }

  // Apply post-session deltas atomically. Called once per lesson completion.
  // We compute the new values in the service (so we have access to the SRS logic)
  // and write them here in a single statement.
  async applySessionResult(input: {
    id: string;
    xp: number;
    level: number;
    streak_count: number;
    last_active_date: Date;
  }): Promise<UserRow> {
    const rows = await this.sql<UserRow[]>`
      UPDATE users SET
        xp                = ${input.xp},
        level             = ${input.level},
        streak_count      = ${input.streak_count},
        last_active_date  = ${input.last_active_date}
      WHERE id = ${input.id}
      RETURNING ${this.sql.unsafe(USER_COLS)}
    `;
    return rows[0];
  }

  // List all users — for the admin users page.
  // Sorted: admins first, then by created_at desc (newest non-admins on top).
  async findAll(): Promise<UserRow[]> {
    return this.sql<UserRow[]>`
      SELECT ${this.sql.unsafe(USER_COLS)}
      FROM users
      ORDER BY is_admin DESC, created_at DESC
    `;
  }

  // Promote/demote an admin. Returns updated row or null if user not found.
  async setAdmin(id: string, is_admin: boolean): Promise<UserRow | null> {
    const rows = await this.sql<UserRow[]>`
      UPDATE users SET is_admin = ${is_admin}
      WHERE id = ${id}
      RETURNING ${this.sql.unsafe(USER_COLS)}
    `;
    return rows[0] ?? null;
  }

  // Count current admins. Used to prevent demoting the last admin (lock-out guard).
  async countAdmins(): Promise<number> {
    const rows = await this.sql<Array<{ count: string }>>`
      SELECT COUNT(*)::text AS count FROM users WHERE is_admin = TRUE
    `;
    return parseInt(rows[0]?.count ?? "0", 10);
  }

  // Update preference fields (lesson size, preferred difficulty, reminder hour,
  // email reminders enabled, leaderboard opt-in). Pass undefined to skip a
  // field; pass null to set preferred_difficulty back to "auto".
  async updatePreferences(
    id: string,
    input: {
      reminder_hour_utc?: number;
      preferred_difficulty?: "easy" | "medium" | "hard" | null;
      lesson_size?: number;
      email_reminders_enabled?: boolean;
      leaderboard_opt_in?: boolean;
    }
  ): Promise<UserRow | null> {
    const sets: Record<string, unknown> = {};
    if (input.reminder_hour_utc !== undefined)
      sets.reminder_hour_utc = input.reminder_hour_utc;
    if (input.preferred_difficulty !== undefined)
      sets.preferred_difficulty = input.preferred_difficulty;
    if (input.lesson_size !== undefined) sets.lesson_size = input.lesson_size;
    if (input.email_reminders_enabled !== undefined)
      sets.email_reminders_enabled = input.email_reminders_enabled;
    if (input.leaderboard_opt_in !== undefined)
      sets.leaderboard_opt_in = input.leaderboard_opt_in;

    if (Object.keys(sets).length === 0) return this.findById(id);

    const rows = await this.sql<UserRow[]>`
      UPDATE users SET ${this.sql(sets)}
      WHERE id = ${id}
      RETURNING ${this.sql.unsafe(USER_COLS)}
    `;
    return rows[0] ?? null;
  }

  // Apply an onboarding submission. Always sets onboarded_at = NOW(), so the
  // user passes the dashboard guard afterwards regardless of how many fields
  // they filled in.
  //
  // Skip flow: pass all four optional fields as undefined → only onboarded_at
  // is written; user keeps the column defaults (bg_level=NULL, time_budget=15,
  // preferred_paper_id=NULL). lesson_size/preferred_difficulty stay at their
  // existing values too.
  //
  // Full flow: pass bg_level + time_budget + preferred_paper_id, AND derived
  // lesson_size / preferred_difficulty from the service. We don't compute
  // them here so the repo stays a thin SQL wrapper.
  async applyOnboarding(
    id: string,
    input: {
      bg_level?: "beginner" | "intermediate" | "advanced" | null;
      time_budget_minutes?: number;
      preferred_paper_id?: string | null;
      // Derived from bg_level + time_budget by the service. Pass undefined to leave alone.
      preferred_difficulty?: "easy" | "medium" | "hard" | null;
      lesson_size?: number;
    }
  ): Promise<UserRow | null> {
    const sets: Record<string, unknown> = { onboarded_at: new Date() };
    if (input.bg_level !== undefined) sets.bg_level = input.bg_level;
    if (input.time_budget_minutes !== undefined)
      sets.time_budget_minutes = input.time_budget_minutes;
    if (input.preferred_paper_id !== undefined)
      sets.preferred_paper_id = input.preferred_paper_id;
    if (input.preferred_difficulty !== undefined)
      sets.preferred_difficulty = input.preferred_difficulty;
    if (input.lesson_size !== undefined) sets.lesson_size = input.lesson_size;

    const rows = await this.sql<UserRow[]>`
      UPDATE users SET ${this.sql(sets)}
      WHERE id = ${id}
      RETURNING ${this.sql.unsafe(USER_COLS)}
    `;
    return rows[0] ?? null;
  }

  // Update display name. Returns the updated row or null if not found.
  async updateDisplayName(
    id: string,
    display_name: string
  ): Promise<UserRow | null> {
    const rows = await this.sql<UserRow[]>`
      UPDATE users SET display_name = ${display_name}
      WHERE id = ${id}
      RETURNING ${this.sql.unsafe(USER_COLS)}
    `;
    return rows[0] ?? null;
  }

  // Hard delete a user. All FK-referencing rows are ON DELETE CASCADE
  // (lesson_sessions, user_question_state, attempts via session_id, etc.),
  // so the cascade does the cleanup. Returns true if a row was deleted.
  //
  // attempts.question_id is ON DELETE RESTRICT but attempts.session_id is
  // ON DELETE CASCADE, so attempts go away with their sessions. The same
  // attempts.user_id has ON DELETE CASCADE which doubly covers it.
  async deleteUser(id: string): Promise<boolean> {
    const rows = await this
      .sql`DELETE FROM users WHERE id = ${id} RETURNING id`;
    return rows.length > 0;
  }

  // Toggle the user's reminder-email preference. Returns the updated row or null
  // if the id isn't found.
  async setEmailReminders(
    id: string,
    enabled: boolean
  ): Promise<UserRow | null> {
    const rows = await this.sql<UserRow[]>`
      UPDATE users SET email_reminders_enabled = ${enabled}
      WHERE id = ${id}
      RETURNING ${this.sql.unsafe(USER_COLS)}
    `;
    return rows[0] ?? null;
  }

  // Toggle whether the user appears on leaderboards. Privacy default is OFF;
  // the user must explicitly opt in either from Settings or onboarding.
  async setLeaderboardOptIn(
    id: string,
    opted_in: boolean
  ): Promise<UserRow | null> {
    const rows = await this.sql<UserRow[]>`
      UPDATE users SET leaderboard_opt_in = ${opted_in}
      WHERE id = ${id}
      RETURNING ${this.sql.unsafe(USER_COLS)}
    `;
    return rows[0] ?? null;
  }

  // Cron recipient list. Eligible users:
  //   - opted in
  //   - account at least 24h old (don't spam fresh signups)
  //   - last activity was before today (haven't studied today)
  //   - last activity within the last 30 days, OR never active (still in the new-user window)
  // Implementation note: NULL last_active_date counts as "never active" → emails are sent.
  async findReminderRecipients(today: Date): Promise<UserRow[]> {
    return this.sql<UserRow[]>`
      SELECT ${this.sql.unsafe(USER_COLS)}
      FROM users
      WHERE email_reminders_enabled = TRUE
        AND created_at < NOW() - INTERVAL '24 hours'
        AND (last_active_date IS NULL OR last_active_date < ${today})
        AND (last_active_date IS NULL OR last_active_date > ${today}::date - INTERVAL '30 days')
    `;
  }
}
