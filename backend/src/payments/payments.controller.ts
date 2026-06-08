import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { IsOptional, IsString, Length } from "class-validator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AccessTokenPayload } from "../auth/auth.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { PaymentsService } from "./payments.service";
import { MAX_SLIP_BYTES } from "./payment-storage.service";

// Multipart body fields that accompany the uploaded slip. The file itself is
// handled by FileInterceptor, not validated by this DTO.
class CreateSubmissionDto {
  @IsString()
  @Length(1, 64)
  plan_id!: string;

  // Optional: which displayed card the user transferred to. Omit if there's a
  // single card and the distinction doesn't matter.
  @IsOptional()
  @IsString()
  @Length(1, 64)
  card_id?: string;
}

// User-facing P2P payment endpoints. All require auth (a logged-in user buying
// premium). Card numbers returned here are the operator's own receiving cards.
@Controller("billing/payments")
@UseGuards(JwtAuthGuard)
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  // Active receiving cards for the transfer + copy-to-clipboard UI.
  @Get("cards")
  async cards() {
    return this.payments.listActiveCards();
  }

  // Purchasable plans (active premium plans with a price) for the picker. Prices
  // reflect the latest admin edits.
  @Get("plans")
  async plans() {
    return this.payments.listPurchasablePlans();
  }

  // Submit a payment: multipart form with `slip` (the file) + plan_id [+ card_id].
  // memoryStorage keeps the file in a Buffer so PaymentStorageService can
  // validate type/size before committing it to disk. The multer fileSize limit
  // is a hard cap enforced before our code runs (defence in depth with the
  // service-level check).
  @Post("submissions")
  @UseInterceptors(
    FileInterceptor("slip", {
      limits: { fileSize: MAX_SLIP_BYTES, files: 1 },
    })
  )
  async submit(
    @CurrentUser() user: AccessTokenPayload,
    @UploadedFile() slip: Express.Multer.File | undefined,
    @Body() body: CreateSubmissionDto
  ) {
    if (!slip) {
      throw new BadRequestException("payment slip file is required");
    }
    return this.payments.createSubmission({
      userId: user.sub,
      planId: body.plan_id,
      cardId: body.card_id ?? null,
      slip,
    });
  }

  // The current user's own submissions (status + history).
  @Get("submissions/mine")
  async mine(@CurrentUser() user: AccessTokenPayload) {
    return this.payments.listMySubmissions(user.sub);
  }
}
