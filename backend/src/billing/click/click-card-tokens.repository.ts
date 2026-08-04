import { Inject, Injectable } from "@nestjs/common";
import type { Sql } from "postgres";
import { PG } from "../../db/db.module";
import type { ClickCardTokenRow, ClickCardTokenStatus } from "./click.types";

const TOKEN_COLS = `
  id, user_id, card_token, card_masked, phone_masked, status,
  verified_at, removed_at, last_error, created_at, updated_at
`;

@Injectable()
export class ClickCardTokensRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  // The user's usable card, if any. A pending_sms row is deliberately NOT
  // returned - a token that has not passed SMS verification cannot be charged.
  async findActiveForUser(userId: string): Promise<ClickCardTokenRow | null> {
    const rows = await this.sql<ClickCardTokenRow[]>`
      SELECT ${this.sql.unsafe(TOKEN_COLS)}
      FROM click_card_tokens
      WHERE user_id = ${userId} AND status = 'active'
      LIMIT 1
    `;
    return rows[0] ?? null;
  }

  async findById(id: string): Promise<ClickCardTokenRow | null> {
    const rows = await this.sql<ClickCardTokenRow[]>`
      SELECT ${this.sql.unsafe(TOKEN_COLS)}
      FROM click_card_tokens WHERE id = ${id} LIMIT 1
    `;
    return rows[0] ?? null;
  }

  // Start a binding. Any earlier pending_sms row for this user is retired
  // first: a user who abandons the SMS step and starts again would otherwise
  // accumulate dead rows, and only one of them can ever be verified.
  async insertPending(input: {
    userId: string;
    cardToken: string;
    phoneMasked: string | null;
  }): Promise<ClickCardTokenRow> {
    return this.sql.begin(async (tx) => {
      await tx`
        UPDATE click_card_tokens
        SET status = 'removed', removed_at = NOW()
        WHERE user_id = ${input.userId} AND status = 'pending_sms'
      `;
      const rows = await tx<ClickCardTokenRow[]>`
        INSERT INTO click_card_tokens (user_id, card_token, phone_masked, status)
        VALUES (${input.userId}, ${input.cardToken}, ${input.phoneMasked}, 'pending_sms')
        RETURNING ${tx.unsafe(TOKEN_COLS)}
      `;
      return rows[0];
    });
  }

  // Promote a verified token to active, retiring whatever card the user had
  // before. Both halves run in one transaction because the partial unique
  // index allows only one active row per user - doing it in two statements
  // would briefly violate it and fail.
  async markVerified(input: {
    id: string;
    cardMasked: string | null;
  }): Promise<ClickCardTokenRow | null> {
    return this.sql.begin(async (tx) => {
      const owner = await tx<Array<{ user_id: string }>>`
        SELECT user_id FROM click_card_tokens WHERE id = ${input.id}
      `;
      if (owner.length === 0) return null;

      await tx`
        UPDATE click_card_tokens
        SET status = 'removed', removed_at = NOW()
        WHERE user_id = ${owner[0].user_id}
          AND status = 'active'
          AND id <> ${input.id}
      `;
      const rows = await tx<ClickCardTokenRow[]>`
        UPDATE click_card_tokens SET
          status = 'active',
          card_masked = ${input.cardMasked},
          verified_at = NOW(),
          last_error = NULL
        WHERE id = ${input.id} AND status = 'pending_sms'
        RETURNING ${tx.unsafe(TOKEN_COLS)}
      `;
      return rows[0] ?? null;
    });
  }

  async markRemoved(id: string): Promise<ClickCardTokenRow | null> {
    const rows = await this.sql<ClickCardTokenRow[]>`
      UPDATE click_card_tokens
      SET status = 'removed', removed_at = NOW()
      WHERE id = ${id} AND status <> 'removed'
      RETURNING ${this.sql.unsafe(TOKEN_COLS)}
    `;
    return rows[0] ?? null;
  }

  // Record a charge failure against the card without retiring it: a declined
  // payment is usually transient (insufficient funds), and removing the token
  // would force the user to re-enter their card for a problem that resolves
  // itself. Permanent failures retire the token via markRemoved instead.
  async setLastError(id: string, error: string | null): Promise<void> {
    await this.sql`
      UPDATE click_card_tokens SET last_error = ${error} WHERE id = ${id}
    `;
  }

  async setStatus(id: string, status: ClickCardTokenStatus): Promise<void> {
    await this.sql`
      UPDATE click_card_tokens SET status = ${status} WHERE id = ${id}
    `;
  }
}
