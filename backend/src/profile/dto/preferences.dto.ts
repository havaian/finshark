import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

const DIFFICULTIES = ['easy', 'medium', 'hard'] as const;

export class UpdatePreferencesDto {
  // Optional everywhere - admin UI sends only the changed field.
  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(23)
  reminder_hour_local?: number;

  // IANA timezone name (e.g. 'Asia/Tashkent'). Validated structurally here
  // and definitively by Intl.DateTimeFormat in the service - an invalid name
  // throws there before the DB write.
  @IsOptional()
  @IsString()
  @MaxLength(64)
  @Matches(/^[A-Za-z]+(?:\/[A-Za-z0-9_+-]+)+$|^UTC$/, {
    message: 'timezone must be a valid IANA name',
  })
  timezone?: string;

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

  // Show on leaderboards. Default false (privacy). Users opt in via Settings
  // or, in a later iteration, onboarding.
  @IsOptional()
  @IsBoolean()
  leaderboard_opt_in?: boolean;
}
