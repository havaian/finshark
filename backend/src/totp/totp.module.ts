import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { TotpController } from './totp.controller';
import { TotpService } from './totp.service';
import { TotpRepository } from './totp.repository';

// Two-way dependency with AuthModule:
//   AuthService needs TotpService.requiresTwoFactor + mintPending2faToken
//     during the Google callback.
//   TotpService needs AuthService.issueTokensForUser during /auth/2fa-verify.
// forwardRef on both sides resolves the cycle. Same pattern Whitelist uses.
@Module({
  imports: [UsersModule, forwardRef(() => AuthModule)],
  controllers: [TotpController],
  providers: [TotpService, TotpRepository],
  exports: [TotpService],
})
export class TotpModule {}
