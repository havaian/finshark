<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AxiosError } from 'axios';
import { lessonsApi } from '../../api/lessons.api';
import { useAuthStore } from '../../stores/auth.store';
import type {
  AttemptResult,
  CompleteLessonResult,
  LessonQuestion,
} from '../../types/lesson';

const route = useRoute();
const router = useRouter();
const auth = useAuthStore();

const sessionId = route.params.session_id as string;

const loading = ref(true);
const errorMsg = ref<string | null>(null);

const queue = ref<LessonQuestion[]>([]);
const currentIndex = ref(0);

const selectedOption = ref<string | null>(null);
const shortAnswer = ref('');
const submitting = ref(false);
const feedback = ref<AttemptResult | null>(null);

const completing = ref(false);
const summary = ref<CompleteLessonResult | null>(null);

const current = computed<LessonQuestion | null>(() => queue.value[currentIndex.value] ?? null);
const isLast = computed(() => currentIndex.value >= queue.value.length - 1);

// Width of the progress bar — answered count / total. Uses currentIndex when not in feedback,
// currentIndex+1 when feedback is showing (so the bar moves when you submit).
const progressPct = computed(() => {
  if (queue.value.length === 0) return 0;
  const answered = feedback.value ? currentIndex.value + 1 : currentIndex.value;
  return Math.min(100, Math.round((answered / queue.value.length) * 100));
});

const shortAnswerInput = ref<HTMLTextAreaElement | null>(null);

async function load() {
  loading.value = true;
  errorMsg.value = null;
  try {
    const detail = await lessonsApi.getSession(sessionId);

    if (detail.completed_at) {
      const s = await lessonsApi.complete(sessionId);
      summary.value = s;
      queue.value = detail.questions;
      currentIndex.value = detail.questions.length;
      return;
    }

    queue.value = detail.questions;

    const answered = new Set(detail.answered_question_ids);
    let idx = 0;
    while (idx < queue.value.length && answered.has(queue.value[idx].id)) idx++;
    currentIndex.value = idx;

    if (currentIndex.value >= queue.value.length) {
      await onComplete();
    } else {
      await focusInputIfShortAnswer();
    }
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to load lesson';
  } finally {
    loading.value = false;
  }
}

async function onSubmit() {
  if (!current.value || submitting.value || feedback.value) return;

  const q = current.value;
  let answer: string;
  if (q.type === 'mcq') {
    if (!selectedOption.value) return;
    answer = selectedOption.value;
  } else {
    answer = shortAnswer.value.trim();
    if (!answer) return;
  }

  submitting.value = true;
  try {
    feedback.value = await lessonsApi.attempt(sessionId, {
      question_id: q.id,
      user_answer: answer,
    });
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to submit answer';
  } finally {
    submitting.value = false;
  }
}

async function onNext() {
  feedback.value = null;
  selectedOption.value = null;
  shortAnswer.value = '';

  if (isLast.value) {
    await onComplete();
    return;
  }
  currentIndex.value += 1;
  await focusInputIfShortAnswer();
}

async function onComplete() {
  completing.value = true;
  errorMsg.value = null;
  try {
    summary.value = await lessonsApi.complete(sessionId);
    if (auth.user) {
      auth.user.xp = summary.value.new_xp;
      auth.user.level = summary.value.new_level;
      auth.user.streak_count = summary.value.new_streak;
    }
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to complete lesson';
  } finally {
    completing.value = false;
  }
}

function onQuit() {
  if (summary.value || confirm('Quit this lesson? Your answers so far are saved; you can resume the session anytime.')) {
    router.push({ name: 'dashboard' });
  }
}

async function focusInputIfShortAnswer() {
  await nextTick();
  if (current.value?.type === 'short_answer' && shortAnswerInput.value) {
    shortAnswerInput.value.focus();
  }
}

function onKeydown(e: KeyboardEvent) {
  if (summary.value) return;
  if (!current.value) return;

  if (e.key === 'Enter') {
    if (current.value.type === 'short_answer' && e.shiftKey) return;
    e.preventDefault();
    if (feedback.value) onNext();
    else onSubmit();
    return;
  }

  if (current.value.type === 'mcq' && !feedback.value) {
    const n = parseInt(e.key, 10);
    if (!isNaN(n) && current.value.options && n >= 1 && n <= current.value.options.length) {
      e.preventDefault();
      selectedOption.value = current.value.options[n - 1].key;
    }
  }
}

// Compute MCQ option class — selected/correct/wrong/locked.
function optionClass(optKey: string): string {
  if (!feedback.value) {
    return selectedOption.value === optKey ? 'option selected' : 'option';
  }
  if (optKey === feedback.value.correct_answer) return 'option correct';
  if (optKey === selectedOption.value && !feedback.value.was_correct) return 'option wrong';
  return 'option locked';
}

