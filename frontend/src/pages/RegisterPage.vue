<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import { AxiosError } from 'axios';

const email = ref('');
const password = ref('');
const displayName = ref('');
const submitting = ref(false);
const errorMsg = ref<string | null>(null);

const router = useRouter();
const auth = useAuthStore();

async function onSubmit() {
  errorMsg.value = null;
  submitting.value = true;
  try {
    await auth.register(email.value, password.value, displayName.value);
    router.push({ name: 'dashboard' });
  } catch (e) {
    if (e instanceof AxiosError) {
      const data = e.response?.data as { message?: string | string[] } | undefined;
      const msg = Array.isArray(data?.message) ? data!.message.join(', ') : data?.message;
      errorMsg.value = msg ?? 'registration failed';
    } else {
      errorMsg.value = 'registration failed';
    }
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <main class="auth-page">
    <form class="auth-card" @submit.prevent="onSubmit">
      <h1>Create account</h1>

      <div class="field">
        <label class="field-label">Display name</label>
        <input
          v-model="displayName"
          type="text"
          required
          maxlength="64"
        />
      </div>

      <div class="field">
        <label class="field-label">Email</label>
        <input
          v-model="email"
          type="email"
          required
          autocomplete="email"
        />
      </div>

      <div class="field">
        <label class="field-label">Password</label>
        <input
          v-model="password"
          type="password"
          required
          minlength="8"
          autocomplete="new-password"
        />
        <p class="input-help">At least 8 characters.</p>
      </div>

      <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>

      <button
        type="submit"
        class="btn btn-primary btn-block"
        :disabled="submitting"
      >
        {{ submitting ? 'Creating account…' : 'Create account' }}
      </button>

      <p class="auth-foot">
        Already have an account?
        <RouterLink to="/login" class="btn-link accent">Log in</RouterLink>
      </p>
    </form>
  </main>
</template>
