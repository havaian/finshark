import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import type { Request } from "express";
import { AuthService, AccessTokenPayload } from "../auth.service";

// Augment Express Request type for type-safe req.user access.
export interface RequestWithUser extends Request {
  user: AccessTokenPayload;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly auth: AuthService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<RequestWithUser>();
    const header = req.headers["authorization"];

    if (!header || Array.isArray(header) || !header.startsWith("Bearer ")) {
      throw new UnauthorizedException("missing bearer token");
    }

    const token = header.slice("Bearer ".length).trim();
    if (!token) {
      throw new UnauthorizedException("empty bearer token");
    }

    req.user = this.auth.verifyAccessToken(token);
    return true;
  }
}
