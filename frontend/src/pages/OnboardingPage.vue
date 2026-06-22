<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { onboardingApi, type CompleteOnboardingInput } from '../api/onboarding.api';
import { lessonsApi } from '../api/lessons.api';
import { useAuthStore } from '../stores/auth.store';
import { useLocaleStore } from '../stores/locale.store';
import { useEntitlementStore } from '../stores/entitlement.store';
import type { BgLevel } from '../types/auth';
import type { Paper } from '../types/content';

// Onboarding wizard. Three short steps so it reads as a guided welcome rather
// than one long settings form:
//   1) Goal      - pick the target paper (the spine of a study app) + an
//                  optional exam date.
//   2) Commitment- daily time budget (sizes lessons) + how hard to start +
//                  reminders.
//   3) Confirm   - a summary of what the answers set, then either start the
//                  first lesson or head to the dashboard.
//
// The reframed "how should we start you" question still writes bg_level under
// the hood (easier=beginner, balanced=intermediate, challenge=advanced) so the
// backend's existing bg_level -> preferred_difficulty derivation is unchanged.
//
// A paper is required to advance past step 1 only when at least one *startable*
// paper exists (has questions and is reachable on the user's tier). When none
// are startable the step becomes skippable - we never trap a user behind a
// paper they can't actually begin.

const { t } = useI18n();
const router = useRouter();
const auth = useAuthStore();
const locale = useLocaleStore();
const entitlement = useEntitlementStore();

const step = ref<1 | 2 | 3>(1);

const papers = ref<Paper[]>([]);
const papersLoading = ref(true);
const papersError = ref<string | null>(null);

const bgLevel = ref<BgLevel | null>(null);
const timeBudget = ref<number>(15);
const preferredPaperId = ref<string | null>(null);
const reminders = ref<boolean>(false);
// Empty string = no date chosen. Bound directly to a native <input type="date">.
const examDate = ref<string>('');

const submitting = ref(false);
const errorMsg = ref<string | null>(null);
// True when onboarding saved but the first-lesson start failed - we keep the
// user on this step (they're already onboarded) and offer the dashboard.
const startFailed = ref(false);

// Available time budgets - kept small and human (not a slider) so users commit
// to a deliberate value. DB allows 5..60 so this list stays inside.
const timeBudgetOptions = [5, 10, 15, 20, 30, 45, 60];

// Reframed difficulty options. The stored value is still a BgLevel so the
// service's derivation needs no changes.
const startOptions: Array<{ value: BgLevel; titleKey: string; descKey: string }> = [
  { value: 'beginner', titleKey: 'onboarding.start_easier_title', descKey: 'onboarding.start_easier_desc' },
  { value: 'intermediate', titleKey: 'onboarding.start_balanced_title', descKey: 'onboarding.start_balanced_desc' },
  { value: 'advanced', titleKey: 'onboarding.start_challenge_title', descKey: 'onboarding.start_challenge_desc' },
];

// Today as 'YYYY-MM-DD' in UTC - matches the backend's date handling. Used to
// bound the date picker so the user can't pick the past or an absurd future.
function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}
const examDateMin = isoToday();
const examDateMaxValue = (() => {
  const d = new Date(`${isoToday()}T00:00:00Z`);
  d.setUTCFullYear(d.getUTCFullYear() + 3);
  return d.toISOString().slice(0, 10);
})();

// A paper can be a first-lesson target only if it has active questions AND the
// user can reach it on their tier. Premium-only papers are not startable for a
// free user (the backend would 403 on start), so we keep them out of the target
// selection but still show them in the list with a badge.
function paperStartable(p: Paper): boolean {
  return p.active_question_count > 0 && (p.free_accessible || entitlement.isPremium);
}

const selectablePapers = computed(() => papers.value.filter(paperStartable));
const hasSelectablePapers = computed(() => selectablePapers.value.length > 0);
const selectedPaper = computed(
  () => papers.value.find((p) => p.id === preferredPaperId.value) ?? null
);

