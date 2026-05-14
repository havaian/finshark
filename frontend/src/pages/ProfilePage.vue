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
import { useAuthStore } from '../stores/auth.store';
import { useThemeStore } from '../stores/theme.store';

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
interface HeatCell { date: string; count: number; intensity: 0 | 1 | 2 | 3 | 4 }

const heatmapWeeks = computed<HeatCell[][]>(() => {
  if (!stats.value) return [];
  const byDay = new Map(stats.value.activity_heatmap.map((r) => [r.day, r.attempts_count]));

  // Build the last 365 days, starting from Sunday of (today − 53 weeks).
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const start = new Date(today);
  start.setUTCDate(start.getUTCDate() - 7 * 52);
  // Move start back to the previous Sunday so columns are full weeks.
  start.setUTCDate(start.getUTCDate() - start.getUTCDay());

  const weeks: HeatCell[][] = [];
  const cursor = new Date(start);
  for (let w = 0; w < 53; w++) {
    const week: HeatCell[] = [];
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
  return weeks;
});

async function saveName() {
  if (!newName.value.trim() || savingName.value) return;
  savingName.value = true;
  errorMsg.value = null;
  try {
    const updated = await profileApi.updateDisplayName(newName.value.trim());
    if (me.value) me.value.display_name = updated.display_name;
    if (auth.user) auth.user.display_name = updated.display_name;
    // Persist updated user to localStorage so other tabs see the new name.
    localStorage.setItem('acca_duo.user', JSON.stringify(updated));
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
    <div class="container-wide">

      <div class="topbar">
        <h1>{{ t('profile.title') }}</h1>
        <RouterLink to="/dashboard" class="btn-link">{{ t('nav.back_to_dashboard') }}</RouterLink>
      </div>

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
        <section class="card">
          <h2>{{ t('profile.chart_accuracy_by_paper') }}</h2>
          <div v-if="stats.accuracy_by_paper.length > 0" class="chart-wrap">
            <canvas ref="accuracyByPaperCanvas"></canvas>
          </div>
          <p v-else class="dim text-sm mt-4">{{ t('progress.no_weak_topics') }}</p>
        </section>

        <section class="card">
          <h2>{{ t('profile.chart_activity_heatmap') }}</h2>
          <div class="activity-heatmap">
            <div v-for="(week, wi) in heatmapWeeks" :key="wi" class="activity-col">
              <div
                v-for="cell in week"
                :key="cell.date"
                :class="['activity-cell', `intensity-${cell.intensity}`]"
                :title="`${cell.date}: ${cell.count}`"
              ></div>
            </div>
          </div>
        </section>

        <section class="card">
          <h2>{{ t('profile.chart_mastery_over_time') }}</h2>
          <div v-if="stats.mastery_history.length > 0" class="chart-wrap">
            <canvas ref="masteryCanvas"></canvas>
          </div>
          <p v-else class="dim text-sm mt-4">{{ t('progress.no_weak_topics') }}</p>
        </section>

        <div class="profile-grid-2">
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

        <!-- Danger zone -->
        <section class="card danger-zone">
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
