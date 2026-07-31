<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { adminApi } from '../../api/admin.api';
import en from '../../i18n/en';
import ru from '../../i18n/ru';
import uz from '../../i18n/uz';
import { flattenMessages } from '../../i18n/flatten';
import { SUPPORTED_LANGS, type Lang } from '../../i18n';

// One editable column per supported language. Driven off SUPPORTED_LANGS so a
// new language needs no change here - previously EN and RU were two hand-copied
// template blocks, which is why UZ was missing from this screen entirely.
const EDIT_LANGS = SUPPORTED_LANGS;

const { t } = useI18n();

// Flatten the bundled static locales once. These are the "default" values
// shown in the table rows when no override exists, plus the master list of
// every key the app references.
const STATIC_BY_LANG: Record<Lang, Record<string, string>> = {
  en: flattenMessages(en),
  ru: flattenMessages(ru),
  uz: flattenMessages(uz),
};
const ALL_KEYS = Array.from(
  new Set(EDIT_LANGS.flatMap((l) => Object.keys(STATIC_BY_LANG[l]))),
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
    if (EDIT_LANGS.some((l) => (STATIC_BY_LANG[l][k] ?? '').toLowerCase().includes(q))) {
      return true;
    }
    const ov = overrides.value[k];
    if (EDIT_LANGS.some((l) => ov?.[l]?.toLowerCase().includes(q))) return true;
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
      // Destructure with an explicit Lang annotation on `lang`. The Volar
      // ts-plugin in the editor sometimes loses the narrow Lang union type
      // when `row.lang` is read off a property - annotating it locally makes
      // the index access on `bucket[lang]` unambiguously typed.
      const { key, lang, value }: { key: string; lang: Lang; value: string } = row;
      const bucket = (next[key] ??= {});
      bucket[lang] = value;
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
  // default - that would prompt the admin to "edit" a string that's actually
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
    // 404 (override didn't exist on server) is fine - treat as success.
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
  return STATIC_BY_LANG[lang][key] ?? '';
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

    <div class="topbar" style="padding: 1em;">
      <div>
        <h1>{{ t('admin.localization.title') }}</h1>
        <p class="dim text-sm mt-2">{{ t('admin.localization.sub') }}</p>
      </div>
      <input v-model="filterText" type="text" placeholder="key or text" style="max-width: 280px;" />
    </div>

    <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
    <p v-if="loading" class="dim text-sm">{{ t('common.loading') }}</p>

    <div v-if="!loading" class="ui-trans-list">
      <div v-for="key in filteredKeys" :key="key" class="ui-trans-row">
        <div class="ui-trans-key mono text-xs muted">{{ key }}</div>

        <!-- One cell per supported language. Single loop rather than a block
             per language, so adding a language is a change in SUPPORTED_LANGS
             and nothing here. -->
        <div v-for="lang in EDIT_LANGS" :key="lang" class="ui-trans-cell">
          <div class="ui-trans-default dim text-xs">
            {{ lang.toUpperCase() }} {{ t('admin.localization.default') }}:
            {{ defaultFor(key, lang) || '-' }}
          </div>
          <template v-if="!isEditing(key, lang)">
            <div class="ui-trans-current">
              <span v-if="overrideFor(key, lang)">{{ overrideFor(key, lang) }}</span>
              <span v-else class="muted">-</span>
            </div>
            <div class="ui-trans-actions">
              <button class="btn-link accent" @click="startEdit(key, lang)">
                {{ overrideFor(key, lang) ? t('common.edit') : t('common.add') }}
              </button>
              <button v-if="overrideFor(key, lang)" class="btn-link" style="color: var(--danger);"
                :disabled="isBusy(key, lang)" @click="onDelete(key, lang)">
                {{ t('common.delete') }}
              </button>
            </div>
          </template>
          <template v-else>
            <textarea v-model="editing[`${key}::${lang}`]" rows="2" maxlength="10000"
              :placeholder="t('admin.localization.add_value_ph')" />
            <div class="ui-trans-actions">
              <button class="btn btn-primary btn-sm" :disabled="isBusy(key, lang)" @click="saveEdit(key, lang)">
                {{ isBusy(key, lang) ? t('admin.localization.saving') : t('common.save') }}
              </button>
              <button class="btn btn-ghost btn-sm" @click="cancelEdit(key, lang)">{{ t('common.cancel') }}</button>
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