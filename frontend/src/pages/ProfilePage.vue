<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import {
  Chart,
  BarController,
  BarElement,
  LineController,
  LineElement,
  PointElement,
  DoughnutController,
  ArcElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';
import { profileApi, type ProfileMe, type ProfileStats } from '../api/profile.api';
import { badgesApi } from '../api/badges.api';
import type { PublicBadge } from '../types/badges';
import { achievementsApi } from '../api/achievements.api';
import type { PublicAchievement } from '../types/achievements';
import { billingApi } from '../api/billing.api';
import type { Subscription } from '../types/billing';
import { useAuthStore } from '../stores/auth.store';
import { useEntitlementStore } from '../stores/entitlement.store';
import { useLocaleStore } from '../stores/locale.store';
import { useThemeStore } from '../stores/theme.store';
import { fmtDate } from '../i18n/dates';
import AppNav from '../components/AppNav.vue';

// Register only the chart.js modules we use - reduces bundle size.
Chart.register(
  BarController, BarElement,
  LineController, LineElement, PointElement,
  DoughnutController, ArcElement,
  CategoryScale, LinearScale,
  Tooltip, Legend,
);

const { t, locale } = useI18n();
const auth = useAuthStore();
const localeStore = useLocaleStore();
const theme = useThemeStore();
const router = useRouter();
const entitlement = useEntitlementStore();

const me = ref<ProfileMe | null>(null);
const stats = ref<ProfileStats | null>(null);
const loading = ref(true);
const errorMsg = ref<string | null>(null);

// Badges (3.4). Fetched in parallel with profile/stats; failure is non-fatal -
// the page still renders fine without badges (we just hide the section).
const badges = ref<PublicBadge[]>([]);
const badgesLoading = ref(true);

const badgesEarnedCount = computed(() =>
  badges.value.filter((b) => b.earned).length,
);
const badgesTotalCount = computed(() => badges.value.length);

// Achievements - parallel system to badges (multi-level progress vs binary
// earned/not). Fetched alongside; failure non-fatal (section hides). Same
// loading pattern as badges so they appear in sync.
const achievements = ref<PublicAchievement[]>([]);
const achievementsLoading = ref(true);

const achievementsUnlockedCount = computed(() =>
  achievements.value.filter((a) => a.current_level > 0).length,
);
const achievementsTotalCount = computed(() => achievements.value.length);

// Payments / subscriptions history. Lazy-loaded in parallel with the rest of
// the profile so a slow billing query doesn't gate the page paint. Failure
// is non-fatal - the section just shows the empty state ("no subscriptions
// yet") rather than disappearing, so users who'd been free always know the
// section exists for promo redemptions.
const subscriptions = ref<Subscription[]>([]);
const subscriptionsLoading = ref(true);

// Display name edit state
const editName = ref(false);
const newName = ref('');
const savingName = ref(false);

// Delete account state
const showDelete = ref(false);
const deleteConfirm = ref('');
const deleting = ref(false);

// Chart canvas refs and instances (kept so we can destroy on theme change).
const accuracyByPaperCanvas = ref<HTMLCanvasElement | null>(null);
const difficultyCanvas = ref<HTMLCanvasElement | null>(null);
const typeCanvas = ref<HTMLCanvasElement | null>(null);
const masteryCanvas = ref<HTMLCanvasElement | null>(null);
const chartInstances = new Map<string, Chart>();

const accuracyPctDisplay = computed(() => {
  const p = stats.value?.overall.accuracy_pct;
  if (p === null || p === undefined) return '-';
  return `${Math.round(p)}%`;
});

// Joined date - depends on the active locale; using a computed so it auto-
// updates when the user toggles language at runtime.
const joinedDate = computed(() => {
  if (!me.value) return '';
  // Reading `locale.value` ties this computed to language changes, so the
  // returned string refreshes when the user toggles EN/RU in settings.
  void locale.value;
  return fmtDate(me.value.created_at);
});

async function load() {
  loading.value = true;
  errorMsg.value = null;
  try {
    // Fetch profile + stats together. Badges run in parallel via separate
    // promise so a badge endpoint failure doesn't kill the rest of the page.
    const badgesPromise = badgesApi
      .getMine()
      .then((rows) => {
        badges.value = rows;
      })
      .catch(() => {
        // Swallow - badge grid will just be empty and hidden.
        badges.value = [];
      })
      .finally(() => {
        badgesLoading.value = false;
      });

    // Achievements - same parallel pattern. A failure here only hides the
    // achievements section; the rest of the profile still renders.
    const achievementsPromise = achievementsApi
      .getMine()
      .then((rows) => {
        achievements.value = rows;
      })
      .catch(() => {
        achievements.value = [];
      })
      .finally(() => {
        achievementsLoading.value = false;
      });

    // Subscriptions history - same lazy / non-fatal pattern.
    const subscriptionsPromise = billingApi
      .getMySubscriptions()
      .then((rows) => {
        subscriptions.value = rows;
      })
      .catch(() => {
        subscriptions.value = [];
      })
      .finally(() => {
        subscriptionsLoading.value = false;
      });

    const [meData, statsData] = await Promise.all([
      profileApi.getMe(),
      profileApi.getStats(),
    ]);
    me.value = meData;
    stats.value = statsData;
    newName.value = meData.display_name;
    // Important: drop the loading guard BEFORE nextTick so the inner
    // template (which is gated on !loading && me && stats) actually mounts
    // the chart canvases. The previous flow only flipped loading to false
    // in `finally`, AFTER renderCharts() - so every canvas ref was null
    // when we tried to attach a Chart, and the accuracy / difficulty /
    // type charts silently never rendered.
    loading.value = false;
    await nextTick();
    renderCharts();
    // After the heatmap renders, snap its horizontal scroll to the right
    // edge so the user lands on today's column. Otherwise the 12-month
    // window opens scrolled to ~12 months ago.
    void scrollHeatmapToLatest();
    // Don't block the page on these - they show up as soon as they arrive.
    void badgesPromise;
    void achievementsPromise;
    void subscriptionsPromise;
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to load profile';
    loading.value = false;
  }
}

// Re-render charts on theme change so they pick up new text/grid colours.
// Cheap: same data, new colours.
watch(
  () => theme.theme,
  async () => {
    if (!stats.value) return;
    await nextTick();
    renderCharts();
  },
);

// Reload badges when the UI language changes - the backend localises
// name/description server-side based on the X-Lang header, so re-fetching is
// the cheapest way to get translated copy. Charts also re-render so axis
// labels & legends update. Achievements share the same reload pattern since
// they're localised the same way (level names + descriptions per X-Lang).
watch(
  () => locale.value,
  async () => {
    badgesLoading.value = true;
    achievementsLoading.value = true;
    try {
      const rows = await badgesApi.getMine();
      badges.value = rows;
    } catch {
      // Keep previous list if fetch fails - better than wiping the section.
    } finally {
      badgesLoading.value = false;
    }
    try {
      const rows = await achievementsApi.getMine();
      achievements.value = rows;
    } catch {
      // Keep previous list on failure.
    } finally {
      achievementsLoading.value = false;
    }
    if (stats.value) {
      await nextTick();
      renderCharts();
    }
  },
);

function renderCharts() {
  // Destroy any existing instances so we don't double-paint.
  for (const c of chartInstances.values()) c.destroy();
  chartInstances.clear();

  if (!stats.value) return;
  // Read theme-aware colors from CSS variables so charts match the rest of the app.
  const computedStyle = getComputedStyle(document.documentElement);
  const text = computedStyle.getPropertyValue('--text').trim() || '#f5f5f7';
  const dim = computedStyle.getPropertyValue('--text-dim').trim() || '#a0a0a8';
  const border = computedStyle.getPropertyValue('--border').trim() || '#2a2a30';
  const accent = computedStyle.getPropertyValue('--accent').trim() || '#7c5cff';
  const success = computedStyle.getPropertyValue('--success').trim() || '#4ade80';
  const danger = computedStyle.getPropertyValue('--danger').trim() || '#f87171';
  const amber = computedStyle.getPropertyValue('--amber').trim() || '#f5b955';

  const commonOpts = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: text } },
      tooltip: {},
    },
    scales: {
      x: { ticks: { color: dim }, grid: { color: border } },
      y: { ticks: { color: dim }, grid: { color: border } },
    },
  } as const;

  // ---- Accuracy by paper (bar) ----
  if (accuracyByPaperCanvas.value && stats.value.accuracy_by_paper.length > 0) {
    chartInstances.set(
      'accByPaper',
      new Chart(accuracyByPaperCanvas.value, {
        type: 'bar',
        data: {
          labels: stats.value.accuracy_by_paper.map((r) => r.paper_code),
          datasets: [
            {
              label: t('profile.accuracy'),
              data: stats.value.accuracy_by_paper.map((r) => Math.round(r.accuracy_pct)),
              backgroundColor: accent,
              borderRadius: 4,
            },
          ],
        },
        options: {
          ...commonOpts,
          scales: {
            ...commonOpts.scales,
            y: {
              ...commonOpts.scales.y,
              beginAtZero: true,
              max: 100,
              ticks: { ...commonOpts.scales.y.ticks, callback: (v) => `${v}%` },
            },
          },
          plugins: {
            ...commonOpts.plugins,
            legend: { display: false },
          },
        },
      }),
    );
  }

  // ---- Difficulty breakdown (doughnut) ----
  if (difficultyCanvas.value && stats.value.difficulty_breakdown.length > 0) {
    const order: Array<'easy' | 'medium' | 'hard'> = ['easy', 'medium', 'hard'];
    const map = new Map(stats.value.difficulty_breakdown.map((r) => [r.difficulty, r]));
    const labels = order
      .filter((d) => map.has(d))
      .map((d) => t(`admin.questions.difficulty_${d}`));
    const data = order.filter((d) => map.has(d)).map((d) => map.get(d)!.attempts);
    const colors = order.filter((d) => map.has(d)).map((d) =>
      d === 'easy' ? success : d === 'medium' ? amber : danger,
    );

    chartInstances.set(
      'diff',
      new Chart(difficultyCanvas.value, {
        type: 'doughnut',
        data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: border }] },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: text } } },
        },
      }),
    );
  }

  // ---- Type breakdown (doughnut) ----
  if (typeCanvas.value && stats.value.type_breakdown.length > 0) {
    const map = new Map(stats.value.type_breakdown.map((r) => [r.type, r]));
    const order: Array<'mcq' | 'number_entry'> = ['mcq', 'number_entry'];
    const labels = order
      .filter((tp) => map.has(tp))
      .map((tp) => t(`admin.questions.type_${tp === 'mcq' ? 'mcq' : 'number'}`));
    const data = order.filter((tp) => map.has(tp)).map((tp) => map.get(tp)!.attempts);
    const colors = order.filter((tp) => map.has(tp)).map((tp) =>
      tp === 'mcq' ? accent : amber,
    );

    chartInstances.set(
      'type',
      new Chart(typeCanvas.value, {
        type: 'doughnut',
        data: { labels, datasets: [{ data, backgroundColor: colors, borderColor: border }] },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { labels: { color: text } } },
        },
      }),
    );
  }

  // ---- Mastery over time (line) ----
  if (masteryCanvas.value && stats.value.mastery_history.length > 0) {
    chartInstances.set(
      'mastery',
      new Chart(masteryCanvas.value, {
        type: 'line',
        data: {
          labels: stats.value.mastery_history.map((s) => s.snap_date),
          datasets: [
            {
              label: t('profile.chart_mastery_over_time'),
              data: stats.value.mastery_history.map((s) => Math.round(s.avg_mastery)),
              borderColor: accent,
              backgroundColor: 'transparent',
              tension: 0.2,
              pointRadius: 2,
            },
          ],
        },
        options: {
          ...commonOpts,
          scales: {
            ...commonOpts.scales,
            y: {
              ...commonOpts.scales.y,
              beginAtZero: true,
              max: 100,
              ticks: { ...commonOpts.scales.y.ticks, callback: (v) => `${v}%` },
            },
          },
          plugins: {
            ...commonOpts.plugins,
            legend: { display: false },
          },
        },
      }),
    );
  }
}

