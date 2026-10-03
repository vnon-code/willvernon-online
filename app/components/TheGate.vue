<script setup lang="ts">
import copy from '~~/content/gate.json'
import glyphData from '~/assets/gate-glyphs.json'
import {
  GATE_DUR, GATE_REDUCED_FADE, GATE_T, MARK_POINTS, MARK_VIEWBOX,
  clamp01, inOutCubic, outCubic, phase,
} from '~/utils/gate'

// The Gate (docs/specs/gate.md; reference prototype/gate-intro.html at its defaults).
// The real button only works once loading has finished, so a choice means the site can enter.
const emit = defineEmits<{ enter: [withSound: boolean] }>()

const loader = useLoader()
const { ready, startLoading } = loader
const progress = computed(() => loader.progress.value / 100) // 0–1, never goes backwards

const choice = ref<boolean | null>(null)
const leaving = computed(() => choice.value !== null)

function choose(withSound: boolean) {
  if (choice.value !== null || slot.value !== 'live') return
  choice.value = withSound
  // The AudioContext has to start inside the click; the music itself fades in later, with the Landing
  if (withSound) useSound().unlock()
}

// Fires once the gate has faded out (step 1 of the transition)
function onLeft(e: TransitionEvent) {
  if (leaving.value && e.propertyName === 'opacity') emit('enter', choice.value!)
}

/* ---------- elements ---------- */
const stage = ref<SVGSVGElement>()
const nameGroup = ref<SVGGElement>()
const morph = ref<SVGPathElement>()
const nameEl = ref<HTMLElement>()
const markEl = ref<HTMLElement>()
const wordEl = ref<HTMLElement>()
const lettersEl = ref<HTMLElement>()
const meter = ref<HTMLElement>()
const primary = ref<HTMLButtonElement>()
const outline = ref<SVGSVGElement>()
const outlinePath = ref<SVGPathElement>()
const pctEl = ref<HTMLElement>()
const labelEl = ref<HTMLElement>()

const reduced = ref(false)

const markPoints = MARK_POINTS.map(p => p.join(',')).join(' ')
const markViewBox = `${MARK_VIEWBOX.x} ${MARK_VIEWBOX.y} ${MARK_VIEWBOX.w} ${MARK_VIEWBOX.h}`

/* ---------- the big name, as real glyph outlines (Host Grotesk 600) ---------- */
const G = glyphData.glyphs as Record<string, { d: string, adv: number }>
const TRACK = -20 // font units (-0.02em)
// keep: the initials (W, V), which morph into the monogram; the rest squeeze shut
const letters = [...copy.name].map((ch, i) => ({
  i,
  d: G[ch]?.d ?? '',
  adv: G[ch]?.adv ?? 0,
  keep: i === 0 || copy.name[i - 1] === ' ',
}))
const letterEls: SVGGElement[] = []

// x of every letter for a squeeze amount e (0 = full name, 1 = only the initials left)
function layoutName(e: number) {
  let x = 0
  const xs = letters.map((L, i) => {
    const k = L.keep ? 1 : 1 - e
    const at = { x, sx: k }
    x += L.adv * k + (i < letters.length - 1 ? TRACK * k : 0)
    return at
  })
  return { xs, width: x }
}

let S = 1 // px per font unit
let origin = { x: 0, y: 0 } // the mark's centre (the viewport centre)
let markRect: DOMRect | undefined
let combine: typeof import('flubber').combine | null = null
let morphFn: ((t: number) => string) | null = null

function measure() {
  if (!stage.value || !markEl.value) return
  stage.value.setAttribute('viewBox', `0 0 ${innerWidth} ${innerHeight}`)
  markRect = markEl.value.getBoundingClientRect()
  origin = { x: markRect.left + markRect.width / 2, y: markRect.top + markRect.height / 2 }
  S = Math.min(Math.max(innerWidth * 0.06, 34), 72) / glyphData.upm // font size clamp(34px, 6vw, 72px)
  morphFn = null
  measureOutline()
}

// Points along a glyph's outer contour (W and V are single contours), in screen px
function sampleRing(d: string, tx: number, ty: number, n = 160) {
  const tmp = document.createElementNS('http://www.w3.org/2000/svg', 'path')
  tmp.setAttribute('d', d.split(/(?=M)/)[0]!)
  stage.value!.appendChild(tmp)
  const len = tmp.getTotalLength()
  const ring: [number, number][] = []
  for (let k = 0; k < n; k++) {
    const pt = tmp.getPointAtLength((len * k) / n)
    ring.push([tx + pt.x * S, ty + pt.y * S])
  }
  tmp.remove()
  return ring
}

