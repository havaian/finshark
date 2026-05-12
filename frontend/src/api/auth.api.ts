import { api } from './client';
import type { AuthResult, AuthTokens, PublicUser } from '../types/auth';

export const authApi = {
  async register(input: { email: string; password: string; display_name: string }): Promise<AuthResult> {
    const res = await api.post<AuthResult>('/auth/register', input);
    return res.data;
  },

  async login(input: { email: string; password: string }): Promise<AuthResult> {
    const res = await api.post<AuthResult>('/auth/login', input);
    return res.data;
  },

  async refresh(refresh_token: string): Promise<AuthTokens> {
    const res = await api.post<AuthTokens>('/auth/refresh', { refresh_token });
    return res.data;
  },

  async logout(refresh_token: string): Promise<void> {
    await api.post('/auth/logout', { refresh_token });
  },

  async me(): Promise<PublicUser> {
    const res = await api.get<PublicUser>('/auth/me');
    return res.data;
  },

  async setEmailReminders(enabled: boolean): Promise<PublicUser> {
    const res = await api.post<{ ok: boolean; user: PublicUser }>('/me/email-reminders', { enabled });
    return res.data.user;
  },
};
