<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed, useTemplateRef } from 'vue';
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
// product mock is an interactive demo of one MCQ (no backend call - all
// client-side); the stat band counts up on scroll; the heatmap and progress
// ring are illustrative (static demo data, not real user state).

const { t } = useI18n();
const router = useRouter();
const auth = useAuthStore();
const locale = useLocaleStore();
const lp = useLocalePath();

// ---- Interactive hero demo ----
// One MCQ the visitor can actually answer. Option B is correct. State is local
// and resets via the "Try again" button. No network, no persistence - this is
// a taste of the lesson UI, not a real attempt.
interface DemoOption {
  key: string;
  labelKey: string;
  correct: boolean;
  whyKey?: string; // why-wrong explanation, shown only when this wrong option was picked
}

const demoOptions: DemoOption[] = [
  { key: 'A', labelKey: 'landing.mock_opt_a', correct: false, whyKey: 'landing.mock_why_a' },
  { key: 'B', labelKey: 'landing.mock_opt_b', correct: true },
  { key: 'C', labelKey: 'landing.mock_opt_c', correct: false, whyKey: 'landing.mock_why_c' },
];

const selectedKey = ref<string | null>(null);
const submitted = ref(false);
// Demo streak counter - bumps once when the visitor answers correctly, purely
// for the "this is rewarding" feel. Starts at 6 so a correct answer shows 7.
const demoStreak = ref(6);

const selectedOption = computed(() =>
  demoOptions.find((o) => o.key === selectedKey.value) ?? null
);
const isCorrect = computed(() => submitted.value && !!selectedOption.value?.correct);

function selectDemo(key: string) {
  if (submitted.value) return; // locked after submit
  selectedKey.value = key;
}

function submitDemo() {
  if (submitted.value || selectedKey.value === null) return;
  submitted.value = true;
  if (selectedOption.value?.correct) demoStreak.value += 1;
}

function resetDemo() {
  submitted.value = false;
  selectedKey.value = null;
  demoStreak.value = 6;
}

// Per-option state class for the template. Before submit: just "selected".
// After submit: the correct option goes green; a wrong picked option goes red;
// everything else dims.
function optionStateClass(o: DemoOption): string {
  if (!submitted.value) return selectedKey.value === o.key ? 'is-selected' : '';
  if (o.correct) return 'is-correct';
  if (selectedKey.value === o.key) return 'is-wrong';
  return 'is-muted';
}

// ---- Progress ring (hero mock header) ----
// SVG ring that animates from 0 to its target once the hero scrolls into view.
// Driven by stroke-dashoffset via a CSS transition (no transform: scale).
const RING_TARGET = 68; // percent - illustrative "syllabus covered" figure
const ringCircumference = 2 * Math.PI * 15; // r=15 in the SVG below
const ringVisible = ref(false);
const ringOffset = computed(() =>
  ringVisible.value
    ? ringCircumference * (1 - RING_TARGET / 100)
    : ringCircumference
);
const heroMock = useTemplateRef<HTMLElement>('heroMock');

// ---- Count-up stats ----
// Only the first stat is numeric (10). The other two are categorical strings
// (F1-F3, EN / RU) and render as-is. animatedTen counts 0->10 on scroll-in.
const animatedTen = ref(0);
const statsBand = useTemplateRef<HTMLElement>('statsBand');

