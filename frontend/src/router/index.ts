import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import HomePage from "../pages/HomePage.vue";
import LoginPage from "../pages/LoginPage.vue";
import AuthCallbackPage from "../pages/AuthCallbackPage.vue";
import DashboardPage from "../pages/DashboardPage.vue";
import LessonPage from "../pages/lesson/LessonPage.vue";
import OnboardingPage from "../pages/OnboardingPage.vue";
import UnsubscribePage from "../pages/UnsubscribePage.vue";
import { useAuthStore } from "../stores/auth.store";

// Lazy imports — these pages are heavy (chart.js for Profile/Progress) or only
// reached by a subset of users (admin). Each becomes its own chunk so the
// initial dashboard load doesn't ship them. Vue Router resolves the promise
// the first time the route is visited.
const ProfilePage = () => import("../pages/ProfilePage.vue");
const PublicProfilePage = () => import("../pages/PublicProfilePage.vue");
const ProgressPage = () => import("../pages/ProgressPage.vue");
const SettingsPage = () => import("../pages/SettingsPage.vue");
const LeaderboardsPage = () => import("../pages/LeaderboardsPage.vue");
const MockStartPage = () => import("../pages/MockStartPage.vue");
const MockBreakdownPage = () => import("../pages/MockBreakdownPage.vue");
const AdminLayout = () => import("../pages/admin/AdminLayout.vue");
const AdminUsersPage = () => import("../pages/admin/AdminUsersPage.vue");
const AdminLocalizationPage = () =>
  import("../pages/admin/AdminLocalizationPage.vue");
const AdminContentPage = () => import("../pages/admin/AdminContentPage.vue");
const AdminWhitelistPage = () =>
  import("../pages/admin/AdminWhitelistPage.vue");
const TwoFactorVerifyPage = () => import("../pages/TwoFactorVerifyPage.vue");
const TwoFactorSetupPage = () => import("../pages/TwoFactorSetupPage.vue");

// Route meta flags:
//   requiresAuth          — redirect to /login if not authed
//   requiresAdmin         — must be admin (implies requiresAuth)
//   guestOnly             — redirect to /dashboard if already authed (login/register pages)
//   skipsOnboardingGuard  — exempt from the onboarding-required redirect
//                           (the wizard itself, logout, unsubscribe-via-token)
const routes: RouteRecordRaw[] = [
  { path: "/", name: "home", component: HomePage },
  {
    path: "/login",
    name: "login",
    component: LoginPage,
    meta: { guestOnly: true },
  },
  {
    path: "/auth/callback",
    name: "auth-callback",
    component: AuthCallbackPage,
    meta: { skipsOnboardingGuard: true },
  },
  {
    // The admin 2FA challenge page. Reached via redirect from the Google
    // callback when the user is an admin with totp_secret set. No auth
    // required (the user isn't authenticated yet — that's the whole point),
    // but skipsOnboardingGuard so the onboarding redirect doesn't fire.
    path: "/2fa-verify",
    name: "two-factor-verify",
    component: TwoFactorVerifyPage,
    meta: { skipsOnboardingGuard: true },
  },
  {
    path: "/unsubscribe",
    name: "unsubscribe",
    component: UnsubscribePage,
    meta: { skipsOnboardingGuard: true },
  },
  {
    path: "/onboarding",
    name: "onboarding",
    component: OnboardingPage,
    meta: { requiresAuth: true, skipsOnboardingGuard: true },
  },
  {
    path: "/dashboard",
    name: "dashboard",
    component: DashboardPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/progress",
    name: "progress",
    component: ProgressPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/profile",
    name: "profile",
    component: ProfilePage,
    meta: { requiresAuth: true },
  },
  {
    // Public profile view — clicking a user on the leaderboard lands here.
    // Auth required: the backend endpoint requires auth, so unauthed visitors
    // would hit a wall anyway. requiresAuth bounces them through /login first.
    path: "/users/:id",
    name: "public-profile",
    component: PublicProfilePage,
    meta: { requiresAuth: true },
  },
  {
    path: "/settings",
    name: "settings",
    component: SettingsPage,
    meta: { requiresAuth: true },
  },
  {
    // 2FA enrollment flow. Admin-only: requiresAdmin enforces it server-
    // side via the route guard below, on top of the AdminGuard on every
    // /me/2fa/* endpoint. Non-admins reaching this URL get redirected.
    path: "/settings/2fa",
    name: "two-factor-setup",
    component: TwoFactorSetupPage,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: "/leaderboards",
    name: "leaderboards",
    component: LeaderboardsPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/mocks/start",
    name: "mock-start",
    component: MockStartPage,
    meta: { requiresAuth: true },
  },
  {
    // The breakdown route shares its session_id with the lesson route — same
    // session row in the DB. We use a different path so users can bookmark
    // their result. Navigation between lesson → breakdown is via router.replace.
    path: "/mocks/:session_id/breakdown",
    name: "mock-breakdown",
    component: MockBreakdownPage,
    meta: { requiresAuth: true },
  },
  {
    path: "/lesson/:session_id",
    name: "lesson",
    component: LessonPage,
    meta: { requiresAuth: true },
  },

  // Admin — nested under AdminLayout. The layout provides the sidebar/topbar;
  // each child page renders into its <RouterView/>.
  {
    path: "/admin",
    component: AdminLayout,
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      // Default admin landing — unified content browser is the daily workflow.
      { path: "", redirect: "/admin/content" },
      { path: "content", name: "admin-content", component: AdminContentPage },
      { path: "users", name: "admin-users", component: AdminUsersPage },
      {
        path: "localization",
        name: "admin-localization",
        component: AdminLocalizationPage,
      },
      {
        path: "whitelist",
        name: "admin-whitelist",
        component: AdminWhitelistPage,
      },
      // Legacy redirects: any bookmarked /admin/papers, /admin/papers/:id/los,
      // /admin/los/:id/questions now bounce to the unified content browser.
      // Kept for one release so external links/admin muscle memory still work.
      { path: "papers", redirect: "/admin/content" },
      { path: "papers/:paper_id/los", redirect: "/admin/content" },
      { path: "los/:lo_id/questions", redirect: "/admin/content" },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  if (
    (to.meta.requiresAuth || to.meta.requiresAdmin) &&
    !auth.isAuthenticated
  ) {
    return { name: "login", query: { next: to.fullPath } };
  }

  if (to.meta.requiresAdmin && !auth.user?.is_admin) {
    // Authed but not admin — bounce to dashboard, no useful page to send to.
    return { name: "dashboard" };
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: "dashboard" };
  }

  // Onboarding gate: authed users whose onboarded_at is null get pushed to
  // the wizard. Routes flagged skipsOnboardingGuard are exempt (the wizard
  // itself, auth callback, unsubscribe). The onboarded_at check uses the
  // auth store; if the store is hydrated from localStorage with a stale
  // PublicUser that predates the migration, onboarded_at may be undefined —
  // we treat that as "needs onboarding" so a one-time redirect happens.
  if (
    auth.isAuthenticated &&
    !auth.user?.onboarded_at &&
    !to.meta.skipsOnboardingGuard
  ) {
    return { name: "onboarding" };
  }

  return true;
});

export default router;
