<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../stores/auth.store';
import { useThemeStore } from '../stores/theme.store';
import { useLocaleStore } from '../stores/locale.store';
import { profileApi, type UpdatePreferencesPayload } from '../api/profile.api';
import { api } from '../api/client';
import { applyOverrides, type Lang } from '../i18n';

const { t } = useI18n();
const auth = useAuthStore();
const theme = useThemeStore();
const locale = useLocaleStore();

const errorMsg = ref<string | null>(null);
// Track saving spinner per-field so toggling reminders doesn't grey out the lesson-size dropdown.
const savingField = ref<string | null>(null);

const LESSON_SIZES = [3, 5, 7, 10];
const DIFFICULTIES = ['auto', 'easy', 'medium', 'hard'] as const;
type DiffChoice = (typeof DIFFICULTIES)[number];

// Local form state, seeded from the auth.user object on each render.
// We don't use v-model on auth.user directly because some controls (e.g.
// difficulty) need a "synthetic" auto sentinel that maps to null on the wire.
const lessonSize = computed({
  get: () => auth.user?.lesson_size ?? 5,
  set: (v: number) => persistPreference({ lesson_size: v }, 'lesson_size'),
});

const reminderHour = computed({
  get: () => auth.user?.reminder_hour_utc ?? 18,
  set: (v: number) => persistPreference({ reminder_hour_utc: v }, 'reminder_hour'),
});

const difficulty = computed<DiffChoice>({
  get: () => auth.user?.preferred_difficulty ?? 'auto',
  set: (v: DiffChoice) =>
    persistPreference(
      { preferred_difficulty: v === 'auto' ? null : v },
      'preferred_difficulty',
    ),
});

const remindersEnabled = computed({
  get: () => auth.user?.email_reminders_enabled ?? false,
  set: (v: boolean) => persistPreference({ email_reminders_enabled: v }, 'email_reminders'),
});

async function persistPreference(payload: UpdatePreferencesPayload, field: string) {
  if (savingField.value || !auth.user) return;
  savingField.value = field;
  errorMsg.value = null;
  try {
    const updated = await profileApi.updatePreferences(payload);
    auth.user = updated;
    localStorage.setItem('finshark.user', JSON.stringify(updated));
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to update settings';
  } finally {
    savingField.value = null;
  }
}

function onLangChange(next: Lang) {
  locale.setLang(next);
  // Re-fetch overrides for the new language so they apply immediately. Failures
  // fall back silently to the static bundled locale, same as on initial boot.
  api
    .get<Record<string, string>>(`/ui-translations/${next}`)
    .then((res) => applyOverrides(next, res.data))
    .catch(() => {
      /* ignore */
    });
}

function onThemeChange(next: 'light' | 'dark') {
  theme.setTheme(next);
}

function extractError(e: unknown): string | null {
  if (e instanceof AxiosError) {
    const msg = (e.response?.data as { message?: string | string[] })?.message;
    return Array.isArray(msg) ? msg.join(', ') : msg ?? null;
  }
  return null;
}

// Hours array for the reminder hour <select>.
const hours = Array.from({ length: 24 }, (_, i) => i);

// Show two-digit UTC hour ("06:00").
function fmtHour(h: number): string {
  return `${h.toString().padStart(2, '0')}:00`;
}

// Lightweight "saved" indicator. Watch savingField transitions to false and
// briefly show a checkmark. Pure UX; no functional impact.
const justSaved = ref<string | null>(null);
let savedTimer: number | null = null;
watch(savingField, (next, prev) => {
  if (prev && !next && !errorMsg.value) {
    justSaved.value = prev;
    if (savedTimer) window.clearTimeout(savedTimer);
    savedTimer = window.setTimeout(() => { justSaved.value = null; }, 1200);
  }
});
</script>

