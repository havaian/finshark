<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { lessonsApi } from '../../api/lessons.api';
import { badgesApi } from '../../api/badges.api';
import { useAuthStore } from '../../stores/auth.store';
import { useLocaleStore } from '../../stores/locale.store';
import type {
  AttemptResult,
  CompleteLessonResult,
  LessonQuestion,
  LessonTheoryBite,
} from '../../types/lesson';
import type { PublicBadge } from '../../types/badges';
import AppNav from '../../components/AppNav.vue';

// Hearts are 3 per session - must match backend lesson_sessions.hearts_remaining default.
const MAX_HEARTS = 3;

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const locale = useLocaleStore();

const sessionId = route.params.session_id as string;

const loading = ref(true);
const errorMsg = ref<string | null>(null);

const queue = ref<LessonQuestion[]>([]);
const currentIndex = ref(0);

const selectedOption = ref<string | null>(null);
// number_entry answer kept as a string (not number) so we don't lose mid-typing
// state like trailing decimals ("12." while user is mid-type). The grader on
// the server parses it.
const numberAnswer = ref('');
const submitting = ref(false);
const feedback = ref<AttemptResult | null>(null);

// Toggle for the "why are the other options wrong?" expander on MCQ feedback.
// Reset on every Next so each wrong question shows it collapsed by default.
const showWhyWrong = ref(false);

const completing = ref(false);
const summary = ref<CompleteLessonResult | null>(null);
// Snapshot of the user's level RIGHT BEFORE complete() returns so the finale
// can render a "Level up!" banner when summary.new_level > prevLevel.
// Captured in onComplete() because we update auth.user.level immediately after
// the network call - comparing against the live store would always read equal.
const prevLevel = ref<number | null>(null);
const leveledUp = computed(() => {
  if (!summary.value || prevLevel.value === null) return false;
  return summary.value.new_level > prevLevel.value;
});
// Hydrated PublicBadge details for the codes in summary.newly_earned_badges.
// We fetch /me/badges only when there ARE newly earned badges so the common
// case (no earns) has zero extra cost.
const newlyEarnedDetails = ref<PublicBadge[]>([]);

// Theory primers shown on a dedicated intro screen before the question flow.
// Skipped entirely (theoryDismissed = true from the start) when no LO in the
// queue has theory populated.
const theoryBites = ref<LessonTheoryBite[]>([]);
const theoryDismissed = ref(false);

// Live hearts count - drives the UI between attempts.
const hearts = ref<number>(MAX_HEARTS);

// ─── Mock mode state ────────────────────────────────────────────────────
// `mode` mirrors session.mode from the backend. Lessons render the hearts
// row and theory primer; mocks render a countdown timer and skip the primer.
const sessionMode = ref<'lesson' | 'mock'>('lesson');
// Total seconds for this session (mocks only). Null for ordinary lessons.
const timeLimitSeconds = ref<number | null>(null);
// Seconds remaining, ticked down once per second by a setInterval. Initialized
// from started_at + time_limit - now so resumes show the correct value.
const timeRemainingSeconds = ref<number>(0);
let timerInterval: number | null = null;

const isMock = computed(() => sessionMode.value === 'mock');

// MM:SS display. We clamp to 0 so the UI never shows negative values.
const timerDisplay = computed(() => {
  const s = Math.max(0, timeRemainingSeconds.value);
  const mm = Math.floor(s / 60).toString().padStart(2, '0');
  const ss = (s % 60).toString().padStart(2, '0');
  return `${mm}:${ss}`;
});

// Visually warn when under 5 minutes - turns the timer pill red.
const timerWarning = computed(
  () => isMock.value && timeRemainingSeconds.value <= 300 && timeRemainingSeconds.value > 0,
);

function startMockTimer(startedAt: string, limitSeconds: number) {
  // Resume-friendly: compute remaining from the original started_at, not from
  // "now + limit". If a user reloads halfway through, the timer keeps falling.
  const startMs = Date.parse(startedAt);
  const tick = () => {
    const elapsed = Math.floor((Date.now() - startMs) / 1000);
    timeRemainingSeconds.value = Math.max(0, limitSeconds - elapsed);
    if (timeRemainingSeconds.value === 0 && !summary.value) {
      // Time's up - auto-complete. Backend doesn't enforce the limit, so we
      // simply finish the session and let the user see the breakdown.
      stopMockTimer();
      void onComplete();
    }
  };
  tick();
  timerInterval = window.setInterval(tick, 1000);
}

