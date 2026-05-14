import {
  createRouter,
  createWebHistory,
  type RouteRecordRaw,
} from "vue-router";
import HomePage from "../pages/HomePage.vue";
import LoginPage from "../pages/LoginPage.vue";
import AuthCallbackPage from "../pages/AuthCallbackPage.vue";
import DashboardPage from "../pages/DashboardPage.vue";
import ProgressPage from "../pages/ProgressPage.vue";
import ProfilePage from "../pages/ProfilePage.vue";
import SettingsPage from "../pages/SettingsPage.vue";
import LessonPage from "../pages/lesson/LessonPage.vue";
import UnsubscribePage from "../pages/UnsubscribePage.vue";
import AdminLayout from "../pages/admin/AdminLayout.vue";
import AdminUsersPage from "../pages/admin/AdminUsersPage.vue";
import AdminPapersPage from "../pages/admin/AdminPapersPage.vue";
import AdminLosPage from "../pages/admin/AdminLosPage.vue";
import AdminQuestionsPage from "../pages/admin/AdminQuestionsPage.vue";
import AdminLocalizationPage from "../pages/admin/AdminLocalizationPage.vue";
import { useAuthStore } from "../stores/auth.store";

// Route meta flags:
//   requiresAuth  — redirect to /login if not authed
//   requiresAdmin — must be admin (implies requiresAuth)
//   guestOnly     — redirect to /dashboard if already authed (login/register pages)
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
  },
  { path: "/unsubscribe", name: "unsubscribe", component: UnsubscribePage },
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
      // Default admin landing — go straight to users since that's the most common admin task.
      { path: "", redirect: "/admin/users" },
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

  return true;
});

export default router;
