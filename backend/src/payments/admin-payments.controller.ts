import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  StreamableFile,
  UseGuards,
} from "@nestjs/common";
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
} from "class-validator";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AccessTokenPayload } from "../auth/auth.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminWith2faGuard } from "../auth/guards/admin-with-2fa.guard";
import { PaymentCardsAdminService } from "./payment-cards-admin.service";
import { PaymentsService } from "./payments.service";
import type { PaymentSubmissionStatus } from "./payment.types";

class CreateCardDto {
  @IsString()
  @Length(4, 64)
  card_number!: string;

  @IsString()
  @Length(1, 120)
  holder_name!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  bank_label?: string | null;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;
}

class UpdateCardDto {
  @IsOptional()
  @IsString()
  @Length(4, 64)
  card_number?: string;

  @IsOptional()
  @IsString()
  @Length(1, 120)
  holder_name?: string;

  // Nullable: pass null to clear the label, omit to leave unchanged.
  @IsOptional()
  @IsString()
  @MaxLength(120)
  bank_label?: string | null;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;
}

class ReviewDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

// Admin surface for the P2P flow: manage receiving cards and review submitted
// payment slips. Guarded identically to the other admin controllers
// (JWT + elevated 2FA session).
@Controller("admin/payments")
@UseGuards(JwtAuthGuard, AdminWith2faGuard)
export class AdminPaymentsController {
  constructor(
    private readonly cards: PaymentCardsAdminService,
    private readonly payments: PaymentsService
  ) {}

  // ── Cards CRUD ─────────────────────────────────────────────────────────────

  @Get("cards")
  async listCards() {
    return this.cards.list();
  }

  @Post("cards")
  async createCard(@Body() body: CreateCardDto) {
    return this.cards.create({
      card_number: body.card_number.trim(),
      holder_name: body.holder_name.trim(),
      bank_label: body.bank_label?.trim() ? body.bank_label.trim() : null,
      is_active: body.is_active ?? true,
      sort_order: body.sort_order ?? 0,
    });
  }

  @Patch("cards/:id")
  async updateCard(@Param("id") id: string, @Body() body: UpdateCardDto) {
    // Pass through only the keys the client actually sent. bank_label is
    // special: presence in the patch (even as null) means "set it", so we
    // forward it whenever the key was provided.
    const patch: {
      card_number?: string;
      holder_name?: string;
      bank_label?: string | null;
      is_active?: boolean;
      sort_order?: number;
    } = {};
    if (body.card_number !== undefined) patch.card_number = body.card_number.trim();
    if (body.holder_name !== undefined) patch.holder_name = body.holder_name.trim();
    if ("bank_label" in body) {
      patch.bank_label = body.bank_label?.trim() ? body.bank_label.trim() : null;
    }
    if (body.is_active !== undefined) patch.is_active = body.is_active;
    if (body.sort_order !== undefined) patch.sort_order = body.sort_order;
    return this.cards.update(id, patch);
  }

  @Delete("cards/:id")
  async deleteCard(@Param("id") id: string) {
    return this.cards.remove(id);
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
