# Front-end Audit: willvernon.online (branch `redesign/v2`)

Method note: this is a static code and markup audit that follows the technical-check structure of `.claude/skills/impeccable/reference/audit.md` (a11y / performance / theming / responsive / implementation integrity) and the strengths/weaknesses framing of `reference/critique.md`. The live-browser detector and sub-agent steps were not run. Evidence comes from grep/sed/python on the repo, `redesign/content/*.json`, `curl -I` against the live site, and the two baseline contact sheets. An adversarial pass re-ran every claim; corrected values are marked **[fixed]**.

## 1. IA & Navigation

**Pages (7, root-level `.html`, no build step):** `index`, `about`, `work`, `music`, `AI`, `experiments`, `projects`.

**Primary nav is functionally identical on every page.** The `<nav>` blocks hash the same on 5 pages. AI.html and experiments.html differ only in two HTML comments (`<!-- Center: WV Monogram -->`, `<!-- Right: Social Links -->`), per `diff` of the `<nav>` blocks. **[fixed]**
- Desktop: `[ HOME ]`, `[ WORK ]`, `[ MUSIC ]`, `[ ABOUT ]` (`index.html:28-31`) **[fixed line refs]**
- Mobile overlay: the same 4 links as plain text, Home/Work/Music/About (`index.html:56-64`, links at 60-63) **[fixed]**
- Right side: a monogram that links home, plus Instagram, LinkedIn and mailto (`index.html:39-50`) **[fixed]**

**Finding: a hidden second tier.** `projects.html`, `AI.html` and `experiments.html` are not in the nav. **[fixed]** They are reachable from three places:
- the index hero CTAs (`index.html:88-90`) and the featured cards (`index.html:111,137,162,187,231`);
- the `work.html` hub panels (`work.html:70,86,102`);
- three `projects.html#NN` links on `about.html:285-293`.

`music.html` has zero links to any of the three. The nav reads as flat but the real IA has two levels. A visitor on music.html has to go through Work or Home to reach the case studies.

**Mobile menu** (`index.html:543-555`; the same logic is on all 7 pages, see §4):
- `toggleMenu()` toggles `.active` on `#mobile-menu` and `overflow-hidden` on `body`.
- The trigger has no `aria-expanded` (0 hits site-wide). Focus does not move into the panel, and there is no Escape handler.
- `grep -n "Escape"` finds **3** handlers **[fixed]**: the experiments lightbox (`experiments.html:423`), the Xbox gallery lightbox (`projects.html:2229`) and the projects slide-over (`projects.html:3168`). None of them is for the menu.
- The overlay is `position:fixed; inset:0` with `display:none`, switching to `flex` on `.active` (`style.css:374-391`).
- The burger button is icon-only (`<i class="ph ph-list">`) and colored `var(--text-muted)` (`style.css:356-360`).
- **[added]** In `sheet-mobile.jpg` no burger glyph and no social icons are visible at 390px; only the monogram shows. This is consistent with the Phosphor script not loading in the capture environment. The whole mobile nav trigger depends on a third-party icon font and has no text fallback.

**First screen per page** (from `sheet-desktop.jpg` @1440 and `sheet-mobile.jpg` @390):
| Page | First-screen content |
|---|---|
| index | Kicker "DESIGN & MUSIC // OXFORD BROOKES ALUM", H1 "WILLIAM VERNON", H2 "Generative Design & Creative Technology.", a short bio, **three** CTAs: EXPLORE PROJECTS / > AI PROJECTS / > EXPERIMENTS (`index.html:88-90`), particle canvas **[fixed]** |
| about | Kicker "// PROFILE", H1 "ABOUT & CREDENTIALS", lede, then columns for Design Personality / Design Skills / Education (+ Generative Design, Experience) |
| work | **No H1 at all** (`grep -c '<h1' work.html` = 0). Three full-height panels with h3 titles PROJECTS / AI / EXPERIMENTS and kickers (`work.html:78,94,110`) **[fixed]** |
| projects | Kicker "// CASE STUDIES", H1 "PROJECT ARCHIVE", lede; the SOFTWARE/DISCIPLINE filter rail is **visible above the fold** on desktop **[fixed]** |
| music | Kicker "// MUSIC & SOUND DESIGN", H1 "ALIAS: VNON", lede, "Sound & Style" block, LISTEN TO MY MUSIC CTA with SoundCloud and Bandcamp links |
| AI | Kicker "// AI EXPLORATIONS", H1 "AI EXPERIMENTS & RESEARCH", lede, Ethos: Artificial Acceptance, Platform & Model Directory icon strip |
| experiments | Kicker "// DESIGN EXPERIMENTS", H1 "MINIMAL EXPERIMENTS", lede, and the first row of cards with tag pills (BLENDER / AFTER EFFECTS, TOUCHDESIGNER / AFTER EFFECTS, AFTER EFFECTS / PARTICLE ART) |

