<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { AxiosError } from 'axios';
import { adminApi } from '../../api/admin.api';
import type { LearningObjective, Paper } from '../../types/content';

const route = useRoute();
const paperId = route.params.paper_id as string;

const paper = ref<Paper | null>(null);
const los = ref<LearningObjective[]>([]);
const loading = ref(false);
const errorMsg = ref<string | null>(null);

const code = ref('');
const title = ref('');
const description = ref('');
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
  if (!code.value.trim() || !title.value.trim()) return;
  creating.value = true;
  errorMsg.value = null;
  try {
    const created = await adminApi.createLo(paperId, {
      code: code.value.trim(),
      title: title.value.trim(),
      description: description.value.trim() || null,
      sort_order: sortOrder.value,
    });
    los.value = [...los.value, created].sort(
      (a, b) => a.sort_order - b.sort_order || a.code.localeCompare(b.code),
    );
    code.value = '';
    title.value = '';
    description.value = '';
    sortOrder.value = 0;
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to create LO';
  } finally {
    creating.value = false;
  }
}

async function onDelete(lo: LearningObjective) {
  if (!confirm(`Delete "${lo.code} — ${lo.title}" and ALL its questions?`)) return;
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
  <main class="page">
    <div class="container">

      <div class="topbar">
        <div>
          <h1>Learning objectives</h1>
          <p v-if="paper" class="dim text-sm mt-2">{{ paper.code }} · {{ paper.name }}</p>
        </div>
        <RouterLink to="/admin/papers" class="btn-link">← Back to papers</RouterLink>
      </div>

      <form class="admin-form" @submit.prevent="onCreate">
        <div class="row">
          <input
            v-model="code"
            type="text"
            placeholder="LO code (e.g. A1)"
            maxlength="32"
            required
            style="max-width: 160px;"
          />
          <input
            v-model.number="sortOrder"
            type="number"
            min="0"
            placeholder="Sort"
            style="max-width: 100px;"
          />
        </div>
        <input
          v-model="title"
          type="text"
          placeholder="Title"
          maxlength="200"
          required
        />
        <textarea
          v-model="description"
          placeholder="Description (optional)"
          rows="2"
        />
        <button type="submit" class="btn btn-primary" :disabled="creating">
          {{ creating ? 'Adding…' : 'Add LO' }}
        </button>
      </form>

      <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
      <p v-if="loading" class="dim text-sm">Loading…</p>

      <div v-if="!loading" class="list-bordered">
        <div v-for="lo in los" :key="lo.id" class="list-row" style="flex-direction: column; align-items: stretch;">
          <div class="row" style="justify-content: space-between; width: 100%;">
            <div>
              <span style="font-weight: 500;">{{ lo.code }}</span>
              <span class="dim" style="margin-left: 12px;">{{ lo.title }}</span>
              <span class="mono text-xs muted" style="margin-left: 12px;">sort: {{ lo.sort_order }}</span>
            </div>
            <div class="row" style="gap: 14px;">
              <RouterLink :to="`/admin/los/${lo.id}/questions`" class="btn-link accent">Questions</RouterLink>
              <button class="btn-link" style="color: var(--danger);" @click="onDelete(lo)">Delete</button>
            </div>
          </div>
          <p v-if="lo.description" class="dim text-sm mt-2">{{ lo.description }}</p>
        </div>
        <div v-if="los.length === 0" class="list-row dim text-sm">
          No LOs yet for this paper.
        </div>
      </div>

    </div>
  </main>
</template>
