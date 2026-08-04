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
  auto_renew, renew_card_token_id, renew_attempts,
  renew_last_attempt_at, renew_last_error,
  created_at, updated_at
`;

@Injectable()
export class SubscriptionsRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  // The hot path: find the most generous currently-active subscription for a
  // user. "Active" means status='active' AND (ends_at IS NULL OR ends_at > NOW()).
  // When multiple actives exist (e.g. an admin grant overlapping a paid sub),
  // we return the one with the latest ends_at - NULL ends_at (lifetime/open-
  // ended) sorts last via NULLS LAST, so the open-ended grant wins.
  //
  // Returns null if the user has no active subscription (= free tier).
  // EVERY subscription currently granting access, not just the latest.
  //
  // Grants chain - each purchase starts where the previous one ends - so a user
  // who bought ten months has ten rows, all status='active', all with a future
  // ends_at. Entitlement passes if ANY of them qualifies, which is why a
  // per-row revoke cannot actually remove access.
  async findAllGrantingAccess(
    userId: string,
    sql: SqlOrTx = this.sql
  ): Promise<SubscriptionRow[]> {
    return sql<SubscriptionRow[]>`
      SELECT ${sql.unsafe(SUB_COLS)}
      FROM subscriptions
      WHERE user_id = ${userId}
        AND status = 'active'
        AND (ends_at IS NULL OR ends_at > NOW())
      ORDER BY ends_at ASC NULLS LAST
    `;
  }

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

  // Subscription history for a single user - admin UI consumes this. Newest
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
  // (open-ended), this is a no-op - extending a lifetime grant is meaningless,
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

  // Mark cancelled. Does NOT remove the row or touch ends_at - the user keeps
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
  // ── Auto-renew ───────────────────────────────────────────────────────────

  async setAutoRenew(input: {
    id: string;
    enabled: boolean;
    cardTokenId: string | null;
  }): Promise<void> {
    await this.sql`
      UPDATE subscriptions SET
        auto_renew = ${input.enabled},
        renew_card_token_id = ${input.cardTokenId},
        -- Re-enabling after a run of failures starts from a clean slate,
        -- otherwise a user who fixes their card would still be past the
        -- attempt ceiling and never get retried.
        renew_attempts = 0,
        renew_last_error = NULL
      WHERE id = ${input.id}
    `;
  }

  // Turn auto-renew off for anything pointing at a card being unbound.
  async disableAutoRenewForCard(cardTokenId: string): Promise<void> {
    await this.sql`
      UPDATE subscriptions SET
        auto_renew = FALSE,
        renew_card_token_id = NULL
      WHERE renew_card_token_id = ${cardTokenId}
    `;
  }

  // Subscriptions to attempt now.
  //
  // Conditions, in order: auto-renew is on, the subscription is still active
  // and actually ends, we are inside the lead window, we have not burned the
  // attempt ceiling, and enough time has passed since the last try. The last
  // two are what stop an hourly sweep from hammering a declining card.
  async findDueForRenewal(input: {
    leadDays: number;
    maxAttempts: number;
    retryHours: number;
    limit: number;
  }): Promise<SubscriptionRow[]> {
    return this.sql<SubscriptionRow[]>`
      SELECT ${this.sql.unsafe(SUB_COLS)}
      FROM subscriptions
      WHERE auto_renew = TRUE
        AND status = 'active'
        AND ends_at IS NOT NULL
        AND ends_at <= NOW() + make_interval(days => ${input.leadDays})
        AND ends_at > NOW()
        AND renew_attempts < ${input.maxAttempts}
        AND (
          renew_last_attempt_at IS NULL
          OR renew_last_attempt_at < NOW() - make_interval(hours => ${input.retryHours})
        )
      ORDER BY ends_at ASC
      LIMIT ${input.limit}
    `;
  }

  async recordRenewalAttempt(id: string): Promise<void> {
    await this.sql`
      UPDATE subscriptions SET
        renew_attempts = renew_attempts + 1,
        renew_last_attempt_at = NOW()
      WHERE id = ${id}
    `;
  }

  async recordRenewalFailure(id: string, error: string): Promise<void> {
    await this.sql`
      UPDATE subscriptions SET renew_last_error = ${error} WHERE id = ${id}
    `;
  }
  // ── Expiry warnings ──────────────────────────────────────────────────────

  // Subscriptions expiring in exactly `days` days that have not been warned
  // yet, joined to the user so the sender needs no second query.
  //
  // Excluded on purpose:
  //   auto_renew = TRUE  they are being renewed; warning them would be wrong
  //                      and would arrive alongside the renewal email
  //   ends_at IS NULL    lifetime and admin grants never expire
  //   opted out          email_reminders_enabled is the user's global switch
  //
  // The warned marker lives in metadata rather than a column: it is a one-shot
  // per subscription and does not warrant DDL. A subscription extended later
  // gets a NEW row (grants chain), so the flag never needs clearing.
  async findExpiringForWarning(input: {
    days: number;
    limit: number;
  }): Promise<
    Array<{
      id: string;
      user_id: string;
      ends_at: Date;
      email: string;
      display_name: string;
    }>
  > {
    return this.sql<
      Array<{
        id: string;
        user_id: string;
        ends_at: Date;
        email: string;
        display_name: string;
      }>
    >`
      SELECT s.id, s.user_id::text, s.ends_at, u.email, u.display_name
      FROM subscriptions s
      JOIN users u ON u.id = s.user_id
      WHERE s.status = 'active'
        AND s.auto_renew = FALSE
        AND s.ends_at IS NOT NULL
        AND s.ends_at > NOW()
        AND s.ends_at <= NOW() + make_interval(days => ${input.days})
        AND u.email_reminders_enabled = TRUE
        AND NOT COALESCE((s.metadata->>'expiry_warned')::boolean, FALSE)
      ORDER BY s.ends_at ASC
      LIMIT ${input.limit}
    `;
  }

  // Mark the warning as sent. Written before the email goes out, so a crash
  // mid-send loses one warning rather than looping and sending it repeatedly.
  async markExpiryWarned(id: string): Promise<void> {
    await this.sql`
      UPDATE subscriptions
      SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"expiry_warned": true}'::jsonb
      WHERE id = ${id}
    `;
  }
}
