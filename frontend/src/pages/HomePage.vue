<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../stores/auth.store';
import { useLocaleStore } from '../stores/locale.store';
import { useLocalePath } from '../router/useLocalePath';
import ThemeSwitch from '../components/ThemeSwitch.vue';

// Landing page. Reached at '/'.
//
// Behaviour:
//   - Authed users get bounced to /dashboard so they don't sit on marketing
//     content when they're trying to study. The redirect runs in onMounted
//     (after auth store hydrates from localStorage in main.ts) and uses
//     router.replace so the user can hit Back to leave the app cleanly.
//   - Unauthed users see the full landing.
//
// The CTA buttons link to /login (which still owns the actual Google OAuth
// trigger). We never call /auth/google from here - keeps the landing layer
// purely informational and means we can plug in a passwords flow later
// without touching this page.
//
// Content uses i18n keys under landing.* so EN/RU swap cleanly. The hero
// product mock is an interactive lesson card (no image asset) whose labels
// also come from landing.* (mock_*).
//
// Interactive hero demo:
//   The hero card is a single real MCQ the visitor can answer. It mirrors the
//   actual lesson loop (pick -> check -> feedback -> retry) so a signed-out
//   visitor experiences the core product in a few seconds instead of reading
//   about it. State is local and resets on Try again; nothing is persisted and
//   there is no network call. Option 'b' is the correct answer. The per-option
//   "why this is wrong" lines come from landing.mock_why_*; the correct option
//   shows landing.mock_feedback_correct.
//
// Scroll-triggered animation (all opacity / stroke-dashoffset / count-up - no
// transform: scale, per project rule):
//   - heroReady drives the hero progress ring filling its dash offset and the
//     stat count-up. Set true shortly after mount (the hero is above the fold).
//   - An IntersectionObserver reveals the syllabus heatmap cells in a staggered
//     fade the first time the grid scrolls into view (revealHeatmap).
//   prefers-reduced-motion short-circuits both: everything renders in its final
//   state with no animation.

const { t } = useI18n();
const router = useRouter();
const auth = useAuthStore();
const locale = useLocaleStore();
const lp = useLocalePath();

// ---- Interactive hero demo state ----
const CORRECT_OPTION = 'b';
const selected = ref<string | null>(null);
const submitted = ref(false);

const options = [
  { key: 'a', label: 'landing.mock_opt_a' },
  { key: 'b', label: 'landing.mock_opt_b' },
  { key: 'c', label: 'landing.mock_opt_c' },
] as const;

const isCorrect = computed(() => selected.value === CORRECT_OPTION);

function pick(key: string) {
  if (submitted.value) return;
  selected.value = key;
}

function check() {
  if (!selected.value || submitted.value) return;
  submitted.value = true;
}

function retry() {
  submitted.value = false;
  selected.value = null;
}

// Per-option class after submit: green for the correct one, red for a wrong
// pick, muted for the rest. Before submit, only the selected option is lit.
function optionClass(key: string) {
  if (!submitted.value) {
    return selected.value === key ? 'is-selected' : '';
  }
  if (key === CORRECT_OPTION) return 'is-correct';
  if (key === selected.value) return 'is-wrong';
  return 'is-muted';
}

// ---- Animation flags ----
const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const heroReady = ref(false);
const revealHeatmap = ref(false);

// Count-up for the "minutes a day" figure. Target is 10 to match the copy.
const STAT_TARGET = 10;
const statCount = ref(prefersReducedMotion ? STAT_TARGET : 0);

// Progress ring geometry. r=22 circle; circumference drives the dash array.
// Final fill is ~68% of the syllabus, shown as the dash offset once heroReady.
const RING_R = 22;
const RING_CIRC = 2 * Math.PI * RING_R;
const RING_PCT = 0.68;
const ringOffset = computed(() =>
  heroReady.value ? RING_CIRC * (1 - RING_PCT) : RING_CIRC,
);
const ringPctLabel = computed(() => `${Math.round(RING_PCT * 100)}%`);

