<script setup lang="ts">
// Single payment panel. Replaces the old ClickPayPanel + SavedCardPanel pair.
//
// Why they were merged: the page previously showed two panels that both
// charged the same saved card, plus two buttons labelled "Pay with Click" and
// "Pay by card" that were BOTH Click - one redirected to my.click.uz, the
// other opened Click's checkout.js overlay. "Pay by card" therefore promised a
// card payment and delivered a Click surface. The overlay is gone and the
// labels now say what they do.
//
// The three actions, in the order a user thinks about them:
//   1. Pay once          - charges the saved token directly. No redirect, no
//                          overlay, no auto-renew arranged.
//   2. Subscribe         - same charge, but auto-renew is switched on. Offered
//                          only when there is no active subscription and the
//                          plan actually has a period to renew.
//   3. Pay with Click    - hosted page at my.click.uz. Explicitly labelled as
//                          Click, for anyone whose card will not bind.
//
// THE CARD NUMBER NEVER REACHES OUR SERVER on the happy path: Click's
// card_token/request takes no Auth header so the browser posts the PAN there
// directly and we keep only the token. The CORS fallback that posts through
// our backend is a degraded path, not the design.
//
// Nothing here grants premium. Access appears when Click's Complete callback
// reaches our server, which is why both charge paths poll the order instead of
// trusting the response.
import { computed, onMounted, ref } from 'vue';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { clickApi, pollClickOrder } from '../api/click.api';
import { useEntitlementStore } from '../stores/entitlement.store';
import CelebrationModal from './CelebrationModal.vue';
import type { Plan } from '../types/billing';
import type { SavedCard } from '../types/click';

defineProps<{
  // True when an active subscription exists. Subscribing again would charge
  // for a period already owned, so the Subscribe action hides and the
  // auto-renew toggle takes over.
  canAutoRenew: boolean;
  autoRenewOn: boolean;
}>();

const emit = defineEmits<{ (e: 'changed'): void }>();

const { t } = useI18n();
const entitlement = useEntitlementStore();

// ── Load ─────────────────────────────────────────────────────────────────
const plans = ref<Plan[]>([]);
const card = ref<SavedCard | null>(null);
const enabled = ref(false);
const loading = ref(true);
const loadError = ref<string | null>(null);
const selectedPlanId = ref<string | null>(null);

async function loadAll() {
  loading.value = true;
  loadError.value = null;
  try {
    const [cfg, p, c] = await Promise.all([
      clickApi.config(),
      clickApi.listPlans(),
      clickApi.getSavedCard().catch(() => null),
    ]);
    enabled.value = cfg.enabled;
    plans.value = p;
    card.value = c;
    if (p.length > 0 && selectedPlanId.value === null) {
      selectedPlanId.value = p[0].id;
    }
  } catch {
    loadError.value = t('click.load_error');
  } finally {
    loading.value = false;
  }
}

onMounted(loadAll);

const selectedPlan = computed<Plan | null>(
  () => plans.value.find((p) => p.id === selectedPlanId.value) ?? null,
);

// Both actions are always offered. The ONLY thing that removes Subscribe is a
// lifetime plan, which has no period to renew - chargeNow accepts it and
// subscribeNow rejects it, so the button would 400 if it were shown.
//
// It deliberately does NOT depend on whether a subscription already exists.
// That gate came from the old two-panel layout, where it meant "you are
// already subscribed, use the toggle instead". Here it removed the only way to
// subscribe at all. Buying while active is safe: grantForOrder chains the new
// period onto the end of the current one rather than overlapping it.
const canSubscribe = computed(() => selectedPlan.value?.period_days != null);

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
  // Third argument is the plural choice. Without it vue-i18n always picks the
  // first form, so a 1-day plan rendered as "1 дней".
  return t('click.plan_days', { n: p.period_days }, p.period_days);
}

// ── Card binding ─────────────────────────────────────────────────────────
const showForm = ref(false);
const busy = ref(false);
const error = ref<string | null>(null);
const cardNumber = ref('');
const expiry = ref('');
const smsCode = ref('');
const pendingTokenId = ref<string | null>(null);
const pendingPhone = ref<string | null>(null);

// Remembers WHY the form was opened, so verification continues into the
// action the user actually pressed rather than returning them to a page with
// a new button to find.
type PayIntent = 'charge' | 'subscribe';
const intent = ref<PayIntent | null>(null);

const digitsOnly = computed(() => cardNumber.value.replace(/\D/g, ''));
const expiryDigits = computed(() => expiry.value.replace(/\D/g, ''));
// Uzcard (8600...) and Humo (9860...) are both exactly 16 digits, and Click's
// card_token/request only issues tokens for those two schemes.
const CARD_DIGITS = 16;

