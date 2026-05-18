<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { adminApi } from '../../api/admin.api';
import type {
  ContentTreePaper,
  ContentTreeLo,
  McqOptionRaw,
  QuestionRaw,
  QuestionDifficulty,
  QuestionType,
} from '../../types/content';

// Unified admin content browser. Single page combining Papers→LOs→Questions
// into one tree view. The old per-page routes still exist for structural ops
// (creating papers, reordering LOs) but the daily workflow lives here.
//
// URL state:
//   /admin/content                — empty state (pick an LO from the tree)
//   /admin/content?lo=<id>        — questions for that LO loaded on the right
//   /admin/content?lo=<id>&tab=drafts — filter open at "drafts" tab
//
// Keeping selection in the URL means refreshes preserve context and admins
// can bookmark a specific LO.

type StatusTab = 'active' | 'drafts';

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

// ---- Tree state ----
const tree = ref<ContentTreePaper[]>([]);
const treeLoading = ref(false);
const treeError = ref<string | null>(null);
// Papers default to expanded on first load (small data, easier to scan).
// We persist collapsed-paper-ids in component state only (not URL) — refreshes
// re-expand everything which is fine for small N.
const collapsedPapers = ref<Set<string>>(new Set());

// ---- Selection ----
const selectedLoId = computed<string | null>(() => {
  const q = route.query.lo;
  return typeof q === 'string' ? q : null;
});
const statusTab = computed<StatusTab>(() => {
  return route.query.tab === 'drafts' ? 'drafts' : 'active';
});

// Find the currently selected LO in the tree (for header + theory hint).
const selectedLo = computed<{ paper: ContentTreePaper; lo: ContentTreeLo } | null>(() => {
  if (!selectedLoId.value) return null;
  for (const p of tree.value) {
    const lo = p.learning_objectives.find((x) => x.id === selectedLoId.value);
    if (lo) return { paper: p, lo };
  }
  return null;
});

// ---- Question list state ----
const questions = ref<QuestionRaw[]>([]);
const questionsLoading = ref(false);
const questionsError = ref<string | null>(null);
const searchTerm = ref('');

// Filtered view: status tab + search term. Search matches EN or RU prompt
// case-insensitively. Empty search shows everything within the tab.
const filteredQuestions = computed<QuestionRaw[]>(() => {
  const tabFiltered = questions.value.filter((q) =>
    statusTab.value === 'active' ? q.is_active : !q.is_active,
  );
  const term = searchTerm.value.trim().toLowerCase();
  if (term === '') return tabFiltered;
  return tabFiltered.filter((q) => {
    const en = q.prompt_en.toLowerCase();
    const ru = (q.prompt_ru ?? '').toLowerCase();
    return en.includes(term) || ru.includes(term);
  });
});

const activeCount = computed(() => questions.value.filter((q) => q.is_active).length);
const draftCount = computed(() => questions.value.filter((q) => !q.is_active).length);

// ---- Batch selection (drafts only) ----
const selectedIds = ref<Set<string>>(new Set());
const allFilteredSelected = computed(() =>
  filteredQuestions.value.length > 0 &&
  filteredQuestions.value.every((q) => selectedIds.value.has(q.id)),
);

function toggleSelected(id: string) {
  const next = new Set(selectedIds.value);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  selectedIds.value = next;
}

function toggleSelectAll() {
  if (allFilteredSelected.value) {
    selectedIds.value = new Set();
  } else {
    selectedIds.value = new Set(filteredQuestions.value.map((q) => q.id));
  }
}

const batchBusy = ref(false);

async function batchActivate() {
  if (selectedIds.value.size === 0 || batchBusy.value) return;
  batchBusy.value = true;
  questionsError.value = null;
  try {
    const ids = Array.from(selectedIds.value);
    const updated = await adminApi.setQuestionsActive(ids, true);
    // Replace each updated question in the local list. Also update tree counts.
    const updatedById = new Map(updated.map((q) => [q.id, q]));
    questions.value = questions.value.map((q) => updatedById.get(q.id) ?? q);
    selectedIds.value = new Set();
    await reloadTree();
  } catch (e) {
    questionsError.value = extractError(e) ?? 'failed to activate selected';
  } finally {
    batchBusy.value = false;
  }
}

