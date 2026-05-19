import { forwardRef, Module } from "@nestjs/common";
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/users.module";
import { WhitelistRepository } from "./whitelist.repository";
import { WhitelistService } from "./whitelist.service";
import { AdminWhitelistController } from "./admin-whitelist.controller";

// Whitelist module — exports the service so AuthModule can consume it in the
// Google callback flow. AuthModule + UsersModule are imported for the guard
// chain (JwtAuthGuard + AdminWith2faGuard) used by the admin controller.
//
// Circular: AuthModule needs WhitelistService (to gate sign-in) and
// WhitelistModule needs AuthModule (for guards on the admin controller).
// Broken with forwardRef on both sides — NestJS resolves it at runtime.
@Module({
  imports: [forwardRef(() => AuthModule), UsersModule],
  providers: [WhitelistRepository, WhitelistService],
  controllers: [AdminWhitelistController],
  exports: [WhitelistService],
})
export class WhitelistModule {}
