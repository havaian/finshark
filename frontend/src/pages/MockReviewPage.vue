<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { mocksApi } from '../api/mocks.api';
import { useLocaleStore } from '../stores/locale.store';
import { useLocalePath } from '../router/useLocalePath';
import AppNav from '../components/AppNav.vue';
import type { MockAnswers, MockAnswerEntry } from '../types/mocks';

// Read-only per-question walkthrough of a completed mock. Distinct from the
// post-mock breakdown (per-LO accuracy summary) and from the practice-lesson
// review (POST /mocks/:id/review, which spins up a new lesson). This page
// just renders what happened - prompt, your answer, the correct answer,
// the explanation, and per-option why-wrong text.
//
// Filter chip: by default we show only wrong + unanswered (the things you'd
// want to study). Toggling to "all" reveals the correctly-answered ones too.

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const locale = useLocaleStore();
const lp = useLocalePath();

const sessionId = route.params.session_id as string;

const data = ref<MockAnswers | null>(null);
const loading = ref(true);
const errorMsg = ref<string | null>(null);

type Filter = 'incorrect' | 'all';
const filter = ref<Filter>('incorrect');

const startingReview = ref(false);

async function load() {
  loading.value = true;
  errorMsg.value = null;
  try {
    data.value = await mocksApi.answers(sessionId);
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to load review';
  } finally {
    loading.value = false;
  }
}

const filteredEntries = computed<MockAnswerEntry[]>(() => {
  if (!data.value) return [];
  if (filter.value === 'all') return data.value.entries;
  return data.value.entries.filter((e) => e.was_correct !== true);
});

const wrongCount = computed(() => {
  if (!data.value) return 0;
  return data.value.entries.filter((e) => e.was_correct === false).length;
});

const unansweredCount = computed(() => {
  if (!data.value) return 0;
  return data.value.entries.filter((e) => e.user_answer === null).length;
});

// Lookup helper: map a stored option key (e.g. "B") to its display text.
// Used in the user-answer / correct-answer chips when the answer is an MCQ
// key - otherwise we render the raw string (number_entry answers etc).
function optionTextForKey(entry: MockAnswerEntry, key: string | null): string {
  if (key === null) return '';
  if (!entry.options) return key;
  const opt = entry.options.find((o) => o.key === key);
  return opt ? `${opt.key}. ${opt.text}` : key;
}

function statusFor(entry: MockAnswerEntry): 'correct' | 'wrong' | 'unanswered' {
  if (entry.user_answer === null) return 'unanswered';
  return entry.was_correct ? 'correct' : 'wrong';
}

// ---- New-type review parsing ----
// The stored user_answer mirrors the wire format the play page sent:
//   mcq_multi  -> JSON key array ["B","C"] (or legacy comma "B,C")
//   true_false -> JSON label array ["No","Yes"] in statement order
//   matching   -> JSON value array [...] in row order
// correct_answer is the canonical form:
//   mcq_multi  -> comma-joined keys "B,C"
//   true_false -> comma-joined labels "No,Yes"
//   matching   -> "label=value | label=value | ..." in row order

// Parse a JSON string array; null on anything that isn't one.
function parseJsonArray(s: string | null): string[] | null {
  if (!s) return null;
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v.map((x) => String(x)) : null;
  } catch {
    return null;
  }
}

// mcq_multi correct/user key sets.
function mmCorrectKeys(entry: MockAnswerEntry): string[] {
  return entry.correct_answer.split(',').map((k) => k.trim()).filter(Boolean);
}
function mmUserKeys(entry: MockAnswerEntry): string[] {
  const arr = parseJsonArray(entry.user_answer);
  if (arr) return arr.map((k) => k.trim());
  // Legacy / comma fallback.
  return entry.user_answer
    ? entry.user_answer.split(',').map((k) => k.trim()).filter(Boolean)
    : [];
}

// true_false correct/user labels, per statement (index-aligned).
function tfCorrect(entry: MockAnswerEntry): string[] {
  return entry.correct_answer.split(',').map((l) => l.trim());
}
function tfUser(entry: MockAnswerEntry): (string | null)[] {
  return parseJsonArray(entry.user_answer) ?? [];
}

