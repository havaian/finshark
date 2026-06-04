// Seed content for the F2 (Management Accounting) paper.
// Structure mirrors the official ACCA 2024-25 syllabus sections A-F.
// Theory and question content is original, written to mimic the style of ACCA past
// papers without reproducing any copyrighted material verbatim.
//
// -------------------------------------------------------------------------
// UZBEK (_uz) TRANSLATION - FOR NATIVE ACCA-TUTOR REVIEW BEFORE GO-LIVE
// Modern Latin script; ASCII apostrophe (') used for o'/g' okina throughout.
// Management-accounting terms a native Uzbek ACCA tutor should confirm (no
// single settled Uzbek term exists; widely-understood EN/RU-derived forms
// were preferred over coining new ones):
//   - "qo'shimcha xarajat" for overhead; "yutilish"/"yutilgan" for
//     absorption/absorbed - confirm against any existing course glossary.
//   - "ajratish"/"taqsimlash"/"qayta taqsimlash" for allocation /
//     apportionment / reapportionment - the three are easily conflated.
//   - "moslashtirilgan byudjet" for flexed budget; "byudjet bo'shlig'i" for
//     budgetary slack (literal calque) - confirm preferred form.
//   - costing-method names kept descriptive: "ish hisobi" (job), "partiya
//     hisobi" (batch), "jarayon hisobi" (process), "xizmat hisobi" (service).
//   - "to'liq hisob" (absorption costing) vs "marjinal hisob" - confirm these
//     read clearly and are not mistaken for full/marginal *cost*.
//   - "hissa" for contribution; "leveraj" for gearing (RU/EN loan kept over
//     coining); "o'tkazuvchanlik" for throughput.
//   - appraisal terms transliterated: "qoplanish davri" (payback), "diskont"
//     (discount), "annuitet" (annuity); NPV/IRR/ARR/ROI/ROCE/EOQ kept as-is.
//   - statistical terms: "qatlamli/klaster/kvota tanlash" (sampling types),
//     "regressiya", "korrelyatsiya", "dispersiya" - confirm academic forms.
//   - Big Data five Vs rendered as Hajm/Tezlik/Xilma-xillik/Haqqoniylik/Qiymat.
//   - the three Es rendered Tejamkorlik/Samaradorlik/Natijaviylik.
// Numbers, currency codes and formulae are unchanged. correct_answer_* fields
// are intentionally NOT translated (language-neutral option keys / numeric
// values), including on number_entry questions.
// -------------------------------------------------------------------------

import type { SeedPaper } from "./types";

export const F2_PAPER: SeedPaper = {
  code: "F2",
  name_en: "Management Accounting",
  name_ru: "Управленческий учёт",
  name_uz: "Boshqaruv hisobi",
  learning_objectives: [
    // ---------- A ----------
    {
      code: "A",
      title_en: "The nature, source and purpose of management information",
      title_ru: "Природа, источники и назначение управленческой информации",
      title_uz: "Boshqaruv axborotining mohiyati, manbasi va maqsadi",
      description_en:
        "Cost vs financial accounting, planning levels, data vs information, and information quality.",
      description_ru:
        "Управленческий и финансовый учёт, уровни планирования, данные и информация, качество информации.",
      description_uz:
        "Boshqaruv hisobi va moliyaviy hisob qiyosi, rejalashtirish darajalari, ma'lumot va axborot, hamda axborot sifati.",
      sort_order: 10,
      theory_en:
        "Management accounting exists to support internal decision-making, while financial accounting reports to external stakeholders. The two differ on every dimension that matters: management accounting is forward-looking, flexible in format, often non-monetary, produced as frequently as needed, and not bound by external standards. Financial accounting is historical, prescribed in format by IFRS/local GAAP, monetary, and produced periodically for shareholders, regulators, and tax authorities.\n\n" +
        "Three managerial processes consume this information. Planning sets objectives and the means to reach them; decision-making chooses between alternatives; control compares actual performance against the plan and triggers corrective action. Planning itself operates on three time horizons. Strategic planning is long-term (3-10 years), made by senior management, and deals with mission, market positioning, and major investment. Tactical planning is medium-term (1-3 years), made by middle management, and translates strategy into resourcing and budgets. Operational planning is short-term (days to a year), made by line management, and covers day-to-day scheduling and routine decisions.\n\n" +
        "Data are raw facts (a list of sales transactions); information is data that has been processed to be useful (total sales by region this month). Good information has the attributes captured in the ACCURATE mnemonic: Accurate, Complete, Cost-effective (benefit exceeds cost), Understandable, Relevant, Authoritative (from a credible source), Timely, and Easy to use. Failing any one of these reduces the information's value to a decision-maker.\n\n" +
        "Sources of data are internal (transaction records, employee feedback, sensor/machine data) and external (government statistics, trade associations, suppliers' price lists, financial press, the internet). Each source carries reliability and cost trade-offs the analyst must weigh.",
      theory_ru:
        "Управленческий учёт обслуживает внутреннее принятие решений, а финансовый учёт - отчётность перед внешними сторонами. Они различаются по каждому значимому параметру: управленческий учёт ориентирован на будущее, свободен по формату, часто неденежный, формируется по мере необходимости и не связан внешними стандартами. Финансовый учёт исторический, форматно предписан МСФО/местными правилами, денежный, формируется периодически для акционеров, регуляторов и налоговых органов.\n\n" +
        "Информацию используют три управленческих процесса. Планирование задаёт цели и пути их достижения; принятие решений выбирает между альтернативами; контроль сравнивает фактические показатели с планом и инициирует корректирующие действия. Планирование действует на трёх временных горизонтах. Стратегическое планирование - долгосрочное (3-10 лет), осуществляется высшим руководством, охватывает миссию, позиционирование на рынке и крупные инвестиции. Тактическое планирование - среднесрочное (1-3 года), осуществляется средним звеном, переводит стратегию в ресурсы и бюджеты. Операционное планирование - краткосрочное (от дней до года), осуществляется линейным менеджментом, охватывает повседневное расписание и рутинные решения.\n\n" +
        "Данные - это сырые факты (список операций продажи); информация - это обработанные данные, ставшие полезными (общая выручка по регионам за месяц). Качественная информация обладает свойствами по мнемонике ACCURATE: Accurate (точная), Complete (полная), Cost-effective (выгода превышает затраты), Understandable (понятная), Relevant (релевантная), Authoritative (из надёжного источника), Timely (своевременная) и Easy to use (удобная). Несоблюдение хотя бы одного признака снижает ценность информации для лица, принимающего решение.\n\n" +
        "Источники данных делятся на внутренние (учётные записи операций, отзывы сотрудников, данные датчиков и оборудования) и внешние (государственная статистика, отраслевые ассоциации, прейскуранты поставщиков, финансовая пресса, интернет). Каждый источник несёт компромисс между надёжностью и стоимостью получения.",
      theory_uz:
        "Boshqaruv hisobi ichki qaror qabul qilishni qo'llab-quvvatlash uchun mavjud, moliyaviy hisob esa tashqi manfaatdor tomonlarga hisobot beradi. Ikkalasi muhim bo'lgan har bir o'lchamda farq qiladi: boshqaruv hisobi kelajakka qaragan, format jihatidan moslashuvchan, ko'pincha nomonetar, kerak bo'lganda tez-tez tayyorlanadigan va tashqi standartlar bilan bog'lanmagan. Moliyaviy hisob esa tarixiy, formati IFRS/mahalliy GAAP tomonidan belgilangan, monetar va aksiyadorlar, tartibga soluvchilar hamda soliq organlari uchun davriy ravishda tayyorlanadigan.\n\nUchta boshqaruv jarayoni bu axborotdan foydalanadi. Rejalashtirish maqsadlar va ularga erishish vositalarini belgilaydi; qaror qabul qilish muqobillar orasidan tanlaydi; nazorat haqiqiy faoliyatni reja bilan solishtiradi va tuzatuvchi harakatni keltirib chiqaradi. Rejalashtirishning o'zi uch vaqt ufqida ishlaydi. Strategik rejalashtirish uzoq muddatli (3-10 yil), oliy rahbariyat tomonidan amalga oshiriladi va missiya, bozordagi mavqe hamda yirik sarmoya bilan shug'ullanadi. Taktik rejalashtirish o'rta muddatli (1-3 yil), o'rta bo'g'in rahbariyati tomonidan amalga oshiriladi va strategiyani resurslar hamda byudjetlarga aylantiradi. Operatsion rejalashtirish qisqa muddatli (kunlardan bir yilgacha), chiziqli rahbariyat tomonidan amalga oshiriladi va kundalik jadval tuzish hamda oddiy qarorlarni qamrab oladi.\n\nMa'lumotlar - bu xom faktlar (sotuv operatsiyalari ro'yxati); axborot esa foydali bo'lishi uchun qayta ishlangan ma'lumotdir (shu oyda mintaqa bo'yicha umumiy sotuv). Yaxshi axborot ACCURATE mnemonikasida qamrab olingan xususiyatlarga ega: Aniq (Accurate), To'liq (Complete), Tejamkor (Cost-effective - naf xarajatdan oshadi), Tushunarli (Understandable), Tegishli (Relevant), Vakolatli (Authoritative - ishonchli manbadan), O'z vaqtida (Timely) va Foydalanish oson (Easy to use). Ulardan birortasiga rioya qilmaslik axborotning qaror qabul qiluvchi uchun qiymatini kamaytiradi.\n\nMa'lumot manbalari ichki (operatsiya yozuvlari, xodimlar fikr-mulohazasi, sensor/mashina ma'lumotlari) va tashqi (davlat statistikasi, savdo uyushmalari, yetkazib beruvchilarning narx ro'yxatlari, moliyaviy matbuot, internet)dir. Har bir manba tahlilchi tortib ko'rishi kerak bo'lgan ishonchlilik va xarajat murosalarini o'z ichiga oladi.",
      questions: [
        // -------- Q1 - easy MCQ on FA vs MA --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "Which statement BEST distinguishes management accounting from financial accounting?",
          prompt_ru:
            "Какое утверждение ЛУЧШЕ всего отличает управленческий учёт от финансового?",
          prompt_uz:
            "Qaysi bayonot boshqaruv hisobini moliyaviy hisobdan ENG yaxshi farqlaydi?",
          options: [
            {
              key: "A",
              text_en: "Management accounting is governed by IFRS",
              text_ru: "Управленческий учёт регулируется МСФО",
              text_uz: "Boshqaruv hisobi IFRS tomonidan tartibga solinadi",
              why_wrong_en:
                "IFRS governs FINANCIAL accounting (external reporting); management accounting is unregulated and tailored to internal needs.",
              why_wrong_ru:
                "МСФО регулируют ФИНАНСОВЫЙ учёт (внешнюю отчётность); управленческий учёт не регулируется и адаптируется под внутренние нужды.",
              why_wrong_uz:
                "IFRS MOLIYAVIY hisobni (tashqi hisobot) tartibga soladi; boshqaruv hisobi esa tartibga solinmagan va ichki ehtiyojlarga moslashtirilgan.",
            },
            {
              key: "B",
              text_en:
                "Management accounting is primarily forward-looking and serves internal decision-makers",
              text_ru:
                "Управленческий учёт ориентирован на будущее и обслуживает внутренних лиц, принимающих решения",
              text_uz:
                "Boshqaruv hisobi asosan kelajakka qaragan va ichki qaror qabul qiluvchilarga xizmat qiladi",
            },
            {
              key: "C",
              text_en:
                "Management accounting is required by law for all companies",
              text_ru:
                "Управленческий учёт обязателен по закону для всех компаний",
              text_uz:
                "Boshqaruv hisobi barcha kompaniyalar uchun qonun bilan talab qilinadi",
              why_wrong_en:
                "Management accounting is voluntary - there is no legal requirement; financial accounting is the one mandated by company law.",
              why_wrong_ru:
                "Управленческий учёт добровольный - закон его не требует; обязательный по закону - финансовый учёт.",
              why_wrong_uz:
                "Boshqaruv hisobi ixtiyoriy - qonuniy talab yo'q; moliyaviy hisob esa kompaniya qonuni tomonidan majburiy qilingani.",
            },
            {
              key: "D",
              text_en: "Management accounting reports only annually",
              text_ru: "Управленческий учёт отчитывается только ежегодно",
              text_uz: "Boshqaruv hisobi faqat yiliga bir marta hisobot beradi",
              why_wrong_en:
                "Management accounting reports as frequently as managers need (daily, weekly, monthly); FINANCIAL accounting tends to the periodic cycle.",
              why_wrong_ru:
                "Управленческий учёт формируется так часто, как нужно менеджерам (ежедневно, еженедельно, ежемесячно); периодичность характерна для ФИНАНСОВОГО учёта.",
              why_wrong_uz:
                "Boshqaruv hisobi menejerlarga kerak bo'lganda (kundalik, haftalik, oylik) hisobot beradi; MOLIYAVIY hisob esa davriy siklga moyil.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "The defining contrast: management accounting looks FORWARD to support decisions, while financial accounting looks BACKWARD to report performance. The other choices reverse properties that actually belong to financial accounting.",
          explanation_ru:
            "Главный контраст: управленческий учёт смотрит ВПЕРЁД, поддерживая решения, а финансовый - НАЗАД, для отчётности о результатах. Остальные варианты приписывают управленческому учёту свойства финансового.",
          explanation_uz:
            "Asosiy qarama-qarshilik: boshqaruv hisobi qarorlarni qo'llab-quvvatlash uchun OLDINGA qaraydi, moliyaviy hisob esa faoliyat haqida hisobot berish uchun ORQAGA qaraydi. Boshqa variantlar aslida moliyaviy hisobga tegishli xususiyatlarni teskari qiladi.",
        },
        // -------- Q2 - easy MCQ on planning level --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "A factory supervisor draws up next week\u2019s production schedule. This decision is BEST classified as:",
          prompt_ru:
            "Начальник смены составляет производственный график на следующую неделю. Это решение ЛУЧШЕ всего классифицировать как:",
          prompt_uz:
            "Zavod ustasi keyingi haftaning ishlab chiqarish jadvalini tuzadi. Bu qaror ENG yaxshi quyidagicha tasniflanadi:",
          options: [
            {
              key: "A",
              text_en: "Strategic",
              text_ru: "Стратегическое",
              text_uz: "Strategik",
              why_wrong_en:
                "Strategic planning is long-term (3-10 years) and made by senior management; a weekly schedule is operational.",
              why_wrong_ru:
                "Стратегическое планирование - долгосрочное (3-10 лет) и делается высшим руководством; недельный график - это операционное планирование.",
              why_wrong_uz:
                "Strategik rejalashtirish uzoq muddatli (3-10 yil) va oliy rahbariyat tomonidan amalga oshiriladi; haftalik jadval esa operatsiondir.",
            },
            {
              key: "B",
              text_en: "Tactical",
              text_ru: "Тактическое",
              text_uz: "Taktik",
              why_wrong_en:
                "Tactical planning is medium-term (1-3 years) - translating strategy into resourcing; weekly scheduling is below this level.",
              why_wrong_ru:
                "Тактическое планирование - среднесрочное (1-3 года) - перевод стратегии в ресурсы; недельный график ниже этого уровня.",
              why_wrong_uz:
                "Taktik rejalashtirish o'rta muddatli (1-3 yil) - strategiyani resurslarga aylantirish; haftalik jadval tuzish esa bu darajadan past.",
            },
            {
              key: "C",
              text_en: "Operational",
              text_ru: "Операционное",
              text_uz: "Operatsion",
            },
            {
              key: "D",
              text_en: "External",
              text_ru: "Внешнее",
              text_uz: "Tashqi",
              why_wrong_en:
                'Planning levels are strategic/tactical/operational; "external" is not a standard category.',
              why_wrong_ru:
                "Уровни планирования - стратегический/тактический/операционный; «внешнее» не является стандартной категорией.",
              why_wrong_uz:
                'Rejalashtirish darajalari strategik/taktik/operatsion; "tashqi" standart toifa emas.',
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "Operational planning covers short-term, routine, day-to-day decisions made by line management - weekly production scheduling is the textbook example. The three levels: strategic (long-term, senior management, mission and market), tactical (medium-term, middle management, resources and budgets), operational (short-term, line management, scheduling and execution).",
          explanation_ru:
            "Операционное планирование охватывает краткосрочные, рутинные ежедневные решения линейного менеджмента - недельный производственный график это хрестоматийный пример. Три уровня: стратегический (долгосрочный, высшее руководство, миссия и рынок), тактический (среднесрочный, средний звено, ресурсы и бюджеты), операционный (краткосрочный, линейный менеджмент, расписание и исполнение).",
          explanation_uz:
            "Operatsion rejalashtirish chiziqli rahbariyat tomonidan amalga oshiriladigan qisqa muddatli, oddiy, kundalik qarorlarni qamrab oladi - haftalik ishlab chiqarish jadvali klassik misoldir. Uch daraja: strategik (uzoq muddatli, oliy rahbariyat, missiya va bozor), taktik (o'rta muddatli, o'rta bo'g'in, resurslar va byudjetlar), operatsion (qisqa muddatli, chiziqli rahbariyat, jadval tuzish va bajarish).",
        },
        // -------- Q3 - easy short_answer on ACCURATE --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            'In the ACCURATE mnemonic for the qualities of good management information, what does the letter "T" stand for?',
          prompt_ru:
            'В мнемонике ACCURATE для качеств хорошей управленческой информации, что обозначает буква "T"?',
          prompt_uz:
            'Yaxshi boshqaruv axborotining sifatlari uchun ACCURATE mnemonikasida "T" harfi nimani anglatadi?',
          options: [
            {
              key: "A",
              text_en: "Timely",
              text_ru: "Своевременная (Timely)",
              text_uz: "O'z vaqtida (Timely)",
            },
            {
              key: "B",
              text_en: "Technical",
              text_ru: "Техническая",
              text_uz: "Texnik (Technical)",
              why_wrong_en:
                'ACCURATE has no "Technical" quality; the T stands for Timely.',
              why_wrong_ru:
                "В ACCURATE нет качества «техническая»; T означает «своевременная».",
              why_wrong_uz:
                "ACCURATEda \"Texnik\" sifati yo'q; T harfi O'z vaqtida (Timely)ni anglatadi.",
            },
            {
              key: "C",
              text_en: "Targeted",
              text_ru: "Целевая",
              text_uz: "Mo'ljallangan (Targeted)",
              why_wrong_en:
                '"Targeted" is not part of ACCURATE; the relevant quality is Relevant (R), and T is Timely.',
              why_wrong_ru:
                "«Целевая» не входит в ACCURATE; соответствующее качество - релевантная (R), а T - своевременная.",
              why_wrong_uz:
                "\"Mo'ljallangan\" ACCURATEning qismi emas; tegishli sifat - Tegishli (R), T esa O'z vaqtida (Timely).",
            },
            {
              key: "D",
              text_en: "Transparent",
              text_ru: "Прозрачная",
              text_uz: "Shaffof (Transparent)",
              why_wrong_en:
                "Transparency is not one of the ACCURATE qualities; the T is Timely.",
              why_wrong_ru:
                "Прозрачность не входит в качества ACCURATE; T - своевременная.",
              why_wrong_uz:
                "Shaffoflik ACCURATE sifatlaridan biri emas; T - O'z vaqtida (Timely).",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "ACCURATE = Accurate, Complete, Cost-effective, Understandable, Relevant, Authoritative, Timely, Easy to use. Timely information reaches the decision-maker before the decision must be made; out-of-date information loses value even if technically correct.",
          explanation_ru:
            "ACCURATE = точная, полная, экономичная, понятная, релевантная, авторитетная, своевременная, простая в использовании. Своевременная информация поступает к лицу, принимающему решение, до момента принятия решения; устаревшая информация теряет ценность, даже будучи технически верной.",
          explanation_uz:
            "ACCURATE = Aniq, To'liq, Tejamkor, Tushunarli, Tegishli, Vakolatli, O'z vaqtida (Timely), Foydalanish oson. O'z vaqtidagi axborot qaror qabul qiluvchiga qaror qilinishi kerak bo'lgan vaqtdan oldin yetib boradi; eskirgan axborot texnik jihatdan to'g'ri bo'lsa ham qiymatini yo'qotadi.",
        },
        // -------- Q4 - easy MCQ on data vs information --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            'Which of the following BEST represents "information" rather than "data"?',
          prompt_ru:
            "Что из перечисленного ЛУЧШЕ всего представляет «информацию», а не «данные»?",
          prompt_uz:
            'Quyidagilardan qaysi biri "ma\'lumot"dan ko\'ra "axborot"ni ENG yaxshi ifodalaydi?',
          options: [
            {
              key: "A",
              text_en:
                "A printed list of every individual sales transaction this month",
              text_ru: "Распечатанный список каждой отдельной продажи за месяц",
              text_uz:
                "Shu oydagi har bir alohida sotuv operatsiyasining bosilgan ro'yxati",
              why_wrong_en:
                "A raw list of transactions is DATA - facts without processing. Information requires processing into a usable form.",
              why_wrong_ru:
                "Сырой список операций - это ДАННЫЕ, факты без обработки. Информация требует переработки в полезную форму.",
              why_wrong_uz:
                "Operatsiyalarning xom ro'yxati - bu MA'LUMOT, qayta ishlanmagan faktlar. Axborot esa foydalanish mumkin shaklga qayta ishlashni talab qiladi.",
            },
            {
              key: "B",
              text_en:
                "A summary showing total monthly sales by product line with year-on-year comparison",
              text_ru:
                "Сводка, показывающая ежемесячные продажи по продуктовым линиям с сопоставлением год к году",
              text_uz:
                "Mahsulot turkumi bo'yicha umumiy oylik sotuvni yildan-yilga taqqoslagan holda ko'rsatuvchi xulosa",
            },
            {
              key: "C",
              text_en: "Raw scanner readings from till receipts",
              text_ru: "Сырые показания сканеров с кассовых чеков",
              text_uz: "Kassa cheklaridagi xom skaner ko'rsatkichlari",
              why_wrong_en:
                "Scanner outputs are unprocessed signals - data in its rawest form.",
              why_wrong_ru:
                "Показания сканеров - необработанные сигналы, данные в самой сырой форме.",
              why_wrong_uz:
                "Skaner chiqishlari - qayta ishlanmagan signallar, ya'ni eng xom shakldagi ma'lumot.",
            },
            {
              key: "D",
              text_en: "Time-stamped log entries from a production sensor",
              text_ru:
                "Записи журнала с метками времени с производственного датчика",
              text_uz:
                "Ishlab chiqarish sensoridan vaqt belgilangan jurnal yozuvlari",
              why_wrong_en:
                "Sensor log entries are raw measurements - data, not information. To become information, they must be aggregated, contextualised, and presented usefully.",
              why_wrong_ru:
                "Записи датчика - сырые измерения, данные, не информация. Чтобы стать информацией, их нужно агрегировать, контекстуализировать и представить полезно.",
              why_wrong_uz:
                "Sensor jurnal yozuvlari - xom o'lchovlar, ya'ni axborot emas, ma'lumot. Axborotga aylanishi uchun ular jamlanishi, kontekstga solinishi va foydali tarzda taqdim etilishi kerak.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "The data \u2192 information transition requires processing. A summary of monthly sales by product line with year-on-year comparison takes raw transaction data, aggregates it, structures it, and contextualises it \u2014 turning facts into something a manager can act on. Raw lists, scanner readings, and sensor logs are all examples of data awaiting that processing step.",
          explanation_ru:
            "Переход данные \u2192 информация требует обработки. Сводка ежемесячных продаж по продуктовым линиям с сопоставлением год к году берёт сырые транзакционные данные, агрегирует их, структурирует и контекстуализирует - превращая факты в нечто, на что менеджер может реагировать. Сырые списки, показания сканеров и логи датчиков - всё это примеры данных, ожидающих этой обработки.",
          explanation_uz:
            "Ma'lumot -> axborot o'tishi qayta ishlashni talab qiladi. Mahsulot turkumi bo'yicha oylik sotuvning yildan-yilga taqqoslangan xulosasi xom operatsiya ma'lumotini oladi, uni jamlaydi, tuzilmalashtiradi va kontekstga soladi - faktlarni menejer harakat qila oladigan narsaga aylantiradi. Xom ro'yxatlar, skaner ko'rsatkichlari va sensor jurnallari - barchasi shu qayta ishlash bosqichini kutayotgan ma'lumot misollaridir.",
        },
        // -------- Q5 - medium MCQ on cost-effective info --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A finance team spends $50,000 on a custom report that helps the board save $8,000 in supplier costs. The information FAILS which ACCURATE quality?",
          prompt_ru:
            "Финансовая команда тратит $50 000 на индивидуальный отчёт, помогающий совету сэкономить $8 000 на поставщиках. Информация НЕ соответствует какому критерию ACCURATE?",
          prompt_uz:
            "Moliya jamoasi kengashga yetkazib beruvchi xarajatlarida 8 000 dollar tejashga yordam beradigan maxsus hisobotga 50 000 dollar sarflaydi. Axborot qaysi ACCURATE sifatiga RIOYA QILMAYDI?",
          options: [
            {
              key: "A",
              text_en: "Accuracy",
              text_ru: "Точности",
              text_uz: "Aniqlik",
              why_wrong_en:
                "Nothing in the scenario suggests the information was inaccurate \u2014 the problem is its economic value, not its correctness.",
              why_wrong_ru:
                "В сценарии ничто не указывает на неточность - проблема в экономической ценности, а не в правильности.",
              why_wrong_uz:
                "Vaziyatda axborot noto'g'ri bo'lganini hech narsa ko'rsatmaydi - muammo uning to'g'riligi emas, iqtisodiy qiymatidir.",
            },
            {
              key: "B",
              text_en: "Cost-effectiveness",
              text_ru: "Экономической целесообразности",
              text_uz: "Tejamkorlik",
            },
            {
              key: "C",
              text_en: "Timeliness",
              text_ru: "Своевременности",
              text_uz: "O'z vaqtidalik",
              why_wrong_en:
                "Timeliness concerns whether the information arrives before a decision must be made; the scenario doesn't indicate a timing issue.",
              why_wrong_ru:
                "Своевременность касается того, поступает ли информация до момента принятия решения; в сценарии вопрос не во времени.",
              why_wrong_uz:
                "O'z vaqtidalik axborot qaror qilinishidan oldin yetib kelishi bilan bog'liq; vaziyat esa vaqt muammosini ko'rsatmaydi.",
            },
            {
              key: "D",
              text_en: "Authoritativeness",
              text_ru: "Надёжности источника",
              text_uz: "Vakolatlilik",
              why_wrong_en:
                "Authoritativeness is about source credibility, not cost; nothing suggests the data source was unreliable.",
              why_wrong_ru:
                "Надёжность источника - про доверие к источнику, не про стоимость; ничто не указывает на ненадёжность источника.",
              why_wrong_uz:
                "Vakolatlilik manba ishonchliligi haqida, xarajat haqida emas; ma'lumot manbasi ishonchsiz bo'lganini hech narsa ko'rsatmaydi.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Cost-effectiveness requires that the benefit of producing information exceed its cost. Here $50,000 was spent to save $8,000 \u2014 a net loss of $42,000. The information may be perfectly accurate, timely, and authoritative, but it fails the economic test. This is the most overlooked ACCURATE quality because it requires comparing two values rather than examining the information itself.",
          explanation_ru:
            "Экономическая целесообразность требует, чтобы выгода от подготовки информации превышала её стоимость. Здесь потрачено $50 000 ради экономии $8 000 - чистый убыток $42 000. Информация может быть совершенно точной, своевременной и из надёжного источника, но экономический тест она проваливает. Это самый часто упускаемый критерий ACCURATE, потому что требует сравнения двух величин, а не анализа самой информации.",
          explanation_uz:
            "Tejamkorlik axborotni tayyorlash nafi uning xarajatidan oshishini talab qiladi. Bu yerda 8 000 dollar tejash uchun 50 000 dollar sarflandi - sof 42 000 dollar zarar. Axborot mukammal aniq, o'z vaqtida va vakolatli bo'lishi mumkin, ammo u iqtisodiy sinovdan o'tmaydi. Bu eng ko'p e'tibordan chetda qoladigan ACCURATE sifati, chunki u axborotning o'zini emas, ikkita qiymatni solishtirishni talab qiladi.",
        },
        // -------- Q6 - medium MCQ on internal vs external sources --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "Which of the following is an EXTERNAL data source for a manufacturing company?",
          prompt_ru:
            "Что из перечисленного является ВНЕШНИМ источником данных для производственной компании?",
          prompt_uz:
            "Quyidagilardan qaysi biri ishlab chiqarish kompaniyasi uchun TASHQI ma'lumot manbasi?",
          options: [
            {
              key: "A",
              text_en: "Production line sensor outputs",
              text_ru: "Показания датчиков производственной линии",
              text_uz: "Ishlab chiqarish liniyasi sensori chiqishlari",
              why_wrong_en:
                "Sensors on the company's own equipment generate INTERNAL data.",
              why_wrong_ru:
                "Датчики на собственном оборудовании компании генерируют ВНУТРЕННИЕ данные.",
              why_wrong_uz:
                "Kompaniyaning o'z uskunasidagi sensorlar ICHKI ma'lumot yaratadi.",
            },
            {
              key: "B",
              text_en: "Employee exit interviews",
              text_ru: "Выходные интервью увольняющихся сотрудников",
              text_uz: "Xodimlarning ishdan ketish suhbatlari",
              why_wrong_en:
                "Employees are part of the organisation; their feedback is INTERNAL data.",
              why_wrong_ru:
                "Сотрудники - часть организации; их обратная связь - ВНУТРЕННИЕ данные.",
              why_wrong_uz:
                "Xodimlar tashkilotning bir qismi; ularning fikr-mulohazasi ICHKI ma'lumotdir.",
            },
            {
              key: "C",
              text_en: "Government economic statistics on industry growth",
              text_ru:
                "Государственная экономическая статистика по росту отрасли",
              text_uz: "Soha o'sishi bo'yicha davlat iqtisodiy statistikasi",
            },
            {
              key: "D",
              text_en: "The general ledger",
              text_ru: "Главная книга",
              text_uz: "Bosh daftar (general ledger)",
              why_wrong_en:
                "The general ledger contains the company's own transaction records \u2014 quintessentially INTERNAL data.",
              why_wrong_ru:
                "Главная книга содержит собственные транзакционные записи компании - это самый внутренний источник данных.",
              why_wrong_uz:
                "Bosh daftar kompaniyaning o'z operatsiya yozuvlarini o'z ichiga oladi - bu ICHKI ma'lumotning yorqin namunasidir.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "Internal data is generated within the organisation (transactions, employee surveys, production logs, sensors). External data comes from outside (government statistics, trade associations, competitor reports, market research, the financial press). Government statistics about industry growth are a classic external source \u2014 useful for benchmarking and market analysis but published by a third party.",
          explanation_ru:
            "Внутренние данные генерируются внутри организации (операции, опросы сотрудников, производственные журналы, датчики). Внешние данные приходят извне (государственная статистика, отраслевые ассоциации, отчёты конкурентов, рыночные исследования, финансовая пресса). Госстатистика по росту отрасли - классический внешний источник, полезный для бенчмаркинга и рыночного анализа, но публикуемый третьей стороной.",
          explanation_uz:
            "Ichki ma'lumot tashkilot ichida yaratiladi (operatsiyalar, xodimlar so'rovlari, ishlab chiqarish jurnallari, sensorlar). Tashqi ma'lumot esa tashqaridan keladi (davlat statistikasi, savdo uyushmalari, raqobatchilar hisobotlari, bozor tadqiqotlari, moliyaviy matbuot). Soha o'sishi haqidagi davlat statistikasi - klassik tashqi manba: benchmarking va bozor tahlili uchun foydali, ammo uchinchi tomon tomonidan nashr etilgan.",
        },
        // -------- Q7 - medium MCQ on tactical level --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "Setting the annual marketing budget and allocating it across product lines is BEST classified as:",
          prompt_ru:
            "Утверждение годового маркетингового бюджета и его распределение по продуктовым линиям ЛУЧШЕ всего классифицировать как:",
          prompt_uz:
            "Yillik marketing byudjetini belgilash va uni mahsulot turkumlari bo'ylab taqsimlash ENG yaxshi quyidagicha tasniflanadi:",
          options: [
            {
              key: "A",
              text_en: "Strategic planning",
              text_ru: "Стратегическое планирование",
              text_uz: "Strategik rejalashtirish",
              why_wrong_en:
                "Strategic planning is multi-year and about mission and market positioning; an annual budget is medium-term resource allocation.",
              why_wrong_ru:
                "Стратегическое планирование - многолетнее, о миссии и позиционировании; годовой бюджет - среднесрочное распределение ресурсов.",
              why_wrong_uz:
                "Strategik rejalashtirish ko'p yillik va missiya hamda bozordagi mavqe haqida; yillik byudjet esa o'rta muddatli resurs taqsimotidir.",
            },
            {
              key: "B",
              text_en: "Tactical planning",
              text_ru: "Тактическое планирование",
              text_uz: "Taktik rejalashtirish",
            },
            {
              key: "C",
              text_en: "Operational planning",
              text_ru: "Операционное планирование",
              text_uz: "Operatsion rejalashtirish",
              why_wrong_en:
                "Operational planning is day-to-day execution; annual budgeting sits one level higher, in the resource-allocation tier.",
              why_wrong_ru:
                "Операционное планирование - это ежедневное исполнение; годовое бюджетирование на уровень выше, в слое распределения ресурсов.",
              why_wrong_uz:
                "Operatsion rejalashtirish kundalik bajarish; yillik byudjet tuzish esa bir daraja yuqorida, resurs taqsimoti bosqichida turadi.",
            },
            {
              key: "D",
              text_en: "Routine recording",
              text_ru: "Рутинная фиксация",
              text_uz: "Oddiy qayd etish",
              why_wrong_en:
                "Routine recording is bookkeeping, not planning at all.",
              why_wrong_ru:
                "Рутинная фиксация - это бухгалтерия, не планирование вовсе.",
              why_wrong_uz:
                "Oddiy qayd etish - buxgalteriya hisobi, umuman rejalashtirish emas.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Tactical planning sits between strategic (long-term direction) and operational (day-to-day execution). It translates strategy into medium-term resources and budgets: how much money goes to marketing this year, how it splits across product lines, what targets each division gets. The decision is made by middle management within the strategic frame set by the board.",
          explanation_ru:
            "Тактическое планирование находится между стратегическим (долгосрочное направление) и операционным (ежедневное исполнение). Оно переводит стратегию в среднесрочные ресурсы и бюджеты: сколько денег идёт на маркетинг в этом году, как они делятся между продуктовыми линиями, какие цели получает каждое подразделение. Решения принимает средний звено в рамках стратегии, заданной советом.",
          explanation_uz:
            "Taktik rejalashtirish strategik (uzoq muddatli yo'nalish) va operatsion (kundalik bajarish) o'rtasida turadi. U strategiyani o'rta muddatli resurslar va byudjetlarga aylantiradi: shu yili marketingga qancha pul ketadi, u mahsulot turkumlari bo'ylab qanday bo'linadi, har bir bo'lim qanday maqsadlar oladi. Qaror kengash o'rnatgan strategik doira ichida o'rta bo'g'in rahbariyati tomonidan qabul qilinadi.",
        },
        // -------- Q8 - medium MCQ on planning vs control --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A manager compares this month\u2019s actual sales against the budget and investigates the variance. This activity is BEST described as:",
          prompt_ru:
            "Руководитель сравнивает фактические продажи месяца с бюджетом и исследует отклонение. Эта деятельность ЛУЧШЕ всего описывается как:",
          prompt_uz:
            "Menejer shu oyning haqiqiy sotuvini byudjet bilan solishtiradi va og'ishni tekshiradi. Bu faoliyat ENG yaxshi quyidagicha tavsiflanadi:",
          options: [
            {
              key: "A",
              text_en: "Planning",
              text_ru: "Планирование",
              text_uz: "Rejalashtirish",
              why_wrong_en:
                "Planning sets the budget in advance; comparing against it after the fact is control, not planning.",
              why_wrong_ru:
                "Планирование задаёт бюджет заранее; сравнение постфактум - это контроль, а не планирование.",
              why_wrong_uz:
                "Rejalashtirish byudjetni oldindan belgilaydi; uni keyin solishtirish esa rejalashtirish emas, nazoratdir.",
            },
            {
              key: "B",
              text_en: "Decision-making",
              text_ru: "Принятие решений",
              text_uz: "Qaror qabul qilish",
              why_wrong_en:
                "Decision-making chooses between alternatives; variance analysis identifies discrepancies, which may THEN lead to a decision but isn't itself the choice.",
              why_wrong_ru:
                "Принятие решений - это выбор между альтернативами; анализ отклонений выявляет расхождения, что МОЖЕТ привести к решению, но сам по себе выбором не является.",
              why_wrong_uz:
                "Qaror qabul qilish muqobillar orasidan tanlaydi; og'ish tahlili nomuvofiqliklarni aniqlaydi, bu KEYINCHALIK qarorga olib kelishi mumkin, ammo o'zi tanlov emas.",
            },
            {
              key: "C",
              text_en: "Control",
              text_ru: "Контроль",
              text_uz: "Nazorat",
            },
            {
              key: "D",
              text_en: "Strategy formulation",
              text_ru: "Формулирование стратегии",
              text_uz: "Strategiya shakllantirish",
              why_wrong_en:
                "Strategy formulation is long-term direction-setting; monthly variance analysis is operational control.",
              why_wrong_ru:
                "Формулирование стратегии - это долгосрочное определение направления; ежемесячный анализ отклонений - операционный контроль.",
              why_wrong_uz:
                "Strategiya shakllantirish uzoq muddatli yo'nalish belgilash; oylik og'ish tahlili esa operatsion nazoratdir.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "The three managerial processes form a cycle. Planning sets objectives; decision-making chooses how to pursue them; CONTROL compares actual outcomes against the plan and triggers corrective action. Variance analysis (actual vs budget) is the heart of the control process. The control cycle: set standard \u2192 measure actual \u2192 identify variance \u2192 investigate cause \u2192 take corrective action \u2192 feed back to planning.",
          explanation_ru:
            "Три управленческих процесса образуют цикл. Планирование задаёт цели; принятие решений выбирает способы их достижения; КОНТРОЛЬ сравнивает фактические результаты с планом и инициирует корректирующие действия. Анализ отклонений (факт против бюджета) - сердце процесса контроля. Цикл контроля: задать норматив → измерить факт → выявить отклонение → исследовать причину → принять корректирующие действия → обратная связь к планированию.",
          explanation_uz:
            "Uchta boshqaruv jarayoni siklni tashkil qiladi. Rejalashtirish maqsadlarni belgilaydi; qaror qabul qilish ularga qanday erishishni tanlaydi; NAZORAT haqiqiy natijalarni reja bilan solishtiradi va tuzatuvchi harakatni keltirib chiqaradi. Og'ish tahlili (haqiqiy va byudjet) nazorat jarayonining qalbidir. Nazorat sikli: standartni belgila -> haqiqiyni o'lcha -> og'ishni aniqla -> sababni tekshir -> tuzatuvchi harakat qil -> rejalashtir'ishga qaytar.",
        },
        // -------- Q9 - medium MCQ on financial vs management accounting frequency --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "Which of the following is a feature of FINANCIAL accounting but NOT management accounting?",
          prompt_ru:
            "Что из перечисленного является характеристикой ФИНАНСОВОГО учёта, но НЕ управленческого?",
          prompt_uz:
            "Quyidagilardan qaysi biri MOLIYAVIY hisobning xususiyati, ammo boshqaruv hisobining EMAS?",
          options: [
            {
              key: "A",
              text_en: "Use of non-monetary measures alongside financial ones",
              text_ru:
                "Использование неденежных показателей наряду с финансовыми",
              text_uz:
                "Moliyaviylar bilan birga nomonetar o'lchovlardan foydalanish",
              why_wrong_en:
                "Non-monetary measures (units produced, customer satisfaction scores, lead times) are common in MANAGEMENT accounting, rare in financial.",
              why_wrong_ru:
                "Неденежные показатели (единицы выпуска, удовлетворённость клиентов, время выполнения) часто используются в УПРАВЛЕНЧЕСКОМ учёте, редко - в финансовом.",
              why_wrong_uz:
                "Nomonetar o'lchovlar (ishlab chiqarilgan birliklar, mijoz qoniqishi ballari, yetkazib berish muddatlari) BOSHQARUV hisobida keng tarqalgan, moliyaviyda esa kam.",
            },
            {
              key: "B",
              text_en: "Compliance with IFRS or local GAAP",
              text_ru: "Соблюдение МСФО или местных стандартов учёта",
              text_uz: "IFRS yoki mahalliy GAAPga rioya qilish",
            },
            {
              key: "C",
              text_en: "Forward-looking forecasts and budgets",
              text_ru: "Прогнозы и бюджеты на будущее",
              text_uz: "Kelajakka qaragan prognozlar va byudjetlar",
              why_wrong_en:
                "Forward-looking outputs (forecasts, budgets) are the DEFINING feature of MANAGEMENT accounting; financial accounting is backward-looking.",
              why_wrong_ru:
                "Прогнозы и бюджеты - ОПРЕДЕЛЯЮЩАЯ черта УПРАВЛЕНЧЕСКОГО учёта; финансовый смотрит назад.",
              why_wrong_uz:
                "Kelajakka qaragan natijalar (prognozlar, byudjetlar) - BOSHQARUV hisobining ASOSIY xususiyati; moliyaviy hisob esa orqaga qaragan.",
            },
            {
              key: "D",
              text_en: "Custom reports tailored to individual managers",
              text_ru: "Индивидуальные отчёты под конкретных руководителей",
              text_uz: "Alohida menejerlarga moslashtirilgan maxsus hisobotlar",
              why_wrong_en:
                "Custom internal reports are management accounting; financial accounting reports are standardised across all external users.",
              why_wrong_ru:
                "Индивидуальные внутренние отчёты - это управленческий учёт; финансовая отчётность стандартизирована для всех внешних пользователей.",
              why_wrong_uz:
                "Maxsus ichki hisobotlar - boshqaruv hisobi; moliyaviy hisob hisobotlari esa barcha tashqi foydalanuvchilar bo'ylab standartlashtirilgan.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Financial accounting must comply with IFRS or local GAAP because its output goes to external users \u2014 shareholders, regulators, tax authorities \u2014 who need consistent comparable information across entities. Management accounting has no external standard; managers can use whatever format, frequency, and measures help them decide.",
          explanation_ru:
            "Финансовый учёт должен соответствовать МСФО или местным стандартам, потому что его результаты идут внешним пользователям - акционерам, регуляторам, налоговым органам, - которым нужна согласованная сопоставимая информация по разным компаниям. У управленческого учёта внешних стандартов нет; руководители могут использовать любой формат, частоту и показатели, помогающие принимать решения.",
          explanation_uz:
            "Moliyaviy hisob IFRS yoki mahalliy GAAPga rioya qilishi shart, chunki uning natijasi tashqi foydalanuvchilarga - aksiyadorlar, tartibga soluvchilar, soliq organlariga - boradi, ularga sub'ektlar bo'ylab izchil, taqqoslanadigan axborot kerak. Boshqaruv hisobida tashqi standart yo'q; menejerlar qaror qilishga yordam beradigan har qanday format, chastota va o'lchovlardan foydalanishi mumkin.",
        },
        // -------- Q10 - medium short_answer on three planning levels --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "What is the correct order of the three levels of organisational planning, from the longest to the shortest time horizon?",
          prompt_ru:
            "Каков верный порядок трёх уровней организационного планирования - от самого длинного к самому короткому горизонту?",
          prompt_uz:
            "Tashkiliy rejalashtirishning uch darajasining eng uzoqdan eng qisqa vaqt ufqigacha to'g'ri tartibi qaysi?",
          options: [
            {
              key: "A",
              text_en: "Strategic → tactical → operational",
              text_ru: "Стратегический → тактический → операционный",
              text_uz: "Strategik -> taktik -> operatsion",
            },
            {
              key: "B",
              text_en: "Operational → tactical → strategic",
              text_ru: "Операционный → тактический → стратегический",
              text_uz: "Operatsion -> taktik -> strategik",
              why_wrong_en:
                "This reverses the horizons: operational is the SHORTEST, strategic the LONGEST, so the order is inverted.",
              why_wrong_ru:
                "Это обратный порядок: операционный - САМЫЙ короткий, стратегический - САМЫЙ длинный, порядок перевёрнут.",
              why_wrong_uz:
                "Bu ufqlarni teskari qiladi: operatsion ENG QISQA, strategik esa ENG UZOQ, shuning uchun tartib teskari.",
            },
            {
              key: "C",
              text_en: "Tactical → strategic → operational",
              text_ru: "Тактический → стратегический → операционный",
              text_uz: "Taktik -> strategik -> operatsion",
              why_wrong_en:
                "Strategic has the longest horizon and must come first; tactical sits between strategic and operational.",
              why_wrong_ru:
                "Стратегический имеет самый длинный горизонт и должен идти первым; тактический - между стратегическим и операционным.",
              why_wrong_uz:
                "Strategik eng uzoq ufqqa ega va birinchi kelishi kerak; taktik strategik bilan operatsion o'rtasida turadi.",
            },
            {
              key: "D",
              text_en: "Strategic → operational → tactical",
              text_ru: "Стратегический → операционный → тактический",
              text_uz: "Strategik -> operatsion -> taktik",
              why_wrong_en:
                "Operational is the shortest horizon and must come last; tactical is the middle level.",
              why_wrong_ru:
                "Операционный - самый короткий горизонт и должен идти последним; тактический - средний уровень.",
              why_wrong_uz:
                "Operatsion eng qisqa ufq va oxirgi kelishi kerak; taktik esa o'rta darajadir.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Strategic (3-10 years, senior management, mission and major investment) → tactical (1-3 years, middle management, resources and budgets) → operational (days to a year, line management, day-to-day scheduling). Each level cascades down and constrains the next.",
          explanation_ru:
            "Стратегический (3-10 лет, высшее руководство, миссия и крупные инвестиции) → тактический (1-3 года, среднее звено, ресурсы и бюджеты) → операционный (от дней до года, линейное руководство, текущее планирование). Каждый уровень каскадно ограничивает следующий.",
          explanation_uz:
            "Strategik (3-10 yil, oliy rahbariyat, missiya va yirik sarmoya) -> taktik (1-3 yil, o'rta bo'g'in, resurslar va byudjetlar) -> operatsion (kunlardan bir yilgacha, chiziqli rahbariyat, kundalik jadval tuzish). Har bir daraja pastga tushadi va keyingisini cheklaydi.",
        },
        // -------- Q11 - medium MCQ on accuracy --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A manager receives a sales report claiming 12.7% growth, but the source spreadsheet contains a known formula error inflating the figure. The information PRIMARILY fails which ACCURATE quality?",
          prompt_ru:
            "Руководитель получает отчёт о продажах с указанием роста 12,7%, но в исходной таблице обнаружена ошибка формулы, завышающая цифру. Информация в ПЕРВУЮ ОЧЕРЕДЬ не соответствует какому критерию ACCURATE?",
          prompt_uz:
            "Menejer 12,7% o'sishni da'vo qiluvchi sotuv hisobotini oladi, ammo manba jadvalida raqamni oshirib ko'rsatadigan ma'lum formula xatosi bor. Axborot BIRINCHI NAVBATDA qaysi ACCURATE sifatiga rioya qilmaydi?",
          options: [
            {
              key: "A",
              text_en: "Accuracy",
              text_ru: "Точности",
              text_uz: "Aniqlik",
            },
            {
              key: "B",
              text_en: "Completeness",
              text_ru: "Полноты",
              text_uz: "To'liqlik",
              why_wrong_en:
                "Completeness concerns whether all relevant information is present; here the figure IS present but WRONG, which is an accuracy issue.",
              why_wrong_ru:
                "Полнота - это наличие всей нужной информации; здесь цифра ЕСТЬ, но НЕВЕРНА, что относится к точности.",
              why_wrong_uz:
                "To'liqlik barcha tegishli axborot mavjudligi bilan bog'liq; bu yerda raqam MAVJUD, ammo NOTO'G'RI, bu esa aniqlik masalasidir.",
            },
            {
              key: "C",
              text_en: "Relevance",
              text_ru: "Релевантности",
              text_uz: "Tegishlilik",
              why_wrong_en:
                "Relevance asks whether the information addresses the question \u2014 sales growth is relevant to the decision; the problem is its correctness, not its topic.",
              why_wrong_ru:
                "Релевантность - про соответствие информации вопросу; рост продаж релевантен решению, проблема в правильности, а не в теме.",
              why_wrong_uz:
                "Tegishlilik axborot savolga javob beradimi deb so'raydi - sotuv o'sishi qaror uchun tegishli; muammo uning mavzusi emas, to'g'riligidir.",
            },
            {
              key: "D",
              text_en: "Timeliness",
              text_ru: "Своевременности",
              text_uz: "O'z vaqtidalik",
              why_wrong_en:
                "Nothing in the scenario indicates the report was late.",
              why_wrong_ru:
                "В сценарии ничто не указывает на запоздалость отчёта.",
              why_wrong_uz:
                "Vaziyatda hisobot kech kelganini hech narsa ko'rsatmaydi.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Accuracy means the information correctly reflects the underlying reality. A formula error inflating a growth figure is a direct accuracy failure: the number in the report does not equal the number reality supports. Accuracy is the first letter of ACCURATE because it's a precondition for any other quality to matter \u2014 perfectly timely, complete, relevant information is useless if the numbers are wrong.",
          explanation_ru:
            "Точность означает, что информация правильно отражает реальность. Ошибка формулы, завышающая рост, - прямой провал точности: цифра в отчёте не соответствует тому, что реально произошло. Точность - первая буква в ACCURATE именно потому, что это предусловие для остальных критериев: совершенно своевременная, полная, релевантная информация бесполезна, если цифры неверны.",
          explanation_uz:
            "Aniqlik axborot asosiy voqelikni to'g'ri aks ettirishini anglatadi. O'sish raqamini oshirib ko'rsatadigan formula xatosi - bu to'g'ridan-to'g'ri aniqlik nuqsoni: hisobotdagi raqam voqelik qo'llab-quvvatlaydigan raqamga teng emas. Aniqlik ACCURATEning birinchi harfi, chunki u boshqa har qanday sifatning ahamiyatli bo'lishi uchun zaruriy shartdir - mukammal o'z vaqtidagi, to'liq, tegishli axborot raqamlar noto'g'ri bo'lsa befoydadir.",
        },
        // -------- Q12 - medium MCQ on planning levels mapping --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A board decides to acquire a competitor company over the next 18 months as part of expansion into a new market. This decision sits PRIMARILY at which planning level?",
          prompt_ru:
            "Совет принимает решение приобрести компанию-конкурента в течение следующих 18 месяцев в рамках выхода на новый рынок. Это решение находится в ПЕРВУЮ ОЧЕРЕДЬ на каком уровне планирования?",
          prompt_uz:
            "Kengash yangi bozorga kengayish doirasida keyingi 18 oy ichida raqobatchi kompaniyani sotib olishga qaror qiladi. Bu qaror BIRINCHI NAVBATDA qaysi rejalashtirish darajasida turadi?",
          options: [
            {
              key: "A",
              text_en: "Strategic",
              text_ru: "Стратегическое",
              text_uz: "Strategik",
            },
            {
              key: "B",
              text_en: "Tactical",
              text_ru: "Тактическое",
              text_uz: "Taktik",
              why_wrong_en:
                "Although the timeframe is 18 months (which is tactical territory), the substance \u2014 entering a new market via acquisition \u2014 is strategic in nature. The 18-month horizon is just when execution starts.",
              why_wrong_ru:
                "Хотя горизонт 18 месяцев (территория тактического), суть - выход на новый рынок через приобретение - стратегическая по природе. 18 месяцев - это просто начало исполнения.",
              why_wrong_uz:
                "Garchi muddat 18 oy bo'lsa-da (bu taktik hudud), mohiyat - sotib olish orqali yangi bozorga kirish - tabiatan strategikdir. 18 oylik ufq esa shunchaki bajarish qachon boshlanishidir.",
            },
            {
              key: "C",
              text_en: "Operational",
              text_ru: "Операционное",
              text_uz: "Operatsion",
              why_wrong_en:
                "Acquisition of a competitor is far above day-to-day operational scope.",
              why_wrong_ru:
                "Приобретение конкурента - далеко за пределами операционного уровня повседневных решений.",
              why_wrong_uz:
                "Raqobatchini sotib olish kundalik operatsion ko'lamdan ancha yuqori.",
            },
            {
              key: "D",
              text_en: "Routine",
              text_ru: "Рутинное",
              text_uz: "Oddiy",
              why_wrong_en:
                "Acquisitions are by definition not routine; they involve significant strategic and financial commitment.",
              why_wrong_ru:
                "Приобретения по определению не рутинные; они связаны со значительными стратегическими и финансовыми обязательствами.",
              why_wrong_uz:
                "Sotib olishlar ta'rifan oddiy emas; ular sezilarli strategik va moliyaviy majburiyatni o'z ichiga oladi.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Planning level is determined by SUBSTANCE more than purely by time horizon. Acquisition of a competitor to enter a new market reshapes the organisation's competitive position \u2014 that's the definition of strategic. The 18-month timeline is the implementation runway, not the decision's character. Distinguishing carefully matters: an exam trap is to classify by calendar time alone, treating \"less than 3 years\" as automatically tactical.",
          explanation_ru:
            "Уровень планирования определяется СУЩНОСТЬЮ, а не только горизонтом времени. Приобретение конкурента для выхода на новый рынок перекраивает конкурентное положение организации - это и есть определение стратегического. 18 месяцев - это срок реализации, а не природа решения. Различать важно: экзаменационная ловушка - классифицировать только по календарю, относя «меньше 3 лет» автоматически к тактическому.",
          explanation_uz:
            "Rejalashtirish darajasi sof vaqt ufqidan ko'ra MOHIYAT bilan belgilanadi. Yangi bozorga kirish uchun raqobatchini sotib olish tashkilotning raqobatdagi mavqeini qayta shakllantiradi - bu strategikning ta'rifidir. 18 oylik muddat - bu joriy etish yo'li, qarorning xarakteri emas. Ehtiyotkorlik bilan farqlash muhim: imtihon tuzog'i - faqat taqvim vaqti bo'yicha tasniflash, \"3 yildan kam\"ni avtomatik taktik deb hisoblashdir.",
        },
        // -------- Q13 - medium short_answer on data vs information --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "Which statement correctly distinguishes data from information?",
          prompt_ru: "Какое утверждение верно различает данные и информацию?",
          prompt_uz: "Qaysi bayonot ma'lumotni axborotdan to'g'ri farqlaydi?",
          options: [
            {
              key: "A",
              text_en:
                "Data are raw, unprocessed facts; information is data processed or organised to be useful for a decision",
              text_ru:
                "Данные - это необработанные факты; информация - это данные, обработанные или организованные так, чтобы быть полезными для решения",
              text_uz:
                "Ma'lumotlar - xom, qayta ishlanmagan faktlar; axborot esa qaror uchun foydali bo'lishi uchun qayta ishlangan yoki tartibga solingan ma'lumotdir",
            },
            {
              key: "B",
              text_en: "Data is always numeric; information is always text",
              text_ru: "Данные всегда числовые; информация всегда текстовая",
              text_uz: "Ma'lumot har doim raqamli; axborot har doim matnli",
              why_wrong_en:
                "The distinction is about processing for usefulness, not data format - both data and information can be numeric or textual.",
              why_wrong_ru:
                "Различие в обработке ради полезности, а не в формате - и данные, и информация могут быть числовыми или текстовыми.",
              why_wrong_uz:
                "Farq foydalilik uchun qayta ishlash haqida, ma'lumot formati haqida emas - ma'lumot ham, axborot ham raqamli yoki matnli bo'lishi mumkin.",
            },
            {
              key: "C",
              text_en: "Information is raw facts; data is the processed result",
              text_ru:
                "Информация - это сырые факты; данные - обработанный результат",
              text_uz:
                "Axborot - xom faktlar; ma'lumot - qayta ishlangan natija",
              why_wrong_en:
                "This reverses the definitions: data are the raw facts, and information is the processed, useful result.",
              why_wrong_ru:
                "Это меняет определения местами: данные - сырые факты, а информация - обработанный, полезный результат.",
              why_wrong_uz:
                "Bu ta'riflarni teskari qiladi: ma'lumotlar - xom faktlar, axborot esa qayta ishlangan, foydali natijadir.",
            },
            {
              key: "D",
              text_en: "Data and information mean the same thing",
              text_ru: "Данные и информация означают одно и то же",
              text_uz: "Ma'lumot va axborot bir xil narsani anglatadi",
              why_wrong_en:
                "They are distinct: information is data that has been processed or organised to support a decision.",
              why_wrong_ru:
                "Это разные понятия: информация - это данные, обработанные или организованные для поддержки решения.",
              why_wrong_uz:
                "Ular farqli: axborot - qarorni qo'llab-quvvatlash uchun qayta ishlangan yoki tartibga solingan ma'lumotdir.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            'The shorthand is "information = processed data". A list of every transaction in May is data; a summary chart of May sales by region is information - the same underlying facts at a different level of processing.',
          explanation_ru:
            "Кратко: «информация = обработанные данные». Список всех операций за май - это данные; сводная диаграмма продаж за май по регионам - это информация: те же исходные факты на другом уровне обработки.",
          explanation_uz:
            "Qisqacha aytganda \"axborot = qayta ishlangan ma'lumot\". Maydagi har bir operatsiya ro'yxati - bu ma'lumot; mintaqa bo'yicha may sotuvining xulosa diagrammasi esa axborot - bir xil asosiy faktlar, ammo boshqa qayta ishlash darajasida.",
        },
        // -------- Q14 - hard MCQ on relevance vs completeness --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            "A pricing committee receives a 200-page report covering every aspect of every product line, including dozens of metrics unrelated to the pricing decision they must make. The report is technically accurate, fully complete, and arrives on time. The PRIMARY quality this report fails is:",
          prompt_ru:
            "Комитет по ценообразованию получает 200-страничный отчёт, охватывающий каждый аспект каждой продуктовой линии, включая десятки показателей, не относящихся к решению о ценах. Отчёт технически точен, полон и поступил вовремя. Какому критерию ACCURATE он в ПЕРВУЮ ОЧЕРЕДЬ не соответствует?",
          prompt_uz:
            "Narx qo'mitasi ular qabul qilishi kerak bo'lgan narx qaroriga aloqasi yo'q o'nlab ko'rsatkichlarni o'z ichiga olgan, har bir mahsulot turkumining har bir jihatini qamrab oluvchi 200 sahifalik hisobotni oladi. Hisobot texnik jihatdan aniq, to'liq va o'z vaqtida keladi. Bu hisobot rioya qilmaydigan BIRINCHI sifat:",
          options: [
            {
              key: "A",
              text_en: "Accuracy",
              text_ru: "Точности",
              text_uz: "Aniqlik",
              why_wrong_en:
                "The scenario explicitly states the report is accurate \u2014 the numbers are right.",
              why_wrong_ru:
                "В сценарии прямо сказано, что отчёт точен - цифры верны.",
              why_wrong_uz:
                "Vaziyat hisobot aniq ekanini aniq aytadi - raqamlar to'g'ri.",
            },
            {
              key: "B",
              text_en: "Completeness",
              text_ru: "Полноты",
              text_uz: "To'liqlik",
              why_wrong_en:
                "The scenario states the report is fully complete; if anything it's OVER-complete.",
              why_wrong_ru:
                "В сценарии указано, что отчёт полон; если что, он СВЕРХ-полон.",
              why_wrong_uz:
                "Vaziyat hisobot to'liq ekanini aytadi; agar nimadir bo'lsa, u HADDAN tashqari to'liq.",
            },
            {
              key: "C",
              text_en: "Relevance (and Easy-to-use)",
              text_ru: "Релевантности (и удобства использования)",
              text_uz: "Tegishlilik (va Foydalanish osonligi)",
            },
            {
              key: "D",
              text_en: "Timeliness",
              text_ru: "Своевременности",
              text_uz: "O'z vaqtidalik",
              why_wrong_en: "The scenario states the report arrives on time.",
              why_wrong_ru: "В сценарии указано, что отчёт поступает вовремя.",
              why_wrong_uz: "Vaziyat hisobot o'z vaqtida kelishini aytadi.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            'More information is not always better information. Relevance asks whether what the user receives bears on the decision they must make; Easy-to-use asks whether it can be processed without struggling. A 200-page report packed with unrelated metrics drowns the pricing signal in noise: relevant details are buried, decision-makers waste time, and key trade-offs may go unspotted. "Over-disclosure" is a real failure mode \u2014 information overload reduces the value of the genuine signal. This question deliberately tests whether students remember that ACCURATE qualities must ALL be present; failing even one breaks usefulness.',
          explanation_ru:
            "Больше информации не значит лучше. Релевантность - это про то, относится ли полученное к решению, которое надо принять; удобство использования - про то, можно ли обработать материал без мучений. 200-страничный отчёт с массой несвязанных метрик топит ценовой сигнал в шуме: важные детали прячутся, время решающих тратится впустую, ключевые компромиссы можно упустить. «Информационная перегрузка» - реальный режим отказа, снижающий ценность реального сигнала. Вопрос намеренно проверяет, помнит ли студент, что критерии ACCURATE должны выполняться ВСЕ: провал даже одного ломает полезность.",
          explanation_uz:
            "Ko'proq axborot har doim ham yaxshiroq axborot emas. Tegishlilik foydalanuvchi olgan narsa u qabul qilishi kerak bo'lgan qarorga aloqadormi deb so'raydi; Foydalanish osonligi esa uni qiynalmasdan qayta ishlash mumkinmi deb so'raydi. Aloqasi yo'q ko'rsatkichlar bilan to'la 200 sahifalik hisobot narx signalini shovqinda cho'ktiradi: tegishli tafsilotlar ko'milib qoladi, qaror qabul qiluvchilar vaqtni behuda sarflaydi va asosiy murosalar e'tibordan chetda qolishi mumkin. \"Ortiqcha oshkor qilish\" - haqiqiy nuqson rejimi: axborot ortiqchaligi haqiqiy signal qiymatini kamaytiradi. Bu savol talabalar ACCURATE sifatlari BARCHASI mavjud bo'lishi kerakligini eslab qolishini ataylab sinaydi; hatto bittasiga rioya qilmaslik foydalilikni buzadi.",
        },
        // -------- Q15 - hard MCQ on planning hierarchy edge case --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            "A board approves the long-term mission, but middle management consistently translates it into tactical plans that contradict the strategic frame, and operational managers then execute against the tactical plans. The MOST LIKELY consequence is:",
          prompt_ru:
            "Совет утверждает долгосрочную миссию, но средний звено стабильно переводит её в тактические планы, противоречащие стратегической рамке, а операционные руководители исполняют тактические планы. НАИБОЛЕЕ ВЕРОЯТНОЕ следствие:",
          prompt_uz:
            "Kengash uzoq muddatli missiyani tasdiqlaydi, ammo o'rta bo'g'in rahbariyati uni doimo strategik doiraga zid taktik rejalarga aylantiradi va operatsion menejerlar esa taktik rejalarga qarshi bajaradi. ENG EHTIMOLLI oqibat:",
          options: [
            {
              key: "A",
              text_en:
                "The organisation will achieve its strategic mission anyway because operational execution is strong",
              text_ru:
                "Организация всё равно достигнет стратегической миссии, потому что операционное исполнение сильное",
              text_uz:
                "Tashkilot baribir o'z strategik missiyasiga erishadi, chunki operatsion bajarish kuchli",
              why_wrong_en:
                "Strong execution of the wrong plan accelerates failure rather than fixing it; operational excellence amplifies whatever tactical direction it serves.",
              why_wrong_ru:
                "Сильное исполнение неправильного плана ускоряет провал, а не исправляет его; операционная безупречность лишь усиливает выбранное тактическое направление.",
              why_wrong_uz:
                "Noto'g'ri rejaning kuchli bajarilishi uni tuzatish o'rniga muvaffaqiyatsizlikni tezlashtiradi; operatsion mukammallik u xizmat qiladigan taktik yo'nalishni qanaqa bo'lsa shunaqa kuchaytiradi.",
            },
            {
              key: "B",
              text_en:
                "Day-to-day operations may run efficiently, but the strategy will not be achieved \u2014 because the cascade is broken at the tactical layer",
              text_ru:
                "Повседневные операции могут идти эффективно, но стратегия не будет достигнута, потому что каскад нарушен на тактическом уровне",
              text_uz:
                "Kundalik operatsiyalar samarali ishlashi mumkin, ammo strategiyaga erishilmaydi - chunki kaskad taktik qatlamda uzilgan",
            },
            {
              key: "C",
              text_en:
                "The mission will automatically be re-set to match the tactical plans",
              text_ru:
                "Миссия автоматически переустановится под тактические планы",
              text_uz:
                "Missiya avtomatik ravishda taktik rejalarga mos kelishi uchun qayta belgilanadi",
              why_wrong_en:
                "The mission isn't reset bottom-up; it is set by the board. Misalignment doesn't change the mission, just produces failure to achieve it.",
              why_wrong_ru:
                "Миссия не переустанавливается снизу вверх; её ставит совет. Рассогласование не меняет миссию, оно лишь приводит к провалу её достижения.",
              why_wrong_uz:
                "Missiya pastdan yuqoriga qayta belgilanmaydi; u kengash tomonidan belgilanadi. Nomuvofiqlik missiyani o'zgartirmaydi, faqat unga erishmaslikni keltirib chiqaradi.",
            },
            {
              key: "D",
              text_en:
                "Operational planning will be the level that absorbs the conflict and resolves it",
              text_ru:
                "Операционное планирование возьмёт конфликт на себя и разрешит его",
              text_uz:
                "Operatsion rejalashtirish ziddiyatni o'ziga singdirib, hal qiladigan daraja bo'ladi",
              why_wrong_en:
                "Operational managers execute what they're told tactically; they don't have the scope to override tactical or strategic levels.",
              why_wrong_ru:
                "Операционные руководители выполняют тактические указания; у них нет полномочий перекрывать тактический или стратегический уровни.",
              why_wrong_uz:
                "Operatsion menejerlar taktik jihatdan aytilgan narsani bajaradi; ularda taktik yoki strategik darajalardan ustun kelish ko'lami yo'q.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            'The three-level planning hierarchy works as a cascade: strategic → tactical → operational, each level constrained by the one above. The whole system fails when ANY link breaks. Here the strategic frame exists but the tactical layer is not translating it faithfully \u2014 so however well operations execute, they are executing against the wrong plan. This is a common real-world pathology: efficiency without effectiveness. "Doing the wrong things well." It also illustrates why strategic-tactical alignment is a measurable management process, not just a slogan.',
          explanation_ru:
            "Трёхуровневая иерархия планирования работает как каскад: стратегическое → тактическое → операционное, каждый уровень ограничен предыдущим. Вся система проваливается, когда РАЗРЫВАЕТСЯ ЛЮБОЕ звено. Здесь стратегическая рамка существует, но тактический слой не переводит её честно - поэтому, как бы хорошо ни шла операционка, она исполняет неправильный план. Это распространённая реальная патология: эффективность без результативности. «Хорошо делать не то». Она же объясняет, почему согласование стратегии и тактики - измеряемый управленческий процесс, а не лозунг.",
          explanation_uz:
            "Uch darajali rejalashtirish ierarxiyasi kaskad sifatida ishlaydi: strategik -> taktik -> operatsion, har bir daraja yuqoridagisi bilan cheklangan. Butun tizim HAR QANDAY bo'g'in uzilganda barbod bo'ladi. Bu yerda strategik doira mavjud, ammo taktik qatlam uni sodiqona aylantirmaydi - shuning uchun operatsiyalar qanchalik yaxshi bajarilmasin, ular noto'g'ri rejaga qarshi bajarmoqda. Bu keng tarqalgan real patologiya: samaradorliksiz unumdorlik. \"Noto'g'ri ishlarni yaxshi qilish.\" U shuningdek strategik-taktik moslik shunchaki shior emas, o'lchanadigan boshqaruv jarayoni ekanini ko'rsatadi.",
        },
      ],
    },

    // ---------- B ----------
    {
      code: "B",
      title_en: "Data analysis and statistical techniques",
      title_ru: "Анализ данных и статистические методы",
      title_uz: "Ma'lumotlar tahlili va statistik usullar",
      description_en:
        "Sampling, high-low method, regression, time series, index numbers, big data, expected values, and spreadsheets.",
      description_ru:
        "Выборки, метод high-low, регрессия, временные ряды, индексы, большие данные, ожидаемые значения и таблицы.",
      description_uz:
        "Tanlab olish (sampling), yuqori-past usuli, regressiya, vaqt qatorlari, indeks raqamlari, katta ma'lumotlar (big data), kutilgan qiymatlar va elektron jadvallar.",
      sort_order: 20,
      theory_en:
        "Sampling methods differ in how the sample is chosen. Random sampling gives every unit equal chance; systematic picks every nth unit; stratified divides the population into strata and samples each proportionally; cluster samples whole groups; quota fills predefined category counts; multistage combines methods. Choice depends on population structure and cost.\n\n" +
        "Cost behaviour is separated into fixed and variable elements using the high-low method. Take the highest and lowest activity points; variable cost per unit = (cost at high \u2212 cost at low) / (units at high \u2212 units at low); fixed cost = total cost at either point \u2212 (variable cost \u00d7 that point's units). It assumes linearity and is sensitive to outliers; more rigorous separation uses linear regression. Regression produces the line y = a + bx, where b is the slope (variable cost per unit) and a is the intercept (fixed cost). The correlation coefficient r (between \u22121 and +1) measures strength of linear relationship; the coefficient of determination r\u00b2 gives the share of variation explained by the model.\n\n" +
        "Time series analysis decomposes data into trend (long-term direction), seasonal variation (regular cycle within a year), cyclical variation (longer business cycles), and random/residual variation. Forecasts use moving averages to smooth out short-term fluctuation, then add back seasonal components \u2014 additive (constant amounts) or multiplicative (percentage of trend).\n\n" +
        "Index numbers express values relative to a base period set to 100. Simple indices track one item; weighted indices (Laspeyre uses base-period quantities; Paasche uses current-period quantities) combine many items.\n\n" +
        "Expected value = \u03a3 (probability \u00d7 outcome) \u2014 used to weight uncertain outcomes. Big Data is characterised by the five Vs: Volume, Velocity, Variety, Veracity, Value.",
      theory_ru:
        "Методы выборки различаются способом отбора. Случайная выборка даёт каждой единице равный шанс попасть в выборку; систематическая берёт каждую n-ю единицу; стратифицированная делит совокупность на страты и пропорционально выбирает из каждой; кластерная отбирает целые группы; квотная заполняет заранее заданные категории; многоступенчатая комбинирует методы. Выбор зависит от структуры совокупности и стоимости.\n\n" +
        "Поведение затрат разделяется на постоянную и переменную составляющие методом high-low. Берут точки максимальной и минимальной активности; переменные затраты на единицу = (затраты при максимуме − затраты при минимуме) / (объём при максимуме − объём при минимуме); постоянные затраты = общие затраты в любой из точек − (переменные затраты × объём в этой точке). Метод предполагает линейность и чувствителен к выбросам; более строгое разделение даёт линейная регрессия. Регрессия выдаёт прямую y = a + bx, где b - наклон (переменные затраты на единицу), a - отрезок (постоянные затраты). Коэффициент корреляции r (от −1 до +1) показывает силу линейной связи; коэффициент детерминации r² - долю объяснённой моделью вариации.\n\n" +
        "Анализ временных рядов раскладывает данные на тренд (долгосрочное направление), сезонную вариацию (регулярный цикл внутри года), циклическую вариацию (более длинные деловые циклы) и случайные/остаточные колебания. Прогноз использует скользящие средние для сглаживания краткосрочных колебаний, затем возвращает сезонные компоненты - аддитивно (постоянные суммы) или мультипликативно (процент от тренда).\n\n" +
        "Индексы выражают значения относительно базового периода, принятого за 100. Простые индексы отслеживают одну позицию; взвешенные индексы (Ласпейрес - на базе количеств базового периода; Пааше - на базе количеств текущего периода) агрегируют несколько позиций.\n\n" +
        "Ожидаемое значение = Σ (вероятность × исход) - используется для взвешивания неопределённых исходов. Большие данные характеризуются пятью V: Volume (объём), Velocity (скорость), Variety (разнообразие), Veracity (достоверность), Value (ценность).",
      theory_uz:
        "Tanlab olish usullari namuna qanday tanlanishida farq qiladi. Tasodifiy tanlash har bir birlikka teng imkoniyat beradi; tizimli tanlash har n-chi birlikni oladi; qatlamli tanlash populyatsiyani qatlamlarga bo'lib, har birini mutanosib ravishda tanlaydi; klaster tanlash butun guruhlarni tanlaydi; kvota tanlash oldindan belgilangan toifa sonlarini to'ldiradi; ko'p bosqichli tanlash usullarni birlashtiradi. Tanlov populyatsiya tuzilishi va xarajatga bog'liq.\n\nXarajat xatti-harakati yuqori-past usuli yordamida o'zgarmas va o'zgaruvchan elementlarga ajratiladi. Eng yuqori va eng past faollik nuqtalarini oling; birlik uchun o'zgaruvchan xarajat = (yuqoridagi xarajat - pastdagi xarajat) / (yuqoridagi birliklar - pastdagi birliklar); o'zgarmas xarajat = istalgan nuqtadagi umumiy xarajat - (o'zgaruvchan xarajat x o'sha nuqtaning birliklari). U chiziqlilikni taxmin qiladi va chetki qiymatlarga (outliers) sezgir; qat'iyroq ajratish chiziqli regressiyadan foydalanadi. Regressiya y = a + bx chizig'ini hosil qiladi, bu yerda b - qiyalik (birlik uchun o'zgaruvchan xarajat), a esa kesishma (o'zgarmas xarajat). Korrelyatsiya koeffitsienti r (-1 va +1 oralig'ida) chiziqli munosabat kuchini o'lchaydi; aniqlik koeffitsienti r kvadrat model tushuntiradigan o'zgarish ulushini beradi.\n\nVaqt qatorlari tahlili ma'lumotni trend (uzoq muddatli yo'nalish), mavsumiy o'zgarish (yil ichidagi muntazam sikl), siklik o'zgarish (uzunroq biznes sikllari) va tasodifiy/qoldiq o'zgarishga ajratadi. Prognozlar qisqa muddatli tebranishni silliqlash uchun harakatlanuvchi o'rtachalardan foydalanadi, so'ng mavsumiy komponentlarni qaytarib qo'shadi - additiv (o'zgarmas miqdorlar) yoki multiplikativ (trend foizi).\n\nIndeks raqamlari qiymatlarni 100 ga o'rnatilgan baza davriga nisbatan ifodalaydi. Oddiy indekslar bitta narsani kuzatadi; vaznli indekslar (Laspeyre baza davri miqdorlaridan foydalanadi; Paasche joriy davr miqdorlaridan foydalanadi) ko'plab narsalarni birlashtiradi.\n\nKutilgan qiymat = yig'indi (ehtimollik x natija) - noaniq natijalarni vaznlash uchun ishlatiladi. Katta ma'lumotlar (Big Data) beshta V bilan tavsiflanadi: Hajm (Volume), Tezlik (Velocity), Xilma-xillik (Variety), Haqqoniylik (Veracity), Qiymat (Value).",
      questions: [
        // -------- Q1 - easy MCQ on sampling --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "A researcher divides a population of factory workers into groups by department, then samples a proportion from each. This is which sampling method?",
          prompt_ru:
            "Исследователь делит совокупность работников завода на группы по отделам и затем берёт пропорциональную выборку из каждого. Какой это метод выборки?",
          prompt_uz:
            "Tadqiqotchi zavod ishchilari populyatsiyasini bo'limlar bo'yicha guruhlarga bo'ladi, so'ng har biridan ulushni tanlaydi. Bu qaysi tanlab olish usuli?",
          options: [
            {
              key: "A",
              text_en: "Random",
              text_ru: "Случайная",
              text_uz: "Tasodifiy",
              why_wrong_en:
                "Pure random sampling does NOT use sub-groups; every unit has equal chance regardless of group membership.",
              why_wrong_ru:
                "Чисто случайная выборка НЕ использует подгруппы; каждая единица имеет равный шанс независимо от принадлежности к группе.",
              why_wrong_uz:
                "Sof tasodifiy tanlash kichik guruhlardan FOYDALANMAYDI; har bir birlik guruhga mansubligidan qat'i nazar teng imkoniyatga ega.",
            },
            {
              key: "B",
              text_en: "Systematic",
              text_ru: "Систематическая",
              text_uz: "Tizimli",
              why_wrong_en:
                "Systematic sampling selects every nth unit from a list; it doesn't divide into groups first.",
              why_wrong_ru:
                "Систематическая выборка отбирает каждую n-ю единицу из списка; она не делит сначала на группы.",
              why_wrong_uz:
                "Tizimli tanlash ro'yxatdan har n-chi birlikni tanlaydi; u avval guruhlarga bo'lmaydi.",
            },
            {
              key: "C",
              text_en: "Stratified",
              text_ru: "Стратифицированная",
              text_uz: "Qatlamli",
            },
            {
              key: "D",
              text_en: "Cluster",
              text_ru: "Кластерная",
              text_uz: "Klaster",
              why_wrong_en:
                "Cluster sampling selects WHOLE groups (e.g. entire departments) randomly; stratified samples FROM EVERY group.",
              why_wrong_ru:
                "Кластерная выборка случайно отбирает ЦЕЛЫЕ группы (например, целые отделы); стратифицированная отбирает ИЗ КАЖДОЙ группы.",
              why_wrong_uz:
                "Klaster tanlash BUTUN guruhlarni (masalan, butun bo'limlarni) tasodifiy tanlaydi; qatlamli esa HAR BIR guruhdan tanlaydi.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "Stratified sampling divides the population into mutually exclusive strata (here, departments) and samples each proportionally to its size. It ensures every sub-group is represented, reducing the risk of accidentally over-sampling or missing a stratum that pure random sampling carries.",
          explanation_ru:
            "Стратифицированная выборка делит совокупность на непересекающиеся страты (здесь - отделы) и берёт из каждой пропорционально её размеру. Она гарантирует представленность каждой подгруппы, снижая риск случайной перепредставленности или пропуска страты, который несёт чисто случайная выборка.",
          explanation_uz:
            "Qatlamli tanlash populyatsiyani o'zaro istisno qiluvchi qatlamlarga (bu yerda bo'limlarga) bo'ladi va har birini o'lchamiga mutanosib ravishda tanlaydi. U har bir kichik guruhning ifodalanishini ta'minlaydi va sof tasodifiy tanlash olib keladigan qatlamni tasodifan ortiqcha tanlash yoki o'tkazib yuborish xavfini kamaytiradi.",
        },
        // -------- Q2 - easy MCQ on expected value formula --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en: "Expected value is calculated as:",
          prompt_ru: "Ожидаемое значение рассчитывается как:",
          prompt_uz: "Kutilgan qiymat quyidagicha hisoblanadi:",
          options: [
            {
              key: "A",
              text_en: "Σ (probability × outcome)",
              text_ru: "Σ (вероятность × исход)",
              text_uz: "Yig'indi (ehtimollik x natija)",
            },
            {
              key: "B",
              text_en:
                "Average of all possible outcomes ignoring probabilities",
              text_ru: "Среднее всех возможных исходов без учёта вероятностей",
              text_uz:
                "Ehtimolliklarni e'tiborga olmagan holda barcha mumkin natijalarning o'rtachasi",
              why_wrong_en:
                "A simple average treats all outcomes equally; expected value weights each by its probability.",
              why_wrong_ru:
                "Простое среднее учитывает все исходы одинаково; ожидаемое значение взвешивает каждый по вероятности.",
              why_wrong_uz:
                "Oddiy o'rtacha barcha natijalarga teng munosabatda bo'ladi; kutilgan qiymat esa har birini ehtimolligi bo'yicha vaznlaydi.",
            },
            {
              key: "C",
              text_en: "Most likely outcome only",
              text_ru: "Только наиболее вероятный исход",
              text_uz: "Faqat eng ehtimolli natija",
              why_wrong_en:
                "Picking the single most-likely outcome ignores all the others; EV uses the entire distribution.",
              why_wrong_ru:
                "Выбор одного наиболее вероятного исхода игнорирует все остальные; EV использует всё распределение.",
              why_wrong_uz:
                "Yagona eng ehtimolli natijani tanlash qolgan barchasini e'tiborsiz qoldiradi; EV butun taqsimotdan foydalanadi.",
            },
            {
              key: "D",
              text_en: "Worst-case outcome",
              text_ru: "Худший возможный исход",
              text_uz: "Eng yomon holatdagi natija",
              why_wrong_en:
                "Worst-case is a conservative decision rule, not the expected value.",
              why_wrong_ru:
                "Худший случай - это консервативное правило решения, а не ожидаемое значение.",
              why_wrong_uz:
                "Eng yomon holat - bu konservativ qaror qoidasi, kutilgan qiymat emas.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Expected value (EV) = Σ (probability × outcome). It is the probability-weighted average of all possible outcomes, used to compare uncertain alternatives. EV makes sense over many repetitions; for one-off decisions risk-aversion may push you to choose the lower-EV but safer alternative.",
          explanation_ru:
            "Ожидаемое значение (EV) = Σ (вероятность × исход). Это взвешенное по вероятности среднее всех возможных исходов, используемое для сравнения неопределённых альтернатив. EV имеет смысл при многократных повторениях; для разовых решений неприятие риска может склонить вас к более безопасной альтернативе с меньшим EV.",
          explanation_uz:
            "Kutilgan qiymat (EV) = yig'indi (ehtimollik x natija). U barcha mumkin bo'lgan natijalarning ehtimollikka vaznlangan o'rtachasi bo'lib, noaniq muqobillarni solishtirish uchun ishlatiladi. EV ko'plab takrorlanishlarda ma'noga ega; bir martalik qarorlar uchun xavfdan qochish sizni pastroq EVga ega, ammo xavfsizroq muqobilni tanlashga undashi mumkin.",
        },
        // -------- Q3 - easy short_answer on the 5 Vs --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "Which of the following is one of the five Vs that characterise Big Data?",
          prompt_ru:
            "Какой из перечисленных пунктов является одной из пяти «V», характеризующих большие данные?",
          prompt_uz:
            "Quyidagilardan qaysi biri Katta ma'lumotlarni tavsiflovchi beshta Vdan biri?",
          options: [
            {
              key: "A",
              text_en: "Velocity",
              text_ru: "Скорость (Velocity)",
              text_uz: "Tezlik (Velocity)",
            },
            {
              key: "B",
              text_en: "Visibility",
              text_ru: "Видимость",
              text_uz: "Ko'rinuvchanlik (Visibility)",
              why_wrong_en:
                "Visibility is not one of the five Vs; the five are Volume, Velocity, Variety, Veracity and Value.",
              why_wrong_ru:
                "Видимость не входит в пять «V»; это Volume, Velocity, Variety, Veracity и Value.",
              why_wrong_uz:
                "Ko'rinuvchanlik beshta Vdan biri emas; beshtasi - Hajm, Tezlik, Xilma-xillik, Haqqoniylik va Qiymat.",
            },
            {
              key: "C",
              text_en: "Validity",
              text_ru: "Валидность",
              text_uz: "Haqiqiylik (Validity)",
              why_wrong_en:
                "The recognised fourth V is Veracity (uncertainty/noise), not Validity.",
              why_wrong_ru:
                "Признанное четвёртое «V» - Veracity (неопределённость/шум), а не валидность.",
              why_wrong_uz:
                "Tan olingan to'rtinchi V - bu Haqqoniylik (Veracity, noaniqlik/shovqin), Haqiqiylik (Validity) emas.",
            },
            {
              key: "D",
              text_en: "Versatility",
              text_ru: "Универсальность",
              text_uz: "Ko'p qirralilik (Versatility)",
              why_wrong_en:
                "Versatility is not a Big Data V; the relevant variety-of-formats quality is Variety.",
              why_wrong_ru:
                "Универсальность не входит в «V» больших данных; за разнообразие форматов отвечает Variety.",
              why_wrong_uz:
                "Ko'p qirralilik Katta ma'lumotlar Vsi emas; tegishli formatlar xilma-xilligi sifati - bu Xilma-xillik (Variety).",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "The five Vs are Volume (too large for traditional tools), Velocity (data arrives in real time), Variety (structured + unstructured), Veracity (uncertainty/noise), and Value (must yield useful insight to justify cost).",
          explanation_ru:
            "Пять «V»: Volume (слишком велик для традиционных инструментов), Velocity (данные поступают в реальном времени), Variety (структурированные + неструктурированные), Veracity (неопределённость/шум) и Value (должны давать полезную ценность, оправдывающую затраты).",
          explanation_uz:
            "Beshta V: Hajm (an'anaviy vositalar uchun juda katta), Tezlik (ma'lumot real vaqtda keladi), Xilma-xillik (tuzilgan + tuzilmagan), Haqqoniylik (noaniqlik/shovqin) va Qiymat (xarajatni oqlash uchun foydali tushuncha bermog'i kerak).",
        },
        // -------- Q4 - easy MCQ on time series components --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "In time-series analysis, regular variation within a one-year cycle (e.g. higher ice cream sales every summer) is called:",
          prompt_ru:
            "В анализе временных рядов регулярные колебания в пределах годового цикла (например, рост продаж мороженого каждым летом) называются:",
          prompt_uz:
            "Vaqt qatorlari tahlilida bir yillik sikl ichidagi muntazam o'zgarish (masalan, har yozda muzqaymoq sotuvining oshishi) qanday ataladi:",
          options: [
            {
              key: "A",
              text_en: "Trend",
              text_ru: "Тренд",
              text_uz: "Trend",
              why_wrong_en:
                "Trend is the LONG-TERM direction over multiple years, not within-year repetition.",
              why_wrong_ru:
                "Тренд - это ДОЛГОСРОЧНОЕ направление за многие годы, а не внутригодовое повторение.",
              why_wrong_uz:
                "Trend - bir necha yil davomidagi UZOQ MUDDATLI yo'nalish, yil ichidagi takrorlanish emas.",
            },
            {
              key: "B",
              text_en: "Seasonal variation",
              text_ru: "Сезонная вариация",
              text_uz: "Mavsumiy o'zgarish",
            },
            {
              key: "C",
              text_en: "Cyclical variation",
              text_ru: "Циклическая вариация",
              text_uz: "Siklik o'zgarish",
              why_wrong_en:
                "Cyclical variation spans multi-year business cycles (e.g. 5-10 years); within-year patterns are seasonal.",
              why_wrong_ru:
                "Циклическая вариация охватывает многолетние деловые циклы (5-10 лет); внутригодовые повторы - сезонные.",
              why_wrong_uz:
                "Siklik o'zgarish ko'p yillik biznes sikllarini qamrab oladi (masalan, 5-10 yil); yil ichidagi naqshlar esa mavsumiydir.",
            },
            {
              key: "D",
              text_en: "Random variation",
              text_ru: "Случайная вариация",
              text_uz: "Tasodifiy o'zgarish",
              why_wrong_en:
                "Random variation is unpredictable noise without pattern; the question describes a regular, predictable pattern.",
              why_wrong_ru:
                "Случайная вариация - непредсказуемый шум без паттерна; в вопросе описан регулярный, предсказуемый паттерн.",
              why_wrong_uz:
                "Tasodifiy o'zgarish naqshsiz, oldindan aytib bo'lmaydigan shovqin; savol esa muntazam, oldindan aytsa bo'ladigan naqshni ta'riflaydi.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            'Time series decompose into four components: trend (long-term direction), SEASONAL (regular within-year cycle), cyclical (multi-year business cycle), and random (noise). The key cue for seasonal is "predictable, repeats within a year" \u2014 summer for ice cream, December for retail, Q4 for accountants.',
          explanation_ru:
            "Временные ряды раскладываются на четыре компонента: тренд (долгосрочное направление), СЕЗОННЫЙ (регулярный внутригодовой цикл), циклический (многолетний деловой цикл), случайный (шум). Ключевой признак сезонности: «предсказуемый, повторяется в пределах года» - лето для мороженого, декабрь для розницы, Q4 для бухгалтеров.",
          explanation_uz:
            "Vaqt qatorlari to'rt komponentga ajraladi: trend (uzoq muddatli yo'nalish), MAVSUMIY (yil ichidagi muntazam sikl), siklik (ko'p yillik biznes sikli) va tasodifiy (shovqin). Mavsumiy uchun asosiy belgi - \"oldindan aytsa bo'ladigan, yil ichida takrorlanadigan\" - muzqaymoq uchun yoz, chakana savdo uchun dekabr, buxgalterlar uchun 4-chorak.",
        },
        // -------- Q5 - medium NUMBER_ENTRY on high-low method --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "A company\u2019s production data shows: at 1,000 units total cost is $7,000; at 4,000 units total cost is $13,000. Using the high-low method, what is the VARIABLE COST PER UNIT (in $)?",
          prompt_ru:
            "Производственные данные компании: при 1 000 единицах общие затраты $7 000; при 4 000 единицах общие затраты $13 000. По методу high-low какие ПЕРЕМЕННЫЕ ЗАТРАТЫ НА ЕДИНИЦУ (в $)?",
          prompt_uz:
            "Kompaniyaning ishlab chiqarish ma'lumotlari shuni ko'rsatadi: 1 000 birlikda umumiy xarajat 7 000 dollar; 4 000 birlikda umumiy xarajat 13 000 dollar. Yuqori-past usulidan foydalanib, BIRLIK UCHUN O'ZGARUVCHAN XARAJAT qancha (dollarda)?",
          correct_answer_en: "2",
          acceptable_tolerance: 0.01,
          explanation_en:
            "High-low method: variable cost per unit = (cost at high − cost at low) / (units at high − units at low) = (13,000 − 7,000) / (4,000 − 1,000) = 6,000 / 3,000 = $2 per unit. Then fixed cost = 13,000 − (2 × 4,000) = $5,000 (or equivalently 7,000 − 2 × 1,000 = 5,000). The cost equation is total cost = $5,000 + $2 × units.",
          explanation_ru:
            "Метод high-low: переменные затраты на единицу = (затраты при максимуме − затраты при минимуме) / (объём при максимуме − объём при минимуме) = (13 000 − 7 000) / (4 000 − 1 000) = 6 000 / 3 000 = $2 на единицу. Тогда постоянные затраты = 13 000 − (2 × 4 000) = $5 000 (или эквивалентно 7 000 − 2 × 1 000 = 5 000). Уравнение затрат: общие = $5 000 + $2 × количество.",
          explanation_uz:
            "Yuqori-past usuli: birlik uchun o'zgaruvchan xarajat = (yuqoridagi xarajat - pastdagi xarajat) / (yuqoridagi birliklar - pastdagi birliklar) = (13 000 - 7 000) / (4 000 - 1 000) = 6 000 / 3 000 = birlik uchun 2 dollar. So'ng o'zgarmas xarajat = 13 000 - (2 x 4 000) = 5 000 dollar (yoki teng ravishda 7 000 - 2 x 1 000 = 5 000). Xarajat tenglamasi: umumiy xarajat = 5 000 dollar + 2 dollar x birliklar.",
        },
        // -------- Q6 - medium NUMBER_ENTRY on high-low fixed cost --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "Using the same data (1,000 units \u2192 $7,000; 4,000 units \u2192 $13,000), what is the FIXED COST per period (in $)?",
          prompt_ru:
            "По тем же данным (1 000 ед. → $7 000; 4 000 ед. → $13 000) каковы ПОСТОЯННЫЕ ЗАТРАТЫ за период (в $)?",
          prompt_uz:
            "Xuddi shu ma'lumotdan foydalanib (1 000 birlik -> 7 000 dollar; 4 000 birlik -> 13 000 dollar), bir davrdagi O'ZGARMAS XARAJAT qancha (dollarda)?",
          correct_answer_en: "5000",
          acceptable_tolerance: 1,
          explanation_en:
            "Variable cost per unit was calculated as $2. Substitute into either point: fixed cost = total cost at point − (variable per unit × units at point). Using the high point: 13,000 − (2 × 4,000) = 13,000 − 8,000 = $5,000. Cross-check with the low point: 7,000 − (2 × 1,000) = 7,000 − 2,000 = $5,000. Both points give the same answer when the data is consistent \u2014 a quick sanity check.",
          explanation_ru:
            "Переменные затраты на единицу = $2. Подставляем в любую точку: постоянные = общие в точке − (переменные на единицу × объём в точке). По верхней точке: 13 000 − (2 × 4 000) = 13 000 − 8 000 = $5 000. Проверка по нижней точке: 7 000 − (2 × 1 000) = 7 000 − 2 000 = $5 000. Обе точки дают тот же ответ при согласованных данных - быстрая проверка.",
          explanation_uz:
            "Birlik uchun o'zgaruvchan xarajat 2 dollar deb hisoblandi. Istalgan nuqtaga qo'ying: o'zgarmas xarajat = nuqtadagi umumiy xarajat - (birlik uchun o'zgaruvchan x nuqtadagi birliklar). Yuqori nuqtadan foydalanib: 13 000 - (2 x 4 000) = 13 000 - 8 000 = 5 000 dollar. Past nuqta bilan tekshiring: 7 000 - (2 x 1 000) = 7 000 - 2 000 = 5 000 dollar. Ma'lumot izchil bo'lganda ikkala nuqta ham bir xil javob beradi - tezkor tekshiruv.",
        },
        // -------- Q7 - medium MCQ on r² interpretation --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A regression of monthly sales on advertising spend yields r\u00b2 = 0.81. The MOST accurate interpretation is:",
          prompt_ru:
            "Регрессия ежемесячных продаж по рекламным затратам даёт r² = 0,81. НАИБОЛЕЕ точная интерпретация:",
          prompt_uz:
            "Oylik sotuvning reklama xarajatiga regressiyasi r kvadrat = 0,81 ni beradi. ENG aniq talqin:",
          options: [
            {
              key: "A",
              text_en: "Advertising spend causes 81% of sales",
              text_ru: "Рекламные затраты вызывают 81% продаж",
              text_uz: "Reklama xarajati sotuvning 81% ga sabab bo'ladi",
              why_wrong_en:
                "r\u00b2 measures CORRELATION, not causation; high r\u00b2 does not prove that advertising caused the sales.",
              why_wrong_ru:
                "r² измеряет КОРРЕЛЯЦИЮ, а не причинность; высокий r² не доказывает, что реклама ВЫЗВАЛА продажи.",
              why_wrong_uz:
                "r kvadrat sababiyatni emas, KORRELYATSIYAni o'lchaydi; yuqori r kvadrat reklama sotuvga sabab bo'lganini isbotlamaydi.",
            },
            {
              key: "B",
              text_en:
                "81% of the variation in sales is explained by the linear relationship with advertising spend",
              text_ru:
                "81% вариации продаж объясняется линейной связью с рекламными затратами",
              text_uz:
                "Sotuvdagi o'zgarishning 81% reklama xarajati bilan chiziqli munosabat orqali tushuntiriladi",
            },
            {
              key: "C",
              text_en: "For every $1 of advertising, sales rise by $0.81",
              text_ru: "На каждый $1 рекламы продажи растут на $0,81",
              text_uz: "Har 1 dollar reklama uchun sotuv 0,81 dollarga oshadi",
              why_wrong_en:
                "That interpretation belongs to the slope coefficient b, not r\u00b2.",
              why_wrong_ru:
                "Такая интерпретация относится к коэффициенту наклона b, а не к r².",
              why_wrong_uz:
                "Bu talqin r kvadratga emas, qiyalik koeffitsienti bga tegishli.",
            },
            {
              key: "D",
              text_en: "There is an 81% probability the regression is correct",
              text_ru: "Вероятность правильности регрессии 81%",
              text_uz: "Regressiya to'g'ri bo'lish ehtimoli 81%",
              why_wrong_en:
                'r\u00b2 is not a probability; it measures explained variation, not "correctness".',
              why_wrong_ru:
                "r² не является вероятностью; он измеряет долю объяснённой вариации, а не «правильность».",
              why_wrong_uz:
                "r kvadrat ehtimollik emas; u \"to'g'rilik\"ni emas, tushuntirilgan o'zgarishni o'lchaydi.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "The coefficient of determination r\u00b2 is the share of variation in the dependent variable (sales) that is statistically explained by variation in the independent variable (advertising), assuming a linear relationship. r\u00b2 = 0.81 means 81% of the variability in sales co-moves with advertising; 19% remains unexplained by this model. Two important caveats: (1) correlation is not causation \u2014 advertising and sales could both be driven by something else (e.g. season); (2) high r\u00b2 doesn't mean the model will predict well outside the range of historical data.",
          explanation_ru:
            "Коэффициент детерминации r² - доля вариации зависимой переменной (продажи), статистически объясняемая вариацией независимой (реклама) при допущении о линейной связи. r² = 0,81 означает, что 81% изменчивости продаж сонаправлено меняется с рекламой; 19% остаются необъяснёнными этой моделью. Две важные оговорки: (1) корреляция не есть причинность - и реклама, и продажи могут зависеть от третьего фактора (например, сезона); (2) высокое r² не гарантирует точного прогноза за пределами исторических данных.",
          explanation_uz:
            "Aniqlik koeffitsienti r kvadrat - chiziqli munosabatni taxmin qilgan holda, bog'liq o'zgaruvchidagi (sotuv) o'zgarishning mustaqil o'zgaruvchidagi (reklama) o'zgarish bilan statistik tushuntiriladigan ulushidir. r kvadrat = 0,81 sotuvdagi o'zgaruvchanlikning 81% reklama bilan birga harakatlanishini bildiradi; 19% bu model tomonidan tushuntirilmagan qoladi. Ikki muhim ogohlantirish: (1) korrelyatsiya sababiyat emas - reklama va sotuv ikkalasi ham boshqa narsa (masalan, mavsum) tomonidan harakatlantirilishi mumkin; (2) yuqori r kvadrat model tarixiy ma'lumotlar diapazonidan tashqarida yaxshi bashorat qilishini anglatmaydi.",
        },
        // -------- Q8 - medium NUMBER_ENTRY on expected value --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "A project has three possible outcomes: profit of $100,000 with probability 0.5; profit of $20,000 with probability 0.3; loss of $40,000 with probability 0.2. What is the EXPECTED VALUE of profit (in $)?",
          prompt_ru:
            "У проекта три возможных исхода: прибыль $100 000 с вероятностью 0,5; прибыль $20 000 с вероятностью 0,3; убыток $40 000 с вероятностью 0,2. Каково ОЖИДАЕМОЕ ЗНАЧЕНИЕ прибыли (в $)?",
          prompt_uz:
            "Loyihaning uchta mumkin natijasi bor: 0,5 ehtimollik bilan 100 000 dollar foyda; 0,3 ehtimollik bilan 20 000 dollar foyda; 0,2 ehtimollik bilan 40 000 dollar zarar. Foydaning KUTILGAN QIYMATI qancha (dollarda)?",
          correct_answer_en: "48000",
          acceptable_tolerance: 1,
          explanation_en:
            "EV = Σ (probability × outcome) = (0.5 × 100,000) + (0.3 × 20,000) + (0.2 × −40,000) = 50,000 + 6,000 − 8,000 = $48,000. Note the loss enters as negative. Probabilities must sum to 1.0 (here 0.5 + 0.3 + 0.2 = 1.0). EV is what you would average IF you ran this scenario many times; a single outcome could still be a $40,000 loss.",
          explanation_ru:
            "EV = Σ (вероятность × исход) = (0,5 × 100 000) + (0,3 × 20 000) + (0,2 × −40 000) = 50 000 + 6 000 − 8 000 = $48 000. Убыток входит с отрицательным знаком. Вероятности должны суммироваться до 1,0 (здесь 0,5 + 0,3 + 0,2 = 1,0). EV - это то, что получится в среднем при многократном повторении сценария; разовый результат может оказаться убытком в $40 000.",
          explanation_uz:
            "EV = yig'indi (ehtimollik x natija) = (0,5 x 100 000) + (0,3 x 20 000) + (0,2 x -40 000) = 50 000 + 6 000 - 8 000 = 48 000 dollar. E'tibor bering, zarar manfiy sifatida kiradi. Ehtimolliklar yig'indisi 1,0 bo'lishi kerak (bu yerda 0,5 + 0,3 + 0,2 = 1,0). EV - bu vaziyatni ko'p marta ishlatsangiz o'rtacha qancha bo'lishi; yagona natija hamon 40 000 dollar zarar bo'lishi mumkin.",
        },
        // -------- Q9 - medium MCQ on Laspeyre vs Paasche --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A Laspeyre price index differs from a Paasche price index in that:",
          prompt_ru:
            "Индекс цен Ласпейреса отличается от индекса Пааше тем, что:",
          prompt_uz:
            "Laspeyre narx indeksi Paasche narx indeksidan quyidagisi bilan farq qiladi:",
          options: [
            {
              key: "A",
              text_en:
                "Laspeyre uses BASE-period quantities as weights; Paasche uses CURRENT-period quantities",
              text_ru:
                "Ласпейрес использует количества БАЗОВОГО периода как веса; Пааше - количества ТЕКУЩЕГО периода",
              text_uz:
                "Laspeyre vazn sifatida BAZA davri miqdorlaridan foydalanadi; Paasche esa JORIY davr miqdorlaridan",
            },
            {
              key: "B",
              text_en: "Laspeyre is for prices; Paasche is for quantities",
              text_ru: "Ласпейрес для цен, Пааше для количеств",
              text_uz: "Laspeyre narxlar uchun; Paasche miqdorlar uchun",
              why_wrong_en:
                "Both are PRICE indices in this comparison; they differ in their weighting basis, not in what they measure.",
              why_wrong_ru:
                "В этом сравнении оба - индексы ЦЕН; они различаются базой взвешивания, а не тем, что измеряют.",
              why_wrong_uz:
                "Bu taqqoslashda ikkalasi ham NARX indekslari; ular nimani o'lchashida emas, vaznlash asosida farq qiladi.",
            },
            {
              key: "C",
              text_en:
                "Laspeyre updates quantities every period; Paasche freezes them",
              text_ru:
                "Ласпейрес обновляет количества каждый период; Пааше их фиксирует",
              text_uz:
                "Laspeyre miqdorlarni har davrda yangilaydi; Paasche ularni muzlatadi",
              why_wrong_en:
                "The reverse: Laspeyre FREEZES base-period quantities; Paasche UPDATES to current.",
              why_wrong_ru:
                "Наоборот: Ласпейрес ФИКСИРУЕТ количества базового периода; Пааше ОБНОВЛЯЕТ до текущих.",
              why_wrong_uz:
                "Aksincha: Laspeyre baza davri miqdorlarini MUZLATADI; Paasche esa joriyga YANGILAYDI.",
            },
            {
              key: "D",
              text_en:
                "Laspeyre and Paasche are identical when applied correctly",
              text_ru: "Ласпейрес и Пааше идентичны при правильном применении",
              text_uz: "Laspeyre va Paasche to'g'ri qo'llanganda bir xil",
              why_wrong_en:
                "They typically give DIFFERENT results precisely because they use different weights.",
              why_wrong_ru:
                "Они обычно дают РАЗНЫЕ результаты именно потому, что используют разные веса.",
              why_wrong_uz:
                "Ular odatda TURLI natija beradi, aynan turli vaznlardan foydalangani uchun.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            'Both are weighted price indices, but they use different baskets of goods. Laspeyre uses the BASE-period basket (fixed quantities, easier to compute, may overstate inflation as consumers substitute away from items getting more expensive). Paasche uses the CURRENT-period basket (updated quantities, more reflective of current spending patterns, may understate inflation). In practice the "true" cost of living lies somewhere between Laspeyre and Paasche \u2014 the Fisher index averages them.',
          explanation_ru:
            "Оба - взвешенные индексы цен, но используют разные корзины. Ласпейрес - корзина БАЗОВОГО периода (фиксированные количества, проще считать, может завышать инфляцию, так как потребители уходят от подорожавших товаров). Пааше - корзина ТЕКУЩЕГО периода (обновлённые количества, лучше отражает текущие траты, может занижать инфляцию). На практике «истинная» стоимость жизни - между Ласпейресом и Пааше; индекс Фишера усредняет их.",
          explanation_uz:
            "Ikkalasi ham vaznli narx indekslari, ammo ular turli tovarlar savatidan foydalanadi. Laspeyre BAZA davri savatidan foydalanadi (o'zgarmas miqdorlar, hisoblash osonroq, iste'molchilar qimmatlashayotgan narsalardan voz kechgani sababli inflyatsiyani oshirib ko'rsatishi mumkin). Paasche JORIY davr savatidan foydalanadi (yangilangan miqdorlar, joriy sarflash naqshlarini ko'proq aks ettiradi, inflyatsiyani kam ko'rsatishi mumkin). Amalda \"haqiqiy\" yashash narxi Laspeyre va Paasche o'rtasida yotadi - Fisher indeksi ularni o'rtachalaydi.",
        },
        // -------- Q10 - medium NUMBER_ENTRY on simple index --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "A product price was $40 in the base period and $52 in the current period. What is the simple price INDEX for the current period (base = 100)?",
          prompt_ru:
            "Цена товара в базовом периоде была $40, в текущем - $52. Каков простой индекс цен для текущего периода (база = 100)?",
          prompt_uz:
            "Mahsulot narxi baza davrida 40 dollar, joriy davrda 52 dollar edi. Joriy davr uchun oddiy narx INDEKSI qancha (baza = 100)?",
          correct_answer_en: "130",
          acceptable_tolerance: 0.5,
          explanation_en:
            "Simple index = (current value / base value) × 100 = (52 / 40) × 100 = 1.3 × 100 = 130. Interpretation: the price has risen 30% above the base. An index of 100 means no change; above 100 means increase; below 100 means decrease.",
          explanation_ru:
            "Простой индекс = (текущее значение / базовое значение) × 100 = (52 / 40) × 100 = 1,3 × 100 = 130. Интерпретация: цена выросла на 30% относительно базы. Индекс 100 - нет изменений; выше 100 - рост; ниже 100 - снижение.",
          explanation_uz:
            "Oddiy indeks = (joriy qiymat / baza qiymat) x 100 = (52 / 40) x 100 = 1,3 x 100 = 130. Talqin: narx bazadan 30% oshgan. 100 indeksi o'zgarish yo'qligini; 100 dan yuqori oshishni; 100 dan past kamayishni bildiradi.",
        },
        // -------- Q11 - medium MCQ on moving average --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A moving average is used in time-series analysis primarily to:",
          prompt_ru:
            "Скользящее среднее используется в анализе временных рядов прежде всего для того, чтобы:",
          prompt_uz:
            "Harakatlanuvchi o'rtacha vaqt qatorlari tahlilida asosan quyidagi uchun ishlatiladi:",
          options: [
            {
              key: "A",
              text_en: "Increase the volatility of the data",
              text_ru: "Увеличить волатильность данных",
              text_uz: "Ma'lumotning o'zgaruvchanligini oshirish",
              why_wrong_en:
                "Moving averages SMOOTH data; they reduce visible volatility, not increase it.",
              why_wrong_ru:
                "Скользящие средние СГЛАЖИВАЮТ данные, уменьшая видимую волатильность, а не увеличивая.",
              why_wrong_uz:
                "Harakatlanuvchi o'rtachalar ma'lumotni SILLIQLAYDI; ular ko'rinadigan o'zgaruvchanlikni oshirmaydi, kamaytiradi.",
            },
            {
              key: "B",
              text_en:
                "Smooth out short-term fluctuations and reveal the underlying trend",
              text_ru:
                "Сгладить краткосрочные колебания и выявить базовый тренд",
              text_uz:
                "Qisqa muddatli tebranishlarni silliqlash va asosiy trendni ochib berish",
            },
            {
              key: "C",
              text_en: "Calculate the correlation coefficient",
              text_ru: "Рассчитать коэффициент корреляции",
              text_uz: "Korrelyatsiya koeffitsientini hisoblash",
              why_wrong_en:
                "Correlation is calculated separately; moving averages are a smoothing technique.",
              why_wrong_ru:
                "Корреляция рассчитывается отдельно; скользящие средние - это техника сглаживания.",
              why_wrong_uz:
                "Korrelyatsiya alohida hisoblanadi; harakatlanuvchi o'rtachalar - silliqlash usuli.",
            },
            {
              key: "D",
              text_en: "Replace seasonal effects with random ones",
              text_ru: "Заменить сезонные эффекты случайными",
              text_uz: "Mavsumiy ta'sirlarni tasodifiylar bilan almashtirish",
              why_wrong_en:
                "Moving averages aim to EXTRACT trend by averaging across seasonal patterns; they don't introduce randomness.",
              why_wrong_ru:
                "Скользящие средние стремятся ИЗВЛЕЧЬ тренд, усредняя по сезонам; они не вносят случайности.",
              why_wrong_uz:
                "Harakatlanuvchi o'rtachalar mavsumiy naqshlar bo'ylab o'rtachalash orqali trendni AJRATIB OLISHGA qaratilgan; ular tasodifiylik kiritmaydi.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "A moving average averages the most recent n periods to produce a smoothed series. If you use a span equal to the seasonal cycle (e.g. 4-quarter moving average for quarterly data), seasonal effects largely cancel out, leaving the trend visible. Once trend is isolated, the seasonal component can be derived as the consistent difference (additive model) or ratio (multiplicative model) between actual and trend.",
          explanation_ru:
            "Скользящее среднее усредняет последние n периодов, давая сглаженный ряд. Если взять окно, равное сезонному циклу (например, 4 квартала для квартальных данных), сезонные эффекты в основном гасят друг друга, оставляя видимым тренд. После выделения тренда сезонная составляющая определяется как постоянная разница (аддитивная модель) или отношение (мультипликативная модель) между фактическими данными и трендом.",
          explanation_uz:
            "Harakatlanuvchi o'rtacha so'nggi n davrni o'rtachalab silliqlangan qator hosil qiladi. Agar mavsumiy siklga teng oraliqdan foydalansangiz (masalan, choraklik ma'lumot uchun 4 choraklik harakatlanuvchi o'rtacha), mavsumiy ta'sirlar asosan o'zaro bekor bo'lib, trend ko'rinadigan bo'lib qoladi. Trend ajratilgach, mavsumiy komponent haqiqiy va trend o'rtasidagi izchil farq (additiv model) yoki nisbat (multiplikativ model) sifatida olinishi mumkin.",
        },
        // -------- Q12 - medium short_answer on correlation interpretation --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "Two variables have a correlation coefficient r = -0.92. How is this linear relationship best described?",
          prompt_ru:
            "У двух переменных коэффициент корреляции r = -0.92. Как лучше всего описать эту линейную связь?",
          prompt_uz:
            "Ikki o'zgaruvchining korrelyatsiya koeffitsienti r = -0,92. Bu chiziqli munosabat eng yaxshi qanday tavsiflanadi?",
          options: [
            {
              key: "A",
              text_en: "Strong and negative",
              text_ru: "Сильная и отрицательная",
              text_uz: "Kuchli va manfiy",
            },
            {
              key: "B",
              text_en: "Strong and positive",
              text_ru: "Сильная и положительная",
              text_uz: "Kuchli va musbat",
              why_wrong_en:
                "The sign is negative, so the variables move in OPPOSITE directions; a positive r would mean they move together.",
              why_wrong_ru:
                "Знак отрицательный, поэтому переменные движутся в ПРОТИВОПОЛОЖНЫХ направлениях; положительный r означал бы совместное движение.",
              why_wrong_uz:
                "Ishora manfiy, shuning uchun o'zgaruvchilar QARAMA-QARSHI yo'nalishda harakatlanadi; musbat r esa ular birga harakatlanishini bildirardi.",
            },
            {
              key: "C",
              text_en: "Weak and negative",
              text_ru: "Слабая и отрицательная",
              text_uz: "Zaif va manfiy",
              why_wrong_en:
                "|r| = 0.92 is close to 1, which is a STRONG relationship; weak would be |r| near 0.",
              why_wrong_ru:
                "|r| = 0.92 близко к 1 - это СИЛЬНАЯ связь; слабая была бы при |r| около 0.",
              why_wrong_uz:
                "|r| = 0,92 1 ga yaqin, bu KUCHLI munosabat; zaif esa |r| 0 ga yaqin bo'lardi.",
            },
            {
              key: "D",
              text_en: "No linear relationship",
              text_ru: "Линейной связи нет",
              text_uz: "Chiziqli munosabat yo'q",
              why_wrong_en:
                "No relationship corresponds to r near 0; r = -0.92 indicates a strong linear relationship.",
              why_wrong_ru:
                "Отсутствие связи соответствует r около 0; r = -0.92 указывает на сильную линейную связь.",
              why_wrong_uz:
                "Munosabat yo'qligi r 0 ga yaqin bo'lishiga to'g'ri keladi; r = -0,92 kuchli chiziqli munosabatni bildiradi.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "r ranges from -1 to +1. The sign gives direction (negative = variables move in opposite directions) and the magnitude gives strength (|r| close to 1 = strong). r = -0.92 is therefore a strong, negative linear relationship.",
          explanation_ru:
            "r изменяется от -1 до +1. Знак задаёт направление (отрицательный = переменные движутся в противоположные стороны), а величина - силу (|r| близко к 1 = сильная). Поэтому r = -0.92 - сильная отрицательная линейная связь.",
          explanation_uz:
            "r -1 dan +1 gacha o'zgaradi. Ishora yo'nalishni beradi (manfiy = o'zgaruvchilar qarama-qarshi yo'nalishda harakatlanadi), kattalik esa kuchni beradi (|r| 1 ga yaqin = kuchli). Demak, r = -0,92 kuchli, manfiy chiziqli munosabatdir.",
        },
        // -------- Q13 - medium MCQ on high-low weakness --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A key weakness of the high-low method for separating fixed and variable costs is that:",
          prompt_ru:
            "Ключевой недостаток метода high-low для разделения постоянных и переменных затрат состоит в том, что:",
          prompt_uz:
            "O'zgarmas va o'zgaruvchan xarajatlarni ajratishda yuqori-past usulining asosiy zaifligi shundaki:",
          options: [
            {
              key: "A",
              text_en: "It cannot be calculated by hand",
              text_ru: "Его нельзя посчитать вручную",
              text_uz: "Uni qo'lda hisoblab bo'lmaydi",
              why_wrong_en:
                "High-low is in fact one of the SIMPLEST methods to compute manually; that's its main appeal.",
              why_wrong_ru:
                "High-low - наоборот, ОДИН ИЗ ПРОСТЕЙШИХ методов для ручного расчёта; в этом его главное удобство.",
              why_wrong_uz:
                "Yuqori-past aslida qo'lda hisoblash uchun ENG ODDIY usullardan biridir; bu uning asosiy jozibasidir.",
            },
            {
              key: "B",
              text_en:
                "It uses only two data points (highest and lowest activity) and ignores all others, making it sensitive to outliers",
              text_ru:
                "Он использует только две точки данных (максимум и минимум по объёму), игнорируя все остальные, что делает его чувствительным к выбросам",
              text_uz:
                "U faqat ikkita ma'lumot nuqtasidan (eng yuqori va eng past faollik) foydalanadi va qolganlarini e'tiborsiz qoldiradi, bu uni chetki qiymatlarga sezgir qiladi",
            },
            {
              key: "C",
              text_en: "It produces non-linear cost equations",
              text_ru: "Он даёт нелинейные уравнения затрат",
              text_uz:
                "U chiziqli bo'lmagan xarajat tenglamalarini hosil qiladi",
              why_wrong_en:
                "High-low ASSUMES linearity; that's another simplification it makes, but it produces a linear equation, not a non-linear one.",
              why_wrong_ru:
                "High-low ПРЕДПОЛАГАЕТ линейность; это другое его упрощение, но уравнение получается линейным, а не нелинейным.",
              why_wrong_uz:
                "Yuqori-past chiziqlilikni TAXMIN qiladi; bu uning yana bir soddalashtirishi, ammo u chiziqli bo'lmagan emas, chiziqli tenglama hosil qiladi.",
            },
            {
              key: "D",
              text_en: "It requires knowing fixed costs in advance",
              text_ru: "Для него нужны заранее известные постоянные затраты",
              text_uz:
                "U o'zgarmas xarajatlarni oldindan bilishni talab qiladi",
              why_wrong_en:
                "High-low CALCULATES fixed costs from the data; nothing has to be known in advance.",
              why_wrong_ru:
                "High-low ВЫВОДИТ постоянные затраты из данных; ничего заранее знать не нужно.",
              why_wrong_uz:
                "Yuqori-past o'zgarmas xarajatlarni ma'lumotdan HISOBLAYDI; hech narsa oldindan bilinishi shart emas.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "High-low takes the extreme activity points and discards everything between. If either extreme happens to be an unusual month (a major one-off cost, a holiday closure), the cost equation will be skewed. Regression uses all available data and is far less sensitive. High-low remains useful as a quick estimate but should not be trusted for major decisions when more data is available.",
          explanation_ru:
            "High-low берёт крайние точки по объёму и отбрасывает всё между ними. Если любая из крайних точек оказывается нетипичным месяцем (крупные разовые затраты, праздничное закрытие), уравнение затрат будет смещено. Регрессия использует все доступные данные и гораздо менее чувствительна. High-low остаётся полезным для быстрой оценки, но не годится для крупных решений, когда есть больше данных.",
          explanation_uz:
            "Yuqori-past chetki faollik nuqtalarini oladi va orasidagi hamma narsani tashlab yuboradi. Agar chetlardan biri g'ayrioddiy oy bo'lib chiqsa (yirik bir martalik xarajat, ta'til uchun yopilish), xarajat tenglamasi qiyshayadi. Regressiya mavjud barcha ma'lumotdan foydalanadi va ancha kam sezgir. Yuqori-past tezkor baho sifatida foydali bo'lib qoladi, ammo ko'proq ma'lumot mavjud bo'lganda yirik qarorlar uchun ishonilmasligi kerak.",
        },
        // -------- Q14 - hard NUMBER_ENTRY on expected value with decision tree --------
        {
          type: "number_entry",
          difficulty: "hard",
          prompt_en:
            "A company is choosing between two projects. Project A: $80,000 profit with probability 0.6; $20,000 loss with probability 0.4. Project B: $50,000 profit with probability 0.7; $10,000 profit with probability 0.3. What is the EXPECTED VALUE of Project A MINUS the expected value of Project B (in $)?",
          prompt_ru:
            "Компания выбирает между двумя проектами. Проект A: прибыль $80 000 с вероятностью 0,6; убыток $20 000 с вероятностью 0,4. Проект B: прибыль $50 000 с вероятностью 0,7; прибыль $10 000 с вероятностью 0,3. Каково ОЖИДАЕМОЕ ЗНАЧЕНИЕ Проекта A МИНУС ожидаемое значение Проекта B (в $)?",
          prompt_uz:
            "Kompaniya ikkita loyiha orasidan tanlayapti. A loyihasi: 0,6 ehtimollik bilan 80 000 dollar foyda; 0,4 ehtimollik bilan 20 000 dollar zarar. B loyihasi: 0,7 ehtimollik bilan 50 000 dollar foyda; 0,3 ehtimollik bilan 10 000 dollar foyda. A loyihasining KUTILGAN QIYMATI MINUS B loyihasining kutilgan qiymati qancha (dollarda)?",
          correct_answer_en: "2000",
          acceptable_tolerance: 1,
          explanation_en:
            "Project A EV = (0.6 × 80,000) + (0.4 × −20,000) = 48,000 − 8,000 = $40,000. Project B EV = (0.7 × 50,000) + (0.3 × 10,000) = 35,000 + 3,000 = $38,000. Difference = 40,000 − 38,000 = $2,000. On EV alone, A is marginally preferred. But A has a 40% chance of a $20,000 LOSS, while B always returns at least $10,000 \u2014 a risk-averse decision-maker would likely choose B despite the lower EV. EV is one input to a decision, not the whole answer.",
          explanation_ru:
            "EV Проекта A = (0,6 × 80 000) + (0,4 × −20 000) = 48 000 − 8 000 = $40 000. EV Проекта B = (0,7 × 50 000) + (0,3 × 10 000) = 35 000 + 3 000 = $38 000. Разница = 40 000 − 38 000 = $2 000. Только по EV A немного предпочтительнее. Но у A 40% шанс УБЫТКА в $20 000, тогда как B всегда даёт минимум $10 000 - не склонный к риску руководитель, вероятно, выберет B вопреки меньшему EV. EV - один из входов в решение, а не весь ответ.",
          explanation_uz:
            "A loyihasi EV = (0,6 x 80 000) + (0,4 x -20 000) = 48 000 - 8 000 = 40 000 dollar. B loyihasi EV = (0,7 x 50 000) + (0,3 x 10 000) = 35 000 + 3 000 = 38 000 dollar. Farq = 40 000 - 38 000 = 2 000 dollar. Faqat EV bo'yicha A biroz afzalroq. Ammo A da 20 000 dollar ZARAR ehtimoli 40%, B esa har doim kamida 10 000 dollar qaytaradi - xavfdan qochuvchi qaror qabul qiluvchi pastroq EVga qaramay B ni tanlashi ehtimoli yuqori. EV - qarorga bitta kirish, butun javob emas.",
        },
        // -------- Q15 - hard MCQ on Big Data veracity --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            'An e-commerce firm captures clickstream data from 50 million daily users, including social media sentiment, behavioural patterns, and product images. Analysts note that about 12% of records contain bot traffic, scraping activity, or accidental duplicate sessions. The "V" of Big Data MOST DIRECTLY illustrated by this last finding is:',
          prompt_ru:
            'Компания электронной торговли собирает данные о кликах от 50 миллионов пользователей в день, включая социальные сигналы, поведенческие паттерны и изображения товаров. Аналитики отмечают, что около 12% записей содержат трафик ботов, скрапинговую активность или случайные дубликаты сессий. Какая из "V" больших данных НАИБОЛЕЕ НАПРЯМУЮ иллюстрируется этой последней находкой?',
          prompt_uz:
            "Elektron tijorat firmasi 50 million kunlik foydalanuvchidan klik oqimi (clickstream) ma'lumotini, jumladan ijtimoiy tarmoq kayfiyati, xulq-atvor naqshlari va mahsulot rasmlarini to'playdi. Tahlilchilar yozuvlarning taxminan 12% bot trafigi, skraping faoliyati yoki tasodifiy takroriy sessiyalarni o'z ichiga olishini ta'kidlaydi. Bu so'nggi natija ENG bevosita ko'rsatadigan Katta ma'lumotlar \"V\"si:",
          options: [
            {
              key: "A",
              text_en: "Volume",
              text_ru: "Volume (объём)",
              text_uz: "Hajm",
              why_wrong_en:
                "Volume describes the size of the data set (50m users); the 12% noise is a QUALITY issue, not a SIZE one.",
              why_wrong_ru:
                "Volume описывает размер набора (50 млн пользователей); 12% шума - это вопрос КАЧЕСТВА, а не РАЗМЕРА.",
              why_wrong_uz:
                "Hajm ma'lumotlar to'plamining o'lchamini (50 mln foydalanuvchi) ta'riflaydi; 12% shovqin esa SIFAT masalasi, O'LCHAM masalasi emas.",
            },
            {
              key: "B",
              text_en: "Velocity",
              text_ru: "Velocity (скорость)",
              text_uz: "Tezlik",
              why_wrong_en:
                "Velocity is about how fast data arrives (real-time vs batch); the question is about how trustworthy it is.",
              why_wrong_ru:
                "Velocity - это скорость поступления данных (реальное время vs пакетная обработка); вопрос - о доверии к данным.",
              why_wrong_uz:
                "Tezlik ma'lumot qanchalik tez kelishi haqida (real vaqt yoki to'plam); savol esa uning qanchalik ishonchli ekani haqida.",
            },
            {
              key: "C",
              text_en: "Variety",
              text_ru: "Variety (разнообразие)",
              text_uz: "Xilma-xillik",
              why_wrong_en:
                "Variety is about different data types (clickstream, social, images \u2014 those are the variety here); the noise issue is about something else.",
              why_wrong_ru:
                "Variety - это разные типы данных (клики, соцсети, изображения - это и есть variety здесь); вопрос про шум - о другом.",
              why_wrong_uz:
                "Xilma-xillik turli ma'lumot turlari haqida (klik oqimi, ijtimoiy, rasmlar - bu yerda xilma-xillik shu); shovqin masalasi esa boshqa narsa haqida.",
            },
            {
              key: "D",
              text_en: "Veracity",
              text_ru: "Veracity (достоверность)",
              text_uz: "Haqqoniylik",
            },
          ],
          correct_answer_en: "D",
          explanation_en:
            "Veracity captures uncertainty, noise, and trustworthiness in the data. Bot traffic, scraping, and duplicate sessions all create records that LOOK like genuine user behaviour but aren't \u2014 the data appears real but doesn't represent real human activity. Big-data pipelines must include cleaning, deduplication, and bot-filtering steps before analysis; ignoring veracity inflates engagement metrics, distorts segmentation, and can mislead pricing or product decisions. The five Vs are easy to confuse on first reading because they sound similar; the test is to ask \"what problem does this V describe?\" \u2014 Volume = too big, Velocity = too fast, Variety = too mixed, Veracity = unreliable, Value = is it worth the cost?",
          explanation_ru:
            'Veracity описывает неопределённость, шум и достоверность данных. Трафик ботов, скрапинг и дубликаты сессий создают записи, которые ВЫГЛЯДЯТ как реальное поведение, но таковыми не являются - данные кажутся настоящими, но не отражают реальную человеческую активность. Big-data конвейеры должны включать очистку, дедупликацию и фильтрацию ботов до анализа; игнорирование veracity завышает метрики вовлечённости, искажает сегментацию и может ввести в заблуждение в вопросах цен и продуктовых решений. Пять "V" легко спутать на первый взгляд из-за созвучия; проверка - спросить «какую проблему описывает эта V?»: Volume - слишком много, Velocity - слишком быстро, Variety - слишком разнообразно, Veracity - ненадёжно, Value - стоит ли затрат?',
          explanation_uz:
            "Haqqoniylik ma'lumotdagi noaniqlik, shovqin va ishonchlilikni qamrab oladi. Bot trafigi, skraping va takroriy sessiyalar - barchasi haqiqiy foydalanuvchi xatti-harakatiga O'XSHAGAN, ammo aslida unday bo'lmagan yozuvlarni yaratadi - ma'lumot haqiqiy ko'rinadi, ammo haqiqiy inson faoliyatini ifodalamaydi. Katta ma'lumotlar quvurlari tahlildan oldin tozalash, takrorlarni olib tashlash va botlarni filtrlash bosqichlarini o'z ichiga olishi kerak; haqqoniylikni e'tiborsiz qoldirish jalb etilish ko'rsatkichlarini oshiradi, segmentatsiyani buzadi va narx yoki mahsulot qarorlarini chalg'itishi mumkin. Beshta Vni birinchi o'qishda chalkashtirish oson, chunki ular bir-biriga o'xshash eshitiladi; sinov - \"bu V qaysi muammoni ta'riflaydi?\" deb so'rash: Hajm = juda katta, Tezlik = juda tez, Xilma-xillik = juda aralash, Haqqoniylik = ishonchsiz, Qiymat = xarajatga arziydimi?",
        },
      ],
    },
    // ---------- C ----------
    {
      code: "C",
      title_en: "Cost accounting techniques",
      title_ru: "Методы учёта затрат",
      title_uz: "Xarajat hisobi usullari",
      description_en:
        "Materials, labour, overheads, absorption vs marginal costing, job/batch/process/service costing, and ABC/target/lifecycle.",
      description_ru:
        "Материалы, труд, накладные расходы, абсорбционный и маржинальный учёт, попроцессный/попозаказный/посерийный/сервисный учёт, ABC/target/lifecycle.",
      description_uz:
        "Materiallar, mehnat, qo'shimcha xarajatlar (overheads), to'liq va marjinal hisob qiyosi, ish/partiya/jarayon/xizmat hisobi va ABC/maqsadli/hayot sikli hisobi.",
      sort_order: 30,
      theory_en:
        "Material costs are controlled through reorder systems. The Economic Order Quantity formula EOQ = \u221a(2CoD / Ch) minimises total ordering and holding cost \u2014 where Co is cost per order, D is annual demand, Ch is holding cost per unit per year. Inventory is valued using FIFO (first units in are first costed out), AVCO (weighted average cost recalculated after each receipt), or LIFO \u2014 though LIFO is rarely permitted under IFRS. Labour is split between direct (traceable to a product) and indirect (general supervision, idle time). Labour turnover ratio = leavers replaced / average headcount; efficiency, capacity, and production volume ratios decompose actual hours against standard.\n\n" +
        "Overheads cannot be directly traced, so they are absorbed. The procedure has three steps: allocation (whole-cost assignment to a single cost centre), apportionment (split across centres on a fair basis like floor area), and absorption (charge to units via an overhead absorption rate, often per labour hour or machine hour). Over-absorption arises when absorbed > actual; under-absorption when absorbed < actual \u2014 the variance hits the income statement.\n\n" +
        "Absorption costing values inventory at full cost (variable + fixed production overhead); marginal costing values at variable cost only, treating fixed overhead as a period cost. The two methods give different profits whenever inventory levels change: when inventory rises, absorption profit > marginal profit (some fixed cost stays on the balance sheet); when inventory falls, the reverse. Reconciliation: difference = change in inventory units \u00d7 fixed overhead per unit.\n\n" +
        "Costing methods match production type: job costing for unique one-offs, batch costing for groups of identical units, process costing for continuous mass production (with normal and abnormal losses recognised), service costing for intangible outputs using composite units like passenger-miles. Activity-Based Costing (ABC) traces overhead via cost drivers; target costing back-solves cost from market price minus required margin; lifecycle costing aggregates cost over the whole product life from design to withdrawal.",
      theory_ru:
        "Материальные затраты контролируются через системы повторного заказа. Формула экономически обоснованного размера заказа EOQ = \u221a(2CoD / Ch) минимизирует совокупные затраты на размещение и хранение - где Co - стоимость одного заказа, D - годовой спрос, Ch - стоимость хранения единицы в год. Запасы оцениваются методом FIFO (первые поступившие списываются первыми), AVCO (средневзвешенная стоимость, пересчитываемая после каждого поступления) или LIFO - хотя LIFO редко допускается по МСФО. Затраты на труд делятся на прямые (отнесимые к продукту) и косвенные (общее руководство, простой). Коэффициент текучести кадров = заменённые уволенные / средняя численность; коэффициенты эффективности, мощности и объёма производства раскладывают фактические часы относительно нормативных.\n\n" +
        "Накладные расходы нельзя отнести напрямую, поэтому они абсорбируются. Процедура состоит из трёх шагов: аллокация (прямое отнесение целиком на один центр затрат), распределение (разнос между центрами по справедливой базе, например по площади помещения) и абсорбция (отнесение на единицы продукции через ставку абсорбции, часто на час труда или машино-час). Сверх-абсорбция возникает, когда абсорбировано больше фактических затрат; недо-абсорбция - когда меньше; разница идёт в отчёт о прибылях и убытках.\n\n" +
        "Абсорбционный учёт оценивает запасы по полной себестоимости (переменные + постоянные производственные накладные); маржинальный учёт оценивает только по переменным затратам, относя постоянные накладные на период. Эти методы дают разную прибыль всякий раз, когда меняется уровень запасов: при росте запасов прибыль по абсорбции > маржинальной (часть постоянных затрат остаётся в балансе); при сокращении - наоборот. Сверка: разница = изменение запасов в единицах × постоянные накладные на единицу.\n\n" +
        "Методы учёта зависят от типа производства: попозаказный для уникальных единичных заказов, посерийный для групп одинаковых единиц, попроцессный для непрерывного массового производства (с признанием нормальных и аномальных потерь), сервисный для нематериальных результатов с использованием составных единиц вроде пассажиро-километров. Activity-Based Costing (ABC) разносит накладные через драйверы затрат; target costing обратным счётом от рыночной цены минус требуемая маржа выводит целевую себестоимость; lifecycle costing агрегирует затраты по всему жизненному циклу продукта от дизайна до снятия с производства.",
      theory_uz:
        "Material xarajatlari qayta buyurtma tizimlari orqali nazorat qilinadi. Iqtisodiy Buyurtma Miqdori formulasi EOQ = ildiz(2CoD / Ch) umumiy buyurtma va saqlash xarajatini minimallashtiradi - bu yerda Co - bir buyurtma xarajati, D - yillik talab, Ch - birlik uchun yillik saqlash xarajati. Tovar-moddiy zaxiralar FIFO (birinchi kirgan birliklar birinchi xarajatga chiqariladi), AVCO (har bir qabuldan keyin qayta hisoblangan vaznli o'rtacha xarajat) yoki LIFO yordamida baholanadi - garchi LIFO IFRS bo'yicha kamdan-kam ruxsat etiladi. Mehnat to'g'ridan-to'g'ri (mahsulotga bog'lanadigan) va bilvosita (umumiy nazorat, bo'sh vaqt) ga bo'linadi. Mehnat aylanmasi nisbati = almashtirilgan ketuvchilar / o'rtacha xodimlar soni; samaradorlik, quvvat va ishlab chiqarish hajmi nisbatlari haqiqiy soatlarni standartga nisbatan ajratadi.\n\nQo'shimcha xarajatlar to'g'ridan-to'g'ri bog'lab bo'lmaydi, shuning uchun ular yutiladi (absorbed). Protsedura uch bosqichdan iborat: ajratish (allocation - butun xarajatni bitta xarajat markaziga belgilash), taqsimlash (apportionment - markazlar bo'ylab pol maydoni kabi adolatli asosda bo'lish) va yutilish (absorption - qo'shimcha xarajat yutilish stavkasi orqali, ko'pincha mehnat soati yoki mashina soati uchun, birliklarga yuklash). Ortiqcha yutilish yutilgan > haqiqiydan bo'lganda yuzaga keladi; kam yutilish yutilgan < haqiqiydan bo'lganda - og'ish daromad to'g'risidagi hisobotga tushadi.\n\nTo'liq hisob (absorption costing) tovar-moddiy zaxiralarni to'liq xarajatda (o'zgaruvchan + o'zgarmas ishlab chiqarish qo'shimcha xarajati) baholaydi; marjinal hisob esa faqat o'zgaruvchan xarajatda baholaydi va o'zgarmas qo'shimcha xarajatni davr xarajati sifatida ko'rib chiqadi. Ikki usul zaxira darajalari o'zgarganda har doim turli foyda beradi: zaxira oshganda, to'liq hisob foydasi > marjinal foyda (ba'zi o'zgarmas xarajat balansda qoladi); zaxira kamayganda esa aksincha. Solishtirish: farq = zaxira birliklaridagi o'zgarish x birlik uchun o'zgarmas qo'shimcha xarajat.\n\nHisob usullari ishlab chiqarish turiga mos keladi: noyob bir martaliklar uchun ish hisobi (job costing), bir xil birliklar guruhlari uchun partiya hisobi (batch costing), uzluksiz ommaviy ishlab chiqarish uchun jarayon hisobi (process costing - oddiy va g'ayritabiiy yo'qotishlar tan olingan holda), yo'lovchi-milya kabi tarkibiy birliklardan foydalangan holda nomoddiy natijalar uchun xizmat hisobi (service costing). Faollikka asoslangan hisob (ABC) qo'shimcha xarajatni xarajat drayverlari orqali bog'laydi; maqsadli hisob (target costing) xarajatni bozor narxidan talab qilingan marjani ayirib orqaga hisoblaydi; hayot sikli hisobi (lifecycle costing) xarajatni loyihalashtirsihdan bekor qilishgacha bo'lgan butun mahsulot hayoti davomida jamlaydi.",
      questions: [
        // -------- Q1 - easy MCQ on direct vs indirect cost --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "Which of the following is BEST classified as a DIRECT cost of producing a wooden chair?",
          prompt_ru:
            "Что из перечисленного ЛУЧШЕ всего относится к ПРЯМЫМ затратам на производство деревянного стула?",
          prompt_uz:
            "Quyidagilardan qaysi biri yog'och kursi ishlab chiqarishning TO'G'RIDAN-TO'G'RI xarajati sifatida ENG yaxshi tasniflanadi?",
          options: [
            {
              key: "A",
              text_en: "Factory rent",
              text_ru: "Аренда производственного цеха",
              text_uz: "Zavod ijarasi",
              why_wrong_en:
                "Factory rent benefits all products made in the factory and cannot be traced to a single chair \u2014 it's an indirect (overhead) cost.",
              why_wrong_ru:
                "Аренда цеха относится ко всем выпускаемым там изделиям и не может быть отнесена к конкретному стулу - это косвенная (накладная) затрата.",
              why_wrong_uz:
                "Zavod ijarasi zavodda ishlab chiqarilgan barcha mahsulotlarga naf keltiradi va bitta kursiga bog'lab bo'lmaydi - bu bilvosita (qo'shimcha) xarajat.",
            },
            {
              key: "B",
              text_en: "The wood used to make the chair",
              text_ru: "Дерево, из которого сделан стул",
              text_uz: "Kursi yasashda ishlatilgan yog'och",
            },
            {
              key: "C",
              text_en: "The factory supervisor\u2019s salary",
              text_ru: "Зарплата начальника цеха",
              text_uz: "Zavod ustasining maoshi",
              why_wrong_en:
                "A supervisor oversees production of many items; their salary is INDIRECT labour, not direct.",
              why_wrong_ru:
                "Начальник цеха курирует производство многих изделий; его зарплата - КОСВЕННЫЙ труд, а не прямой.",
              why_wrong_uz:
                "Usta ko'plab narsalar ishlab chiqarilishini nazorat qiladi; uning maoshi to'g'ridan-to'g'ri emas, BILVOSITA mehnatdir.",
            },
            {
              key: "D",
              text_en: "Depreciation on factory machinery",
              text_ru: "Амортизация заводского оборудования",
              text_uz: "Zavod mashinasi amortizatsiyasi",
              why_wrong_en:
                "Machinery is used to produce many products; depreciation is allocated as overhead, not directly traced.",
              why_wrong_ru:
                "Оборудование используется для многих продуктов; амортизация распределяется как накладные расходы, а не относится напрямую.",
              why_wrong_uz:
                "Mashina ko'plab mahsulotlar ishlab chiqarishda ishlatiladi; amortizatsiya to'g'ridan-to'g'ri bog'lanmaydi, qo'shimcha xarajat sifatida taqsimlanadi.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "A direct cost can be specifically and unambiguously traced to one unit of output. The wood physically goes into one chair \u2014 trace it directly. Factory rent, supervisor salary and machine depreciation all benefit many products simultaneously, making them indirect (overhead) costs that must be apportioned.",
          explanation_ru:
            "Прямая затрата может быть однозначно отнесена к одной единице продукции. Дерево физически входит в один стул - отнесение прямое. Аренда цеха, зарплата начальника и амортизация оборудования относятся одновременно ко многим продуктам, что делает их косвенными (накладными), требующими распределения.",
          explanation_uz:
            "To'g'ridan-to'g'ri xarajatni bitta mahsulot birligiga aniq va shubhasiz bog'lab bo'ladi. Yog'och jismonan bitta kursiga kiradi - uni to'g'ridan-to'g'ri bog'lang. Zavod ijarasi, usta maoshi va mashina amortizatsiyasi - barchasi ko'plab mahsulotlarga bir vaqtda naf keltiradi, bu ularni taqsimlanishi kerak bo'lgan bilvosita (qo'shimcha) xarajatlarga aylantiradi.",
        },
        // -------- Q2 - easy MCQ on EOQ purpose --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "The Economic Order Quantity (EOQ) formula is used to determine:",
          prompt_ru:
            "Формула экономически обоснованного размера заказа (EOQ) используется для определения:",
          prompt_uz:
            "Iqtisodiy Buyurtma Miqdori (EOQ) formulasi quyidagini aniqlash uchun ishlatiladi:",
          options: [
            {
              key: "A",
              text_en: "The maximum stock level the warehouse can hold",
              text_ru:
                "Максимального уровня запасов, который может хранить склад",
              text_uz: "Ombor sig'dira oladigan maksimal zaxira darajasi",
              why_wrong_en:
                "EOQ doesn't consider warehouse capacity \u2014 it balances ordering cost against holding cost.",
              why_wrong_ru:
                "EOQ не учитывает вместимость склада - он балансирует затраты на размещение заказа и затраты на хранение.",
              why_wrong_uz:
                "EOQ ombor sig'imini hisobga olmaydi - u buyurtma xarajatini saqlash xarajatiga qarshi muvozanatlaydi.",
            },
            {
              key: "B",
              text_en:
                "The order size that minimises total ordering and holding cost",
              text_ru:
                "Размера заказа, минимизирующего общие затраты на размещение и хранение",
              text_uz:
                "Umumiy buyurtma va saqlash xarajatini minimallashtiradigan buyurtma o'lchami",
            },
            {
              key: "C",
              text_en: "The selling price of inventory",
              text_ru: "Цены продажи запасов",
              text_uz: "Zaxiraning sotuv narxi",
              why_wrong_en:
                "EOQ is a purchasing/inventory decision; it has nothing to do with selling prices.",
              why_wrong_ru:
                "EOQ - решение о закупке и запасах, к ценам продажи отношения не имеет.",
              why_wrong_uz:
                "EOQ - xarid/zaxira qarori; uning sotuv narxlariga aloqasi yo'q.",
            },
            {
              key: "D",
              text_en: "The reorder point",
              text_ru: "Точки повторного заказа",
              text_uz: "Qayta buyurtma nuqtasi",
              why_wrong_en:
                "Reorder point is a separate calculation (demand during lead time + safety stock); EOQ tells you HOW MUCH to order, not WHEN.",
              why_wrong_ru:
                "Точка повторного заказа - отдельный расчёт (спрос за время поставки + страховой запас); EOQ говорит, СКОЛЬКО заказывать, а не КОГДА.",
              why_wrong_uz:
                "Qayta buyurtma nuqtasi - alohida hisoblash (yetkazib berish muddati davomidagi talab + zaxira xavfsizligi); EOQ qachon emas, QANCHA buyurtma berishni aytadi.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "EOQ = \u221a(2CoD / Ch) balances two opposing costs. Ordering more often (small orders) increases TOTAL order placement cost. Ordering less often (large orders) increases average inventory and thus holding cost. EOQ is the order size where the two cancel out and total cost is minimised.",
          explanation_ru:
            "EOQ = √(2CoD / Ch) уравновешивает две противоположные затраты. Частые заказы (мелкими партиями) повышают ОБЩИЕ затраты на размещение. Редкие заказы (крупными партиями) повышают средний уровень запасов и затраты на хранение. EOQ - размер заказа, при котором эти эффекты гасят друг друга и совокупные затраты минимальны.",
          explanation_uz:
            "EOQ = ildiz(2CoD / Ch) ikki qarama-qarshi xarajatni muvozanatlaydi. Tez-tez buyurtma berish (kichik buyurtmalar) UMUMIY buyurtma berish xarajatini oshiradi. Kam buyurtma berish (katta buyurtmalar) o'rtacha zaxirani, demak saqlash xarajatini oshiradi. EOQ - bu ikkalasi o'zaro bekor bo'lib, umumiy xarajat minimallashtirilgan buyurtma o'lchamidir.",
        },
        // -------- Q3 - easy short_answer on FIFO/AVCO --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en: "Under IAS 2, which inventory cost formula is PERMITTED?",
          prompt_ru:
            "Какая формула расчёта себестоимости запасов РАЗРЕШЕНА согласно IAS 2?",
          prompt_uz:
            "IAS 2 ga ko'ra, qaysi zaxira xarajat formulasi RUXSAT ETILGAN?",
          options: [
            {
              key: "A",
              text_en: "Weighted average cost (AVCO)",
              text_ru: "Средневзвешенная стоимость (AVCO)",
              text_uz: "Vaznli o'rtacha xarajat (AVCO)",
            },
            {
              key: "B",
              text_en: "Last-in, first-out (LIFO)",
              text_ru: "Последним пришёл - первым ушёл (LIFO)",
              text_uz: "Oxirgi kirgan, birinchi chiqqan (LIFO)",
              why_wrong_en:
                "LIFO was disallowed under IAS 2 in 2003 because it can distort the balance sheet and enable profit manipulation; only FIFO and AVCO are permitted.",
              why_wrong_ru:
                "LIFO запрещён в IAS 2 с 2003 года, так как искажает баланс и допускает манипуляцию прибылью; разрешены только FIFO и AVCO.",
              why_wrong_uz:
                "LIFO 2003-yilda IAS 2 bo'yicha taqiqlandi, chunki u balansni buzishi va foydani manipulyatsiya qilishga imkon berishi mumkin; faqat FIFO va AVCO ruxsat etilgan.",
            },
            {
              key: "C",
              text_en: "Highest-in, first-out (HIFO)",
              text_ru: "Самым дорогим пришёл - первым ушёл (HIFO)",
              text_uz: "Eng yuqori kirgan, birinchi chiqqan (HIFO)",
              why_wrong_en:
                "HIFO is not a permitted IAS 2 method; the permitted formulas are FIFO and weighted average.",
              why_wrong_ru:
                "HIFO не разрешён в IAS 2; разрешённые формулы - FIFO и средневзвешенная.",
              why_wrong_uz:
                "HIFO ruxsat etilgan IAS 2 usuli emas; ruxsat etilgan formulalar - FIFO va vaznli o'rtacha.",
            },
            {
              key: "D",
              text_en: "Next-in, first-out (NIFO)",
              text_ru: "Следующим пришёл - первым ушёл (NIFO)",
              text_uz: "Keyingi kirgan, birinchi chiqqan (NIFO)",
              why_wrong_en:
                "NIFO uses replacement cost and is not permitted under IAS 2; only FIFO and AVCO are allowed.",
              why_wrong_ru:
                "NIFO основан на восстановительной стоимости и не разрешён в IAS 2; допустимы только FIFO и AVCO.",
              why_wrong_uz:
                "NIFO o'rnini bosish xarajatidan foydalanadi va IAS 2 bo'yicha ruxsat etilmagan; faqat FIFO va AVCO ruxsat etilgan.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "IAS 2 permits FIFO (first-in, first-out) and weighted average cost (AVCO). LIFO was disallowed in 2003. US GAAP still permits LIFO, a well-known IFRS/US GAAP difference.",
          explanation_ru:
            "IAS 2 разрешает FIFO (первым пришёл - первым ушёл) и средневзвешенную стоимость (AVCO). LIFO запрещён с 2003 года. US GAAP по-прежнему допускает LIFO - известное различие между IFRS и US GAAP.",
          explanation_uz:
            "IAS 2 FIFO (birinchi kirgan, birinchi chiqqan) va vaznli o'rtacha xarajat (AVCO)ga ruxsat beradi. LIFO 2003-yilda taqiqlandi. AQSh GAAP hamon LIFOga ruxsat beradi, bu taniqli IFRS/AQSh GAAP farqi.",
        },
        // -------- Q4 - easy MCQ on overhead allocation step --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "The process of charging an overhead cost in full to a single cost centre to which it can be specifically traced is called:",
          prompt_ru:
            "Процесс отнесения накладного расхода полностью на один центр затрат, к которому он может быть однозначно отнесён, называется:",
          prompt_uz:
            "Qo'shimcha xarajatni aniq bog'lash mumkin bo'lgan bitta xarajat markaziga to'liq yuklash jarayoni quyidagicha ataladi:",
          options: [
            {
              key: "A",
              text_en: "Allocation",
              text_ru: "Аллокация (прямое отнесение)",
              text_uz: "Ajratish (allocation)",
            },
            {
              key: "B",
              text_en: "Apportionment",
              text_ru: "Распределение",
              text_uz: "Taqsimlash (apportionment)",
              why_wrong_en:
                "Apportionment splits a cost across MULTIPLE cost centres on a fair basis; allocation puts the WHOLE cost on ONE centre.",
              why_wrong_ru:
                "Распределение разносит затрату между НЕСКОЛЬКИМИ центрами по справедливой базе; аллокация относит ВСЮ затрату на ОДИН центр.",
              why_wrong_uz:
                "Taqsimlash xarajatni adolatli asosda BIR NECHTA xarajat markazi bo'ylab bo'ladi; ajratish esa BUTUN xarajatni BITTA markazga qo'yadi.",
            },
            {
              key: "C",
              text_en: "Absorption",
              text_ru: "Абсорбция",
              text_uz: "Yutilish (absorption)",
              why_wrong_en:
                "Absorption is the FINAL step \u2014 charging from cost centre into product units; allocation is earlier in the process.",
              why_wrong_ru:
                "Абсорбция - ПОСЛЕДНИЙ шаг: разнесение затрат с центра на единицы продукции; аллокация - более ранний этап.",
              why_wrong_uz:
                "Yutilish - OXIRGI bosqich, ya'ni xarajat markazidan mahsulot birliklariga yuklash; ajratish esa jarayonda oldinroqdir.",
            },
            {
              key: "D",
              text_en: "Reapportionment",
              text_ru: "Перераспределение",
              text_uz: "Qayta taqsimlash (reapportionment)",
              why_wrong_en:
                "Reapportionment redistributes service-centre costs onto production centres; the question is about the initial step.",
              why_wrong_ru:
                "Перераспределение разносит затраты сервисных центров на производственные; вопрос - о первом шаге.",
              why_wrong_uz:
                "Qayta taqsimlash xizmat markazi xarajatlarini ishlab chiqarish markazlariga qayta taqsimlaydi; savol esa dastlabki bosqich haqida.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "The three steps of overhead absorption are sequential: ALLOCATION (whole cost to one centre when traceable, e.g. machine maintenance specific to one production line) \u2192 APPORTIONMENT (split across centres on a fair basis, e.g. rent split by floor area) \u2192 ABSORPTION (charge from centre into product units via an absorption rate). Reapportionment of service-centre costs sits between apportionment and absorption.",
          explanation_ru:
            "Три шага абсорбции накладных идут последовательно: АЛЛОКАЦИЯ (вся затрата на один центр, когда отнесение однозначно - например, обслуживание оборудования конкретной линии) → РАСПРЕДЕЛЕНИЕ (между центрами по справедливой базе - например, аренда по площади) → АБСОРБЦИЯ (с центра на единицы продукции через ставку). Перераспределение затрат сервисных центров - этап между распределением и абсорбцией.",
          explanation_uz:
            "Qo'shimcha xarajat yutilishining uch bosqichi ketma-ket: AJRATISH (bog'lanadigan bo'lsa, butun xarajat bitta markazga, masalan, bitta ishlab chiqarish liniyasiga xos mashina ta'miri) -> TAQSIMLASH (markazlar bo'ylab adolatli asosda bo'lish, masalan, ijara pol maydoni bo'yicha bo'linadi) -> YUTILISH (markazdan mahsulot birliklariga yutilish stavkasi orqali yuklash). Xizmat markazi xarajatlarini qayta taqsimlash taqsimlash bilan yutilish o'rtasida turadi.",
        },
        // -------- Q5 - medium NUMBER_ENTRY on EOQ calculation --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "Annual demand for a component is 8,000 units. Cost per order is $20. Holding cost is $4 per unit per year. What is the Economic Order Quantity (EOQ) in units?",
          prompt_ru:
            "Годовой спрос на компонент - 8 000 единиц. Стоимость одного заказа - $20. Стоимость хранения - $4 за единицу в год. Каков экономически обоснованный размер заказа (EOQ) в единицах?",
          prompt_uz:
            "Detalga yillik talab 8 000 birlik. Bir buyurtma xarajati 20 dollar. Saqlash xarajati birlik uchun yiliga 4 dollar. Iqtisodiy Buyurtma Miqdori (EOQ) birlikda qancha?",
          correct_answer_en: "283",
          acceptable_tolerance: 1,
          explanation_en:
            "EOQ = \u221a(2CoD / Ch) where Co = ordering cost per order, D = annual demand, Ch = holding cost per unit per year. EOQ = \u221a(2 \u00d7 20 \u00d7 8,000 / 4) = \u221a(320,000 / 4) = \u221a80,000 \u2248 282.84 \u2192 283 units. Round up because you can't order fractional units, and rounding up rather than down avoids stockouts.",
          explanation_ru:
            "EOQ = √(2CoD / Ch), где Co - стоимость заказа, D - годовой спрос, Ch - стоимость хранения единицы в год. EOQ = √(2 × 20 × 8 000 / 4) = √(320 000 / 4) = √80 000 ≈ 282,84 → 283 единицы. Округляем вверх, поскольку дробных единиц быть не может, а округление вверх позволяет избежать дефицита.",
          explanation_uz:
            "EOQ = ildiz(2CoD / Ch), bu yerda Co = bir buyurtma uchun buyurtma xarajati, D = yillik talab, Ch = birlik uchun yillik saqlash xarajati. EOQ = ildiz(2 x 20 x 8 000 / 4) = ildiz(320 000 / 4) = ildiz(80 000) ≈ 282,84 -> 283 birlik. Yuqoriga yaxlitlang, chunki kasr birliklarni buyurtma qilib bo'lmaydi va pastga emas, yuqoriga yaxlitlash zaxira tugashidan qochadi.",
        },
        // -------- Q6 - medium NUMBER_ENTRY on overhead absorption rate --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "Budgeted production overhead is $240,000. Budgeted activity is 60,000 direct labour hours. What is the OVERHEAD ABSORPTION RATE per labour hour (in $)?",
          prompt_ru:
            "Бюджетные производственные накладные - $240 000. Бюджетная активность - 60 000 прямых трудочасов. Какова СТАВКА АБСОРБЦИИ накладных на трудочас (в $)?",
          prompt_uz:
            "Byudjetlangan ishlab chiqarish qo'shimcha xarajati 240 000 dollar. Byudjetlangan faollik 60 000 to'g'ridan-to'g'ri mehnat soati. Mehnat soati uchun QO'SHIMCHA XARAJAT YUTILISH STAVKASI qancha (dollarda)?",
          correct_answer_en: "4",
          acceptable_tolerance: 0.01,
          explanation_en:
            "OAR = Budgeted overhead / Budgeted activity = $240,000 / 60,000 hours = $4 per labour hour. This rate is set BEFORE the period starts (using budgeted figures) and then applied to actual labour hours worked during the period. Over- or under-absorption arises when actual overhead or activity differs from budget.",
          explanation_ru:
            "OAR = бюджетные накладные / бюджетная активность = $240 000 / 60 000 часов = $4 на трудочас. Ставка определяется ДО начала периода (по бюджетным цифрам), а затем применяется к фактически отработанным часам. Сверх- или недо-абсорбция возникает, когда фактические накладные или активность отличаются от бюджета.",
          explanation_uz:
            "OAR = Byudjetlangan qo'shimcha xarajat / Byudjetlangan faollik = 240 000 dollar / 60 000 soat = mehnat soati uchun 4 dollar. Bu stavka davr boshlanishidan OLDIN (byudjetlangan ko'rsatkichlardan foydalanib) belgilanadi va so'ng davr davomida ishlangan haqiqiy mehnat soatlariga qo'llaniladi. Ortiqcha yoki kam yutilish haqiqiy qo'shimcha xarajat yoki faollik byudjetdan farq qilganda yuzaga keladi.",
        },
        // -------- Q7 - medium NUMBER_ENTRY on under/over absorption --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "The OAR is $4 per labour hour. Actual overheads incurred were $260,000. Actual labour hours worked were 62,000. Calculate the OVER-absorption (positive number) or UNDER-absorption (enter as negative) in $.",
          prompt_ru:
            "Ставка OAR = $4 на трудочас. Фактические накладные составили $260 000. Фактически отработано 62 000 трудочасов. Рассчитайте СВЕРХ-абсорбцию (положительное число) или НЕДО-абсорбцию (отрицательное) в $.",
          prompt_uz:
            "OAR mehnat soati uchun 4 dollar. Yuzaga kelgan haqiqiy qo'shimcha xarajatlar 260 000 dollar edi. Ishlangan haqiqiy mehnat soatlari 62 000 edi. ORTIQCHA yutilishni (musbat son) yoki KAM yutilishni (manfiy sifatida kiriting) dollarda hisoblang.",
          correct_answer_en: "-12000",
          acceptable_tolerance: 1,
          explanation_en:
            "Overhead absorbed into production = OAR \u00d7 actual hours = $4 \u00d7 62,000 = $248,000. Actual overhead incurred = $260,000. Difference = absorbed \u2212 actual = 248,000 \u2212 260,000 = \u2212$12,000. The amount absorbed is LESS than actually incurred \u2014 this is UNDER-absorption of $12,000. The shortfall is written off as an expense to the income statement (reducing profit).",
          explanation_ru:
            "Абсорбировано в производство = OAR × фактические часы = $4 × 62 000 = $248 000. Фактические накладные = $260 000. Разница = абсорбировано − факт = 248 000 − 260 000 = −$12 000. Абсорбировано МЕНЬШЕ, чем понесено фактически - это НЕДО-абсорбция $12 000. Недостача списывается в расход ОПУ (снижает прибыль).",
          explanation_uz:
            "Ishlab chiqarishga yutilgan qo'shimcha xarajat = OAR x haqiqiy soatlar = 4 dollar x 62 000 = 248 000 dollar. Yuzaga kelgan haqiqiy qo'shimcha xarajat = 260 000 dollar. Farq = yutilgan - haqiqiy = 248 000 - 260 000 = -12 000 dollar. Yutilgan miqdor haqiqatan yuzaga kelganidan KAM - bu 12 000 dollarlik KAM yutilishdir. Kamomad daromad to'g'risidagi hisobotga xarajat sifatida hisobdan chiqariladi (foydani kamaytiradi).",
        },
        // -------- Q8 - medium MCQ on marginal vs absorption profit --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "Inventory rose by 500 units during the year. Fixed overhead per unit is $6. The difference between absorption profit and marginal profit will be:",
          prompt_ru:
            "Запасы выросли на 500 единиц за год. Постоянные накладные на единицу - $6. Разница между прибылью по абсорбционному и маржинальному учёту составит:",
          prompt_uz:
            "Zaxira yil davomida 500 birlikka oshdi. Birlik uchun o'zgarmas qo'shimcha xarajat 6 dollar. To'liq hisob foydasi va marjinal foyda o'rtasidagi farq quyidagicha bo'ladi:",
          options: [
            {
              key: "A",
              text_en:
                "Absorption profit will be $3,000 LOWER than marginal profit",
              text_ru: "Прибыль по абсорбции будет на $3 000 НИЖЕ маржинальной",
              text_uz:
                "To'liq hisob foydasi marjinal foydadan 3 000 dollar PAST bo'ladi",
              why_wrong_en:
                "When inventory RISES, absorption profit is HIGHER (more fixed cost stays on the balance sheet); this answer reverses the direction.",
              why_wrong_ru:
                "При РОСТЕ запасов прибыль по абсорбции ВЫШЕ (больше постоянных затрат остаётся в балансе); этот ответ обратен по направлению.",
              why_wrong_uz:
                "Zaxira OSHGANDA, to'liq hisob foydasi YUQORIROQ (ko'proq o'zgarmas xarajat balansda qoladi); bu javob yo'nalishni teskari qiladi.",
            },
            {
              key: "B",
              text_en:
                "Absorption profit will be $3,000 HIGHER than marginal profit",
              text_ru: "Прибыль по абсорбции будет на $3 000 ВЫШЕ маржинальной",
              text_uz:
                "To'liq hisob foydasi marjinal foydadan 3 000 dollar YUQORI bo'ladi",
            },
            {
              key: "C",
              text_en:
                "There will be no difference because total costs are the same",
              text_ru: "Разницы не будет, так как общие затраты одинаковы",
              text_uz: "Farq bo'lmaydi, chunki umumiy xarajatlar bir xil",
              why_wrong_en:
                "Total costs ARE the same in any year, but PROFIT differs whenever inventory changes \u2014 because fixed overhead is treated differently on the balance sheet vs P/L.",
              why_wrong_ru:
                "Совокупные затраты ОДИНАКОВЫ в любой год, но ПРИБЫЛЬ различается при изменении запасов - потому что постоянные накладные по-разному отражаются в балансе и ОПУ.",
              why_wrong_uz:
                "Umumiy xarajatlar har qanday yilda bir xil, ammo zaxira o'zgarganda FOYDA farq qiladi - chunki o'zgarmas qo'shimcha xarajat balansda va foyda/zararda turlicha ko'rib chiqiladi.",
            },
            {
              key: "D",
              text_en: "The difference depends on selling price",
              text_ru: "Разница зависит от цены продажи",
              text_uz: "Farq sotuv narxiga bog'liq",
              why_wrong_en:
                "Selling price affects total revenue and profit, but the GAP between absorption and marginal profit depends only on inventory change \u00d7 fixed OH per unit.",
              why_wrong_ru:
                "Цена продажи влияет на выручку и прибыль в целом, но РАЗРЫВ между прибылью по абсорбции и маржинальной зависит только от изменения запасов × постоянные накладные на единицу.",
              why_wrong_uz:
                "Sotuv narxi umumiy daromad va foydaga ta'sir qiladi, ammo to'liq va marjinal foyda o'rtasidagi FARQ faqat zaxira o'zgarishi x birlik uchun o'zgarmas QX ga bog'liq.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            'Difference = change in inventory units \u00d7 fixed overhead per unit = 500 \u00d7 $6 = $3,000. When inventory RISES, absorption costing carries some fixed overhead forward into closing inventory on the balance sheet (deferring the expense), so absorption profit is HIGHER. When inventory falls, absorption profit is lower. The shorthand: absorption is "fixed OH follows the units"; marginal is "fixed OH hits the P/L when incurred".',
          explanation_ru:
            "Разница = изменение запасов × постоянные накладные на единицу = 500 × $6 = $3 000. При РОСТЕ запасов абсорбционный учёт переносит часть постоянных накладных в конечные запасы баланса (откладывая расход), поэтому прибыль по абсорбции ВЫШЕ. При падении запасов наоборот. Сокращённо: абсорбция - «постоянные накладные идут за единицами»; маржинальный - «постоянные накладные сразу в ОПУ при возникновении».",
          explanation_uz:
            "Farq = zaxira birliklaridagi o'zgarish x birlik uchun o'zgarmas qo'shimcha xarajat = 500 x 6 dollar = 3 000 dollar. Zaxira OSHGANDA, to'liq hisob ba'zi o'zgarmas qo'shimcha xarajatni balansdagi yopuvchi zaxiraga oldinga olib o'tadi (xarajatni kechiktiradi), shuning uchun to'liq hisob foydasi YUQORIROQ. Zaxira kamayganda, to'liq hisob foydasi pastroq. Qisqacha: to'liq hisob - \"o'zgarmas QX birliklarga ergashadi\"; marjinal - \"o'zgarmas QX yuzaga kelganda foyda/zarar hisobotiga tushadi\".",
        },
        // -------- Q9 - medium MCQ on costing methods --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "Which costing method is MOST appropriate for a printing company that takes individual, unique orders such as wedding invitations and business cards?",
          prompt_ru:
            "Какой метод учёта затрат НАИБОЛЕЕ подходит для типографии, принимающей индивидуальные уникальные заказы (свадебные приглашения, визитки)?",
          prompt_uz:
            "To'y taklifnomalari va tashrif qog'ozlari kabi alohida, noyob buyurtmalarni qabul qiladigan bosmaxona kompaniyasi uchun qaysi hisob usuli ENG MAQBUL?",
          options: [
            {
              key: "A",
              text_en: "Process costing",
              text_ru: "Попроцессный",
              text_uz: "Jarayon hisobi",
              why_wrong_en:
                "Process costing suits continuous mass production of identical units (e.g. petrol, chemicals); each printing job is unique.",
              why_wrong_ru:
                "Попроцессный подходит для непрерывного массового производства одинаковых единиц (бензин, химия); каждый типографский заказ уникален.",
              why_wrong_uz:
                "Jarayon hisobi bir xil birliklarni uzluksiz ommaviy ishlab chiqarishga mos keladi (masalan, benzin, kimyoviy moddalar); har bir bosma ish noyobdir.",
            },
            {
              key: "B",
              text_en: "Batch costing",
              text_ru: "Посерийный",
              text_uz: "Partiya hisobi",
              why_wrong_en:
                "Batch costing suits groups of IDENTICAL units produced together (e.g. 1,000 identical T-shirts); the question describes UNIQUE one-offs.",
              why_wrong_ru:
                "Посерийный подходит для групп ОДИНАКОВЫХ единиц, выпускаемых вместе (например, 1 000 одинаковых футболок); в вопросе - УНИКАЛЬНЫЕ единичные заказы.",
              why_wrong_uz:
                "Partiya hisobi birga ishlab chiqarilgan BIR XIL birliklar guruhlariga mos keladi (masalan, 1 000 ta bir xil futbolka); savol esa NOYOB bir martaliklarni ta'riflaydi.",
            },
            {
              key: "C",
              text_en: "Job costing",
              text_ru: "Попозаказный",
              text_uz: "Ish hisobi",
            },
            {
              key: "D",
              text_en: "Service costing",
              text_ru: "Сервисный",
              text_uz: "Xizmat hisobi",
              why_wrong_en:
                "Service costing is for intangible services (e.g. transport, consulting); the output here is a physical printed product.",
              why_wrong_ru:
                "Сервисный - для нематериальных услуг (транспорт, консалтинг); здесь же результат - физический печатный продукт.",
              why_wrong_uz:
                "Xizmat hisobi nomoddiy xizmatlar uchun (masalan, transport, konsalting); bu yerda natija jismoniy bosma mahsulotdir.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "Job costing tracks the cost of each individually identifiable job: customer's name, specific materials, labour hours spent, and a share of overhead. Used by printers, bespoke tailors, custom-furniture makers, builders, repair workshops. Batch costing is similar but for a GROUP of identical items produced together (then total cost / batch size = unit cost). Process costing is for continuous flow.",
          explanation_ru:
            "Попозаказный учёт ведёт затраты по каждому индивидуально идентифицируемому заказу: имя клиента, конкретные материалы, отработанные часы и доля накладных. Используется типографиями, ателье, мастерами на заказ, строителями, ремонтными мастерскими. Посерийный похож, но для ГРУППЫ одинаковых единиц, выпускаемых вместе (тогда общие затраты / размер серии = себестоимость единицы). Попроцессный - для непрерывного потока.",
          explanation_uz:
            "Ish hisobi har bir alohida aniqlanadigan ishning xarajatini kuzatadi: mijoz nomi, muayyan materiallar, sarflangan mehnat soatlari va qo'shimcha xarajat ulushi. Bosmaxonalar, buyurtmaga tikuvchilar, maxsus mebel yasovchilar, quruvchilar, ta'mirlash ustaxonalari tomonidan ishlatiladi. Partiya hisobi o'xshash, ammo birga ishlab chiqarilgan bir xil narsalar GURUHI uchun (so'ng umumiy xarajat / partiya o'lchami = birlik xarajati). Jarayon hisobi esa uzluksiz oqim uchundir.",
        },
        // -------- Q10 - medium NUMBER_ENTRY on FIFO inventory valuation --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "Opening inventory: 100 units at $5 each. Purchase 1: 200 units at $6 each. Purchase 2: 150 units at $7 each. 300 units were issued to production. Using FIFO, what is the cost of CLOSING inventory (in $)?",
          prompt_ru:
            "Начальные запасы: 100 единиц по $5. Закупка 1: 200 единиц по $6. Закупка 2: 150 единиц по $7. В производство отпущено 300 единиц. По FIFO какова стоимость КОНЕЧНЫХ запасов (в $)?",
          prompt_uz:
            "Boshlang'ich zaxira: 100 birlik, har biri 5 dollar. 1-xarid: 200 birlik, har biri 6 dollar. 2-xarid: 150 birlik, har biri 7 dollar. Ishlab chiqarishga 300 birlik berildi. FIFOdan foydalanib, YOPUVCHI zaxiraning xarajati qancha (dollarda)?",
          correct_answer_en: "1050",
          acceptable_tolerance: 1,
          explanation_en:
            "FIFO assumes the OLDEST units are issued first. Total available = 100 + 200 + 150 = 450 units. Issued = 300 units \u2192 first the 100 opening @ $5, then 200 from Purchase 1 @ $6 \u2014 that uses up 300 exactly. Closing inventory = 150 units left from Purchase 2 @ $7 = $1,050. The check: total cost = (100\u00d75) + (200\u00d76) + (150\u00d77) = 500 + 1,200 + 1,050 = $2,750. Cost of issues under FIFO = (100\u00d75) + (200\u00d76) = $1,700. Closing inventory = $2,750 \u2212 $1,700 = $1,050. \u2713",
          explanation_ru:
            "FIFO предполагает, что СНАЧАЛА отпускаются САМЫЕ СТАРЫЕ единицы. Всего доступно = 100 + 200 + 150 = 450 единиц. Отпущено = 300 единиц → сначала 100 начальных по $5, затем 200 из Закупки 1 по $6 - это ровно 300. Конечные запасы = 150 единиц из Закупки 2 по $7 = $1 050. Проверка: общая стоимость = (100×5) + (200×6) + (150×7) = 500 + 1 200 + 1 050 = $2 750. Стоимость отпусков по FIFO = (100×5) + (200×6) = $1 700. Конечные запасы = $2 750 − $1 700 = $1 050. ✓",
          explanation_uz:
            "FIFO ENG ESKI birliklar birinchi berilishini taxmin qiladi. Jami mavjud = 100 + 200 + 150 = 450 birlik. Berilgan = 300 birlik -> avval 100 boshlang'ich 5 dollardan, so'ng 1-xariddan 200 ta 6 dollardan - bu aynan 300 ni sarflaydi. Yopuvchi zaxira = 2-xariddan qolgan 150 birlik 7 dollardan = 1 050 dollar. Tekshiruv: umumiy xarajat = (100x5) + (200x6) + (150x7) = 500 + 1 200 + 1 050 = 2 750 dollar. FIFO bo'yicha berishlar xarajati = (100x5) + (200x6) = 1 700 dollar. Yopuvchi zaxira = 2 750 - 1 700 = 1 050 dollar.",
        },
        // -------- Q11 - medium MCQ on process costing losses --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            'In process costing, a "normal loss" is BEST described as:',
          prompt_ru:
            "В попроцессном учёте «нормальная потеря» ЛУЧШЕ всего описывается как:",
          prompt_uz:
            'Jarayon hisobida "oddiy yo\'qotish" (normal loss) ENG yaxshi quyidagicha tavsiflanadi:',
          options: [
            {
              key: "A",
              text_en:
                "Any loss arising during the process, regardless of cause",
              text_ru:
                "Любая потеря, возникшая в процессе, независимо от причины",
              text_uz:
                "Jarayon davomida yuzaga keladigan har qanday yo'qotish, sababidan qat'i nazar",
              why_wrong_en:
                'Losses are split into NORMAL (expected, built into standards) and ABNORMAL (unexpected, investigated separately); "normal" doesn\'t mean all losses.',
              why_wrong_ru:
                "Потери делятся на НОРМАЛЬНЫЕ (ожидаемые, заложенные в норматив) и АНОМАЛЬНЫЕ (неожиданные, исследуемые отдельно); «нормальная» не значит все потери.",
              why_wrong_uz:
                "Yo'qotishlar ODDIY (kutilgan, standartlarga kiritilgan) va G'AYRITABIIY (kutilmagan, alohida tekshiriladigan)ga bo'linadi; \"oddiy\" barcha yo'qotishlarni anglatmaydi.",
            },
            {
              key: "B",
              text_en:
                "The expected unavoidable loss inherent to the process, charged to production cost",
              text_ru:
                "Ожидаемая неустранимая потеря, присущая процессу и включаемая в себестоимость производства",
              text_uz:
                "Jarayonga xos kutilgan muqarrar yo'qotish, ishlab chiqarish xarajatiga yuklanadi",
            },
            {
              key: "C",
              text_en: "Loss due to fraud or theft",
              text_ru: "Потери от мошенничества или хищений",
              text_uz: "Firibgarlik yoki o'g'irlik tufayli yo'qotish",
              why_wrong_en:
                "Fraud/theft losses are ABNORMAL by definition \u2014 they shouldn't be expected as part of normal operations.",
              why_wrong_ru:
                "Потери от мошенничества/хищений по определению АНОМАЛЬНЫЕ - они не должны быть ожидаемыми в нормальной деятельности.",
              why_wrong_uz:
                "Firibgarlik/o'g'irlik yo'qotishlari ta'rifan G'AYRITABIIY - ular oddiy faoliyatning bir qismi sifatida kutilmasligi kerak.",
            },
            {
              key: "D",
              text_en: "Loss due to a one-off machine breakdown",
              text_ru: "Потеря из-за разового сбоя оборудования",
              text_uz: "Bir martalik mashina buzilishi tufayli yo'qotish",
              why_wrong_en:
                "A one-off breakdown is unexpected \u2014 that's an ABNORMAL loss, investigated separately and not absorbed into normal cost.",
              why_wrong_ru:
                "Разовый сбой - неожиданное событие, это АНОМАЛЬНАЯ потеря, исследуется отдельно и не включается в нормальную себестоимость.",
              why_wrong_uz:
                "Bir martalik buzilish kutilmagan - bu G'AYRITABIIY yo'qotish, alohida tekshiriladi va oddiy xarajatga yutilmaydi.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Normal loss is the unavoidable loss expected from the process under efficient conditions \u2014 evaporation, off-cuts, defective units within tolerance. It is charged to the cost of GOOD output, so each surviving unit absorbs a share. Abnormal loss exceeds the normal amount and is investigated separately, charged to the income statement, not to good production. Abnormal GAIN (loss less than expected) is the mirror case.",
          explanation_ru:
            "Нормальная потеря - неустранимая потеря, ожидаемая в процессе при эффективной работе: испарение, обрезки, брак в пределах допуска. Она включается в себестоимость ГОДНОЙ продукции, и каждая выходная единица несёт свою долю. Аномальная потеря превышает норму и исследуется отдельно, относится в ОПУ, а не на годное производство. Аномальная ПРИБЫЛЬ (потеря меньше ожидаемой) - зеркальный случай.",
          explanation_uz:
            "Oddiy yo'qotish - samarali sharoitlarda jarayondan kutiladigan muqarrar yo'qotish: bug'lanish, qirqindilar, chegara ichidagi nuqsonli birliklar. U YAROQLI natija xarajatiga yuklanadi, shuning uchun har bir omon qolgan birlik ulushni yutadi. G'ayritabiiy yo'qotish oddiy miqdordan oshadi va alohida tekshiriladi, daromad to'g'risidagi hisobotga yuklanadi, yaroqli ishlab chiqarishga emas. G'ayritabiiy YUTUQ (kutilganidan kam yo'qotish) - bu ko'zgu holatdir.",
        },
        // -------- Q12 - medium short_answer on labour ratios --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en: "How is the labour efficiency ratio calculated?",
          prompt_ru: "Как рассчитывается коэффициент эффективности труда?",
          prompt_uz: "Mehnat samaradorligi nisbati qanday hisoblanadi?",
          options: [
            {
              key: "A",
              text_en:
                "Standard hours for actual output ÷ actual hours worked × 100%",
              text_ru:
                "Нормативные часы на фактический выпуск ÷ фактически отработанные часы × 100%",
              text_uz:
                "Haqiqiy natija uchun standart soatlar / ishlangan haqiqiy soatlar x 100%",
            },
            {
              key: "B",
              text_en: "Actual hours worked ÷ budgeted hours × 100%",
              text_ru: "Фактически отработанные часы ÷ бюджетные часы × 100%",
              text_uz:
                "Ishlangan haqiqiy soatlar / byudjetlangan soatlar x 100%",
              why_wrong_en:
                "That is the CAPACITY ratio, which compares hours worked to hours planned, not efficiency of output.",
              why_wrong_ru:
                "Это коэффициент ЗАГРУЗКИ, сравнивающий отработанные часы с запланированными, а не эффективность выпуска.",
              why_wrong_uz:
                "Bu QUVVAT nisbati bo'lib, ishlangan soatlarni rejalashtirilgan soatlar bilan solishtiradi, natija samaradorligini emas.",
            },
            {
              key: "C",
              text_en:
                "Standard hours for actual output ÷ budgeted hours × 100%",
              text_ru:
                "Нормативные часы на фактический выпуск ÷ бюджетные часы × 100%",
              text_uz:
                "Haqiqiy natija uchun standart soatlar / byudjetlangan soatlar x 100%",
              why_wrong_en:
                "That is the PRODUCTION VOLUME ratio (the combined effect on output), not efficiency.",
              why_wrong_ru:
                "Это коэффициент ОБЪЁМА ПРОИЗВОДСТВА (совокупный эффект на выпуск), а не эффективность.",
              why_wrong_uz:
                "Bu ISHLAB CHIQARISH HAJMI nisbati (natijaga birlashgan ta'sir), samaradorlik emas.",
            },
            {
              key: "D",
              text_en:
                "Actual hours worked ÷ standard hours for actual output × 100%",
              text_ru:
                "Фактически отработанные часы ÷ нормативные часы на фактический выпуск × 100%",
              text_uz:
                "Ishlangan haqiqiy soatlar / haqiqiy natija uchun standart soatlar x 100%",
              why_wrong_en:
                "This inverts the efficiency ratio; efficiency puts standard hours for output on top, not actual hours.",
              why_wrong_ru:
                "Это перевёрнутый коэффициент эффективности; в эффективности сверху стоят нормативные часы на выпуск, а не фактические.",
              why_wrong_uz:
                "Bu samaradorlik nisbatini ag'daradi; samaradorlik natija uchun standart soatlarni yuqoriga qo'yadi, haqiqiy soatlarni emas.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Efficiency = standard hours for actual output ÷ actual hours worked × 100% (above 100% means workers beat the standard). Capacity = actual ÷ budgeted hours; Production volume = standard hours for output ÷ budgeted hours. Efficiency × Capacity = Volume.",
          explanation_ru:
            "Эффективность = нормативные часы на фактический выпуск ÷ фактически отработанные часы × 100% (выше 100% - рабочие превзошли норматив). Загрузка = фактические ÷ бюджетные часы; Объём производства = нормативные часы на выпуск ÷ бюджетные часы. Эффективность × Загрузка = Объём.",
          explanation_uz:
            "Samaradorlik = haqiqiy natija uchun standart soatlar / ishlangan haqiqiy soatlar x 100% (100% dan yuqori ishchilar standartdan oshganini bildiradi). Quvvat = haqiqiy / byudjetlangan soatlar; Ishlab chiqarish hajmi = natija uchun standart soatlar / byudjetlangan soatlar. Samaradorlik x Quvvat = Hajm.",
        },
        // -------- Q13 - medium MCQ on ABC --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "Activity-Based Costing (ABC) differs from traditional absorption costing in that ABC:",
          prompt_ru:
            "Activity-Based Costing (ABC) отличается от традиционного абсорбционного учёта тем, что ABC:",
          prompt_uz:
            "Faollikka asoslangan hisob (ABC) an'anaviy to'liq hisobdan quyidagisi bilan farq qiladi:",
          options: [
            {
              key: "A",
              text_en: "Ignores fixed overhead entirely",
              text_ru: "Полностью игнорирует постоянные накладные",
              text_uz:
                "O'zgarmas qo'shimcha xarajatni butunlay e'tiborsiz qoldiradi",
              why_wrong_en:
                "ABC includes overheads but allocates them differently; ignoring fixed overhead is what MARGINAL costing does, not ABC.",
              why_wrong_ru:
                "ABC включает накладные, но распределяет их иначе; постоянные накладные игнорирует МАРЖИНАЛЬНЫЙ учёт, а не ABC.",
              why_wrong_uz:
                "ABC qo'shimcha xarajatlarni o'z ichiga oladi, ammo ularni boshqacha taqsimlaydi; o'zgarmas qo'shimcha xarajatni e'tiborsiz qoldirish - bu MARJINAL hisob qiladigan narsa, ABC emas.",
            },
            {
              key: "B",
              text_en:
                "Traces overheads to products via cost drivers that reflect what actually causes the cost",
              text_ru:
                "Разносит накладные на продукты через драйверы затрат, отражающие реальную причину возникновения затрат",
              text_uz:
                "Qo'shimcha xarajatlarni mahsulotlarga, xarajatga aslida nima sabab bo'lishini aks ettiruvchi xarajat drayverlari orqali bog'laydi",
            },
            {
              key: "C",
              text_en: "Eliminates the need for direct cost tracking",
              text_ru: "Устраняет необходимость учёта прямых затрат",
              text_uz:
                "To'g'ridan-to'g'ri xarajatni kuzatish zaruratini bartaraf etadi",
              why_wrong_en:
                "Direct costs are still tracked under ABC; the difference is only in how OVERHEADS are assigned.",
              why_wrong_ru:
                "Прямые затраты по-прежнему учитываются при ABC; различие - только в способе разнесения НАКЛАДНЫХ.",
              why_wrong_uz:
                "To'g'ridan-to'g'ri xarajatlar ABC bo'yicha hamon kuzatiladi; farq faqat QO'SHIMCHA XARAJATLAR qanday belgilanishidadir.",
            },
            {
              key: "D",
              text_en: "Is used only in service industries",
              text_ru: "Применяется только в сфере услуг",
              text_uz: "Faqat xizmat ko'rsatish sohalarida ishlatiladi",
              why_wrong_en:
                "ABC originated in manufacturing (where complex product mixes were misallocated by simple OAR) and is now used in both manufacturing and services.",
              why_wrong_ru:
                "ABC появился в производстве (где простая ставка OAR искажала разнесение в сложных продуктовых наборах) и сегодня используется и в производстве, и в услугах.",
              why_wrong_uz:
                "ABC ishlab chiqarishda paydo bo'lgan (u yerda murakkab mahsulot aralashmalari oddiy OAR tomonidan noto'g'ri taqsimlangan edi) va endi ham ishlab chiqarish, ham xizmatlarda ishlatiladi.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            'Traditional absorption uses a single (or few) volume-based rate(s) like "per labour hour" \u2014 fine when products consume overhead proportionally to volume. ABC identifies multiple ACTIVITIES that drive cost (e.g. machine setups, purchase orders, inspections) and traces each via its DRIVER (setups, POs, inspections). High-variety, low-volume products that disproportionately use these activities get correctly charged more under ABC; simple high-volume products get charged less. ABC produces more accurate product costs when overhead is large and product mix is varied.',
          explanation_ru:
            "Традиционная абсорбция использует одну (или несколько) объёмных ставок вроде «на трудочас» - годится, когда продукты потребляют накладные пропорционально объёму. ABC выявляет несколько ВИДОВ ДЕЯТЕЛЬНОСТИ, генерирующих затраты (например, настройка оборудования, заказы на закупку, проверки), и разносит каждую через её ДРАЙВЕР (число настроек, число заказов, число проверок). Малосерийные продукты с большим разнообразием, потребляющие эти виды деятельности непропорционально, при ABC получают корректно бо́льшую долю накладных; простые крупносерийные - меньшую. ABC даёт более точную себестоимость при крупных накладных и разнородной продукции.",
          explanation_uz:
            "An'anaviy to'liq hisob \"mehnat soati uchun\" kabi yagona (yoki bir nechta) hajmga asoslangan stavka(lar)dan foydalanadi - mahsulotlar qo'shimcha xarajatni hajmga mutanosib ravishda iste'mol qilganda yaxshi. ABC xarajatni harakatlantiradigan ko'plab FAOLIYATLARni aniqlaydi (masalan, mashina sozlashlari, xarid buyurtmalari, tekshiruvlar) va har birini uning DRAYVERI orqali bog'laydi (sozlashlar, buyurtmalar, tekshiruvlar). Bu faoliyatlardan nomutanosib ravishda foydalanadigan yuqori xilma-xil, kam hajmli mahsulotlar ABC bo'yicha to'g'ri ko'proq haqlanadi; oddiy yuqori hajmli mahsulotlar esa kamroq haqlanadi. Qo'shimcha xarajat katta va mahsulot aralashmasi xilma-xil bo'lganda ABC aniqroq mahsulot xarajatlarini hosil qiladi.",
        },
        // -------- Q14 - hard NUMBER_ENTRY on AVCO inventory --------
        {
          type: "number_entry",
          difficulty: "hard",
          prompt_en:
            "Opening inventory: 200 units at $10 each. Purchase: 300 units at $14 each. After the purchase, 250 units are issued. Using the AVCO method (weighted average recalculated after each receipt), what is the value of the 250 units issued (in $)?",
          prompt_ru:
            "Начальные запасы: 200 единиц по $10. Закупка: 300 единиц по $14. После закупки отпущено 250 единиц. По методу AVCO (средневзвешенная, пересчитываемая после каждого поступления) какова стоимость отпущенных 250 единиц (в $)?",
          prompt_uz:
            "Boshlang'ich zaxira: 200 birlik, har biri 10 dollar. Xarid: 300 birlik, har biri 14 dollar. Xariddan keyin 250 birlik beriladi. AVCO usulidan foydalanib (har bir qabuldan keyin qayta hisoblangan vaznli o'rtacha), berilgan 250 birlikning qiymati qancha (dollarda)?",
          correct_answer_en: "3100",
          acceptable_tolerance: 1,
          explanation_en:
            "After the purchase, total inventory = 200 + 300 = 500 units; total cost = (200\u00d710) + (300\u00d714) = 2,000 + 4,200 = $6,200. Weighted average = 6,200 / 500 = $12.40 per unit. Cost of 250 units issued = 250 \u00d7 $12.40 = $3,100. The remaining 250 units are also valued at $12.40 = $3,100, totalling $6,200 \u2014 internally consistent. AVCO's key feature is the RECALCULATION after each receipt; LIFO and FIFO don't average.",
          explanation_ru:
            "После закупки всего запасов = 200 + 300 = 500 единиц; общая стоимость = (200×10) + (300×14) = 2 000 + 4 200 = $6 200. Средневзвешенная = 6 200 / 500 = $12,40 за единицу. Стоимость 250 отпущенных = 250 × $12,40 = $3 100. Оставшиеся 250 единиц тоже оценены по $12,40 = $3 100, итого $6 200 - внутренне согласовано. Ключевая особенность AVCO - ПЕРЕСЧЁТ после каждого поступления; LIFO и FIFO не усредняют.",
          explanation_uz:
            "Xariddan keyin jami zaxira = 200 + 300 = 500 birlik; umumiy xarajat = (200x10) + (300x14) = 2 000 + 4 200 = 6 200 dollar. Vaznli o'rtacha = 6 200 / 500 = birlik uchun 12,40 dollar. Berilgan 250 birlik xarajati = 250 x 12,40 dollar = 3 100 dollar. Qolgan 250 birlik ham 12,40 dollarda baholanadi = 3 100 dollar, jami 6 200 dollar - ichki izchil. AVCOning asosiy xususiyati - har bir qabuldan keyingi QAYTA HISOBLASH; LIFO va FIFO o'rtachalamaydi.",
        },
        // -------- Q15 - hard MCQ on integrated marginal/absorption decision --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            "A company\u2019s management is choosing between absorption and marginal costing for monthly internal reporting. Demand fluctuates seasonally, with large inventory build-ups in some months and draw-downs in others. The MOST SIGNIFICANT consequence of choosing ABSORPTION over marginal costing for these monthly reports is:",
          prompt_ru:
            "Руководство компании выбирает между абсорбционным и маржинальным учётом для ежемесячной внутренней отчётности. Спрос колеблется сезонно: в одни месяцы - крупное наращивание запасов, в другие - их сокращение. НАИБОЛЕЕ ЗНАЧИМОЕ последствие выбора АБСОРБЦИОННОГО учёта вместо маржинального для ежемесячных отчётов:",
          prompt_uz:
            "Kompaniya rahbariyati oylik ichki hisobot uchun to'liq va marjinal hisob orasidan tanlayapti. Talab mavsumiy ravishda o'zgaradi, ba'zi oylarda katta zaxira to'planib, boshqalarida kamayadi. Bu oylik hisobotlar uchun marjinal o'rniga TO'LIQ hisobni tanlashning ENG SEZILARLI oqibati:",
          options: [
            {
              key: "A",
              text_en:
                "Reported monthly profit will fluctuate with INVENTORY changes as well as with sales, making it harder to read underlying performance",
              text_ru:
                "Отражённая ежемесячная прибыль будет колебаться вместе с изменением ЗАПАСОВ и с продажами, затрудняя оценку базовой эффективности",
              text_uz:
                "Hisobot oylik foydasi sotuv bilan birga ZAXIRA o'zgarishlari bilan ham tebranadi, bu asosiy faoliyatni o'qishni qiyinlashtiradi",
            },
            {
              key: "B",
              text_en:
                "Total annual profit will be different under the two methods",
              text_ru: "Общая годовая прибыль будет различной при двух методах",
              text_uz:
                "Umumiy yillik foyda ikki usul bo'yicha turlicha bo'ladi",
              why_wrong_en:
                "Annual profit is the SAME under both methods when opening and closing inventory are equal year over year; the difference is in TIMING, not total.",
              why_wrong_ru:
                "Годовая прибыль ОДИНАКОВА при обоих методах, когда начальные и конечные запасы по году равны; различие во ВРЕМЕНИ признания, а не в сумме.",
              why_wrong_uz:
                "Yillik foyda boshlang'ich va yopuvchi zaxira yildan-yilga teng bo'lganda ikkala usul bo'yicha BIR XIL; farq umumiyda emas, VAQTDADIR.",
            },
            {
              key: "C",
              text_en:
                "Absorption costing produces lower profit in every month",
              text_ru: "Абсорбционный учёт даёт меньшую прибыль каждый месяц",
              text_uz: "To'liq hisob har oyda pastroq foyda hosil qiladi",
              why_wrong_en:
                'Direction depends on inventory MOVEMENT: rising inventory \u2192 absorption HIGHER; falling \u2192 absorption LOWER. Not "always lower".',
              why_wrong_ru:
                "Направление зависит от ДВИЖЕНИЯ запасов: рост → абсорбция ВЫШЕ; падение → НИЖЕ. Не «всегда ниже».",
              why_wrong_uz:
                "Yo'nalish zaxira HARAKATIGA bog'liq: zaxira oshsa -> to'liq hisob YUQORI; kamaysa -> to'liq hisob PAST. \"Har doim pastroq\" emas.",
            },
            {
              key: "D",
              text_en:
                "Absorption costing eliminates the need to know fixed overhead",
              text_ru:
                "Абсорбционный учёт устраняет необходимость знать постоянные накладные",
              text_uz:
                "To'liq hisob o'zgarmas qo'shimcha xarajatni bilish zaruratini bartaraf etadi",
              why_wrong_en:
                "Absorption specifically REQUIRES allocating fixed overhead to units; marginal is the method that keeps fixed OH separate.",
              why_wrong_ru:
                "Абсорбция специально ТРЕБУЕТ разнесения постоянных накладных на единицы; маржинальный - это метод, удерживающий постоянные накладные отдельно.",
              why_wrong_uz:
                "To'liq hisob aynan o'zgarmas qo'shimcha xarajatni birliklarga taqsimlashni TALAB qiladi; marjinal esa o'zgarmas QXni alohida saqlaydigan usuldir.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Under absorption costing, fixed overhead is carried into closing inventory. When inventory rises (production > sales), fixed cost is parked on the balance sheet \u2014 profit looks higher even if sales are flat. When inventory falls, that fixed cost is released into cost of sales \u2014 profit looks lower even if sales rose. The reported profit therefore swings with INVENTORY LEVELS as well as sales, which obscures genuine performance. Marginal costing eliminates this distortion by always charging fixed overhead to the period incurred. For internal monthly reporting where managers need to read underlying performance, marginal costing is usually preferred. Absorption is required for external reporting (IAS 2), so most firms run both \u2014 absorption for the published accounts, marginal for management decisions.",
          explanation_ru:
            "При абсорбционном учёте постоянные накладные переходят в конечные запасы. При росте запасов (производство > продаж) постоянные затраты «паркуются» в балансе - прибыль кажется выше даже при стабильных продажах. При падении запасов эти постоянные затраты выходят в себестоимость продаж - прибыль кажется ниже даже при росте продаж. Отчётная прибыль колеблется в зависимости от УРОВНЯ ЗАПАСОВ, не только от продаж, что скрывает реальную эффективность. Маржинальный учёт устраняет это искажение, всегда относя постоянные накладные на период их возникновения. Для ежемесячной внутренней отчётности, где менеджерам нужно видеть базовую эффективность, обычно предпочтителен маржинальный. Абсорбционный обязателен для внешней отчётности (IAS 2), поэтому большинство компаний ведут оба - абсорбционный для публикуемой отчётности, маржинальный для управленческих решений.",
          explanation_uz:
            "To'liq hisob bo'yicha o'zgarmas qo'shimcha xarajat yopuvchi zaxiraga olib o'tiladi. Zaxira oshganda (ishlab chiqarish > sotuv), o'zgarmas xarajat balansda turadi - sotuv o'zgarmasa ham foyda yuqoriroq ko'rinadi. Zaxira kamayganda, o'sha o'zgarmas xarajat sotuv tannarxiga chiqariladi - sotuv oshsa ham foyda pastroq ko'rinadi. Demak, hisobot foydasi sotuv bilan birga ZAXIRA DARAJALARI bilan ham tebranadi, bu haqiqiy faoliyatni yashiradi. Marjinal hisob o'zgarmas qo'shimcha xarajatni har doim yuzaga kelgan davrga yuklash orqali bu buzilishni bartaraf etadi. Menejerlar asosiy faoliyatni o'qishi kerak bo'lgan ichki oylik hisobot uchun marjinal hisob odatda afzalroq. To'liq hisob tashqi hisobot uchun talab qilinadi (IAS 2), shuning uchun aksariyat firmalar ikkalasini ham yuritadi - nashr etilgan hisoblar uchun to'liq, boshqaruv qarorlari uchun marjinal.",
        },
      ],
    },

    // ---------- D ----------
    {
      code: "D",
      title_en: "Budgeting",
      title_ru: "Бюджетирование",
      title_uz: "Byudjetlashtirish",
      description_en:
        "Budget types, flexed budgets, behavioural aspects, and capital investment appraisal techniques.",
      description_ru:
        "Виды бюджетов, гибкие бюджеты, поведенческие аспекты и методы оценки инвестиций.",
      description_uz:
        "Byudjet turlari, moslashtirilgan (flexed) byudjetlar, xulq-atvor jihatlari va kapital sarmoyani baholash usullari.",
      sort_order: 40,
      theory_en:
        "A budget is a quantified plan over a defined period \u2014 usually a year, broken into months. The budgeting cycle starts with limiting-factor identification (often sales demand), then the principal budget is built, then dependent budgets cascade: sales \u2192 production \u2192 materials/labour/overhead \u2192 cash \u2192 master budget (budgeted P/L, SoFP, cash flow).\n\n" +
        "Budget types reflect different philosophies. Fixed budget remains at original assumptions; flexible budget is restated for actual activity level \u2014 the flexed budget is essential for fair variance analysis. Incremental budgeting starts from last year and adjusts; zero-based budgeting (ZBB) rebuilds each line from scratch, justifying every cost; rolling/continuous budgets are continually extended (drop the elapsed month, add a new future month); activity-based budgets derive resources from planned cost-driver volumes.\n\n" +
        "Top-down (imposed) budgets are set by senior management; bottom-up (participative) budgets involve those responsible for execution. Participation improves motivation and accuracy but risks budgetary slack \u2014 deliberately easy targets created by managers to look good against them. Other behavioural issues: dysfunctional behaviour (chasing the budget metric at expense of broader goals) and the motivational impact of stretching but achievable targets.\n\n" +
        "Capital investment appraisal evaluates long-term projects. Payback period = years until cumulative cash inflows equal initial outlay; simple but ignores time value and post-payback flows. Accounting Rate of Return (ARR) = average profit / average (or initial) investment; uses accounting profit, ignores cash timing. Net Present Value (NPV) discounts future cash flows at the cost of capital \u2014 positive NPV means the project adds value; this is the theoretically preferred method. Internal Rate of Return (IRR) is the discount rate at which NPV = 0; accept if IRR > cost of capital. Discount factor for year n = 1 / (1 + r)\u207f.",
      theory_ru:
        "Бюджет - это количественный план на определённый период, обычно год с разбивкой по месяцам. Цикл бюджетирования начинается с выявления ограничивающего фактора (часто это спрос), затем формируется главный бюджет, а зависимые бюджеты строятся каскадом: продажи → производство → материалы/труд/накладные → денежные средства → сводный бюджет (бюджетный отчёт о прибылях и убытках, баланс, движение денежных средств).\n\n" +
        "Виды бюджетов отражают разные подходы. Фиксированный бюджет остаётся при первоначальных допущениях; гибкий бюджет пересчитывается под фактический уровень активности - гибкий бюджет необходим для корректного анализа отклонений. Инкрементное бюджетирование отталкивается от прошлого года с корректировкой; нулевое бюджетирование (ZBB) выстраивает каждую статью с нуля, обосновывая каждую затрату; скользящие/непрерывные бюджеты постоянно продлеваются (отбрасывают прошедший месяц, добавляют новый будущий); бюджеты по видам деятельности выводят ресурсы из плановых объёмов драйверов затрат.\n\n" +
        "Бюджеты «сверху вниз» (навязанные) задаются высшим руководством; бюджеты «снизу вверх» (партисипативные) вовлекают тех, кто отвечает за исполнение. Участие повышает мотивацию и точность, но создаёт риск бюджетной слабины - намеренно лёгких показателей, выставляемых менеджерами, чтобы хорошо выглядеть на их фоне. Прочие поведенческие проблемы: дисфункциональное поведение (погоня за бюджетной метрикой в ущерб общим целям) и мотивационный эффект амбициозных, но достижимых целей.\n\n" +
        "Оценка капиталовложений анализирует долгосрочные проекты. Срок окупаемости = годы до момента, когда накопленные денежные поступления сравняются с первоначальной инвестицией; прост, но игнорирует временную стоимость денег и потоки после окупаемости. Учётная норма доходности (ARR) = средняя прибыль / средние (или первоначальные) инвестиции; использует учётную прибыль, игнорирует тайминг денежных потоков. Чистая приведённая стоимость (NPV) дисконтирует будущие денежные потоки по стоимости капитала - положительный NPV означает, что проект добавляет стоимость; теоретически предпочтительный метод. Внутренняя норма доходности (IRR) - это ставка дисконтирования, при которой NPV = 0; проект принимается, если IRR > стоимости капитала. Коэффициент дисконтирования для года n = 1 / (1 + r)ⁿ.",
      theory_uz:
        "Byudjet - belgilangan davr, odatda bir yil, oylarga bo'lingan miqdoriy rejadir. Byudjetlashtirish sikli cheklovchi omilni aniqlashdan (ko'pincha sotuv talabidan) boshlanadi, so'ng asosiy byudjet quriladi, so'ng bog'liq byudjetlar kaskad bo'yicha tushadi: sotuv -> ishlab chiqarish -> materiallar/mehnat/qo'shimcha xarajat -> naqd pul -> bosh byudjet (byudjetlangan foyda/zarar, moliyaviy holat to'g'risidagi hisobot, pul oqimi).\n\nByudjet turlari turli falsafalarni aks ettiradi. O'zgarmas (fixed) byudjet dastlabki taxminlarda qoladi; moslashuvchan (flexible) byudjet haqiqiy faollik darajasi uchun qayta hisoblanadi - moslashtirilgan byudjet adolatli og'ish tahlili uchun zarurdir. Ortib boruvchi (incremental) byudjetlashtirish o'tgan yildan boshlanib moslashtiriladi; noldan boshlangan byudjetlashtirish (ZBB) har bir qatorni noldan qayta quradi va har bir xarajatni asoslaydi; aylanuvchi/uzluksiz byudjetlar doimo cho'ziladi (o'tgan oyni tashlab, yangi kelajak oyni qo'shadi); faollikka asoslangan byudjetlar resurslarni rejalashtirilgan xarajat drayveri hajmlaridan oladi.\n\nYuqoridan pastga (yuklangan) byudjetlar oliy rahbariyat tomonidan belgilanadi; pastdan yuqoriga (ishtirokchi) byudjetlar bajarish uchun mas'ul kishilarni jalb qiladi. Ishtirok motivatsiya va aniqlikni oshiradi, ammo byudjet bo'shlig'i (budgetary slack) xavfini tug'diradi - menejerlar o'ziga yaxshi ko'rinish uchun ataylab yaratgan oson maqsadlar. Boshqa xulq-atvor masalalari: disfunksional xatti-harakat (kengroq maqsadlar hisobiga byudjet ko'rsatkichini quvish) va cho'zilgan, ammo erishsa bo'ladigan maqsadlarning motivatsion ta'siri.\n\nKapital sarmoyani baholash uzoq muddatli loyihalarni baholaydi. Qoplanish davri (payback period) = jami pul tushumlari dastlabki sarfga teng bo'lguncha o'tgan yillar; oddiy, ammo vaqt qiymati va qoplanishdan keyingi oqimlarni e'tiborsiz qoldiradi. Hisob foyda stavkasi (ARR) = o'rtacha foyda / o'rtacha (yoki dastlabki) sarmoya; hisob foydasidan foydalanadi, naqd vaqtini e'tiborsiz qoldiradi. Sof joriy qiymat (NPV) kelajak pul oqimlarini kapital narxida diskontlaydi - musbat NPV loyiha qiymat qo'shishini bildiradi; bu nazariy jihatdan afzal usuldir. Ichki foyda stavkasi (IRR) - NPV = 0 bo'lgan diskont stavkasi; IRR > kapital narxi bo'lsa qabul qiling. n-yil uchun diskont omili = 1 / (1 + r) darajada n.",
      questions: [
        // -------- Q1 - easy MCQ on principal budget factor --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "For most commercial organisations, the principal budget factor (limiting factor) is usually:",
          prompt_ru:
            "Для большинства коммерческих организаций главный бюджетный фактор (ограничивающий фактор) обычно:",
          prompt_uz:
            "Aksariyat tijorat tashkilotlari uchun asosiy byudjet omili (cheklovchi omil) odatda:",
          options: [
            {
              key: "A",
              text_en: "Cash availability",
              text_ru: "Наличие денежных средств",
              text_uz: "Naqd pul mavjudligi",
              why_wrong_en:
                "Cash can be raised through loans or share issues; the harder constraint is usually demand. Cash IS the limiting factor in distressed firms but not the typical case.",
              why_wrong_ru:
                "Денежные средства можно привлечь через кредиты или эмиссию; обычно сложнее ограничение - спрос. Деньги ограничивают в кризисных компаниях, но не в типичном случае.",
              why_wrong_uz:
                "Naqd pul kredit yoki aksiya chiqarish orqali jalb qilinishi mumkin; qiyinroq cheklov odatda talabdir. Naqd pul qiyinchilikdagi firmalarda cheklovchi omil, ammo odatiy holat emas.",
            },
            {
              key: "B",
              text_en: "Sales demand",
              text_ru: "Спрос на продукцию",
              text_uz: "Sotuv talabi",
            },
            {
              key: "C",
              text_en: "Number of suppliers",
              text_ru: "Число поставщиков",
              text_uz: "Yetkazib beruvchilar soni",
              why_wrong_en:
                "Suppliers can usually be expanded or substituted; supplier base is rarely the binding constraint.",
              why_wrong_ru:
                "Поставщиков обычно можно расширить или заменить; их количество редко является связывающим ограничением.",
              why_wrong_uz:
                "Yetkazib beruvchilar odatda kengaytirilishi yoki almashtirilishi mumkin; yetkazib beruvchilar bazasi kamdan-kam bog'lovchi cheklovdir.",
            },
            {
              key: "D",
              text_en: "Government regulation",
              text_ru: "Государственное регулирование",
              text_uz: "Davlat tartibga solishi",
              why_wrong_en:
                "Regulation can constrain certain activities but isn't typically the primary driver of budget scale.",
              why_wrong_ru:
                "Регулирование может ограничивать отдельные виды деятельности, но обычно не определяет масштаб бюджета.",
              why_wrong_uz:
                "Tartibga solish ayrim faoliyatlarni cheklashi mumkin, ammo odatda byudjet ko'lamining asosiy harakatlantiruvchisi emas.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "The principal budget factor is whatever resource ultimately caps output. For most firms it is sales demand \u2014 they can produce more than the market will buy. When sales is the limiting factor, the sales budget is built first; everything else (production, materials, labour) cascades from it. For firms hitting capacity (e.g. semiconductors during shortage), production capacity becomes the limiting factor and the cascade reorders.",
          explanation_ru:
            "Главный бюджетный фактор - ресурс, в конечном счёте ограничивающий выпуск. У большинства фирм это спрос: они могут произвести больше, чем рынок купит. Когда ограничение - продажи, сначала строится бюджет продаж, а всё остальное (производство, материалы, труд) каскадируется из него. Для компаний, упирающихся в мощности (например, полупроводники в дефицит), главным фактором становится производственная мощность, и каскад перестраивается.",
          explanation_uz:
            "Asosiy byudjet omili - natijani oxir-oqibat cheklaydigan har qanday resurs. Aksariyat firmalar uchun bu sotuv talabidir - ular bozor sotib oladiganidan ko'proq ishlab chiqara oladi. Sotuv cheklovchi omil bo'lganda, sotuv byudjeti birinchi quriladi; qolgan hammasi (ishlab chiqarish, materiallar, mehnat) undan kaskad bo'yicha tushadi. Quvvatga yetgan firmalar uchun (masalan, tanqislik paytidagi yarimo'tkazgichlar) ishlab chiqarish quvvati cheklovchi omilga aylanadi va kaskad qayta tartiblanadi.",
        },
        // -------- Q2 - easy MCQ on flexed budget --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en: "A flexible (flexed) budget is one that:",
          prompt_ru: "Гибкий бюджет - это бюджет, который:",
          prompt_uz: "Moslashuvchan (moslashtirilgan) byudjet quyidagicha:",
          options: [
            {
              key: "A",
              text_en: "Remains unchanged regardless of actual activity",
              text_ru:
                "Остаётся неизменным независимо от фактической активности",
              text_uz: "Haqiqiy faollikdan qat'i nazar o'zgarmaydi",
              why_wrong_en:
                "That describes a FIXED budget; the flexed budget changes with actual activity by definition.",
              why_wrong_ru:
                "Это описание ФИКСИРОВАННОГО бюджета; гибкий по определению меняется в зависимости от фактической активности.",
              why_wrong_uz:
                "Bu O'ZGARMAS byudjetni ta'riflaydi; moslashtirilgan byudjet ta'rifan haqiqiy faollik bilan o'zgaradi.",
            },
            {
              key: "B",
              text_en: "Has been restated for the actual level of activity",
              text_ru: "Пересчитан под фактический уровень активности",
              text_uz: "Haqiqiy faollik darajasi uchun qayta hisoblangan",
            },
            {
              key: "C",
              text_en: "Allows unlimited overspending",
              text_ru: "Разрешает неограниченный перерасход",
              text_uz: "Cheksiz ortiqcha sarflashga ruxsat beradi",
              why_wrong_en:
                '"Flexible" refers to flexing for activity LEVEL, not flexibility on whether to overspend.',
              why_wrong_ru:
                "«Гибкий» относится к пересчёту под УРОВЕНЬ активности, а не к свободе тратить сверх плана.",
              why_wrong_uz:
                '"Moslashuvchan" faollik DARAJASI uchun moslashtirishni anglatadi, ortiqcha sarflash-sarflamaslikdagi moslashuvchanlikni emas.',
            },
            {
              key: "D",
              text_en: "Covers only fixed costs",
              text_ru: "Включает только постоянные затраты",
              text_uz: "Faqat o'zgarmas xarajatlarni qamrab oladi",
              why_wrong_en:
                "A flexed budget includes both fixed AND variable costs; only the variable portion changes with activity.",
              why_wrong_ru:
                "Гибкий бюджет включает И постоянные, И переменные затраты; с активностью меняется только переменная часть.",
              why_wrong_uz:
                "Moslashtirilgan byudjet ham o'zgarmas, HAM o'zgaruvchan xarajatlarni o'z ichiga oladi; faqat o'zgaruvchan qism faollik bilan o'zgaradi.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            'Flexing recalculates the budget at the ACTUAL activity level by adjusting variable costs and revenues proportionally while keeping fixed costs unchanged. This gives a fair comparison: if you budgeted to produce 10,000 units but only made 8,000, your variance analysis must compare actual results to a budget restated for 8,000 \u2014 not the original 10,000 budget. Otherwise the "volume variance" will mask the real efficiency story.',
          explanation_ru:
            "Пересчёт перестраивает бюджет под ФАКТИЧЕСКИЙ уровень активности, пропорционально корректируя переменные затраты и выручку, при этом постоянные затраты остаются без изменений. Это обеспечивает справедливое сравнение: если в бюджете было 10 000 единиц, а сделано 8 000, для анализа отклонений нужно сравнивать с бюджетом, пересчитанным на 8 000, а не с исходным на 10 000. Иначе «отклонение по объёму» скроет реальную картину эффективности.",
          explanation_uz:
            "Moslashtirish byudjetni HAQIQIY faollik darajasida o'zgaruvchan xarajatlar va daromadlarni mutanosib ravishda moslashtirib, o'zgarmas xarajatlarni o'zgarmagan holda qoldirib qayta hisoblaydi. Bu adolatli taqqoslash beradi: agar 10 000 birlik ishlab chiqarishni byudjetlagan bo'lsangiz, ammo faqat 8 000 ta yasagan bo'lsangiz, og'ish tahlilingiz haqiqiy natijalarni dastlabki 10 000 byudjet bilan emas, 8 000 uchun qayta hisoblangan byudjet bilan solishtirishi kerak. Aks holda \"hajm og'ishi\" haqiqiy samaradorlik holatini yashiradi.",
        },
        // -------- Q3 - easy short_answer on budget types --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "Which budgeting approach requires every cost item to be justified from scratch each period, with no presumption that last year's figure is correct?",
          prompt_ru:
            "Какой подход к бюджетированию требует обосновывать каждую статью затрат заново в каждом периоде, не предполагая, что прошлогодняя цифра верна?",
          prompt_uz:
            "Qaysi byudjetlashtirish yondashuvi har bir xarajat moddasini har davrda noldan, o'tgan yilgi raqam to'g'ri degan taxminsiz asoslashni talab qiladi?",
          options: [
            {
              key: "A",
              text_en: "Zero-based budgeting (ZBB)",
              text_ru: "Бюджетирование с нуля (ZBB)",
              text_uz: "Noldan boshlangan byudjetlashtirish (ZBB)",
            },
            {
              key: "B",
              text_en: "Incremental budgeting",
              text_ru: "Приростное бюджетирование",
              text_uz: "Ortib boruvchi byudjetlashtirish",
              why_wrong_en:
                "Incremental budgeting starts from last year's figures and adjusts them - the very presumption ZBB rejects.",
              why_wrong_ru:
                "Приростное бюджетирование исходит из прошлогодних цифр и корректирует их - именно это предположение ZBB отвергает.",
              why_wrong_uz:
                "Ortib boruvchi byudjetlashtirish o'tgan yilgi raqamlardan boshlanib ularni moslashtiradi - aynan ZBB rad etadigan taxmin.",
            },
            {
              key: "C",
              text_en: "Rolling budgeting",
              text_ru: "Скользящее бюджетирование",
              text_uz: "Aylanuvchi byudjetlashtirish",
              why_wrong_en:
                "A rolling budget is continuously updated by adding a new period as one expires; it does not require justifying every item from zero.",
              why_wrong_ru:
                "Скользящий бюджет постоянно обновляется добавлением нового периода взамен истёкшего; он не требует обоснования каждой статьи с нуля.",
              why_wrong_uz:
                "Aylanuvchi byudjet biri tugaganda yangi davr qo'shilib doimo yangilanadi; u har bir moddani noldan asoslashni talab qilmaydi.",
            },
            {
              key: "D",
              text_en: "Flexible budgeting",
              text_ru: "Гибкое бюджетирование",
              text_uz: "Moslashuvchan byudjetlashtirish",
              why_wrong_en:
                "A flexible budget is flexed to the actual activity level for control purposes; it is not about re-justifying every cost from scratch.",
              why_wrong_ru:
                "Гибкий бюджет пересчитывается под фактический уровень активности для контроля; он не связан с повторным обоснованием каждой статьи с нуля.",
              why_wrong_uz:
                "Moslashuvchan byudjet nazorat maqsadida haqiqiy faollik darajasiga moslashtiriladi; u har bir xarajatni noldan qayta asoslash haqida emas.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Zero-based budgeting starts from zero each period: every activity and cost must be re-justified. It forces managers to question entrenched spending but is time-consuming, so many firms apply it selectively rather than annually. The opposite extreme is incremental budgeting.",
          explanation_ru:
            "Бюджетирование с нуля начинает каждый период с нуля: каждая деятельность и затрата должны быть заново обоснованы. Оно заставляет менеджеров пересматривать укоренившиеся расходы, но трудоёмко, поэтому многие фирмы применяют его выборочно, а не ежегодно. Противоположная крайность - приростное бюджетирование.",
          explanation_uz:
            "Noldan boshlangan byudjetlashtirish har davrda noldan boshlanadi: har bir faoliyat va xarajat qayta asoslanishi kerak. U menejerlarni o'rnashib qolgan sarflashni shubha ostiga olishga majbur qiladi, ammo vaqt talab qiladi, shuning uchun ko'plab firmalar uni yiliga emas, tanlab qo'llaydi. Qarama-qarshi chekka - ortib boruvchi byudjetlashtirishdir.",
        },
        // -------- Q4 - easy MCQ on participative budget --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "A participative (bottom-up) budgeting approach is one where:",
          prompt_ru:
            "Партисипативный (снизу вверх) подход к бюджетированию - это подход, при котором:",
          prompt_uz:
            "Ishtirokchi (pastdan yuqoriga) byudjetlashtirish yondashuvi quyidagicha:",
          options: [
            {
              key: "A",
              text_en: "Senior management imposes targets without consultation",
              text_ru: "Высшее руководство устанавливает цели без обсуждения",
              text_uz: "Oliy rahbariyat maslahatsiz maqsadlarni yuklaydi",
              why_wrong_en:
                "That's a TOP-DOWN (imposed) budget; participative is the opposite.",
              why_wrong_ru:
                "Это бюджет «СВЕРХУ ВНИЗ» (навязанный); партисипативный - противоположность.",
              why_wrong_uz:
                "Bu YUQORIDAN PASTGA (yuklangan) byudjet; ishtirokchi esa aksincha.",
            },
            {
              key: "B",
              text_en:
                "Operational managers and their teams contribute to setting their own budgets",
              text_ru:
                "Операционные руководители и их команды участвуют в формировании своих бюджетов",
              text_uz:
                "Operatsion menejerlar va ularning jamoalari o'z byudjetlarini belgilashga hissa qo'shadi",
            },
            {
              key: "C",
              text_en: "The CFO writes the budget alone",
              text_ru: "Бюджет пишет в одиночку финансовый директор",
              text_uz: "Moliyaviy direktor (CFO) byudjetni yakka o'zi yozadi",
              why_wrong_en:
                "A budget written by one person is the opposite of participative.",
              why_wrong_ru:
                "Бюджет, написанный одним человеком, - противоположность партисипативному.",
              why_wrong_uz:
                "Bitta shaxs yozgan byudjet ishtirokchining aksidir.",
            },
            {
              key: "D",
              text_en: "Budgets are set automatically by software",
              text_ru: "Бюджеты задаются автоматически программой",
              text_uz:
                "Byudjetlar dasturiy ta'minot tomonidan avtomatik belgilanadi",
              why_wrong_en:
                "Software automation is unrelated to who contributes input; the question is about people, not tools.",
              why_wrong_ru:
                "Автоматизация программой не связана с тем, кто вносит вклад; вопрос про людей, а не инструменты.",
              why_wrong_uz:
                "Dasturiy avtomatlashtirish kim hissa qo'shishiga aloqasi yo'q; savol vositalar emas, odamlar haqida.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Participative budgets involve those responsible for execution in setting the targets. Benefits: better data quality (front-line people know operational reality), higher motivation (people are more committed to numbers they helped set), better forecasts on the ground. Risks: budgetary slack \u2014 managers may deliberately propose easy targets to look good against them. The fix is independent challenge during the budget review process.",
          explanation_ru:
            "Партисипативные бюджеты вовлекают тех, кто отвечает за исполнение, в постановку целей. Плюсы: качество данных выше (передовая знает операционную реальность), мотивация выше (люди привержены цифрам, в постановке которых участвовали), точнее прогнозы. Риски: бюджетная слабина - менеджеры могут намеренно предлагать лёгкие цели, чтобы хорошо выглядеть на их фоне. Лечение - независимый контроль на этапе рассмотрения.",
          explanation_uz:
            "Ishtirokchi byudjetlar bajarish uchun mas'ul kishilarni maqsadlarni belgilashga jalb qiladi. Afzalliklari: yaxshiroq ma'lumot sifati (birinchi qator odamlar operatsion voqelikni biladi), yuqori motivatsiya (odamlar o'zlari belgilashga yordam bergan raqamlarga ko'proq sodiq), maydonda yaxshiroq prognozlar. Xavflari: byudjet bo'shlig'i - menejerlar o'ziga yaxshi ko'rinish uchun ataylab oson maqsadlar taklif qilishi mumkin. Yechim - byudjetni ko'rib chiqish jarayonida mustaqil tanqid.",
        },
        // -------- Q5 - medium NUMBER_ENTRY on payback period --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "A project requires an initial outlay of $50,000 and generates cash inflows of $15,000, $20,000, $20,000, $25,000 in years 1\u20134 respectively. What is the PAYBACK PERIOD in years (assume cash flows occur evenly within each year, give answer to 1 decimal place)?",
          prompt_ru:
            "Проект требует первоначальных вложений $50 000 и приносит денежные поступления $15 000, $20 000, $20 000, $25 000 в годах 1–4 соответственно. Каков СРОК ОКУПАЕМОСТИ в годах (примите, что потоки распределяются равномерно внутри года; ответ с точностью до 1 знака)?",
          prompt_uz:
            "Loyiha 50 000 dollar dastlabki sarfni talab qiladi va 1-4-yillarda mos ravishda 15 000, 20 000, 20 000, 25 000 dollar pul tushumlarini hosil qiladi. QOPLANISH DAVRI yillarda qancha (pul oqimlari har yil ichida bir tekis sodir bo'ladi deb taxmin qiling, javobni 1 kasr xonagacha bering)?",
          correct_answer_en: "2.75",
          acceptable_tolerance: 0.05,
          explanation_en:
            "Cumulative cash inflows: end of Yr1 = 15,000; end of Yr2 = 35,000; end of Yr3 = 55,000. The initial $50,000 is recovered DURING Year 3. Shortfall at end of Year 2 = 50,000 − 35,000 = $15,000. Year 3 inflow = $20,000. Fraction of Year 3 needed = 15,000 / 20,000 = 0.75 of the year. Payback = 2 years + 0.75 of year 3 = 2.75 years. Payback ignores time value of money and post-payback cash flows; the $25,000 in Year 4 is invisible to this metric.",
          explanation_ru:
            "Накопленные поступления: конец Y1 = 15 000; конец Y2 = 35 000; конец Y3 = 55 000. Первоначальные $50 000 окупаются В ТЕЧЕНИЕ года 3. Недостача на конец Y2 = 50 000 − 35 000 = $15 000. Поступление Y3 = $20 000. Доля Y3 = 15 000 / 20 000 = 0,75 года. Окупаемость = 2 года + 0,75 = 2,75 года. Метод игнорирует временную стоимость денег и потоки после окупаемости; $25 000 в году 4 для этой метрики «невидимы».",
          explanation_uz:
            "Jami pul tushumlari: 1-yil oxiri = 15 000; 2-yil oxiri = 35 000; 3-yil oxiri = 55 000. Dastlabki 50 000 dollar 3-yil DAVOMIDA qoplanadi. 2-yil oxiridagi kamomad = 50 000 - 35 000 = 15 000 dollar. 3-yil tushumi = 20 000 dollar. 3-yilning kerakli ulushi = 15 000 / 20 000 = yilning 0,75 qismi. Qoplanish = 2 yil + 3-yilning 0,75 qismi = 2,75 yil. Qoplanish pulning vaqt qiymati va qoplanishdan keyingi pul oqimlarini e'tiborsiz qoldiradi; 4-yildagi 25 000 dollar bu ko'rsatkichga ko'rinmaydi.",
        },
        // -------- Q6 - medium NUMBER_ENTRY on ARR --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "An asset costs $80,000 with no residual value and useful life of 4 years. Average annual ACCOUNTING profit over the four years is $12,000. Calculate the Accounting Rate of Return (ARR) using AVERAGE investment as the base (give answer as a percentage to 1 decimal place).",
          prompt_ru:
            "Актив стоит $80 000 без ликвидационной стоимости со сроком полезного использования 4 года. Средняя годовая УЧЁТНАЯ прибыль за 4 года - $12 000. Рассчитайте учётную норму доходности (ARR) по СРЕДНИМ инвестициям (ответ в процентах с точностью до 1 знака).",
          prompt_uz:
            "Aktiv 80 000 dollar turadi, qoldiq qiymatsiz va foydali xizmat muddati 4 yil. To'rt yil davomidagi o'rtacha yillik HISOB foydasi 12 000 dollar. O'RTACHA sarmoyani baza sifatida ishlatib Hisob Foyda Stavkasini (ARR) hisoblang (javobni 1 kasr xonagacha foiz sifatida bering).",
          correct_answer_en: "30",
          acceptable_tolerance: 0.5,
          explanation_en:
            "Average investment = (initial cost + residual value) / 2 = (80,000 + 0) / 2 = $40,000. ARR = average profit / average investment \u00d7 100 = 12,000 / 40,000 \u00d7 100 = 30%. If you used INITIAL investment as the base instead, ARR = 12,000 / 80,000 \u00d7 100 = 15%. The question specifies AVERAGE investment, which assumes the asset is depreciated to zero straight-line. Common exam trap: students using initial investment when average was asked, or vice versa.",
          explanation_ru:
            "Средние инвестиции = (первоначальная стоимость + ликвидационная) / 2 = (80 000 + 0) / 2 = $40 000. ARR = средняя прибыль / средние инвестиции × 100 = 12 000 / 40 000 × 100 = 30%. Если бы использовалась ПЕРВОНАЧАЛЬНАЯ инвестиция, ARR = 12 000 / 80 000 × 100 = 15%. В вопросе указано СРЕДНЯЯ инвестиция, что подразумевает линейную амортизацию до нуля. Типичная ловушка: использовать первоначальную при вопросе о средней, или наоборот.",
          explanation_uz:
            "O'rtacha sarmoya = (dastlabki xarajat + qoldiq qiymat) / 2 = (80 000 + 0) / 2 = 40 000 dollar. ARR = o'rtacha foyda / o'rtacha sarmoya x 100 = 12 000 / 40 000 x 100 = 30%. Agar uning o'rniga DASTLABKI sarmoyani baza sifatida ishlatsangiz, ARR = 12 000 / 80 000 x 100 = 15%. Savol O'RTACHA sarmoyani belgilaydi, bu aktiv to'g'ri chiziqli usulda nolgacha amortizatsiya qilinishini taxmin qiladi. Keng tarqalgan imtihon tuzog'i: o'rtacha so'ralganda dastlabki sarmoyani ishlatuvchi talabalar yoki aksincha.",
        },
        // -------- Q7 - medium NUMBER_ENTRY on NPV calc --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "A project requires $100,000 upfront and generates $60,000 at the end of year 1 and $70,000 at the end of year 2. The cost of capital is 10%. What is the NPV (in $, to the nearest $)?",
          prompt_ru:
            "Проект требует $100 000 в начале и приносит $60 000 в конце года 1 и $70 000 в конце года 2. Стоимость капитала - 10%. Чему равна NPV (в $, до ближайшего $)?",
          prompt_uz:
            "Loyiha oldindan 100 000 dollarni talab qiladi va 1-yil oxirida 60 000 dollar hamda 2-yil oxirida 70 000 dollarni hosil qiladi. Kapital narxi 10%. NPV qancha (dollarda, eng yaqin dollargacha)?",
          correct_answer_en: "12396",
          acceptable_tolerance: 50,
          explanation_en:
            "Discount factors at 10%: Year 1 = 1/1.10 = 0.9091; Year 2 = 1/1.10\u00b2 = 0.8264. Present value of cash inflows = (60,000 \u00d7 0.9091) + (70,000 \u00d7 0.8264) = 54,545 + 57,851 = 112,396. NPV = 112,396 \u2212 100,000 = $12,396 (rounding to nearest $ gives 12,396 or 12,397 depending on which rounded factors are used). NPV > 0 \u2192 ACCEPT: the project adds value at the 10% cost of capital. Tolerance of \u00b150 accounts for discount-factor rounding.",
          explanation_ru:
            "Коэффициенты дисконтирования при 10%: Y1 = 1/1,10 = 0,9091; Y2 = 1/1,10² = 0,8264. Приведённая стоимость поступлений = (60 000 × 0,9091) + (70 000 × 0,8264) = 54 545 + 57 851 = 112 396. NPV = 112 396 − 100 000 = $12 396 (округление до $ даёт 12 396 или 12 397 в зависимости от используемых округлённых коэффициентов). NPV > 0 → ПРИНЯТЬ: проект добавляет стоимость при стоимости капитала 10%. Допуск ±50 учитывает округление коэффициентов.",
          explanation_uz:
            "10% dagi diskont omillari: 1-yil = 1/1,10 = 0,9091; 2-yil = 1/1,10 kvadrat = 0,8264. Pul tushumlarining joriy qiymati = (60 000 x 0,9091) + (70 000 x 0,8264) = 54 545 + 57 851 = 112 396. NPV = 112 396 - 100 000 = 12 396 dollar (eng yaqin dollargacha yaxlitlash qaysi yaxlitlangan omillar ishlatilishiga qarab 12 396 yoki 12 397 beradi). NPV > 0 -> QABUL QILING: loyiha 10% kapital narxida qiymat qo'shadi. ±50 chegara diskont omili yaxlitlashini hisobga oladi.",
        },
        // -------- Q8 - medium MCQ on NPV vs IRR --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A project has NPV of +$5,000 at the company\u2019s cost of capital of 12%. The Internal Rate of Return (IRR) must therefore be:",
          prompt_ru:
            "NPV проекта = +$5 000 при стоимости капитала компании 12%. Внутренняя норма доходности (IRR) должна быть, соответственно:",
          prompt_uz:
            "Loyihaning NPV kompaniyaning 12% kapital narxida +5 000 dollar. Demak, Ichki Foyda Stavkasi (IRR) quyidagicha bo'lishi kerak:",
          options: [
            {
              key: "A",
              text_en: "Below 12%",
              text_ru: "Ниже 12%",
              text_uz: "12% dan past",
              why_wrong_en:
                "If IRR were below 12%, the NPV at 12% would be NEGATIVE, not positive.",
              why_wrong_ru:
                "Если бы IRR была ниже 12%, NPV при 12% была бы ОТРИЦАТЕЛЬНОЙ, а не положительной.",
              why_wrong_uz:
                "Agar IRR 12% dan past bo'lsa, 12% dagi NPV musbat emas, MANFIY bo'lardi.",
            },
            {
              key: "B",
              text_en: "Exactly 12%",
              text_ru: "Ровно 12%",
              text_uz: "Aniq 12%",
              why_wrong_en:
                "IRR is the rate at which NPV = 0; if NPV at 12% is positive, IRR is HIGHER than 12%.",
              why_wrong_ru:
                "IRR - ставка, при которой NPV = 0; если NPV при 12% положительна, то IRR ВЫШЕ 12%.",
              why_wrong_uz:
                "IRR - NPV = 0 bo'lgan stavka; agar 12% dagi NPV musbat bo'lsa, IRR 12% dan YUQORIROQdir.",
            },
            {
              key: "C",
              text_en: "Above 12%",
              text_ru: "Выше 12%",
              text_uz: "12% dan yuqori",
            },
            {
              key: "D",
              text_en: "Exactly equal to the NPV value",
              text_ru: "Ровно равной значению NPV",
              text_uz: "Aniq NPV qiymatiga teng",
              why_wrong_en:
                "IRR is a percentage rate; NPV is a $ amount. They have different units \u2014 they cannot be equal.",
              why_wrong_ru:
                "IRR - это процентная ставка; NPV - сумма в $. У них разные единицы, они не могут быть равны.",
              why_wrong_uz:
                "IRR - foiz stavkasi; NPV - dollar miqdori. Ular turli birliklarga ega - ular teng bo'la olmaydi.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "IRR is the discount rate at which NPV = 0. NPV is a decreasing function of the discount rate \u2014 raise the rate, NPV falls. If at 12% NPV is still positive ($5,000), then the rate must be raised ABOVE 12% to push NPV down to zero, which is the IRR. Decision rules: accept when NPV > 0 (which is equivalent to accept when IRR > cost of capital). Both methods agree on accept/reject for independent projects; they can disagree when ranking competing projects, in which case NPV wins because it measures absolute value added.",
          explanation_ru:
            "IRR - ставка дисконтирования, при которой NPV = 0. NPV - убывающая функция ставки: поднимая ставку, NPV снижается. Если при 12% NPV ещё положительна ($5 000), ставку нужно поднять ВЫШЕ 12%, чтобы довести NPV до нуля, и это и есть IRR. Правила решения: принимать при NPV > 0 (что эквивалентно IRR > стоимости капитала). Для отдельных проектов оба метода дают одинаковое решение; при ранжировании конкурирующих проектов они могут расходиться, и тогда побеждает NPV, поскольку измеряет абсолютную добавленную стоимость.",
          explanation_uz:
            "IRR - NPV = 0 bo'lgan diskont stavkasi. NPV diskont stavkasining kamayuvchi funksiyasidir - stavkani oshiring, NPV pasayadi. Agar 12% da NPV hamon musbat (5 000 dollar) bo'lsa, NPVni nolgacha tushirish uchun stavka 12% dan YUQORIROQ ko'tarilishi kerak, bu esa IRRdir. Qaror qoidalari: NPV > 0 bo'lganda qabul qiling (bu IRR > kapital narxi bo'lganda qabul qilishga teng). Ikkala usul ham mustaqil loyihalar uchun qabul/rad bo'yicha kelishadi; raqobatlashuvchi loyihalarni saralashda ular kelishmasligi mumkin, bunday holatda NPV g'olib bo'ladi, chunki u qo'shilgan mutlaq qiymatni o'lchaydi.",
        },
        // -------- Q9 - medium MCQ on rolling budget --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A rolling (continuous) budget is BEST described as one that:",
          prompt_ru:
            "Скользящий (непрерывный) бюджет ЛУЧШЕ всего описывается как бюджет, который:",
          prompt_uz:
            "Aylanuvchi (uzluksiz) byudjet ENG yaxshi quyidagicha tavsiflanadi:",
          options: [
            {
              key: "A",
              text_en: "Is updated every five years",
              text_ru: "Обновляется каждые пять лет",
              text_uz: "Har besh yilda yangilanadi",
              why_wrong_en:
                "A 5-year cycle is strategic planning territory; rolling budgets are updated continuously, typically monthly or quarterly.",
              why_wrong_ru:
                "5-летний цикл - территория стратегического планирования; скользящие бюджеты обновляются постоянно, обычно ежемесячно или ежеквартально.",
              why_wrong_uz:
                "5 yillik sikl - strategik rejalashtirish hududi; aylanuvchi byudjetlar uzluksiz, odatda oylik yoki choraklik yangilanadi.",
            },
            {
              key: "B",
              text_en:
                "Is continuously extended by adding a new future period as the current one elapses",
              text_ru:
                "Постоянно продлевается добавлением нового будущего периода по мере истечения текущего",
              text_uz:
                "Joriysi o'tib borishi bilan yangi kelajak davri qo'shilib doimo cho'ziladi",
            },
            {
              key: "C",
              text_en: "Permits unlimited spending",
              text_ru: "Разрешает неограниченные расходы",
              text_uz: "Cheksiz sarflashga ruxsat beradi",
              why_wrong_en:
                "Spending discipline is unrelated to whether the budget rolls or is fixed.",
              why_wrong_ru:
                "Дисциплина расходов не связана с тем, скользящий бюджет или фиксированный.",
              why_wrong_uz:
                "Sarflash intizomi byudjet aylanishi yoki o'zgarmasligiga aloqasi yo'q.",
            },
            {
              key: "D",
              text_en: "Has no end date",
              text_ru: "Не имеет даты окончания",
              text_uz: "Tugash sanasi yo'q",
              why_wrong_en:
                "A rolling budget always covers a defined horizon (e.g. always the next 12 months); the horizon rolls forward, but at any moment there is a defined period.",
              why_wrong_ru:
                "Скользящий бюджет всегда покрывает определённый горизонт (например, всегда следующие 12 месяцев); горизонт смещается, но в любой момент период определён.",
              why_wrong_uz:
                "Aylanuvchi byudjet har doim belgilangan ufqni qamrab oladi (masalan, doimo keyingi 12 oy); ufq oldinga aylanadi, ammo har qanday daqiqada belgilangan davr bor.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Rolling budget maintains a constant forward horizon: as one month/quarter ends, a new one at the far end is added. Example: a 12-month rolling budget on 1 February covers Feb-Jan; on 1 March, the original Feb has elapsed and a new Feb (12 months out) is added. Pros: budget is always current, encourages continuous re-forecasting. Cons: time-consuming, can dilute the seriousness of any single set of figures (always provisional).",
          explanation_ru:
            "Скользящий бюджет удерживает постоянный горизонт вперёд: с истечением месяца/квартала добавляется новый период в дальнем конце. Пример: 12-месячный скользящий бюджет на 1 февраля покрывает февраль-январь; на 1 марта февраль уже истёк, добавляется новый февраль (через 12 месяцев). Плюсы: бюджет всегда актуален, стимулирует непрерывное перепрогнозирование. Минусы: трудоёмко, может ослаблять серьёзность любой одной версии (всегда «предварительная»).",
          explanation_uz:
            "Aylanuvchi byudjet doimiy oldinga qaragan ufqni saqlaydi: bir oy/chorak tugaganda, eng uzoq uchida yangisi qo'shiladi. Misol: 1-fevralda 12 oylik aylanuvchi byudjet fevral-yanvarni qamrab oladi; 1-martda dastlabki fevral o'tib, yangi fevral (12 oy keyin) qo'shiladi. Afzalliklari: byudjet doimo joriy, uzluksiz qayta prognoz qilishni rag'batlantiradi. Kamchiliklari: vaqt talab qiladi, har qanday yagona raqamlar to'plamining jiddiyligini susaytirishi mumkin (doimo vaqtinchalik).",
        },
        // -------- Q10 - medium NUMBER_ENTRY on flexed budget calc --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "Original budget for 10,000 units: variable cost $40,000, fixed cost $30,000. Actual production = 8,000 units. What is the FLEXED total cost (in $)?",
          prompt_ru:
            "Исходный бюджет на 10 000 единиц: переменные затраты $40 000, постоянные $30 000. Фактическое производство = 8 000 единиц. Каковы ПЕРЕСЧИТАННЫЕ общие затраты (в $)?",
          prompt_uz:
            "10 000 birlik uchun dastlabki byudjet: o'zgaruvchan xarajat 40 000 dollar, o'zgarmas xarajat 30 000 dollar. Haqiqiy ishlab chiqarish = 8 000 birlik. MOSLASHTIRILGAN umumiy xarajat qancha (dollarda)?",
          correct_answer_en: "62000",
          acceptable_tolerance: 1,
          explanation_en:
            "Variable cost per unit = $40,000 / 10,000 = $4. Flexed variable cost for 8,000 units = $4 \u00d7 8,000 = $32,000. Fixed cost stays at $30,000 (doesn't change with activity). Flexed total = 32,000 + 30,000 = $62,000. The whole point of flexing: this $62,000 is now a fair benchmark for actual costs. Comparing actual against the ORIGINAL $70,000 budget would mask whether costs were well-controlled \u2014 the firm produced 20% fewer units, so naturally spent less in absolute terms.",
          explanation_ru:
            "Переменные затраты на единицу = $40 000 / 10 000 = $4. Пересчитанные переменные для 8 000 единиц = $4 × 8 000 = $32 000. Постоянные = $30 000 (не зависят от объёма). Пересчитанный итог = 32 000 + 30 000 = $62 000. В этом и смысл пересчёта: $62 000 теперь корректный ориентир для сравнения с фактом. Сравнение с ИСХОДНЫМ бюджетом $70 000 скроет, насколько хорошо контролировались затраты - выпуск на 20% меньше, поэтому в абсолютном выражении и потрачено меньше.",
          explanation_uz:
            "Birlik uchun o'zgaruvchan xarajat = 40 000 dollar / 10 000 = 4 dollar. 8 000 birlik uchun moslashtirilgan o'zgaruvchan xarajat = 4 dollar x 8 000 = 32 000 dollar. O'zgarmas xarajat 30 000 dollarda qoladi (faollik bilan o'zgarmaydi). Moslashtirilgan umumiy = 32 000 + 30 000 = 62 000 dollar. Moslashtirishning butun maqsadi: bu 62 000 dollar endi haqiqiy xarajatlar uchun adolatli mezondir. Haqiqiyni DASTLABKI 70 000 dollar byudjet bilan solishtirish xarajatlar yaxshi nazorat qilinganmi-yo'qmi yashiradi - firma 20% kam birlik ishlab chiqardi, shuning uchun tabiiy ravishda mutlaq jihatdan kamroq sarfladi.",
        },
        // -------- Q11 - medium MCQ on budgetary slack --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en: '"Budgetary slack" refers to:',
          prompt_ru: "«Бюджетная слабина» означает:",
          prompt_uz:
            "\"Byudjet bo'shlig'i\" (budgetary slack) quyidagini anglatadi:",
          options: [
            {
              key: "A",
              text_en: "Unused time in the budget meeting agenda",
              text_ru: "Незанятое время в повестке бюджетного совещания",
              text_uz: "Byudjet yig'ilishi kun tartibidagi ishlatilmagan vaqt",
              why_wrong_en:
                'This takes "slack" too literally; it\'s a technical term about deliberately easy targets.',
              why_wrong_ru:
                "Это слишком буквальное прочтение «слабины»; это технический термин о намеренно лёгких целях.",
              why_wrong_uz:
                "Bu \"bo'shliq\"ni juda so'zma-so'z oladi; bu ataylab oson maqsadlar haqidagi texnik atamadir.",
            },
            {
              key: "B",
              text_en:
                "Managers deliberately setting easy targets so they can outperform them",
              text_ru:
                "Менеджеры намеренно ставят лёгкие цели, чтобы их перевыполнять",
              text_uz:
                "Menejerlar oson maqsadlarni ataylab belgilab, ulardan oshib ketishi uchun",
            },
            {
              key: "C",
              text_en: "Random forecast error",
              text_ru: "Случайная ошибка прогноза",
              text_uz: "Tasodifiy prognoz xatosi",
              why_wrong_en:
                "Slack is DELIBERATE distortion, not random error. Random errors cancel out on average; slack systematically lowers targets.",
              why_wrong_ru:
                "Слабина - НАМЕРЕННОЕ искажение, не случайная ошибка. Случайные ошибки в среднем гасят друг друга; слабина систематически занижает цели.",
              why_wrong_uz:
                "Bo'shliq - tasodifiy xato emas, ATAYLAB buzish. Tasodifiy xatolar o'rtacha o'zaro bekor bo'ladi; bo'shliq esa maqsadlarni tizimli ravishda pasaytiradi.",
            },
            {
              key: "D",
              text_en: "A buffer between operating and capital budgets",
              text_ru: "Буфер между операционным и капитальным бюджетами",
              text_uz: "Operatsion va kapital byudjetlar o'rtasidagi zaxira",
              why_wrong_en:
                "No such standard concept exists; this is a distractor.",
              why_wrong_ru:
                "Такого стандартного понятия нет; это отвлекающий вариант.",
              why_wrong_uz:
                "Bunday standart tushuncha mavjud emas; bu chalg'ituvchi variant.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            'Budgetary slack occurs when managers responsible for both setting and meeting budgets propose targets they know are easy. Motives: bonus tied to budget achievement, reputation for "reliable" performance, headroom for unforeseen issues. Slack is a known weakness of participative budgeting; safeguards include independent review by senior management or finance, historical benchmark comparison, and rewarding accurate forecasts (not just hitting targets).',
          explanation_ru:
            "Бюджетная слабина возникает, когда менеджеры, отвечающие и за постановку, и за выполнение бюджета, предлагают цели, которые они заведомо могут перевыполнить. Мотивы: бонус, привязанный к выполнению бюджета, репутация «надёжного исполнителя», запас на непредвиденные ситуации. Слабина - известная слабость партисипативного бюджетирования; защитные меры: независимая проверка высшим руководством или финансами, сравнение с историческими ориентирами и вознаграждение за точность прогноза (а не только за выполнение цели).",
          explanation_uz:
            "Byudjet bo'shlig'i byudjetlarni ham belgilash, ham bajarish uchun mas'ul menejerlar o'zlari oson ekanini biladigan maqsadlarni taklif qilganda yuzaga keladi. Sabablar: byudjetga erishishga bog'liq bonus, \"ishonchli\" faoliyat obro'si, kutilmagan muammolar uchun zaxira. Bo'shliq - ishtirokchi byudjetlashtirishning ma'lum zaifligi; himoya choralariga oliy rahbariyat yoki moliya tomonidan mustaqil ko'rib chiqish, tarixiy mezon taqqoslashi va aniq prognozlarni (shunchaki maqsadlarga erishishni emas) rag'batlantirish kiradi.",
        },
        // -------- Q12 - medium short_answer on NPV decision rule --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "What is the correct decision rule for a single investment project under the NPV method?",
          prompt_ru:
            "Каково верное правило принятия решения по одному инвестиционному проекту методом NPV?",
          prompt_uz:
            "NPV usuli bo'yicha yagona sarmoya loyihasi uchun to'g'ri qaror qoidasi nima?",
          options: [
            {
              key: "A",
              text_en: "Accept if NPV is positive; reject if NPV is negative",
              text_ru:
                "Принять, если NPV положителен; отклонить, если NPV отрицателен",
              text_uz:
                "NPV musbat bo'lsa qabul qiling; NPV manfiy bo'lsa rad eting",
            },
            {
              key: "B",
              text_en: "Accept if NPV is negative",
              text_ru: "Принять, если NPV отрицателен",
              text_uz: "NPV manfiy bo'lsa qabul qiling",
              why_wrong_en:
                "A negative NPV means discounted inflows are less than the cost - the project destroys value and should be rejected.",
              why_wrong_ru:
                "Отрицательный NPV означает, что дисконтированные поступления меньше затрат - проект разрушает стоимость и должен быть отклонён.",
              why_wrong_uz:
                "Manfiy NPV diskontlangan tushumlar xarajatdan kamligini bildiradi - loyiha qiymatni yo'q qiladi va rad etilishi kerak.",
            },
            {
              key: "C",
              text_en: "Accept only if NPV equals zero",
              text_ru: "Принять только если NPV равен нулю",
              text_uz: "Faqat NPV nolga teng bo'lsa qabul qiling",
              why_wrong_en:
                "NPV = 0 is the indifference point (just earns the cost of capital); a positive NPV is preferable as it adds value.",
              why_wrong_ru:
                "NPV = 0 - точка безразличия (проект лишь покрывает стоимость капитала); положительный NPV предпочтительнее, так как создаёт стоимость.",
              why_wrong_uz:
                "NPV = 0 - befarqlik nuqtasi (faqat kapital narxini qoplaydi); musbat NPV qiymat qo'shgani uchun afzalroq.",
            },
            {
              key: "D",
              text_en: "Accept if the payback period is under two years",
              text_ru: "Принять, если срок окупаемости менее двух лет",
              text_uz: "Qoplanish davri ikki yildan kam bo'lsa qabul qiling",
              why_wrong_en:
                "That is the payback rule, a different appraisal method; the NPV rule is based on the sign of the net present value.",
              why_wrong_ru:
                "Это правило окупаемости - другой метод оценки; правило NPV основано на знаке чистой приведённой стоимости.",
              why_wrong_uz:
                "Bu qoplanish qoidasi, boshqa baholash usuli; NPV qoidasi esa sof joriy qiymat ishorasiga asoslanadi.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Positive NPV means the project's discounted cash inflows exceed its cost, so the firm is wealthier for doing it; negative NPV destroys value. NPV = 0 is the indifference point. Between competing projects, choose the highest NPV.",
          explanation_ru:
            "Положительный NPV означает, что дисконтированные поступления превышают затраты, и фирма становится богаче; отрицательный NPV разрушает стоимость. NPV = 0 - точка безразличия. При выборе между проектами берут наибольший NPV.",
          explanation_uz:
            "Musbat NPV loyihaning diskontlangan pul tushumlari uning xarajatidan oshishini, ya'ni firma uni amalga oshirishdan boyroq bo'lishini bildiradi; manfiy NPV qiymatni yo'q qiladi. NPV = 0 - befarqlik nuqtasi. Raqobatlashuvchi loyihalar orasidan eng yuqori NPVni tanlang.",
        },
        // -------- Q13 - medium MCQ on incremental budgeting drawback --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en: "The MAIN drawback of incremental budgeting is that it:",
          prompt_ru: "ГЛАВНЫЙ недостаток инкрементного бюджетирования:",
          prompt_uz:
            "Ortib boruvchi byudjetlashtirishning ASOSIY kamchiligi shundaki, u:",
          options: [
            {
              key: "A",
              text_en: "Requires too much detail to be practical",
              text_ru:
                "Требует слишком много детализации для практического применения",
              text_uz: "Amaliy bo'lishi uchun juda ko'p tafsilot talab qiladi",
              why_wrong_en:
                "The opposite is true \u2014 incremental is the LEAST detailed approach; it's ZBB that demands extensive justification.",
              why_wrong_ru:
                "Наоборот - инкрементный наименее детализированный подход; именно ZBB требует обширного обоснования.",
              why_wrong_uz:
                "Aksincha to'g'ri - ortib boruvchi ENG KAM tafsilotli yondashuv; keng asoslashni talab qiladigan esa ZBBdir.",
            },
            {
              key: "B",
              text_en:
                "Perpetuates past inefficiencies and slack into future periods",
              text_ru:
                "Переносит прошлые неэффективности и слабину в будущие периоды",
              text_uz:
                "O'tmishdagi samarasizliklar va bo'shliqni kelajak davrlarga uzaytiradi",
            },
            {
              key: "C",
              text_en: "Cannot incorporate inflation",
              text_ru: "Не позволяет учитывать инфляцию",
              text_uz: "Inflyatsiyani o'z ichiga ololmaydi",
              why_wrong_en:
                "Inflation adjustment is precisely the kind of incremental adjustment this method supports; this is a feature, not a flaw.",
              why_wrong_ru:
                "Корректировка на инфляцию - именно та инкрементная подстройка, которую метод поддерживает; это свойство, а не недостаток.",
              why_wrong_uz:
                "Inflyatsiyani moslashtirish aynan bu usul qo'llab-quvvatlaydigan ortib boruvchi moslashtirish turidir; bu nuqson emas, xususiyatdir.",
            },
            {
              key: "D",
              text_en: "Always produces lower budgets than ZBB",
              text_ru: "Всегда даёт более низкие бюджеты, чем ZBB",
              text_uz: "Har doim ZBBdan pastroq byudjetlar hosil qiladi",
              why_wrong_en:
                "There's no systematic relationship between the two methods' totals; the issue is how the figures are arrived at, not their magnitude.",
              why_wrong_ru:
                "Систематической связи между размером бюджетов в двух методах нет; вопрос в том, как формируются цифры, а не каков их размер.",
              why_wrong_uz:
                "Ikki usul jami o'rtasida tizimli munosabat yo'q; masala raqamlarning kattaligi emas, ularga qanday erishilishidadir.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Incremental budgeting starts from last year's figures and adjusts for inflation, growth or known changes. It's fast and cheap, but it accepts whatever was in last year's budget AS A BASELINE \u2014 including waste, overstaffing, obsolete activities, slack that managers built in previously. Year after year these persist and compound. ZBB is the opposite tool: laborious but forces re-justification. Many firms compromise with periodic deep reviews while running incremental in between.",
          explanation_ru:
            "Инкрементное бюджетирование отталкивается от прошлогодних цифр, корректируя на инфляцию, рост и известные изменения. Метод быстрый и дешёвый, но принимает прошлогодний бюджет КАК ИСХОДНУЮ ТОЧКУ - включая потери, избыточную численность, устаревшие виды деятельности, накопленную ранее слабину. Год за годом это сохраняется и накапливается. ZBB - противоположный инструмент: трудоёмкий, но требует переобоснования. Многие компании идут на компромисс: периодические глубокие пересмотры на фоне инкрементного бюджетирования между ними.",
          explanation_uz:
            "Ortib boruvchi byudjetlashtirish o'tgan yilgi raqamlardan boshlanib inflyatsiya, o'sish yoki ma'lum o'zgarishlar uchun moslashtiriladi. U tez va arzon, ammo o'tgan yilgi byudjetda nima bo'lsa, uni ASOS sifatida qabul qiladi - jumladan isrofgarchilik, ortiqcha xodimlar, eskirgan faoliyatlar, menejerlar ilgari kiritgan bo'shliq. Yildan-yilga bular davom etadi va to'planadi. ZBB - qarama-qarshi vosita: mashaqqatli, ammo qayta asoslashga majbur qiladi. Ko'plab firmalar oralig'ida ortib boruvchini yuritib, davriy chuqur ko'rib chiqishlar bilan murosa qiladi.",
        },
        // -------- Q14 - hard NUMBER_ENTRY on multi-year NPV --------
        {
          type: "number_entry",
          difficulty: "hard",
          prompt_en:
            "A project requires $200,000 upfront and generates $80,000 per year for 4 years. The cost of capital is 8%. The 4-year annuity factor at 8% is 3.312. What is the NPV (in $)?",
          prompt_ru:
            "Проект требует $200 000 в начале и приносит $80 000 в год в течение 4 лет. Стоимость капитала - 8%. Фактор аннуитета на 4 года при 8% = 3,312. Чему равна NPV (в $)?",
          prompt_uz:
            "Loyiha oldindan 200 000 dollarni talab qiladi va 4 yil davomida yiliga 80 000 dollarni hosil qiladi. Kapital narxi 8%. 8% dagi 4 yillik annuitet omili 3,312. NPV qancha (dollarda)?",
          correct_answer_en: "64960",
          acceptable_tolerance: 10,
          explanation_en:
            "When cash flows are EQUAL every year (an annuity), use the annuity factor for speed: PV of annuity = annual cash flow \u00d7 annuity factor = $80,000 \u00d7 3.312 = $264,960. NPV = PV of inflows \u2212 initial outlay = 264,960 \u2212 200,000 = $64,960. The 4-year annuity factor of 3.312 at 8% is the sum of discount factors for years 1\u20134: 0.9259 + 0.8573 + 0.7938 + 0.7350 \u2248 3.312. NPV > 0 \u2192 accept.",
          explanation_ru:
            "Когда потоки ОДИНАКОВЫ каждый год (аннуитет), для скорости используют фактор аннуитета: PV аннуитета = годовой поток × фактор аннуитета = $80 000 × 3,312 = $264 960. NPV = PV поступлений − первоначальные вложения = 264 960 − 200 000 = $64 960. Фактор аннуитета 3,312 на 4 года при 8% - это сумма коэффициентов дисконтирования для лет 1–4: 0,9259 + 0,8573 + 0,7938 + 0,7350 ≈ 3,312. NPV > 0 → принять.",
          explanation_uz:
            "Pul oqimlari har yili TENG bo'lganda (annuitet), tezlik uchun annuitet omilidan foydalaning: annuitetning joriy qiymati = yillik pul oqimi x annuitet omili = 80 000 dollar x 3,312 = 264 960 dollar. NPV = tushumlarning joriy qiymati - dastlabki sarf = 264 960 - 200 000 = 64 960 dollar. 8% dagi 4 yillik 3,312 annuitet omili 1-4-yillar diskont omillarining yig'indisidir: 0,9259 + 0,8573 + 0,7938 + 0,7350 ≈ 3,312. NPV > 0 -> qabul qiling.",
        },
        // -------- Q15 - hard MCQ on integrated investment appraisal --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            "Two mutually exclusive projects are being evaluated. Project X: payback 2 years, NPV $50,000, IRR 20%. Project Y: payback 4 years, NPV $80,000, IRR 14%. The company's cost of capital is 12% and the firm is NOT cash-constrained. Which project should be chosen, and why?",
          prompt_ru:
            "Оцениваются два взаимоисключающих проекта. Проект X: окупаемость 2 года, NPV $50 000, IRR 20%. Проект Y: окупаемость 4 года, NPV $80 000, IRR 14%. Стоимость капитала компании 12%, и фирма НЕ ограничена в денежных средствах. Какой проект выбрать и почему?",
          prompt_uz:
            "Ikkita o'zaro istisno qiluvchi loyiha baholanmoqda. X loyihasi: qoplanish 2 yil, NPV 50 000 dollar, IRR 20%. Y loyihasi: qoplanish 4 yil, NPV 80 000 dollar, IRR 14%. Kompaniyaning kapital narxi 12% va firma naqd pul bilan CHEKLANMAGAN. Qaysi loyiha tanlanishi kerak va nima uchun?",
          options: [
            {
              key: "A",
              text_en:
                "Project X, because its payback is shorter and IRR is higher",
              text_ru:
                "Проект X, поскольку у него короче окупаемость и выше IRR",
              text_uz:
                "X loyihasi, chunki uning qoplanishi qisqaroq va IRRi yuqoriroq",
              why_wrong_en:
                "Payback and IRR can mislead when comparing competing projects; NPV measures absolute value added and should win when there's no cash constraint.",
              why_wrong_ru:
                "Окупаемость и IRR могут вводить в заблуждение при сравнении альтернатив; NPV измеряет абсолютную добавленную стоимость и должна побеждать при отсутствии денежного ограничения.",
              why_wrong_uz:
                "Qoplanish va IRR raqobatlashuvchi loyihalarni solishtirishda chalg'itishi mumkin; NPV qo'shilgan mutlaq qiymatni o'lchaydi va naqd pul cheklovi bo'lmaganda g'olib bo'lishi kerak.",
            },
            {
              key: "B",
              text_en:
                "Project Y, because its NPV is higher \u2014 it adds more value to the firm",
              text_ru:
                "Проект Y, поскольку у него выше NPV - он добавляет больше стоимости фирме",
              text_uz:
                "Y loyihasi, chunki uning NPVi yuqoriroq - u firmaga ko'proq qiymat qo'shadi",
            },
            {
              key: "C",
              text_en:
                "Both, because both have NPV > 0 and IRR > cost of capital",
              text_ru:
                "Оба, так как у обоих NPV > 0 и IRR > стоимости капитала",
              text_uz:
                "Ikkalasi, chunki ikkalasida ham NPV > 0 va IRR > kapital narxi",
              why_wrong_en:
                'The projects are MUTUALLY EXCLUSIVE \u2014 only one can be taken; "both" is not an option.',
              why_wrong_ru:
                "Проекты ВЗАИМОИСКЛЮЧАЮЩИЕ - можно взять только один; вариант «оба» невозможен.",
              why_wrong_uz:
                'Loyihalar O\'ZARO ISTISNO QILUVCHI - faqat bittasini olish mumkin; "ikkalasi" variant emas.',
            },
            {
              key: "D",
              text_en: "Neither, because payback exceeds 1 year for both",
              text_ru: "Ни один, так как окупаемость превышает 1 год у обоих",
              text_uz:
                "Hech qaysi, chunki ikkalasida qoplanish 1 yildan oshadi",
              why_wrong_en:
                "There's no rule that payback must be 1 year; 2-4 years is normal for moderate-term projects. Both projects have positive NPV \u2014 they add value.",
              why_wrong_ru:
                "Нет правила, что окупаемость должна быть 1 год; 2–4 года - нормальный диапазон для среднесрочных проектов. У обоих NPV положительна - они добавляют стоимость.",
              why_wrong_uz:
                "Qoplanish 1 yil bo'lishi kerak degan qoida yo'q; 2-4 yil o'rta muddatli loyihalar uchun odatiy. Ikkala loyihada ham musbat NPV - ular qiymat qo'shadi.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "When projects are mutually exclusive and the firm is not cash-constrained, NPV wins. NPV measures the ABSOLUTE VALUE added in dollars; IRR measures the RATE of return. A high rate of return on a small project can produce LESS total value than a moderate rate on a large project \u2014 which is exactly what's happening here. Project X has a higher IRR (20% vs 14%), but Project Y's larger scale produces a higher NPV ($80,000 vs $50,000). The firm is $30,000 better off choosing Y. Payback is a poor primary criterion because it ignores both time value AND post-payback flows. The standard textbook ranking for unconstrained capital: NPV > IRR > payback. The exception is when capital IS constrained \u2014 then a profitability index per dollar of investment may be needed.",
          explanation_ru:
            "Когда проекты взаимоисключающие и фирма не ограничена в средствах, побеждает NPV. NPV измеряет АБСОЛЮТНУЮ ДОБАВЛЕННУЮ СТОИМОСТЬ в долларах; IRR - СТАВКУ доходности. Высокая ставка на малом проекте может дать МЕНЬШУЮ общую стоимость, чем умеренная ставка на крупном - именно это и происходит здесь. У Проекта X выше IRR (20% против 14%), но больший масштаб Проекта Y даёт более высокую NPV ($80 000 против $50 000). Выбрав Y, фирма получает $30 000 дополнительной стоимости. Окупаемость - плохой главный критерий, потому что игнорирует и временную стоимость денег, И потоки после окупаемости. Стандартный учебный приоритет при отсутствии ограничения капитала: NPV > IRR > окупаемость. Исключение - при ОГРАНИЧЕНИИ капитала, тогда может понадобиться индекс прибыльности на доллар вложений.",
          explanation_uz:
            "Loyihalar o'zaro istisno qiluvchi va firma naqd pul bilan cheklanmagan bo'lsa, NPV g'olib bo'ladi. NPV dollarda qo'shilgan MUTLAQ QIYMATni o'lchaydi; IRR esa foyda STAVKASINI o'lchaydi. Kichik loyihada yuqori foyda stavkasi katta loyihada o'rtacha stavkadan KAMROQ umumiy qiymat hosil qilishi mumkin - aynan shu yerda sodir bo'lmoqda. X loyihasida IRR yuqoriroq (20% va 14%), ammo Y loyihasining kattaroq ko'lami yuqoriroq NPV hosil qiladi (80 000 va 50 000 dollar). Firma Yni tanlash bilan 30 000 dollar boyroq bo'ladi. Qoplanish yomon asosiy mezon, chunki u ham vaqt qiymatini, HAM qoplanishdan keyingi oqimlarni e'tiborsiz qoldiradi. Cheklanmagan kapital uchun standart saralash: NPV > IRR > qoplanish. Istisno - kapital CHEKLANGAN bo'lsa, u holda sarmoyaning har dollari uchun foydalilik indeksi kerak bo'lishi mumkin.",
        },
      ],
    },
    // =============================================================================
    // F2 - Sections E and F (FINAL F2 SECTIONS)
    // Paste-ready: each block replaces the empty LO entry in backend/src/seed/data/f2.ts
    // 15 questions per LO. Mix: 4 easy / 8 medium / 3 hard.
    // =============================================================================

    // ---------- E ----------
    {
      code: "E",
      title_en: "Standard costing",
      title_ru: "Нормативный учёт",
      title_uz: "Standart xarajat hisobi (standard costing)",
      description_en:
        "Standard cost setting, variance calculation and analysis, and profit reconciliation.",
      description_ru:
        "Установление нормативной себестоимости, расчёт и анализ отклонений, сверка прибыли.",
      description_uz:
        "Standart xarajatni belgilash, og'ishni hisoblash va tahlil qilish hamda foydani solishtirish.",
      sort_order: 50,
      theory_en:
        "Standard costing sets a pre-determined cost per unit for each input \u2014 material price, material quantity, labour rate, labour hours, variable and fixed overhead \u2014 based on what cost should be under efficient operating conditions. Standards can be ideal (perfect conditions, demotivating), attainable (challenging but achievable, the most common choice), current (reflects present operating conditions), or basic (unchanged over years, used for trend analysis). The standard cost card lists every input per unit with its standard price and standard quantity.\n\n" +
        "Variance analysis compares actual results against the flexed budget at standard cost, isolating where reality diverged from plan. Each cost element splits into a price/rate variance and a usage/efficiency variance.\n\n" +
        "Material price variance = (Standard Price \u2212 Actual Price) \u00d7 Actual Quantity purchased. Material usage variance = (Standard Quantity for actual output \u2212 Actual Quantity used) \u00d7 Standard Price. Labour rate variance = (Standard Rate \u2212 Actual Rate) \u00d7 Actual Hours. Labour efficiency variance = (Standard Hours for actual output \u2212 Actual Hours worked) \u00d7 Standard Rate. Variable overhead variances follow the same pattern as labour, since variable overhead is typically absorbed on hours. Fixed overhead expenditure variance = Budgeted Fixed Overhead \u2212 Actual Fixed Overhead. Fixed overhead volume variance (under absorption costing only) = (Actual Output \u2212 Budgeted Output) \u00d7 Standard Fixed Overhead per unit, which further splits into capacity (idle vs target hours) and efficiency variances.\n\n" +
        "Sales price variance = (Actual Price \u2212 Standard Price) \u00d7 Actual Sales Units. Sales volume variance = (Actual Sales Units \u2212 Budgeted Sales Units) \u00d7 Standard contribution (marginal costing) or Standard profit (absorption costing) per unit. The operating statement reconciles budgeted profit to actual profit by adding favourable variances and subtracting adverse ones. Variances are flagged for investigation when material in size, persistent in direction, or controllable.",
      theory_ru:
        "Нормативный учёт устанавливает заранее заданную себестоимость единицы для каждого входа - цена материала, его количество, тариф труда, нормо-часы, переменные и постоянные накладные - исходя из того, какой эта себестоимость должна быть при эффективных условиях работы. Нормативы бывают идеальными (идеальные условия, демотивирующие), достижимыми (сложными, но достижимыми - самый частый выбор), текущими (отражают нынешние условия) или базовыми (неизменными годами, для анализа тренда). Карточка нормативной себестоимости перечисляет каждый вход на единицу продукции с его нормативной ценой и нормативным количеством.\n\n" +
        "Анализ отклонений сравнивает фактические результаты с гибким бюджетом по нормативной себестоимости, выявляя расхождения с планом. Каждый элемент затрат раскладывается на отклонение по цене/тарифу и отклонение по использованию/эффективности.\n\n" +
        "Отклонение по цене материалов = (Нормативная цена − Фактическая цена) × Фактически закупленное количество. Отклонение по использованию материалов = (Нормативное количество на фактический выпуск − Фактически использованное количество) × Нормативная цена. Отклонение по тарифу труда = (Нормативная ставка − Фактическая ставка) × Фактические часы. Отклонение по эффективности труда = (Нормативные часы на фактический выпуск − Фактически отработанные часы) × Нормативная ставка. Отклонения по переменным накладным аналогичны труду, так как переменные накладные обычно абсорбируются на часах. Отклонение по расходованию постоянных накладных = Бюджетные постоянные накладные − Фактические постоянные накладные. Отклонение по объёму постоянных накладных (только при абсорбционном учёте) = (Фактический выпуск − Бюджетный выпуск) × Нормативные постоянные накладные на единицу; далее раскладывается на отклонение по мощности (простой против целевых часов) и по эффективности.\n\n" +
        "Отклонение по цене продаж = (Фактическая цена − Нормативная цена) × Фактически проданные единицы. Отклонение по объёму продаж = (Фактический объём − Бюджетный объём) × Нормативный маржинальный доход (маржинальный учёт) или нормативная прибыль (абсорбционный учёт) на единицу. Операционный отчёт сверяет бюджетную прибыль с фактической, прибавляя благоприятные и вычитая неблагоприятные отклонения. Отклонения подлежат расследованию при существенном размере, устойчивом направлении или контролируемости.",
      theory_uz:
        "Standart xarajat hisobi har bir kirish uchun - material narxi, material miqdori, mehnat stavkasi, mehnat soatlari, o'zgaruvchan va o'zgarmas qo'shimcha xarajat - samarali ish sharoitlarida xarajat qancha bo'lishi kerakligiga asoslanib oldindan belgilangan birlik xarajatini o'rnatadi. Standartlar ideal (mukammal sharoitlar, motivatsiyani so'ndiruvchi), erishsa bo'ladigan (qiyin, ammo amalga oshadigan, eng keng tarqalgan tanlov), joriy (hozirgi ish sharoitlarini aks ettiruvchi) yoki bazaviy (yillar davomida o'zgarmas, trend tahlili uchun ishlatiladigan) bo'lishi mumkin. Standart xarajat kartasi har bir kirishni birlik uchun uning standart narxi va standart miqdori bilan sanab o'tadi.\n\nOg'ish tahlili haqiqiy natijalarni standart xarajatdagi moslashtirilgan byudjet bilan solishtiradi va voqelik rejadan qayerda chetga chiqqanini ajratib oladi. Har bir xarajat elementi narx/stavka og'ishi va sarflanish/samaradorlik og'ishiga bo'linadi.\n\nMaterial narxi og'ishi = (Standart Narx - Haqiqiy Narx) x sotib olingan Haqiqiy Miqdor. Material sarflanish og'ishi = (haqiqiy natija uchun Standart Miqdor - ishlatilgan Haqiqiy Miqdor) x Standart Narx. Mehnat stavkasi og'ishi = (Standart Stavka - Haqiqiy Stavka) x Haqiqiy Soatlar. Mehnat samaradorligi og'ishi = (haqiqiy natija uchun Standart Soatlar - ishlangan Haqiqiy Soatlar) x Standart Stavka. O'zgaruvchan qo'shimcha xarajat og'ishlari mehnat bilan bir xil naqshga amal qiladi, chunki o'zgaruvchan qo'shimcha xarajat odatda soatlar bo'yicha yutiladi. O'zgarmas qo'shimcha xarajat sarf og'ishi = Byudjetlangan O'zgarmas Qo'shimcha Xarajat - Haqiqiy O'zgarmas Qo'shimcha Xarajat. O'zgarmas qo'shimcha xarajat hajm og'ishi (faqat to'liq hisobda) = (Haqiqiy Natija - Byudjetlangan Natija) x birlik uchun Standart O'zgarmas Qo'shimcha Xarajat, bu yana quvvat (bo'sh va maqsadli soatlar) va samaradorlik og'ishlariga bo'linadi.\n\nSotuv narxi og'ishi = (Haqiqiy Narx - Standart Narx) x Haqiqiy Sotuv Birliklari. Sotuv hajmi og'ishi = (Haqiqiy Sotuv Birliklari - Byudjetlangan Sotuv Birliklari) x birlik uchun Standart hissa (marjinal hisob) yoki Standart foyda (to'liq hisob). Operatsion hisobot foydali og'ishlarni qo'shib va salbiylarini ayirib byudjetlangan foydani haqiqiy foyda bilan solishtiradi. Og'ishlar o'lcham jihatdan salmoqli, yo'nalish jihatdan barqaror yoki nazorat qilinadigan bo'lganda tekshirish uchun belgilanadi.",
      questions: [
        // -------- Q1 - easy MCQ on standard cost definition --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en: 'A "standard cost" is BEST described as:',
          prompt_ru: "Нормативная себестоимость ЛУЧШЕ всего описывается как:",
          prompt_uz: '"Standart xarajat" ENG yaxshi quyidagicha tavsiflanadi:',
          options: [
            {
              key: "A",
              text_en: "The actual cost incurred in the most recent period",
              text_ru:
                "Фактическая себестоимость, понесённая в последнем периоде",
              text_uz: "So'nggi davrda yuzaga kelgan haqiqiy xarajat",
              why_wrong_en:
                "Actual costs are what happened; standards are what SHOULD happen under efficient conditions.",
              why_wrong_ru:
                "Фактические затраты - это то, что произошло; нормативы - то, что ДОЛЖНО произойти при эффективных условиях.",
              why_wrong_uz:
                "Haqiqiy xarajatlar - nima sodir bo'lgani; standartlar - samarali sharoitlarda nima sodir bo'lishi KERAKligi.",
            },
            {
              key: "B",
              text_en:
                "A pre-determined cost per unit of input or output, set under efficient conditions",
              text_ru:
                "Заранее заданная себестоимость единицы входа или выпуска, определяемая в условиях эффективной работы",
              text_uz:
                "Samarali sharoitlarda belgilangan, kirish yoki natija birligi uchun oldindan belgilangan xarajat",
            },
            {
              key: "C",
              text_en: "The cost permitted by tax authorities",
              text_ru: "Себестоимость, разрешённая налоговыми органами",
              text_uz: "Soliq organlari ruxsat etgan xarajat",
              why_wrong_en:
                "Tax rules don't set internal standards; tax cost categorisation is a separate concept from management standards.",
              why_wrong_ru:
                "Налоговые правила не задают внутренние нормативы; налоговая классификация затрат - отдельный от управленческих нормативов вопрос.",
              why_wrong_uz:
                "Soliq qoidalari ichki standartlarni belgilamaydi; soliq xarajatini tasniflash - boshqaruv standartlaridan alohida tushuncha.",
            },
            {
              key: "D",
              text_en: "The highest possible cost the firm could incur",
              text_ru: "Максимально возможная себестоимость",
              text_uz: "Firma ko'tarishi mumkin bo'lgan eng yuqori xarajat",
              why_wrong_en:
                "Standards are TARGETS for efficiency, not worst-case caps; they're typically set at attainable levels below worst-case.",
              why_wrong_ru:
                "Нормативы - это ЦЕЛИ эффективности, а не верхние границы; обычно задаются на достижимом уровне ниже худшего случая.",
              why_wrong_uz:
                "Standartlar - samaradorlik uchun MAQSADLAR, eng yomon holatdagi cheklar emas; ular odatda eng yomon holatdan past, erishsa bo'ladigan darajalarda belgilanadi.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "A standard cost is the cost EXPECTED for one unit under efficient operating conditions. It is set in advance through industrial-engineering studies, time-and-motion analysis, supplier negotiations, and management judgement. Standards become the yardstick against which actual results are measured \u2014 the gap between actual and standard is the variance.",
          explanation_ru:
            "Нормативная себестоимость - это ОЖИДАЕМАЯ себестоимость одной единицы при эффективных условиях работы. Она задаётся заранее через инженерные исследования, нормирование времени, переговоры с поставщиками и управленческое суждение. Норматив становится эталоном для сравнения с фактом - разрыв между ними и есть отклонение.",
          explanation_uz:
            "Standart xarajat - samarali ish sharoitlarida bitta birlik uchun KUTILGAN xarajatdir. U sanoat-muhandislik tadqiqotlari, vaqt-va-harakat tahlili, yetkazib beruvchilar bilan muzokaralar va boshqaruv hukmi orqali oldindan belgilanadi. Standartlar haqiqiy natijalar o'lchanadigan mezonga aylanadi - haqiqiy va standart o'rtasidagi farq og'ishdir.",
        },
        // -------- Q2 - easy MCQ on attainable standard --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "Which type of standard is set under perfect operating conditions, with no waste, no breakdowns, no idle time?",
          prompt_ru:
            "Какой тип норматива задаётся при идеальных условиях работы - без потерь, поломок и простоев?",
          prompt_uz:
            "Qaysi turdagi standart isrofsiz, buzilishsiz, bo'sh vaqtsiz mukammal ish sharoitlarida belgilanadi?",
          options: [
            {
              key: "A",
              text_en: "Ideal",
              text_ru: "Идеальный",
              text_uz: "Ideal",
            },
            {
              key: "B",
              text_en: "Attainable",
              text_ru: "Достижимый",
              text_uz: "Erishsa bo'ladigan",
              why_wrong_en:
                "Attainable standards allow for normal levels of waste, downtime, and other realistic inefficiencies; they're NOT perfect.",
              why_wrong_ru:
                "Достижимые нормативы учитывают нормальный уровень потерь, простоев и реалистичных неэффективностей; они НЕ идеальны.",
              why_wrong_uz:
                "Erishsa bo'ladigan standartlar oddiy darajadagi isrof, to'xtab qolish va boshqa real samarasizliklarga yo'l qo'yadi; ular mukammal EMAS.",
            },
            {
              key: "C",
              text_en: "Current",
              text_ru: "Текущий",
              text_uz: "Joriy",
              why_wrong_en:
                "Current standards reflect TODAY's operating conditions \u2014 explicitly including current inefficiencies, the opposite of perfect.",
              why_wrong_ru:
                "Текущие нормативы отражают сегодняшние условия работы - явно включая текущие неэффективности, противоположно идеальным.",
              why_wrong_uz:
                "Joriy standartlar BUGUNGI ish sharoitlarini aks ettiradi - aniq tarzda joriy samarasizliklarni o'z ichiga oladi, mukammallikning aksi.",
            },
            {
              key: "D",
              text_en: "Basic",
              text_ru: "Базовый",
              text_uz: "Bazaviy",
              why_wrong_en:
                "Basic standards are unchanged over many years for trend analysis; they're not defined by perfection but by stability.",
              why_wrong_ru:
                "Базовые нормативы неизменны годами для анализа трендов; определяются стабильностью, а не идеальностью.",
              why_wrong_uz:
                "Bazaviy standartlar trend tahlili uchun ko'p yillar davomida o'zgarmaydi; ular mukammallik bilan emas, barqarorlik bilan belgilanadi.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Ideal standards assume perfection: no waste, no idle time, no machine breakdowns, no rework. They're useful for setting an absolute ceiling on what's technically possible but are usually DEMOTIVATING because workers can never meet them. Most firms use attainable standards \u2014 challenging but realistic, allowing for normal levels of inefficiency.",
          explanation_ru:
            "Идеальные нормативы предполагают совершенство: ни потерь, ни простоев, ни поломок, ни переделок. Они полезны для определения абсолютного потолка технически возможного, но обычно ДЕМОТИВИРУЮТ - работники их никогда не достигают. Большинство фирм используют достижимые нормативы - сложные, но реалистичные, с допуском на нормальный уровень неэффективности.",
          explanation_uz:
            "Ideal standartlar mukammallikni taxmin qiladi: isrof yo'q, bo'sh vaqt yo'q, mashina buzilishi yo'q, qayta ishlash yo'q. Ular texnik jihatdan mumkin bo'lgan narsaga mutlaq cheklov belgilash uchun foydali, ammo odatda MOTIVATSIYANI SO'NDIRUVCHI, chunki ishchilar ularga hech qachon erisha olmaydi. Aksariyat firmalar erishsa bo'ladigan standartlardan foydalanadi - qiyin, ammo real, oddiy darajadagi samarasizlikka yo'l qo'yadigan.",
        },
        // -------- Q3 - easy short_answer on variance type --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "A favourable (F) variance arises when actual results are better than standard. Which classification is correct for: actual material price BELOW standard price; actual labour hours ABOVE standard hours for output; actual sales price ABOVE standard price?",
          prompt_ru:
            "Благоприятное (F) отклонение возникает, когда фактический результат лучше норматива. Какая классификация верна для: фактическая цена материала НИЖЕ нормативной; фактические трудочасы ВЫШЕ нормативных на выпуск; фактическая цена продажи ВЫШЕ нормативной?",
          prompt_uz:
            "Foydali (F) og'ish haqiqiy natijalar standartdan yaxshiroq bo'lganda yuzaga keladi. Quyidagilar uchun qaysi tasnif to'g'ri: haqiqiy material narxi standart narxdan PAST; haqiqiy mehnat soatlari natija uchun standart soatlardan YUQORI; haqiqiy sotuv narxi standart narxdan YUQORI?",
          options: [
            {
              key: "A",
              text_en: "Favourable, Adverse, Favourable",
              text_ru: "Благоприятное, Неблагоприятное, Благоприятное",
              text_uz: "Foydali, Salbiy, Foydali",
            },
            {
              key: "B",
              text_en: "Adverse, Favourable, Adverse",
              text_ru: "Неблагоприятное, Благоприятное, Неблагоприятное",
              text_uz: "Salbiy, Foydali, Salbiy",
              why_wrong_en:
                "Each is reversed: paying less for material is favourable, taking more hours is adverse, and selling higher is favourable.",
              why_wrong_ru:
                "Каждое перевёрнуто: платить меньше за материал - благоприятно, тратить больше часов - неблагоприятно, продавать дороже - благоприятно.",
              why_wrong_uz:
                "Har biri teskari: material uchun kamroq to'lash foydali, ko'proq soat sarflash salbiy va yuqoriroq sotish foydali.",
            },
            {
              key: "C",
              text_en: "Favourable, Favourable, Favourable",
              text_ru: "Благоприятное, Благоприятное, Благоприятное",
              text_uz: "Foydali, Foydali, Foydali",
              why_wrong_en:
                "Taking MORE labour hours than the standard for the output is adverse on efficiency, not favourable.",
              why_wrong_ru:
                "Затрата БОЛЬШЕГО числа трудочасов, чем норматив на выпуск, неблагоприятна для эффективности, а не благоприятна.",
              why_wrong_uz:
                "Natija uchun standartdan KO'PROQ mehnat soati sarflash samaradorlikda foydali emas, salbiy.",
            },
            {
              key: "D",
              text_en: "Adverse, Adverse, Adverse",
              text_ru: "Неблагоприятное, Неблагоприятное, Неблагоприятное",
              text_uz: "Salbiy, Salbiy, Salbiy",
              why_wrong_en:
                "Paying less for material and selling at a higher price are both favourable; only the labour-hours item is adverse.",
              why_wrong_ru:
                "Платить меньше за материал и продавать дороже - оба благоприятны; неблагоприятен только пункт по трудочасам.",
              why_wrong_uz:
                "Material uchun kamroq to'lash va yuqoriroq narxda sotish ikkalasi ham foydali; faqat mehnat-soatlari moddasi salbiy.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            'Apply "actual better than standard = favourable" consistently. Paying less for material is favourable (F); taking more hours than the standard allows for the output is adverse on efficiency (A); selling at a higher price than budgeted is favourable on revenue (F).',
          explanation_ru:
            "Последовательно применяйте правило «фактическое лучше норматива = благоприятно». Платить за материал меньше - благоприятно (F); затратить больше часов, чем норматив на выпуск, - неблагоприятно для эффективности (A); продать дороже бюджета - благоприятно для выручки (F).",
          explanation_uz:
            "\"Haqiqiy standartdan yaxshiroq = foydali\"ni izchil qo'llang. Material uchun kamroq to'lash foydali (F); natija uchun standart yo'l qo'yganidan ko'proq soat sarflash samaradorlikda salbiy (A); byudjetlanganidan yuqori narxda sotish daromadda foydali (F).",
        },
        // -------- Q4 - easy MCQ on standard cost card components --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "A standard cost card for one unit of product would NOT normally include:",
          prompt_ru:
            "Карточка нормативной себестоимости одной единицы продукта НЕ должна обычно включать:",
          prompt_uz:
            "Mahsulotning bitta birligi uchun standart xarajat kartasi odatda quyidagini O'Z ICHIGA OLMAYDI:",
          options: [
            {
              key: "A",
              text_en: "Standard material quantity per unit",
              text_ru: "Нормативное количество материала на единицу",
              text_uz: "Birlik uchun standart material miqdori",
              why_wrong_en:
                "Material quantity is a core component of the standard cost card.",
              why_wrong_ru:
                "Количество материала - ключевой компонент карточки нормативной себестоимости.",
              why_wrong_uz:
                "Material miqdori - standart xarajat kartasining asosiy komponenti.",
            },
            {
              key: "B",
              text_en: "Standard labour hours per unit",
              text_ru: "Нормативные часы труда на единицу",
              text_uz: "Birlik uchun standart mehnat soatlari",
              why_wrong_en:
                "Labour hours per unit is essential to the standard cost card.",
              why_wrong_ru: "Часы труда на единицу - обязательный элемент.",
              why_wrong_uz:
                "Birlik uchun mehnat soatlari standart xarajat kartasi uchun zarurdir.",
            },
            {
              key: "C",
              text_en: "Total actual production volume",
              text_ru: "Общий фактический объём производства",
              text_uz: "Umumiy haqiqiy ishlab chiqarish hajmi",
            },
            {
              key: "D",
              text_en: "Standard overhead absorption rate",
              text_ru: "Нормативная ставка абсорбции накладных",
              text_uz: "Standart qo'shimcha xarajat yutilish stavkasi",
              why_wrong_en:
                "OAR per labour hour or machine hour is the standard overhead component on the card.",
              why_wrong_ru:
                "OAR на трудочас или машино-час - нормативная накладная составляющая в карточке.",
              why_wrong_uz:
                "Mehnat soati yoki mashina soati uchun OAR - kartadagi standart qo'shimcha xarajat komponenti.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "A standard cost card specifies the EXPECTED cost of ONE unit \u2014 it doesn't include actual production figures, which only exist after the period. The card lists standard inputs per unit: material quantity \u00d7 price, labour hours \u00d7 rate, overhead absorbed via standard hours \u00d7 OAR. Once the period ends and actual figures are known, variance analysis compares them to these standards.",
          explanation_ru:
            "Карточка нормативной себестоимости задаёт ОЖИДАЕМУЮ себестоимость ОДНОЙ единицы - фактические объёмы производства туда не входят, они появляются только после периода. Карточка содержит нормативные затраты на единицу: количество материала × цена, часы труда × тариф, абсорбированные накладные = нормативные часы × OAR. После окончания периода известные фактические цифры сравниваются с этими нормативами.",
          explanation_uz:
            "Standart xarajat kartasi BITTA birlikning KUTILGAN xarajatini belgilaydi - u faqat davrdan keyin mavjud bo'ladigan haqiqiy ishlab chiqarish ko'rsatkichlarini o'z ichiga olmaydi. Karta birlik uchun standart kirishlarni sanab o'tadi: material miqdori x narx, mehnat soatlari x stavka, standart soatlar x OAR orqali yutilgan qo'shimcha xarajat. Davr tugab, haqiqiy ko'rsatkichlar ma'lum bo'lgach, og'ish tahlili ularni bu standartlar bilan solishtiradi.",
        },
        // -------- Q5 - medium NUMBER_ENTRY on material price variance --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "Standard material price is $5 per kg. Actual price paid was $5.40 per kg. The company purchased 8,000 kg. Calculate the MATERIAL PRICE VARIANCE (enter favourable as positive, adverse as negative, in $).",
          prompt_ru:
            "Нормативная цена материала $5 за кг. Фактически уплаченная цена $5,40 за кг. Закуплено 8 000 кг. Рассчитайте ОТКЛОНЕНИЕ ПО ЦЕНЕ МАТЕРИАЛОВ (благоприятное - положительное, неблагоприятное - отрицательное, в $).",
          prompt_uz:
            "Standart material narxi kg uchun 5 dollar. To'langan haqiqiy narx kg uchun 5,40 dollar edi. Kompaniya 8 000 kg sotib oldi. MATERIAL NARXI OG'ISHINI hisoblang (foydalini musbat, salbiyni manfiy sifatida kiriting, dollarda).",
          correct_answer_en: "-3200",
          acceptable_tolerance: 1,
          explanation_en:
            "Material price variance = (Standard Price \u2212 Actual Price) \u00d7 Actual Quantity = ($5 \u2212 $5.40) \u00d7 8,000 = (\u2212$0.40) \u00d7 8,000 = \u2212$3,200. Negative \u2192 ADVERSE: the firm paid more per kg than budgeted, costing $3,200 extra on the 8,000 kg purchased. Note we use the quantity PURCHASED (not used) for the price variance \u2014 the price decision applies to what was bought.",
          explanation_ru:
            "Отклонение по цене материалов = (Нормативная цена − Фактическая) × Фактическое количество = ($5 − $5,40) × 8 000 = (−$0,40) × 8 000 = −$3 200. Отрицательное → НЕБЛАГОПРИЯТНОЕ: фирма заплатила больше за кг, чем заложено в нормативе, что обошлось в $3 200 на 8 000 кг закупки. Внимание: используем количество ЗАКУПЛЕННОГО (а не использованного) материала - решение по цене относится к покупке.",
          explanation_uz:
            "Material narxi og'ishi = (Standart Narx - Haqiqiy Narx) x Haqiqiy Miqdor = (5 dollar - 5,40 dollar) x 8 000 = (-0,40 dollar) x 8 000 = -3 200 dollar. Manfiy -> SALBIY: firma kg uchun byudjetlanganidan ko'proq to'ladi va sotib olingan 8 000 kg da 3 200 dollar ortiqcha xarajat qildi. E'tibor bering, narx og'ishi uchun SOTIB OLINGAN miqdordan (ishlatilgan emas) foydalanamiz - narx qarori sotib olinganga tegishli.",
        },
        // -------- Q6 - medium NUMBER_ENTRY on material usage variance --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "Standard material usage is 2 kg per unit at $5/kg. Actual production was 3,500 units. Actual material used was 7,400 kg. Calculate the MATERIAL USAGE VARIANCE (favourable positive, adverse negative, in $).",
          prompt_ru:
            "Норматив расхода материала - 2 кг на единицу по $5/кг. Фактический выпуск - 3 500 единиц. Фактически использовано 7 400 кг. Рассчитайте ОТКЛОНЕНИЕ ПО ИСПОЛЬЗОВАНИЮ МАТЕРИАЛОВ (благоприятное - положительное, неблагоприятное - отрицательное, в $).",
          prompt_uz:
            "Standart material sarflanishi birlik uchun 2 kg, narxi 5 dollar/kg. Haqiqiy ishlab chiqarish 3 500 birlik edi. Ishlatilgan haqiqiy material 7 400 kg edi. MATERIAL SARFLANISH OG'ISHINI hisoblang (foydali musbat, salbiy manfiy, dollarda).",
          correct_answer_en: "-2000",
          acceptable_tolerance: 1,
          explanation_en:
            "Standard quantity for actual output = 3,500 units \u00d7 2 kg = 7,000 kg. Material usage variance = (Standard Qty for actual output \u2212 Actual Qty used) \u00d7 Standard Price = (7,000 \u2212 7,400) \u00d7 $5 = (\u2212400) \u00d7 $5 = \u2212$2,000. Negative \u2192 ADVERSE: 400 kg more than the standard required were used, costing $2,000 extra at standard price. Note we value the usage gap at STANDARD price (not actual), isolating the usage effect from the price effect.",
          explanation_ru:
            "Нормативное количество на фактический выпуск = 3 500 единиц × 2 кг = 7 000 кг. Отклонение по использованию = (Нормативное кол-во на факт выпуск − Фактическое кол-во) × Нормативная цена = (7 000 − 7 400) × $5 = (−400) × $5 = −$2 000. Отрицательное → НЕБЛАГОПРИЯТНОЕ: использовано на 400 кг больше норматива, что при нормативной цене стоит $2 000 дополнительно. Внимание: разница в количестве оценивается по НОРМАТИВНОЙ цене (не фактической), чтобы отделить эффект использования от эффекта цены.",
          explanation_uz:
            "Haqiqiy natija uchun standart miqdor = 3 500 birlik x 2 kg = 7 000 kg. Material sarflanish og'ishi = (haqiqiy natija uchun Standart Miqdor - ishlatilgan Haqiqiy Miqdor) x Standart Narx = (7 000 - 7 400) x 5 dollar = (-400) x 5 dollar = -2 000 dollar. Manfiy -> SALBIY: standart talab qilganidan 400 kg ko'proq ishlatildi va standart narxda 2 000 dollar ortiqcha xarajat qildi. E'tibor bering, sarflanish farqini STANDART narxda (haqiqiy emas) baholaymiz, sarflanish ta'sirini narx ta'siridan ajratamiz.",
        },
        // -------- Q7 - medium NUMBER_ENTRY on labour rate variance --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "Standard labour rate is $12 per hour. Actual rate paid was $11.50 per hour. Actual hours worked: 4,200. Calculate the LABOUR RATE VARIANCE (favourable positive, adverse negative, in $).",
          prompt_ru:
            "Нормативная ставка труда $12 в час. Фактически уплаченная $11,50 в час. Фактически отработано 4 200 часов. Рассчитайте ОТКЛОНЕНИЕ ПО СТАВКЕ ТРУДА (благоприятное - положительное, неблагоприятное - отрицательное, в $).",
          prompt_uz:
            "Standart mehnat stavkasi soat uchun 12 dollar. To'langan haqiqiy stavka soat uchun 11,50 dollar edi. Ishlangan haqiqiy soatlar: 4 200. MEHNAT STAVKASI OG'ISHINI hisoblang (foydali musbat, salbiy manfiy, dollarda).",
          correct_answer_en: "2100",
          acceptable_tolerance: 1,
          explanation_en:
            "Labour rate variance = (Standard Rate \u2212 Actual Rate) \u00d7 Actual Hours = ($12 \u2212 $11.50) \u00d7 4,200 = $0.50 \u00d7 4,200 = $2,100. Positive \u2192 FAVOURABLE: the firm paid $0.50 less per hour than standard, saving $2,100 on the 4,200 hours worked. This might be because the firm used lower-skilled (cheaper) workers \u2014 watch for an offsetting adverse labour efficiency variance.",
          explanation_ru:
            "Отклонение по ставке труда = (Нормативная ставка − Фактическая) × Фактические часы = ($12 − $11,50) × 4 200 = $0,50 × 4 200 = $2 100. Положительное → БЛАГОПРИЯТНОЕ: фирма платила на $0,50 меньше за час, чем по нормативу, сэкономив $2 100 на 4 200 часах. Возможная причина - использовалась менее квалифицированная (более дешёвая) рабочая сила; в этом случае ждите компенсирующего неблагоприятного отклонения по эффективности труда.",
          explanation_uz:
            "Mehnat stavkasi og'ishi = (Standart Stavka - Haqiqiy Stavka) x Haqiqiy Soatlar = (12 dollar - 11,50 dollar) x 4 200 = 0,50 dollar x 4 200 = 2 100 dollar. Musbat -> FOYDALI: firma soat uchun standartdan 0,50 dollar kam to'ladi va ishlangan 4 200 soatda 2 100 dollar tejadi. Bu firma malakasi pastroq (arzonroq) ishchilardan foydalanganligi sababli bo'lishi mumkin - buni qoplaydigan salbiy mehnat samaradorligi og'ishidan ehtiyot bo'ling.",
        },
        // -------- Q8 - medium NUMBER_ENTRY on labour efficiency variance --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "Standard time is 0.5 hours per unit at $12/hour. Actual production was 8,000 units. Actual hours worked: 4,200. Calculate the LABOUR EFFICIENCY VARIANCE (favourable positive, adverse negative, in $).",
          prompt_ru:
            "Норматив времени - 0,5 часа на единицу по $12/час. Фактический выпуск 8 000 единиц. Фактически отработано 4 200 часов. Рассчитайте ОТКЛОНЕНИЕ ПО ЭФФЕКТИВНОСТИ ТРУДА (благоприятное - положительное, неблагоприятное - отрицательное, в $).",
          prompt_uz:
            "Standart vaqt birlik uchun 0,5 soat, 12 dollar/soat. Haqiqiy ishlab chiqarish 8 000 birlik edi. Ishlangan haqiqiy soatlar: 4 200. MEHNAT SAMARADORLIGI OG'ISHINI hisoblang (foydali musbat, salbiy manfiy, dollarda).",
          correct_answer_en: "-2400",
          acceptable_tolerance: 1,
          explanation_en:
            "Standard hours for actual output = 8,000 units \u00d7 0.5 h = 4,000 hours. Labour efficiency variance = (Standard Hours for actual output \u2212 Actual Hours) \u00d7 Standard Rate = (4,000 \u2212 4,200) \u00d7 $12 = (\u2212200) \u00d7 $12 = \u2212$2,400. Negative \u2192 ADVERSE: 200 more hours were worked than the standard allowed, costing $2,400 extra at standard rate. Combined with Q7's favourable rate variance, the firm got cheaper labour but used too much of it \u2014 a classic trade-off worth investigating.",
          explanation_ru:
            "Нормативные часы на факт выпуск = 8 000 единиц × 0,5 ч = 4 000 часов. Отклонение по эффективности = (Нормативные часы на факт выпуск − Фактические часы) × Нормативная ставка = (4 000 − 4 200) × $12 = (−200) × $12 = −$2 400. Отрицательное → НЕБЛАГОПРИЯТНОЕ: отработано на 200 часов больше норматива, что при нормативной ставке стоит $2 400. Вместе с благоприятным отклонением по ставке (Q7) это классический компромисс: труд дешевле, но потрачено больше; стоит расследовать.",
          explanation_uz:
            "Haqiqiy natija uchun standart soatlar = 8 000 birlik x 0,5 soat = 4 000 soat. Mehnat samaradorligi og'ishi = (haqiqiy natija uchun Standart Soatlar - Haqiqiy Soatlar) x Standart Stavka = (4 000 - 4 200) x 12 dollar = (-200) x 12 dollar = -2 400 dollar. Manfiy -> SALBIY: standart yo'l qo'yganidan 200 soat ko'proq ishlandi va standart stavkada 2 400 dollar ortiqcha xarajat qildi. Oldingi savolning foydali stavka og'ishi bilan birga, firma arzonroq mehnat oldi, ammo undan haddan ko'p ishlatdi - tekshirishga arziydigan klassik murosa.",
        },
        // -------- Q9 - medium MCQ on variance interpretation --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A company reports an adverse material PRICE variance and a favourable material USAGE variance in the same period. The MOST LIKELY underlying cause is:",
          prompt_ru:
            "Компания отражает неблагоприятное отклонение по ЦЕНЕ материалов и благоприятное по ИСПОЛЬЗОВАНИЮ в одном периоде. НАИБОЛЕЕ ВЕРОЯТНАЯ причина:",
          prompt_uz:
            "Kompaniya bir davrda salbiy material NARXI og'ishi va foydali material SARFLANISH og'ishini xabar qiladi. ENG EHTIMOLLI asosiy sabab:",
          options: [
            {
              key: "A",
              text_en: "Workers were trained more thoroughly",
              text_ru: "Рабочие прошли более тщательное обучение",
              text_uz: "Ishchilar yaxshiroq o'qitildi",
              why_wrong_en:
                "Training affects LABOUR efficiency primarily; it doesn't explain why MATERIAL prices rose while usage improved.",
              why_wrong_ru:
                "Обучение влияет прежде всего на эффективность ТРУДА; оно не объясняет, почему цены на материал выросли, а расход улучшился.",
              why_wrong_uz:
                "O'qitish asosan MEHNAT samaradorligiga ta'sir qiladi; u MATERIAL narxlari oshib, sarflanishi yaxshilanganini tushuntirmaydi.",
            },
            {
              key: "B",
              text_en:
                "A higher-quality (more expensive) material was purchased, reducing waste",
              text_ru:
                "Закуплен более качественный (более дорогой) материал, что снизило потери",
              text_uz:
                "Yuqori sifatli (qimmatroq) material sotib olindi va bu isrofni kamaytirdi",
            },
            {
              key: "C",
              text_en: "The standards were set too low",
              text_ru: "Нормативы были занижены",
              text_uz: "Standartlar juda past belgilangan edi",
              why_wrong_en:
                "Low standards would produce ADVERSE variances on both price AND usage, not opposite directions.",
              why_wrong_ru:
                "Заниженные нормативы дали бы неблагоприятные отклонения И по цене, И по использованию, а не в разных направлениях.",
              why_wrong_uz:
                "Past standartlar narxda HAM, sarflanishda HAM SALBIY og'ishlarni hosil qilardi, qarama-qarshi yo'nalishlarni emas.",
            },
            {
              key: "D",
              text_en: "Sales prices were increased",
              text_ru: "Цены продаж были повышены",
              text_uz: "Sotuv narxlari oshirildi",
              why_wrong_en:
                "Sales price changes don't affect material price or usage variances; these are cost-side metrics.",
              why_wrong_ru:
                "Изменения цен продаж не влияют на отклонения по цене или использованию материалов; это метрики со стороны затрат.",
              why_wrong_uz:
                "Sotuv narxi o'zgarishlari material narxi yoki sarflanish og'ishlariga ta'sir qilmaydi; bular xarajat tomonidagi ko'rsatkichlar.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Adverse price + favourable usage points to a quality-trade-off interpretation: a more expensive, higher-quality material was purchased; the higher cost shows as adverse PRICE variance, but the better quality means less waste/scrap/rework, showing as favourable USAGE variance. Variances often connect this way \u2014 examining them in pairs reveals the underlying operating story that no single number tells.",
          explanation_ru:
            "Неблагоприятная цена + благоприятное использование указывают на качественный компромисс: куплен более дорогой материал лучшего качества; высокая цена видна как неблагоприятная ЦЕНА, но лучшее качество означает меньше потерь/брака/переделок, что отражается как благоприятное ИСПОЛЬЗОВАНИЕ. Отклонения часто связаны попарно - рассмотрение в комплексе показывает операционную логику, которую одна цифра не передаёт.",
          explanation_uz:
            "Salbiy narx + foydali sarflanish sifat-murosasi talqiniga ishora qiladi: qimmatroq, yuqori sifatli material sotib olindi; yuqori xarajat salbiy NARX og'ishi sifatida ko'rinadi, ammo yaxshiroq sifat kamroq isrof/chiqindi/qayta ishlashni anglatadi va foydali SARFLANISH og'ishi sifatida ko'rinadi. Og'ishlar ko'pincha shunday bog'lanadi - ularni juftlikda ko'rib chiqish hech bir yagona raqam aytmaydigan asosiy ish holatini ochib beradi.",
        },
        // -------- Q10 - medium NUMBER_ENTRY on fixed OH expenditure variance --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "Budgeted fixed overhead is $80,000. Actual fixed overhead incurred was $86,000. Calculate the FIXED OVERHEAD EXPENDITURE VARIANCE (favourable positive, adverse negative, in $).",
          prompt_ru:
            "Бюджетные постоянные накладные - $80 000. Фактические - $86 000. Рассчитайте ОТКЛОНЕНИЕ ПО РАСХОДОВАНИЮ ПОСТОЯННЫХ НАКЛАДНЫХ (благоприятное - положительное, неблагоприятное - отрицательное, в $).",
          prompt_uz:
            "Byudjetlangan o'zgarmas qo'shimcha xarajat 80 000 dollar. Yuzaga kelgan haqiqiy o'zgarmas qo'shimcha xarajat 86 000 dollar edi. O'ZGARMAS QO'SHIMCHA XARAJAT SARF OG'ISHINI hisoblang (foydali musbat, salbiy manfiy, dollarda).",
          correct_answer_en: "-6000",
          acceptable_tolerance: 1,
          explanation_en:
            "Fixed overhead expenditure variance = Budgeted Fixed Overhead \u2212 Actual Fixed Overhead = 80,000 \u2212 86,000 = \u2212$6,000. Negative \u2192 ADVERSE: actual spending exceeded budget by $6,000. This variance is about CONTROL of fixed costs; it doesn't depend on activity levels (unlike the fixed overhead volume variance which does).",
          explanation_ru:
            "Отклонение по расходованию постоянных накладных = Бюджет − Факт = 80 000 − 86 000 = −$6 000. Отрицательное → НЕБЛАГОПРИЯТНОЕ: фактический расход превысил бюджет на $6 000. Это отклонение характеризует КОНТРОЛЬ постоянных затрат и не зависит от уровня активности (в отличие от отклонения по объёму, которое от него зависит).",
          explanation_uz:
            "O'zgarmas qo'shimcha xarajat sarf og'ishi = Byudjetlangan O'zgarmas Qo'shimcha Xarajat - Haqiqiy O'zgarmas Qo'shimcha Xarajat = 80 000 - 86 000 = -6 000 dollar. Manfiy -> SALBIY: haqiqiy sarflash byudjetdan 6 000 dollarga oshdi. Bu og'ish o'zgarmas xarajatlarni NAZORAT qilish haqida; u faollik darajalariga bog'liq emas (faollikka bog'liq bo'lgan o'zgarmas qo'shimcha xarajat hajm og'ishidan farqli).",
        },
        // -------- Q11 - medium MCQ on sales volume variance basis --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "Under MARGINAL costing, the sales volume variance is valued at:",
          prompt_ru:
            "При МАРЖИНАЛЬНОМ учёте отклонение по объёму продаж оценивается по:",
          prompt_uz:
            "MARJINAL hisob bo'yicha sotuv hajmi og'ishi quyidagida baholanadi:",
          options: [
            {
              key: "A",
              text_en: "Standard selling price per unit",
              text_ru: "Нормативной цене продаж за единицу",
              text_uz: "Birlik uchun standart sotuv narxi",
              why_wrong_en:
                "Selling price reflects revenue, not the profit lost/gained from volume changes; cost effects matter too.",
              why_wrong_ru:
                "Цена продаж отражает выручку, а не прибыль, теряемую или получаемую при изменении объёма; важны и затраты.",
              why_wrong_uz:
                "Sotuv narxi daromadni aks ettiradi, hajm o'zgarishidan yo'qotilgan/olingan foydani emas; xarajat ta'sirlari ham muhim.",
            },
            {
              key: "B",
              text_en:
                "Standard contribution per unit (selling price \u2212 variable cost)",
              text_ru:
                "Нормативному маржинальному доходу на единицу (цена − переменные затраты)",
              text_uz:
                "Birlik uchun standart hissa (sotuv narxi - o'zgaruvchan xarajat)",
            },
            {
              key: "C",
              text_en:
                "Standard profit per unit (selling price \u2212 full cost including fixed OH)",
              text_ru:
                "Нормативной прибыли на единицу (цена − полная себестоимость включая постоянные накладные)",
              text_uz:
                "Birlik uchun standart foyda (sotuv narxi - o'zgarmas QX kiritilgan to'liq xarajat)",
              why_wrong_en:
                "Standard PROFIT is used under ABSORPTION costing; marginal costing uses CONTRIBUTION because fixed costs don't change with volume.",
              why_wrong_ru:
                "Нормативная ПРИБЫЛЬ используется при АБСОРБЦИОННОМ учёте; маржинальный использует МАРЖИНАЛЬНЫЙ ДОХОД, так как постоянные затраты с объёмом не меняются.",
              why_wrong_uz:
                "Standart FOYDA TO'LIQ hisobda ishlatiladi; marjinal hisob HISSAdan foydalanadi, chunki o'zgarmas xarajatlar hajm bilan o'zgarmaydi.",
            },
            {
              key: "D",
              text_en: "Actual contribution per unit",
              text_ru: "Фактическому маржинальному доходу на единицу",
              text_uz: "Birlik uchun haqiqiy hissa",
              why_wrong_en:
                "Variance analysis uses STANDARD values for the cost dimension; actual figures would mix volume and price/cost effects together.",
              why_wrong_ru:
                "Анализ отклонений по стороне затрат использует НОРМАТИВНЫЕ величины; фактические смешали бы эффекты объёма и цены/затрат.",
              why_wrong_uz:
                "Og'ish tahlili xarajat o'lchami uchun STANDART qiymatlardan foydalanadi; haqiqiy ko'rsatkichlar hajm va narx/xarajat ta'sirlarini birga aralashtirib yuborardi.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Under marginal costing, fixed costs are treated as period costs that don't change with volume. The financial impact of selling one extra (or fewer) unit is therefore the CONTRIBUTION it generates \u2014 selling price minus variable cost per unit. Under absorption costing, fixed costs ARE absorbed into units, so volume changes also affect fixed cost absorption, and the variance is valued at standard PROFIT (which includes a fixed-cost share). This is a frequent exam trap: same scenario, different answer depending on costing system.",
          explanation_ru:
            "При маржинальном учёте постоянные затраты рассматриваются как затраты периода, не меняющиеся с объёмом. Финансовый эффект от продажи лишней (или недопроданной) единицы - это МАРЖИНАЛЬНЫЙ ДОХОД, который она приносит: цена минус переменные затраты на единицу. При абсорбционном учёте постоянные затраты абсорбируются в единицы, поэтому объём затрагивает и абсорбцию постоянных накладных, и отклонение оценивается по нормативной ПРИБЫЛИ (с учётом доли постоянных). Это частая ловушка экзамена: одинаковый сценарий, разный ответ в зависимости от системы учёта.",
          explanation_uz:
            "Marjinal hisob bo'yicha o'zgarmas xarajatlar hajm bilan o'zgarmaydigan davr xarajatlari sifatida ko'rib chiqiladi. Demak, bitta qo'shimcha (yoki kamroq) birlik sotishning moliyaviy ta'siri u hosil qiladigan HISSA - sotuv narxidan birlik uchun o'zgaruvchan xarajatni ayirgan. To'liq hisob bo'yicha o'zgarmas xarajatlar birliklarga yutiladi, shuning uchun hajm o'zgarishlari o'zgarmas xarajat yutilishiga ham ta'sir qiladi va og'ish standart FOYDADA (o'zgarmas xarajat ulushini o'z ichiga oladi) baholanadi. Bu tez-tez uchraydigan imtihon tuzog'i: bir xil vaziyat, hisob tizimiga qarab turli javob.",
        },
        // -------- Q12 - medium short_answer on variance formula direction --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "Why is the material price variance based on the quantity PURCHASED, while the usage variance is based on the quantity USED for actual output?",
          prompt_ru:
            "Почему отклонение по цене материала рассчитывается по КУПЛЕННОМУ количеству, а отклонение по расходу - по ИСПОЛЬЗОВАННОМУ для фактического выпуска?",
          prompt_uz:
            "Nega material narxi og'ishi SOTIB OLINGAN miqdorga, sarflanish og'ishi esa haqiqiy natija uchun ISHLATILGAN miqdorga asoslanadi?",
          options: [
            {
              key: "A",
              text_en:
                "The price decision is made at purchase (applies to all units bought); the usage decision is made in production (applies to what was consumed)",
              text_ru:
                "Решение о цене принимается при закупке (касается всех купленных единиц); решение о расходе - в производстве (касается потреблённого)",
              text_uz:
                "Narx qarori xaridda qabul qilinadi (sotib olingan barcha birliklarga tegishli); sarflanish qarori ishlab chiqarishda qabul qilinadi (iste'mol qilinganga tegishli)",
            },
            {
              key: "B",
              text_en:
                "Because purchased quantity is always larger than used quantity",
              text_ru:
                "Потому что купленное количество всегда больше использованного",
              text_uz:
                "Chunki sotib olingan miqdor har doim ishlatilgan miqdordan kattaroq",
              why_wrong_en:
                "The basis is about WHERE the decision is made, not about which quantity is larger; purchases may be more, less, or equal to usage.",
              why_wrong_ru:
                "Основа - в том, ГДЕ принимается решение, а не в том, какое количество больше; закупки могут быть больше, меньше или равны расходу.",
              why_wrong_uz:
                "Asos qaror QAYERDA qabul qilinishi haqida, qaysi miqdor kattaroqligi haqida emas; xaridlar sarflanishdan ko'p, kam yoki teng bo'lishi mumkin.",
            },
            {
              key: "C",
              text_en: "To make the two variances always equal",
              text_ru: "Чтобы оба отклонения всегда были равны",
              text_uz: "Ikki og'ishni har doim teng qilish uchun",
              why_wrong_en:
                "The two variances measure different things and are not designed to be equal; the basis reflects responsibility, not equality.",
              why_wrong_ru:
                "Эти отклонения измеряют разное и не должны быть равны; основа отражает ответственность, а не равенство.",
              why_wrong_uz:
                "Ikki og'ish turli narsalarni o'lchaydi va teng bo'lishi uchun mo'ljallanmagan; asos tenglikni emas, mas'uliyatni aks ettiradi.",
            },
            {
              key: "D",
              text_en: "Because IAS 2 requires it",
              text_ru: "Потому что этого требует IAS 2",
              text_uz: "Chunki IAS 2 buni talab qiladi",
              why_wrong_en:
                "This is a management-accounting convention for responsibility accounting, not an IAS 2 (financial reporting) requirement.",
              why_wrong_ru:
                "Это соглашение управленческого учёта для учёта по ответственности, а не требование IAS 2 (финансовая отчётность).",
              why_wrong_uz:
                "Bu - mas'uliyat hisobi uchun boshqaruv hisobi konventsiyasi, IAS 2 (moliyaviy hisobot) talabi emas.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Separating where each decision is made gives clean responsibility. The purchasing manager controls price and is judged on the price variance for everything bought; the production manager controls usage and is judged on the usage variance for what was actually consumed.",
          explanation_ru:
            "Разделение по месту принятия решения обеспечивает чёткую ответственность. Менеджер по закупкам отвечает за цену и оценивается по отклонению цены на всё купленное; менеджер производства отвечает за расход и оценивается по отклонению расхода на фактически потреблённое.",
          explanation_uz:
            "Har bir qaror qayerda qabul qilinishini ajratish toza mas'uliyat beradi. Xarid menejeri narxni nazorat qiladi va sotib olingan hamma narsa uchun narx og'ishida baholanadi; ishlab chiqarish menejeri sarflanishni nazorat qiladi va haqiqatan iste'mol qilingan narsa uchun sarflanish og'ishida baholanadi.",
        },
        // -------- Q13 - medium MCQ on flexed budget for variance --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "For variance analysis to be MEANINGFUL, actual costs must be compared against:",
          prompt_ru:
            "Чтобы анализ отклонений был ОСМЫСЛЕННЫМ, фактические затраты должны сравниваться с:",
          prompt_uz:
            "Og'ish tahlili MA'NOLI bo'lishi uchun haqiqiy xarajatlar quyidagi bilan solishtirilishi kerak:",
          options: [
            {
              key: "A",
              text_en:
                "The original fixed budget regardless of actual activity",
              text_ru:
                "Исходным фиксированным бюджетом независимо от фактической активности",
              text_uz:
                "Haqiqiy faollikdan qat'i nazar dastlabki o'zgarmas byudjet",
              why_wrong_en:
                "Comparing against the original fixed budget mixes a (real) cost-control issue with a (separate) volume issue; the flexed budget separates them.",
              why_wrong_ru:
                "Сравнение с исходным фиксированным бюджетом смешивает (реальный) контроль затрат с (отдельным) вопросом объёма; гибкий бюджет их разделяет.",
              why_wrong_uz:
                "Dastlabki o'zgarmas byudjet bilan solishtirish (haqiqiy) xarajat-nazorat masalasini (alohida) hajm masalasi bilan aralashtiradi; moslashtirilgan byudjet ularni ajratadi.",
            },
            {
              key: "B",
              text_en:
                "A flexed budget restated for actual activity, at standard cost",
              text_ru:
                "Гибким бюджетом, пересчитанным на фактическую активность, по нормативной себестоимости",
              text_uz:
                "Standart xarajatda, haqiqiy faollik uchun qayta hisoblangan moslashtirilgan byudjet",
            },
            {
              key: "C",
              text_en: "Last year\u2019s actual results",
              text_ru: "Фактическими результатами прошлого года",
              text_uz: "O'tgan yilgi haqiqiy natijalar",
              why_wrong_en:
                "Prior-year results don't isolate efficiency, price, and volume effects; they reflect different past conditions, not what costs SHOULD be now.",
              why_wrong_ru:
                "Прошлогодние факты не разделяют эффекты эффективности, цены и объёма; они отражают иные прошлые условия, а не то, какими затраты ДОЛЖНЫ быть сейчас.",
              why_wrong_uz:
                "Oldingi yil natijalari samaradorlik, narx va hajm ta'sirlarini ajratmaydi; ular xarajat hozir qancha BO'LISHI kerakligini emas, turli o'tmish sharoitlarini aks ettiradi.",
            },
            {
              key: "D",
              text_en: "Industry average costs",
              text_ru: "Средними отраслевыми затратами",
              text_uz: "Soha o'rtacha xarajatlari",
              why_wrong_en:
                "Industry benchmarks are useful for strategic comparison but don't give a year-on-year management control yardstick the way standards do.",
              why_wrong_ru:
                "Отраслевые ориентиры полезны для стратегического сравнения, но не дают эталона управленческого контроля по периодам, как нормативы.",
              why_wrong_uz:
                "Soha mezonlari strategik taqqoslash uchun foydali, ammo standartlar singari yildan-yilga boshqaruv nazorati mezonini bermaydi.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "The cornerstone of variance analysis is the flexed budget. Total variance from original budget = (volume effect) + (price/efficiency effects). The volume effect is the SALES volume variance \u2014 separating it out leaves the cost variances clean. To compute cost variances, you flex the budget to actual activity at standard cost; then compare to actual costs at actual activity. The difference is the price, usage, rate, and efficiency variances combined.",
          explanation_ru:
            "Краеугольный камень анализа отклонений - гибкий бюджет. Общее отклонение от исходного бюджета = (эффект объёма) + (эффекты цены/эффективности). Эффект объёма - это отклонение по объёму ПРОДАЖ; выделение его очищает отклонения по затратам. Для расчёта отклонений по затратам бюджет пересчитывают на фактическую активность по нормативной себестоимости, затем сравнивают с фактическими затратами при фактической активности. Разница - совокупное отклонение по цене, использованию, ставке и эффективности.",
          explanation_uz:
            "Og'ish tahlilining asosi - moslashtirilgan byudjet. Dastlabki byudjetdan umumiy og'ish = (hajm ta'siri) + (narx/samaradorlik ta'sirlari). Hajm ta'siri - bu SOTUV hajmi og'ishi - uni ajratish xarajat og'ishlarini toza qoldiradi. Xarajat og'ishlarini hisoblash uchun byudjetni standart xarajatda haqiqiy faollikka moslashtirasiz; so'ng haqiqiy faollikdagi haqiqiy xarajatlar bilan solishtirasiz. Farq - narx, sarflanish, stavka va samaradorlik og'ishlarining birikmasidir.",
        },
        // -------- Q14 - hard NUMBER_ENTRY on profit reconciliation --------
        {
          type: "number_entry",
          difficulty: "hard",
          prompt_en:
            "Budgeted profit is $50,000. During the period: favourable material price variance $1,500; adverse material usage variance $2,000; favourable labour rate variance $800; adverse labour efficiency variance $1,200; favourable sales volume variance $3,000; adverse fixed overhead expenditure variance $600. Calculate the ACTUAL PROFIT (in $).",
          prompt_ru:
            "Бюджетная прибыль $50 000. За период: благоприятное отклонение по цене материалов $1 500; неблагоприятное по использованию материалов $2 000; благоприятное по ставке труда $800; неблагоприятное по эффективности труда $1 200; благоприятное по объёму продаж $3 000; неблагоприятное по расходованию постоянных накладных $600. Рассчитайте ФАКТИЧЕСКУЮ прибыль (в $).",
          prompt_uz:
            "Byudjetlangan foyda 50 000 dollar. Davr davomida: foydali material narxi og'ishi 1 500 dollar; salbiy material sarflanish og'ishi 2 000 dollar; foydali mehnat stavkasi og'ishi 800 dollar; salbiy mehnat samaradorligi og'ishi 1 200 dollar; foydali sotuv hajmi og'ishi 3 000 dollar; salbiy o'zgarmas qo'shimcha xarajat sarf og'ishi 600 dollar. HAQIQIY FOYDANI hisoblang (dollarda).",
          correct_answer_en: "51500",
          acceptable_tolerance: 1,
          explanation_en:
            'Reconciliation: Budgeted profit + favourable variances \u2212 adverse variances = actual profit. Favourable total: 1,500 + 800 + 3,000 = 5,300. Adverse total: 2,000 + 1,200 + 600 = 3,800. Net = 5,300 \u2212 3,800 = +1,500. Actual profit = 50,000 + 1,500 = $51,500. The operating statement format presents this systematically: start with budget, list each variance with sign, end with actual. This is how the variances "explain" the gap between planned and actual outcomes.',
          explanation_ru:
            "Сверка: Бюджетная прибыль + благоприятные − неблагоприятные = фактическая прибыль. Сумма благоприятных: 1 500 + 800 + 3 000 = 5 300. Сумма неблагоприятных: 2 000 + 1 200 + 600 = 3 800. Нетто = 5 300 − 3 800 = +1 500. Фактическая прибыль = 50 000 + 1 500 = $51 500. Операционный отчёт оформляет это последовательно: от бюджета через перечень отклонений со знаками - к факту. Так отклонения «объясняют» разрыв между планом и реальностью.",
          explanation_uz:
            "Solishtirish: Byudjetlangan foyda + foydali og'ishlar - salbiy og'ishlar = haqiqiy foyda. Foydali jami: 1 500 + 800 + 3 000 = 5 300. Salbiy jami: 2 000 + 1 200 + 600 = 3 800. Sof = 5 300 - 3 800 = +1 500. Haqiqiy foyda = 50 000 + 1 500 = 51 500 dollar. Operatsion hisobot formati buni tizimli taqdim etadi: byudjetdan boshlanadi, har bir og'ishni ishorasi bilan sanab o'tadi, haqiqiy bilan tugaydi. Og'ishlar rejalashtirilgan va haqiqiy natijalar o'rtasidagi farqni shunday \"tushuntiradi\".",
        },
        // -------- Q15 - hard MCQ on integrated variance scenario --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            "Variance investigation should focus on variances that are:",
          prompt_ru:
            "Расследование отклонений должно фокусироваться на отклонениях, которые:",
          prompt_uz:
            "Og'ishni tekshirish quyidagi og'ishlarga e'tibor qaratishi kerak:",
          options: [
            {
              key: "A",
              text_en:
                "Adverse only \u2014 favourable variances need no investigation",
              text_ru:
                "Только неблагоприятные - благоприятные не требуют расследования",
              text_uz:
                "Faqat salbiy - foydali og'ishlar tekshirishni talab qilmaydi",
              why_wrong_en:
                "A LARGE favourable variance can hide problems too: standards too loose, quality reductions saving cost short-term but creating issues later, or even fraud. Both directions deserve scrutiny when material.",
              why_wrong_ru:
                "Крупное БЛАГОПРИЯТНОЕ отклонение тоже может скрывать проблемы: слабые нормативы, экономия на качестве со скрытыми последствиями или даже мошенничество. Оба направления заслуживают внимания при существенности.",
              why_wrong_uz:
                "KATTA foydali og'ish ham muammolarni yashirishi mumkin: juda bo'sh standartlar, qisqa muddatda xarajat tejaydigan, ammo keyin muammo yaratadigan sifat pasayishlari yoki hatto firibgarlik. Ikkala yo'nalish ham salmoqli bo'lganda tekshiruvga loyiq.",
            },
            {
              key: "B",
              text_en:
                "Material in size, persistent in direction, or controllable",
              text_ru:
                "Существенные по размеру, устойчивые по направлению или контролируемые",
              text_uz:
                "O'lcham jihatdan salmoqli, yo'nalish jihatdan barqaror yoki nazorat qilinadigan",
            },
            {
              key: "C",
              text_en:
                "Above a fixed threshold like $100 regardless of context",
              text_ru:
                "Выше фиксированного порога вроде $100 независимо от контекста",
              text_uz:
                "Kontekstdan qat'i nazar 100 dollar kabi o'zgarmas chegaradan yuqori",
              why_wrong_en:
                "A single dollar threshold ignores scale: $100 might be massive for one cost line and trivial for another. Materiality should be context-relative.",
              why_wrong_ru:
                "Один фиксированный долларовый порог игнорирует масштаб: $100 могут быть огромными для одной статьи и пустяком для другой. Существенность должна быть относительной к контексту.",
              why_wrong_uz:
                "Yagona dollar chegarasi ko'lamni e'tiborsiz qoldiradi: 100 dollar bir xarajat qatori uchun juda katta, boshqasi uchun esa arzimas bo'lishi mumkin. Salmoqlilik kontekstga nisbiy bo'lishi kerak.",
            },
            {
              key: "D",
              text_en: "Every variance, however small",
              text_ru: "Каждое, каким бы малым ни было",
              text_uz: "Har bir og'ish, qanchalik kichik bo'lsa ham",
              why_wrong_en:
                "Investigating every variance is uneconomic; the cost of investigation often exceeds its benefit for tiny variances. The cost-benefit principle applies.",
              why_wrong_ru:
                "Расследование каждого отклонения нерентабельно; стоимость расследования часто превышает выгоду для мельчайших. Действует принцип «затраты-выгоды».",
              why_wrong_uz:
                "Har bir og'ishni tekshirish noiqtisodiy; tekshirish xarajati mayda og'ishlar uchun ko'pincha uning nafidan oshadi. Xarajat-naf tamoyili qo'llaniladi.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Three criteria for investigation: SIZE (material variances justify the cost of investigation; tiny ones don't), PERSISTENCE (a recurring small adverse variance may signal a systemic problem worse than a single large one), and CONTROLLABILITY (investigate what management can fix; market-price swings outside management's control may not warrant action). Many firms set tolerance thresholds (e.g. > 5% or > $1,000) but adjust for the three criteria together. Critically, investigation isn't limited to adverse: large favourable variances can also signal that standards are stale, quality has been compromised, or something else is off.",
          explanation_ru:
            "Три критерия для расследования: РАЗМЕР (существенные отклонения оправдывают стоимость расследования, мелкие - нет), УСТОЙЧИВОСТЬ (повторяющееся малое неблагоприятное отклонение может сигнализировать о системной проблеме, более серьёзной, чем единичное крупное), и КОНТРОЛИРУЕМОСТЬ (расследовать то, что руководство может исправить; колебания рыночных цен вне контроля могут не требовать действий). Многие фирмы устанавливают пороги допуска (например, > 5% или > $1 000), но корректируют их по совокупности трёх критериев. Важно: расследование не ограничивается неблагоприятными - крупные благоприятные тоже могут сигнализировать об устаревших нормативах, ухудшении качества или иных проблемах.",
          explanation_uz:
            "Tekshirish uchun uch mezon: O'LCHAM (salmoqli og'ishlar tekshirish xarajatini oqlaydi; mayda og'ishlar oqlamaydi), BARQARORLIK (takrorlanuvchi kichik salbiy og'ish yagona katta og'ishdan yomonroq tizimli muammoga ishora qilishi mumkin) va NAZORAT QILINISHI (boshqaruv tuzata oladigan narsani tekshiring; boshqaruv nazoratidan tashqaridagi bozor-narx tebranishlari harakatni oqlamasligi mumkin). Ko'plab firmalar chegara qiymatlarini belgilaydi (masalan, > 5% yoki > 1 000 dollar), ammo uch mezonni birga hisobga olib moslashtiradi. Muhimi, tekshirish faqat salbiylar bilan cheklanmaydi: katta foydali og'ishlar ham standartlar eskirgani, sifat susayganini yoki boshqa nimadir noto'g'riligini ko'rsatishi mumkin.",
        },
      ],
    },

    // ---------- F ----------
    {
      code: "F",
      title_en: "Performance measurement",
      title_ru: "Оценка эффективности",
      title_uz: "Faoliyatni o'lchash",
      description_en:
        "Financial and non-financial measures, balanced scorecard, the three Es, and service/NFP performance.",
      description_ru:
        "Финансовые и нефинансовые показатели, сбалансированная система показателей, три «Э», эффективность в сервисе и некоммерческом секторе.",
      description_uz:
        "Moliyaviy va nomoliyaviy o'lchovlar, muvozanatli ko'rsatkichlar tizimi (balanced scorecard), uchta E va xizmat/notijorat faoliyati.",
      sort_order: 60,
      theory_en:
        "Performance measurement turns strategy into numbers managers can act on. Mission statements set ultimate purpose; strategic, tactical, and operational objectives cascade from them down to daily activity. Critical Success Factors (CSFs) are the few things an organisation must get right; Key Performance Indicators (KPIs) are the measures that track them.\n\n" +
        "Financial measures address profitability (gross margin, operating margin, ROCE = Operating Profit / Capital Employed, ROI), liquidity (current ratio = current assets / current liabilities; quick or acid-test ratio excludes inventory), efficiency (inventory days, receivables days, payables days, asset turnover), and gearing (debt / equity, interest cover = operating profit / finance cost). Each ratio is compared against prior period, budget, or industry benchmark to be meaningful.\n\n" +
        "Return on Investment (ROI) = profit / investment; Residual Income (RI) = profit \u2212 (cost of capital \u00d7 investment). RI is an absolute figure that avoids the ROI weakness of rejecting NPV-positive projects with returns below current divisional ROI. Both can encourage short-termism.\n\n" +
        "Non-financial performance measures matter because financial ones lag. The Balanced Scorecard (Kaplan & Norton) views the business through four linked perspectives: financial (how do we look to shareholders?), customer (how do customers see us?), internal business process (what must we excel at?), and learning and growth / innovation (how do we continue to improve?). Each gets its own measures.\n\n" +
        "Public sector and not-for-profit performance is assessed by the three Es \u2014 value for money: Economy (inputs at lowest cost), Efficiency (output per unit of input), Effectiveness (achievement of intended outcome). Service industries face measurement challenges from intangibility, heterogeneity, simultaneity (production and consumption at once), and perishability. Total Quality Management (TQM) and benchmarking against competitors or best-in-class operations are common improvement tools.",
      theory_ru:
        "Оценка эффективности переводит стратегию в показатели, на которые менеджеры могут реагировать. Миссия задаёт конечное предназначение; стратегические, тактические и операционные цели каскадируются от неё до повседневной деятельности. Критические факторы успеха (CSF) - это немногие вещи, которые организация обязана делать правильно; ключевые показатели эффективности (KPI) - это метрики, которые их отслеживают.\n\n" +
        "Финансовые показатели охватывают рентабельность (валовая маржа, операционная маржа, ROCE = операционная прибыль / задействованный капитал, ROI), ликвидность (коэффициент текущей ликвидности = оборотные активы / краткосрочные обязательства; быстрая ликвидность исключает запасы), эффективность (оборачиваемость запасов в днях, дебиторской и кредиторской задолженности в днях, оборачиваемость активов) и финансовый рычаг (долг / собственный капитал, покрытие процентов = операционная прибыль / финансовые расходы). Любой коэффициент имеет смысл только в сравнении с прошлым периодом, бюджетом или отраслевым ориентиром.\n\n" +
        "Доходность инвестиций (ROI) = прибыль / инвестиции; остаточный доход (RI) = прибыль − (стоимость капитала × инвестиции). RI - абсолютный показатель, обходящий недостаток ROI: ROI заставляет отвергать проекты с положительной NPV, если их доходность ниже текущего ROI подразделения. Оба показателя могут провоцировать краткосрочное мышление.\n\n" +
        "Нефинансовые показатели важны, потому что финансовые - запаздывающие. Сбалансированная система показателей Каплана и Нортона рассматривает бизнес через четыре связанные перспективы: финансовая (как нас видят акционеры?), клиентская (как нас видят клиенты?), внутренние бизнес-процессы (в чём мы должны быть превосходны?), обучение и рост / инновации (как мы продолжаем улучшаться?). Каждая получает собственный набор метрик.\n\n" +
        "Эффективность в государственном секторе и некоммерческих организациях оценивается через три «Э» - ценность за деньги: Economy (экономность - затраты по минимальной цене), Efficiency (производительность - выпуск на единицу затрат), Effectiveness (результативность - достижение намеченного результата). Сфера услуг сталкивается с измерительными трудностями из-за неосязаемости, неоднородности, одновременности производства и потребления, и невозможности хранения. Всеобщее управление качеством (TQM) и бенчмаркинг против конкурентов или лидеров отрасли - распространённые инструменты улучшения.",
      theory_uz:
        "Faoliyatni o'lchash strategiyani menejerlar harakat qila oladigan raqamlarga aylantiradi. Missiya bayonotlari yakuniy maqsadni belgilaydi; strategik, taktik va operatsion maqsadlar ulardan kundalik faoliyatgacha kaskad bo'yicha tushadi. Muvaffaqiyatning Muhim Omillari (CSF) - tashkilot to'g'ri qilishi shart bo'lgan bir nechta narsa; Asosiy Faoliyat Ko'rsatkichlari (KPI) - ularni kuzatuvchi o'lchovlar.\n\nMoliyaviy o'lchovlar foydalilikni (yalpi marja, operatsion marja, ROCE = Operatsion Foyda / Jalb qilingan Kapital, ROI), likvidlikni (joriy nisbat = joriy aktivlar / joriy majburiyatlar; tezkor yoki kislota-sinov nisbati zaxirani istisno qiladi), samaradorlikni (zaxira kunlari, debitorlik kunlari, kreditorlik kunlari, aktivlar aylanmasi) va leverajni (qarz / kapital, foiz qoplami = operatsion foyda / moliya xarajati) qamrab oladi. Har bir nisbat ma'noli bo'lishi uchun oldingi davr, byudjet yoki soha mezoni bilan solishtiriladi.\n\nSarmoya Foydasi (ROI) = foyda / sarmoya; Qoldiq Daromad (RI) = foyda - (kapital narxi x sarmoya). RI - mutlaq ko'rsatkich bo'lib, joriy bo'lim ROIsidan past foydali NPV-musbat loyihalarni rad etish ROI zaifligidan qochadi. Ikkalasi ham qisqa muddatlilikni rag'batlantirishi mumkin.\n\nNomoliyaviy faoliyat o'lchovlari muhim, chunki moliyaviylari kechikadi. Muvozanatli Ko'rsatkichlar Tizimi (Kaplan va Norton) biznesni to'rtta bog'liq nuqtai nazardan ko'radi: moliyaviy (aksiyadorlarga qanday ko'rinamiz?), mijoz (mijozlar bizni qanday ko'radi?), ichki biznes jarayoni (nimada zo'r bo'lishimiz kerak?) va o'rganish va o'sish / innovatsiya (qanday takomillashishda davom etamiz?). Har biri o'z o'lchovlarini oladi.\n\nDavlat sektori va notijorat faoliyati uchta E - pul evaziga qiymat orqali baholanadi: Tejamkorlik (Economy - kirishlar eng past xarajatda), Samaradorlik (Efficiency - kirish birligiga natija), Natijaviylik (Effectiveness - mo'ljallangan natijaga erishish). Xizmat ko'rsatish sohalari nomoddiylik, bir xil bo'lmaslik, bir vaqtdalik (ishlab chiqarish va iste'mol bir vaqtda) va saqlanmaslikdan kelib chiqadigan o'lchash qiyinchiliklariga duch keladi. Umumiy Sifat Boshqaruvi (TQM) va raqobatchilar yoki eng yaxshi amaliyotlarga nisbatan benchmarking keng tarqalgan takomillashtirish vositalaridir.",
      questions: [
        // -------- Q1 - easy MCQ on ROCE definition --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en: "Return on Capital Employed (ROCE) is calculated as:",
          prompt_ru:
            "Рентабельность задействованного капитала (ROCE) рассчитывается как:",
          prompt_uz:
            "Jalb qilingan Kapital Foydasi (ROCE) quyidagicha hisoblanadi:",
          options: [
            {
              key: "A",
              text_en: "Net profit / Sales \u00d7 100",
              text_ru: "Чистая прибыль / Выручка × 100",
              text_uz: "Sof foyda / Sotuv x 100",
              why_wrong_en: "That ratio is NET PROFIT MARGIN, not ROCE.",
              why_wrong_ru: "Это коэффициент ЧИСТОЙ МАРЖИ, а не ROCE.",
              why_wrong_uz: "Bu nisbat - ROCE emas, SOF FOYDA MARJASIdir.",
            },
            {
              key: "B",
              text_en: "Operating profit / Capital employed \u00d7 100",
              text_ru: "Операционная прибыль / Задействованный капитал × 100",
              text_uz: "Operatsion foyda / Jalb qilingan kapital x 100",
            },
            {
              key: "C",
              text_en: "Sales / Total assets",
              text_ru: "Выручка / Активы итого",
              text_uz: "Sotuv / Jami aktivlar",
              why_wrong_en:
                "That is ASSET TURNOVER, an efficiency ratio, not a profitability ratio.",
              why_wrong_ru:
                "Это ОБОРАЧИВАЕМОСТЬ АКТИВОВ, коэффициент эффективности, не рентабельности.",
              why_wrong_uz:
                "Bu - foydalilik nisbati emas, AKTIVLAR AYLANMASI, ya'ni samaradorlik nisbatidir.",
            },
            {
              key: "D",
              text_en: "Gross profit / Cost of sales",
              text_ru: "Валовая прибыль / Себестоимость",
              text_uz: "Yalpi foyda / Sotuv tannarxi",
              why_wrong_en:
                "A non-standard mash-up; the proper gross margin is gross profit / sales \u00d7 100.",
              why_wrong_ru:
                "Нестандартное смешение; правильная валовая маржа = валовая прибыль / выручка × 100.",
              why_wrong_uz:
                "Standart bo'lmagan aralashma; to'g'ri yalpi marja - yalpi foyda / sotuv x 100.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "ROCE = Operating Profit / Capital Employed \u00d7 100, where Capital Employed = Equity + Non-current Liabilities (= Total Assets \u2212 Current Liabilities). It measures how efficiently the firm uses its long-term funding to generate operating returns. ROCE is the headline measure of management performance because it links profitability with the capital base. A firm with high margins but low ROCE may be using too much capital; high ROCE shows capital-efficient operations.",
          explanation_ru:
            "ROCE = Операционная прибыль / Задействованный капитал × 100, где задействованный капитал = Капитал + Долгосрочные обязательства (= Активы итого − Краткосрочные обязательства). Показывает, насколько эффективно фирма использует долгосрочное финансирование для генерации операционной прибыли. ROCE - заглавная метрика управленческой эффективности, так как связывает рентабельность с базой капитала. Фирма с высокой маржой и низким ROCE использует слишком много капитала; высокий ROCE - признак капитал-эффективной работы.",
          explanation_uz:
            "ROCE = Operatsion Foyda / Jalb qilingan Kapital x 100, bu yerda Jalb qilingan Kapital = Kapital + Uzoq muddatli Majburiyatlar (= Jami Aktivlar - Joriy Majburiyatlar). U firma operatsion daromad hosil qilish uchun uzoq muddatli mablag'laridan qanchalik samarali foydalanishini o'lchaydi. ROCE boshqaruv faoliyatining asosiy o'lchovidir, chunki u foydalilikni kapital bazasi bilan bog'laydi. Yuqori marjali, ammo past ROCEli firma juda ko'p kapitaldan foydalanayotgan bo'lishi mumkin; yuqori ROCE kapitalga tejamkor operatsiyalarni ko'rsatadi.",
        },
        // -------- Q2 - easy MCQ on three Es --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en: 'In public sector performance, "Effectiveness" refers to:',
          prompt_ru:
            "В оценке эффективности в государственном секторе «результативность» означает:",
          prompt_uz:
            'Davlat sektori faoliyatida "Natijaviylik" quyidagini anglatadi:',
          options: [
            {
              key: "A",
              text_en: "Buying inputs at the lowest cost",
              text_ru: "Покупку ресурсов по минимальной цене",
              text_uz: "Kirishlarni eng past xarajatda sotib olish",
              why_wrong_en: "That is ECONOMY (the first E), about input cost.",
              why_wrong_ru:
                "Это ЭКОНОМНОСТЬ (первая «Э»), про стоимость ресурсов.",
              why_wrong_uz:
                "Bu - kirish xarajati haqidagi TEJAMKORLIK (birinchi E).",
            },
            {
              key: "B",
              text_en: "Producing more output per unit of input",
              text_ru: "Производство большего выпуска на единицу ресурса",
              text_uz: "Kirish birligiga ko'proq natija ishlab chiqarish",
              why_wrong_en:
                "That is EFFICIENCY (the second E), about the ratio of output to input.",
              why_wrong_ru:
                "Это ПРОИЗВОДИТЕЛЬНОСТЬ (вторая «Э»), про отношение выпуска к ресурсу.",
              why_wrong_uz:
                "Bu - natija va kirish nisbati haqidagi SAMARADORLIK (ikkinchi E).",
            },
            {
              key: "C",
              text_en: "Achieving the intended outcome or policy goal",
              text_ru: "Достижение намеченного результата или цели политики",
              text_uz: "Mo'ljallangan natija yoki siyosat maqsadiga erishish",
            },
            {
              key: "D",
              text_en: "Maximising shareholder return",
              text_ru: "Максимизацию доходности для акционеров",
              text_uz: "Aksiyador foydasini maksimallashtirish",
              why_wrong_en:
                "Public sector entities don't have shareholders; the three Es framework is specifically designed for the absence of profit motive.",
              why_wrong_ru:
                "У госсектора нет акционеров; рамка трёх «Э» именно для случая, когда мотив прибыли отсутствует.",
              why_wrong_uz:
                "Davlat sektori sub'ektlarida aksiyadorlar yo'q; uchta E doirasi aynan foyda motivi yo'qligi uchun mo'ljallangan.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "The three Es: ECONOMY \u2014 obtaining the right inputs at the lowest cost (input side). EFFICIENCY \u2014 producing the most output per unit of input (input \u2192 output process). EFFECTIVENESS \u2014 actually achieving the intended outcome or social goal (output \u2192 outcome). A hospital that runs cheaply (economy), processes many patients per nurse (efficiency), but doesn't actually improve health outcomes is failing on effectiveness. Real value-for-money requires all three.",
          explanation_ru:
            "Три «Э»: ЭКОНОМНОСТЬ - приобретение нужных ресурсов по минимальной цене (вход). ПРОИЗВОДИТЕЛЬНОСТЬ - максимум выпуска на единицу ресурса (преобразование). РЕЗУЛЬТАТИВНОСТЬ - реальное достижение намеченного результата или социальной цели (выход → результат). Больница, работающая дёшево (экономность), пропускающая много пациентов на медсестру (производительность), но не улучшающая здоровье - провал по результативности. Настоящая ценность за деньги требует всех трёх.",
          explanation_uz:
            "Uchta E: TEJAMKORLIK - to'g'ri kirishlarni eng past xarajatda olish (kirish tomoni). SAMARADORLIK - kirish birligiga eng ko'p natija ishlab chiqarish (kirish -> natija jarayoni). NATIJAVIYLIK - mo'ljallangan natija yoki ijtimoiy maqsadga haqiqatan erishish (natija -> oqibat). Arzon ishlaydigan (tejamkorlik), hamshira boshiga ko'p bemorni qabul qiladigan (samaradorlik), ammo aslida sog'liqni yaxshilamaydigan kasalxona natijaviylikda muvaffaqiyatsizdir. Haqiqiy pul evaziga qiymat uchalasini ham talab qiladi.",
        },
        // -------- Q3 - easy short_answer on balanced scorecard --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "Which of the following is one of the four perspectives of Kaplan and Norton's Balanced Scorecard?",
          prompt_ru:
            "Какая из перечисленных является одной из четырёх перспектив сбалансированной системы показателей Каплана и Нортона?",
          prompt_uz:
            "Quyidagilardan qaysi biri Kaplan va Nortonning Muvozanatli Ko'rsatkichlar Tizimining to'rtta nuqtai nazaridan biri?",
          options: [
            {
              key: "A",
              text_en: "Internal business process",
              text_ru: "Внутренние бизнес-процессы",
              text_uz: "Ichki biznes jarayoni",
            },
            {
              key: "B",
              text_en: "Competitor perspective",
              text_ru: "Перспектива конкурентов",
              text_uz: "Raqobatchi nuqtai nazari",
              why_wrong_en:
                'There is no "competitor" perspective; the four are financial, customer, internal process, and learning & growth.',
              why_wrong_ru:
                "Перспективы «конкуренты» нет; четыре - финансы, клиенты, внутренние процессы, обучение и рост.",
              why_wrong_uz:
                "\"Raqobatchi\" nuqtai nazari yo'q; to'rttasi - moliyaviy, mijoz, ichki jarayon va o'rganish va o'sishdir.",
            },
            {
              key: "C",
              text_en: "Regulatory perspective",
              text_ru: "Регуляторная перспектива",
              text_uz: "Tartibga solish nuqtai nazari",
              why_wrong_en:
                'Regulation is not one of the four perspectives; the people/innovation dimension is "learning and growth".',
              why_wrong_ru:
                "Регулирование не входит в четыре перспективы; за людей/инновации отвечает «обучение и рост».",
              why_wrong_uz:
                "Tartibga solish to'rtta nuqtai nazardan biri emas; odamlar/innovatsiya o'lchami - \"o'rganish va o'sish\"dir.",
            },
            {
              key: "D",
              text_en: "Supplier perspective",
              text_ru: "Перспектива поставщиков",
              text_uz: "Yetkazib beruvchi nuqtai nazari",
              why_wrong_en:
                "Suppliers are not a scorecard perspective; the four are financial, customer, internal process, and learning & growth.",
              why_wrong_ru:
                "Поставщики не являются перспективой системы; четыре - финансы, клиенты, внутренние процессы, обучение и рост.",
              why_wrong_uz:
                "Yetkazib beruvchilar ko'rsatkichlar tizimi nuqtai nazari emas; to'rttasi - moliyaviy, mijoz, ichki jarayon va o'rganish va o'sishdir.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "The four perspectives are Financial (how do we look to shareholders?), Customer (how do customers see us?), Internal business process (what must we excel at?), and Learning & growth (how do we keep improving?). They balance lagging financial measures with leading non-financial drivers.",
          explanation_ru:
            "Четыре перспективы: финансовая (как нас видят акционеры?), клиентская (как нас видят клиенты?), внутренние бизнес-процессы (в чём мы должны преуспеть?) и обучение и рост (как мы продолжаем совершенствоваться?). Они балансируют запаздывающие финансовые показатели с опережающими нефинансовыми драйверами.",
          explanation_uz:
            "To'rtta nuqtai nazar: Moliyaviy (aksiyadorlarga qanday ko'rinamiz?), Mijoz (mijozlar bizni qanday ko'radi?), Ichki biznes jarayoni (nimada zo'r bo'lishimiz kerak?) va O'rganish va o'sish (qanday takomillashishda davom etamiz?). Ular kechikuvchi moliyaviy o'lchovlarni yetakchi nomoliyaviy harakatlantiruvchilar bilan muvozanatlaydi.",
        },
        // -------- Q4 - easy MCQ on quick ratio --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "The QUICK ratio (acid test) differs from the CURRENT ratio in that the quick ratio:",
          prompt_ru:
            "Коэффициент БЫСТРОЙ ликвидности отличается от коэффициента ТЕКУЩЕЙ ликвидности тем, что быстрая ликвидность:",
          prompt_uz:
            "TEZKOR nisbat (kislota-sinov) JORIY nisbatdan quyidagisi bilan farq qiladi:",
          options: [
            {
              key: "A",
              text_en: "Excludes inventory from current assets",
              text_ru: "Исключает запасы из оборотных активов",
              text_uz: "Joriy aktivlardan zaxirani istisno qiladi",
            },
            {
              key: "B",
              text_en: "Includes only cash",
              text_ru: "Включает только денежные средства",
              text_uz: "Faqat naqd pulni o'z ichiga oladi",
              why_wrong_en:
                "That would be the CASH ratio, which is even stricter; quick ratio includes cash, receivables, and short-term investments \u2014 just not inventory.",
              why_wrong_ru:
                "Это коэффициент ДЕНЕЖНОЙ ликвидности, ещё строже; быстрая включает деньги, дебиторку и краткосрочные инвестиции - только без запасов.",
              why_wrong_uz:
                "Bu yanada qattiqroq bo'lgan NAQD nisbati bo'lardi; tezkor nisbat naqd pul, debitorlik va qisqa muddatli sarmoyalarni o'z ichiga oladi - faqat zaxirani emas.",
            },
            {
              key: "C",
              text_en: "Includes non-current assets",
              text_ru: "Включает внеоборотные активы",
              text_uz: "Uzoq muddatli aktivlarni o'z ichiga oladi",
              why_wrong_en:
                "Both ratios use only current items; non-current assets are excluded from both.",
              why_wrong_ru:
                "Оба коэффициента используют только оборотные статьи; внеоборотные исключены из обоих.",
              why_wrong_uz:
                "Ikkala nisbat ham faqat joriy moddalardan foydalanadi; uzoq muddatli aktivlar ikkalasidan ham istisno qilinadi.",
            },
            {
              key: "D",
              text_en: "Is measured against non-current liabilities",
              text_ru: "Измеряется против долгосрочных обязательств",
              text_uz: "Uzoq muddatli majburiyatlarga nisbatan o'lchanadi",
              why_wrong_en:
                "Both ratios measure against CURRENT liabilities; the difference is in the numerator (which current assets), not the denominator.",
              why_wrong_ru:
                "Оба коэффициента сопоставляются с КРАТКОСРОЧНЫМИ обязательствами; различие в числителе (какие оборотные активы), а не в знаменателе.",
              why_wrong_uz:
                "Ikkala nisbat ham JORIY majburiyatlarga nisbatan o'lchanadi; farq maxraj (qaysi joriy aktivlar)da, surat'da emas.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Current ratio = Current Assets / Current Liabilities. Quick ratio = (Current Assets \u2212 Inventory) / Current Liabilities. The quick ratio excludes inventory because inventory may take time to convert to cash (or be unsellable at all). It tests whether the firm could meet short-term obligations if it couldn't sell its stock. Useful benchmarks: current ratio around 1.5\u20132 and quick ratio around 1 are typical for manufacturing; service firms with no inventory naturally have current and quick ratios that are nearly identical.",
          explanation_ru:
            "Текущая ликвидность = Оборотные активы / Краткосрочные обязательства. Быстрая ликвидность = (Оборотные активы − Запасы) / Краткосрочные обязательства. Быстрая исключает запасы, потому что им нужно время для конвертации в деньги (или они вообще могут оказаться непродаваемыми). Это проверка, сможет ли фирма выполнить краткосрочные обязательства, не распродавая запас. Ориентиры: текущая 1,5–2 и быстрая около 1 - обычные значения для производства; у сервисных фирм без запасов оба коэффициента почти совпадают.",
          explanation_uz:
            "Joriy nisbat = Joriy Aktivlar / Joriy Majburiyatlar. Tezkor nisbat = (Joriy Aktivlar - Zaxira) / Joriy Majburiyatlar. Tezkor nisbat zaxirani istisno qiladi, chunki zaxira pulga aylanishga vaqt olishi (yoki umuman sotilmasligi) mumkin. U firma o'z zaxirasini sota olmasa, qisqa muddatli majburiyatlarni qoplay oladimi-yo'qmi sinaydi. Foydali mezonlar: ishlab chiqarish uchun joriy nisbat taxminan 1,5-2 va tezkor nisbat taxminan 1 odatiy; zaxirasiz xizmat firmalarida joriy va tezkor nisbatlar tabiiy ravishda deyarli bir xil.",
        },
        // -------- Q5 - medium NUMBER_ENTRY on ROCE --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "Operating profit is $120,000. Total assets are $800,000. Current liabilities are $200,000. Calculate ROCE as a percentage (to 1 decimal place).",
          prompt_ru:
            "Операционная прибыль $120 000. Активы итого $800 000. Краткосрочные обязательства $200 000. Рассчитайте ROCE в процентах (с точностью до 1 знака).",
          prompt_uz:
            "Operatsion foyda 120 000 dollar. Jami aktivlar 800 000 dollar. Joriy majburiyatlar 200 000 dollar. ROCEni foiz sifatida hisoblang (1 kasr xonagacha).",
          correct_answer_en: "20",
          acceptable_tolerance: 0.1,
          explanation_en:
            "Capital Employed = Total Assets \u2212 Current Liabilities = 800,000 \u2212 200,000 = $600,000. (Equivalent: Equity + Non-current Liabilities = $600,000.) ROCE = Operating Profit / Capital Employed \u00d7 100 = 120,000 / 600,000 \u00d7 100 = 20.0%. Capital employed represents the long-term funding the firm uses; current liabilities are excluded because they are short-term obligations rather than committed capital.",
          explanation_ru:
            "Задействованный капитал = Активы итого − Краткосрочные обязательства = 800 000 − 200 000 = $600 000. (Эквивалентно: Капитал + Долгосрочные обязательства = $600 000.) ROCE = Операционная прибыль / Задействованный капитал × 100 = 120 000 / 600 000 × 100 = 20,0%. Задействованный капитал - долгосрочное финансирование фирмы; краткосрочные обязательства исключены, так как это короткие обязательства, а не привязанный капитал.",
          explanation_uz:
            "Jalb qilingan Kapital = Jami Aktivlar - Joriy Majburiyatlar = 800 000 - 200 000 = 600 000 dollar. (Teng: Kapital + Uzoq muddatli Majburiyatlar = 600 000 dollar.) ROCE = Operatsion Foyda / Jalb qilingan Kapital x 100 = 120 000 / 600 000 x 100 = 20,0%. Jalb qilingan kapital firma foydalanadigan uzoq muddatli mablag'ni ifodalaydi; joriy majburiyatlar majburiy kapital emas, qisqa muddatli majburiyatlar bo'lgani uchun istisno qilinadi.",
        },
        // -------- Q6 - medium NUMBER_ENTRY on receivables days --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "Annual credit sales were $1,825,000. Closing trade receivables are $250,000. Calculate the RECEIVABLES COLLECTION PERIOD in days (assume 365-day year, round to whole days).",
          prompt_ru:
            "Годовые продажи в кредит $1 825 000. Конечная дебиторская задолженность $250 000. Рассчитайте СРОК ИНКАССАЦИИ ДЕБИТОРСКОЙ ЗАДОЛЖЕННОСТИ в днях (365-дневный год, округлите до целых дней).",
          prompt_uz:
            "Yillik kredit sotuvi 1 825 000 dollar edi. Yopuvchi savdo debitorligi 250 000 dollar. DEBITORLIKNI YIG'ISH DAVRINI kunlarda hisoblang (365 kunlik yil deb taxmin qiling, butun kunlargacha yaxlitlang).",
          correct_answer_en: "50",
          acceptable_tolerance: 1,
          explanation_en:
            'Receivables days = (Receivables / Credit Sales) \u00d7 365 = (250,000 / 1,825,000) \u00d7 365 = 0.1370 \u00d7 365 = 50.0 days. Interpretation: on average customers take 50 days to pay. Compare to credit terms offered (e.g. "30 days net") \u2014 a 50-day collection on 30-day terms means slow payment, possibly indicating weak credit control or customers in financial distress. Comparable measures: inventory days (how long stock sits) and payables days (how long the firm takes to pay suppliers).',
          explanation_ru:
            "Срок инкассации = (Дебиторка / Продажи в кредит) × 365 = (250 000 / 1 825 000) × 365 = 0,1370 × 365 = 50,0 дней. Интерпретация: в среднем клиенты платят 50 дней. Сравните с условиями кредита (например, «30 дней нетто») - 50 дней при 30-дневных условиях означают медленные платежи, возможно слабый кредитный контроль или клиентов в финансовых затруднениях. Сравнимые показатели: оборачиваемость запасов в днях и оборачиваемость кредиторки в днях.",
          explanation_uz:
            "Debitorlik kunlari = (Debitorlik / Kredit Sotuvi) x 365 = (250 000 / 1 825 000) x 365 = 0,1370 x 365 = 50,0 kun. Talqin: o'rtacha mijozlar to'lashga 50 kun oladi. Taklif qilingan kredit shartlari bilan solishtiring (masalan, \"30 kun ichida\") - 30 kunlik shartda 50 kunlik yig'ish sekin to'lovni bildiradi, ehtimol zaif kredit nazorati yoki moliyaviy qiyinchilikdagi mijozlarni ko'rsatadi. Taqqoslanadigan o'lchovlar: zaxira kunlari (zaxira qancha turishi) va kreditorlik kunlari (firma yetkazib beruvchilarga to'lashga qancha vaqt olishi).",
        },
        // -------- Q7 - medium NUMBER_ENTRY on gearing --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "Equity is $400,000. Long-term debt is $100,000. Calculate GEARING expressed as Debt/(Debt+Equity) as a percentage (to 1 decimal place).",
          prompt_ru:
            "Капитал $400 000. Долгосрочный долг $100 000. Рассчитайте КОЭФФИЦИЕНТ ФИНАНСОВОГО РЫЧАГА = Долг / (Долг + Капитал) в процентах (с точностью до 1 знака).",
          prompt_uz:
            "Kapital 400 000 dollar. Uzoq muddatli qarz 100 000 dollar. LEVERAJni Qarz/(Qarz+Kapital) sifatida foizda hisoblang (1 kasr xonagacha).",
          correct_answer_en: "20",
          acceptable_tolerance: 0.1,
          explanation_en:
            "Gearing = Debt / (Debt + Equity) \u00d7 100 = 100,000 / (100,000 + 400,000) \u00d7 100 = 100,000 / 500,000 \u00d7 100 = 20.0%. Note there are TWO common gearing definitions: this one (Debt/(Debt+Equity)) gives a value 0\u2013100%, and the alternative (Debt/Equity) which can exceed 100% \u2014 here it would be 100,000/400,000 = 25%. Always check which the question requires. Higher gearing means more financial risk but also potentially higher return to equity (through leverage).",
          explanation_ru:
            "Финансовый рычаг = Долг / (Долг + Капитал) × 100 = 100 000 / (100 000 + 400 000) × 100 = 100 000 / 500 000 × 100 = 20,0%. Внимание: есть ДВА распространённых определения рычага: данное (Долг/(Долг+Капитал)) даёт значение 0–100%, и альтернативное (Долг/Капитал), которое может превышать 100% - здесь было бы 100 000/400 000 = 25%. Всегда проверяйте, какое требуется в вопросе. Более высокий рычаг - больше финансового риска, но потенциально и большая доходность капитала (через плечо).",
          explanation_uz:
            "Leveraj = Qarz / (Qarz + Kapital) x 100 = 100 000 / (100 000 + 400 000) x 100 = 100 000 / 500 000 x 100 = 20,0%. E'tibor bering, IKKITA keng tarqalgan leveraj ta'rifi bor: bu (Qarz/(Qarz+Kapital)) 0-100% qiymat beradi, muqobili esa (Qarz/Kapital) 100% dan oshishi mumkin - bu yerda u 100 000/400 000 = 25% bo'lardi. Savol qaysisini talab qilishini har doim tekshiring. Yuqori leveraj ko'proq moliyaviy xavfni, ammo potensial ravishda kapitalga yuqoriroq daromadni (leveraj orqali) anglatadi.",
        },
        // -------- Q8 - medium MCQ on ROI vs RI --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A division has current ROI of 25%. The company\u2019s cost of capital is 12%. A new investment available to the division yields 20%. Under ROI-based performance evaluation, the divisional manager is LIKELY to:",
          prompt_ru:
            "У подразделения текущий ROI 25%. Стоимость капитала компании 12%. Доступная инвестиция даст 20%. При оценке эффективности по ROI руководитель подразделения, ВЕРОЯТНО:",
          prompt_uz:
            "Bo'limning joriy ROIsi 25%. Kompaniyaning kapital narxi 12%. Bo'limga mavjud yangi sarmoya 20% beradi. ROIga asoslangan faoliyat baholashida bo'lim menejeri EHTIMOL:",
          options: [
            {
              key: "A",
              text_en:
                "Accept the investment because 20% > 12% cost of capital",
              text_ru:
                "Примет инвестицию, поскольку 20% > 12% стоимости капитала",
              text_uz: "Sarmoyani qabul qilish, chunki 20% > 12% kapital narxi",
              why_wrong_en:
                "That's what the FIRM should want (positive NPV), but ROI-driven managers behave differently: accepting 20% would LOWER divisional ROI from 25%, so they reject.",
              why_wrong_ru:
                "Так должна была бы поступить ФИРМА (положительная NPV), но при оценке по ROI менеджеры действуют иначе: принятие 20% СНИЗИТ их ROI с 25%, поэтому отвергают.",
              why_wrong_uz:
                "Bu FIRMA xohlashi kerak bo'lgan narsa (musbat NPV), ammo ROIga asoslangan menejerlar boshqacha harakat qiladi: 20% ni qabul qilish bo'lim ROIsini 25% dan PASAYTIRADI, shuning uchun ular rad etadi.",
            },
            {
              key: "B",
              text_en:
                "Reject the investment because it would lower the division\u2019s reported ROI from 25%",
              text_ru:
                "Отвергнет инвестицию, так как она снизит ROI подразделения с 25%",
              text_uz:
                "Sarmoyani rad etish, chunki u bo'limning hisobotdagi ROIsini 25% dan pasaytirardi",
            },
            {
              key: "C",
              text_en: "Be indifferent",
              text_ru: "Будет безразличен",
              text_uz: "Befarq bo'lish",
              why_wrong_en:
                "Indifference would require ROI metric to be neutral; in fact ROI-driven managers have a clear preference to reject value-adding projects that lower their reported ratio.",
              why_wrong_ru:
                "Безразличие требовало бы нейтральности метрики ROI; на деле руководители, ориентированные на ROI, имеют чёткое предпочтение отвергать добавляющие стоимость проекты, снижающие отчётный коэффициент.",
              why_wrong_uz:
                "Befarqlik ROI ko'rsatkichi neytral bo'lishini talab qilardi; aslida ROIga asoslangan menejerlar hisobotdagi nisbatlarini pasaytiruvchi qiymat qo'shuvchi loyihalarni rad etishga aniq moyildir.",
            },
            {
              key: "D",
              text_en: "Be required to accept because ROI is rising",
              text_ru: "Обязан принять, поскольку ROI растёт",
              text_uz: "Qabul qilishga majbur, chunki ROI oshmoqda",
              why_wrong_en:
                "ROI is NOT rising \u2014 a 20% return added to a 25% base lowers the weighted average. Direction is wrong.",
              why_wrong_ru:
                "ROI НЕ растёт - 20%-доходность, добавленная к 25%-базе, снижает средневзвешенную. Направление неверное.",
              why_wrong_uz:
                "ROI oshmayapti - 25% bazaga qo'shilgan 20% daromad vaznli o'rtachani pasaytiradi. Yo'nalish noto'g'ri.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "This is the classic ROI dysfunctional behaviour. The investment's 20% return EXCEEDS the company's 12% cost of capital \u2014 it has positive NPV and should be accepted from the firm's perspective. But because the division's current ROI is 25%, adding a 20% project DROPS the division's overall ROI below 25%, making the manager look worse on the metric they're measured by. Result: the manager rejects a value-adding investment. Residual Income (RI) avoids this trap: RI = profit \u2212 (cost of capital \u00d7 investment) = if the project earns more than 12% on the capital used, RI rises, and the manager accepts.",
          explanation_ru:
            "Классический пример дисфункции ROI. Доходность инвестиции 20% ПРЕВЫШАЕТ стоимость капитала фирмы 12% - у проекта положительная NPV и его стоит принять с точки зрения фирмы. Но текущий ROI подразделения 25%, и добавление 20%-проекта СНИЖАЕТ общий ROI ниже 25%, и руководитель выглядит хуже по показателю, по которому его оценивают. Результат: руководитель отвергает добавляющую стоимость инвестицию. Residual Income (RI) обходит эту ловушку: RI = прибыль − (стоимость капитала × инвестиции); если проект зарабатывает больше 12% на использованный капитал, RI растёт, и руководитель принимает.",
          explanation_uz:
            "Bu klassik ROI disfunksional xatti-harakatdir. Sarmoyaning 20% daromadi kompaniyaning 12% kapital narxidan OSHADI - uning NPVi musbat va firma nuqtai nazaridan qabul qilinishi kerak. Ammo bo'limning joriy ROIsi 25% bo'lgani uchun, 20% loyiha qo'shish bo'limning umumiy ROIsini 25% dan pasaytiradi va menejer o'zi baholanadigan ko'rsatkichda yomonroq ko'rinadi. Natija: menejer qiymat qo'shuvchi sarmoyani rad etadi. Qoldiq Daromad (RI) bu tuzoqdan qochadi: RI = foyda - (kapital narxi x sarmoya) = agar loyiha ishlatilgan kapitalda 12% dan ko'proq daromad olsa, RI oshadi va menejer qabul qiladi.",
        },
        // -------- Q9 - medium MCQ on service industry challenge --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A characteristic of services that makes performance measurement DIFFICULT compared to manufacturing is:",
          prompt_ru:
            "Особенность услуг, затрудняющая оценку эффективности по сравнению с производством:",
          prompt_uz:
            "Xizmatlarning ishlab chiqarish bilan solishtirganda faoliyatni o'lchashni QIYINlashtiradigan xususiyati:",
          options: [
            {
              key: "A",
              text_en: "Higher capital intensity",
              text_ru: "Более высокая капиталоёмкость",
              text_uz: "Yuqori kapital intensivligi",
              why_wrong_en:
                "Most services (consulting, restaurants, retail) are LESS capital-intensive than manufacturing, not more.",
              why_wrong_ru:
                "Большинство услуг (консалтинг, рестораны, розница) МЕНЕЕ капиталоёмки, чем производство.",
              why_wrong_uz:
                "Aksariyat xizmatlar (konsalting, restoranlar, chakana savdo) ishlab chiqarishga qaraganda KAMROQ kapital intensiv, ko'proq emas.",
            },
            {
              key: "B",
              text_en: "Intangibility of the output",
              text_ru: "Нематериальность результата",
              text_uz: "Natijaning nomoddiyligi",
            },
            {
              key: "C",
              text_en: "Higher inventory levels",
              text_ru: "Высокий уровень запасов",
              text_uz: "Yuqori zaxira darajalari",
              why_wrong_en:
                "Services typically have LOW or no inventory (a haircut cannot be stockpiled); manufacturing usually has high inventory.",
              why_wrong_ru:
                "У услуг обычно НЕТ или мало запасов (стрижку нельзя складировать); у производства запасы обычно высокие.",
              why_wrong_uz:
                "Xizmatlarda odatda PAST yoki zaxira yo'q (soch turmagini omborga yig'ib bo'lmaydi); ishlab chiqarishda esa odatda yuqori zaxira bor.",
            },
            {
              key: "D",
              text_en: "Greater standardisation",
              text_ru: "Более высокая стандартизация",
              text_uz: "Kattaroq standartlashtirish",
              why_wrong_en:
                "Services are LESS standardised than manufactured goods \u2014 heterogeneity is exactly another challenge listed for services.",
              why_wrong_ru:
                "Услуги МЕНЕЕ стандартизированы, чем промышленные товары - неоднородность как раз ещё одна сложность для услуг.",
              why_wrong_uz:
                "Xizmatlar ishlab chiqarilgan tovarlarga qaraganda KAMROQ standartlashtirilgan - bir xil bo'lmaslik aynan xizmatlar uchun sanab o'tilgan yana bir qiyinchilikdir.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Services have four characteristics that complicate measurement: INTANGIBILITY (no physical output to inspect; how do you measure the \"quality\" of a consultation?); HETEROGENEITY (each service delivery differs by who provides it, when, where); SIMULTANEITY (produced and consumed at the same time, no chance to inspect before delivery); PERISHABILITY (cannot be stored). Manufacturing measures hardly apply: defect rate is hard when there's no physical product; throughput per hour is harder when output isn't identical. Service measurement often uses proxies: customer satisfaction surveys, response times, on-time delivery, repeat business.",
          explanation_ru:
            "У услуг четыре характеристики, усложняющие измерение: НЕМАТЕРИАЛЬНОСТЬ (нет физического выхода для контроля; как измерить «качество» консультации?); НЕОДНОРОДНОСТЬ (каждая услуга разная - кто, когда, где её оказывает); ОДНОВРЕМЕННОСТЬ (производство и потребление одновременно, нет шанса проверить до оказания); НЕВОЗМОЖНОСТЬ ХРАНЕНИЯ. Производственные метрики плохо применимы: доля брака - сложно, когда нет физического продукта; пропускная способность - сложнее, когда выходы не идентичны. Для услуг используют косвенные показатели: опросы удовлетворённости, время отклика, своевременность, повторные обращения.",
          explanation_uz:
            "Xizmatlar o'lchashni murakkablashtiradigan to'rtta xususiyatga ega: NOMODDIYLIK (tekshiriladigan jismoniy natija yo'q; maslahatning \"sifati\"ni qanday o'lchaysiz?); BIR XIL BO'LMASLIK (har bir xizmat yetkazib berish kim, qachon, qayerda taqdim etishiga ko'ra farq qiladi); BIR VAQTDALIK (bir vaqtning o'zida ishlab chiqarilib iste'mol qilinadi, yetkazishdan oldin tekshirish imkoni yo'q); SAQLANMASLIK (saqlab bo'lmaydi). Ishlab chiqarish o'lchovlari deyarli qo'llanilmaydi: jismoniy mahsulot bo'lmaganda nuqson darajasi qiyin; natija bir xil bo'lmaganda soatiga o'tkazuvchanlik qiyinroq. Xizmat o'lchashi ko'pincha o'rnini bosuvchilardan foydalanadi: mijoz qoniqishi so'rovlari, javob vaqtlari, o'z vaqtida yetkazish, takroriy biznes.",
        },
        // -------- Q10 - medium NUMBER_ENTRY on RI --------
        {
          type: "number_entry",
          difficulty: "medium",
          prompt_en:
            "A division has profit of $80,000 from invested capital of $400,000. The company\u2019s cost of capital is 15%. Calculate the RESIDUAL INCOME (in $).",
          prompt_ru:
            "У подразделения прибыль $80 000 на вложенный капитал $400 000. Стоимость капитала компании 15%. Рассчитайте ОСТАТОЧНЫЙ ДОХОД (в $).",
          prompt_uz:
            "Bo'limning 400 000 dollar jalb qilingan kapitaldan 80 000 dollar foydasi bor. Kompaniyaning kapital narxi 15%. QOLDIQ DAROMADNI hisoblang (dollarda).",
          correct_answer_en: "20000",
          acceptable_tolerance: 1,
          explanation_en:
            'RI = Profit \u2212 (Cost of Capital \u00d7 Investment) = 80,000 \u2212 (0.15 \u00d7 400,000) = 80,000 \u2212 60,000 = $20,000. Positive RI = the division has earned MORE than the cost of capital on the resources committed, so is adding value. Note ROI here = 80,000 / 400,000 = 20%, exceeding the 15% cost of capital - same conclusion from both metrics. The advantage of RI emerges when comparing investments: RI says "accept all projects with positive RI" (consistent with NPV), while ROI says "accept only projects beating current divisional ROI" (which can reject good ones).',
          explanation_ru:
            "RI = Прибыль − (Стоимость капитала × Инвестиции) = 80 000 − (0,15 × 400 000) = 80 000 − 60 000 = $20 000. Положительный RI - подразделение заработало БОЛЬШЕ стоимости капитала на используемых ресурсах, значит добавляет стоимость. ROI здесь = 80 000 / 400 000 = 20%, выше стоимости капитала 15% - обе метрики дают одинаковый вывод. Преимущество RI проявляется при сравнении инвестиций: RI говорит «принимать все проекты с положительным RI» (согласуется с NPV), а ROI - «принимать только проекты, превышающие текущий ROI подразделения» (может отвергнуть хорошие).",
          explanation_uz:
            "RI = Foyda - (Kapital Narxi x Sarmoya) = 80 000 - (0,15 x 400 000) = 80 000 - 60 000 = 20 000 dollar. Musbat RI = bo'lim majbur qilingan resurslarda kapital narxidan KO'PROQ daromad olgan, demak qiymat qo'shmoqda. E'tibor bering, bu yerda ROI = 80 000 / 400 000 = 20%, 15% kapital narxidan oshadi - ikkala ko'rsatkichdan ham bir xil xulosa. RIning afzalligi sarmoyalarni solishtirishda namoyon bo'ladi: RI \"musbat RIga ega barcha loyihalarni qabul qiling\" deydi (NPV bilan izchil), ROI esa \"faqat joriy bo'lim ROIsidan oshuvchi loyihalarni qabul qiling\" deydi (bu yaxshilarini rad etishi mumkin).",
        },
        // -------- Q11 - medium MCQ on CSF vs KPI --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            'A retailer states that "rapid checkout speed" is critical to its competitive position. Average checkout time is then measured at 4.2 minutes against a target of 3 minutes. In this context, "rapid checkout speed" is the ___ and "average checkout time" is the ___ .',
          prompt_ru:
            "Розничный продавец заявляет, что «быстрое обслуживание на кассе» критично для его конкурентного положения. Среднее время на кассе измерено в 4,2 минуты при цели 3 минуты. В этом контексте «быстрое обслуживание» - это ___, а «среднее время на кассе» - ___ .",
          prompt_uz:
            'Chakana sotuvchi "tezkor kassa tezligi" uning raqobatdagi mavqei uchun muhim ekanini bildiradi. So\'ng o\'rtacha kassa vaqti 3 daqiqalik maqsadga nisbatan 4,2 daqiqa o\'lchanadi. Bu kontekstda "tezkor kassa tezligi" - bu ___ va "o\'rtacha kassa vaqti" - bu ___ .',
          options: [
            {
              key: "A",
              text_en: "KPI; CSF",
              text_ru: "KPI; CSF",
              text_uz: "KPI; CSF",
              why_wrong_en:
                "The labels are reversed: the strategic priority is the CSF, the measurement is the KPI, not the other way around.",
              why_wrong_ru:
                "Метки переставлены: стратегический приоритет - это CSF, а измерение - KPI, а не наоборот.",
              why_wrong_uz:
                "Yorliqlar teskari: strategik ustuvorlik - CSF, o'lchov - KPI, aksincha emas.",
            },
            {
              key: "B",
              text_en: "CSF; KPI",
              text_ru: "CSF; KPI",
              text_uz: "CSF; KPI",
            },
            {
              key: "C",
              text_en: "Both KPIs",
              text_ru: "Оба KPI",
              text_uz: "Ikkalasi KPI",
              why_wrong_en:
                'A KPI is a specific measure; "rapid checkout speed" is a strategic priority, not a measurable indicator with a number attached.',
              why_wrong_ru:
                "KPI - конкретный измеримый показатель; «быстрое обслуживание» - стратегический приоритет, без приложенной цифры.",
              why_wrong_uz:
                "KPI - muayyan o'lchov; \"tezkor kassa tezligi\" - strategik ustuvorlik, raqam biriktirilgan o'lchanadigan ko'rsatkich emas.",
            },
            {
              key: "D",
              text_en: "Both CSFs",
              text_ru: "Оба CSF",
              text_uz: "Ikkalasi CSF",
              why_wrong_en:
                "Average checkout time IS a measurement (in minutes), so it's a KPI, not a CSF.",
              why_wrong_ru:
                "Среднее время - это ИЗМЕРЕНИЕ (в минутах), следовательно KPI, а не CSF.",
              why_wrong_uz:
                "O'rtacha kassa vaqti - bu o'lchov (daqiqada), shuning uchun u KPI, CSF emas.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            'Critical Success Factor (CSF) = the few THINGS the organisation must get right to succeed competitively \u2014 broad strategic priorities. Key Performance Indicator (KPI) = the specific QUANTITATIVE measure used to track a CSF. The flow is: strategy \u2192 CSFs (what matters) \u2192 KPIs (how to measure what matters) \u2192 targets and actuals. A common mistake is to identify many KPIs without a clear CSF behind them \u2014 leading to "metric explosion" and conflicting incentives. The discipline is: identify CSFs first, then design no more than 2-3 KPIs per CSF.',
          explanation_ru:
            "Критический фактор успеха (CSF) - немногие ВЕЩИ, которые организация должна делать правильно для конкурентного успеха, - широкие стратегические приоритеты. Ключевой показатель эффективности (KPI) - конкретная КОЛИЧЕСТВЕННАЯ метрика для отслеживания CSF. Поток: стратегия → CSF (что важно) → KPI (как измерить важное) → цели и факт. Частая ошибка - определять много KPI без чётких CSF за ними; это приводит к «взрыву метрик» и противоречивым стимулам. Дисциплина: сначала определить CSF, затем спроектировать не более 2–3 KPI на CSF.",
          explanation_uz:
            "Muvaffaqiyatning Muhim Omili (CSF) = tashkilot raqobatda muvaffaqiyatga erishish uchun to'g'ri qilishi shart bo'lgan bir nechta NARSA - keng strategik ustuvorliklar. Asosiy Faoliyat Ko'rsatkichi (KPI) = CSFni kuzatish uchun ishlatiladigan muayyan MIQDORIY o'lchov. Oqim: strategiya -> CSFlar (nima muhim) -> KPIlar (muhim narsani qanday o'lchash) -> maqsadlar va haqiqiylar. Keng tarqalgan xato - ortida aniq CSFsiz ko'plab KPIlarni aniqlash - bu \"ko'rsatkichlar portlashi\" va qarama-qarshi rag'batlarga olib keladi. Intizom: avval CSFlarni aniqlang, so'ng har bir CSF uchun 2-3 tadan ortiq bo'lmagan KPI loyihalang.",
        },
        // -------- Q12 - medium short_answer on lagging vs leading --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            'Why are financial measures often described as "lagging" indicators, with implications for relying on them alone?',
          prompt_ru:
            "Почему финансовые показатели часто называют «запаздывающими» индикаторами, и каковы последствия опоры только на них?",
          prompt_uz:
            "Nega moliyaviy o'lchovlar ko'pincha \"kechikuvchi\" ko'rsatkichlar deb ta'riflanadi va ularga yolg'iz tayanishning oqibatlari qanday?",
          options: [
            {
              key: "A",
              text_en:
                "They report outcomes that have already crystallised, so problems show up only after the damage is done",
              text_ru:
                "Они отражают уже свершившиеся результаты, поэтому проблемы проявляются лишь после того, как ущерб нанесён",
              text_uz:
                "Ular allaqachon yuzaga kelgan natijalarni qayd etadi, shuning uchun muammolar zarar yetganidan keyingina ko'rinadi",
            },
            {
              key: "B",
              text_en:
                "They are calculated more slowly than other measures by the finance team",
              text_ru:
                "Их финансовая служба рассчитывает медленнее прочих показателей",
              text_uz:
                "Ular moliya jamoasi tomonidan boshqa o'lchovlarga qaraganda sekinroq hisoblanadi",
              why_wrong_en:
                '"Lagging" refers to measuring outcomes after the fact, not to the speed of calculation.',
              why_wrong_ru:
                "«Запаздывающий» относится к измерению результата постфактум, а не к скорости расчёта.",
              why_wrong_uz:
                "\"Kechikuvchi\" hisoblash tezligini emas, natijalarni voqea sodir bo'lgandan keyin o'lchashni anglatadi.",
            },
            {
              key: "C",
              text_en: "They always understate true performance",
              text_ru: "Они всегда занижают истинные результаты",
              text_uz: "Ular har doim haqiqiy faoliyatni kam ko'rsatadi",
              why_wrong_en:
                "Lagging means timing (they reflect past results), not a systematic bias up or down.",
              why_wrong_ru:
                "Запаздывание - это про сроки (отражают прошлые результаты), а не про систематическое смещение вверх или вниз.",
              why_wrong_uz:
                "Kechikish vaqtni (ular o'tmish natijalarini aks ettiradi) anglatadi, yuqoriga yoki pastga tizimli tarafkashlikni emas.",
            },
            {
              key: "D",
              text_en: "They cannot be audited",
              text_ru: "Их нельзя проверить аудитом",
              text_uz: "Ularni audit qilib bo'lmaydi",
              why_wrong_en:
                "Financial measures are precisely what auditors examine; the issue is that they are backward-looking, not unauditable.",
              why_wrong_ru:
                "Именно финансовые показатели проверяет аудит; проблема в том, что они обращены в прошлое, а не в их непроверяемости.",
              why_wrong_uz:
                "Moliyaviy o'lchovlar aynan auditorlar tekshiradigan narsadir; masala ularning audit qilinmasligi emas, orqaga qaragani'dadir.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Lagging indicators (revenue, margin, ROCE) record outcomes; by the time a poor financial result appears, the underlying driver (lost customers, falling quality) has already happened. Leading non-financial indicators (satisfaction, defect rates) signal problems earlier - which is why a balanced scorecard pairs both.",
          explanation_ru:
            "Запаздывающие индикаторы (выручка, маржа, ROCE) фиксируют результаты; к моменту появления плохого финансового итога первопричина (потеря клиентов, падение качества) уже произошла. Опережающие нефинансовые индикаторы (удовлетворённость, доля брака) сигналят раньше - поэтому сбалансированная система сочетает и те, и другие.",
          explanation_uz:
            "Kechikuvchi ko'rsatkichlar (daromad, marja, ROCE) natijalarni qayd etadi; yomon moliyaviy natija paydo bo'lganda, asosiy harakatlantiruvchi (yo'qotilgan mijozlar, pasayayotgan sifat) allaqachon sodir bo'lgan. Yetakchi nomoliyaviy ko'rsatkichlar (qoniqish, nuqson darajalari) muammolarni ertaroq signal qiladi - shuning uchun muvozanatli ko'rsatkichlar tizimi ikkalasini juftlashtiradi.",
        },
        // -------- Q13 - medium MCQ on inventory days --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A retailer reports an INVENTORY DAYS figure that has risen from 30 days last year to 55 days this year. The MOST LIKELY interpretation is:",
          prompt_ru:
            "У ретейлера показатель ОБОРАЧИВАЕМОСТИ ЗАПАСОВ В ДНЯХ вырос с 30 в прошлом году до 55 в текущем. НАИБОЛЕЕ ВЕРОЯТНАЯ интерпретация:",
          prompt_uz:
            "Chakana sotuvchi ZAXIRA KUNLARI ko'rsatkichi o'tgan yilgi 30 kundan shu yilgi 55 kunga oshganini xabar qiladi. ENG EHTIMOLLI talqin:",
          options: [
            {
              key: "A",
              text_en: "Improved efficiency \u2014 stock is moving faster",
              text_ru: "Улучшение эффективности - запасы оборачиваются быстрее",
              text_uz:
                "Yaxshilangan samaradorlik - zaxira tezroq harakatlanmoqda",
              why_wrong_en:
                "A RISING inventory-days figure means stock is moving SLOWER, not faster.",
              why_wrong_ru:
                "РАСТУЩИЙ показатель означает, что запасы оборачиваются МЕДЛЕННЕЕ, а не быстрее.",
              why_wrong_uz:
                "OSHAYOTGAN zaxira-kunlari ko'rsatkichi zaxira tezroq emas, SEKINROQ harakatlanayotganini bildiradi.",
            },
            {
              key: "B",
              text_en:
                "Slower stock turnover, possibly indicating obsolete inventory or weakening demand",
              text_ru:
                "Замедление оборачиваемости запасов, возможно, устаревший товар или ослабление спроса",
              text_uz:
                "Sekinroq zaxira aylanmasi, ehtimol eskirgan zaxira yoki susayayotgan talabni ko'rsatadi",
            },
            {
              key: "C",
              text_en: "Higher sales",
              text_ru: "Рост продаж",
              text_uz: "Yuqori sotuv",
              why_wrong_en:
                "If sales had risen faster than inventory, days would FALL; the days metric is inversely related to sales velocity.",
              why_wrong_ru:
                "Если бы продажи росли быстрее запасов, показатель в днях УМЕНЬШИЛСЯ бы; он обратно связан со скоростью продаж.",
              why_wrong_uz:
                "Agar sotuv zaxiradan tezroq oshgan bo'lsa, kunlar KAMAYARDI; kunlar ko'rsatkichi sotuv tezligiga teskari bog'liq.",
            },
            {
              key: "D",
              text_en: "Reduced cost of sales only",
              text_ru: "Снижение себестоимости продаж",
              text_uz: "Faqat kamaytirilgan sotuv tannarxi",
              why_wrong_en:
                "Lower cost of sales would also raise inventory days, but the question asks for the most likely BUSINESS interpretation, which is the operational story not the arithmetic one.",
              why_wrong_ru:
                "Снижение себестоимости тоже увеличило бы показатель, но вопрос про наиболее вероятную БИЗНЕС-интерпретацию - операционная история, а не арифметическая.",
              why_wrong_uz:
                "Pastroq sotuv tannarxi ham zaxira kunlarini oshirardi, ammo savol eng ehtimolli BIZNES talqinini so'raydi, bu esa arifmetik emas, operatsion holatdir.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Inventory days = (Inventory / Cost of Sales) \u00d7 365. Rising days means stock is taking longer to sell. Common business causes: obsolete or slow-moving stock building up, slowing demand, overbuying, or seasonal effects timed poorly. Knock-on consequences: cash tied up in stock not generating sales, higher holding costs, risk of write-downs to NRV (IAS 2 lower of cost and NRV rule). Compare against industry: a fashion retailer with 55 days is in trouble (fashion turns fast); a luxury watch retailer might routinely run higher.",
          explanation_ru:
            "Оборачиваемость запасов в днях = (Запасы / Себестоимость продаж) × 365. Рост показателя - запасы продаются дольше. Типичные причины: накопление устаревшего/медленно оборачиваемого товара, замедление спроса, избыточные закупки, неудачное сезонное распределение. Последствия: деньги «заморожены» в запасах, не приносящих продаж; выше затраты на хранение; риск списаний до NRV (правило МСФО (IAS) 2 - наименьшая из себестоимости и NRV). Сравнение с отраслью: фешн-ретейлер с 55 днями в беде (мода обновляется быстро); ретейлер люксовых часов может иметь и больше.",
          explanation_uz:
            "Zaxira kunlari = (Zaxira / Sotuv tannarxi) x 365. Kunlarning oshishi zaxira sotilishga ko'proq vaqt olayotganini bildiradi. Keng tarqalgan biznes sabablari: eskirgan yoki sekin harakatlanuvchi zaxiraning to'planishi, talab sekinlashishi, ortiqcha sotib olish yoki noto'g'ri vaqtlangan mavsumiy ta'sirlar. Ergashuvchi oqibatlar: sotuv hosil qilmaydigan zaxirada bog'langan naqd pul, yuqori saqlash xarajatlari, NRVga hisobdan chiqarish xavfi (IAS 2 xarajat va NRVning pastrog'i qoidasi). Soha bilan solishtiring: 55 kunli moda sotuvchisi qiyinchilikda (moda tez aylanadi); hashamatli soat sotuvchisi esa odatda yuqoriroq yuritishi mumkin.",
        },
        // -------- Q14 - hard NUMBER_ENTRY on multi-ratio --------
        {
          type: "number_entry",
          difficulty: "hard",
          prompt_en:
            "Revenue $2,000,000. Cost of sales $1,200,000. Operating expenses $400,000. Capital employed $1,600,000. Calculate the OPERATING MARGIN as a percentage (to 1 decimal place).",
          prompt_ru:
            "Выручка $2 000 000. Себестоимость продаж $1 200 000. Операционные расходы $400 000. Задействованный капитал $1 600 000. Рассчитайте ОПЕРАЦИОННУЮ МАРЖУ в процентах (с точностью до 1 знака).",
          prompt_uz:
            "Daromad 2 000 000 dollar. Sotuv tannarxi 1 200 000 dollar. Operatsion xarajatlar 400 000 dollar. Jalb qilingan kapital 1 600 000 dollar. OPERATSION MARJANI foiz sifatida hisoblang (1 kasr xonagacha).",
          correct_answer_en: "20",
          acceptable_tolerance: 0.1,
          explanation_en:
            'Operating profit = Revenue \u2212 Cost of Sales \u2212 Operating Expenses = 2,000,000 \u2212 1,200,000 \u2212 400,000 = $400,000. Operating margin = Operating profit / Revenue \u00d7 100 = 400,000 / 2,000,000 \u00d7 100 = 20.0%. Note that capital employed information is a distractor for THIS question \u2014 it would be needed for ROCE (which would be 400,000 / 1,600,000 = 25.0%), not for operating margin. Always check which ratio is asked. The "DuPont" decomposition is useful here: ROCE = Operating Margin \u00d7 Asset Turnover = 20.0% \u00d7 (2,000,000/1,600,000) = 20.0% \u00d7 1.25 = 25.0%.',
          explanation_ru:
            "Операционная прибыль = Выручка − Себестоимость продаж − Операционные расходы = 2 000 000 − 1 200 000 − 400 000 = $400 000. Операционная маржа = Операционная прибыль / Выручка × 100 = 400 000 / 2 000 000 × 100 = 20,0%. Внимание: задействованный капитал - отвлекающая информация ИМЕННО для этого вопроса, он нужен для ROCE (= 400 000 / 1 600 000 = 25,0%), но не для операционной маржи. Всегда проверяйте, какой коэффициент спрашивается. Полезное разложение Дюпона: ROCE = Операционная маржа × Оборачиваемость активов = 20,0% × (2 000 000/1 600 000) = 20,0% × 1,25 = 25,0%.",
          explanation_uz:
            "Operatsion foyda = Daromad - Sotuv Tannarxi - Operatsion Xarajatlar = 2 000 000 - 1 200 000 - 400 000 = 400 000 dollar. Operatsion marja = Operatsion foyda / Daromad x 100 = 400 000 / 2 000 000 x 100 = 20,0%. E'tibor bering, jalb qilingan kapital ma'lumoti BU savol uchun chalg'ituvchi - u ROCE uchun kerak bo'lardi (u 400 000 / 1 600 000 = 25,0% bo'lardi), operatsion marja uchun emas. Qaysi nisbat so'ralishini har doim tekshiring. \"DuPont\" ajratish bu yerda foydali: ROCE = Operatsion Marja x Aktivlar Aylanmasi = 20,0% x (2 000 000/1 600 000) = 20,0% x 1,25 = 25,0%.",
        },
        // -------- Q15 - hard MCQ on integrated scorecard scenario --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            "A division\u2019s manager is evaluated solely on quarterly ROCE and receives a bonus when it exceeds 18%. Current ROCE is 22%. The MOST LIKELY dysfunctional behaviour from this incentive structure is:",
          prompt_ru:
            "Руководитель подразделения оценивается исключительно по квартальному ROCE и получает бонус, когда он превышает 18%. Текущий ROCE - 22%. НАИБОЛЕЕ ВЕРОЯТНОЕ дисфункциональное поведение при такой системе стимулов:",
          prompt_uz:
            "Bo'lim menejeri faqat choraklik ROCE bo'yicha baholanadi va u 18% dan oshganda bonus oladi. Joriy ROCE 22%. Bu rag'bat tuzilmasidan kelib chiqadigan ENG EHTIMOLLI disfunksional xatti-harakat:",
          options: [
            {
              key: "A",
              text_en:
                "Defer or reject value-adding investments whose returns are below the current 22% but above the company\u2019s cost of capital, AND cut discretionary spend (training, R&D, maintenance) to keep ROCE high",
              text_ru:
                "Откладывать или отвергать добавляющие стоимость инвестиции с доходностью ниже 22%, но выше стоимости капитала, И сокращать дискреционные расходы (обучение, НИОКР, обслуживание), чтобы удержать ROCE на высоком уровне",
              text_uz:
                "Daromadi joriy 22% dan past, ammo kompaniyaning kapital narxidan yuqori bo'lgan qiymat qo'shuvchi sarmoyalarni kechiktirish yoki rad etish VA ROCEni yuqori saqlash uchun ixtiyoriy sarflashni (o'qitish, R&D, ta'mirlash) qisqartirish",
            },
            {
              key: "B",
              text_en: "Take long-term investments aggressively",
              text_ru: "Активно делать долгосрочные инвестиции",
              text_uz: "Uzoq muddatli sarmoyalarni jadal olish",
              why_wrong_en:
                "Long-term investments reduce short-term ROCE (capital base rises before profit catches up), so ROCE-driven managers REDUCE long-term investment, not increase it.",
              why_wrong_ru:
                "Долгосрочные инвестиции снижают краткосрочный ROCE (база капитала растёт до того, как прибыль за ней подтянется), поэтому ROCE-ориентированные менеджеры СНИЖАЮТ долгосрочные инвестиции, а не наращивают.",
              why_wrong_uz:
                "Uzoq muddatli sarmoyalar qisqa muddatli ROCEni kamaytiradi (foyda yetib olishidan oldin kapital bazasi oshadi), shuning uchun ROCEga asoslangan menejerlar uzoq muddatli sarmoyani oshirmaydi, KAMAYTIRADI.",
            },
            {
              key: "C",
              text_en:
                "Be indifferent to performance because the threshold is well below current ROCE",
              text_ru:
                "Быть безразличным к эффективности, так как порог сильно ниже текущего ROCE",
              text_uz:
                "Chegara joriy ROCEdan ancha past bo'lgani uchun faoliyatga befarq bo'lish",
              why_wrong_en:
                "Indifference would only occur if the bonus was very small or threshold was certainly safe; in practice the gap creates room for ROCE management behaviours.",
              why_wrong_ru:
                "Безразличие возможно лишь при очень малом бонусе или гарантированно безопасном пороге; на практике разрыв создаёт простор для манипуляции ROCE.",
              why_wrong_uz:
                "Befarqlik faqat bonus juda kichik yoki chegara aniq xavfsiz bo'lganda yuzaga kelardi; amalda farq ROCEni boshqarish xatti-harakatlariga joy yaratadi.",
            },
            {
              key: "D",
              text_en: "Hire more staff and acquire new equipment",
              text_ru: "Нанимать персонал и приобретать новое оборудование",
              text_uz: "Ko'proq xodim yollash va yangi uskuna sotib olish",
              why_wrong_en:
                "Both raise the cost and capital base, lowering ROCE \u2014 ROCE-driven managers avoid these expansions even when they make business sense.",
              why_wrong_ru:
                "Оба увеличивают расходы и капитальную базу, снижая ROCE - ROCE-ориентированные менеджеры избегают таких расширений даже когда они экономически оправданы.",
              why_wrong_uz:
                "Ikkalasi ham xarajat va kapital bazasini oshiradi, ROCEni pasaytiradi - ROCEga asoslangan menejerlar biznes ma'noga ega bo'lsa ham bu kengayishlardan qochadi.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Single-metric incentives systematically distort behaviour. ROCE as the sole metric drives two predictable responses: (1) UNDER-INVESTMENT \u2014 reject projects yielding less than current divisional ROCE, even when they exceed cost of capital and add NPV; this is the same ROI dysfunction at division level. (2) DISCRETIONARY SPENDING CUTS \u2014 slash R&D, training, maintenance, marketing, because these reduce current-period profit (and thus ROCE) while their benefits accrue later. The compounding cost is delayed: the division's ROCE looks good in the short term but its competitive position erodes. Balanced scorecard exists precisely to prevent this: combining financial metrics (lagging) with customer, process, and learning measures (leading) makes the long-term cost of these cuts visible.",
          explanation_ru:
            "Стимулы по одной метрике систематически искажают поведение. ROCE как единственная метрика приводит к двум предсказуемым реакциям: (1) НЕДОИНВЕСТИРОВАНИЕ - отказ от проектов с доходностью ниже текущего дивизионного ROCE, даже если они превышают стоимость капитала и добавляют NPV; та же дисфункция ROI, но на уровне подразделения. (2) СОКРАЩЕНИЕ ДИСКРЕЦИОННЫХ РАСХОДОВ - урезание НИОКР, обучения, обслуживания, маркетинга, поскольку они снижают текущую прибыль (и ROCE), а отдача приходит позже. Накопительная цена отложена: ROCE подразделения выглядит хорошо краткосрочно, но конкурентное положение размывается. Сбалансированная карта показателей создана именно для предотвращения этого: сочетая финансовые (запаздывающие) с клиентскими, процессными и метриками обучения (опережающими), долгосрочная цена сокращений становится видна.",
          explanation_uz:
            "Yagona ko'rsatkichli rag'batlar xatti-harakatni tizimli ravishda buzadi. ROCE yagona ko'rsatkich sifatida ikkita oldindan aytsa bo'ladigan javobni keltirib chiqaradi: (1) KAM-SARMOYA - joriy bo'lim ROCEsidan past daromad beruvchi loyihalarni rad etish, ular kapital narxidan oshib NPV qo'shsa ham; bu bo'lim darajasidagi xuddi shu ROI disfunksiyasidir. (2) IXTIYORIY SARFLASHNI QISQARTIRISH - R&D, o'qitish, ta'mirlash, marketingni qisqartirish, chunki bular joriy davr foydasini (demak ROCEni) kamaytiradi, ularning nafi esa keyin keladi. To'planuvchi xarajat kechikadi: bo'limning ROCEsi qisqa muddatda yaxshi ko'rinadi, ammo uning raqobatdagi mavqei yemiriladi. Muvozanatli ko'rsatkichlar tizimi aynan buni oldini olish uchun mavjud: moliyaviy ko'rsatkichlarni (kechikuvchi) mijoz, jarayon va o'rganish o'lchovlari (yetakchi) bilan birlashtirish bu qisqartirishlarning uzoq muddatli xarajatini ko'rinarli qiladi.",
        },
      ],
    },
  ],
};
