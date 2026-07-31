<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { AxiosError } from 'axios';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { clickApi, loadClickCheckoutJs } from '../api/click.api';
import { useLocaleStore } from '../stores/locale.store';
import type { Plan } from '../types/billing';
import type { ClickCheckoutHandle, ClickOrder } from '../types/click';

// Click payment panel, embedded in SubscriptionPage. Replaces the retired P2P
// card-transfer panel.
//
// Click asks integrators to offer BOTH of their payment surfaces, so there are
// two buttons over one order:
//
//   1. "Pay with Click" - redirects to my.click.uz. Works for Click account
//      holders (invoice to their app) and, on the same page, for people with no
//      Click account. Comes back to the return route via return_url.
//   2. "Pay by card" - Click's checkout.js overlay. Uzcard/Humo entered in a
//      modal over our page, no redirect at all. Card details never touch us.
//
// Both create the same click_orders row first and pass the same
// merchant_trans_id, so the backend cannot tell (and does not care) which was
// used.
//
// Nothing here grants premium. The subscription appears when Click's Complete
// callback reaches our server, which is why the overlay path polls afterwards
// instead of trusting the status the overlay reports.

const { t } = useI18n();
const router = useRouter();
const locale = useLocaleStore();

// ── Load ─────────────────────────────────────────────────────────────────
const plans = ref<Plan[]>([]);
const enabled = ref(false);
const checkoutJsUrl = ref<string>('');
const loading = ref(true);
const loadError = ref<string | null>(null);

const selectedPlanId = ref<string | null>(null);


async function loadAll() {
  loading.value = true;
  loadError.value = null;
  try {
    const [cfg, p] = await Promise.all([
      clickApi.config(),
      clickApi.listPlans(),
    ]);
    enabled.value = cfg.enabled;
    checkoutJsUrl.value = cfg.checkout_js_url;
    plans.value = p;
    if (p.length > 0 && selectedPlanId.value === null) {
      selectedPlanId.value = p[0].id;
    }
    // Warm the overlay script now rather than on click, so pressing the card
    // button opens the modal immediately. Failure is non-fatal - the button
    // retries the load and the redirect button is unaffected.
    if (enabled.value && cfg.checkout_js_url) {
      void loadClickCheckoutJs(cfg.checkout_js_url).catch(() => {
        /* handled when the button is actually pressed */
      });
    }
  } catch {
    loadError.value = t('click.load_error');
  } finally {
    loading.value = false;
  }
}

onMounted(loadAll);

const selectedPlan = computed<Plan | null>(
  () => plans.value.find((p) => p.id === selectedPlanId.value) ?? null
);

// price_minor is in tiyin (x100). Group digits, no forced decimals - UZS
// prices are whole sums in practice.
function formatPrice(minor: number | null, currency: string | null): string {
  if (minor === null || currency === null) return '';
  const grouped = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(minor / 100);
  return `${grouped} ${currency}`;
}

function planLabel(p: Plan): string {
  if (p.period_days === null) return t('click.plan_lifetime');
  if (p.period_days === 30) return t('click.plan_monthly');
  if (p.period_days === 365) return t('click.plan_yearly');
  return t('click.plan_days', { n: p.period_days });
}

// ── Payment ──────────────────────────────────────────────────────────────
type PayMode = 'redirect' | 'card';

const busyMode = ref<PayMode | null>(null);
const payError = ref<string | null>(null);

const canPay = computed(
  () => enabled.value && !!selectedPlanId.value && busyMode.value === null
);

async function createOrder(): Promise<ClickCheckoutHandle | null> {
  if (!selectedPlanId.value) return null;
  try {
    return await clickApi.createOrder(selectedPlanId.value);
  } catch (e) {
    payError.value = mapPayError(e);
    return null;
  }
}

// Button 1: leave the page for Click's hosted payment page. return_url is baked
// into pay_url by the backend, so the user lands back on our return route.
async function payWithRedirect() {
  if (!canPay.value) return;
  busyMode.value = 'redirect';
  payError.value = null;
  const handle = await createOrder();
  if (!handle) {
    busyMode.value = null;
    return;
  }
  // Full navigation, not a router push - this leaves the SPA entirely.
  window.location.href = handle.pay_url;
}

// Button 2: open Click's overlay in place.
async function payWithCard() {
  if (!canPay.value) return;
  busyMode.value = 'card';
  payError.value = null;

  try {
    await loadClickCheckoutJs(checkoutJsUrl.value);
  } catch {
    payError.value = t('click.checkout_js_error');
    busyMode.value = null;
    return;
  }
  if (typeof window.createPaymentRequest !== 'function') {
    payError.value = t('click.checkout_js_error');
    busyMode.value = null;
    return;
  }

  const handle = await createOrder();
  if (!handle) {
    busyMode.value = null;
    return;
  }

  window.createPaymentRequest(
    {
      service_id: Number(handle.service_id),
      merchant_id: Number(handle.merchant_id),
      amount: Number(handle.amount),
      transaction_param: handle.merchant_trans_id,
    },
    (data) => {
      busyMode.value = null;
      // status: <0 error, 0 created, 1 processing, 2 paid.
      //
      // Even at status 2 we do NOT show success here. That code means Click's
      // side completed; premium exists only once their Complete callback has
      // reached our server and granted it. So on any non-error close we hand off
      // to the SAME return page the redirect button lands on - it polls the
      // order until the callback settles and shows one unified confirmation
      // screen with the coverage dates. A hard error stays in place so the user
      // can retry without losing the panel.
      if (data.status < 0) {
        payError.value = t('click.payment_failed');
        return;
      }
      void router.push({
        name: 'click-return',
        params: { lang: locale.lang },
        query: { order: handle.order_id },
      });
    }
  );
}

