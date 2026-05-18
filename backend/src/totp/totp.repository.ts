import { Inject, Injectable } from "@nestjs/common";
import type postgres from "postgres";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";
import type { TotpAuditEvent, TotpAuditRow } from "./totp.audit";

// Recovery-code row as returned by SELECT. We only ever read code_hash and
// flip used_at — the plaintext code never goes through this repository.
export interface TotpRecoveryCodeRow {
  id: string;
  user_id: string;
  code_hash: string;
  used_at: Date | null;
  created_at: Date;
}

@Injectable()
export class TotpRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  // Set the TOTP secret + enrolled_at atomically. Called from setup-verify
  // after the first 6-digit code was validated. Always pairs the two columns
  // so they can't drift (totp_secret set but enrolled_at null = inconsistent).
  async enroll(opts: { user_id: string; secret_b32: string }): Promise<void> {
    await this.sql`
      UPDATE users
      SET totp_secret = ${opts.secret_b32},
          totp_enrolled_at = NOW()
      WHERE id = ${opts.user_id}
    `;
  }

  // Clear secret + enrolled_at + all recovery codes. Called from disable.
  // We delete codes rather than mark them used; a future re-enroll generates
  // a fresh set, and keeping stale codes around (even hashed) is just risk
  // surface with no payoff.
  async disable(user_id: string): Promise<void> {
    await this.sql.begin(async (tx) => {
      await tx`
        UPDATE users
        SET totp_secret = NULL,
            totp_enrolled_at = NULL
        WHERE id = ${user_id}
      `;
      await tx`DELETE FROM user_totp_recovery_codes WHERE user_id = ${user_id}`;
    });
  }

  // Replace all recovery codes for a user with the given hashes. Used during
  // enrollment (after the user confirms they've saved them) AND if we ever
  // expose a "regenerate codes" endpoint (we don't currently).
  // Runs in one transaction so we never end up with zero codes on a partial
  // failure.
  async replaceRecoveryCodes(opts: {
    user_id: string;
    hashes: string[];
  }): Promise<void> {
    await this.sql.begin(async (tx) => {
      await tx`DELETE FROM user_totp_recovery_codes WHERE user_id = ${opts.user_id}`;
      for (const hash of opts.hashes) {
        await tx`
          INSERT INTO user_totp_recovery_codes (user_id, code_hash)
          VALUES (${opts.user_id}, ${hash})
        `;
      }
    });
  }

  // All unused recovery codes for a user. The verifier reads these and
  // compares each candidate hash; we can't query by hash directly because
  // the verifier reconstructs the hash with the per-row salt.
  async findUnusedRecoveryCodes(
    user_id: string
  ): Promise<TotpRecoveryCodeRow[]> {
    return this.sql<TotpRecoveryCodeRow[]>`
      SELECT id::text, user_id::text, code_hash, used_at, created_at
      FROM user_totp_recovery_codes
      WHERE user_id = ${user_id} AND used_at IS NULL
    `;
  }

  // Mark a specific code as consumed. Idempotent via the used_at IS NULL
  // guard — re-running with the same id is a no-op. Returns whether a row
  // was actually flipped (for the rare race where two requests both verify
  // the same code; only one wins).
  async consumeRecoveryCode(id: string): Promise<boolean> {
    const rows = await this.sql<Array<{ id: string }>>`
      UPDATE user_totp_recovery_codes
      SET used_at = NOW()
      WHERE id = ${id} AND used_at IS NULL
      RETURNING id
    `;
    return rows.length > 0;
  }

  // Count unused recovery codes — surfaced in the audit `meta` so we can
  // record "user has N codes left" alongside a consumption event, and
  // shown in the Settings UI so the user knows when to regenerate.
  async countUnusedRecoveryCodes(user_id: string): Promise<number> {
    const rows = await this.sql<Array<{ c: string }>>`
      SELECT COUNT(*)::text AS c
      FROM user_totp_recovery_codes
      WHERE user_id = ${user_id} AND used_at IS NULL
    `;
    return parseInt(rows[0]?.c ?? "0", 10);
  }

  // ── Failed attempts (per-user lockout) ────────────────────────────────

  // Append one failure. Called from the verifier on every wrong TOTP /
  // recovery code. The row is small; we don't bother batching.
  async recordFailedAttempt(opts: {
    user_id: string;
    ip: string | null;
  }): Promise<void> {
    await this.sql`
      INSERT INTO user_totp_failed_attempts (user_id, ip)
      VALUES (${opts.user_id}, ${opts.ip})
    `;
  }

  // Count failures for a user within the lockout window. The verifier reads
  // this BEFORE attempting validation and refuses if >= threshold. Index
  // on (user_id, created_at) covers this.
  async countRecentFailedAttempts(opts: {
    user_id: string;
    window_minutes: number;
  }): Promise<number> {
    const rows = await this.sql<Array<{ c: string }>>`
      SELECT COUNT(*)::text AS c
      FROM user_totp_failed_attempts
      WHERE user_id = ${opts.user_id}
        AND created_at > NOW() - (${opts.window_minutes}::int * INTERVAL '1 minute')
    `;
    return parseInt(rows[0]?.c ?? "0", 10);
  }

  // Clear all failed attempts for a user. Called after a successful verify
  // — wiping is cheaper than letting the table grow unbounded waiting for
  // the window to expire on every row.
  async clearFailedAttempts(user_id: string): Promise<void> {
    await this
      .sql`DELETE FROM user_totp_failed_attempts WHERE user_id = ${user_id}`;
  }

  // ── Audit log ─────────────────────────────────────────────────────────

  // Append one audit row. Used by every 2FA state transition. Failures here
  // are swallowed by the caller (audit must never break the operation it's
  // recording) — but we let the SQL throw so the caller sees a logger.error.
  async recordAuditEvent(opts: {
    user_id: string;
    event: TotpAuditEvent;
    ip: string | null;
    meta?: Record<string, unknown>;
  }): Promise<void> {
    await this.sql`
      INSERT INTO user_totp_audit_log (user_id, event, ip, meta)
      VALUES (
        ${opts.user_id},
        ${opts.event},
        ${opts.ip},
        ${this.sql.json((opts.meta ?? {}) as unknown as postgres.JSONValue)}
      )
    `;
  }

  // List recent audit events for a user, most recent first. Surface for an
  // admin "view my 2FA history" UI (not built yet, but the data is there
  // when needed). Capped to keep payload small.
  async listAuditEvents(opts: {
    user_id: string;
    limit?: number;
  }): Promise<TotpAuditRow[]> {
    const limit = Math.max(1, Math.min(200, opts.limit ?? 50));
    return this.sql<TotpAuditRow[]>`
      SELECT id::text, user_id::text, event, ip, meta, created_at
      FROM user_totp_audit_log
      WHERE user_id = ${opts.user_id}
      ORDER BY created_at DESC
      LIMIT ${limit}
    `;
  }
}
