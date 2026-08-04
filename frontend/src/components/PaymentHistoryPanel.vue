<script setup lang="ts">
// Past payments, with a link to each fiscal receipt.
//
// Lifted out of ClickPayPanel so it can sit at the BOTTOM of the subscription
// page. It was previously rendered inside that panel, which forced everything
// added afterwards - saved card, redeem code - below a list of old
// transactions. History is reference material; the things a user might act on
// belong above it.
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { clickApi } from '../api/click.api';
import type { ClickOrder, ClickOrderStatus } from '../types/click';

const { t } = useI18n();
const orders = ref<ClickOrder[]>([]);
const loading = ref(true);

// 'created' orders are checkout attempts the user never completed. They are
// noise here - no money moved and there is nothing to look at.
const visible = computed(() => orders.value.filter((o) => o.status !== 'created'));

function statusPillClass(status: ClickOrderStatus): string {
  if (status === 'paid') return 'pill pill-green';
  if (status === 'failed' || status === 'cancelled') return 'pill pill-red';
  return 'pill pill-grey';
}

function formatPrice(minor: number, currency: string): string {
  return `${(minor / 100).toLocaleString()} ${currency}`;
}

async function reload() {
  try {
    orders.value = await clickApi.listMyOrders();
  } catch {
    orders.value = [];
  } finally {
    loading.value = false;
  }
}
onMounted(reload);

// Exposed so the page can refresh this list after a payment completes -
// otherwise a purchase made on the page above never appears below it.
defineExpose({ reload });
</script>

<template>
  <section v-if="loading || visible.length > 0" class="card mt-6">
    <h2>{{ t('click.history_title') }}</h2>
    <p v-if="loading" class="dim text-sm mt-2">{{ t('common.loading') }}</p>

    <ul v-else class="list-bordered mt-3">
      <li v-for="o in visible" :key="o.id" class="list-row">
        <div>
          <span :class="statusPillClass(o.status)">{{ t('click.status_' + o.status) }}</span>
          <span class="dim text-sm" style="margin-left: 0.5rem;">
            {{ formatPrice(o.amount_minor, o.currency) }}
          </span>
        </div>
        <div class="click-history-right">
          <!-- The fiscal receipt is the customer's own document under PKM
               No. 943, so it has to stay reachable long after the payment
               screen. A paid order with no URL yet says so rather than
               rendering nothing, which would read as "never issued". -->
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
  </section>
</template>
