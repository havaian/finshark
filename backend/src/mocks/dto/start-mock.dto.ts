import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

// POST /mocks - start a mock session for a given paper.
//
// question_count: 5..100. The frontend default for a "full mock" is 35
// (matching F3 CBE), but smaller drill-style mocks are allowed.
// time_limit_seconds: 5 min .. 4 hours. Soft limit - backend stores it for
// analytics + the frontend countdown, but doesn't auto-fail when it elapses.
export class StartMockDto {
  @IsString()
  paper_id!: string;

  @Type(() => Number)
  @IsInt()
  @Min(5)
  @Max(100)
  question_count!: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(300)
  @Max(14400)
  time_limit_seconds?: number;
}
