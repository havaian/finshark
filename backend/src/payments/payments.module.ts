import { Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { BillingModule } from "../billing/billing.module";
import { UsersModule } from "../users/users.module";
import { AdminPaymentsController } from "./admin-payments.controller";
import { PaymentCardsAdminService } from "./payment-cards-admin.service";
import { PaymentCardsRepository } from "./payment-cards.repository";
import { PaymentStorageService } from "./payment-storage.service";
import { PaymentSubmissionsRepository } from "./payment-submissions.repository";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";

// PaymentsModule - the P2P (card-transfer) payment flow: admin-managed
// receiving cards + user-submitted transfer slips reviewed manually by an
// admin. Approval delegates to SubscriptionsService.grant (from BillingModule)
// so the subscription lifecycle, audit log, and premium-welcome email are all
// reused unchanged.
//
// Imports:
//   - BillingModule: provides SubscriptionsService (approval -> grant) and
//     PlansRepository (price/plan lookup at submission time). Both are exported
//     by BillingModule.
//   - AuthModule + UsersModule: the controllers use JwtAuthGuard and
//     AdminWith2faGuard; the latter depends on UsersRepository, so UsersModule
//     must be imported here for the guard to construct in this injector context
//     (same pairing as BillingModule / AdminUsersModule / WhitelistModule).
@Module({
  imports: [AuthModule, UsersModule, BillingModule],
  controllers: [PaymentsController, AdminPaymentsController],
  providers: [
    PaymentCardsRepository,
    PaymentSubmissionsRepository,
    PaymentStorageService,
    PaymentsService,
    PaymentCardsAdminService,
  ],
  exports: [PaymentsService],
})
export class PaymentsModule {}
