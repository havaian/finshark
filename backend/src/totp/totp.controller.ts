import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  UseGuards,
} from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { IsString, MinLength, MaxLength } from "class-validator";
import type { Request } from "express";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AccessTokenPayload } from "../auth/auth.service";
import { TotpService } from "./totp.service";

// DTOs are tiny enough to keep in-file. Split to a dto/ subfolder if we
// add more.
class SetupVerifyDto {
  @IsString()
  @MinLength(16) // base32 secret is 32 chars typically; min sanity check
  @MaxLength(128)
  secret_b32!: string;

  @IsString()
  @MinLength(6)
  @MaxLength(10) // 6 digits + a couple of trim chars tolerance
  code!: string;
}

class CodeDto {
  @IsString()
  @MinLength(6)
  @MaxLength(40) // TOTP (6) or recovery code (up to ~30 with dashes)
  code!: string;
}

// Pulls req.ip from express. Falls back to null if trust-proxy isn't
// configured and ip ends up undefined - the audit row tolerates null.
function extractIp(req: Request): string | null {
  return (req.ip ?? null) || null;
}

// Mounted at /me/2fa. Every route here requires (1) a logged-in user
// (JwtAuthGuard) AND (2) admin status (AdminGuard) - non-admins should
// never see this surface in the first place, but the guard backs it up.
@Controller("me/2fa")
@UseGuards(JwtAuthGuard, AdminGuard)
export class TotpController {
  constructor(private readonly totp: TotpService) {}

  // GET /api/me/2fa - read-only status. Cheap; Settings hits this on mount.
  @Get()
  status(@CurrentUser() current: AccessTokenPayload) {
    return this.totp.status(current.sub);
  }

  // GET /api/me/2fa/remaining-codes - count of unused recovery codes.
  // Surfaced in Settings so admins know when to regenerate.
  @Get("remaining-codes")
  async remainingCodes(@CurrentUser() current: AccessTokenPayload) {
    return {
      remaining: await this.totp.getRemainingRecoveryCodes(current.sub),
    };
  }

  // GET /api/me/2fa/audit - recent audit events for the current user. Useful
  // for "show me when 2FA changed on my account" forensics. Most recent
  // first; capped server-side to a sane page size.
  @Get("audit")
  audit(@CurrentUser() current: AccessTokenPayload) {
    return this.totp.getAuditLog(current.sub);
  }

  // POST /api/me/2fa/setup-begin - return QR + secret. No state change.
  // Throttled because rapid repeats just generate throwaway secrets - but
  // also no legitimate flow needs more than a couple of calls.
  @Post("setup-begin")
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  setupBegin(@CurrentUser() current: AccessTokenPayload) {
    return this.totp.setupBegin(current.sub);
  }

  // POST /api/me/2fa/setup-verify - finalises enrollment. Returns recovery
  // codes ONCE. The frontend MUST display them; we never re-emit them.
  @Post("setup-verify")
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  setupVerify(
    @CurrentUser() current: AccessTokenPayload,
    @Body() dto: SetupVerifyDto,
    @Req() req: Request
  ) {
    return this.totp.setupVerify({
      user_id: current.sub,
      secret_b32: dto.secret_b32,
      code: dto.code,
      ip: extractIp(req),
    });
  }

  // POST /api/me/2fa/regenerate-codes - invalidate the old recovery code
  // batch and return a fresh set. Same proof-of-possession check as disable.
  // Surfaced ONCE; frontend must require the "I saved them" confirmation
  // again, identical to first-time enrollment.
  @Post("regenerate-codes")
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  regenerate(
    @CurrentUser() current: AccessTokenPayload,
    @Body() dto: CodeDto,
    @Req() req: Request
  ) {
    return this.totp.regenerateRecoveryCodes({
      user_id: current.sub,
      code: dto.code,
      ip: extractIp(req),
    });
  }

  // DELETE /api/me/2fa - disable. Requires a current TOTP or recovery code
  // as proof of possession so a hijacked session can't strip the factor.
  @Delete()
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { ttl: 60_000, limit: 10 } })
  disable(
    @CurrentUser() current: AccessTokenPayload,
    @Body() dto: CodeDto,
    @Req() req: Request
  ) {
    return this.totp.disable({
      user_id: current.sub,
      code: dto.code,
      ip: extractIp(req),
    });
  }
}
