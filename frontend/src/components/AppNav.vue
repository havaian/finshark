<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import ThemeSwitch from './ThemeSwitch.vue';

// Top-of-page horizontal navigation, used on all authed user pages
// (Dashboard, Profile, Progress, Settings, Leaderboards, Mocks).
//
// Layout: [brand] [primary nav links] [stats pills] [right: theme · admin · profile · sign out]
//
// Active link styling: each link is active when route.path starts with its
// `to`. Dashboard is the special case (only active on exact match) because
// every other path would otherwise also match '/'.
//
// Admin entry: when user is admin, the admin button gets a vivid accent
// styling so it's visible at a glance — moved here from the dashboard's
// in-content button so it's discoverable from any page.
//
// Mobile (≤720px): the desktop row is hidden via CSS and replaced by a
// compact top bar (brand + hamburger) plus a right-side slide-in drawer
// containing every action. Both the desktop row and the mobile bar live
// in the same template — CSS swaps which is visible — so we keep a single
// source of truth for nav items. Drawer state is local to this component;
// it auto-closes on route changes, ESC, and backdrop click. Body scroll
// is locked while open so the page underneath doesn't drift on iOS.

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

interface NavItem { to: string; labelKey: string; exact?: boolean }

const navItems = computed<NavItem[]>(() => [
  { to: '/dashboard', labelKey: 'nav.dashboard', exact: true },
  { to: '/progress', labelKey: 'nav.progress' },
  { to: '/leaderboards', labelKey: 'nav.leaderboards' },
  { to: '/mocks/start', labelKey: 'nav.mocks' },
]);

function isActive(item: NavItem): boolean {
  if (item.exact) return route.path === item.to;
  return route.path === item.to || route.path.startsWith(item.to + '/');
}

function onLogout() {
  auth.logout();
  router.push({ name: 'login' });
}

// ---- Mobile drawer ----
// Closed by default. On desktop the drawer markup still exists in the DOM but
// is hidden via the same media query that hides the hamburger button.
const drawerOpen = ref(false);

function openDrawer() { drawerOpen.value = true; }
function closeDrawer() { drawerOpen.value = false; }

// Close on route change — tapping a link inside the drawer dismisses it.
watch(() => route.fullPath, () => { drawerOpen.value = false; });

// ESC to close. Bound at the window level so focus can be anywhere.
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && drawerOpen.value) drawerOpen.value = false;
}
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', onKey);
  onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
}

// Body scroll lock while drawer open. We toggle a class on <body> rather
// than touching inline styles directly so any other code (modals) can use
// the same lock without fighting us.
watch(drawerOpen, (open) => {
  if (typeof document === 'undefined') return;
  document.body.classList.toggle('body-scroll-lock', open);
});
onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.body.classList.remove('body-scroll-lock');
  }
});

function onLogoutMobile() {
  drawerOpen.value = false;
  onLogout();
}
</script>

