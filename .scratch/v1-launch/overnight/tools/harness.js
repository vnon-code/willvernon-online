// FROZEN (overnight run; TOOLS.md). The Project Sheet harness, per project: project-sheet-harness.js (criteria 1–8,
// 10) and round2-harness.js (11–13) from rounds 1–2, with the slug as a parameter. score.cjs evaluates this in the
// page (1440×900, dark) after the Gate, with the Landing home:
//   await __sheetRun(variant, slug) → open/close metrics      __round2() with the Sheet open and settled → 11–13
// Relies on the prototype's hooks: window.__sheet (setVariant, opened), .card[data-slug], [data-sheet-media],
// [data-sheet-body], [data-sheet-layer], [data-sheet-overlay], [data-sheet-frame], [data-sheet-block], [data-drop],
// <html data-sheet="opening|open|closing|">.
(() => {
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
  const centreCard = () => document.querySelector('.card--centre')

  // Step the strip (an endless ring) until the slug's card is the centre card
  async function centreOn(slug) {
    for (let i = 0; i < 16; i++) {
      if (centreCard()?.dataset.slug === slug) return true
      dispatchEvent(new WheelEvent('wheel', { deltaY: 360, deltaMode: 0, cancelable: true }))
      await wait(1400)
    }
    return centreCard()?.dataset.slug === slug
  }
  window.__centreOn = centreOn

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

  window.__sheetRun = async (variant, slug) => {
    window.__sheet?.setVariant(variant)
    await wait(400)
    if (!(await centreOn(slug))) return { error: `could not centre ${slug}` }
    await wait(800)
    const card = centreCard()
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
    const opened = window.__sheet?.opened ?? null
    const layer = document.querySelector('[data-sheet-layer]')
    if (!layer) return { error: 'no [data-sheet-layer] after the open', opened, openMs }

    const media = open.filter(f => f.m)
    const first = media[0]?.m, end = media.at(-1)?.m
    // How far along its travel the media is at a frame (0 → 1), by its width
    const along = f => (first && end && end[2] !== first[2]) ? (f.m[2] - first[2]) / (end[2] - first[2]) : 1
    const bodyFrame = open.find(f => f.body > 0.05 && f.m)
    const mt = media.map(f => f.mt).filter(x => x != null)
    const dropGone = open.find(f => f.drop.every(d => d < 0.05))
    const mediaLand = media.find(f => along(f) > 0.98)

    // Settled view
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
    const cardNow = centreCard() ? rect(centreCard()) : null
    const closeOffPx = lastM && cardNow ? Math.round(Math.max(...lastM.map((x, k) => Math.abs(x - cardNow[k])))) : null
    const landingBack = [...document.querySelectorAll('[data-drop]')].every(e => shown(e) > 0.5 || e.dataset.drop === 'hud-closed')
    const focusBack = document.activeElement?.closest('.card--centre') != null

    // Back closes (a second open)
    await wait(400)
    centreCard()?.click()
    await until(() => phase() === 'open', 3000)
    await wait(300)
    history.back()
    await until(() => !document.querySelector('[data-sheet-layer]'), 2000)
    const backCloses = !document.querySelector('[data-sheet-layer]')
    await wait(600)

    const all = [...open, ...close]
    return {
      variant, slug, opened,
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

  // Criteria 11 header docked · 12 the Sheet's edges = the Sections panel's · 13 gaps between [data-sheet-block]s
  window.__round2 = () => {
    const hdr = document.querySelector('.header')
    const hcs = hdr && getComputedStyle(hdr)
    // The docked fill is the header's ::before (TheHeader.vue), not its own background
    const bg = (cs) => cs && !/rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor) && +cs.opacity > 0.95
    const solid = bg(hcs) || bg(hdr && getComputedStyle(hdr, '::before'))
    const headerInline = !!hdr && hdr.classList.contains('header--inline')
    const headerDocked = headerInline && solid

    const layer = document.querySelector('[data-sheet-layer]')
    const panel = document.querySelector('.sections__panel')
    const pick = (el) => {
      const cs = getComputedStyle(el)
      return { color: cs.borderTopColor + '|' + cs.borderLeftColor, width: cs.borderLeftWidth + '|' + cs.borderTopWidth,
        radius: cs.borderTopLeftRadius, w: Math.round(el.getBoundingClientRect().width) }
    }
    // The visible frame may be the layer or a child marked [data-sheet-frame]
    const frame = document.querySelector('[data-sheet-frame]') || layer
    const a = frame && pick(frame), b = panel && pick(panel)
    const edgesMatch = a && b ? { border: a.color === b.color && a.width === b.width, radius: a.radius === b.radius, width: Math.abs(a.w - b.w) <= 2, sheet: a, panel: b } : null

    // Gaps: each block's top against the previous block's bottom, in the layer's scroll coordinates
    if (!layer) return { headerDocked, headerInline, edgesMatch, maxGapPx: null, gapAt: '', blocks: 0 }
    const top = layer.getBoundingClientRect().top - layer.scrollTop
    const blocks = [...layer.querySelectorAll('[data-sheet-block]')].map(el => {
      const r = el.getBoundingClientRect()
      return { y0: r.top - top, y1: r.bottom - top, name: el.dataset.sheetBlock || el.className }
    }).sort((p, q) => p.y0 - q.y0)
    let maxGapPx = 0, where = ''
    for (let i = 1; i < blocks.length; i++) {
      const g = Math.round(blocks[i].y0 - blocks[i - 1].y1)
      if (g > maxGapPx) { maxGapPx = g; where = `${blocks[i - 1].name} → ${blocks[i].name}` }
    }
    return { headerDocked, headerInline, edgesMatch, maxGapPx: blocks.length ? maxGapPx : null, gapAt: where, blocks: blocks.length }
  }
})()
