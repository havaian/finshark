import { ref, watch } from "vue";
import { defineStore } from "pinia";
import {
  DEFAULT_LANG,
  readLangFromStorage,
  setLanguage,
  writeLangToStorage,
  type Lang,
} from "../i18n";

// Locale store. Mirrors the active vue-i18n locale + persists to localStorage.
// The axios client reads from here on each request to set X-Lang.
export const useLocaleStore = defineStore("locale", () => {
  const lang = ref<Lang>(readLangFromStorage());

  // Switch language. Returns the promise from setLanguage so callers that
  // need the target locale's messages loaded before proceeding (the router's
  // lang-sync guard) can await it. The ref is updated immediately so the
  // X-Lang header and reactive bindings reflect the choice without waiting on
  // the chunk fetch; setLanguage loads the messages then flips vue-i18n's
  // active locale.
  function setLang(next: Lang): Promise<void> {
    lang.value = next;
    return setLanguage(next);
  }

  // Belt-and-suspenders: if the ref is mutated directly elsewhere, keep storage in sync.
  watch(lang, (l) => writeLangToStorage(l));

  return { lang, setLang, DEFAULT_LANG };
});
