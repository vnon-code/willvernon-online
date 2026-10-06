// Project Sheet harness (project-sheet-matrix.md). Paste into the page (browser pane, 1440×900, dark), after the Gate,
// with the Landing home. Then: `await __sheetRun('A')` → metrics for criteria 1–8 and 10. Stills are taken separately.
// Relies on the prototype's hooks: window.__sheet, [data-sheet-media], [data-sheet-body], [data-sheet-layer],
// [data-sheet-overlay], [data-drop], <html data-sheet="opening|open|closing|">.
(() => {
  const SLUG = 'amplified-spaces'
  const wait = ms => new Promise(r => setTimeout(r, ms))
  const until = async (fn, ms = 3000) => { const t = performance.now(); while (!fn() && performance.now() - t < ms) await wait(16) }
  const phase = () => document.documentElement.dataset.sheet || ''
  const rect = el => { const r = el.getBoundingClientRect(); return [r.x, r.y, r.width, r.height] }
  // How much of an element shows: opacity chain × the part inside the viewport
  const shown = (el) => {
    if (!el || !el.isConnected) return 0
    let o = 1
    for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
      const cs = getComputedStyle(e)
      if (cs.display === 'none' || cs.visibility === 'hidden') return 0
      o *= +cs.opacity
    }
    const r = el.getBoundingClientRect()
    const ix = Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0))
    const iy = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0))
    return o * (ix * iy) / Math.max(1, r.width * r.height)
  }

  // Step the strip until Amplified Spaces is the centre card
  async function centreOn() {
    for (let i = 0; i < 14; i++) {
      const t = document.querySelector('.row')?.textContent || ''
      if (t.includes('Amplified Spaces')) return true
      dispatchEvent(new WheelEvent('wheel', { deltaY: 360, deltaMode: 0, cancelable: true }))
      await wait(1400)
    }
    return false
  }

  function sampler(rec) {
    let last = performance.now(), stop = false
    const tick = (now) => {
      const m = document.querySelector('[data-sheet-media]')
      const v = m?.querySelector('video') || (m?.tagName === 'VIDEO' ? m : null)
      const b = document.querySelector('[data-sheet-body]')
      rec.push({ t: now, dt: now - last, ph: phase(),
        m: m ? rect(m) : null, mt: v ? v.currentTime : null,
        body: shown(b), drop: [...document.querySelectorAll('[data-drop]')].map(shown) })
      last = now
      if (!stop) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
    return () => (stop = true)
  }

  function travel(rec) {
    let step = 0
    for (let i = 1; i < rec.length; i++) {
      const a = rec[i - 1].m, b = rec[i].m
      if (a && b) step = Math.max(step, ...a.map((x, k) => Math.abs(b[k] - x)))
    }
    return Math.round(step)
  }

  window.__sheetRun = async (variant) => {
    window.__sheet?.setVariant(variant)
    await wait(400)
    if (!(await centreOn())) return { error: 'could not centre Amplified Spaces' }
    await wait(800)
    const card = document.querySelector('.card--centre')
    const cardRect = rect(card)
    const cardVid = card.querySelector('video')
    const cardT = cardVid ? cardVid.currentTime : null

    // Open
    const open = []
    let stop = sampler(open)
    const t0 = performance.now()
    card.click()
    await until(() => phase() === 'open', 3000)
    const openMs = Math.round(performance.now() - t0)
    await wait(500)
    stop()
    const path = location.pathname

    const media = open.filter(f => f.m)
    const first = media[0]?.m, end = media.at(-1)?.m
    // How far along its travel the media is at a frame (0 → 1), by its width
    const along = f => (first && end && end[2] !== first[2]) ? (f.m[2] - first[2]) / (end[2] - first[2]) : 1
    const bodyFrame = open.find(f => f.body > 0.05 && f.m)
    const mt = media.map(f => f.mt).filter(x => x != null)
    const dropGone = open.find(f => f.drop.every(d => d < 0.05))
    const mediaLand = media.find(f => along(f) > 0.98)

    // Settled view
    const layer = document.querySelector('[data-sheet-layer]')
    const lr = layer.getBoundingClientRect()
    const ov = document.querySelector('[data-sheet-overlay]')
    const bg = ov ? getComputedStyle(ov).backgroundColor : 'rgba(0,0,0,0)'
    const alpha = (bg.match(/[\d.]+/g) || []).map(Number)
    const filters = [ov, layer].filter(Boolean).map(e => getComputedStyle(e).backdropFilter).filter(f => f && f !== 'none')
    const mediaEls = [...layer.querySelectorAll('img, video')]
    const vArea = innerWidth * innerHeight
    const mediaShare = mediaEls.reduce((s, e) => {
      const r = e.getBoundingClientRect()
      return s + Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0)) * Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0))
    }, 0) / vArea
    const focusIn = layer.contains(document.activeElement) || document.activeElement?.closest('[role=dialog]') != null

    // Close (Escape)
    const close = []
    stop = sampler(close)
    const t1 = performance.now()
    dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await until(() => phase() === '' && !document.querySelector('[data-sheet-layer]'), 3000)
    const closeMs = Math.round(performance.now() - t1)
    await wait(600)
    stop()
    const lastM = close.filter(f => f.m).at(-1)?.m
    const cardNow = rect(document.querySelector('.card--centre'))
    const closeOffPx = lastM ? Math.round(Math.max(...lastM.map((x, k) => Math.abs(x - cardNow[k])))) : null
    const landingBack = [...document.querySelectorAll('[data-drop]')].every(e => shown(e) > 0.5 || e.dataset.drop === 'hud-closed')
    const focusBack = document.activeElement?.closest('.card--centre') != null || document.activeElement === document.querySelector('.card--centre')

    // Back closes (a second open)
    await wait(400)
    document.querySelector('.card--centre').click()
    await until(() => phase() === 'open', 3000)
    await wait(300)
    history.back()
    await until(() => !document.querySelector('[data-sheet-layer]'), 2000)
    const backCloses = !document.querySelector('[data-sheet-layer]')
    await wait(600)

    const all = [...open, ...close]
    return {
      variant,
      mediaMaxStep: travel(open), closeMaxStep: travel(close),
      videoRestarted: cardT != null && mt.length ? mt[0] + 0.05 < cardT : null, cardT, sheetT0: mt[0] ?? null,
      bodyStartPct: bodyFrame ? Math.round(along(bodyFrame) * 100) : null,
      landingGoneMs: dropGone ? Math.round(dropGone.t - t0) : null,
      mediaLandMs: mediaLand ? Math.round(mediaLand.t - t0) : null,
      landingLeftovers: open.at(-1).drop.filter(d => d >= 0.05).length,
      marginPx: Math.round(Math.min(lr.left, innerWidth - lr.right)),
      backdropFilter: filters, overlayAlpha: alpha.length === 4 ? alpha[3] : (alpha.length ? 1 : 0),
      mediaShare: +mediaShare.toFixed(2), mediaCount: mediaEls.length,
      closeOffPx, landingBack, openMs, closeMs,
      slowFrames: all.filter(f => f.dt > 25).length,
      url: path, focusIn, focusBack, backCloses,
    }
  }
})()
