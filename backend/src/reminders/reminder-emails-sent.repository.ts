import { Inject, Injectable } from '@nestjs/common';
import type { Sql } from 'postgres';
import { PG } from '../db/db.module';

@Injectable()
export class ReminderEmailsSentRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  // Returns true if a row was inserted (i.e., it's safe to send the email),
  // false if today's row already exists (another run already sent it).
  // The PK on (user_id, reminder_date) makes this race-safe across instances.
  async tryClaim(user_id: string, reminder_date: Date): Promise<boolean> {
    const rows = await this.sql<Array<{ user_id: string }>>`
      INSERT INTO reminder_emails_sent (user_id, reminder_date)
      VALUES (${user_id}, ${reminder_date})
      ON CONFLICT (user_id, reminder_date) DO NOTHING
      RETURNING user_id
    `;
    return rows.length > 0;
  }
}
