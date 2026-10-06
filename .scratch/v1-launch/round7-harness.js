// Round 7 harness: plates back home. Per variant: Learn More, wheel flick home, sample each plate every frame.
// vis = how much of a plate shows: opacity × clip × projected height (hinge) × the part not under the centre card (tuck).
async (page) => {
  const DIR = 'C:/Users/wvern/Documents/Personal Projects/.playwright-mcp/'
  const VARIANTS = ['P1', 'P3', 'P4', 'P5', 'P6']
  const out = {}
  await page.emulateMedia({ colorScheme: 'dark' })
  for (const v of VARIANTS) {
    await page.goto(`http://localhost:3000/?sb=D&hd=H3&pl=${v}`)
    await page.waitForTimeout(1500)
    await page.getByText('Enter without sound').click()
    await page.waitForTimeout(3000)
    await page.evaluate(() => { document.querySelector('#nuxt-devtools-container')?.remove(); document.querySelector('.po')?.remove() })
    await page.locator('.learn-more').click()
    await page.waitForTimeout(2000)
    await page.evaluate(() => {
      const rec = (window.__rec = [])
      const sel = ['.chips', '.row', '.row > :first-child', '.row > :nth-child(2)', '.row > :last-child']
      const vis = (el) => {
        const cs = getComputedStyle(el), r = el.getBoundingClientRect()
        const pc = (cs.clipPath.match(/[\d.]+%/g) || []).map(parseFloat)
        let f = +cs.opacity * (pc.length ? 1 - Math.max(...pc) / 50 : 1) * Math.min(1, r.height / (el.offsetHeight || 1))
        const z = +getComputedStyle(el.closest('.chips, .row')).zIndex
        if (z < 2000) {
          const c = document.querySelector('.card--centre').getBoundingClientRect()
          const ix = Math.max(0, Math.min(r.right, c.right) - Math.max(r.left, c.left))
          const iy = Math.max(0, Math.min(r.bottom, c.bottom) - Math.max(r.top, c.top))
          f *= 1 - (ix * iy) / Math.max(1, r.width * r.height)
        }
        return f
      }
      let last = performance.now()
      const tick = (now) => {
        const els = sel.map(s => document.querySelector(s))
        rec.push({ t: now, dt: now - last, y: scrollY,
          v: els.map(e => (e ? vis(e) : 0)),
          b: els.map(e => { const r = e?.getBoundingClientRect(); return r ? [r.x, r.y, r.width, r.height] : [0, 0, 0, 0] }),
          lm: document.querySelector('.learn-more') ? +getComputedStyle(document.querySelector('.learn-more')).opacity : 0 })
        last = now
        if (!window.__stop) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
    await page.mouse.move(720, 450)
    for (let i = 0; i < 12; i++) { await page.mouse.wheel(0, -100); await page.waitForTimeout(16) }
    await page.waitForFunction(() => scrollY === 0)
    await page.waitForTimeout(200)
    await page.screenshot({ path: `${DIR}r7-${v}-200.png` })
    await page.waitForTimeout(2200)
    const rec = await page.evaluate(() => { window.__stop = 1; return window.__rec })
    const home = rec.find(r => r.y === 0)
    const fin = rec[rec.length - 1]
    const same = (a, b) => a.every((x, i) => Math.abs(x - b[i]) < 0.5)
    // settled: the last frame at which any plate still differed from its final box or visibility
    let settledAt = home.t
    for (const r of rec) if (r.t > home.t && (r.b.some((bx, i) => !same(bx, fin.b[i])) || r.v.some((x, i) => Math.abs(x - fin.v[i]) > 0.01))) settledAt = r.t
    const firstMove = rec.find(r => r.t >= home.t && r.v.some(x => x > 0.02))
    const mid = rec.filter(r => r.y > 100 && r.y < 600)
    const lmIn = rec.find(r => r.t > home.t && r.lm > 0.99)
    out[v] = {
      visibleMidReturn: +Math.max(0, ...mid.map(r => Math.max(...r.v.slice(0, 2)))).toFixed(2),
      startMs: firstMove ? Math.round(firstMove.t - home.t) : null,
      platesInMs: Math.round(settledAt - home.t),
      lmInMs: lmIn ? Math.round(lmIn.t - home.t) : null,
      maxPlateStepPx: Math.round(Math.max(0, ...rec.slice(1).filter(r => r.t > home.t).map((r, i, a) => i ? Math.max(...r.b.map((bx, k) => Math.abs(bx[1] - a[i - 1].b[k][1]))) : 0))),
      slowFrames: rec.filter(r => r.dt > 25).length,
    }
  }
  return out
}
