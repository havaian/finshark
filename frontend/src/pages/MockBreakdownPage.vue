<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { mocksApi } from '../api/mocks.api';
import { useLocaleStore } from '../stores/locale.store';
import { useLocalePath } from '../router/useLocalePath';
import AppNav from '../components/AppNav.vue';
import type { MockBreakdown } from '../types/mocks';

// Mock breakdown — shown after a mock completes. Per-LO accuracy bars + an
// overall score header + a "Start review session" button that creates a
// regular lesson from the wrong questions and navigates the user into it.

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const locale = useLocaleStore();
const lp = useLocalePath();

const sessionId = route.params.session_id as string;

const breakdown = ref<MockBreakdown | null>(null);
const loading = ref(true);
const errorMsg = ref<string | null>(null);
const startingReview = ref(false);

// Overall accuracy percentage, computed locally so we don't re-roundtrip.
const overallPct = computed(() => {
  if (!breakdown.value || breakdown.value.total === 0) return 0;
  return Math.round((breakdown.value.correct / breakdown.value.total) * 100);
});

// "Pass mark" gloss — 50% is the ACCA pass mark and a useful psychological
// reference. Renders different copy below 50 vs above.
const passed = computed(() => overallPct.value >= 50);

const hasWrongs = computed(
  () => (breakdown.value?.wrong_question_ids.length ?? 0) > 0,
);

async function load() {
  loading.value = true;
  errorMsg.value = null;
  try {
    breakdown.value = await mocksApi.breakdown(sessionId);
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to load breakdown';
  } finally {
    loading.value = false;
  }
}

async function onStartReview() {
  if (startingReview.value || !hasWrongs.value) return;
  startingReview.value = true;
  errorMsg.value = null;
  try {
    const result = await mocksApi.startReview(sessionId);
    // Navigate into the new (regular-lesson) session. LessonPage handles it
    // like any other lesson — including showing theory primers and hearts.
    router.push({ name: 'lesson', params: { lang: locale.lang, session_id: result.session_id } });
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to start review session';
  } finally {
    startingReview.value = false;
  }
}

function loBarColor(pct: number): string {
  // Threshold scheme: <50 red, 50..79 amber, >=80 success.
  if (pct >= 80) return 'var(--success)';
  if (pct >= 50) return 'var(--amber)';
  return 'var(--danger)';
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
    <div class="container">
      <header class="page-head">
        <h1>{{ t('mocks.breakdown_title') }}</h1>
      </header>

      <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
      <p v-if="loading" class="dim">{{ t('common.loading') }}</p>

      <template v-else-if="breakdown">
        <!-- Overall score card. Color/copy keyed to the 50% pass mark. -->
        <section :class="['card mock-overall-card', passed ? 'passed' : 'failed']">
          <div class="mock-overall-pct">{{ overallPct }}%</div>
          <div class="mock-overall-fraction">
            {{ breakdown.correct }} / {{ breakdown.total }}
          </div>
          <div class="mock-overall-label">
            {{ passed ? t('mocks.passed_label') : t('mocks.failed_label') }}
          </div>
        </section>

        <!-- Per-LO breakdown. Each row: code · title · count · bar · pct.
             Sort here would be redundant — the backend orders by LO sort_order. -->
        <section class="card mt-6">
          <h2>{{ t('mocks.per_lo_title') }}</h2>
          <p v-if="breakdown.per_lo.length === 0" class="dim text-sm mt-2">
            {{ t('mocks.no_attempts') }}
          </p>
          <ul v-else class="mock-lo-list">
            <li v-for="lo in breakdown.per_lo" :key="lo.lo_id" class="mock-lo-row">
              <div class="mock-lo-head">
                <span class="mono dim text-xs">{{ lo.lo_code }}</span>
                <span class="mock-lo-title">{{ lo.lo_title }}</span>
                <span class="dim text-sm">{{ lo.correct }} / {{ lo.total }}</span>
              </div>
              <div class="mock-lo-bar-track">
                <div class="mock-lo-bar-fill"
                  :style="{ width: lo.accuracy_pct + '%', background: loBarColor(lo.accuracy_pct) }"></div>
              </div>
              <div class="mock-lo-pct mono dim text-xs">{{ lo.accuracy_pct }}%</div>
            </li>
          </ul>
        </section>

        <!-- Actions: review wrongs (if any), or back to dashboard. -->
        <div class="row mt-6" style="gap: 12px; justify-content: flex-end;">
          <RouterLink :to="lp(`/dashboard`)" class="btn btn-ghost">
            {{ t('mocks.done_btn') }}
          </RouterLink>
          <button v-if="hasWrongs" class="btn btn-primary" :disabled="startingReview" @click="onStartReview">
            {{ startingReview ? t('mocks.review_starting') : t('mocks.review_btn') }}
          </button>
        </div>
      </template>
    </div>
  </main>
</template>
