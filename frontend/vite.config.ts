import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

// Manual chunks:
//   vendor-chart  — chart.js is large (~150 KB raw) and only loaded by Profile
//                   and Progress. Splitting it means new users hitting just the
//                   dashboard / lesson flow never download it.
//   vendor-vue    — vue, vue-router, vue-i18n, pinia. Stable surface, good cache
//                   hit rate across deploys.
//   vendor-axios  — axios. Used by every api/* file but cheap enough that it
//                   wouldn't matter standalone; we group it with vendor-vue's
//                   "core runtime" feel by leaving it in the main bundle (no
//                   entry below).
//
// Anything not matched falls into the default app chunk. Adding more entries
// here is safe — if a vendor package is not actually imported, the chunk just
// won't exist.

export default defineConfig({
  plugins: [vue()],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            if (id.includes('chart.js')) return 'vendor-chart';
            if (
              id.includes('vue-router') ||
              id.includes('vue-i18n') ||
              id.includes('pinia') ||
              // Match /node_modules/vue/ and /node_modules/@vue/ but NOT
              // chart.js's vue plugin (it'd be vue-chartjs, doesn't exist here).
              id.includes('/node_modules/vue/') ||
              id.includes('/node_modules/@vue/')
            ) {
              return 'vendor-vue';
            }
          }
          // Default: let rollup decide. Anything unhandled goes into the
          // entry chunk.
        },
      },
    },
  },
});
