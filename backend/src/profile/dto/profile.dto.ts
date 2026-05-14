import { IsString, Length, Matches } from 'class-validator';

export class UpdateDisplayNameDto {
  @IsString()
  @Length(1, 100)
  // Disallow control chars / leading-trailing whitespace via this regex —
  // class-validator's Length lets you put a 1-char string of " " through;
  // requiring at least one non-whitespace char keeps the value useful.
  @Matches(/\S/, { message: 'display_name must contain a non-whitespace character' })
  display_name!: string;
}

// Delete-account confirmation. User must type their own email to confirm,
// matching the dashboard pattern of "do you really mean this".
export class DeleteAccountDto {
  @IsString()
  @Length(1, 320)
  confirm_email!: string;
}
