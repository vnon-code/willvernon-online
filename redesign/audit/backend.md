# Back-end / Deploy / Edge Audit — willvernon.online

Read-only audit. No Cloudflare, DNS, or R2 state was changed. Evidence: local git, GitHub REST API (commit `f9757ca9555b4020ce1636802e2651c088bc1503` = `origin/main` HEAD), and live `curl` probes of `https://willvernon.online` on 2026-09-24 (~23:35–23:45 UTC).

**TL;DR**
- Production is an assets-only Cloudflare Worker (`wrangler.jsonc`, no `main`), auto-deployed on every push to `main` by the Cloudflare Workers Builds GitHub App.
- GitHub Pages is **also switched on and publicly serving a full mirror** at `https://vnon-code.github.io/willvernon-online/`. It is not the production host, but it is live, not dormant.
- The live edge sends no security headers and returns an empty 404. `Cache-Control` is `public, max-age=0, must-revalidate` on everything. Behaviour matches the Workers-assets defaults.
- The `70cdecc` "Git pack deploy size limit" fix was about the `.git` pack (251 MiB locally) being uploaded as an asset. It was **not** about the large images. Three tracked PNGs sit at 81–87% of the 25 MiB per-file limit, and a fourth is at 79%.
- **Deploy-blocking gap for the rebuild:** `.assetsignore` does not exclude `redesign/`. Merging `redesign/v2` as it stands would publish 28 tracked working files (1.3 MB) at `willvernon.online/redesign/…`.
- Recommended rebuild approach: config only (`_headers`, `_redirects` and `wrangler.jsonc` `assets.*`). No Worker script, no dashboard change.

## 1. Deploy mechanism

**Config files** (repo root):
- `wrangler.jsonc` (267 B): `name: willvernon-online`, `compatibility_date: 2026-05-28`, `observability.enabled: true`, `assets.directory: "."`, `compatibility_flags: ["nodejs_compat"]`. There is no `main` field, so this is an **assets-only Worker**.
- `.assetsignore` (197 B) excludes `.git`, `.git*`, `.gitignore`, `.wrangler`, `wrangler.jsonc`, `.assetsignore`, `node_modules` and `upload_to_r2.py`. It does **not** exclude `README.md`: live `/README.md` returns 200 `text/markdown`. It also does not exclude `redesign/` (see §3).
- Missing from the working tree: `package.json`, `.github/`, `_headers`, `_redirects`, `CNAME` (`ls` returns "No such file" for each). GitHub Contents API `/contents/.github?ref=f9757ca…` returns 404.

**History**: `git log -- wrangler.jsonc .assetsignore` shows a single commit, `70cdecc` (2026-05-28), "chore: add wrangler.jsonc and .assetsignore configuration to fix Git pack deploy size limit". Its `--stat` is `.assetsignore +15`, `.gitignore -1` and `wrangler.jsonc +14`.
- The `.gitignore` hunk **removed the line `wrangler.jsonc`**, so the config file is now committed and Workers Builds can read it. The hunk did not touch `.wrangler/`.
- Before this commit, `assets.directory "."` had nothing excluding `.git`. The local pack is `.git/objects/pack/pack-02b5….pack` = 263,637,188 B (251 MiB, from `git count-objects -vH`), about 10× the 25 MiB per-file limit. That is the "Git pack" size limit named in the commit message. The fix was the `.git*` rule in `.assetsignore`.

**How a push reaches production**: `GET /repos/vnon-code/willvernon-online/commits/f9757ca…/check-runs` returns `total_count: 4`.

| Check | App | Result | Detail |
|---|---|---|---|
| `Workers Builds: willvernon-online` | `cloudflare-workers-and-pages` (app id 85455) | completed / success | `details_url` is `dash.cloudflare.com/…/workers/services/view/willvernon-online/production/builds/644bbec6-…`. The output summary contains `Version ID: 6d764d4a-c2ca-4084-bad5-7d86bfe44093` |
| `build`, `report-build-status`, `deploy` | `github-actions`, run 26608743633 `pages build and deployment` (path `dynamic/pages/pages-build-deployment`, event `dynamic`) | all success | GitHub's built-in Pages workflow. There is no YAML for it in the repo |

