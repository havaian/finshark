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

  function setLang(next: Lang) {
    lang.value = next;
    // Also update vue-i18n and persist.
    setLanguage(next);
  }

  // Belt-and-suspenders: if the ref is mutated directly elsewhere, keep storage in sync.
  watch(lang, (l) => writeLangToStorage(l));

  return { lang, setLang, DEFAULT_LANG };
});
