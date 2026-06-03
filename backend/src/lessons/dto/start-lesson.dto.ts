import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class StartLessonDto {
  // Optional paper filter - without it the queue draws from everything.
  @IsOptional()
  @IsString()
  paper_id?: string;

  // Lesson size. Spec says 5-10 micro-lessons; we cap to a sensible range.
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(20)
  size?: number;
}
