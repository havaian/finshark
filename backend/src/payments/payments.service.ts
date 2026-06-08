import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from "@nestjs/common";
import { PlansRepository } from "../billing/plans.repository";
import { SubscriptionsService } from "../billing/subscriptions.service";
import { toPublicPlan } from "../billing/billing.types";
import type { PublicPlan } from "../billing/billing.types";
import { PaymentCardsRepository } from "./payment-cards.repository";
import { PaymentSubmissionsRepository } from "./payment-submissions.repository";
import { PaymentStorageService } from "./payment-storage.service";
import type {
  AdminPaymentSubmission,
  PaymentSubmissionRow,
  PaymentSubmissionStatus,
  PublicPaymentCard,
  PublicPaymentSubmission,
} from "./payment.types";
import {
  toPublicPaymentCard,
  toPublicPaymentSubmission,
} from "./payment.types";

// PaymentsService owns the P2P (card-transfer) flow. It does NOT own the
// subscription lifecycle - approval delegates to SubscriptionsService.grant,
// so all the existing audit/email/entitlement behaviour is reused unchanged.
@Injectable()
export class PaymentsService {
  private readonly log = new Logger(PaymentsService.name);

  constructor(
    private readonly cards: PaymentCardsRepository,
    private readonly submissions: PaymentSubmissionsRepository,
    private readonly storage: PaymentStorageService,
    private readonly plans: PlansRepository,
    private readonly subscriptions: SubscriptionsService
  ) {}

  // ── User-facing ──────────────────────────────────────────────────────────

  // Active receiving cards for the transfer UI (full numbers - operator's own).
  async listActiveCards(): Promise<PublicPaymentCard[]> {
    const rows = await this.cards.findActive();
    return rows.map(toPublicPaymentCard);
  }

  // Purchasable plans for the user payment picker: active, premium-tier, with a
  // configured price. Ordered by sort_order (monthly < yearly < lifetime, per
  // the seed). The free plan and any priceless/inactive plan are filtered out
  // so the picker only ever shows things a user can actually pay for. Prices
  // here reflect the latest admin edits (read straight from the table).
  async listPurchasablePlans(): Promise<PublicPlan[]> {
    const rows = await this.plans.findAll(/* includeInactive */ false);
    return rows
      .filter(
        (p) =>
          p.tier === "premium" &&
          p.price_minor !== null &&
          p.currency !== null
      )
      .map(toPublicPlan);
  }

  // Create a pending submission: validate plan + card, store the slip, insert
  // the row. No subscription is created here - that happens on admin approval.
  async createSubmission(input: {
    userId: string;
    planId: string;
    cardId: string | null;
    slip: Express.Multer.File;
  }): Promise<PublicPaymentSubmission> {
    // One pending submission at a time per user - stops accidental double
    // uploads piling up in the review queue. The user must wait for review (or
    // have it rejected) before submitting again.
    if (await this.submissions.hasPending(input.userId)) {
      throw new BadRequestException(
        "you already have a payment under review - please wait for it to be processed"
      );
    }

    const plan = await this.plans.findById(input.planId);
    if (!plan || !plan.is_active) {
      throw new BadRequestException("unknown or inactive plan");
    }
    if (plan.tier !== "premium") {
      // Paying for the free plan makes no sense; guard it.
      throw new BadRequestException("this plan is not purchasable");
    }
    if (plan.price_minor === null || plan.currency === null) {
      throw new BadRequestException("this plan has no price configured");
    }

    // Validate the chosen card if one was provided. card is optional (the user
    // might transfer to whatever single card is shown), but if they reference a
    // card id it must exist and be active.
    let cardId: string | null = null;
    if (input.cardId) {
      const card = await this.cards.findById(input.cardId);
      if (!card || !card.is_active) {
        throw new BadRequestException("selected card is not available");
      }
      cardId = card.id;
    }

    // Persist the slip to disk first; if the DB insert then fails we clean it
    // up so we don't leak an orphan file.
    const stored = await this.storage.storeSlip(input.slip);
    try {
      const row = await this.submissions.create({
        user_id: input.userId,
        plan_id: plan.id,
        card_id: cardId,
        amount_minor: plan.price_minor,
        currency: plan.currency,
        slip_path: stored.relativePath,
        slip_original_name: stored.originalName,
        slip_mime: stored.mime,
        slip_size: stored.size,
      });
      return toPublicPaymentSubmission(row);
    } catch (e) {
      await this.storage.deleteSlip(stored.relativePath);
      throw e;
    }
  }

