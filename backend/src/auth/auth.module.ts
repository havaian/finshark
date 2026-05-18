import { forwardRef, Module } from "@nestjs/common";
import { UsersModule } from "../users/users.module";
import { WhitelistModule } from "../whitelist/whitelist.module";
import { TotpModule } from "../totp/totp.module";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { RefreshTokensRepository } from "./refresh-tokens.repository";
import { JwtAuthGuard } from "./guards/jwt-auth.guard";
import { AdminGuard } from "./guards/admin.guard";

@Module({
  // forwardRef on WhitelistModule because WhitelistModule also imports
  // AuthModule (for the admin guards used by its controller).
  // forwardRef on TotpModule because TotpModule imports AuthModule too
  // (TotpService calls AuthService.issueTokensForUser after 2FA verify).
  imports: [
    UsersModule,
    forwardRef(() => WhitelistModule),
    forwardRef(() => TotpModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, RefreshTokensRepository, JwtAuthGuard, AdminGuard],
  exports: [AuthService, JwtAuthGuard, AdminGuard],
})
export class AuthModule {}
