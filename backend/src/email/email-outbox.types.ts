// Mirrors backend/migrations/20260805000001_email_outbox.js. Keep in sync.

import type { EmailLang } from "./email-templates.service";

export type EmailOutboxStatus = "pending" | "sent" | "failed";

export interface EmailOutboxRow {
  id: string;
  template_key: string;
  to_email: string;
  lang: EmailLang;
  variables: Record<string, string | number>;
  status: EmailOutboxStatus;
  attempts: number;
  last_error: string | null;
  next_attempt_at: Date;
  sent_at: Date | null;
  context: string | null;
  created_at: Date;
  updated_at: Date;
}

// Public shape for admin endpoints (ISO dates).
export interface PublicEmailOutboxEntry {
  id: string;
  template_key: string;
  to_email: string;
  lang: EmailLang;
  status: EmailOutboxStatus;
  attempts: number;
  last_error: string | null;
  next_attempt_at: string;
  sent_at: string | null;
  context: string | null;
  created_at: string;
}

export function toPublicEmailOutboxEntry(
  row: EmailOutboxRow
): PublicEmailOutboxEntry {
  return {
    id: row.id,
    template_key: row.template_key,
    to_email: row.to_email,
    lang: row.lang,
    status: row.status,
    attempts: row.attempts,
    last_error: row.last_error,
    next_attempt_at: row.next_attempt_at.toISOString(),
    sent_at: row.sent_at === null ? null : row.sent_at.toISOString(),
    context: row.context,
    created_at: row.created_at.toISOString(),
  };
}
