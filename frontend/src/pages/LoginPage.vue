<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';
import { AxiosError } from 'axios';

const email = ref('');
const password = ref('');
const submitting = ref(false);
const errorMsg = ref<string | null>(null);

const router = useRouter();
const auth = useAuthStore();

async function onSubmit() {
  errorMsg.value = null;
  submitting.value = true;
  try {
    await auth.login(email.value, password.value);
    router.push({ name: 'dashboard' });
  } catch (e) {
    if (e instanceof AxiosError) {
      errorMsg.value = (e.response?.data as { message?: string })?.message ?? 'login failed';
    } else {
      errorMsg.value = 'login failed';
    }
  } finally {
    submitting.value = false;
  }
}
</script>

<template>
  <main class="auth-page">
    <form class="auth-card" @submit.prevent="onSubmit">
      <h1>Log in</h1>

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
          autocomplete="current-password"
        />
      </div>

      <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>

      <button
        type="submit"
        class="btn btn-primary btn-block"
        :disabled="submitting"
      >
        {{ submitting ? 'Logging in…' : 'Log in' }}
      </button>

      <p class="auth-foot">
        No account?
        <RouterLink to="/register" class="btn-link accent">Register</RouterLink>
      </p>
    </form>
  </main>
</template>