// Activity heatmap - handled as plain CSS grid rather than chart.js, because
// chart.js doesn't have a clean Github-contributions heatmap and this is fast.
// Window selector lets the user pick 90 / 180 / 365 days; the grid width
// adjusts (no chunked re-fetch - the backend always returns 365 days of
// activity, we just slice client-side).
//
// Layout: month labels run along the top (positioned at the column where each
// new month begins), weekday labels run down the left edge (Mon/Wed/Fri only
// - matches GitHub's convention to keep the column tight), and hovering a
// cell pops a small tooltip with the exact date and count.
interface HeatCell { date: string; count: number; intensity: 0 | 1 | 2 | 3 | 4 }
interface MonthLabel { col: number; key: string; short: string }

// User-selectable window. 90 days is the default - shows enough recent
// activity without scrolling, and matches a typical "did I study this term"
// question. 180 and 365 are escape hatches for longer-term review.
type HeatmapWindow = 90 | 180 | 365;
const heatmapWindow = ref<HeatmapWindow>(90);

// Cell + gap scale up at smaller windows so the heatmap fills the card width
// instead of hugging the left edge at 12px cells. Tuned against the 280–
// 720px range of card widths the wrap sits inside; cells stay square so the
// grid still reads as a calendar.
const heatmapCellPx = computed<number>(() => {
  switch (heatmapWindow.value) {
    case 90: return 26;
    case 180: return 16;
    case 365:
    default: return 12;
  }
});
const heatmapGapPx = computed<number>(() => (heatmapWindow.value === 90 ? 4 : 3));
const heatmapColPx = computed<number>(() => heatmapCellPx.value + heatmapGapPx.value);

