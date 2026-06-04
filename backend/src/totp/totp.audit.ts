// Audit event codes for the 2FA system. Kept as a string literal union so
// callers get autocomplete and a misspelled event fails at compile time
// rather than silently writing garbage into the DB.
//
// Adding a new event:
//   1) Append it here.
//   2) Call this.audit.record({ user_id, event: 'your_new_event', ... })
//      from wherever the transition happens.
//   3) If the event has structured context, document the expected `meta`
//      shape in a comment alongside.
export type TotpAuditEvent =
  // Setup succeeded: user_id has totp_secret + 10 fresh recovery codes.
  // No meta.
  | "enrolled"
  // User confirmed disable with a current code. Cleared secret + codes.
  // No meta.
  | "disabled"
  // User regenerated their recovery codes (old set invalidated, new set
  // surfaced once). meta: { count: 10 }.
  | "recovery_codes_regenerated"
  // A recovery code was consumed during a verify. meta:
  // { remaining: <int>, context: 'login' | 'disable' | 'regenerate' }.
  | "recovery_code_consumed"
  // Per-user lockout triggered - the verifier refused the request because
  // recent failed attempts exceeded the threshold. meta:
  // { recent_failures: <int>, window_minutes: <int> }.
  | "locked_out"
  // An already-authenticated admin passed a TOTP/recovery code at the
  // /auth/2fa-elevate step to gain admin-area access for the session. This
  // replaces the old login-time challenge: login no longer demands 2FA;
  // entering the admin area does. No meta.
  | "admin_elevated";

// Row shape returned from SELECT * on the audit table.
export interface TotpAuditRow {
  id: string;
  user_id: string;
  event: TotpAuditEvent;
  ip: string | null;
  meta: Record<string, unknown>;
  created_at: Date;
}
