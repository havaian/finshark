<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../../stores/auth.store';
import {
  emailTemplatesApi,
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
      <section class="card" style="flex: 0 0 280px; min-width: 240px;">
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
      <section class="card grow" style="flex: 1 1 520px;">
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
        </div>
      </section>
    </div>
  </div>
</template>
