import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import {
  ArrayMaxSize,
  ArrayUnique,
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from "class-validator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminWith2faGuard } from "../auth/guards/admin-with-2fa.guard";
import { EmailTemplatesRepository } from "./email-templates.repository";
import { EmailTemplatesService } from "./email-templates.service";
import {
  EmailBlastService,
  EMAIL_VARIABLE_CATALOGUE,
  type BlastAudience,
} from "./email-blast.service";
import { toPublicEmailTemplate } from "./email-templates.types";

// Admin CRUD over email_templates + a "send test" endpoint so admins can
// pre-flight copy changes against their own inbox before turning the
// template on for real users.
//
// Mounted under /api/admin/email-templates alongside the other admin
// surfaces. Stays inside email/ rather than billing/ because the templates
// are used by anything that sends mail - reminders, billing notifications,
// future PSP receipts - not billing-specific.

class UpsertEmailTemplateDto {
  // Stable slug. We accept letters/digits/underscores; anything else makes
  // the key annoying to reference from code. Length kept generous so admins
  // can use multi-word slugs ('reminder_weekly_digest', etc.).
  @IsString()
  @Length(3, 64)
  key!: string;

  @IsString()
  @MaxLength(200)
  subject_en!: string;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @MaxLength(200)
  subject_ru?: string | null;

  @IsString()
  @MaxLength(20000)
  body_en!: string;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @MaxLength(20000)
  body_ru?: string | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @MaxLength(50000)
  html_en?: string | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @MaxLength(50000)
  html_ru?: string | null;

  // Variable name allowlist for the admin form. Each entry should match
  // the {{var}} placeholder used in the bodies. Bounded so a misclick
  // doesn't insert 10k variables.
  @IsArray()
  @ArrayMaxSize(64)
  @IsString({ each: true })
  variables!: string[];

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @MaxLength(2000)
  notes?: string | null;
}

class SetActiveDto {
  @IsBoolean()
  is_active!: boolean;
}

// Dry-run preview. Renders the template WITHOUT sending. If user_id is given,
// the template variables are resolved from that real user (so the admin sees
// exactly what that recipient gets); otherwise the catalogue sample values are
// used. extra_variables override either source.
class PreviewDto {
  @IsOptional()
  @IsIn(["en", "ru"])
  lang?: "en" | "ru";

  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsOptional()
  @IsObject()
  extra_variables?: Record<string, string | number>;
}

class SendTestDto {
  @IsEmail()
  to!: string;

  @IsOptional()
  @IsIn(["en", "ru"])
  lang?: "en" | "ru";

  // Optional variable map for the test. Keys are the variable names; values
  // are stringified. The render path leaves unsupplied placeholders intact
  // so the test preview shows the admin which vars they still need.
  @IsOptional()
  variables?: Record<string, string | number>;
}

const BLAST_AUDIENCES: BlastAudience[] = [
  "all",
  "premium",
  "free",
  "reminders_enabled",
  "ids",
];

class BlastDto {
  @IsIn(BLAST_AUDIENCES)
  audience!: BlastAudience;

  // Required when audience='ids'. Bounded so a paste-bomb doesn't cause the
  // service to allocate huge arrays.
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(5000)
  @ArrayUnique()
  @IsUUID("all", { each: true })
  user_ids?: string[];

  @IsOptional()
  @IsIn(["en", "ru"])
  lang?: "en" | "ru";

  // Admin-supplied extras merged on top of per-user vars. Keys constrained
  // by EmailBlastService - invalid keys are simply ignored at render time.
  @IsOptional()
  @IsObject()
  extra_variables?: Record<string, string | number>;

  // Reserved for legally-required transactional emails (account close,
  // billing receipts). Default false - most blasts respect opt-out.
  @IsOptional()
  @IsBoolean()
  ignore_opt_out?: boolean;

  // Safety cap per call. Backend has its own conservative default; this
  // lets ops raise it for a known-large legitimate blast.
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50000)
  max_recipients?: number;
}

@Controller("admin/email-templates")
@UseGuards(JwtAuthGuard, AdminWith2faGuard)
export class AdminEmailTemplatesController {
  constructor(
    private readonly repo: EmailTemplatesRepository,
    private readonly templates: EmailTemplatesService,
    private readonly blast: EmailBlastService
  ) {}

  @Get()
  async list() {
    const rows = await this.repo.findAll();
    return rows.map(toPublicEmailTemplate);
  }

  // The variable catalogue: which {{placeholders}} templates may use, each with
  // an i18n description key and a sample value. The editor renders this as an
  // insert-palette. Static (no DB) - declared as a route so the frontend has a
  // single source of truth that always matches what the blast/preview resolve.
  // Must be declared BEFORE the ":key" route or "variables" would be captured
  // as a template key.
  @Get("variables")
  listVariables() {
    return { variables: EMAIL_VARIABLE_CATALOGUE };
  }

