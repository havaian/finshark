<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { clickApi, pollClickOrder } from '../api/click.api';
import { useEntitlementStore } from '../stores/entitlement.store';
import { useLocaleStore } from '../stores/locale.store';
import { fmtDate } from '../i18n/dates';
import type { ClickOrder } from '../types/click';
import AppNav from '../components/AppNav.vue';

// Landing page for Click's return_url after a redirect payment.
//
// This exists as its own route rather than a query flag on the subscription
// page because the browser redirect and Click's server-to-server Complete
// callback are unordered. The user can be back here before their payment has
// been confirmed to our server, or well after. A dedicated screen can wait for
// either order to resolve; a flag on a page that renders once cannot.
//
// The overlay payment path reuses the same polling helper inline, so both
// surfaces converge on identical logic - only the presentation differs.

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const entitlement = useEntitlementStore();
const locale = useLocaleStore();

type Phase = 'waiting' | 'paid' | 'failed' | 'timeout' | 'notfound';

const phase = ref<Phase>('waiting');
const order = ref<ClickOrder | null>(null);

// Stops the poll loop if the user navigates away mid-wait.
const pollSignal = { cancelled: false };

onBeforeUnmount(() => {
  pollSignal.cancelled = true;
});

onMounted(async () => {
  const raw = route.query.order;
  const orderId = Array.isArray(raw) ? raw[0] : raw;
  if (!orderId || typeof orderId !== 'string') {
    phase.value = 'notfound';
    return;
  }

  // First read is separate from the poll so a bad/foreign order id fails fast
  // with "not found" instead of spending the full attempt budget on 404s.
  try {
    order.value = await clickApi.getOrder(orderId);
  } catch {
    phase.value = 'notfound';
    return;
  }

  if (order.value.status === 'paid') {
    phase.value = 'paid';
    await entitlement.fetch();
    return;
  }

  const final = await pollClickOrder(orderId, {
    signal: pollSignal,
    onTick: (o) => {
      order.value = o;
    },
  });

  if (pollSignal.cancelled) return;

  if (final?.status === 'paid') {
    phase.value = 'paid';
    await entitlement.fetch();
    return;
  }
  if (final?.status === 'cancelled' || final?.status === 'failed') {
    phase.value = 'failed';
    return;
  }
  // Ran out of attempts with the order still unsettled. Deliberately NOT
  // reported as a failure: a slow callback is common and the payment may still
  // land a minute later.
  phase.value = 'timeout';
});

function backToSubscription() {
  void router.push({
    name: 'subscription',
    params: { lang: locale.lang },
  });
}

// True when the purchased period starts later than now - the signature of a
// chained renewal stacked onto an active subscription. Drives the explanatory
// line so the buyer isn't surprised their premium "starts next month".
const coverageStartsInFuture = computed(() => {
  const starts = order.value?.coverage_starts_at;
  if (!starts) return false;
  return new Date(starts).getTime() > Date.now() + 60_000;
});

function formatPrice(minor: number | null, currency: string | null): string {
  if (minor === null || currency === null) return '';
  const grouped = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(minor / 100);
  return `${grouped} ${currency}`;
}
</script>

<template>
  <main class="page">
    <AppNav />
    <div class="container">
      <header class="page-head">
        <h1>{{ t('click_return.title') }}</h1>
      </header>

      <section class="card click-return-card">
        <!-- Waiting on Click's callback -->
        <template v-if="phase === 'waiting'">
          <span class="pill pill-amber">{{ t('click.processing') }}</span>
          <p class="mt-4">{{ t('click_return.waiting') }}</p>
          <p class="dim text-sm mt-2">{{ t('click_return.waiting_hint') }}</p>
        </template>

        <!-- Confirmed -->
        <template v-else-if="phase === 'paid'">
          <span class="pill pill-green">{{ t('click.paid') }}</span>
          <p class="mt-4">{{ t('click_return.paid') }}</p>
          <p v-if="order" class="dim text-sm mt-2">
            {{ formatPrice(order.amount_minor, order.currency) }}
          </p>
          <!-- Coverage window. With chained grants a renewal starts when the
               current period ends, so these dates can begin in the future -
               showing them explains why premium may not start "today". -->
          <div v-if="order && order.coverage_starts_at && order.coverage_ends_at"
            class="click-coverage mt-4">
            <span class="dim text-xs">{{ t('click_return.coverage_label') }}</span>
            <p class="click-coverage-dates mt-1">
              {{ fmtDate(order.coverage_starts_at) }} - {{ fmtDate(order.coverage_ends_at) }}
            </p>
            <p v-if="coverageStartsInFuture" class="dim text-xs mt-1">
              {{ t('click_return.coverage_future') }}
            </p>
          </div>
          <button type="button" class="btn btn-primary mt-6" @click="backToSubscription">
            {{ t('click_return.back') }}
          </button>
        </template>

        <!-- Click reported the payment did not go through -->
        <template v-else-if="phase === 'failed'">
          <span class="pill pill-red">{{ t('click.status_cancelled') }}</span>
          <p class="mt-4">{{ t('click_return.failed') }}</p>
          <p v-if="order?.error_note" class="dim text-xs mt-2">{{ order.error_note }}</p>
          <button type="button" class="btn btn-primary mt-6" @click="backToSubscription">
            {{ t('click_return.try_again') }}
          </button>
        </template>

        <!-- Still unsettled when we stopped polling -->
        <template v-else-if="phase === 'timeout'">
          <span class="pill pill-amber">{{ t('click.processing') }}</span>
          <p class="mt-4">{{ t('click_return.timeout') }}</p>
          <p class="dim text-sm mt-2">{{ t('click_return.timeout_hint') }}</p>
          <button type="button" class="btn btn-primary mt-6" @click="backToSubscription">
            {{ t('click_return.back') }}
          </button>
        </template>

        <!-- No usable order reference in the URL -->
        <template v-else>
          <p>{{ t('click_return.notfound') }}</p>
          <button type="button" class="btn btn-primary mt-6" @click="backToSubscription">
            {{ t('click_return.back') }}
          </button>
        </template>
      </section>
    </div>
  </main>
</template>

<style scoped>
.click-return-card {
  max-width: 520px;
}

.click-coverage {
  padding: 0.75rem 1rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--bg-elev);
}

.click-coverage-dates {
  font-size: 1rem;
  font-weight: 600;
}
</style>
