<script setup lang="ts">
import type { SheetOpen } from '~/types/project'
import SheetShell from '~/components/SheetShell.vue'
import SoCredits from './SoCredits.vue'
import { SO } from './story'

// PROTOTYPE SB "Process book" (overnight run, Smuggler's Outpost r1). The Sheet reads like the 117-page process book
// it came from, cut down.
// Refs: Obys case studies (editorial pacing, big quiet type between media); Aristide Benoist (a teaser reel that opens
// the page, here in cinemascope); printed process books and their contents pages.
// Beats, each with its own device: the viewport film in a cinemascope band under the hero → a colophon (title, meta
// in columns) → contents with page ranges that jump to each chapter → Concept: an open spread of two pages, the models
// as a table, the final prompt as a pull quote → Build: plates, each page with its number in the margin → Will's own
// line as a full-width quote → Atmosphere: five pages stacked that fan out as they scroll in → problems as footnotes
// → the film with a sound toggle and the four renders. PLACEHOLDER: every size, the fan, the copy.
const props = defineProps<{ sheet: SheetOpen }>()
defineEmits<{ close: [] }>()
const shell = ref<InstanceType<typeof SheetShell>>()
defineExpose({ close: () => shell.value?.close() })
void props

const toc = [
  { id: 'sb-concept', k: 'Concept', pp: '39–64' },
  { id: 'sb-build', k: 'Build', pp: '66–92' },
  { id: 'sb-air', k: 'Atmosphere', pp: '93–103' },
  { id: 'sb-notes', k: 'Problems', pp: 'crit' },
  { id: 'sb-out', k: 'Outcome', pp: '105–116' },
]
const page = (src: string) => Number(src.match(/p(\d+)\.webp/)?.[1] ?? 0)
function go(id: string) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  document.getElementById(id)?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
}

const film = ref<HTMLElement>()
const loud = ref(false)
function sound() {
  const v = film.value?.querySelector('video')
  if (!v) return
  loud.value = !loud.value
  v.muted = !loud.value
  if (loud.value) v.play().catch(() => {})
}
</script>

