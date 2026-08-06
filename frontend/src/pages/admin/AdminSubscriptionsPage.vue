<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import AdminDetailPane from '../../components/AdminDetailPane.vue';
import { adminApi } from '../../api/admin.api';
import { adminBillingApi } from '../../api/billing.api';
import type { PublicUser } from '../../types/auth';
import type {
  Plan,
  Subscription,
  SubscriptionEvent,
  SubscriptionEventKind,
  SubscriptionStatus,
  SubscriptionSource,
} from '../../types/billing';

// Subscriptions admin page. One workflow per pageview:
//   1. Pick a user (search + click).
//   2. See their subscription history + per-user event audit log.
//   3. Grant a new subscription (plan + days + reason).
//   4. Extend / cancel / revoke any of their existing subscriptions.
//
// We deliberately load the full user list up-front (same pattern as
// AdminUsersPage) because the cardinality is small and a client-side filter
// stays snappy. If users grows past a few thousand this should become a
// debounced server-side search instead.

const { t } = useI18n();

// ---- Users ----
const users = ref<PublicUser[]>([]);
const usersLoading = ref(false);
const filter = ref('');
const filtered = computed(() => {
  const q = filter.value.trim().toLowerCase();
  if (!q) return users.value.slice(0, 50); // cap when nothing is searched
  return users.value.filter(
    (u) => u.email.toLowerCase().includes(q) || u.display_name.toLowerCase().includes(q),
  );
});

// Selected user. Once set, we drive the right-pane data fetches off this.
const selected = ref<PublicUser | null>(null);

// ---- Plans (for grant form + display labels) ----
const plans = ref<Plan[]>([]);
const plansById = computed(() => {
  const m = new Map<string, Plan>();
  for (const p of plans.value) m.set(p.id, p);
  return m;
});

// ---- Subscriptions + events for the selected user ----
const subs = ref<Subscription[]>([]);
const events = ref<SubscriptionEvent[]>([]);
const detailsLoading = ref(false);
const errorMsg = ref<string | null>(null);

// Track in-flight per-subscription mutating operations so the right buttons
// stay disabled while a request is in flight.
const busyIds = ref<Set<string>>(new Set());

// ---- Grant form ----
const grantPlanId = ref('');
const grantDays = ref('');
const grantReason = ref('');
const grantBusy = ref(false);
const grantError = ref<string | null>(null);
const grantSuccess = ref(false);

// ---- Per-subscription action modal ----
// One modal handles all three of extend/cancel/revoke since they're nearly
// identical (subscription + optional reason + optional days for extend).
// 'change' is the user-level edit: it targets whichever subscription is
// currently granting access and can either replace ends_at outright or add
// days, which are two different questions an admin arrives with.
type ActionKind = 'extend' | 'cancel' | 'revoke' | 'revoke_all' | 'change';
const actionModal = ref<{
  kind: ActionKind;
  // null for revoke_all, which targets the user rather than one subscription.
  sub: Subscription | null;
  days: string;
  // 'change' only. 'date' replaces ends_at; 'days' adds to it.
  mode: 'date' | 'days';
  endsAt: string;
  reason: string;
  busy: boolean;
  error: string | null;
} | null>(null);

// `sub` is absent for revoke_all, which acts on the user rather than on one
// subscription.
function openAction(kind: ActionKind, sub: Subscription | null) {
  // Prefill the date picker with the subscription's current end date so the
  // admin edits a real value rather than typing one from scratch.
  const current = sub?.ends_at ? new Date(sub.ends_at) : null;
  const iso = current && !Number.isNaN(current.getTime())
    ? current.toISOString().slice(0, 10)
    : '';
  actionModal.value = {
    kind,
    sub,
    days: '30',
    mode: 'date',
    endsAt: iso,
    reason: '',
    busy: false,
    error: null,
  };
}

// The subscription currently granting access. Purchases chain into separate
// rows, so "the user's subscription" is the one running latest.
const activeSub = computed<Subscription | null>(() => {
  const live = subs.value.filter(
    (x) => x.status === 'active' && (x.ends_at === null || new Date(x.ends_at) > new Date()),
  );
  if (live.length === 0) return null;
  return live.reduce((a, b) => {
    if (a.ends_at === null) return a;
    if (b.ends_at === null) return b;
    return new Date(b.ends_at) > new Date(a.ends_at) ? b : a;
  });
});

