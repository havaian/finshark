<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { adminBillingApi } from '../../api/billing.api';
import type {
  Plan,
  Promocode,
  PromocodeRedemption,
} from '../../types/billing';

// Promocodes admin page. Three things in one screen:
//   1. List of all codes (newest first, server-sorted).
//   2. "New code" inline form (toggleable).
//   3. Redemptions drill-in modal (when admin clicks "Redemptions" on a row).
//
// Edit-after-create is intentionally limited to the active flag — same as the
// backend surface. Anything else (window, plan, days) should be a new code.

const { t } = useI18n();

const codes = ref<Promocode[]>([]);
const plans = ref<Plan[]>([]);
// Plans keyed by id for cheap display lookups in the codes table.
const plansById = computed(() => {
  const map = new Map<string, Plan>();
  for (const p of plans.value) map.set(p.id, p);
  return map;
});

const loading = ref(false);
const errorMsg = ref<string | null>(null);
// Track per-row in-flight toggles so we disable the right buttons.
const busyIds = ref<Set<string>>(new Set());

async function load() {
  loading.value = true;
  errorMsg.value = null;
  try {
    const [c, p] = await Promise.all([
      adminBillingApi.listPromocodes(),
      adminBillingApi.listPlans(),
    ]);
    codes.value = c;
    plans.value = p;
    // Pre-select first premium plan in the create form for convenience.
    if (formPlanId.value === '' && p.length > 0) {
      const firstPremium = p.find((x) => x.tier === 'premium' && x.is_active);
      formPlanId.value = firstPremium?.id ?? '';
    }
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to load promocodes';
  } finally {
    loading.value = false;
  }
}

// ---- Create form ----
const showCreate = ref(false);
const formCode = ref('');
const formPlanId = ref('');
const formDays = ref(''); // string so the empty state is distinguishable from 0
const formMaxRedemptions = ref(''); // empty = unlimited
const formPerUserLimit = ref('1');
const formValidFrom = ref('');
const formValidUntil = ref('');
const formNotes = ref('');
const createBusy = ref(false);
const createError = ref<string | null>(null);

function toggleCreate() {
  showCreate.value = !showCreate.value;
  if (showCreate.value) createError.value = null;
}

function resetForm() {
  formCode.value = '';
  // Keep plan id as the convenience default so consecutive creates feel fast.
  formDays.value = '';
  formMaxRedemptions.value = '';
  formPerUserLimit.value = '1';
  formValidFrom.value = '';
  formValidUntil.value = '';
  formNotes.value = '';
}

async function onCreate() {
  if (createBusy.value) return;
  const code = formCode.value.trim();
  if (!code || !formPlanId.value) return;

  createBusy.value = true;
  createError.value = null;
  try {
    const days = formDays.value.trim();
    const maxR = formMaxRedemptions.value.trim();
    const perU = formPerUserLimit.value.trim();
    const vf = formValidFrom.value.trim();
    const vu = formValidUntil.value.trim();
    const notes = formNotes.value.trim();

    const created = await adminBillingApi.createPromocode({
      code,
      grant_plan_id: formPlanId.value,
      // Empty string → undefined so the server falls back to plan period.
      // A positive number wins; 0 is rejected by class-validator @Min(1).
      grant_days: days === '' ? undefined : parseInt(days, 10),
      max_redemptions: maxR === '' ? undefined : parseInt(maxR, 10),
      per_user_limit: perU === '' ? undefined : parseInt(perU, 10),
      // Date inputs return YYYY-MM-DD — convert to ISO at midnight UTC so
      // the backend (ISO8601) accepts it. Empty stays null.
      valid_from: vf === '' ? null : new Date(`${vf}T00:00:00Z`).toISOString(),
      valid_until: vu === '' ? null : new Date(`${vu}T23:59:59Z`).toISOString(),
      notes: notes === '' ? null : notes,
    });
    // Newest first — prepend.
    codes.value = [created, ...codes.value];
    resetForm();
    showCreate.value = false;
  } catch (e) {
    createError.value = extractError(e) ?? 'failed to create promocode';
  } finally {
    createBusy.value = false;
  }
}

// ---- Toggle active ----
async function toggleActive(code: Promocode) {
  if (busyIds.value.has(code.id)) return;
  busyIds.value.add(code.id);
  errorMsg.value = null;
  try {
    const updated = await adminBillingApi.setPromocodeActive(code.id, !code.is_active);
    codes.value = codes.value.map((c) => (c.id === updated.id ? updated : c));
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to update promocode';
  } finally {
    busyIds.value.delete(code.id);
  }
}