  @Get(":key")
  async getOne(@Param("key") key: string) {
    const row = await this.repo.findByKey(key);
    if (!row) throw new NotFoundException("template not found");
    return toPublicEmailTemplate(row);
  }

  // Upsert. Creates a new template OR replaces the body of an existing one.
  // Returns the saved row so the admin form can refresh its state.
  @Post()
  @HttpCode(HttpStatus.OK)
  async upsert(@Body() dto: UpsertEmailTemplateDto) {
    const row = await this.repo.upsert({
      key: dto.key,
      subject_en: dto.subject_en,
      subject_ru: dto.subject_ru ?? null,
      body_en: dto.body_en,
      body_ru: dto.body_ru ?? null,
      html_en: dto.html_en ?? null,
      html_ru: dto.html_ru ?? null,
      variables: dto.variables,
      is_active: dto.is_active ?? true,
      notes: dto.notes ?? null,
    });
    return toPublicEmailTemplate(row);
  }

  // Toggle active flag without touching content. Distinct from delete so
  // admins can pause a template's traffic without losing the body.
  @Patch(":key/active")
  async setActive(@Param("key") key: string, @Body() dto: SetActiveDto) {
    const row = await this.repo.setActive(key, dto.is_active);
    if (!row) throw new NotFoundException("template not found");
    return toPublicEmailTemplate(row);
  }

  @Delete(":key")
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param("key") key: string): Promise<void> {
    const ok = await this.repo.deleteByKey(key);
    if (!ok) throw new NotFoundException("template not found");
  }

  // Send a one-off test rendering of this template. Useful for QAing copy
  // changes before flipping the template on. The send goes through the
  // normal EmailService (so EMAIL_MODE=log produces a console line, mode=smtp
  // ships a real email). Returns the rendered subject/body so the admin
  // can see what was sent without checking their inbox.
  @Post(":key/send-test")
  @HttpCode(HttpStatus.OK)
  async sendTest(@Param("key") key: string, @Body() dto: SendTestDto) {
    const lang = dto.lang ?? "en";
    const variables = dto.variables ?? {};
    // We call sendByTemplate which honours is_active=true. Inactive
    // templates can't be tested - the admin should enable, test, and
    // disable if they want to dry-run a paused one. Keeps the active flag
    // a clean kill-switch with no side channel.
    const rendered = await this.templates.render(key, lang, variables);
    const sent = await this.templates.sendByTemplate({
      templateKey: key,
      to: dto.to,
      lang,
      variables,
    });
    if (!sent) {
      throw new NotFoundException(
        `template "${key}" is inactive - enable it to send a test`
      );
    }
    return {
      ok: true,
      rendered_subject: rendered.subject,
      rendered_body: rendered.body,
      resolved_lang: rendered.lang,
    };
  }

  // Dry-run preview. Renders the template (active OR draft) with a chosen
  // user's real variables - or catalogue samples when no user is given - and
  // returns the result WITHOUT sending anything. This is what the admin uses
  // to see "what would Alex actually receive" before hitting send. Distinct
  // from send-test, which really delivers.
  @Post(":key/preview")
  @HttpCode(HttpStatus.OK)
  async preview(@Param("key") key: string, @Body() dto: PreviewDto) {
    const lang = dto.lang ?? "en";
    const variables = await this.blast.previewVariables({
      user_id: dto.user_id,
      extra_variables: dto.extra_variables,
    });
    const rendered = await this.templates.renderPreview(key, lang, variables);
    return {
      ok: true,
      rendered_subject: rendered.subject,
      rendered_body: rendered.body,
      resolved_lang: rendered.lang,
      // Echo the resolved variables so the editor can show the admin exactly
      // which values were substituted (useful when previewing a real user).
      resolved_variables: variables,
    };
  }

  // Mass-send this template to an audience filter ('all', 'premium',
  // 'free', 'reminders_enabled', or a list of user_ids). Renders each
  // recipient with their personalised variables (display_name, streak,
  // unsubscribe_url, etc.) and sends through the standard EmailService.
  // The blast is synchronous within the request - for very large lists
  // the throttle stretches the response time, but the result payload
  // gives the admin a clear sent/failed/skipped breakdown.
  @Post(":key/blast")
  @HttpCode(HttpStatus.OK)
  async sendBlast(@Param("key") key: string, @Body() dto: BlastDto) {
    return this.blast.run({
      templateKey: key,
      audience: dto.audience,
      user_ids: dto.user_ids,
      lang: dto.lang,
      extra_variables: dto.extra_variables,
      ignore_opt_out: dto.ignore_opt_out,
      max_recipients: dto.max_recipients,
    });
  }
}
