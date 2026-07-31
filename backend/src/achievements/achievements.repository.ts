import { Inject, Injectable } from "@nestjs/common";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";
import type {
  AchievementRow,
  UserAchievementProgressRow,
} from "./achievements.types";

const ACH_COLS = `
  code, name_en, name_ru, name_uz,
  description_en, description_ru, description_uz, icon, sort_order,
  levels, created_at, updated_at
`;

const PROG_COLS = `
  id::text, user_id::text, achievement_code, current_value, current_level,
  unlocked_at_per_level, created_at, updated_at
`;

@Injectable()
export class AchievementsRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  // Full catalog, sorted for display. Cheap (small table).
  async listAll(): Promise<AchievementRow[]> {
    return this.sql<AchievementRow[]>`
      SELECT ${this.sql.unsafe(ACH_COLS)}
      FROM achievements
      ORDER BY sort_order ASC, code ASC
    `;
  }

  // Set of currently-seeded paper codes ('F1', 'F2', …). Used by the service
  // to drop per-paper achievement rows for papers that aren't actually in
  // the catalog, so the profile doesn't show ghost "F5 lessons" cards on
  // installs that only have F1/F2/F3 seeded.
  async findExistingPaperCodes(): Promise<Set<string>> {
    const rows = await this.sql<Array<{ code: string }>>`
      SELECT code FROM papers
    `;
    return new Set(rows.map((r) => r.code));
  }

  // All progress rows for a single user, keyed by achievement_code. The
  // evaluator calls this once per evaluation; the API layer maps over the
  // catalog and looks up here per code.
  async findProgressByUser(
    user_id: string
  ): Promise<Map<string, UserAchievementProgressRow>> {
    const rows = await this.sql<UserAchievementProgressRow[]>`
      SELECT ${this.sql.unsafe(PROG_COLS)}
      FROM user_achievement_progress
      WHERE user_id = ${user_id}
    `;
    return new Map(rows.map((r) => [r.achievement_code, r]));
  }

  // Upsert a single (user, achievement) progress row to the given value /
  // level / unlocked map. Idempotent: re-running with the same value is a
  // no-op except for updated_at. Returns the new row so the evaluator can
  // diff against the previous state.
  //
  // We use INSERT...ON CONFLICT rather than separate INSERT/UPDATE paths
  // because the evaluator runs concurrently across sessions (the user could
  // hit "complete" on two devices). ON CONFLICT keeps it atomic; the
  // unique constraint on (user_id, achievement_code) protects against
  // double-inserts.
  async upsertProgress(opts: {
    user_id: string;
    achievement_code: string;
    current_value: number;
    current_level: number;
    unlocked_at_per_level: Record<string, string>;
  }): Promise<UserAchievementProgressRow> {
    const rows = await this.sql<UserAchievementProgressRow[]>`
      INSERT INTO user_achievement_progress (
        user_id, achievement_code, current_value, current_level, unlocked_at_per_level
      )
      VALUES (
        ${opts.user_id},
        ${opts.achievement_code},
        ${opts.current_value},
        ${opts.current_level},
        ${this.sql.json(opts.unlocked_at_per_level)}
      )
      ON CONFLICT (user_id, achievement_code) DO UPDATE
        SET current_value         = EXCLUDED.current_value,
            current_level         = EXCLUDED.current_level,
            unlocked_at_per_level = EXCLUDED.unlocked_at_per_level
      RETURNING ${this.sql.unsafe(PROG_COLS)}
    `;
    return rows[0];
  }
}