function buildMorph() {
  if (!combine || !markRect) return
  const { xs, width } = layoutName(1)
  const left = origin.x - (width * S) / 2, top = origin.y - (glyphData.cap * S) / 2
  const rings = letters.filter(L => L.keep).map(L => sampleRing(L.d, left + xs[L.i]!.x * S, top))
  const r = markRect
  const target = MARK_POINTS.map(([x, y]): [number, number] => [
    r.left + ((x - MARK_VIEWBOX.x) / MARK_VIEWBOX.w) * r.width,
    r.top + ((y - MARK_VIEWBOX.y) / MARK_VIEWBOX.h) * r.height,
  ])
  morphFn = combine(rings, target, { single: true, maxSegmentLength: 4 })
}

/* ---------- the intro, rendered as a pure function of t (ms since mount) ---------- */
const T = GATE_T, DUR = GATE_DUR
const END = Math.max(T.unfold + DUR.unfold, T.choices)

function frame(t: number) {
  // 1–2. the name rises letter by letter, then everything but the initials squeezes shut
  const showName = t < T.morph
  if (nameGroup.value) nameGroup.value.style.display = showName ? '' : 'none'
  if (showName) {
    const { xs, width } = layoutName(inOutCubic(phase(t, T.squeeze, DUR.squeeze)))
    const left = origin.x - (width * S) / 2, top = origin.y - (glyphData.cap * S) / 2
    for (const L of letters) {
      const el = letterEls[L.i]
      if (!el) continue
      const r = outCubic(phase(t, T.rise + L.i * 35, DUR.rise))
      const dy = (1 - r) * glyphData.cap * S * 0.9
      const { x, sx } = xs[L.i]!
      el.setAttribute('transform', `translate(${left + x * S} ${top + dy}) scale(${S * Math.max(sx, 0.0001)} ${S})`)
      el.setAttribute('opacity', String(r * (L.keep ? 1 : Math.min(1, sx * 1.6))))
    }
  }

  // 3. the initials morph into the monogram
  if (t >= T.morph && t < T.swap) {
    if (!morphFn) buildMorph()
    if (morphFn) morph.value?.setAttribute('d', morphFn(inOutCubic(phase(t, T.morph, DUR.morph))))
  }
  else {
    morph.value?.removeAttribute('d')
  }

  // 4. the real mark takes over
  if (markEl.value) markEl.value.style.opacity = t >= T.swap ? '1' : '0'

  // 5. the name and the word unfold out of either side of the mark
  const u = outCubic(phase(t, T.unfold, DUR.unfold))
  if (nameEl.value) {
    nameEl.value.style.clipPath = `inset(0 0 0 ${(1 - u) * 100}%)`
    nameEl.value.style.transform = `translateX(${(1 - u) * 24}px)`
  }
  if (wordEl.value) {
    wordEl.value.style.clipPath = `inset(0 ${(1 - u) * 100}% 0 0)`
    wordEl.value.style.transform = `translateX(${(1 - u) * -24}px)`
  }

  // 6. the primary slot: the finished button, or the loader until loading is done
  if (t >= T.choices && slot.value === 'hidden') showSlot()
}

let t0 = 0, raf = 0
function tick(now: number) {
  const t = now - t0
  frame(Math.min(t, END))
  raf = t < END ? requestAnimationFrame(tick) : 0
}

/* ---------- letter roll, shared by the word and the button label ---------- */
const ROLL = 490, STAGGER = 60, FADE = GATE_REDUCED_FADE
const EASE = 'cubic-bezier(0.23, 1, 0.32, 1)' // --ease-out

function roll(root: HTMLElement | undefined, from: string, to: string) {
  const cs = [...(root?.querySelectorAll<HTMLElement>('.gate__c') ?? [])]
  return Promise.all(cs.map((c, i) => c.animate(
    [{ transform: from }, { transform: to }],
    { duration: ROLL, delay: i * STAGGER, easing: EASE, fill: 'both' },
  ).finished))
}

