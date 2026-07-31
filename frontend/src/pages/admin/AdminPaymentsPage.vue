<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import AdminModal from '../../components/AdminModal.vue';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { adminBillingApi } from '../../api/billing.api';
import { adminClickApi } from '../../api/click.api';
import { adminPlanApi } from '../../api/payment.api';
import type { Plan } from '../../types/billing';
import type {
  AdminClickCallbackLog,
  AdminClickOrder,
  ClickHealth,
  ClickOrderStatus,
} from '../../types/click';

// Admin Payments page. Three blocks:
//
//   1. Integration health - is Click configured, is fiscalization configured.
//      Surfaced here so a broken deployment is visible in the panel rather than
//      only in server logs.
//   2. Plan pricing - price_minor, active toggle, and the OFD receipt line.
//      tier/period stay structural and are not editable.
//   3. Click orders - the live payment queue, with Click's own ids, the raw
//      callback trail, and fiscal receipt state + re-fire.
//
// The P2P card-transfer block that used to sit at the bottom of this page is
// gone: the flow was decommissioned at the Click cutover and the code has now
// been removed. The payment_submissions / payment_cards TABLES are deliberately
// left in place - they are financial records and must be retained.

const { t } = useI18n();

const loading = ref(true);
const loadError = ref<string | null>(null);

const health = ref<ClickHealth | null>(null);
const plans = ref<Plan[]>([]);
const orders = ref<AdminClickOrder[]>([]);

const statusFilter = ref<ClickOrderStatus | 'all'>('all');

async function loadAll() {
  loading.value = true;
  loadError.value = null;
  try {
    const [h, p, o] = await Promise.all([
      adminClickApi.health(),
      adminBillingApi.listPlans(),
      adminClickApi.listOrders(
        statusFilter.value === 'all' ? undefined : statusFilter.value
      ),
    ]);
    health.value = h;
    plans.value = p;
    orders.value = o;
  } catch {
    loadError.value = t('admin.payments.load_error');
  } finally {
    loading.value = false;
  }
}

onMounted(loadAll);

async function reloadOrders() {
  try {
    orders.value = await adminClickApi.listOrders(
      statusFilter.value === 'all' ? undefined : statusFilter.value
    );
  } catch {
    // Leave the current list in place - a transient failure here shouldn't
    // blank a table the admin is reading.
  }
}

// ── 2. Plan pricing ────────────────────────────────────────────────────────

// Drafts keyed by plan id so an in-progress edit survives a list refresh.
const priceDrafts = ref<Record<string, string>>({});
const fiscalDrafts = ref<Record<string, string>>({});
const planBusy = ref<string | null>(null);
const planError = ref<string | null>(null);

function priceDraftFor(p: Plan): string {
  if (priceDrafts.value[p.id] === undefined) {
    // Displayed in soums; stored in tiyin.
    priceDrafts.value[p.id] =
      p.price_minor !== null ? String(p.price_minor / 100) : '';
  }
  return priceDrafts.value[p.id];
}

function fiscalDraftFor(p: Plan): string {
  if (fiscalDrafts.value[p.id] === undefined) {
    fiscalDrafts.value[p.id] = p.fiscal_item_name ?? '';
  }
  return fiscalDrafts.value[p.id];
}

async function savePlan(p: Plan) {
  planBusy.value = p.id;
  planError.value = null;
  try {
    const patch: {
      price_minor?: number;
      fiscal_item_name?: string | null;
    } = {};

    const rawPrice = (priceDrafts.value[p.id] ?? '').trim();
    if (rawPrice !== '') {
      const major = Number(rawPrice);
      if (!Number.isFinite(major) || major <= 0) {
        planError.value = t('admin.payments.price_invalid');
        planBusy.value = null;
        return;
      }
      patch.price_minor = Math.round(major * 100);
    }

    // Always sent: clearing the field is a real intent (it disables
    // fiscalization for the plan), so absence and emptiness must differ.
    const rawFiscal = (fiscalDrafts.value[p.id] ?? '').trim();
    patch.fiscal_item_name = rawFiscal === '' ? null : rawFiscal;

    const updated = await adminPlanApi.updatePlan(p.id, patch);
    plans.value = plans.value.map((x) => (x.id === updated.id ? updated : x));
    delete priceDrafts.value[p.id];
    delete fiscalDrafts.value[p.id];
  } catch (e) {
    planError.value = mapError(e, t('admin.payments.plan_save_error'));
  } finally {
    planBusy.value = null;
  }
}

