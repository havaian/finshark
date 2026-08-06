
<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { Cog6ToothIcon, UserCircleIcon, CreditCardIcon } from '@heroicons/vue/24/outline';
import { useAuthStore } from '../stores/auth.store';
import { useLocaleStore } from '../stores/locale.store';
import { useThemeStore } from '../stores/theme.store';
import { SUPPORTED_LANGS } from '../i18n';
import { useLocalePath } from '../router/useLocalePath';
import { levelProgress } from '../lib/level';
import ThemeSwitch from './ThemeSwitch.vue';
import LangPicker from './LangPicker.vue';

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
// styling so it's visible at a glance - moved here from the dashboard's
// in-content button so it's discoverable from any page.
//
// Mobile (≤720px): the desktop row is hidden via CSS and replaced by a
// compact top bar (brand + hamburger) plus a right-side slide-in drawer
// containing every action. Both the desktop row and the mobile bar live
// in the same template - CSS swaps which is visible - so we keep a single
// source of truth for nav items. Drawer state is local to this component;
// it auto-closes on route changes, ESC, and backdrop click. Body scroll
// is locked while open so the page underneath doesn't drift on iOS.

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const locale = useLocaleStore();
const theme = useThemeStore();
const lp = useLocalePath();

// Drawer-only: which stat tip is expanded (click to reveal). null = none.
// Tap a stat tile to expand its description; tap again to collapse. Mutually
// exclusive - opening one collapses the other so the drawer doesn't grow.
type StatKey = 'level' | 'streak' | 'xp';
const expandedStat = ref<StatKey | null>(null);
function toggleStat(key: StatKey) {
  expandedStat.value = expandedStat.value === key ? null : key;
}

// Live level-band progress for the level pill tooltip. Derives from the
// reactive auth.user.xp so the tooltip stays in sync after a lesson updates
// xp/level in the store. Returns zeros when there's no user yet - the pill
// itself is v-if-gated on auth.user, but computed has to be safe regardless.
const lvlProgress = computed(() => levelProgress(auth.user?.xp ?? 0));

interface NavItem { to: string; labelKey: string; exact?: boolean }

// Nav items expose their target path WITHOUT the lang prefix; the prefix is
// added at render time via lp(). Keeping them unprefixed here means the
// `exact`/`startsWith` matching logic in isActive() stays language-agnostic
// (we strip the lang from route.path before comparing).
interface NavItemSrc { path: string; labelKey: string; exact?: boolean }

const navItemsSrc: NavItemSrc[] = [
  { path: '/dashboard', labelKey: 'nav.dashboard', exact: true },
  { path: '/progress', labelKey: 'nav.progress' },
  { path: '/leaderboards', labelKey: 'nav.leaderboards' },
  { path: '/mocks/start', labelKey: 'nav.mocks' },
  { path: '/subscription', labelKey: 'nav.subscription' },
];

const navItems = computed<NavItem[]>(() =>
  navItemsSrc.map((it) => ({
    to: lp(it.path),
    labelKey: it.labelKey,
    exact: it.exact,
  })),
);

// Strip a leading /<lang> from the path so isActive() can compare against
// unprefixed nav targets like '/dashboard'. Mirrors the helper in
// AdminLayout. If the path has no recognised lang prefix it's returned as-is.
function stripLang(path: string): string {
  for (const l of SUPPORTED_LANGS) {
    if (path === `/${l}`) return '/';
    if (path.startsWith(`/${l}/`)) return path.slice(`/${l}`.length);
  }
  return path;
}

function isActive(item: NavItem): boolean {
  const bare = stripLang(route.path);
  // We compare against the SOURCE path (unprefixed) by re-deriving it from
  // the item's `to`. Same source-of-truth as navItemsSrc but kept inline
  // so we don't have to thread a second array through the template.
  const itemBare = stripLang(item.to);
  if (item.exact) return bare === itemBare;
  return bare === itemBare || bare.startsWith(itemBare + '/');
}

// Profile isn't part of navItemsSrc (it lives in the drawer header + its own
// drawer row, not the primary nav), so it needs a standalone active check for
// the new explicit Profile row in the drawer.
const isProfileActive = computed(() => {
  const bare = stripLang(route.path);
  return bare === '/profile' || bare.startsWith('/profile/');
});