async function batchDelete() {
  if (selectedIds.value.size === 0 || batchBusy.value) return;
  const count = selectedIds.value.size;
  if (!confirm(t('admin.content.batch_delete_confirm', { count }))) return;
  batchBusy.value = true;
  questionsError.value = null;
  try {
    const ids = Array.from(selectedIds.value);
    await adminApi.deleteQuestionsMany(ids);
    const idSet = new Set(ids);
    questions.value = questions.value.filter((q) => !idSet.has(q.id));
    selectedIds.value = new Set();
    await reloadTree();
  } catch (e) {
    questionsError.value = extractError(e) ?? 'failed to delete selected';
  } finally {
    batchBusy.value = false;
  }
}

// ---- Per-question actions ----

async function toggleActive(q: QuestionRaw) {
  try {
    const updated = await adminApi.updateQuestion(q.id, { is_active: !q.is_active });
    questions.value = questions.value.map((x) => (x.id === updated.id ? updated : x));
    await reloadTree();
  } catch (e) {
    questionsError.value = extractError(e) ?? 'failed to toggle active';
  }
}

async function onDelete(q: QuestionRaw) {
  if (!confirm(t('admin.questions.delete_confirm'))) return;
  try {
    await adminApi.deleteQuestion(q.id);
    questions.value = questions.value.filter((x) => x.id !== q.id);
    await reloadTree();
  } catch (e) {
    questionsError.value = extractError(e) ?? 'failed to delete';
  }
}

// ---- Edit modal ----

const editingQuestion = ref<QuestionRaw | null>(null);
// Edit form scratch state. Mirrors the per-field refs from the old page; kept
// here because the modal is short-lived and resetting on close is trivial.
const editType = ref<QuestionType>('mcq');
const editDifficulty = ref<QuestionDifficulty>('easy');
const editPromptEn = ref('');
const editPromptRu = ref('');
const editOptions = ref<McqOptionRaw[]>([]);
const editCorrectEn = ref('');
const editCorrectRu = ref('');
const editExplanationEn = ref('');
const editExplanationRu = ref('');
const editConceptBiteEn = ref('');
const editConceptBiteRu = ref('');
const editAcceptableTolerance = ref('');
const editLang = ref<'en' | 'ru'>('en');
const savingEdit = ref(false);

function openEditModal(q: QuestionRaw) {
  editingQuestion.value = q;
  editType.value = q.type;
  editDifficulty.value = q.difficulty;
  editPromptEn.value = q.prompt_en;
  editPromptRu.value = q.prompt_ru ?? '';
  editOptions.value = q.options
    ? q.options.map((o) => ({
        key: o.key,
        text_en: o.text_en,
        text_ru: o.text_ru ?? '',
        why_wrong_en: o.why_wrong_en ?? '',
        why_wrong_ru: o.why_wrong_ru ?? '',
      } as McqOptionRaw))
    : [];
  editCorrectEn.value = q.correct_answer_en;
  editCorrectRu.value = q.correct_answer_ru ?? '';
  editExplanationEn.value = q.explanation_en;
  editExplanationRu.value = q.explanation_ru ?? '';
  editConceptBiteEn.value = q.concept_bite_en ?? '';
  editConceptBiteRu.value = q.concept_bite_ru ?? '';
  editAcceptableTolerance.value =
    q.acceptable_tolerance !== null && q.acceptable_tolerance !== undefined
      ? String(q.acceptable_tolerance)
      : '';
  editLang.value = 'en';
}

function closeEditModal() {
  editingQuestion.value = null;
}

function blankToNull(s: string): string | null {
  const trimmed = s.trim();
  return trimmed ? trimmed : null;
}

