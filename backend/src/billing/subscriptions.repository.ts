import { Inject, Injectable } from "@nestjs/common";
import type postgres from "postgres";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";
import type {
  SubscriptionRow,
  SubscriptionSource,
  SubscriptionStatus,
} from "./billing.types";

// Repository helpers accept either the connection-level Sql or a tx handle.
// postgres.js's TransactionSql is structurally compatible with Sql for the
// tagged-template usage we need; the union is just to make TS happy.
type SqlOrTx = Sql | postgres.TransactionSql;

const SUB_COLS = `
  id, user_id, plan_id, status, source, source_ref,
  starts_at, ends_at, cancelled_at, created_by_user_id, metadata,
  created_at, updated_at
`;

@Injectable()
export class SubscriptionsRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  // The hot path: find the most generous currently-active subscription for a
  // user. "Active" means status='active' AND (ends_at IS NULL OR ends_at > NOW()).
  // When multiple actives exist (e.g. an admin grant overlapping a paid sub),
  // we return the one with the latest ends_at — NULL ends_at (lifetime/open-
  // ended) sorts last via NULLS LAST, so the open-ended grant wins.
  //
  // Returns null if the user has no active subscription (= free tier).
  async findActiveForUser(userId: string): Promise<SubscriptionRow | null> {
    const rows = await this.sql<SubscriptionRow[]>`
      SELECT ${this.sql.unsafe(SUB_COLS)}
      FROM subscriptions
      WHERE user_id = ${userId}
        AND status = 'active'
        AND (ends_at IS NULL OR ends_at > NOW())
      ORDER BY ends_at DESC NULLS FIRST
      LIMIT 1
    `;
    return rows[0] ?? null;
  }

  async findById(id: string): Promise<SubscriptionRow | null> {
    const rows = await this.sql<SubscriptionRow[]>`
      SELECT ${this.sql.unsafe(SUB_COLS)}
      FROM subscriptions
      WHERE id = ${id}
      LIMIT 1
    `;
    return rows[0] ?? null;
  }

  // Subscription history for a single user — admin UI consumes this. Newest
  // first; both active and inactive included so admins can see the timeline.
  async findHistoryForUser(userId: string): Promise<SubscriptionRow[]> {
    return this.sql<SubscriptionRow[]>`
      SELECT ${this.sql.unsafe(SUB_COLS)}
      FROM subscriptions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
  }

  // Create a new subscription row. Defaults align with the DB: status='active',
  // metadata={}, starts_at=NOW() when not provided.
  //
  // Accepts an optional `sql` override so callers can pass a transaction handle.
  // postgres.js exposes the same tagged-template interface on the tx object,
  // so a single signature covers both cases.
  async insert(
    input: {
      user_id: string;
      plan_id: string;
      status?: SubscriptionStatus;
      source: SubscriptionSource;
      source_ref?: string | null;
      starts_at?: Date;
      ends_at?: Date | null;
      created_by_user_id?: string | null;
      metadata?: Record<string, unknown>;
    },
    sql: SqlOrTx = this.sql
  ): Promise<SubscriptionRow> {
    const status = input.status ?? "active";
    const starts_at = input.starts_at ?? new Date();
    const metadata = input.metadata ?? {};
    const rows = await sql<SubscriptionRow[]>`
      INSERT INTO subscriptions (
        user_id, plan_id, status, source, source_ref,
        starts_at, ends_at, created_by_user_id, metadata
      )
      VALUES (
        ${input.user_id},
        ${input.plan_id},
        ${status},
        ${input.source},
        ${input.source_ref ?? null},
        ${starts_at},
        ${input.ends_at ?? null},
        ${input.created_by_user_id ?? null},
        ${sql.json(metadata as unknown as postgres.JSONValue)}
      )
      RETURNING ${sql.unsafe(SUB_COLS)}
    `;
    return rows[0];
  }

  // Extend an existing subscription's ends_at by N days. If ends_at is NULL
  // (open-ended), this is a no-op — extending a lifetime grant is meaningless,
  // and we must NOT inadvertently truncate it to a fixed expiry. Returns the
  // updated row.
  //
  // Days is added to the *current* ends_at, not to NOW(). For a sub that
  // expired yesterday, this means the new ends_at could still be in the past;
  // callers (promocode redemption, admin extend) typically bump status='active'
  // separately and pick max(NOW(), ends_at) themselves before passing days.
  async extendEndsAt(
    id: string,
    days: number,
    sql: SqlOrTx = this.sql
  ): Promise<SubscriptionRow | null> {
    const rows = await sql<SubscriptionRow[]>`
      UPDATE subscriptions
      SET ends_at = ends_at + (${days} || ' days')::interval
      WHERE id = ${id} AND ends_at IS NOT NULL
      RETURNING ${sql.unsafe(SUB_COLS)}
    `;
    return rows[0] ?? null;
  }

  // Set ends_at to an absolute timestamp (also bumps status to 'active' if
  // we're moving the expiry into the future). Used by the promocode redeem
  // path when the existing sub had already expired: we compute newEnd =
  // max(NOW(), ends_at) + days outside, then write it here.
  async setEndsAt(
    id: string,
    endsAt: Date | null,
    sql: SqlOrTx = this.sql
  ): Promise<SubscriptionRow | null> {
    const rows = await sql<SubscriptionRow[]>`
      UPDATE subscriptions
      SET ends_at = ${endsAt}, status = 'active'
      WHERE id = ${id}
      RETURNING ${sql.unsafe(SUB_COLS)}
    `;
    return rows[0] ?? null;
  }

  // Mark cancelled. Does NOT remove the row or touch ends_at — the user keeps
  // their paid time. The cron / entitlement check filters by ends_at > NOW().
  async markCancelled(
    id: string,
    sql: SqlOrTx = this.sql
  ): Promise<SubscriptionRow | null> {
    const rows = await sql<SubscriptionRow[]>`
      UPDATE subscriptions
      SET status = 'cancelled', cancelled_at = NOW()
      WHERE id = ${id}
      RETURNING ${sql.unsafe(SUB_COLS)}
    `;
    return rows[0] ?? null;
  }

  // Hard-revoke (admin action). Status → expired, ends_at → NOW(). Used when
  // an admin needs to immediately strip premium (refund, abuse, etc.).
  async revoke(
    id: string,
    sql: SqlOrTx = this.sql
  ): Promise<SubscriptionRow | null> {
    const rows = await sql<SubscriptionRow[]>`
      UPDATE subscriptions
      SET status = 'expired', ends_at = NOW()
      WHERE id = ${id}
      RETURNING ${sql.unsafe(SUB_COLS)}
    `;
    return rows[0] ?? null;
  }
}
