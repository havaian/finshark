import { Inject, Injectable } from "@nestjs/common";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";
import type { PlanRow } from "./billing.types";

const PLAN_COLS = `
  id, name, tier, period_days, price_minor, currency,
  is_active, sort_order, created_at, updated_at
`;

@Injectable()
export class PlansRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  // All plans, sort_order ascending - admin UI consumes this directly.
  // includeInactive=false hides disabled plans (catalog for users).
  async findAll(includeInactive = false): Promise<PlanRow[]> {
    if (includeInactive) {
      return this.sql<PlanRow[]>`
        SELECT ${this.sql.unsafe(PLAN_COLS)}
        FROM plans
        ORDER BY sort_order ASC, id ASC
      `;
    }
    return this.sql<PlanRow[]>`
      SELECT ${this.sql.unsafe(PLAN_COLS)}
      FROM plans
      WHERE is_active = TRUE
      ORDER BY sort_order ASC, id ASC
    `;
  }

  async findById(id: string): Promise<PlanRow | null> {
    const rows = await this.sql<PlanRow[]>`
      SELECT ${this.sql.unsafe(PLAN_COLS)}
      FROM plans
      WHERE id = ${id}
      LIMIT 1
    `;
    return rows[0] ?? null;
  }

  // Admin edit of a plan's price and/or active flag. Deliberately narrow: only
  // price_minor and is_active are mutable here. tier / period_days / id are
  // structural (gates and grant math depend on them) and are NOT editable via
  // this path - changing them is a migration concern, not an admin toggle.
  //
  // price_minor is in `patch` only when the caller intends to set it. The
  // plans table has a CHECK that price_minor and currency are either both NULL
  // or both set; premium plans always have a currency, so setting a numeric
  // price keeps the invariant. We don't allow setting price to NULL here (that
  // would make a premium plan non-purchasable, which isn't the intent of a
  // price edit), so callers pass a positive integer.
  //
  // Returns null if the plan doesn't exist. Bumps updated_at via the DB trigger.
  async update(
    id: string,
    patch: { price_minor?: number; is_active?: boolean }
  ): Promise<PlanRow | null> {
    const set: Record<string, unknown> = {};
    if (patch.price_minor !== undefined) set.price_minor = patch.price_minor;
    if (patch.is_active !== undefined) set.is_active = patch.is_active;

    if (Object.keys(set).length === 0) {
      return this.findById(id);
    }

    const rows = await this.sql<PlanRow[]>`
      UPDATE plans SET ${this.sql(set)}
      WHERE id = ${id}
      RETURNING ${this.sql.unsafe(PLAN_COLS)}
    `;
    return rows[0] ?? null;
  }
}