async function saveEdit() {
  if (!editingQuestion.value) return;
  if (!editPromptEn.value.trim() || !editCorrectEn.value.trim() || !editExplanationEn.value.trim())
    return;
  savingEdit.value = true;
  questionsError.value = null;
  try {
    const correctKey = editCorrectEn.value.trim();
    const options =
      editType.value === 'mcq'
        ? editOptions.value
            .filter((o) => o.key.trim() && o.text_en.trim())
            .map((o) => {
              const isCorrect = o.key.trim() === correctKey;
              return {
                key: o.key.trim(),
                text_en: o.text_en.trim(),
                text_ru: blankToNull(o.text_ru ?? ''),
                why_wrong_en: isCorrect ? null : blankToNull(o.why_wrong_en ?? ''),
                why_wrong_ru: isCorrect ? null : blankToNull(o.why_wrong_ru ?? ''),
              };
            })
        : null;

    const tolRaw = editAcceptableTolerance.value.trim();
    let tolerance: number | null = null;
    if (editType.value === 'number_entry' && tolRaw !== '') {
      const parsed = parseFloat(tolRaw);
      if (Number.isFinite(parsed) && parsed >= 0) tolerance = parsed;
    }

    const updated = await adminApi.updateQuestion(editingQuestion.value.id, {
      type: editType.value,
      difficulty: editDifficulty.value,
      prompt_en: editPromptEn.value.trim(),
      prompt_ru: blankToNull(editPromptRu.value),
      options,
      correct_answer_en: editCorrectEn.value.trim(),
      correct_answer_ru:
        editType.value === 'short_answer' ? blankToNull(editCorrectRu.value) : null,
      explanation_en: editExplanationEn.value.trim(),
      explanation_ru: blankToNull(editExplanationRu.value),
      concept_bite_en: blankToNull(editConceptBiteEn.value),
      concept_bite_ru: blankToNull(editConceptBiteRu.value),
      acceptable_tolerance: tolerance,
    });
    questions.value = questions.value.map((q) => (q.id === updated.id ? updated : q));
    closeEditModal();
  } catch (e) {
    questionsError.value = extractError(e) ?? 'failed to save question';
  } finally {
    savingEdit.value = false;
  }
}

// ---- Loaders ----

async function reloadTree() {
  treeLoading.value = true;
  treeError.value = null;
  try {
    tree.value = await adminApi.getContentTree();
  } catch (e) {
    treeError.value = extractError(e) ?? 'failed to load content tree';
  } finally {
    treeLoading.value = false;
  }
}

async function loadQuestions(loId: string) {
  questionsLoading.value = true;
  questionsError.value = null;
  selectedIds.value = new Set();
  try {
    questions.value = await adminApi.listQuestions(loId);
  } catch (e) {
    questionsError.value = extractError(e) ?? 'failed to load questions';
    questions.value = [];
  } finally {
    questionsLoading.value = false;
  }
}

// Re-load questions whenever the selected LO changes via URL.
watch(
  selectedLoId,
  (id) => {
    if (id) loadQuestions(id);
    else questions.value = [];
  },
  { immediate: true },
);

// ---- Navigation helpers ----

function selectLo(loId: string) {
  // Preserve the current tab if any — switching LOs while on "drafts" keeps you there.
  router.push({ query: { ...route.query, lo: loId } });
}

function setTab(tab: StatusTab) {
  router.push({ query: { ...route.query, tab } });
  selectedIds.value = new Set();
}

function togglePaper(paperId: string) {
  const next = new Set(collapsedPapers.value);
  if (next.has(paperId)) next.delete(paperId);
  else next.add(paperId);
  collapsedPapers.value = next;
}

// ---- Type label helper ----

function typeLabel(t_: QuestionType): string {
  return t_ === 'mcq'
    ? t('admin.questions.type_mcq')
    : t_ === 'number_entry'
      ? t('admin.questions.type_number')
      : t('admin.questions.type_short');
}

