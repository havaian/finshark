
import { api } from "./client";
import type { Plan } from "../types/billing";
import type {
  AdminPaymentCard,
  AdminPaymentSubmission,
  PaymentSubmission,
  PaymentSubmissionStatus,
} from "../types/payment";

// DECOMMISSIONED: the P2P (card-transfer) payment flow.
//
// Live payments go through Click now - see click.api.ts. What remains here is
// read access to the historical record, plus the admin plan editor (which is
// not P2P-specific and still drives Click pricing).
//
// Removed with the flow: card listing for users, slip submission, and admin
// card CRUD. The backend answers 410 Gone on submission POSTs so a stale
// frontend build fails legibly rather than 404-ing.

// User-facing: their own past transfer submissions, read-only.
export const paymentApi = {
  listMine: async (): Promise<PaymentSubmission[]> =>
    (await api.get<PaymentSubmission[]>("/billing/payments/submissions/mine"))
      .data,
};

// Admin: historical P2P records. Approve/reject are kept because a submission
// left pending at cutover, or a later dispute, still needs settling - approve
// grants premium through the same path it always did.
export const adminPaymentApi = {
  // Historical receiving cards. All inactive; shown so an old submission's
  // card reference still resolves to something meaningful.
  listCards: async (): Promise<AdminPaymentCard[]> =>
    (await api.get<AdminPaymentCard[]>("/admin/payments/cards")).data,

  listSubmissions: async (
    status?: PaymentSubmissionStatus
  ): Promise<AdminPaymentSubmission[]> => {
    const qs = status ? `?status=${status}` : "";
    return (
      await api.get<AdminPaymentSubmission[]>(
        `/admin/payments/submissions${qs}`
      )
    ).data;
  },

  // Slip is streamed; we fetch it as a blob so it can be shown in an <img> /
  // <iframe> via an object URL. Goes through `api` so the auth header + refresh
  // interceptor apply. Returns the object URL AND the blob's mime so the
  // caller can decide how to render (image vs pdf).
  fetchSlip: async (
    submissionId: string
  ): Promise<{ url: string; mime: string }> => {
    const res = await api.get(
      `/admin/payments/submissions/${submissionId}/slip`,
      { responseType: "blob" }
    );
    const blob = res.data as Blob;
    return { url: URL.createObjectURL(blob), mime: blob.type };
  },

  approve: async (
    id: string,
    note?: string
  ): Promise<AdminPaymentSubmission> =>
    (
      await api.post<AdminPaymentSubmission>(
        `/admin/payments/submissions/${id}/approve`,
        { note }
      )
    ).data,

  reject: async (id: string, note?: string): Promise<AdminPaymentSubmission> =>
    (
      await api.post<AdminPaymentSubmission>(
        `/admin/payments/submissions/${id}/reject`,
        { note }
      )
    ).data,
};

// ---- Admin plan editing (price, active, fiscal receipt line) ----
// Not P2P-specific: this is what sets the amount Click charges, and the receipt
// line the OFD prints. Lives here because the admin Payments page is where it
// surfaces, even though the endpoint is under /admin/plans.
export const adminPlanApi = {
  updatePlan: async (
    id: string,
    patch: {
      price_minor?: number;
      is_active?: boolean;
      // Present-but-null clears the receipt line, which disables fiscalization
      // for the plan rather than filing an invented description.
      fiscal_item_name?: string | null;
    }
  ): Promise<Plan> =>
    (await api.patch<Plan>(`/admin/plans/${id}`, patch)).data,
};
