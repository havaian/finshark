// Types for the P2P payment flow. Row shapes mirror the migration
// 20260608000005_p2p_payments.js - keep in sync.
//
// See the migration header for the flow overview. In short: admin-managed
// receiving cards (payment_cards) + user-submitted transfer slips
// (payment_submissions) reviewed manually by an admin who approves -> grant.

export type PaymentSubmissionStatus = "pending" | "approved" | "rejected";

// ── Row shapes (postgres.js; bigint -> string) ─────────────────────────────

export interface PaymentCardRow {
  id: string; // uuid
  card_number: string;
  holder_name: string;
  bank_label: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: Date;
  updated_at: Date;
}

export interface PaymentSubmissionRow {
  id: string; // uuid
  user_id: string;
  plan_id: string;
  card_id: string | null;
  amount_minor: number;
  currency: string;
  slip_path: string;
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
}

// ── Public (API) shapes ────────────────────────────────────────────────────

// Card as shown to a USER for transfer. Full number is intentional - it's the
// operator's own receiving card, meant to be copied. No masking.
export interface PublicPaymentCard {
  id: string;
  card_number: string;
  holder_name: string;
  bank_label: string | null;
}

// Card as shown to an ADMIN (adds management fields).
export interface AdminPaymentCard extends PublicPaymentCard {
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// A user's view of their own submission (no internal reviewer ids).
export interface PublicPaymentSubmission {
  id: string;
  plan_id: string;
  amount_minor: number;
  currency: string;
  slip_original_name: string;
  status: PaymentSubmissionStatus;
  review_note: string | null;
  created_at: string;
  reviewed_at: string | null;
}

// Admin's view of a submission (joins user + plan display info; slip is fetched
// via a separate streaming endpoint, not inlined).
export interface AdminPaymentSubmission {
  id: string;
  user_id: string;
  user_email: string | null;
  user_name: string | null;
  plan_id: string;
  plan_name: string | null;
  card_id: string | null;
  card_label: string | null; // bank_label or masked tail for admin context
  amount_minor: number;
  currency: string;
  slip_original_name: string;
  slip_mime: string;
  slip_size: number;
  status: PaymentSubmissionStatus;
  review_note: string | null;
  reviewed_by_user_id: string | null;
  reviewed_at: string | null;
  subscription_id: string | null;
  created_at: string;
  updated_at: string;
}

// ── Mappers ────────────────────────────────────────────────────────────────

export function toPublicPaymentCard(row: PaymentCardRow): PublicPaymentCard {
  return {
    id: row.id,
    card_number: row.card_number,
    holder_name: row.holder_name,
    bank_label: row.bank_label,
  };
}

export function toAdminPaymentCard(row: PaymentCardRow): AdminPaymentCard {
  return {
    id: row.id,
    card_number: row.card_number,
    holder_name: row.holder_name,
    bank_label: row.bank_label,
    is_active: row.is_active,
    sort_order: row.sort_order,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}

export function toPublicPaymentSubmission(
  row: PaymentSubmissionRow
): PublicPaymentSubmission {
  return {
    id: row.id,
    plan_id: row.plan_id,
    amount_minor: row.amount_minor,
    currency: row.currency,
    slip_original_name: row.slip_original_name,
    status: row.status,
    review_note: row.review_note,
    created_at: row.created_at.toISOString(),
    reviewed_at: row.reviewed_at ? row.reviewed_at.toISOString() : null,
  };
}
