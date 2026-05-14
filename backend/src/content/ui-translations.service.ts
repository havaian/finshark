import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  SUPPORTED_LANGS,
  type Lang,
} from './content.types';
import {
  UiTranslationsRepository,
  type UiTranslationRow,
} from './ui-translations.repository';

@Injectable()
export class UiTranslationsService {
  constructor(private readonly repo: UiTranslationsRepository) {}

  // Admin: full list, both languages, every key.
  list(): Promise<UiTranslationRow[]> {
    return this.repo.findAll();
  }

  // Public: { key → value } for one language. Cheap fetch on frontend boot.
  byLang(lang: Lang): Promise<Record<string, string>> {
    return this.repo.findByLang(lang);
  }

  // Admin: upsert a single (key, lang, value) row.
  // Key validation: must be non-empty and look like a dotted identifier
  // (e.g. "dashboard.start_lesson"). We allow letters, digits, underscore, dot, hyphen.
  async upsert(input: {
    key: string;
    lang: Lang;
    value: string;
  }): Promise<UiTranslationRow> {
    if (!(SUPPORTED_LANGS as readonly string[]).includes(input.lang)) {
      throw new BadRequestException(`unsupported lang "${input.lang}"`);
    }
    const key = input.key.trim();
    if (!key) throw new BadRequestException('key is required');
    if (!/^[A-Za-z0-9_.\-]+$/.test(key)) {
      throw new BadRequestException(
        'key may only contain letters, digits, underscore, dot, hyphen',
      );
    }
    if (key.length > 200) {
      throw new BadRequestException('key is too long (max 200 chars)');
    }
    if (typeof input.value !== 'string') {
      throw new BadRequestException('value must be a string');
    }
    if (input.value.length > 10_000) {
      throw new BadRequestException('value is too long (max 10000 chars)');
    }

    return this.repo.upsert({ key, lang: input.lang, value: input.value });
  }

  // Admin: delete a row (reverts to the static locale-file default on the frontend).
  async delete(key: string, lang: Lang): Promise<void> {
    if (!(SUPPORTED_LANGS as readonly string[]).includes(lang)) {
      throw new BadRequestException(`unsupported lang "${lang}"`);
    }
    const ok = await this.repo.delete(key, lang);
    if (!ok) throw new NotFoundException('translation override not found');
  }
}
