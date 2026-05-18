import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";

export class GenerateQuestionsDto {
  // 3..10 — matches the cost caps documented in the service. Lower bound is
  // 3 because anything smaller isn't worth a generation round-trip.
  @IsInt()
  @Min(3)
  @Max(10)
  count!: number;

  // Free-text hints from the admin. Concatenated AFTER the preloaded topic
  // hints in the prompt, so admin guidance overrides static defaults
  // (e.g. "focus on mix and yield variances, exclude planning variances").
  // Bounded length so a misuse can't blow up the prompt token budget.
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  hints?: string;
}
