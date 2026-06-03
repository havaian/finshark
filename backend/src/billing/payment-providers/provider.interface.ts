import type { SubscriptionRow, SubscriptionSource } from "../billing.types";

// PaymentProvider - the seam between the billing core (plans / subscriptions /
// promocodes / events) and an external PSP. Concrete providers go in this
// directory: manual.provider.ts ships now, payme.provider.ts and
// click.provider.ts come with the integration epic.
//
// The interface is deliberately small. Real PSP integrations involve a lot of
// fiddly state (idempotency keys, signature verification, retry behaviour) but
// those concerns stay inside each provider - the core sees only:
//   - createCheckout: start a payment flow, return what the frontend needs to
//                     redirect/embed
//   - handleWebhook:  parse a callback, decide what happened, return a
//                     SubscriptionUpdate that the service applies via grant()
//                     / extend() / cancel() / revoke()
//
// Until a real PSP lands this interface is a contract, not a hot path.
// ManualProvider implements it as no-ops to keep DI tidy.

export type CheckoutHandle =
  | {
      // The provider has a URL to redirect the user to. Standard for Payme /
      // Click / Stripe Checkout.
      kind: "redirect";
      url: string;
    }
  | {
      // The provider expects the frontend to render a hosted widget or its
      // own UI - the payload is whatever the provider's JS SDK needs.
      kind: "embed";
      payload: Record<string, unknown>;
    }
  | {
      // No payment flow (e.g. ManualProvider). The frontend should show a
      // message like "contact support to purchase" rather than redirect.
      kind: "noop";
      message: string;
    };

// Effect a webhook should have on a subscription. The service maps these to
// SubscriptionsService.{grant, extend, cancel, revoke} (or no-op).
export type SubscriptionUpdate =
  | { kind: "grant"; userId: string; planId: string; days?: number | null; sourceRef: string }
  | { kind: "extend"; subscriptionId: string; days: number; sourceRef: string }
  | { kind: "cancel"; subscriptionId: string; sourceRef: string }
  | { kind: "revoke"; subscriptionId: string; sourceRef: string }
  | { kind: "noop"; reason: string };

export interface PaymentProvider {
  // Identifier matches the subscription_source enum value, so subscriptions
  // created via this provider can write `source = this.id`.
  readonly id: SubscriptionSource;

  // True when the provider is fully configured and able to process real
  // payments (e.g. has API credentials). False for stubs or providers running
  // in a misconfigured environment. The admin UI uses this to show "Payme:
  // not configured" without crashing.
  isConfigured(): boolean;

  // Start a checkout for `planId`. Implementations should:
  //   - generate an idempotency key tied to userId+planId+timestamp
  //   - persist any pre-payment state the provider needs (a 'pending' sub row?
  //     left to each provider - billing core can stay agnostic)
  //   - return the handle the frontend should consume
  createCheckout(input: {
    userId: string;
    planId: string;
  }): Promise<CheckoutHandle>;

  // Verify + parse a webhook payload (and headers, since most PSPs sign via
  // headers). Implementations MUST reject unsigned/tampered payloads - return
  // SubscriptionUpdate { kind: 'noop' } only when the payload is structurally
  // valid but not actionable. For invalid signatures, throw.
  handleWebhook(input: {
    headers: Record<string, string>;
    body: unknown;
  }): Promise<SubscriptionUpdate>;
}

// Convenience exception type so providers and the router can speak the same
// language about webhook auth failures (vs generic errors). The webhook route
// (when added) translates these to 400 / 401 responses.
export class WebhookVerificationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebhookVerificationError";
  }
}

// Existing webhook idempotency / replay handling lives in each provider; the
// interface deliberately doesn't enforce a shape because PSPs differ a lot
// here (Stripe uses event ids, Payme uses transaction states, etc.).
//
// When Payme + Click land they'll get their own files alongside manual.provider.ts.
// SubscriptionsService stays untouched.

// A typed lookup map providers can register under. Useful for the eventual
// webhook router: `providers[source].handleWebhook(...)`.
export type ProviderMap = Partial<Record<SubscriptionSource, PaymentProvider>>;

// Re-export the linkage to SubscriptionRow so callers don't need to dig into
// billing.types when consuming a provider result.
export type { SubscriptionRow };