const canSubmitCard = computed(
  () => digitsOnly.value.length === CARD_DIGITS && expiryDigits.value.length === 4,
);

function onCardInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, CARD_DIGITS);
  cardNumber.value = raw.replace(/(.{4})/g, '$1 ').trim();
}

function onExpiryInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 4);
  expiry.value = raw.length > 2 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw;
}

function onSmsInput(e: Event) {
  smsCode.value = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 8);
}

function resetForm() {
  cardNumber.value = '';
  expiry.value = '';
  smsCode.value = '';
  pendingTokenId.value = null;
  pendingPhone.value = null;
}

async function startBinding() {
  if (!canSubmitCard.value || busy.value) return;
  busy.value = true;
  error.value = null;
  try {
    let started;
    try {
      const res = await fetch('https://api.click.uz/v2/merchant/card_token/request', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: Number(import.meta.env.VITE_CLICK_SERVICE_ID),
          card_number: digitsOnly.value,
          expire_date: expiryDigits.value,
          temporary: 0,
        }),
      });
      const data = await res.json();
      if (!data?.card_token) throw new Error(data?.error_note ?? 'no token');
      started = await clickApi.adoptCard({
        card_token: data.card_token,
        phone_masked: data.phone_number ?? null,
      });
    } catch {
      // Direct call unavailable - proxy through our backend instead.
      started = await clickApi.requestCard({
        card_number: digitsOnly.value,
        expire_date: expiryDigits.value,
      });
    }
    pendingTokenId.value = started.token_id;
    pendingPhone.value = started.phone_masked;
    // Clear the number the moment it is no longer needed.
    cardNumber.value = '';
    expiry.value = '';
  } catch (e) {
    error.value = e instanceof Error ? e.message : t('cards.bind_failed');
  } finally {
    busy.value = false;
  }
}

async function confirmSms() {
  if (!pendingTokenId.value || !smsCode.value || busy.value) return;
  busy.value = true;
  error.value = null;
  try {
    card.value = await clickApi.verifyCard({
      token_id: pendingTokenId.value,
      sms_code: smsCode.value,
    });
    showForm.value = false;
    resetForm();
    emit('changed');
    // The card was only collected in order to pay, so finish the job.
    const pending = intent.value;
    intent.value = null;
    if (pending === 'charge') await payOnce();
    else if (pending === 'subscribe') await subscribe();
  } catch (e) {
    error.value = e instanceof Error ? e.message : t('cards.verify_failed');
  } finally {
    busy.value = false;
  }
}

async function removeCard() {
  if (busy.value) return;
  busy.value = true;
  error.value = null;
  try {
    await clickApi.removeCard();
    card.value = null;
    emit('changed');
  } catch (e) {
    error.value = e instanceof Error ? e.message : t('cards.remove_failed');
  } finally {
    busy.value = false;
  }
}

// ── Paying ───────────────────────────────────────────────────────────────
const charging = ref(false);
const settling = ref(false);
const activeAction = ref<PayIntent | null>(null);
const payDone = ref(false);
const celebratePremium = ref<{ planName: string; endsOn: string | null } | null>(null);

const canAct = computed(
  () => enabled.value && !!selectedPlanId.value && !charging.value && !settling.value,
);

// Entry points. With a card these charge; without one they open the form and
// remember why it was opened.
function startPayOnce() {
  if (!canAct.value) return;
  if (!card.value) {
    intent.value = 'charge';
    showForm.value = true;
    return;
  }
  void payOnce();
}

function startSubscribe() {
  if (!canAct.value) return;
  if (!card.value) {
    intent.value = 'subscribe';
    showForm.value = true;
    return;
  }
  void subscribe();
}

async function payOnce() {
  activeAction.value = 'charge';
  await runCharge(() => clickApi.chargeNow(selectedPlanId.value as string));
}

async function subscribe() {
  activeAction.value = 'subscribe';
  await runCharge(() => clickApi.subscribeNow(selectedPlanId.value as string));
}

// True while THIS button's request is in flight.
function isRunning(action: PayIntent): boolean {
  return activeAction.value === action && (charging.value || settling.value);
}

