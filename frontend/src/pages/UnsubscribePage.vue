<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { api } from '../api/client';

const route = useRoute();
const status = ref<'pending' | 'ok' | 'error'>('pending');
const message = ref<string>('');

onMounted(async () => {
  const token = route.query.token as string | undefined;
  if (!token) {
    status.value = 'error';
    message.value = 'No token provided.';
    return;
  }
  try {
    const res = await api.get<{ ok: boolean; message: string }>('/unsubscribe', {
      params: { token },
    });
    if (res.data.ok) {
      status.value = 'ok';
      message.value = res.data.message;
    } else {
      status.value = 'error';
      message.value = res.data.message;
    }
  } catch {
    status.value = 'error';
    message.value = 'Something went wrong. Please try again later.';
  }
});
</script>

<template>
  <main class="auth-page">
    <div class="auth-card" style="text-align: center;">
      <h1>Email reminders</h1>
      <p v-if="status === 'pending'" class="dim mt-4">Updating your preferences…</p>
      <p v-if="status === 'ok'" class="mt-4" style="color: var(--success);">
        {{ message }}. You can re-enable reminders any time from the dashboard.
      </p>
      <p v-if="status === 'error'" class="error-text mt-4">{{ message }}</p>

      <div class="mt-6">
        <RouterLink to="/" class="btn btn-ghost">Back to home</RouterLink>
      </div>
    </div>
  </main>
</template>
