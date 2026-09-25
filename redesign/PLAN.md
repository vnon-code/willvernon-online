# willvernon.online v2: rebuild plan

**⚠ Direction change (user, 2026-09-25, after Phase 3):** direction A (Signal Console) is retired. See §4 **Phase 2b** below: a ground-up minimal brutalist redesign with moving grid lines. §1 is kept as history only; where it conflicts with Phase 2b or CLAUDE.md, those win.

**Status (original):** Phases 0 and 1 are complete. **Approved by the user on 2026-09-25: direction A plus every proposal in §7.** Phase 2 is next.
**Quality bar:** Awwwards Site of the Day. Scored on Design 40 / Usability 30 / Creativity 20 / Content 10 against the "Awwwards bar" in `REFERENCES.md`.
**Inputs:**
- `AUDIT.md` (verified audits in `audit/`)
- `REFERENCES.md` (12 sites + section patterns)
- `directions/` (A/B/C specs + `JUDGEMENT.md`)
- `content/INVENTORY.md` (1,429-item parity list)
- `PROGRESS.md` (state + spend)

---

## 1. Design directions

The full specs, with every token, contrast ratio, grid, motion token and homepage screen, are in `directions/*.md`. Each summary here gives the values that matter. All three keep: the dark ground, red as the single signal colour, mono HUD metadata, scramble, telemetry, audio-reactive canvases, and exactly one WebGL moment.

### ★ A: Signal Console (recommended; judge score 8.05)

The site as a calibrated instrument: every HUD readout is tied to real state (scroll position, active channel, track BPM), so the telemetry is information, not decoration.
- **Type:**
  - Archivo variable (OFL), used two ways: display at `wdth 62`, weight 900, for gauge-stencil lettering (display is 10× body at 1440); body at `wdth 100`, weight 400/500/700
  - JetBrains Mono 400/500/700 for telemetry and captions
  - 2 families in total, self-hosted
