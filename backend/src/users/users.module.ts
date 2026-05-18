import { Module } from "@nestjs/common";
import { UsersRepository } from "./users.repository";
import { AdminBootstrapService } from "./admin-bootstrap.service";

// AdminBootstrapService runs once on boot. It only needs UsersRepository
// (no auth-side deps), so it lives here. The admin users controller lives in
// its own module (admin-users.module) to avoid the circular dep that would
// come from UsersModule → AuthModule (AuthModule already imports UsersModule).
@Module({
  providers: [UsersRepository, AdminBootstrapService],
  exports: [UsersRepository],
})
export class UsersModule {}
