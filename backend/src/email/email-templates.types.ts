// Mirrors backend/migrations/20260525000009_email_templates.js. Keep in sync.

export interface EmailTemplateRow {
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
  // Array of variable names ({{var}}) the template accepts. Used by the
  // admin form to highlight missing/extra placeholders; substitution itself
  // is purely textual and ignores this list.
  variables: string[];
  is_active: boolean;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
}

// Public shape for admin endpoints (ISO dates).
export interface PublicEmailTemplate {
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
  created_at: string;
  updated_at: string;
}

export function toPublicEmailTemplate(
  row: EmailTemplateRow
): PublicEmailTemplate {
  return {
    key: row.key,
    subject_en: row.subject_en,
    subject_ru: row.subject_ru,
    subject_uz: row.subject_uz,
    body_en: row.body_en,
    body_ru: row.body_ru,
    body_uz: row.body_uz,
    html_en: row.html_en,
    html_ru: row.html_ru,
    html_uz: row.html_uz,
    variables: row.variables,
    is_active: row.is_active,
    notes: row.notes,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  };
}
