<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { clickApi, pollClickOrder } from '../api/click.api';
import { useEntitlementStore } from '../stores/entitlement.store';
import { useLocaleStore } from '../stores/locale.store';
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
</style>
