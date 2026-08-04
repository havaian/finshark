/* eslint-disable */
// Locale audit. Complements check-locale-parity.cjs, which only proves the
// three files have the SAME key set. That check passes happily when:
//
//   1. a key is used in a component but exists in no locale at all, and
//   2. a key exists in ru/uz holding the untranslated English string.
//
// Both have shipped. (1) put click.onetime_title in the dead `payments`
// section because an anchor regex matched the wrong `history_title`; (2) left
// most of admin.payments.* in English for Russian and Uzbek admins.
//
// AST rather than regex: the locale files nest objects and contain escaped
// quotes and apostrophes, which regex gets wrong.

const ts = require('typescript');
const fs = require('fs');
const path = require('path');

const I18N = path.join(__dirname, '..', 'src', 'i18n');
const SRC = path.join(__dirname, '..', 'src');

function flatten(file) {
  const src = ts.createSourceFile(
    file,
    fs.readFileSync(file, 'utf8'),
    ts.ScriptTarget.Latest,
    true
  );
  let root = null;
  (function find(n) {
    if (!root && ts.isObjectLiteralExpression(n)) root = n;
    else ts.forEachChild(n, find);
  })(src);
  const out = new Map();
  (function walk(obj, prefix) {
    for (const p of obj.properties) {
      if (!ts.isPropertyAssignment(p)) continue;
      const name = p.name.getText().replace(/^['"]|['"]$/g, '');
      const full = prefix ? `${prefix}.${name}` : name;
      if (ts.isObjectLiteralExpression(p.initializer)) walk(p.initializer, full);
      else if (ts.isStringLiteral(p.initializer)) out.set(full, p.initializer.text);
      else out.set(full, '');
    }
  })(root, '');
  return out;
}

function sourceFiles(dir, acc = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const f = path.join(dir, e.name);
    if (e.isDirectory()) sourceFiles(f, acc);
    else if (/\.(vue|ts)$/.test(e.name) && !f.includes(`${path.sep}i18n${path.sep}`)) {
      acc.push(f);
    }
  }
  return acc;
}

const en = flatten(path.join(I18N, 'en.ts'));
const ru = flatten(path.join(I18N, 'ru.ts'));
const uz = flatten(path.join(I18N, 'uz.ts'));

// Keys referenced as a plain literal: t('a.b') or $t("a.b").
// Dynamic keys - t('x.status_' + row.status) - are skipped: the literal part
// ends in _ or . and cannot be resolved statically.
const used = new Map();
for (const f of sourceFiles(SRC)) {
  const txt = fs.readFileSync(f, 'utf8');
  for (const m of txt.matchAll(/\$?\bt\(\s*['"`]([a-zA-Z0-9_.]+)['"`]\s*[,)]/g)) {
    const key = m[1];
    if (key.endsWith('_') || key.endsWith('.')) continue;
    if (!used.has(key)) used.set(key, new Set());
    used.get(key).add(path.relative(SRC, f));
  }
}

let failed = false;

const missing = [...used.keys()].filter((k) => !en.has(k)).sort();
if (missing.length) {
  failed = true;
  console.error(`\n${missing.length} key(s) used in code but absent from en.ts:`);
  for (const k of missing) {
    console.error(`  ${k}  <- ${[...used.get(k)].join(', ')}`);
  }
}

// A value is "untranslated" when ru or uz repeats the English verbatim AND the
// English looks like prose. Short strings, pure interpolation ({a} / {b}),
// product names and code-ish placeholders legitimately match across languages,
// so they are excluded rather than reported as noise nobody will action.
function isProse(v) {
  if (v.length <= 12) return false;
  const words = v.replace(/\{[^}]*\}/g, ' ').match(/[A-Za-z]{3,}/g);
  return !!words && words.length >= 2;
}

const ALLOW_IDENTICAL = new Set([
  'admin.email_templates.variables_placeholder',
  'admin.email_templates.test_vars_placeholder',
  'admin.whitelist.add_pattern_ph',
  'admin.payments.fiscal_name_placeholder',
]);

for (const [label, other] of [['ru', ru], ['uz', uz]]) {
  const same = [...en]
    .filter(([k, v]) => isProse(v) && other.get(k) === v && !ALLOW_IDENTICAL.has(k))
    .map(([k]) => k);
  if (same.length) {
    failed = true;
    console.error(`\n${same.length} value(s) in ${label}.ts are still the English text:`);
    for (const k of same) console.error(`  ${k}`);
  }
}

if (failed) {
  console.error('\nlocale audit FAILED');
  process.exit(1);
}
console.log(
  `locale audit OK - ${used.size} keys referenced, none missing, none untranslated`
);
