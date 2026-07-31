<script setup lang="ts">
// Shared modal shell for the admin pages.
//
// Every admin page had grown its own inline "detail panel" instead of a modal,
// and AdminPaymentsPage's order detail used a `.modal-overlay` class that does
// not exist anywhere in the stylesheet - so it rendered unpositioned at the end
// of the DOM, i.e. as a block at the bottom of the page. This component owns
// the one correct markup so that cannot drift again.
//
// Teleport to body is REQUIRED, not cosmetic: AdminLayout's header is
// `position: sticky` with `backdrop-filter`, which creates a containing block
// for fixed-position descendants. A `.modal-backdrop` rendered inside it would
// be clipped to the layout rather than covering the viewport.
import { onBeforeUnmount, onMounted, watch } from 'vue';

const props = withDefaults(
  defineProps<{
    // v-model:open
    open: boolean;
    title?: string;
    // Subtitle line under the title (ids, refs, timestamps).
    subtitle?: string;
    // Wide variant for tables and callback trails.
    wide?: boolean;
    // Block dismissal while a request is in flight.
    busy?: boolean;
  }>(),
  { title: '', subtitle: '', wide: false, busy: false },
);

const emit = defineEmits<{ (e: 'update:open', v: boolean): void }>();

function close() {
  // Never let the user dismiss mid-write - a half-applied admin action with the
  // modal already gone is impossible to reason about.
  if (props.busy) return;
  emit('update:open', false);
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close();
}

// Lock the background so the page behind doesn't scroll under the backdrop.
// Restored on close AND on unmount, otherwise navigating away while open would
// leave the whole app unscrollable.
function setBodyLock(locked: boolean) {
  document.body.style.overflow = locked ? 'hidden' : '';
}

watch(
  () => props.open,
  (v) => setBodyLock(v),
  { immediate: true },
);

onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
  setBodyLock(false);
});
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="modal-backdrop" role="dialog" aria-modal="true" @click.self="close">
      <div :class="['modal-card', { 'modal-card-wide': wide }]">
        <div class="modal-head">
          <div>
            <h2 v-if="title">{{ title }}</h2>
            <slot name="title" />
            <p v-if="subtitle" class="dim text-xs mt-1 admin-mono">{{ subtitle }}</p>
          </div>
          <button class="modal-close" type="button" :disabled="busy" aria-label="Close" @click="close">
            &#10005;
          </button>
        </div>

        <div class="modal-body">
          <slot />
        </div>

        <div v-if="$slots.footer" class="admin-order-actions mt-4">
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>
