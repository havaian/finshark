import { Inject, Injectable } from "@nestjs/common";
import type postgres from "postgres";
import type { Sql } from "postgres";
import { PG } from "../db/db.module";
import type { EmailTemplateRow } from "./email-templates.types";

const COLS = `
  key, subject_en, subject_ru, subject_uz,
  body_en, body_ru, body_uz,
  html_en, html_ru, html_uz,
  variables, is_active, notes, created_at, updated_at
`;

@Injectable()
export class EmailTemplatesRepository {
  constructor(@Inject(PG) private readonly sql: Sql) {}

  // Admin: full list, ordered by key for stable display. Includes inactive
  // templates so admins can see what's been retired.
  async findAll(): Promise<EmailTemplateRow[]> {
    return this.sql<EmailTemplateRow[]>`
      SELECT ${this.sql.unsafe(COLS)}
      FROM email_templates
      ORDER BY key ASC
    `;
  }

  // Hot path: render-and-send looks up by key. Returns null when the key
  // doesn't exist OR the template is inactive - callers fall back to a
  // hard-coded default in that case, so a deleted/disabled template can't
  // block a critical email.
  async findActiveByKey(key: string): Promise<EmailTemplateRow | null> {
    const rows = await this.sql<EmailTemplateRow[]>`
      SELECT ${this.sql.unsafe(COLS)}
      FROM email_templates
      WHERE key = ${key} AND is_active = TRUE
      LIMIT 1
    `;
    return rows[0] ?? null;
  }

  // Admin: lookup including inactive. Used by the edit form.
  async findByKey(key: string): Promise<EmailTemplateRow | null> {
    const rows = await this.sql<EmailTemplateRow[]>`
      SELECT ${this.sql.unsafe(COLS)}
      FROM email_templates
      WHERE key = ${key}
      LIMIT 1
    `;
    return rows[0] ?? null;
  }

  // Upsert by key. Used by both create + update on the admin endpoint
  // (PATCH-style - admin re-submits the full template body). Returns the
  // new row. Variables array is stored as jsonb.
  async upsert(input: {
    key: string;
    subject_en: string;
    subject_ru: string | null;
    subject_uz: string | null;
    body_en: string;
    body_ru: string | null;
    body_uz: string | null;
    html_en: string | null;
    html_ru: string | null;
    html_uz: string | null;
    variables: string[];
    is_active: boolean;
    notes: string | null;
  }): Promise<EmailTemplateRow> {
    const rows = await this.sql<EmailTemplateRow[]>`
      INSERT INTO email_templates (
        key, subject_en, subject_ru, subject_uz,
        body_en, body_ru, body_uz,
        html_en, html_ru, html_uz,
        variables, is_active, notes
      )
      VALUES (
        ${input.key},
        ${input.subject_en}, ${input.subject_ru}, ${input.subject_uz},
        ${input.body_en}, ${input.body_ru}, ${input.body_uz},
        ${input.html_en}, ${input.html_ru}, ${input.html_uz},
        ${this.sql.json(input.variables as unknown as postgres.JSONValue)},
        ${input.is_active},
        ${input.notes}
      )
      ON CONFLICT (key) DO UPDATE SET
        subject_en = EXCLUDED.subject_en,
        subject_ru = EXCLUDED.subject_ru,
        subject_uz = EXCLUDED.subject_uz,
        body_en    = EXCLUDED.body_en,
        body_ru    = EXCLUDED.body_ru,
        body_uz    = EXCLUDED.body_uz,
        html_en    = EXCLUDED.html_en,
        html_ru    = EXCLUDED.html_ru,
        html_uz    = EXCLUDED.html_uz,
        variables  = EXCLUDED.variables,
        is_active  = EXCLUDED.is_active,
        notes      = EXCLUDED.notes
      RETURNING ${this.sql.unsafe(COLS)}
    `;
    return rows[0];
  }

  // Toggle active flag without touching content. Used by the admin "disable"
  // button when an admin wants to stop sending without losing the copy.
  async setActive(
    key: string,
    isActive: boolean
  ): Promise<EmailTemplateRow | null> {
    const rows = await this.sql<EmailTemplateRow[]>`
      UPDATE email_templates SET is_active = ${isActive}
      WHERE key = ${key}
      RETURNING ${this.sql.unsafe(COLS)}
    `;
    return rows[0] ?? null;
  }

  // Hard delete. Distinct from setActive(false) - used only when an admin
  // wants the key gone (e.g. a templating mistake). Doesn't cascade to any
  // log table because we don't track email history.
  async deleteByKey(key: string): Promise<boolean> {
    const rows = await this.sql`
      DELETE FROM email_templates WHERE key = ${key} RETURNING key
    `;
    return rows.length > 0;
  }
}
