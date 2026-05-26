<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../../stores/auth.store';
import {
  emailTemplatesApi,
  type BlastAudience,
  type BlastResult,
  type EmailTemplate,
  type SendTestResult,
} from '../../api/email-templates.api';

// Admin email templates page. Two-pane layout: list on the left, editor on
// the right. Same idiom as the unified content browser — picking a template
// loads it into the editor; saving upserts (the key is the PK, no rename).
//
// The editor exposes EN + RU bodies (RU optional with EN fallback), an
// optional HTML body (also optional with text fallback), a variable allow-
// list (for documentation; substitution is purely textual), is_active
// flag, and admin-only notes.

const { t } = useI18n();
const auth = useAuthStore();

const templates = ref<EmailTemplate[]>([]);
const selectedKey = ref<string | null>(null);
const loading = ref(true);
const errorMsg = ref<string | null>(null);

// Editor state. Mirrors UpsertEmailTemplateInput. Defaults to a blank
// "new template" form when no row is selected.
const form = ref({
  key: '',
  subject_en: '',
  subject_ru: '',
  body_en: '',
  body_ru: '',
  html_en: '',
  html_ru: '',
  // The form stores variables as a newline-separated string for ergonomics
  // (admins type one per line); we split on save.
  variablesText: '',
  is_active: true,
  notes: '',
});
const editorMode = ref<'new' | 'edit'>('new');
const saving = ref(false);
const savedFlash = ref(false);

// Test-send state. Bound to the current editor key (or whatever was last
// saved). Variables are entered as JSON for simplicity — wrong shape
// surfaces as a 400 from the backend's class-validator.
const testTo = ref('');
const testLang = ref<'en' | 'ru'>('en');
const testVariablesText = ref('{}');
const testSending = ref(false);
const testResult = ref<SendTestResult | null>(null);
const testError = ref<string | null>(null);

async function load() {
  loading.value = true;
  errorMsg.value = null;
  try {
    templates.value = await emailTemplatesApi.list();
    if (templates.value.length > 0 && selectedKey.value === null) {
      selectKey(templates.value[0].key);
    }
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to load email templates';
  } finally {
    loading.value = false;
  }
}

function selectKey(key: string) {
  const row = templates.value.find((t) => t.key === key);
  if (!row) return;
  selectedKey.value = key;
  editorMode.value = 'edit';
  form.value = {
    key: row.key,
    subject_en: row.subject_en,
    subject_ru: row.subject_ru ?? '',
    body_en: row.body_en,
    body_ru: row.body_ru ?? '',
    html_en: row.html_en ?? '',
    html_ru: row.html_ru ?? '',
    variablesText: row.variables.join('\n'),
    is_active: row.is_active,
    notes: row.notes ?? '',
  };
  // Reset the test panel state to defaults when switching rows.
  if (auth.user?.email) testTo.value = auth.user.email;
  testVariablesText.value = '{}';
  testResult.value = null;
  testError.value = null;
}

function startNew() {
  selectedKey.value = null;
  editorMode.value = 'new';
  form.value = {
    key: '',
    subject_en: '',
    subject_ru: '',
    body_en: '',
    body_ru: '',
    html_en: '',
    html_ru: '',
    variablesText: '',
    is_active: true,
    notes: '',
  };
  testResult.value = null;
}

async function onSave() {
  if (saving.value) return;
  if (!form.value.key.trim() || !form.value.subject_en.trim() || !form.value.body_en.trim()) {
    errorMsg.value = 'key, subject_en, and body_en are required';
    return;
  }
  saving.value = true;
  errorMsg.value = null;
  try {
    const variables = form.value.variablesText
      .split('\n')
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
    const saved = await emailTemplatesApi.upsert({
      key: form.value.key.trim(),
      subject_en: form.value.subject_en,
      subject_ru: form.value.subject_ru.trim() || null,
      body_en: form.value.body_en,
      body_ru: form.value.body_ru.trim() || null,
      html_en: form.value.html_en.trim() || null,
      html_ru: form.value.html_ru.trim() || null,
      variables,
      is_active: form.value.is_active,
      notes: form.value.notes.trim() || null,
    });
    // Update the cached list. Upsert can create a new row OR replace an
    // existing one; reconcile by key.
    const idx = templates.value.findIndex((t) => t.key === saved.key);
    if (idx >= 0) templates.value[idx] = saved;
    else templates.value.unshift(saved);
    selectedKey.value = saved.key;
    editorMode.value = 'edit';
    savedFlash.value = true;
    setTimeout(() => { savedFlash.value = false; }, 1500);
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to save template';
  } finally {
    saving.value = false;
  }
}

