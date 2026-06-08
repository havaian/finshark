<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { GlobeAltIcon } from '@heroicons/vue/24/outline';
import { useLocaleStore } from '../stores/locale.store';
import { SUPPORTED_LANGS, type Lang } from '../i18n';

// Globe-icon dropdown that swaps the active UI language. Lives in the navbar
// (and the admin sidebar) so language is always reachable, not buried in a
// drawer or the Settings page.
//
// Behavior matches the prior in-drawer/settings pickers: changing language
// rewrites the :lang URL segment and triggers a full page reload so any
// already-rendered strings from the previous bundle (and the DB overrides
// fetched on boot) are cleanly replaced. Clicking the active option is a
// no-op so users can dismiss the menu without side effects.

const { t } = useI18n();
const locale = useLocaleStore();

const open = ref(false);
const rootEl = ref<HTMLElement | null>(null);

const options = computed(() =>
  SUPPORTED_LANGS.map((code) => ({
    code,
    label: code.toUpperCase(),
    nameKey: `lang.name_${code}`,
  })),
);

function toggle() {
  open.value = !open.value;
}

function close() {
  open.value = false;
}

function choose(next: Lang) {
  close();
  if (next === locale.lang) return;
  // setLang updates the ref + persists synchronously; the async chunk-load it
  // kicks off is discarded because we reload below, and bootstrapLocale redoes
  // it cleanly on the fresh page. Hence void.
  void locale.setLang(next);

  const url = new URL(window.location.href);
  const segments = url.pathname.split('/');
  if (segments.length >= 2 && (SUPPORTED_LANGS as readonly string[]).includes(segments[1])) {
    segments[1] = next;
    url.pathname = segments.join('/');
  } else {
    url.pathname = `/${next}${url.pathname}`;
  }
  window.location.assign(url.toString());
}

// Dismiss on outside click + ESC. Bound at window level so it survives
// teleported/portalled content; the ref guard makes clicks inside the menu
// safe even though the menu is a child of rootEl.
function onDocClick(e: MouseEvent) {
  if (!open.value) return;
  const target = e.target as Node | null;
  if (rootEl.value && target && !rootEl.value.contains(target)) close();
}
function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape' && open.value) close();
}
if (typeof window !== 'undefined') {
  window.addEventListener('click', onDocClick);
  window.addEventListener('keydown', onKey);
  onBeforeUnmount(() => {
    window.removeEventListener('click', onDocClick);
    window.removeEventListener('keydown', onKey);
  });
}
</script>

<template>
  <div class="lang-picker" ref="rootEl">
    <button type="button" class="lang-picker-btn" :aria-label="t('lang.label')" :aria-expanded="open"
      :title="t('lang.label')" @click="toggle">
      <GlobeAltIcon class="lang-picker-icon" aria-hidden="true" />
      <span class="lang-picker-current">{{ locale.lang.toUpperCase() }}</span>
    </button>
    <div v-if="open" class="lang-picker-menu" role="menu">
      <button v-for="opt in options" :key="opt.code" type="button" role="menuitem"
        :class="['lang-picker-item', { active: locale.lang === opt.code }]" :aria-current="locale.lang === opt.code"
        @click="choose(opt.code)">
        <span class="lang-picker-item-code">{{ opt.label }}</span>
        <span class="lang-picker-item-name dim text-xs">{{ t(opt.nameKey) }}</span>
      </button>
    </div>
  </div>
</template>