function fade(el: Element | undefined, from: number, to: number) {
  if (!el) return Promise.resolve()
  el.getAnimations().forEach(a => a.cancel())
  return el.animate([{ opacity: from }, { opacity: to }], { duration: FADE, fill: 'forwards' }).finished.then(() => {})
}

/* ---------- the rotating word: a slot as wide as the name ---------- */
const HOLD = 3000
const wi = ref(0)
const spacing = ref(2) // px between letters
const wordChars = computed(() => [...copy.words[wi.value]!])

// Letter spacing that stretches `word` to the name's width, capped at 1.5–4px
function spacingFor(word: string) {
  if (!nameEl.value || !meter.value) return spacing.value
  const ls = parseFloat(getComputedStyle(nameEl.value).letterSpacing) || 0
  const nameW = nameEl.value.getBoundingClientRect().width - ls // the box includes the trailing tracking
  meter.value.textContent = word
  const wordW = meter.value.getBoundingClientRect().width
  return Math.min(4, Math.max(1.5, (nameW - wordW) / Math.max(word.length - 1, 1)))
}

function showWord(i: number) {
  spacing.value = spacingFor(copy.words[i]!)
  wi.value = i
  return nextTick()
}

let alive = true
const sleep = (ms: number) => new Promise(r => setTimeout(r, ms))

async function rotate(delay: number) {
  await sleep(delay)
  while (alive && copy.words.length > 1) {
    await sleep(HOLD)
    if (!alive) return
    const next = (wi.value + 1) % copy.words.length
    if (reduced.value) {
      await fade(lettersEl.value, 1, 0)
      await showWord(next)
      await fade(lettersEl.value, 0, 1)
    }
    else {
      // each letter rolls up out of its mask, then the next word rolls up from below
      await roll(lettersEl.value, 'none', 'translateY(-105%)')
      await showWord(next)
      await roll(lettersEl.value, 'translateY(105%)', 'none')
    }
  }
}

/* ---------- the primary slot: loader → button ----------
   hidden → loading (outline traces progress, "42%") → finishing (outline retracts to the corner brackets,
   the % rolls out, the label rolls in) → live (the real button works and takes focus).
   If loading is done by T.choices, it goes straight to live. */
const slot = ref<'hidden' | 'loading' | 'finishing' | 'live'>('hidden')
const labelOn = ref(true) // the button label, hidden while the % shows
const bracketsOn = ref(true) // the corner <i>s, hidden while the outline draws
const outlineOn = ref(false)
const labelChars = [...copy.enterWithSound]

let shown = 0 // displayed progress 0–1: eases towards the real value, never backwards
const pct = ref(0)
let outlineW = 0, outlineH = 0, arm = 0, loadRaf = 0

// The outline path runs clockwise from the top-left corner, in px
const outlineD = ref('')
const outlineBox = ref('0 0 0 0')
function measureOutline() {
  const b = primary.value
  if (!b) return
  outlineW = b.offsetWidth
  outlineH = b.offsetHeight
  arm = (b.querySelector('i')?.offsetWidth ?? 10) - 0.5
  const r = outlineW - 0.5, btm = outlineH - 0.5
  outlineBox.value = `0 0 ${outlineW} ${outlineH}`
  outlineD.value = `M0.5 0.5H${r}V${btm}H0.5Z`
}

// Dash pattern (in pathLength 1) for retraction k: 0 = full outline, 1 = only the corner arms left
function bracketDashes(k: number) {
  const w = outlineW - 1, h = outlineH - 1, P = 2 * (w + h)
  const aw = arm + ((w - 2 * arm) * (1 - k)) / 2, ah = arm + ((h - 2 * arm) * (1 - k)) / 2
  const gw = (w - 2 * arm) * k, gh = (h - 2 * arm) * k
  return [aw, gw, aw + ah, gh, ah + aw, gw, aw + ah, gh, ah, 0].map(v => Math.max(v, 0) / P).join(' ')
}

function drawProgress(p: number) {
  outlinePath.value?.setAttribute('stroke-dasharray', `${p} 1`)
  pct.value = Math.round(p * 100)
}

function showSlot() {
  if (ready.value) {
    slot.value = 'live'
    return
  }
  labelOn.value = false
  bracketsOn.value = false
  outlineOn.value = true
  slot.value = 'loading'
  nextTick(() => {
    measureOutline()
    loadRaf = requestAnimationFrame(loadTick)
  })
}

