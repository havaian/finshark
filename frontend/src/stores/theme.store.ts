import { ref, watch } from 'vue';
import { defineStore } from 'pinia';

export type ThemeChoice = 'system' | 'light' | 'dark';
export type EffectiveTheme = 'light' | 'dark';

const LS_THEME = 'acca_duo.theme';

// Resolve a user choice + OS preference to the actual theme to apply.
function resolveTheme(choice: ThemeChoice): EffectiveTheme {
  if (choice === 'system') {
    const prefersDark =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    return prefersDark ? 'dark' : 'light';
  }
  return choice;
}

function readChoiceFromStorage(): ThemeChoice {
  if (typeof localStorage === 'undefined') return 'system';
  const raw = localStorage.getItem(LS_THEME);
  if (raw === 'light' || raw === 'dark' || raw === 'system') return raw;
  return 'system';
}

// The store. Initialised from whatever index.html's bootstrap script wrote, but
// we re-read here so SSR / first-load races don't bite us.
export const useThemeStore = defineStore('theme', () => {
  const choice = ref<ThemeChoice>(readChoiceFromStorage());
  const effective = ref<EffectiveTheme>(resolveTheme(choice.value));

  function applyToDocument(t: EffectiveTheme) {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', t);
    }
  }

  function setChoice(next: ThemeChoice) {
    choice.value = next;
    localStorage.setItem(LS_THEME, next);
    effective.value = resolveTheme(next);
    applyToDocument(effective.value);
  }

  // When choice is 'system', follow OS-level changes live.
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mql = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => {
      if (choice.value === 'system') {
        effective.value = resolveTheme('system');
        applyToDocument(effective.value);
      }
    };
    // addEventListener for modern browsers; older Safari needs addListener.
    if (mql.addEventListener) mql.addEventListener('change', onChange);
    else if (mql.addListener) mql.addListener(onChange);
  }

  // Belt-and-suspenders: keep the DOM attribute aligned with the store on any mutation.
  watch(effective, (t) => applyToDocument(t), { immediate: true });

  return { choice, effective, setChoice };
});
