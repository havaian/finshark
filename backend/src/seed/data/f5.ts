// Seed content for the F5 (Performance Management) paper.
// Structure mirrors the official ACCA 2025-26 syllabus sections A-E.
// Question content is original.

import type { SeedPaper } from "./types";

export const F5_PAPER: SeedPaper = {
  code: "F5",
  name_en: "Performance Management",
  name_ru: "Управление эффективностью",
  learning_objectives: [
    // ---------- A ----------
    {
      code: "A",
      title_en: "Information, systems and organisational change",
      title_ru: "Информация, системы и организационные изменения",
      description_en:
        "Sources of management information, big data, technology in performance management.",
      description_ru:
        "Источники управленческой информации, большие данные, технологии в управлении эффективностью.",
      sort_order: 10,
      questions: [
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            'Which of the following is NOT typically considered one of the "Vs" of Big Data?',
          prompt_ru:
            "Что из перечисленного обычно НЕ относится к «V» больших данных?",
          options: [
            { key: "A", text_en: "Volume", text_ru: "Объём (Volume)" },
            { key: "B", text_en: "Velocity", text_ru: "Скорость (Velocity)" },
            { key: "C", text_en: "Variety", text_ru: "Разнообразие (Variety)" },
            {
              key: "D",
              text_en: "Visibility",
              text_ru: "Видимость (Visibility)",
            },
          ],
          correct_answer_en: "D",
          explanation_en:
            'The classical "3Vs" are Volume, Velocity, Variety (sometimes extended to Veracity and Value). Visibility is not part of the framework.',
          explanation_ru:
            "Классические «3V» - объём, скорость, разнообразие (иногда добавляют достоверность и ценность). «Видимость» в эту модель не входит.",
        },
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A characteristic of GOOD management information is that it should be:",
          prompt_ru: "Хорошая управленческая информация должна быть:",
          options: [
            {
              key: "A",
              text_en: "Exhaustive in detail",
              text_ru: "Исчерпывающе подробной",
            },
            {
              key: "B",
              text_en: "Timely, accurate and relevant to the decision",
              text_ru: "Своевременной, точной и релевантной для решения",
            },
            {
              key: "C",
              text_en: "Strictly historical",
              text_ru: "Строго исторической",
            },
            {
              key: "D",
              text_en: "Available only to senior managers",
              text_ru: "Доступной только высшему руководству",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "The mnemonic ACCURATE (Accurate, Complete, Cost-effective, Understandable, Relevant, Adaptable/Authoritative, Timely, Easy-to-use) summarises the qualities. Timeliness, accuracy and relevance are the core.",
          explanation_ru:
            "Мнемоника ACCURATE (точная, полная, экономичная, понятная, релевантная, авторитетная, своевременная, удобная) описывает требуемые свойства. Своевременность, точность и релевантность - основа.",
        },
                {
          type: "mcq",
          difficulty: "easy",
          prompt_en: "What does \"ERP\" stand for in the context of business systems?",
          prompt_ru: "Что означает «ERP» в контексте бизнес-систем?",
          options: [
            {
              key: "A",
              text_en: "Enterprise Resource Planning",
              text_ru: "Планирование ресурсов предприятия (Enterprise Resource Planning)",
            },
            {
              key: "B",
              text_en: "Enterprise Reporting Platform",
              text_ru: "Платформа корпоративной отчётности",
              why_wrong_en: "ERP stands for Enterprise Resource Planning - an integrated operational system, not merely a reporting platform.",
              why_wrong_ru: "ERP - это планирование ресурсов предприятия, интегрированная операционная система, а не просто платформа отчётности.",
            },
            {
              key: "C",
              text_en: "External Revenue Projection",
              text_ru: "Прогноз внешней выручки",
              why_wrong_en: "ERP is not a forecasting term; it is an integrated business-management system.",
              why_wrong_ru: "ERP - не термин прогнозирования, а интегрированная система управления бизнесом.",
            },
            {
              key: "D",
              text_en: "Efficient Resource Procurement",
              text_ru: "Эффективная закупка ресурсов",
              why_wrong_en: "Procurement is just one area an ERP may cover; the acronym is Enterprise Resource Planning.",
              why_wrong_ru: "Закупки - лишь одна из областей ERP; аббревиатура означает «планирование ресурсов предприятия».",
            },
          ],
          correct_answer_en: "A",
          explanation_en: "ERP (Enterprise Resource Planning) systems integrate core business processes - finance, HR, manufacturing, supply chain - into a single database, supporting real-time management decision-making.",
          explanation_ru: "Системы ERP (планирование ресурсов предприятия) объединяют ключевые бизнес-процессы - финансы, HR, производство, цепочку поставок - в единую базу данных, поддерживая принятие управленческих решений в реальном времени.",
        },
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en: 'A "lean" organisation seeks to:',
          prompt_ru: "«Бережливая» (lean) организация стремится:",
          options: [
            {
              key: "A",
              text_en: "Maximise inventory levels for safety",
              text_ru: "Максимизировать запасы для подстраховки",
            },
            {
              key: "B",
              text_en: "Eliminate waste in all forms",
              text_ru: "Устранить потери во всех формах",
            },
            {
              key: "C",
              text_en: "Increase the workforce headcount",
              text_ru: "Увеличить численность персонала",
            },
            {
              key: "D",
              text_en: "Diversify into unrelated industries",
              text_ru: "Диверсифицироваться в несвязанные отрасли",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Lean (originally Toyota Production System) classifies seven wastes - overproduction, waiting, transport, processing, inventory, motion, defects - and seeks to eliminate them.",
          explanation_ru:
            "Бережливое производство (Toyota Production System) выделяет семь видов потерь - перепроизводство, ожидание, транспортировку, обработку, запасы, движение, дефекты - и стремится их устранить.",
        },
      ],
    },
    // ---------- B ----------
    {
      code: "B",
      title_en: "Specialist cost and management accounting techniques",
      title_ru:
        "Специализированные методы учёта затрат и управленческого учёта",
      description_en:
        "ABC, target costing, lifecycle costing, throughput accounting.",
      description_ru:
        "ABC, целевое калькулирование, калькуляция по жизненному циклу, учёт пропускной способности.",
      sort_order: 20,
      questions: [
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "Activity-Based Costing (ABC) primarily assigns overheads using:",
          prompt_ru:
            "Метод учёта затрат по видам деятельности (ABC) распределяет накладные расходы преимущественно с помощью:",
          options: [
            {
              key: "A",
              text_en: "A single plant-wide rate",
              text_ru: "Единой ставки по всему предприятию",
            },
            {
              key: "B",
              text_en: "Cost drivers linked to activities",
              text_ru: "Драйверов затрат, связанных с видами деятельности",
            },
            {
              key: "C",
              text_en: "Direct labour hours only",
              text_ru: "Только прямых трудозатрат",
            },
            {
              key: "D",
              text_en: "Sales revenue",
              text_ru: "Выручки от продаж",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "ABC traces overheads first to activities (e.g. machine set-ups, inspections) and then to products using cost drivers that cause those activities - producing more granular product costs than absorption costing.",
          explanation_ru:
            "ABC сначала относит накладные расходы на виды деятельности (наладки, проверки и т.п.), а затем - на продукты через драйверы затрат, дающие более точные продуктовые затраты, чем абсорбционный метод.",
        },
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en: "Under target costing, the target cost is computed as:",
          prompt_ru:
            "При целевом калькулировании себестоимости целевая себестоимость рассчитывается как:",
          options: [
            {
              key: "A",
              text_en: "Target selling price + required profit margin",
              text_ru: "Целевая цена продажи + требуемая маржа прибыли",
            },
            {
              key: "B",
              text_en: "Target selling price − required profit margin",
              text_ru: "Целевая цена продажи − требуемая маржа прибыли",
            },
            {
              key: "C",
              text_en: "Standard cost + inflation",
              text_ru: "Нормативная себестоимость + инфляция",
            },
            {
              key: "D",
              text_en: "Average competitor cost",
              text_ru: "Средние затраты конкурентов",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Target costing works backwards from the market price: identify what customers will pay, subtract the required margin, and engineer the product to fit the remaining cost envelope.",
          explanation_ru:
            "Целевое калькулирование идёт от рынка: определяют цену, которую заплатят клиенты, вычитают требуемую маржу, и проектируют продукт под оставшуюся сумму затрат.",
        },
                {
          type: "mcq",
          difficulty: "medium",
          prompt_en: "In throughput accounting, how is the Throughput Accounting Ratio (TPAR) calculated?",
          prompt_ru: "В учёте по пропускной способности как рассчитывается коэффициент TPAR (Throughput Accounting Ratio)?",
          options: [
            {
              key: "A",
              text_en: "Throughput per unit of bottleneck resource ÷ factory cost per unit of bottleneck resource",
              text_ru: "Пропускная способность на единицу узкого ресурса ÷ заводские затраты на единицу узкого ресурса",
            },
            {
              key: "B",
              text_en: "Sales revenue ÷ total variable cost",
              text_ru: "Выручка ÷ общие переменные затраты",
              why_wrong_en: "TPAR is built on throughput and factory cost PER UNIT OF THE BOTTLENECK resource, not a simple revenue-to-variable-cost ratio.",
              why_wrong_ru: "TPAR строится на пропускной способности и заводских затратах НА ЕДИНИЦУ УЗКОГО ресурса, а не на простом отношении выручки к переменным затратам.",
            },
            {
              key: "C",
              text_en: "Contribution ÷ sales revenue",
              text_ru: "Маржинальная прибыль ÷ выручка",
              why_wrong_en: "That is the contribution-to-sales (C/S) ratio, not TPAR.",
              why_wrong_ru: "Это коэффициент маржинальной прибыли к выручке (C/S), а не TPAR.",
            },
            {
              key: "D",
              text_en: "Fixed costs ÷ contribution per unit",
              text_ru: "Постоянные затраты ÷ маржинальная прибыль на единицу",
              why_wrong_en: "That is the break-even formula, unrelated to the throughput accounting ratio.",
              why_wrong_ru: "Это формула точки безубыточности, не связанная с коэффициентом TPAR.",
            },
          ],
          correct_answer_en: "A",
          explanation_en: "TPAR = throughput per bottleneck hour ÷ factory cost per bottleneck hour. A TPAR above 1 means the product earns more throughput than the factory cost it consumes (desirable); below 1 suggests dropping or redesigning the product.",
          explanation_ru: "TPAR = пропускная способность на час узкого места ÷ заводские затраты на час узкого места. TPAR выше 1 означает, что продукт приносит больше пропускной способности, чем потребляет заводских затрат (желательно); ниже 1 - продукт стоит снять или переработать.",
        },
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en: "Lifecycle costing emphasises that:",
          prompt_ru: "Калькулирование по жизненному циклу подчёркивает, что:",
          options: [
            {
              key: "A",
              text_en: "Only manufacturing costs matter",
              text_ru: "Имеют значение только производственные затраты",
            },
            {
              key: "B",
              text_en:
                "Costs and revenues over the product\u2019s full life should be evaluated together",
              text_ru:
                "Затраты и выручку за весь жизненный цикл продукта следует оценивать совместно",
            },
            {
              key: "C",
              text_en: "R&D costs should be ignored",
              text_ru: "Затраты на R&D следует игнорировать",
            },
            {
              key: "D",
              text_en: "Pricing must be set in the maturity stage only",
              text_ru: "Цены должны устанавливаться только на стадии зрелости",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            'Lifecycle costing accumulates and analyses costs from design through disposal. Most of a product\u2019s lifetime cost is "locked in" during design, so this view encourages investment in upfront engineering.',
          explanation_ru:
            "Метод учитывает и анализирует затраты от проектирования до утилизации. Большая часть себестоимости «закладывается» уже на этапе проектирования, что мотивирует инвестировать в инженерные решения заранее.",
        },
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            "A product has selling price $50, direct materials $20, and uses 4 minutes of bottleneck time per unit. The factory cost (excluding materials) is $5 per bottleneck minute. The Throughput Accounting Ratio is:",
          prompt_ru:
            "Цена продажи продукта $50, прямые материалы $20, на единицу уходит 4 минуты узкого ресурса. Фабричные затраты (без материалов) - $5 на минуту узкого ресурса. Коэффициент TPAR равен:",
          options: [
            { key: "A", text_en: "1.5", text_ru: "1,5" },
            { key: "B", text_en: "2.0", text_ru: "2,0" },
            { key: "C", text_en: "0.5", text_ru: "0,5" },
            { key: "D", text_en: "3.0", text_ru: "3,0" },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Throughput per unit = $50 − $20 = $30. Throughput per bottleneck minute = $30 / 4 = $7.50. TPAR = $7.50 / $5 = 1.5.",
          explanation_ru:
            "Пропускная способность на единицу = $50 − $20 = $30. На минуту узкого ресурса = $30 / 4 = $7,50. TPAR = $7,50 / $5 = 1,5.",
        },
      ],
    },
    // ---------- C ----------
    {
      code: "C",
      title_en: "Decision-making techniques",
      title_ru: "Методы принятия решений",
      description_en:
        "Relevant costing, CVP, limiting factors, risk and uncertainty.",
      description_ru:
        "Релевантные затраты, CVP, ограничивающие факторы, риск и неопределённость.",
      sort_order: 30,
      questions: [
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "Which of the following is a RELEVANT cost for short-term decision-making?",
          prompt_ru:
            "Что из перечисленного является РЕЛЕВАНТНОЙ затратой при краткосрочном принятии решений?",
          options: [
            {
              key: "A",
              text_en: "Sunk cost",
              text_ru: "Понесённая (sunk) затрата",
            },
            {
              key: "B",
              text_en: "Committed cost",
              text_ru: "Принятая на себя (committed) затрата",
            },
            {
              key: "C",
              text_en: "Incremental cost",
              text_ru: "Приростная (incremental) затрата",
            },
            {
              key: "D",
              text_en: "Historical book value",
              text_ru: "Историческая балансовая стоимость",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "Relevant costs are future, cash and differential. Incremental (extra) costs caused by the decision qualify. Sunk and historical costs do not - they cannot be changed.",
          explanation_ru:
            "Релевантные затраты - будущие, денежные, отличающиеся. Приростные (дополнительные) затраты, вызванные решением, к ним относятся. Понесённые и исторические - нет, их уже не изменить.",
        },
                {
          type: "mcq",
          difficulty: "medium",
          prompt_en: "In CVP analysis, what is the formula for the break-even point in units?",
          prompt_ru: "В CVP-анализе какова формула точки безубыточности в единицах?",
          options: [
            {
              key: "A",
              text_en: "Fixed costs ÷ contribution per unit",
              text_ru: "Постоянные затраты ÷ маржинальная прибыль на единицу",
            },
            {
              key: "B",
              text_en: "Fixed costs ÷ selling price per unit",
              text_ru: "Постоянные затраты ÷ цена продажи за единицу",
              why_wrong_en: "Dividing by selling price ignores variable costs; break-even uses CONTRIBUTION (price − variable cost) per unit.",
              why_wrong_ru: "Деление на цену продажи игнорирует переменные затраты; в безубыточности используется МАРЖИНАЛЬНАЯ прибыль (цена − переменные) на единицу.",
            },
            {
              key: "C",
              text_en: "Total costs ÷ contribution per unit",
              text_ru: "Общие затраты ÷ маржинальная прибыль на единицу",
              why_wrong_en: "Only FIXED costs go on top; variable costs are already captured within contribution.",
              why_wrong_ru: "Сверху стоят только ПОСТОЯННЫЕ затраты; переменные уже учтены в маржинальной прибыли.",
            },
            {
              key: "D",
              text_en: "Contribution per unit ÷ fixed costs",
              text_ru: "Маржинальная прибыль на единицу ÷ постоянные затраты",
              why_wrong_en: "This is inverted; break-even units put fixed costs on top, divided by contribution per unit.",
              why_wrong_ru: "Это перевёрнутая формула; в точке безубыточности сверху стоят постоянные затраты, делённые на маржинальную прибыль на единицу.",
            },
          ],
          correct_answer_en: "A",
          explanation_en: "Break-even units = fixed costs ÷ contribution per unit, where contribution per unit = selling price − variable cost per unit. At this volume total contribution exactly covers fixed costs and profit is zero.",
          explanation_ru: "Точка безубыточности в единицах = постоянные затраты ÷ маржинальная прибыль на единицу, где маржинальная прибыль = цена продажи − переменные затраты на единицу. При этом объёме совокупная маржинальная прибыль точно покрывает постоянные затраты, а прибыль равна нулю.",
        },
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "When there is a single limiting factor and several products, you should produce in order of:",
          prompt_ru:
            "При наличии одного ограничивающего фактора и нескольких продуктов производить следует в порядке:",
          options: [
            {
              key: "A",
              text_en: "Highest selling price first",
              text_ru: "Сначала самая высокая цена",
            },
            {
              key: "B",
              text_en: "Highest contribution per unit of limiting factor first",
              text_ru:
                "Сначала наибольшая маржа на единицу ограничивающего фактора",
            },
            {
              key: "C",
              text_en: "Lowest variable cost first",
              text_ru: "Сначала самые низкие переменные затраты",
            },
            {
              key: "D",
              text_en: "Highest absolute profit first",
              text_ru: "Сначала наибольшая абсолютная прибыль",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "When a resource is scarce, ranking by contribution per unit of that resource (e.g. per machine-hour) maximises total contribution within the constraint.",
          explanation_ru:
            "Когда ресурс ограничен, ранжирование по марже на единицу этого ресурса (например, на машиночас) максимизирует общую маржу в рамках ограничения.",
        },
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en: "A decision-maker who uses the MAXIMIN criterion is:",
          prompt_ru:
            "Лицо, принимающее решения по критерию МАКСИМИН, является:",
          options: [
            { key: "A", text_en: "Risk-seeking", text_ru: "Рискующим" },
            {
              key: "B",
              text_en: "Risk-averse / pessimistic",
              text_ru: "Избегающим риска / пессимистом",
            },
            {
              key: "C",
              text_en: "Indifferent to risk",
              text_ru: "Безразличным к риску",
            },
            {
              key: "D",
              text_en: "Following expected value",
              text_ru: "Действующим по ожидаемой ценности",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Maximin chooses the option whose WORST outcome is best - a defensive, pessimistic stance. Maximax (best-of-best) is risk-seeking; expected value is risk-neutral.",
          explanation_ru:
            "Максимин выбирает вариант, у которого ХУДШИЙ исход наилучший - оборонительная, пессимистичная позиция. Максимакс (лучшее из лучших) - рискующий; ожидаемая ценность - нейтральный.",
        },
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            "A company has spent $40,000 developing a prototype. To complete production needs $25,000 more. The product would sell for $50,000 total. Should they continue?",
          prompt_ru:
            "Компания уже потратила $40 000 на прототип. Для завершения производства нужно ещё $25 000. Продукт продастся за $50 000. Стоит ли продолжать?",
          options: [
            {
              key: "A",
              text_en: "No - total cost $65,000 exceeds revenue $50,000",
              text_ru: "Нет - общие затраты $65 000 превышают выручку $50 000",
            },
            {
              key: "B",
              text_en: "Yes - additional $25,000 cost yields $50,000 revenue",
              text_ru:
                "Да - дополнительные $25 000 затрат принесут выручку $50 000",
            },
            {
              key: "C",
              text_en: "No - there is no profit on a total-cost basis",
              text_ru: "Нет - на основе полных затрат прибыли нет",
            },
            {
              key: "D",
              text_en: "Need more information about marketing costs",
              text_ru: "Нужны дополнительные данные о расходах на маркетинг",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "The $40,000 already spent is a sunk cost - irrelevant. Relevant analysis compares $25,000 incremental cost with $50,000 incremental revenue: a $25,000 incremental gain.",
          explanation_ru:
            "$40 000 уже потрачены - это понесённые (sunk) затраты, в анализе игнорируются. Релевантно сравнить $25 000 приростных затрат с $50 000 приростной выручки: приростная выгода $25 000.",
        },
        {
          type: "number_entry",
          difficulty: "easy",
          prompt_en:
            "A product sells for $40, has variable cost of $24, and the business has fixed costs of $96,000 per year. What is the break-even point in units?",
          prompt_ru:
            "Продукт продаётся по $40, переменные затраты $24, постоянные затраты $96 000 в год. Сколько единиц нужно продать для безубыточности?",
          correct_answer_en: "6000",
          explanation_en:
            "Contribution per unit = $40 − $24 = $16. Break-even units = fixed costs / contribution = $96,000 / $16 = 6,000 units.",
          explanation_ru:
            "Маржа на единицу = $40 − $24 = $16. Точка безубыточности = постоянные затраты / маржа = $96 000 / $16 = 6 000 единиц.",
          acceptable_tolerance: 0,
        },
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "A company sells 12,000 units per year. Break-even is 9,000 units. What is the margin of safety as a percentage of budgeted sales? Enter the percentage (e.g. 25 for 25%).",
          prompt_ru:
            "Компания продаёт 12 000 единиц в год. Точка безубыточности - 9 000 единиц. Каков запас финансовой прочности в процентах от планового объёма? Введите процент (например, 25 - для 25%).",
          correct_answer_en: "25",
          explanation_en:
            "Margin of safety = (budgeted − break-even) / budgeted × 100 = (12,000 − 9,000) / 12,000 × 100 = 25%.",
          explanation_ru:
            "Запас прочности = (план − точка безубыточности) / план × 100 = (12 000 − 9 000) / 12 000 × 100 = 25%.",
          acceptable_tolerance: 0.5,
        },
      ],
    },
    // ---------- D ----------
    {
      code: "D",
      title_en: "Budgeting and control",
      title_ru: "Бюджетирование и контроль",
      description_en: "Budget types, variance analysis, behavioural aspects.",
      description_ru:
        "Виды бюджетов, анализ отклонений, поведенческие аспекты.",
      sort_order: 40,
      questions: [
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "A FLEXIBLE budget differs from a fixed budget in that it:",
          prompt_ru: "ГИБКИЙ бюджет отличается от жёсткого тем, что он:",
          options: [
            {
              key: "A",
              text_en: "Is approved by the board annually",
              text_ru: "Ежегодно утверждается советом",
            },
            {
              key: "B",
              text_en: "Adjusts cost allowances to actual activity levels",
              text_ru:
                "Корректирует допустимые затраты под фактический уровень деятельности",
            },
            {
              key: "C",
              text_en: "Has no fixed costs",
              text_ru: "Не содержит постоянных затрат",
            },
            {
              key: "D",
              text_en: "Ignores variable costs",
              text_ru: "Игнорирует переменные затраты",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "A flexible budget restates the original budget for the actual activity level achieved - so variances reflect efficiency rather than activity differences.",
          explanation_ru:
            "Гибкий бюджет пересчитывает исходный бюджет под фактический объём деятельности - так отклонения отражают эффективность, а не разницу в активности.",
        },
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "Zero-Based Budgeting (ZBB) requires that each budget period:",
          prompt_ru:
            "Бюджетирование с нуля (ZBB) требует, чтобы в каждом бюджетном периоде:",
          options: [
            {
              key: "A",
              text_en: "Costs are reduced by a fixed percentage",
              text_ru: "Затраты сокращались на фиксированный процент",
            },
            {
              key: "B",
              text_en: "Every activity is justified from scratch",
              text_ru: "Каждая активность обосновывалась с нуля",
            },
            {
              key: "C",
              text_en: "Last year\u2019s budget is rolled forward unchanged",
              text_ru: "Прошлогодний бюджет переносился без изменений",
            },
            {
              key: "D",
              text_en: "Only revenue is forecast",
              text_ru: "Прогнозировалась только выручка",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "ZBB challenges the assumption that prior-year spending is the starting point. Each decision package is justified afresh, controlling cost creep at the price of being labour-intensive.",
          explanation_ru:
            "ZBB отвергает предпосылку, что прошлогодние расходы - отправная точка. Каждый «пакет решений» обосновывается заново: ограничивает рост затрат ценой высокой трудоёмкости.",
        },
                {
          type: "mcq",
          difficulty: "medium",
          prompt_en: "What is a \"rolling\" budget?",
          prompt_ru: "Что такое «скользящий» бюджет?",
          options: [
            {
              key: "A",
              text_en: "A budget continually updated by adding a new period as the most recent one expires",
              text_ru: "Бюджет, постоянно обновляемый добавлением нового периода по мере истечения текущего",
            },
            {
              key: "B",
              text_en: "A budget that is fixed for the whole year and never changed",
              text_ru: "Бюджет, фиксируемый на весь год и не изменяемый",
              why_wrong_en: "That describes a traditional fixed annual budget - the opposite of a rolling budget, which is continually extended.",
              why_wrong_ru: "Это описание традиционного фиксированного годового бюджета - противоположность скользящему, который постоянно продлевается.",
            },
            {
              key: "C",
              text_en: "A budget flexed to the actual level of activity",
              text_ru: "Бюджет, пересчитанный под фактический уровень активности",
              why_wrong_en: "That is a FLEXIBLE budget, used for variance control, not a rolling budget.",
              why_wrong_ru: "Это ГИБКИЙ бюджет для контроля отклонений, а не скользящий.",
            },
            {
              key: "D",
              text_en: "A budget built from zero each period",
              text_ru: "Бюджет, составляемый с нуля каждый период",
              why_wrong_en: "Building from zero describes zero-based budgeting, not a rolling budget.",
              why_wrong_ru: "Составление с нуля - это бюджетирование с нуля, а не скользящий бюджет.",
            },
          ],
          correct_answer_en: "A",
          explanation_en: "A rolling budget (e.g. always 12 months ahead) is continually updated: as one period ends, a new one is added. It keeps planning current and avoids the \"January cliff\" of annual budgeting, but costs more to maintain.",
          explanation_ru: "Скользящий бюджет (например, всегда на 12 месяцев вперёд) постоянно обновляется: по завершении периода добавляется новый. Он поддерживает актуальность планирования и устраняет «январский обрыв» годового бюджета, но дороже в сопровождении.",
        },
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "Standard direct materials cost is 3 kg @ $4/kg per unit. Actual: 1,000 units used 3,200 kg costing $13,440. The materials price variance is:",
          prompt_ru:
            "Нормативные прямые материальные затраты: 3 кг по $4/кг на единицу. Факт: на 1000 единиц израсходовано 3200 кг за $13 440. Отклонение по цене материалов:",
          options: [
            {
              key: "A",
              text_en: "$640 favourable",
              text_ru: "$640 благоприятное",
            },
            {
              key: "B",
              text_en: "$640 adverse",
              text_ru: "$640 неблагоприятное",
            },
            {
              key: "C",
              text_en: "$800 favourable",
              text_ru: "$800 благоприятное",
            },
            {
              key: "D",
              text_en: "$800 adverse",
              text_ru: "$800 неблагоприятное",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Price variance = (Standard price − Actual price) × Actual qty = ($4 − $4.20) × 3,200 = −$640, i.e. $640 adverse. Actual price = $13,440 / 3,200 = $4.20.",
          explanation_ru:
            "Отклонение по цене = (Нормативная − Фактическая) × Фактическое количество = ($4 − $4,20) × 3200 = −$640, то есть $640 неблагоприятное. Факт. цена = $13 440 / 3200 = $4,20.",
        },
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en: "Budgetary slack refers to:",
          prompt_ru: "Бюджетный «зазор» (budgetary slack) означает:",
          options: [
            {
              key: "A",
              text_en: "Time set aside for revisions",
              text_ru: "Время, отведённое на пересмотр",
            },
            {
              key: "B",
              text_en:
                "Deliberately under-estimating revenues or over-estimating costs to ease targets",
              text_ru:
                "Намеренное занижение выручки или завышение затрат, чтобы упростить достижение целей",
            },
            {
              key: "C",
              text_en: "A spare cash reserve",
              text_ru: "Резерв свободных денежных средств",
            },
            {
              key: "D",
              text_en: "A delay in budget approval",
              text_ru: "Задержку утверждения бюджета",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Slack is built in by managers facing performance pressure, distorting both planning and motivation. Combatable by independent benchmarking and zero-based reviews.",
          explanation_ru:
            "«Зазор» закладывается менеджерами под давлением показателей, искажая и планирование, и мотивацию. Противодействие - независимый бенчмаркинг и пересмотр с нуля.",
        },
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "Standard material per unit: 3 kg at $8/kg. Actual production used 6,500 kg at a total cost of $54,600 to make 2,000 units. What is the material price variance? Enter a positive number for adverse, negative for favourable (in $).",
          prompt_ru:
            "Норматив: 3 кг материала по $8/кг на единицу. Фактически на 2 000 единиц израсходовано 6 500 кг общей стоимостью $54 600. Каково отклонение по цене материала? Введите положительное число для неблагоприятного, отрицательное - для благоприятного (в $).",
          correct_answer_en: "2600",
          explanation_en:
            "Material price variance = (standard price − actual price) × actual qty. Actual price = $54,600 / 6,500 = $8.40/kg. Variance = ($8 − $8.40) × 6,500 = −$2,600 → $2,600 adverse.",
          explanation_ru:
            "Отклонение по цене = (нормативная цена − фактическая) × фактическое количество. Факт. цена = $54 600 / 6 500 = $8,40/кг. Отклонение = ($8 − $8,40) × 6 500 = −$2 600 → $2 600 неблагоприятное.",
          acceptable_tolerance: 1,
        },
        {
          type: "number_entry",
          difficulty: "hard",
          prompt_en:
            "Standard usage: 3 kg per unit at $8/kg. Actual: 6,500 kg used to produce 2,000 units. What is the material usage variance (in $)? Enter positive for adverse, negative for favourable.",
          prompt_ru:
            "Норма: 3 кг на единицу по $8/кг. Факт: 6 500 кг на 2 000 единиц. Каково отклонение по использованию материала (в $)? Введите положительное число для неблагоприятного, отрицательное - для благоприятного.",
          correct_answer_en: "4000",
          explanation_en:
            "Standard usage for actual output = 2,000 × 3 kg = 6,000 kg. Variance = (standard qty − actual qty) × standard price = (6,000 − 6,500) × $8 = −$4,000 → $4,000 adverse.",
          explanation_ru:
            "Нормативный расход для фактического выпуска = 2 000 × 3 = 6 000 кг. Отклонение = (норма − факт) × нормативная цена = (6 000 − 6 500) × $8 = −$4 000 → $4 000 неблагоприятное.",
          acceptable_tolerance: 1,
        },
      ],
    },
    // ---------- E ----------
    {
      code: "E",
      title_en: "Performance measurement and control",
      title_ru: "Измерение и контроль эффективности",
      description_en:
        "Financial and non-financial measures, balanced scorecard, divisional performance.",
      description_ru:
        "Финансовые и нефинансовые показатели, сбалансированная система показателей, эффективность подразделений.",
      sort_order: 50,
      questions: [
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en: "Return on Capital Employed (ROCE) is calculated as:",
          prompt_ru:
            "Рентабельность задействованного капитала (ROCE) рассчитывается как:",
          options: [
            {
              key: "A",
              text_en: "Net profit / sales",
              text_ru: "Чистая прибыль / выручка",
            },
            {
              key: "B",
              text_en: "Operating profit / capital employed",
              text_ru: "Операционная прибыль / задействованный капитал",
            },
            {
              key: "C",
              text_en: "Sales / capital employed",
              text_ru: "Выручка / задействованный капитал",
            },
            {
              key: "D",
              text_en: "Net profit / equity",
              text_ru: "Чистая прибыль / собственный капитал",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "ROCE = operating profit (PBIT) ÷ capital employed. It expresses how efficiently long-term capital is used to generate operating returns.",
          explanation_ru:
            "ROCE = операционная прибыль (PBIT) / задействованный капитал. Показывает, насколько эффективно долгосрочный капитал генерирует операционную прибыль.",
        },
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "Kaplan and Norton\u2019s Balanced Scorecard has FOUR perspectives. Which is NOT one of them?",
          prompt_ru:
            "Сбалансированная система показателей Каплана и Нортона имеет ЧЕТЫРЕ перспективы. Что НЕ относится к ним?",
          options: [
            { key: "A", text_en: "Financial", text_ru: "Финансовая" },
            { key: "B", text_en: "Customer", text_ru: "Клиентская" },
            {
              key: "C",
              text_en: "Internal business process",
              text_ru: "Внутренние бизнес-процессы",
            },
            { key: "D", text_en: "Regulatory", text_ru: "Регуляторная" },
          ],
          correct_answer_en: "D",
          explanation_en:
            "The four perspectives are Financial, Customer, Internal Business Process, and Learning & Growth. Regulatory matters often appear inside these but aren\u2019t a separate perspective.",
          explanation_ru:
            "Четыре перспективы: финансовая, клиентская, внутренние бизнес-процессы, обучение и развитие. Регуляторные вопросы часто включаются в них, но отдельной перспективой не являются.",
        },
                {
          type: "mcq",
          difficulty: "medium",
          prompt_en: "How is Residual Income (RI) defined in divisional performance measurement?",
          prompt_ru: "Как определяется остаточная прибыль (RI) при оценке результатов подразделений?",
          options: [
            {
              key: "A",
              text_en: "Operating profit minus a notional interest charge on capital employed",
              text_ru: "Операционная прибыль за вычетом условного процентного начисления на задействованный капитал",
            },
            {
              key: "B",
              text_en: "Operating profit divided by capital employed",
              text_ru: "Операционная прибыль ÷ задействованный капитал",
              why_wrong_en: "That is ROCE (a percentage), not RI; RI is an absolute amount after a capital charge.",
              why_wrong_ru: "Это ROCE (в процентах), а не RI; RI - абсолютная величина после начисления на капитал.",
            },
            {
              key: "C",
              text_en: "Sales revenue minus total costs",
              text_ru: "Выручка за вычетом всех затрат",
              why_wrong_en: "That is simply operating profit; RI goes further by deducting a notional charge for the capital used.",
              why_wrong_ru: "Это просто операционная прибыль; RI идёт дальше, вычитая условную плату за используемый капитал.",
            },
            {
              key: "D",
              text_en: "Contribution minus fixed costs",
              text_ru: "Маржинальная прибыль за вычетом постоянных затрат",
              why_wrong_en: "That yields profit, not residual income; RI specifically deducts a cost-of-capital charge on capital employed.",
              why_wrong_ru: "Это даёт прибыль, а не остаточную прибыль; RI отдельно вычитает плату за капитал на задействованный капитал.",
            },
          ],
          correct_answer_en: "A",
          explanation_en: "RI = operating profit − (cost of capital × capital employed). Unlike ROCE, RI is an absolute figure, which avoids the \"small high-percentage division\" problem and aligns better with maximising shareholder value.",
          explanation_ru: "RI = операционная прибыль − (стоимость капитала × задействованный капитал). В отличие от ROCE, RI - абсолютная величина, что устраняет проблему «маленького подразделения с высоким процентом» и лучше согласуется с максимизацией стоимости для акционеров.",
        },
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en: "Which is a NON-FINANCIAL performance measure?",
          prompt_ru: "Какой из показателей является НЕФИНАНСОВЫМ?",
          options: [
            {
              key: "A",
              text_en: "Gross profit margin",
              text_ru: "Маржа валовой прибыли",
            },
            {
              key: "B",
              text_en: "Customer satisfaction score",
              text_ru: "Индекс удовлетворённости клиентов",
            },
            {
              key: "C",
              text_en: "Earnings per share",
              text_ru: "Прибыль на акцию",
            },
            {
              key: "D",
              text_en: "Inventory days",
              text_ru: "Период оборота запасов",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Customer satisfaction (e.g. NPS) is qualitative/non-financial. The others are computed from financial statements.",
          explanation_ru:
            "Удовлетворённость клиентов (например, NPS) - качественный/нефинансовый показатель. Остальные рассчитываются по финансовой отчётности.",
        },
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            "Division A makes a component for $10. It transfers it to Division B at $15. Division B sells the finished product at $40, incurring additional cost of $20. From the GROUP perspective, what is the contribution per finished unit?",
          prompt_ru:
            "Подразделение A производит компонент за $10. Передаёт его подразделению B по $15. B продаёт готовый продукт за $40, неся дополнительные затраты $20. С точки зрения ГРУППЫ, какова маржа на единицу готовой продукции?",
          options: [
            { key: "A", text_en: "$5", text_ru: "$5" },
            { key: "B", text_en: "$10", text_ru: "$10" },
            { key: "C", text_en: "$15", text_ru: "$15" },
            { key: "D", text_en: "$25", text_ru: "$25" },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Internal transfers cancel out at the group level. Group contribution = external price − external costs = $40 − $10 (A\u2019s cost) − $20 (B\u2019s extra cost) = $10. The $15 transfer is just a paper allocation.",
          explanation_ru:
            "Внутренние трансферы на уровне группы взаимно сокращаются. Маржа группы = внешняя цена − внешние затраты = $40 − $10 (затраты A) − $20 (доп. затраты B) = $10. Цена $15 - лишь внутренняя оценка.",
        },
        {
          type: "number_entry",
          difficulty: "easy",
          prompt_en:
            "A division has operating profit of $480,000 on capital employed of $3,000,000. What is its Return on Investment (ROI) as a percentage?",
          prompt_ru:
            "У подразделения операционная прибыль $480 000 при используемом капитале $3 000 000. Каков ROI в процентах?",
          correct_answer_en: "16",
          explanation_en:
            "ROI = operating profit / capital employed * 100 = 480,000 / 3,000,000 * 100 = 16%.",
          explanation_ru:
            "ROI = операционная прибыль / используемый капитал * 100 = 480 000 / 3 000 000 * 100 = 16%.",
          acceptable_tolerance: 0.5,
        },
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "A division has operating profit of $480,000 on capital employed of $3,000,000. The group's cost of capital is 12%. What is the division's Residual Income (RI) in $?",
          prompt_ru:
            "У подразделения операционная прибыль $480 000 при используемом капитале $3 000 000. Стоимость капитала группы - 12%. Чему равен остаточный доход (RI) в $?",
          correct_answer_en: "120000",
          explanation_en:
            "Capital charge = $3,000,000 * 12% = $360,000. RI = profit - capital charge = $480,000 - $360,000 = $120,000.",
          explanation_ru:
            "Плата за капитал = $3 000 000 * 12% = $360 000. RI = прибыль - плата за капитал = $480 000 - $360 000 = $120 000.",
          acceptable_tolerance: 1,
        },
      ],
    },
  ],
};
