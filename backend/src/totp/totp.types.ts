// What the setup-begin endpoint returns to the frontend. The frontend uses
// `qr_data_url` directly as <img src=...> (it's a data: URL containing the
// PNG). `secret_b32` is shown alongside for users whose authenticator can't
// scan a QR — they enter the secret manually.
export interface TotpSetupBeginResult {
  secret_b32: string;       // Base32 TOTP secret (also encoded in the QR)
  qr_data_url: string;      // data:image/png;base64,... for direct <img src>
  otpauth_uri: string;      // raw otpauth:// URI (kept for debugging/tests)
}

// Returned by setup-verify. Recovery codes are surfaced ONCE — we never
// show them again. The frontend MUST display all 10 and require the user
// to confirm they saved them.
export interface TotpSetupVerifyResult {
  ok: true;
  recovery_codes: string[]; // plaintext, 10 codes; never re-shown
}

// Status payload for GET /me/2fa — used by Settings to render enable/disable.
export interface TotpStatusResult {
  enabled: boolean;
  enrolled_at: string | null; // ISO timestamp, null if not enrolled
}

// Returned when a Google callback resolves to an admin who has 2FA enabled.
// The pending JWT is short-lived; the frontend swaps it for real tokens at
// POST /auth/2fa-verify with a TOTP or recovery code.
export interface TwoFactorChallenge {
  pending_2fa_token: string;
}
