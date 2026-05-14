<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { adminApi } from '../../api/admin.api';
import en from '../../i18n/en';
import ru from '../../i18n/ru';
import { flattenMessages } from '../../i18n/flatten';

type Lang = 'en' | 'ru';

const { t } = useI18n();

// Flatten the bundled static locales once. These are the "default" values
// shown in the table rows when no override exists, plus the master list of
// every key the app references.
const STATIC_EN = flattenMessages(en);
const STATIC_RU = flattenMessages(ru);
const ALL_KEYS = Array.from(
  new Set([...Object.keys(STATIC_EN), ...Object.keys(STATIC_RU)]),
).sort();

// Overrides loaded from the backend: {key: {en?: string, ru?: string}}.
// We use a plain object (reactive via ref wrapping) so updates per-key per-lang
// don't trigger a re-render of the whole table.
const overrides = ref<Record<string, Partial<Record<Lang, string>>>>({});

// Per-row edit state. Keyed by `${key}::${lang}` so EN and RU edits are independent.
const editing = ref<Record<string, string>>({});
const busy = ref<Set<string>>(new Set());
const errorMsg = ref<string | null>(null);
const loading = ref(false);
const filterText = ref('');

// Filtered list of keys based on search box. Searches across the key itself
// AND the default value text so admins can find "Sign out" without knowing it's
// at common.sign_out.
const filteredKeys = computed(() => {
  const q = filterText.value.trim().toLowerCase();
  if (!q) return ALL_KEYS;
  return ALL_KEYS.filter((k) => {
    if (k.toLowerCase().includes(q)) return true;
    if ((STATIC_EN[k] ?? '').toLowerCase().includes(q)) return true;
    if ((STATIC_RU[k] ?? '').toLowerCase().includes(q)) return true;
    const ov = overrides.value[k];
    if (ov?.en?.toLowerCase().includes(q)) return true;
    if (ov?.ru?.toLowerCase().includes(q)) return true;
    return false;
  });
});

async function load() {
  loading.value = true;
  errorMsg.value = null;
  try {
    const rows = await adminApi.listUiTranslations();
    const next: Record<string, Partial<Record<Lang, string>>> = {};
    for (const row of rows) {
      if (!next[row.key]) next[row.key] = {};
      next[row.key][row.lang] = row.value;
    }
    overrides.value = next;
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to load overrides';
  } finally {
    loading.value = false;
  }
}

function startEdit(key: string, lang: Lang) {
  const slot = `${key}::${lang}`;
  // Pre-fill with current override, or empty if none. Don't pre-fill with the
  // default — that would prompt the admin to "edit" a string that's actually
  // identical to the bundled one, just creating noise overrides.
  editing.value[slot] = overrides.value[key]?.[lang] ?? '';
}

function cancelEdit(key: string, lang: Lang) {
  const slot = `${key}::${lang}`;
  delete editing.value[slot];
}

async function saveEdit(key: string, lang: Lang) {
  const slot = `${key}::${lang}`;
  const value = (editing.value[slot] ?? '').trim();

  // Empty save → delete the override (revert to bundled default).
  if (value.length === 0) {
    await onDelete(key, lang);
    return;
  }

  if (busy.value.has(slot)) return;
  busy.value.add(slot);
  errorMsg.value = null;
  try {
    const saved = await adminApi.upsertUiTranslation({ key, lang, value });
    if (!overrides.value[key]) overrides.value[key] = {};
    overrides.value[key][lang] = saved.value;
    delete editing.value[slot];
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to save override';
  } finally {
    busy.value.delete(slot);
  }
}

async function onDelete(key: string, lang: Lang) {
  const slot = `${key}::${lang}`;
  if (busy.value.has(slot)) return;
  busy.value.add(slot);
  errorMsg.value = null;
  try {
    await adminApi.deleteUiTranslation(key, lang);
    if (overrides.value[key]) {
      delete overrides.value[key][lang];
      if (Object.keys(overrides.value[key]).length === 0) {
        delete overrides.value[key];
      }
    }
    delete editing.value[slot];
  } catch (e) {
    // 404 (override didn't exist on server) is fine — treat as success.
    if (e instanceof AxiosError && e.response?.status === 404) {
      delete editing.value[slot];
    } else {
      errorMsg.value = extractError(e) ?? 'failed to delete override';
    }
  } finally {
    busy.value.delete(slot);
  }
}

function isEditing(key: string, lang: Lang): boolean {
  return `${key}::${lang}` in editing.value;
}
function isBusy(key: string, lang: Lang): boolean {
  return busy.value.has(`${key}::${lang}`);
}