Six of the seven pages follow a kicker, H1, lede rhythm. work.html has no H1.

**Mobile first screens** **[fixed]**:
- **4 of 7** (about, projects, music, experiments) cut the lede mid-sentence at the fold. For example, music ends on "...central anchor for my work, translating".
- index, work and AI show no lede at all in the first viewport; the H1 or panel fills it.

## 2. Visual Language

**Color tokens:** `style.css:1-22`, `:root`
```css
--bg-950:#020000  --bg-900:#050000  --bg-800:#0a0a0a  --bg-700:#141414
--text-main:#d1d1d1  --text-white:#ffffff  --text-muted:#6b7280  --text-gray-500:#9ca3af
--accent-red:#D91C1C  --accent-darkred:#5a0000  --vj-accent: var(--accent-red)
--font-sans:'Space Grotesk'  --font-mono:'Space Mono'  --max-width:1600px
```
`:root` holds **14 custom properties**: 10 color values, 1 color alias, 2 font and 1 layout. **[fixed; was "11"]**

`style.css` has 94 hex literals in total, and **84 of them sit outside `:root`**. **[fixed]** There are also **105** `rgb()/rgba()` literals. They include:
- near-blacks: `#0a0a0a` ×6, `#060606` ×4, `#111`, `#161616`, `#030303`;
- greys: `#a3a3a3` ×9, `#e5e5e5` ×3;
- one-off brand colors: `#0077b5`, `#e1306c`, `#5865f2`;
- hot accents: `#ff0050`, `#ff5555`, `#aa00ff`, `#ff5500` ×3, `#ffaa00`, `#cc4400`, `#22c55e`.

**[added] Undefined tokens.**
- `var(--bg-750)` (×3) and `var(--bg-850)` (×2) are used in borders (`style.css:3521,3554,3575,3607,3754`) but are defined nowhere in CSS or HTML. Those borders fall back to `currentColor`.
- `--vj-accent-1/2/3(-rgb)` (50 uses) are only ever set by JS on `music.html:760-765`. Only 3 of those uses have a fallback.

**Typography.** The site uses two families:
- Space Grotesk, loaded at 300/400/600/700, for display and body;
- Space Mono, loaded at 400/700/italic 400, for labels, kickers, HUD and nav.

Both are loaded by a Google Fonts `<link>` (`index.html:11`).
- There are **34 distinct `font-size` values (0.55rem–9rem)** and no `clamp()` (count 0). **[fixed]**
- There are 51 `@media` rules. The most common are `min-width:768px` ×25, `992px` ×9 and `1200px` ×7. **[fixed]**
- Weights used: 700 ×19 (+3 `bold`), 600 ×5, 300 ×1, 800 ×1. The 800 is **not loaded**, so the browser synthesizes it.

**Spacing/grid.** `display: flex` appears 120× and `display: grid` 15× in style.css. There is no spacing scale.

**Iconography.** Phosphor comes from `<script src="https://unpkg.com/@phosphor-icons/web">` (`:14` on all 7 pages). **[fixed]**
- unpkg answers with a **302 redirect** to `@2.1.2/src/index.js` (356 B).
- That script injects **6 stylesheets**, one per weight (regular, thin, light, bold, fill, duotone), from jsdelivr.
- The site only uses regular and `ph-fill` (16 uses).

**Signature effects:**
- **Text scramble**: `scrambleText()` + `bindScrambleHover()` (`index.html:1372-1428`), with a glyph pool `technicalChars = "01XY/[]_#&@$%?><*"`. It is bound to `.nav-links a` / `.mobile-menu a` on all 7 pages. about.html also binds `.hud-skill-tag` and `.hud-project-link span` (`about.html:430-431`). **[fixed; was about:424]**
- **Idle "organic telemetry" scramble**: `triggerOrganicTelemetryScramble()` (`index.html:1450`), on index only.
- **Glitch**:
  - `.glitch-hover` (`style.css:670-673`) is used once, on `music.html:324`.
  - `.glitch-flash` / `glitch-flash-anim` 0.22s (`style.css:3808-3820`) is used on projects.html media.
