import { api } from "./client";
import type {
  TotpStatus,
  TotpSetupBeginResult,
  TotpSetupVerifyResult,
  TotpAuditEntry,
} from "../types/totp";

export const totpApi = {
  // GET /me/2fa - current status. Cheap; Settings hits this on mount and
  // after enable/disable to refresh the UI.
  status: async (): Promise<TotpStatus> =>
    (await api.get<TotpStatus>("/me/2fa")).data,

  // GET /me/2fa/remaining-codes - number of unused recovery codes. Shown
  // in Settings so admins can decide when to regenerate.
  remainingCodes: async (): Promise<{ remaining: number }> =>
    (await api.get<{ remaining: number }>("/me/2fa/remaining-codes")).data,

  // GET /me/2fa/audit - recent 2FA audit events for the current user.
  audit: async (): Promise<TotpAuditEntry[]> =>
    (await api.get<TotpAuditEntry[]>("/me/2fa/audit")).data,

  // POST /me/2fa/setup-begin → returns secret + QR. No DB write yet; the
  // secret must be round-tripped to setup-verify. If the user closes the
  // tab before verifying, nothing is persisted.
  setupBegin: async (): Promise<TotpSetupBeginResult> =>
    (await api.post<TotpSetupBeginResult>("/me/2fa/setup-begin")).data,

  // POST /me/2fa/setup-verify → returns recovery codes ONCE. Caller MUST
  // surface them to the user with a "I saved them" confirmation step;
  // they're not retrievable later.
  setupVerify: async (input: {
    secret_b32: string;
    code: string;
  }): Promise<TotpSetupVerifyResult> =>
    (await api.post<TotpSetupVerifyResult>("/me/2fa/setup-verify", input)).data,

  // POST /me/2fa/regenerate-codes → invalidates the old set and returns
  // a fresh batch. Same shape as setupVerify (10 codes shown ONCE).
  // Requires a current TOTP/recovery code as proof of possession.
  regenerateCodes: async (code: string): Promise<TotpSetupVerifyResult> =>
    (
      await api.post<TotpSetupVerifyResult>("/me/2fa/regenerate-codes", {
        code,
      })
    ).data,

  // DELETE /me/2fa - disable. Requires a TOTP or recovery code as proof
  // of possession so a stolen session can't strip the factor.
  disable: async (code: string): Promise<{ ok: true }> =>
    (await api.delete<{ ok: true }>("/me/2fa", { data: { code } })).data,
};
