<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { adminApi } from '../../api/admin.api';
import type { LearningObjectiveRaw, PaperRaw } from '../../types/content';

const { t } = useI18n();
const route = useRoute();
const paperId = route.params.paper_id as string;

const paper = ref<PaperRaw | null>(null);
const los = ref<LearningObjectiveRaw[]>([]);
const loading = ref(false);
const errorMsg = ref<string | null>(null);

const code = ref('');
const titleEn = ref('');
const titleRu = ref('');
const descriptionEn = ref('');
const descriptionRu = ref('');
const sortOrder = ref(0);
const creating = ref(false);

async function load() {
  loading.value = true;
  errorMsg.value = null;
  try {
    const [papers, fetchedLos] = await Promise.all([
      adminApi.listPapers(),
      adminApi.listLos(paperId),
    ]);
    paper.value = papers.find((p) => p.id === paperId) ?? null;
    los.value = fetchedLos;
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to load LOs';
  } finally {
    loading.value = false;
  }
}

async function onCreate() {
  if (!code.value.trim() || !titleEn.value.trim()) return;
  creating.value = true;
  errorMsg.value = null;
  try {
    const created = await adminApi.createLo(paperId, {
      code: code.value.trim(),
      title_en: titleEn.value.trim(),
      title_ru: titleRu.value.trim() ? titleRu.value.trim() : null,
      description_en: descriptionEn.value.trim() ? descriptionEn.value.trim() : null,
      description_ru: descriptionRu.value.trim() ? descriptionRu.value.trim() : null,
      sort_order: sortOrder.value,
    });
    los.value = [...los.value, created].sort(
      (a, b) => a.sort_order - b.sort_order || a.code.localeCompare(b.code),
    );
    code.value = '';
    titleEn.value = '';
    titleRu.value = '';
    descriptionEn.value = '';
    descriptionRu.value = '';
    sortOrder.value = 0;
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to create LO';
  } finally {
    creating.value = false;
  }
}

async function onDelete(lo: LearningObjectiveRaw) {
  if (!confirm(t('admin.los.delete_confirm', { code: lo.code, title: lo.title_en }))) return;
  try {
    await adminApi.deleteLo(lo.id);
    los.value = los.value.filter((x) => x.id !== lo.id);
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to delete LO';
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
      <div>
        <h1>{{ t('admin.los.title') }}</h1>
        <p v-if="paper" class="dim text-sm mt-2">
          {{ paper.code }} · {{ paper.name_en }}
          <span v-if="paper.name_ru" class="mono text-xs muted" style="margin-left: 8px;">
            RU: {{ paper.name_ru }}
          </span>
        </p>
      </div>
      <RouterLink to="/admin/papers" class="btn-link">{{ t('admin.los.back_to_papers') }}</RouterLink>
    </div>

    <form class="admin-form" @submit.prevent="onCreate">
      <div class="row">
        <input
          v-model="code"
          type="text"
          :placeholder="t('admin.los.add_code_ph')"
          maxlength="32"
          required
          style="max-width: 160px;"
        />
        <input
          v-model.number="sortOrder"
          type="number"
          min="0"
          :placeholder="t('admin.los.add_sort_ph')"
          style="max-width: 100px;"
        />
      </div>
      <input
        v-model="titleEn"
        type="text"
        :placeholder="t('admin.los.add_title_en_ph')"
        maxlength="200"
        required
      />
      <input
        v-model="titleRu"
        type="text"
        :placeholder="t('admin.los.add_title_ru_ph')"
        maxlength="200"
      />
      <textarea
        v-model="descriptionEn"
        :placeholder="t('admin.los.add_description_en_ph')"
        rows="2"
      />
      <textarea
        v-model="descriptionRu"
        :placeholder="t('admin.los.add_description_ru_ph')"
        rows="2"
      />
      <button type="submit" class="btn btn-primary" :disabled="creating">
        {{ creating ? t('common.adding') : t('common.add') }}
      </button>
    </form>

    <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
    <p v-if="loading" class="dim text-sm">{{ t('common.loading') }}</p>

    <div v-if="!loading" class="list-bordered">
      <div v-for="lo in los" :key="lo.id" class="list-row" style="flex-direction: column; align-items: stretch;">
        <div class="row" style="justify-content: space-between; width: 100%;">
          <div>
            <span style="font-weight: 500;">{{ lo.code }}</span>
            <span class="dim" style="margin-left: 12px;">{{ lo.title_en }}</span>
            <span class="mono text-xs muted" style="margin-left: 12px;">{{ t('admin.los.sort_label') }}: {{ lo.sort_order }}</span>
          </div>
          <div class="row" style="gap: 14px;">
            <RouterLink :to="`/admin/los/${lo.id}/questions`" class="btn-link accent">
              {{ t('admin.los.questions_link') }}
            </RouterLink>
            <button class="btn-link" style="color: var(--danger);" @click="onDelete(lo)">
              {{ t('common.delete') }}
            </button>
          </div>
        </div>
        <p v-if="lo.title_ru" class="dim text-sm mt-2">
          <span class="mono text-xs muted">RU</span> {{ lo.title_ru }}
        </p>
        <p v-if="lo.description_en" class="dim text-sm mt-2">{{ lo.description_en }}</p>
        <p v-if="lo.description_ru" class="dim text-sm mt-2">
          <span class="mono text-xs muted">RU</span> {{ lo.description_ru }}
        </p>
      </div>
      <div v-if="los.length === 0" class="list-row dim text-sm">
        {{ t('admin.los.empty') }}
      </div>
    </div>

  </div>
</template>
