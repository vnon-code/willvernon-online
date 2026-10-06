// Round 6 harness: for each combo, Learn More (header on the way down), then a wheel flick home (plates on the way back).
async (page) => {
  const COMBOS = ['hd=H1&pl=P1', 'hd=H2&pl=P1', 'hd=H3&pl=P1', 'hd=H1&pl=P2', 'hd=H1&pl=P3']
  const out = {}
  await page.emulateMedia({ colorScheme: 'dark' })
  for (const q of COMBOS) {
    await page.goto('http://localhost:3000/?sb=D&' + q)
    await page.waitForTimeout(1500)
    await page.getByText('Enter without sound').click()
    await page.waitForTimeout(3000)
    await page.evaluate(() => {
      document.querySelector('#nuxt-devtools-container')?.remove()
      const rec = (window.__rec = [])
      const panel = document.querySelector('.sections__panel')
      const hdr = document.querySelector('.header')
      const circle = document.querySelector('.header__home')
      const links = document.querySelector('.header__links')
      const burger = document.querySelector('.header__burger')
      const reveal = (el) => {
        if (!el) return 0
        const cs = getComputedStyle(el)
        const pc = (cs.clipPath.match(/[\d.]+%/g) || []).map(parseFloat)
        return +cs.opacity * (pc.length ? 1 - Math.max(...pc) / 50 : 1)
      }
      let last = performance.now()
      const tick = (now) => {
        rec.push({
          t: now, dt: now - last, y: scrollY, pt: panel.getBoundingClientRect().top,
          bg: +getComputedStyle(hdr, '::before').opacity,
          circ: +getComputedStyle(circle, '::before').opacity,
          links: +getComputedStyle(links).opacity * (getComputedStyle(links).translate.startsWith('38') ? 1 : 0.5),
          burger: +getComputedStyle(burger).opacity,
          chips: reveal(document.querySelector('.chips')),
          row: reveal(document.querySelector('.row')),
          lm: +(document.querySelector('.learn-more') ? getComputedStyle(document.querySelector('.learn-more')).opacity : 0),
        })
        last = now
        if (!window.__stop) requestAnimationFrame(tick)
      }
      requestAnimationFrame(tick)
    })
    await page.locator('.learn-more').click()
    await page.waitForTimeout(2000)
    const mark = await page.evaluate(() => window.__rec.length)
    await page.mouse.move(720, 450)
    for (let i = 0; i < 12; i++) { await page.mouse.wheel(0, -100); await page.waitForTimeout(16) }
    await page.waitForTimeout(3000)
    const rec = await page.evaluate(() => { window.__stop = 1; return window.__rec })
    const down = rec.slice(0, mark), up = rec.slice(mark)
    const t0 = down[0].t
    const yEnd = down[down.length - 1].y
    const arrive = down.find(r => Math.abs(r.y - yEnd) < 1)
    const changed = r => r.bg > 0.01 || r.circ < 0.99 || r.burger < 0.99
    const final = r => r.bg > 0.99 && r.circ < 0.01 && r.burger < 0.01 && r.links > 0.99
    const first = down.find(changed), done = down.find(final)
    const bgFull = down.find(r => r.bg > 0.99)
    const home = up.find(r => r.y === 0)
    const platesIn = home && up.find(r => r.t > home.t && r.chips > 0.99 && r.row > 0.99)
    const chipsIn = home && up.find(r => r.t > home.t && r.chips > 0.99)
    const rowIn = home && up.find(r => r.t > home.t && r.row > 0.99)
    const lmIn = home && up.find(r => r.t > home.t && r.lm > 0.99)
    const mid = up.filter(r => r.y > 100 && r.y < 600)
    out[q] = {
      // header, on the way down
      hdrStartMs: first ? Math.round(first.t - t0) : null,
      hdrDoneMs: done ? Math.round(done.t - t0) : null,
      hdrSpreadMs: first && done ? Math.round(done.t - first.t) : null,
      hdrLateMs: done && arrive ? Math.round(done.t - arrive.t) : null,
      bgFullAtPanelTop: bgFull ? Math.round(bgFull.pt) : null,
      uncoveredFrames: down.filter(r => r.pt < 64 && r.bg < 0.9).length,
      // plates, on the way back
      platesVisibleMidReturn: +(Math.max(...mid.map(r => Math.max(r.chips, r.row)), 0)).toFixed(2),
      platesInMs: platesIn ? Math.round(platesIn.t - home.t) : null,
      chipsBeforeRow: chipsIn && rowIn ? chipsIn.t <= rowIn.t : null,
      lmInMs: lmIn ? Math.round(lmIn.t - home.t) : null,
      slowFrames: rec.filter(r => r.dt > 25).length,
    }
  }
  return out
}