- `GET /deployments?per_page=10` returns 10 entries. Every one is environment `github-pages`, one per commit from `f9757ca` back to `66fb22f`. The Workers deploy does not appear in the Deployments API, only as the check run.
- **Production is Cloudflare**: every live response carries `server: cloudflare` and `cf-ray` (§2).
- **GitHub Pages is live, not dormant.** `https://vnon-code.github.io/willvernon-online/` returns 200 with `server: GitHub.com` and the same `<title>` as production. It serves the billboard PNG (206 on a range request), and it serves `upload_to_r2.py` and `wrangler.jsonc` with 200, because Pages ignores `.assetsignore`. The repo is public (`visibility: public`, `has_pages: true`), so nothing secret leaks. `upload_to_r2.py:21-22` holds only `YOUR_…` placeholders.
- **Pages risk:** no page has `rel="canonical"` (`grep -c` returns 0 on all 7), so the mirror is an uncanonicalised duplicate of the whole site. After a merge it would also publish `redesign/` whatever `.assetsignore` says.
- **Pages fix:** disable Pages in repo Settings (a human, repo-admin action), and/or add canonical tags in the rebuild.
- **Build command**: none. There is no `package.json`, lockfile or bundler. Workers Builds uploads the git checkout under `assets.directory "."`, minus `.assetsignore`. Gitignored local files (`.claude/skills/`, `skills-lock.json`, `*.mp4`) never reach the build.

## 2. Live edge behaviour

`curl -sSI` (and `curl -D -` for GET) against `https://willvernon.online`:

| Request | Status | Notes |
|---|---|---|
| `/`, `/about`, `/work` | 200 | `content-type: text/html`, `cf-cache-status: HIT` |
| `/index.html` | 307 → `/` | |
| `/about.html`, `/work.html`, `/projects.html`, `/music.html`, `/AI.html`, `/experiments.html` | 307 → `/<name>` | all 7 pages verified |
| `/about/` | 307 → `/about` | |
| `/nope` (GET) | 404, `content-length: 0`, no `content-type` | body is 0 bytes (measured) |
| `/upload_to_r2.py`, `/wrangler.jsonc` | 404 | `.assetsignore` is working |
| `/README.md` | 200 `text/markdown` | not ignored |
| `/style.css` | 200 `text/css`, HIT, has `etag` | |
| `/img/marimekko/Vernon_GDES50014_billboard4.png` | 200 `image/png`, MISS | |
| `http://willvernon.online/` (plain HTTP) | **200**, `cf-ray` present | not redirected to HTTPS. Observed through this environment's egress proxy, so a human should re-check from a normal network |
| R2 `assets.willvernon.online/ai/synthetic_corals_Preview.jpg` | 200 `image/jpeg`, `content-length: 368758`, DYNAMIC | no `cache-control` |
| R2 `assets.willvernon.online/previews/ai_trailer.mp4` | 200 `video/mp4`, `content-length: 2598561`, DYNAMIC | a `Range: 0-99` request returns 206 with `content-range: bytes 0-99/2598561` |
| R2 with `Origin: https://willvernon.online` | `access-control-allow-origin: *` | also exposes `ETag,Content-Range,Accept-Ranges,Content-Length,Content-Type` |

- The redirects and 404 match the Workers-assets defaults that `wrangler.jsonc` leaves unset: `html_handling: "auto-trailing-slash"` and `not_found_handling: "none"`.
- **Cache-Control** on the main domain is `public, max-age=0, must-revalidate` on `/`, `/about`, `/style.css` and the PNG. Every asset revalidates by `etag`. Filenames have no content hash, so a long `max-age` today would risk serving stale CSS.
- **R2** sends no `cache-control` and returns `cf-cache-status: DYNAMIC` on every probe, so it is not being edge-cached.
- **Security headers**: none of CSP, HSTS, `x-content-type-options`, `referrer-policy`, `permissions-policy` or `x-frame-options` appears on any probed response, main or R2 domain. Beyond the basics, the only extra headers are Cloudflare's `report-to`, `nel` and `alt-svc`.

