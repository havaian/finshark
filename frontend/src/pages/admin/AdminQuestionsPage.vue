<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { AxiosError } from 'axios';
import { adminApi } from '../../api/admin.api';
import type {
  LearningObjective,
  McqOption,
  Question,
  QuestionDifficulty,
  QuestionType,
} from '../../types/content';

const route = useRoute();
const loId = route.params.lo_id as string;

const lo = ref<LearningObjective | null>(null);
const questions = ref<Question[]>([]);
const loading = ref(false);
const errorMsg = ref<string | null>(null);

// --- Create-form state ---
const newType = ref<QuestionType>('mcq');
const newDifficulty = ref<QuestionDifficulty>('easy');
const newPrompt = ref('');
const newOptions = ref<McqOption[]>([
  { key: 'A', text: '' },
  { key: 'B', text: '' },
  { key: 'C', text: '' },
  { key: 'D', text: '' },
]);
const newCorrect = ref('');
const newExplanation = ref('');
const newConceptBite = ref('');
const creating = ref(false);

// --- Inline edit state ---
const editingId = ref<string | null>(null);
const editType = ref<QuestionType>('mcq');
const editDifficulty = ref<QuestionDifficulty>('easy');
const editPrompt = ref('');
const editOptions = ref<McqOption[]>([]);
const editCorrect = ref('');
const editExplanation = ref('');
const editConceptBite = ref('');
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

async function onCreate() {
  if (!newPrompt.value.trim() || !newCorrect.value.trim() || !newExplanation.value.trim()) return;
  creating.value = true;
  errorMsg.value = null;
  try {
    const options = newType.value === 'mcq'
      ? newOptions.value.filter((o) => o.key.trim() && o.text.trim())
      : null;
    const created = await adminApi.createQuestion(loId, {
      type: newType.value,
      difficulty: newDifficulty.value,
      prompt: newPrompt.value.trim(),
      options,
      correct_answer: newCorrect.value.trim(),
      explanation: newExplanation.value.trim(),
      concept_bite: newConceptBite.value.trim() || null,
    });
    questions.value = [created, ...questions.value];
    // Reset form
    newPrompt.value = '';
    newCorrect.value = '';
    newExplanation.value = '';
    newConceptBite.value = '';
    newOptions.value = [
      { key: 'A', text: '' },
      { key: 'B', text: '' },
      { key: 'C', text: '' },
      { key: 'D', text: '' },
    ];
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to create question';
  } finally {
    creating.value = false;
  }
}

function startEdit(q: Question) {
  editingId.value = q.id;
  editType.value = q.type;
  editDifficulty.value = q.difficulty;
  editPrompt.value = q.prompt;
  editOptions.value = q.options ? q.options.map((o) => ({ ...o })) : [];
  editCorrect.value = q.correct_answer;
  editExplanation.value = q.explanation;
  editConceptBite.value = q.concept_bite ?? '';
}

function cancelEdit() {
  editingId.value = null;
}

async function saveEdit() {
  if (!editingId.value) return;
  if (!editPrompt.value.trim() || !editCorrect.value.trim() || !editExplanation.value.trim()) return;
  savingEdit.value = true;
  errorMsg.value = null;
  try {
    const options = editType.value === 'mcq'
      ? editOptions.value.filter((o) => o.key.trim() && o.text.trim())
      : null;
    const updated = await adminApi.updateQuestion(editingId.value, {
      type: editType.value,
      difficulty: editDifficulty.value,
      prompt: editPrompt.value.trim(),
      options,
      correct_answer: editCorrect.value.trim(),
      explanation: editExplanation.value.trim(),
      concept_bite: editConceptBite.value.trim() || null,
    });
    questions.value = questions.value.map((q) => (q.id === updated.id ? updated : q));
    editingId.value = null;
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to save question';
  } finally {
    savingEdit.value = false;
  }
}

async function toggleActive(q: Question) {
  try {
    const updated = await adminApi.updateQuestion(q.id, { is_active: !q.is_active });
    questions.value = questions.value.map((x) => (x.id === updated.id ? updated : x));
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to toggle active';
  }
}

