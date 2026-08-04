import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  UseGuards,
} from "@nestjs/common";
import { IsBoolean, IsOptional, IsString, Length, Matches } from "class-validator";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import type { AccessTokenPayload } from "../../auth/auth.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { ClickCardService } from "./click-card.service";
import { toPublicCardToken, type PublicCardToken } from "./click.types";

// The browser is expected to call Click's card_token/request DIRECTLY - it is
// the one Click endpoint that takes no Auth header, specifically so the card
// number never reaches a merchant server - and then post the resulting token
// here with /cards/adopt.
//
// /cards/request is the fallback for when that direct call is blocked by CORS.
// It is the only place in this codebase that ever sees a card number, it holds
// it in a request-scoped variable, and it must never log, store or echo it.
class RequestBindingDto {
  // Exactly 16 digits, no spaces. Uzcard (8600...) and Humo (9860...) are both
  // 16, and card_token/request only issues tokens for those schemes - the
  // earlier 16-19 range was a generic PAN rule that let a mistyped number
  // reach Click for no reason. Shape only; Click does the real validation.
  @IsString()
  @Matches(/^[0-9]{16}$/, { message: "card_number must be 16 digits" })
  card_number!: string;

  @IsString()
  @Matches(/^[0-9]{4}$/, { message: "expire_date must be MMYY" })
  expire_date!: string;
}

class AdoptBindingDto {
  @IsString()
  @Length(1, 128)
  card_token!: string;

  @IsOptional()
  @IsString()
  @Length(1, 32)
  phone_masked?: string;
}

class VerifyBindingDto {
  @IsString()
  @Length(1, 64)
  token_id!: string;

  @IsString()
  @Matches(/^[0-9]{4,8}$/, { message: "sms_code must be 4-8 digits" })
  sms_code!: string;
}

class SubscribeDto {
  @IsString()
  @Length(1, 64)
  plan_id!: string;
}

class AutoRenewDto {
  @IsBoolean()
  enabled!: boolean;
}

@Controller("billing/click/cards")
@UseGuards(JwtAuthGuard)
export class ClickCardsController {
  constructor(private readonly cards: ClickCardService) {}

  // The user's saved card, or null. Never includes the token itself.
  @Get()
  async mine(
    @CurrentUser() user: AccessTokenPayload
  ): Promise<PublicCardToken | null> {
    const row = await this.cards.getSavedCard(user.sub);
    return row ? toPublicCardToken(row) : null;
  }

  // Fallback binding path - see the note at the top of this file.
  @Post("request")
  async request(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: RequestBindingDto
  ): Promise<{ token_id: string; phone_masked: string | null }> {
    return this.cards.requestBinding({
      userId: user.sub,
      cardNumber: dto.card_number,
      expireDate: dto.expire_date,
    });
  }

  // Preferred binding path: the browser already got a token from Click.
  @Post("adopt")
  async adopt(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: AdoptBindingDto
  ): Promise<{ token_id: string; phone_masked: string | null }> {
    return this.cards.adoptBinding({
      userId: user.sub,
      cardToken: dto.card_token,
      phoneMasked: dto.phone_masked ?? null,
    });
  }

  @Post("verify")
  async verify(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: VerifyBindingDto
  ): Promise<PublicCardToken> {
    const row = await this.cards.verifyBinding({
      userId: user.sub,
      tokenId: dto.token_id,
      smsCode: dto.sms_code,
    });
    return toPublicCardToken(row);
  }

  // Unbind. Also switches auto-renew off, since a renewal with no card would
  // fail forever.
  @Delete()
  async remove(@CurrentUser() user: AccessTokenPayload): Promise<{ ok: true }> {
    await this.cards.removeCard(user.sub);
    return { ok: true };
  }

  // Start a subscription: charges the saved card now and comes back with
  // auto-renew already on. The subscription itself appears when Click's
  // callbacks land, same as any other payment.
  @Post("subscribe")
  async subscribe(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: SubscribeDto
  ): Promise<{ order_id: string; merchant_trans_id: string }> {
    return this.cards.subscribeNow({ userId: user.sub, planId: dto.plan_id });
  }

  @Post("auto-renew")
  async autoRenew(
    @CurrentUser() user: AccessTokenPayload,
    @Body() dto: AutoRenewDto
  ): Promise<{ ok: true }> {
    await this.cards.setAutoRenew({ userId: user.sub, enabled: dto.enabled });
    return { ok: true };
  }
}
