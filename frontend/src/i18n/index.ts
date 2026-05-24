import { createI18n, type Composer, type I18nOptions } from "vue-i18n";
import en from "./en";
import ru from "./ru";

// Supported languages — must mirror backend src/content/content.types.ts SUPPORTED_LANGS.
export const SUPPORTED_LANGS = ["en", "ru"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];
// Default for new/anonymous users. The ACCA exam itself is in English, so EN
// is the sensible landing language; existing users keep their saved choice via
// readLangFromStorage() below (localStorage 'finshark.lang').
export const DEFAULT_LANG: Lang = "en";

// Read the saved language from localStorage. Falls back to the default.
const LS_LANG = "finshark.lang";
export function readLangFromStorage(): Lang {
  if (typeof localStorage === "undefined") return DEFAULT_LANG;
  const raw = localStorage.getItem(LS_LANG);
  if (raw === "en" || raw === "ru") return raw;
  return DEFAULT_LANG;
}
export function writeLangToStorage(lang: Lang): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(LS_LANG, lang);
}

// vue-i18n setup. legacy:false → Composition API mode (the only one we use).
// fallbackLocale:'en' → if a key is missing in the active language, look in EN.
// missingWarn / fallbackWarn off in prod build (noisy with many keys).
const options: I18nOptions = {
  legacy: false,
  locale: readLangFromStorage(),
  fallbackLocale: "en",
  messages: { en, ru },
  missingWarn: false,
  fallbackWarn: false,
};

export const i18n = createI18n(options);

// `i18n.global` is typed as VueI18n (legacy) by default, but with legacy:false
// the runtime type is Composer. Cast once at module-level so internal helpers
// can read .locale.value and .messages.value without per-call casts.
function composer(): Composer {
  return i18n.global as unknown as Composer;
}

// Deep-set a value at a dot-path on an object, creating intermediate objects.
// Used to apply flat DB overrides ({"dashboard.welcome": "..."}) onto the
// nested messages tree vue-i18n expects.
function setDeep(
  target: Record<string, unknown>,
  path: string,
  value: string
): void {
  const parts = path.split(".");
  let cur: Record<string, unknown> = target;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (typeof cur[p] !== "object" || cur[p] === null) {
      cur[p] = {};
    }
    cur = cur[p] as Record<string, unknown>;
  }
  cur[parts[parts.length - 1]] = value;
}

// Merge DB overrides into the active locale. Called from main.ts after the
// /api/ui-translations/:lang fetch completes (or fails silently).
// We mutate the existing messages object so reactive consumers update.
export function applyOverrides(
  lang: Lang,
  overrides: Record<string, string>
): void {
  const c = composer();
  const allMessages = c.messages.value as Record<Lang, Record<string, unknown>>;
  const messages = allMessages[lang];
  if (!messages) return;
  for (const [key, value] of Object.entries(overrides)) {
    setDeep(messages, key, value);
  }
  // Force a refresh of the current locale binding so components re-render with new strings.
  // Switching to the same locale is a no-op but triggers reactivity.
  c.locale.value = lang;
}

// Change the active language and persist it. Used by the settings/profile UI.
export function setLanguage(lang: Lang): void {
  composer().locale.value = lang;
  writeLangToStorage(lang);
}
