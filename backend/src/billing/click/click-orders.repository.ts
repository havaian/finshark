import { Inject, Injectable } from "@nestjs/common";
import type postgres from "postgres";
import type { Sql } from "postgres";
import { PG } from "../../db/db.module";
import type {
  AdminClickOrder,
  ClickFiscalStatus,
  ClickOrderRow,
  ClickOrderStatus,
} from "./click.types";

type SqlOrTx = Sql | postgres.TransactionSql;

// Short on purpose - an expiry sweep is never urgent enough to block a
// payment callback that is waiting on the same order.
const SWEEP_LOCK_TIMEOUT_MS = 2000;

const ORDER_COLS = `
  id, user_id, plan_id, merchant_trans_id, amount_minor, currency, status,
  click_trans_id, click_paydoc_id, merchant_prepare_id, merchant_confirm_id,
  error_code, error_note, subscription_id,
  fiscal_status, fiscal_attempts, fiscal_last_error, fiscal_qr_url,
  fiscal_submitted_at,
  prepared_at, paid_at, cancelled_at, metadata, created_at, updated_at
`;

@Injectable()
export class ClickOrdersRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  async create(input: {
    user_id: string;
    plan_id: string;
    merchant_trans_id: string;
    amount_minor: number;
    currency: string;
    fiscal_status: ClickFiscalStatus;
    metadata?: Record<string, unknown>;
  }): Promise<ClickOrderRow> {
    const metadata = input.metadata ?? {};
    const rows = await this.sql<ClickOrderRow[]>`
      INSERT INTO click_orders (
        user_id, plan_id, merchant_trans_id, amount_minor, currency,
        fiscal_status, metadata
      )
      VALUES (
        ${input.user_id},
        ${input.plan_id},
        ${input.merchant_trans_id},
        ${input.amount_minor},
        ${input.currency},
        ${input.fiscal_status},
        ${this.sql.json(metadata as unknown as postgres.JSONValue)}
      )
      RETURNING ${this.sql.unsafe(ORDER_COLS)}
    `;
    return rows[0];
  }

  async findById(id: string): Promise<ClickOrderRow | null> {
    const rows = await this.sql<ClickOrderRow[]>`
      SELECT ${this.sql.unsafe(ORDER_COLS)}
      FROM click_orders
      WHERE id = ${id}
      LIMIT 1
    `;
    return rows[0] ?? null;
  }

  // The callback lookup. Click identifies the payment by merchant_trans_id, so
  // this is the entry point for both Prepare and Complete.
  //
  // `forUpdate` takes a row lock so two concurrent Complete callbacks for the
  // same order serialise instead of both granting a subscription. Click does
  // retry on timeout, so this is a real scenario, not a theoretical one.
  async findByMerchantTransId(
    merchantTransId: string,
    sql: SqlOrTx = this.sql,
    forUpdate = false
  ): Promise<ClickOrderRow | null> {
    const rows = forUpdate
      ? await sql<ClickOrderRow[]>`
          SELECT ${sql.unsafe(ORDER_COLS)}
          FROM click_orders
          WHERE merchant_trans_id = ${merchantTransId}
          LIMIT 1
          FOR UPDATE
        `
      : await sql<ClickOrderRow[]>`
          SELECT ${sql.unsafe(ORDER_COLS)}
          FROM click_orders
          WHERE merchant_trans_id = ${merchantTransId}
          LIMIT 1
        `;
    return rows[0] ?? null;
  }

  async findByUser(userId: string, limit = 50): Promise<ClickOrderRow[]> {
    return this.sql<ClickOrderRow[]>`
      SELECT ${this.sql.unsafe(ORDER_COLS)}
      FROM click_orders
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
  }

  // Pull the next merchant_prepare_id. A sequence rather than a column default
  // because the value is only minted once Prepare actually succeeds - orders
  // abandoned before payment never consume one.
  async nextMerchantPrepareId(sql: SqlOrTx = this.sql): Promise<string> {
    const rows = await sql<{ id: string }[]>`
      SELECT nextval('click_merchant_prepare_id_seq')::text AS id
    `;
    return rows[0].id;
  }

  // Mark an order prepared. Guarded on status='created' so a replayed Prepare
  // can't reassign merchant_prepare_id under a payment already in flight.
  // Returns null when the guard didn't match.
  async markPrepared(
    input: {
      id: string;
      click_trans_id: string;
      click_paydoc_id: string;
      merchant_prepare_id: string;
    },
    sql: SqlOrTx = this.sql
  ): Promise<ClickOrderRow | null> {
    const rows = await sql<ClickOrderRow[]>`
      UPDATE click_orders SET
        status = 'prepared',
        click_trans_id = ${input.click_trans_id},
        click_paydoc_id = ${input.click_paydoc_id},
        merchant_prepare_id = ${input.merchant_prepare_id},
        prepared_at = NOW()
      WHERE id = ${input.id}
        AND status = 'created'
      RETURNING ${sql.unsafe(ORDER_COLS)}
    `;
    return rows[0] ?? null;
  }

  // Mark an order paid and link the subscription it produced. Guarded on
  // status='prepared' - the same guard that makes a duplicate Complete
  // idempotent (the second one finds status='paid', doesn't match, and the
  // service answers ALREADY_PAID instead of granting twice).
  async markPaid(
    input: {
      id: string;
      merchant_confirm_id: string;
      subscription_id: string;
    },
    sql: SqlOrTx = this.sql
  ): Promise<ClickOrderRow | null> {
    const rows = await sql<ClickOrderRow[]>`
      UPDATE click_orders SET
        status = 'paid',
        merchant_confirm_id = ${input.merchant_confirm_id},
        subscription_id = ${input.subscription_id},
        error_code = 0,
        error_note = NULL,
        paid_at = NOW()
      WHERE id = ${input.id}
        AND status = 'prepared'
      RETURNING ${sql.unsafe(ORDER_COLS)}
    `;
    return rows[0] ?? null;
  }

  // Cancel an order. Not status-guarded on a single value: Click can cancel
  // from either 'created' or 'prepared', and a repeated cancel must stay
  // harmless. Already-paid orders are excluded so a late cancel callback can
  // never strip a subscription silently - that path is flagged for manual
  // review instead.
  async markCancelled(
    input: {
      id: string;
      error_code: number;
      error_note: string | null;
    },
    sql: SqlOrTx = this.sql
  ): Promise<ClickOrderRow | null> {
    const rows = await sql<ClickOrderRow[]>`
      UPDATE click_orders SET
        status = 'cancelled',
        error_code = ${input.error_code},
        error_note = ${input.error_note},
        cancelled_at = NOW()
      WHERE id = ${input.id}
        AND status IN ('created', 'prepared', 'cancelled')
      RETURNING ${sql.unsafe(ORDER_COLS)}
    `;
    return rows[0] ?? null;
  }

  // Terminal "we took the money but our own processing failed" state. Only
  // reachable from 'prepared'; the order needs a human.
  async markFailed(
    input: {
      id: string;
      error_note: string;
    },
    sql: SqlOrTx = this.sql
  ): Promise<ClickOrderRow | null> {
    const rows = await sql<ClickOrderRow[]>`
      UPDATE click_orders SET
        status = 'failed',
        error_note = ${input.error_note}
      WHERE id = ${input.id}
        AND status = 'prepared'
      RETURNING ${sql.unsafe(ORDER_COLS)}
    `;
    return rows[0] ?? null;
  }

  // ── Abandoned-order expiry ───────────────────────────────────────────────

  // Orders that were opened and never settled. Two separate windows because the
  // two states carry very different risk:
  //
  //   created   Click never called us. We handed the user a pay URL and nothing
  //             came back, so there is no transaction on Click's side to
  //             conflict with. Safe to expire quickly.
  //   prepared  Click DID call Prepare, so they hold an open transaction and a
  //             Complete may still arrive. Expiring one of these races Click's
  //             own timeout, so the window is deliberately much longer.
  //
  // Ordered oldest-first so a backlog drains deterministically rather than
  // re-picking the same rows.
  async findExpirableOrders(input: {
    createdTtlMinutes: number;
    preparedTtlMinutes: number;
    limit: number;
  }): Promise<ClickOrderRow[]> {
    return this.sql<ClickOrderRow[]>`
      SELECT ${this.sql.unsafe(ORDER_COLS)}
      FROM click_orders
      WHERE (
              status = 'created'
              AND created_at < NOW() - make_interval(mins => ${input.createdTtlMinutes})
            )
         OR (
              status = 'prepared'
              AND COALESCE(prepared_at, created_at)
                  < NOW() - make_interval(mins => ${input.preparedTtlMinutes})
            )
      ORDER BY created_at ASC
      LIMIT ${input.limit}
    `;
  }

  // Expire ONE order, guarded against the callback that may be landing right
  // now. Two protections, both necessary:
  //
  //   1. The same advisory lock the Prepare/Complete handlers take. Without it
  //      a Complete could be mid-transaction when we flip the row, and we would
  //      fail an order the user has actually paid for.
  //   2. The status and age predicates are REPEATED in the UPDATE. The rows came
  //      from a SELECT taken outside this lock, so by the time we get here the
  //      order may already be paid or cancelled. Re-checking inside means a
  //      stale candidate updates zero rows and returns null instead of
  //      clobbering a settled payment.
  async expireOrder(input: {
    id: string;
    merchantTransId: string;
    createdTtlMinutes: number;
    preparedTtlMinutes: number;
    errorNote: string;
  }): Promise<ClickOrderRow | null> {
    return this.sql.begin(async (tx) => {
      // Same fail-fast rule as the Click callback path: the sweeper must never
      // sit on this lock while a live Complete waits behind it. If the lock is
      // contended the UPDATE throws, the caller logs it and moves to the next
      // order, and the row is simply picked up on the following sweep.
      // sql.unsafe because SET LOCAL rejects bound parameters.
      await tx.unsafe(`SET LOCAL lock_timeout = ${SWEEP_LOCK_TIMEOUT_MS}`);
      await tx`SELECT pg_advisory_xact_lock(hashtextextended(${input.merchantTransId}, 0))`;
      const rows = await tx<ClickOrderRow[]>`
        UPDATE click_orders SET
          status = 'failed',
          error_note = ${input.errorNote},
          cancelled_at = NOW()
        WHERE id = ${input.id}
          AND (
                (
                  status = 'created'
                  AND created_at < NOW() - make_interval(mins => ${input.createdTtlMinutes})
                )
                OR (
                  status = 'prepared'
                  AND COALESCE(prepared_at, created_at)
                      < NOW() - make_interval(mins => ${input.preparedTtlMinutes})
                )
              )
        RETURNING ${tx.unsafe(ORDER_COLS)}
      `;
      return rows[0] ?? null;
    });
  }

  // ── Fiscalization ────────────────────────────────────────────────────────

  async markFiscalSubmitted(input: {
    id: string;
    qr_url: string | null;
  }): Promise<ClickOrderRow | null> {
    const rows = await this.sql<ClickOrderRow[]>`
      UPDATE click_orders SET
        fiscal_status = 'submitted',
        fiscal_attempts = fiscal_attempts + 1,
        fiscal_last_error = NULL,
        fiscal_qr_url = ${input.qr_url},
        fiscal_submitted_at = NOW()
      WHERE id = ${input.id}
      RETURNING ${this.sql.unsafe(ORDER_COLS)}
    `;
    return rows[0] ?? null;
  }

  async markFiscalFailed(input: {
    id: string;
    error: string;
  }): Promise<ClickOrderRow | null> {
    const rows = await this.sql<ClickOrderRow[]>`
      UPDATE click_orders SET
        fiscal_status = 'failed',
        fiscal_attempts = fiscal_attempts + 1,
        fiscal_last_error = ${input.error}
      WHERE id = ${input.id}
      RETURNING ${this.sql.unsafe(ORDER_COLS)}
    `;
    return rows[0] ?? null;
  }

  // Store a QR URL fetched separately from submission (Click exposes the
  // receipt URL on a follow-up GET once the OFD has processed it).
  async setFiscalQrUrl(id: string, qrUrl: string): Promise<void> {
    await this.sql`
      UPDATE click_orders SET fiscal_qr_url = ${qrUrl}
      WHERE id = ${id}
    `;
  }

  // Orders that were paid but whose receipt hasn't been filed. Ordered oldest
  // first so a backlog drains in payment order. `maxAttempts` caps retries so a
  // permanently-rejected receipt (bad MXIK, say) stops burning API calls and
  // sits visible in the admin panel instead.
  async findFiscalPending(input: {
    limit: number;
    maxAttempts: number;
  }): Promise<ClickOrderRow[]> {
    return this.sql<ClickOrderRow[]>`
      SELECT ${this.sql.unsafe(ORDER_COLS)}
      FROM click_orders
      WHERE status = 'paid'
        AND fiscal_status IN ('pending', 'failed')
        AND fiscal_attempts < ${input.maxAttempts}
      ORDER BY created_at ASC
      LIMIT ${input.limit}
    `;
  }

  // Receipts Click accepted but whose OFD URL wasn't available yet when we
  // asked. The OFD lags behind submission, so this is the normal path for a
  // freshly filed receipt rather than an error state.
  async findSubmittedWithoutQr(limit: number): Promise<ClickOrderRow[]> {
    return this.sql<ClickOrderRow[]>`
      SELECT ${this.sql.unsafe(ORDER_COLS)}
      FROM click_orders
      WHERE fiscal_status = 'submitted'
        AND fiscal_qr_url IS NULL
        AND click_paydoc_id IS NOT NULL
      ORDER BY fiscal_submitted_at DESC
      LIMIT ${limit}
    `;
  }

  // ── Admin ────────────────────────────────────────────────────────────────

  // Joined listing for the admin orders table. LEFT JOINs so an order survives
  // in the list even if the user row is gone (it can't be - CASCADE - but the
  // plan join is genuinely optional).
  async findForAdmin(input: {
    status?: ClickOrderStatus;
    limit: number;
  }): Promise<AdminClickOrder[]> {
    const rows = input.status
      ? await this.sql<AdminClickOrderRaw[]>`
          SELECT ${this.sql.unsafe(adminSelect())}
          FROM click_orders o
          LEFT JOIN users u ON u.id = o.user_id
          LEFT JOIN plans p ON p.id = o.plan_id
          WHERE o.status = ${input.status}
          ORDER BY o.created_at DESC
          LIMIT ${input.limit}
        `
      : await this.sql<AdminClickOrderRaw[]>`
          SELECT ${this.sql.unsafe(adminSelect())}
          FROM click_orders o
          LEFT JOIN users u ON u.id = o.user_id
          LEFT JOIN plans p ON p.id = o.plan_id
          ORDER BY o.created_at DESC
          LIMIT ${input.limit}
        `;
    return rows.map(toAdminClickOrder);
  }

  async findOneForAdmin(id: string): Promise<AdminClickOrder | null> {
    const rows = await this.sql<AdminClickOrderRaw[]>`
      SELECT ${this.sql.unsafe(adminSelect())}
      FROM click_orders o
      LEFT JOIN users u ON u.id = o.user_id
      LEFT JOIN plans p ON p.id = o.plan_id
      WHERE o.id = ${id}
      LIMIT 1
    `;
    return rows[0] ? toAdminClickOrder(rows[0]) : null;
  }
}

// ── Admin row plumbing ───────────────────────────────────────────────────────

function adminSelect(): string {
  return `
    o.id, o.user_id, o.plan_id, o.merchant_trans_id, o.amount_minor, o.currency,
    o.status, o.click_trans_id, o.click_paydoc_id, o.merchant_prepare_id,
    o.merchant_confirm_id, o.error_code, o.error_note, o.subscription_id,
    o.fiscal_status, o.fiscal_attempts, o.fiscal_last_error, o.fiscal_qr_url,
    o.fiscal_submitted_at, o.prepared_at, o.paid_at, o.cancelled_at,
    o.created_at, o.updated_at,
    u.email AS user_email, u.display_name AS user_name,
    p.name AS plan_name
  `;
}

interface AdminClickOrderRaw {
  id: string;
  user_id: string;
  plan_id: string;
  merchant_trans_id: string;
  amount_minor: number;
  currency: string;
  status: ClickOrderStatus;
  click_trans_id: string | null;
  click_paydoc_id: string | null;
  merchant_prepare_id: string | null;
  merchant_confirm_id: string | null;
  error_code: number | null;
  error_note: string | null;
  subscription_id: string | null;
  fiscal_status: ClickFiscalStatus;
  fiscal_attempts: number;
  fiscal_last_error: string | null;
  fiscal_qr_url: string | null;
  fiscal_submitted_at: Date | null;
  prepared_at: Date | null;
  paid_at: Date | null;
  cancelled_at: Date | null;
  created_at: Date;
  updated_at: Date;
  user_email: string | null;
  user_name: string | null;
  plan_name: string | null;
}

function toAdminClickOrder(row: AdminClickOrderRaw): AdminClickOrder {
  return {
    id: row.id,
    user_id: row.user_id,
    user_email: row.user_email,
    user_name: row.user_name,
    plan_id: row.plan_id,
    plan_name: row.plan_name,
    merchant_trans_id: row.merchant_trans_id,
    amount_minor: row.amount_minor,
    currency: row.currency,
    status: row.status,
    click_trans_id: row.click_trans_id,
    click_paydoc_id: row.click_paydoc_id,
    merchant_prepare_id: row.merchant_prepare_id,
    merchant_confirm_id: row.merchant_confirm_id,
    error_code: row.error_code,
    error_note: row.error_note,
    subscription_id: row.subscription_id,
    fiscal_status: row.fiscal_status,
    fiscal_attempts: row.fiscal_attempts,
    fiscal_last_error: row.fiscal_last_error,
    fiscal_qr_url: row.fiscal_qr_url,
    fiscal_submitted_at: row.fiscal_submitted_at
      ? row.fiscal_submitted_at.toISOString()
      : null,
    prepared_at: row.prepared_at ? row.prepared_at.toISOString() : null,
    paid_at: row.paid_at ? row.paid_at.toISOString() : null,
    cancelled_at: row.cancelled_at ? row.cancelled_at.toISOString() : null,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}
