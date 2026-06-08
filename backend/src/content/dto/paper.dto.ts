import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  Max,
  ValidateIf,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

// Section of an exam_structure as submitted by an admin. Mirrors the
// ExamSection shape in content.types. Validated structurally here, then again
// by validateExamStructure() in the service before persisting (which enforces
// the ot/mtq marks rules and unique section codes that class-validator can't
// express cross-field as cleanly).
export class ExamSectionDto {
  @IsString()
  @Length(1, 16)
  code!: string;

  // "ot" | "mtq" - kept as a plain string here; validateExamStructure rejects
  // anything other than those two values.
  @IsString()
  kind!: string;

  @IsInt()
  @Min(1)
  question_count!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  marks_each?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  marks_total?: number;
}

export class ExamStructureDto {
  @IsInt()
  @Min(1)
  duration_seconds!: number;

  @IsNumber()
  @Min(0)
  @Max(100)
  pass_mark_pct!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExamSectionDto)
  sections!: ExamSectionDto[];
}

export class CreatePaperDto {
  @IsString()
  @Length(1, 16)
  code!: string;

  @IsString()
  @Length(1, 200)
  name_en!: string;

  // Russian translation is optional. Allow explicit null (clears it) or undefined (skip).
  // ValidateIf skips validation when the value is null so we don't fail @IsString on null.
  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @Length(1, 200)
  name_ru?: string | null;

  // Free-tier access flag. Default true on create (matches DB default); admins
  // toggle this on the paper edit screen to gate a paper behind premium.
  @IsOptional()
  @IsBoolean()
  free_accessible?: boolean;

  // Which program this paper belongs to, by program code (e.g. 'acca', 'cfa').
  // Optional: defaults to 'acca' in the service so existing admin flows that
  // don't send it keep producing ACCA papers. program_id is NOT NULL in the
  // DB, so the service resolves this code to an id before insert.
  @IsOptional()
  @IsString()
  @Length(1, 32)
  program_code?: string;

  // The paper's mock definition. Optional: defaults to the ACCA Applied
  // Knowledge structure (120 min, one 35-question OT section, 2 marks each,
  // 50% pass) in the service when omitted, so creating a typical F-paper needs
  // no extra input. exam_structure is NOT NULL in the DB.
  @IsOptional()
  @ValidateNested()
  @Type(() => ExamStructureDto)
  exam_structure?: ExamStructureDto;
}

export class UpdatePaperDto {
  @IsOptional()
  @IsString()
  @Length(1, 16)
  code?: string;

  @IsOptional()
  @IsString()
  @Length(1, 200)
  name_en?: string;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @Length(1, 200)
  name_ru?: string | null;

  // Toggle free-tier access. Free users only see papers where this is true;
  // they also can't start lessons / mocks against locked papers.
  @IsOptional()
  @IsBoolean()
  free_accessible?: boolean;

  // Move the paper to a different program by code. Omit to leave unchanged.
  @IsOptional()
  @IsString()
  @Length(1, 32)
  program_code?: string;

  // Replace the paper's mock definition. Omit to leave unchanged. When present
  // it fully replaces the stored structure (no partial section merge).
  @IsOptional()
  @ValidateNested()
  @Type(() => ExamStructureDto)
  exam_structure?: ExamStructureDto;
}