// Shared settle logic. The POST only means Click ACCEPTED the charge; access
// exists once their Prepare/Complete callbacks reach us, seconds later - so
// poll the order rather than reloading and finding nothing.
async function runCharge(
  start: () => Promise<{ order_id: string; merchant_trans_id: string }>,
) {
  if (!selectedPlanId.value || charging.value) return;
  charging.value = true;
  error.value = null;
  try {
    const { order_id } = await start();
    charging.value = false;
    settling.value = true;
    const settled = await pollClickOrder(order_id);

    if (settled?.status === 'paid') {
      payDone.value = true;
      celebratePremium.value = {
        planName: selectedPlan.value?.name ?? '',
        endsOn: settled.coverage_ends_at
          ? new Date(settled.coverage_ends_at).toLocaleDateString()
          : null,
      };
      // Entitlement is a separate store from the subscriptions list and drives
      // the "Free plan" badge.
      await entitlement.fetch();
      emit('changed');
    } else if (settled?.status === 'failed' || settled?.status === 'cancelled') {
      error.value = settled.error_note ?? t('cards.subscribe_failed');
    } else {
      // Ran out of attempts with the order unsettled. Deliberately NOT an
      // error: a slow callback is not a failed payment.
      error.value = t('cards.subscribe_slow');
    }
  } catch (e) {
    error.value = mapPayError(e);
  } finally {
    charging.value = false;
    settling.value = false;
    activeAction.value = null;
  }
}

// Click's hosted page. Kept as a third option for anyone whose card will not
// bind - an Uzcard with online payments disabled, or an SMS that never
// arrives. Full navigation rather than a router push: this leaves the SPA.
const redirecting = ref(false);

async function payWithClick() {
  if (!canAct.value || redirecting.value) return;
  redirecting.value = true;
  error.value = null;
  try {
    const handle = await clickApi.createOrder(selectedPlanId.value as string);
    window.location.href = handle.pay_url;
  } catch (e) {
    error.value = mapPayError(e);
    redirecting.value = false;
  }
}

async function toggleAutoRenew(next: boolean) {
  if (busy.value) return;
  busy.value = true;
  error.value = null;
  try {
    await clickApi.setAutoRenew(next);
    emit('changed');
  } catch (e) {
    error.value = e instanceof Error ? e.message : t('cards.auto_renew_failed');
  } finally {
    busy.value = false;
  }
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
  if (e instanceof Error) return e.message;
  return t('click.pay_error_generic');
}
</script>

