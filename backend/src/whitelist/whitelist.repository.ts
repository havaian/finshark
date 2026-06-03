import { Inject, Injectable } from "@nestjs/common";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";
import type { WhitelistRow } from "./whitelist.types";

const COLS = `id, pattern, note, created_at, created_by_user_id`;

@Injectable()
export class WhitelistRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  // Admin: full list, newest entries first.
  async findAll(): Promise<WhitelistRow[]> {
    return this.sql<WhitelistRow[]>`
      SELECT ${this.sql.unsafe(COLS)}
      FROM email_whitelist
      ORDER BY created_at DESC
    `;
  }

  // Auth-time check: returns the array of patterns (raw strings) so the
  // caller can hand them to isEmailAllowed(). Returned as a flat string[] so
  // the in-memory match is trivial. Kept here (not as a SELECT EXISTS) so
  // domain patterns are accounted for in the application-layer matcher.
  async findAllPatterns(): Promise<string[]> {
    const rows = await this.sql<Array<{ pattern: string }>>`
      SELECT pattern FROM email_whitelist
    `;
    return rows.map((r) => r.pattern);
  }

  async findByPattern(pattern: string): Promise<WhitelistRow | null> {
    const rows = await this.sql<WhitelistRow[]>`
      SELECT ${this.sql.unsafe(COLS)}
      FROM email_whitelist
      WHERE pattern = ${pattern}
      LIMIT 1
    `;
    return rows[0] ?? null;
  }

  // Insert. Returns null on unique-constraint conflict so the service can
  // surface a "already exists" error without an extra SELECT.
  async insert(input: {
    pattern: string;
    note: string | null;
    created_by_user_id: string | null;
  }): Promise<WhitelistRow | null> {
    const rows = await this.sql<WhitelistRow[]>`
      INSERT INTO email_whitelist (pattern, note, created_by_user_id)
      VALUES (${input.pattern}, ${input.note}, ${input.created_by_user_id})
      ON CONFLICT (pattern) DO NOTHING
      RETURNING ${this.sql.unsafe(COLS)}
    `;
    return rows[0] ?? null;
  }

  // Update the note on an existing row. Pattern itself is immutable from the
  // UI - deleting + re-adding is the correct way to change a pattern, since
  // changes might invalidate already-logged-in users.
  async updateNote(
    id: string,
    note: string | null
  ): Promise<WhitelistRow | null> {
    const rows = await this.sql<WhitelistRow[]>`
      UPDATE email_whitelist SET note = ${note}
      WHERE id = ${id}
      RETURNING ${this.sql.unsafe(COLS)}
    `;
    return rows[0] ?? null;
  }

  async deleteById(id: string): Promise<boolean> {
    const rows = await this.sql`
      DELETE FROM email_whitelist WHERE id = ${id} RETURNING id
    `;
    return rows.length > 0;
  }
}
