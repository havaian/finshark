import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';

// Submission payload from the onboarding wizard. ALL fields are optional —
// the "skip" path sends an empty body (the service sets onboarded_at=NOW()
// with defaults). The "complete" path sends as many fields as the user filled
// in. We don't force them all because the user might pick a paper but not a
// background level, etc.
//
// time_budget_minutes is constrained to 5..60 (matches the DB check) — outside
// that is unrealistic for both ends.
//
// preferred_paper_id is a UUID; we don't validate as IsUUID() to stay consistent
// with the rest of the codebase, which treats paper IDs as opaque strings.
export class CompleteOnboardingDto {
  @IsOptional()
  @IsEnum(['beginner', 'intermediate', 'advanced'])
  bg_level?: 'beginner' | 'intermediate' | 'advanced';

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(60)
  time_budget_minutes?: number;

  @IsOptional()
  @IsString()
  preferred_paper_id?: string;

  // If the user toggles reminders during onboarding we accept it here too —
  // routing it through the existing preferences path on the users controller
  // would mean two API calls instead of one.
  @IsOptional()
  @IsBoolean()
  email_reminders_enabled?: boolean;
}
