import { api } from "./client";
import type { AuthResult, AuthTokens, PublicUser } from "../types/auth";

export const authApi = {
  async refresh(refresh_token: string): Promise<AuthTokens> {
    const res = await api.post<AuthTokens>("/auth/refresh", { refresh_token });
    return res.data;
  },

  async logout(refresh_token: string): Promise<void> {
    await api.post("/auth/logout", { refresh_token });
  },

  async me(): Promise<PublicUser> {
    const res = await api.get<PublicUser>("/auth/me");
    return res.data;
  },

  async setEmailReminders(enabled: boolean): Promise<PublicUser> {
    const res = await api.post<{ ok: boolean; user: PublicUser }>(
      "/me/email-reminders",
      { enabled }
    );
    return res.data.user;
  },

  // POST /auth/2fa-verify - final step of the admin 2FA login flow. Takes
  // the pending token from the Google-callback redirect + a TOTP or
  // recovery code. Returns the same { user, tokens } shape as a normal
  // sign-in, so callers can treat it identically.
  async twoFactorVerify(input: {
    pending_2fa_token: string;
    code: string;
  }): Promise<AuthResult> {
    const res = await api.post<AuthResult>("/auth/2fa-verify", input);
    return res.data;
  },
};