## 3. Current Worker config & limits

- **Assets-only.** No script runs on the request path. Headers, redirects and a 404 page are still available without a script, through `_headers`, `_redirects` and `assets.not_found_handling` (§4). The current gaps come from those files and fields not existing, not from a platform limitation.
- **25 MiB per-file limit.** Exact sizes, from `stat -c %s` on `git ls-files`:

| File | MiB | % of 25 MiB |
|---|---|---|
| `img/marimekko/Vernon_GDES50014_billboard3.png` | 21.85 | 87.4% |
| `img/marimekko/Vernon_GDES50014_billboard4.png` | 21.54 | 86.1% |
| `img/marimekko/Vernon_GDES50014_billboard1.png` | 20.24 | 81.0% |
| `img/marimekko/Vernon_GDES50014_billboard2.png` | 19.73 | 78.9% |
| `img/powersurge/powersurgegif2.gif` | 18.10 | 72.4% |
| `img/powersurge/powersurgegif.gif` | 14.88 | 59.5% |

  No file exceeds the limit today. The rebuild should not add larger exports to git. `.gitignore` already keeps `*.mp4`, `*.mov` and `audio/*.wav` out of git "to conform with Cloudflare Workers limits" (`.gitignore` comments). Video is served from R2 instead, uploaded with `upload_to_r2.py` (3,556 B).
- **Footprint (production, `origin/main`)**: 179 files, 176,913,412 B (`git ls-tree -r -l`). By extension: 91 `.png`, 41 `.jpg`, 27 `.jpeg`, 7 `.html`, 5 `.mp3`, 2 `.gif`, 1 `.css`, plus config. `img/` is 156 MB and `audio/` is 14 MB (`du -sh`).
- **Branch `redesign/v2`**: 207 files, 178,170,494 B. It adds 28 tracked files under `redesign/`: 16 baseline JPGs, 9 content JSON/MD files and 3 scripts, 1.3 MB in all. `git diff --stat origin/main HEAD` shows 29 files changed, the 29th being `.gitignore`.
- **Action before merge:** add `redesign/` and `README.md` to `.assetsignore`, or move the working files out of the asset directory, for example by setting `assets.directory` to a `site/` or `public/` folder.

## 4. Edge-layer options for the rebuild

Third-party origins, from `grep -ohE 'https?://host' *.html style.css` and `redesign/content/assets.json`. The JSON's 97 external URLs include 82 on `assets.willvernon.online`.

| Origin | Use | Evidence | CSP directive |
|---|---|---|---|
| `assets.willvernon.online` | R2 images and video (17 `<video>` srcs) | 146 refs in HTML | `img-src`, `media-src` |
| `fonts.googleapis.com` / `fonts.gstatic.com` | Google Fonts, all 7 pages | e.g. `AI.html:9-11` | `style-src` / `font-src` |
| `unpkg.com` | Phosphor script, all 7 pages, **unversioned** (`index.html:14`) | redirects to `@2.1.2/src/index.js` | `script-src` |
| `cdn.jsdelivr.net` | Phosphor's script injects 6 stylesheets from `cdn.jsdelivr.net/npm/@phosphor-icons/web@2.1.2/…` | `curl -sSL unpkg.com/@phosphor-icons/web` | `style-src`, `font-src` (without it, every icon breaks) |
| `formspree.io` | live contact form POST | `index.html:514` | `form-action` |
| `w.soundcloud.com` | player iframe and `player/api.js` | `music.html:480` | `script-src`, `frame-src` |
| `open.spotify.com`, `www.youtube.com` | one iframe each | grep | `frame-src` |
| `soundcloud.com`, `vnon.bandcamp.com`, `www.linkedin.com`, `instagram.com`, `www.tiktok.com` | outbound links only | grep | none |

