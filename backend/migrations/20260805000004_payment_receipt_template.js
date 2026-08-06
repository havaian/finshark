/* eslint-disable camelcase */

// Payment receipt.
//
// Until now a successful payment produced no record for the user. The three
// existing emails around a charge all say something else:
//
//   premium_granted    - "your subscription is active", sent for manual grants
//                        and promocode redemptions too. No amount, no date,
//                        no order number.
//   renewal_succeeded  - "we charged your saved card", explains auto-renew.
//   payment_failed     - the decline path.
//
// None of them is a receipt. A user who wants to check what they were charged,
// when, and against which order had nothing in their inbox - only Click's SMS,
// which they cannot search or forward to an employer for reimbursement.
//
// Sent from grantForOrder, which is the single point where a paid Click order
// becomes access, so it covers all three payment paths: hosted checkout,
// saved-card charge, and the auto-renewal sweep.
//
// order_number is merchant_trans_id rather than the internal UUID: it is what
// Click support asks for, and what appears on the fiscal receipt.

const { renderHtml } = require('./20260805000003_email_templates_html');

exports.shorthands = undefined;

const SUBJECT_EN = 'Your Finshark payment receipt';
const SUBJECT_RU = 'Чек об оплате Finshark';

const BODY_EN = `Hi {{display_name}},

Thanks for your payment. Here are the details for your records.

Plan: {{plan_name}}
Amount: {{amount}}
Date: {{paid_on}}
Order number: {{order_number}}

Your premium access runs until {{ends_on}}.

View your subscription: {{app_url}}/subscription

- Finshark`;

const BODY_RU = `Привет, {{display_name}}!

Спасибо за оплату. Ниже детали платежа - сохраните их на всякий случай.

Тариф: {{plan_name}}
Сумма: {{amount}}
Дата: {{paid_on}}
Номер заказа: {{order_number}}

Премиум-доступ действует до {{ends_on}}.

Открыть подписку: {{app_url}}/subscription

- Finshark`;

exports.up = (pgm) => {
  const htmlEn = renderHtml(SUBJECT_EN, BODY_EN).replace(/'/g, "''");
  const htmlRu = renderHtml(SUBJECT_RU, BODY_RU).replace(/'/g, "''");

  pgm.sql(`
    INSERT INTO email_templates (
      key, subject_en, subject_ru, subject_uz,
      body_en, body_ru, body_uz,
      html_en, html_ru, html_uz,
      variables, notes
    )
    VALUES (
      'payment_receipt',
      '${SUBJECT_EN}',
      '${SUBJECT_RU}',
      NULL,
      '${BODY_EN.replace(/'/g, "''")}',
      '${BODY_RU.replace(/'/g, "''")}',
      NULL,
      '${htmlEn}',
      '${htmlRu}',
      NULL,
      '["display_name","plan_name","amount","paid_on","order_number","ends_on","app_url"]'::jsonb,
      'Sent from ClickService.grantForOrder on every paid order - hosted checkout, saved-card charge and auto-renewal alike. order_number is merchant_trans_id, which is what Click support and the fiscal receipt both use. Uzbek pending translation.'
    )
    ON CONFLICT (key) DO NOTHING
  `);
};

exports.down = (pgm) => {
  pgm.sql(`DELETE FROM email_templates WHERE key = 'payment_receipt'`);
};
