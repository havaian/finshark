import { Injectable } from "@nestjs/common";
import { ClickConfig } from "../click/click.config";
import { ClickService } from "../click/click.service";
import type {
  CheckoutHandle,
  PaymentProvider,
  SubscriptionUpdate,
} from "./provider.interface";

// ClickProvider - the PaymentProvider implementation for click.uz.
//
// The heavy lifting lives in ClickService and its siblings under
// billing/click/. This class exists to satisfy the PaymentProvider contract so
// the billing core can talk about "the Click provider" generically (admin UI
// "is it configured", future provider routing) without importing Click's
// internals.
//
// handleWebhook is deliberately NOT the integration point for Click's
// callbacks. That interface assumes a single webhook that maps to one
// subscription update; Click's SHOP API is a two-phase Prepare/Complete
// handshake where each phase has its own signature scheme, its own response
// body, and specific error codes that Click branches on. Squeezing it into
// handleWebhook would mean the controller reconstructing Click's exact reply
// shape from a SubscriptionUpdate, which is more indirection than the one
// caller justifies. ClickCallbackController talks to ClickService directly, and
// this method stays a no-op so the DI graph and any generic provider iteration
// keep working.
@Injectable()
export class ClickProvider implements PaymentProvider {
  readonly id = "click" as const;

  constructor(
    private readonly config: ClickConfig,
    private readonly click: ClickService
  ) {}

  isConfigured(): boolean {
    return this.config.isConfigured();
  }

  // Start a Click checkout. Returns an 'embed' handle: Click supports both a
  // redirect (my.click.uz) and an in-page overlay (checkout.js) off the SAME
  // order, and the frontend renders both buttons, so a single redirect URL
  // would throw away half of what the caller needs. The payload carries the
  // full ClickCheckoutHandle, pay_url included.
  async createCheckout(input: {
    userId: string;
    planId: string;
  }): Promise<CheckoutHandle> {
    if (!this.isConfigured()) {
      return {
        kind: "noop",
        message:
          this.config.configProblem() ??
          "Click payments are not configured on this environment.",
      };
    }
    const handle = await this.click.createOrder({
      userId: input.userId,
      planId: input.planId,
    });
    return {
      kind: "embed",
      payload: handle as unknown as Record<string, unknown>,
    };
  }

  // See the class comment: Click's callbacks are handled by
  // ClickCallbackController -> ClickService, not through this method.
  async handleWebhook(_input: {
    headers: Record<string, string>;
    body: unknown;
  }): Promise<SubscriptionUpdate> {
    return {
      kind: "noop",
      reason:
        "Click callbacks are handled by ClickCallbackController (SHOP API prepare/complete), not via handleWebhook",
    };
  }
}
