import { Inject, Injectable } from "@nestjs/common";
import type postgres from "postgres";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";
import type {
  PromocodeRedemptionRow,
  PromocodeRow,
} from "./billing.types";

// Repository helpers accept either the connection-level Sql or a tx handle.
type SqlOrTx = Sql | postgres.TransactionSql;

const CODE_COLS = `
  id, code, grant_plan_id, grant_days, max_redemptions, redemption_count,
  per_user_limit, valid_from, valid_until, is_active, notes,
  created_by_user_id, created_at, updated_at
`;

const REDEMPTION_COLS = `
  id, promocode_id, user_id, subscription_id, redeemed_at
`;

@Injectable()
export class PromocodesRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  // Admin: full list, newest first.
  async findAll(): Promise<PromocodeRow[]> {
    return this.sql<PromocodeRow[]>`
      SELECT ${this.sql.unsafe(CODE_COLS)}
      FROM promocodes
      ORDER BY created_at DESC
    `;
  }

  // Redemption path. Caller has already normalised the code (lowercase + trim).
  // Returns null if no row matches; callers map this to a 404 / "invalid code"
  // user-facing error without disclosing more (anti-enumeration).
  async findByCode(
    code: string,
    sql: SqlOrTx = this.sql
  ): Promise<PromocodeRow | null> {
    const rows = await sql<PromocodeRow[]>`
      SELECT ${sql.unsafe(CODE_COLS)}
      FROM promocodes
      WHERE code = ${code}
      LIMIT 1
    `;
    return rows[0] ?? null;
  }

  // Redemption path with row-level lock - we read inside the redeem
  // transaction so the redemption_count bump is serialised against concurrent
  // redemptions of the same code. Using FOR UPDATE is fine; promocode
  // contention is naturally low (one code per user per second at peak).
  async findByCodeForUpdate(
    code: string,
    sql: SqlOrTx
  ): Promise<PromocodeRow | null> {
    const rows = await sql<PromocodeRow[]>`
      SELECT ${sql.unsafe(CODE_COLS)}
      FROM promocodes
      WHERE code = ${code}
      FOR UPDATE
    `;
    return rows[0] ?? null;
  }

  async findById(id: string): Promise<PromocodeRow | null> {
    const rows = await this.sql<PromocodeRow[]>`
      SELECT ${this.sql.unsafe(CODE_COLS)}
      FROM promocodes
      WHERE id = ${id}
      LIMIT 1
    `;
    return rows[0] ?? null;
  }

  async insert(input: {
    code: string;             // already normalised (lowercased + trimmed)
    grant_plan_id: string;
    grant_days: number | null;
    max_redemptions: number | null;
    per_user_limit: number;
    valid_from: Date | null;
    valid_until: Date | null;
    is_active: boolean;
    notes: string | null;
    created_by_user_id: string | null;
  }): Promise<PromocodeRow | null> {
    const rows = await this.sql<PromocodeRow[]>`
      INSERT INTO promocodes (
        code, grant_plan_id, grant_days, max_redemptions, per_user_limit,
        valid_from, valid_until, is_active, notes, created_by_user_id
      )
      VALUES (
        ${input.code}, ${input.grant_plan_id}, ${input.grant_days},
        ${input.max_redemptions}, ${input.per_user_limit},
        ${input.valid_from}, ${input.valid_until},
        ${input.is_active}, ${input.notes}, ${input.created_by_user_id}
      )
      ON CONFLICT (code) DO NOTHING
      RETURNING ${this.sql.unsafe(CODE_COLS)}
    `;
    return rows[0] ?? null;
  }

  // Toggle active flag. Used by admin to disable a code without deleting it
  // (keeps the audit trail of redemptions intact).
  async setActive(id: string, isActive: boolean): Promise<PromocodeRow | null> {
    const rows = await this.sql<PromocodeRow[]>`
      UPDATE promocodes SET is_active = ${isActive}
      WHERE id = ${id}
      RETURNING ${this.sql.unsafe(CODE_COLS)}
    `;
    return rows[0] ?? null;
  }

  // Increment redemption_count by 1 in the same transaction as the redemption
  // insert. The DB CHECK constraint chk_promocodes_redemption_count_bounded
  // enforces the max_redemptions ceiling - if exceeded, this UPDATE throws
  // and the transaction rolls back automatically.
  async incrementRedemptionCount(
    id: string,
    sql: SqlOrTx
  ): Promise<PromocodeRow | null> {
    const rows = await sql<PromocodeRow[]>`
      UPDATE promocodes
      SET redemption_count = redemption_count + 1
      WHERE id = ${id}
      RETURNING ${sql.unsafe(CODE_COLS)}
    `;
    return rows[0] ?? null;
  }

  // Insert a redemption row. The (promocode_id, user_id) unique constraint
  // surfaces as a thrown error if the user has already redeemed this code
  // under per_user_limit=1; the service catches and maps to 409.
  // subscription_id may be null if the grant flow couldn't link a sub for
  // some reason (defensive - shouldn't happen in normal flow).
  async insertRedemption(
    input: {
      promocode_id: string;
      user_id: string;
      subscription_id: string | null;
    },
    sql: SqlOrTx
  ): Promise<PromocodeRedemptionRow> {
    const rows = await sql<PromocodeRedemptionRow[]>`
      INSERT INTO promocode_redemptions (promocode_id, user_id, subscription_id)
      VALUES (${input.promocode_id}, ${input.user_id}, ${input.subscription_id})
      RETURNING ${sql.unsafe(REDEMPTION_COLS)}
    `;
    return rows[0];
  }

  // Per-user redemption count for a single code. Used when per_user_limit > 1
  // (rare) - the unique index handles the limit=1 case, but anything higher
  // needs a counting check.
  async countUserRedemptions(
    promocodeId: string,
    userId: string,
    sql: SqlOrTx
  ): Promise<number> {
    const rows = await sql<Array<{ count: string }>>`
      SELECT COUNT(*)::text AS count
      FROM promocode_redemptions
      WHERE promocode_id = ${promocodeId} AND user_id = ${userId}
    `;
    return parseInt(rows[0]?.count ?? "0", 10);
  }

  async findRedemptionsForCode(
    promocodeId: string
  ): Promise<PromocodeRedemptionRow[]> {
    return this.sql<PromocodeRedemptionRow[]>`
      SELECT ${this.sql.unsafe(REDEMPTION_COLS)}
      FROM promocode_redemptions
      WHERE promocode_id = ${promocodeId}
      ORDER BY redeemed_at DESC
    `;
  }

  // Admin drill-in variant: same query as findRedemptionsForCode but joined
  // with users + subscriptions so the UI can show a real name + email + plan
  // instead of opaque UUIDs. Kept separate from the bare PromocodeRedemptionRow
  // path so the redemption write path (which doesn't need joins) stays
  // unchanged.
  async findRedemptionsForCodeWithDetails(
    promocodeId: string
  ): Promise<EnrichedPromocodeRedemptionRow[]> {
    return this.sql<EnrichedPromocodeRedemptionRow[]>`
      SELECT
        pr.id,
        pr.promocode_id,
        pr.user_id,
        pr.subscription_id,
        pr.redeemed_at,
        u.display_name AS user_display_name,
        u.email        AS user_email,
        s.plan_id      AS subscription_plan_id,
        s.status       AS subscription_status,
        s.ends_at      AS subscription_ends_at
      FROM promocode_redemptions pr
      JOIN users u ON u.id = pr.user_id
      LEFT JOIN subscriptions s ON s.id = pr.subscription_id
      WHERE pr.promocode_id = ${promocodeId}
      ORDER BY pr.redeemed_at DESC
    `;
  }
}

// Drill-in row shape: base redemption fields plus the user/sub join. Used
// only by the admin promocodes UI; the bare PromocodeRedemptionRow remains
// the truth for write-path callers that don't need the joins.
export interface EnrichedPromocodeRedemptionRow {
  id: string;
  promocode_id: string;
  user_id: string;
  subscription_id: string | null;
  redeemed_at: Date;
  user_display_name: string;
  user_email: string;
  subscription_plan_id: string | null;
  subscription_status: string | null;
  subscription_ends_at: Date | null;
}
