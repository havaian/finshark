<script setup lang="ts">
import { computed } from 'vue';
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
</script>

<template>
  <nav class="app-nav">
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
  </nav>
</template>
