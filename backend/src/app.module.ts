import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { DbModule } from './db/db.module';
import { AuthModule } from './auth/auth.module';
import { ContentModule } from './content/content.module';
import { LessonsModule } from './lessons/lessons.module';
import { LlmModule } from './llm/llm.module';
import { ProgressModule } from './progress/progress.module';
import { EmailModule } from './email/email.module';
import { RemindersModule } from './reminders/reminders.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    ScheduleModule.forRoot(),
    // Default: 60 requests per 60 seconds per IP. Tight limits applied per-route
    // via @Throttle on /auth/login and /auth/register below.
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
    DbModule,
    AuthModule,
    ContentModule,
    LlmModule,
    LessonsModule,
    ProgressModule,
    EmailModule,
    RemindersModule,
  ],
  providers: [
    // Throttle every controller by default; specific endpoints can override or skip.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
