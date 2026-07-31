import { Module } from "@nestjs/common";
import { AuthModule } from "../../auth/auth.module";
import { UsersModule } from "../../users/users.module";
import { BillingModule } from "../billing.module";
import { ClickProvider } from "../payment-providers/click.provider";
import { AdminClickController } from "./admin-click.controller";
import { ClickCallbackController } from "./click-callback.controller";
import { ClickCallbackLogRepository } from "./click-callback-log.repository";
import { ClickConfig } from "./click.config";
import { ClickController } from "./click.controller";
import { ClickFiscalService } from "./click-fiscal.service";
import { ClickMerchantClient } from "./click-merchant.client";
import { ClickOrderExpiryService } from "./click-order-expiry.service";
import { ClickOrdersRepository } from "./click-orders.repository";
import { ClickService } from "./click.service";

// ClickModule - the click.uz payment integration.
//
// Sits outside BillingModule and imports it, matching the note in
// provider.interface.ts: PSP integrations live alongside the billing core and
// depend on it, never the other way round. BillingModule keeps owning plans,
// subscriptions, promocodes and the audit log; this module owns orders,
// callbacks and fiscalization, and reaches into BillingModule only through
// SubscriptionsService.grant / PlansRepository / SubscriptionsRepository.
//
// Controller split:
//   ClickController         - session-authed, user-facing (create order, poll)
//   ClickCallbackController - UNAUTHENTICATED, signature-verified (Click's servers)
//   AdminClickController    - admin + elevated 2FA (orders, callback log, fiscal)
//
// Imports:
//   - BillingModule: SubscriptionsService, PlansRepository, SubscriptionsRepository
//   - AuthModule + UsersModule: JwtAuthGuard and AdminWith2faGuard are
//     constructed in THIS injector context when our controllers declare
//     @UseGuards, so their dependencies must resolve here. AdminWith2faGuard
//     needs UsersRepository, hence UsersModule - the same pairing every other
//     admin-bearing module uses. Dropping it produces the
//     UnknownDependenciesException described in billing.module.ts.
@Module({
  imports: [AuthModule, UsersModule, BillingModule],
  controllers: [ClickController, ClickCallbackController, AdminClickController],
  providers: [
    ClickOrderExpiryService,
    ClickConfig,
    ClickOrdersRepository,
    ClickCallbackLogRepository,
    ClickMerchantClient,
    ClickFiscalService,
    ClickService,
    ClickProvider,
  ],
  exports: [ClickConfig, ClickService, ClickProvider],
})
export class ClickModule {}
