import { computed, ref } from "vue";
import { defineStore } from "pinia";
import { billingApi } from "../api/billing.api";
import type { MyEntitlement } from "../types/billing";

// Stores the user's current tier + quota state. Refreshed:
//   - on app boot (main.ts) after auth has been hydrated
//   - on demand by any flow that just changed entitlement (redeem code,
//     completing a lesson, completing a mock)
//
// We DON'T persist to localStorage. The tier can flip after an admin grant /
// revoke / promocode redeem, and the quota counters move with every lesson -
// a fresh server read is cheaper than reconciling stale state. The store
// stays empty until the first fetch; consumers should `v-if`-guard on the
// presence check or `.tier` rather than treating undefined as "free".

export const useEntitlementStore = defineStore("entitlement", () => {
  const entitlement = ref<MyEntitlement | null>(null);
  // True while the first-load fetch is in flight. Used by chrome components
  // to defer rendering quota chips until we know the tier, rather than
  // flashing "free quota: 0/3" for a premium user on every cold load.
  const loading = ref(false);

  const tier = computed(() => entitlement.value?.tier ?? null);
  const isPremium = computed(() => entitlement.value?.tier === "premium");
  const isFree = computed(() => entitlement.value?.tier === "free");

  // Helpers the UI can read without null-checking every time. These return
  // null while the store hasn't fetched yet - the v-if-on-tier pattern
  // covers that case in templates.
  const lessonsRemaining = computed<number | null>(() => {
    const e = entitlement.value;
    if (!e || e.lessons.limit === null) return null;
    return Math.max(e.lessons.limit - e.lessons.used, 0);
  });

  const mocksRemaining = computed<number | null>(() => {
    const e = entitlement.value;
    if (!e || e.mocks.limit === null) return null;
    return Math.max(e.mocks.limit - e.mocks.used, 0);
  });

  async function fetch() {
    loading.value = true;
    try {
      entitlement.value = await billingApi.getMyEntitlement();
    } catch {
      // Non-fatal: leave the store empty. Boot continues; UI hides quota
      // chips when entitlement is null. Forced-logout (401) is handled by
      // the axios interceptor, not here.
      entitlement.value = null;
    } finally {
      loading.value = false;
    }
  }

  function clear() {
    entitlement.value = null;
  }

  // Patch helper for flows that just performed a state-changing op (e.g.
  // promocode redeem returns the new subscription, lesson complete bumps
  // used count). Cheaper than a full refetch but optional - callers can
  // also just await fetch().
  function setEntitlement(next: MyEntitlement) {
    entitlement.value = next;
  }

  return {
    entitlement,
    loading,
    tier,
    isPremium,
    isFree,
    lessonsRemaining,
    mocksRemaining,
    fetch,
    clear,
    setEntitlement,
  };
});
