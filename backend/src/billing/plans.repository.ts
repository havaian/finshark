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

  // All plans, sort_order ascending — admin UI consumes this directly.
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
}
