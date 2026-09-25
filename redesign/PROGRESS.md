# Progress: willvernon.online v2 rebuild

## Status

| Phase | State | Branch head / notes |
|---|---|---|
| 0: audit | ✅ done | inventory (1,429 items), 3 verified audits, baseline sheets |
| 1: plan | ✅ done, **approved 2026-09-25 (A, yes to all §7)** | PLAN.md, REFERENCES.md, directions A/B/C + JUDGEMENT.md |
| 2: design system + shell + edge | ▶ starting in a fresh session | kickoff prompt from PLAN.md §4 |
| 3–7 | ⏳ | |

**Next action:** run Phase 2 (fresh session, PLAN.md §4 kickoff). User to-dos: disable GitHub Pages (repo Settings → Pages); create a Cloudflare Web Analytics site tag when Phase 6 asks for it.

## Spend ledger (cap $250; plan ≤ $180)
No `/cost` or `/usage` figure is visible from inside this cloud session, so **every figure below is an estimate**, built from workflow token counts and turn counts at the list prices in PLAN.md §6.

| Checkpoint | Item | Tokens | Est. $ | Running est. |
|---|---|---|---|---|
| P0 | Main loop: setup, skills install, extractor, baseline shots (Opus) | ~60 turns, cached context | 3.0 | 3.0 |
| P0 | WF1 audit + verify: 3 Sonnet auditors, 3 Opus verifiers | 696k (subagent) | 4.0 | 7.0 |
| P1 | WF2 reference sweep: 3 Sonnet searchers | 248k | 0.8 | 7.8 |
| P1 | Reference screenshots (script; one contact sheet viewed) | — | 0.2 | 8.0 |
| P1 | WF3 reference analysis (Opus) → 3 directions (Sonnet) → judge (Opus) | 588k | 3.5 | 11.5 |
| P1 | Main loop: PLAN/AUDIT/PROGRESS/CLAUDE.md, completeness critic | — | 1.5 | **≈ 13** |

**Phase 0+1 budget was $22; the estimate is ≈ $13 (range $10–16).** The unspent ~$9 rolls into the reserve.

## Skills used

| Phase | Skill | What it did and how it shaped the result |
|---|---|---|
| 0 | impeccable | The front-end auditor used its critique/audit framework: anti-generic assessment, top-5 strengths and weaknesses, and the craft floor that fed the "what works / problems" split in AUDIT.md. |
| 0 | seo-audit | Structured the SEO baseline: the must-preserve list (titles, H1s, URLs, alt text) and quick wins (description, canonical, OG, JSON-LD, sitemap), which became Phase 6 acceptance items. |
| 1 | impeccable | Anti-generic lens for REFERENCES.md (the anti-pattern list) and for each direction draft; the judge used it to strip neon-cyan and three-family type from A. |
| 1 | emil-design-eng | Motion and polish decisions in each direction: a single easing family, a 1:1 cursor rather than a laggy quickTo, restraint on what animates. |
| 1 | find-animation-opportunities | Picked which elements earn motion: the ruler scrub on process steps and scramble only on metadata; rejected scrambling the LCP heading. |
| 1 | gsap-core | Grounded the motion tokens in real GSAP APIs (CustomEase, matchMedia reduced-motion branches, SplitText/ScrambleText, Flip vs View Transitions). |
| 0 | workflow-authoring (built-in) | Shaped the three workflows (a pipelined audit into verify, a blind parallel sweep, a directions judge panel). |

Installed but not yet used (reserved for later phases): animate, review-animations, gsap-scrolltrigger, gsap-timeline, gsap-performance.

## Setup notes
- **Skills install:** `npx skills add <repo> -a claude-code -s <skill> -s <skill> … -y --copy`. A comma-separated `-s a,b` fails with "No matching skills"; repeat `-s` for each skill instead. All 10 skills installed into `.claude/skills/`, which is gitignored along with `skills-lock.json` and `.agents/`.
- **impeccable:** its CLI script downloads its engine binary from GitHub releases, with sha256 verification. We didn't run it; only SKILL.md and the reference docs were used.
- **Not available in this environment:** the Refero connector and `design:accessibility-review`, so both were skipped. Mobbin (`search_sections` / `search_screens`) was used for section patterns.
- **Network:**
  - awwwards.com stays blocked by the environment's egress policy, so Awwwards evidence came from web search.
  - godly, siteinspire, gsap.com, willvernon.online, assets.willvernon.online and the workers.dev preview are all reachable.
  - Chromium needs the proxy CA: `screenshots.mjs` reads `PROXY_CA_SPKI`, a comma list of base64 SHA-256 SPKI hashes computed from the last certs in `/root/.ccr/ca-bundle.crt`; see the commit that added it. Certificate verification stays on, pinned to the proxy CA.
- **Python deps** for the extractor: `pip install beautifulsoup4 lxml` (container only).
- **Local preview of v1:** `python3 -m http.server 8765` from the repo root.

## Rollback (fill in during Phase 7)
- `v1-final` tag: not created yet.
- Steps: see PLAN.md §5.
