# References: the Awwwards bar for willvernon.online v2

Inputs: `redesign/references/sweep.json` (3 sweeps: award sites, GSAP showcase, Mobbin sections) and the
local contact sheet `redesign/references/shots/sheet.jpg` (first screens at 1440 and 390 of 10 sites).
Screenshots are **local-only and gitignored** (third-party content). They are referred to by site name here
and are never embedded or committed.

What the contact sheet showed:

- **Five of ten first screens are gates.** merodev (black + "Enter"), samsy (black + red loader dot),
  graffico (loader bar on desktop, WASD hint on mobile), a24 (blank on mobile), and raviklaassens mobile
  (black) all show a gate or a loader. Award juries forgive this. A Lighthouse run does not, and our LCP is
  already 4.0s. We keep their craft and skip the gate.
- **matvoyce.com now resolves to an unrelated Thai blog**, so the domain has lapsed. Its awards (SOTD,
  Typography Honours) come from sweep evidence only. Cite it for its principle and never link to it as a live
  example.
- **The strongest first screens use type as the image**: henry.codes (condensed newspaper display),
  huyml.co (red name at viewport scale), illoca (display type fading line by line) and raviklaassens (R and K
  pinned to opposite corners).

---

## 1. Awwwards bar (the QA checklist)

The judge uses this checklist now, and the Phase 6 QA panel uses it later. Every item must be pass/fail
testable. The weights follow Awwwards scoring.

### Design (40%)
1. **Type scale spans at least 10x.** Display size divided by body size is at least 10 at 1440 (for example
   16px body and 160px or larger display) and at least 4 at 390. There are at most 2 families (display and
   mono) and at most 5 sizes in use per page. *Test:* computed `font-size` sweep.
2. **Contrast passes WCAG AA everywhere text sits.** Body and mono readouts reach 4.5:1 or better. The accent
   used as text also reaches 4.5:1 on `#000`–`#0b0b0b`. `#D91C1C` fails at 4.12:1 and `#6b7280` fails at
   4.33:1, so both must change or be used only at large or display size. *Test:* axe plus a token contrast
   script.
3. **One grid, visible in the work.** A single column system (for example 12 columns at 1440 and 4 at 390)
   has named gutters. Every text block starts on a column line, and at most one element per section breaks
   the grid on purpose. *Test:* grid overlay screenshot at both widths.
4. **Red is used sparingly.** The accent covers no more than 5% of any first screen's pixels and has a single
   job: live, active or telemetry state. *Test:* pixel histogram of the screenshot.
5. **One easing family.** All tweens draw from 2 or 3 named `CustomEase` or `gsap.defaults` curves (for
   example `hud.out` and `hud.inOut`) and durations come from a token scale (0.2 / 0.4 / 0.8 / 1.2s). There
   are no stray `ease:` literals. *Test:* grep the source.

### Usability (30%)
6. **The first screen says who and what in under 3s.** "William Vernon" plus the disciplines (generative
   design, creative tech, 3D, AI, vnon DnB) are readable in the server-rendered HTML with no JS, no gate and
   no loader. *Test:* disable JS and screenshot. Also a 3s filmstrip on a throttled mobile run.
7. **Performance holds.** Mobile Lighthouse: Performance 90 or higher, LCP 2.5s or less, CLS 0.05 or less,
   TBT 200ms or less. The WebGL code is not in the critical path and initialises after LCP (via
   `requestIdleCallback` or first interaction). *Test:* Lighthouse mobile run, three runs, median.
8. **Reduced motion is complete.** Under `prefers-reduced-motion: reduce`, scramble, smoother, pinning and
   WebGL all fall back to static or fade states, and no content is hidden behind an animation. *Test:*
   emulate reduced motion and diff the page content against the INVENTORY.md parity list.
9. **Every page is reachable in 1 click.** The primary nav (or menu overlay) lists Work, Projects, AI,
   Experiments, Music and About, fixing today's missing nav items. The menu is keyboard-trappable, closes
   with Esc and returns focus to its trigger. *Test:* keyboard walk-through.
10. **Mobile is a real layout.** At 390 there is no horizontal scroll, touch targets are at least 44px, hover
    previews have a tap equivalent, and the audio controls work one-handed. *Test:* 390 screenshots of every
    page plus a touch emulation pass.

