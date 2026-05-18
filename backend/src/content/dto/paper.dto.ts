import { IsOptional, IsString, Length, ValidateIf } from "class-validator";

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
}
