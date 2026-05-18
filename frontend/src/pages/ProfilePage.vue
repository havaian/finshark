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
import { useAuthStore } from '../stores/auth.store';
import { useThemeStore } from '../stores/theme.store';
import AppNav from '../components/AppNav.vue';

// Register only the chart.js modules we use — reduces bundle size.
Chart.register(
  BarController, BarElement,
  LineController, LineElement, PointElement,
  DoughnutController, ArcElement,
  CategoryScale, LinearScale,
  Tooltip, Legend,
);

const { t } = useI18n();
const auth = useAuthStore();
const theme = useThemeStore();
const router = useRouter();

const me = ref<ProfileMe | null>(null);
const stats = ref<ProfileStats | null>(null);
const loading = ref(true);
const errorMsg = ref<string | null>(null);

// Badges (3.4). Fetched in parallel with profile/stats; failure is non-fatal —
// the page still renders fine without badges (we just hide the section).
const badges = ref<PublicBadge[]>([]);
const badgesLoading = ref(true);

const badgesEarnedCount = computed(() =>
  badges.value.filter((b) => b.earned).length,
);
const badgesTotalCount = computed(() => badges.value.length);

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
const difficultyCanvas      = ref<HTMLCanvasElement | null>(null);
const typeCanvas            = ref<HTMLCanvasElement | null>(null);
const masteryCanvas         = ref<HTMLCanvasElement | null>(null);
const chartInstances = new Map<string, Chart>();

const accuracyPctDisplay = computed(() => {
  const p = stats.value?.overall.accuracy_pct;
  if (p === null || p === undefined) return '—';
  return `${Math.round(p)}%`;
});

const joinedDate = computed(() => {
  if (!me.value) return '';
  return me.value.created_at.slice(0, 10);
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
        // Swallow — badge grid will just be empty and hidden.
        badges.value = [];
      })
      .finally(() => {
        badgesLoading.value = false;
      });

    const [meData, statsData] = await Promise.all([
      profileApi.getMe(),
      profileApi.getStats(),
    ]);
    me.value = meData;
    stats.value = statsData;
    newName.value = meData.display_name;
    // Charts need the DOM to be there first.
    await nextTick();
    renderCharts();
    // Don't block the page on badges — they show up as soon as they arrive.
    void badgesPromise;
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to load profile';
  } finally {
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

function renderCharts() {
  // Destroy any existing instances so we don't double-paint.
  for (const c of chartInstances.values()) c.destroy();
  chartInstances.clear();

  if (!stats.value) return;
  // Read theme-aware colors from CSS variables so charts match the rest of the app.
  const computedStyle = getComputedStyle(document.documentElement);
  const text   = computedStyle.getPropertyValue('--text').trim() || '#f5f5f7';
  const dim    = computedStyle.getPropertyValue('--text-dim').trim() || '#a0a0a8';
  const border = computedStyle.getPropertyValue('--border').trim() || '#2a2a30';
  const accent = computedStyle.getPropertyValue('--accent').trim() || '#7c5cff';
  const success = computedStyle.getPropertyValue('--success').trim() || '#4ade80';
  const danger = computedStyle.getPropertyValue('--danger').trim() || '#f87171';
  const amber  = computedStyle.getPropertyValue('--amber').trim() || '#f5b955';

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
    const order: Array<'mcq' | 'short_answer'> = ['mcq', 'short_answer'];
    const labels = order
      .filter((tp) => map.has(tp))
      .map((tp) => t(`admin.questions.type_${tp === 'mcq' ? 'mcq' : 'short'}`));
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

// Activity heatmap — handled as plain CSS grid rather than chart.js, because
// chart.js doesn't have a clean Github-contributions heatmap and this is fast.
// Build a 53-week × 7-day grid ending today (UTC). Each cell shows the count.
//
// Layout: month labels run along the top (positioned at the column where each
// new month begins), weekday labels run down the left edge (Mon/Wed/Fri only
// — matches GitHub's convention to keep the column tight), and hovering a
// cell pops a small tooltip with the exact date and count.
interface HeatCell { date: string; count: number; intensity: 0 | 1 | 2 | 3 | 4 }
interface MonthLabel { col: number; key: string; short: string }

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
  const lang = (typeof navigator !== 'undefined' && navigator.language) || 'en';

  // Build the last 365 days, starting from Sunday of (today − 52 weeks).
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - 7 * 52);
  // Move start back to the previous Sunday so columns are full weeks.
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());

  const weeks: HeatCell[][] = [];
  const months: MonthLabel[] = [];
  let lastMonth = -1;
  const cursor = new Date(start);

  for (let w = 0; w < 53; w++) {
    const week: HeatCell[] = [];

    // Record a month label if the column's first day is in a new month.
    // We anchor labels to the first day of the column to avoid two labels
    // landing in adjacent columns when a month boundary falls mid-week.
    const colMonth = cursor.getUTCMonth();
    if (colMonth !== lastMonth) {
      months.push({
        col: w,
        key: `${cursor.getUTCFullYear()}-${colMonth}`,
        short: monthShort(cursor, lang),
      });
      lastMonth = colMonth;
    }

    for (let d = 0; d < 7; d++) {
      const iso = cursor.toISOString().slice(0, 10);
      const count = byDay.get(iso) ?? 0;
      const intensity =
        count === 0 ? 0 :
        count < 3   ? 1 :
        count < 8   ? 2 :
        count < 16  ? 3 : 4;
      week.push({ date: iso, count, intensity });
      cursor.setUTCDate(cursor.getUTCDate() + 1);
    }
    weeks.push(week);
  }
  return { weeks, months };
});

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

