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
//   @UseGuards(JwtAuthGuard, AdminGuard)
//
// We re-read the user from DB each time so revoking admin takes effect immediately,
// rather than waiting for the access token to expire. Cheap query, single-row PK lookup.
@Injectable()
export class AdminGuard implements CanActivate {
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
    return true;
  }
}