// Every subscription still granting access. Chained purchases mean this is
// usually more than one, which is exactly why the bulk action exists.
const grantingCount = computed(
  () =>
    subs.value.filter(
      (s) => s.status === 'active' && (s.ends_at === null || new Date(s.ends_at) > new Date()),
    ).length,
);

// Nothing to edit without a live subscription, so this scrolls to the grant
// form already on the page instead of opening a second, near-identical one.
function focusGrant() {
  const el = document.getElementById('grant-section');
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

function closeAction() {
  if (actionModal.value?.busy) return;
  actionModal.value = null;
}

async function confirmAction() {
  const a = actionModal.value;
  if (!a) return;
  if (a.busy) return;
  a.busy = true;
  a.error = null;
  try {
    // revoke_all is user-scoped, not subscription-scoped: it clears every row
    // still granting access, so there is no single updated row to splice back
    // in and the list is reloaded instead.
    if (a.kind === 'revoke_all') {
      if (!selected.value) return;
      await adminBillingApi.revokeAllForUser(selected.value.id, {
        reason: a.reason.trim() || undefined,
      });
      subs.value = await adminBillingApi.listSubscriptionsForUser(selected.value.id);
      events.value = await adminBillingApi.listSubscriptionEventsForUser(selected.value.id);
      actionModal.value = null;
      return;
    }

    let updated: Subscription;
    if (a.kind === 'change') {
      if (!a.sub) return;
      if (a.mode === 'date') {
        if (!a.endsAt) {
          a.error = t('admin.subscriptions.change_date_required');
          a.busy = false;
          return;
        }
        // End of the chosen day rather than midnight at its start, so picking
        // today's date does not immediately expire the subscription.
        updated = await adminBillingApi.setEndDate(a.sub.id, {
          ends_at: new Date(`${a.endsAt}T23:59:59.000Z`).toISOString(),
          reason: a.reason.trim() || undefined,
        });
      } else {
        const days = parseInt(a.days, 10);
        if (!Number.isFinite(days) || days <= 0) {
          a.error = 'days must be a positive integer';
          a.busy = false;
          return;
        }
        updated = await adminBillingApi.extend(a.sub.id, {
          days,
          reason: a.reason.trim() || undefined,
        });
      }
    } else if (a.kind === 'extend') {
      const days = parseInt(a.days, 10);
      if (!Number.isFinite(days) || days <= 0) {
        a.error = 'days must be a positive integer';
        a.busy = false;
        return;
      }
      if (!a.sub) return;
      updated = await adminBillingApi.extend(a.sub.id, {
        days,
        reason: a.reason.trim() || undefined,
      });
    } else if (a.kind === 'cancel') {
      if (!a.sub) return;
      updated = await adminBillingApi.cancel(a.sub.id, {
        reason: a.reason.trim() || undefined,
      });
    } else {
      // revoke
      if (!a.sub) return;
      updated = await adminBillingApi.revoke(a.sub.id, {
        reason: a.reason.trim() || undefined,
      });
    }
    subs.value = subs.value.map((s) => (s.id === updated.id ? updated : s));
    actionModal.value = null;
    // Refresh the audit log so the new event row appears immediately.
    if (selected.value) {
      events.value = await adminBillingApi.listSubscriptionEventsForUser(selected.value.id);
    }
  } catch (e) {
    a.error = extractError(e) ?? 'failed to update subscription';
    a.busy = false;
  }
}

// ---- Loaders ----
async function loadUsersAndPlans() {
  usersLoading.value = true;
  try {
    const [u, p] = await Promise.all([
      adminApi.listUsers(),
      adminBillingApi.listPlans(),
    ]);
    users.value = u;
    plans.value = p;
    // Default grant form to the first active premium plan.
    const firstPremium = p.find((x) => x.is_active && x.tier === 'premium');
    if (firstPremium && grantPlanId.value === '') grantPlanId.value = firstPremium.id;
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to load admin data';
  } finally {
    usersLoading.value = false;
  }
}

async function loadDetailsFor(user: PublicUser) {
  detailsLoading.value = true;
  errorMsg.value = null;
  try {
    const [s, ev] = await Promise.all([
      adminBillingApi.listSubscriptionsForUser(user.id),
      adminBillingApi.listSubscriptionEventsForUser(user.id),
    ]);
    subs.value = s;
    events.value = ev;
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to load subscriptions';
    subs.value = [];
    events.value = [];
  } finally {
    detailsLoading.value = false;
  }
}

watch(selected, (u) => {
  if (u) {
    loadDetailsFor(u);
    grantSuccess.value = false;
    grantError.value = null;
  } else {
    subs.value = [];
    events.value = [];
  }
});

function pickUser(u: PublicUser) {
  selected.value = u;
}

// ---- Grant ----
async function onGrant() {
  if (!selected.value || grantBusy.value || !grantPlanId.value) return;
  grantBusy.value = true;
  grantError.value = null;
  grantSuccess.value = false;
  try {
    const daysRaw = grantDays.value.trim();
    // Days semantics on the wire:
    //   omitted → use plan period
    //   null    → open-ended grant
    //   N>0     → exactly N days
    // The form encodes "open-ended" as the literal string "0" because a
    // bare empty input means "use plan default" - keeping the two states
    // distinguishable via a single text field.
    let daysPayload: number | null | undefined;
    if (daysRaw === '') daysPayload = undefined;
    else if (daysRaw === '0') daysPayload = null;
    else daysPayload = parseInt(daysRaw, 10);

    const created = await adminBillingApi.grant(selected.value.id, {
      plan_id: grantPlanId.value,
      days: daysPayload,
      reason: grantReason.value.trim() || undefined,
    });
    subs.value = [created, ...subs.value];
    grantSuccess.value = true;
    grantReason.value = '';
    grantDays.value = '';
    // Refresh events so the 'granted' row appears.
    events.value = await adminBillingApi.listSubscriptionEventsForUser(selected.value.id);
  } catch (e) {
    grantError.value = extractError(e) ?? 'failed to grant';
  } finally {
    grantBusy.value = false;
  }
}

// ---- Display helpers ----
function statusLabel(s: SubscriptionStatus): string {
  const key = `admin.subscriptions.sub_status_${s}`;
  return t(key);
}
function sourceLabel(src: SubscriptionSource): string {
  return t(`admin.subscriptions.sub_source_${src}`);
}
function eventLabel(kind: SubscriptionEventKind): string {
  return t(`admin.subscriptions.event_${kind}`);
}

function planLabel(planId: string): string {
  return plansById.value.get(planId)?.name ?? planId;
}

function extractError(e: unknown): string | null {
  if (e instanceof AxiosError) {
    const msg = (e.response?.data as { message?: string | string[] })?.message;
    return Array.isArray(msg) ? msg.join(', ') : msg ?? null;
  }
  return null;
}

onMounted(loadUsersAndPlans);
</script>

<template>
  <div class="container-wide">
    <header class="topbar">
      <h1>{{ t('admin.subscriptions.title') }}</h1>
    </header>
    <p class="dim text-sm">{{ t('admin.subscriptions.sub') }}</p>

    <p v-if="errorMsg" class="error-text mt-4">{{ errorMsg }}</p>

    <div class="row mt-6" style="gap: 24px; align-items: stretch; flex-wrap: wrap;">

      <!-- LEFT: user picker -->
      <section class="card" id="first-card" style="flex: 0 0 320px; min-width: 280px;">
        <input v-model="filter" type="text" :placeholder="t('admin.subscriptions.pick_user_ph')" />

        <p v-if="usersLoading" class="dim text-sm mt-2">{{ t('common.loading') }}</p>
        <p v-else-if="!filter && users.length === 0" class="dim text-sm mt-2">
          {{ t('admin.subscriptions.pick_user_hint') }}
        </p>

        <div v-if="!usersLoading" class="mt-4 list-bordered" style="max-height: 480px; overflow: auto;">
          <button v-for="u in filtered" :key="u.id" type="button"
            :class="['list-row', { active: selected?.id === u.id }]"
            style="display: block; width: 100%; text-align: left;" @click="pickUser(u)">
            <div style="font-weight: 500;">{{ u.display_name }}</div>
            <div class="dim text-xs">{{ u.email }}</div>
          </button>
          <div v-if="filtered.length === 0 && filter" class="list-row dim text-sm">
            {{ t('admin.subscriptions.pick_user_empty') }}
          </div>
        </div>
      </section>

      <!-- RIGHT: details for selected user -->
      <!-- Placeholder column. Only meaningful on desktop, where the detail
           sits beside the list; on mobile the detail is a modal and an empty
           second column would be dead space. -->
      <section v-if="!selected" class="card grow" style="flex: 1 1 480px;">
        <p class="dim text-sm">{{ t('admin.subscriptions.pick_user_hint') }}</p>
      </section>

      <!-- Inline column on desktop, modal on mobile. Below the breakpoint the
           columns stacked, so tapping a user appended their detail to the
           bottom of the page - off screen, and indistinguishable from a dead
           tap. -->
      <AdminDetailPane :open="selected !== null" :title="selected?.display_name ?? ''"
        :subtitle="selected?.email ?? ''" @close="selected = null">
        <template v-if="selected">

          <!-- Grant form. id is the scroll target for the "issue subscription"
               button shown when the user has none. -->
          <div class="mt-6" id="grant-section">
            <h3>{{ t('admin.subscriptions.grant_heading') }}</h3>
            <div class="row mt-4" style="gap: 12px; flex-wrap: wrap; align-items: start;">
              <div class="field" style="flex: 1 1 200px;">
                <label class="field-label">{{ t('admin.subscriptions.grant_plan_label') }}</label>
                <select v-model="grantPlanId">
                  <option value="" disabled>-</option>
                  <option v-for="p in plans" :key="p.id" :value="p.id"
                    :disabled="!p.is_active || p.tier !== 'premium'">
                    {{ p.name }}
                  </option>
                </select>
              </div>
              <div class="field" style="flex: 0 0 160px;">
                <label class="field-label">{{ t('admin.subscriptions.grant_days_label') }}</label>
                <input v-model="grantDays" type="number" min="0"
                  :placeholder="plansById.get(grantPlanId)?.period_days?.toString() ?? '-'" />
                <p class="input-help dim text-xs">{{ t('admin.subscriptions.grant_days_help') }}</p>
              </div>
              <div class="field grow" style="flex: 1 1 220px;">
                <label class="field-label">{{ t('admin.subscriptions.grant_reason_label') }}</label>
                <input v-model="grantReason" type="text" maxlength="500" />
              </div>
            </div>
            <p v-if="grantError" class="error-text mt-2">{{ grantError }}</p>
            <p v-if="grantSuccess" class="mt-2" style="color: var(--success, #16a34a);">
              {{ t('admin.subscriptions.grant_success') }}
            </p>
            <div class="row mt-4" style="justify-content: flex-end;">
              <button class="btn btn-primary" :disabled="grantBusy || !grantPlanId" @click="onGrant">
                {{ grantBusy ? t('admin.subscriptions.grant_busy') : t('admin.subscriptions.grant_btn') }}
              </button>
            </div>
          </div>

          <!-- Subscription history -->
          <div class="mt-6">
            <div class="admin-subs-head">
              <h3>{{ t('admin.subscriptions.sub_history_heading') }}</h3>
              <!-- One action for the whole user. Purchases chain into separate
                   rows, so revoking them individually is both tedious and
                   unsafe - missing one leaves the user fully entitled. -->
              <div class="row">
                <!-- User-level edit. With a live subscription this changes its
                     end date; without one there is nothing to edit, so the
                     button points at the grant form above instead. -->
                <button v-if="activeSub" class="btn btn-sm btn-primary"
                  @click="openAction('change', activeSub)">
                  {{ t('admin.subscriptions.change_btn') }}
                </button>
                <button v-else class="btn btn-sm btn-primary" @click="focusGrant">
                  {{ t('admin.subscriptions.grant_open_btn') }}
                </button>
                <button v-if="grantingCount > 0" class="btn btn-sm btn-ghost"
                  style="color: var(--danger, #c00);" @click="openAction('revoke_all', null)">
                  {{ t('admin.subscriptions.revoke_all_btn', { count: grantingCount }) }}
                </button>
              </div>
            </div>
            <p v-if="detailsLoading" class="dim text-sm mt-2">{{ t('common.loading') }}</p>
            <p v-else-if="subs.length === 0" class="dim text-sm mt-2">
              {{ t('admin.subscriptions.sub_history_empty') }}
            </p>
            <div v-else class="list-bordered mt-4">
              <div v-for="s in subs" :key="s.id" class="list-row">
                <div style="display: flex; flex-direction: column; gap: 4px;">
                  <div>
                    <span style="font-weight: 500;">{{ planLabel(s.plan_id) }}</span>
                    <span class="pill pill-grey" style="margin-left: 10px;">{{ statusLabel(s.status) }}</span>
                    <span class="dim text-xs" style="margin-left: 8px;">· {{ sourceLabel(s.source) }}</span>
                  </div>
                  <div class="dim text-xs">
                    {{ t('admin.subscriptions.sub_starts', { date: new Date(s.starts_at).toLocaleDateString() }) }}
                    ·
                    <template v-if="s.ends_at">
                      {{ t('admin.subscriptions.sub_ends', { date: new Date(s.ends_at).toLocaleDateString() }) }}
                    </template>
                    <template v-else>
                      {{ t('admin.subscriptions.sub_ends_never') }}
                    </template>
                    <template v-if="s.cancelled_at">
                      · {{ t('admin.subscriptions.sub_cancelled_at', { date: new Date(s.cancelled_at).toLocaleDateString() }) }}
                    </template>
                  </div>
                </div>
                <div class="row" style="gap: 8px;">
                  <button class="btn btn-ghost btn-sm"
                    :disabled="s.ends_at === null || s.status !== 'active' || busyIds.has(s.id)"
                    :title="s.ends_at === null ? t('admin.subscriptions.sub_ends_never') : ''"
                    @click="openAction('extend', s)">
                    {{ t('admin.subscriptions.sub_extend_btn') }}
                  </button>
                  <button class="btn btn-ghost btn-sm"
                    :disabled="s.status !== 'active' || busyIds.has(s.id)"
                    @click="openAction('cancel', s)">
                    {{ t('admin.subscriptions.sub_cancel_btn') }}
                  </button>
                  <button class="btn btn-ghost btn-sm" style="color: var(--danger, #c00);"
                    :disabled="busyIds.has(s.id)"
                    @click="openAction('revoke', s)">
                    {{ t('admin.subscriptions.sub_revoke_btn') }}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Audit log -->
          <div class="mt-6">
            <h3>{{ t('admin.subscriptions.events_heading') }}</h3>
            <p v-if="detailsLoading" class="dim text-sm mt-2">{{ t('common.loading') }}</p>
            <p v-else-if="events.length === 0" class="dim text-sm mt-2">
              {{ t('admin.subscriptions.events_empty') }}
            </p>
            <div v-else class="list-bordered mt-4">
              <div v-for="ev in events" :key="ev.id" class="list-row">
                <div style="display: flex; flex-direction: column; gap: 2px;">
                  <div style="font-weight: 500;">{{ eventLabel(ev.kind) }}</div>
                  <div v-if="ev.reason" class="text-sm">{{ ev.reason }}</div>
                  <div class="dim text-xs">{{ new Date(ev.created_at).toLocaleString() }}</div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </AdminDetailPane>
    </div>

    <!-- Action modal: extend / cancel / revoke share one shell -->
    <div v-if="actionModal" class="modal-backdrop" @click.self="closeAction">
      <div class="modal" style="max-width: 480px;">
        <header class="modal-head">
          <h3>
            <template v-if="actionModal.kind === 'change'">{{ t('admin.subscriptions.change_modal_title') }}</template>
            <template v-else-if="actionModal.kind === 'extend'">{{ t('admin.subscriptions.extend_modal_title') }}</template>
            <template v-else-if="actionModal.kind === 'cancel'">{{ t('admin.subscriptions.cancel_modal_title') }}</template>
            <template v-else-if="actionModal.kind === 'revoke_all'">
              {{ t('admin.subscriptions.revoke_all_modal_title') }}
            </template>
            <template v-else>{{ t('admin.subscriptions.revoke_modal_title') }}</template>
          </h3>
          <button type="button" class="modal-close" :disabled="actionModal.busy" @click="closeAction">✕</button>
        </header>

        <div class="modal-body">
          <p v-if="actionModal.kind === 'cancel'" class="dim text-sm">
            {{ t('admin.subscriptions.cancel_warn') }}
          </p>
          <p v-if="actionModal.kind === 'revoke_all'" class="error-text">
            {{ t('admin.subscriptions.revoke_all_warning', { count: grantingCount }) }}
          </p>
          <p v-if="actionModal.kind === 'revoke'" class="error-text">
            {{ t('admin.subscriptions.revoke_warn') }}
          </p>

          <template v-if="actionModal.kind === 'change'">
            <div class="segmented mt-4">
              <button type="button" :class="{ active: actionModal.mode === 'date' }"
                :disabled="actionModal.busy" @click="actionModal.mode = 'date'">
                {{ t('admin.subscriptions.change_mode_date') }}
              </button>
              <button type="button" :class="{ active: actionModal.mode === 'days' }"
                :disabled="actionModal.busy" @click="actionModal.mode = 'days'">
                {{ t('admin.subscriptions.change_mode_days') }}
              </button>
            </div>
            <div v-if="actionModal.mode === 'date'" class="field mt-4">
              <label>{{ t('admin.subscriptions.change_ends_at_label') }}</label>
              <input v-model="actionModal.endsAt" type="date" :disabled="actionModal.busy" />
              <p class="dim text-xs mt-1">{{ t('admin.subscriptions.change_date_hint') }}</p>
            </div>
            <div v-else class="field mt-4">
              <label>{{ t('admin.subscriptions.extend_days_label') }}</label>
              <input v-model="actionModal.days" type="number" min="1" :disabled="actionModal.busy" />
            </div>
          </template>

          <div v-if="actionModal.kind === 'extend'" class="field mt-4">
            <label class="field-label">{{ t('admin.subscriptions.extend_days_label') }}</label>
            <input v-model="actionModal.days" type="number" min="1" :disabled="actionModal.busy" />
          </div>

          <div class="field mt-4">
            <label class="field-label">
              <template v-if="actionModal.kind === 'revoke'">
                {{ t('admin.subscriptions.revoke_reason_label') }}
              </template>
              <template v-else-if="actionModal.kind === 'cancel'">
                {{ t('admin.subscriptions.cancel_reason_label') }}
              </template>
              <template v-else>
                {{ t('admin.subscriptions.extend_reason_label') }}
              </template>
            </label>
            <input v-model="actionModal.reason" type="text" maxlength="500" :disabled="actionModal.busy" />
          </div>

          <p v-if="actionModal.error" class="error-text mt-2">{{ actionModal.error }}</p>

          <div class="row mt-6" style="justify-content: flex-end; gap: 8px;">
            <button class="btn btn-ghost" :disabled="actionModal.busy" @click="closeAction">
              {{ t('common.cancel') }}
            </button>
            <button class="btn"
              :class="actionModal.kind === 'revoke' ? 'btn-danger' : 'btn-primary'"
              :disabled="actionModal.busy" @click="confirmAction">
              <template v-if="actionModal.kind === 'change'">{{ t('admin.subscriptions.change_confirm') }}</template>
              <template v-else-if="actionModal.kind === 'extend'">{{ t('admin.subscriptions.extend_confirm') }}</template>
              <template v-else-if="actionModal.kind === 'cancel'">{{ t('admin.subscriptions.cancel_confirm') }}</template>
              <template v-else>{{ t('admin.subscriptions.revoke_confirm') }}</template>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
@media (max-width: 1200px) {
  .card {
    min-width: 100% !important;
  }
}

#first-card {
  height: fit-content;
}
</style>