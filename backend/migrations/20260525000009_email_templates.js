// DB-backed email templates. Admins edit copy from the admin panel; the
// reminder cron and (future) transactional emails (promocode redeemed,
// subscription granted/extended/expiring) all render through the templates
// table instead of hard-coded strings in the codebase.
//
// Why a DB table rather than files on disk (mirroring ui-translations.file-store):
//   - emails are user-targeted (per-locale), so the lookup is part of the
//     business flow, not a static asset
//   - admins should be able to A/B copy without a redeploy
//   - we already version-control structural changes via migrations; the
//     copy itself can churn without code review
//
// Substitution: simple `{{var_name}}` replacement performed in the app
// layer. No conditionals or loops — if you need branching, create a
// different template key. This keeps the template engine surface tiny
// and unable to side-channel arbitrary expressions out of the DB.
//
// Each template carries an English body (canonical) and optionally a
// Russian body. We deliberately keep the Russian translation OPTIONAL —
// when missing, the renderer falls back to English. Same pattern as the
// rest of the content tables (paper.name_ru, lo.title_ru, etc.).
//
// HTML body is also optional — when present, the sender uses multipart/
// alternative; when absent, plain text only. Most operational reminders
// don't need HTML and the existing nodemailer-text path stays unchanged.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('email_templates', {
    // Stable slug. NEVER rename — references live in the codebase (e.g.
    // reminders.service.ts hard-references 'reminder_daily'). Renaming
    // breaks the lookup.
    key: { type: 'text', primaryKey: true },
    subject_en: { type: 'text', notNull: true },
    subject_ru: { type: 'text' },
    body_en: { type: 'text', notNull: true },     // plain text
    body_ru: { type: 'text' },
    html_en: { type: 'text' },                    // optional HTML
    html_ru: { type: 'text' },
    // Documented variable names this template accepts. Drives the admin
    // form completeness check ("you have {{foo}} in the body but didn't
    // list it"). Substitution itself is purely textual.
    variables: { type: 'jsonb', notNull: true, default: pgm.func(`'[]'::jsonb`) },
    is_active: { type: 'boolean', notNull: true, default: true },
    // Optional admin notes (who owns this, when last reviewed, etc.).
    notes: { type: 'text' },
    created_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
    updated_at: { type: 'timestamptz', notNull: true, default: pgm.func('NOW()') },
  });

  pgm.sql(`
    CREATE TRIGGER trg_email_templates_updated_at
      BEFORE UPDATE ON email_templates
      FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  `);

  // Seed the templates that currently exist as hard-coded strings in the
  // reminder cron (reminders.service.ts subjectFor/bodyFor). Two variants:
  //
  //   reminder_daily          — used when streak_count < 2
  //   reminder_daily_streak   — used when streak_count >= 2
  //
  // The two-variant split keeps the {{streak}} variable optional in
  // reminder_daily (the non-streak template doesn't need it) and lets
  // admins tune the streak copy independently. A future single-template
  // approach with conditionals would need a richer engine; for now two
  // keys is the simpler path.
  pgm.sql(`
    INSERT INTO email_templates (key, subject_en, subject_ru, body_en, body_ru, variables, notes)
    VALUES
      (
        'reminder_daily',
        'Time for today''s ACCA lesson',
        'Время для сегодняшнего урока ACCA',
        E'Hi {{display_name}},\\n\\nTen minutes of practice goes a long way.\\n\\nPick up where you left off: {{app_url}}/dashboard\\n\\n— Finshark\\n\\n--\\nDon''t want these emails? Unsubscribe: {{unsubscribe_url}}',
        E'Привет, {{display_name}}!\\n\\nДесять минут практики — и вы движетесь к цели.\\n\\nПродолжите с того места, где остановились: {{app_url}}/dashboard\\n\\n— Finshark\\n\\n--\\nНе хотите получать эти письма? Отписаться: {{unsubscribe_url}}',
        '["display_name","app_url","unsubscribe_url"]'::jsonb,
        'Daily reminder for users with streak_count < 2.'
      ),
      (
        'reminder_daily_streak',
        E'🔥 Keep your {{streak}}-day ACCA streak',
        E'🔥 Сохраните серию {{streak}} дней ACCA',
        E'Hi {{display_name}},\\n\\nYou''re on a {{streak}}-day streak. Don''t break it today.\\n\\nPick up where you left off: {{app_url}}/dashboard\\n\\n— Finshark\\n\\n--\\nDon''t want these emails? Unsubscribe: {{unsubscribe_url}}',
        E'Привет, {{display_name}}!\\n\\nВаша серия — {{streak}} дн. Не прерывайте её сегодня.\\n\\nПродолжите с того места, где остановились: {{app_url}}/dashboard\\n\\n— Finshark\\n\\n--\\nНе хотите получать эти письма? Отписаться: {{unsubscribe_url}}',
        '["display_name","streak","app_url","unsubscribe_url"]'::jsonb,
        'Daily reminder for users with streak_count >= 2. {{streak}} required.'
      ),
      (
        'premium_granted',
        'Welcome to Finshark Premium',
        'Добро пожаловать в Finshark Премиум',
        E'Hi {{display_name}},\\n\\nYour premium subscription is active. You''ll have unlimited lessons, mocks, hearts, and full paper access {{period_clause}}.\\n\\nStart studying: {{app_url}}/dashboard\\n\\n— Finshark',
        E'Привет, {{display_name}}!\\n\\nВаша премиум-подписка активна. Безлимитные уроки, пробники, сердца и полный доступ к предметам {{period_clause}}.\\n\\nНачните: {{app_url}}/dashboard\\n\\n— Finshark',
        '["display_name","period_clause","app_url"]'::jsonb,
        'Sent when an admin grants premium or a user redeems a code. {{period_clause}} is either "until 5 May 2026" or "for life".'
      ),
      (
        'subscription_expiring',
        'Your Finshark Premium expires in {{days_left}} days',
        'Ваш Finshark Премиум истекает через {{days_left}} дн.',
        E'Hi {{display_name}},\\n\\nYour premium subscription expires on {{ends_on}} ({{days_left}} days from now).\\n\\nKeep your access by renewing in settings: {{app_url}}/settings\\n\\n— Finshark',
        E'Привет, {{display_name}}!\\n\\nВаш премиум истекает {{ends_on}} (через {{days_left}} дн.).\\n\\nПродлите доступ в настройках: {{app_url}}/settings\\n\\n— Finshark',
        '["display_name","days_left","ends_on","app_url"]'::jsonb,
        'Sent 7 days before subscription expiry. NOT wired to a cron yet — future epic.'
      )
    ON CONFLICT (key) DO NOTHING
  `);
};

exports.down = (pgm) => {
  pgm.sql('DROP TRIGGER IF EXISTS trg_email_templates_updated_at ON email_templates');
  pgm.dropTable('email_templates');
};
