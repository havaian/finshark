import { Body, Controller, Get, Param, Post, UseGuards } from "@nestjs/common";
import { IsString, Length } from "class-validator";
import { CurrentUser } from "../../auth/decorators/current-user.decorator";
import type { AccessTokenPayload } from "../../auth/auth.service";
import { JwtAuthGuard } from "../../auth/guards/jwt-auth.guard";
import { ClickConfig } from "./click.config";
import { ClickService } from "./click.service";

class CreateOrderDto {
  @IsString()
  @Length(1, 64)
  plan_id!: string;
}

// User-facing Click endpoints. Separate from ClickCallbackController because
// these are session-authenticated and those are signature-authenticated - the
// two must never share a guard configuration by accident.
@Controller("billing/click")
@UseGuards(JwtAuthGuard)
export class ClickController {
  constructor(
    private readonly click: ClickService,
    private readonly config: ClickConfig
  ) {}

  // Whether the payment UI should render at all, plus the checkout.js URL so
  // the frontend has no Click-specific build config of its own. Everything
  // Click-issued reaches the browser through the API.
  @Get("config")
  async config_(): Promise<{
    enabled: boolean;
    checkout_js_url: string;
  }> {
    return {
      enabled: this.config.isConfigured(),
      checkout_js_url: this.config.checkoutJsUrl,
    };
  }

  // Purchasable plans (active, premium, priced).
  @Get("plans")
  async plans() {
    return this.click.listPurchasablePlans();
  }

  // Start a payment. Creates the order and returns what both buttons need:
  // the my.click.uz redirect URL and the ids for the checkout.js overlay.
  // Grants nothing - that happens on Click's Complete callback.
  @Post("orders")
  async createOrder(
    @CurrentUser() user: AccessTokenPayload,
    @Body() body: CreateOrderDto
  ) {
    return this.click.createOrder({
      userId: user.sub,
      planId: body.plan_id,
    });
  }

  // Poll target for the return page. Scoped to the owner server-side.
  @Get("orders/:id")
  async getOrder(
    @CurrentUser() user: AccessTokenPayload,
    @Param("id") id: string
  ) {
    return this.click.getOwnOrder({ userId: user.sub, orderId: id });
  }

  // The user's own Click payment history, newest first.
  @Get("orders")
  async myOrders(@CurrentUser() user: AccessTokenPayload) {
    return this.click.listMyOrders(user.sub);
  }
}
