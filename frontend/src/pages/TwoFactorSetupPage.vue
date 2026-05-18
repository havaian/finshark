<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { totpApi } from '../api/totp.api';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../stores/auth.store';
import AppNav from '../components/AppNav.vue';
import type { TotpSetupBeginResult } from '../types/totp';

// Three-step enrollment:
//   1) scan      — show QR + secret_b32, the user adds it to their
//                  authenticator app. Continue button → step 2.
//   2) verify    — user types the 6-digit code their app shows. We POST
//                  setup-verify; on success we get recovery codes back
//                  and move to step 3. On failure we stay on step 2 with
//                  an error.
//   3) recovery  — show all 10 recovery codes, require the user to tick
//                  the "I saved them" checkbox before we let them leave.
//                  After they confirm we re-fetch /me so the store picks
//                  up totp_enabled=true and bounce to /settings.
//
// Aborting mid-flow (closing the tab on step 1 or 2) leaves nothing
// persisted — the secret only gets written on a successful setup-verify.

type Step = 'scan' | 'verify' | 'recovery';

const { t } = useI18n();
const router = useRouter();
const auth = useAuthStore();

const step = ref<Step>('scan');
const loading = ref(true);
const errorMsg = ref<string | null>(null);

const setupData = ref<TotpSetupBeginResult | null>(null);
const code = ref('');
const submitting = ref(false);

const recoveryCodes = ref<string[]>([]);
const savedConfirmed = ref(false);

// Admin-only — non-admins shouldn't even reach this route, but if they
// somehow do (e.g. via direct URL), the API will 403 and we redirect.
const isAdmin = computed(() => auth.user?.is_admin === true);

async function beginSetup() {
  loading.value = true;
  errorMsg.value = null;
  try {
    setupData.value = await totpApi.setupBegin();
  } catch (e) {
    if (e instanceof AxiosError && e.response?.status === 400) {
      // Already enabled — the user navigated here in a stale state.
      errorMsg.value = t('tfa_setup.error_already_enabled');
    } else if (e instanceof AxiosError && e.response?.status === 403) {
      errorMsg.value = t('tfa_setup.error_admin_only');
    } else {
      errorMsg.value = t('tfa_setup.error_generic');
    }
  } finally {
    loading.value = false;
  }
}

async function verify() {
  if (!setupData.value) return;
  submitting.value = true;
  errorMsg.value = null;
  try {
    const result = await totpApi.setupVerify({
      secret_b32: setupData.value.secret_b32,
      code: code.value.trim(),
    });
    recoveryCodes.value = result.recovery_codes;
    step.value = 'recovery';
  } catch (e) {
    if (e instanceof AxiosError && e.response?.status === 401) {
      errorMsg.value = t('tfa_setup.error_invalid_code');
    } else {
      errorMsg.value = t('tfa_setup.error_generic');
    }
  } finally {
    submitting.value = false;
  }
}

async function finishAndExit() {
  // Re-fetch /me so the store has totp_enabled=true for the Settings page.
  try {
    const me = await authApi.me();
    auth.setUser(me);
  } catch {
    // Non-fatal — Settings will re-fetch on its own.
  }
  router.replace('/settings');
}

function copyRecoveryCodes() {
  const text = recoveryCodes.value.join('\n');
  // Clipboard API requires HTTPS or localhost; in plain HTTP this throws,
  // which we silently swallow — the codes are already visible on screen,
  // worst case the user copies manually.
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text).catch(() => {
      /* swallow */
    });
  }
}

onMounted(() => {
  if (!isAdmin.value) {
    // Defence-in-depth — router guard should have caught this too.
    router.replace('/settings');
    return;
  }
  beginSetup();
});
</script>

