import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { authApi } from "../api/auth.api";
import { onForcedLogout, TOKEN_STORAGE_KEYS } from "../api/client";
import type { PublicUser } from "../types/auth";

const LS_USER = "finshark.user";

function readUserFromStorage(): PublicUser | null {
  const raw = localStorage.getItem(LS_USER);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as PublicUser;
  } catch {
    return null;
  }
}

export const useAuthStore = defineStore("auth", () => {
  // Initialise from storage so a refresh keeps the user logged in.
  const user = ref<PublicUser | null>(readUserFromStorage());
  const accessToken = ref<string | null>(
    localStorage.getItem(TOKEN_STORAGE_KEYS.access)
  );
  const refreshToken = ref<string | null>(
    localStorage.getItem(TOKEN_STORAGE_KEYS.refresh)
  );

  const isAuthenticated = computed(() => !!user.value && !!accessToken.value);

  function clear() {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
    localStorage.removeItem(LS_USER);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.access);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.refresh);
  }

  // Called by the /auth/callback page after a successful Google round-trip.
  // Tokens come from the URL fragment; we persist them, then fetch /me to populate
  // the user. We don't get the user object in the fragment (kept the URL short),
  // so /me is the source of truth here.
  async function completeGoogleLogin(
    access_token: string,
    refresh_token: string
  ) {
    // Persist tokens first so the api client picks them up on the /me call.
    accessToken.value = access_token;
    refreshToken.value = refresh_token;
    localStorage.setItem(TOKEN_STORAGE_KEYS.access, access_token);
    localStorage.setItem(TOKEN_STORAGE_KEYS.refresh, refresh_token);

    try {
      const u = await authApi.me();
      user.value = u;
      localStorage.setItem(LS_USER, JSON.stringify(u));
    } catch (e) {
      // /me failed despite fresh tokens — wipe and rethrow so the callback page can show an error.
      clear();
      throw e;
    }
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

  // Replace the user object in the store + localStorage. Used by flows that
  // get a fresh PublicUser back without a separate /me fetch — onboarding
  // POST returns the updated user, settings updates return the user, etc.
  function setUser(u: PublicUser) {
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
    completeGoogleLogin,
    logout,
    fetchMe,
    setUser,
  };
});
