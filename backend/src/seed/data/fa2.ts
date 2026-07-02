// Seed content for the FA2 (Maintaining Financial Records) paper.
// Structure mirrors the official ACCA FIA FA2 syllabus areas A-H
// (Sep 2024 - Aug 2025 study guide). FA2 is a Foundations in Accountancy exam,
// NOT ACCA Applied Knowledge, so it carries its OWN exam_structure: a two-hour
// CBE of 50 two-mark objective questions, 50% pass, 100% compulsory.
//
// NOTE ON QUESTIONS: this file seeds the paper and its learning-objective tree
// only - `questions: []` throughout. FA2's question bank is loaded from the mock
// workbook via the bank importer (each question is tagged to one of these LOs).
// A "drop & reseed content" therefore recreates the FA2 paper/LOs but NOT the
// imported questions; re-run the import to restore them.
//
// -------------------------------------------------------------------------
// UZBEK (_uz) - review-pending, same convention as f1.ts. Modern Latin script,
// ASCII apostrophe for o'/g'. Standard accounting terms; a native ACCA tutor
// should confirm house forms (e.g. "sverka" loan vs. "solishtirish";
// "shirkat" for partnership; "sinov balansi" for trial balance). The _uz LO
// fields are not persisted by the current seed runner (the learning_objectives
// table has no _uz columns) - they are kept for parity and a future rollout.
// -------------------------------------------------------------------------

import type { SeedPaper } from "./types";

export const FA2_PAPER: SeedPaper = {
  code: "FA2",
  name_en: "Maintaining Financial Records",
  name_ru: "Ведение финансовой отчётности",
  name_uz: "Moliyaviy yozuvlarni yuritish",
  // Two-hour CBE, 50 x 2-mark objective questions, 50% pass mark.
  exam_structure: {
    duration_seconds: 7200,
    pass_mark_pct: 50,
    sections: [{ code: "A", kind: "ot", question_count: 50, marks_each: 2 }],
  },
  learning_objectives: [
    {
      code: "A",
      title_en: "Accounting principles, concepts and characteristics",
      title_ru: "Принципы, концепции и характеристики учёта",
      title_uz: "Buxgalteriya hisobi tamoyillari, tushunchalari va xususiyatlari",
      description_en:
        "Key accounting principles and concepts, and the qualitative characteristics of useful financial information.",
      description_ru:
        "Ключевые принципы и концепции учёта и качественные характеристики полезной финансовой информации.",
      description_uz:
        "Asosiy hisob tamoyillari va tushunchalari hamda foydali moliyaviy axborotning sifat xususiyatlari.",
      sort_order: 10,
      questions: [],
    },
    {
      code: "B",
      title_en: "The principles and process of double-entry bookkeeping",
      title_ru: "Принципы и процесс двойной записи",
      title_uz: "Ikki yoqlama yozuv tamoyillari va jarayoni",
      description_en:
        "The accounting equation and the elements of financial statements, and how data flows through the double-entry system.",
      description_ru:
        "Учётное уравнение и элементы финансовой отчётности, а также движение данных в системе двойной записи.",
      description_uz:
        "Hisob tenglamasi va moliyaviy hisobot elementlari hamda ma'lumotlarning ikki yoqlama yozuv tizimidagi harakati.",
      sort_order: 20,
      questions: [],
    },
    {
      code: "C",
      title_en: "The preparation of journal entries and general ledger accounts",
      title_ru: "Подготовка журнальных проводок и счетов главной книги",
      title_uz: "Jurnal provodkalari va bosh daftar hisoblarini tayyorlash",
      description_en:
        "Preparing journal entries and posting them to general ledger accounts, including year-end balances.",
      description_ru:
        "Подготовка журнальных проводок и их разноска по счетам главной книги, включая остатки на конец года.",
      description_uz:
        "Jurnal provodkalarini tayyorlash va ularni bosh daftar hisoblariga o'tkazish, yil oxiri qoldiqlari bilan.",
      sort_order: 30,
      questions: [],
    },
    {
      code: "D",
      title_en: "Recording transactions and events",
      title_ru: "Отражение операций и событий",
      title_uz: "Operatsiyalar va hodisalarni qayd etish",
      description_en:
        "Recording sales and purchases, cash and bank, inventories, non-current assets and depreciation, accruals and prepayments, and receivables, payables and provisions.",
      description_ru:
        "Отражение продаж и закупок, денежных средств, запасов, внеоборотных активов и амортизации, начислений и предоплат, а также дебиторской и кредиторской задолженности и резервов.",
      description_uz:
        "Sotuv va xaridlar, pul mablag'lari, zaxiralar, aylanmadan tashqari aktivlar va amortizatsiya, hisoblangan hamda oldindan to'langan xarajatlar va debitorlik/kreditorlik qarzlari va zaxiralarni qayd etish.",
      sort_order: 40,
      questions: [],
    },
    {
      code: "E",
      title_en: "Reconciliations",
      title_ru: "Сверки",
      title_uz: "Solishtirishlar (sverkalar)",
      description_en:
        "Bank reconciliations and trade payables account reconciliations.",
      description_ru:
        "Банковские сверки и сверки счетов кредиторской задолженности.",
      description_uz:
        "Bank sverkalari va savdo kreditorlik hisobi sverkalari.",
      sort_order: 50,
      questions: [],
    },
    {
      code: "F",
      title_en: "Preparing a trial balance and correcting errors",
      title_ru: "Составление пробного баланса и исправление ошибок",
      title_uz: "Sinov balansini tuzish va xatolarni tuzatish",
      description_en:
        "Preparing the trial balance, identifying and correcting errors, and using suspense accounts.",
      description_ru:
        "Составление пробного баланса, выявление и исправление ошибок, использование счёта невыясненных сумм.",
      description_uz:
        "Sinov balansini tuzish, xatolarni aniqlash va tuzatish hamda vaqtinchalik (suspense) hisoblardan foydalanish.",
      sort_order: 60,
      questions: [],
    },
    {
      code: "G",
      title_en: "Preparing financial statements",
      title_ru: "Подготовка финансовой отчётности",
      title_uz: "Moliyaviy hisobotlarni tayyorlash",
      description_en:
        "Preparing the financial statements for a sole trader, including from incomplete records.",
      description_ru:
        "Подготовка финансовой отчётности индивидуального предпринимателя, в том числе по неполным данным.",
      description_uz:
        "Yakka tartibdagi tadbirkor uchun moliyaviy hisobotlarni tayyorlash, jumladan to'liq bo'lmagan yozuvlar asosida.",
      sort_order: 70,
      questions: [],
    },
    {
      code: "H",
      title_en: "Partnerships",
      title_ru: "Товарищества",
      title_uz: "Shirkatlar",
      description_en:
        "Partnership agreements, partners' capital and current accounts, and partnership financial statements including admitting a new partner.",
      description_ru:
        "Договоры товарищества, счета капитала и текущие счета участников, а также финансовая отчётность товарищества, включая приём нового участника.",
      description_uz:
        "Shirkat shartnomalari, ishtirokchilarning kapital va joriy hisoblari hamda shirkat moliyaviy hisobotlari, yangi ishtirokchini qabul qilish bilan.",
      sort_order: 80,
      questions: [],
    },
  ],
};
