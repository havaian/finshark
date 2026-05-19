// Static EN locale strings. These are the canonical source — DB overrides from
// /api/ui-translations/en take precedence at runtime (merged in main.ts).
// Keep keys stable; rename = breaking change for any DB overrides referencing them.

export default {
  common: {
    cancel: "Cancel",
    save: "Save",
    save_changes: "Save changes",
    saving: "Saving…",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    adding: "Adding…",
    loading: "Loading…",
    back: "Back",
    yes: "Yes",
    no: "No",
    confirm: "Confirm",
    sign_out: "Sign out",
    sign_in: "Sign in",
    submit: "Submit",
    next: "Next",
    finish: "Finish",
    optional: "optional",
    none: "—",
    close: "Close",
    error_generic: "Something went wrong",
  },

  lang: {
    name_en: "English",
    name_ru: "Russian",
    label: "Language",
  },

  theme: {
    label: "Theme",
    light: "Light",
    dark: "Dark",
    switch_to_light: "Switch to light theme",
    switch_to_dark: "Switch to dark theme",
  },

  nav: {
    dashboard: "Dashboard",
    progress: "Progress",
    profile: "Profile",
    settings: "Settings",
    leaderboards: "Leaderboards",
    mocks: "Mock exam",
    admin_panel: "Admin panel",
    back_to_dashboard: "← Back to dashboard",
    back_to_app: "← Back to app",
    stat_streak_tip:
      "Daily streak — number of consecutive days with at least one lesson.",
    stat_xp_tip:
      "Experience points — earned for correct answers and completed lessons.",
    open_menu: "Open menu",
    menu: "Menu",
    theme: "Theme",
  },

  home: {
    title: "Finshark",
    tagline: "Daily micro-lessons for the ACCA exams.",
    cta: "Get started",
  },

  landing: {
    eyebrow: "Finshark — your ACCA hunting partner",
    hero_title: "Hunt down your ACCA syllabus, 10 minutes at a time.",
    hero_sub:
      "Finshark is a finance shark — it smells your weak topics, circles back to them, and won't let go until the exam is yours. Bite-sized daily lessons, adaptive practice, instant explanations.",
    cta_primary: "Start learning",
    cta_secondary: "See how it works",
    hero_foot:
      "Built for ACCA students who study between meetings, on the train, at lunch.",

    // "Why Finshark" — the manifesto block. Keeps the shark metaphor controlled:
    // it's a sense-of-smell thing (finds weak spots), not a teeth-and-blood thing.
    why_title: "Why Finshark",
    why_lede:
      "Most ACCA prep treats you like you have unlimited time. You don't. Finshark is built around the 10 minutes you actually have.",
    why_1_title: "A shark, for finance",
    why_1_body:
      "Finance + shark. Sharks find weakness by smell — Finshark finds yours by data. The topics you keep missing surface again tomorrow, not in three months.",
    why_2_title: "Built around your day, not the syllabus",
    why_2_body:
      "Textbooks are written start-to-end. Your week isn't. Finshark serves you the next-best 10 minutes whenever you open the app — between meetings, on the train, before bed.",
    why_3_title: "Honest about what you know",
    why_3_body:
      "A heatmap of every syllabus learning objective, coloured by your real mastery. No green check-marks for things you barely scraped through.",

    features_title: "Built for the way you actually study",
    feature_1_title: "Fast micro-lessons",
    feature_1_body:
      "5 to 10 questions a day. Fits into the gap between meetings, the train ride, the coffee break.",
    feature_2_title: "Adaptive difficulty",
    feature_2_body:
      "Spaced repetition surfaces what you got wrong yesterday, so you actually remember it next month.",
    feature_3_title: "Streaks that motivate",
    feature_3_body:
      "Daily streak, XP, and badges. Skip a day and you start over — the way it works in real life.",
    feature_4_title: "See your weak spots",
    feature_4_body:
      "Syllabus coverage heatmap shows exactly which topics you have nailed and which need work before exam day.",

    steps_title: "How it works",
    step_1_title: "Pick a paper",
    step_1_body:
      "F1, F2, F3 — pick what you are studying. Add more papers as you go.",
    step_2_title: "Answer 5 to 10 questions",
    step_2_body:
      "Mix of multiple-choice, short answer, and numeric. Instant feedback and an explanation after every answer.",
    step_3_title: "Come back tomorrow",
    step_3_body:
      "Reminders, mock exams, and a syllabus heatmap that grows greener the closer you get to exam-ready.",

    // FAQ — short, defensive section. Answers the questions a sceptical visitor
    // would ask before signing up. Keep each answer to ~2 sentences.
    faq_title: "Questions, before you sign up",
    faq_1_q: "Is Finshark a replacement for Kaplan / BPP textbooks?",
    faq_1_a:
      "No. Textbooks teach you the syllabus from scratch. Finshark keeps you sharp on what you already learned, surfaces what you forgot, and shows you where the gaps are before exam day.",
    faq_2_q: "Which ACCA papers are covered?",
    faq_2_a:
      "We start with the Applied Knowledge papers (F1–F3). More papers ship as the question banks are reviewed by ACCA-qualified tutors.",
    faq_3_q: "How long do I need to spend per day?",
    faq_3_a:
      "Ten minutes is the design target. A daily lesson is 5–10 questions with instant explanations — long enough to learn something, short enough that you actually do it.",
    faq_4_q: "Do you have past exam questions?",
    faq_4_a:
      "Yes, where they're publicly available — drawn from the ACCA practice platform and OpenTuition. Each question links back to its learning objective so you know what it's testing.",
    faq_5_q: "Where do the explanations come from?",
    faq_5_a:
      "Approved study materials (Kaplan, BPP, ACCA study guides), rewritten into plain language. Every explanation cites the learning objective it covers.",

    bottom_cta_title: "The shark is hungry.",
    bottom_cta_sub: "Sign in and try one lesson. Takes about three minutes.",
  },

  login: {
    title: "Sign in",
    google_btn: "Continue with Google",
    error_callback: "Sign-in failed. Please try again.",
    error_email_not_allowed:
      "This email is not on the access list. Ask an administrator to add it before signing in.",
  },

  dashboard: {
    welcome_back: "Welcome back",
    keep_streak: "Keep the streak alive.",
    streak: "Streak",
    xp: "XP",
    level: "Level",
    start_lesson_heading: "Start a lesson",
    view_progress: "View progress →",
    no_papers: "No papers available yet.",
    no_papers_admin: "Add one in the admin panel.",
    loading_papers: "Loading papers…",
    any_paper: "Any paper",
    start_lesson_btn: "Start lesson",
    starting: "Starting…",
    daily_reminders_title: "Daily reminder emails",
    daily_reminders_sub: "A nudge at 18:00 if you haven't studied yet.",
    reminders_on: "Turn off reminders",
    reminders_off: "Turn on reminders",
  },

  leaderboards: {
    title: "Leaderboards",
    subtitle: "XP rankings across opt-in users. Opt in to appear here.",
    window_week: "This week",
    window_month: "This month",
    window_all: "All time",
    all_papers: "All papers",
    col_rank: "#",
    col_name: "Name",
    col_level: "Level",
    col_xp: "XP",
    col_streak: "Streak",
    you_badge: "you",
    empty: "No ranked users yet for this window.",
    optin_title: "Appear on leaderboards",
    optin_body:
      "Your display name, level, XP, and streak will be visible to other signed-in users. You can turn this off any time from Settings.",
    optin_enable: "Enable",
  },

  onboarding: {
    title: "Welcome to Finshark",
    subtitle:
      "A few quick questions so we can shape your study plan. You can change everything later in settings.",
    skip: "Skip for now",
    continue: "Continue",
    bg: {
      question: "What's your ACCA background?",
      beginner_title: "Just starting",
      beginner_desc:
        "I'm new to ACCA. Start me with easier questions and shorter lessons.",
      intermediate_title: "Some experience",
      intermediate_desc:
        "I've studied parts of the syllabus. Give me a balanced mix.",
      advanced_title: "Experienced",
      advanced_desc: "I want a challenge. Lean into medium and hard questions.",
    },
    time: {
      question: "How much time do you want to study per day?",
      help: "We'll size your lessons to fit. You can always do more.",
      minutes: "{n} min",
    },
    paper: {
      question: "Which paper are you targeting first?",
      empty:
        "No papers available yet. You can pick one later from the dashboard.",
    },
    reminders: {
      question: "Send me a daily email reminder",
      help: "Once per day at your preferred hour. You can disable this any time.",
    },
  },

  lesson: {
    quit: "← quit",
    quit_confirm:
      "Quit this lesson? Your answers so far are saved; you can resume the session anytime.",
    concept_tag: "concept",
    submit: "Submit",
    checking: "Checking…",
    finishing: "Finishing…",
    next: "Next →",
    finish: "Finish lesson",
    correct: "Correct",
    wrong: "Not quite.",
    correct_answer_label: "Correct answer:",
    mastery_label: "Mastery {pct}%",
    next_review_label: "Next review · {date}",
    keys_help: "select · continue",
    keys_help_text: "submit",
    short_answer_placeholder: "Type your answer…",
    short_answer_help: "Enter to submit, Shift+Enter for newline.",
    number_entry_placeholder: "Enter a number",
    number_entry_help: "Enter to submit.",
    number_entry_tolerance: "Accepts ±{tol}.",
    why_wrong_show: "Why are the other options wrong?",
    why_wrong_hide: "Hide explanations",
    theory_title: "Before we start",
    theory_subtitle: "A quick refresher on what this lesson covers.",
    theory_start: "Start lesson",
    complete_title: "Lesson complete",
    complete_correct: "Correct",
    complete_xp_earned: "XP earned",
    complete_streak: "Streak",
    complete_back: "Back to dashboard",
    loading: "Loading lesson…",
    out_of_hearts_title: "No hearts left",
    out_of_hearts_body:
      "You ran out of hearts. The remaining questions will count as unanswered. Try a fresh lesson when you're ready.",
    hearts_label: "Hearts",
    badges_earned_title: "New badges earned",
    mock_timer_label: "Time remaining",
  },

  mocks: {
    start_title: "Mock exam",
    start_subtitle:
      "CBE-style timed practice. No hearts — answer at your own pace until time runs out.",
    paper_label: "Paper",
    no_papers: "No papers available. An admin needs to add at least one.",
    count_label: "Question count",
    time_label: "Time limit",
    time_minutes: "{n} min",
    time_help:
      "When time runs out, the mock auto-submits and you see your section breakdown.",
    start_btn: "Start mock",
    starting: "Starting…",
    breakdown_title: "Mock results",
    passed_label: "Passed",
    failed_label: "Below pass mark",
    per_lo_title: "By topic",
    no_attempts: "No attempts recorded.",
    review_btn: "Review wrong answers",
    review_starting: "Starting review…",
    done_btn: "Done",
  },

  progress: {
    title: "Progress",
    syllabus_coverage: "Syllabus coverage",
    no_papers_yet: "No papers yet. An admin needs to add at least one.",
    no_los_for_paper: "No learning objectives yet for this paper.",
    weak_topics: "Weak topics",
    no_weak_topics: "No data yet — do a lesson and come back.",
    recent_sessions: "Recent sessions",
    no_sessions: "No sessions yet.",
    band_not_started: "Not started",
    band_weak: "Weak",
    band_learning: "Learning",
    band_strong: "Strong",
    badge_completed: "completed",
    badge_in_progress: "in progress",
    loading: "Loading progress…",
  },

  profile: {
    title: "Profile",
    email: "Email",
    display_name: "Display name",
    joined: "Joined",
    total_lessons: "Lessons completed",
    total_questions: "Questions answered",
    accuracy: "Accuracy",
    save_display_name: "Save name",
    chart_accuracy_by_paper: "Accuracy by paper",
    chart_activity_heatmap: "Activity (last year)",
    heatmap_day_mon: "Mon",
    heatmap_day_wed: "Wed",
    heatmap_day_fri: "Fri",
    heatmap_tooltip_count: "{count} activity",
    chart_mastery_over_time: "Average mastery over time",
    chart_difficulty_breakdown: "Questions by difficulty",
    chart_type_breakdown: "Questions by type",
    badges_section: "Badges",
    badges_earned_count: "{earned} of {total} earned",
    badges_loading: "Loading badges…",
    badges_empty: "No badges available yet.",
    badges_unearned_label: "Locked",
    achievements_section: "Achievements",
    achievements_unlocked_count: "{unlocked} of {total} unlocked",
    achievements_loading: "Loading achievements…",
    achievements_locked: "Not yet unlocked",
    achievements_level_label: "Level {level} of {max} · {name}",
    achievements_max_reached: "Max level reached",
    danger_zone: "Danger zone",
    delete_account: "Delete account",
    delete_account_warning:
      "This permanently removes your account, lesson history, and all progress. This cannot be undone.",
    delete_account_confirm: "Type your email to confirm deletion",
  },

  public_profile: {
    title: "Profile",
    not_found: "This user does not exist.",
    lessons: "Lessons",
    accuracy: "Accuracy",
    badges_section: "Badges earned",
    no_badges: "No badges earned yet.",
    achievements_section: "Achievements earned",
    no_achievements: "No achievements unlocked yet.",
    achievements_level_short: "lvl {level}",
    viewing_self:
      "This is your public profile — what others see when they click your name.",
    viewing_self_link: "Open your editable profile →",
  },

  settings: {
    title: "Settings",
    appearance: "Appearance",
    language_section: "Language",
    notifications_section: "Notifications",
    lesson_section: "Lessons",
    privacy_section: "Privacy",
    lesson_size: "Questions per lesson",
    preferred_difficulty: "Preferred difficulty",
    preferred_difficulty_auto: "Auto (based on level)",
    reminder_hour: "Reminder time (UTC hour)",
    leaderboard_optin_title: "Appear on leaderboards",
    leaderboard_optin_sub:
      "Your display name, level, XP, and streak will be visible to other signed-in users.",
    leaderboard_on: "Disable leaderboard listing",
    leaderboard_off: "Enable leaderboard listing",
    tfa_section: "Two-factor authentication",
    tfa_section_sub:
      "Requires a 6-digit code from an authenticator app on every admin sign-in.",
    tfa_status_on: "2FA is enabled",
    tfa_status_on_sub: "You will be prompted for a code each time you sign in.",
    tfa_status_off: "2FA is disabled",
    tfa_status_off_sub: "Recommended for admin accounts.",
    tfa_enable_btn: "Enable",
    tfa_disable_btn: "Disable",
    tfa_disable_code_label:
      "Enter a current 6-digit code or a recovery code to confirm",
    tfa_disable_confirm: "Disable 2FA",
    tfa_disable_error_invalid: "Invalid code. Try again.",
    tfa_disable_error_generic: "Something went wrong. Please try again.",
    tfa_recovery_codes_title: "Recovery codes",
    tfa_recovery_codes_sub:
      "Single-use codes to sign in if you lose your authenticator app.",
    tfa_recovery_codes_remaining: "{count} unused recovery code(s) remaining",
    tfa_regenerate_btn: "Regenerate",
    tfa_regenerate_title: "Regenerate recovery codes",
    tfa_regenerate_hint:
      "This invalidates your previous codes. Enter a current 6-digit code (or one of your existing recovery codes) to confirm.",
    tfa_regenerate_code_label: "Authentication or recovery code",
    tfa_regenerate_confirm: "Generate new codes",
    tfa_regenerate_show_title: "Your new recovery codes",
    tfa_audit_show: "Show 2FA activity",
    tfa_audit_hide: "Hide 2FA activity",
    tfa_audit_empty: "No 2FA activity yet.",
    tfa_audit_event_enrolled: "2FA enabled",
    tfa_audit_event_disabled: "2FA disabled",
    tfa_audit_event_recovery_codes_regenerated: "Recovery codes regenerated",
    tfa_audit_event_recovery_code_consumed: "Recovery code used",
    tfa_audit_event_locked_out: "Account locked out (too many failures)",
  },

  tfa_verify: {
    title: "Two-factor authentication",
    hint_totp: "Enter the 6-digit code from your authenticator app.",
    hint_recovery: "Enter one of your recovery codes.",
    label_totp: "Authentication code",
    label_recovery: "Recovery code",
    submit: "Verify",
    use_recovery: "Use a recovery code instead",
    use_totp: "Use authenticator code instead",
    error_invalid: "Invalid or expired code. Try again.",
    error_generic: "Something went wrong. Please try again.",
  },

  tfa_setup: {
    title: "Enable two-factor authentication",
    scan_title: "Step 1 — Scan with your authenticator app",
    scan_hint:
      "Open Google Authenticator, Authy, 1Password, or any other TOTP app and scan the QR code below. If you can't scan, type the secret into the app manually.",
    qr_alt: "2FA setup QR code",
    secret_label: "Or enter this secret manually:",
    continue: "Continue",
    back: "Back",
    verify_title: "Step 2 — Enter the code from your app",
    verify_hint:
      "Your authenticator app should now show a 6-digit code that changes every 30 seconds. Type the current code.",
    code_label: "Authentication code",
    enable: "Enable 2FA",
    recovery_title: "Save your recovery codes",
    recovery_hint:
      "Each code can be used once if you lose access to your authenticator app. Store them somewhere safe — a password manager works well.",
    recovery_warning: "These codes will NOT be shown again.",
    copy_codes: "Copy all to clipboard",
    saved_confirm: "I have saved my recovery codes",
    finish: "Done",
    error_already_enabled:
      "2FA is already enabled. Disable it first if you want to re-enroll.",
    error_admin_only: "2FA is available only for admin accounts.",
    error_invalid_code:
      "Code did not match. Make sure your phone's clock is correct and try again.",
    error_generic: "Something went wrong. Please try again.",
    forced_title: "Two-factor authentication is required for admins",
    forced_text:
      "You need to enable 2FA before you can access the admin panel. Complete the setup below — it takes about a minute.",
  },

  admin: {
    panel: "Admin panel",
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
        "Constraints, themes, difficulty mix — anything to bias the model",
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
    whitelist: {
      title: "Email whitelist",
      sub: "Only emails listed here (or under listed domains) can sign in.",
      filter_placeholder: "Filter by pattern or note",
      // The literal-interpolation syntax {'...'} prevents vue-i18n's message
      // compiler from interpreting '@' as the start of a linked-message token
      // (e.g. @:common.cancel). Without the wrapping, "user@example.com" makes
      // the parser throw "SyntaxError: 10" at runtime.
      add_pattern_ph: "{'user@example.com'}  or  {'@example.com'}",
      add_note_ph: "Note (optional) — who/why added",
      add_btn: "Add",
      pattern_hint:
        "Exact email ({'user@example.com'}) or domain pattern ({'@example.com'}). Domains start with the at-sign and allow any user at that domain.",
      kind_email: "email",
      kind_domain: "domain",
      no_note: "—",
      add_note: "Add note",
      empty: "Whitelist is empty. Nobody can sign in until you add an entry.",
      empty_filtered: "No entries match the filter.",
      // No apostrophes inside delimited strings here — vue-i18n's tokenizer
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
      delete_btn: "Delete",
      add_code_ph: "Code (e.g. F1)",
      add_name_en_ph: "Name (English)",
      add_name_ru_ph: "Name (Russian, optional)",
      delete_confirm:
        'Delete paper "{code}" and ALL its LOs and questions? This cascades.',
      empty: "No papers yet. Add one above to get started.",
    },
    los: {
      title: "Learning objectives",
      add_btn: "Add LO",
      add_modal_title: "New learning objective",
      add_code_ph: "LO code (e.g. A1)",
      add_sort_ph: "Sort",
      add_title_en_ph: "Title (English)",
      add_title_ru_ph: "Title (Russian, optional)",
      add_description_en_ph: "Description (English, optional)",
      add_description_ru_ph: "Description (Russian, optional)",
      add_theory_en_ph:
        "Theory bite, 150–300 words (English, optional). Shown as a primer before lessons.",
      add_theory_ru_ph: "Theory bite (Russian, optional)",
      delete_confirm: 'Delete "{code} — {title}" and ALL its questions?',
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
      options: "Options",
      option_text_en_ph: "Option text (English)",
      option_text_ru_ph: "Option text (Russian, optional)",
      why_wrong_en_ph: "Why this option is wrong (English, 1 sentence)",
      why_wrong_ru_ph: "Why this option is wrong (Russian, 1 sentence)",
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
      concept_bite_en: "Concept bite (English, optional)",
      concept_bite_ru: "Concept bite (Russian, optional)",
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
    title: "Unsubscribed",
    body: "You will no longer receive reminder emails.",
    error: "We couldn't unsubscribe with that link. It may have expired.",
    back: "Back to home",
  },
};
