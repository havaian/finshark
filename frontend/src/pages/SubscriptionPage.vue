<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { billingApi } from '../api/billing.api';
import { useEntitlementStore } from '../stores/entitlement.store';
import type { Subscription } from '../types/billing';
import AppNav from '../components/AppNav.vue';
import ClickPayPanel from '../components/ClickPayPanel.vue';
import SavedCardPanel from '../components/SavedCardPanel.vue';

// Dedicated billing surface. Previously this content was split between the
// Settings "Premium" section (the redeem widget + status line) and the Profile
// "Payments" section (the subscription history) - both cramped and hard to
// find. This page brings them together: current plan, redeem, and full billing
// history. Settings and Profile now link here instead of carrying the UI
// themselves.
//
// Data:
//   - entitlement store: current tier + ends_at (drives the plan card + chip).
//     Already fetched on app boot; we refetch after a redeem.
//   - GET /me/subscriptions: the billing history list. Lazy-loaded on mount,
//     non-fatal (the list just shows its empty state on failure).
//
// Note on "billing history": the product is promocode-driven (no card
// charges), so each history row is a subscription grant/redemption with its
// dates and how it was obtained, not an invoice with an amount. Same shape the
// admin per-user view uses, scoped server-side to the caller.

const { t } = useI18n();
const entitlement = useEntitlementStore();

// ── Billing history ────────────────────────────────────────────────────
const subscriptions = ref<Subscription[]>([]);
const subscriptionsLoading = ref(true);

// The subscription auto-renew applies to: the active one, which is also the
// only one with a future ends_at. An open-ended grant (lifetime, admin comp)
// has nothing to renew, so the toggle is hidden rather than shown disabled.
const activeSub = computed(() =>
  subscriptions.value.find((s) => s.status === 'active' && s.ends_at !== null) ?? null,
);

// ── Promocode redeem (moved verbatim from SettingsPage) ──────────────────
const redeemInput = ref('');
const redeemBusy = ref(false);
const redeemError = ref<string | null>(null);
const redeemSuccess = ref<string | null>(null);
let redeemSuccessTimer: number | null = null;

async function onRedeem() {
  const code = redeemInput.value.trim();
  if (!code || redeemBusy.value) return;
  redeemBusy.value = true;
  redeemError.value = null;
  redeemSuccess.value = null;
  try {
    const res = await billingApi.redeemPromocode(code);
    const endsAt = res.subscription.ends_at;
    const isLifetime = endsAt === null;
    const dateStr = endsAt ? new Date(endsAt).toLocaleDateString() : '';
    let msgKey: string;
    if (res.is_new_subscription) {
      msgKey = isLifetime ? 'settings.redeem_success_new_lifetime' : 'settings.redeem_success_new';
    } else {
      msgKey = isLifetime ? 'settings.redeem_success_extended_lifetime' : 'settings.redeem_success_extended';
    }
    redeemSuccess.value = t(msgKey, { date: dateStr });
    redeemInput.value = '';
    // Refresh chrome chips AND re-pull the history so the new row appears.
    await entitlement.fetch();
    await loadSubscriptions();
    if (redeemSuccessTimer) window.clearTimeout(redeemSuccessTimer);
    redeemSuccessTimer = window.setTimeout(() => {
      redeemSuccess.value = null;
    }, 6000);
  } catch (e) {
    redeemError.value = mapRedeemError(e);
  } finally {
    redeemBusy.value = false;
  }
}

function mapRedeemError(e: unknown): string {
  if (e instanceof AxiosError) {
    const status = e.response?.status;
    if (status === 404) return t('settings.redeem_error_invalid');
    if (status === 403) return t('settings.redeem_error_already_used');
    const msg = (e.response?.data as { message?: string | string[] })?.message;
    const flat = Array.isArray(msg) ? msg.join(', ') : msg;
    if (flat) return flat;
  }
  return t('settings.redeem_error_generic');
}

// ── Status lines (moved from SettingsPage) ───────────────────────────────
const premiumStatusLine = computed<string | null>(() => {
  const e = entitlement.entitlement;
  if (!e) return null;
  if (e.tier === 'free') return t('settings.premium_status_free');
  const planKey = `dashboard.premium_status.${e.plan_id}`;
  const localized = t(planKey);
  const planLabel = localized === planKey ? e.plan_id : localized;
  return t('settings.premium_status_premium', { plan: planLabel });
});

const premiumEndsLine = computed<string | null>(() => {
  const e = entitlement.entitlement;
  if (!e || e.tier !== 'premium') return null;
  if (e.ends_at === null) return t('settings.premium_lifetime');
  const date = new Date(e.ends_at).toLocaleDateString();
  return t('settings.premium_ends_at', { date });
});

// Resolve a plan id to a localized label (moved from ProfilePage). Falls back
// to the raw id so unknown plans still render.
function planNameFor(planId: string): string {
  const key = `profile.plan_name_${planId}`;
  const translated = t(key);
  return translated === key ? planId : translated;
}

