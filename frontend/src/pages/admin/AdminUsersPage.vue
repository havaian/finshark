<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { adminApi } from '../../api/admin.api';
import { useAuthStore } from '../../stores/auth.store';
import { fmtDate } from '../../i18n/dates';
import type { PublicUser } from '../../types/auth';

const { t } = useI18n();
const auth = useAuthStore();

const users = ref<PublicUser[]>([]);
const loading = ref(false);
const errorMsg = ref<string | null>(null);
const filterText = ref('');
// Track in-flight toggle requests per user id so we can disable the right buttons.
const busyIds = ref<Set<string>>(new Set());

const filtered = computed(() => {
  const q = filterText.value.trim().toLowerCase();
  if (!q) return users.value;
  return users.value.filter(
    (u) =>
      u.email.toLowerCase().includes(q) ||
      u.display_name.toLowerCase().includes(q),
  );
});

async function load() {
  loading.value = true;
  errorMsg.value = null;
  try {
    users.value = await adminApi.listUsers();
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to load users';
  } finally {
    loading.value = false;
  }
}

async function toggleAdmin(user: PublicUser) {
  if (busyIds.value.has(user.id)) return;

  const next = !user.is_admin;
  // Confirm demotion explicitly — promoting is one click but demoting is risky.
  if (!next) {
    // Use a plain confirm prompt; localized via t().
    const ok = confirm(
      `${t('admin.users.remove_admin')} — ${user.display_name} (${user.email})?`,
    );
    if (!ok) return;
  }

  busyIds.value.add(user.id);
  errorMsg.value = null;
  try {
    const updated = await adminApi.setUserAdmin(user.id, next);
    users.value = users.value.map((u) => (u.id === updated.id ? updated : u));
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to update admin status';
  } finally {
    busyIds.value.delete(user.id);
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

    <div class="topbar">
      <h1>{{ t('admin.users.title') }}</h1>
      <input
        v-model="filterText"
        type="text"
        :placeholder="t('admin.users.filter_placeholder')"
        style="max-width: 280px;"
      />
    </div>

    <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
    <p v-if="loading" class="dim text-sm">{{ t('admin.users.loading') }}</p>

    <div v-if="!loading" class="list-bordered">
      <div v-for="u in filtered" :key="u.id" class="list-row">
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div>
            <span style="font-weight: 500;">{{ u.display_name }}</span>
            <span v-if="u.is_admin" class="pill pill-accent" style="margin-left: 10px;">{{ t('admin.users.admin_badge') }}</span>
            <span v-if="auth.user?.id === u.id" class="pill pill-grey" style="margin-left: 6px;">{{ t('admin.users.you_badge') }}</span>
          </div>
          <div class="dim text-sm">{{ u.email }}</div>
          <div class="mono text-xs muted">
            {{ t('dashboard.streak') }} {{ u.streak_count }} · {{ t('dashboard.xp') }} {{ u.xp }} · {{ t('dashboard.level') }} {{ u.level }} · {{ fmtDate(u.last_active_date) }}
          </div>
        </div>
        <div class="row" style="gap: 12px;">
          <button
            v-if="!u.is_admin"
            class="btn btn-ghost"
            :disabled="busyIds.has(u.id)"
            @click="toggleAdmin(u)"
          >
            {{ busyIds.has(u.id) ? t('admin.users.updating') : t('admin.users.make_admin') }}
          </button>
          <button
            v-else
            class="btn btn-ghost"
            :disabled="busyIds.has(u.id) || auth.user?.id === u.id"
            :title="auth.user?.id === u.id ? t('admin.users.cannot_self_demote') : ''"
            @click="toggleAdmin(u)"
          >
            {{ busyIds.has(u.id) ? t('admin.users.updating') : t('admin.users.remove_admin') }}
          </button>
        </div>
      </div>
      <div v-if="filtered.length === 0" class="list-row dim text-sm">
        {{ filterText ? t('admin.users.empty_filtered') : t('admin.users.empty') }}
      </div>
    </div>

  </div>
</template>
