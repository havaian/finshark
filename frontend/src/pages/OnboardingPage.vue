<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { onboardingApi, type CompleteOnboardingInput } from '../api/onboarding.api';
import { lessonsApi } from '../api/lessons.api';
import { useAuthStore } from '../stores/auth.store';
import { useLocaleStore } from '../stores/locale.store';
import type { BgLevel } from '../types/auth';
import type { Paper } from '../types/content';

// Onboarding wizard. Single-page (no stepper) — four optional questions.
// Skip = empty submit, which the backend handles by stamping onboarded_at only.
//
// All fields are optional from the API's perspective. The Continue button is
// always enabled (it just submits whatever the user filled in). Skip submits
// nothing.

const { t } = useI18n();
const router = useRouter();
const auth = useAuthStore();
const locale = useLocaleStore();

const papers = ref<Paper[]>([]);
const papersLoading = ref(true);
const papersError = ref<string | null>(null);

const bgLevel = ref<BgLevel | null>(null);
const timeBudget = ref<number>(15);
const preferredPaperId = ref<string | null>(null);
const reminders = ref<boolean>(false);

const submitting = ref(false);
const errorMsg = ref<string | null>(null);

// Available time budgets — kept small and human (not a slider) so users
// commit to a deliberate value. DB allows 5..60 so this list stays inside.
const timeBudgetOptions = [5, 10, 15, 20, 30, 45, 60];

const bgLevelOptions = computed<Array<{ value: BgLevel; titleKey: string; descKey: string }>>(() => [
  { value: 'beginner', titleKey: 'onboarding.bg.beginner_title', descKey: 'onboarding.bg.beginner_desc' },
  { value: 'intermediate', titleKey: 'onboarding.bg.intermediate_title', descKey: 'onboarding.bg.intermediate_desc' },
  { value: 'advanced', titleKey: 'onboarding.bg.advanced_title', descKey: 'onboarding.bg.advanced_desc' },
]);

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
  // Always send time_budget — it has a default but the user explicitly chose this.
  // Only skip if literally untouched? We track that with a `touched` flag? Simpler:
  // since the default in the UI is 15 and matches the DB default, sending it is harmless.
  payload.time_budget_minutes = timeBudget.value;
  if (preferredPaperId.value) payload.preferred_paper_id = preferredPaperId.value;
  // Reminders default is false — only send if user toggled it on, to avoid
  // overwriting a user who already had reminders enabled some other way.
  if (reminders.value) payload.email_reminders_enabled = true;
  return payload;
}

async function onComplete() {
  if (submitting.value) return;
  submitting.value = true;
  errorMsg.value = null;
  try {
    const updated = await onboardingApi.complete(buildPayload());
    auth.setUser(updated);
    // After onboarding, deep-link straight to the user's chosen paper if any.
    router.replace({ name: 'dashboard', params: { lang: locale.lang } });
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to save onboarding';
  } finally {
    submitting.value = false;
  }
}

async function onSkip() {
  if (submitting.value) return;
  submitting.value = true;
  errorMsg.value = null;
  try {
    // Empty body — backend stamps onboarded_at only, leaves preferences alone.
    const updated = await onboardingApi.complete({});
    auth.setUser(updated);
    router.replace({ name: 'dashboard', params: { lang: locale.lang } });
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to skip onboarding';
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

onMounted(() => {
  loadPapers();
  // Pre-fill from current user values if they exist (e.g. user navigated to
  // /onboarding manually after already onboarding).
  if (auth.user) {
    bgLevel.value = auth.user.bg_level;
    timeBudget.value = auth.user.time_budget_minutes;
    preferredPaperId.value = auth.user.preferred_paper_id;
    reminders.value = auth.user.email_reminders_enabled;
  }
});
</script>

<template>
  <main class="page onboarding-page">
    <div class="onboarding-frame">

      <header class="onboarding-head">
        <h1>{{ t('onboarding.title') }}</h1>
        <p class="dim">{{ t('onboarding.subtitle') }}</p>
        <button type="button" class="btn-link onboarding-skip" :disabled="submitting" @click="onSkip">
          {{ t('onboarding.skip') }} →
        </button>
      </header>

      <section class="onboarding-section">
        <h2>{{ t('onboarding.bg.question') }}</h2>
        <div class="onboarding-cards">
          <button v-for="opt in bgLevelOptions" :key="opt.value" type="button"
            :class="['onboarding-card', { selected: bgLevel === opt.value }]" @click="bgLevel = opt.value">
            <span class="onboarding-card-title">{{ t(opt.titleKey) }}</span>
            <span class="onboarding-card-desc">{{ t(opt.descKey) }}</span>
          </button>
        </div>
      </section>

      <section class="onboarding-section">
        <h2>{{ t('onboarding.time.question') }}</h2>
        <p class="dim text-sm">{{ t('onboarding.time.help') }}</p>
        <div class="onboarding-chips">
          <button v-for="n in timeBudgetOptions" :key="n" type="button"
            :class="['onboarding-chip', { selected: timeBudget === n }]" @click="timeBudget = n">
            {{ t('onboarding.time.minutes', { n }) }}
          </button>
        </div>
      </section>

      <section class="onboarding-section">
        <h2>{{ t('onboarding.paper.question') }}</h2>
        <p v-if="papersLoading" class="dim text-sm">{{ t('common.loading') }}</p>
        <p v-else-if="papersError" class="error-text">{{ papersError }}</p>
        <p v-else-if="papers.length === 0" class="dim text-sm">
          {{ t('onboarding.paper.empty') }}
        </p>
        <div v-else class="onboarding-chips">
          <button v-for="p in papers" :key="p.id" type="button"
            :class="['onboarding-chip', 'onboarding-chip-paper', { selected: preferredPaperId === p.id }]"
            @click="preferredPaperId = preferredPaperId === p.id ? null : p.id">
            <span class="mono">{{ p.code }}</span>
            <span>{{ p.name }}</span>
          </button>
        </div>
      </section>

      <section class="onboarding-section">
        <label class="onboarding-toggle">
          <input v-model="reminders" type="checkbox" />
          <div>
            <span class="onboarding-toggle-title">{{ t('onboarding.reminders.question') }}</span>
            <span class="onboarding-toggle-desc dim text-sm">{{ t('onboarding.reminders.help') }}</span>
          </div>
        </label>
      </section>

      <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>

      <div class="onboarding-foot">
        <button class="btn btn-primary" :disabled="submitting" @click="onComplete">
          {{ submitting ? t('common.saving') : t('onboarding.continue') }}
        </button>
      </div>

    </div>
  </main>
</template>
