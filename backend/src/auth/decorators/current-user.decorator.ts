import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { RequestWithUser } from "../guards/jwt-auth.guard";
import type { AccessTokenPayload } from "../auth.service";

// Usage: getMe(@CurrentUser() user: AccessTokenPayload)
// Must be used on a route guarded by JwtAuthGuard.
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AccessTokenPayload => {
    const req = ctx.switchToHttp().getRequest<RequestWithUser>();
    return req.user;
  }
);
