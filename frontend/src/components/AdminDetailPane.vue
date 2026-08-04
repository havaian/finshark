<script setup lang="ts">
// Master-detail pane that changes shape with the viewport.
//
// The admin pages put a list and its detail side by side. Below the breakpoint
// the two columns stack, so tapping a row appends its detail to the BOTTOM of
// the page - off screen, with no indication anything happened. On a phone that
// reads as a dead tap.
//
// Desktop keeps the side-by-side layout, which is the right shape when there is
// room for it. Mobile gets a modal: it appears over the list, it is obviously
// tied to what was tapped, and dismissing it returns you to where you were.
//
// One component rather than a v-if per page, so the two layouts cannot drift
// apart and the slot content is written once.
import { onBeforeUnmount, onMounted, ref } from 'vue';
import AdminModal from './AdminModal.vue';

withDefaults(
  defineProps<{
    open: boolean;
    title?: string;
    subtitle?: string;
    // Blocks dismissal while a write is in flight, same contract as AdminModal.
    busy?: boolean;
  }>(),
  { title: '', subtitle: '', busy: false },
);

const emit = defineEmits<{ (e: 'close'): void }>();

// 1200px matches the breakpoint the admin grid already collapses at, so the
// modal takes over at exactly the point the columns stop fitting.
const MOBILE_QUERY = '(max-width: 1200px)';
const isMobile = ref(false);
let mql: MediaQueryList | null = null;

function sync(e: MediaQueryList | MediaQueryListEvent) {
  isMobile.value = e.matches;
}

onMounted(() => {
  mql = window.matchMedia(MOBILE_QUERY);
  sync(mql);
  mql.addEventListener('change', sync);
});

onBeforeUnmount(() => mql?.removeEventListener('change', sync));
</script>

<template>
  <!-- Mobile: the detail is a modal over the list. -->
  <AdminModal v-if="isMobile" :open="open" wide :title="title" :subtitle="subtitle"
    :busy="busy" @update:open="(v: boolean) => { if (!v) emit('close'); }">
    <slot />
  </AdminModal>

  <!-- Desktop: the detail is the right-hand column, as before. -->
  <section v-else-if="open" class="card grow admin-detail-pane">
    <h2 v-if="title">{{ title }}</h2>
    <p v-if="subtitle" class="dim text-xs mt-1">{{ subtitle }}</p>
    <slot />
  </section>
</template>