<template>
  <main class="page">
    <AppNav />
    <div class="container">

      <header class="page-head">
        <h1>{{ t('tfa_setup.title') }}</h1>
      </header>

      <p v-if="loading" class="dim text-sm">{{ t('common.loading') }}</p>

      <p v-else-if="errorMsg && !setupData" class="error-text">{{ errorMsg }}</p>

      <!-- Step 1: scan QR -->
      <section v-else-if="step === 'scan' && setupData" class="card">
        <h2>{{ t('tfa_setup.scan_title') }}</h2>
        <p class="dim text-sm mt-2">{{ t('tfa_setup.scan_hint') }}</p>

        <div class="tfa-qr-block mt-6">
          <img :src="setupData.qr_data_url" :alt="t('tfa_setup.qr_alt')" class="tfa-qr-img" />
        </div>

        <div class="mt-4">
          <label class="field-label">{{ t('tfa_setup.secret_label') }}</label>
          <code class="tfa-secret-text">{{ setupData.secret_b32 }}</code>
        </div>

        <div class="row mt-6" style="gap: 8px;">
          <button class="btn btn-primary" @click="step = 'verify'">
            {{ t('tfa_setup.continue') }}
          </button>
          <RouterLink to="/settings" class="btn btn-ghost">
            {{ t('common.cancel') }}
          </RouterLink>
        </div>
      </section>

      <!-- Step 2: verify TOTP -->
      <section v-else-if="step === 'verify' && setupData" class="card">
        <h2>{{ t('tfa_setup.verify_title') }}</h2>
        <p class="dim text-sm mt-2">{{ t('tfa_setup.verify_hint') }}</p>

        <div class="mt-6">
          <label class="field-label">{{ t('tfa_setup.code_label') }}</label>
          <input
            v-model="code"
            type="text"
            inputmode="numeric"
            autocomplete="one-time-code"
            maxlength="6"
            placeholder="123456"
            class="tfa-input"
            style="margin-top: 6px;"
            @keydown.enter="code.length >= 6 && !submitting && verify()"
          />
        </div>

        <p v-if="errorMsg" class="error-text mt-4">{{ errorMsg }}</p>

        <div class="row mt-6" style="gap: 8px;">
          <button
            class="btn btn-primary"
            :disabled="submitting || code.trim().length < 6"
            @click="verify"
          >
            {{ submitting ? t('common.saving') : t('tfa_setup.enable') }}
          </button>
          <button
            class="btn btn-ghost"
            :disabled="submitting"
            @click="step = 'scan'; code = ''; errorMsg = null"
          >
            {{ t('tfa_setup.back') }}
          </button>
        </div>
      </section>

      <!-- Step 3: recovery codes -->
      <section v-else-if="step === 'recovery'" class="card">
        <h2>{{ t('tfa_setup.recovery_title') }}</h2>
        <p class="dim text-sm mt-2">{{ t('tfa_setup.recovery_hint') }}</p>
        <p class="error-text mt-2">{{ t('tfa_setup.recovery_warning') }}</p>

        <ul class="tfa-recovery-list mt-4">
          <li v-for="(rc, i) in recoveryCodes" :key="i">
            <code>{{ rc }}</code>
          </li>
        </ul>

        <button class="btn btn-ghost btn-block mt-4" @click="copyRecoveryCodes">
          {{ t('tfa_setup.copy_codes') }}
        </button>

        <label class="row mt-6" style="gap: 8px; cursor: pointer;">
          <input v-model="savedConfirmed" type="checkbox" />
          <span>{{ t('tfa_setup.saved_confirm') }}</span>
        </label>

        <button
          class="btn btn-primary btn-block mt-6"
          :disabled="!savedConfirmed"
          @click="finishAndExit"
        >
          {{ t('tfa_setup.finish') }}
        </button>
      </section>

    </div>
  </main>
</template>

<style scoped>
.tfa-qr-block {
  display: flex;
  justify-content: center;
}
.tfa-qr-img {
  width: 240px;
  height: 240px;
  /* White background so the QR scans cleanly even in dark theme. */
  background: #fff;
  padding: 8px;
  border-radius: 8px;
  border: 1px solid var(--border);
}
.tfa-secret-text {
  display: block;
  margin-top: 6px;
  padding: 10px 12px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 13px;
  letter-spacing: 0.06em;
  word-break: break-all;
}
.tfa-input {
  width: 100%;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 18px;
  letter-spacing: 0.08em;
  text-align: center;
}
.tfa-recovery-list {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  list-style: none;
  margin: 0;
  padding: 0;
}
.tfa-recovery-list code {
  display: block;
  padding: 8px 10px;
  background: var(--bg-elev);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 13px;
}
@media (max-width: 480px) {
  .tfa-recovery-list {
    grid-template-columns: 1fr;
  }
}
</style>
