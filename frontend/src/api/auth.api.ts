import { api } from "./client";
import type { AuthTokens, PublicUser } from "../types/auth";

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
};
