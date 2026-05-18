<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { AxiosError } from 'axios';
import { useI18n } from 'vue-i18n';
import { adminApi } from '../../api/admin.api';
import type {
  LearningObjectiveRaw,
  McqOptionRaw,
  QuestionRaw,
  QuestionDifficulty,
  QuestionType,
} from '../../types/content';

type EditLang = 'en' | 'ru';

const { t } = useI18n();
const route = useRoute();
const loId = route.params.lo_id as string;

const lo = ref<LearningObjectiveRaw | null>(null);
const questions = ref<QuestionRaw[]>([]);
const loading = ref(false);
const errorMsg = ref<string | null>(null);

// --- Create-form state ---
const newType = ref<QuestionType>('mcq');
const newDifficulty = ref<QuestionDifficulty>('easy');
const newPromptEn = ref('');
const newPromptRu = ref('');
// Initial 4 MCQ option rows. Each row has its own _en/_ru text and per-option
// "why this is wrong" explanation (shown to the user on a wrong MCQ answer).
const newOptions = ref<McqOptionRaw[]>([
  { key: 'A', text_en: '', text_ru: '', why_wrong_en: null, why_wrong_ru: null },
  { key: 'B', text_en: '', text_ru: '', why_wrong_en: null, why_wrong_ru: null },
  { key: 'C', text_en: '', text_ru: '', why_wrong_en: null, why_wrong_ru: null },
  { key: 'D', text_en: '', text_ru: '', why_wrong_en: null, why_wrong_ru: null },
]);
const newCorrectEn = ref('');
const newCorrectRu = ref('');
const newExplanationEn = ref('');
const newExplanationRu = ref('');
const newConceptBiteEn = ref('');
const newConceptBiteRu = ref('');
// number_entry only: optional ±tolerance. Empty string = use exact match.
const newAcceptableTolerance = ref('');
const newLang = ref<EditLang>('en'); // which language tab is active for the create form
const creating = ref(false);

// --- Inline edit state ---
const editingId = ref<string | null>(null);
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
const editLang = ref<EditLang>('en');

// --- Generation state ---
// The "Generate questions" modal lets admins request N draft questions from
// the LLM. Drafts come back with is_active=false and are appended to the list.
// The button on each generated question can then flip is_active=true to push
// it live, after the admin has reviewed it.
const showGenerator = ref(false);
const generatorCount = ref(5);
const generatorHints = ref('');
const generating = ref(false);
const generatorErrorMsg = ref<string | null>(null);
const generatorSuccessMsg = ref<string | null>(null);
const savingEdit = ref(false);

const isEditingMcq = computed(() => editType.value === 'mcq');

async function load() {
  loading.value = true;
  errorMsg.value = null;
  try {
    const [fetchedLo, fetchedQs] = await Promise.all([
      adminApi.getLo(loId),
      adminApi.listQuestions(loId),
    ]);
    lo.value = fetchedLo;
    questions.value = fetchedQs;
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to load questions';
  } finally {
    loading.value = false;
  }
}

// Convert a string that the user left blank into null so the API knows to clear it.
function blankToNull(s: string): string | null {
  const t = s.trim();
  return t ? t : null;
}

