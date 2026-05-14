import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';

const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

export class UpdatePreferencesDto {
  // Optional everywhere — admin UI sends only the changed field.
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(23)
  reminder_hour_utc?: number;

  // null = "auto" (clears the override). ValidateIf lets null bypass @IsIn.
  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @IsIn(DIFFICULTIES as unknown as string[])
  preferred_difficulty?: 'easy' | 'medium' | 'hard' | null;

  @IsOptional()
  @IsInt()
  @Min(3)
  @Max(10)
  lesson_size?: number;

  @IsOptional()
  @IsBoolean()
  email_reminders_enabled?: boolean;
}
