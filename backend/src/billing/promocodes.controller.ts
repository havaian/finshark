import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from "@nestjs/common";
import { IsString, Length } from "class-validator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AccessTokenPayload } from "../auth/auth.service";
import { PromocodesService } from "./promocodes.service";
import {
  toPublicPromocode,
  toPublicSubscription,
} from "./billing.types";

// User-facing promocode redemption. Bound to /me/promocodes/redeem to mirror
// the rest of the per-user surface area under /me. We deliberately do NOT
// expose any other promocode endpoints to non-admins — users can only
// redeem; listing / status checks happen via /me/entitlement after a
// successful redemption.
class RedeemDto {
  // 3..64 mirrors the DB CHECK on promocodes.code. Trim + lowercase happens
  // inside the service via normalisePromocode(), so we don't enforce case here.
  @IsString()
  @Length(3, 64)
  code!: string;
}

@Controller("me/promocodes")
@UseGuards(JwtAuthGuard)
export class PromocodesController {
  constructor(private readonly promocodes: PromocodesService) {}

  @Post("redeem")
  @HttpCode(HttpStatus.OK)
  async redeem(
    @CurrentUser() current: AccessTokenPayload,
    @Body() dto: RedeemDto
  ) {
    const result = await this.promocodes.redeem({
      userId: current.sub,
      rawCode: dto.code,
    });
    return {
      // Frontend uses isNewSubscription to decide between "Welcome to premium!"
      // and "Premium extended by N days" toasts.
      is_new_subscription: result.isNewSubscription,
      promocode: toPublicPromocode(result.promocode),
      subscription: toPublicSubscription(result.subscription),
    };
  }
}
