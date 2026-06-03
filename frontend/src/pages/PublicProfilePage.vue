<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { publicProfileApi, type PublicProfileResponse } from '../api/public-profile.api';
import { achievementsApi } from '../api/achievements.api';
import type { PublicEarnedAchievement } from '../types/achievements';
import { useAuthStore } from '../stores/auth.store';
import { useLocalePath } from '../router/useLocalePath';
import { fmtDate } from '../i18n/dates';
import AppNav from '../components/AppNav.vue';

// Public profile page - reached by clicking a name on the leaderboard. Shows
// the viewed user's identity + progression stats + earned badges only. Never
// shows email, preferences, or admin flag (none of which are even returned
// by the backend endpoint).
//
// Edge cases handled:
//   - Viewer is looking at their own profile: we redirect-ish by rendering
//     a hint linking them to the editable /profile page, instead of a
//     read-only view of themselves.
//   - User not found → 404 from API → error_text in the empty state.

const { t, locale } = useI18n();
const route = useRoute();
const auth = useAuthStore();
const lp = useLocalePath();

const profile = ref<PublicProfileResponse | null>(null);
const loading = ref(true);
const errorMsg = ref<string | null>(null);
const notFound = ref(false);

// Earned achievements for the viewed user. Fetched in parallel with the
// main profile; failure is non-fatal (the section just hides). Same locale-
// reload behaviour as the rest of the page.
const achievements = ref<PublicEarnedAchievement[]>([]);

async function load() {
  const id = route.params.id as string;
  loading.value = true;
  errorMsg.value = null;
  notFound.value = false;
  achievements.value = [];
  try {
    // Run both in parallel; if the main profile 404s we want to stop, but
    // achievements failing is non-fatal so we wrap it independently.
    const [p, a] = await Promise.allSettled([
      publicProfileApi.getById(id),
      achievementsApi.getForUser(id),
    ]);
    if (p.status === 'rejected') {
      throw p.reason;
    }
    profile.value = p.value;
    achievements.value = a.status === 'fulfilled' ? a.value : [];
  } catch (e) {
    if (e instanceof AxiosError && e.response?.status === 404) {
      notFound.value = true;
    } else {
      errorMsg.value = extractError(e) ?? 'failed to load profile';
    }
    profile.value = null;
  } finally {
    loading.value = false;
  }
}

function extractError(e: unknown): string | null {
  if (e instanceof AxiosError) {
    const msg = (e.response?.data as { message?: string | string[] })?.message;
    return Array.isArray(msg) ? msg.join(', ') : msg ?? null;
  }
  return null;
}

// Re-fetch on locale change so badge names/descriptions update - the backend
// localises them via the X-Lang header which the axios interceptor reads
// from localStorage on every request.
watch(() => locale.value, load);

// Re-fetch when the route id changes (clicking from one user's profile to
// another via leaderboard would otherwise show stale data).
watch(() => route.params.id, (newId) => {
  if (newId) load();
});

onMounted(load);
</script>

