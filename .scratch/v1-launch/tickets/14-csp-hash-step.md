---
title: Hash inline scripts at build
labels: [wayfinder:task]
status: closed
assignee: claude (session 2026-10-08)
blocked_by: []
---

## Question

Implement the decision in 06-csp-inline-scripts: placeholder in public/_headers, scripts/csp-hashes.mjs, the generate script. Also strip the Astro-era comments and stale hash from _headers. Verify in a browser on a local preview that no CSP errors appear. AFK.

## Resolution (2026-10-08)

Built on `csp-hash-step` (3e0c9cf), merged into v3. `public/_headers` holds `__INLINE_HASHES__`; `scripts/csp-hashes.mjs` runs after `nuxt generate` (Cloudflare's build command already calls `pnpm generate`), fails if a page lacks the importmap + `window.__NUXT__.config` or pages differ. Verified in headless Chrome on a local server applying `_headers`: `/`, `/work/amplified-spaces` and the 404 had zero CSP errors and the Gate opened; a broken hash blocked the script, so the CSP is enforced.