// Step 1 can advance once a paper is chosen, unless nothing is startable (then
// the step is a skip).
const canAdvanceFromGoal = computed(() => {
  if (!hasSelectablePapers.value) return true;
  return preferredPaperId.value !== null;
});

// Days until the chosen exam date (null when no date). Used only in the summary.
const examCountdownDays = computed<number | null>(() => {
  if (!examDate.value) return null;
  const today = new Date(`${isoToday()}T00:00:00Z`).getTime();
  const exam = new Date(`${examDate.value}T00:00:00Z`).getTime();
  return Math.round((exam - today) / 86400000);
});

// Mirror of the backend's lesson-size derivation (SECS_PER_QUESTION = 40,
// clamped 3..10) so the summary previews the real number the user will get.
function estimatedLessonSize(mins: number): number {
  return Math.max(3, Math.min(10, Math.round((mins * 60) / 40)));
}

// Map the stored bg_level back to the summary phrase for the difficulty choice.
const difficultySummaryKey = computed<string | null>(() => {
  switch (bgLevel.value) {
    case 'beginner':
      return 'onboarding.summary_difficulty_easier';
    case 'intermediate':
      return 'onboarding.summary_difficulty_balanced';
    case 'advanced':
      return 'onboarding.summary_difficulty_challenge';
    default:
      return null;
  }
});

async function loadPapers() {
  papersLoading.value = true;
  papersError.value = null;
  try {
    papers.value = await lessonsApi.listPapers();
  } catch (e) {
    papersError.value = extractError(e) ?? 'failed to load papers';
  } finally {
    papersLoading.value = false;
  }
}

function buildPayload(): CompleteOnboardingInput {
  const payload: CompleteOnboardingInput = {};
  if (bgLevel.value !== null) payload.bg_level = bgLevel.value;
  // time_budget always sent - the user passed through the commitment step and
  // this drives lesson_size. Matches the DB default when untouched, so harmless.
  payload.time_budget_minutes = timeBudget.value;
  if (preferredPaperId.value) payload.preferred_paper_id = preferredPaperId.value;
  // Reminders default false - only send when toggled on so we don't clobber a
  // user who enabled them elsewhere.
  if (reminders.value) payload.email_reminders_enabled = true;
  if (examDate.value) payload.exam_date = examDate.value;
  return payload;
}

// Persist onboarding (stamps onboarded_at + saves derived prefs) and refresh
// the auth store. Throws on failure so callers can branch.
async function completeOnboarding(): Promise<void> {
  const updated = await onboardingApi.complete(buildPayload());
  auth.setUser(updated);
  // Onboarding is saved - the in-progress draft is no longer needed.
  clearDraft();
}

async function onStartFirstLesson() {
  if (submitting.value) return;
  submitting.value = true;
  errorMsg.value = null;
  startFailed.value = false;
  try {
    await completeOnboarding();
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to save onboarding';
    submitting.value = false;
    return;
  }
  // Onboarding saved - the user now passes the onboarding guard, so the lesson
  // route is reachable. Try to spin up their first lesson.
  try {
    const res = await lessonsApi.start({
      paper_id: preferredPaperId.value ?? undefined,
    });
    router.replace({
      name: 'lesson',
      params: { lang: locale.lang, session_id: res.session_id },
    });
  } catch (e) {
    // The user is already onboarded; don't strand them. Surface the failure and
    // let the dashboard button below be the fallback.
    startFailed.value = true;
    errorMsg.value = extractError(e);
    submitting.value = false;
  }
}

async function onGoDashboard() {
  if (submitting.value) return;
  submitting.value = true;
  errorMsg.value = null;
  try {
    await completeOnboarding();
    router.replace({ name: 'dashboard', params: { lang: locale.lang } });
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to save onboarding';
    submitting.value = false;
  }
}

function selectPaper(p: Paper) {
  if (!paperStartable(p)) return;
  preferredPaperId.value = preferredPaperId.value === p.id ? null : p.id;
}

function clearExamDate() {
  examDate.value = '';
}

