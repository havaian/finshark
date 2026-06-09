<script setup lang="ts">
import { computed } from 'vue';

// Visual mockup of a payment card, styled to look like a real bank card in the
// app's sage palette. Reused in three places so the look stays consistent:
//   - user transfer view (PaymentPanel): shows the operator's receiving card
//     with a copy-to-clipboard action
//   - admin card list (AdminPaymentsPage): each saved card rendered as a card
//   - admin add/edit form (AdminPaymentsPage): a live preview that updates as
//     the operator types
//
// It's presentation-only: number grouping/masking is done here, but copying,
// editing, status, etc. are owned by the parent and passed in via props/slots.

const props = withDefaults(
    defineProps<{
        // Raw card number (spaces optional - we regroup into 4-digit blocks).
        cardNumber: string;
        // Cardholder name. Shown uppercased like an embossed card.
        holderName: string;
        // Optional bank / payment-system label (e.g. "Uzcard", "Humo").
        bankLabel?: string | null;
        // When false, the card renders dimmed to signal it's not shown to users
        // (admin-only state). Defaults to active.
        active?: boolean;
        // Placeholder text shown when the matching field is empty - used by the
        // admin form preview so an empty card still looks like a card.
        numberPlaceholder?: string;
        holderPlaceholder?: string;
    }>(),
    {
        bankLabel: null,
        active: true,
        numberPlaceholder: '•••• •••• •••• ••••',
        holderPlaceholder: 'CARDHOLDER NAME',
    }
);

// Group a raw card number into 4-digit blocks for readability. Empty input
// falls back to the placeholder so the form preview never collapses.
const displayNumber = computed(() => {
    const digits = props.cardNumber.replace(/\s+/g, '');
    if (!digits) return props.numberPlaceholder;
    return digits.replace(/(.{4})/g, '$1 ').trim();
});

const displayHolder = computed(() => {
    const name = props.holderName.trim();
    return name ? name : props.holderPlaceholder;
});
</script>

<template>
    <div class="pay-card" :class="{ 'pay-card-inactive': !active }">
        <!-- Top row: bank/system label + a decorative contactless glyph. -->
        <div class="pay-card-top">
            <span class="pay-card-bank">{{ bankLabel || '\u00A0' }}</span>
            <span class="pay-card-wave" aria-hidden="true">
                <!-- contactless arcs -->
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6"
                    stroke-linecap="round">
                    <path d="M8 6.5a8 8 0 0 1 0 11" />
                    <path d="M11.5 4.5a12 12 0 0 1 0 15" />
                    <path d="M15 2.5a16 16 0 0 1 0 19" />
                </svg>
            </span>
        </div>

        <!-- Chip: subtle gold gradient with embossed contact lines. -->
        <div class="pay-card-chip" aria-hidden="true">
            <span class="pay-card-chip-line"></span>
            <span class="pay-card-chip-line"></span>
            <span class="pay-card-chip-line"></span>
        </div>

        <!-- Card number, mono, evenly spaced. -->
        <div class="pay-card-number">{{ displayNumber }}</div>

        <!-- Bottom row: holder name + an optional action slot (copy button). -->
        <div class="pay-card-bottom">
            <div class="pay-card-holder">{{ displayHolder }}</div>
            <div v-if="$slots.action" class="pay-card-action">
                <slot name="action" />
            </div>
        </div>
    </div>
</template>

<style scoped>
.pay-card {
    /* Standard card aspect ratio (1.586:1). Caps at a comfortable width so it
     reads as a card, not a banner; shrinks fluidly below that. No colored
     border because the surface is a gradient - it runs to the rounded edge. */
    position: relative;
    width: 100%;
    max-width: 340px;
    aspect-ratio: 1.586 / 1;
    border-radius: 14px;
    padding: 18px 20px;
    display: flex;
    flex-direction: column;
    color: #f3f7f5;
    background:
        linear-gradient(135deg, var(--accent-deep) 0%, var(--accent) 55%, var(--sage-hot) 100%);
    box-shadow: var(--shadow-glow-sage), 0 6px 20px rgba(0, 0, 0, 0.18);
    overflow: hidden;
    isolation: isolate;
}

/* Soft sheen sweeping across the card for a bit of depth. Sits above the
   gradient, below the content (content has its own stacking via flow). */
.pay-card::after {
    content: "";
    position: absolute;
    inset: 0;
    background:
        radial-gradient(120% 80% at 85% -10%, rgba(255, 255, 255, 0.18), transparent 60%);
    pointer-events: none;
    z-index: 0;
}

.pay-card>* {
    position: relative;
    z-index: 1;
}

/* Dimmed treatment for inactive cards (admin list only). Desaturated and
   faded so it's clearly "not live" without changing the layout. */
.pay-card-inactive {
    filter: grayscale(0.55) brightness(0.9);
    opacity: 0.7;
}

.pay-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 8px;
}

.pay-card-bank {
    font-size: 13px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    min-width: 0;
}

.pay-card-wave {
    flex: 0 0 auto;
    color: rgba(243, 247, 245, 0.85);
    line-height: 0;
}

/* Chip sits between the top row and the number. Pushed down with margin-top
   auto so the number/holder anchor toward the bottom regardless of card
   height. */
.pay-card-chip {
    margin-top: auto;
    width: 42px;
    height: 30px;
    border-radius: 6px;
    background: linear-gradient(135deg, #f4d27a 0%, #d9b65e 45%, #c79b3e 100%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 3px;
    padding: 5px 6px;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.12);
}

.pay-card-chip-line {
    height: 2px;
    border-radius: 1px;
    background: rgba(120, 90, 20, 0.45);
}

.pay-card-number {
    margin-top: 12px;
    font-family: ui-monospace, "SF Mono", "Cascadia Code", Menlo, Consolas, monospace;
    font-size: clamp(16px, 4.6vw, 20px);
    letter-spacing: 0.10em;
    font-weight: 600;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
    word-break: break-all;
}

.pay-card-bottom {
    margin-top: 12px;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 10px;
}

.pay-card-holder {
    font-size: 12px;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    font-weight: 500;
    color: rgba(243, 247, 245, 0.92);
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.pay-card-action {
    flex: 0 0 auto;
}
</style>