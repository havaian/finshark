import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { SUPPORTED_LANGS, type Lang } from "./content.types";
import { UiTranslationsFileStore } from "./ui-translations.file-store";

// Shape returned to the admin UI. Matches the old DB-backed row shape minus
// created_at / updated_at (files don't carry per-key timestamps). The admin
// page already ignored those columns; removing them is a non-breaking change.
export interface UiTranslationRow {
  key: string;
  lang: Lang;
  value: string;
}

@Injectable()
export class UiTranslationsService {
  constructor(private readonly store: UiTranslationsFileStore) {}

  // Admin: full list, both languages, every overridden key.
  list(): Promise<UiTranslationRow[]> {
    return this.store.findAll();
  }

  // Public: { key → value } for one language. Cheap fetch on frontend boot.
  byLang(lang: Lang): Promise<Record<string, string>> {
    return this.store.findByLang(lang);
  }

  // Admin: upsert a single (key, lang, value) row.
  // Key validation: must be non-empty and look like a dotted identifier
  // (e.g. "dashboard.start_lesson"). Letters, digits, underscore, dot, hyphen.
  async upsert(input: {
    key: string;
    lang: Lang;
    value: string;
  }): Promise<UiTranslationRow> {
    if (!(SUPPORTED_LANGS as readonly string[]).includes(input.lang)) {
      throw new BadRequestException(`unsupported lang "${input.lang}"`);
    }
    const key = input.key.trim();
    if (!key) throw new BadRequestException("key is required");
    if (!/^[A-Za-z0-9_.\-]+$/.test(key)) {
      throw new BadRequestException(
        "key may only contain letters, digits, underscore, dot, hyphen"
      );
    }
    if (key.length > 200) {
      throw new BadRequestException("key is too long (max 200 chars)");
    }
    if (typeof input.value !== "string") {
      throw new BadRequestException("value must be a string");
    }
    if (input.value.length > 10_000) {
      throw new BadRequestException("value is too long (max 10000 chars)");
    }

    return this.store.upsert({ key, lang: input.lang, value: input.value });
  }

  // Admin: delete a row (reverts to the static locale-file default on the frontend).
  async delete(key: string, lang: Lang): Promise<void> {
    if (!(SUPPORTED_LANGS as readonly string[]).includes(lang)) {
      throw new BadRequestException(`unsupported lang "${lang}"`);
    }
    const ok = await this.store.delete(key, lang);
    if (!ok) throw new NotFoundException("translation override not found");
  }
}
