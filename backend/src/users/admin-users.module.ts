import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from './users.module';
import { AdminUsersController } from './admin-users.controller';

// Same pattern as ContentModule: imports both AuthModule (for guards) and
// UsersModule (for the repo). Kept separate from UsersModule so the latter
// stays a clean leaf and AuthModule can keep importing UsersModule.
@Module({
  imports: [AuthModule, UsersModule],
  controllers: [AdminUsersController],
})
export class AdminUsersModule {}