// Localised weekday labels (Mon, Wed, Fri — matches GitHub). Computed so they
// update when the language toggles.
const weekdayLabels = computed(() => ({
  mon: t('profile.heatmap_day_mon'),
  wed: t('profile.heatmap_day_wed'),
  fri: t('profile.heatmap_day_fri'),
}));

// Pretty date for the tooltip — uses the active language's locale formatting.
function fmtTooltipDate(iso: string): string {
  try {
    const d = new Date(iso + 'T00:00:00Z');
    const lang = (typeof navigator !== 'undefined' && navigator.language) || 'en';
    return new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'en-US', {
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
    router.replace({ name: 'home' });
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

onMounted(load);
</script>

<template>
  <main class="page">
    <AppNav />
    <div class="container-wide">

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
          <p v-else class="dim text-sm mt-4">{{ t('progress.no_weak_topics') }}</p>
        </section>

        <section class="card mt-6">
          <h2>{{ t('profile.chart_activity_heatmap') }}</h2>
          <!-- Heatmap wrap: grid with month-labels row at top, weekday-labels
               column on the left, and the 53x7 cell grid in the main area.
               Tooltip floats above on hover, positioned absolutely relative
               to .activity-heatmap-wrap. -->
          <div ref="heatmapWrap" class="activity-heatmap-wrap">
            <!-- Month labels row: only renders for months whose column ≥ 1
                 (avoids overlap with the weekday label column on the far left). -->
            <div class="activity-months">
              <span
                v-for="m in heatmapData.months"
                :key="m.key"
                class="activity-month-label"
                :style="{ left: (m.col * 15) + 'px' }"
              >{{ m.short }}</span>
            </div>

            <div class="activity-body">
              <!-- Weekday labels (Mon/Wed/Fri). Rows are 15px tall (12 cell + 3
                   gap) to align with the grid columns next to them. -->
              <div class="activity-weekdays">
                <span class="activity-weekday" style="top: 15px;">{{ weekdayLabels.mon }}</span>
                <span class="activity-weekday" style="top: 45px;">{{ weekdayLabels.wed }}</span>
                <span class="activity-weekday" style="top: 75px;">{{ weekdayLabels.fri }}</span>
              </div>

              <div class="activity-heatmap">
                <div v-for="(week, wi) in heatmapData.weeks" :key="wi" class="activity-col">
                  <div
                    v-for="cell in week"
                    :key="cell.date"
                    :class="['activity-cell', `intensity-${cell.intensity}`]"
                    @mouseenter="onCellEnter(cell, $event)"
                    @mouseleave="onCellLeave"
                  ></div>
                </div>
              </div>
            </div>

            <!-- Floating tooltip. Positioned at hoverPos (centred above cell),
                 anchored bottom-up via `transform`. Only renders when hovering. -->
            <div
              v-if="hoverCell && hoverPos"
              class="activity-tooltip"
              :style="{ left: hoverPos.x + 'px', top: hoverPos.y + 'px' }"
            >
              <div class="activity-tooltip-count">
                {{ t('profile.heatmap_tooltip_count', { count: hoverCell.count }) }}
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
          <p v-else class="dim text-sm mt-4">{{ t('progress.no_weak_topics') }}</p>
        </section>

        <div class="profile-grid-2 mt-6">
          <section class="card">
            <h2>{{ t('profile.chart_difficulty_breakdown') }}</h2>
            <div v-if="stats.difficulty_breakdown.length > 0" class="chart-wrap">
              <canvas ref="difficultyCanvas"></canvas>
            </div>
            <p v-else class="dim text-sm mt-4">{{ t('progress.no_weak_topics') }}</p>
          </section>

          <section class="card">
            <h2>{{ t('profile.chart_type_breakdown') }}</h2>
            <div v-if="stats.type_breakdown.length > 0" class="chart-wrap">
              <canvas ref="typeCanvas"></canvas>
            </div>
            <p v-else class="dim text-sm mt-4">{{ t('progress.no_weak_topics') }}</p>
          </section>
        </div>

        <!-- Badges (3.4). Renders the full catalog so users see what's available
             alongside what they've earned. Unearned tiles get .locked styling
             (greyscale + opacity). Section hides entirely on fetch failure
             (badges.length === 0 AND not loading) — graceful degradation. -->
        <section
          v-if="badgesLoading || badges.length > 0"
          class="card badges-section mt-6"
        >
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
            <div
              v-for="b in badges"
              :key="b.code"
              :class="['badge-tile', { locked: !b.earned }]"
              :title="b.description"
            >
              <span class="badge-tile-icon">{{ b.icon }}</span>
              <span class="badge-tile-name">{{ b.name }}</span>
              <span v-if="!b.earned" class="badge-tile-locked-label dim text-xs">
                {{ t('profile.badges_unearned_label') }}
              </span>
            </div>
          </div>
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
            <input
              v-model="deleteConfirm"
              type="email"
              :placeholder="me.email"
              style="margin-top: 6px;"
            />
            <div class="row mt-4" style="gap: 8px;">
              <button
                class="btn btn-danger"
                :disabled="deleting || deleteConfirm.trim().toLowerCase() !== me.email.toLowerCase()"
                @click="deleteAccount"
              >
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
