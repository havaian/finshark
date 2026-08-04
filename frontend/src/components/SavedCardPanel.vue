<script setup lang="ts">
// Saved card + automatic renewal.
//
// THE CARD NUMBER NEVER REACHES OUR SERVER on the happy path. Click's
// card_token/request takes no Auth header precisely so the browser can call it
// directly; we post the PAN there and keep only the token that comes back.
//
// If that direct call is blocked (CORS), we fall back to posting the number to
// our own backend, which forwards it to Click without storing or logging it.
// The fallback is a degraded path, not the design - hence the attempt order.
//
// Binding is two steps because Click sends an SMS: request/adopt gets a
// pending token, verify confirms it. Only a verified token can be charged.
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { clickApi } from '../api/click.api';
import type { SavedCard } from '../types/click';

const props = defineProps<{
  // Auto-renew can only be toggled against a subscription that actually ends.
  canAutoRenew: boolean;
  autoRenewOn: boolean;
  // Plans available to subscribe to. Empty while they load.
  plans?: {
    id: string;
    name: string;
    price_minor: number | null;
    currency: string | null;
    period_days: number | null;
  }[];
}>();

const emit = defineEmits<{ (e: 'changed'): void }>();
const { t } = useI18n();

const card = ref<SavedCard | null>(null);
const loading = ref(true);
const busy = ref(false);
const error = ref<string | null>(null);

// Binding form
const showForm = ref(false);
const subscribing = ref(false);
const selectedPlanId = ref<string>('');

// Subscribing is offered whenever there is NO active subscription - with one
// running, the auto-renew toggle is the right control and a second "subscribe"
// button would charge for a period the user already owns.
//
// Crucially this does NOT require a saved card. Hiding Subscribe until a card
// existed left "Add card" as the only visible action, which is a means with no
// stated end: nobody wants to add a card, they want the subscription. The card
// is now collected as a step inside subscribing.
const canSubscribe = computed(
  () => !props.canAutoRenew && (props.plans?.length ?? 0) > 0,
);

// Set when the user pressed Subscribe without a saved card. The binding form
// then runs as step 1, and verification continues straight into the charge
// instead of dumping them back on a page with a new button to find.
const subscribeIntent = ref(false);

const selectedPlan = computed(
  () => props.plans?.find((p) => p.id === selectedPlanId.value) ?? null,
);

// Same formatting as the one-time panel so the two prices are comparable at a
// glance rather than looking like different currencies.
function formatPrice(minor: number | null, currency: string | null): string {
  if (minor === null || currency === null) return '';
  const grouped = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(
    minor / 100,
  );
  return `${grouped} ${currency}`;
}
const cardNumber = ref('');
const expiry = ref('');
const smsCode = ref('');
const pendingTokenId = ref<string | null>(null);
const pendingPhone = ref<string | null>(null);

const digitsOnly = computed(() => cardNumber.value.replace(/\D/g, ''));
const expiryDigits = computed(() => expiry.value.replace(/\D/g, ''));
// Uzcard (8600...) and Humo (9860...) are both exactly 16 digits, and Click's
// card_token/request only issues tokens for those two schemes. The old
// `>= 16` with a 19-digit cap came from generic PAN rules and let a
// mistyped 17-19 digit number through to Click for no reason.
const CARD_DIGITS = 16;

const canSubmitCard = computed(
  () => digitsOnly.value.length === CARD_DIGITS && expiryDigits.value.length === 4,
);

// Group the card number in fours as it is typed. Purely presentational -
// digitsOnly is what gets sent - but an ungrouped 16-digit run is genuinely
// hard to check by eye.
function onCardInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, CARD_DIGITS);
  cardNumber.value = raw.replace(/(.{4})/g, '$1 ').trim();
}

// Insert the slash after MM so the user does not have to type it.
function onExpiryInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 4);
  expiry.value = raw.length > 2 ? `${raw.slice(0, 2)}/${raw.slice(2)}` : raw;
}

function onSmsInput(e: Event) {
  smsCode.value = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 8);
}

async function load() {
  loading.value = true;
  try {
    card.value = await clickApi.getSavedCard();
  } catch {
    card.value = null;
  } finally {
    loading.value = false;
  }
}
onMounted(load);

function resetForm() {
  cardNumber.value = '';
  expiry.value = '';
  smsCode.value = '';
  pendingTokenId.value = null;
  pendingPhone.value = null;
  error.value = null;
}

// Step 1. Try Click directly first so the PAN bypasses us entirely; fall back
// to our backend only if that request cannot be made.
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
    // Clear the number the moment it is no longer needed. It is only ever in
    // this component's memory, but there is no reason to keep it a second
    // longer than the request that used it.
    cardNumber.value = '';
    expiry.value = '';
  } catch (e) {
    error.value = e instanceof Error ? e.message : t('cards.bind_failed');
  } finally {
    busy.value = false;
  }
}