- **HUD chrome**: `.hud-spec-*` (`style.css:3209-3230`) and `.hud-item/-lbl/-val` (`style.css:3765-3776`). `updateHUD(toolKey)` is byte-identical in `index.html:704-734` and `AI.html:664-694` (`diff` shows 0 differences).
- **Canvas**:
  - index hero: `<canvas id="hero-canvas">` (`index.html:69`), with `resize()`/`animate()` at `:564/:617`.
  - music.html has **2** `<canvas>` elements **[fixed; was 3]**:
    - `#audio-canvas` header particles (`resizeHeaderCanvas`/`animateHeaderCanvas` at `music.html:1669/1740`);
    - `#vj-canvas` visualizer (`music.html:361,646`), which draws `drawPeakParticles` (`:1282`) and `getDynamicSpectrumColor` (`:1231`).
- **Audio-reactive**:
  - `animateHeaderCanvas` sums `AnalyserNode` bins 0-79 into `musicEnergy` (`music.html:1745-1752`).
  - That value scales the particle speed through `speedMult = 1.0 + musicEnergy * 3.5` (`:1707`). **[fixed line refs]**
  - Accent colors come first from the hand-curated `track.colors` (`applyTrackColors`, `:773`). Artwork extraction (`extractColorPalette`, `:813`, called at `:807`) is only the fallback. **[fixed]**
- **Custom cursor**: none (no `cursor:none` / `custom-cursor` hits).

**`prefers-reduced-motion`: absent everywhere.** It has 0 matches in `style.css` and in all 7 HTML files, and there are 0 `matchMedia` calls. Every effect above runs unconditionally. **[fixed]** A CSS `@media (prefers-reduced-motion: reduce)` block alone would not stop the scramble intervals, the idle telemetry or the canvas loops. Those are JS and need a shared `matchMedia` check.

## 3. What Works

- **The audio-reactive canvas is bespoke.** Header particle speed follows live `AnalyserNode` data, and the accent palette is set per track.
- **One consistent signature tic.** The same `scrambleText` code drives nav hover on all pages, plus idle telemetry and skill tags.
- **The command-line/telemetry language fits the practice.** This covers the mono kickers (`// PROFILE`), the HUD spec rows and the mixer chrome.
- **The near-black plus single red accent is disciplined at the token level** (`--bg-950` / `--accent-red`), even though it leaks into literals elsewhere.
- **`work.html` works as a hub** splitting Projects, AI and Experiments. It is a sound content distinction, though the page has no H1 (§1).

## 4. Problems, Measured

### Inline script/style weight per page
(`redesign/content/*.json` → `inline_bytes`; re-measured with Python `HTMLParser`, which matches within ±26 B per page)

| Page | Inline `<script>` bytes | Inline `<style>` bytes | `style=""` attrs |
|---|---|---|---|
| index | 39,114 | 0 | 69 |
| about | 4,266 | 3,921 | 16 |
| work | 5,804 | 0 | 1 |
| music | 60,560 | 5,628 | 31 |
| AI | 27,253 | 0 | 14 |
| experiments | 9,458 | 5,438 | 6 |
| projects | **235,814** | 0 | 2 |
| **Total** | **382,269 (373 KB)** | 14,987 | 139 |

All behaviour ships as inline `<script>`, so none of it is cacheable across pages. projects.html holds 61.7% of all inline JS.

### Duplicated inline JS across pages
Checked with md5 of the same-length slices, plus `diff`:

| Function | Result |
|---|---|
| `toggleMenu()` + its 3 listeners | Byte-identical on **6 of 7** (md5 `69752012…`). about.html differs only by an extra blank line (`about.html:346-352`). **[fixed; was "all 7"]** |
| `scrambleText()` + `bindScrambleHover()` + nav bindings | Byte-identical on **6 of 7: index, about, AI, experiments, music, projects** (md5 `33de3805…`, 2,351 B). **work.html** differs by 2 reworded comments and one blank line. **[fixed; the auditor had music vs work reversed]** |
| Navbar scroll handler | Present on all 7 (`index:538, about:331, work:120, music:484, AI:583, experiments:427, projects:117`). about.html uses `if/else add/remove` instead of `.toggle(cond)` (`about.html:331-338`). |
| `updateHUD(toolKey)` | Byte-identical: `index.html:704-734` = `AI.html:664-694` |

