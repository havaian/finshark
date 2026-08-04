import { Inject, Injectable } from "@nestjs/common";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";
import type { PlanRow } from "./billing.types";

const PLAN_COLS = `
  id, name, tier, period_days, price_minor, currency,
  is_active, sort_order, fiscal_item_name, created_at, updated_at
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

  // Admin edit of a plan. `tier` and `id` remain structural - entitlement
  // gates key off tier, and id is referenced by orders and subscriptions - so
  // they are still not editable here.
  //
  // period_days IS editable. Changing it affects FUTURE grants only: existing
  // subscriptions store concrete starts_at/ends_at, so nobody's current access
  // moves. Auto-renewals will renew for the new length at the current price.
  //
  // `name` is editable for the same reason it has to be: a plan called
  // "Premium (monthly)" with period_days = 45 is a lie, and fiscal_item_name
  // ("Finshark Premium - 1 oy") would put that lie on a tax receipt. Change
  // the three together.
  //
  // price_minor is in `patch` only when the caller intends to set it. The
  // plans table has a CHECK that price_minor and currency are either both NULL
  // or both set; premium plans always have a currency, so setting a numeric
  // price keeps the invariant. We don't allow setting price to NULL here (that
  // would make a premium plan non-purchasable, which isn't the intent of a
  // price edit), so callers pass a positive integer.
  //
  // Returns null if the plan doesn't exist. Bumps updated_at via the DB trigger.
  // fiscal_item_name joins price_minor / is_active as an admin-editable field.
  // It is content, not structure: it prints on the OFD receipt and has to be
  // changeable without a deploy when the accountant revises the wording.
  // Passing null clears it, which disables fiscalization for the plan rather
  // than filing a receipt with a made-up description.
  async update(
    id: string,
    patch: {
      name?: string;
      period_days?: number;
      price_minor?: number;
      is_active?: boolean;
      fiscal_item_name?: string | null;
    }
  ): Promise<PlanRow | null> {
    const set: Record<string, unknown> = {};
    if (patch.name !== undefined) set.name = patch.name;
    if (patch.period_days !== undefined) set.period_days = patch.period_days;
    if (patch.price_minor !== undefined) set.price_minor = patch.price_minor;
    if (patch.is_active !== undefined) set.is_active = patch.is_active;
    if (patch.fiscal_item_name !== undefined) {
      set.fiscal_item_name = patch.fiscal_item_name;
    }

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
