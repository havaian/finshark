import { Inject, Injectable } from '@nestjs/common';
import type { Sql } from 'postgres';
import { PG } from '../db/db.module';
import type { Lang } from './content.types';

export interface UiTranslationRow {
  key: string;
  lang: Lang;
  value: string;
  created_at: Date;
  updated_at: Date;
}

const COLS = `key, lang, value, created_at, updated_at`;

@Injectable()
export class UiTranslationsRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  // List ALL overrides. Used by admin UI to see/edit everything in one place.
  async findAll(): Promise<UiTranslationRow[]> {
    return this.sql<UiTranslationRow[]>`
      SELECT ${this.sql.unsafe(COLS)}
      FROM ui_translations
      ORDER BY key ASC, lang ASC
    `;
  }

  // List overrides for one language. Used by the frontend bootstrap to merge
  // over the static locale file. Returned as {key → value} for cheap merging.
  async findByLang(lang: Lang): Promise<Record<string, string>> {
    const rows = await this.sql<Array<{ key: string; value: string }>>`
      SELECT key, value FROM ui_translations WHERE lang = ${lang}
    `;
    const map: Record<string, string> = {};
    for (const r of rows) map[r.key] = r.value;
    return map;
  }

  async findOne(key: string, lang: Lang): Promise<UiTranslationRow | null> {
    const rows = await this.sql<UiTranslationRow[]>`
      SELECT ${this.sql.unsafe(COLS)}
      FROM ui_translations
      WHERE key = ${key} AND lang = ${lang}
      LIMIT 1
    `;
    return rows[0] ?? null;
  }

  // Upsert by (key, lang). updated_at is bumped by the trigger.
  async upsert(input: {
    key: string;
    lang: Lang;
    value: string;
  }): Promise<UiTranslationRow> {
    const rows = await this.sql<UiTranslationRow[]>`
      INSERT INTO ui_translations (key, lang, value)
      VALUES (${input.key}, ${input.lang}, ${input.value})
      ON CONFLICT (key, lang) DO UPDATE SET
        value = EXCLUDED.value
      RETURNING ${this.sql.unsafe(COLS)}
    `;
    return rows[0];
  }

  async delete(key: string, lang: Lang): Promise<boolean> {
    const rows = await this.sql`
      DELETE FROM ui_translations
      WHERE key = ${key} AND lang = ${lang}
      RETURNING key
    `;
    return rows.length > 0;
  }
}