// Style object piped to the wrap as CSS variables. The .activity-cell /
// .activity-col rules in pages.css consume these.
const heatmapStyleVars = computed<Record<string, string>>(() => ({
  '--heat-cell': `${heatmapCellPx.value}px`,
  '--heat-gap': `${heatmapGapPx.value}px`,
}));

// Locale: pull from the active i18n composer once on render and re-read on
// language change (vue-i18n's t() rebinds reactively when locale.value
// changes). For 'ru' we use the abbreviated names; 'en' uses 3-char month.
const monthShort = (date: Date, lang: string): string => {
  try {
    return new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'en-US', {
      month: 'short',
    }).format(date);
  } catch {
    // Fallback for environments without Intl support (none in practice).
    return String(date.getUTCMonth() + 1);
  }
};

const heatmapData = computed<{ weeks: HeatCell[][]; months: MonthLabel[] }>(() => {
  if (!stats.value) return { weeks: [], months: [] };
  const byDay = new Map(stats.value.activity_heatmap.map((r) => [r.day, r.attempts_count]));
  // Read the active UI language from vue-i18n's locale ref so month labels
  // re-render when the user toggles EN/RU at runtime. We do NOT use
  // navigator.language because that's the browser's system locale, which
  // may not match the app's chosen language.
  const lang = locale.value;

  // How many weeks to render. We always show full weeks, so we round up
  // from days/7. The grid starts at the Sunday on/before (today - days).
  const days = heatmapWindow.value;
  const weeksToShow = Math.ceil(days / 7);

  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - 7 * (weeksToShow - 1));
  // Move start back to the previous Sunday so columns are full weeks.
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());

  const weeks: HeatCell[][] = [];
  const months: MonthLabel[] = [];
  let lastMonth = -1;
  let lastLabelCol = -Infinity;
  const cursor = new Date(start);

  // Minimum column gap between month labels so abbreviated names ("May",
  // "Jun") don't overlap when month boundaries land in adjacent columns.
  // 3 columns is enough headroom for a 3-letter label at our smallest cell
  // size (12px cell + 3px gap = 15px/col → 45px gap).
  const MIN_LABEL_COL_GAP = 3;

  for (let w = 0; w < weeksToShow; w++) {
    const week: HeatCell[] = [];

    // Record a month label if the column's first day is in a new month AND
    // there's enough horizontal space since the last label. The gap check
    // is what stops "May / Jun" from rendering on top of each other when
    // June's first column lands one or two columns after May's first.
    const colMonth = cursor.getUTCMonth();
    if (colMonth !== lastMonth && w - lastLabelCol >= MIN_LABEL_COL_GAP) {
      months.push({
        col: w,
        key: `${cursor.getUTCFullYear()}-${colMonth}`,
        short: monthShort(cursor, lang),
      });
      lastLabelCol = w;
    }
    lastMonth = colMonth;

    for (let d = 0; d < 7; d++) {
      const iso = cursor.toISOString().slice(0, 10);
      const count = byDay.get(iso) ?? 0;
      const intensity =
        count === 0 ? 0 :
          count < 3 ? 1 :
            count < 8 ? 2 :
              count < 16 ? 3 : 4;
      week.push({ date: iso, count, intensity });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    weeks.push(week);
  }
  return { weeks, months };
});