<template>
  <section class="card mt-6">
    <h2 class="text-lg">{{ t('payment.title') }}</h2>
    <p class="dim text-sm mt-1">{{ t('payment.subtitle') }}</p>

    <p v-if="loading" class="dim text-sm mt-4">{{ t('common.loading') }}</p>
    <p v-else-if="loadError" class="error-text mt-4">{{ loadError }}</p>

    <template v-else>
      <p v-if="!enabled" class="dim text-sm mt-4">{{ t('click.unavailable') }}</p>
      <p v-else-if="plans.length === 0" class="dim text-sm mt-4">{{ t('click.no_plans') }}</p>

      <template v-else>
        <!-- 1. Plan -->
        <label class="field-label mt-4">{{ t('click.choose_plan') }}</label>
        <div class="segmented pay-plan-picker">
          <button v-for="p in plans" :key="p.id" type="button"
            :class="{ active: selectedPlanId === p.id }" @click="selectedPlanId = p.id">
            {{ planLabel(p) }}
          </button>
        </div>
        <p v-if="selectedPlan" class="pay-price mt-2">
          {{ formatPrice(selectedPlan.price_minor, selectedPlan.currency) }}
        </p>

        <!-- 2. Card on file -->
        <div v-if="card" class="pay-card mt-4">
          <span class="pay-card-number">{{ card.card_masked ?? t('cards.saved') }}</span>
          <button class="btn-link" style="color: var(--danger);" :disabled="busy"
            @click="removeCard">
            {{ t('cards.remove') }}
          </button>
        </div>
        <p v-if="card?.last_error" class="text-xs mt-1" style="color: var(--danger);">
          {{ card.last_error }}
        </p>

        <p v-if="error" class="error-text mt-4">{{ error }}</p>

        <!-- 3. Actions. Subscribe is the primary offer and leads; paying once
             is the alternative. When the plan is lifetime there is nothing to
             subscribe to, so the one-time button becomes the primary instead
             of leaving the row with no accent button at all. -->
        <div class="pay-actions mt-4">
          <button v-if="canSubscribe" type="button" class="btn btn-primary pay-btn"
            :disabled="!canAct" @click="startSubscribe">
            {{ isRunning('subscribe') ? t('common.loading') : t('payment.subscribe') }}
          </button>
          <button type="button"
            :class="['btn', 'pay-btn', canSubscribe ? 'pay-btn-alt' : 'btn-primary']"
            :disabled="!canAct" @click="startPayOnce">
            {{ isRunning('charge') ? t('common.loading') : t('payment.pay_once') }}
          </button>
        </div>
        <p class="dim text-xs mt-2">
          {{ canSubscribe ? t('payment.actions_hint') : t('payment.once_hint') }}
        </p>

        <!-- Card collection, inline, only once an action has been pressed. -->
        <div v-if="showForm && !card" class="pay-step mt-4">
          <div class="pay-step-head">{{ t('cards.step_card') }}</div>

          <template v-if="!pendingTokenId">
            <label class="field-label">{{ t('cards.number') }}</label>
            <input v-model="cardNumber" type="text" inputmode="numeric"
              autocomplete="cc-number" maxlength="19" placeholder="8600 0000 0000 0000"
              class="card-input" @input="onCardInput" />

            <label class="field-label mt-3">{{ t('cards.expiry') }}</label>
            <input v-model="expiry" type="text" inputmode="numeric" autocomplete="cc-exp"
              maxlength="5" placeholder="MM/YY" class="card-input card-input-short"
              @input="onExpiryInput" />

            <div class="admin-order-actions">
              <button class="btn btn-primary" :disabled="!canSubmitCard || busy"
                @click="startBinding">
                {{ busy ? t('common.loading') : t('cards.continue') }}
              </button>
              <button class="btn btn-ghost" :disabled="busy"
                @click="showForm = false; intent = null; resetForm()">
                {{ t('common.cancel') }}
              </button>
            </div>
          </template>

          <template v-else>
            <p class="text-sm">{{ t('cards.sms_sent', { phone: pendingPhone ?? '' }) }}</p>
            <label class="field-label mt-3">{{ t('cards.sms_code') }}</label>
            <input v-model="smsCode" type="text" inputmode="numeric" maxlength="8"
              autocomplete="one-time-code" class="card-input card-input-short"
              @input="onSmsInput" />
            <div class="admin-order-actions">
              <button class="btn btn-primary" :disabled="!smsCode || busy" @click="confirmSms">
                {{ busy ? t('common.loading') : t('cards.confirm') }}
              </button>
              <button class="btn btn-ghost" :disabled="busy" @click="resetForm">
                {{ t('common.cancel') }}
              </button>
            </div>
          </template>

          <p class="card-privacy dim text-xs">{{ t('cards.privacy_note') }}</p>
        </div>

        <!-- Settlement feedback. Without it the flow ended in silence. -->
        <p v-if="settling" class="dim text-sm mt-3">{{ t('cards.subscribe_settling') }}</p>
        <p v-else-if="payDone" class="text-sm mt-3" style="color: var(--success);">
          {{ t('cards.subscribe_done') }}
        </p>

        <!-- 4. Auto-renew, only against a subscription that exists. -->
        <div v-if="canAutoRenew && card" class="auto-renew-row mt-4">
          <div>
            <div style="font-weight: 500;">{{ t('cards.auto_renew') }}</div>
            <p class="dim text-xs mt-1">{{ t('cards.auto_renew_hint') }}</p>
          </div>
          <button class="toggle" :class="{ on: autoRenewOn }" :disabled="busy"
            :aria-label="t('cards.auto_renew')" @click="toggleAutoRenew(!autoRenewOn)">
            <span class="toggle-knob"></span>
          </button>
        </div>

        <!-- Click's hosted page. Explicitly named, below a divider: an
             alternative for cards that will not bind, not a third co-equal
             button competing with the two above. -->
        <div class="pay-click mt-4">
          <button type="button" class="btn-link accent" :disabled="!canAct || redirecting"
            @click="payWithClick">
            {{ redirecting ? t('click.opening') : t('click.pay_with_click') }}
          </button>
          <p class="dim text-xs mt-1">{{ t('payment.click_hint') }}</p>
        </div>
      </template>
    </template>
  </section>

  <CelebrationModal :open="celebratePremium !== null" :premium="celebratePremium"
    :level-reached="null" :achievements="[]" :badges="[]"
    @close="celebratePremium = null" />
</template>

<style scoped>
.pay-plan-picker {
  margin-top: 0.5rem;
}

.pay-price {
  font-size: 1.25rem;
  font-weight: 600;
}

.pay-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: 10px;
}

.pay-card-number {
  font-weight: 500;
}

.pay-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

/* min-width:0 so a long localized label can't blow the flex row out on
   narrow screens. */
.pay-btn {
  min-width: 0;
  flex: 0 1 auto;
}

/* Secondary action, distinct without competing with the primary. Colour
   transition only - no transform. */
.pay-btn-alt {
  background: var(--bg-elev);
  border: 1px solid var(--border);
  transition: background-color 0.15s ease, border-color 0.15s ease;
}

.pay-btn-alt:hover:not(:disabled) {
  border-color: var(--accent, var(--border));
}

.pay-step {
  padding: 1rem;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: 10px;
}

.pay-click {
  padding-top: 1rem;
  border-top: 1px solid var(--border);
}

.pay-step-head {
  font-weight: 500;
  margin-bottom: 0.75rem;
}
</style>
