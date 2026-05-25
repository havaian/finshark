<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { adminApi } from '../../api/admin.api';
import { fmtDate } from '../../i18n/dates';
import type { WhitelistEntry } from '../../types/whitelist';

// Admin: manage the email whitelist.
//
// Two pattern types, distinguished visually:
//   - exact email (user@example.com): pill 'email'
//   - domain pattern (@example.com): pill 'domain' — pales any email at the domain
//
// Note is editable in-place via the same pattern as the localisation page
// (start edit → input → save/cancel). The pattern itself is immutable from
// the UI; deleting and re-adding is the correct flow if you need to change it
// (preserves audit semantics — created_by, created_at).

const { t } = useI18n();

const entries = ref<WhitelistEntry[]>([]);
const loading = ref(false);
const errorMsg = ref<string | null>(null);
const filterText = ref('');

// ---- Add form state ----
const newPattern = ref('');
const newNote = ref('');
const adding = ref(false);
const addError = ref<string | null>(null);

// ---- In-place note edit ----
// Map id → in-progress note value. Presence in the map = row is in edit mode.
const editingNote = ref<Map<string, string>>(new Map());
const busyIds = ref<Set<string>>(new Set());

const filtered = computed(() => {
  const q = filterText.value.trim().toLowerCase();
  if (!q) return entries.value;
  return entries.value.filter(
    (e) =>
      e.pattern.toLowerCase().includes(q) ||
      (e.note ?? '').toLowerCase().includes(q),
  );
});

async function load() {
  loading.value = true;
  errorMsg.value = null;
  try {
    entries.value = await adminApi.listWhitelist();
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to load whitelist';
  } finally {
    loading.value = false;
  }
}

async function onAdd() {
  const pat = newPattern.value.trim().toLowerCase();
  if (!pat || adding.value) return;
  adding.value = true;
  addError.value = null;
  try {
    const added = await adminApi.addWhitelist({
      pattern: pat,
      note: newNote.value.trim() || null,
    });
    // Backend already returns the canonical (lowercased) shape. Prepend so the
    // newly-added entry is visible without scrolling.
    entries.value = [added, ...entries.value];
    newPattern.value = '';
    newNote.value = '';
  } catch (e) {
    addError.value = extractError(e) ?? 'failed to add';
  } finally {
    adding.value = false;
  }
}

function startEditNote(entry: WhitelistEntry) {
  const next = new Map(editingNote.value);
  next.set(entry.id, entry.note ?? '');
  editingNote.value = next;
}

function cancelEditNote(id: string) {
  const next = new Map(editingNote.value);
  next.delete(id);
  editingNote.value = next;
}

async function saveEditNote(entry: WhitelistEntry) {
  if (busyIds.value.has(entry.id)) return;
  const value = (editingNote.value.get(entry.id) ?? '').trim();
  busyIds.value.add(entry.id);
  errorMsg.value = null;
  try {
    const updated = await adminApi.updateWhitelistNote(entry.id, value || null);
    entries.value = entries.value.map((e) => (e.id === updated.id ? updated : e));
    cancelEditNote(entry.id);
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to save note';
  } finally {
    busyIds.value.delete(entry.id);
  }
}

async function onDelete(entry: WhitelistEntry) {
  if (!confirm(t('admin.whitelist.delete_confirm', { pattern: entry.pattern }))) return;
  if (busyIds.value.has(entry.id)) return;
  busyIds.value.add(entry.id);
  errorMsg.value = null;
  try {
    await adminApi.deleteWhitelist(entry.id);
    entries.value = entries.value.filter((e) => e.id !== entry.id);
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to delete';
  } finally {
    busyIds.value.delete(entry.id);
  }
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

    <div class="topbar" style="align-items: end;">
      <div>
        <h1>{{ t('admin.whitelist.title') }}</h1>
        <p class="dim text-sm mt-2">{{ t('admin.whitelist.sub') }}</p>
      </div>
      <input v-model="filterText" type="text" :placeholder="t('admin.whitelist.filter_placeholder')"
        style="max-width: 280px;" />
    </div>

    <!-- Add form -->
    <form class="admin-form" @submit.prevent="onAdd">
      <div class="row">
        <input v-model="newPattern" type="text" :placeholder="t('admin.whitelist.add_pattern_ph')" maxlength="254"
          required class="grow" />
        <input v-model="newNote" type="text" :placeholder="t('admin.whitelist.add_note_ph')" maxlength="500"
          class="grow" />
      </div>
      <button type="submit" class="btn btn-primary" :disabled="adding">
        {{ adding ? t('common.adding') : t('admin.whitelist.add_btn') }}
      </button>
      <p v-if="addError" class="error-text">{{ addError }}</p>
      <p class="dim text-xs">{{ t('admin.whitelist.pattern_hint') }}</p>
    </form>

    <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
    <p v-if="loading" class="dim text-sm">{{ t('common.loading') }}</p>

    <div v-if="!loading" class="list-bordered">
      <div v-for="e in filtered" :key="e.id" class="list-row">
        <div style="display: flex; flex-direction: column; gap: 4px; min-width: 0; flex: 1;">
          <div class="row" style="gap: 10px; align-items: center;">
            <span class="mono" style="font-weight: 500;">{{ e.pattern }}</span>
            <span :class="['pill', e.is_domain ? 'pill-accent' : 'pill-grey']">
              {{ e.is_domain ? t('admin.whitelist.kind_domain') : t('admin.whitelist.kind_email') }}
            </span>
          </div>

          <!-- Note: view or edit mode -->
          <div v-if="!editingNote.has(e.id)" class="dim text-sm">
            <span v-if="e.note">{{ e.note }}</span>
            <span v-else class="muted">{{ t('admin.whitelist.no_note') }}</span>
          </div>
          <div v-else class="row" style="gap: 8px; align-items: center;">
            <input :value="editingNote.get(e.id)"
              @input="editingNote.set(e.id, ($event.target as HTMLInputElement).value)" type="text" maxlength="500"
              :placeholder="t('admin.whitelist.add_note_ph')" class="grow" />
            <button type="button" class="btn btn-primary btn-sm" :disabled="busyIds.has(e.id)" @click="saveEditNote(e)">
              {{ busyIds.has(e.id) ? t('common.saving') : t('common.save') }}
            </button>
            <button type="button" class="btn btn-ghost btn-sm" :disabled="busyIds.has(e.id)"
              @click="cancelEditNote(e.id)">
              {{ t('common.cancel') }}
            </button>
          </div>

          <div class="mono text-xs muted">{{ fmtDate(e.created_at) }}</div>
        </div>

        <div class="row" style="gap: 14px;">
          <button v-if="!editingNote.has(e.id)" class="btn-link accent" :disabled="busyIds.has(e.id)"
            @click="startEditNote(e)">
            {{ e.note ? t('common.edit') : t('admin.whitelist.add_note') }}
          </button>
          <button class="btn-link" style="color: var(--danger);" :disabled="busyIds.has(e.id)" @click="onDelete(e)">
            {{ t('common.delete') }}
          </button>
        </div>
      </div>

      <div v-if="filtered.length === 0" class="list-row dim text-sm">
        {{ filterText ? t('admin.whitelist.empty_filtered') : t('admin.whitelist.empty') }}
      </div>
    </div>

  </div>
</template>
