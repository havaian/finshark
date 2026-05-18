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
const ProfilePage         = () => import("../pages/ProfilePage.vue");
const ProgressPage        = () => import("../pages/ProgressPage.vue");
const SettingsPage        = () => import("../pages/SettingsPage.vue");
const LeaderboardsPage    = () => import("../pages/LeaderboardsPage.vue");
const MockStartPage       = () => import("../pages/MockStartPage.vue");
const MockBreakdownPage   = () => import("../pages/MockBreakdownPage.vue");
const AdminLayout         = () => import("../pages/admin/AdminLayout.vue");
const AdminUsersPage      = () => import("../pages/admin/AdminUsersPage.vue");
const AdminPapersPage     = () => import("../pages/admin/AdminPapersPage.vue");
const AdminLosPage        = () => import("../pages/admin/AdminLosPage.vue");
const AdminQuestionsPage  = () => import("../pages/admin/AdminQuestionsPage.vue");
const AdminLocalizationPage = () => import("../pages/admin/AdminLocalizationPage.vue");
const AdminContentPage    = () => import("../pages/admin/AdminContentPage.vue");

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
  { path: "/unsubscribe", name: "unsubscribe", component: UnsubscribePage, meta: { skipsOnboardingGuard: true } },
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
    path: "/settings",
    name: "settings",
    component: SettingsPage,
    meta: { requiresAuth: true },
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
      { path: "papers", name: "admin-papers", component: AdminPapersPage },
      {
        path: "papers/:paper_id/los",
        name: "admin-los",
        component: AdminLosPage,
      },
      {
        path: "los/:lo_id/questions",
        name: "admin-questions",
        component: AdminQuestionsPage,
      },
      {
        path: "localization",
        name: "admin-localization",
        component: AdminLocalizationPage,
      },
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
