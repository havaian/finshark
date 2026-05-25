import { Injectable } from "@nestjs/common";
import type {
  CheckoutHandle,
  PaymentProvider,
  SubscriptionUpdate,
} from "./provider.interface";

// ManualProvider — placeholder before any real PSP is integrated. Always
// available so DI graph and admin UI work; never produces payments.
// `source = 'manual'` is also used for admin-issued grants (created directly
// via SubscriptionsService.grant), so this provider's createCheckout simply
// returns a friendly no-op the frontend can show as "contact support".
//
// When Payme / Click land they get their own files in this directory and a
// real createCheckout / handleWebhook. Code paths outside this folder do not
// change.

@Injectable()
export class ManualProvider implements PaymentProvider {
  readonly id = "manual" as const;

  // Always configured — there's no external dependency to be missing.
  isConfigured(): boolean {
    return true;
  }

  async createCheckout(_input: {
    userId: string;
    planId: string;
  }): Promise<CheckoutHandle> {
    return {
      kind: "noop",
      message:
        "Online payments are not yet available. Contact support to purchase or redeem a code.",
    };
  }

  // No webhook source for manual grants. If called, return a no-op so the
  // generic webhook router (when it exists) doesn't have to special-case this.
  async handleWebhook(_input: {
    headers: Record<string, string>;
    body: unknown;
  }): Promise<SubscriptionUpdate> {
    return { kind: "noop", reason: "manual provider does not accept webhooks" };
  }
}
