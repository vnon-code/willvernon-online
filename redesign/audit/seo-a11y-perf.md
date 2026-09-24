# SEO + Accessibility + Performance Baseline

Audited 2026-09-24 using the seo-audit skill's on-page and technical SEO sections. Local server: `http://localhost:8765`. `curl -sI` shows `Server: SimpleHTTP/0.6 Python/3.11.15` with no `Content-Encoding`. Live site: `https://willvernon.online`. `server: cloudflare`, `content-encoding: zstd`. Branch `redesign/v2`. No git state was touched.

**The live site matches the repo exactly.** `curl -s https://willvernon.online/<page> | diff - <page>.html` returns 0 lines for all 7 pages. So static grep results apply to production.

**Methods.** axe-core 4.13.0 was injected with global Playwright (Chromium 1194, 1440×900, 2.5 s settle). Lighthouse 12.8.2 ran with its default mobile emulation, categories perf/a11y/best-practices/SEO, and `CHROME_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome`. Desktop Lighthouse was not run. The adversarial pass re-ran both tools, and the numbers below are the reproduced values.

---

## 1. SEO must-preserve list

### 1.1 Title, meta description and H1 per page

| Page | Title (chars) | Meta description | H1 (file:line) | Live URL behaviour |
|---|---|---|---|---|
| index | `William Vernon \| Generative Design & Creative Tech` (50) | none | "William Vernon", two `<span class="hero-scramble">` (index.html:74-77) | `/index.html` → 307 → `/` (200) |
| about | `About \| William Vernon` (22) | none | "About & Credentials" (about.html:199) | `/about.html` → 307 → `/about` (200) |
| work | `Works \| William Vernon` (22) | none | **none**. `grep -c '<h1' work.html` = 0. Only three `<h3>` panel titles exist (work.html:78,94,110). | 307 → `/work` |
| projects | `Projects \| William Vernon` (25) | none | "Project Archive" (projects.html:70) | 307 → `/projects` |
| music | `Music \| William Vernon` (22) | none | "ALIAS: VNON" (music.html:271) | 307 → `/music` |
| AI | `AI Experiments & Research \| William Vernon` (42) | none | "AI Experiments & Research" (AI.html:70) | 307 → `/AI` |
| experiments | `Minimal Experiments \| William Vernon` (36) | none | "Minimal Experiments" (experiments.html:260) | 307 → `/experiments` |

- All 7 titles are unique (line 6 of each file).
- The only meta tags are `charset` and `viewport` on lines 4-5 of every page. They are identical on every page.
- Every page except work has exactly one `<h1>`.
- `<html lang="en">` appears at line 2 of all 7 pages.

**Must-preserve: URL routing.**
- The 307s to extensionless URLs come from **this repo's deploy config**, not from Cloudflare Pages.
- `wrangler.jsonc` deploys the site as a Cloudflare **Workers static-assets** project with `"assets": {"directory": "."}`.
- The extensionless redirects are the default `html_handling` behaviour for Workers assets.
- `/<page>.html` returns 200 locally and 307 → 200 live for all 7 pages (`curl -w '%{http_code} %{redirect_url}'`).
- The rebuild must keep `/<page>.html` resolving, because every internal link uses it (see §1.5).

**Must-preserve: hash deep links.**
- index.html:111,137,187 and about.html:285,289,293 link to `projects.html#01`, `#03`, `#05` and `#06`.
- No element in projects.html has `id="01"` or the other ids (`grep -c` = 0 for each).
- These links resolve only through JavaScript (`window.location.hash` handler at projects.html:3356-3369). The rebuild must keep these fragment URLs working.

### 1.2 Canonical, Open Graph, Twitter Card and structured data

- `grep -c -E 'rel="canonical"|og:|twitter:|ld\+json'` returns 0 on all 7 files.
- The live index also returns 0 for these plus `name="description"`.
- There is no injection layer: the live HTML is byte-identical to the repo.

### 1.3 robots.txt, sitemap.xml and favicon

| | Repo | Local | Live |
|---|---|---|---|
| robots.txt | absent (`ls`) | 404 | 404 |
| sitemap.xml | absent | 404 | 404 |
| favicon.ico | absent, no `rel="icon"` in any page (`grep -c` = 0) | 404 | 404 |

The missing favicon was not in the original audit. Every page load requests `/favicon.ico` and gets a 404 (Lighthouse network log).