// Ref for the new combined scroll container (months + grid scroll together).
// On mount and on window change, we snap scroll to the right edge so the
// user lands on today's column rather than ~12 months ago.
const heatmapScroll = ref<HTMLElement | null>(null);

async function scrollHeatmapToLatest() {
  await nextTick();
  const el = heatmapScroll.value;
  if (!el) return;
  el.scrollLeft = el.scrollWidth;
}

watch(heatmapWindow, scrollHeatmapToLatest);

// Tooltip state. Hovering a cell sets `hoverCell` and `hoverPos`; mouseleave
// clears. Position is relative to the heatmap wrap (computed from the
// pointer event), so the tooltip floats above the hovered cell.
const hoverCell = ref<HeatCell | null>(null);
const hoverPos = ref<{ x: number; y: number } | null>(null);
const heatmapWrap = ref<HTMLElement | null>(null);

function onCellEnter(cell: HeatCell, ev: MouseEvent) {
  hoverCell.value = cell;
  if (!heatmapWrap.value) return;
  const wrapRect = heatmapWrap.value.getBoundingClientRect();
  const target = ev.currentTarget as HTMLElement;
  const cellRect = target.getBoundingClientRect();
  hoverPos.value = {
    x: cellRect.left - wrapRect.left + cellRect.width / 2,
    y: cellRect.top - wrapRect.top,
  };
}

function onCellLeave() {
  hoverCell.value = null;
  hoverPos.value = null;
}

// Localised weekday labels (Mon, Wed, Fri - matches GitHub). Computed so they
// update when the language toggles.
const weekdayLabels = computed(() => ({
  mon: t('profile.heatmap_day_mon'),
  wed: t('profile.heatmap_day_wed'),
  fri: t('profile.heatmap_day_fri'),
}));

