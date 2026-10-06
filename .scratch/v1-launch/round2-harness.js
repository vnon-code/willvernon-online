// Round 2 harness (project-sheet-matrix.md, criteria 11–13). Call `__round2()` with the Sheet open and settled.
// 11 header docked · 12 the Sheet's edges = the Sections panel's · 13 gaps between [data-sheet-block]s, in layer order.
(() => {
  window.__round2 = () => {
    const hdr = document.querySelector('.header')
    const hcs = hdr && getComputedStyle(hdr)
    // The docked fill is the header's ::before (TheHeader.vue), not its own background
    const bg = (cs) => cs && !/rgba\(0, 0, 0, 0\)|transparent/.test(cs.backgroundColor) && +cs.opacity > 0.95
    const solid = bg(hcs) || bg(hdr && getComputedStyle(hdr, '::before'))
    const headerDocked = !!hdr && hdr.classList.contains('header--inline') && solid

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
    return { headerDocked, edgesMatch, maxGapPx, gapAt: where, blocks: blocks.length }
  }
})()
