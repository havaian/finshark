<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { AxiosError } from 'axios';
import { adminApi } from '../../api/admin.api';
import type { Paper } from '../../types/content';

const papers = ref<Paper[]>([]);
const loading = ref(false);
const errorMsg = ref<string | null>(null);

const newCode = ref('');
const newName = ref('');
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
  if (!newCode.value.trim() || !newName.value.trim()) return;
  creating.value = true;
  errorMsg.value = null;
  try {
    const created = await adminApi.createPaper({ code: newCode.value.trim(), name: newName.value.trim() });
    papers.value = [...papers.value, created].sort((a, b) => a.code.localeCompare(b.code));
    newCode.value = '';
    newName.value = '';
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to create paper';
  } finally {
    creating.value = false;
  }
}

async function onDelete(p: Paper) {
  if (!confirm(`Delete paper "${p.code}" and ALL its LOs and questions? This cascades.`)) return;
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
  <main class="page">
    <div class="container">

      <div class="topbar">
        <h1>Papers</h1>
        <RouterLink to="/dashboard" class="btn-link">← Back to dashboard</RouterLink>
      </div>

      <form class="admin-form" @submit.prevent="onCreate">
        <div class="row">
          <input
            v-model="newCode"
            type="text"
            placeholder="Code (e.g. F1)"
            maxlength="16"
            required
            style="max-width: 140px;"
          />
          <input
            v-model="newName"
            type="text"
            placeholder="Name (e.g. Business & Technology)"
            maxlength="200"
            required
            class="grow"
          />
          <button type="submit" class="btn btn-primary" :disabled="creating">
            {{ creating ? 'Adding…' : 'Add' }}
          </button>
        </div>
      </form>

      <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
      <p v-if="loading" class="dim text-sm">Loading…</p>

      <div v-if="!loading" class="list-bordered">
        <div v-for="p in papers" :key="p.id" class="list-row">
          <div>
            <span style="font-weight: 500;">{{ p.code }}</span>
            <span class="dim" style="margin-left: 12px;">{{ p.name }}</span>
          </div>
          <div class="row" style="gap: 14px;">
            <RouterLink :to="`/admin/papers/${p.id}/los`" class="btn-link accent">LOs</RouterLink>
            <button class="btn-link" style="color: var(--danger);" @click="onDelete(p)">Delete</button>
          </div>
        </div>
        <div v-if="papers.length === 0" class="list-row dim text-sm">
          No papers yet. Add one above to get started.
        </div>
      </div>

    </div>
  </main>
</template>
