# Progress: willvernon.online v2 rebuild

## ▶ RESUME HERE (paused 2026-09-25, ~$236 of $250 spent, ~$14 left)

**Preview (updates on every push to this branch):** https://redesign-v2-willvernon-online.wvernoncsi.workers.dev
**Live site:** unchanged (v1 still on `main`). Nothing has been deployed.

| Area | State |
|---|---|
| Plan, audit, content inventory (1,429 items), references | ✅ done |
| Foundations: Astro build to `dist/`, `_headers`, 404, sitemap, content pipeline | ✅ done; Workers Builds passes |
| Design: minimal brutalist + moving grid lines (Phase 2b; replaced direction A) | ✅ done |
| Home, About, Work (Phase 3, restyled in 2b) | ✅ built, 100% content parity, 0 axe violations |
| Projects index + 7 case-study pages (Phase 4) | ✅ built (commit 297cfb3). ⏳ Its final gates (preview Lighthouse, A/B judge) were interrupted over budget |
| Music, AI, Experiments (Phase 5) | ⏳ **not built** (the routes exist on the preview but are unfinished) |
| QA + PR (Phase 6) | ⏳ not started |
| Ship to production (Phase 7) | ⏳ not started. Do **not** merge to `main` before Phase 5 is built, because v2 replaces every page |

**Next steps, in order:** (1) Phase 5, one page per session if the budget is tight (music → AI → experiments); (2) Phase 4's leftover gates, folded into Phase 6; (3) Phase 6 QA + PR; (4) Phase 7 ship. Kickoff prompts are in `redesign/PLAN.md` §4. Estimated remaining cost: ~$60–80 at the observed real rates.
**Budget rule for every session:** read your real cost with the Claude Code Remote `get_session` tool (no id): `usage.cost_usd`. Token estimates ran 2–2.5× low. Stop at the phase budget.

### Working on another device
```
git clone https://github.com/vnon-code/willvernon-online.git
cd willvernon-online && git checkout redesign/v2
npm ci
npm run dev        # local dev server (Astro)
npm run build      # production build to dist/
```
- Content is generated: `pip install beautifulsoup4 lxml`, then `npm run content`. Check parity with `npm run content:check`.
- For a Claude session: rules are in `CLAUDE.md`. Skills are gitignored, so reinstall them with the command in CLAUDE.md.
- `legacy/` holds the old site for reference; it never ships.

---


## Status

| Phase | State | Branch head / notes |
|---|---|---|
| 0: audit | ✅ done | inventory (1,429 items), 3 verified audits, baseline sheets |
| 1: plan | ✅ done, **approved 2026-09-25 (A, yes to all §7)** | PLAN.md, REFERENCES.md, directions A/B/C + JUDGEMENT.md |
| 2: design system + shell + edge | ✅ done 2026-09-25 | Astro 7 scaffold, tokens/base, Base/Nav/MobileMenu/Footer, motion primitives, OGL SignalScope, _headers/404/robots/sitemap, build_content.py (100% content parity, 7 pages). Workers Builds green; preview alias verified. |
| 3: home, about, work | ✅ done 2026-09-25 (structure/content/a11y; **styling to be replaced in 2b**) | Home: featured-work index, AI toolset (accessible `<details>`), stems console (Web Audio on gesture, 13 labelled FX sliders), contact + Formspree. About: skills/education/experience/credentials accordion. Work: H1, INDEX/INFORMATION toggle, R2 previews. Nav IA: Projects/AI/Experiments in primary nav. DOM parity 100% (index 303, about 86, work 52); axe 0 violations at 390/768/1440. |
| 2b: ground-up redesign (minimal brutalist + moving grid) | ✅ done 2026-09-25 (**A/B target met on home only**, see below) | Direction D "Ruled Ground" (redesign/directions/D-brutalist-grid.md): paper #F1F1EE / ink #0B0B0B / state-only yellow #FFE14A, Mona Sans variable (wdth axis) as the single family, GridFrame/Rule/Frame/Cross line system with ScrollTrigger scrub draws, scroll-velocity shear, hot bay lines, wdth kinetic H1s, hard-cut View Transitions. SignalScope/OGL/HUD/scramble/CH-xx/cursor/BPM/smoother removed (ogl dep gone). Commits 5c2eab7 (build) + 9e2f9a4 (fix-once). |
| 4 | ▶ next (fresh session) | PLAN.md §4 Phase 4 + the 2b carry-overs below |
| 5–7 | ⏳ | |

