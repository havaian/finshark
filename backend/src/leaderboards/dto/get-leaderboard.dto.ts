import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

const WINDOWS = ['week', 'month', 'all'] as const;

export class GetLeaderboardDto {
  @IsIn(WINDOWS as unknown as string[])
  window!: 'week' | 'month' | 'all';

  // Optional paper filter — only XP from attempts on this paper's questions
  // count toward the score. Pass nothing for "all papers combined".
  @IsOptional()
  @IsString()
  paper_id?: string;

  // Capped server-side too (1..100); this just gives the client a way to
  // request fewer rows if they only render a top-10 widget. Type() because
  // query strings arrive as strings.
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}
