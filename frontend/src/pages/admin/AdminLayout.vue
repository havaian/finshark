<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../../stores/auth.store';
import { useRoute, useRouter } from 'vue-router';

// Admin shell — sidebar nav + topbar with a "back to dashboard" exit.
// Nested admin routes render in the <RouterView/> below.
//
// Note on "keep the back link too": each admin sub-page still renders its own
// in-content back link (e.g. Questions → LOs) for navigation that doesn't fit
// the top-level sidebar. The sidebar is for switching between admin sections;
// the in-page back link is for hierarchical drilldown.

const { t } = useI18n();
const auth = useAuthStore();
const route = useRoute();
const router = useRouter();

interface NavItem {
  to: string;
  labelKey: string;
  // Match any route whose path starts with one of these prefixes
  // (e.g. /admin/papers/:paper_id/los still highlights "Materials").
  activePrefixes: string[];
}

const navItems = computed<NavItem[]>(() => [
  { to: '/admin/users',        labelKey: 'admin.users.title',        activePrefixes: ['/admin/users'] },
  { to: '/admin/whitelist',    labelKey: 'admin.whitelist.title',    activePrefixes: ['/admin/whitelist'] },
  // Content browser is the primary admin landing for content management.
  // Papers and LOs as separate routes are kept around for structural ops
  // (creating papers, reordering LOs) but the daily workflow is the browser.
  { to: '/admin/content',      labelKey: 'admin.content.title',      activePrefixes: ['/admin/content'] },
  { to: '/admin/papers',       labelKey: 'admin.papers.title',       activePrefixes: ['/admin/papers', '/admin/los'] },
  { to: '/admin/localization', labelKey: 'admin.localization.title', activePrefixes: ['/admin/localization'] },
]);

function isActive(item: NavItem): boolean {
  return item.activePrefixes.some((p) => route.path === p || route.path.startsWith(p + '/'));
}

function onExit() {
  router.push({ name: 'dashboard' });
}
</script>

<template>
  <div class="admin-shell">
    <aside class="admin-sidebar">
      <div class="admin-sidebar-head">
        <div class="brand">
          <div class="brand-mark"></div>
          <span>Finshark</span>
        </div>
        <div class="admin-sidebar-sub">{{ t('admin.panel') }}</div>
      </div>

      <nav class="admin-nav">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          :to="item.to"
          :class="['admin-nav-item', { active: isActive(item) }]"
        >
          {{ t(item.labelKey) }}
        </RouterLink>
      </nav>

      <div class="admin-sidebar-foot">
        <div v-if="auth.user" class="admin-sidebar-me">
          <div class="admin-sidebar-me-name">{{ auth.user.display_name }}</div>
          <div class="admin-sidebar-me-email dim text-xs">{{ auth.user.email }}</div>
        </div>
        <button class="btn btn-ghost btn-block" @click="onExit">{{ t('nav.back_to_app') }}</button>
      </div>
    </aside>

    <main class="admin-content">
      <RouterView />
    </main>
  </div>
</template>
