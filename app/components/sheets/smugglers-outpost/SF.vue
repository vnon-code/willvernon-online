<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SoCredits from './SoCredits.vue'
import { SO, SO2, SO_PLACE } from './story'

// PROTOTYPE SF "Prompt to pixels" (overnight run, Smuggler's Outpost r3 challenger).
// Refs: the inline-image headline (thumbnails set into the line of type, an Awwwards staple); Obys Agency's
// scroll-driven project carousel (one of Will's keepers) and the Awwwards Creative Pass horizontal-scroll elements
// (Oscar Bravo, Tim Dunk) for the build; VFX breakdown frames that split one shot into its passes (BlenderNation
// environment breakdowns) for the viewport.
// Beats, each its own device: the final prompt as the headline, a crop of the render set after each phrase it became
// (the shot split three ways, solid | wireframe | render, sits above it) → the build as a horizontal track that pans as you scroll down (a swipe rail on phones), red snags on the frames
// where problems were met → the four shots as a 2×2
// with the slate. The track only moves transforms, on a scroll timeline that attaches once the Sheet is open.
// PLACEHOLDER: every size, the panel order, the copy.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
defineExpose({ close: () => shell.value?.close() })
void props

const B = '/proto-media/smugglers-outpost/'

// The prompt cut into runs; a crop of the render follows each phrase it became
const segs: { t: string, chip?: typeof SO_PLACE[number]['r'] }[] = []
let rest = SO.prompt
for (const [i, l] of SO_PLACE.entries()) {
  const t = i === 3 ? 'shifting dunes' : l.phrase
  const at = rest.indexOf(t)
  if (at < 0) continue
  segs.push({ t: rest.slice(0, at + t.length) })
  segs.push({ t: '', chip: l.r })
  rest = rest.slice(at + t.length)
}
if (rest) segs.push({ t: rest })

const dust = { src: `${B}x-dust.webp`, w: 1092, h: 537, alt: 'Volumetric dust drifting through the canyon, a Blender render' }
const steps = [
  { k: 'Prompts', v: 'Three base models, six checkpoints. The wording mattered most.', m: SO2.pages.generations },
  { k: 'Concept', v: 'One of four became the base.', s: 'Inpainting a landing pad looked disconnected.', m: SO2.concept },
  { k: 'Terrain', v: 'Displacement and colour ramps.', m: SO2.pages.terrain },
  { k: 'Cliffs', v: 'Sculpted, twice, to learn it.', m: SO2.pages.cliffs },
  { k: 'Measure', v: 'Measured over the concept in Photoshop.', s: 'Object scaling.', m: SO2.pages.measure },
  { k: 'Building', v: 'Arch, windows, roof.', s: 'The arch failed until inset plus bevel.', m: SO2.pages.arch },
  { k: 'Air', v: 'A procedural sandstorm and volumetric dust.', s: 'Good desert HDRIs were hard to find.', m: dust },
  { k: 'Camera', v: 'Depth of field hides the modelling flaws.', s: 'Stretched UVs and slow renders.', m: SO2.pages.camera },
] as { k: string, v: string, s?: string, m: { src: string, w: number, h: number, alt: string } }[]
// Panel width as a share of the stage, and how far the track pans to bring the last panel in
const PANEL = 56
const pan = `${(-(1 - 100 / (steps.length * PANEL)) * 100).toFixed(2)}%`

