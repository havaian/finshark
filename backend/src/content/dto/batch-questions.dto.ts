import { ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsString } from 'class-validator';

// Used by the admin content browser to operate on multiple drafts at once
// (activate / delete in bulk). Capped at 200 per call so a typo can't wipe
// an entire LO accidentally — the UI shouldn't allow selecting more anyway.
export class BatchQuestionIdsDto {
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(200)
  @IsString({ each: true })
  ids!: string[];
}

export class BatchSetActiveDto extends BatchQuestionIdsDto {
  @IsBoolean()
  is_active!: boolean;
}
