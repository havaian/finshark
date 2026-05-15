import { ref, watch } from 'vue';
import { defineStore } from 'pinia';

export type Theme = 'light' | 'dark';

const LS_THEME = 'finshark.theme';

// Read the stored theme. Falls back to OS preference for first-time visitors
// AND for users who previously had 'system' saved (legacy value from when we
// supported three choices). Once we resolve, the concrete value is written back
// so subsequent reads are stable.
function readThemeFromStorage(): Theme {
  if (typeof localStorage === 'undefined') return 'dark';

  const raw = localStorage.getItem(LS_THEME);
  if (raw === 'light' || raw === 'dark') return raw;

  // Either nothing saved, or legacy 'system' value. Resolve from OS.
  const prefersDark =
    typeof window !== 'undefined' &&
    window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

export const useThemeStore = defineStore('theme', () => {
  const theme = ref<Theme>(readThemeFromStorage());

  function applyToDocument(t: Theme) {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', t);
    }
  }

  function setTheme(next: Theme) {
    theme.value = next;
    localStorage.setItem(LS_THEME, next);
    applyToDocument(next);
  }

  function toggle() {
    setTheme(theme.value === 'dark' ? 'light' : 'dark');
  }

  // Keep DOM attribute aligned with the store on any mutation.
  watch(theme, (t) => applyToDocument(t), { immediate: true });

  return { theme, setTheme, toggle };
});
