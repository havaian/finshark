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
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  ValidateIf,
} from "class-validator";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { AdminWith2faGuard } from "../auth/guards/admin-with-2fa.guard";
import { EmailTemplatesRepository } from "./email-templates.repository";
import { EmailTemplatesService } from "./email-templates.service";
import { toPublicEmailTemplate } from "./email-templates.types";

// Admin CRUD over email_templates + a "send test" endpoint so admins can
// pre-flight copy changes against their own inbox before turning the
// template on for real users.
//
// Mounted under /api/admin/email-templates alongside the other admin
// surfaces. Stays inside email/ rather than billing/ because the templates
// are used by anything that sends mail — reminders, billing notifications,
// future PSP receipts — not billing-specific.

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

@Controller("admin/email-templates")
@UseGuards(JwtAuthGuard, AdminWith2faGuard)
export class AdminEmailTemplatesController {
  constructor(
    private readonly repo: EmailTemplatesRepository,
    private readonly templates: EmailTemplatesService
  ) {}

  @Get()
  async list() {
    const rows = await this.repo.findAll();
    return rows.map(toPublicEmailTemplate);
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
    // templates can't be tested — the admin should enable, test, and
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
        `template "${key}" is inactive — enable it to send a test`
      );
    }
    return {
      ok: true,
      rendered_subject: rendered.subject,
      rendered_body: rendered.body,
      resolved_lang: rendered.lang,
    };
  }
}
