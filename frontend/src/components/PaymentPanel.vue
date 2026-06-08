<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { paymentApi } from '../api/payment.api';
import { useEntitlementStore } from '../stores/entitlement.store';
import type { Plan } from '../types/billing';
import type { PaymentCard, PaymentSubmission } from '../types/payment';

// Self-contained P2P payment panel embedded in SubscriptionPage. Flow:
//   1. Pick a plan (monthly / yearly / lifetime - whatever the backend marks
//      purchasable). Prices come from the backend and reflect admin edits.
//   2. See the operator's receiving card(s) with copy-to-clipboard.
//   3. Transfer out-of-band, then upload the slip (image/PDF) + submit.
//   4. Submission goes 'pending' for admin review; the panel shows that state.
//
// The panel emits nothing; it refreshes the entitlement store after a submit
// so the rest of the page can react if the user already had a status. It does
// NOT grant premium - that happens only on admin approval.

const { t } = useI18n();
const entitlement = useEntitlementStore();

// ── Data load ────────────────────────────────────────────────────────────
const plans = ref<Plan[]>([]);
const cards = ref<PaymentCard[]>([]);
const mySubmissions = ref<PaymentSubmission[]>([]);
const loading = ref(true);
const loadError = ref<string | null>(null);

// The currently selected plan id for purchase.
const selectedPlanId = ref<string | null>(null);

// The latest pending submission, if any - drives the "under review" state.
const pendingSubmission = computed<PaymentSubmission | null>(
  () => mySubmissions.value.find((s) => s.status === 'pending') ?? null
);

async function loadAll() {
  loading.value = true;
  loadError.value = null;
  try {
    const [p, c, mine] = await Promise.all([
      paymentApi.listPlans(),
      paymentApi.listCards(),
      paymentApi.listMine(),
    ]);
    plans.value = p;
    cards.value = c;
    mySubmissions.value = mine;
    // Default selection: first plan (monthly, by sort_order).
    if (p.length > 0 && selectedPlanId.value === null) {
      selectedPlanId.value = p[0].id;
    }
  } catch {
    loadError.value = t('payments.load_error');
  } finally {
    loading.value = false;
  }
}

onMounted(loadAll);

const selectedPlan = computed<Plan | null>(
  () => plans.value.find((p) => p.id === selectedPlanId.value) ?? null
);

// Format a minor-unit price with its currency. UZS has no commonly-used minor
// unit in practice, but the data models it in minor units (×100), so divide.
// We render with thousands separators and the currency code suffix.
function formatPrice(minor: number | null, currency: string | null): string {
  if (minor === null || currency === null) return '';
  const major = minor / 100;
  // Group digits; no fixed decimals (whole-sum prices for UZS).
  const grouped = new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 2,
  }).format(major);
  return `${grouped} ${currency}`;
}

// Human label for a plan based on its period_days (monthly / yearly / lifetime
// / N days). Falls back to the backend name if the period is unusual.
function planLabel(p: Plan): string {
  if (p.period_days === null) return t('payments.plan_lifetime');
  if (p.period_days === 30) return t('payments.plan_monthly');
  if (p.period_days === 365) return t('payments.plan_yearly');
  return t('payments.plan_days', { n: p.period_days });
}

// ── Copy to clipboard ──────────────────────────────────────────────────────
const copiedCardId = ref<string | null>(null);
let copiedTimer: number | null = null;

async function copyCard(card: PaymentCard) {
  // Strip spaces from the displayed number when copying so pasting into a
  // banking app gives clean digits. Display keeps the grouped form.
  const digits = card.card_number.replace(/\s+/g, '');
  try {
    await navigator.clipboard.writeText(digits);
    copiedCardId.value = card.id;
    if (copiedTimer) window.clearTimeout(copiedTimer);
    copiedTimer = window.setTimeout(() => {
      copiedCardId.value = null;
    }, 2000);
  } catch {
    // Clipboard API can be blocked (insecure context / permissions). Fall back
    // to selecting nothing - the number is visible for manual copy anyway.
  }
}

