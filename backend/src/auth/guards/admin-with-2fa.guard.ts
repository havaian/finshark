import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { UsersRepository } from "../../users/users.repository";
import type { RequestWithUser } from "./jwt-auth.guard";

// Use after JwtAuthGuard:
//   @UseGuards(JwtAuthGuard, AdminWith2faGuard)
//
// Same as AdminGuard but also requires that the admin has 2FA enrolled
// (totp_secret !== null). For admins without 2FA, returns a distinct
// 403 with code "2FA_SETUP_REQUIRED" so the frontend can route them to
// the enrollment wizard instead of showing a generic forbidden message.
//
// IMPORTANT: do NOT use this guard on the TOTP setup endpoints themselves
// (/me/2fa/*) - that would be a chicken-and-egg: the admin can't enroll
// because they're not enrolled. The TotpController stays on plain
// AdminGuard. Every OTHER admin-only controller should switch to this
// guard so admins are forced through enrollment before they can use
// admin features.
@Injectable()
export class AdminWith2faGuard implements CanActivate {
  constructor(private readonly users: UsersRepository) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<RequestWithUser>();
    if (!req.user?.sub) {
      throw new UnauthorizedException("not authenticated");
    }
    const user = await this.users.findById(req.user.sub);
    if (!user) {
      throw new UnauthorizedException("user no longer exists");
    }
    if (!user.is_admin) {
      throw new ForbiddenException("admin only");
    }
    // Distinct error so the frontend can branch on it rather than a
    // generic 403. The code string matches the literal in router/index.ts.
    if (!user.totp_secret) {
      throw new ForbiddenException({
        error: "2FA_SETUP_REQUIRED",
        message: "2FA enrollment is required before accessing admin features",
      });
    }
    return true;
  }
}