No first-party `<script src>` exists. The only external scripts are Phosphor (all pages) and `w.soundcloud.com/player/api.js` (music).

### Heaviest local assets
`du -b` / `du -h`; `img/` total **156 MB** (161 git-tracked files)

| File | Size (MiB) | Used as |
|---|---|---|
| `img/marimekko/Vernon_GDES50014_billboard1–4.png` | 20.2 / 19.7 / 21.8 / 21.5 (83.3 total) | Main image `#active-billboard-img` **and** its 4 thumbnails (`projects.html:1482,1495,1505,1515,1525`) **[fixed]** |
| `img/powersurge/powersurgegif2.gif` | 18.1 | `#active-ps-img` swap and thumb (`projects.html:755-778`) **[fixed line refs]** |
| `img/powersurge/powersurgegif.gif` | 14.9 | same |
| `img/marimekko/page_37_img_{0,1,2}*.png` | 2.3 / 3.1 / 2.6 | case-study body **[fixed; was 1.3–3.2]** |

**[fixed]** The billboard thumbs and the main image share URLs, so each PNG is fetched once, not twice. Rendering that gallery still pulls about 83 MiB of full-resolution PNG to fill thumbnail-sized boxes. The markup only reaches the DOM when that case study's slide-over opens, because it is a `mediaSrc` template string inside `PROJECTS_DATA`.

**[added]** Most project media is not in `img/`. There are 55 `src` references to `https://assets.willvernon.online/...` in projects.html, versus a handful of `img/` paths.

**`srcset`: 0** in all HTML and CSS. **`loading="lazy"`: 0 on `<img>`.** The single hit is on the Spotify `<iframe>` (`music.html:313`). **[fixed]**

### Image attributes
Static `<img>` counts (json → `img`, re-counted with HTMLParser):

| Page | index | about | work | music | AI | experiments | projects |
|---|---|---|---|---|---|---|---|
| `<img>` | 20 | 1 | 1 | 2 | 21 | 1 | 1 |
| missing alt | 0 | 0 | 0 | 0 | 0 | 0 | 0 |
| missing width/height | 20 | 1 | 1 | 2 | 21 | 1 | 1 |

- **47/47 static images have alt text and 0/47 have width/height.**
- **[added]** projects.html also builds **110 `<img` strings** in JS (`grep -o "<img[^>]*>"`). None has width/height, and 1 has no alt (`#xbox-lb-img`).

### Render-blocking `<head>` (identical on all 7, `index.html:8-17`)
1. Google Fonts CSS (`:11`), after two `preconnect`s, with `&display=swap`.
2. The Phosphor `<script>` (`:14`), with no `defer`/`async`. It goes through a 302 redirect, then injects 6 more stylesheets. It sits **before** style.css.
3. `style.css?v=19` (`:17`).

### Cache-busting and live headers
- `style.css?v=19` is used on all 7 pages. It is a manual version number, not a content hash.
- **[added]** The live site is behind Cloudflare (`server: cloudflare`). `curl -sI` returns `cache-control: public, max-age=0, must-revalidate` for `/`, `style.css`, the billboard PNG and the powersurge GIF. So `?v=19` currently buys nothing: every asset, including the 20 MB PNGs, is revalidated on every view. `style.css` is served with `content-encoding: br`.
- `/index.html` returns **307 → `/`**.
- The live `style.css` md5 equals local and `main` (`9c1e7ec2…`).

### projects.html inline data model
- `PROJECTS_DATA` starts at `projects.html:198` and closes at `:2778`.
- It embeds **13 `<style>` blocks, 68,726 B of CSS**, inside `mediaSrc` template strings **[fixed; the auditor said `desc`]**. An example is the `.billboard-gallery-container` rules at `:1376-1472`.
- `renderProjects` (`:2791`) builds each card with `createElement('div')` + `innerHTML`.
- The case-study copy is not in the static HTML.

### Focus/keyboard issues
- **Project cards are `<div>`s.** They are created at `projects.html:2794-2795` and given a click listener at `:3160-3163` **[fixed line refs]**. They have no `role`, `tabindex` or key handler, and `tabindex|role="button"` has **0 hits site-wide**.
- **[fixed; was "60 div onclick"]** projects.html has 61 `onclick=`:
  - **12** are on `<div class="xbox-grid-card">` (`:2213+`) and are not keyboard reachable;
  - **49** are on `<button>` thumbs (so-, dune-, billboard-, aidraft-, as-, xbox-*-thumb-btn), which are focusable.
