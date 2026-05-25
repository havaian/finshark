import { Global, Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/users.module";
import { AdminEmailTemplatesController } from "./admin-email-templates.controller";
import { EmailService } from "./email.service";
import { EmailTemplatesRepository } from "./email-templates.repository";
import { EmailTemplatesService } from "./email-templates.service";

// Global so other modules (the reminder cron, billing notifications) can
// inject EmailService and EmailTemplatesService directly without importing
// EmailModule into every consumer.
//
// Imports:
//   - AuthModule: guards on the admin controller.
//   - UsersModule: AdminWith2faGuard depends on UsersRepository, same
//     pattern as BillingModule + AdminUsersModule. Without it Nest fails
//     to construct the guard at startup (the same DI crash class as the
//     earlier BillingModule one).
@Global()
@Module({
  imports: [AuthModule, UsersModule],
  controllers: [AdminEmailTemplatesController],
  providers: [EmailService, EmailTemplatesRepository, EmailTemplatesService],
  exports: [EmailService, EmailTemplatesService],
})
export class EmailModule {}
