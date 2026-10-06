# Overnight tools: per-project Sheet variants and the scorer

**FROZEN at setup (2026-10-06).** Later agents use these tools as they are. Don't change `tools/score.cjs`,
`tools/harness.js` or `app/composables/sheetRegistry.ts`. If one is truly broken (it mis-measures, it crashes on a
valid variant), fix the smallest thing and add a line under "Measuring fixes" below: date, what was wrong, what changed,
which scores it affects. A fix never changes a threshold.

## 1. Add a variant for a project

1. The slug is the card's `id` in `content/strip.json` (e.g. `smugglers-outpost`, `monolith`, `04` for the Topography
   experiment, `synthetic_corals`).
2. Write the body as `app/components/sheets/<slug>/<Id>.vue`. `<Id>` is short, letters/digits/`-`/`_` (e.g. `K1`,
   `Grid`). Don't reuse a shared id (`0 A B C R S T U`): the project's own file would win, which confuses the logs.
3. Build it inside the shared shell, like `app/components/SheetT.vue`:
   - props `{ sheet: SheetOpen }`, emits `close`, and `defineExpose({ close: () => shell.value?.close() })`
   - the template is `<SheetShell ref="shell" :sheet="sheet" @close="$emit('close')"> …blocks… </SheetShell>`
   - every block is marked `data-sheet-block="<name>"`; the first one is also `data-sheet-body`; blocks that rise in
     on the open get `data-build`; videos that play only in view get `data-in-view` (the shell's `usePlayInView`)
   - the shell owns the hero (the teaser grows from the card), the frame, the close button, the dim and every hook the
     harness reads. Don't restyle or replace them in a body.
4. Register it in `app/components/sheets/<slug>/meta.json` (create the file for a project's first variant):

```json
{
  "_about": "PROTOTYPE (overnight run). <project>'s Sheet variants; see .scratch/v1-launch/overnight/TOOLS.md.",
  "default": "K1",
  "variants": {
    "K1": { "name": "Short name of the layout", "score": null, "of": 30 }
  }
}
```

A variant that isn't in `variants` (or has no file) can't be opened for that project. A meta may list shared ids
(`T`, `R`, …) too: Amplified Spaces lists T, R, S, U, A.

## 2. Set a project's default and its scores

Edit its `meta.json`: `default` is the id the project opens with (the round's best once scored); each variant's
`score` is its matrix total (`of` 30: machine /23 from the scorer + judged 9, 14 and 15's readability). The options
panel (dev, or `?proto`) shows the open project's variants (or the centre card's) with these scores and marks the top
one `rec`. Amplified Spaces' meta holds round 2's scores, `of` 28, until it's rescored tonight.

How a variant is picked (`resolveSheet` in `sheetRegistry.ts`): `?sheet=<id>` applies to whichever project opens if
its meta lists that id, otherwise the project's `default`. A project with no meta opens the shared body `?sheet=` names
(`A`, `T`, …), else the old `ProjectSheet` (`0`).

## 3. Run the scorer

The dev server must be up on :3000 (check with `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/`).

```sh
node "/Users/williamvernon/Documents/Personal Projects/willvernon-online/.scratch/v1-launch/overnight/tools/score.cjs" <slug> <variant> --out r1
```

- About 45 s a run. Run variants one after another, never in parallel: they share the CPU and criterion 8 counts
  slow frames.
- `--out` is the label (`r1`, `r2`, …): stills go to `.scratch/v1-launch/overnight/<slug>/stills/<label>/`. Default
  label `latest`; an absolute path is used as the folder itself.
- It prints JSON and also writes it to `<variant>-score.json` beside the stills. Read `points`, `machineTotal` and
  `resolved`. If `resolved` isn't the variant you asked for, the variant isn't registered for that slug, and the
  scores are another body's.
- Stills: `<variant>-d0…d3.png` (desktop 1440×900 dark, the open Sheet at 0, 25, 50, 75% of its scroll height) and
  `<variant>-p0.png`, `-p1.png` (phone 375×812 at the top and at 40%). The options panel and the Nuxt devtools pill
  are hidden in them.
- Noise: criterion 8 (slow frames) moves by a couple of frames between runs (Amplified Spaces T read 2, then 4).
  When a decision hinges on 7 or 8, run that variant once more and log both runs; score the better one, and do the
  same for every variant you compare it with.

What a run does: opens `/?sheet=<variant>`, clicks through the Gate (no sound), wheels the strip until
`.card[data-slug=<slug>]` is the centre card, does one warm-up open and close, then `__sheetRun` (open, Escape close,
a second open closed by Back, sampling every frame), reopens for `__round2` and the stills. Then a phone context
deep-links `/work/<slug>?sheet=<variant>`, waits for the Sheet to open after the Gate, measures, takes 2 stills and
closes it with the ✕.

## 4. What each point means

Machine criteria, from `.scratch/v1-launch/project-sheet-matrix.md` (thresholds unchanged). Total /23.

| # | 2 | 1 | 0 | Raw fields |
|---|---|---|---|---|
| 1 Teaser grows, video continues | max step ≤ 60px a frame, no restart | a step > 60px | video restarted, or no media box | `mediaMaxStep`, `videoRestarted` |
| 2 Body builds after the media | body first shows ≥ 60% into the media's travel | earlier, but after it starts | before, or never | `bodyStartPct` |
| 3 Landing drops away | all gone by the media landing | gone by the end | some left | `landingLeftovers`, `landingGoneMs`, `mediaLandMs` |
| 4 Dots in the margins | ≥ 64px each side, no blur, dim ≤ 0.25 | narrower or dimmer | blurred, or no margin | `marginPx`, `backdropFilter`, `overlayAlpha` |
| 5 Media first | media ≥ 55% of the first view and ≥ 4 media | one of the two | neither | `mediaShare`, `mediaCount` |
| 6 Close reverses | lands within 4px of the card, Landing back | within 16px | elsewhere, or Landing missing | `closeOffPx`, `landingBack` |
| 7 Timing | open ≤ 700ms and close ≤ 450ms | one of them | neither | `openMs`, `closeMs` |
| 8 Frame budget, open + close | ≤ 2 frames > 25ms | ≤ 6 | more | `slowFrames` |
| 11 Header docked | the Sections' docked header, solid | inline but not solid | neither | `r2.headerDocked`, `r2.headerInline` |
| 12 Edges = Sections panel | border, radius and width match | border only | own style | `r2.edgesMatch` |
| 13 No gaps between blocks | max gap ≤ 1px | ≤ 16px | larger | `r2.maxGapPx`, `r2.gapAt` |
| 15m Phone (0–1) | — | 375×812: opens, no horizontal scroll (≤ 1px), closes | any fails | `phone.opened`, `phone.hOverflowPx`, `phone.closed` |

Judged by the separate reviewer, pairwise in both orders (not the scorer): 9 reads as this site (0–2), 14 tells the
story (0–2), and 15's other point, text readable on the phone (0–1, from the `p0`/`p1` stills; `phone.minFontPx` is
the smallest text, for reference). Criterion 10 (Will's rules) is code review plus the raw `focusIn`, `focusBack`,
`backCloses` and `url` fields; it isn't pointed by the scorer. Matrix total = machine /23 + judged /7 = /30.

## Baseline (setup, 2026-10-06)

Amplified Spaces, run with this scorer (stills in `amplified-spaces/stills/setup-check/`):

| Variant | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 11 | 12 | 13 | 15m | Machine /23 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| T | 2 (47px) | 1 (53–55%) | 2 | 2 (200px) | 1 (0.47) | 2 (0px) | 2 (~665 / ~420ms) | 2 or 1 (2–4 frames) | 2 | 2 | 2 (0px) | 1 | 20–21 |
| A | 2 (47px) | 1 (52–53%) | 2 | 2 | 1 (0.48) | 2 | 2 (635 / 404ms) | 2 (1–2) | 2 | 2 | 2 | 0 (2px overflow) | 20 |

This matches round 2 except criterion 2: round 2 logged 61–72% for these variants, this harness reads 52–55% on the
same code, with or without the warm-up open. Treat tonight's numbers as the baseline and compare variants only with
other runs of this scorer. A has a 2px horizontal overflow on phones.

## Shared head, contents, numbering (2026-10-07)

Will: the title, the project info, section numbering and the contents are the SAME on every Sheet; how the content
is shown between them stays each project's own. Use these from `app/components/sheets/_shared/`; never restyle or
re-implement them in a variant (judges mark c9 down if they differ; finalize agents check the winner uses them).
Reference implementations: `amplified-spaces/T2b.vue`, `smugglers-outpost/SF.vue`.

```ts
import SheetHead from '../_shared/SheetHead.vue'
import SheetSectionNo from '../_shared/SheetSectionNo.vue'
import SheetCredits from '../_shared/SheetCredits.vue'
import { useSheetSections } from '../_shared/useSheetSections'

// One list, in order: numbers, the total and the anchors all come from it
const { sec } = useSheetSections('<short-prefix>', [{ id: 'build', label: 'Prompt to pixels' }, { id: 'outcome', label: 'Outcome' }])
const info = { year: '2025', module: STORY.meta..., role: ..., tools: ... } // from story.ts / content JSON, never retyped
```

```vue
<SheetHead :title="STORY.title" :hook="optional one line" :info="info">
  <template #before><!-- your first-view media (keeps criterion 5) --></template>
  <!-- optional: your own lead content after the contents -->
</SheetHead>
<section class="mine" v-bind="sec('build')" data-sheet-block="build">
  <SheetSectionNo id="build" /> <!-- "01 / 02 Prompt to pixels", anywhere inside your layout -->
  ...
</section>
<SheetCredits :items="STORY.credits" />
```

- `SheetHead` is the first block (`data-sheet-body`, `data-sheet-block="lead"`, `data-build`, the 360ms fade-in):
  the `before` slot, then the title (h2, big), the optional hook, the info rail (Year, Module, Client, Role, Tools,
  With; each optional, always that order; empty ones drop) and the contents. Don't put text above the `before`
  media: the first view stays media-led.
- `SheetContents` (inside the head when sections are declared): a nav "Contents" of numbered links; a click scrolls
  the layer so the section sits under the header and focuses its heading. Also the margin rail (T2b's phase
  marker, ≥1200px, aria-hidden) lighting the section in view. Don't add your own rail or phase marker.
- `SheetSectionNo id="…"`: an h3 "NN / TT Label", numbers aria-hidden (read once, as the label). Bind `sec(id)` on
  the section it heads (id anchor, `aria-labelledby`, `data-sheet-section`); don't also give it an `aria-label`.
  Un-numbered closing blocks (an outcome reel, credits) just skip both.
- `SheetCredits :items`: the closing credits block (replaces the per-project `*Credits.vue`, which were identical;
  `SoCredits.vue` now delegates to it). Skip it when the info already says everything (Amplified Spaces).
- Scores with them (`--out shared`): T2b 23/23 machine, SF 23/23, same as before.

## Measuring fixes

(none yet)
