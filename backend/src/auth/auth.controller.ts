import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Post,
  Query,
  Req,
  Res,
  Body,
  UseGuards,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ConfigService } from '@nestjs/config';
import type { Request, Response } from 'express';
import { AuthService, type AccessTokenPayload } from './auth.service';
import { RefreshDto } from './dto/refresh.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { UsersRepository } from '../users/users.repository';
import { toPublicUser } from '../users/user.types';

// The cookie name we use to round-trip the OAuth state value. The cookie
// lives only between /auth/google and /auth/google/callback — a few seconds
// in normal use, up to STATE_TTL_MS in pathological cases.
const STATE_COOKIE = 'acca_duo_oauth_state';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UsersRepository,
    private readonly config: ConfigService,
  ) {}

  // GET /api/auth/google
  // Entry point. Redirects to Google's consent screen.
  @Get('google')
  // Mild throttling — a human only hits this when clicking the button.
  @Throttle({ default: { ttl: 60_000, limit: 20 } })
  startGoogle(@Res() res: Response): void {
    const { url, state } = this.auth.buildGoogleAuthUrl();

    // Cookie carries `state` back from the user's browser on the callback.
    // HttpOnly so it can't be read from JS. Secure when we're in production
    // (assumed if the public URL is https). SameSite=Lax so it survives the
    // cross-site redirect from accounts.google.com back to us.
    const isHttps = (this.config.get<string>('APP_PUBLIC_URL') ?? '').startsWith('https://');
    res.cookie(STATE_COOKIE, state, {
      httpOnly: true,
      secure: isHttps,
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000, // 10 minutes
      path: '/api/auth/google',
    });
    res.redirect(url);
  }

  // GET /api/auth/google/callback
  // Google redirects users here with ?code=...&state=...
  // We verify, mint our tokens, and redirect to the frontend callback page
  // with the tokens in the URL fragment (NOT the query string — fragments are
  // never sent to servers and stay out of access logs).
  @Get('google/callback')
  @Throttle({ default: { ttl: 60_000, limit: 30 } })
  async googleCallback(
    @Query('code') code: string | undefined,
    @Query('state') state: string | undefined,
    @Query('error') error: string | undefined,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    // Clear the state cookie regardless of outcome — single-use.
    res.clearCookie(STATE_COOKIE, { path: '/api/auth/google' });

    const frontend = this.config.getOrThrow<string>('APP_PUBLIC_URL');

    // Google returned an error (user denied consent, etc.).
    if (error) {
      const reason = encodeURIComponent(error);
      res.redirect(`${frontend}/auth/callback#error=${reason}`);
      return;
    }
    if (!code || !state) {
      res.redirect(`${frontend}/auth/callback#error=missing_params`);
      return;
    }

    // Cookies: parsed by Nest only if cookie-parser is registered. We're
    // reading from the raw header to keep dep surface small.
    const expectedState = this.readCookie(req, STATE_COOKIE);
    if (!expectedState) {
      res.redirect(`${frontend}/auth/callback#error=missing_state_cookie`);
      return;
    }

    try {
      const { tokens } = await this.auth.handleGoogleCallback({
        code,
        state,
        expectedState,
      });

      // Fragment, not query. The frontend's /auth/callback page reads them.
      const fragment = new URLSearchParams({
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
      }).toString();
      res.redirect(`${frontend}/auth/callback#${fragment}`);
    } catch (e) {
      const msg = (e as Error).message || 'auth_failed';
      res.redirect(`${frontend}/auth/callback#error=${encodeURIComponent(msg)}`);
    }
  }

  // Refresh / logout / me are unchanged from the password era.

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  refresh(@Body() dto: RefreshDto) {
    return this.auth.refresh(dto.refresh_token);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Body() dto: RefreshDto): Promise<{ ok: true }> {
    await this.auth.logout(dto.refresh_token);
    return { ok: true };
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() current: AccessTokenPayload) {
    const user = await this.users.findById(current.sub);
    if (!user) {
      // Token was valid but user no longer exists (deleted account, etc.)
      throw new NotFoundException('user not found');
    }
    return toPublicUser(user);
  }

  // Tiny cookie parser — avoids pulling in cookie-parser for one cookie.
  // Express headers are already lowercased in Node.
  private readCookie(req: Request, name: string): string | null {
    const raw = req.headers.cookie;
    if (!raw) return null;
    const pairs = raw.split(/;\s*/);
    for (const p of pairs) {
      const eq = p.indexOf('=');
      if (eq === -1) continue;
      if (p.slice(0, eq) === name) {
        return decodeURIComponent(p.slice(eq + 1));
      }
    }
    return null;
  }
}
