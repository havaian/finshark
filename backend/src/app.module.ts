import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DbModule } from './db/db.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AdminUsersModule } from './users/admin-users.module';
import { ContentModule } from './content/content.module';
import { LessonsModule } from './lessons/lessons.module';
import { LlmModule } from './llm/llm.module';
import { ProgressModule } from './progress/progress.module';
import { ProfileModule } from './profile/profile.module';
import { EmailModule } from './email/email.module';
import { RemindersModule } from './reminders/reminders.module';
import { OnboardingModule } from './onboarding/onboarding.module';
import { LeaderboardsModule } from './leaderboards/leaderboards.module';
import { BadgesModule } from './badges/badges.module';
import { MocksModule } from './mocks/mocks.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    ScheduleModule.forRoot(),
    // Default: 60 requests per 60 seconds per IP. Tight limits applied per-route
    // via @Throttle on /auth/google and /auth/google/callback.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    DbModule,
    UsersModule,
    AuthModule,
    AdminUsersModule,
    ContentModule,
    LlmModule,
    LessonsModule,
    ProgressModule,
    ProfileModule,
    EmailModule,
    RemindersModule,
    OnboardingModule,
    LeaderboardsModule,
    BadgesModule,
    MocksModule,
  ],
  providers: [
    // Throttle every controller by default; specific endpoints can override or skip.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