async function onToggleActive() {
  if (selectedKey.value === null) return;
  try {
    const updated = await emailTemplatesApi.setActive(
      selectedKey.value,
      !form.value.is_active,
    );
    form.value.is_active = updated.is_active;
    const idx = templates.value.findIndex((t) => t.key === updated.key);
    if (idx >= 0) templates.value[idx] = updated;
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to toggle active';
  }
}

async function onDelete() {
  if (selectedKey.value === null) return;
  if (!confirm(t('admin.email_templates.delete_confirm', { key: selectedKey.value }))) return;
  try {
    await emailTemplatesApi.remove(selectedKey.value);
    templates.value = templates.value.filter((t) => t.key !== selectedKey.value);
    if (templates.value.length > 0) selectKey(templates.value[0].key);
    else startNew();
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to delete template';
  }
}

async function onSendTest() {
  if (selectedKey.value === null) return;
  if (!testTo.value.trim()) return;
  testSending.value = true;
  testError.value = null;
  testResult.value = null;
  try {
    let variables: Record<string, string | number> = {};
    try {
      variables = JSON.parse(testVariablesText.value || '{}');
    } catch {
      testError.value = t('admin.email_templates.test_invalid_json');
      testSending.value = false;
      return;
    }
    testResult.value = await emailTemplatesApi.sendTest(selectedKey.value, {
      to: testTo.value.trim(),
      lang: testLang.value,
      variables,
    });
  } catch (e) {
    testError.value = extractError(e) ?? 'failed to send test';
  } finally {
    testSending.value = false;
  }
}

function extractError(e: unknown): string | null {
  if (e instanceof AxiosError) {
    const msg = (e.response?.data as { message?: string | string[] })?.message;
    return Array.isArray(msg) ? msg.join(', ') : msg ?? null;
  }
  return null;
}

// ── Mass-send (blast) ──────────────────────────────────────────────────
// Drives the "Send to audience" panel below the test-send section. Backend
// throttles per-message; the request stays open until the whole audience
// is processed (or fails) and returns a summary the UI shows inline.
const blastAudience = ref<BlastAudience>('reminders_enabled');
const blastLang = ref<'en' | 'ru'>('en');
const blastIgnoreOptOut = ref(false);
const blastUserIdsText = ref('');
const blastSending = ref(false);
const blastResult = ref<BlastResult | null>(null);
const blastError = ref<string | null>(null);

