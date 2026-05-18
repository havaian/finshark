import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './style.css';
import { i18n, applyOverrides, readLangFromStorage } from './i18n';
import { api } from './api/client';

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(i18n);
app.mount('#app');

// Fetch UI overrides for the current language and merge over the static
// locale. Overrides live as JSON files on the backend (backend/locales/) and
// are exposed at GET /api/ui-translations/:lang as a flat {key → value} map.
// Best-effort: failures fall back silently to the bundled defaults — we don't
// want the app to refuse to render if this fetch fails.
//
// Runs AFTER mount so the user sees the static-locale UI immediately rather
// than waiting on the network. Any overridden strings update in place once
// the fetch resolves (vue-i18n's reactive messages handle that).
const initialLang = readLangFromStorage();
api
  .get<Record<string, string>>(`/ui-translations/${initialLang}`)
  .then((res) => applyOverrides(initialLang, res.data))
  .catch(() => {
    /* silent — static defaults remain in effect */
  });