// ---- Drop DB + reseed ----
// Destructive action, gated by a confirmation modal. The confirm input must
// match a known string (localised) to avoid muscle-memory misclicks.
//
// The button is in the tree sidebar header so it's always visible while the
// admin is in the content browser. After success we reload the tree to show
// the fresh paper/LO/question counts; the right pane clears if the previously
// selected LO no longer exists.
type ReseedResult = Awaited<ReturnType<typeof adminApi.systemReseed>>;
const reseedModalOpen = ref(false);
const reseedConfirmText = ref('');
const reseedBusy = ref(false);
const reseedError = ref<string | null>(null);
const reseedResult = ref<ReseedResult | null>(null);

// The literal an admin has to type into the confirm box. Kept here (not in
// the locale) on purpose — admins should type the same word regardless of
// their UI language, so the safety net works even if a locale override breaks
// the prompt copy.
const RESEED_CONFIRM_LITERAL = 'RESEED';

const reseedConfirmReady = computed(
  () => reseedConfirmText.value.trim().toUpperCase() === RESEED_CONFIRM_LITERAL,
);

function openReseedModal() {
  reseedConfirmText.value = '';
  reseedError.value = null;
  // Keep reseedResult.value so admins can re-read the last summary after
  // closing & reopening — only cleared on successful new run.
  reseedModalOpen.value = true;
}

function closeReseedModal() {
  if (reseedBusy.value) return;
  reseedModalOpen.value = false;
}

async function runReseed() {
  if (!reseedConfirmReady.value || reseedBusy.value) return;
  reseedBusy.value = true;
  reseedError.value = null;
  try {
    const result = await adminApi.systemReseed();
    reseedResult.value = result;
    // The previously-selected LO id is likely gone now — drop it from the URL
    // and reload the tree so the right pane shows the empty state again.
    if (selectedLoId.value) {
      await router.replace({ query: {} });
    }
    await reloadTree();
    // Reset the confirm box so a follow-up run requires re-typing.
    reseedConfirmText.value = '';
  } catch (e) {
    reseedError.value = extractError(e) ?? 'failed to reseed';
  } finally {
    reseedBusy.value = false;
  }
}

function extractError(e: unknown): string | null {
  if (e instanceof AxiosError) {
    const msg = (e.response?.data as { message?: string | string[] })?.message;
    return Array.isArray(msg) ? msg.join(', ') : msg ?? null;
  }
  return null;
}

onMounted(reloadTree);
</script>

