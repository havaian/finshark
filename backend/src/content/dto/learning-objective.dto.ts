import {
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
  ValidateIf,
} from "class-validator";

// Cap theory at ~5000 chars (~750 words) - well above the 150-300 word target
// but a safety guard against pathological pastes.
const THEORY_MAX = 5000;

export class CreateLoDto {
  @IsString()
  @Length(1, 32)
  code!: string;

  @IsString()
  @Length(1, 200)
  title_en!: string;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @Length(1, 200)
  title_ru?: string | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  description_en?: string | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  description_ru?: string | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @Length(1, THEORY_MAX)
  theory_en?: string | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @Length(1, THEORY_MAX)
  theory_ru?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;
}

export class UpdateLoDto {
  @IsOptional()
  @IsString()
  @Length(1, 32)
  code?: string;

  @IsOptional()
  @IsString()
  @Length(1, 200)
  title_en?: string;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @Length(1, 200)
  title_ru?: string | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  description_en?: string | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  description_ru?: string | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @Length(1, THEORY_MAX)
  theory_en?: string | null;

  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsString()
  @Length(1, THEORY_MAX)
  theory_ru?: string | null;

  @IsOptional()
  @IsInt()
  @Min(0)
  sort_order?: number;
}
