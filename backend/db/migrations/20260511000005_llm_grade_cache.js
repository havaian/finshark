// backend/migrations/20260511000005_llm_grade_cache.js
// Cache of LLM grading verdicts. Dedupes identical normalized answers across users
// so the LLM is only called once per (question, distinct-answer) pair.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('llm_grade_cache', {
    id: { type: 'bigserial', primaryKey: true },
    question_id: { type: 'bigint', notNull: true, references: 'questions(id)', onDelete: 'CASCADE' },
    normalized_user_answer: { type: 'text', notNull: true },
    is_correct: { type: 'boolean', notNull: true },
    confidence: { type: 'real' },                       // 0..1, nullable for older verdicts
    reasoning: { type: 'text' },                       // model's human-readable explanation
    provider: { type: 'text', notNull: true },        // 'openai' | 'anthropic' | 'exact_match'
    model: { type: 'text', notNull: true },        // model id used
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });
  pgm.addConstraint('llm_grade_cache', 'llm_grade_cache_question_id_normalized_user_answer_key', {
    unique: ['question_id', 'normalized_user_answer'],
  });
  pgm.createIndex('llm_grade_cache', 'question_id', { name: 'idx_llm_grade_cache_question' });
};

exports.down = (pgm) => {
  pgm.dropTable('llm_grade_cache');
};