function loadTick() {
  const target = progress.value
  // reduced motion: the outline is state, so it tracks the real value with no easing
  shown = reduced.value ? target : Math.min(target, shown + (target - shown) * 0.1)
  if (target - shown < 0.002) shown = target
  drawProgress(shown)
  if (shown >= 1) {
    loadRaf = 0
    finish()
    return
  }
  loadRaf = requestAnimationFrame(loadTick)
}

function retract() {
  return new Promise<void>((done) => {
    const start = performance.now()
    const step = (now: number) => {
      const k = outCubic(clamp01((now - start) / ROLL))
      outlinePath.value?.setAttribute('stroke-dasharray', bracketDashes(k))
      if (k < 1 && alive) requestAnimationFrame(step)
      else done()
    }
    requestAnimationFrame(step)
  })
}

async function finish() {
  slot.value = 'finishing'
  if (reduced.value) {
    // the brackets and the label cross-fade in
    labelOn.value = true
    bracketsOn.value = true
    await nextTick()
    const corners = [...(primary.value?.querySelectorAll('i') ?? [])]
    await Promise.all([
      fade(outline.value, 1, 0),
      fade(pctEl.value, 1, 0),
      fade(labelEl.value, 0, 1),
      ...corners.map(i => fade(i, 0, 1)),
    ])
  }
  else {
    // the outline retracts to the corner brackets while the % rolls out; then the label rolls in
    measureOutline()
    await Promise.all([retract(), roll(pctEl.value, 'none', 'translateY(-105%)')])
    bracketsOn.value = true // the <i> corners sit exactly on the outline's corner arms
    outlineOn.value = false
    labelOn.value = true
    await nextTick()
    await roll(labelEl.value, 'translateY(105%)', 'none')
  }
  if (alive) slot.value = 'live'
}

watch(slot, (s) => {
  if (s === 'live') nextTick(() => primary.value?.focus())
})

/* ---------- lifecycle ---------- */
function onResize() {
  measure()
}

onMounted(() => {
  startLoading()
  reduced.value = matchMedia('(prefers-reduced-motion: reduce)').matches
  measure()
  showWord(0)
  document.fonts.ready.then(() => {
    if (!alive) return
    showWord(wi.value)
    measureOutline()
  })
  addEventListener('resize', onResize)

  if (reduced.value) {
    // no bloom, morph, roll or wave: the final state cross-fades in
    frame(END)
    rotate(0)
    return
  }
  import('flubber').then((m) => { combine = m.combine }).catch(err => console.warn('Morph unavailable', err))
  t0 = performance.now()
  raf = requestAnimationFrame(tick)
  rotate(T.choices + 600)
})

onBeforeUnmount(() => {
  alive = false
  cancelAnimationFrame(raf)
  cancelAnimationFrame(loadRaf)
  removeEventListener('resize', onResize)
})
</script>

