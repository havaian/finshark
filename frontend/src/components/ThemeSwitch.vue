<script setup lang="ts">
import { useThemeStore } from '../stores/theme.store';

const theme = useThemeStore();
</script>

<template>
  <div class="theme-switch" role="group" aria-label="Theme">
    <button
      type="button"
      :class="{ active: theme.choice === 'system' }"
      @click="theme.setChoice('system')"
    >SYS</button>
    <button
      type="button"
      :class="{ active: theme.choice === 'light' }"
      @click="theme.setChoice('light')"
    >LT</button>
    <button
      type="button"
      :class="{ active: theme.choice === 'dark' }"
      @click="theme.setChoice('dark')"
    >DK</button>
  </div>
</template>
