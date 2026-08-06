<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../stores/auth.store';
import { useThemeStore } from '../stores/theme.store';
import { useLocaleStore } from '../stores/locale.store';
import { profileApi, type UpdatePreferencesPayload } from '../api/profile.api';
import { totpApi } from '../api/totp.api';
import { authApi } from '../api/auth.api';
import { SUPPORTED_LANGS, type Lang } from '../i18n';
import { useLocalePath } from '../router/useLocalePath';
import AppNav from '../components/AppNav.vue';

const { t } = useI18n();
const auth = useAuthStore();
const theme = useThemeStore();
const locale = useLocaleStore();
const router = useRouter();
const lp = useLocalePath();

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
  get: () => auth.user?.reminder_hour_local ?? 18,
  set: (v: number) => persistPreference({ reminder_hour_local: v }, 'reminder_hour'),
});

// Curated list of timezones we surface in the picker. Order: launch market
// first (UZ → CIS → EU → UK → UTC → US). Storing the IANA name keeps DST
// and historical-offset edge cases off our plate. If a user's existing
// timezone isn't in this list we still show it as the selected option so
// nothing is silently rewritten under them.
const TIMEZONE_CHOICES: ReadonlyArray<string> = [
  'Asia/Tashkent',
  'Asia/Almaty',
  'Asia/Bishkek',
  'Asia/Dushanbe',
  'Asia/Ashgabat',
  'Asia/Baku',
  'Asia/Yerevan',
  'Asia/Tbilisi',
  'Europe/Moscow',
  'Europe/Kyiv',
  'Europe/Minsk',
  'Europe/Istanbul',
  'Europe/Berlin',
  'Europe/Paris',
  'Europe/London',
  'UTC',
  'Asia/Dubai',
  'Asia/Karachi',
  'Asia/Kolkata',
  'Asia/Bangkok',
  'Asia/Singapore',
  'Asia/Tokyo',
  'America/New_York',
  'America/Chicago',
  'America/Los_Angeles',
];

const timezoneOptions = computed<string[]>(() => {
  const current = auth.user?.timezone;
  if (current && !TIMEZONE_CHOICES.includes(current)) {
    return [current, ...TIMEZONE_CHOICES];
  }
  return [...TIMEZONE_CHOICES];
});

const timezone = computed({
  get: () => auth.user?.timezone ?? 'Asia/Tashkent',
  set: (v: string) => persistPreference({ timezone: v }, 'timezone'),
});

// Label a timezone with its current UTC offset, e.g. "Asia/Tashkent (UTC+5)".
// Computed live so DST-aware zones (Europe/London, America/New_York…) reflect
// the current offset rather than a hard-coded one.
function fmtTimezone(tz: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: tz,
      timeZoneName: 'shortOffset',
    }).formatToParts(new Date());
    const offset = parts.find((p) => p.type === 'timeZoneName')?.value ?? '';
    return offset ? `${tz} (${offset})` : tz;
  } catch {
    return tz;
  }
}

// Render the reminder hour the way the user thinks of it: "18:00 (Asia/Tashkent)".
function fmtReminderLocal(h: number, tz: string): string {
  return `${h.toString().padStart(2, '0')}:00 ${tz}`;
}

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

const leaderboardOptIn = computed({
  get: () => auth.user?.leaderboard_opt_in ?? false,
  set: (v: boolean) => persistPreference({ leaderboard_opt_in: v }, 'leaderboard_opt_in'),
});

// Exam date. Empty string clears it (sends null). Picker bounds mirror the
// server-side validation (today .. +3 years) so the UI can't submit an
// out-of-range value.
function isoToday(): string {
  return new Date().toISOString().slice(0, 10);
}
const examDateMin = isoToday();
const examDateMax = (() => {
  const d = new Date(`${isoToday()}T00:00:00Z`);
  d.setUTCFullYear(d.getUTCFullYear() + 3);
  return d.toISOString().slice(0, 10);
})();
const examDate = computed({
  get: () => auth.user?.exam_date ?? '',
  set: (v: string) => persistPreference({ exam_date: v ? v : null }, 'exam_date'),
});

