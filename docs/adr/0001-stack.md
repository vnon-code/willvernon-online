# ADR-0001: Stack for v3

**Status:** Accepted
**Date:** 2026-10-03
**Deciders:** Will

## Context
The landing is one full-screen Three.js point cloud that reacts to live audio stems, with a scroll-driven project strip, a floating sound HUD and a full-screen menu. Will wants it to feel like an app, not a website, with pacomepertant.com as the bar for smoothness. Content lives in `content/*.json`; the site deploys as static assets on Cloudflare Workers.

Reference check (2026-10-03): pacomepertant.com is Nuxt (prerendered) + Three.js r180 + GSAP/ScrollTrigger + Lenis + Howler. Most other references are Nuxt or Next.js with GSAP.

## Decision
| Layer | Choice |
|---|---|
| Framework | Nuxt (Vue), prerendered with `nuxi generate` |
| 3D | Three.js |
| Motion | GSAP + ScrollTrigger, Lenis smooth scroll, one shared rAF loop |
| Audio | Native Web Audio (Convolver, Delay, BiquadFilter, Analyser, playbackRate) |
| CSS | Plain CSS with `:root` tokens (colour and type from STATE.md) |

## Options considered
- **Astro**: less JS shipped, and it already fit `wrangler.jsonc`. Rejected: Will preferred Nuxt's app-like page transitions.
- **Vite SPA**: simplest. Rejected: weak SEO for project pages.
- **OGL / raw WebGL**: smaller. Rejected: more hand-written camera and morph code.
- **Tone.js**: built for music sequencing, which the site doesn't need.
- **Tailwind**: an extra dependency for a small UI surface.

## Consequences
- Easier: persistent canvas and audio across pages, choreographed page transitions, the same toolset as the reference.
- Harder: a bigger client runtime than Astro, so watch the first-load weight.
- To change at scaffold time: `wrangler.jsonc` `assets.directory` → `.output/public`; delete the leftover `node_modules/` and `.astro/`.
