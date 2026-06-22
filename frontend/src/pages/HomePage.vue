<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../stores/auth.store';
import { useLocaleStore } from '../stores/locale.store';
import { useLocalePath } from '../router/useLocalePath';
import ThemeSwitch from '../components/ThemeSwitch.vue';
import LangPicker from '../components/LangPicker.vue';

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
// Scroll-triggered animation (all opacity / stroke-dashoffset - no
// transform: scale, per project rule):
//   - heroReady drives the hero progress ring filling its dash offset. Set
//     true shortly after mount (the hero is above the fold).
//   - An IntersectionObserver reveals the lite activity heatmap the first time
//     it scrolls into view (revealHeatmap).
//   prefers-reduced-motion short-circuits both: everything renders in its
//   final state with no animation.

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

// Progress ring geometry. r=22 circle; circumference drives the dash array.
// Final fill is ~68% of the syllabus, shown as the dash offset once heroReady.
const RING_R = 22;
const RING_CIRC = 2 * Math.PI * RING_R;
const RING_PCT = 0.68;
const ringOffset = computed(() =>
  heroReady.value ? RING_CIRC * (1 - RING_PCT) : RING_CIRC,
);
const ringPctLabel = computed(() => `${Math.round(RING_PCT * 100)}%`);

// ---- Lite activity heatmap (illustrative) ----
// A small version of the real Profile heatmap (ProfilePage.vue): same column =
// one week, 7 cells per column (Sun..Sat), intensity 0..4 keyed off a daily
// question count. The real one fetches 365 days of activity; here we generate
// ~14 weeks of plausible study counts from a fixed seed so the visual is
// stable across renders and identical in every language. Not user data.
//
// We reuse the real CSS classes (.activity-heatmap / .activity-col /
// .activity-cell / .intensity-N) and the same intensity thresholds, so this
// reads as a true lite version rather than a separate widget. Weekday labels
// (Mon/Wed/Fri) and the tooltip mirror the real component.
interface LiteCell { date: string; count: number; intensity: 0 | 1 | 2 | 3 | 4 }

const LITE_WEEKS = 14;

// Deterministic pseudo-random in [0,1) from an integer seed. Keeps the
// generated counts identical on every render without pulling in a dep.
function seeded(n: number): number {
  const x = Math.sin(n * 99.13) * 43758.5453;
  return x - Math.floor(x);
}

const liteWeeks = computed<LiteCell[][]>(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Start on the Sunday on/before (today - (LITE_WEEKS-1) weeks), so the last
  // column is the current week - same anchoring as the real heatmap.
  const start = new Date(today);
  start.setDate(start.getDate() - 7 * (LITE_WEEKS - 1));
  start.setDate(start.getDate() - start.getDay());

  const cursor = new Date(start);
  const weeks: LiteCell[][] = [];
  let i = 0;
  for (let w = 0; w < LITE_WEEKS; w++) {
    const week: LiteCell[] = [];
    for (let d = 0; d < 7; d++) {
      // Future days (past today) render empty, like the real grid.
      let count = 0;
      if (cursor <= today) {
        const r = seeded(i);
        // ~30% rest days, the rest spread across 1..18 questions, weighted low.
        count = r < 0.3 ? 0 : Math.round(1 + Math.pow(r, 1.6) * 17);
      }
      const intensity =
        count === 0 ? 0 :
          count < 3 ? 1 :
            count < 8 ? 2 :
              count < 16 ? 3 : 4;
      week.push({
        date: cursor.toISOString().slice(0, 10),
        count,
        intensity,
      });
      cursor.setDate(cursor.getDate() + 1);
      i++;
    }
    weeks.push(week);
  }
  return weeks;
});

const weekdayLabels = computed(() => ({
  mon: t('profile.heatmap_day_mon'),
  wed: t('profile.heatmap_day_wed'),
  fri: t('profile.heatmap_day_fri'),
}));

// Tooltip state for the lite heatmap. Mirrors the real component: hovering a
// cell stores it + a position relative to the wrap; mouseleave clears.
const hoverCell = ref<LiteCell | null>(null);
const hoverPos = ref<{ x: number; y: number } | null>(null);
const liteWrap = ref<HTMLElement | null>(null);