function extractError(e: unknown): string | null {
  if (e instanceof AxiosError) {
    const msg = (e.response?.data as { message?: string | string[] })?.message;
    return Array.isArray(msg) ? msg.join(', ') : msg ?? null;
  }
  return null;
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown);
  load();
});
onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown);
});
</script>

<template>
  <main class="page">
    <div class="lesson-frame">

      <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
      <p v-if="loading" class="dim text-sm">Loading lesson…</p>

      <!-- Completion -->
      <section v-if="summary" class="card">
        <h1>Lesson complete</h1>
        <div class="stats mt-6">
          <div class="stat">
            <div class="stat-lbl">Correct</div>
            <div class="stat-val">{{ summary.correct_count }}<span class="dim text-sm" style="font-size: 18px;"> / {{ summary.question_count }}</span></div>
          </div>
          <div class="stat">
            <div class="stat-lbl">XP earned</div>
            <div class="stat-val">+{{ summary.xp_earned }}</div>
          </div>
          <div class="stat stat-streak">
            <div class="stat-lbl">Streak</div>
            <div class="stat-val">{{ summary.new_streak }} <span class="stat-fire">🔥</span></div>
          </div>
        </div>
        <div class="mt-6">
          <button class="btn btn-primary" @click="router.push({ name: 'dashboard' })">
            Back to dashboard
          </button>
        </div>
      </section>

      <!-- Active question -->
      <section v-else-if="current">

        <div class="lesson-top">
          <button class="btn-link" @click="onQuit">← quit</button>
          <div class="progress-track">
            <div class="progress-bar" :style="{ width: progressPct + '%' }"></div>
          </div>
          <div class="progress-num mono">
            {{ String(currentIndex + 1).padStart(2, '0') }} / {{ String(queue.length).padStart(2, '0') }}
          </div>
        </div>

        <div v-if="current.concept_bite" class="bite">
          <div class="bite-tag">concept</div>
          {{ current.concept_bite }}
        </div>

        <p class="prompt">{{ current.prompt }}</p>

        <!-- MCQ -->
        <div v-if="current.type === 'mcq' && current.options" class="options">
          <button
            v-for="(opt, i) in current.options"
            :key="opt.key"
            type="button"
            :class="optionClass(opt.key)"
            :disabled="!!feedback"
            @click="selectedOption = opt.key"
          >
            <span class="option-key">{{ opt.key }}</span>
            <span>{{ opt.text }}</span>
            <span v-if="!feedback" class="dim text-xs mono" style="margin-left: auto;">{{ i + 1 }}</span>
          </button>
        </div>

        <!-- Short answer -->
        <div v-else-if="current.type === 'short_answer'" class="mt-4">
          <textarea
            ref="shortAnswerInput"
            v-model="shortAnswer"
            :disabled="!!feedback"
            rows="3"
            maxlength="4000"
            placeholder="Type your answer…"
          />
          <p class="input-help">Enter to submit, Shift+Enter for newline.</p>
        </div>

        <!-- Feedback -->
        <div v-if="feedback" :class="['feedback', { wrong: !feedback.was_correct }]">
          <template v-if="feedback.was_correct">
            <div class="sparkle s1">✦</div>
            <div class="sparkle s2">✦</div>
            <div class="sparkle s3">✦</div>
          </template>
          <div class="feedback-head">
            {{ feedback.was_correct ? 'Correct' : 'Not quite.' }}
            <span v-if="feedback.xp_earned > 0" class="xp-badge">+{{ feedback.xp_earned }} XP</span>
          </div>
          <div v-if="!feedback.was_correct" class="mt-2 text-sm">
            <span style="font-weight: 500;">Correct answer:</span> {{ feedback.correct_answer }}
          </div>
          <div class="feedback-body">{{ feedback.explanation }}</div>
          <div class="feedback-meta">
            <span>Mastery {{ feedback.mastery_score }}%</span>
            <span>Next review · {{ feedback.next_due_date }}</span>
          </div>
        </div>

        <div class="lesson-foot">
          <div class="keys"><kbd>1</kbd><kbd>2</kbd><kbd>3</kbd><kbd>4</kbd> select · <kbd>↵</kbd> continue</div>
          <button
            v-if="!feedback"
            class="btn btn-primary"
            :disabled="submitting || (current.type === 'mcq' ? !selectedOption : !shortAnswer.trim())"
            @click="onSubmit"
          >
            {{ submitting ? 'Checking…' : 'Submit' }}
          </button>
          <button
            v-else
            class="btn btn-primary"
            :disabled="completing"
            @click="onNext"
          >
            {{ completing ? 'Finishing…' : isLast ? 'Finish lesson' : 'Next →' }}
          </button>
        </div>

      </section>

    </div>
  </main>
</template>