<template>
  <section
    class="gate"
    :class="{ 'gate--leaving': leaving, 'gate--reduced': reduced }"
    @transitionend.self="onLeft"
  >
    <GateDots />

    <div class="gate__lockup">
      <h1 ref="nameEl" class="gate__side gate__name">{{ copy.name }}</h1>
      <span ref="markEl" class="gate__mark" aria-hidden="true">
        <svg :viewBox="markViewBox"><polygon :points="markPoints" /></svg>
      </span>
      <p ref="wordEl" class="gate__side gate__word" aria-live="off">
        <!-- screen readers get the first word only -->
        <span class="gate__sr">{{ copy.words[0] }}</span>
        <span ref="lettersEl" class="gate__letters" aria-hidden="true">
          <span v-for="(ch, i) in wordChars" :key="`${wi}-${i}`" class="gate__m">
            <span class="gate__c" :style="{ marginRight: i < wordChars.length - 1 ? `${spacing}px` : '0' }">{{ ch }}</span>
          </span>
        </span>
      </p>
    </div>
    <span ref="meter" class="gate__side gate__meter" aria-hidden="true" />

    <!-- everything that moves in the intro is drawn here, in screen px -->
    <svg ref="stage" class="gate__stage" aria-hidden="true">
      <g ref="nameGroup">
        <g
          v-for="L in letters"
          :key="L.i"
          :ref="(el) => { if (el) letterEls[L.i] = el as SVGGElement }"
          opacity="0"
        >
          <path :d="L.d" />
        </g>
      </g>
      <path ref="morph" />
    </svg>

    <!-- The primary slot: the loader until loading is done, then the button (same box, same place) -->
    <div class="gate__choices gate__rise" :class="{ 'is-in': slot !== 'hidden' }">
      <button
        ref="primary"
        class="gate__bk"
        :class="{ 'no-label': !labelOn, 'no-brackets': !bracketsOn }"
        type="button"
        :aria-label="copy.enterWithSound"
        :aria-pressed="choice === true"
        :aria-hidden="slot !== 'live' ? 'true' : undefined"
        :inert="slot !== 'live'"
        @click="choose(true)"
      >
        <span class="gate__plate" aria-hidden="true" />
        <i aria-hidden="true" /><i aria-hidden="true" /><i aria-hidden="true" /><i aria-hidden="true" />
        <span ref="labelEl" class="gate__lbl" aria-hidden="true">
          <span v-for="(ch, i) in labelChars" :key="i" class="gate__m"><span class="gate__c">{{ ch }}</span></span>
        </span>
        <svg
          v-if="outlineOn"
          ref="outline"
          class="gate__outline"
          :viewBox="outlineBox"
          aria-hidden="true"
        >
          <path ref="outlinePath" :d="outlineD" pathLength="1" stroke-dasharray="0 1" />
        </svg>
      </button>
      <div
        v-if="slot === 'loading' || slot === 'finishing'"
        class="gate__progress"
        role="progressbar"
        aria-label="Loading"
        aria-valuemin="0"
        aria-valuemax="100"
        :aria-valuenow="loader.progress.value"
      >
        <span ref="pctEl" class="gate__pct" aria-hidden="true">
          <span v-for="(ch, i) in `${pct}%`" :key="i" class="gate__m"><span class="gate__c">{{ ch }}</span></span>
        </span>
      </div>
    </div>
    <button
      class="gate__bk gate__bk--quiet gate__rise"
      :class="{ 'is-in': slot === 'live' }"
      type="button"
      :inert="slot !== 'live'"
      :aria-pressed="choice === false"
      @click="choose(false)"
    >
      <span class="gate__plate" aria-hidden="true" />
      <span class="gate__lbl">{{ copy.enterWithoutSound }}</span>
    </button>
  </section>
</template>

<style scoped>
.gate {
  --mute: color-mix(in srgb, var(--c-fg) 65%, var(--c-bg));
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
  overflow: hidden;
  transition: opacity 0.6s ease;
}

.gate--leaving {
  opacity: 0;
  pointer-events: none;
}

/* Lockup: name | mark | word. Equal side columns keep the mark at the exact viewport centre */
.gate__lockup {
  position: relative; /* above the dot matrix */
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 22px; /* fixed; does not scale with the mark */
  width: 100%;
}

.gate__side {
  margin: 0;
  font-size: 13px;
  font-weight: 600;
  line-height: normal;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  white-space: nowrap;
}

/* Hidden until the intro unfolds them (the script drives clip-path and transform from here) */
.gate__name {
  justify-self: end;
  margin-right: -0.16em; /* cancels the trailing tracking */
  clip-path: inset(0 0 0 100%);
}

.gate__word {
  justify-self: start;
  display: inline-flex;
  color: var(--mute);
  letter-spacing: 0;
  clip-path: inset(0 100% 0 0);
}

.gate__letters,
.gate__lbl,
.gate__pct {
  display: inline-flex;
}

/* Each letter rolls inside its own mask */
.gate__m {
  display: inline-block;
  overflow: hidden;
  vertical-align: top;
}

.gate__c {
  display: inline-block;
  white-space: pre;
}

.gate__meter {
  position: absolute;
  visibility: hidden;
  letter-spacing: 0;
  pointer-events: none;
}

.gate__mark {
  display: block;
  height: 96px;
  aspect-ratio: 808 / 577;
  opacity: 0;
}

.gate__mark svg {
  display: block;
  width: 100%;
  height: 100%;
  fill: currentColor;
}

.gate__stage {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  fill: var(--c-fg);
  pointer-events: none;
}

.gate__sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* Choices (layout C): the primary slot hangs 44px under the mark; the quiet link sits on the bottom edge */
.gate__rise {
  opacity: 0;
  visibility: hidden;
  transform: translateY(12px);
  transition: opacity 0.7s var(--ease-out), transform 0.7s var(--ease-out), visibility 0s 0.7s;
}