function onCellEnter(cell: LiteCell, ev: MouseEvent) {
  hoverCell.value = cell;
  if (!liteWrap.value) return;
  const wrapRect = liteWrap.value.getBoundingClientRect();
  const target = ev.currentTarget as HTMLElement;
  const cellRect = target.getBoundingClientRect();
  hoverPos.value = {
    x: cellRect.left - wrapRect.left + cellRect.width / 2,
    y: cellRect.top - wrapRect.top,
  };
}

function onCellLeave() {
  hoverCell.value = null;
  hoverPos.value = null;
}

// ---- Mock-results demo ----
// A finished mock shown the way the real Mock review screen shows it: a score,
// a list of answered questions each marked correct/wrong, and a worked
// explanation revealed under the wrong one. Static illustrative content - the
// question/answer/explanation text all live in landing.demo_*.
//
// Each item references its i18n keys. `correct` drives the mark + colour;
// `explainKey` (present only on wrong answers) is what expands. Tracking the
// open item by id lets the user toggle the explanation, matching the real
// "Show explanations" affordance.
interface DemoQuestion {
  id: string;
  questionKey: string;
  yourKey: string;
  correct: boolean;
  correctKey?: string;
  explainKey?: string;
}

const demoQuestions: DemoQuestion[] = [
  { id: 'q1', questionKey: 'landing.demo_q1', yourKey: 'landing.demo_q1_your', correct: true },
  {
    id: 'q2', questionKey: 'landing.demo_q2', yourKey: 'landing.demo_q2_your',
    correct: false, correctKey: 'landing.demo_q2_correct', explainKey: 'landing.demo_q2_explain',
  },
  { id: 'q3', questionKey: 'landing.demo_q3', yourKey: 'landing.demo_q3_your', correct: true },
];

