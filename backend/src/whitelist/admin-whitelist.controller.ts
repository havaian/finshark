import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { IsOptional, IsString, MaxLength } from "class-validator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminWith2faGuard } from "../auth/guards/admin-with-2fa.guard";
import { CurrentUser } from "../auth/decorators/current-user.decorator";
import type { AccessTokenPayload } from "../auth/auth.service";
import { WhitelistService } from "./whitelist.service";

class AddPatternDto {
  @IsString()
  @MaxLength(254) // RFC 5321 SMTP maximum
  pattern!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

class UpdateNoteDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

// Admin-only CRUD over the email whitelist.
// Mounted under /api/admin/whitelist alongside other admin endpoints.
@Controller("admin/whitelist")
@UseGuards(JwtAuthGuard, AdminWith2faGuard)
export class AdminWhitelistController {
  constructor(private readonly whitelist: WhitelistService) {}

  // Whether the gate is actually enforced. The admin UI uses this to hide the
  // whole page when sign-up is open: a list that has no effect on who can log
  // in is worse than no list, because it looks like it is doing something.
  //
  // Deliberately NOT behind the enforcement flag itself - the page needs to
  // ask even when the answer is "off".
  @Get("status")
  status(): { enforced: boolean } {
    return { enforced: this.whitelist.isEnforced };
  }

  @Get()
  list() {
    return this.whitelist.list();
  }

  @Post()
  add(@Body() dto: AddPatternDto, @CurrentUser() current: AccessTokenPayload) {
    return this.whitelist.add({
      pattern: dto.pattern,
      note: dto.note ?? null,
      created_by_user_id: current.sub,
    });
  }

  @Patch(":id/note")
  updateNote(@Param("id") id: string, @Body() dto: UpdateNoteDto) {
    return this.whitelist.updateNote(id, dto.note ?? null);
  }

  @Delete(":id")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("id") id: string): Promise<void> {
    await this.whitelist.remove(id);
  }
}
