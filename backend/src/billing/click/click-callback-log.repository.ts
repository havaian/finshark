import { Inject, Injectable, Logger } from "@nestjs/common";
import type postgres from "postgres";
import type { Sql } from "postgres";
import { PG } from "../../db/db.module";
import type { ClickCallbackLogRow } from "./click.types";

const LOG_COLS = `
  id, order_id, action, click_trans_id, merchant_trans_id,
  request_body, request_headers, response_body, error_code, verdict, ip,
  created_at
`;

// Append-only log of every Prepare / Complete callback. Click's integration
// checklist explicitly asks for this: when a payment misbehaves, their support
// team wants the request and our response side by side.
//
// Writes here MUST NOT be able to fail a callback. If logging throws (disk
// full, connection blip), we log the failure locally and let the payment
// proceed - a lost audit line is bad, a rejected payment for a customer who
// was already charged is worse.
@Injectable()
export class ClickCallbackLogRepository {
  private readonly log = new Logger(ClickCallbackLogRepository.name);

  constructor(@Inject(PG) private readonly sql: Sql) {}

  async record(input: {
    order_id?: string | null;
    action?: number | null;
    click_trans_id?: string | null;
    merchant_trans_id?: string | null;
    request_body: Record<string, unknown>;
    request_headers?: Record<string, unknown>;
    response_body?: Record<string, unknown> | null;
    error_code?: number | null;
    verdict?: string | null;
    ip?: string | null;
  }): Promise<void> {
    try {
      await this.sql`
        INSERT INTO click_callback_log (
          order_id, action, click_trans_id, merchant_trans_id,
          request_body, request_headers, response_body, error_code, verdict, ip
        )
        VALUES (
          ${input.order_id ?? null},
          ${input.action ?? null},
          ${input.click_trans_id ?? null},
          ${input.merchant_trans_id ?? null},
          ${this.sql.json(input.request_body as unknown as postgres.JSONValue)},
          ${this.sql.json(
            (input.request_headers ?? {}) as unknown as postgres.JSONValue
          )},
          ${
            input.response_body === undefined || input.response_body === null
              ? null
              : this.sql.json(
                  input.response_body as unknown as postgres.JSONValue
                )
          },
          ${input.error_code ?? null},
          ${input.verdict ?? null},
          ${input.ip ?? null}
        )
      `;
    } catch (e) {
      // Never propagate. See the class comment.
      this.log.error(
        `failed to write click callback log (merchant_trans_id=${
          input.merchant_trans_id ?? "?"
        }): ${e instanceof Error ? e.message : String(e)}`
      );
    }
  }

  // Admin drill-in: the callback trail for one order, oldest first so it reads
  // as a chronological story (Prepare, then Complete, then any retries).
  async findByOrder(orderId: string): Promise<ClickCallbackLogRow[]> {
    return this.sql<ClickCallbackLogRow[]>`
      SELECT ${this.sql.unsafe(LOG_COLS)}
      FROM click_callback_log
      WHERE order_id = ${orderId}
      ORDER BY created_at ASC, id ASC
    `;
  }

  // Recent callbacks across all orders - the "is anything on fire" view, and
  // where callbacks that never matched an order (bad signature, unknown
  // merchant_trans_id) are visible at all, since those have order_id = NULL.
  async findRecent(limit: number): Promise<ClickCallbackLogRow[]> {
    return this.sql<ClickCallbackLogRow[]>`
      SELECT ${this.sql.unsafe(LOG_COLS)}
      FROM click_callback_log
      ORDER BY created_at DESC, id DESC
      LIMIT ${limit}
    `;
  }
}
