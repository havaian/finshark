<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { AxiosError } from 'axios';
import { useAuthStore } from '../stores/auth.store';
import { lessonsApi } from '../api/lessons.api';
import { authApi } from '../api/auth.api';
import ThemeSwitch from '../components/ThemeSwitch.vue';
import type { Paper } from '../types/content';

const auth = useAuthStore();
const router = useRouter();

const papers = ref<Paper[]>([]);
const selectedPaperId = ref<string>('');
const papersLoading = ref(false);
const starting = ref(false);
const errorMsg = ref<string | null>(null);
const reminderToggleBusy = ref(false);

const hasPapers = computed(() => papers.value.length > 0);

onMounted(async () => {
  try {
    await auth.fetchMe();
  } catch {
    /* axios interceptor handles forced-logout */
  }
  await loadPapers();
});

async function loadPapers() {
  papersLoading.value = true;
  try {
    papers.value = await lessonsApi.listPapers();
    if (papers.value.length === 1) selectedPaperId.value = papers.value[0].id;
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to load papers';
  } finally {
    papersLoading.value = false;
  }
}

async function onStartLesson() {
  starting.value = true;
  errorMsg.value = null;
  try {
    const res = await lessonsApi.start({
      paper_id: selectedPaperId.value || undefined,
    });
    router.push({ name: 'lesson', params: { session_id: res.session_id } });
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to start lesson';
  } finally {
    starting.value = false;
  }
}

async function onToggleReminders() {
  if (!auth.user || reminderToggleBusy.value) return;
  const next = !auth.user.email_reminders_enabled;
  reminderToggleBusy.value = true;
  try {
    const updated = await authApi.setEmailReminders(next);
    auth.user = updated;
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to update preference';
  } finally {
    reminderToggleBusy.value = false;
  }
}

function onLogout() {
  auth.logout();
  router.push({ name: 'login' });
}

function extractError(e: unknown): string | null {
  if (e instanceof AxiosError) {
    const msg = (e.response?.data as { message?: string | string[] })?.message;
    return Array.isArray(msg) ? msg.join(', ') : msg ?? null;
  }
  return null;
}
</script>

<template>
  <main class="page">
    <div class="container">

      <div class="topbar">
        <div class="brand">
          <div class="brand-mark"></div>
          <span>acca duo</span>
        </div>
        <div class="topbar-right">
          <ThemeSwitch />
          <button class="btn btn-ghost" @click="onLogout">Sign out</button>
        </div>
      </div>

      <h3>Welcome back<span v-if="auth.user">, {{ auth.user.display_name }}</span></h3>
      <h1 style="margin-top: 8px;">Keep the streak alive.</h1>

      <div class="stats mt-6" v-if="auth.user">
        <div class="stat stat-streak">
          <div class="stat-lbl">Streak</div>
          <div class="stat-val">{{ auth.user.streak_count }} <span class="stat-fire">🔥</span></div>
        </div>
        <div class="stat">
          <div class="stat-lbl">XP</div>
          <div class="stat-val">{{ auth.user.xp }}</div>
        </div>
        <div class="stat">
          <div class="stat-lbl">Level</div>
          <div class="stat-val">{{ auth.user.level }}</div>
        </div>
      </div>

      <section class="mt-8">
        <div class="row" style="justify-content: space-between; margin-bottom: 14px;">
          <h2>Start a lesson</h2>
          <RouterLink to="/progress" class="btn-link">View progress →</RouterLink>
        </div>

        <p v-if="papersLoading" class="dim text-sm">Loading papers…</p>
        <p v-else-if="!hasPapers" class="dim text-sm">
          No papers available yet.
          <span v-if="auth.user?.is_admin">
            Add one in
            <RouterLink to="/admin/papers" class="btn-link accent">Admin</RouterLink>.
          </span>
        </p>

        <div v-else class="row">
          <select v-model="selectedPaperId" class="grow">
            <option value="">Any paper</option>
            <option v-for="p in papers" :key="p.id" :value="p.id">
              {{ p.code }} — {{ p.name }}
            </option>
          </select>
          <button class="btn btn-primary" :disabled="starting" @click="onStartLesson">
            {{ starting ? 'Starting…' : 'Start lesson' }}
          </button>
        </div>

        <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
      </section>

      <div class="divider"></div>

      <div class="row" v-if="auth.user">
        <div class="grow">
          <div style="font-weight: 500;">Daily reminder emails</div>
          <div class="dim text-sm" style="margin-top: 2px;">
            A nudge at 18:00 if you haven't studied yet.
          </div>
        </div>
        <button
          class="toggle"
          :class="{ on: auth.user.email_reminders_enabled }"
          :disabled="reminderToggleBusy"
          :aria-label="auth.user.email_reminders_enabled ? 'Turn off reminders' : 'Turn on reminders'"
          @click="onToggleReminders"
        >
          <span class="toggle-knob"></span>
        </button>
      </div>

      <div v-if="auth.user?.is_admin" class="mt-8">
        <RouterLink to="/admin/papers" class="btn btn-ghost">Admin</RouterLink>
      </div>

    </div>
  </main>
</template>
