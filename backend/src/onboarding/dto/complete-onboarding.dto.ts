import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  Min,
  ValidateIf,
} from "class-validator";

// Submission payload from the onboarding wizard. ALL fields are optional -
// the "skip" path sends an empty body (the service sets onboarded_at=NOW()
// with defaults). The "complete" path sends as many fields as the user filled
// in. We don't force them all because the user might pick a paper but not a
// background level, etc.
//
// time_budget_minutes is constrained to 5..60 (matches the DB check) - outside
// that is unrealistic for both ends.
//
// preferred_paper_id is a bigint PK serialized as a string by postgres.js, not
// a UUID. We accept it as a plain @IsString() - IsUUID would reject valid IDs.
export class CompleteOnboardingDto {
  @IsOptional()
  @IsEnum(["beginner", "intermediate", "advanced"])
  bg_level?: "beginner" | "intermediate" | "advanced";

  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(60)
  time_budget_minutes?: number;

  @IsOptional()
  @IsString()
  preferred_paper_id?: string;

  // If the user toggles reminders during onboarding we accept it here too -
  // routing it through the existing preferences path on the users controller
  // would mean two API calls instead of one.
  @IsOptional()
  @IsBoolean()
  email_reminders_enabled?: boolean;

  // Optional next exam date 'YYYY-MM-DD'. Shape-checked here; the service does
  // the full today-or-later + upper-bound check via normalizeExamDate. null is
  // permitted (clears the date) and bypasses the regex via ValidateIf.
  @IsOptional()
  @ValidateIf((_o, v) => v !== null)
  @Matches(/^\d{4}-\d{2}-\d{2}$/, {
    message: "exam_date must be a date in YYYY-MM-DD format",
  })
  exam_date?: string | null;
}
