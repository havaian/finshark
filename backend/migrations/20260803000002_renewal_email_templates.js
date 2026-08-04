/* eslint-disable camelcase */

// Email templates for automatic renewal.
//
// Three moments a user needs to hear about, and no more:
//
//   renewal_succeeded  we charged the saved card and extended access
//   renewal_failed     a charge was declined, we will try again
//   renewal_abandoned  we stopped trying; access will lapse
//
// Deliberately NOT sent on every retry. A card that declines three times over
// three days would otherwise produce three near-identical emails, which trains
// people to ignore the one that matters.
//
// The uz columns exist (20260729000001_uz_localization) but are left NULL here:
// EmailTemplatesService falls back to English, and a machine-guessed Uzbek
// billing email is worse than an English one. Fill them from the admin editor.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO email_templates (key, subject_en, subject_ru, body_en, body_ru, variables, notes)
    VALUES
      (
        'renewal_succeeded',
        'Your Finshark Premium has been renewed',
        'Ваш Finshark Премиум продлён',
        E'Hi {{display_name}},\\n\\nWe renewed your premium subscription using your saved card. Your access now runs until {{ends_on}}.\\n\\nReceipt and subscription details: {{app_url}}/subscription\\n\\nTo turn off automatic renewal, open the same page.\\n\\n- Finshark',
        E'Привет, {{display_name}}!\\n\\nМы продлили вашу премиум-подписку с сохранённой карты. Доступ действует до {{ends_on}}.\\n\\nЧек и детали подписки: {{app_url}}/subscription\\n\\nОтключить автопродление можно на той же странице.\\n\\n- Finshark',
        '["display_name","ends_on","app_url"]'::jsonb,
        'Sent by ClickCardService after a successful auto-renewal charge.'
      ),
      (
        'renewal_failed',
        'We could not renew your Finshark Premium',
        'Не удалось продлить ваш Finshark Премиум',
        E'Hi {{display_name}},\\n\\nWe tried to renew your premium subscription but the payment did not go through.\\n\\nReason: {{reason}}\\n\\nWe will try again automatically before your access ends on {{ends_on}}. You do not need to do anything unless the card itself is the problem - in that case you can update it here: {{app_url}}/subscription\\n\\n- Finshark',
        E'Привет, {{display_name}}!\\n\\nМы попытались продлить вашу премиум-подписку, но платёж не прошёл.\\n\\nПричина: {{reason}}\\n\\nМы попробуем ещё раз автоматически до окончания доступа {{ends_on}}. Ничего делать не нужно, если проблема не в самой карте - её можно заменить здесь: {{app_url}}/subscription\\n\\n- Finshark',
        '["display_name","reason","ends_on","app_url"]'::jsonb,
        'Sent on the FIRST failed auto-renewal attempt only, not on every retry.'
      ),
      (
        'renewal_abandoned',
        'Your Finshark Premium will not renew',
        'Ваш Finshark Премиум не будет продлён',
        E'Hi {{display_name}},\\n\\nWe were not able to renew your premium subscription after several attempts, so it will end on {{ends_on}}.\\n\\nYou can renew manually at any time, with the same card or a different one: {{app_url}}/subscription\\n\\nYour progress, streak and history are kept either way.\\n\\n- Finshark',
        E'Привет, {{display_name}}!\\n\\nНам не удалось продлить премиум-подписку после нескольких попыток, поэтому она завершится {{ends_on}}.\\n\\nПродлить вручную можно в любой момент - той же картой или другой: {{app_url}}/subscription\\n\\nПрогресс, серия и история сохраняются в любом случае.\\n\\n- Finshark',
        '["display_name","ends_on","app_url"]'::jsonb,
        'Sent once when auto-renewal gives up after the attempt ceiling.'
      )
    ON CONFLICT (key) DO NOTHING
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DELETE FROM email_templates
    WHERE key IN ('renewal_succeeded', 'renewal_failed', 'renewal_abandoned')
  `);
};
