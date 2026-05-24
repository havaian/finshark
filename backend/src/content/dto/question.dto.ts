import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateIf,
  ValidateNested,
} from "class-validator";

// Question types. short_answer is RETIRED (see the Grading Spec): it had no
// faithful ACCA auto-marked exam format and caused the "correct answer marked
// wrong" grading bug. All legacy rows were converted to mcq/number_entry and
// the enum value is dropped by migration 20260524000002. Only deterministic,
// auto-markable formats remain.
export const QUESTION_TYPES = ["mcq", "number_entry"] as const;

// Alias kept for call sites that distinguished "creatable" types; now identical
// to QUESTION_TYPES since every supported type is creatable.
export const CREATABLE_QUESTION_TYPES = QUESTION_TYPES;
export const DIFFICULTIES = ["easy", "medium", "hard"] as const;

export class McqOptionDto {
  @IsString()
  @Length(1, 8)
  key!: string; // 'A' / 'B' / etc. We don't hard-code the set; admin decides.

  @IsString()
  @Length(1, 1000)
  text_en!: string;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @Length(1, 1000)
  text_ru?: string | null;

  // Per-option "why this is wrong" explanation, baked into the seed/admin
  // content so we don't pay an LLM call at runtime. Always null for the
  // correct option. Optional on input (admins can leave blank during drafting).
  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @Length(1, 2000)
  why_wrong_en?: string | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @Length(1, 2000)
  why_wrong_ru?: string | null;
}

export class CreateQuestionDto {
  // Creation is locked to deterministic, auto-markable types. short_answer is
  // retired and cannot be created (Grading Spec). Validation message lists the
  // allowed values via class-validator's IsEnum.
  @IsEnum(CREATABLE_QUESTION_TYPES)
  type!: (typeof CREATABLE_QUESTION_TYPES)[number];

  @IsEnum(DIFFICULTIES)
  difficulty!: (typeof DIFFICULTIES)[number];

  @IsString()
  @Length(1, 4000)
  prompt_en!: string;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @Length(1, 4000)
  prompt_ru?: string | null;

  // Required for MCQ, must be absent/null for short_answer and number_entry.
  // Cross-field rule is validated in the service layer for a clearer error message.
  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(8)
  @ValidateNested({ each: true })
  @Type(() => McqOptionDto)
  options?: McqOptionDto[] | null;

  // For MCQ this is the option KEY (same across languages, hence _en only).
  // For short_answer this is the canonical English answer; _ru is the canonical RU answer.
  // For number_entry this is the canonical numeric value as a string (e.g. "12.5").
  @IsString()
  @Length(1, 1000)
  correct_answer_en!: string;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @Length(1, 1000)
  correct_answer_ru?: string | null;

  @IsString()
  @Length(1, 4000)
  explanation_en!: string;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @Length(1, 4000)
  explanation_ru?: string | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @Length(1, 4000)
  concept_bite_en?: string | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @Length(1, 4000)
  concept_bite_ru?: string | null;

  // number_entry only: absolute tolerance for matching. Null/omitted = exact match.
  // Must be non-negative. Validated for type compatibility in the service.
  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsNumber()
  @Min(0)
  acceptable_tolerance?: number | null;
}

export class UpdateQuestionDto {
  // You may not change a question's type TO short_answer (retired). Omitting
  // `type` leaves a legacy short_answer row's type untouched; only an explicit
  // change is constrained, and only to the deterministic creatable set.
  @IsOptional()
  @IsEnum(CREATABLE_QUESTION_TYPES)
  type?: (typeof CREATABLE_QUESTION_TYPES)[number];

  @IsOptional()
  @IsEnum(DIFFICULTIES)
  difficulty?: (typeof DIFFICULTIES)[number];

  @IsOptional()
  @IsString()
  @Length(1, 4000)
  prompt_en?: string;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @Length(1, 4000)
  prompt_ru?: string | null;

  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(8)
  @ValidateNested({ each: true })
  @Type(() => McqOptionDto)
  options?: McqOptionDto[] | null;

  @IsOptional()
  @IsString()
  @Length(1, 1000)
  correct_answer_en?: string;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @Length(1, 1000)
  correct_answer_ru?: string | null;

  @IsOptional()
  @IsString()
  @Length(1, 4000)
  explanation_en?: string;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @Length(1, 4000)
  explanation_ru?: string | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @Length(1, 4000)
  concept_bite_en?: string | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @Length(1, 4000)
  concept_bite_ru?: string | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsNumber()
  @Min(0)
  acceptable_tolerance?: number | null;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
