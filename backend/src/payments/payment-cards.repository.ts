import { Inject, Injectable } from "@nestjs/common";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";
import type { PaymentCardRow } from "./payment.types";

const CARD_COLS = `
  id, card_number, holder_name, bank_label,
  is_active, sort_order, created_at, updated_at
`;

@Injectable()
export class PaymentCardsRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  // Active cards for the user-facing transfer UI, ordered for display. Served
  // by idx_payment_cards_active_sort.
  async findActive(): Promise<PaymentCardRow[]> {
    return this.sql<PaymentCardRow[]>`
      SELECT ${this.sql.unsafe(CARD_COLS)}
      FROM payment_cards
      WHERE is_active = TRUE
      ORDER BY sort_order ASC, created_at ASC
    `;
  }

  // All cards for the admin management table (includes inactive).
  async findAll(): Promise<PaymentCardRow[]> {
    return this.sql<PaymentCardRow[]>`
      SELECT ${this.sql.unsafe(CARD_COLS)}
      FROM payment_cards
      ORDER BY sort_order ASC, created_at ASC
    `;
  }

  async findById(id: string): Promise<PaymentCardRow | null> {
    const rows = await this.sql<PaymentCardRow[]>`
      SELECT ${this.sql.unsafe(CARD_COLS)}
      FROM payment_cards
      WHERE id = ${id}
      LIMIT 1
    `;
    return rows[0] ?? null;
  }

  async create(input: {
    card_number: string;
    holder_name: string;
    bank_label: string | null;
    is_active: boolean;
    sort_order: number;
  }): Promise<PaymentCardRow> {
    const rows = await this.sql<PaymentCardRow[]>`
      INSERT INTO payment_cards (card_number, holder_name, bank_label, is_active, sort_order)
      VALUES (
        ${input.card_number}, ${input.holder_name}, ${input.bank_label},
        ${input.is_active}, ${input.sort_order}
      )
      RETURNING ${this.sql.unsafe(CARD_COLS)}
    `;
    return rows[0];
  }

  // Partial update. Only provided fields change; updated_at is bumped by the
  // DB trigger. Returns null if the card doesn't exist. We build a plain patch
  // object containing only the keys actually present in the input, and hand it
  // to postgres.js's sql(obj) update helper which emits `SET col = $n, ...`
  // for exactly those keys. This cleanly supports clearing bank_label (pass
  // null) vs leaving it (omit the key) without COALESCE gymnastics.
  async update(
    id: string,
    patch: {
      card_number?: string;
      holder_name?: string;
      bank_label?: string | null;
      is_active?: boolean;
      sort_order?: number;
    }
  ): Promise<PaymentCardRow | null> {
    const set: Record<string, unknown> = {};
    if (patch.card_number !== undefined) set.card_number = patch.card_number;
    if (patch.holder_name !== undefined) set.holder_name = patch.holder_name;
    if ("bank_label" in patch) set.bank_label = patch.bank_label ?? null;
    if (patch.is_active !== undefined) set.is_active = patch.is_active;
    if (patch.sort_order !== undefined) set.sort_order = patch.sort_order;

    // Nothing to change - just return the current row so callers get a
    // consistent shape (and a clear null for "not found").
    if (Object.keys(set).length === 0) {
      return this.findById(id);
    }

    const rows = await this.sql<PaymentCardRow[]>`
      UPDATE payment_cards SET ${this.sql(set)}
      WHERE id = ${id}
      RETURNING ${this.sql.unsafe(CARD_COLS)}
    `;
    return rows[0] ?? null;
  }

  async remove(id: string): Promise<boolean> {
    const rows = await this.sql<Array<{ id: string }>>`
      DELETE FROM payment_cards WHERE id = ${id} RETURNING id
    `;
    return rows.length > 0;
  }
}
