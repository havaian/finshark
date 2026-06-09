<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../stores/auth.store';
import { useLocaleStore } from '../stores/locale.store';
import { useEntitlementStore } from '../stores/entitlement.store';
import { useLocalePath } from '../router/useLocalePath';
import { lessonsApi } from '../api/lessons.api';
import AppNav from '../components/AppNav.vue';
import type { Paper } from '../types/content';

const { t } = useI18n();
const auth = useAuthStore();
const router = useRouter();
const locale = useLocaleStore();
const lp = useLocalePath();
const entitlement = useEntitlementStore();

const papers = ref<Paper[]>([]);
const selectedPaperId = ref<string>('');
// Defaults to true so the dashboard renders the "loading papers" line on
// first paint instead of flashing the "no papers" empty state during the
// gap between mount and the first listPapers() resolve. loadPapers() flips
// it off in its finally block.
const papersLoading = ref(true);
const starting = ref(false);
const errorMsg = ref<string | null>(null);

const hasPapers = computed(() => papers.value.length > 0);

onMounted(async () => {
  try {
    await auth.fetchMe();
  } catch {
    /* axios interceptor handles forced-logout */
  }
  // Refresh the entitlement on every dashboard mount. The store is only
  // bootstrapped once at app startup and elsewhere only refetched on a 403;
  // without this the quota chips and hearts-out banner stay stale after
  // returning from a lesson, so users would see "0/3 lessons today" even
  // after just completing two.
  void entitlement.fetch();
  await loadPapers();
});

async function loadPapers() {
  papersLoading.value = true;
  try {
    papers.value = await lessonsApi.listPapers();
    if (papers.value.length === 1) selectedPaperId.value = papers.value[0].id;
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to load papers';
  } finally {
    papersLoading.value = false;
  }
}

async function onStartLesson() {
  starting.value = true;
  errorMsg.value = null;
  try {
    const res = await lessonsApi.start({
      paper_id: selectedPaperId.value || undefined,
    });
    router.push({ name: 'lesson', params: { lang: locale.lang, session_id: res.session_id } });
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to start lesson';
    // 403 from start ≈ free-tier gate trip (lesson cap, heart pool, premium-
    // only paper). Refresh entitlement so the chrome chips reflect the
    // current state - the server already knows we hit the wall, and the
    // chip update is the affirmative explanation paired with the error.
    if (e instanceof AxiosError && e.response?.status === 403) {
      void entitlement.fetch();
    }
  } finally {
    starting.value = false;
  }
}

// True when the currently-selected paper (or the user's first paper if
// "Any" is chosen) is premium-only for a free user. Used to disable the
// start button so the gate is enforced in the UI before the server says no.
const blockedByPaper = computed(() => {
  if (!entitlement.isFree) return false;
  if (!selectedPaperId.value) return false;
  const p = papers.value.find((x) => x.id === selectedPaperId.value);
  return p ? !p.free_accessible : false;
});

// True when the free user has run out of their daily lesson allowance OR
// their daily heart pool. Either condition is a hard stop on lesson start.
const blockedByQuota = computed(() => {
  if (!entitlement.isFree) return false;
  const ent = entitlement.entitlement;
  if (!ent) return false;
  if (ent.lessons.limit !== null && ent.lessons.used >= ent.lessons.limit) return true;
  if (ent.hearts.pool !== null && ent.hearts.pool <= 0) return true;
  return false;
});

// True when the heart pool is specifically empty. Drives the prominent
// "no hearts left" banner - different surface treatment than the generic
// quotaBlockMsg line below (the latter is a small dim line under the start
// button which is too easy to miss for the most common free-tier wall).
const heartsEmpty = computed(() => {
  if (!entitlement.isFree) return false;
  const ent = entitlement.entitlement;
  return !!(ent && ent.hearts.pool !== null && ent.hearts.pool <= 0);
});

const startDisabled = computed(
  () => starting.value || blockedByPaper.value || blockedByQuota.value,
);

function extractError(e: unknown): string | null {
  if (e instanceof AxiosError) {
    const msg = (e.response?.data as { message?: string | string[] })?.message;
    return Array.isArray(msg) ? msg.join(', ') : msg ?? null;
  }
  return null;
}
</script>