// Group a raw card number into 4-digit blocks for display readability.
function displayCardNumber(raw: string): string {
  const digits = raw.replace(/\s+/g, '');
  return digits.replace(/(.{4})/g, '$1 ').trim();
}

// ── Slip upload + submit ─────────────────────────────────────────────────
const slipFile = ref<File | null>(null);
const slipName = ref<string>('');
const submitBusy = ref(false);
const submitError = ref<string | null>(null);
const fileInputRef = ref<HTMLInputElement | null>(null);

// Client-side mirror of the backend limits (defence + instant feedback).
const MAX_SLIP_BYTES = 5 * 1024 * 1024;
const ACCEPT = 'image/jpeg,image/png,image/webp,image/heic,image/heif,application/pdf';

function onFilePick(e: Event) {
  submitError.value = null;
  const input = e.target as HTMLInputElement;
  const f = input.files && input.files[0] ? input.files[0] : null;
  if (!f) {
    slipFile.value = null;
    slipName.value = '';
    return;
  }
  if (f.size > MAX_SLIP_BYTES) {
    submitError.value = t('payments.slip_too_large');
    slipFile.value = null;
    slipName.value = '';
    input.value = '';
    return;
  }
  slipFile.value = f;
  slipName.value = f.name;
}

function clearFile() {
  slipFile.value = null;
  slipName.value = '';
  if (fileInputRef.value) fileInputRef.value.value = '';
}

const canSubmit = computed(
  () => !!selectedPlanId.value && !!slipFile.value && !submitBusy.value
);

async function submit() {
  if (!canSubmit.value || !selectedPlanId.value || !slipFile.value) return;
  submitBusy.value = true;
  submitError.value = null;
  try {
    await paymentApi.submit({
      planId: selectedPlanId.value,
      slip: slipFile.value,
    });
    // Reload submissions so the pending state shows; refresh entitlement in
    // case anything elsewhere keys off it.
    await Promise.all([
      paymentApi.listMine().then((m) => {
        mySubmissions.value = m;
      }),
      entitlement.fetch(),
    ]);
    clearFile();
  } catch (e) {
    submitError.value = mapSubmitError(e);
  } finally {
    submitBusy.value = false;
  }
}

function mapSubmitError(e: unknown): string {
  if (e instanceof AxiosError) {
    const status = e.response?.status;
    const msg = (e.response?.data as { message?: string | string[] })?.message;
    const flat = Array.isArray(msg) ? msg.join(', ') : msg;
    // 400 with a pending-submission message is the most common case.
    if (flat) return flat;
    if (status === 413) return t('payments.slip_too_large');
  }
  return t('payments.submit_error_generic');
}

function statusPillClass(status: PaymentSubmission['status']): string {
  if (status === 'approved') return 'pill pill-green';
  if (status === 'rejected') return 'pill pill-red';
  return 'pill pill-amber';
}
</script>

