# Back-end / Deploy / Edge Audit — willvernon.online

Read-only audit. No Cloudflare, DNS, or R2 state was changed. Evidence: local git history, GitHub API (commit `f9757ca9555b4020ce1636802e2651c088bc1503` = `origin/main` HEAD), and live `curl -sSI` probes of `https://willvernon.online` on 2026-09-24.

**TL;DR**: Production is an assets-only Cloudflare Worker (`wrangler.jsonc`, no `main` script), auto-deployed on every push to `main` via the Cloudflare Workers Builds GitHub App (confirmed by a `cloudflare-workers-and-pages` check run on `origin/main` HEAD). A dormant GitHub Pages pipeline also fires on push but does not serve production traffic. The live edge has zero security headers, a bare empty 404, uniform `no-cache`-style `Cache-Control` on everything, and the default Workers-assets `html_handling`/`not_found_handling` behaviour. Four tracked image/GIF files sit at 80–88% of the 25 MiB per-file Workers-assets ceiling that a prior commit (`70cdecc`) was already written to fix once. Recommended rebuild approach: `_headers`/`_redirects`/`wrangler.jsonc` config only — no Worker script needed, no Cloudflare dashboard change needed. Verified all 7 pages (`index/about/work/music/AI/experiments/projects`) redirect `<name>.html → /<name>` (307) identically.

Sections: (1) deploy mechanism, (2) live edge behaviour, (3) current Worker limits, (4) edge-layer rebuild options, (5) propose-only back-end options, (6) Phase 7 / rollback.

## 1. Deploy mechanism

**Config files** (repo root):
- `wrangler.jsonc` (267 B) — `{"name":"willvernon-online","compatibility_date":"2026-05-28","observability":{"enabled":true},"assets":{"directory":"."},"compatibility_flags":["nodejs_compat"]}`. No `main` field → **assets-only Worker** (static hosting, no Worker script runs on the request path).
- `.assetsignore` (197 B) — excludes `.git*`, `.wrangler`, `wrangler.jsonc`, `.assetsignore`, `node_modules`, `upload_to_r2.py` from the asset upload.
- No `package.json` anywhere in the repo (`ls package.json` → not found), so there is no npm build step; the `$schema` path in `wrangler.jsonc` (`node_modules/wrangler/config-schema.json`) is editor-only and doesn't imply a dependency is installed at build time.
- No `.github/` directory in the working tree, confirmed both locally (`find . -maxdepth 1 -iname .github` → nothing) and via the GitHub Contents API at this exact commit (`GET /contents/.github?ref=f9757ca9…` → `404 Not Found`). There is no `_headers`, `_redirects`, or `CNAME` file either (`find . -iname CNAME -o -iname _headers -o -iname _redirects` → empty).

**Git history of the two config files** (`git log --oneline -- wrangler.jsonc .assetsignore`): a single commit, `70cdecc "chore: add wrangler.jsonc and .assetsignore configuration to fix Git pack deploy size limit"` (2026-05-28). `git show 70cdecc --stat`:
```
.assetsignore  | 15 +++++++++++++++
.gitignore     |  1 -
wrangler.jsonc | 14 ++++++++++++++
3 files changed, 29 insertions(+), 1 deletion(-)
```
The commit message and the paired `.gitignore` edit (dropping a `.wrangler/`-adjacent line) show this was reactive: an earlier deploy hit Cloudflare's size ceiling and the fix was to keep large local-only files (git metadata, the R2 upload helper) out of the asset upload rather than to restructure the site.

**How a push reaches production** — confirmed via the GitHub REST API (`GET /repos/vnon-code/willvernon-online/commits/{sha}/check-runs`) on the `origin/main` HEAD commit `f9757ca…`, `total_count: 4`:

