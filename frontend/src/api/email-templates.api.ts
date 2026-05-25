import { api } from "./client";

// Mirrors backend src/email/email-templates.types.ts PublicEmailTemplate.
export interface EmailTemplate {
  key: string;
  subject_en: string;
  subject_ru: string | null;
  body_en: string;
  body_ru: string | null;
  html_en: string | null;
  html_ru: string | null;
  variables: string[];
  is_active: boolean;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpsertEmailTemplateInput {
  key: string;
  subject_en: string;
  subject_ru?: string | null;
  body_en: string;
  body_ru?: string | null;
  html_en?: string | null;
  html_ru?: string | null;
  variables: string[];
  is_active?: boolean;
  notes?: string | null;
}

export interface SendTestInput {
  to: string;
  lang?: "en" | "ru";
  variables?: Record<string, string | number>;
}

export interface SendTestResult {
  ok: true;
  rendered_subject: string;
  rendered_body: string;
  resolved_lang: "en" | "ru";
}

// All endpoints below require an authenticated admin. The user's totp_secret
// must be set (AdminWith2faGuard) — non-2FA admins are bounced to the
// enrollment wizard by the router guard before they get here.
export const emailTemplatesApi = {
  list: async (): Promise<EmailTemplate[]> =>
    (await api.get<EmailTemplate[]>("/admin/email-templates")).data,

  getOne: async (key: string): Promise<EmailTemplate> =>
    (await api.get<EmailTemplate>(`/admin/email-templates/${encodeURIComponent(key)}`))
      .data,

  upsert: async (input: UpsertEmailTemplateInput): Promise<EmailTemplate> =>
    (await api.post<EmailTemplate>("/admin/email-templates", input)).data,

  setActive: async (key: string, is_active: boolean): Promise<EmailTemplate> =>
    (
      await api.patch<EmailTemplate>(
        `/admin/email-templates/${encodeURIComponent(key)}/active`,
        { is_active }
      )
    ).data,

  remove: async (key: string): Promise<void> => {
    await api.delete(`/admin/email-templates/${encodeURIComponent(key)}`);
  },

  // Render + send one test email through the normal EmailService (so
  // EMAIL_MODE=log produces a console line; mode=smtp ships a real email).
  // Returns the rendered subject/body so the admin sees what was sent.
  sendTest: async (
    key: string,
    input: SendTestInput
  ): Promise<SendTestResult> =>
    (
      await api.post<SendTestResult>(
        `/admin/email-templates/${encodeURIComponent(key)}/send-test`,
        input
      )
    ).data,
};
