import { useRoute } from "vue-router";
import { useLocaleStore } from "../stores/locale.store";
import { SUPPORTED_LANGS, type Lang, DEFAULT_LANG } from "../i18n";

// Helper for building locale-prefixed URLs. All app routes (except the two
// external entry points — /auth/callback and /unsubscribe) live under a
// /:lang(en|ru) parent, so any literal path used in a RouterLink, router.push,
// or router.replace must be prefixed with the active lang.
//
// Usage:
//   const lp = useLocalePath();
//   router.push(lp('/dashboard'));     // → /ru/dashboard (or whatever is active)
//   <RouterLink :to="lp('/profile')"/>
//
// Source of truth for the active lang, in order:
//   1. The route's :lang param (if we're already inside the localized tree)
//   2. The locale store (which mirrors localStorage)
//   3. DEFAULT_LANG as a last resort
//
// We check the route first so that mid-navigation calls don't accidentally
// flip the prefix to a stale store value while the store is still catching up.
export function useLocalePath() {
  const route = useRoute();
  const locale = useLocaleStore();

  function currentLang(): Lang {
    const fromRoute = route.params.lang;
    if (
      typeof fromRoute === "string" &&
      (SUPPORTED_LANGS as readonly string[]).includes(fromRoute)
    ) {
      return fromRoute as Lang;
    }
    return locale.lang || DEFAULT_LANG;
  }

  // Prefix a path with the current lang. Idempotent — calling lp('/ru/x')
  // when current is 'ru' still returns '/ru/x', not '/ru/ru/x'. Detection
  // is based on a leading /<lang>/ or exact /<lang> match.
  function lp(path: string): string {
    if (!path.startsWith("/")) return path;
    const lang = currentLang();

    // Already prefixed with a valid lang? Leave as-is.
    for (const l of SUPPORTED_LANGS) {
      if (path === `/${l}` || path.startsWith(`/${l}/`)) return path;
    }

    if (path === "/") return `/${lang}`;
    return `/${lang}${path}`;
  }

  return lp;
}

// Non-composable variant for use inside .ts files (api clients, stores, etc).
// Reads the locale store directly; cannot read route params, so it always
// goes through the store. Suitable for one-off use outside Vue components.
export function buildLocalePath(path: string, lang?: Lang): string {
  const useLang = lang || useLocaleStore().lang || DEFAULT_LANG;
  if (!path.startsWith("/")) return path;
  for (const l of SUPPORTED_LANGS) {
    if (path === `/${l}` || path.startsWith(`/${l}/`)) return path;
  }
  if (path === "/") return `/${useLang}`;
  return `/${useLang}${path}`;
}
