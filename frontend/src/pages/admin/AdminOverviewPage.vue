<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { adminApi, type AdminOverview } from '../../api/admin.api';
import { useLocalePath } from '../../router/useLocalePath';

// Admin landing page. Replaces the previous default-to-content redirect so
// admins land on a useful summary instead of being dumped into the content
// browser. Cards link out to the relevant admin sub-pages so this page is
// also the navigation hub for the admin area.

const { t } = useI18n();
const lp = useLocalePath();

const data = ref<AdminOverview | null>(null);
const loading = ref(true);
const errorMsg = ref<string | null>(null);

async function load() {
  loading.value = true;
  errorMsg.value = null;
  try {
    data.value = await adminApi.getOverview();
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to load overview';
  } finally {
    loading.value = false;
  }
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
    <header class="topbar">
      <h1>{{ t('admin.overview.title') }}</h1>
      <p class="dim text-sm">{{ t('admin.overview.subtitle') }}</p>
    </header>

    <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
    <p v-if="loading" class="dim text-sm">{{ t('common.loading') }}</p>

    <template v-else-if="data">
      <!-- Each section: a card with a header link to the drill-in page and a
           row of stat tiles. Headers act as navigation so admins can jump
           from "23 active premium users" to the subscriptions list. -->

      <section class="card mt-6">
        <header class="admin-overview-section-head">
          <h2>{{ t('admin.overview.users_title') }}</h2>
          <RouterLink :to="lp('/admin/users')" class="link-accent">
            {{ t('admin.overview.users_link') }} →
          </RouterLink>
        </header>
        <div class="stats mt-4">
          <div class="stat">
            <div class="stat-lbl">{{ t('admin.overview.users_total') }}</div>
            <div class="stat-val">{{ data.users.total }}</div>
          </div>
          <div class="stat">
            <div class="stat-lbl">{{ t('admin.overview.users_admins') }}</div>
            <div class="stat-val">{{ data.users.admins }}</div>
          </div>
          <div class="stat">
            <div class="stat-lbl">{{ t('admin.overview.users_reminders') }}</div>
            <div class="stat-val">{{ data.users.reminders_enabled }}</div>
          </div>
          <div class="stat">
            <div class="stat-lbl">{{ t('admin.overview.users_new') }}</div>
            <div class="stat-val">{{ data.users.new_last_7d }}</div>
          </div>
        </div>
      </section>

      <section class="card mt-6">
        <header class="admin-overview-section-head">
          <h2>{{ t('admin.overview.premium_title') }}</h2>
          <RouterLink :to="lp('/admin/subscriptions')" class="link-accent">
            {{ t('admin.overview.premium_link') }} →
          </RouterLink>
        </header>
        <div class="stats mt-4">
          <div class="stat">
            <div class="stat-lbl">{{ t('admin.overview.premium_active_users') }}</div>
            <div class="stat-val">{{ data.premium.active_users }}</div>
          </div>
          <div class="stat">
            <div class="stat-lbl">{{ t('admin.overview.premium_active_subs') }}</div>
            <div class="stat-val">{{ data.premium.active }}</div>
          </div>
        </div>
      </section>

      <section class="card mt-6">
        <header class="admin-overview-section-head">
          <h2>{{ t('admin.overview.activity_title') }}</h2>
        </header>
        <div class="stats mt-4">
          <div class="stat">
            <div class="stat-lbl">{{ t('admin.overview.activity_lessons_7d') }}</div>
            <div class="stat-val">{{ data.activity.lessons_last_7d }}</div>
          </div>
          <div class="stat">
            <div class="stat-lbl">{{ t('admin.overview.activity_mocks_7d') }}</div>
            <div class="stat-val">{{ data.activity.mocks_last_7d }}</div>
          </div>
          <div class="stat">
            <div class="stat-lbl">{{ t('admin.overview.activity_users_24h') }}</div>
            <div class="stat-val">{{ data.activity.active_users_last_24h }}</div>
          </div>
        </div>
      </section>

      <section class="card mt-6">
        <header class="admin-overview-section-head">
          <h2>{{ t('admin.overview.content_title') }}</h2>
          <RouterLink :to="lp('/admin/content')" class="link-accent">
            {{ t('admin.overview.content_link') }} →
          </RouterLink>
        </header>
        <div class="stats mt-4">
          <div class="stat">
            <div class="stat-lbl">{{ t('admin.overview.content_papers') }}</div>
            <div class="stat-val">{{ data.content.papers }}</div>
          </div>
          <div class="stat">
            <div class="stat-lbl">{{ t('admin.overview.content_los') }}</div>
            <div class="stat-val">{{ data.content.learning_objectives }}</div>
          </div>
          <div class="stat">
            <div class="stat-lbl">{{ t('admin.overview.content_questions_active') }}</div>
            <div class="stat-val">{{ data.content.questions_active }}</div>
          </div>
          <div class="stat">
            <div class="stat-lbl">{{ t('admin.overview.content_questions_inactive') }}</div>
            <div class="stat-val">{{ data.content.questions_inactive }}</div>
          </div>
        </div>
      </section>
    </template>
  </div>
</template>

<style>
.admin-overview-section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