<template>
  <SheetShell ref="shell" :sheet="sheet" @close="$emit('close')">
    <!-- Lead: the viewport in cinemascope, then the colophon -->
    <section class="ld" data-sheet-body data-sheet-block="lead">
      <div data-build>
        <div class="cine">
          <figure class="pic cine__pic">
            <img v-for="(m, i) in [SO.render, SO.solid, SO.wire]" :key="m.src" :src="m.src" :alt="i === 0 ? m.alt : ''" :style="{ '--i': i }" decoding="async">
          </figure>
          <p class="cine__cap">
            Solid · wireframe · render
          </p>
        </div>
        <div class="col">
          <h2 class="col__title">
            {{ SO.title }}
          </h2>
          <p class="col__hook">
            {{ SO.hook }} <span>{{ SO.intro }}</span>
          </p>
          <dl class="col__meta">
            <div v-for="c in SO.meta" :key="c.k">
              <dt>{{ c.k }}</dt>
              <dd>{{ c.v }}</dd>
            </div>
          </dl>
        </div>
      </div>
    </section>

    <!-- Contents -->
    <nav class="toc" data-sheet-block="contents" aria-label="Contents">
      <p class="sb__k">
        Contents
      </p>
      <ol class="toc__list">
        <li v-for="(c, i) in toc" :key="c.id">
          <a :href="`#${c.id}`" @click.prevent="go(c.id)">
            <b>{{ ['I', 'II', 'III', 'IV', 'V'][i] }}</b>
            <span class="toc__k">{{ c.k }}</span>
            <span class="toc__dots" aria-hidden="true" />
            <span class="toc__pp">{{ c.pp === 'crit' ? 'crit' : `pp. ${c.pp}` }}</span>
          </a>
        </li>
      </ol>
    </nav>

    <!-- I Concept: a spread, the models table, the prompt as a pull quote -->
    <section id="sb-concept" class="ch" data-sheet-block="concept" aria-label="Concept">
      <header class="ch__head">
        <p class="sb__k">
          I · Concept
        </p>
        <p class="sb__text">
          {{ SO.promptText }}
        </p>
      </header>
      <div class="spread">
        <figure v-for="m in SO.aiPages.slice(1, 3)" :key="m.src" class="spread__page">
          <SheetPic :m="m" />
          <figcaption>p. {{ page(m.src) }} · {{ m.caption }}</figcaption>
        </figure>
      </div>
      <div class="mt">
        <p class="sb__text">
          {{ SO.modelsText }}
        </p>
        <table class="mt__table">
          <caption class="sb__k">
            Models tested
          </caption>
          <tbody>
            <tr>
              <th scope="row">
                Base models
              </th>
              <td>{{ SO.models.join(' · ') }}</td>
            </tr>
            <tr>
              <th scope="row">
                Checkpoints
              </th>
              <td>{{ SO.checkpoints.join(' · ') }}</td>
            </tr>
            <tr>
              <th scope="row">
                Finding
              </th>
              <td>Similar results; the prompt's wording mattered most.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <blockquote class="pq">
        <p>“{{ SO.prompt }}”</p>
        <footer>The final prompt, p. 60</footer>
      </blockquote>
      <figure class="spread__one">
        <SheetPic :m="SO.pick.m" />
        <figcaption>p. 64 · {{ SO.pick.text }}</figcaption>
      </figure>
    </section>

    <!-- II Build: plates with page numbers in the margin -->
    <section id="sb-build" class="ch" data-sheet-block="build" aria-label="Build">
      <header class="ch__head">
        <p class="sb__k">
          II · Build
        </p>
        <p class="sb__text">
          Blender, from scratch. Each part was a first.
        </p>
      </header>
      <ol class="pl">
        <li v-for="b in SO.build" :key="b.k" class="pl__row">
          <span class="pl__no">p. {{ page(b.m.src) }}</span>
          <SheetPic :m="b.m" />
          <p><b>{{ b.k }}</b>{{ b.v }}</p>
        </li>
      </ol>
      <SheetPic class="pl__vp" :m="SO.viewport" cap />
    </section>

    <!-- Will's line -->
    <blockquote class="wq" data-sheet-block="quote">
      <p>“{{ SO.quote }}”</p>
    </blockquote>

    <!-- III Atmosphere: a stack of pages that fans out -->
    <section id="sb-air" class="ch" data-sheet-block="atmosphere" aria-label="Atmosphere">
      <header class="ch__head">
        <p class="sb__k">
          III · Atmosphere
        </p>
        <p class="sb__text">
          Five layers of air over the scene.
        </p>
      </header>
      <div class="fan">
        <div class="fan__stack">
          <SheetPic v-for="(a, i) in SO.air" :key="a.k" class="fan__page" :m="a.m" :style="{ '--i': i }" />
        </div>
        <ol class="fan__list">
          <li v-for="(a, i) in SO.air" :key="a.k">
            <b>{{ pad(i) }}</b><span><em>{{ a.k }}</em> {{ a.v }}</span>
          </li>
        </ol>
      </div>
    </section>

    <!-- IV Problems: footnotes -->
    <section id="sb-notes" class="fn" data-sheet-block="problems" aria-label="Problems met">
      <p class="sb__k">
        IV · Problems, as footnotes
      </p>
      <ol class="fn__list">
        <li v-for="x in SO.problems" :key="x.p">
          {{ x.p }} <span v-if="x.f">{{ x.f }}</span>
        </li>
      </ol>
    </section>

    <!-- V Outcome: the film with sound, the renders -->
    <section id="sb-out" class="oc" data-sheet-block="outcome" aria-label="Outcome">
      <header class="ch__head">
        <p class="sb__k">
          V · Outcome
        </p>
        <p class="sb__text">
          {{ SO.outcome.text }}
        </p>
      </header>
      <div ref="film" class="oc__film">
        <SheetPic :m="SO.film" />
        <button type="button" class="oc__sound" :aria-pressed="loud" @click="sound">
          {{ loud ? 'Sound off' : 'Play with sound' }}
        </button>
      </div>
      <div class="oc__plates">
        <figure v-for="(m, i) in SO.outcome.renders" :key="m.src" class="oc__plate">
          <SheetPic :m="m" />
          <figcaption><b>{{ i + 1 }}</b> {{ m.caption }}</figcaption>
        </figure>
      </div>
      <p class="sb__text oc__after">
        {{ SO.outcome.after }}
      </p>
    </section>

    <SoCredits />
  </SheetShell>