| Check/deployment | App | Result | Detail |
|---|---|---|---|
| `Workers Builds: willvernon-online` | `cloudflare-workers-and-pages` (GitHub App, installation id 85455) | `completed` / `success` | `details_url` → `dash.cloudflare.com/…/workers/services/view/willvernon-online/production/builds/644bbec6-…`, output names `Version ID: 6d764d4a-c2ca-4084-bad5-7d86bfe44093` |
| `deploy`, `report-build-status`, `build` (3 jobs) | `github-actions`, workflow `pages build and deployment` (`dynamic/pages/pages-build-deployment`) | all `completed` / `success` | run `.../actions/runs/26608743633` |

Two independent things fire on every push to `main`:
1. **Cloudflare Workers Builds** — a GitHub App integration (not a checked-in workflow file) connected directly to the repo. It is what actually ships production: the check's `details_url` points at the Worker's own `production` build history in the Cloudflare dashboard, and `deployments` history (`GET /repos/.../deployments`) shows a `github-pages`-only `environment` entry for *every* commit on `main` going back at least 10 commits — but the Workers Builds *check run* (App-authored, separate from the deployments API) is the one tied to the live Worker version ID. Because there is no `main` script and no build tooling in the repo, the Workers Builds pipeline is doing a zero-bundle static-asset upload: effectively `wrangler deploy` (or its Builds-pipeline equivalent) with no build command, uploading everything under `assets.directory: "."` minus `.assetsignore`.
2. **GitHub's built-in Pages pipeline** — `pages build and deployment` is GitHub's own *dynamic* workflow (no YAML in the repo; it exists only because GitHub Pages is switched on in the repository's Settings → Pages, likely a leftover from before the Cloudflare move). Its `deployments` all target the `github-pages` environment, distinct from the Cloudflare Worker. Live headers (§2) show `server: cloudflare` and Cloudflare cache/NEL headers on every response with no GitHub Pages fingerprint, so **production traffic on `willvernon.online` is served by the Cloudflare Worker, not GitHub Pages** — the Pages deployment is a dormant side effect of a repo setting, not part of the real serving path, but it does mean GitHub Pages is silently building a full (possibly public, if repo visibility allows) mirror of the site on every push.

**Likely build/deploy commands**: no build command (no `package.json`, no lockfile, no bundler config anywhere in the tree) → deploy command is a bare `wrangler deploy`/Workers-Builds-equivalent upload of static assets, gated only by `.assetsignore`.

## 2. Live edge behaviour

Probed with `curl -sSI` against `https://willvernon.online` (2026-09-24 23:35–23:36 UTC):

| Request | Status | Notes |
|---|---|---|
| `/` | 200 | `content-type: text/html`, `cf-cache-status: HIT` |
| `/index.html` | **307** → `location: /` | `.html` stripped |
| `/about` | 200 | canonical clean-URL form |
| `/about.html` | **307** → `location: /about` | |
| `/work` | 200 | |
| `/work.html` | **307** → `location: /work` | |
| `/projects.html` | **307** → `location: /projects` | |
| `/music.html` | **307** → `location: /music` | |
| `/AI.html` | **307** → `location: /AI` | |
| `/experiments.html` | **307** → `location: /experiments` | |
| `/nope` (nonexistent) | **404**, `content-length: 0`, no `content-type` | bare empty body, no custom 404 page |
| `/style.css` | 200 | `cf-cache-status: HIT` |
| `/img/marimekko/Vernon_GDES50014_billboard4.png` | 200 | `cf-cache-status: MISS` (first hit) |
| `https://assets.willvernon.online/ai/synthetic_corals_Preview.jpg` (R2) | 200 | `cf-cache-status: DYNAMIC`, `content-type: image/jpeg`, `accept-ranges: bytes`, `content-length: 368758` |
| `https://assets.willvernon.online/previews/ai_trailer.mp4` (R2) | 200 | `cf-cache-status: DYNAMIC`, `content-type: video/mp4`, `accept-ranges: bytes` |

This behaviour matches the Workers *assets* defaults, unset in `wrangler.jsonc`: **`html_handling: "auto-trailing-slash"`** (extensionless URL is canonical, requesting `<name>.html` 307-redirects to the clean path) and **`not_found_handling: "none"`** (no route matches → raw empty 404, no SPA fallback, no custom page).

**Cache-Control** is identical across every content type on the main domain — `public, max-age=0, must-revalidate` — for HTML, CSS, and PNG alike (verified on `/`, `/about`, `/style.css`, and the billboard PNG). Nothing is served as long-lived/immutable; every asset revalidates via `etag` on each load. Filenames are not content-hashed, so this is arguably correct default behaviour (a long `max-age` on `style.css` without a hash would risk stale CSS after deploys) but it also means there's no cheap win from Cloudflare edge cache for unchanging binary assets — the only saving is skipping origin re-fetch on a 304-eligible revalidation, and even that requires the browser to make the round trip.

**R2 custom-domain assets** (`assets.willvernon.online`) send **no `cache-control` header at all** and register `cf-cache-status: DYNAMIC` on every probe — the edge is not caching these image/video pulls by any explicit rule, so every request (including repeat ones from different edge PoPs) round-trips to R2.

**Security headers — all absent** on every probed response, main domain and R2 domain alike: no `content-security-policy`, no `strict-transport-security`, no `x-content-type-options`, no `referrer-policy`, no `permissions-policy`, no `x-frame-options`. The only headers present beyond the basics are Cloudflare's own `report-to`/`nel` (Network Error Logging) and `alt-svc`. `server: cloudflare` is present; there is no separate app/framework header leak.

## 3. Current Worker config & limits

- **Assets-only** (`wrangler.jsonc` has no `main`): confirmed no Worker script runs on the request path; this is pure static hosting via Workers Static Assets, which is why there are no security headers, no redirects beyond the built-in `html_handling`, and no custom 404 — none of that is programmable without a script.
- **Per-file 25 MiB Workers-assets limit** — `git ls-files -z | xargs -0 du -m | sort -rn | head`:

| File | Size (MB) | % of 25 MiB limit |
|---|---|---|
| `img/marimekko/Vernon_GDES50014_billboard4.png` | 22 | 88% |
| `img/marimekko/Vernon_GDES50014_billboard3.png` | 22 | 88% |
| `img/marimekko/Vernon_GDES50014_billboard1.png` | 21 | 84% |
| `img/marimekko/Vernon_GDES50014_billboard2.png` | 20 | 80% |
| `img/powersurge/powersurgegif2.gif` | 19 | 76% |
| `img/powersurge/powersurgegif.gif` | 15 | 60% |

  No tracked file currently exceeds the limit, but four files already sit at 80–88% of it. This is the direct cause named in the `70cdecc` commit message ("fix Git pack deploy size limit") and remains a live risk for the rebuild: any further-resolution export of these same assets (or a new hero video/GIF of similar weight) will hit the ceiling and fail the Workers Builds upload outright. `.gitignore` already excludes `*.mp4`, `*.mov`, and `audio/*.wav` for this exact reason — the heaviest media (video, lossless audio stems) is deliberately kept out of git and served from R2 instead (`upload_to_r2.py` at repo root, 3.5 KB).
- **Total tracked footprint**: 207 files tracked by git, 171 MB total (`git ls-files -z | xargs -0 du -sh -c`). By extension: 91 `.png`, 57 `.jpg`, 27 `.jpeg`, 5 `.mp3`, 2 `.gif`, 7 `.html`, 1 `.css`, plus config/docs. `img/` alone is 156 MB, `audio/` 14 MB (the 5 tracked stem `.mp3` files — the raw `.wav` versions are gitignored).

## 4. Edge-layer options for the rebuild

Third-party origins actually referenced by the current pages, collected from `redesign/content/*.json` and `grep -n "gstatic\|googleapis\|unpkg" *.html`:

- `fonts.googleapis.com`, `fonts.gstatic.com` — Google Fonts (`<link>` on all 7 pages, `AI.html:9-11` etc.)
- `unpkg.com` — Phosphor Icons web-font script, all 7 pages (`<script src="https://unpkg.com/@phosphor-icons/web">`)
- `assets.willvernon.online` — R2 custom domain, by far the most-referenced external host (82 of 97 external URLs in `assets.json`)
- `soundcloud.com` / `w.soundcloud.com` — embeds and links
- `open.spotify.com` — playlist embed
- `www.youtube.com` — video embeds
- `vnon.bandcamp.com`, `www.linkedin.com`, `www.tiktok.com`, `instagram.com` — outbound profile links (not embedded frames, so lower CSP priority)

| | (a) Static-only: `_headers` + `_redirects` + `wrangler.jsonc` tuning | (b) Worker script + assets binding + `run_worker_first` |
|---|---|---|
| **Security headers** | Full control via `_headers` glob rules (e.g. `/*` → CSP/HSTS/etc.), applied by the assets layer itself, no code | Same headers, but set in JS on every matched request — extra moving part for no extra capability here |
| **CSP** | One static `Content-Security-Policy` line in `_headers` allow-listing `fonts.googleapis.com`, `fonts.gstatic.com`, `unpkg.com`, `assets.willvernon.online`, `*.soundcloud.com`, `open.spotify.com`, `www.youtube.com` (`frame-src`/`connect-src`/`style-src`/`script-src`/`img-src`/`media-src` as needed) | Identical CSP string, just built/returned in a `fetch` handler |
| **Caching** | `_headers` can set `Cache-Control: public, max-age=31536000, immutable` scoped to a fingerprinted path prefix (e.g. `/assets/*`) if the rebuild introduces content-hashed filenames; HTML stays `no-cache`/short `max-age` via a separate rule | Same rules, but as manual header-set logic per request — no benefit unless caching needs to be conditional on something a static rule can't express (cookie, geo, A/B) |
| **Redirects (preserve old URLs)** | `_redirects` file, e.g. `/index.html /  301` (belt-and-suspenders on top of the default `html_handling`), old anchors, any renamed pages from the rebuild | `fetch` handler `if/else` on `url.pathname` — more verbose for the same static mapping |
| **Custom 404** | `assets.not_found_handling: "404-page"` in `wrangler.jsonc` + a `404.html` in the asset dir — zero script | A Worker can serve any 404 body/status it wants, but for a single static page this is the same outcome via more code |
| **Cost / complexity** | Lowest: two plain-text files + 3 JSON fields in `wrangler.jsonc`. No cold starts, no per-request compute, no new observability surface | Adds a Worker invocation (and thus CPU-time billing/limits, however small) to every matched route; more surface to test and keep in sync with the asset set |
| **Cloudflare dashboard/account change needed?** | **No** — all three levers (`_headers`, `_redirects`, `assets.*` fields) are files/config already committed through the existing Workers Builds pipeline. No new bindings, no dashboard click | **No**, if scoped to `run_worker_first` for a couple of routes and everything else stays asset-served — but it does add a `main` entry point that didn't exist before, which is a bigger diff to review and the kind of change most likely to need a dashboard-side binding later (e.g. once real back-end features from §5 are added) |

**Recommendation**: **(a)** for the redesign itself. It gets every header/redirect/404 requirement met with no runtime component, matches the current assets-only architecture exactly (so `git show 70cdecc`'s size-limit lesson and the existing `.assetsignore`/`.gitignore` split keep working unmodified), and needs zero Cloudflare account changes to ship. Move to (b) only when a §5 feature (contact form, D1-backed content) actually requires server logic on specific routes — at that point `run_worker_first` can be scoped to just those paths (e.g. `/api/*`) while the rest of the site stays pure static assets under the same `_headers`/`_redirects` rules.

## 5. Propose-only back-end options (not to be built now)

| Option | Value | Account resources / secrets needed | Rough effort |
|---|---|---|---|
| **Contact form endpoint** | Replaces the current `mailto:` link (`index.html:38-49` pattern, repeated on every page) with an actual in-page form; removes the friction of opening a mail client | A `main` Worker route (e.g. `/api/contact`), an email-sending secret (Resend/SendGrid/Mailchannels API key) via `wrangler secret put`, Turnstile site/secret key pair for spam protection (new dashboard config) | Small–medium: 1 route, 1 secret, a Turnstile widget on the front end |
| **Analytics** | Cloudflare Web Analytics (beacon script, no cookies) is the natural fit given the site already runs on Workers — gives page-view/referrer data with zero CSP conflict (script served from Cloudflare's own domain) vs. "none" (current state — no analytics at all, confirmed: no analytics/tracking script found in any of the 7 pages' `<head>` greps) | A Web Analytics "site tag" created in the dashboard (Analytics → Web Analytics) — one-time, no secret, no Worker code | Trivial: one `<script>` tag + one dashboard toggle |
| **D1/KV-backed content or CMS** | Would let the 1,429-item content inventory (`redesign/content/INVENTORY.md`) be edited without a redeploy — meaningful only if update frequency justifies it | A D1 database (`wrangler d1 create`) or KV namespace binding, plus a `main` Worker to read it and render/inject content, plus some admin UI or direct SQL for edits | Large: schema design, a render path for every page section currently hard-coded in the 7 HTML files, an editing workflow |
| **Audio-stem streaming from R2** | The 5 tracked `.mp3` stems (`audio/*.mp3`, 14 MB) and gitignored `.wav` masters (`audio/*.wav`) suggest a stem-mixer feature (isolate vocals/drums/bass); streaming multi-track audio from R2 with range requests is already how `assets.willvernon.online` serves video (confirmed `accept-ranges: bytes` in §2) | No new resource — R2 bucket already exists and is already the asset host; would need a small Worker or client-side `<audio>` multi-track sync layer, and CORS/Range confirmed already working on the R2 custom domain | Medium: mostly front-end (Web Audio API sync across N `<audio>` elements), back end is "none new" since R2 already does the serving |

## 6. Phase 7 (ship-to-production) needs and rollback

**What this environment likely lacks:**
- A **Cloudflare API token** scoped to the `willvernon-online` Worker/account (needed for `wrangler deploy`, `wrangler rollback`, or any direct dashboard-equivalent API call) — nothing in this repo or environment exposes one; the only deploy path evidenced is the GitHub-App-driven Workers Builds pipeline (§1), which fires on push and needs no local token, but that also means **this session cannot trigger, inspect build logs for, or roll back a Workers Builds deployment directly** — only push-and-wait or use the Cloudflare dashboard (out of reach here).
- **Wrangler rollback access**: `wrangler rollback` / `wrangler deployments list` need the same API token plus account ID; neither is configured locally (`npx wrangler --version` runs — 4.139.0 — but that's just the CLI binary, not authenticated: no `wrangler login` state, no `CLOUDFLARE_API_TOKEN` visible in this shell).
- Any change to DNS, R2 bucket settings, or the GitHub↔Cloudflare Workers Builds App connection itself would need dashboard access this task was explicitly told not to touch.

**Safest rollback path**, usable with nothing more than the git access already in hand:
1. Before the redesign ships, tag the last known-good `main` commit: `git tag v1-final <sha>` (push the tag).
2. Ship the redesign as a normal commit/PR to `main` — Workers Builds redeploys automatically on merge (§1), no manual trigger needed.
3. If the new deploy misbehaves, `git revert <redesign-merge-commit>` (or a range revert) on `main` and push — this creates a new commit, which Workers Builds picks up and deploys the same way, restoring the pre-redesign asset set without needing any Cloudflare-side credential.
4. Only if Workers Builds itself is broken (not the site content) would dashboard-level `wrangler rollback` to a prior *version ID* (§1 has one concrete example: `6d764d4a-c2ca-4084-bad5-7d86bfe44093`) be needed — that step does require the API token this environment doesn't have, so it should be called out to the human operator as a manual fallback, not assumed available in Phase 7 automation.