  // A user's own submissions, newest first.
  async listMySubmissions(userId: string): Promise<PublicPaymentSubmission[]> {
    const rows = await this.submissions.findByUser(userId);
    return rows.map(toPublicPaymentSubmission);
  }

  // ── Admin-facing ───────────────────────────────────────────────────────────

  async listForAdmin(
    status?: PaymentSubmissionStatus
  ): Promise<AdminPaymentSubmission[]> {
    return this.submissions.findForAdmin(status);
  }

  // Resolve a submission's slip for streaming. Returns the file stream + the
  // mime/name so the controller can set headers. Throws NotFound if the
  // submission or its file is gone.
  async openSubmissionSlip(id: string): Promise<{
    stream: import("node:fs").ReadStream;
    size: number;
    mime: string;
    filename: string;
  }> {
    const sub = await this.submissions.findById(id);
    if (!sub) throw new NotFoundException("submission not found");
    const { stream, size } = await this.storage.openSlip(sub.slip_path);
    return {
      stream,
      size,
      mime: sub.slip_mime,
      filename: sub.slip_original_name,
    };
  }

  // Approve a pending submission: grant premium via SubscriptionsService, then
  // mark the submission reviewed + link the subscription. The grant happens
  // FIRST so that if it fails we don't mark the submission approved. The
  // markReviewed call is status-guarded ('pending' only), so a concurrent
  // double-approve can't double-grant the same submission... almost: see note.
  async approve(input: {
    id: string;
    adminUserId: string;
    note: string | null;
  }): Promise<PaymentSubmissionRow> {
    const sub = await this.submissions.findById(input.id);
    if (!sub) throw new NotFoundException("submission not found");
    if (sub.status !== "pending") {
      throw new BadRequestException(
        `submission already ${sub.status} - cannot approve`
      );
    }

    // Grant premium. source='manual' (admin action); the P2P origin is recorded
    // in metadata + source_ref so the audit trail explains it. days=undefined
    // lets grant() use the plan's period_days.
    const subscription = await this.subscriptions.grant({
      userId: sub.user_id,
      planId: sub.plan_id,
      source: "manual",
      sourceRef: `payment_submission:${sub.id}`,
      createdByUserId: input.adminUserId,
      reason: input.note ?? "P2P card transfer approved",
      metadata: { origin: "p2p", submission_id: sub.id },
    });

    // Mark reviewed + link. Status-guarded on 'pending'.
    const updated = await this.submissions.markReviewed({
      id: sub.id,
      status: "approved",
      reviewed_by_user_id: input.adminUserId,
      review_note: input.note,
      subscription_id: subscription.id,
    });

    if (!updated) {
      // Lost a race: another admin flipped it out of 'pending' between our
      // findById and markReviewed, so they (or we) already granted. We can't
      // cleanly un-grant here without risking revoking a legitimate grant, so
      // we log loudly for manual reconciliation rather than silently
      // double-granting. This is a rare, admin-only race.
      this.log.error(
        `payment submission ${sub.id} approve race: grant created subscription ${subscription.id} but submission was no longer pending. Manual review needed for possible duplicate grant.`
      );
      throw new BadRequestException(
        "submission was processed concurrently - please re-check this user's subscriptions"
      );
    }

    return updated;
  }

  // Reject a pending submission with a note explaining why. No subscription
  // side effects. The slip file is kept (audit trail / dispute), removed only
  // if the whole submission is later deleted.
  async reject(input: {
    id: string;
    adminUserId: string;
    note: string | null;
  }): Promise<PaymentSubmissionRow> {
    const sub = await this.submissions.findById(input.id);
    if (!sub) throw new NotFoundException("submission not found");
    if (sub.status !== "pending") {
      throw new BadRequestException(
        `submission already ${sub.status} - cannot reject`
      );
    }
    const updated = await this.submissions.markReviewed({
      id: sub.id,
      status: "rejected",
      reviewed_by_user_id: input.adminUserId,
      review_note: input.note,
      subscription_id: null,
    });
    if (!updated) {
      throw new BadRequestException(
        "submission was processed concurrently - please refresh"
      );
    }
    return updated;
  }
}