function stopMockTimer() {
  if (timerInterval !== null) {
    window.clearInterval(timerInterval);
    timerInterval = null;
  }
}

const current = computed<LessonQuestion | null>(() => queue.value[currentIndex.value] ?? null);
const isLast = computed(() => currentIndex.value >= queue.value.length - 1);

// Width of the progress bar - answered count / total. Uses currentIndex when not in feedback,
// currentIndex+1 when feedback is showing (so the bar moves when you submit).
// When the user has finished the last question (summary fetched or session
// completed via out-of-hearts), the bar pins to 100% - previously it sat at
// whatever the last computed value was and visibly wiggled during the
// transition from "answering last Q" → "fetching summary" → "summary shown".
const progressPct = computed(() => {
  if (queue.value.length === 0) return 0;
  // Once we're past the last question (or showing the summary / completing),
  // the bar is done - clamp to 100% and stay there.
  if (
    summary.value ||
    completing.value ||
    currentIndex.value >= queue.value.length
  ) {
    return 100;
  }
  const answered = feedback.value ? currentIndex.value + 1 : currentIndex.value;
  return Math.min(100, Math.round((answered / queue.value.length) * 100));
});

// Render `MAX_HEARTS` heart slots - filled for the first `hearts` of them, hollow for the rest.
const heartSlots = computed(() =>
  Array.from({ length: MAX_HEARTS }, (_, i) => i < hearts.value),
);

// Wrong options for the CURRENT MCQ feedback panel - only those with non-null
// why_wrong text and that the user didn't select (we show the user's wrong
// pick more prominently elsewhere). Empty array short-circuits the expander.
const wrongOptionsForFeedback = computed(() => {
  if (!feedback.value || !current.value || current.value.type !== 'mcq') return [];
  const correctKey = feedback.value.correct_answer;
  return (current.value.options ?? []).filter(
    (o) => o.key !== correctKey && o.why_wrong,
  );
});

const numberAnswerInput = ref<HTMLInputElement | null>(null);

