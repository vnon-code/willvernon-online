<script setup lang="ts">
// The Landing background (docs/specs/landing-background.md; reference prototype/backgrounds.html).
// A full-screen grid of round dots; a warped fbm field sets each dot's size and colour. The centred project's teaser
// sets the palette only: teaser/still → source (½ res, crossfades between projects) → ⅛ → 1/32 → 5 stops → dots.
// Plain WebGL, one canvas. If WebGL is missing or the context is lost, the page colour shows instead.
const props = defineProps<{
  // The strip's centred card: its still, and its teaser (video or .gif; a .gif has no frames for WebGL)
  project?: { poster: string, teaser?: string | null }
  // The latest step: the new centre card and when it arrived (performance.now()); the pulse starts at its border
  pulse?: { el: Element, at: number }
}>()

// Grid, dot sizes, zoom, warp, speed and brightness come live from useVisuals (the Visuals HUD); DREAM blends
// zoom, warp and speed from those towards FULL (docs/specs/landing-background.md).
const { v: visuals } = useVisuals()
// Dots shrink under every [data-dot-clear] element so text reads over them (Will, 2026-10-04). Will, 2026-10-05
// ("soft", picked on a live trial): the clear follows each element's own corner radius, with a wider feather and a
// gentler shrink, so it reads as part of the field rather than a box cut out of it
const CLEAR = { max: 12, pad: 4, feather: 56, keep: 0.6 } // elements, px around each, px to full size, size kept under UI
const MONO = 0.55 // brightness × for a grey palette (saturation ≤ .08), easing to ×1 by saturation .30. PLACEHOLDER
const FULL = { scale: 0.85, warp: 3.35, speed: 0.55 }
// Colour "smooth" (Will, 2026-10-05): responds at once, then settles softly. Crossfade between projects (s) on an
// ease-out curve; the palette is read every `readback` s and carried through two short eases in a row (s: no jump,
// no lag); still → live teaser at `videoFade` per second
const COLOUR = { crossfade: 1.8, pre: 0.06, ease: 0.4, readback: 0.05, videoFade: 0.8 }
// Colour wash (Will, 2026-10-05; picked from 14 scored variants on a live trial): on each step the new palette spreads
// out from the centre card's border, reaching the far corner in `ms` (ease-out). Its soft front (`feather` px) is
// pushed in and out by the field (`push` px), so it follows the field's own shapes. The Breath Bright band rides on the
// front: it lights only dots that are already lit (black stays black, sizes stay put) and its crest tips towards white.
// Band strength, width (px), whiteness at the crest (0–1), fade (× the distance to the far corner). Reduced motion: no
// wave and no band; the colour crossfades in place.
const WASH = { ms: 3000, feather: 240, push: 120, amp: 0.75, w: 140, white: 0.7, fall: 0.6 }

const canvas = ref<HTMLCanvasElement>()
const { dream } = useSound()

// CSS-style cubic-bezier(x1, y1, x2, y2): solve x(u) = x by Newton steps, return y(u)
function bezier(x1: number, y1: number, x2: number, y2: number) {
  const f = (u: number, a: number, b: number) => 3 * a * u * (1 - u) * (1 - u) + 3 * b * u * u * (1 - u) + u * u * u
  const df = (u: number, a: number, b: number) => 3 * a * (1 - u) * (1 - u) + 6 * (b - a) * u * (1 - u) + 3 * (1 - b) * u * u
  return (x: number) => {
    let u = x
    for (let i = 0; i < 8; i++) {
      const d = df(u, x1, x2)
      if (Math.abs(d) < 1e-6) break
      u = Math.min(1, Math.max(0, u - (f(u, x1, x2) - x) / d))
    }
    return f(u, y1, y2)
  }
}
const DREAM_CURVE = bezier(0.65, 0, 0.35, 1)