// ---- in-progress draft (resume after reload) ----
// The wizard's answers and current step are stashed in local storage on every
// change, so a refresh or accidental navigation resumes exactly where the user
// left off. The draft is cleared once onboarding is completed or skipped (see
// completeOnboarding). This is local storage only - an unfinished wizard never
// touches the backend. Anything unavailable (private mode / quota) fails
// quietly; resume is a nice-to-have, not load-bearing.
const DRAFT_KEY = 'finshark.onboarding_draft';

interface OnboardingDraft {
  step: 1 | 2 | 3;
  bgLevel: BgLevel | null;
  timeBudget: number;
  preferredPaperId: string | null;
  reminders: boolean;
  examDate: string;
}

function saveDraft() {
  try {
    const draft: OnboardingDraft = {
      step: step.value,
      bgLevel: bgLevel.value,
      timeBudget: timeBudget.value,
      preferredPaperId: preferredPaperId.value,
      reminders: reminders.value,
      examDate: examDate.value,
    };
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    /* private mode / quota - ignore */
  }
}

function restoreDraft() {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return;
    const d = JSON.parse(raw) as Partial<OnboardingDraft>;
    if (d.step === 1 || d.step === 2 || d.step === 3) step.value = d.step;
    if (
      d.bgLevel === 'beginner' ||
      d.bgLevel === 'intermediate' ||
      d.bgLevel === 'advanced' ||
      d.bgLevel === null
    ) {
      bgLevel.value = d.bgLevel;
    }
    if (typeof d.timeBudget === 'number') timeBudget.value = d.timeBudget;
    if (typeof d.preferredPaperId === 'string') {
      preferredPaperId.value = d.preferredPaperId;
    } else if (d.preferredPaperId === null) {
      preferredPaperId.value = null;
    }
    if (typeof d.reminders === 'boolean') reminders.value = d.reminders;
    if (typeof d.examDate === 'string') examDate.value = d.examDate;
  } catch {
    /* malformed draft - ignore and start fresh */
  }
}

function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* ignore */
  }
}

// Persist on every change so a reload never loses progress.
watch(
  () => [
    step.value,
    bgLevel.value,
    timeBudget.value,
    preferredPaperId.value,
    reminders.value,
    examDate.value,
  ],
  saveDraft,
);

function goNext() {
  if (step.value === 1 && !canAdvanceFromGoal.value) return;
  if (step.value < 3) step.value = (step.value + 1) as 1 | 2 | 3;
}

function goBack() {
  if (step.value > 1) step.value = (step.value - 1) as 1 | 2 | 3;
}

function extractError(e: unknown): string | null {
  if (e instanceof AxiosError) {
    const msg = (e.response?.data as { message?: string | string[] })?.message;
    return Array.isArray(msg) ? msg.join(', ') : msg ?? null;
  }
  return null;
}

onMounted(() => {
  loadPapers();
  // Entitlement decides whether premium-only papers are startable. Cheap and
  // idempotent; the store caches it.
  void entitlement.fetch();
  // Pre-fill from current user values (e.g. a user who revisits /onboarding
  // after the fact, or a returning skip).
  if (auth.user) {
    bgLevel.value = auth.user.bg_level;
    timeBudget.value = auth.user.time_budget_minutes;
    preferredPaperId.value = auth.user.preferred_paper_id;
    reminders.value = auth.user.email_reminders_enabled;
    examDate.value = auth.user.exam_date ?? '';
  }
  // Overlay any in-progress draft so a refresh or accidental navigation resumes
  // exactly where the user was, including the current step. Wins over the
  // pre-fill above, since the draft is the user's unfinished work.
  restoreDraft();
});
</script>

