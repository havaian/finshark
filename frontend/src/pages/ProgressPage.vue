<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { AxiosError } from 'axios';
import { progressApi } from '../api/progress.api';
import type {
  MasteryBand,
  ProgressHeatMapLo,
  ProgressResponse,
} from '../types/progress';

const data = ref<ProgressResponse | null>(null);
const loading = ref(true);
const errorMsg = ref<string | null>(null);

async function load() {
  loading.value = true;
  errorMsg.value = null;
  try {
    data.value = await progressApi.get();
  } catch (e) {
    if (e instanceof AxiosError) {
      const msg = (e.response?.data as { message?: string | string[] })?.message;
      errorMsg.value = Array.isArray(msg) ? msg.join(', ') : msg ?? 'failed to load progress';
    } else {
      errorMsg.value = 'failed to load progress';
    }
  } finally {
    loading.value = false;
  }
}

const tileClass: Record<MasteryBand, string> = {
  not_started: 'tile tile-grey',
  weak:        'tile tile-red',
  learning:    'tile tile-amber',
  strong:      'tile tile-green',
};
const pillClass: Record<MasteryBand, string> = {
  not_started: 'pill pill-grey',
  weak:        'pill pill-red',
  learning:    'pill pill-amber',
  strong:      'pill pill-green',
};
const bandLabel: Record<MasteryBand, string> = {
  not_started: 'Not started',
  weak:        'Weak',
  learning:    'Learning',
  strong:      'Strong',
};

function masteryText(lo: ProgressHeatMapLo): string {
  if (lo.avg_mastery === null) return '—';
  return `${Math.round(lo.avg_mastery)}%`;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

onMounted(load);
</script>

<template>
  <main class="page">
    <div class="container-wide">

      <div class="topbar">
        <h1>Progress</h1>
        <RouterLink to="/dashboard" class="btn-link">← Back to dashboard</RouterLink>
      </div>

      <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
      <p v-if="loading" class="dim text-sm">Loading progress…</p>

      <template v-if="!loading && data">
        <!-- Heat map -->
        <section class="card">
          <div class="row" style="justify-content: space-between; margin-bottom: 6px;">
            <h2>Syllabus coverage</h2>
            <div class="legend">
              <span
                v-for="b in (['not_started','weak','learning','strong'] as MasteryBand[])"
                :key="b"
                :class="pillClass[b]"
              >
                {{ bandLabel[b] }}
              </span>
            </div>
          </div>

          <p v-if="data.heat_map.length === 0" class="dim text-sm mt-4">
            No papers yet. An admin needs to add at least one.
          </p>

          <div v-for="paper in data.heat_map" :key="paper.paper_id" class="mt-4">
            <h3 style="margin-top: 14px;">{{ paper.paper_code }} · {{ paper.paper_name }}</h3>
            <p v-if="paper.los.length === 0" class="dim text-sm mt-2">
              No learning objectives yet for this paper.
            </p>
            <div v-else class="heat">
              <div
                v-for="lo in paper.los"
                :key="lo.lo_id"
                :class="tileClass[lo.band]"
                :title="lo.lo_title"
              >
                <div>
                  <div class="tile-code">{{ lo.lo_code }}</div>
                  <div class="tile-title">{{ lo.lo_title }}</div>
                </div>
                <div class="tile-meta">
                  {{ masteryText(lo) }} · {{ lo.seen_questions }}/{{ lo.total_questions }}
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Weak topics -->
        <section class="card">
          <h2>Weak topics</h2>
          <p v-if="data.weak_topics.length === 0" class="dim text-sm mt-4">
            No data yet — do a lesson and come back.
          </p>
          <div v-else class="list mt-4">
            <div
              v-for="t in data.weak_topics"
              :key="t.lo_id"
              class="list-row"
            >
              <div>
                <span class="mono dim text-xs">{{ t.paper_code }} / {{ t.lo_code }}</span>
                <span class="list-row-title" style="margin-left: 14px;">{{ t.lo_title }}</span>
              </div>
              <div class="mono dim text-sm">
                {{ Math.round(t.avg_mastery) }}% · {{ t.seen_questions }} qs
              </div>
            </div>
          </div>
        </section>

        <!-- Recent sessions -->
        <section class="card">
          <h2>Recent sessions</h2>
          <p v-if="data.recent_sessions.length === 0" class="dim text-sm mt-4">
            No sessions yet.
          </p>
          <div v-else class="list mt-4">
            <div
              v-for="s in data.recent_sessions"
              :key="s.id"
              class="list-row"
            >
              <div class="mono dim text-sm">{{ formatDate(s.started_at) }}</div>
              <div class="row">
                <span class="mono list-row-title">
                  {{ s.correct_count }} / {{ s.question_count }}
                </span>
                <span :class="['badge', s.completed_at ? 'badge-done' : 'badge-wip']">
                  {{ s.completed_at ? 'completed' : 'in progress' }}
                </span>
              </div>
            </div>
          </div>
        </section>
      </template>

    </div>
  </main>
</template>