<template>
  <main class="page">
    <div class="container">

      <div class="topbar">
        <h1>{{ t('settings.title') }}</h1>
        <RouterLink to="/dashboard" class="btn-link">{{ t('nav.back_to_dashboard') }}</RouterLink>
      </div>

      <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>

      <!-- Appearance -->
      <section class="card">
        <h2>{{ t('settings.appearance') }}</h2>
        <div class="row mt-4">
          <span class="grow">{{ t('theme.label') }}</span>
          <div class="segmented">
            <button
              type="button"
              :class="{ active: theme.theme === 'light' }"
              @click="onThemeChange('light')"
            >{{ t('theme.light') }}</button>
            <button
              type="button"
              :class="{ active: theme.theme === 'dark' }"
              @click="onThemeChange('dark')"
            >{{ t('theme.dark') }}</button>
          </div>
        </div>
      </section>

      <!-- Language -->
      <section class="card">
        <h2>{{ t('settings.language_section') }}</h2>
        <div class="row mt-4">
          <span class="grow">{{ t('lang.label') }}</span>
          <div class="segmented">
            <button
              type="button"
              :class="{ active: locale.lang === 'ru' }"
              @click="onLangChange('ru')"
            >{{ t('lang.name_ru') }}</button>
            <button
              type="button"
              :class="{ active: locale.lang === 'en' }"
              @click="onLangChange('en')"
            >{{ t('lang.name_en') }}</button>
          </div>
        </div>
      </section>

      <!-- Lessons -->
      <section class="card">
        <h2>{{ t('settings.lesson_section') }}</h2>

        <div class="row mt-4">
          <span class="grow">{{ t('settings.lesson_size') }}</span>
          <select
            :value="lessonSize"
            :disabled="savingField === 'lesson_size'"
            @change="lessonSize = parseInt(($event.target as HTMLSelectElement).value, 10)"
            style="max-width: 120px;"
          >
            <option v-for="n in LESSON_SIZES" :key="n" :value="n">{{ n }}</option>
          </select>
          <span v-if="justSaved === 'lesson_size'" class="dim text-xs">{{ t('admin.localization.saved') }} ✓</span>
        </div>

        <div class="row mt-4">
          <span class="grow">{{ t('settings.preferred_difficulty') }}</span>
          <select
            :value="difficulty"
            :disabled="savingField === 'preferred_difficulty'"
            @change="difficulty = ($event.target as HTMLSelectElement).value as DiffChoice"
            style="max-width: 200px;"
          >
            <option value="auto">{{ t('settings.preferred_difficulty_auto') }}</option>
            <option value="easy">{{ t('admin.questions.difficulty_easy') }}</option>
            <option value="medium">{{ t('admin.questions.difficulty_medium') }}</option>
            <option value="hard">{{ t('admin.questions.difficulty_hard') }}</option>
          </select>
          <span v-if="justSaved === 'preferred_difficulty'" class="dim text-xs">{{ t('admin.localization.saved') }} ✓</span>
        </div>
      </section>

      <!-- Notifications -->
      <section class="card">
        <h2>{{ t('settings.notifications_section') }}</h2>

        <div class="row mt-4">
          <div class="grow">
            <div style="font-weight: 500;">{{ t('dashboard.daily_reminders_title') }}</div>
            <div class="dim text-sm" style="margin-top: 2px;">
              {{ t('dashboard.daily_reminders_sub') }}
            </div>
          </div>
          <button
            class="toggle"
            :class="{ on: remindersEnabled }"
            :disabled="savingField === 'email_reminders'"
            :aria-label="remindersEnabled ? t('dashboard.reminders_on') : t('dashboard.reminders_off')"
            @click="remindersEnabled = !remindersEnabled"
          >
            <span class="toggle-knob"></span>
          </button>
        </div>

        <div class="row mt-4" :style="{ opacity: remindersEnabled ? 1 : 0.5 }">
          <span class="grow">{{ t('settings.reminder_hour') }}</span>
          <select
            :value="reminderHour"
            :disabled="!remindersEnabled || savingField === 'reminder_hour'"
            @change="reminderHour = parseInt(($event.target as HTMLSelectElement).value, 10)"
            style="max-width: 120px;"
          >
            <option v-for="h in hours" :key="h" :value="h">{{ fmtHour(h) }}</option>
          </select>
          <span v-if="justSaved === 'reminder_hour'" class="dim text-xs">{{ t('admin.localization.saved') }} ✓</span>
        </div>
      </section>

    </div>
  </main>
</template>
