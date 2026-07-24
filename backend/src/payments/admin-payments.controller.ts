import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  StreamableFile,
  UseGuards,
} from "@nestjs/common";
import { IsOptional, IsString, MaxLength } from "class-validator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AccessTokenPayload } from "../auth/auth.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminWith2faGuard } from "../auth/guards/admin-with-2fa.guard";
import { PaymentCardsAdminService } from "./payment-cards-admin.service";
import { PaymentsService } from "./payments.service";
import type { PaymentSubmissionStatus } from "./payment.types";

class ReviewDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

// Admin surface for the DECOMMISSIONED P2P (card-transfer) flow.
//
// Live payments run through Click now (see billing/click/). What survives here
// is the historical record: past submissions, their slips, and the receiving
// cards they were paid to. Migration 20260724000001 deactivated every card and
// the user-facing endpoints are gone, so nothing new can enter this queue.
//
// Card CRUD was removed with the flow - creating or editing a receiving card
// would advertise a payment route that no longer exists anywhere in the
// product. The read endpoint stays so an old submission's card_label still
// resolves to something meaningful.
//
// approve/reject are kept deliberately. If a submission was sitting in
// 'pending' at cutover, or a dispute surfaces later, an admin still needs to be
// able to settle it - approve grants premium through the same
// SubscriptionsService path it always did.
@Controller("admin/payments")
@UseGuards(JwtAuthGuard, AdminWith2faGuard)
export class AdminPaymentsController {
  constructor(
    private readonly cards: PaymentCardsAdminService,
    private readonly payments: PaymentsService
  ) {}

  // ── Cards (read-only) ──────────────────────────────────────────────────────

  // Historical receiving cards. All inactive after the Click cutover; kept so
  // past submissions still show which card they were paid to.
  @Get("cards")
  async listCards() {
    return this.cards.list();
  }

  // ── Submission review ───────────────────────────────────────────────────────

  // Review queue. ?status=pending|approved|rejected filters; omit for all.
  @Get("submissions")
  async listSubmissions(@Query("status") status?: string) {
    const valid: PaymentSubmissionStatus[] = ["pending", "approved", "rejected"];
    const filter = valid.includes(status as PaymentSubmissionStatus)
      ? (status as PaymentSubmissionStatus)
      : undefined;
    return this.payments.listForAdmin(filter);
  }

  // Stream the slip file for review. Sets Content-Type from the stored mime and
  // an inline disposition so images/PDFs render in-browser. Uses StreamableFile
  // so Nest manages the response without @Res passthrough.
  @Get("submissions/:id/slip")
  async slip(@Param("id") id: string): Promise<StreamableFile> {
    const { stream, mime, filename, size } =
      await this.payments.openSubmissionSlip(id);
    return new StreamableFile(stream, {
      type: mime,
      disposition: `inline; filename="${encodeURIComponent(filename)}"`,
      length: size,
    });
  }

  @Post("submissions/:id/approve")
  async approve(
    @CurrentUser() admin: AccessTokenPayload,
    @Param("id") id: string,
    @Body() body: ReviewDto
  ) {
    return this.payments.approve({
      id,
      adminUserId: admin.sub,
      note: body.note?.trim() ? body.note.trim() : null,
    });
  }

  @Post("submissions/:id/reject")
  async reject(
    @CurrentUser() admin: AccessTokenPayload,
    @Param("id") id: string,
    @Body() body: ReviewDto
  ) {
    return this.payments.reject({
      id,
      adminUserId: admin.sub,
      note: body.note?.trim() ? body.note.trim() : null,
    });
  }
}