async function togglePlanActive(p: Plan) {
  planBusy.value = p.id;
  planError.value = null;
  try {
    const updated = await adminPlanApi.updatePlan(p.id, {
      is_active: !p.is_active,
    });
    plans.value = plans.value.map((x) => (x.id === updated.id ? updated : x));
  } catch (e) {
    planError.value = mapError(e, t('admin.payments.plan_save_error'));
  } finally {
    planBusy.value = null;
  }
}

// Premium plans only - the free plan has no price and cannot be bought.
const purchasablePlans = computed(() =>
  plans.value.filter((p) => p.tier === 'premium')
);

// An active plan with no receipt line blocks its own fiscalization. Worth
// flagging at the top of the section rather than letting an admin discover it
// when a receipt fails hours after a real payment.
const plansMissingFiscalName = computed(() =>
  purchasablePlans.value.filter(
    (p) => p.is_active && !(p.fiscal_item_name ?? '').trim()
  )
);

// ── 3. Click orders ────────────────────────────────────────────────────────

const detailOrder = ref<AdminClickOrder | null>(null);
const detailCallbacks = ref<AdminClickCallbackLog[]>([]);
const detailLoading = ref(false);
const detailError = ref<string | null>(null);
const fiscalBusy = ref(false);

async function openDetail(o: AdminClickOrder) {
  detailOrder.value = o;
  detailCallbacks.value = [];
  detailError.value = null;
  detailLoading.value = true;
  try {
    detailCallbacks.value = await adminClickApi.orderCallbacks(o.id);
  } catch (e) {
    detailError.value = mapError(e, t('admin.payments.callbacks_error'));
  } finally {
    detailLoading.value = false;
  }
}

function closeDetail() {
  detailOrder.value = null;
  detailCallbacks.value = [];
  detailError.value = null;
}

async function retryFiscal() {
  const o = detailOrder.value;
  if (!o || fiscalBusy.value) return;
  fiscalBusy.value = true;
  detailError.value = null;
  try {
    const res = await adminClickApi.retryFiscal(o.id);
    detailOrder.value = {
      ...o,
      fiscal_status: res.fiscal_status,
      fiscal_last_error: res.fiscal_last_error,
      fiscal_qr_url: res.fiscal_qr_url,
    };
    await reloadOrders();
  } catch (e) {
    detailError.value = mapError(e, t('admin.payments.fiscal_retry_error'));
  } finally {
    fiscalBusy.value = false;
  }
}

function statusPill(status: ClickOrderStatus): string {
  if (status === 'paid') return 'pill pill-green';
  if (status === 'cancelled') return 'pill pill-grey';
  if (status === 'failed') return 'pill pill-red';
  return 'pill pill-amber';
}

function fiscalPill(status: AdminClickOrder['fiscal_status']): string {
  if (status === 'submitted') return 'pill pill-green';
  if (status === 'failed') return 'pill pill-red';
  if (status === 'not_required') return 'pill pill-grey';
  return 'pill pill-amber';
}

function formatPrice(minor: number, currency: string): string {
  const grouped = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(minor / 100);
  return `${grouped} ${currency}`;
}

