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

// Mock breakdown - shown after a mock completes. Per-LO accuracy bars + an
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

// Score header now reflects the backend's marks-based result (marks awarded /
// available, scored against the paper's pass mark) rather than raw question
// accuracy. For an all-OT exam where every question is 2 marks these coincide,
// but the marks model is the source of truth and handles non-uniform sections.
const percent = computed(() => breakdown.value?.percent ?? 0);
const passed = computed(() => breakdown.value?.passed ?? false);
const passMark = computed(() => breakdown.value?.pass_mark_pct ?? 50);

// Whether we have any marks to show. Legacy flat mocks (no section_code) still
// produce marks via the implicit-section fallback, so this is almost always
// true; it guards the degenerate "no attempts" case.
const hasMarks = computed(() => (breakdown.value?.marks_available ?? 0) > 0);

// Only show the per-section card when there's more than one section, or a
// section that isn't the plain implicit "A" - otherwise it just restates the
// overall score. Single-section ACCA papers (F1-F3) skip it.
const showSections = computed(() => {
  const secs = breakdown.value?.per_section ?? [];
  if (secs.length > 1) return true;
  return secs.some((s) => !s.scored);
});

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
    // like any other lesson - including showing theory primers and hearts.
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
        <!-- Overall score card. Percent + pass/fail keyed to the paper's pass
             mark; marks awarded/available shown beneath. -->
        <section :class="['card mock-overall-card', passed ? 'passed' : 'failed']">
          <div class="mock-overall-pct">{{ percent }}%</div>
          <div class="mock-overall-fraction">
            <template v-if="hasMarks">
              {{ t('mocks.marks_fraction', { awarded: breakdown.marks_awarded, available: breakdown.marks_available }) }}
            </template>
            <template v-else>
              {{ breakdown.correct }} / {{ breakdown.total }}
            </template>
          </div>
          <div class="mock-overall-label">
            {{ passed ? t('mocks.passed_label') : t('mocks.failed_label') }}
          </div>
          <div class="mock-overall-passmark dim text-xs">
            {{ t('mocks.pass_mark_note', { pct: passMark }) }}
          </div>
        </section>

        <!-- Per-section marks (only when there's more than one section, or an
             unscored MTQ section to flag). Single-section papers skip this. -->
        <section v-if="showSections" class="card mt-6">
          <h2>{{ t('mocks.per_section_title') }}</h2>
          <ul class="mock-section-list">
            <li v-for="s in breakdown.per_section" :key="s.code" class="mock-section-row">
              <span class="mock-section-code">{{ t('mocks.section_label', { code: s.code }) }}</span>
              <span v-if="s.scored" class="dim text-sm">
                {{ t('mocks.marks_fraction', { awarded: s.marks_awarded, available: s.marks_available }) }}
                <span class="mono dim text-xs" style="margin-left: 6px;">({{ s.correct }} / {{ s.total }})</span>
              </span>
              <span v-else class="dim text-sm">
                {{ t('mocks.section_not_marked', { count: s.total }) }}
              </span>
            </li>
          </ul>
        </section>

        <!-- Per-LO breakdown. Each row: code · title · count · bar · pct.
             Sort here would be redundant - the backend orders by LO sort_order. -->
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

        <!-- Actions:
             - "Review answers" → MockReviewPage (read-only per-question walkthrough)
             - "Practice wrong answers" → existing flow that spins up a lesson session
             - "Done" → back to dashboard
             The breakdown page is the post-mock landing; the review page is
             where users actually inspect what they got wrong. -->
        <div class="row mt-6" style="gap: 12px; justify-content: flex-end; flex-wrap: wrap;">
          <RouterLink :to="lp(`/dashboard`)" class="btn btn-ghost">
            {{ t('mocks.done_btn') }}
          </RouterLink>
          <RouterLink :to="lp(`/mocks/${sessionId}/review`)" class="btn btn-ghost">
            {{ t('mocks.review_answers_btn') }}
          </RouterLink>
          <button v-if="hasWrongs" class="btn btn-primary" :disabled="startingReview" @click="onStartReview">
            {{ startingReview ? t('mocks.review_starting') : t('mocks.review_practice_btn') }}
          </button>
        </div>
      </template>
    </div>
  </main>
</template>