// ---- Syllabus heatmap (illustrative) ----
// 40 cells (8 cols x 5 rows) of fixed mastery buckets 0..4. Hand-set so the
// ramp reads as a believable spread of weak -> mastered topics; not derived
// from any user data. Used only as a static visual on the landing page.
const heatCells: number[] = [
  4, 3, 4, 2, 3, 1, 4, 2,
  3, 4, 2, 4, 1, 3, 2, 4,
  2, 3, 4, 3, 4, 2, 3, 1,
  4, 2, 3, 4, 2, 4, 3, 4,
  3, 4, 2, 3, 4, 3, 4, 2,
];

let statTimer: number | undefined;
let heatmapObserver: IntersectionObserver | undefined;

onMounted(() => {
  if (auth.isAuthenticated) {
    router.replace({ name: 'dashboard', params: { lang: locale.lang } });
    return;
  }

  if (prefersReducedMotion) {
    heroReady.value = true;
    revealHeatmap.value = true;
    return;
  }

  // Kick the hero animations just after paint so the ring/stat transition
  // from their start state rather than snapping.
  requestAnimationFrame(() => {
    heroReady.value = true;
  });

  // Count up to the target over ~900ms with an ease-out step.
  const duration = 900;
  const start = performance.now();
  const tick = (now: number) => {
    const elapsed = now - start;
    const p = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - p, 3);
    statCount.value = Math.round(eased * STAT_TARGET);
    if (p < 1) statTimer = requestAnimationFrame(tick);
  };
  statTimer = requestAnimationFrame(tick);

  // Reveal the heatmap the first time it enters the viewport.
  const grid = document.getElementById('landing-heatmap-grid');
  if (grid && 'IntersectionObserver' in window) {
    heatmapObserver = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            revealHeatmap.value = true;
            heatmapObserver?.disconnect();
          }
        }
      },
      { threshold: 0.25 },
    );
    heatmapObserver.observe(grid);
  } else {
    revealHeatmap.value = true;
  }
});

onBeforeUnmount(() => {
  if (statTimer) cancelAnimationFrame(statTimer);
  heatmapObserver?.disconnect();
});
</script>