### Creativity (20%)
11. **Exactly one signature WebGL moment.** It is authored for this person: generative, or audio-reactive,
    or TouchDesigner-flavoured. It is not a stock particle field. It appears once, the site stays legible
    without it, and it pauses when off-screen (IntersectionObserver). *Test:* count canvas contexts; check
    the fps budget with DevTools.
12. **Motion carries the HUD personality.** ScrambleText, glitch and telemetry readouts react to real state
    (scroll %, section id, track BPM or time, local clock) and never just decorate. Every scramble resolves
    in 0.6s or less and runs only on entry or on hover. *Test:* audit the list of animated elements.
13. **The project index has a hover preview.** Moving the pointer over a row reveals media (image or muted
    video) that follows or snaps to it. Keyboard focus triggers the same preview. Opening a row uses a Flip
    or shared-element transition into the case study. *Test:* manual check plus a focus check.

### Content (10%)
14. **Case studies read as process.** All 7 projects show the brief, then numbered process steps, then
    outcome media, with the tool stack (TD, Blender, SD/Comfy) as metadata. The copy is verbatim from
    `redesign/content/*.json` with 1,429 of 1,429 inventory items present. *Test:* parity script.
15. **Music is playable, not just linked.** The 5 tracks have in-page transport, stems and BPM/key metadata,
    and the SoundCloud/Spotify embeds load on click (facade) and not on page load. *Test:* network waterfall
    and a playback check.

---

## 2. Shortlist (award and GSAP sweeps)

"Seen" marks sites whose first screen is on the local contact sheet. Sites without it are cited from
sweep.json evidence only.

| # | Site | URL | Source / award | What earns the score | Borrow in principle | Do NOT copy |
|---|------|-----|----------------|----------------------|---------------------|-------------|
| 1 | henry.codes (seen) | https://henry.codes/ | Awwwards Nominee / HM | Newspaper-condensed display at full width, a dense small-caps meta strip, an index list set in type only, and a vertical wordmark on mobile. The page is set like print and styled with CSS rather than JS. | A display size that fills the viewport width. The meta row as a "telemetry strip" under the name. A text-only nav index. | The woodcut illustration, the political masthead copy, the cream paper ground. |
| 2 | huyml.co (seen) | https://huyml.co/ | gsap.com/showcase | The name is the hero, set in red at viewport scale with a character breaking the letterforms. Personality lands in under 1s. | Letting WILLIAM VERNON / VNON *be* the hero graphic. Letting one element interrupt the type. | A cartoon mascot, the white ground, a crop that leaves mobile unreadable on first paint. |
| 3 | raviklaassens.com (seen) | https://www.raviklaassens.com/ | gsap.com/showcase | Black canvas, monogram letters pinned to the corners, one small red-glitched media element in the centre. The HUD-like framing is close to our own DNA. | Corner-anchored UI (name, clock, section id) framing a quiet centre. Red used only as signal. | The near-empty mobile first screen and the unclear call to action. |
| 4 | a24.raviklaassens.com (seen) | https://a24.raviklaassens.com/ | gsap.com/showcase | One rotating object (a disc) as the whole hero, cinematic scroll chapters. | One object as the protagonist of the WebGL moment. Scroll chapters on the music page, one per track. | The white blank mobile state and the A24 brand language. |
| 5 | illoca.unseen.co (seen) | https://illoca.unseen.co/ | gsap.com/showcase; GSAP Showreel 2025 | SplitText lines reveal one by one (the opacity falloff is visible in the mobile shot), with ScrollSmoother, ScrambleText and CustomEase all in one motion grammar. | Line-by-line reveals with the opacity falloff on case-study intros. A single CustomEase family. | The beige grid-paper ground, the serif display, the SaaS "Try for free" pill. |
| 6 | revelatio.studio (seen) | https://revelatio.studio/ | gsap.com/showcase | Desktop hero is almost empty apart from a two-line positioning statement bottom-left. Mobile uses large-type paragraphs and discipline filter chips. | A one-sentence positioning line. Discipline filters on the Work hub (Generative, 3D, AI, Audio). | A consent dialog covering the first screen, a video embed that errors on load, white-on-white. |
| 7 | office.graffico.it (seen) | https://office.graffico.it/ | gsap.com/showcase | A navigable 3D office with a WASD/arrow controls legend as UI. Scroll sequencing is tight. | A controls legend styled as a HUD panel (keycaps) for the Experiments page. | The loader gate, the 3D environment as navigation, the heavy first load. |
| 8 | merodev.net (seen) | https://merodev.net/ | Awwwards SOTD + HM; CSSDA WOTY 2025 nominee | A sci-fi immersive portfolio with a useGSAP + Three.js runtime. A solo creative-developer scope like ours. | The sci-fi/technical tone held consistently, with GSAP owning all the timing. | The "Enter" gate: its first screen is black with no content and no LCP text. |
| 9 | samsy.ninja (seen) | https://samsy.ninja/ | Awwwards SOTD + Developer Award, Oct 2025 | A multiplayer neon WebGL/WebGPU world where case studies are rooms. | Presence and telemetry cues (live counters, coordinates) as HUD flavour. | A full-3D world as the site, and the black loader first screen. It breaks our perf and a11y bar. |
| 10 | matvoyce.com (domain lapsed) | https://matvoyce.com/ | GSAP SOTY 2025 nominee; Awwwards SOTD + Typography Honours, Jan 2025 | Kinetic type: letters stretch, snap and recombine on scroll, tuned never to block reading. WebGL is used only for frame rate. | Kinetic type that stays readable at every frame. Type is the motion material. | Do not cite the live URL: it now serves an unrelated blog. |
| 11 | Bruno Simon (not seen) | https://bruno-simon.com/ | Awwwards SOTY 2020 + SOTM | The canonical example of a single signature WebGL idea carrying an identity, with a Blender pipeline. | Our one WebGL moment should be *his* kind of idea: built from Will's own Blender/TD pipeline. | The game-as-site navigation and the car. |
| 12 | Paul Kalkbrenner (not seen) | https://www.awwwards.com/sites/paul-kalkbrenner | Awwwards SOTD, Sep 2 2026 | A rare SOTD for an electronic-music artist. | How a music section can earn craft points while staying an artist page. Treat it as a benchmark for /music. | Anything specific until it has been checked live, because the evidence is a listing page only. |

