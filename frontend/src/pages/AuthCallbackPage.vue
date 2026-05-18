<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from '../stores/auth.store';

const { t } = useI18n();
const router = useRouter();
const auth = useAuthStore();

const errorMsg = ref<string | null>(null);

// Must match the key written by LoginPage before redirecting to Google.
const NEXT_STORAGE_KEY = 'finshark.post_login_next';

// Parse the URL fragment that the backend put after the '#'.
// Backend writes either:
//   #access_token=...&refresh_token=...   (success)
//   #error=<reason>                       (failure)
// Fragments stay client-side (never sent to servers / logged in proxies),
// which is why the backend uses them instead of query params.
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

function consumeNext(): string {
    const next = sessionStorage.getItem(NEXT_STORAGE_KEY);
    sessionStorage.removeItem(NEXT_STORAGE_KEY);
    // Guard against open-redirect via `next`: only accept same-origin paths.
    if (next && next.startsWith('/') && !next.startsWith('//')) {
        return next;
    }
    return '/dashboard';
}

onMounted(async () => {
    const frag = parseFragment();

    if (frag.error) {
        // Surface a friendlier message for the specific whitelist rejection.
        // Other errors (state_invalid, google_token_exchange_failed, etc.) fall
        // through to the generic copy with the code appended in brackets so
        // engineering can still debug from a screenshot.
        if (frag.error === 'email_not_allowed') {
            errorMsg.value = t('login.error_email_not_allowed');
        } else {
            errorMsg.value = `${t('login.error_callback')} (${frag.error})`;
        }
        return;
    }

    const access = frag.access_token;
    const refresh = frag.refresh_token;
    if (!access || !refresh) {
        errorMsg.value = t('login.error_callback');
        return;
    }

    try {
        await auth.completeGoogleLogin(access, refresh);
        // Clear the fragment from the URL so tokens don't sit in browser history.
        // replaceState avoids adding an extra back-nav entry.
        history.replaceState(null, '', window.location.pathname);
        router.replace(consumeNext());
    } catch {
        errorMsg.value = t('login.error_callback');
    }
});
</script>

<template>
    <main class="auth-page">
        <div class="auth-card" style="text-align: center;">
            <template v-if="errorMsg">
                <h1>{{ t('login.error_callback') }}</h1>
                <p class="error-text" style="margin-top: 12px;">{{ errorMsg }}</p>
                <RouterLink to="/login" class="btn btn-primary btn-block" style="margin-top: 22px;">
                    {{ t('login.google_btn') }}
                </RouterLink>
            </template>
            <template v-else>
                <h1>{{ t('common.loading') }}</h1>
            </template>
        </div>
    </main>
</template>