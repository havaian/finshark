<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { authApi } from '../api/auth.api';
import { useAuthStore } from '../stores/auth.store';
import { useLocalePath } from '../router/useLocalePath';

// Lands here after the Google callback decided the user needs a second
// factor. The pending token is in the URL fragment (kept out of server
// logs, same reasoning as the regular auth-callback page). We hold it in
// memory while the user types their TOTP / recovery code, then swap it
// for real tokens via POST /auth/2fa-verify.
//
// If the user reloads or pastes the URL without the fragment (e.g. saved
// the page mid-flow), we kick them back to /login - there's nothing to
// recover from here.

const { t } = useI18n();
const router = useRouter();
const auth = useAuthStore();
const lp = useLocalePath();

const pendingToken = ref<string | null>(null);
const code = ref('');
const submitting = ref(false);
const errorMsg = ref<string | null>(null);
// Toggles the input affordance + helper text between "6-digit TOTP" mode
// and "recovery code" mode. The backend accepts either format
// transparently, so this is pure UX - it doesn't change the request shape.
const recoveryMode = ref(false);

const canSubmit = computed(
  () =>
    !submitting.value &&
    !!pendingToken.value &&
    code.value.trim().length >= (recoveryMode.value ? 25 : 6),
);

function parseFragment(): Record<string, string> {
  const raw = window.location.hash.startsWith('#')
    ? window.location.hash.slice(1)
    : window.location.hash;
  const params = new URLSearchParams(raw);
  const out: Record<string, string> = {};
  params.forEach((v, k) => {
    out[k] = v;
  });
  return out;
}

async function submit() {
  if (!pendingToken.value) return;
  submitting.value = true;
  errorMsg.value = null;
  try {
    const result = await authApi.twoFactorVerify({
      pending_2fa_token: pendingToken.value,
      code: code.value.trim(),
    });
    auth.completeTwoFactorLogin({
      access_token: result.tokens.access_token,
      refresh_token: result.tokens.refresh_token,
      user: result.user,
    });
    // Clear the fragment so the pending token (now consumed) doesn't sit
    // in browser history.
    history.replaceState(null, '', window.location.pathname);
    router.replace(lp('/dashboard'));
  } catch (e) {
    if (e instanceof AxiosError && e.response?.status === 401) {
      // Either the code was wrong OR the pending token expired (5min TTL).
      // We can't tell them apart without leaking which - keep generic.
      errorMsg.value = t('tfa_verify.error_invalid');
    } else {
      errorMsg.value = t('tfa_verify.error_generic');
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

onMounted(() => {
  const frag = parseFragment();
  const token = frag.pending_2fa_token;
  if (!token) {
    // No challenge to verify against. Bounce to login - they probably
    // pasted the URL or reloaded after a long pause.
    router.replace(lp('/login'));
    return;
  }
  pendingToken.value = token;
});
</script>

<template>
  <main class="auth-page">
    <div class="auth-card">
      <h1>{{ t('tfa_verify.title') }}</h1>
      <p class="dim text-sm mt-2">
        <template v-if="!recoveryMode">
          {{ t('tfa_verify.hint_totp') }}
        </template>
        <template v-else>
          {{ t('tfa_verify.hint_recovery') }}
        </template>
      </p>

      <div class="mt-6">
        <label class="field-label">
          <template v-if="!recoveryMode">{{ t('tfa_verify.label_totp') }}</template>
          <template v-else>{{ t('tfa_verify.label_recovery') }}</template>
        </label>
        <input v-model="code" :type="recoveryMode ? 'text' : 'text'" :inputmode="recoveryMode ? 'text' : 'numeric'"
          :autocomplete="recoveryMode ? 'off' : 'one-time-code'"
          :placeholder="recoveryMode ? 'ABCDE-FGHIJ-KLMNO-PQRST-UVWXY' : '123456'" :maxlength="recoveryMode ? 32 : 6"
          class="tfa-input" style="margin-top: 6px;" @keydown.enter="canSubmit && submit()" />
      </div>

      <p v-if="errorMsg" class="error-text mt-4">{{ errorMsg }}</p>

      <button class="btn btn-primary btn-block mt-6" :disabled="!canSubmit" @click="submit">
        {{ submitting ? t('common.saving') : t('tfa_verify.submit') }}
      </button>

      <div class="mt-4" style="text-align: center;">
        <a class="link-subtle" href="#" @click.prevent="toggleRecoveryMode">
          <template v-if="!recoveryMode">
            {{ t('tfa_verify.use_recovery') }}
          </template>
          <template v-else>
            {{ t('tfa_verify.use_totp') }}
          </template>
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
