# SEO + Accessibility + Performance Baseline

Audited: 2026-09-24. Framework: `.claude/skills/seo-audit/SKILL.md` (On-Page + Technical SEO sections). Server: local static server at `http://localhost:8765` (Python `SimpleHTTP`, no compression). Live: `https://willvernon.online` (Cloudflare). Repo branch `redesign/v2`, no git state touched.

**Methods used exactly as specified:** axe-core 4.x via Playwright (globally-installed) against the local server — succeeded first try, full run below, no fallback needed. Lighthouse 12 (`npx lighthouse@12`) with `CHROME_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome`, default mobile emulation, categories `performance,accessibility,seo,best-practices` — succeeded for all 7 pages in ~90s total, no fallback needed. Desktop Lighthouse runs were **not** run (mobile-only kept inside the 10-min time box, per task's "if feasible"); mobile is the higher-value baseline since Lighthouse's default throttling models the slower device.

---

## 1. SEO must-preserve list

### 1.1 Per-page title / meta / H1 / URL

| Page | Title (chars) | Meta description | H1 | URL served |
|---|---|---|---|---|
| index.html | `William Vernon \| Generative Design & Creative Tech` (50) | **none** | "William Vernon" (split across 2 `<span>`) | `/index.html` → live 307 → `/` (200) |
| about.html | `About \| William Vernon` (22) | **none** | "About & Credentials" | `/about.html` → live 307 → `/about` (200) |
| work.html | `Works \| William Vernon` (22) | **none** | **missing — no `<h1>` at all** (work.html:1-135) | `/work.html` → live 307 → `/work` (200) |
| projects.html | `Projects \| William Vernon` (25) | **none** | "Project Archive" | `/projects.html` → live 307 → `/projects` (200) |
| music.html | `Music \| William Vernon` (22) | **none** | "ALIAS: VNON" | `/music.html` → live 307 → `/music` (200) |
| AI.html | `AI Experiments & Research \| William Vernon` (42) | **none** | "AI Experiments & Research" | `/AI.html` → live 307 → `/AI` (200) |
| experiments.html | `Minimal Experiments \| William Vernon` (36) | **none** | "Minimal Experiments" | `/experiments.html` → live 307 → `/experiments` (200) |

Evidence: `grep -n -i -E '<title>|<meta|<h1' *.html` on each file; titles/H1 confirmed at the line numbers above (e.g. `about.html:6`, `about.html:199`; `work.html` has zero `<h1>` matches). All 7 titles and both meta tags (`charset`, `viewport`) are unique per page — no duplicates.

**Must-preserve — URL routing (important, easy to break in a rebuild):** the live site already 307-redirects every `/<page>.html` request to an extensionless canonical (`/about.html`→`/about`, `/index.html`→`/`, confirmed via `curl -sI`), landing on 200. This is Cloudflare Pages' clean-URL behavior, not something in this repo. **The rebuild must keep `/<page>.html` resolving (redirect or direct serve) since that's what every internal link, all external backlinks, and likely all indexed Google URLs use** — verified via `curl -sI` on all 7 pages, local 200 / live 307→200 on every one.

**Must-fix carried into rebuild:** `work.html` has no H1 (page-has-heading-one — Lighthouse SEO/a11y flag, `work` page, confirmed no `<h1>` string in the file). Every other page has exactly one H1.

### 1.2 Canonical / OG / Twitter Card / structured data

Zero occurrences of `rel="canonical"`, `og:`, `twitter:`, or `application/ld+json` across all 7 HTML files (`grep -c` returns 0 for every page, `grep -rl "application/ld+json" *.html` matches nothing). Per the skill's schema-detection caveat, this was also checked live (curl on the rendered static HTML — no CMS/JS injection layer here, so static grep is reliable, unlike a Yoast/RankMath site).

### 1.3 robots.txt / sitemap.xml

| | Repo | Live (`willvernon.online`) |
|---|---|---|
| robots.txt | absent (`ls robots.txt` → no such file) | `curl -o /dev/null -w %{http_code}` → **404** |
| sitemap.xml | absent | **404** |

Neither exists anywhere. No crawl directives, no sitemap submission possible today.

### 1.4 Image alt coverage

| Page | `<img>` tags | `alt=` attrs | Gap |
|---|---|---|---|
| index | 20 | 20 | 0 |
| about | 1 | 1 | 0 |
| work | 1 | 1 | 0 |
| projects | 110 | 109 | **1 missing** |
| music | 2 | 2 | 0 |
| AI | 26 | 26 | 0 |
| experiments | 1 | 1 | 0 |

Counted via `grep -o '<img'` / `grep -o 'alt='` per file. Coverage is otherwise complete by count; alt *quality* (descriptive vs. filler) was not scored — out of scope for a grep-based pass, flag for manual review during rebuild since `projects.html` alone carries 513 inventoried content items and most images are project-card thumbnails.

### 1.5 Internal link graph

Primary nav (`index / work / music / about`) is present identically on **all 7 pages** (`grep -o 'href="[^"]*\.html"' *.html`, confirmed 4 nav links + footer links repeated on every file). `projects.html`, `AI.html`, and `experiments.html` are **not in the primary nav anywhere** — they're reachable only via: index.html hero buttons (`explore_projects`, `AI projects`, `experiments`) and work.html's three panel links (Projects/AI/Experiments, `work.html:70,86,102`). That means those three pages have exactly 2 inbound internal links apiece, and none of the three link to each other or back to `work.html` in-body. Not orphans, but thin internal linking for pages holding the majority of content (projects.html = 513 of 1,429 inventoried items, per `redesign/content/INVENTORY.md` header). **Recommendation for rebuild:** add projects/AI/experiments to primary nav, or add contextual cross-links between them.

---

## 2. Quick wins the rebuild should add

All copy suggestions below are **pulled verbatim/near-verbatim from existing on-page content** (the hero-desc paragraph each page already has) — none invented. Anything needing new copy is flagged for user approval.

| Item | Priority | Source / note |
|---|---|---|
| **Meta description**, every page | High | Reuse each page's existing `.hero-desc` / `.text-gray-400` intro paragraph, trimmed to ~155 chars. e.g. about.html:200 *"An adaptable designer combining technical software execution with multidisciplinary creative workflows..."*; music.html *"Under the alias vnon, I construct electronic music, focusing predominantly on the architectural complexities of Drum & Bass..."* — all 7 pages have an equivalent paragraph already (index.html:84, work.html:20-21 per-panel copy, projects.html:71, AI.html:72, experiments.html:262). Trimming to length is a mechanical edit, not new copy. |
| **Canonical tag**, every page | High | Self-referencing `<link rel="canonical">`. **Needs a decision from the user**: canonicalize to the `.html` URL (matches internal links/existing backlinks) or the extensionless URL (matches what Cloudflare currently serves as the 307 target, `/about` not `/about.html`) — recommend the extensionless form since that's the URL the browser actually lands on and Google will see. |
| **robots.txt** | High | New file, trivial content (`User-agent: *\nAllow: /\nSitemap: https://willvernon.online/sitemap.xml`) — no copy decision needed. |
| **sitemap.xml** | High | New file listing the 7 canonical URLs. No copy decision needed. |
| **OG image + `og:title`/`og:description`/`og:url`/`og:type`** | Medium | Description text reuse as above. **Image needs a pick from the user** — no dedicated social-share image exists today; candidates already in repo: `img/monogram-white-trans.png` (33KB, logo-only, weak for link previews) or a project screenshot e.g. `img/TouchDesigner_screenshot.png` (720KB, would need resizing/compression). Flag: recommend a purpose-made 1200×630 OG image rather than reusing either. |
| **Twitter Card tags** (`summary_large_image`) | Medium | Mirrors OG once image/description exist. |
| **JSON-LD `Person`** on about.html / index.html | Medium | Name, jobTitle, sameAs (LinkedIn `about.html:231`, Instagram `about.html:232`) are all already on-page — structured-data-only edit, no new copy. |
| **JSON-LD `CreativeWork`** per project card (projects.html) / **MusicRecording** (music.html) | Low | Would lift straight from `redesign/content/projects.json` / `music.json` fields already extracted — mechanical, no new copy, but 513-item projects.json makes this a scoped follow-up rather than a quick win. |
| **`work.html` H1** | High | Structural fix, not copy: promote the page's own title text into a real `<h1>` (currently only `<h3>` panel titles exist, `work.html:78,94,110`). |
| **Add projects/AI/experiments to primary nav** | Medium | See §1.5. |

---

## 3. Accessibility baseline (axe-core 4.x, real browser via Playwright)

Ran successfully against all 7 pages on the local server — no fallback needed. Full violation set (impact + node count):

| Page | Violations (id — impact — node count) |
|---|---|
| index | `color-contrast` — serious — 27 nodes · `label` — **critical** — 3 nodes |
| about | `color-contrast` — serious — 6 · `heading-order` — moderate — 1 · `link-name` — serious — 2 |
| work | `color-contrast` — serious — 4 · `page-has-heading-one` — moderate — 1 |
| projects | `color-contrast` — serious — 57 · `heading-order` — moderate — 1 · `region` — moderate — 2 |
| music | `color-contrast` — serious — 11 · `frame-title` — serious — 1 · `label` — **critical** — 3 |
| AI | `color-contrast` — serious — 14 · `heading-order` — moderate — 1 |
| experiments | `color-contrast` — serious — 10 · `heading-order` — moderate — 1 |

**Totals to beat: 129 color-contrast nodes, 2 critical `label` violations (6 nodes), 4 heading-order, 2 serious `link-name`, 1 serious `frame-title`, 1 `page-has-heading-one`, 1 `region`.**

Specific findings worth carrying into the rebuild plan:
- **`label` (critical)** — index.html's `#param-filter`, `#param-dist`, `#master-vol` and music.html's `#slider-chaos`, `#slider-density`, `#slider-volume` are unlabeled form controls (VJ-deck sliders). Screen-reader users get no name for these controls at all.
- **`link-name` (serious)** — about.html's LinkedIn/Instagram icon links (`about.html:231-232`) are icon-only `<a target="_blank">` with no text/`aria-label`, so they announce as blank links.
- **`frame-title` (serious)** — music.html's hidden SoundCloud `<iframe id="soundcloud-hidden-player">` has no `title` attribute.
- **`heading-order` (moderate, 5 of 7 pages)** — about/projects/AI/experiments each skip a level once (e.g. `.about-desc-col h3` with no preceding `h2` in that column; `AI.html`'s `#hud-tool-title`; project-card `h3`s under a section with no `h2`).
- **`region` (moderate)** — two `filter-label` spans on projects.html sit outside any landmark region.
- **`color-contrast` (serious, every page, by far the largest bucket)** — two repeating patterns:
  1. **Red accent text (`#D91C1C`) on near-black (`#020000`) = 4.12:1**, just under the 4.5:1 AA text threshold. Confirmed independently by manual contrast calc: `4.13:1` (passes AA-large at 3:1, fails AA-normal at 4.5:1). Hits every `.text-accent` label across all 7 pages.
  2. **Inactive nav-link gray (`#6b7280`) on `#020000` = 4.33:1**, also just under 4.5:1 — hits the 3 non-active links in the primary nav on every page.
  Both are "just below the line" fails, not gross violations — cheap to fix (darken the background slightly, or lighten the red/gray a couple of steps) without abandoning the black/red aesthetic (confirmed against `redesign/baseline/sheet-desktop.jpg` / `sheet-mobile.jpg`, which show the intended look).

### Static checks (per skill's audit framework, beyond axe)

| Check | Result | Evidence |
|---|---|---|
| `<html lang>` | `lang="en"` on all 7 pages | `grep -n "<html" *.html` |
| Landmarks (`<header><nav><main>`) | present on all 7 pages | `grep -n -o -E '<header|<nav|<main' *.html` |
| `<footer>` landmark | **absent on all 7 pages** — footer content exists but is wrapped in `<div>`, not `<footer>` | `grep -n "<footer" *.html` → no matches |
| Skip-to-content link | **absent on all 7 pages** | `grep -n -o -E 'skip-link|skip to content' *.html` → no matches |
| Focus styles (`:focus` in style.css) | **only 1 rule in the whole 86KB file** — `.form-input:focus` (style.css:1883, adds border-color + box-shadow). Two `outline: none` resets exist (style.css:1878 `.form-input`, style.css:2087 `.vj-slider`); the form-input has a `:focus` replacement, the VJ slider does **not** — keyboard focus on the slider control is very likely invisible. | `grep -n ":focus\|outline" style.css` |
| `prefers-reduced-motion` | **zero matches anywhere** — style.css and all 7 HTML files. Site has 13 `@keyframes` blocks and JS-driven effects (hero text scramble, particle canvas per baseline screenshots) with no reduced-motion opt-out. | `grep -n "prefers-reduced-motion" style.css *.html` → no matches |

---

## 4. Performance baseline (Lighthouse 12, mobile, default throttling)

Method used: **Lighthouse**, as specified — no Playwright-timing fallback needed. `CHROME_PATH` pointed at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`. All 7 mobile runs completed in ~90s wall time (well inside the 10-min box); desktop runs were skipped to stay time-boxed, since mobile (Lighthouse's default, simulated mid-tier device + slow 4G) is the more conservative number to beat.

| Page | Perf | A11y* | Best Practices | SEO | LCP (ms) | TBT (ms) | CLS | FCP (ms) | Total bytes | Requests |
|---|---|---|---|---|---|---|---|---|---|---|
| index | 81 | 90 | 96 | 82 | 4051 | 26 | 0.000 | 2352 | 525,388 | 20 |
| about | 96 | 87 | 96 | 91 | 2101 | 0 | 0.000 | 1951 | 141,020 | 6 |
| work | 98 | 100 | 96 | 91 | 1802 | 0 | 0.000 | 1802 | 132,182 | 9 |
| projects | 84 | 92 | 96 | 91 | 3601 | 0 | 0.000 | 3001 | **1,813,087** | 13 |
| music | 89 | 85 | 96 | 91 | 3002 | 3 | 0.000 | 2402 | 277,100 | 16 |
| AI | 89 | 93 | 96 | 91 | 3526 | 0 | 0.000 | 428,109 | 428,109 | 18 |
| experiments | 96 | 92 | 96 | 91 | 2401 | 0 | 0.000 | 1951 | 141,243 | 15 |

\* Lighthouse's own accessibility category score — a coarser, non-overlapping check from the same axe-core ruleset used differently; the §3 axe-core run above is the authoritative a11y source.

**SEO category failures (Lighthouse):** every page fails `meta-description` (confirms §1.2/1.3). `index.html` additionally fails `crawlable-anchors` — the Discord button is `<a href="javascript:void(0)" onclick="copyDiscordHandle()">` (index.html, `.discord-btn`), which Google can't crawl as a link (it's a copy-to-clipboard action misusing an `<a>` — cosmetic/functional issue, not a content loss, but worth a `<button>` swap in the rebuild).

**Performance opportunities (shared across pages), with measured savings:**

| Opportunity | index | projects | AI |
|---|---|---|---|
| Render-blocking resources | 1226ms | 1162ms | 1164ms |
| Unused CSS | 450ms / 70.4KB | 300ms / 77.7KB | 300ms / 76.5KB |
| Unminified CSS | 150ms / 21.4KB | 21.4KB (0ms) | 21.4KB (0ms) |
| Offscreen images | 800ms | — | — |
| Responsive images | 950ms / 353KB | 150ms / **1.13MB** | 900ms / 290KB |
| Modern image formats (WebP/AVIF) | 800ms / 254KB | 150ms / **1.31MB** | 750ms / 217KB |
| Text compression | 750ms / 134KB | 1350ms / 282KB | 600ms / 107KB |

The single `style.css` (86KB, unminified, un-code-split) is render-blocking and largely unused per-page — every page pays its full weight. `projects.html` is the heaviest page by a wide margin (1.8MB total, driven by unoptimized/non-responsive images across its 513 inventoried items) despite a mid-range 84 perf score, because none of its images are lazy/responsive.

**Caveat on the text-compression finding:** the local dev server is Python's bare `SimpleHTTP` (confirmed via `curl -sI` → `Server: SimpleHTTP/0.6 Python/3.11.15`), which sends **no** `Content-Encoding`. The live site (`curl -sI --compressed`) returns `content-encoding: zstd` via Cloudflare, so production is likely not actually losing this much to compression — but the render-blocking-CSS, unminified-CSS, and unoptimized-image findings are server-independent and real.

### Numbers the rebuild must beat

- **LCP:** index 4051ms, projects 3601ms, AI 3526ms, music 3002ms, experiments 2401ms, about 2101ms, work 1802ms — target sub-2.5s (Core Web Vitals "good") on every page, i.e. cut index's LCP by ~40%.
- **Performance score:** index 81, projects 84, music 89, AI 89 are the four below-90 pages — target 90+ across the board.
- **Total byte weight:** projects.html at 1.81MB is the outlier to fix first (vs. 130-530KB on every other page).
- **SEO score:** capped at 82-91 site-wide purely by the missing meta-description (+ index's crawlable-anchors); adding descriptions/canonicals per §2 should be enough to reach 100 on Lighthouse SEO.
- **Accessibility (axe):** 0 critical violations (currently 2: `label` ×2 pages), 0 serious color-contrast nodes (currently 129 across all pages), fix `work.html`'s missing H1.
