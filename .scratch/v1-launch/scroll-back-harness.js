// Scroll-back harness: Gate → Learn More → real wheel up → sample every frame until Learn More is back.
async (page) => {
  const variant = 'A'
  await page.emulateMedia({ colorScheme: 'dark' }); await page.goto('http://localhost:3000/' + (variant ? '?sb=' + variant : ''))
  await page.waitForTimeout(1500)
  await page.getByText('Enter without sound').click()
  await page.waitForTimeout(3000)
  await page.evaluate(() => document.querySelector('#nuxt-devtools-container')?.remove()); await page.locator('.learn-more').click()
  await page.waitForTimeout(1800)
  await page.evaluate(() => {
    const rec = (window.__rec = [])
    let last = performance.now()
    const panel = document.querySelector('.sections__panel')
    const stage = document.querySelector('.landing__stage')
    const hdr = document.querySelector('.header')
    const lm = () => document.querySelector('.learn-more')
    const tick = (now) => {
      const pt = panel.getBoundingClientRect().top
      // lowest visible stage pixel: stage box bottom minus its clip
      const sb = stage.getBoundingClientRect().bottom - parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--cut') || 0)
      const l = lm()
      const clipOn = getComputedStyle(stage).clipPath !== 'none'
      const pr = panel.getBoundingClientRect()
      let cut = 0, vis = 0
      for (const c of document.querySelectorAll('.card:not(.card--centre)')) {
        const r = c.getBoundingClientRect()
        if (getComputedStyle(c).visibility === 'hidden' || r.right < 0 || r.left > innerWidth) continue
        const inMargin = r.left < pr.left || r.right > pr.right
        if (clipOn && inMargin && r.top < pt && r.bottom > pt) cut = 1
        const vb = clipOn ? Math.min(r.bottom, pt) : r.bottom; if (inMargin && pt < 70 && vb - Math.max(r.top, 64) > 4) vis = 1
      }
      rec.push({
        t: now, dt: now - last, y: scrollY, pt,
        bleed: Math.max(0, sb - pt),
        cut, vis, hdr: +getComputedStyle(hdr, '::before').opacity,
        lm: l ? +getComputedStyle(l).opacity : 0,
        lmY: l ? l.getBoundingClientRect().top : 0,
      })
      last = now
      if (rec.length < 400) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
  await page.mouse.move(720, 450)
  // a real wheel flick: 12 notches, 16ms apart
  for (let i = 0; i < 12; i++) { await page.mouse.wheel(0, -100); await page.waitForTimeout(16) }
  await page.waitForTimeout(5000)
  const rec = await page.evaluate(() => window.__rec)
  const t0 = rec[0].t
  const home = rec.find(r => r.y === 0)
  const vels = rec.slice(1).map((r, i) => Math.abs(r.y - rec[i].y))
  const accels = vels.slice(1).map((v, i) => Math.abs(v - vels[i]))
  const lmUp = rec.find(r => r.lm > 0.99 && home && r.t > home.t)
  const hdrOff = rec.find(r => home && r.t >= home.t && r.hdr < 0.01)
  return {
    frames: rec.length,
    slowFrames: rec.filter(r => r.dt > 25).length,
    maxBleed: Math.max(...rec.map(r => r.bleed)).toFixed(1),
    maxStep: Math.max(...vels).toFixed(1),
    maxJerk: Math.max(...accels).toFixed(1),
    cutFrames: rec.filter(r => r.cut).length,
    dockedSideVisible: rec.some(r => r.vis),
    tailMs: (() => { const a = rec.find(r => r.y < 40); return a && home ? Math.round(home.t - a.t) : null })(),
    homeMs: home ? Math.round(home.t - t0) : null,
    hdrHeldUntilHome: rec.filter(r => !home || r.t < home.t).every(r => r.hdr > 0.99 || r.pt > 64),
    hdrOffMs: hdrOff && home ? Math.round(hdrOff.t - home.t) : null,
    lmUpMs: lmUp && home ? Math.round(lmUp.t - home.t) : null,
  }
}
