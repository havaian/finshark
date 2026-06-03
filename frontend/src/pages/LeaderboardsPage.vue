<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { leaderboardsApi, type LeaderboardEntry, type LeaderboardWindow } from '../api/leaderboards.api';
import { lessonsApi } from '../api/lessons.api';
import { profileApi } from '../api/profile.api';
import { useAuthStore } from '../stores/auth.store';
import { useLocalePath } from '../router/useLocalePath';
import AppNav from '../components/AppNav.vue';
import type { Paper } from '../types/content';

// Leaderboards page. Three window tabs + optional paper filter.
//
// Opt-in: viewing is free for any authed user (you can still see the global
// ranks even if you haven't opted in yourself), but the user only appears on
// the board if leaderboard_opt_in is true. If the current user hasn't opted
// in, we show a one-line banner with an "enable" toggle that PATCHes
// /profile/preferences. They reload after to see themselves appear.

const { t } = useI18n();
const auth = useAuthStore();
const lp = useLocalePath();

const window_ = ref<LeaderboardWindow>('week');
const paperId = ref<string | null>(null);

const entries = ref<LeaderboardEntry[]>([]);
const loading = ref(false);
const errorMsg = ref<string | null>(null);

const papers = ref<Paper[]>([]);
const papersLoading = ref(true);

const togglingOptIn = ref(false);
const optInError = ref<string | null>(null);

const optedIn = computed(() => auth.user?.leaderboard_opt_in === true);
const currentUserId = computed(() => auth.user?.id ?? null);

async function loadPapers() {
  papersLoading.value = true;
  try {
    papers.value = await lessonsApi.listPapers();
  } catch (_e) {
    // Non-fatal - paper filter just stays empty. Don't surface the error
    // because the main leaderboard still loads.
  } finally {
    papersLoading.value = false;
  }
}

async function loadLeaderboard() {
  loading.value = true;
  errorMsg.value = null;
  try {
    entries.value = await leaderboardsApi.get({
      window: window_.value,
      paper_id: paperId.value,
      limit: 50,
    });
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to load leaderboard';
    entries.value = [];
  } finally {
    loading.value = false;
  }
}

async function onOptIn() {
  if (togglingOptIn.value) return;
  togglingOptIn.value = true;
  optInError.value = null;
  try {
    const updated = await profileApi.updatePreferences({ leaderboard_opt_in: true });
    auth.setUser(updated);
    // Re-fetch the board - your row should appear once your data is included.
    await loadLeaderboard();
  } catch (e) {
    optInError.value = extractError(e) ?? 'failed to enable leaderboards';
  } finally {
    togglingOptIn.value = false;
  }
}

function extractError(e: unknown): string | null {
  if (e instanceof AxiosError) {
    const msg = (e.response?.data as { message?: string | string[] })?.message;
    return Array.isArray(msg) ? msg.join(', ') : msg ?? null;
  }
  return null;
}

// Reload whenever the filters change.
watch([window_, paperId], () => loadLeaderboard());

onMounted(() => {
  loadPapers();
  loadLeaderboard();
});
</script>

<template>
  <main class="page">
    <AppNav />
    <div class="container">
      <header class="page-head">
        <h1>{{ t('leaderboards.title') }}</h1>
        <p class="dim">{{ t('leaderboards.subtitle') }}</p>
      </header>

      <!-- Opt-in banner - only shown to users who haven't opted in. -->
      <div v-if="!optedIn" class="leaderboard-optin-banner">
        <div>
          <div class="leaderboard-optin-title">{{ t('leaderboards.optin_title') }}</div>
          <p class="dim text-sm">{{ t('leaderboards.optin_body') }}</p>
          <p v-if="optInError" class="error-text">{{ optInError }}</p>
        </div>
        <button class="btn btn-primary" :disabled="togglingOptIn" @click="onOptIn">
          {{ togglingOptIn ? t('common.saving') : t('leaderboards.optin_enable') }}
        </button>
      </div>

      <!-- Filter toolbar: window tabs + paper picker -->
      <div class="leaderboard-toolbar">
        <div class="content-tabs">
          <button v-for="w in (['week', 'month', 'all'] as const)" :key="w" type="button"
            :class="['content-tab', { active: window_ === w }]" @click="window_ = w">
            {{ t(`leaderboards.window_${w}`) }}
          </button>
        </div>

        <select v-model="paperId" class="leaderboard-paper-select">
          <option :value="null">{{ t('leaderboards.all_papers') }}</option>
          <option v-for="p in papers" :key="p.id" :value="p.id">
            {{ p.code }} · {{ p.name }}
          </option>
        </select>
      </div>

      <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
      <p v-if="loading" class="dim text-sm">{{ t('common.loading') }}</p>

      <!-- Empty state -->
      <div v-if="!loading && entries.length === 0" class="leaderboard-empty">
        <p class="dim">{{ t('leaderboards.empty') }}</p>
      </div>

      <!-- Table -->
      <table v-if="!loading && entries.length > 0" class="leaderboard-table">
        <thead>
          <tr>
            <th class="lb-col-rank">{{ t('leaderboards.col_rank') }}</th>
            <th>{{ t('leaderboards.col_name') }}</th>
            <th class="lb-col-num">{{ t('leaderboards.col_level') }}</th>
            <th class="lb-col-num">{{ t('leaderboards.col_xp') }}</th>
            <th class="lb-col-num">{{ t('leaderboards.col_streak') }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="e in entries" :key="e.user_id" :class="{ 'lb-row-self': e.user_id === currentUserId }">
            <td class="lb-col-rank mono">{{ e.rank }}</td>
            <td>
              <!-- Clickable name → public profile page. Stays a regular row
                   (no whole-row click handler) so users can still select text
                   in the rank/level/xp columns without accidentally navigating. -->
              <RouterLink :to="lp(`/users/${e.user_id}`)" class="lb-name-link">
                {{ e.display_name }}
              </RouterLink>
              <span v-if="e.user_id === currentUserId" class="lb-you-badge">
                {{ t('leaderboards.you_badge') }}
              </span>
            </td>
            <td class="lb-col-num">{{ e.level }}</td>
            <td class="lb-col-num">{{ e.xp_in_window.toLocaleString() }}</td>
            <td class="lb-col-num">
              {{ e.streak_count }}<span v-if="e.streak_count > 0" class="lb-streak-fire">🔥</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </main>
</template>