// ---- Redemptions drill-in ----
const redemptionsModal = ref<{
  code: Promocode;
  redemptions: PromocodeRedemption[];
  loading: boolean;
} | null>(null);

async function openRedemptions(code: Promocode) {
  redemptionsModal.value = { code, redemptions: [], loading: true };
  try {
    const res = await adminBillingApi.listRedemptions(code.id);
    redemptionsModal.value = {
      code: res.promocode,
      redemptions: res.redemptions,
      loading: false,
    };
  } catch {
    redemptionsModal.value = {
      code,
      redemptions: [],
      loading: false,
    };
  }
}

function closeRedemptions() {
  redemptionsModal.value = null;
}

// ---- Display helpers ----
function statusOf(c: Promocode): string {
  if (!c.is_active) return t('admin.promocodes.status_disabled');
  if (c.max_redemptions !== null && c.redemption_count >= c.max_redemptions) {
    return t('admin.promocodes.status_exhausted');
  }
  const now = new Date();
  if (c.valid_from && new Date(c.valid_from) > now) {
    return t('admin.promocodes.status_window_pending');
  }
  if (c.valid_until && new Date(c.valid_until) < now) {
    return t('admin.promocodes.status_window_expired');
  }
  return t('admin.promocodes.status_active');
}

function grantsOf(c: Promocode): string {
  const plan = plansById.value.get(c.grant_plan_id);
  const planLabel = plan?.name ?? c.grant_plan_id;
  // Resolve the effective days: explicit grant_days wins, otherwise the
  // plan's own period (null = lifetime).
  const days = c.grant_days ?? plan?.period_days ?? null;
  if (days === null) {
    return t('admin.promocodes.grants_format_lifetime', { plan: planLabel });
  }
  return t('admin.promocodes.grants_format', { plan: planLabel, days });
}

function usedOf(c: Promocode): string {
  if (c.max_redemptions === null) {
    return t('admin.promocodes.used_format_unlimited', { count: c.redemption_count });
  }
  return t('admin.promocodes.used_format', {
    count: c.redemption_count,
    max: c.max_redemptions,
  });
}

function windowOf(c: Promocode): string {
  if (!c.valid_from && !c.valid_until) return t('admin.promocodes.window_open');
  const from = c.valid_from ? new Date(c.valid_from).toLocaleDateString() : null;
  const until = c.valid_until ? new Date(c.valid_until).toLocaleDateString() : null;
  if (from && until) return t('admin.promocodes.window_between', { from, until });
  if (from) return t('admin.promocodes.window_from', { date: from });
  if (until) return t('admin.promocodes.window_until', { date: until });
  return '';
}

function extractError(e: unknown): string | null {
  if (e instanceof AxiosError) {
    const msg = (e.response?.data as { message?: string | string[] })?.message;
    return Array.isArray(msg) ? msg.join(', ') : msg ?? null;
  }
  return null;
}

onMounted(load);
</script>