<template>
  <main class="page">
    <AppNav />
    <div class="container">

      <header class="page-head">
        <h1>{{ profile?.display_name ?? t('public_profile.title') }}</h1>
      </header>

      <p v-if="loading" class="dim text-sm">{{ t('common.loading') }}</p>

      <p v-else-if="notFound" class="dim">{{ t('public_profile.not_found') }}</p>

      <p v-else-if="errorMsg" class="error-text">{{ errorMsg }}</p>

      <template v-else-if="profile">
        <!-- Self-view hint: looking at your own public profile is allowed but
             unhelpful. Suggest the editable /profile route instead. -->
        <div v-if="auth.user && auth.user.id === profile.id" class="card" style="margin-bottom: 16px;">
          <p class="dim text-sm" style="margin: 0;">
            {{ t('public_profile.viewing_self') }}
            <RouterLink :to="lp(`/profile`)" class="btn-link accent" style="margin-left: 8px;">
              {{ t('public_profile.viewing_self_link') }}
            </RouterLink>
          </p>
        </div>

        <!-- Identity card: avatar + display name + joined date. -->
        <section class="card profile-identity">
          <div class="profile-avatar-big">
            {{ profile.display_name.slice(0, 1).toUpperCase() }}
          </div>
          <div>
            <h2 style="margin: 0;">{{ profile.display_name }}</h2>
            <p class="dim text-sm mt-2" style="margin: 8px 0 0;">
              {{ t('profile.joined') }}: {{ fmtDate(profile.created_at) }}
            </p>
          </div>
        </section>

        <!-- Stats row: 4 tiles. Same visual rhythm as Dashboard.stats but
             with 4 columns since we have one extra metric (accuracy). -->
        <section class="public-profile-stats mt-6">
          <div class="stat">
            <div class="stat-lbl">{{ t('dashboard.level') }}</div>
            <div class="stat-val">{{ profile.level }}</div>
          </div>
          <div class="stat">
            <div class="stat-lbl">{{ t('dashboard.xp') }}</div>
            <div class="stat-val">{{ profile.xp }}</div>
          </div>
          <div class="stat stat-streak">
            <div class="stat-lbl">{{ t('dashboard.streak') }}</div>
            <div class="stat-val">{{ profile.streak_count }} <span class="stat-fire">🔥</span></div>
          </div>
          <div class="stat">
            <div class="stat-lbl">{{ t('public_profile.lessons') }}</div>
            <div class="stat-val">{{ profile.total_lessons }}</div>
          </div>
          <div class="stat">
            <div class="stat-lbl">{{ t('public_profile.accuracy') }}</div>
            <div class="stat-val">
              {{ profile.accuracy_pct === null ? '-' : `${Math.round(profile.accuracy_pct)}%` }}
            </div>
          </div>
        </section>

        <!-- Earned badges -->
        <section class="card mt-6">
          <h2>{{ t('public_profile.badges_section') }}</h2>
          <p v-if="profile.badges.length === 0" class="dim text-sm mt-4">
            {{ t('public_profile.no_badges') }}
          </p>
          <div v-else class="badges-grid mt-4">
            <div v-for="b in profile.badges" :key="b.code" class="badge-tile" :title="b.description">
              <div class="badge-tile-icon">{{ b.icon }}</div>
              <div class="badge-tile-name">{{ b.name }}</div>
              <div v-if="b.earned_at" class="dim text-xs mt-1">
                {{ fmtDate(b.earned_at) }}
              </div>
            </div>
          </div>
        </section>

        <!-- Earned achievements - parallel system. Only shows items at
             level >= 1 (locked ones are owner-only and would be noise on
             someone else's profile). Each tile shows icon, name, current
             level name (Trainee/Affiliate/Member), and when reached. -->
        <section class="card mt-6">
          <h2>{{ t('public_profile.achievements_section') }}</h2>
          <p v-if="achievements.length === 0" class="dim text-sm mt-4">
            {{ t('public_profile.no_achievements') }}
          </p>
          <div v-else class="achievements-public-grid mt-4">
            <div v-for="a in achievements" :key="a.code" class="achievement-public-tile" :title="a.description">
              <div class="achievement-public-icon">{{ a.icon }}</div>
              <div class="achievement-public-name">{{ a.name }}</div>
              <div class="achievement-public-level">
                {{ a.current_level_name }}
                <span class="dim text-xs">
                  ({{ t('public_profile.achievements_level_short', {
                    level: a.current_level,
                  }) }})
                </span>
              </div>
              <div v-if="a.unlocked_at" class="dim text-xs mt-1">
                {{ fmtDate(a.unlocked_at) }}
              </div>
            </div>
          </div>
        </section>
      </template>

    </div>
  </main>
</template>

<style scoped>
/* Stats row uses 5 columns; falls back via grid auto-flow to wrap on narrow
   viewports. Padding/typography inherits from .stat in style.css. */
.public-profile-stats {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 12px;
}

@media (max-width: 720px) {
  .public-profile-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 380px) {
  .public-profile-stats {
    grid-template-columns: 1fr;
  }
}

/* Big avatar - distinct from the small AppNav avatar so the identity card
   feels like a "profile page" not a nav element. */
.profile-avatar-big {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: var(--accent);
  color: #fff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  font-weight: 600;
  flex-shrink: 0;
}
</style>
