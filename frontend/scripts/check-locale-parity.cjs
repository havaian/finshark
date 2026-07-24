// Locale key parity check across EN / RU / UZ.
//
// AST-based: the TypeScript compiler API walks the exported object literal and
// collects dotted key paths. Regex would trip over braces and apostrophes
// inside translated strings (Uzbek uses the ASCII apostrophe heavily), so the
// parser does the structural work.
//
// Exit code 1 on any mismatch, so this can gate a build.
//
// Run: node scripts/check-locale-parity.cjs

const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const LANGS = ["en", "ru", "uz"];

function collect(file) {
  const text = fs.readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);

  let root = null;
  for (const stmt of sf.statements) {
    if (ts.isExportAssignment(stmt)) {
      let expr = stmt.expression;
      while (ts.isAsExpression(expr) || ts.isParenthesizedExpression(expr)) {
        expr = expr.expression;
      }
      if (ts.isObjectLiteralExpression(expr)) root = expr;
    }
  }
  if (!root) throw new Error(`${file}: no default-exported object literal`);

  const keys = new Set();
  const walk = (obj, prefix) => {
    for (const prop of obj.properties) {
      if (!ts.isPropertyAssignment(prop)) continue;
      let name = null;
      if (ts.isIdentifier(prop.name)) name = prop.name.text;
      else if (ts.isStringLiteral(prop.name)) name = prop.name.text;
      if (name === null) continue;
      const dotted = prefix ? `${prefix}.${name}` : name;
      if (ts.isObjectLiteralExpression(prop.initializer)) {
        walk(prop.initializer, dotted);
      } else {
        keys.add(dotted);
      }
    }
  };
  walk(root, "");
  return keys;
}

const sets = {};
for (const lang of LANGS) {
  sets[lang] = collect(path.join(__dirname, "..", "src", "i18n", `${lang}.ts`));
}

let failed = false;
const base = sets.en;

for (const lang of LANGS) {
  if (lang === "en") continue;
  const missing = [...base].filter((k) => !sets[lang].has(k));
  const extra = [...sets[lang]].filter((k) => !base.has(k));
  if (missing.length) {
    failed = true;
    console.error(`${lang}: missing ${missing.length} key(s)`);
    for (const k of missing.slice(0, 40)) console.error(`  - ${k}`);
    if (missing.length > 40) console.error(`  ... +${missing.length - 40} more`);
  }
  if (extra.length) {
    failed = true;
    console.error(`${lang}: ${extra.length} key(s) not present in en`);
    for (const k of extra.slice(0, 40)) console.error(`  + ${k}`);
    if (extra.length > 40) console.error(`  ... +${extra.length - 40} more`);
  }
}

if (failed) process.exit(1);
console.log(`locale parity OK - ${base.size} keys across ${LANGS.join(", ")}`);