<template>
  <main class="page onboarding-page">
    <div class="onboarding-frame">

      <header class="onboarding-wizard-head">
        <h1>{{ t('onboarding.title') }}</h1>
        <p class="dim">{{ t('onboarding.subtitle') }}</p>
        <div class="onboarding-progress">
          <span class="onboarding-progress-label">{{ t('onboarding.step_of', { n: step, total: 3 }) }}</span>
          <div class="onboarding-progress-dots" aria-hidden="true">
            <span v-for="i in 3" :key="i" :class="['onboarding-progress-dot', { active: i <= step }]"></span>
          </div>
        </div>
      </header>

      <!-- Step 1: Goal -->
      <section v-if="step === 1" class="onboarding-section">
        <h2>{{ t('onboarding.goal_question') }}</h2>
        <p class="dim text-sm">{{ t('onboarding.goal_help') }}</p>

        <p v-if="papersLoading" class="dim text-sm">{{ t('common.loading') }}</p>
        <p v-else-if="papersError" class="error-text">{{ papersError }}</p>
        <p v-else-if="papers.length === 0" class="dim text-sm">{{ t('onboarding.paper.empty') }}</p>

        <template v-else>
          <div class="onboarding-chips">
            <button v-for="p in papers" :key="p.id" type="button"
              :class="['onboarding-chip', 'onboarding-chip-paper', { selected: preferredPaperId === p.id, 'is-disabled': !paperStartable(p) }]"
              :disabled="!paperStartable(p)" @click="selectPaper(p)">
              <span class="mono">{{ p.code }}</span>
              <span>{{ p.name }}</span>
              <span v-if="p.active_question_count === 0" class="onboarding-chip-badge">{{
                t('onboarding.goal_coming_soon') }}</span>
              <span v-else-if="!p.free_accessible && !entitlement.isPremium" class="onboarding-chip-badge">{{
                t('onboarding.goal_premium') }}</span>
            </button>
          </div>
          <p v-if="!hasSelectablePapers" class="dim text-sm onboarding-skip-note">{{ t('onboarding.goal_skip_note') }}
          </p>
        </template>

        <div class="onboarding-field">
          <label class="onboarding-field-label" for="onb-exam-date">{{ t('onboarding.exam_question') }}</label>
          <p class="dim text-sm">{{ t('onboarding.exam_help') }}</p>
          <div class="onboarding-field-row">
            <input id="onb-exam-date" v-model="examDate" type="date" :min="examDateMin" :max="examDateMaxValue"
              class="onboarding-date-input" />
            <button v-if="examDate" type="button" class="btn-link" @click="clearExamDate">{{ t('onboarding.exam_clear')
              }}</button>
          </div>
        </div>
      </section>

      <!-- Step 2: Commitment -->
      <section v-if="step === 2">
        <div class="onboarding-section">
          <h2>{{ t('onboarding.time.question') }}</h2>
          <p class="dim text-sm">{{ t('onboarding.time.help') }}</p>
          <div class="onboarding-chips">
            <button v-for="n in timeBudgetOptions" :key="n" type="button"
              :class="['onboarding-chip', { selected: timeBudget === n }]" @click="timeBudget = n">
              {{ t('onboarding.time.minutes', { n }) }}
            </button>
          </div>
        </div>

        <div class="onboarding-section">
          <h2>{{ t('onboarding.start_question') }}</h2>
          <div class="onboarding-cards">
            <button v-for="opt in startOptions" :key="opt.value" type="button"
              :class="['onboarding-card', { selected: bgLevel === opt.value }]" @click="bgLevel = opt.value">
              <span class="onboarding-card-title">{{ t(opt.titleKey) }}</span>
              <span class="onboarding-card-desc">{{ t(opt.descKey) }}</span>
            </button>
          </div>
        </div>

        <div class="onboarding-section">
          <label class="onboarding-toggle">
            <input v-model="reminders" type="checkbox" />
            <div>
              <span class="onboarding-toggle-title">{{ t('onboarding.reminders.question') }}</span>
              <span class="onboarding-toggle-desc dim text-sm">{{ t('onboarding.reminders.help') }}</span>
            </div>
          </label>
        </div>
      </section>

      <!-- Step 3: Confirm + start -->
      <section v-if="step === 3" class="onboarding-section">
        <h2>{{ t('onboarding.confirm_title') }}</h2>
        <ul class="onboarding-summary">
          <li v-if="selectedPaper">{{ t('onboarding.summary_paper', {
            code: selectedPaper.code, name: selectedPaper.name
            }) }}
          </li>
          <li v-else class="dim">{{ t('onboarding.summary_paper_none') }}</li>
          <li>{{ t('onboarding.summary_size', { n: estimatedLessonSize(timeBudget) }) }}</li>
          <li v-if="difficultySummaryKey">{{ t(difficultySummaryKey) }}</li>
          <li v-if="reminders">{{ t('onboarding.summary_reminders_on') }}</li>
          <li v-if="examCountdownDays !== null && examCountdownDays > 0">{{ t('onboarding.summary_exam_days', {
            days:
            examCountdownDays }) }}</li>
          <li v-else-if="examCountdownDays === 0">{{ t('onboarding.summary_exam_today') }}</li>
        </ul>

        <p v-if="startFailed" class="error-text onboarding-start-failed">
          {{ t('onboarding.start_failed') }}<span v-if="errorMsg"> ({{ errorMsg }})</span>
        </p>

        <div class="onboarding-final-actions">
          <button class="btn btn-primary" :disabled="submitting" @click="onStartFirstLesson">
            {{ submitting ? t('onboarding.start_btn_busy') : t('onboarding.start_btn') }}
          </button>
          <button class="btn btn-ghost" :disabled="submitting" @click="onGoDashboard">
            {{ t('onboarding.go_dashboard') }}
          </button>
        </div>
      </section>

      <p v-if="errorMsg && !startFailed" class="error-text">{{ errorMsg }}</p>

      <!-- Wizard nav. Back is available from step 2 onward (including the
           summary, so the user can return to edit). Next shows on steps 1-2;
           step 3 uses its own Start / dashboard actions above. -->
      <div class="onboarding-nav">
        <button v-if="step > 1" type="button" class="btn btn-ghost" :disabled="submitting" @click="goBack">{{
          t('onboarding.back') }}</button>
        <span v-else></span>
        <button v-if="step < 3" type="button" class="btn btn-primary" :disabled="step === 1 && !canAdvanceFromGoal"
          @click="goNext">
          {{ t('onboarding.next') }}
        </button>
        <span v-else></span>
      </div>

    </div>
  </main>
