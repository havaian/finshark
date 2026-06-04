import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import type { AuthTokens } from "../types/auth";

// localStorage keys. Keep in sync with stores/auth.store.ts + i18n/index.ts.
const LS_ACCESS = "finshark.access_token";
const LS_REFRESH = "finshark.refresh_token";
const LS_LANG = "finshark.lang";

// Extend axios request config to mark a request we've already retried
// so we don't loop forever on a stuck 401.
interface RetriableConfig extends InternalAxiosRequestConfig {
  _retried?: boolean;
}

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: false,
});

// ---- request interceptor: attach access token + active language ----
api.interceptors.request.use((config) => {
  const access = localStorage.getItem(LS_ACCESS);
  if (access && config.headers) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  // X-Lang header - server resolves it through the @Lang decorator.
  // We read from localStorage on every request (cheap) so the locale store
  // doesn't need to be imported here, avoiding a circular import. The valid
  // set is inlined for the same reason; keep it in sync with SUPPORTED_LANGS
  // in src/i18n/index.ts. The backend @Lang decorator falls back to its
  // DEFAULT_LANG for any value it doesn't yet support, so sending a lang the
  // backend hasn't enabled is safe (it just serves the default).
  const lang = localStorage.getItem(LS_LANG);
  const VALID_LANGS = ["en", "ru", "uz"];
  if (config.headers && lang && VALID_LANGS.includes(lang)) {
    config.headers["X-Lang"] = lang;
  }
  return config;
});

// ---- response interceptor: on 401, try refresh once, then replay ----
//
// Concurrency note: if 5 requests fire at once and all get 401, we don't want to
// hit /auth/refresh 5 times. We share a single in-flight refresh promise across
// callers - first 401 starts it, the others await it.
let refreshInflight: Promise<AuthTokens | null> | null = null;

// Subscribers to call when logout happens (so the store can clear itself).
// We keep this loose to avoid a hard dep on the Pinia store from here.
type LogoutHandler = () => void;
const logoutHandlers: LogoutHandler[] = [];
export function onForcedLogout(handler: LogoutHandler) {
  logoutHandlers.push(handler);
}

async function performRefresh(): Promise<AuthTokens | null> {
  const refresh = localStorage.getItem(LS_REFRESH);
  if (!refresh) return null;

  try {
    // Use a bare axios call here (not `api`) to skip our own interceptors -
    // we don't want this request to recurse into refresh logic.
    const res = await axios.post<AuthTokens>(
      `${import.meta.env.VITE_API_BASE_URL}/auth/refresh`,
      { refresh_token: refresh }
    );
    localStorage.setItem(LS_ACCESS, res.data.access_token);
    localStorage.setItem(LS_REFRESH, res.data.refresh_token);
    return res.data;
  } catch {
    return null;
  }
}

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const original = error.config as RetriableConfig | undefined;

    // Bail out if no config, not a 401, already retried, or this WAS the refresh call.
    if (
      !original ||
      error.response?.status !== 401 ||
      original._retried ||
      original.url?.endsWith("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    original._retried = true;

    // Coalesce concurrent refreshes.
    if (!refreshInflight) {
      refreshInflight = performRefresh().finally(() => {
        refreshInflight = null;
      });
    }
    const tokens = await refreshInflight;

    if (!tokens) {
      // Refresh failed - clear storage, notify subscribers (the store), and reject.
      localStorage.removeItem(LS_ACCESS);
      localStorage.removeItem(LS_REFRESH);
      for (const h of logoutHandlers) h();
      return Promise.reject(error);
    }

    // Replay with the new access token.
    if (original.headers) {
      original.headers.Authorization = `Bearer ${tokens.access_token}`;
    }
    return api.request(original as AxiosRequestConfig);
  }
);

// Exported so the store can update storage when login/register succeed.
export const TOKEN_STORAGE_KEYS = {
  access: LS_ACCESS,
  refresh: LS_REFRESH,
} as const;
