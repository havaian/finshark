// Content for the Click payment integration, consumed by patch-locales.cjs.
// Kept separate from the patcher so the mechanism and the copy stay reviewable
// independently.
//
// UZ follows the house conventions: modern Latin script, ASCII straight
// apostrophe for the okina (o'g'), plain hyphens, double-quoted literals.
// UZ user-facing copy still needs a native ACCA-qualified review before it goes
// in front of students.

const EN_CLICK = `
  // Click payment panel on the subscription page. Both of Click's payment
  // surfaces are offered from one order, as their integration guide asks.
  click: {
    title: "Pay with Click",
    subtitle: "Choose a plan and pay by card or through your Click account. Premium activates as soon as the payment is confirmed.",
    load_error: "Couldn't load payment options. Please try again.",
    unavailable: "Online payments are temporarily unavailable. Please try again later.",
    no_plans: "No plans are available for purchase right now.",
    choose_plan: "Choose a plan",
    plan_monthly: "Monthly",
    plan_yearly: "Yearly",
    plan_lifetime: "Lifetime",
    plan_days: "{n} days",
    pay_with_click: "Pay with Click",
    pay_by_card: "Pay by card",
    opening: "Opening…",
    buttons_hint: "Pay with Click opens Click's payment page, where you can also pay without a Click account. Pay by card takes an Uzcard or Humo card here on this page.",
    processing: "Processing",
    processing_explainer: "Waiting for Click to confirm your payment. This usually takes a few seconds.",
    paid: "Paid",
    paid_explainer: "Payment confirmed. Your premium access is active.",
    payment_failed: "That payment didn't go through. No money has been taken. Please try again.",
    still_processing: "Your payment is still being confirmed. It may take another minute - refresh this page shortly.",
    checkout_js_error: "Couldn't open the card payment window. Please try Pay with Click instead.",
    already_lifetime: "You already have lifetime premium, so there's nothing to extend.",
    pay_error_generic: "Couldn't start the payment. Please try again.",
    history_title: "Your payments",
    status_created: "Not completed",
    status_prepared: "Processing",
    status_paid: "Paid",
    status_cancelled: "Cancelled",
    status_failed: "Needs attention",
  },

  // Landing page for Click's return_url after a redirect payment.
  click_return: {
    title: "Payment",
    waiting: "Confirming your payment…",
    waiting_hint: "Please keep this page open. This usually takes a few seconds.",
    paid: "Payment confirmed. Your premium access is active.",
    failed: "That payment didn't go through. No money has been taken.",
    timeout: "Your payment is still being confirmed.",
    timeout_hint: "This can take a little longer than usual. Check your subscription page in a minute - if it hasn't activated, contact support with the time of your payment.",
    notfound: "We couldn't find that payment.",
    back: "Back to subscription",
    try_again: "Try again",
  },
`;

const RU_CLICK = `
  click: {
    title: "Оплата через Click",
    subtitle: "Выберите тариф и оплатите картой или через аккаунт Click. Премиум активируется сразу после подтверждения платежа.",
    load_error: "Не удалось загрузить варианты оплаты. Попробуйте ещё раз.",
    unavailable: "Онлайн-оплата временно недоступна. Попробуйте позже.",
    no_plans: "Сейчас нет тарифов, доступных для покупки.",
    choose_plan: "Выберите тариф",
    plan_monthly: "Месяц",
    plan_yearly: "Год",
    plan_lifetime: "Навсегда",
    plan_days: "{n} дней",
    pay_with_click: "Оплатить через Click",
    pay_by_card: "Оплатить картой",
    opening: "Открываем…",
    buttons_hint: "Оплата через Click откроет платёжную страницу Click, где можно заплатить и без аккаунта. Оплата картой принимает Uzcard или Humo прямо на этой странице.",
    processing: "Обработка",
    processing_explainer: "Ждём подтверждение платежа от Click. Обычно это занимает несколько секунд.",
    paid: "Оплачено",
    paid_explainer: "Платёж подтверждён. Премиум-доступ активен.",
    payment_failed: "Платёж не прошёл. Деньги не списаны. Попробуйте ещё раз.",
    still_processing: "Платёж всё ещё подтверждается. Это может занять ещё минуту - обновите страницу чуть позже.",
    checkout_js_error: "Не удалось открыть окно оплаты картой. Попробуйте вариант «Оплатить через Click».",
    already_lifetime: "У вас уже есть бессрочный премиум, продлевать нечего.",
    pay_error_generic: "Не удалось начать оплату. Попробуйте ещё раз.",
    history_title: "Ваши платежи",
    status_created: "Не завершён",
    status_prepared: "Обработка",
    status_paid: "Оплачено",
    status_cancelled: "Отменён",
    status_failed: "Требует внимания",
  },

  click_return: {
    title: "Оплата",
    waiting: "Подтверждаем платёж…",
    waiting_hint: "Не закрывайте эту страницу. Обычно это занимает несколько секунд.",
    paid: "Платёж подтверждён. Премиум-доступ активен.",
    failed: "Платёж не прошёл. Деньги не списаны.",
    timeout: "Платёж всё ещё подтверждается.",
    timeout_hint: "Иногда это занимает чуть больше времени. Загляните на страницу подписки через минуту - если премиум не активировался, напишите в поддержку и укажите время платежа.",
    notfound: "Не удалось найти этот платёж.",
    back: "К подписке",
    try_again: "Попробовать ещё раз",
  },
`;

