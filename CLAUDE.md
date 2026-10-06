# willvernon.online — v3

Portfolio of William Vernon (generative design, creative tech, 3D, AI, music as "vnon").
Branch `v3` is a from-scratch rebuild: only assets and content were carried over. The live site is `main`; the abandoned redesign is on `redesign/v2` (reference only, never a starting point).

## How we work
- Build slowly, one piece at a time, starting with the landing page.
- Will chooses and approves every visual decision: palette, type, layout, motion, copy placement. Propose 2–3 concrete options with a visual preview, take Will's pick, then build. Treat any unapproved visual choice as a placeholder and label it so.
- Each piece: concept → plan → Will signs off → build → Will verifies in the browser.
- Work follows the wayfinder map in `.scratch/v1-launch/MAP.md`: one ticket per session, time-boxed to that session. Leftover tweaks go to `LATER.md`.
- Prototypes are built in Nuxt as real pages with real components and content, not as standalone HTML files (Will, 2026-10-05).
- Stack (decided 2026-10-03, docs/adr/0001-stack.md): Nuxt prerendered, Three.js, GSAP + Lenis, native Web Audio, plain CSS tokens. Other design choices still get decided with Will when the work needs them.

## Content
- `content/*.json` holds every project, copy block, credit, link and media reference, extracted from the original site. Read it; never retype copy.
- `content/INVENTORY.md` is reference only, not a parity checklist (Will, 2026-10-05): keep projects, bio, links and media; old-site scaffolding can go.
- `public/` holds local assets plus `_headers` / `_redirects` for Cloudflare.

## Hard rules
- Heavy media lives on R2 at `https://assets.willvernon.online/...`. Keep every such URL working exactly as written. Leave R2 contents, DNS and Cloudflare dashboard settings untouched.
- Deploys go through Cloudflare Workers Builds on push to `main` (`wrangler.jsonc`). Push to `main` only when Will says to ship.
- The repo is public: commit only code, content and assets. Secrets, third-party skills (`.claude/skills/`) and reference screenshots stay local.
- Never fetch from unDraw.

## Skills in this repo
- Design and section work runs as `karpathy-loop` rounds; Will's `references/REFERENCES.md` and the wayfinder map win over `refero-styles` / `taste`.
- Motion: `animate` builds, `motion-design` for timing and feel, `review-animations` critiques a diff. gsap-* and threejs-* turn on when those packages land (re-run `/project-profile`).
- Copy: `no-ai-slop` on every string; `copywriting` / `copy-editing` only for launch pages. Content in `content/*.json` wins over any skill's wording.
- Something broken → `diagnosing-bugs` first. Launch SEO → `seo-audit`, `schema`, `ai-seo`.