async function onCreate() {
  // EN fields are required. RU optional. correct_answer_en required (option key for MCQ,
  // canonical answer for short_answer, numeric value as string for number_entry).
  if (!newPromptEn.value.trim() || !newCorrectEn.value.trim() || !newExplanationEn.value.trim())
    return;
  creating.value = true;
  errorMsg.value = null;
  try {
    const correctKey = newCorrectEn.value.trim();
    const options =
      newType.value === 'mcq'
        ? newOptions.value
            // Keep only rows that have BOTH a key and at least an English text.
            .filter((o) => o.key.trim() && o.text_en.trim())
            .map((o) => {
              const isCorrect = o.key.trim() === correctKey;
              return {
                key: o.key.trim(),
                text_en: o.text_en.trim(),
                text_ru: blankToNull(o.text_ru ?? ''),
                // Backend scrubs why_wrong on correct option as well, but we
                // also do it client-side so the payload matches storage.
                why_wrong_en: isCorrect ? null : blankToNull(o.why_wrong_en ?? ''),
                why_wrong_ru: isCorrect ? null : blankToNull(o.why_wrong_ru ?? ''),
              };
            })
        : null;

    // Parse optional tolerance for number_entry. Treat empty/whitespace as null
    // (exact match). Invalid input is silently dropped — server-side validation
    // will catch malformed numbers anyway, but UX is cleaner if we filter here.
    const tolRaw = newAcceptableTolerance.value.trim();
    let tolerance: number | null = null;
    if (newType.value === 'number_entry' && tolRaw !== '') {
      const parsed = parseFloat(tolRaw);
      if (Number.isFinite(parsed) && parsed >= 0) tolerance = parsed;
    }

    const created = await adminApi.createQuestion(loId, {
      type: newType.value,
      difficulty: newDifficulty.value,
      prompt_en: newPromptEn.value.trim(),
      prompt_ru: blankToNull(newPromptRu.value),
      options,
      correct_answer_en: newCorrectEn.value.trim(),
      // For MCQ + number_entry the backend forces correct_answer_ru to null.
      // We still send the field for short_answer where it carries the RU canonical answer.
      correct_answer_ru:
        newType.value === 'short_answer' ? blankToNull(newCorrectRu.value) : null,
      explanation_en: newExplanationEn.value.trim(),
      explanation_ru: blankToNull(newExplanationRu.value),
      concept_bite_en: blankToNull(newConceptBiteEn.value),
      concept_bite_ru: blankToNull(newConceptBiteRu.value),
      acceptable_tolerance: tolerance,
    });
    questions.value = [created, ...questions.value];
    // Reset form (keep type/difficulty for fast multi-add).
    newPromptEn.value = '';
    newPromptRu.value = '';
    newCorrectEn.value = '';
    newCorrectRu.value = '';
    newExplanationEn.value = '';
    newExplanationRu.value = '';
    newConceptBiteEn.value = '';
    newConceptBiteRu.value = '';
    newAcceptableTolerance.value = '';
    newOptions.value = [
      { key: 'A', text_en: '', text_ru: '', why_wrong_en: null, why_wrong_ru: null },
      { key: 'B', text_en: '', text_ru: '', why_wrong_en: null, why_wrong_ru: null },
      { key: 'C', text_en: '', text_ru: '', why_wrong_en: null, why_wrong_ru: null },
      { key: 'D', text_en: '', text_ru: '', why_wrong_en: null, why_wrong_ru: null },
    ];
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to create question';
  } finally {
    creating.value = false;
  }
}