async function load() {
  loading.value = true;
  errorMsg.value = null;
  try {
    const detail = await lessonsApi.getSession(sessionId);

    // Pick up session-mode metadata FIRST so completed-on-load branch also
    // knows which finale to render (mock breakdown vs regular summary).
    sessionMode.value = detail.mode;
    timeLimitSeconds.value = detail.time_limit_seconds;

    if (detail.completed_at) {
      // If the session was a mock, jump straight to the breakdown page -
      // no point re-rendering the regular completion summary.
      if (detail.mode === 'mock') {
        await router.replace({
          name: 'mock-breakdown',
          params: { lang: locale.lang, session_id: sessionId },
        });
        return;
      }
      const s = await lessonsApi.complete(sessionId);
      summary.value = s;
      queue.value = detail.questions;
      currentIndex.value = detail.questions.length;
      hearts.value = 0;
      return;
    }

    queue.value = detail.questions;
    hearts.value = detail.hearts_remaining;
    // Mocks never show the theory primer - even on resume. Backend already
    // returns theory_bites=[] for mocks, but we belt-and-brace it here.
    theoryBites.value = detail.mode === 'mock' ? [] : (detail.theory_bites ?? []);
    theoryDismissed.value = theoryBites.value.length === 0;

    const answered = new Set(detail.answered_question_ids);
    let idx = 0;
    while (idx < queue.value.length && answered.has(queue.value[idx].id)) idx++;
    currentIndex.value = idx;
    if (idx > 0) theoryDismissed.value = true;

    // Mock timer: start it whenever we successfully loaded a mock session
    // that has a time limit. Re-resume is fine because the tick computes
    // elapsed from started_at.
    if (detail.mode === 'mock' && detail.time_limit_seconds !== null) {
      startMockTimer(detail.started_at, detail.time_limit_seconds);
    }

    if (currentIndex.value >= queue.value.length) {
      await onComplete();
    } else {
      await focusInputForType();
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
    // number_entry
    answer = numberAnswer.value.trim();
    if (!answer) return;
  }

  submitting.value = true;
  try {
    const result = await lessonsApi.attempt(sessionId, {
      question_id: q.id,
      user_answer: answer,
    });
    feedback.value = result;
    hearts.value = result.hearts_remaining;

    // Mock mode: exam-style flow - no per-question reveal. We auto-advance
    // straight to the next question (or finish) so the user never sees the
    // "correct / wrong + explanation" panel mid-exam. The full breakdown
    // (per-LO accuracy + per-question review) is shown on the breakdown
    // page after completion.
    if (isMock.value) {
      submitting.value = false;
      await onNext();
      return;
    }

    // If the server says this attempt ended the session (hearts hit 0),
    // we still show the feedback for the current question first, then
    // jump straight to the out-of-hearts finale on Next.
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to submit answer';
  } finally {
    submitting.value = false;
  }
}

async function onNext() {
  // Capture before clearing - we need to know whether THIS feedback was the out-of-hearts one.
  const endedOnThisAttempt = feedback.value?.session_ended_out_of_hearts === true;

  feedback.value = null;
  selectedOption.value = null;
  numberAnswer.value = '';
  showWhyWrong.value = false;

  if (endedOnThisAttempt) {
    // Session is server-side completed. Skip remaining questions and show the finale.
    await onComplete();
    return;
  }

  if (isLast.value) {
    await onComplete();
    return;
  }
  currentIndex.value += 1;
  await focusInputForType();
}

async function onComplete() {
  completing.value = true;
  errorMsg.value = null;
  // Snapshot level BEFORE the network call so we can detect a cross at the
  // finale. The store update below overwrites auth.user.level immediately.
  prevLevel.value = auth.user?.level ?? null;
  try {
    summary.value = await lessonsApi.complete(sessionId);
    if (auth.user) {
      auth.user.xp = summary.value.new_xp;
      auth.user.level = summary.value.new_level;
      auth.user.streak_count = summary.value.new_streak;
      auth.user.streak_freezes_remaining = summary.value.new_streak_freezes;
    }
    // Stop the countdown ASAP on completion so the user doesn't see it tick
    // during the navigation transition.
    stopMockTimer();
    // For mocks, skip the regular finale screen - the breakdown page is more
    // informative (per-LO accuracy + review-wrongs button). We still hit
    // the lessons-complete endpoint above so XP/streak/badges flow through
    // the same machinery as lessons.
    if (sessionMode.value === 'mock') {
      await router.replace({
        name: 'mock-breakdown',
        params: { lang: locale.lang, session_id: sessionId },
      });
      return;
    }
    // Hydrate the newly-earned badge codes into display objects. Only call
    // /me/badges when at least one was earned - the common case is zero.
    // Network failure here is non-fatal: badges just don't toast this run.
    if (summary.value.newly_earned_badges.length > 0) {
      try {
        const all = await badgesApi.getMine();
        const earnedCodeSet = new Set(summary.value.newly_earned_badges);
        newlyEarnedDetails.value = all.filter((b) => earnedCodeSet.has(b.code));
      } catch {
        newlyEarnedDetails.value = [];
      }
    }
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to complete lesson';
  } finally {
    completing.value = false;
  }
}

function onQuit() {
  if (summary.value || confirm(t('lesson.quit_confirm'))) {
    router.push({ name: 'dashboard', params: { lang: locale.lang } });
  }
}

async function focusInputForType() {
  await nextTick();
  if (current.value?.type === 'number_entry' && numberAnswerInput.value) {
    numberAnswerInput.value.focus();
  }
}

function onKeydown(e: KeyboardEvent) {
  if (summary.value) return;
  // If the theory primer screen is still shown, ignore lesson-flow keys; the
  // user clicks "Start" to dismiss. Letting Enter pass through here would
  // skip the primer the moment they pressed a key on an empty session.
  if (!theoryDismissed.value) return;
  if (!current.value) return;

  if (e.key === 'Enter') {
    e.preventDefault();
    if (feedback.value) onNext();
    else onSubmit();
    return;
  }

  // Number 1-4 = pick MCQ option. Only on MCQ before feedback; never on
  // number_entry (the digits are part of the answer).
  if (current.value.type === 'mcq' && !feedback.value) {
    const n = parseInt(e.key, 10);
    if (!isNaN(n) && current.value.options && n >= 1 && n <= current.value.options.length) {
      e.preventDefault();
      selectedOption.value = current.value.options[n - 1].key;
    }
  }
}

function onStartFromTheory() {
  theoryDismissed.value = true;
  focusInputForType();
}

// Compute MCQ option class - selected/correct/wrong/locked.
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
  // Make sure no orphaned interval keeps ticking if the user navigates away
  // mid-mock (e.g. via the browser back button or by clicking another link).
  stopMockTimer();
});
</script>