- **[added]** Other div-onclick triggers:
  - `AI.html` has 4 `<div class="ai-card" onclick="openDrawer(...)">` (`:196,216…`);
  - `experiments.html` cards are `div.project-card` with `setAttribute('onclick', …)` (`:356-358`).

  So all three case-study archives need a pointer device.
- **Dialogs.** `role="dialog" aria-modal="true"` appears on `projects.html:111` and `AI.html:289`. There is no `.focus()` call in either file and no focus trap. The AI drawer also has **no Escape handler**.
- **Mobile menu**: no `aria-expanded`, no Escape handler (§1).
- **[added]** There is no skip link on any page, and work.html has no `<h1>`.

### Measured color contrast (WCAG, vs `--bg-950` #020000; recomputed)
| Token | Hex | Ratio | AA 4.5:1 |
|---|---|---|---|
| `--text-main` | #d1d1d1 | 13.72 | Pass |
| `--text-gray-500` | #9ca3af | 8.25 | Pass |
| `--text-muted` | #6b7280 | **4.33** | **Fail**, 22 `color:` declarations (includes the burger icon) |
| `--accent-red` | #D91C1C | **4.12** | **Fail**, 59 declarations, of which **32 are text `color:`** (20 border-color, 7 background-color) **[fixed]** |

Both colors sit just under 4.5. Either a small lightening or limiting red text to ≥18.66px bold / 24px would clear AA.

## 5. Impeccable-style Critique Summary

**Design-specificity verdict: mostly pass.** The console/scramble language and the audio-reactive header are specific to this practice. The generic layer is the implementation: copy-pasted boilerplate, no motion preference support, div-based click targets.

### Top 5 weaknesses
1. **No shared behaviour layer.** `toggleMenu`, the scramble code and the scroll handler are copied into 7 pages, with small drift (about.html, work.html). That is 382 KB of uncacheable inline JS.
2. **Motion has no off switch.** There is zero `prefers-reduced-motion` handling in CSS or JS.
3. **All three archives are keyboard-inaccessible.**
   - projects.html: the project cards and 12 Xbox grid cards;
   - AI.html: the 4 AI cards;
   - experiments.html: the cards.

   All of these are `div` click targets. The dialogs have no focus management.
4. **Asset weight.**
   - About 83 MiB of billboard PNGs render as their own thumbnails, plus 33 MiB of GIFs.
   - There is 0 srcset and 0 lazy `<img>`.
   - Live `max-age=0` forces revalidation of everything.
5. **The brand accent fails AA as text.** `--accent-red` is 4.12 in 32 text declarations, and `--text-muted` is 4.33 in 22.

### Top 5 strengths
1. A real audio-reactive visual system on music.html (`AnalyserNode` → particle speed, per-track palette).
2. One consistent scramble interaction across the site.
3. The work.html hub separates Projects, AI and Experiments.
4. 100% alt coverage on the 47 static `<img>` (109/110 in the projects JS strings).
5. A coherent near-black plus red token core, though 84 hex literals and 2 undefined tokens leak around it.

## Inventory spot-check
`random.seed(7); random.sample(lines starting "- [ ]", 30)` over `redesign/content/INVENTORY.md` (1,429 items). Each item was checked with `grep -F` of a distinctive substring against its source page.

- **Found: 30/30.**
  - Ambiguous values were confirmed in context: `index.js.309` is `step: 1` in the vocals block, and `index.js.254` is `step: 10` as drums[0].
  - `AI.copy.051` "AI Projects & Case Studies" matches the literal `&` in AI.html.
- Not found: none. There are no extractor errors in this sample.
- Caveat: 757 of the 1,429 items are `.js.` script-data entries, and 93 of those are raw config `value` items (e.g. slider `step`, palette `h`/`s`). Those are parity noise rather than user-facing copy, so the Phase 6 diff should weight them accordingly.

---
*Evidence basis: grep/sed slices of the 7 HTML files and style.css; `redesign/content/*.json`; Python `HTMLParser` re-counts; md5sum/diff of function slices; `du -b img`; `curl -sI https://willvernon.online/...` and unpkg; the WCAG formula on the `:root` hex values; a visual read of both baseline sheets.*

Verified by Opus adversarial pass: 64 claims checked, 31 corrected.
