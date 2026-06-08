// Frontend types for the P2P payment flow. Mirror the backend DTOs in
// src/payments/payment.types.ts (PublicPaymentCard, PublicPaymentSubmission,
// AdminPaymentCard, AdminPaymentSubmission).

export type PaymentSubmissionStatus = "pending" | "approved" | "rejected";

// Card shown to a user for transfer (full number - operator's own card).
export interface PaymentCard {
  id: string;
  card_number: string;
  holder_name: string;
  bank_label: string | null;
}

// A user's own submission.
export interface PaymentSubmission {
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

// Admin: card with management fields.
export interface AdminPaymentCard extends PaymentCard {
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Admin: submission with joined user/plan context.
export interface AdminPaymentSubmission {
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
  reviewed_at: string | null;
  subscription_id: string | null;
  created_at: string;
  updated_at: string;
}
