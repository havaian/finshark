
import { api } from "./client";
import type { Plan } from "../types/billing";
import type {
  AdminPaymentCard,
  AdminPaymentSubmission,
  PaymentCard,
  PaymentSubmission,
  PaymentSubmissionStatus,
} from "../types/payment";

// User-facing P2P payment endpoints. All require auth (enforced server-side).
export const paymentApi = {
  // Active receiving cards to display for transfer (full numbers - operator's).
  listCards: async (): Promise<PaymentCard[]> =>
    (await api.get<PaymentCard[]>("/billing/payments/cards")).data,

  // Purchasable plans (active premium plans with a price) for the picker.
  listPlans: async (): Promise<Plan[]> =>
    (await api.get<Plan[]>("/billing/payments/plans")).data,

  // Submit a payment: multipart form with the slip file + plan_id [+ card_id].
  // The browser sets the multipart boundary automatically when we pass
  // FormData - we must NOT set Content-Type ourselves or the boundary is lost.
  submit: async (input: {
    planId: string;
    cardId?: string | null;
    slip: File;
  }): Promise<PaymentSubmission> => {
    const form = new FormData();
    form.append("plan_id", input.planId);
    if (input.cardId) form.append("card_id", input.cardId);
    form.append("slip", input.slip);
    const res = await api.post<PaymentSubmission>(
      "/billing/payments/submissions",
      form
    );
    return res.data;
  },

  // The current user's own submissions (status + history).
  listMine: async (): Promise<PaymentSubmission[]> =>
    (await api.get<PaymentSubmission[]>("/billing/payments/submissions/mine"))
      .data,
};

// Admin P2P endpoints. Require admin auth (server enforces); the frontend only
// renders the admin nav for is_admin users.
export const adminPaymentApi = {
  // ---- Cards ----
  listCards: async (): Promise<AdminPaymentCard[]> =>
    (await api.get<AdminPaymentCard[]>("/admin/payments/cards")).data,

  createCard: async (input: {
    card_number: string;
    holder_name: string;
    bank_label?: string | null;
    is_active?: boolean;
    sort_order?: number;
  }): Promise<AdminPaymentCard> =>
    (await api.post<AdminPaymentCard>("/admin/payments/cards", input)).data,

  updateCard: async (
    id: string,
    patch: {
      card_number?: string;
      holder_name?: string;
      bank_label?: string | null;
      is_active?: boolean;
      sort_order?: number;
    }
  ): Promise<AdminPaymentCard> =>
    (await api.patch<AdminPaymentCard>(`/admin/payments/cards/${id}`, patch))
      .data,

  deleteCard: async (id: string): Promise<{ deleted: true }> =>
    (await api.delete<{ deleted: true }>(`/admin/payments/cards/${id}`)).data,

  // ---- Submissions ----
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

// ---- Admin plan editing (price + active) ----
// Lives here alongside payments because the admin Payments page is where price
// editing surfaces, even though the endpoint is under /admin/plans.
export const adminPlanApi = {
  updatePlan: async (
    id: string,
    patch: { price_minor?: number; is_active?: boolean }
  ): Promise<Plan> =>
    (await api.patch<Plan>(`/admin/plans/${id}`, patch)).data,
};
