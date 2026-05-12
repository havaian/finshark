import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import HomePage from '../pages/HomePage.vue';
import LoginPage from '../pages/LoginPage.vue';
import RegisterPage from '../pages/RegisterPage.vue';
import DashboardPage from '../pages/DashboardPage.vue';
import ProgressPage from '../pages/ProgressPage.vue';
import LessonPage from '../pages/lesson/LessonPage.vue';
import UnsubscribePage from '../pages/UnsubscribePage.vue';
import AdminPapersPage from '../pages/admin/AdminPapersPage.vue';
import AdminLosPage from '../pages/admin/AdminLosPage.vue';
import AdminQuestionsPage from '../pages/admin/AdminQuestionsPage.vue';
import { useAuthStore } from '../stores/auth.store';

// Route meta flags:
//   requiresAuth  — redirect to /login if not authed
//   requiresAdmin — must be admin (implies requiresAuth)
//   guestOnly     — redirect to /dashboard if already authed (login/register pages)
const routes: RouteRecordRaw[] = [
  { path: '/', name: 'home', component: HomePage },
  { path: '/login', name: 'login', component: LoginPage, meta: { guestOnly: true } },
  { path: '/register', name: 'register', component: RegisterPage, meta: { guestOnly: true } },
  { path: '/unsubscribe', name: 'unsubscribe', component: UnsubscribePage },
  { path: '/dashboard', name: 'dashboard', component: DashboardPage, meta: { requiresAuth: true } },
  { path: '/progress', name: 'progress', component: ProgressPage, meta: { requiresAuth: true } },
  {
    path: '/lesson/:session_id',
    name: 'lesson',
    component: LessonPage,
    meta: { requiresAuth: true },
  },

  // Admin
  {
    path: '/admin/papers',
    name: 'admin-papers',
    component: AdminPapersPage,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/papers/:paper_id/los',
    name: 'admin-los',
    component: AdminLosPage,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
  {
    path: '/admin/los/:lo_id/questions',
    name: 'admin-questions',
    component: AdminQuestionsPage,
    meta: { requiresAuth: true, requiresAdmin: true },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const auth = useAuthStore();

  if ((to.meta.requiresAuth || to.meta.requiresAdmin) && !auth.isAuthenticated) {
    return { name: 'login', query: { next: to.fullPath } };
  }

  if (to.meta.requiresAdmin && !auth.user?.is_admin) {
    // Authed but not admin — bounce to dashboard, no useful page to send to.
    return { name: 'dashboard' };
  }

  if (to.meta.guestOnly && auth.isAuthenticated) {
    return { name: 'dashboard' };
  }

  return true;
});

export default router;
