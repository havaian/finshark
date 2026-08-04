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

defineProps<{
  // Auto-renew can only be enabled against a subscription that actually ends.
  canAutoRenew: boolean;
  autoRenewOn: boolean;
}>();

const emit = defineEmits<{ (e: 'changed'): void }>();
const { t } = useI18n();

const card = ref<SavedCard | null>(null);
const loading = ref(true);
const busy = ref(false);
const error = ref<string | null>(null);

// Binding form
const showForm = ref(false);
const cardNumber = ref('');
const expiry = ref('');
const smsCode = ref('');
const pendingTokenId = ref<string | null>(null);
const pendingPhone = ref<string | null>(null);

const digitsOnly = computed(() => cardNumber.value.replace(/\D/g, ''));
const expiryDigits = computed(() => expiry.value.replace(/\D/g, ''));
const canSubmitCard = computed(
  () => digitsOnly.value.length >= 16 && expiryDigits.value.length === 4,
);

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
  <section class="card mt-6">
    <h2>{{ t('cards.title') }}</h2>

    <p v-if="loading" class="dim text-sm mt-2">{{ t('common.loading') }}</p>

    <template v-else>
      <!-- Saved card -->
      <div v-if="card" class="saved-card mt-3">
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

      <!-- Auto-renew. Only offered once a card exists: enabling it without one
           would schedule a renewal that can never succeed. -->
      <div v-if="card && canAutoRenew" class="auto-renew-row mt-4">
        <div>
          <div style="font-weight: 500;">{{ t('cards.auto_renew') }}</div>
          <p class="dim text-xs mt-1">{{ t('cards.auto_renew_hint') }}</p>
        </div>
        <input type="checkbox" :checked="autoRenewOn" :disabled="busy"
          :aria-label="t('cards.auto_renew')"
          @change="toggleAutoRenew(($event.target as HTMLInputElement).checked)" />
      </div>

      <!-- Binding form -->
      <template v-if="!card">
        <p v-if="!showForm" class="dim text-sm mt-2">{{ t('cards.none_hint') }}</p>
        <button v-if="!showForm" class="btn btn-secondary mt-3" @click="showForm = true">
          {{ t('cards.add') }}
        </button>

        <div v-else class="mt-3">
          <!-- Step 1: card details -->
          <template v-if="!pendingTokenId">
            <label class="field">
              <span class="field-label">{{ t('cards.number') }}</span>
              <input v-model="cardNumber" inputmode="numeric" autocomplete="cc-number"
                maxlength="23" placeholder="8600 0000 0000 0000" />
            </label>
            <label class="field mt-2">
              <span class="field-label">{{ t('cards.expiry') }}</span>
              <input v-model="expiry" inputmode="numeric" autocomplete="cc-exp"
                maxlength="5" placeholder="MM/YY" />
            </label>
            <div class="admin-order-actions mt-3">
              <button class="btn btn-primary" :disabled="!canSubmitCard || busy"
                @click="startBinding">
                {{ busy ? t('common.loading') : t('cards.continue') }}
              </button>
              <button class="btn btn-ghost" :disabled="busy"
                @click="showForm = false; resetForm()">
                {{ t('common.cancel') }}
              </button>
            </div>
          </template>

          <!-- Step 2: SMS -->
          <template v-else>
            <p class="text-sm">
              {{ t('cards.sms_sent', { phone: pendingPhone ?? '' }) }}
            </p>
            <label class="field mt-2">
              <span class="field-label">{{ t('cards.sms_code') }}</span>
              <input v-model="smsCode" inputmode="numeric" maxlength="8" />
            </label>
            <div class="admin-order-actions mt-3">
              <button class="btn btn-primary" :disabled="!smsCode || busy"
                @click="confirmSms">
                {{ busy ? t('common.loading') : t('cards.confirm') }}
              </button>
              <button class="btn btn-ghost" :disabled="busy" @click="resetForm">
                {{ t('common.cancel') }}
              </button>
            </div>
          </template>
        </div>
      </template>

      <p v-if="error" class="text-sm mt-3" style="color: var(--danger);">{{ error }}</p>
    </template>
  </section>
</template>