function runCountUp(target: number, setter: (v: number) => void, durationMs = 900) {
  const start = performance.now();
  function frame(now: number) {
    const p = Math.min(1, (now - start) / durationMs);
    // easeOutCubic for a natural settle
    const eased = 1 - Math.pow(1 - p, 3);
    setter(Math.round(target * eased));
    if (p < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

// ---- Syllabus heatmap (illustrative) ----
// A small grid of LO mastery cells, coloured by bucket. Static demo data - it
// mirrors the real Progress page heatmap visually without claiming real
// numbers. Each cell gets a topic label + mastery for the hover tooltip.
interface HeatCell {
  topicKey: string;
  mastery: number; // 0-100
}
// 24 cells. Spread across buckets so the grid reads as "mixed progress".
const heatCells: HeatCell[] = [
  { topicKey: 'landing.heat_topic_1', mastery: 92 },
  { topicKey: 'landing.heat_topic_2', mastery: 78 },
  { topicKey: 'landing.heat_topic_3', mastery: 45 },
  { topicKey: 'landing.heat_topic_4', mastery: 12 },
  { topicKey: 'landing.heat_topic_5', mastery: 64 },
  { topicKey: 'landing.heat_topic_6', mastery: 88 },
  { topicKey: 'landing.heat_topic_7', mastery: 30 },
  { topicKey: 'landing.heat_topic_8', mastery: 56 },
  { topicKey: 'landing.heat_topic_1', mastery: 71 },
  { topicKey: 'landing.heat_topic_2', mastery: 0 },
  { topicKey: 'landing.heat_topic_3', mastery: 83 },
  { topicKey: 'landing.heat_topic_4', mastery: 39 },
  { topicKey: 'landing.heat_topic_5', mastery: 95 },
  { topicKey: 'landing.heat_topic_6', mastery: 22 },
  { topicKey: 'landing.heat_topic_7', mastery: 60 },
  { topicKey: 'landing.heat_topic_8', mastery: 74 },
  { topicKey: 'landing.heat_topic_1', mastery: 48 },
  { topicKey: 'landing.heat_topic_2', mastery: 18 },
  { topicKey: 'landing.heat_topic_3', mastery: 90 },
  { topicKey: 'landing.heat_topic_4', mastery: 52 },
  { topicKey: 'landing.heat_topic_5', mastery: 67 },
  { topicKey: 'landing.heat_topic_6', mastery: 7 },
  { topicKey: 'landing.heat_topic_7', mastery: 81 },
  { topicKey: 'landing.heat_topic_8', mastery: 35 },
];

// Map a mastery value to a bucket class. 5 buckets matching the Progress page
// language: none / low / mid / high / mastered.
function heatBucket(m: number): string {
  if (m <= 0) return 'heat-0';
  if (m < 34) return 'heat-1';
  if (m < 67) return 'heat-2';
  if (m < 90) return 'heat-3';
  return 'heat-4';
}

function heatTitle(cell: HeatCell): string {
  return `${t(cell.topicKey)} - ${cell.mastery}%`;
}

// ---- Scroll-triggered animation wiring ----
// One IntersectionObserver covers both the hero (ring) and the stat band
// (count-up). Each fires once. Falls back to immediately-on if IO is missing.
let observer: IntersectionObserver | null = null;

onMounted(() => {
  if (auth.isAuthenticated) {
    router.replace({ name: 'dashboard', params: { lang: locale.lang } });
    return;
  }

  const ring = heroMock.value;
  const stats = statsBand.value;

  if (typeof IntersectionObserver === 'undefined') {
    // No IO support - just show end states.
    ringVisible.value = true;
    animatedTen.value = 10;
    return;
  }

  observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        if (entry.target === ring) {
          ringVisible.value = true;
          observer?.unobserve(entry.target);
        } else if (entry.target === stats) {
          runCountUp(10, (v) => (animatedTen.value = v));
          observer?.unobserve(entry.target);
        }
      }
    },
    { threshold: 0.35 }
  );

  if (ring) observer.observe(ring);
  if (stats) observer.observe(stats);
});

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
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

        <!-- Product demo: one MCQ the visitor can actually answer. ref used by
             the IntersectionObserver to trigger the ring animation. Not
             aria-hidden - it's interactive, so it's real content now. -->
        <div class="landing-hero-mock" ref="heroMock">
          <div class="landing-mock-card">
            <div class="landing-mock-head">
              <span class="landing-mock-topic">{{ t('landing.mock_topic') }}</span>
              <span class="landing-mock-ring" :title="t('landing.mock_ring_label')">
                <svg width="38" height="38" viewBox="0 0 38 38" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="19" cy="19" r="15" fill="none" stroke="var(--border)" stroke-width="3" />
                  <circle class="landing-mock-ring-fill" cx="19" cy="19" r="15" fill="none" stroke="var(--accent)"
                    stroke-width="3" stroke-linecap="round"
                    :stroke-dasharray="ringCircumference" :stroke-dashoffset="ringOffset"
                    transform="rotate(-90 19 19)" />
                </svg>
                <span class="landing-mock-ring-num mono">{{ ringVisible ? RING_TARGET : 0 }}%</span>
              </span>
            </div>
            <p class="landing-mock-q">{{ t('landing.mock_question') }}</p>
            <div class="landing-mock-opts" role="group" :aria-label="t('landing.mock_question')">
              <button v-for="o in demoOptions" :key="o.key" type="button" class="landing-mock-opt"
                :class="optionStateClass(o)" :disabled="submitted" @click="selectDemo(o.key)">
                <span class="landing-mock-key">{{ o.key }}</span>
                <span class="landing-mock-opt-text">{{ t(o.labelKey) }}</span>
                <svg v-if="submitted && o.correct" class="landing-mock-mark" width="16" height="16"
                  viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 13l4 4L19 7" stroke="var(--success)" stroke-width="2.5" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
                <svg v-else-if="submitted && selectedKey === o.key" class="landing-mock-mark" width="16" height="16"
                  viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 6l12 12M18 6L6 18" stroke="var(--danger)" stroke-width="2.5" stroke-linecap="round" />
                </svg>
              </button>
            </div>

            <!-- Before submit: the submit button (disabled until a pick is made).
                 After submit: feedback + try-again. -->
            <button v-if="!submitted" type="button" class="btn btn-primary btn-block landing-mock-submit"
              :disabled="selectedKey === null" @click="submitDemo">
              {{ t('landing.mock_submit') }}
            </button>

            <template v-else>
              <div class="landing-mock-feedback" :class="isCorrect ? 'is-correct' : 'is-wrong'">
                <template v-if="isCorrect">{{ t('landing.mock_feedback_correct') }}</template>
                <template v-else>
                  {{ t('landing.mock_feedback_wrong') }}
                  <template v-if="selectedOption?.whyKey"> {{ t(selectedOption.whyKey) }}</template>
                </template>
              </div>
              <div class="landing-mock-after">
                <span class="landing-mock-streak" v-if="isCorrect">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2c1.5 3 5 4.5 5 9a5 5 0 0 1-10 0c0-1.5.5-2.5 1-3.5C8 9 9 11 10 11c1 0 1-2 0-4-.8-1.6 0-3.5 2-5Z"
                      fill="var(--coral)" />
                  </svg>
                  {{ t('landing.mock_streak', { n: demoStreak }) }}
                </span>
                <button type="button" class="btn btn-ghost btn-sm" @click="resetDemo">
                  {{ t('landing.mock_retry') }}
                </button>
              </div>
            </template>
          </div>
        </div>
      </div>
    </section>

    <!-- Stat band: three concrete numbers for credibility. Thin strip between
         hero and the why block. The first (numeric) stat counts up on
         scroll-in; the other two are categorical and render as-is. -->
    <section class="landing-stats" ref="statsBand">
      <div class="landing-container landing-stats-grid">
        <div class="landing-stat">
          <div class="landing-stat-value">
            {{ animatedTen }}<span class="landing-stat-unit"> {{ t('landing.stat_1_unit') }}</span>
          </div>
          <div class="landing-stat-label dim">{{ t('landing.stat_1_label') }}</div>
        </div>
        <div class="landing-stat">
          <div class="landing-stat-value">{{ t('landing.stat_2_value') }}</div>
          <div class="landing-stat-label dim">{{ t('landing.stat_2_label') }}</div>
        </div>
        <div class="landing-stat">
          <div class="landing-stat-value">{{ t('landing.stat_3_value') }}</div>
          <div class="landing-stat-label dim">{{ t('landing.stat_3_label') }}</div>
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

    <!-- Syllabus heatmap (illustrative). A grid of LO mastery cells coloured by
         bucket, mirroring the real Progress page. Hovering a cell shows its
         topic + mastery via the native title tooltip. Static demo data. -->
    <section class="landing-heatmap">
      <div class="landing-container landing-heatmap-inner">
        <div class="landing-heatmap-copy">
          <h2 class="landing-section-title" style="text-align: left; margin-bottom: 14px;">
            {{ t('landing.heat_title') }}
          </h2>
          <p class="dim landing-heatmap-lede">{{ t('landing.heat_lede') }}</p>
          <div class="landing-heatmap-legend">
            <span class="landing-heat-legend-item">
              <span class="landing-heat-swatch heat-1"></span>{{ t('landing.heat_legend_low') }}
            </span>
            <span class="landing-heat-legend-item">
              <span class="landing-heat-swatch heat-2"></span>{{ t('landing.heat_legend_mid') }}
            </span>
            <span class="landing-heat-legend-item">
              <span class="landing-heat-swatch heat-4"></span>{{ t('landing.heat_legend_high') }}
            </span>
          </div>
        </div>
        <div class="landing-heatmap-grid" role="list" :aria-label="t('landing.heat_title')">
          <span v-for="(cell, i) in heatCells" :key="i" class="landing-heat-cell" :class="heatBucket(cell.mastery)"
            role="listitem" :title="heatTitle(cell)" :aria-label="heatTitle(cell)"></span>
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
