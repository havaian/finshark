import { Inject, Injectable } from "@nestjs/common";
import type postgres from "postgres";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";
import type {
  SubscriptionEventKind,
  SubscriptionEventRow,
} from "./billing.types";

// Repository helpers accept either the connection-level Sql or a tx handle.
type SqlOrTx = Sql | postgres.TransactionSql;

const EVENT_COLS = `
  id, subscription_id, user_id, kind, actor_user_id, reason, metadata, created_at
`;

@Injectable()
export class SubscriptionEventsRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  // Append-only log. Every state change to a subscription writes one row.
  // subscription_id is nullable so we can also log webhook payloads that
  // arrive before we've matched them to a sub.
  async insert(
    input: {
      subscription_id: string | null;
      user_id: string | null;
      kind: SubscriptionEventKind;
      actor_user_id?: string | null;
      reason?: string | null;
      metadata?: Record<string, unknown>;
    },
    sql: SqlOrTx = this.sql
  ): Promise<SubscriptionEventRow> {
    const metadata = input.metadata ?? {};
    const rows = await sql<SubscriptionEventRow[]>`
      INSERT INTO subscription_events (
        subscription_id, user_id, kind, actor_user_id, reason, metadata
      )
      VALUES (
        ${input.subscription_id},
        ${input.user_id},
        ${input.kind},
        ${input.actor_user_id ?? null},
        ${input.reason ?? null},
        ${sql.json(metadata as unknown as postgres.JSONValue)}
      )
      RETURNING ${sql.unsafe(EVENT_COLS)}
    `;
    return rows[0];
  }

  async findForSubscription(
    subscriptionId: string
  ): Promise<SubscriptionEventRow[]> {
    return this.sql<SubscriptionEventRow[]>`
      SELECT ${this.sql.unsafe(EVENT_COLS)}
      FROM subscription_events
      WHERE subscription_id = ${subscriptionId}
      ORDER BY created_at DESC
    `;
  }

  async findForUser(userId: string): Promise<SubscriptionEventRow[]> {
    return this.sql<SubscriptionEventRow[]>`
      SELECT ${this.sql.unsafe(EVENT_COLS)}
      FROM subscription_events
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
  }
}
