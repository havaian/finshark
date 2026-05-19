import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  UseGuards,
} from "@nestjs/common";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminWith2faGuard } from "../auth/guards/admin-with-2fa.guard";
import { UiTranslationsService } from "./ui-translations.service";
import { UpsertUiTranslationDto } from "./dto/ui-translation.dto";
import type { Lang } from "./content.types";

@Controller("admin/ui-translations")
@UseGuards(JwtAuthGuard, AdminWith2faGuard)
export class AdminUiTranslationsController {
  constructor(private readonly service: UiTranslationsService) {}

  // GET /api/admin/ui-translations
  @Get()
  list() {
    return this.service.list();
  }

  // POST /api/admin/ui-translations  { key, lang, value }
  // Upsert — same endpoint for create + update; keeps the admin UI simple.
  @Post()
  @HttpCode(HttpStatus.OK)
  upsert(@Body() dto: UpsertUiTranslationDto) {
    return this.service.upsert(dto);
  }

  // DELETE /api/admin/ui-translations/:lang/:key
  // Note: key comes second because lang is a closed set; routes are nicer that way.
  @Delete(":lang/:key")
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(
    @Param("lang") lang: string,
    @Param("key") key: string
  ): Promise<void> {
    await this.service.delete(key, lang as Lang);
  }
}