Also recommended: pin Phosphor to an exact version, or self-host it, so that an SRI hash is possible.

| | (a) Static only: `_headers` + `_redirects` + `wrangler.jsonc` | (b) Worker script + `run_worker_first` |
|---|---|---|
| Security headers / CSP | `/*` rule in `_headers`, no code | same headers set in JS; an extra moving part for no gain |
| Caching | `immutable` on a hashed-path prefix, a short TTL on HTML | same, as per-request logic |
| Redirects | `_redirects` for any renamed or removed pages | `if/else` on `pathname` |
| Custom 404 | `assets.not_found_handling: "404-page"` + `404.html` | possible, but more code |
| HTTP→HTTPS | not possible in assets config. Needs the zone's "Always Use HTTPS" setting (dashboard) | a Worker cannot fix it cleanly either. Same zone setting |
| Dashboard change | none for headers, redirects or 404 | none, if routes are scoped, but adds a `main` entry point |

**Recommendation: (a).** It meets the header, redirect and 404 needs with no runtime component and keeps the current assets-only architecture. Move to (b) only for routes that need server logic (`/api/*`), scoped with `run_worker_first`. Also flag "Always Use HTTPS" and HSTS as a human dashboard check.

## 5. Propose-only back-end options (not to be built now)

| Option | Value | Resources / secrets | Effort |
|---|---|---|---|
| Contact form | **A Formspree form already exists** (`index.html:514`, a plain POST with no JS handler). There are also `mailto:` links (`index.html:49`, `:483`, and one or two per page). A Worker endpoint would only replace a third-party dependency | Worker route, email-provider secret, Turnstile keys | small–medium; low priority while Formspree works |
| Analytics | none today: `grep -ci` for gtag, googletagmanager, analytics, plausible, cloudflareinsights and umami returns 0 on all 7 pages. Cloudflare Web Analytics is cookie-free | dashboard site tag. CSP must allow `static.cloudflareinsights.com` and `cloudflareinsights.com` | trivial |
| D1/KV content | edit the 1,429-item inventory without a redeploy | D1/KV binding + `main` Worker + editing UI | large |
| Audio stems from R2 | 5 tracked `audio/*.mp3` (14 MB), `.wav` gitignored | R2 already serves byte ranges (206) and `ACAO: *` (§2). No new resource | medium, mostly front-end |

## 6. Phase 7 (ship) needs and rollback

**Missing from this environment:**
- No Cloudflare credentials. `npx wrangler --version` returns 4.139.0, but `wrangler whoami` says "You are not authenticated". `~/.config/.wrangler/` holds only `logs/`, and no env var contains "cloudflare". This session cannot run `wrangler deploy`, `wrangler deployments list` or `wrangler rollback`, and cannot read Workers Builds logs.
- Pushing to `main` does trigger Workers Builds (§1), so shipping is push-and-wait.
- Disabling GitHub Pages, turning on "Always Use HTTPS" and changing DNS or R2 are all human actions.

**Pre-merge checklist (backend scope):**
1. Update `.assetsignore` for `redesign/` and `README.md`, or change `assets.directory` (§3).
2. Confirm no new tracked file is ≥ 25 MiB: `git ls-files -z | xargs -0 stat -c '%s %n' | sort -rn | head`.
3. Fix CSP origins per the §4 table, including `cdn.jsdelivr.net` and `formspree.io`.

**Rollback path (git only):**
1. Before shipping, tag and push the known-good `main`: `git tag v1-final f9757ca`, or the current `origin/main` at ship time.
2. Merge the redesign. Workers Builds redeploys.
3. If it misbehaves, `git revert` the merge on `main` and push. Workers Builds deploys the revert.
4. A dashboard or `wrangler rollback` to a prior Version ID (for example `6d764d4a-…` above) needs a token this environment lacks. That is a manual fallback for a human.

Verified by Opus adversarial pass: 46 claims checked, 13 corrected.