async function onSendBlast() {
  if (selectedKey.value === null || blastSending.value) return;
  blastError.value = null;
  blastResult.value = null;
  // Quick double-check confirmation — "send to all users" is a heavy action
  // even for a small user base. Doesn't hit the backend until OK.
  const confirmMsg = t('admin.email_templates.blast_confirm', {
    audience: blastAudience.value,
  });
  if (!confirm(confirmMsg)) return;
  blastSending.value = true;
  try {
    let user_ids: string[] | undefined;
    if (blastAudience.value === 'ids') {
      user_ids = blastUserIdsText.value
        .split(/[\s,]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      if (user_ids.length === 0) {
        blastError.value = t('admin.email_templates.blast_no_ids');
        blastSending.value = false;
        return;
      }
    }
    blastResult.value = await emailTemplatesApi.blast(selectedKey.value, {
      audience: blastAudience.value,
      user_ids,
      lang: blastLang.value,
      ignore_opt_out: blastIgnoreOptOut.value,
    });
  } catch (e) {
    blastError.value = extractError(e) ?? 'blast failed';
  } finally {
    blastSending.value = false;
  }
}

// ── Live preview ───────────────────────────────────────────────────────
// Renders subject + text + HTML using the same {{var}} substitution the
// backend's EmailTemplatesService does (purely textual, no Handlebars). We
// do it client-side so the admin can iterate without round-tripping through
// the Send-test endpoint.
//
// Sample-data modes:
//   - "placeholder": seed `{name}` for each declared variable so the admin
//     can immediately see which spots in the body are dynamic.
//   - "realistic": seed a plausible value per known variable name (the
//     `REALISTIC_SAMPLE_DATA` map), and `{name}` for anything we don't have
//     a sample for. Lets the admin see what the email actually looks like
//     to a real user.
const previewLang = ref<'en' | 'ru'>('en');
type SampleMode = 'placeholder' | 'realistic';
const sampleMode = ref<SampleMode>('placeholder');
const previewVariablesText = ref('{}');
const previewVariablesError = ref<string | null>(null);

// Best-known realistic samples for commonly-used variable names. Keys here
// match the variables admins type into the `variables` list; if a template
// declares a name not in this map the seeder falls back to `{name}` so the
// admin can still see where it'd land.
const REALISTIC_SAMPLE_DATA: Record<string, string | number> = {
  display_name: 'Alex',
  email: 'alex@example.com',
  streak: 7,
  level: 4,
  xp: 1820,
  app_url: 'https://app.finshark.io',
  unsubscribe_url: 'https://app.finshark.io/unsubscribe?token=demo',
  period_clause: 'until 5 May 2026',
  plan_name: 'Premium · Monthly',
  ends_at: '2026-05-05',
  promocode: 'WELCOME10',
  reminder_hour_local: 18,
  timezone: 'Asia/Tashkent',
  reset_link: 'https://app.finshark.io/reset?token=demo',
  paper_code: 'F2',
  paper_name: 'Management Accounting',
};

function sampleValueFor(name: string, mode: SampleMode): string | number {
  if (mode === 'realistic' && Object.prototype.hasOwnProperty.call(REALISTIC_SAMPLE_DATA, name)) {
    return REALISTIC_SAMPLE_DATA[name];
  }
  return `{${name}}`;
}

// Rebuild the preview JSON from the current declared-variables list using
// the active sample mode. Called when the admin clicks "Reset sample data"
// or when the sample-mode toggle changes; also from the existing watcher
// when the declared list itself changes.
function regenerateSampleVariables() {
  const declared = form.value.variablesText
    .split('\n')
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
  if (declared.length === 0) {
    previewVariablesText.value = '{}';
    return;
  }
  const seeded: Record<string, string | number> = {};
  for (const key of declared) seeded[key] = sampleValueFor(key, sampleMode.value);
  previewVariablesText.value = JSON.stringify(seeded, null, 2);
}

const previewVariables = computed<Record<string, string | number>>(() => {
  const raw = previewVariablesText.value.trim();
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      previewVariablesError.value = null;
      return parsed as Record<string, string | number>;
    }
    previewVariablesError.value = t('admin.email_templates.test_invalid_json');
    return {};
  } catch {
    previewVariablesError.value = t('admin.email_templates.test_invalid_json');
    return {};
  }
});

function substitute(template: string, vars: Record<string, string | number>): string {
  // Mirror the backend's behaviour: replace every {{name}} (optionally
  // surrounded by whitespace) with the matching variable; leave unknowns
  // intact so the admin can see which ones aren't being supplied.
  return template.replace(/\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g, (full, name) => {
    return Object.prototype.hasOwnProperty.call(vars, name)
      ? String(vars[name])
      : full;
  });
}

// Resolve EN/RU like the backend does: prefer the selected lang, fall back
// to EN when the RU slot is empty (matches sendByTemplate's fallback logic).
const previewResolved = computed(() => {
  const f = form.value;
  const wantRu = previewLang.value === 'ru';
  const subject =
    wantRu && f.subject_ru.trim() ? f.subject_ru : f.subject_en;
  const body = wantRu && f.body_ru.trim() ? f.body_ru : f.body_en;
  const html = wantRu && f.html_ru.trim() ? f.html_ru : f.html_en;
  const usedRu = wantRu && (f.subject_ru.trim() || f.body_ru.trim() || f.html_ru.trim());
  return {
    subject: substitute(subject, previewVariables.value),
    body: substitute(body, previewVariables.value),
    html: html ? substitute(html, previewVariables.value) : '',
    resolved_lang: usedRu ? 'ru' : 'en',
  };
});

