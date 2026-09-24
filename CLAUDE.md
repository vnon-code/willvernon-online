# willvernon.online — project rules

Portfolio of William Vernon (generative design, creative tech, 3D, AI, music as "vnon").
A ground-up front-end rebuild is in progress on branch `redesign/v2`.
**Start every session by reading `redesign/PLAN.md` (your phase and its kickoff prompt) and `redesign/PROGRESS.md` (state, spend ledger).**
The parity checklist is `redesign/content/INVENTORY.md`.

## Hard rules
- Work on `redesign/v2`. Never push to `main` or deploy until Phase 7 of PLAN.md; Phase 7 is the only phase that ships to production.
- Never touch R2 contents, DNS, or Cloudflare account/dashboard settings. Heavy media stays on `https://assets.willvernon.online/...`; keep every such URL working exactly as written.
- **Content parity is non-negotiable.** Every copy block, project, image, video, embed, link, credit and meta item in INVENTORY.md must exist on the new site. It is "same idea, fresh design", not a reskin.
- Personality: multidisciplinary designer / audio / AI / 3D, with a technical HUD edge (scramble/glitch, telemetry, dark UI).
- The motion runtime is **GSAP** (core + ScrollTrigger/ScrollSmoother/SplitText/Flip; all free). Never add Motion/Framer Motion. Diff dependencies before accepting any component-registry code, because shadcn-style registries ship Motion.
- Output must stay static-hostable on Cloudflare Workers static assets. Deploys go through Workers Builds on push to `main`; no GitHub Actions.
- Never fetch or download from unDraw.
- The repo is **PUBLIC**. Never commit third-party skills (`.claude/skills/` is gitignored), secrets, or reference-site screenshots (`redesign/references/shots/` is gitignored).
- Only `dist/` may be published. The working folders `redesign/`, `CLAUDE.md` and scripts must never ship. GitHub Pages also mirrors this repo; see AUDIT.md.

## Stack (see PLAN.md §Stack for the full decision)
- Astro, static output (`build.format: 'file'` so `/<page>.html` URLs keep resolving), vanilla TS + GSAP, CSS custom-property tokens.
- `wrangler.jsonc`: `build.command` runs the Astro build; `assets.directory: "./dist"`. `_headers` / `_redirects` / `404.html` live in `public/`.
- Content lives in `src/content/*.json`, generated from the INVENTORY extraction. Never hand-retype copy.

## Budget and context (total cap $250; plan ≤ $180)
- Model: Opus 5.5 for the main loop and verifiers; Sonnet 5 / Haiku 4.5 for bounded workers. **Never Fable.**
- Each phase runs as a **workflow: build → Opus verify → fix once**. At most 4 agents per stage and under 10 per workflow.
- Never read the big legacy HTML whole (projects.html ~240 KB, music/index ~80 KB). Use `grep -n` / `sed -n 'a,bp'` or `redesign/content/<page>.json`.
- Use scripts to extract; don't eyeball.
- Take screenshots only at phase end: downscaled, ≤ 3 breakpoints, one contact sheet (`redesign/scripts/screenshots.mjs`).
- Don't re-read files you just wrote, and don't paste large file contents into replies.
- Keep the spend ledger in PROGRESS.md at every checkpoint (actual if `/cost` is visible, else a marked estimate). Past 120% of a phase budget, stop and write up.

## Skills (installed per session, project scope, gitignored)
Install: `npx skills add <repo> -a claude-code -s <skill> [-s <skill>…] -y --copy`
- pbakaus/impeccable: `impeccable`
- emilkowalski/skill: `emil-design-eng`, `animate`, `review-animations`, `find-animation-opportunities`
- greensock/gsap-skills: `gsap-core`, `gsap-scrolltrigger`, `gsap-timeline`, `gsap-performance`
- coreyhaines31/marketingskills: `seo-audit`

Before each piece of work, invoke the skill that covers it. After any reply where a skill ran, add one line: `Skills used: name — what it did and how it shaped the result`. Log the same line in PROGRESS.md.

## Useful scripts
- `python3 redesign/scripts/extract_content.py [--root dist --out /tmp/new] [--check-assets]`: content inventory and parity diff (needs `pip install beautifulsoup4 lxml`).
- `node redesign/scripts/screenshots.mjs --out DIR --sheet SHEET.jpg --widths 1440,768,390 URL…`: shots plus a contact sheet.
