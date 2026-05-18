import { forwardRef, Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { WhitelistModule } from '../whitelist/whitelist.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RefreshTokensRepository } from './refresh-tokens.repository';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AdminGuard } from './guards/admin.guard';

@Module({
  // forwardRef on WhitelistModule because WhitelistModule also imports
  // AuthModule (for the admin guards used by its controller).
  imports: [UsersModule, forwardRef(() => WhitelistModule)],
  controllers: [AuthController],
  providers: [AuthService, RefreshTokensRepository, JwtAuthGuard, AdminGuard],
  exports: [AuthService, JwtAuthGuard, AdminGuard],
})
export class AuthModule {}
