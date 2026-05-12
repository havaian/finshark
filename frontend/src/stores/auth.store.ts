import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import { authApi } from '../api/auth.api';
import { onForcedLogout, TOKEN_STORAGE_KEYS } from '../api/client';
import type { PublicUser } from '../types/auth';

const LS_USER = 'acca_duo.user';

function readUserFromStorage(): PublicUser | null {
  const raw = localStorage.getItem(LS_USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PublicUser;
  } catch {
    return null;
  }
}

export const useAuthStore = defineStore('auth', () => {
  // Initialise from storage so a refresh keeps the user logged in.
  const user = ref<PublicUser | null>(readUserFromStorage());
  const accessToken = ref<string | null>(localStorage.getItem(TOKEN_STORAGE_KEYS.access));
  const refreshToken = ref<string | null>(localStorage.getItem(TOKEN_STORAGE_KEYS.refresh));

  const isAuthenticated = computed(() => !!user.value && !!accessToken.value);

  function persist(u: PublicUser, access: string, refresh: string) {
    user.value = u;
    accessToken.value = access;
    refreshToken.value = refresh;
    localStorage.setItem(LS_USER, JSON.stringify(u));
    localStorage.setItem(TOKEN_STORAGE_KEYS.access, access);
    localStorage.setItem(TOKEN_STORAGE_KEYS.refresh, refresh);
  }

  function clear() {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
    localStorage.removeItem(LS_USER);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.access);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.refresh);
  }

  async function login(email: string, password: string) {
    const { user: u, tokens } = await authApi.login({ email, password });
    persist(u, tokens.access_token, tokens.refresh_token);
  }

  async function register(email: string, password: string, display_name: string) {
    const { user: u, tokens } = await authApi.register({ email, password, display_name });
    persist(u, tokens.access_token, tokens.refresh_token);
  }

  function logout() {
    // Best-effort revoke on the server. We don't await success — if it fails (offline,
    // backend down, token already invalid), we still clear locally. Worst case the
    // refresh token stays alive until its 30d TTL.
    const rt = refreshToken.value;
    if (rt) {
      authApi.logout(rt).catch(() => {
        /* swallow — local clear is the source of truth for the user */
      });
    }
    clear();
  }

  // Re-fetch user profile (useful after page load to validate the stored access token).
  async function fetchMe() {
    const u = await authApi.me();
    user.value = u;
    localStorage.setItem(LS_USER, JSON.stringify(u));
  }

  // Wire forced logout from axios interceptor (called when refresh fails).
  onForcedLogout(() => {
    clear();
  });

  return {
    user,
    accessToken,
    refreshToken,
    isAuthenticated,
    login,
    register,
    logout,
    fetchMe,
  };
});