// Seed the preview variables box with a default object whenever the
// template's declared variable list changes — saves admins from typing the
// keys by hand. We only auto-seed when the box is still "default-ish" (empty
// or contains only declared keys), so a mid-edit JSON isn't clobbered. The
// initial seed and sampleMode-driven reseed go through the same helper.
watch(
  () => form.value.variablesText,
  (next) => {
    const declared = next
      .split('\n')
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
    if (declared.length === 0) return;
    let current: Record<string, unknown> = {};
    try {
      const parsed = JSON.parse(previewVariablesText.value || '{}');
      if (parsed && typeof parsed === 'object') current = parsed as Record<string, unknown>;
    } catch {
      return;
    }
    const currentKeys = Object.keys(current);
    const onlyDeclared = currentKeys.every((k) => declared.includes(k));
    if (currentKeys.length > 0 && !onlyDeclared) return;
    regenerateSampleVariables();
  },
  { immediate: true },
);

// Toggling the placeholder/realistic mode re-seeds the box. We don't try to
// preserve manual edits — if the admin is in placeholder mode and customised
// a value, switching to realistic overwrites it. That's the documented
// trade-off for a single "this is the sample data" box.
watch(sampleMode, () => regenerateSampleVariables());

// Ordered list of variables this template declares. Used by the
// "Available variables" panel so admins can scan what's available without
// re-reading the textarea.
const declaredVariableList = computed<string[]>(() => {
  return form.value.variablesText
    .split('\n')
    .map((v) => v.trim())
    .filter((v) => v.length > 0);
});

// Truncate / stringify a sample value for the reference panel. Strings
// longer than 48 chars are ellipsised so a URL doesn't blow out the row.
function formatSampleValue(v: string | number | undefined): string {
  if (v === undefined) return '—';
  const s = String(v);
  return s.length > 48 ? s.slice(0, 47) + '…' : s;
}

const placeholderHelp = computed(() => {
  // Detect placeholders that are referenced in the body but missing from
  // the declared variables list. Purely informational — admin can ignore it.
  const declared = new Set(
    form.value.variablesText
      .split('\n')
      .map((v) => v.trim())
      .filter((v) => v.length > 0),
  );
  const re = /\{\{\s*([a-zA-Z_][a-zA-Z0-9_]*)\s*\}\}/g;
  const allBodies = [
    form.value.subject_en, form.value.subject_ru,
    form.value.body_en, form.value.body_ru,
    form.value.html_en, form.value.html_ru,
  ].join('\n');
  const found = new Set<string>();
  let m: RegExpExecArray | null;
  while ((m = re.exec(allBodies)) !== null) found.add(m[1]);
  const missing = [...found].filter((v) => !declared.has(v));
  const unused = [...declared].filter((v) => !found.has(v));
  return { missing, unused };
});

watch(selectedKey, () => {
  if (auth.user?.email && !testTo.value) testTo.value = auth.user.email;
});

onMounted(load);
</script>

