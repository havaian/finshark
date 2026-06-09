import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Max, Min } from "class-validator";

export class GetLeaderboardDto {
  // Optional paper filter - when present, the board ranks by per-paper XP
  // (summed attempts.xp_earned on that paper's questions). When absent, the
  // board ranks by the user's cumulative users.xp total. Pass nothing for the
  // all-time cumulative board.
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
