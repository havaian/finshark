<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { lessonsApi } from '../api/lessons.api';
import { mocksApi } from '../api/mocks.api';
import { useAuthStore } from '../stores/auth.store';
import { useLocaleStore } from '../stores/locale.store';
import { useEntitlementStore } from '../stores/entitlement.store';
import AppNav from '../components/AppNav.vue';
import type { Paper } from '../types/content';

// Mock start picker - paper + question count + time limit.
// Submits POST /mocks then navigates to /lesson/:session_id (LessonPage
// renders mock-mode UI based on the session.mode it gets back from /sessions).

// Preset choices. These are the only allowed values (no free-form input) so
// the user can't accidentally type 999 questions. Backend caps at 5..100 for
// question_count and 5..240 minutes for time, so all presets here are valid.
const COUNT_PRESETS: number[] = [10, 20, 35, 50];
const MINUTE_PRESETS: number[] = [15, 30, 60, 120];

const { t } = useI18n();
const router = useRouter();
const auth = useAuthStore();
const locale = useLocaleStore();
const entitlement = useEntitlementStore();

const papers = ref<Paper[]>([]);
const papersLoading = ref(true);
const papersError = ref<string | null>(null);

// Default selections favour a "full F3 mock" feel: 35 questions, 60 minutes.
// preferred_paper_id from the user's onboarding gets picked when papers load.
const paperId = ref<string | null>(null);
const questionCount = ref<number>(35);
const minutes = ref<number>(60);

const submitting = ref(false);
const submitError = ref<string | null>(null);

// Free-tier mock gates. Premium users bypass these - same shape as
// DashboardPage so the chrome stays consistent.
//   - blockedByPaper: selected paper is premium-only.
//   - blockedByQuota: monthly mock allowance already used.
// Both are reactive on the entitlement store; the start button respects
// them so we don't even hit the server for a known-blocked attempt.
const blockedByPaper = computed(() => {
  if (!entitlement.isFree) return false;
  if (!paperId.value) return false;
  const p = papers.value.find((x) => x.id === paperId.value);
  return p ? !p.free_accessible : false;
});

const blockedByQuota = computed(() => {
  if (!entitlement.isFree) return false;
  const ent = entitlement.entitlement;
  if (!ent || ent.mocks.limit === null) return false;
  return ent.mocks.used >= ent.mocks.limit;
});

const canSubmit = computed(
  () =>
    !!paperId.value &&
    questionCount.value > 0 &&
    !submitting.value &&
    !blockedByPaper.value &&
    !blockedByQuota.value,
);

// Friendly explanation shown below the start button when the gate is
// blocking. Mirrors the dashboard quotaBlockMsg pattern.
const quotaBlockMsg = computed<string | null>(() => {
  if (!entitlement.isFree) return null;
  if (blockedByPaper.value) return t('dashboard.paper_locked_suffix');
  if (blockedByQuota.value) return t('dashboard.quota_mocks_exhausted');
  return null;
});

async function loadPapers() {
  papersLoading.value = true;
  papersError.value = null;
  try {
    papers.value = await lessonsApi.listPapers();
    // Pre-select the user's preferred paper from onboarding if present and
    // the list contains it; otherwise fall back to the first paper.
    const preferred = auth.user?.preferred_paper_id;
    if (preferred && papers.value.some((p) => p.id === preferred)) {
      paperId.value = preferred;
    } else if (papers.value.length > 0) {
      paperId.value = papers.value[0].id;
    }
  } catch (e) {
    papersError.value = extractError(e) ?? 'failed to load papers';
  } finally {
    papersLoading.value = false;
  }
}

async function onStart() {
  if (!canSubmit.value || !paperId.value) return;
  submitting.value = true;
  submitError.value = null;
  try {
    const result = await mocksApi.start({
      paper_id: paperId.value,
      question_count: questionCount.value,
      time_limit_seconds: minutes.value * 60,
    });
    // LessonPage handles both lesson and mock sessions - it inspects
    // session.mode from getSession() and switches UI accordingly.
    router.push({ name: 'lesson', params: { lang: locale.lang, session_id: result.session_id } });
  } catch (e) {
    submitError.value = extractError(e) ?? 'failed to start mock';
    // 403 ≈ free-tier gate trip - refresh chrome chips so the cap counter
    // updates to whatever the server thinks the truth is.
    if (e instanceof AxiosError && e.response?.status === 403) {
      void entitlement.fetch();
    }
  } finally {
    submitting.value = false;
  }
}

function extractError(e: unknown): string | null {
  if (e instanceof AxiosError) {
    const msg = (e.response?.data as { message?: string | string[] })?.message;
    return Array.isArray(msg) ? msg.join(', ') : msg ?? null;
  }
  return null;
}

onMounted(loadPapers);
</script>

<template>
  <main class="page">
    <AppNav />
    <div class="container">
      <header class="page-head">
        <h1>{{ t('mocks.start_title') }}</h1>
        <p class="dim">{{ t('mocks.start_subtitle') }}</p>
      </header>

      <section class="card mock-start-card">
        <!-- Paper picker -->
        <div class="field">
          <label class="field-label">{{ t('mocks.paper_label') }}</label>
          <p v-if="papersError" class="error-text">{{ papersError }}</p>
          <p v-if="papersLoading" class="dim text-sm">{{ t('common.loading') }}</p>
          <div v-else-if="papers.length === 0" class="dim text-sm">
            {{ t('mocks.no_papers') }}
          </div>
          <div v-else class="mock-paper-options">
            <button v-for="p in papers" :key="p.id" type="button"
              :class="['mock-option', { selected: paperId === p.id }]" @click="paperId = p.id">
              <span class="mono">{{ p.code }}</span>
              <span class="dim" style="margin-left: 8px;">{{ p.name }}</span>
              <span v-if="entitlement.isFree && !p.free_accessible" class="dim" style="margin-left: 8px;">
                {{ t('dashboard.paper_locked_suffix') }}
              </span>
            </button>
          </div>
        </div>

        <!-- Question count -->
        <div class="field mt-4">
          <label class="field-label">{{ t('mocks.count_label') }}</label>
          <div class="mock-presets">
            <button v-for="n in COUNT_PRESETS" :key="n" type="button"
              :class="['mock-option mock-option-compact', { selected: questionCount === n }]"
              @click="questionCount = n">
              {{ n }}
            </button>
          </div>
        </div>

        <!-- Time limit -->
        <div class="field mt-4">
          <label class="field-label">{{ t('mocks.time_label') }}</label>
          <div class="mock-presets">
            <button v-for="m in MINUTE_PRESETS" :key="m" type="button"
              :class="['mock-option mock-option-compact', { selected: minutes === m }]" @click="minutes = m">
              {{ t('mocks.time_minutes', { n: m }) }}
            </button>
          </div>
          <p class="input-help">{{ t('mocks.time_help') }}</p>
        </div>

        <p v-if="submitError" class="error-text">{{ submitError }}</p>
        <p v-if="quotaBlockMsg" class="dim text-sm">{{ quotaBlockMsg }}</p>

        <div class="row mt-6" style="justify-content: flex-end;">
          <button class="btn btn-primary" :disabled="!canSubmit" @click="onStart">
            {{ submitting ? t('mocks.starting') : t('mocks.start_btn') }}
          </button>
        </div>
      </section>
    </div>
  </main>
</template>

<style>
.card.mock-start-card {
  padding-bottom: 0.5em;
}
</style>