### 1.4 Image alt coverage

Counted with a Python regex over `<img…>` tags, cross-checked with `grep -o '<img'` and `grep -o 'alt='`.

| Page | `<img>` | missing `alt` | `loading="lazy"` | `srcset` |
|---|---|---|---|---|
| index | 20 | 0 | 0 | 0 |
| about | 1 | 0 | 0 | 0 |
| work | 1 | 0 | 0 | 0 |
| projects | 110 | **1** | 0 | 0 |
| music | 2 | 0 | 0 | 0 |
| AI | 26 | 0 | 0 | 0 |
| experiments | 1 | 0 | 0 | 0 |

- The one missing alt is the lightbox `<img id="xbox-lb-img" src="">` inside a JS template string (projects.html:2225). Its `src` is set at runtime, so it needs a dynamic alt.
- Alt text quality was not scored.
- No image on the site uses `loading="lazy"` or `srcset`.

### 1.5 Internal link graph

Result of `grep -n -o 'href="[^"#]*\.html[^"]*"'`:

- **Primary nav.** Home, Work, Music and About appear on all 7 pages. The desktop `.nav-links` block is at lines 28-31 and the logo link at line 40, and the mobile `#mobile-menu` repeats the same four links.
  - Line numbers are offset on about (157-160, 189-192), music (226-229, 258-261) and experiments (218-221, 250-253).
- **There is no site footer.** The second set of links is the mobile menu.
- projects, AI and experiments are **not in the primary nav**. Their inbound links:

| Target | Inbound links (source:line) | Source pages |
|---|---|---|
| projects.html | index.html:88,111,137,187 · about.html:285,289,293 · work.html:70 | 3 |
| AI.html | index.html:89,162,231 · work.html:86 | 2 |
| experiments.html | index.html:90 · work.html:102 | 2 |

- None of the three pages links to the other two.
- Together they hold 811 of 1,429 inventoried items (projects 513, AI 209, experiments 89), per the Totals line at `redesign/content/INVENTORY.md:8`.
- **Recommendation:** add these three pages to the nav, or add cross-links between them.

### 1.6 Deploy exposure (missed by the original audit)

- `assets.directory` is `"."`, and `.assetsignore` excludes only `.git*`, `wrangler.jsonc`, `.assetsignore`, `node_modules` and `upload_to_r2.py`.
- `README.md` is publicly served today: `curl https://willvernon.online/README.md` returns 200.
- `redesign/` is tracked in git (audit 3, baseline 16, content 9, scripts 3 files; `git ls-files redesign`) and is not in `.assetsignore`.
- **Deploying this branch would publish the redesign audit files, screenshots and content JSON as crawlable URLs.** Add `redesign/` and `README.md` to `.assetsignore` (or narrow `assets.directory`) before the redesign ships.

---

## 2. Quick wins for the rebuild

| Item | Priority | Source / note |
|---|---|---|
| Meta description on every page | High | Trim existing intro copy to about 155 characters. Sources: index.html:84 (`.hero-desc`), about.html:201, projects.html:72, music.html:273, AI.html:72, experiments.html:262. Only index uses the class `hero-desc`. **work.html has no page intro**, only one-line `.panel-desc` blurbs (work.html:80,96,112), so its description needs new copy or user approval. |
| Canonical tag on every page | High | **User decision:** canonicalise to the `.html` URL or the extensionless one. The extensionless URL is the 307 target, so it is what the browser and crawlers land on. |
| robots.txt and sitemap.xml | High | New files, no copy decision needed. |
| favicon (`rel="icon"`) | Medium | `img/monogram-white-trans.png` already exists (33,318 B). |
| OG and Twitter tags | Medium | **The image needs a pick from the user.** Candidates: `img/monogram-white-trans.png` (33,318 B, logo only) or `img/TouchDesigner_screenshot.png` (733,288 B, would need resizing). A purpose-made 1200×630 image is recommended. |
| JSON-LD `Person` | Medium | The `sameAs` links already exist: LinkedIn at about.html:231 and Instagram at about.html:232 (also about.html:176-177). |
| work.html `<h1>` | High | Structural fix. |
| `.assetsignore` for `redesign/` and `README.md` | High | See §1.6. |
| Add projects, AI and experiments to the nav | Medium | See §1.5. |

---

## 3. Accessibility baseline (axe-core 4.13.0, re-run reproduced every count)