<template>
  <nav class="app-nav">
    <!-- Desktop row. Hidden below 720px via CSS. -->
    <div class="app-nav-inner">
      <!-- Left: brand + primary nav -->
      <div class="app-nav-left">
        <RouterLink to="/dashboard" class="brand app-nav-brand">
          <div class="brand-mark"></div>
          <span>Finshark</span>
        </RouterLink>

        <div class="app-nav-links">
          <RouterLink v-for="item in navItems" :key="item.to" :to="item.to"
            :class="['app-nav-link', { active: isActive(item) }]">
            {{ t(item.labelKey) }}
          </RouterLink>
        </div>
      </div>

      <!-- Right: stats + meta -->
      <div class="app-nav-right">
        <!-- Stats pills: streak + XP. Cheap visibility into progress on every
             page so the user always sees their numbers. Hidden when no user
             yet to avoid layout jitter during fetchMe. Hovering a pill pops a
             small CSS tooltip explaining what each icon means — useful for new
             users who haven't seen the dashboard yet. -->
        <div v-if="auth.user" class="app-nav-stats">
          <span class="app-nav-stat" :data-tip="t('nav.stat_streak_tip')">
            <span class="app-nav-stat-icon">🔥</span>
            <span class="app-nav-stat-val">{{ auth.user.streak_count }}</span>
          </span>
          <span class="app-nav-stat" :data-tip="t('nav.stat_xp_tip')">
            <span class="app-nav-stat-icon">✦</span>
            <span class="app-nav-stat-val">{{ auth.user.xp }}</span>
          </span>
        </div>

        <ThemeSwitch />

        <!-- Admin entry: vivid styling so it stands out. Only rendered for admins. -->
        <RouterLink v-if="auth.user?.is_admin" to="/admin" class="app-nav-admin-btn">
          {{ t('nav.admin_panel') }}
        </RouterLink>

        <RouterLink to="/profile" class="app-nav-profile" :title="auth.user?.display_name ?? ''">
          <span class="app-nav-avatar" aria-hidden="true">
            {{ auth.user?.display_name?.slice(0, 1).toUpperCase() ?? '?' }}
          </span>
        </RouterLink>

        <RouterLink to="/settings" class="app-nav-icon-btn" :title="t('nav.settings')">⚙</RouterLink>

        <button class="btn btn-ghost btn-sm" @click="onLogout">
          {{ t('common.sign_out') }}
        </button>
      </div>
    </div>

    <!-- Mobile bar. Hidden above 720px via CSS. Brand on the left, stats pills
         (compact) in the middle so they're still glanceable without opening
         the drawer, hamburger on the right. -->
    <div class="app-nav-mobile">
      <RouterLink to="/dashboard" class="brand app-nav-brand app-nav-mobile-brand">
        <div class="brand-mark"></div>
        <span>Finshark</span>
      </RouterLink>

      <div v-if="auth.user" class="app-nav-mobile-stats">
        <span class="app-nav-stat">
          <span class="app-nav-stat-icon">🔥</span>
          <span class="app-nav-stat-val">{{ auth.user.streak_count }}</span>
        </span>
        <span class="app-nav-stat">
          <span class="app-nav-stat-icon">✦</span>
          <span class="app-nav-stat-val">{{ auth.user.xp }}</span>
        </span>
      </div>

      <button type="button" class="app-nav-burger" :aria-label="t('nav.open_menu')" :aria-expanded="drawerOpen"
        @click="openDrawer">
        <!-- Three-line burger. SVG so the lines stay crisp at any DPI. -->
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round" aria-hidden="true">
          <path d="M3 6h18" />
          <path d="M3 12h18" />
          <path d="M3 18h18" />
        </svg>
      </button>
    </div>

    <!-- Drawer. Always in DOM; visibility toggled via class. The wrapper
         catches backdrop clicks; the panel stops propagation so clicks inside
         it don't dismiss. -->
    <div :class="['app-nav-drawer-root', { open: drawerOpen }]" aria-hidden="true">
      <div class="app-nav-drawer-backdrop" @click="closeDrawer"></div>
      <aside class="app-nav-drawer" role="dialog" :aria-modal="drawerOpen" :aria-label="t('nav.menu')" @click.stop>
        <header class="app-nav-drawer-head">
          <RouterLink to="/profile" class="app-nav-drawer-me" @click="closeDrawer">
            <span class="app-nav-avatar" aria-hidden="true">
              {{ auth.user?.display_name?.slice(0, 1).toUpperCase() ?? '?' }}
            </span>
            <span class="app-nav-drawer-me-text">
              <span class="app-nav-drawer-me-name">{{ auth.user?.display_name ?? '' }}</span>
              <span class="app-nav-drawer-me-sub dim text-xs">{{ t('nav.profile') }}</span>
            </span>
          </RouterLink>
          <button type="button" class="app-nav-drawer-close" :aria-label="t('common.close')"
            @click="closeDrawer">✕</button>
        </header>

        <!-- Stats: visible inside the drawer so the user can read them when
             the compact bar shows them too (redundant on small phones where
             the compact bar shows the same numbers, but useful when stats
             would overflow). -->
        <div v-if="auth.user" class="app-nav-drawer-stats">
          <div class="app-nav-drawer-stat">
            <span class="app-nav-stat-icon">🔥</span>
            <span class="app-nav-drawer-stat-val">{{ auth.user.streak_count }}</span>
            <span class="app-nav-drawer-stat-lbl dim text-xs">{{ t('nav.stat_streak_tip') }}</span>
          </div>
          <div class="app-nav-drawer-stat">
            <span class="app-nav-stat-icon">✦</span>
            <span class="app-nav-drawer-stat-val">{{ auth.user.xp }}</span>
            <span class="app-nav-drawer-stat-lbl dim text-xs">{{ t('nav.stat_xp_tip') }}</span>
          </div>
        </div>

        <!-- Primary nav links — same items as desktop, full-width rows so they
             have a comfortable tap target on phones. -->
        <nav class="app-nav-drawer-links">
          <RouterLink v-for="item in navItems" :key="item.to" :to="item.to"
            :class="['app-nav-drawer-link', { active: isActive(item) }]" @click="closeDrawer">
            {{ t(item.labelKey) }}
          </RouterLink>

          <!-- Admin entry: same vivid styling as desktop, full-width here. -->
          <RouterLink v-if="auth.user?.is_admin" to="/admin" class="app-nav-drawer-link app-nav-drawer-link-admin"
            @click="closeDrawer">
            {{ t('nav.admin_panel') }}
          </RouterLink>
        </nav>

        <!-- Secondary actions: settings + theme. -->
        <div class="app-nav-drawer-section">
          <RouterLink to="/settings" class="app-nav-drawer-link" @click="closeDrawer">
            <span aria-hidden="true" style="margin-right: 10px;">⚙</span>{{ t('nav.settings') }}
          </RouterLink>
          <div class="app-nav-drawer-themerow">
            <span class="dim text-sm">{{ t('nav.theme') }}</span>
            <ThemeSwitch />
          </div>
        </div>

        <!-- Sign out pinned to the bottom for "destructive" actions. -->
        <div class="app-nav-drawer-foot">
          <button class="btn btn-ghost btn-block" @click="onLogoutMobile">
            {{ t('common.sign_out') }}
          </button>
        </div>
      </aside>
    </div>
  </nav>
</template>