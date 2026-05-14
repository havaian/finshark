import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { ProfileController } from './profile.controller';
import { ProfileStatsRepository } from './profile-stats.repository';
import { ProfileStatsService } from './profile-stats.service';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [ProfileController],
  providers: [ProfileStatsRepository, ProfileStatsService],
})
export class ProfileModule {}