// Pretty date for the tooltip - uses the active UI language (vue-i18n
// locale, not navigator.language). The heatmap-day strings come from the
// backend as plain YYYY-MM-DD assumed UTC, so we parse with the explicit
// 'T00:00:00Z' suffix and format in UTC to keep the displayed date matching
// the bucket the count was aggregated against (a user in UTC+8 hovering an
// "April 7" cell should see "April 7", not "April 6").
function fmtTooltipDate(iso: string): string {
  // Touching locale.value here ties the function's output to language changes
  // via the consumer template (which re-renders when locale flips).
  void locale.value;
  try {
    const d = new Date(iso + 'T00:00:00Z');
    const intlLang = locale.value === 'ru' ? 'ru-RU' : 'en-US';
    return new Intl.DateTimeFormat(intlLang, {
      year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC',
    }).format(d);
  } catch {
    return iso;
  }
}

async function saveName() {
  if (!newName.value.trim() || savingName.value) return;
  savingName.value = true;
  errorMsg.value = null;
  try {
    const updated = await profileApi.updateDisplayName(newName.value.trim());
    if (me.value) me.value.display_name = updated.display_name;
    if (auth.user) auth.user.display_name = updated.display_name;
    // Persist updated user to localStorage so other tabs see the new name.
    localStorage.setItem('finshark.user', JSON.stringify(updated));
    editName.value = false;
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to update name';
  } finally {
    savingName.value = false;
  }
}

function cancelNameEdit() {
  if (me.value) newName.value = me.value.display_name;
  editName.value = false;
}

async function deleteAccount() {
  if (!me.value || deleting.value) return;
  deleting.value = true;
  errorMsg.value = null;
  try {
    await profileApi.deleteAccount(deleteConfirm.value);
    // Clear auth + go home. The token is now invalid server-side.
    auth.logout();
    router.replace({ name: 'home', params: { lang: localeStore.lang } });
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to delete account';
  } finally {
    deleting.value = false;
  }
}

function extractError(e: unknown): string | null {
  if (e instanceof AxiosError) {
    const msg = (e.response?.data as { message?: string | string[] })?.message;
    return Array.isArray(msg) ? msg.join(', ') : msg ?? null;
  }
  return null;
}

// Resolve a plan id (e.g. `premium_lifetime`) to a localized human-readable
// label. The backend stores the raw id on each subscription - the user-facing
// payments section was previously printing it directly, which leaked the slug
// into the UI ("premium_lifetime" instead of "Premium · lifetime"). Falls
// back to the raw id when no i18n key exists, so unknown plans (future PSPs)
// still render something rather than nothing.
function planNameFor(planId: string): string {
  const key = `profile.plan_name_${planId}`;
  const translated = t(key);
  return translated === key ? planId : translated;
}

onMounted(load);
</script>