const UZ_CLICK = `
  click: {
    title: "Click orqali to'lov",
    subtitle: "Tarifni tanlang va karta yoki Click hisobingiz orqali to'lang. To'lov tasdiqlangach premium darhol faollashadi.",
    load_error: "To'lov variantlarini yuklab bo'lmadi. Qayta urinib ko'ring.",
    unavailable: "Onlayn to'lov vaqtincha ishlamayapti. Keyinroq urinib ko'ring.",
    no_plans: "Hozircha sotib olish uchun tarif yo'q.",
    choose_plan: "Tarifni tanlang",
    plan_monthly: "Oylik",
    plan_yearly: "Yillik",
    plan_lifetime: "Muddatsiz",
    plan_days: "{n} kun",
    pay_with_click: "Click orqali to'lash",
    pay_by_card: "Karta bilan to'lash",
    opening: "Ochilmoqda…",
    buttons_hint: "Click orqali to'lash Click to'lov sahifasini ochadi, u yerda Click hisobisiz ham to'lash mumkin. Karta bilan to'lash Uzcard yoki Humo kartasini shu sahifada qabul qiladi.",
    processing: "Ishlanmoqda",
    processing_explainer: "Click to'lovni tasdiqlashini kutmoqdamiz. Odatda bu bir necha soniya oladi.",
    paid: "To'landi",
    paid_explainer: "To'lov tasdiqlandi. Premium kirish faol.",
    payment_failed: "To'lov amalga oshmadi. Pul yechilmadi. Qayta urinib ko'ring.",
    still_processing: "To'lov hali tasdiqlanmoqda. Yana bir daqiqa ketishi mumkin - sahifani biroz keyin yangilang.",
    checkout_js_error: "Karta to'lovi oynasini ochib bo'lmadi. \\"Click orqali to'lash\\" variantini sinab ko'ring.",
    already_lifetime: "Sizda allaqachon muddatsiz premium bor, uzaytiradigan narsa yo'q.",
    pay_error_generic: "To'lovni boshlab bo'lmadi. Qayta urinib ko'ring.",
    history_title: "To'lovlaringiz",
    status_created: "Yakunlanmagan",
    status_prepared: "Ishlanmoqda",
    status_paid: "To'landi",
    status_cancelled: "Bekor qilindi",
    status_failed: "E'tibor talab qiladi",
  },

  click_return: {
    title: "To'lov",
    waiting: "To'lov tasdiqlanmoqda…",
    waiting_hint: "Iltimos, bu sahifani yopmang. Odatda bu bir necha soniya oladi.",
    paid: "To'lov tasdiqlandi. Premium kirish faol.",
    failed: "To'lov amalga oshmadi. Pul yechilmadi.",
    timeout: "To'lov hali tasdiqlanmoqda.",
    timeout_hint: "Bu odatdagidan biroz uzoqroq davom etishi mumkin. Bir daqiqadan so'ng obuna sahifasini tekshiring - agar faollashmagan bo'lsa, to'lov vaqtini ko'rsatib qo'llab-quvvatlash xizmatiga yozing.",
    notfound: "Bu to'lovni topa olmadik.",
    back: "Obunaga qaytish",
    try_again: "Qayta urinish",
  },
`;