| Page | Violations (rule, impact, nodes) |
|---|---|
| index | color-contrast, serious, 27 · label, **critical**, 3 |
| about | color-contrast, serious, 6 · heading-order, moderate, 1 · link-name, serious, 2 |
| work | color-contrast, serious, 4 · page-has-heading-one, moderate, 1 |
| projects | color-contrast, serious, 57 · heading-order, moderate, 1 · region, moderate, 2 |
| music | color-contrast, serious, 11 · frame-title, serious, 1 · label, **critical**, 3 |
| AI | color-contrast, serious, 14 · heading-order, moderate, 1 |
| experiments | color-contrast, serious, 10 · heading-order, moderate, 1 |

**Totals: 129 color-contrast nodes.** Other rules:
- `label`: 2 critical violations covering 6 nodes.
- `heading-order`: 4, on 4 of the 7 pages.
- `link-name`: 1 violation (2 nodes).
- `frame-title`: 1.
- `page-has-heading-one`: 1.
- `region`: 1 violation (2 nodes).

What each non-contrast violation hits:

- **`label`:** index `#param-filter`, `#param-dist` and `#master-vol` (index.html:457, and the JS-generated sliders at index.html:1129); music `#slider-chaos`, `#slider-density` and `#slider-volume` (music.html:379 onward).
- **`link-name`:** icon-only links at about.html:231-232 have no text or `aria-label`. The header copies at about.html:176-177 do have `aria-label`.
- **`frame-title`:** the flagged node is the **Spotify embed** `iframe[data-testid="embed-iframe"]` at music.html:313.
  - The hidden SoundCloud iframe (music.html:279) also has no `title`.
  - axe skips it because it is `visibility:hidden`, placed at -9999px.
- **`heading-order`:** about `.about-desc-col h3`; projects `div[data-id="01"] … h3`; AI `#hud-tool-title`; experiments project-card `h3`.
- **`region`:** two `.filter-label` elements on projects sit outside any landmark.

**Colour contrast.** WCAG ratio recomputed by hand, and axe data grouped by colour pair:
- **Red accent `#D91C1C`:** 4.12:1 on `#020000`. It falls to **3.89:1 on `#0a0a0a`** and 3.98-4.10:1 on the card backgrounds (`#0b0505`, `#070505`, `#050000`), on index and AI. It passes AA-large (3:1) and fails AA text (4.5:1).
- **Gray `#6b7280`:** 4.33:1 on `#020000` for the 3 inactive nav links on 6 pages. It falls to 4.09-4.31:1 elsewhere.
  - It is also body/meta text, not just nav. On projects, 36 nodes are `#6b7280` on `#050000` (4.31:1).
- Every failure is close to the 4.5:1 line. Lightening the red and gray one or two steps fixes them without changing the black/red look (see `redesign/baseline/sheet-desktop.jpg`).

### Static checks

| Check | Result | Evidence |
|---|---|---|
| `<html lang>` | `en` on all 7 pages | line 2 of each file |
| `<header>` landmark | present on 6 pages, **absent on work.html** | `grep -o '<header'`: work = 0 |
| `<nav>` and `<main>` | present on all 7 pages | same grep |
| `<footer>` | **there is no site footer at all**. The only "footer" strings are card classes (e.g. AI.html:208 `.ai-card-footer`, projects.html:2821). | `grep -i footer` |
| Skip link | absent. The only "skip" matches are music player icons (music.html:427,433). | `grep -i skip` |
| Focus styles | `style.css` (86,549 B, 4,014 lines) has **one** `:focus` rule: `.form-input:focus` at style.css:1883, used only on index. | see below |
| `prefers-reduced-motion` | 0 matches in `style.css` and all 7 HTML files. | `grep -c` |

- **`outline: none`, CSS.** It appears at style.css:1878 (`.form-input`, which has a focus replacement) and style.css:2087 (`.vj-slider`, which has none).
- **`outline: none`, inline.** It also appears on index.html:447 (`#av-play-btn`), index.html:457 (`#master-vol`) and index.html:1129 (JS-generated sliders), none of which have a focus replacement.
- **`@keyframes`.** style.css has 13, and music.html and projects.html have 1 inline each, so 15 in total.
- **JS animation.**
  - `requestAnimationFrame` is used in index.html and music.html, which also contain `<canvas>`.
  - The `.hero-scramble` text effect is on index.html only.
  - None of it has a reduced-motion opt-out.

---

