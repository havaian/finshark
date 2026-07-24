import { Controller, Get, GoneException, Post, UseGuards } from "@nestjs/common";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AccessTokenPayload } from "../auth/auth.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PaymentsService } from "./payments.service";

// DECOMMISSIONED: the P2P (card-transfer) payment flow.
//
// Users used to transfer to one of the operator's own cards and upload a slip
// for manual admin approval. That flow has been replaced by Click, which
// settles through a licensed payment provider with proper fiscal receipts.
//
// What remains here:
//   - submissions/mine  READ-ONLY history, so a user who paid this way before
//                       the cutover can still see their past payments.
//
// What was removed and why it returns 410 rather than 404:
//   - POST submissions  a stale frontend build (or a bookmarked tab) hitting a
//                       404 looks like a bug and invites a retry. 410 Gone says
//                       "this existed and is finished", and the message tells
//                       the user where to go instead.
//   - GET cards         removed outright. Every payment_cards row was
//                       deactivated by migration 20260724000001, so this would
//                       return an empty list and render an empty transfer panel
//                       that looks broken.
//
// The admin side (AdminPaymentsController) keeps working against the historical
// records - see the note there. The service methods behind the removed routes
// are left intact rather than deleted: PaymentsService.approve is still needed
// if a pre-cutover submission ever has to be settled.
@Controller("billing/payments")
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post("submissions")
  submitRetired(): never {
    throw new GoneException(
      "Card-transfer payments have been replaced by Click. Please pay from the subscription page."
    );
  }

  // The current user's own historical submissions. Read-only.
  @Get("submissions/mine")
  async mine(@CurrentUser() user: AccessTokenPayload) {
    return this.payments.listMySubmissions(user.sub);
  }
}
