import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { UsersModule } from '../users/users.module';
import { RemindersService } from './reminders.service';
import { RemindersController } from './reminders.controller';
import { ReminderEmailsSentRepository } from './reminder-emails-sent.repository';
import { UnsubscribeTokens } from './unsubscribe.tokens';

@Module({
  imports: [AuthModule, UsersModule],
  controllers: [RemindersController],
  providers: [RemindersService, ReminderEmailsSentRepository, UnsubscribeTokens],
})
export class RemindersModule {}
