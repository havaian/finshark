<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { adminApi } from '../../api/admin.api';
import type { PaperRaw } from '../../types/content';

const { t } = useI18n();

const papers = ref<PaperRaw[]>([]);
const loading = ref(false);
const errorMsg = ref<string | null>(null);

const newCode = ref('');
const newNameEn = ref('');
const newNameRu = ref('');
const creating = ref(false);

async function load() {
  loading.value = true;
  errorMsg.value = null;
  try {
    papers.value = await adminApi.listPapers();
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to load papers';
  } finally {
    loading.value = false;
  }
}

async function onCreate() {
  if (!newCode.value.trim() || !newNameEn.value.trim()) return;
  creating.value = true;
  errorMsg.value = null;
  try {
    const created = await adminApi.createPaper({
      code: newCode.value.trim(),
      name_en: newNameEn.value.trim(),
      // Send null when empty so the field is explicitly cleared rather than treated as missing.
      name_ru: newNameRu.value.trim() ? newNameRu.value.trim() : null,
    });
    papers.value = [...papers.value, created].sort((a, b) =>
      a.code.localeCompare(b.code),
    );
    newCode.value = '';
    newNameEn.value = '';
    newNameRu.value = '';
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to create paper';
  } finally {
    creating.value = false;
  }
}

async function onDelete(p: PaperRaw) {
  if (!confirm(t('admin.papers.delete_confirm', { code: p.code }))) return;
  try {
    await adminApi.deletePaper(p.id);
    papers.value = papers.value.filter((x) => x.id !== p.id);
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to delete paper';
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
  <div class="container">

    <div class="topbar">
      <h1>{{ t('admin.papers.title') }}</h1>
    </div>

    <form class="admin-form" @submit.prevent="onCreate">
      <div class="row">
        <input
          v-model="newCode"
          type="text"
          :placeholder="t('admin.papers.add_code_ph')"
          maxlength="16"
          required
          style="max-width: 140px;"
        />
        <input
          v-model="newNameEn"
          type="text"
          :placeholder="t('admin.papers.add_name_en_ph')"
          maxlength="200"
          required
          class="grow"
        />
      </div>
      <input
        v-model="newNameRu"
        type="text"
        :placeholder="t('admin.papers.add_name_ru_ph')"
        maxlength="200"
      />
      <button type="submit" class="btn btn-primary" :disabled="creating">
        {{ creating ? t('common.adding') : t('common.add') }}
      </button>
    </form>

    <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
    <p v-if="loading" class="dim text-sm">{{ t('common.loading') }}</p>

    <div v-if="!loading" class="list-bordered">
      <div v-for="p in papers" :key="p.id" class="list-row">
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <div>
            <span style="font-weight: 500;">{{ p.code }}</span>
            <span class="dim" style="margin-left: 12px;">{{ p.name_en }}</span>
          </div>
          <div v-if="p.name_ru" class="dim text-sm" style="margin-left: 0;">
            <span class="mono text-xs muted">RU</span> {{ p.name_ru }}
          </div>
        </div>
        <div class="row" style="gap: 14px;">
          <RouterLink :to="`/admin/papers/${p.id}/los`" class="btn-link accent">
            {{ t('admin.los.title') }}
          </RouterLink>
          <button class="btn-link" style="color: var(--danger);" @click="onDelete(p)">
            {{ t('common.delete') }}
          </button>
        </div>
      </div>
      <div v-if="papers.length === 0" class="list-row dim text-sm">
        {{ t('admin.papers.empty') }}
      </div>
    </div>

  </div>
</template>
