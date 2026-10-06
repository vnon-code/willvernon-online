#!/usr/bin/env node
// FROZEN (overnight run; TOOLS.md). Scores one Sheet variant of one project on the machine criteria.
//   node score.cjs <slug> <variant> [--out <label-or-dir>]
// Prints JSON: raw measures, points per machine criterion (1–8, 11–13 at 0–2 by project-sheet-matrix.md's thresholds;
// 15m at 0–1), machineTotal /23. Writes 4 desktop stills (1440×900 dark) and 2 phone stills (375×812) to
// .scratch/v1-launch/overnight/<slug>/stills/<label>/<variant>-*.png (default label "latest"; an absolute --out is
// used as the folder itself), plus <variant>-score.json beside them. Needs the dev server on :3000.
// Portable (handoff 2026-10-07): PLAYWRIGHT_CORE / CHROME_PATH env vars, else a local install, else Will's Mac paths
const PW = process.env.PLAYWRIGHT_CORE || (() => { try { return require.resolve('playwright-core') } catch { return '/Users/williamvernon/code/site-intelligence-tool/app/node_modules/playwright-core' } })()
const { chromium } = require(PW)
const fs = require('fs'), path = require('path')

const BASE = 'http://localhost:3000'
const CHROME = process.env.CHROME_PATH || (process.platform === 'win32'
  ? 'C:/Program Files/Google/Chrome/Application/chrome.exe'
  : '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome')
const OVERNIGHT = path.resolve(__dirname, '..')
const HARNESS = fs.readFileSync(path.join(__dirname, 'harness.js'), 'utf8')

const args = process.argv.slice(2)
const oi = args.indexOf('--out')
const out = oi >= 0 ? args.splice(oi, 2)[1] : 'latest'
const [slug, variant] = args
if (!slug || !variant) {
  console.error('usage: node score.cjs <slug> <variant> [--out <label-or-dir>]')
  process.exit(2)
}
const dir = path.isAbsolute(out) ? out : path.join(OVERNIGHT, slug, 'stills', out)
fs.mkdirSync(dir, { recursive: true })
const wait = ms => new Promise(r => setTimeout(r, ms))

// The matrix's thresholds (project-sheet-matrix.md; 15m from BRIEF.md)
function points(d, r2, ph) {
  const p = {}
  const ok = d && !d.error
  // 1 one media box travels, video keeps playing: 2 no step > 60px and no restart; 0 restart or no media; else 1
  p[1] = !ok || d.mediaMaxStep == null || d.videoRestarted === true ? 0 : d.mediaMaxStep <= 60 ? 2 : 1
  // 2 body first visible ≥ 60% into the media's travel; 1 earlier but after it starts; 0 before or never
  p[2] = !ok || d.bodyStartPct == null ? 0 : d.bodyStartPct >= 60 ? 2 : d.bodyStartPct > 0 ? 1 : 0
  // 3 the Landing gone by the media landing; 1 gone by the end; 0 some left
  p[3] = !ok || d.landingLeftovers > 0 ? 0 : (d.landingGoneMs != null && d.mediaLandMs != null && d.landingGoneMs <= d.mediaLandMs) ? 2 : 1
  // 4 ≥ 64px margins, no blur, overlay ≤ 0.25; 0 blurred or no margin; else 1
  p[4] = !ok || d.backdropFilter.length || d.marginPx <= 0 ? 0 : d.marginPx >= 64 && d.overlayAlpha <= 0.25 ? 2 : 1
  // 5 media ≥ 55% of the first view and ≥ 4 media; 1 one of the two
  p[5] = !ok ? 0 : (d.mediaShare >= 0.55 ? 1 : 0) + (d.mediaCount >= 4 ? 1 : 0)
  // 6 close lands within 4px of the card with the Landing back; 1 within 16px
  p[6] = !ok || !d.landingBack || d.closeOffPx == null ? 0 : d.closeOffPx <= 4 ? 2 : d.closeOffPx <= 16 ? 1 : 0
  // 7 open ≤ 700ms, close ≤ 450ms: one point each
  p[7] = !ok ? 0 : (d.openMs <= 700 ? 1 : 0) + (d.closeMs <= 450 ? 1 : 0)
  // 8 frames > 25ms over open + close: ≤ 2 → 2, ≤ 6 → 1
  p[8] = !ok ? 0 : d.slowFrames <= 2 ? 2 : d.slowFrames <= 6 ? 1 : 0
  // 11 the Sections' docked header: 2 docked and solid; 1 inline but not solid
  p[11] = !r2 ? 0 : r2.headerDocked ? 2 : r2.headerInline ? 1 : 0
  // 12 the Sheet's edges are the panel's: 2 border, radius and width; 1 border only
  const e = r2?.edgesMatch
  p[12] = !e ? 0 : e.border && e.radius && e.width ? 2 : e.border ? 1 : 0
  // 13 gaps between blocks: ≤ 1px → 2, ≤ 16px → 1
  p[13] = !r2 || r2.maxGapPx == null ? 0 : r2.maxGapPx <= 1 ? 2 : r2.maxGapPx <= 16 ? 1 : 0
  // 15m phones (375×812): no horizontal scroll and the Sheet opens and closes (readability is judged, not here)
  p['15m'] = ph && ph.opened && ph.closed && ph.hOverflowPx <= 1 ? 1 : 0
  return p
}

