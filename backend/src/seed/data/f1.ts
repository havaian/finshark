// Seed content for the F1 (Business and Technology) paper.
// Structure mirrors the official ACCA 2025-26 syllabus sections A-F.
// Question content is original, written to mimic the style of ACCA past papers
// without reproducing any copyrighted material verbatim.

import type { SeedPaper } from "./types";

export const F1_PAPER: SeedPaper = {
  code: "F1",
  name_en: "Business and Technology",
  name_ru: "Бизнес и технологии",
  learning_objectives: [
    // ---------- A ----------
    {
      code: "A",
      title_en: "The business organisation and its external environment",
      title_ru: "Организация и её внешняя среда",
      description_en: "Types of business, stakeholders, and PESTEL influences.",
      description_ru:
        "Типы организаций, заинтересованные стороны и факторы PESTEL.",
      sort_order: 10,
      theory_en:
        'An organisation is a social arrangement that pursues collective goals through controlled performance — meaning it has objectives, people working together, and systems to keep effort aligned. F1 classifies organisations along two axes. First, by purpose: commercial (profit-seeking), not-for-profit (mission-driven, e.g. charities), and public sector (state-controlled, funded by tax). Second, by legal form: sole trader (one owner, unlimited liability), partnership (shared ownership, traditionally unlimited liability), limited company (separate legal personality, liability capped at share value — split into private "Ltd" and public "PLC"), and cooperative (member-owned, one-member-one-vote regardless of capital).\n\n' +
        'Every organisation operates inside a network of stakeholders — parties with an interest in what it does. Internal stakeholders are employees and managers; connected stakeholders are shareholders, customers, suppliers, lenders; external stakeholders are government, regulators, communities, pressure groups. Mendelow\'s matrix maps each stakeholder by power (ability to affect the organisation) and interest (degree to which they care): high-power-high-interest = "Key Players" (manage closely), high-power-low-interest = "Keep Satisfied", low-power-high-interest = "Keep Informed", low-power-low-interest = "Minimal Effort".\n\n' +
        "The external environment is analysed using PESTEL (Political, Economic, Social, Technological, Environmental, Legal) for macro factors, and Porter's Five Forces (rivalry, new entrants, substitutes, supplier power, buyer power) for industry competitive intensity. Porter's generic strategies — cost leadership, differentiation, focus — describe how a firm chooses to compete within that landscape.\n\n" +
        "Underlying all of this is the wider economy. Macroeconomic context matters: types of unemployment (frictional — between jobs; structural — skills mismatch; cyclical — driven by downturn) shape labour markets, while price elasticity of demand determines how sensitive revenue is to price changes. Inflation, interest rates, and exchange rates feed through to cost and demand directly.",
      theory_ru:
        'Организация — это социальное образование, преследующее коллективные цели через управляемую деятельность: то есть имеющее цели, людей, работающих вместе, и системы, удерживающие усилия в общем русле. В F1 организации классифицируются по двум осям. Во-первых, по цели: коммерческие (ориентированные на прибыль), некоммерческие (миссионные, например благотворительные), и государственный сектор (под контролем государства, финансируемый из налогов). Во-вторых, по организационно-правовой форме: индивидуальный предприниматель (один владелец, неограниченная ответственность), товарищество (совместное владение, традиционно с неограниченной ответственностью), компания с ограниченной ответственностью (отдельное юридическое лицо, ответственность ограничена стоимостью акций — делится на частную "Ltd" и публичную "PLC"), и кооператив (принадлежит участникам по принципу «один член — один голос» независимо от вклада).\n\n' +
        "Любая организация действует в сети заинтересованных сторон — лиц, имеющих интерес к её деятельности. Внутренние стороны — сотрудники и менеджеры; связанные — акционеры, клиенты, поставщики, кредиторы; внешние — государство, регуляторы, местные сообщества, группы давления. Матрица Мендлоу располагает каждую сторону по власти (способности влиять на организацию) и интересу (степени заинтересованности): высокая власть и высокий интерес — «ключевые игроки» (управлять плотно); высокая власть, низкий интерес — «удовлетворять»; низкая власть, высокий интерес — «информировать»; низкая власть, низкий интерес — «минимум усилий».\n\n" +
        "Внешняя среда анализируется через PESTEL (политические, экономические, социальные, технологические, экологические, правовые факторы) на макроуровне и через пять сил Портера (соперничество, новые игроки, заменители, сила поставщиков, сила покупателей) — для оценки конкурентной интенсивности отрасли. Базовые стратегии Портера — лидерство по издержкам, дифференциация, фокусирование — описывают, как компания выбирает способ конкурировать внутри этой среды.\n\n" +
        "В основе всего этого лежит общая экономика. Макроэкономический контекст важен: виды безработицы (фрикционная — между работами; структурная — несоответствие квалификации; циклическая — вызванная спадом) формируют рынок труда, а ценовая эластичность спроса определяет, насколько выручка чувствительна к изменению цены. Инфляция, процентные ставки и валютные курсы напрямую влияют на издержки и спрос.",
      questions: [
        // -------- existing Q1 (augmented with why_wrong) --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "Which type of organisation is primarily owned by its members rather than external shareholders?",
          prompt_ru:
            "Какой тип организации в первую очередь принадлежит своим членам, а не внешним акционерам?",
          options: [
            {
              key: "A",
              text_en: "Public limited company",
              text_ru: "Публичная компания с ограниченной ответственностью",
              why_wrong_en:
                "A PLC is owned by external shareholders who buy shares on a public market, not by members serving in operational roles.",
              why_wrong_ru:
                "PLC принадлежит внешним акционерам, покупающим акции на публичном рынке, а не членам, участвующим в её деятельности.",
            },
            { key: "B", text_en: "Cooperative", text_ru: "Кооператив" },
            {
              key: "C",
              text_en: "Sole trader",
              text_ru: "Индивидуальный предприниматель",
              why_wrong_en:
                "A sole trader is owned by one individual, not by a group of members.",
              why_wrong_ru:
                "Индивидуальный предприниматель — это один владелец, а не группа членов.",
            },
            {
              key: "D",
              text_en: "Government department",
              text_ru: "Государственное ведомство",
              why_wrong_en:
                "A government department is part of the public sector and is controlled by the state, not by its members.",
              why_wrong_ru:
                "Государственное ведомство относится к государственному сектору и контролируется государством, а не своими членами.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "A cooperative is owned and democratically controlled by its members, who are typically the customers, employees or producers it serves.",
          explanation_ru:
            "Кооператив принадлежит и демократически управляется своими членами — обычно клиентами, работниками или производителями, которых он обслуживает.",
          concept_bite_en:
            "Stakeholder vs shareholder ownership models differ in who controls the entity and who benefits from its surplus.",
          concept_bite_ru:
            "Модели владения «заинтересованные стороны» и «акционеры» отличаются тем, кто контролирует организацию и кто получает прибыль.",
        },
        // -------- existing Q2 (augmented with why_wrong) --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "In Mendelow\u2019s matrix, a stakeholder with HIGH interest but LOW power should be:",
          prompt_ru:
            "В матрице Мендлоу заинтересованная сторона с ВЫСОКИМ интересом, но НИЗКОЙ властью должна:",
          options: [
            {
              key: "A",
              text_en: "Managed closely as a key player",
              text_ru: "Управляться как ключевая фигура",
              why_wrong_en:
                '"Key players" are HIGH-power-HIGH-interest stakeholders, not low-power ones.',
              why_wrong_ru:
                "«Ключевые игроки» — это стороны с ВЫСОКОЙ властью и ВЫСОКИМ интересом, а не с низкой властью.",
            },
            { key: "B", text_en: "Kept informed", text_ru: "Информироваться" },
            {
              key: "C",
              text_en: "Kept satisfied",
              text_ru: "Удовлетворяться",
              why_wrong_en:
                '"Keep satisfied" applies to HIGH-power-LOW-interest stakeholders — the power dimensions are reversed here.',
              why_wrong_ru:
                "«Удовлетворять» применяется к сторонам с ВЫСОКОЙ властью и НИЗКИМ интересом — измерения власти здесь перепутаны.",
            },
            {
              key: "D",
              text_en: "Monitored with minimal effort",
              text_ru: "Отслеживаться с минимальными усилиями",
              why_wrong_en:
                '"Minimal effort" is for LOW-power-LOW-interest stakeholders; this stakeholder has HIGH interest.',
              why_wrong_ru:
                "«Минимум усилий» — для сторон с НИЗКОЙ властью и НИЗКИМ интересом; у данной стороны интерес ВЫСОКИЙ.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            'High interest, low power stakeholders are "Keep Informed" — they care about decisions but cannot directly affect them, so communication is the right response.',
          explanation_ru:
            "Стороны с высоким интересом и низкой властью попадают в категорию «Информировать»: им важны решения, но они не могут на них прямо повлиять, поэтому правильная реакция — коммуникация.",
        },
        // -------- existing Q3 (unchanged — short_answer) --------
                {
          type: "mcq",
          difficulty: "easy",
          prompt_en: "In the PESTEL framework for analysing the external environment, what does the letter \"P\" stand for?",
          prompt_ru: "Что обозначает буква \"P\" в модели PESTEL для анализа внешней среды?",
          options: [
            {
              key: "A",
              text_en: "Political",
              text_ru: "Политические",
            },
            {
              key: "B",
              text_en: "Physical",
              text_ru: "Физические",
              why_wrong_en: "PESTEL has no \"Physical\" factor; the closest environmental dimension is the \"E\" for Environmental, not Physical.",
              why_wrong_ru: "В PESTEL нет фактора «физические»; ближайшее измерение — «E» (экологические), а не физические.",
            },
            {
              key: "C",
              text_en: "Personal",
              text_ru: "Личные",
              why_wrong_en: "PESTEL analyses macro-environmental forces, not personal or individual factors.",
              why_wrong_ru: "PESTEL анализирует макросреду, а не личные или индивидуальные факторы.",
            },
            {
              key: "D",
              text_en: "Productivity",
              text_ru: "Производительность",
              why_wrong_en: "Productivity is an internal operational measure, not one of the six external PESTEL factors.",
              why_wrong_ru: "Производительность — внутренний операционный показатель, а не один из шести внешних факторов PESTEL.",
            },
          ],
          correct_answer_en: "A",
          explanation_en: "PESTEL stands for Political, Economic, Social, Technological, Environmental and Legal factors of the external environment. The \"P\" is Political — government policy, political stability, tax and trade regulation.",
          explanation_ru: "PESTEL расшифровывается как политические, экономические, социальные, технологические, экологические и правовые факторы внешней среды. «P» — это политические: государственная политика, политическая стабильность, налоговое и торговое регулирование.",
        },
        // -------- existing Q4 (augmented with why_wrong) --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "Porter\u2019s Five Forces model is most useful for analysing:",
          prompt_ru: "Модель пяти сил Портера наиболее полезна для анализа:",
          options: [
            {
              key: "A",
              text_en: "Internal staff motivation",
              text_ru: "Внутренней мотивации сотрудников",
              why_wrong_en:
                "Staff motivation is an internal HR concern; Porter's Five Forces is an external industry-analysis tool.",
              why_wrong_ru:
                "Мотивация персонала — внутренний вопрос HR; пять сил Портера — внешний инструмент анализа отрасли.",
            },
            {
              key: "B",
              text_en: "Industry competitive intensity and profitability",
              text_ru: "Конкурентной интенсивности и прибыльности отрасли",
            },
            {
              key: "C",
              text_en: "Personal communication styles",
              text_ru: "Стилей личной коммуникации",
              why_wrong_en:
                "Communication styles are a behavioural topic, unrelated to industry-level competitive analysis.",
              why_wrong_ru:
                "Стили коммуникации относятся к поведенческой тематике и не связаны с анализом отрасли.",
            },
            {
              key: "D",
              text_en: "Accounting policy choices",
              text_ru: "Выбора учётной политики",
              why_wrong_en:
                "Accounting policies are governed by financial reporting standards, not by Porter's industry framework.",
              why_wrong_ru:
                "Учётная политика регулируется стандартами финансовой отчётности, а не отраслевой моделью Портера.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Porter\u2019s Five Forces — supplier power, buyer power, threat of new entrants, threat of substitutes, and competitive rivalry — assess how attractive (profitable) an industry is.",
          explanation_ru:
            "Пять сил Портера (сила поставщиков, покупателей, угроза новых игроков, угроза заменителей и конкурентное соперничество) оценивают привлекательность (прибыльность) отрасли.",
        },
        // -------- existing Q5 (augmented with why_wrong) --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            "A government raises corporation tax. In which PESTEL category is this change BEST classified?",
          prompt_ru:
            "Государство повышает налог на прибыль организаций. К какой категории PESTEL ЛУЧШЕ всего отнести это изменение?",
          options: [
            {
              key: "A",
              text_en: "Political only",
              text_ru: "Только политические",
              why_wrong_en:
                "A tax change is also enshrined in legislation, so it has a Legal dimension as well as Political.",
              why_wrong_ru:
                "Налоговое изменение также закрепляется в законодательстве, поэтому имеет правовой аспект, а не только политический.",
            },
            {
              key: "B",
              text_en: "Economic only",
              text_ru: "Только экономические",
              why_wrong_en:
                "While the change affects the economy, in PESTEL classification the policy origin (Political) and legislative form (Legal) take precedence.",
              why_wrong_ru:
                "Хотя изменение влияет на экономику, в классификации PESTEL преобладают политическое происхождение и правовая форма.",
            },
            {
              key: "C",
              text_en: "Political and Legal",
              text_ru: "Политические и правовые",
            },
            {
              key: "D",
              text_en: "Social and Economic",
              text_ru: "Социальные и экономические",
              why_wrong_en:
                "A corporation tax change is not socially defined — it is a government policy decision enacted into law.",
              why_wrong_ru:
                "Налоговое изменение не имеет социальной природы — это решение правительства, закреплённое в законе.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "A corporation tax change is enacted in law (Legal) and reflects a government policy decision (Political). The PESTEL categories overlap, and tax changes typically span both.",
          explanation_ru:
            "Изменение налога на прибыль закрепляется законом (правовой аспект) и отражает решение правительства (политический аспект). Категории PESTEL пересекаются, и налоговые изменения обычно затрагивают обе.",
        },
        // -------- NEW Q6 — easy MCQ on legal form --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "A key advantage of a limited company over a sole trader is:",
          prompt_ru:
            "Ключевое преимущество компании с ограниченной ответственностью по сравнению с ИП:",
          options: [
            {
              key: "A",
              text_en: "Simpler administration and lower set-up cost",
              text_ru:
                "Более простое администрирование и меньшая стоимость создания",
              why_wrong_en:
                "A limited company has MORE administrative obligations — incorporation, annual filings, statutory accounts.",
              why_wrong_ru:
                "У компании БОЛЬШЕ административных обязанностей — регистрация, годовая отчётность, обязательные финансовые отчёты.",
            },
            {
              key: "B",
              text_en: "Limited liability for the owners",
              text_ru: "Ограниченная ответственность владельцев",
            },
            {
              key: "C",
              text_en: "Profits are tax-free",
              text_ru: "Прибыль не облагается налогом",
              why_wrong_en:
                "Company profits are subject to corporation tax — limited liability does not affect tax status.",
              why_wrong_ru:
                "Прибыль компании облагается налогом на прибыль; ограниченная ответственность не влияет на налоговый статус.",
            },
            {
              key: "D",
              text_en: "The company cannot sue or be sued",
              text_ru:
                "Компания не может подавать в суд или быть привлечённой к суду",
              why_wrong_en:
                "The opposite is true — a company has separate legal personality and CAN sue and be sued in its own name.",
              why_wrong_ru:
                "Верно обратное — компания имеет отдельную правосубъектность и МОЖЕТ участвовать в судебных процессах от своего имени.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Shareholder liability is capped at the unpaid value of their shares; personal assets are protected if the company fails. This is the defining benefit of incorporation.",
          explanation_ru:
            "Ответственность акционеров ограничена неоплаченной стоимостью их акций; личное имущество защищено в случае банкротства компании. Это главное преимущество регистрации компании.",
        },
        // -------- NEW Q7 — easy MCQ on stakeholder classification --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "Suppliers of a company are BEST classified as which type of stakeholder?",
          prompt_ru:
            "Поставщиков компании ЛУЧШЕ всего отнести к какому типу заинтересованных сторон?",
          options: [
            {
              key: "A",
              text_en: "Internal",
              text_ru: "Внутренние",
              why_wrong_en:
                "Internal stakeholders are employees and managers — people who work inside the organisation.",
              why_wrong_ru:
                "Внутренние стороны — это сотрудники и менеджеры, работающие внутри организации.",
            },
            { key: "B", text_en: "Connected", text_ru: "Связанные" },
            {
              key: "C",
              text_en: "External",
              text_ru: "Внешние",
              why_wrong_en:
                "External stakeholders (government, regulators, communities) have no contractual relationship; suppliers do.",
              why_wrong_ru:
                "Внешние стороны (государство, регуляторы, сообщества) не имеют договорных отношений; у поставщиков они есть.",
            },
            {
              key: "D",
              text_en: "Strategic",
              text_ru: "Стратегические",
              why_wrong_en:
                '"Strategic" is not a standard stakeholder classification — the standard three are internal, connected, and external.',
              why_wrong_ru:
                "«Стратегические» — не стандартная классификация заинтересованных сторон; стандартные три — внутренние, связанные, внешние.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Connected stakeholders have a contractual or commercial relationship with the organisation but are not part of it. This category includes shareholders, lenders, customers, and suppliers.",
          explanation_ru:
            "Связанные стороны имеют с организацией договорные или коммерческие отношения, но не входят в неё. К этой категории относятся акционеры, кредиторы, клиенты и поставщики.",
        },
        // -------- NEW Q8 — easy short_answer on Porter's generic strategies --------
                {
          type: "mcq",
          difficulty: "easy",
          prompt_en: "Which of the following is one of Porter's three generic competitive strategies?",
          prompt_ru: "Какая из перечисленных стратегий относится к трём базовым конкурентным стратегиям Портера?",
          options: [
            {
              key: "A",
              text_en: "Cost leadership",
              text_ru: "Лидерство по издержкам",
            },
            {
              key: "B",
              text_en: "Market penetration",
              text_ru: "Проникновение на рынок",
              why_wrong_en: "Market penetration is one of Ansoff's growth strategies, not one of Porter's generic competitive strategies.",
              why_wrong_ru: "Проникновение на рынок — стратегия роста по Ансоффу, а не базовая конкурентная стратегия Портера.",
            },
            {
              key: "C",
              text_en: "Diversification",
              text_ru: "Диверсификация",
              why_wrong_en: "Diversification is an Ansoff growth direction, not a Porter generic strategy.",
              why_wrong_ru: "Диверсификация — направление роста по Ансоффу, а не базовая стратегия Портера.",
            },
            {
              key: "D",
              text_en: "Vertical integration",
              text_ru: "Вертикальная интеграция",
              why_wrong_en: "Vertical integration is a structural expansion choice, not one of Porter's three generic positions (cost leadership, differentiation, focus).",
              why_wrong_ru: "Вертикальная интеграция — структурный выбор расширения, а не одна из трёх базовых позиций Портера (издержки, дифференциация, фокус).",
            },
          ],
          correct_answer_en: "A",
          explanation_en: "Porter argued a firm should choose one of three positions: cost leadership (compete on lowest cost), differentiation (compete on uniqueness), or focus (serve a narrow segment well). Trying to do all three risks being \"stuck in the middle\".",
          explanation_ru: "Портер утверждал, что фирма должна выбрать одну из трёх позиций: лидерство по издержкам (конкуренция по самой низкой цене), дифференциация (конкуренция по уникальности) или фокусирование (качественное обслуживание узкого сегмента). Попытка совместить все три грозит положением «застрявшего посередине».",
        },
        // -------- NEW Q9 — medium MCQ on NFP objectives --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "The primary objective of a not-for-profit organisation is BEST described as:",
          prompt_ru:
            "Основная цель некоммерческой организации ЛУЧШЕ всего описывается как:",
          options: [
            {
              key: "A",
              text_en: "Maximising profit for distribution to members",
              text_ru: "Максимизация прибыли для распределения между членами",
              why_wrong_en:
                "NFPs do not distribute profits — any surplus is reinvested in the mission.",
              why_wrong_ru:
                "НКО не распределяют прибыль — излишек реинвестируется в основную миссию.",
            },
            {
              key: "B",
              text_en:
                "Achieving its mission while operating within available resources",
              text_ru: "Достижение своей миссии в рамках доступных ресурсов",
            },
            {
              key: "C",
              text_en: "Increasing market share",
              text_ru: "Увеличение доли рынка",
              why_wrong_en:
                "Market share is a commercial metric; NFPs are mission-driven and typically don't operate in competitive product markets.",
              why_wrong_ru:
                "Доля рынка — коммерческий показатель; НКО ориентированы на миссию и обычно не действуют на конкурентных товарных рынках.",
            },
            {
              key: "D",
              text_en: "Paying dividends to donors",
              text_ru: "Выплата дивидендов донорам",
              why_wrong_en:
                "Donors give voluntarily without expectation of financial return; dividends are paid to shareholders of commercial entities.",
              why_wrong_ru:
                "Доноры передают средства добровольно, не ожидая финансовой отдачи; дивиденды выплачиваются акционерам коммерческих организаций.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "A not-for-profit organisation exists to advance its mission (e.g. relieving poverty, advancing education). Financial sustainability matters, but as a constraint, not the goal — surplus is reinvested rather than distributed.",
          explanation_ru:
            "Некоммерческая организация существует для продвижения своей миссии (например, борьбы с бедностью, развития образования). Финансовая устойчивость важна, но как ограничение, а не цель — излишек реинвестируется, а не распределяется.",
          concept_bite_en:
            "Mission-driven and profit-driven organisations measure success differently.",
          concept_bite_ru:
            "Миссионные и прибыльные организации измеряют успех по-разному.",
        },
        // -------- NEW Q10 — medium MCQ on Porter's Five Forces classification --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A patent expiry allows generic manufacturers to enter the market. Which of Porter\u2019s Five Forces does this MOST directly increase?",
          prompt_ru:
            "Истечение срока патента позволяет производителям дженериков выйти на рынок. Какую из пяти сил Портера это НАИБОЛЕЕ напрямую усиливает?",
          options: [
            {
              key: "A",
              text_en: "Threat of new entrants",
              text_ru: "Угроза новых игроков",
            },
            {
              key: "B",
              text_en: "Bargaining power of suppliers",
              text_ru: "Сила поставщиков",
              why_wrong_en:
                "Patent expiry doesn't change the bargaining position of suppliers — it changes who can sell the product.",
              why_wrong_ru:
                "Истечение патента не меняет переговорные позиции поставщиков — оно меняет, кто может продавать продукт.",
            },
            {
              key: "C",
              text_en: "Bargaining power of buyers",
              text_ru: "Сила покупателей",
              why_wrong_en:
                "Buyers may benefit indirectly through lower prices, but the direct change is the removal of a barrier to entry.",
              why_wrong_ru:
                "Покупатели могут косвенно выиграть от снижения цен, но прямое изменение — устранение барьера входа.",
            },
            {
              key: "D",
              text_en: "Threat of substitutes",
              text_ru: "Угроза заменителей",
              why_wrong_en:
                "Generics are not substitutes — they are identical chemical products entering the same market. Substitutes are different product categories serving the same need.",
              why_wrong_ru:
                "Дженерики — не заменители, а идентичные химические продукты, выходящие на тот же рынок. Заменители — это иные продуктовые категории, удовлетворяющие ту же потребность.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "A patent is a major barrier to entry. When it expires, generic firms can enter the market with identical products at lower cost, sharply increasing the threat of new entrants force.",
          explanation_ru:
            "Патент — серьёзный барьер входа. После его истечения производители дженериков могут выйти на рынок с идентичными продуктами по более низкой цене, резко усиливая угрозу новых игроков.",
        },
        // -------- NEW Q11 — medium MCQ on unemployment type --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A factory closes because automation has eliminated the need for assembly-line workers. The resulting unemployment is BEST classified as:",
          prompt_ru:
            "Завод закрывается, потому что автоматизация устранила потребность в работниках конвейера. Возникшую безработицу ЛУЧШЕ всего классифицировать как:",
          options: [
            {
              key: "A",
              text_en: "Frictional",
              text_ru: "Фрикционная",
              why_wrong_en:
                "Frictional unemployment is short-term, occurring as people move between jobs; this is a permanent skills mismatch.",
              why_wrong_ru:
                "Фрикционная безработица краткосрочна и возникает при переходе между работами; здесь речь о постоянном несоответствии квалификации.",
            },
            {
              key: "B",
              text_en: "Cyclical",
              text_ru: "Циклическая",
              why_wrong_en:
                "Cyclical unemployment is caused by recession and falling aggregate demand, not by structural changes in technology.",
              why_wrong_ru:
                "Циклическая безработица вызвана рецессией и падением совокупного спроса, а не структурными технологическими изменениями.",
            },
            { key: "C", text_en: "Structural", text_ru: "Структурная" },
            {
              key: "D",
              text_en: "Seasonal",
              text_ru: "Сезонная",
              why_wrong_en:
                "Seasonal unemployment follows predictable seasonal patterns (tourism, agriculture); this is technology-driven displacement.",
              why_wrong_ru:
                "Сезонная безработица следует предсказуемым сезонным циклам (туризм, сельское хозяйство); здесь — вытеснение технологиями.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "Structural unemployment occurs when there is a permanent mismatch between worker skills and available jobs — often due to technological change or shifts in the structure of the economy. Retraining is the typical policy response.",
          explanation_ru:
            "Структурная безработица возникает при устойчивом несоответствии между навыками работников и доступными рабочими местами — часто из-за технологических изменений или сдвигов в структуре экономики. Типичный ответ — переподготовка кадров.",
        },
        // -------- NEW Q12 — medium MCQ on Mendelow scenario --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A retail company\u2019s largest institutional shareholder has indicated it will vote against the next dividend proposal. Under Mendelow\u2019s matrix, this shareholder should be:",
          prompt_ru:
            "Крупнейший институциональный акционер розничной компании заявил, что проголосует против следующего предложения о дивидендах. По матрице Мендлоу этого акционера следует:",
          options: [
            {
              key: "A",
              text_en: "Managed closely as a key player",
              text_ru: "Управлять плотно как ключевую фигуру",
            },
            {
              key: "B",
              text_en: "Kept informed only",
              text_ru: "Только информировать",
              why_wrong_en:
                '"Keep informed" applies to stakeholders with LOW power; an institutional shareholder voting against the board has HIGH power.',
              why_wrong_ru:
                "«Информировать» применяется к сторонам с НИЗКОЙ властью; институциональный акционер, голосующий против совета, имеет ВЫСОКУЮ власть.",
            },
            {
              key: "C",
              text_en: "Kept satisfied with minimal engagement",
              text_ru: "Удовлетворять с минимальным вовлечением",
              why_wrong_en:
                '"Keep satisfied" applies to high-power but LOW-interest stakeholders; this shareholder is actively engaged.',
              why_wrong_ru:
                "«Удовлетворять» применяется к сторонам с высокой властью, но НИЗКИМ интересом; этот акционер активно вовлечён.",
            },
            {
              key: "D",
              text_en: "Monitored with minimal effort",
              text_ru: "Отслеживать с минимальными усилиями",
              why_wrong_en:
                '"Minimal effort" applies to low-power-low-interest stakeholders; this shareholder demonstrates both.',
              why_wrong_ru:
                "«Минимум усилий» — для сторон с низкой властью и низким интересом; данный акционер демонстрирует обратное.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            'A large institutional shareholder has high power (votes can swing decisions) AND is showing high interest (actively engaging on the dividend issue). High-power-high-interest stakeholders are "Key Players" requiring close management — typically direct dialogue with the board.',
          explanation_ru:
            "Крупный институциональный акционер обладает высокой властью (его голоса могут решать) И демонстрирует высокий интерес (активно вовлечён в вопрос о дивидендах). Стороны с высокой властью и высоким интересом — «ключевые игроки», требующие плотного управления, обычно через прямой диалог с советом.",
        },
        // -------- NEW Q13 — medium short_answer on elasticity --------
                {
          type: "mcq",
          difficulty: "medium",
          prompt_en: "What term describes the responsiveness of quantity demanded to a change in price?",
          prompt_ru: "Какой термин описывает реакцию величины спроса на изменение цены?",
          options: [
            {
              key: "A",
              text_en: "Price elasticity of demand",
              text_ru: "Ценовая эластичность спроса",
            },
            {
              key: "B",
              text_en: "Income elasticity of demand",
              text_ru: "Эластичность спроса по доходу",
              why_wrong_en: "Income elasticity measures responsiveness of demand to a change in consumer INCOME, not price.",
              why_wrong_ru: "Эластичность по доходу измеряет реакцию спроса на изменение ДОХОДА, а не цены.",
            },
            {
              key: "C",
              text_en: "Cross elasticity of demand",
              text_ru: "Перекрёстная эластичность спроса",
              why_wrong_en: "Cross elasticity measures how demand for one good responds to a price change in ANOTHER good.",
              why_wrong_ru: "Перекрёстная эластичность измеряет реакцию спроса на один товар при изменении цены ДРУГОГО.",
            },
            {
              key: "D",
              text_en: "Marginal propensity to consume",
              text_ru: "Предельная склонность к потреблению",
              why_wrong_en: "This is a macroeconomic term for the share of extra income that is spent, unrelated to price responsiveness.",
              why_wrong_ru: "Это макроэкономический термин — доля дополнительного дохода, которая тратится; к ценовой чувствительности не относится.",
            },
          ],
          correct_answer_en: "A",
          explanation_en: "Price elasticity of demand (PED) = % change in quantity demanded / % change in price. Demand is elastic (PED > 1) when revenue rises as price falls, and inelastic (PED < 1) when revenue falls as price falls.",
          explanation_ru: "Ценовая эластичность спроса (PED) = % изменения величины спроса / % изменения цены. Спрос эластичен (PED > 1), когда при снижении цены выручка растёт, и неэластичен (PED < 1), когда при снижении цены выручка падает.",
        },
        // -------- NEW Q14 — hard MCQ on Porter's generic strategy trap --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            "A mid-market clothing retailer attempts to compete on BOTH lowest prices AND highest quality across its entire product range. According to Porter, the MOST LIKELY outcome is:",
          prompt_ru:
            "Розничная сеть одежды среднего сегмента пытается конкурировать ОДНОВРЕМЕННО по самым низким ценам И по самому высокому качеству по всему ассортименту. По Портеру, НАИБОЛЕЕ ВЕРОЯТНЫЙ результат:",
          options: [
            {
              key: "A",
              text_en:
                "It achieves dominant market position through dual advantage",
              text_ru:
                "Достижение доминирующего положения за счёт двойного преимущества",
              why_wrong_en:
                "Porter's framework explicitly warns against this; firms trying to do both typically achieve neither.",
              why_wrong_ru:
                "Модель Портера прямо предупреждает против такого подхода: компании, пытающиеся совместить обе стратегии, обычно не достигают ни одной.",
            },
            {
              key: "B",
              text_en: 'It becomes "stuck in the middle" with weak positioning',
              text_ru: "Оно «застревает посередине» со слабой позицией",
            },
            {
              key: "C",
              text_en: "It successfully implements a focus strategy",
              text_ru: "Успешно реализует стратегию фокусирования",
              why_wrong_en:
                "Focus targets a narrow segment; competing across an entire range is the opposite of focus.",
              why_wrong_ru:
                "Фокусирование нацелено на узкий сегмент; конкуренция по всему ассортименту — противоположность фокусирования.",
            },
            {
              key: "D",
              text_en: "It defines a new sixth competitive force",
              text_ru: "Создаёт новую шестую конкурентную силу",
              why_wrong_en:
                'There is no "sixth force" in Porter\'s model relevant to this scenario; this is a distractor.',
              why_wrong_ru:
                "«Шестой силы» в модели Портера, относящейся к этому сценарию, не существует; это отвлекающий вариант.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            'Porter argued that cost leadership and differentiation require fundamentally different operational choices — cost leaders pursue efficiency, standardisation, and scale; differentiators invest in design, quality, and premium positioning. Trying to do both simultaneously typically results in being "stuck in the middle" — undifferentiated and not cost-competitive.',
          explanation_ru:
            "Портер утверждал, что лидерство по издержкам и дифференциация требуют принципиально разных операционных выборов: лидеры по издержкам гонятся за эффективностью, стандартизацией и масштабом; дифференциаторы инвестируют в дизайн, качество и премиальное позиционирование. Попытка делать и то и другое одновременно обычно приводит к «застреванию посередине» — без дифференциации и без ценового преимущества.",
        },
        // -------- NEW Q15 — hard MCQ scenario combining PESTEL + Porter --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            "A new environmental law requires all car manufacturers to switch to zero-emission engines within five years. Which combination BEST describes the strategic impact?",
          prompt_ru:
            "Новый экологический закон требует от всех автопроизводителей перейти на двигатели с нулевым выбросом в течение пяти лет. Какая комбинация ЛУЧШЕ всего описывает стратегическое влияние?",
          options: [
            {
              key: "A",
              text_en:
                "PESTEL: Environmental + Legal; Porter: increases threat of substitutes",
              text_ru:
                "PESTEL: экологические + правовые; Портер: усиливает угрозу заменителей",
              why_wrong_en:
                "The PESTEL classification is right, but substitutes refers to different product categories serving the same need (e.g. trains for cars). The law forces a redesign of the existing product, not a switch to a substitute.",
              why_wrong_ru:
                "Классификация PESTEL верна, но заменители — это иные продуктовые категории, удовлетворяющие ту же потребность (например, поезда вместо автомобилей). Закон требует переработки существующего продукта, а не перехода к заменителю.",
            },
            {
              key: "B",
              text_en:
                "PESTEL: Environmental + Legal; Porter: raises barriers to entry",
              text_ru:
                "PESTEL: экологические + правовые; Портер: повышает барьеры входа",
            },
            {
              key: "C",
              text_en:
                "PESTEL: Social + Technological; Porter: increases buyer power",
              text_ru:
                "PESTEL: социальные + технологические; Портер: усиливает силу покупателей",
              why_wrong_en:
                "The law is environmental in concern and legal in form, not driven by social or technological forces. Buyer power isn't directly affected by emission standards.",
              why_wrong_ru:
                "Закон по существу экологический и по форме правовой, а не социальный или технологический. На силу покупателей нормативы выбросов прямо не влияют.",
            },
            {
              key: "D",
              text_en:
                "PESTEL: Political only; Porter: increases supplier power",
              text_ru:
                "PESTEL: только политические; Портер: усиливает силу поставщиков",
              why_wrong_en:
                "The change has clear Environmental and Legal dimensions, not Political only. The supplier-power effect is indirect and weaker than the entry-barrier effect.",
              why_wrong_ru:
                "У изменения чёткие экологические и правовые измерения, а не только политические. Эффект на силу поставщиков косвенный и слабее, чем эффект на барьеры входа.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "The law is an Environmental concern enacted in Legal form — both PESTEL categories apply. For Porter, mandatory engine redesign requires massive R&D investment and new manufacturing capability, which raises barriers to entry sharply: new competitors must meet the same standards from day one, with no legacy revenue to fund the transition. Existing players benefit from the higher barrier even as they bear its cost.",
          explanation_ru:
            "Закон представляет собой экологическую озабоченность, оформленную правовым актом — обе категории PESTEL применимы. По Портеру, обязательная переработка двигателей требует крупных вложений в НИОКР и новых производственных мощностей, что резко повышает барьеры входа: новые конкуренты должны соответствовать тем же стандартам с первого дня, не имея устаревшей выручки для финансирования перехода. Действующие игроки получают выгоду от более высокого барьера, даже неся его издержки.",
        },
      ],
    },
    // ---------- B ----------
    {
      code: "B",
      title_en: "Business organisation structure, functions and governance",
      title_ru: "Структура организации, её функции и корпоративное управление",
      description_en:
        "Organisational structures, culture, and governance frameworks.",
      description_ru:
        "Структуры организаций, корпоративная культура и системы управления.",
      sort_order: 20,
      theory_en:
        "Organisational structure determines how work is divided and how authority flows. Common forms include functional (grouped by specialism — finance, marketing, ops), divisional (by product, region, or customer), matrix (dual reporting to a functional manager and a project/product manager), and geographic. Two cross-cutting choices shape any structure: span of control (number of subordinates per manager — wide spans produce flat structures, narrow spans produce tall ones) and centralisation versus decentralisation (where decision-making sits). Decentralisation speeds local response but risks inconsistency; centralisation gives uniformity at the cost of agility.\n\n" +
        "Mintzberg analyses every organisation as five components: the strategic apex (senior leadership), the middle line (managers connecting top and bottom), the operating core (people doing the actual work), the technostructure (analysts standardising work — e.g. management accountants, HR policy designers), and support staff (legal, IT, catering). Mintzberg also lists ten managerial skills covering interpersonal, informational, and decisional roles.\n\n" +
        'Culture is the "way we do things here". Handy identifies four types: power (concentrated on a central figure, often a founder), role (bureaucratic, rule-driven), task (project-focused, expertise-led), and person (built around individuals, e.g. a barrister\'s chambers). Schein describes culture in three layers: visible artefacts, espoused values, and deep underlying assumptions.\n\n' +
        'Corporate governance covers how companies are directed and controlled. The board oversees strategy and risk; non-executive directors (NEDs) provide independent challenge. Key board committees are audit, remuneration, and nomination — each chaired by a NED. Best practice separates the roles of CEO and chairman to avoid concentrated power. The UK Corporate Governance Code operates on a "comply or explain" basis: companies may depart from specific provisions if they explain why in the annual report.',
      theory_ru:
        "Организационная структура определяет, как делится работа и как распределяется полномочие. Распространённые формы: функциональная (группировка по специализации — финансы, маркетинг, операции), дивизиональная (по продукту, региону или клиенту), матричная (двойное подчинение функциональному руководителю и руководителю проекта/продукта) и географическая. Любую структуру формируют два сквозных выбора: норма управляемости (число подчинённых на одного руководителя — широкая норма даёт плоские структуры, узкая — высокие) и централизация против децентрализации (где принимаются решения). Децентрализация ускоряет местный отклик, но повышает риск непоследовательности; централизация обеспечивает единообразие ценой гибкости.\n\n" +
        "Минцберг рассматривает любую организацию как пять элементов: стратегическая вершина (высшее руководство), средняя линия (менеджеры, связывающие верх и низ), операционное ядро (люди, выполняющие основную работу), техноструктура (аналитики, стандартизирующие работу — например, управленческие бухгалтеры, разработчики HR-политик) и вспомогательный персонал (юристы, ИТ, кейтеринг). Минцберг также выделяет десять управленческих навыков, охватывающих межличностные, информационные и решенческие роли.\n\n" +
        "Культура — это «как у нас принято делать». Хэнди выделяет четыре типа: культура власти (сосредоточена на центральной фигуре, часто на основателе), культура роли (бюрократическая, основанная на правилах), культура задачи (ориентированная на проекты, ведущая роль у экспертов) и культура личности (выстроена вокруг отдельных людей, например адвокатская палата). Шейн описывает культуру тремя слоями: видимые артефакты, провозглашаемые ценности и глубинные базовые предположения.\n\n" +
        "Корпоративное управление определяет, как компания управляется и контролируется. Совет директоров отвечает за стратегию и риски; неисполнительные директора (NED) обеспечивают независимый контроль. Ключевые комитеты совета — аудиторский, по вознаграждениям и по назначениям — возглавляются неисполнительными директорами. Передовая практика — разделение ролей CEO и председателя совета во избежание концентрации власти. Британский Кодекс корпоративного управления работает по принципу «соблюдай или объясни»: компания может отступать от конкретных положений, если объясняет причины в годовом отчёте.",
      questions: [
        // -------- existing Q1 (augmented with why_wrong) --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "Mintzberg\u2019s five organisational components include the strategic apex, middle line, technostructure, support staff, and:",
          prompt_ru:
            "Пять элементов организации по Минцбергу: стратегическая вершина, средняя линия, техноструктура, вспомогательный персонал и:",
          options: [
            {
              key: "A",
              text_en: "Operating core",
              text_ru: "Операционное ядро",
            },
            {
              key: "B",
              text_en: "External board",
              text_ru: "Внешний совет",
              why_wrong_en:
                '"External board" is not a Mintzberg component; the board sits within or above the strategic apex.',
              why_wrong_ru:
                "«Внешний совет» не входит в элементы Минцберга; совет находится внутри стратегической вершины или над ней.",
            },
            {
              key: "C",
              text_en: "Sales channel",
              text_ru: "Канал продаж",
              why_wrong_en:
                "A sales channel is a distribution route, not a structural component of the organisation itself.",
              why_wrong_ru:
                "Канал продаж — это маршрут сбыта, а не структурный элемент самой организации.",
            },
            {
              key: "D",
              text_en: "Audit committee",
              text_ru: "Аудиторский комитет",
              why_wrong_en:
                "The audit committee is a governance body, not one of Mintzberg's five structural components.",
              why_wrong_ru:
                "Аудиторский комитет — орган корпоративного управления, а не один из пяти элементов структуры по Минцбергу.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "The operating core is the group of people who do the basic work of producing the organisation\u2019s products or services.",
          explanation_ru:
            "Операционное ядро — это люди, выполняющие основную работу по производству продукта или услуги организации.",
        },
        // -------- existing Q2 (augmented) --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "Which of the following is NOT a feature of a matrix organisational structure?",
          prompt_ru:
            "Что из перечисленного НЕ является характеристикой матричной структуры организации?",
          options: [
            {
              key: "A",
              text_en: "Dual reporting lines",
              text_ru: "Двойное подчинение",
              why_wrong_en:
                "Dual reporting (to functional and project managers) is the defining feature of a matrix.",
              why_wrong_ru:
                "Двойное подчинение (функциональному и проектному руководителю) — определяющая черта матрицы.",
            },
            {
              key: "B",
              text_en: "Flexible resource allocation across projects",
              text_ru: "Гибкое распределение ресурсов между проектами",
              why_wrong_en:
                "Flexible resource sharing is a major reason organisations adopt a matrix — staff move between projects as needed.",
              why_wrong_ru:
                "Гибкое распределение ресурсов — важная причина внедрения матрицы: сотрудники переходят между проектами по необходимости.",
            },
            {
              key: "C",
              text_en: "Single chain of command",
              text_ru: "Единая вертикаль управления",
            },
            {
              key: "D",
              text_en: "Cross-functional collaboration",
              text_ru: "Межфункциональное взаимодействие",
              why_wrong_en:
                "Cross-functional collaboration is a key benefit of matrix structures — they bring specialists together on projects.",
              why_wrong_ru:
                "Межфункциональное взаимодействие — ключевая выгода матричной структуры: она объединяет специалистов на проектах.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "A matrix structure deliberately breaks the single chain of command — employees report to both a functional manager and a project/product manager.",
          explanation_ru:
            "Матричная структура сознательно нарушает принцип единоначалия: сотрудники подчиняются и функциональному руководителю, и руководителю проекта/продукта.",
        },
        // -------- existing Q3 (unchanged short_answer) --------
                {
          type: "mcq",
          difficulty: "easy",
          prompt_en: "Which of Handy's culture types is characterised by a single powerful central figure controlling the organisation?",
          prompt_ru: "Какой тип культуры по Хэнди характеризуется единственной влиятельной центральной фигурой, контролирующей организацию?",
          options: [
            {
              key: "A",
              text_en: "Power culture",
              text_ru: "Культура власти",
            },
            {
              key: "B",
              text_en: "Role culture",
              text_ru: "Ролевая культура",
              why_wrong_en: "Role culture is built on rules, hierarchy and job descriptions (the \"Greek temple\"), not on one central figure.",
              why_wrong_ru: "Ролевая культура строится на правилах, иерархии и должностных инструкциях («греческий храм»), а не на одной центральной фигуре.",
            },
            {
              key: "C",
              text_en: "Task culture",
              text_ru: "Культура задачи",
              why_wrong_en: "Task culture organises around projects and teams (the \"net\"), with power spread by expertise rather than centralised.",
              why_wrong_ru: "Культура задачи строится вокруг проектов и команд («сеть»); власть распределена по компетенциям, а не централизована.",
            },
            {
              key: "D",
              text_en: "Person culture",
              text_ru: "Культура личности",
              why_wrong_en: "Person culture exists to serve the individuals within it (e.g. a partnership of professionals); there is no dominant central controller.",
              why_wrong_ru: "Культура личности существует ради входящих в неё людей (например, партнёрство профессионалов); единого доминирующего центра нет.",
            },
          ],
          correct_answer_en: "A",
          explanation_en: "Power culture (often drawn as a web) concentrates control on a single central figure or small group. Decisions are fast, but quality depends heavily on the centre.",
          explanation_ru: "Культура власти (часто изображается как паутина) концентрирует контроль на одной центральной фигуре или малой группе. Решения принимаются быстро, но их качество сильно зависит от центра.",
        },
        // -------- existing Q4 (augmented) --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en: "The primary role of a non-executive director is to:",
          prompt_ru:
            "Основная роль независимого (неисполнительного) директора состоит в том, чтобы:",
          options: [
            {
              key: "A",
              text_en: "Run day-to-day operations",
              text_ru: "Управлять повседневной деятельностью",
              why_wrong_en:
                "Running operations is the role of executive directors; NEDs are deliberately kept outside daily management.",
              why_wrong_ru:
                "Текущее управление — задача исполнительных директоров; NED намеренно держат в стороне от повседневного управления.",
            },
            {
              key: "B",
              text_en: "Provide independent challenge to executive decisions",
              text_ru:
                "Обеспечивать независимый контроль решений исполнительных директоров",
            },
            {
              key: "C",
              text_en: "Approve all minor expenses",
              text_ru: "Утверждать все мелкие расходы",
              why_wrong_en:
                "Approval of operational expenses is a management function, not a board oversight function.",
              why_wrong_ru:
                "Утверждение операционных расходов — управленческая функция, а не функция надзора со стороны совета.",
            },
            {
              key: "D",
              text_en: "Manage individual employees",
              text_ru: "Управлять отдельными сотрудниками",
              why_wrong_en:
                "Line management of employees is an executive function; NEDs operate at board level.",
              why_wrong_ru:
                "Линейное управление сотрудниками — исполнительная функция; NED работают на уровне совета.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Non-executive directors are not involved in day-to-day management. Their value is independent oversight, challenging strategy, scrutinising performance, and contributing to board committees such as audit and remuneration.",
          explanation_ru:
            "Неисполнительные директора не участвуют в повседневном управлении. Их ценность — независимый надзор, оспаривание стратегии, контроль показателей и работа в комитетах совета (аудит, вознаграждения).",
        },
        // -------- existing Q5 (augmented) --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            'Under the UK Corporate Governance Code, the principle of "comply or explain" means a company must:',
          prompt_ru:
            'Согласно британскому Кодексу корпоративного управления, принцип "соблюдай или объясни" означает, что компания должна:',
          options: [
            {
              key: "A",
              text_en: "Comply with every provision without exception",
              text_ru: "Соблюдать каждое положение без исключений",
              why_wrong_en:
                "The Code is principles-based, not mandatory — strict compliance with every provision is not required.",
              why_wrong_ru:
                "Кодекс основан на принципах, а не обязателен — строгое соблюдение каждого положения не требуется.",
            },
            {
              key: "B",
              text_en:
                "Either comply with provisions or disclose and explain departures from them",
              text_ru:
                "Либо соблюдать положения, либо раскрывать и объяснять отступления от них",
            },
            {
              key: "C",
              text_en: "Explain its strategy to shareholders quarterly",
              text_ru: "Ежеквартально объяснять акционерам свою стратегию",
              why_wrong_en:
                'Quarterly strategy disclosure is unrelated to "comply or explain"; the Code is about governance practices, not strategy reporting frequency.',
              why_wrong_ru:
                "Ежеквартальное раскрытие стратегии не связано с принципом «соблюдай или объясни»; Кодекс касается практик управления, а не частоты раскрытия стратегии.",
            },
            {
              key: "D",
              text_en: "Comply only with provisions that affect profit",
              text_ru: "Соблюдать только положения, влияющие на прибыль",
              why_wrong_en:
                "There is no profit-based filter in the Code — every provision is in scope for either compliance or explanation.",
              why_wrong_ru:
                "В Кодексе нет фильтра по прибыли — каждое положение подлежит либо соблюдению, либо объяснению.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "The Code is principles-based: companies may deviate from specific provisions, but they must explain their reasons in the annual report. This balances flexibility with accountability.",
          explanation_ru:
            "Кодекс основан на принципах: компании могут отступать от конкретных положений, но обязаны объяснить причины в годовом отчёте. Это сочетает гибкость и подотчётность.",
        },
        // -------- NEW Q6 — easy MCQ on functional structure --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "An organisation grouped into departments such as Finance, Marketing, Production, and HR has which type of structure?",
          prompt_ru:
            "Организация, разделённая на отделы вроде Финансы, Маркетинг, Производство и HR, имеет какой тип структуры?",
          options: [
            {
              key: "A",
              text_en: "Divisional",
              text_ru: "Дивизиональная",
              why_wrong_en:
                "Divisional structures group by product, region, or customer — not by specialism.",
              why_wrong_ru:
                "Дивизиональные структуры группируют по продукту, региону или клиенту, а не по специализации.",
            },
            { key: "B", text_en: "Functional", text_ru: "Функциональная" },
            {
              key: "C",
              text_en: "Matrix",
              text_ru: "Матричная",
              why_wrong_en:
                "Matrix structures combine functional AND project/product reporting — a single specialism-only grouping is not matrix.",
              why_wrong_ru:
                "Матричные структуры сочетают функциональное И проектное/продуктовое подчинение; группировка только по специализации — не матрица.",
            },
            {
              key: "D",
              text_en: "Geographic",
              text_ru: "Географическая",
              why_wrong_en:
                "Geographic structures group by location (e.g. Europe, Asia, Americas), not by specialism.",
              why_wrong_ru:
                "Географические структуры группируют по местоположению (например, Европа, Азия, Америки), а не по специализации.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "A functional structure groups employees by the specialist work they do. It promotes deep expertise and economies of scale within each function but can create silos and slow cross-functional decision-making.",
          explanation_ru:
            "Функциональная структура группирует сотрудников по выполняемой ими специализированной работе. Она способствует глубокой экспертизе и эффекту масштаба внутри каждой функции, но создаёт «силосы» и замедляет межфункциональные решения.",
        },
        // -------- NEW Q7 — easy MCQ on span of control --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en: "A WIDE span of control typically results in:",
          prompt_ru: "Широкая норма управляемости обычно приводит к:",
          options: [
            {
              key: "A",
              text_en: "A tall organisational structure",
              text_ru: "Высокой организационной структуре",
              why_wrong_en:
                "Wide spans REDUCE the number of management layers, producing FLAT structures, not tall ones.",
              why_wrong_ru:
                "Широкие нормы СОКРАЩАЮТ число уровней управления, создавая ПЛОСКИЕ структуры, а не высокие.",
            },
            {
              key: "B",
              text_en: "A flat organisational structure",
              text_ru: "Плоской организационной структуре",
            },
            {
              key: "C",
              text_en: "Closer supervision of each subordinate",
              text_ru: "Более плотному надзору за каждым подчинённым",
              why_wrong_en:
                "The opposite — with more subordinates per manager, less time can be spent on each.",
              why_wrong_ru:
                "Наоборот: при большем числе подчинённых на руководителя на каждого приходится меньше времени.",
            },
            {
              key: "D",
              text_en: "More middle management layers",
              text_ru: "Большему числу уровней среднего звена",
              why_wrong_en:
                "More layers result from NARROW spans; wide spans reduce the need for middle managers.",
              why_wrong_ru:
                "Больше уровней появляется при УЗКОЙ норме управляемости; широкая норма сокращает потребность в среднем звене.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "A wide span of control means each manager supervises many subordinates. This requires fewer management layers overall, producing a flat structure with faster communication but potentially less individual oversight.",
          explanation_ru:
            "Широкая норма управляемости означает, что каждый руководитель управляет многими подчинёнными. Это требует меньше уровней управления и даёт плоскую структуру с более быстрой коммуникацией, но потенциально менее плотным индивидуальным надзором.",
        },
        // -------- NEW Q8 — easy short_answer on Schein --------
                {
          type: "mcq",
          difficulty: "easy",
          prompt_en: "Schein describes organisational culture in three levels. What is the correct order from most visible to deepest?",
          prompt_ru: "Шейн описывает организационную культуру на трёх уровнях. Каков правильный порядок от наиболее видимого к самому глубокому?",
          options: [
            {
              key: "A",
              text_en: "Artefacts → espoused values → basic underlying assumptions",
              text_ru: "Артефакты → провозглашаемые ценности → базовые подспудные предположения",
            },
            {
              key: "B",
              text_en: "Basic underlying assumptions → espoused values → artefacts",
              text_ru: "Базовые предположения → провозглашаемые ценности → артефакты",
              why_wrong_en: "This reverses the order. The deepest, least visible level (basic assumptions) is listed first, but the question asks most-visible first.",
              why_wrong_ru: "Это обратный порядок. Самый глубокий, наименее видимый уровень (базовые предположения) указан первым, тогда как вопрос требует начинать с наиболее видимого.",
            },
            {
              key: "C",
              text_en: "Espoused values → artefacts → basic underlying assumptions",
              text_ru: "Провозглашаемые ценности → артефакты → базовые предположения",
              why_wrong_en: "Artefacts are the MOST visible level and must come first; espoused values sit between artefacts and assumptions.",
              why_wrong_ru: "Артефакты — наиболее видимый уровень и должны идти первыми; провозглашаемые ценности находятся между артефактами и предположениями.",
            },
            {
              key: "D",
              text_en: "Artefacts → basic underlying assumptions → espoused values",
              text_ru: "Артефакты → базовые предположения → провозглашаемые ценности",
              why_wrong_en: "Espoused values are the MIDDLE level, not the deepest; basic underlying assumptions are the deepest.",
              why_wrong_ru: "Провозглашаемые ценности — СРЕДНИЙ уровень, а не самый глубокий; базовые предположения — самый глубокий уровень.",
            },
          ],
          correct_answer_en: "A",
          explanation_en: "Artefacts are visible: dress, office layout, language, rituals. Espoused values are the strategies, goals and philosophies the organisation publicly states. Basic underlying assumptions are unconscious, taken-for-granted beliefs — the deepest level and hardest to change.",
          explanation_ru: "Артефакты видимы: дресс-код, планировка офиса, язык, ритуалы. Провозглашаемые ценности — это стратегии, цели и философия, заявляемые публично. Базовые подспудные предположения — неосознаваемые, само собой разумеющиеся убеждения; это самый глубокий и трудноизменяемый уровень.",
        },
        // -------- NEW Q9 — medium MCQ on Handy task culture --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A consultancy firm forms ad-hoc teams of specialists around each client engagement, dissolving them once the project completes. This BEST describes which Handy culture type?",
          prompt_ru:
            "Консалтинговая фирма формирует временные команды специалистов под каждый клиентский проект, распуская их по завершении. Какому типу культуры по Хэнди это ЛУЧШЕ всего соответствует?",
          options: [
            {
              key: "A",
              text_en: "Power culture",
              text_ru: "Культура власти",
              why_wrong_en:
                "Power culture centralises decisions on a founder/leader; the consultancy described uses dispersed expert teams.",
              why_wrong_ru:
                "Культура власти централизует решения на основателе/лидере; описанная фирма работает через распределённые экспертные команды.",
            },
            {
              key: "B",
              text_en: "Role culture",
              text_ru: "Культура роли",
              why_wrong_en:
                "Role culture is bureaucratic and rule-driven, with fixed job descriptions — incompatible with ad-hoc team formation.",
              why_wrong_ru:
                "Культура роли бюрократична и основана на правилах с фиксированными должностными инструкциями — несовместима с временным формированием команд.",
            },
            { key: "C", text_en: "Task culture", text_ru: "Культура задачи" },
            {
              key: "D",
              text_en: "Person culture",
              text_ru: "Культура личности",
              why_wrong_en:
                "Person culture organises around individual professionals (e.g. partners in a law firm) without team coordination; here teams are explicitly formed.",
              why_wrong_ru:
                "Культура личности выстраивается вокруг отдельных профессионалов (например, партнёров в юрфирме) без координации в командах; здесь же команды формируются явно.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "Task culture (often visualised as a net or matrix) brings together expertise for specific jobs, then disperses. Power lies with whoever has the knowledge needed at that moment. Project-based consultancies, R&D teams, and creative agencies typify this culture.",
          explanation_ru:
            "Культура задачи (часто визуализируется как сеть или матрица) объединяет экспертизу для конкретных задач, а затем распадается. Власть принадлежит тому, у кого есть нужные знания в данный момент. Проектные консалтинги, команды НИОКР и креативные агентства — типичные примеры.",
        },
        // -------- NEW Q10 — medium MCQ on technostructure --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "In Mintzberg\u2019s model, which component is responsible for standardising work processes through analysis and procedures?",
          prompt_ru:
            "В модели Минцберга какой элемент отвечает за стандартизацию рабочих процессов через анализ и процедуры?",
          options: [
            {
              key: "A",
              text_en: "Strategic apex",
              text_ru: "Стратегическая вершина",
              why_wrong_en:
                "The strategic apex sets direction and makes major decisions; it does not standardise day-to-day work processes.",
              why_wrong_ru:
                "Стратегическая вершина задаёт направление и принимает крупные решения; она не занимается стандартизацией повседневных процессов.",
            },
            {
              key: "B",
              text_en: "Middle line",
              text_ru: "Средняя линия",
              why_wrong_en:
                "The middle line transmits decisions between apex and operating core; standardisation is the technostructure's role.",
              why_wrong_ru:
                "Средняя линия передаёт решения между вершиной и операционным ядром; стандартизация — задача техноструктуры.",
            },
            { key: "C", text_en: "Technostructure", text_ru: "Техноструктура" },
            {
              key: "D",
              text_en: "Support staff",
              text_ru: "Вспомогательный персонал",
              why_wrong_en:
                "Support staff (legal, catering, IT) provide ancillary services — they do not design work processes.",
              why_wrong_ru:
                "Вспомогательный персонал (юристы, кейтеринг, ИТ) оказывает вспомогательные услуги — они не проектируют рабочие процессы.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "The technostructure is made up of analysts — management accountants, work-study engineers, HR policy designers, quality control specialists — whose job is to standardise what others do. They shape the procedures the operating core follows.",
          explanation_ru:
            "Техноструктура состоит из аналитиков — управленческих бухгалтеров, инженеров по нормированию труда, разработчиков HR-политик, специалистов по контролю качества, — задача которых стандартизировать работу других. Они формируют процедуры, которым следует операционное ядро.",
        },
        // -------- NEW Q11 — medium MCQ on decentralisation --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A multinational retailer gives each country\u2019s management full authority over pricing, product range, and marketing. The MAIN risk of this decentralisation is:",
          prompt_ru:
            "Транснациональный ретейлер предоставляет менеджменту каждой страны полную власть над ценообразованием, ассортиментом и маркетингом. ГЛАВНЫЙ риск такой децентрализации:",
          options: [
            {
              key: "A",
              text_en: "Slow response to local market conditions",
              text_ru: "Медленный отклик на местные рыночные условия",
              why_wrong_en:
                "The opposite — decentralisation typically SPEEDS local response; the trade-off lies elsewhere.",
              why_wrong_ru:
                "Наоборот — децентрализация обычно УСКОРЯЕТ местный отклик; компромисс лежит в другом.",
            },
            {
              key: "B",
              text_en: "Inconsistent brand image and customer experience",
              text_ru: "Непоследовательный имидж бренда и клиентский опыт",
            },
            {
              key: "C",
              text_en: "Over-reliance on head office decision-making",
              text_ru: "Чрезмерная зависимость от решений головного офиса",
              why_wrong_en:
                "Decentralisation REDUCES dependence on head office; this would be the risk of centralisation, not decentralisation.",
              why_wrong_ru:
                "Децентрализация СНИЖАЕТ зависимость от головного офиса; это риск централизации, а не децентрализации.",
            },
            {
              key: "D",
              text_en: "Loss of local market knowledge",
              text_ru: "Потеря знаний о местных рынках",
              why_wrong_en:
                "Decentralisation USES local market knowledge; centralisation is more likely to lose it.",
              why_wrong_ru:
                "Децентрализация ИСПОЛЬЗУЕТ знания о местных рынках; их скорее теряет централизация.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Decentralisation's strength — local autonomy — is also its weakness: each country may optimise locally in ways that fragment the brand. Customers travelling between countries see different prices, different products, and different advertising, which can dilute brand equity. The challenge is balancing autonomy with group-level consistency.",
          explanation_ru:
            "Сила децентрализации — местная автономия — является и её слабостью: каждая страна оптимизирует локально, фрагментируя бренд. Клиенты, путешествующие между странами, видят разные цены, разные ассортименты и разную рекламу, что размывает капитал бренда. Задача — баланс автономии и групповой согласованности.",
        },
        // -------- NEW Q12 — medium MCQ on remuneration committee --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "The primary purpose of a board\u2019s remuneration committee is to:",
          prompt_ru: "Основное назначение комитета совета по вознаграждениям:",
          options: [
            {
              key: "A",
              text_en: "Determine pay for all employees of the company",
              text_ru: "Определять оплату всех сотрудников компании",
              why_wrong_en:
                "The committee deals only with executive director compensation, not company-wide pay.",
              why_wrong_ru:
                "Комитет занимается только вознаграждением исполнительных директоров, а не оплатой по всей компании.",
            },
            {
              key: "B",
              text_en:
                "Set executive director remuneration independently of those receiving it",
              text_ru:
                "Устанавливать вознаграждение исполнительных директоров независимо от получателей",
            },
            {
              key: "C",
              text_en: "Approve the company\u2019s dividend policy",
              text_ru: "Утверждать дивидендную политику компании",
              why_wrong_en:
                "Dividend policy is a board-level decision, not a remuneration committee matter.",
              why_wrong_ru:
                "Дивидендная политика — решение совета в целом, а не комитета по вознаграждениям.",
            },
            {
              key: "D",
              text_en: "Manage day-to-day payroll operations",
              text_ru: "Управлять текущей выплатой заработной платы",
              why_wrong_en:
                "Payroll is an operational HR/finance function; the committee operates at board level only.",
              why_wrong_ru:
                "Расчёт заработной платы — операционная функция HR/финансов; комитет работает только на уровне совета.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "The remuneration committee is composed of independent non-executive directors precisely so that executive pay is set by people who do not benefit from it. This avoids the obvious conflict of executives setting their own pay and ties remuneration to performance criteria the NEDs approve.",
          explanation_ru:
            "Комитет по вознаграждениям состоит из независимых неисполнительных директоров именно для того, чтобы оплату исполнительных директоров устанавливали те, кто её не получает. Это устраняет очевидный конфликт интересов и связывает вознаграждение с критериями эффективности, утверждаемыми NED.",
        },
        // -------- NEW Q13 — medium short_answer on CEO/Chairman --------
                {
          type: "mcq",
          difficulty: "medium",
          prompt_en: "Why does best practice in corporate governance recommend separating the roles of CEO and Chairman?",
          prompt_ru: "Почему передовая практика корпоративного управления рекомендует разделять роли генерального директора и председателя совета директоров?",
          options: [
            {
              key: "A",
              text_en: "To avoid an excessive concentration of power and ensure independent board oversight of the executive",
              text_ru: "Чтобы избежать чрезмерной концентрации власти и обеспечить независимый надзор совета за исполнительным руководством",
            },
            {
              key: "B",
              text_en: "To reduce the company's salary costs",
              text_ru: "Чтобы сократить расходы компании на заработную плату",
              why_wrong_en: "Separation is about governance checks and balances, not cost saving — indeed it usually means paying two senior individuals.",
              why_wrong_ru: "Разделение касается системы сдержек и противовесов в управлении, а не экономии — обычно это означает оплату двух руководителей.",
            },
            {
              key: "C",
              text_en: "Because company law makes it illegal for one person to hold both roles",
              text_ru: "Потому что закон запрещает одному лицу занимать обе должности",
              why_wrong_en: "In most jurisdictions combining the roles is discouraged by governance codes (\"comply or explain\"), not outlawed by statute.",
              why_wrong_ru: "В большинстве юрисдикций совмещение ролей не поощряется кодексами управления («соблюдай или объясни»), но не запрещено законом.",
            },
            {
              key: "D",
              text_en: "To speed up executive decision-making",
              text_ru: "Чтобы ускорить принятие исполнительных решений",
              why_wrong_en: "Separation adds a check on the executive; if anything it slows unilateral decisions — that oversight is the point.",
              why_wrong_ru: "Разделение добавляет контроль над исполнительной властью; если что, оно замедляет единоличные решения — именно в этом надзоре и смысл.",
            },
          ],
          correct_answer_en: "A",
          explanation_en: "If one person held both roles they would effectively oversee themselves — running the executive AND chairing the board that holds the executive to account. Separation provides a check on executive power, ensures balanced board discussion, and gives shareholders an independent point of contact.",
          explanation_ru: "Если бы одно лицо занимало обе роли, оно фактически контролировало бы само себя — руководя исполнительным звеном И возглавляя совет, который этот менеджмент контролирует. Разделение обеспечивает сдерживание исполнительной власти, сбалансированное обсуждение в совете и даёт акционерам независимую точку контакта.",
        },
        // -------- NEW Q14 — hard MCQ on Mintzberg skills vs Fayol --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            'A student writes that "managers must plan, organise, command, coordinate and control". This list reflects the work of:',
          prompt_ru:
            "Студент пишет, что «менеджеры должны планировать, организовывать, распоряжаться, координировать и контролировать». Этот перечень отражает работу:",
          options: [
            {
              key: "A",
              text_en: "Mintzberg",
              text_ru: "Минцберга",
              why_wrong_en:
                "Mintzberg identified TEN managerial skills (interpersonal, informational, decisional) — not the five classical functions listed.",
              why_wrong_ru:
                "Минцберг выделил ДЕСЯТЬ управленческих навыков (межличностные, информационные, решенческие), а не пять классических функций.",
            },
            { key: "B", text_en: "Fayol", text_ru: "Файоля" },
            {
              key: "C",
              text_en: "Handy",
              text_ru: "Хэнди",
              why_wrong_en:
                "Handy is associated with culture types (power, role, task, person), not with classical management functions.",
              why_wrong_ru:
                "Хэнди связан с типами культуры (власти, роли, задачи, личности), а не с классическими функциями менеджмента.",
            },
            {
              key: "D",
              text_en: "Schein",
              text_ru: "Шейна",
              why_wrong_en:
                "Schein's work is on organisational culture (three levels), not the functions of management.",
              why_wrong_ru:
                "Работа Шейна — об организационной культуре (три уровня), а не о функциях менеджмента.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Henri Fayol\u2019s five classical functions of management — Plan, Organise, Command, Coordinate, Control (POCCC) — date from 1916 and remain a foundational framework. The trick on this question is that students often confuse Fayol's functions with Mintzberg's ten skills; both describe what managers do, but at different levels of abstraction.",
          explanation_ru:
            "Пять классических функций менеджмента Анри Файоля — Планирование, Организация, Распорядительство, Координация, Контроль (POCCC) — сформулированы в 1916 году и остаются базовой моделью. Ловушка вопроса в том, что студенты часто путают функции Файоля с десятью навыками Минцберга; оба описывают, что делают менеджеры, но на разных уровнях абстракции.",
        },
        // -------- NEW Q15 — hard MCQ on structure choice scenario --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            "A pharmaceutical company operates in 30 countries, sells across 5 distinct therapeutic areas (oncology, cardiovascular, etc.), and must comply with local drug regulation in each market. Which structure BEST balances these competing demands?",
          prompt_ru:
            "Фармацевтическая компания работает в 30 странах, продаёт в 5 различных терапевтических областях (онкология, кардиология и др.) и обязана соблюдать местное лекарственное регулирование в каждом рынке. Какая структура ЛУЧШЕ всего балансирует эти конкурирующие требования?",
          options: [
            {
              key: "A",
              text_en: "Pure functional structure",
              text_ru: "Чисто функциональная структура",
              why_wrong_en:
                "Functional alone cannot address the dual demands of therapeutic specialism AND country-specific regulation simultaneously.",
              why_wrong_ru:
                "Функциональная сама по себе не может одновременно обслуживать требования терапевтической специализации И странового регулирования.",
            },
            {
              key: "B",
              text_en: "Pure geographic structure by country",
              text_ru: "Чисто географическая структура по странам",
              why_wrong_en:
                "Geographic alone would lose the deep therapeutic-area expertise needed for drug development and global pricing.",
              why_wrong_ru:
                "Чисто географическая утратит глубокую экспертизу в терапевтических областях, нужную для разработки и глобального ценообразования.",
            },
            {
              key: "C",
              text_en:
                "Matrix structure combining therapeutic area and geography",
              text_ru:
                "Матричная структура, сочетающая терапевтическую область и географию",
            },
            {
              key: "D",
              text_en: "Entrepreneurial structure centred on the CEO",
              text_ru: "Предпринимательская структура с центром в CEO",
              why_wrong_en:
                "Entrepreneurial structures suit small, early-stage organisations; a 30-country firm with 5 therapeutic areas is far too complex.",
              why_wrong_ru:
                "Предпринимательские структуры подходят малым организациям на ранней стадии; компания в 30 странах с 5 терапевтическими областями слишком сложна.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "A matrix lets staff report into BOTH a therapeutic-area head (who owns deep product expertise, global strategy, R&D portfolio) AND a country manager (who owns local regulation, pricing, key-account relationships). The cost is the well-known matrix burden: dual reporting, slower decisions, and potential conflicts between the two axes. For this kind of complex multi-dimensional business, that trade-off is usually worth it.",
          explanation_ru:
            "Матрица позволяет сотрудникам подчиняться И руководителю терапевтической области (отвечает за глубокую продуктовую экспертизу, глобальную стратегию, портфель НИОКР), И страновому менеджеру (отвечает за местное регулирование, ценообразование, отношения с ключевыми клиентами). Цена — известная нагрузка матрицы: двойное подчинение, более медленные решения, возможные конфликты между двумя осями. Для такого многомерного бизнеса этот компромисс обычно оправдан.",
        },
      ],
    },
    // ---------- C ----------
    {
      code: "C",
      title_en: "Accounting and reporting systems, controls and compliance",
      title_ru:
        "Учётные и отчётные системы, контроль и соответствие требованиям",
      description_en:
        "Internal controls, audit, risk, fraud, money laundering, and data protection.",
      description_ru:
        "Внутренний контроль, аудит, риски, мошенничество, противодействие отмыванию и защита данных.",
      sort_order: 30,
      theory_en:
        "Internal controls are policies, procedures and checks designed to safeguard assets, produce reliable records, and ensure compliance with laws and policies. Controls are classified by purpose: preventive (stop errors before they happen — e.g. authorisation limits), detective (find errors after the fact — e.g. reconciliations), corrective (fix problems found — e.g. restoring backups), and compensating (substitute when a primary control isn't feasible). Key everyday controls include segregation of duties (no single person initiates, records, and approves a transaction), authorisation, physical safeguards over cash and inventory, and reconciliations between independent records.\n\n" +
        "Audit comes in two flavours. Internal audit is an in-house function evaluating risk and control effectiveness for the board. External audit is independent and gives an opinion on whether the financial statements show a true and fair view. The audit committee — composed of non-executive directors — oversees both, including auditor independence.\n\n" +
        "Risk management uses gross risk (before controls) and net or residual risk (after controls). The risk register documents identified risks, owners, scores, and treatments. The TARA framework picks a response: Transfer (insure, outsource), Avoid (don't do the risky activity), Reduce (controls), Accept (live with it — typical for low-impact risks).\n\n" +
        "The fraud triangle (Cressey) explains why fraud occurs: Pressure or motive (financial need, targets), Opportunity (weak controls, override of segregation), and Rationalisation or justification (the perpetrator's self-talk). Removing any side reduces fraud risk.\n\n" +
        "Money laundering follows three stages: Placement (dirty cash enters the system), Layering (transactions obscure the trail), and Integration (funds re-emerge looking legitimate). Firms must train staff, appoint a Money Laundering Reporting Officer (MLRO), and file suspicious activity reports. Data protection / GDPR principles cover lawful basis, purpose limitation, data minimisation, accuracy, storage limits, security, and accountability.",
      theory_ru:
        "Внутренний контроль — это политики, процедуры и проверки, призванные защитить активы, обеспечить достоверность учёта и соответствие законам и внутренним правилам. Контроли классифицируются по цели: превентивные (останавливают ошибку до её возникновения — например, лимиты на авторизацию), детективные (выявляют ошибки постфактум — например, сверки), корректирующие (устраняют выявленные проблемы — например, восстановление из резервной копии) и компенсирующие (заменяют основной контроль, когда тот невозможен). Ключевые повседневные контроли: разделение обязанностей (никто не инициирует, не учитывает и не утверждает операцию в одиночку), авторизация, физическая защита денег и запасов, сверки между независимыми регистрами.\n\n" +
        "Аудит бывает двух видов. Внутренний аудит — внутренняя функция, оценивающая риски и эффективность контроля в интересах совета. Внешний аудит — независимый и даёт мнение о достоверности финансовой отчётности. Аудиторский комитет — состоит из неисполнительных директоров — надзирает за обоими, включая независимость внешнего аудитора.\n\n" +
        "Управление рисками оперирует понятиями валового риска (до контролей) и чистого, или остаточного, риска (после). Реестр рисков фиксирует выявленные риски, их владельцев, оценки и меры реагирования. Модель TARA выбирает реакцию: Transfer — передать (страхование, аутсорсинг), Avoid — избежать (не вести рискованную деятельность), Reduce — снизить (контроли), Accept — принять (мириться — типично для рисков с малыми последствиями).\n\n" +
        "Треугольник мошенничества (Кресси) объясняет, почему совершается мошенничество: Давление или стимул (финансовая нужда, плановые показатели), Возможность (слабые контроли, обход разделения обязанностей) и Рационализация или оправдание (внутренняя логика самого нарушителя). Устранение любой из сторон снижает риск мошенничества.\n\n" +
        "Отмывание денег проходит три стадии: размещение (грязные наличные попадают в финансовую систему), расслоение (операции запутывают след) и интеграция (средства возвращаются под видом легальных). Компании обязаны обучать персонал, назначать Money Laundering Reporting Officer (MLRO) и подавать сообщения о подозрительных операциях. Принципы защиты данных и GDPR охватывают законность основания обработки, ограничение цели, минимизацию данных, точность, ограничение хранения, безопасность и подотчётность.",
      questions: [
        // -------- existing Q1 (augmented) --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "Segregation of duties is an example of which type of internal control?",
          prompt_ru:
            "Разделение обязанностей является примером какого типа внутреннего контроля?",
          options: [
            { key: "A", text_en: "Preventive", text_ru: "Превентивного" },
            {
              key: "B",
              text_en: "Detective",
              text_ru: "Выявляющего",
              why_wrong_en:
                "Detective controls find errors AFTER they happen (e.g. reconciliations); segregation aims to stop errors occurring in the first place.",
              why_wrong_ru:
                "Детективные контроли выявляют ошибки ПОСЛЕ их возникновения (например, сверки); разделение обязанностей нацелено остановить ошибку до её появления.",
            },
            {
              key: "C",
              text_en: "Corrective",
              text_ru: "Корректирующего",
              why_wrong_en:
                "Corrective controls fix problems already found (e.g. restoring backups); segregation is upstream of that.",
              why_wrong_ru:
                "Корректирующие контроли устраняют уже выявленные проблемы (например, восстановление резервных копий); разделение обязанностей действует раньше.",
            },
            {
              key: "D",
              text_en: "Compensating",
              text_ru: "Компенсирующего",
              why_wrong_en:
                "Compensating controls substitute when a primary control isn't feasible — segregation IS the primary control here, not a substitute.",
              why_wrong_ru:
                "Компенсирующие контроли заменяют основной, когда тот невозможен — разделение обязанностей и ЕСТЬ основной контроль, а не замена.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Segregation of duties (splitting authorisation, custody and recording among different people) is designed to prevent errors and fraud from occurring in the first place.",
          explanation_ru:
            "Разделение обязанностей (разделение полномочий, хранения и учёта между разными людьми) призвано предотвратить ошибки и мошенничество ещё до их возникновения.",
        },
        // -------- existing Q2 (augmented) --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en: "Which is the BEST example of a detective control?",
          prompt_ru: "Что является НАИЛУЧШИМ примером выявляющего контроля?",
          options: [
            {
              key: "A",
              text_en: "Locking the warehouse",
              text_ru: "Запирание склада",
              why_wrong_en:
                "Locking the warehouse is a PHYSICAL preventive control — it stops unauthorised access before it happens.",
              why_wrong_ru:
                "Запирание склада — это ФИЗИЧЕСКИЙ превентивный контроль: он предотвращает несанкционированный доступ до его возникновения.",
            },
            {
              key: "B",
              text_en: "Monthly bank reconciliation",
              text_ru: "Ежемесячная сверка с банком",
            },
            {
              key: "C",
              text_en: "Authorisation limits for purchases",
              text_ru: "Лимиты на согласование закупок",
              why_wrong_en:
                "Authorisation limits are preventive — they require approval before a transaction can be made.",
              why_wrong_ru:
                "Лимиты на согласование — превентивные: они требуют одобрения до совершения операции.",
            },
            {
              key: "D",
              text_en: "Staff training on procedures",
              text_ru: "Обучение сотрудников процедурам",
              why_wrong_en:
                "Training is preventive — it equips staff to avoid errors before they occur.",
              why_wrong_ru:
                "Обучение — превентивный контроль: оно даёт сотрудникам инструменты избежать ошибок до их возникновения.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "A reconciliation detects discrepancies after they have already occurred. The other options prevent issues rather than detect them.",
          explanation_ru:
            "Сверка выявляет расхождения уже после того, как они произошли. Остальные варианты предотвращают проблемы, а не выявляют их.",
        },
        // -------- existing Q3 — fraud triangle (UPDATED with synonyms) --------
                {
          type: "mcq",
          difficulty: "medium",
          prompt_en: "Which set correctly names the three elements of Cressey's fraud triangle?",
          prompt_ru: "Какой набор верно называет три элемента треугольника мошенничества Кресси?",
          options: [
            {
              key: "A",
              text_en: "Pressure, opportunity, rationalisation",
              text_ru: "Давление, возможность, рационализация",
            },
            {
              key: "B",
              text_en: "Pressure, capability, concealment",
              text_ru: "Давление, способность, сокрытие",
              why_wrong_en: "Capability and concealment belong to the later \"fraud diamond\" extension; the classic triangle's third element is rationalisation, and its second is opportunity.",
              why_wrong_ru: "Способность и сокрытие относятся к более позднему расширению «бриллиант мошенничества»; третий элемент классического треугольника — рационализация, второй — возможность.",
            },
            {
              key: "C",
              text_en: "Motive, means, method",
              text_ru: "Мотив, средства, метод",
              why_wrong_en: "This is a colloquial crime phrase, not Cressey's model. The model's elements are pressure, opportunity and rationalisation.",
              why_wrong_ru: "Это бытовая криминалистическая формула, а не модель Кресси. Элементы модели — давление, возможность и рационализация.",
            },
            {
              key: "D",
              text_en: "Opportunity, detection, prosecution",
              text_ru: "Возможность, выявление, преследование",
              why_wrong_en: "Detection and prosecution are responses to fraud, not the conditions that enable it. The enabling conditions are pressure, opportunity and rationalisation.",
              why_wrong_ru: "Выявление и преследование — это реакция на мошенничество, а не условия, которые его порождают. Порождающие условия — давление, возможность и рационализация.",
            },
          ],
          correct_answer_en: "A",
          explanation_en: "Cressey's fraud triangle proposes fraud requires three elements: Pressure (motive/incentive — financial need or targets), Opportunity (a control weakness or override), and Rationalisation (the offender justifies the act to themselves).",
          explanation_ru: "Треугольник мошенничества Кресси предполагает, что для мошенничества нужны три элемента: давление (мотив/стимул — финансовая нужда или цели), возможность (слабость контроля или его обход) и рационализация (нарушитель оправдывает действие перед собой).",
        },
        // -------- existing Q4 (augmented) --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en: "The role of internal audit is BEST described as:",
          prompt_ru: "Роль внутреннего аудита ЛУЧШЕ всего описать как:",
          options: [
            {
              key: "A",
              text_en: "Approving the financial statements",
              text_ru: "Утверждение финансовой отчётности",
              why_wrong_en:
                "Financial statements are approved by the board, not by internal audit.",
              why_wrong_ru:
                "Финансовую отчётность утверждает совет директоров, а не внутренний аудит.",
            },
            {
              key: "B",
              text_en:
                "Providing independent assurance to management on risk and control",
              text_ru:
                "Независимая оценка для руководства в части рисков и контроля",
            },
            {
              key: "C",
              text_en: "Performing the external audit",
              text_ru: "Проведение внешнего аудита",
              why_wrong_en:
                "The external audit is performed by an INDEPENDENT firm, not by an in-house function — independence rules forbid this.",
              why_wrong_ru:
                "Внешний аудит проводит НЕЗАВИСИМАЯ фирма, а не внутренняя функция — правила независимости это запрещают.",
            },
            {
              key: "D",
              text_en: "Setting strategy",
              text_ru: "Постановка стратегии",
              why_wrong_en:
                "Strategy is set by the board and executive team; internal audit evaluates how risks to strategy are controlled but does not set it.",
              why_wrong_ru:
                "Стратегию устанавливают совет и исполнительная команда; внутренний аудит оценивает контроль рисков для стратегии, но её не формирует.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Internal audit is an independent assurance function reporting to the audit committee. It evaluates the effectiveness of governance, risk management and control processes.",
          explanation_ru:
            "Внутренний аудит — независимая функция оценки, подотчётная аудиторскому комитету. Он проверяет эффективность управления, управления рисками и процессов контроля.",
        },
        // -------- existing Q5 (augmented) --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            "A company\u2019s controls require two signatures on cheques over £10,000. An employee splits a £15,000 payment into two cheques of £7,500 each. This is an example of:",
          prompt_ru:
            "В компании требуются две подписи на чеках свыше £10 000. Сотрудник разбивает платёж в £15 000 на два чека по £7 500. Это пример:",
          options: [
            {
              key: "A",
              text_en: "Authorised activity",
              text_ru: "Разрешённой деятельности",
              why_wrong_en:
                "Deliberately structuring payments to avoid an approval requirement is not authorised, even if each cheque technically falls under the limit.",
              why_wrong_ru:
                "Намеренное дробление платежей в обход порога согласования — не разрешённая деятельность, даже если каждый чек формально ниже лимита.",
            },
            {
              key: "B",
              text_en: "Control override",
              text_ru: "Обхода контроля",
            },
            {
              key: "C",
              text_en: "Strong segregation of duties",
              text_ru: "Сильного разделения обязанностей",
              why_wrong_en:
                "Segregation requires DIFFERENT people doing different steps; one employee splitting their own payments is not segregation.",
              why_wrong_ru:
                "Разделение обязанностей требует РАЗНЫХ людей на разных этапах; один сотрудник, дробящий собственный платёж, — это не разделение.",
            },
            {
              key: "D",
              text_en: "Compensating control",
              text_ru: "Компенсирующего контроля",
              why_wrong_en:
                "A compensating control SUPPORTS a missing primary control; this scenario UNDERMINES the primary control instead.",
              why_wrong_ru:
                "Компенсирующий контроль ПОДДЕРЖИВАЕТ отсутствующий основной; здесь же основной контроль наоборот ПОДРЫВАЕТСЯ.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Splitting transactions to evade an authorisation threshold is a classic control override. It bypasses the intent of the control even though no individual cheque breaches the rule literally.",
          explanation_ru:
            "Дробление операций для обхода порога согласования — классический пример обхода контроля. Формально каждый чек правилу не противоречит, но цель контроля нарушается.",
        },
        // -------- NEW Q6 — easy MCQ on corrective control --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "A company restores customer data from a backup after a system crash. This is an example of which type of control?",
          prompt_ru:
            "Компания восстанавливает клиентские данные из резервной копии после сбоя системы. Это пример какого типа контроля?",
          options: [
            {
              key: "A",
              text_en: "Preventive",
              text_ru: "Превентивного",
              why_wrong_en:
                "Preventive controls act BEFORE an event; restoring data happens AFTER the crash.",
              why_wrong_ru:
                "Превентивные контроли действуют ДО события; восстановление данных происходит ПОСЛЕ сбоя.",
            },
            {
              key: "B",
              text_en: "Detective",
              text_ru: "Выявляющего",
              why_wrong_en:
                "Detective controls IDENTIFY problems; restoration is fixing the problem, not finding it.",
              why_wrong_ru:
                "Детективные контроли ВЫЯВЛЯЮТ проблемы; восстановление — это устранение проблемы, а не её обнаружение.",
            },
            { key: "C", text_en: "Corrective", text_ru: "Корректирующего" },
            {
              key: "D",
              text_en: "Directive",
              text_ru: "Директивного",
              why_wrong_en:
                "Directive controls instruct staff what to do (e.g. policy manuals); restoring data is an action, not an instruction.",
              why_wrong_ru:
                "Директивные контроли указывают сотрудникам, что делать (например, политики); восстановление данных — это действие, а не указание.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "Corrective controls reverse or limit the damage from a problem that has already occurred. Restoring from backup, refunding overcharged customers, and reissuing incorrect invoices all fit this category.",
          explanation_ru:
            "Корректирующие контроли устраняют или ограничивают ущерб от уже произошедшей проблемы. Восстановление из резервной копии, возврат переплат клиентам, перевыпуск некорректных счетов — всё попадает в эту категорию.",
        },
        // -------- NEW Q7 — easy MCQ on audit committee composition --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "The audit committee of a listed company should be composed primarily of:",
          prompt_ru:
            "Аудиторский комитет публичной компании должен состоять преимущественно из:",
          options: [
            {
              key: "A",
              text_en: "Executive directors",
              text_ru: "Исполнительных директоров",
              why_wrong_en:
                "Executive directors are part of management — they cannot independently oversee management; that is the precise conflict the committee is meant to avoid.",
              why_wrong_ru:
                "Исполнительные директора входят в руководство — они не могут независимо надзирать за руководством, а именно для устранения этого конфликта существует комитет.",
            },
            {
              key: "B",
              text_en: "Independent non-executive directors",
              text_ru: "Независимых неисполнительных директоров",
            },
            {
              key: "C",
              text_en: "The external auditors",
              text_ru: "Внешних аудиторов",
              why_wrong_en:
                "External auditors REPORT to the audit committee; they cannot also be members — that would compromise their independence.",
              why_wrong_ru:
                "Внешние аудиторы ПОДЧИНЯЮТСЯ аудиторскому комитету; они не могут быть его членами — это нарушит их независимость.",
            },
            {
              key: "D",
              text_en: "Shareholders elected at the AGM",
              text_ru: "Акционеров, избранных на годовом общем собрании",
              why_wrong_en:
                "Audit committee members are appointed from among the existing board directors, not elected separately by shareholders.",
              why_wrong_ru:
                "Члены аудиторского комитета назначаются из числа уже избранных директоров совета, а не отдельно акционерами.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "The audit committee oversees the external audit, internal audit, and financial reporting on behalf of the board. It must be independent of executive management, so its members are independent non-executive directors. The chair is typically a NED with relevant financial experience.",
          explanation_ru:
            "Аудиторский комитет надзирает за внешним и внутренним аудитом и финансовой отчётностью от имени совета. Он должен быть независим от исполнительного руководства, поэтому его члены — независимые неисполнительные директора. Председатель — обычно NED с соответствующим финансовым опытом.",
        },
        // -------- NEW Q8 — easy short_answer on TARA --------
                {
          type: "mcq",
          difficulty: "easy",
          prompt_en: "In the TARA risk-response framework, which response means passing the financial consequences of a risk to another party, for example through insurance?",
          prompt_ru: "В модели реагирования на риски TARA какой ответ означает передачу финансовых последствий риска другой стороне, например через страхование?",
          options: [
            {
              key: "A",
              text_en: "Transfer",
              text_ru: "Передача (Transfer)",
            },
            {
              key: "B",
              text_en: "Avoid",
              text_ru: "Избежание (Avoid)",
              why_wrong_en: "Avoid means not undertaking the risky activity at all, not passing its consequences to a third party.",
              why_wrong_ru: "Избежание означает полный отказ от рискованной деятельности, а не передачу её последствий третьей стороне.",
            },
            {
              key: "C",
              text_en: "Reduce",
              text_ru: "Снижение (Reduce)",
              why_wrong_en: "Reduce means lowering the likelihood or impact through controls, while still retaining the risk yourself.",
              why_wrong_ru: "Снижение означает уменьшение вероятности или воздействия с помощью контролей, при этом риск остаётся у вас.",
            },
            {
              key: "D",
              text_en: "Accept",
              text_ru: "Принятие (Accept)",
              why_wrong_en: "Accept means tolerating the risk and its consequences without action, the opposite of transferring them.",
              why_wrong_ru: "Принятие означает терпимость к риску и его последствиям без действий — противоположность их передаче.",
            },
          ],
          correct_answer_en: "A",
          explanation_en: "TARA stands for Transfer, Avoid, Reduce, Accept. Transfer passes the financial consequences of a risk to another party — typically via insurance or by outsourcing the risky activity. The risk itself does not disappear; only its financial burden shifts.",
          explanation_ru: "TARA расшифровывается как Transfer (передача), Avoid (избежание), Reduce (снижение), Accept (принятие). Передача перекладывает финансовые последствия риска на другую сторону — обычно через страхование или аутсорсинг рискованной деятельности. Сам риск не исчезает; смещается лишь его финансовое бремя.",
        },
        // -------- NEW Q9 — medium MCQ on gross vs net risk --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A company\u2019s risk register shows a cyber-attack risk with an impact score of 9/10 and a likelihood of 8/10. After installing a firewall and staff training, the likelihood drops to 3/10. The impact rating of 9/10 with likelihood 8/10 represents:",
          prompt_ru:
            "Реестр рисков компании показывает риск кибератаки с оценкой воздействия 9/10 и вероятности 8/10. После установки межсетевого экрана и обучения сотрудников вероятность падает до 3/10. Сочетание воздействия 9/10 и вероятности 8/10 — это:",
          options: [
            {
              key: "A",
              text_en: "Net risk",
              text_ru: "Чистый риск",
              why_wrong_en:
                "Net (residual) risk is the score AFTER controls are applied — that would be 9/10 impact × 3/10 likelihood here, not the original 8/10.",
              why_wrong_ru:
                "Чистый (остаточный) риск — это оценка ПОСЛЕ применения контролей: здесь 9/10 × 3/10, а не исходная 8/10.",
            },
            { key: "B", text_en: "Gross risk", text_ru: "Валовый риск" },
            {
              key: "C",
              text_en: "Inherent variance",
              text_ru: "Внутренняя дисперсия",
              why_wrong_en:
                "This is not a standard risk-management term — it conflates statistical and risk vocabulary.",
              why_wrong_ru:
                "Это не стандартный термин риск-менеджмента — он смешивает статистическую и рисковую терминологию.",
            },
            {
              key: "D",
              text_en: "Residual risk",
              text_ru: "Остаточный риск",
              why_wrong_en:
                "Residual risk is another name for NET risk — the score AFTER controls; the question asks about the score BEFORE controls.",
              why_wrong_ru:
                "Остаточный риск — синоним чистого риска (ПОСЛЕ контролей); вопрос про оценку ДО контролей.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Gross risk is the risk score BEFORE controls are applied — the inherent exposure if nothing were done. Net (or residual) risk is the score AFTER controls have reduced impact, likelihood, or both. The difference shows how much value the controls add and helps prioritise where additional control investment is needed.",
          explanation_ru:
            "Валовый риск — это оценка риска ДО применения контролей, то есть исходная подверженность, если ничего не делать. Чистый (или остаточный) риск — оценка ПОСЛЕ того, как контроли снизили воздействие, вероятность или то и другое. Разница показывает, какую ценность дают контроли, и помогает определить, где нужны дополнительные инвестиции в контроль.",
        },
        // -------- NEW Q10 — medium MCQ on TARA scenario --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A small construction firm faces low-probability but catastrophic risk of injury claims. It buys a public liability insurance policy. Under TARA, this response is:",
          prompt_ru:
            "Небольшая строительная фирма сталкивается с маловероятным, но катастрофическим риском исков по травмам. Она покупает полис страхования ответственности перед третьими лицами. По модели TARA это реагирование:",
          options: [
            { key: "A", text_en: "Transfer", text_ru: "Transfer (передать)" },
            {
              key: "B",
              text_en: "Avoid",
              text_ru: "Avoid (избежать)",
              why_wrong_en:
                "Avoidance would mean stopping construction work altogether — insurance lets the firm continue while transferring financial impact.",
              why_wrong_ru:
                "Избегание означало бы прекращение строительных работ вообще — страхование позволяет продолжать работу, перенося финансовое воздействие.",
            },
            {
              key: "C",
              text_en: "Reduce",
              text_ru: "Reduce (снизить)",
              why_wrong_en:
                "Reduction would mean adding safety controls (helmets, training); insurance doesn't change the likelihood or impact, it shifts who pays.",
              why_wrong_ru:
                "Снижение означало бы добавление контроля безопасности (каски, обучение); страхование не меняет ни вероятность, ни последствия — оно меняет, кто платит.",
            },
            {
              key: "D",
              text_en: "Accept",
              text_ru: "Accept (принять)",
              why_wrong_en:
                "Acceptance means living with the consequences yourself; insurance specifically does the opposite — passes the consequences to the insurer.",
              why_wrong_ru:
                "Принятие означает нести последствия самостоятельно; страхование делает прямо противоположное — переносит последствия на страховщика.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Insurance is the classic risk transfer mechanism: the firm pays a predictable premium in exchange for the insurer bearing the financial impact of a rare but catastrophic event. The risk itself still exists, but its financial consequences shift to a party better equipped to absorb them.",
          explanation_ru:
            "Страхование — классический механизм передачи риска: компания платит предсказуемую премию, а страховщик принимает на себя финансовые последствия редкого, но катастрофического события. Сам риск никуда не девается, но его финансовые последствия переходят к стороне, лучше способной их выдержать.",
        },
        // -------- NEW Q11 — medium MCQ on money laundering stages --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            'A criminal deposits large amounts of cash into a casino, then withdraws the funds as a "winnings" cheque. Under the three-stage model of money laundering, this is:',
          prompt_ru:
            "Преступник вносит крупные суммы наличных в казино, затем снимает средства чеком на «выигрыш». В трёхстадийной модели отмывания денег это:",
          options: [
            { key: "A", text_en: "Placement", text_ru: "Размещение" },
            {
              key: "B",
              text_en: "Layering",
              text_ru: "Расслоение",
              why_wrong_en:
                "Layering involves multiple transactions designed to obscure the audit trail (e.g. wires through several countries); this scenario is a single conversion at entry point.",
              why_wrong_ru:
                "Расслоение — это множественные операции, скрывающие след (например, переводы через несколько стран); здесь же одна конвертация на входе.",
            },
            {
              key: "C",
              text_en: "Integration",
              text_ru: "Интеграция",
              why_wrong_en:
                "Integration is the final stage where laundered money returns as apparently legitimate income (e.g. property purchase); this is the entry point, not the exit.",
              why_wrong_ru:
                "Интеграция — финальная стадия, когда отмытые деньги возвращаются как якобы законный доход (например, покупка недвижимости); здесь же — точка входа, а не выхода.",
            },
            {
              key: "D",
              text_en: "Concealment",
              text_ru: "Сокрытие",
              why_wrong_en:
                "Concealment is not one of the three named stages; the established model uses placement, layering, and integration.",
              why_wrong_ru:
                "Сокрытие не входит в три названные стадии; стандартная модель — размещение, расслоение, интеграция.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Placement is the first stage of money laundering — getting illegal cash into the legitimate financial system. Casinos, cash-intensive businesses (e.g. car washes), and structured bank deposits are common placement methods. Once placed, the funds move to layering (obscuring the trail) and then integration (re-emerging as apparent legitimate income).",
          explanation_ru:
            "Размещение — первая стадия отмывания денег: ввод нелегальной наличности в легальную финансовую систему. Казино, кассоёмкие бизнесы (например, автомойки) и структурированные банковские вклады — типичные методы размещения. После размещения средства проходят расслоение (запутывание следа), а затем интеграцию (возврат под видом легального дохода).",
        },
        // -------- NEW Q12 — medium MCQ on MLRO role --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "In a firm subject to anti-money-laundering regulation, the Money Laundering Reporting Officer (MLRO) is primarily responsible for:",
          prompt_ru:
            "В компании, подпадающей под регулирование противодействия отмыванию, Money Laundering Reporting Officer (MLRO) в первую очередь отвечает за:",
          options: [
            {
              key: "A",
              text_en: "Conducting due diligence on every customer transaction",
              text_ru: "Проведение проверки каждой клиентской операции",
              why_wrong_en:
                "Customer due diligence is performed by front-line staff; the MLRO oversees the framework, not every individual check.",
              why_wrong_ru:
                "Проверку клиентов проводят сотрудники переднего фронта; MLRO курирует общий процесс, а не каждую отдельную проверку.",
            },
            {
              key: "B",
              text_en:
                "Receiving internal reports of suspicious activity and submitting external SARs",
              text_ru:
                "Получение внутренних сообщений о подозрительной активности и подача внешних сообщений (SAR)",
            },
            {
              key: "C",
              text_en: "Setting the company\u2019s strategic risk appetite",
              text_ru: "Установление стратегического риск-аппетита компании",
              why_wrong_en:
                "Risk appetite is a board-level decision; the MLRO operates within the framework the board sets, not by setting it.",
              why_wrong_ru:
                "Риск-аппетит — решение на уровне совета; MLRO действует в рамках, заданных советом, а не устанавливает их.",
            },
            {
              key: "D",
              text_en: "Preparing the financial statements",
              text_ru: "Подготовка финансовой отчётности",
              why_wrong_en:
                "Financial statement preparation is a finance/accounting role, unrelated to AML oversight.",
              why_wrong_ru:
                "Подготовка финансовой отчётности — задача финансово-учётного отдела, не связанная с AML.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "The MLRO is the senior individual within a regulated firm to whom employees report suspicions of money laundering. The MLRO then decides whether to escalate by filing a Suspicious Activity Report (SAR) with the relevant authority. The role exists to centralise judgement and create a clear escalation path.",
          explanation_ru:
            "MLRO — старшее лицо в регулируемой компании, которому сотрудники сообщают о подозрениях в отмывании денег. MLRO затем решает, нужно ли эскалировать вопрос путём подачи сообщения о подозрительной операции (SAR) в соответствующий орган. Роль централизует профессиональное суждение и создаёт чёткий путь эскалации.",
        },
        // -------- NEW Q13 — medium short_answer on GDPR --------
                {
          type: "mcq",
          difficulty: "medium",
          prompt_en: "Which of the following is one of the GDPR principles for processing personal data?",
          prompt_ru: "Какой из перечисленных пунктов является одним из принципов GDPR обработки персональных данных?",
          options: [
            {
              key: "A",
              text_en: "Data minimisation",
              text_ru: "Минимизация данных",
            },
            {
              key: "B",
              text_en: "Maximum retention",
              text_ru: "Максимальный срок хранения",
              why_wrong_en: "GDPR requires STORAGE LIMITATION — keeping data no longer than necessary — the opposite of maximising retention.",
              why_wrong_ru: "GDPR требует ОГРАНИЧЕНИЯ ХРАНЕНИЯ — не хранить данные дольше необходимого — это противоположность максимизации хранения.",
            },
            {
              key: "C",
              text_en: "Unrestricted processing",
              text_ru: "Неограниченная обработка",
              why_wrong_en: "GDPR requires a lawful basis and purpose limitation; processing is restricted, not unrestricted.",
              why_wrong_ru: "GDPR требует законного основания и ограничения цели; обработка ограничена, а не свободна.",
            },
            {
              key: "D",
              text_en: "Mandatory data sharing",
              text_ru: "Обязательный обмен данными",
              why_wrong_en: "GDPR restricts sharing and transfers; there is no principle requiring data to be shared.",
              why_wrong_ru: "GDPR ограничивает обмен и передачу данных; принципа, обязывающего делиться данными, нет.",
            },
          ],
          correct_answer_en: "A",
          explanation_en: "GDPR sets seven principles: lawful basis, purpose limitation, data minimisation, accuracy, storage limitation, integrity and security, and accountability. Data minimisation means collecting only what is genuinely needed for the stated purpose.",
          explanation_ru: "GDPR устанавливает семь принципов: законное основание, ограничение цели, минимизация данных, точность, ограничение хранения, целостность и безопасность, подотчётность. Минимизация данных означает сбор только того, что действительно необходимо для заявленной цели.",
        },
        // -------- NEW Q14 — hard MCQ on layering complexity --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            "A criminal moves $2m through 15 shell companies in 7 jurisdictions, each transaction structured to fall below local reporting thresholds, before consolidating the funds in a single bank account. This BEST illustrates:",
          prompt_ru:
            "Преступник проводит $2 млн через 15 фиктивных компаний в 7 юрисдикциях, каждая операция структурирована ниже местных порогов отчётности, после чего средства консолидируются на одном банковском счёте. Это ЛУЧШЕ всего иллюстрирует:",
          options: [
            {
              key: "A",
              text_en: "Placement only",
              text_ru: "Только размещение",
              why_wrong_en:
                "Placement is getting cash INTO the system; this scenario describes movement WITHIN it across many intermediaries.",
              why_wrong_ru:
                "Размещение — это ввод наличных В систему; здесь же описано движение ВНУТРИ системы через множество посредников.",
            },
            { key: "B", text_en: "Layering", text_ru: "Расслоение" },
            {
              key: "C",
              text_en: "Integration only",
              text_ru: "Только интеграция",
              why_wrong_en:
                "Integration is the final return of funds as apparently legitimate income (e.g. property, business revenue); the scenario stops at the consolidated bank account, before integration.",
              why_wrong_ru:
                "Интеграция — финальный возврат средств как якобы законного дохода (недвижимость, выручка бизнеса); сценарий заканчивается на консолидированном счёте, до интеграции.",
            },
            {
              key: "D",
              text_en: "A straightforward Suspicious Activity Report case",
              text_ru:
                "Простой случай для подачи сообщения о подозрительной операции",
              why_wrong_en:
                "The question asks for the laundering STAGE; SAR-filing is the response, not the technique being illustrated.",
              why_wrong_ru:
                "Вопрос — о СТАДИИ отмывания; подача SAR — это реакция, а не описываемая техника.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Layering is the deliberate creation of complex transaction chains designed to obscure the audit trail. Hallmarks include: multiple jurisdictions (cross-border investigation friction), shell companies (no real economic substance), structured amounts below reporting thresholds (each individually too small to trigger automatic flagging), and ultimately consolidation in a clean-looking account. The complexity is the point.",
          explanation_ru:
            "Расслоение — это намеренное создание сложных цепочек операций, призванных запутать след. Характерные признаки: множество юрисдикций (создаёт препятствия трансграничному расследованию), фиктивные компании (без реальной экономической сути), суммы, структурированные ниже порогов отчётности (каждая в отдельности слишком мала, чтобы автоматически попасть в систему), и в итоге консолидация на внешне чистом счёте. Сложность — это и есть цель.",
        },
        // -------- NEW Q15 — hard MCQ on whistleblowing + AML scenario --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            "An accountant notices that a long-standing client has begun making large unexplained cash deposits. The accountant has no concrete evidence of wrongdoing but has serious concerns. The MOST appropriate first action is:",
          prompt_ru:
            "Бухгалтер замечает, что давний клиент начал делать крупные необъяснимые поступления наличными. Конкретных доказательств нарушения у бухгалтера нет, но есть серьёзные опасения. НАИБОЛЕЕ подходящее первое действие:",
          options: [
            {
              key: "A",
              text_en:
                "Immediately confront the client and demand an explanation",
              text_ru: "Немедленно открыто потребовать у клиента объяснений",
              why_wrong_en:
                'This constitutes "tipping off" — alerting a potential launderer that they are under suspicion, which is itself a criminal offence in most AML regimes.',
              why_wrong_ru:
                "Это «уведомление» — предупреждение возможного нарушителя о подозрениях, что в большинстве AML-режимов само является уголовным правонарушением.",
            },
            {
              key: "B",
              text_en:
                "Report the suspicion internally to the firm\u2019s MLRO",
              text_ru: "Сообщить о подозрении внутри фирмы своему MLRO",
            },
            {
              key: "C",
              text_en: "Resign from the engagement and walk away quietly",
              text_ru: "Отказаться от задания и тихо уйти",
              why_wrong_en:
                "Resignation without reporting leaves the suspicion unaddressed and may itself trigger reporting obligations the accountant cannot ignore.",
              why_wrong_ru:
                "Уход без сообщения оставляет подозрение неурегулированным и сам по себе может породить обязанности по подаче сведений, от которых нельзя уклониться.",
            },
            {
              key: "D",
              text_en: "Wait for stronger evidence before doing anything",
              text_ru:
                "Дождаться более веских доказательств, прежде чем что-либо делать",
              why_wrong_en:
                "AML rules require reporting of SUSPICION, not proof — the legal threshold is deliberately low because front-line staff cannot conduct criminal investigations.",
              why_wrong_ru:
                "Правила AML требуют сообщать о ПОДОЗРЕНИИ, а не о доказательствах — юридический порог намеренно занижен, потому что сотрудники переднего фронта не ведут уголовных расследований.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            'The correct response under AML regulation is internal escalation to the MLRO, who decides whether to file a Suspicious Activity Report. Two important elements: the threshold is "suspicion", not proof; and the accountant must NOT tip off the client (a separate offence). This protects the accountant from personal liability and channels the judgement to a single accountable person within the firm.',
          explanation_ru:
            "Правильная реакция по правилам AML — внутренняя эскалация в адрес MLRO, который решает, подавать ли сообщение о подозрительной операции. Два важных момента: порог — это «подозрение», а не доказательство; и бухгалтер НЕ должен «уведомлять» клиента (это отдельное правонарушение). Это защищает бухгалтера от личной ответственности и направляет суждение единому подотчётному лицу внутри фирмы.",
        },
      ],
    },
    // ---------- D ----------
    {
      code: "D",
      title_en: "Leadership and management",
      title_ru: "Лидерство и менеджмент",
      description_en:
        "Motivation theories, team development, leadership styles, and HR.",
      description_ru:
        "Теории мотивации, развитие команд, стили лидерства и управление персоналом.",
      sort_order: 40,
      theory_en:
        "Management is the work of planning, organising, directing and controlling; leadership is the work of inspiring and influencing people to follow. The two overlap but aren't identical — a great manager may not lead, and a strong leader may not administer.\n\n" +
        "Motivation theories split into content theories (what people want) and process theories (how motivation forms). Maslow's hierarchy ranks needs from physiological → safety → social → esteem → self-actualisation; higher needs only motivate once lower ones are met. Herzberg distinguishes hygiene factors (pay, conditions, supervision — their absence demotivates but their presence doesn't motivate) from motivators (achievement, recognition, growth — the true sources of satisfaction). McGregor contrasts Theory X (workers are lazy, need coercion) and Theory Y (workers are self-motivated, seek responsibility). Vroom's expectancy theory: motivation = expectancy × instrumentality × valence — i.e. effort leads to performance, performance leads to reward, and the reward is valued.\n\n" +
        "Teams pass through Tuckman's stages — forming (polite, uncertain), storming (conflict over roles), norming (rules and trust established), performing (effective output), adjourning (team disbands). Belbin identifies nine team roles (e.g. plant — creative; shaper — driving; completer-finisher — detail-focused); balanced teams cover all roles.\n\n" +
        "Leadership styles span autocratic (leader decides), democratic (decisions are shared), and laissez-faire (minimal direction). Blake & Mouton's managerial grid plots concern for production against concern for people, with 9,9 (\"team management\") considered ideal. Hersey & Blanchard's situational leadership matches style to follower readiness: telling, selling, participating, delegating. Transformational leaders inspire change through vision; transactional leaders motivate through reward and correction. Fayol described five managerial functions: plan, organise, command, coordinate, control.\n\n" +
        "HR fundamentals: a job description sets out duties; a person specification sets out the qualities the role demands. Selection uses interviews (structured, panel, competency-based), psychometric tests, and references.",
      theory_ru:
        "Менеджмент — это планирование, организация, руководство и контроль; лидерство — вдохновение и влияние, побуждающее людей идти за лидером. Эти роли пересекаются, но не тождественны: хороший менеджер может не быть лидером, а сильный лидер — не уметь администрировать.\n\n" +
        "Теории мотивации делятся на содержательные (что нужно человеку) и процессуальные (как формируется мотивация). Иерархия Маслоу выстраивает потребности по уровням: физиологические → безопасность → социальные → уважение → самоактуализация; более высокие потребности мотивируют только после удовлетворения нижних. Герцберг разделяет гигиенические факторы (зарплата, условия, надзор — их отсутствие демотивирует, но наличие не мотивирует) и мотиваторы (достижение, признание, рост — настоящие источники удовлетворённости). Макгрегор противопоставляет Теорию X (работники ленивы, нуждаются в принуждении) и Теорию Y (работники самомотивированы, стремятся к ответственности). Теория ожиданий Врума: мотивация = ожидание × инструментальность × валентность — то есть усилие ведёт к результату, результат ведёт к вознаграждению, и вознаграждение ценится.\n\n" +
        "Команды проходят стадии Такмена — формирование (вежливость, неопределённость), бурление (конфликты по ролям), нормирование (установление правил и доверия), функционирование (эффективная работа), завершение (распад команды). Белбин выделяет девять ролей в команде (например, генератор идей — креативная; формирователь — двигающий; финишёр — внимателен к деталям); сбалансированные команды покрывают все роли.\n\n" +
        "Стили лидерства простираются от авторитарного (решает лидер), демократического (решения принимаются совместно) до либерального (минимум указаний). Управленческая решётка Блейка и Моутон сопоставляет заботу о производстве и заботу о людях; вариант 9,9 («командное управление») считается идеалом. Ситуационное лидерство Херси и Бланшара подбирает стиль под зрелость подчинённого: указание, продажа, участие, делегирование. Трансформационные лидеры вдохновляют через видение; транзакционные — мотивируют через вознаграждение и коррекцию. Файоль описал пять функций менеджера: планирование, организация, распорядительство, координация, контроль.\n\n" +
        "Основы HR: должностная инструкция описывает обязанности; профиль должности (person specification) описывает требования к качествам кандидата. Отбор использует собеседования (структурированные, панельные, по компетенциям), психометрические тесты и рекомендации.",
      questions: [
        // -------- existing Q1 (augmented) --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "According to Maslow\u2019s hierarchy of needs, which need is HIGHEST in the hierarchy?",
          prompt_ru:
            "Согласно иерархии потребностей Маслоу, какая потребность находится НА САМОМ ВЕРХУ?",
          options: [
            {
              key: "A",
              text_en: "Physiological",
              text_ru: "Физиологические",
              why_wrong_en:
                "Physiological needs (food, shelter) are at the BASE of the hierarchy, not the top.",
              why_wrong_ru:
                "Физиологические потребности (еда, кров) находятся в ОСНОВАНИИ иерархии, а не на вершине.",
            },
            {
              key: "B",
              text_en: "Safety",
              text_ru: "Безопасность",
              why_wrong_en:
                "Safety is the SECOND level, just above physiological — not the top.",
              why_wrong_ru:
                "Безопасность — это ВТОРОЙ уровень над физиологическими, а не верхний.",
            },
            {
              key: "C",
              text_en: "Esteem",
              text_ru: "Уважение",
              why_wrong_en:
                "Esteem is the FOURTH level — one rung below the top.",
              why_wrong_ru:
                "Уважение — это ЧЕТВЁРТЫЙ уровень, на одну ступень ниже вершины.",
            },
            {
              key: "D",
              text_en: "Self-actualisation",
              text_ru: "Самоактуализация",
            },
          ],
          correct_answer_en: "D",
          explanation_en:
            "Maslow\u2019s pyramid runs physiological → safety → love/belonging → esteem → self-actualisation at the top.",
          explanation_ru:
            "Пирамида Маслоу: физиологические → безопасность → принадлежность → уважение → самоактуализация на вершине.",
        },
        // -------- existing Q2 (augmented) --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "Herzberg\u2019s two-factor theory classifies salary as a:",
          prompt_ru:
            "В двухфакторной теории Герцберга заработная плата относится к:",
          options: [
            {
              key: "A",
              text_en: "Motivator",
              text_ru: "Мотиватору",
              why_wrong_en:
                "Motivators are intrinsic (achievement, recognition, growth); salary is extrinsic, addressing dissatisfaction rather than driving satisfaction.",
              why_wrong_ru:
                "Мотиваторы — внутренние (достижение, признание, рост); зарплата — внешний фактор, устраняющий недовольство, а не порождающий удовлетворение.",
            },
            {
              key: "B",
              text_en: "Hygiene factor",
              text_ru: "Гигиеническому фактору",
            },
            {
              key: "C",
              text_en: "Self-actualisation need",
              text_ru: "Потребности самоактуализации",
              why_wrong_en:
                "Self-actualisation is from Maslow, not Herzberg — the question asks about Herzberg's classification.",
              why_wrong_ru:
                "Самоактуализация — из теории Маслоу, а не Герцберга; вопрос — о классификации Герцберга.",
            },
            {
              key: "D",
              text_en: "Trait of charismatic leadership",
              text_ru: "Черте харизматического лидерства",
              why_wrong_en:
                "Charismatic leadership is a separate leadership-theory concept, unrelated to Herzberg's motivation theory.",
              why_wrong_ru:
                "Харизматическое лидерство — отдельная концепция теории лидерства, не связанная с теорией мотивации Герцберга.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Salary is a hygiene (maintenance) factor: inadequate pay demotivates, but generous pay does not by itself create lasting motivation. Motivators are intrinsic (achievement, recognition, growth).",
          explanation_ru:
            "Зарплата — гигиенический (поддерживающий) фактор: недостаточная оплата демотивирует, но щедрая сама по себе не создаёт устойчивой мотивации. Мотиваторы носят внутренний характер (достижение, признание, рост).",
        },
        // -------- existing Q3 (short_answer, unchanged) --------
                {
          type: "mcq",
          difficulty: "easy",
          prompt_en: "In Tuckman's model of team development, which stage is characterised by conflict as members assert their roles and ideas?",
          prompt_ru: "На каком этапе модели развития команды Такмана возникает конфликт, когда участники отстаивают свои роли и идеи?",
          options: [
            {
              key: "A",
              text_en: "Storming",
              text_ru: "Конфликт (Storming)",
            },
            {
              key: "B",
              text_en: "Forming",
              text_ru: "Формирование (Forming)",
              why_wrong_en: "Forming is the polite, tentative first stage where members get acquainted; open conflict has not yet emerged.",
              why_wrong_ru: "Формирование — вежливый, осторожный первый этап знакомства; открытого конфликта ещё нет.",
            },
            {
              key: "C",
              text_en: "Norming",
              text_ru: "Нормирование (Norming)",
              why_wrong_en: "Norming is when the team RESOLVES conflict and agrees shared ways of working — it follows storming.",
              why_wrong_ru: "Нормирование — когда команда РАЗРЕШАЕТ конфликт и согласует общие правила работы; следует за конфликтом.",
            },
            {
              key: "D",
              text_en: "Performing",
              text_ru: "Функционирование (Performing)",
              why_wrong_en: "Performing is the mature stage of effective, low-friction delivery, well after the conflict stage.",
              why_wrong_ru: "Функционирование — зрелый этап эффективной работы с малым трением, наступающий значительно позже стадии конфликта.",
            },
          ],
          correct_answer_en: "A",
          explanation_en: "Tuckman's sequence is forming → storming → norming → performing (→ adjourning). Storming is where individual personalities and ideas clash before the team settles into shared norms.",
          explanation_ru: "Последовательность Такмана: формирование → конфликт → нормирование → функционирование (→ расформирование). На стадии конфликта сталкиваются личности и идеи, прежде чем команда выработает общие нормы.",
        },
        // -------- existing Q4 (augmented) --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en: 'A "transformational" leader is BEST characterised by:',
          prompt_ru:
            "«Трансформационный» лидер ЛУЧШЕ всего характеризуется как:",
          options: [
            {
              key: "A",
              text_en: "Strict rule enforcement",
              text_ru: "Жёстким соблюдением правил",
              why_wrong_en:
                "Rule enforcement is closer to a bureaucratic or transactional style; transformational leaders work through inspiration, not rules.",
              why_wrong_ru:
                "Соблюдение правил ближе к бюрократическому или транзакционному стилю; трансформационные лидеры действуют через вдохновение, а не правила.",
            },
            {
              key: "B",
              text_en: "Inspiring followers towards a shared vision of change",
              text_ru: "Вдохновением последователей к общему видению изменений",
            },
            {
              key: "C",
              text_en: "Avoiding decisions",
              text_ru: "Избеганием решений",
              why_wrong_en:
                "Avoiding decisions characterises laissez-faire leadership; transformational is the opposite — actively shaping direction.",
              why_wrong_ru:
                "Избегание решений характерно для либерального стиля; трансформационный — противоположность: активно задаёт направление.",
            },
            {
              key: "D",
              text_en: "Pure transactional reward/punishment",
              text_ru: "Чисто транзакционной системой наград и наказаний",
              why_wrong_en:
                "Transactional and transformational are DEFINED in contrast to each other — transactional is what transformational is NOT.",
              why_wrong_ru:
                "Транзакционный и трансформационный стили ОПРЕДЕЛЕНЫ через противопоставление; транзакционный — это то, чем трансформационный НЕ является.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Transformational leaders inspire and motivate followers to exceed expectations by appealing to higher ideals and shared vision, in contrast to transactional leaders who exchange rewards for performance.",
          explanation_ru:
            "Трансформационные лидеры вдохновляют последователей превзойти ожидания, обращаясь к высшим идеалам и общему видению, в отличие от транзакционных, которые обменивают вознаграждение на результат.",
        },
        // -------- existing Q5 (augmented) --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            'On Blake and Mouton\u2019s managerial grid, a "9,1" position represents:',
          prompt_ru:
            "На управленческой решётке Блейка и Мутон позиция «9,1» представляет собой:",
          options: [
            {
              key: "A",
              text_en: "Country club management — high people, low task",
              text_ru:
                "Управление «загородный клуб» — высокий упор на людей, низкий на задачи",
              why_wrong_en:
                "Country club is (1,9), with the order reversed — high on people, low on task. Here the question is about (9,1).",
              why_wrong_ru:
                "«Загородный клуб» — это (1,9) с обратным порядком: высокий упор на людей, низкий на задачи. Вопрос же о (9,1).",
            },
            {
              key: "B",
              text_en: "Team management — high on both",
              text_ru: "Командный менеджмент — высокий и там, и там",
              why_wrong_en:
                "Team management is (9,9) — high on BOTH dimensions; (9,1) is unbalanced.",
              why_wrong_ru:
                "Командный менеджмент — это (9,9) с высоким значением на ОБЕИХ осях; (9,1) — несбалансированная позиция.",
            },
            {
              key: "C",
              text_en: "Authority-compliance — high task, low people",
              text_ru:
                "Авторитет и подчинение — высокий упор на задачи, низкий на людей",
            },
            {
              key: "D",
              text_en: "Impoverished management — low on both",
              text_ru: "Обеднённый менеджмент — низкий и там, и там",
              why_wrong_en:
                "Impoverished management is (1,1) — low on BOTH dimensions; (9,1) has maximum task concern.",
              why_wrong_ru:
                "Обеднённый менеджмент — это (1,1), низкий на ОБЕИХ осях; (9,1) — максимум по производству.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "The grid uses concern-for-production (X) by concern-for-people (Y), each from 1 to 9. (9,1) is maximum concern for production with minimum concern for people — the authority-compliance style.",
          explanation_ru:
            "Решётка использует две оси (1–9): забота о производстве (X) и забота о людях (Y). (9,1) — максимальная забота о производстве и минимальная о людях, стиль «авторитет и подчинение».",
        },
        // -------- NEW Q6 — easy MCQ on McGregor --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "A manager who believes employees naturally seek responsibility and need only minimal supervision holds which view, according to McGregor?",
          prompt_ru:
            "Менеджер, считающий, что сотрудники естественно стремятся к ответственности и нуждаются лишь в минимальном надзоре, придерживается какого взгляда по Макгрегору?",
          options: [
            {
              key: "A",
              text_en: "Theory X",
              text_ru: "Теория X",
              why_wrong_en:
                "Theory X assumes workers DISLIKE work, avoid responsibility, and need coercion — the opposite of the manager described.",
              why_wrong_ru:
                "Теория X предполагает, что работники НЕ ЛЮБЯТ работу, избегают ответственности и нуждаются в принуждении — противоположно описанному менеджеру.",
            },
            { key: "B", text_en: "Theory Y", text_ru: "Теория Y" },
            {
              key: "C",
              text_en: "Theory Z",
              text_ru: "Теория Z",
              why_wrong_en:
                "Theory Z (Ouchi) is a later extension drawing on Japanese management practices; the question asks about McGregor's original dichotomy.",
              why_wrong_ru:
                "Теория Z (Оучи) — более позднее расширение, опирающееся на японские управленческие практики; вопрос — об оригинальной дихотомии Макгрегора.",
            },
            {
              key: "D",
              text_en: "Theory X-Y hybrid",
              text_ru: "Гибрид Теории X-Y",
              why_wrong_en:
                'McGregor presented X and Y as opposing assumptions a manager makes; there is no formal "hybrid" in his framework.',
              why_wrong_ru:
                "Макгрегор представил X и Y как противоположные допущения менеджера; формального «гибрида» в его модели нет.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "McGregor argued managers operate on one of two assumptions. Theory X: people inherently dislike work, avoid responsibility, and must be controlled. Theory Y: people find work as natural as rest, accept and seek responsibility, and are self-motivated. The manager described holds Theory Y assumptions.",
          explanation_ru:
            "Макгрегор утверждал, что менеджеры исходят из одного из двух допущений. Теория X: люди не любят работу, избегают ответственности, их нужно контролировать. Теория Y: для людей работа естественна как отдых, они принимают и ищут ответственность, мотивированы изнутри. Описанный менеджер придерживается Теории Y.",
        },
        // -------- NEW Q7 — easy MCQ on autocratic style --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "A leadership style where the leader makes all decisions alone and tells subordinates exactly what to do is BEST described as:",
          prompt_ru:
            "Стиль лидерства, при котором лидер принимает все решения единолично и точно указывает подчинённым, что делать, ЛУЧШЕ всего описать как:",
          options: [
            { key: "A", text_en: "Autocratic", text_ru: "Авторитарный" },
            {
              key: "B",
              text_en: "Democratic",
              text_ru: "Демократический",
              why_wrong_en:
                "Democratic leaders involve subordinates in decision-making; this scenario describes unilateral decisions.",
              why_wrong_ru:
                "Демократические лидеры вовлекают подчинённых в принятие решений; в сценарии — единоличные решения.",
            },
            {
              key: "C",
              text_en: "Laissez-faire",
              text_ru: "Либеральный",
              why_wrong_en:
                "Laissez-faire leaders give minimal direction; this scenario describes detailed direction.",
              why_wrong_ru:
                "Либеральные лидеры дают минимум указаний; в сценарии — детальные указания.",
            },
            {
              key: "D",
              text_en: "Transformational",
              text_ru: "Трансформационный",
              why_wrong_en:
                'Transformational leaders inspire through vision rather than command; "telling exactly what to do" is the wrong vibe.',
              why_wrong_ru:
                "Трансформационные лидеры вдохновляют видением, а не командами; «точно указывать, что делать» — другая модель.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Autocratic (authoritarian) leadership concentrates decision-making with the leader; subordinates receive instructions and execute. It can be effective in crises or with inexperienced teams but tends to suppress initiative and reduce engagement over time.",
          explanation_ru:
            "Авторитарный стиль концентрирует принятие решений на лидере; подчинённые получают указания и исполняют. Эффективен в кризисе или с неопытной командой, но со временем подавляет инициативу и снижает вовлечённость.",
        },
        // -------- NEW Q8 — easy short_answer on Fayol --------
                {
          type: "mcq",
          difficulty: "easy",
          prompt_en: "Which of the following is one of Henri Fayol's five functions of management?",
          prompt_ru: "Какой из перечисленных пунктов является одной из пяти функций управления по Анри Файолю?",
          options: [
            {
              key: "A",
              text_en: "Coordinate",
              text_ru: "Координировать",
            },
            {
              key: "B",
              text_en: "Motivate",
              text_ru: "Мотивировать",
              why_wrong_en: "Motivation is a theme of later behavioural writers (e.g. Maslow, Herzberg); Fayol's five functions are plan, organise, command, coordinate, control.",
              why_wrong_ru: "Мотивация — тема более поздних поведенческих авторов (Маслоу, Герцберг); пять функций Файоля — планировать, организовывать, командовать, координировать, контролировать.",
            },
            {
              key: "C",
              text_en: "Innovate",
              text_ru: "Внедрять инновации",
              why_wrong_en: "Innovation is not one of Fayol's classical functions; his five are plan, organise, command, coordinate, control.",
              why_wrong_ru: "Инновации не входят в классические функции Файоля; его пять — планировать, организовывать, командовать, координировать, контролировать.",
            },
            {
              key: "D",
              text_en: "Delegate",
              text_ru: "Делегировать",
              why_wrong_en: "Delegation is a management technique, not one of Fayol's five named functions (plan, organise, command, coordinate, control).",
              why_wrong_ru: "Делегирование — управленческий приём, а не одна из пяти названных функций Файоля (планировать, организовывать, командовать, координировать, контролировать).",
            },
          ],
          correct_answer_en: "A",
          explanation_en: "Fayol identified five functions of management: Plan, Organise, Command, Coordinate, and Control. Coordinate means harmonising the activities and efforts of different parts of the organisation toward common objectives.",
          explanation_ru: "Файоль выделил пять функций управления: планировать, организовывать, командовать, координировать и контролировать. Координировать — значит согласовывать действия и усилия разных частей организации для достижения общих целей.",
        },
        // -------- NEW Q9 — medium MCQ on Vroom expectancy --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "Under Vroom\u2019s expectancy theory, motivation will be LOW even with high effort and high performance if:",
          prompt_ru:
            "По теории ожиданий Врума мотивация будет НИЗКОЙ даже при высоком усилии и высоком результате, если:",
          options: [
            {
              key: "A",
              text_en:
                "The employee does not value the offered reward (low valence)",
              text_ru:
                "Сотрудник не ценит предлагаемую награду (низкая валентность)",
            },
            {
              key: "B",
              text_en: "The pay is at market rate",
              text_ru: "Оплата на уровне рынка",
              why_wrong_en:
                "Market-rate pay is hygiene-factor territory (Herzberg); Vroom's framework is about the perceived value of rewards, not their absolute level.",
              why_wrong_ru:
                "Рыночный уровень оплаты — это область гигиенических факторов (Герцберг); Врум же — о воспринимаемой ценности награды, а не её абсолютной величине.",
            },
            {
              key: "C",
              text_en: "The manager is autocratic",
              text_ru: "Менеджер авторитарен",
              why_wrong_en:
                "Leadership style is a separate concept; Vroom focuses on the effort-performance-reward chain in the individual's perception.",
              why_wrong_ru:
                "Стиль лидерства — отдельная концепция; Врум фокусируется на цепочке усилие-результат-награда в восприятии самого работника.",
            },
            {
              key: "D",
              text_en: "The team is in the storming phase",
              text_ru: "Команда находится на стадии шторминга",
              why_wrong_en:
                "Tuckman's team-development stages are unrelated to Vroom's individual-motivation framework.",
              why_wrong_ru:
                "Стадии развития команды по Такмену не связаны с моделью индивидуальной мотивации Врума.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            'Vroom\'s formula: Motivation = Expectancy × Instrumentality × Valence. Expectancy is "effort leads to performance"; instrumentality is "performance leads to reward"; valence is "I value this reward". If ANY of the three is zero, motivation is zero — even if the other two are maxed out. A high-effort, high-performance employee will not be motivated if the reward is something they don\'t want.',
          explanation_ru:
            "Формула Врума: Мотивация = Ожидание × Инструментальность × Валентность. Ожидание — «усилие даст результат»; инструментальность — «результат даст награду»; валентность — «эта награда для меня ценна». Если ХОТЯ БЫ ОДИН из трёх множителей равен нулю, мотивация ноль — даже при максимуме двух остальных. Сотрудник с высоким усилием и результатом не будет мотивирован, если предлагаемая награда ему не нужна.",
        },
        // -------- NEW Q10 — medium MCQ on Tuckman scenario --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A new project team has just been formed. Members are polite, somewhat reserved, and waiting for direction from the leader. According to Tuckman, this team is in which stage?",
          prompt_ru:
            "Только что сформирована проектная команда. Участники вежливы, несколько сдержанны и ждут указаний от лидера. По Такмену, на какой стадии находится команда?",
          options: [
            { key: "A", text_en: "Forming", text_ru: "Формирование" },
            {
              key: "B",
              text_en: "Storming",
              text_ru: "Шторминг",
              why_wrong_en:
                "Storming is marked by conflict and clashes over roles; the team described is still polite and uncertain — earlier than storming.",
              why_wrong_ru:
                "Для шторминга характерны конфликты и столкновения по ролям; описанная команда вежлива и неуверенна — раньше шторминга.",
            },
            {
              key: "C",
              text_en: "Norming",
              text_ru: "Нормирование",
              why_wrong_en:
                "Norming requires established trust and agreed ways of working; a brand-new team waiting for direction hasn't reached this.",
              why_wrong_ru:
                "Нормирование требует установленного доверия и согласованных способов работы; только что собранная команда, ожидающая указаний, этого не достигла.",
            },
            {
              key: "D",
              text_en: "Performing",
              text_ru: "Выполнение",
              why_wrong_en:
                "Performing is the productive stage with independent, autonomous work; this team has not yet started producing anything.",
              why_wrong_ru:
                "Выполнение — продуктивная стадия с самостоятельной работой; эта команда ещё ничего не производит.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Forming is the initial stage: members come together with polite uncertainty, dependent on the leader for direction, focused on understanding the task and one another. Conflict has not yet emerged because roles haven't been challenged. The leader must provide clear direction at this point.",
          explanation_ru:
            "Формирование — начальная стадия: участники собираются с вежливой неуверенностью, зависят от лидера в указаниях, сосредоточены на понимании задачи и друг друга. Конфликт ещё не возник, потому что роли пока не оспариваются. На этом этапе лидер должен давать чёткие указания.",
        },
        // -------- NEW Q11 — medium MCQ on Belbin --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            'In Belbin\u2019s team roles, the "completer-finisher" is BEST characterised by:',
          prompt_ru:
            "В ролях команды по Белбину «финишёр» ЛУЧШЕ всего характеризуется как:",
          options: [
            {
              key: "A",
              text_en: "Generating creative ideas and unconventional solutions",
              text_ru: "Генерация креативных идей и нестандартных решений",
              why_wrong_en:
                'This describes the "plant" (creative thinker), not the completer-finisher.',
              why_wrong_ru:
                "Это описание роли «генератор идей» (plant), а не финишёра.",
            },
            {
              key: "B",
              text_en: "Driving the team forward with energy and challenge",
              text_ru: "Двигает команду вперёд энергией и вызовом",
              why_wrong_en:
                'This describes the "shaper", whose job is to push for action and overcome obstacles.',
              why_wrong_ru:
                "Это описание роли «формирователь» (shaper): подталкивает к действию и преодолевает препятствия.",
            },
            {
              key: "C",
              text_en:
                "Ensuring nothing is overlooked and meeting deadlines through attention to detail",
              text_ru:
                "Обеспечивает, чтобы ничего не было упущено, и соблюдает сроки за счёт внимания к деталям",
            },
            {
              key: "D",
              text_en: "Coordinating others and clarifying goals",
              text_ru: "Координирует других и проясняет цели",
              why_wrong_en:
                'This describes the "coordinator" (chairman role), focused on aligning team effort.',
              why_wrong_ru:
                "Это описание роли «координатор» (coordinator), сфокусированной на согласовании усилий команды.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "The completer-finisher is the detail-oriented team member who scrutinises work for errors and omissions, polishes deliverables, and ensures deadlines are met. Their value is in the final phase of any project; without one, teams can struggle to actually finish work to standard.",
          explanation_ru:
            "Финишёр — детально-ориентированный участник команды, проверяющий работу на ошибки и упущения, доводящий результаты до совершенства и обеспечивающий соблюдение сроков. Его ценность раскрывается на финальной стадии любого проекта; без него команды часто не могут довести работу до стандарта.",
        },
        // -------- NEW Q12 — medium MCQ on Hersey-Blanchard --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "Under Hersey and Blanchard\u2019s situational leadership, an experienced and self-motivated team member is BEST led using which style?",
          prompt_ru:
            "По ситуационному лидерству Херси и Бланшара опытным и самомотивированным сотрудником ЛУЧШЕ всего руководить через какой стиль?",
          options: [
            {
              key: "A",
              text_en: "Telling — high task, low relationship",
              text_ru: "Указание — высокая задача, низкие отношения",
              why_wrong_en:
                "Telling fits low-readiness followers who need detailed instructions; an experienced self-motivated member doesn't need this.",
              why_wrong_ru:
                "Указание подходит для подчинённых низкой готовности, которым нужны подробные инструкции; опытному самомотивированному сотруднику это не нужно.",
            },
            {
              key: "B",
              text_en: "Selling — high task, high relationship",
              text_ru: "Продажа — высокая задача, высокие отношения",
              why_wrong_en:
                "Selling fits followers willing but unable — needing both explanation and encouragement; the scenario is someone fully able.",
              why_wrong_ru:
                "Продажа подходит для подчинённых, желающих, но неспособных, — им нужны и объяснение, и поддержка; в сценарии — полностью способный сотрудник.",
            },
            {
              key: "C",
              text_en: "Participating — low task, high relationship",
              text_ru: "Участие — низкая задача, высокие отношения",
              why_wrong_en:
                "Participating fits able but unwilling/unsure followers; the scenario is both able AND motivated.",
              why_wrong_ru:
                "Участие подходит для способных, но не желающих/неуверенных подчинённых; в сценарии сотрудник И способен, И мотивирован.",
            },
            {
              key: "D",
              text_en: "Delegating — low task, low relationship",
              text_ru: "Делегирование — низкая задача, низкие отношения",
            },
          ],
          correct_answer_en: "D",
          explanation_en:
            "Hersey and Blanchard match leadership style to follower readiness. High readiness (able + willing) calls for delegating: the leader hands over responsibility with minimal task direction and minimal hand-holding. Over-managing high-readiness staff demotivates them.",
          explanation_ru:
            "Херси и Бланшар подбирают стиль лидерства под зрелость подчинённого. Высокая зрелость (способен и мотивирован) требует делегирования: лидер передаёт ответственность с минимумом указаний и минимумом «опеки». Чрезмерное управление зрелым сотрудником его демотивирует.",
        },
        // -------- NEW Q13 — medium short_answer on person spec --------
                {
          type: "mcq",
          difficulty: "medium",
          prompt_en: "What is the key difference between a job description and a person specification?",
          prompt_ru: "В чём ключевое различие между должностной инструкцией и профилем кандидата?",
          options: [
            {
              key: "A",
              text_en: "A job description sets out the duties of the ROLE; a person specification sets out the qualities required of the POSTHOLDER",
              text_ru: "Должностная инструкция описывает обязанности ДОЛЖНОСТИ; профиль кандидата описывает качества, требуемые от РАБОТНИКА",
            },
            {
              key: "B",
              text_en: "A job description is for permanent staff; a person specification is for temporary staff",
              text_ru: "Должностная инструкция — для постоянных сотрудников; профиль кандидата — для временных",
              why_wrong_en: "Both documents apply regardless of contract type; the distinction is role-focused vs person-focused, not permanent vs temporary.",
              why_wrong_ru: "Оба документа применяются независимо от типа контракта; различие — «о должности» против «о человеке», а не «постоянный» против «временного».",
            },
            {
              key: "C",
              text_en: "A job description is written by HR; a person specification is written by the candidate",
              text_ru: "Должностную инструкцию пишет HR; профиль кандидата пишет сам кандидат",
              why_wrong_en: "Both are prepared by the employer/HR; candidates do not write the person specification.",
              why_wrong_ru: "Оба документа готовит работодатель/HR; кандидат профиль не пишет.",
            },
            {
              key: "D",
              text_en: "They are two names for the same document",
              text_ru: "Это два названия одного и того же документа",
              why_wrong_en: "They are distinct documents: one describes the job's duties, the other the attributes a suitable postholder needs.",
              why_wrong_ru: "Это разные документы: один описывает обязанности должности, другой — качества, нужные подходящему работнику.",
            },
          ],
          correct_answer_en: "A",
          explanation_en: "A job description answers \"what does the role involve?\" — duties, responsibilities, reporting lines. A person specification answers \"who do we need?\" — the skills, experience, qualifications and attributes of a suitable postholder. Together they underpin fair recruitment.",
          explanation_ru: "Должностная инструкция отвечает на вопрос «что включает должность?» — обязанности, ответственность, подчинённость. Профиль кандидата отвечает на вопрос «кто нам нужен?» — навыки, опыт, квалификация и качества подходящего работника. Вместе они обеспечивают справедливый подбор.",
        },
        // -------- NEW Q14 — hard MCQ on Maslow scenario --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            "A company runs major redundancies. A surviving employee, previously highly engaged in their personal development, now focuses entirely on job security. Under Maslow, this BEST illustrates:",
          prompt_ru:
            "Компания проводит массовые сокращения. Уцелевший сотрудник, ранее активно занятый личным развитием, теперь полностью сосредоточен на сохранении работы. По Маслоу это ЛУЧШЕ всего иллюстрирует:",
          options: [
            {
              key: "A",
              text_en: "Self-actualisation strengthening",
              text_ru: "Усиление самоактуализации",
              why_wrong_en:
                "Self-actualisation is at the TOP of the hierarchy; the employee has dropped DOWN to lower-level needs, not up.",
              why_wrong_ru:
                "Самоактуализация — на ВЕРШИНЕ иерархии; сотрудник опустился К НИЖНИМ уровням, а не поднялся выше.",
            },
            {
              key: "B",
              text_en:
                "Movement down the hierarchy when lower needs become threatened",
              text_ru:
                "Движение вниз по иерархии при угрозе нижним потребностям",
            },
            {
              key: "C",
              text_en: "Bypassing intermediate levels of the hierarchy",
              text_ru: "Пропуск промежуточных уровней иерархии",
              why_wrong_en:
                "Maslow's model is strictly sequential — needs are addressed in order; there is no bypassing in his framework.",
              why_wrong_ru:
                "Модель Маслоу строго последовательна — потребности удовлетворяются по порядку; пропуск уровней моделью не предусмотрен.",
            },
            {
              key: "D",
              text_en: "A shift from intrinsic to extrinsic motivation",
              text_ru: "Сдвиг от внутренней мотивации к внешней",
              why_wrong_en:
                "Intrinsic/extrinsic is a different framework (often associated with Deci & Ryan); Maslow describes the LEVEL of need, not its source.",
              why_wrong_ru:
                "Внутренняя/внешняя мотивация — другая модель (часто связываемая с Деси и Райаном); Маслоу описывает УРОВЕНЬ потребности, а не её источник.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Maslow's hierarchy isn't a one-way ladder. When lower-level needs come under threat — in this case, safety/security through job loss risk — higher-level concerns are pushed aside. The employee's previous development drive (esteem and self-actualisation territory) is suspended until they feel secure again. This is why organisational change initiatives that threaten job security often fail: they trigger downward movement in the hierarchy for everyone affected.",
          explanation_ru:
            "Иерархия Маслоу — не лестница с односторонним движением. Когда потребности нижнего уровня под угрозой — здесь это безопасность через риск потери работы, — высшие интересы отступают. Прежнее стремление сотрудника к развитию (область уважения и самоактуализации) приостанавливается до восстановления чувства безопасности. Именно поэтому организационные изменения, ставящие под угрозу занятость, часто проваливаются: они вызывают движение вниз по иерархии у всех затронутых.",
        },
        // -------- NEW Q15 — hard MCQ on integrated leadership scenario --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            "A manager inherits a demoralised team after a failed product launch. Sales targets are tight, individual skills are good, but morale and direction are missing. Combining motivation and leadership theory, the BEST initial approach is:",
          prompt_ru:
            "Менеджер принимает деморализованную команду после неудачного запуска продукта. Планы продаж жёсткие, индивидуальные навыки на уровне, но дух и направление утрачены. Сочетая теорию мотивации и лидерства, НАИЛУЧШИЙ первый подход:",
          options: [
            {
              key: "A",
              text_en:
                "Apply autocratic leadership and set strict targets to enforce performance",
              text_ru:
                "Применить авторитарный стиль и поставить жёсткие цели для принуждения к результату",
              why_wrong_en:
                "Autocratic style on a demoralised but capable team destroys what little engagement remains; this is a Theory X response to a Theory Y problem.",
              why_wrong_ru:
                "Авторитарный стиль на деморализованной, но способной команде уничтожает остатки вовлечённости; это ответ в духе Теории X на проблему Теории Y.",
            },
            {
              key: "B",
              text_en:
                "Use transformational leadership to rebuild shared vision, combined with recognition to address Herzberg motivators",
              text_ru:
                "Применить трансформационное лидерство для восстановления общего видения, сочетая с признанием для активации мотиваторов Герцберга",
            },
            {
              key: "C",
              text_en: "Increase salaries across the team to restore morale",
              text_ru: "Повысить оплату всем для восстановления духа",
              why_wrong_en:
                "Pay is a Herzberg hygiene factor — it can reduce dissatisfaction but does not by itself create lasting motivation; the underlying problem is direction and meaning, not pay.",
              why_wrong_ru:
                "Зарплата — гигиенический фактор Герцберга: она может снять недовольство, но сама по себе не создаёт устойчивой мотивации; коренная проблема — направление и смысл, а не оплата.",
            },
            {
              key: "D",
              text_en:
                "Adopt laissez-faire leadership to let the team self-organise",
              text_ru:
                "Применить либеральный стиль, позволив команде самоорганизоваться",
              why_wrong_en:
                "Laissez-faire on a team that lacks direction will simply prolong drift; self-organisation requires either shared vision or strong individual motivation, both of which are currently absent.",
              why_wrong_ru:
                "Либеральный стиль на команде без направления лишь продлит дрейф; самоорганизация требует либо общего видения, либо сильной индивидуальной мотивации — здесь нет ни того, ни другого.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "The team has capability (skills) but lacks meaning and motivation. Transformational leadership directly addresses the missing element — it inspires through a renewed sense of purpose and shared vision. Pairing this with Herzberg motivators (recognition for early wins, achievement opportunities through stretch assignments, growth via skill development) tackles the satisfaction side. Coercive autocratic style or pure pay rises miss the diagnosis: the problem is not capability or hygiene, but meaning.",
          explanation_ru:
            "У команды есть способности (навыки), но нет смысла и мотивации. Трансформационное лидерство прямо адресует отсутствующий элемент — оно вдохновляет через возобновлённое чувство цели и общее видение. Сочетание с мотиваторами Герцберга (признание ранних побед, возможности достижения через стретч-задания, развитие через обучение) закрывает сторону удовлетворённости. Принудительный авторитарный стиль или одно лишь повышение зарплат не попадают в диагноз: проблема не в способностях и не в гигиене, а в смысле.",
        },
      ],
    },
    // ---------- E ----------
    {
      code: "E",
      title_en: "Personal effectiveness and communication",
      title_ru: "Личная эффективность и коммуникация",
      description_en:
        "Learning styles, time management, communication, and appraisal.",
      description_ru:
        "Стили обучения, тайм-менеджмент, коммуникация и оценка эффективности.",
      sort_order: 50,
      theory_en:
        "Personal effectiveness rests on knowing how you learn, planning your time, communicating clearly, and improving through feedback.\n\n" +
        "Learning styles: Honey and Mumford classify learners as Activists (learn by doing, jump in), Reflectors (observe and ponder), Theorists (build models, want logic), and Pragmatists (test ideas in practice — show me what works). Kolb's learning cycle frames learning as four stages: concrete experience → reflective observation → abstract conceptualisation → active experimentation. The two link: each Honey-Mumford style maps to a Kolb stage.\n\n" +
        "Goal-setting uses SMART objectives — Specific, Measurable, Achievable, Relevant, Time-bound. The Time-bound element is the most-tested trap; objectives without a deadline fail SMART. Time management uses the Eisenhower urgent/important matrix: do the urgent-important now, schedule the important-not-urgent, delegate the urgent-not-important, drop the rest.\n\n" +
        "Communication moves a message from sender to receiver through encoding, channel, decoding, and feedback. Barriers include noise (literal or organisational), jargon, distortion, cultural difference, and poor channel choice. Channels split into formal (memos, board reports, formal meetings) and informal (the grapevine, hallway chats); written vs oral; verbal vs non-verbal. Channel choice depends on purpose — sensitive feedback face-to-face, policy changes in writing for record.\n\n" +
        "Improvement happens through counselling (helping someone work through a personal issue), mentoring (longer-term career guidance from a senior figure), and coaching (skill-focused, performance-driven). Appraisal types include formal (scheduled, documented) and informal (ad hoc feedback); 360-degree appraisal collects views from peers, subordinates, and superiors as well as the manager. Good appraisals are two-way conversations, not one-sided judgements, and tie into development plans rather than just rating performance.",
      theory_ru:
        "Личная эффективность строится на понимании того, как вы учитесь, на планировании времени, ясной коммуникации и улучшении через обратную связь.\n\n" +
        "Стили обучения: Хони и Мамфорд классифицируют учащихся как Деятелей (учатся, действуя, бросаются в дело), Рефлексирующих (наблюдают и обдумывают), Теоретиков (строят модели, любят логику) и Прагматиков (проверяют идеи на практике — «покажи, что работает»). Цикл обучения Колба описывает обучение через четыре стадии: конкретный опыт → рефлексивное наблюдение → абстрактная концептуализация → активное экспериментирование. Они связаны: каждый стиль Хони-Мамфорда соответствует стадии Колба.\n\n" +
        "Постановка целей использует SMART-цели — Specific (конкретные), Measurable (измеримые), Achievable (достижимые), Relevant (значимые), Time-bound (с указанным сроком). Элемент Time-bound — самая частая ловушка на экзамене: цель без срока не соответствует SMART. Тайм-менеджмент использует матрицу Эйзенхауэра «срочно/важно»: срочное-важное — делать сейчас, важное-несрочное — планировать, срочное-неважное — делегировать, остальное — отбрасывать.\n\n" +
        "Коммуникация передаёт сообщение от отправителя к получателю через кодирование, канал, декодирование и обратную связь. Барьеры включают шум (буквальный или организационный), профессиональный жаргон, искажение, культурные различия и неудачный выбор канала. Каналы делятся на формальные (служебные записки, отчёты совету, формальные совещания) и неформальные («сарафанное радио», разговоры в коридоре); письменные и устные; вербальные и невербальные. Выбор канала зависит от цели — чувствительную обратную связь дают лично, изменения политики оформляют письменно для фиксации.\n\n" +
        "Улучшение происходит через консультирование (помощь в решении личной проблемы), наставничество (долгосрочное карьерное сопровождение от старшего) и коучинг (фокус на навыке и результате). Виды оценки эффективности: формальная (плановая, документированная) и неформальная (обратная связь по ходу дела); оценка 360 градусов собирает мнения коллег, подчинённых и руководителей помимо непосредственного начальника. Хорошая оценка — это двусторонний разговор, а не одностороннее суждение, и связана с планом развития, а не только с выставлением балла.",
      questions: [
        // -------- existing Q1 (augmented) --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "In an Eisenhower (urgent/important) matrix, a task that is URGENT but NOT IMPORTANT should typically be:",
          prompt_ru:
            "В матрице Эйзенхауэра (срочное/важное) задача, которая СРОЧНАЯ, но НЕ ВАЖНАЯ, обычно должна быть:",
          options: [
            {
              key: "A",
              text_en: "Done first",
              text_ru: "Выполнена в первую очередь",
              why_wrong_en:
                '"Done first" applies to important AND urgent tasks; not-important tasks should not consume your top attention.',
              why_wrong_ru:
                "«Сделать в первую очередь» — для важных И срочных задач; неважные не должны занимать главное внимание.",
            },
            { key: "B", text_en: "Delegated", text_ru: "Делегирована" },
            {
              key: "C",
              text_en: "Scheduled for later",
              text_ru: "Запланирована на потом",
              why_wrong_en:
                "Scheduling fits important-but-not-urgent tasks (e.g. strategic planning); urgent items can't wait.",
              why_wrong_ru:
                "Планирование подходит для важных, но несрочных задач (например, стратегическое планирование); срочные ждать не могут.",
            },
            {
              key: "D",
              text_en: "Eliminated",
              text_ru: "Исключена",
              why_wrong_en:
                "Elimination is for tasks that are NEITHER urgent nor important; here the task is urgent, so it does need to be handled.",
              why_wrong_ru:
                "Исключение — для задач, которые НИ срочные, НИ важные; здесь задача срочная, ею надо заняться.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Urgent-but-not-important tasks are time-pressured but don\u2019t contribute to long-term goals — ideal candidates for delegation. Important + urgent: do now. Important, not urgent: schedule. Neither: drop.",
          explanation_ru:
            "Срочные, но не важные задачи давят по времени, но не двигают долгосрочные цели — идеальные кандидаты на делегирование. Важные и срочные — делать сейчас, важные, но не срочные — планировать, ни то ни то — отбрасывать.",
        },
        // -------- existing Q2 (augmented) --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "Which of the following is a barrier to effective communication?",
          prompt_ru:
            "Что из перечисленного является барьером для эффективной коммуникации?",
          options: [
            {
              key: "A",
              text_en: "Active listening",
              text_ru: "Активное слушание",
              why_wrong_en:
                "Active listening REMOVES barriers — it ensures the receiver hears and understands the sender accurately.",
              why_wrong_ru:
                "Активное слушание УСТРАНЯЕТ барьеры — оно обеспечивает точное восприятие сообщения получателем.",
            },
            {
              key: "B",
              text_en: "Feedback loop",
              text_ru: "Обратная связь",
              why_wrong_en:
                "A feedback loop is a key element of effective communication — it lets the sender confirm the message was understood.",
              why_wrong_ru:
                "Обратная связь — ключевой элемент эффективной коммуникации: она позволяет отправителю убедиться, что сообщение понято.",
            },
            {
              key: "C",
              text_en: "Jargon unfamiliar to the receiver",
              text_ru: "Жаргон, незнакомый получателю",
            },
            {
              key: "D",
              text_en: "Clear structure",
              text_ru: "Чёткая структура",
              why_wrong_en:
                "Clear structure REDUCES barriers — it helps the receiver follow the message.",
              why_wrong_ru:
                "Чёткая структура СНИЖАЕТ барьеры — она помогает получателю проследить за сообщением.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            'Technical jargon the receiver doesn\u2019t understand is a "noise" barrier. The other options are mechanisms that REDUCE communication barriers.',
          explanation_ru:
            "Технический жаргон, непонятный получателю, — это «шумовой» барьер. Остальные варианты, наоборот, СНИЖАЮТ барьеры в коммуникации.",
        },
        // -------- existing Q3 (short_answer, unchanged) --------
                {
          type: "mcq",
          difficulty: "easy",
          prompt_en: "Which set correctly names the four learning styles in Honey and Mumford's model?",
          prompt_ru: "Какой набор верно называет четыре стиля обучения в модели Хони и Мамфорда?",
          options: [
            {
              key: "A",
              text_en: "Activist, Reflector, Theorist, Pragmatist",
              text_ru: "Деятель, Рефлексирующий, Теоретик, Прагматик",
            },
            {
              key: "B",
              text_en: "Visual, Auditory, Reading, Kinaesthetic",
              text_ru: "Визуальный, Аудиальный, Чтение, Кинестетический",
              why_wrong_en: "These are the VARK learning preferences, a different model from Honey and Mumford's four styles.",
              why_wrong_ru: "Это предпочтения по модели VARK — другая модель, отличная от четырёх стилей Хони и Мамфорда.",
            },
            {
              key: "C",
              text_en: "Concrete, Reflective, Abstract, Active",
              text_ru: "Конкретный, Рефлексивный, Абстрактный, Активный",
              why_wrong_en: "These describe Kolb's learning CYCLE stages, which Honey and Mumford built on but renamed into four learner TYPES.",
              why_wrong_ru: "Это стадии цикла обучения Колба, на основе которого Хони и Мамфорд создали четыре ТИПА учащихся с другими названиями.",
            },
            {
              key: "D",
              text_en: "Activist, Observer, Analyst, Doer",
              text_ru: "Деятель, Наблюдатель, Аналитик, Исполнитель",
              why_wrong_en: "Only \"Activist\" is correct; the model's other three are Reflector, Theorist and Pragmatist.",
              why_wrong_ru: "Верно только «Деятель»; остальные три в модели — Рефлексирующий, Теоретик и Прагматик.",
            },
          ],
          correct_answer_en: "A",
          explanation_en: "Honey and Mumford built on Kolb's learning cycle to define four learner types: Activists (learn by doing/experience), Reflectors (learn by reviewing), Theorists (learn by understanding concepts), and Pragmatists (learn by applying ideas practically).",
          explanation_ru: "Хони и Мамфорд развили цикл обучения Колба, выделив четыре типа учащихся: Деятели (учатся через действие/опыт), Рефлексирующие (через осмысление), Теоретики (через понимание концепций) и Прагматики (через практическое применение идей).",
        },
        // -------- existing Q4 (augmented) --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A SMART objective should be Specific, Measurable, Achievable, Relevant and:",
          prompt_ru:
            "Цель по SMART должна быть конкретной, измеримой, достижимой, релевантной и:",
          options: [
            {
              key: "A",
              text_en: "Tactical",
              text_ru: "Тактической",
              why_wrong_en:
                '"Tactical" is a planning-level term, not part of the SMART acronym.',
              why_wrong_ru:
                "«Тактическая» — это термин уровня планирования, не входит в аббревиатуру SMART.",
            },
            {
              key: "B",
              text_en: "Time-bound",
              text_ru: "Ограниченной по времени",
            },
            {
              key: "C",
              text_en: "Theoretical",
              text_ru: "Теоретической",
              why_wrong_en:
                'SMART objectives must be PRACTICAL and actionable; "theoretical" is the opposite of what SMART requires.',
              why_wrong_ru:
                "Цели SMART должны быть ПРАКТИЧЕСКИМИ и реализуемыми; «теоретическая» — противоположность того, что требует SMART.",
            },
            {
              key: "D",
              text_en: "Top-down",
              text_ru: "Спущенной сверху",
              why_wrong_en:
                "Top-down describes a planning APPROACH, not a quality of the objective itself; it is not part of SMART.",
              why_wrong_ru:
                "Top-down — это ПОДХОД к планированию, а не качество самой цели; не входит в SMART.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "The T in SMART stands for Time-bound (or Time-limited): the objective must have a clear deadline.",
          explanation_ru:
            "Буква T в SMART означает «ограниченная по времени»: у цели должен быть чёткий срок.",
        },
        // -------- existing Q5 (augmented) --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en: "The grapevine in an organisation refers to:",
          prompt_ru: "«Виноградная лоза» в организации означает:",
          options: [
            {
              key: "A",
              text_en: "The formal reporting hierarchy",
              text_ru: "Формальную иерархию подчинения",
              why_wrong_en:
                "The grapevine is INFORMAL — the formal hierarchy is the documented chain of command, the opposite concept.",
              why_wrong_ru:
                "«Лоза» — это НЕФОРМАЛЬНЫЙ канал; формальная иерархия — задокументированная вертикаль управления, противоположное понятие.",
            },
            {
              key: "B",
              text_en: "A specific information system",
              text_ru: "Конкретную информационную систему",
              why_wrong_en:
                "The grapevine is not a software system; it is the network of person-to-person informal conversations.",
              why_wrong_ru:
                "«Лоза» — не программная система; это сеть личных неформальных разговоров между людьми.",
            },
            {
              key: "C",
              text_en: "Informal communication channels among employees",
              text_ru: "Неформальные каналы коммуникации между сотрудниками",
            },
            {
              key: "D",
              text_en: "A type of organisational structure",
              text_ru: "Тип организационной структуры",
              why_wrong_en:
                "Organisational structures are functional, divisional, matrix etc. — the grapevine is a communication phenomenon, not a structure.",
              why_wrong_ru:
                "Организационные структуры — функциональные, дивизиональные, матричные и т. д. «Лоза» — это коммуникационный феномен, а не структура.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            'The "grapevine" is the informal network through which information (and rumours) flow. It is fast but unreliable, and managers ignore it at their peril.',
          explanation_ru:
            "«Лоза» — неформальная сеть, по которой циркулируют сведения (и слухи). Она быстра, но ненадёжна, и игнорировать её менеджерам опасно.",
        },
        // -------- NEW Q6 — easy MCQ on Kolb cycle --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en: "Kolb\u2019s learning cycle begins with which stage?",
          prompt_ru: "Цикл обучения Колба начинается с какой стадии?",
          options: [
            {
              key: "A",
              text_en: "Concrete experience",
              text_ru: "Конкретный опыт",
            },
            {
              key: "B",
              text_en: "Reflective observation",
              text_ru: "Рефлексивное наблюдение",
              why_wrong_en:
                "Reflective observation is stage TWO — you have to have an experience before you can reflect on it.",
              why_wrong_ru:
                "Рефлексивное наблюдение — ВТОРАЯ стадия: нельзя рефлексировать без предшествующего опыта.",
            },
            {
              key: "C",
              text_en: "Abstract conceptualisation",
              text_ru: "Абстрактная концептуализация",
              why_wrong_en:
                "Abstract conceptualisation is stage THREE — building theory from reflection, which itself requires prior experience.",
              why_wrong_ru:
                "Абстрактная концептуализация — ТРЕТЬЯ стадия: построение теории из рефлексии, что в свою очередь требует предыдущего опыта.",
            },
            {
              key: "D",
              text_en: "Active experimentation",
              text_ru: "Активное экспериментирование",
              why_wrong_en:
                "Active experimentation is stage FOUR — testing concepts in practice, which closes the cycle.",
              why_wrong_ru:
                "Активное экспериментирование — ЧЕТВЁРТАЯ стадия: проверка концепций на практике, замыкающая цикл.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Kolb's cycle: concrete experience → reflective observation → abstract conceptualisation → active experimentation → back to concrete experience. The cycle starts with doing/experiencing something, then learning emerges through reflection, theorising, and applying — the loop is continuous.",
          explanation_ru:
            "Цикл Колба: конкретный опыт → рефлексивное наблюдение → абстрактная концептуализация → активное экспериментирование → снова конкретный опыт. Цикл начинается с действия или переживания, затем обучение проходит через рефлексию, теоретизацию и применение — петля непрерывна.",
        },
        // -------- NEW Q7 — easy MCQ on coaching vs mentoring --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "A senior partner regularly meets a junior accountant over several years to advise on career development, networking, and longer-term ambitions. This relationship is BEST described as:",
          prompt_ru:
            "Старший партнёр регулярно встречается с младшим бухгалтером в течение нескольких лет, чтобы давать советы по карьере, нетворкингу и долгосрочным целям. Эти отношения ЛУЧШЕ всего описать как:",
          options: [
            {
              key: "A",
              text_en: "Coaching",
              text_ru: "Коучинг",
              why_wrong_en:
                "Coaching is skill-focused and performance-driven, typically tied to a specific competency or short-term improvement — not multi-year career guidance.",
              why_wrong_ru:
                "Коучинг ориентирован на навык и результат, привязан к конкретной компетенции или краткосрочному улучшению — не на многолетнее карьерное сопровождение.",
            },
            { key: "B", text_en: "Mentoring", text_ru: "Наставничество" },
            {
              key: "C",
              text_en: "Counselling",
              text_ru: "Консультирование",
              why_wrong_en:
                "Counselling helps with personal issues affecting work; the scenario is about career development, not personal crisis support.",
              why_wrong_ru:
                "Консультирование помогает с личными проблемами, влияющими на работу; в сценарии речь о карьере, а не о личных кризисах.",
            },
            {
              key: "D",
              text_en: "Appraisal",
              text_ru: "Оценка эффективности",
              why_wrong_en:
                "Appraisal is a periodic evaluation of past performance; the scenario describes ongoing developmental advice from a non-manager.",
              why_wrong_ru:
                "Оценка эффективности — периодическая оценка прошлой работы; в сценарии — постоянные развивающие советы от не-руководителя.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Mentoring is a longer-term developmental relationship, usually between a senior and junior person who is not the mentee's direct manager. The focus is broad: career path, professional networks, navigating organisational politics, role models. Coaching is narrower (specific skill or behaviour); counselling is for personal difficulty.",
          explanation_ru:
            "Наставничество — это долгосрочные развивающие отношения, обычно между старшим и младшим, который не является непосредственным подчинённым наставника. Фокус широкий: карьерный путь, профессиональные связи, ориентация в организационной политике, ролевые модели. Коучинг — уже (конкретный навык или поведение); консультирование — для личных трудностей.",
        },
        // -------- NEW Q8 — easy short_answer on 360-degree --------
                {
          type: "mcq",
          difficulty: "easy",
          prompt_en: "What best describes a 360-degree appraisal?",
          prompt_ru: "Что лучше всего описывает оценку «360 градусов»?",
          options: [
            {
              key: "A",
              text_en: "An appraisal that gathers feedback from multiple sources — manager, peers, subordinates and often self-assessment",
              text_ru: "Оценка, собирающая обратную связь из нескольких источников — руководитель, коллеги, подчинённые и часто самооценка",
            },
            {
              key: "B",
              text_en: "An appraisal conducted only by the employee's line manager",
              text_ru: "Оценка, проводимая только непосредственным руководителем",
              why_wrong_en: "That is a traditional top-down appraisal; the defining feature of 360-degree is feedback from MULTIPLE sources, not just the manager.",
              why_wrong_ru: "Это традиционная оценка «сверху вниз»; отличительная черта «360 градусов» — обратная связь из НЕСКОЛЬКИХ источников, а не только от руководителя.",
            },
            {
              key: "C",
              text_en: "An appraisal based solely on quantitative sales targets",
              text_ru: "Оценка, основанная исключительно на количественных планах продаж",
              why_wrong_en: "360-degree appraisal is about multi-source qualitative feedback, not a single quantitative metric.",
              why_wrong_ru: "Оценка «360 градусов» — это многосторонняя качественная обратная связь, а не один количественный показатель.",
            },
            {
              key: "D",
              text_en: "An appraisal carried out once every 360 days",
              text_ru: "Оценка, проводимая раз в 360 дней",
              why_wrong_en: "The \"360\" refers to a full circle of feedback sources, not a time interval.",
              why_wrong_ru: "«360» означает полный круг источников обратной связи, а не временной интервал.",
            },
          ],
          correct_answer_en: "A",
          explanation_en: "A 360-degree appraisal seeks a balanced, multi-perspective view of performance by gathering feedback from those around the employee — line manager, peers, subordinates, and often the individual's own self-assessment (and sometimes external stakeholders).",
          explanation_ru: "Оценка «360 градусов» стремится дать сбалансированный, многосторонний взгляд на результаты, собирая обратную связь от окружения сотрудника — руководителя, коллег, подчинённых и часто самооценку (иногда и от внешних сторон).",
        },
        // -------- NEW Q9 — medium MCQ on channel choice --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A manager needs to give a senior employee constructive feedback on poor performance over the past quarter. Which communication channel is MOST appropriate?",
          prompt_ru:
            "Руководителю нужно дать старшему сотруднику конструктивную обратную связь по плохим результатам прошлого квартала. Какой канал коммуникации НАИБОЛЕЕ уместен?",
          options: [
            {
              key: "A",
              text_en: "Group email cc'ing the team",
              text_ru: "Групповая электронная почта с копией всей команде",
              why_wrong_en:
                "Publicly shaming an employee through cc to the team is unprofessional and likely to entrench defensive behaviour — worst possible choice.",
              why_wrong_ru:
                "Публичное «осуждение» сотрудника путём копии всей команде непрофессионально и закрепляет защитную реакцию — худший возможный выбор.",
            },
            {
              key: "B",
              text_en: "A face-to-face one-on-one meeting",
              text_ru: "Личная встреча один на один",
            },
            {
              key: "C",
              text_en: "A formal written notice without prior discussion",
              text_ru:
                "Формальное письменное уведомление без предварительного разговора",
              why_wrong_en:
                "Skipping conversation removes the chance to understand context and demonstrate concern; written-first is appropriate for disciplinary records, not for initial feedback.",
              why_wrong_ru:
                "Пропуск разговора лишает возможности понять контекст и проявить заботу; письменно сначала — для дисциплинарных записей, а не для первичной обратной связи.",
            },
            {
              key: "D",
              text_en: "A public announcement at the next team meeting",
              text_ru: "Публичное объявление на следующей встрече команды",
              why_wrong_en:
                "Public criticism humiliates rather than corrects; the message should be private to allow honest two-way conversation.",
              why_wrong_ru:
                "Публичная критика унижает, а не исправляет; разговор должен быть приватным, чтобы обеспечить честный двусторонний обмен.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            'Sensitive feedback requires a "rich" channel — face-to-face conversation, which carries tone, body language, and immediate two-way feedback. The conversation should be private to preserve dignity, and may be followed up in writing for the record. The rule: the more sensitive the message, the richer the channel; the more procedural, the more written-formal.',
          explanation_ru:
            "Чувствительная обратная связь требует «богатого» канала — личного разговора, передающего интонацию, язык тела и мгновенный двусторонний обмен. Разговор должен быть приватным для сохранения достоинства, потом возможно письменное подтверждение для фиксации. Правило: чем чувствительнее сообщение, тем «богаче» канал; чем более процедурно — тем более письменно и формально.",
        },
        // -------- NEW Q10 — medium MCQ on Honey-Mumford scenario --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            'A team member always wants to understand the theoretical framework behind a new task before starting work, asking "how does this connect to what we know?" This BEST fits which Honey and Mumford style?',
          prompt_ru:
            "Сотрудник всегда хочет понять теоретическую базу новой задачи перед началом работы, спрашивая «как это связано с тем, что мы знаем?» К какому стилю Хони и Мамфорда это ЛУЧШЕ всего относится?",
          options: [
            {
              key: "A",
              text_en: "Activist",
              text_ru: "Деятель",
              why_wrong_en:
                "Activists jump straight into doing without seeking theoretical understanding first — the opposite behaviour.",
              why_wrong_ru:
                "Деятели сразу бросаются в действие без теоретического осмысления — противоположное поведение.",
            },
            {
              key: "B",
              text_en: "Reflector",
              text_ru: "Рефлектор",
              why_wrong_en:
                "Reflectors observe and ponder past events; they don't specifically need theoretical frameworks before acting.",
              why_wrong_ru:
                "Рефлекторы наблюдают и обдумывают уже произошедшее; они не обязательно требуют теоретической рамки перед действием.",
            },
            { key: "C", text_en: "Theorist", text_ru: "Теоретик" },
            {
              key: "D",
              text_en: "Pragmatist",
              text_ru: "Прагматик",
              why_wrong_en:
                'Pragmatists ask "does this work in practice?" — they want to apply, not understand the theory first.',
              why_wrong_ru:
                "Прагматики спрашивают «работает ли это на практике?» — им важно применить, а не сначала разобраться в теории.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            'Theorists build mental models — they want logic, structure, and how a new piece fits into a coherent framework. Asking "how does this connect to what we know?" is the classic theorist move. The four styles map roughly to Kolb stages: Activists to concrete experience, Reflectors to observation, Theorists to abstract conceptualisation, Pragmatists to active experimentation.',
          explanation_ru:
            "Теоретики строят ментальные модели — им важны логика, структура и встроенность нового в связную систему. Вопрос «как это связано с тем, что мы уже знаем?» — классическое поведение теоретика. Четыре стиля примерно соответствуют стадиям Колба: Деятели — конкретный опыт, Рефлекторы — наблюдение, Теоретики — абстрактная концептуализация, Прагматики — активное экспериментирование.",
        },
        // -------- NEW Q11 — medium MCQ on communication noise --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "During a video call between a London headquarters and a Mumbai office, three issues arise simultaneously: a poor internet connection causes audio dropouts, the London speaker uses British financial terminology unfamiliar to the Indian team, and the time-zone difference means the Mumbai staff are tired at the end of their day. Which TYPE of barrier does poor internet connectivity primarily represent?",
          prompt_ru:
            "Во время видеосвязи между головным офисом в Лондоне и офисом в Мумбаи возникают три проблемы одновременно: плохое интернет-соединение вызывает обрывы звука, лондонский докладчик использует британскую финансовую терминологию, незнакомую индийской команде, а разница во времени делает мумбайских сотрудников уставшими к концу рабочего дня. Какой ТИП барьера представляет плохое интернет-соединение?",
          options: [
            {
              key: "A",
              text_en: "Semantic (language/jargon)",
              text_ru: "Семантический (язык/жаргон)",
              why_wrong_en:
                "Semantic barriers are about word meaning — the British financial terminology is the semantic barrier here, not the audio dropouts.",
              why_wrong_ru:
                "Семантические барьеры — про значение слов; британская финансовая терминология и есть семантический барьер, а не обрывы звука.",
            },
            {
              key: "B",
              text_en: "Physical (noise/medium)",
              text_ru: "Физический (шум/среда)",
            },
            {
              key: "C",
              text_en: "Psychological (fatigue/emotion)",
              text_ru: "Психологический (усталость/эмоции)",
              why_wrong_en:
                "Psychological barriers cover the tiredness of the Mumbai team, but not the technical audio dropouts described.",
              why_wrong_ru:
                "Психологические барьеры — про усталость мумбайской команды, но не про технические обрывы звука.",
            },
            {
              key: "D",
              text_en: "Cultural (different reference frames)",
              text_ru: "Культурный (различные системы взглядов)",
              why_wrong_en:
                "Cultural barriers relate to different conventions and expectations across cultures; the audio dropouts are a technical issue, not a cultural one.",
              why_wrong_ru:
                "Культурные барьеры — это разные конвенции и ожидания между культурами; обрывы звука — техническая проблема, не культурная.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            'Communication barriers are classified by type. Physical barriers (sometimes called "noise" or "medium" barriers) include literal interference with the channel: bad audio, distance, faulty equipment. Semantic barriers come from language and jargon. Psychological barriers come from emotional state. Cultural barriers come from differing reference frames. The scenario contains all four types, but the question asks specifically about the internet connectivity issue, which is physical.',
          explanation_ru:
            "Коммуникационные барьеры классифицируются по типу. Физические (иногда называемые «шумовыми» или связанными со средой) — это буквальные помехи каналу: плохое аудио, расстояние, неисправное оборудование. Семантические — из языка и жаргона. Психологические — из эмоционального состояния. Культурные — из разных систем восприятия. Сценарий содержит все четыре типа, но вопрос — конкретно про интернет-соединение, что относится к физическим барьерам.",
        },
        // -------- NEW Q12 — medium MCQ on formal vs informal --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A board of directors needs to communicate a major policy change to all employees. The MOST appropriate channel is:",
          prompt_ru:
            "Совет директоров должен сообщить всем сотрудникам о крупном изменении политики. НАИБОЛЕЕ подходящий канал:",
          options: [
            {
              key: "A",
              text_en: "Informal conversation through the grapevine",
              text_ru: "Неформальный разговор через «лозу»",
              why_wrong_en:
                "The grapevine distorts messages and provides no record; major policy needs documented, controlled communication.",
              why_wrong_ru:
                "«Лоза» искажает сообщения и не оставляет следа; для крупной политики нужна задокументированная и контролируемая коммуникация.",
            },
            {
              key: "B",
              text_en:
                "A formal written communication, with team meetings to discuss",
              text_ru:
                "Формальное письменное сообщение с обсуждением на встречах команды",
            },
            {
              key: "C",
              text_en: "Word-of-mouth via line managers only",
              text_ru: "Только устная передача через линейных руководителей",
              why_wrong_en:
                'Verbal-only relay through layers of management invites distortion (the "Chinese whispers" effect); written formality preserves the message integrity.',
              why_wrong_ru:
                "Только устная передача через слои управления провоцирует искажения (эффект «испорченного телефона»); письменная формализация сохраняет целостность сообщения.",
            },
            {
              key: "D",
              text_en: "A casual post on the company social channel",
              text_ru: "Неофициальный пост в корпоративном чате",
              why_wrong_en:
                "A major policy change is too significant for an informal tone; the casual format undermines the message's seriousness.",
              why_wrong_ru:
                "Крупное изменение политики слишком значимо для неформального тона; формат подрывает серьёзность сообщения.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Major policy requires formal written communication (for record, clarity, and accountability) PLUS supporting meetings (to explain context, answer questions, and gather feedback). Channels should match purpose: a written-only approach misses the dialogue dimension; an informal-only approach lacks authority and record.",
          explanation_ru:
            "Крупная политика требует формального письменного сообщения (для фиксации, ясности и подотчётности) ПЛЮС поддерживающих встреч (объяснить контекст, ответить на вопросы, собрать обратную связь). Канал должен соответствовать цели: только письменно — нет диалога; только неформально — нет авторитета и фиксации.",
        },
        // -------- NEW Q13 — medium short_answer on Eisenhower --------
                {
          type: "mcq",
          difficulty: "medium",
          prompt_en: "In the Eisenhower matrix, what is the recommended action for a task that is IMPORTANT but NOT URGENT?",
          prompt_ru: "Что рекомендует матрица Эйзенхауэра для задачи, которая ВАЖНА, но НЕ СРОЧНА?",
          options: [
            {
              key: "A",
              text_en: "Schedule it — plan a specific time to do it",
              text_ru: "Запланировать — выделить конкретное время для выполнения",
            },
            {
              key: "B",
              text_en: "Do it immediately",
              text_ru: "Сделать немедленно",
              why_wrong_en: "\"Do it now\" is for IMPORTANT AND URGENT tasks; important-but-not-urgent work should be scheduled, not rushed.",
              why_wrong_ru: "«Сделать сейчас» — для ВАЖНЫХ И СРОЧНЫХ задач; важное, но не срочное следует планировать, а не спешить.",
            },
            {
              key: "C",
              text_en: "Delegate it",
              text_ru: "Делегировать",
              why_wrong_en: "Delegation suits URGENT but NOT IMPORTANT tasks; an important task generally warrants your own attention, scheduled.",
              why_wrong_ru: "Делегирование подходит для СРОЧНЫХ, но НЕ ВАЖНЫХ задач; важная задача обычно требует вашего внимания по графику.",
            },
            {
              key: "D",
              text_en: "Delete it",
              text_ru: "Удалить",
              why_wrong_en: "Deleting/ignoring is for tasks that are NEITHER important NOR urgent; an important task must not be dropped.",
              why_wrong_ru: "Удаление/игнорирование — для задач, которые НИ важны, НИ срочны; важную задачу отбрасывать нельзя.",
            },
          ],
          correct_answer_en: "A",
          explanation_en: "The Eisenhower matrix sorts tasks by importance and urgency. Important-not-urgent is the \"quadrant of quality\": schedule dedicated time so these valuable tasks get done before they become urgent crises.",
          explanation_ru: "Матрица Эйзенхауэра сортирует задачи по важности и срочности. Важное-несрочное — это «квадрант качества»: выделите время заранее, чтобы выполнить ценные задачи до того, как они станут срочными кризисами.",
        },
        // -------- NEW Q14 — hard MCQ on appraisal pitfalls --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            'A manager rates all team members as "meets expectations" to avoid difficult conversations, even when performance clearly varies. This is BEST described as:',
          prompt_ru:
            "Руководитель ставит всем участникам команды оценку «соответствует ожиданиям», чтобы избежать трудных разговоров, даже когда результаты явно различаются. Это ЛУЧШЕ всего описать как:",
          options: [
            {
              key: "A",
              text_en: "Halo effect",
              text_ru: "Эффект ореола",
              why_wrong_en:
                "Halo effect is when one positive trait dominates the rater's overall impression of an individual; here the manager applies the same rating to ALL, regardless of trait.",
              why_wrong_ru:
                "Эффект ореола — когда одна положительная черта определяет общее впечатление об одном человеке; здесь же руководитель ставит одинаковую оценку ВСЕМ, независимо от черт.",
            },
            {
              key: "B",
              text_en: "Central tendency bias",
              text_ru: "Тенденция к среднему",
            },
            {
              key: "C",
              text_en: "Recency effect",
              text_ru: "Эффект недавности",
              why_wrong_en:
                "Recency effect is overweighting recent events; here the bias is about avoiding extremes, not about timing.",
              why_wrong_ru:
                "Эффект недавности — это переоценка недавних событий; в данном случае предвзятость — про избегание крайностей, а не про время.",
            },
            {
              key: "D",
              text_en: "Stereotyping",
              text_ru: "Стереотипизация",
              why_wrong_en:
                "Stereotyping applies group-based judgements to individuals; here the bias is the opposite — refusing to differentiate at all.",
              why_wrong_ru:
                "Стереотипизация — применение группового суждения к отдельному человеку; здесь — наоборот, отказ от различения.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            'Central tendency bias is the rater\'s tendency to give all employees average scores, avoiding the extremes of "outstanding" or "unsatisfactory". The motive is usually conflict-avoidance: top ratings raise expectations, low ratings provoke disputes. The cost: high performers feel unrecognised; poor performers see no signal to improve; the appraisal system loses its usefulness as a differentiator.',
          explanation_ru:
            "Тенденция к среднему — это склонность оценщика ставить всем средние оценки, избегая крайних «выдающихся» и «неудовлетворительных». Мотив обычно — избегание конфликта: высокие оценки повышают ожидания, низкие провоцируют споры. Цена: лучшие сотрудники чувствуют непризнание, плохие не получают сигнала к улучшению, а система оценки теряет смысл как инструмент дифференциации.",
        },
        // -------- NEW Q15 — hard MCQ on cross-cultural scenario --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            'A UK-based manager gives feedback by saying "your work was not perfect but largely fine." Working with a German colleague who values directness and a Japanese colleague accustomed to indirect communication, the MOST LIKELY outcome is:',
          prompt_ru:
            "Британский руководитель даёт обратную связь словами «работа была не идеальна, но в целом нормальная». В общении с немецким коллегой, ценящим прямоту, и японским коллегой, привычным к непрямой коммуникации, НАИБОЛЕЕ ВЕРОЯТНЫЙ исход:",
          options: [
            {
              key: "A",
              text_en: "Both colleagues interpret the message identically",
              text_ru: "Оба коллеги одинаково истолкуют сообщение",
              why_wrong_en:
                "The whole point of cultural barriers is that the SAME message lands differently depending on the receiver's communication conventions.",
              why_wrong_ru:
                "Вся суть культурных барьеров в том, что ОДНО и то же сообщение по-разному воспринимается в зависимости от коммуникационных конвенций получателя.",
            },
            {
              key: "B",
              text_en:
                "The German colleague reads it as overly soft, possibly avoiding real criticism; the Japanese colleague may read it as unusually direct/harsh",
              text_ru:
                "Немецкий коллега воспримет это как слишком мягко, возможно, как уход от реальной критики; японский коллега может воспринять как необычно прямо/жёстко",
            },
            {
              key: "C",
              text_en: "Both colleagues understand the message as praise",
              text_ru: "Оба коллеги воспримут сообщение как похвалу",
              why_wrong_en:
                "The phrase contains mixed signals; reading it as unambiguous praise misses the cultural-context point entirely.",
              why_wrong_ru:
                "В фразе смешанные сигналы; восприятие её как однозначной похвалы упускает суть культурного контекста.",
            },
            {
              key: "D",
              text_en:
                "The cultural background of the receiver doesn't affect interpretation",
              text_ru: "Культурный фон получателя не влияет на интерпретацию",
              why_wrong_en:
                "This denies the existence of cultural communication barriers, contradicting decades of cross-cultural research.",
              why_wrong_ru:
                "Это отрицает само существование культурных коммуникационных барьеров и противоречит десятилетиям кросс-культурных исследований.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            'Communication is filtered through the receiver\'s cultural conventions. British "indirect-polite" feedback ("not perfect but largely fine") underspecifies the actual assessment. To a German colleague used to direct feedback culture, the vagueness signals avoidance — they may think the work is genuinely worse than stated. To a Japanese colleague used to even more indirect communication, the phrase may register as quite negative — pointing out imperfection at all carries weight. The same words, opposite interpretations. Effective cross-cultural feedback adapts directness and explicitness to the receiver.',
          explanation_ru:
            "Коммуникация фильтруется через культурные конвенции получателя. Британская «непрямо-вежливая» обратная связь («не идеально, но в целом нормально») недоопределяет реальную оценку. Для немецкого коллеги, привыкшего к прямой культуре обратной связи, размытость сигнализирует об уходе — он может решить, что работа на самом деле хуже сказанного. Для японского коллеги, привыкшего к ещё более непрямой коммуникации, фраза может прозвучать довольно негативно — само указание на несовершенство уже значимо. Те же слова — противоположные интерпретации. Эффективная межкультурная обратная связь подстраивает прямоту и явность под получателя.",
        },
      ],
    },
    // ---------- F ----------
    {
      code: "F",
      title_en: "Professional ethics in accounting and business",
      title_ru: "Профессиональная этика в учёте и бизнесе",
      description_en:
        "IESBA/ACCA Code, threats to compliance, and ethical decision-making.",
      description_ru:
        "Кодекс IESBA/ACCA, угрозы соблюдению и этическое принятие решений.",
      sort_order: 60,
      theory_en:
        "Professional ethics in accounting is built around the IESBA Code of Ethics, which ACCA adopts. The Code rests on five fundamental principles every accountant must uphold: Integrity (straightforward and honest in all dealings), Objectivity (no bias, conflict of interest, or undue influence), Professional Competence and Due Care (maintain knowledge and skill; act diligently), Confidentiality (do not disclose client information without authority), and Professional Behaviour (comply with laws and regulations, avoid conduct that discredits the profession).\n\n" +
        "These principles are constantly under threat. The Code names five threat categories: Self-interest (financial or other interest in the outcome — e.g. holding shares in a client), Self-review (reviewing one's own previous work — e.g. auditing a system you helped design), Advocacy (promoting a client's position to the point of compromising objectivity), Familiarity (long association making you sympathetic — e.g. close personal friendship with a director), and Intimidation (actual or threatened pressure).\n\n" +
        "When a threat is identified, the response is safeguards — measures that eliminate the threat or reduce it to an acceptable level. Safeguards exist at three levels: those created by the profession or legislation (CPD, regulation, professional standards), those within the firm (independence policies, rotation of audit partners, internal review), and those within the client (governance structures, audit committee oversight).\n\n" +
        "Confidentiality has exceptions: disclosure is permitted or required where authorised by the client, required by law (e.g. court order, anti-money-laundering reporting), or there is a professional duty to disclose (e.g. responding to a regulatory inquiry).\n\n" +
        "Whistleblowing escalates internally first — line manager, then audit committee, then the professional body — and only externally if internal routes fail and law permits. Bribery is prohibited; small gifts must be evaluated against the threshold above which they could be seen as influencing professional judgement.",
      theory_ru:
        "Профессиональная этика в учёте опирается на Кодекс этики IESBA, который принимает ACCA. В основе Кодекса — пять фундаментальных принципов, обязательных для любого бухгалтера: Честность (прямота и порядочность во всех делах), Объективность (отсутствие предвзятости, конфликта интересов и неподобающего влияния), Профессиональная компетентность и должная осмотрительность (поддерживать знания и навыки, действовать добросовестно), Конфиденциальность (не раскрывать информацию клиента без полномочий) и Профессиональное поведение (соблюдать законы и нормы, избегать действий, дискредитирующих профессию).\n\n" +
        "Эти принципы постоянно находятся под угрозой. Кодекс называет пять категорий угроз: личная заинтересованность (финансовая или иная заинтересованность в исходе — например, владение акциями клиента), самопроверка (проверка собственной прежней работы — например, аудит системы, которую сам разрабатывал), защита (продвижение позиции клиента до уровня, компрометирующего объективность), близкое знакомство (длительные отношения, формирующие симпатию — например, тесная дружба с директором) и запугивание (фактическое или предполагаемое давление).\n\n" +
        "При выявлении угрозы ответом служат меры предосторожности (safeguards) — действия, устраняющие угрозу или снижающие её до приемлемого уровня. Меры существуют на трёх уровнях: создаваемые профессией или законодательством (повышение квалификации, регулирование, профессиональные стандарты), создаваемые внутри фирмы (политики независимости, ротация партнёров по аудиту, внутренний контроль), и создаваемые внутри клиента (структуры корпоративного управления, надзор аудиторского комитета).\n\n" +
        "Конфиденциальность имеет исключения: раскрытие информации допустимо или обязательно при разрешении клиента, требовании закона (например, судебное решение, сообщение по линии противодействия отмыванию) или при наличии профессиональной обязанности раскрыть (например, ответ на запрос регулятора).\n\n" +
        "Информирование о нарушениях (whistleblowing) сначала идёт по внутренней линии — непосредственный руководитель, затем аудиторский комитет, затем профессиональная организация — и только потом наружу, если внутренние пути исчерпаны и закон это позволяет. Взятки запрещены; небольшие подарки оцениваются на предмет порога, выше которого они могут восприниматься как влияние на профессиональное суждение.",
      questions: [
        // -------- existing Q1 (short_answer, unchanged) --------
                {
          type: "mcq",
          difficulty: "easy",
          prompt_en: "Which of the following is one of the five fundamental principles of the IESBA Code of Ethics?",
          prompt_ru: "Какой из перечисленных пунктов является одним из пяти основополагающих принципов Кодекса этики IESBA?",
          options: [
            {
              key: "A",
              text_en: "Objectivity",
              text_ru: "Объективность",
            },
            {
              key: "B",
              text_en: "Profitability",
              text_ru: "Прибыльность",
              why_wrong_en: "Profitability is a commercial goal, not an ethical principle. The five principles are integrity, objectivity, professional competence and due care, confidentiality, and professional behaviour.",
              why_wrong_ru: "Прибыльность — коммерческая цель, а не этический принцип. Пять принципов: честность, объективность, профессиональная компетентность и должная осмотрительность, конфиденциальность, профессиональное поведение.",
            },
            {
              key: "C",
              text_en: "Loyalty to the employer",
              text_ru: "Лояльность работодателю",
              why_wrong_en: "Accountants owe duties to the public interest; unconditional loyalty to an employer can conflict with objectivity and integrity, so it is not a fundamental principle.",
              why_wrong_ru: "Бухгалтеры несут обязанности перед общественными интересами; безусловная лояльность работодателю может конфликтовать с объективностью и честностью, поэтому это не основополагающий принцип.",
            },
            {
              key: "D",
              text_en: "Profit maximisation",
              text_ru: "Максимизация прибыли",
              why_wrong_en: "This is a business objective, not one of the IESBA ethical principles.",
              why_wrong_ru: "Это бизнес-цель, а не один из этических принципов IESBA.",
            },
          ],
          correct_answer_en: "A",
          explanation_en: "The five IESBA fundamental principles are: integrity, objectivity, professional competence and due care, confidentiality, and professional behaviour. Objectivity means not letting bias, conflict of interest, or undue influence override professional judgement.",
          explanation_ru: "Пять основополагающих принципов IESBA: честность, объективность, профессиональная компетентность и должная осмотрительность, конфиденциальность, профессиональное поведение. Объективность означает не позволять предвзятости, конфликту интересов или давлению влиять на профессиональное суждение.",
        },
        // -------- existing Q2 (augmented) --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "An accountant accepts a free luxury holiday from a major audit client. This MOST DIRECTLY threatens the principle of:",
          prompt_ru:
            "Бухгалтер принимает бесплатный роскошный отпуск от крупного аудиторского клиента. Это в первую очередь угрожает принципу:",
          options: [
            {
              key: "A",
              text_en: "Professional competence",
              text_ru: "Профессиональной компетентности",
              why_wrong_en:
                "Professional competence is about maintaining skills and knowledge; the gift doesn't affect the accountant's technical ability.",
              why_wrong_ru:
                "Профессиональная компетентность — про поддержание навыков и знаний; подарок не влияет на технические способности бухгалтера.",
            },
            {
              key: "B",
              text_en: "Confidentiality",
              text_ru: "Конфиденциальности",
              why_wrong_en:
                "Confidentiality is about non-disclosure of client information; accepting a gift doesn't involve disclosure.",
              why_wrong_ru:
                "Конфиденциальность — про неразглашение сведений клиента; принятие подарка не связано с раскрытием.",
            },
            { key: "C", text_en: "Objectivity", text_ru: "Объективности" },
            {
              key: "D",
              text_en: "Professional behaviour only",
              text_ru: "Только профессионального поведения",
              why_wrong_en:
                '"Only" makes this too narrow — the primary threat is to objectivity through self-interest; professional behaviour is also implicated but not the MOST direct threat.',
              why_wrong_ru:
                "Слово «только» слишком сужает: главная угроза — объективности через личную заинтересованность; профессиональное поведение задето, но не НАПРЯМУЮ.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "A material gift creates a self-interest threat to objectivity: the accountant might consciously or unconsciously favour the client to preserve the benefit.",
          explanation_ru:
            "Существенный подарок создаёт угрозу собственного интереса для объективности: бухгалтер может сознательно или бессознательно благоприятствовать клиенту, чтобы сохранить выгоду.",
        },
        // -------- existing Q3 (augmented) --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en: 'A "self-review threat" arises when:',
          prompt_ru: "«Угроза самопроверки» возникает, когда:",
          options: [
            {
              key: "A",
              text_en: "A professional has a financial interest in the client",
              text_ru: "У профессионала есть финансовый интерес в клиенте",
              why_wrong_en:
                "Financial interest is a SELF-INTEREST threat, not self-review.",
              why_wrong_ru:
                "Финансовый интерес — это угроза ЛИЧНОЙ ЗАИНТЕРЕСОВАННОСТИ, а не самопроверки.",
            },
            {
              key: "B",
              text_en:
                "A professional is asked to review work they previously performed",
              text_ru:
                "Профессионала просят проверить работу, которую он сам ранее выполнял",
            },
            {
              key: "C",
              text_en:
                "A long-standing client relationship causes overfamiliarity",
              text_ru:
                "Долгие отношения с клиентом приводят к чрезмерной близости",
              why_wrong_en:
                "This describes the FAMILIARITY threat, not self-review.",
              why_wrong_ru:
                "Это описание угрозы БЛИЗКОГО ЗНАКОМСТВА, а не самопроверки.",
            },
            {
              key: "D",
              text_en: "A client threatens to dismiss the professional",
              text_ru: "Клиент угрожает увольнением профессионала",
              why_wrong_en:
                "This describes the INTIMIDATION threat, not self-review.",
              why_wrong_ru:
                "Это описание угрозы ЗАПУГИВАНИЯ, а не самопроверки.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Self-review threats arise when an auditor evaluates their own prior work — there\u2019s an inherent bias not to find fault. Safeguards typically involve using a different team or external review.",
          explanation_ru:
            "Угроза самопроверки возникает, когда аудитор оценивает собственные предыдущие работы — есть встроенная предвзятость не находить недостатков. Защитные меры обычно включают другую команду или внешнюю проверку.",
        },
        // -------- existing Q4 (augmented) --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "Disclosing confidential client information without authorisation is a breach of:",
          prompt_ru:
            "Раскрытие конфиденциальной информации клиента без разрешения нарушает принцип:",
          options: [
            {
              key: "A",
              text_en: "Integrity",
              text_ru: "Честности",
              why_wrong_en:
                "Integrity is about being straightforward and honest in dealings — the specific concern with disclosure is captured by confidentiality.",
              why_wrong_ru:
                "Честность — это прямота и порядочность в действиях; конкретный вопрос раскрытия информации охватывается принципом конфиденциальности.",
            },
            {
              key: "B",
              text_en: "Confidentiality",
              text_ru: "Конфиденциальности",
            },
            {
              key: "C",
              text_en: "Competence",
              text_ru: "Компетентности",
              why_wrong_en:
                "Competence is about technical ability and ongoing professional development, unrelated to disclosure of client information.",
              why_wrong_ru:
                "Компетентность — про техническую способность и непрерывное развитие, не связана с раскрытием сведений клиента.",
            },
            {
              key: "D",
              text_en: "Objectivity",
              text_ru: "Объективности",
              why_wrong_en:
                "Objectivity is about absence of bias in professional judgement, not about handling of information.",
              why_wrong_ru:
                "Объективность — про отсутствие предвзятости в профессиональном суждении, а не про обращение с информацией.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Confidentiality requires the accountant not to disclose client information acquired in the course of professional work, unless there is a legal duty or proper authority.",
          explanation_ru:
            "Принцип конфиденциальности требует от бухгалтера не раскрывать сведения клиента, полученные в ходе профессиональной деятельности, кроме случаев законной обязанности или должного полномочия.",
        },
        // -------- existing Q5 (augmented) --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            "An accountant discovers their employer has been overstating revenue. Internal escalation is ignored. The MOST APPROPRIATE next step is to:",
          prompt_ru:
            "Бухгалтер обнаружил, что работодатель завышал выручку. Внутренние обращения игнорируются. НАИБОЛЕЕ ПРАВИЛЬНЫЙ следующий шаг — :",
          options: [
            {
              key: "A",
              text_en: "Resign immediately without comment",
              text_ru: "Немедленно уволиться без объяснений",
              why_wrong_en:
                "Silent resignation breaches integrity — the accountant is aware of misstated financials affecting third-party users and walking away says nothing.",
              why_wrong_ru:
                "Тихий уход нарушает принцип честности — бухгалтер знает об искажении отчётности, влияющем на сторонних пользователей, а молчаливый уход ничего не сообщает.",
            },
            {
              key: "B",
              text_en:
                "Seek confidential advice from their professional body and consider lawful disclosure",
              text_ru:
                "Обратиться за конфиденциальной консультацией в свою профессиональную организацию и рассмотреть законное раскрытие",
            },
            {
              key: "C",
              text_en: "Comply because the employer pays their salary",
              text_ru: "Подчиниться, поскольку работодатель платит зарплату",
              why_wrong_en:
                "This breaches integrity AND professional behaviour; complicity in revenue overstatement is potentially fraud.",
              why_wrong_ru:
                "Это нарушает И честность, И профессиональное поведение; соучастие в завышении выручки потенциально является мошенничеством.",
            },
            {
              key: "D",
              text_en: "Tell the financial press anonymously",
              text_ru: "Анонимно сообщить финансовой прессе",
              why_wrong_en:
                "Going to the press without exhausting proper channels breaches confidentiality and bypasses the professional escalation framework.",
              why_wrong_ru:
                "Поход в прессу до исчерпания надлежащих каналов нарушает конфиденциальность и обходит профессиональный порядок эскалации.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "IESBA/ACCA guidance is to escalate internally, then seek confidential advice from the professional body, and only disclose externally where legally permitted/required. Going straight to the press breaches confidentiality; staying silent breaches integrity.",
          explanation_ru:
            "Согласно рекомендациям IESBA/ACCA, нужно эскалировать внутри организации, затем получить конфиденциальную консультацию у профессиональной организации, и раскрывать сведения вовне только когда это законно разрешено или требуется. Поход напрямую в прессу нарушает конфиденциальность, молчание — честность.",
        },
        // -------- NEW Q6 — easy MCQ on advocacy threat --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "An accountant publicly defends a client\u2019s aggressive tax position in a media interview, arguing it is legitimate even when colleagues have raised concerns. This BEST illustrates which threat?",
          prompt_ru:
            "Бухгалтер публично защищает агрессивную налоговую позицию клиента в интервью СМИ, утверждая, что она правомерна, хотя коллеги выражали сомнения. Это ЛУЧШЕ всего иллюстрирует какую угрозу?",
          options: [
            {
              key: "A",
              text_en: "Self-interest",
              text_ru: "Личной заинтересованности",
              why_wrong_en:
                "Self-interest threats involve personal financial or other benefit; here the accountant is championing the client's position publicly, which is advocacy.",
              why_wrong_ru:
                "Угрозы личной заинтересованности связаны с личной финансовой или иной выгодой; здесь бухгалтер публично отстаивает позицию клиента, что является защитой.",
            },
            { key: "B", text_en: "Advocacy", text_ru: "Защиты" },
            {
              key: "C",
              text_en: "Familiarity",
              text_ru: "Близкого знакомства",
              why_wrong_en:
                "Familiarity comes from long personal closeness; the scenario describes professional advocacy, not personal relationship.",
              why_wrong_ru:
                "Близкое знакомство возникает из долгой личной близости; здесь же — профессиональная защита, а не личные отношения.",
            },
            {
              key: "D",
              text_en: "Intimidation",
              text_ru: "Запугивания",
              why_wrong_en:
                "Intimidation requires pressure being applied TO the accountant; here the accountant is choosing to advocate.",
              why_wrong_ru:
                "Запугивание требует давления НА бухгалтера; здесь же бухгалтер сам выбирает защищать.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Advocacy threat arises when an accountant promotes a client's position to a point where independence and objectivity are compromised. Acting as the client's public defender — especially when colleagues have flagged concerns — crosses from objective professional opinion into partisan advocacy.",
          explanation_ru:
            "Угроза защиты возникает, когда бухгалтер продвигает позицию клиента до такой степени, что независимость и объективность ставятся под удар. Выступление в роли публичного защитника клиента — особенно при сомнениях коллег — переходит из объективного профессионального мнения в одностороннюю защиту.",
        },
        // -------- NEW Q7 — easy MCQ on intimidation threat --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "During an audit, a client\u2019s CFO threatens to dismiss the audit firm if a contentious accounting treatment is challenged. This is an example of which threat?",
          prompt_ru:
            "В ходе аудита финансовый директор клиента угрожает уволить аудиторскую фирму, если она оспорит спорный учётный метод. Это пример какой угрозы?",
          options: [
            {
              key: "A",
              text_en: "Self-interest",
              text_ru: "Личной заинтересованности",
              why_wrong_en:
                "Self-interest is the auditor's own financial/personal interest; here the threat comes FROM the client, not from within the auditor.",
              why_wrong_ru:
                "Личная заинтересованность — это собственный финансовый/личный интерес аудитора; здесь же угроза исходит ОТ клиента, а не изнутри.",
            },
            {
              key: "B",
              text_en: "Self-review",
              text_ru: "Самопроверки",
              why_wrong_en:
                "Self-review concerns reviewing one's own prior work; the scenario is about external pressure, not internal review bias.",
              why_wrong_ru:
                "Самопроверка касается проверки собственной прежней работы; в сценарии — внешнее давление, не предвзятость внутренней проверки.",
            },
            {
              key: "C",
              text_en: "Advocacy",
              text_ru: "Защиты",
              why_wrong_en:
                "Advocacy is when the accountant champions the client's position; here the accountant is being PUSHED, not advocating.",
              why_wrong_ru:
                "Защита — это когда бухгалтер сам отстаивает позицию клиента; здесь же на него ДАВЯТ, а не он защищает.",
            },
            { key: "D", text_en: "Intimidation", text_ru: "Запугивания" },
          ],
          correct_answer_en: "D",
          explanation_en:
            "Intimidation threat arises when an accountant feels pressured — actually or perceived — into agreeing with a client's position. Threats of dismissal, litigation, or aggressive personal behaviour are typical examples. Safeguards include audit committee involvement, escalating to senior firm leadership, and being prepared to withdraw from the engagement if necessary.",
          explanation_ru:
            "Угроза запугивания возникает, когда бухгалтер ощущает давление — реальное или предполагаемое — согласиться с позицией клиента. Типичные примеры: угрозы увольнения, судебных исков, агрессивное личное поведение. Защитные меры: вовлечение аудиторского комитета, эскалация к старшему руководству фирмы и готовность отказаться от задания при необходимости.",
        },
        // -------- NEW Q8 — easy short_answer on safeguards --------
                {
          type: "mcq",
          difficulty: "easy",
          prompt_en: "The IESBA Code groups safeguards against ethical threats into three categories. Which of the following is one of them?",
          prompt_ru: "Кодекс IESBA делит меры защиты от этических угроз на три категории. Какая из перечисленных к ним относится?",
          options: [
            {
              key: "A",
              text_en: "Safeguards created by the profession or legislation",
              text_ru: "Меры, созданные профессией или законодательством",
            },
            {
              key: "B",
              text_en: "Safeguards created by competitors",
              text_ru: "Меры, создаваемые конкурентами",
              why_wrong_en: "Competitors play no role in the safeguards framework; the three categories are profession/legislation, the firm, and the client.",
              why_wrong_ru: "Конкуренты не участвуют в системе мер защиты; три категории — профессия/законодательство, фирма и клиент.",
            },
            {
              key: "C",
              text_en: "Safeguards created by the tax authority",
              text_ru: "Меры, создаваемые налоговым органом",
              why_wrong_en: "The tax authority is not one of the three safeguard sources; these are the profession/legislation, the firm, and the client.",
              why_wrong_ru: "Налоговый орган не относится к трём источникам мер; это профессия/законодательство, фирма и клиент.",
            },
            {
              key: "D",
              text_en: "Safeguards created by shareholders",
              text_ru: "Меры, создаваемые акционерами",
              why_wrong_en: "Shareholders are not a recognised safeguard category; the three are profession/legislation, within the firm, and within the client.",
              why_wrong_ru: "Акционеры не являются признанной категорией мер; три категории — профессия/законодательство, внутри фирмы и у клиента.",
            },
          ],
          correct_answer_en: "A",
          explanation_en: "The IESBA Code groups safeguards into three sources: those created by the profession or legislation (e.g. CPD, standards, regulatory oversight); those within the firm or employing organisation (e.g. independence policies, partner rotation); and those within the client's own systems and governance.",
          explanation_ru: "Кодекс IESBA выделяет три источника мер защиты: созданные профессией или законодательством (например, CPD, стандарты, регуляторный надзор); существующие внутри фирмы или организации-работодателя (например, политики независимости, ротация партнёров); и существующие в системах и управлении самого клиента.",
        },
        // -------- NEW Q9 — medium MCQ on familiarity threat --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "An audit partner has served the same client for 18 consecutive years and is close personal friends with the CFO. The MOST appropriate safeguard is:",
          prompt_ru:
            "Партнёр по аудиту обслуживает одного клиента 18 лет подряд и состоит в близких личных дружеских отношениях с финансовым директором. НАИБОЛЕЕ подходящая защитная мера:",
          options: [
            {
              key: "A",
              text_en: "Continued engagement with no change",
              text_ru: "Продолжать работу без изменений",
              why_wrong_en:
                "No change ignores the familiarity threat entirely; the duration and personal closeness make objective challenge psychologically difficult.",
              why_wrong_ru:
                "Отсутствие изменений полностью игнорирует угрозу близкого знакомства; продолжительность и личная близость затрудняют объективный профессиональный скепсис.",
            },
            {
              key: "B",
              text_en: "Rotation of the audit partner to a new lead",
              text_ru: "Ротация партнёра по аудиту на нового ведущего",
            },
            {
              key: "C",
              text_en: "A larger audit fee to incentivise diligence",
              text_ru:
                "Увеличение аудиторского гонорара для стимулирования усердия",
              why_wrong_en:
                "A larger fee creates a self-interest threat — it incentivises retaining the client rather than challenging them; it does not address familiarity.",
              why_wrong_ru:
                "Больший гонорар создаёт угрозу личной заинтересованности — стимулирует удерживать клиента, а не оспаривать; угрозу близкого знакомства это не устраняет.",
            },
            {
              key: "D",
              text_en: "The partner gives the CFO additional advisory work",
              text_ru:
                "Партнёр берёт у CFO дополнительные консультационные задания",
              why_wrong_en:
                "Adding advisory work creates self-review and self-interest threats in addition to the existing familiarity threat — it makes the situation worse.",
              why_wrong_ru:
                "Добавление консультационных заданий создаёт угрозы самопроверки и личной заинтересованности в дополнение к существующей угрозе близкого знакомства — ситуация только ухудшается.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Partner rotation is the standard safeguard for familiarity threats arising from long-standing engagements. Most professional standards require rotation of the lead audit partner after a defined period (typically 5-7 years for listed companies). The new partner can challenge entrenched assumptions and re-examine matters that the previous partner may have come to accept without question.",
          explanation_ru:
            "Ротация партнёра — стандартная защитная мера от угрозы близкого знакомства, возникающей при длительной работе. Большинство профессиональных стандартов требуют ротации ведущего партнёра по аудиту через определённый срок (обычно 5-7 лет для публичных компаний). Новый партнёр может оспорить устоявшиеся допущения и пересмотреть вопросы, которые предыдущий партнёр мог начать принимать без сомнений.",
        },
        // -------- NEW Q10 — medium MCQ on confidentiality exception --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A court order compels an accountant to disclose specific client records. In this situation, the accountant should:",
          prompt_ru:
            "Судебное решение обязывает бухгалтера раскрыть конкретные сведения о клиенте. В этой ситуации бухгалтер должен:",
          options: [
            {
              key: "A",
              text_en:
                "Refuse to disclose to protect confidentiality at all costs",
              text_ru:
                "Отказаться раскрывать, чтобы защитить конфиденциальность любой ценой",
              why_wrong_en:
                "Confidentiality has exceptions — legal compulsion (such as a court order) is a standard one; refusing risks contempt of court.",
              why_wrong_ru:
                "У конфиденциальности есть исключения — юридическое принуждение (например, судебное решение) одно из стандартных; отказ грозит неуважением к суду.",
            },
            {
              key: "B",
              text_en:
                "Comply with the court order, disclosing only what is legally required",
              text_ru:
                "Исполнить судебное решение, раскрывая только то, что юридически требуется",
            },
            {
              key: "C",
              text_en:
                "Disclose everything to the court including unrelated client matters",
              text_ru: "Раскрыть всё суду, включая несвязанные дела клиента",
              why_wrong_en:
                "Disclosure should be LIMITED to what the order requires; volunteering additional information breaches confidentiality beyond legal necessity.",
              why_wrong_ru:
                "Раскрытие должно быть ОГРАНИЧЕНО тем, что требует решение; добровольная передача дополнительной информации нарушает конфиденциальность сверх юридической необходимости.",
            },
            {
              key: "D",
              text_en: "Tip off the client so they can prepare",
              text_ru: "Предупредить клиента, чтобы он подготовился",
              why_wrong_en:
                "Tipping off undermines the legal process and may itself be a criminal offence, particularly in money-laundering contexts.",
              why_wrong_ru:
                "Уведомление клиента подрывает юридическую процедуру и может само быть уголовным правонарушением, особенно в контексте противодействия отмыванию.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            'Confidentiality is not absolute. Disclosure is permitted or required where: (1) authorised by the client, (2) required by law (court order, statutory reporting like SARs, regulatory inquiry), or (3) a professional duty to disclose exists. The principle is "disclose only what is legally required and no more" — this respects confidentiality while complying with legal obligations.',
          explanation_ru:
            "Конфиденциальность не абсолютна. Раскрытие допустимо или обязательно при: (1) разрешении клиента, (2) требовании закона (судебное решение, обязательная отчётность вроде SAR, запрос регулятора), (3) наличии профессиональной обязанности раскрыть. Принцип: «раскрывать только то, что требуется законом, не больше» — это соблюдает конфиденциальность при исполнении юридических обязанностей.",
        },
        // -------- NEW Q11 — medium MCQ on gifts threshold --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A client offers an audit team a box of chocolates at Christmas worth approximately $30. The MOST appropriate response is:",
          prompt_ru:
            "Клиент дарит аудиторской команде на Рождество коробку конфет стоимостью около $30. НАИБОЛЕЕ уместная реакция:",
          options: [
            {
              key: "A",
              text_en: "Accept it but immediately resign from the engagement",
              text_ru: "Принять, но немедленно отказаться от задания",
              why_wrong_en:
                "Resignation is a disproportionate response to a token gift; the threat from such a small item is trivial and easily managed.",
              why_wrong_ru:
                "Отказ от задания — несоразмерная реакция на символический подарок; угроза от такого мелкого знака внимания тривиальна и легко управляема.",
            },
            {
              key: "B",
              text_en:
                "Accept it as it is trivial and customary — no significant threat to objectivity",
              text_ru:
                "Принять, поскольку это символическое и обычное проявление вежливости — значимой угрозы объективности нет",
            },
            {
              key: "C",
              text_en: "Refuse on principle and lecture the client on ethics",
              text_ru:
                "Отказаться из принципа и прочитать клиенту лекцию об этике",
              why_wrong_en:
                "Lecturing the client is unprofessional and damages the relationship without ethical benefit; a polite acceptance or quiet refusal suffices.",
              why_wrong_ru:
                "Лекция клиенту непрофессиональна и портит отношения без этической пользы; достаточно вежливо принять или тихо отказаться.",
            },
            {
              key: "D",
              text_en:
                "Accept and offer to pay the client back at twice the value",
              text_ru: "Принять и предложить клиенту возместить вдвое",
              why_wrong_en:
                "This is an awkward overcorrection that may create its own conflict of interest; the gift is too trivial to warrant such response.",
              why_wrong_ru:
                "Это неловкая чрезмерная коррекция, которая может создать собственный конфликт интересов; подарок слишком мелкий для такой реакции.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Gifts must be evaluated against the threshold above which they could be seen as influencing professional judgement. A modest, customary token (chocolates, calendars, small flowers) typically falls well below the threshold and creates no real threat to objectivity. The test is reasonable: would an informed third party consider this gift significant enough to influence the accountant? For $30 chocolates shared across a team, the answer is clearly no. The same gift in cash, or a $1,000 hamper, would be a different matter entirely.",
          explanation_ru:
            "Подарки оцениваются по порогу, выше которого они могут восприниматься как влияющие на профессиональное суждение. Скромный, традиционный знак внимания (конфеты, календари, небольшие цветы) обычно намного ниже этого порога и не создаёт реальной угрозы объективности. Проверка проста: счёл бы информированный сторонний наблюдатель этот подарок достаточно значимым, чтобы повлиять на бухгалтера? Для конфет за $30 на всю команду — очевидно нет. Тот же подарок наличными или корзина за $1 000 — совершенно другое дело.",
        },
        // -------- NEW Q12 — medium MCQ on integrity vs other principles --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A junior accountant is asked by their manager to backdate an invoice to reflect revenue in the current period instead of the next. The PRIMARY principle this would breach is:",
          prompt_ru:
            "Младшему бухгалтеру руководитель поручает перенести дату счёта-фактуры задним числом, чтобы выручка отражалась в текущем периоде, а не в следующем. ОСНОВНОЙ принцип, который это нарушит:",
          options: [
            { key: "A", text_en: "Integrity", text_ru: "Честности" },
            {
              key: "B",
              text_en: "Confidentiality",
              text_ru: "Конфиденциальности",
              why_wrong_en:
                "Confidentiality concerns non-disclosure of client information; backdating a document is about honesty, not disclosure.",
              why_wrong_ru:
                "Конфиденциальность касается неразглашения сведений клиента; перенос даты документа — про честность, а не раскрытие.",
            },
            {
              key: "C",
              text_en: "Professional competence",
              text_ru: "Профессиональной компетентности",
              why_wrong_en:
                "Competence is about knowledge and skill; the accountant likely KNOWS how to make the backdating, the question is whether they SHOULD.",
              why_wrong_ru:
                "Компетентность — про знания и навыки; бухгалтер, скорее всего, ЗНАЕТ, как изменить дату; вопрос в том, СТОИТ ли это делать.",
            },
            {
              key: "D",
              text_en: "Objectivity",
              text_ru: "Объективности",
              why_wrong_en:
                "Objectivity is about avoiding bias in professional judgement; backdating is straightforward dishonesty, primarily an integrity issue.",
              why_wrong_ru:
                "Объективность — про отсутствие предвзятости в профессиональном суждении; перенос даты — прямая нечестность, в первую очередь вопрос честности.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Integrity requires accountants to be straightforward and honest in all professional and business relationships. Backdating a document is direct misrepresentation — falsifying the timing of a transaction to mislead users of the financial statements. The junior accountant should refuse and escalate. Other principles are affected too (professional behaviour, possibly objectivity), but integrity is the primary breach.",
          explanation_ru:
            "Честность требует от бухгалтера быть прямым и порядочным во всех профессиональных и деловых отношениях. Перенос даты документа задним числом — это прямое искажение, фальсификация времени операции с целью ввести в заблуждение пользователей отчётности. Младший бухгалтер должен отказаться и эскалировать. Затронуты и другие принципы (профессиональное поведение, возможно объективность), но главное нарушение — честности.",
        },
        // -------- NEW Q13 — medium short_answer on due care --------
                {
          type: "mcq",
          difficulty: "medium",
          prompt_en: "The IESBA principle of \"professional competence and due care\" has two distinct obligations. Which option correctly states BOTH?",
          prompt_ru: "Принцип IESBA «профессиональная компетентность и должная осмотрительность» состоит из двух отдельных обязанностей. В каком варианте верно указаны ОБЕ?",
          options: [
            {
              key: "A",
              text_en: "Maintain professional knowledge and skill at the required level; and act diligently in accordance with applicable standards",
              text_ru: "Поддерживать профессиональные знания и навыки на требуемом уровне; и действовать добросовестно в соответствии с применимыми стандартами",
            },
            {
              key: "B",
              text_en: "Keep client information confidential; and avoid conflicts of interest",
              text_ru: "Сохранять конфиденциальность информации клиента; и избегать конфликта интересов",
              why_wrong_en: "These describe confidentiality and objectivity — different fundamental principles, not the two limbs of competence and due care.",
              why_wrong_ru: "Это описывает конфиденциальность и объективность — другие основополагающие принципы, а не две части компетентности и должной осмотрительности.",
            },
            {
              key: "C",
              text_en: "Be honest in all dealings; and behave professionally in public",
              text_ru: "Быть честным во всех делах; и вести себя профессионально публично",
              why_wrong_en: "These describe integrity and professional behaviour, not competence and due care.",
              why_wrong_ru: "Это описывает честность и профессиональное поведение, а не компетентность и должную осмотрительность.",
            },
            {
              key: "D",
              text_en: "Charge fair fees; and complete work on time",
              text_ru: "Назначать справедливые гонорары; и выполнять работу в срок",
              why_wrong_en: "Fee-setting and timeliness are practice-management matters, not the two obligations within competence and due care.",
              why_wrong_ru: "Назначение гонораров и соблюдение сроков — вопросы управления практикой, а не две обязанности в рамках компетентности и должной осмотрительности.",
            },
          ],
          correct_answer_en: "A",
          explanation_en: "The principle has two limbs. Competence is the obligation to keep learning — CPD, staying current with standards, and declining work outside one's expertise. Due care is the obligation to act carefully — applying knowledge diligently, following procedures, and completing work to professional standard.",
          explanation_ru: "Принцип состоит из двух частей. Компетентность — обязанность учиться: CPD, отслеживание изменений в стандартах, отказ от работы вне своей экспертизы. Должная осмотрительность — обязанность действовать внимательно: добросовестно применять знания, следовать процедурам и выполнять работу по профессиональным стандартам.",
        },
        // -------- NEW Q14 — hard MCQ on multiple threats scenario --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            'An audit firm provides its largest client with both the annual audit and substantial tax-advisory work. The audit lead is the spouse of the client\u2019s finance director. The client recently hinted that "we expect smooth audits in light of our long relationship." This scenario contains the GREATEST number of threats from which set?',
          prompt_ru:
            "Аудиторская фирма оказывает крупнейшему клиенту и годовой аудит, и существенные налогово-консультационные услуги. Ведущий аудитор — супруг(а) финансового директора клиента. Клиент недавно намекнул: «мы ожидаем плавных аудитов с учётом наших долгих отношений». Какой набор угроз представлен в этом сценарии в НАИБОЛЬШЕМ количестве?",
          options: [
            {
              key: "A",
              text_en: "Self-interest, self-review, familiarity, intimidation",
              text_ru:
                "Личная заинтересованность, самопроверка, близкое знакомство, запугивание",
            },
            {
              key: "B",
              text_en: "Self-interest, advocacy, familiarity",
              text_ru: "Личная заинтересованность, защита, близкое знакомство",
              why_wrong_en:
                "Advocacy isn't present in the scenario — there's no public defending of the client's position. Self-review and intimidation are missing from this answer.",
              why_wrong_ru:
                "Защиты в сценарии нет — нет публичного отстаивания позиции клиента. В этом варианте отсутствуют самопроверка и запугивание.",
            },
            {
              key: "C",
              text_en: "Self-review, advocacy, intimidation",
              text_ru: "Самопроверка, защита, запугивание",
              why_wrong_en:
                "This misses self-interest (largest-client status, fee dependency) and familiarity (spouse relationship), and incorrectly includes advocacy.",
              why_wrong_ru:
                "Пропущены личная заинтересованность (статус крупнейшего клиента, зависимость от гонораров) и близкое знакомство (супружеские отношения); защита упомянута ошибочно.",
            },
            {
              key: "D",
              text_en: "Familiarity only",
              text_ru: "Только близкое знакомство",
              why_wrong_en:
                "This grossly understates the threats — the scenario clearly contains multiple threat categories, not just one.",
              why_wrong_ru:
                "Это сильно занижает уровень угроз — в сценарии явно присутствуют несколько категорий, а не одна.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            'Four distinct threats present here. (1) Self-interest: "largest client" implies fee dependency — losing this client materially affects the firm. (2) Self-review: providing tax-advisory work creates a position to review (the audit assesses tax balances the firm itself advised on). (3) Familiarity: spouse of the finance director is a textbook close personal relationship. (4) Intimidation: the hint about "smooth audits" is an implied threat — meet expectations or lose us. Each threat alone would require safeguards; together they are likely incompatible with continuing the engagement.',
          explanation_ru:
            "Здесь присутствуют четыре отдельные угрозы. (1) Личная заинтересованность: «крупнейший клиент» подразумевает зависимость от гонораров — потеря клиента существенно ударит по фирме. (2) Самопроверка: налогово-консультационная работа создаёт позицию для проверки (аудит оценивает налоговые остатки, по которым сама фирма консультировала). (3) Близкое знакомство: супруг(а) финдиректора — хрестоматийный пример тесных личных отношений. (4) Запугивание: намёк на «плавный аудит» — это завуалированная угроза: соответствуйте ожиданиям или потеряете нас. Любая из этих угроз по отдельности требует защитных мер; в совокупности они, вероятно, несовместимы с продолжением задания.",
        },
        // -------- NEW Q15 — hard MCQ on bribery + cross-border ethics --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            'A multinational firm operates in a country where it is locally customary to pay a small "facilitation fee" to officials to speed up customs clearance. From the IESBA Code perspective, the accountant in this firm should:',
          prompt_ru:
            "Транснациональная компания работает в стране, где принято платить чиновникам небольшой «ускорительный сбор» для быстрого прохождения таможни. С точки зрения Кодекса IESBA бухгалтер этой компании должен:",
          options: [
            {
              key: "A",
              text_en:
                "Pay the fee as it is locally customary and culturally appropriate",
              text_ru:
                "Платить сбор, поскольку это местная традиция и культурно уместно",
              why_wrong_en:
                "Local custom does not override the IESBA principle of professional behaviour, which requires compliance with the wider legal framework — facilitation payments are illegal under most international anti-bribery laws.",
              why_wrong_ru:
                "Местная традиция не отменяет принцип IESBA «профессиональное поведение», требующий соблюдения более широкой правовой базы — ускорительные платежи незаконны по большинству международных антикоррупционных законов.",
            },
            {
              key: "B",
              text_en:
                "Refuse to make or record such payments, applying professional behaviour and integrity principles",
              text_ru:
                "Отказаться совершать или учитывать такие платежи, применяя принципы профессионального поведения и честности",
            },
            {
              key: "C",
              text_en:
                'Pay the fee but record it as a "consultancy expense" to avoid scrutiny',
              text_ru:
                "Платить сбор, но учитывать его как «консультационные расходы» во избежание проверок",
              why_wrong_en:
                "Disguising the nature of payments is a clear breach of integrity AND professional behaviour — concealment compounds the original breach into a fraud.",
              why_wrong_ru:
                "Скрытие истинной природы платежей — явное нарушение И честности, И профессионального поведения; маскировка превращает изначальное нарушение в мошенничество.",
            },
            {
              key: "D",
              text_en: "Pay personally rather than through the company books",
              text_ru: "Платить лично, а не через бухгалтерию компании",
              why_wrong_en:
                "Personal payment doesn't change the legal or ethical character of the bribe; it simply hides it from corporate records, which compounds the breach.",
              why_wrong_ru:
                "Личный платёж не меняет ни юридическую, ни этическую природу взятки; он лишь скрывает её от корпоративных записей, усугубляя нарушение.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            'Facilitation payments are bribes regardless of local custom. Modern anti-bribery legislation (UK Bribery Act 2010, US Foreign Corrupt Practices Act) prohibits them with very narrow exceptions. From the IESBA perspective: professional behaviour requires compliance with laws AND avoidance of conduct that discredits the profession; integrity requires honesty about the nature of payments. The correct response is to refuse, to refuse to record it dishonestly if pressed, and to escalate internally. The "everyone does it locally" defence does not survive international scrutiny — and the accountant\'s career is unlikely to survive being personally associated with disguised bribery.',
          explanation_ru:
            "Ускорительные платежи — это взятки, независимо от местной традиции. Современное антикоррупционное законодательство (Bribery Act 2010 Великобритании, Foreign Corrupt Practices Act США) запрещает их с очень узкими исключениями. С точки зрения IESBA: профессиональное поведение требует соблюдения законов И отказа от действий, дискредитирующих профессию; честность требует правды о природе платежей. Правильный ответ — отказаться, отказаться нечестно учитывать, если давят, и эскалировать внутри. Защита «у нас все так делают» не выдерживает международной проверки — а карьера бухгалтера вряд ли выдержит личной связи со скрытой взяткой.",
        },
      ],
    },
  ],
};