<template>
  <div class="card mt-6">
    <h2 class="text-lg">{{ t('payments.title') }}</h2>
    <p class="dim text-sm mt-1">{{ t('payments.subtitle') }}</p>

    <p v-if="loading" class="dim text-sm mt-4">{{ t('common.loading') }}</p>
    <p v-else-if="loadError" class="error-text mt-4">{{ loadError }}</p>

    <template v-else>
      <!-- Pending submission banner: when one exists, we show it prominently
           and hide the submit form (one pending at a time). -->
      <div v-if="pendingSubmission" class="payment-pending mt-4">
        <span class="pill pill-amber">{{ t('payments.status_pending') }}</span>
        <p class="dim text-sm mt-2">{{ t('payments.pending_explainer') }}</p>
        <p class="dim text-xs mt-2">
          {{ t('payments.submitted_on', { date: new Date(pendingSubmission.created_at).toLocaleString() }) }}
        </p>
      </div>

      <!-- Purchase form: only when there's no pending submission. -->
      <template v-else>
        <p v-if="plans.length === 0" class="dim text-sm mt-4">
          {{ t('payments.no_plans') }}
        </p>
        <template v-else>
          <!-- 1. Plan picker -->
          <label class="field-label mt-4">{{ t('payments.choose_plan') }}</label>
          <div class="segmented payment-plan-picker">
            <button
              v-for="p in plans"
              :key="p.id"
              type="button"
              :class="{ active: selectedPlanId === p.id }"
              @click="selectedPlanId = p.id"
            >
              {{ planLabel(p) }}
            </button>
          </div>
          <p v-if="selectedPlan" class="payment-price mt-2">
            {{ formatPrice(selectedPlan.price_minor, selectedPlan.currency) }}
          </p>

          <!-- 2. Card(s) to transfer to, with copy buttons -->
          <label class="field-label mt-6">{{ t('payments.transfer_to') }}</label>
          <p v-if="cards.length === 0" class="dim text-sm mt-2">
            {{ t('payments.no_cards') }}
          </p>
          <ul v-else class="list-bordered mt-2">
            <li v-for="card in cards" :key="card.id" class="list-row payment-card-row">
              <div class="payment-card-info">
                <span class="payment-card-number">{{ displayCardNumber(card.card_number) }}</span>
                <span class="dim text-sm">
                  {{ card.holder_name }}<template v-if="card.bank_label"> · {{ card.bank_label }}</template>
                </span>
              </div>
              <button type="button" class="btn btn-sm btn-ghost" @click="copyCard(card)">
                {{ copiedCardId === card.id ? t('payments.copied') : t('payments.copy') }}
              </button>
            </li>
          </ul>

          <!-- 3. Slip upload -->
          <label class="field-label mt-6">{{ t('payments.upload_slip') }}</label>
          <p class="dim text-xs mt-1">{{ t('payments.slip_hint') }}</p>
          <div class="payment-slip-input mt-2">
            <input
              ref="fileInputRef"
              type="file"
              :accept="ACCEPT"
              @change="onFilePick"
            />
            <button
              v-if="slipName"
              type="button"
              class="btn btn-sm btn-ghost"
              @click="clearFile"
            >
              {{ t('payments.clear_file') }}
            </button>
          </div>

          <p v-if="submitError" class="error-text mt-2">{{ submitError }}</p>

          <!-- 4. Submit -->
          <button
            type="button"
            class="btn btn-primary mt-4"
            :disabled="!canSubmit"
            @click="submit"
          >
            {{ submitBusy ? t('payments.submitting') : t('payments.submit') }}
          </button>
          <p class="dim text-xs mt-2">{{ t('payments.review_note') }}</p>
        </template>
      </template>

      <!-- History of this user's submissions (most recent first). -->
      <template v-if="mySubmissions.length > 0">
        <h3 class="text-sm mt-6">{{ t('payments.history_title') }}</h3>
        <ul class="list-bordered mt-2">
          <li v-for="s in mySubmissions" :key="s.id" class="list-row">
            <div>
              <span :class="statusPillClass(s.status)">{{ t('payments.status_' + s.status) }}</span>
              <span class="dim text-sm" style="margin-left: 0.5rem;">
                {{ formatPrice(s.amount_minor, s.currency) }}
              </span>
              <p v-if="s.review_note" class="dim text-xs mt-1">{{ s.review_note }}</p>
            </div>
            <span class="dim text-xs">{{ new Date(s.created_at).toLocaleDateString() }}</span>
          </li>
        </ul>
      </template>
    </template>
  </div>
</template>

<style scoped>
.payment-plan-picker {
  margin-top: 0.5rem;
}
.payment-price {
  font-size: 1.25rem;
  font-weight: 600;
}
.payment-card-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}
.payment-card-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}
.payment-card-number {
  font-family: ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, monospace;
  font-size: 1.05rem;
  letter-spacing: 0.04em;
  word-break: break-all;
}
.payment-slip-input {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.payment-pending {
  padding: 1rem;
  border: 1px solid var(--border);
  border-radius: 0.5rem;
  background: var(--bg-elev);
}
</style>