<template>
  <div class="content-browser">

    <!-- Sidebar: paper tree -->
    <aside class="content-tree">
      <header class="content-tree-head">
        <h2>{{ t('admin.content.title') }}</h2>
        <div class="row" style="gap: 8px; align-items: center;">
          <!-- Drop & reseed: destructive — yellow/danger button. Sits next to
               the structural-ops link because they're both "tree-level" actions. -->
          <button
            type="button"
            class="btn-link"
            style="color: var(--danger);"
            @click="openReseedModal"
          >
            {{ t('admin.content.reseed_btn') }}
          </button>
          <RouterLink to="/admin/papers" class="btn-link text-xs">
            {{ t('admin.content.manage_structure') }}
          </RouterLink>
        </div>
      </header>
      <p v-if="treeError" class="error-text">{{ treeError }}</p>
      <p v-if="treeLoading && tree.length === 0" class="dim text-sm">
        {{ t('common.loading') }}
      </p>

      <div v-if="tree.length === 0 && !treeLoading" class="dim text-sm">
        {{ t('admin.content.empty_tree') }}
      </div>

      <div v-for="p in tree" :key="p.id" class="content-tree-paper">
        <button
          type="button"
          class="content-tree-paper-head"
          @click="togglePaper(p.id)"
        >
          <span class="content-tree-arrow">
            {{ collapsedPapers.has(p.id) ? '▸' : '▾' }}
          </span>
          <span class="content-tree-paper-code mono">{{ p.code }}</span>
          <span class="content-tree-paper-name">{{ p.name_en }}</span>
        </button>
        <ul v-if="!collapsedPapers.has(p.id)" class="content-tree-los">
          <li v-for="lo in p.learning_objectives" :key="lo.id">
            <button
              type="button"
              :class="['content-tree-lo', { active: selectedLoId === lo.id }]"
              @click="selectLo(lo.id)"
            >
              <span class="content-tree-lo-code mono">{{ lo.code }}</span>
              <span class="content-tree-lo-title">{{ lo.title_en }}</span>
              <span class="content-tree-lo-counts">
                <span v-if="lo.active_count > 0" class="content-tree-count">
                  {{ lo.active_count }}
                </span>
                <span v-if="lo.draft_count > 0" class="content-tree-count draft">
                  {{ lo.draft_count }}
                </span>
              </span>
            </button>
          </li>
          <li v-if="p.learning_objectives.length === 0" class="dim text-xs" style="padding: 8px 12px;">
            {{ t('admin.content.no_los') }}
          </li>
        </ul>
      </div>
    </aside>

    <!-- Main: question list for selected LO -->
    <section class="content-main">
      <div v-if="!selectedLo" class="content-empty">
        <p class="dim">{{ t('admin.content.pick_lo') }}</p>
      </div>

      <template v-else>
        <header class="content-main-head">
          <div>
            <div class="content-main-breadcrumb dim text-xs">
              {{ selectedLo.paper.code }} · {{ selectedLo.paper.name_en }}
            </div>
            <h1>
              <span class="mono dim" style="margin-right: 8px;">{{ selectedLo.lo.code }}</span>
              {{ selectedLo.lo.title_en }}
            </h1>
            <p v-if="selectedLo.lo.has_theory" class="dim text-xs mt-1">
              <span class="lo-theory-tag" style="display: inline-block;">{{ t('admin.los.theory_tag') }}</span>
              <RouterLink :to="`/admin/papers/${selectedLo.paper.id}/los`" class="btn-link text-xs">
                {{ t('admin.content.edit_in_los_page') }}
              </RouterLink>
            </p>
          </div>
          <div class="row" style="gap: 12px;">
            <RouterLink :to="`/admin/los/${selectedLo.lo.id}/questions`" class="btn-link">
              {{ t('admin.content.legacy_editor') }}
            </RouterLink>
          </div>
        </header>

        <!-- Tabs + search -->
        <div class="content-toolbar">
          <div class="content-tabs">
            <button
              type="button"
              :class="['content-tab', { active: statusTab === 'active' }]"
              @click="setTab('active')"
            >
              {{ t('admin.content.tab_active') }}
              <span class="content-tab-count">{{ activeCount }}</span>
            </button>
            <button
              type="button"
              :class="['content-tab', { active: statusTab === 'drafts' }]"
              @click="setTab('drafts')"
            >
              {{ t('admin.content.tab_drafts') }}
              <span class="content-tab-count">{{ draftCount }}</span>
            </button>
          </div>
          <input
            v-model="searchTerm"
            type="search"
            class="content-search"
            :placeholder="t('admin.content.search_ph')"
          />
        </div>

        <!-- Batch toolbar — appears when in Drafts tab with selection -->
        <div v-if="statusTab === 'drafts' && selectedIds.size > 0" class="content-batch-bar">
          <span class="text-sm">
            {{ t('admin.content.selected_count', { count: selectedIds.size }) }}
          </span>
          <div class="row" style="gap: 8px;">
            <button
              type="button"
              class="btn btn-primary btn-sm"
              :disabled="batchBusy"
              @click="batchActivate"
            >
              {{ batchBusy ? t('common.saving') : t('admin.content.batch_activate') }}
            </button>
            <button
              type="button"
              class="btn btn-ghost btn-sm"
              :disabled="batchBusy"
              style="color: var(--danger);"
              @click="batchDelete"
            >
              {{ t('admin.content.batch_delete') }}
            </button>
          </div>
        </div>

        <p v-if="questionsError" class="error-text">{{ questionsError }}</p>
        <p v-if="questionsLoading" class="dim text-sm">{{ t('common.loading') }}</p>

        <!-- Question list -->
        <div v-if="!questionsLoading" class="content-question-list">
          <div v-if="filteredQuestions.length === 0" class="dim text-sm" style="padding: 24px 0;">
            {{ searchTerm
              ? t('admin.content.no_search_match')
              : statusTab === 'active'
                ? t('admin.content.no_active')
                : t('admin.content.no_drafts')
            }}
          </div>

          <!-- "Select all in view" header — only shown on Drafts tab with results. -->
          <label v-if="statusTab === 'drafts' && filteredQuestions.length > 0" class="content-select-all">
            <input
              type="checkbox"
              :checked="allFilteredSelected"
              @change="toggleSelectAll"
            />
            <span class="dim text-xs">{{ t('admin.content.select_all_in_view') }}</span>
          </label>

          <article
            v-for="q in filteredQuestions"
            :key="q.id"
            :class="['content-question', { draft: !q.is_active }]"
          >
            <header class="content-question-head">
              <label v-if="statusTab === 'drafts'" class="content-question-check">
                <input
                  type="checkbox"
                  :checked="selectedIds.has(q.id)"
                  @change="toggleSelected(q.id)"
                />
              </label>
              <span class="content-question-type">{{ typeLabel(q.type) }}</span>
              <span class="dim">·</span>
              <span class="content-question-difficulty">{{ q.difficulty }}</span>
              <span v-if="!q.is_active" class="badge badge-draft">{{ t('admin.content.draft_badge') }}</span>
            </header>

            <div class="content-question-prompt">{{ q.prompt_en }}</div>
            <div v-if="q.prompt_ru" class="content-question-prompt-ru dim text-sm">
              <span class="mono text-xs muted">RU</span> {{ q.prompt_ru }}
            </div>

            <div class="content-question-actions">
              <button class="btn-link accent" @click="openEditModal(q)">
                {{ t('common.edit') }}
              </button>
              <button class="btn-link" @click="toggleActive(q)">
                {{ q.is_active ? t('admin.questions.retire') : t('admin.questions.restore') }}
              </button>
              <button class="btn-link" style="color: var(--danger);" @click="onDelete(q)">
                {{ t('common.delete') }}
              </button>
            </div>
          </article>
        </div>
      </template>
    </section>

    <!-- Edit modal -->
    <!-- Backdrop click closes only when not saving — prevents losing edits to an accidental click. -->
    <div
      v-if="editingQuestion"
      class="modal-backdrop"
      @click="!savingEdit && closeEditModal()"
    >
      <div class="modal-card modal-card-wide" @click.stop>
        <header class="modal-head">
          <h2>{{ t('admin.content.edit_modal_title') }}</h2>
          <button type="button" class="btn-link" @click="closeEditModal">✕</button>
        </header>

        <div class="form-grid-2">
          <div class="field">
            <label class="field-label">{{ t('admin.questions.type') }}</label>
            <select v-model="editType">
              <option value="mcq">{{ t('admin.questions.type_mcq') }}</option>
              <option value="short_answer">{{ t('admin.questions.type_short') }}</option>
              <option value="number_entry">{{ t('admin.questions.type_number') }}</option>
            </select>
          </div>
          <div class="field">
            <label class="field-label">{{ t('admin.questions.difficulty') }}</label>
            <select v-model="editDifficulty">
              <option value="easy">{{ t('admin.questions.difficulty_easy') }}</option>
              <option value="medium">{{ t('admin.questions.difficulty_medium') }}</option>
              <option value="hard">{{ t('admin.questions.difficulty_hard') }}</option>
            </select>
          </div>
        </div>

        <div v-if="editType === 'number_entry'" class="field mt-2">
          <label class="field-label">{{ t('admin.questions.tolerance_label') }}</label>
          <input
            v-model="editAcceptableTolerance"
            type="text"
            inputmode="decimal"
            maxlength="20"
            :placeholder="t('admin.questions.tolerance_ph')"
          />
          <p class="input-help">{{ t('admin.questions.tolerance_help') }}</p>
        </div>

        <div class="lang-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            :class="['lang-tab', { active: editLang === 'en' }]"
            @click="editLang = 'en'"
          >{{ t('admin.questions.lang_tab_en') }}</button>
          <button
            type="button"
            role="tab"
            :class="['lang-tab', { active: editLang === 'ru' }]"
            @click="editLang = 'ru'"
          >{{ t('admin.questions.lang_tab_ru') }}</button>
        </div>

        <!-- EN pane -->
        <div v-show="editLang === 'en'">
          <div class="field mt-2">
            <label class="field-label">{{ t('admin.questions.concept_bite_en') }}</label>
            <textarea v-model="editConceptBiteEn" rows="2" maxlength="4000"></textarea>
          </div>
          <div class="field mt-2">
            <label class="field-label">{{ t('admin.questions.prompt_en') }}</label>
            <textarea v-model="editPromptEn" rows="3" maxlength="4000" required></textarea>
          </div>
          <div v-if="editType === 'mcq'" class="field mt-2">
            <label class="field-label">{{ t('admin.questions.options') }}</label>
            <div class="col" style="gap: 12px;">
              <div v-for="(opt, i) in editOptions" :key="i" class="option-editor-block">
                <div class="option-editor-row">
                  <input v-model="opt.key" type="text" class="opt-key-input" maxlength="2" />
                  <input v-model="opt.text_en" type="text" class="grow" maxlength="500" />
                </div>
                <div v-if="opt.key.trim() !== editCorrectEn.trim()" class="option-why-wrong">
                  <input
                    v-model="opt.why_wrong_en"
                    type="text"
                    maxlength="2000"
                    :placeholder="t('admin.questions.why_wrong_en_ph')"
                  />
                </div>
              </div>
            </div>
          </div>
          <div class="field mt-2">
            <label class="field-label">
              {{ editType === 'mcq'
                ? t('admin.questions.correct_label_mcq')
                : editType === 'number_entry'
                  ? t('admin.questions.correct_label_number')
                  : t('admin.questions.correct_label_short_en')
              }}
            </label>
            <input
              v-model="editCorrectEn"
              type="text"
              :inputmode="editType === 'number_entry' ? 'decimal' : undefined"
              maxlength="500"
              required
            />
          </div>
          <div class="field mt-2">
            <label class="field-label">{{ t('admin.questions.explanation_en') }}</label>
            <textarea v-model="editExplanationEn" rows="3" maxlength="4000" required></textarea>
          </div>
        </div>

        <!-- RU pane -->
        <div v-show="editLang === 'ru'">
          <div class="field mt-2">
            <label class="field-label">{{ t('admin.questions.concept_bite_ru') }}</label>
            <textarea v-model="editConceptBiteRu" rows="2" maxlength="4000"></textarea>
          </div>
          <div class="field mt-2">
            <label class="field-label">{{ t('admin.questions.prompt_ru') }}</label>
            <textarea v-model="editPromptRu" rows="3" maxlength="4000"></textarea>
          </div>
          <div v-if="editType === 'mcq'" class="field mt-2">
            <label class="field-label">{{ t('admin.questions.options') }}</label>
            <div class="col" style="gap: 12px;">
              <div v-for="(opt, i) in editOptions" :key="i" class="option-editor-block">
                <div class="option-editor-row">
                  <input v-model="opt.key" type="text" class="opt-key-input" maxlength="2" disabled />
                  <input v-model="opt.text_ru" type="text" class="grow" maxlength="500" />
                </div>
                <div v-if="opt.key.trim() !== editCorrectEn.trim()" class="option-why-wrong">
                  <input
                    v-model="opt.why_wrong_ru"
                    type="text"
                    maxlength="2000"
                    :placeholder="t('admin.questions.why_wrong_ru_ph')"
                  />
                </div>
              </div>
            </div>
          </div>
          <div v-if="editType === 'short_answer'" class="field mt-2">
            <label class="field-label">{{ t('admin.questions.correct_label_short_ru') }}</label>
            <input v-model="editCorrectRu" type="text" maxlength="500" />
          </div>
          <div class="field mt-2">
            <label class="field-label">{{ t('admin.questions.explanation_ru') }}</label>
            <textarea v-model="editExplanationRu" rows="3" maxlength="4000"></textarea>
          </div>
        </div>

        <div class="admin-edit-actions">
          <button class="btn btn-primary" :disabled="savingEdit" @click="saveEdit">
            {{ savingEdit ? t('common.saving') : t('common.save_changes') }}
          </button>
          <button class="btn btn-ghost" :disabled="savingEdit" @click="closeEditModal">
            {{ t('common.cancel') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Drop & reseed modal -->
    <!-- Confirmation gate: the admin has to type the literal RESEED before the
         run button enables. Backdrop click is allowed only when not busy so an
         in-flight wipe can't be cancelled mid-flight (the request still
         completes server-side, but we don't want the UI lying about state). -->
    <div
      v-if="reseedModalOpen"
      class="modal-backdrop"
      @click="closeReseedModal"
    >
      <div class="modal-card" @click.stop>
        <header class="modal-head">
          <h2 style="color: var(--danger);">{{ t('admin.content.reseed_modal_title') }}</h2>
          <button
            type="button"
            class="btn-link"
            :disabled="reseedBusy"
            @click="closeReseedModal"
          >✕</button>
        </header>

        <p class="dim text-sm">{{ t('admin.content.reseed_warn_1') }}</p>
        <ul class="dim text-sm mt-2" style="padding-left: 20px;">
          <li>{{ t('admin.content.reseed_warn_drop_content') }}</li>
          <li>{{ t('admin.content.reseed_warn_drop_progress') }}</li>
          <li>{{ t('admin.content.reseed_warn_keep_users') }}</li>
        </ul>
        <p class="dim text-sm mt-4">
          {{ t('admin.content.reseed_confirm_prompt', { word: RESEED_CONFIRM_LITERAL }) }}
        </p>
        <input
          v-model="reseedConfirmText"
          type="text"
          :placeholder="RESEED_CONFIRM_LITERAL"
          :disabled="reseedBusy"
          class="mt-2"
          style="font-family: var(--font-mono, monospace);"
        />

        <p v-if="reseedError" class="error-text mt-4">{{ reseedError }}</p>

        <!-- Result summary — survives modal close so admins can re-open to re-read. -->
        <div v-if="reseedResult && !reseedBusy" class="card mt-4" style="background: var(--bg-elev);">
          <div class="text-sm" style="font-weight: 500;">
            {{ t('admin.content.reseed_done') }}
          </div>
          <ul class="dim text-xs mt-2" style="padding-left: 20px; line-height: 1.7;">
            <li>{{ t('admin.content.reseed_stat_papers', { dropped: reseedResult.papers_dropped, inserted: reseedResult.papers_inserted }) }}</li>
            <li>{{ t('admin.content.reseed_stat_questions', { count: reseedResult.questions_inserted }) }}</li>
            <li>{{ t('admin.content.reseed_stat_progress', { sessions: reseedResult.sessions_deleted, attempts: reseedResult.attempts_deleted, users: reseedResult.users_progress_reset }) }}</li>
            <li>{{ t('admin.content.reseed_stat_badges', { count: reseedResult.user_badges_deleted }) }}</li>
          </ul>
        </div>

        <div class="admin-edit-actions mt-4">
          <button
            type="button"
            class="btn btn-danger"
            :disabled="!reseedConfirmReady || reseedBusy"
            @click="runReseed"
          >
            {{ reseedBusy ? t('admin.content.reseed_running') : t('admin.content.reseed_run_btn') }}
          </button>
          <button
            type="button"
            class="btn btn-ghost"
            :disabled="reseedBusy"
            @click="closeReseedModal"
          >
            {{ t('common.cancel') }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
