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
import { AdminGuard } from "../auth/guards/admin.guard";
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
@UseGuards(JwtAuthGuard, AdminGuard)
export class AdminWhitelistController {
  constructor(private readonly whitelist: WhitelistService) {}

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