<template>
  <main class="page">
    <AppNav />
    <div class="container">

      <header class="page-head">
        <h1>{{ t('profile.title') }}</h1>
      </header>

      <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
      <p v-if="loading" class="dim text-sm">{{ t('common.loading') }}</p>

      <template v-if="!loading && me && stats">
        <!-- Identity card -->
        <section class="card">
          <div class="profile-identity">
            <div class="profile-avatar" aria-hidden="true">
              {{ me.display_name.slice(0, 1).toUpperCase() }}
            </div>
            <div class="grow">
              <div v-if="!editName" class="profile-name-row">
                <div class="profile-name">{{ me.display_name }}</div>
                <button class="btn-link accent" @click="editName = true">{{ t('common.edit') }}</button>
              </div>
              <div v-else class="profile-name-row">
                <input v-model="newName" type="text" maxlength="100" class="grow" />
                <button class="btn btn-primary btn-sm" :disabled="savingName" @click="saveName">
                  {{ savingName ? t('common.saving') : t('profile.save_display_name') }}
                </button>
                <button class="btn btn-ghost btn-sm" @click="cancelNameEdit">{{ t('common.cancel') }}</button>
              </div>
              <div class="dim text-sm mt-2">
                <span class="muted">{{ t('profile.email') }}:</span> {{ me.email }}
              </div>
              <div class="dim text-sm">
                <span class="muted">{{ t('profile.joined') }}:</span> {{ joinedDate }}
              </div>
            </div>
          </div>
        </section>

        <!-- Top-line stats -->
        <section class="stats mt-6">
          <div class="stat stat-streak">
            <div class="stat-lbl">{{ t('dashboard.streak') }}</div>
            <div class="stat-val">{{ me.streak_count }} <span class="stat-fire">🔥</span></div>
          </div>
          <div class="stat">
            <div class="stat-lbl">{{ t('profile.total_lessons') }}</div>
            <div class="stat-val">{{ stats.overall.total_sessions_completed }}</div>
          </div>
          <div class="stat">
            <div class="stat-lbl">{{ t('profile.total_questions') }}</div>
            <div class="stat-val">{{ stats.overall.total_questions_answered }}</div>
          </div>
          <div class="stat">
            <div class="stat-lbl">{{ t('profile.accuracy') }}</div>
            <div class="stat-val">{{ accuracyPctDisplay }}</div>
          </div>
        </section>

        <!-- Charts -->
        <section class="card mt-6">
          <h2>{{ t('profile.chart_accuracy_by_paper') }}</h2>
          <div v-if="stats.accuracy_by_paper.length > 0" class="chart-wrap">
            <canvas ref="accuracyByPaperCanvas"></canvas>
          </div>
          <p v-else class="dim text-sm mt-4">{{ t('profile.chart_no_data') }}</p>
        </section>

        <section class="card mt-6">
          <header class="row" style="justify-content: space-between; align-items: center; gap: 12px;">
            <h2>{{ t('profile.chart_activity_heatmap') }}</h2>
            <!-- Window selector. Segmented pill matching the rest of the
                 app's segmented controls. 90 days is the compact default
                 (one quarter), 180 = one half year, 365 = the full
                 grid the backend serves. The fetch always returns 365
                 days; switching here just slices the rendered window. -->
            <div class="segmented activity-window-picker">
              <button type="button" :class="{ active: heatmapWindow === 90 }"
                @click="heatmapWindow = 90">
                {{ t('profile.chart_activity_window_90') }}
              </button>
              <button type="button" :class="{ active: heatmapWindow === 180 }"
                @click="heatmapWindow = 180">
                {{ t('profile.chart_activity_window_180') }}
              </button>
              <button type="button" :class="{ active: heatmapWindow === 365 }"
                @click="heatmapWindow = 365">
                {{ t('profile.chart_activity_window_365') }}
              </button>
            </div>
          </header>
          <!-- Heatmap wrap: grid with month-labels row at top, weekday-labels
               column on the left, and the 53x7 cell grid in the main area.
               Tooltip floats above on hover, positioned absolutely relative
               to .activity-heatmap-wrap. -->
          <div ref="heatmapWrap" class="activity-heatmap-wrap" :style="heatmapStyleVars">
            <div class="activity-body">
              <!-- Weekday labels (Mon/Wed/Fri). Rows scale with --heat-cell + --heat-gap,
                   so Mon = col*1, Wed = col*3, Fri = col*5 (alternating rows). The
                   weekday gutter intentionally stays OUTSIDE the scroll container
                   so it stays fixed on the left while the cells scroll. -->
              <div class="activity-weekdays" :style="{ paddingTop: '22px' }">
                <span class="activity-weekday" :style="{ top: (22 + heatmapColPx) + 'px' }">{{ weekdayLabels.mon }}</span>
                <span class="activity-weekday" :style="{ top: (22 + heatmapColPx * 3) + 'px' }">{{ weekdayLabels.wed }}</span>
                <span class="activity-weekday" :style="{ top: (22 + heatmapColPx * 5) + 'px' }">{{ weekdayLabels.fri }}</span>
              </div>

              <!-- Scroll container holds BOTH the month labels and the grid so
                   horizontal scrolling moves them together. Previously the
                   month labels lived outside the scrollable area and stayed
                   pinned while cells scrolled away from them. -->
              <div ref="heatmapScroll" class="activity-scroll">
                <div class="activity-months"
                  :style="{ width: (heatmapData.weeks.length * heatmapColPx) + 'px' }">
                  <span v-for="m in heatmapData.months" :key="m.key" class="activity-month-label"
                    :style="{ left: (m.col * heatmapColPx) + 'px' }">{{ m.short }}</span>
                </div>

                <div class="activity-heatmap">
                  <div v-for="(week, wi) in heatmapData.weeks" :key="wi" class="activity-col">
                    <div v-for="cell in week" :key="cell.date" :class="['activity-cell', `intensity-${cell.intensity}`]"
                      @mouseenter="onCellEnter(cell, $event)" @mouseleave="onCellLeave"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Floating tooltip. Positioned at hoverPos (centred above cell),
                 anchored bottom-up via `transform`. Only renders when hovering.
                 Tooltip count uses singular/plural keys (1 question / N
                 questions) so the English copy reads naturally; the
                 'No activity' branch handles zero-count cells. -->
            <div v-if="hoverCell && hoverPos" class="activity-tooltip"
              :style="{ left: hoverPos.x + 'px', top: hoverPos.y + 'px' }">
              <div class="activity-tooltip-count">
                <template v-if="hoverCell.count === 0">
                  {{ t('profile.heatmap_tooltip_none') }}
                </template>
                <template v-else-if="hoverCell.count === 1">
                  {{ t('profile.heatmap_tooltip_count_one', { count: hoverCell.count }) }}
                </template>
                <template v-else>
                  {{ t('profile.heatmap_tooltip_count_other', { count: hoverCell.count }) }}
                </template>
              </div>
              <div class="activity-tooltip-date">{{ fmtTooltipDate(hoverCell.date) }}</div>
            </div>
          </div>
        </section>

        <section class="card mt-6">
          <h2>{{ t('profile.chart_mastery_over_time') }}</h2>
          <div v-if="stats.mastery_history.length > 0" class="chart-wrap">
            <canvas ref="masteryCanvas"></canvas>
          </div>
          <p v-else class="dim text-sm mt-4">{{ t('profile.chart_no_data') }}</p>
        </section>

        <div class="profile-grid-2 mt-6">
          <section class="card">
            <h2>{{ t('profile.chart_difficulty_breakdown') }}</h2>
            <div v-if="stats.difficulty_breakdown.length > 0" class="chart-wrap">
              <canvas ref="difficultyCanvas"></canvas>
            </div>
            <p v-else class="dim text-sm mt-4">{{ t('profile.chart_no_data') }}</p>
          </section>

          <section class="card">
            <h2>{{ t('profile.chart_type_breakdown') }}</h2>
            <div v-if="stats.type_breakdown.length > 0" class="chart-wrap">
              <canvas ref="typeCanvas"></canvas>
            </div>
            <p v-else class="dim text-sm mt-4">{{ t('profile.chart_no_data') }}</p>
          </section>
        </div>

        <!-- Badges (3.4). Renders the full catalog so users see what's available
             alongside what they've earned. Unearned tiles get .locked styling
             (greyscale + opacity). Section hides entirely on fetch failure
             (badges.length === 0 AND not loading) - graceful degradation. -->
        <section v-if="badgesLoading || badges.length > 0" class="card badges-section mt-6">
          <header class="badges-section-head">
            <h2>{{ t('profile.badges_section') }}</h2>
            <span v-if="!badgesLoading" class="dim text-sm">
              {{ t('profile.badges_earned_count', { earned: badgesEarnedCount, total: badgesTotalCount }) }}
            </span>
          </header>
          <p v-if="badgesLoading" class="dim text-sm">
            {{ t('profile.badges_loading') }}
          </p>
          <div v-else class="badges-grid">
            <!-- Description rendered always (not behind a title hover) so the
                 "how do I earn this?" question is answered without the user
                 having to discover the native tooltip. Earned tiles also
                 show their unlock date as the third line. -->
            <div v-for="b in badges" :key="b.code" :class="['badge-tile', { locked: !b.earned }]">
              <span class="badge-tile-icon">{{ b.icon }}</span>
              <span class="badge-tile-name">{{ b.name }}</span>
              <span class="badge-tile-desc dim text-xs">{{ b.description }}</span>
              <span v-if="b.earned && b.earned_at" class="badge-tile-earned-at dim text-xs">
                {{ t('profile.badges_earned_at', { date: fmtDate(b.earned_at) }) }}
              </span>
              <span v-else-if="!b.earned" class="badge-tile-locked-label dim text-xs">
                {{ t('profile.badges_unearned_label') }}
              </span>
            </div>
          </div>
        </section>

        <!-- Achievements - parallel multi-level progression system. Lives
             UNDER badges (binary earned/not) so the eye reads badges first
             as the simpler signal, then drills into the progress bars. Each
             card shows: icon, name, current level name + number, progress
             bar to next threshold, raw current_value / next_threshold. -->
        <section v-if="achievementsLoading || achievements.length > 0" class="card achievements-section mt-6">
          <header class="badges-section-head">
            <h2>{{ t('profile.achievements_section') }}</h2>
            <span v-if="!achievementsLoading" class="dim text-sm">
              {{ t('profile.achievements_unlocked_count', {
                unlocked: achievementsUnlockedCount,
                total: achievementsTotalCount,
              }) }}
            </span>
          </header>
          <p v-if="achievementsLoading" class="dim text-sm">
            {{ t('profile.achievements_loading') }}
          </p>
          <div v-else class="achievements-grid">
            <div v-for="a in achievements" :key="a.code"
              :class="['achievement-card', { locked: a.current_level === 0 }]">
              <div class="achievement-card-head">
                <span class="achievement-icon">{{ a.icon }}</span>
                <div class="achievement-titleblock">
                  <div class="achievement-name">{{ a.name }}</div>
                  <div class="achievement-level dim text-xs">
                    <template v-if="a.current_level_name">
                      {{ t('profile.achievements_level_label', {
                        level: a.current_level,
                        max: a.max_level,
                        name: a.current_level_name,
                      }) }}
                    </template>
                    <template v-else>
                      {{ t('profile.achievements_locked') }}
                    </template>
                  </div>
                </div>
              </div>
              <div class="achievement-progress">
                <div class="achievement-progress-bar">
                  <div class="achievement-progress-fill" :style="{
                    width: a.next_threshold === null
                      ? '100%'
                      : Math.min(100, Math.round((a.current_value / a.next_threshold) * 100)) + '%'
                  }" />
                </div>
                <div class="achievement-progress-label dim text-xs">
                  <template v-if="a.next_threshold === null">
                    {{ t('profile.achievements_max_reached') }}
                  </template>
                  <template v-else>
                    {{ a.current_value }} / {{ a.next_threshold }}
                    <span v-if="a.next_level_name">
                      → {{ a.next_level_name }}
                    </span>
                  </template>
                </div>
              </div>
              <div class="achievement-desc dim text-xs">{{ a.description }}</div>
            </div>
          </div>
        </section>

        <!-- Payments / subscriptions section. Shown to all users; the empty
             state ("no subscriptions yet") guides free users toward the redeem
             flow in Settings rather than hiding the section entirely.
             Header line summarises current entitlement (premium tier + ends_at,
             or "Free plan") via the entitlement store so the chip stays in
             sync with the rest of the chrome. -->
        <section v-if="subscriptionsLoading || subscriptions.length > 0 || entitlement.entitlement"
          class="card mt-6">
          <header class="row" style="justify-content: space-between; align-items: center; gap: 12px;">
            <h2>{{ t('profile.payments_section') }}</h2>
            <span v-if="entitlement.isPremium" class="pill pill-accent">{{ t('dashboard.premium_badge') }}</span>
            <span v-else-if="entitlement.isFree" class="pill pill-grey">{{ t('settings.premium_status_free') }}</span>
          </header>

          <div v-if="entitlement.entitlement && entitlement.isPremium" class="dim text-sm mt-2">
            <template v-if="entitlement.entitlement.ends_at">
              {{ t('settings.premium_ends_at', {
                date: new Date(entitlement.entitlement.ends_at).toLocaleDateString(),
              }) }}
            </template>
            <template v-else>{{ t('settings.premium_lifetime') }}</template>
          </div>

          <p v-if="subscriptionsLoading" class="dim text-sm mt-4">{{ t('common.loading') }}</p>
          <p v-else-if="subscriptions.length === 0" class="dim text-sm mt-4">
            {{ t('profile.payments_empty') }}
          </p>
          <div v-else class="list-bordered mt-4">
            <div v-for="s in subscriptions" :key="s.id" class="list-row">
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <div>
                  <span style="font-weight: 500;">{{ planNameFor(s.plan_id) }}</span>
                  <span :class="['pill', s.status === 'active' ? 'pill-accent' : 'pill-grey']" style="margin-left: 10px;">
                    {{ t(`admin.subscriptions.sub_status_${s.status}`) }}
                  </span>
                  <span class="dim text-xs" style="margin-left: 8px;">
                    · {{ t(`admin.subscriptions.sub_source_${s.source}`) }}
                  </span>
                </div>
                <div class="dim text-xs">
                  {{ t('admin.subscriptions.sub_starts', { date: new Date(s.starts_at).toLocaleDateString() }) }}
                  <template v-if="s.ends_at">
                    · {{ t('admin.subscriptions.sub_ends', { date: new Date(s.ends_at).toLocaleDateString() }) }}
                  </template>
                  <template v-else>
                    · {{ t('admin.subscriptions.sub_ends_never') }}
                  </template>
                  <template v-if="s.cancelled_at">
                    · {{ t('admin.subscriptions.sub_cancelled_at', {
                      date: new Date(s.cancelled_at).toLocaleDateString(),
                    }) }}
                  </template>
                </div>
              </div>
            </div>
          </div>

          <p class="dim text-xs mt-4">
            {{ t('profile.payments_redeem_hint') }}
          </p>
        </section>

        <!-- Danger zone -->
        <section class="card danger-zone mt-6">
          <h2 style="color: var(--danger);">{{ t('profile.danger_zone') }}</h2>
          <p class="dim text-sm mt-2">{{ t('profile.delete_account_warning') }}</p>

          <button v-if="!showDelete" class="btn btn-danger mt-4" @click="showDelete = true">
            {{ t('profile.delete_account') }}
          </button>

          <div v-else class="mt-4">
            <label class="field-label">{{ t('profile.delete_account_confirm') }}</label>
            <input v-model="deleteConfirm" type="email" :placeholder="me.email" style="margin-top: 6px;" />
            <div class="row mt-4" style="gap: 8px;">
              <button class="btn btn-danger"
                :disabled="deleting || deleteConfirm.trim().toLowerCase() !== me.email.toLowerCase()"
                @click="deleteAccount">
                {{ deleting ? t('common.saving') : t('profile.delete_account') }}
              </button>
              <button class="btn btn-ghost" :disabled="deleting" @click="showDelete = false; deleteConfirm = ''">
                {{ t('common.cancel') }}
              </button>
            </div>
          </div>
        </section>

      </template>

    </div>
  </main>
</template>