<template>
  <main class="landing">
    <!-- Top bar: brand + theme switch + Sign-in. Mirrors a typical marketing
         site nav. Sticky like AppNav for the same reason - content scrolls
         under it. -->
    <header class="landing-nav">
      <div class="landing-nav-inner">
        <div class="brand">
          <div class="brand-mark"></div>
          <span>Finshark</span>
        </div>
        <div class="row" style="gap: 10px; align-items: center; margin: 0;">
          <ThemeSwitch />
          <RouterLink :to="lp(`/login`)" class="btn btn-ghost btn-sm">
            {{ t('common.sign_in') }}
          </RouterLink>
        </div>
      </div>
    </header>

    <!-- Hero - asymmetric two-column: copy on the left, a CSS product mock on
         the right. Collapses to a single column (copy first) on narrow
         screens. The soft radial behind the whole hero lifts both columns. -->
    <section class="landing-hero">
      <div class="landing-hero-grid landing-container">
        <div class="landing-hero-copy">
          <div class="landing-hero-eyebrow">{{ t('landing.eyebrow') }}</div>
          <h1 class="landing-hero-title">{{ t('landing.hero_title') }}</h1>
          <p class="landing-hero-sub">{{ t('landing.hero_sub') }}</p>
          <div class="landing-cta-row">
            <RouterLink :to="lp(`/login`)" class="btn btn-primary btn-lg">
              {{ t('landing.cta_primary') }}
            </RouterLink>
            <a href="#how" class="btn btn-ghost btn-lg">
              {{ t('landing.cta_secondary') }}
            </a>
          </div>
          <p class="landing-hero-foot dim text-sm">{{ t('landing.hero_foot') }}</p>
        </div>

        <!-- Product demo: a single interactive MCQ the visitor can answer. Real
             buttons, real state (pick -> check -> feedback -> retry), themed by
             the same tokens as the lesson UI. Not aria-hidden - it's a usable
             control, so it carries a label and live region for the result.
             Option B is correct. -->
        <div class="landing-hero-mock">
          <div class="landing-mock-card" role="group"
            :aria-label="t('landing.mock_topic')">
            <div class="landing-mock-head">
              <span class="landing-mock-topic">{{ t('landing.mock_topic') }}</span>
              <!-- Syllabus progress ring. Fills its dash offset once heroReady
                   flips (driven from the script). Decorative number inside. -->
              <span class="landing-mock-ring" :title="t('landing.mock_ring_label')"
                aria-hidden="true">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" :r="RING_R" stroke="var(--border)"
                    stroke-width="4" />
                  <circle class="landing-mock-ring-fill" cx="24" cy="24" :r="RING_R"
                    stroke="var(--accent)" stroke-width="4" stroke-linecap="round"
                    :stroke-dasharray="RING_CIRC" :stroke-dashoffset="ringOffset"
                    transform="rotate(-90 24 24)" />
                </svg>
                <span class="landing-mock-ring-num">{{ ringPctLabel }}</span>
              </span>
            </div>
            <p class="landing-mock-q">{{ t('landing.mock_question') }}</p>
            <div class="landing-mock-opts">
              <button v-for="opt in options" :key="opt.key" type="button"
                class="landing-mock-opt" :class="optionClass(opt.key)"
                :disabled="submitted" @click="pick(opt.key)">
                <span class="landing-mock-key">{{ opt.key.toUpperCase() }}</span>
                <span class="landing-mock-opt-text">{{ t(opt.label) }}</span>
                <!-- Tick on the correct option, cross on a wrong pick, after submit. -->
                <svg v-if="submitted && opt.key === CORRECT_OPTION" class="landing-mock-mark"
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 13l4 4L19 7" stroke="var(--success)" stroke-width="2.5"
                    stroke-linecap="round" stroke-linejoin="round" />
                </svg>
                <svg v-else-if="submitted && opt.key === selected" class="landing-mock-mark"
                  width="16" height="16" viewBox="0 0 24 24" fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 6l12 12M18 6L6 18" stroke="var(--danger)" stroke-width="2.5"
                    stroke-linecap="round" />
                </svg>
              </button>
            </div>

            <!-- Before submit: the Check button (disabled until a pick). -->
            <button v-if="!submitted" type="button"
              class="btn btn-primary btn-sm landing-mock-submit" :disabled="!selected"
              @click="check">
              {{ t('landing.mock_submit') }}
            </button>

            <!-- After submit: feedback line + (on correct) a streak chip and
                 Try again. aria-live so screen readers announce the result. -->
            <template v-else>
              <div class="landing-mock-feedback"
                :class="isCorrect ? 'is-correct' : 'is-wrong'" aria-live="polite">
                {{ isCorrect ? t('landing.mock_feedback_correct') : t('landing.mock_feedback_wrong') }}
              </div>
              <div class="landing-mock-after">
                <span v-if="isCorrect" class="landing-mock-streak">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2c1.5 3 5 4.5 5 9a5 5 0 0 1-10 0c0-1.5.5-2.5 1-3.5C8 9 9 11 10 11c1 0 1-2 0-4-.8-1.6 0-3.5 2-5Z"
                      fill="var(--coral)" />
                  </svg>
                  {{ t('landing.mock_streak', { n: 8 }) }}
                </span>
                <span v-else></span>
                <button type="button" class="btn btn-ghost btn-sm" @click="retry">
                  {{ t('landing.mock_retry') }}
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </section>

    <!-- "Why Finshark" - value block. Three cards, each with an inline SVG
         glyph (no emoji, no asset pipeline). Accent strip down the left edge
         keeps brand colour present. -->
    <section class="landing-why">
      <div class="landing-container">
        <h2 class="landing-section-title">{{ t('landing.why_title') }}</h2>
        <p class="landing-why-lede dim">{{ t('landing.why_lede') }}</p>
        <div class="landing-why-grid">
          <div class="landing-why-card">
            <div class="landing-glyph">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2" />
                <path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
                <circle cx="11" cy="11" r="2.5" fill="currentColor" />
              </svg>
            </div>
            <h3>{{ t('landing.why_1_title') }}</h3>
            <p class="dim">{{ t('landing.why_1_body') }}</p>
          </div>
          <div class="landing-why-card">
            <div class="landing-glyph">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" />
                <path d="M12 7v5l3.5 2" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
              </svg>
            </div>
            <h3>{{ t('landing.why_2_title') }}</h3>
            <p class="dim">{{ t('landing.why_2_body') }}</p>
          </div>
          <div class="landing-why-card">
            <div class="landing-glyph">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <h3>{{ t('landing.why_3_title') }}</h3>
            <p class="dim">{{ t('landing.why_3_body') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Syllabus heatmap (illustrative) - two-column block: copy + legend on
         the left, the mastery grid on the right. Cells are coloured by fixed
         buckets (heat-0..4) from the script's heatCells array; this is a
         static visual, not user data. Cells fade in staggered the first time
         the grid scrolls into view (revealHeatmap), unless reduced-motion is
         on, in which case they render in place. Copy reuses landing.activity_*
         and the legend reuses activity_less / activity_more. -->
    <section class="landing-heatmap">
      <div class="landing-container landing-heatmap-inner">
        <div class="landing-heatmap-copy">
          <h2 class="landing-section-title" style="text-align: left; margin-bottom: 16px;">
            {{ t('landing.activity_title') }}
          </h2>
          <p class="landing-heatmap-lede dim">{{ t('landing.activity_lede') }}</p>
          <div class="landing-heatmap-legend">
            <span class="dim text-sm">{{ t('landing.activity_less') }}</span>
            <span class="landing-heat-swatch heat-0"></span>
            <span class="landing-heat-swatch heat-1"></span>
            <span class="landing-heat-swatch heat-2"></span>
            <span class="landing-heat-swatch heat-3"></span>
            <span class="landing-heat-swatch heat-4"></span>
            <span class="dim text-sm">{{ t('landing.activity_more') }}</span>
          </div>
        </div>
        <div id="landing-heatmap-grid" class="landing-heatmap-grid"
          :class="{ 'is-revealed': revealHeatmap }" aria-hidden="true">
          <span v-for="(bucket, i) in heatCells" :key="i"
            class="landing-heat-cell" :class="`heat-${bucket}`"
            :style="{ transitionDelay: `${i * 14}ms` }"></span>
        </div>
      </div>
    </section>

    <!-- Features grid: 2x2 cards with inline SVG glyphs. -->
    <section class="landing-features">
      <div class="landing-container">
        <h2 class="landing-section-title">{{ t('landing.features_title') }}</h2>
        <div class="landing-features-grid">
          <div class="landing-feature">
            <div class="landing-glyph">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8Z" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </div>
            <h3>{{ t('landing.feature_1_title') }}</h3>
            <p class="dim">{{ t('landing.feature_1_body') }}</p>
          </div>
          <div class="landing-feature">
            <div class="landing-glyph">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2" />
                <circle cx="12" cy="12" r="5" stroke="currentColor" stroke-width="2" />
                <circle cx="12" cy="12" r="1.5" fill="currentColor" />
              </svg>
            </div>
            <h3>{{ t('landing.feature_2_title') }}</h3>
            <p class="dim">{{ t('landing.feature_2_body') }}</p>
          </div>
          <div class="landing-feature">
            <div class="landing-glyph">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 3c1.8 3.5 6 5.4 6 10.5a6 6 0 0 1-12 0C6 11 7 9.5 7.5 8 9 9.5 10 12 11 12c1.2 0 1.2-2.5 0-5-.9-1.9 0-3 1-4Z"
                  stroke="currentColor" stroke-width="2" stroke-linejoin="round" />
              </svg>
            </div>
            <h3>{{ t('landing.feature_3_title') }}</h3>
            <p class="dim">{{ t('landing.feature_3_body') }}</p>
          </div>
          <div class="landing-feature">
            <div class="landing-glyph">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="currentColor" stroke-width="2" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" fill="currentColor" />
              </svg>
            </div>
            <h3>{{ t('landing.feature_4_title') }}</h3>
            <p class="dim">{{ t('landing.feature_4_body') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works - 3 steps, numbered. Minimal copy on each. -->
    <section id="how" class="landing-steps">
      <div class="landing-container">
        <h2 class="landing-section-title">{{ t('landing.steps_title') }}</h2>
        <ol class="landing-steps-list">
          <li>
            <span class="landing-step-num">1</span>
            <div>
              <h3>{{ t('landing.step_1_title') }}</h3>
              <p class="dim">{{ t('landing.step_1_body') }}</p>
            </div>
          </li>
          <li>
            <span class="landing-step-num">2</span>
            <div>
              <h3>{{ t('landing.step_2_title') }}</h3>
              <p class="dim">{{ t('landing.step_2_body') }}</p>
            </div>
          </li>
          <li>
            <span class="landing-step-num">3</span>
            <div>
              <h3>{{ t('landing.step_3_title') }}</h3>
              <p class="dim">{{ t('landing.step_3_body') }}</p>
            </div>
          </li>
        </ol>
      </div>
    </section>

    <!-- FAQ - native <details>/<summary> for accordion behaviour. No JS,
         keyboard-accessible by default. Five Qs covering the sceptic's
         questions: textbook-relationship, scope, time, past-exam-Qs, sources. -->
    <section class="landing-faq">
      <div class="landing-container landing-faq-inner">
        <h2 class="landing-section-title">{{ t('landing.faq_title') }}</h2>
        <div class="landing-faq-list">
          <details class="landing-faq-item">
            <summary>{{ t('landing.faq_1_q') }}</summary>
            <p class="dim">{{ t('landing.faq_1_a') }}</p>
          </details>
          <details class="landing-faq-item">
            <summary>{{ t('landing.faq_2_q') }}</summary>
            <p class="dim">{{ t('landing.faq_2_a') }}</p>
          </details>
          <details class="landing-faq-item">
            <summary>{{ t('landing.faq_3_q') }}</summary>
            <p class="dim">{{ t('landing.faq_3_a') }}</p>
          </details>
          <details class="landing-faq-item">
            <summary>{{ t('landing.faq_4_q') }}</summary>
            <p class="dim">{{ t('landing.faq_4_a') }}</p>
          </details>
          <details class="landing-faq-item">
            <summary>{{ t('landing.faq_5_q') }}</summary>
            <p class="dim">{{ t('landing.faq_5_a') }}</p>
          </details>
        </div>
      </div>
    </section>

    <!-- Bottom CTA -->
    <section class="landing-cta-bottom">
      <div class="landing-container landing-cta-bottom-inner">
        <h2 class="landing-section-title" style="margin-bottom: 14px;">
          {{ t('landing.bottom_cta_title') }}
        </h2>
        <p class="dim" style="margin-bottom: 26px;">{{ t('landing.bottom_cta_sub') }}</p>
        <RouterLink :to="lp(`/login`)" class="btn btn-primary btn-lg">
          {{ t('landing.cta_primary') }}
        </RouterLink>
      </div>
    </section>

    <footer class="landing-foot">
      <div class="landing-container row" style="justify-content: space-between; gap: 16px; flex-wrap: wrap; margin: 0;">
        <div class="brand">
          <div class="brand-mark"></div>
          <span>Finshark</span>
        </div>
        <span class="dim text-xs">© Finshark</span>
      </div>
    </footer>
  </main>
</template>