</template>

<style scoped>
.sb__k {
  margin: 0;
  font: 500 11px/1.3 var(--font-ui);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--c-accent);
}

.sb__text {
  margin: 0;
  font: 400 15px/1.6 var(--font-ui);
  color: var(--muted);
}

.ld {
  animation: sb-in 300ms cubic-bezier(0.23, 1, 0.32, 1) 360ms both;
}

@keyframes sb-in {
  from { opacity: 0; }
}

/* The cinemascope band */
.cine {
  position: relative;
}

.cine .pic {
  position: relative;
  margin: 0;
  overflow: hidden;
  aspect-ratio: 2.39 / 1;
  background: #000;
}

.cine img {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Solid, wireframe, render: a slow crossfade (compositor-only opacity); the render holds under the other two */
.cine img:not(:first-child) {
  animation: sb-pass 9s linear infinite;
  animation-delay: calc((var(--i) - 1) * -6s);
  animation-play-state: paused;
}

/* It runs only once the Sheet is open: nothing extra on the grow's or the close's frames */
:root[data-sheet='open'] .cine img:not(:first-child) {
  animation-play-state: running;
}

@keyframes sb-pass {
  0%, 30% { opacity: 1; }
  36%, 94% { opacity: 0; }
  100% { opacity: 1; }
}

.pl__vp {
  aspect-ratio: 16 / 9;
  border-top: 1px solid var(--rule);
}

.cine__cap {
  position: absolute;
  right: 12px;
  bottom: 10px;
  margin: 0;
  padding: 4px 8px;
  font: 500 11px/1.3 var(--font-ui);
  letter-spacing: 0.06em;
  text-transform: uppercase;
  background: var(--c-bg);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 6px;
}

/* The colophon */
.col {
  padding: 36px 24px 32px;
  border-top: 1px solid var(--rule);
}

.col__title {
  margin: 0;
  font: 700 clamp(40px, 7vw, 88px)/0.95 var(--font-ui);
  letter-spacing: -0.04em;
}

.col__hook {
  max-width: 46ch;
  margin: 18px 0 28px;
  font: 500 20px/1.4 var(--font-ui);
}

.col__hook span {
  color: var(--muted);
}

.col__meta {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px 24px;
  margin: 0;
  padding-top: 16px;
  border-top: 1px solid var(--rule);
}

.col__meta dt {
  font: 500 11px/1 var(--font-ui);
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: var(--muted);
}

.col__meta dd {
  margin: 6px 0 0;
  font: 400 14px/1.4 var(--font-ui);
}

/* Contents */
.toc {
  padding: 28px 24px 24px;
  border-top: 1px solid var(--rule);
}

.toc__list {
  margin: 14px 0 0;
  padding: 0;
  list-style: none;
}

.toc__list a {
  display: flex;
  align-items: baseline;
  gap: 14px;
  padding: 10px 0;
  font: 500 clamp(20px, 2.6vw, 30px)/1.2 var(--font-ui);
  color: var(--c-fg);
  text-decoration: none;
  border-top: 1px solid var(--rule);
  transition: color 0.2s var(--ease-out);
}

.toc__list a:hover,
.toc__list a:focus-visible {
  color: var(--c-accent);
}

.toc__list b {
  width: 2.2em;
  font-size: 13px;
  color: var(--muted);
}

.toc__dots {
  flex: 1;
  border-bottom: 1px dotted var(--rule);
  translate: 0 -6px;
}

.toc__pp {
  font: 400 14px/1 ui-monospace, 'SF Mono', Menlo, monospace;
  color: var(--muted);
}

/* Chapters */
.ch,
.wq,
.fn,
.oc {
  border-top: 1px solid var(--rule);
}

.ch__head {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: 12px 24px;
  padding: 28px 24px;
}

/* An open spread: two pages with a gutter */
.spread {
  display: grid;
  grid-template-columns: 1fr 1fr;
  border-top: 1px solid var(--rule);
}

.spread__page,
.spread__one,
.oc__plate {
  margin: 0;
}

.spread__page .pic,
.spread__one .pic {
  aspect-ratio: 16 / 9;
}

.spread__page + .spread__page {
  border-left: 1px solid var(--rule);
}

.spread figcaption,
.spread__one figcaption,
.oc__plate figcaption {
  padding: 10px 16px 14px;
  font: 400 13px/1.4 var(--font-ui);
  color: var(--muted);
}

/* The models table */
.mt {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 2fr);
  gap: 16px 24px;
  padding: 24px;
  border-top: 1px solid var(--rule);
}

