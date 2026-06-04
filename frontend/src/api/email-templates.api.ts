import { api } from "./client";

// Mirrors backend src/email/email-templates.types.ts PublicEmailTemplate.
export interface EmailTemplate {
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

export interface UpsertEmailTemplateInput {
  key: string;
  subject_en: string;
  subject_ru?: string | null;
  subject_uz?: string | null;
  body_en: string;
  body_ru?: string | null;
  body_uz?: string | null;
  html_en?: string | null;
  html_ru?: string | null;
  html_uz?: string | null;
  variables: string[];
  is_active?: boolean;
  notes?: string | null;
}

export interface SendTestInput {
  to: string;
  lang?: "en" | "ru" | "uz";
  variables?: Record<string, string | number>;
}

export interface SendTestResult {
  ok: true;
  rendered_subject: string;
  rendered_body: string;
  resolved_lang: "en" | "ru" | "uz";
}

export type BlastAudience =
  | "all"
  | "premium"
  | "free"
  | "reminders_enabled"
  | "ids";

export interface BlastInput {
  audience: BlastAudience;
  user_ids?: string[];
  lang?: "en" | "ru" | "uz";
  extra_variables?: Record<string, string | number>;
  ignore_opt_out?: boolean;
  max_recipients?: number;
}

export interface BlastResult {
  recipients_targeted: number;
  sent: number;
  skipped_opt_out: number;
  failed: number;
  sample_recipients: string[];
}

// One entry in the variable catalogue (GET /variables). desc_key is an i18n
// key the editor localises; sample is what the preview shows when no real
// user is selected.
export interface EmailVariableDef {
  key: string;
  desc_key: string;
  sample: string | number;
}

export interface PreviewInput {
  lang?: "en" | "ru" | "uz";
  // When set, the preview resolves this user's real variable values.
  user_id?: string;
  extra_variables?: Record<string, string | number>;
}

export interface PreviewResult {
  ok: true;
  rendered_subject: string;
  rendered_body: string;
  resolved_lang: "en" | "ru" | "uz";
  // The actual variable values that were substituted - so the editor can show
  // the admin what each {{var}} resolved to.
  resolved_variables: Record<string, string | number>;
}

// All endpoints below require an authenticated admin. The user's totp_secret
// must be set (AdminWith2faGuard) - non-2FA admins are bounced to the
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

  // Mass-send to a filtered audience. Personalised variables (display_name,
  // streak, unsubscribe_url, etc.) are injected per-recipient by the backend;
  // `extra_variables` is merged on top for campaign-specific overrides.
  blast: async (key: string, input: BlastInput): Promise<BlastResult> =>
    (
      await api.post<BlastResult>(
        `/admin/email-templates/${encodeURIComponent(key)}/blast`,
        input
      )
    ).data,

  // The variable catalogue - which {{placeholders}} are available, with i18n
  // description keys and sample values. Drives the editor's insert-palette.
  listVariables: async (): Promise<EmailVariableDef[]> =>
    (
      await api.get<{ variables: EmailVariableDef[] }>(
        "/admin/email-templates/variables"
      )
    ).data.variables,

  // Dry-run render (no send). With a user_id, variables resolve from that real
  // user; otherwise catalogue samples are used. Returns the rendered subject/
  // body plus the resolved variable values.
  preview: async (key: string, input: PreviewInput): Promise<PreviewResult> =>
    (
      await api.post<PreviewResult>(
        `/admin/email-templates/${encodeURIComponent(key)}/preview`,
        input
      )
    ).data,
};