**Direction change (user, 2026-09-25):** drop the techy/HUD Signal Console look and the scope hero; rebuild the design from zero as minimal brutalist with moving, scroll-reactive grid lines (Cloudflare-style), bold raw motion; one direction, built directly; A/B against Awwwards-standard reference sites. Content parity unchanged. CLAUDE.md and PLAN.md (Phase 2b) updated.

**Next action:** Phase 4 (projects) in a fresh session, including the Phase 2b carry-overs. User to-dos: disable GitHub Pages (repo Settings → Pages); create a Cloudflare Web Analytics site tag when Phase 6 asks for it.

## Spend ledger (cap $250; plan ≤ $180)
No `/cost` or `/usage` figure is visible from inside this cloud session, so **every figure below is an estimate**, built from workflow token counts and turn counts at the list prices in PLAN.md §6.

| Checkpoint | Item | Tokens | Est. $ | Running est. |
|---|---|---|---|---|
| P0 | Main loop: setup, skills install, extractor, baseline shots (Opus) | ~60 turns, cached context | 3.0 | 3.0 |
| P0 | WF1 audit + verify: 3 Sonnet auditors, 3 Opus verifiers | 696k (subagent) | 4.0 | 7.0 |
| P1 | WF2 reference sweep: 3 Sonnet searchers | 248k | 0.8 | 7.8 |
| P1 | Reference screenshots (script; one contact sheet viewed) | — | 0.2 | 8.0 |
| P1 | WF3 reference analysis (Opus) → 3 directions (Sonnet) → judge (Opus) | 588k | 3.5 | 11.5 |
| P1 | Main loop: PLAN/AUDIT/PROGRESS/CLAUDE.md, completeness critic | — | 1.5 | ≈ 13 |
| P2 | WF4 build: 3 Sonnet builders (shell/tokens/edge, motion+scope, content pipeline) | ~620k (subagent) | 4.0 | 17.0 |
| P2 | WF4 Opus adversarial verify + Opus fix-once (4 blockers, 7 majors, 11 minors → 21 fixed, 1 deferred, 1 needed the preview) | ~465k (subagent) | 6.0 | 23.0 |
| P2 | Main loop: scaffold, Workers Builds proof, preview checks, contact sheet, burger-icon fix | ~40 turns | 2.5 | **≈ 25.5** |

| P3 | WF5 build: 3 Sonnet page builders (home, about, work + nav IA) | ~700k (subagent) | 4.5 | 30.0 |
| P3 | WF5 Opus adversarial verify (2 blockers, 11 majors, 5 minors) + Opus fix-once (all blockers/majors fixed, 1 partial) | ~490k (subagent) | 6.0 | 36.0 |
| P3 | Main loop: DOM parity checker, workflow, gates, direction-change docs | ~30 turns | 2.0 | **≈ 38** |

| P2b | WF6 build: 2 Sonnet reference sweeps, Opus direction spec, 3 Sonnet builders (foundation/shell, motion, pages) | 1.66M (subagent) | 10.0 | 48.0 |
| P2b | WF7 verify: Opus gates + Opus A/B judge, Opus fix-once, Opus re-verify | 0.64M (subagent) | 6.0 | 54.0 |
| P2b | Main loop: setup, gates, footer fix, commits, preview check, Phase 4 handoff | ~25 turns | 2.0 | **≈ 56** |

**Phase 2b budget was $18; the estimate is ≈ $18 (on budget, range $14–22).** No second fix round was run: CLAUDE.md allows fix once, and another round would have gone past budget. The remaining judge gaps go to Phase 4 as carry-overs.

**Phase 3 budget was $25; the estimate is ≈ $12.5 (1.19M subagent tokens).** Lighthouse on the preview and the 3-breakpoint contact sheet were deferred to Phase 2b: the user retired the visual design mid-phase, so measuring and screenshotting a look that is being replaced would be wasted spend.

**Phase 0+1 budget was $22; the estimate is ≈ $13 (range $10–16).** The unspent ~$9 rolls into the reserve.
**Phase 2 budget was $30; the estimate is ≈ $12.5 (range $9–17; 1.08M subagent tokens in total).** The unspent amount rolls into the reserve.

## Skills used

