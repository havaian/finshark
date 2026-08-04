/* eslint-disable camelcase */

// Advance notice of an automatic renewal charge.
//
// Renewal used to happen 3 days BEFORE the period ended, which meant taking
// money for time the user had not reached yet - and if they cancelled in
// between, they had already paid for it. The charge now lands on the end date
// itself, and this email is what moved to 3 days out instead.
//
// It states the exact DATE and AMOUNT, which is the whole point: a recurring
// debit should never be the first time someone learns it was coming.
//
// Distinct from subscription_expiring, which goes to users WITHOUT auto-renew
// and says the opposite thing - your access is ending, come back and buy.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO email_templates (key, subject_en, subject_ru, body_en, body_ru, variables, notes)
    VALUES (
      'renewal_upcoming',
      'Your Finshark Premium renews on {{renews_on}}',
      'Ваш Finshark Премиум продлится {{renews_on}}',
      E'Hi {{display_name}},\\n\\nYour premium subscription renews automatically on {{renews_on}}. We will charge your saved card {{price}} on that date.\\n\\nIf you would rather not continue, turn off automatic renewal before then: {{app_url}}/subscription\\n\\n- Finshark',
      E'Привет, {{display_name}}!\\n\\nВаша премиум-подписка продлится автоматически {{renews_on}}. В этот день мы спишем с сохранённой карты {{price}}.\\n\\nЕсли продолжать не планируете, отключите автопродление до этой даты: {{app_url}}/subscription\\n\\n- Finshark',
      '["display_name","renews_on","price","app_url"]'::jsonb,
      'Sent 3 days before an auto-renewal charge. The charge itself happens on the subscription end date.'
    )
    ON CONFLICT (key) DO NOTHING
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DELETE FROM email_templates WHERE key = 'renewal_upcoming'`);
};
