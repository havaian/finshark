import { Inject, Injectable } from "@nestjs/common";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";
import type { BadgeRow, UserBadgeRow } from "./badges.types";

const BADGE_COLS = `
  code, name_en, name_ru, name_uz,
  description_en, description_ru, description_uz, icon, sort_order,
  created_at, updated_at
`;

@Injectable()
export class BadgesRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  // Full catalog, sorted for display. Cheap (small table).
  async listAll(): Promise<BadgeRow[]> {
    return this.sql<BadgeRow[]>`
      SELECT ${this.sql.unsafe(BADGE_COLS)}
      FROM badges
      ORDER BY sort_order ASC, code ASC
    `;
  }

  // Earned events for a single user, keyed by badge_code. Used by the rule
  // evaluator (to know what NOT to insert) and by the profile page renderer.
  async findEarnedByUser(user_id: string): Promise<Map<string, Date>> {
    const rows = await this.sql<Array<{ badge_code: string; earned_at: Date }>>`
      SELECT badge_code, earned_at
      FROM user_badges
      WHERE user_id = ${user_id}
    `;
    return new Map(rows.map((r) => [r.badge_code, r.earned_at]));
  }

  // Insert a single earn. UNIQUE(user_id, badge_code) protects against double
  // inserts; ON CONFLICT DO NOTHING makes the call idempotent so a concurrent
  // evaluator can't crash the request. Returns true if a row was inserted
  // (i.e. this was a NEW earn) and false if it was a no-op.
  async insertEarnIfNew(user_id: string, badge_code: string): Promise<boolean> {
    const rows = await this.sql<Array<{ id: string }>>`
      INSERT INTO user_badges (user_id, badge_code)
      VALUES (${user_id}, ${badge_code})
      ON CONFLICT (user_id, badge_code) DO NOTHING
      RETURNING id
    `;
    return rows.length > 0;
  }

  // For tests and the rule evaluator's "how many of X does this user have"
  // category of queries.
  async countEarnedByUser(user_id: string): Promise<number> {
    const rows = await this.sql<Array<{ count: string }>>`
      SELECT COUNT(*)::text AS count FROM user_badges WHERE user_id = ${user_id}
    `;
    return parseInt(rows[0]?.count ?? "0", 10);
  }

  // Bulk fetch for admin/debug use. Not currently exposed via API.
  async listAllForUser(user_id: string): Promise<UserBadgeRow[]> {
    return this.sql<UserBadgeRow[]>`
      SELECT id::text, user_id::text, badge_code, earned_at
      FROM user_badges
      WHERE user_id = ${user_id}
      ORDER BY earned_at DESC
    `;
  }
}
