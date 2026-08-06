import { createI18n, type Composer, type I18nOptions } from "vue-i18n";
import en from "./en";

// Supported languages - must mirror backend src/content/content.types.ts SUPPORTED_LANGS.
export const SUPPORTED_LANGS = ["en", "ru", "uz"] as const;
export type Lang = (typeof SUPPORTED_LANGS)[number];
// Default for new/anonymous users. The ACCA exam itself is in English, so EN
// is the sensible landing language; existing users keep their saved choice via
// readLangFromStorage() below (localStorage 'finshark.lang').
export const DEFAULT_LANG: Lang = "en";

// -- Lazy locale loading ---------------------------------------------------
// Only the default locale (en) is bundled into the main chunk. en is also the
// fallbackLocale, so it MUST be present synchronously at construction time.
// ru and uz (~70 KB and ~60 KB of message data each) are split into their own
// chunks and fetched on demand the first time the app switches to them. New
// visitors hitting the EN landing/dashboard never download the other two.
//
// Vite turns each import() below into a separate chunk. The map values are the
// import thunks themselves (not yet invoked) so nothing is fetched until
// loadLocaleMessages() calls one.
const LOCALE_LOADERS: Record<
  Exclude<Lang, "en">,
  () => Promise<{ default: Record<string, unknown> }>
> = {
  ru: () => import("./ru"),
  uz: () => import("./uz"),
};

// Tracks which non-default locales have already been registered, so repeated
// switches don't re-import (the dynamic import is cached by the bundler too,
// but this avoids even the resolved-promise round-trip and the setLocaleMessage
// call).
const loadedLocales = new Set<Lang>(["en"]);

// Read the saved language from localStorage. Falls back to the default.
const LS_LANG = "finshark.lang";
export function readLangFromStorage(): Lang {
  if (typeof localStorage === "undefined") return DEFAULT_LANG;
  const raw = localStorage.getItem(LS_LANG);
  if (raw && (SUPPORTED_LANGS as readonly string[]).includes(raw)) {
    return raw as Lang;
  }
  return DEFAULT_LANG;
}
export function writeLangToStorage(lang: Lang): void {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(LS_LANG, lang);
}

// vue-i18n setup. legacy:false -> Composition API mode (the only one we use).
// fallbackLocale:'en' -> if a key is missing in the active language, look in EN.
// missingWarn / fallbackWarn off in prod build (noisy with many keys).
//
// messages starts with EN only. We do NOT set `locale` to the saved language
// here, because its messages may not be loaded yet - that would render a flash
// of raw keys. Instead we start on en and let bootstrapLocale() (awaited in
// main.ts before mount) load + switch to the saved language. The fallback to
// en means even if that load fails, the UI still renders real strings.
// Russian needs three plural forms and vue-i18n's built-in rule only knows
// two, so "1 дней" and "22 дней" would both render wrong without this.
//
//   index 0  день   - 1, 21, 31...  (ends in 1, but not 11)
//   index 1  дня    - 2-4, 22-24... (ends in 2-4, but not 12-14)
//   index 2  дней   - 0, 5-20, 25-30...
//
// The teens are the exception the naive "ends with 1" test gets wrong: 11 and
// 21 both end in 1, but only 21 takes the singular.
function russianPlural(choice: number): number {
  const teen = choice % 100 > 10 && choice % 100 < 20;
  const last = choice % 10;
  if (!teen && last === 1) return 0;
  if (!teen && last >= 2 && last <= 4) return 1;
  return 2;
}

const options: I18nOptions = {
  legacy: false,
  locale: DEFAULT_LANG,
  fallbackLocale: "en",
  messages: { en },
  missingWarn: false,
  fallbackWarn: false,
  // en and uz use the default rule: English has two forms, Uzbek one (the
  // noun does not change after a number), and the default handles both.
  pluralRules: { ru: russianPlural },
};

export const i18n = createI18n(options);

// `i18n.global` is typed as VueI18n (legacy) by default, but with legacy:false
// the runtime type is Composer. Cast once at module-level so internal helpers
// can read .locale.value and .messages.value without per-call casts.
function composer(): Composer {
  return i18n.global as unknown as Composer;
}

// Ensure a locale's messages are registered with vue-i18n. No-op for already-
// loaded locales (en, or any previously switched-to lang). Returns once the
// messages are in place. On import failure it logs and resolves anyway - the
// caller then switches locale and vue-i18n falls back to en per-key, so the
// app degrades to English rather than breaking.
export async function loadLocaleMessages(lang: Lang): Promise<void> {
  if (loadedLocales.has(lang)) return;
  const loader = LOCALE_LOADERS[lang as Exclude<Lang, "en">];
  if (!loader) return; // unknown lang - shouldn't happen (callers validate)
  try {
    const mod = await loader();
    composer().setLocaleMessage(lang, mod.default);
    loadedLocales.add(lang);
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error(`failed to load '${lang}' locale messages`, e);
  }
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
//
// Guard: if the target locale's base messages haven't loaded yet (e.g. the
// override fetch for 'ru' resolves before the 'ru' chunk does), there's no
// object to merge into. We skip rather than seeding a partial tree - the
// common path (overrides for the already-active locale) always has its base
// present because bootstrapLocale/setLanguage load it before switching.
export function applyOverrides(
  lang: Lang,
  overrides: Record<string, string>
): void {
  const c = composer();
  const allMessages = c.messages.value as Record<
    string,
    Record<string, unknown>
  >;
  const messages = allMessages[lang];
  if (!messages) return;
  for (const [key, value] of Object.entries(overrides)) {
    setDeep(messages, key, value);
  }
  // Force a refresh of the current locale binding so components re-render with
  // new strings. Only meaningful when overriding the active locale; switching
  // to the same locale is a no-op but triggers reactivity.
  if (c.locale.value === lang) {
    c.locale.value = lang;
  }
}

// Change the active language and persist it. Used by the settings/profile UI
// and the router's lang-sync guard. Now async: it loads the target locale's
// message chunk (if not already loaded) BEFORE flipping the active locale, so
// the switch never flashes raw keys. Persists immediately so a reload restores
// the choice.
export async function setLanguage(lang: Lang): Promise<void> {
  await loadLocaleMessages(lang);
  composer().locale.value = lang;
  writeLangToStorage(lang);
}

// Initial-locale bootstrap, awaited in main.ts before mount. Loads + switches
// to the saved language if it isn't the default. For default-lang users this
// resolves instantly (no extra chunk fetched). Kept separate from setLanguage
// so it doesn't re-write storage with the value it just read.
export async function bootstrapLocale(): Promise<void> {
  const saved = readLangFromStorage();
  if (saved === DEFAULT_LANG) return;
  await loadLocaleMessages(saved);
  composer().locale.value = saved;
}