function defaultFor(key: string, lang: Lang): string {
  return (lang === 'en' ? STATIC_EN[key] : STATIC_RU[key]) ?? '';
}

function overrideFor(key: string, lang: Lang): string | undefined {
  return overrides.value[key]?.[lang];
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
  <div class="container-wide">

    <div class="topbar">
      <div>
        <h1>{{ t('admin.localization.title') }}</h1>
        <p class="dim text-sm mt-2">{{ t('admin.localization.sub') }}</p>
      </div>
      <input
        v-model="filterText"
        type="text"
        placeholder="key or text"
        style="max-width: 280px;"
      />
    </div>

    <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
    <p v-if="loading" class="dim text-sm">{{ t('common.loading') }}</p>

    <div v-if="!loading" class="ui-trans-list">
      <div v-for="key in filteredKeys" :key="key" class="ui-trans-row">
        <div class="ui-trans-key mono text-xs muted">{{ key }}</div>

        <!-- EN cell -->
        <div class="ui-trans-cell">
          <div class="ui-trans-default dim text-xs">
            {{ t('admin.localization.default') }}: {{ defaultFor(key, 'en') || '—' }}
          </div>
          <template v-if="!isEditing(key, 'en')">
            <div class="ui-trans-current">
              <span v-if="overrideFor(key, 'en')">{{ overrideFor(key, 'en') }}</span>
              <span v-else class="muted">—</span>
            </div>
            <div class="ui-trans-actions">
              <button class="btn-link accent" @click="startEdit(key, 'en')">
                {{ overrideFor(key, 'en') ? t('common.edit') : t('common.add') }}
              </button>
              <button
                v-if="overrideFor(key, 'en')"
                class="btn-link"
                style="color: var(--danger);"
                :disabled="isBusy(key, 'en')"
                @click="onDelete(key, 'en')"
              >
                {{ t('common.delete') }}
              </button>
            </div>
          </template>
          <template v-else>
            <textarea
              v-model="editing[`${key}::en`]"
              rows="2"
              maxlength="10000"
              :placeholder="t('admin.localization.add_value_ph')"
            />
            <div class="ui-trans-actions">
              <button
                class="btn btn-primary btn-sm"
                :disabled="isBusy(key, 'en')"
                @click="saveEdit(key, 'en')"
              >
                {{ isBusy(key, 'en') ? t('admin.localization.saving') : t('common.save') }}
              </button>
              <button class="btn btn-ghost btn-sm" @click="cancelEdit(key, 'en')">{{ t('common.cancel') }}</button>
            </div>
          </template>
        </div>

        <!-- RU cell -->
        <div class="ui-trans-cell">
          <div class="ui-trans-default dim text-xs">
            {{ t('admin.localization.default') }}: {{ defaultFor(key, 'ru') || '—' }}
          </div>
          <template v-if="!isEditing(key, 'ru')">
            <div class="ui-trans-current">
              <span v-if="overrideFor(key, 'ru')">{{ overrideFor(key, 'ru') }}</span>
              <span v-else class="muted">—</span>
            </div>
            <div class="ui-trans-actions">
              <button class="btn-link accent" @click="startEdit(key, 'ru')">
                {{ overrideFor(key, 'ru') ? t('common.edit') : t('common.add') }}
              </button>
              <button
                v-if="overrideFor(key, 'ru')"
                class="btn-link"
                style="color: var(--danger);"
                :disabled="isBusy(key, 'ru')"
                @click="onDelete(key, 'ru')"
              >
                {{ t('common.delete') }}
              </button>
            </div>
          </template>
          <template v-else>
            <textarea
              v-model="editing[`${key}::ru`]"
              rows="2"
              maxlength="10000"
              :placeholder="t('admin.localization.add_value_ph')"
            />
            <div class="ui-trans-actions">
              <button
                class="btn btn-primary btn-sm"
                :disabled="isBusy(key, 'ru')"
                @click="saveEdit(key, 'ru')"
              >
                {{ isBusy(key, 'ru') ? t('admin.localization.saving') : t('common.save') }}
              </button>
              <button class="btn btn-ghost btn-sm" @click="cancelEdit(key, 'ru')">{{ t('common.cancel') }}</button>
            </div>
          </template>
        </div>
      </div>

      <div v-if="filteredKeys.length === 0" class="dim text-sm" style="padding: 24px;">
        {{ filterText ? t('admin.users.empty_filtered') : t('admin.localization.empty') }}
      </div>
    </div>

  </div>
</template>