async function persistPreference(payload: UpdatePreferencesPayload, field: string) {
  if (savingField.value || !auth.user) return;
  savingField.value = field;
  errorMsg.value = null;
  try {
    const updated = await profileApi.updatePreferences(payload);
    // Use the store helper so localStorage stays in sync via one path. The
    // previous direct assignment didn't actually mutate the store ref under
    // Pinia setup syntax, so updates only "looked" applied until next reload.
    auth.setUser(updated);
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to update settings';
  } finally {
    savingField.value = null;
  }
}

function onLangChange(next: Lang) {
  // Per the locale-in-routes design: language changes swap the :lang segment
  // in the URL and trigger a full page reload, which is the cleanest way to
  // drop any rendered strings from the previous lang's i18n bundle. The
  // locale store is updated first so anything that reads localStorage on
  // boot sees the new value. We DON'T call applyOverrides() here - that
  // happens on boot in main.ts after the reload.
  if (next === locale.lang) return;
  // setLang updates the ref + persists synchronously; the async chunk-load it
  // kicks off is discarded because we reload below, and bootstrapLocale redoes
  // it cleanly on the fresh page. Hence void.
  void locale.setLang(next);

  const url = new URL(window.location.href);
  const segments = url.pathname.split('/');
  // segments[0] is '' (leading slash); segments[1] is the current lang.
  if (segments.length >= 2 && (SUPPORTED_LANGS as readonly string[]).includes(segments[1])) {
    segments[1] = next;
    url.pathname = segments.join('/');
  } else {
    // Defensive: prepend if no lang prefix found (shouldn't happen inside
    // the localized tree, but safe fallback).
    url.pathname = `/${next}${url.pathname}`;
  }
  window.location.assign(url.toString());
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

// ── 2FA (admin only) ──────────────────────────────────────────────────
// Reads totp_enabled directly from auth.user so the section flips between
// "Enable" and "Disable" states without a separate fetch. The fresh value
// gets pushed in by completeTwoFactorLogin or by the setup-page redirect's
// auth.setUser call.
const isAdmin = computed(() => auth.user?.is_admin === true);
const twoFactorEnabled = computed(() => auth.user?.totp_enabled === true);

// Disable flow: an inline form with a code input. Kept inline (rather than
// a route) because it's small enough and keeps the user on Settings.
const showDisable2faForm = ref(false);
const disable2faCode = ref('');
const disable2faSubmitting = ref(false);
const disable2faError = ref<string | null>(null);

function goEnable2fa() {
  router.push(lp('/settings/2fa'));
}

function openDisable2faForm() {
  showDisable2faForm.value = true;
  disable2faCode.value = '';
  disable2faError.value = null;
}

function cancelDisable2fa() {
  showDisable2faForm.value = false;
  disable2faCode.value = '';
  disable2faError.value = null;
}

async function confirmDisable2fa() {
  disable2faSubmitting.value = true;
  disable2faError.value = null;
  try {
    await totpApi.disable(disable2faCode.value.trim());
    // Re-fetch /me so the store reflects totp_enabled=false. Doing it
    // explicitly (rather than mutating the local user) keeps the source
    // of truth on the backend.
    const me = await authApi.me();
    auth.setUser(me);
    showDisable2faForm.value = false;
    disable2faCode.value = '';
  } catch (e) {
    if (e instanceof AxiosError && e.response?.status === 401) {
      disable2faError.value = t('settings.tfa_disable_error_invalid');
    } else {
      disable2faError.value = t('settings.tfa_disable_error_generic');
    }
  } finally {
    disable2faSubmitting.value = false;
  }
}

// ── Recovery codes state ──────────────────────────────────────────────
// Loaded when the 2FA section becomes visible (twoFactorEnabled === true).
// Watch on twoFactorEnabled triggers the fetch; we don't bother with a
// separate "load 2FA stuff" lifecycle hook.
const remainingCodes = ref<number | null>(null);

async function loadRemainingCodes() {
  if (!twoFactorEnabled.value) {
    remainingCodes.value = null;
    return;
  }
  try {
    const r = await totpApi.remainingCodes();
    remainingCodes.value = r.remaining;
  } catch {
    // Non-fatal - section will just omit the counter.
    remainingCodes.value = null;
  }
}

watch(twoFactorEnabled, loadRemainingCodes, { immediate: true });

// Regenerate flow: inline form (code input) → confirmation screen with
// the new codes + "I saved them" checkbox → done.
const regenStep = ref<'idle' | 'verify' | 'show'>('idle');
const regenCode = ref('');
const regenSubmitting = ref(false);
const regenError = ref<string | null>(null);
const regenNewCodes = ref<string[]>([]);
const regenSavedConfirmed = ref(false);

function openRegen() {
  regenStep.value = 'verify';
  regenCode.value = '';
  regenError.value = null;
  regenNewCodes.value = [];
  regenSavedConfirmed.value = false;
}

function cancelRegen() {
  regenStep.value = 'idle';
  regenCode.value = '';
  regenError.value = null;
  regenNewCodes.value = [];
  regenSavedConfirmed.value = false;
}

async function confirmRegen() {
  regenSubmitting.value = true;
  regenError.value = null;
  try {
    const result = await totpApi.regenerateCodes(regenCode.value.trim());
    regenNewCodes.value = result.recovery_codes;
    regenStep.value = 'show';
    // Refresh the remaining counter - now 10 fresh codes.
    await loadRemainingCodes();
  } catch (e) {
    if (e instanceof AxiosError && e.response?.status === 401) {
      regenError.value = t('settings.tfa_disable_error_invalid');
    } else {
      regenError.value = t('settings.tfa_disable_error_generic');
    }
  } finally {
    regenSubmitting.value = false;
  }
}

function copyRegenCodes() {
  if (!navigator.clipboard) return;
  navigator.clipboard
    .writeText(regenNewCodes.value.join('\n'))
    .catch(() => { });
}

function finishRegen() {
  regenStep.value = 'idle';
  regenCode.value = '';
  regenNewCodes.value = [];
  regenSavedConfirmed.value = false;
}

// ── Audit log (collapsible) ───────────────────────────────────────────
// Lazy-loaded on first open. We keep it collapsed by default to avoid
// surprising the user with a wall of timestamps; admins who want
// forensics can expand it.
const auditOpen = ref(false);
const auditLoading = ref(false);
const auditEntries = ref<import('../types/totp').TotpAuditEntry[]>([]);

async function toggleAudit() {
  auditOpen.value = !auditOpen.value;
  if (auditOpen.value && auditEntries.value.length === 0) {
    auditLoading.value = true;
    try {
      auditEntries.value = await totpApi.audit();
    } catch {
      auditEntries.value = [];
    } finally {
      auditLoading.value = false;
    }
  }
}

// Localise an event code. Falls back to the raw code if no key exists -
// keeps the UI useful even if the backend ships a new event before the
// frontend has a translation for it.
function localiseAuditEvent(code: string): string {
  const key = `settings.tfa_audit_event_${code}`;
  const translated = t(key);
  // vue-i18n returns the key verbatim on miss; detect and fall back.
  return translated === key ? code : translated;
}

function formatAuditMeta(meta: Record<string, unknown>): string {
  if (!meta || Object.keys(meta).length === 0) return '';
  // Compact key=value list. Stringify scalars only; jsonb here is always
  // shallow so no need for recursive formatting.
  return Object.entries(meta)
    .map(([k, v]) => `${k}=${String(v)}`)
    .join(' · ');
}

</script>

<template>
  <main class="page">
    <AppNav />
    <div class="container">

      <header class="page-head">
        <h1>{{ t('settings.title') }}</h1>
      </header>

      <!-- Billing lives on its own page. Placed FIRST because it was previously
           wedged between reminders and privacy, where nobody looking for it
           would think to scroll.
           (/subscription).
           The full redeem widget + plan status + history were moved there so
           they aren't cramped here and are easier to find. This is just a
           link through to it. -->
      <RouterLink :to="lp('/subscription')" class="card settings-link-card">
        <div class="grow">
          <div style="font-weight: 500;">{{ t('subscription.link_title') }}</div>
          <div class="dim text-sm" style="margin-top: 2px;">{{ t('subscription.link_sub') }}</div>
        </div>
        <span class="settings-link-cta">{{ t('subscription.link_cta') }} →</span>
      </RouterLink>


      <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>

      <!-- Appearance -->
      <section class="card">
        <h2>{{ t('settings.appearance') }}</h2>
        <div class="row mt-4">
          <span class="grow">{{ t('theme.label') }}</span>
          <div class="segmented">
            <button type="button" :class="{ active: theme.theme === 'light' }" @click="onThemeChange('light')">{{
              t('theme.light') }}</button>
            <button type="button" :class="{ active: theme.theme === 'dark' }" @click="onThemeChange('dark')">{{
              t('theme.dark') }}</button>
          </div>
        </div>
      </section>

      <!-- Language -->
      <section class="card">
        <h2>{{ t('settings.language_section') }}</h2>
        <div class="row mt-4">
          <span class="grow">{{ t('lang.label') }}</span>
          <div class="segmented">
            <button v-for="code in SUPPORTED_LANGS" :key="code" type="button"
              :class="{ active: locale.lang === code }" @click="onLangChange(code)">{{ t(`lang.name_${code}`) }}</button>
          </div>
        </div>
      </section>

      <!-- Lessons -->
      <section class="card">
        <h2>{{ t('settings.lesson_section') }}</h2>

        <div class="row mt-4">
          <span class="grow">{{ t('settings.lesson_size') }}</span>
          <select :value="lessonSize" :disabled="savingField === 'lesson_size'"
            @change="lessonSize = parseInt(($event.target as HTMLSelectElement).value, 10)" style="max-width: 120px;">
            <option v-for="n in LESSON_SIZES" :key="n" :value="n">{{ n }}</option>
          </select>
          <span v-if="justSaved === 'lesson_size'" class="dim text-xs">{{ t('admin.localization.saved') }} ✓</span>
        </div>

        <div class="row mt-4">
          <span class="grow">{{ t('settings.preferred_difficulty') }}</span>
          <select :value="difficulty" :disabled="savingField === 'preferred_difficulty'"
            @change="difficulty = ($event.target as HTMLSelectElement).value as DiffChoice" style="max-width: 200px;">
            <option value="auto">{{ t('settings.preferred_difficulty_auto') }}</option>
            <option value="easy">{{ t('admin.questions.difficulty_easy') }}</option>
            <option value="medium">{{ t('admin.questions.difficulty_medium') }}</option>
            <option value="hard">{{ t('admin.questions.difficulty_hard') }}</option>
          </select>
          <span v-if="justSaved === 'preferred_difficulty'" class="dim text-xs">{{ t('admin.localization.saved') }}
            ✓</span>
        </div>

        <div class="row mt-4">
          <span class="grow">{{ t('settings.exam_date') }}</span>
          <input type="date" :value="examDate" :disabled="savingField === 'exam_date'" :min="examDateMin"
            :max="examDateMax" @change="examDate = ($event.target as HTMLInputElement).value"
            style="max-width: 180px;" />
          <button v-if="examDate" type="button" class="btn-link" :disabled="savingField === 'exam_date'"
            @click="examDate = ''">{{ t('settings.exam_date_clear') }}</button>
          <span v-if="justSaved === 'exam_date'" class="dim text-xs">{{ t('admin.localization.saved') }} ✓</span>
        </div>
        <p class="dim text-xs mt-2">{{ t('settings.exam_date_hint') }}</p>
      </section>

      <!-- Notifications -->
      <section class="card">
        <h2>{{ t('settings.notifications_section') }}</h2>

        <div class="row mt-4">
          <div class="grow">
            <div style="font-weight: 500;">{{ t('dashboard.daily_reminders_title') }}</div>
            <div class="dim text-sm" style="margin-top: 2px;">
              {{ t('dashboard.daily_reminders_sub', { hour: reminderHour.toString().padStart(2, '0'), tz: timezone }) }}
            </div>
          </div>
          <button class="toggle" :class="{ on: remindersEnabled }" :disabled="savingField === 'email_reminders'"
            :aria-label="remindersEnabled ? t('dashboard.reminders_on') : t('dashboard.reminders_off')"
            @click="remindersEnabled = !remindersEnabled">
            <span class="toggle-knob"></span>
          </button>
        </div>

        <div class="row mt-4" :style="{ opacity: remindersEnabled ? 1 : 0.5 }">
          <span class="grow">{{ t('settings.timezone') }}</span>
          <select :value="timezone" :disabled="!remindersEnabled || savingField === 'timezone'"
            @change="timezone = ($event.target as HTMLSelectElement).value" style="max-width: 280px;">
            <option v-for="tz in timezoneOptions" :key="tz" :value="tz">{{ fmtTimezone(tz) }}</option>
          </select>
          <span v-if="justSaved === 'timezone'" class="dim text-xs">{{ t('admin.localization.saved') }} ✓</span>
        </div>

        <div class="row mt-4" :style="{ opacity: remindersEnabled ? 1 : 0.5 }">
          <span class="grow">{{ t('settings.reminder_hour') }}</span>
          <select :value="reminderHour" :disabled="!remindersEnabled || savingField === 'reminder_hour'"
            @change="reminderHour = parseInt(($event.target as HTMLSelectElement).value, 10)" style="max-width: 120px;">
            <option v-for="h in hours" :key="h" :value="h">{{ fmtHour(h) }}</option>
          </select>
          <span v-if="justSaved === 'reminder_hour'" class="dim text-xs">{{ t('admin.localization.saved') }} ✓</span>
        </div>
        <p class="dim text-xs mt-2">
          {{ t('settings.reminder_hour_hint', { time: fmtReminderLocal(reminderHour, timezone) }) }}
        </p>
      </section>


      <!-- Privacy -->
      <section class="card">
        <h2>{{ t('settings.privacy_section') }}</h2>
        <div class="row mt-4">
          <div class="grow">
            <div style="font-weight: 500;">{{ t('settings.leaderboard_optin_title') }}</div>
            <div class="dim text-sm" style="margin-top: 2px;">
              {{ t('settings.leaderboard_optin_sub') }}
            </div>
          </div>
          <button class="toggle" :class="{ on: leaderboardOptIn }" :disabled="savingField === 'leaderboard_opt_in'"
            :aria-label="leaderboardOptIn ? t('settings.leaderboard_on') : t('settings.leaderboard_off')"
            @click="leaderboardOptIn = !leaderboardOptIn">
            <span class="toggle-knob"></span>
          </button>
        </div>
        <p v-if="justSaved === 'leaderboard_opt_in'" class="dim text-xs mt-2">
          {{ t('admin.localization.saved') }} ✓
        </p>
      </section>

      <!-- Two-factor authentication - admin-only. Section hides entirely
           for non-admins so it doesn't surface a feature they can't use. -->
      <section v-if="isAdmin" class="card">
        <h2>{{ t('settings.tfa_section') }}</h2>
        <p class="dim text-sm mt-2">{{ t('settings.tfa_section_sub') }}</p>

        <div class="row mt-4" style="align-items: center;">
          <div class="grow">
            <div style="font-weight: 500;">
              <template v-if="twoFactorEnabled">
                {{ t('settings.tfa_status_on') }}
              </template>
              <template v-else>
                {{ t('settings.tfa_status_off') }}
              </template>
            </div>
            <div class="dim text-sm" style="margin-top: 2px;">
              <template v-if="twoFactorEnabled">
                {{ t('settings.tfa_status_on_sub') }}
              </template>
              <template v-else>
                {{ t('settings.tfa_status_off_sub') }}
              </template>
            </div>
          </div>

          <button v-if="!twoFactorEnabled" class="btn btn-primary" @click="goEnable2fa">
            {{ t('settings.tfa_enable_btn') }}
          </button>
          <button v-else-if="!showDisable2faForm" class="btn btn-ghost" @click="openDisable2faForm">
            {{ t('settings.tfa_disable_btn') }}
          </button>
        </div>

        <!-- Inline disable form. Requires a current 6-digit code (or recovery
             code) so a stolen session can't strip the factor. -->
        <div v-if="twoFactorEnabled && showDisable2faForm" class="mt-4">
          <label class="field-label">{{ t('settings.tfa_disable_code_label') }}</label>
          <input v-model="disable2faCode" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="32"
            placeholder="123456" style="margin-top: 6px; font-family: ui-monospace, monospace; letter-spacing: 0.06em;"
            @keydown.enter="disable2faCode.length >= 6 && !disable2faSubmitting && confirmDisable2fa()" />
          <p v-if="disable2faError" class="error-text mt-2">{{ disable2faError }}</p>
          <div class="row mt-4" style="gap: 8px;">
            <button class="btn btn-danger" :disabled="disable2faSubmitting || disable2faCode.trim().length < 6"
              @click="confirmDisable2fa">
              {{ disable2faSubmitting ? t('common.saving') : t('settings.tfa_disable_confirm') }}
            </button>
            <button class="btn btn-ghost" :disabled="disable2faSubmitting" @click="cancelDisable2fa">
              {{ t('common.cancel') }}
            </button>
          </div>
        </div>

        <!-- Recovery codes panel - visible only when 2FA is enabled. Shows
             remaining count + regenerate flow. We don't show the codes
             themselves; only newly-generated ones are surfaced (once). -->
        <div v-if="twoFactorEnabled && regenStep === 'idle' && !showDisable2faForm" class="tfa-subsection mt-6">
          <div class="row" style="align-items: center;">
            <div class="grow">
              <div style="font-weight: 500;">
                {{ t('settings.tfa_recovery_codes_title') }}
              </div>
              <div class="dim text-sm" style="margin-top: 2px;">
                <template v-if="remainingCodes !== null">
                  {{ t('settings.tfa_recovery_codes_remaining', { count: remainingCodes }) }}
                </template>
                <template v-else>
                  {{ t('settings.tfa_recovery_codes_sub') }}
                </template>
              </div>
            </div>
            <button class="btn btn-ghost" @click="openRegen">
              {{ t('settings.tfa_regenerate_btn') }}
            </button>
          </div>
        </div>

        <!-- Regenerate: step "verify" - ask for current code. -->
        <div v-if="twoFactorEnabled && regenStep === 'verify'" class="tfa-subsection mt-6">
          <div style="font-weight: 500;">{{ t('settings.tfa_regenerate_title') }}</div>
          <p class="dim text-sm mt-2">{{ t('settings.tfa_regenerate_hint') }}</p>

          <label class="field-label mt-4">{{ t('settings.tfa_regenerate_code_label') }}</label>
          <input v-model="regenCode" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="32"
            placeholder="123456" style="margin-top: 6px; font-family: ui-monospace, monospace; letter-spacing: 0.06em;"
            @keydown.enter="regenCode.length >= 6 && !regenSubmitting && confirmRegen()" />
          <p v-if="regenError" class="error-text mt-2">{{ regenError }}</p>
          <div class="row mt-4" style="gap: 8px;">
            <button class="btn btn-primary" :disabled="regenSubmitting || regenCode.trim().length < 6"
              @click="confirmRegen">
              {{ regenSubmitting ? t('common.saving') : t('settings.tfa_regenerate_confirm') }}
            </button>
            <button class="btn btn-ghost" :disabled="regenSubmitting" @click="cancelRegen">
              {{ t('common.cancel') }}
            </button>
          </div>
        </div>

        <!-- Regenerate: step "show" - display new codes ONCE with save confirmation. -->
        <div v-if="twoFactorEnabled && regenStep === 'show'" class="tfa-subsection mt-6">
          <div style="font-weight: 500;">{{ t('settings.tfa_regenerate_show_title') }}</div>
          <p class="error-text mt-2">{{ t('tfa_setup.recovery_warning') }}</p>

          <ul class="tfa-recovery-list mt-4">
            <li v-for="(rc, i) in regenNewCodes" :key="i">
              <code>{{ rc }}</code>
            </li>
          </ul>

          <button class="btn btn-ghost btn-block mt-4" @click="copyRegenCodes">
            {{ t('tfa_setup.copy_codes') }}
          </button>

          <label class="row mt-4" style="gap: 8px; cursor: pointer;">
            <input v-model="regenSavedConfirmed" type="checkbox" />
            <span>{{ t('tfa_setup.saved_confirm') }}</span>
          </label>

          <button class="btn btn-primary btn-block mt-4" :disabled="!regenSavedConfirmed" @click="finishRegen">
            {{ t('tfa_setup.finish') }}
          </button>
        </div>

        <!-- Audit log - collapsible. Default closed to keep the section
             compact; expand-on-click hits the audit endpoint once. -->
        <div v-if="twoFactorEnabled && regenStep === 'idle' && !showDisable2faForm" class="tfa-subsection mt-6">
          <button class="link-subtle" type="button" @click="toggleAudit">
            <template v-if="!auditOpen">
              {{ t('settings.tfa_audit_show') }}
            </template>
            <template v-else>
              {{ t('settings.tfa_audit_hide') }}
            </template>
          </button>
          <div v-if="auditOpen" class="tfa-audit-list mt-4">
            <p v-if="auditLoading" class="dim text-sm">{{ t('common.loading') }}</p>
            <p v-else-if="auditEntries.length === 0" class="dim text-sm">
              {{ t('settings.tfa_audit_empty') }}
            </p>
            <ul v-else class="tfa-audit-entries">
              <li v-for="entry in auditEntries" :key="entry.id" class="tfa-audit-entry">
                <div class="tfa-audit-event">{{ localiseAuditEvent(entry.event) }}</div>
                <div class="dim text-xs">
                  {{ new Date(entry.created_at).toLocaleString() }}
                  <template v-if="entry.ip"> · {{ entry.ip }}</template>
                  <template v-if="formatAuditMeta(entry.meta)">
                    · {{ formatAuditMeta(entry.meta) }}
                  </template>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

    </div>
  </main>
</template>

<style>
.card {
  margin-top: 1em;
}

/* Clickable card that links to the Subscription page. Same card chrome, laid
   out as a row with a CTA on the right. Hover lifts the border/bg only - no
   transform per project convention. */
.settings-link-card {
  display: flex;
  align-items: center;
  gap: 16px;
  text-decoration: none;
  color: inherit;
  transition: border-color 120ms ease, background 120ms ease;
}

.settings-link-card:hover {
  border-color: var(--accent);
  background: var(--bg-elev);
}

.settings-link-cta {
  flex: 0 0 auto;
  font-size: 14px;
  font-weight: 500;
  color: var(--accent);
}
</style>