<template>
  <div class="container-wide">
    <header class="topbar">
      <h1>{{ t('admin.email_templates.title') }}</h1>
      <button class="btn btn-primary" @click="startNew">+ {{ t('admin.email_templates.new_btn') }}</button>
    </header>
    <p class="dim text-sm">{{ t('admin.email_templates.sub') }}</p>
    <p v-if="errorMsg" class="error-text mt-4">{{ errorMsg }}</p>

    <div class="row mt-6" style="gap: 24px; align-items: stretch; flex-wrap: wrap;">
      <!-- LEFT: template list -->
      <section class="card" style="flex: 0 0 280px; min-width: 240px; height: fit-content;">
        <p v-if="loading" class="dim text-sm">{{ t('common.loading') }}</p>
        <div v-else class="list-bordered" style="max-height: 560px; overflow: auto;">
          <button v-for="tpl in templates" :key="tpl.key" type="button"
            :class="['list-row', { active: selectedKey === tpl.key }]"
            style="display: block; width: 100%; text-align: left;"
            @click="selectKey(tpl.key)">
            <div class="mono" style="font-weight: 500;">{{ tpl.key }}</div>
            <div class="dim text-xs" style="margin-top: 2px;">
              {{ tpl.subject_en.slice(0, 56) }}<span v-if="tpl.subject_en.length > 56">…</span>
            </div>
            <div v-if="!tpl.is_active" class="dim text-xs" style="margin-top: 2px;">
              {{ t('admin.email_templates.inactive_label') }}
            </div>
          </button>
        </div>
      </section>

      <!-- RIGHT: editor + test panel -->
      <section class="card grow" style="flex: 1 1 520px; padding-top: 0px !important;">
        <div class="row" style="justify-content: space-between; gap: 12px;">
          <h3>
            <template v-if="editorMode === 'new'">{{ t('admin.email_templates.new_title') }}</template>
            <template v-else>{{ t('admin.email_templates.edit_title') }}</template>
          </h3>
          <div class="row" style="gap: 8px;">
            <button v-if="editorMode === 'edit'" class="btn btn-ghost btn-sm" @click="onToggleActive">
              {{ form.is_active ? t('admin.email_templates.disable_btn') : t('admin.email_templates.enable_btn') }}
            </button>
            <button v-if="editorMode === 'edit'" class="btn btn-ghost btn-sm" style="color: var(--danger);"
              @click="onDelete">
              {{ t('common.delete') }}
            </button>
          </div>
        </div>

        <div class="field mt-4">
          <label class="field-label">{{ t('admin.email_templates.key_label') }}</label>
          <input v-model="form.key" type="text" maxlength="64" :disabled="editorMode === 'edit'"
            style="font-family: ui-monospace, monospace;" />
          <p class="dim text-xs mt-1">{{ t('admin.email_templates.key_help') }}</p>
        </div>

        <div class="form-grid-2 mt-4">
          <div class="field">
            <label class="field-label">{{ t('admin.email_templates.subject_en_label') }}</label>
            <input v-model="form.subject_en" type="text" maxlength="200" />
          </div>
          <div class="field">
            <label class="field-label">{{ t('admin.email_templates.subject_ru_label') }}</label>
            <input v-model="form.subject_ru" type="text" maxlength="200" />
          </div>
        </div>

        <div class="form-grid-2 mt-4">
          <div class="field">
            <label class="field-label">{{ t('admin.email_templates.body_en_label') }}</label>
            <textarea v-model="form.body_en" rows="10" maxlength="20000"
              style="font-family: ui-monospace, monospace;"></textarea>
          </div>
          <div class="field">
            <label class="field-label">{{ t('admin.email_templates.body_ru_label') }}</label>
            <textarea v-model="form.body_ru" rows="10" maxlength="20000"
              style="font-family: ui-monospace, monospace;"></textarea>
          </div>
        </div>

        <div class="form-grid-2 mt-4">
          <div class="field">
            <label class="field-label">{{ t('admin.email_templates.html_en_label') }}</label>
            <textarea v-model="form.html_en" rows="6" maxlength="50000"
              style="font-family: ui-monospace, monospace;"></textarea>
          </div>
          <div class="field">
            <label class="field-label">{{ t('admin.email_templates.html_ru_label') }}</label>
            <textarea v-model="form.html_ru" rows="6" maxlength="50000"
              style="font-family: ui-monospace, monospace;"></textarea>
          </div>
        </div>

        <div class="field mt-4">
          <label class="field-label">{{ t('admin.email_templates.variables_label') }}</label>
          <textarea v-model="form.variablesText" rows="4"
            :placeholder="t('admin.email_templates.variables_placeholder')"
            style="font-family: ui-monospace, monospace;"></textarea>
          <!-- Live validation feedback. Missing = referenced in body but not
               declared; unused = declared but never referenced. -->
          <p v-if="placeholderHelp.missing.length > 0" class="dim text-xs mt-1">
            {{ t('admin.email_templates.variables_missing', { vars: placeholderHelp.missing.join(', ') }) }}
          </p>
          <p v-if="placeholderHelp.unused.length > 0" class="dim text-xs mt-1">
            {{ t('admin.email_templates.variables_unused', { vars: placeholderHelp.unused.join(', ') }) }}
          </p>
        </div>

        <div class="field mt-4">
          <label class="field-label">{{ t('admin.email_templates.notes_label') }}</label>
          <textarea v-model="form.notes" rows="2" maxlength="2000"></textarea>
        </div>

        <div class="row mt-4" style="justify-content: flex-end; gap: 8px; align-items: center;">
          <span v-if="savedFlash" class="dim text-xs">{{ t('admin.localization.saved') }} ✓</span>
          <button class="btn btn-primary" :disabled="saving" @click="onSave">
            {{ saving ? t('common.saving') : t('common.save_changes') }}
          </button>
        </div>

        <!-- Live preview. Renders subject + text + HTML using client-side
             {{var}} substitution (same shape as the backend). No save / no
             send — just so the admin can see what the email will look like
             as they edit. The variables JSON box auto-seeds from the
             declared variable list. -->
        <div class="mt-6">
          <h3>{{ t('admin.email_templates.preview_title') }}</h3>

          <!-- Toolbar: language + sample-data mode toggle + reset. Sample-
               data mode switches between "show {placeholder}" and "show
               realistic values for known variable names". The reset button
               re-seeds from the declared list so admins can recover after
               editing the JSON by hand. -->
          <div class="row mt-4" style="gap: 16px; align-items: flex-end; flex-wrap: wrap;">
            <div class="field" style="min-width: 160px;">
              <label class="field-label">{{ t('admin.email_templates.preview_lang_label') }}</label>
              <select v-model="previewLang">
                <option value="en">English</option>
                <option value="ru">Русский</option>
              </select>
            </div>
            <div class="field" style="min-width: 220px;">
              <label class="field-label">{{ t('admin.email_templates.preview_sample_mode_label') }}</label>
              <div class="segmented">
                <button type="button" :class="{ active: sampleMode === 'placeholder' }"
                  @click="sampleMode = 'placeholder'">
                  {{ t('admin.email_templates.preview_sample_mode_placeholder') }}
                </button>
                <button type="button" :class="{ active: sampleMode === 'realistic' }"
                  @click="sampleMode = 'realistic'">
                  {{ t('admin.email_templates.preview_sample_mode_realistic') }}
                </button>
              </div>
            </div>
            <button class="btn btn-ghost btn-sm" type="button" @click="regenerateSampleVariables">
              {{ t('admin.email_templates.preview_reset_btn') }}
            </button>
          </div>

          <div class="form-grid-2 mt-4">
            <!-- Available variables panel: a stable reference for the admin
                 listing every variable the template declares. We pull
                 sample values from previewVariables so admins can scan the
                 list to see what each will look like in the rendered body.
                 An "in body" / "missing" annotation flags placeholders that
                 are referenced but not declared (and vice versa). -->
            <div class="field">
              <label class="field-label">{{ t('admin.email_templates.preview_available_vars_label') }}</label>
              <div class="card" style="padding: 12px 14px; background: var(--bg-elev);">
                <p v-if="declaredVariableList.length === 0" class="dim text-xs">
                  {{ t('admin.email_templates.preview_no_variables') }}
                </p>
                <ul v-else class="email-vars-list">
                  <li v-for="name in declaredVariableList" :key="name" class="email-vars-row">
                    <!-- Split the braces so Vue's template tokenizer doesn't
                         see literal `}}` inside the expression and close the
                         interpolation early. The rendered output is still
                         the literal `{{name}}`. -->
                    <code class="mono">{{ '{' + '{' + name + '}' + '}' }}</code>
                    <span class="dim text-xs">→</span>
                    <span class="text-xs">{{ formatSampleValue(previewVariables[name]) }}</span>
                  </li>
                </ul>
                <p v-if="placeholderHelp.missing.length > 0" class="dim text-xs mt-2" style="color: var(--danger);">
                  {{ t('admin.email_templates.variables_missing', { vars: placeholderHelp.missing.join(', ') }) }}
                </p>
              </div>
            </div>

            <div class="field">
              <label class="field-label">{{ t('admin.email_templates.preview_vars_label') }}</label>
              <textarea v-model="previewVariablesText" rows="6"
                style="font-family: ui-monospace, monospace;"></textarea>
              <p v-if="previewVariablesError" class="dim text-xs mt-1" style="color: var(--danger);">
                {{ previewVariablesError }}
              </p>
            </div>
          </div>

          <div class="card mt-4" style="background: var(--bg-elev);">
            <div class="dim text-xs">
              {{ t('admin.email_templates.test_resolved_lang', { lang: previewResolved.resolved_lang }) }}
            </div>
            <div class="mt-2" style="font-weight: 500;">{{ previewResolved.subject }}</div>
            <pre class="mt-2"
              style="white-space: pre-wrap; font-family: ui-monospace, monospace; font-size: 12px;">{{ previewResolved.body }}</pre>
            <div v-if="previewResolved.html" class="mt-4">
              <div class="dim text-xs">{{ t('admin.email_templates.preview_html_label') }}</div>
              <iframe :srcdoc="previewResolved.html" sandbox=""
                style="width: 100%; min-height: 320px; margin-top: 8px; border: 1px solid var(--border); background: white; border-radius: 6px;"></iframe>
            </div>
          </div>
        </div>

        <!-- Test-send subsection. Only meaningful once the template is saved
             (the backend looks up by key in the DB), so we gate on edit
             mode. New templates have to be saved first. -->
        <div v-if="editorMode === 'edit'" class="mt-6">
          <h3>{{ t('admin.email_templates.test_title') }}</h3>
          <div class="form-grid-2 mt-4">
            <div class="field">
              <label class="field-label">{{ t('admin.email_templates.test_to_label') }}</label>
              <input v-model="testTo" type="email" maxlength="254" />
            </div>
            <div class="field">
              <label class="field-label">{{ t('admin.email_templates.test_lang_label') }}</label>
              <select v-model="testLang">
                <option value="en">English</option>
                <option value="ru">Русский</option>
              </select>
            </div>
          </div>
          <div class="field mt-4">
            <label class="field-label">{{ t('admin.email_templates.test_vars_label') }}</label>
            <textarea v-model="testVariablesText" rows="4"
              :placeholder="t('admin.email_templates.test_vars_placeholder')"
              style="font-family: ui-monospace, monospace;"></textarea>
            <p class="dim text-xs mt-1">{{ t('admin.email_templates.test_vars_help') }}</p>
          </div>
          <p v-if="testError" class="error-text mt-2">{{ testError }}</p>
          <div class="row mt-4" style="justify-content: flex-end;">
            <button class="btn btn-ghost" :disabled="testSending || !testTo.trim()" @click="onSendTest">
              {{ testSending ? t('common.saving') : t('admin.email_templates.send_test_btn') }}
            </button>
          </div>
          <!-- Rendered preview. Shows exactly what was sent including any
               unresolved {{vars}} (they survive the substitution intact). -->
          <div v-if="testResult" class="mt-4">
            <div class="dim text-xs">{{ t('admin.email_templates.test_resolved_lang', { lang: testResult.resolved_lang }) }}</div>
            <div class="card mt-2" style="background: var(--bg-elev);">
              <div style="font-weight: 500;">{{ testResult.rendered_subject }}</div>
              <pre class="mt-2"
                style="white-space: pre-wrap; font-family: ui-monospace, monospace; font-size: 12px;">{{ testResult.rendered_body }}</pre>
            </div>
          </div>

          <!-- Mass-send (blast). Distinct from the per-recipient test send
               above: picks an audience filter and dispatches the template to
               every matching user with personalised per-user variables. -->
          <div class="mt-6">
            <h3>{{ t('admin.email_templates.blast_title') }}</h3>
            <p class="dim text-sm mt-2">{{ t('admin.email_templates.blast_subtitle') }}</p>

            <div class="form-grid-2 mt-4">
              <div class="field">
                <label class="field-label">{{ t('admin.email_templates.blast_audience_label') }}</label>
                <select v-model="blastAudience">
                  <option value="reminders_enabled">{{ t('admin.email_templates.blast_audience_reminders') }}</option>
                  <option value="premium">{{ t('admin.email_templates.blast_audience_premium') }}</option>
                  <option value="free">{{ t('admin.email_templates.blast_audience_free') }}</option>
                  <option value="all">{{ t('admin.email_templates.blast_audience_all') }}</option>
                  <option value="ids">{{ t('admin.email_templates.blast_audience_ids') }}</option>
                </select>
              </div>
              <div class="field">
                <label class="field-label">{{ t('admin.email_templates.test_lang_label') }}</label>
                <select v-model="blastLang">
                  <option value="en">English</option>
                  <option value="ru">Русский</option>
                </select>
              </div>
            </div>

            <div v-if="blastAudience === 'ids'" class="field mt-4">
              <label class="field-label">{{ t('admin.email_templates.blast_ids_label') }}</label>
              <textarea v-model="blastUserIdsText" rows="4"
                :placeholder="t('admin.email_templates.blast_ids_placeholder')"
                style="font-family: ui-monospace, monospace;"></textarea>
              <p class="dim text-xs mt-1">{{ t('admin.email_templates.blast_ids_help') }}</p>
            </div>

            <label class="row mt-4" style="gap: 8px; cursor: pointer;">
              <input v-model="blastIgnoreOptOut" type="checkbox" />
              <span class="text-sm">{{ t('admin.email_templates.blast_ignore_optout') }}</span>
            </label>
            <p class="dim text-xs mt-1">{{ t('admin.email_templates.blast_ignore_optout_warn') }}</p>

            <p v-if="blastError" class="error-text mt-2">{{ blastError }}</p>

            <div class="row mt-4" style="justify-content: flex-end;">
              <button class="btn btn-primary" :disabled="blastSending" @click="onSendBlast">
                {{ blastSending ? t('admin.email_templates.blast_sending') : t('admin.email_templates.blast_send_btn') }}
              </button>
            </div>

            <div v-if="blastResult" class="card mt-4" style="background: var(--bg-elev);">
              <div class="row" style="gap: 16px; flex-wrap: wrap;">
                <div>
                  <div class="dim text-xs">{{ t('admin.email_templates.blast_result_targeted') }}</div>
                  <div style="font-weight: 600;">{{ blastResult.recipients_targeted }}</div>
                </div>
                <div>
                  <div class="dim text-xs">{{ t('admin.email_templates.blast_result_sent') }}</div>
                  <div style="font-weight: 600; color: var(--success);">{{ blastResult.sent }}</div>
                </div>
                <div>
                  <div class="dim text-xs">{{ t('admin.email_templates.blast_result_skipped') }}</div>
                  <div style="font-weight: 600;">{{ blastResult.skipped_opt_out }}</div>
                </div>
                <div>
                  <div class="dim text-xs">{{ t('admin.email_templates.blast_result_failed') }}</div>
                  <div style="font-weight: 600; color: var(--danger);">{{ blastResult.failed }}</div>
                </div>
              </div>
              <div v-if="blastResult.sample_recipients.length > 0" class="mt-4">
                <div class="dim text-xs">{{ t('admin.email_templates.blast_result_sample') }}</div>
                <ul class="mt-2" style="font-family: ui-monospace, monospace; font-size: 12px; padding-left: 18px;">
                  <li v-for="email in blastResult.sample_recipients" :key="email">{{ email }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<style>
@media (max-width: 1200px) {
  .card {
    min-width: 100% !important;
  }
}

/* Variables reference panel: tight rows of "{{name}} → sample" so the
   admin can scan all available variables at a glance. */
.email-vars-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.email-vars-row {
  display: flex;
  gap: 8px;
  align-items: baseline;
  flex-wrap: wrap;
}
</style>