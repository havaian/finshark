import { Inject, Injectable } from '@nestjs/common';
import type { Sql } from 'postgres';
import { PG } from '../db/db.module';
import type { UserRow } from './user.types';

// Centralised so every SELECT * matches the UserRow shape.
const USER_COLS = `
  id, email, google_sub, display_name, streak_count, xp, level,
  last_active_date, is_admin, email_reminders_enabled, created_at, updated_at
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

  // Toggle the user's reminder-email preference. Returns the updated row or null
  // if the id isn't found.
  async setEmailReminders(id: string, enabled: boolean): Promise<UserRow | null> {
    const rows = await this.sql<UserRow[]>`
      UPDATE users SET email_reminders_enabled = ${enabled}
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
