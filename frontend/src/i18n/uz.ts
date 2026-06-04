// Static UZ (Uzbek, Latin script) locale strings. These are the canonical
// source - DB overrides from /api/ui-translations/uz take precedence at
// runtime (merged in main.ts). Keep keys stable; rename = breaking change for
// any DB overrides referencing them.
//
// TRANSLATION STATUS: all user-facing sections (common … unsubscribe) are
// drafted in Uzbek and NEED NATIVE REVIEW before shipping to students. The
// `admin` section is intentionally left in English for now (internal-only UI);
// it will be translated alongside the content-layer Uzbek work. Missing/English
// keys fall back cleanly via vue-i18n's fallbackLocale, so the app stays
// functional regardless.

export default {
  common: {
    cancel: "Bekor qilish",
    save: "Saqlash",
    save_changes: "O'zgarishlarni saqlash",
    saving: "Saqlanmoqda…",
    delete: "O'chirish",
    edit: "Tahrirlash",
    add: "Qo'shish",
    adding: "Qo'shilmoqda…",
    loading: "Yuklanmoqda…",
    back: "Orqaga",
    yes: "Ha",
    no: "Yo'q",
    confirm: "Tasdiqlash",
    sign_out: "Chiqish",
    sign_in: "Kirish",
    back_to_home: "Bosh sahifaga",
    submit: "Yuborish",
    next: "Keyingi",
    finish: "Tugatish",
    optional: "ixtiyoriy",
    none: "-",
    close: "Yopish",
    error_generic: "Nimadir xato ketdi",
  },

  lang: {
    name_en: "Inglizcha",
    name_ru: "Ruscha",
    name_uz: "O'zbekcha",
    label: "Til",
  },

  theme: {
    label: "Mavzu",
    light: "Yorug'",
    dark: "Qorong'i",
    switch_to_light: "Yorug' mavzuga o'tish",
    switch_to_dark: "Qorong'i mavzuga o'tish",
  },

  nav: {
    dashboard: "Boshqaruv paneli",
    progress: "Taraqqiyot",
    profile: "Profil",
    settings: "Sozlamalar",
    leaderboards: "Reyting",
    mocks: "Sinov imtihoni",
    admin_panel: "Admin panel",
    back_to_dashboard: "← Boshqaruv paneliga",
    back_to_app: "← Ilovaga qaytish",
    stat_streak_tip:
      "Kunlik seriya - kamida bitta dars bajarilgan ketma-ket kunlar soni.",
    stat_xp_tip:
      "Tajriba ballari - to'g'ri javoblar va tugatilgan darslar uchun beriladi.",
    stat_level_tip:
      "{level}-daraja · {next}-darajaga {intoLevel} / {bandSize} XP",
    stat_level_short: "{level}-dr",
    stat_freeze_tip:
      "Seriya muzlatishlari - har biri bitta o'tkazib yuborilgan kunni qoplaydi. Har 14 kunlik seriya uchun bittadan beriladi (eng ko'pi 2 ta).",
    open_menu: "Menyuni ochish",
    menu: "Menyu",
    theme: "Mavzu",
  },

  // Document titles, set on every navigation by the router's afterEach hook.
  // Format: "{page} · Finshark" - except the bare brand for the landing page
  // ('home') where the title is just "Finshark" since the landing IS the
  // brand and prefixing would feel tautological.
  page_titles: {
    home: "Finshark",
    login: "Kirish",
    auth_callback: "Kirilmoqda…",
    two_factor_verify: "Ikki bosqichli tasdiqlash",
    unsubscribe: "Obunani bekor qilish",
    onboarding: "Xush kelibsiz",
    dashboard: "Boshqaruv paneli",
    progress: "Taraqqiyot",
    profile: "Profil",
    public_profile: "O'yinchi profili",
    settings: "Sozlamalar",
    two_factor_setup: "2FA sozlash",
    leaderboards: "Reyting",
    mock_start: "Sinov imtihoni",
    mock_breakdown: "Sinov natijalari",
    mock_review: "Sinovni ko'rib chiqish",
    lesson: "Dars",
    admin_content: "Admin · Kontent",
    admin_overview: "Admin · Umumiy",
    admin_users: "Admin · Foydalanuvchilar",
    admin_user_detail: "Admin · Foydalanuvchi",
    admin_localization: "Admin · Lokalizatsiya",
    admin_whitelist: "Admin · Oq ro'yxat",
    admin_promocodes: "Admin · Promokodlar",
    admin_subscriptions: "Admin · Obunalar",
    admin_email_templates: "Admin · Email shablonlar",
  },

  home: {
    title: "Finshark",
    tagline: "ACCA imtihonlari uchun kunlik mini-darslar.",
    cta: "Boshlash",
  },

  landing: {
    eyebrow: "ACCA tayyorgarligi - kuniga 10 daqiqalik to'plamlarda",
    hero_title: "ACCA'ni o'qishga vaqtingiz qanchaligiga moslab toping.",
    hero_sub:
      "Finshark ACCA dasturini qisqa kunlik savol to'plamlariga aylantiradi. Siz doimo xato qiladigan mavzularni kuzatib boradi va ular mustahkamlanmaguncha qaytarib turadi. Har savoldan keyin darhol javob va batafsil tushuntirish.",
    cta_primary: "O'qishni boshlash",
    cta_secondary: "Qanday ishlashini ko'rish",
    hero_foot:
      "ACCA'ni ish bilan birga olib boradiganlar uchun - uchrashuvlar orasida, yo'lda, tushlik paytida.",

    // Stat band - three concrete, defensible numbers under the hero. Keep these
    // honest; they double as the product's current scope. stat_1 counts up on
    // scroll, so its number and unit are split.
    stat_1_value: "10 daq",
    stat_1_unit: "daq",
    stat_1_label: "kuniga - mo'ljallangan yuklama",
    stat_2_value: "F1-F3",
    stat_2_label: "mavjud, qolganlari tekshiruvda",
    stat_3_value: "EN / RU",
    stat_3_label: "har bir savol ikki tilda",

    // Hero product demo - an interactive MCQ the visitor can answer. Labels
    // render inside the demo card. Option B is the correct answer.
    mock_topic: "Xarajatlar tasnifi",
    mock_question: "Ishlab chiqarish o'sganda jami summasi o'zgarmaydigan xarajat qaysi?",
    mock_opt_a: "To'g'ridan-to'g'ri materiallar",
    mock_opt_b: "Zavod ijarasi",
    mock_opt_c: "Sotuvdan komissiya",
    mock_why_a: "To'g'ridan-to'g'ri materiallar ishlab chiqarish bilan o'sadi, shuning uchun jami summa o'zgaruvchan.",
    mock_why_c: "Komissiya har bir sotuv uchun to'lanadi, shuning uchun ishlab chiqarish o'sgani sari ortadi.",
    mock_submit: "Javobni tekshirish",
    mock_retry: "Qayta urinish",
    mock_ring_label: "Dastur qamrovi",
    mock_feedback_correct: "To'g'ri - zavod ijarasi ishlab chiqarishdan qat'i nazar o'zgarmas.",
    mock_feedback_wrong: "Unchalik emas - to'g'ri javob: zavod ijarasi.",
    mock_streak: "{n} kunlik seriya",

    // "Why Finshark" - the value block. Shark metaphor kept to a light touch:
    // the name, a single line about tracking weak spots. No teeth, no hunting.
    why_title: "Nega Finshark",
    why_lede:
      "Ko'p ACCA kurslari sizda cheksiz vaqt bor deb hisoblaydi. Finshark esa oddiy kunda topa oladigan o'sha o'n daqiqa atrofida qurilgan.",
    why_1_title: "Zaif joylaringizni topadi",
    why_1_body:
      "Finshark siz doimo xato qiladigan mavzularni kuzatadi va ertasi kuni ularni qaytaradi. Zaif joylar imtihon haftasidan ancha oldin, hali muhim ekan, ertangi to'plamda yana paydo bo'ladi.",
    why_2_title: "Haqiqiy jadvalga mos keladi",
    why_2_body:
      "Bo'sh vaqt topilganda ilovani oching, u qilishga arziydigan keyingi to'plamni beradi. Uchrashuvlar orasidagi, yo'ldagi yoki uxlashdan oldingi o'n daqiqa qo'shilib boradi.",
    why_3_title: "Qayerda turganingizni ko'rsatadi",
    why_3_body:
      "Dasturning har bir o'quv maqsadi haqiqiy o'zlashtirishingizga qarab ranglangan issiqlik xaritasi - shunda imtihon kunigacha qaysi mavzular ustida ishlash kerakligini doim bilasiz.",

    features_title: "Aslida qanday o'qishingizga moslab qurilgan",
    feature_1_title: "Tezkor mini-darslar",
    feature_1_body:
      "Kuniga besh-o'ndan savol, uchrashuvlar orasidagi tanaffus, yo'l yoki qahva tanaffusiga mos o'lchamda.",
    feature_2_title: "Moslashuvchan qiyinlik",
    feature_2_body:
      "Oraliqli takrorlash kecha xato qilganingizni qaytaradi, shunda u bir oydan keyin ham yodingizda qoladi.",
    feature_3_title: "Rag'batlantiruvchi seriyalar",
    feature_3_body:
      "Kunlik seriya, XP va nishonlar har bir mashg'ulotga kichik mukofot beradi va odatni kundan-kunga davom ettiradi.",
    feature_4_title: "Zaif joylaringizni ko'ring",
    feature_4_body:
      "Dastur qamrovi issiqlik xaritasi qaysi mavzularni o'zlashtirganingizni va qaysilari imtihon kunigacha ishlanishi kerakligini aniq ko'rsatadi.",

    steps_title: "Qanday ishlaydi",
    step_1_title: "Fanni tanlang",
    step_1_body:
      "F1, F2 yoki F3 dan o'qiyotganingizni tanlang va davomida boshqa fanlarni qo'shing.",
    step_2_title: "Besh-o'nta savolga javob bering",
    step_2_body:
      "Haqiqiy ACCA obyektiv test formatlariga mos keladigan variantli va raqamli savollar aralashmasi, har javobdan keyin darhol javob va batafsil tushuntirish bilan.",
    step_3_title: "Ertaga qayting",
    step_3_body:
      "Eslatmalar, sinov imtihonlari va imtihonga tayyor bo'lganingiz sari yashillashib boradigan dastur issiqlik xaritasi.",

    // FAQ - short, defensive section. Answers the questions a sceptical visitor
    // would ask before signing up. Keep each answer to ~2 sentences.
    faq_title: "Ro'yxatdan o'tishdan oldingi savollar",
    faq_1_q: "Finshark Kaplan / BPP darsliklari o'rnini bosadimi?",
    faq_1_a:
      "Finshark ular bilan birga ishlaydi. Darsliklar dasturni noldan o'rgatadi; Finshark esa allaqachon o'rganganingizni mustahkam saqlaydi, unutganingizni qaytaradi va imtihon kunigacha bo'shliqlar qayerdaligini ko'rsatadi.",
    faq_2_q: "ACCA'ning qaysi fanlari qamrab olingan?",
    faq_2_a:
      "Applied Knowledge fanlaridan - F1'dan F3'gacha boshlaymiz. Yangi fanlar ularning savol banklari ACCA malakali o'qituvchilari tomonidan tekshirilgani sari qo'shiladi.",
    faq_3_q: "Kuniga qancha vaqt sarflashim kerak?",
    faq_3_a:
      "O'n daqiqa - mo'ljallangan vaqt. Kunlik dars besh-o'nta savol bo'lib, darhol tushuntirishlar bilan: biror narsa o'rganish uchun yetarli va har kuni qilish uchun yetarlicha qisqa.",
    faq_4_q: "O'tgan imtihon savollaringiz bormi?",
    faq_4_a:
      "Ha, ochiq mavjud bo'lgan joyda - ACCA amaliyot platformasi va OpenTuition'dan olingan. Har bir savol o'z o'quv maqsadiga bog'langan, shunda u nimani tekshirayotganini bilasiz.",
    faq_5_q: "Tushuntirishlar qayerdan olinadi?",
    faq_5_a:
      "Kaplan, BPP va ACCA o'quv qo'llanmalari kabi tasdiqlangan materiallardan, sodda tilda qayta yozilgan. Har bir tushuntirish o'zi qamrab olgan o'quv maqsadini ko'rsatadi.",

    // Study activity calendar section - mirrors the Profile heatmap. Weekday
    // labels reuse profile.heatmap_day_* so they aren't duplicated here.
    activity_title: "Muntazamligingiz qanday o'sishini kuzating",
    activity_lede:
      "Har kuni o'qiganingizda bir katakcha yonadi. Ko'p kunlar bir necha daqiqadan - bu imtihon oldidan bir hafta tiqishtirishdan yaxshiroq, va kalendar odatni ko'rinarli qiladi.",
    activity_less: "Kam",
    activity_more: "Ko'p",

    bottom_cta_title: "Boshlashga tayyormisiz?",
    bottom_cta_sub: "Kirib, bitta darsni sinab ko'ring. Bu taxminan uch daqiqa vaqt oladi.",
  },

  login: {
    title: "Kirish",
    subtitle: "O'qishni boshlash uchun Google hisobingiz bilan kiring.",
    google_btn: "Google bilan davom etish",
    error_callback: "Kirish amalga oshmadi. Iltimos, qayta urinib ko'ring.",
    error_email_not_allowed:
      "Bu email kirish ro'yxatida yo'q. Kirishdan oldin administratordan uni qo'shishni so'rang.",
  },

  dashboard: {
    welcome_back: "Xush kelibsiz",
    keep_streak: "Keling, seriyani davom ettiramiz.",
    streak: "Seriya",
    xp: "XP",
    level: "Daraja",
    start_lesson_heading: "Fanni tanlang va kirishing",
    view_progress: "Taraqqiyotingizni ko'ring →",
    no_papers: "Hozircha fanlar yo'q.",
    no_papers_admin: "Admin panelda bittasini qo'shing.",
    loading_papers: "Fanlar yuklanmoqda…",
    any_paper: "Istalgan fan",
    start_lesson_btn: "Darsni boshlash",
    starting: "Tayyorlanmoqda…",
    daily_reminders_title: "Kunlik eslatma xatlari",
    daily_reminders_sub: "Agar hali o'qimagan bo'lsangiz, {hour}:00 ({tz}) da eslatma.",
    reminders_on: "Eslatmalarni o'chirish",
    reminders_off: "Eslatmalarni yoqish",
    // Quota chips, shown to free-tier users on the dashboard above the
    // lesson-start row. {used}/{limit} pattern; refreshes after each lesson
    // / mock complete via the entitlement store.
    quota_lessons: "Bugun {used}/{limit} dars",
    quota_mocks: "Bu oy {used}/{limit} sinov",
    quota_hearts: "Bugun {pool}/{max} yurak",
    quota_upgrade: "Yangilash",
    quota_lessons_exhausted: "Bugun zo'r ishladingiz - yangi darslar ertaga ochiladi.",
    quota_hearts_exhausted: "💔 Yuraklar tugadi - vaqt mintaqangizda yarim tunda qaytadi.",
    quota_mocks_exhausted: "Bu oygi sinovni ishlatib bo'ldingiz - kelasi oy ko'rishguncha!",
    // Banner copy for the prominent hearts-empty state on the dashboard.
    // Two-line block (title + sub) keeps the call-to-action separable from
    // the situation summary.
    hearts_empty_banner_title: "💔 Bugun yurak qolmadi",
    hearts_empty_banner_sub:
      "Ular vaqt mintaqangizda yarim tunda to'ladi. Hozir o'qimoqchimisiz? Premiumda yuraklar cheksiz.",
    premium_badge: "Premium",
    // Locked paper picker entry (used by the dashboard + mock-start <option>).
    // We keep the picker showing premium-only papers so free users can see
    // what they'd unlock; the start button surfaces a friendly 403 when they
    // try.
    premium_status: {
      "free": "Bepul",
      "premium_monthly": "Oylik",
      "premium_yearly": "Yillik",
      "premium_lifetime": "Umrbod",
    },
    paper_locked_suffix: "🔒 Premium",
  },

  leaderboards: {
    title: "Reyting",
    subtitle: "Roziligini bergan foydalanuvchilar bo'yicha XP reytingi. Bu yerda ko'rinish uchun rozilik bering.",
    window_week: "Bu hafta",
    window_month: "Bu oy",
    window_all: "Butun davr",
    all_papers: "Barcha fanlar",
    col_rank: "#",
    col_name: "Ism",
    col_level: "Daraja",
    col_xp: "XP",
    col_streak: "Seriya",
    you_badge: "siz",
    empty: "Bu davr uchun hali reytingda foydalanuvchilar yo'q.",
    optin_title: "Reytingda ko'rining",
    optin_body:
      "Ko'rsatiladigan ismingiz, darajangiz, XP va seriyangiz boshqa tizimga kirgan foydalanuvchilarga ko'rinadi. Buni istalgan vaqtda Sozlamalardan o'chirishingiz mumkin.",
    optin_enable: "Yoqish",
  },

  onboarding: {
    title: "Finshark'ga xush kelibsiz",
    subtitle:
      "O'quv rejangizni shakllantirish uchun bir nechta tezkor savol. Hammasini keyinroq sozlamalarda o'zgartirishingiz mumkin.",
    skip: "Hozircha o'tkazib yuborish",
    continue: "Davom etish",
    bg: {
      question: "ACCA bo'yicha tayyorgarligingiz qanday?",
      beginner_title: "Endi boshlayapman",
      beginner_desc:
        "Men ACCA'da yangiman. Osonroq savollar va qisqaroq darslardan boshlang.",
      intermediate_title: "Biroz tajriba bor",
      intermediate_desc:
        "Men dasturning bir qismini o'rganganman. Menga muvozanatli aralashma bering.",
      advanced_title: "Tajribali",
      advanced_desc: "Menga qiyinchilik kerak. O'rta va qiyin savollarga ko'proq e'tibor bering.",
    },
    time: {
      question: "Kuniga qancha vaqt o'qimoqchisiz?",
      help: "Darslaringizni shunga moslab o'lchaymiz. Har doim ko'proq qilishingiz mumkin.",
      minutes: "{n} daq",
    },
    paper: {
      question: "Birinchi navbatda qaysi fanni mo'ljallayapsiz?",
      empty:
        "Hozircha fanlar yo'q. Keyinroq boshqaruv panelidan bittasini tanlashingiz mumkin.",
    },
    reminders: {
      question: "Menga kunlik email eslatma yuborilsin",
      help: "Kuniga bir marta, sizga qulay soatda. Buni istalgan vaqtda o'chirishingiz mumkin.",
    },
  },

  lesson: {
    quit: "← chiqish",
    quit_confirm:
      "Bu darsdan chiqasizmi? Shu paytgacha bergan javoblaringiz saqlanadi; sessiyani istalgan vaqtda davom ettirishingiz mumkin.",
    concept_tag: "tushuncha",
    submit: "Yuborish",
    checking: "Tekshirilmoqda…",
    finishing: "Tugatilmoqda…",
    next: "Keyingi →",
    finish: "Darsni tugatish",
    correct: "To'g'ri",
    wrong: "Unchalik emas.",
    correct_answer_label: "To'g'ri javob:",
    mastery_label: "O'zlashtirish {pct}%",
    next_review_label: "Keyingi takror · {date}",
    keys_help: "tanlash · davom",
    keys_help_text: "yuborish",
    short_answer_placeholder: "Javobingizni yozing…",
    short_answer_help: "Yuborish uchun Enter, yangi qator uchun Shift+Enter.",
    number_entry_placeholder: "Raqam kiriting",
    number_entry_help: "Yuborish uchun Enter.",
    number_entry_tolerance: "±{tol} qabul qilinadi.",
    why_wrong_show: "Tushuntirishlarni ko'rsatish",
    why_wrong_hide: "Tushuntirishlarni yashirish",
    theory_title: "Boshlashdan oldin",
    theory_subtitle: "Bu dars nimani qamrab olishini tezkor takrorlash.",
    theory_start: "Darsni boshlash",
    theory_skip: "Takrorni o'tkazib yuborish",
    complete_title: "Dars tugadi",
    complete_correct: "To'g'ri",
    complete_xp_earned: "Olingan XP",
    // Sub-line under the XP total on the finale screen when a streak bonus
    // was applied. {base} is the raw XP from this session, {bonus} is the
    // streak multiplier add-on. Hidden when bonus = 0.
    complete_xp_streak_bonus: "{base} asosiy + {bonus} seriya bonusi",
    complete_streak: "Seriya",
    complete_level: "Daraja",
    complete_back: "Boshqaruv paneliga",
    level_up: "Daraja oshdi - endi siz {level}-darajadasiz!",
    streak_freeze_used:
      "Seriya muzlatish bilan saqlandi! ({remaining} ta muzlatish qoldi)",
    streak_freeze_earned: "Siz seriya muzlatishini oldingiz - endi sizda {count} ta bor.",
    loading: "Dars yuklanmoqda…",
    out_of_hearts_title: "💔 Yuraklar tugadi!",
    out_of_hearts_body:
      "Bu raundda yuraklaringiz tugadi. Bir nafas oling - seriyangiz hali ham hisobga olinadi va yangi dars bir bosishda.",
    wrapping_up_title: "Yakunlanmoqda…",
    wrapping_up_body: "Biroz kuting, taraqqiyotingizni saqlayapmiz.",
    hearts_label: "Yuraklar",
    badges_earned_title: "Yangi nishonlar olindi",
    mock_timer_label: "Qolgan vaqt",
  },

  mocks: {
    start_title: "Sinov imtihoni",
    start_subtitle:
      "CBE uslubidagi vaqtli mashq. Yuraksiz - vaqt tugaguncha o'z sur'atingizda javob bering.",
    paper_label: "Fan",
    no_papers: "Fanlar yo'q. Admin kamida bittasini qo'shishi kerak.",
    count_label: "Savollar soni",
    time_label: "Vaqt chegarasi",
    time_minutes: "{n} daq",
    time_help:
      "Vaqt tugaganda sinov avtomatik yuboriladi va siz bo'limlar bo'yicha tahlilni ko'rasiz.",
    start_btn: "Sinovni boshlash",
    starting: "Boshlanmoqda…",
    breakdown_title: "Sinov natijalari",
    passed_label: "O'tdi",
    failed_label: "O'tish balidan past",
    per_lo_title: "Mavzu bo'yicha",
    no_attempts: "Urinishlar qayd etilmagan.",
    review_btn: "Xato javoblarni ko'rib chiqish",
    review_starting: "Ko'rib chiqish boshlanmoqda…",
    review_answers_btn: "Javoblarni ko'rib chiqish",
    review_practice_btn: "Xato javoblarni mashq qilish",
    review_practice_wrong_btn: "Bularni darsda mashq qilish",
    review_title: "Sinovni ko'rib chiqish",
    review_subtitle: "Javoblaringizni ko'rib chiqing - nimani to'g'ri qildingiz, nimani qayta ko'rish kerak.",
    review_back_breakdown: "Tahlilga qaytish",
    review_filter_incorrect: "Ko'rib chiqish kerak ({n})",
    review_filter_all: "Barcha savollar ({n})",
    review_score: "Natija: {correct} / {total}",
    review_empty_incorrect: "Bu yerda ko'rib chiqadigan narsa yo'q - barcha savolni to'g'ri qildingiz.",
    review_your_answer: "Sizning javobingiz",
    review_correct_answer: "To'g'ri javob",
    review_no_answer: "- yetib bormadingiz -",
    review_status_correct: "To'g'ri",
    review_status_wrong: "Xato",
    review_status_unanswered: "Javobsiz",
    done_btn: "Tayyor",
  },

  progress: {
    title: "Taraqqiyot",
    syllabus_coverage: "Dastur qamrovi",
    no_papers_yet: "Hozircha fanlar yo'q. Admin kamida bittasini qo'shishi kerak.",
    no_los_for_paper: "Bu fan uchun hali o'quv maqsadlari yo'q.",
    weak_topics: "Zaif mavzular",
    no_weak_topics: "Hozircha ma'lumot yo'q - dars qiling va qayting.",
    recent_sessions: "So'nggi sessiyalar",
    no_sessions: "Hozircha sessiyalar yo'q.",
    band_not_started: "Boshlanmagan",
    band_weak: "Zaif",
    band_learning: "O'rganilmoqda",
    band_strong: "Kuchli",
    badge_completed: "tugatilgan",
    badge_in_progress: "jarayonda",
    loading: "Taraqqiyot yuklanmoqda…",
  },

  profile: {
    title: "Profil",
    email: "Email",
    display_name: "Ko'rsatiladigan ism",
    joined: "Qo'shilgan",
    total_lessons: "Tugatilgan darslar",
    total_questions: "Javob berilgan savollar",
    accuracy: "Aniqlik",
    save_display_name: "Ismni saqlash",
    chart_accuracy_by_paper: "Fan bo'yicha aniqlik",
    chart_activity_heatmap: "Faollik",
    chart_activity_window_90: "So'nggi 3 oy",
    chart_activity_window_180: "So'nggi 6 oy",
    chart_activity_window_365: "So'nggi yil",
    heatmap_day_mon: "Du",
    heatmap_day_wed: "Cho",
    heatmap_day_fri: "Ju",
    // {count} = number of questions answered that day. Plural-safe via Intl.
    heatmap_tooltip_count_one: "{count} ta savolga javob berildi",
    heatmap_tooltip_count_other: "{count} ta savolga javob berildi",
    heatmap_tooltip_none: "Faollik yo'q",
    chart_mastery_over_time: "Vaqt bo'yicha o'rtacha o'zlashtirish",
    chart_difficulty_breakdown: "Qiyinlik bo'yicha savollar",
    chart_type_breakdown: "Turi bo'yicha savollar",
    // Empty states for the three breakdown charts (accuracy-by-paper,
    // difficulty, type). Distinct from progress.no_weak_topics - these
    // appear when the user has zero attempts in the relevant slice. Same
    // wording across the three because the call-to-action is identical.
    chart_no_data: "Hozircha ma'lumot yo'q - buni ko'rish uchun bir nechta savolga javob bering.",
    badges_section: "Nishonlar",
    badges_earned_count: "{total} dan {earned} ta olingan",
    badges_loading: "Nishonlar yuklanmoqda…",
    badges_empty: "Hozircha nishonlar yo'q.",
    badges_unearned_label: "Qulflangan",
    badges_earned_at: "{date} da olingan",
    achievements_section: "Yutuqlar",
    achievements_unlocked_count: "{total} dan {unlocked} ta ochilgan",
    achievements_loading: "Yutuqlar yuklanmoqda…",
    achievements_locked: "Hali ochilmagan",
    achievements_level_label: "{max} dan {level}-daraja · {name}",
    achievements_max_reached: "Eng yuqori darajaga yetildi",
    payments_section: "To'lovlar",
    payments_empty: "Sizda hali obunalar yo'q.",
    payments_redeem_hint:
      "Promokodingiz bormi? Uni Sozlamalardagi Premium bo'limidan faollashtiring.",
    // Display labels for the plan column in the payments history. Keyed by
    // the backend plan id (free / premium_monthly / premium_yearly /
    // premium_lifetime). Unknown ids fall back to the raw id at the call site.
    plan_name_free: "Bepul",
    plan_name_premium_monthly: "Premium · oylik",
    plan_name_premium_yearly: "Premium · yillik",
    plan_name_premium_lifetime: "Premium · umrbod",
    danger_zone: "Xavfli zona",
    delete_account: "Hisobni o'chirish",
    delete_account_warning:
      "Bu hisobingizni, dars tarixingizni va barcha taraqqiyotingizni butunlay o'chiradi. Buni bekor qilib bo'lmaydi.",
    delete_account_confirm: "O'chirishni tasdiqlash uchun emailingizni yozing",
  },

  public_profile: {
    title: "Profil",
    not_found: "Bu foydalanuvchi mavjud emas.",
    lessons: "Darslar",
    accuracy: "Aniqlik",
    badges_section: "Olingan nishonlar",
    no_badges: "Hozircha nishonlar olinmagan.",
    achievements_section: "Olingan yutuqlar",
    no_achievements: "Hozircha yutuqlar ochilmagan.",
    achievements_level_short: "{level}-dr",
    viewing_self:
      "Bu sizning ommaviy profilingiz - boshqalar ismingizni bosganda ko'radigan narsa.",
    viewing_self_link: "Tahrirlanadigan profilingizni oching →",
  },

  settings: {
    title: "Sozlamalar",
    appearance: "Ko'rinish",
    language_section: "Til",
    notifications_section: "Bildirishnomalar",
    lesson_section: "Darslar",
    privacy_section: "Maxfiylik",
    lesson_size: "Har darsdagi savollar",
    preferred_difficulty: "Afzal qiyinlik",
    preferred_difficulty_auto: "Avto (darajaga qarab)",
    reminder_hour: "Eslatma vaqti",
    reminder_hour_hint: "Sizga taxminan {time} da email yuboramiz.",
    timezone: "Vaqt mintaqasi",
    leaderboard_optin_title: "Reytingda ko'rining",
    leaderboard_optin_sub:
      "Ko'rsatiladigan ismingiz, darajangiz, XP va seriyangiz boshqa tizimga kirgan foydalanuvchilarga ko'rinadi.",
    leaderboard_on: "Reytingda ko'rinishni o'chirish",
    leaderboard_off: "Reytingda ko'rinishni yoqish",
    tfa_section: "Ikki bosqichli autentifikatsiya",
    tfa_section_sub:
      "Har bir admin kirishida autentifikator ilovasidan 6 xonali kod talab qiladi.",
    tfa_status_on: "2FA yoqilgan",
    tfa_status_on_sub: "Har safar kirganingizda kod so'raladi.",
    tfa_status_off: "2FA o'chirilgan",
    tfa_status_off_sub: "Admin hisoblar uchun tavsiya etiladi.",
    tfa_enable_btn: "Yoqish",
    tfa_disable_btn: "O'chirish",
    tfa_disable_code_label:
      "Tasdiqlash uchun joriy 6 xonali kod yoki tiklash kodini kiriting",
    tfa_disable_confirm: "2FA'ni o'chirish",
    tfa_disable_error_invalid: "Noto'g'ri kod. Qayta urinib ko'ring.",
    tfa_disable_error_generic: "Nimadir xato ketdi. Iltimos, qayta urinib ko'ring.",
    tfa_recovery_codes_title: "Tiklash kodlari",
    tfa_recovery_codes_sub:
      "Autentifikator ilovangizni yo'qotsangiz kirish uchun bir martalik kodlar.",
    tfa_recovery_codes_remaining: "{count} ta ishlatilmagan tiklash kodi qoldi",
    tfa_regenerate_btn: "Qayta yaratish",
    tfa_regenerate_title: "Tiklash kodlarini qayta yaratish",
    tfa_regenerate_hint:
      "Bu avvalgi kodlaringizni bekor qiladi. Tasdiqlash uchun joriy 6 xonali kod (yoki mavjud tiklash kodlaringizdan birini) kiriting.",
    tfa_regenerate_code_label: "Autentifikatsiya yoki tiklash kodi",
    tfa_regenerate_confirm: "Yangi kodlar yaratish",
    tfa_regenerate_show_title: "Yangi tiklash kodlaringiz",
    tfa_audit_show: "2FA faolligini ko'rsatish",
    tfa_audit_hide: "2FA faolligini yashirish",
    tfa_audit_empty: "Hozircha 2FA faolligi yo'q.",
    tfa_audit_event_enrolled: "2FA yoqildi",
    tfa_audit_event_disabled: "2FA o'chirildi",
    tfa_audit_event_recovery_codes_regenerated: "Tiklash kodlari qayta yaratildi",
    tfa_audit_event_recovery_code_consumed: "Tiklash kodi ishlatildi",
    tfa_audit_event_locked_out: "Hisob bloklandi (juda ko'p urinish)",

    // Premium / redeem section. Visible to all users; redeem widget is a
    // single input + button regardless of current tier. Already-premium
    // redemption extends instead of double-charging the slot, so we don't
    // hide the widget for premium users.
    premium_section: "Premium",
    premium_section_sub:
      "Cheksiz darslar, sinovlar, yuraklar va to'liq fanlarga kirish.",
    premium_status_free: "Siz bepul rejadasiz.",
    premium_status_premium: "Premium · {plan}",
    premium_ends_at: "{date} da yangilanadi / tugaydi",
    premium_lifetime: "Muddati yo'q",
    redeem_label: "Promokodingiz bormi?",
    redeem_placeholder: "Kodni kiriting",
    redeem_btn: "Faollashtirish",
    redeem_busy: "Faollashtirilmoqda…",
    redeem_success_new: "Premiumga xush kelibsiz! {date} gacha amal qiladi.",
    redeem_success_new_lifetime: "Premiumga xush kelibsiz! Muddati yo'q.",
    redeem_success_extended: "Premium uzaytirildi. {date} gacha amal qiladi.",
    redeem_success_extended_lifetime: "Premium umrbodga uzaytirildi.",
    redeem_error_invalid: "Noto'g'ri yoki muddati o'tgan kod.",
    redeem_error_already_used: "Siz bu kodni allaqachon ishlatgansiz.",
    redeem_error_generic: "Bu kodni faollashtirib bo'lmadi. Qayta urinib ko'ring.",
  },

  tfa_verify: {
    title: "Ikki bosqichli autentifikatsiya",
    hint_totp: "Autentifikator ilovangizdagi 6 xonali kodni kiriting.",
    hint_recovery: "Tiklash kodlaringizdan birini kiriting.",
    label_totp: "Autentifikatsiya kodi",
    label_recovery: "Tiklash kodi",
    submit: "Tasdiqlash",
    use_recovery: "O'rniga tiklash kodidan foydalanish",
    use_totp: "O'rniga autentifikator kodidan foydalanish",
    error_invalid: "Noto'g'ri yoki muddati o'tgan kod. Qayta urinib ko'ring.",
    error_generic: "Nimadir xato ketdi. Iltimos, qayta urinib ko'ring.",
  },

  tfa_setup: {
    title: "Ikki bosqichli autentifikatsiyani yoqish",
    scan_title: "1-qadam - Autentifikator ilovangiz bilan skanerlang",
    scan_hint:
      "Google Authenticator, Authy, 1Password yoki boshqa istalgan TOTP ilovasini oching va quyidagi QR kodni skanerlang. Skanerlay olmasangiz, maxfiy kodni ilovaga qo'lda kiriting.",
    qr_alt: "2FA sozlash QR kodi",
    secret_label: "Yoki bu maxfiy kodni qo'lda kiriting:",
    continue: "Davom etish",
    back: "Orqaga",
    verify_title: "2-qadam - Ilovangizdagi kodni kiriting",
    verify_hint:
      "Autentifikator ilovangiz endi har 30 soniyada o'zgaradigan 6 xonali kodni ko'rsatishi kerak. Joriy kodni kiriting.",
    code_label: "Autentifikatsiya kodi",
    enable: "2FA'ni yoqish",
    recovery_title: "Tiklash kodlaringizni saqlang",
    recovery_hint:
      "Autentifikator ilovangizga kirish imkonini yo'qotsangiz, har bir kod bir marta ishlatilishi mumkin. Ularni xavfsiz joyda saqlang - parol menejeri yaxshi ishlaydi.",
    recovery_warning: "Bu kodlar QAYTA ko'rsatilMAYDI.",
    copy_codes: "Hammasini nusxalash",
    saved_confirm: "Men tiklash kodlarimni saqladim",
    finish: "Tayyor",
    error_already_enabled:
      "2FA allaqachon yoqilgan. Qayta ro'yxatdan o'tmoqchi bo'lsangiz, avval uni o'chiring.",
    error_admin_only: "2FA faqat admin hisoblar uchun mavjud.",
    error_invalid_code:
      "Kod mos kelmadi. Telefoningiz soati to'g'riligiga ishonch hosil qiling va qayta urinib ko'ring.",
    error_generic: "Nimadir xato ketdi. Iltimos, qayta urinib ko'ring.",
    forced_title: "Adminlar uchun ikki bosqichli autentifikatsiya talab qilinadi",
    forced_text:
      "Admin panelga kirishdan oldin 2FA'ni yoqishingiz kerak. Quyidagi sozlashni bajaring - bu taxminan bir daqiqa vaqt oladi.",
  },

  admin: {
    panel: "Admin panel",
    overview: {
      title: "Overview",
      subtitle: "At-a-glance counts across users, premium, activity, and content.",
      users_title: "Users",
      users_link: "Manage users",
      users_total: "Total",
      users_admins: "Admins",
      users_reminders: "Reminder opt-in",
      users_new: "New (7d)",
      premium_title: "Premium",
      premium_link: "Subscriptions",
      premium_active_users: "Active members",
      premium_active_subs: "Active subscriptions",
      activity_title: "Activity",
      activity_lessons_7d: "Lessons (7d)",
      activity_mocks_7d: "Mocks (7d)",
      activity_users_24h: "Active users (24h)",
      content_title: "Content",
      content_link: "Browse content",
      content_papers: "Papers",
      content_los: "LOs",
      content_questions_active: "Active questions",
      content_questions_inactive: "Drafts / inactive",
    },
    content: {
      title: "Content",
      manage_structure: "Manage structure",
      empty_tree: "No papers yet. Add one from the Papers page.",
      no_los: "No LOs in this paper yet.",
      pick_lo: "Pick a learning objective from the tree to see its questions.",
      tab_active: "Active",
      tab_drafts: "Drafts",
      search_ph: "Search prompts (EN or RU)",
      no_active: "No active questions yet for this LO.",
      no_drafts: "No drafts. Use the legacy editor to generate some.",
      no_search_match: "No questions match your search.",
      draft_badge: "draft",
      legacy_editor: "Open full editor →",
      edit_in_los_page: "Edit theory",
      edit_modal_title: "Edit question",
      selected_count: "{count} selected",
      select_all_in_view: "Select all in view",
      batch_activate: "Activate selected",
      batch_delete: "Delete selected",
      batch_delete_confirm:
        "Delete {count} draft question(s)? This is irreversible.",
      // Drop DB + reseed
      reseed_btn: "Drop & reseed",
      reseed_modal_title: "Drop content & reseed",
      reseed_warn_1: "This is irreversible. It will:",
      reseed_warn_drop_content:
        "Delete all papers, learning objectives, and questions.",
      reseed_warn_drop_progress:
        "Delete all attempts, sessions, mastery, and earned badges. User streak, XP, and level reset to zero.",
      reseed_warn_keep_users:
        "Keep user accounts (and their logged-in sessions) intact.",
      reseed_confirm_prompt: "Type {word} to confirm:",
      reseed_run_btn: "Drop & reseed now",
      reseed_running: "Working…",
      reseed_done: "Reseed complete.",
      reseed_stat_papers: "Papers: dropped {dropped}, inserted {inserted}.",
      reseed_stat_questions: "Questions inserted: {count}.",
      reseed_stat_progress:
        "Wiped {sessions} sessions, {attempts} attempts. {users} user(s) reset.",
      reseed_stat_badges: "Wiped {count} earned-badge record(s).",
      // Structural ops (moved here from the legacy AdminPapersPage/LosPage/QuestionsPage)
      create_modal_title: "New question",
      create_question_btn: "Create question",
      add_question_btn: "New question",
      llm_generate_btn: "Generate via LLM",
      llm_modal_title: "Generate questions with LLM",
      llm_modal_desc:
        "New questions land as drafts. Review and activate them from the Drafts tab before they reach learners.",
      llm_count_label: "How many (1-20)",
      llm_hints_label: "Hints (optional)",
      llm_hints_ph:
        "Constraints, themes, difficulty mix - anything to bias the model",
      llm_running: "Generating…",
      edit_theory: "Edit theory",
      add_theory: "Add theory",
    },
    users: {
      title: "Users",
      filter_placeholder: "Filter by name or email",
      make_admin: "Make admin",
      remove_admin: "Remove admin",
      updating: "Updating…",
      you_badge: "you",
      admin_badge: "admin",
      loading: "Loading users…",
      empty: "No users yet.",
      empty_filtered: "No users match the filter.",
      cannot_self_demote: "You cannot remove your own admin rights",
    },
    user_detail: {
      title: "User detail",
      back_btn: "Back to users",
      stats_section: "Stats",
      meta_section: "Account",
      subs_section: "Subscriptions",
      subs_empty: "No subscriptions yet.",
      stat_freezes: "Freezes",
      meta_last_active: "Last active",
      meta_lesson_size: "Lesson size",
      meta_difficulty: "Preferred difficulty",
      meta_reminder: "Reminder",
      meta_tfa: "2FA",
    },
    whitelist: {
      title: "Email whitelist",
      sub: "Only emails listed here (or under listed domains) can sign in.",
      filter_placeholder: "Filter by pattern or note",
      // The literal-interpolation syntax {'...'} prevents vue-i18n's message
      // compiler from interpreting '@' as the start of a linked-message token
      // (e.g. @:common.cancel). Without the wrapping, "user@example.com" makes
      // the parser throw "SyntaxError: 10" at runtime.
      add_pattern_ph: "{'user@example.com'}  or  {'@example.com'}",
      add_note_ph: "Note (optional) - who/why added",
      add_btn: "Add",
      pattern_hint:
        "Exact email ({'user@example.com'}) or domain pattern ({'@example.com'}). Domains start with the at-sign and allow any user at that domain.",
      kind_email: "email",
      kind_domain: "domain",
      no_note: "-",
      add_note: "Add note",
      empty: "Whitelist is empty. Nobody can sign in until you add an entry.",
      empty_filtered: "No entries match the filter.",
      // No apostrophes inside delimited strings here - vue-i18n's tokenizer
      // doesn't choke on `'` directly, but mixing it with double-quoted
      // strings keeps the source readable. The braces in {pattern} are the
      // normal named-interpolation placeholder.
      delete_confirm:
        'Remove "{pattern}" from the whitelist? Users who signed in via this pattern keep their session, but cannot sign in again after logging out.',
    },
    papers: {
      title: "Papers",
      add_btn: "Add paper",
      add_modal_title: "New paper",
      edit_modal_title: "Edit paper",
      edit_btn: "Edit",
      delete_btn: "Delete",
      add_code_ph: "Code (e.g. F1)",
      add_name_en_ph: "Name (English)",
      add_name_ru_ph: "Name (Russian, optional)",
      add_name_uz_ph: "Name (Uzbek, optional)",
      // Free-tier access flag on each paper. Default true; admin can flip
      // to lock a paper behind premium. Backend gate enforces; the picker
      // just shows a lock icon for free users.
      free_accessible_label: "Free-tier accessible",
      free_accessible_help:
        "When off, only premium users can start lessons and mocks on this paper.",
      delete_confirm:
        'Delete paper "{code}" and ALL its LOs and questions? This cascades.',
      empty: "No papers yet. Add one above to get started.",
    },

    // Promocodes admin page - list / create / disable / redemption drill-in.
    promocodes: {
      title: "Promocodes",
      sub: "Redeemable codes that grant premium for a fixed window.",
      add_btn: "New code",
      add_modal_title: "Create promocode",
      table_code: "Code",
      table_grants: "Grants",
      table_used: "Used",
      table_window: "Window",
      table_status: "Status",
      table_actions: "Actions",
      status_active: "Active",
      status_disabled: "Disabled",
      status_window_pending: "Pending",
      status_window_expired: "Expired",
      status_exhausted: "Exhausted",
      disable_btn: "Disable",
      enable_btn: "Enable",
      redemptions_btn: "Redemptions",
      grants_format: "{plan} · {days} days",
      grants_format_lifetime: "{plan} · lifetime",
      grants_format_plan_default: "{plan}",
      used_format: "{count} / {max}",
      used_format_unlimited: "{count} / ∞",
      window_open: "Always",
      window_from: "From {date}",
      window_until: "Until {date}",
      window_between: "{from} → {until}",
      empty: "No promocodes yet.",
      // Create form
      form_code_label: "Code",
      form_code_ph: "WELCOME2026",
      form_plan_label: "Plan",
      form_days_label: "Days (leave empty to use plan period)",
      form_days_ph: "e.g. 30",
      form_max_redemptions_label: "Max redemptions (blank = unlimited)",
      form_per_user_limit_label: "Per-user limit",
      form_valid_from_label: "Valid from (optional)",
      form_valid_until_label: "Valid until (optional)",
      form_notes_label: "Notes (admin-only)",
      form_create_btn: "Create",
      // Redemptions drill-in
      redemptions_modal_title: "Redemptions for {code}",
      redemptions_empty: "No one has redeemed this code yet.",
      redemptions_col_user: "User",
      redemptions_col_when: "Redeemed",
      redemptions_col_sub: "Subscription",
    },

    // Subscriptions admin page - pick a user, see history, grant / extend /
    // cancel / revoke, plus the event audit log.
    subscriptions: {
      title: "Subscriptions",
      sub: "Manual grants, extensions, and audit log per user.",
      pick_user_ph: "Search by name or email",
      pick_user_empty: "No matching users.",
      pick_user_hint: "Start typing to find a user.",
      sub_history_heading: "Subscription history",
      sub_history_empty: "This user has no subscription history.",
      events_heading: "Audit log",
      events_empty: "No events recorded yet.",
      // Per-sub row labels
      sub_status_active: "Active",
      sub_status_expired: "Expired",
      sub_status_cancelled: "Cancelled",
      sub_status_pending: "Pending",
      sub_source_manual: "manual",
      sub_source_promocode: "promocode",
      sub_source_trial: "trial",
      sub_source_payme: "payme",
      sub_source_click: "click",
      sub_source_stripe: "stripe",
      sub_starts: "Started {date}",
      sub_ends: "Ends {date}",
      sub_ends_never: "No expiry",
      sub_cancelled_at: "Cancelled {date}",
      sub_extend_btn: "Extend",
      sub_cancel_btn: "Cancel",
      sub_revoke_btn: "Revoke",
      // Grant form
      grant_heading: "Grant a new subscription",
      grant_plan_label: "Plan",
      grant_days_label: "Days",
      grant_days_help:
        "Leave empty to use plan default. Set to 0 for open-ended (no expiry).",
      grant_reason_label: "Reason (audit log)",
      grant_btn: "Grant",
      grant_busy: "Granting…",
      grant_success: "Granted.",
      // Extend / cancel / revoke
      extend_modal_title: "Extend subscription",
      extend_days_label: "Add days",
      extend_reason_label: "Reason (optional)",
      extend_confirm: "Extend",
      cancel_modal_title: "Cancel subscription",
      cancel_warn:
        "User immediately loses premium access. The audit row is kept.",
      cancel_reason_label: "Reason (optional)",
      cancel_confirm: "Cancel subscription",
      revoke_modal_title: "Revoke subscription",
      revoke_warn:
        "Hard revoke - ends_at is forced to now. Use for refunds or abuse.",
      revoke_reason_label: "Reason (required for audit)",
      revoke_confirm: "Revoke",
      // Event kinds in the audit log
      event_granted: "Granted",
      event_extended: "Extended",
      event_revoked: "Revoked",
      event_cancelled: "Cancelled",
      event_expired: "Expired",
      event_renewed: "Renewed",
      event_webhook: "Webhook event",
      event_note: "Note",
    },

    // Admin email templates page. CRUD over the DB-backed template table
    // (subject + body per language, optional HTML, variable allow-list,
    // notes). Test-send action renders the template against an admin-
    // supplied JSON variable map and sends through the regular EmailService.
    email_templates: {
      title: "Email templates",
      sub: "Edit transactional and reminder email copy. Templates render with {'{{var}}'} substitution.",
      new_btn: "New template",
      new_title: "New template",
      edit_title: "Edit template",
      inactive_label: "Disabled",
      enable_btn: "Enable",
      disable_btn: "Disable",
      delete_confirm: "Delete email template '{key}'? This cannot be undone.",
      key_label: "Key",
      key_help: "Stable slug referenced from code (e.g. 'reminder_daily'). Cannot be renamed after creation - delete + re-create instead.",
      subject_en_label: "Subject (English)",
      subject_ru_label: "Subject (Russian, optional)",
      subject_uz_label: "Subject (Uzbek, optional)",
      body_en_label: "Body - text (English)",
      body_ru_label: "Body - text (Russian, optional)",
      body_uz_label: "Body - text (Uzbek, optional)",
      html_en_label: "Body - HTML (English, optional)",
      html_ru_label: "Body - HTML (Russian, optional)",
      html_uz_label: "Body - HTML (Uzbek, optional)",
      variables_label: "Variables - one per line",
      variables_placeholder: "display_name\nstreak\napp_url",
      variables_missing: "Body references variables not in the list: {vars}",
      variables_unused: "Listed but not referenced: {vars}",
      notes_label: "Admin notes (not sent)",
      test_title: "Send test",
      test_to_label: "To",
      test_lang_label: "Language",
      test_vars_label: "Variables (JSON)",
      test_vars_placeholder: "{'{\"display_name\":\"Alex\",\"streak\":7}'}",
      test_vars_help: "JSON object mapping variable names to values. Unsupplied {'{{vars}}'} stay unrendered.",
      test_invalid_json: "Variables must be a valid JSON object.",
      test_resolved_lang: "Rendered language: {lang}",
      send_test_btn: "Send test email",
      preview_title: "Live preview",
      preview_lang_label: "Preview language",
      preview_vars_label: "Sample variables (JSON)",
      preview_html_label: "HTML preview",
      preview_sample_mode_label: "Sample data",
      preview_sample_mode_placeholder: "Placeholders",
      preview_sample_mode_realistic: "Realistic",
      preview_reset_btn: "Reset sample data",
      preview_available_vars_label: "Available variables",
      preview_no_variables: "No variables declared yet - add some in the field above.",
      blast_title: "Send to audience",
      blast_subtitle: "Render this template per-recipient and send to a filtered audience.",
      blast_audience_label: "Audience",
      blast_audience_reminders: "Users with reminders on",
      blast_audience_premium: "Premium subscribers",
      blast_audience_free: "Free-tier users",
      blast_audience_all: "All users (use sparingly)",
      blast_audience_ids: "Specific user IDs",
      blast_ids_label: "User IDs",
      blast_ids_placeholder: "Paste one UUID per line, or comma-separated",
      blast_ids_help: "Each ID must match a row in the users table; unknown IDs are skipped server-side.",
      blast_ignore_optout: "Ignore opt-out (legally-required transactional emails only)",
      blast_ignore_optout_warn:
        "Default off. Only flip this for emails the user can't opt out of (account closure, billing receipts).",
      blast_confirm:
        "Send this template to the entire \"{audience}\" audience? This cannot be undone.",
      blast_no_ids: "Enter at least one user ID before sending.",
      blast_send_btn: "Send blast",
      blast_sending: "Sending… this may take a while",
      blast_result_targeted: "Targeted",
      blast_result_sent: "Sent",
      blast_result_skipped: "Skipped (opt-out)",
      blast_result_failed: "Failed",
      blast_result_sample: "Sample of recipients",
    },

    los: {
      title: "Learning objectives",
      add_btn: "Add LO",
      add_modal_title: "New learning objective",
      add_code_ph: "LO code (e.g. A1)",
      add_sort_ph: "Sort",
      add_title_en_ph: "Title (English)",
      add_title_ru_ph: "Title (Russian, optional)",
      add_title_uz_ph: "Title (Uzbek, optional)",
      add_description_en_ph: "Description (English, optional)",
      add_description_ru_ph: "Description (Russian, optional)",
      add_description_uz_ph: "Description (Uzbek, optional)",
      add_theory_en_ph:
        "Theory bite, 150–300 words (English, optional). Shown as a primer before lessons.",
      add_theory_ru_ph: "Theory bite (Russian, optional)",
      add_theory_uz_ph: "Theory bite (Uzbek, optional)",
      delete_confirm: 'Delete "{code} - {title}" and ALL its questions?',
      empty: "No LOs yet for this paper.",
      sort_label: "sort",
      back_to_papers: "← Back to papers",
      questions_link: "Questions",
      add_theory: "+ Add theory",
      edit_theory: "Edit theory",
      theory_tag: "Theory",
      theory_en_label: "Theory bite (English)",
      theory_ru_label: "Theory bite (Russian, optional)",
    },
    questions: {
      title: "Questions",
      back_to_los: "← Back to LOs",
      type: "Type",
      type_mcq: "MCQ",
      type_short: "Short answer",
      type_number: "Number entry",
      difficulty: "Difficulty",
      difficulty_easy: "Easy",
      difficulty_medium: "Medium",
      difficulty_hard: "Hard",
      prompt_en: "Prompt (English)",
      prompt_ru: "Prompt (Russian, optional)",
      prompt_uz: "Prompt (Uzbek, optional)",
      options: "Options",
      option_text_en_ph: "Option text (English)",
      option_text_ru_ph: "Option text (Russian, optional)",
      why_wrong_en_ph: "Why this option is wrong (English, 1 sentence)",
      why_wrong_ru_ph: "Why this option is wrong (Russian, 1 sentence)",
      why_wrong_uz_ph: "Why this option is wrong (Uzbek, 1 sentence)",
      why_wrong_field: "Wrong because",
      correct_label_mcq: "Correct option key (e.g. B)",
      correct_label_short_en: "Correct answer (English)",
      correct_label_short_ru: "Correct answer (Russian, optional)",
      correct_label_number: "Correct numeric value (e.g. 12500)",
      tolerance_label: "Acceptable tolerance (±, optional)",
      tolerance_ph: "e.g. 0.5",
      tolerance_help:
        "Leave blank for exact match. Set to N to accept answers within ±N of the correct value.",
      tolerance_field: "tolerance",
      explanation_en: "Explanation (English)",
      explanation_ru: "Explanation (Russian, optional)",
      explanation_uz: "Explanation (Uzbek, optional)",
      concept_bite_en: "Concept bite (English, optional)",
      concept_bite_ru: "Concept bite (Russian, optional)",
      concept_bite_uz: "Concept bite (Uzbek, optional)",
      add_btn: "Add question",
      empty: "No questions yet for this LO. Add one above.",
      correct_field: "Correct",
      bite_field: "Bite",
      explanation_field: "Explanation",
      retire: "Retire",
      restore: "Restore",
      retired_badge: "retired",
      delete_confirm: "Delete this question? This is irreversible.",
      lang_tab_en: "EN",
      lang_tab_ru: "RU",
      lang_tab_uz: "UZ",
      generate_btn: "Generate questions",
      generate_modal_title: "Generate questions with AI",
      generate_info:
        "New questions will be created as inactive drafts. Review and activate them before they appear in lessons.",
      generate_count_label: "How many to generate (3–10)",
      generate_hints_label: "Topic hints (optional)",
      generate_hints_ph:
        "e.g. focus on mix and yield variances; avoid pricing questions",
      generate_running: "Generating…",
      generate_submit: "Generate",
      generate_success:
        "Generated {count} draft question(s). Review them below and activate when ready.",
    },
    localization: {
      title: "UI translations",
      sub: "Override the default UI strings shown in the app. Empty rows fall back to the bundled defaults.",
      empty: "No overrides yet.",
      key: "Key",
      lang: "Language",
      value: "Value",
      default: "Default",
      add_btn: "Add override",
      saving: "Saving…",
      saved: "Saved",
      delete_confirm:
        "Delete this override? It will fall back to the bundled default.",
      add_key_ph: "e.g. dashboard.start_lesson_btn",
      add_value_ph: "Translated value",
    },
  },

  unsubscribe: {
    title: "Obuna bekor qilindi",
    body: "Endi eslatma xatlarini olmaysiz.",
    error: "Bu havola bilan obunani bekor qila olmadik. Uning muddati o'tgan bo'lishi mumkin.",
    back: "Bosh sahifaga",
  },
};
