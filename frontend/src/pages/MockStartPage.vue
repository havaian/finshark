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
import type { Paper, ExamStructure } from '../types/content';

// Mock start picker - paper only. The exam format (sections, question count,
// marks, duration) is fixed by the paper's exam_structure, mirroring a real
// ACCA CBE: the user does NOT choose a length or a timer. We show the format
// as a read-only summary so they know what they're about to sit, then start.
// Submits POST /mocks then navigates to /lesson/:session_id (LessonPage renders
// mock-mode UI based on the session.mode it gets back from /sessions).

const { t } = useI18n();
const router = useRouter();
const auth = useAuthStore();
const locale = useLocaleStore();
const entitlement = useEntitlementStore();

const papers = ref<Paper[]>([]);
const papersLoading = ref(true);
const papersError = ref<string | null>(null);

const paperId = ref<string | null>(null);

const submitting = ref(false);
const submitError = ref<string | null>(null);

const selectedPaper = computed<Paper | null>(
  () => papers.value.find((p) => p.id === paperId.value) ?? null,
);

// The exam_structure of the currently selected paper, used to render the
// format summary.
const structure = computed<ExamStructure | null>(
  () => selectedPaper.value?.exam_structure ?? null,
);

// Total questions across all sections.
const totalQuestions = computed<number>(() => {
  if (!structure.value) return 0;
  return structure.value.sections.reduce((sum, s) => sum + s.question_count, 0);
});

// Total available marks: ot sections contribute question_count * marks_each;
// mtq sections contribute marks_total. Mirrors the backend examTotalMarks.
const totalMarks = computed<number>(() => {
  if (!structure.value) return 0;
  return structure.value.sections.reduce((sum, s) => {
    if (s.kind === 'ot') return sum + s.question_count * (s.marks_each ?? 0);
    return sum + (s.marks_total ?? 0);
  }, 0);
});

// Duration in whole minutes for display.
const durationMinutes = computed<number>(() =>
  structure.value ? Math.round(structure.value.duration_seconds / 60) : 0,
);

// Whether any section is the not-yet-supported MTQ kind. If a paper's only
// content is MTQ the backend can't build a playable mock yet; we surface that
// rather than letting the user start an exam that comes back empty.
const hasOtSection = computed<boolean>(
  () => !!structure.value?.sections.some((s) => s.kind === 'ot'),
);
const hasMtqSection = computed<boolean>(
  () => !!structure.value?.sections.some((s) => s.kind === 'mtq'),
);

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
    hasOtSection.value &&
    !submitting.value &&
    !blockedByPaper.value &&
    !blockedByQuota.value,
);

// Friendly explanation shown below the start button when something blocks.
const quotaBlockMsg = computed<string | null>(() => {
  if (blockedByPaper.value) return t('dashboard.paper_locked_suffix');
  if (blockedByQuota.value) return t('dashboard.quota_mocks_exhausted');
  // Paper has no objective section the engine can build yet (MTQ-only).
  if (paperId.value && !hasOtSection.value) return t('mocks.format_unavailable');
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
    const result = await mocksApi.start({ paper_id: paperId.value });
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

        <!-- Exam format summary (read-only; the format is fixed by the paper) -->
        <div v-if="structure" class="field mt-4">
          <label class="field-label">{{ t('mocks.format_label') }}</label>
          <div class="mock-format">
            <div class="mock-format-stats">
              <div class="mock-format-stat">
                <span class="mock-format-value">{{ totalQuestions }}</span>
                <span class="mock-format-key">{{ t('mocks.format_questions') }}</span>
              </div>
              <div class="mock-format-stat">
                <span class="mock-format-value">{{ totalMarks }}</span>
                <span class="mock-format-key">{{ t('mocks.format_marks') }}</span>
              </div>
              <div class="mock-format-stat">
                <span class="mock-format-value">{{ durationMinutes }}</span>
                <span class="mock-format-key">{{ t('mocks.format_minutes') }}</span>
              </div>
              <div class="mock-format-stat">
                <span class="mock-format-value">{{ structure.pass_mark_pct }}%</span>
                <span class="mock-format-key">{{ t('mocks.format_pass_mark') }}</span>
              </div>
            </div>

            <!-- Section breakdown -->
            <ul class="mock-format-sections">
              <li v-for="s in structure.sections" :key="s.code" class="mock-format-section">
                <span class="mock-format-section-code">{{ t('mocks.section_label', { code: s.code }) }}</span>
                <span class="dim">
                  <template v-if="s.kind === 'ot'">
                    {{ t('mocks.section_ot_desc', { count: s.question_count, marks: s.marks_each ?? 0 }) }}
                  </template>
                  <template v-else>
                    {{ t('mocks.section_mtq_desc', { count: s.question_count, marks: s.marks_total ?? 0 }) }}
                    <em class="mock-format-soon">{{ t('mocks.section_mtq_soon') }}</em>
                  </template>
                </span>
              </li>
            </ul>

            <p v-if="hasMtqSection && hasOtSection" class="input-help">
              {{ t('mocks.format_mtq_partial_note') }}
            </p>
          </div>
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

.mock-format {
  border: 1px solid var(--border, #d9e0d6);
  border-radius: 10px;
  padding: 16px;
  background: var(--surface-2, #f6f8f4);
}

.mock-format-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.mock-format-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  min-width: 0;
}

.mock-format-value {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text, #2f3a2a);
  line-height: 1.1;
}

.mock-format-key {
  font-size: 0.75rem;
  color: var(--text-dim, #6f7a68);
  margin-top: 2px;
}

.mock-format-sections {
  list-style: none;
  margin: 14px 0 0;
  padding: 14px 0 0;
  border-top: 1px solid var(--border, #d9e0d6);
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mock-format-section {
  display: flex;
  gap: 10px;
  align-items: baseline;
  font-size: 0.9rem;
}

.mock-format-section-code {
  font-weight: 600;
  color: var(--text, #2f3a2a);
  white-space: nowrap;
}

.mock-format-soon {
  margin-left: 6px;
  font-style: normal;
  font-size: 0.72rem;
  padding: 1px 6px;
  border-radius: 999px;
  background: var(--surface-3, #e7ece2);
  color: var(--text-dim, #6f7a68);
}

@media (max-width: 560px) {
  .mock-format-stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
