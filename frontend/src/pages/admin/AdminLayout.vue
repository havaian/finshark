<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../../stores/auth.store';
import { useLocaleStore } from '../../stores/locale.store';
import { useLocalePath } from '../../router/useLocalePath';
import { SUPPORTED_LANGS } from '../../i18n';
import { useRoute, useRouter } from 'vue-router';
import LangPicker from '../../components/LangPicker.vue';
import ThemeSwitch from '../../components/ThemeSwitch.vue';

// Admin shell - sidebar nav + topbar with a "back to dashboard" exit.
// Nested admin routes render in the <RouterView/> below.
//
// Note on "keep the back link too": each admin sub-page still renders its own
// in-content back link (e.g. Questions → LOs) for navigation that doesn't fit
// the top-level sidebar. The sidebar is for switching between admin sections;
// the in-page back link is for hierarchical drilldown.
//
// Mobile (≤720px): the persistent left sidebar is replaced by a compact
// top bar (brand + hamburger) plus a right-side slide-in drawer holding
// the same nav items + user info + "back to app". Same UX pattern as
// AppNav's drawer so users see one consistent mobile-nav idiom across the
// app. Drawer auto-closes on route change, ESC, and backdrop click.

const { t } = useI18n();
const auth = useAuthStore();
const route = useRoute();
const router = useRouter();
const locale = useLocaleStore();
const lp = useLocalePath();

interface NavItem {
  to: string;
  labelKey: string;
  // Match any route whose path starts with one of these prefixes
  // (e.g. /admin/papers/:paper_id/los still highlights "Materials").
  activePrefixes: string[];
}

// Helper for isActive(): strip the leading /<lang> from a path so the
// activePrefixes comparisons (which use bare paths like /admin/users) keep
// matching after the routes were nested under /:lang. Returns the path
// unchanged if it doesn't start with a known lang segment.
function stripLang(path: string): string {
  for (const l of SUPPORTED_LANGS) {
    if (path === `/${l}`) return '/';
    if (path.startsWith(`/${l}/`)) return path.slice(`/${l}`.length);
  }
  return path;
}

const navItems = computed<NavItem[]>(() => [
  // Overview is the new default landing - sits first in the sidebar so it
  // also reads as "home" within the admin area.
  { to: lp('/admin/overview'), labelKey: 'admin.overview.title', activePrefixes: ['/admin/overview'] },
  { to: lp('/admin/users'), labelKey: 'admin.users.title', activePrefixes: ['/admin/users'] },
  { to: lp('/admin/whitelist'), labelKey: 'admin.whitelist.title', activePrefixes: ['/admin/whitelist'] },
  // Unified content browser - the only editor for papers/LOs/questions now.
  { to: lp('/admin/content'), labelKey: 'admin.content.title', activePrefixes: ['/admin/content', '/admin/papers', '/admin/los'] },
  { to: lp('/admin/promocodes'), labelKey: 'admin.promocodes.title', activePrefixes: ['/admin/promocodes'] },
  { to: lp('/admin/subscriptions'), labelKey: 'admin.subscriptions.title', activePrefixes: ['/admin/subscriptions'] },
  { to: lp('/admin/payments'), labelKey: 'admin.payments.title', activePrefixes: ['/admin/payments'] },
  { to: lp('/admin/email-templates'), labelKey: 'admin.email_templates.title', activePrefixes: ['/admin/email-templates'] },
  { to: lp('/admin/email-outbox'), labelKey: 'admin.email_outbox.title', activePrefixes: ['/admin/email-outbox'] },
  { to: lp('/admin/localization'), labelKey: 'admin.localization.title', activePrefixes: ['/admin/localization'] },
]);

function isActive(item: NavItem): boolean {
  const bare = stripLang(route.path);
  return item.activePrefixes.some((p) => bare === p || bare.startsWith(p + '/'));
}

function onExit() {
  router.push({ name: 'dashboard', params: { lang: locale.lang } });
}

// ---- Mobile drawer ----
// Mirrors the AppNav drawer pattern (same .body-scroll-lock helper, same
// z-index/animation conventions) so the two feel like one system.
const drawerOpen = ref(false);

function openDrawer() { drawerOpen.value = true; }
function closeDrawer() { drawerOpen.value = false; }

// Close on route change - tapping a section inside the drawer dismisses it.
watch(() => route.fullPath, () => { drawerOpen.value = false; });

// ESC to close.
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && drawerOpen.value) drawerOpen.value = false;
}
if (typeof window !== 'undefined') {
  window.addEventListener('keydown', onKey);
  onBeforeUnmount(() => window.removeEventListener('keydown', onKey));
}

// Body scroll lock while drawer open. Same class as AppNav so they can't
// fight each other.
watch(drawerOpen, (open) => {
  if (typeof document === 'undefined') return;
  document.body.classList.toggle('body-scroll-lock', open);
});
onBeforeUnmount(() => {
  if (typeof document !== 'undefined') {
    document.body.classList.remove('body-scroll-lock');
  }
});

