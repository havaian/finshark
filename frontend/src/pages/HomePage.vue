<script setup lang="ts">
import { useAuthStore } from '../stores/auth.store';
import ThemeSwitch from '../components/ThemeSwitch.vue';

const auth = useAuthStore();
</script>

<template>
  <main class="auth-page">
    <div class="container-narrow" style="text-align: center;">
      <div style="position: absolute; top: 16px; right: 16px;">
        <ThemeSwitch />
      </div>

      <div class="brand" style="justify-content: center; margin-bottom: 28px;">
        <div class="brand-mark"></div>
        <span style="font-size: 18px;">acca duo</span>
      </div>

      <h1 style="font-size: 36px; letter-spacing: -0.03em;">10 minutes a day, towards ACCA.</h1>
      <p class="dim mt-4" style="font-size: 15px;">
        Daily micro-lessons. Spaced repetition. Real exam topics.
      </p>

      <div class="row" style="justify-content: center; margin-top: 28px;">
        <template v-if="auth.isAuthenticated">
          <RouterLink to="/dashboard" class="btn btn-primary">Go to dashboard</RouterLink>
        </template>
        <template v-else>
          <RouterLink to="/login" class="btn btn-primary">Log in</RouterLink>
          <RouterLink to="/register" class="btn btn-ghost">Register</RouterLink>
        </template>
      </div>
    </div>
  </main>
</template>
