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

  // ---------------- F3 (Financial Accounting) ----------------
  // Section labels follow the official F3 syllabus (2025/26 edition).

  'F3:A':
    'The context and purpose of financial reporting. Types of business entity (sole trader, partnership, ' +
    'limited company); separate legal personality of companies. Users of financial statements and their ' +
    'information needs (investors, lenders, employees, suppliers, customers, government, public). Main ' +
    'financial statements: statement of financial position, statement of profit or loss, statement of ' +
    'changes in equity, statement of cash flows. The regulatory framework: role of IFRS Foundation, IASB, ' +
    'IFRS Advisory Council, IFRS Interpretations Committee. Duties and responsibilities of directors. ' +
    'Governance (in outline) — not deep CG; that\'s F1 territory.',

  'F3:B':
    'Qualitative characteristics of useful financial information (Conceptual Framework). Fundamental: ' +
    'relevance (predictive/confirmatory value, materiality) and faithful representation (complete, ' +
    'neutral, free from error). Enhancing: comparability, verifiability, timeliness, understandability. ' +
    'The cost constraint. Underlying assumption: going concern. Recognition criteria for assets, ' +
    'liabilities, income, expenses. Measurement bases (historical cost, current cost, realisable value, ' +
    'present value, fair value) at a high level. Classification questions matching examples to ' +
    'characteristics are common — e.g. "an estimate that is verifiable but late" → fails timeliness.',

  'F3:C':
    'The use of double-entry and accounting systems. The accounting equation: assets = liabilities + ' +
    'equity. Duality of every transaction; debits and credits rules per element (DEAD CLIC mnemonic: ' +
    'Debit Expenses/Assets/Drawings, Credit Liabilities/Income/Capital). Books of prime entry: sales day ' +
    'book, purchases day book, sales/purchase returns, cash book (often acts as both PoE and ledger), ' +
    'petty cash book, journal. General ledger, sales ledger, purchases ledger; control accounts and the ' +
    'control-account-vs-list-of-balances reconciliation. Discounts: trade (not recorded) vs settlement ' +
    '(cash) discount. VAT/sales tax basics: inputs reclaimable, outputs payable, the equation: ' +
    'net sales × rate = tax. Calculations of tax-inclusive vs tax-exclusive amounts. ' +
    'NUMERIC questions on control account reconciliation and tax calculations are extremely common.',

  'F3:D':
    'Recording transactions and events. Inventory (IAS 2): measurement at lower of cost and NRV; cost ' +
    'formulas (FIFO and weighted average — LIFO not permitted under IFRS). Continuous vs periodic ' +
    'inventory systems. Closing inventory adjustment to COGS: opening + purchases − closing. ' +
    'Tangible non-current assets (IAS 16): initial measurement (cost includes purchase price, ' +
    'directly attributable costs, dismantling); subsequent measurement (cost model vs revaluation ' +
    'model). Depreciation: straight-line, reducing-balance, sum-of-digits; depreciation calculations ' +
    'including part-year. Disposal: profit/loss on disposal = proceeds − carrying amount. Intangibles ' +
    '(IAS 38) basics. Accruals and prepayments: classic adjustments — accrued income/expenses, ' +
    'prepaid income/expenses; year-end calculations VERY common in MCQ and number_entry. Receivables: ' +
    'irrecoverable debt write-off, allowance for receivables (general/specific); movement in allowance ' +
    'goes to P/L. Provisions, contingent liabilities, contingent assets (IAS 37): recognition tests. ' +
    'Capital vs revenue expenditure — classification questions are bread-and-butter.',

  'F3:E':
    'Preparing a trial balance. Listing balances; the rules (debit balances: assets, expenses, ' +
    'drawings; credit balances: liabilities, equity, income). The trial balance does NOT prove ' +
    'correctness; errors that do/don\'t affect it. Types of error: error of principle (wrong account ' +
    'class — e.g. capital expense to revenue), error of commission (right class, wrong account), ' +
    'error of omission, compensating errors, transposition error, error of original entry, reversal ' +
    'of entries. The suspense account: used when trial balance won\'t balance; entries made to clear ' +
    'it once errors found. Bank reconciliations: timing differences (outstanding cheques, deposits in ' +
    'transit) and errors; reconcile bank statement to cash book. Receivables and payables ledger ' +
    'control account reconciliations. NUMERIC questions on suspense-account clearing and bank rec ' +
    'are very common.',

  'F3:F':
    'Preparing basic financial statements for sole traders, partnerships, and companies. Statement ' +
    'of profit or loss: revenue, COGS (opening inventory + purchases − closing inventory), gross ' +
    'profit, operating expenses, finance costs, tax. Statement of financial position: non-current ' +
    'assets, current assets, equity, non-current liabilities, current liabilities. Statement of ' +
    'changes in equity: share capital, share premium, retained earnings, dividends, profit for the ' +
    'year. Statement of cash flows (IAS 7): operating activities (indirect method most common in F3: ' +
    'profit before tax, adjust for non-cash items + working capital changes), investing, financing. ' +
    'Format/heading detail is tested — line items in the right place. Companies: share issues, share ' +
    'premium account, bonus issues vs rights issues, dividends (paid vs proposed; treatment after IAS 10). ' +
    'Events after the reporting period (IAS 10): adjusting vs non-adjusting.',

  'F3:G':
    'Preparing simple consolidated financial statements and interpretation. Group accounts basics: ' +
    'parent and subsidiary, control = >50% voting rights (simplified). Consolidated statement of ' +
    'financial position: 100% of subsidiary assets and liabilities, eliminate parent\'s investment ' +
    'against subsidiary\'s share capital and pre-acquisition retained earnings, recognise goodwill ' +
    '(consideration transferred + non-controlling interest − fair value of net assets at acquisition), ' +
    'show non-controlling interest in equity, post-acquisition retained earnings split between parent ' +
    'and NCI. Intra-group balances (eliminate inter-company receivables/payables), unrealised profit ' +
    'in inventory (eliminate). Associates (significant influence, 20-50%): equity method basics — ' +
    'investment in associate carrying amount, share of profit in P/L. Interpretation of financial ' +
    'statements: profitability ratios (gross margin, net margin, ROCE), liquidity (current ratio, ' +
    'quick ratio), efficiency (inventory days, receivables days, payables days, asset turnover), ' +
    'gearing (debt/equity, interest cover). RATIO CALCULATIONS and ratio-comparison questions are ' +
    'extremely common — favour number_entry and short_answer formats.',
};

// Helper — fetches hints for an LO with safe fallback to empty string.
export function getTopicHints(paper_code: string, lo_code: string): string {
  return TOPIC_HINTS[`${paper_code}:${lo_code}`] ?? '';
}
