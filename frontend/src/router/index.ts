import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import { h, defineComponent } from "vue";
import { RouterView } from "vue-router";
import HomePage from "../pages/HomePage.vue";
import LoginPage from "../pages/LoginPage.vue";
import AuthCallbackPage from "../pages/AuthCallbackPage.vue";
import DashboardPage from "../pages/DashboardPage.vue";
import LessonPage from "../pages/lesson/LessonPage.vue";
import OnboardingPage from "../pages/OnboardingPage.vue";
import UnsubscribePage from "../pages/UnsubscribePage.vue";
import { useAuthStore } from "../stores/auth.store";
import { useLocaleStore } from "../stores/locale.store";
import { SUPPORTED_LANGS, DEFAULT_LANG, type Lang } from "../i18n";

// Tiny pass-through component that just renders a <RouterView/>. Used as the
// component for the /:lang(en|ru) parent route so its children render inside
// it. We can't use a string template here (vue-router type doesn't accept it)
// so we render-function it.
const LangLayout = defineComponent({
  name: "LangLayout",
  render: () => h(RouterView),
});

// Lazy imports - these pages are heavy (chart.js for Profile/Progress) or only
// reached by a subset of users (admin). Each becomes its own chunk so the
// initial dashboard load doesn't ship them. Vue Router resolves the promise
// the first time the route is visited.
const ProfilePage = () => import("../pages/ProfilePage.vue");
const PublicProfilePage = () => import("../pages/PublicProfilePage.vue");
const ProgressPage = () => import("../pages/ProgressPage.vue");
const SettingsPage = () => import("../pages/SettingsPage.vue");
const SubscriptionPage = () => import("../pages/SubscriptionPage.vue");
const ClickReturnPage = () => import("../pages/ClickReturnPage.vue");
const LeaderboardsPage = () => import("../pages/LeaderboardsPage.vue");
const MockStartPage = () => import("../pages/MockStartPage.vue");
const MockBreakdownPage = () => import("../pages/MockBreakdownPage.vue");
const MockReviewPage = () => import("../pages/MockReviewPage.vue");
const AdminLayout = () => import("../pages/admin/AdminLayout.vue");
const AdminOverviewPage = () =>
  import("../pages/admin/AdminOverviewPage.vue");
const AdminUsersPage = () => import("../pages/admin/AdminUsersPage.vue");
const AdminUserDetailPage = () =>
  import("../pages/admin/AdminUserDetailPage.vue");
const AdminLocalizationPage = () =>
  import("../pages/admin/AdminLocalizationPage.vue");
const AdminContentPage = () => import("../pages/admin/AdminContentPage.vue");
const AdminWhitelistPage = () =>
  import("../pages/admin/AdminWhitelistPage.vue");
const AdminPromocodesPage = () =>
  import("../pages/admin/AdminPromocodesPage.vue");
const AdminSubscriptionsPage = () =>
  import("../pages/admin/AdminSubscriptionsPage.vue");
const AdminPaymentsPage = () =>
  import("../pages/admin/AdminPaymentsPage.vue");
const AdminEmailTemplatesPage = () =>
  import("../pages/admin/AdminEmailTemplatesPage.vue");
const TwoFactorVerifyPage = () => import("../pages/TwoFactorVerifyPage.vue");
const TwoFactorSetupPage = () => import("../pages/TwoFactorSetupPage.vue");
const TwoFactorElevatePage = () =>
  import("../pages/TwoFactorElevatePage.vue");

