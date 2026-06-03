import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/users.module";
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

// BillingModule - owns plans / subscriptions / promocodes + the controllers
// that expose them.
//   - PromocodesController: user-facing redeem endpoint under /api/me.
//   - AdminPromocodesController: list/create/disable/redemptions under /api/admin.
//   - AdminSubscriptionsController: grant/extend/cancel/revoke + per-user
//     history + audit-event reads under /api/admin.
//
// PSP integration (Payme/Click) will live in payment-providers/ and add its
// own webhook controller; it'll import BillingModule rather than living
// inside it.
//
// Imports:
//   - AuthModule: provides JwtAuthGuard and AdminWith2faGuard. The guards are
//     instantiated in BillingModule's injector context when our controllers
//     declare @UseGuards(...), so their constructor deps must resolve here.
//   - UsersModule: AdminWith2faGuard depends on UsersRepository. Without this
//     import, Nest fails to construct the guard with UnknownDependenciesException
//     (the production crash that surfaced as "Nest can't resolve dependencies
//     of the AdminWith2faGuard"). Mirrors AdminUsersModule + WhitelistModule
//     which both pair AuthModule + UsersModule for the same reason.
@Module({
  imports: [AuthModule, UsersModule],
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