const passes = [
  { k: 'Solid', src: `${B}vp-solid.webp`, w: 1504, h: 666, alt: 'The shot in Blender, solid shading' },
  { k: 'Wireframe', src: `${B}vp-wire.webp`, w: 1504, h: 666, alt: 'The same shot, wireframe' },
  { k: 'Render', src: `${B}vp-render.webp`, w: 1204, h: 533, alt: 'The same shot, rendered: the outpost and the ornithopter in sand haze' },
]
const outro = 'The sound is an ornithopter start-up and Tibetan horns, after Mark Mangini\'s Dune interview. Noise drives the camera shake.'
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <!-- Lead: the shot split into its three viewport passes, then the prompt as the headline, each phrase followed
         by the crop of the render it became -->
    <section class="hd" data-sheet-body data-sheet-block="lead">
      <div data-build>
        <div class="bd__frame">
          <img
            v-for="(p, i) in passes"
            :key="p.k"
            class="bd__img"
            :class="`bd__img--${i}`"
            :src="p.src"
            :alt="p.alt"
            :width="p.w"
            :height="p.h"
            decoding="async"
          >
          <span v-for="(p, i) in passes" :key="p.k" class="bd__tag" :class="`bd__tag--${i}`" aria-hidden="true">
            {{ String(i + 1).padStart(2, '0') }} {{ p.k }}
          </span>
        </div>
        <div class="hd__in txt">
          <p class="sf__k">
            {{ SO.title }} <span>· {{ SO.meta[0]!.v }} · {{ SO.meta[1]!.v }}</span>
          </p>
          <p class="hd__pivot">
            <s>Lore Keeper's Vault</s> Smuggler's Outpost
          </p>
          <!-- One line on purpose: Vue would turn line breaks into spaces before the commas -->
          <!-- eslint-disable-next-line vue/singleline-html-element-content-newline, vue/multiline-html-element-content-newline -->
          <h2 class="hd__prompt">“<template v-for="(g, i) in segs" :key="i"><img v-if="g.chip" class="hd__chip" :src="g.chip.src" :alt="g.chip.alt" width="96" height="72" decoding="async"><template v-else>{{ g.t }}</template></template>”</h2>
          <p class="sf__text hd__foot">
            The final Stable Diffusion prompt, and what each phrase became in Blender. I learned 3D from scratch for it.
          </p>
        </div>
      </div>
    </section>

    <!-- 01 The build: a track that pans sideways as the page scrolls down -->
    <section class="tk" data-sheet-block="build" aria-label="The build, prompt to render">
      <div class="tk__run">
        <div class="tk__stage">
          <div class="tk__head">
            <p class="sf__count">
              <b>01</b> Prompt to pixels
            </p>
            <p class="sf__text">
              From concept to camera. Problems met are in red.
            </p>
          </div>
          <ol class="tk__rail" tabindex="0" aria-label="Build steps" :style="{ '--n': steps.length, '--pan': pan, '--panel': `${PANEL}%` }">
            <li v-for="(s, i) in steps" :key="s.k" class="tk__card">
              <img :src="s.m.src" :alt="s.m.alt" :width="s.m.w" :height="s.m.h" loading="lazy" decoding="async">
              <div class="tk__cap">
                <p class="tk__name">
                  <b>{{ String(i + 1).padStart(2, '0') }}</b> {{ s.k }}
                </p>
                <p class="sf__text">
                  {{ s.v }}
                </p>
                <p v-if="s.s" class="tk__snag">
                  <strong>Snag</strong> {{ s.s }}
                </p>
              </div>
            </li>
          </ol>
          <div class="tk__bar" aria-hidden="true">
            <i />
          </div>
        </div>
      </div>
    </section>

    <!-- 02 Outcome: the four shots, 2×2, and the slate -->
    <section class="oc" data-sheet-block="outcome" aria-label="Outcome">
      <div class="oc__grid">
        <figure v-for="(m, i) in SO2.renders" :key="m.src">
          <img :src="m.src" :alt="m.alt" :width="m.w" :height="m.h" loading="lazy" decoding="async">
          <figcaption><b>{{ String(i + 1).padStart(2, '0') }}</b> {{ m.cap }}</figcaption>
        </figure>
      </div>
      <div class="oc__slate">
        <p class="sf__count">
          <b>02</b> Outcome
        </p>
        <dl class="oc__specs">
          <div v-for="s in SO.outcome.specs" :key="s.k">
            <dt>{{ s.k }}</dt>
            <dd>{{ s.v }}</dd>
          </div>
        </dl>
        <div class="txt">
          <p class="sf__text">
            {{ outro }}
          </p>
          <p class="tk__snag">
            <strong>Snag</strong> No clear roadmap. Next time I would move to 3D sooner.
          </p>
        </div>
      </div>
    </section>

    <SoCredits />
  </SheetShell>
</template>