// Route meta flags:
//   requiresAuth          - redirect to /login if not authed
//   requiresAdmin         - must be admin (implies requiresAuth)
//   guestOnly             - redirect to /dashboard if already authed (login/register pages)
//   skipsOnboardingGuard  - exempt from the onboarding-required redirect
//                           (the wizard itself, logout, unsubscribe-via-token)
//
// Localized routes:
//   All app routes live under a /:lang(en|ru) parent so URLs include the
//   active language (e.g. /ru/dashboard, /en/profile). Two exceptions live
//   at the document root because their URLs are fixed by external systems
//   that can't carry a lang prefix:
//     - /auth/callback  - registered with Google OAuth as the redirect URI
//     - /unsubscribe    - emailed to users from the server, no session context
//   Bare URLs (e.g. /dashboard, /2fa-verify, /) fall through to the catch-all
//   at the bottom of this file, which injects the active-lang prefix
//   (e.g. /en/2fa-verify) while preserving the URL fragment.
//
//   The :lang regex (en|ru) means unknown prefixes like /jp/dashboard do NOT
//   match this branch - they fall through to the * catch-all at the bottom,
//   which redirects to the home page in the default lang. Add new languages
//   by appending to SUPPORTED_LANGS in i18n/index.ts AND extending the regex
//   below (kept in sync manually because Vue Router needs a literal).
const routes: RouteRecordRaw[] = [
  // External-entry routes (no lang prefix - see comment above).
  {
    path: "/auth/callback",
    name: "auth-callback",
    component: AuthCallbackPage,
    meta: { skipsOnboardingGuard: true, titleKey: "page_titles.auth_callback" },
  },
  {
    path: "/unsubscribe",
    name: "unsubscribe",
    component: UnsubscribePage,
    meta: { skipsOnboardingGuard: true, titleKey: "page_titles.unsubscribe" },
  },

  // Localized tree. Everything else hangs off here.
  {
    path: "/:lang(en|ru|uz)",
    component: LangLayout,
    children: [
      {
        path: "",
        name: "home",
        component: HomePage,
        meta: { titleKey: "page_titles.home" },
      },
      {
        path: "login",
        name: "login",
        component: LoginPage,
        meta: { guestOnly: true, titleKey: "page_titles.login" },
      },
      {
        // The admin 2FA challenge page. Reached via redirect from the Google
        // callback when the user is an admin with totp_secret set. No auth
        // required (the user isn't authenticated yet - that's the whole point),
        // but skipsOnboardingGuard so the onboarding redirect doesn't fire.
        path: "2fa-verify",
        name: "two-factor-verify",
        component: TwoFactorVerifyPage,
        meta: { skipsOnboardingGuard: true, titleKey: "page_titles.two_factor_verify" },
      },
      {
        path: "onboarding",
        name: "onboarding",
        component: OnboardingPage,
        meta: { requiresAuth: true, skipsOnboardingGuard: true, titleKey: "page_titles.onboarding" },
      },
      {
        path: "dashboard",
        name: "dashboard",
        component: DashboardPage,
        meta: { requiresAuth: true, titleKey: "page_titles.dashboard" },
      },
      {
        path: "progress",
        name: "progress",
        component: ProgressPage,
        meta: { requiresAuth: true, titleKey: "page_titles.progress" },
      },
      {
        path: "profile",
        name: "profile",
        component: ProfilePage,
        meta: { requiresAuth: true, titleKey: "page_titles.profile" },
      },
      {
        // Public profile view - clicking a user on the leaderboard lands here.
        // Auth required: the backend endpoint requires auth, so unauthed visitors
        // would hit a wall anyway. requiresAuth bounces them through /login first.
        path: "users/:id",
        name: "public-profile",
        component: PublicProfilePage,
        meta: { requiresAuth: true, titleKey: "page_titles.public_profile" },
      },
      {
        path: "settings",
        name: "settings",
        component: SettingsPage,
        meta: { requiresAuth: true, titleKey: "page_titles.settings" },
      },
      {
        // Dedicated billing surface (current plan, redeem, billing history).
        // Reached from links in Settings, Profile, and the burger drawer.
        path: "subscription",
        name: "subscription",
        component: SubscriptionPage,
        meta: { requiresAuth: true, titleKey: "page_titles.subscription" },
      },
      {
        // Landing route for Click's return_url after a redirect payment. It
        // polls the order until Click's Complete callback reaches our server,
        // because the browser redirect and that callback arrive in no
        // guaranteed order. The checkout.js overlay path never redirects, so it
        // waits inline on the subscription page instead - both share the same
        // polling helper in api/click.api.ts.
        //
        // Kept inside the /:lang tree: the backend builds return_url from
        // APP_PUBLIC_URL with a bare /subscription/click/return path, and the
        // router's bare-URL guard prefixes it with the user's language on
        // arrival.
        path: "subscription/click/return",
        name: "click-return",
        component: ClickReturnPage,
        meta: { requiresAuth: true, titleKey: "page_titles.click_return" },
      },
      {
        // 2FA enrollment flow. Admin-only: requiresAdmin enforces it server-
        // side via the route guard below, on top of the AdminGuard on every
        // /me/2fa/* endpoint. Non-admins reaching this URL get redirected.
        path: "settings/2fa",
        name: "two-factor-setup",
        component: TwoFactorSetupPage,
        meta: { requiresAuth: true, requiresAdmin: true, titleKey: "page_titles.two_factor_setup" },
      },
      {
        // Admin-area 2FA elevation challenge. An enrolled admin whose session
        // isn't yet elevated is sent here by the router guard before any
        // /admin/* route. requiresAdmin keeps non-admins out; the guard's
        // name-exemption keeps this page from redirecting to itself. On
        // success it stores the elevated tokens and returns to ?next.
        path: "admin/verify",
        name: "two-factor-elevate",
        component: TwoFactorElevatePage,
        meta: { requiresAuth: true, requiresAdmin: true, titleKey: "page_titles.two_factor_elevate" },
      },
      {
        path: "leaderboards",
        name: "leaderboards",
        component: LeaderboardsPage,
        meta: { requiresAuth: true, titleKey: "page_titles.leaderboards" },
      },
      {
        path: "mocks/start",
        name: "mock-start",
        component: MockStartPage,
        meta: { requiresAuth: true, titleKey: "page_titles.mock_start" },
      },
      {
        // The breakdown route shares its session_id with the lesson route - same
        // session row in the DB. We use a different path so users can bookmark
        // their result. Navigation between lesson → breakdown is via router.replace.
        path: "mocks/:session_id/breakdown",
        name: "mock-breakdown",
        component: MockBreakdownPage,
        meta: { requiresAuth: true, titleKey: "page_titles.mock_breakdown" },
      },
      {
        // Per-question review of a completed mock - distinct from the practice
        // lesson the old "Review answers" button kicked off. Bookmarkable by
        // session_id so the user can come back to the walkthrough later.
        path: "mocks/:session_id/review",
        name: "mock-review",
        component: MockReviewPage,
        meta: { requiresAuth: true, titleKey: "page_titles.mock_review" },
      },
      {
        path: "lesson/:session_id",
        name: "lesson",
        component: LessonPage,
        meta: { requiresAuth: true, titleKey: "page_titles.lesson" },
      },

      // Admin - nested under AdminLayout. The layout provides the sidebar/topbar;
      // each child page renders into its <RouterView/>.
      {
        path: "admin",
        component: AdminLayout,
        meta: { requiresAuth: true, requiresAdmin: true },
        children: [
          // Default admin landing - overview dashboard with at-a-glance counts.
          // Use a name-based redirect so the :lang param is preserved automatically;
          // a string redirect like '/admin/overview' would lose the lang prefix.
          { path: "", redirect: { name: "admin-overview" } },
          {
            path: "overview",
            name: "admin-overview",
            component: AdminOverviewPage,
            meta: { titleKey: "page_titles.admin_overview" },
          },
          {
            path: "content",
            name: "admin-content",
            component: AdminContentPage,
            meta: { titleKey: "page_titles.admin_content" },
          },
          {
            path: "users",
            name: "admin-users",
            component: AdminUsersPage,
            meta: { titleKey: "page_titles.admin_users" },
          },
          {
            // Single-user admin detail. Deep-linkable from anywhere
            // (promocode redemption modal, support tickets, etc).
            path: "users/:user_id",
            name: "admin-user-detail",
            component: AdminUserDetailPage,
            meta: { titleKey: "page_titles.admin_user_detail" },
          },
          {
            path: "localization",
            name: "admin-localization",
            component: AdminLocalizationPage,
            meta: { titleKey: "page_titles.admin_localization" },
          },
          {
            path: "whitelist",
            name: "admin-whitelist",
            component: AdminWhitelistPage,
            meta: { titleKey: "page_titles.admin_whitelist" },
          },
          {
            path: "promocodes",
            name: "admin-promocodes",
            component: AdminPromocodesPage,
            meta: { titleKey: "page_titles.admin_promocodes" },
          },
          {
            path: "subscriptions",
            name: "admin-subscriptions",
            component: AdminSubscriptionsPage,
            meta: { titleKey: "page_titles.admin_subscriptions" },
          },
          {
            path: "payments",
            name: "admin-payments",
            component: AdminPaymentsPage,
            meta: { titleKey: "page_titles.admin_payments" },
          },
          {
            path: "email-templates",
            name: "admin-email-templates",
            component: AdminEmailTemplatesPage,
            meta: { titleKey: "page_titles.admin_email_templates" },
          },
          // Legacy redirects: any bookmarked /admin/papers, /admin/papers/:id/los,
          // /admin/los/:id/questions now bounce to the unified content browser.
          // Kept for one release so external links/admin muscle memory still work.
          { path: "papers", redirect: { name: "admin-content" } },
          {
            path: "papers/:paper_id/los",
            redirect: { name: "admin-content" },
          },
          {
            path: "los/:lo_id/questions",
            redirect: { name: "admin-content" },
          },
        ],
      },
    ],
  },

  // Catch-all for unmatched URLs. Two cases land here:
  //   1) Bare app paths like /2fa-verify or /dashboard - no lang prefix.
  //      These come from external entry points (the Google OAuth callback
  //      redirects to /2fa-verify#... when 2FA is required). We inject the
  //      preferred lang and preserve the path so the user lands on the right
  //      page. Vue Router merges to.query/to.hash into the redirect target
  //      automatically, so the URL fragment carrying pending_2fa_token survives.
  //   2) Unknown lang prefixes like /jp/anything - send to home in default lang.
  //
  // Note: route-level `redirect` resolves BEFORE beforeEach guards in vue-router 4,
  // so the bare-URL handling has to live here rather than in the guard.
  {
    path: "/:pathMatch(.*)*",
    name: "not-found",
    redirect: (to) => {
      if (!BARE_PATHS.has(to.path) && !hasLangPrefix(to.path)) {
        const lang = preferredLang();
        const newPath = to.path === "/" ? `/${lang}` : `/${lang}${to.path}`;
        return { path: newPath };
      }
      return { path: `/${DEFAULT_LANG}` };
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Paths that intentionally stay outside the /:lang prefix tree. The bare-URL
// guard below uses this so it doesn't try to prefix them.
const BARE_PATHS = new Set(["/auth/callback", "/unsubscribe"]);

// True if `path` starts with a valid lang prefix (e.g. /ru, /ru/, /en/x).
function hasLangPrefix(path: string): boolean {
  for (const l of SUPPORTED_LANGS) {
    if (path === `/${l}` || path.startsWith(`/${l}/`)) return true;
  }
  return false;
}

// Preferred lang for a user with no URL context. Reads the store (which
// initialises from localStorage), then falls back to DEFAULT_LANG. Used by
// the bare-URL redirect.
function preferredLang(): Lang {
  try {
    return useLocaleStore().lang || DEFAULT_LANG;
  } catch {
    // If pinia isn't ready yet (very early navigation), fall back.
    return DEFAULT_LANG;
  }
}

router.beforeEach(async (to) => {
  // 1) Bare-URL redirect. If the path has no lang prefix AND isn't one of
  // the explicit bare paths (auth callback, unsubscribe), bounce to the
  // same path under the user's preferred lang. Done first so subsequent
  // logic always sees a localized URL.
  if (!BARE_PATHS.has(to.path) && !hasLangPrefix(to.path)) {
    const lang = preferredLang();
    // Special-case: bare root becomes /<lang>. Everything else gets the
    // prefix injected, preserving query and hash.
    const newPath = to.path === "/" ? `/${lang}` : `/${lang}${to.path}`;
    return { path: newPath, query: to.query, hash: to.hash, replace: true };
  }

  // 2) Sync the locale store with the URL's :lang param. When a user opens
  // /en/dashboard while their saved preference is 'ru', the URL wins -
  // pasting a localized link should switch the app to that lang.
  //
  // We AWAIT the switch so the target locale's message chunk is loaded before
  // the destination component renders. Without the await, a deep-link to a
  // /ru/... URL would paint a frame of raw i18n keys (or fall back to en)
  // until the chunk arrived. For the common same-lang navigation this resolves
  // synchronously (setLang -> already-loaded locale -> no fetch).
  const urlLang = to.params.lang;
  if (
    typeof urlLang === "string" &&
    (SUPPORTED_LANGS as readonly string[]).includes(urlLang)
  ) {
    const locale = useLocaleStore();
    if (locale.lang !== urlLang) {
      await locale.setLang(urlLang as Lang);
    }
  }

  const auth = useAuthStore();
  // Snapshot the current lang for any name-based redirect below; without it,
  // returning { name: 'login' } would lose the :lang param and Vue Router
  // would synthesize a URL without one - which the bare-URL guard would
  // then bounce, causing a redirect loop. Always pass params: { lang }.
  const lang =
    typeof urlLang === "string" &&
    (SUPPORTED_LANGS as readonly string[]).includes(urlLang)
      ? (urlLang as Lang)
      : preferredLang();

  if (
    (to.meta.requiresAuth || to.meta.requiresAdmin) &&
    !auth.isAuthenticated
  ) {
    return {
      name: "login",
      params: { lang },
      query: { next: to.fullPath },
    };
  }

  if (to.meta.requiresAdmin && !auth.user?.is_admin) {
    // Authed but not admin - bounce to dashboard, no useful page to send to.
    return { name: "dashboard", params: { lang } };
  }

  // Admin-area 2FA, in two stages. The backend enforces both via
  // AdminWith2faGuard (403 with "2FA_SETUP_REQUIRED" / "2FA_ELEVATION_REQUIRED");
  // these client gates make the redirects feel intentional instead of surfacing
  // a raw API error. Login itself NEVER triggers 2FA now - only entering an
  // admin route does.
  //
  // Stage 1 - enrollment. An admin with no TOTP secret must enroll first. We
  // never block /settings/2fa itself (the wizard) or the elevation page. The
  // `force=1` flag lets the wizard explain the redirect.
  if (
    to.meta.requiresAdmin &&
    auth.user?.is_admin &&
    !auth.user?.totp_enabled &&
    to.name !== "two-factor-setup"
  ) {
    return {
      name: "two-factor-setup",
      params: { lang },
      query: { force: "1", next: to.fullPath },
    };
  }

  // Stage 2 - elevation. An enrolled admin whose current session hasn't passed
  // the admin-area 2FA challenge (access token lacks the adm2fa claim) is sent
  // to the elevation page. They land back on `next` after entering a code. The
  // elevation page itself and the enrollment wizard are exempt so we don't loop.
  if (
    to.meta.requiresAdmin &&
    auth.user?.is_admin &&
    auth.user?.totp_enabled &&
    !auth.isAdminElevated &&
    to.name !== "two-factor-elevate" &&
    to.name !== "two-factor-setup"
  ) {
    return {
      name: "two-factor-elevate",
      params: { lang },
      query: { next: to.fullPath },
    };
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: "dashboard", params: { lang } };
  }

  // Onboarding gate: authed users whose onboarded_at is null get pushed to
  // the wizard. Routes flagged skipsOnboardingGuard are exempt (the wizard
  // itself, auth callback, unsubscribe). The onboarded_at check uses the
  // auth store; if the store is hydrated from localStorage with a stale
  // PublicUser that predates the migration, onboarded_at may be undefined -
  // we treat that as "needs onboarding" so a one-time redirect happens.
  if (
    auth.isAuthenticated &&
    !auth.user?.onboarded_at &&
    !to.meta.skipsOnboardingGuard
  ) {
    return { name: "onboarding", params: { lang } };
  }

  return true;
});

// ── Page titles ──────────────────────────────────────────────────────────
// Set document.title from the route's meta.titleKey. Format: "{page} · Finshark",
// with the bare "Finshark" used for the landing page (titleKey 'page_titles.home'
// resolves to the brand alone - no suffix). Routes without a titleKey fall
// back to "Finshark" so we never have a stale title from a previous page.
//
// Updated on TWO events:
//   1) Route change (afterEach) - landing on a new page.
//   2) Locale change (watch on i18n.global.locale) - same page, new lang.
//      Without this, switching lang would keep the title in the old language.
//      Note: the drawer/settings language picker does a full page reload, so
//      in practice (1) covers this case via the boot path; the watcher exists
//      defensively for any future in-place lang change.
import { i18n } from "../i18n";
import { watch } from "vue";
import type { Composer } from "vue-i18n";

const BRAND = "Finshark";
const TITLE_SEPARATOR = " · ";

function resolveTitle(titleKey: string | undefined): string {
  if (!titleKey) return BRAND;
  // Cast once: legacy:false → runtime type is Composer, even if .global is
  // typed as VueI18n by default. Matches the cast pattern in i18n/index.ts.
  const c = i18n.global as unknown as Composer;
  const label = c.t(titleKey);
  // page_titles.home resolves to "Finshark" intentionally - don't double it up.
  if (label === BRAND) return BRAND;
  return `${label}${TITLE_SEPARATOR}${BRAND}`;
}

function updateTitleFromRoute(): void {
  const current = router.currentRoute.value;
  // Walk matched routes back-to-front to find the nearest titleKey. Nested
  // routes (admin children) define their own titleKey; the parent /:lang has
  // none, so the child's wins.
  let titleKey: string | undefined;
  for (let i = current.matched.length - 1; i >= 0; i--) {
    const k = current.matched[i].meta?.titleKey;
    if (typeof k === "string") {
      titleKey = k;
      break;
    }
  }
  if (typeof document !== "undefined") {
    document.title = resolveTitle(titleKey);
  }
}

router.afterEach(() => {
  updateTitleFromRoute();
});

// Locale change: re-resolve the title against the new language.
watch(
  () => (i18n.global as unknown as Composer).locale.value,
  () => {
    updateTitleFromRoute();
  },
);

export default router;