const VS = 'attribute vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }'
// Stills and teasers, cover-fitted, crossfading between the outgoing (0) and current (1) project
const FS_SOURCE = `precision highp float;
  uniform vec2 uRes; uniform sampler2D uS0,uS1,uV0,uV1; uniform float uA0,uA1,uVA0,uVA1,uVid0,uVid1,uMix;
  vec2 cover(vec2 uv, float ia){ float a = uRes.x/uRes.y; vec2 s = a>ia ? vec2(1., ia/a) : vec2(a/ia, 1.); return clamp((uv-.5)*s+.5, 0., 1.); }
  void main(){
    vec2 uv = gl_FragCoord.xy/uRes; uv.y = 1.-uv.y;
    vec3 c0 = mix(texture2D(uS0, cover(uv,uA0)).rgb, texture2D(uV0, cover(uv,uVA0)).rgb, uVid0);
    vec3 c1 = mix(texture2D(uS1, cover(uv,uA1)).rgb, texture2D(uV1, cover(uv,uVA1)).rgb, uVid1);
    gl_FragColor = vec4(mix(c0, c1, uMix), 1.);
  }`
// 4× shrink as a true 4×4 box average: four bilinear taps, each averaging 2×2 source texels
const FS_DOWN = `precision highp float;
  uniform sampler2D uT; uniform vec2 uRes, uTexel;
  void main(){ vec2 uv = gl_FragCoord.xy/uRes;
    gl_FragColor = .25*(texture2D(uT, uv + uTexel*vec2(-1.,-1.)) + texture2D(uT, uv + uTexel*vec2(1.,-1.))
                      + texture2D(uT, uv + uTexel*vec2(-1., 1.)) + texture2D(uT, uv + uTexel*vec2(1., 1.))); }`
const FS_DOTS = `precision highp float;
  uniform vec2 uRes; uniform vec3 uP[5];
  uniform float uCell, uTime, uMin, uMax, uScale, uWarp, uPad, uFeather, uKeep;
  uniform vec4 uRect[${CLEAR.max}]; uniform float uRectW[${CLEAR.max}];   // centre + half size (px), weight
  uniform float uRectR[${CLEAR.max}];                                        // corner radius (px)
  uniform vec3 uP0[5]; // the old palette, held ahead of the wash front
  uniform float uOff; // page scroll (px): the dots and the colour scroll with the page (Will, 2026-10-05)
  uniform vec4 uBox, uWash; uniform vec3 uPul; // centre card: centre + half size; front, feather, push, fall (px); band width (px), strength, white per strength
  float hash(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
  float noise(vec2 p){ vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
    return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y); }
  float fbm(vec2 p){ float v=0.,a=.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.02; a*=.5; } return v; }
  vec3 pal(float t){ t = clamp(t, 0., 1.)*4.;
    vec3 c = mix(uP[0], uP[1], clamp(t, 0., 1.)); c = mix(c, uP[2], clamp(t-1., 0., 1.));
    c = mix(c, uP[3], clamp(t-2., 0., 1.)); return mix(c, uP[4], clamp(t-3., 0., 1.)); }
  vec3 pal0(float t){ t = clamp(t, 0., 1.)*4.;
    vec3 c = mix(uP0[0], uP0[1], clamp(t, 0., 1.)); c = mix(c, uP0[2], clamp(t-1., 0., 1.));
    c = mix(c, uP0[3], clamp(t-2., 0., 1.)); return mix(c, uP0[4], clamp(t-3., 0., 1.)); }
  vec3 grade(vec3 c){ float l = dot(c, vec3(.299,.587,.114)); return max(mix(vec3(l), c, 1.2), 0.); }
  float field(vec2 px){
    vec2 p = (px - .5*uRes)/uRes.y*uScale; float t = uTime*.05;
    vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2,1.3) - t));
    return smoothstep(.35, .65, fbm(p + uWarp*q + vec2(1.7,9.2) + t*1.3));
  }
  void main(){
    // px and c live on the page (scrolled); s is c on screen, for the clears and the wash
    vec2 px = gl_FragCoord.xy - vec2(0., uOff);
    vec2 c = (floor(px/uCell) + .5)*uCell;
    vec2 s = c + vec2(0., uOff);
    float v = field(c);
    // Pulse: a soft band travels out from the centre card's border (rect distance, wobbled by noise) and fades with
    // distance
    // Wash: the distance from the centre card's border, pushed by the field; k = 1 behind the front (new colour), 0 ahead
    // (old). The band rides just behind the front and fades with distance
    vec2 wq = abs(s - uBox.xy) - uBox.zw;
    float dw = max(length(max(wq, 0.)) + min(max(wq.x, wq.y), 0.), 0.) + (v - .5)*uWash.z;
    float k = 1. - smoothstep(uWash.x - uWash.y, uWash.x, dw);
    float x = (dw - (uWash.x - .3*uWash.y))/uPul.x;
    float pb = uPul.y*exp(-x*x)*exp(-dw/uWash.w);
    // 1 in the open, 0 under UI: the distance from the cell centre to each clear rect (rounded), feathered
    float open = 1.;
    for (int i = 0; i < ${CLEAR.max}; i++) {
      float rr = min(uRectR[i], min(uRect[i].z, uRect[i].w));
      vec2 q = abs(s - uRect[i].xy) - (uRect[i].zw - rr);
      float sd = length(max(q, 0.)) + min(max(q.x, q.y), 0.) - rr;
      open = min(open, mix(1., smoothstep(uPad, uPad + uFeather, sd), uRectW[i]));
    }
    float r = min(mix(uMin, uMax, v), .5)*mix(uKeep, 1., open)*uCell;
    float a = 1. - smoothstep(r - 1., r + 1., length(px - c));
    // Lit dots brighten in their own colour, in proportion to how lit they are; the crest tips towards white
    float l = pb*smoothstep(.15, .7, v);
    vec3 col = grade(mix(pal0(v), pal(v), k));
    col = mix(col*(1. + l*1.2), vec3(1.), min(l*uPul.z, ${WASH.white.toFixed(2)}));
    gl_FragColor = vec4(mix(vec3(10./255.), col, a), 1.);
  }`