<style scoped>
.sf__k {
  margin: 0 0 14px;
  font: 500 12px/1.4 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-fg);
}

.sf__k span {
  color: var(--muted);
}

.sf__count {
  margin: 0;
  font: 500 12px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.sf__count b {
  margin-right: 8px;
  font-size: 24px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--c-accent);
}

.sf__text {
  margin: 0;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

img {
  display: block;
  width: 100%;
  height: auto;
}

/* Lead: fades in a beat after the shell's build */
.hd {
  animation: sf-in 300ms cubic-bezier(0.23, 1, 0.32, 1) 360ms both;
}

@keyframes sf-in {
  from { opacity: 0; }
}

.hd__in {
  padding: 32px 24px 36px;
  border-top: 1px solid var(--rule);
}

.hd__pivot {
  margin: 0 0 14px;
  font: 600 15px/1.2 var(--font-ui);
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.hd__pivot s {
  margin-right: 10px;
  color: var(--muted);
  text-decoration: line-through 2px var(--c-accent);
}

.hd__prompt {
  max-width: 30ch;
  margin: 0;
  font: 600 clamp(26px, 3.5vw, 44px)/1.25 var(--font-ui);
  letter-spacing: -0.02em;
}

/* A crop of the render, set into the line after its phrase */
.hd__prompt .hd__chip {
  display: inline-block;
  width: 1.9em;
  height: 1.2em;
  margin: 0 0.12em 0 0.22em;
  vertical-align: -0.2em;
  object-fit: cover;
  border: 1px solid var(--c-accent);
  border-radius: 0.3em;
}

.hd__foot {
  max-width: 60ch;
  margin-top: 22px;
}

/* 01 The build. Base (phones, or no scroll timelines): a swipe rail that snaps panel by panel. */
.tk {
  border-top: 1px solid var(--rule);
}

.tk__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.6fr);
  gap: 12px 24px;
  align-items: baseline;
  padding: 24px;
}

.tk__rail {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: 84%;
  gap: 1px;
  margin: 0;
  padding: 0;
  list-style: none;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  background: var(--rule);
  border-top: 1px solid var(--rule);
  outline-offset: -3px;
}

.tk__rail::-webkit-scrollbar {
  display: none;
}

.tk__card {
  scroll-snap-align: start;
  background: var(--c-bg);
}

.tk__card img {
  aspect-ratio: 16 / 10;
  object-fit: cover;
  background: #000;
}

.tk__cap {
  padding: 14px 16px 20px;
}

.tk__name {
  margin: 0 0 6px;
  font: 600 18px/1.25 var(--font-ui);
}

.tk__name b,
.oc figcaption b {
  margin-right: 8px;
  font-variant-numeric: tabular-nums;
  color: var(--c-accent);
}

.tk__snag {
  margin: 10px 0 0;
  font: 400 14px/1.5 var(--font-ui);
  color: var(--c-fg);
}

.tk__snag strong {
  margin-right: 6px;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--c-accent);
}

.tk__bar {
  display: none;
}

/* Desktop with scroll timelines: the stage pins under the header and the track pans across it */
@supports (animation-timeline: view()) {
  @media (min-width: 721px) {
    .tk__run {
      height: calc(var(--view-h) + 260svh);
      view-timeline: --tk block;
      view-timeline-inset: var(--header-h) 0;
    }

    .tk__stage {
      position: sticky;
      top: -16px; /* the layer's padding (header + 16px) deflates the sticky rect: -16px pins it just under the header */
      display: grid;
      grid-template-rows: auto auto auto;
      align-content: center;
      height: var(--view-h);
      overflow: clip;
    }

    .tk__rail {
      grid-auto-columns: calc(100% / var(--n));
      width: calc(var(--n) * var(--panel));
      overflow: visible;
      scroll-snap-type: none;
      border-top: 0;
      border-block: 1px solid var(--rule);
    }

    .tk__bar {
      display: block;
      height: 2px;
      background: var(--rule);
    }

    .tk__bar i {
      display: block;
      height: 100%;
      background: var(--c-accent);
      transform: scaleX(0);
      transform-origin: left;
    }

    /* Attached only once the Sheet is open: during the grow or the fold a scroll timeline re-resolves every frame */
    html[data-sheet='open'] .tk__rail,
    html[data-sheet='open'] .tk__bar i {
      animation-timing-function: linear;
      animation-fill-mode: both;
      animation-timeline: --tk;
      animation-range: contain 0% contain 100%;
    }

    html[data-sheet='open'] .tk__rail { animation-name: sf-pan; }
    html[data-sheet='open'] .tk__bar i { animation-name: sf-bar; }
  }
}

