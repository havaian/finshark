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
// Content uses i18n keys under landing.* so EN/RU swap cleanly.

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
        <div class="row" style="gap: 10px; align-items: center;">
          <ThemeSwitch />
          <RouterLink :to="lp(`/login`)" class="btn btn-ghost btn-sm">
            {{ t('common.sign_in') }}
          </RouterLink>
        </div>
      </div>
    </header>

    <!-- Hero -->
    <section class="landing-hero">
      <div class="landing-container">
        <div class="landing-hero-eyebrow">{{ t('landing.eyebrow') }}</div>
        <h1 class="landing-hero-title">{{ t('landing.hero_title') }}</h1>
        <p class="landing-hero-sub">{{ t('landing.hero_sub') }}</p>
        <div class="landing-cta-row">
          <RouterLink :to="lp(`/login`)" class="btn btn-primary btn-lg">
            {{ t('landing.cta_primary') }}
          </RouterLink>
          <a href="#features" class="btn btn-ghost btn-lg">
            {{ t('landing.cta_secondary') }}
          </a>
        </div>
        <p class="landing-hero-foot dim text-sm">{{ t('landing.hero_foot') }}</p>
      </div>
    </section>

    <!-- "Why Finshark" - brand/manifesto block. Sits between hero and features
         so the reader gets the *why* before the *what*. Three short cards;
         shark metaphor stays controlled (smell/sense, not aggression). -->
    <section class="landing-why">
      <div class="landing-container">
        <h2 class="landing-section-title">{{ t('landing.why_title') }}</h2>
        <p class="landing-why-lede dim">{{ t('landing.why_lede') }}</p>
        <div class="landing-why-grid">
          <div class="landing-why-card">
            <h3>{{ t('landing.why_1_title') }}</h3>
            <p class="dim">{{ t('landing.why_1_body') }}</p>
          </div>
          <div class="landing-why-card">
            <h3>{{ t('landing.why_2_title') }}</h3>
            <p class="dim">{{ t('landing.why_2_body') }}</p>
          </div>
          <div class="landing-why-card">
            <h3>{{ t('landing.why_3_title') }}</h3>
            <p class="dim">{{ t('landing.why_3_body') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Features grid: 3 cards. Kept minimal - emoji-style icons (no asset
         pipeline) and one-line headlines. -->
    <section id="features" class="landing-features">
      <div class="landing-container">
        <h2 class="landing-section-title">{{ t('landing.features_title') }}</h2>
        <div class="landing-features-grid">
          <div class="landing-feature">
            <div class="landing-feature-icon">⚡</div>
            <h3>{{ t('landing.feature_1_title') }}</h3>
            <p class="dim">{{ t('landing.feature_1_body') }}</p>
          </div>
          <div class="landing-feature">
            <div class="landing-feature-icon">🎯</div>
            <h3>{{ t('landing.feature_2_title') }}</h3>
            <p class="dim">{{ t('landing.feature_2_body') }}</p>
          </div>
          <div class="landing-feature">
            <div class="landing-feature-icon">🔥</div>
            <h3>{{ t('landing.feature_3_title') }}</h3>
            <p class="dim">{{ t('landing.feature_3_body') }}</p>
          </div>
          <div class="landing-feature">
            <div class="landing-feature-icon">📊</div>
            <h3>{{ t('landing.feature_4_title') }}</h3>
            <p class="dim">{{ t('landing.feature_4_body') }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How it works - 3 steps, numbered. Minimal copy on each. -->
    <section class="landing-steps">
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
         questions: not-a-textbook, scope, time, past-exam-Qs, sources. -->
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
      <div class="landing-container" style="text-align: center;">
        <h2 class="landing-section-title">{{ t('landing.bottom_cta_title') }}</h2>
        <p class="dim" style="margin-bottom: 22px;">{{ t('landing.bottom_cta_sub') }}</p>
        <RouterLink :to="lp(`/login`)" class="btn btn-primary btn-lg">
          {{ t('landing.cta_primary') }}
        </RouterLink>
      </div>
    </section>

    <footer class="landing-foot">
      <div class="landing-container row" style="justify-content: space-between; gap: 16px; flex-wrap: wrap;">
        <div class="brand">
          <div class="brand-mark"></div>
          <span>Finshark</span>
        </div>
        <span class="dim text-xs">© Finshark</span>
      </div>
    </footer>
  </main>
</template>