function startEdit(q: QuestionRaw) {
  editingId.value = q.id;
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

function cancelEdit() {
  editingId.value = null;
}

async function saveEdit() {
  if (!editingId.value) return;
  if (!editPromptEn.value.trim() || !editCorrectEn.value.trim() || !editExplanationEn.value.trim())
    return;
  savingEdit.value = true;
  errorMsg.value = null;
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

    const updated = await adminApi.updateQuestion(editingId.value, {
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
    editingId.value = null;
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to save question';
  } finally {
    savingEdit.value = false;
  }
}

async function toggleActive(q: QuestionRaw) {
  try {
    const updated = await adminApi.updateQuestion(q.id, { is_active: !q.is_active });
    questions.value = questions.value.map((x) => (x.id === updated.id ? updated : x));
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to toggle active';
  }
}

async function onDelete(q: QuestionRaw) {
  if (!confirm(t('admin.questions.delete_confirm'))) return;
  try {
    await adminApi.deleteQuestion(q.id);
    questions.value = questions.value.filter((x) => x.id !== q.id);
    if (editingId.value === q.id) editingId.value = null;
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to delete';
  }
}

// Run the LLM generator. On success, generated questions are appended to the
// list (they come back with is_active=false so they already have the inactive
// styling). On failure, errors stay in the modal so the admin can adjust hints
// and retry without losing them.
async function onGenerate() {
  if (generating.value) return;
  generating.value = true;
  generatorErrorMsg.value = null;
  generatorSuccessMsg.value = null;
  try {
    const created = await adminApi.generateQuestions(loId, {
      count: generatorCount.value,
      hints: generatorHints.value.trim() || undefined,
    });
    // Prepend so admin sees the new drafts immediately at the top.
    questions.value = [...created, ...questions.value];
    generatorSuccessMsg.value = t('admin.questions.generate_success', { count: created.length });
    // Clear hints but keep count — admins often regenerate with same count.
    generatorHints.value = '';
  } catch (e) {
    generatorErrorMsg.value = extractError(e) ?? 'failed to generate questions';
  } finally {
    generating.value = false;
  }
}

function extractError(e: unknown): string | null {
  if (e instanceof AxiosError) {
    const msg = (e.response?.data as { message?: string | string[] })?.message;
    return Array.isArray(msg) ? msg.join(', ') : msg ?? null;
  }
  return null;
}

onMounted(load);
</script>

<template>
  <div class="container">

    <div class="topbar">
      <div>
        <h1>{{ t('admin.questions.title') }}</h1>
        <p v-if="lo" class="dim text-sm mt-2">{{ lo.code }} · {{ lo.title_en }}</p>
      </div>
      <div class="row" style="gap: 12px;">
        <button type="button" class="btn btn-ghost" @click="showGenerator = true">
          {{ t('admin.questions.generate_btn') }}
        </button>
        <RouterLink v-if="lo" :to="`/admin/papers/${lo.paper_id}/los`" class="btn-link">
          {{ t('admin.questions.back_to_los') }}
        </RouterLink>
      </div>
    </div>

    <!-- Create form -->
    <form class="admin-form" @submit.prevent="onCreate">
      <div class="form-grid-2">
        <div class="field">
          <label class="field-label">{{ t('admin.questions.type') }}</label>
          <select v-model="newType">
            <option value="mcq">{{ t('admin.questions.type_mcq') }}</option>
            <option value="short_answer">{{ t('admin.questions.type_short') }}</option>
            <option value="number_entry">{{ t('admin.questions.type_number') }}</option>
          </select>
        </div>
        <div class="field">
          <label class="field-label">{{ t('admin.questions.difficulty') }}</label>
          <select v-model="newDifficulty">
            <option value="easy">{{ t('admin.questions.difficulty_easy') }}</option>
            <option value="medium">{{ t('admin.questions.difficulty_medium') }}</option>
            <option value="hard">{{ t('admin.questions.difficulty_hard') }}</option>
          </select>
        </div>
      </div>

      <!-- number_entry tolerance — applies regardless of language pane, so it sits
           outside the lang-tab content. Empty = exact match. -->
      <div v-if="newType === 'number_entry'" class="field">
        <label class="field-label">{{ t('admin.questions.tolerance_label') }}</label>
        <input
          v-model="newAcceptableTolerance"
          type="text"
          inputmode="decimal"
          maxlength="20"
          :placeholder="t('admin.questions.tolerance_ph')"
        />
        <p class="input-help">{{ t('admin.questions.tolerance_help') }}</p>
      </div>

      <!-- Language tabs for this question's localized fields -->
      <div class="lang-tabs" role="tablist">
        <button
          type="button"
          role="tab"
          :class="['lang-tab', { active: newLang === 'en' }]"
          @click="newLang = 'en'"
        >{{ t('admin.questions.lang_tab_en') }}</button>
        <button
          type="button"
          role="tab"
          :class="['lang-tab', { active: newLang === 'ru' }]"
          @click="newLang = 'ru'"
        >{{ t('admin.questions.lang_tab_ru') }}</button>
      </div>

      <!-- EN pane -->
      <div v-show="newLang === 'en'">
        <div class="field">
          <label class="field-label">{{ t('admin.questions.concept_bite_en') }}</label>
          <textarea v-model="newConceptBiteEn" rows="2" maxlength="4000"></textarea>
        </div>
        <div class="field">
          <label class="field-label">{{ t('admin.questions.prompt_en') }}</label>
          <textarea v-model="newPromptEn" rows="3" maxlength="4000" required></textarea>
        </div>
        <div v-if="newType === 'mcq'" class="field">
          <label class="field-label">{{ t('admin.questions.options') }}</label>
          <div class="col" style="gap: 12px;">
            <div v-for="(opt, i) in newOptions" :key="i" class="option-editor-block">
              <div class="option-editor-row">
                <input v-model="opt.key" type="text" class="opt-key-input" maxlength="2" placeholder="A" />
                <input
                  v-model="opt.text_en"
                  type="text"
                  class="grow"
                  maxlength="500"
                  :placeholder="t('admin.questions.option_text_en_ph')"
                />
              </div>
              <!-- "Why this is wrong" — hidden for the correct option (will be
                   scrubbed server-side anyway). Useful hint when admins write
                   distractors: 1 short sentence per wrong option. -->
              <div v-if="opt.key.trim() !== newCorrectEn.trim()" class="option-why-wrong">
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
        <div class="field">
          <label class="field-label">
            {{ newType === 'mcq'
              ? t('admin.questions.correct_label_mcq')
              : newType === 'number_entry'
                ? t('admin.questions.correct_label_number')
                : t('admin.questions.correct_label_short_en')
            }}
          </label>
          <input
            v-model="newCorrectEn"
            :type="newType === 'number_entry' ? 'text' : 'text'"
            :inputmode="newType === 'number_entry' ? 'decimal' : undefined"
            maxlength="500"
            required
          />
        </div>
        <div class="field">
          <label class="field-label">{{ t('admin.questions.explanation_en') }}</label>
          <textarea v-model="newExplanationEn" rows="3" maxlength="4000" required></textarea>
        </div>
      </div>

      <!-- RU pane -->
      <div v-show="newLang === 'ru'">
        <div class="field">
          <label class="field-label">{{ t('admin.questions.concept_bite_ru') }}</label>
          <textarea v-model="newConceptBiteRu" rows="2" maxlength="4000"></textarea>
        </div>
        <div class="field">
          <label class="field-label">{{ t('admin.questions.prompt_ru') }}</label>
          <textarea v-model="newPromptRu" rows="3" maxlength="4000"></textarea>
        </div>
        <div v-if="newType === 'mcq'" class="field">
          <label class="field-label">{{ t('admin.questions.options') }}</label>
          <div class="col" style="gap: 12px;">
            <div v-for="(opt, i) in newOptions" :key="i" class="option-editor-block">
              <div class="option-editor-row">
                <input v-model="opt.key" type="text" class="opt-key-input" maxlength="2" disabled />
                <input
                  v-model="opt.text_ru"
                  type="text"
                  class="grow"
                  maxlength="500"
                  :placeholder="t('admin.questions.option_text_ru_ph')"
                />
              </div>
              <div v-if="opt.key.trim() !== newCorrectEn.trim()" class="option-why-wrong">
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
        <!-- MCQ + number_entry correct_answer is language-neutral, so hide the RU input for them. -->
        <div v-if="newType === 'short_answer'" class="field">
          <label class="field-label">{{ t('admin.questions.correct_label_short_ru') }}</label>
          <input v-model="newCorrectRu" type="text" maxlength="500" />
        </div>
        <div class="field">
          <label class="field-label">{{ t('admin.questions.explanation_ru') }}</label>
          <textarea v-model="newExplanationRu" rows="3" maxlength="4000"></textarea>
        </div>
      </div>

      <div class="admin-edit-actions">
        <button type="submit" class="btn btn-primary" :disabled="creating">
          {{ creating ? t('common.adding') : t('admin.questions.add_btn') }}
        </button>
      </div>
    </form>

    <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
    <p v-if="loading" class="dim text-sm">{{ t('common.loading') }}</p>

    <!-- List -->
    <div v-if="!loading">
      <div v-if="questions.length === 0" class="dim text-sm">
        {{ t('admin.questions.empty') }}
      </div>

      <div v-for="q in questions" :key="q.id" :class="['admin-question', { retired: !q.is_active }]">
        <div class="q-head">
          <span>
            {{
              q.type === 'mcq' ? t('admin.questions.type_mcq')
              : q.type === 'number_entry' ? t('admin.questions.type_number')
              : t('admin.questions.type_short')
            }}
          </span>
          <span>·</span>
          <span>{{ q.difficulty }}</span>
          <span v-if="!q.is_active" class="badge badge-retired">{{ t('admin.questions.retired_badge') }}</span>
        </div>

        <div class="q-prompt">{{ q.prompt_en }}</div>
        <div v-if="q.prompt_ru" class="q-prompt-ru dim text-sm">
          <span class="mono text-xs muted">RU</span> {{ q.prompt_ru }}
        </div>

        <ul v-if="q.type === 'mcq' && q.options" class="q-opts">
          <li v-for="opt in q.options" :key="opt.key">
            <div>
              <span class="mono">{{ opt.key }}.</span> {{ opt.text_en }}
              <span v-if="opt.text_ru" class="dim">
                · <span class="mono text-xs muted">RU</span> {{ opt.text_ru }}
              </span>
            </div>
            <!-- Per-option "why this is wrong" — surfaces in lessons after a wrong pick. -->
            <div v-if="opt.why_wrong_en" class="dim text-xs mt-1">
              <span class="muted">{{ t('admin.questions.why_wrong_field') }}:</span>
              {{ opt.why_wrong_en }}
              <span v-if="opt.why_wrong_ru" class="dim">
                · <span class="mono text-xs muted">RU</span> {{ opt.why_wrong_ru }}
              </span>
            </div>
          </li>
        </ul>

        <div class="q-correct">
          {{ t('admin.questions.correct_field') }}: <b>{{ q.correct_answer_en }}</b>
          <span v-if="q.type === 'short_answer' && q.correct_answer_ru" class="dim">
            · <span class="mono text-xs muted">RU</span> {{ q.correct_answer_ru }}
          </span>
          <span
            v-if="q.type === 'number_entry' && q.acceptable_tolerance !== null"
            class="dim"
          >
            · {{ t('admin.questions.tolerance_field') }}: ±{{ q.acceptable_tolerance }}
          </span>
        </div>

        <div v-if="q.concept_bite_en" class="q-expl">
          <span class="muted">{{ t('admin.questions.bite_field') }}:</span> {{ q.concept_bite_en }}
        </div>
        <div v-if="q.concept_bite_ru" class="q-expl">
          <span class="muted">{{ t('admin.questions.bite_field') }} (RU):</span> {{ q.concept_bite_ru }}
        </div>
        <div class="q-expl">
          <span class="muted">{{ t('admin.questions.explanation_field') }}:</span> {{ q.explanation_en }}
        </div>
        <div v-if="q.explanation_ru" class="q-expl">
          <span class="muted">{{ t('admin.questions.explanation_field') }} (RU):</span> {{ q.explanation_ru }}
        </div>

        <div class="q-actions">
          <button v-if="editingId !== q.id" class="btn-link accent" @click="startEdit(q)">
            {{ t('common.edit') }}
          </button>
          <button class="btn-link" @click="toggleActive(q)">
            {{ q.is_active ? t('admin.questions.retire') : t('admin.questions.restore') }}
          </button>
          <button class="btn-link" style="color: var(--danger);" @click="onDelete(q)">
            {{ t('common.delete') }}
          </button>
        </div>

        <!-- Inline edit form -->
        <div v-if="editingId === q.id" class="admin-edit">
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
            <div v-if="isEditingMcq" class="field mt-2">
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
            <div v-if="isEditingMcq" class="field mt-2">
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
            <button class="btn btn-ghost" @click="cancelEdit">{{ t('common.cancel') }}</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Generation modal -->
    <!-- Modal pattern: fixed backdrop + centered card. Closes on backdrop click
         only when not in-flight, to avoid losing an in-progress generation if
         the admin clicks outside by accident. -->
    <div v-if="showGenerator" class="modal-backdrop" @click="!generating && (showGenerator = false)">
      <div class="modal-card" @click.stop>
        <h2>{{ t('admin.questions.generate_modal_title') }}</h2>
        <p class="dim text-sm mt-2">{{ t('admin.questions.generate_info') }}</p>

        <div class="field mt-4">
          <label class="field-label">{{ t('admin.questions.generate_count_label') }}</label>
          <select v-model.number="generatorCount" :disabled="generating">
            <!-- Range mirrors backend MAX_PER_CALL constant. -->
            <option v-for="n in [3, 4, 5, 6, 7, 8, 9, 10]" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>

        <div class="field mt-4">
          <label class="field-label">{{ t('admin.questions.generate_hints_label') }}</label>
          <textarea
            v-model="generatorHints"
            :placeholder="t('admin.questions.generate_hints_ph')"
            rows="4"
            maxlength="2000"
            :disabled="generating"
          ></textarea>
        </div>

        <p v-if="generatorErrorMsg" class="error-text">{{ generatorErrorMsg }}</p>
        <p v-if="generatorSuccessMsg" class="dim text-sm" style="color: var(--success);">
          {{ generatorSuccessMsg }}
        </p>

        <div class="row mt-4" style="gap: 8px; justify-content: flex-end;">
          <button class="btn btn-ghost" :disabled="generating" @click="showGenerator = false">
            {{ t('common.cancel') }}
          </button>
          <button class="btn btn-primary" :disabled="generating" @click="onGenerate">
            {{ generating ? t('admin.questions.generate_running') : t('admin.questions.generate_submit') }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>
