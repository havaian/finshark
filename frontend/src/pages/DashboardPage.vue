<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../stores/auth.store';
import { useLocaleStore } from '../stores/locale.store';
import { useLocalePath } from '../router/useLocalePath';
import { lessonsApi } from '../api/lessons.api';
import AppNav from '../components/AppNav.vue';
import type { Paper } from '../types/content';

const { t } = useI18n();
const auth = useAuthStore();
const router = useRouter();
const locale = useLocaleStore();
const lp = useLocalePath();

const papers = ref<Paper[]>([]);
const selectedPaperId = ref<string>('');
const papersLoading = ref(false);
const starting = ref(false);
const errorMsg = ref<string | null>(null);

const hasPapers = computed(() => papers.value.length > 0);

onMounted(async () => {
  try {
    await auth.fetchMe();
  } catch {
    /* axios interceptor handles forced-logout */
  }
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
  } finally {
    starting.value = false;
  }
}

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

      <section class="mt-8">
        <div class="row" style="justify-content: space-between; margin-bottom: 14px;">
          <h2>{{ t('dashboard.start_lesson_heading') }}</h2>
          <RouterLink :to="lp(`/progress`)" class="btn-link">{{ t('dashboard.view_progress') }}</RouterLink>
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
              {{ p.code }} — {{ p.name }}
            </option>
          </select>
          <button class="btn btn-primary" :disabled="starting" @click="onStartLesson">
            {{ starting ? t('dashboard.starting') : t('dashboard.start_lesson_btn') }}
          </button>
        </div>

        <!-- Mock CTA — secondary action below the lesson row. Always offered
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
