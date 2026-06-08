import { Inject, Injectable } from "@nestjs/common";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";
import type {
  AdminPaymentSubmission,
  PaymentSubmissionRow,
  PaymentSubmissionStatus,
} from "./payment.types";

const SUB_COLS = `
  id, user_id, plan_id, card_id, amount_minor, currency,
  slip_path, slip_original_name, slip_mime, slip_size,
  status, review_note, reviewed_by_user_id, reviewed_at,
  subscription_id, created_at, updated_at
`;

@Injectable()
export class PaymentSubmissionsRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  async create(input: {
    user_id: string;
    plan_id: string;
    card_id: string | null;
    amount_minor: number;
    currency: string;
    slip_path: string;
    slip_original_name: string;
    slip_mime: string;
    slip_size: number;
  }): Promise<PaymentSubmissionRow> {
    const rows = await this.sql<PaymentSubmissionRow[]>`
      INSERT INTO payment_submissions (
        user_id, plan_id, card_id, amount_minor, currency,
        slip_path, slip_original_name, slip_mime, slip_size
      )
      VALUES (
        ${input.user_id}, ${input.plan_id}, ${input.card_id},
        ${input.amount_minor}, ${input.currency},
        ${input.slip_path}, ${input.slip_original_name},
        ${input.slip_mime}, ${input.slip_size}
      )
      RETURNING ${this.sql.unsafe(SUB_COLS)}
    `;
    return rows[0];
  }

  async findById(id: string): Promise<PaymentSubmissionRow | null> {
    const rows = await this.sql<PaymentSubmissionRow[]>`
      SELECT ${this.sql.unsafe(SUB_COLS)}
      FROM payment_submissions
      WHERE id = ${id}
      LIMIT 1
    `;
    return rows[0] ?? null;
  }

  // A user's own submissions, newest first. Served by idx_payment_subs_user_created.
  async findByUser(userId: string): Promise<PaymentSubmissionRow[]> {
    return this.sql<PaymentSubmissionRow[]>`
      SELECT ${this.sql.unsafe(SUB_COLS)}
      FROM payment_submissions
      WHERE user_id = ${userId}
      ORDER BY created_at DESC
    `;
  }

  // Does this user already have a pending submission? Used to stop a user
  // stacking multiple pending uploads for the same intent (one at a time).
  async hasPending(userId: string): Promise<boolean> {
    const rows = await this.sql<Array<{ one: number }>>`
      SELECT 1 AS one
      FROM payment_submissions
      WHERE user_id = ${userId} AND status = 'pending'
      LIMIT 1
    `;
    return rows.length > 0;
  }

  // Admin queue. Optional status filter; newest first. The join pulls user +
  // plan display fields in ONE query (no N+1). Served by
  // idx_payment_subs_status_created when a status is given.
  async findForAdmin(
    status?: PaymentSubmissionStatus
  ): Promise<AdminPaymentSubmission[]> {
    const statusFilter = status
      ? this.sql`WHERE ps.status = ${status}`
      : this.sql``;
    const rows = await this.sql<
      Array<{
        id: string;
        user_id: string;
        user_email: string | null;
        user_name: string | null;
        plan_id: string;
        plan_name: string | null;
        card_id: string | null;
        card_label: string | null;
        amount_minor: number;
        currency: string;
        slip_original_name: string;
        slip_mime: string;
        slip_size: number;
        status: PaymentSubmissionStatus;
        review_note: string | null;
        reviewed_by_user_id: string | null;
        reviewed_at: Date | null;
        subscription_id: string | null;
        created_at: Date;
        updated_at: Date;
      }>
    >`
      SELECT
        ps.id,
        ps.user_id,
        u.email           AS user_email,
        u.display_name    AS user_name,
        ps.plan_id,
        p.name            AS plan_name,
        ps.card_id,
        pc.bank_label     AS card_label,
        ps.amount_minor,
        ps.currency,
        ps.slip_original_name,
        ps.slip_mime,
        ps.slip_size,
        ps.status,
        ps.review_note,
        ps.reviewed_by_user_id,
        ps.reviewed_at,
        ps.subscription_id,
        ps.created_at,
        ps.updated_at
      FROM payment_submissions ps
      LEFT JOIN users u ON u.id = ps.user_id
      LEFT JOIN plans p ON p.id = ps.plan_id
      LEFT JOIN payment_cards pc ON pc.id = ps.card_id
      ${statusFilter}
      ORDER BY ps.created_at DESC
    `;
    return rows.map((r) => ({
      id: r.id,
      user_id: r.user_id,
      user_email: r.user_email,
      user_name: r.user_name,
      plan_id: r.plan_id,
      plan_name: r.plan_name,
      card_id: r.card_id,
      card_label: r.card_label,
      amount_minor: r.amount_minor,
      currency: r.currency,
      slip_original_name: r.slip_original_name,
      slip_mime: r.slip_mime,
      slip_size: r.slip_size,
      status: r.status,
      review_note: r.review_note,
      reviewed_by_user_id: r.reviewed_by_user_id,
      reviewed_at: r.reviewed_at ? r.reviewed_at.toISOString() : null,
      subscription_id: r.subscription_id,
      created_at: r.created_at.toISOString(),
      updated_at: r.updated_at.toISOString(),
    }));
  }

  // Mark a submission reviewed. status -> approved|rejected, with reviewer +
  // note, and (on approval) the linked subscription id. Guarded on the current
  // status being 'pending' so two admins can't double-process; returns null if
  // the row wasn't pending (already handled) or doesn't exist.
  async markReviewed(input: {
    id: string;
    status: Extract<PaymentSubmissionStatus, "approved" | "rejected">;
    reviewed_by_user_id: string;
    review_note: string | null;
    subscription_id: string | null;
  }): Promise<PaymentSubmissionRow | null> {
    const rows = await this.sql<PaymentSubmissionRow[]>`
      UPDATE payment_submissions SET
        status              = ${input.status},
        reviewed_by_user_id = ${input.reviewed_by_user_id},
        review_note         = ${input.review_note},
        subscription_id     = ${input.subscription_id},
        reviewed_at         = NOW()
      WHERE id = ${input.id} AND status = 'pending'
      RETURNING ${this.sql.unsafe(SUB_COLS)}
    `;
    return rows[0] ?? null;
  }
}
