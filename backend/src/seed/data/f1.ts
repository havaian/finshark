// Seed content for the F1 (Business and Technology) paper.
// Structure mirrors the official ACCA 2025-26 syllabus sections A-F.
// Question content is original, written to mimic the style of ACCA past papers
// without reproducing any copyrighted material verbatim.
//
// -------------------------------------------------------------------------
// UZBEK (_uz) TRANSLATION - FOR NATIVE ACCA-TUTOR REVIEW BEFORE GO-LIVE
// Modern Latin script; ASCII apostrophe (') used for o'/g' okina throughout.
// Terms a native Uzbek ACCA tutor should confirm (no single settled Uzbek
// term exists; widely-understood EN/RU-derived forms were preferred over
// coining new ones):
//   - "manfaatdor tomonlar" for stakeholders (vs. calque); "bog'liq" for
//     "connected stakeholders" is a literal rendering - confirm house term.
//   - "mas'uliyati cheklangan jamiyat (MChJ)" for limited company;
//     "ochiq aksiyadorlik jamiyati (OAJ)" implied for PLC - kept "PLC" in text.
//   - "shirkat" for partnership; "yakka tartibdagi tadbirkor" for sole trader.
//   - PESTEL/Porter terms (e.g. "differensiatsiya", "o'rinbosarlar tahdidi",
//     "fokuslanish") - transliterations; confirm preferred academic forms.
//   - "uzum tokchasi" is a literal calque of "grapevine"; a gloss or the RU
//     loan may read more naturally - tutor to decide.
//   - "o'simlik" (Belbin "plant"), "yakunlovchi" (completer-finisher),
//     "shakllantiruvchi" (shaper) - Belbin role names are not standardised
//     in Uzbek; verify against any existing course glossary.
//   - "jarayonni yengillashtirish to'lovi" for facilitation payment;
//     "ma'lumotni oshkor qilish" for whistleblowing - confirm terminology.
//   - "halollik/xolislik" pairing for integrity/objectivity - both are close
//     in Uzbek; ensure the distinction stays clear in context.
// correct_answer_* fields are intentionally NOT translated (language-neutral
// option keys / numeric values).
// -------------------------------------------------------------------------

import type { SeedPaper } from "./types";

export const F1_PAPER: SeedPaper = {
  code: "F1",
  name_en: "Business and Technology",
  name_ru: "Бизнес и технологии",
  name_uz: "Biznes va texnologiyalar",
  learning_objectives: [
    // ---------- A ----------
    {
      code: "A",
      title_en: "The business organisation and its external environment",
      title_ru: "Организация и её внешняя среда",
      title_uz: "Tashkilot va uning tashqi muhiti",
      description_en: "Types of business, stakeholders, and PESTEL influences.",
      description_ru:
        "Типы организаций, заинтересованные стороны и факторы PESTEL.",
      description_uz:
        "Tashkilot turlari, manfaatdor tomonlar va PESTEL omillari.",
      sort_order: 10,
      theory_en:
        'An organisation is a social arrangement that pursues collective goals through controlled performance - meaning it has objectives, people working together, and systems to keep effort aligned. F1 classifies organisations along two axes. First, by purpose: commercial (profit-seeking), not-for-profit (mission-driven, e.g. charities), and public sector (state-controlled, funded by tax). Second, by legal form: sole trader (one owner, unlimited liability), partnership (shared ownership, traditionally unlimited liability), limited company (separate legal personality, liability capped at share value - split into private "Ltd" and public "PLC"), and cooperative (member-owned, one-member-one-vote regardless of capital).\n\n' +
        'Every organisation operates inside a network of stakeholders - parties with an interest in what it does. Internal stakeholders are employees and managers; connected stakeholders are shareholders, customers, suppliers, lenders; external stakeholders are government, regulators, communities, pressure groups. Mendelow\'s matrix maps each stakeholder by power (ability to affect the organisation) and interest (degree to which they care): high-power-high-interest = "Key Players" (manage closely), high-power-low-interest = "Keep Satisfied", low-power-high-interest = "Keep Informed", low-power-low-interest = "Minimal Effort".\n\n' +
        "The external environment is analysed using PESTEL (Political, Economic, Social, Technological, Environmental, Legal) for macro factors, and Porter's Five Forces (rivalry, new entrants, substitutes, supplier power, buyer power) for industry competitive intensity. Porter's generic strategies - cost leadership, differentiation, focus - describe how a firm chooses to compete within that landscape.\n\n" +
        "Underlying all of this is the wider economy. Macroeconomic context matters: types of unemployment (frictional - between jobs; structural - skills mismatch; cyclical - driven by downturn) shape labour markets, while price elasticity of demand determines how sensitive revenue is to price changes. Inflation, interest rates, and exchange rates feed through to cost and demand directly.",
      theory_ru:
        'Организация - это социальное образование, преследующее коллективные цели через управляемую деятельность: то есть имеющее цели, людей, работающих вместе, и системы, удерживающие усилия в общем русле. В F1 организации классифицируются по двум осям. Во-первых, по цели: коммерческие (ориентированные на прибыль), некоммерческие (миссионные, например благотворительные), и государственный сектор (под контролем государства, финансируемый из налогов). Во-вторых, по организационно-правовой форме: индивидуальный предприниматель (один владелец, неограниченная ответственность), товарищество (совместное владение, традиционно с неограниченной ответственностью), компания с ограниченной ответственностью (отдельное юридическое лицо, ответственность ограничена стоимостью акций - делится на частную "Ltd" и публичную "PLC"), и кооператив (принадлежит участникам по принципу «один член - один голос» независимо от вклада).\n\n' +
        "Любая организация действует в сети заинтересованных сторон - лиц, имеющих интерес к её деятельности. Внутренние стороны - сотрудники и менеджеры; связанные - акционеры, клиенты, поставщики, кредиторы; внешние - государство, регуляторы, местные сообщества, группы давления. Матрица Мендлоу располагает каждую сторону по власти (способности влиять на организацию) и интересу (степени заинтересованности): высокая власть и высокий интерес - «ключевые игроки» (управлять плотно); высокая власть, низкий интерес - «удовлетворять»; низкая власть, высокий интерес - «информировать»; низкая власть, низкий интерес - «минимум усилий».\n\n" +
        "Внешняя среда анализируется через PESTEL (политические, экономические, социальные, технологические, экологические, правовые факторы) на макроуровне и через пять сил Портера (соперничество, новые игроки, заменители, сила поставщиков, сила покупателей) - для оценки конкурентной интенсивности отрасли. Базовые стратегии Портера - лидерство по издержкам, дифференциация, фокусирование - описывают, как компания выбирает способ конкурировать внутри этой среды.\n\n" +
        "В основе всего этого лежит общая экономика. Макроэкономический контекст важен: виды безработицы (фрикционная - между работами; структурная - несоответствие квалификации; циклическая - вызванная спадом) формируют рынок труда, а ценовая эластичность спроса определяет, насколько выручка чувствительна к изменению цены. Инфляция, процентные ставки и валютные курсы напрямую влияют на издержки и спрос.",
      theory_uz:
        "Tashkilot - bu boshqariladigan faoliyat orqali jamoaviy maqsadlarga intiluvchi ijtimoiy tuzilma, ya'ni uning maqsadlari, birgalikda ishlaydigan odamlari va sa'y-harakatlarni umumiy yo'nalishda ushlab turuvchi tizimlari bor. F1 tashkilotlarni ikki o'q bo'yicha tasniflaydi. Birinchidan, maqsadi bo'yicha: tijorat (foyda olishga yo'naltirilgan), notijorat (missiyaga asoslangan, masalan, xayriya tashkilotlari) va davlat sektori (davlat tomonidan nazorat qilinadigan, soliqlar hisobidan moliyalashtiriladigan). Ikkinchidan, tashkiliy-huquqiy shakli bo'yicha: yakka tartibdagi tadbirkor (bir egasi, cheklanmagan javobgarlik), shirkat (umumiy egalik, an'anaviy ravishda cheklanmagan javobgarlik), mas'uliyati cheklangan jamiyat (alohida yuridik shaxs, javobgarlik aksiyalar qiymati bilan cheklangan - xususiy \"Ltd\" va ochiq \"PLC\" turlariga bo'linadi) va kooperativ (a'zolarga tegishli, kapitaldan qat'i nazar har bir a'zoga bir ovoz).\n\nHar bir tashkilot manfaatdor tomonlar tarmog'i ichida faoliyat yuritadi - bular tashkilot faoliyatidan manfaatdor bo'lgan tomonlardir. Ichki manfaatdor tomonlar - xodimlar va menejerlar; bog'liq manfaatdor tomonlar - aksiyadorlar, mijozlar, ta'minotchilar, kreditorlar; tashqi manfaatdor tomonlar - hukumat, tartibga soluvchilar, mahalliy jamoalar, bosim guruhlari. Mendelou matritsasi har bir tomonni hokimiyat (tashkilotga ta'sir o'tkazish qobiliyati) va qiziqish (qanchalik ahamiyat berishi) bo'yicha joylashtiradi: yuqori hokimiyat va yuqori qiziqish = \"Asosiy ishtirokchilar\" (yaqindan boshqarish), yuqori hokimiyat va past qiziqish = \"Qoniqtirib turish\", past hokimiyat va yuqori qiziqish = \"Xabardor qilib turish\", past hokimiyat va past qiziqish = \"Minimal sa'y-harakat\".\n\nTashqi muhit makro omillar uchun PESTEL (siyosiy, iqtisodiy, ijtimoiy, texnologik, ekologik, huquqiy) va sohaning raqobat keskinligi uchun Porterning besh kuchi (raqobat, yangi kirib keluvchilar, o'rinbosarlar, ta'minotchilar kuchi, xaridorlar kuchi) yordamida tahlil qilinadi. Porterning umumiy strategiyalari - xarajatlar bo'yicha yetakchilik, differensiatsiya, fokuslanish - firma ushbu muhitda qanday raqobatlashishni tanlashini ta'riflaydi.\n\nBularning barchasi asosida kengroq iqtisodiyot yotadi. Makroiqtisodiy kontekst muhim: ishsizlik turlari (friksion - ishlar orasida; strukturaviy - malaka nomuvofiqligi; tsiklik - tanazzul bilan bog'liq) mehnat bozorini shakllantiradi, talabning narx bo'yicha elastikligi esa daromad narx o'zgarishiga qanchalik sezgir ekanini belgilaydi. Inflatsiya, foiz stavkalari va valyuta kurslari xarajatlar va talabga bevosita ta'sir qiladi.",
      questions: [
        // -------- existing Q1 (augmented with why_wrong) --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "Which type of organisation is primarily owned by its members rather than external shareholders?",
          prompt_ru:
            "Какой тип организации в первую очередь принадлежит своим членам, а не внешним акционерам?",
          prompt_uz:
            "Qaysi turdagi tashkilot tashqi aksiyadorlarga emas, balki asosan o'z a'zolariga tegishli?",
          options: [
            {
              key: "A",
              text_en: "Public limited company",
              text_ru: "Публичная компания с ограниченной ответственностью",
              text_uz: "Ochiq aksiyadorlik jamiyati (PLC)",
              why_wrong_en:
                "A PLC is owned by external shareholders who buy shares on a public market, not by members serving in operational roles.",
              why_wrong_ru:
                "PLC принадлежит внешним акционерам, покупающим акции на публичном рынке, а не членам, участвующим в её деятельности.",
              why_wrong_uz:
                "PLC ochiq bozorda aksiyalar sotib oladigan tashqi aksiyadorlarga tegishli bo'lib, operatsion rollarda ishlovchi a'zolarga emas.",
            },
            {
              key: "B",
              text_en: "Cooperative",
              text_ru: "Кооператив",
              text_uz: "Kooperativ",
            },
            {
              key: "C",
              text_en: "Sole trader",
              text_ru: "Индивидуальный предприниматель",
              text_uz: "Yakka tartibdagi tadbirkor",
              why_wrong_en:
                "A sole trader is owned by one individual, not by a group of members.",
              why_wrong_ru:
                "Индивидуальный предприниматель - это один владелец, а не группа членов.",
              why_wrong_uz:
                "Yakka tartibdagi tadbirkor bir shaxsga tegishli, a'zolar guruhiga emas.",
            },
            {
              key: "D",
              text_en: "Government department",
              text_ru: "Государственное ведомство",
              text_uz: "Davlat idorasi",
              why_wrong_en:
                "A government department is part of the public sector and is controlled by the state, not by its members.",
              why_wrong_ru:
                "Государственное ведомство относится к государственному сектору и контролируется государством, а не своими членами.",
              why_wrong_uz:
                "Davlat idorasi davlat sektoriga kiradi va o'z a'zolari emas, balki davlat tomonidan nazorat qilinadi.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "A cooperative is owned and democratically controlled by its members, who are typically the customers, employees or producers it serves.",
          explanation_ru:
            "Кооператив принадлежит и демократически управляется своими членами - обычно клиентами, работниками или производителями, которых он обслуживает.",
          explanation_uz:
            "Kooperativ o'z a'zolariga tegishli bo'lib, ular tomonidan demokratik tarzda boshqariladi; a'zolar odatda u xizmat ko'rsatadigan mijozlar, xodimlar yoki ishlab chiqaruvchilardir.",
          concept_bite_en:
            "Stakeholder vs shareholder ownership models differ in who controls the entity and who benefits from its surplus.",
          concept_bite_ru:
            "Модели владения «заинтересованные стороны» и «акционеры» отличаются тем, кто контролирует организацию и кто получает прибыль.",
          concept_bite_uz:
            "Manfaatdor tomonlar va aksiyadorlar egaligi modellari tashkilotni kim nazorat qilishi va uning foydasidan kim manfaat ko'rishi bilan farqlanadi.",
        },
        // -------- existing Q2 (augmented with why_wrong) --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "In Mendelow\u2019s matrix, a stakeholder with HIGH interest but LOW power should be:",
          prompt_ru:
            "В матрице Мендлоу заинтересованная сторона с ВЫСОКИМ интересом, но НИЗКОЙ властью должна:",
          prompt_uz:
            "Mendelou matritsasida YUQORI qiziqishga, lekin PAST hokimiyatga ega manfaatdor tomon qanday yondashuvni talab qiladi:",
          options: [
            {
              key: "A",
              text_en: "Managed closely as a key player",
              text_ru: "Управляться как ключевая фигура",
              text_uz: "Asosiy ishtirokchi sifatida yaqindan boshqarish",
              why_wrong_en:
                '"Key players" are HIGH-power-HIGH-interest stakeholders, not low-power ones.',
              why_wrong_ru:
                "«Ключевые игроки» - это стороны с ВЫСОКОЙ властью и ВЫСОКИМ интересом, а не с низкой властью.",
              why_wrong_uz:
                '"Asosiy ishtirokchilar" - bu YUQORI hokimiyat va YUQORI qiziqishga ega tomonlar, past hokimiyatga ega tomonlar emas.',
            },
            {
              key: "B",
              text_en: "Kept informed",
              text_ru: "Информироваться",
              text_uz: "Xabardor qilib turish",
            },
            {
              key: "C",
              text_en: "Kept satisfied",
              text_ru: "Удовлетворяться",
              text_uz: "Qoniqtirib turish",
              why_wrong_en:
                '"Keep satisfied" applies to HIGH-power-LOW-interest stakeholders - the power dimensions are reversed here.',
              why_wrong_ru:
                "«Удовлетворять» применяется к сторонам с ВЫСОКОЙ властью и НИЗКИМ интересом - измерения власти здесь перепутаны.",
              why_wrong_uz:
                "\"Qoniqtirib turish\" YUQORI hokimiyat va PAST qiziqishga ega tomonlarga nisbatan qo'llaniladi - bu yerda hokimiyat o'lchamlari teskari.",
            },
            {
              key: "D",
              text_en: "Monitored with minimal effort",
              text_ru: "Отслеживаться с минимальными усилиями",
              text_uz: "Minimal sa'y-harakat bilan kuzatib borish",
              why_wrong_en:
                '"Minimal effort" is for LOW-power-LOW-interest stakeholders; this stakeholder has HIGH interest.',
              why_wrong_ru:
                "«Минимум усилий» - для сторон с НИЗКОЙ властью и НИЗКИМ интересом; у данной стороны интерес ВЫСОКИЙ.",
              why_wrong_uz:
                '"Minimal sa\'y-harakat" PAST hokimiyat va PAST qiziqishga ega tomonlar uchun; bu tomonning qiziqishi esa YUQORI.',
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            'High interest, low power stakeholders are "Keep Informed" - they care about decisions but cannot directly affect them, so communication is the right response.',
          explanation_ru:
            "Стороны с высоким интересом и низкой властью попадают в категорию «Информировать»: им важны решения, но они не могут на них прямо повлиять, поэтому правильная реакция - коммуникация.",
          explanation_uz:
            "Yuqori qiziqishga, past hokimiyatga ega tomonlar \"Xabardor qilib turish\" toifasiga kiradi - ular qarorlardan manfaatdor, ammo ularga bevosita ta'sir qila olmaydi, shuning uchun to'g'ri yondashuv - axborot berish.",
        },
        // -------- existing Q3 (unchanged - short_answer) --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            'In the PESTEL framework for analysing the external environment, what does the letter "P" stand for?',
          prompt_ru:
            'Что обозначает буква "P" в модели PESTEL для анализа внешней среды?',
          prompt_uz:
            'Tashqi muhitni tahlil qilish uchun PESTEL doirasida "P" harfi nimani anglatadi?',
          options: [
            {
              key: "A",
              text_en: "Political",
              text_ru: "Политические",
              text_uz: "Siyosiy",
            },
            {
              key: "B",
              text_en: "Physical",
              text_ru: "Физические",
              text_uz: "Jismoniy",
              why_wrong_en:
                'PESTEL has no "Physical" factor; the closest environmental dimension is the "E" for Environmental, not Physical.',
              why_wrong_ru:
                "В PESTEL нет фактора «физические»; ближайшее измерение - «E» (экологические), а не физические.",
              why_wrong_uz:
                'PESTELda "Jismoniy" omil yo\'q; eng yaqin omil - "Jismoniy" emas, balki Ekologik (Environmental) uchun "E".',
            },
            {
              key: "C",
              text_en: "Personal",
              text_ru: "Личные",
              text_uz: "Shaxsiy",
              why_wrong_en:
                "PESTEL analyses macro-environmental forces, not personal or individual factors.",
              why_wrong_ru:
                "PESTEL анализирует макросреду, а не личные или индивидуальные факторы.",
              why_wrong_uz:
                "PESTEL makro muhit kuchlarini tahlil qiladi, shaxsiy yoki individual omillarni emas.",
            },
            {
              key: "D",
              text_en: "Productivity",
              text_ru: "Производительность",
              text_uz: "Mahsuldorlik",
              why_wrong_en:
                "Productivity is an internal operational measure, not one of the six external PESTEL factors.",
              why_wrong_ru:
                "Производительность - внутренний операционный показатель, а не один из шести внешних факторов PESTEL.",
              why_wrong_uz:
                "Mahsuldorlik - ichki operatsion ko'rsatkich, oltita tashqi PESTEL omilidan biri emas.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            'PESTEL stands for Political, Economic, Social, Technological, Environmental and Legal factors of the external environment. The "P" is Political - government policy, political stability, tax and trade regulation.',
          explanation_ru:
            "PESTEL расшифровывается как политические, экономические, социальные, технологические, экологические и правовые факторы внешней среды. «P» - это политические: государственная политика, политическая стабильность, налоговое и торговое регулирование.",
          explanation_uz:
            'PESTEL tashqi muhitning siyosiy, iqtisodiy, ijtimoiy, texnologik, ekologik va huquqiy omillarini anglatadi. "P" - bu Siyosiy (Political): hukumat siyosati, siyosiy barqarorlik, soliq va savdo tartibga solinishi.',
        },
        // -------- existing Q4 (augmented with why_wrong) --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "Porter\u2019s Five Forces model is most useful for analysing:",
          prompt_ru: "Модель пяти сил Портера наиболее полезна для анализа:",
          prompt_uz:
            "Porterning besh kuchi modeli quyidagilardan qaysi birini tahlil qilishda eng foydali:",
          options: [
            {
              key: "A",
              text_en: "Internal staff motivation",
              text_ru: "Внутренней мотивации сотрудников",
              text_uz: "Ichki xodimlarni rag'batlantirish",
              why_wrong_en:
                "Staff motivation is an internal HR concern; Porter's Five Forces is an external industry-analysis tool.",
              why_wrong_ru:
                "Мотивация персонала - внутренний вопрос HR; пять сил Портера - внешний инструмент анализа отрасли.",
              why_wrong_uz:
                "Xodimlarni rag'batlantirish - ichki kadrlar masalasi; Porterning besh kuchi esa tashqi soha tahlili vositasidir.",
            },
            {
              key: "B",
              text_en: "Industry competitive intensity and profitability",
              text_ru: "Конкурентной интенсивности и прибыльности отрасли",
              text_uz: "Sohadagi raqobat keskinligi va foydaliligi",
            },
            {
              key: "C",
              text_en: "Personal communication styles",
              text_ru: "Стилей личной коммуникации",
              text_uz: "Shaxsiy muloqot uslublari",
              why_wrong_en:
                "Communication styles are a behavioural topic, unrelated to industry-level competitive analysis.",
              why_wrong_ru:
                "Стили коммуникации относятся к поведенческой тематике и не связаны с анализом отрасли.",
              why_wrong_uz:
                "Muloqot uslublari - xulq-atvorga oid mavzu bo'lib, soha darajasidagi raqobat tahliliga aloqasi yo'q.",
            },
            {
              key: "D",
              text_en: "Accounting policy choices",
              text_ru: "Выбора учётной политики",
              text_uz: "Buxgalteriya siyosati tanlovlari",
              why_wrong_en:
                "Accounting policies are governed by financial reporting standards, not by Porter's industry framework.",
              why_wrong_ru:
                "Учётная политика регулируется стандартами финансовой отчётности, а не отраслевой моделью Портера.",
              why_wrong_uz:
                "Buxgalteriya siyosati moliyaviy hisobot standartlari bilan tartibga solinadi, Porterning soha doirasi bilan emas.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Porter\u2019s Five Forces - supplier power, buyer power, threat of new entrants, threat of substitutes, and competitive rivalry - assess how attractive (profitable) an industry is.",
          explanation_ru:
            "Пять сил Портера (сила поставщиков, покупателей, угроза новых игроков, угроза заменителей и конкурентное соперничество) оценивают привлекательность (прибыльность) отрасли.",
          explanation_uz:
            "Porterning besh kuchi - ta'minotchilar kuchi, xaridorlar kuchi, yangi kirib keluvchilar tahdidi, o'rinbosarlar tahdidi va raqobat keskinligi - sohaning qanchalik jozibador (foydali) ekanini baholaydi.",
        },
        // -------- existing Q5 (augmented with why_wrong) --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            "A government raises corporation tax. In which PESTEL category is this change BEST classified?",
          prompt_ru:
            "Государство повышает налог на прибыль организаций. К какой категории PESTEL ЛУЧШЕ всего отнести это изменение?",
          prompt_uz:
            "Hukumat korporatsiya solig'ini oshiradi. Bu o'zgarish PESTELning qaysi toifasiga ENG TO'G'RI tasniflanadi?",
          options: [
            {
              key: "A",
              text_en: "Political only",
              text_ru: "Только политические",
              text_uz: "Faqat Siyosiy",
              why_wrong_en:
                "A tax change is also enshrined in legislation, so it has a Legal dimension as well as Political.",
              why_wrong_ru:
                "Налоговое изменение также закрепляется в законодательстве, поэтому имеет правовой аспект, а не только политический.",
              why_wrong_uz:
                "Soliq o'zgarishi qonunchilikda ham mustahkamlanadi, shuning uchun u Siyosiy bilan birga Huquqiy jihatga ham ega.",
            },
            {
              key: "B",
              text_en: "Economic only",
              text_ru: "Только экономические",
              text_uz: "Faqat Iqtisodiy",
              why_wrong_en:
                "While the change affects the economy, in PESTEL classification the policy origin (Political) and legislative form (Legal) take precedence.",
              why_wrong_ru:
                "Хотя изменение влияет на экономику, в классификации PESTEL преобладают политическое происхождение и правовая форма.",
              why_wrong_uz:
                "O'zgarish iqtisodiyotga ta'sir qilsa-da, PESTEL tasnifida siyosatning kelib chiqishi (Siyosiy) va qonuniy shakli (Huquqiy) ustunlik qiladi.",
            },
            {
              key: "C",
              text_en: "Political and Legal",
              text_ru: "Политические и правовые",
              text_uz: "Siyosiy va Huquqiy",
            },
            {
              key: "D",
              text_en: "Social and Economic",
              text_ru: "Социальные и экономические",
              text_uz: "Ijtimoiy va Iqtisodiy",
              why_wrong_en:
                "A corporation tax change is not socially defined - it is a government policy decision enacted into law.",
              why_wrong_ru:
                "Налоговое изменение не имеет социальной природы - это решение правительства, закреплённое в законе.",
              why_wrong_uz:
                "Korporatsiya solig'ining o'zgarishi ijtimoiy jihatdan belgilanmaydi - bu qonun bilan o'rnatilgan hukumat siyosati qaroridir.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "A corporation tax change is enacted in law (Legal) and reflects a government policy decision (Political). The PESTEL categories overlap, and tax changes typically span both.",
          explanation_ru:
            "Изменение налога на прибыль закрепляется законом (правовой аспект) и отражает решение правительства (политический аспект). Категории PESTEL пересекаются, и налоговые изменения обычно затрагивают обе.",
          explanation_uz:
            "Korporatsiya solig'ining o'zgarishi qonun bilan o'rnatiladi (Huquqiy) va hukumatning siyosiy qarorini aks ettiradi (Siyosiy). PESTEL toifalari bir-biriga kirib boradi va soliq o'zgarishlari odatda ikkalasini ham qamrab oladi.",
        },
        // -------- NEW Q6 - easy MCQ on legal form --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "A key advantage of a limited company over a sole trader is:",
          prompt_ru:
            "Ключевое преимущество компании с ограниченной ответственностью по сравнению с ИП:",
          prompt_uz:
            "Mas'uliyati cheklangan jamiyatning yakka tartibdagi tadbirkorga nisbatan asosiy afzalligi:",
          options: [
            {
              key: "A",
              text_en: "Simpler administration and lower set-up cost",
              text_ru:
                "Более простое администрирование и меньшая стоимость создания",
              text_uz: "Soddaroq boshqaruv va kamroq tashkil etish xarajati",
              why_wrong_en:
                "A limited company has MORE administrative obligations - incorporation, annual filings, statutory accounts.",
              why_wrong_ru:
                "У компании БОЛЬШЕ административных обязанностей - регистрация, годовая отчётность, обязательные финансовые отчёты.",
              why_wrong_uz:
                "Mas'uliyati cheklangan jamiyatda KO'PROQ ma'muriy majburiyatlar bor - ro'yxatdan o'tkazish, yillik hisobotlar, qonuniy moliyaviy hisobotlar.",
            },
            {
              key: "B",
              text_en: "Limited liability for the owners",
              text_ru: "Ограниченная ответственность владельцев",
              text_uz: "Egalari uchun cheklangan javobgarlik",
            },
            {
              key: "C",
              text_en: "Profits are tax-free",
              text_ru: "Прибыль не облагается налогом",
              text_uz: "Foyda soliqdan ozod",
              why_wrong_en:
                "Company profits are subject to corporation tax - limited liability does not affect tax status.",
              why_wrong_ru:
                "Прибыль компании облагается налогом на прибыль; ограниченная ответственность не влияет на налоговый статус.",
              why_wrong_uz:
                "Kompaniya foydasi korporatsiya solig'iga tortiladi - cheklangan javobgarlik soliq holatiga ta'sir qilmaydi.",
            },
            {
              key: "D",
              text_en: "The company cannot sue or be sued",
              text_ru:
                "Компания не может подавать в суд или быть привлечённой к суду",
              text_uz:
                "Kompaniya da'vo qila olmaydi yoki unga da'vo qilib bo'lmaydi",
              why_wrong_en:
                "The opposite is true - a company has separate legal personality and CAN sue and be sued in its own name.",
              why_wrong_ru:
                "Верно обратное - компания имеет отдельную правосубъектность и МОЖЕТ участвовать в судебных процессах от своего имени.",
              why_wrong_uz:
                "Aksincha - kompaniya alohida yuridik shaxs maqomiga ega va o'z nomidan da'vo qila oladi hamda unga da'vo qilish mumkin.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Shareholder liability is capped at the unpaid value of their shares; personal assets are protected if the company fails. This is the defining benefit of incorporation.",
          explanation_ru:
            "Ответственность акционеров ограничена неоплаченной стоимостью их акций; личное имущество защищено в случае банкротства компании. Это главное преимущество регистрации компании.",
          explanation_uz:
            "Aksiyadorlarning javobgarligi ularning aksiyalarining to'lanmagan qiymati bilan cheklangan; kompaniya bankrot bo'lsa, shaxsiy mol-mulki himoyalanadi. Bu - tashkil etishning (inkorporatsiyaning) asosiy afzalligi.",
        },
        // -------- NEW Q7 - easy MCQ on stakeholder classification --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "Suppliers of a company are BEST classified as which type of stakeholder?",
          prompt_ru:
            "Поставщиков компании ЛУЧШЕ всего отнести к какому типу заинтересованных сторон?",
          prompt_uz:
            "Kompaniyaning ta'minotchilari qaysi turdagi manfaatdor tomon sifatida ENG TO'G'RI tasniflanadi?",
          options: [
            {
              key: "A",
              text_en: "Internal",
              text_ru: "Внутренние",
              text_uz: "Ichki",
              why_wrong_en:
                "Internal stakeholders are employees and managers - people who work inside the organisation.",
              why_wrong_ru:
                "Внутренние стороны - это сотрудники и менеджеры, работающие внутри организации.",
              why_wrong_uz:
                "Ichki manfaatdor tomonlar - xodimlar va menejerlar, ya'ni tashkilot ichida ishlaydigan odamlar.",
            },
            {
              key: "B",
              text_en: "Connected",
              text_ru: "Связанные",
              text_uz: "Bog'liq",
            },
            {
              key: "C",
              text_en: "External",
              text_ru: "Внешние",
              text_uz: "Tashqi",
              why_wrong_en:
                "External stakeholders (government, regulators, communities) have no contractual relationship; suppliers do.",
              why_wrong_ru:
                "Внешние стороны (государство, регуляторы, сообщества) не имеют договорных отношений; у поставщиков они есть.",
              why_wrong_uz:
                "Tashqi manfaatdor tomonlar (hukumat, tartibga soluvchilar, jamoalar) shartnomaviy munosabatga ega emas; ta'minotchilar esa egadir.",
            },
            {
              key: "D",
              text_en: "Strategic",
              text_ru: "Стратегические",
              text_uz: "Strategik",
              why_wrong_en:
                '"Strategic" is not a standard stakeholder classification - the standard three are internal, connected, and external.',
              why_wrong_ru:
                "«Стратегические» - не стандартная классификация заинтересованных сторон; стандартные три - внутренние, связанные, внешние.",
              why_wrong_uz:
                '"Strategik" - standart manfaatdor tomon tasnifi emas; standart uchta toifa - ichki, bog\'liq va tashqi.',
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Connected stakeholders have a contractual or commercial relationship with the organisation but are not part of it. This category includes shareholders, lenders, customers, and suppliers.",
          explanation_ru:
            "Связанные стороны имеют с организацией договорные или коммерческие отношения, но не входят в неё. К этой категории относятся акционеры, кредиторы, клиенты и поставщики.",
          explanation_uz:
            "Bog'liq manfaatdor tomonlar tashkilot bilan shartnomaviy yoki tijoriy munosabatga ega, lekin uning tarkibiga kirmaydi. Bu toifaga aksiyadorlar, kreditorlar, mijozlar va ta'minotchilar kiradi.",
        },
        // -------- NEW Q8 - easy short_answer on Porter's generic strategies --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "Which of the following is one of Porter's three generic competitive strategies?",
          prompt_ru:
            "Какая из перечисленных стратегий относится к трём базовым конкурентным стратегиям Портера?",
          prompt_uz:
            "Quyidagilardan qaysi biri Porterning uchta umumiy raqobat strategiyasidan biri?",
          options: [
            {
              key: "A",
              text_en: "Cost leadership",
              text_ru: "Лидерство по издержкам",
              text_uz: "Xarajatlar bo'yicha yetakchilik",
            },
            {
              key: "B",
              text_en: "Market penetration",
              text_ru: "Проникновение на рынок",
              text_uz: "Bozorga chuqur kirib borish",
              why_wrong_en:
                "Market penetration is one of Ansoff's growth strategies, not one of Porter's generic competitive strategies.",
              why_wrong_ru:
                "Проникновение на рынок - стратегия роста по Ансоффу, а не базовая конкурентная стратегия Портера.",
              why_wrong_uz:
                "Bozorga chuqur kirib borish - bu Ansoffning o'sish strategiyalaridan biri, Porterning umumiy raqobat strategiyasi emas.",
            },
            {
              key: "C",
              text_en: "Diversification",
              text_ru: "Диверсификация",
              text_uz: "Diversifikatsiya",
              why_wrong_en:
                "Diversification is an Ansoff growth direction, not a Porter generic strategy.",
              why_wrong_ru:
                "Диверсификация - направление роста по Ансоффу, а не базовая стратегия Портера.",
              why_wrong_uz:
                "Diversifikatsiya - Ansoffning o'sish yo'nalishi, Porterning umumiy strategiyasi emas.",
            },
            {
              key: "D",
              text_en: "Vertical integration",
              text_ru: "Вертикальная интеграция",
              text_uz: "Vertikal integratsiya",
              why_wrong_en:
                "Vertical integration is a structural expansion choice, not one of Porter's three generic positions (cost leadership, differentiation, focus).",
              why_wrong_ru:
                "Вертикальная интеграция - структурный выбор расширения, а не одна из трёх базовых позиций Портера (издержки, дифференциация, фокус).",
              why_wrong_uz:
                "Vertikal integratsiya - bu strukturaviy kengayish tanlovi, Porterning uchta umumiy mavqeidan biri emas (xarajatlar bo'yicha yetakchilik, differensiatsiya, fokuslanish).",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            'Porter argued a firm should choose one of three positions: cost leadership (compete on lowest cost), differentiation (compete on uniqueness), or focus (serve a narrow segment well). Trying to do all three risks being "stuck in the middle".',
          explanation_ru:
            "Портер утверждал, что фирма должна выбрать одну из трёх позиций: лидерство по издержкам (конкуренция по самой низкой цене), дифференциация (конкуренция по уникальности) или фокусирование (качественное обслуживание узкого сегмента). Попытка совместить все три грозит положением «застрявшего посередине».",
          explanation_uz:
            "Porter firma uchta mavqedan birini tanlashi kerakligini ta'kidladi: xarajatlar bo'yicha yetakchilik (eng past xarajat bilan raqobatlashish), differensiatsiya (o'ziga xoslik bilan raqobatlashish) yoki fokuslanish (tor segmentga yaxshi xizmat ko'rsatish). Uchalasini ham bir vaqtda qilishga urinish \"o'rta yo'lda qolib ketish\" xavfini tug'diradi.",
        },
        // -------- NEW Q9 - medium MCQ on NFP objectives --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "The primary objective of a not-for-profit organisation is BEST described as:",
          prompt_ru:
            "Основная цель некоммерческой организации ЛУЧШЕ всего описывается как:",
          prompt_uz:
            "Notijorat tashkilotning asosiy maqsadi ENG TO'G'RI quyidagicha ta'riflanadi:",
          options: [
            {
              key: "A",
              text_en: "Maximising profit for distribution to members",
              text_ru: "Максимизация прибыли для распределения между членами",
              text_uz:
                "A'zolar o'rtasida taqsimlash uchun foydani maksimallashtirish",
              why_wrong_en:
                "NFPs do not distribute profits - any surplus is reinvested in the mission.",
              why_wrong_ru:
                "НКО не распределяют прибыль - излишек реинвестируется в основную миссию.",
              why_wrong_uz:
                "Notijorat tashkilotlar foydani taqsimlamaydi - har qanday foyda missiyaga qayta investitsiya qilinadi.",
            },
            {
              key: "B",
              text_en:
                "Achieving its mission while operating within available resources",
              text_ru: "Достижение своей миссии в рамках доступных ресурсов",
              text_uz:
                "Mavjud resurslar doirasida faoliyat yuritgan holda o'z missiyasiga erishish",
            },
            {
              key: "C",
              text_en: "Increasing market share",
              text_ru: "Увеличение доли рынка",
              text_uz: "Bozor ulushini oshirish",
              why_wrong_en:
                "Market share is a commercial metric; NFPs are mission-driven and typically don't operate in competitive product markets.",
              why_wrong_ru:
                "Доля рынка - коммерческий показатель; НКО ориентированы на миссию и обычно не действуют на конкурентных товарных рынках.",
              why_wrong_uz:
                "Bozor ulushi - tijorat ko'rsatkichi; notijorat tashkilotlar missiyaga asoslangan va odatda raqobatli mahsulot bozorlarida faoliyat yuritmaydi.",
            },
            {
              key: "D",
              text_en: "Paying dividends to donors",
              text_ru: "Выплата дивидендов донорам",
              text_uz: "Xayriyachilarga dividend to'lash",
              why_wrong_en:
                "Donors give voluntarily without expectation of financial return; dividends are paid to shareholders of commercial entities.",
              why_wrong_ru:
                "Доноры передают средства добровольно, не ожидая финансовой отдачи; дивиденды выплачиваются акционерам коммерческих организаций.",
              why_wrong_uz:
                "Xayriyachilar moliyaviy daromad kutmasdan ixtiyoriy ravishda mablag' beradi; dividendlar esa tijorat tashkilotlarining aksiyadorlariga to'lanadi.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "A not-for-profit organisation exists to advance its mission (e.g. relieving poverty, advancing education). Financial sustainability matters, but as a constraint, not the goal - surplus is reinvested rather than distributed.",
          explanation_ru:
            "Некоммерческая организация существует для продвижения своей миссии (например, борьбы с бедностью, развития образования). Финансовая устойчивость важна, но как ограничение, а не цель - излишек реинвестируется, а не распределяется.",
          explanation_uz:
            "Notijorat tashkilot o'z missiyasini ilgari surish uchun mavjud (masalan, qashshoqlikni kamaytirish, ta'limni rivojlantirish). Moliyaviy barqarorlik muhim, ammo u maqsad emas, balki cheklov sifatida; foyda taqsimlanmaydi, balki qayta investitsiya qilinadi.",
          concept_bite_en:
            "Mission-driven and profit-driven organisations measure success differently.",
          concept_bite_ru:
            "Миссионные и прибыльные организации измеряют успех по-разному.",
          concept_bite_uz:
            "Missiyaga asoslangan va foydaga asoslangan tashkilotlar muvaffaqiyatni har xil o'lchaydi.",
        },
        // -------- NEW Q10 - medium MCQ on Porter's Five Forces classification --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A patent expiry allows generic manufacturers to enter the market. Which of Porter\u2019s Five Forces does this MOST directly increase?",
          prompt_ru:
            "Истечение срока патента позволяет производителям дженериков выйти на рынок. Какую из пяти сил Портера это НАИБОЛЕЕ напрямую усиливает?",
          prompt_uz:
            "Patent muddati tugashi generik (analog) ishlab chiqaruvchilarga bozorga kirish imkonini beradi. Bu Porterning besh kuchidan qaysi birini ENG bevosita oshiradi?",
          options: [
            {
              key: "A",
              text_en: "Threat of new entrants",
              text_ru: "Угроза новых игроков",
              text_uz: "Yangi kirib keluvchilar tahdidi",
            },
            {
              key: "B",
              text_en: "Bargaining power of suppliers",
              text_ru: "Сила поставщиков",
              text_uz: "Ta'minotchilarning savdolashish kuchi",
              why_wrong_en:
                "Patent expiry doesn't change the bargaining position of suppliers - it changes who can sell the product.",
              why_wrong_ru:
                "Истечение патента не меняет переговорные позиции поставщиков - оно меняет, кто может продавать продукт.",
              why_wrong_uz:
                "Patent muddatining tugashi ta'minotchilarning savdolashish mavqeini o'zgartirmaydi - u mahsulotni kim sotishi mumkinligini o'zgartiradi.",
            },
            {
              key: "C",
              text_en: "Bargaining power of buyers",
              text_ru: "Сила покупателей",
              text_uz: "Xaridorlarning savdolashish kuchi",
              why_wrong_en:
                "Buyers may benefit indirectly through lower prices, but the direct change is the removal of a barrier to entry.",
              why_wrong_ru:
                "Покупатели могут косвенно выиграть от снижения цен, но прямое изменение - устранение барьера входа.",
              why_wrong_uz:
                "Xaridorlar arzonroq narxlar orqali bilvosita manfaat ko'rishi mumkin, ammo bevosita o'zgarish - bu bozorga kirish to'sig'ining olib tashlanishidir.",
            },
            {
              key: "D",
              text_en: "Threat of substitutes",
              text_ru: "Угроза заменителей",
              text_uz: "O'rinbosarlar tahdidi",
              why_wrong_en:
                "Generics are not substitutes - they are identical chemical products entering the same market. Substitutes are different product categories serving the same need.",
              why_wrong_ru:
                "Дженерики - не заменители, а идентичные химические продукты, выходящие на тот же рынок. Заменители - это иные продуктовые категории, удовлетворяющие ту же потребность.",
              why_wrong_uz:
                "Generik mahsulotlar o'rinbosar emas - ular o'sha bozorga kirib kelayotgan bir xil kimyoviy mahsulotlardir. O'rinbosarlar esa o'sha ehtiyojni qondiruvchi boshqa mahsulot toifalaridir.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "A patent is a major barrier to entry. When it expires, generic firms can enter the market with identical products at lower cost, sharply increasing the threat of new entrants force.",
          explanation_ru:
            "Патент - серьёзный барьер входа. После его истечения производители дженериков могут выйти на рынок с идентичными продуктами по более низкой цене, резко усиливая угрозу новых игроков.",
          explanation_uz:
            "Patent - bozorga kirishning jiddiy to'sig'i. Uning muddati tugaganda, generik firmalar bir xil mahsulotlar bilan arzonroq narxda bozorga kira oladi va bu yangi kirib keluvchilar tahdidi kuchini keskin oshiradi.",
        },
        // -------- NEW Q11 - medium MCQ on unemployment type --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A factory closes because automation has eliminated the need for assembly-line workers. The resulting unemployment is BEST classified as:",
          prompt_ru:
            "Завод закрывается, потому что автоматизация устранила потребность в работниках конвейера. Возникшую безработицу ЛУЧШЕ всего классифицировать как:",
          prompt_uz:
            "Avtomatlashtirish yig'ish liniyasidagi ishchilarga bo'lgan ehtiyojni yo'qqa chiqargani uchun zavod yopiladi. Natijada yuzaga kelgan ishsizlik ENG TO'G'RI quyidagicha tasniflanadi:",
          options: [
            {
              key: "A",
              text_en: "Frictional",
              text_ru: "Фрикционная",
              text_uz: "Friksion",
              why_wrong_en:
                "Frictional unemployment is short-term, occurring as people move between jobs; this is a permanent skills mismatch.",
              why_wrong_ru:
                "Фрикционная безработица краткосрочна и возникает при переходе между работами; здесь речь о постоянном несоответствии квалификации.",
              why_wrong_uz:
                "Friksion ishsizlik qisqa muddatli bo'lib, odamlar ishdan ishga o'tayotganda yuzaga keladi; bu esa doimiy malaka nomuvofiqligidir.",
            },
            {
              key: "B",
              text_en: "Cyclical",
              text_ru: "Циклическая",
              text_uz: "Tsiklik",
              why_wrong_en:
                "Cyclical unemployment is caused by recession and falling aggregate demand, not by structural changes in technology.",
              why_wrong_ru:
                "Циклическая безработица вызвана рецессией и падением совокупного спроса, а не структурными технологическими изменениями.",
              why_wrong_uz:
                "Tsiklik ishsizlik retsessiya va yalpi talabning pasayishi tufayli yuzaga keladi, texnologiyadagi strukturaviy o'zgarishlar tufayli emas.",
            },
            {
              key: "C",
              text_en: "Structural",
              text_ru: "Структурная",
              text_uz: "Strukturaviy",
            },
            {
              key: "D",
              text_en: "Seasonal",
              text_ru: "Сезонная",
              text_uz: "Mavsumiy",
              why_wrong_en:
                "Seasonal unemployment follows predictable seasonal patterns (tourism, agriculture); this is technology-driven displacement.",
              why_wrong_ru:
                "Сезонная безработица следует предсказуемым сезонным циклам (туризм, сельское хозяйство); здесь - вытеснение технологиями.",
              why_wrong_uz:
                "Mavsumiy ishsizlik oldindan aytib bo'ladigan mavsumiy naqshlarga ergashadi (turizm, qishloq xo'jaligi); bu esa texnologiya tufayli yuzaga kelgan ishdan chiqarishdir.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "Structural unemployment occurs when there is a permanent mismatch between worker skills and available jobs - often due to technological change or shifts in the structure of the economy. Retraining is the typical policy response.",
          explanation_ru:
            "Структурная безработица возникает при устойчивом несоответствии между навыками работников и доступными рабочими местами - часто из-за технологических изменений или сдвигов в структуре экономики. Типичный ответ - переподготовка кадров.",
          explanation_uz:
            "Strukturaviy ishsizlik ishchilarning malakasi va mavjud ish o'rinlari o'rtasida doimiy nomuvofiqlik bo'lganda yuzaga keladi - ko'pincha texnologik o'zgarish yoki iqtisodiyot tuzilishidagi siljishlar tufayli. Odatdagi siyosiy javob - qayta tayyorlash.",
        },
        // -------- NEW Q12 - medium MCQ on Mendelow scenario --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A retail company\u2019s largest institutional shareholder has indicated it will vote against the next dividend proposal. Under Mendelow\u2019s matrix, this shareholder should be:",
          prompt_ru:
            "Крупнейший институциональный акционер розничной компании заявил, что проголосует против следующего предложения о дивидендах. По матрице Мендлоу этого акционера следует:",
          prompt_uz:
            "Chakana savdo kompaniyasining eng yirik institutsional aksiyadori navbatdagi dividend taklifiga qarshi ovoz berishini bildirgan. Mendelou matritsasiga ko'ra, bu aksiyadorga qanday yondashuv kerak:",
          options: [
            {
              key: "A",
              text_en: "Managed closely as a key player",
              text_ru: "Управлять плотно как ключевую фигуру",
              text_uz: "Asosiy ishtirokchi sifatida yaqindan boshqarish",
            },
            {
              key: "B",
              text_en: "Kept informed only",
              text_ru: "Только информировать",
              text_uz: "Faqat xabardor qilib turish",
              why_wrong_en:
                '"Keep informed" applies to stakeholders with LOW power; an institutional shareholder voting against the board has HIGH power.',
              why_wrong_ru:
                "«Информировать» применяется к сторонам с НИЗКОЙ властью; институциональный акционер, голосующий против совета, имеет ВЫСОКУЮ власть.",
              why_wrong_uz:
                '"Xabardor qilib turish" PAST hokimiyatga ega tomonlarga nisbatan qo\'llaniladi; kengashga qarshi ovoz berayotgan institutsional aksiyador esa YUQORI hokimiyatga ega.',
            },
            {
              key: "C",
              text_en: "Kept satisfied with minimal engagement",
              text_ru: "Удовлетворять с минимальным вовлечением",
              text_uz: "Minimal ishtirok bilan qoniqtirib turish",
              why_wrong_en:
                '"Keep satisfied" applies to high-power but LOW-interest stakeholders; this shareholder is actively engaged.',
              why_wrong_ru:
                "«Удовлетворять» применяется к сторонам с высокой властью, но НИЗКИМ интересом; этот акционер активно вовлечён.",
              why_wrong_uz:
                '"Qoniqtirib turish" yuqori hokimiyat, lekin PAST qiziqishga ega tomonlarga nisbatan qo\'llaniladi; bu aksiyador esa faol ishtirok etmoqda.',
            },
            {
              key: "D",
              text_en: "Monitored with minimal effort",
              text_ru: "Отслеживать с минимальными усилиями",
              text_uz: "Minimal sa'y-harakat bilan kuzatib borish",
              why_wrong_en:
                '"Minimal effort" applies to low-power-low-interest stakeholders; this shareholder demonstrates both.',
              why_wrong_ru:
                "«Минимум усилий» - для сторон с низкой властью и низким интересом; данный акционер демонстрирует обратное.",
              why_wrong_uz:
                "\"Minimal sa'y-harakat\" past hokimiyat va past qiziqishga ega tomonlarga qo'llaniladi; bu aksiyador esa ikkalasini ham namoyish etmoqda.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            'A large institutional shareholder has high power (votes can swing decisions) AND is showing high interest (actively engaging on the dividend issue). High-power-high-interest stakeholders are "Key Players" requiring close management - typically direct dialogue with the board.',
          explanation_ru:
            "Крупный институциональный акционер обладает высокой властью (его голоса могут решать) И демонстрирует высокий интерес (активно вовлечён в вопрос о дивидендах). Стороны с высокой властью и высоким интересом - «ключевые игроки», требующие плотного управления, обычно через прямой диалог с советом.",
          explanation_uz:
            "Yirik institutsional aksiyador yuqori hokimiyatga ega (ovozlari qarorlarni o'zgartirishi mumkin) HAMDA yuqori qiziqish ko'rsatmoqda (dividend masalasida faol ishtirok etmoqda). Yuqori hokimiyat va yuqori qiziqishga ega tomonlar - \"Asosiy ishtirokchilar\" bo'lib, yaqindan boshqarishni talab qiladi, odatda kengash bilan bevosita muloqot orqali.",
        },
        // -------- NEW Q13 - medium short_answer on elasticity --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "What term describes the responsiveness of quantity demanded to a change in price?",
          prompt_ru:
            "Какой термин описывает реакцию величины спроса на изменение цены?",
          prompt_uz:
            "Talab qilingan miqdorning narx o'zgarishiga ta'sirchanligini qaysi atama ifodalaydi?",
          options: [
            {
              key: "A",
              text_en: "Price elasticity of demand",
              text_ru: "Ценовая эластичность спроса",
              text_uz: "Talabning narx bo'yicha elastikligi",
            },
            {
              key: "B",
              text_en: "Income elasticity of demand",
              text_ru: "Эластичность спроса по доходу",
              text_uz: "Talabning daromad bo'yicha elastikligi",
              why_wrong_en:
                "Income elasticity measures responsiveness of demand to a change in consumer INCOME, not price.",
              why_wrong_ru:
                "Эластичность по доходу измеряет реакцию спроса на изменение ДОХОДА, а не цены.",
              why_wrong_uz:
                "Daromad bo'yicha elastiklik talabning narxga emas, balki iste'molchi DAROMADIGA o'zgarishiga ta'sirchanligini o'lchaydi.",
            },
            {
              key: "C",
              text_en: "Cross elasticity of demand",
              text_ru: "Перекрёстная эластичность спроса",
              text_uz: "Talabning o'zaro (kross) elastikligi",
              why_wrong_en:
                "Cross elasticity measures how demand for one good responds to a price change in ANOTHER good.",
              why_wrong_ru:
                "Перекрёстная эластичность измеряет реакцию спроса на один товар при изменении цены ДРУГОГО.",
              why_wrong_uz:
                "O'zaro elastiklik bir tovarga bo'lgan talab BOSHQA tovar narxining o'zgarishiga qanday ta'sir qilishini o'lchaydi.",
            },
            {
              key: "D",
              text_en: "Marginal propensity to consume",
              text_ru: "Предельная склонность к потреблению",
              text_uz: "Iste'molga chegaraviy moyillik",
              why_wrong_en:
                "This is a macroeconomic term for the share of extra income that is spent, unrelated to price responsiveness.",
              why_wrong_ru:
                "Это макроэкономический термин - доля дополнительного дохода, которая тратится; к ценовой чувствительности не относится.",
              why_wrong_uz:
                "Bu - qo'shimcha daromadning sarflanadigan ulushini bildiruvchi makroiqtisodiy atama bo'lib, narxga ta'sirchanlikka aloqasi yo'q.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Price elasticity of demand (PED) = % change in quantity demanded / % change in price. Demand is elastic (PED > 1) when revenue rises as price falls, and inelastic (PED < 1) when revenue falls as price falls.",
          explanation_ru:
            "Ценовая эластичность спроса (PED) = % изменения величины спроса / % изменения цены. Спрос эластичен (PED > 1), когда при снижении цены выручка растёт, и неэластичен (PED < 1), когда при снижении цены выручка падает.",
          explanation_uz:
            "Talabning narx bo'yicha elastikligi (PED) = talab qilingan miqdorning % o'zgarishi / narxning % o'zgarishi. Talab elastik (PED > 1) bo'lganda narx pasayishi bilan daromad oshadi, noelastik (PED < 1) bo'lganda esa narx pasayishi bilan daromad kamayadi.",
        },
        // -------- NEW Q14 - hard MCQ on Porter's generic strategy trap --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            "A mid-market clothing retailer attempts to compete on BOTH lowest prices AND highest quality across its entire product range. According to Porter, the MOST LIKELY outcome is:",
          prompt_ru:
            "Розничная сеть одежды среднего сегмента пытается конкурировать ОДНОВРЕМЕННО по самым низким ценам И по самому высокому качеству по всему ассортименту. По Портеру, НАИБОЛЕЕ ВЕРОЯТНЫЙ результат:",
          prompt_uz:
            "O'rta darajadagi kiyim-kechak sotuvchisi o'zining butun mahsulot turkumida HAM eng past narxlar, HAM eng yuqori sifat bo'yicha raqobatlashishga harakat qiladi. Porterga ko'ra, ENG EHTIMOLLI natija:",
          options: [
            {
              key: "A",
              text_en:
                "It achieves dominant market position through dual advantage",
              text_ru:
                "Достижение доминирующего положения за счёт двойного преимущества",
              text_uz:
                "U ikki tomonlama ustunlik orqali bozorda hukmron mavqega erishadi",
              why_wrong_en:
                "Porter's framework explicitly warns against this; firms trying to do both typically achieve neither.",
              why_wrong_ru:
                "Модель Портера прямо предупреждает против такого подхода: компании, пытающиеся совместить обе стратегии, обычно не достигают ни одной.",
              why_wrong_uz:
                "Porter doirasi bundan aniq ogohlantiradi; ikkalasini ham qilishga urinayotgan firmalar odatda hech biriga erisha olmaydi.",
            },
            {
              key: "B",
              text_en: 'It becomes "stuck in the middle" with weak positioning',
              text_ru: "Оно «застревает посередине» со слабой позицией",
              text_uz: "U zaif pozitsiya bilan \"o'rta yo'lda qolib ketadi\"",
            },
            {
              key: "C",
              text_en: "It successfully implements a focus strategy",
              text_ru: "Успешно реализует стратегию фокусирования",
              text_uz:
                "U fokuslanish strategiyasini muvaffaqiyatli amalga oshiradi",
              why_wrong_en:
                "Focus targets a narrow segment; competing across an entire range is the opposite of focus.",
              why_wrong_ru:
                "Фокусирование нацелено на узкий сегмент; конкуренция по всему ассортименту - противоположность фокусирования.",
              why_wrong_uz:
                "Fokuslanish tor segmentni nishonga oladi; butun turkum bo'ylab raqobatlashish esa fokuslanishning aksidir.",
            },
            {
              key: "D",
              text_en: "It defines a new sixth competitive force",
              text_ru: "Создаёт новую шестую конкурентную силу",
              text_uz: "U yangi, oltinchi raqobat kuchini belgilaydi",
              why_wrong_en:
                'There is no "sixth force" in Porter\'s model relevant to this scenario; this is a distractor.',
              why_wrong_ru:
                "«Шестой силы» в модели Портера, относящейся к этому сценарию, не существует; это отвлекающий вариант.",
              why_wrong_uz:
                'Porter modelida bu vaziyatga oid "oltinchi kuch" mavjud emas; bu - chalg\'ituvchi javob.',
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            'Porter argued that cost leadership and differentiation require fundamentally different operational choices - cost leaders pursue efficiency, standardisation, and scale; differentiators invest in design, quality, and premium positioning. Trying to do both simultaneously typically results in being "stuck in the middle" - undifferentiated and not cost-competitive.',
          explanation_ru:
            "Портер утверждал, что лидерство по издержкам и дифференциация требуют принципиально разных операционных выборов: лидеры по издержкам гонятся за эффективностью, стандартизацией и масштабом; дифференциаторы инвестируют в дизайн, качество и премиальное позиционирование. Попытка делать и то и другое одновременно обычно приводит к «застреванию посередине» - без дифференциации и без ценового преимущества.",
          explanation_uz:
            "Porter xarajatlar bo'yicha yetakchilik va differensiatsiya tubdan farqli operatsion tanlovlarni talab qilishini ta'kidladi - xarajat yetakchilari samaradorlik, standartlashtirish va ko'lamga intiladi; differensiatorlar esa dizayn, sifat va premium pozitsiyaga sarmoya kiritadi. Ikkalasini bir vaqtda qilishga urinish odatda \"o'rta yo'lda qolib ketish\"ga olib keladi - na ajralib turadi, na narx bo'yicha raqobatbardosh bo'ladi.",
        },
        // -------- NEW Q15 - hard MCQ scenario combining PESTEL + Porter --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            "A new environmental law requires all car manufacturers to switch to zero-emission engines within five years. Which combination BEST describes the strategic impact?",
          prompt_ru:
            "Новый экологический закон требует от всех автопроизводителей перейти на двигатели с нулевым выбросом в течение пяти лет. Какая комбинация ЛУЧШЕ всего описывает стратегическое влияние?",
          prompt_uz:
            "Yangi ekologik qonun barcha avtomobil ishlab chiqaruvchilarni besh yil ichida nol chiqindili dvigatellarga o'tishni talab qiladi. Qaysi kombinatsiya strategik ta'sirni ENG TO'G'RI ta'riflaydi?",
          options: [
            {
              key: "A",
              text_en:
                "PESTEL: Environmental + Legal; Porter: increases threat of substitutes",
              text_ru:
                "PESTEL: экологические + правовые; Портер: усиливает угрозу заменителей",
              text_uz:
                "PESTEL: Ekologik + Huquqiy; Porter: o'rinbosarlar tahdidini oshiradi",
              why_wrong_en:
                "The PESTEL classification is right, but substitutes refers to different product categories serving the same need (e.g. trains for cars). The law forces a redesign of the existing product, not a switch to a substitute.",
              why_wrong_ru:
                "Классификация PESTEL верна, но заменители - это иные продуктовые категории, удовлетворяющие ту же потребность (например, поезда вместо автомобилей). Закон требует переработки существующего продукта, а не перехода к заменителю.",
              why_wrong_uz:
                "PESTEL tasnifi to'g'ri, ammo o'rinbosarlar o'sha ehtiyojni qondiruvchi boshqa mahsulot toifalarini bildiradi (masalan, avtomobil o'rniga poyezd). Qonun esa o'rinbosarga o'tishni emas, mavjud mahsulotni qayta loyihalashni majbur qiladi.",
            },
            {
              key: "B",
              text_en:
                "PESTEL: Environmental + Legal; Porter: raises barriers to entry",
              text_ru:
                "PESTEL: экологические + правовые; Портер: повышает барьеры входа",
              text_uz:
                "PESTEL: Ekologik + Huquqiy; Porter: bozorga kirish to'siqlarini oshiradi",
            },
            {
              key: "C",
              text_en:
                "PESTEL: Social + Technological; Porter: increases buyer power",
              text_ru:
                "PESTEL: социальные + технологические; Портер: усиливает силу покупателей",
              text_uz:
                "PESTEL: Ijtimoiy + Texnologik; Porter: xaridorlar kuchini oshiradi",
              why_wrong_en:
                "The law is environmental in concern and legal in form, not driven by social or technological forces. Buyer power isn't directly affected by emission standards.",
              why_wrong_ru:
                "Закон по существу экологический и по форме правовой, а не социальный или технологический. На силу покупателей нормативы выбросов прямо не влияют.",
              why_wrong_uz:
                "Qonun mohiyatan ekologik va shakliga ko'ra huquqiy bo'lib, ijtimoiy yoki texnologik kuchlar bilan boshqarilmaydi. Chiqindi standartlari xaridorlar kuchiga bevosita ta'sir qilmaydi.",
            },
            {
              key: "D",
              text_en:
                "PESTEL: Political only; Porter: increases supplier power",
              text_ru:
                "PESTEL: только политические; Портер: усиливает силу поставщиков",
              text_uz:
                "PESTEL: Faqat Siyosiy; Porter: ta'minotchilar kuchini oshiradi",
              why_wrong_en:
                "The change has clear Environmental and Legal dimensions, not Political only. The supplier-power effect is indirect and weaker than the entry-barrier effect.",
              why_wrong_ru:
                "У изменения чёткие экологические и правовые измерения, а не только политические. Эффект на силу поставщиков косвенный и слабее, чем эффект на барьеры входа.",
              why_wrong_uz:
                "O'zgarishning aniq Ekologik va Huquqiy jihatlari bor, faqat Siyosiy emas. Ta'minotchilar kuchiga ta'siri esa bilvosita va kirish to'sig'i ta'siridan zaifroqdir.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "The law is an Environmental concern enacted in Legal form - both PESTEL categories apply. For Porter, mandatory engine redesign requires massive R&D investment and new manufacturing capability, which raises barriers to entry sharply: new competitors must meet the same standards from day one, with no legacy revenue to fund the transition. Existing players benefit from the higher barrier even as they bear its cost.",
          explanation_ru:
            "Закон представляет собой экологическую озабоченность, оформленную правовым актом - обе категории PESTEL применимы. По Портеру, обязательная переработка двигателей требует крупных вложений в НИОКР и новых производственных мощностей, что резко повышает барьеры входа: новые конкуренты должны соответствовать тем же стандартам с первого дня, не имея устаревшей выручки для финансирования перехода. Действующие игроки получают выгоду от более высокого барьера, даже неся его издержки.",
          explanation_uz:
            "Qonun Huquqiy shaklda qabul qilingan Ekologik masala - har ikkala PESTEL toifasi qo'llaniladi. Porter nuqtai nazaridan, dvigatelni majburiy qayta loyihalash katta tadqiqot-ishlanma (R&D) sarmoyasini va yangi ishlab chiqarish quvvatini talab qiladi, bu esa bozorga kirish to'siqlarini keskin oshiradi: yangi raqobatchilar birinchi kundanoq xuddi shu standartlarga javob berishi kerak, o'tishni moliyalashtirish uchun mavjud daromadga ega bo'lmasdan. Mavjud o'yinchilar esa, garchi xarajatni ko'tarsalar-da, yuqori to'siqdan manfaat ko'radi.",
        },
      ],
    },
    // ---------- B ----------
    {
      code: "B",
      title_en: "Business organisation structure, functions and governance",
      title_ru: "Структура организации, её функции и корпоративное управление",
      title_uz: "Tashkilot tuzilmasi, funksiyalari va boshqaruvi",
      description_en:
        "Organisational structures, culture, and governance frameworks.",
      description_ru:
        "Структуры организаций, корпоративная культура и системы управления.",
      description_uz:
        "Tashkiliy tuzilmalar, madaniyat va korporativ boshqaruv doiralari.",
      sort_order: 20,
      theory_en:
        "Organisational structure determines how work is divided and how authority flows. Common forms include functional (grouped by specialism - finance, marketing, ops), divisional (by product, region, or customer), matrix (dual reporting to a functional manager and a project/product manager), and geographic. Two cross-cutting choices shape any structure: span of control (number of subordinates per manager - wide spans produce flat structures, narrow spans produce tall ones) and centralisation versus decentralisation (where decision-making sits). Decentralisation speeds local response but risks inconsistency; centralisation gives uniformity at the cost of agility.\n\n" +
        "Mintzberg analyses every organisation as five components: the strategic apex (senior leadership), the middle line (managers connecting top and bottom), the operating core (people doing the actual work), the technostructure (analysts standardising work - e.g. management accountants, HR policy designers), and support staff (legal, IT, catering). Mintzberg also lists ten managerial skills covering interpersonal, informational, and decisional roles.\n\n" +
        'Culture is the "way we do things here". Handy identifies four types: power (concentrated on a central figure, often a founder), role (bureaucratic, rule-driven), task (project-focused, expertise-led), and person (built around individuals, e.g. a barrister\'s chambers). Schein describes culture in three layers: visible artefacts, espoused values, and deep underlying assumptions.\n\n' +
        'Corporate governance covers how companies are directed and controlled. The board oversees strategy and risk; non-executive directors (NEDs) provide independent challenge. Key board committees are audit, remuneration, and nomination - each chaired by a NED. Best practice separates the roles of CEO and chairman to avoid concentrated power. The UK Corporate Governance Code operates on a "comply or explain" basis: companies may depart from specific provisions if they explain why in the annual report.',
      theory_ru:
        "Организационная структура определяет, как делится работа и как распределяется полномочие. Распространённые формы: функциональная (группировка по специализации - финансы, маркетинг, операции), дивизиональная (по продукту, региону или клиенту), матричная (двойное подчинение функциональному руководителю и руководителю проекта/продукта) и географическая. Любую структуру формируют два сквозных выбора: норма управляемости (число подчинённых на одного руководителя - широкая норма даёт плоские структуры, узкая - высокие) и централизация против децентрализации (где принимаются решения). Децентрализация ускоряет местный отклик, но повышает риск непоследовательности; централизация обеспечивает единообразие ценой гибкости.\n\n" +
        "Минцберг рассматривает любую организацию как пять элементов: стратегическая вершина (высшее руководство), средняя линия (менеджеры, связывающие верх и низ), операционное ядро (люди, выполняющие основную работу), техноструктура (аналитики, стандартизирующие работу - например, управленческие бухгалтеры, разработчики HR-политик) и вспомогательный персонал (юристы, ИТ, кейтеринг). Минцберг также выделяет десять управленческих навыков, охватывающих межличностные, информационные и решенческие роли.\n\n" +
        "Культура - это «как у нас принято делать». Хэнди выделяет четыре типа: культура власти (сосредоточена на центральной фигуре, часто на основателе), культура роли (бюрократическая, основанная на правилах), культура задачи (ориентированная на проекты, ведущая роль у экспертов) и культура личности (выстроена вокруг отдельных людей, например адвокатская палата). Шейн описывает культуру тремя слоями: видимые артефакты, провозглашаемые ценности и глубинные базовые предположения.\n\n" +
        "Корпоративное управление определяет, как компания управляется и контролируется. Совет директоров отвечает за стратегию и риски; неисполнительные директора (NED) обеспечивают независимый контроль. Ключевые комитеты совета - аудиторский, по вознаграждениям и по назначениям - возглавляются неисполнительными директорами. Передовая практика - разделение ролей CEO и председателя совета во избежание концентрации власти. Британский Кодекс корпоративного управления работает по принципу «соблюдай или объясни»: компания может отступать от конкретных положений, если объясняет причины в годовом отчёте.",
      theory_uz:
        "Tashkiliy tuzilma ish qanday taqsimlanishi va vakolat qanday yo'nalishini belgilaydi. Keng tarqalgan shakllarga funksional (mutaxassislik bo'yicha guruhlangan - moliya, marketing, operatsiyalar), divizional (mahsulot, mintaqa yoki mijoz bo'yicha), matritsa (funksional menejer va loyiha/mahsulot menejeriga ikki tomonlama bo'ysunish) va geografik tuzilma kiradi. Har qanday tuzilmani ikkita kesishuvchi tanlov shakllantiradi: nazorat doirasi (bir menejerga to'g'ri keladigan bo'ysunuvchilar soni - keng doira yassi tuzilmalarni, tor doira esa baland tuzilmalarni hosil qiladi) va markazlashtirish yoki markazlashtirmaslik (qaror qabul qilish qayerda joylashgani). Markazlashtirmaslik mahalliy javobni tezlashtiradi, ammo nomuvofiqlik xavfini tug'diradi; markazlashtirish esa yagonalikni beradi, biroq epchillikdan voz kechib.\n\nMintzberg har bir tashkilotni besh tarkibiy qism sifatida tahlil qiladi: strategik cho'qqi (oliy rahbariyat), o'rta bo'g'in (yuqori va quyi qismni bog'lovchi menejerlar), operatsion yadro (haqiqiy ishni bajaruvchi odamlar), texnostruktura (ishni standartlashtiruvchi tahlilchilar - masalan, boshqaruv buxgalterlari, kadrlar siyosatini ishlab chiquvchilar) va yordamchi xodimlar (huquq, IT, ovqatlantirish). Mintzberg shuningdek shaxslararo, axborotga oid va qaror qabul qilishga oid rollarni qamrab oluvchi o'nta boshqaruv mahoratini sanab o'tadi.\n\nMadaniyat - bu \"bu yerda biz ishlarni qanday qilamiz\". Handi to'rt turni ajratadi: hokimiyat (markaziy shaxsga, ko'pincha asoschiga jamlangan), rol (byurokratik, qoidalarga asoslangan), vazifa (loyihaga yo'naltirilgan, mutaxassislik yetakchiligida) va shaxs (alohida shaxslar atrofida qurilgan, masalan, advokatlar palatasi). Shein madaniyatni uch qatlamda ta'riflaydi: ko'rinadigan artefaktlar, e'lon qilingan qadriyatlar va chuqur asosiy taxminlar.\n\nKorporativ boshqaruv kompaniyalar qanday yo'naltirilishi va nazorat qilinishini qamrab oladi. Kengash strategiya va xavfni nazorat qiladi; ijroiya bo'lmagan direktorlar (NED) mustaqil tanqid (e'tiroz) bildiradi. Kengashning asosiy qo'mitalari - audit, mukofotlash va nomzodlarni tavsiya etish bo'lib, har biriga NED raislik qiladi. Eng yaxshi amaliyot hokimiyatning jamlanishidan qochish uchun bosh direktor (CEO) va raisning rollarini ajratadi. Buyuk Britaniya Korporativ Boshqaruv Kodeksi \"rioya qil yoki tushuntir\" tamoyili asosida ishlaydi: kompaniyalar muayyan qoidalardan chetga chiqishi mumkin, agar yillik hisobotda sababini tushuntirsa.",
      questions: [
        // -------- existing Q1 (augmented with why_wrong) --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "Mintzberg\u2019s five organisational components include the strategic apex, middle line, technostructure, support staff, and:",
          prompt_ru:
            "Пять элементов организации по Минцбергу: стратегическая вершина, средняя линия, техноструктура, вспомогательный персонал и:",
          prompt_uz:
            "Mintzbergning beshta tashkiliy tarkibiy qismiga strategik cho'qqi, o'rta bo'g'in, texnostruktura, yordamchi xodimlar va quyidagi kiradi:",
          options: [
            {
              key: "A",
              text_en: "Operating core",
              text_ru: "Операционное ядро",
              text_uz: "Operatsion yadro",
            },
            {
              key: "B",
              text_en: "External board",
              text_ru: "Внешний совет",
              text_uz: "Tashqi kengash",
              why_wrong_en:
                '"External board" is not a Mintzberg component; the board sits within or above the strategic apex.',
              why_wrong_ru:
                "«Внешний совет» не входит в элементы Минцберга; совет находится внутри стратегической вершины или над ней.",
              why_wrong_uz:
                '"Tashqi kengash" Mintzberg tarkibiy qismi emas; kengash strategik cho\'qqi ichida yoki undan yuqorida joylashadi.',
            },
            {
              key: "C",
              text_en: "Sales channel",
              text_ru: "Канал продаж",
              text_uz: "Sotuv kanali",
              why_wrong_en:
                "A sales channel is a distribution route, not a structural component of the organisation itself.",
              why_wrong_ru:
                "Канал продаж - это маршрут сбыта, а не структурный элемент самой организации.",
              why_wrong_uz:
                "Sotuv kanali - bu taqsimot yo'li, tashkilotning o'zining tarkibiy qismi emas.",
            },
            {
              key: "D",
              text_en: "Audit committee",
              text_ru: "Аудиторский комитет",
              text_uz: "Audit qo'mitasi",
              why_wrong_en:
                "The audit committee is a governance body, not one of Mintzberg's five structural components.",
              why_wrong_ru:
                "Аудиторский комитет - орган корпоративного управления, а не один из пяти элементов структуры по Минцбергу.",
              why_wrong_uz:
                "Audit qo'mitasi - boshqaruv organi, Mintzbergning beshta tarkibiy qismidan biri emas.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "The operating core is the group of people who do the basic work of producing the organisation\u2019s products or services.",
          explanation_ru:
            "Операционное ядро - это люди, выполняющие основную работу по производству продукта или услуги организации.",
          explanation_uz:
            "Operatsion yadro - tashkilotning mahsulot yoki xizmatlarini ishlab chiqarish bo'yicha asosiy ishni bajaradigan odamlar guruhidir.",
        },
        // -------- existing Q2 (augmented) --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "Which of the following is NOT a feature of a matrix organisational structure?",
          prompt_ru:
            "Что из перечисленного НЕ является характеристикой матричной структуры организации?",
          prompt_uz:
            "Quyidagilardan qaysi biri matritsa tashkiliy tuzilmasining xususiyati EMAS?",
          options: [
            {
              key: "A",
              text_en: "Dual reporting lines",
              text_ru: "Двойное подчинение",
              text_uz: "Ikki tomonlama bo'ysunish chiziqlari",
              why_wrong_en:
                "Dual reporting (to functional and project managers) is the defining feature of a matrix.",
              why_wrong_ru:
                "Двойное подчинение (функциональному и проектному руководителю) - определяющая черта матрицы.",
              why_wrong_uz:
                "Ikki tomonlama bo'ysunish (funksional va loyiha menejerlariga) matritsaning asosiy xususiyatidir.",
            },
            {
              key: "B",
              text_en: "Flexible resource allocation across projects",
              text_ru: "Гибкое распределение ресурсов между проектами",
              text_uz: "Loyihalar bo'ylab resurslarni moslashuvchan taqsimlash",
              why_wrong_en:
                "Flexible resource sharing is a major reason organisations adopt a matrix - staff move between projects as needed.",
              why_wrong_ru:
                "Гибкое распределение ресурсов - важная причина внедрения матрицы: сотрудники переходят между проектами по необходимости.",
              why_wrong_uz:
                "Resurslarni moslashuvchan bo'lishish - tashkilotlar matritsani qabul qilishining asosiy sababi: xodimlar zarurat bo'yicha loyihalar orasida harakatlanadi.",
            },
            {
              key: "C",
              text_en: "Single chain of command",
              text_ru: "Единая вертикаль управления",
              text_uz: "Yagona buyruq zanjiri",
            },
            {
              key: "D",
              text_en: "Cross-functional collaboration",
              text_ru: "Межфункциональное взаимодействие",
              text_uz: "Funksiyalararo hamkorlik",
              why_wrong_en:
                "Cross-functional collaboration is a key benefit of matrix structures - they bring specialists together on projects.",
              why_wrong_ru:
                "Межфункциональное взаимодействие - ключевая выгода матричной структуры: она объединяет специалистов на проектах.",
              why_wrong_uz:
                "Funksiyalararo hamkorlik - matritsa tuzilmalarining asosiy afzalligi: ular mutaxassislarni loyihalarda birlashtiradi.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "A matrix structure deliberately breaks the single chain of command - employees report to both a functional manager and a project/product manager.",
          explanation_ru:
            "Матричная структура сознательно нарушает принцип единоначалия: сотрудники подчиняются и функциональному руководителю, и руководителю проекта/продукта.",
          explanation_uz:
            "Matritsa tuzilmasi yagona buyruq zanjirini ataylab buzadi - xodimlar ham funksional menejerga, ham loyiha/mahsulot menejeriga bo'ysunadi.",
        },
        // -------- existing Q3 (unchanged short_answer) --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "Which of Handy's culture types is characterised by a single powerful central figure controlling the organisation?",
          prompt_ru:
            "Какой тип культуры по Хэнди характеризуется единственной влиятельной центральной фигурой, контролирующей организацию?",
          prompt_uz:
            "Handining qaysi madaniyat turi tashkilotni nazorat qiladigan yagona kuchli markaziy shaxs bilan tavsiflanadi?",
          options: [
            {
              key: "A",
              text_en: "Power culture",
              text_ru: "Культура власти",
              text_uz: "Hokimiyat madaniyati",
            },
            {
              key: "B",
              text_en: "Role culture",
              text_ru: "Ролевая культура",
              text_uz: "Rol madaniyati",
              why_wrong_en:
                'Role culture is built on rules, hierarchy and job descriptions (the "Greek temple"), not on one central figure.',
              why_wrong_ru:
                "Ролевая культура строится на правилах, иерархии и должностных инструкциях («греческий храм»), а не на одной центральной фигуре.",
              why_wrong_uz:
                'Rol madaniyati yagona markaziy shaxsga emas, balki qoidalar, ierarxiya va lavozim yo\'riqnomalariga ("yunon ibodatxonasi") asoslanadi.',
            },
            {
              key: "C",
              text_en: "Task culture",
              text_ru: "Культура задачи",
              text_uz: "Vazifa madaniyati",
              why_wrong_en:
                'Task culture organises around projects and teams (the "net"), with power spread by expertise rather than centralised.',
              why_wrong_ru:
                "Культура задачи строится вокруг проектов и команд («сеть»); власть распределена по компетенциям, а не централизована.",
              why_wrong_uz:
                "Vazifa madaniyati loyiha va jamoalar atrofida tashkillashadi (\"to'r\"), hokimiyat markazlashtirilmagan, balki mutaxassislik bo'yicha taqsimlangan.",
            },
            {
              key: "D",
              text_en: "Person culture",
              text_ru: "Культура личности",
              text_uz: "Shaxs madaniyati",
              why_wrong_en:
                "Person culture exists to serve the individuals within it (e.g. a partnership of professionals); there is no dominant central controller.",
              why_wrong_ru:
                "Культура личности существует ради входящих в неё людей (например, партнёрство профессионалов); единого доминирующего центра нет.",
              why_wrong_uz:
                "Shaxs madaniyati o'z ichidagi shaxslarga xizmat qilish uchun mavjud (masalan, mutaxassislar shirkati); unda hukmron markaziy nazoratchi yo'q.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Power culture (often drawn as a web) concentrates control on a single central figure or small group. Decisions are fast, but quality depends heavily on the centre.",
          explanation_ru:
            "Культура власти (часто изображается как паутина) концентрирует контроль на одной центральной фигуре или малой группе. Решения принимаются быстро, но их качество сильно зависит от центра.",
          explanation_uz:
            "Hokimiyat madaniyati (ko'pincha to'r shaklida tasvirlanadi) nazoratni yagona markaziy shaxs yoki kichik guruhga jamlaydi. Qarorlar tez, ammo sifat ko'p jihatdan markazga bog'liq.",
        },
        // -------- existing Q4 (augmented) --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en: "The primary role of a non-executive director is to:",
          prompt_ru:
            "Основная роль независимого (неисполнительного) директора состоит в том, чтобы:",
          prompt_uz:
            "Ijroiya bo'lmagan direktorning asosiy roli quyidagidan iborat:",
          options: [
            {
              key: "A",
              text_en: "Run day-to-day operations",
              text_ru: "Управлять повседневной деятельностью",
              text_uz: "Kundalik operatsiyalarni boshqarish",
              why_wrong_en:
                "Running operations is the role of executive directors; NEDs are deliberately kept outside daily management.",
              why_wrong_ru:
                "Текущее управление - задача исполнительных директоров; NED намеренно держат в стороне от повседневного управления.",
              why_wrong_uz:
                "Operatsiyalarni boshqarish - ijroiya direktorlarning roli; NEDlar esa ataylab kundalik boshqaruvdan chetda saqlanadi.",
            },
            {
              key: "B",
              text_en: "Provide independent challenge to executive decisions",
              text_ru:
                "Обеспечивать независимый контроль решений исполнительных директоров",
              text_uz: "Ijroiya qarorlariga mustaqil tanqid bildirish",
            },
            {
              key: "C",
              text_en: "Approve all minor expenses",
              text_ru: "Утверждать все мелкие расходы",
              text_uz: "Barcha mayda xarajatlarni tasdiqlash",
              why_wrong_en:
                "Approval of operational expenses is a management function, not a board oversight function.",
              why_wrong_ru:
                "Утверждение операционных расходов - управленческая функция, а не функция надзора со стороны совета.",
              why_wrong_uz:
                "Operatsion xarajatlarni tasdiqlash - boshqaruv funksiyasi, kengashning nazorat funksiyasi emas.",
            },
            {
              key: "D",
              text_en: "Manage individual employees",
              text_ru: "Управлять отдельными сотрудниками",
              text_uz: "Alohida xodimlarni boshqarish",
              why_wrong_en:
                "Line management of employees is an executive function; NEDs operate at board level.",
              why_wrong_ru:
                "Линейное управление сотрудниками - исполнительная функция; NED работают на уровне совета.",
              why_wrong_uz:
                "Xodimlarni chiziqli boshqarish - ijroiya funksiyasi; NEDlar esa kengash darajasida ishlaydi.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Non-executive directors are not involved in day-to-day management. Their value is independent oversight, challenging strategy, scrutinising performance, and contributing to board committees such as audit and remuneration.",
          explanation_ru:
            "Неисполнительные директора не участвуют в повседневном управлении. Их ценность - независимый надзор, оспаривание стратегии, контроль показателей и работа в комитетах совета (аудит, вознаграждения).",
          explanation_uz:
            "Ijroiya bo'lmagan direktorlar kundalik boshqaruvga aralashmaydi. Ularning qiymati - mustaqil nazorat, strategiyani tanqid qilish, faoliyatni o'rganish va audit hamda mukofotlash kabi kengash qo'mitalarida ishtirok etishdir.",
        },
        // -------- existing Q5 (augmented) --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            'Under the UK Corporate Governance Code, the principle of "comply or explain" means a company must:',
          prompt_ru:
            'Согласно британскому Кодексу корпоративного управления, принцип "соблюдай или объясни" означает, что компания должна:',
          prompt_uz:
            'Buyuk Britaniya Korporativ Boshqaruv Kodeksiga ko\'ra, "rioya qil yoki tushuntir" tamoyili kompaniyadan quyidagini talab qiladi:',
          options: [
            {
              key: "A",
              text_en: "Comply with every provision without exception",
              text_ru: "Соблюдать каждое положение без исключений",
              text_uz: "Har bir qoidaga istisnosiz rioya qilish",
              why_wrong_en:
                "The Code is principles-based, not mandatory - strict compliance with every provision is not required.",
              why_wrong_ru:
                "Кодекс основан на принципах, а не обязателен - строгое соблюдение каждого положения не требуется.",
              why_wrong_uz:
                "Kodeks majburiy emas, tamoyillarga asoslangan - har bir qoidaga qat'iy rioya qilish talab etilmaydi.",
            },
            {
              key: "B",
              text_en:
                "Either comply with provisions or disclose and explain departures from them",
              text_ru:
                "Либо соблюдать положения, либо раскрывать и объяснять отступления от них",
              text_uz:
                "Yo qoidalarga rioya qilish, yoki ulardan chetga chiqishni oshkor qilib, sababini tushuntirish",
            },
            {
              key: "C",
              text_en: "Explain its strategy to shareholders quarterly",
              text_ru: "Ежеквартально объяснять акционерам свою стратегию",
              text_uz:
                "Aksiyadorlarga strategiyasini har chorakda tushuntirish",
              why_wrong_en:
                'Quarterly strategy disclosure is unrelated to "comply or explain"; the Code is about governance practices, not strategy reporting frequency.',
              why_wrong_ru:
                "Ежеквартальное раскрытие стратегии не связано с принципом «соблюдай или объясни»; Кодекс касается практик управления, а не частоты раскрытия стратегии.",
              why_wrong_uz:
                'Choraklik strategiya oshkorligi "rioya qil yoki tushuntir" tamoyiliga aloqasi yo\'q; Kodeks strategiya hisoboti chastotasi haqida emas, boshqaruv amaliyotlari haqidadir.',
            },
            {
              key: "D",
              text_en: "Comply only with provisions that affect profit",
              text_ru: "Соблюдать только положения, влияющие на прибыль",
              text_uz: "Faqat foydaga ta'sir qiluvchi qoidalarga rioya qilish",
              why_wrong_en:
                "There is no profit-based filter in the Code - every provision is in scope for either compliance or explanation.",
              why_wrong_ru:
                "В Кодексе нет фильтра по прибыли - каждое положение подлежит либо соблюдению, либо объяснению.",
              why_wrong_uz:
                "Kodeksda foydaga asoslangan filtr yo'q - har bir qoida yo rioya qilish, yo tushuntirish doirasiga kiradi.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "The Code is principles-based: companies may deviate from specific provisions, but they must explain their reasons in the annual report. This balances flexibility with accountability.",
          explanation_ru:
            "Кодекс основан на принципах: компании могут отступать от конкретных положений, но обязаны объяснить причины в годовом отчёте. Это сочетает гибкость и подотчётность.",
          explanation_uz:
            "Kodeks tamoyillarga asoslangan: kompaniyalar muayyan qoidalardan chetga chiqishi mumkin, ammo sabablarini yillik hisobotda tushuntirishi shart. Bu moslashuvchanlik bilan javobgarlikni muvozanatlaydi.",
        },
        // -------- NEW Q6 - easy MCQ on functional structure --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "An organisation grouped into departments such as Finance, Marketing, Production, and HR has which type of structure?",
          prompt_ru:
            "Организация, разделённая на отделы вроде Финансы, Маркетинг, Производство и HR, имеет какой тип структуры?",
          prompt_uz:
            "Moliya, Marketing, Ishlab chiqarish va Kadrlar kabi bo'limlarga guruhlangan tashkilot qaysi turdagi tuzilmaga ega?",
          options: [
            {
              key: "A",
              text_en: "Divisional",
              text_ru: "Дивизиональная",
              text_uz: "Divizional",
              why_wrong_en:
                "Divisional structures group by product, region, or customer - not by specialism.",
              why_wrong_ru:
                "Дивизиональные структуры группируют по продукту, региону или клиенту, а не по специализации.",
              why_wrong_uz:
                "Divizional tuzilmalar mutaxassislik bo'yicha emas, balki mahsulot, mintaqa yoki mijoz bo'yicha guruhlaydi.",
            },
            {
              key: "B",
              text_en: "Functional",
              text_ru: "Функциональная",
              text_uz: "Funksional",
            },
            {
              key: "C",
              text_en: "Matrix",
              text_ru: "Матричная",
              text_uz: "Matritsa",
              why_wrong_en:
                "Matrix structures combine functional AND project/product reporting - a single specialism-only grouping is not matrix.",
              why_wrong_ru:
                "Матричные структуры сочетают функциональное И проектное/продуктовое подчинение; группировка только по специализации - не матрица.",
              why_wrong_uz:
                "Matritsa tuzilmalari funksional VA loyiha/mahsulot bo'ysunishini birlashtiradi - faqat mutaxassislik bo'yicha yagona guruhlash matritsa emas.",
            },
            {
              key: "D",
              text_en: "Geographic",
              text_ru: "Географическая",
              text_uz: "Geografik",
              why_wrong_en:
                "Geographic structures group by location (e.g. Europe, Asia, Americas), not by specialism.",
              why_wrong_ru:
                "Географические структуры группируют по местоположению (например, Европа, Азия, Америки), а не по специализации.",
              why_wrong_uz:
                "Geografik tuzilmalar mutaxassislik bo'yicha emas, balki joylashuv bo'yicha guruhlaydi (masalan, Yevropa, Osiyo, Amerika).",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "A functional structure groups employees by the specialist work they do. It promotes deep expertise and economies of scale within each function but can create silos and slow cross-functional decision-making.",
          explanation_ru:
            "Функциональная структура группирует сотрудников по выполняемой ими специализированной работе. Она способствует глубокой экспертизе и эффекту масштаба внутри каждой функции, но создаёт «силосы» и замедляет межфункциональные решения.",
          explanation_uz:
            "Funksional tuzilma xodimlarni bajaradigan mutaxassis ishi bo'yicha guruhlaydi. U har bir funksiya ichida chuqur tajriba va ko'lam tejamkorligini rag'batlantiradi, ammo \"silos\" (ajralib qolish) hosil qilishi va funksiyalararo qaror qabul qilishni sekinlashtirishi mumkin.",
        },
        // -------- NEW Q7 - easy MCQ on span of control --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en: "A WIDE span of control typically results in:",
          prompt_ru: "Широкая норма управляемости обычно приводит к:",
          prompt_uz: "KENG nazorat doirasi odatda quyidagiga olib keladi:",
          options: [
            {
              key: "A",
              text_en: "A tall organisational structure",
              text_ru: "Высокой организационной структуре",
              text_uz: "Baland tashkiliy tuzilma",
              why_wrong_en:
                "Wide spans REDUCE the number of management layers, producing FLAT structures, not tall ones.",
              why_wrong_ru:
                "Широкие нормы СОКРАЩАЮТ число уровней управления, создавая ПЛОСКИЕ структуры, а не высокие.",
              why_wrong_uz:
                "Keng doiralar boshqaruv qatlamlari sonini KAMAYTIRADI va baland emas, balki YASSI tuzilmalarni hosil qiladi.",
            },
            {
              key: "B",
              text_en: "A flat organisational structure",
              text_ru: "Плоской организационной структуре",
              text_uz: "Yassi tashkiliy tuzilma",
            },
            {
              key: "C",
              text_en: "Closer supervision of each subordinate",
              text_ru: "Более плотному надзору за каждым подчинённым",
              text_uz: "Har bir bo'ysunuvchini yaqindan nazorat qilish",
              why_wrong_en:
                "The opposite - with more subordinates per manager, less time can be spent on each.",
              why_wrong_ru:
                "Наоборот: при большем числе подчинённых на руководителя на каждого приходится меньше времени.",
              why_wrong_uz:
                "Aksincha - bir menejerga ko'proq bo'ysunuvchi to'g'ri kelsa, har biriga kamroq vaqt sarflanadi.",
            },
            {
              key: "D",
              text_en: "More middle management layers",
              text_ru: "Большему числу уровней среднего звена",
              text_uz: "Ko'proq o'rta boshqaruv qatlamlari",
              why_wrong_en:
                "More layers result from NARROW spans; wide spans reduce the need for middle managers.",
              why_wrong_ru:
                "Больше уровней появляется при УЗКОЙ норме управляемости; широкая норма сокращает потребность в среднем звене.",
              why_wrong_uz:
                "Ko'proq qatlamlar TOR doiralardan kelib chiqadi; keng doiralar esa o'rta menejerlarga bo'lgan ehtiyojni kamaytiradi.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "A wide span of control means each manager supervises many subordinates. This requires fewer management layers overall, producing a flat structure with faster communication but potentially less individual oversight.",
          explanation_ru:
            "Широкая норма управляемости означает, что каждый руководитель управляет многими подчинёнными. Это требует меньше уровней управления и даёт плоскую структуру с более быстрой коммуникацией, но потенциально менее плотным индивидуальным надзором.",
          explanation_uz:
            "Keng nazorat doirasi har bir menejer ko'plab bo'ysunuvchilarni nazorat qilishini bildiradi. Bu umuman kamroq boshqaruv qatlamlarini talab qiladi va tezroq aloqali, ammo har bir shaxs ustidan kamroq nazorat bo'lgan yassi tuzilmani hosil qiladi.",
        },
        // -------- NEW Q8 - easy short_answer on Schein --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "Schein describes organisational culture in three levels. What is the correct order from most visible to deepest?",
          prompt_ru:
            "Шейн описывает организационную культуру на трёх уровнях. Каков правильный порядок от наиболее видимого к самому глубокому?",
          prompt_uz:
            "Shein tashkiliy madaniyatni uch darajada ta'riflaydi. Eng ko'rinadigandan eng chuqurigacha to'g'ri tartib qaysi?",
          options: [
            {
              key: "A",
              text_en:
                "Artefacts → espoused values → basic underlying assumptions",
              text_ru:
                "Артефакты → провозглашаемые ценности → базовые подспудные предположения",
              text_uz:
                "Artefaktlar -> e'lon qilingan qadriyatlar -> asosiy taxminlar",
            },
            {
              key: "B",
              text_en:
                "Basic underlying assumptions → espoused values → artefacts",
              text_ru:
                "Базовые предположения → провозглашаемые ценности → артефакты",
              text_uz:
                "Asosiy taxminlar -> e'lon qilingan qadriyatlar -> artefaktlar",
              why_wrong_en:
                "This reverses the order. The deepest, least visible level (basic assumptions) is listed first, but the question asks most-visible first.",
              why_wrong_ru:
                "Это обратный порядок. Самый глубокий, наименее видимый уровень (базовые предположения) указан первым, тогда как вопрос требует начинать с наиболее видимого.",
              why_wrong_uz:
                "Bu tartibni teskari qiladi. Eng chuqur, eng kam ko'rinadigan daraja (asosiy taxminlar) birinchi keltirilgan, savol esa eng ko'rinadiganini birinchi so'raydi.",
            },
            {
              key: "C",
              text_en:
                "Espoused values → artefacts → basic underlying assumptions",
              text_ru:
                "Провозглашаемые ценности → артефакты → базовые предположения",
              text_uz:
                "E'lon qilingan qadriyatlar -> artefaktlar -> asosiy taxminlar",
              why_wrong_en:
                "Artefacts are the MOST visible level and must come first; espoused values sit between artefacts and assumptions.",
              why_wrong_ru:
                "Артефакты - наиболее видимый уровень и должны идти первыми; провозглашаемые ценности находятся между артефактами и предположениями.",
              why_wrong_uz:
                "Artefaktlar ENG ko'rinadigan daraja va birinchi kelishi kerak; e'lon qilingan qadriyatlar esa artefaktlar bilan taxminlar o'rtasida turadi.",
            },
            {
              key: "D",
              text_en:
                "Artefacts → basic underlying assumptions → espoused values",
              text_ru:
                "Артефакты → базовые предположения → провозглашаемые ценности",
              text_uz:
                "Artefaktlar -> asosiy taxminlar -> e'lon qilingan qadriyatlar",
              why_wrong_en:
                "Espoused values are the MIDDLE level, not the deepest; basic underlying assumptions are the deepest.",
              why_wrong_ru:
                "Провозглашаемые ценности - СРЕДНИЙ уровень, а не самый глубокий; базовые предположения - самый глубокий уровень.",
              why_wrong_uz:
                "E'lon qilingan qadriyatlar - O'RTA daraja, eng chuquri emas; asosiy taxminlar esa eng chuqur darajadir.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Artefacts are visible: dress, office layout, language, rituals. Espoused values are the strategies, goals and philosophies the organisation publicly states. Basic underlying assumptions are unconscious, taken-for-granted beliefs - the deepest level and hardest to change.",
          explanation_ru:
            "Артефакты видимы: дресс-код, планировка офиса, язык, ритуалы. Провозглашаемые ценности - это стратегии, цели и философия, заявляемые публично. Базовые подспудные предположения - неосознаваемые, само собой разумеющиеся убеждения; это самый глубокий и трудноизменяемый уровень.",
          explanation_uz:
            "Artefaktlar ko'rinadigan: kiyim, ofis tartibi, til, marosimlar. E'lon qilingan qadriyatlar - tashkilot ommaviy ravishda bildirgan strategiyalar, maqsadlar va falsafalar. Asosiy taxminlar esa ongsiz, o'z-o'zidan tushuniladigan e'tiqodlar - eng chuqur daraja va o'zgartirish eng qiyin bo'lgani.",
        },
        // -------- NEW Q9 - medium MCQ on Handy task culture --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A consultancy firm forms ad-hoc teams of specialists around each client engagement, dissolving them once the project completes. This BEST describes which Handy culture type?",
          prompt_ru:
            "Консалтинговая фирма формирует временные команды специалистов под каждый клиентский проект, распуская их по завершении. Какому типу культуры по Хэнди это ЛУЧШЕ всего соответствует?",
          prompt_uz:
            "Konsalting firmasi har bir mijoz loyihasi atrofida mutaxassislardan vaqtinchalik jamoalar tuzadi va loyiha tugagach ularni tarqatadi. Bu Handining qaysi madaniyat turini ENG TO'G'RI ta'riflaydi?",
          options: [
            {
              key: "A",
              text_en: "Power culture",
              text_ru: "Культура власти",
              text_uz: "Hokimiyat madaniyati",
              why_wrong_en:
                "Power culture centralises decisions on a founder/leader; the consultancy described uses dispersed expert teams.",
              why_wrong_ru:
                "Культура власти централизует решения на основателе/лидере; описанная фирма работает через распределённые экспертные команды.",
              why_wrong_uz:
                "Hokimiyat madaniyati qarorlarni asoschi/rahbarga jamlaydi; ta'riflangan konsalting firmasi esa taqsimlangan mutaxassis jamoalardan foydalanadi.",
            },
            {
              key: "B",
              text_en: "Role culture",
              text_ru: "Культура роли",
              text_uz: "Rol madaniyati",
              why_wrong_en:
                "Role culture is bureaucratic and rule-driven, with fixed job descriptions - incompatible with ad-hoc team formation.",
              why_wrong_ru:
                "Культура роли бюрократична и основана на правилах с фиксированными должностными инструкциями - несовместима с временным формированием команд.",
              why_wrong_uz:
                "Rol madaniyati byurokratik va qoidalarga asoslangan, qat'iy lavozim yo'riqnomalari bilan - vaqtinchalik jamoa tuzish bilan mos kelmaydi.",
            },
            {
              key: "C",
              text_en: "Task culture",
              text_ru: "Культура задачи",
              text_uz: "Vazifa madaniyati",
            },
            {
              key: "D",
              text_en: "Person culture",
              text_ru: "Культура личности",
              text_uz: "Shaxs madaniyati",
              why_wrong_en:
                "Person culture organises around individual professionals (e.g. partners in a law firm) without team coordination; here teams are explicitly formed.",
              why_wrong_ru:
                "Культура личности выстраивается вокруг отдельных профессионалов (например, партнёров в юрфирме) без координации в командах; здесь же команды формируются явно.",
              why_wrong_uz:
                "Shaxs madaniyati jamoa muvofiqlashtiruvisiz alohida mutaxassislar atrofida tashkillashadi (masalan, yuridik firmadagi sheriklar); bu yerda esa jamoalar aniq tuziladi.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "Task culture (often visualised as a net or matrix) brings together expertise for specific jobs, then disperses. Power lies with whoever has the knowledge needed at that moment. Project-based consultancies, R&D teams, and creative agencies typify this culture.",
          explanation_ru:
            "Культура задачи (часто визуализируется как сеть или матрица) объединяет экспертизу для конкретных задач, а затем распадается. Власть принадлежит тому, у кого есть нужные знания в данный момент. Проектные консалтинги, команды НИОКР и креативные агентства - типичные примеры.",
          explanation_uz:
            "Vazifa madaniyati (ko'pincha to'r yoki matritsa sifatida tasvirlanadi) muayyan ishlar uchun tajribani birlashtiradi, so'ng tarqatadi. Hokimiyat o'sha paytda kerakli bilimga ega bo'lgan kishiga tegishli. Loyihaga asoslangan konsalting firmalari, R&D jamoalari va ijodiy agentliklar shu madaniyatga xosdir.",
        },
        // -------- NEW Q10 - medium MCQ on technostructure --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "In Mintzberg\u2019s model, which component is responsible for standardising work processes through analysis and procedures?",
          prompt_ru:
            "В модели Минцберга какой элемент отвечает за стандартизацию рабочих процессов через анализ и процедуры?",
          prompt_uz:
            "Mintzberg modelida qaysi tarkibiy qism tahlil va protseduralar orqali ish jarayonlarini standartlashtirish uchun mas'ul?",
          options: [
            {
              key: "A",
              text_en: "Strategic apex",
              text_ru: "Стратегическая вершина",
              text_uz: "Strategik cho'qqi",
              why_wrong_en:
                "The strategic apex sets direction and makes major decisions; it does not standardise day-to-day work processes.",
              why_wrong_ru:
                "Стратегическая вершина задаёт направление и принимает крупные решения; она не занимается стандартизацией повседневных процессов.",
              why_wrong_uz:
                "Strategik cho'qqi yo'nalish belgilaydi va asosiy qarorlar qabul qiladi; u kundalik ish jarayonlarini standartlashtirmaydi.",
            },
            {
              key: "B",
              text_en: "Middle line",
              text_ru: "Средняя линия",
              text_uz: "O'rta bo'g'in",
              why_wrong_en:
                "The middle line transmits decisions between apex and operating core; standardisation is the technostructure's role.",
              why_wrong_ru:
                "Средняя линия передаёт решения между вершиной и операционным ядром; стандартизация - задача техноструктуры.",
              why_wrong_uz:
                "O'rta bo'g'in cho'qqi va operatsion yadro o'rtasida qarorlarni uzatadi; standartlashtirish esa texnostrukturaning rolidir.",
            },
            {
              key: "C",
              text_en: "Technostructure",
              text_ru: "Техноструктура",
              text_uz: "Texnostruktura",
            },
            {
              key: "D",
              text_en: "Support staff",
              text_ru: "Вспомогательный персонал",
              text_uz: "Yordamchi xodimlar",
              why_wrong_en:
                "Support staff (legal, catering, IT) provide ancillary services - they do not design work processes.",
              why_wrong_ru:
                "Вспомогательный персонал (юристы, кейтеринг, ИТ) оказывает вспомогательные услуги - они не проектируют рабочие процессы.",
              why_wrong_uz:
                "Yordamchi xodimlar (huquq, ovqatlantirish, IT) yordamchi xizmatlarni ko'rsatadi - ular ish jarayonlarini loyihalashtirmaydi.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "The technostructure is made up of analysts - management accountants, work-study engineers, HR policy designers, quality control specialists - whose job is to standardise what others do. They shape the procedures the operating core follows.",
          explanation_ru:
            "Техноструктура состоит из аналитиков - управленческих бухгалтеров, инженеров по нормированию труда, разработчиков HR-политик, специалистов по контролю качества, - задача которых стандартизировать работу других. Они формируют процедуры, которым следует операционное ядро.",
          explanation_uz:
            "Texnostruktura tahlilchilardan iborat - boshqaruv buxgalterlari, mehnatni o'rganish muhandislari, kadrlar siyosatini ishlab chiquvchilar, sifat nazorati mutaxassislari - ularning vazifasi boshqalar qiladigan ishni standartlashtirishdir. Ular operatsion yadro amal qiladigan protseduralarni shakllantiradi.",
        },
        // -------- NEW Q11 - medium MCQ on decentralisation --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A multinational retailer gives each country\u2019s management full authority over pricing, product range, and marketing. The MAIN risk of this decentralisation is:",
          prompt_ru:
            "Транснациональный ретейлер предоставляет менеджменту каждой страны полную власть над ценообразованием, ассортиментом и маркетингом. ГЛАВНЫЙ риск такой децентрализации:",
          prompt_uz:
            "Transmilliy chakana sotuvchi har bir mamlakat boshqaruviga narx, mahsulot turkumi va marketing bo'yicha to'liq vakolat beradi. Bu markazlashtirmaslikning ASOSIY xavfi:",
          options: [
            {
              key: "A",
              text_en: "Slow response to local market conditions",
              text_ru: "Медленный отклик на местные рыночные условия",
              text_uz: "Mahalliy bozor sharoitlariga sekin javob berish",
              why_wrong_en:
                "The opposite - decentralisation typically SPEEDS local response; the trade-off lies elsewhere.",
              why_wrong_ru:
                "Наоборот - децентрализация обычно УСКОРЯЕТ местный отклик; компромисс лежит в другом.",
              why_wrong_uz:
                "Aksincha - markazlashtirmaslik odatda mahalliy javobni TEZLASHTIRADI; murosa esa boshqa joyda.",
            },
            {
              key: "B",
              text_en: "Inconsistent brand image and customer experience",
              text_ru: "Непоследовательный имидж бренда и клиентский опыт",
              text_uz:
                "Bir-biriga mos kelmaydigan brend qiyofasi va mijoz tajribasi",
            },
            {
              key: "C",
              text_en: "Over-reliance on head office decision-making",
              text_ru: "Чрезмерная зависимость от решений головного офиса",
              text_uz:
                "Bosh ofis qaror qabul qilishiga haddan tashqari bog'liqlik",
              why_wrong_en:
                "Decentralisation REDUCES dependence on head office; this would be the risk of centralisation, not decentralisation.",
              why_wrong_ru:
                "Децентрализация СНИЖАЕТ зависимость от головного офиса; это риск централизации, а не децентрализации.",
              why_wrong_uz:
                "Markazlashtirmaslik bosh ofisga bog'liqlikni KAMAYTIRADI; bu esa markazlashtirmaslikning emas, markazlashtirishning xavfi bo'lardi.",
            },
            {
              key: "D",
              text_en: "Loss of local market knowledge",
              text_ru: "Потеря знаний о местных рынках",
              text_uz: "Mahalliy bozor bilimini yo'qotish",
              why_wrong_en:
                "Decentralisation USES local market knowledge; centralisation is more likely to lose it.",
              why_wrong_ru:
                "Децентрализация ИСПОЛЬЗУЕТ знания о местных рынках; их скорее теряет централизация.",
              why_wrong_uz:
                "Markazlashtirmaslik mahalliy bozor bilimidan FOYDALANADI; markazlashtirish esa uni yo'qotishi ehtimoli ko'proq.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Decentralisation's strength - local autonomy - is also its weakness: each country may optimise locally in ways that fragment the brand. Customers travelling between countries see different prices, different products, and different advertising, which can dilute brand equity. The challenge is balancing autonomy with group-level consistency.",
          explanation_ru:
            "Сила децентрализации - местная автономия - является и её слабостью: каждая страна оптимизирует локально, фрагментируя бренд. Клиенты, путешествующие между странами, видят разные цены, разные ассортименты и разную рекламу, что размывает капитал бренда. Задача - баланс автономии и групповой согласованности.",
          explanation_uz:
            "Markazlashtirmaslikning kuchi - mahalliy mustaqillik - ayni paytda uning zaifligidir: har bir mamlakat brendni parchalaydigan tarzda mahalliy darajada optimallashtirishi mumkin. Mamlakatlar orasida sayohat qiluvchi mijozlar turli narxlar, turli mahsulotlar va turli reklamalarni ko'radi, bu esa brend qiymatini susaytirishi mumkin. Vazifa - mustaqillikni guruh darajasidagi izchillik bilan muvozanatlashdir.",
        },
        // -------- NEW Q12 - medium MCQ on remuneration committee --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "The primary purpose of a board\u2019s remuneration committee is to:",
          prompt_ru: "Основное назначение комитета совета по вознаграждениям:",
          prompt_uz:
            "Kengash mukofotlash qo'mitasining asosiy maqsadi quyidagidan iborat:",
          options: [
            {
              key: "A",
              text_en: "Determine pay for all employees of the company",
              text_ru: "Определять оплату всех сотрудников компании",
              text_uz: "Kompaniyaning barcha xodimlari uchun maoshni belgilash",
              why_wrong_en:
                "The committee deals only with executive director compensation, not company-wide pay.",
              why_wrong_ru:
                "Комитет занимается только вознаграждением исполнительных директоров, а не оплатой по всей компании.",
              why_wrong_uz:
                "Qo'mita kompaniya bo'ylab maosh bilan emas, faqat ijroiya direktorlar mukofoti bilan shug'ullanadi.",
            },
            {
              key: "B",
              text_en:
                "Set executive director remuneration independently of those receiving it",
              text_ru:
                "Устанавливать вознаграждение исполнительных директоров независимо от получателей",
              text_uz:
                "Ijroiya direktorlar mukofotini, uni oluvchilardan mustaqil ravishda belgilash",
            },
            {
              key: "C",
              text_en: "Approve the company\u2019s dividend policy",
              text_ru: "Утверждать дивидендную политику компании",
              text_uz: "Kompaniyaning dividend siyosatini tasdiqlash",
              why_wrong_en:
                "Dividend policy is a board-level decision, not a remuneration committee matter.",
              why_wrong_ru:
                "Дивидендная политика - решение совета в целом, а не комитета по вознаграждениям.",
              why_wrong_uz:
                "Dividend siyosati - kengash darajasidagi qaror, mukofotlash qo'mitasi masalasi emas.",
            },
            {
              key: "D",
              text_en: "Manage day-to-day payroll operations",
              text_ru: "Управлять текущей выплатой заработной платы",
              text_uz: "Kundalik ish haqi operatsiyalarini boshqarish",
              why_wrong_en:
                "Payroll is an operational HR/finance function; the committee operates at board level only.",
              why_wrong_ru:
                "Расчёт заработной платы - операционная функция HR/финансов; комитет работает только на уровне совета.",
              why_wrong_uz:
                "Ish haqi - operatsion kadrlar/moliya funksiyasi; qo'mita esa faqat kengash darajasida ishlaydi.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "The remuneration committee is composed of independent non-executive directors precisely so that executive pay is set by people who do not benefit from it. This avoids the obvious conflict of executives setting their own pay and ties remuneration to performance criteria the NEDs approve.",
          explanation_ru:
            "Комитет по вознаграждениям состоит из независимых неисполнительных директоров именно для того, чтобы оплату исполнительных директоров устанавливали те, кто её не получает. Это устраняет очевидный конфликт интересов и связывает вознаграждение с критериями эффективности, утверждаемыми NED.",
          explanation_uz:
            "Mukofotlash qo'mitasi aynan mustaqil ijroiya bo'lmagan direktorlardan tashkil topadi, shunda ijroiya rahbarlar maoshi undan manfaat ko'rmaydigan kishilar tomonidan belgilanadi. Bu rahbarlarning o'z maoshini o'zi belgilashidagi aniq manfaatlar to'qnashuvidan qochadi va mukofotni NEDlar tasdiqlagan faoliyat mezonlariga bog'laydi.",
        },
        // -------- NEW Q13 - medium short_answer on CEO/Chairman --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "Why does best practice in corporate governance recommend separating the roles of CEO and Chairman?",
          prompt_ru:
            "Почему передовая практика корпоративного управления рекомендует разделять роли генерального директора и председателя совета директоров?",
          prompt_uz:
            "Nega korporativ boshqaruvdagi eng yaxshi amaliyot bosh direktor (CEO) va Rais rollarini ajratishni tavsiya qiladi?",
          options: [
            {
              key: "A",
              text_en:
                "To avoid an excessive concentration of power and ensure independent board oversight of the executive",
              text_ru:
                "Чтобы избежать чрезмерной концентрации власти и обеспечить независимый надзор совета за исполнительным руководством",
              text_uz:
                "Hokimiyatning haddan tashqari jamlanishidan qochish va ijroiya ustidan mustaqil kengash nazoratini ta'minlash uchun",
            },
            {
              key: "B",
              text_en: "To reduce the company's salary costs",
              text_ru: "Чтобы сократить расходы компании на заработную плату",
              text_uz: "Kompaniyaning maosh xarajatlarini kamaytirish uchun",
              why_wrong_en:
                "Separation is about governance checks and balances, not cost saving - indeed it usually means paying two senior individuals.",
              why_wrong_ru:
                "Разделение касается системы сдержек и противовесов в управлении, а не экономии - обычно это означает оплату двух руководителей.",
              why_wrong_uz:
                "Ajratish xarajatni tejash haqida emas, balki boshqaruv nazorati va muvozanati haqida - aksincha, u odatda ikki nafar yuqori rahbarga to'lashni anglatadi.",
            },
            {
              key: "C",
              text_en:
                "Because company law makes it illegal for one person to hold both roles",
              text_ru:
                "Потому что закон запрещает одному лицу занимать обе должности",
              text_uz:
                "Chunki kompaniya qonuni bir shaxsning ikkala rolni egallashini noqonuniy qiladi",
              why_wrong_en:
                'In most jurisdictions combining the roles is discouraged by governance codes ("comply or explain"), not outlawed by statute.',
              why_wrong_ru:
                "В большинстве юрисдикций совмещение ролей не поощряется кодексами управления («соблюдай или объясни»), но не запрещено законом.",
              why_wrong_uz:
                'Ko\'pchilik yurisdiktsiyalarda rollarni birlashtirish qonun bilan taqiqlanmagan, balki boshqaruv kodekslari tomonidan tavsiya etilmaydi ("rioya qil yoki tushuntir").',
            },
            {
              key: "D",
              text_en: "To speed up executive decision-making",
              text_ru: "Чтобы ускорить принятие исполнительных решений",
              text_uz: "Ijroiya qaror qabul qilishni tezlashtirish uchun",
              why_wrong_en:
                "Separation adds a check on the executive; if anything it slows unilateral decisions - that oversight is the point.",
              why_wrong_ru:
                "Разделение добавляет контроль над исполнительной властью; если что, оно замедляет единоличные решения - именно в этом надзоре и смысл.",
              why_wrong_uz:
                "Ajratish ijroiyaga nazorat qo'shadi; agar nimadir bo'lsa, u bir tomonlama qarorlarni sekinlashtiradi - aynan shu nazorat asosiy maqsaddir.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "If one person held both roles they would effectively oversee themselves - running the executive AND chairing the board that holds the executive to account. Separation provides a check on executive power, ensures balanced board discussion, and gives shareholders an independent point of contact.",
          explanation_ru:
            "Если бы одно лицо занимало обе роли, оно фактически контролировало бы само себя - руководя исполнительным звеном И возглавляя совет, который этот менеджмент контролирует. Разделение обеспечивает сдерживание исполнительной власти, сбалансированное обсуждение в совете и даёт акционерам независимую точку контакта.",
          explanation_uz:
            "Agar bir shaxs ikkala rolni ham egallasa, u amalda o'zini o'zi nazorat qilgan bo'lardi - ham ijroiyani boshqarib, HAM ijroiyani javobgar tutadigan kengashga raislik qilib. Ajratish ijroiya hokimiyatiga nazoratni ta'minlaydi, muvozanatli kengash muhokamasini kafolatlaydi va aksiyadorlarga mustaqil aloqa nuqtasini beradi.",
        },
        // -------- NEW Q14 - hard MCQ on Mintzberg skills vs Fayol --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            'A student writes that "managers must plan, organise, command, coordinate and control". This list reflects the work of:',
          prompt_ru:
            "Студент пишет, что «менеджеры должны планировать, организовывать, распоряжаться, координировать и контролировать». Этот перечень отражает работу:",
          prompt_uz:
            'Talaba "menejerlar rejalashtirishi, tashkil etishi, buyruq berishi, muvofiqlashtirishi va nazorat qilishi kerak" deb yozadi. Bu ro\'yxat kimning ishini aks ettiradi:',
          options: [
            {
              key: "A",
              text_en: "Mintzberg",
              text_ru: "Минцберга",
              text_uz: "Mintzberg",
              why_wrong_en:
                "Mintzberg identified TEN managerial skills (interpersonal, informational, decisional) - not the five classical functions listed.",
              why_wrong_ru:
                "Минцберг выделил ДЕСЯТЬ управленческих навыков (межличностные, информационные, решенческие), а не пять классических функций.",
              why_wrong_uz:
                "Mintzberg o'nta boshqaruv mahoratini aniqlagan (shaxslararo, axborotga oid, qaror qabul qilishga oid) - sanab o'tilgan beshta klassik funksiyani emas.",
            },
            { key: "B", text_en: "Fayol", text_ru: "Файоля", text_uz: "Fayol" },
            {
              key: "C",
              text_en: "Handy",
              text_ru: "Хэнди",
              text_uz: "Handi",
              why_wrong_en:
                "Handy is associated with culture types (power, role, task, person), not with classical management functions.",
              why_wrong_ru:
                "Хэнди связан с типами культуры (власти, роли, задачи, личности), а не с классическими функциями менеджмента.",
              why_wrong_uz:
                "Handi madaniyat turlari (hokimiyat, rol, vazifa, shaxs) bilan bog'liq, klassik boshqaruv funksiyalari bilan emas.",
            },
            {
              key: "D",
              text_en: "Schein",
              text_ru: "Шейна",
              text_uz: "Shein",
              why_wrong_en:
                "Schein's work is on organisational culture (three levels), not the functions of management.",
              why_wrong_ru:
                "Работа Шейна - об организационной культуре (три уровня), а не о функциях менеджмента.",
              why_wrong_uz:
                "Sheinning ishi tashkiliy madaniyat (uch daraja) haqida, boshqaruv funksiyalari haqida emas.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Henri Fayol\u2019s five classical functions of management - Plan, Organise, Command, Coordinate, Control (POCCC) - date from 1916 and remain a foundational framework. The trick on this question is that students often confuse Fayol's functions with Mintzberg's ten skills; both describe what managers do, but at different levels of abstraction.",
          explanation_ru:
            "Пять классических функций менеджмента Анри Файоля - Планирование, Организация, Распорядительство, Координация, Контроль (POCCC) - сформулированы в 1916 году и остаются базовой моделью. Ловушка вопроса в том, что студенты часто путают функции Файоля с десятью навыками Минцберга; оба описывают, что делают менеджеры, но на разных уровнях абстракции.",
          explanation_uz:
            "Anri Fayolning beshta klassik boshqaruv funksiyasi - Rejalashtirish, Tashkil etish, Buyruq berish, Muvofiqlashtirish, Nazorat (POCCC) - 1916-yilga borib taqaladi va asosiy doira bo'lib qolmoqda. Bu savolning hiylasi shundaki, talabalar ko'pincha Fayol funksiyalarini Mintzbergning o'nta mahorati bilan adashtiradi; ikkalasi ham menejerlar nima qilishini ta'riflaydi, ammo turli abstraksiya darajalarida.",
        },
        // -------- NEW Q15 - hard MCQ on structure choice scenario --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            "A pharmaceutical company operates in 30 countries, sells across 5 distinct therapeutic areas (oncology, cardiovascular, etc.), and must comply with local drug regulation in each market. Which structure BEST balances these competing demands?",
          prompt_ru:
            "Фармацевтическая компания работает в 30 странах, продаёт в 5 различных терапевтических областях (онкология, кардиология и др.) и обязана соблюдать местное лекарственное регулирование в каждом рынке. Какая структура ЛУЧШЕ всего балансирует эти конкурирующие требования?",
          prompt_uz:
            "Farmatsevtika kompaniyasi 30 ta mamlakatda faoliyat yuritadi, 5 ta alohida terapevtik sohada (onkologiya, kardiologiya va h.k.) sotadi va har bir bozorda mahalliy dori tartibga solinishiga rioya qilishi shart. Qaysi tuzilma bu raqobatlashuvchi talablarni ENG TO'G'RI muvozanatlaydi?",
          options: [
            {
              key: "A",
              text_en: "Pure functional structure",
              text_ru: "Чисто функциональная структура",
              text_uz: "Sof funksional tuzilma",
              why_wrong_en:
                "Functional alone cannot address the dual demands of therapeutic specialism AND country-specific regulation simultaneously.",
              why_wrong_ru:
                "Функциональная сама по себе не может одновременно обслуживать требования терапевтической специализации И странового регулирования.",
              why_wrong_uz:
                "Funksional tuzilmaning o'zi terapevtik mutaxassislik VA mamlakatga xos tartibga solishning ikki tomonlama talablarini bir vaqtda hal qila olmaydi.",
            },
            {
              key: "B",
              text_en: "Pure geographic structure by country",
              text_ru: "Чисто географическая структура по странам",
              text_uz: "Mamlakat bo'yicha sof geografik tuzilma",
              why_wrong_en:
                "Geographic alone would lose the deep therapeutic-area expertise needed for drug development and global pricing.",
              why_wrong_ru:
                "Чисто географическая утратит глубокую экспертизу в терапевтических областях, нужную для разработки и глобального ценообразования.",
              why_wrong_uz:
                "Geografik tuzilmaning o'zi dori ishlab chiqarish va global narx belgilash uchun zarur bo'lgan chuqur terapevtik soha tajribasini yo'qotadi.",
            },
            {
              key: "C",
              text_en:
                "Matrix structure combining therapeutic area and geography",
              text_ru:
                "Матричная структура, сочетающая терапевтическую область и географию",
              text_uz:
                "Terapevtik soha va geografiyani birlashtiruvchi matritsa tuzilmasi",
            },
            {
              key: "D",
              text_en: "Entrepreneurial structure centred on the CEO",
              text_ru: "Предпринимательская структура с центром в CEO",
              text_uz:
                "Bosh direktor (CEO) atrofida qurilgan tadbirkorlik tuzilmasi",
              why_wrong_en:
                "Entrepreneurial structures suit small, early-stage organisations; a 30-country firm with 5 therapeutic areas is far too complex.",
              why_wrong_ru:
                "Предпринимательские структуры подходят малым организациям на ранней стадии; компания в 30 странах с 5 терапевтическими областями слишком сложна.",
              why_wrong_uz:
                "Tadbirkorlik tuzilmalari kichik, dastlabki bosqichdagi tashkilotlarga mos keladi; 5 ta terapevtik sohaga ega 30 mamlakatli firma esa juda murakkab.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "A matrix lets staff report into BOTH a therapeutic-area head (who owns deep product expertise, global strategy, R&D portfolio) AND a country manager (who owns local regulation, pricing, key-account relationships). The cost is the well-known matrix burden: dual reporting, slower decisions, and potential conflicts between the two axes. For this kind of complex multi-dimensional business, that trade-off is usually worth it.",
          explanation_ru:
            "Матрица позволяет сотрудникам подчиняться И руководителю терапевтической области (отвечает за глубокую продуктовую экспертизу, глобальную стратегию, портфель НИОКР), И страновому менеджеру (отвечает за местное регулирование, ценообразование, отношения с ключевыми клиентами). Цена - известная нагрузка матрицы: двойное подчинение, более медленные решения, возможные конфликты между двумя осями. Для такого многомерного бизнеса этот компромисс обычно оправдан.",
          explanation_uz:
            "Matritsa xodimlarga HAM terapevtik soha rahbariga (chuqur mahsulot tajribasi, global strategiya, R&D portfeliga egalik qiladi), HAM mamlakat menejeriga (mahalliy tartibga solish, narx, asosiy mijoz munosabatlariga egalik qiladi) bo'ysunish imkonini beradi. Buning narxi - taniqli matritsa yuki: ikki tomonlama bo'ysunish, sekinroq qarorlar va ikki o'q o'rtasidagi mumkin bo'lgan ziddiyatlar. Bunday murakkab, ko'p o'lchovli biznes uchun bu murosa odatda arziydi.",
        },
      ],
    },
    // ---------- C ----------
    {
      code: "C",
      title_en: "Accounting and reporting systems, controls and compliance",
      title_ru:
        "Учётные и отчётные системы, контроль и соответствие требованиям",
      title_uz:
        "Buxgalteriya va hisobot tizimlari, nazorat va talablarga rioya qilish",
      description_en:
        "Internal controls, audit, risk, fraud, money laundering, and data protection.",
      description_ru:
        "Внутренний контроль, аудит, риски, мошенничество, противодействие отмыванию и защита данных.",
      description_uz:
        "Ichki nazorat, audit, xavf, firibgarlik, pul yuvish va ma'lumotlarni himoya qilish.",
      sort_order: 30,
      theory_en:
        "Internal controls are policies, procedures and checks designed to safeguard assets, produce reliable records, and ensure compliance with laws and policies. Controls are classified by purpose: preventive (stop errors before they happen - e.g. authorisation limits), detective (find errors after the fact - e.g. reconciliations), corrective (fix problems found - e.g. restoring backups), and compensating (substitute when a primary control isn't feasible). Key everyday controls include segregation of duties (no single person initiates, records, and approves a transaction), authorisation, physical safeguards over cash and inventory, and reconciliations between independent records.\n\n" +
        "Audit comes in two flavours. Internal audit is an in-house function evaluating risk and control effectiveness for the board. External audit is independent and gives an opinion on whether the financial statements show a true and fair view. The audit committee - composed of non-executive directors - oversees both, including auditor independence.\n\n" +
        "Risk management uses gross risk (before controls) and net or residual risk (after controls). The risk register documents identified risks, owners, scores, and treatments. The TARA framework picks a response: Transfer (insure, outsource), Avoid (don't do the risky activity), Reduce (controls), Accept (live with it - typical for low-impact risks).\n\n" +
        "The fraud triangle (Cressey) explains why fraud occurs: Pressure or motive (financial need, targets), Opportunity (weak controls, override of segregation), and Rationalisation or justification (the perpetrator's self-talk). Removing any side reduces fraud risk.\n\n" +
        "Money laundering follows three stages: Placement (dirty cash enters the system), Layering (transactions obscure the trail), and Integration (funds re-emerge looking legitimate). Firms must train staff, appoint a Money Laundering Reporting Officer (MLRO), and file suspicious activity reports. Data protection / GDPR principles cover lawful basis, purpose limitation, data minimisation, accuracy, storage limits, security, and accountability.",
      theory_ru:
        "Внутренний контроль - это политики, процедуры и проверки, призванные защитить активы, обеспечить достоверность учёта и соответствие законам и внутренним правилам. Контроли классифицируются по цели: превентивные (останавливают ошибку до её возникновения - например, лимиты на авторизацию), детективные (выявляют ошибки постфактум - например, сверки), корректирующие (устраняют выявленные проблемы - например, восстановление из резервной копии) и компенсирующие (заменяют основной контроль, когда тот невозможен). Ключевые повседневные контроли: разделение обязанностей (никто не инициирует, не учитывает и не утверждает операцию в одиночку), авторизация, физическая защита денег и запасов, сверки между независимыми регистрами.\n\n" +
        "Аудит бывает двух видов. Внутренний аудит - внутренняя функция, оценивающая риски и эффективность контроля в интересах совета. Внешний аудит - независимый и даёт мнение о достоверности финансовой отчётности. Аудиторский комитет - состоит из неисполнительных директоров - надзирает за обоими, включая независимость внешнего аудитора.\n\n" +
        "Управление рисками оперирует понятиями валового риска (до контролей) и чистого, или остаточного, риска (после). Реестр рисков фиксирует выявленные риски, их владельцев, оценки и меры реагирования. Модель TARA выбирает реакцию: Transfer - передать (страхование, аутсорсинг), Avoid - избежать (не вести рискованную деятельность), Reduce - снизить (контроли), Accept - принять (мириться - типично для рисков с малыми последствиями).\n\n" +
        "Треугольник мошенничества (Кресси) объясняет, почему совершается мошенничество: Давление или стимул (финансовая нужда, плановые показатели), Возможность (слабые контроли, обход разделения обязанностей) и Рационализация или оправдание (внутренняя логика самого нарушителя). Устранение любой из сторон снижает риск мошенничества.\n\n" +
        "Отмывание денег проходит три стадии: размещение (грязные наличные попадают в финансовую систему), расслоение (операции запутывают след) и интеграция (средства возвращаются под видом легальных). Компании обязаны обучать персонал, назначать Money Laundering Reporting Officer (MLRO) и подавать сообщения о подозрительных операциях. Принципы защиты данных и GDPR охватывают законность основания обработки, ограничение цели, минимизацию данных, точность, ограничение хранения, безопасность и подотчётность.",
      theory_uz:
        "Ichki nazorat - bu aktivlarni asrash, ishonchli yozuvlar yaratish va qonunlar hamda siyosatlarga rioya qilishni ta'minlash uchun mo'ljallangan siyosatlar, protseduralar va tekshiruvlar. Nazoratlar maqsadi bo'yicha tasniflanadi: oldini oluvchi (xatolar yuz berishidan oldin to'xtatadi - masalan, ruxsat berish chegaralari), aniqlovchi (xatolarni keyin topadi - masalan, solishtirishlar), tuzatuvchi (topilgan muammolarni hal qiladi - masalan, zaxira nusxalarni tiklash) va kompensatsiyalovchi (asosiy nazorat amalga oshmaganda o'rnini bosadi). Asosiy kundalik nazoratlarga vazifalarni ajratish (hech bir shaxs bitta operatsiyani boshlamasligi, yozmasligi va tasdiqlamasligi), ruxsat berish, naqd pul va tovar-moddiy zaxiralar ustidan jismoniy himoya hamda mustaqil yozuvlar o'rtasidagi solishtirishlar kiradi.\n\nAudit ikki turda bo'ladi. Ichki audit - kengash uchun xavf va nazorat samaradorligini baholovchi ichki funksiya. Tashqi audit - mustaqil bo'lib, moliyaviy hisobotlar haqqoniy va adolatli tasvirni ko'rsatishi yoki ko'rsatmasligi haqida fikr bildiradi. Audit qo'mitasi - ijroiya bo'lmagan direktorlardan iborat - ikkalasini ham, jumladan auditorning mustaqilligini nazorat qiladi.\n\nXavfni boshqarish yalpi xavf (nazoratlardan oldin) va sof yoki qoldiq xavf (nazoratlardan keyin) tushunchalaridan foydalanadi. Xavflar reyestri aniqlangan xavflarni, ularning egalari, ballari va choralarini hujjatlashtiradi. TARA doirasi javobni tanlaydi: O'tkazish (sug'urtalash, autsorsing), Qochish (xavfli faoliyatni qilmaslik), Kamaytirish (nazoratlar), Qabul qilish (u bilan yashash - past ta'sirli xavflar uchun odatiy).\n\nFiribgarlik uchburchagi (Kressi) firibgarlik nima uchun yuz berishini tushuntiradi: Bosim yoki sabab (moliyaviy ehtiyoj, maqsadlar), Imkoniyat (zaif nazoratlar, vazifalar ajratilishini chetlab o'tish) va Oqlash yoki asoslash (firibgarning o'z-o'ziga aytishi). Har qanday tomonni olib tashlash firibgarlik xavfini kamaytiradi.\n\nPul yuvish uch bosqichdan iborat: Joylashtirish (\"iflos\" naqd pul tizimga kiradi), Qatlamlash (operatsiyalar izni yashiradi) va Integratsiya (mablag'lar qonuniy ko'rinishda qayta paydo bo'ladi). Firmalar xodimlarni o'qitishi, Pul Yuvish Bo'yicha Hisobot Beruvchi Mas'ul Shaxsni (MLRO) tayinlashi va shubhali faoliyat to'g'risida hisobot topshirishi shart. Ma'lumotlarni himoya qilish / GDPR tamoyillari qonuniy asos, maqsad cheklovi, ma'lumotlarni minimallashtirish, aniqlik, saqlash muddatlari, xavfsizlik va javobgarlikni qamrab oladi.",
      questions: [
        // -------- existing Q1 (augmented) --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "Segregation of duties is an example of which type of internal control?",
          prompt_ru:
            "Разделение обязанностей является примером какого типа внутреннего контроля?",
          prompt_uz:
            "Vazifalarni ajratish qaysi turdagi ichki nazoratga misol bo'ladi?",
          options: [
            {
              key: "A",
              text_en: "Preventive",
              text_ru: "Превентивного",
              text_uz: "Oldini oluvchi",
            },
            {
              key: "B",
              text_en: "Detective",
              text_ru: "Выявляющего",
              text_uz: "Aniqlovchi",
              why_wrong_en:
                "Detective controls find errors AFTER they happen (e.g. reconciliations); segregation aims to stop errors occurring in the first place.",
              why_wrong_ru:
                "Детективные контроли выявляют ошибки ПОСЛЕ их возникновения (например, сверки); разделение обязанностей нацелено остановить ошибку до её появления.",
              why_wrong_uz:
                "Aniqlovchi nazoratlar xatolarni yuz berganidan KEYIN topadi (masalan, solishtirishlar); vazifalarni ajratish esa xatolarning birinchi navbatda yuz berishini to'xtatishga qaratilgan.",
            },
            {
              key: "C",
              text_en: "Corrective",
              text_ru: "Корректирующего",
              text_uz: "Tuzatuvchi",
              why_wrong_en:
                "Corrective controls fix problems already found (e.g. restoring backups); segregation is upstream of that.",
              why_wrong_ru:
                "Корректирующие контроли устраняют уже выявленные проблемы (например, восстановление резервных копий); разделение обязанностей действует раньше.",
              why_wrong_uz:
                "Tuzatuvchi nazoratlar allaqachon topilgan muammolarni hal qiladi (masalan, zaxira nusxalarni tiklash); vazifalarni ajratish esa bundan oldinroq turadi.",
            },
            {
              key: "D",
              text_en: "Compensating",
              text_ru: "Компенсирующего",
              text_uz: "Kompensatsiyalovchi",
              why_wrong_en:
                "Compensating controls substitute when a primary control isn't feasible - segregation IS the primary control here, not a substitute.",
              why_wrong_ru:
                "Компенсирующие контроли заменяют основной, когда тот невозможен - разделение обязанностей и ЕСТЬ основной контроль, а не замена.",
              why_wrong_uz:
                "Kompensatsiyalovchi nazoratlar asosiy nazorat amalga oshmaganda o'rnini bosadi - bu yerda vazifalarni ajratish o'rinbosar emas, balki ASOSIY nazoratning o'zidir.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Segregation of duties (splitting authorisation, custody and recording among different people) is designed to prevent errors and fraud from occurring in the first place.",
          explanation_ru:
            "Разделение обязанностей (разделение полномочий, хранения и учёта между разными людьми) призвано предотвратить ошибки и мошенничество ещё до их возникновения.",
          explanation_uz:
            "Vazifalarni ajratish (ruxsat berish, saqlash va yozib borishni turli odamlar o'rtasida bo'lish) xatolar va firibgarlikning birinchi navbatda yuz berishining oldini olish uchun mo'ljallangan.",
        },
        // -------- existing Q2 (augmented) --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en: "Which is the BEST example of a detective control?",
          prompt_ru: "Что является НАИЛУЧШИМ примером выявляющего контроля?",
          prompt_uz:
            "Quyidagilardan qaysi biri aniqlovchi nazoratning ENG yaxshi misoli?",
          options: [
            {
              key: "A",
              text_en: "Locking the warehouse",
              text_ru: "Запирание склада",
              text_uz: "Omborni qulflash",
              why_wrong_en:
                "Locking the warehouse is a PHYSICAL preventive control - it stops unauthorised access before it happens.",
              why_wrong_ru:
                "Запирание склада - это ФИЗИЧЕСКИЙ превентивный контроль: он предотвращает несанкционированный доступ до его возникновения.",
              why_wrong_uz:
                "Omborni qulflash - JISMONIY oldini oluvchi nazorat: u ruxsatsiz kirishni yuz berishidan oldin to'xtatadi.",
            },
            {
              key: "B",
              text_en: "Monthly bank reconciliation",
              text_ru: "Ежемесячная сверка с банком",
              text_uz: "Oylik bank solishtirishi",
            },
            {
              key: "C",
              text_en: "Authorisation limits for purchases",
              text_ru: "Лимиты на согласование закупок",
              text_uz: "Xaridlar uchun ruxsat berish chegaralari",
              why_wrong_en:
                "Authorisation limits are preventive - they require approval before a transaction can be made.",
              why_wrong_ru:
                "Лимиты на согласование - превентивные: они требуют одобрения до совершения операции.",
              why_wrong_uz:
                "Ruxsat berish chegaralari oldini oluvchi - ular operatsiya amalga oshirilishidan oldin tasdiqlashni talab qiladi.",
            },
            {
              key: "D",
              text_en: "Staff training on procedures",
              text_ru: "Обучение сотрудников процедурам",
              text_uz: "Xodimlarni protseduralar bo'yicha o'qitish",
              why_wrong_en:
                "Training is preventive - it equips staff to avoid errors before they occur.",
              why_wrong_ru:
                "Обучение - превентивный контроль: оно даёт сотрудникам инструменты избежать ошибок до их возникновения.",
              why_wrong_uz:
                "O'qitish oldini oluvchi - u xodimlarni xatolar yuz berishidan oldin ulardan qochishga tayyorlaydi.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "A reconciliation detects discrepancies after they have already occurred. The other options prevent issues rather than detect them.",
          explanation_ru:
            "Сверка выявляет расхождения уже после того, как они произошли. Остальные варианты предотвращают проблемы, а не выявляют их.",
          explanation_uz:
            "Solishtirish nomuvofiqliklarni ular allaqachon yuz berganidan keyin aniqlaydi. Boshqa variantlar muammolarni aniqlash emas, balki oldini oladi.",
        },
        // -------- existing Q3 - fraud triangle (UPDATED with synonyms) --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "Which set correctly names the three elements of Cressey's fraud triangle?",
          prompt_ru:
            "Какой набор верно называет три элемента треугольника мошенничества Кресси?",
          prompt_uz:
            "Qaysi to'plam Kressining firibgarlik uchburchagining uchta elementini to'g'ri nomlaydi?",
          options: [
            {
              key: "A",
              text_en: "Pressure, opportunity, rationalisation",
              text_ru: "Давление, возможность, рационализация",
              text_uz: "Bosim, imkoniyat, oqlash",
            },
            {
              key: "B",
              text_en: "Pressure, capability, concealment",
              text_ru: "Давление, способность, сокрытие",
              text_uz: "Bosim, qobiliyat, yashirish",
              why_wrong_en:
                'Capability and concealment belong to the later "fraud diamond" extension; the classic triangle\'s third element is rationalisation, and its second is opportunity.',
              why_wrong_ru:
                "Способность и сокрытие относятся к более позднему расширению «бриллиант мошенничества»; третий элемент классического треугольника - рационализация, второй - возможность.",
              why_wrong_uz:
                'Qobiliyat va yashirish keyingi "firibgarlik olmoshi" kengaytmasiga tegishli; klassik uchburchakning uchinchi elementi - oqlash, ikkinchisi esa imkoniyatdir.',
            },
            {
              key: "C",
              text_en: "Motive, means, method",
              text_ru: "Мотив, средства, метод",
              text_uz: "Sabab, vosita, usul",
              why_wrong_en:
                "This is a colloquial crime phrase, not Cressey's model. The model's elements are pressure, opportunity and rationalisation.",
              why_wrong_ru:
                "Это бытовая криминалистическая формула, а не модель Кресси. Элементы модели - давление, возможность и рационализация.",
              why_wrong_uz:
                "Bu - Kressining modeli emas, balki jinoyatga oid so'zlashuv iborasi. Modelning elementlari - bosim, imkoniyat va oqlash.",
            },
            {
              key: "D",
              text_en: "Opportunity, detection, prosecution",
              text_ru: "Возможность, выявление, преследование",
              text_uz: "Imkoniyat, aniqlash, javobgarlikka tortish",
              why_wrong_en:
                "Detection and prosecution are responses to fraud, not the conditions that enable it. The enabling conditions are pressure, opportunity and rationalisation.",
              why_wrong_ru:
                "Выявление и преследование - это реакция на мошенничество, а не условия, которые его порождают. Порождающие условия - давление, возможность и рационализация.",
              why_wrong_uz:
                "Aniqlash va javobgarlikka tortish - firibgarlikka javob, uni yuzaga keltiruvchi shartlar emas. Yuzaga keltiruvchi shartlar - bosim, imkoniyat va oqlashdir.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Cressey's fraud triangle proposes fraud requires three elements: Pressure (motive/incentive - financial need or targets), Opportunity (a control weakness or override), and Rationalisation (the offender justifies the act to themselves).",
          explanation_ru:
            "Треугольник мошенничества Кресси предполагает, что для мошенничества нужны три элемента: давление (мотив/стимул - финансовая нужда или цели), возможность (слабость контроля или его обход) и рационализация (нарушитель оправдывает действие перед собой).",
          explanation_uz:
            "Kressining firibgarlik uchburchagi firibgarlik uchta elementni talab qilishini taklif qiladi: Bosim (sabab/rag'bat - moliyaviy ehtiyoj yoki maqsadlar), Imkoniyat (nazoratdagi zaiflik yoki uni chetlab o'tish) va Oqlash (firibgar bu xatti-harakatni o'ziga oqlaydi).",
        },
        // -------- existing Q4 (augmented) --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en: "The role of internal audit is BEST described as:",
          prompt_ru: "Роль внутреннего аудита ЛУЧШЕ всего описать как:",
          prompt_uz:
            "Ichki auditning roli ENG TO'G'RI quyidagicha ta'riflanadi:",
          options: [
            {
              key: "A",
              text_en: "Approving the financial statements",
              text_ru: "Утверждение финансовой отчётности",
              text_uz: "Moliyaviy hisobotlarni tasdiqlash",
              why_wrong_en:
                "Financial statements are approved by the board, not by internal audit.",
              why_wrong_ru:
                "Финансовую отчётность утверждает совет директоров, а не внутренний аудит.",
              why_wrong_uz:
                "Moliyaviy hisobotlar ichki audit emas, balki kengash tomonidan tasdiqlanadi.",
            },
            {
              key: "B",
              text_en:
                "Providing independent assurance to management on risk and control",
              text_ru:
                "Независимая оценка для руководства в части рисков и контроля",
              text_uz:
                "Boshqaruvga xavf va nazorat bo'yicha mustaqil kafolat berish",
            },
            {
              key: "C",
              text_en: "Performing the external audit",
              text_ru: "Проведение внешнего аудита",
              text_uz: "Tashqi auditni o'tkazish",
              why_wrong_en:
                "The external audit is performed by an INDEPENDENT firm, not by an in-house function - independence rules forbid this.",
              why_wrong_ru:
                "Внешний аудит проводит НЕЗАВИСИМАЯ фирма, а не внутренняя функция - правила независимости это запрещают.",
              why_wrong_uz:
                "Tashqi audit ichki funksiya emas, MUSTAQIL firma tomonidan o'tkaziladi - mustaqillik qoidalari buni taqiqlaydi.",
            },
            {
              key: "D",
              text_en: "Setting strategy",
              text_ru: "Постановка стратегии",
              text_uz: "Strategiyani belgilash",
              why_wrong_en:
                "Strategy is set by the board and executive team; internal audit evaluates how risks to strategy are controlled but does not set it.",
              why_wrong_ru:
                "Стратегию устанавливают совет и исполнительная команда; внутренний аудит оценивает контроль рисков для стратегии, но её не формирует.",
              why_wrong_uz:
                "Strategiya kengash va ijroiya jamoa tomonidan belgilanadi; ichki audit strategiyaga oid xavflar qanday nazorat qilinishini baholaydi, ammo uni belgilamaydi.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Internal audit is an independent assurance function reporting to the audit committee. It evaluates the effectiveness of governance, risk management and control processes.",
          explanation_ru:
            "Внутренний аудит - независимая функция оценки, подотчётная аудиторскому комитету. Он проверяет эффективность управления, управления рисками и процессов контроля.",
          explanation_uz:
            "Ichki audit - audit qo'mitasiga hisobot beradigan mustaqil kafolat funksiyasi. U boshqaruv, xavfni boshqarish va nazorat jarayonlarining samaradorligini baholaydi.",
        },
        // -------- existing Q5 (augmented) --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            "A company\u2019s controls require two signatures on cheques over £10,000. An employee splits a £15,000 payment into two cheques of £7,500 each. This is an example of:",
          prompt_ru:
            "В компании требуются две подписи на чеках свыше £10 000. Сотрудник разбивает платёж в £15 000 на два чека по £7 500. Это пример:",
          prompt_uz:
            "Kompaniya nazoratlari 10 000 funtdan ortiq cheklarga ikkita imzo talab qiladi. Xodim 15 000 funtlik to'lovni har biri 7 500 funtdan ikkita chekka bo'ladi. Bu quyidagiga misol:",
          options: [
            {
              key: "A",
              text_en: "Authorised activity",
              text_ru: "Разрешённой деятельности",
              text_uz: "Ruxsat berilgan faoliyat",
              why_wrong_en:
                "Deliberately structuring payments to avoid an approval requirement is not authorised, even if each cheque technically falls under the limit.",
              why_wrong_ru:
                "Намеренное дробление платежей в обход порога согласования - не разрешённая деятельность, даже если каждый чек формально ниже лимита.",
              why_wrong_uz:
                "Tasdiqlash talabidan qochish uchun to'lovlarni ataylab tuzish ruxsat berilgan emas, garchi har bir chek texnik jihatdan chegaradan past tushsa ham.",
            },
            {
              key: "B",
              text_en: "Control override",
              text_ru: "Обхода контроля",
              text_uz: "Nazoratni chetlab o'tish",
            },
            {
              key: "C",
              text_en: "Strong segregation of duties",
              text_ru: "Сильного разделения обязанностей",
              text_uz: "Kuchli vazifalar ajratilishi",
              why_wrong_en:
                "Segregation requires DIFFERENT people doing different steps; one employee splitting their own payments is not segregation.",
              why_wrong_ru:
                "Разделение обязанностей требует РАЗНЫХ людей на разных этапах; один сотрудник, дробящий собственный платёж, - это не разделение.",
              why_wrong_uz:
                "Vazifalarni ajratish TURLI odamlarning turli bosqichlarni bajarishini talab qiladi; bitta xodimning o'z to'lovlarini bo'lishi vazifalarni ajratish emas.",
            },
            {
              key: "D",
              text_en: "Compensating control",
              text_ru: "Компенсирующего контроля",
              text_uz: "Kompensatsiyalovchi nazorat",
              why_wrong_en:
                "A compensating control SUPPORTS a missing primary control; this scenario UNDERMINES the primary control instead.",
              why_wrong_ru:
                "Компенсирующий контроль ПОДДЕРЖИВАЕТ отсутствующий основной; здесь же основной контроль наоборот ПОДРЫВАЕТСЯ.",
              why_wrong_uz:
                "Kompensatsiyalovchi nazorat yetishmayotgan asosiy nazoratni QO'LLAB-QUVVATLAYDI; bu vaziyat esa asosiy nazoratni aksincha SUSAYTIRADI.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Splitting transactions to evade an authorisation threshold is a classic control override. It bypasses the intent of the control even though no individual cheque breaches the rule literally.",
          explanation_ru:
            "Дробление операций для обхода порога согласования - классический пример обхода контроля. Формально каждый чек правилу не противоречит, но цель контроля нарушается.",
          explanation_uz:
            "Ruxsat berish chegarasidan qochish uchun operatsiyalarni bo'lish - bu klassik nazoratni chetlab o'tishdir. U garchi hech bir alohida chek qoidani so'zma-so'z buzmasa-da, nazoratning maqsadini chetlab o'tadi.",
        },
        // -------- NEW Q6 - easy MCQ on corrective control --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "A company restores customer data from a backup after a system crash. This is an example of which type of control?",
          prompt_ru:
            "Компания восстанавливает клиентские данные из резервной копии после сбоя системы. Это пример какого типа контроля?",
          prompt_uz:
            "Kompaniya tizim ishdan chiqqanidan keyin mijoz ma'lumotlarini zaxira nusxadan tiklaydi. Bu qaysi turdagi nazoratga misol?",
          options: [
            {
              key: "A",
              text_en: "Preventive",
              text_ru: "Превентивного",
              text_uz: "Oldini oluvchi",
              why_wrong_en:
                "Preventive controls act BEFORE an event; restoring data happens AFTER the crash.",
              why_wrong_ru:
                "Превентивные контроли действуют ДО события; восстановление данных происходит ПОСЛЕ сбоя.",
              why_wrong_uz:
                "Oldini oluvchi nazoratlar hodisadan OLDIN harakat qiladi; ma'lumotlarni tiklash esa ishdan chiqishdan KEYIN sodir bo'ladi.",
            },
            {
              key: "B",
              text_en: "Detective",
              text_ru: "Выявляющего",
              text_uz: "Aniqlovchi",
              why_wrong_en:
                "Detective controls IDENTIFY problems; restoration is fixing the problem, not finding it.",
              why_wrong_ru:
                "Детективные контроли ВЫЯВЛЯЮТ проблемы; восстановление - это устранение проблемы, а не её обнаружение.",
              why_wrong_uz:
                "Aniqlovchi nazoratlar muammolarni ANIQLAYDI; tiklash esa muammoni topish emas, uni hal qilishdir.",
            },
            {
              key: "C",
              text_en: "Corrective",
              text_ru: "Корректирующего",
              text_uz: "Tuzatuvchi",
            },
            {
              key: "D",
              text_en: "Directive",
              text_ru: "Директивного",
              text_uz: "Yo'naltiruvchi",
              why_wrong_en:
                "Directive controls instruct staff what to do (e.g. policy manuals); restoring data is an action, not an instruction.",
              why_wrong_ru:
                "Директивные контроли указывают сотрудникам, что делать (например, политики); восстановление данных - это действие, а не указание.",
              why_wrong_uz:
                "Yo'naltiruvchi nazoratlar xodimlarga nima qilishni ko'rsatadi (masalan, siyosat qo'llanmalari); ma'lumotlarni tiklash esa ko'rsatma emas, harakatdir.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "Corrective controls reverse or limit the damage from a problem that has already occurred. Restoring from backup, refunding overcharged customers, and reissuing incorrect invoices all fit this category.",
          explanation_ru:
            "Корректирующие контроли устраняют или ограничивают ущерб от уже произошедшей проблемы. Восстановление из резервной копии, возврат переплат клиентам, перевыпуск некорректных счетов - всё попадает в эту категорию.",
          explanation_uz:
            "Tuzatuvchi nazoratlar allaqachon yuz bergan muammodan kelgan zararni bartaraf etadi yoki cheklaydi. Zaxiradan tiklash, ortiqcha hisoblangan mijozlarga pulni qaytarish va noto'g'ri hisob-fakturalarni qayta chiqarish - barchasi shu toifaga kiradi.",
        },
        // -------- NEW Q7 - easy MCQ on audit committee composition --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "The audit committee of a listed company should be composed primarily of:",
          prompt_ru:
            "Аудиторский комитет публичной компании должен состоять преимущественно из:",
          prompt_uz:
            "Listingdagi kompaniyaning audit qo'mitasi asosan quyidagilardan tashkil topishi kerak:",
          options: [
            {
              key: "A",
              text_en: "Executive directors",
              text_ru: "Исполнительных директоров",
              text_uz: "Ijroiya direktorlar",
              why_wrong_en:
                "Executive directors are part of management - they cannot independently oversee management; that is the precise conflict the committee is meant to avoid.",
              why_wrong_ru:
                "Исполнительные директора входят в руководство - они не могут независимо надзирать за руководством, а именно для устранения этого конфликта существует комитет.",
              why_wrong_uz:
                "Ijroiya direktorlar boshqaruvning bir qismi - ular boshqaruvni mustaqil nazorat qila olmaydi; aynan shu - qo'mita oldini olishi kerak bo'lgan ziddiyatdir.",
            },
            {
              key: "B",
              text_en: "Independent non-executive directors",
              text_ru: "Независимых неисполнительных директоров",
              text_uz: "Mustaqil ijroiya bo'lmagan direktorlar",
            },
            {
              key: "C",
              text_en: "The external auditors",
              text_ru: "Внешних аудиторов",
              text_uz: "Tashqi auditorlar",
              why_wrong_en:
                "External auditors REPORT to the audit committee; they cannot also be members - that would compromise their independence.",
              why_wrong_ru:
                "Внешние аудиторы ПОДЧИНЯЮТСЯ аудиторскому комитету; они не могут быть его членами - это нарушит их независимость.",
              why_wrong_uz:
                "Tashqi auditorlar audit qo'mitasiga HISOBOT BERADI; ular bir vaqtning o'zida a'zo bo'la olmaydi - bu ularning mustaqilligini buzgan bo'lardi.",
            },
            {
              key: "D",
              text_en: "Shareholders elected at the AGM",
              text_ru: "Акционеров, избранных на годовом общем собрании",
              text_uz: "Yillik umumiy yig'ilishda (AGM) saylangan aksiyadorlar",
              why_wrong_en:
                "Audit committee members are appointed from among the existing board directors, not elected separately by shareholders.",
              why_wrong_ru:
                "Члены аудиторского комитета назначаются из числа уже избранных директоров совета, а не отдельно акционерами.",
              why_wrong_uz:
                "Audit qo'mitasi a'zolari aksiyadorlar tomonidan alohida saylanmaydi, balki mavjud kengash direktorlari orasidan tayinlanadi.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "The audit committee oversees the external audit, internal audit, and financial reporting on behalf of the board. It must be independent of executive management, so its members are independent non-executive directors. The chair is typically a NED with relevant financial experience.",
          explanation_ru:
            "Аудиторский комитет надзирает за внешним и внутренним аудитом и финансовой отчётностью от имени совета. Он должен быть независим от исполнительного руководства, поэтому его члены - независимые неисполнительные директора. Председатель - обычно NED с соответствующим финансовым опытом.",
          explanation_uz:
            "Audit qo'mitasi kengash nomidan tashqi audit, ichki audit va moliyaviy hisobotni nazorat qiladi. U ijroiya boshqaruvidan mustaqil bo'lishi shart, shuning uchun uning a'zolari mustaqil ijroiya bo'lmagan direktorlardir. Rais odatda tegishli moliyaviy tajribaga ega NED bo'ladi.",
        },
        // -------- NEW Q8 - easy short_answer on TARA --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "In the TARA risk-response framework, which response means passing the financial consequences of a risk to another party, for example through insurance?",
          prompt_ru:
            "В модели реагирования на риски TARA какой ответ означает передачу финансовых последствий риска другой стороне, например через страхование?",
          prompt_uz:
            "TARA xavfga javob doirasida qaysi javob xavfning moliyaviy oqibatlarini, masalan sug'urta orqali, boshqa tomonga o'tkazishni anglatadi?",
          options: [
            {
              key: "A",
              text_en: "Transfer",
              text_ru: "Передача (Transfer)",
              text_uz: "O'tkazish",
            },
            {
              key: "B",
              text_en: "Avoid",
              text_ru: "Избежание (Avoid)",
              text_uz: "Qochish",
              why_wrong_en:
                "Avoid means not undertaking the risky activity at all, not passing its consequences to a third party.",
              why_wrong_ru:
                "Избежание означает полный отказ от рискованной деятельности, а не передачу её последствий третьей стороне.",
              why_wrong_uz:
                "Qochish xavfli faoliyatni umuman amalga oshirmaslikni anglatadi, uning oqibatlarini uchinchi tomonga o'tkazishni emas.",
            },
            {
              key: "C",
              text_en: "Reduce",
              text_ru: "Снижение (Reduce)",
              text_uz: "Kamaytirish",
              why_wrong_en:
                "Reduce means lowering the likelihood or impact through controls, while still retaining the risk yourself.",
              why_wrong_ru:
                "Снижение означает уменьшение вероятности или воздействия с помощью контролей, при этом риск остаётся у вас.",
              why_wrong_uz:
                "Kamaytirish ehtimollik yoki ta'sirni nazoratlar orqali pasaytirishni, ammo xavfni o'zingda saqlab qolishni anglatadi.",
            },
            {
              key: "D",
              text_en: "Accept",
              text_ru: "Принятие (Accept)",
              text_uz: "Qabul qilish",
              why_wrong_en:
                "Accept means tolerating the risk and its consequences without action, the opposite of transferring them.",
              why_wrong_ru:
                "Принятие означает терпимость к риску и его последствиям без действий - противоположность их передаче.",
              why_wrong_uz:
                "Qabul qilish xavf va uning oqibatlarini hech qanday harakatsiz toqat qilishni anglatadi - bu ularni o'tkazishning aksidir.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "TARA stands for Transfer, Avoid, Reduce, Accept. Transfer passes the financial consequences of a risk to another party - typically via insurance or by outsourcing the risky activity. The risk itself does not disappear; only its financial burden shifts.",
          explanation_ru:
            "TARA расшифровывается как Transfer (передача), Avoid (избежание), Reduce (снижение), Accept (принятие). Передача перекладывает финансовые последствия риска на другую сторону - обычно через страхование или аутсорсинг рискованной деятельности. Сам риск не исчезает; смещается лишь его финансовое бремя.",
          explanation_uz:
            "TARA - O'tkazish, Qochish, Kamaytirish, Qabul qilishni anglatadi. O'tkazish xavfning moliyaviy oqibatlarini boshqa tomonga o'tkazadi - odatda sug'urta orqali yoki xavfli faoliyatni autsorsing qilish orqali. Xavfning o'zi yo'qolmaydi; faqat uning moliyaviy yuki siljiydi.",
        },
        // -------- NEW Q9 - medium MCQ on gross vs net risk --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A company\u2019s risk register shows a cyber-attack risk with an impact score of 9/10 and a likelihood of 8/10. After installing a firewall and staff training, the likelihood drops to 3/10. The impact rating of 9/10 with likelihood 8/10 represents:",
          prompt_ru:
            "Реестр рисков компании показывает риск кибератаки с оценкой воздействия 9/10 и вероятности 8/10. После установки межсетевого экрана и обучения сотрудников вероятность падает до 3/10. Сочетание воздействия 9/10 и вероятности 8/10 - это:",
          prompt_uz:
            "Kompaniya xavflar reyestrida kiberhujum xavfi ta'sir bali 9/10 va ehtimolligi 8/10 deb ko'rsatilgan. Tarmoq devori (firewall) o'rnatib va xodimlarni o'qitganidan so'ng ehtimollik 3/10 ga tushadi. 9/10 ta'sir va 8/10 ehtimollik nimani ifodalaydi:",
          options: [
            {
              key: "A",
              text_en: "Net risk",
              text_ru: "Чистый риск",
              text_uz: "Sof xavf",
              why_wrong_en:
                "Net (residual) risk is the score AFTER controls are applied - that would be 9/10 impact × 3/10 likelihood here, not the original 8/10.",
              why_wrong_ru:
                "Чистый (остаточный) риск - это оценка ПОСЛЕ применения контролей: здесь 9/10 × 3/10, а не исходная 8/10.",
              why_wrong_uz:
                "Sof (qoldiq) xavf - nazoratlar qo'llangandan KEYINGI bal: bu yerda u 9/10 ta'sir x 3/10 ehtimollik bo'lardi, dastlabki 8/10 emas.",
            },
            {
              key: "B",
              text_en: "Gross risk",
              text_ru: "Валовый риск",
              text_uz: "Yalpi xavf",
            },
            {
              key: "C",
              text_en: "Inherent variance",
              text_ru: "Внутренняя дисперсия",
              text_uz: "Tabiiy dispersiya",
              why_wrong_en:
                "This is not a standard risk-management term - it conflates statistical and risk vocabulary.",
              why_wrong_ru:
                "Это не стандартный термин риск-менеджмента - он смешивает статистическую и рисковую терминологию.",
              why_wrong_uz:
                "Bu - standart xavfni boshqarish atamasi emas - u statistik va xavf atamalarini chalkashtiradi.",
            },
            {
              key: "D",
              text_en: "Residual risk",
              text_ru: "Остаточный риск",
              text_uz: "Qoldiq xavf",
              why_wrong_en:
                "Residual risk is another name for NET risk - the score AFTER controls; the question asks about the score BEFORE controls.",
              why_wrong_ru:
                "Остаточный риск - синоним чистого риска (ПОСЛЕ контролей); вопрос про оценку ДО контролей.",
              why_wrong_uz:
                "Qoldiq xavf - SOF xavfning boshqa nomi, ya'ni nazoratlardan KEYINGI bal; savol esa nazoratlardan OLDINGI bal haqida.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Gross risk is the risk score BEFORE controls are applied - the inherent exposure if nothing were done. Net (or residual) risk is the score AFTER controls have reduced impact, likelihood, or both. The difference shows how much value the controls add and helps prioritise where additional control investment is needed.",
          explanation_ru:
            "Валовый риск - это оценка риска ДО применения контролей, то есть исходная подверженность, если ничего не делать. Чистый (или остаточный) риск - оценка ПОСЛЕ того, как контроли снизили воздействие, вероятность или то и другое. Разница показывает, какую ценность дают контроли, и помогает определить, где нужны дополнительные инвестиции в контроль.",
          explanation_uz:
            "Yalpi xavf - nazoratlar qo'llanishidan OLDINGI xavf bali, ya'ni hech narsa qilinmasa mavjud bo'ladigan tabiiy ta'sir. Sof (yoki qoldiq) xavf esa nazoratlar ta'sir, ehtimollik yoki ikkalasini ham kamaytirgandan KEYINGI baldir. Farq nazoratlar qancha qiymat qo'shishini ko'rsatadi va qo'shimcha nazorat sarmoyasi qayerda kerakligini belgilashga yordam beradi.",
        },
        // -------- NEW Q10 - medium MCQ on TARA scenario --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A small construction firm faces low-probability but catastrophic risk of injury claims. It buys a public liability insurance policy. Under TARA, this response is:",
          prompt_ru:
            "Небольшая строительная фирма сталкивается с маловероятным, но катастрофическим риском исков по травмам. Она покупает полис страхования ответственности перед третьими лицами. По модели TARA это реагирование:",
          prompt_uz:
            "Kichik qurilish firmasi past ehtimolli, ammo halokatli jarohat da'volari xavfiga duch keladi. U fuqaroviy javobgarlik sug'urta polisini sotib oladi. TARAga ko'ra, bu javob:",
          options: [
            {
              key: "A",
              text_en: "Transfer",
              text_ru: "Transfer (передать)",
              text_uz: "O'tkazish",
            },
            {
              key: "B",
              text_en: "Avoid",
              text_ru: "Avoid (избежать)",
              text_uz: "Qochish",
              why_wrong_en:
                "Avoidance would mean stopping construction work altogether - insurance lets the firm continue while transferring financial impact.",
              why_wrong_ru:
                "Избегание означало бы прекращение строительных работ вообще - страхование позволяет продолжать работу, перенося финансовое воздействие.",
              why_wrong_uz:
                "Qochish qurilish ishlarini umuman to'xtatishni anglatardi - sug'urta esa firmaga moliyaviy ta'sirni o'tkazgan holda faoliyatni davom ettirish imkonini beradi.",
            },
            {
              key: "C",
              text_en: "Reduce",
              text_ru: "Reduce (снизить)",
              text_uz: "Kamaytirish",
              why_wrong_en:
                "Reduction would mean adding safety controls (helmets, training); insurance doesn't change the likelihood or impact, it shifts who pays.",
              why_wrong_ru:
                "Снижение означало бы добавление контроля безопасности (каски, обучение); страхование не меняет ни вероятность, ни последствия - оно меняет, кто платит.",
              why_wrong_uz:
                "Kamaytirish xavfsizlik nazoratlarini qo'shishni anglatardi (kaska, o'qitish); sug'urta esa ehtimollik yoki ta'sirni o'zgartirmaydi, kim to'lashini siljitadi.",
            },
            {
              key: "D",
              text_en: "Accept",
              text_ru: "Accept (принять)",
              text_uz: "Qabul qilish",
              why_wrong_en:
                "Acceptance means living with the consequences yourself; insurance specifically does the opposite - passes the consequences to the insurer.",
              why_wrong_ru:
                "Принятие означает нести последствия самостоятельно; страхование делает прямо противоположное - переносит последствия на страховщика.",
              why_wrong_uz:
                "Qabul qilish oqibatlar bilan o'zing yashashni anglatadi; sug'urta esa aynan buning aksini qiladi - oqibatlarni sug'urtalovchiga o'tkazadi.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Insurance is the classic risk transfer mechanism: the firm pays a predictable premium in exchange for the insurer bearing the financial impact of a rare but catastrophic event. The risk itself still exists, but its financial consequences shift to a party better equipped to absorb them.",
          explanation_ru:
            "Страхование - классический механизм передачи риска: компания платит предсказуемую премию, а страховщик принимает на себя финансовые последствия редкого, но катастрофического события. Сам риск никуда не девается, но его финансовые последствия переходят к стороне, лучше способной их выдержать.",
          explanation_uz:
            "Sug'urta - klassik xavf o'tkazish mexanizmi: firma kamdan-kam, ammo halokatli hodisaning moliyaviy ta'sirini sug'urtalovchi o'z zimmasiga olishi evaziga oldindan aniq mukofot to'laydi. Xavfning o'zi hamon mavjud, ammo uning moliyaviy oqibatlari uni yutishga qodirroq tomonga siljiydi.",
        },
        // -------- NEW Q11 - medium MCQ on money laundering stages --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            'A criminal deposits large amounts of cash into a casino, then withdraws the funds as a "winnings" cheque. Under the three-stage model of money laundering, this is:',
          prompt_ru:
            "Преступник вносит крупные суммы наличных в казино, затем снимает средства чеком на «выигрыш». В трёхстадийной модели отмывания денег это:",
          prompt_uz:
            "Jinoyatchi kazinoga katta miqdordagi naqd pul kiritadi, so'ng mablag'larni \"yutuq\" cheki sifatida yechib oladi. Pul yuvishning uch bosqichli modeliga ko'ra, bu:",
          options: [
            {
              key: "A",
              text_en: "Placement",
              text_ru: "Размещение",
              text_uz: "Joylashtirish",
            },
            {
              key: "B",
              text_en: "Layering",
              text_ru: "Расслоение",
              text_uz: "Qatlamlash",
              why_wrong_en:
                "Layering involves multiple transactions designed to obscure the audit trail (e.g. wires through several countries); this scenario is a single conversion at entry point.",
              why_wrong_ru:
                "Расслоение - это множественные операции, скрывающие след (например, переводы через несколько стран); здесь же одна конвертация на входе.",
              why_wrong_uz:
                "Qatlamlash audit izini yashirish uchun mo'ljallangan ko'plab operatsiyalarni o'z ichiga oladi (masalan, bir necha mamlakat orqali pul o'tkazmalari); bu vaziyat esa kirish nuqtasidagi yagona almashtirishdir.",
            },
            {
              key: "C",
              text_en: "Integration",
              text_ru: "Интеграция",
              text_uz: "Integratsiya",
              why_wrong_en:
                "Integration is the final stage where laundered money returns as apparently legitimate income (e.g. property purchase); this is the entry point, not the exit.",
              why_wrong_ru:
                "Интеграция - финальная стадия, когда отмытые деньги возвращаются как якобы законный доход (например, покупка недвижимости); здесь же - точка входа, а не выхода.",
              why_wrong_uz:
                "Integratsiya - yuvilgan pul qonuniy daromad ko'rinishida qaytadigan yakuniy bosqich (masalan, ko'chmas mulk sotib olish); bu esa chiqish emas, kirish nuqtasidir.",
            },
            {
              key: "D",
              text_en: "Concealment",
              text_ru: "Сокрытие",
              text_uz: "Yashirish",
              why_wrong_en:
                "Concealment is not one of the three named stages; the established model uses placement, layering, and integration.",
              why_wrong_ru:
                "Сокрытие не входит в три названные стадии; стандартная модель - размещение, расслоение, интеграция.",
              why_wrong_uz:
                "Yashirish - uchta nomlangan bosqichdan biri emas; o'rnatilgan model joylashtirish, qatlamlash va integratsiyadan foydalanadi.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Placement is the first stage of money laundering - getting illegal cash into the legitimate financial system. Casinos, cash-intensive businesses (e.g. car washes), and structured bank deposits are common placement methods. Once placed, the funds move to layering (obscuring the trail) and then integration (re-emerging as apparent legitimate income).",
          explanation_ru:
            "Размещение - первая стадия отмывания денег: ввод нелегальной наличности в легальную финансовую систему. Казино, кассоёмкие бизнесы (например, автомойки) и структурированные банковские вклады - типичные методы размещения. После размещения средства проходят расслоение (запутывание следа), а затем интеграцию (возврат под видом легального дохода).",
          explanation_uz:
            "Joylashtirish - pul yuvishning birinchi bosqichi: noqonuniy naqd pulni qonuniy moliyaviy tizimga kiritish. Kazinolar, naqd pulga boy bizneslar (masalan, avtomoykalar) va tuzilgan bank omonatlari keng tarqalgan joylashtirish usullaridir. Joylashtirilgach, mablag'lar qatlamlashga (izni yashirish), so'ng integratsiyaga (qonuniy daromad ko'rinishida qayta paydo bo'lish) o'tadi.",
        },
        // -------- NEW Q12 - medium MCQ on MLRO role --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "In a firm subject to anti-money-laundering regulation, the Money Laundering Reporting Officer (MLRO) is primarily responsible for:",
          prompt_ru:
            "В компании, подпадающей под регулирование противодействия отмыванию, Money Laundering Reporting Officer (MLRO) в первую очередь отвечает за:",
          prompt_uz:
            "Pulni yuvishga qarshi tartibga solinadigan firmada Pul Yuvish Bo'yicha Hisobot Beruvchi Mas'ul Shaxs (MLRO) asosan quyidagi uchun mas'ul:",
          options: [
            {
              key: "A",
              text_en: "Conducting due diligence on every customer transaction",
              text_ru: "Проведение проверки каждой клиентской операции",
              text_uz:
                "Har bir mijoz operatsiyasi bo'yicha tegishli tekshiruv (due diligence) o'tkazish",
              why_wrong_en:
                "Customer due diligence is performed by front-line staff; the MLRO oversees the framework, not every individual check.",
              why_wrong_ru:
                "Проверку клиентов проводят сотрудники переднего фронта; MLRO курирует общий процесс, а не каждую отдельную проверку.",
              why_wrong_uz:
                "Mijozlarni tekshirish birinchi qator xodimlar tomonidan amalga oshiriladi; MLRO esa har bir alohida tekshiruvni emas, doirani nazorat qiladi.",
            },
            {
              key: "B",
              text_en:
                "Receiving internal reports of suspicious activity and submitting external SARs",
              text_ru:
                "Получение внутренних сообщений о подозрительной активности и подача внешних сообщений (SAR)",
              text_uz:
                "Shubhali faoliyat to'g'risidagi ichki hisobotlarni qabul qilish va tashqi SARlarni topshirish",
            },
            {
              key: "C",
              text_en: "Setting the company\u2019s strategic risk appetite",
              text_ru: "Установление стратегического риск-аппетита компании",
              text_uz: "Kompaniyaning strategik xavf ishtahasini belgilash",
              why_wrong_en:
                "Risk appetite is a board-level decision; the MLRO operates within the framework the board sets, not by setting it.",
              why_wrong_ru:
                "Риск-аппетит - решение на уровне совета; MLRO действует в рамках, заданных советом, а не устанавливает их.",
              why_wrong_uz:
                "Xavf ishtahasi - kengash darajasidagi qaror; MLRO esa kengash o'rnatgan doira ichida ishlaydi, uni o'zi belgilamaydi.",
            },
            {
              key: "D",
              text_en: "Preparing the financial statements",
              text_ru: "Подготовка финансовой отчётности",
              text_uz: "Moliyaviy hisobotlarni tayyorlash",
              why_wrong_en:
                "Financial statement preparation is a finance/accounting role, unrelated to AML oversight.",
              why_wrong_ru:
                "Подготовка финансовой отчётности - задача финансово-учётного отдела, не связанная с AML.",
              why_wrong_uz:
                "Moliyaviy hisobot tayyorlash - moliya/buxgalteriya roli, pulni yuvishga qarshi nazoratga aloqasi yo'q.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "The MLRO is the senior individual within a regulated firm to whom employees report suspicions of money laundering. The MLRO then decides whether to escalate by filing a Suspicious Activity Report (SAR) with the relevant authority. The role exists to centralise judgement and create a clear escalation path.",
          explanation_ru:
            "MLRO - старшее лицо в регулируемой компании, которому сотрудники сообщают о подозрениях в отмывании денег. MLRO затем решает, нужно ли эскалировать вопрос путём подачи сообщения о подозрительной операции (SAR) в соответствующий орган. Роль централизует профессиональное суждение и создаёт чёткий путь эскалации.",
          explanation_uz:
            "MLRO - tartibga solinadigan firma ichidagi yuqori shaxs bo'lib, xodimlar pul yuvish bo'yicha shubhalarini unga bildiradi. So'ng MLRO tegishli organga Shubhali Faoliyat Hisoboti (SAR) topshirish orqali masalani yuqoriga ko'tarishni hal qiladi. Bu rol hukmni markazlashtirish va aniq yuqoriga ko'tarish yo'lini yaratish uchun mavjud.",
        },
        // -------- NEW Q13 - medium short_answer on GDPR --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "Which of the following is one of the GDPR principles for processing personal data?",
          prompt_ru:
            "Какой из перечисленных пунктов является одним из принципов GDPR обработки персональных данных?",
          prompt_uz:
            "Quyidagilardan qaysi biri shaxsiy ma'lumotlarni qayta ishlash bo'yicha GDPR tamoyillaridan biri?",
          options: [
            {
              key: "A",
              text_en: "Data minimisation",
              text_ru: "Минимизация данных",
              text_uz: "Ma'lumotlarni minimallashtirish",
            },
            {
              key: "B",
              text_en: "Maximum retention",
              text_ru: "Максимальный срок хранения",
              text_uz: "Maksimal saqlash",
              why_wrong_en:
                "GDPR requires STORAGE LIMITATION - keeping data no longer than necessary - the opposite of maximising retention.",
              why_wrong_ru:
                "GDPR требует ОГРАНИЧЕНИЯ ХРАНЕНИЯ - не хранить данные дольше необходимого - это противоположность максимизации хранения.",
              why_wrong_uz:
                "GDPR SAQLASH CHEKLOVINI talab qiladi - ma'lumotni zarur bo'lganidan ortiq saqlamaslik - bu saqlashni maksimallashtirishning aksidir.",
            },
            {
              key: "C",
              text_en: "Unrestricted processing",
              text_ru: "Неограниченная обработка",
              text_uz: "Cheklanmagan qayta ishlash",
              why_wrong_en:
                "GDPR requires a lawful basis and purpose limitation; processing is restricted, not unrestricted.",
              why_wrong_ru:
                "GDPR требует законного основания и ограничения цели; обработка ограничена, а не свободна.",
              why_wrong_uz:
                "GDPR qonuniy asos va maqsad cheklovini talab qiladi; qayta ishlash cheklanmagan emas, cheklangan.",
            },
            {
              key: "D",
              text_en: "Mandatory data sharing",
              text_ru: "Обязательный обмен данными",
              text_uz: "Majburiy ma'lumot almashish",
              why_wrong_en:
                "GDPR restricts sharing and transfers; there is no principle requiring data to be shared.",
              why_wrong_ru:
                "GDPR ограничивает обмен и передачу данных; принципа, обязывающего делиться данными, нет.",
              why_wrong_uz:
                "GDPR almashish va uzatishni cheklaydi; ma'lumotni almashishni talab qiluvchi tamoyil yo'q.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "GDPR sets seven principles: lawful basis, purpose limitation, data minimisation, accuracy, storage limitation, integrity and security, and accountability. Data minimisation means collecting only what is genuinely needed for the stated purpose.",
          explanation_ru:
            "GDPR устанавливает семь принципов: законное основание, ограничение цели, минимизация данных, точность, ограничение хранения, целостность и безопасность, подотчётность. Минимизация данных означает сбор только того, что действительно необходимо для заявленной цели.",
          explanation_uz:
            "GDPR yettita tamoyilni belgilaydi: qonuniy asos, maqsad cheklovi, ma'lumotlarni minimallashtirish, aniqlik, saqlash cheklovi, yaxlitlik va xavfsizlik, hamda javobgarlik. Ma'lumotlarni minimallashtirish belgilangan maqsad uchun chinakam zarur bo'lgan ma'lumotnigina yig'ishni anglatadi.",
        },
        // -------- NEW Q14 - hard MCQ on layering complexity --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            "A criminal moves $2m through 15 shell companies in 7 jurisdictions, each transaction structured to fall below local reporting thresholds, before consolidating the funds in a single bank account. This BEST illustrates:",
          prompt_ru:
            "Преступник проводит $2 млн через 15 фиктивных компаний в 7 юрисдикциях, каждая операция структурирована ниже местных порогов отчётности, после чего средства консолидируются на одном банковском счёте. Это ЛУЧШЕ всего иллюстрирует:",
          prompt_uz:
            "Jinoyatchi 2 mln dollarni 7 ta yurisdiktsiyadagi 15 ta soxta (shell) kompaniya orqali o'tkazadi, har bir operatsiya mahalliy hisobot chegaralaridan past tushadigan qilib tuzilgan, so'ng mablag'larni bitta bank hisobida birlashtiradi. Bu ENG TO'G'RI quyidagini ko'rsatadi:",
          options: [
            {
              key: "A",
              text_en: "Placement only",
              text_ru: "Только размещение",
              text_uz: "Faqat joylashtirish",
              why_wrong_en:
                "Placement is getting cash INTO the system; this scenario describes movement WITHIN it across many intermediaries.",
              why_wrong_ru:
                "Размещение - это ввод наличных В систему; здесь же описано движение ВНУТРИ системы через множество посредников.",
              why_wrong_uz:
                "Joylashtirish - naqd pulni tizimga KIRITISH; bu vaziyat esa ko'plab vositachilar orqali tizim ICHIDAGI harakatni ta'riflaydi.",
            },
            {
              key: "B",
              text_en: "Layering",
              text_ru: "Расслоение",
              text_uz: "Qatlamlash",
            },
            {
              key: "C",
              text_en: "Integration only",
              text_ru: "Только интеграция",
              text_uz: "Faqat integratsiya",
              why_wrong_en:
                "Integration is the final return of funds as apparently legitimate income (e.g. property, business revenue); the scenario stops at the consolidated bank account, before integration.",
              why_wrong_ru:
                "Интеграция - финальный возврат средств как якобы законного дохода (недвижимость, выручка бизнеса); сценарий заканчивается на консолидированном счёте, до интеграции.",
              why_wrong_uz:
                "Integratsiya - mablag'larning qonuniy daromad ko'rinishida yakuniy qaytishi (masalan, ko'chmas mulk, biznes daromadi); vaziyat esa integratsiyadan oldin, birlashtirilgan bank hisobida to'xtaydi.",
            },
            {
              key: "D",
              text_en: "A straightforward Suspicious Activity Report case",
              text_ru:
                "Простой случай для подачи сообщения о подозрительной операции",
              text_uz: "Oddiy Shubhali Faoliyat Hisoboti holati",
              why_wrong_en:
                "The question asks for the laundering STAGE; SAR-filing is the response, not the technique being illustrated.",
              why_wrong_ru:
                "Вопрос - о СТАДИИ отмывания; подача SAR - это реакция, а не описываемая техника.",
              why_wrong_uz:
                "Savol pul yuvishning BOSQICHINI so'raydi; SAR topshirish esa ko'rsatilayotgan usul emas, balki javobdir.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Layering is the deliberate creation of complex transaction chains designed to obscure the audit trail. Hallmarks include: multiple jurisdictions (cross-border investigation friction), shell companies (no real economic substance), structured amounts below reporting thresholds (each individually too small to trigger automatic flagging), and ultimately consolidation in a clean-looking account. The complexity is the point.",
          explanation_ru:
            "Расслоение - это намеренное создание сложных цепочек операций, призванных запутать след. Характерные признаки: множество юрисдикций (создаёт препятствия трансграничному расследованию), фиктивные компании (без реальной экономической сути), суммы, структурированные ниже порогов отчётности (каждая в отдельности слишком мала, чтобы автоматически попасть в систему), и в итоге консолидация на внешне чистом счёте. Сложность - это и есть цель.",
          explanation_uz:
            "Qatlamlash - audit izini yashirish uchun mo'ljallangan murakkab operatsiya zanjirlarini ataylab yaratishdir. Belgilari: bir necha yurisdiktsiya (transchegaraviy tergovga qarshilik), soxta kompaniyalar (haqiqiy iqtisodiy mohiyatsiz), hisobot chegaralaridan past tuzilgan miqdorlar (har biri alohida avtomatik belgilanish uchun juda kichik) va pirovardida toza ko'rinishdagi hisobda birlashtirish. Murakkablikning o'zi - asosiy maqsad.",
        },
        // -------- NEW Q15 - hard MCQ on whistleblowing + AML scenario --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            "An accountant notices that a long-standing client has begun making large unexplained cash deposits. The accountant has no concrete evidence of wrongdoing but has serious concerns. The MOST appropriate first action is:",
          prompt_ru:
            "Бухгалтер замечает, что давний клиент начал делать крупные необъяснимые поступления наличными. Конкретных доказательств нарушения у бухгалтера нет, но есть серьёзные опасения. НАИБОЛЕЕ подходящее первое действие:",
          prompt_uz:
            "Buxgalter uzoq yillik mijozning katta, izohsiz naqd pul omonatlari qo'ya boshlaganini sezadi. Buxgalterda noqonuniy harakatning aniq dalili yo'q, ammo jiddiy xavotirlari bor. ENG MAQBUL birinchi harakat:",
          options: [
            {
              key: "A",
              text_en:
                "Immediately confront the client and demand an explanation",
              text_ru: "Немедленно открыто потребовать у клиента объяснений",
              text_uz: "Mijoz bilan darhol yuzma-yuz kelib, izoh talab qilish",
              why_wrong_en:
                'This constitutes "tipping off" - alerting a potential launderer that they are under suspicion, which is itself a criminal offence in most AML regimes.',
              why_wrong_ru:
                "Это «уведомление» - предупреждение возможного нарушителя о подозрениях, что в большинстве AML-режимов само является уголовным правонарушением.",
              why_wrong_uz:
                "Bu \"ogohlantirish\"ni tashkil etadi - potensial pul yuvuvchini shubha ostida ekanini ogohlantirish, bu ko'pchilik pulni yuvishga qarshi rejimlarda o'zi jinoiy harakatdir.",
            },
            {
              key: "B",
              text_en:
                "Report the suspicion internally to the firm\u2019s MLRO",
              text_ru: "Сообщить о подозрении внутри фирмы своему MLRO",
              text_uz: "Shubhani firmaning MLROsiga ichki tarzda xabar qilish",
            },
            {
              key: "C",
              text_en: "Resign from the engagement and walk away quietly",
              text_ru: "Отказаться от задания и тихо уйти",
              text_uz: "Loyihadan iste'foga chiqib, jimgina ketib qolish",
              why_wrong_en:
                "Resignation without reporting leaves the suspicion unaddressed and may itself trigger reporting obligations the accountant cannot ignore.",
              why_wrong_ru:
                "Уход без сообщения оставляет подозрение неурегулированным и сам по себе может породить обязанности по подаче сведений, от которых нельзя уклониться.",
              why_wrong_uz:
                "Xabar bermasdan iste'foga chiqish shubhani hal qilinmagan holda qoldiradi va o'zi buxgalter e'tibordan chetda qoldira olmaydigan hisobot majburiyatlarini keltirib chiqarishi mumkin.",
            },
            {
              key: "D",
              text_en: "Wait for stronger evidence before doing anything",
              text_ru:
                "Дождаться более веских доказательств, прежде чем что-либо делать",
              text_uz: "Biror narsa qilishdan oldin kuchliroq dalil kutish",
              why_wrong_en:
                "AML rules require reporting of SUSPICION, not proof - the legal threshold is deliberately low because front-line staff cannot conduct criminal investigations.",
              why_wrong_ru:
                "Правила AML требуют сообщать о ПОДОЗРЕНИИ, а не о доказательствах - юридический порог намеренно занижен, потому что сотрудники переднего фронта не ведут уголовных расследований.",
              why_wrong_uz:
                "Pulni yuvishga qarshi qoidalar dalilni emas, SHUBHANI xabar qilishni talab qiladi - qonuniy chegara ataylab past, chunki birinchi qator xodimlar jinoiy tergov o'tkaza olmaydi.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            'The correct response under AML regulation is internal escalation to the MLRO, who decides whether to file a Suspicious Activity Report. Two important elements: the threshold is "suspicion", not proof; and the accountant must NOT tip off the client (a separate offence). This protects the accountant from personal liability and channels the judgement to a single accountable person within the firm.',
          explanation_ru:
            "Правильная реакция по правилам AML - внутренняя эскалация в адрес MLRO, который решает, подавать ли сообщение о подозрительной операции. Два важных момента: порог - это «подозрение», а не доказательство; и бухгалтер НЕ должен «уведомлять» клиента (это отдельное правонарушение). Это защищает бухгалтера от личной ответственности и направляет суждение единому подотчётному лицу внутри фирмы.",
          explanation_uz:
            "Pulni yuvishga qarshi tartibga solishga ko'ra to'g'ri javob - Shubhali Faoliyat Hisoboti topshirish-topshirmaslikni hal qiladigan MLROga ichki murojaat qilishdir. Ikki muhim jihat: chegara \"shubha\", dalil emas; va buxgalter mijozni OGOHLANTIRMASLIGI kerak (alohida jinoyat). Bu buxgalterni shaxsiy javobgarlikdan himoya qiladi va hukmni firma ichidagi yagona mas'ul shaxsga yo'naltiradi.",
        },
      ],
    },
    // ---------- D ----------
    {
      code: "D",
      title_en: "Leadership and management",
      title_ru: "Лидерство и менеджмент",
      title_uz: "Yetakchilik va boshqaruv",
      description_en:
        "Motivation theories, team development, leadership styles, and HR.",
      description_ru:
        "Теории мотивации, развитие команд, стили лидерства и управление персоналом.",
      description_uz:
        "Motivatsiya nazariyalari, jamoaning rivojlanishi, yetakchilik uslublari va kadrlar (HR).",
      sort_order: 40,
      theory_en:
        "Management is the work of planning, organising, directing and controlling; leadership is the work of inspiring and influencing people to follow. The two overlap but aren't identical - a great manager may not lead, and a strong leader may not administer.\n\n" +
        "Motivation theories split into content theories (what people want) and process theories (how motivation forms). Maslow's hierarchy ranks needs from physiological → safety → social → esteem → self-actualisation; higher needs only motivate once lower ones are met. Herzberg distinguishes hygiene factors (pay, conditions, supervision - their absence demotivates but their presence doesn't motivate) from motivators (achievement, recognition, growth - the true sources of satisfaction). McGregor contrasts Theory X (workers are lazy, need coercion) and Theory Y (workers are self-motivated, seek responsibility). Vroom's expectancy theory: motivation = expectancy × instrumentality × valence - i.e. effort leads to performance, performance leads to reward, and the reward is valued.\n\n" +
        "Teams pass through Tuckman's stages - forming (polite, uncertain), storming (conflict over roles), norming (rules and trust established), performing (effective output), adjourning (team disbands). Belbin identifies nine team roles (e.g. plant - creative; shaper - driving; completer-finisher - detail-focused); balanced teams cover all roles.\n\n" +
        "Leadership styles span autocratic (leader decides), democratic (decisions are shared), and laissez-faire (minimal direction). Blake & Mouton's managerial grid plots concern for production against concern for people, with 9,9 (\"team management\") considered ideal. Hersey & Blanchard's situational leadership matches style to follower readiness: telling, selling, participating, delegating. Transformational leaders inspire change through vision; transactional leaders motivate through reward and correction. Fayol described five managerial functions: plan, organise, command, coordinate, control.\n\n" +
        "HR fundamentals: a job description sets out duties; a person specification sets out the qualities the role demands. Selection uses interviews (structured, panel, competency-based), psychometric tests, and references.",
      theory_ru:
        "Менеджмент - это планирование, организация, руководство и контроль; лидерство - вдохновение и влияние, побуждающее людей идти за лидером. Эти роли пересекаются, но не тождественны: хороший менеджер может не быть лидером, а сильный лидер - не уметь администрировать.\n\n" +
        "Теории мотивации делятся на содержательные (что нужно человеку) и процессуальные (как формируется мотивация). Иерархия Маслоу выстраивает потребности по уровням: физиологические → безопасность → социальные → уважение → самоактуализация; более высокие потребности мотивируют только после удовлетворения нижних. Герцберг разделяет гигиенические факторы (зарплата, условия, надзор - их отсутствие демотивирует, но наличие не мотивирует) и мотиваторы (достижение, признание, рост - настоящие источники удовлетворённости). Макгрегор противопоставляет Теорию X (работники ленивы, нуждаются в принуждении) и Теорию Y (работники самомотивированы, стремятся к ответственности). Теория ожиданий Врума: мотивация = ожидание × инструментальность × валентность - то есть усилие ведёт к результату, результат ведёт к вознаграждению, и вознаграждение ценится.\n\n" +
        "Команды проходят стадии Такмена - формирование (вежливость, неопределённость), бурление (конфликты по ролям), нормирование (установление правил и доверия), функционирование (эффективная работа), завершение (распад команды). Белбин выделяет девять ролей в команде (например, генератор идей - креативная; формирователь - двигающий; финишёр - внимателен к деталям); сбалансированные команды покрывают все роли.\n\n" +
        "Стили лидерства простираются от авторитарного (решает лидер), демократического (решения принимаются совместно) до либерального (минимум указаний). Управленческая решётка Блейка и Моутон сопоставляет заботу о производстве и заботу о людях; вариант 9,9 («командное управление») считается идеалом. Ситуационное лидерство Херси и Бланшара подбирает стиль под зрелость подчинённого: указание, продажа, участие, делегирование. Трансформационные лидеры вдохновляют через видение; транзакционные - мотивируют через вознаграждение и коррекцию. Файоль описал пять функций менеджера: планирование, организация, распорядительство, координация, контроль.\n\n" +
        "Основы HR: должностная инструкция описывает обязанности; профиль должности (person specification) описывает требования к качествам кандидата. Отбор использует собеседования (структурированные, панельные, по компетенциям), психометрические тесты и рекомендации.",
      theory_uz:
        "Boshqaruv - bu rejalashtirish, tashkil etish, yo'naltirish va nazorat qilish ishi; yetakchilik esa odamlarni ergashishga ilhomlantirish va ularga ta'sir o'tkazish ishidir. Ikkalasi bir-biriga kirib boradi, ammo bir xil emas - ajoyib menejer yetaklamasligi, kuchli yetakchi esa boshqarmasligi mumkin.\n\nMotivatsiya nazariyalari mazmun nazariyalari (odamlar nimani xohlaydi) va jarayon nazariyalari (motivatsiya qanday shakllanadi)ga bo'linadi. Maslou ierarxiyasi ehtiyojlarni fiziologik -> xavfsizlik -> ijtimoiy -> hurmat -> o'zini o'zi namoyon qilish tartibida joylashtiradi; yuqori ehtiyojlar faqat quyiroqlari qondirilgach motivatsiya beradi. Hertsberg gigiyena omillarini (maosh, sharoit, nazorat - ularning yo'qligi motivatsiyani so'ndiradi, ammo mavjudligi motivatsiya bermaydi) motivatorlardan (yutuq, e'tirof, o'sish - qoniqishning haqiqiy manbalari) ajratadi. MakGregor X nazariyasini (ishchilar dangasa, majburlash kerak) va Y nazariyasini (ishchilar o'zini o'zi rag'batlantiradi, mas'uliyat izlaydi) qarama-qarshi qo'yadi. Vrumning kutilma nazariyasi: motivatsiya = kutilma x vositachilik x valentlik - ya'ni sa'y-harakat natijaga, natija mukofotga olib keladi va mukofot qadrlanadi.\n\nJamoalar Takmen bosqichlaridan o'tadi - shakllanish (xushmuomala, noaniq), to'qnashuv (rollar ustida ziddiyat), me'yorlashish (qoidalar va ishonch o'rnatiladi), faoliyat ko'rsatish (samarali natija), tarqalish (jamoa tarqaydi). Belbin to'qqizta jamoa rolini aniqlaydi (masalan, \"o'simlik\" - ijodkor; \"shakllantiruvchi\" - harakatga undovchi; \"yakunlovchi\" - tafsilotga e'tiborli); muvozanatli jamoalar barcha rollarni qamrab oladi.\n\nYetakchilik uslublari avtokratik (yetakchi qaror qiladi), demokratik (qarorlar bo'lishiladi) va aralashmaslik (laissez-faire, minimal yo'naltirish)ni qamrab oladi. Bleyk va Mouton boshqaruv panjarasi ishlab chiqarishga e'tiborni odamlarga e'tiborga qarshi joylashtiradi, 9,9 (\"jamoaviy boshqaruv\") ideal hisoblanadi. Hersi va Blanshar vaziyatli yetakchiligi uslubni izdoshning tayyorligiga moslashtiradi: aytish, sotish, ishtirok ettirish, ishonib topshirish. Transformatsion yetakchilar vizyon orqali o'zgarishga ilhomlantiradi; transaksion yetakchilar mukofot va tuzatish orqali rag'batlantiradi. Fayol beshta boshqaruv funksiyasini ta'riflagan: rejalashtirish, tashkil etish, buyruq berish, muvofiqlashtirish, nazorat.\n\nKadrlar asoslari: lavozim yo'riqnomasi vazifalarni belgilaydi; shaxs talabnomasi (person specification) esa lavozim talab qiladigan fazilatlarni belgilaydi. Tanlov suhbatlar (tuzilgan, panelli, kompetensiyaga asoslangan), psixometrik testlar va tavsiyanomalardan foydalanadi.",
      questions: [
        // -------- existing Q1 (augmented) --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "According to Maslow\u2019s hierarchy of needs, which need is HIGHEST in the hierarchy?",
          prompt_ru:
            "Согласно иерархии потребностей Маслоу, какая потребность находится НА САМОМ ВЕРХУ?",
          prompt_uz:
            "Maslouning ehtiyojlar ierarxiyasiga ko'ra, qaysi ehtiyoj ierarxiyada ENG YUQORI?",
          options: [
            {
              key: "A",
              text_en: "Physiological",
              text_ru: "Физиологические",
              text_uz: "Fiziologik",
              why_wrong_en:
                "Physiological needs (food, shelter) are at the BASE of the hierarchy, not the top.",
              why_wrong_ru:
                "Физиологические потребности (еда, кров) находятся в ОСНОВАНИИ иерархии, а не на вершине.",
              why_wrong_uz:
                "Fiziologik ehtiyojlar (oziq-ovqat, boshpana) ierarxiyaning ASOSIDA, eng yuqorisida emas.",
            },
            {
              key: "B",
              text_en: "Safety",
              text_ru: "Безопасность",
              text_uz: "Xavfsizlik",
              why_wrong_en:
                "Safety is the SECOND level, just above physiological - not the top.",
              why_wrong_ru:
                "Безопасность - это ВТОРОЙ уровень над физиологическими, а не верхний.",
              why_wrong_uz:
                "Xavfsizlik - IKKINCHI daraja, fiziologikdan bir pog'ona yuqorida - eng yuqorisi emas.",
            },
            {
              key: "C",
              text_en: "Esteem",
              text_ru: "Уважение",
              text_uz: "Hurmat",
              why_wrong_en:
                "Esteem is the FOURTH level - one rung below the top.",
              why_wrong_ru:
                "Уважение - это ЧЕТВЁРТЫЙ уровень, на одну ступень ниже вершины.",
              why_wrong_uz:
                "Hurmat - TO'RTINCHI daraja, eng yuqoridan bir pog'ona past.",
            },
            {
              key: "D",
              text_en: "Self-actualisation",
              text_ru: "Самоактуализация",
              text_uz: "O'zini o'zi namoyon qilish",
            },
          ],
          correct_answer_en: "D",
          explanation_en:
            "Maslow\u2019s pyramid runs physiological → safety → love/belonging → esteem → self-actualisation at the top.",
          explanation_ru:
            "Пирамида Маслоу: физиологические → безопасность → принадлежность → уважение → самоактуализация на вершине.",
          explanation_uz:
            "Maslou piramidasi fiziologik -> xavfsizlik -> mehr/mansublik -> hurmat -> eng yuqorida o'zini o'zi namoyon qilish tartibida boradi.",
        },
        // -------- existing Q2 (augmented) --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "Herzberg\u2019s two-factor theory classifies salary as a:",
          prompt_ru:
            "В двухфакторной теории Герцберга заработная плата относится к:",
          prompt_uz:
            "Hertsbergning ikki omilli nazariyasi maoshni quyidagicha tasniflaydi:",
          options: [
            {
              key: "A",
              text_en: "Motivator",
              text_ru: "Мотиватору",
              text_uz: "Motivator",
              why_wrong_en:
                "Motivators are intrinsic (achievement, recognition, growth); salary is extrinsic, addressing dissatisfaction rather than driving satisfaction.",
              why_wrong_ru:
                "Мотиваторы - внутренние (достижение, признание, рост); зарплата - внешний фактор, устраняющий недовольство, а не порождающий удовлетворение.",
              why_wrong_uz:
                "Motivatorlar ichki (yutuq, e'tirof, o'sish); maosh esa tashqi bo'lib, qoniqishni oshirishdan ko'ra norozilikni bartaraf etadi.",
            },
            {
              key: "B",
              text_en: "Hygiene factor",
              text_ru: "Гигиеническому фактору",
              text_uz: "Gigiyena omili",
            },
            {
              key: "C",
              text_en: "Self-actualisation need",
              text_ru: "Потребности самоактуализации",
              text_uz: "O'zini o'zi namoyon qilish ehtiyoji",
              why_wrong_en:
                "Self-actualisation is from Maslow, not Herzberg - the question asks about Herzberg's classification.",
              why_wrong_ru:
                "Самоактуализация - из теории Маслоу, а не Герцберга; вопрос - о классификации Герцберга.",
              why_wrong_uz:
                "O'zini o'zi namoyon qilish - Maslouga tegishli, Hertsbergga emas; savol esa Hertsbergning tasnifi haqida.",
            },
            {
              key: "D",
              text_en: "Trait of charismatic leadership",
              text_ru: "Черте харизматического лидерства",
              text_uz: "Xarizmatik yetakchilik xususiyati",
              why_wrong_en:
                "Charismatic leadership is a separate leadership-theory concept, unrelated to Herzberg's motivation theory.",
              why_wrong_ru:
                "Харизматическое лидерство - отдельная концепция теории лидерства, не связанная с теорией мотивации Герцберга.",
              why_wrong_uz:
                "Xarizmatik yetakchilik - alohida yetakchilik nazariyasi tushunchasi bo'lib, Hertsbergning motivatsiya nazariyasiga aloqasi yo'q.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Salary is a hygiene (maintenance) factor: inadequate pay demotivates, but generous pay does not by itself create lasting motivation. Motivators are intrinsic (achievement, recognition, growth).",
          explanation_ru:
            "Зарплата - гигиенический (поддерживающий) фактор: недостаточная оплата демотивирует, но щедрая сама по себе не создаёт устойчивой мотивации. Мотиваторы носят внутренний характер (достижение, признание, рост).",
          explanation_uz:
            "Maosh - gigiyena (saqlash) omili: yetarli bo'lmagan maosh motivatsiyani so'ndiradi, ammo saxiy maoshning o'zi uzoq muddatli motivatsiya yaratmaydi. Motivatorlar esa ichki (yutuq, e'tirof, o'sish)dir.",
        },
        // -------- existing Q3 (short_answer, unchanged) --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "In Tuckman's model of team development, which stage is characterised by conflict as members assert their roles and ideas?",
          prompt_ru:
            "На каком этапе модели развития команды Такмана возникает конфликт, когда участники отстаивают свои роли и идеи?",
          prompt_uz:
            "Takmenning jamoa rivojlanishi modelida qaysi bosqich a'zolar o'z rollari va g'oyalarini himoya qilishi tufayli ziddiyat bilan tavsiflanadi?",
          options: [
            {
              key: "A",
              text_en: "Storming",
              text_ru: "Конфликт (Storming)",
              text_uz: "To'qnashuv",
            },
            {
              key: "B",
              text_en: "Forming",
              text_ru: "Формирование (Forming)",
              text_uz: "Shakllanish",
              why_wrong_en:
                "Forming is the polite, tentative first stage where members get acquainted; open conflict has not yet emerged.",
              why_wrong_ru:
                "Формирование - вежливый, осторожный первый этап знакомства; открытого конфликта ещё нет.",
              why_wrong_uz:
                "Shakllanish - a'zolar tanishadigan xushmuomala, ehtiyotkor birinchi bosqich; ochiq ziddiyat hali yuzaga kelmagan.",
            },
            {
              key: "C",
              text_en: "Norming",
              text_ru: "Нормирование (Norming)",
              text_uz: "Me'yorlashish",
              why_wrong_en:
                "Norming is when the team RESOLVES conflict and agrees shared ways of working - it follows storming.",
              why_wrong_ru:
                "Нормирование - когда команда РАЗРЕШАЕТ конфликт и согласует общие правила работы; следует за конфликтом.",
              why_wrong_uz:
                "Me'yorlashish - jamoa ziddiyatni HAL QILIB, umumiy ish usullariga kelishadigan bosqich - u to'qnashuvdan keyin keladi.",
            },
            {
              key: "D",
              text_en: "Performing",
              text_ru: "Функционирование (Performing)",
              text_uz: "Faoliyat ko'rsatish",
              why_wrong_en:
                "Performing is the mature stage of effective, low-friction delivery, well after the conflict stage.",
              why_wrong_ru:
                "Функционирование - зрелый этап эффективной работы с малым трением, наступающий значительно позже стадии конфликта.",
              why_wrong_uz:
                "Faoliyat ko'rsatish - samarali, kam ziddiyatli ishlab chiqarishning yetuk bosqichi, ziddiyat bosqichidan ancha keyin.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Tuckman's sequence is forming → storming → norming → performing (→ adjourning). Storming is where individual personalities and ideas clash before the team settles into shared norms.",
          explanation_ru:
            "Последовательность Такмана: формирование → конфликт → нормирование → функционирование (→ расформирование). На стадии конфликта сталкиваются личности и идеи, прежде чем команда выработает общие нормы.",
          explanation_uz:
            "Takmen ketma-ketligi shakllanish -> to'qnashuv -> me'yorlashish -> faoliyat ko'rsatish (-> tarqalish)dir. To'qnashuv - jamoa umumiy me'yorlarga kelishidan oldin alohida shaxslar va g'oyalar to'qnashadigan bosqichdir.",
        },
        // -------- existing Q4 (augmented) --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en: 'A "transformational" leader is BEST characterised by:',
          prompt_ru:
            "«Трансформационный» лидер ЛУЧШЕ всего характеризуется как:",
          prompt_uz:
            "\"Transformatsion\" yetakchi ENG TO'G'RI quyidagicha tavsiflanadi:",
          options: [
            {
              key: "A",
              text_en: "Strict rule enforcement",
              text_ru: "Жёстким соблюдением правил",
              text_uz: "Qoidalarni qat'iy ijro ettirish",
              why_wrong_en:
                "Rule enforcement is closer to a bureaucratic or transactional style; transformational leaders work through inspiration, not rules.",
              why_wrong_ru:
                "Соблюдение правил ближе к бюрократическому или транзакционному стилю; трансформационные лидеры действуют через вдохновение, а не правила.",
              why_wrong_uz:
                "Qoidalarni ijro ettirish byurokratik yoki transaksion uslubga yaqinroq; transformatsion yetakchilar esa qoidalar emas, ilhom orqali ishlaydi.",
            },
            {
              key: "B",
              text_en: "Inspiring followers towards a shared vision of change",
              text_ru: "Вдохновением последователей к общему видению изменений",
              text_uz:
                "Izdoshlarni o'zgarishning umumiy vizyoni sari ilhomlantirish",
            },
            {
              key: "C",
              text_en: "Avoiding decisions",
              text_ru: "Избеганием решений",
              text_uz: "Qarorlardan qochish",
              why_wrong_en:
                "Avoiding decisions characterises laissez-faire leadership; transformational is the opposite - actively shaping direction.",
              why_wrong_ru:
                "Избегание решений характерно для либерального стиля; трансформационный - противоположность: активно задаёт направление.",
              why_wrong_uz:
                "Qarorlardan qochish aralashmaslik (laissez-faire) yetakchiligini tavsiflaydi; transformatsion esa aksincha - yo'nalishni faol shakllantiradi.",
            },
            {
              key: "D",
              text_en: "Pure transactional reward/punishment",
              text_ru: "Чисто транзакционной системой наград и наказаний",
              text_uz: "Sof transaksion mukofot/jazo",
              why_wrong_en:
                "Transactional and transformational are DEFINED in contrast to each other - transactional is what transformational is NOT.",
              why_wrong_ru:
                "Транзакционный и трансформационный стили ОПРЕДЕЛЕНЫ через противопоставление; транзакционный - это то, чем трансформационный НЕ является.",
              why_wrong_uz:
                "Transaksion va transformatsion bir-biriga qarama-qarshi qilib TA'RIFLANADI - transaksion bu transformatsion EMAS bo'lgan narsadir.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Transformational leaders inspire and motivate followers to exceed expectations by appealing to higher ideals and shared vision, in contrast to transactional leaders who exchange rewards for performance.",
          explanation_ru:
            "Трансформационные лидеры вдохновляют последователей превзойти ожидания, обращаясь к высшим идеалам и общему видению, в отличие от транзакционных, которые обменивают вознаграждение на результат.",
          explanation_uz:
            "Transformatsion yetakchilar izdoshlarni oliy ideallar va umumiy vizyonga murojaat qilish orqali kutilganidan oshib ketishga ilhomlantiradi va rag'batlantiradi, mukofotni faoliyatga ayirboshlaydigan transaksion yetakchilardan farqli ravishda.",
        },
        // -------- existing Q5 (augmented) --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            'On Blake and Mouton\u2019s managerial grid, a "9,1" position represents:',
          prompt_ru:
            "На управленческой решётке Блейка и Мутон позиция «9,1» представляет собой:",
          prompt_uz:
            'Bleyk va Mouton boshqaruv panjarasida "9,1" pozitsiyasi nimani ifodalaydi:',
          options: [
            {
              key: "A",
              text_en: "Country club management - high people, low task",
              text_ru:
                "Управление «загородный клуб» - высокий упор на людей, низкий на задачи",
              text_uz: "Klub boshqaruvi - yuqori odamlar, past vazifa",
              why_wrong_en:
                "Country club is (1,9), with the order reversed - high on people, low on task. Here the question is about (9,1).",
              why_wrong_ru:
                "«Загородный клуб» - это (1,9) с обратным порядком: высокий упор на людей, низкий на задачи. Вопрос же о (9,1).",
              why_wrong_uz:
                "Klub boshqaruvi (1,9) bo'lib, tartibi teskari - odamlarga yuqori, vazifaga past. Bu yerda savol (9,1) haqida.",
            },
            {
              key: "B",
              text_en: "Team management - high on both",
              text_ru: "Командный менеджмент - высокий и там, и там",
              text_uz: "Jamoaviy boshqaruv - ikkalasida ham yuqori",
              why_wrong_en:
                "Team management is (9,9) - high on BOTH dimensions; (9,1) is unbalanced.",
              why_wrong_ru:
                "Командный менеджмент - это (9,9) с высоким значением на ОБЕИХ осях; (9,1) - несбалансированная позиция.",
              why_wrong_uz:
                "Jamoaviy boshqaruv (9,9) - HAR IKKALA o'lchamda ham yuqori; (9,1) esa muvozanatsiz.",
            },
            {
              key: "C",
              text_en: "Authority-compliance - high task, low people",
              text_ru:
                "Авторитет и подчинение - высокий упор на задачи, низкий на людей",
              text_uz: "Vakolat-itoatkorlik - yuqori vazifa, past odamlar",
            },
            {
              key: "D",
              text_en: "Impoverished management - low on both",
              text_ru: "Обеднённый менеджмент - низкий и там, и там",
              text_uz: "Qashshoq boshqaruv - ikkalasida ham past",
              why_wrong_en:
                "Impoverished management is (1,1) - low on BOTH dimensions; (9,1) has maximum task concern.",
              why_wrong_ru:
                "Обеднённый менеджмент - это (1,1), низкий на ОБЕИХ осях; (9,1) - максимум по производству.",
              why_wrong_uz:
                "Qashshoq boshqaruv (1,1) - HAR IKKALA o'lchamda ham past; (9,1) da esa vazifaga maksimal e'tibor bor.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "The grid uses concern-for-production (X) by concern-for-people (Y), each from 1 to 9. (9,1) is maximum concern for production with minimum concern for people - the authority-compliance style.",
          explanation_ru:
            "Решётка использует две оси (1–9): забота о производстве (X) и забота о людях (Y). (9,1) - максимальная забота о производстве и минимальная о людях, стиль «авторитет и подчинение».",
          explanation_uz:
            "Panjara ishlab chiqarishga e'tibor (X) va odamlarga e'tibor (Y)ni ishlatadi, har biri 1 dan 9 gacha. (9,1) - ishlab chiqarishga maksimal e'tibor va odamlarga minimal e'tibor, ya'ni vakolat-itoatkorlik uslubidir.",
        },
        // -------- NEW Q6 - easy MCQ on McGregor --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "A manager who believes employees naturally seek responsibility and need only minimal supervision holds which view, according to McGregor?",
          prompt_ru:
            "Менеджер, считающий, что сотрудники естественно стремятся к ответственности и нуждаются лишь в минимальном надзоре, придерживается какого взгляда по Макгрегору?",
          prompt_uz:
            "MakGregorga ko'ra, xodimlar tabiatan mas'uliyat izlaydi va faqat minimal nazoratga muhtoj deb hisoblovchi menejer qaysi qarashga ega?",
          options: [
            {
              key: "A",
              text_en: "Theory X",
              text_ru: "Теория X",
              text_uz: "X nazariyasi",
              why_wrong_en:
                "Theory X assumes workers DISLIKE work, avoid responsibility, and need coercion - the opposite of the manager described.",
              why_wrong_ru:
                "Теория X предполагает, что работники НЕ ЛЮБЯТ работу, избегают ответственности и нуждаются в принуждении - противоположно описанному менеджеру.",
              why_wrong_uz:
                "X nazariyasi ishchilar ishni YOQTIRMASLIGINI, mas'uliyatdan qochishini va majburlash kerakligini taxmin qiladi - ta'riflangan menejerning aksi.",
            },
            {
              key: "B",
              text_en: "Theory Y",
              text_ru: "Теория Y",
              text_uz: "Y nazariyasi",
            },
            {
              key: "C",
              text_en: "Theory Z",
              text_ru: "Теория Z",
              text_uz: "Z nazariyasi",
              why_wrong_en:
                "Theory Z (Ouchi) is a later extension drawing on Japanese management practices; the question asks about McGregor's original dichotomy.",
              why_wrong_ru:
                "Теория Z (Оучи) - более позднее расширение, опирающееся на японские управленческие практики; вопрос - об оригинальной дихотомии Макгрегора.",
              why_wrong_uz:
                "Z nazariyasi (Ouchi) yapon boshqaruv amaliyotlariga asoslangan keyingi kengaytma; savol esa MakGregorning asl ikkiliklik nazariyasi haqida.",
            },
            {
              key: "D",
              text_en: "Theory X-Y hybrid",
              text_ru: "Гибрид Теории X-Y",
              text_uz: "X-Y aralash nazariyasi",
              why_wrong_en:
                'McGregor presented X and Y as opposing assumptions a manager makes; there is no formal "hybrid" in his framework.',
              why_wrong_ru:
                "Макгрегор представил X и Y как противоположные допущения менеджера; формального «гибрида» в его модели нет.",
              why_wrong_uz:
                'MakGregor X va Yni menejer qiladigan qarama-qarshi taxminlar sifatida taqdim etgan; uning doirasida rasmiy "aralash" tur yo\'q.',
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "McGregor argued managers operate on one of two assumptions. Theory X: people inherently dislike work, avoid responsibility, and must be controlled. Theory Y: people find work as natural as rest, accept and seek responsibility, and are self-motivated. The manager described holds Theory Y assumptions.",
          explanation_ru:
            "Макгрегор утверждал, что менеджеры исходят из одного из двух допущений. Теория X: люди не любят работу, избегают ответственности, их нужно контролировать. Теория Y: для людей работа естественна как отдых, они принимают и ищут ответственность, мотивированы изнутри. Описанный менеджер придерживается Теории Y.",
          explanation_uz:
            "MakGregor menejerlar ikkita taxminning biriga asoslanib ishlashini ta'kidladi. X nazariyasi: odamlar tabiatan ishni yoqtirmaydi, mas'uliyatdan qochadi va nazorat qilinishi kerak. Y nazariyasi: odamlar uchun ish dam olish kabi tabiiy, ular mas'uliyatni qabul qiladi va izlaydi hamda o'zini o'zi rag'batlantiradi. Ta'riflangan menejer Y nazariyasi taxminlariga ega.",
        },
        // -------- NEW Q7 - easy MCQ on autocratic style --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "A leadership style where the leader makes all decisions alone and tells subordinates exactly what to do is BEST described as:",
          prompt_ru:
            "Стиль лидерства, при котором лидер принимает все решения единолично и точно указывает подчинённым, что делать, ЛУЧШЕ всего описать как:",
          prompt_uz:
            "Yetakchi barcha qarorlarni yakka o'zi qabul qiladigan va bo'ysunuvchilarga aniq nima qilishni aytadigan yetakchilik uslubi ENG TO'G'RI quyidagicha tavsiflanadi:",
          options: [
            {
              key: "A",
              text_en: "Autocratic",
              text_ru: "Авторитарный",
              text_uz: "Avtokratik",
            },
            {
              key: "B",
              text_en: "Democratic",
              text_ru: "Демократический",
              text_uz: "Demokratik",
              why_wrong_en:
                "Democratic leaders involve subordinates in decision-making; this scenario describes unilateral decisions.",
              why_wrong_ru:
                "Демократические лидеры вовлекают подчинённых в принятие решений; в сценарии - единоличные решения.",
              why_wrong_uz:
                "Demokratik yetakchilar bo'ysunuvchilarni qaror qabul qilishga jalb qiladi; bu vaziyat esa bir tomonlama qarorlarni ta'riflaydi.",
            },
            {
              key: "C",
              text_en: "Laissez-faire",
              text_ru: "Либеральный",
              text_uz: "Aralashmaslik (laissez-faire)",
              why_wrong_en:
                "Laissez-faire leaders give minimal direction; this scenario describes detailed direction.",
              why_wrong_ru:
                "Либеральные лидеры дают минимум указаний; в сценарии - детальные указания.",
              why_wrong_uz:
                "Aralashmaslik yetakchilari minimal yo'naltirish beradi; bu vaziyat esa batafsil yo'naltirishni ta'riflaydi.",
            },
            {
              key: "D",
              text_en: "Transformational",
              text_ru: "Трансформационный",
              text_uz: "Transformatsion",
              why_wrong_en:
                'Transformational leaders inspire through vision rather than command; "telling exactly what to do" is the wrong vibe.',
              why_wrong_ru:
                "Трансформационные лидеры вдохновляют видением, а не командами; «точно указывать, что делать» - другая модель.",
              why_wrong_uz:
                'Transformatsion yetakchilar buyruq emas, vizyon orqali ilhomlantiradi; "aniq nima qilishni aytish" mos kelmaydigan yondashuvdir.',
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Autocratic (authoritarian) leadership concentrates decision-making with the leader; subordinates receive instructions and execute. It can be effective in crises or with inexperienced teams but tends to suppress initiative and reduce engagement over time.",
          explanation_ru:
            "Авторитарный стиль концентрирует принятие решений на лидере; подчинённые получают указания и исполняют. Эффективен в кризисе или с неопытной командой, но со временем подавляет инициативу и снижает вовлечённость.",
          explanation_uz:
            "Avtokratik (avtoritar) yetakchilik qaror qabul qilishni yetakchida jamlaydi; bo'ysunuvchilar ko'rsatma oladi va bajaradi. U inqirozlarda yoki tajribasiz jamoalarda samarali bo'lishi mumkin, ammo vaqt o'tishi bilan tashabbusni so'ndiradi va jalb etilishni kamaytiradi.",
        },
        // -------- NEW Q8 - easy short_answer on Fayol --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "Which of the following is one of Henri Fayol's five functions of management?",
          prompt_ru:
            "Какой из перечисленных пунктов является одной из пяти функций управления по Анри Файолю?",
          prompt_uz:
            "Quyidagilardan qaysi biri Anri Fayolning beshta boshqaruv funksiyasidan biri?",
          options: [
            {
              key: "A",
              text_en: "Coordinate",
              text_ru: "Координировать",
              text_uz: "Muvofiqlashtirish",
            },
            {
              key: "B",
              text_en: "Motivate",
              text_ru: "Мотивировать",
              text_uz: "Rag'batlantirish",
              why_wrong_en:
                "Motivation is a theme of later behavioural writers (e.g. Maslow, Herzberg); Fayol's five functions are plan, organise, command, coordinate, control.",
              why_wrong_ru:
                "Мотивация - тема более поздних поведенческих авторов (Маслоу, Герцберг); пять функций Файоля - планировать, организовывать, командовать, координировать, контролировать.",
              why_wrong_uz:
                "Rag'batlantirish - keyingi xulq-atvor mualliflari mavzusi (masalan, Maslou, Hertsberg); Fayolning beshta funksiyasi esa rejalashtirish, tashkil etish, buyruq berish, muvofiqlashtirish, nazoratdir.",
            },
            {
              key: "C",
              text_en: "Innovate",
              text_ru: "Внедрять инновации",
              text_uz: "Innovatsiya qilish",
              why_wrong_en:
                "Innovation is not one of Fayol's classical functions; his five are plan, organise, command, coordinate, control.",
              why_wrong_ru:
                "Инновации не входят в классические функции Файоля; его пять - планировать, организовывать, командовать, координировать, контролировать.",
              why_wrong_uz:
                "Innovatsiya - Fayolning klassik funksiyalaridan biri emas; uning beshtasi - rejalashtirish, tashkil etish, buyruq berish, muvofiqlashtirish, nazorat.",
            },
            {
              key: "D",
              text_en: "Delegate",
              text_ru: "Делегировать",
              text_uz: "Vakolat berish (delegatsiya)",
              why_wrong_en:
                "Delegation is a management technique, not one of Fayol's five named functions (plan, organise, command, coordinate, control).",
              why_wrong_ru:
                "Делегирование - управленческий приём, а не одна из пяти названных функций Файоля (планировать, организовывать, командовать, координировать, контролировать).",
              why_wrong_uz:
                "Vakolat berish - boshqaruv usuli, Fayolning beshta nomlangan funksiyasidan biri emas (rejalashtirish, tashkil etish, buyruq berish, muvofiqlashtirish, nazorat).",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Fayol identified five functions of management: Plan, Organise, Command, Coordinate, and Control. Coordinate means harmonising the activities and efforts of different parts of the organisation toward common objectives.",
          explanation_ru:
            "Файоль выделил пять функций управления: планировать, организовывать, командовать, координировать и контролировать. Координировать - значит согласовывать действия и усилия разных частей организации для достижения общих целей.",
          explanation_uz:
            "Fayol beshta boshqaruv funksiyasini aniqlagan: Rejalashtirish, Tashkil etish, Buyruq berish, Muvofiqlashtirish va Nazorat. Muvofiqlashtirish tashkilotning turli qismlari faoliyati va sa'y-harakatlarini umumiy maqsadlar sari uyg'unlashtirishni anglatadi.",
        },
        // -------- NEW Q9 - medium MCQ on Vroom expectancy --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "Under Vroom\u2019s expectancy theory, motivation will be LOW even with high effort and high performance if:",
          prompt_ru:
            "По теории ожиданий Врума мотивация будет НИЗКОЙ даже при высоком усилии и высоком результате, если:",
          prompt_uz:
            "Vrumning kutilma nazariyasiga ko'ra, yuqori sa'y-harakat va yuqori natijaga qaramay, motivatsiya quyidagi holatda PAST bo'ladi:",
          options: [
            {
              key: "A",
              text_en:
                "The employee does not value the offered reward (low valence)",
              text_ru:
                "Сотрудник не ценит предлагаемую награду (низкая валентность)",
              text_uz:
                "Xodim taklif qilingan mukofotni qadrlamaydi (past valentlik)",
            },
            {
              key: "B",
              text_en: "The pay is at market rate",
              text_ru: "Оплата на уровне рынка",
              text_uz: "Maosh bozor stavkasida",
              why_wrong_en:
                "Market-rate pay is hygiene-factor territory (Herzberg); Vroom's framework is about the perceived value of rewards, not their absolute level.",
              why_wrong_ru:
                "Рыночный уровень оплаты - это область гигиенических факторов (Герцберг); Врум же - о воспринимаемой ценности награды, а не её абсолютной величине.",
              why_wrong_uz:
                "Bozor stavkasidagi maosh - gigiyena omili hududi (Hertsberg); Vrum doirasi esa mukofotlarning mutlaq darajasi emas, balki idrok etilgan qiymati haqidadir.",
            },
            {
              key: "C",
              text_en: "The manager is autocratic",
              text_ru: "Менеджер авторитарен",
              text_uz: "Menejer avtokratik",
              why_wrong_en:
                "Leadership style is a separate concept; Vroom focuses on the effort-performance-reward chain in the individual's perception.",
              why_wrong_ru:
                "Стиль лидерства - отдельная концепция; Врум фокусируется на цепочке усилие-результат-награда в восприятии самого работника.",
              why_wrong_uz:
                "Yetakchilik uslubi - alohida tushuncha; Vrum esa shaxsning idrokidagi sa'y-harakat-natija-mukofot zanjiriga e'tibor qaratadi.",
            },
            {
              key: "D",
              text_en: "The team is in the storming phase",
              text_ru: "Команда находится на стадии шторминга",
              text_uz: "Jamoa to'qnashuv bosqichida",
              why_wrong_en:
                "Tuckman's team-development stages are unrelated to Vroom's individual-motivation framework.",
              why_wrong_ru:
                "Стадии развития команды по Такмену не связаны с моделью индивидуальной мотивации Врума.",
              why_wrong_uz:
                "Takmenning jamoa rivojlanish bosqichlari Vrumning shaxsiy motivatsiya doirasiga aloqasi yo'q.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            'Vroom\'s formula: Motivation = Expectancy × Instrumentality × Valence. Expectancy is "effort leads to performance"; instrumentality is "performance leads to reward"; valence is "I value this reward". If ANY of the three is zero, motivation is zero - even if the other two are maxed out. A high-effort, high-performance employee will not be motivated if the reward is something they don\'t want.',
          explanation_ru:
            "Формула Врума: Мотивация = Ожидание × Инструментальность × Валентность. Ожидание - «усилие даст результат»; инструментальность - «результат даст награду»; валентность - «эта награда для меня ценна». Если ХОТЯ БЫ ОДИН из трёх множителей равен нулю, мотивация ноль - даже при максимуме двух остальных. Сотрудник с высоким усилием и результатом не будет мотивирован, если предлагаемая награда ему не нужна.",
          explanation_uz:
            "Vrum formulasi: Motivatsiya = Kutilma x Vositachilik x Valentlik. Kutilma - \"sa'y-harakat natijaga olib keladi\"; vositachilik - \"natija mukofotga olib keladi\"; valentlik - \"men bu mukofotni qadrlayman\". Agar uchtadan BIRORTASI nol bo'lsa, motivatsiya nol bo'ladi - qolgan ikkitasi maksimal bo'lsa ham. Yuqori sa'y-harakatli, yuqori natijali xodim mukofot u xohlamaydigan narsa bo'lsa, motivatsiyalanmaydi.",
        },
        // -------- NEW Q10 - medium MCQ on Tuckman scenario --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A new project team has just been formed. Members are polite, somewhat reserved, and waiting for direction from the leader. According to Tuckman, this team is in which stage?",
          prompt_ru:
            "Только что сформирована проектная команда. Участники вежливы, несколько сдержанны и ждут указаний от лидера. По Такмену, на какой стадии находится команда?",
          prompt_uz:
            "Yangi loyiha jamoasi endigina tuzildi. A'zolar xushmuomala, biroz tortinchoq va yetakchidan yo'nalish kutmoqda. Takmenga ko'ra, bu jamoa qaysi bosqichda?",
          options: [
            {
              key: "A",
              text_en: "Forming",
              text_ru: "Формирование",
              text_uz: "Shakllanish",
            },
            {
              key: "B",
              text_en: "Storming",
              text_ru: "Шторминг",
              text_uz: "To'qnashuv",
              why_wrong_en:
                "Storming is marked by conflict and clashes over roles; the team described is still polite and uncertain - earlier than storming.",
              why_wrong_ru:
                "Для шторминга характерны конфликты и столкновения по ролям; описанная команда вежлива и неуверенна - раньше шторминга.",
              why_wrong_uz:
                "To'qnashuv rollar ustidagi ziddiyat va to'qnashuvlar bilan belgilanadi; ta'riflangan jamoa hali xushmuomala va noaniq - to'qnashuvdan oldinroq.",
            },
            {
              key: "C",
              text_en: "Norming",
              text_ru: "Нормирование",
              text_uz: "Me'yorlashish",
              why_wrong_en:
                "Norming requires established trust and agreed ways of working; a brand-new team waiting for direction hasn't reached this.",
              why_wrong_ru:
                "Нормирование требует установленного доверия и согласованных способов работы; только что собранная команда, ожидающая указаний, этого не достигла.",
              why_wrong_uz:
                "Me'yorlashish o'rnatilgan ishonch va kelishilgan ish usullarini talab qiladi; yo'nalish kutayotgan yangi jamoa bunga yetib bormagan.",
            },
            {
              key: "D",
              text_en: "Performing",
              text_ru: "Выполнение",
              text_uz: "Faoliyat ko'rsatish",
              why_wrong_en:
                "Performing is the productive stage with independent, autonomous work; this team has not yet started producing anything.",
              why_wrong_ru:
                "Выполнение - продуктивная стадия с самостоятельной работой; эта команда ещё ничего не производит.",
              why_wrong_uz:
                "Faoliyat ko'rsatish - mustaqil, avtonom ish bilan kechadigan unumdor bosqich; bu jamoa hali hech narsa ishlab chiqara boshlamagan.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Forming is the initial stage: members come together with polite uncertainty, dependent on the leader for direction, focused on understanding the task and one another. Conflict has not yet emerged because roles haven't been challenged. The leader must provide clear direction at this point.",
          explanation_ru:
            "Формирование - начальная стадия: участники собираются с вежливой неуверенностью, зависят от лидера в указаниях, сосредоточены на понимании задачи и друг друга. Конфликт ещё не возник, потому что роли пока не оспариваются. На этом этапе лидер должен давать чёткие указания.",
          explanation_uz:
            "Shakllanish - dastlabki bosqich: a'zolar xushmuomala noaniqlik bilan yig'iladi, yo'nalish uchun yetakchiga bog'liq, vazifani va bir-birini tushunishga e'tiborli. Rollar sinovdan o'tmagani uchun ziddiyat hali yuzaga kelmagan. Yetakchi bu nuqtada aniq yo'nalish berishi kerak.",
        },
        // -------- NEW Q11 - medium MCQ on Belbin --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            'In Belbin\u2019s team roles, the "completer-finisher" is BEST characterised by:',
          prompt_ru:
            "В ролях команды по Белбину «финишёр» ЛУЧШЕ всего характеризуется как:",
          prompt_uz:
            "Belbin jamoa rollarida \"yakunlovchi\" ENG TO'G'RI quyidagicha tavsiflanadi:",
          options: [
            {
              key: "A",
              text_en: "Generating creative ideas and unconventional solutions",
              text_ru: "Генерация креативных идей и нестандартных решений",
              text_uz: "Ijodiy g'oyalar va noan'anaviy yechimlar yaratish",
              why_wrong_en:
                'This describes the "plant" (creative thinker), not the completer-finisher.',
              why_wrong_ru:
                "Это описание роли «генератор идей» (plant), а не финишёра.",
              why_wrong_uz:
                "Bu \"o'simlik\"ni (ijodiy fikrlovchi) ta'riflaydi, yakunlovchini emas.",
            },
            {
              key: "B",
              text_en: "Driving the team forward with energy and challenge",
              text_ru: "Двигает команду вперёд энергией и вызовом",
              text_uz: "Jamoani g'ayrat va da'vat bilan oldinga undash",
              why_wrong_en:
                'This describes the "shaper", whose job is to push for action and overcome obstacles.',
              why_wrong_ru:
                "Это описание роли «формирователь» (shaper): подталкивает к действию и преодолевает препятствия.",
              why_wrong_uz:
                "Bu \"shakllantiruvchi\"ni ta'riflaydi, uning vazifasi harakatga undash va to'siqlarni yengishdir.",
            },
            {
              key: "C",
              text_en:
                "Ensuring nothing is overlooked and meeting deadlines through attention to detail",
              text_ru:
                "Обеспечивает, чтобы ничего не было упущено, и соблюдает сроки за счёт внимания к деталям",
              text_uz:
                "Hech narsa e'tibordan chetda qolmasligini ta'minlash va tafsilotga e'tibor orqali muddatlarga rioya qilish",
            },
            {
              key: "D",
              text_en: "Coordinating others and clarifying goals",
              text_ru: "Координирует других и проясняет цели",
              text_uz:
                "Boshqalarni muvofiqlashtirish va maqsadlarni oydinlashtirish",
              why_wrong_en:
                'This describes the "coordinator" (chairman role), focused on aligning team effort.',
              why_wrong_ru:
                "Это описание роли «координатор» (coordinator), сфокусированной на согласовании усилий команды.",
              why_wrong_uz:
                "Bu \"muvofiqlashtiruvchi\"ni (rais roli) ta'riflaydi, u jamoa sa'y-harakatini uyg'unlashtirishga e'tiborli.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "The completer-finisher is the detail-oriented team member who scrutinises work for errors and omissions, polishes deliverables, and ensures deadlines are met. Their value is in the final phase of any project; without one, teams can struggle to actually finish work to standard.",
          explanation_ru:
            "Финишёр - детально-ориентированный участник команды, проверяющий работу на ошибки и упущения, доводящий результаты до совершенства и обеспечивающий соблюдение сроков. Его ценность раскрывается на финальной стадии любого проекта; без него команды часто не могут довести работу до стандарта.",
          explanation_uz:
            "Yakunlovchi - ishni xato va kamchiliklar uchun sinchiklab tekshiradigan, natijalarni sayqallaydigan va muddatlarga rioya qilinishini ta'minlaydigan, tafsilotga e'tiborli jamoa a'zosidir. Uning qiymati har qanday loyihaning yakuniy bosqichida; usiz jamoalar ishni standart darajada haqiqatan yakunlashga qiynalishi mumkin.",
        },
        // -------- NEW Q12 - medium MCQ on Hersey-Blanchard --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "Under Hersey and Blanchard\u2019s situational leadership, an experienced and self-motivated team member is BEST led using which style?",
          prompt_ru:
            "По ситуационному лидерству Херси и Бланшара опытным и самомотивированным сотрудником ЛУЧШЕ всего руководить через какой стиль?",
          prompt_uz:
            "Hersi va Blanshar vaziyatli yetakchiligiga ko'ra, tajribali va o'zini o'zi rag'batlantiradigan jamoa a'zosini ENG yaxshi qaysi uslub bilan yetaklash kerak?",
          options: [
            {
              key: "A",
              text_en: "Telling - high task, low relationship",
              text_ru: "Указание - высокая задача, низкие отношения",
              text_uz: "Aytish - yuqori vazifa, past munosabat",
              why_wrong_en:
                "Telling fits low-readiness followers who need detailed instructions; an experienced self-motivated member doesn't need this.",
              why_wrong_ru:
                "Указание подходит для подчинённых низкой готовности, которым нужны подробные инструкции; опытному самомотивированному сотруднику это не нужно.",
              why_wrong_uz:
                "Aytish batafsil ko'rsatmaga muhtoj past tayyorlikdagi izdoshlarga mos keladi; tajribali, o'zini o'zi rag'batlantiruvchi a'zo bunga muhtoj emas.",
            },
            {
              key: "B",
              text_en: "Selling - high task, high relationship",
              text_ru: "Продажа - высокая задача, высокие отношения",
              text_uz: "Sotish - yuqori vazifa, yuqori munosabat",
              why_wrong_en:
                "Selling fits followers willing but unable - needing both explanation and encouragement; the scenario is someone fully able.",
              why_wrong_ru:
                "Продажа подходит для подчинённых, желающих, но неспособных, - им нужны и объяснение, и поддержка; в сценарии - полностью способный сотрудник.",
              why_wrong_uz:
                "Sotish xohlovchi, ammo qodir bo'lmagan izdoshlarga mos keladi - ham tushuntirish, ham rag'batlantirishga muhtoj; vaziyatda esa to'liq qodir kishi bor.",
            },
            {
              key: "C",
              text_en: "Participating - low task, high relationship",
              text_ru: "Участие - низкая задача, высокие отношения",
              text_uz: "Ishtirok ettirish - past vazifa, yuqori munosabat",
              why_wrong_en:
                "Participating fits able but unwilling/unsure followers; the scenario is both able AND motivated.",
              why_wrong_ru:
                "Участие подходит для способных, но не желающих/неуверенных подчинённых; в сценарии сотрудник И способен, И мотивирован.",
              why_wrong_uz:
                "Ishtirok ettirish qodir, ammo xohlamaydigan/ishonchsiz izdoshlarga mos keladi; vaziyatda esa kishi HAM qodir, HAM rag'batlangan.",
            },
            {
              key: "D",
              text_en: "Delegating - low task, low relationship",
              text_ru: "Делегирование - низкая задача, низкие отношения",
              text_uz: "Ishonib topshirish - past vazifa, past munosabat",
            },
          ],
          correct_answer_en: "D",
          explanation_en:
            "Hersey and Blanchard match leadership style to follower readiness. High readiness (able + willing) calls for delegating: the leader hands over responsibility with minimal task direction and minimal hand-holding. Over-managing high-readiness staff demotivates them.",
          explanation_ru:
            "Херси и Бланшар подбирают стиль лидерства под зрелость подчинённого. Высокая зрелость (способен и мотивирован) требует делегирования: лидер передаёт ответственность с минимумом указаний и минимумом «опеки». Чрезмерное управление зрелым сотрудником его демотивирует.",
          explanation_uz:
            "Hersi va Blanshar yetakchilik uslubini izdoshning tayyorligiga moslashtiradi. Yuqori tayyorlik (qodir + xohlovchi) ishonib topshirishni (delegating) talab qiladi: yetakchi minimal vazifa yo'naltirishi va minimal qo'llab-quvvatlash bilan mas'uliyatni topshiradi. Yuqori tayyorlikdagi xodimlarni ortiqcha boshqarish ularning motivatsiyasini so'ndiradi.",
        },
        // -------- NEW Q13 - medium short_answer on person spec --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "What is the key difference between a job description and a person specification?",
          prompt_ru:
            "В чём ключевое различие между должностной инструкцией и профилем кандидата?",
          prompt_uz:
            "Lavozim yo'riqnomasi va shaxs talabnomasi o'rtasidagi asosiy farq nima?",
          options: [
            {
              key: "A",
              text_en:
                "A job description sets out the duties of the ROLE; a person specification sets out the qualities required of the POSTHOLDER",
              text_ru:
                "Должностная инструкция описывает обязанности ДОЛЖНОСТИ; профиль кандидата описывает качества, требуемые от РАБОТНИКА",
              text_uz:
                "Lavozim yo'riqnomasi LAVOZIM vazifalarini belgilaydi; shaxs talabnomasi esa NOMZODDAN talab qilinadigan fazilatlarni belgilaydi",
            },
            {
              key: "B",
              text_en:
                "A job description is for permanent staff; a person specification is for temporary staff",
              text_ru:
                "Должностная инструкция - для постоянных сотрудников; профиль кандидата - для временных",
              text_uz:
                "Lavozim yo'riqnomasi doimiy xodimlar uchun; shaxs talabnomasi esa vaqtinchalik xodimlar uchun",
              why_wrong_en:
                "Both documents apply regardless of contract type; the distinction is role-focused vs person-focused, not permanent vs temporary.",
              why_wrong_ru:
                "Оба документа применяются независимо от типа контракта; различие - «о должности» против «о человеке», а не «постоянный» против «временного».",
              why_wrong_uz:
                "Ikkala hujjat ham shartnoma turidan qat'i nazar qo'llaniladi; farq doimiy va vaqtinchalik emas, balki lavozimga va shaxsga qaratilganlikdadir.",
            },
            {
              key: "C",
              text_en:
                "A job description is written by HR; a person specification is written by the candidate",
              text_ru:
                "Должностную инструкцию пишет HR; профиль кандидата пишет сам кандидат",
              text_uz:
                "Lavozim yo'riqnomasi kadrlar bo'limi tomonidan, shaxs talabnomasi esa nomzod tomonidan yoziladi",
              why_wrong_en:
                "Both are prepared by the employer/HR; candidates do not write the person specification.",
              why_wrong_ru:
                "Оба документа готовит работодатель/HR; кандидат профиль не пишет.",
              why_wrong_uz:
                "Ikkalasi ham ish beruvchi/kadrlar bo'limi tomonidan tayyorlanadi; nomzodlar shaxs talabnomasini yozmaydi.",
            },
            {
              key: "D",
              text_en: "They are two names for the same document",
              text_ru: "Это два названия одного и того же документа",
              text_uz: "Ular bir hujjatning ikki nomi",
              why_wrong_en:
                "They are distinct documents: one describes the job's duties, the other the attributes a suitable postholder needs.",
              why_wrong_ru:
                "Это разные документы: один описывает обязанности должности, другой - качества, нужные подходящему работнику.",
              why_wrong_uz:
                "Ular alohida hujjatlar: biri lavozim vazifalarini, ikkinchisi esa mos nomzodga kerakli fazilatlarni ta'riflaydi.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            'A job description answers "what does the role involve?" - duties, responsibilities, reporting lines. A person specification answers "who do we need?" - the skills, experience, qualifications and attributes of a suitable postholder. Together they underpin fair recruitment.',
          explanation_ru:
            "Должностная инструкция отвечает на вопрос «что включает должность?» - обязанности, ответственность, подчинённость. Профиль кандидата отвечает на вопрос «кто нам нужен?» - навыки, опыт, квалификация и качества подходящего работника. Вместе они обеспечивают справедливый подбор.",
          explanation_uz:
            "Lavozim yo'riqnomasi \"lavozim nimani o'z ichiga oladi?\" degan savolga javob beradi - vazifalar, mas'uliyatlar, bo'ysunish chiziqlari. Shaxs talabnomasi esa \"bizga kim kerak?\" degan savolga javob beradi - mos nomzodning ko'nikmalari, tajribasi, malakasi va fazilatlari. Birgalikda ular adolatli ishga qabul qilishni qo'llab-quvvatlaydi.",
        },
        // -------- NEW Q14 - hard MCQ on Maslow scenario --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            "A company runs major redundancies. A surviving employee, previously highly engaged in their personal development, now focuses entirely on job security. Under Maslow, this BEST illustrates:",
          prompt_ru:
            "Компания проводит массовые сокращения. Уцелевший сотрудник, ранее активно занятый личным развитием, теперь полностью сосредоточен на сохранении работы. По Маслоу это ЛУЧШЕ всего иллюстрирует:",
          prompt_uz:
            "Kompaniya yirik qisqartirishlar o'tkazadi. Ilgari shaxsiy rivojlanishiga juda berilgan, omon qolgan xodim endi butunlay ish o'rni xavfsizligiga e'tibor qaratadi. Maslouga ko'ra, bu ENG TO'G'RI quyidagini ko'rsatadi:",
          options: [
            {
              key: "A",
              text_en: "Self-actualisation strengthening",
              text_ru: "Усиление самоактуализации",
              text_uz: "O'zini o'zi namoyon qilishning kuchayishi",
              why_wrong_en:
                "Self-actualisation is at the TOP of the hierarchy; the employee has dropped DOWN to lower-level needs, not up.",
              why_wrong_ru:
                "Самоактуализация - на ВЕРШИНЕ иерархии; сотрудник опустился К НИЖНИМ уровням, а не поднялся выше.",
              why_wrong_uz:
                "O'zini o'zi namoyon qilish ierarxiyaning ENG YUQORISIDA; xodim esa yuqoriga emas, quyi darajadagi ehtiyojlarga PASTGA tushgan.",
            },
            {
              key: "B",
              text_en:
                "Movement down the hierarchy when lower needs become threatened",
              text_ru:
                "Движение вниз по иерархии при угрозе нижним потребностям",
              text_uz:
                "Quyi ehtiyojlar tahdid ostiga tushganda ierarxiya bo'ylab pastga harakat",
            },
            {
              key: "C",
              text_en: "Bypassing intermediate levels of the hierarchy",
              text_ru: "Пропуск промежуточных уровней иерархии",
              text_uz: "Ierarxiyaning oraliq darajalarini chetlab o'tish",
              why_wrong_en:
                "Maslow's model is strictly sequential - needs are addressed in order; there is no bypassing in his framework.",
              why_wrong_ru:
                "Модель Маслоу строго последовательна - потребности удовлетворяются по порядку; пропуск уровней моделью не предусмотрен.",
              why_wrong_uz:
                "Maslou modeli qat'iy ketma-ket - ehtiyojlar tartib bilan qondiriladi; uning doirasida chetlab o'tish yo'q.",
            },
            {
              key: "D",
              text_en: "A shift from intrinsic to extrinsic motivation",
              text_ru: "Сдвиг от внутренней мотивации к внешней",
              text_uz: "Ichki motivatsiyadan tashqi motivatsiyaga o'tish",
              why_wrong_en:
                "Intrinsic/extrinsic is a different framework (often associated with Deci & Ryan); Maslow describes the LEVEL of need, not its source.",
              why_wrong_ru:
                "Внутренняя/внешняя мотивация - другая модель (часто связываемая с Деси и Райаном); Маслоу описывает УРОВЕНЬ потребности, а не её источник.",
              why_wrong_uz:
                "Ichki/tashqi - boshqa doira (ko'pincha Desi va Rayan bilan bog'lanadi); Maslou esa ehtiyojning manbasini emas, DARAJASINI ta'riflaydi.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Maslow's hierarchy isn't a one-way ladder. When lower-level needs come under threat - in this case, safety/security through job loss risk - higher-level concerns are pushed aside. The employee's previous development drive (esteem and self-actualisation territory) is suspended until they feel secure again. This is why organisational change initiatives that threaten job security often fail: they trigger downward movement in the hierarchy for everyone affected.",
          explanation_ru:
            "Иерархия Маслоу - не лестница с односторонним движением. Когда потребности нижнего уровня под угрозой - здесь это безопасность через риск потери работы, - высшие интересы отступают. Прежнее стремление сотрудника к развитию (область уважения и самоактуализации) приостанавливается до восстановления чувства безопасности. Именно поэтому организационные изменения, ставящие под угрозу занятость, часто проваливаются: они вызывают движение вниз по иерархии у всех затронутых.",
          explanation_uz:
            "Maslou ierarxiyasi bir tomonlama narvon emas. Quyi darajadagi ehtiyojlar tahdid ostiga tushganda - bu holatda ishni yo'qotish xavfi orqali xavfsizlik/himoyalanganlik - yuqori darajadagi tashvishlar chetga suriladi. Xodimning oldingi rivojlanish intilishi (hurmat va o'zini o'zi namoyon qilish hududi) o'zini yana xavfsiz his qilmaguncha to'xtatiladi. Aynan shuning uchun ish o'rni xavfsizligiga tahdid soluvchi tashkiliy o'zgarish tashabbuslari ko'pincha barbod bo'ladi: ular ta'sirlangan har bir kishida ierarxiya bo'ylab pastga harakatni keltirib chiqaradi.",
        },
        // -------- NEW Q15 - hard MCQ on integrated leadership scenario --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            "A manager inherits a demoralised team after a failed product launch. Sales targets are tight, individual skills are good, but morale and direction are missing. Combining motivation and leadership theory, the BEST initial approach is:",
          prompt_ru:
            "Менеджер принимает деморализованную команду после неудачного запуска продукта. Планы продаж жёсткие, индивидуальные навыки на уровне, но дух и направление утрачены. Сочетая теорию мотивации и лидерства, НАИЛУЧШИЙ первый подход:",
          prompt_uz:
            "Menejer mahsulot ishga tushishidagi muvaffaqiyatsizlikdan so'ng ruhi tushgan jamoani meros qilib oladi. Sotuv maqsadlari qattiq, individual ko'nikmalar yaxshi, ammo ruhiyat va yo'nalish yo'q. Motivatsiya va yetakchilik nazariyasini birlashtirib, ENG yaxshi dastlabki yondashuv:",
          options: [
            {
              key: "A",
              text_en:
                "Apply autocratic leadership and set strict targets to enforce performance",
              text_ru:
                "Применить авторитарный стиль и поставить жёсткие цели для принуждения к результату",
              text_uz:
                "Avtokratik yetakchilikni qo'llash va faoliyatni ta'minlash uchun qat'iy maqsadlar qo'yish",
              why_wrong_en:
                "Autocratic style on a demoralised but capable team destroys what little engagement remains; this is a Theory X response to a Theory Y problem.",
              why_wrong_ru:
                "Авторитарный стиль на деморализованной, но способной команде уничтожает остатки вовлечённости; это ответ в духе Теории X на проблему Теории Y.",
              why_wrong_uz:
                "Ruhi tushgan, ammo qobiliyatli jamoaga avtokratik uslub qolgan oz jalb etilishni ham yo'q qiladi; bu Y nazariyasi muammosiga X nazariyasi javobidir.",
            },
            {
              key: "B",
              text_en:
                "Use transformational leadership to rebuild shared vision, combined with recognition to address Herzberg motivators",
              text_ru:
                "Применить трансформационное лидерство для восстановления общего видения, сочетая с признанием для активации мотиваторов Герцберга",
              text_uz:
                "Umumiy vizyonni qayta tiklash uchun transformatsion yetakchilikdan, Hertsberg motivatorlarini hal qilish uchun e'tirof bilan birgalikda foydalanish",
            },
            {
              key: "C",
              text_en: "Increase salaries across the team to restore morale",
              text_ru: "Повысить оплату всем для восстановления духа",
              text_uz:
                "Ruhiyatni tiklash uchun jamoa bo'ylab maoshlarni oshirish",
              why_wrong_en:
                "Pay is a Herzberg hygiene factor - it can reduce dissatisfaction but does not by itself create lasting motivation; the underlying problem is direction and meaning, not pay.",
              why_wrong_ru:
                "Зарплата - гигиенический фактор Герцберга: она может снять недовольство, но сама по себе не создаёт устойчивой мотивации; коренная проблема - направление и смысл, а не оплата.",
              why_wrong_uz:
                "Maosh - Hertsberg gigiyena omili: u norozilikni kamaytirishi mumkin, ammo o'zi uzoq muddatli motivatsiya yaratmaydi; asosiy muammo maosh emas, yo'nalish va ma'nodir.",
            },
            {
              key: "D",
              text_en:
                "Adopt laissez-faire leadership to let the team self-organise",
              text_ru:
                "Применить либеральный стиль, позволив команде самоорганизоваться",
              text_uz:
                "Jamoaning o'zini o'zi tashkil etishiga yo'l qo'yish uchun aralashmaslik yetakchiligini qabul qilish",
              why_wrong_en:
                "Laissez-faire on a team that lacks direction will simply prolong drift; self-organisation requires either shared vision or strong individual motivation, both of which are currently absent.",
              why_wrong_ru:
                "Либеральный стиль на команде без направления лишь продлит дрейф; самоорганизация требует либо общего видения, либо сильной индивидуальной мотивации - здесь нет ни того, ни другого.",
              why_wrong_uz:
                "Yo'nalishi yo'q jamoaga aralashmaslik faqat sarsonlikni cho'zadi; o'zini o'zi tashkil etish yo umumiy vizyon, yo kuchli individual motivatsiyani talab qiladi, ikkalasi ham hozir yo'q.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "The team has capability (skills) but lacks meaning and motivation. Transformational leadership directly addresses the missing element - it inspires through a renewed sense of purpose and shared vision. Pairing this with Herzberg motivators (recognition for early wins, achievement opportunities through stretch assignments, growth via skill development) tackles the satisfaction side. Coercive autocratic style or pure pay rises miss the diagnosis: the problem is not capability or hygiene, but meaning.",
          explanation_ru:
            "У команды есть способности (навыки), но нет смысла и мотивации. Трансформационное лидерство прямо адресует отсутствующий элемент - оно вдохновляет через возобновлённое чувство цели и общее видение. Сочетание с мотиваторами Герцберга (признание ранних побед, возможности достижения через стретч-задания, развитие через обучение) закрывает сторону удовлетворённости. Принудительный авторитарный стиль или одно лишь повышение зарплат не попадают в диагноз: проблема не в способностях и не в гигиене, а в смысле.",
          explanation_uz:
            "Jamoada qobiliyat (ko'nikmalar) bor, ammo ma'no va motivatsiya yetishmaydi. Transformatsion yetakchilik aynan shu yetishmayotgan elementni hal qiladi - u yangilangan maqsad tuyg'usi va umumiy vizyon orqali ilhomlantiradi. Buni Hertsberg motivatorlari (dastlabki yutuqlar uchun e'tirof, qiyin topshiriqlar orqali yutuq imkoniyatlari, ko'nikma rivojlantirish orqali o'sish) bilan birlashtirish qoniqish tomonini hal qiladi. Majburlovchi avtokratik uslub yoki sof maosh oshirish esa tashxisni o'tkazib yuboradi: muammo qobiliyat yoki gigiyena emas, balki ma'nodir.",
        },
      ],
    },
    // ---------- E ----------
    {
      code: "E",
      title_en: "Personal effectiveness and communication",
      title_ru: "Личная эффективность и коммуникация",
      title_uz: "Shaxsiy samaradorlik va muloqot",
      description_en:
        "Learning styles, time management, communication, and appraisal.",
      description_ru:
        "Стили обучения, тайм-менеджмент, коммуникация и оценка эффективности.",
      description_uz:
        "O'qish uslublari, vaqtni boshqarish, muloqot va baholash.",
      sort_order: 50,
      theory_en:
        "Personal effectiveness rests on knowing how you learn, planning your time, communicating clearly, and improving through feedback.\n\n" +
        "Learning styles: Honey and Mumford classify learners as Activists (learn by doing, jump in), Reflectors (observe and ponder), Theorists (build models, want logic), and Pragmatists (test ideas in practice - show me what works). Kolb's learning cycle frames learning as four stages: concrete experience → reflective observation → abstract conceptualisation → active experimentation. The two link: each Honey-Mumford style maps to a Kolb stage.\n\n" +
        "Goal-setting uses SMART objectives - Specific, Measurable, Achievable, Relevant, Time-bound. The Time-bound element is the most-tested trap; objectives without a deadline fail SMART. Time management uses the Eisenhower urgent/important matrix: do the urgent-important now, schedule the important-not-urgent, delegate the urgent-not-important, drop the rest.\n\n" +
        "Communication moves a message from sender to receiver through encoding, channel, decoding, and feedback. Barriers include noise (literal or organisational), jargon, distortion, cultural difference, and poor channel choice. Channels split into formal (memos, board reports, formal meetings) and informal (the grapevine, hallway chats); written vs oral; verbal vs non-verbal. Channel choice depends on purpose - sensitive feedback face-to-face, policy changes in writing for record.\n\n" +
        "Improvement happens through counselling (helping someone work through a personal issue), mentoring (longer-term career guidance from a senior figure), and coaching (skill-focused, performance-driven). Appraisal types include formal (scheduled, documented) and informal (ad hoc feedback); 360-degree appraisal collects views from peers, subordinates, and superiors as well as the manager. Good appraisals are two-way conversations, not one-sided judgements, and tie into development plans rather than just rating performance.",
      theory_ru:
        "Личная эффективность строится на понимании того, как вы учитесь, на планировании времени, ясной коммуникации и улучшении через обратную связь.\n\n" +
        "Стили обучения: Хони и Мамфорд классифицируют учащихся как Деятелей (учатся, действуя, бросаются в дело), Рефлексирующих (наблюдают и обдумывают), Теоретиков (строят модели, любят логику) и Прагматиков (проверяют идеи на практике - «покажи, что работает»). Цикл обучения Колба описывает обучение через четыре стадии: конкретный опыт → рефлексивное наблюдение → абстрактная концептуализация → активное экспериментирование. Они связаны: каждый стиль Хони-Мамфорда соответствует стадии Колба.\n\n" +
        "Постановка целей использует SMART-цели - Specific (конкретные), Measurable (измеримые), Achievable (достижимые), Relevant (значимые), Time-bound (с указанным сроком). Элемент Time-bound - самая частая ловушка на экзамене: цель без срока не соответствует SMART. Тайм-менеджмент использует матрицу Эйзенхауэра «срочно/важно»: срочное-важное - делать сейчас, важное-несрочное - планировать, срочное-неважное - делегировать, остальное - отбрасывать.\n\n" +
        "Коммуникация передаёт сообщение от отправителя к получателю через кодирование, канал, декодирование и обратную связь. Барьеры включают шум (буквальный или организационный), профессиональный жаргон, искажение, культурные различия и неудачный выбор канала. Каналы делятся на формальные (служебные записки, отчёты совету, формальные совещания) и неформальные («сарафанное радио», разговоры в коридоре); письменные и устные; вербальные и невербальные. Выбор канала зависит от цели - чувствительную обратную связь дают лично, изменения политики оформляют письменно для фиксации.\n\n" +
        "Улучшение происходит через консультирование (помощь в решении личной проблемы), наставничество (долгосрочное карьерное сопровождение от старшего) и коучинг (фокус на навыке и результате). Виды оценки эффективности: формальная (плановая, документированная) и неформальная (обратная связь по ходу дела); оценка 360 градусов собирает мнения коллег, подчинённых и руководителей помимо непосредственного начальника. Хорошая оценка - это двусторонний разговор, а не одностороннее суждение, и связана с планом развития, а не только с выставлением балла.",
      theory_uz:
        "Shaxsiy samaradorlik qanday o'rganishingizni bilish, vaqtingizni rejalashtirish, aniq muloqot qilish va fikr-mulohaza orqali takomillashishga asoslanadi.\n\nO'qish uslublari: Hani va Mamford o'rganuvchilarni Faollar (qilish orqali o'rganadi, sho'ng'iydi), Mulohazachilar (kuzatadi va o'ylaydi), Nazariyotchilar (modellar quradi, mantiq xohlaydi) va Pragmatiklar (g'oyalarni amalda sinaydi - nima ishlashini ko'rsating)ga tasniflaydi. Kolb o'qish sikli o'rganishni to'rt bosqich sifatida ko'rsatadi: konkret tajriba -> mulohazali kuzatish -> mavhum konseptuallashtirish -> faol tajriba o'tkazish. Ikkalasi bog'liq: har bir Hani-Mamford uslubi Kolb bosqichiga mos keladi.\n\nMaqsad qo'yish SMART maqsadlaridan foydalanadi - Aniq (Specific), O'lchanadigan (Measurable), Erishsa bo'ladigan (Achievable), Tegishli (Relevant), Muddatli (Time-bound). Muddatli element eng ko'p sinaladigan tuzoq; muddatsiz maqsadlar SMARTdan o'tmaydi. Vaqtni boshqarish Eyzenxauerning shoshilinch/muhim matritsasidan foydalanadi: shoshilinch-muhimni hozir bajar, muhim-shoshilinch bo'lmaganni rejalashtir, shoshilinch-muhim bo'lmaganni topshir, qolganini tashlab yubor.\n\nMuloqot xabarni jo'natuvchidan qabul qiluvchiga kodlash, kanal, dekodlash va fikr-mulohaza orqali harakatlantiradi. To'siqlarga shovqin (so'zma-so'z yoki tashkiliy), jargon, buzilish, madaniy farq va kanalning noto'g'ri tanlovi kiradi. Kanallar rasmiy (memorandumlar, kengash hisobotlari, rasmiy yig'ilishlar) va norasmiy (\"uzum tokchasi\" - mish-mishlar, koridordagi suhbatlar)ga; yozma va og'zaki; verbal va noverbalga bo'linadi. Kanal tanlovi maqsadga bog'liq - nozik fikr-mulohaza yuzma-yuz, siyosat o'zgarishlari esa yozuv uchun yozma.\n\nTakomillashish maslahat berish (counselling - kishiga shaxsiy muammoni hal qilishda yordam), murabbiylik (mentoring - yuqori shaxsdan uzoq muddatli karyera yo'naltirishi) va trening (coaching - ko'nikmaga yo'naltirilgan, faoliyatga asoslangan) orqali yuz beradi. Baholash turlariga rasmiy (rejalashtirilgan, hujjatlashtirilgan) va norasmiy (vaqti-vaqti bilan fikr-mulohaza) kiradi; 360 darajali baholash menejer bilan birga tengdoshlar, bo'ysunuvchilar va rahbarlardan fikrlarni yig'adi. Yaxshi baholashlar bir tomonlama hukmlar emas, ikki tomonlama suhbatlardir va shunchaki faoliyatni baholash o'rniga rivojlanish rejalariga bog'lanadi.",
      questions: [
        // -------- existing Q1 (augmented) --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "In an Eisenhower (urgent/important) matrix, a task that is URGENT but NOT IMPORTANT should typically be:",
          prompt_ru:
            "В матрице Эйзенхауэра (срочное/важное) задача, которая СРОЧНАЯ, но НЕ ВАЖНАЯ, обычно должна быть:",
          prompt_uz:
            "Eyzenxauer (shoshilinch/muhim) matritsasida SHOSHILINCH, ammo MUHIM BO'LMAGAN vazifa odatda quyidagicha bo'lishi kerak:",
          options: [
            {
              key: "A",
              text_en: "Done first",
              text_ru: "Выполнена в первую очередь",
              text_uz: "Birinchi bajariladi",
              why_wrong_en:
                '"Done first" applies to important AND urgent tasks; not-important tasks should not consume your top attention.',
              why_wrong_ru:
                "«Сделать в первую очередь» - для важных И срочных задач; неважные не должны занимать главное внимание.",
              why_wrong_uz:
                "\"Birinchi bajarish\" muhim VA shoshilinch vazifalarga tegishli; muhim bo'lmagan vazifalar sizning asosiy e'tiboringizni egallamasligi kerak.",
            },
            {
              key: "B",
              text_en: "Delegated",
              text_ru: "Делегирована",
              text_uz: "Topshiriladi (delegatsiya)",
            },
            {
              key: "C",
              text_en: "Scheduled for later",
              text_ru: "Запланирована на потом",
              text_uz: "Keyinroqqa rejalashtiriladi",
              why_wrong_en:
                "Scheduling fits important-but-not-urgent tasks (e.g. strategic planning); urgent items can't wait.",
              why_wrong_ru:
                "Планирование подходит для важных, но несрочных задач (например, стратегическое планирование); срочные ждать не могут.",
              why_wrong_uz:
                "Rejalashtirish muhim, ammo shoshilinch bo'lmagan vazifalarga mos keladi (masalan, strategik rejalashtirish); shoshilinch narsalar esa kuta olmaydi.",
            },
            {
              key: "D",
              text_en: "Eliminated",
              text_ru: "Исключена",
              text_uz: "Bartaraf etiladi",
              why_wrong_en:
                "Elimination is for tasks that are NEITHER urgent nor important; here the task is urgent, so it does need to be handled.",
              why_wrong_ru:
                "Исключение - для задач, которые НИ срочные, НИ важные; здесь задача срочная, ею надо заняться.",
              why_wrong_uz:
                "Bartaraf etish na shoshilinch, na muhim vazifalar uchun; bu yerda vazifa shoshilinch, shuning uchun u baribir bajarilishi kerak.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Urgent-but-not-important tasks are time-pressured but don\u2019t contribute to long-term goals - ideal candidates for delegation. Important + urgent: do now. Important, not urgent: schedule. Neither: drop.",
          explanation_ru:
            "Срочные, но не важные задачи давят по времени, но не двигают долгосрочные цели - идеальные кандидаты на делегирование. Важные и срочные - делать сейчас, важные, но не срочные - планировать, ни то ни то - отбрасывать.",
          explanation_uz:
            "Shoshilinch, ammo muhim bo'lmagan vazifalar vaqt bosimi ostida, ammo uzoq muddatli maqsadlarga hissa qo'shmaydi - vakolat berish (delegatsiya) uchun ideal nomzodlar. Muhim + shoshilinch: hozir bajar. Muhim, shoshilinch emas: rejalashtir. Hech biri emas: tashlab yubor.",
        },
        // -------- existing Q2 (augmented) --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "Which of the following is a barrier to effective communication?",
          prompt_ru:
            "Что из перечисленного является барьером для эффективной коммуникации?",
          prompt_uz: "Quyidagilardan qaysi biri samarali muloqotga to'siq?",
          options: [
            {
              key: "A",
              text_en: "Active listening",
              text_ru: "Активное слушание",
              text_uz: "Faol tinglash",
              why_wrong_en:
                "Active listening REMOVES barriers - it ensures the receiver hears and understands the sender accurately.",
              why_wrong_ru:
                "Активное слушание УСТРАНЯЕТ барьеры - оно обеспечивает точное восприятие сообщения получателем.",
              why_wrong_uz:
                "Faol tinglash to'siqlarni OLIB TASHLAYDI - u qabul qiluvchi jo'natuvchini aniq eshitishi va tushunishini ta'minlaydi.",
            },
            {
              key: "B",
              text_en: "Feedback loop",
              text_ru: "Обратная связь",
              text_uz: "Fikr-mulohaza halqasi",
              why_wrong_en:
                "A feedback loop is a key element of effective communication - it lets the sender confirm the message was understood.",
              why_wrong_ru:
                "Обратная связь - ключевой элемент эффективной коммуникации: она позволяет отправителю убедиться, что сообщение понято.",
              why_wrong_uz:
                "Fikr-mulohaza halqasi - samarali muloqotning asosiy elementi: u jo'natuvchiga xabar tushunilganini tasdiqlash imkonini beradi.",
            },
            {
              key: "C",
              text_en: "Jargon unfamiliar to the receiver",
              text_ru: "Жаргон, незнакомый получателю",
              text_uz: "Qabul qiluvchiga notanish jargon",
            },
            {
              key: "D",
              text_en: "Clear structure",
              text_ru: "Чёткая структура",
              text_uz: "Aniq tuzilma",
              why_wrong_en:
                "Clear structure REDUCES barriers - it helps the receiver follow the message.",
              why_wrong_ru:
                "Чёткая структура СНИЖАЕТ барьеры - она помогает получателю проследить за сообщением.",
              why_wrong_uz:
                "Aniq tuzilma to'siqlarni KAMAYTIRADI - u qabul qiluvchiga xabarni kuzatishga yordam beradi.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            'Technical jargon the receiver doesn\u2019t understand is a "noise" barrier. The other options are mechanisms that REDUCE communication barriers.',
          explanation_ru:
            "Технический жаргон, непонятный получателю, - это «шумовой» барьер. Остальные варианты, наоборот, СНИЖАЮТ барьеры в коммуникации.",
          explanation_uz:
            "Qabul qiluvchi tushunmaydigan texnik jargon - bu \"shovqin\" to'sig'i. Boshqa variantlar esa muloqot to'siqlarini KAMAYTIRADIGAN mexanizmlardir.",
        },
        // -------- existing Q3 (short_answer, unchanged) --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "Which set correctly names the four learning styles in Honey and Mumford's model?",
          prompt_ru:
            "Какой набор верно называет четыре стиля обучения в модели Хони и Мамфорда?",
          prompt_uz:
            "Qaysi to'plam Hani va Mamford modelidagi to'rtta o'qish uslubini to'g'ri nomlaydi?",
          options: [
            {
              key: "A",
              text_en: "Activist, Reflector, Theorist, Pragmatist",
              text_ru: "Деятель, Рефлексирующий, Теоретик, Прагматик",
              text_uz: "Faol, Mulohazachi, Nazariyotchi, Pragmatik",
            },
            {
              key: "B",
              text_en: "Visual, Auditory, Reading, Kinaesthetic",
              text_ru: "Визуальный, Аудиальный, Чтение, Кинестетический",
              text_uz: "Vizual, Eshitish, O'qish, Kinestetik",
              why_wrong_en:
                "These are the VARK learning preferences, a different model from Honey and Mumford's four styles.",
              why_wrong_ru:
                "Это предпочтения по модели VARK - другая модель, отличная от четырёх стилей Хони и Мамфорда.",
              why_wrong_uz:
                "Bular VARK o'qish afzalliklari bo'lib, Hani va Mamfordning to'rtta uslubidan farqli modeldir.",
            },
            {
              key: "C",
              text_en: "Concrete, Reflective, Abstract, Active",
              text_ru: "Конкретный, Рефлексивный, Абстрактный, Активный",
              text_uz: "Konkret, Mulohazali, Mavhum, Faol",
              why_wrong_en:
                "These describe Kolb's learning CYCLE stages, which Honey and Mumford built on but renamed into four learner TYPES.",
              why_wrong_ru:
                "Это стадии цикла обучения Колба, на основе которого Хони и Мамфорд создали четыре ТИПА учащихся с другими названиями.",
              why_wrong_uz:
                "Bular Kolbning o'qish SIKLI bosqichlarini ta'riflaydi, Hani va Mamford ulardan kelib chiqib to'rtta o'rganuvchi TURIga qayta nomlagan.",
            },
            {
              key: "D",
              text_en: "Activist, Observer, Analyst, Doer",
              text_ru: "Деятель, Наблюдатель, Аналитик, Исполнитель",
              text_uz: "Faol, Kuzatuvchi, Tahlilchi, Bajaruvchi",
              why_wrong_en:
                'Only "Activist" is correct; the model\'s other three are Reflector, Theorist and Pragmatist.',
              why_wrong_ru:
                "Верно только «Деятель»; остальные три в модели - Рефлексирующий, Теоретик и Прагматик.",
              why_wrong_uz:
                "Faqat \"Faol\" to'g'ri; modelning qolgan uchtasi - Mulohazachi, Nazariyotchi va Pragmatik.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Honey and Mumford built on Kolb's learning cycle to define four learner types: Activists (learn by doing/experience), Reflectors (learn by reviewing), Theorists (learn by understanding concepts), and Pragmatists (learn by applying ideas practically).",
          explanation_ru:
            "Хони и Мамфорд развили цикл обучения Колба, выделив четыре типа учащихся: Деятели (учатся через действие/опыт), Рефлексирующие (через осмысление), Теоретики (через понимание концепций) и Прагматики (через практическое применение идей).",
          explanation_uz:
            "Hani va Mamford Kolb o'qish siklidan kelib chiqib to'rtta o'rganuvchi turini aniqladi: Faollar (qilish/tajriba orqali o'rganadi), Mulohazachilar (ko'rib chiqish orqali o'rganadi), Nazariyotchilar (tushunchalarni anglash orqali o'rganadi) va Pragmatiklar (g'oyalarni amalda qo'llash orqali o'rganadi).",
        },
        // -------- existing Q4 (augmented) --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A SMART objective should be Specific, Measurable, Achievable, Relevant and:",
          prompt_ru:
            "Цель по SMART должна быть конкретной, измеримой, достижимой, релевантной и:",
          prompt_uz:
            "SMART maqsad Aniq, O'lchanadigan, Erishsa bo'ladigan, Tegishli va quyidagi bo'lishi kerak:",
          options: [
            {
              key: "A",
              text_en: "Tactical",
              text_ru: "Тактической",
              text_uz: "Taktik",
              why_wrong_en:
                '"Tactical" is a planning-level term, not part of the SMART acronym.',
              why_wrong_ru:
                "«Тактическая» - это термин уровня планирования, не входит в аббревиатуру SMART.",
              why_wrong_uz:
                '"Taktik" - rejalashtirish darajasidagi atama, SMART qisqartmasining qismi emas.',
            },
            {
              key: "B",
              text_en: "Time-bound",
              text_ru: "Ограниченной по времени",
              text_uz: "Muddatli",
            },
            {
              key: "C",
              text_en: "Theoretical",
              text_ru: "Теоретической",
              text_uz: "Nazariy",
              why_wrong_en:
                'SMART objectives must be PRACTICAL and actionable; "theoretical" is the opposite of what SMART requires.',
              why_wrong_ru:
                "Цели SMART должны быть ПРАКТИЧЕСКИМИ и реализуемыми; «теоретическая» - противоположность того, что требует SMART.",
              why_wrong_uz:
                'SMART maqsadlar AMALIY va bajarish mumkin bo\'lishi kerak; "nazariy" esa SMART talab qiladigan narsaning aksidir.',
            },
            {
              key: "D",
              text_en: "Top-down",
              text_ru: "Спущенной сверху",
              text_uz: "Yuqoridan pastga",
              why_wrong_en:
                "Top-down describes a planning APPROACH, not a quality of the objective itself; it is not part of SMART.",
              why_wrong_ru:
                "Top-down - это ПОДХОД к планированию, а не качество самой цели; не входит в SMART.",
              why_wrong_uz:
                "Yuqoridan pastga - bu rejalashtirish YONDASHUVINI ta'riflaydi, maqsadning o'z fazilatini emas; u SMARTning qismi emas.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "The T in SMART stands for Time-bound (or Time-limited): the objective must have a clear deadline.",
          explanation_ru:
            "Буква T в SMART означает «ограниченная по времени»: у цели должен быть чёткий срок.",
          explanation_uz:
            "SMARTdagi T harfi Muddatli (Time-bound yoki Time-limited)ni anglatadi: maqsadning aniq muddati bo'lishi shart.",
        },
        // -------- existing Q5 (augmented) --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en: "The grapevine in an organisation refers to:",
          prompt_ru: "«Виноградная лоза» в организации означает:",
          prompt_uz:
            'Tashkilotdagi "uzum tokchasi" (grapevine) quyidagini anglatadi:',
          options: [
            {
              key: "A",
              text_en: "The formal reporting hierarchy",
              text_ru: "Формальную иерархию подчинения",
              text_uz: "Rasmiy bo'ysunish ierarxiyasi",
              why_wrong_en:
                "The grapevine is INFORMAL - the formal hierarchy is the documented chain of command, the opposite concept.",
              why_wrong_ru:
                "«Лоза» - это НЕФОРМАЛЬНЫЙ канал; формальная иерархия - задокументированная вертикаль управления, противоположное понятие.",
              why_wrong_uz:
                "Uzum tokchasi NORASMIY - rasmiy ierarxiya esa hujjatlashtirilgan buyruq zanjiri, qarama-qarshi tushuncha.",
            },
            {
              key: "B",
              text_en: "A specific information system",
              text_ru: "Конкретную информационную систему",
              text_uz: "Muayyan axborot tizimi",
              why_wrong_en:
                "The grapevine is not a software system; it is the network of person-to-person informal conversations.",
              why_wrong_ru:
                "«Лоза» - не программная система; это сеть личных неформальных разговоров между людьми.",
              why_wrong_uz:
                "Uzum tokchasi - dasturiy tizim emas; u shaxsdan shaxsga norasmiy suhbatlar tarmog'idir.",
            },
            {
              key: "C",
              text_en: "Informal communication channels among employees",
              text_ru: "Неформальные каналы коммуникации между сотрудниками",
              text_uz: "Xodimlar o'rtasidagi norasmiy muloqot kanallari",
            },
            {
              key: "D",
              text_en: "A type of organisational structure",
              text_ru: "Тип организационной структуры",
              text_uz: "Tashkiliy tuzilma turi",
              why_wrong_en:
                "Organisational structures are functional, divisional, matrix etc. - the grapevine is a communication phenomenon, not a structure.",
              why_wrong_ru:
                "Организационные структуры - функциональные, дивизиональные, матричные и т. д. «Лоза» - это коммуникационный феномен, а не структура.",
              why_wrong_uz:
                "Tashkiliy tuzilmalar funksional, divizional, matritsa va h.k. - uzum tokchasi esa tuzilma emas, muloqot hodisasidir.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            'The "grapevine" is the informal network through which information (and rumours) flow. It is fast but unreliable, and managers ignore it at their peril.',
          explanation_ru:
            "«Лоза» - неформальная сеть, по которой циркулируют сведения (и слухи). Она быстра, но ненадёжна, и игнорировать её менеджерам опасно.",
          explanation_uz:
            "\"Uzum tokchasi\" - axborot (va mish-mishlar) oqib o'tadigan norasmiy tarmoq. U tez, ammo ishonchsiz va menejerlar uni e'tibordan chetda qoldirsa xavf ostida qoladi.",
        },
        // -------- NEW Q6 - easy MCQ on Kolb cycle --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en: "Kolb\u2019s learning cycle begins with which stage?",
          prompt_ru: "Цикл обучения Колба начинается с какой стадии?",
          prompt_uz: "Kolbning o'qish sikli qaysi bosqichdan boshlanadi?",
          options: [
            {
              key: "A",
              text_en: "Concrete experience",
              text_ru: "Конкретный опыт",
              text_uz: "Konkret tajriba",
            },
            {
              key: "B",
              text_en: "Reflective observation",
              text_ru: "Рефлексивное наблюдение",
              text_uz: "Mulohazali kuzatish",
              why_wrong_en:
                "Reflective observation is stage TWO - you have to have an experience before you can reflect on it.",
              why_wrong_ru:
                "Рефлексивное наблюдение - ВТОРАЯ стадия: нельзя рефлексировать без предшествующего опыта.",
              why_wrong_uz:
                "Mulohazali kuzatish - IKKINCHI bosqich: mulohaza qilishdan oldin tajribaga ega bo'lishingiz kerak.",
            },
            {
              key: "C",
              text_en: "Abstract conceptualisation",
              text_ru: "Абстрактная концептуализация",
              text_uz: "Mavhum konseptuallashtirish",
              why_wrong_en:
                "Abstract conceptualisation is stage THREE - building theory from reflection, which itself requires prior experience.",
              why_wrong_ru:
                "Абстрактная концептуализация - ТРЕТЬЯ стадия: построение теории из рефлексии, что в свою очередь требует предыдущего опыта.",
              why_wrong_uz:
                "Mavhum konseptuallashtirish - UCHINCHI bosqich: mulohazadan nazariya qurish, bu o'zi oldingi tajribani talab qiladi.",
            },
            {
              key: "D",
              text_en: "Active experimentation",
              text_ru: "Активное экспериментирование",
              text_uz: "Faol tajriba o'tkazish",
              why_wrong_en:
                "Active experimentation is stage FOUR - testing concepts in practice, which closes the cycle.",
              why_wrong_ru:
                "Активное экспериментирование - ЧЕТВЁРТАЯ стадия: проверка концепций на практике, замыкающая цикл.",
              why_wrong_uz:
                "Faol tajriba o'tkazish - TO'RTINCHI bosqich: tushunchalarni amalda sinash, bu siklni yopadi.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Kolb's cycle: concrete experience → reflective observation → abstract conceptualisation → active experimentation → back to concrete experience. The cycle starts with doing/experiencing something, then learning emerges through reflection, theorising, and applying - the loop is continuous.",
          explanation_ru:
            "Цикл Колба: конкретный опыт → рефлексивное наблюдение → абстрактная концептуализация → активное экспериментирование → снова конкретный опыт. Цикл начинается с действия или переживания, затем обучение проходит через рефлексию, теоретизацию и применение - петля непрерывна.",
          explanation_uz:
            "Kolb sikli: konkret tajriba -> mulohazali kuzatish -> mavhum konseptuallashtirish -> faol tajriba o'tkazish -> yana konkret tajribaga. Sikl biror narsani qilish/boshdan kechirish bilan boshlanadi, so'ng o'rganish mulohaza, nazariya va qo'llash orqali yuzaga keladi - halqa uzluksizdir.",
        },
        // -------- NEW Q7 - easy MCQ on coaching vs mentoring --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "A senior partner regularly meets a junior accountant over several years to advise on career development, networking, and longer-term ambitions. This relationship is BEST described as:",
          prompt_ru:
            "Старший партнёр регулярно встречается с младшим бухгалтером в течение нескольких лет, чтобы давать советы по карьере, нетворкингу и долгосрочным целям. Эти отношения ЛУЧШЕ всего описать как:",
          prompt_uz:
            "Katta sherik (partner) bir necha yil davomida kichik buxgalter bilan muntazam uchrashib, karyera rivojlanishi, aloqalar tarmog'i va uzoq muddatli intilishlar bo'yicha maslahat beradi. Bu munosabat ENG TO'G'RI quyidagicha tavsiflanadi:",
          options: [
            {
              key: "A",
              text_en: "Coaching",
              text_ru: "Коучинг",
              text_uz: "Trening (coaching)",
              why_wrong_en:
                "Coaching is skill-focused and performance-driven, typically tied to a specific competency or short-term improvement - not multi-year career guidance.",
              why_wrong_ru:
                "Коучинг ориентирован на навык и результат, привязан к конкретной компетенции или краткосрочному улучшению - не на многолетнее карьерное сопровождение.",
              why_wrong_uz:
                "Trening ko'nikmaga yo'naltirilgan va faoliyatga asoslangan, odatda muayyan kompetensiya yoki qisqa muddatli takomillashishga bog'liq - ko'p yillik karyera yo'naltirishi emas.",
            },
            {
              key: "B",
              text_en: "Mentoring",
              text_ru: "Наставничество",
              text_uz: "Murabbiylik (mentoring)",
            },
            {
              key: "C",
              text_en: "Counselling",
              text_ru: "Консультирование",
              text_uz: "Maslahat berish (counselling)",
              why_wrong_en:
                "Counselling helps with personal issues affecting work; the scenario is about career development, not personal crisis support.",
              why_wrong_ru:
                "Консультирование помогает с личными проблемами, влияющими на работу; в сценарии речь о карьере, а не о личных кризисах.",
              why_wrong_uz:
                "Maslahat berish ishga ta'sir qiluvchi shaxsiy muammolarda yordam beradi; vaziyat esa shaxsiy inqiroz emas, karyera rivojlanishi haqida.",
            },
            {
              key: "D",
              text_en: "Appraisal",
              text_ru: "Оценка эффективности",
              text_uz: "Baholash (appraisal)",
              why_wrong_en:
                "Appraisal is a periodic evaluation of past performance; the scenario describes ongoing developmental advice from a non-manager.",
              why_wrong_ru:
                "Оценка эффективности - периодическая оценка прошлой работы; в сценарии - постоянные развивающие советы от не-руководителя.",
              why_wrong_uz:
                "Baholash - o'tgan faoliyatning davriy bahosi; vaziyat esa menejer bo'lmagan shaxsdan davom etayotgan rivojlanish maslahatini ta'riflaydi.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Mentoring is a longer-term developmental relationship, usually between a senior and junior person who is not the mentee's direct manager. The focus is broad: career path, professional networks, navigating organisational politics, role models. Coaching is narrower (specific skill or behaviour); counselling is for personal difficulty.",
          explanation_ru:
            "Наставничество - это долгосрочные развивающие отношения, обычно между старшим и младшим, который не является непосредственным подчинённым наставника. Фокус широкий: карьерный путь, профессиональные связи, ориентация в организационной политике, ролевые модели. Коучинг - уже (конкретный навык или поведение); консультирование - для личных трудностей.",
          explanation_uz:
            "Murabbiylik (mentoring) - odatda kichik shaxs uchun uning bevosita menejeri bo'lmagan yuqori shaxs bilan uzoq muddatli rivojlanish munosabati. E'tibor keng: karyera yo'li, professional tarmoqlar, tashkiliy siyosatda yo'l topish, namuna shaxslar. Trening (coaching) esa torroq (muayyan ko'nikma yoki xulq-atvor); maslahat berish (counselling) esa shaxsiy qiyinchilik uchundir.",
        },
        // -------- NEW Q8 - easy short_answer on 360-degree --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en: "What best describes a 360-degree appraisal?",
          prompt_ru: "Что лучше всего описывает оценку «360 градусов»?",
          prompt_uz: "360 darajali baholashni eng yaxshi nima ta'riflaydi?",
          options: [
            {
              key: "A",
              text_en:
                "An appraisal that gathers feedback from multiple sources - manager, peers, subordinates and often self-assessment",
              text_ru:
                "Оценка, собирающая обратную связь из нескольких источников - руководитель, коллеги, подчинённые и часто самооценка",
              text_uz:
                "Bir necha manbadan - menejer, tengdoshlar, bo'ysunuvchilar va ko'pincha o'z o'zini baholashdan fikr-mulohaza yig'adigan baholash",
            },
            {
              key: "B",
              text_en:
                "An appraisal conducted only by the employee's line manager",
              text_ru:
                "Оценка, проводимая только непосредственным руководителем",
              text_uz:
                "Faqat xodimning chiziqli menejeri tomonidan o'tkaziladigan baholash",
              why_wrong_en:
                "That is a traditional top-down appraisal; the defining feature of 360-degree is feedback from MULTIPLE sources, not just the manager.",
              why_wrong_ru:
                "Это традиционная оценка «сверху вниз»; отличительная черта «360 градусов» - обратная связь из НЕСКОЛЬКИХ источников, а не только от руководителя.",
              why_wrong_uz:
                "Bu - an'anaviy yuqoridan pastga baholash; 360 darajali baholashning asosiy xususiyati esa faqat menejerdan emas, KO'P manbadan fikr-mulohaza olishdir.",
            },
            {
              key: "C",
              text_en:
                "An appraisal based solely on quantitative sales targets",
              text_ru:
                "Оценка, основанная исключительно на количественных планах продаж",
              text_uz: "Faqat miqdoriy sotuv maqsadlariga asoslangan baholash",
              why_wrong_en:
                "360-degree appraisal is about multi-source qualitative feedback, not a single quantitative metric.",
              why_wrong_ru:
                "Оценка «360 градусов» - это многосторонняя качественная обратная связь, а не один количественный показатель.",
              why_wrong_uz:
                "360 darajali baholash yagona miqdoriy ko'rsatkich emas, ko'p manbali sifatli fikr-mulohaza haqidadir.",
            },
            {
              key: "D",
              text_en: "An appraisal carried out once every 360 days",
              text_ru: "Оценка, проводимая раз в 360 дней",
              text_uz: "Har 360 kunda bir marta o'tkaziladigan baholash",
              why_wrong_en:
                'The "360" refers to a full circle of feedback sources, not a time interval.',
              why_wrong_ru:
                "«360» означает полный круг источников обратной связи, а не временной интервал.",
              why_wrong_uz:
                "\"360\" vaqt oralig'ini emas, fikr-mulohaza manbalarining to'liq doirasini anglatadi.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "A 360-degree appraisal seeks a balanced, multi-perspective view of performance by gathering feedback from those around the employee - line manager, peers, subordinates, and often the individual's own self-assessment (and sometimes external stakeholders).",
          explanation_ru:
            "Оценка «360 градусов» стремится дать сбалансированный, многосторонний взгляд на результаты, собирая обратную связь от окружения сотрудника - руководителя, коллег, подчинённых и часто самооценку (иногда и от внешних сторон).",
          explanation_uz:
            "360 darajali baholash xodim atrofidagilardan - chiziqli menejer, tengdoshlar, bo'ysunuvchilar va ko'pincha shaxsning o'z o'zini baholashidan (va ba'zan tashqi manfaatdor tomonlardan) fikr-mulohaza yig'ish orqali faoliyatga muvozanatli, ko'p tomonlama qarashni izlaydi.",
        },
        // -------- NEW Q9 - medium MCQ on channel choice --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A manager needs to give a senior employee constructive feedback on poor performance over the past quarter. Which communication channel is MOST appropriate?",
          prompt_ru:
            "Руководителю нужно дать старшему сотруднику конструктивную обратную связь по плохим результатам прошлого квартала. Какой канал коммуникации НАИБОЛЕЕ уместен?",
          prompt_uz:
            "Menejer katta xodimga so'nggi chorakdagi sust faoliyat bo'yicha konstruktiv fikr-mulohaza berishi kerak. Qaysi muloqot kanali ENG MAQBUL?",
          options: [
            {
              key: "A",
              text_en: "Group email cc'ing the team",
              text_ru: "Групповая электронная почта с копией всей команде",
              text_uz: "Jamoani nusxaga qo'ygan guruh elektron xati",
              why_wrong_en:
                "Publicly shaming an employee through cc to the team is unprofessional and likely to entrench defensive behaviour - worst possible choice.",
              why_wrong_ru:
                "Публичное «осуждение» сотрудника путём копии всей команде непрофессионально и закрепляет защитную реакцию - худший возможный выбор.",
              why_wrong_uz:
                "Xodimni jamoaga nusxa qo'yish orqali ommaviy sharmanda qilish noprofessional va himoyalanish xatti-harakatini mustahkamlashi ehtimoli yuqori - eng yomon tanlov.",
            },
            {
              key: "B",
              text_en: "A face-to-face one-on-one meeting",
              text_ru: "Личная встреча один на один",
              text_uz: "Yuzma-yuz birga-bir uchrashuv",
            },
            {
              key: "C",
              text_en: "A formal written notice without prior discussion",
              text_ru:
                "Формальное письменное уведомление без предварительного разговора",
              text_uz: "Oldindan muhokamasiz rasmiy yozma ogohlantirish",
              why_wrong_en:
                "Skipping conversation removes the chance to understand context and demonstrate concern; written-first is appropriate for disciplinary records, not for initial feedback.",
              why_wrong_ru:
                "Пропуск разговора лишает возможности понять контекст и проявить заботу; письменно сначала - для дисциплинарных записей, а не для первичной обратной связи.",
              why_wrong_uz:
                "Suhbatni o'tkazib yuborish kontekstni tushunish va g'amxo'rlik ko'rsatish imkonini yo'qotadi; avval yozma ravishda - bu intizomiy yozuvlar uchun mos, dastlabki fikr-mulohaza uchun emas.",
            },
            {
              key: "D",
              text_en: "A public announcement at the next team meeting",
              text_ru: "Публичное объявление на следующей встрече команды",
              text_uz: "Keyingi jamoa yig'ilishidagi ommaviy e'lon",
              why_wrong_en:
                "Public criticism humiliates rather than corrects; the message should be private to allow honest two-way conversation.",
              why_wrong_ru:
                "Публичная критика унижает, а не исправляет; разговор должен быть приватным, чтобы обеспечить честный двусторонний обмен.",
              why_wrong_uz:
                "Ommaviy tanqid tuzatish o'rniga sharmanda qiladi; xabar halol ikki tomonlama suhbatga imkon berish uchun maxfiy bo'lishi kerak.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            'Sensitive feedback requires a "rich" channel - face-to-face conversation, which carries tone, body language, and immediate two-way feedback. The conversation should be private to preserve dignity, and may be followed up in writing for the record. The rule: the more sensitive the message, the richer the channel; the more procedural, the more written-formal.',
          explanation_ru:
            "Чувствительная обратная связь требует «богатого» канала - личного разговора, передающего интонацию, язык тела и мгновенный двусторонний обмен. Разговор должен быть приватным для сохранения достоинства, потом возможно письменное подтверждение для фиксации. Правило: чем чувствительнее сообщение, тем «богаче» канал; чем более процедурно - тем более письменно и формально.",
          explanation_uz:
            "Nozik fikr-mulohaza \"boy\" kanalni talab qiladi - yuzma-yuz suhbat, u ohang, tana tili va darhol ikki tomonlama fikr-mulohazani uzatadi. Suhbat qadr-qimmatni saqlash uchun maxfiy bo'lishi va yozuv uchun keyin yozma ravishda davom ettirilishi mumkin. Qoida: xabar qanchalik nozik bo'lsa, kanal shunchalik boy; qanchalik protsedurali bo'lsa, shunchalik yozma-rasmiy.",
        },
        // -------- NEW Q10 - medium MCQ on Honey-Mumford scenario --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            'A team member always wants to understand the theoretical framework behind a new task before starting work, asking "how does this connect to what we know?" This BEST fits which Honey and Mumford style?',
          prompt_ru:
            "Сотрудник всегда хочет понять теоретическую базу новой задачи перед началом работы, спрашивая «как это связано с тем, что мы знаем?» К какому стилю Хони и Мамфорда это ЛУЧШЕ всего относится?",
          prompt_uz:
            "Jamoa a'zosi yangi vazifani boshlashdan oldin har doim uning ortidagi nazariy doirani tushunishni xohlaydi va \"bu biz bilgan narsalar bilan qanday bog'lanadi?\" deb so'raydi. Bu Hani va Mamfordning qaysi uslubiga ENG yaxshi mos keladi?",
          options: [
            {
              key: "A",
              text_en: "Activist",
              text_ru: "Деятель",
              text_uz: "Faol",
              why_wrong_en:
                "Activists jump straight into doing without seeking theoretical understanding first - the opposite behaviour.",
              why_wrong_ru:
                "Деятели сразу бросаются в действие без теоретического осмысления - противоположное поведение.",
              why_wrong_uz:
                "Faollar oldin nazariy tushunchani izlamasdan to'g'ridan-to'g'ri qilishga sho'ng'iydi - qarama-qarshi xatti-harakat.",
            },
            {
              key: "B",
              text_en: "Reflector",
              text_ru: "Рефлектор",
              text_uz: "Mulohazachi",
              why_wrong_en:
                "Reflectors observe and ponder past events; they don't specifically need theoretical frameworks before acting.",
              why_wrong_ru:
                "Рефлекторы наблюдают и обдумывают уже произошедшее; они не обязательно требуют теоретической рамки перед действием.",
              why_wrong_uz:
                "Mulohazachilar o'tgan voqealarni kuzatadi va o'ylaydi; ular harakat qilishdan oldin aynan nazariy doiralarga muhtoj emas.",
            },
            {
              key: "C",
              text_en: "Theorist",
              text_ru: "Теоретик",
              text_uz: "Nazariyotchi",
            },
            {
              key: "D",
              text_en: "Pragmatist",
              text_ru: "Прагматик",
              text_uz: "Pragmatik",
              why_wrong_en:
                'Pragmatists ask "does this work in practice?" - they want to apply, not understand the theory first.',
              why_wrong_ru:
                "Прагматики спрашивают «работает ли это на практике?» - им важно применить, а не сначала разобраться в теории.",
              why_wrong_uz:
                "Pragmatiklar \"bu amalda ishlaydimi?\" deb so'raydi - ular avval nazariyani tushunishni emas, qo'llashni xohlaydi.",
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            'Theorists build mental models - they want logic, structure, and how a new piece fits into a coherent framework. Asking "how does this connect to what we know?" is the classic theorist move. The four styles map roughly to Kolb stages: Activists to concrete experience, Reflectors to observation, Theorists to abstract conceptualisation, Pragmatists to active experimentation.',
          explanation_ru:
            "Теоретики строят ментальные модели - им важны логика, структура и встроенность нового в связную систему. Вопрос «как это связано с тем, что мы уже знаем?» - классическое поведение теоретика. Четыре стиля примерно соответствуют стадиям Колба: Деятели - конкретный опыт, Рефлекторы - наблюдение, Теоретики - абстрактная концептуализация, Прагматики - активное экспериментирование.",
          explanation_uz:
            "Nazariyotchilar fikriy modellar quradi - ular mantiq, tuzilma va yangi qism uyg'un doiraga qanday mos kelishini xohlaydi. \"Bu biz bilgan narsalar bilan qanday bog'lanadi?\" deb so'rash - klassik nazariyotchi yondashuvidir. To'rtta uslub taxminan Kolb bosqichlariga mos keladi: Faollar konkret tajribaga, Mulohazachilar kuzatishga, Nazariyotchilar mavhum konseptuallashtirishga, Pragmatiklar faol tajribaga.",
        },
        // -------- NEW Q11 - medium MCQ on communication noise --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "During a video call between a London headquarters and a Mumbai office, three issues arise simultaneously: a poor internet connection causes audio dropouts, the London speaker uses British financial terminology unfamiliar to the Indian team, and the time-zone difference means the Mumbai staff are tired at the end of their day. Which TYPE of barrier does poor internet connectivity primarily represent?",
          prompt_ru:
            "Во время видеосвязи между головным офисом в Лондоне и офисом в Мумбаи возникают три проблемы одновременно: плохое интернет-соединение вызывает обрывы звука, лондонский докладчик использует британскую финансовую терминологию, незнакомую индийской команде, а разница во времени делает мумбайских сотрудников уставшими к концу рабочего дня. Какой ТИП барьера представляет плохое интернет-соединение?",
          prompt_uz:
            "London bosh ofisi bilan Mumbay ofisi o'rtasidagi video qo'ng'iroq paytida bir vaqtda uchta muammo yuzaga keladi: yomon internet aloqasi audioning uzilishiga sabab bo'ladi, London ma'ruzachisi hind jamoasiga notanish britancha moliyaviy atamalarni ishlatadi va vaqt mintaqasi farqi tufayli Mumbay xodimlari ish kunining oxirida charchagan. Yomon internet aloqasi asosan qaysi TUR to'siqni ifodalaydi?",
          options: [
            {
              key: "A",
              text_en: "Semantic (language/jargon)",
              text_ru: "Семантический (язык/жаргон)",
              text_uz: "Semantik (til/jargon)",
              why_wrong_en:
                "Semantic barriers are about word meaning - the British financial terminology is the semantic barrier here, not the audio dropouts.",
              why_wrong_ru:
                "Семантические барьеры - про значение слов; британская финансовая терминология и есть семантический барьер, а не обрывы звука.",
              why_wrong_uz:
                "Semantik to'siqlar so'z ma'nosi haqida - bu yerda britancha moliyaviy atamalar semantik to'siq, audio uzilishlari emas.",
            },
            {
              key: "B",
              text_en: "Physical (noise/medium)",
              text_ru: "Физический (шум/среда)",
              text_uz: "Jismoniy (shovqin/vosita)",
            },
            {
              key: "C",
              text_en: "Psychological (fatigue/emotion)",
              text_ru: "Психологический (усталость/эмоции)",
              text_uz: "Psixologik (charchoq/his-tuyg'u)",
              why_wrong_en:
                "Psychological barriers cover the tiredness of the Mumbai team, but not the technical audio dropouts described.",
              why_wrong_ru:
                "Психологические барьеры - про усталость мумбайской команды, но не про технические обрывы звука.",
              why_wrong_uz:
                "Psixologik to'siqlar Mumbay jamoasining charchog'ini qamrab oladi, ammo ta'riflangan texnik audio uzilishlarini emas.",
            },
            {
              key: "D",
              text_en: "Cultural (different reference frames)",
              text_ru: "Культурный (различные системы взглядов)",
              text_uz: "Madaniy (turli mos yozuvlar doirasi)",
              why_wrong_en:
                "Cultural barriers relate to different conventions and expectations across cultures; the audio dropouts are a technical issue, not a cultural one.",
              why_wrong_ru:
                "Культурные барьеры - это разные конвенции и ожидания между культурами; обрывы звука - техническая проблема, не культурная.",
              why_wrong_uz:
                "Madaniy to'siqlar madaniyatlar bo'ylab turli odatlar va kutilmalarga aloqador; audio uzilishlari esa madaniy emas, texnik muammodir.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            'Communication barriers are classified by type. Physical barriers (sometimes called "noise" or "medium" barriers) include literal interference with the channel: bad audio, distance, faulty equipment. Semantic barriers come from language and jargon. Psychological barriers come from emotional state. Cultural barriers come from differing reference frames. The scenario contains all four types, but the question asks specifically about the internet connectivity issue, which is physical.',
          explanation_ru:
            "Коммуникационные барьеры классифицируются по типу. Физические (иногда называемые «шумовыми» или связанными со средой) - это буквальные помехи каналу: плохое аудио, расстояние, неисправное оборудование. Семантические - из языка и жаргона. Психологические - из эмоционального состояния. Культурные - из разных систем восприятия. Сценарий содержит все четыре типа, но вопрос - конкретно про интернет-соединение, что относится к физическим барьерам.",
          explanation_uz:
            "Muloqot to'siqlari tur bo'yicha tasniflanadi. Jismoniy to'siqlar (ba'zan \"shovqin\" yoki \"vosita\" to'siqlari deyiladi) kanalga so'zma-so'z xalal beradi: yomon audio, masofa, nosoz uskuna. Semantik to'siqlar til va jargondan kelib chiqadi. Psixologik to'siqlar his-tuyg'u holatidan kelib chiqadi. Madaniy to'siqlar turli mos yozuvlar doirasidan kelib chiqadi. Vaziyatda to'rtala tur ham bor, ammo savol aynan internet aloqasi muammosi haqida, u esa jismoniydir.",
        },
        // -------- NEW Q12 - medium MCQ on formal vs informal --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A board of directors needs to communicate a major policy change to all employees. The MOST appropriate channel is:",
          prompt_ru:
            "Совет директоров должен сообщить всем сотрудникам о крупном изменении политики. НАИБОЛЕЕ подходящий канал:",
          prompt_uz:
            "Direktorlar kengashi barcha xodimlarga yirik siyosat o'zgarishini yetkazishi kerak. ENG MAQBUL kanal:",
          options: [
            {
              key: "A",
              text_en: "Informal conversation through the grapevine",
              text_ru: "Неформальный разговор через «лозу»",
              text_uz: "Uzum tokchasi orqali norasmiy suhbat",
              why_wrong_en:
                "The grapevine distorts messages and provides no record; major policy needs documented, controlled communication.",
              why_wrong_ru:
                "«Лоза» искажает сообщения и не оставляет следа; для крупной политики нужна задокументированная и контролируемая коммуникация.",
              why_wrong_uz:
                "Uzum tokchasi xabarlarni buzadi va hech qanday yozuv qoldirmaydi; yirik siyosat hujjatlashtirilgan, nazorat qilinadigan muloqotni talab qiladi.",
            },
            {
              key: "B",
              text_en:
                "A formal written communication, with team meetings to discuss",
              text_ru:
                "Формальное письменное сообщение с обсуждением на встречах команды",
              text_uz:
                "Rasmiy yozma muloqot, muhokama uchun jamoa yig'ilishlari bilan",
            },
            {
              key: "C",
              text_en: "Word-of-mouth via line managers only",
              text_ru: "Только устная передача через линейных руководителей",
              text_uz: "Faqat chiziqli menejerlar orqali og'zaki yetkazish",
              why_wrong_en:
                'Verbal-only relay through layers of management invites distortion (the "Chinese whispers" effect); written formality preserves the message integrity.',
              why_wrong_ru:
                "Только устная передача через слои управления провоцирует искажения (эффект «испорченного телефона»); письменная формализация сохраняет целостность сообщения.",
              why_wrong_uz:
                'Boshqaruv qatlamlari orqali faqat og\'zaki yetkazish buzilishni keltirib chiqaradi ("karaxt telefon" effekti); yozma rasmiylik esa xabar yaxlitligini saqlaydi.',
            },
            {
              key: "D",
              text_en: "A casual post on the company social channel",
              text_ru: "Неофициальный пост в корпоративном чате",
              text_uz: "Kompaniyaning ijtimoiy kanalidagi oddiy post",
              why_wrong_en:
                "A major policy change is too significant for an informal tone; the casual format undermines the message's seriousness.",
              why_wrong_ru:
                "Крупное изменение политики слишком значимо для неформального тона; формат подрывает серьёзность сообщения.",
              why_wrong_uz:
                "Yirik siyosat o'zgarishi norasmiy ohang uchun juda muhim; oddiy format xabarning jiddiyligini susaytiradi.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Major policy requires formal written communication (for record, clarity, and accountability) PLUS supporting meetings (to explain context, answer questions, and gather feedback). Channels should match purpose: a written-only approach misses the dialogue dimension; an informal-only approach lacks authority and record.",
          explanation_ru:
            "Крупная политика требует формального письменного сообщения (для фиксации, ясности и подотчётности) ПЛЮС поддерживающих встреч (объяснить контекст, ответить на вопросы, собрать обратную связь). Канал должен соответствовать цели: только письменно - нет диалога; только неформально - нет авторитета и фиксации.",
          explanation_uz:
            "Yirik siyosat rasmiy yozma muloqotni (yozuv, aniqlik va javobgarlik uchun) HAMDA qo'llab-quvvatlovchi yig'ilishlarni (kontekstni tushuntirish, savollarga javob berish va fikr-mulohaza yig'ish uchun) talab qiladi. Kanallar maqsadga mos kelishi kerak: faqat yozma yondashuv suhbat o'lchamini o'tkazib yuboradi; faqat norasmiy yondashuv esa vakolat va yozuvdan mahrum.",
        },
        // -------- NEW Q13 - medium short_answer on Eisenhower --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "In the Eisenhower matrix, what is the recommended action for a task that is IMPORTANT but NOT URGENT?",
          prompt_ru:
            "Что рекомендует матрица Эйзенхауэра для задачи, которая ВАЖНА, но НЕ СРОЧНА?",
          prompt_uz:
            "Eyzenxauer matritsasida MUHIM, ammo SHOSHILINCH BO'LMAGAN vazifa uchun tavsiya etilgan harakat nima?",
          options: [
            {
              key: "A",
              text_en: "Schedule it - plan a specific time to do it",
              text_ru:
                "Запланировать - выделить конкретное время для выполнения",
              text_uz: "Rejalashtir - uni bajarish uchun aniq vaqt belgila",
            },
            {
              key: "B",
              text_en: "Do it immediately",
              text_ru: "Сделать немедленно",
              text_uz: "Darhol bajar",
              why_wrong_en:
                '"Do it now" is for IMPORTANT AND URGENT tasks; important-but-not-urgent work should be scheduled, not rushed.',
              why_wrong_ru:
                "«Сделать сейчас» - для ВАЖНЫХ И СРОЧНЫХ задач; важное, но не срочное следует планировать, а не спешить.",
              why_wrong_uz:
                '"Hozir bajar" MUHIM VA SHOSHILINCH vazifalar uchun; muhim, ammo shoshilinch bo\'lmagan ish shoshilmasdan rejalashtirilishi kerak.',
            },
            {
              key: "C",
              text_en: "Delegate it",
              text_ru: "Делегировать",
              text_uz: "Topshir (delegatsiya)",
              why_wrong_en:
                "Delegation suits URGENT but NOT IMPORTANT tasks; an important task generally warrants your own attention, scheduled.",
              why_wrong_ru:
                "Делегирование подходит для СРОЧНЫХ, но НЕ ВАЖНЫХ задач; важная задача обычно требует вашего внимания по графику.",
              why_wrong_uz:
                "Vakolat berish SHOSHILINCH, ammo MUHIM BO'LMAGAN vazifalarga mos keladi; muhim vazifa esa odatda rejalashtirilgan holda sizning e'tiboringizga loyiq.",
            },
            {
              key: "D",
              text_en: "Delete it",
              text_ru: "Удалить",
              text_uz: "O'chir",
              why_wrong_en:
                "Deleting/ignoring is for tasks that are NEITHER important NOR urgent; an important task must not be dropped.",
              why_wrong_ru:
                "Удаление/игнорирование - для задач, которые НИ важны, НИ срочны; важную задачу отбрасывать нельзя.",
              why_wrong_uz:
                "O'chirish/e'tiborsiz qoldirish na muhim, na shoshilinch vazifalar uchun; muhim vazifa tashlab yuborilmasligi kerak.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            'The Eisenhower matrix sorts tasks by importance and urgency. Important-not-urgent is the "quadrant of quality": schedule dedicated time so these valuable tasks get done before they become urgent crises.',
          explanation_ru:
            "Матрица Эйзенхауэра сортирует задачи по важности и срочности. Важное-несрочное - это «квадрант качества»: выделите время заранее, чтобы выполнить ценные задачи до того, как они станут срочными кризисами.",
          explanation_uz:
            'Eyzenxauer matritsasi vazifalarni muhimlik va shoshilinchlik bo\'yicha saralaydi. Muhim, shoshilinch emas - bu "sifat choragi": bu qimmatli vazifalar shoshilinch inqirozga aylanishidan oldin bajarilishi uchun ularga maxsus vaqt rejalashtiring.',
        },
        // -------- NEW Q14 - hard MCQ on appraisal pitfalls --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            'A manager rates all team members as "meets expectations" to avoid difficult conversations, even when performance clearly varies. This is BEST described as:',
          prompt_ru:
            "Руководитель ставит всем участникам команды оценку «соответствует ожиданиям», чтобы избежать трудных разговоров, даже когда результаты явно различаются. Это ЛУЧШЕ всего описать как:",
          prompt_uz:
            "Menejer faoliyat aniq farq qilsa ham, qiyin suhbatlardan qochish uchun barcha jamoa a'zolarini \"kutilmalarga javob beradi\" deb baholaydi. Bu ENG TO'G'RI quyidagicha tavsiflanadi:",
          options: [
            {
              key: "A",
              text_en: "Halo effect",
              text_ru: "Эффект ореола",
              text_uz: "Halo (gardish) effekti",
              why_wrong_en:
                "Halo effect is when one positive trait dominates the rater's overall impression of an individual; here the manager applies the same rating to ALL, regardless of trait.",
              why_wrong_ru:
                "Эффект ореола - когда одна положительная черта определяет общее впечатление об одном человеке; здесь же руководитель ставит одинаковую оценку ВСЕМ, независимо от черт.",
              why_wrong_uz:
                "Halo effekti - bitta ijobiy xususiyat baholovchining shaxs haqidagi umumiy taassurotiga hukmronlik qilganda; bu yerda esa menejer xususiyatdan qat'i nazar BARCHAGA bir xil baho qo'yadi.",
            },
            {
              key: "B",
              text_en: "Central tendency bias",
              text_ru: "Тенденция к среднему",
              text_uz: "Markazga moyillik xatosi",
            },
            {
              key: "C",
              text_en: "Recency effect",
              text_ru: "Эффект недавности",
              text_uz: "Yaqinlik (recency) effekti",
              why_wrong_en:
                "Recency effect is overweighting recent events; here the bias is about avoiding extremes, not about timing.",
              why_wrong_ru:
                "Эффект недавности - это переоценка недавних событий; в данном случае предвзятость - про избегание крайностей, а не про время.",
              why_wrong_uz:
                "Yaqinlik effekti - so'nggi voqealarga ortiqcha urg'u berish; bu yerda xato esa vaqt haqida emas, chetki baholardan qochish haqidadir.",
            },
            {
              key: "D",
              text_en: "Stereotyping",
              text_ru: "Стереотипизация",
              text_uz: "Stereotiplash",
              why_wrong_en:
                "Stereotyping applies group-based judgements to individuals; here the bias is the opposite - refusing to differentiate at all.",
              why_wrong_ru:
                "Стереотипизация - применение группового суждения к отдельному человеку; здесь - наоборот, отказ от различения.",
              why_wrong_uz:
                "Stereotiplash guruhga asoslangan hukmlarni shaxslarga qo'llaydi; bu yerda xato esa aksincha - umuman farqlashdan bosh tortishdir.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            'Central tendency bias is the rater\'s tendency to give all employees average scores, avoiding the extremes of "outstanding" or "unsatisfactory". The motive is usually conflict-avoidance: top ratings raise expectations, low ratings provoke disputes. The cost: high performers feel unrecognised; poor performers see no signal to improve; the appraisal system loses its usefulness as a differentiator.',
          explanation_ru:
            "Тенденция к среднему - это склонность оценщика ставить всем средние оценки, избегая крайних «выдающихся» и «неудовлетворительных». Мотив обычно - избегание конфликта: высокие оценки повышают ожидания, низкие провоцируют споры. Цена: лучшие сотрудники чувствуют непризнание, плохие не получают сигнала к улучшению, а система оценки теряет смысл как инструмент дифференциации.",
          explanation_uz:
            "Markazga moyillik (central tendency) xatosi - baholovchining \"a'lo\" yoki \"qoniqarsiz\" kabi chetki baholardan qochib, barcha xodimlarga o'rtacha ball berish tendensiyasidir. Sabab odatda ziddiyatdan qochish: yuqori baholar kutilmani oshiradi, past baholar bahsni keltirib chiqaradi. Narxi: yuqori natijalilar tan olinmagandek his qiladi; sust natijalilar takomillashish uchun signal ko'rmaydi; baholash tizimi farqlovchi sifatida foydaliligini yo'qotadi.",
        },
        // -------- NEW Q15 - hard MCQ on cross-cultural scenario --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            'A UK-based manager gives feedback by saying "your work was not perfect but largely fine." Working with a German colleague who values directness and a Japanese colleague accustomed to indirect communication, the MOST LIKELY outcome is:',
          prompt_ru:
            "Британский руководитель даёт обратную связь словами «работа была не идеальна, но в целом нормальная». В общении с немецким коллегой, ценящим прямоту, и японским коллегой, привычным к непрямой коммуникации, НАИБОЛЕЕ ВЕРОЯТНЫЙ исход:",
          prompt_uz:
            "Buyuk Britaniyalik menejer \"ishingiz mukammal emas edi, ammo asosan yaxshi\" deb fikr-mulohaza beradi. To'g'ridan-to'g'rilikni qadrlovchi nemis hamkasb va bilvosita muloqotga o'rgangan yapon hamkasb bilan ishlaganda, ENG EHTIMOLLI natija:",
          options: [
            {
              key: "A",
              text_en: "Both colleagues interpret the message identically",
              text_ru: "Оба коллеги одинаково истолкуют сообщение",
              text_uz: "Ikkala hamkasb ham xabarni bir xil talqin qiladi",
              why_wrong_en:
                "The whole point of cultural barriers is that the SAME message lands differently depending on the receiver's communication conventions.",
              why_wrong_ru:
                "Вся суть культурных барьеров в том, что ОДНО и то же сообщение по-разному воспринимается в зависимости от коммуникационных конвенций получателя.",
              why_wrong_uz:
                "Madaniy to'siqlarning butun mohiyati shundaki, BIR XIL xabar qabul qiluvchining muloqot odatlariga qarab har xil yetib boradi.",
            },
            {
              key: "B",
              text_en:
                "The German colleague reads it as overly soft, possibly avoiding real criticism; the Japanese colleague may read it as unusually direct/harsh",
              text_ru:
                "Немецкий коллега воспримет это как слишком мягко, возможно, как уход от реальной критики; японский коллега может воспринять как необычно прямо/жёстко",
              text_uz:
                "Nemis hamkasb uni haddan tashqari yumshoq, ehtimol haqiqiy tanqitdan qochish deb o'qiydi; yapon hamkasb esa uni g'ayrioddiy to'g'ridan-to'g'ri/qattiq deb o'qishi mumkin",
            },
            {
              key: "C",
              text_en: "Both colleagues understand the message as praise",
              text_ru: "Оба коллеги воспримут сообщение как похвалу",
              text_uz: "Ikkala hamkasb ham xabarni maqtov deb tushunadi",
              why_wrong_en:
                "The phrase contains mixed signals; reading it as unambiguous praise misses the cultural-context point entirely.",
              why_wrong_ru:
                "В фразе смешанные сигналы; восприятие её как однозначной похвалы упускает суть культурного контекста.",
              why_wrong_uz:
                "Ibora aralash signallarni o'z ichiga oladi; uni so'zsiz maqtov deb o'qish madaniy kontekst nuqtasini butunlay o'tkazib yuboradi.",
            },
            {
              key: "D",
              text_en:
                "The cultural background of the receiver doesn't affect interpretation",
              text_ru: "Культурный фон получателя не влияет на интерпретацию",
              text_uz:
                "Qabul qiluvchining madaniy kelib chiqishi talqinga ta'sir qilmaydi",
              why_wrong_en:
                "This denies the existence of cultural communication barriers, contradicting decades of cross-cultural research.",
              why_wrong_ru:
                "Это отрицает само существование культурных коммуникационных барьеров и противоречит десятилетиям кросс-культурных исследований.",
              why_wrong_uz:
                "Bu madaniy muloqot to'siqlari mavjudligini inkor etadi va o'nlab yillik madaniyatlararo tadqiqotlarga zid keladi.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            'Communication is filtered through the receiver\'s cultural conventions. British "indirect-polite" feedback ("not perfect but largely fine") underspecifies the actual assessment. To a German colleague used to direct feedback culture, the vagueness signals avoidance - they may think the work is genuinely worse than stated. To a Japanese colleague used to even more indirect communication, the phrase may register as quite negative - pointing out imperfection at all carries weight. The same words, opposite interpretations. Effective cross-cultural feedback adapts directness and explicitness to the receiver.',
          explanation_ru:
            "Коммуникация фильтруется через культурные конвенции получателя. Британская «непрямо-вежливая» обратная связь («не идеально, но в целом нормально») недоопределяет реальную оценку. Для немецкого коллеги, привыкшего к прямой культуре обратной связи, размытость сигнализирует об уходе - он может решить, что работа на самом деле хуже сказанного. Для японского коллеги, привыкшего к ещё более непрямой коммуникации, фраза может прозвучать довольно негативно - само указание на несовершенство уже значимо. Те же слова - противоположные интерпретации. Эффективная межкультурная обратная связь подстраивает прямоту и явность под получателя.",
          explanation_uz:
            "Muloqot qabul qiluvchining madaniy odatlari orqali saralanadi. Britancha \"bilvosita-xushmuomala\" fikr-mulohaza (\"mukammal emas, ammo asosan yaxshi\") haqiqiy bahoni yetarlicha aniqlamaydi. To'g'ridan-to'g'ri fikr-mulohaza madaniyatiga o'rgangan nemis hamkasbga bu noaniqlik qochishni anglatadi - u ish aytilganidan ham yomonroq deb o'ylashi mumkin. Yanada bilvosita muloqotga o'rgangan yapon hamkasbga esa bu ibora ancha salbiy tuyulishi mumkin - kamchilikni umuman aytib o'tish o'zi vaznga ega. Bir xil so'zlar, qarama-qarshi talqinlar. Samarali madaniyatlararo fikr-mulohaza to'g'ridan-to'g'rilik va aniqlikni qabul qiluvchiga moslashtiradi.",
        },
      ],
    },
    // ---------- F ----------
    {
      code: "F",
      title_en: "Professional ethics in accounting and business",
      title_ru: "Профессиональная этика в учёте и бизнесе",
      title_uz: "Buxgalteriya va biznesda professional etika",
      description_en:
        "IESBA/ACCA Code, threats to compliance, and ethical decision-making.",
      description_ru:
        "Кодекс IESBA/ACCA, угрозы соблюдению и этическое принятие решений.",
      description_uz:
        "IESBA/ACCA Kodeksi, rioya qilishga tahdidlar va etik qaror qabul qilish.",
      sort_order: 60,
      theory_en:
        "Professional ethics in accounting is built around the IESBA Code of Ethics, which ACCA adopts. The Code rests on five fundamental principles every accountant must uphold: Integrity (straightforward and honest in all dealings), Objectivity (no bias, conflict of interest, or undue influence), Professional Competence and Due Care (maintain knowledge and skill; act diligently), Confidentiality (do not disclose client information without authority), and Professional Behaviour (comply with laws and regulations, avoid conduct that discredits the profession).\n\n" +
        "These principles are constantly under threat. The Code names five threat categories: Self-interest (financial or other interest in the outcome - e.g. holding shares in a client), Self-review (reviewing one's own previous work - e.g. auditing a system you helped design), Advocacy (promoting a client's position to the point of compromising objectivity), Familiarity (long association making you sympathetic - e.g. close personal friendship with a director), and Intimidation (actual or threatened pressure).\n\n" +
        "When a threat is identified, the response is safeguards - measures that eliminate the threat or reduce it to an acceptable level. Safeguards exist at three levels: those created by the profession or legislation (CPD, regulation, professional standards), those within the firm (independence policies, rotation of audit partners, internal review), and those within the client (governance structures, audit committee oversight).\n\n" +
        "Confidentiality has exceptions: disclosure is permitted or required where authorised by the client, required by law (e.g. court order, anti-money-laundering reporting), or there is a professional duty to disclose (e.g. responding to a regulatory inquiry).\n\n" +
        "Whistleblowing escalates internally first - line manager, then audit committee, then the professional body - and only externally if internal routes fail and law permits. Bribery is prohibited; small gifts must be evaluated against the threshold above which they could be seen as influencing professional judgement.",
      theory_ru:
        "Профессиональная этика в учёте опирается на Кодекс этики IESBA, который принимает ACCA. В основе Кодекса - пять фундаментальных принципов, обязательных для любого бухгалтера: Честность (прямота и порядочность во всех делах), Объективность (отсутствие предвзятости, конфликта интересов и неподобающего влияния), Профессиональная компетентность и должная осмотрительность (поддерживать знания и навыки, действовать добросовестно), Конфиденциальность (не раскрывать информацию клиента без полномочий) и Профессиональное поведение (соблюдать законы и нормы, избегать действий, дискредитирующих профессию).\n\n" +
        "Эти принципы постоянно находятся под угрозой. Кодекс называет пять категорий угроз: личная заинтересованность (финансовая или иная заинтересованность в исходе - например, владение акциями клиента), самопроверка (проверка собственной прежней работы - например, аудит системы, которую сам разрабатывал), защита (продвижение позиции клиента до уровня, компрометирующего объективность), близкое знакомство (длительные отношения, формирующие симпатию - например, тесная дружба с директором) и запугивание (фактическое или предполагаемое давление).\n\n" +
        "При выявлении угрозы ответом служат меры предосторожности (safeguards) - действия, устраняющие угрозу или снижающие её до приемлемого уровня. Меры существуют на трёх уровнях: создаваемые профессией или законодательством (повышение квалификации, регулирование, профессиональные стандарты), создаваемые внутри фирмы (политики независимости, ротация партнёров по аудиту, внутренний контроль), и создаваемые внутри клиента (структуры корпоративного управления, надзор аудиторского комитета).\n\n" +
        "Конфиденциальность имеет исключения: раскрытие информации допустимо или обязательно при разрешении клиента, требовании закона (например, судебное решение, сообщение по линии противодействия отмыванию) или при наличии профессиональной обязанности раскрыть (например, ответ на запрос регулятора).\n\n" +
        "Информирование о нарушениях (whistleblowing) сначала идёт по внутренней линии - непосредственный руководитель, затем аудиторский комитет, затем профессиональная организация - и только потом наружу, если внутренние пути исчерпаны и закон это позволяет. Взятки запрещены; небольшие подарки оцениваются на предмет порога, выше которого они могут восприниматься как влияние на профессиональное суждение.",
      theory_uz:
        "Buxgalteriyada professional etika ACCA qabul qilgan IESBA Etika Kodeksi atrofida qurilgan. Kodeks har bir buxgalter rioya qilishi shart bo'lgan beshta asosiy tamoyilga asoslanadi: Halollik (barcha munosabatlarda to'g'ri va halol), Xolislik (xolislik - tarafkashlik, manfaatlar to'qnashuvi yoki noo'rin ta'sirsiz), Professional Malaka va Kerakli G'amxo'rlik (bilim va ko'nikmani saqlash; tirishqoqlik bilan harakat qilish), Maxfiylik (mijoz axborotini vakolatsiz oshkor qilmaslik) va Professional Xulq-atvor (qonun va qoidalarga rioya qilish, kasbni obro'sizlantiruvchi xatti-harakatdan qochish).\n\nBu tamoyillar doimo tahdid ostida. Kodeks beshta tahdid toifasini nomlaydi: Shaxsiy manfaat (natijaga moliyaviy yoki boshqa manfaat - masalan, mijozda aksiyaga ega bo'lish), O'z-o'zini ko'rib chiqish (o'zining oldingi ishini ko'rib chiqish - masalan, o'zi loyihalashgan tizimni auditdan o'tkazish), Targ'ibot (advocacy - mijoz pozitsiyasini xolislikka putur yetkazadigan darajada ilgari surish), Yaqinlik (uzoq aloqa hamdard qilib qo'yishi - masalan, direktor bilan yaqin shaxsiy do'stlik) va Qo'rqitish (haqiqiy yoki tahdid qilingan bosim).\n\nTahdid aniqlanganda, javob - bu himoya choralari (safeguards), ya'ni tahdidni bartaraf etadigan yoki uni maqbul darajaga tushiradigan tadbirlar. Himoya choralari uch darajada mavjud: kasb yoki qonunchilik yaratganlari (uzluksiz kasbiy rivojlanish (CPD), tartibga solish, professional standartlar), firma ichidagilar (mustaqillik siyosatlari, audit sheriklarini rotatsiya qilish, ichki ko'rib chiqish) va mijoz ichidagilar (boshqaruv tuzilmalari, audit qo'mitasi nazorati).\n\nMaxfiylikning istisnolari bor: oshkor qilish mijoz tomonidan ruxsat berilgan, qonun talab qilgan (masalan, sud qarori, pulni yuvishga qarshi hisobot) yoki oshkor qilishning professional burchi bor bo'lgan (masalan, tartibga soluvchi so'roviga javob berish) hollarda ruxsat etiladi yoki talab qilinadi.\n\nMa'lumotni oshkor qilish (whistleblowing) avval ichki tomonga ko'tariladi - chiziqli menejer, so'ng audit qo'mitasi, so'ng professional tashkilot - va faqat ichki yo'llar ish bermasa va qonun ruxsat bersa, tashqi tomonga. Pora taqiqlangan; kichik sovg'alar professional hukmga ta'sir qilmoqda deb baholanishi mumkin bo'lgan chegaraga nisbatan baholanishi kerak.",
      questions: [
        // -------- existing Q1 (short_answer, unchanged) --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "Which of the following is one of the five fundamental principles of the IESBA Code of Ethics?",
          prompt_ru:
            "Какой из перечисленных пунктов является одним из пяти основополагающих принципов Кодекса этики IESBA?",
          prompt_uz:
            "Quyidagilardan qaysi biri IESBA Etika Kodeksining beshta asosiy tamoyilidan biri?",
          options: [
            {
              key: "A",
              text_en: "Objectivity",
              text_ru: "Объективность",
              text_uz: "Xolislik",
            },
            {
              key: "B",
              text_en: "Profitability",
              text_ru: "Прибыльность",
              text_uz: "Foydalilik",
              why_wrong_en:
                "Profitability is a commercial goal, not an ethical principle. The five principles are integrity, objectivity, professional competence and due care, confidentiality, and professional behaviour.",
              why_wrong_ru:
                "Прибыльность - коммерческая цель, а не этический принцип. Пять принципов: честность, объективность, профессиональная компетентность и должная осмотрительность, конфиденциальность, профессиональное поведение.",
              why_wrong_uz:
                "Foydalilik - tijorat maqsadi, etik tamoyil emas. Beshta tamoyil: halollik, xolislik, professional malaka va kerakli g'amxo'rlik, maxfiylik va professional xulq-atvor.",
            },
            {
              key: "C",
              text_en: "Loyalty to the employer",
              text_ru: "Лояльность работодателю",
              text_uz: "Ish beruvchiga sadoqat",
              why_wrong_en:
                "Accountants owe duties to the public interest; unconditional loyalty to an employer can conflict with objectivity and integrity, so it is not a fundamental principle.",
              why_wrong_ru:
                "Бухгалтеры несут обязанности перед общественными интересами; безусловная лояльность работодателю может конфликтовать с объективностью и честностью, поэтому это не основополагающий принцип.",
              why_wrong_uz:
                "Buxgalterlar jamoat manfaatiga burchli; ish beruvchiga so'zsiz sadoqat xolislik va halollik bilan ziddiyatga kirishi mumkin, shuning uchun u asosiy tamoyil emas.",
            },
            {
              key: "D",
              text_en: "Profit maximisation",
              text_ru: "Максимизация прибыли",
              text_uz: "Foydani maksimallashtirish",
              why_wrong_en:
                "This is a business objective, not one of the IESBA ethical principles.",
              why_wrong_ru:
                "Это бизнес-цель, а не один из этических принципов IESBA.",
              why_wrong_uz:
                "Bu - biznes maqsadi, IESBA etik tamoyillaridan biri emas.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "The five IESBA fundamental principles are: integrity, objectivity, professional competence and due care, confidentiality, and professional behaviour. Objectivity means not letting bias, conflict of interest, or undue influence override professional judgement.",
          explanation_ru:
            "Пять основополагающих принципов IESBA: честность, объективность, профессиональная компетентность и должная осмотрительность, конфиденциальность, профессиональное поведение. Объективность означает не позволять предвзятости, конфликту интересов или давлению влиять на профессиональное суждение.",
          explanation_uz:
            "IESBAning beshta asosiy tamoyili: halollik, xolislik, professional malaka va kerakli g'amxo'rlik, maxfiylik va professional xulq-atvor. Xolislik tarafkashlik, manfaatlar to'qnashuvi yoki noo'rin ta'sir professional hukmdan ustun kelishiga yo'l qo'ymaslikni anglatadi.",
        },
        // -------- existing Q2 (augmented) --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "An accountant accepts a free luxury holiday from a major audit client. This MOST DIRECTLY threatens the principle of:",
          prompt_ru:
            "Бухгалтер принимает бесплатный роскошный отпуск от крупного аудиторского клиента. Это в первую очередь угрожает принципу:",
          prompt_uz:
            "Buxgalter yirik audit mijozidan bepul hashamatli ta'tilni qabul qiladi. Bu ENG bevosita qaysi tamoyilga tahdid soladi:",
          options: [
            {
              key: "A",
              text_en: "Professional competence",
              text_ru: "Профессиональной компетентности",
              text_uz: "Professional malaka",
              why_wrong_en:
                "Professional competence is about maintaining skills and knowledge; the gift doesn't affect the accountant's technical ability.",
              why_wrong_ru:
                "Профессиональная компетентность - про поддержание навыков и знаний; подарок не влияет на технические способности бухгалтера.",
              why_wrong_uz:
                "Professional malaka ko'nikma va bilimni saqlash haqida; sovg'a buxgalterning texnik qobiliyatiga ta'sir qilmaydi.",
            },
            {
              key: "B",
              text_en: "Confidentiality",
              text_ru: "Конфиденциальности",
              text_uz: "Maxfiylik",
              why_wrong_en:
                "Confidentiality is about non-disclosure of client information; accepting a gift doesn't involve disclosure.",
              why_wrong_ru:
                "Конфиденциальность - про неразглашение сведений клиента; принятие подарка не связано с раскрытием.",
              why_wrong_uz:
                "Maxfiylik mijoz axborotini oshkor qilmaslik haqida; sovg'a qabul qilish oshkor qilishni o'z ichiga olmaydi.",
            },
            {
              key: "C",
              text_en: "Objectivity",
              text_ru: "Объективности",
              text_uz: "Xolislik",
            },
            {
              key: "D",
              text_en: "Professional behaviour only",
              text_ru: "Только профессионального поведения",
              text_uz: "Faqat professional xulq-atvor",
              why_wrong_en:
                '"Only" makes this too narrow - the primary threat is to objectivity through self-interest; professional behaviour is also implicated but not the MOST direct threat.',
              why_wrong_ru:
                "Слово «только» слишком сужает: главная угроза - объективности через личную заинтересованность; профессиональное поведение задето, но не НАПРЯМУЮ.",
              why_wrong_uz:
                '"Faqat" buni juda toraytiradi - asosiy tahdid shaxsiy manfaat orqali xolislikka; professional xulq-atvor ham aralashgan, ammo ENG bevosita tahdid emas.',
            },
          ],
          correct_answer_en: "C",
          explanation_en:
            "A material gift creates a self-interest threat to objectivity: the accountant might consciously or unconsciously favour the client to preserve the benefit.",
          explanation_ru:
            "Существенный подарок создаёт угрозу собственного интереса для объективности: бухгалтер может сознательно или бессознательно благоприятствовать клиенту, чтобы сохранить выгоду.",
          explanation_uz:
            "Salmoqli sovg'a xolislikka shaxsiy manfaat tahdidini yaratadi: buxgalter manfaatni saqlab qolish uchun ongli yoki ongsiz ravishda mijozni yoqlashi mumkin.",
        },
        // -------- existing Q3 (augmented) --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en: 'A "self-review threat" arises when:',
          prompt_ru: "«Угроза самопроверки» возникает, когда:",
          prompt_uz:
            "\"O'z-o'zini ko'rib chiqish tahdidi\" quyidagi holatda yuzaga keladi:",
          options: [
            {
              key: "A",
              text_en: "A professional has a financial interest in the client",
              text_ru: "У профессионала есть финансовый интерес в клиенте",
              text_uz: "Professionalning mijozda moliyaviy manfaati bor",
              why_wrong_en:
                "Financial interest is a SELF-INTEREST threat, not self-review.",
              why_wrong_ru:
                "Финансовый интерес - это угроза ЛИЧНОЙ ЗАИНТЕРЕСОВАННОСТИ, а не самопроверки.",
              why_wrong_uz:
                "Moliyaviy manfaat - SHAXSIY MANFAAT tahdidi, o'z-o'zini ko'rib chiqish emas.",
            },
            {
              key: "B",
              text_en:
                "A professional is asked to review work they previously performed",
              text_ru:
                "Профессионала просят проверить работу, которую он сам ранее выполнял",
              text_uz:
                "Professionaldan ilgari o'zi bajargan ishni ko'rib chiqish so'raladi",
            },
            {
              key: "C",
              text_en:
                "A long-standing client relationship causes overfamiliarity",
              text_ru:
                "Долгие отношения с клиентом приводят к чрезмерной близости",
              text_uz:
                "Uzoq yillik mijoz munosabati haddan tashqari yaqinlikni keltirib chiqaradi",
              why_wrong_en:
                "This describes the FAMILIARITY threat, not self-review.",
              why_wrong_ru:
                "Это описание угрозы БЛИЗКОГО ЗНАКОМСТВА, а не самопроверки.",
              why_wrong_uz:
                "Bu YAQINLIK tahdidini ta'riflaydi, o'z-o'zini ko'rib chiqishni emas.",
            },
            {
              key: "D",
              text_en: "A client threatens to dismiss the professional",
              text_ru: "Клиент угрожает увольнением профессионала",
              text_uz:
                "Mijoz professionalni ishdan bo'shatish bilan tahdid qiladi",
              why_wrong_en:
                "This describes the INTIMIDATION threat, not self-review.",
              why_wrong_ru:
                "Это описание угрозы ЗАПУГИВАНИЯ, а не самопроверки.",
              why_wrong_uz:
                "Bu QO'RQITISH tahdidini ta'riflaydi, o'z-o'zini ko'rib chiqishni emas.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Self-review threats arise when an auditor evaluates their own prior work - there\u2019s an inherent bias not to find fault. Safeguards typically involve using a different team or external review.",
          explanation_ru:
            "Угроза самопроверки возникает, когда аудитор оценивает собственные предыдущие работы - есть встроенная предвзятость не находить недостатков. Защитные меры обычно включают другую команду или внешнюю проверку.",
          explanation_uz:
            "O'z-o'zini ko'rib chiqish tahdidi auditor o'zining oldingi ishini baholaganda yuzaga keladi - kamchilik topmaslikka tabiiy moyillik bor. Himoya choralari odatda boshqa jamoadan foydalanish yoki tashqi ko'rib chiqishni o'z ichiga oladi.",
        },
        // -------- existing Q4 (augmented) --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "Disclosing confidential client information without authorisation is a breach of:",
          prompt_ru:
            "Раскрытие конфиденциальной информации клиента без разрешения нарушает принцип:",
          prompt_uz:
            "Maxfiy mijoz axborotini vakolatsiz oshkor qilish quyidagining buzilishidir:",
          options: [
            {
              key: "A",
              text_en: "Integrity",
              text_ru: "Честности",
              text_uz: "Halollik",
              why_wrong_en:
                "Integrity is about being straightforward and honest in dealings - the specific concern with disclosure is captured by confidentiality.",
              why_wrong_ru:
                "Честность - это прямота и порядочность в действиях; конкретный вопрос раскрытия информации охватывается принципом конфиденциальности.",
              why_wrong_uz:
                "Halollik munosabatlarda to'g'ri va halol bo'lish haqida - oshkor qilishga oid aniq tashvish esa maxfiylik bilan qamrab olinadi.",
            },
            {
              key: "B",
              text_en: "Confidentiality",
              text_ru: "Конфиденциальности",
              text_uz: "Maxfiylik",
            },
            {
              key: "C",
              text_en: "Competence",
              text_ru: "Компетентности",
              text_uz: "Malaka",
              why_wrong_en:
                "Competence is about technical ability and ongoing professional development, unrelated to disclosure of client information.",
              why_wrong_ru:
                "Компетентность - про техническую способность и непрерывное развитие, не связана с раскрытием сведений клиента.",
              why_wrong_uz:
                "Malaka texnik qobiliyat va uzluksiz professional rivojlanish haqida bo'lib, mijoz axborotini oshkor qilishga aloqasi yo'q.",
            },
            {
              key: "D",
              text_en: "Objectivity",
              text_ru: "Объективности",
              text_uz: "Xolislik",
              why_wrong_en:
                "Objectivity is about absence of bias in professional judgement, not about handling of information.",
              why_wrong_ru:
                "Объективность - про отсутствие предвзятости в профессиональном суждении, а не про обращение с информацией.",
              why_wrong_uz:
                "Xolislik professional hukmda tarafkashlik yo'qligi haqida, axborot bilan ishlash haqida emas.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Confidentiality requires the accountant not to disclose client information acquired in the course of professional work, unless there is a legal duty or proper authority.",
          explanation_ru:
            "Принцип конфиденциальности требует от бухгалтера не раскрывать сведения клиента, полученные в ходе профессиональной деятельности, кроме случаев законной обязанности или должного полномочия.",
          explanation_uz:
            "Maxfiylik buxgalterdan qonuniy burch yoki tegishli vakolat bo'lmasa, professional ish davomida olingan mijoz axborotini oshkor qilmaslikni talab qiladi.",
        },
        // -------- existing Q5 (augmented) --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            "An accountant discovers their employer has been overstating revenue. Internal escalation is ignored. The MOST APPROPRIATE next step is to:",
          prompt_ru:
            "Бухгалтер обнаружил, что работодатель завышал выручку. Внутренние обращения игнорируются. НАИБОЛЕЕ ПРАВИЛЬНЫЙ следующий шаг - :",
          prompt_uz:
            "Buxgalter ish beruvchisi daromadni oshirib ko'rsatayotganini aniqlaydi. Ichki tomonga ko'tarish e'tiborga olinmaydi. ENG MAQBUL keyingi qadam:",
          options: [
            {
              key: "A",
              text_en: "Resign immediately without comment",
              text_ru: "Немедленно уволиться без объяснений",
              text_uz: "Hech qanday izohsiz darhol iste'foga chiqish",
              why_wrong_en:
                "Silent resignation breaches integrity - the accountant is aware of misstated financials affecting third-party users and walking away says nothing.",
              why_wrong_ru:
                "Тихий уход нарушает принцип честности - бухгалтер знает об искажении отчётности, влияющем на сторонних пользователей, а молчаливый уход ничего не сообщает.",
              why_wrong_uz:
                "Jim iste'foga chiqish halollikni buzadi - buxgalter uchinchi tomon foydalanuvchilariga ta'sir qiluvchi noto'g'ri ko'rsatilgan moliyaviy hisobotlardan xabardor, ketib qolish esa hech narsa demaslikdir.",
            },
            {
              key: "B",
              text_en:
                "Seek confidential advice from their professional body and consider lawful disclosure",
              text_ru:
                "Обратиться за конфиденциальной консультацией в свою профессиональную организацию и рассмотреть законное раскрытие",
              text_uz:
                "Professional tashkilotdan maxfiy maslahat olish va qonuniy oshkor qilishni ko'rib chiqish",
            },
            {
              key: "C",
              text_en: "Comply because the employer pays their salary",
              text_ru: "Подчиниться, поскольку работодатель платит зарплату",
              text_uz: "Ish beruvchi maoshini to'lagani uchun rioya qilish",
              why_wrong_en:
                "This breaches integrity AND professional behaviour; complicity in revenue overstatement is potentially fraud.",
              why_wrong_ru:
                "Это нарушает И честность, И профессиональное поведение; соучастие в завышении выручки потенциально является мошенничеством.",
              why_wrong_uz:
                "Bu halollikni HAM, professional xulq-atvorni HAM buzadi; daromadni oshirib ko'rsatishda sherik bo'lish potensial firibgarlikdir.",
            },
            {
              key: "D",
              text_en: "Tell the financial press anonymously",
              text_ru: "Анонимно сообщить финансовой прессе",
              text_uz: "Moliyaviy matbuotga anonim aytish",
              why_wrong_en:
                "Going to the press without exhausting proper channels breaches confidentiality and bypasses the professional escalation framework.",
              why_wrong_ru:
                "Поход в прессу до исчерпания надлежащих каналов нарушает конфиденциальность и обходит профессиональный порядок эскалации.",
              why_wrong_uz:
                "Tegishli yo'llarni tugatmasdan matbuotga borish maxfiylikni buzadi va professional eskalatsiya doirasini chetlab o'tadi.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "IESBA/ACCA guidance is to escalate internally, then seek confidential advice from the professional body, and only disclose externally where legally permitted/required. Going straight to the press breaches confidentiality; staying silent breaches integrity.",
          explanation_ru:
            "Согласно рекомендациям IESBA/ACCA, нужно эскалировать внутри организации, затем получить конфиденциальную консультацию у профессиональной организации, и раскрывать сведения вовне только когда это законно разрешено или требуется. Поход напрямую в прессу нарушает конфиденциальность, молчание - честность.",
          explanation_uz:
            "IESBA/ACCA ko'rsatmasi - avval ichki tomonga ko'tarish, so'ng professional tashkilotdan maxfiy maslahat olish va faqat qonuniy ruxsat etilgan/talab qilingan hollarda tashqi tomonga oshkor qilish. To'g'ridan-to'g'ri matbuotga borish maxfiylikni buzadi; jim turish esa halollikni buzadi.",
        },
        // -------- NEW Q6 - easy MCQ on advocacy threat --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "An accountant publicly defends a client\u2019s aggressive tax position in a media interview, arguing it is legitimate even when colleagues have raised concerns. This BEST illustrates which threat?",
          prompt_ru:
            "Бухгалтер публично защищает агрессивную налоговую позицию клиента в интервью СМИ, утверждая, что она правомерна, хотя коллеги выражали сомнения. Это ЛУЧШЕ всего иллюстрирует какую угрозу?",
          prompt_uz:
            "Buxgalter media-intervyuda hamkasblar xavotir bildirgan bo'lsa ham, mijozning tajovuzkor soliq pozitsiyasini qonuniy deb himoya qiladi. Bu ENG yaxshi qaysi tahdidni ko'rsatadi?",
          options: [
            {
              key: "A",
              text_en: "Self-interest",
              text_ru: "Личной заинтересованности",
              text_uz: "Shaxsiy manfaat",
              why_wrong_en:
                "Self-interest threats involve personal financial or other benefit; here the accountant is championing the client's position publicly, which is advocacy.",
              why_wrong_ru:
                "Угрозы личной заинтересованности связаны с личной финансовой или иной выгодой; здесь бухгалтер публично отстаивает позицию клиента, что является защитой.",
              why_wrong_uz:
                "Shaxsiy manfaat tahdidlari shaxsiy moliyaviy yoki boshqa naf bilan bog'liq; bu yerda buxgalter mijoz pozitsiyasini ommaviy yoqlamoqda, bu esa targ'ibotdir.",
            },
            {
              key: "B",
              text_en: "Advocacy",
              text_ru: "Защиты",
              text_uz: "Targ'ibot (advocacy)",
            },
            {
              key: "C",
              text_en: "Familiarity",
              text_ru: "Близкого знакомства",
              text_uz: "Yaqinlik",
              why_wrong_en:
                "Familiarity comes from long personal closeness; the scenario describes professional advocacy, not personal relationship.",
              why_wrong_ru:
                "Близкое знакомство возникает из долгой личной близости; здесь же - профессиональная защита, а не личные отношения.",
              why_wrong_uz:
                "Yaqinlik uzoq shaxsiy yaqinlikdan kelib chiqadi; vaziyat esa shaxsiy munosabatni emas, professional targ'ibotni ta'riflaydi.",
            },
            {
              key: "D",
              text_en: "Intimidation",
              text_ru: "Запугивания",
              text_uz: "Qo'rqitish",
              why_wrong_en:
                "Intimidation requires pressure being applied TO the accountant; here the accountant is choosing to advocate.",
              why_wrong_ru:
                "Запугивание требует давления НА бухгалтера; здесь же бухгалтер сам выбирает защищать.",
              why_wrong_uz:
                "Qo'rqitish buxgalterga bosim o'tkazilishini talab qiladi; bu yerda esa buxgalter targ'ibot qilishni o'zi tanlamoqda.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Advocacy threat arises when an accountant promotes a client's position to a point where independence and objectivity are compromised. Acting as the client's public defender - especially when colleagues have flagged concerns - crosses from objective professional opinion into partisan advocacy.",
          explanation_ru:
            "Угроза защиты возникает, когда бухгалтер продвигает позицию клиента до такой степени, что независимость и объективность ставятся под удар. Выступление в роли публичного защитника клиента - особенно при сомнениях коллег - переходит из объективного профессионального мнения в одностороннюю защиту.",
          explanation_uz:
            "Targ'ibot (advocacy) tahdidi buxgalter mijoz pozitsiyasini mustaqillik va xolislikka putur yetadigan darajada ilgari surganda yuzaga keladi. Mijozning ommaviy himoyachisi sifatida ish ko'rish - ayniqsa hamkasblar xavotir bildirgan bo'lsa - xolis professional fikrdan tarafkash targ'ibotga o'tishdir.",
        },
        // -------- NEW Q7 - easy MCQ on intimidation threat --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "During an audit, a client\u2019s CFO threatens to dismiss the audit firm if a contentious accounting treatment is challenged. This is an example of which threat?",
          prompt_ru:
            "В ходе аудита финансовый директор клиента угрожает уволить аудиторскую фирму, если она оспорит спорный учётный метод. Это пример какой угрозы?",
          prompt_uz:
            "Audit paytida mijozning moliyaviy direktori (CFO) bahsli buxgalteriya yondashuviga e'tiroz bildirilsa, audit firmasini ishdan bo'shatish bilan tahdid qiladi. Bu qaysi tahdidga misol?",
          options: [
            {
              key: "A",
              text_en: "Self-interest",
              text_ru: "Личной заинтересованности",
              text_uz: "Shaxsiy manfaat",
              why_wrong_en:
                "Self-interest is the auditor's own financial/personal interest; here the threat comes FROM the client, not from within the auditor.",
              why_wrong_ru:
                "Личная заинтересованность - это собственный финансовый/личный интерес аудитора; здесь же угроза исходит ОТ клиента, а не изнутри.",
              why_wrong_uz:
                "Shaxsiy manfaat - auditorning o'z moliyaviy/shaxsiy manfaati; bu yerda tahdid auditor ichidan emas, MIJOZDAN keladi.",
            },
            {
              key: "B",
              text_en: "Self-review",
              text_ru: "Самопроверки",
              text_uz: "O'z-o'zini ko'rib chiqish",
              why_wrong_en:
                "Self-review concerns reviewing one's own prior work; the scenario is about external pressure, not internal review bias.",
              why_wrong_ru:
                "Самопроверка касается проверки собственной прежней работы; в сценарии - внешнее давление, не предвзятость внутренней проверки.",
              why_wrong_uz:
                "O'z-o'zini ko'rib chiqish o'zining oldingi ishini ko'rib chiqish bilan bog'liq; vaziyat esa ichki ko'rib chiqish tarafkashligi emas, tashqi bosim haqida.",
            },
            {
              key: "C",
              text_en: "Advocacy",
              text_ru: "Защиты",
              text_uz: "Targ'ibot (advocacy)",
              why_wrong_en:
                "Advocacy is when the accountant champions the client's position; here the accountant is being PUSHED, not advocating.",
              why_wrong_ru:
                "Защита - это когда бухгалтер сам отстаивает позицию клиента; здесь же на него ДАВЯТ, а не он защищает.",
              why_wrong_uz:
                "Targ'ibot - buxgalter mijoz pozitsiyasini yoqlaganda; bu yerda buxgalter targ'ibot qilmayapti, balki bosim ostida QOLMOQDA.",
            },
            {
              key: "D",
              text_en: "Intimidation",
              text_ru: "Запугивания",
              text_uz: "Qo'rqitish",
            },
          ],
          correct_answer_en: "D",
          explanation_en:
            "Intimidation threat arises when an accountant feels pressured - actually or perceived - into agreeing with a client's position. Threats of dismissal, litigation, or aggressive personal behaviour are typical examples. Safeguards include audit committee involvement, escalating to senior firm leadership, and being prepared to withdraw from the engagement if necessary.",
          explanation_ru:
            "Угроза запугивания возникает, когда бухгалтер ощущает давление - реальное или предполагаемое - согласиться с позицией клиента. Типичные примеры: угрозы увольнения, судебных исков, агрессивное личное поведение. Защитные меры: вовлечение аудиторского комитета, эскалация к старшему руководству фирмы и готовность отказаться от задания при необходимости.",
          explanation_uz:
            "Qo'rqitish tahdidi buxgalter mijoz pozitsiyasiga rozi bo'lishga bosim ostida - haqiqiy yoki idrok etilgan - qolganda yuzaga keladi. Ishdan bo'shatish, sudga berish yoki tajovuzkor shaxsiy xatti-harakat bilan tahdidlar odatiy misollardir. Himoya choralariga audit qo'mitasini jalb qilish, firma yuqori rahbariyatiga ko'tarish va zarurat tug'ilsa loyihadan chiqishga tayyor bo'lish kiradi.",
        },
        // -------- NEW Q8 - easy short_answer on safeguards --------
        {
          type: "mcq",
          difficulty: "easy",
          prompt_en:
            "The IESBA Code groups safeguards against ethical threats into three categories. Which of the following is one of them?",
          prompt_ru:
            "Кодекс IESBA делит меры защиты от этических угроз на три категории. Какая из перечисленных к ним относится?",
          prompt_uz:
            "IESBA Kodeksi etik tahdidlarga qarshi himoya choralarini uch toifaga guruhlaydi. Quyidagilardan qaysi biri ulardan biri?",
          options: [
            {
              key: "A",
              text_en: "Safeguards created by the profession or legislation",
              text_ru: "Меры, созданные профессией или законодательством",
              text_uz: "Kasb yoki qonunchilik yaratgan himoya choralari",
            },
            {
              key: "B",
              text_en: "Safeguards created by competitors",
              text_ru: "Меры, создаваемые конкурентами",
              text_uz: "Raqobatchilar yaratgan himoya choralari",
              why_wrong_en:
                "Competitors play no role in the safeguards framework; the three categories are profession/legislation, the firm, and the client.",
              why_wrong_ru:
                "Конкуренты не участвуют в системе мер защиты; три категории - профессия/законодательство, фирма и клиент.",
              why_wrong_uz:
                "Raqobatchilar himoya choralari doirasida hech qanday rol o'ynamaydi; uch toifa - kasb/qonunchilik, firma va mijozdir.",
            },
            {
              key: "C",
              text_en: "Safeguards created by the tax authority",
              text_ru: "Меры, создаваемые налоговым органом",
              text_uz: "Soliq organi yaratgan himoya choralari",
              why_wrong_en:
                "The tax authority is not one of the three safeguard sources; these are the profession/legislation, the firm, and the client.",
              why_wrong_ru:
                "Налоговый орган не относится к трём источникам мер; это профессия/законодательство, фирма и клиент.",
              why_wrong_uz:
                "Soliq organi uchta himoya chorasi manbasidan biri emas; bular kasb/qonunchilik, firma va mijozdir.",
            },
            {
              key: "D",
              text_en: "Safeguards created by shareholders",
              text_ru: "Меры, создаваемые акционерами",
              text_uz: "Aksiyadorlar yaratgan himoya choralari",
              why_wrong_en:
                "Shareholders are not a recognised safeguard category; the three are profession/legislation, within the firm, and within the client.",
              why_wrong_ru:
                "Акционеры не являются признанной категорией мер; три категории - профессия/законодательство, внутри фирмы и у клиента.",
              why_wrong_uz:
                "Aksiyadorlar tan olingan himoya chorasi toifasi emas; uchtasi - kasb/qonunchilik, firma ichidagi va mijoz ichidagidir.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "The IESBA Code groups safeguards into three sources: those created by the profession or legislation (e.g. CPD, standards, regulatory oversight); those within the firm or employing organisation (e.g. independence policies, partner rotation); and those within the client's own systems and governance.",
          explanation_ru:
            "Кодекс IESBA выделяет три источника мер защиты: созданные профессией или законодательством (например, CPD, стандарты, регуляторный надзор); существующие внутри фирмы или организации-работодателя (например, политики независимости, ротация партнёров); и существующие в системах и управлении самого клиента.",
          explanation_uz:
            "IESBA Kodeksi himoya choralarini uch manbaga guruhlaydi: kasb yoki qonunchilik yaratganlari (masalan, CPD, standartlar, tartibga soluvchi nazorat); firma yoki ish beruvchi tashkilot ichidagilar (masalan, mustaqillik siyosatlari, sheriklar rotatsiyasi); va mijozning o'z tizimlari hamda boshqaruvi ichidagilar.",
        },
        // -------- NEW Q9 - medium MCQ on familiarity threat --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "An audit partner has served the same client for 18 consecutive years and is close personal friends with the CFO. The MOST appropriate safeguard is:",
          prompt_ru:
            "Партнёр по аудиту обслуживает одного клиента 18 лет подряд и состоит в близких личных дружеских отношениях с финансовым директором. НАИБОЛЕЕ подходящая защитная мера:",
          prompt_uz:
            "Audit sherigi bir xil mijozga 18 yil ketma-ket xizmat ko'rsatgan va moliyaviy direktor (CFO) bilan yaqin shaxsiy do'st. ENG MAQBUL himoya chorasi:",
          options: [
            {
              key: "A",
              text_en: "Continued engagement with no change",
              text_ru: "Продолжать работу без изменений",
              text_uz: "Hech qanday o'zgarishsiz loyihani davom ettirish",
              why_wrong_en:
                "No change ignores the familiarity threat entirely; the duration and personal closeness make objective challenge psychologically difficult.",
              why_wrong_ru:
                "Отсутствие изменений полностью игнорирует угрозу близкого знакомства; продолжительность и личная близость затрудняют объективный профессиональный скепсис.",
              why_wrong_uz:
                "O'zgarishsizlik yaqinlik tahdidini butunlay e'tiborsiz qoldiradi; davomiylik va shaxsiy yaqinlik xolis e'tirozni psixologik jihatdan qiyinlashtiradi.",
            },
            {
              key: "B",
              text_en: "Rotation of the audit partner to a new lead",
              text_ru: "Ротация партнёра по аудиту на нового ведущего",
              text_uz: "Audit sherigini yangi bosh sherikka rotatsiya qilish",
            },
            {
              key: "C",
              text_en: "A larger audit fee to incentivise diligence",
              text_ru:
                "Увеличение аудиторского гонорара для стимулирования усердия",
              text_uz:
                "Tirishqoqlikni rag'batlantirish uchun kattaroq audit haqi",
              why_wrong_en:
                "A larger fee creates a self-interest threat - it incentivises retaining the client rather than challenging them; it does not address familiarity.",
              why_wrong_ru:
                "Больший гонорар создаёт угрозу личной заинтересованности - стимулирует удерживать клиента, а не оспаривать; угрозу близкого знакомства это не устраняет.",
              why_wrong_uz:
                "Kattaroq haq shaxsiy manfaat tahdidini yaratadi - u mijozga e'tiroz bildirishdan ko'ra uni saqlab qolishni rag'batlantiradi; u yaqinlikni hal qilmaydi.",
            },
            {
              key: "D",
              text_en: "The partner gives the CFO additional advisory work",
              text_ru:
                "Партнёр берёт у CFO дополнительные консультационные задания",
              text_uz: "Sherik CFOga qo'shimcha maslahat ishini beradi",
              why_wrong_en:
                "Adding advisory work creates self-review and self-interest threats in addition to the existing familiarity threat - it makes the situation worse.",
              why_wrong_ru:
                "Добавление консультационных заданий создаёт угрозы самопроверки и личной заинтересованности в дополнение к существующей угрозе близкого знакомства - ситуация только ухудшается.",
              why_wrong_uz:
                "Maslahat ishini qo'shish mavjud yaqinlik tahdidiga qo'shimcha ravishda o'z-o'zini ko'rib chiqish va shaxsiy manfaat tahdidlarini yaratadi - bu vaziyatni yomonlashtiradi.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Partner rotation is the standard safeguard for familiarity threats arising from long-standing engagements. Most professional standards require rotation of the lead audit partner after a defined period (typically 5-7 years for listed companies). The new partner can challenge entrenched assumptions and re-examine matters that the previous partner may have come to accept without question.",
          explanation_ru:
            "Ротация партнёра - стандартная защитная мера от угрозы близкого знакомства, возникающей при длительной работе. Большинство профессиональных стандартов требуют ротации ведущего партнёра по аудиту через определённый срок (обычно 5-7 лет для публичных компаний). Новый партнёр может оспорить устоявшиеся допущения и пересмотреть вопросы, которые предыдущий партнёр мог начать принимать без сомнений.",
          explanation_uz:
            "Sheriklar rotatsiyasi - uzoq yillik loyihalardan kelib chiqadigan yaqinlik tahdidlari uchun standart himoya chorasi. Aksariyat professional standartlar bosh audit sherigini belgilangan muddatdan keyin rotatsiya qilishni talab qiladi (listingdagi kompaniyalar uchun odatda 5-7 yil). Yangi sherik o'rnashib qolgan taxminlarga e'tiroz bildirishi va avvalgi sherik so'roqsiz qabul qilib qo'ygan masalalarni qayta ko'rib chiqishi mumkin.",
        },
        // -------- NEW Q10 - medium MCQ on confidentiality exception --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A court order compels an accountant to disclose specific client records. In this situation, the accountant should:",
          prompt_ru:
            "Судебное решение обязывает бухгалтера раскрыть конкретные сведения о клиенте. В этой ситуации бухгалтер должен:",
          prompt_uz:
            "Sud qarori buxgalterni muayyan mijoz yozuvlarini oshkor qilishga majbur qiladi. Bu vaziyatda buxgalter quyidagini qilishi kerak:",
          options: [
            {
              key: "A",
              text_en:
                "Refuse to disclose to protect confidentiality at all costs",
              text_ru:
                "Отказаться раскрывать, чтобы защитить конфиденциальность любой ценой",
              text_uz:
                "Maxfiylikni har qanday holatda himoya qilish uchun oshkor qilishdan bosh tortish",
              why_wrong_en:
                "Confidentiality has exceptions - legal compulsion (such as a court order) is a standard one; refusing risks contempt of court.",
              why_wrong_ru:
                "У конфиденциальности есть исключения - юридическое принуждение (например, судебное решение) одно из стандартных; отказ грозит неуважением к суду.",
              why_wrong_uz:
                "Maxfiylikning istisnolari bor - qonuniy majburlash (masalan, sud qarori) standart istisnolardan biri; bosh tortish sudni hurmatsizlik qilish (contempt of court) xavfini tug'diradi.",
            },
            {
              key: "B",
              text_en:
                "Comply with the court order, disclosing only what is legally required",
              text_ru:
                "Исполнить судебное решение, раскрывая только то, что юридически требуется",
              text_uz:
                "Sud qaroriga rioya qilib, faqat qonun talab qilganini oshkor qilish",
            },
            {
              key: "C",
              text_en:
                "Disclose everything to the court including unrelated client matters",
              text_ru: "Раскрыть всё суду, включая несвязанные дела клиента",
              text_uz:
                "Sudga aloqasi yo'q mijoz masalalari ham kiritilgan holda hamma narsani oshkor qilish",
              why_wrong_en:
                "Disclosure should be LIMITED to what the order requires; volunteering additional information breaches confidentiality beyond legal necessity.",
              why_wrong_ru:
                "Раскрытие должно быть ОГРАНИЧЕНО тем, что требует решение; добровольная передача дополнительной информации нарушает конфиденциальность сверх юридической необходимости.",
              why_wrong_uz:
                "Oshkor qilish qaror talab qilgan narsa bilan CHEKLANISHI kerak; qo'shimcha axborotni o'z xohishi bilan berish maxfiylikni qonuniy zaruratdan tashqari buzadi.",
            },
            {
              key: "D",
              text_en: "Tip off the client so they can prepare",
              text_ru: "Предупредить клиента, чтобы он подготовился",
              text_uz: "Mijozni tayyorgarlik ko'rishi uchun ogohlantirish",
              why_wrong_en:
                "Tipping off undermines the legal process and may itself be a criminal offence, particularly in money-laundering contexts.",
              why_wrong_ru:
                "Уведомление клиента подрывает юридическую процедуру и может само быть уголовным правонарушением, особенно в контексте противодействия отмыванию.",
              why_wrong_uz:
                "Ogohlantirish qonuniy jarayonga putur yetkazadi va o'zi jinoiy harakat bo'lishi mumkin, ayniqsa pul yuvish kontekstida.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            'Confidentiality is not absolute. Disclosure is permitted or required where: (1) authorised by the client, (2) required by law (court order, statutory reporting like SARs, regulatory inquiry), or (3) a professional duty to disclose exists. The principle is "disclose only what is legally required and no more" - this respects confidentiality while complying with legal obligations.',
          explanation_ru:
            "Конфиденциальность не абсолютна. Раскрытие допустимо или обязательно при: (1) разрешении клиента, (2) требовании закона (судебное решение, обязательная отчётность вроде SAR, запрос регулятора), (3) наличии профессиональной обязанности раскрыть. Принцип: «раскрывать только то, что требуется законом, не больше» - это соблюдает конфиденциальность при исполнении юридических обязанностей.",
          explanation_uz:
            "Maxfiylik mutlaq emas. Oshkor qilish quyidagi hollarda ruxsat etiladi yoki talab qilinadi: (1) mijoz ruxsat bergan, (2) qonun talab qilgan (sud qarori, SARlar kabi qonuniy hisobot, tartibga soluvchi so'rov) yoki (3) oshkor qilishning professional burchi mavjud. Tamoyil - \"faqat qonun talab qilganini oshkor qil, undan ortig'ini emas\" - bu qonuniy majburiyatlarga rioya qilgan holda maxfiylikni hurmat qiladi.",
        },
        // -------- NEW Q11 - medium MCQ on gifts threshold --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A client offers an audit team a box of chocolates at Christmas worth approximately $30. The MOST appropriate response is:",
          prompt_ru:
            "Клиент дарит аудиторской команде на Рождество коробку конфет стоимостью около $30. НАИБОЛЕЕ уместная реакция:",
          prompt_uz:
            "Mijoz audit jamoasiga Rojdestvoda taxminan 30 dollarlik bir quti shokolad taklif qiladi. ENG MAQBUL javob:",
          options: [
            {
              key: "A",
              text_en: "Accept it but immediately resign from the engagement",
              text_ru: "Принять, но немедленно отказаться от задания",
              text_uz:
                "Uni qabul qilish, ammo darhol loyihadan iste'foga chiqish",
              why_wrong_en:
                "Resignation is a disproportionate response to a token gift; the threat from such a small item is trivial and easily managed.",
              why_wrong_ru:
                "Отказ от задания - несоразмерная реакция на символический подарок; угроза от такого мелкого знака внимания тривиальна и легко управляема.",
              why_wrong_uz:
                "Iste'fo - kichik belgi sovg'aga nomutanosib javob; bunday kichik narsadan keladigan tahdid arzimas va oson boshqariladi.",
            },
            {
              key: "B",
              text_en:
                "Accept it as it is trivial and customary - no significant threat to objectivity",
              text_ru:
                "Принять, поскольку это символическое и обычное проявление вежливости - значимой угрозы объективности нет",
              text_uz:
                "Uni arzimas va odatiy bo'lgani uchun qabul qilish - xolislikka jiddiy tahdid yo'q",
            },
            {
              key: "C",
              text_en: "Refuse on principle and lecture the client on ethics",
              text_ru:
                "Отказаться из принципа и прочитать клиенту лекцию об этике",
              text_uz:
                "Prinsip yuzasidan rad etish va mijozga etika bo'yicha ma'ruza o'qish",
              why_wrong_en:
                "Lecturing the client is unprofessional and damages the relationship without ethical benefit; a polite acceptance or quiet refusal suffices.",
              why_wrong_ru:
                "Лекция клиенту непрофессиональна и портит отношения без этической пользы; достаточно вежливо принять или тихо отказаться.",
              why_wrong_uz:
                "Mijozga ma'ruza o'qish noprofessional va etik nafsiz munosabatga zarar yetkazadi; xushmuomalalik bilan qabul qilish yoki jimgina rad etish kifoya.",
            },
            {
              key: "D",
              text_en:
                "Accept and offer to pay the client back at twice the value",
              text_ru: "Принять и предложить клиенту возместить вдвое",
              text_uz:
                "Qabul qilish va mijozga qiymatidan ikki baravar ko'p qaytarib to'lashni taklif qilish",
              why_wrong_en:
                "This is an awkward overcorrection that may create its own conflict of interest; the gift is too trivial to warrant such response.",
              why_wrong_ru:
                "Это неловкая чрезмерная коррекция, которая может создать собственный конфликт интересов; подарок слишком мелкий для такой реакции.",
              why_wrong_uz:
                "Bu o'z manfaatlar to'qnashuvini yaratishi mumkin bo'lgan noqulay ortiqcha tuzatish; sovg'a bunday javobga loyiq bo'lishi uchun juda arzimasdir.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            "Gifts must be evaluated against the threshold above which they could be seen as influencing professional judgement. A modest, customary token (chocolates, calendars, small flowers) typically falls well below the threshold and creates no real threat to objectivity. The test is reasonable: would an informed third party consider this gift significant enough to influence the accountant? For $30 chocolates shared across a team, the answer is clearly no. The same gift in cash, or a $1,000 hamper, would be a different matter entirely.",
          explanation_ru:
            "Подарки оцениваются по порогу, выше которого они могут восприниматься как влияющие на профессиональное суждение. Скромный, традиционный знак внимания (конфеты, календари, небольшие цветы) обычно намного ниже этого порога и не создаёт реальной угрозы объективности. Проверка проста: счёл бы информированный сторонний наблюдатель этот подарок достаточно значимым, чтобы повлиять на бухгалтера? Для конфет за $30 на всю команду - очевидно нет. Тот же подарок наличными или корзина за $1 000 - совершенно другое дело.",
          explanation_uz:
            "Sovg'alar professional hukmga ta'sir qilmoqda deb baholanishi mumkin bo'lgan chegaraga nisbatan baholanishi kerak. Kichik, odatiy belgi (shokolad, kalendarlar, kichik gullar) odatda chegaradan ancha past tushadi va xolislikka haqiqiy tahdid yaratmaydi. Sinov oqilona: xabardor uchinchi tomon bu sovg'ani buxgalterga ta'sir qiladigan darajada salmoqli deb hisoblaydimi? Jamoa bo'ylab bo'lingan 30 dollarlik shokolad uchun javob aniq - yo'q. Naqd puldagi xuddi shu sovg'a yoki 1 000 dollarlik savat esa butunlay boshqa masala bo'lardi.",
        },
        // -------- NEW Q12 - medium MCQ on integrity vs other principles --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            "A junior accountant is asked by their manager to backdate an invoice to reflect revenue in the current period instead of the next. The PRIMARY principle this would breach is:",
          prompt_ru:
            "Младшему бухгалтеру руководитель поручает перенести дату счёта-фактуры задним числом, чтобы выручка отражалась в текущем периоде, а не в следующем. ОСНОВНОЙ принцип, который это нарушит:",
          prompt_uz:
            "Menejer kichik buxgalterdan daromadni keyingi davr o'rniga joriy davrda aks ettirish uchun hisob-fakturani orqa sana bilan rasmiylashtirishni so'raydi. Bu BIRINCHI navbatda buzadigan tamoyil:",
          options: [
            {
              key: "A",
              text_en: "Integrity",
              text_ru: "Честности",
              text_uz: "Halollik",
            },
            {
              key: "B",
              text_en: "Confidentiality",
              text_ru: "Конфиденциальности",
              text_uz: "Maxfiylik",
              why_wrong_en:
                "Confidentiality concerns non-disclosure of client information; backdating a document is about honesty, not disclosure.",
              why_wrong_ru:
                "Конфиденциальность касается неразглашения сведений клиента; перенос даты документа - про честность, а не раскрытие.",
              why_wrong_uz:
                "Maxfiylik mijoz axborotini oshkor qilmaslik bilan bog'liq; hujjatni orqa sana bilan rasmiylashtirish esa oshkor qilish emas, halollik haqidadir.",
            },
            {
              key: "C",
              text_en: "Professional competence",
              text_ru: "Профессиональной компетентности",
              text_uz: "Professional malaka",
              why_wrong_en:
                "Competence is about knowledge and skill; the accountant likely KNOWS how to make the backdating, the question is whether they SHOULD.",
              why_wrong_ru:
                "Компетентность - про знания и навыки; бухгалтер, скорее всего, ЗНАЕТ, как изменить дату; вопрос в том, СТОИТ ли это делать.",
              why_wrong_uz:
                "Malaka bilim va ko'nikma haqida; buxgalter orqa sana bilan rasmiylashtirishni qanday qilishni ehtimol BILADI, savol esa buni QILISHI kerakmi-yo'qmi degandir.",
            },
            {
              key: "D",
              text_en: "Objectivity",
              text_ru: "Объективности",
              text_uz: "Xolislik",
              why_wrong_en:
                "Objectivity is about avoiding bias in professional judgement; backdating is straightforward dishonesty, primarily an integrity issue.",
              why_wrong_ru:
                "Объективность - про отсутствие предвзятости в профессиональном суждении; перенос даты - прямая нечестность, в первую очередь вопрос честности.",
              why_wrong_uz:
                "Xolislik professional hukmda tarafkashlikdan qochish haqida; orqa sana bilan rasmiylashtirish esa oddiy halolsizlik, asosan halollik masalasidir.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "Integrity requires accountants to be straightforward and honest in all professional and business relationships. Backdating a document is direct misrepresentation - falsifying the timing of a transaction to mislead users of the financial statements. The junior accountant should refuse and escalate. Other principles are affected too (professional behaviour, possibly objectivity), but integrity is the primary breach.",
          explanation_ru:
            "Честность требует от бухгалтера быть прямым и порядочным во всех профессиональных и деловых отношениях. Перенос даты документа задним числом - это прямое искажение, фальсификация времени операции с целью ввести в заблуждение пользователей отчётности. Младший бухгалтер должен отказаться и эскалировать. Затронуты и другие принципы (профессиональное поведение, возможно объективность), но главное нарушение - честности.",
          explanation_uz:
            "Halollik buxgalterlardan barcha professional va biznes munosabatlarida to'g'ri va halol bo'lishni talab qiladi. Hujjatni orqa sana bilan rasmiylashtirish to'g'ridan-to'g'ri yolg'on ko'rsatishdir - moliyaviy hisobot foydalanuvchilarini chalg'itish uchun operatsiya vaqtini soxtalashtirish. Kichik buxgalter rad etishi va yuqoriga ko'tarishi kerak. Boshqa tamoyillar ham ta'sirlanadi (professional xulq-atvor, ehtimol xolislik), ammo halollik asosiy buzilishdir.",
        },
        // -------- NEW Q13 - medium short_answer on due care --------
        {
          type: "mcq",
          difficulty: "medium",
          prompt_en:
            'The IESBA principle of "professional competence and due care" has two distinct obligations. Which option correctly states BOTH?',
          prompt_ru:
            "Принцип IESBA «профессиональная компетентность и должная осмотрительность» состоит из двух отдельных обязанностей. В каком варианте верно указаны ОБЕ?",
          prompt_uz:
            "IESBAning \"professional malaka va kerakli g'amxo'rlik\" tamoyili ikkita alohida majburiyatga ega. Qaysi variant IKKALASINI ham to'g'ri ifodalaydi?",
          options: [
            {
              key: "A",
              text_en:
                "Maintain professional knowledge and skill at the required level; and act diligently in accordance with applicable standards",
              text_ru:
                "Поддерживать профессиональные знания и навыки на требуемом уровне; и действовать добросовестно в соответствии с применимыми стандартами",
              text_uz:
                "Professional bilim va ko'nikmani talab qilingan darajada saqlash; va amaldagi standartlarga muvofiq tirishqoqlik bilan harakat qilish",
            },
            {
              key: "B",
              text_en:
                "Keep client information confidential; and avoid conflicts of interest",
              text_ru:
                "Сохранять конфиденциальность информации клиента; и избегать конфликта интересов",
              text_uz:
                "Mijoz axborotini maxfiy saqlash; va manfaatlar to'qnashuvidan qochish",
              why_wrong_en:
                "These describe confidentiality and objectivity - different fundamental principles, not the two limbs of competence and due care.",
              why_wrong_ru:
                "Это описывает конфиденциальность и объективность - другие основополагающие принципы, а не две части компетентности и должной осмотрительности.",
              why_wrong_uz:
                "Bular maxfiylik va xolislikni ta'riflaydi - boshqa asosiy tamoyillar, malaka va kerakli g'amxo'rlikning ikki qismi emas.",
            },
            {
              key: "C",
              text_en:
                "Be honest in all dealings; and behave professionally in public",
              text_ru:
                "Быть честным во всех делах; и вести себя профессионально публично",
              text_uz:
                "Barcha munosabatlarda halol bo'lish; va omma oldida professional o'zini tutish",
              why_wrong_en:
                "These describe integrity and professional behaviour, not competence and due care.",
              why_wrong_ru:
                "Это описывает честность и профессиональное поведение, а не компетентность и должную осмотрительность.",
              why_wrong_uz:
                "Bular halollik va professional xulq-atvorni ta'riflaydi, malaka va kerakli g'amxo'rlikni emas.",
            },
            {
              key: "D",
              text_en: "Charge fair fees; and complete work on time",
              text_ru:
                "Назначать справедливые гонорары; и выполнять работу в срок",
              text_uz: "Adolatli haq olish; va ishni o'z vaqtida yakunlash",
              why_wrong_en:
                "Fee-setting and timeliness are practice-management matters, not the two obligations within competence and due care.",
              why_wrong_ru:
                "Назначение гонораров и соблюдение сроков - вопросы управления практикой, а не две обязанности в рамках компетентности и должной осмотрительности.",
              why_wrong_uz:
                "Haq belgilash va o'z vaqtidalik - amaliyotni boshqarish masalalari, malaka va kerakli g'amxo'rlik ichidagi ikkita majburiyat emas.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            "The principle has two limbs. Competence is the obligation to keep learning - CPD, staying current with standards, and declining work outside one's expertise. Due care is the obligation to act carefully - applying knowledge diligently, following procedures, and completing work to professional standard.",
          explanation_ru:
            "Принцип состоит из двух частей. Компетентность - обязанность учиться: CPD, отслеживание изменений в стандартах, отказ от работы вне своей экспертизы. Должная осмотрительность - обязанность действовать внимательно: добросовестно применять знания, следовать процедурам и выполнять работу по профессиональным стандартам.",
          explanation_uz:
            "Tamoyilning ikkita qismi bor. Malaka - o'rganishni davom ettirish majburiyati: CPD, standartlardan boxabar bo'lish va o'z mutaxassisligidan tashqaridagi ishni rad etish. Kerakli g'amxo'rlik - ehtiyotkorlik bilan harakat qilish majburiyati: bilimni tirishqoqlik bilan qo'llash, protseduralarga rioya qilish va ishni professional standartda yakunlash.",
        },
        // -------- NEW Q14 - hard MCQ on multiple threats scenario --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            'An audit firm provides its largest client with both the annual audit and substantial tax-advisory work. The audit lead is the spouse of the client\u2019s finance director. The client recently hinted that "we expect smooth audits in light of our long relationship." This scenario contains the GREATEST number of threats from which set?',
          prompt_ru:
            "Аудиторская фирма оказывает крупнейшему клиенту и годовой аудит, и существенные налогово-консультационные услуги. Ведущий аудитор - супруг(а) финансового директора клиента. Клиент недавно намекнул: «мы ожидаем плавных аудитов с учётом наших долгих отношений». Какой набор угроз представлен в этом сценарии в НАИБОЛЬШЕМ количестве?",
          prompt_uz:
            "Audit firmasi eng yirik mijoziga ham yillik audit, ham salmoqli soliq-maslahat ishini taqdim etadi. Audit boshlig'i mijozning moliya direktorining turmush o'rtog'i. Mijoz yaqinda \"uzoq munosabatimizni hisobga olib, silliq auditlarni kutamiz\" deb ishora qildi. Bu vaziyat qaysi to'plamdan ENG KO'P sondagi tahdidni o'z ichiga oladi?",
          options: [
            {
              key: "A",
              text_en: "Self-interest, self-review, familiarity, intimidation",
              text_ru:
                "Личная заинтересованность, самопроверка, близкое знакомство, запугивание",
              text_uz:
                "Shaxsiy manfaat, o'z-o'zini ko'rib chiqish, yaqinlik, qo'rqitish",
            },
            {
              key: "B",
              text_en: "Self-interest, advocacy, familiarity",
              text_ru: "Личная заинтересованность, защита, близкое знакомство",
              text_uz: "Shaxsiy manfaat, targ'ibot, yaqinlik",
              why_wrong_en:
                "Advocacy isn't present in the scenario - there's no public defending of the client's position. Self-review and intimidation are missing from this answer.",
              why_wrong_ru:
                "Защиты в сценарии нет - нет публичного отстаивания позиции клиента. В этом варианте отсутствуют самопроверка и запугивание.",
              why_wrong_uz:
                "Targ'ibot vaziyatda mavjud emas - mijoz pozitsiyasini ommaviy himoya qilish yo'q. O'z-o'zini ko'rib chiqish va qo'rqitish bu javobda yetishmaydi.",
            },
            {
              key: "C",
              text_en: "Self-review, advocacy, intimidation",
              text_ru: "Самопроверка, защита, запугивание",
              text_uz: "O'z-o'zini ko'rib chiqish, targ'ibot, qo'rqitish",
              why_wrong_en:
                "This misses self-interest (largest-client status, fee dependency) and familiarity (spouse relationship), and incorrectly includes advocacy.",
              why_wrong_ru:
                "Пропущены личная заинтересованность (статус крупнейшего клиента, зависимость от гонораров) и близкое знакомство (супружеские отношения); защита упомянута ошибочно.",
              why_wrong_uz:
                "Bu shaxsiy manfaatni (eng yirik mijoz maqomi, haqqa bog'liqlik) va yaqinlikni (turmush o'rtog'i munosabati) o'tkazib yuboradi hamda noto'g'ri ravishda targ'ibotni kiritadi.",
            },
            {
              key: "D",
              text_en: "Familiarity only",
              text_ru: "Только близкое знакомство",
              text_uz: "Faqat yaqinlik",
              why_wrong_en:
                "This grossly understates the threats - the scenario clearly contains multiple threat categories, not just one.",
              why_wrong_ru:
                "Это сильно занижает уровень угроз - в сценарии явно присутствуют несколько категорий, а не одна.",
              why_wrong_uz:
                "Bu tahdidlarni qo'pol ravishda kam ko'rsatadi - vaziyat aniq bir nechta tahdid toifasini o'z ichiga oladi, faqat bittasini emas.",
            },
          ],
          correct_answer_en: "A",
          explanation_en:
            'Four distinct threats present here. (1) Self-interest: "largest client" implies fee dependency - losing this client materially affects the firm. (2) Self-review: providing tax-advisory work creates a position to review (the audit assesses tax balances the firm itself advised on). (3) Familiarity: spouse of the finance director is a textbook close personal relationship. (4) Intimidation: the hint about "smooth audits" is an implied threat - meet expectations or lose us. Each threat alone would require safeguards; together they are likely incompatible with continuing the engagement.',
          explanation_ru:
            "Здесь присутствуют четыре отдельные угрозы. (1) Личная заинтересованность: «крупнейший клиент» подразумевает зависимость от гонораров - потеря клиента существенно ударит по фирме. (2) Самопроверка: налогово-консультационная работа создаёт позицию для проверки (аудит оценивает налоговые остатки, по которым сама фирма консультировала). (3) Близкое знакомство: супруг(а) финдиректора - хрестоматийный пример тесных личных отношений. (4) Запугивание: намёк на «плавный аудит» - это завуалированная угроза: соответствуйте ожиданиям или потеряете нас. Любая из этих угроз по отдельности требует защитных мер; в совокупности они, вероятно, несовместимы с продолжением задания.",
          explanation_uz:
            "Bu yerda to'rtta alohida tahdid mavjud. (1) Shaxsiy manfaat: \"eng yirik mijoz\" haqqa bog'liqlikni anglatadi - bu mijozni yo'qotish firmaga sezilarli ta'sir qiladi. (2) O'z-o'zini ko'rib chiqish: soliq-maslahat ishini taqdim etish ko'rib chiqiladigan pozitsiya yaratadi (audit firma o'zi maslahat bergan soliq qoldiqlarini baholaydi). (3) Yaqinlik: moliya direktorining turmush o'rtog'i - klassik yaqin shaxsiy munosabat. (4) Qo'rqitish: \"silliq auditlar\" haqidagi ishora yashirin tahdid - kutilmaga javob bering yoki bizni yo'qoting. Har bir tahdid yakka holda himoya choralarini talab qiladi; birgalikda esa ular loyihani davom ettirish bilan mos kelmasligi ehtimoli yuqori.",
        },
        // -------- NEW Q15 - hard MCQ on bribery + cross-border ethics --------
        {
          type: "mcq",
          difficulty: "hard",
          prompt_en:
            'A multinational firm operates in a country where it is locally customary to pay a small "facilitation fee" to officials to speed up customs clearance. From the IESBA Code perspective, the accountant in this firm should:',
          prompt_ru:
            "Транснациональная компания работает в стране, где принято платить чиновникам небольшой «ускорительный сбор» для быстрого прохождения таможни. С точки зрения Кодекса IESBA бухгалтер этой компании должен:",
          prompt_uz:
            "Transmilliy firma bojxona rasmiylashtiruvini tezlashtirish uchun amaldorlarga kichik \"jarayonni yengillashtirish to'lovi\" to'lash mahalliy odat bo'lgan mamlakatda faoliyat yuritadi. IESBA Kodeksi nuqtai nazaridan, bu firmadagi buxgalter quyidagini qilishi kerak:",
          options: [
            {
              key: "A",
              text_en:
                "Pay the fee as it is locally customary and culturally appropriate",
              text_ru:
                "Платить сбор, поскольку это местная традиция и культурно уместно",
              text_uz:
                "To'lovni mahalliy odat va madaniy jihatdan mos bo'lgani uchun to'lash",
              why_wrong_en:
                "Local custom does not override the IESBA principle of professional behaviour, which requires compliance with the wider legal framework - facilitation payments are illegal under most international anti-bribery laws.",
              why_wrong_ru:
                "Местная традиция не отменяет принцип IESBA «профессиональное поведение», требующий соблюдения более широкой правовой базы - ускорительные платежи незаконны по большинству международных антикоррупционных законов.",
              why_wrong_uz:
                "Mahalliy odat IESBAning professional xulq-atvor tamoyilidan ustun kelmaydi, u esa kengroq qonuniy doiraga rioya qilishni talab qiladi - jarayonni yengillashtirish to'lovlari aksariyat xalqaro poraga qarshi qonunlarda noqonuniydir.",
            },
            {
              key: "B",
              text_en:
                "Refuse to make or record such payments, applying professional behaviour and integrity principles",
              text_ru:
                "Отказаться совершать или учитывать такие платежи, применяя принципы профессионального поведения и честности",
              text_uz:
                "Professional xulq-atvor va halollik tamoyillarini qo'llab, bunday to'lovlarni amalga oshirish yoki qayd etishdan bosh tortish",
            },
            {
              key: "C",
              text_en:
                'Pay the fee but record it as a "consultancy expense" to avoid scrutiny',
              text_ru:
                "Платить сбор, но учитывать его как «консультационные расходы» во избежание проверок",
              text_uz:
                "To'lovni to'lash, ammo tekshiruvdan qochish uchun uni \"konsalting xarajati\" sifatida qayd etish",
              why_wrong_en:
                "Disguising the nature of payments is a clear breach of integrity AND professional behaviour - concealment compounds the original breach into a fraud.",
              why_wrong_ru:
                "Скрытие истинной природы платежей - явное нарушение И честности, И профессионального поведения; маскировка превращает изначальное нарушение в мошенничество.",
              why_wrong_uz:
                "To'lovlar tabiatini yashirish halollikni HAM, professional xulq-atvorni HAM aniq buzadi - yashirish dastlabki buzilishni firibgarlikka aylantiradi.",
            },
            {
              key: "D",
              text_en: "Pay personally rather than through the company books",
              text_ru: "Платить лично, а не через бухгалтерию компании",
              text_uz: "Kompaniya hisob kitoblari orqali emas, shaxsan to'lash",
              why_wrong_en:
                "Personal payment doesn't change the legal or ethical character of the bribe; it simply hides it from corporate records, which compounds the breach.",
              why_wrong_ru:
                "Личный платёж не меняет ни юридическую, ни этическую природу взятки; он лишь скрывает её от корпоративных записей, усугубляя нарушение.",
              why_wrong_uz:
                "Shaxsiy to'lov poraning qonuniy yoki etik tabiatini o'zgartirmaydi; u shunchaki uni korporativ yozuvlardan yashiradi, bu esa buzilishni yanada og'irlashtiradi.",
            },
          ],
          correct_answer_en: "B",
          explanation_en:
            'Facilitation payments are bribes regardless of local custom. Modern anti-bribery legislation (UK Bribery Act 2010, US Foreign Corrupt Practices Act) prohibits them with very narrow exceptions. From the IESBA perspective: professional behaviour requires compliance with laws AND avoidance of conduct that discredits the profession; integrity requires honesty about the nature of payments. The correct response is to refuse, to refuse to record it dishonestly if pressed, and to escalate internally. The "everyone does it locally" defence does not survive international scrutiny - and the accountant\'s career is unlikely to survive being personally associated with disguised bribery.',
          explanation_ru:
            "Ускорительные платежи - это взятки, независимо от местной традиции. Современное антикоррупционное законодательство (Bribery Act 2010 Великобритании, Foreign Corrupt Practices Act США) запрещает их с очень узкими исключениями. С точки зрения IESBA: профессиональное поведение требует соблюдения законов И отказа от действий, дискредитирующих профессию; честность требует правды о природе платежей. Правильный ответ - отказаться, отказаться нечестно учитывать, если давят, и эскалировать внутри. Защита «у нас все так делают» не выдерживает международной проверки - а карьера бухгалтера вряд ли выдержит личной связи со скрытой взяткой.",
          explanation_uz:
            "Jarayonni yengillashtirish to'lovlari mahalliy odatdan qat'i nazar poradir. Zamonaviy poraga qarshi qonunchilik (Buyuk Britaniya 2010-yilgi Poraga Qarshi Qonuni, AQSh Xorijiy Korrupsiyaga Qarshi Amaliyot Qonuni) ularni juda tor istisnolar bilan taqiqlaydi. IESBA nuqtai nazaridan: professional xulq-atvor qonunlarga rioya qilishni VA kasbni obro'sizlantiruvchi xatti-harakatdan qochishni talab qiladi; halollik esa to'lovlar tabiati haqida rostgo'ylikni talab qiladi. To'g'ri javob - rad etish, bosim o'tkazilsa uni halolsiz qayd etishdan bosh tortish va ichki tomonga ko'tarish. \"Hamma mahalliy darajada shunday qiladi\" mudofaasi xalqaro tekshiruvga bardosh bermaydi - va buxgalterning karyerasi yashirin pora bilan shaxsan bog'lanishidan keyin omon qolishi ehtimoldan yiroq.",
        },
      ],
    },
  ],
};