| Phase | Skill | What it did and how it shaped the result |
|---|---|---|
| 0 | impeccable | The front-end auditor used its critique/audit framework: anti-generic assessment, top-5 strengths and weaknesses, and the craft floor that fed the "what works / problems" split in AUDIT.md. |
| 0 | seo-audit | Structured the SEO baseline: the must-preserve list (titles, H1s, URLs, alt text) and quick wins (description, canonical, OG, JSON-LD, sitemap), which became Phase 6 acceptance items. |
| 1 | impeccable | Anti-generic lens for REFERENCES.md (the anti-pattern list) and for each direction draft; the judge used it to strip neon-cyan and three-family type from A. |
| 1 | emil-design-eng | Motion and polish decisions in each direction: a single easing family, a 1:1 cursor rather than a laggy quickTo, restraint on what animates. |
| 1 | find-animation-opportunities | Picked which elements earn motion: the ruler scrub on process steps and scramble only on metadata; rejected scrambling the LCP heading. |
| 1 | gsap-core | Grounded the motion tokens in real GSAP APIs (CustomEase, matchMedia reduced-motion branches, SplitText/ScrambleText, Flip vs View Transitions). |
| 2 | impeccable | Builder A used the craft floor to keep CH-01…07 channels as information, ban eyebrow kickers and tie every HUD readout to real state. The verifier used it to catch hero copy that had been hand-retyped (a dropped '&'). |
| 2 | seo-audit | Shaped Base head (canonical/OG/Twitter, JSON-LD Person from the legacy links, noindex branch). The verifier's crawlability pass removed canonical/og:url from noindex pages and dropped the robots Disallow that hid the noindex. |
| 2 | emil-design-eng | Made reveals fail open (html.js gating + head failsafe) and caught the SplitText parent-opacity bug. |
| 2 | animate | Restraint calls: a 1:1 cursor ring (no quickTo lag) and scramble ≤0.6s on mono metadata only. |
| 2 | gsap-core / gsap-timeline | gsap.matchMedia reduced-motion branches in every module, CustomEase tokens, single-tween reveals instead of timelines. |
| 2 | gsap-scrolltrigger | Ruler scrub → --ruler-progress and aria-current step; once:true reveal triggers. |
| 2 | gsap-performance | Transform/opacity-only animation, HUD text writes skipped when unchanged, Flip/ScrollSmoother lazy-loaded out of the shared bundle, and a verified 0 draws/s for the scope offscreen. |
| 2 | review-animations | Verifier escalation checks exposed the fade/stagger 0→0 no-op, the 4 px scanline and cursor layout transitions. |
| 2b | impeccable | Direction spec D (Ruled Ground): its world/colour calibration kept the palette off near-black+neon and cream+terracotta (it produced paper #F1F1EE / ink / yellow used only for state); its font reflex list led to Mona Sans (wdth axis) replacing Archivo+JetBrains Mono; its craft floor banned eyebrows, cards and section numbers. Context launcher ran; no user probe was possible from the subagent, so the brief was treated as pinned. |
| 2b | emil-design-eng | D spec motion tokens: expo-out draws, no ease-in, hover <200ms, quickTo spring for the velocity shear, transform/opacity only. |
| 2b | gsap-scrolltrigger | D spec line engine: one master ScrollTrigger with cached geometry for rule and frame scrubs plus velocity, batch() for reveals, top-to-bottom creation, refresh after fonts. |
| 0 | workflow-authoring (built-in) | Shaped the three workflows (a pipelined audit into verify, a blind parallel sweep, a directions judge panel). |

| 3 | impeccable | Builders: numbered project index instead of a card grid, AI toolset as an accessible list instead of a hover-only marquee, no invented kickers. Verifier: caught red used as decoration and an 11px mono intro paragraph. |
| 3 | find-animation-opportunities | Gated each motion idea: kept hover/focus preview and accordion markers; rejected decorative level-meter motion and entrance motion on FX sliders. |
| 3 | animate | Transform/opacity only on tokens; the level meter was moved from height to scaleY in the fix pass. |
| 3 | gsap-scrolltrigger | Confirmed the existing data-reveal primitives covered every section, so no new ScrollTrigger instances were added; the verifier flagged a nested double reveal. |
| 2b | impeccable (builders/verify) | Builders A/C read the craft floor directly: the Skill tool said "Unknown skill" inside workflow subagents. C caught its own decorative "Project 01" numbering and a hand-typed "View" CTA; the verifier and judge used it to call out empty grey media boxes, mid-word heading breaks and a wireframe-sparse /work. |
| 2b | gsap-performance / review-animations | Verifier measured 2.4k idle style mutations/s from the shear ticker, per-cross getBoundingClientRect, a first-scroll rule retract and render-blocking CSS. The fix pass detached the idle ticker, batched reads and inlined CSS: local mobile Perf went 81 → 93–97. |
| 2b | gsap-scrolltrigger / animate | Builder B: one master ScrollTrigger + batch() reveals, refresh after fonts, matchMedia reduced-motion = static drawn lines. The fix pass switched SplitText autoSplit to the onSplit revealed-state pattern. |
| 3 | review-animations | Verifier pass on new motion: layout-property meter, double reveal on nested headings, reduced-motion blank video previews on /work (fixed). |

All 10 skills have now been used at least once.

## Setup notes
- **Skills install:** `npx skills add <repo> -a claude-code -s <skill> -s <skill> … -y --copy`. A comma-separated `-s a,b` fails with "No matching skills"; repeat `-s` for each skill instead. All 10 skills installed into `.claude/skills/`, which is gitignored along with `skills-lock.json` and `.agents/`.
- **impeccable:** its CLI script downloads its engine binary from GitHub releases, with sha256 verification. We didn't run it; only SKILL.md and the reference docs were used.
- **Not available in this environment:** the Refero connector and `design:accessibility-review`, so both were skipped. Mobbin (`search_sections` / `search_screens`) was used for section patterns.
- **Network:**
  - awwwards.com stays blocked by the environment's egress policy, so Awwwards evidence came from web search.
  - godly, siteinspire, gsap.com, willvernon.online, assets.willvernon.online and the workers.dev preview are all reachable.
  - Chromium needs the proxy CA: `screenshots.mjs` reads `PROXY_CA_SPKI`, a comma list of base64 SHA-256 SPKI hashes computed from the last certs in `/root/.ccr/ca-bundle.crt`; see the commit that added it. Certificate verification stays on, pinned to the proxy CA.
- **Python deps** for the extractor: `pip install beautifulsoup4 lxml` (container only).
- **Local preview of v1:** the legacy pages moved to `legacy/` in Phase 2 (media moved to `public/img`, `public/audio`): `python3 -m http.server 8765` from `legacy/` no longer finds `/img`, so serve the repo root and open `/legacy/<page>.html`, or run the extractor with `--root legacy`.
- **v2 local:** `npm run build`, then `python3 -m http.server <port>` inside `dist/` (more reliable than `astro preview` in this container). Chromium: `PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`; `npm i --no-save playwright axe-core` for tests. Kill leftover test servers first: in Phase 2 a verifier's stale replay server on :4399 served an old CSP.
- **Phase 2 tooling:**
  - `npm run content` runs `build_content.py`, which writes `src/content/*.json` (every object has `_src` INVENTORY IDs).
  - `python3 redesign/scripts/check_content_parity.py` is the strict, page-scoped, hash-checked parity check; it must stay at 100%.
  - `npm run check:csp` checks that the inline-script sha256 values in `public/_headers` match dist. Run `check_csp_hashes.py --write` after editing Base.astro's head script.
  - `node redesign/scripts/build_envelope.mjs` (devDependency mpg123-decoder) re-bakes `src/data/scope-envelope.json` from the Silver Linings stems. The build never decodes audio.
- **Workers Builds:** it runs `wrangler.jsonc` `build.command` (`npm ci && npm run build`) with no dashboard change, as proven on 590a6c9 and d543e39. The preview alias serves dist; `/about.html` → 307 → `/about` 200; a missing path returns 404 with "SIGNAL LOST"; `/_astro/*` gets a single immutable Cache-Control (the `! Cache-Control` detach works); CSP/HSTS/nosniff/Referrer/Permissions headers are present.
- **Phase 2 carry-overs for later phases:**
  - The shared motion bundle is 56 KB gzip (GSAP core, ScrollTrigger, SplitText, ScrambleText) and the scope chunk is 16 KB gzip (lazy). Phase 6 perf should check whether ScrollTrigger/SplitText can load per page.
  - The envelope JSON is 8 KB on disk, against a target of ~5 KB.
  - The cursor ring still transitions width/height (a minor layout-property finding, deferred).
  - CSP `script-src` has no `w.soundcloud.com`; Phase 5 adds it if the SoundCloud Widget API is used.
  - The mediaSrc HTML blobs keep `_raw_html` on media items where structure wasn't derivable (see the `_todo` list from build_content.py); Phase 4 turns them into components.

- **Phase 3 notes:**
  - `redesign/scripts/check_dom_parity.py` is the rendered-DOM parity gate (`--dist dist --pages index,about,work`); it must exit 0.
  - index.copy.044 (the hero H2 as a copy block, without the '&') is matched because the fix pass draws the '&' from a CSS `data-glyph`, with the full heading in the H2's `aria-label`. That's a workaround; Phase 2b should rebuild the hero and prefer teaching the checker that copy.044 == h.022.
  - Two UI strings are still hand-typed because src/content lacks them: the contact success message and the stems "Mixer Active // Loop Synced" status (not ported). Add them via build_content.py if they survive the redesign.
  - Legacy stems console had mute only (no solo/gain); kept faithful.

- **Phase 2b results / carry-overs (for Phase 4 and later):**
  - Gates on 9e2f9a4 (local): DOM parity 100% (index 303, about 86, work 52), content:check 100%, CSP OK, astro check 0/0/0, axe 0 serious/critical at 390/768/1440 in both motion modes, no overflow or mid-word breaks at 360/390/768/1440, reduced motion and JS-off content fully visible. Lighthouse mobile local: index 93–97, about 95, work 96, A11y/BP/SEO 100. **Preview alias (9e2f9a4, Workers Builds success) Lighthouse mobile/desktop:** / 100/100, /about 100/100, /work 94/100 Perf. A11y 100 and BP 100 everywhere. SEO 69 only because the preview sends `x-robots-tag: noindex`; locally it scores 100. Mobile LCP: / 1.7s, /about 1.6s, /work 2.7s. The baseline was index Perf 81 with LCP 4.05s. Contact sheet: redesign/references/shots/2b/final-sheet.jpg (gitignored).
  - A/B judge (Design 40 / Usability 30 / Creativity 20 / Content 10) after fix: home 7.50, about 6.95, work 6.90. References: bleibtgleich 8.3, uncommonstudio 8.2, madebynull 7.85, eloyb 7.65. **About and work are still below the 7.5 target.** Phase 4 must lift them before its own judge runs:
    - /work: make hub rows full-width `[data-hot]` index rows with B2–B4 mega titles and a wdth hover via quickTo, a B4 hover preview drawn from the first media URL in projects/ai/experiments.json, and Rules between rows. It is wireframe-sparse today.
    - /about: more scale drama and line structure (it scored lowest on Design and Creativity).
    - '//'-prefixed and UPPER_SNAKE parity labels ('// PROFILE', '// ACTIVE_MIXER_SOURCE', 'EXPLORE_PROJECTS', 'VIEW_CASE_STUDY') still read as HUD. Keep the strings verbatim (INVENTORY), but restyle them as plain small ink-2 labels. Replace non-inventory console chrome with plain words.
    - The stems console is ~1,900px of sliders at 390: collapse per-stem FX into `<details>` below 768.
    - Inline mobile media `<video>` has no poster, so it is blank until decode.
    - The shear clamp flattens the fan at high velocity. Clamp before the per-line weight.
  - Skills: the Skill tool returns "Unknown skill" inside Workflow subagents even though `.claude/skills/*` is installed. Tell workers to read `.claude/skills/<name>/SKILL.md` directly.
  - Judge reference set: bleibtgleich.dev, uncommonstudio.com.au, madebynull.com, eloyb.design. Shots are in redesign/references/shots/2b/judge/ (gitignored). Notes are in redesign/references/2b-*.md.

## Rollback (fill in during Phase 7)
- `v1-final` tag: not created yet.
- Steps: see PLAN.md §5.

## ⚠ Actual spend (session records, `get_session` usage.cost_usd) — 2026-09-25 07:00 UTC
The per-session estimates above under-report real cost by ~2–2.5×. These are the platform's own figures and supersede them:

| Session | Actual $ |
|---|---|
| Phase 0+1 planning (incl. earlier skills/reels chat) | 22.6 |
| Phase 2 | 26.68 |
| Phase 3 | 26.85 |
| Phase 2b (unbudgeted direction change) | 53.35 |
| Phase 4 (interrupted at 192% of its $35 budget; last commit 297cfb3, WF10 preview/gates not finished) | 67.43 |
| **Total** | **≈ 197** of the $250 cap — ~$53 left |

Phase 4 was interrupted by the planning session under the approved overrun rule (stop at 120% of a phase budget). **Future sessions: read your real cost with `get_session` (no id) and use it, not token estimates.** Remaining work (Phase 4 gates, Phases 5–7) needs a user decision on scope before resuming.
