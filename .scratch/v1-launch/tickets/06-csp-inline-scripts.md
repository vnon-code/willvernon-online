---
title: CSP vs Nuxt inline scripts
labels: [wayfinder:research]
status: closed
assignee:
blocked_by: []
---

## Question

public/_headers sets a CSP that blocks Nuxt's inline scripts, whose hash changes with each buildId. What's the standard fix for a prerendered Nuxt 4 site on Cloudflare: a post-build hash step, nuxt-security, or moving the inline payload out? AFK.

## Resolution (2026-10-05)

Use a post-build hash step. Each build has exactly 2 executable inline scripts (the importmap and `window.__NUXT__.config`), and they are identical on every page, so one pair of hashes covers the whole site. The steps:
1. Put a `__INLINE_HASHES__` placeholder in `public/_headers`.
2. Add `scripts/csp-hashes.mjs`, which hashes those 2 scripts and substitutes the placeholder in `.output/public/_headers`. It fails the build if the placeholder or scripts are missing.
3. Set `generate` to `nuxt generate && node scripts/csp-hashes.mjs`.

Rejected: nuxt-security (meta CSP can't carry frame-ancestors, and Cloudflare would need a custom hook) and moving the payload out (no Nuxt option exists for the config script). Not yet browser-tested.
Findings: branch `research/csp-inline-scripts`, `docs/research/csp-inline-scripts.md` (commit 0099891, local only).
