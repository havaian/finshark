<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { adminApi } from '../../api/admin.api';
import { adminBillingApi } from '../../api/billing.api';
import { useAuthStore } from '../../stores/auth.store';
import { useLocalePath } from '../../router/useLocalePath';
import { fmtDate } from '../../i18n/dates';
import type { Subscription } from '../../types/billing';

// Admin user-detail page. Reached from the admin users list (each row is now
// a link) or deep-linked by URL. Combines:
//   - core user fields (display name, email, admin flag, joined, last active)
//   - gamification stats (xp, level, streak, freezes)
//   - subscriptions history (full audit, newest first)
// The page route is `/admin/users/:user_id`, so links from elsewhere (e.g.
// the promocode redemptions modal) can deep-link directly.

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const lp = useLocalePath();

type AdminUserDetail = Awaited<ReturnType<typeof adminApi.getUser>>;

const userId = computed(() => route.params.user_id as string);

const user = ref<AdminUserDetail | null>(null);
const subscriptions = ref<Subscription[]>([]);
const loading = ref(true);
const errorMsg = ref<string | null>(null);
const toggling = ref(false);

async function load() {
  loading.value = true;
  errorMsg.value = null;
  try {
    // Subscriptions failure is non-fatal — the page still renders the user
    // panel with an empty subscriptions list if billing is unreachable.
    const [userData, subRows] = await Promise.all([
      adminApi.getUser(userId.value),
      adminBillingApi
        .listSubscriptionsForUser(userId.value)
        .catch(() => [] as Subscription[]),
    ]);
    user.value = userData;
    subscriptions.value = subRows;
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to load user';
  } finally {
    loading.value = false;
  }
}

// Re-fetch when the URL param changes — e.g. clicking a link from one user
// to another. Without this, navigating between two detail pages would
// reuse the stale user blob from the first one.
watch(userId, () => {
  if (userId.value) void load();
});

async function toggleAdmin() {
  if (!user.value || toggling.value) return;
  const next = !user.value.is_admin;
  if (!next) {
    const ok = confirm(
      `${t('admin.users.remove_admin')} — ${user.value.display_name} (${user.value.email})?`,
    );
    if (!ok) return;
  }
  toggling.value = true;
  errorMsg.value = null;
  try {
    const updated = await adminApi.setUserAdmin(user.value.id, next);
    // Preserve created_at / timezone / last_active_date from the existing
    // detail blob — setUserAdmin only returns PublicUser. We splice the
    // updated fields in rather than re-fetching the whole detail.
    user.value = {
      ...user.value,
      ...updated,
    };
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to update admin status';
  } finally {
    toggling.value = false;
  }
}

function extractError(e: unknown): string | null {
  if (e instanceof AxiosError) {
    const msg = (e.response?.data as { message?: string | string[] })?.message;
    return Array.isArray(msg) ? msg.join(', ') : msg ?? null;
  }
  return null;
}

function planNameFor(planId: string): string {
  const key = `dashboard.premium_status.${planId}`;
  const translated = t(key);
  return translated === key ? planId : translated;
}

function back() {
  router.push(lp('/admin/users'));
}

onMounted(load);
</script>

