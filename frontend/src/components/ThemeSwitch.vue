<script setup lang="ts">
import { computed } from 'vue';
import { useThemeStore } from '../stores/theme.store';

const theme = useThemeStore();

// Two-state toggle (light ↔ dark). The button shows the icon of the CURRENT
// theme; clicking switches to the other. Tooltip describes the destination state.
const label = computed(() =>
  theme.theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
);
</script>

<template>
  <button type="button" class="theme-toggle" :aria-label="label" :title="label" @click="theme.toggle">
    <!--
      Sun icon shown in light mode; moon shown in dark mode.
      We show the icon of the CURRENT state, matching mental model of "this is
      what's active right now" — like a status indicator that's also a toggle.
      24x24 viewBox, sized via CSS.
    -->
    <svg v-if="theme.theme === 'light'" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
    <svg v-else xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  </button>
</template>