const openDemo = ref<string | null>(null);
function toggleDemo(id: string) {
  openDemo.value = openDemo.value === id ? null : id;
}

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

  // Kick the hero ring animation just after paint so it transitions from its
  // start state rather than snapping.
  requestAnimationFrame(() => {
    heroReady.value = true;
  });

  // Reveal the heatmap the first time it enters the viewport.
  const grid = document.getElementById('landing-lite-heatmap');
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
          <LangPicker />
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
          <div class="landing-mock-card" role="group" :aria-label="t('landing.mock_topic')">
            <div class="landing-mock-head">
              <span class="landing-mock-topic">{{ t('landing.mock_topic') }}</span>
              <!-- Syllabus progress ring. Fills its dash offset once heroReady
                   flips (driven from the script). Decorative number inside. -->
              <span class="landing-mock-ring" :title="t('landing.mock_ring_label')" aria-hidden="true">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" :r="RING_R" stroke="var(--border)" stroke-width="4" />
                  <circle class="landing-mock-ring-fill" cx="24" cy="24" :r="RING_R" stroke="var(--accent)"
                    stroke-width="4" stroke-linecap="round" :stroke-dasharray="RING_CIRC"
                    :stroke-dashoffset="ringOffset" transform="rotate(-90 24 24)" />
                </svg>
                <span class="landing-mock-ring-num">{{ ringPctLabel }}</span>
              </span>
            </div>
            <p class="landing-mock-q">{{ t('landing.mock_question') }}</p>
            <div class="landing-mock-opts">
              <button v-for="opt in options" :key="opt.key" type="button" class="landing-mock-opt"
                :class="optionClass(opt.key)" :disabled="submitted" @click="pick(opt.key)">
                <span class="landing-mock-key">{{ opt.key.toUpperCase() }}</span>
                <span class="landing-mock-opt-text">{{ t(opt.label) }}</span>
                <!-- Tick on the correct option, cross on a wrong pick, after submit. -->
                <svg v-if="submitted && opt.key === CORRECT_OPTION" class="landing-mock-mark" width="16" height="16"
                  viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 13l4 4L19 7" stroke="var(--success)" stroke-width="2.5" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
                <svg v-else-if="submitted && opt.key === selected" class="landing-mock-mark" width="16" height="16"
                  viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 6l12 12M18 6L6 18" stroke="var(--danger)" stroke-width="2.5" stroke-linecap="round" />
                </svg>
              </button>
            </div>

            <!-- Before submit: the Check button (disabled until a pick). -->
            <button v-if="!submitted" type="button" class="btn btn-primary btn-sm landing-mock-submit"
              :disabled="!selected" @click="check">
              {{ t('landing.mock_submit') }}
            </button>

            <!-- After submit: feedback line + (on correct) a streak chip and
                 Try again. aria-live so screen readers announce the result. -->
            <template v-else>
              <div class="landing-mock-feedback" :class="isCorrect ? 'is-correct' : 'is-wrong'" aria-live="polite">
                {{ isCorrect ? t('landing.mock_feedback_correct') : t('landing.mock_feedback_wrong') }}
              </div>
              <div class="landing-mock-after">
                <span v-if="isCorrect" class="landing-mock-streak">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                      d="M12 2c1.5 3 5 4.5 5 9a5 5 0 0 1-10 0c0-1.5.5-2.5 1-3.5C8 9 9 11 10 11c1 0 1-2 0-4-.8-1.6 0-3.5 2-5Z"
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

    <!-- Activity heatmap (lite) - a small version of the real Profile heatmap.
         Reuses the .activity-* classes and intensity ramp; data is generated
         in the script (liteWeeks) as ~14 weeks of plausible study counts, not
         user data. Two columns: copy + legend on the left, the calendar on the
         right. Cells fade in together once the block scrolls into view
         (revealHeatmap), and hovering a cell shows the same date+count tooltip
         as the real one. --heat-cell / --heat-gap size the grid via the
         existing CSS. -->
    <section class="landing-heatmap">
      <div class="landing-container landing-heatmap-inner">
        <div class="landing-heatmap-copy">
          <h2 class="landing-section-title" style="text-align: left; margin-bottom: 16px;">
            {{ t('landing.activity_title') }}
          </h2>
          <p class="landing-heatmap-lede dim">{{ t('landing.activity_lede') }}</p>
          <div class="landing-heatmap-legend">
            <span class="dim text-sm">{{ t('landing.activity_less') }}</span>
            <span class="landing-heat-swatch activity-cell intensity-0"></span>
            <span class="landing-heat-swatch activity-cell intensity-1"></span>
            <span class="landing-heat-swatch activity-cell intensity-2"></span>
            <span class="landing-heat-swatch activity-cell intensity-3"></span>
            <span class="landing-heat-swatch activity-cell intensity-4"></span>
            <span class="dim text-sm">{{ t('landing.activity_more') }}</span>
          </div>
        </div>

        <!-- Heatmap card: weekday gutter (Mon/Wed/Fri) + the week columns.
             --heat-cell/--heat-gap set the cell size. The whole grid reveals
             with one fade via .is-revealed on the wrap. -->
        <div ref="liteWrap" id="landing-lite-heatmap" class="landing-lite-wrap activity-heatmap-wrap"
          :class="{ 'is-revealed': revealHeatmap }" :style="{ '--heat-cell': '15px', '--heat-gap': '4px' }">
          <div class="activity-body">
            <div class="activity-weekdays landing-lite-weekdays">
              <span class="activity-weekday" :style="{ top: '15px' }">{{ weekdayLabels.mon }}</span>
              <span class="activity-weekday" :style="{ top: '53px' }">{{ weekdayLabels.wed }}</span>
              <span class="activity-weekday" :style="{ top: '91px' }">{{ weekdayLabels.fri }}</span>
            </div>
            <div class="activity-heatmap landing-lite-grid">
              <div v-for="(week, wi) in liteWeeks" :key="wi" class="activity-col">
                <div v-for="cell in week" :key="cell.date" :class="['activity-cell', `intensity-${cell.intensity}`]"
                  @mouseenter="onCellEnter(cell, $event)" @mouseleave="onCellLeave"></div>
              </div>
            </div>
          </div>

          <!-- Floating tooltip, same shape as the real heatmap's. -->
          <div v-if="hoverCell && hoverPos" class="activity-tooltip"
            :style="{ left: hoverPos.x + 'px', top: hoverPos.y + 'px' }">
            <div class="activity-tooltip-count">
              <template v-if="hoverCell.count === 0">{{ t('profile.heatmap_tooltip_none') }}</template>
              <template v-else-if="hoverCell.count === 1">
                {{ t('profile.heatmap_tooltip_count_one', { count: hoverCell.count }) }}
              </template>
              <template v-else>
                {{ t('profile.heatmap_tooltip_count_other', { count: hoverCell.count }) }}
              </template>
            </div>
            <div class="activity-tooltip-date dim">{{ hoverCell.date }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Mock-results demo - a finished mock shown the way the real Mock review
         screen shows it: a score header, then a list of answered questions
         each marked correct/wrong. The wrong one expands to a worked
         explanation (toggled via openDemo). All copy from landing.demo_*;
         static illustrative content, not a real attempt. -->
    <section class="landing-demo">
      <div class="landing-container landing-demo-inner">
        <div class="landing-demo-copy">
          <h2 class="landing-section-title" style="text-align: left; margin-bottom: 16px;">
            {{ t('landing.demo_title') }}
          </h2>
          <p class="landing-demo-lede dim">{{ t('landing.demo_lede') }}</p>
        </div>

        <div class="landing-demo-card">
          <!-- Score header -->
          <div class="landing-demo-score">
            <span class="landing-demo-score-label dim">{{ t('landing.demo_score_label') }}</span>
            <span class="landing-demo-score-value">{{ t('landing.demo_score_value') }}</span>
          </div>

          <!-- Question rows -->
          <ul class="landing-demo-list">
            <li v-for="q in demoQuestions" :key="q.id" class="landing-demo-item"
              :class="q.correct ? 'is-correct' : 'is-wrong'">
              <div class="landing-demo-q">
                <span class="landing-demo-mark" :class="q.correct ? 'is-correct' : 'is-wrong'" aria-hidden="true">
                  <svg v-if="q.correct" width="14" height="14" viewBox="0 0 24 24" fill="none"
                    xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                  <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" />
                  </svg>
                </span>
                <span class="landing-demo-q-text">{{ t(q.questionKey) }}</span>
              </div>

              <!-- Answer lines. Correct: your answer only. Wrong: your answer
                   (struck/red) + the correct answer. -->
              <div class="landing-demo-answers">
                <div class="landing-demo-answer">
                  <span class="landing-demo-answer-label dim">{{ t('landing.demo_your_answer') }}</span>
                  <span class="landing-demo-answer-val" :class="q.correct ? 'is-correct' : 'is-wrong'">{{ t(q.yourKey)
                    }}</span>
                </div>
                <div v-if="!q.correct && q.correctKey" class="landing-demo-answer">
                  <span class="landing-demo-answer-label dim">{{ t('landing.demo_correct_answer') }}</span>
                  <span class="landing-demo-answer-val is-right">{{ t(q.correctKey) }}</span>
                </div>
              </div>

              <!-- Explanation toggle - only on wrong answers. -->
              <template v-if="!q.correct && q.explainKey">
                <button type="button" class="landing-demo-explain-btn" :aria-expanded="openDemo === q.id"
                  @click="toggleDemo(q.id)">
                  {{ openDemo === q.id ? t('landing.demo_hide_explanation') : t('landing.demo_show_explanation') }}
                  <svg class="landing-demo-chevron" :class="{ 'is-open': openDemo === q.id }" width="14" height="14"
                    viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                      stroke-linejoin="round" />
                  </svg>
                </button>
                <p v-if="openDemo === q.id" class="landing-demo-explain dim">
                  {{ t(q.explainKey) }}
                </p>
              </template>
            </li>
          </ul>
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
                <path d="M13 2L4 14h7l-1 8 9-12h-7l1-8Z" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                  stroke-linejoin="round" />
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
                <path
                  d="M12 3c1.8 3.5 6 5.4 6 10.5a6 6 0 0 1-12 0C6 11 7 9.5 7.5 8 9 9.5 10 12 11 12c1.2 0 1.2-2.5 0-5-.9-1.9 0-3 1-4Z"
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