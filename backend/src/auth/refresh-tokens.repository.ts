import { Inject, Injectable } from "@nestjs/common";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";

export interface RefreshTokenRow {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  created_at: Date;
  revoked_at: Date | null;
}

@Injectable()
export class RefreshTokensRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  async create(input: {
    user_id: string;
    token_hash: string;
    expires_at: Date;
  }): Promise<RefreshTokenRow> {
    const rows = await this.sql<RefreshTokenRow[]>`
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES (${input.user_id}, ${input.token_hash}, ${input.expires_at})
      RETURNING id, user_id, token_hash, expires_at, created_at, revoked_at
    `;
    return rows[0];
  }

  // Find an active (not revoked, not expired) token by its hash.
  async findActiveByHash(token_hash: string): Promise<RefreshTokenRow | null> {
    const rows = await this.sql<RefreshTokenRow[]>`
      SELECT id, user_id, token_hash, expires_at, created_at, revoked_at
      FROM refresh_tokens
      WHERE token_hash = ${token_hash}
        AND revoked_at IS NULL
        AND expires_at > NOW()
      LIMIT 1
    `;
    return rows[0] ?? null;
  }

  async revokeById(id: string): Promise<void> {
    await this.sql`
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE id = ${id} AND revoked_at IS NULL
    `;
  }

  async revokeAllForUser(user_id: string): Promise<void> {
    await this.sql`
      UPDATE refresh_tokens
      SET revoked_at = NOW()
      WHERE user_id = ${user_id} AND revoked_at IS NULL
    `;
  }
}