- **Colour:**
  - `--bg #050505`
  - `--text #EDEDED` (17.41:1)
  - `--text-muted #7D838A` (5.32:1)
  - `--accent #FF3B30` (5.75:1; replaces the failing #D91C1C)
  - `--accent-2 #FFB000` (11.12:1, capped at 5% of usage)
  - hairline `--line` rules and calibration ticks
  - no neon green or cyan
- **Grid:** 4 / 8 / 12 columns at 390 / 768 / 1440, a visible calibration ruler, and numbered "channels" (`CH-01 … CH-07`) as the section system.
- **Motion:**
  - one CustomEase family (`consoleOut`, `consoleInOut`)
  - duration tokens: fast, base, slow
  - SplitText line reveals on headings
  - ScrambleText on **mono metadata only**
  - a ScrollTrigger-scrubbed ruler on case-study process steps
  - every effect has a `gsap.matchMedia()` reduced-motion branch
- **Signature WebGL:** an **OGL scope field** (~8 KB gzip) behind the home hero.
  - Idle traces are seeded from a build-time amplitude envelope of the real *Catching Flies – Silver Linings (vnon Bootleg)* stems (~4 KB JSON), so the moment is authored rather than noise.
  - On /music the same scope runs in audio-reactive mode.
  - Loading: lazy-started after the page's main content loads, paused offscreen, pixel density capped at 1.5, with a static SVG trace poster as fallback.
- **Transitions:** a "channel switch", using the native View Transitions API across Astro pages (`view-transition-name` on row title and thumbnail) plus a 2 px accent scanline sweep. Flip handles in-page reflow and the lightbox only.
- **Cursor:** the native pointer stays visible, with an 8 px accent ring following 1:1 on pointer devices only.
- **Home composition:** first screen is the scope field, the readout `DESIGN & MUSIC // OXFORD BROOKES ALUM`, the H1 "WILLIAM VERNON" (server-rendered, SplitText reveal, never scrambled because it is the LCP element), the tagline and 3 CTAs. The second screen is a numbered project index with hover preview. The third is "AI as a Creative Partner" with the toolset readout, then the stems console and the contact channel.
- **Grafted from the runners-up (judge):**
  - C: BPM-locked telemetry once a track is armed (the tick and scramble intervals lock to 60000/bpm)
  - C: the View Transitions hop from index to case study
  - C: pre-baked stem envelope data
  - B: a right-rail detail panel on process steps
  - B: discipline chips and an INDEX/INFORMATION toggle on /work
- **Risk:** the HUD system could become dense; mitigated by the 5% amber budget, red having a single job, and readouts only where they carry data.

**Other directions:**
- **B: Editorial Brutalist Grid (7.10).** Swiss editorial rigour with huge kinetic Archivo display type, a visible 12-column grid, an index-style project list and OGL cursor distortion on previews. It is strong typographically but the least HUD-like, and its type ratio (8.98×) misses the bar. Risk: it loses the technical personality.
- **C: Waveform Studio (7.40).** Audio-first, with a transport-bar nav, waveform dividers and an OGL audio-reactive point-cloud hero. It is the most creative, but the costliest, and it assumes stems exist for all 5 tracks (only *Silver Linings* has them). Risk: build cost and content it doesn't have.

---

## 2. Stack decision: Astro (static output) + GSAP + OGL

**Why a build step is justified here:**
- **Duplication:** 7 pages duplicate nav, footer, head and ~382 KB of inline JS (toggleMenu, scramble and HUD are byte-identical across pages). Astro layouts and components remove that.
- **Content in code:** projects/AI/music/experiments content lives in JS literals with HTML strings. Astro content collections turn it into typed JSON with one source of truth.
- **Images:** `astro:assets` / sharp generate width/height, AVIF/WebP derivatives and `srcset` (0 of 157 images have dimensions today).
- **npm packages:** self-hosted fonts (@fontsource-variable) and an inlined subset of Phosphor SVGs replace render-blocking CDN calls.
- **Publishing boundary:** a `dist/` output is the cleanest guard. Only built files publish, never `redesign/`, scripts or `CLAUDE.md`.
- **Zero-JS default:** islands ship only the GSAP/OGL code a page uses. No framework runtime (vanilla TS components).

**Config:**
- `astro.config.mjs`: `output: 'static'`, `build.format: 'file'`, so `about.html` and friends are emitted. Workers `html_handling: auto-trailing-slash` then keeps today's behaviour: `/about.html` → 307 → `/about`, 200.
- `wrangler.jsonc`:
  ```jsonc
  "build": { "command": "npm ci && npm run build" },
  "assets": { "directory": "./dist", "not_found_handling": "404-page", "html_handling": "auto-trailing-slash" }
  ```
  `compatibility_date` stays unchanged.
- `.assetsignore`: this was needed only because the directory was the repo root. It is kept harmless, since `dist/` holds only build output.
- `.node-version` → `22`, and `package-lock.json` is committed.
- **Workers Builds** already builds every branch push and gives a preview alias: `https://redesign-v2-willvernon-online.wvernoncsi.workers.dev` (confirmed by the check run on this branch). Phase 2 proves the new build runs there **before** anything reaches main. If the dashboard has a custom build or deploy command that conflicts with this, stop and ask the user; never change dashboard settings.
- **Layout moves:**
  - legacy root `*.html`, `style.css` → `legacy/` (reference only, not published)
  - `img/`, `audio/` → `public/img`, `public/audio`, so the `/img/...` and `/audio/...` paths stay identical
  - R2 URLs are untouched

---

## 3. Architecture

```
src/
  styles/tokens.css        colour, type, space, motion tokens (CSS custom properties)
  styles/base.css          reset, typography, grid, focus-visible, reduced-motion defaults
  layouts/Base.astro       <head>: title/meta/OG/canonical/JSON-LD, fonts preload, skip link, Nav, Footer, transition root
  components/              Nav, MobileMenu, Footer, HudReadout, ChannelLabel, ScrambleMeta, Ruler,
                           ProjectIndexRow, CaseStudy, ProcessStep, MediaFigure, VideoPlayer, Lightbox,
                           EmbedFacade (SoundCloud/Spotify/YouTube click-to-load), StemsConsole,
                           TrackChapter, ToolsetDirectory, ContactForm (Formspree, kept), Cursor, SignalScope
  motion/                  gsap.ts (register plugins once), eases.ts, primitives: reveal, scramble, ruler,
                           transition, cursor, all wrapped in gsap.matchMedia with reduced-motion branches
  webgl/scope.ts           the ONE OGL program (lazy import, IntersectionObserver pause, DPR cap)
  content/                 projects.json, ai.json, experiments.json, tracks.json, toolset.json, site.json
  pages/                   index, about, work, projects (+ projects/[slug] optional), music, AI, experiments
public/                    img/, audio/, _headers, _redirects, robots.txt, favicon, og/
```

- **Content flow:** `redesign/scripts/build_content.py` converts `redesign/content/*.json` (`js_data` + DOM text) into `src/content/*.json`. The HTML-string `mediaSrc` blobs (13 embedded `<style>` blocks, grids, mockups) become structured `media[]` arrays (`{type, src, alt, caption, layout}`). Copy is never retyped by hand. Every item keeps its INVENTORY ID in a `_src` field so the parity diff can trace it.
- **Assets:**
  - R2 URLs are kept verbatim.
  - Local images get derivatives (480/960/1600 widths, AVIF+WebP, explicit width/height) and `loading="lazy"` below the fold. Only the hero preloads.
  - Video: `preload="none"` + `poster` (a poster frame generated at build from R2 where no poster exists, else the first process image), autoplay only when muted and in view, paused offscreen.
  - The 20–22 MB billboard PNGs and 15–19 MB GIFs: serve derivatives on the pages and keep the originals linked as "full-res" (see open question 2).
- **Icons:** only the Phosphor glyphs actually used, inlined as SVG at build.
- **Fonts:** Archivo variable (wdth + wght axes) + JetBrains Mono, subset to Latin, `font-display: swap`, and a preload for the display cut.

### Back end: edge layer (built) and proposals (not built)

**Built in Phase 2**, with no dashboard change and no Worker script needed (static config only):
- `public/_headers`:
  - `Content-Security-Policy`, allowing only the origins in use: self, `assets.willvernon.online`, `w.soundcloud.com`, `open.spotify.com`, `www.youtube-nocookie.com`/`youtube.com`, `formspree.io` (form-action), and `cdn.jsdelivr.net` only if still needed. `frame-ancestors 'none'`.
  - `Strict-Transport-Security: max-age=31536000`
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` (camera, mic, geolocation off)
  - `Cache-Control: public, max-age=31536000, immutable` on `/_astro/*`; HTML stays `max-age=0, must-revalidate` (today's default)
- `public/404.html` in the HUD style ("SIGNAL LOST"), with `not_found_handling: "404-page"`. Today's 404 is an empty body.
- `public/_redirects` for any renamed path. None are planned, since all 7 URLs are kept. `robots.txt` and `sitemap.xml` via `@astrojs/sitemap`.
- Canonical tags pointing at `https://willvernon.online/<page>`. These also neutralise the GitHub Pages mirror as a duplicate.

**Proposed only, for the user to decide** (each needs account resources, secrets or a dashboard action):

| Option | Value | Needs |
|---|---|---|
| Keep Formspree for contact (default) | Works today | nothing |
| Worker contact endpoint (replaces Formspree) | First-party, spam control via Turnstile | email-service API key as a Worker secret + a Turnstile site key (dashboard) |
| Cloudflare Web Analytics | Cookie-free traffic insight | a site tag in the dashboard; CSP adds `static.cloudflareinsights.com` |
| Stems for all 5 tracks via R2 | Makes the stems console work beyond *Silver Linings* | the user uploads stems to R2 |
| D1/KV content or a CMS | Edit without deploys | D1/KV creation; overkill for 7 pages; **not recommended** |
| Disable the GitHub Pages mirror | Removes the duplicate public copy (it also serves `upload_to_r2.py`) | repo Settings → Pages (user) |

---

## 4. Phases

Every phase runs in a **fresh session** that resumes from `CLAUDE.md` + this file + `PROGRESS.md`.

**Workflow shape for every build phase:**
1. Build: the main loop, or at most 4 Sonnet workers for independent pages/components.
2. Verify: an adversarial Opus pass on the diff, with parity diff, axe, Lighthouse and one screenshot sheet.
3. Fix once, then re-verify only what failed.

End each phase by committing and pushing to `redesign/v2`, then checking the Workers preview alias.

**Global acceptance targets** (Phases 3–6 on their pages, Phase 6 site-wide):
- Parity: every INVENTORY ID for the page is present, checked by `extract_content.py --root dist` and a hash diff. Unmatched items need a written justification (e.g. merged copy) approved in PROGRESS.md.
- Lighthouse mobile (preview URL): Performance ≥ 85 (WebGL deferred), Accessibility ≥ 95, SEO ≥ 95, Best Practices ≥ 95. Desktop Performance ≥ 95. It must beat the baseline (index mobile perf 81, LCP 4.05 s) on every page.
- axe: 0 serious or critical issues. Every text colour meets AA contrast. Keyboard reaches every interactive element, with visible focus. The dialog/lightbox traps focus and closes on Esc.
- Reduced motion: with `prefers-reduced-motion: reduce`, there is no scramble, no WebGL, no smooth scroll and no parallax; content is fully visible.
- Responsive at 390 / 768 / 1440 with no horizontal scroll. Nav is reachable on mobile (today the burger is invisible without the icon font).
- No console errors. The 187 URLs from `assets.json` still resolve.

### Phase 2: design system, shell, motion primitives, edge layer, build config ($30)

**Scope:**
- Astro scaffold and config
- the file moves (legacy/, public/)
- `wrangler.jsonc` / `.node-version`
- tokens.css / base.css from direction A
- Base layout (head, meta, OG, canonical, JSON-LD Person), Nav + MobileMenu, Footer
- motion primitives (reveal, ScrambleMeta, ruler, View Transition + scanline, cursor)
- the SignalScope OGL island with envelope JSON and poster fallback
- `_headers`, `404.html`, robots, sitemap
- `build_content.py` → `src/content/*.json`
- a `/styleguide` page, noindexed and excluded from the sitemap

**Skills:** impeccable (shape/polish), emil-design-eng, animate, gsap-core, gsap-timeline, gsap-scrolltrigger, gsap-performance, seo-audit (head/meta).

**Acceptance:**
- Workers Builds check run succeeds on the branch and the preview alias serves the new shell.
- Headers are verified with `curl -I` on the preview.
- `/about.html` still resolves on the preview.
- The styleguide meets contrast/axe with 0 serious issues.
- The scope runs at 60 fps and stops under reduced motion.
- `build_content.py` output round-trips the INVENTORY hashes for all 7 pages (content only, no layout yet).

**Kickoff prompt:**
```
Phase 2 of the willvernon.online rebuild. Read CLAUDE.md, redesign/PLAN.md (§2 Stack, §3 Architecture, §4 Phase 2) and redesign/PROGRESS.md. Install the skills listed in CLAUDE.md. Branch redesign/v2.
Use a workflow: build → Opus adversarial verify → fix once. Budget $30; record spend in PROGRESS.md.
Build the Astro scaffold, the tokens/base CSS from redesign/directions/A-signal-console.md (with JUDGEMENT.md grafts), Base layout, Nav/MobileMenu/Footer, motion primitives, the SignalScope OGL island, the edge layer (_headers, 404, robots, sitemap), wrangler.jsonc build config, and build_content.py → src/content. Do not build page bodies yet.
Verify on the Workers preview alias (see PLAN §2). If Workers Builds cannot run the build without a dashboard change, stop and tell me. Commit, push, update PROGRESS.md (spend + "Skills used" lines), then continue with the Phase 3 kickoff prompt from PLAN.md.
```

### Phase 3: home, about, work ($25)

**Scope:**
- **Home:** hero, project index, AI partner and toolset, stems console for *Silver Linings* (5 stems, FX sliders with **labels**, which fixes the critical axe issue), contact with the Formspree form.
- **About:** personality, skills with discipline glows, education, experience, credentials accordion, social links with accessible names.
- **Work:** hub with an INDEX/INFORMATION toggle. Projects, AI and experiments also go into the primary nav (IA fix).

**Skills:** impeccable, find-animation-opportunities, animate, gsap-scrolltrigger, review-animations (verify step).

**Acceptance:** the global targets for these 3 pages, 100% parity for `index.*`, `about.*` and `work.*` IDs, and work.html gets an H1.

**Kickoff prompt:**
```
Phase 3 of the willvernon.online rebuild. Read CLAUDE.md, redesign/PLAN.md §4 Phase 3 and redesign/PROGRESS.md. Install the skills in CLAUDE.md. Branch redesign/v2.
Use a workflow: build (up to 3 Sonnet workers, one per page, on the Phase 2 components) → Opus adversarial verify (parity diff vs INVENTORY for index/about/work, axe, Lighthouse on the preview alias, one 3-breakpoint contact sheet) → fix once. Budget $25; log spend and Skills used in PROGRESS.md.
Commit, push, then continue with the Phase 4 kickoff prompt.
```

### Phase 2b: ground-up redesign — minimal brutalist + moving grid ($18; runs after Phase 3, before Phase 4)

**Why:** the user rejected the techy/HUD feel and the scope hero after seeing Phase 2–3. "From the ground up" includes colour scheme and everything visual; design the site as if the old one never existed. **Content parity still applies** (design only changes; every INVENTORY item stays).

**Direction (user brief):** minimal brutalist; visible grid lines as the signature (like cloudflare.com), but the lines move, draw and respond to scroll; bold, raw, very dynamic motion on a minimal design. One direction, built directly (no A/B/C pick).

**Scope:**
- Reference sweep first: current brutalist / grid-line / minimal-kinetic sites (cloudflare.com grid, Awwwards SOTD/Developer winners via web search + godly/siteinspire; awwwards.com is egress-blocked). Screenshot via `screenshots.mjs`, write `redesign/directions/D-brutalist-grid.md` (palette, type, grid, motion tokens, hero, per-page composition) grounded in what the references do.
- New tokens.css/base.css/motion.css (new palette + type; retire Archivo-wdth-62/JetBrains-HUD pairing unless the references justify it), new grid-line system (DOM/SVG/CSS lines on the layout grid, GSAP ScrollTrigger-driven draw/shift/scrub; reduced-motion = static lines).
- Remove: SignalScope/OGL hero (and `ogl` dep if unused), HudReadout, ChannelLabel/CH-xx system, scramble, cursor ring, BPM telemetry chrome. Keep GSAP (core/ScrollTrigger/SplitText/Flip) and View Transitions.
- New Nav/MobileMenu/Footer/Base styling and new hero; restyle Phase 3 pages (home/about/work) onto the new system, keeping their structure, content wiring, a11y and parity.
- Styleguide page updated.

**Verify:** A/B judge panel (Opus) — our pages vs 3–4 reference sites at 1440/390, same criteria as Phase 6 (Design 40 / Usability 30 / Creativity 20 / Content 10), target ≥ 7.5 each and not clearly behind the references; plus the global targets (parity 100% via `check_dom_parity.py`, axe 0 serious, reduced motion, no overflow, Lighthouse on the preview). Fix once.

**From here on, every page phase (4, 5) ends with the same A/B reference judge on its pages**, not only Phase 6.

**Kickoff prompt:**
```
Phase 2b of the willvernon.online rebuild: ground-up redesign. Read CLAUDE.md, redesign/PLAN.md §4 Phase 2b and redesign/PROGRESS.md. Install the skills in CLAUDE.md. Branch redesign/v2.
Use a workflow: reference sweep (≤3 Sonnet, live sites + screenshots) → direction spec (Opus) → build (≤3 Sonnet: tokens/grid-line system + shell; motion; restyle home/about/work) → Opus verify incl. A/B Awwwards reference judge → fix once. Budget $18; log spend and Skills used in PROGRESS.md.
Commit, push, check the preview, then continue with the Phase 4 kickoff prompt.
```

### Phase 4: projects ($35)

**Scope:**
- A project index (numbered rows, hover preview) plus the 7 case studies:
  - Amplified Spaces
  - Handheld Stories
  - Remnants
  - Powersurge
  - Marimekko Exhibition
  - Smuggler's Outpost
  - The World Plays Here (16 OOH/device mockups)
- Each case study covers process steps with the scrubbed ruler and right-rail detail, outcome media, lightbox and filters (software/discipline).
- **Decision to confirm at the start of the phase:** either keep a single `projects.html` with the slide-over (preserves the URL), or add `/projects/<slug>.html` pages plus a slide-over-free index. Recommended: **both**. The index stays at `projects.html`, and each case study also gets its own page for SEO and deep links. The legacy slide-over behaviour is replaced by a View Transition to the case-study page.
- The 13 embedded `<style>` mockup blocks become structured media layouts.

**Skills:** impeccable, emil-design-eng, animate, gsap-scrolltrigger, gsap-performance, review-animations.

**Acceptance:**
- global targets
- 100% of the 513 `projects.*` IDs
- every R2 video has a poster and `preload="none"`
- the billboard derivatives are each under 500 KB

**Kickoff prompt:**
```
Phase 4 of the willvernon.online rebuild. Read CLAUDE.md, redesign/PLAN.md §4 Phase 4 and redesign/PROGRESS.md. Install the skills in CLAUDE.md. Branch redesign/v2.
Use a workflow: pipeline the 7 case studies as items (Sonnet worker per case study, max 4 concurrent, each followed by an Opus verify of that case study's INVENTORY IDs + media), then one Opus pass over the index page (axe, Lighthouse, contact sheet). Fix once. Budget $35; log spend and Skills used in PROGRESS.md.
Commit, push, then continue with the Phase 5 kickoff prompt.
```

### Phase 5: music, AI, experiments ($26)

**Scope:**
- **Music:** "ALIAS: VNON", the 5 track chapters with per-track palettes from TRACKS_DATABASE (hand-curated first, artwork extraction as fallback), BPM/key telemetry, the stems console, the scope in audio mode, and 2D canvases for per-channel visualisers. SoundCloud/Spotify/Bandcamp embeds sit behind click-to-load facades with titles (fixes the frame-title issue).
- **AI:** Ethos "Artificial Acceptance", the 4 AI projects with drawer/lightbox, and the platform and model directory marquee.
- **Experiments:** the 5 experiments as looping media.

**Skills:** impeccable, animate, gsap-core, gsap-performance, review-animations.

**Acceptance:** global targets and 100% of the `music.*`, `AI.*` and `experiments.*` IDs. The audio never autoplays; it starts only on a user gesture.

**Kickoff prompt:**
```
Phase 5 of the willvernon.online rebuild. Read CLAUDE.md, redesign/PLAN.md §4 Phase 5 and redesign/PROGRESS.md. Install the skills in CLAUDE.md. Branch redesign/v2.
Use a workflow: build (3 Sonnet workers: music, AI, experiments) → Opus adversarial verify per page (parity, axe, Lighthouse on preview, audio gesture rules, reduced motion) → fix once. Budget $26; log spend and Skills used in PROGRESS.md.
Commit, push, then continue with the Phase 6 kickoff prompt.
```

### Phase 6: QA, fix everything, open the PR ($30)

**Scope:**
- **Find** (4 parallel lenses):
  1. Parity diff across the whole site vs INVENTORY
  2. a11y (axe on all pages and states, keyboard walk-through, reduced motion)
  3. Performance and responsive (Lighthouse mobile/desktop on the preview, 390/768/1440 sheet)
  4. Links/assets/SEO carry-over (`extract_content.py --check-assets` on dist; seo-audit: titles, H1s, meta descriptions drafted from existing hero copy, OG image, canonical, JSON-LD, sitemap)
- **Judge:** an Opus Awwwards panel scores against the REFERENCES bar (target ≥ 7.5 on each criterion) plus impeccable and review-animations passes.
- **Adversarial verify** of each finding, then fix all confirmed findings, re-run the failed checks, and open a PR `redesign/v2 → main` that includes the checklist results.

**Acceptance:** the release gate below passes on the preview.

**Kickoff prompt:**
```
Phase 6 of the willvernon.online rebuild. Read CLAUDE.md, redesign/PLAN.md §4 Phase 6 + §5 Release gate, and redesign/PROGRESS.md. Install the skills in CLAUDE.md. Branch redesign/v2.
Use a workflow: find (4 lenses: parity, a11y, perf+responsive, links/assets/SEO) → Opus adversarial verify each finding → Awwwards judge panel (Opus, REFERENCES.md bar) + impeccable + review-animations → fix all confirmed findings → re-run failed checks. Budget $30; log spend and Skills used.
Open a PR redesign/v2 → main with the gate checklist in the body. Do not merge. Then continue with the Phase 7 kickoff prompt.
```

### Phase 7: ship to production ($8)

See §5. Inline work, plus one Opus verifier for the live check.

**Kickoff prompt:**
```
Phase 7 of the willvernon.online rebuild: ship. Read CLAUDE.md, redesign/PLAN.md §5 and redesign/PROGRESS.md. Budget $8.
1) Re-run the release gate on the preview alias; if anything fails, stop and report.
2) Tag origin/main as v1-final and push the tag; write the rollback steps into PROGRESS.md.
3) Merge the Phase 6 PR into main (GitHub MCP merge). If merging is blocked (branch protection/permissions), stop with the PR ready and tell me.
4) Wait for the Workers Builds check run on the merge commit to succeed (production deploy), then verify live per §5; if the live site is broken, revert main to v1-final immediately, confirm the old site is back, and report.
5) Final report: live URL, what shipped, total spend vs $250, rollback instructions, Skills used summary for the whole rebuild.
```

---

## 5. Release gate, deploy, rollback (Phase 7)

**Gate** (every item must pass on the preview alias; otherwise stop and report):
- every INVENTORY item ticked
- zero broken links or missing assets
- `npm run build` clean
- no console errors on any page
- the Phase 6 targets met

**Deploy mechanism** (verified in Phase 0; see `audit/backend.md`):
- Cloudflare **Workers Builds** is connected to the repo. A push to `main` builds and deploys production (check run "Workers Builds: willvernon-online"). Non-production branches get preview versions and aliases.
- There is no GitHub Actions deploy.
- The environment has no Cloudflare token, and none is needed, because merging to main is the deploy.
- If a manual `wrangler deploy` is ever needed, stop and give the user the one command: `npx wrangler deploy` from a checkout of main with their own login.

**Rollback:**
1. Before merging: `git tag v1-final origin/main && git push origin v1-final`.
2. If the live site breaks: `git revert -m 1 <merge-sha>` on main and push. Workers Builds redeploys the old tree.
3. Fallback (user, in the dashboard): Workers → willvernon-online → Deployments → roll back to the version before the merge.

**Live verification** (after the check run on the merge commit succeeds):
- all 7 pages at `https://willvernon.online/<page>` (and `.html`) return 200 or 307→200
- the HTML contains a v2 marker (`<meta name="generator" content="Astro…">` plus the tokens CSS hash), so we know it isn't cached v1
- sampled R2 media return 200/206
- embeds load after the facade click
- the home page has 0 console errors (Playwright)
- the security headers are present

---

## 6. Budget

Prices: Opus 5.5 at $4 in / $20 out / $0.20 cache-read per MTok, Sonnet 5 at $2/$10, Haiku 4.5 at $1/$5. Fable is never used.

| Phase | Model / effort / shape | Est. $ | Running |
|---|---|---|---|
| 0+1: audit, references, plan | Opus main + 3 workflows (6 Sonnet, 5 Opus agents) | 22 (est. actual ≈ 14; see PROGRESS) | 22 |
| 2: design system, shell, edge layer, build | Opus main; Opus verify; ≤2 Sonnet workers | 30 | 52 |
| 3: home, about, work | 3 Sonnet builders → Opus verify | 25 | 77 |
| 4: projects (7 case studies) | Sonnet pipeline (≤4 concurrent) → Opus verify each | 35 | 112 |
| 5: music, AI, experiments | 3 Sonnet builders → Opus verify | 26 | 138 |
| 6: QA, fixes, PR | 4 finders (Sonnet) → Opus verify + judge panel → fixes | 30 | 168 |
| 7: ship | Opus inline + 1 verifier | 8 | **176** |
| **Reserve** | fixes, re-runs, surprises | **74** | **250** |

**Overrun rule:** at 120% of a phase budget, stop, write PROGRESS.md and report. Cut in this order:
1. Verifier count (Opus verify batches pages rather than running one per page)
2. Screenshot rounds (end of phase only)
3. Non-signature motion polish (cursor, scanline sweep)
4. Phase 5's pages merged into one shared template

**Never cut:** content parity, a11y, the verification stage or the release gate. Unspent budget from a phase rolls into the reserve.

---

## 7. Risks and open questions

**Risks:**
- **Build config on Workers Builds:** the dashboard may hold its own build command. Mitigation: Phase 2 proves it on the preview alias, and anything else is a user action.
- **Content conversion:** the 13 embedded style/mockup blocks in PROJECTS_DATA make this the largest parity risk. Mitigation: `_src` INVENTORY IDs and the per-case-study verify step.
- **The WebGL moment could hurt mobile performance.** Mitigation: it starts only after the main content loads, pixel density is capped, it pauses offscreen, and the poster fallback always applies below the performance budget.
- **Awwwards scores are subjective.** The Phase 6 panel is a proxy, not a guarantee.

**Decisions (2026-09-25, user answered "yes to all"):** A: Signal Console with its grafts; billboard/GIF derivatives on the pages, originals kept and linked as full-res; `/projects/<slug>.html` pages plus the `projects.html` index; Claude drafts meta descriptions and the OG image for approval in Phase 6; keep Formspree and add Cloudflare Web Analytics (the user creates the site tag in the dashboard, the CSP allows `static.cloudflareinsights.com`); the user disables GitHub Pages; the stems console features only *Catching Flies – Silver Linings*.

**Original questions (answered):**
1. **Direction:** approve **A: Signal Console** with the listed grafts, or choose B or C.
2. **Billboard PNGs (20–22 MB) and GIFs (15–19 MB):** OK to show optimised derivatives with a "full-res" link to the originals, which stay in the repo? Or would you rather upload them to R2 yourself?
3. **Case-study URLs:** OK to add `/projects/<slug>.html` pages alongside `projects.html`?
4. **Meta descriptions and OG image:** OK for me to draft these from existing copy and a frame of an existing project, for your approval in Phase 6?
5. **Back end:** keep Formspree (default)? Add Cloudflare Web Analytics (a dashboard step on your side)?
6. **GitHub Pages mirror:** will you turn it off in repo Settings → Pages? It publicly mirrors the whole repo, including `upload_to_r2.py`.
7. **Stems:** only *Silver Linings* has stems. OK that the stems console features that one track, with the other 4 getting the visualiser only?
