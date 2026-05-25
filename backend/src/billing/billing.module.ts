import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { AdminPromocodesController } from "./admin-promocodes.controller";
import { AdminSubscriptionsController } from "./admin-subscriptions.controller";
import { EntitlementsService } from "./entitlements.service";
import { ManualProvider } from "./payment-providers/manual.provider";
import { PlansRepository } from "./plans.repository";
import { PromocodesController } from "./promocodes.controller";
import { PromocodesRepository } from "./promocodes.repository";
import { PromocodesService } from "./promocodes.service";
import { SubscriptionEventsRepository } from "./subscription-events.repository";
import { SubscriptionsRepository } from "./subscriptions.repository";
import { SubscriptionsService } from "./subscriptions.service";

// BillingModule — owns plans / subscriptions / promocodes + the controllers
// that expose them.
//   - PromocodesController: user-facing redeem endpoint under /api/me.
//   - AdminPromocodesController: list/create/disable/redemptions under /api/admin.
//   - AdminSubscriptionsController: grant/extend/cancel/revoke + per-user
//     history + audit-event reads under /api/admin.
//
// PSP integration (Payme/Click) will live in payment-providers/ and add its
// own webhook controller; it'll import BillingModule rather than living
// inside it.
@Module({
  imports: [AuthModule],
  controllers: [
    PromocodesController,
    AdminPromocodesController,
    AdminSubscriptionsController,
  ],
  providers: [
    PlansRepository,
    SubscriptionsRepository,
    SubscriptionEventsRepository,
    PromocodesRepository,
    EntitlementsService,
    SubscriptionsService,
    PromocodesService,
    ManualProvider,
  ],
  exports: [
    EntitlementsService,
    SubscriptionsService,
    PromocodesService,
    PlansRepository,
    SubscriptionsRepository,
    PromocodesRepository,
    SubscriptionEventsRepository,
    ManualProvider,
  ],
})
export class BillingModule {}
