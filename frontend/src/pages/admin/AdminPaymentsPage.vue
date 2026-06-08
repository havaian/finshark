<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { adminBillingApi } from '../../api/billing.api';
import {
  adminPaymentApi,
  adminPlanApi,
} from '../../api/payment.api';
import type { Plan } from '../../types/billing';
import type {
  AdminPaymentCard,
  AdminPaymentSubmission,
  PaymentSubmissionStatus,
} from '../../types/payment';

// Admin Payments page. Three blocks:
//   1. Plan pricing - edit price_minor + active toggle for premium plans
//      (the "adjustable amount" requirement). tier/period are not editable.
//   2. Receiving cards - CRUD for the cards shown to users for transfer.
//   3. Submission review queue - pending/approved/rejected, with slip preview
//      and approve/reject actions. Approving grants premium via the backend.

const { t } = useI18n();

// ── Shared load state ──────────────────────────────────────────────────────
const loading = ref(true);
const loadError = ref<string | null>(null);

const plans = ref<Plan[]>([]);
const cards = ref<AdminPaymentCard[]>([]);
const submissions = ref<AdminPaymentSubmission[]>([]);

// Review queue filter.
const statusFilter = ref<PaymentSubmissionStatus | 'all'>('pending');

async function loadAll() {
  loading.value = true;
  loadError.value = null;
  try {
    const [p, c, s] = await Promise.all([
      adminBillingApi.listPlans(),
      adminPaymentApi.listCards(),
      adminPaymentApi.listSubmissions(
        statusFilter.value === 'all' ? undefined : statusFilter.value
      ),
    ]);
    plans.value = p;
    cards.value = c;
    submissions.value = s;
  } catch {
    loadError.value = t('admin.payments.load_error');
  } finally {
    loading.value = false;
  }
}

onMounted(loadAll);

async function reloadSubmissions() {
  try {
    submissions.value = await adminPaymentApi.listSubmissions(
      statusFilter.value === 'all' ? undefined : statusFilter.value
    );
  } catch {
    /* keep current list on transient error */
  }
}

function setFilter(f: PaymentSubmissionStatus | 'all') {
  statusFilter.value = f;
  void reloadSubmissions();
}