</template>

<style scoped>
.onboarding-wizard-head {
  margin-bottom: 28px;
}

.onboarding-wizard-head h1 {
  margin: 0;
}

.onboarding-wizard-head p {
  margin-top: 8px;
  font-size: 15px;
}

.onboarding-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 18px;
}

.onboarding-progress-label {
  font-size: 13px;
  color: var(--text-dim);
}

.onboarding-progress-dots {
  display: flex;
  gap: 6px;
}

/* No transform per house style - the active state is a colour fill only. */
.onboarding-progress-dot {
  width: 28px;
  height: 6px;
  border-radius: 999px;
  background: var(--bg-elev);
  transition: background-color 160ms ease;
}

.onboarding-progress-dot.active {
  background: var(--accent);
}

/* Non-startable papers (no questions yet, or premium-locked for a free user)
   stay visible but can't be picked as the first-lesson target. */
.onboarding-chip.is-disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.onboarding-chip.is-disabled:hover {
  border-color: var(--border);
}

.onboarding-chip-badge {
  font-size: 11px;
  color: var(--text-mute);
  background: var(--bg-elev);
  border-radius: 999px;
  padding: 2px 8px;
}

.onboarding-skip-note {
  margin-top: 10px;
}

.onboarding-field {
  margin-top: 28px;
}

.onboarding-field-label {
  display: block;
  font-weight: 500;
  font-size: 15px;
}

.onboarding-field-row {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;
}

.onboarding-date-input {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 8px 12px;
  color: var(--text);
  font: inherit;
  transition: border-color 120ms ease;
}

.onboarding-date-input:focus {
  outline: none;
  border-color: var(--accent);
}

.onboarding-summary {
  list-style: none;
  padding: 0;
  margin: 14px 0 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.onboarding-summary li {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 10px 14px;
  font-size: 14px;
}

.onboarding-summary li.dim {
  color: var(--text-dim);
}

.onboarding-start-failed {
  margin-top: 14px;
}

.onboarding-final-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 22px;
}

.onboarding-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 28px;
}
</style>