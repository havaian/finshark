import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Patch,
  UseGuards,
} from "@nestjs/common";
import { IsBoolean } from "class-validator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminGuard } from "../auth/guards/admin.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AccessTokenPayload } from "../auth/auth.service";
import { UsersRepository } from "./users.repository";
import { toPublicUser } from "./user.types";

class SetAdminDto {
  @IsBoolean()
  is_admin!: boolean;
}

// Admin-only: list all users + promote/demote admin.
// Mounted under /api/admin/users to sit alongside /api/admin/papers etc.
@Controller("admin/users")
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminUsersController {
  constructor(private readonly users: UsersRepository) {}

  @Get()
  async list() {
    const rows = await this.users.findAll();
    return rows.map(toPublicUser);
  }

  // PATCH /api/admin/users/:id/admin   { is_admin: boolean }
  // Guards:
  //   - 404 if user not found
  //   - 400 self-demote (would lock the current admin out)
  //   - 400 demoting the last remaining admin (would lock everyone out)
  @Patch(":id/admin")
  async setAdmin(
    @Param("id") id: string,
    @Body() dto: SetAdminDto,
    @CurrentUser() current: AccessTokenPayload
  ) {
    const target = await this.users.findById(id);
    if (!target) throw new NotFoundException("user not found");

    // No-op: nothing to do but still respond with the current shape.
    if (target.is_admin === dto.is_admin) {
      return toPublicUser(target);
    }

    // Demotion checks.
    if (dto.is_admin === false) {
      if (current.sub === id) {
        throw new ForbiddenException(
          "you cannot remove your own admin rights — ask another admin to do it"
        );
      }
      const adminCount = await this.users.countAdmins();
      if (adminCount <= 1) {
        throw new BadRequestException(
          "cannot demote the last remaining admin — promote someone else first"
        );
      }
    }

    const updated = await this.users.setAdmin(id, dto.is_admin);
    if (!updated) throw new NotFoundException("user not found after update");
    return toPublicUser(updated);
  }
}
