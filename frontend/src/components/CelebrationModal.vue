<script setup lang="ts">
// Celebration modal shown after a lesson when the user earned something.
//
// STACKED, not a list: awards are shown one at a time and the user advances
// through them. A session that crosses a level AND unlocks two achievements
// produces three separate moments rather than one crowded panel - which is the
// whole point of a ceremony, and the reason the summary's existing inline badge
// row wasn't landing.
//
// Ordering is deliberate: level-up first (rarest, biggest), then achievement
// levels (tiered milestones), then badges (most frequent). If we ever add a
// fourth kind, it slots into buildCards, not into the template.
//
// Teleport to body is required, same as AdminModal: AppNav is position: sticky
// with backdrop-filter, which creates a containing block for fixed-position
// descendants and would otherwise clip the backdrop to the nav.
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import type { PublicBadge } from '../types/badges';

export interface AchievementUnlockView {
  code: string;
  new_level: number;
  threshold: number;
  // Resolved from the achievements catalogue where possible; falls back to the
  // raw code so an unmapped achievement still celebrates rather than showing
  // a blank card.
  name: string;
  description: string;
  icon: string;
  level_name: string | null;
}

const props = defineProps<{
  open: boolean;
  // Only set when the session actually crossed a level.
  levelReached: number | null;
  achievements: AchievementUnlockView[];
  badges: PublicBadge[];
  // Set after a successful payment. Independent of the lesson awards, so the
  // same shell serves both moments instead of a second near-identical modal.
  premium?: { planName: string; endsOn: string | null } | null;
}>();

const emit = defineEmits<{ (e: 'close'): void }>();
const { t } = useI18n();

type Card =
  // A completed purchase. Comes first when present: paying is the biggest
  // thing that happened, and it is also the one the user most needs confirmed.
  | { kind: 'premium'; planName: string; endsOn: string | null }
  | { kind: 'level'; level: number }
  | { kind: 'achievement'; item: AchievementUnlockView }
  | { kind: 'badge'; item: PublicBadge };

const cards = computed<Card[]>(() => {
  const out: Card[] = [];
  if (props.premium) {
    out.push({
      kind: 'premium',
      planName: props.premium.planName,
      endsOn: props.premium.endsOn,
    });
  }
  if (props.levelReached !== null) {
    out.push({ kind: 'level', level: props.levelReached });
  }
  for (const a of props.achievements) out.push({ kind: 'achievement', item: a });
  for (const b of props.badges) out.push({ kind: 'badge', item: b });
  return out;
});

const index = ref(0);
const isLast = computed(() => index.value >= cards.value.length - 1);

// Narrowed accessors rather than inline `as` casts in the template: the Vue
// template compiler cannot parse type assertions, and a computed per variant
// keeps the markup free of type noise.
const current = computed<Card | null>(() => cards.value[index.value] ?? null);
const premiumCard = computed(() =>
  current.value?.kind === 'premium' ? current.value : null,
);
const levelCard = computed(() =>
  current.value?.kind === 'level' ? current.value.level : null,
);
const achievementCard = computed(() =>
  current.value?.kind === 'achievement' ? current.value.item : null,
);
const badgeCard = computed(() =>
  current.value?.kind === 'badge' ? current.value.item : null,
);

function next() {
  if (isLast.value) {
    emit('close');
    return;
  }
  index.value += 1;
}

// Reset to the first card whenever the modal is (re)opened, otherwise a second
// lesson in the same page session would open part-way through the stack.
watch(
  () => props.open,
  (v) => {
    if (v) index.value = 0;
    document.body.style.overflow = v ? 'hidden' : '';
  },
  { immediate: true },
);

// Enter and Space advance; Escape skips the rest. Escape does NOT cancel the
// awards - they are already persisted server-side, this is purely presentation.
function onKeydown(e: KeyboardEvent) {
  if (!props.open) return;
  if (e.key === 'Escape') {
    emit('close');
  } else if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    next();
  }
}

onMounted(() => window.addEventListener('keydown', onKeydown));
onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown);
  document.body.style.overflow = '';
});
</script>

<template>
  <Teleport to="body">
    <div v-if="open && cards.length > 0" class="modal-backdrop celebrate-backdrop" role="dialog"
      aria-modal="true" @click.self="emit('close')">
      <div class="modal-card celebrate-card">
        <!-- Progress dots: tells the user how many awards are still coming, so
             dismissing early is an informed choice rather than a surprise. -->
        <div v-if="cards.length > 1" class="celebrate-dots" aria-hidden="true">
          <span v-for="(_c, i) in cards" :key="i"
            :class="['celebrate-dot', { active: i === index, done: i < index }]" />
        </div>

        <!-- Confetti. Pure CSS so a celebration costs no dependency; the
             pieces translate and rotate only. -->
        <div v-if="premiumCard" class="confetti" aria-hidden="true">
          <span v-for="n in 18" :key="n" :class="'confetti-bit confetti-bit-' + (n % 6)" />
        </div>

        <div class="celebrate-body">
          <template v-if="premiumCard">
            <div class="celebrate-icon">&#127881;</div>
            <h2 class="celebrate-title">{{ t('celebrate.premium_title') }}</h2>
            <p class="celebrate-name">{{ premiumCard.planName }}</p>
            <p v-if="premiumCard.endsOn" class="celebrate-sub">
              {{ t('celebrate.premium_until', { date: premiumCard.endsOn }) }}
            </p>
            <p class="celebrate-sub">{{ t('celebrate.premium_body') }}</p>
          </template>

          <template v-else-if="levelCard !== null">
            <div class="celebrate-icon">&#9733;</div>
            <h2 class="celebrate-title">{{ t('celebrate.level_title') }}</h2>
            <p class="celebrate-sub">{{ t('celebrate.level_body', { level: levelCard }) }}</p>
          </template>

          <template v-else-if="achievementCard">
            <div class="celebrate-icon">{{ achievementCard.icon || '\u{1F3C6}' }}</div>
            <h2 class="celebrate-title">{{ t('celebrate.achievement_title') }}</h2>
            <p class="celebrate-name">{{ achievementCard.name }}</p>
            <p v-if="achievementCard.level_name" class="celebrate-level">
              {{ achievementCard.level_name }}
            </p>
            <p v-if="achievementCard.description" class="celebrate-sub">
              {{ achievementCard.description }}
            </p>
          </template>

          <template v-else-if="badgeCard">
            <div class="celebrate-icon">{{ badgeCard.icon || '\u{1F3C5}' }}</div>
            <h2 class="celebrate-title">{{ t('celebrate.badge_title') }}</h2>
            <p class="celebrate-name">{{ badgeCard.name }}</p>
            <p class="celebrate-sub">{{ badgeCard.description }}</p>
          </template>
        </div>

        <button class="btn btn-primary celebrate-next" type="button" @click="next">
          {{ isLast ? t('celebrate.done') : t('celebrate.next') }}
        </button>
      </div>
    </div>
  </Teleport>
</template>
