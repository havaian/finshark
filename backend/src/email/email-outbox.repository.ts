import { Inject, Injectable } from "@nestjs/common";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";
import type { EmailLang } from "./email-templates.service";
import type { EmailOutboxRow } from "./email-outbox.types";

@Injectable()
export class EmailOutboxRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  async insert(input: {
    template_key: string;
    to_email: string;
    lang: EmailLang;
    variables: Record<string, string | number>;
    context?: string | null;
  }): Promise<EmailOutboxRow> {
    const rows = await this.sql<EmailOutboxRow[]>`
      INSERT INTO email_outbox (template_key, to_email, lang, variables, context)
      VALUES (
        ${input.template_key},
        ${input.to_email},
        ${input.lang},
        ${this.sql.json(input.variables)},
        ${input.context ?? null}
      )
      RETURNING *
    `;
    return rows[0];
  }

  // Claims up to `limit` due rows for this drain pass.
  //
  // FOR UPDATE SKIP LOCKED is what makes this safe to run on more than one
  // backend instance: a row being worked by another drain is skipped rather
  // than waited on. Without it two instances would send the same email twice.
  //
  // The claim bumps next_attempt_at forward by the lease window so a crashed
  // drain releases its rows naturally instead of stranding them.
  async claimDue(input: {
    limit: number;
    leaseSeconds: number;
  }): Promise<EmailOutboxRow[]> {
    return this.sql<EmailOutboxRow[]>`
      UPDATE email_outbox
      SET next_attempt_at = NOW() + make_interval(secs => ${input.leaseSeconds})
      WHERE id IN (
        SELECT id
        FROM email_outbox
        WHERE status = 'pending'
          AND next_attempt_at <= NOW()
        ORDER BY next_attempt_at ASC
        LIMIT ${input.limit}
        FOR UPDATE SKIP LOCKED
      )
      RETURNING *
    `;
  }

  async markSent(id: string): Promise<void> {
    await this.sql`
      UPDATE email_outbox
      SET status = 'sent',
          sent_at = NOW(),
          attempts = attempts + 1,
          last_error = NULL
      WHERE id = ${id}
    `;
  }

  // Temporary failure: stays pending, comes back after the backoff delay.
  async markRetry(input: {
    id: string;
    error: string;
    delaySeconds: number;
  }): Promise<void> {
    await this.sql`
      UPDATE email_outbox
      SET attempts = attempts + 1,
          last_error = ${input.error},
          next_attempt_at = NOW() + make_interval(secs => ${input.delaySeconds})
      WHERE id = ${input.id}
    `;
  }

  // Permanent failure: never swept again. Visible to the admin panel.
  async markFailed(input: { id: string; error: string }): Promise<void> {
    await this.sql`
      UPDATE email_outbox
      SET status = 'failed',
          attempts = attempts + 1,
          last_error = ${input.error}
      WHERE id = ${input.id}
    `;
  }

  async findById(id: string): Promise<EmailOutboxRow | null> {
    const rows = await this.sql<EmailOutboxRow[]>`
      SELECT * FROM email_outbox WHERE id = ${id} LIMIT 1
    `;
    return rows[0] ?? null;
  }

  async findRecent(limit: number): Promise<EmailOutboxRow[]> {
    return this.sql<EmailOutboxRow[]>`
      SELECT * FROM email_outbox
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
  }

  async findFailed(limit: number): Promise<EmailOutboxRow[]> {
    return this.sql<EmailOutboxRow[]>`
      SELECT * FROM email_outbox
      WHERE status = 'failed'
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
  }

  // Counts by status, for the admin overview / health endpoint.
  async countByStatus(): Promise<Record<string, number>> {
    const rows = await this.sql<Array<{ status: string; count: string }>>`
      SELECT status, COUNT(*)::text AS count
      FROM email_outbox
      GROUP BY status
    `;
    const out: Record<string, number> = { pending: 0, sent: 0, failed: 0 };
    for (const row of rows) {
      out[row.status] = parseInt(row.count, 10);
    }
    return out;
  }

  // Puts a failed row back in the queue with its attempt counter reset. Used
  // by the admin "retry" button once the underlying cause is fixed.
  async requeue(id: string): Promise<EmailOutboxRow | null> {
    const rows = await this.sql<EmailOutboxRow[]>`
      UPDATE email_outbox
      SET status = 'pending',
          attempts = 0,
          last_error = NULL,
          next_attempt_at = NOW()
      WHERE id = ${id} AND status = 'failed'
      RETURNING *
    `;
    return rows[0] ?? null;
  }
}