function onExitMobile() {
  drawerOpen.value = false;
  onExit();
}
</script>

<template>
  <div class="admin-shell">
    <!-- Desktop sidebar. Hidden below 720px via CSS. -->
    <aside class="admin-sidebar">
      <div class="admin-sidebar-head">
        <div class="brand">
          <div class="brand-mark"></div>
          <span>Finshark</span>
        </div>
        <div class="admin-sidebar-sub">{{ t('admin.panel') }}</div>
      </div>

      <nav class="admin-nav">
        <RouterLink v-for="item in navItems" :key="item.to" :to="item.to"
          :class="['admin-nav-item', { active: isActive(item) }]">
          {{ t(item.labelKey) }}
        </RouterLink>
      </nav>

      <div class="admin-sidebar-foot">
        <div v-if="auth.user" class="admin-sidebar-me">
          <div class="admin-sidebar-me-name">{{ auth.user.display_name }}</div>
          <div class="admin-sidebar-me-email dim text-xs">{{ auth.user.email }}</div>
        </div>
        <!-- Preferences row: language + theme. Admins spend long sessions here,
             so language/theme should be reachable without going back to the
             user app. Same components as AppNav for a single source of truth. -->
        <div class="admin-sidebar-prefs">
          <LangPicker />
          <ThemeSwitch />
        </div>
        <button class="btn btn-ghost btn-block" @click="onExit">{{ t('nav.back_to_app') }}</button>
      </div>
    </aside>

    <!-- Mobile top bar. Hidden above 720px via CSS. Brand + label on the
         left so the user can see they're in the admin panel; hamburger on
         the right. -->
    <div class="admin-mobile-bar">
      <div class="brand admin-mobile-brand">
        <div class="brand-mark"></div>
        <span class="admin-mobile-brand-text">
          <span>Finshark</span>
          <span class="admin-mobile-brand-sub dim text-xs">{{ t('admin.panel') }}</span>
        </span>
      </div>
      <button type="button" class="admin-mobile-burger" :aria-label="t('nav.open_menu')"
        :aria-expanded="drawerOpen" @click="openDrawer">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor"
          stroke-width="2" stroke-linecap="round" aria-hidden="true">
          <path d="M3 6h18" />
          <path d="M3 12h18" />
          <path d="M3 18h18" />
        </svg>
      </button>
    </div>

    <main class="admin-content">
      <RouterView />
    </main>

    <!-- Drawer. Teleported to <body> so it escapes any containing block
         created by parents (admin shell, mobile bar's backdrop-filter, etc.)
         and behaves as a true viewport-fixed overlay. Reuses .app-nav-drawer-*
         classes for chrome consistency. -->
    <Teleport to="body">
      <div :class="['app-nav-drawer-root', { open: drawerOpen }]" aria-hidden="true">
        <div class="app-nav-drawer-backdrop" @click="closeDrawer"></div>
        <aside class="app-nav-drawer" role="dialog" :aria-modal="drawerOpen" :aria-label="t('nav.menu')"
          @click.stop>
          <header class="app-nav-drawer-head">
            <div class="brand admin-drawer-brand">
              <div class="brand-mark"></div>
              <span class="app-nav-drawer-me-text">
                <span class="app-nav-drawer-me-name">Finshark</span>
                <span class="app-nav-drawer-me-sub dim text-xs">{{ t('admin.panel') }}</span>
              </span>
            </div>
            <button type="button" class="app-nav-drawer-close" :aria-label="t('common.close')"
              @click="closeDrawer">✕</button>
          </header>

          <!-- Admin section nav. Full-width rows for comfortable tap targets. -->
          <nav class="app-nav-drawer-links">
            <RouterLink v-for="item in navItems" :key="item.to" :to="item.to"
              :class="['app-nav-drawer-link', { active: isActive(item) }]" @click="closeDrawer">
              {{ t(item.labelKey) }}
            </RouterLink>
          </nav>

          <!-- User identity, mirrors the desktop sidebar foot. -->
          <div v-if="auth.user" class="admin-drawer-me">
            <div class="admin-sidebar-me-name">{{ auth.user.display_name }}</div>
            <div class="admin-sidebar-me-email dim text-xs">{{ auth.user.email }}</div>
          </div>

          <!-- Preferences row in the drawer too, mirroring the desktop sidebar
               foot. Same pickers - language stays in sync because both use the
               locale store. -->
          <div class="admin-drawer-prefs">
            <LangPicker />
            <ThemeSwitch />
          </div>

          <!-- "Back to app" pinned to the bottom - equivalent to the desktop
               sidebar's foot button. -->
          <div class="app-nav-drawer-foot">
            <button class="btn btn-ghost btn-block" @click="onExitMobile">
              {{ t('nav.back_to_app') }}
            </button>
          </div>
        </aside>
      </div>
    </Teleport>
  </div>
</template>