## 4. Performance baseline (Lighthouse 12.8.2, mobile, simulated throttling)

The adversarial re-run matched the original within ±1 point and about ±75 ms. The table shows the original run, with the corrected AI FCP.

| Page | Perf | A11y* | BP | SEO | LCP ms | TBT ms | CLS | FCP ms | Bytes | Req |
|---|---|---|---|---|---|---|---|---|---|---|
| index | 81 | 90 | 96 | 82 | 4051 | 26 | 0 | 2352 | 525,388 | 20 |
| about | 96 | 87 | 96 | 91 | 2101 | 0 | 0 | 1951 | 141,020 | 6 |
| work | 98 | 100 | 96 | 91 | 1802 | 0 | 0 | 1802 | 132,182 | 9 |
| projects | 84 | 92 | 96 | 91 | 3601 | 0 | 0 | 3001 | **1,813,087** | 13 |
| music | 89 | 85 | 96 | 91 | 3002 | 3 | 0 | 2402 | 277,100 | 16 |
| AI | 89 | 93 | 96 | 91 | 3526 | 0 | 0 | **2101** | 428,109 | 18 |
| experiments | 96 | 92 | 96 | 91 | 2401 | 0 | 0 | 1951 | 141,243 | 15 |

\* Lighthouse's a11y score is a weighted subset of axe rules. It does not score `page-has-heading-one`, which is why work scores 100. §3 is the authoritative accessibility source.

**SEO failures.** Every page fails `meta-description`. index also fails `crawlable-anchors`, because of `<a href="javascript:void(0)" onclick="copyDiscordHandle()">` at index.html:495. That should become a `<button>`. Lighthouse does **not** flag work.html's missing H1.

**What drives LCP.** The LCP element is a **text paragraph**, not an image, on:
- index: `p.hero-desc`
- projects: the intro `<p>`
- AI: the intro `<p>`

So LCP depends on these render-blocking resources, which appear on every page:
- the Google Fonts CSS (index.html:11)
- a **synchronous** `<script src="https://unpkg.com/@phosphor-icons/web">` (index.html:14)
- `style.css?v=19` (index.html:17)

Render-blocking savings are 1118-1223 ms on index, projects and AI.

**Opportunities** (original run; KB = 1000 bytes):

| Opportunity | index | projects | AI |
|---|---|---|---|
| Render-blocking | 1226 ms | 1162 ms | 1164 ms |
| Unused CSS | 450 ms / 70.4 KB | 300 ms / 77.7 KB | 300 ms / 76.5 KB |
| Unminified CSS | 150 ms / 21.4 KB | 21.4 KB | 21.4 KB |
| Offscreen images | 800 ms | passes | passes |
| Responsive images | 950 ms / 353 KB | 150 ms / 1.13 MB | 900 ms / 290 KB |
| Modern formats | 800 ms / 254 KB | 150 ms / 1.31 MB | 750 ms / 217 KB |
| Text compression | 750 ms / 134 KB | 1350 ms / 282 KB | 600 ms / 107 KB |

**projects.html weight is one image.**
- `img/powersurge/PowerSurgeSS2.png` is 1,450,971 B (`ls -la`), about **80% of the page's 1.81 MB**. It is referenced at projects.html:620 (`mediaSrc`).
- It is not spread across the 513 inventoried items. Only 13 requests load, because most of the 110 `<img>` are built from JS data when needed.
- The next largest item is projects.html itself (241,160 B transfer).

**Text compression caveat.** The local server sends no compression, but the live site returns `content-encoding: zstd`. The text-compression savings are therefore a local-server artifact. The render-blocking, unused CSS and image findings do not depend on the server.

### Numbers the rebuild must beat

- **LCP:** index 4051, projects 3601, AI 3526, music 3002, experiments 2401, about 2101, work 1802 ms. Target under 2.5 s everywhere.
- **Performance score:** index 81, projects 84, music 89, AI 89. Target 90+.
- **Bytes:** projects 1.81 MB; the other pages are 132-525 KB. Recompressing PowerSurgeSS2.png alone removes most of it.
- **SEO score:** 82-91. Meta descriptions, plus a `<button>` for the Discord link, should reach 100.
- **axe:** 0 critical (currently 2 `label`), 0 color-contrast nodes (currently 129), and add work.html's `<h1>` and `<header>`.

Verified by Opus adversarial pass: 64 claims checked, 19 corrected.