@keyframes sf-pan {
  to { transform: translateX(var(--pan)); }
}

@keyframes sf-bar {
  to { transform: scaleX(1); }
}

/* 02 One camera, three bands: each image is clipped to its third (no filters, nothing animates) */
.bd__frame {
  position: relative;
  aspect-ratio: 1504 / 666;
  overflow: hidden;
  background: #000;
}

.bd__img {
  position: absolute;
  inset: 0;
  height: 100%;
  object-fit: cover;
}

.bd__img--0 { clip-path: inset(0 66.67% 0 0); }
.bd__img--1 { clip-path: inset(0 33.33% 0 33.33%); }
.bd__img--2 { clip-path: inset(0 0 0 66.67%); }

.bd__frame::before,
.bd__frame::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 1;
  width: 2px;
  margin-left: -1px;
  background: var(--c-accent);
}

.bd__frame::before { left: 33.33%; }
.bd__frame::after { left: 66.67%; }

.bd__tag {
  position: absolute;
  top: 10px;
  z-index: 1;
  padding: 4px 8px;
  font: 500 11px/1.3 var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--c-fg);
  background: var(--c-bg);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 6px;
}

.bd__tag--0 { left: 10px; }
.bd__tag--1 { left: calc(33.33% + 10px); }
.bd__tag--2 { left: calc(66.67% + 10px); }

/* 03 Outcome */
.oc {
  border-top: 1px solid var(--rule);
}

.oc__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1px;
  background: var(--rule);
}

.oc figure {
  position: relative;
  margin: 0;
  background: #000;
}

.oc figure img {
  aspect-ratio: 16 / 9;
  object-fit: cover;
}

.oc figcaption {
  position: absolute;
  left: 10px;
  bottom: 10px;
  padding: 4px 8px;
  font: 500 11px/1.3 var(--font-ui);
  letter-spacing: 0.04em;
  color: var(--c-fg);
  background: var(--c-bg);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 6px;
}

.oc__slate {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) minmax(0, 1.2fr);
  gap: 20px 32px;
  align-items: start;
  padding: 28px 24px;
  border-top: 1px solid var(--rule);
}

.oc__specs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  margin: 0;
  border: 1px solid var(--rule);
  border-radius: 8px;
}

.oc__specs div {
  padding: 10px 14px 12px;
}

.oc__specs div:nth-child(even) {
  border-left: 1px solid var(--rule);
}

.oc__specs div:nth-child(n + 3) {
  border-top: 1px solid var(--rule);
}

.oc__specs dt {
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.oc__specs dd {
  margin: 6px 0 0;
  font: 600 18px/1.2 var(--font-ui);
  font-variant-numeric: tabular-nums;
}

@media (prefers-reduced-motion: reduce) {
  .hd { animation-duration: 1ms; }
}

@media (max-width: 720px) {
  /* The right padding keeps body copy clear of the shell's floating close button on phones */
  .hd__in {
    padding: 26px 52px 28px 16px;
  }

  .hd__prompt {
    font-size: 25px;
  }

  .tk__head,
  .oc__slate {
    grid-template-columns: minmax(0, 1fr);
    padding: 22px 52px 22px 16px;
  }

  .bd__frame {
    aspect-ratio: 4 / 3;
  }

  .bd__tag {
    top: 6px;
    padding: 3px 5px;
    font-size: 10px;
  }

  .bd__tag--0 { left: 4px; }
  .bd__tag--1 { left: calc(33.33% + 4px); }
  .bd__tag--2 { left: calc(66.67% + 4px); }

  .oc__grid {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
