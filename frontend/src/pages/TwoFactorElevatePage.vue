<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../stores/auth.store';
import { useLocalePath } from '../router/useLocalePath';

// Admin-area 2FA elevation. The router sends an enrolled-but-not-elevated admin
// here before any /admin/* route (see the Stage-2 gate in router/index.ts).
//
// Unlike the old login-time verify page, there is NO pending token: the user is
// already fully authenticated (the api client attaches their bearer token). We
// just collect a current TOTP / recovery code, POST it to /auth/2fa-elevate,
// store the elevated token pair, and return to ?next (the admin route they were
// heading for). Because they're already signed in, we also give them a clean
// "back to app" escape - elevating is optional unless they want the admin area.

const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const lp = useLocalePath();

const code = ref('');
const submitting = ref(false);
const errorMsg = ref<string | null>(null);
// Pure-UX toggle between 6-digit TOTP and recovery-code entry. The backend
// accepts either format transparently; this only swaps the affordance/helper.
const recoveryMode = ref(false);

const canSubmit = computed(
  () =>
    !submitting.value &&
    code.value.trim().length >= (recoveryMode.value ? 25 : 6),
);

// Where to land after a successful elevation. The guard passes the original
// admin destination as ?next; fall back to the admin overview. Guard against
// open-redirect: only same-origin paths.
function resolveNext(): string {
  const next = route.query.next;
  if (typeof next === 'string' && next.startsWith('/') && !next.startsWith('//')) {
    return next;
  }
  return lp('/admin');
}

async function submit() {
  submitting.value = true;
  errorMsg.value = null;
  try {
    const result = await authApi.twoFactorElevate({ code: code.value.trim() });
    auth.applyElevation({
      access_token: result.tokens.access_token,
      refresh_token: result.tokens.refresh_token,
      user: result.user,
    });
    router.replace(resolveNext());
  } catch (e) {
    if (e instanceof AxiosError && e.response?.status === 401) {
      // Wrong code or per-user lockout - kept generic, no oracle.
      errorMsg.value = t('tfa_elevate.error_invalid');
    } else {
      errorMsg.value = t('tfa_elevate.error_generic');
    }
  } finally {
    submitting.value = false;
  }
}

function toggleRecoveryMode() {
  recoveryMode.value = !recoveryMode.value;
  code.value = '';
  errorMsg.value = null;
}

function backToApp() {
  router.replace(lp('/dashboard'));
}
</script>

<template>
  <main class="auth-page">
    <div class="auth-card">
      <h1>{{ t('tfa_elevate.title') }}</h1>
      <p class="dim text-sm mt-2">{{ t('tfa_elevate.subtitle') }}</p>
      <p class="dim text-sm mt-2">
        <template v-if="!recoveryMode">
          {{ t('tfa_elevate.hint_totp') }}
        </template>
        <template v-else>
          {{ t('tfa_elevate.hint_recovery') }}
        </template>
      </p>

      <div class="mt-6">
        <label class="field-label">
          <template v-if="!recoveryMode">{{ t('tfa_elevate.label_totp') }}</template>
          <template v-else>{{ t('tfa_elevate.label_recovery') }}</template>
        </label>
        <input v-model="code" type="text" :inputmode="recoveryMode ? 'text' : 'numeric'"
          :autocomplete="recoveryMode ? 'off' : 'one-time-code'"
          :placeholder="recoveryMode ? 'ABCDE-FGHIJ-KLMNO-PQRST-UVWXY' : '123456'" :maxlength="recoveryMode ? 32 : 6"
          class="tfa-input" style="margin-top: 6px;" @keydown.enter="canSubmit && submit()" />
      </div>

      <p v-if="errorMsg" class="error-text mt-4">{{ errorMsg }}</p>

      <button class="btn btn-primary btn-block mt-6" :disabled="!canSubmit" @click="submit">
        {{ submitting ? t('common.saving') : t('tfa_elevate.submit') }}
      </button>

      <div class="mt-4" style="text-align: center;">
        <a class="link-subtle" href="#" @click.prevent="toggleRecoveryMode">
          <template v-if="!recoveryMode">
            {{ t('tfa_elevate.use_recovery') }}
          </template>
          <template v-else>
            {{ t('tfa_elevate.use_totp') }}
          </template>
        </a>
      </div>

      <div class="mt-4" style="text-align: center;">
        <a class="link-subtle" href="#" @click.prevent="backToApp">
          {{ t('tfa_elevate.back_to_app') }}
        </a>
      </div>
    </div>
  </main>
</template>

<style scoped>
.tfa-input {
  width: 100%;
  /* Larger characters so 6-digit codes are readable; monospace lines up
     digits visually. */
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 18px;
  letter-spacing: 0.08em;
  text-align: center;
}

.link-subtle {
  color: var(--text-mute);
  font-size: 13px;
  text-decoration: underline;
}

.link-subtle:hover {
  color: var(--text);
}
</style>