.gate__rise.is-in {
  opacity: 1;
  visibility: visible;
  transform: none;
  transition-delay: 0s;
}

.gate__choices {
  position: absolute;
  top: calc(50% + 48px + 44px); /* half the mark (96px / 2) + the 44px gap */
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
}

/* Loader: a small muted percentage, centred in the button's box */
.gate__progress {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.gate__pct {
  color: var(--mute);
  font: 500 11px var(--font-ui);
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.04em;
}

.gate__outline {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  overflow: visible;
  fill: none;
  stroke: currentColor;
  stroke-width: 1px;
  shape-rendering: crispEdges;
  pointer-events: none;
}

/* Corner-bracket button (after dkton.at) */
/* Invisible hit area: the compact box is under 44px tall, so reach 44px without visible padding */
.gate__bk:not(.gate__bk--quiet)::before {
  content: '';
  position: absolute;
  inset: -7px -4px;
}

.gate__bk {
  position: relative;
  display: inline-flex;
  align-items: center;
  border: 0;
  background: none;
  color: var(--c-fg);
  padding: 0.9em 1.6em; /* compact box; the hit area is extended by ::before */
  font: 600 11px var(--font-ui);
  letter-spacing: 0.14em;
  text-transform: uppercase;
  cursor: pointer;
}

.gate__bk.no-label .gate__lbl,
.gate__bk.no-brackets i {
  visibility: hidden;
}

.gate__plate {
  position: absolute;
  inset: 0;
  background: var(--c-fg);
  opacity: 0;
  transition: opacity 0.34s var(--ease-out-expo), inset 0.34s var(--ease-out-expo);
}

.gate__lbl {
  position: relative;
  transition: color 0.1s;
}

.gate__bk i {
  position: absolute;
  width: 0.82em;
  height: 0.82em;
  border: 1px solid currentColor;
  transition: transform 0.34s var(--ease-out-expo);
}

.gate__bk i:nth-of-type(1) { top: 0; left: 0; border-right: 0; border-bottom: 0; }
.gate__bk i:nth-of-type(2) { top: 0; right: 0; border-left: 0; border-bottom: 0; }
.gate__bk i:nth-of-type(3) { bottom: 0; left: 0; border-right: 0; border-top: 0; }
.gate__bk i:nth-of-type(4) { bottom: 0; right: 0; border-left: 0; border-top: 0; }

.gate__bk--quiet {
  position: absolute;
  left: 50%;
  bottom: 28px;
  translate: -50% 0;
  color: var(--mute);
  font-weight: 500;
  font-size: 10px; /* one step under the 11px primary: the secondary choice stays quieter */
  padding: 0.75em 1.3em;
}

@media (hover: hover) and (pointer: fine) {
  .gate__bk:hover .gate__plate { opacity: 0.1; inset: 4px; }
  .gate__bk:hover i:nth-of-type(1) { transform: translate(-3px, -3px); }
  .gate__bk:hover i:nth-of-type(2) { transform: translate(3px, -3px); }
  .gate__bk:hover i:nth-of-type(3) { transform: translate(-3px, 3px); }
  .gate__bk:hover i:nth-of-type(4) { transform: translate(3px, 3px); }
  .gate__bk--quiet:hover { color: var(--c-fg); }
}

/* Pressed (and chosen, while the gate fades out): the plate fills */
.gate__bk:active .gate__plate,
.gate__bk[aria-pressed='true'] .gate__plate {
  opacity: 1;
  inset: 0;
  transition-duration: 0.1s;
}

.gate__bk:active .gate__lbl,
.gate__bk[aria-pressed='true'] .gate__lbl {
  color: var(--c-bg);
}

.gate__bk:focus-visible {
  outline: 2px solid var(--c-fg);
  outline-offset: 4px;
}

/* Reduced motion: no movement; the final lockup and choices cross-fade in over 0.2s */
@keyframes gate-fade {
  from { opacity: 0; }
}

.gate--reduced .gate__lockup {
  animation: gate-fade 0.2s ease both;
}

@media (prefers-reduced-motion: reduce) {
  .gate {
    transition-duration: 0.2s;
  }

  .gate__rise {
    transform: none;
    transition: opacity 0.2s ease, visibility 0s 0.2s;
  }

  .gate__rise.is-in {
    transition-delay: 0s;
  }
}
</style>