<template>
  <div class="container-wide">
    <div class="topbar">
      <h1>{{ t('admin.promocodes.title') }}</h1>
      <button class="btn btn-primary" @click="toggleCreate">
        + {{ t('admin.promocodes.add_btn') }}
      </button>
    </div>
    <p class="dim text-sm">{{ t('admin.promocodes.sub') }}</p>

    <p v-if="errorMsg" class="error-text mt-4">{{ errorMsg }}</p>

    <!-- Create form (toggle). Keeps everything inline so admins don't bounce
         between routes for a small create. -->
    <section v-if="showCreate" class="card mt-4">
      <h3>{{ t('admin.promocodes.add_modal_title') }}</h3>

      <div class="row mt-4" style="gap: 12px; flex-wrap: wrap;">
        <div class="field" style="flex: 1 1 200px;">
          <label class="field-label">{{ t('admin.promocodes.form_code_label') }}</label>
          <input v-model="formCode" type="text" maxlength="64"
            :placeholder="t('admin.promocodes.form_code_ph')"
            style="font-family: ui-monospace, monospace; text-transform: lowercase;" />
        </div>
        <div class="field" style="flex: 1 1 200px;">
          <label class="field-label">{{ t('admin.promocodes.form_plan_label') }}</label>
          <select v-model="formPlanId">
            <option value="" disabled>—</option>
            <option v-for="p in plans" :key="p.id" :value="p.id" :disabled="!p.is_active || p.tier !== 'premium'">
              {{ p.name }}<span v-if="!p.is_active"> (inactive)</span>
            </option>
          </select>
        </div>
        <div class="field" style="flex: 1 1 160px;">
          <label class="field-label">{{ t('admin.promocodes.form_days_label') }}</label>
          <input v-model="formDays" type="number" min="1"
            :placeholder="t('admin.promocodes.form_days_ph')" />
        </div>
        <div class="field" style="flex: 1 1 160px;">
          <label class="field-label">{{ t('admin.promocodes.form_max_redemptions_label') }}</label>
          <input v-model="formMaxRedemptions" type="number" min="1" placeholder="∞" />
        </div>
        <div class="field" style="flex: 1 1 120px;">
          <label class="field-label">{{ t('admin.promocodes.form_per_user_limit_label') }}</label>
          <input v-model="formPerUserLimit" type="number" min="1" />
        </div>
        <div class="field" style="flex: 1 1 160px;">
          <label class="field-label">{{ t('admin.promocodes.form_valid_from_label') }}</label>
          <input v-model="formValidFrom" type="date" />
        </div>
        <div class="field" style="flex: 1 1 160px;">
          <label class="field-label">{{ t('admin.promocodes.form_valid_until_label') }}</label>
          <input v-model="formValidUntil" type="date" />
        </div>
        <div class="field" style="flex: 1 1 100%;">
          <label class="field-label">{{ t('admin.promocodes.form_notes_label') }}</label>
          <input v-model="formNotes" type="text" maxlength="2000" />
        </div>
      </div>

      <p v-if="createError" class="error-text mt-2">{{ createError }}</p>

      <div class="row mt-4" style="gap: 8px;">
        <button class="btn btn-primary" :disabled="createBusy || !formCode.trim() || !formPlanId" @click="onCreate">
          {{ createBusy ? t('common.saving') : t('admin.promocodes.form_create_btn') }}
        </button>
        <button class="btn btn-ghost" :disabled="createBusy" @click="toggleCreate">
          {{ t('common.cancel') }}
        </button>
      </div>
    </section>

    <!-- List -->
    <p v-if="loading" class="dim text-sm mt-4">{{ t('common.loading') }}</p>
    <div v-else-if="codes.length === 0" class="dim text-sm mt-4">
      {{ t('admin.promocodes.empty') }}
    </div>
    <div v-else class="list-bordered mt-4">
      <div v-for="c in codes" :key="c.id" class="list-row">
        <div style="display: flex; flex-direction: column; gap: 4px;">
          <div>
            <span class="mono" style="font-weight: 500;">{{ c.code }}</span>
            <span class="pill pill-grey" style="margin-left: 10px;">{{ statusOf(c) }}</span>
          </div>
          <div class="text-sm">{{ grantsOf(c) }} · {{ usedOf(c) }} · {{ windowOf(c) }}</div>
          <div v-if="c.notes" class="dim text-xs">{{ c.notes }}</div>
        </div>
        <div class="row" style="gap: 8px;">
          <button class="btn btn-ghost btn-sm" @click="openRedemptions(c)">
            {{ t('admin.promocodes.redemptions_btn') }}
          </button>
          <button class="btn btn-ghost btn-sm" :disabled="busyIds.has(c.id)" @click="toggleActive(c)">
            {{ c.is_active
              ? t('admin.promocodes.disable_btn')
              : t('admin.promocodes.enable_btn') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Redemptions modal — simple inline overlay, same idiom as other admin
         drill-ins. Backdrop click + Esc close are kept light-weight (click
         only) to match the surrounding pages. -->
    <div v-if="redemptionsModal" class="modal-backdrop" @click.self="closeRedemptions">
      <div class="modal" style="max-width: 720px;">
        <header class="modal-head">
          <h3>{{ t('admin.promocodes.redemptions_modal_title', { code: redemptionsModal.code.code }) }}</h3>
          <button type="button" class="modal-close" @click="closeRedemptions">✕</button>
        </header>
        <div class="modal-body">
          <p v-if="redemptionsModal.loading" class="dim text-sm">{{ t('common.loading') }}</p>
          <p v-else-if="redemptionsModal.redemptions.length === 0" class="dim text-sm">
            {{ t('admin.promocodes.redemptions_empty') }}
          </p>
          <div v-else class="list-bordered">
            <div v-for="r in redemptionsModal.redemptions" :key="r.id" class="list-row">
              <div style="display: flex; flex-direction: column; gap: 4px;">
                <span class="mono text-sm">
                  {{ t('admin.promocodes.redemptions_col_user') }}: {{ r.user_id }}
                </span>
                <span v-if="r.subscription_id" class="dim text-xs mono">
                  {{ t('admin.promocodes.redemptions_col_sub') }}: {{ r.subscription_id }}
                </span>
              </div>
              <div class="dim text-xs">{{ new Date(r.redeemed_at).toLocaleString() }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