async function enter(page) {
  await page.waitForTimeout(3500)
  await page.getByText('Enter without sound').click()
  await page.waitForTimeout(3000)
  // The stills show the page as a visitor sees it: no options panel, no Nuxt devtools pill
  await page.addStyleTag({ content: '.proto, #nuxt-devtools-container, nuxt-devtools-frame { display: none !important }' })
}

;(async () => {
  const browser = await chromium.launch({ executablePath: CHROME, headless: true, args: ['--autoplay-policy=no-user-gesture-required'] })
  const errors = []
  const listen = (pg) => {
    pg.on('pageerror', e => errors.push(e.message))
    pg.on('console', m => m.type() === 'error' && errors.push(m.text()))
  }
  const stills = []
  const shot = async (pg, name) => {
    const f = path.join(dir, `${variant}-${name}.png`)
    await pg.screenshot({ path: f })
    stills.push(path.relative(OVERNIGHT, f))
  }
  const res = { slug, variant, desktop: null, r2: null, phone: null }

  // Desktop, 1440×900 dark
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, colorScheme: 'dark' })
  listen(page)
  await page.goto(`${BASE}/?sheet=${encodeURIComponent(variant)}`, { waitUntil: 'networkidle' })
  await enter(page)
  await page.evaluate(HARNESS)
  // A warm-up open and close, so the variant's first load (its chunk, its media) isn't scored
  const centred = await page.evaluate(s => window.__centreOn(s), slug)
  if (centred) {
    await page.evaluate(() => document.querySelector('.card--centre').click())
    await page.waitForTimeout(1500)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(1200)
  }
  res.desktop = await page.evaluate(([v, s]) => window.__sheetRun(v, s), [variant, slug])
  if (!res.desktop.error) {
    await page.evaluate(() => document.querySelector('.card--centre').click())
    await page.waitForTimeout(1300)
    res.r2 = await page.evaluate(() => window.__round2())
    const H = await page.evaluate(() => document.querySelector('[data-sheet-layer]')?.scrollHeight ?? 0)
    res.desktop.scrollH = H
    for (const [i, f] of [0, 0.25, 0.5, 0.75].entries()) {
      await page.evaluate(y => document.querySelector('[data-sheet-layer]')?.scrollTo(0, y), Math.round(H * f))
      await page.waitForTimeout(900)
      await shot(page, `d${i}`)
    }
    await page.keyboard.press('Escape')
    await page.waitForTimeout(900)
  }
  await page.close()

  // Phone, 375×812: deep link /work/<slug>, open after the Gate, check overflow, close with the ✕
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, colorScheme: 'dark', isMobile: true, hasTouch: true })
  const ph = await ctx.newPage()
  listen(ph)
  await ph.goto(`${BASE}/work/${encodeURIComponent(slug)}?sheet=${encodeURIComponent(variant)}`, { waitUntil: 'networkidle' })
  await enter(ph)
  const opened = await ph.waitForFunction(() => document.documentElement.dataset.sheet === 'open' && document.querySelector('[data-sheet-layer]'), null, { timeout: 6000 }).then(() => true, () => false)
  res.phone = { opened, resolved: await ph.evaluate(() => window.__sheet?.opened ?? null) }
  if (opened) {
    await ph.waitForTimeout(500)
    Object.assign(res.phone, await ph.evaluate(() => {
      const l = document.querySelector('[data-sheet-layer]')
      const de = document.documentElement
      // Smallest text in the Sheet (raw, for the reviewer's readability call)
      let minFontPx = Infinity
      const walk = document.createTreeWalker(l, NodeFilter.SHOW_TEXT)
      for (let n; (n = walk.nextNode());) {
        if (!n.textContent.trim() || !n.parentElement) continue
        const cs = getComputedStyle(n.parentElement)
        if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity === 0) continue
        minFontPx = Math.min(minFontPx, parseFloat(cs.fontSize))
      }
      return {
        hOverflowPx: Math.max(de.scrollWidth - innerWidth, l.scrollWidth - l.clientWidth, 0),
        minFontPx: minFontPx === Infinity ? null : minFontPx,
        scrollH: l.scrollHeight,
      }
    }))
    await shot(ph, 'p0')
    await ph.evaluate(() => { const l = document.querySelector('[data-sheet-layer]'); l.scrollTo(0, Math.round(l.scrollHeight * 0.4)) })
    await ph.waitForTimeout(900)
    await shot(ph, 'p1')
    await ph.evaluate(() => document.querySelector('[data-sheet-layer]').scrollTo(0, 0))
    await ph.waitForTimeout(300)
    const x = await ph.$('[data-sheet-close]')
    if (x) await x.click()
    else await ph.keyboard.press('Escape')
    res.phone.closed = await ph.waitForFunction(() => !document.querySelector('[data-sheet-layer]'), null, { timeout: 3000 }).then(() => true, () => false)
  }
  await ctx.close()
  await browser.close()

  const p = points(res.desktop, res.r2, res.phone)
  const machineTotal = Object.values(p).reduce((a, b) => a + b, 0)
  const opened2 = res.desktop?.opened
  const result = {
    slug, variant,
    resolved: opened2 ? opened2.variant : null, // the variant that actually opened (a mismatch means it isn't registered for this slug)
    points: p, machineTotal, of: 23,
    raw: res,
    stills,
    errors: { count: errors.length, first: [...new Set(errors)].slice(0, 5) },
  }
  fs.writeFileSync(path.join(dir, `${variant}-score.json`), JSON.stringify(result, null, 2))
  console.log(JSON.stringify(result, null, 2))
})().catch((e) => {
  console.error(e)
  process.exit(1)
})