async function loadSubscriptions() {
  subscriptionsLoading.value = true;
  try {
    subscriptions.value = await billingApi.getMySubscriptions();
  } catch {
    subscriptions.value = [];
  } finally {
    subscriptionsLoading.value = false;
  }
}

onMounted(() => {
  // Entitlement is usually already populated from boot, but refetch defensively
  // so a direct navigation here shows live status rather than a stale cache.
  if (!entitlement.entitlement) void entitlement.fetch();
  void loadSubscriptions();
});
</script>

<template>
  <main class="page">
    <AppNav />
    <div class="container">

      <header class="page-head">
        <h1>{{ t('subscription.title') }}</h1>
        <p class="dim">{{ t('subscription.subtitle') }}</p>
      </header>

      <!-- Current plan -->
      <section class="card">
        <header class="row" style="justify-content: space-between; align-items: center; gap: 12px;">
          <h2>{{ t('subscription.current_plan') }}</h2>
          <span v-if="entitlement.isPremium" class="pill pill-accent">{{ t('dashboard.premium_badge') }}</span>
          <span v-else-if="entitlement.isFree" class="pill pill-grey">{{ t('settings.premium_status_free') }}</span>
        </header>

        <div v-if="premiumStatusLine" class="mt-4" style="font-weight: 500;">{{ premiumStatusLine }}</div>
        <p v-if="premiumEndsLine" class="dim text-sm mt-1">{{ premiumEndsLine }}</p>
        <p v-else-if="entitlement.isFree" class="dim text-sm mt-1">{{ t('subscription.free_hint') }}</p>
      </section>

      <!-- Pay via Click. Self-contained panel: plan picker, both Click payment
           surfaces (hosted page + card overlay), and payment history. -->
      <ClickPayPanel />

      <!-- Saved card + automatic renewal -->
      <SavedCardPanel :can-auto-renew="activeSub !== null"
        :auto-renew-on="activeSub?.auto_renew ?? false" @changed="loadSubscriptions" />

      <!-- Redeem a code -->
      <section class="card mt-6">
        <h2>{{ t('subscription.redeem_section') }}</h2>
        <p class="dim text-sm mt-2">{{ t('subscription.redeem_section_sub') }}</p>

        <div class="mt-6">
          <label class="field-label">{{ t('settings.redeem_label') }}</label>
          <div class="row mt-2" style="gap: 8px; align-items: stretch;">
            <input v-model="redeemInput" type="text" :placeholder="t('settings.redeem_placeholder')"
              :disabled="redeemBusy" maxlength="64"
              style="flex: 1 1 220px; font-family: ui-monospace, monospace; letter-spacing: 0.04em; text-transform: lowercase;"
              @keydown.enter="onRedeem" />
            <button class="btn btn-primary" :disabled="redeemBusy || !redeemInput.trim()" @click="onRedeem">
              {{ redeemBusy ? t('settings.redeem_busy') : t('settings.redeem_btn') }}
            </button>
          </div>
          <p v-if="redeemError" class="error-text mt-2">{{ redeemError }}</p>
          <p v-if="redeemSuccess" class="mt-2" style="color: var(--success, #16a34a);">{{ redeemSuccess }}</p>
        </div>
      </section>

      <!-- Billing history -->
      <section class="card mt-6">
        <h2>{{ t('subscription.history_section') }}</h2>
        <p class="dim text-sm mt-2">{{ t('subscription.history_section_sub') }}</p>

        <p v-if="subscriptionsLoading" class="dim text-sm mt-4">{{ t('common.loading') }}</p>
        <p v-else-if="subscriptions.length === 0" class="dim text-sm mt-4">{{ t('subscription.history_empty') }}</p>
        <div v-else class="list-bordered mt-4">
          <div v-for="s in subscriptions" :key="s.id" class="list-row">
            <div style="display: flex; flex-direction: column; gap: 4px;">
              <div>
                <span style="font-weight: 500;">{{ planNameFor(s.plan_id) }}</span>
                <span :class="['pill', s.status === 'active' ? 'pill-accent' : 'pill-grey']" style="margin-left: 10px;">
                  {{ t(`admin.subscriptions.sub_status_${s.status}`) }}
                </span>
                <span class="dim text-xs" style="margin-left: 8px;">
                  · {{ t(`admin.subscriptions.sub_source_${s.source}`) }}
                </span>
              </div>
              <div class="dim text-xs">
                {{ t('admin.subscriptions.sub_starts', { date: new Date(s.starts_at).toLocaleDateString() }) }}
                <template v-if="s.ends_at">
                  · {{ t('admin.subscriptions.sub_ends', { date: new Date(s.ends_at).toLocaleDateString() }) }}
                </template>
                <template v-else>
                  · {{ t('admin.subscriptions.sub_ends_never') }}
                </template>
                <template v-if="s.cancelled_at">
                  · {{ t('admin.subscriptions.sub_cancelled_at', {
                    date: new Date(s.cancelled_at).toLocaleDateString(),
                  }) }}
                </template>
              </div>
            </div>
          </div>
        </div>
      </section>

    </div>
  </main>
</template>
