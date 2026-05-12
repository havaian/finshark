<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth.store';

const router = useRouter();
const auth = useAuthStore();

const errorMsg = ref<string | null>(null);

// Must match the key written by LoginPage before redirecting to Google.
const NEXT_STORAGE_KEY = 'acca_duo.post_login_next';

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
        errorMsg.value = `Sign-in failed: ${frag.error}`;
        return;
    }

    const access = frag.access_token;
    const refresh = frag.refresh_token;
    if (!access || !refresh) {
        errorMsg.value = 'Sign-in failed: missing tokens.';
        return;
    }

    try {
        await auth.completeGoogleLogin(access, refresh);
        // Clear the fragment from the URL so tokens don't sit in browser history.
        // replaceState avoids adding an extra back-nav entry.
        history.replaceState(null, '', window.location.pathname);
        router.replace(consumeNext());
    } catch {
        errorMsg.value = 'Sign-in failed: could not load your profile.';
    }
});
</script>

<template>
    <main class="auth-page">
        <div class="auth-card" style="text-align: center;">
            <template v-if="errorMsg">
                <h1>Sign-in failed</h1>
                <p class="error-text" style="margin-top: 12px;">{{ errorMsg }}</p>
                <RouterLink to="/login" class="btn btn-primary btn-block" style="margin-top: 22px;">
                    Try again
                </RouterLink>
            </template>
            <template v-else>
                <h1>Signing you in…</h1>
                <p class="dim" style="margin-top: 8px;">One moment.</p>
            </template>
        </div>
    </main>
</template>