function formatPrice(minor: number | null, currency: string | null): string {
  if (minor === null || currency === null) return '—';
  const major = minor / 100;
  return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(major)} ${currency}`;
}

// ── Block 1: plan pricing ────────────────────────────────────────────────
// Only premium plans are editable here (free has no price). We edit price in
// MAJOR units in the input for admin convenience, converting to minor on save.
const premiumPlans = computed(() => plans.value.filter((p) => p.tier === 'premium'));

// Per-plan local edit state, keyed by plan id.
const planEdits = ref<Record<string, { priceMajor: string; busy: boolean; error: string | null }>>({});

function editStateFor(p: Plan) {
  if (!planEdits.value[p.id]) {
    planEdits.value[p.id] = {
      priceMajor:
        p.price_minor !== null ? String(p.price_minor / 100) : '',
      busy: false,
      error: null,
    };
  }
  return planEdits.value[p.id];
}

async function savePlanPrice(p: Plan) {
  const st = editStateFor(p);
  st.error = null;
  const major = Number(st.priceMajor);
  if (!Number.isFinite(major) || major <= 0) {
    st.error = t('admin.payments.price_invalid');
    return;
  }
  // Convert major -> minor (×100), rounding to avoid float dust.
  const minor = Math.round(major * 100);
  st.busy = true;
  try {
    const updated = await adminPlanApi.updatePlan(p.id, { price_minor: minor });
    // Reflect the saved value back into the list.
    const idx = plans.value.findIndex((x) => x.id === p.id);
    if (idx >= 0) plans.value[idx] = updated;
  } catch (e) {
    st.error = extractError(e) ?? t('admin.payments.save_error');
  } finally {
    st.busy = false;
  }
}

async function togglePlanActive(p: Plan) {
  const st = editStateFor(p);
  st.busy = true;
  st.error = null;
  try {
    const updated = await adminPlanApi.updatePlan(p.id, {
      is_active: !p.is_active,
    });
    const idx = plans.value.findIndex((x) => x.id === p.id);
    if (idx >= 0) plans.value[idx] = updated;
  } catch (e) {
    st.error = extractError(e) ?? t('admin.payments.save_error');
  } finally {
    st.busy = false;
  }
}

// ── Block 2: cards CRUD ────────────────────────────────────────────────────
const showCardForm = ref(false);
const cardForm = ref<{
  id: string | null;
  card_number: string;
  holder_name: string;
  bank_label: string;
  is_active: boolean;
  sort_order: number;
}>({
  id: null,
  card_number: '',
  holder_name: '',
  bank_label: '',
  is_active: true,
  sort_order: 0,
});
const cardFormBusy = ref(false);
const cardFormError = ref<string | null>(null);

function openCreateCard() {
  cardForm.value = {
    id: null,
    card_number: '',
    holder_name: '',
    bank_label: '',
    is_active: true,
    sort_order: 0,
  };
  cardFormError.value = null;
  showCardForm.value = true;
}

function openEditCard(c: AdminPaymentCard) {
  cardForm.value = {
    id: c.id,
    card_number: c.card_number,
    holder_name: c.holder_name,
    bank_label: c.bank_label ?? '',
    is_active: c.is_active,
    sort_order: c.sort_order,
  };
  cardFormError.value = null;
  showCardForm.value = true;
}

function closeCardForm() {
  showCardForm.value = false;
}

async function saveCard() {
  cardFormError.value = null;
  const f = cardForm.value;
  if (f.card_number.replace(/\s+/g, '').length < 4) {
    cardFormError.value = t('admin.payments.card_number_invalid');
    return;
  }
  if (!f.holder_name.trim()) {
    cardFormError.value = t('admin.payments.card_holder_required');
    return;
  }
  cardFormBusy.value = true;
  try {
    const payload = {
      card_number: f.card_number.trim(),
      holder_name: f.holder_name.trim(),
      bank_label: f.bank_label.trim() ? f.bank_label.trim() : null,
      is_active: f.is_active,
      sort_order: f.sort_order,
    };
    if (f.id) {
      await adminPaymentApi.updateCard(f.id, payload);
    } else {
      await adminPaymentApi.createCard(payload);
    }
    cards.value = await adminPaymentApi.listCards();
    showCardForm.value = false;
  } catch (e) {
    cardFormError.value = extractError(e) ?? t('admin.payments.save_error');
  } finally {
    cardFormBusy.value = false;
  }
}

const deletingCardId = ref<string | null>(null);
async function deleteCard(c: AdminPaymentCard) {
  if (!window.confirm(t('admin.payments.card_delete_confirm'))) return;
  deletingCardId.value = c.id;
  try {
    await adminPaymentApi.deleteCard(c.id);
    cards.value = cards.value.filter((x) => x.id !== c.id);
  } catch {
    /* surfaced via alert below to keep it simple */
    window.alert(t('admin.payments.save_error'));
  } finally {
    deletingCardId.value = null;
  }
}

function displayCardNumber(raw: string): string {
  return raw.replace(/\s+/g, '').replace(/(.{4})/g, '$1 ').trim();
}

// ── Block 3: submission review ──────────────────────────────────────────────
// Slip preview modal state.
const slipModalOpen = ref(false);
const slipUrl = ref<string | null>(null);
const slipMime = ref<string>('');
const slipLoading = ref(false);
const activeSubmission = ref<AdminPaymentSubmission | null>(null);
const reviewNote = ref('');
const reviewBusy = ref(false);
const reviewError = ref<string | null>(null);

async function openSlip(s: AdminPaymentSubmission) {
  activeSubmission.value = s;
  reviewNote.value = '';
  reviewError.value = null;
  slipModalOpen.value = true;
  slipLoading.value = true;
  slipUrl.value = null;
  try {
    const { url, mime } = await adminPaymentApi.fetchSlip(s.id);
    slipUrl.value = url;
    slipMime.value = mime;
  } catch {
    reviewError.value = t('admin.payments.slip_load_error');
  } finally {
    slipLoading.value = false;
  }
}

function closeSlip() {
  slipModalOpen.value = false;
  // Release the object URL to avoid a memory leak.
  if (slipUrl.value) {
    URL.revokeObjectURL(slipUrl.value);
    slipUrl.value = null;
  }
  activeSubmission.value = null;
}

const slipIsPdf = computed(() => slipMime.value === 'application/pdf');

async function approve() {
  if (!activeSubmission.value || reviewBusy.value) return;
  reviewBusy.value = true;
  reviewError.value = null;
  try {
    await adminPaymentApi.approve(
      activeSubmission.value.id,
      reviewNote.value.trim() || undefined
    );
    closeSlip();
    await reloadSubmissions();
  } catch (e) {
    reviewError.value = extractError(e) ?? t('admin.payments.review_error');
  } finally {
    reviewBusy.value = false;
  }
}

async function reject() {
  if (!activeSubmission.value || reviewBusy.value) return;
  reviewBusy.value = true;
  reviewError.value = null;
  try {
    await adminPaymentApi.reject(
      activeSubmission.value.id,
      reviewNote.value.trim() || undefined
    );
    closeSlip();
    await reloadSubmissions();
  } catch (e) {
    reviewError.value = extractError(e) ?? t('admin.payments.review_error');
  } finally {
    reviewBusy.value = false;
  }
}

function statusPillClass(status: PaymentSubmissionStatus): string {
  if (status === 'approved') return 'pill pill-green';
  if (status === 'rejected') return 'pill pill-red';
  return 'pill pill-amber';
}

function extractError(e: unknown): string | null {
  if (e instanceof AxiosError) {
    const msg = (e.response?.data as { message?: string | string[] })?.message;
    return Array.isArray(msg) ? msg.join(', ') : msg ?? null;
  }
  return null;
}
</script>

<template>
  <div class="container-wide">
    <div class="topbar">
      <h1>{{ t('admin.payments.title') }}</h1>
    </div>
    <p class="dim text-sm">{{ t('admin.payments.sub') }}</p>

    <p v-if="loading" class="dim text-sm mt-4">{{ t('common.loading') }}</p>
    <p v-else-if="loadError" class="error-text mt-4">{{ loadError }}</p>

    <template v-else>
      <!-- ── Block 1: Plan pricing ─────────────────────────────────────── -->
      <section class="card mt-4">
        <h2>{{ t('admin.payments.plans_title') }}</h2>
        <p class="dim text-sm mt-1">{{ t('admin.payments.plans_sub') }}</p>

        <ul class="list-bordered mt-4">
          <li v-for="p in premiumPlans" :key="p.id" class="list-row admin-plan-row">
            <div class="admin-plan-info">
              <strong>{{ p.name }}</strong>
              <span class="dim text-sm">
                {{ p.period_days === null ? t('payments.plan_lifetime') : t('admin.payments.period_days', { n: p.period_days }) }}
                · {{ p.currency }}
              </span>
            </div>
            <div class="admin-plan-controls">
              <div class="admin-price-field">
                <input
                  v-model="editStateFor(p).priceMajor"
                  type="number"
                  min="1"
                  step="any"
                  :disabled="editStateFor(p).busy"
                />
                <button
                  class="btn btn-sm btn-primary"
                  :disabled="editStateFor(p).busy"
                  @click="savePlanPrice(p)"
                >
                  {{ editStateFor(p).busy ? t('common.saving') : t('admin.payments.save_price') }}
                </button>
              </div>
              <button
                class="btn btn-sm"
                :class="p.is_active ? 'btn-ghost' : 'btn-primary'"
                :disabled="editStateFor(p).busy"
                @click="togglePlanActive(p)"
              >
                {{ p.is_active ? t('admin.payments.deactivate') : t('admin.payments.activate') }}
              </button>
              <span :class="p.is_active ? 'pill pill-green' : 'pill pill-grey'">
                {{ p.is_active ? t('admin.payments.active') : t('admin.payments.inactive') }}
              </span>
            </div>
            <p v-if="editStateFor(p).error" class="error-text text-sm" style="flex-basis: 100%;">
              {{ editStateFor(p).error }}
            </p>
          </li>
        </ul>
      </section>

      <!-- ── Block 2: Cards ────────────────────────────────────────────── -->
      <section class="card mt-6">
        <div class="topbar">
          <h2>{{ t('admin.payments.cards_title') }}</h2>
          <button class="btn btn-primary btn-sm" @click="openCreateCard">
            + {{ t('admin.payments.add_card') }}
          </button>
        </div>
        <p class="dim text-sm mt-1">{{ t('admin.payments.cards_sub') }}</p>

        <p v-if="cards.length === 0" class="dim text-sm mt-4">{{ t('admin.payments.no_cards') }}</p>
        <ul v-else class="list-bordered mt-4">
          <li v-for="c in cards" :key="c.id" class="list-row admin-card-row">
            <div class="admin-card-info">
              <span class="admin-card-number">{{ displayCardNumber(c.card_number) }}</span>
              <span class="dim text-sm">
                {{ c.holder_name }}<template v-if="c.bank_label"> · {{ c.bank_label }}</template>
              </span>
            </div>
            <div class="admin-card-actions">
              <span :class="c.is_active ? 'pill pill-green' : 'pill pill-grey'">
                {{ c.is_active ? t('admin.payments.active') : t('admin.payments.inactive') }}
              </span>
              <button class="btn btn-sm btn-ghost" @click="openEditCard(c)">
                {{ t('admin.payments.edit') }}
              </button>
              <button
                class="btn btn-sm btn-danger"
                :disabled="deletingCardId === c.id"
                @click="deleteCard(c)"
              >
                {{ t('admin.payments.delete') }}
              </button>
            </div>
          </li>
        </ul>
      </section>

      <!-- ── Block 3: Submission review ────────────────────────────────── -->
      <section class="card mt-6">
        <h2>{{ t('admin.payments.submissions_title') }}</h2>
        <div class="segmented mt-2">
          <button type="button" :class="{ active: statusFilter === 'pending' }" @click="setFilter('pending')">
            {{ t('admin.payments.filter_pending') }}
          </button>
          <button type="button" :class="{ active: statusFilter === 'approved' }" @click="setFilter('approved')">
            {{ t('admin.payments.filter_approved') }}
          </button>
          <button type="button" :class="{ active: statusFilter === 'rejected' }" @click="setFilter('rejected')">
            {{ t('admin.payments.filter_rejected') }}
          </button>
          <button type="button" :class="{ active: statusFilter === 'all' }" @click="setFilter('all')">
            {{ t('admin.payments.filter_all') }}
          </button>
        </div>

        <p v-if="submissions.length === 0" class="dim text-sm mt-4">{{ t('admin.payments.no_submissions') }}</p>
        <ul v-else class="list-bordered mt-4">
          <li v-for="s in submissions" :key="s.id" class="list-row admin-sub-row">
            <div class="admin-sub-info">
              <div>
                <strong>{{ s.user_name || s.user_email || s.user_id }}</strong>
                <span class="dim text-sm" style="margin-left: 0.5rem;">{{ s.plan_name || s.plan_id }}</span>
              </div>
              <span class="dim text-sm">{{ formatPrice(s.amount_minor, s.currency) }}</span>
              <span class="dim text-xs">{{ new Date(s.created_at).toLocaleString() }}</span>
              <p v-if="s.review_note" class="dim text-xs mt-1">{{ s.review_note }}</p>
            </div>
            <div class="admin-sub-actions">
              <span :class="statusPillClass(s.status)">{{ t('payments.status_' + s.status) }}</span>
              <button class="btn btn-sm btn-primary" @click="openSlip(s)">
                {{ s.status === 'pending' ? t('admin.payments.review') : t('admin.payments.view_slip') }}
              </button>
            </div>
          </li>
        </ul>
      </section>
    </template>

    <!-- Card create/edit modal -->
    <Teleport to="body">
      <div v-if="showCardForm" class="modal-overlay" @click.self="closeCardForm">
        <div class="modal-card">
          <h3>{{ cardForm.id ? t('admin.payments.edit_card') : t('admin.payments.add_card') }}</h3>

          <label class="field-label mt-4">{{ t('admin.payments.card_number_label') }}</label>
          <input v-model="cardForm.card_number" type="text" inputmode="numeric" maxlength="64" autocomplete="off" />

          <label class="field-label mt-4">{{ t('admin.payments.card_holder_label') }}</label>
          <input v-model="cardForm.holder_name" type="text" maxlength="120" autocomplete="off" />

          <label class="field-label mt-4">{{ t('admin.payments.card_bank_label') }}</label>
          <input v-model="cardForm.bank_label" type="text" maxlength="120" autocomplete="off" />

          <label class="field-label mt-4">{{ t('admin.payments.card_sort_label') }}</label>
          <input v-model.number="cardForm.sort_order" type="number" min="0" />

          <label class="mt-4" style="display: flex; align-items: center; gap: 0.5rem;">
            <input v-model="cardForm.is_active" type="checkbox" />
            {{ t('admin.payments.card_active_label') }}
          </label>

          <p v-if="cardFormError" class="error-text mt-2">{{ cardFormError }}</p>

          <div class="row mt-4" style="gap: 0.5rem;">
            <button class="btn btn-primary" :disabled="cardFormBusy" @click="saveCard">
              {{ cardFormBusy ? t('common.saving') : t('admin.payments.save') }}
            </button>
            <button class="btn btn-ghost" :disabled="cardFormBusy" @click="closeCardForm">
              {{ t('common.cancel') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Slip review modal -->
    <Teleport to="body">
      <div v-if="slipModalOpen" class="modal-overlay" @click.self="closeSlip">
        <div class="modal-card modal-card-wide">
          <h3>{{ t('admin.payments.slip_review_title') }}</h3>
          <p v-if="activeSubmission" class="dim text-sm mt-1">
            {{ activeSubmission.user_name || activeSubmission.user_email }} ·
            {{ activeSubmission.plan_name || activeSubmission.plan_id }} ·
            {{ formatPrice(activeSubmission.amount_minor, activeSubmission.currency) }}
          </p>

          <div class="slip-preview mt-4">
            <p v-if="slipLoading" class="dim text-sm">{{ t('common.loading') }}</p>
            <template v-else-if="slipUrl">
              <iframe v-if="slipIsPdf" :src="slipUrl" class="slip-frame" :title="t('admin.payments.slip_review_title')"></iframe>
              <img v-else :src="slipUrl" :alt="t('admin.payments.slip_review_title')" class="slip-image" />
            </template>
            <p v-else class="error-text">{{ t('admin.payments.slip_load_error') }}</p>
          </div>

          <!-- Review actions only for pending submissions. -->
          <template v-if="activeSubmission && activeSubmission.status === 'pending'">
            <label class="field-label mt-4">{{ t('admin.payments.review_note_label') }}</label>
            <input v-model="reviewNote" type="text" maxlength="500" :placeholder="t('admin.payments.review_note_placeholder')" />

            <p v-if="reviewError" class="error-text mt-2">{{ reviewError }}</p>

            <div class="row mt-4" style="gap: 0.5rem;">
              <button class="btn btn-primary" :disabled="reviewBusy" @click="approve">
                {{ reviewBusy ? t('common.saving') : t('admin.payments.approve') }}
              </button>
              <button class="btn btn-danger" :disabled="reviewBusy" @click="reject">
                {{ t('admin.payments.reject') }}
              </button>
              <button class="btn btn-ghost" :disabled="reviewBusy" @click="closeSlip">
                {{ t('common.cancel') }}
              </button>
            </div>
          </template>
          <div v-else class="row mt-4">
            <button class="btn btn-ghost" @click="closeSlip">{{ t('common.close') }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.admin-plan-row,
.admin-card-row,
.admin-sub-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.admin-plan-info,
.admin-card-info,
.admin-sub-info {
  display: flex;
  flex-direction: column;
  gap: 0.15rem;
  min-width: 0;
}
.admin-plan-controls,
.admin-card-actions,
.admin-sub-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}
.admin-price-field {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}
.admin-price-field input {
  width: 9rem;
}
.admin-card-number {
  font-family: ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, monospace;
  letter-spacing: 0.04em;
  word-break: break-all;
}
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  z-index: 100;
}
.modal-card {
  background: var(--bg-card);
  border: 1px solid var(--border);
  border-radius: 0.75rem;
  padding: 1.5rem;
  width: 100%;
  max-width: 28rem;
  max-height: 90vh;
  overflow-y: auto;
}
.modal-card-wide {
  max-width: 44rem;
}
.slip-preview {
  display: flex;
  justify-content: center;
  background: var(--bg-elev);
  border-radius: 0.5rem;
  padding: 0.5rem;
  min-height: 12rem;
}
.slip-image {
  max-width: 100%;
  max-height: 60vh;
  object-fit: contain;
}
.slip-frame {
  width: 100%;
  height: 60vh;
  border: none;
}
</style>