// Canonical EN value -> localized display label, using the answer-space pairs
// on the payload. Stored answers (user_answer, correct_answer) are always
// canonical EN, so review has to translate them back for display or a Russian
// review screen shows English chips under Russian row labels. true_false needs
// no equivalent: it renders the payload's own label objects directly.
function matchLabelFor(entry: MockAnswerEntry, value: string | null): string | null {
  if (value === null) return null;
  if (entry.payload && entry.payload.kind === 'matching') {
    const hit = entry.payload.options.find((o) => o.value === value);
    if (hit) return hit.label;
  }
  return value;
}

// matching correct/user values, per row (index-aligned).
function matchCorrect(entry: MockAnswerEntry): string[] {
  return entry.correct_answer.split('|').map((pair) => {
    const eq = pair.indexOf('=');
    return (eq >= 0 ? pair.slice(eq + 1) : pair).trim();
  });
}
function matchUser(entry: MockAnswerEntry): (string | null)[] {
  return parseJsonArray(entry.user_answer) ?? [];
}

async function onStartReview() {
  if (startingReview.value || wrongCount.value === 0) return;
  startingReview.value = true;
  errorMsg.value = null;
  try {
    const result = await mocksApi.startReview(sessionId);
    router.push({
      name: 'lesson',
      params: { lang: locale.lang, session_id: result.session_id },
    });
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to start practice session';
  } finally {
    startingReview.value = false;
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
    <div class="container">
      <header class="page-head">
        <h1>{{ t('mocks.review_title') }}</h1>
        <p class="dim text-sm mt-2">{{ t('mocks.review_subtitle') }}</p>
      </header>

      <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
      <p v-if="loading" class="dim">{{ t('common.loading') }}</p>

      <template v-else-if="data">
        <!-- Top toolbar: filter chip + score summary + back link. -->
        <section class="card mock-review-toolbar">
          <div class="row" style="justify-content: space-between; gap: 12px; align-items: center; flex-wrap: wrap;">
            <div class="segmented">
              <button type="button" :class="{ active: filter === 'incorrect' }" @click="filter = 'incorrect'">
                {{ t('mocks.review_filter_incorrect', { n: wrongCount + unansweredCount }) }}
              </button>
              <button type="button" :class="{ active: filter === 'all' }" @click="filter = 'all'">
                {{ t('mocks.review_filter_all', { n: data.total }) }}
              </button>
            </div>
            <div class="dim text-sm">
              {{ t('mocks.review_score', { correct: data.correct, total: data.total }) }}
            </div>
          </div>
        </section>

        <p v-if="filteredEntries.length === 0" class="card dim text-sm mt-6" style="text-align: center;">
          {{ t('mocks.review_empty_incorrect') }}
        </p>

        <!-- Per-question review cards. Each card mirrors the lesson feedback
             but read-only: status pill, prompt, user's answer, correct answer,
             explanation, per-option why-wrong (for MCQ). -->
        <section v-for="entry in filteredEntries" :key="entry.question_id"
          :class="['card', 'mock-review-card', `mock-review-${statusFor(entry)}`]">
          <header class="mock-review-card-head">
            <span class="mock-review-position mono dim text-sm">
              Q{{ entry.position.toString().padStart(2, '0') }}
            </span>
            <span class="mono dim text-xs">{{ entry.lo_code }}</span>
            <span class="dim text-sm grow">{{ entry.lo_title }}</span>
            <span :class="['pill', statusFor(entry) === 'correct'
              ? 'pill-success'
              : statusFor(entry) === 'wrong'
                ? 'pill-danger'
                : 'pill-grey']">
              {{ t(`mocks.review_status_${statusFor(entry)}`) }}
            </span>
          </header>

          <div v-if="entry.concept_bite" class="bite mt-4">
            <div class="bite-tag">{{ t('lesson.concept_tag') }}</div>
            {{ entry.concept_bite }}
          </div>

          <p class="prompt mt-4">{{ entry.prompt }}</p>

          <!-- Exhibit panel: supporting data extract shown above the answer. -->
          <div v-if="entry.exhibit" class="exhibit">
            <div class="exhibit-tag">{{ t('lesson.exhibit_tag') }}</div>
            <div class="exhibit-body">{{ entry.exhibit }}</div>
          </div>

          <!-- MCQ options. Each option is styled by outcome:
               - correct (the right answer) → green
               - the user's wrong pick → red, with why_wrong reveal
               - other distractors → muted -->
          <div v-if="entry.type === 'mcq' && entry.options" class="options mt-4">
            <div v-for="opt in entry.options" :key="opt.key" :class="[
              'option',
              opt.key === entry.correct_answer ? 'correct' : '',
              opt.key === entry.user_answer && entry.user_answer !== entry.correct_answer ? 'wrong' : '',
              opt.key !== entry.correct_answer && opt.key !== entry.user_answer ? 'locked' : '',
            ]">
              <span class="option-key">{{ opt.key }}</span>
              <span>{{ opt.text }}</span>
            </div>
          </div>

          <!-- Multi-response MCQ: same colour coding as MCQ, over the correct
               key SET (comma-joined) and the user's key set (JSON array). -->
          <div v-else-if="entry.type === 'mcq_multi' && entry.options" class="options mt-4">
            <div v-for="opt in entry.options" :key="opt.key" :class="[
              'option',
              mmCorrectKeys(entry).includes(opt.key) ? 'correct' : '',
              mmUserKeys(entry).includes(opt.key) && !mmCorrectKeys(entry).includes(opt.key) ? 'wrong' : '',
              !mmCorrectKeys(entry).includes(opt.key) && !mmUserKeys(entry).includes(opt.key) ? 'locked' : '',
            ]">
              <span class="option-key">{{ opt.key }}</span>
              <span>{{ opt.text }}</span>
            </div>
          </div>

          <!-- True/False review: per statement, the correct label is green and
               the user's wrong pick red. -->
          <div v-else-if="entry.type === 'true_false' && entry.payload && entry.payload.kind === 'true_false'"
            class="tf-block mt-4">
            <div v-for="(st, i) in entry.payload.statements" :key="i" class="tf-statement">
              <p class="tf-text">{{ st.text }}</p>
              <div class="tf-labels">
                <span v-for="choice in entry.payload.labels" :key="choice.value" :class="[
                  'tf-label',
                  choice.value === tfCorrect(entry)[i] ? 'correct' : '',
                  choice.value === tfUser(entry)[i] && tfUser(entry)[i] !== tfCorrect(entry)[i] ? 'wrong' : '',
                ]">{{ choice.label }}</span>
              </div>
            </div>
          </div>

          <!-- Matching review: per row, the user's value (green if right, red if
               wrong) and, when wrong, the correct value alongside. -->
          <div v-else-if="entry.type === 'matching' && entry.payload && entry.payload.kind === 'matching'"
            class="match-review mt-4">
            <div v-for="(row, i) in entry.payload.rows" :key="i" class="match-review-row">
              <span class="match-label">{{ row.label }}</span>
              <span class="match-review-vals">
                <span :class="['match-chip', matchUser(entry)[i] === matchCorrect(entry)[i] ? 'correct' : 'wrong']">
                  {{ matchLabelFor(entry, matchUser(entry)[i]) ?? t('mocks.review_no_answer') }}
                </span>
                <template v-if="matchUser(entry)[i] !== matchCorrect(entry)[i]">
                  <span class="match-arrow" aria-hidden="true">→</span>
                  <span class="match-chip correct">{{ matchLabelFor(entry, matchCorrect(entry)[i]) }}</span>
                </template>
              </span>
            </div>
          </div>

          <!-- Number entry: just show the user's value vs the correct one. -->
          <div v-else-if="entry.type === 'number_entry'" class="mock-review-numeric mt-4">
            <div class="mock-review-numeric-row">
              <span class="dim text-sm">{{ t('mocks.review_your_answer') }}</span>
              <span class="mono">{{ entry.user_answer === null ? t('mocks.review_no_answer') : entry.user_answer }}</span>
            </div>
            <div class="mock-review-numeric-row">
              <span class="dim text-sm">{{ t('mocks.review_correct_answer') }}</span>
              <span class="mono">{{ entry.correct_answer }}</span>
            </div>
          </div>

          <!-- Your answer / correct answer chips for MCQ - text form, since
               the options block above already shows the colour-coded position.
               For unanswered questions we surface that explicitly. -->
          <div v-if="entry.type === 'mcq'" class="mock-review-answers mt-4">
            <div class="mock-review-answers-row">
              <span class="dim text-sm">{{ t('mocks.review_your_answer') }}</span>
              <span>{{ entry.user_answer === null
                ? t('mocks.review_no_answer')
                : optionTextForKey(entry, entry.user_answer) }}</span>
            </div>
            <div class="mock-review-answers-row">
              <span class="dim text-sm">{{ t('mocks.review_correct_answer') }}</span>
              <span>{{ optionTextForKey(entry, entry.correct_answer) }}</span>
            </div>
          </div>

          <div class="mock-review-explanation mt-4">
            <div class="dim text-xs" style="font-weight: 500;">{{ t('lesson.correct_answer_label') }}</div>
            <p class="mt-1">{{ entry.explanation }}</p>
          </div>

          <!-- Per-option why-wrong (MCQ, optional). Renders ONLY when at
               least one wrong option has why_wrong text, so the section
               doesn't render an empty header for fully-bare questions. -->
          <details v-if="entry.type === 'mcq' && entry.options && entry.options.some(o => o.why_wrong)"
            class="mock-review-why-wrong mt-4">
            <summary class="dim text-sm">{{ t('lesson.why_wrong_show') }}</summary>
            <ul class="why-wrong-list mt-2">
              <li v-for="o in entry.options.filter(o => o.why_wrong)" :key="o.key" class="why-wrong-item">
                <span class="why-wrong-key mono">{{ o.key }}</span>
                <span class="why-wrong-text">{{ o.why_wrong }}</span>
              </li>
            </ul>
          </details>
        </section>

        <!-- Footer actions: practice wrong questions (existing flow) + back. -->
        <div class="row mt-6" style="gap: 12px; justify-content: flex-end; flex-wrap: wrap;">
          <RouterLink :to="lp(`/mocks/${sessionId}/breakdown`)" class="btn btn-ghost">
            {{ t('mocks.review_back_breakdown') }}
          </RouterLink>
          <button v-if="wrongCount > 0" class="btn btn-primary" :disabled="startingReview" @click="onStartReview">
            {{ startingReview ? t('mocks.review_starting') : t('mocks.review_practice_wrong_btn') }}
          </button>
        </div>
      </template>
    </div>
  </main>
</template>

<style>
.mock-review-toolbar {
  margin-top: 4px;
}

.mock-review-card {
  margin-top: 1em;
}

.mock-review-card-head {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.mock-review-position {
  font-weight: 500;
}

/* .mock-review-card.mock-review-correct {
  border-left: 3px solid var(--success);
}

.mock-review-card.mock-review-wrong {
  border-left: 3px solid var(--danger);
}

.mock-review-card.mock-review-unanswered {
  border-left: 3px solid var(--text-mute);
} */

.mock-review-numeric,
.mock-review-answers {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 12px 14px;
  background: var(--bg-elev);
  border-radius: 8px;
}

.mock-review-numeric-row,
.mock-review-answers-row {
  display: flex;
  gap: 16px;
  align-items: baseline;
}

.mock-review-numeric-row span:last-child,
.mock-review-answers-row span:last-child {
  flex: 1;
}

.mock-review-explanation {
  padding: 12px 14px;
  background: var(--bg-elev);
  border-radius: 8px;
}

.mock-review-why-wrong summary {
  cursor: pointer;
}
</style>
