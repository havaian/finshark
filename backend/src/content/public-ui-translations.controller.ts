import {
  BadRequestException,
  Controller,
  Get,
  Param,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { UiTranslationsService } from './ui-translations.service';
import { SUPPORTED_LANGS, type Lang } from './content.types';

// Public endpoint — no auth, since UI strings are by definition public.
// Frontend calls this once on boot to merge DB overrides onto the static locale.
// Heavier throttle than default (read-once-per-page-load pattern; small payload).
@Controller('ui-translations')
export class PublicUiTranslationsController {
  constructor(private readonly service: UiTranslationsService) {}

  // GET /api/ui-translations/:lang → { "dashboard.welcome": "Привет", ... }
  @Get(':lang')
  @Throttle({ default: { ttl: 60_000, limit: 120 } })
  async byLang(@Param('lang') lang: string): Promise<Record<string, string>> {
    if (!(SUPPORTED_LANGS as readonly string[]).includes(lang)) {
      throw new BadRequestException(`unsupported lang "${lang}"`);
    }
    return this.service.byLang(lang as Lang);
  }
}
