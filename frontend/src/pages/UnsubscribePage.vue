<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { api } from '../api/client';

const { t } = useI18n();
const route = useRoute();
const status = ref<'pending' | 'ok' | 'error'>('pending');
const message = ref<string>('');

onMounted(async () => {
  const token = route.query.token as string | undefined;
  if (!token) {
    status.value = 'error';
    message.value = t('unsubscribe.error');
    return;
  }
  try {
    const res = await api.get<{ ok: boolean; message: string }>('/unsubscribe', {
      params: { token },
    });
    if (res.data.ok) {
      status.value = 'ok';
      // Server message is human-readable English; fall back to localized body if empty.
      message.value = res.data.message || t('unsubscribe.body');
    } else {
      status.value = 'error';
      message.value = res.data.message || t('unsubscribe.error');
    }
  } catch {
    status.value = 'error';
    message.value = t('common.error_generic');
  }
});
</script>

<template>
  <main class="auth-page">
    <div class="auth-card" style="text-align: center;">
      <h1>{{ t('unsubscribe.title') }}</h1>
      <p v-if="status === 'pending'" class="dim mt-4">{{ t('common.loading') }}</p>
      <p v-if="status === 'ok'" class="mt-4" style="color: var(--success);">
        {{ message }}
      </p>
      <p v-if="status === 'error'" class="error-text mt-4">{{ message }}</p>

      <div class="mt-6">
        <RouterLink to="/" class="btn btn-ghost">{{ t('unsubscribe.back') }}</RouterLink>
      </div>
    </div>
  </main>
</template>
