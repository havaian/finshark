<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { adminApi } from '../../api/admin.api';
import { fmtDate } from '../../i18n/dates';
import type { EmailOutboxEntry, EmailOutboxStats } from '../../types/email-outbox';

// Admin: the transactional email queue.
//
// Exists because a failed receipt used to be invisible - one WARN line in the
// container log and nothing else. Every payment email now lands here first, so
// "did the user actually get told" is a question with an answer.
//
// Two views off one endpoint: everything recent, or only the failures. The
// failures view is the one that matters operationally, so it is the default
// when anything has failed.
//
// Requeue is the only write. It resets a failed row's attempt counter and puts
// it back in the queue - what you press after fixing the mail server. Drain
// runs a pass immediately instead of waiting for the next minute tick.

const { t } = useI18n();

const entries = ref<EmailOutboxEntry[]>([]);
const stats = ref<EmailOutboxStats | null>(null);
const loading = ref(false);
const errorMsg = ref<string | null>(null);
const busyIds = ref<Set<string>>(new Set());
const draining = ref(false);

// 'failed' | 'all'. Starts on 'all' and flips to 'failed' after the first load
// if there is anything to look at, so the page opens on the problem.
const view = ref<'all' | 'failed'>('all');

const failedCount = computed(() => stats.value?.failed ?? 0);
const pendingCount = computed(() => stats.value?.pending ?? 0);
const sentCount = computed(() => stats.value?.sent ?? 0);

function pillClass(status: string): string {
  if (status === 'sent') return 'pill pill-green';
  if (status === 'failed') return 'pill pill-red';
  return 'pill pill-amber';
}

function errText(e: unknown): string {
  const ax = e as AxiosError<{ message?: string }>;
  return ax?.response?.data?.message ?? t('admin.email_outbox.load_error');
}

async function loadStats() {
  try {
    stats.value = await adminApi.getEmailOutboxStats();
  } catch {
    // Non-fatal: the list is the point, the counters are decoration.
    stats.value = null;
  }
}

async function load(initial = false) {
  loading.value = true;
  errorMsg.value = null;
  try {
    await loadStats();
    if (initial && (stats.value?.failed ?? 0) > 0) {
      view.value = 'failed';
    }
    entries.value = await adminApi.listEmailOutbox(
      view.value === 'failed' ? 'failed' : undefined,
    );
  } catch (e) {
    errorMsg.value = errText(e);
  } finally {
    loading.value = false;
  }
}

async function switchView(next: 'all' | 'failed') {
  if (view.value === next) return;
  view.value = next;
  await load();
}

async function requeue(entry: EmailOutboxEntry) {
  if (busyIds.value.has(entry.id)) return;
  busyIds.value = new Set(busyIds.value).add(entry.id);
  errorMsg.value = null;
  try {
    await adminApi.requeueEmailOutbox(entry.id);
    await load();
  } catch (e) {
    errorMsg.value = errText(e);
  } finally {
    const next = new Set(busyIds.value);
    next.delete(entry.id);
    busyIds.value = next;
  }
}

async function drain() {
  if (draining.value) return;
  draining.value = true;
  errorMsg.value = null;
  try {
    await adminApi.drainEmailOutbox();
    await load();
  } catch (e) {
    errorMsg.value = errText(e);
  } finally {
    draining.value = false;
  }
}

onMounted(() => load(true));
</script>

<template>
  <div class="container-wide">
    <div class="topbar">
      <div class="grow">
        <h1>{{ t('admin.email_outbox.title') }}</h1>
        <p class="dim text-sm">{{ t('admin.email_outbox.subtitle') }}</p>
      </div>
      <button class="btn btn-ghost btn-sm" :disabled="draining" @click="drain">
        {{ draining ? t('admin.email_outbox.draining') : t('admin.email_outbox.drain') }}
      </button>
    </div>

    <div class="row">
      <span class="pill pill-amber">{{ t('admin.email_outbox.pending') }}: {{ pendingCount }}</span>
      <span class="pill pill-red">{{ t('admin.email_outbox.failed') }}: {{ failedCount }}</span>
      <span class="pill pill-green">{{ t('admin.email_outbox.sent') }}: {{ sentCount }}</span>
    </div>

    <div class="row mt-2">
      <button
        :class="['btn', 'btn-sm', view === 'all' ? 'btn-primary' : 'btn-ghost']"
        @click="switchView('all')"
      >
        {{ t('admin.email_outbox.view_all') }}
      </button>
      <button
        :class="['btn', 'btn-sm', view === 'failed' ? 'btn-primary' : 'btn-ghost']"
        @click="switchView('failed')"
      >
        {{ t('admin.email_outbox.view_failed') }}
      </button>
    </div>

    <p v-if="errorMsg" class="error-text mt-2">{{ errorMsg }}</p>

    <p v-if="loading" class="dim text-sm mt-2">{{ t('common.loading') }}</p>

    <div v-else class="list-bordered mt-2">
      <p v-if="entries.length === 0" class="list-row dim text-sm">
        {{ t('admin.email_outbox.empty') }}
      </p>

      <div v-for="entry in entries" :key="entry.id" class="list-row">
        <div class="grow">
          <div class="row">
            <span :class="pillClass(entry.status)">{{ entry.status }}</span>
            <span class="mono">{{ entry.template_key }}</span>
            <span class="dim text-sm">{{ entry.to_email }}</span>
          </div>

          <p class="dim text-xs mt-2">
            {{ fmtDate(entry.created_at) }}
            <span v-if="entry.attempts > 0">
              &middot; {{ t('admin.email_outbox.attempts') }}: {{ entry.attempts }}
            </span>
            <span v-if="entry.context"> &middot; {{ entry.context }}</span>
          </p>

          <p v-if="entry.last_error" class="mono text-xs muted">{{ entry.last_error }}</p>
        </div>

        <button
          v-if="entry.status === 'failed'"
          class="btn btn-ghost btn-sm"
          :disabled="busyIds.has(entry.id)"
          @click="requeue(entry)"
        >
          {{ t('admin.email_outbox.requeue') }}
        </button>
      </div>
    </div>
  </div>
</template>