<template>
  <div class="container-wide">
    <div class="topbar">
      <h1>{{ t('admin.user_detail.title') }}</h1>
      <button class="btn btn-ghost btn-sm" @click="back">← {{ t('admin.user_detail.back_btn') }}</button>
    </div>

    <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
    <p v-if="loading" class="dim text-sm">{{ t('common.loading') }}</p>

    <template v-else-if="user">
      <!-- Identity card -->
      <section class="card">
        <div class="row" style="gap: 16px; align-items: flex-start;">
          <div class="profile-avatar" aria-hidden="true">
            {{ user.display_name.slice(0, 1).toUpperCase() }}
          </div>
          <div class="grow" style="min-width: 0;">
            <div class="row" style="gap: 10px; align-items: center; flex-wrap: wrap;">
              <span style="font-weight: 600; font-size: 1.2em;">{{ user.display_name }}</span>
              <span v-if="user.is_admin" class="pill pill-accent">
                {{ t('admin.users.admin_badge') }}
              </span>
              <span v-if="auth.user?.id === user.id" class="pill pill-grey">
                {{ t('admin.users.you_badge') }}
              </span>
            </div>
            <div class="dim text-sm mt-2">{{ user.email }}</div>
            <div class="dim text-xs mono mt-2">id: {{ user.id }}</div>
          </div>
          <div class="row" style="gap: 8px;">
            <button v-if="!user.is_admin" class="btn btn-ghost" :disabled="toggling" @click="toggleAdmin">
              {{ toggling ? t('admin.users.updating') : t('admin.users.make_admin') }}
            </button>
            <button v-else class="btn btn-ghost"
              :disabled="toggling || auth.user?.id === user.id"
              :title="auth.user?.id === user.id ? t('admin.users.cannot_self_demote') : ''"
              @click="toggleAdmin">
              {{ toggling ? t('admin.users.updating') : t('admin.users.remove_admin') }}
            </button>
          </div>
        </div>
      </section>

      <!-- Stats grid -->
      <section class="card mt-6">
        <h2>{{ t('admin.user_detail.stats_section') }}</h2>
        <div class="stats mt-4">
          <div class="stat stat-streak">
            <div class="stat-lbl">{{ t('dashboard.streak') }}</div>
            <div class="stat-val">{{ user.streak_count }} <span class="stat-fire">🔥</span></div>
          </div>
          <div class="stat">
            <div class="stat-lbl">{{ t('dashboard.xp') }}</div>
            <div class="stat-val">{{ user.xp }}</div>
          </div>
          <div class="stat">
            <div class="stat-lbl">{{ t('dashboard.level') }}</div>
            <div class="stat-val">{{ user.level }}</div>
          </div>
          <div class="stat">
            <div class="stat-lbl">{{ t('admin.user_detail.stat_freezes') }}</div>
            <div class="stat-val">{{ user.streak_freezes_remaining }}</div>
          </div>
        </div>
      </section>

      <!-- Meta card: dates, prefs, timezone, etc. -->
      <section class="card mt-6">
        <h2>{{ t('admin.user_detail.meta_section') }}</h2>
        <div class="list-bordered mt-4">
          <div class="list-row">
            <span class="dim text-sm">{{ t('profile.joined') }}</span>
            <span>{{ fmtDate(user.created_at) }}</span>
          </div>
          <div class="list-row">
            <span class="dim text-sm">{{ t('admin.user_detail.meta_last_active') }}</span>
            <span>{{ user.last_active_date ? fmtDate(user.last_active_date) : '—' }}</span>
          </div>
          <div class="list-row">
            <span class="dim text-sm">{{ t('settings.timezone') }}</span>
            <span class="mono text-sm">{{ user.timezone }}</span>
          </div>
          <div class="list-row">
            <span class="dim text-sm">{{ t('admin.user_detail.meta_lesson_size') }}</span>
            <span>{{ user.lesson_size }}</span>
          </div>
          <div class="list-row">
            <span class="dim text-sm">{{ t('admin.user_detail.meta_difficulty') }}</span>
            <span>{{ user.preferred_difficulty ?? t('settings.preferred_difficulty_auto') }}</span>
          </div>
          <div class="list-row">
            <span class="dim text-sm">{{ t('admin.user_detail.meta_reminder') }}</span>
            <span>
              <template v-if="user.email_reminders_enabled">
                {{ user.reminder_hour_local.toString().padStart(2, '0') }}:00 ({{ user.timezone }})
              </template>
              <template v-else>—</template>
            </span>
          </div>
          <div class="list-row">
            <span class="dim text-sm">{{ t('admin.user_detail.meta_tfa') }}</span>
            <span>{{ user.totp_enabled ? '✓' : '—' }}</span>
          </div>
        </div>
      </section>

      <!-- Subscriptions history. Mirrors the profile page's payments section
           but admin-facing: shows all subscriptions (active, expired,
           cancelled) and each row is a link to the admin subscription
           detail page so an admin can dig into events. -->
      <section class="card mt-6">
        <h2>{{ t('admin.user_detail.subs_section') }}</h2>
        <p v-if="subscriptions.length === 0" class="dim text-sm mt-2">
          {{ t('admin.user_detail.subs_empty') }}
        </p>
        <div v-else class="list-bordered mt-4">
          <div v-for="s in subscriptions" :key="s.id" class="list-row">
            <div style="display: flex; flex-direction: column; gap: 4px; min-width: 0;">
              <div>
                <span style="font-weight: 500;">{{ planNameFor(s.plan_id) }}</span>
                <span :class="['pill', s.status === 'active' ? 'pill-accent' : 'pill-grey']"
                  style="margin-left: 10px;">
                  {{ t(`admin.subscriptions.sub_status_${s.status}`) }}
                </span>
                <span class="dim text-xs" style="margin-left: 8px;">
                  · {{ t(`admin.subscriptions.sub_source_${s.source}`) }}
                </span>
              </div>
              <div class="dim text-xs">
                {{ t('admin.subscriptions.sub_starts', { date: new Date(s.starts_at).toLocaleDateString() }) }}
                <template v-if="s.ends_at">
                  · {{ t('admin.subscriptions.sub_ends', { date: new Date(s.ends_at).toLocaleDateString() }) }}
                </template>
                <template v-else>
                  · {{ t('admin.subscriptions.sub_ends_never') }}
                </template>
                <template v-if="s.cancelled_at">
                  · {{ t('admin.subscriptions.sub_cancelled_at', {
                    date: new Date(s.cancelled_at).toLocaleDateString(),
                  }) }}
                </template>
              </div>
              <div class="mono text-xs muted">id: {{ s.id }}</div>
            </div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>