function mapPayError(e: unknown): string {
  if (e instanceof AxiosError) {
    const status = e.response?.status;
    if (status === 409) return t('click.already_lifetime');
    if (status === 503) return t('click.unavailable');
    const msg = (e.response?.data as { message?: string | string[] })?.message;
    const flat = Array.isArray(msg) ? msg.join(', ') : msg;
    if (flat) return flat;
  }
  return t('click.pay_error_generic');
}

// ── History ──────────────────────────────────────────────────────────────
const myOrders = ref<ClickOrder[]>([]);

async function loadMyOrders() {
  try {
    myOrders.value = await clickApi.listMyOrders();
  } catch {
    myOrders.value = [];
  }
}

onMounted(loadMyOrders);

// Only settled orders are worth showing. 'created' rows accumulate every time
// someone opens a payment surface and changes their mind; listing them would
// make abandoned checkouts look like failed payments.
const visibleOrders = computed(() =>
  myOrders.value.filter((o) => o.status !== 'created')
);

function statusPillClass(status: ClickOrder['status']): string {
  if (status === 'paid') return 'pill pill-green';
  if (status === 'cancelled' || status === 'failed') return 'pill pill-red';
  return 'pill pill-amber';
}
</script>

<template>
  <div class="card mt-6">
    <h2 class="text-lg">{{ t('click.title') }}</h2>
    <p class="dim text-sm mt-1">{{ t('click.subtitle') }}</p>

    <p v-if="loading" class="dim text-sm mt-4">{{ t('common.loading') }}</p>
    <p v-else-if="loadError" class="error-text mt-4">{{ loadError }}</p>

    <template v-else>
      <p v-if="!enabled" class="dim text-sm mt-4">{{ t('click.unavailable') }}</p>

      <template v-else-if="plans.length === 0">
        <p class="dim text-sm mt-4">{{ t('click.no_plans') }}</p>
      </template>

      <template v-else>
        <!-- 1. Plan picker -->
        <label class="field-label mt-4">{{ t('click.choose_plan') }}</label>
        <div class="segmented click-plan-picker">
          <button v-for="p in plans" :key="p.id" type="button" :class="{ active: selectedPlanId === p.id }"
            @click="selectedPlanId = p.id">
            {{ planLabel(p) }}
          </button>
        </div>
        <p v-if="selectedPlan" class="click-price mt-2">
          {{ formatPrice(selectedPlan.price_minor, selectedPlan.currency) }}
        </p>

        <p v-if="payError" class="error-text mt-4">{{ payError }}</p>

        <!-- 2. Both payment surfaces. Click asks integrators to offer both. -->
        <div class="click-buttons mt-4">
          <button type="button" class="btn btn-primary click-btn" :disabled="!canPay" @click="payWithRedirect">
            {{ busyMode === 'redirect' ? t('click.opening') : t('click.pay_with_click') }}
          </button>
          <button type="button" class="btn click-btn click-btn-card" :disabled="!canPay" @click="payWithCard">
            {{ busyMode === 'card' ? t('click.opening') : t('click.pay_by_card') }}
          </button>
        </div>

        <p class="dim text-xs mt-2">{{ t('click.buttons_hint') }}</p>
      </template>

      <!-- Payment history -->
      <template v-if="visibleOrders.length > 0">
        <h3 class="text-sm mt-6">{{ t('click.history_title') }}</h3>
        <ul class="list-bordered mt-2">
          <li v-for="o in visibleOrders" :key="o.id" class="list-row">
            <div>
              <span :class="statusPillClass(o.status)">{{ t('click.status_' + o.status) }}</span>
              <span class="dim text-sm" style="margin-left: 0.5rem;">
                {{ formatPrice(o.amount_minor, o.currency) }}
              </span>
            </div>
            <div class="click-history-right">
              <!-- Fiscal receipt for a past purchase. Under PKM No. 943 this is
                   the customer's own document, so it has to be reachable after
                   the payment screen is long gone - not only on the return page
                   they saw once. Paid orders with no URL yet say so rather than
                   rendering nothing, which would look like the receipt was
                   never issued. -->
              <a v-if="o.fiscal_qr_url" :href="o.fiscal_qr_url" target="_blank"
                rel="noopener noreferrer" class="btn-link accent text-xs">
                {{ t('click.receipt_link') }}
              </a>
              <span v-else-if="o.status === 'paid'" class="dim text-xs">
                {{ t('click.receipt_pending') }}
              </span>
              <span class="dim text-xs">{{ new Date(o.created_at).toLocaleDateString() }}</span>
            </div>
          </li>
        </ul>
      </template>
    </template>
  </div>
</template>

<style scoped>
.click-history-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}

.click-plan-picker {
  margin-top: 0.5rem;
}

.click-price {
  font-size: 1.25rem;
  font-weight: 600;
}

.click-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

/* min-width:0 so a long localized label can't blow the flex row out on
   narrow screens. */
.click-btn {
  min-width: 0;
  flex: 0 1 auto;
}

/* Secondary surface, visually distinct from the primary button without
   competing with it. Colour transition only - no transform. */
.click-btn-card {
  background: var(--bg-elev);
  border: 1px solid var(--border);
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.click-btn-card:hover:not(:disabled) {
  border-color: var(--accent, var(--border));
}
</style>
