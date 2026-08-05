import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { EmailService } from "./email.service";
import { EmailTemplatesRepository } from "./email-templates.repository";
import type { EmailTemplateRow } from "./email-templates.types";
import { ConfigService } from "@nestjs/config";

// What gets returned from render() - fully-substituted strings ready to
// hand to EmailService.send(). lang is the resolved language the caller
// requested (or the EN fallback if RU wasn't set on the template).
export interface RenderedEmail {
  subject: string;
  body: string;
  html: string | null;
  lang: EmailLang;
}

export interface SendByTemplateInput {
  templateKey: string;
  to: string;
  lang?: EmailLang; // defaults to 'en'
  variables: Record<string, string | number>;
  // Override the From: header. Defaults to EMAIL_FROM env var, which the
  // existing reminder path also uses.
  from?: string;
}

// Variable substitution: every {{var_name}} in the source string is
// replaced by the value at variables[var_name]. Names are `[a-z_][a-z0-9_]*`
// case-sensitive. Unknown placeholders are left intact (so a misnamed
// variable is visible in the rendered email rather than silently dropped).
//
// Why no recursive substitution: keeps the engine pin-flat. If you need
// `{{a}}` to expand to `{{b}}` then to `c`, do two passes in the caller.
// In practice nobody needs that for transactional copy.
const VAR_RE = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;

function substitute(
  source: string,
  variables: Record<string, string | number>
): string {
  return source.replace(VAR_RE, (match, name) => {
    if (Object.prototype.hasOwnProperty.call(variables, name)) {
      return String(variables[name]);
    }
    return match;
  });
}

// Languages an email can be sent in. Mirrors SUPPORTED_LANGS in
// content.types, but kept as its own alias: emails resolve per RECIPIENT
// preference (users.locale), not per HTTP request, so they don't go through
// the @Lang decorator.
export type EmailLang = "en" | "ru" | "uz";

// Pick the localised body. Falls back to _en when the requested language's
// column is null, mirroring the rest of the localisation surface area
// (paper name, LO title, badge name, etc.).
function pickLang(
  row: EmailTemplateRow,
  lang: EmailLang
): { subject: string; body: string; html: string | null; lang: EmailLang } {
  if (lang === "ru") {
    return {
      subject: row.subject_ru ?? row.subject_en,
      body: row.body_ru ?? row.body_en,
      html: row.html_ru ?? row.html_en,
      // Report the language we actually resolved to so callers (or the
      // admin "send test" log) can see whether the fallback fired.
      lang: row.body_ru === null ? "en" : "ru",
    };
  }
  if (lang === "uz") {
    return {
      subject: row.subject_uz ?? row.subject_en,
      body: row.body_uz ?? row.body_en,
      html: row.html_uz ?? row.html_en,
      lang: row.body_uz === null ? "en" : "uz",
    };
  }
  return {
    subject: row.subject_en,
    body: row.body_en,
    html: row.html_en,
    lang: "en",
  };
}

@Injectable()
export class EmailTemplatesService {
  private readonly log = new Logger(EmailTemplatesService.name);

  constructor(
    private readonly repo: EmailTemplatesRepository,
    private readonly emails: EmailService,
    private readonly config: ConfigService
  ) {}

  // Pure render - useful for tests, preview, and the admin "preview" tab
  // on the edit form. Throws BadRequestException when the key doesn't
  // exist OR the template is disabled. Senders go through sendByTemplate()
  // which handles missing templates by falling back to a caller-provided
  // default (so a deleted reminder template can't block the cron).
  async render(
    key: string,
    lang: EmailLang,
    variables: Record<string, string | number>
  ): Promise<RenderedEmail> {
    const row = await this.repo.findActiveByKey(key);
    if (!row) {
      throw new BadRequestException(
        `email template "${key}" not found or inactive`
      );
    }
    const picked = pickLang(row, lang);
    return {
      subject: substitute(picked.subject, variables),
      body: substitute(picked.body, variables),
      html: picked.html === null ? null : substitute(picked.html, variables),
      lang: picked.lang,
    };
  }

  // Like render() but resolves the template even when it is INACTIVE. Used by
  // the admin dry-run preview, where the point is to QA a draft before
  // enabling it - so the active flag must not gate it. Never sends. Throws
  // only when the key doesn't exist at all.
  async renderPreview(
    key: string,
    lang: EmailLang,
    variables: Record<string, string | number>
  ): Promise<RenderedEmail> {
    const row = await this.repo.findByKey(key);
    if (!row) {
      throw new BadRequestException(`email template "${key}" not found`);
    }
    const picked = pickLang(row, lang);
    return {
      subject: substitute(picked.subject, variables),
      body: substitute(picked.body, variables),
      html: picked.html === null ? null : substitute(picked.html, variables),
      lang: picked.lang,
    };
  }

  // Hot path. Renders + sends in one call. Returns boolean success so the
  // caller can decide whether to count the send or surface an error. Logs
  // are written via the underlying EmailService.
  //
  // Failure modes:
  //   - template missing/disabled → returns false (logged), email NOT sent
  //   - SMTP send fails           → rethrows so the caller can retry/skip
  //
  // We separate "template not available" from "send failed" because the
  // operational responses differ: the first is content-config; the
  // second is infra.
  async sendByTemplate(input: SendByTemplateInput): Promise<boolean> {
    const lang = input.lang ?? "en";
    const row = await this.repo.findActiveByKey(input.templateKey);
    if (!row) {
      this.log.warn(
        `template "${input.templateKey}" not available - caller should fall back`
      );
      return false;
    }
    const picked = pickLang(row, lang);
    const subject = substitute(picked.subject, input.variables);
    const text = substitute(picked.body, input.variables);
    const from =
      input.from ?? this.config.getOrThrow<string>("EMAIL_FROM");
    // html_* is optional per template. Where it is set the recipient gets the
    // styled version; where it is null the plain body goes out on its own,
    // which is what every template did before styling existed.
    const html =
      picked.html === null ? null : substitute(picked.html, input.variables);
    await this.emails.send({ to: input.to, from, subject, text, html });
    return true;
  }
}
