import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { authApi } from "../api/auth.api";
import { onForcedLogout, TOKEN_STORAGE_KEYS } from "../api/client";
import { useEntitlementStore } from "./entitlement.store";
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

// Decode the payload segment of a JWT WITHOUT verifying it. We only read it to
// drive UI gating (is this session admin-elevated?); the server re-checks the
// signature + claim on every admin request via AdminWith2faGuard, so a forged
// adm2fa here buys nothing - admin endpoints would still 403. base64url →
// JSON. Returns {} on any malformed input.
function decodeJwtPayload(token: string | null): Record<string, unknown> {
  if (!token) return {};
  const parts = token.split(".");
  if (parts.length !== 3) return {};
  try {
    const b64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4 === 0 ? "" : "=".repeat(4 - (b64.length % 4));
    const json = atob(b64 + pad);
    return JSON.parse(json) as Record<string, unknown>;
  } catch {
    return {};
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

  // True when the current session's access token carries the adm2fa elevation
  // claim (set by /auth/2fa-elevate, carried through refresh). The router uses
  // this to decide whether an enrolled admin must pass the admin-area 2FA
  // challenge before entering /admin/*. Re-derives whenever accessToken changes.
  const isAdminElevated = computed(
    () => decodeJwtPayload(accessToken.value).adm2fa === true
  );

  function clear() {
    user.value = null;
    accessToken.value = null;
    refreshToken.value = null;
    localStorage.removeItem(LS_USER);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.access);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.refresh);
    // Drop any cached entitlement so the next signed-in user can't briefly
    // see the previous user's premium chip / quota. Imported lazily inside
    // the function to avoid a Pinia init order surprise - both stores are
    // registered before any caller invokes clear().
    useEntitlementStore().clear();
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
      // Eager fetch - first thing the user sees after sign-in is the
      // dashboard, which expects chrome chips to be populated.
      void useEntitlementStore().fetch();
    } catch (e) {
      // /me failed despite fresh tokens - wipe and rethrow so the callback page can show an error.
      clear();
      throw e;
    }
  }

  function logout() {
    // Best-effort revoke on the server. We don't await success - if it fails (offline,
    // backend down, token already invalid), we still clear locally. Worst case the
    // refresh token stays alive until its 30d TTL.
    const rt = refreshToken.value;
    if (rt) {
      authApi.logout(rt).catch(() => {
        /* swallow - local clear is the source of truth for the user */
      });
    }
    clear();
  }

  // Re-fetch user profile (useful after page load to validate the stored access token).
  // Also kicks off an entitlement refresh so chrome chips stay in sync with
  // the latest tier / quota state. The entitlement fetch is fire-and-forget
  // - fetchMe must not fail just because /me/entitlement was slow or 5xx'd.
  async function fetchMe() {
    const u = await authApi.me();
    user.value = u;
    localStorage.setItem(LS_USER, JSON.stringify(u));
    void useEntitlementStore().fetch();
  }

  // Same idea as completeGoogleLogin but for the 2FA verify endpoint, which
  // returns the user object inline - no second /me round-trip needed. Used
  // by the /2fa-verify page after the user types their 6-digit code.
  function completeTwoFactorLogin(input: {
    access_token: string;
    refresh_token: string;
    user: PublicUser;
  }) {
    accessToken.value = input.access_token;
    refreshToken.value = input.refresh_token;
    user.value = input.user;
    localStorage.setItem(TOKEN_STORAGE_KEYS.access, input.access_token);
    localStorage.setItem(TOKEN_STORAGE_KEYS.refresh, input.refresh_token);
    localStorage.setItem(LS_USER, JSON.stringify(input.user));
    // Same eager fetch as completeGoogleLogin - entitlement chips need to
    // be populated on first dashboard paint.
    void useEntitlementStore().fetch();
  }

  // Replace the user object in the store + localStorage. Used by flows that
  // get a fresh PublicUser back without a separate /me fetch - onboarding
  // POST returns the updated user, settings updates return the user, etc.
  function setUser(u: PublicUser) {
    user.value = u;
    localStorage.setItem(LS_USER, JSON.stringify(u));
  }

  // Apply the elevated token pair returned by /auth/2fa-elevate. Same storage
  // mechanics as a login completion (tokens + user), but named for intent: it
  // upgrades the CURRENT session to admin-elevated. After this, isAdminElevated
  // flips true (the new access token carries adm2fa) and admin routes open.
  function applyElevation(input: {
    access_token: string;
    refresh_token: string;
    user: PublicUser;
  }) {
    accessToken.value = input.access_token;
    refreshToken.value = input.refresh_token;
    user.value = input.user;
    localStorage.setItem(TOKEN_STORAGE_KEYS.access, input.access_token);
    localStorage.setItem(TOKEN_STORAGE_KEYS.refresh, input.refresh_token);
    localStorage.setItem(LS_USER, JSON.stringify(input.user));
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
    isAdminElevated,
    completeGoogleLogin,
    completeTwoFactorLogin,
    applyElevation,
    logout,
    fetchMe,
    setUser,
  };
});
