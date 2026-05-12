import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AccessTokenPayload } from '../auth/auth.service';
import { UsersRepository } from '../users/users.repository';
import { UnsubscribeTokens } from './unsubscribe.tokens';
import { RemindersService } from './reminders.service';
import { toPublicUser } from '../users/user.types';

@Controller()
export class RemindersController {
  constructor(
    private readonly users: UsersRepository,
    private readonly tokens: UnsubscribeTokens,
    private readonly reminders: RemindersService,
  ) {}

  // PUBLIC — no auth, single token URL. Idempotent.
  // GET /api/unsubscribe?token=...
  @Get('unsubscribe')
  async unsubscribe(@Query('token') token: string): Promise<{ ok: boolean; message: string }> {
    if (!token) return { ok: false, message: 'missing token' };
    const userId = this.tokens.verify(token);
    if (!userId) return { ok: false, message: 'invalid or expired token' };

    const updated = await this.users.setEmailReminders(userId, false);
    if (!updated) return { ok: false, message: 'user not found' };
    return { ok: true, message: 'reminder emails disabled' };
  }

  // AUTHED — flip own preference from the app's UI.
  // POST /api/me/email-reminders  { enabled: true|false }
  @Post('me/email-reminders')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async setMyPref(
    @CurrentUser() user: AccessTokenPayload,
    @Body() body: { enabled: boolean },
  ) {
    const updated = await this.users.setEmailReminders(user.sub, !!body.enabled);
    if (!updated) return { ok: false };
    return { ok: true, user: toPublicUser(updated) };
  }

  // ADMIN — run the cron manually. Lets you verify the pipeline end-to-end
  // without waiting for the scheduled time.
  // POST /api/admin/reminders/run
  @Post('admin/reminders/run')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  async runNow() {
    return this.reminders.runOnce();
  }
}