async function onDelete(q: Question) {
  if (!confirm('Delete this question? This is irreversible.')) return;
  try {
    await adminApi.deleteQuestion(q.id);
    questions.value = questions.value.filter((x) => x.id !== q.id);
    if (editingId.value === q.id) editingId.value = null;
  } catch (e) {
    errorMsg.value = extractError(e) ?? 'failed to delete';
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
  <main class="page">
    <div class="container">

      <div class="topbar">
        <div>
          <h1>Questions</h1>
          <p v-if="lo" class="dim text-sm mt-2">{{ lo.code }} · {{ lo.title }}</p>
        </div>
        <RouterLink v-if="lo" :to="`/admin/papers/${lo.paper_id}/los`" class="btn-link">← Back to LOs</RouterLink>
      </div>

      <!-- Create form -->
      <form class="admin-form" @submit.prevent="onCreate">
        <div class="form-grid-2">
          <div class="field">
            <label class="field-label">Type</label>
            <select v-model="newType">
              <option value="mcq">MCQ</option>
              <option value="short_answer">Short answer</option>
            </select>
          </div>
          <div class="field">
            <label class="field-label">Difficulty</label>
            <select v-model="newDifficulty">
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>
        </div>

        <div class="field">
          <label class="field-label">Concept bite (optional)</label>
          <textarea v-model="newConceptBite" rows="2" maxlength="1000"></textarea>
        </div>

        <div class="field">
          <label class="field-label">Prompt</label>
          <textarea v-model="newPrompt" rows="3" maxlength="4000" required></textarea>
        </div>

        <div v-if="newType === 'mcq'" class="field">
          <label class="field-label">Options</label>
          <div class="col" style="gap: 8px;">
            <div v-for="(opt, i) in newOptions" :key="i" class="option-editor-row">
              <input v-model="opt.key" type="text" class="opt-key-input" maxlength="2" placeholder="A" />
              <input v-model="opt.text" type="text" class="grow" maxlength="500" placeholder="Option text" />
            </div>
          </div>
        </div>

        <div class="field">
          <label class="field-label">
            {{ newType === 'mcq' ? 'Correct option key (e.g. B)' : 'Correct answer (canonical form)' }}
          </label>
          <input v-model="newCorrect" type="text" maxlength="500" required />
        </div>

        <div class="field">
          <label class="field-label">Explanation</label>
          <textarea v-model="newExplanation" rows="3" maxlength="4000" required></textarea>
        </div>

        <div class="admin-edit-actions">
          <button type="submit" class="btn btn-primary" :disabled="creating">
            {{ creating ? 'Adding…' : 'Add question' }}
          </button>
        </div>
      </form>

      <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
      <p v-if="loading" class="dim text-sm">Loading…</p>

      <!-- List -->
      <div v-if="!loading">
        <div v-if="questions.length === 0" class="dim text-sm">
          No questions yet for this LO. Add one above.
        </div>

        <div v-for="q in questions" :key="q.id" :class="['admin-question', { retired: !q.is_active }]">
          <div class="q-head">
            <span>{{ q.type === 'mcq' ? 'MCQ' : 'SHORT' }}</span>
            <span>·</span>
            <span>{{ q.difficulty }}</span>
            <span v-if="!q.is_active" class="badge badge-retired">retired</span>
          </div>
          <div class="q-prompt">{{ q.prompt }}</div>

          <ul v-if="q.type === 'mcq' && q.options" class="q-opts">
            <li v-for="opt in q.options" :key="opt.key">
              <span class="mono">{{ opt.key }}.</span> {{ opt.text }}
            </li>
          </ul>

          <div class="q-correct">
            Correct: <b>{{ q.correct_answer }}</b>
          </div>

          <div v-if="q.concept_bite" class="q-expl">
            <span class="muted">Bite:</span> {{ q.concept_bite }}
          </div>
          <div class="q-expl">
            <span class="muted">Explanation:</span> {{ q.explanation }}
          </div>

          <div class="q-actions">
            <button v-if="editingId !== q.id" class="btn-link accent" @click="startEdit(q)">Edit</button>
            <button class="btn-link" @click="toggleActive(q)">
              {{ q.is_active ? 'Retire' : 'Restore' }}
            </button>
            <button class="btn-link" style="color: var(--danger);" @click="onDelete(q)">Delete</button>
          </div>

          <!-- Inline edit form -->
          <div v-if="editingId === q.id" class="admin-edit">
            <div class="form-grid-2">
              <div class="field">
                <label class="field-label">Type</label>
                <select v-model="editType">
                  <option value="mcq">MCQ</option>
                  <option value="short_answer">Short answer</option>
                </select>
              </div>
              <div class="field">
                <label class="field-label">Difficulty</label>
                <select v-model="editDifficulty">
                  <option value="easy">Easy</option>
                  <option value="medium">Medium</option>
                  <option value="hard">Hard</option>
                </select>
              </div>
            </div>

            <div class="field mt-2">
              <label class="field-label">Concept bite</label>
              <textarea v-model="editConceptBite" rows="2" maxlength="1000"></textarea>
            </div>

            <div class="field mt-2">
              <label class="field-label">Prompt</label>
              <textarea v-model="editPrompt" rows="3" maxlength="4000" required></textarea>
            </div>

            <div v-if="isEditingMcq" class="field mt-2">
              <label class="field-label">Options</label>
              <div class="col" style="gap: 8px;">
                <div v-for="(opt, i) in editOptions" :key="i" class="option-editor-row">
                  <input v-model="opt.key" type="text" class="opt-key-input" maxlength="2" />
                  <input v-model="opt.text" type="text" class="grow" maxlength="500" />
                </div>
              </div>
            </div>

            <div class="field mt-2">
              <label class="field-label">Correct answer</label>
              <input v-model="editCorrect" type="text" maxlength="500" required />
            </div>

            <div class="field mt-2">
              <label class="field-label">Explanation</label>
              <textarea v-model="editExplanation" rows="3" maxlength="4000" required></textarea>
            </div>

            <div class="admin-edit-actions">
              <button class="btn btn-primary" :disabled="savingEdit" @click="saveEdit">
                {{ savingEdit ? 'Saving…' : 'Save changes' }}
              </button>
              <button class="btn btn-ghost" @click="cancelEdit">Cancel</button>
            </div>
          </div>
        </div>
      </div>

    </div>
  </main>
</template>