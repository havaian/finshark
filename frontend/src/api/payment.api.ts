
import { api } from "./client";
import type { Plan } from "../types/billing";

// The P2P (card-transfer) payment flow has been REMOVED, not just retired.
// Live payments go through Click - see click.api.ts.
//
// What remains in this file is the admin plan editor, which was never
// P2P-specific: it drives Click pricing.

// User-facing: their own past transfer submissions, read-only.
// The P2P card-transfer flow (paymentApi / adminPaymentApi) was removed after
// the Click cutover. Historical rows stay in payment_submissions and
// payment_cards - the code is gone, the financial records are not.
export const adminPlanApi = {
  updatePlan: async (
    id: string,
    patch: {
      name?: string;
      // Days granted per purchase. Future grants only - existing subscriptions
      // hold concrete dates and do not shift.
      period_days?: number;
      price_minor?: number;
      is_active?: boolean;
      // Present-but-null clears the receipt line, which disables fiscalization
      // for the plan rather than filing an invented description.
      fiscal_item_name?: string | null;
    }
  ): Promise<Plan> =>
    (await api.patch<Plan>(`/admin/plans/${id}`, patch)).data,
};
