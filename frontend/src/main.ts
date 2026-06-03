import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import "./style.css";
import { i18n, applyOverrides, readLangFromStorage } from "./i18n";
import { api } from "./api/client";
import { useEntitlementStore } from "./stores/entitlement.store";

const app = createApp(App);
app.use(createPinia());
app.use(router);
app.use(i18n);
app.mount("#app");

// Entitlement bootstrap. If the user has a stored access token (i.e. they're
// hot-reloading the SPA already signed in), pull /me/entitlement so chrome
// chips have data on first paint instead of after the dashboard mounts.
// Best-effort: 401 is handled by the axios interceptor (refresh + retry or
// forced-logout). Any other failure falls through silently - the store stays
// empty and UI components hide their quota chips.
//
// The cheap LS_ACCESS check avoids a 401 hit when the user has never signed
// in. Bare visitors (LoginPage) skip this entirely.
if (localStorage.getItem("finshark.access_token")) {
  void useEntitlementStore().fetch();
}

// Fetch UI overrides for the current language and merge over the static
// locale. Overrides live as JSON files on the backend (backend/locales/) and
// are exposed at GET /api/ui-translations/:lang as a flat {key → value} map.
// Best-effort: failures fall back silently to the bundled defaults - we don't
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
    /* silent - static defaults remain in effect */
  });