function prettyJson(v: unknown): string {
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

// ── 4. Legacy card transfers ───────────────────────────────────────────────



// ── shared ─────────────────────────────────────────────────────────────────

function mapError(e: unknown, fallback: string): string {
  if (e instanceof AxiosError) {
    const msg = (e.response?.data as { message?: string | string[] })?.message;
    const flat = Array.isArray(msg) ? msg.join(', ') : msg;
    if (flat) return flat;
  }
  return fallback;
}
</script>

<template>
  <div class="container-wide">
    <h1>{{ t('admin.payments.title') }}</h1>
    <p class="dim text-sm mt-1">{{ t('admin.payments.subtitle') }}</p>

    <p v-if="loading" class="dim text-sm mt-4">{{ t('common.loading') }}</p>
    <p v-else-if="loadError" class="error-text mt-4">{{ loadError }}</p>

    <template v-else>
      <!-- 1. Integration health -->
      <section class="card mt-4">
        <h2>{{ t('admin.payments.health_title') }}</h2>
        <div v-if="health" class="mt-4">
          <div class="admin-health-row">
            <span :class="health.payments_enabled ? 'pill pill-green' : 'pill pill-red'">
              {{ health.payments_enabled ? t('admin.payments.health_ok') : t('admin.payments.health_off') }}
            </span>
            <span class="dim text-sm">{{ t('admin.payments.health_payments') }}</span>
            <span v-if="health.payments_problem" class="error-text text-sm">
              {{ health.payments_problem }}
            </span>
          </div>
          <div class="admin-health-row mt-2">
            <span :class="health.fiscal_enabled ? 'pill pill-green' : 'pill pill-grey'">
              {{ health.fiscal_enabled ? t('admin.payments.health_ok') : t('admin.payments.health_off') }}
            </span>
            <span class="dim text-sm">{{ t('admin.payments.health_fiscal') }}</span>
            <span v-if="health.fiscal_problem" class="error-text text-sm">
              {{ health.fiscal_problem }}
            </span>
          </div>
        </div>
      </section>

      <!-- 2. Plan pricing -->
      <section class="card mt-6">
        <h2>{{ t('admin.payments.plans_title') }}</h2>
        <p class="dim text-sm mt-1">{{ t('admin.payments.plans_sub') }}</p>

        <p v-if="plansMissingFiscalName.length > 0" class="error-text text-sm mt-2">
          {{ t('admin.payments.fiscal_name_missing', { n: plansMissingFiscalName.length }) }}
        </p>
        <p v-if="planError" class="error-text mt-2">{{ planError }}</p>

        <div class="list-bordered mt-4">
          <div v-for="p in purchasablePlans" :key="p.id" class="list-row admin-plan-row">
            <div class="admin-plan-info">
              <div>
                <span style="font-weight: 500;">{{ p.name }}</span>
                <span :class="p.is_active ? 'pill pill-green' : 'pill pill-grey'" style="margin-left: 10px;">
                  {{ p.is_active ? t('admin.payments.plan_active') : t('admin.payments.plan_inactive') }}
                </span>
              </div>
              <div class="dim text-xs mt-1">{{ p.id }}</div>

              <div class="admin-plan-fields mt-2">
                <label class="admin-price-field">
                  <span class="field-label">{{ t('admin.payments.price_label', { currency: p.currency ?? '' }) }}</span>
                  <input :value="priceDraftFor(p)" type="number" min="0" step="1"
                    @input="priceDrafts[p.id] = ($event.target as HTMLInputElement).value" />
                </label>
                <label class="admin-fiscal-field">
                  <span class="field-label">{{ t('admin.payments.fiscal_name_label') }}</span>
                  <input :value="fiscalDraftFor(p)" type="text" maxlength="63"
                    :placeholder="t('admin.payments.fiscal_name_placeholder')"
                    @input="fiscalDrafts[p.id] = ($event.target as HTMLInputElement).value" />
                </label>
              </div>
              <p class="dim text-xs mt-1">{{ t('admin.payments.fiscal_name_hint') }}</p>
            </div>

            <div class="admin-plan-controls">
              <button class="btn btn-sm btn-primary" :disabled="planBusy === p.id" @click="savePlan(p)">
                {{ planBusy === p.id ? t('common.loading') : t('admin.payments.save') }}
              </button>
              <button class="btn btn-sm" :class="p.is_active ? 'btn-ghost' : 'btn-primary'"
                :disabled="planBusy === p.id" @click="togglePlanActive(p)">
                {{ p.is_active ? t('admin.payments.deactivate') : t('admin.payments.activate') }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 3. Click orders -->
      <section class="card mt-6">
        <h2>{{ t('admin.payments.orders_title') }}</h2>
        <p class="dim text-sm mt-1">{{ t('admin.payments.orders_sub') }}</p>

        <div class="segmented mt-4">
          <button v-for="f in (['all', 'paid', 'prepared', 'created', 'cancelled', 'failed'] as const)" :key="f"
            type="button" :class="{ active: statusFilter === f }" @click="statusFilter = f; reloadOrders()">
            {{ t('admin.payments.order_filter_' + f) }}
          </button>
        </div>

        <p v-if="orders.length === 0" class="dim text-sm mt-4">
          {{ t('admin.payments.orders_empty') }}
        </p>
        <div v-else class="list-bordered mt-4">
          <div v-for="o in orders" :key="o.id" class="list-row admin-order-row">
            <div class="admin-order-info">
              <div>
                <span :class="statusPill(o.status)">{{ t('admin.payments.order_status_' + o.status) }}</span>
                <span :class="fiscalPill(o.fiscal_status)" style="margin-left: 8px;">
                  {{ t('admin.payments.fiscal_status_' + o.fiscal_status) }}
                </span>
                <span style="font-weight: 500; margin-left: 10px;">
                  {{ formatPrice(o.amount_minor, o.currency) }}
                </span>
              </div>
              <div class="dim text-xs mt-1">
                {{ o.user_email ?? o.user_id }} · {{ o.plan_name ?? o.plan_id }}
                · {{ new Date(o.created_at).toLocaleString() }}
              </div>
              <div class="dim text-xs mt-1 admin-mono">
                {{ o.merchant_trans_id }}
                <template v-if="o.click_trans_id"> · click_trans_id {{ o.click_trans_id }}</template>
                <template v-if="o.click_paydoc_id"> · paydoc {{ o.click_paydoc_id }}</template>
              </div>
            </div>
            <div class="admin-order-actions">
              <button class="btn btn-sm btn-ghost" @click="openDetail(o)">
                {{ t('admin.payments.order_detail') }}
              </button>
            </div>
          </div>
        </div>
      </section>

      <!-- 4. Legacy card transfers -->
    </template>

    <!-- Order detail: Click ids, fiscal state, raw callback trail.
         Previously used a `.modal-overlay` class that exists nowhere in the
         stylesheet, so it rendered unpositioned at the end of the DOM - which
         is why this looked like a panel glued to the bottom of the page. -->
    <AdminModal :open="detailOrder !== null" wide :title="t('admin.payments.order_detail')"
      :subtitle="detailOrder?.merchant_trans_id ?? ''" :busy="detailLoading"
      @update:open="(v: boolean) => { if (!v) closeDetail(); }">
      <template v-if="detailOrder">

        <p v-if="detailError" class="error-text mt-2">{{ detailError }}</p>

        <dl class="admin-detail-grid mt-4">
          <dt class="dim text-xs">{{ t('admin.payments.detail_status') }}</dt>
          <dd>
            <span :class="statusPill(detailOrder.status)">
              {{ t('admin.payments.order_status_' + detailOrder.status) }}
            </span>
          </dd>

          <dt class="dim text-xs">{{ t('admin.payments.detail_amount') }}</dt>
          <dd>{{ formatPrice(detailOrder.amount_minor, detailOrder.currency) }}</dd>

          <dt class="dim text-xs">{{ t('admin.payments.detail_user') }}</dt>
          <dd>{{ detailOrder.user_email ?? detailOrder.user_id }}</dd>

          <dt class="dim text-xs">click_trans_id</dt>
          <dd>{{ detailOrder.click_trans_id ?? '-' }}</dd>

          <dt class="dim text-xs">click_paydoc_id</dt>
          <dd>{{ detailOrder.click_paydoc_id ?? '-' }}</dd>

          <dt class="dim text-xs">merchant_prepare_id</dt>
          <dd>{{ detailOrder.merchant_prepare_id ?? '-' }}</dd>

          <dt class="dim text-xs">{{ t('admin.payments.detail_subscription') }}</dt>
          <dd>{{ detailOrder.subscription_id ?? '-' }}</dd>

          <dt class="dim text-xs">{{ t('admin.payments.detail_fiscal') }}</dt>
          <dd>
            <span :class="fiscalPill(detailOrder.fiscal_status)">
              {{ t('admin.payments.fiscal_status_' + detailOrder.fiscal_status) }}
            </span>
            <span class="dim text-xs" style="margin-left: 8px;">
              {{ t('admin.payments.fiscal_attempts', { n: detailOrder.fiscal_attempts }) }}
            </span>
          </dd>
        </dl>

        <p v-if="detailOrder.fiscal_last_error" class="error-text text-sm mt-2">
          {{ detailOrder.fiscal_last_error }}
        </p>
        <p v-if="detailOrder.fiscal_qr_url" class="text-sm mt-2">
          <a :href="detailOrder.fiscal_qr_url" target="_blank" rel="noopener noreferrer">
            {{ t('admin.payments.fiscal_receipt_link') }}
          </a>
        </p>

        <button v-if="detailOrder.status === 'paid' && detailOrder.fiscal_status !== 'submitted'"
          class="btn btn-sm btn-primary mt-4" :disabled="fiscalBusy" @click="retryFiscal">
          {{ fiscalBusy ? t('common.loading') : t('admin.payments.fiscal_retry') }}
        </button>

        <h3 class="text-sm mt-6">{{ t('admin.payments.callbacks_title') }}</h3>
        <p class="dim text-xs mt-1">{{ t('admin.payments.callbacks_hint') }}</p>
        <p v-if="detailLoading" class="dim text-sm mt-2">{{ t('common.loading') }}</p>
        <p v-else-if="detailCallbacks.length === 0" class="dim text-sm mt-2">
          {{ t('admin.payments.callbacks_empty') }}
        </p>
        <div v-else class="mt-2">
          <div v-for="c in detailCallbacks" :key="c.id" class="admin-callback">
            <div>
              <span class="pill pill-grey">
                {{ c.action === 0 ? 'prepare' : c.action === 1 ? 'complete' : '?' }}
              </span>
              <span class="dim text-xs" style="margin-left: 8px;">{{ c.verdict ?? '-' }}</span>
              <span class="dim text-xs" style="margin-left: 8px;">error {{ c.error_code ?? '-' }}</span>
              <span class="dim text-xs" style="margin-left: 8px;">
                {{ new Date(c.created_at).toLocaleString() }}
              </span>
            </div>
            <pre class="admin-callback-body">{{ prettyJson(c.request_body) }}</pre>
            <pre class="admin-callback-body">{{ prettyJson(c.response_body) }}</pre>
          </div>
        </div>

      </template>
      <template #footer>
        <button class="btn btn-ghost" @click="closeDetail">{{ t('admin.payments.close') }}</button>
      </template>
    </AdminModal>
  </div>
</template>

<style scoped>
.admin-health-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.admin-mono {
  font-family: ui-monospace, monospace;
}

.admin-plan-row,
.admin-order-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

/* min-width:0 alongside overflow:hidden so a long email or merchant_trans_id
   cannot push the action buttons off the row. */
.admin-plan-info,
.admin-order-info {
  min-width: 0;
  overflow: hidden;
  flex: 1 1 auto;
}

.admin-plan-controls,
.admin-order-actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  flex: 0 0 auto;
}

.admin-plan-fields {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.admin-price-field,
.admin-fiscal-field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.admin-price-field input {
  width: 10rem;
}

.admin-fiscal-field input {
  width: 22rem;
  max-width: 100%;
}


.admin-detail-grid {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 0.5rem 1rem;
  align-items: center;
}

/* Grid children need min-width:0 or a long id blows the column out. */
.admin-detail-grid dt,
.admin-detail-grid dd {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.admin-callback {
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin-top: 0.5rem;
}

.admin-callback-body {
  font-family: ui-monospace, monospace;
  font-size: 0.75rem;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0.5rem 0 0;
  max-height: 14rem;
  overflow: auto;
}
</style>
