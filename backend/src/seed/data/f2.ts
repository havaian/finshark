// Seed content for the F2 (Management Accounting) paper.
// Structure mirrors the official ACCA 2024-25 syllabus sections A-F.
// Theory and question content is original, written to mimic the style of ACCA past
// papers without reproducing any copyrighted material verbatim.

import type { SeedPaper } from "./types";

export const F2_PAPER: SeedPaper = {
  code: "F2",
  name_en: "Management Accounting",
  name_ru: "Управленческий учёт",
  learning_objectives: [
    // ---------- A ----------
    {
      code: "A",
      title_en: "The nature, source and purpose of management information",
      title_ru: "Природа, источники и назначение управленческой информации",
      description_en:
        "Cost vs financial accounting, planning levels, data vs information, and information quality.",
      description_ru:
        "Управленческий и финансовый учёт, уровни планирования, данные и информация, качество информации.",
      sort_order: 10,
      theory_en:
        "Management accounting exists to support internal decision-making, while financial accounting reports to external stakeholders. The two differ on every dimension that matters: management accounting is forward-looking, flexible in format, often non-monetary, produced as frequently as needed, and not bound by external standards. Financial accounting is historical, prescribed in format by IFRS/local GAAP, monetary, and produced periodically for shareholders, regulators, and tax authorities.\n\n" +
        "Three managerial processes consume this information. Planning sets objectives and the means to reach them; decision-making chooses between alternatives; control compares actual performance against the plan and triggers corrective action. Planning itself operates on three time horizons. Strategic planning is long-term (3-10 years), made by senior management, and deals with mission, market positioning, and major investment. Tactical planning is medium-term (1-3 years), made by middle management, and translates strategy into resourcing and budgets. Operational planning is short-term (days to a year), made by line management, and covers day-to-day scheduling and routine decisions.\n\n" +
        "Data are raw facts (a list of sales transactions); information is data that has been processed to be useful (total sales by region this month). Good information has the attributes captured in the ACCURATE mnemonic: Accurate, Complete, Cost-effective (benefit exceeds cost), Understandable, Relevant, Authoritative (from a credible source), Timely, and Easy to use. Failing any one of these reduces the information's value to a decision-maker.\n\n" +
        "Sources of data are internal (transaction records, employee feedback, sensor/machine data) and external (government statistics, trade associations, suppliers' price lists, financial press, the internet). Each source carries reliability and cost trade-offs the analyst must weigh.",
      theory_ru:
        "Управленческий учёт обслуживает внутреннее принятие решений, а финансовый учёт — отчётность перед внешними сторонами. Они различаются по каждому значимому параметру: управленческий учёт ориентирован на будущее, свободен по формату, часто неденежный, формируется по мере необходимости и не связан внешними стандартами. Финансовый учёт исторический, форматно предписан МСФО/местными правилами, денежный, формируется периодически для акционеров, регуляторов и налоговых органов.\n\n" +
        "Информацию используют три управленческих процесса. Планирование задаёт цели и пути их достижения; принятие решений выбирает между альтернативами; контроль сравнивает фактические показатели с планом и инициирует корректирующие действия. Планирование действует на трёх временных горизонтах. Стратегическое планирование — долгосрочное (3-10 лет), осуществляется высшим руководством, охватывает миссию, позиционирование на рынке и крупные инвестиции. Тактическое планирование — среднесрочное (1-3 года), осуществляется средним звеном, переводит стратегию в ресурсы и бюджеты. Операционное планирование — краткосрочное (от дней до года), осуществляется линейным менеджментом, охватывает повседневное расписание и рутинные решения.\n\n" +
        "Данные — это сырые факты (список операций продажи); информация — это обработанные данные, ставшие полезными (общая выручка по регионам за месяц). Качественная информация обладает свойствами по мнемонике ACCURATE: Accurate (точная), Complete (полная), Cost-effective (выгода превышает затраты), Understandable (понятная), Relevant (релевантная), Authoritative (из надёжного источника), Timely (своевременная) и Easy to use (удобная). Несоблюдение хотя бы одного признака снижает ценность информации для лица, принимающего решение.\n\n" +
        "Источники данных делятся на внутренние (учётные записи операций, отзывы сотрудников, данные датчиков и оборудования) и внешние (государственная статистика, отраслевые ассоциации, прейскуранты поставщиков, финансовая пресса, интернет). Каждый источник несёт компромисс между надёжностью и стоимостью получения.",
      questions: [
        // -------- Q1 — easy MCQ on FA vs MA --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "Which statement BEST distinguishes management accounting from financial accounting?",
          prompt_ru:
            "Какое утверждение ЛУЧШЕ всего отличает управленческий учёт от финансового?",
          options: [
            {
              key: "A",
              text_en: "Management accounting is governed by IFRS",
              text_ru: "Управленческий учёт регулируется МСФО",
              why_wrong_en:
                "IFRS governs FINANCIAL accounting (external reporting); management accounting is unregulated and tailored to internal needs.",
              why_wrong_ru:
                "МСФО регулируют ФИНАНСОВЫЙ учёт (внешнюю отчётность); управленческий учёт не регулируется и адаптируется под внутренние нужды.",
            },
            {
              key: "B",
              text_en:
                "Management accounting is primarily forward-looking and serves internal decision-makers",
              text_ru:
                "Управленческий учёт ориентирован на будущее и обслуживает внутренних лиц, принимающих решения",
            },
            {
              key: "C",
              text_en:
                "Management accounting is required by law for all companies",
              text_ru:
                "Управленческий учёт обязателен по закону для всех компаний",
              why_wrong_en:
                "Management accounting is voluntary — there is no legal requirement; financial accounting is the one mandated by company law.",
              why_wrong_ru:
                "Управленческий учёт добровольный — закон его не требует; обязательный по закону — финансовый учёт.",
            },
            {
              key: "D",
              text_en: "Management accounting reports only annually",
              text_ru: "Управленческий учёт отчитывается только ежегодно",
              why_wrong_en:
                "Management accounting reports as frequently as managers need (daily, weekly, monthly); FINANCIAL accounting tends to the periodic cycle.",
              why_wrong_ru:
                "Управленческий учёт формируется так часто, как нужно менеджерам (ежедневно, еженедельно, ежемесячно); периодичность характерна для ФИНАНСОВОГО учёта.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "The defining contrast: management accounting looks FORWARD to support decisions, while financial accounting looks BACKWARD to report performance. The other choices reverse properties that actually belong to financial accounting.",
          explanation_ru:
            "Главный контраст: управленческий учёт смотрит ВПЕРЁД, поддерживая решения, а финансовый — НАЗАД, для отчётности о результатах. Остальные варианты приписывают управленческому учёту свойства финансового.",
        },
        // -------- Q2 — easy MCQ on planning level --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "A factory supervisor draws up next week\u2019s production schedule. This decision is BEST classified as:",
          prompt_ru:
            "Начальник смены составляет производственный график на следующую неделю. Это решение ЛУЧШЕ всего классифицировать как:",
          options: [
            {
              key: "A",
              text_en: "Strategic",
              text_ru: "Стратегическое",
              why_wrong_en:
                "Strategic planning is long-term (3-10 years) and made by senior management; a weekly schedule is operational.",
              why_wrong_ru:
                "Стратегическое планирование — долгосрочное (3-10 лет) и делается высшим руководством; недельный график — это операционное планирование.",
            },
            {
              key: "B",
              text_en: "Tactical",
              text_ru: "Тактическое",
              why_wrong_en:
                "Tactical planning is medium-term (1-3 years) — translating strategy into resourcing; weekly scheduling is below this level.",
              why_wrong_ru:
                "Тактическое планирование — среднесрочное (1-3 года) — перевод стратегии в ресурсы; недельный график ниже этого уровня.",
            },
            { key: "C", text_en: "Operational", text_ru: "Операционное" },
            {
              key: "D",
              text_en: "External",
              text_ru: "Внешнее",
              why_wrong_en:
                'Planning levels are strategic/tactical/operational; "external" is not a standard category.',
              why_wrong_ru:
                "Уровни планирования — стратегический/тактический/операционный; «внешнее» не является стандартной категорией.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "Operational planning covers short-term, routine, day-to-day decisions made by line management — weekly production scheduling is the textbook example. The three levels: strategic (long-term, senior management, mission and market), tactical (medium-term, middle management, resources and budgets), operational (short-term, line management, scheduling and execution).",
          explanation_ru:
            "Операционное планирование охватывает краткосрочные, рутинные ежедневные решения линейного менеджмента — недельный производственный график это хрестоматийный пример. Три уровня: стратегический (долгосрочный, высшее руководство, миссия и рынок), тактический (среднесрочный, средний звено, ресурсы и бюджеты), операционный (краткосрочный, линейный менеджмент, расписание и исполнение).",
        },
        // -------- Q3 — easy short_answer on ACCURATE --------
        {
          type: "short_answer",
          difficulty: "easy",
          prompt_en:
            'In the ACCURATE mnemonic for qualities of good management information, what does the letter "T" stand for?',
          prompt_ru:
            'В мнемонике ACCURATE для характеристик качественной управленческой информации что обозначает буква "T"?',
          correct_answer_en: "Timely",
          correct_answer_ru: "Timely (своевременная)",
          explanation_en:
            "ACCURATE = Accurate, Complete, Cost-effective, Understandable, Relevant, Authoritative, Timely, Easy to use. Timely information reaches the decision-maker BEFORE the decision must be made — old information has reduced value even if technically correct.",
          explanation_ru:
            "ACCURATE = Accurate (точная), Complete (полная), Cost-effective (экономически целесообразная), Understandable (понятная), Relevant (релевантная), Authoritative (из надёжного источника), Timely (своевременная), Easy to use (удобная). Своевременная информация попадает к лицу, принимающему решение, ДО того, как решение должно быть принято — устаревшая информация теряет ценность, даже если технически верна.",
        },
        // -------- Q4 — easy MCQ on data vs information --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            'Which of the following BEST represents "information" rather than "data"?',
          prompt_ru:
            "Что из перечисленного ЛУЧШЕ всего представляет «информацию», а не «данные»?",
          options: [
            {
              key: "A",
              text_en:
                "A printed list of every individual sales transaction this month",
              text_ru: "Распечатанный список каждой отдельной продажи за месяц",
              why_wrong_en:
                "A raw list of transactions is DATA — facts without processing. Information requires processing into a usable form.",
              why_wrong_ru:
                "Сырой список операций — это ДАННЫЕ, факты без обработки. Информация требует переработки в полезную форму.",
            },
            {
              key: "B",
              text_en:
                "A summary showing total monthly sales by product line with year-on-year comparison",
              text_ru:
                "Сводка, показывающая ежемесячные продажи по продуктовым линиям с сопоставлением год к году",
            },
            {
              key: "C",
              text_en: "Raw scanner readings from till receipts",
              text_ru: "Сырые показания сканеров с кассовых чеков",
              why_wrong_en:
                "Scanner outputs are unprocessed signals — data in its rawest form.",
              why_wrong_ru:
                "Показания сканеров — необработанные сигналы, данные в самой сырой форме.",
            },
            {
              key: "D",
              text_en: "Time-stamped log entries from a production sensor",
              text_ru:
                "Записи журнала с метками времени с производственного датчика",
              why_wrong_en:
                "Sensor log entries are raw measurements — data, not information. To become information, they must be aggregated, contextualised, and presented usefully.",
              why_wrong_ru:
                "Записи датчика — сырые измерения, данные, не информация. Чтобы стать информацией, их нужно агрегировать, контекстуализировать и представить полезно.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "The data \u2192 information transition requires processing. A summary of monthly sales by product line with year-on-year comparison takes raw transaction data, aggregates it, structures it, and contextualises it \u2014 turning facts into something a manager can act on. Raw lists, scanner readings, and sensor logs are all examples of data awaiting that processing step.",
          explanation_ru:
            "Переход данные \u2192 информация требует обработки. Сводка ежемесячных продаж по продуктовым линиям с сопоставлением год к году берёт сырые транзакционные данные, агрегирует их, структурирует и контекстуализирует — превращая факты в нечто, на что менеджер может реагировать. Сырые списки, показания сканеров и логи датчиков — всё это примеры данных, ожидающих этой обработки.",
        },
        // -------- Q5 — medium MCQ on cost-effective info --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A finance team spends $50,000 on a custom report that helps the board save $8,000 in supplier costs. The information FAILS which ACCURATE quality?",
          prompt_ru:
            "Финансовая команда тратит $50 000 на индивидуальный отчёт, помогающий совету сэкономить $8 000 на поставщиках. Информация НЕ соответствует какому критерию ACCURATE?",
          options: [
            {
              key: "A",
              text_en: "Accuracy",
              text_ru: "Точности",
              why_wrong_en:
                "Nothing in the scenario suggests the information was inaccurate \u2014 the problem is its economic value, not its correctness.",
              why_wrong_ru:
                "В сценарии ничто не указывает на неточность — проблема в экономической ценности, а не в правильности.",
            },
            {
              key: "B",
              text_en: "Cost-effectiveness",
              text_ru: "Экономической целесообразности",
            },
            {
              key: "C",
              text_en: "Timeliness",
              text_ru: "Своевременности",
              why_wrong_en:
                "Timeliness concerns whether the information arrives before a decision must be made; the scenario doesn't indicate a timing issue.",
              why_wrong_ru:
                "Своевременность касается того, поступает ли информация до момента принятия решения; в сценарии вопрос не во времени.",
            },
            {
              key: "D",
              text_en: "Authoritativeness",
              text_ru: "Надёжности источника",
              why_wrong_en:
                "Authoritativeness is about source credibility, not cost; nothing suggests the data source was unreliable.",
              why_wrong_ru:
                "Надёжность источника — про доверие к источнику, не про стоимость; ничто не указывает на ненадёжность источника.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Cost-effectiveness requires that the benefit of producing information exceed its cost. Here $50,000 was spent to save $8,000 \u2014 a net loss of $42,000. The information may be perfectly accurate, timely, and authoritative, but it fails the economic test. This is the most overlooked ACCURATE quality because it requires comparing two values rather than examining the information itself.",
          explanation_ru:
            "Экономическая целесообразность требует, чтобы выгода от подготовки информации превышала её стоимость. Здесь потрачено $50 000 ради экономии $8 000 — чистый убыток $42 000. Информация может быть совершенно точной, своевременной и из надёжного источника, но экономический тест она проваливает. Это самый часто упускаемый критерий ACCURATE, потому что требует сравнения двух величин, а не анализа самой информации.",
        },
        // -------- Q6 — medium MCQ on internal vs external sources --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "Which of the following is an EXTERNAL data source for a manufacturing company?",
          prompt_ru:
            "Что из перечисленного является ВНЕШНИМ источником данных для производственной компании?",
          options: [
            {
              key: "A",
              text_en: "Production line sensor outputs",
              text_ru: "Показания датчиков производственной линии",
              why_wrong_en:
                "Sensors on the company's own equipment generate INTERNAL data.",
              why_wrong_ru:
                "Датчики на собственном оборудовании компании генерируют ВНУТРЕННИЕ данные.",
            },
            {
              key: "B",
              text_en: "Employee exit interviews",
              text_ru: "Выходные интервью увольняющихся сотрудников",
              why_wrong_en:
                "Employees are part of the organisation; their feedback is INTERNAL data.",
              why_wrong_ru:
                "Сотрудники — часть организации; их обратная связь — ВНУТРЕННИЕ данные.",
            },
            {
              key: "C",
              text_en: "Government economic statistics on industry growth",
              text_ru:
                "Государственная экономическая статистика по росту отрасли",
            },
            {
              key: "D",
              text_en: "The general ledger",
              text_ru: "Главная книга",
              why_wrong_en:
                "The general ledger contains the company's own transaction records \u2014 quintessentially INTERNAL data.",
              why_wrong_ru:
                "Главная книга содержит собственные транзакционные записи компании — это самый внутренний источник данных.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "Internal data is generated within the organisation (transactions, employee surveys, production logs, sensors). External data comes from outside (government statistics, trade associations, competitor reports, market research, the financial press). Government statistics about industry growth are a classic external source \u2014 useful for benchmarking and market analysis but published by a third party.",
          explanation_ru:
            "Внутренние данные генерируются внутри организации (операции, опросы сотрудников, производственные журналы, датчики). Внешние данные приходят извне (государственная статистика, отраслевые ассоциации, отчёты конкурентов, рыночные исследования, финансовая пресса). Госстатистика по росту отрасли — классический внешний источник, полезный для бенчмаркинга и рыночного анализа, но публикуемый третьей стороной.",
        },
        // -------- Q7 — medium MCQ on tactical level --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "Setting the annual marketing budget and allocating it across product lines is BEST classified as:",
          prompt_ru:
            "Утверждение годового маркетингового бюджета и его распределение по продуктовым линиям ЛУЧШЕ всего классифицировать как:",
          options: [
            {
              key: "A",
              text_en: "Strategic planning",
              text_ru: "Стратегическое планирование",
              why_wrong_en:
                "Strategic planning is multi-year and about mission and market positioning; an annual budget is medium-term resource allocation.",
              why_wrong_ru:
                "Стратегическое планирование — многолетнее, о миссии и позиционировании; годовой бюджет — среднесрочное распределение ресурсов.",
            },
            {
              key: "B",
              text_en: "Tactical planning",
              text_ru: "Тактическое планирование",
            },
            {
              key: "C",
              text_en: "Operational planning",
              text_ru: "Операционное планирование",
              why_wrong_en:
                "Operational planning is day-to-day execution; annual budgeting sits one level higher, in the resource-allocation tier.",
              why_wrong_ru:
                "Операционное планирование — это ежедневное исполнение; годовое бюджетирование на уровень выше, в слое распределения ресурсов.",
            },
            {
              key: "D",
              text_en: "Routine recording",
              text_ru: "Рутинная фиксация",
              why_wrong_en:
                "Routine recording is bookkeeping, not planning at all.",
              why_wrong_ru:
                "Рутинная фиксация — это бухгалтерия, не планирование вовсе.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Tactical planning sits between strategic (long-term direction) and operational (day-to-day execution). It translates strategy into medium-term resources and budgets: how much money goes to marketing this year, how it splits across product lines, what targets each division gets. The decision is made by middle management within the strategic frame set by the board.",
          explanation_ru:
            "Тактическое планирование находится между стратегическим (долгосрочное направление) и операционным (ежедневное исполнение). Оно переводит стратегию в среднесрочные ресурсы и бюджеты: сколько денег идёт на маркетинг в этом году, как они делятся между продуктовыми линиями, какие цели получает каждое подразделение. Решения принимает средний звено в рамках стратегии, заданной советом.",
        },
        // -------- Q8 — medium MCQ on planning vs control --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A manager compares this month\u2019s actual sales against the budget and investigates the variance. This activity is BEST described as:",
          prompt_ru:
            "Руководитель сравнивает фактические продажи месяца с бюджетом и исследует отклонение. Эта деятельность ЛУЧШЕ всего описывается как:",
          options: [
            {
              key: "A",
              text_en: "Planning",
              text_ru: "Планирование",
              why_wrong_en:
                "Planning sets the budget in advance; comparing against it after the fact is control, not planning.",
              why_wrong_ru:
                "Планирование задаёт бюджет заранее; сравнение постфактум — это контроль, а не планирование.",
            },
            {
              key: "B",
              text_en: "Decision-making",
              text_ru: "Принятие решений",
              why_wrong_en:
                "Decision-making chooses between alternatives; variance analysis identifies discrepancies, which may THEN lead to a decision but isn't itself the choice.",
              why_wrong_ru:
                "Принятие решений — это выбор между альтернативами; анализ отклонений выявляет расхождения, что МОЖЕТ привести к решению, но сам по себе выбором не является.",
            },
            { key: "C", text_en: "Control", text_ru: "Контроль" },
            {
              key: "D",
              text_en: "Strategy formulation",
              text_ru: "Формулирование стратегии",
              why_wrong_en:
                "Strategy formulation is long-term direction-setting; monthly variance analysis is operational control.",
              why_wrong_ru:
                "Формулирование стратегии — это долгосрочное определение направления; ежемесячный анализ отклонений — операционный контроль.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "The three managerial processes form a cycle. Planning sets objectives; decision-making chooses how to pursue them; CONTROL compares actual outcomes against the plan and triggers corrective action. Variance analysis (actual vs budget) is the heart of the control process. The control cycle: set standard \u2192 measure actual \u2192 identify variance \u2192 investigate cause \u2192 take corrective action \u2192 feed back to planning.",
          explanation_ru:
            "Три управленческих процесса образуют цикл. Планирование задаёт цели; принятие решений выбирает способы их достижения; КОНТРОЛЬ сравнивает фактические результаты с планом и инициирует корректирующие действия. Анализ отклонений (факт против бюджета) — сердце процесса контроля. Цикл контроля: задать норматив → измерить факт → выявить отклонение → исследовать причину → принять корректирующие действия → обратная связь к планированию.",
        },
        // -------- Q9 — medium MCQ on financial vs management accounting frequency --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "Which of the following is a feature of FINANCIAL accounting but NOT management accounting?",
          prompt_ru:
            "Что из перечисленного является характеристикой ФИНАНСОВОГО учёта, но НЕ управленческого?",
          options: [
            {
              key: "A",
              text_en: "Use of non-monetary measures alongside financial ones",
              text_ru:
                "Использование неденежных показателей наряду с финансовыми",
              why_wrong_en:
                "Non-monetary measures (units produced, customer satisfaction scores, lead times) are common in MANAGEMENT accounting, rare in financial.",
              why_wrong_ru:
                "Неденежные показатели (единицы выпуска, удовлетворённость клиентов, время выполнения) часто используются в УПРАВЛЕНЧЕСКОМ учёте, редко — в финансовом.",
            },
            {
              key: "B",
              text_en: "Compliance with IFRS or local GAAP",
              text_ru: "Соблюдение МСФО или местных стандартов учёта",
            },
            {
              key: "C",
              text_en: "Forward-looking forecasts and budgets",
              text_ru: "Прогнозы и бюджеты на будущее",
              why_wrong_en:
                "Forward-looking outputs (forecasts, budgets) are the DEFINING feature of MANAGEMENT accounting; financial accounting is backward-looking.",
              why_wrong_ru:
                "Прогнозы и бюджеты — ОПРЕДЕЛЯЮЩАЯ черта УПРАВЛЕНЧЕСКОГО учёта; финансовый смотрит назад.",
            },
            {
              key: "D",
              text_en: "Custom reports tailored to individual managers",
              text_ru: "Индивидуальные отчёты под конкретных руководителей",
              why_wrong_en:
                "Custom internal reports are management accounting; financial accounting reports are standardised across all external users.",
              why_wrong_ru:
                "Индивидуальные внутренние отчёты — это управленческий учёт; финансовая отчётность стандартизирована для всех внешних пользователей.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Financial accounting must comply with IFRS or local GAAP because its output goes to external users \u2014 shareholders, regulators, tax authorities \u2014 who need consistent comparable information across entities. Management accounting has no external standard; managers can use whatever format, frequency, and measures help them decide.",
          explanation_ru:
            "Финансовый учёт должен соответствовать МСФО или местным стандартам, потому что его результаты идут внешним пользователям — акционерам, регуляторам, налоговым органам, — которым нужна согласованная сопоставимая информация по разным компаниям. У управленческого учёта внешних стандартов нет; руководители могут использовать любой формат, частоту и показатели, помогающие принимать решения.",
        },
        // -------- Q10 — medium short_answer on three planning levels --------
        {
          type: "short_answer",
          difficulty: "medium",
          prompt_en:
            "Name the THREE levels of organisational planning in order from longest to shortest time horizon.",
          prompt_ru:
            "Назовите ТРИ уровня организационного планирования в порядке от самого длинного к самому короткому временному горизонту.",
          correct_answer_en: "Strategic, tactical, operational",
          correct_answer_ru: "Стратегическое, тактическое, операционное",
          explanation_en:
            "Strategic (3-10 years, senior management, mission and major investment) \u2192 tactical (1-3 years, middle management, resources and budgets) \u2192 operational (days to a year, line management, day-to-day scheduling). Each level cascades down: the strategic frame constrains tactical choices, which in turn constrain operational decisions. The shorter the horizon, the more concrete and detailed the planning becomes.",
          explanation_ru:
            "Стратегическое (3-10 лет, высшее руководство, миссия и крупные инвестиции) → тактическое (1-3 года, средний звено, ресурсы и бюджеты) → операционное (от дней до года, линейный менеджмент, ежедневное расписание). Каждый уровень каскадируется вниз: стратегическая рамка ограничивает тактические выборы, которые в свою очередь ограничивают операционные решения. Чем короче горизонт, тем конкретнее и детальнее планирование.",
        },
        // -------- Q11 — medium MCQ on accuracy --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A manager receives a sales report claiming 12.7% growth, but the source spreadsheet contains a known formula error inflating the figure. The information PRIMARILY fails which ACCURATE quality?",
          prompt_ru:
            "Руководитель получает отчёт о продажах с указанием роста 12,7%, но в исходной таблице обнаружена ошибка формулы, завышающая цифру. Информация в ПЕРВУЮ ОЧЕРЕДЬ не соответствует какому критерию ACCURATE?",
          options: [
            { key: "A", text_en: "Accuracy", text_ru: "Точности" },
            {
              key: "B",
              text_en: "Completeness",
              text_ru: "Полноты",
              why_wrong_en:
                "Completeness concerns whether all relevant information is present; here the figure IS present but WRONG, which is an accuracy issue.",
              why_wrong_ru:
                "Полнота — это наличие всей нужной информации; здесь цифра ЕСТЬ, но НЕВЕРНА, что относится к точности.",
            },
            {
              key: "C",
              text_en: "Relevance",
              text_ru: "Релевантности",
              why_wrong_en:
                "Relevance asks whether the information addresses the question \u2014 sales growth is relevant to the decision; the problem is its correctness, not its topic.",
              why_wrong_ru:
                "Релевантность — про соответствие информации вопросу; рост продаж релевантен решению, проблема в правильности, а не в теме.",
            },
            {
              key: "D",
              text_en: "Timeliness",
              text_ru: "Своевременности",
              why_wrong_en:
                "Nothing in the scenario indicates the report was late.",
              why_wrong_ru:
                "В сценарии ничто не указывает на запоздалость отчёта.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Accuracy means the information correctly reflects the underlying reality. A formula error inflating a growth figure is a direct accuracy failure: the number in the report does not equal the number reality supports. Accuracy is the first letter of ACCURATE because it's a precondition for any other quality to matter \u2014 perfectly timely, complete, relevant information is useless if the numbers are wrong.",
          explanation_ru:
            "Точность означает, что информация правильно отражает реальность. Ошибка формулы, завышающая рост, — прямой провал точности: цифра в отчёте не соответствует тому, что реально произошло. Точность — первая буква в ACCURATE именно потому, что это предусловие для остальных критериев: совершенно своевременная, полная, релевантная информация бесполезна, если цифры неверны.",
        },
        // -------- Q12 — medium MCQ on planning levels mapping --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A board decides to acquire a competitor company over the next 18 months as part of expansion into a new market. This decision sits PRIMARILY at which planning level?",
          prompt_ru:
            "Совет принимает решение приобрести компанию-конкурента в течение следующих 18 месяцев в рамках выхода на новый рынок. Это решение находится в ПЕРВУЮ ОЧЕРЕДЬ на каком уровне планирования?",
          options: [
            { key: "A", text_en: "Strategic", text_ru: "Стратегическое" },
            {
              key: "B",
              text_en: "Tactical",
              text_ru: "Тактическое",
              why_wrong_en:
                "Although the timeframe is 18 months (which is tactical territory), the substance \u2014 entering a new market via acquisition \u2014 is strategic in nature. The 18-month horizon is just when execution starts.",
              why_wrong_ru:
                "Хотя горизонт 18 месяцев (территория тактического), суть — выход на новый рынок через приобретение — стратегическая по природе. 18 месяцев — это просто начало исполнения.",
            },
            {
              key: "C",
              text_en: "Operational",
              text_ru: "Операционное",
              why_wrong_en:
                "Acquisition of a competitor is far above day-to-day operational scope.",
              why_wrong_ru:
                "Приобретение конкурента — далеко за пределами операционного уровня повседневных решений.",
            },
            {
              key: "D",
              text_en: "Routine",
              text_ru: "Рутинное",
              why_wrong_en:
                "Acquisitions are by definition not routine; they involve significant strategic and financial commitment.",
              why_wrong_ru:
                "Приобретения по определению не рутинные; они связаны со значительными стратегическими и финансовыми обязательствами.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Planning level is determined by SUBSTANCE more than purely by time horizon. Acquisition of a competitor to enter a new market reshapes the organisation's competitive position \u2014 that's the definition of strategic. The 18-month timeline is the implementation runway, not the decision's character. Distinguishing carefully matters: an exam trap is to classify by calendar time alone, treating \"less than 3 years\" as automatically tactical.",
          explanation_ru:
            "Уровень планирования определяется СУЩНОСТЬЮ, а не только горизонтом времени. Приобретение конкурента для выхода на новый рынок перекраивает конкурентное положение организации — это и есть определение стратегического. 18 месяцев — это срок реализации, а не природа решения. Различать важно: экзаменационная ловушка — классифицировать только по календарю, относя «меньше 3 лет» автоматически к тактическому.",
        },
        // -------- Q13 — medium short_answer on data vs information --------
        {
          type: "short_answer",
          difficulty: "medium",
          prompt_en:
            'Define the difference between "data" and "information" in one sentence.',
          prompt_ru:
            "Определите разницу между «данными» и «информацией» одним предложением.",
          correct_answer_en:
            "Data are raw, unprocessed facts; information is data that has been processed, organised, or presented in a way that makes it useful for a decision-maker.",
          correct_answer_ru:
            "Данные — это сырые, необработанные факты; информация — это данные, обработанные, организованные или представленные таким образом, чтобы быть полезными лицу, принимающему решение.",
          explanation_en:
            'The shorthand is "information = processed data". Examples: a list of all transactions in May = data; a summary chart of May sales by region = information. Same underlying facts, different level of processing. Some texts add "knowledge" as a higher tier (information combined with experience and judgement), but F2 only tests the data vs information distinction.',
          explanation_ru:
            "Сокращённо: «информация = обработанные данные». Примеры: список всех операций за май — данные; сводная диаграмма продаж за май по регионам — информация. Те же исходные факты, разный уровень обработки. Некоторые учебники добавляют «знание» как более высокий уровень (информация в сочетании с опытом и суждением), но F2 проверяет только различие данные/информация.",
        },
        // -------- Q14 — hard MCQ on relevance vs completeness --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            "A pricing committee receives a 200-page report covering every aspect of every product line, including dozens of metrics unrelated to the pricing decision they must make. The report is technically accurate, fully complete, and arrives on time. The PRIMARY quality this report fails is:",
          prompt_ru:
            "Комитет по ценообразованию получает 200-страничный отчёт, охватывающий каждый аспект каждой продуктовой линии, включая десятки показателей, не относящихся к решению о ценах. Отчёт технически точен, полон и поступил вовремя. Какому критерию ACCURATE он в ПЕРВУЮ ОЧЕРЕДЬ не соответствует?",
          options: [
            {
              key: "A",
              text_en: "Accuracy",
              text_ru: "Точности",
              why_wrong_en:
                "The scenario explicitly states the report is accurate \u2014 the numbers are right.",
              why_wrong_ru:
                "В сценарии прямо сказано, что отчёт точен — цифры верны.",
            },
            {
              key: "B",
              text_en: "Completeness",
              text_ru: "Полноты",
              why_wrong_en:
                "The scenario states the report is fully complete; if anything it's OVER-complete.",
              why_wrong_ru:
                "В сценарии указано, что отчёт полон; если что, он СВЕРХ-полон.",
            },
            {
              key: "C",
              text_en: "Relevance (and Easy-to-use)",
              text_ru: "Релевантности (и удобства использования)",
            },
            {
              key: "D",
              text_en: "Timeliness",
              text_ru: "Своевременности",
              why_wrong_en: "The scenario states the report arrives on time.",
              why_wrong_ru: "В сценарии указано, что отчёт поступает вовремя.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            'More information is not always better information. Relevance asks whether what the user receives bears on the decision they must make; Easy-to-use asks whether it can be processed without struggling. A 200-page report packed with unrelated metrics drowns the pricing signal in noise: relevant details are buried, decision-makers waste time, and key trade-offs may go unspotted. "Over-disclosure" is a real failure mode \u2014 information overload reduces the value of the genuine signal. This question deliberately tests whether students remember that ACCURATE qualities must ALL be present; failing even one breaks usefulness.',
          explanation_ru:
            "Больше информации не значит лучше. Релевантность — это про то, относится ли полученное к решению, которое надо принять; удобство использования — про то, можно ли обработать материал без мучений. 200-страничный отчёт с массой несвязанных метрик топит ценовой сигнал в шуме: важные детали прячутся, время решающих тратится впустую, ключевые компромиссы можно упустить. «Информационная перегрузка» — реальный режим отказа, снижающий ценность реального сигнала. Вопрос намеренно проверяет, помнит ли студент, что критерии ACCURATE должны выполняться ВСЕ: провал даже одного ломает полезность.",
        },
        // -------- Q15 — hard MCQ on planning hierarchy edge case --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            "A board approves the long-term mission, but middle management consistently translates it into tactical plans that contradict the strategic frame, and operational managers then execute against the tactical plans. The MOST LIKELY consequence is:",
          prompt_ru:
            "Совет утверждает долгосрочную миссию, но средний звено стабильно переводит её в тактические планы, противоречащие стратегической рамке, а операционные руководители исполняют тактические планы. НАИБОЛЕЕ ВЕРОЯТНОЕ следствие:",
          options: [
            {
              key: "A",
              text_en:
                "The organisation will achieve its strategic mission anyway because operational execution is strong",
              text_ru:
                "Организация всё равно достигнет стратегической миссии, потому что операционное исполнение сильное",
              why_wrong_en:
                "Strong execution of the wrong plan accelerates failure rather than fixing it; operational excellence amplifies whatever tactical direction it serves.",
              why_wrong_ru:
                "Сильное исполнение неправильного плана ускоряет провал, а не исправляет его; операционная безупречность лишь усиливает выбранное тактическое направление.",
            },
            {
              key: "B",
              text_en:
                "Day-to-day operations may run efficiently, but the strategy will not be achieved \u2014 because the cascade is broken at the tactical layer",
              text_ru:
                "Повседневные операции могут идти эффективно, но стратегия не будет достигнута, потому что каскад нарушен на тактическом уровне",
            },
            {
              key: "C",
              text_en:
                "The mission will automatically be re-set to match the tactical plans",
              text_ru:
                "Миссия автоматически переустановится под тактические планы",
              why_wrong_en:
                "The mission isn't reset bottom-up; it is set by the board. Misalignment doesn't change the mission, just produces failure to achieve it.",
              why_wrong_ru:
                "Миссия не переустанавливается снизу вверх; её ставит совет. Рассогласование не меняет миссию, оно лишь приводит к провалу её достижения.",
            },
            {
              key: "D",
              text_en:
                "Operational planning will be the level that absorbs the conflict and resolves it",
              text_ru:
                "Операционное планирование возьмёт конфликт на себя и разрешит его",
              why_wrong_en:
                "Operational managers execute what they're told tactically; they don't have the scope to override tactical or strategic levels.",
              why_wrong_ru:
                "Операционные руководители выполняют тактические указания; у них нет полномочий перекрывать тактический или стратегический уровни.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            'The three-level planning hierarchy works as a cascade: strategic → tactical → operational, each level constrained by the one above. The whole system fails when ANY link breaks. Here the strategic frame exists but the tactical layer is not translating it faithfully \u2014 so however well operations execute, they are executing against the wrong plan. This is a common real-world pathology: efficiency without effectiveness. "Doing the wrong things well." It also illustrates why strategic-tactical alignment is a measurable management process, not just a slogan.',
          explanation_ru:
            "Трёхуровневая иерархия планирования работает как каскад: стратегическое → тактическое → операционное, каждый уровень ограничен предыдущим. Вся система проваливается, когда РАЗРЫВАЕТСЯ ЛЮБОЕ звено. Здесь стратегическая рамка существует, но тактический слой не переводит её честно — поэтому, как бы хорошо ни шла операционка, она исполняет неправильный план. Это распространённая реальная патология: эффективность без результативности. «Хорошо делать не то». Она же объясняет, почему согласование стратегии и тактики — измеряемый управленческий процесс, а не лозунг.",
        },
      ],
    },

    // ---------- B ----------
    {
      code: "B",
      title_en: "Data analysis and statistical techniques",
      title_ru: "Анализ данных и статистические методы",
      description_en:
        "Sampling, high-low method, regression, time series, index numbers, big data, expected values, and spreadsheets.",
      description_ru:
        "Выборки, метод high-low, регрессия, временные ряды, индексы, большие данные, ожидаемые значения и таблицы.",
      sort_order: 20,
      theory_en:
        "Sampling methods differ in how the sample is chosen. Random sampling gives every unit equal chance; systematic picks every nth unit; stratified divides the population into strata and samples each proportionally; cluster samples whole groups; quota fills predefined category counts; multistage combines methods. Choice depends on population structure and cost.\n\n" +
        "Cost behaviour is separated into fixed and variable elements using the high-low method. Take the highest and lowest activity points; variable cost per unit = (cost at high \u2212 cost at low) / (units at high \u2212 units at low); fixed cost = total cost at either point \u2212 (variable cost \u00d7 that point's units). It assumes linearity and is sensitive to outliers; more rigorous separation uses linear regression. Regression produces the line y = a + bx, where b is the slope (variable cost per unit) and a is the intercept (fixed cost). The correlation coefficient r (between \u22121 and +1) measures strength of linear relationship; the coefficient of determination r\u00b2 gives the share of variation explained by the model.\n\n" +
        "Time series analysis decomposes data into trend (long-term direction), seasonal variation (regular cycle within a year), cyclical variation (longer business cycles), and random/residual variation. Forecasts use moving averages to smooth out short-term fluctuation, then add back seasonal components \u2014 additive (constant amounts) or multiplicative (percentage of trend).\n\n" +
        "Index numbers express values relative to a base period set to 100. Simple indices track one item; weighted indices (Laspeyre uses base-period quantities; Paasche uses current-period quantities) combine many items.\n\n" +
        "Expected value = \u03a3 (probability \u00d7 outcome) \u2014 used to weight uncertain outcomes. Big Data is characterised by the five Vs: Volume, Velocity, Variety, Veracity, Value.",
      theory_ru:
        "Методы выборки различаются способом отбора. Случайная выборка даёт каждой единице равный шанс попасть в выборку; систематическая берёт каждую n-ю единицу; стратифицированная делит совокупность на страты и пропорционально выбирает из каждой; кластерная отбирает целые группы; квотная заполняет заранее заданные категории; многоступенчатая комбинирует методы. Выбор зависит от структуры совокупности и стоимости.\n\n" +
        "Поведение затрат разделяется на постоянную и переменную составляющие методом high-low. Берут точки максимальной и минимальной активности; переменные затраты на единицу = (затраты при максимуме − затраты при минимуме) / (объём при максимуме − объём при минимуме); постоянные затраты = общие затраты в любой из точек − (переменные затраты × объём в этой точке). Метод предполагает линейность и чувствителен к выбросам; более строгое разделение даёт линейная регрессия. Регрессия выдаёт прямую y = a + bx, где b — наклон (переменные затраты на единицу), a — отрезок (постоянные затраты). Коэффициент корреляции r (от −1 до +1) показывает силу линейной связи; коэффициент детерминации r² — долю объяснённой моделью вариации.\n\n" +
        "Анализ временных рядов раскладывает данные на тренд (долгосрочное направление), сезонную вариацию (регулярный цикл внутри года), циклическую вариацию (более длинные деловые циклы) и случайные/остаточные колебания. Прогноз использует скользящие средние для сглаживания краткосрочных колебаний, затем возвращает сезонные компоненты — аддитивно (постоянные суммы) или мультипликативно (процент от тренда).\n\n" +
        "Индексы выражают значения относительно базового периода, принятого за 100. Простые индексы отслеживают одну позицию; взвешенные индексы (Ласпейрес — на базе количеств базового периода; Пааше — на базе количеств текущего периода) агрегируют несколько позиций.\n\n" +
        "Ожидаемое значение = Σ (вероятность × исход) — используется для взвешивания неопределённых исходов. Большие данные характеризуются пятью V: Volume (объём), Velocity (скорость), Variety (разнообразие), Veracity (достоверность), Value (ценность).",
      questions: [
        // -------- Q1 — easy MCQ on sampling --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "A researcher divides a population of factory workers into groups by department, then samples a proportion from each. This is which sampling method?",
          prompt_ru:
            "Исследователь делит совокупность работников завода на группы по отделам и затем берёт пропорциональную выборку из каждого. Какой это метод выборки?",
          options: [
            {
              key: "A",
              text_en: "Random",
              text_ru: "Случайная",
              why_wrong_en:
                "Pure random sampling does NOT use sub-groups; every unit has equal chance regardless of group membership.",
              why_wrong_ru:
                "Чисто случайная выборка НЕ использует подгруппы; каждая единица имеет равный шанс независимо от принадлежности к группе.",
            },
            {
              key: "B",
              text_en: "Systematic",
              text_ru: "Систематическая",
              why_wrong_en:
                "Systematic sampling selects every nth unit from a list; it doesn't divide into groups first.",
              why_wrong_ru:
                "Систематическая выборка отбирает каждую n-ю единицу из списка; она не делит сначала на группы.",
            },
            { key: "C", text_en: "Stratified", text_ru: "Стратифицированная" },
            {
              key: "D",
              text_en: "Cluster",
              text_ru: "Кластерная",
              why_wrong_en:
                "Cluster sampling selects WHOLE groups (e.g. entire departments) randomly; stratified samples FROM EVERY group.",
              why_wrong_ru:
                "Кластерная выборка случайно отбирает ЦЕЛЫЕ группы (например, целые отделы); стратифицированная отбирает ИЗ КАЖДОЙ группы.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "Stratified sampling divides the population into mutually exclusive strata (here, departments) and samples each proportionally to its size. It ensures every sub-group is represented, reducing the risk of accidentally over-sampling or missing a stratum that pure random sampling carries.",
          explanation_ru:
            "Стратифицированная выборка делит совокупность на непересекающиеся страты (здесь — отделы) и берёт из каждой пропорционально её размеру. Она гарантирует представленность каждой подгруппы, снижая риск случайной перепредставленности или пропуска страты, который несёт чисто случайная выборка.",
        },
        // -------- Q2 — easy MCQ on expected value formula --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en: "Expected value is calculated as:",
          prompt_ru: "Ожидаемое значение рассчитывается как:",
          options: [
            {
              key: "A",
              text_en: "Σ (probability × outcome)",
              text_ru: "Σ (вероятность × исход)",
            },
            {
              key: "B",
              text_en:
                "Average of all possible outcomes ignoring probabilities",
              text_ru: "Среднее всех возможных исходов без учёта вероятностей",
              why_wrong_en:
                "A simple average treats all outcomes equally; expected value weights each by its probability.",
              why_wrong_ru:
                "Простое среднее учитывает все исходы одинаково; ожидаемое значение взвешивает каждый по вероятности.",
            },
            {
              key: "C",
              text_en: "Most likely outcome only",
              text_ru: "Только наиболее вероятный исход",
              why_wrong_en:
                "Picking the single most-likely outcome ignores all the others; EV uses the entire distribution.",
              why_wrong_ru:
                "Выбор одного наиболее вероятного исхода игнорирует все остальные; EV использует всё распределение.",
            },
            {
              key: "D",
              text_en: "Worst-case outcome",
              text_ru: "Худший возможный исход",
              why_wrong_en:
                "Worst-case is a conservative decision rule, not the expected value.",
              why_wrong_ru:
                "Худший случай — это консервативное правило решения, а не ожидаемое значение.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Expected value (EV) = Σ (probability × outcome). It is the probability-weighted average of all possible outcomes, used to compare uncertain alternatives. EV makes sense over many repetitions; for one-off decisions risk-aversion may push you to choose the lower-EV but safer alternative.",
          explanation_ru:
            "Ожидаемое значение (EV) = Σ (вероятность × исход). Это взвешенное по вероятности среднее всех возможных исходов, используемое для сравнения неопределённых альтернатив. EV имеет смысл при многократных повторениях; для разовых решений неприятие риска может склонить вас к более безопасной альтернативе с меньшим EV.",
        },
        // -------- Q3 — easy short_answer on the 5 Vs --------
        {
          type: "short_answer",
          difficulty: "easy",
          prompt_en: "Name THREE of the five Vs that characterise Big Data.",
          prompt_ru:
            'Назовите ТРИ из пяти "V", характеризующих большие данные.',
          correct_answer_en:
            "Any three of: Volume, Velocity, Variety, Veracity, Value",
          correct_answer_ru:
            "Любые три из: Volume (объём), Velocity (скорость), Variety (разнообразие), Veracity (достоверность), Value (ценность)",
          explanation_en:
            'The five Vs: Volume (the data set is too large for traditional tools), Velocity (data arrives in real-time or near-real-time), Variety (structured + semi-structured + unstructured \u2014 text, video, sensor), Veracity (uncertainty/noise in the data), Value (must produce useful insight to justify cost). Original frameworks used three Vs; "veracity" and "value" were added later.',
          explanation_ru:
            'Пять "V": Volume (набор данных слишком велик для традиционных инструментов), Velocity (данные приходят в реальном или почти реальном времени), Variety (структурированные + полуструктурированные + неструктурированные — текст, видео, датчики), Veracity (неопределённость/шум в данных), Value (должна получаться полезная инсайт, оправдывающая стоимость). Изначально рамки использовали три "V"; "veracity" и "value" добавлены позже.',
        },
        // -------- Q4 — easy MCQ on time series components --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "In time-series analysis, regular variation within a one-year cycle (e.g. higher ice cream sales every summer) is called:",
          prompt_ru:
            "В анализе временных рядов регулярные колебания в пределах годового цикла (например, рост продаж мороженого каждым летом) называются:",
          options: [
            {
              key: "A",
              text_en: "Trend",
              text_ru: "Тренд",
              why_wrong_en:
                "Trend is the LONG-TERM direction over multiple years, not within-year repetition.",
              why_wrong_ru:
                "Тренд — это ДОЛГОСРОЧНОЕ направление за многие годы, а не внутригодовое повторение.",
            },
            {
              key: "B",
              text_en: "Seasonal variation",
              text_ru: "Сезонная вариация",
            },
            {
              key: "C",
              text_en: "Cyclical variation",
              text_ru: "Циклическая вариация",
              why_wrong_en:
                "Cyclical variation spans multi-year business cycles (e.g. 5-10 years); within-year patterns are seasonal.",
              why_wrong_ru:
                "Циклическая вариация охватывает многолетние деловые циклы (5-10 лет); внутригодовые повторы — сезонные.",
            },
            {
              key: "D",
              text_en: "Random variation",
              text_ru: "Случайная вариация",
              why_wrong_en:
                "Random variation is unpredictable noise without pattern; the question describes a regular, predictable pattern.",
              why_wrong_ru:
                "Случайная вариация — непредсказуемый шум без паттерна; в вопросе описан регулярный, предсказуемый паттерн.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            'Time series decompose into four components: trend (long-term direction), SEASONAL (regular within-year cycle), cyclical (multi-year business cycle), and random (noise). The key cue for seasonal is "predictable, repeats within a year" \u2014 summer for ice cream, December for retail, Q4 for accountants.',
          explanation_ru:
            "Временные ряды раскладываются на четыре компонента: тренд (долгосрочное направление), СЕЗОННЫЙ (регулярный внутригодовой цикл), циклический (многолетний деловой цикл), случайный (шум). Ключевой признак сезонности: «предсказуемый, повторяется в пределах года» — лето для мороженого, декабрь для розницы, Q4 для бухгалтеров.",
        },
        // -------- Q5 — medium NUMBER_ENTRY on high-low method --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "A company\u2019s production data shows: at 1,000 units total cost is $7,000; at 4,000 units total cost is $13,000. Using the high-low method, what is the VARIABLE COST PER UNIT (in $)?",
          prompt_ru:
            "Производственные данные компании: при 1 000 единицах общие затраты $7 000; при 4 000 единицах общие затраты $13 000. По методу high-low какие ПЕРЕМЕННЫЕ ЗАТРАТЫ НА ЕДИНИЦУ (в $)?",
          correct_answer_en: "2",
          acceptable_tolerance: 0.01,
          explanation_en:
            "High-low method: variable cost per unit = (cost at high − cost at low) / (units at high − units at low) = (13,000 − 7,000) / (4,000 − 1,000) = 6,000 / 3,000 = $2 per unit. Then fixed cost = 13,000 − (2 × 4,000) = $5,000 (or equivalently 7,000 − 2 × 1,000 = 5,000). The cost equation is total cost = $5,000 + $2 × units.",
          explanation_ru:
            "Метод high-low: переменные затраты на единицу = (затраты при максимуме − затраты при минимуме) / (объём при максимуме − объём при минимуме) = (13 000 − 7 000) / (4 000 − 1 000) = 6 000 / 3 000 = $2 на единицу. Тогда постоянные затраты = 13 000 − (2 × 4 000) = $5 000 (или эквивалентно 7 000 − 2 × 1 000 = 5 000). Уравнение затрат: общие = $5 000 + $2 × количество.",
        },
        // -------- Q6 — medium NUMBER_ENTRY on high-low fixed cost --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "Using the same data (1,000 units \u2192 $7,000; 4,000 units \u2192 $13,000), what is the FIXED COST per period (in $)?",
          prompt_ru:
            "По тем же данным (1 000 ед. → $7 000; 4 000 ед. → $13 000) каковы ПОСТОЯННЫЕ ЗАТРАТЫ за период (в $)?",
          correct_answer_en: "5000",
          acceptable_tolerance: 1,
          explanation_en:
            "Variable cost per unit was calculated as $2. Substitute into either point: fixed cost = total cost at point − (variable per unit × units at point). Using the high point: 13,000 − (2 × 4,000) = 13,000 − 8,000 = $5,000. Cross-check with the low point: 7,000 − (2 × 1,000) = 7,000 − 2,000 = $5,000. Both points give the same answer when the data is consistent \u2014 a quick sanity check.",
          explanation_ru:
            "Переменные затраты на единицу = $2. Подставляем в любую точку: постоянные = общие в точке − (переменные на единицу × объём в точке). По верхней точке: 13 000 − (2 × 4 000) = 13 000 − 8 000 = $5 000. Проверка по нижней точке: 7 000 − (2 × 1 000) = 7 000 − 2 000 = $5 000. Обе точки дают тот же ответ при согласованных данных — быстрая проверка.",
        },
        // -------- Q7 — medium MCQ on r² interpretation --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A regression of monthly sales on advertising spend yields r\u00b2 = 0.81. The MOST accurate interpretation is:",
          prompt_ru:
            "Регрессия ежемесячных продаж по рекламным затратам даёт r² = 0,81. НАИБОЛЕЕ точная интерпретация:",
          options: [
            {
              key: "A",
              text_en: "Advertising spend causes 81% of sales",
              text_ru: "Рекламные затраты вызывают 81% продаж",
              why_wrong_en:
                "r\u00b2 measures CORRELATION, not causation; high r\u00b2 does not prove that advertising caused the sales.",
              why_wrong_ru:
                "r² измеряет КОРРЕЛЯЦИЮ, а не причинность; высокий r² не доказывает, что реклама ВЫЗВАЛА продажи.",
            },
            {
              key: "B",
              text_en:
                "81% of the variation in sales is explained by the linear relationship with advertising spend",
              text_ru:
                "81% вариации продаж объясняется линейной связью с рекламными затратами",
            },
            {
              key: "C",
              text_en: "For every $1 of advertising, sales rise by $0.81",
              text_ru: "На каждый $1 рекламы продажи растут на $0,81",
              why_wrong_en:
                "That interpretation belongs to the slope coefficient b, not r\u00b2.",
              why_wrong_ru:
                "Такая интерпретация относится к коэффициенту наклона b, а не к r².",
            },
            {
              key: "D",
              text_en: "There is an 81% probability the regression is correct",
              text_ru: "Вероятность правильности регрессии 81%",
              why_wrong_en:
                'r\u00b2 is not a probability; it measures explained variation, not "correctness".',
              why_wrong_ru:
                "r² не является вероятностью; он измеряет долю объяснённой вариации, а не «правильность».",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "The coefficient of determination r\u00b2 is the share of variation in the dependent variable (sales) that is statistically explained by variation in the independent variable (advertising), assuming a linear relationship. r\u00b2 = 0.81 means 81% of the variability in sales co-moves with advertising; 19% remains unexplained by this model. Two important caveats: (1) correlation is not causation \u2014 advertising and sales could both be driven by something else (e.g. season); (2) high r\u00b2 doesn't mean the model will predict well outside the range of historical data.",
          explanation_ru:
            "Коэффициент детерминации r² — доля вариации зависимой переменной (продажи), статистически объясняемая вариацией независимой (реклама) при допущении о линейной связи. r² = 0,81 означает, что 81% изменчивости продаж сонаправлено меняется с рекламой; 19% остаются необъяснёнными этой моделью. Две важные оговорки: (1) корреляция не есть причинность — и реклама, и продажи могут зависеть от третьего фактора (например, сезона); (2) высокое r² не гарантирует точного прогноза за пределами исторических данных.",
        },
        // -------- Q8 — medium NUMBER_ENTRY on expected value --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "A project has three possible outcomes: profit of $100,000 with probability 0.5; profit of $20,000 with probability 0.3; loss of $40,000 with probability 0.2. What is the EXPECTED VALUE of profit (in $)?",
          prompt_ru:
            "У проекта три возможных исхода: прибыль $100 000 с вероятностью 0,5; прибыль $20 000 с вероятностью 0,3; убыток $40 000 с вероятностью 0,2. Каково ОЖИДАЕМОЕ ЗНАЧЕНИЕ прибыли (в $)?",
          correct_answer_en: "48000",
          acceptable_tolerance: 1,
          explanation_en:
            "EV = Σ (probability × outcome) = (0.5 × 100,000) + (0.3 × 20,000) + (0.2 × −40,000) = 50,000 + 6,000 − 8,000 = $48,000. Note the loss enters as negative. Probabilities must sum to 1.0 (here 0.5 + 0.3 + 0.2 = 1.0). EV is what you would average IF you ran this scenario many times; a single outcome could still be a $40,000 loss.",
          explanation_ru:
            "EV = Σ (вероятность × исход) = (0,5 × 100 000) + (0,3 × 20 000) + (0,2 × −40 000) = 50 000 + 6 000 − 8 000 = $48 000. Убыток входит с отрицательным знаком. Вероятности должны суммироваться до 1,0 (здесь 0,5 + 0,3 + 0,2 = 1,0). EV — это то, что получится в среднем при многократном повторении сценария; разовый результат может оказаться убытком в $40 000.",
        },
        // -------- Q9 — medium MCQ on Laspeyre vs Paasche --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A Laspeyre price index differs from a Paasche price index in that:",
          prompt_ru:
            "Индекс цен Ласпейреса отличается от индекса Пааше тем, что:",
          options: [
            {
              key: "A",
              text_en:
                "Laspeyre uses BASE-period quantities as weights; Paasche uses CURRENT-period quantities",
              text_ru:
                "Ласпейрес использует количества БАЗОВОГО периода как веса; Пааше — количества ТЕКУЩЕГО периода",
            },
            {
              key: "B",
              text_en: "Laspeyre is for prices; Paasche is for quantities",
              text_ru: "Ласпейрес для цен, Пааше для количеств",
              why_wrong_en:
                "Both are PRICE indices in this comparison; they differ in their weighting basis, not in what they measure.",
              why_wrong_ru:
                "В этом сравнении оба — индексы ЦЕН; они различаются базой взвешивания, а не тем, что измеряют.",
            },
            {
              key: "C",
              text_en:
                "Laspeyre updates quantities every period; Paasche freezes them",
              text_ru:
                "Ласпейрес обновляет количества каждый период; Пааше их фиксирует",
              why_wrong_en:
                "The reverse: Laspeyre FREEZES base-period quantities; Paasche UPDATES to current.",
              why_wrong_ru:
                "Наоборот: Ласпейрес ФИКСИРУЕТ количества базового периода; Пааше ОБНОВЛЯЕТ до текущих.",
            },
            {
              key: "D",
              text_en:
                "Laspeyre and Paasche are identical when applied correctly",
              text_ru: "Ласпейрес и Пааше идентичны при правильном применении",
              why_wrong_en:
                "They typically give DIFFERENT results precisely because they use different weights.",
              why_wrong_ru:
                "Они обычно дают РАЗНЫЕ результаты именно потому, что используют разные веса.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            'Both are weighted price indices, but they use different baskets of goods. Laspeyre uses the BASE-period basket (fixed quantities, easier to compute, may overstate inflation as consumers substitute away from items getting more expensive). Paasche uses the CURRENT-period basket (updated quantities, more reflective of current spending patterns, may understate inflation). In practice the "true" cost of living lies somewhere between Laspeyre and Paasche \u2014 the Fisher index averages them.',
          explanation_ru:
            "Оба — взвешенные индексы цен, но используют разные корзины. Ласпейрес — корзина БАЗОВОГО периода (фиксированные количества, проще считать, может завышать инфляцию, так как потребители уходят от подорожавших товаров). Пааше — корзина ТЕКУЩЕГО периода (обновлённые количества, лучше отражает текущие траты, может занижать инфляцию). На практике «истинная» стоимость жизни — между Ласпейресом и Пааше; индекс Фишера усредняет их.",
        },
        // -------- Q10 — medium NUMBER_ENTRY on simple index --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "A product price was $40 in the base period and $52 in the current period. What is the simple price INDEX for the current period (base = 100)?",
          prompt_ru:
            "Цена товара в базовом периоде была $40, в текущем — $52. Каков простой индекс цен для текущего периода (база = 100)?",
          correct_answer_en: "130",
          acceptable_tolerance: 0.5,
          explanation_en:
            "Simple index = (current value / base value) × 100 = (52 / 40) × 100 = 1.3 × 100 = 130. Interpretation: the price has risen 30% above the base. An index of 100 means no change; above 100 means increase; below 100 means decrease.",
          explanation_ru:
            "Простой индекс = (текущее значение / базовое значение) × 100 = (52 / 40) × 100 = 1,3 × 100 = 130. Интерпретация: цена выросла на 30% относительно базы. Индекс 100 — нет изменений; выше 100 — рост; ниже 100 — снижение.",
        },
        // -------- Q11 — medium MCQ on moving average --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A moving average is used in time-series analysis primarily to:",
          prompt_ru:
            "Скользящее среднее используется в анализе временных рядов прежде всего для того, чтобы:",
          options: [
            {
              key: "A",
              text_en: "Increase the volatility of the data",
              text_ru: "Увеличить волатильность данных",
              why_wrong_en:
                "Moving averages SMOOTH data; they reduce visible volatility, not increase it.",
              why_wrong_ru:
                "Скользящие средние СГЛАЖИВАЮТ данные, уменьшая видимую волатильность, а не увеличивая.",
            },
            {
              key: "B",
              text_en:
                "Smooth out short-term fluctuations and reveal the underlying trend",
              text_ru:
                "Сгладить краткосрочные колебания и выявить базовый тренд",
            },
            {
              key: "C",
              text_en: "Calculate the correlation coefficient",
              text_ru: "Рассчитать коэффициент корреляции",
              why_wrong_en:
                "Correlation is calculated separately; moving averages are a smoothing technique.",
              why_wrong_ru:
                "Корреляция рассчитывается отдельно; скользящие средние — это техника сглаживания.",
            },
            {
              key: "D",
              text_en: "Replace seasonal effects with random ones",
              text_ru: "Заменить сезонные эффекты случайными",
              why_wrong_en:
                "Moving averages aim to EXTRACT trend by averaging across seasonal patterns; they don't introduce randomness.",
              why_wrong_ru:
                "Скользящие средние стремятся ИЗВЛЕЧЬ тренд, усредняя по сезонам; они не вносят случайности.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "A moving average averages the most recent n periods to produce a smoothed series. If you use a span equal to the seasonal cycle (e.g. 4-quarter moving average for quarterly data), seasonal effects largely cancel out, leaving the trend visible. Once trend is isolated, the seasonal component can be derived as the consistent difference (additive model) or ratio (multiplicative model) between actual and trend.",
          explanation_ru:
            "Скользящее среднее усредняет последние n периодов, давая сглаженный ряд. Если взять окно, равное сезонному циклу (например, 4 квартала для квартальных данных), сезонные эффекты в основном гасят друг друга, оставляя видимым тренд. После выделения тренда сезонная составляющая определяется как постоянная разница (аддитивная модель) или отношение (мультипликативная модель) между фактическими данными и трендом.",
        },
        // -------- Q12 — medium short_answer on correlation interpretation --------
        {
          type: "short_answer",
          difficulty: "medium",
          prompt_en:
            "Two variables have correlation coefficient r = \u22120.92. Describe the strength and direction of the linear relationship.",
          prompt_ru:
            "У двух переменных коэффициент корреляции r = −0,92. Опишите силу и направление линейной связи.",
          correct_answer_en:
            "Strong (very close to \u22121) and negative (one variable rises as the other falls)",
          correct_answer_ru:
            "Сильная (очень близко к −1) и отрицательная (одна переменная растёт, когда другая падает)",
          explanation_en:
            "r ranges from \u22121 to +1. Sign indicates direction: positive = move together; negative = move opposite. Magnitude indicates strength: |r| close to 1 = strong linear relationship; |r| close to 0 = weak or no linear relationship. r = \u22120.92 is strong (close to \u22121) and negative. Example: study hours and exam errors might give such a relationship \u2014 more study, fewer errors.",
          explanation_ru:
            "r изменяется от −1 до +1. Знак указывает направление: плюс — движутся вместе; минус — в противоположных направлениях. Модуль указывает силу: |r| близко к 1 — сильная линейная связь; |r| близко к 0 — слабая или отсутствие линейной связи. r = −0,92 — сильная (близка к −1) и отрицательная. Пример: часы учёбы и количество ошибок на экзамене могут дать такую связь — больше учёбы, меньше ошибок.",
        },
        // -------- Q13 — medium MCQ on high-low weakness --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A key weakness of the high-low method for separating fixed and variable costs is that:",
          prompt_ru:
            "Ключевой недостаток метода high-low для разделения постоянных и переменных затрат состоит в том, что:",
          options: [
            {
              key: "A",
              text_en: "It cannot be calculated by hand",
              text_ru: "Его нельзя посчитать вручную",
              why_wrong_en:
                "High-low is in fact one of the SIMPLEST methods to compute manually; that's its main appeal.",
              why_wrong_ru:
                "High-low — наоборот, ОДИН ИЗ ПРОСТЕЙШИХ методов для ручного расчёта; в этом его главное удобство.",
            },
            {
              key: "B",
              text_en:
                "It uses only two data points (highest and lowest activity) and ignores all others, making it sensitive to outliers",
              text_ru:
                "Он использует только две точки данных (максимум и минимум по объёму), игнорируя все остальные, что делает его чувствительным к выбросам",
            },
            {
              key: "C",
              text_en: "It produces non-linear cost equations",
              text_ru: "Он даёт нелинейные уравнения затрат",
              why_wrong_en:
                "High-low ASSUMES linearity; that's another simplification it makes, but it produces a linear equation, not a non-linear one.",
              why_wrong_ru:
                "High-low ПРЕДПОЛАГАЕТ линейность; это другое его упрощение, но уравнение получается линейным, а не нелинейным.",
            },
            {
              key: "D",
              text_en: "It requires knowing fixed costs in advance",
              text_ru: "Для него нужны заранее известные постоянные затраты",
              why_wrong_en:
                "High-low CALCULATES fixed costs from the data; nothing has to be known in advance.",
              why_wrong_ru:
                "High-low ВЫВОДИТ постоянные затраты из данных; ничего заранее знать не нужно.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "High-low takes the extreme activity points and discards everything between. If either extreme happens to be an unusual month (a major one-off cost, a holiday closure), the cost equation will be skewed. Regression uses all available data and is far less sensitive. High-low remains useful as a quick estimate but should not be trusted for major decisions when more data is available.",
          explanation_ru:
            "High-low берёт крайние точки по объёму и отбрасывает всё между ними. Если любая из крайних точек оказывается нетипичным месяцем (крупные разовые затраты, праздничное закрытие), уравнение затрат будет смещено. Регрессия использует все доступные данные и гораздо менее чувствительна. High-low остаётся полезным для быстрой оценки, но не годится для крупных решений, когда есть больше данных.",
        },
        // -------- Q14 — hard NUMBER_ENTRY on expected value with decision tree --------
        {
          type: "number_entry",
          difficulty: "hard",
          prompt_en:
            "A company is choosing between two projects. Project A: $80,000 profit with probability 0.6; $20,000 loss with probability 0.4. Project B: $50,000 profit with probability 0.7; $10,000 profit with probability 0.3. What is the EXPECTED VALUE of Project A MINUS the expected value of Project B (in $)?",
          prompt_ru:
            "Компания выбирает между двумя проектами. Проект A: прибыль $80 000 с вероятностью 0,6; убыток $20 000 с вероятностью 0,4. Проект B: прибыль $50 000 с вероятностью 0,7; прибыль $10 000 с вероятностью 0,3. Каково ОЖИДАЕМОЕ ЗНАЧЕНИЕ Проекта A МИНУС ожидаемое значение Проекта B (в $)?",
          correct_answer_en: "2000",
          acceptable_tolerance: 1,
          explanation_en:
            "Project A EV = (0.6 × 80,000) + (0.4 × −20,000) = 48,000 − 8,000 = $40,000. Project B EV = (0.7 × 50,000) + (0.3 × 10,000) = 35,000 + 3,000 = $38,000. Difference = 40,000 − 38,000 = $2,000. On EV alone, A is marginally preferred. But A has a 40% chance of a $20,000 LOSS, while B always returns at least $10,000 \u2014 a risk-averse decision-maker would likely choose B despite the lower EV. EV is one input to a decision, not the whole answer.",
          explanation_ru:
            "EV Проекта A = (0,6 × 80 000) + (0,4 × −20 000) = 48 000 − 8 000 = $40 000. EV Проекта B = (0,7 × 50 000) + (0,3 × 10 000) = 35 000 + 3 000 = $38 000. Разница = 40 000 − 38 000 = $2 000. Только по EV A немного предпочтительнее. Но у A 40% шанс УБЫТКА в $20 000, тогда как B всегда даёт минимум $10 000 — не склонный к риску руководитель, вероятно, выберет B вопреки меньшему EV. EV — один из входов в решение, а не весь ответ.",
        },
        // -------- Q15 — hard MCQ on Big Data veracity --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            'An e-commerce firm captures clickstream data from 50 million daily users, including social media sentiment, behavioural patterns, and product images. Analysts note that about 12% of records contain bot traffic, scraping activity, or accidental duplicate sessions. The "V" of Big Data MOST DIRECTLY illustrated by this last finding is:',
          prompt_ru:
            'Компания электронной торговли собирает данные о кликах от 50 миллионов пользователей в день, включая социальные сигналы, поведенческие паттерны и изображения товаров. Аналитики отмечают, что около 12% записей содержат трафик ботов, скрапинговую активность или случайные дубликаты сессий. Какая из "V" больших данных НАИБОЛЕЕ НАПРЯМУЮ иллюстрируется этой последней находкой?',
          options: [
            {
              key: "A",
              text_en: "Volume",
              text_ru: "Volume (объём)",
              why_wrong_en:
                "Volume describes the size of the data set (50m users); the 12% noise is a QUALITY issue, not a SIZE one.",
              why_wrong_ru:
                "Volume описывает размер набора (50 млн пользователей); 12% шума — это вопрос КАЧЕСТВА, а не РАЗМЕРА.",
            },
            {
              key: "B",
              text_en: "Velocity",
              text_ru: "Velocity (скорость)",
              why_wrong_en:
                "Velocity is about how fast data arrives (real-time vs batch); the question is about how trustworthy it is.",
              why_wrong_ru:
                "Velocity — это скорость поступления данных (реальное время vs пакетная обработка); вопрос — о доверии к данным.",
            },
            {
              key: "C",
              text_en: "Variety",
              text_ru: "Variety (разнообразие)",
              why_wrong_en:
                "Variety is about different data types (clickstream, social, images \u2014 those are the variety here); the noise issue is about something else.",
              why_wrong_ru:
                "Variety — это разные типы данных (клики, соцсети, изображения — это и есть variety здесь); вопрос про шум — о другом.",
            },
            {
              key: "D",
              text_en: "Veracity",
              text_ru: "Veracity (достоверность)",
            },
          ],
          correct_answer_en: "D",
          explanation_en:
            "Veracity captures uncertainty, noise, and trustworthiness in the data. Bot traffic, scraping, and duplicate sessions all create records that LOOK like genuine user behaviour but aren't \u2014 the data appears real but doesn't represent real human activity. Big-data pipelines must include cleaning, deduplication, and bot-filtering steps before analysis; ignoring veracity inflates engagement metrics, distorts segmentation, and can mislead pricing or product decisions. The five Vs are easy to confuse on first reading because they sound similar; the test is to ask \"what problem does this V describe?\" \u2014 Volume = too big, Velocity = too fast, Variety = too mixed, Veracity = unreliable, Value = is it worth the cost?",
          explanation_ru:
            'Veracity описывает неопределённость, шум и достоверность данных. Трафик ботов, скрапинг и дубликаты сессий создают записи, которые ВЫГЛЯДЯТ как реальное поведение, но таковыми не являются — данные кажутся настоящими, но не отражают реальную человеческую активность. Big-data конвейеры должны включать очистку, дедупликацию и фильтрацию ботов до анализа; игнорирование veracity завышает метрики вовлечённости, искажает сегментацию и может ввести в заблуждение в вопросах цен и продуктовых решений. Пять "V" легко спутать на первый взгляд из-за созвучия; проверка — спросить «какую проблему описывает эта V?»: Volume — слишком много, Velocity — слишком быстро, Variety — слишком разнообразно, Veracity — ненадёжно, Value — стоит ли затрат?',
        },
      ],
    },
    // ---------- C ----------
    {
      code: "C",
      title_en: "Cost accounting techniques",
      title_ru: "Методы учёта затрат",
      description_en:
        "Materials, labour, overheads, absorption vs marginal costing, job/batch/process/service costing, and ABC/target/lifecycle.",
      description_ru:
        "Материалы, труд, накладные расходы, абсорбционный и маржинальный учёт, попроцессный/попозаказный/посерийный/сервисный учёт, ABC/target/lifecycle.",
      sort_order: 30,
      theory_en:
        "Material costs are controlled through reorder systems. The Economic Order Quantity formula EOQ = \u221a(2CoD / Ch) minimises total ordering and holding cost \u2014 where Co is cost per order, D is annual demand, Ch is holding cost per unit per year. Inventory is valued using FIFO (first units in are first costed out), AVCO (weighted average cost recalculated after each receipt), or LIFO \u2014 though LIFO is rarely permitted under IFRS. Labour is split between direct (traceable to a product) and indirect (general supervision, idle time). Labour turnover ratio = leavers replaced / average headcount; efficiency, capacity, and production volume ratios decompose actual hours against standard.\n\n" +
        "Overheads cannot be directly traced, so they are absorbed. The procedure has three steps: allocation (whole-cost assignment to a single cost centre), apportionment (split across centres on a fair basis like floor area), and absorption (charge to units via an overhead absorption rate, often per labour hour or machine hour). Over-absorption arises when absorbed > actual; under-absorption when absorbed < actual \u2014 the variance hits the income statement.\n\n" +
        "Absorption costing values inventory at full cost (variable + fixed production overhead); marginal costing values at variable cost only, treating fixed overhead as a period cost. The two methods give different profits whenever inventory levels change: when inventory rises, absorption profit > marginal profit (some fixed cost stays on the balance sheet); when inventory falls, the reverse. Reconciliation: difference = change in inventory units \u00d7 fixed overhead per unit.\n\n" +
        "Costing methods match production type: job costing for unique one-offs, batch costing for groups of identical units, process costing for continuous mass production (with normal and abnormal losses recognised), service costing for intangible outputs using composite units like passenger-miles. Activity-Based Costing (ABC) traces overhead via cost drivers; target costing back-solves cost from market price minus required margin; lifecycle costing aggregates cost over the whole product life from design to withdrawal.",
      theory_ru:
        "Материальные затраты контролируются через системы повторного заказа. Формула экономически обоснованного размера заказа EOQ = \u221a(2CoD / Ch) минимизирует совокупные затраты на размещение и хранение — где Co — стоимость одного заказа, D — годовой спрос, Ch — стоимость хранения единицы в год. Запасы оцениваются методом FIFO (первые поступившие списываются первыми), AVCO (средневзвешенная стоимость, пересчитываемая после каждого поступления) или LIFO — хотя LIFO редко допускается по МСФО. Затраты на труд делятся на прямые (отнесимые к продукту) и косвенные (общее руководство, простой). Коэффициент текучести кадров = заменённые уволенные / средняя численность; коэффициенты эффективности, мощности и объёма производства раскладывают фактические часы относительно нормативных.\n\n" +
        "Накладные расходы нельзя отнести напрямую, поэтому они абсорбируются. Процедура состоит из трёх шагов: аллокация (прямое отнесение целиком на один центр затрат), распределение (разнос между центрами по справедливой базе, например по площади помещения) и абсорбция (отнесение на единицы продукции через ставку абсорбции, часто на час труда или машино-час). Сверх-абсорбция возникает, когда абсорбировано больше фактических затрат; недо-абсорбция — когда меньше; разница идёт в отчёт о прибылях и убытках.\n\n" +
        "Абсорбционный учёт оценивает запасы по полной себестоимости (переменные + постоянные производственные накладные); маржинальный учёт оценивает только по переменным затратам, относя постоянные накладные на период. Эти методы дают разную прибыль всякий раз, когда меняется уровень запасов: при росте запасов прибыль по абсорбции > маржинальной (часть постоянных затрат остаётся в балансе); при сокращении — наоборот. Сверка: разница = изменение запасов в единицах × постоянные накладные на единицу.\n\n" +
        "Методы учёта зависят от типа производства: попозаказный для уникальных единичных заказов, посерийный для групп одинаковых единиц, попроцессный для непрерывного массового производства (с признанием нормальных и аномальных потерь), сервисный для нематериальных результатов с использованием составных единиц вроде пассажиро-километров. Activity-Based Costing (ABC) разносит накладные через драйверы затрат; target costing обратным счётом от рыночной цены минус требуемая маржа выводит целевую себестоимость; lifecycle costing агрегирует затраты по всему жизненному циклу продукта от дизайна до снятия с производства.",
      questions: [
        // -------- Q1 — easy MCQ on direct vs indirect cost --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "Which of the following is BEST classified as a DIRECT cost of producing a wooden chair?",
          prompt_ru:
            "Что из перечисленного ЛУЧШЕ всего относится к ПРЯМЫМ затратам на производство деревянного стула?",
          options: [
            {
              key: "A",
              text_en: "Factory rent",
              text_ru: "Аренда производственного цеха",
              why_wrong_en:
                "Factory rent benefits all products made in the factory and cannot be traced to a single chair \u2014 it's an indirect (overhead) cost.",
              why_wrong_ru:
                "Аренда цеха относится ко всем выпускаемым там изделиям и не может быть отнесена к конкретному стулу — это косвенная (накладная) затрата.",
            },
            {
              key: "B",
              text_en: "The wood used to make the chair",
              text_ru: "Дерево, из которого сделан стул",
            },
            {
              key: "C",
              text_en: "The factory supervisor\u2019s salary",
              text_ru: "Зарплата начальника цеха",
              why_wrong_en:
                "A supervisor oversees production of many items; their salary is INDIRECT labour, not direct.",
              why_wrong_ru:
                "Начальник цеха курирует производство многих изделий; его зарплата — КОСВЕННЫЙ труд, а не прямой.",
            },
            {
              key: "D",
              text_en: "Depreciation on factory machinery",
              text_ru: "Амортизация заводского оборудования",
              why_wrong_en:
                "Machinery is used to produce many products; depreciation is allocated as overhead, not directly traced.",
              why_wrong_ru:
                "Оборудование используется для многих продуктов; амортизация распределяется как накладные расходы, а не относится напрямую.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "A direct cost can be specifically and unambiguously traced to one unit of output. The wood physically goes into one chair \u2014 trace it directly. Factory rent, supervisor salary and machine depreciation all benefit many products simultaneously, making them indirect (overhead) costs that must be apportioned.",
          explanation_ru:
            "Прямая затрата может быть однозначно отнесена к одной единице продукции. Дерево физически входит в один стул — отнесение прямое. Аренда цеха, зарплата начальника и амортизация оборудования относятся одновременно ко многим продуктам, что делает их косвенными (накладными), требующими распределения.",
        },
        // -------- Q2 — easy MCQ on EOQ purpose --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "The Economic Order Quantity (EOQ) formula is used to determine:",
          prompt_ru:
            "Формула экономически обоснованного размера заказа (EOQ) используется для определения:",
          options: [
            {
              key: "A",
              text_en: "The maximum stock level the warehouse can hold",
              text_ru:
                "Максимального уровня запасов, который может хранить склад",
              why_wrong_en:
                "EOQ doesn't consider warehouse capacity \u2014 it balances ordering cost against holding cost.",
              why_wrong_ru:
                "EOQ не учитывает вместимость склада — он балансирует затраты на размещение заказа и затраты на хранение.",
            },
            {
              key: "B",
              text_en:
                "The order size that minimises total ordering and holding cost",
              text_ru:
                "Размера заказа, минимизирующего общие затраты на размещение и хранение",
            },
            {
              key: "C",
              text_en: "The selling price of inventory",
              text_ru: "Цены продажи запасов",
              why_wrong_en:
                "EOQ is a purchasing/inventory decision; it has nothing to do with selling prices.",
              why_wrong_ru:
                "EOQ — решение о закупке и запасах, к ценам продажи отношения не имеет.",
            },
            {
              key: "D",
              text_en: "The reorder point",
              text_ru: "Точки повторного заказа",
              why_wrong_en:
                "Reorder point is a separate calculation (demand during lead time + safety stock); EOQ tells you HOW MUCH to order, not WHEN.",
              why_wrong_ru:
                "Точка повторного заказа — отдельный расчёт (спрос за время поставки + страховой запас); EOQ говорит, СКОЛЬКО заказывать, а не КОГДА.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "EOQ = \u221a(2CoD / Ch) balances two opposing costs. Ordering more often (small orders) increases TOTAL order placement cost. Ordering less often (large orders) increases average inventory and thus holding cost. EOQ is the order size where the two cancel out and total cost is minimised.",
          explanation_ru:
            "EOQ = √(2CoD / Ch) уравновешивает две противоположные затраты. Частые заказы (мелкими партиями) повышают ОБЩИЕ затраты на размещение. Редкие заказы (крупными партиями) повышают средний уровень запасов и затраты на хранение. EOQ — размер заказа, при котором эти эффекты гасят друг друга и совокупные затраты минимальны.",
        },
        // -------- Q3 — easy short_answer on FIFO/AVCO --------
        {
          type: "short_answer",
          difficulty: "easy",
          prompt_en:
            "Under IFRS (IAS 2), which TWO inventory cost formulas are permitted?",
          prompt_ru:
            "По МСФО (IAS 2) какие ДВЕ формулы оценки запасов разрешены?",
          correct_answer_en:
            "FIFO (first-in, first-out) and weighted average cost (AVCO)",
          correct_answer_ru:
            "FIFO (первым пришёл — первым ушёл) и средневзвешенная стоимость (AVCO)",
          explanation_en:
            "IAS 2 permits FIFO and AVCO; LIFO (last-in, first-out) was disallowed in 2003 because it can distort the balance sheet (old, possibly low costs sitting on inventory) and enable profit manipulation in inflationary environments. US GAAP still permits LIFO, which is a known difference between IFRS and US GAAP.",
          explanation_ru:
            "IAS 2 разрешает FIFO и AVCO; LIFO (последним пришёл — первым ушёл) запрещён с 2003 года, поскольку может искажать баланс (старая, возможно низкая, себестоимость в запасах) и позволяет манипулировать прибылью при инфляции. ОПБУ США LIFO по-прежнему допускают, что является известным различием между МСФО и ОПБУ США.",
        },
        // -------- Q4 — easy MCQ on overhead allocation step --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "The process of charging an overhead cost in full to a single cost centre to which it can be specifically traced is called:",
          prompt_ru:
            "Процесс отнесения накладного расхода полностью на один центр затрат, к которому он может быть однозначно отнесён, называется:",
          options: [
            {
              key: "A",
              text_en: "Allocation",
              text_ru: "Аллокация (прямое отнесение)",
            },
            {
              key: "B",
              text_en: "Apportionment",
              text_ru: "Распределение",
              why_wrong_en:
                "Apportionment splits a cost across MULTIPLE cost centres on a fair basis; allocation puts the WHOLE cost on ONE centre.",
              why_wrong_ru:
                "Распределение разносит затрату между НЕСКОЛЬКИМИ центрами по справедливой базе; аллокация относит ВСЮ затрату на ОДИН центр.",
            },
            {
              key: "C",
              text_en: "Absorption",
              text_ru: "Абсорбция",
              why_wrong_en:
                "Absorption is the FINAL step \u2014 charging from cost centre into product units; allocation is earlier in the process.",
              why_wrong_ru:
                "Абсорбция — ПОСЛЕДНИЙ шаг: разнесение затрат с центра на единицы продукции; аллокация — более ранний этап.",
            },
            {
              key: "D",
              text_en: "Reapportionment",
              text_ru: "Перераспределение",
              why_wrong_en:
                "Reapportionment redistributes service-centre costs onto production centres; the question is about the initial step.",
              why_wrong_ru:
                "Перераспределение разносит затраты сервисных центров на производственные; вопрос — о первом шаге.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "The three steps of overhead absorption are sequential: ALLOCATION (whole cost to one centre when traceable, e.g. machine maintenance specific to one production line) \u2192 APPORTIONMENT (split across centres on a fair basis, e.g. rent split by floor area) \u2192 ABSORPTION (charge from centre into product units via an absorption rate). Reapportionment of service-centre costs sits between apportionment and absorption.",
          explanation_ru:
            "Три шага абсорбции накладных идут последовательно: АЛЛОКАЦИЯ (вся затрата на один центр, когда отнесение однозначно — например, обслуживание оборудования конкретной линии) → РАСПРЕДЕЛЕНИЕ (между центрами по справедливой базе — например, аренда по площади) → АБСОРБЦИЯ (с центра на единицы продукции через ставку). Перераспределение затрат сервисных центров — этап между распределением и абсорбцией.",
        },
        // -------- Q5 — medium NUMBER_ENTRY on EOQ calculation --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "Annual demand for a component is 8,000 units. Cost per order is $20. Holding cost is $4 per unit per year. What is the Economic Order Quantity (EOQ) in units?",
          prompt_ru:
            "Годовой спрос на компонент — 8 000 единиц. Стоимость одного заказа — $20. Стоимость хранения — $4 за единицу в год. Каков экономически обоснованный размер заказа (EOQ) в единицах?",
          correct_answer_en: "283",
          acceptable_tolerance: 1,
          explanation_en:
            "EOQ = \u221a(2CoD / Ch) where Co = ordering cost per order, D = annual demand, Ch = holding cost per unit per year. EOQ = \u221a(2 \u00d7 20 \u00d7 8,000 / 4) = \u221a(320,000 / 4) = \u221a80,000 \u2248 282.84 \u2192 283 units. Round up because you can't order fractional units, and rounding up rather than down avoids stockouts.",
          explanation_ru:
            "EOQ = √(2CoD / Ch), где Co — стоимость заказа, D — годовой спрос, Ch — стоимость хранения единицы в год. EOQ = √(2 × 20 × 8 000 / 4) = √(320 000 / 4) = √80 000 ≈ 282,84 → 283 единицы. Округляем вверх, поскольку дробных единиц быть не может, а округление вверх позволяет избежать дефицита.",
        },
        // -------- Q6 — medium NUMBER_ENTRY on overhead absorption rate --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "Budgeted production overhead is $240,000. Budgeted activity is 60,000 direct labour hours. What is the OVERHEAD ABSORPTION RATE per labour hour (in $)?",
          prompt_ru:
            "Бюджетные производственные накладные — $240 000. Бюджетная активность — 60 000 прямых трудочасов. Какова СТАВКА АБСОРБЦИИ накладных на трудочас (в $)?",
          correct_answer_en: "4",
          acceptable_tolerance: 0.01,
          explanation_en:
            "OAR = Budgeted overhead / Budgeted activity = $240,000 / 60,000 hours = $4 per labour hour. This rate is set BEFORE the period starts (using budgeted figures) and then applied to actual labour hours worked during the period. Over- or under-absorption arises when actual overhead or activity differs from budget.",
          explanation_ru:
            "OAR = бюджетные накладные / бюджетная активность = $240 000 / 60 000 часов = $4 на трудочас. Ставка определяется ДО начала периода (по бюджетным цифрам), а затем применяется к фактически отработанным часам. Сверх- или недо-абсорбция возникает, когда фактические накладные или активность отличаются от бюджета.",
        },
        // -------- Q7 — medium NUMBER_ENTRY on under/over absorption --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "The OAR is $4 per labour hour. Actual overheads incurred were $260,000. Actual labour hours worked were 62,000. Calculate the OVER-absorption (positive number) or UNDER-absorption (enter as negative) in $.",
          prompt_ru:
            "Ставка OAR = $4 на трудочас. Фактические накладные составили $260 000. Фактически отработано 62 000 трудочасов. Рассчитайте СВЕРХ-абсорбцию (положительное число) или НЕДО-абсорбцию (отрицательное) в $.",
          correct_answer_en: "-12000",
          acceptable_tolerance: 1,
          explanation_en:
            "Overhead absorbed into production = OAR \u00d7 actual hours = $4 \u00d7 62,000 = $248,000. Actual overhead incurred = $260,000. Difference = absorbed \u2212 actual = 248,000 \u2212 260,000 = \u2212$12,000. The amount absorbed is LESS than actually incurred \u2014 this is UNDER-absorption of $12,000. The shortfall is written off as an expense to the income statement (reducing profit).",
          explanation_ru:
            "Абсорбировано в производство = OAR × фактические часы = $4 × 62 000 = $248 000. Фактические накладные = $260 000. Разница = абсорбировано − факт = 248 000 − 260 000 = −$12 000. Абсорбировано МЕНЬШЕ, чем понесено фактически — это НЕДО-абсорбция $12 000. Недостача списывается в расход ОПУ (снижает прибыль).",
        },
        // -------- Q8 — medium MCQ on marginal vs absorption profit --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "Inventory rose by 500 units during the year. Fixed overhead per unit is $6. The difference between absorption profit and marginal profit will be:",
          prompt_ru:
            "Запасы выросли на 500 единиц за год. Постоянные накладные на единицу — $6. Разница между прибылью по абсорбционному и маржинальному учёту составит:",
          options: [
            {
              key: "A",
              text_en:
                "Absorption profit will be $3,000 LOWER than marginal profit",
              text_ru: "Прибыль по абсорбции будет на $3 000 НИЖЕ маржинальной",
              why_wrong_en:
                "When inventory RISES, absorption profit is HIGHER (more fixed cost stays on the balance sheet); this answer reverses the direction.",
              why_wrong_ru:
                "При РОСТЕ запасов прибыль по абсорбции ВЫШЕ (больше постоянных затрат остаётся в балансе); этот ответ обратен по направлению.",
            },
            {
              key: "B",
              text_en:
                "Absorption profit will be $3,000 HIGHER than marginal profit",
              text_ru: "Прибыль по абсорбции будет на $3 000 ВЫШЕ маржинальной",
            },
            {
              key: "C",
              text_en:
                "There will be no difference because total costs are the same",
              text_ru: "Разницы не будет, так как общие затраты одинаковы",
              why_wrong_en:
                "Total costs ARE the same in any year, but PROFIT differs whenever inventory changes \u2014 because fixed overhead is treated differently on the balance sheet vs P/L.",
              why_wrong_ru:
                "Совокупные затраты ОДИНАКОВЫ в любой год, но ПРИБЫЛЬ различается при изменении запасов — потому что постоянные накладные по-разному отражаются в балансе и ОПУ.",
            },
            {
              key: "D",
              text_en: "The difference depends on selling price",
              text_ru: "Разница зависит от цены продажи",
              why_wrong_en:
                "Selling price affects total revenue and profit, but the GAP between absorption and marginal profit depends only on inventory change \u00d7 fixed OH per unit.",
              why_wrong_ru:
                "Цена продажи влияет на выручку и прибыль в целом, но РАЗРЫВ между прибылью по абсорбции и маржинальной зависит только от изменения запасов × постоянные накладные на единицу.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            'Difference = change in inventory units \u00d7 fixed overhead per unit = 500 \u00d7 $6 = $3,000. When inventory RISES, absorption costing carries some fixed overhead forward into closing inventory on the balance sheet (deferring the expense), so absorption profit is HIGHER. When inventory falls, absorption profit is lower. The shorthand: absorption is "fixed OH follows the units"; marginal is "fixed OH hits the P/L when incurred".',
          explanation_ru:
            "Разница = изменение запасов × постоянные накладные на единицу = 500 × $6 = $3 000. При РОСТЕ запасов абсорбционный учёт переносит часть постоянных накладных в конечные запасы баланса (откладывая расход), поэтому прибыль по абсорбции ВЫШЕ. При падении запасов наоборот. Сокращённо: абсорбция — «постоянные накладные идут за единицами»; маржинальный — «постоянные накладные сразу в ОПУ при возникновении».",
        },
        // -------- Q9 — medium MCQ on costing methods --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "Which costing method is MOST appropriate for a printing company that takes individual, unique orders such as wedding invitations and business cards?",
          prompt_ru:
            "Какой метод учёта затрат НАИБОЛЕЕ подходит для типографии, принимающей индивидуальные уникальные заказы (свадебные приглашения, визитки)?",
          options: [
            {
              key: "A",
              text_en: "Process costing",
              text_ru: "Попроцессный",
              why_wrong_en:
                "Process costing suits continuous mass production of identical units (e.g. petrol, chemicals); each printing job is unique.",
              why_wrong_ru:
                "Попроцессный подходит для непрерывного массового производства одинаковых единиц (бензин, химия); каждый типографский заказ уникален.",
            },
            {
              key: "B",
              text_en: "Batch costing",
              text_ru: "Посерийный",
              why_wrong_en:
                "Batch costing suits groups of IDENTICAL units produced together (e.g. 1,000 identical T-shirts); the question describes UNIQUE one-offs.",
              why_wrong_ru:
                "Посерийный подходит для групп ОДИНАКОВЫХ единиц, выпускаемых вместе (например, 1 000 одинаковых футболок); в вопросе — УНИКАЛЬНЫЕ единичные заказы.",
            },
            { key: "C", text_en: "Job costing", text_ru: "Попозаказный" },
            {
              key: "D",
              text_en: "Service costing",
              text_ru: "Сервисный",
              why_wrong_en:
                "Service costing is for intangible services (e.g. transport, consulting); the output here is a physical printed product.",
              why_wrong_ru:
                "Сервисный — для нематериальных услуг (транспорт, консалтинг); здесь же результат — физический печатный продукт.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "Job costing tracks the cost of each individually identifiable job: customer's name, specific materials, labour hours spent, and a share of overhead. Used by printers, bespoke tailors, custom-furniture makers, builders, repair workshops. Batch costing is similar but for a GROUP of identical items produced together (then total cost / batch size = unit cost). Process costing is for continuous flow.",
          explanation_ru:
            "Попозаказный учёт ведёт затраты по каждому индивидуально идентифицируемому заказу: имя клиента, конкретные материалы, отработанные часы и доля накладных. Используется типографиями, ателье, мастерами на заказ, строителями, ремонтными мастерскими. Посерийный похож, но для ГРУППЫ одинаковых единиц, выпускаемых вместе (тогда общие затраты / размер серии = себестоимость единицы). Попроцессный — для непрерывного потока.",
        },
        // -------- Q10 — medium NUMBER_ENTRY on FIFO inventory valuation --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "Opening inventory: 100 units at $5 each. Purchase 1: 200 units at $6 each. Purchase 2: 150 units at $7 each. 300 units were issued to production. Using FIFO, what is the cost of CLOSING inventory (in $)?",
          prompt_ru:
            "Начальные запасы: 100 единиц по $5. Закупка 1: 200 единиц по $6. Закупка 2: 150 единиц по $7. В производство отпущено 300 единиц. По FIFO какова стоимость КОНЕЧНЫХ запасов (в $)?",
          correct_answer_en: "1050",
          acceptable_tolerance: 1,
          explanation_en:
            "FIFO assumes the OLDEST units are issued first. Total available = 100 + 200 + 150 = 450 units. Issued = 300 units \u2192 first the 100 opening @ $5, then 200 from Purchase 1 @ $6 \u2014 that uses up 300 exactly. Closing inventory = 150 units left from Purchase 2 @ $7 = $1,050. The check: total cost = (100\u00d75) + (200\u00d76) + (150\u00d77) = 500 + 1,200 + 1,050 = $2,750. Cost of issues under FIFO = (100\u00d75) + (200\u00d76) = $1,700. Closing inventory = $2,750 \u2212 $1,700 = $1,050. \u2713",
          explanation_ru:
            "FIFO предполагает, что СНАЧАЛА отпускаются САМЫЕ СТАРЫЕ единицы. Всего доступно = 100 + 200 + 150 = 450 единиц. Отпущено = 300 единиц → сначала 100 начальных по $5, затем 200 из Закупки 1 по $6 — это ровно 300. Конечные запасы = 150 единиц из Закупки 2 по $7 = $1 050. Проверка: общая стоимость = (100×5) + (200×6) + (150×7) = 500 + 1 200 + 1 050 = $2 750. Стоимость отпусков по FIFO = (100×5) + (200×6) = $1 700. Конечные запасы = $2 750 − $1 700 = $1 050. ✓",
        },
        // -------- Q11 — medium MCQ on process costing losses --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            'In process costing, a "normal loss" is BEST described as:',
          prompt_ru:
            "В попроцессном учёте «нормальная потеря» ЛУЧШЕ всего описывается как:",
          options: [
            {
              key: "A",
              text_en:
                "Any loss arising during the process, regardless of cause",
              text_ru:
                "Любая потеря, возникшая в процессе, независимо от причины",
              why_wrong_en:
                'Losses are split into NORMAL (expected, built into standards) and ABNORMAL (unexpected, investigated separately); "normal" doesn\'t mean all losses.',
              why_wrong_ru:
                "Потери делятся на НОРМАЛЬНЫЕ (ожидаемые, заложенные в норматив) и АНОМАЛЬНЫЕ (неожиданные, исследуемые отдельно); «нормальная» не значит все потери.",
            },
            {
              key: "B",
              text_en:
                "The expected unavoidable loss inherent to the process, charged to production cost",
              text_ru:
                "Ожидаемая неустранимая потеря, присущая процессу и включаемая в себестоимость производства",
            },
            {
              key: "C",
              text_en: "Loss due to fraud or theft",
              text_ru: "Потери от мошенничества или хищений",
              why_wrong_en:
                "Fraud/theft losses are ABNORMAL by definition \u2014 they shouldn't be expected as part of normal operations.",
              why_wrong_ru:
                "Потери от мошенничества/хищений по определению АНОМАЛЬНЫЕ — они не должны быть ожидаемыми в нормальной деятельности.",
            },
            {
              key: "D",
              text_en: "Loss due to a one-off machine breakdown",
              text_ru: "Потеря из-за разового сбоя оборудования",
              why_wrong_en:
                "A one-off breakdown is unexpected \u2014 that's an ABNORMAL loss, investigated separately and not absorbed into normal cost.",
              why_wrong_ru:
                "Разовый сбой — неожиданное событие, это АНОМАЛЬНАЯ потеря, исследуется отдельно и не включается в нормальную себестоимость.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Normal loss is the unavoidable loss expected from the process under efficient conditions \u2014 evaporation, off-cuts, defective units within tolerance. It is charged to the cost of GOOD output, so each surviving unit absorbs a share. Abnormal loss exceeds the normal amount and is investigated separately, charged to the income statement, not to good production. Abnormal GAIN (loss less than expected) is the mirror case.",
          explanation_ru:
            "Нормальная потеря — неустранимая потеря, ожидаемая в процессе при эффективной работе: испарение, обрезки, брак в пределах допуска. Она включается в себестоимость ГОДНОЙ продукции, и каждая выходная единица несёт свою долю. Аномальная потеря превышает норму и исследуется отдельно, относится в ОПУ, а не на годное производство. Аномальная ПРИБЫЛЬ (потеря меньше ожидаемой) — зеркальный случай.",
        },
        // -------- Q12 — medium short_answer on labour ratios --------
        {
          type: "short_answer",
          difficulty: "medium",
          prompt_en:
            "What does the LABOUR EFFICIENCY RATIO measure, and how is it calculated?",
          prompt_ru:
            "Что измеряет КОЭФФИЦИЕНТ ЭФФЕКТИВНОСТИ ТРУДА и как он рассчитывается?",
          correct_answer_en:
            "It measures how efficiently labour produced output, calculated as: standard hours for actual output / actual hours worked \u00d7 100%",
          correct_answer_ru:
            "Измеряет, насколько эффективно труд произвёл выпуск: нормативные часы на фактический выпуск / фактически отработанные часы × 100%",
          explanation_en:
            "Three labour ratios decompose performance: EFFICIENCY = standard hours for actual output / actual hours worked (> 100% means workers beat the standard); CAPACITY = actual hours worked / budgeted hours (> 100% means more hours worked than planned); PRODUCTION VOLUME = standard hours for actual output / budgeted hours (combined effect on output). Efficiency \u00d7 Capacity = Volume.",
          explanation_ru:
            "Три коэффициента труда раскладывают результативность: ЭФФЕКТИВНОСТЬ = нормативные часы на факт выпуска / фактические часы (> 100% — рабочие превзошли норматив); МОЩНОСТЬ = фактические часы / бюджетные часы (> 100% — отработано больше плана); ОБЪЁМ ПРОИЗВОДСТВА = нормативные часы на факт выпуска / бюджетные часы (совокупный эффект). Эффективность × Мощность = Объём.",
        },
        // -------- Q13 — medium MCQ on ABC --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "Activity-Based Costing (ABC) differs from traditional absorption costing in that ABC:",
          prompt_ru:
            "Activity-Based Costing (ABC) отличается от традиционного абсорбционного учёта тем, что ABC:",
          options: [
            {
              key: "A",
              text_en: "Ignores fixed overhead entirely",
              text_ru: "Полностью игнорирует постоянные накладные",
              why_wrong_en:
                "ABC includes overheads but allocates them differently; ignoring fixed overhead is what MARGINAL costing does, not ABC.",
              why_wrong_ru:
                "ABC включает накладные, но распределяет их иначе; постоянные накладные игнорирует МАРЖИНАЛЬНЫЙ учёт, а не ABC.",
            },
            {
              key: "B",
              text_en:
                "Traces overheads to products via cost drivers that reflect what actually causes the cost",
              text_ru:
                "Разносит накладные на продукты через драйверы затрат, отражающие реальную причину возникновения затрат",
            },
            {
              key: "C",
              text_en: "Eliminates the need for direct cost tracking",
              text_ru: "Устраняет необходимость учёта прямых затрат",
              why_wrong_en:
                "Direct costs are still tracked under ABC; the difference is only in how OVERHEADS are assigned.",
              why_wrong_ru:
                "Прямые затраты по-прежнему учитываются при ABC; различие — только в способе разнесения НАКЛАДНЫХ.",
            },
            {
              key: "D",
              text_en: "Is used only in service industries",
              text_ru: "Применяется только в сфере услуг",
              why_wrong_en:
                "ABC originated in manufacturing (where complex product mixes were misallocated by simple OAR) and is now used in both manufacturing and services.",
              why_wrong_ru:
                "ABC появился в производстве (где простая ставка OAR искажала разнесение в сложных продуктовых наборах) и сегодня используется и в производстве, и в услугах.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            'Traditional absorption uses a single (or few) volume-based rate(s) like "per labour hour" \u2014 fine when products consume overhead proportionally to volume. ABC identifies multiple ACTIVITIES that drive cost (e.g. machine setups, purchase orders, inspections) and traces each via its DRIVER (setups, POs, inspections). High-variety, low-volume products that disproportionately use these activities get correctly charged more under ABC; simple high-volume products get charged less. ABC produces more accurate product costs when overhead is large and product mix is varied.',
          explanation_ru:
            "Традиционная абсорбция использует одну (или несколько) объёмных ставок вроде «на трудочас» — годится, когда продукты потребляют накладные пропорционально объёму. ABC выявляет несколько ВИДОВ ДЕЯТЕЛЬНОСТИ, генерирующих затраты (например, настройка оборудования, заказы на закупку, проверки), и разносит каждую через её ДРАЙВЕР (число настроек, число заказов, число проверок). Малосерийные продукты с большим разнообразием, потребляющие эти виды деятельности непропорционально, при ABC получают корректно бо́льшую долю накладных; простые крупносерийные — меньшую. ABC даёт более точную себестоимость при крупных накладных и разнородной продукции.",
        },
        // -------- Q14 — hard NUMBER_ENTRY on AVCO inventory --------
        {
          type: "number_entry",
          difficulty: "hard",
          prompt_en:
            "Opening inventory: 200 units at $10 each. Purchase: 300 units at $14 each. After the purchase, 250 units are issued. Using the AVCO method (weighted average recalculated after each receipt), what is the value of the 250 units issued (in $)?",
          prompt_ru:
            "Начальные запасы: 200 единиц по $10. Закупка: 300 единиц по $14. После закупки отпущено 250 единиц. По методу AVCO (средневзвешенная, пересчитываемая после каждого поступления) какова стоимость отпущенных 250 единиц (в $)?",
          correct_answer_en: "3100",
          acceptable_tolerance: 1,
          explanation_en:
            "After the purchase, total inventory = 200 + 300 = 500 units; total cost = (200\u00d710) + (300\u00d714) = 2,000 + 4,200 = $6,200. Weighted average = 6,200 / 500 = $12.40 per unit. Cost of 250 units issued = 250 \u00d7 $12.40 = $3,100. The remaining 250 units are also valued at $12.40 = $3,100, totalling $6,200 \u2014 internally consistent. AVCO's key feature is the RECALCULATION after each receipt; LIFO and FIFO don't average.",
          explanation_ru:
            "После закупки всего запасов = 200 + 300 = 500 единиц; общая стоимость = (200×10) + (300×14) = 2 000 + 4 200 = $6 200. Средневзвешенная = 6 200 / 500 = $12,40 за единицу. Стоимость 250 отпущенных = 250 × $12,40 = $3 100. Оставшиеся 250 единиц тоже оценены по $12,40 = $3 100, итого $6 200 — внутренне согласовано. Ключевая особенность AVCO — ПЕРЕСЧЁТ после каждого поступления; LIFO и FIFO не усредняют.",
        },
        // -------- Q15 — hard MCQ on integrated marginal/absorption decision --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            "A company\u2019s management is choosing between absorption and marginal costing for monthly internal reporting. Demand fluctuates seasonally, with large inventory build-ups in some months and draw-downs in others. The MOST SIGNIFICANT consequence of choosing ABSORPTION over marginal costing for these monthly reports is:",
          prompt_ru:
            "Руководство компании выбирает между абсорбционным и маржинальным учётом для ежемесячной внутренней отчётности. Спрос колеблется сезонно: в одни месяцы — крупное наращивание запасов, в другие — их сокращение. НАИБОЛЕЕ ЗНАЧИМОЕ последствие выбора АБСОРБЦИОННОГО учёта вместо маржинального для ежемесячных отчётов:",
          options: [
            {
              key: "A",
              text_en:
                "Reported monthly profit will fluctuate with INVENTORY changes as well as with sales, making it harder to read underlying performance",
              text_ru:
                "Отражённая ежемесячная прибыль будет колебаться вместе с изменением ЗАПАСОВ и с продажами, затрудняя оценку базовой эффективности",
            },
            {
              key: "B",
              text_en:
                "Total annual profit will be different under the two methods",
              text_ru: "Общая годовая прибыль будет различной при двух методах",
              why_wrong_en:
                "Annual profit is the SAME under both methods when opening and closing inventory are equal year over year; the difference is in TIMING, not total.",
              why_wrong_ru:
                "Годовая прибыль ОДИНАКОВА при обоих методах, когда начальные и конечные запасы по году равны; различие во ВРЕМЕНИ признания, а не в сумме.",
            },
            {
              key: "C",
              text_en:
                "Absorption costing produces lower profit in every month",
              text_ru: "Абсорбционный учёт даёт меньшую прибыль каждый месяц",
              why_wrong_en:
                'Direction depends on inventory MOVEMENT: rising inventory \u2192 absorption HIGHER; falling \u2192 absorption LOWER. Not "always lower".',
              why_wrong_ru:
                "Направление зависит от ДВИЖЕНИЯ запасов: рост → абсорбция ВЫШЕ; падение → НИЖЕ. Не «всегда ниже».",
            },
            {
              key: "D",
              text_en:
                "Absorption costing eliminates the need to know fixed overhead",
              text_ru:
                "Абсорбционный учёт устраняет необходимость знать постоянные накладные",
              why_wrong_en:
                "Absorption specifically REQUIRES allocating fixed overhead to units; marginal is the method that keeps fixed OH separate.",
              why_wrong_ru:
                "Абсорбция специально ТРЕБУЕТ разнесения постоянных накладных на единицы; маржинальный — это метод, удерживающий постоянные накладные отдельно.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Under absorption costing, fixed overhead is carried into closing inventory. When inventory rises (production > sales), fixed cost is parked on the balance sheet \u2014 profit looks higher even if sales are flat. When inventory falls, that fixed cost is released into cost of sales \u2014 profit looks lower even if sales rose. The reported profit therefore swings with INVENTORY LEVELS as well as sales, which obscures genuine performance. Marginal costing eliminates this distortion by always charging fixed overhead to the period incurred. For internal monthly reporting where managers need to read underlying performance, marginal costing is usually preferred. Absorption is required for external reporting (IAS 2), so most firms run both \u2014 absorption for the published accounts, marginal for management decisions.",
          explanation_ru:
            "При абсорбционном учёте постоянные накладные переходят в конечные запасы. При росте запасов (производство > продаж) постоянные затраты «паркуются» в балансе — прибыль кажется выше даже при стабильных продажах. При падении запасов эти постоянные затраты выходят в себестоимость продаж — прибыль кажется ниже даже при росте продаж. Отчётная прибыль колеблется в зависимости от УРОВНЯ ЗАПАСОВ, не только от продаж, что скрывает реальную эффективность. Маржинальный учёт устраняет это искажение, всегда относя постоянные накладные на период их возникновения. Для ежемесячной внутренней отчётности, где менеджерам нужно видеть базовую эффективность, обычно предпочтителен маржинальный. Абсорбционный обязателен для внешней отчётности (IAS 2), поэтому большинство компаний ведут оба — абсорбционный для публикуемой отчётности, маржинальный для управленческих решений.",
        },
      ],
    },

    // ---------- D ----------
    {
      code: "D",
      title_en: "Budgeting",
      title_ru: "Бюджетирование",
      description_en:
        "Budget types, flexed budgets, behavioural aspects, and capital investment appraisal techniques.",
      description_ru:
        "Виды бюджетов, гибкие бюджеты, поведенческие аспекты и методы оценки инвестиций.",
      sort_order: 40,
      theory_en:
        "A budget is a quantified plan over a defined period \u2014 usually a year, broken into months. The budgeting cycle starts with limiting-factor identification (often sales demand), then the principal budget is built, then dependent budgets cascade: sales \u2192 production \u2192 materials/labour/overhead \u2192 cash \u2192 master budget (budgeted P/L, SoFP, cash flow).\n\n" +
        "Budget types reflect different philosophies. Fixed budget remains at original assumptions; flexible budget is restated for actual activity level \u2014 the flexed budget is essential for fair variance analysis. Incremental budgeting starts from last year and adjusts; zero-based budgeting (ZBB) rebuilds each line from scratch, justifying every cost; rolling/continuous budgets are continually extended (drop the elapsed month, add a new future month); activity-based budgets derive resources from planned cost-driver volumes.\n\n" +
        "Top-down (imposed) budgets are set by senior management; bottom-up (participative) budgets involve those responsible for execution. Participation improves motivation and accuracy but risks budgetary slack \u2014 deliberately easy targets created by managers to look good against them. Other behavioural issues: dysfunctional behaviour (chasing the budget metric at expense of broader goals) and the motivational impact of stretching but achievable targets.\n\n" +
        "Capital investment appraisal evaluates long-term projects. Payback period = years until cumulative cash inflows equal initial outlay; simple but ignores time value and post-payback flows. Accounting Rate of Return (ARR) = average profit / average (or initial) investment; uses accounting profit, ignores cash timing. Net Present Value (NPV) discounts future cash flows at the cost of capital \u2014 positive NPV means the project adds value; this is the theoretically preferred method. Internal Rate of Return (IRR) is the discount rate at which NPV = 0; accept if IRR > cost of capital. Discount factor for year n = 1 / (1 + r)\u207f.",
      theory_ru:
        "Бюджет — это количественный план на определённый период, обычно год с разбивкой по месяцам. Цикл бюджетирования начинается с выявления ограничивающего фактора (часто это спрос), затем формируется главный бюджет, а зависимые бюджеты строятся каскадом: продажи → производство → материалы/труд/накладные → денежные средства → сводный бюджет (бюджетный отчёт о прибылях и убытках, баланс, движение денежных средств).\n\n" +
        "Виды бюджетов отражают разные подходы. Фиксированный бюджет остаётся при первоначальных допущениях; гибкий бюджет пересчитывается под фактический уровень активности — гибкий бюджет необходим для корректного анализа отклонений. Инкрементное бюджетирование отталкивается от прошлого года с корректировкой; нулевое бюджетирование (ZBB) выстраивает каждую статью с нуля, обосновывая каждую затрату; скользящие/непрерывные бюджеты постоянно продлеваются (отбрасывают прошедший месяц, добавляют новый будущий); бюджеты по видам деятельности выводят ресурсы из плановых объёмов драйверов затрат.\n\n" +
        "Бюджеты «сверху вниз» (навязанные) задаются высшим руководством; бюджеты «снизу вверх» (партисипативные) вовлекают тех, кто отвечает за исполнение. Участие повышает мотивацию и точность, но создаёт риск бюджетной слабины — намеренно лёгких показателей, выставляемых менеджерами, чтобы хорошо выглядеть на их фоне. Прочие поведенческие проблемы: дисфункциональное поведение (погоня за бюджетной метрикой в ущерб общим целям) и мотивационный эффект амбициозных, но достижимых целей.\n\n" +
        "Оценка капиталовложений анализирует долгосрочные проекты. Срок окупаемости = годы до момента, когда накопленные денежные поступления сравняются с первоначальной инвестицией; прост, но игнорирует временную стоимость денег и потоки после окупаемости. Учётная норма доходности (ARR) = средняя прибыль / средние (или первоначальные) инвестиции; использует учётную прибыль, игнорирует тайминг денежных потоков. Чистая приведённая стоимость (NPV) дисконтирует будущие денежные потоки по стоимости капитала — положительный NPV означает, что проект добавляет стоимость; теоретически предпочтительный метод. Внутренняя норма доходности (IRR) — это ставка дисконтирования, при которой NPV = 0; проект принимается, если IRR > стоимости капитала. Коэффициент дисконтирования для года n = 1 / (1 + r)ⁿ.",
      questions: [
        // -------- Q1 — easy MCQ on principal budget factor --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "For most commercial organisations, the principal budget factor (limiting factor) is usually:",
          prompt_ru:
            "Для большинства коммерческих организаций главный бюджетный фактор (ограничивающий фактор) обычно:",
          options: [
            {
              key: "A",
              text_en: "Cash availability",
              text_ru: "Наличие денежных средств",
              why_wrong_en:
                "Cash can be raised through loans or share issues; the harder constraint is usually demand. Cash IS the limiting factor in distressed firms but not the typical case.",
              why_wrong_ru:
                "Денежные средства можно привлечь через кредиты или эмиссию; обычно сложнее ограничение — спрос. Деньги ограничивают в кризисных компаниях, но не в типичном случае.",
            },
            {
              key: "B",
              text_en: "Sales demand",
              text_ru: "Спрос на продукцию",
            },
            {
              key: "C",
              text_en: "Number of suppliers",
              text_ru: "Число поставщиков",
              why_wrong_en:
                "Suppliers can usually be expanded or substituted; supplier base is rarely the binding constraint.",
              why_wrong_ru:
                "Поставщиков обычно можно расширить или заменить; их количество редко является связывающим ограничением.",
            },
            {
              key: "D",
              text_en: "Government regulation",
              text_ru: "Государственное регулирование",
              why_wrong_en:
                "Regulation can constrain certain activities but isn't typically the primary driver of budget scale.",
              why_wrong_ru:
                "Регулирование может ограничивать отдельные виды деятельности, но обычно не определяет масштаб бюджета.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "The principal budget factor is whatever resource ultimately caps output. For most firms it is sales demand \u2014 they can produce more than the market will buy. When sales is the limiting factor, the sales budget is built first; everything else (production, materials, labour) cascades from it. For firms hitting capacity (e.g. semiconductors during shortage), production capacity becomes the limiting factor and the cascade reorders.",
          explanation_ru:
            "Главный бюджетный фактор — ресурс, в конечном счёте ограничивающий выпуск. У большинства фирм это спрос: они могут произвести больше, чем рынок купит. Когда ограничение — продажи, сначала строится бюджет продаж, а всё остальное (производство, материалы, труд) каскадируется из него. Для компаний, упирающихся в мощности (например, полупроводники в дефицит), главным фактором становится производственная мощность, и каскад перестраивается.",
        },
        // -------- Q2 — easy MCQ on flexed budget --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en: "A flexible (flexed) budget is one that:",
          prompt_ru: "Гибкий бюджет — это бюджет, который:",
          options: [
            {
              key: "A",
              text_en: "Remains unchanged regardless of actual activity",
              text_ru:
                "Остаётся неизменным независимо от фактической активности",
              why_wrong_en:
                "That describes a FIXED budget; the flexed budget changes with actual activity by definition.",
              why_wrong_ru:
                "Это описание ФИКСИРОВАННОГО бюджета; гибкий по определению меняется в зависимости от фактической активности.",
            },
            {
              key: "B",
              text_en: "Has been restated for the actual level of activity",
              text_ru: "Пересчитан под фактический уровень активности",
            },
            {
              key: "C",
              text_en: "Allows unlimited overspending",
              text_ru: "Разрешает неограниченный перерасход",
              why_wrong_en:
                '"Flexible" refers to flexing for activity LEVEL, not flexibility on whether to overspend.',
              why_wrong_ru:
                "«Гибкий» относится к пересчёту под УРОВЕНЬ активности, а не к свободе тратить сверх плана.",
            },
            {
              key: "D",
              text_en: "Covers only fixed costs",
              text_ru: "Включает только постоянные затраты",
              why_wrong_en:
                "A flexed budget includes both fixed AND variable costs; only the variable portion changes with activity.",
              why_wrong_ru:
                "Гибкий бюджет включает И постоянные, И переменные затраты; с активностью меняется только переменная часть.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            'Flexing recalculates the budget at the ACTUAL activity level by adjusting variable costs and revenues proportionally while keeping fixed costs unchanged. This gives a fair comparison: if you budgeted to produce 10,000 units but only made 8,000, your variance analysis must compare actual results to a budget restated for 8,000 \u2014 not the original 10,000 budget. Otherwise the "volume variance" will mask the real efficiency story.',
          explanation_ru:
            "Пересчёт перестраивает бюджет под ФАКТИЧЕСКИЙ уровень активности, пропорционально корректируя переменные затраты и выручку, при этом постоянные затраты остаются без изменений. Это обеспечивает справедливое сравнение: если в бюджете было 10 000 единиц, а сделано 8 000, для анализа отклонений нужно сравнивать с бюджетом, пересчитанным на 8 000, а не с исходным на 10 000. Иначе «отклонение по объёму» скроет реальную картину эффективности.",
        },
        // -------- Q3 — easy short_answer on budget types --------
        {
          type: "short_answer",
          difficulty: "easy",
          prompt_en:
            "Name the budgeting approach that requires every cost item to be justified from scratch each period, with no presumption that last year\u2019s figure is correct.",
          prompt_ru:
            "Назовите подход к бюджетированию, при котором каждая статья затрат должна обосновываться с нуля каждый период, без предположения, что прошлогодняя цифра верна.",
          correct_answer_en: "Zero-based budgeting (ZBB)",
          correct_answer_ru: "Нулевое бюджетирование (ZBB)",
          explanation_en:
            "ZBB starts from zero each period: every activity, every cost, every headcount must be re-justified. Pros: forces managers to question entrenched spending, exposes obsolete activities, can yield meaningful savings. Cons: time-consuming and often resisted (people defending their budgets). In practice many firms apply ZBB selectively (e.g. every third year) rather than annually. The opposite extreme is INCREMENTAL budgeting: start with last year and adjust for inflation/growth \u2014 fast but tends to entrench past mistakes.",
          explanation_ru:
            "ZBB начинает с нуля каждый период: каждый вид деятельности, каждая затрата, каждая ставка должна быть обоснована заново. Плюсы: заставляет ставить под сомнение укоренившиеся расходы, выявляет устаревшие виды деятельности, может дать существенную экономию. Минусы: трудоёмко, часто встречает сопротивление (люди защищают свои бюджеты). На практике многие компании применяют ZBB выборочно (например, раз в три года), а не ежегодно. Противоположный подход — ИНКРЕМЕНТНЫЙ: отталкиваться от прошлого года и корректировать на инфляцию/рост — быстро, но закрепляет прошлые ошибки.",
        },
        // -------- Q4 — easy MCQ on participative budget --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "A participative (bottom-up) budgeting approach is one where:",
          prompt_ru:
            "Партисипативный (снизу вверх) подход к бюджетированию — это подход, при котором:",
          options: [
            {
              key: "A",
              text_en: "Senior management imposes targets without consultation",
              text_ru: "Высшее руководство устанавливает цели без обсуждения",
              why_wrong_en:
                "That's a TOP-DOWN (imposed) budget; participative is the opposite.",
              why_wrong_ru:
                "Это бюджет «СВЕРХУ ВНИЗ» (навязанный); партисипативный — противоположность.",
            },
            {
              key: "B",
              text_en:
                "Operational managers and their teams contribute to setting their own budgets",
              text_ru:
                "Операционные руководители и их команды участвуют в формировании своих бюджетов",
            },
            {
              key: "C",
              text_en: "The CFO writes the budget alone",
              text_ru: "Бюджет пишет в одиночку финансовый директор",
              why_wrong_en:
                "A budget written by one person is the opposite of participative.",
              why_wrong_ru:
                "Бюджет, написанный одним человеком, — противоположность партисипативному.",
            },
            {
              key: "D",
              text_en: "Budgets are set automatically by software",
              text_ru: "Бюджеты задаются автоматически программой",
              why_wrong_en:
                "Software automation is unrelated to who contributes input; the question is about people, not tools.",
              why_wrong_ru:
                "Автоматизация программой не связана с тем, кто вносит вклад; вопрос про людей, а не инструменты.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Participative budgets involve those responsible for execution in setting the targets. Benefits: better data quality (front-line people know operational reality), higher motivation (people are more committed to numbers they helped set), better forecasts on the ground. Risks: budgetary slack \u2014 managers may deliberately propose easy targets to look good against them. The fix is independent challenge during the budget review process.",
          explanation_ru:
            "Партисипативные бюджеты вовлекают тех, кто отвечает за исполнение, в постановку целей. Плюсы: качество данных выше (передовая знает операционную реальность), мотивация выше (люди привержены цифрам, в постановке которых участвовали), точнее прогнозы. Риски: бюджетная слабина — менеджеры могут намеренно предлагать лёгкие цели, чтобы хорошо выглядеть на их фоне. Лечение — независимый контроль на этапе рассмотрения.",
        },
        // -------- Q5 — medium NUMBER_ENTRY on payback period --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "A project requires an initial outlay of $50,000 and generates cash inflows of $15,000, $20,000, $20,000, $25,000 in years 1\u20134 respectively. What is the PAYBACK PERIOD in years (assume cash flows occur evenly within each year, give answer to 1 decimal place)?",
          prompt_ru:
            "Проект требует первоначальных вложений $50 000 и приносит денежные поступления $15 000, $20 000, $20 000, $25 000 в годах 1–4 соответственно. Каков СРОК ОКУПАЕМОСТИ в годах (примите, что потоки распределяются равномерно внутри года; ответ с точностью до 1 знака)?",
          correct_answer_en: "2.75",
          acceptable_tolerance: 0.05,
          explanation_en:
            "Cumulative cash inflows: end of Yr1 = 15,000; end of Yr2 = 35,000; end of Yr3 = 55,000. The initial $50,000 is recovered DURING Year 3. Shortfall at end of Year 2 = 50,000 − 35,000 = $15,000. Year 3 inflow = $20,000. Fraction of Year 3 needed = 15,000 / 20,000 = 0.75 of the year. Payback = 2 years + 0.75 of year 3 = 2.75 years. Payback ignores time value of money and post-payback cash flows; the $25,000 in Year 4 is invisible to this metric.",
          explanation_ru:
            "Накопленные поступления: конец Y1 = 15 000; конец Y2 = 35 000; конец Y3 = 55 000. Первоначальные $50 000 окупаются В ТЕЧЕНИЕ года 3. Недостача на конец Y2 = 50 000 − 35 000 = $15 000. Поступление Y3 = $20 000. Доля Y3 = 15 000 / 20 000 = 0,75 года. Окупаемость = 2 года + 0,75 = 2,75 года. Метод игнорирует временную стоимость денег и потоки после окупаемости; $25 000 в году 4 для этой метрики «невидимы».",
        },
        // -------- Q6 — medium NUMBER_ENTRY on ARR --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "An asset costs $80,000 with no residual value and useful life of 4 years. Average annual ACCOUNTING profit over the four years is $12,000. Calculate the Accounting Rate of Return (ARR) using AVERAGE investment as the base (give answer as a percentage to 1 decimal place).",
          prompt_ru:
            "Актив стоит $80 000 без ликвидационной стоимости со сроком полезного использования 4 года. Средняя годовая УЧЁТНАЯ прибыль за 4 года — $12 000. Рассчитайте учётную норму доходности (ARR) по СРЕДНИМ инвестициям (ответ в процентах с точностью до 1 знака).",
          correct_answer_en: "30",
          acceptable_tolerance: 0.5,
          explanation_en:
            "Average investment = (initial cost + residual value) / 2 = (80,000 + 0) / 2 = $40,000. ARR = average profit / average investment \u00d7 100 = 12,000 / 40,000 \u00d7 100 = 30%. If you used INITIAL investment as the base instead, ARR = 12,000 / 80,000 \u00d7 100 = 15%. The question specifies AVERAGE investment, which assumes the asset is depreciated to zero straight-line. Common exam trap: students using initial investment when average was asked, or vice versa.",
          explanation_ru:
            "Средние инвестиции = (первоначальная стоимость + ликвидационная) / 2 = (80 000 + 0) / 2 = $40 000. ARR = средняя прибыль / средние инвестиции × 100 = 12 000 / 40 000 × 100 = 30%. Если бы использовалась ПЕРВОНАЧАЛЬНАЯ инвестиция, ARR = 12 000 / 80 000 × 100 = 15%. В вопросе указано СРЕДНЯЯ инвестиция, что подразумевает линейную амортизацию до нуля. Типичная ловушка: использовать первоначальную при вопросе о средней, или наоборот.",
        },
        // -------- Q7 — medium NUMBER_ENTRY on NPV calc --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "A project requires $100,000 upfront and generates $60,000 at the end of year 1 and $70,000 at the end of year 2. The cost of capital is 10%. What is the NPV (in $, to the nearest $)?",
          prompt_ru:
            "Проект требует $100 000 в начале и приносит $60 000 в конце года 1 и $70 000 в конце года 2. Стоимость капитала — 10%. Чему равна NPV (в $, до ближайшего $)?",
          correct_answer_en: "12396",
          acceptable_tolerance: 50,
          explanation_en:
            "Discount factors at 10%: Year 1 = 1/1.10 = 0.9091; Year 2 = 1/1.10\u00b2 = 0.8264. Present value of cash inflows = (60,000 \u00d7 0.9091) + (70,000 \u00d7 0.8264) = 54,545 + 57,851 = 112,396. NPV = 112,396 \u2212 100,000 = $12,396 (rounding to nearest $ gives 12,396 or 12,397 depending on which rounded factors are used). NPV > 0 \u2192 ACCEPT: the project adds value at the 10% cost of capital. Tolerance of \u00b150 accounts for discount-factor rounding.",
          explanation_ru:
            "Коэффициенты дисконтирования при 10%: Y1 = 1/1,10 = 0,9091; Y2 = 1/1,10² = 0,8264. Приведённая стоимость поступлений = (60 000 × 0,9091) + (70 000 × 0,8264) = 54 545 + 57 851 = 112 396. NPV = 112 396 − 100 000 = $12 396 (округление до $ даёт 12 396 или 12 397 в зависимости от используемых округлённых коэффициентов). NPV > 0 → ПРИНЯТЬ: проект добавляет стоимость при стоимости капитала 10%. Допуск ±50 учитывает округление коэффициентов.",
        },
        // -------- Q8 — medium MCQ on NPV vs IRR --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A project has NPV of +$5,000 at the company\u2019s cost of capital of 12%. The Internal Rate of Return (IRR) must therefore be:",
          prompt_ru:
            "NPV проекта = +$5 000 при стоимости капитала компании 12%. Внутренняя норма доходности (IRR) должна быть, соответственно:",
          options: [
            {
              key: "A",
              text_en: "Below 12%",
              text_ru: "Ниже 12%",
              why_wrong_en:
                "If IRR were below 12%, the NPV at 12% would be NEGATIVE, not positive.",
              why_wrong_ru:
                "Если бы IRR была ниже 12%, NPV при 12% была бы ОТРИЦАТЕЛЬНОЙ, а не положительной.",
            },
            {
              key: "B",
              text_en: "Exactly 12%",
              text_ru: "Ровно 12%",
              why_wrong_en:
                "IRR is the rate at which NPV = 0; if NPV at 12% is positive, IRR is HIGHER than 12%.",
              why_wrong_ru:
                "IRR — ставка, при которой NPV = 0; если NPV при 12% положительна, то IRR ВЫШЕ 12%.",
            },
            { key: "C", text_en: "Above 12%", text_ru: "Выше 12%" },
            {
              key: "D",
              text_en: "Exactly equal to the NPV value",
              text_ru: "Ровно равной значению NPV",
              why_wrong_en:
                "IRR is a percentage rate; NPV is a $ amount. They have different units \u2014 they cannot be equal.",
              why_wrong_ru:
                "IRR — это процентная ставка; NPV — сумма в $. У них разные единицы, они не могут быть равны.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "IRR is the discount rate at which NPV = 0. NPV is a decreasing function of the discount rate \u2014 raise the rate, NPV falls. If at 12% NPV is still positive ($5,000), then the rate must be raised ABOVE 12% to push NPV down to zero, which is the IRR. Decision rules: accept when NPV > 0 (which is equivalent to accept when IRR > cost of capital). Both methods agree on accept/reject for independent projects; they can disagree when ranking competing projects, in which case NPV wins because it measures absolute value added.",
          explanation_ru:
            "IRR — ставка дисконтирования, при которой NPV = 0. NPV — убывающая функция ставки: поднимая ставку, NPV снижается. Если при 12% NPV ещё положительна ($5 000), ставку нужно поднять ВЫШЕ 12%, чтобы довести NPV до нуля, и это и есть IRR. Правила решения: принимать при NPV > 0 (что эквивалентно IRR > стоимости капитала). Для отдельных проектов оба метода дают одинаковое решение; при ранжировании конкурирующих проектов они могут расходиться, и тогда побеждает NPV, поскольку измеряет абсолютную добавленную стоимость.",
        },
        // -------- Q9 — medium MCQ on rolling budget --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A rolling (continuous) budget is BEST described as one that:",
          prompt_ru:
            "Скользящий (непрерывный) бюджет ЛУЧШЕ всего описывается как бюджет, который:",
          options: [
            {
              key: "A",
              text_en: "Is updated every five years",
              text_ru: "Обновляется каждые пять лет",
              why_wrong_en:
                "A 5-year cycle is strategic planning territory; rolling budgets are updated continuously, typically monthly or quarterly.",
              why_wrong_ru:
                "5-летний цикл — территория стратегического планирования; скользящие бюджеты обновляются постоянно, обычно ежемесячно или ежеквартально.",
            },
            {
              key: "B",
              text_en:
                "Is continuously extended by adding a new future period as the current one elapses",
              text_ru:
                "Постоянно продлевается добавлением нового будущего периода по мере истечения текущего",
            },
            {
              key: "C",
              text_en: "Permits unlimited spending",
              text_ru: "Разрешает неограниченные расходы",
              why_wrong_en:
                "Spending discipline is unrelated to whether the budget rolls or is fixed.",
              why_wrong_ru:
                "Дисциплина расходов не связана с тем, скользящий бюджет или фиксированный.",
            },
            {
              key: "D",
              text_en: "Has no end date",
              text_ru: "Не имеет даты окончания",
              why_wrong_en:
                "A rolling budget always covers a defined horizon (e.g. always the next 12 months); the horizon rolls forward, but at any moment there is a defined period.",
              why_wrong_ru:
                "Скользящий бюджет всегда покрывает определённый горизонт (например, всегда следующие 12 месяцев); горизонт смещается, но в любой момент период определён.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Rolling budget maintains a constant forward horizon: as one month/quarter ends, a new one at the far end is added. Example: a 12-month rolling budget on 1 February covers Feb-Jan; on 1 March, the original Feb has elapsed and a new Feb (12 months out) is added. Pros: budget is always current, encourages continuous re-forecasting. Cons: time-consuming, can dilute the seriousness of any single set of figures (always provisional).",
          explanation_ru:
            "Скользящий бюджет удерживает постоянный горизонт вперёд: с истечением месяца/квартала добавляется новый период в дальнем конце. Пример: 12-месячный скользящий бюджет на 1 февраля покрывает февраль-январь; на 1 марта февраль уже истёк, добавляется новый февраль (через 12 месяцев). Плюсы: бюджет всегда актуален, стимулирует непрерывное перепрогнозирование. Минусы: трудоёмко, может ослаблять серьёзность любой одной версии (всегда «предварительная»).",
        },
        // -------- Q10 — medium NUMBER_ENTRY on flexed budget calc --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "Original budget for 10,000 units: variable cost $40,000, fixed cost $30,000. Actual production = 8,000 units. What is the FLEXED total cost (in $)?",
          prompt_ru:
            "Исходный бюджет на 10 000 единиц: переменные затраты $40 000, постоянные $30 000. Фактическое производство = 8 000 единиц. Каковы ПЕРЕСЧИТАННЫЕ общие затраты (в $)?",
          correct_answer_en: "62000",
          acceptable_tolerance: 1,
          explanation_en:
            "Variable cost per unit = $40,000 / 10,000 = $4. Flexed variable cost for 8,000 units = $4 \u00d7 8,000 = $32,000. Fixed cost stays at $30,000 (doesn't change with activity). Flexed total = 32,000 + 30,000 = $62,000. The whole point of flexing: this $62,000 is now a fair benchmark for actual costs. Comparing actual against the ORIGINAL $70,000 budget would mask whether costs were well-controlled \u2014 the firm produced 20% fewer units, so naturally spent less in absolute terms.",
          explanation_ru:
            "Переменные затраты на единицу = $40 000 / 10 000 = $4. Пересчитанные переменные для 8 000 единиц = $4 × 8 000 = $32 000. Постоянные = $30 000 (не зависят от объёма). Пересчитанный итог = 32 000 + 30 000 = $62 000. В этом и смысл пересчёта: $62 000 теперь корректный ориентир для сравнения с фактом. Сравнение с ИСХОДНЫМ бюджетом $70 000 скроет, насколько хорошо контролировались затраты — выпуск на 20% меньше, поэтому в абсолютном выражении и потрачено меньше.",
        },
        // -------- Q11 — medium MCQ on budgetary slack --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en: '"Budgetary slack" refers to:',
          prompt_ru: "«Бюджетная слабина» означает:",
          options: [
            {
              key: "A",
              text_en: "Unused time in the budget meeting agenda",
              text_ru: "Незанятое время в повестке бюджетного совещания",
              why_wrong_en:
                'This takes "slack" too literally; it\'s a technical term about deliberately easy targets.',
              why_wrong_ru:
                "Это слишком буквальное прочтение «слабины»; это технический термин о намеренно лёгких целях.",
            },
            {
              key: "B",
              text_en:
                "Managers deliberately setting easy targets so they can outperform them",
              text_ru:
                "Менеджеры намеренно ставят лёгкие цели, чтобы их перевыполнять",
            },
            {
              key: "C",
              text_en: "Random forecast error",
              text_ru: "Случайная ошибка прогноза",
              why_wrong_en:
                "Slack is DELIBERATE distortion, not random error. Random errors cancel out on average; slack systematically lowers targets.",
              why_wrong_ru:
                "Слабина — НАМЕРЕННОЕ искажение, не случайная ошибка. Случайные ошибки в среднем гасят друг друга; слабина систематически занижает цели.",
            },
            {
              key: "D",
              text_en: "A buffer between operating and capital budgets",
              text_ru: "Буфер между операционным и капитальным бюджетами",
              why_wrong_en:
                "No such standard concept exists; this is a distractor.",
              why_wrong_ru:
                "Такого стандартного понятия нет; это отвлекающий вариант.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            'Budgetary slack occurs when managers responsible for both setting and meeting budgets propose targets they know are easy. Motives: bonus tied to budget achievement, reputation for "reliable" performance, headroom for unforeseen issues. Slack is a known weakness of participative budgeting; safeguards include independent review by senior management or finance, historical benchmark comparison, and rewarding accurate forecasts (not just hitting targets).',
          explanation_ru:
            "Бюджетная слабина возникает, когда менеджеры, отвечающие и за постановку, и за выполнение бюджета, предлагают цели, которые они заведомо могут перевыполнить. Мотивы: бонус, привязанный к выполнению бюджета, репутация «надёжного исполнителя», запас на непредвиденные ситуации. Слабина — известная слабость партисипативного бюджетирования; защитные меры: независимая проверка высшим руководством или финансами, сравнение с историческими ориентирами и вознаграждение за точность прогноза (а не только за выполнение цели).",
        },
        // -------- Q12 — medium short_answer on NPV decision rule --------
        {
          type: "short_answer",
          difficulty: "medium",
          prompt_en:
            "State the decision rule for accepting or rejecting an investment project using the NPV method.",
          prompt_ru:
            "Сформулируйте правило принятия или отклонения инвестиционного проекта по методу NPV.",
          correct_answer_en:
            "Accept the project if NPV is positive; reject if NPV is negative. (When choosing between competing projects, choose the one with the highest NPV.)",
          correct_answer_ru:
            "Принять проект, если NPV положительна; отклонить, если отрицательна. (При выборе между конкурирующими проектами — выбрать с максимальной NPV.)",
          explanation_en:
            "Positive NPV means the project's discounted cash inflows exceed its initial cost \u2014 the firm is wealthier for doing it. Negative NPV means it destroys value. NPV = 0 is the indifference point: the project just earns the cost of capital, producing no excess value. The rule assumes the cost of capital correctly reflects the project's risk; in practice, project-specific risk-adjusted discount rates are sometimes used to refine the decision for high-risk or unusual projects.",
          explanation_ru:
            "Положительная NPV означает, что дисконтированные поступления превышают первоначальные вложения — компания становится богаче от проекта. Отрицательная NPV — проект разрушает стоимость. NPV = 0 — точка безразличия: проект ровно зарабатывает стоимость капитала, без дополнительной ценности. Правило предполагает, что стоимость капитала корректно отражает риск проекта; на практике для высокорискованных или необычных проектов иногда применяются индивидуальные ставки дисконтирования с учётом риска.",
        },
        // -------- Q13 — medium MCQ on incremental budgeting drawback --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en: "The MAIN drawback of incremental budgeting is that it:",
          prompt_ru: "ГЛАВНЫЙ недостаток инкрементного бюджетирования:",
          options: [
            {
              key: "A",
              text_en: "Requires too much detail to be practical",
              text_ru:
                "Требует слишком много детализации для практического применения",
              why_wrong_en:
                "The opposite is true \u2014 incremental is the LEAST detailed approach; it's ZBB that demands extensive justification.",
              why_wrong_ru:
                "Наоборот — инкрементный наименее детализированный подход; именно ZBB требует обширного обоснования.",
            },
            {
              key: "B",
              text_en:
                "Perpetuates past inefficiencies and slack into future periods",
              text_ru:
                "Переносит прошлые неэффективности и слабину в будущие периоды",
            },
            {
              key: "C",
              text_en: "Cannot incorporate inflation",
              text_ru: "Не позволяет учитывать инфляцию",
              why_wrong_en:
                "Inflation adjustment is precisely the kind of incremental adjustment this method supports; this is a feature, not a flaw.",
              why_wrong_ru:
                "Корректировка на инфляцию — именно та инкрементная подстройка, которую метод поддерживает; это свойство, а не недостаток.",
            },
            {
              key: "D",
              text_en: "Always produces lower budgets than ZBB",
              text_ru: "Всегда даёт более низкие бюджеты, чем ZBB",
              why_wrong_en:
                "There's no systematic relationship between the two methods' totals; the issue is how the figures are arrived at, not their magnitude.",
              why_wrong_ru:
                "Систематической связи между размером бюджетов в двух методах нет; вопрос в том, как формируются цифры, а не каков их размер.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Incremental budgeting starts from last year's figures and adjusts for inflation, growth or known changes. It's fast and cheap, but it accepts whatever was in last year's budget AS A BASELINE \u2014 including waste, overstaffing, obsolete activities, slack that managers built in previously. Year after year these persist and compound. ZBB is the opposite tool: laborious but forces re-justification. Many firms compromise with periodic deep reviews while running incremental in between.",
          explanation_ru:
            "Инкрементное бюджетирование отталкивается от прошлогодних цифр, корректируя на инфляцию, рост и известные изменения. Метод быстрый и дешёвый, но принимает прошлогодний бюджет КАК ИСХОДНУЮ ТОЧКУ — включая потери, избыточную численность, устаревшие виды деятельности, накопленную ранее слабину. Год за годом это сохраняется и накапливается. ZBB — противоположный инструмент: трудоёмкий, но требует переобоснования. Многие компании идут на компромисс: периодические глубокие пересмотры на фоне инкрементного бюджетирования между ними.",
        },
        // -------- Q14 — hard NUMBER_ENTRY on multi-year NPV --------
        {
          type: "number_entry",
          difficulty: "hard",
          prompt_en:
            "A project requires $200,000 upfront and generates $80,000 per year for 4 years. The cost of capital is 8%. The 4-year annuity factor at 8% is 3.312. What is the NPV (in $)?",
          prompt_ru:
            "Проект требует $200 000 в начале и приносит $80 000 в год в течение 4 лет. Стоимость капитала — 8%. Фактор аннуитета на 4 года при 8% = 3,312. Чему равна NPV (в $)?",
          correct_answer_en: "64960",
          acceptable_tolerance: 10,
          explanation_en:
            "When cash flows are EQUAL every year (an annuity), use the annuity factor for speed: PV of annuity = annual cash flow \u00d7 annuity factor = $80,000 \u00d7 3.312 = $264,960. NPV = PV of inflows \u2212 initial outlay = 264,960 \u2212 200,000 = $64,960. The 4-year annuity factor of 3.312 at 8% is the sum of discount factors for years 1\u20134: 0.9259 + 0.8573 + 0.7938 + 0.7350 \u2248 3.312. NPV > 0 \u2192 accept.",
          explanation_ru:
            "Когда потоки ОДИНАКОВЫ каждый год (аннуитет), для скорости используют фактор аннуитета: PV аннуитета = годовой поток × фактор аннуитета = $80 000 × 3,312 = $264 960. NPV = PV поступлений − первоначальные вложения = 264 960 − 200 000 = $64 960. Фактор аннуитета 3,312 на 4 года при 8% — это сумма коэффициентов дисконтирования для лет 1–4: 0,9259 + 0,8573 + 0,7938 + 0,7350 ≈ 3,312. NPV > 0 → принять.",
        },
        // -------- Q15 — hard MCQ on integrated investment appraisal --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            "Two mutually exclusive projects are being evaluated. Project X: payback 2 years, NPV $50,000, IRR 20%. Project Y: payback 4 years, NPV $80,000, IRR 14%. The company's cost of capital is 12% and the firm is NOT cash-constrained. Which project should be chosen, and why?",
          prompt_ru:
            "Оцениваются два взаимоисключающих проекта. Проект X: окупаемость 2 года, NPV $50 000, IRR 20%. Проект Y: окупаемость 4 года, NPV $80 000, IRR 14%. Стоимость капитала компании 12%, и фирма НЕ ограничена в денежных средствах. Какой проект выбрать и почему?",
          options: [
            {
              key: "A",
              text_en:
                "Project X, because its payback is shorter and IRR is higher",
              text_ru:
                "Проект X, поскольку у него короче окупаемость и выше IRR",
              why_wrong_en:
                "Payback and IRR can mislead when comparing competing projects; NPV measures absolute value added and should win when there's no cash constraint.",
              why_wrong_ru:
                "Окупаемость и IRR могут вводить в заблуждение при сравнении альтернатив; NPV измеряет абсолютную добавленную стоимость и должна побеждать при отсутствии денежного ограничения.",
            },
            {
              key: "B",
              text_en:
                "Project Y, because its NPV is higher \u2014 it adds more value to the firm",
              text_ru:
                "Проект Y, поскольку у него выше NPV — он добавляет больше стоимости фирме",
            },
            {
              key: "C",
              text_en:
                "Both, because both have NPV > 0 and IRR > cost of capital",
              text_ru:
                "Оба, так как у обоих NPV > 0 и IRR > стоимости капитала",
              why_wrong_en:
                'The projects are MUTUALLY EXCLUSIVE \u2014 only one can be taken; "both" is not an option.',
              why_wrong_ru:
                "Проекты ВЗАИМОИСКЛЮЧАЮЩИЕ — можно взять только один; вариант «оба» невозможен.",
            },
            {
              key: "D",
              text_en: "Neither, because payback exceeds 1 year for both",
              text_ru: "Ни один, так как окупаемость превышает 1 год у обоих",
              why_wrong_en:
                "There's no rule that payback must be 1 year; 2-4 years is normal for moderate-term projects. Both projects have positive NPV \u2014 they add value.",
              why_wrong_ru:
                "Нет правила, что окупаемость должна быть 1 год; 2–4 года — нормальный диапазон для среднесрочных проектов. У обоих NPV положительна — они добавляют стоимость.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "When projects are mutually exclusive and the firm is not cash-constrained, NPV wins. NPV measures the ABSOLUTE VALUE added in dollars; IRR measures the RATE of return. A high rate of return on a small project can produce LESS total value than a moderate rate on a large project \u2014 which is exactly what's happening here. Project X has a higher IRR (20% vs 14%), but Project Y's larger scale produces a higher NPV ($80,000 vs $50,000). The firm is $30,000 better off choosing Y. Payback is a poor primary criterion because it ignores both time value AND post-payback flows. The standard textbook ranking for unconstrained capital: NPV > IRR > payback. The exception is when capital IS constrained \u2014 then a profitability index per dollar of investment may be needed.",
          explanation_ru:
            "Когда проекты взаимоисключающие и фирма не ограничена в средствах, побеждает NPV. NPV измеряет АБСОЛЮТНУЮ ДОБАВЛЕННУЮ СТОИМОСТЬ в долларах; IRR — СТАВКУ доходности. Высокая ставка на малом проекте может дать МЕНЬШУЮ общую стоимость, чем умеренная ставка на крупном — именно это и происходит здесь. У Проекта X выше IRR (20% против 14%), но больший масштаб Проекта Y даёт более высокую NPV ($80 000 против $50 000). Выбрав Y, фирма получает $30 000 дополнительной стоимости. Окупаемость — плохой главный критерий, потому что игнорирует и временную стоимость денег, И потоки после окупаемости. Стандартный учебный приоритет при отсутствии ограничения капитала: NPV > IRR > окупаемость. Исключение — при ОГРАНИЧЕНИИ капитала, тогда может понадобиться индекс прибыльности на доллар вложений.",
        },
      ],
    },
    // =============================================================================
    // F2 — Sections E and F (FINAL F2 SECTIONS)
    // Paste-ready: each block replaces the empty LO entry in backend/src/seed/data/f2.ts
    // 15 questions per LO. Mix: 4 easy / 8 medium / 3 hard.
    // =============================================================================

    // ---------- E ----------
    {
      code: "E",
      title_en: "Standard costing",
      title_ru: "Нормативный учёт",
      description_en:
        "Standard cost setting, variance calculation and analysis, and profit reconciliation.",
      description_ru:
        "Установление нормативной себестоимости, расчёт и анализ отклонений, сверка прибыли.",
      sort_order: 50,
      theory_en:
        "Standard costing sets a pre-determined cost per unit for each input \u2014 material price, material quantity, labour rate, labour hours, variable and fixed overhead \u2014 based on what cost should be under efficient operating conditions. Standards can be ideal (perfect conditions, demotivating), attainable (challenging but achievable, the most common choice), current (reflects present operating conditions), or basic (unchanged over years, used for trend analysis). The standard cost card lists every input per unit with its standard price and standard quantity.\n\n" +
        "Variance analysis compares actual results against the flexed budget at standard cost, isolating where reality diverged from plan. Each cost element splits into a price/rate variance and a usage/efficiency variance.\n\n" +
        "Material price variance = (Standard Price \u2212 Actual Price) \u00d7 Actual Quantity purchased. Material usage variance = (Standard Quantity for actual output \u2212 Actual Quantity used) \u00d7 Standard Price. Labour rate variance = (Standard Rate \u2212 Actual Rate) \u00d7 Actual Hours. Labour efficiency variance = (Standard Hours for actual output \u2212 Actual Hours worked) \u00d7 Standard Rate. Variable overhead variances follow the same pattern as labour, since variable overhead is typically absorbed on hours. Fixed overhead expenditure variance = Budgeted Fixed Overhead \u2212 Actual Fixed Overhead. Fixed overhead volume variance (under absorption costing only) = (Actual Output \u2212 Budgeted Output) \u00d7 Standard Fixed Overhead per unit, which further splits into capacity (idle vs target hours) and efficiency variances.\n\n" +
        "Sales price variance = (Actual Price \u2212 Standard Price) \u00d7 Actual Sales Units. Sales volume variance = (Actual Sales Units \u2212 Budgeted Sales Units) \u00d7 Standard contribution (marginal costing) or Standard profit (absorption costing) per unit. The operating statement reconciles budgeted profit to actual profit by adding favourable variances and subtracting adverse ones. Variances are flagged for investigation when material in size, persistent in direction, or controllable.",
      theory_ru:
        "Нормативный учёт устанавливает заранее заданную себестоимость единицы для каждого входа — цена материала, его количество, тариф труда, нормо-часы, переменные и постоянные накладные — исходя из того, какой эта себестоимость должна быть при эффективных условиях работы. Нормативы бывают идеальными (идеальные условия, демотивирующие), достижимыми (сложными, но достижимыми — самый частый выбор), текущими (отражают нынешние условия) или базовыми (неизменными годами, для анализа тренда). Карточка нормативной себестоимости перечисляет каждый вход на единицу продукции с его нормативной ценой и нормативным количеством.\n\n" +
        "Анализ отклонений сравнивает фактические результаты с гибким бюджетом по нормативной себестоимости, выявляя расхождения с планом. Каждый элемент затрат раскладывается на отклонение по цене/тарифу и отклонение по использованию/эффективности.\n\n" +
        "Отклонение по цене материалов = (Нормативная цена − Фактическая цена) × Фактически закупленное количество. Отклонение по использованию материалов = (Нормативное количество на фактический выпуск − Фактически использованное количество) × Нормативная цена. Отклонение по тарифу труда = (Нормативная ставка − Фактическая ставка) × Фактические часы. Отклонение по эффективности труда = (Нормативные часы на фактический выпуск − Фактически отработанные часы) × Нормативная ставка. Отклонения по переменным накладным аналогичны труду, так как переменные накладные обычно абсорбируются на часах. Отклонение по расходованию постоянных накладных = Бюджетные постоянные накладные − Фактические постоянные накладные. Отклонение по объёму постоянных накладных (только при абсорбционном учёте) = (Фактический выпуск − Бюджетный выпуск) × Нормативные постоянные накладные на единицу; далее раскладывается на отклонение по мощности (простой против целевых часов) и по эффективности.\n\n" +
        "Отклонение по цене продаж = (Фактическая цена − Нормативная цена) × Фактически проданные единицы. Отклонение по объёму продаж = (Фактический объём − Бюджетный объём) × Нормативный маржинальный доход (маржинальный учёт) или нормативная прибыль (абсорбционный учёт) на единицу. Операционный отчёт сверяет бюджетную прибыль с фактической, прибавляя благоприятные и вычитая неблагоприятные отклонения. Отклонения подлежат расследованию при существенном размере, устойчивом направлении или контролируемости.",
      questions: [
        // -------- Q1 — easy MCQ on standard cost definition --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en: 'A "standard cost" is BEST described as:',
          prompt_ru: "Нормативная себестоимость ЛУЧШЕ всего описывается как:",
          options: [
            {
              key: "A",
              text_en: "The actual cost incurred in the most recent period",
              text_ru:
                "Фактическая себестоимость, понесённая в последнем периоде",
              why_wrong_en:
                "Actual costs are what happened; standards are what SHOULD happen under efficient conditions.",
              why_wrong_ru:
                "Фактические затраты — это то, что произошло; нормативы — то, что ДОЛЖНО произойти при эффективных условиях.",
            },
            {
              key: "B",
              text_en:
                "A pre-determined cost per unit of input or output, set under efficient conditions",
              text_ru:
                "Заранее заданная себестоимость единицы входа или выпуска, определяемая в условиях эффективной работы",
            },
            {
              key: "C",
              text_en: "The cost permitted by tax authorities",
              text_ru: "Себестоимость, разрешённая налоговыми органами",
              why_wrong_en:
                "Tax rules don't set internal standards; tax cost categorisation is a separate concept from management standards.",
              why_wrong_ru:
                "Налоговые правила не задают внутренние нормативы; налоговая классификация затрат — отдельный от управленческих нормативов вопрос.",
            },
            {
              key: "D",
              text_en: "The highest possible cost the firm could incur",
              text_ru: "Максимально возможная себестоимость",
              why_wrong_en:
                "Standards are TARGETS for efficiency, not worst-case caps; they're typically set at attainable levels below worst-case.",
              why_wrong_ru:
                "Нормативы — это ЦЕЛИ эффективности, а не верхние границы; обычно задаются на достижимом уровне ниже худшего случая.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "A standard cost is the cost EXPECTED for one unit under efficient operating conditions. It is set in advance through industrial-engineering studies, time-and-motion analysis, supplier negotiations, and management judgement. Standards become the yardstick against which actual results are measured \u2014 the gap between actual and standard is the variance.",
          explanation_ru:
            "Нормативная себестоимость — это ОЖИДАЕМАЯ себестоимость одной единицы при эффективных условиях работы. Она задаётся заранее через инженерные исследования, нормирование времени, переговоры с поставщиками и управленческое суждение. Норматив становится эталоном для сравнения с фактом — разрыв между ними и есть отклонение.",
        },
        // -------- Q2 — easy MCQ on attainable standard --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "Which type of standard is set under perfect operating conditions, with no waste, no breakdowns, no idle time?",
          prompt_ru:
            "Какой тип норматива задаётся при идеальных условиях работы — без потерь, поломок и простоев?",
          options: [
            { key: "A", text_en: "Ideal", text_ru: "Идеальный" },
            {
              key: "B",
              text_en: "Attainable",
              text_ru: "Достижимый",
              why_wrong_en:
                "Attainable standards allow for normal levels of waste, downtime, and other realistic inefficiencies; they're NOT perfect.",
              why_wrong_ru:
                "Достижимые нормативы учитывают нормальный уровень потерь, простоев и реалистичных неэффективностей; они НЕ идеальны.",
            },
            {
              key: "C",
              text_en: "Current",
              text_ru: "Текущий",
              why_wrong_en:
                "Current standards reflect TODAY's operating conditions \u2014 explicitly including current inefficiencies, the opposite of perfect.",
              why_wrong_ru:
                "Текущие нормативы отражают сегодняшние условия работы — явно включая текущие неэффективности, противоположно идеальным.",
            },
            {
              key: "D",
              text_en: "Basic",
              text_ru: "Базовый",
              why_wrong_en:
                "Basic standards are unchanged over many years for trend analysis; they're not defined by perfection but by stability.",
              why_wrong_ru:
                "Базовые нормативы неизменны годами для анализа трендов; определяются стабильностью, а не идеальностью.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Ideal standards assume perfection: no waste, no idle time, no machine breakdowns, no rework. They're useful for setting an absolute ceiling on what's technically possible but are usually DEMOTIVATING because workers can never meet them. Most firms use attainable standards \u2014 challenging but realistic, allowing for normal levels of inefficiency.",
          explanation_ru:
            "Идеальные нормативы предполагают совершенство: ни потерь, ни простоев, ни поломок, ни переделок. Они полезны для определения абсолютного потолка технически возможного, но обычно ДЕМОТИВИРУЮТ — работники их никогда не достигают. Большинство фирм используют достижимые нормативы — сложные, но реалистичные, с допуском на нормальный уровень неэффективности.",
        },
        // -------- Q3 — easy short_answer on variance type --------
        {
          type: "short_answer",
          difficulty: "easy",
          prompt_en:
            "A favourable variance arises when actual results are BETTER than standard. State whether each is favourable (F) or adverse (A): (a) actual material price < standard price, (b) actual labour hours > standard hours for output, (c) actual sales price > standard sales price.",
          prompt_ru:
            "Благоприятное отклонение возникает, когда фактический результат ЛУЧШЕ норматива. Укажите F (благоприятное) или A (неблагоприятное) для каждого: (а) фактическая цена материала < нормативной; (б) фактические часы труда > нормативных на выпуск; (в) фактическая цена продаж > нормативной.",
          correct_answer_en: "(a) F, (b) A, (c) F",
          correct_answer_ru: "(а) F, (б) A, (в) F",
          explanation_en:
            'Apply the rule "actual better than standard = favourable" consistently. (a) Paying LESS for material than budgeted is favourable on cost \u2014 F. (b) Taking MORE hours than the standard requires for the output achieved is adverse on labour efficiency \u2014 A. (c) Selling at a HIGHER price than budgeted is favourable on revenue \u2014 F. The direction sign trips up many students: "less" can be good (costs) or bad (revenue) depending on what is being measured.',
          explanation_ru:
            "Применяем правило «факт лучше норматива = благоприятно» последовательно. (а) Платить за материал МЕНЬШЕ запланированного — благоприятно по затратам — F. (б) Затрачивать БОЛЬШЕ часов, чем требует норматив на достигнутый выпуск, — неблагоприятно по эффективности труда — A. (в) Продавать по БОЛЕЕ высокой цене, чем запланировано, — благоприятно по выручке — F. Знак направления сбивает многих: «меньше» может быть хорошо (затраты) или плохо (выручка) в зависимости от того, что измеряем.",
        },
        // -------- Q4 — easy MCQ on standard cost card components --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "A standard cost card for one unit of product would NOT normally include:",
          prompt_ru:
            "Карточка нормативной себестоимости одной единицы продукта НЕ должна обычно включать:",
          options: [
            {
              key: "A",
              text_en: "Standard material quantity per unit",
              text_ru: "Нормативное количество материала на единицу",
              why_wrong_en:
                "Material quantity is a core component of the standard cost card.",
              why_wrong_ru:
                "Количество материала — ключевой компонент карточки нормативной себестоимости.",
            },
            {
              key: "B",
              text_en: "Standard labour hours per unit",
              text_ru: "Нормативные часы труда на единицу",
              why_wrong_en:
                "Labour hours per unit is essential to the standard cost card.",
              why_wrong_ru: "Часы труда на единицу — обязательный элемент.",
            },
            {
              key: "C",
              text_en: "Total actual production volume",
              text_ru: "Общий фактический объём производства",
            },
            {
              key: "D",
              text_en: "Standard overhead absorption rate",
              text_ru: "Нормативная ставка абсорбции накладных",
              why_wrong_en:
                "OAR per labour hour or machine hour is the standard overhead component on the card.",
              why_wrong_ru:
                "OAR на трудочас или машино-час — нормативная накладная составляющая в карточке.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "A standard cost card specifies the EXPECTED cost of ONE unit \u2014 it doesn't include actual production figures, which only exist after the period. The card lists standard inputs per unit: material quantity \u00d7 price, labour hours \u00d7 rate, overhead absorbed via standard hours \u00d7 OAR. Once the period ends and actual figures are known, variance analysis compares them to these standards.",
          explanation_ru:
            "Карточка нормативной себестоимости задаёт ОЖИДАЕМУЮ себестоимость ОДНОЙ единицы — фактические объёмы производства туда не входят, они появляются только после периода. Карточка содержит нормативные затраты на единицу: количество материала × цена, часы труда × тариф, абсорбированные накладные = нормативные часы × OAR. После окончания периода известные фактические цифры сравниваются с этими нормативами.",
        },
        // -------- Q5 — medium NUMBER_ENTRY on material price variance --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "Standard material price is $5 per kg. Actual price paid was $5.40 per kg. The company purchased 8,000 kg. Calculate the MATERIAL PRICE VARIANCE (enter favourable as positive, adverse as negative, in $).",
          prompt_ru:
            "Нормативная цена материала $5 за кг. Фактически уплаченная цена $5,40 за кг. Закуплено 8 000 кг. Рассчитайте ОТКЛОНЕНИЕ ПО ЦЕНЕ МАТЕРИАЛОВ (благоприятное — положительное, неблагоприятное — отрицательное, в $).",
          correct_answer_en: "-3200",
          acceptable_tolerance: 1,
          explanation_en:
            "Material price variance = (Standard Price \u2212 Actual Price) \u00d7 Actual Quantity = ($5 \u2212 $5.40) \u00d7 8,000 = (\u2212$0.40) \u00d7 8,000 = \u2212$3,200. Negative \u2192 ADVERSE: the firm paid more per kg than budgeted, costing $3,200 extra on the 8,000 kg purchased. Note we use the quantity PURCHASED (not used) for the price variance \u2014 the price decision applies to what was bought.",
          explanation_ru:
            "Отклонение по цене материалов = (Нормативная цена − Фактическая) × Фактическое количество = ($5 − $5,40) × 8 000 = (−$0,40) × 8 000 = −$3 200. Отрицательное → НЕБЛАГОПРИЯТНОЕ: фирма заплатила больше за кг, чем заложено в нормативе, что обошлось в $3 200 на 8 000 кг закупки. Внимание: используем количество ЗАКУПЛЕННОГО (а не использованного) материала — решение по цене относится к покупке.",
        },
        // -------- Q6 — medium NUMBER_ENTRY on material usage variance --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "Standard material usage is 2 kg per unit at $5/kg. Actual production was 3,500 units. Actual material used was 7,400 kg. Calculate the MATERIAL USAGE VARIANCE (favourable positive, adverse negative, in $).",
          prompt_ru:
            "Норматив расхода материала — 2 кг на единицу по $5/кг. Фактический выпуск — 3 500 единиц. Фактически использовано 7 400 кг. Рассчитайте ОТКЛОНЕНИЕ ПО ИСПОЛЬЗОВАНИЮ МАТЕРИАЛОВ (благоприятное — положительное, неблагоприятное — отрицательное, в $).",
          correct_answer_en: "-2000",
          acceptable_tolerance: 1,
          explanation_en:
            "Standard quantity for actual output = 3,500 units \u00d7 2 kg = 7,000 kg. Material usage variance = (Standard Qty for actual output \u2212 Actual Qty used) \u00d7 Standard Price = (7,000 \u2212 7,400) \u00d7 $5 = (\u2212400) \u00d7 $5 = \u2212$2,000. Negative \u2192 ADVERSE: 400 kg more than the standard required were used, costing $2,000 extra at standard price. Note we value the usage gap at STANDARD price (not actual), isolating the usage effect from the price effect.",
          explanation_ru:
            "Нормативное количество на фактический выпуск = 3 500 единиц × 2 кг = 7 000 кг. Отклонение по использованию = (Нормативное кол-во на факт выпуск − Фактическое кол-во) × Нормативная цена = (7 000 − 7 400) × $5 = (−400) × $5 = −$2 000. Отрицательное → НЕБЛАГОПРИЯТНОЕ: использовано на 400 кг больше норматива, что при нормативной цене стоит $2 000 дополнительно. Внимание: разница в количестве оценивается по НОРМАТИВНОЙ цене (не фактической), чтобы отделить эффект использования от эффекта цены.",
        },
        // -------- Q7 — medium NUMBER_ENTRY on labour rate variance --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "Standard labour rate is $12 per hour. Actual rate paid was $11.50 per hour. Actual hours worked: 4,200. Calculate the LABOUR RATE VARIANCE (favourable positive, adverse negative, in $).",
          prompt_ru:
            "Нормативная ставка труда $12 в час. Фактически уплаченная $11,50 в час. Фактически отработано 4 200 часов. Рассчитайте ОТКЛОНЕНИЕ ПО СТАВКЕ ТРУДА (благоприятное — положительное, неблагоприятное — отрицательное, в $).",
          correct_answer_en: "2100",
          acceptable_tolerance: 1,
          explanation_en:
            "Labour rate variance = (Standard Rate \u2212 Actual Rate) \u00d7 Actual Hours = ($12 \u2212 $11.50) \u00d7 4,200 = $0.50 \u00d7 4,200 = $2,100. Positive \u2192 FAVOURABLE: the firm paid $0.50 less per hour than standard, saving $2,100 on the 4,200 hours worked. This might be because the firm used lower-skilled (cheaper) workers \u2014 watch for an offsetting adverse labour efficiency variance.",
          explanation_ru:
            "Отклонение по ставке труда = (Нормативная ставка − Фактическая) × Фактические часы = ($12 − $11,50) × 4 200 = $0,50 × 4 200 = $2 100. Положительное → БЛАГОПРИЯТНОЕ: фирма платила на $0,50 меньше за час, чем по нормативу, сэкономив $2 100 на 4 200 часах. Возможная причина — использовалась менее квалифицированная (более дешёвая) рабочая сила; в этом случае ждите компенсирующего неблагоприятного отклонения по эффективности труда.",
        },
        // -------- Q8 — medium NUMBER_ENTRY on labour efficiency variance --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "Standard time is 0.5 hours per unit at $12/hour. Actual production was 8,000 units. Actual hours worked: 4,200. Calculate the LABOUR EFFICIENCY VARIANCE (favourable positive, adverse negative, in $).",
          prompt_ru:
            "Норматив времени — 0,5 часа на единицу по $12/час. Фактический выпуск 8 000 единиц. Фактически отработано 4 200 часов. Рассчитайте ОТКЛОНЕНИЕ ПО ЭФФЕКТИВНОСТИ ТРУДА (благоприятное — положительное, неблагоприятное — отрицательное, в $).",
          correct_answer_en: "-2400",
          acceptable_tolerance: 1,
          explanation_en:
            "Standard hours for actual output = 8,000 units \u00d7 0.5 h = 4,000 hours. Labour efficiency variance = (Standard Hours for actual output \u2212 Actual Hours) \u00d7 Standard Rate = (4,000 \u2212 4,200) \u00d7 $12 = (\u2212200) \u00d7 $12 = \u2212$2,400. Negative \u2192 ADVERSE: 200 more hours were worked than the standard allowed, costing $2,400 extra at standard rate. Combined with Q7's favourable rate variance, the firm got cheaper labour but used too much of it \u2014 a classic trade-off worth investigating.",
          explanation_ru:
            "Нормативные часы на факт выпуск = 8 000 единиц × 0,5 ч = 4 000 часов. Отклонение по эффективности = (Нормативные часы на факт выпуск − Фактические часы) × Нормативная ставка = (4 000 − 4 200) × $12 = (−200) × $12 = −$2 400. Отрицательное → НЕБЛАГОПРИЯТНОЕ: отработано на 200 часов больше норматива, что при нормативной ставке стоит $2 400. Вместе с благоприятным отклонением по ставке (Q7) это классический компромисс: труд дешевле, но потрачено больше; стоит расследовать.",
        },
        // -------- Q9 — medium MCQ on variance interpretation --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A company reports an adverse material PRICE variance and a favourable material USAGE variance in the same period. The MOST LIKELY underlying cause is:",
          prompt_ru:
            "Компания отражает неблагоприятное отклонение по ЦЕНЕ материалов и благоприятное по ИСПОЛЬЗОВАНИЮ в одном периоде. НАИБОЛЕЕ ВЕРОЯТНАЯ причина:",
          options: [
            {
              key: "A",
              text_en: "Workers were trained more thoroughly",
              text_ru: "Рабочие прошли более тщательное обучение",
              why_wrong_en:
                "Training affects LABOUR efficiency primarily; it doesn't explain why MATERIAL prices rose while usage improved.",
              why_wrong_ru:
                "Обучение влияет прежде всего на эффективность ТРУДА; оно не объясняет, почему цены на материал выросли, а расход улучшился.",
            },
            {
              key: "B",
              text_en:
                "A higher-quality (more expensive) material was purchased, reducing waste",
              text_ru:
                "Закуплен более качественный (более дорогой) материал, что снизило потери",
            },
            {
              key: "C",
              text_en: "The standards were set too low",
              text_ru: "Нормативы были занижены",
              why_wrong_en:
                "Low standards would produce ADVERSE variances on both price AND usage, not opposite directions.",
              why_wrong_ru:
                "Заниженные нормативы дали бы неблагоприятные отклонения И по цене, И по использованию, а не в разных направлениях.",
            },
            {
              key: "D",
              text_en: "Sales prices were increased",
              text_ru: "Цены продаж были повышены",
              why_wrong_en:
                "Sales price changes don't affect material price or usage variances; these are cost-side metrics.",
              why_wrong_ru:
                "Изменения цен продаж не влияют на отклонения по цене или использованию материалов; это метрики со стороны затрат.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Adverse price + favourable usage points to a quality-trade-off interpretation: a more expensive, higher-quality material was purchased; the higher cost shows as adverse PRICE variance, but the better quality means less waste/scrap/rework, showing as favourable USAGE variance. Variances often connect this way \u2014 examining them in pairs reveals the underlying operating story that no single number tells.",
          explanation_ru:
            "Неблагоприятная цена + благоприятное использование указывают на качественный компромисс: куплен более дорогой материал лучшего качества; высокая цена видна как неблагоприятная ЦЕНА, но лучшее качество означает меньше потерь/брака/переделок, что отражается как благоприятное ИСПОЛЬЗОВАНИЕ. Отклонения часто связаны попарно — рассмотрение в комплексе показывает операционную логику, которую одна цифра не передаёт.",
        },
        // -------- Q10 — medium NUMBER_ENTRY on fixed OH expenditure variance --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "Budgeted fixed overhead is $80,000. Actual fixed overhead incurred was $86,000. Calculate the FIXED OVERHEAD EXPENDITURE VARIANCE (favourable positive, adverse negative, in $).",
          prompt_ru:
            "Бюджетные постоянные накладные — $80 000. Фактические — $86 000. Рассчитайте ОТКЛОНЕНИЕ ПО РАСХОДОВАНИЮ ПОСТОЯННЫХ НАКЛАДНЫХ (благоприятное — положительное, неблагоприятное — отрицательное, в $).",
          correct_answer_en: "-6000",
          acceptable_tolerance: 1,
          explanation_en:
            "Fixed overhead expenditure variance = Budgeted Fixed Overhead \u2212 Actual Fixed Overhead = 80,000 \u2212 86,000 = \u2212$6,000. Negative \u2192 ADVERSE: actual spending exceeded budget by $6,000. This variance is about CONTROL of fixed costs; it doesn't depend on activity levels (unlike the fixed overhead volume variance which does).",
          explanation_ru:
            "Отклонение по расходованию постоянных накладных = Бюджет − Факт = 80 000 − 86 000 = −$6 000. Отрицательное → НЕБЛАГОПРИЯТНОЕ: фактический расход превысил бюджет на $6 000. Это отклонение характеризует КОНТРОЛЬ постоянных затрат и не зависит от уровня активности (в отличие от отклонения по объёму, которое от него зависит).",
        },
        // -------- Q11 — medium MCQ on sales volume variance basis --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "Under MARGINAL costing, the sales volume variance is valued at:",
          prompt_ru:
            "При МАРЖИНАЛЬНОМ учёте отклонение по объёму продаж оценивается по:",
          options: [
            {
              key: "A",
              text_en: "Standard selling price per unit",
              text_ru: "Нормативной цене продаж за единицу",
              why_wrong_en:
                "Selling price reflects revenue, not the profit lost/gained from volume changes; cost effects matter too.",
              why_wrong_ru:
                "Цена продаж отражает выручку, а не прибыль, теряемую или получаемую при изменении объёма; важны и затраты.",
            },
            {
              key: "B",
              text_en:
                "Standard contribution per unit (selling price \u2212 variable cost)",
              text_ru:
                "Нормативному маржинальному доходу на единицу (цена − переменные затраты)",
            },
            {
              key: "C",
              text_en:
                "Standard profit per unit (selling price \u2212 full cost including fixed OH)",
              text_ru:
                "Нормативной прибыли на единицу (цена − полная себестоимость включая постоянные накладные)",
              why_wrong_en:
                "Standard PROFIT is used under ABSORPTION costing; marginal costing uses CONTRIBUTION because fixed costs don't change with volume.",
              why_wrong_ru:
                "Нормативная ПРИБЫЛЬ используется при АБСОРБЦИОННОМ учёте; маржинальный использует МАРЖИНАЛЬНЫЙ ДОХОД, так как постоянные затраты с объёмом не меняются.",
            },
            {
              key: "D",
              text_en: "Actual contribution per unit",
              text_ru: "Фактическому маржинальному доходу на единицу",
              why_wrong_en:
                "Variance analysis uses STANDARD values for the cost dimension; actual figures would mix volume and price/cost effects together.",
              why_wrong_ru:
                "Анализ отклонений по стороне затрат использует НОРМАТИВНЫЕ величины; фактические смешали бы эффекты объёма и цены/затрат.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Under marginal costing, fixed costs are treated as period costs that don't change with volume. The financial impact of selling one extra (or fewer) unit is therefore the CONTRIBUTION it generates \u2014 selling price minus variable cost per unit. Under absorption costing, fixed costs ARE absorbed into units, so volume changes also affect fixed cost absorption, and the variance is valued at standard PROFIT (which includes a fixed-cost share). This is a frequent exam trap: same scenario, different answer depending on costing system.",
          explanation_ru:
            "При маржинальном учёте постоянные затраты рассматриваются как затраты периода, не меняющиеся с объёмом. Финансовый эффект от продажи лишней (или недопроданной) единицы — это МАРЖИНАЛЬНЫЙ ДОХОД, который она приносит: цена минус переменные затраты на единицу. При абсорбционном учёте постоянные затраты абсорбируются в единицы, поэтому объём затрагивает и абсорбцию постоянных накладных, и отклонение оценивается по нормативной ПРИБЫЛИ (с учётом доли постоянных). Это частая ловушка экзамена: одинаковый сценарий, разный ответ в зависимости от системы учёта.",
        },
        // -------- Q12 — medium short_answer on variance formula direction --------
        {
          type: "short_answer",
          difficulty: "medium",
          prompt_en:
            "Why is the material price variance calculated using the QUANTITY PURCHASED, while the material usage variance uses the QUANTITY USED for actual output?",
          prompt_ru:
            "Почему отклонение по цене материалов считается на ЗАКУПЛЕННОМ количестве, а отклонение по использованию — на использованном для фактического выпуска?",
          correct_answer_en:
            "The price decision is made at the point of purchase, so it applies to all units bought; the usage decision is made in production, so it applies to what was actually consumed in making the output.",
          correct_answer_ru:
            "Решение о цене принимается в момент закупки и относится ко всему купленному; решение об использовании принимается в производстве и относится к фактически потреблённому при выпуске.",
          explanation_en:
            "Separating where each decision is made gives clean responsibility allocation. Purchasing manager: responsible for price, judged on price variance against quantity bought (whether it's used immediately or stocked). Production manager: responsible for using materials efficiently, judged on usage variance for what was actually consumed. This separation prevents purchasing from being penalised when production wastes, and prevents production from being penalised for purchasing's overpaying. Some texts use a \"stocks-at-actual-cost\" approach where the price variance uses quantity USED; both approaches exist, but ACCA's default is quantity PURCHASED.",
          explanation_ru:
            "Разделение по месту принятия решения даёт чёткое распределение ответственности. Менеджер по закупкам: отвечает за цену, оценивается по отклонению цены на купленное количество (независимо от того, использовано оно или в запасе). Производственный менеджер: отвечает за эффективное использование, оценивается по отклонению использования на фактически потреблённое для выпуска. Такое разделение защищает закупки от наказания за производственные потери и производство — за переплату со стороны закупок. В некоторых учебниках используется подход «запасы по фактической себестоимости», где отклонение по цене считают на использованном количестве; оба подхода существуют, но по умолчанию в ACCA — закупленное количество.",
        },
        // -------- Q13 — medium MCQ on flexed budget for variance --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "For variance analysis to be MEANINGFUL, actual costs must be compared against:",
          prompt_ru:
            "Чтобы анализ отклонений был ОСМЫСЛЕННЫМ, фактические затраты должны сравниваться с:",
          options: [
            {
              key: "A",
              text_en:
                "The original fixed budget regardless of actual activity",
              text_ru:
                "Исходным фиксированным бюджетом независимо от фактической активности",
              why_wrong_en:
                "Comparing against the original fixed budget mixes a (real) cost-control issue with a (separate) volume issue; the flexed budget separates them.",
              why_wrong_ru:
                "Сравнение с исходным фиксированным бюджетом смешивает (реальный) контроль затрат с (отдельным) вопросом объёма; гибкий бюджет их разделяет.",
            },
            {
              key: "B",
              text_en:
                "A flexed budget restated for actual activity, at standard cost",
              text_ru:
                "Гибким бюджетом, пересчитанным на фактическую активность, по нормативной себестоимости",
            },
            {
              key: "C",
              text_en: "Last year\u2019s actual results",
              text_ru: "Фактическими результатами прошлого года",
              why_wrong_en:
                "Prior-year results don't isolate efficiency, price, and volume effects; they reflect different past conditions, not what costs SHOULD be now.",
              why_wrong_ru:
                "Прошлогодние факты не разделяют эффекты эффективности, цены и объёма; они отражают иные прошлые условия, а не то, какими затраты ДОЛЖНЫ быть сейчас.",
            },
            {
              key: "D",
              text_en: "Industry average costs",
              text_ru: "Средними отраслевыми затратами",
              why_wrong_en:
                "Industry benchmarks are useful for strategic comparison but don't give a year-on-year management control yardstick the way standards do.",
              why_wrong_ru:
                "Отраслевые ориентиры полезны для стратегического сравнения, но не дают эталона управленческого контроля по периодам, как нормативы.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "The cornerstone of variance analysis is the flexed budget. Total variance from original budget = (volume effect) + (price/efficiency effects). The volume effect is the SALES volume variance \u2014 separating it out leaves the cost variances clean. To compute cost variances, you flex the budget to actual activity at standard cost; then compare to actual costs at actual activity. The difference is the price, usage, rate, and efficiency variances combined.",
          explanation_ru:
            "Краеугольный камень анализа отклонений — гибкий бюджет. Общее отклонение от исходного бюджета = (эффект объёма) + (эффекты цены/эффективности). Эффект объёма — это отклонение по объёму ПРОДАЖ; выделение его очищает отклонения по затратам. Для расчёта отклонений по затратам бюджет пересчитывают на фактическую активность по нормативной себестоимости, затем сравнивают с фактическими затратами при фактической активности. Разница — совокупное отклонение по цене, использованию, ставке и эффективности.",
        },
        // -------- Q14 — hard NUMBER_ENTRY on profit reconciliation --------
        {
          type: "number_entry",
          difficulty: "hard",
          prompt_en:
            "Budgeted profit is $50,000. During the period: favourable material price variance $1,500; adverse material usage variance $2,000; favourable labour rate variance $800; adverse labour efficiency variance $1,200; favourable sales volume variance $3,000; adverse fixed overhead expenditure variance $600. Calculate the ACTUAL PROFIT (in $).",
          prompt_ru:
            "Бюджетная прибыль $50 000. За период: благоприятное отклонение по цене материалов $1 500; неблагоприятное по использованию материалов $2 000; благоприятное по ставке труда $800; неблагоприятное по эффективности труда $1 200; благоприятное по объёму продаж $3 000; неблагоприятное по расходованию постоянных накладных $600. Рассчитайте ФАКТИЧЕСКУЮ прибыль (в $).",
          correct_answer_en: "51500",
          acceptable_tolerance: 1,
          explanation_en:
            'Reconciliation: Budgeted profit + favourable variances \u2212 adverse variances = actual profit. Favourable total: 1,500 + 800 + 3,000 = 5,300. Adverse total: 2,000 + 1,200 + 600 = 3,800. Net = 5,300 \u2212 3,800 = +1,500. Actual profit = 50,000 + 1,500 = $51,500. The operating statement format presents this systematically: start with budget, list each variance with sign, end with actual. This is how the variances "explain" the gap between planned and actual outcomes.',
          explanation_ru:
            "Сверка: Бюджетная прибыль + благоприятные − неблагоприятные = фактическая прибыль. Сумма благоприятных: 1 500 + 800 + 3 000 = 5 300. Сумма неблагоприятных: 2 000 + 1 200 + 600 = 3 800. Нетто = 5 300 − 3 800 = +1 500. Фактическая прибыль = 50 000 + 1 500 = $51 500. Операционный отчёт оформляет это последовательно: от бюджета через перечень отклонений со знаками — к факту. Так отклонения «объясняют» разрыв между планом и реальностью.",
        },
        // -------- Q15 — hard MCQ on integrated variance scenario --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            "Variance investigation should focus on variances that are:",
          prompt_ru:
            "Расследование отклонений должно фокусироваться на отклонениях, которые:",
          options: [
            {
              key: "A",
              text_en:
                "Adverse only \u2014 favourable variances need no investigation",
              text_ru:
                "Только неблагоприятные — благоприятные не требуют расследования",
              why_wrong_en:
                "A LARGE favourable variance can hide problems too: standards too loose, quality reductions saving cost short-term but creating issues later, or even fraud. Both directions deserve scrutiny when material.",
              why_wrong_ru:
                "Крупное БЛАГОПРИЯТНОЕ отклонение тоже может скрывать проблемы: слабые нормативы, экономия на качестве со скрытыми последствиями или даже мошенничество. Оба направления заслуживают внимания при существенности.",
            },
            {
              key: "B",
              text_en:
                "Material in size, persistent in direction, or controllable",
              text_ru:
                "Существенные по размеру, устойчивые по направлению или контролируемые",
            },
            {
              key: "C",
              text_en:
                "Above a fixed threshold like $100 regardless of context",
              text_ru:
                "Выше фиксированного порога вроде $100 независимо от контекста",
              why_wrong_en:
                "A single dollar threshold ignores scale: $100 might be massive for one cost line and trivial for another. Materiality should be context-relative.",
              why_wrong_ru:
                "Один фиксированный долларовый порог игнорирует масштаб: $100 могут быть огромными для одной статьи и пустяком для другой. Существенность должна быть относительной к контексту.",
            },
            {
              key: "D",
              text_en: "Every variance, however small",
              text_ru: "Каждое, каким бы малым ни было",
              why_wrong_en:
                "Investigating every variance is uneconomic; the cost of investigation often exceeds its benefit for tiny variances. The cost-benefit principle applies.",
              why_wrong_ru:
                "Расследование каждого отклонения нерентабельно; стоимость расследования часто превышает выгоду для мельчайших. Действует принцип «затраты-выгоды».",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Three criteria for investigation: SIZE (material variances justify the cost of investigation; tiny ones don't), PERSISTENCE (a recurring small adverse variance may signal a systemic problem worse than a single large one), and CONTROLLABILITY (investigate what management can fix; market-price swings outside management's control may not warrant action). Many firms set tolerance thresholds (e.g. > 5% or > $1,000) but adjust for the three criteria together. Critically, investigation isn't limited to adverse: large favourable variances can also signal that standards are stale, quality has been compromised, or something else is off.",
          explanation_ru:
            "Три критерия для расследования: РАЗМЕР (существенные отклонения оправдывают стоимость расследования, мелкие — нет), УСТОЙЧИВОСТЬ (повторяющееся малое неблагоприятное отклонение может сигнализировать о системной проблеме, более серьёзной, чем единичное крупное), и КОНТРОЛИРУЕМОСТЬ (расследовать то, что руководство может исправить; колебания рыночных цен вне контроля могут не требовать действий). Многие фирмы устанавливают пороги допуска (например, > 5% или > $1 000), но корректируют их по совокупности трёх критериев. Важно: расследование не ограничивается неблагоприятными — крупные благоприятные тоже могут сигнализировать об устаревших нормативах, ухудшении качества или иных проблемах.",
        },
      ],
    },

    // ---------- F ----------
    {
      code: "F",
      title_en: "Performance measurement",
      title_ru: "Оценка эффективности",
      description_en:
        "Financial and non-financial measures, balanced scorecard, the three Es, and service/NFP performance.",
      description_ru:
        "Финансовые и нефинансовые показатели, сбалансированная система показателей, три «Э», эффективность в сервисе и некоммерческом секторе.",
      sort_order: 60,
      theory_en:
        "Performance measurement turns strategy into numbers managers can act on. Mission statements set ultimate purpose; strategic, tactical, and operational objectives cascade from them down to daily activity. Critical Success Factors (CSFs) are the few things an organisation must get right; Key Performance Indicators (KPIs) are the measures that track them.\n\n" +
        "Financial measures address profitability (gross margin, operating margin, ROCE = Operating Profit / Capital Employed, ROI), liquidity (current ratio = current assets / current liabilities; quick or acid-test ratio excludes inventory), efficiency (inventory days, receivables days, payables days, asset turnover), and gearing (debt / equity, interest cover = operating profit / finance cost). Each ratio is compared against prior period, budget, or industry benchmark to be meaningful.\n\n" +
        "Return on Investment (ROI) = profit / investment; Residual Income (RI) = profit \u2212 (cost of capital \u00d7 investment). RI is an absolute figure that avoids the ROI weakness of rejecting NPV-positive projects with returns below current divisional ROI. Both can encourage short-termism.\n\n" +
        "Non-financial performance measures matter because financial ones lag. The Balanced Scorecard (Kaplan & Norton) views the business through four linked perspectives: financial (how do we look to shareholders?), customer (how do customers see us?), internal business process (what must we excel at?), and learning and growth / innovation (how do we continue to improve?). Each gets its own measures.\n\n" +
        "Public sector and not-for-profit performance is assessed by the three Es \u2014 value for money: Economy (inputs at lowest cost), Efficiency (output per unit of input), Effectiveness (achievement of intended outcome). Service industries face measurement challenges from intangibility, heterogeneity, simultaneity (production and consumption at once), and perishability. Total Quality Management (TQM) and benchmarking against competitors or best-in-class operations are common improvement tools.",
      theory_ru:
        "Оценка эффективности переводит стратегию в показатели, на которые менеджеры могут реагировать. Миссия задаёт конечное предназначение; стратегические, тактические и операционные цели каскадируются от неё до повседневной деятельности. Критические факторы успеха (CSF) — это немногие вещи, которые организация обязана делать правильно; ключевые показатели эффективности (KPI) — это метрики, которые их отслеживают.\n\n" +
        "Финансовые показатели охватывают рентабельность (валовая маржа, операционная маржа, ROCE = операционная прибыль / задействованный капитал, ROI), ликвидность (коэффициент текущей ликвидности = оборотные активы / краткосрочные обязательства; быстрая ликвидность исключает запасы), эффективность (оборачиваемость запасов в днях, дебиторской и кредиторской задолженности в днях, оборачиваемость активов) и финансовый рычаг (долг / собственный капитал, покрытие процентов = операционная прибыль / финансовые расходы). Любой коэффициент имеет смысл только в сравнении с прошлым периодом, бюджетом или отраслевым ориентиром.\n\n" +
        "Доходность инвестиций (ROI) = прибыль / инвестиции; остаточный доход (RI) = прибыль − (стоимость капитала × инвестиции). RI — абсолютный показатель, обходящий недостаток ROI: ROI заставляет отвергать проекты с положительной NPV, если их доходность ниже текущего ROI подразделения. Оба показателя могут провоцировать краткосрочное мышление.\n\n" +
        "Нефинансовые показатели важны, потому что финансовые — запаздывающие. Сбалансированная система показателей Каплана и Нортона рассматривает бизнес через четыре связанные перспективы: финансовая (как нас видят акционеры?), клиентская (как нас видят клиенты?), внутренние бизнес-процессы (в чём мы должны быть превосходны?), обучение и рост / инновации (как мы продолжаем улучшаться?). Каждая получает собственный набор метрик.\n\n" +
        "Эффективность в государственном секторе и некоммерческих организациях оценивается через три «Э» — ценность за деньги: Economy (экономность — затраты по минимальной цене), Efficiency (производительность — выпуск на единицу затрат), Effectiveness (результативность — достижение намеченного результата). Сфера услуг сталкивается с измерительными трудностями из-за неосязаемости, неоднородности, одновременности производства и потребления, и невозможности хранения. Всеобщее управление качеством (TQM) и бенчмаркинг против конкурентов или лидеров отрасли — распространённые инструменты улучшения.",
      questions: [
        // -------- Q1 — easy MCQ on ROCE definition --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en: "Return on Capital Employed (ROCE) is calculated as:",
          prompt_ru:
            "Рентабельность задействованного капитала (ROCE) рассчитывается как:",
          options: [
            {
              key: "A",
              text_en: "Net profit / Sales \u00d7 100",
              text_ru: "Чистая прибыль / Выручка × 100",
              why_wrong_en: "That ratio is NET PROFIT MARGIN, not ROCE.",
              why_wrong_ru: "Это коэффициент ЧИСТОЙ МАРЖИ, а не ROCE.",
            },
            {
              key: "B",
              text_en: "Operating profit / Capital employed \u00d7 100",
              text_ru: "Операционная прибыль / Задействованный капитал × 100",
            },
            {
              key: "C",
              text_en: "Sales / Total assets",
              text_ru: "Выручка / Активы итого",
              why_wrong_en:
                "That is ASSET TURNOVER, an efficiency ratio, not a profitability ratio.",
              why_wrong_ru:
                "Это ОБОРАЧИВАЕМОСТЬ АКТИВОВ, коэффициент эффективности, не рентабельности.",
            },
            {
              key: "D",
              text_en: "Gross profit / Cost of sales",
              text_ru: "Валовая прибыль / Себестоимость",
              why_wrong_en:
                "A non-standard mash-up; the proper gross margin is gross profit / sales \u00d7 100.",
              why_wrong_ru:
                "Нестандартное смешение; правильная валовая маржа = валовая прибыль / выручка × 100.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "ROCE = Operating Profit / Capital Employed \u00d7 100, where Capital Employed = Equity + Non-current Liabilities (= Total Assets \u2212 Current Liabilities). It measures how efficiently the firm uses its long-term funding to generate operating returns. ROCE is the headline measure of management performance because it links profitability with the capital base. A firm with high margins but low ROCE may be using too much capital; high ROCE shows capital-efficient operations.",
          explanation_ru:
            "ROCE = Операционная прибыль / Задействованный капитал × 100, где задействованный капитал = Капитал + Долгосрочные обязательства (= Активы итого − Краткосрочные обязательства). Показывает, насколько эффективно фирма использует долгосрочное финансирование для генерации операционной прибыли. ROCE — заглавная метрика управленческой эффективности, так как связывает рентабельность с базой капитала. Фирма с высокой маржой и низким ROCE использует слишком много капитала; высокий ROCE — признак капитал-эффективной работы.",
        },
        // -------- Q2 — easy MCQ on three Es --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en: 'In public sector performance, "Effectiveness" refers to:',
          prompt_ru:
            "В оценке эффективности в государственном секторе «результативность» означает:",
          options: [
            {
              key: "A",
              text_en: "Buying inputs at the lowest cost",
              text_ru: "Покупку ресурсов по минимальной цене",
              why_wrong_en: "That is ECONOMY (the first E), about input cost.",
              why_wrong_ru:
                "Это ЭКОНОМНОСТЬ (первая «Э»), про стоимость ресурсов.",
            },
            {
              key: "B",
              text_en: "Producing more output per unit of input",
              text_ru: "Производство большего выпуска на единицу ресурса",
              why_wrong_en:
                "That is EFFICIENCY (the second E), about the ratio of output to input.",
              why_wrong_ru:
                "Это ПРОИЗВОДИТЕЛЬНОСТЬ (вторая «Э»), про отношение выпуска к ресурсу.",
            },
            {
              key: "C",
              text_en: "Achieving the intended outcome or policy goal",
              text_ru: "Достижение намеченного результата или цели политики",
            },
            {
              key: "D",
              text_en: "Maximising shareholder return",
              text_ru: "Максимизацию доходности для акционеров",
              why_wrong_en:
                "Public sector entities don't have shareholders; the three Es framework is specifically designed for the absence of profit motive.",
              why_wrong_ru:
                "У госсектора нет акционеров; рамка трёх «Э» именно для случая, когда мотив прибыли отсутствует.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "The three Es: ECONOMY \u2014 obtaining the right inputs at the lowest cost (input side). EFFICIENCY \u2014 producing the most output per unit of input (input \u2192 output process). EFFECTIVENESS \u2014 actually achieving the intended outcome or social goal (output \u2192 outcome). A hospital that runs cheaply (economy), processes many patients per nurse (efficiency), but doesn't actually improve health outcomes is failing on effectiveness. Real value-for-money requires all three.",
          explanation_ru:
            "Три «Э»: ЭКОНОМНОСТЬ — приобретение нужных ресурсов по минимальной цене (вход). ПРОИЗВОДИТЕЛЬНОСТЬ — максимум выпуска на единицу ресурса (преобразование). РЕЗУЛЬТАТИВНОСТЬ — реальное достижение намеченного результата или социальной цели (выход → результат). Больница, работающая дёшево (экономность), пропускающая много пациентов на медсестру (производительность), но не улучшающая здоровье — провал по результативности. Настоящая ценность за деньги требует всех трёх.",
        },
        // -------- Q3 — easy short_answer on balanced scorecard --------
        {
          type: "short_answer",
          difficulty: "easy",
          prompt_en:
            "Name the FOUR perspectives of Kaplan and Norton\u2019s Balanced Scorecard.",
          prompt_ru:
            "Назовите ЧЕТЫРЕ перспективы сбалансированной системы показателей Каплана и Нортона.",
          correct_answer_en:
            "Financial, customer, internal business process, learning and growth (or innovation)",
          correct_answer_ru:
            "Финансовая, клиентская, внутренние бизнес-процессы, обучение и рост (или инновации)",
          explanation_en:
            "Kaplan and Norton built the scorecard to balance lagging financial measures with leading non-financial drivers. FINANCIAL (how do we look to shareholders?) measures revenue growth, profitability, ROCE. CUSTOMER (how do customers see us?) tracks satisfaction, retention, market share. INTERNAL PROCESS (what must we excel at?) covers cycle time, quality, productivity. LEARNING & GROWTH (how do we keep improving?) covers employee development, information systems, innovation. The four are causally linked: investing in learning improves processes, which delights customers, which produces financial results.",
          explanation_ru:
            "Каплан и Нортон построили карту для баланса запаздывающих финансовых показателей и опережающих нефинансовых драйверов. ФИНАНСОВАЯ (как нас видят акционеры?) — рост выручки, рентабельность, ROCE. КЛИЕНТСКАЯ (как нас видят клиенты?) — удовлетворённость, удержание, доля рынка. ВНУТРЕННИЕ ПРОЦЕССЫ (в чём мы должны быть превосходны?) — длительность цикла, качество, производительность. ОБУЧЕНИЕ И РОСТ (как продолжаем улучшаться?) — развитие сотрудников, информационные системы, инновации. Четыре перспективы причинно связаны: инвестиции в обучение улучшают процессы, что радует клиентов, что даёт финансовый результат.",
        },
        // -------- Q4 — easy MCQ on quick ratio --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "The QUICK ratio (acid test) differs from the CURRENT ratio in that the quick ratio:",
          prompt_ru:
            "Коэффициент БЫСТРОЙ ликвидности отличается от коэффициента ТЕКУЩЕЙ ликвидности тем, что быстрая ликвидность:",
          options: [
            {
              key: "A",
              text_en: "Excludes inventory from current assets",
              text_ru: "Исключает запасы из оборотных активов",
            },
            {
              key: "B",
              text_en: "Includes only cash",
              text_ru: "Включает только денежные средства",
              why_wrong_en:
                "That would be the CASH ratio, which is even stricter; quick ratio includes cash, receivables, and short-term investments \u2014 just not inventory.",
              why_wrong_ru:
                "Это коэффициент ДЕНЕЖНОЙ ликвидности, ещё строже; быстрая включает деньги, дебиторку и краткосрочные инвестиции — только без запасов.",
            },
            {
              key: "C",
              text_en: "Includes non-current assets",
              text_ru: "Включает внеоборотные активы",
              why_wrong_en:
                "Both ratios use only current items; non-current assets are excluded from both.",
              why_wrong_ru:
                "Оба коэффициента используют только оборотные статьи; внеоборотные исключены из обоих.",
            },
            {
              key: "D",
              text_en: "Is measured against non-current liabilities",
              text_ru: "Измеряется против долгосрочных обязательств",
              why_wrong_en:
                "Both ratios measure against CURRENT liabilities; the difference is in the numerator (which current assets), not the denominator.",
              why_wrong_ru:
                "Оба коэффициента сопоставляются с КРАТКОСРОЧНЫМИ обязательствами; различие в числителе (какие оборотные активы), а не в знаменателе.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Current ratio = Current Assets / Current Liabilities. Quick ratio = (Current Assets \u2212 Inventory) / Current Liabilities. The quick ratio excludes inventory because inventory may take time to convert to cash (or be unsellable at all). It tests whether the firm could meet short-term obligations if it couldn't sell its stock. Useful benchmarks: current ratio around 1.5\u20132 and quick ratio around 1 are typical for manufacturing; service firms with no inventory naturally have current and quick ratios that are nearly identical.",
          explanation_ru:
            "Текущая ликвидность = Оборотные активы / Краткосрочные обязательства. Быстрая ликвидность = (Оборотные активы − Запасы) / Краткосрочные обязательства. Быстрая исключает запасы, потому что им нужно время для конвертации в деньги (или они вообще могут оказаться непродаваемыми). Это проверка, сможет ли фирма выполнить краткосрочные обязательства, не распродавая запас. Ориентиры: текущая 1,5–2 и быстрая около 1 — обычные значения для производства; у сервисных фирм без запасов оба коэффициента почти совпадают.",
        },
        // -------- Q5 — medium NUMBER_ENTRY on ROCE --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "Operating profit is $120,000. Total assets are $800,000. Current liabilities are $200,000. Calculate ROCE as a percentage (to 1 decimal place).",
          prompt_ru:
            "Операционная прибыль $120 000. Активы итого $800 000. Краткосрочные обязательства $200 000. Рассчитайте ROCE в процентах (с точностью до 1 знака).",
          correct_answer_en: "20",
          acceptable_tolerance: 0.1,
          explanation_en:
            "Capital Employed = Total Assets \u2212 Current Liabilities = 800,000 \u2212 200,000 = $600,000. (Equivalent: Equity + Non-current Liabilities = $600,000.) ROCE = Operating Profit / Capital Employed \u00d7 100 = 120,000 / 600,000 \u00d7 100 = 20.0%. Capital employed represents the long-term funding the firm uses; current liabilities are excluded because they are short-term obligations rather than committed capital.",
          explanation_ru:
            "Задействованный капитал = Активы итого − Краткосрочные обязательства = 800 000 − 200 000 = $600 000. (Эквивалентно: Капитал + Долгосрочные обязательства = $600 000.) ROCE = Операционная прибыль / Задействованный капитал × 100 = 120 000 / 600 000 × 100 = 20,0%. Задействованный капитал — долгосрочное финансирование фирмы; краткосрочные обязательства исключены, так как это короткие обязательства, а не привязанный капитал.",
        },
        // -------- Q6 — medium NUMBER_ENTRY on receivables days --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "Annual credit sales were $1,825,000. Closing trade receivables are $250,000. Calculate the RECEIVABLES COLLECTION PERIOD in days (assume 365-day year, round to whole days).",
          prompt_ru:
            "Годовые продажи в кредит $1 825 000. Конечная дебиторская задолженность $250 000. Рассчитайте СРОК ИНКАССАЦИИ ДЕБИТОРСКОЙ ЗАДОЛЖЕННОСТИ в днях (365-дневный год, округлите до целых дней).",
          correct_answer_en: "50",
          acceptable_tolerance: 1,
          explanation_en:
            'Receivables days = (Receivables / Credit Sales) \u00d7 365 = (250,000 / 1,825,000) \u00d7 365 = 0.1370 \u00d7 365 = 50.0 days. Interpretation: on average customers take 50 days to pay. Compare to credit terms offered (e.g. "30 days net") \u2014 a 50-day collection on 30-day terms means slow payment, possibly indicating weak credit control or customers in financial distress. Comparable measures: inventory days (how long stock sits) and payables days (how long the firm takes to pay suppliers).',
          explanation_ru:
            "Срок инкассации = (Дебиторка / Продажи в кредит) × 365 = (250 000 / 1 825 000) × 365 = 0,1370 × 365 = 50,0 дней. Интерпретация: в среднем клиенты платят 50 дней. Сравните с условиями кредита (например, «30 дней нетто») — 50 дней при 30-дневных условиях означают медленные платежи, возможно слабый кредитный контроль или клиентов в финансовых затруднениях. Сравнимые показатели: оборачиваемость запасов в днях и оборачиваемость кредиторки в днях.",
        },
        // -------- Q7 — medium NUMBER_ENTRY on gearing --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "Equity is $400,000. Long-term debt is $100,000. Calculate GEARING expressed as Debt/(Debt+Equity) as a percentage (to 1 decimal place).",
          prompt_ru:
            "Капитал $400 000. Долгосрочный долг $100 000. Рассчитайте КОЭФФИЦИЕНТ ФИНАНСОВОГО РЫЧАГА = Долг / (Долг + Капитал) в процентах (с точностью до 1 знака).",
          correct_answer_en: "20",
          acceptable_tolerance: 0.1,
          explanation_en:
            "Gearing = Debt / (Debt + Equity) \u00d7 100 = 100,000 / (100,000 + 400,000) \u00d7 100 = 100,000 / 500,000 \u00d7 100 = 20.0%. Note there are TWO common gearing definitions: this one (Debt/(Debt+Equity)) gives a value 0\u2013100%, and the alternative (Debt/Equity) which can exceed 100% \u2014 here it would be 100,000/400,000 = 25%. Always check which the question requires. Higher gearing means more financial risk but also potentially higher return to equity (through leverage).",
          explanation_ru:
            "Финансовый рычаг = Долг / (Долг + Капитал) × 100 = 100 000 / (100 000 + 400 000) × 100 = 100 000 / 500 000 × 100 = 20,0%. Внимание: есть ДВА распространённых определения рычага: данное (Долг/(Долг+Капитал)) даёт значение 0–100%, и альтернативное (Долг/Капитал), которое может превышать 100% — здесь было бы 100 000/400 000 = 25%. Всегда проверяйте, какое требуется в вопросе. Более высокий рычаг — больше финансового риска, но потенциально и большая доходность капитала (через плечо).",
        },
        // -------- Q8 — medium MCQ on ROI vs RI --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A division has current ROI of 25%. The company\u2019s cost of capital is 12%. A new investment available to the division yields 20%. Under ROI-based performance evaluation, the divisional manager is LIKELY to:",
          prompt_ru:
            "У подразделения текущий ROI 25%. Стоимость капитала компании 12%. Доступная инвестиция даст 20%. При оценке эффективности по ROI руководитель подразделения, ВЕРОЯТНО:",
          options: [
            {
              key: "A",
              text_en:
                "Accept the investment because 20% > 12% cost of capital",
              text_ru:
                "Примет инвестицию, поскольку 20% > 12% стоимости капитала",
              why_wrong_en:
                "That's what the FIRM should want (positive NPV), but ROI-driven managers behave differently: accepting 20% would LOWER divisional ROI from 25%, so they reject.",
              why_wrong_ru:
                "Так должна была бы поступить ФИРМА (положительная NPV), но при оценке по ROI менеджеры действуют иначе: принятие 20% СНИЗИТ их ROI с 25%, поэтому отвергают.",
            },
            {
              key: "B",
              text_en:
                "Reject the investment because it would lower the division\u2019s reported ROI from 25%",
              text_ru:
                "Отвергнет инвестицию, так как она снизит ROI подразделения с 25%",
            },
            {
              key: "C",
              text_en: "Be indifferent",
              text_ru: "Будет безразличен",
              why_wrong_en:
                "Indifference would require ROI metric to be neutral; in fact ROI-driven managers have a clear preference to reject value-adding projects that lower their reported ratio.",
              why_wrong_ru:
                "Безразличие требовало бы нейтральности метрики ROI; на деле руководители, ориентированные на ROI, имеют чёткое предпочтение отвергать добавляющие стоимость проекты, снижающие отчётный коэффициент.",
            },
            {
              key: "D",
              text_en: "Be required to accept because ROI is rising",
              text_ru: "Обязан принять, поскольку ROI растёт",
              why_wrong_en:
                "ROI is NOT rising \u2014 a 20% return added to a 25% base lowers the weighted average. Direction is wrong.",
              why_wrong_ru:
                "ROI НЕ растёт — 20%-доходность, добавленная к 25%-базе, снижает средневзвешенную. Направление неверное.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "This is the classic ROI dysfunctional behaviour. The investment's 20% return EXCEEDS the company's 12% cost of capital \u2014 it has positive NPV and should be accepted from the firm's perspective. But because the division's current ROI is 25%, adding a 20% project DROPS the division's overall ROI below 25%, making the manager look worse on the metric they're measured by. Result: the manager rejects a value-adding investment. Residual Income (RI) avoids this trap: RI = profit \u2212 (cost of capital \u00d7 investment) = if the project earns more than 12% on the capital used, RI rises, and the manager accepts.",
          explanation_ru:
            "Классический пример дисфункции ROI. Доходность инвестиции 20% ПРЕВЫШАЕТ стоимость капитала фирмы 12% — у проекта положительная NPV и его стоит принять с точки зрения фирмы. Но текущий ROI подразделения 25%, и добавление 20%-проекта СНИЖАЕТ общий ROI ниже 25%, и руководитель выглядит хуже по показателю, по которому его оценивают. Результат: руководитель отвергает добавляющую стоимость инвестицию. Residual Income (RI) обходит эту ловушку: RI = прибыль − (стоимость капитала × инвестиции); если проект зарабатывает больше 12% на использованный капитал, RI растёт, и руководитель принимает.",
        },
        // -------- Q9 — medium MCQ on service industry challenge --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A characteristic of services that makes performance measurement DIFFICULT compared to manufacturing is:",
          prompt_ru:
            "Особенность услуг, затрудняющая оценку эффективности по сравнению с производством:",
          options: [
            {
              key: "A",
              text_en: "Higher capital intensity",
              text_ru: "Более высокая капиталоёмкость",
              why_wrong_en:
                "Most services (consulting, restaurants, retail) are LESS capital-intensive than manufacturing, not more.",
              why_wrong_ru:
                "Большинство услуг (консалтинг, рестораны, розница) МЕНЕЕ капиталоёмки, чем производство.",
            },
            {
              key: "B",
              text_en: "Intangibility of the output",
              text_ru: "Нематериальность результата",
            },
            {
              key: "C",
              text_en: "Higher inventory levels",
              text_ru: "Высокий уровень запасов",
              why_wrong_en:
                "Services typically have LOW or no inventory (a haircut cannot be stockpiled); manufacturing usually has high inventory.",
              why_wrong_ru:
                "У услуг обычно НЕТ или мало запасов (стрижку нельзя складировать); у производства запасы обычно высокие.",
            },
            {
              key: "D",
              text_en: "Greater standardisation",
              text_ru: "Более высокая стандартизация",
              why_wrong_en:
                "Services are LESS standardised than manufactured goods \u2014 heterogeneity is exactly another challenge listed for services.",
              why_wrong_ru:
                "Услуги МЕНЕЕ стандартизированы, чем промышленные товары — неоднородность как раз ещё одна сложность для услуг.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Services have four characteristics that complicate measurement: INTANGIBILITY (no physical output to inspect; how do you measure the \"quality\" of a consultation?); HETEROGENEITY (each service delivery differs by who provides it, when, where); SIMULTANEITY (produced and consumed at the same time, no chance to inspect before delivery); PERISHABILITY (cannot be stored). Manufacturing measures hardly apply: defect rate is hard when there's no physical product; throughput per hour is harder when output isn't identical. Service measurement often uses proxies: customer satisfaction surveys, response times, on-time delivery, repeat business.",
          explanation_ru:
            "У услуг четыре характеристики, усложняющие измерение: НЕМАТЕРИАЛЬНОСТЬ (нет физического выхода для контроля; как измерить «качество» консультации?); НЕОДНОРОДНОСТЬ (каждая услуга разная — кто, когда, где её оказывает); ОДНОВРЕМЕННОСТЬ (производство и потребление одновременно, нет шанса проверить до оказания); НЕВОЗМОЖНОСТЬ ХРАНЕНИЯ. Производственные метрики плохо применимы: доля брака — сложно, когда нет физического продукта; пропускная способность — сложнее, когда выходы не идентичны. Для услуг используют косвенные показатели: опросы удовлетворённости, время отклика, своевременность, повторные обращения.",
        },
        // -------- Q10 — medium NUMBER_ENTRY on RI --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "A division has profit of $80,000 from invested capital of $400,000. The company\u2019s cost of capital is 15%. Calculate the RESIDUAL INCOME (in $).",
          prompt_ru:
            "У подразделения прибыль $80 000 на вложенный капитал $400 000. Стоимость капитала компании 15%. Рассчитайте ОСТАТОЧНЫЙ ДОХОД (в $).",
          correct_answer_en: "20000",
          acceptable_tolerance: 1,
          explanation_en:
            'RI = Profit \u2212 (Cost of Capital \u00d7 Investment) = 80,000 \u2212 (0.15 \u00d7 400,000) = 80,000 \u2212 60,000 = $20,000. Positive RI = the division has earned MORE than the cost of capital on the resources committed, so is adding value. Note ROI here = 80,000 / 400,000 = 20%, exceeding the 15% cost of capital — same conclusion from both metrics. The advantage of RI emerges when comparing investments: RI says "accept all projects with positive RI" (consistent with NPV), while ROI says "accept only projects beating current divisional ROI" (which can reject good ones).',
          explanation_ru:
            "RI = Прибыль − (Стоимость капитала × Инвестиции) = 80 000 − (0,15 × 400 000) = 80 000 − 60 000 = $20 000. Положительный RI — подразделение заработало БОЛЬШЕ стоимости капитала на используемых ресурсах, значит добавляет стоимость. ROI здесь = 80 000 / 400 000 = 20%, выше стоимости капитала 15% — обе метрики дают одинаковый вывод. Преимущество RI проявляется при сравнении инвестиций: RI говорит «принимать все проекты с положительным RI» (согласуется с NPV), а ROI — «принимать только проекты, превышающие текущий ROI подразделения» (может отвергнуть хорошие).",
        },
        // -------- Q11 — medium MCQ on CSF vs KPI --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            'A retailer states that "rapid checkout speed" is critical to its competitive position. Average checkout time is then measured at 4.2 minutes against a target of 3 minutes. In this context, "rapid checkout speed" is the ___ and "average checkout time" is the ___ .',
          prompt_ru:
            "Розничный продавец заявляет, что «быстрое обслуживание на кассе» критично для его конкурентного положения. Среднее время на кассе измерено в 4,2 минуты при цели 3 минуты. В этом контексте «быстрое обслуживание» — это ___, а «среднее время на кассе» — ___ .",
          options: [
            {
              key: "A",
              text_en: "KPI; CSF",
              text_ru: "KPI; CSF",
              why_wrong_en:
                "The labels are reversed: the strategic priority is the CSF, the measurement is the KPI, not the other way around.",
              why_wrong_ru:
                "Метки переставлены: стратегический приоритет — это CSF, а измерение — KPI, а не наоборот.",
            },
            { key: "B", text_en: "CSF; KPI", text_ru: "CSF; KPI" },
            {
              key: "C",
              text_en: "Both KPIs",
              text_ru: "Оба KPI",
              why_wrong_en:
                'A KPI is a specific measure; "rapid checkout speed" is a strategic priority, not a measurable indicator with a number attached.',
              why_wrong_ru:
                "KPI — конкретный измеримый показатель; «быстрое обслуживание» — стратегический приоритет, без приложенной цифры.",
            },
            {
              key: "D",
              text_en: "Both CSFs",
              text_ru: "Оба CSF",
              why_wrong_en:
                "Average checkout time IS a measurement (in minutes), so it's a KPI, not a CSF.",
              why_wrong_ru:
                "Среднее время — это ИЗМЕРЕНИЕ (в минутах), следовательно KPI, а не CSF.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            'Critical Success Factor (CSF) = the few THINGS the organisation must get right to succeed competitively \u2014 broad strategic priorities. Key Performance Indicator (KPI) = the specific QUANTITATIVE measure used to track a CSF. The flow is: strategy \u2192 CSFs (what matters) \u2192 KPIs (how to measure what matters) \u2192 targets and actuals. A common mistake is to identify many KPIs without a clear CSF behind them \u2014 leading to "metric explosion" and conflicting incentives. The discipline is: identify CSFs first, then design no more than 2-3 KPIs per CSF.',
          explanation_ru:
            "Критический фактор успеха (CSF) — немногие ВЕЩИ, которые организация должна делать правильно для конкурентного успеха, — широкие стратегические приоритеты. Ключевой показатель эффективности (KPI) — конкретная КОЛИЧЕСТВЕННАЯ метрика для отслеживания CSF. Поток: стратегия → CSF (что важно) → KPI (как измерить важное) → цели и факт. Частая ошибка — определять много KPI без чётких CSF за ними; это приводит к «взрыву метрик» и противоречивым стимулам. Дисциплина: сначала определить CSF, затем спроектировать не более 2–3 KPI на CSF.",
        },
        // -------- Q12 — medium short_answer on lagging vs leading --------
        {
          type: "short_answer",
          difficulty: "medium",
          prompt_en:
            'Why are financial measures often described as "lagging" indicators, and what is the implication for using ONLY financial KPIs to drive performance?',
          prompt_ru:
            "Почему финансовые показатели часто называют «запаздывающими» индикаторами, и каково следствие использования ТОЛЬКО финансовых KPI для управления эффективностью?",
          correct_answer_en:
            "Financial measures report past results that have already crystallised; by the time a poor financial outcome appears, the underlying problem (loss of customers, falling quality, weak processes) has already happened. Using only financial KPIs means managing the rear-view mirror, so issues are spotted too late to correct cheaply.",
          correct_answer_ru:
            "Финансовые показатели отражают прошлые результаты, уже зафиксировавшиеся; к моменту появления слабого финансового результата причина (потеря клиентов, падение качества, слабые процессы) уже произошла. Использование только финансовых KPI означает управление по «зеркалу заднего вида», и проблемы выявляются слишком поздно, чтобы дёшево исправить.",
          explanation_en:
            "Lagging indicators (revenue, profit margin, ROCE) record OUTCOMES; leading indicators (customer satisfaction scores, employee engagement, on-time delivery, defect rates, new-product pipeline) record DRIVERS that produce those outcomes. The balanced scorecard's causality is that learning & growth drives internal processes, which drives customer satisfaction, which drives financial results. If you only measure the final stage, you can't intervene early. Best practice: combine lagging financial metrics (to know if strategy is working) with leading non-financial metrics (to predict and steer).",
          explanation_ru:
            "Запаздывающие индикаторы (выручка, маржа, ROCE) фиксируют ИСХОДЫ; опережающие (удовлетворённость клиентов, вовлечённость персонала, своевременность поставок, доля брака, поток новых продуктов) фиксируют ДРАЙВЕРЫ этих исходов. Причинно-следственная логика BSC: обучение и рост → внутренние процессы → удовлетворённость клиентов → финансовые результаты. Если измеряется только финал, вмешаться рано невозможно. Лучшая практика: сочетать запаздывающие финансовые показатели (чтобы понять, работает ли стратегия) с опережающими нефинансовыми (для предсказания и управления).",
        },
        // -------- Q13 — medium MCQ on inventory days --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A retailer reports an INVENTORY DAYS figure that has risen from 30 days last year to 55 days this year. The MOST LIKELY interpretation is:",
          prompt_ru:
            "У ретейлера показатель ОБОРАЧИВАЕМОСТИ ЗАПАСОВ В ДНЯХ вырос с 30 в прошлом году до 55 в текущем. НАИБОЛЕЕ ВЕРОЯТНАЯ интерпретация:",
          options: [
            {
              key: "A",
              text_en: "Improved efficiency \u2014 stock is moving faster",
              text_ru: "Улучшение эффективности — запасы оборачиваются быстрее",
              why_wrong_en:
                "A RISING inventory-days figure means stock is moving SLOWER, not faster.",
              why_wrong_ru:
                "РАСТУЩИЙ показатель означает, что запасы оборачиваются МЕДЛЕННЕЕ, а не быстрее.",
            },
            {
              key: "B",
              text_en:
                "Slower stock turnover, possibly indicating obsolete inventory or weakening demand",
              text_ru:
                "Замедление оборачиваемости запасов, возможно, устаревший товар или ослабление спроса",
            },
            {
              key: "C",
              text_en: "Higher sales",
              text_ru: "Рост продаж",
              why_wrong_en:
                "If sales had risen faster than inventory, days would FALL; the days metric is inversely related to sales velocity.",
              why_wrong_ru:
                "Если бы продажи росли быстрее запасов, показатель в днях УМЕНЬШИЛСЯ бы; он обратно связан со скоростью продаж.",
            },
            {
              key: "D",
              text_en: "Reduced cost of sales only",
              text_ru: "Снижение себестоимости продаж",
              why_wrong_en:
                "Lower cost of sales would also raise inventory days, but the question asks for the most likely BUSINESS interpretation, which is the operational story not the arithmetic one.",
              why_wrong_ru:
                "Снижение себестоимости тоже увеличило бы показатель, но вопрос про наиболее вероятную БИЗНЕС-интерпретацию — операционная история, а не арифметическая.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Inventory days = (Inventory / Cost of Sales) \u00d7 365. Rising days means stock is taking longer to sell. Common business causes: obsolete or slow-moving stock building up, slowing demand, overbuying, or seasonal effects timed poorly. Knock-on consequences: cash tied up in stock not generating sales, higher holding costs, risk of write-downs to NRV (IAS 2 lower of cost and NRV rule). Compare against industry: a fashion retailer with 55 days is in trouble (fashion turns fast); a luxury watch retailer might routinely run higher.",
          explanation_ru:
            "Оборачиваемость запасов в днях = (Запасы / Себестоимость продаж) × 365. Рост показателя — запасы продаются дольше. Типичные причины: накопление устаревшего/медленно оборачиваемого товара, замедление спроса, избыточные закупки, неудачное сезонное распределение. Последствия: деньги «заморожены» в запасах, не приносящих продаж; выше затраты на хранение; риск списаний до NRV (правило МСФО (IAS) 2 — наименьшая из себестоимости и NRV). Сравнение с отраслью: фешн-ретейлер с 55 днями в беде (мода обновляется быстро); ретейлер люксовых часов может иметь и больше.",
        },
        // -------- Q14 — hard NUMBER_ENTRY on multi-ratio --------
        {
          type: "number_entry",
          difficulty: "hard",
          prompt_en:
            "Revenue $2,000,000. Cost of sales $1,200,000. Operating expenses $400,000. Capital employed $1,600,000. Calculate the OPERATING MARGIN as a percentage (to 1 decimal place).",
          prompt_ru:
            "Выручка $2 000 000. Себестоимость продаж $1 200 000. Операционные расходы $400 000. Задействованный капитал $1 600 000. Рассчитайте ОПЕРАЦИОННУЮ МАРЖУ в процентах (с точностью до 1 знака).",
          correct_answer_en: "20",
          acceptable_tolerance: 0.1,
          explanation_en:
            'Operating profit = Revenue \u2212 Cost of Sales \u2212 Operating Expenses = 2,000,000 \u2212 1,200,000 \u2212 400,000 = $400,000. Operating margin = Operating profit / Revenue \u00d7 100 = 400,000 / 2,000,000 \u00d7 100 = 20.0%. Note that capital employed information is a distractor for THIS question \u2014 it would be needed for ROCE (which would be 400,000 / 1,600,000 = 25.0%), not for operating margin. Always check which ratio is asked. The "DuPont" decomposition is useful here: ROCE = Operating Margin \u00d7 Asset Turnover = 20.0% \u00d7 (2,000,000/1,600,000) = 20.0% \u00d7 1.25 = 25.0%.',
          explanation_ru:
            "Операционная прибыль = Выручка − Себестоимость продаж − Операционные расходы = 2 000 000 − 1 200 000 − 400 000 = $400 000. Операционная маржа = Операционная прибыль / Выручка × 100 = 400 000 / 2 000 000 × 100 = 20,0%. Внимание: задействованный капитал — отвлекающая информация ИМЕННО для этого вопроса, он нужен для ROCE (= 400 000 / 1 600 000 = 25,0%), но не для операционной маржи. Всегда проверяйте, какой коэффициент спрашивается. Полезное разложение Дюпона: ROCE = Операционная маржа × Оборачиваемость активов = 20,0% × (2 000 000/1 600 000) = 20,0% × 1,25 = 25,0%.",
        },
        // -------- Q15 — hard MCQ on integrated scorecard scenario --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            "A division\u2019s manager is evaluated solely on quarterly ROCE and receives a bonus when it exceeds 18%. Current ROCE is 22%. The MOST LIKELY dysfunctional behaviour from this incentive structure is:",
          prompt_ru:
            "Руководитель подразделения оценивается исключительно по квартальному ROCE и получает бонус, когда он превышает 18%. Текущий ROCE — 22%. НАИБОЛЕЕ ВЕРОЯТНОЕ дисфункциональное поведение при такой системе стимулов:",
          options: [
            {
              key: "A",
              text_en:
                "Defer or reject value-adding investments whose returns are below the current 22% but above the company\u2019s cost of capital, AND cut discretionary spend (training, R&D, maintenance) to keep ROCE high",
              text_ru:
                "Откладывать или отвергать добавляющие стоимость инвестиции с доходностью ниже 22%, но выше стоимости капитала, И сокращать дискреционные расходы (обучение, НИОКР, обслуживание), чтобы удержать ROCE на высоком уровне",
            },
            {
              key: "B",
              text_en: "Take long-term investments aggressively",
              text_ru: "Активно делать долгосрочные инвестиции",
              why_wrong_en:
                "Long-term investments reduce short-term ROCE (capital base rises before profit catches up), so ROCE-driven managers REDUCE long-term investment, not increase it.",
              why_wrong_ru:
                "Долгосрочные инвестиции снижают краткосрочный ROCE (база капитала растёт до того, как прибыль за ней подтянется), поэтому ROCE-ориентированные менеджеры СНИЖАЮТ долгосрочные инвестиции, а не наращивают.",
            },
            {
              key: "C",
              text_en:
                "Be indifferent to performance because the threshold is well below current ROCE",
              text_ru:
                "Быть безразличным к эффективности, так как порог сильно ниже текущего ROCE",
              why_wrong_en:
                "Indifference would only occur if the bonus was very small or threshold was certainly safe; in practice the gap creates room for ROCE management behaviours.",
              why_wrong_ru:
                "Безразличие возможно лишь при очень малом бонусе или гарантированно безопасном пороге; на практике разрыв создаёт простор для манипуляции ROCE.",
            },
            {
              key: "D",
              text_en: "Hire more staff and acquire new equipment",
              text_ru: "Нанимать персонал и приобретать новое оборудование",
              why_wrong_en:
                "Both raise the cost and capital base, lowering ROCE \u2014 ROCE-driven managers avoid these expansions even when they make business sense.",
              why_wrong_ru:
                "Оба увеличивают расходы и капитальную базу, снижая ROCE — ROCE-ориентированные менеджеры избегают таких расширений даже когда они экономически оправданы.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Single-metric incentives systematically distort behaviour. ROCE as the sole metric drives two predictable responses: (1) UNDER-INVESTMENT \u2014 reject projects yielding less than current divisional ROCE, even when they exceed cost of capital and add NPV; this is the same ROI dysfunction at division level. (2) DISCRETIONARY SPENDING CUTS \u2014 slash R&D, training, maintenance, marketing, because these reduce current-period profit (and thus ROCE) while their benefits accrue later. The compounding cost is delayed: the division's ROCE looks good in the short term but its competitive position erodes. Balanced scorecard exists precisely to prevent this: combining financial metrics (lagging) with customer, process, and learning measures (leading) makes the long-term cost of these cuts visible.",
          explanation_ru:
            "Стимулы по одной метрике систематически искажают поведение. ROCE как единственная метрика приводит к двум предсказуемым реакциям: (1) НЕДОИНВЕСТИРОВАНИЕ — отказ от проектов с доходностью ниже текущего дивизионного ROCE, даже если они превышают стоимость капитала и добавляют NPV; та же дисфункция ROI, но на уровне подразделения. (2) СОКРАЩЕНИЕ ДИСКРЕЦИОННЫХ РАСХОДОВ — урезание НИОКР, обучения, обслуживания, маркетинга, поскольку они снижают текущую прибыль (и ROCE), а отдача приходит позже. Накопительная цена отложена: ROCE подразделения выглядит хорошо краткосрочно, но конкурентное положение размывается. Сбалансированная карта показателей создана именно для предотвращения этого: сочетая финансовые (запаздывающие) с клиентскими, процессными и метриками обучения (опережающими), долгосрочная цена сокращений становится видна.",
        },
      ],
    },
  ],
};
