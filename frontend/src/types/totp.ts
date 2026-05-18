// Mirrors backend/src/totp/totp.types.ts

export interface TotpStatus {
  enabled: boolean;
  enrolled_at: string | null; // ISO timestamp
}

export interface TotpSetupBeginResult {
  secret_b32: string; // Base32 secret (also encoded in the QR)
  qr_data_url: string; // data:image/png;base64,... ready for <img src>
  otpauth_uri: string; // raw otpauth:// URI (debug; can show as text)
}

export interface TotpSetupVerifyResult {
  ok: true;
  recovery_codes: string[]; // 10 codes, shown ONCE
}

// Audit log entry returned by GET /me/2fa/audit. `event` is a string the
// backend logs from a fixed union (enrolled / disabled / etc); the
// frontend renders a localised label per event code.
export interface TotpAuditEntry {
  id: string;
  user_id: string;
  event: string;
  ip: string | null;
  meta: Record<string, unknown>;
  created_at: string; // ISO timestamp
}
