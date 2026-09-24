// Extracts top-level data literals (const NAME = [ ... ] / { ... }) from inline <script>s
// and evaluates them in an isolated vm context. Prints JSON {data, errors, ranges} to stdout.
// Usage: node extract_js_data.mjs page.html
import fs from "node:fs";
import vm from "node:vm";

const src = fs.readFileSync(process.argv[2], "utf8");
const WANT = /^(?:[A-Z][A-Z0-9_]+|trackParams)$/;
const decl = /(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*=\s*([\[{])/g;

function matchLiteral(s, start) {
  // Returns index just past the bracket that closes s[start]; handles strings, templates, comments.
  const stack = [];
  let i = start;
  while (i < s.length) {
    const c = s[i], n = s[i + 1];
    if (c === "/" && n === "/") { i = s.indexOf("\n", i); if (i < 0) return -1; continue; }
    if (c === "/" && n === "*") { i = s.indexOf("*/", i) + 2; continue; }
    if (c === "'" || c === '"') {
      i++; while (i < s.length && s[i] !== c) { if (s[i] === "\\") i++; i++; } i++; continue;
    }
    if (c === "`") { stack.push("`"); i++; 
      while (i < s.length) {
        if (s[i] === "\\") { i += 2; continue; }
        if (s[i] === "`") { stack.pop(); i++; break; }
        if (s[i] === "$" && s[i + 1] === "{") { // skip interpolation, balanced braces
          let d = 1; i += 2;
          while (i < s.length && d) { if (s[i] === "{") d++; else if (s[i] === "}") d--; i++; }
          continue;
        }
        i++;
      }
      continue;
    }
    if (c === "[" || c === "{" || c === "(") stack.push(c);
    else if (c === "]" || c === "}" || c === ")") { stack.pop(); if (!stack.length) return i + 1; }
    i++;
  }
  return -1;
}

const out = {}, errors = {}, ranges = {};
let m;
while ((m = decl.exec(src))) {
  const name = m[1];
  if (!WANT.test(name) || name in out) continue;
  const start = m.index + m[0].length - 1;
  const end = matchLiteral(src, start);
  if (end < 0) { errors[name] = "unterminated"; continue; }
  const lit = src.slice(start, end);
  ranges[name] = [start, end];
  // Unknown identifiers inside ${...} resolve to a visible placeholder instead of throwing.
  const ctx = vm.createContext(new Proxy({}, {
    has: (_, k) => typeof k === "string" && !(k in globalThis),
    get: (_, k) => (k === Symbol.unscopables ? undefined : `{{${String(k)}}}`),
  }));
  try { out[name] = vm.runInContext(`(${lit})`, ctx, { timeout: 2000 }); }
  catch (e) { errors[name] = String(e).slice(0, 200); }
}
process.stdout.write(JSON.stringify({ data: out, errors, ranges }, null, 1));