.mt__table {
  width: 100%;
  border-collapse: collapse;
}

.mt__table caption {
  padding-bottom: 8px;
  text-align: left;
}

.mt__table th,
.mt__table td {
  padding: 10px 0;
  text-align: left;
  vertical-align: top;
  border-top: 1px solid var(--rule);
}

.mt__table th {
  width: 9em;
  font: 500 12px/1.5 var(--font-ui);
  color: var(--muted);
}

.mt__table td {
  font: 400 14px/1.5 ui-monospace, 'SF Mono', Menlo, monospace;
}

/* The pull quote */
.pq {
  margin: 0;
  padding: 40px 24px;
  border-top: 1px solid var(--rule);
}

.pq p {
  margin: 0;
  font: 500 clamp(22px, 3vw, 36px)/1.25 var(--font-ui);
  letter-spacing: -0.015em;
}

.pq footer {
  margin-top: 16px;
  font: 400 13px/1 var(--font-ui);
  color: var(--muted);
}

.spread__one {
  border-top: 1px solid var(--rule);
}

/* Plates */
.pl {
  margin: 0;
  padding: 0;
  list-style: none;
}

.pl__row {
  display: grid;
  grid-template-columns: 72px minmax(0, 1.3fr) minmax(0, 1fr);
  align-items: start;
  border-top: 1px solid var(--rule);
}

.pl__row .pic {
  aspect-ratio: 16 / 9;
  border-left: 1px solid var(--rule);
  border-right: 1px solid var(--rule);
}

.pl__no {
  padding: 14px 0 0 16px;
  font: 400 12px/1 ui-monospace, 'SF Mono', Menlo, monospace;
  color: var(--muted);
}

.pl__row p {
  margin: 0;
  padding: 14px 20px;
  font: 400 15px/1.55 var(--font-ui);
  color: var(--muted);
}

.pl__row b {
  display: block;
  margin-bottom: 4px;
  font-size: 18px;
  font-weight: 600;
  color: var(--c-fg);
}

/* Will's line */
.wq {
  margin: 0;
  padding: 56px 24px;
}

.wq p {
  max-width: 22ch;
  margin: 0;
  font: 700 clamp(30px, 4.6vw, 58px)/1.05 var(--font-ui);
  letter-spacing: -0.03em;
}

/* The fan: five pages stacked, spreading as the block scrolls in */
.fan {
  display: grid;
  grid-template-columns: minmax(0, 1.4fr) minmax(0, 1fr);
  border-top: 1px solid var(--rule);
}

.fan__stack {
  position: relative;
  aspect-ratio: 4 / 3;
  overflow: hidden;
  background: color-mix(in srgb, var(--c-fg) 4%, var(--c-bg));
}

.fan__page {
  position: absolute;
  top: 12%;
  left: 10%;
  width: 70%;
  aspect-ratio: 16 / 9;
  border: 1px solid var(--edges);
  transform: translate(calc(var(--i) * 4%), calc(var(--i) * 12%)) rotate(calc((var(--i) - 2) * 2deg));
}

