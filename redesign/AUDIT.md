# Audit: willvernon.online v1 (Phase 0)

This is a synthesis of three audits, each passed through an adversarial Opus verification: 63 claims corrected in total, and an inventory spot-check of 30 of 30.

**Details, with file:line evidence:**
- [`audit/frontend.md`](audit/frontend.md): IA, visual language, signature effects, measured problems, impeccable critique
- [`audit/seo-a11y-perf.md`](audit/seo-a11y-perf.md): the seo-audit must-preserve list, axe and Lighthouse baselines
- [`audit/backend.md`](audit/backend.md): deploy mechanism, live edge behaviour, edge-layer options, back-end proposals

Baseline screenshots are in `baseline/` (`sheet-desktop.jpg`, `sheet-mobile.jpg`). The parity list is `content/INVENTORY.md`: 1,429 items (index 311, about 93, work 59, projects 513, music 155, AI 209, experiments 89).

## IA and navigation
- There are 7 flat `.html` pages. The primary nav on every page is only `[HOME] [WORK] [MUSIC] [ABOUT]`.
- `projects.html`, `AI.html` and `experiments.html` are second-tier pages. They're reachable only from the hero CTAs on index, the three panels on work.html and about.html; music.html has no link to them. Yet projects.html holds 513 of the 1,429 content items.
- The live site 307-redirects `/<page>.html` to `/<page>` (Workers `auto-trailing-slash`). Both forms must keep resolving.
- On mobile, the nav is a burger menu whose icon comes from the Phosphor icon font; in the baseline the burger and social icons don't render.

## Visual language (the personality to keep)
- **Colour:** a near-black ground (`--bg-950 #020000`), white text and a single red accent (`#D91C1C`). There are 14 `:root` tokens, but 84 raw hex literals outside `:root`, and 2 variables used without being defined.
- **Type:**
  - Space Grotesk for display (heavy uppercase), Space Mono for body and meta text
  - 34 distinct font sizes (0.55–9 rem)
  - weight 800 is used but never loaded, so the browser fakes it
- **Signatures:**
  - `[ BRACKETED ]` nav and `// EYEBROW` labels in red mono
  - scramble on hover (the scramble code is byte-identical across 6 pages)
  - HUD telemetry readouts
  - particle canvas on home
  - audio-reactive canvases and a per-track palette on music
  - a stems mixer with FX sliders on home
  - credentials accordion and skill-tag glows on about
- **What works:** a distinct, confident technical identity, real audio-reactive craft, rich case-study content (process steps plus outcome media), and consistent red-on-black discipline.

## Problems (measured)

| Area | Finding |
|---|---|
| Duplication | 382,269 B of inline JS across 7 pages. toggleMenu is on 6 of 7 pages byte-identical (7th differs by whitespace), scramble on 6 of 7, updateHUD on index + AI. Nothing is cacheable across pages. |
| Content-in-code | projects.html is a 235 KB inline script. Case studies are JS objects whose `mediaSrc` holds HTML strings, including 13 embedded `<style>` blocks (68.7 KB). |
| Performance | Lighthouse mobile perf: index 81 (LCP 4.05 s), projects 84 (1.81 MB). The head loads Google Fonts, then the **unversioned full Phosphor set** (unpkg, render-blocking, 6 weights), then `style.css?v=19`. Live HTML/CSS/PNG are all `max-age=0`, so `?v=` does nothing. |
| Images | 0 of 157 images have width/height, and 0 have srcset. Only 1 `loading="lazy"` exists, and it's on an iframe. Four billboard PNGs are 20.2–21.8 MiB and are used as their own thumbnails; the GIFs are 15–19 MB. `img/` totals 156 MB. |
| Accessibility | axe finds: 129 colour-contrast nodes, 2 **critical** unlabelled sliders (index, music), 2 serious unnamed social links (about), 1 untitled iframe (music), heading-order issues, and work.html has no H1. Accent 4.12:1 and muted 4.33:1 both fail AA. There's no skip link, no footer landmark, a single `:focus` rule, and **zero `prefers-reduced-motion`**. 12 `div onclick` cards (projects) plus the AI and experiments cards have no role or tabindex. The slide-over has no focus trap. |
| SEO | There are no meta descriptions, canonicals, OG/Twitter tags or JSON-LD anywhere, and robots.txt and sitemap.xml return 404. SEO scores are capped at 82–91 by the missing descriptions alone. Every page has a hero paragraph usable as a description. |
| Responsive | On mobile, 4 pages crop their lede below the first screen, and work/index show no lede. The oversized headers take up the whole first screen. |

## Deploy and back end
- **Production** is Cloudflare **Workers Builds**, deploying on push to `main`. The Worker is assets-only: there is no `main` script, the asset directory is `"."`, and there's no package.json. Non-production branches get preview versions and aliases: `https://redesign-v2-willvernon-online.wvernoncsi.workers.dev` for this branch; this build succeeded.
- **Live edge:** there are no security headers at all (no CSP, HSTS, nosniff, Referrer-Policy or Permissions-Policy). 404s are an empty body. Caching is `max-age=0` everywhere.
- **GitHub Pages is also live** and mirrors the whole repo at `vnon-code.github.io/willvernon-online/`, including `upload_to_r2.py`. That file contains only placeholder keys, but the mirror is an uncanonicalised duplicate. Disabling it is a user action.
- **Publishing risk (fixed on this branch):** `.assetsignore` did not exclude `redesign/`. It now excludes `redesign`, `CLAUDE.md` and `.claude`, and the preview confirms `/redesign/*` returns 404. The v2 build publishes `dist/` only.
- **Contact:** a Formspree form already exists (`index.html:514`), plus `mailto:` links. There are no analytics.
- **R2:** media on `assets.willvernon.online` all resolve. 187 URLs were checked; the only failures are Instagram (429) and LinkedIn (999), which block bots.
- **Phase 7 constraint:** there's no Cloudflare token here, and none is needed, because merging to main deploys. The rollback is `git revert` on main, with a dashboard rollback as the user's fallback.

## SEO must-preserve
The 7 titles (`<Page> | William Vernon`; home is `William Vernon | Generative Design & Creative Tech`), one H1 per page (work gains one), the `/<page>.html` and `/<page>` URLs, 100% alt coverage on static images, all internal links, and the embed and social URLs.