<template>
  <main class="page lesson-page">
    <!-- Lesson runner used to render without any chrome - no way to navigate
         to the dashboard / profile mid-lesson except the quit button. Adding
         AppNav gives the user the same escape hatches as every other authed
         page; the quit-confirm logic still fires when they hit the "Quit"
         button inside the lesson body. -->
    <AppNav />
    <div class="container">
    <div class="lesson-frame">

      <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
      <p v-if="loading" class="dim text-sm">{{ t('lesson.loading') }}</p>

      <!-- Completion - distinct copy for the out-of-hearts case -->
      <section v-if="summary" class="card">
        <h1>
          {{ summary.ended_out_of_hearts ? t('lesson.out_of_hearts_title') : t('lesson.complete_title') }}
        </h1>
        <p v-if="summary.ended_out_of_hearts" class="dim mt-4">
          {{ t('lesson.out_of_hearts_body') }}
        </p>

        <!-- Level-up banner. Only renders when this session pushed the user
             across a level boundary, so for the typical finale (no level
             change) the visual stays the same as before. -->
        <div v-if="leveledUp" class="level-up-banner mt-4">
          <span class="level-up-icon">★</span>
          <span class="level-up-text">{{ t('lesson.level_up', { level: summary.new_level }) }}</span>
        </div>

        <!-- Streak-freeze banners. Mutually exclusive at the data layer:
             consume happens on a missed-day session, grant happens on a 14-day
             milestone - never both in the same call. -->
        <div v-if="summary.freeze_consumed" class="freeze-banner mt-4">
          <span class="freeze-banner-icon">❄</span>
          <span class="freeze-banner-text">{{ t('lesson.streak_freeze_used', { remaining: summary.new_streak_freezes }) }}</span>
        </div>
        <div v-if="summary.freeze_granted" class="freeze-banner mt-4">
          <span class="freeze-banner-icon">❄</span>
          <span class="freeze-banner-text">{{ t('lesson.streak_freeze_earned', { count: summary.new_streak_freezes }) }}</span>
        </div>

        <div class="stats mt-6">
          <div class="stat">
            <div class="stat-lbl">{{ t('lesson.complete_correct') }}</div>
            <div class="stat-val">{{ summary.correct_count }}<span class="dim text-sm" style="font-size: 18px;"> / {{
              summary.question_count }}</span></div>
          </div>
          <div class="stat">
            <div class="stat-lbl">{{ t('lesson.complete_xp_earned') }}</div>
            <div class="stat-val">+{{ summary.xp_earned }}</div>
            <!-- Streak bonus breakdown. Hidden when there's no bonus (streak=0
                 sessions or first lesson) so the stat stays clean for new
                 users. The base/bonus split lets the user see why their
                 streak matters on every lesson, not just at milestones. -->
            <div v-if="summary.xp_streak_bonus > 0" class="dim text-xs" style="margin-top: 4px;">
              {{ t('lesson.complete_xp_streak_bonus', {
                base: summary.xp_base,
                bonus: summary.xp_streak_bonus,
              }) }}
            </div>
          </div>
          <div class="stat">
            <div class="stat-lbl">{{ t('lesson.complete_level') }}</div>
            <div class="stat-val">{{ summary.new_level }}</div>
          </div>
          <div class="stat stat-streak">
            <div class="stat-lbl">{{ t('lesson.complete_streak') }}</div>
            <div class="stat-val">{{ summary.new_streak }} <span class="stat-fire">🔥</span></div>
          </div>
        </div>

        <!-- Newly earned badges - single ribbon, one tile per earn. Only
             renders when at least one was earned this session, so the common
             case is invisible. -->
        <div v-if="newlyEarnedDetails.length > 0" class="badge-earned-ribbon">
          <div class="badge-earned-title">{{ t('lesson.badges_earned_title') }}</div>
          <div class="badge-earned-row">
            <div v-for="b in newlyEarnedDetails" :key="b.code" class="badge-earned-tile" :title="b.description">
              <span class="badge-earned-icon">{{ b.icon }}</span>
              <span class="badge-earned-name">{{ b.name }}</span>
            </div>
          </div>
        </div>

        <div class="mt-6">
          <button class="btn btn-primary" @click="router.push({ name: 'dashboard', params: { lang: locale.lang } })">
            {{ t('lesson.complete_back') }}
          </button>
        </div>
      </section>

      <!-- Theory primer - shown before the question flow when at least one LO
           in the queue has theory_en populated. User clicks Start to proceed.
           The Skip recap button sits OUTSIDE the recap card as a sticky bar
           above it. Previously it lived inside the card with `position:
           sticky; float: right` which made it overlap theory text on smaller
           viewports. Sticky outside the card keeps it visible while the user
           scrolls through bites without ever overlapping content. -->
      <template v-else-if="!theoryDismissed && theoryBites.length > 0">
        <div class="theory-skip-bar">
          <button class="btn btn-primary btn-sm" @click="onStartFromTheory">
            {{ t('lesson.theory_skip') }} →
          </button>
        </div>
        <section class="card theory-intro">
          <h1>{{ t('lesson.theory_title') }}</h1>
          <p class="dim mt-2">{{ t('lesson.theory_subtitle') }}</p>
          <div class="theory-list mt-6">
            <article v-for="b in theoryBites" :key="b.lo_id" class="theory-card">
              <header class="theory-card-head">
                <span class="theory-lo-code mono">{{ b.lo_code }}</span>
                <span class="theory-lo-title">{{ b.lo_title }}</span>
              </header>
              <div class="theory-body">{{ b.theory }}</div>
            </article>
          </div>
          <div class="mt-6">
            <button class="btn btn-primary" @click="onStartFromTheory">
              {{ t('lesson.theory_start') }}
            </button>
          </div>
        </section>
      </template>

      <!-- Wrap-up loading state. Renders the moment the user submits the
           LAST answer and we're waiting for the complete() roundtrip. Without
           this, the last question would briefly re-render (feedback cleared,
           current question still on screen) before flipping to the summary
           - confusing UX, and the user could even resubmit. -->
      <section v-else-if="completing && !summary" class="card lesson-wrapup">
        <div class="lesson-wrapup-spinner" aria-hidden="true">⏳</div>
        <h2>{{ t('lesson.wrapping_up_title') }}</h2>
        <p class="dim mt-2">{{ t('lesson.wrapping_up_body') }}</p>
      </section>

      <!-- Active question -->
      <section v-else-if="current && theoryDismissed">

        <div class="lesson-top">
          <button class="btn-link" @click="onQuit">{{ t('lesson.quit') }}</button>
          <div class="progress-track">
            <div class="progress-bar" :style="{ width: progressPct + '%' }"></div>
          </div>
          <!-- Mock: countdown timer instead of hearts. Hearts are decorative
               for mocks (the column still exists in the DB) so we replace the
               whole slot rather than mix them. -->
          <div v-if="isMock" :class="['mock-timer mono', { warning: timerWarning }]"
            :aria-label="t('lesson.mock_timer_label') + ': ' + timerDisplay">
            {{ timerDisplay }}
          </div>
          <div v-else class="hearts-row" :aria-label="t('lesson.hearts_label') + ': ' + hearts + ' / ' + MAX_HEARTS">
            <span v-for="(filled, i) in heartSlots" :key="i" :class="['heart', filled ? 'filled' : 'empty']"
              aria-hidden="true">{{ filled ? '♥' : '♡' }}</span>
          </div>
          <div class="progress-num mono">
            {{ String(currentIndex + 1).padStart(2, '0') }} / {{ String(queue.length).padStart(2, '0') }}
          </div>
        </div>

        <div v-if="current.concept_bite" class="bite">
          <div class="bite-tag">{{ t('lesson.concept_tag') }}</div>
          {{ current.concept_bite }}
        </div>

        <p class="prompt">{{ current.prompt }}</p>

        <!-- MCQ -->
        <div v-if="current.type === 'mcq' && current.options" class="options">
          <button v-for="(opt, i) in current.options" :key="opt.key" type="button" :class="optionClass(opt.key)"
            :disabled="!!feedback" @click="selectedOption = opt.key">
            <span class="option-key">{{ opt.key }}</span>
            <span>{{ opt.text }}</span>
            <span v-if="!feedback" class="dim text-xs mono" style="margin-left: auto;">{{ i + 1 }}</span>
          </button>
        </div>

        <!-- Number entry - for calculation questions where the answer is a
             single numeric value. inputmode=decimal triggers numeric keyboards
             on mobile while still allowing typed characters on desktop. -->
        <div v-else-if="current.type === 'number_entry'" class="mt-4 number-entry">
          <input ref="numberAnswerInput" v-model="numberAnswer" type="text" inputmode="decimal" autocomplete="off"
            spellcheck="false" :disabled="!!feedback" maxlength="40" :placeholder="t('lesson.number_entry_placeholder')"
            class="number-input" />
          <p class="input-help">
            <span>{{ t('lesson.number_entry_help') }}</span>
            <span v-if="current.acceptable_tolerance !== null && current.acceptable_tolerance > 0"
              class="tolerance-hint">
              {{ t('lesson.number_entry_tolerance', { tol: current.acceptable_tolerance }) }}
            </span>
          </p>
        </div>

        <!-- Feedback -->
        <div v-if="feedback" :class="['feedback', { wrong: !feedback.was_correct }]">
          <template v-if="feedback.was_correct">
            <div class="sparkle s1">✦</div>
            <div class="sparkle s2">✦</div>
            <div class="sparkle s3">✦</div>
          </template>
          <template v-else>
            <!-- Wrong-answer counterpart to the sparkles: little × marks that
                 sway left/right on the same staggered timings. Adds visual
                 weight to the wrong-answer state so it doesn't feel flat. -->
            <div class="wrong-mark s1">✕</div>
            <div class="wrong-mark s2">✕</div>
            <div class="wrong-mark s3">✕</div>
          </template>
          <div class="feedback-head">
            {{ feedback.was_correct ? t('lesson.correct') : t('lesson.wrong') }}
            <span v-if="feedback.xp_earned > 0" class="xp-badge">+{{ feedback.xp_earned }} XP</span>
          </div>
          <div v-if="!feedback.was_correct" class="mt-2 text-sm">
            <span style="font-weight: 500;">{{ t('lesson.correct_answer_label') }}</span> {{ feedback.correct_answer }}
          </div>
          <div class="feedback-body">{{ feedback.explanation }}</div>

          <!-- "Show explanations" - only on wrong MCQ when at least one
               wrong option has a baked-in explanation. The toggle uses a
               pill button (not a text link) so it's obvious you can click it,
               with a question-mark icon to reinforce the affordance. -->
          <div v-if="!feedback.was_correct && wrongOptionsForFeedback.length > 0" class="why-wrong-section">
            <button type="button" class="why-wrong-toggle" @click="showWhyWrong = !showWhyWrong">
              <span class="why-wrong-toggle-icon" aria-hidden="true">?</span>
              {{ showWhyWrong ? t('lesson.why_wrong_hide') : t('lesson.why_wrong_show') }}
            </button>
            <ul v-if="showWhyWrong" class="why-wrong-list">
              <li v-for="o in wrongOptionsForFeedback" :key="o.key" class="why-wrong-item">
                <span class="why-wrong-key mono">{{ o.key }}</span>
                <span class="why-wrong-text">{{ o.why_wrong }}</span>
              </li>
            </ul>
          </div>
        </div>

        <div class="lesson-foot">
          <div class="keys">
            <template v-if="current.type === 'mcq'">
              <kbd>1</kbd><kbd>2</kbd><kbd>3</kbd><kbd>4</kbd> {{ t('lesson.keys_help') }} · <kbd>↵</kbd>
            </template>
            <template v-else>
              <kbd>↵</kbd> {{ t('lesson.keys_help_text') }}
            </template>
          </div>
          <button v-if="!feedback" class="btn btn-primary" :disabled="submitting || (
            current.type === 'mcq' ? !selectedOption : !numberAnswer.trim()
          )" @click="onSubmit">
            {{ submitting ? t('lesson.checking') : t('lesson.submit') }}
          </button>
          <button v-else class="btn btn-primary" :disabled="completing" @click="onNext">
            {{
              completing
                ? t('lesson.finishing')
                : feedback.session_ended_out_of_hearts
                  ? t('lesson.finish')
                  : isLast
                    ? t('lesson.finish')
                    : t('lesson.next')
            }}
          </button>
        </div>

      </section>

    </div>
    </div>
  </main>
</template>