@supports (animation-timeline: view()) {
  .fan__stack {
    view-timeline: --fan block;
  }

  .fan__page {
    animation: sb-fan linear both;
    animation-timeline: --fan;
    animation-range: entry 10% cover 50%;
  }
}

@keyframes sb-fan {
  from { transform: translate(0, 30%) rotate(0deg); }
}

.fan__list {
  margin: 0;
  padding: 0;
  list-style: none;
  border-left: 1px solid var(--rule);
}

.fan__list li {
  display: flex;
  gap: 12px;
  padding: 14px 20px;
  font: 400 14px/1.5 var(--font-ui);
  color: var(--muted);
}

.fan__list li + li {
  border-top: 1px solid var(--rule);
}

.fan__list b {
  color: var(--c-accent);
}

.fan__list em {
  display: block;
  font-style: normal;
  font-weight: 600;
  color: var(--c-fg);
}

/* Footnotes */
.fn {
  padding: 28px 24px 32px;
}

.fn__list {
  margin: 14px 0 0;
  padding: 0 0 0 1.6em;
  columns: 2;
  column-gap: 40px;
  font: 400 14px/1.55 var(--font-ui);
}

.fn__list li {
  margin-bottom: 12px;
  break-inside: avoid;
}

.fn__list li::marker {
  font: 600 12px var(--font-ui);
  color: var(--c-accent);
}

.fn__list span {
  color: var(--muted);
}

/* Outcome */
.oc__film {
  position: relative;
  border-top: 1px solid var(--rule);
}

.oc__film .pic {
  aspect-ratio: 16 / 9;
}

.oc__sound {
  position: absolute;
  left: 16px;
  bottom: 16px;
  padding: 9px 14px;
  font: 500 13px/1 var(--font-ui);
  color: var(--c-fg);
  background: var(--c-bg);
  border: 1px solid;
  border-color: var(--edges);
  border-radius: 999px;
  cursor: pointer;
  transition: border-color 0.2s var(--ease-out);
}

.oc__sound:hover,
.oc__sound:focus-visible,
.oc__sound[aria-pressed='true'] {
  border-color: var(--c-accent);
}

.oc__plates {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  border-top: 1px solid var(--rule);
}

.oc__plate + .oc__plate {
  border-left: 1px solid var(--rule);
}

.oc__plate .pic {
  aspect-ratio: 16 / 9;
}

.oc__plate b {
  color: var(--c-accent);
}

.oc__after {
  padding: 20px 24px 28px;
  border-top: 1px solid var(--rule);
}

@media (prefers-reduced-motion: reduce) {
  .ld { animation-duration: 1ms; }
  .fan__page,
  .cine img { animation: none !important; }

  .cine img:not(:first-child) { opacity: 0; }
}

@media (max-width: 720px) {
  .col,
  .toc,
  .ch__head,
  .mt,
  .pq,
  .wq,
  .fn {
    padding-left: 16px;
    padding-right: 16px;
  }

  .ch__head,
  .mt,
  .fan {
    grid-template-columns: 1fr;
  }

  .col__meta,
  .oc__plates {
    grid-template-columns: 1fr 1fr;
  }

  .oc__plate:nth-child(3) {
    border-left: 0;
  }

  .oc__plate:nth-child(n + 3) {
    border-top: 1px solid var(--rule);
  }

  .spread {
    grid-template-columns: 1fr;
  }

  .spread__page + .spread__page {
    border-left: 0;
    border-top: 1px solid var(--rule);
  }

  .pl__row {
    grid-template-columns: 1fr;
  }

  .pl__no {
    padding: 12px 16px 8px;
  }

  .pl__row .pic {
    border: 0;
  }

  .pl__row p {
    padding: 12px 16px 16px;
  }

  .fan__list {
    border-left: 0;
    border-top: 1px solid var(--rule);
  }

  .fn__list {
    columns: 1;
  }

  .oc__after {
    padding: 18px 16px 24px;
  }
}
</style>