Also in the sweep, kept as secondary benchmarks only: Rauno Freiberg 2025 (dark, minimal, precise),
Cyd Stumpel 2025, Léo Parpeix 2026, Gil Huybrecht, Gionatan Nese '26 (a portfolio versioned by year) and
"An AI Portfolio in the Cosmos" (a cautionary example: AI visuals as wallpaper).

### Section patterns (Mobbin sweep)

| Pattern | Reference | URL | Borrow | Avoid |
|---------|-----------|-----|--------|-------|
| Hero | Sunday (WIRED) | https://mobbin.com/sites/sections/c12698b6-7d3b-49af-82f8-7ef6fc404529 | A monospace status list bottom-left under a giant wordmark. This is a HUD readout. | Hard drop-shadow letter blocks (the impeccable craft floor treats this as a costume). |
| Hero | Grok (xAI) | https://mobbin.com/sites/sections/30ab578c-5e08-4070-905a-146bc41a8e12 | Oversized thin type split left and right around a quiet centre. | A generic particle/line network. The WebGL moment must be ours. |
| Hero | Oryzo | https://mobbin.com/sites/sections/c2626367-996c-4c76-bb6c-771c6cd6d466 | A two-line stacked uppercase headline and a thin nav on near-black. | The glowing product-shot trope. |
| Menu overlay | Freshman | https://mobbin.com/sites/sections/1a15a6d9-be03-4761-9a3a-30ec06495846 | A "+ MENU" trigger top-right and a horizontal project ticker. | Autoplay video behind the menu. |
| Menu overlay | Büro | https://mobbin.com/sites/sections/96246ad7-c31d-4134-b867-1c73db9fcb78 | An explicit "Open menu" label, meaning a text trigger rather than a lone icon. | The gradient full-bleed background and the pill bar. |
| Project index | MOUTHWASH | https://mobbin.com/sites/sections/7ea4ce8e-8811-462e-b5d9-f27d7c3e4ec6 | An INDEX/INFORMATION toggle, tag filters, monospace codes (WV-001…). | A thumbnail grid as the only view. The list plus hover preview comes first. |
| Project index | A24 film list | https://mobbin.com/sites/sections/b645a881-adf5-43f3-a86c-758cd54f0b72 | Huge stacked titles as the index, with a year superscript per row. | Titles so large that 7 projects need more than 2 screens. |
| Project index | Waka Waka | https://mobbin.com/sites/sections/fe089d5d-5adb-4849-a282-ae46d8fd7eac | Numbered rows (N°0001) with metadata columns (year, tools, type) and a live location/time readout. | Furniture-catalogue density on mobile, where columns need to collapse. |
| Audio player | Music app track view | https://mobbin.com/screens/a58d7560-8cad-490f-a3ec-acd736c41735 | A numbered tracklist and a sticky bottom waveform transport. | The generic streaming-app chrome (shuffle/repeat are pointless for 5 tracks). |
| Audio player | Epidemic Sound | https://mobbin.com/screens/3db6862a-ed09-4eb0-a803-ab7c6598d02d | A full-width waveform scrubber, with BPM and key shown as telemetry tags per track. | The stock-library filtering UI. |
| Footer | Resend | https://mobbin.com/sites/sections/9301c687-40d0-4d8d-bbb8-b1325bac2679 | A live status dot (for example "vnon // online · 174 BPM") next to the contact block. | A SaaS multi-column link farm. |
| Footer | Runway | https://mobbin.com/sites/sections/902d3be1-1cae-4cf3-bb62-ea51a2008af7 | A giant faint wordmark behind the contact links. | A row of social icons as the main call to action. The email address comes first. |

