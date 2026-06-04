<script setup lang="ts">
import { onMounted } from 'vue';
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
// product mock is a pure-CSS lesson card (no image asset) whose labels also
// come from landing.* (mock_*).

const { t } = useI18n();
const router = useRouter();
const auth = useAuthStore();
const locale = useLocaleStore();
const lp = useLocalePath();

onMounted(() => {
  if (auth.isAuthenticated) {
    router.replace({ name: 'dashboard', params: { lang: locale.lang } });
  }
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

        <!-- Product mock: a single lesson card showing one answered MCQ. Pure
             markup + CSS, themed by the same tokens as the real lesson UI.
             aria-hidden because it's decorative - all real copy is in the
             left column. -->
        <div class="landing-hero-mock" aria-hidden="true">
          <div class="landing-mock-card">
            <div class="landing-mock-head">
              <span class="landing-mock-topic">{{ t('landing.mock_topic') }}</span>
              <span class="landing-mock-streak">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2c1.5 3 5 4.5 5 9a5 5 0 0 1-10 0c0-1.5.5-2.5 1-3.5C8 9 9 11 10 11c1 0 1-2 0-4-.8-1.6 0-3.5 2-5Z"
                    fill="var(--coral)" />
                </svg>
                7
              </span>
            </div>
            <p class="landing-mock-q">{{ t('landing.mock_question') }}</p>
            <div class="landing-mock-opts">
              <div class="landing-mock-opt">
                <span class="landing-mock-key">A</span>
                <span>{{ t('landing.mock_opt_a') }}</span>
              </div>
              <div class="landing-mock-opt is-correct">
                <span class="landing-mock-key">B</span>
                <span>{{ t('landing.mock_opt_b') }}</span>
                <svg class="landing-mock-tick" width="16" height="16" viewBox="0 0 24 24" fill="none"
                  xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 13l4 4L19 7" stroke="var(--success)" stroke-width="2.5" stroke-linecap="round"
                    stroke-linejoin="round" />
                </svg>
              </div>
              <div class="landing-mock-opt">
                <span class="landing-mock-key">C</span>
                <span>{{ t('landing.mock_opt_c') }}</span>
              </div>
            </div>
            <div class="landing-mock-feedback">{{ t('landing.mock_feedback') }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Stat band: three concrete numbers for credibility. Thin strip between
         hero and the why block. -->
    <section class="landing-stats">
      <div class="landing-container landing-stats-grid">
        <div class="landing-stat">
          <div class="landing-stat-value">{{ t('landing.stat_1_value') }}</div>
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
