// AST-based locale patcher. Uses the TypeScript compiler API to locate exact
// node positions in the locale object literals, then splices text at those
// offsets. No regex is used to find or rewrite structure - the parser decides
// where every block starts and ends, so nested braces, escaped quotes and
// apostrophes inside translated strings cannot desync the edit.
//
// Three operations:
//   addKey(path, text)     - insert a key into an existing object, if absent
//   replaceBlock(path, text) - swap a whole nested object's contents
//   addTopLevel(name, text)  - append a new top-level block
//
// Run: node scripts/patch-locales.cjs

const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const FILES = ["en", "ru", "uz"].map((l) =>
  path.join(__dirname, "..", "src", "i18n", `${l}.ts`)
);

function parse(file) {
  const text = fs.readFileSync(file, "utf8");
  const sf = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
  return { text, sf };
}

// The default-exported object literal.
function rootObject(sf) {
  for (const stmt of sf.statements) {
    if (ts.isExportAssignment(stmt)) {
      let expr = stmt.expression;
      // Tolerate `export default { ... } as const`.
      while (ts.isAsExpression(expr) || ts.isParenthesizedExpression(expr)) {
        expr = expr.expression;
      }
      if (ts.isObjectLiteralExpression(expr)) return expr;
    }
  }
  throw new Error("no default-exported object literal found");
}

function propName(prop) {
  if (!prop.name) return null;
  if (ts.isIdentifier(prop.name)) return prop.name.text;
  if (ts.isStringLiteral(prop.name)) return prop.name.text;
  return null;
}

// Walk a dotted path and return the matching PropertyAssignment node, or null.
function findProp(obj, segments) {
  let current = obj;
  let node = null;
  for (const seg of segments) {
    if (!current || !ts.isObjectLiteralExpression(current)) return null;
    node =
      current.properties.find(
        (p) => ts.isPropertyAssignment(p) && propName(p) === seg
      ) ?? null;
    if (!node) return null;
    current = node.initializer;
  }
  return node;
}

// Indentation of the line a node starts on, so inserted text lines up.
function indentOf(text, pos) {
  const lineStart = text.lastIndexOf("\n", pos - 1) + 1;
  const line = text.slice(lineStart, pos);
  const m = line.length - line.trimStart().length;
  return line.slice(0, m);
}

function apply(file, ops) {
  let { text } = parse(file);

  // Re-parse before each op so offsets stay valid after a splice.
  for (const op of ops) {
    const { sf } = parse(file);
    const currentText = fs.readFileSync(file, "utf8");
    const root = rootObject(sf);

    if (op.kind === "addTopLevel") {
      const existing = findProp(root, [op.name]);
      if (existing) continue;
      // Insert just before the root object's closing brace.
      const close = root.getEnd() - 1;
      const next =
        currentText.slice(0, close) + op.text + currentText.slice(close);
      fs.writeFileSync(file, next);
      continue;
    }

    if (op.kind === "addKey") {
      const parent = findProp(root, op.path);
      if (!parent || !ts.isObjectLiteralExpression(parent.initializer)) {
        throw new Error(`${file}: parent not found for ${op.path.join(".")}`);
      }
      const already = parent.initializer.properties.find(
        (p) => ts.isPropertyAssignment(p) && propName(p) === op.key
      );
      if (already) continue;
      const close = parent.initializer.getEnd() - 1;
      const indent = indentOf(currentText, parent.getStart(sf)) + "  ";
      const insert = `${indent}${op.key}: ${JSON.stringify(op.value)},\n`;
      const next =
        currentText.slice(0, close) + insert + currentText.slice(close);
      fs.writeFileSync(file, next);
      continue;
    }

    if (op.kind === "replaceBlock") {
      const target = findProp(root, op.path);
      if (!target) throw new Error(`${file}: ${op.path.join(".")} not found`);
      if (!ts.isObjectLiteralExpression(target.initializer)) {
        throw new Error(`${file}: ${op.path.join(".")} is not an object`);
      }
      const start = target.initializer.getStart(sf);
      const end = target.initializer.getEnd();
      const next =
        currentText.slice(0, start) + op.text + currentText.slice(end);
      fs.writeFileSync(file, next);
      continue;
    }

    throw new Error(`unknown op ${op.kind}`);
  }

  // Final parse as a syntax check - a broken splice fails here, not at build.
  const { sf } = parse(file);
  rootObject(sf);
  return text;
}

module.exports = { apply, parse, rootObject, findProp, propName, FILES };

if (require.main === module) {
  const { OPS } = require("./locale-ops.cjs");
  for (const [lang, ops] of Object.entries(OPS)) {
    const file = path.join(__dirname, "..", "src", "i18n", `${lang}.ts`);
    apply(file, ops);
    console.log(`patched ${lang}`);
  }
}
