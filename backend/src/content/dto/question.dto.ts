import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsString,
  Length,
  ValidateNested,
} from 'class-validator';

export const QUESTION_TYPES = ['mcq', 'short_answer'] as const;
export const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

export class McqOptionDto {
  @IsString()
  @Length(1, 8)
  key!: string; // 'A' / 'B' / etc. We don't hard-code the set; admin decides.

  @IsString()
  @Length(1, 1000)
  text!: string;
}

export class CreateQuestionDto {
  @IsEnum(QUESTION_TYPES)
  type!: (typeof QUESTION_TYPES)[number];

  @IsEnum(DIFFICULTIES)
  difficulty!: (typeof DIFFICULTIES)[number];

  @IsString()
  @Length(1, 4000)
  prompt!: string;

  // Required for MCQ, must be absent/null for short_answer.
  // Cross-field rule is validated in the service layer for a clearer error message.
  @IsOptional()
  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(8)
  @ValidateNested({ each: true })
  @Type(() => McqOptionDto)
  options?: McqOptionDto[] | null;

  @IsString()
  @Length(1, 1000)
  correct_answer!: string;

  @IsString()
  @Length(1, 4000)
  explanation!: string;

  @IsOptional()
  @IsString()
  @Length(0, 4000)
  concept_bite?: string | null;
}

export class UpdateQuestionDto {
  @IsOptional()
  @IsEnum(QUESTION_TYPES)
  type?: (typeof QUESTION_TYPES)[number];

  @IsOptional()
  @IsEnum(DIFFICULTIES)
  difficulty?: (typeof DIFFICULTIES)[number];

  @IsOptional()
  @IsString()
  @Length(1, 4000)
  prompt?: string;

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
  correct_answer?: string;

  @IsOptional()
  @IsString()
  @Length(1, 4000)
  explanation?: string;

  @IsOptional()
  @IsString()
  @Length(0, 4000)
  concept_bite?: string | null;

  @IsOptional()
  @IsBoolean()
  is_active?: boolean;
}