function onLogout() {
  auth.logout();
  router.push({ name: 'home', params: { lang: locale.lang } });
}

// ---- Mobile drawer ----
// Closed by default. On desktop the drawer markup still exists in the DOM but
// is hidden via the same media query that hides the hamburger button.
const drawerOpen = ref(false);

function openDrawer() { drawerOpen.value = true; }
function closeDrawer() { drawerOpen.value = false; }

// Close on route change - tapping a link inside the drawer dismisses it.
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
  // Reset any expanded stat tile when the drawer closes so the next open
  // starts in a clean (collapsed) state.
  if (!open) expandedStat.value = null;
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
        <RouterLink :to="lp(`/dashboard`)" class="brand app-nav-brand">
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
             small CSS tooltip explaining what each icon means - useful for new
             users who haven't seen the dashboard yet. -->
        <div v-if="auth.user" class="app-nav-stats">
          <span class="app-nav-stat app-nav-stat-level"
            :data-tip="t('nav.stat_level_tip', { level: lvlProgress.level, intoLevel: lvlProgress.intoLevel, bandSize: lvlProgress.bandSize, next: lvlProgress.level + 1 })">
            <span class="app-nav-stat-icon">★</span>
            <span class="app-nav-stat-val">{{ t('nav.stat_level_short', { level: auth.user.level }) }}</span>
          </span>
          <span class="app-nav-stat" :data-tip="t('nav.stat_streak_tip')">
            <span class="app-nav-stat-icon">🔥</span>
            <span class="app-nav-stat-val">{{ auth.user.streak_count }}</span>
          </span>
          <!-- Freeze pill: only rendered when the user actually has freezes.
               Stays silent for the common case (no freezes, no clutter) and
               surfaces as a small snowflake count once they earn one. -->
          <span v-if="auth.user.streak_freezes_remaining > 0" class="app-nav-stat app-nav-stat-freeze"
            :data-tip="t('nav.stat_freeze_tip')">
            <span class="app-nav-stat-icon">❄</span>
            <span class="app-nav-stat-val">{{ auth.user.streak_freezes_remaining }}</span>
          </span>
          <span class="app-nav-stat" :data-tip="t('nav.stat_xp_tip')">
            <span class="app-nav-stat-icon">✦</span>
            <span class="app-nav-stat-val">{{ auth.user.xp }}</span>
          </span>
        </div>

        <LangPicker />
        <ThemeSwitch />

        <!-- Admin entry: vivid styling so it stands out. Only rendered for admins. -->
        <RouterLink v-if="auth.user?.is_admin" :to="lp(`/admin`)" class="app-nav-admin-btn">
          {{ t('nav.admin_panel') }}
        </RouterLink>

        <RouterLink :to="lp(`/profile`)" class="app-nav-profile" :title="auth.user?.display_name ?? ''">
          <span class="app-nav-avatar" aria-hidden="true">
            {{ auth.user?.display_name?.slice(0, 1).toUpperCase() ?? '?' }}
          </span>
        </RouterLink>

        <RouterLink :to="lp(`/settings`)" class="app-nav-icon-btn" :title="t('nav.settings')">
          <Cog6ToothIcon class="app-nav-icon-svg" aria-hidden="true" />
        </RouterLink>

        <button class="btn btn-ghost btn-sm" @click="onLogout">
          {{ t('common.sign_out') }}
        </button>
      </div>
    </div>

    <!-- Mobile bar. Hidden above 720px via CSS. Brand on the left, stats pills
         (compact) in the middle so they're still glanceable without opening
         the drawer, hamburger on the right. -->
    <div class="app-nav-mobile">
      <RouterLink :to="lp(`/dashboard`)" class="brand app-nav-brand app-nav-mobile-brand">
        <div class="brand-mark"></div>
        <span>Finshark</span>
      </RouterLink>

      <div v-if="auth.user" class="app-nav-mobile-stats">
        <span class="app-nav-stat app-nav-stat-level">
          <span class="app-nav-stat-icon">★</span>
          <span class="app-nav-stat-val">{{ t('nav.stat_level_short', { level: auth.user.level }) }}</span>
        </span>
        <span class="app-nav-stat">
          <span class="app-nav-stat-icon">🔥</span>
          <span class="app-nav-stat-val">{{ auth.user.streak_count }}</span>
        </span>
        <span v-if="auth.user.streak_freezes_remaining > 0" class="app-nav-stat app-nav-stat-freeze">
          <span class="app-nav-stat-icon">❄</span>
          <span class="app-nav-stat-val">{{ auth.user.streak_freezes_remaining }}</span>
        </span>
        <span class="app-nav-stat">
          <span class="app-nav-stat-icon">✦</span>
          <span class="app-nav-stat-val">{{ auth.user.xp }}</span>
        </span>
      </div>

      <!-- Lang picker visible on the mobile bar too - same component as desktop. -->
      <LangPicker class="app-nav-mobile-lang" />

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
         it don't dismiss.
         Teleported to <body> so the drawer escapes the .app-nav stacking
         context (.app-nav has position:sticky + z-index:10 + backdrop-filter,
         each of which creates a stacking context that traps any descendant's
         z-index - so the drawer's z-index:9999 was being clipped under page
         content like stat tiles and the welcome banner). Mounted at the body
         level the z-index actually competes at the document root. -->
    <Teleport to="body">
    <div :class="['app-nav-drawer-root', { open: drawerOpen }]" aria-hidden="true">
      <div class="app-nav-drawer-backdrop" @click="closeDrawer"></div>
      <aside class="app-nav-drawer" role="dialog" :aria-modal="drawerOpen" :aria-label="t('nav.menu')" @click.stop>
        <header class="app-nav-drawer-head">
          <RouterLink :to="lp(`/profile`)" class="app-nav-drawer-me" @click="closeDrawer">
            <span class="app-nav-avatar" aria-hidden="true">
              {{ auth.user?.display_name?.slice(0, 1).toUpperCase() ?? '?' }}
            </span>
            <span class="app-nav-drawer-me-text">
              <span class="app-nav-drawer-me-name">{{ auth.user?.display_name ?? '' }}</span>
              <span class="app-nav-drawer-me-sub dim text-xs">{{ t('nav.view_profile') }}</span>
            </span>
          </RouterLink>
          <button type="button" class="app-nav-drawer-close" :aria-label="t('common.close')"
            @click="closeDrawer">✕</button>
        </header>

        <!-- Stats: visible inside the drawer so the user can read them when
             the compact bar shows them too (redundant on small phones where
             the compact bar shows the same numbers, but useful when stats
             would overflow).
             Tap a stat tile to expand it and reveal a short description of
             what the number means. Collapsed by default to keep the drawer
             compact; only one tile is expanded at a time. -->
        <div v-if="auth.user" class="app-nav-drawer-stats">
          <button type="button"
            :class="['app-nav-drawer-stat', { expanded: expandedStat === 'level' }]"
            :aria-expanded="expandedStat === 'level'"
            @click="toggleStat('level')">
            <span class="app-nav-drawer-stat-row">
              <span class="app-nav-stat-icon">★</span>
              <span class="app-nav-drawer-stat-val">{{ t('nav.stat_level_short', { level: auth.user.level }) }}</span>
            </span>
            <span v-if="expandedStat === 'level'" class="app-nav-drawer-stat-lbl dim text-xs">
              {{ t('nav.stat_level_tip', { level: lvlProgress.level, intoLevel: lvlProgress.intoLevel, bandSize: lvlProgress.bandSize, next: lvlProgress.level + 1 }) }}
            </span>
          </button>
          <button type="button"
            :class="['app-nav-drawer-stat', { expanded: expandedStat === 'streak' }]"
            :aria-expanded="expandedStat === 'streak'"
            @click="toggleStat('streak')">
            <span class="app-nav-drawer-stat-row">
              <span class="app-nav-stat-icon">🔥</span>
              <span class="app-nav-drawer-stat-val">{{ auth.user.streak_count }}</span>
            </span>
            <span v-if="expandedStat === 'streak'" class="app-nav-drawer-stat-lbl dim text-xs">
              {{ t('nav.stat_streak_tip') }}
            </span>
          </button>
          <button type="button"
            :class="['app-nav-drawer-stat', { expanded: expandedStat === 'xp' }]"
            :aria-expanded="expandedStat === 'xp'"
            @click="toggleStat('xp')">
            <span class="app-nav-drawer-stat-row">
              <span class="app-nav-stat-icon">✦</span>
              <span class="app-nav-drawer-stat-val">{{ auth.user.xp }}</span>
            </span>
            <span v-if="expandedStat === 'xp'" class="app-nav-drawer-stat-lbl dim text-xs">
              {{ t('nav.stat_xp_tip') }}
            </span>
          </button>
        </div>

        <!-- Primary nav links - same items as desktop, full-width rows so they
             have a comfortable tap target on phones. Profile leads the list as
             an explicit, labeled row: the drawer header avatar/name also links
             to the profile, but that affordance isn't obvious, so this gives a
             clearly-labeled entry point. -->
        <nav class="app-nav-drawer-links">
          <RouterLink :to="lp(`/profile`)" class="app-nav-drawer-link"
            :class="{ active: isProfileActive }" @click="closeDrawer">
            <UserCircleIcon class="app-nav-drawer-link-icon" aria-hidden="true" />
            {{ t('nav.profile') }}
          </RouterLink>

          <RouterLink v-for="item in navItems" :key="item.to" :to="item.to"
            :class="['app-nav-drawer-link', { active: isActive(item) }]" @click="closeDrawer">
            {{ t(item.labelKey) }}
          </RouterLink>

          <!-- Admin entry: same vivid styling as desktop, full-width here. -->
          <RouterLink v-if="auth.user?.is_admin" :to="lp(`/admin`)" class="app-nav-drawer-link app-nav-drawer-link-admin"
            @click="closeDrawer">
            {{ t('nav.admin_panel') }}
          </RouterLink>
        </nav>

        <!-- Spacer: pushes the controls + sign-out to the bottom of the drawer
             so primary nav stays at the top and footer controls anchor the
             bottom regardless of how many primary items there are. -->
        <div class="app-nav-drawer-spacer"></div>

        <!-- Footer controls block: theme → settings → sign out.
             Pinned to the bottom of the drawer. Each row uses the same
             label-on-left / control-on-right pattern. Language is omitted -
             the navbar's <LangPicker /> is visible on mobile too. -->
        <div class="app-nav-drawer-foot-controls">
          <!-- Theme picker: segmented pill, sun = light, moon = dark. Replaces
               the single-icon ThemeSwitch in the drawer only - the desktop nav
               still uses <ThemeSwitch /> unchanged. Uses useThemeStore directly
               so it stays in sync with the Settings page. -->
          <div class="app-nav-drawer-ctrlrow">
            <span class="dim text-sm">{{ t('theme.label') }}</span>
            <div class="app-nav-drawer-seg" role="group" :aria-label="t('theme.label')">
              <button type="button"
                :class="['app-nav-drawer-seg-btn', { active: theme.theme === 'light' }]"
                :aria-pressed="theme.theme === 'light'"
                :title="t('theme.light')"
                @click="theme.setTheme('light')">
                <!-- Sun icon: 16x16 viewBox, inherits color via currentColor. -->
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="m17.66 17.66 1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" />
                  <path d="m19.07 4.93-1.41 1.41" />
                </svg>
              </button>
              <button type="button"
                :class="['app-nav-drawer-seg-btn', { active: theme.theme === 'dark' }]"
                :aria-pressed="theme.theme === 'dark'"
                :title="t('theme.dark')"
                @click="theme.setTheme('dark')">
                <!-- Moon icon. -->
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                </svg>
              </button>
            </div>
          </div>

          <!-- Settings link: full-width row, separated from primary nav so it
               sits with the other "preferences" controls at the bottom. -->
          <RouterLink :to="lp(`/settings`)" class="app-nav-drawer-link" @click="closeDrawer">
            <Cog6ToothIcon class="app-nav-drawer-link-icon" aria-hidden="true" />
            {{ t('nav.settings') }}
          </RouterLink>

          <!-- Subscription / billing - sits with the preferences controls. -->
          <RouterLink :to="lp(`/subscription`)" class="app-nav-drawer-link" @click="closeDrawer">
            <CreditCardIcon class="app-nav-drawer-link-icon" aria-hidden="true" />
            {{ t('nav.subscription') }}
          </RouterLink>
        </div>

        <!-- Sign out pinned to the bottom for "destructive" actions. -->
        <div class="app-nav-drawer-foot">
          <button class="btn btn-ghost btn-block" @click="onLogoutMobile">
            {{ t('common.sign_out') }}
          </button>
        </div>
      </aside>
    </div>
    </Teleport>
  </nav>
</template>