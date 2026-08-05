/* eslint-disable camelcase */

// Two emails that never existed.
//
// Every failure path in the Click integration was silent to the user. If a
// hosted-checkout payment was declined, or an order was opened and never
// completed, the only trace was a click_orders row. The user saw a page that
// did not advance and got nothing afterwards - no reason, no next step.
//
// Deliberately NOT covered here:
//   - auto-renewal declines. Those already have renewal_failed and
//     renewal_abandoned, which say something different: we charged a card you
//     saved, and here is how to stop us trying again.
//
// payment_failed is sent when Click reports error < 0 at Complete, i.e. the
// charge was attempted and refused. checkout_abandoned is sent when an order
// expires without ever reaching Complete - no money moved, so the copy must
// not imply a failed charge or the user will go looking for a refund.
//
// Numbered 000002 so it lands before the HTML migration (000003), which styles
// whatever templates exist at that point. Order matters: inserted later, these
// two would keep null html.

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    INSERT INTO email_templates (key, subject_en, subject_ru, subject_uz, body_en, body_ru, body_uz, variables, notes)
    VALUES
      (
        'payment_failed',
        'Your Finshark payment did not go through',
        'Ваш платёж Finshark не прошёл',
        NULL,
        E'Hi {{display_name}},\\n\\nYour payment for {{plan_name}} was declined and no money was taken.\\n\\nThis is usually the bank rather than the card itself - an online-payment block, a daily limit, or not enough balance at that moment.\\n\\nTry again: {{app_url}}/subscription\\n\\n- Finshark',
        E'Привет, {{display_name}}!\\n\\nПлатёж за {{plan_name}} отклонён, деньги не списаны.\\n\\nОбычно дело в банке, а не в самой карте: запрет на интернет-платежи, дневной лимит или недостаточно средств в этот момент.\\n\\nПопробовать снова: {{app_url}}/subscription\\n\\n- Finshark',
        NULL,
        '["display_name","plan_name","app_url"]'::jsonb,
        'Sent when Click reports error < 0 at Complete for a user-initiated payment. NOT used for auto-renewal declines - those use renewal_failed. Uzbek pending translation.'
      ),
      (
        'checkout_abandoned',
        'You left your Finshark Premium checkout unfinished',
        'Вы не завершили оформление Finshark Премиум',
        NULL,
        E'Hi {{display_name}},\\n\\nYou started checkout for {{plan_name}} but did not finish. Nothing was charged.\\n\\nYour place is still there whenever you want to pick it back up.\\n\\nFinish checkout: {{app_url}}/subscription\\n\\n- Finshark',
        E'Привет, {{display_name}}!\\n\\nВы начали оформление {{plan_name}}, но не завершили его. Списаний не было.\\n\\nВернуться к оплате можно в любой момент.\\n\\nЗавершить оформление: {{app_url}}/subscription\\n\\n- Finshark',
        NULL,
        '["display_name","plan_name","app_url"]'::jsonb,
        'Sent when a click_orders row expires without reaching Complete. No money moved - copy must not imply a failed charge. Uzbek pending translation.'
      )
    ON CONFLICT (key) DO NOTHING
  `);
};

exports.down = (pgm) => {
  pgm.sql(
    `DELETE FROM email_templates WHERE key IN ('payment_failed', 'checkout_abandoned')`
  );
};