let stop = () => {}

onMounted(() => {
  const el = canvas.value!
  const gl = el.getContext('webgl', { antialias: false, alpha: false })
  if (!gl) return
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches

  let W = 0, H = 0, dpr = 1
  const resize = () => {
    dpr = Math.min(devicePixelRatio, 2)
    W = el.width = Math.round(innerWidth * dpr)
    H = el.height = Math.round(innerHeight * dpr)
  }
  resize()
  addEventListener('resize', resize)

  type Prog = WebGLProgram & { u: Record<string, WebGLUniformLocation | null> }
  function program(fs: string): Prog {
    const p = gl!.createProgram()! as Prog
    for (const [type, src] of [[gl!.VERTEX_SHADER, VS], [gl!.FRAGMENT_SHADER, fs]] as const) {
      const s = gl!.createShader(type)!
      gl!.shaderSource(s, src)
      gl!.compileShader(s)
      if (!gl!.getShaderParameter(s, gl!.COMPILE_STATUS)) console.error(gl!.getShaderInfoLog(s))
      gl!.attachShader(p, s)
    }
    gl!.linkProgram(p)
    p.u = {}
    return p
  }
  const U = (p: Prog, n: string) => (n in p.u ? p.u[n] : (p.u[n] = gl.getUniformLocation(p, n)))
  function makeTex() {
    const t = gl!.createTexture()!
    gl!.bindTexture(gl!.TEXTURE_2D, t)
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, 1, 1, 0, gl!.RGBA, gl!.UNSIGNED_BYTE, new Uint8Array([10, 10, 10, 255]))
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_S, gl!.CLAMP_TO_EDGE)
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_WRAP_T, gl!.CLAMP_TO_EDGE)
    gl!.texParameteri(gl!.TEXTURE_2D, gl!.TEXTURE_MIN_FILTER, gl!.LINEAR)
    return t
  }
  // Off-screen render targets, reallocated when their size changes
  type Target = { fb: WebGLFramebuffer, tex: WebGLTexture, w: number, h: number }
  const target = (): Target => ({ fb: gl.createFramebuffer()!, tex: makeTex(), w: 0, h: 0 })
  function ensure(tg: Target, w: number, h: number) {
    w = Math.max(1, Math.ceil(w))
    h = Math.max(1, Math.ceil(h))
    if (tg.w === w && tg.h === h) return
    gl!.bindTexture(gl!.TEXTURE_2D, tg.tex)
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, w, h, 0, gl!.RGBA, gl!.UNSIGNED_BYTE, null)
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, tg.fb)
    gl!.framebufferTexture2D(gl!.FRAMEBUFFER, gl!.COLOR_ATTACHMENT0, gl!.TEXTURE_2D, tg.tex, 0)
    tg.w = w
    tg.h = h
  }
  function into(tg: Target | null) {
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, tg ? tg.fb : null)
    gl!.viewport(0, 0, tg ? tg.w : W, tg ? tg.h : H)
  }
  const tri = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, tri)
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW)
  function fullscreen(p: Prog) {
    const a = gl!.getAttribLocation(p, 'a')
    gl!.bindBuffer(gl!.ARRAY_BUFFER, tri)
    gl!.enableVertexAttribArray(a)
    gl!.vertexAttribPointer(a, 2, gl!.FLOAT, false, 0, 0)
    gl!.drawArrays(gl!.TRIANGLES, 0, 3)
  }
  function bind(p: Prog, name: string, t: WebGLTexture, unit: number) {
    gl!.activeTexture(gl!.TEXTURE0 + unit)
    gl!.bindTexture(gl!.TEXTURE_2D, t)
    gl!.uniform1i(U(p, name), unit)
  }

  const pSrc = program(FS_SOURCE), pDown = program(FS_DOWN), pDots = program(FS_DOTS)
  const src = target(), mid = target(), low = target()

  // Two slots: [0] the outgoing project, [1] the current one. Each has its still and, if any, its live teaser.
  type Slot = { still: WebGLTexture, stillA: number, video: HTMLVideoElement | null, vid: WebGLTexture, vidA: number, on: number }
  const slot = (): Slot => ({ still: makeTex(), stillA: 1, video: null, vid: makeTex(), vidA: 1, on: 0 })
  let slots: [Slot, Slot] = [slot(), slot()]
  let mix = 1

  function clear(s: Slot) {
    if (s.video) {
      s.video.pause()
      s.video.removeAttribute('src')
      s.video.load()
    }
    s.video = null
    s.on = 0
  }
  function load(s: Slot, p: NonNullable<typeof props.project>) {
    clear(s)
    s.stillA = 1
    gl!.bindTexture(gl!.TEXTURE_2D, s.still)
    gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, 1, 1, 0, gl!.RGBA, gl!.UNSIGNED_BYTE, new Uint8Array([10, 10, 10, 255]))
    const img = new Image()
    img.onload = () => {
      if (slots[1] !== s && slots[0] !== s) return
      gl!.bindTexture(gl!.TEXTURE_2D, s.still)
      gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, img)
      s.stillA = img.width / img.height
    }
    img.src = p.poster
    // Reduced motion: the strip plays no teasers, so the palette comes from the still alone
    if (!p.teaser || p.teaser.endsWith('.gif') || reduced) return
    const v = document.createElement('video')
    v.muted = true
    v.loop = true
    v.playsInline = true
    v.crossOrigin = 'anonymous' // R2 sends Access-Control-Allow-Origin: *; without it the frames can't be read
    v.preload = 'auto'
    // Its own cache key: R2's no-CORS responses carry no Vary: Origin, so the strip's (or an old visit's) cached
    // no-CORS copy would otherwise be reused and fail the CORS check
    v.src = `${p.teaser}?cors`
    v.play().catch(() => {})
    s.video = v
  }
  function show(p: typeof props.project) {
    if (!p) return
    if (mix >= 0.5) slots = [slots[1], slots[0]]
    load(slots[1], p)
    mix = 0
  }
  const unwatch = watch(() => props.project, show)
  show(props.project)
  mix = 1 // the first project appears without a crossfade

  // Palette: every 150ms the 1/32 frame is reduced to 5 stops — four luminance quartiles (each a saturation-weighted
  // mean, so a small strong colour isn't averaged into grey) and the most saturated 15% as the accent at stop 4.
  // Auto-level: the lightest stop is scaled to ~0.85 luminance (×0.7–2.2). Stops ease with the palette time constant.
  const cur = new Float32Array(15).fill(0.1), old = new Float32Array(15).fill(0.1), tgt = new Float32Array(15).fill(0.1), pre = new Float32Array(15).fill(0.1)
  let since = COLOUR.readback, first = true
  let pixels = new Uint8Array(0)
  function extract() {
    const n = low.w * low.h
    if (pixels.length !== n * 4) pixels = new Uint8Array(n * 4)
    gl!.bindFramebuffer(gl!.FRAMEBUFFER, low.fb)
    gl!.readPixels(0, 0, low.w, low.h, gl!.RGBA, gl!.UNSIGNED_BYTE, pixels)
    const px: { c: number[], l: number, s: number }[] = []
    for (let k = 0; k < n; k++) {
      const r = pixels[k * 4]! / 255, g = pixels[k * 4 + 1]! / 255, b = pixels[k * 4 + 2]! / 255
      const mx = Math.max(r, g, b), mn = Math.min(r, g, b)
      px.push({ c: [r, g, b], l: 0.299 * r + 0.587 * g + 0.114 * b, s: mx > 0.02 ? (mx - mn) / mx : 0 })
    }
    const mean = (list: typeof px, w: (q: (typeof px)[number]) => number) => {
      const m = [0, 0, 0]
      let ws = 0
      for (const q of list) {
        const x = w(q)
        ws += x
        for (let c = 0; c < 3; c++) m[c]! += q.c[c]! * x
      }
      return m.map(v => v / (ws || 1))
    }
    px.sort((a, z) => a.l - z.l)
    const q = [0, 1, 2, 3].map(k => mean(px.slice(Math.floor(k * n / 4), Math.floor((k + 1) * n / 4)), x => (0.15 + x.s) ** 2))
    const accent = mean([...px].sort((a, z) => z.s - a.s).slice(0, Math.max(1, Math.floor(n * 0.15))), x => x.s * x.s + 1e-4)
    const top = 0.299 * q[3]![0]! + 0.587 * q[3]![1]! + 0.114 * q[3]![2]!
    // the spec's auto-level, then scaled uniformly to the Bright setting
    // Monochrome palettes run darker (Will, 2026-10-04): the quartiles' mean saturation scales the level from
    // ×MONO (grey) up to ×1 (colourful). The accent stays in, so Monolith's red still shows.
    const sat = q.reduce((t, c) => {
      const mx = Math.max(...c), mn = Math.min(...c)
      return t + (mx > 0.02 ? (mx - mn) / mx : 0) / 4
    }, 0)
    const mono = MONO + (1 - MONO) * Math.min(1, Math.max(0, (sat - 0.08) / 0.22))
    const lift = Math.min(2.2, Math.max(0.7, 0.85 / Math.max(top, 0.01))) * visuals.value.level / 0.85 * mono
    ;[q[0]!, q[1]!, q[2]!, accent, q[3]!].forEach((c, k) => tgt.set(c.map(v => Math.min(1, v * lift)), k * 3))
  }

  const rects = new Float32Array(CLEAR.max * 4), weights = new Float32Array(CLEAR.max), radii = new Float32Array(CLEAR.max)
  let t = 0, last = performance.now(), raf = 0
  let washAt = -1, washEase = 1 // the step the wash belongs to, how far it has travelled (0–1)
  function frame(now: number) {
    const dt = Math.min(0.1, (now - last) / 1000)
    last = now

    // DREAM: the band runs through the curve; zoom blends in log space, the rest linearly
    const d = DREAM_CURVE(dream.value)
    const OFF = visuals.value
    const scale = OFF.scale * (FULL.scale / OFF.scale) ** d
    const warp = OFF.warp + (FULL.warp - OFF.warp) * d
    const speed = OFF.speed + (FULL.speed - OFF.speed) * d
    if (!reduced) t += dt * speed // reduced motion: a still field; the palette still follows the project

    // With the wash the teaser (the palette's source) crossfades in half its time; reduced motion keeps the plain fade
    mix = Math.min(1, mix + dt / (reduced ? COLOUR.crossfade : WASH.ms / 2000))
    if (mix >= 1 && slots[0].video) clear(slots[0])
    for (const s of slots) {
      const ready = !!s.video && s.video.readyState >= 2
      if (ready) {
        gl!.bindTexture(gl!.TEXTURE_2D, s.vid)
        gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, s.video!)
        s.vidA = s.video!.videoWidth / s.video!.videoHeight
      }
      s.on += ((ready ? 1 : 0) - s.on) * (1 - Math.exp(-dt * COLOUR.videoFade))
    }

    // source → mid → low
    ensure(src, W / 2, H / 2)
    ensure(mid, src.w / 4, src.h / 4)
    ensure(low, mid.w / 4, mid.h / 4)
    into(src)
    gl!.useProgram(pSrc)
    bind(pSrc, 'uS0', slots[0].still, 0)
    bind(pSrc, 'uS1', slots[1].still, 1)
    bind(pSrc, 'uV0', slots[0].vid, 2)
    bind(pSrc, 'uV1', slots[1].vid, 3)
    gl!.uniform2f(U(pSrc, 'uRes'), src.w, src.h)
    const f: [string, number][] = [['uA0', slots[0].stillA], ['uA1', slots[1].stillA], ['uVA0', slots[0].vidA],
      ['uVA1', slots[1].vidA], ['uVid0', slots[0].on], ['uVid1', slots[1].on], ['uMix', 1 - (1 - mix) ** 3]]
    for (const [n, v] of f) gl!.uniform1f(U(pSrc, n), v)
    fullscreen(pSrc)
    for (const [from, to] of [[src, mid], [mid, low]] as const) {
      into(to)
      gl!.useProgram(pDown)
      bind(pDown, 'uT', from.tex, 0)
      gl!.uniform2f(U(pDown, 'uRes'), to.w, to.h)
      gl!.uniform2f(U(pDown, 'uTexel'), 1 / from.w, 1 / from.h)
      fullscreen(pDown)
    }

    if ((since += dt) >= COLOUR.readback) {
      since = 0
      extract()
      if (first) {
        cur.set(tgt)
        pre.set(tgt)
        old.set(tgt)
        first = false
      }
    }
    // A short ease takes the edge off each new reading, a second one carries the colour; together they move within
    // a frame or two of the change but never jump
    const ea = 1 - Math.exp(-dt / COLOUR.pre), eb = 1 - Math.exp(-dt / COLOUR.ease)
    for (let k = 0; k < 15; k++) {
      pre[k]! += (tgt[k]! - pre[k]!) * ea
      cur[k]! += (pre[k]! - cur[k]!) * eb
    }

    // Clear rects, in drawing-buffer pixels with y up; weight follows the element's opacity (the HUD fades)
    rects.fill(0)
    weights.fill(0)
    radii.fill(0)
    let k = 0
    for (const node of document.querySelectorAll<HTMLElement>('[data-dot-clear]')) {
      if (k >= CLEAR.max) break
      const b = node.getBoundingClientRect()
      if (!b.width || !b.height) continue
      const cs = getComputedStyle(node)
      if (cs.visibility === 'hidden') continue
      rects.set([(b.left + b.width / 2) * dpr, (innerHeight - b.top - b.height / 2) * dpr, b.width / 2 * dpr, b.height / 2 * dpr], k * 4)
      // The element's corner radius, or its glass layer's (HugBox draws its plate on a child)
      const rad = parseFloat(cs.borderTopLeftRadius) || parseFloat(node.firstElementChild ? getComputedStyle(node.firstElementChild).borderTopLeftRadius : '') || 0
      radii[k] = rad * dpr
      weights[k++] = parseFloat(cs.opacity)
    }

    into(null)
    gl!.useProgram(pDots)
    gl!.uniform4fv(U(pDots, 'uRect'), rects)
    gl!.uniform1fv(U(pDots, 'uRectW'), weights)
    gl!.uniform1fv(U(pDots, 'uRectR'), radii)
    gl!.uniform1f(U(pDots, 'uPad'), CLEAR.pad * dpr)
    gl!.uniform1f(U(pDots, 'uFeather'), CLEAR.feather * dpr)
    gl!.uniform1f(U(pDots, 'uKeep'), CLEAR.keep)
    gl!.uniform3fv(U(pDots, 'uP'), cur)
    gl!.uniform2f(U(pDots, 'uRes'), W, H)
    gl!.uniform1f(U(pDots, 'uOff'), scrollY * dpr)
    const g: [string, number][] = [['uCell', visuals.value.cell * dpr], ['uTime', t], ['uMin', visuals.value.dmin], ['uMax', visuals.value.dmax],
      ['uScale', scale], ['uWarp', warp]]
    for (const [n, v] of g) gl!.uniform1f(U(pDots, n), v)
    // Wash: on each step the held palette becomes what the outside shows now (part-way if a wave was still running)
    const pl = props.pulse, card = !reduced && pl?.el.isConnected ? pl.el : null
    if (pl && pl.at !== washAt) {
      const p = washAt < 0 ? 1 : washEase
      for (let k = 0; k < 15; k++) old[k]! += (cur[k]! - old[k]!) * p
      washAt = pl.at
    }
    const wa = card ? Math.min(1, (now - pl!.at) / WASH.ms) : 1
    washEase = 1 - (1 - wa) ** 2
    const b = wa < 1 ? card!.getBoundingClientRect() : null
    const far = b ? Math.hypot(Math.max(b.left, innerWidth - b.right), Math.max(b.top, innerHeight - b.bottom)) : 1
    gl!.uniform3fv(U(pDots, 'uP0'), old)
    gl!.uniform4f(U(pDots, 'uBox'), b ? (b.left + b.width / 2) * dpr : 0, b ? (innerHeight - b.top - b.height / 2) * dpr : 0, b ? b.width / 2 * dpr : 0, b ? b.height / 2 * dpr : 0)
    gl!.uniform4f(U(pDots, 'uWash'), b ? washEase * (far + WASH.feather + WASH.push / 2) * dpr : 1e6, WASH.feather * dpr, WASH.push * dpr, far * WASH.fall * dpr)
    gl!.uniform3f(U(pDots, 'uPul'), WASH.w * dpr, b ? WASH.amp * Math.sin(Math.PI * wa ** 0.6) ** 1.2 : 0, WASH.white / WASH.amp)
    fullscreen(pDots)

    raf = requestAnimationFrame(frame)
  }
  raf = requestAnimationFrame(frame)

  // A lost context leaves the page colour showing
  const onLost = () => cancelAnimationFrame(raf)
  el.addEventListener('webglcontextlost', onLost)
  stop = () => {
    cancelAnimationFrame(raf)
    unwatch()
    slots.forEach(clear)
    removeEventListener('resize', resize)
    el.removeEventListener('webglcontextlost', onLost)
  }
})
onBeforeUnmount(() => stop())
</script>

<template>
  <canvas ref="canvas" class="dot-field" aria-hidden="true" />
</template>

<style scoped>
.dot-field {
  position: absolute;
  inset: 0;
  z-index: -1;
  width: 100%;
  height: 100%;
  display: block;
}
</style>
