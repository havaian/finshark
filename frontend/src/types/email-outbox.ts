// Mirrors backend/src/email/email-outbox.types.ts (PublicEmailOutboxEntry).

export type EmailOutboxStatus = 'pending' | 'sent' | 'failed';

export interface EmailOutboxEntry {
  id: string;
  template_key: string;
  to_email: string;
  lang: string;
  status: EmailOutboxStatus;
  attempts: number;
  last_error: string | null;
  next_attempt_at: string;
  sent_at: string | null;
  context: string | null;
  created_at: string;
}

export interface EmailOutboxStats {
  pending: number;
  sent: number;
  failed: number;
}
