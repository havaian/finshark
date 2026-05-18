<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

// Home / root route. We don't actually render any meaningful content here in
// Phase 2 — the proper landing is a Phase-3 deliverable. For now:
//   - authed users go straight to /dashboard
//   - unauthed users go to /login
// Avoids the "logged in but staring at a marketing page" state and removes
// the dead manual click that used to live here.
//
// The redirect happens in onMounted (after the auth store has hydrated from
// localStorage in main.ts) and uses router.replace so the user can hit Back
// to leave the app without bouncing through '/'.
const router = useRouter();
const auth = useAuthStore();

onMounted(() => {
  if (auth.isAuthenticated) {
    router.replace({ name: 'dashboard' });
  } else {
    router.replace({ name: 'login' });
  }
});
</script>

<template>
  <!-- Render nothing meaningful — the onMounted hook replaces this route
       immediately. Keeping the <main> in place gives Vue Router something to
       mount cleanly and prevents a single frame of unstyled flash. -->
  <main class="auth-page">
    <div class="container-narrow" style="text-align: center;">
      <div class="brand" style="justify-content: center;">
        <div class="brand-mark"></div>
        <span style="font-size: 18px;">Finshark</span>
      </div>
    </div>
  </main>
</template>
