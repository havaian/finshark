import { IsString, MinLength, MaxLength } from "class-validator";

// Payload for POST /auth/2fa-verify. The pending_2fa_token comes from the
// Google callback redirect (URL fragment); the code is what the user types
// in - either a 6-digit TOTP or a recovery code. The service distinguishes
// them by shape, so we don't bother splitting fields.
export class TwoFactorVerifyDto {
  @IsString()
  @MinLength(1)
  pending_2fa_token!: string;

  @IsString()
  @MinLength(6)
  // 6 for TOTP, up to ~30 for a recovery code with separators. 40 is plenty.
  @MaxLength(40)
  code!: string;
}
