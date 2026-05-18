import { IsString, Length } from "class-validator";

export class SubmitAttemptDto {
  @IsString()
  question_id!: string;

  @IsString()
  @Length(0, 4000)
  user_answer!: string; // allow empty string; the grader handles it
}
