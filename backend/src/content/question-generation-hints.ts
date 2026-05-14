// Per-LO topic priority hints for the question generator.
//
// These describe what real ACCA past papers TEND to examine within each LO,
// so the LLM doesn't drift to obscure corners of the syllabus. Distilled from
// the official ACCA syllabus PDFs, examiner reports, and specimen exams.
//
// Each entry is keyed by `${paper_code}:${lo_code}` (e.g. 'F1:A', 'F5:D').
// The generation service looks up the user-selected LO's hints, falls back to
// an empty string if not found, and lets the admin add/override at request time.
//
// Keep entries terse — these are HINTS, not full study notes. The LLM expands
// them. Aim for: a) what frameworks/calculations real exams hit, b) common
// gotchas and distractor patterns, c) the sub-topics within the LO that get
// most exam coverage.

export const TOPIC_HINTS: Record<string, string> = {
  // ---------------- F1 ----------------
  'F1:A':
    'Common exam focus: types of organisation (PLC vs Ltd vs partnership vs cooperative vs NFP vs public sector); ' +
    'internal/connected/external stakeholders with examples; Mendelow matrix quadrants (key players, keep satisfied, ' +
    'keep informed, minimal effort) — placement questions are very frequent. PESTEL factors and which category a ' +
    'given example belongs to (often borderline between Political and Legal, or Social and Environmental). ' +
    "Porter's 5 Forces, Porter's Generic Strategies (cost leadership, differentiation, focus). " +
    'Macro/micro economics basics: types of unemployment (frictional/structural/cyclical), elasticity of demand.',

  'F1:B':
    'Mintzberg five components (strategic apex, middle line, technostructure, support staff, operating core) — ' +
    'identification questions. Mintzberg structural configurations. Tall vs flat structures, span of control. ' +
    'Centralisation vs decentralisation pros/cons. Functional vs matrix vs divisional vs geographic structures. ' +
    "Handy's culture types (power, role, task, person) — matching examples. Schein's three levels. " +
    'Corporate governance: role of board, non-executive directors, audit/remuneration/nomination committees. ' +
    'UK Corporate Governance Code "comply or explain". Separation of CEO and chairman.',

  'F1:C':
    'Internal control objectives and types: preventive, detective, corrective, compensating — classifying examples. ' +
    'Segregation of duties; authorisation; reconciliations; physical controls. The fraud triangle ' +
    '(pressure, opportunity, rationalisation). Internal vs external audit roles, audit committee responsibilities. ' +
    'Risk: gross vs net/residual risk, risk register, TARA framework (transfer, avoid, reduce, accept). ' +
    "Money laundering basics: placement, layering, integration. Data protection / GDPR principles. " +
    'Common scenario: control weakness identification or control override (splitting transactions to evade limits).',

  'F1:D':
    'Maslow hierarchy of needs ordering. Herzberg two-factor (hygiene vs motivators) — classifying examples like ' +
    'salary, recognition, work conditions. McGregor Theory X / Theory Y. Vroom expectancy theory. ' +
    "Tuckman team stages (forming, storming, norming, performing, adjourning) — diagnosing a team's stage. " +
    "Belbin team roles. Blake & Mouton managerial grid (concern for production × concern for people). " +
    'Leadership styles: autocratic, democratic, laissez-faire; transformational vs transactional. ' +
    "Hersey & Blanchard situational leadership. Fayol's principles of management. Recruitment and selection: " +
    'job description vs person specification; interview types; psychometric tests.',

  'F1:E':
    "Honey and Mumford learning styles (activist, reflector, theorist, pragmatist) — matching scenarios. Kolb's " +
    'learning cycle. SMART objectives (with the T = Time-bound trick). Eisenhower urgent/important matrix. ' +
    'Communication: barriers (noise, jargon, distortion); feedback loops; formal vs informal (the grapevine); ' +
    "verbal vs non-verbal; written vs oral channel selection by purpose. Maslow's hierarchy applied to communication. " +
    'Counselling, mentoring, coaching distinctions. Appraisal types (formal/informal, 360-degree). ' +
    'Time management techniques and personal productivity.',

  'F1:F':
    'Five fundamental principles of IESBA/ACCA Code: integrity, objectivity, professional competence and due care, ' +
    'confidentiality, professional behaviour — direct identification questions are very common. ' +
    'Threats to compliance: self-interest, self-review, advocacy, familiarity, intimidation — match examples. ' +
    'Safeguards: created by profession/legislation, created within firm, created within client. ' +
    'Conflicts of interest and how to resolve. Whistleblowing: internal escalation order (line manager → ' +
    'audit committee → professional body → external authority). Confidentiality exceptions (legal duty, ' +
    'authority to disclose, professional duty). Bribery and gifts thresholds.',

  // ---------------- F5 ----------------
  'F5:A':
    'Big Data 3Vs (Volume, Velocity, Variety; extended 4V/5V Veracity/Value). Sources of information ' +
    '(internal/external; primary/secondary). Qualities of good information (ACCURATE mnemonic). ' +
    'ERP, MIS, EIS, decision support systems — what each does. Lean principles; the seven wastes ' +
    "(Taiichi Ohno: overproduction, waiting, transport, processing, inventory, motion, defects). Just-in-time. " +
    'Impact of technology on management accounting: AI, automation, cloud, blockchain. Change management ' +
    "(Lewin's unfreeze-change-refreeze). Information needs at strategic vs tactical vs operational level.",

  'F5:B':
    'Activity-Based Costing: cost drivers, activity pools, comparing ABC vs absorption costing — products with ' +
    'short runs or many setups typically cost MORE under ABC. Target costing: target cost = market price − required ' +
    'margin; cost gap calculation. Lifecycle costing: cost-locked-in at design phase. Throughput accounting: ' +
    'TPAR = (sales − materials) per bottleneck minute / factory cost per bottleneck minute; TPAR > 1 desirable. ' +
    "Theory of constraints, 5 focusing steps. Environmental management accounting. Backflush accounting. " +
    'Calculations are very frequent here — include numerical questions with full workings.',

  'F5:C':
    'Relevant costing rules: future, cash, incremental. Sunk costs IGNORED. Opportunity costs included. ' +
    'CVP analysis: break-even = fixed/contribution per unit; margin of safety; contribution-to-sales ratio; ' +
    'multi-product BEP weighted average. Limiting factor analysis: rank by contribution per unit of limiting ' +
    'resource. Make-or-buy decisions. Shutdown decisions. Pricing: cost-plus, marginal cost, penetration, ' +
    'skimming, price elasticity. Risk and uncertainty: maximax (optimist), maximin (pessimist), minimax regret, ' +
    'expected value. Decision trees. Sensitivity analysis. Common trap: students include sunk costs in answer.',

  'F5:D':
    'Budget types: fixed vs flexible (flexed budget = budget restated for actual activity); incremental, zero-based, ' +
    'rolling/continuous, activity-based. Top-down vs bottom-up; participation. Behavioural aspects: budgetary ' +
    'slack, dysfunctional behaviour. Beyond Budgeting. Standard costing and variance analysis: material price ' +
    'variance = (SP − AP) × AQ; material usage = (SQ − AQ) × SP; labour rate and efficiency; fixed overhead ' +
    'expenditure and volume. Mix and yield variances. Planning vs operational variances (uncontrollable vs ' +
    'controllable). Sales price and sales volume contribution variances. ' +
    'Numerical calculation questions VERY common — favour MCQ with numbers.',

  'F5:E':
    'Financial measures: ROCE, ROI, residual income (RI = profit − cost of capital × capital employed). ' +
    'EVA basics. Pros/cons of ROI (encourages short-termism, can reject NPV-positive projects) vs RI (absolute). ' +
    'Non-financial measures and why they matter (customer satisfaction, employee turnover, defect rates). ' +
    "Balanced Scorecard (Kaplan & Norton): financial, customer, internal process, learning & growth perspectives. " +
    "Building Block Model (Fitzgerald & Moon). Performance Pyramid (Lynch & Cross). Divisional performance: " +
    'cost/revenue/profit/investment centres. Transfer pricing: cost-based, market-based, negotiated, dual-rate; ' +
    'goal congruence issues. Public sector / NFP performance (value-for-money: economy, efficiency, effectiveness).',
};

// Helper — fetches hints for an LO with safe fallback to empty string.
export function getTopicHints(paper_code: string, lo_code: string): string {
  return TOPIC_HINTS[`${paper_code}:${lo_code}`] ?? '';
}