<template>
  <main class="page">
    <AppNav />
    <div class="container">

      <h3>{{ t('dashboard.welcome_back') }}<span v-if="auth.user">, {{ auth.user.display_name }}</span></h3>
      <h1 style="margin-top: 8px;">{{ t('dashboard.keep_streak') }}</h1>

      <div class="stats mt-6" v-if="auth.user">
        <div class="stat stat-streak">
          <div class="stat-lbl">{{ t('dashboard.streak') }}</div>
          <div class="stat-val">{{ auth.user.streak_count }} <span class="stat-fire">🔥</span></div>
        </div>
        <div class="stat">
          <div class="stat-lbl">{{ t('dashboard.xp') }}</div>
          <div class="stat-val">{{ auth.user.xp }}</div>
        </div>
        <div class="stat">
          <div class="stat-lbl">{{ t('dashboard.level') }}</div>
          <div class="stat-val">{{ auth.user.level }}</div>
        </div>
      </div>

      <!-- Quota chips for free-tier users. Hidden entirely for premium (their
           limits are nulls). Renders only after the entitlement store has
           fetched so we don't flash 0/3 for premium users on a cold load. -->
      <div v-if="entitlement.isFree && entitlement.entitlement" class="row mt-4" style="gap: 8px; flex-wrap: wrap;">
        <span v-if="entitlement.entitlement.lessons.limit !== null" class="pill pill-grey">
          {{ t('dashboard.quota_lessons', {
            used: entitlement.entitlement.lessons.used,
            limit: entitlement.entitlement.lessons.limit,
          }) }}
        </span>
        <span v-if="entitlement.entitlement.hearts.max !== null" class="pill pill-grey">
          {{ t('dashboard.quota_hearts', {
            pool: entitlement.entitlement.hearts.pool ?? 0,
            max: entitlement.entitlement.hearts.max,
          }) }}
        </span>
        <span v-if="entitlement.entitlement.mocks.limit !== null" class="pill pill-grey">
          {{ t('dashboard.quota_mocks', {
            used: entitlement.entitlement.mocks.used,
            limit: entitlement.entitlement.mocks.limit,
          }) }}
        </span>
      </div>
      <div v-else-if="entitlement.isPremium" class="row mt-4">
        <span class="pill pill-accent">{{ t('dashboard.premium_badge') }}</span>
      </div>

      <!-- Premium upsell CTA. Only for free-tier users once the entitlement
           has loaded (same guard as the quota chips so it doesn't flash for
           premium users on a cold load). Links to the subscription page where
           they can pay by card transfer or redeem a code. -->
      <RouterLink v-if="entitlement.isFree && entitlement.entitlement" :to="lp(`/subscription`)"
        class="dashboard-upsell mt-6">
        <div class="dashboard-upsell-body">
          <div class="dashboard-upsell-title">{{ t('dashboard.upsell_title') }}</div>
          <div class="dashboard-upsell-sub">{{ t('dashboard.upsell_body') }}</div>
        </div>
        <span class="btn btn-primary dashboard-upsell-btn">{{ t('dashboard.upsell_cta') }}</span>
      </RouterLink>

      <section class="mt-8">
        <div class="row" style="justify-content: space-between; margin-bottom: 14px;">
          <h2>{{ t('dashboard.start_lesson_heading') }}</h2>
          <RouterLink :to="lp(`/progress`)" class="btn-link">{{ t('dashboard.view_progress') }}</RouterLink>
        </div>

        <!-- Hearts-empty banner. Loud, coloured, visually distinct from the
             generic "quota reached" suffix line below the start button -
             without this the most common free-tier wall (zero hearts) was a
             tiny dim line easy to scroll past. -->
        <div v-if="heartsEmpty" class="quota-block-banner" role="status">
          <span class="quota-block-banner-icon" aria-hidden="true">♡</span>
          <div class="quota-block-banner-body">
            <div class="quota-block-banner-title">{{ t('dashboard.hearts_empty_banner_title') }}</div>
            <div class="quota-block-banner-sub">{{ t('dashboard.hearts_empty_banner_sub') }}</div>
          </div>
        </div>

        <p v-if="papersLoading" class="dim text-sm">{{ t('dashboard.loading_papers') }}</p>
        <p v-else-if="!hasPapers" class="dim text-sm">
          {{ t('dashboard.no_papers') }}
          <span v-if="auth.user?.is_admin">
            <RouterLink :to="lp(`/admin/papers`)" class="btn-link accent">{{ t('dashboard.no_papers_admin') }}</RouterLink>
          </span>
        </p>

        <div v-else class="row dashboard-start-row">
          <select v-model="selectedPaperId" class="grow">
            <option value="">{{ t('dashboard.any_paper') }}</option>
            <option v-for="p in papers" :key="p.id" :value="p.id">
              {{ p.code }} - {{ p.name }}<template v-if="entitlement.isFree && !p.free_accessible"> · {{ t('dashboard.paper_locked_suffix') }}</template>
            </option>
          </select>
          <button class="btn btn-primary" :disabled="startDisabled" @click="onStartLesson">
            {{ starting ? t('dashboard.starting') : t('dashboard.start_lesson_btn') }}
          </button>
        </div>

        <!-- Mock CTA - secondary action below the lesson row. Always offered
             when papers exist; the mock page handles paper selection itself. -->
        <div v-if="papers.length > 0" class="row mt-4" style="justify-content: flex-end;">
          <RouterLink :to="lp(`/mocks/start`)" class="btn btn-ghost">
            {{ t('nav.mocks') }} →
          </RouterLink>
        </div>

        <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
      </section>

    </div>
  </main>
</template>