Gap: the Mobbin sweep found no strong dark case-study "process steps" pattern. Build the case studies from
Julienne-style logic (a numbered step and a right-rail detail panel) in our own visual language.

---

## 3. Anti-patterns (this portfolio must never ship these)

These are generic AI-portfolio tropes, filtered through the impeccable craft floor
(`.claude/skills/impeccable/reference/craft-floor.md`).

- **Purple, blue or neon-cyan gradients**, gradient text, or "aurora" blobs. Emphasis comes from size and
  weight. The only chroma is the red signal accent.
- **Centered hero, one-line tagline, then 3 feature cards.** It says nothing about who this is. The hero is
  the name, the disciplines and live telemetry.
- **Bento grids for everything.** Cards of the same size with an icon, heading and text used as page
  structure. Projects are an index (list plus preview) and not tiles.
- **Glassmorphism and backdrop blur as decoration.** The same goes for the ghost card (a 1px border plus a
  wide soft shadow) and nested cards.
- **Eyebrow or kicker labels above headings** ("— SELECTED WORK"). The craft floor bans them outright, so
  headings carry their own weight. Mono telemetry *readouts* are data and are allowed. Decorative labels are
  not.
- **Scramble or glitch on everything.** When every element flickers, nothing reads as HUD. The effect is
  reserved for state changes and entry, and it resolves in 0.6s or less.
- **Loader or "Enter" gates.** merodev, samsy and graffico show these. They fail check 6 and LCP.
- **Stock particle fields, starfields and "cosmos" backgrounds** used as the WebGL moment. They also cover
  AI imagery used as wallpaper instead of as work with a documented pipeline.
- **Decorative grid-paper or stripe backgrounds** (`repeating-linear-gradient`) with no measuring purpose.
  Any grid lines must *be* the layout grid or a readout scale.
- **Sketch or doodle SVG illustration**, `feTurbulence` grain, unDraw, generic 3D blobs or emoji icons.
- **Custom cursors that hide the native cursor** or lag behind it. A cursor effect is allowed only as an
  addition to the native pointer, and it is disabled on touch and under reduced motion.
- **Scroll-jacking that fights the user**: forced snap on long pages, and ScrollSmoother on mobile when
  native scroll would do.
- **Three or more WebGL canvases.** The rule is one signature moment. Audio-reactive visuals on /music use
  2D canvas and are paused off-screen.
- **Autoplaying audio or video with sound, and third-party embeds on page load.** Embeds use facades.
- **Grey-on-black body text** below 4.5:1 (today's `#6b7280`), and red body text (`#D91C1C`).