// admin.* stays in English by house convention (internal-only surface), so the
// same block is written into all three locales.
const ADMIN_PAYMENTS = `{
      title: "Payments",
      subtitle: "Plan pricing, Click orders, fiscal receipts, and the retired card-transfer history.",
      load_error: "Couldn't load payments data.",
      save: "Save",
      close: "Close",

      // Integration health
      health_title: "Integration health",
      health_ok: "OK",
      health_off: "Off",
      health_payments: "Click payments",
      health_fiscal: "Fiscalization (OFD receipts)",

      // Plan pricing
      plans_title: "Plan pricing",
      plans_sub: "Adjust the price charged and the receipt line printed by the OFD. Period and tier are fixed.",
      plan_active: "Active",
      plan_inactive: "Inactive",
      activate: "Activate",
      deactivate: "Deactivate",
      price_label: "Price ({currency})",
      price_invalid: "Enter a price greater than zero.",
      plan_save_error: "Couldn't save the plan. Please try again.",
      fiscal_name_label: "Fiscal receipt line",
      fiscal_name_placeholder: "Finshark Premium 30 kun, 1 dona",
      fiscal_name_hint: "Printed on the legal receipt. Must end with the unit. Leaving it blank stops receipts being filed for this plan.",
      fiscal_name_missing: "{n} active plan(s) have no fiscal receipt line - payments for them will complete but no receipt will be filed.",

      // Click orders
      orders_title: "Click orders",
      orders_sub: "Every payment started through Click, with the ids Click support asks for.",
      orders_empty: "No orders in this view.",
      order_detail: "Details",
      order_filter_all: "All",
      order_filter_paid: "Paid",
      order_filter_prepared: "Processing",
      order_filter_created: "Not completed",
      order_filter_cancelled: "Cancelled",
      order_filter_failed: "Needs attention",
      order_status_created: "Not completed",
      order_status_prepared: "Processing",
      order_status_paid: "Paid",
      order_status_cancelled: "Cancelled",
      order_status_failed: "Needs attention",

      // Fiscalization
      fiscal_status_not_required: "No receipt",
      fiscal_status_pending: "Receipt pending",
      fiscal_status_submitted: "Receipt filed",
      fiscal_status_failed: "Receipt failed",
      fiscal_attempts: "{n} attempt(s)",
      fiscal_retry: "Re-file receipt",
      fiscal_retry_error: "Couldn't re-file the receipt. Check the fiscal config and the error below.",
      fiscal_receipt_link: "Open OFD receipt",

      // Order detail
      detail_status: "Status",
      detail_amount: "Amount",
      detail_user: "User",
      detail_subscription: "Subscription",
      detail_fiscal: "Fiscal receipt",
      callbacks_title: "Callback log",
      callbacks_hint: "Raw Prepare/Complete requests from Click and our responses. This is what to send Click support when a payment misbehaves.",
      callbacks_empty: "No callbacks recorded for this order yet.",
      callbacks_error: "Couldn't load the callback log.",

      // Legacy P2P card transfers (decommissioned)
      legacy_title: "Legacy card transfers",
      legacy_sub: "Read-only history of the retired transfer-and-slip flow. Users can no longer submit these.",
      legacy_show: "Show",
      legacy_hide: "Hide",
      legacy_empty: "No submissions in this view.",
      legacy_filter_all: "All",
      legacy_filter_pending: "Pending",
      legacy_filter_approved: "Approved",
      legacy_filter_rejected: "Rejected",
      legacy_pending_warning: "{n} submission(s) still pending from before the Click cutover. Settle them - users can't chase these any more.",
      legacy_approve: "Approve & grant",
      legacy_reject: "Reject",
      legacy_review_error: "Couldn't process this submission. Please refresh and retry.",
    }`;

const PAGE_TITLE = {
  en: "Payment",
  ru: "Оплата",
  uz: "To'lov",
};

function opsFor(lang, clickBlock) {
  return [
    { kind: "addTopLevel", name: "click", text: clickBlock },
    {
      kind: "addKey",
      path: ["page_titles"],
      key: "click_return",
      value: PAGE_TITLE[lang],
    },
    { kind: "replaceBlock", path: ["admin", "payments"], text: ADMIN_PAYMENTS },
  ];
}

const OPS = {
  en: opsFor("en", EN_CLICK),
  ru: opsFor("ru", RU_CLICK),
  uz: opsFor("uz", UZ_CLICK),
};

module.exports = { OPS };