// Step 2.
async function confirmSms() {
  if (!pendingTokenId.value || busy.value) return;
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
    // The card was only ever collected to subscribe, so finish the job.
    if (subscribeIntent.value) {
      subscribeIntent.value = false;
      await subscribeNow();
    }
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

// Charge the saved card now and come back subscribed. The subscription itself
// lands via Click's callbacks, so we reload rather than assume.
// Entry point for the Subscribe button. With a card this charges; without one
// it opens the card form and remembers why we opened it.
async function startSubscribe() {
  if (!selectedPlanId.value || subscribing.value) return;
  if (!card.value) {
    subscribeIntent.value = true;
    showForm.value = true;
    return;
  }
  await subscribeNow();
}

async function subscribeNow() {
  if (!selectedPlanId.value || subscribing.value) return;
  subscribing.value = true;
  error.value = null;
  try {
    await clickApi.subscribeNow(selectedPlanId.value);
    emit('changed');
  } catch (e) {
    error.value = e instanceof Error ? e.message : t('cards.subscribe_failed');
  } finally {
    subscribing.value = false;
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
</script>

<template>
  <!-- SUBSCRIPTION FIRST. This is what the user actually wants; saving a card
       is a step toward it, not a task in its own right. The panel renders even
       with no card saved - pressing Subscribe then collects one and continues
       automatically, so "add a card" always has a stated purpose. -->
  <section v-if="!loading && canSubscribe" class="card mt-6 subscribe-panel">
    <h2>{{ t('cards.subscribe_heading') }}</h2>
    <p class="dim text-sm mt-1">{{ t('cards.subscribe_lead') }}</p>

    <label class="field-label mt-4">{{ t('cards.subscribe_plan') }}</label>
    <div class="subscribe-row">
      <div class="segmented click-plan-picker">
        <button v-for="p in props.plans" :key="p.id" type="button"
          :class="{ active: selectedPlanId === p.id }" @click="selectedPlanId = p.id">
          {{ p.name }}
        </button>
      </div>
      <button class="btn btn-primary" :disabled="!selectedPlanId || subscribing"
        @click="startSubscribe">
        {{ subscribing ? t('common.loading') : t('cards.subscribe_cta') }}
      </button>
    </div>
    <p v-if="selectedPlan" class="click-price mt-3">
      {{ formatPrice(selectedPlan.price_minor, selectedPlan.currency) }}
      <span v-if="selectedPlan.period_days" class="dim text-sm subscribe-period">
        {{ t('cards.per_period', { days: selectedPlan.period_days }) }}
      </span>
    </p>
    <p class="dim text-xs mt-2">
      <template v-if="selectedPlan && selectedPlan.period_days">
        {{ t('cards.subscribe_hint_priced', {
          price: formatPrice(selectedPlan.price_minor, selectedPlan.currency),
          days: selectedPlan.period_days,
        }) }}
      </template>
      <template v-else>{{ t('cards.subscribe_hint') }}</template>
    </p>

    <!-- Card collection, inline, only once Subscribe has been pressed. -->
    <div v-if="showForm && !card" class="subscribe-step mt-4">
      <div class="subscribe-step-head">{{ t('cards.step_card') }}</div>

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
            @click="showForm = false; subscribeIntent = false; resetForm()">
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

    <p v-if="error" class="text-sm mt-3" style="color: var(--danger);">{{ error }}</p>
  </section>

  <!-- Saved card. Secondary: a record of what is on file, plus removal. Only
       shown once a card exists - there is nothing to say otherwise. -->
  <section v-if="!loading && card" class="card mt-6">
    <h2>{{ t('cards.title') }}</h2>

    <div class="saved-card mt-3">
      <div>
        <div class="saved-card-number">{{ card.card_masked ?? t('cards.saved') }}</div>
        <p v-if="card.last_error" class="text-xs mt-1" style="color: var(--danger);">
          {{ card.last_error }}
        </p>
      </div>
      <button class="btn-link" style="color: var(--danger);" :disabled="busy"
        @click="removeCard">
        {{ t('cards.remove') }}
      </button>
    </div>

    <!-- Auto-renew, for a subscription that already exists. -->
    <div v-if="canAutoRenew" class="auto-renew-row mt-4">
      <div>
        <div style="font-weight: 500;">{{ t('cards.auto_renew') }}</div>
        <p class="dim text-xs mt-1">{{ t('cards.auto_renew_hint') }}</p>
      </div>
      <button class="toggle" :class="{ on: autoRenewOn }" :disabled="busy"
        :aria-label="t('cards.auto_renew')" @click="toggleAutoRenew(!autoRenewOn)">
        <span class="toggle-knob"></span>
      </button>
    </div>

    <p v-if="error && !canSubscribe" class="text-sm mt-3" style="color: var(--danger);">
      {{ error }}
    </p>
  </section>
</template>
