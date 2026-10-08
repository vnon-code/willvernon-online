// Post-build step for `pnpm generate` (.scratch/v1-launch/tickets/06-csp-inline-scripts.md): hashes Nuxt's inline
// scripts in .output/public and writes them into the CSP in .output/public/_headers in place of __INLINE_HASHES__.
// Every page carries the same two (the importmap and window.__NUXT__.config), so one set of hashes covers the site.
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join, relative } from 'node:path'

const OUT = '.output/public'
const PLACEHOLDER = '__INLINE_HASHES__'
// Inline script types the browser runs, so CSP script-src applies. Anything else (application/json, ld+json) is a data block.
const EXECUTABLE = new Set(['', 'text/javascript', 'application/javascript', 'module', 'importmap', 'speculationrules'])

function fail(msg) {
  console.error(`csp-hashes: ${msg}`)
  process.exit(1)
}

function htmlFiles(dir) {
  return readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = join(dir, e.name)
    if (e.isDirectory()) return htmlFiles(p)
    return e.name.endsWith('.html') ? [p] : []
  })
}

function inlineScripts(html) {
  const found = []
  for (const [, attrs, body] of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)) {
    if (/\ssrc\s*=/i.test(attrs)) continue
    const type = (attrs.match(/\stype\s*=\s*["']?([^"'\s>]*)/i)?.[1] ?? '').toLowerCase()
    if (!EXECUTABLE.has(type)) continue
    found.push({ type, body, hash: `'sha256-${createHash('sha256').update(body, 'utf8').digest('base64')}'` })
  }
  return found
}

const files = htmlFiles(OUT)
if (!files.length) fail(`no HTML found in ${OUT}; run nuxt generate first`)

let expected
for (const file of files) {
  const scripts = inlineScripts(readFileSync(file, 'utf8'))
  const name = relative(OUT, file)
  if (scripts.length !== 2
    || !scripts.some(s => s.type === 'importmap')
    || !scripts.some(s => s.type === '' && s.body.startsWith('window.__NUXT__'))) {
    fail(`${name}: expected the importmap and window.__NUXT__.config inline scripts, found ${scripts.length}: `
      + scripts.map(s => `type="${s.type}" ${s.body.slice(0, 40)}`).join(' | '))
  }
  const hashes = scripts.map(s => s.hash).sort().join(' ')
  if (expected === undefined) expected = hashes
  else if (hashes !== expected) fail(`${name}: inline scripts differ from other pages (${hashes} vs ${expected})`)
}

const headersPath = join(OUT, '_headers')
// Rule lines only: the comment in _headers names the placeholder too
const lines = readFileSync(headersPath, 'utf8').split('\n')
const rules = lines.map(l => !l.trimStart().startsWith('#') && l.includes(PLACEHOLDER))
if (!rules.includes(true)) fail(`${PLACEHOLDER} not found in ${headersPath}`)
writeFileSync(headersPath, lines.map((l, i) => rules[i] ? l.replaceAll(PLACEHOLDER, expected) : l).join('\n'))
console.log(`csp-hashes: ${files.length} pages share ${expected}`)
