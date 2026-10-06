# Overnight run: a Project Sheet per project (2026-10-06 → 07)

Will is asleep. He agreed every decision below in a grilling round and reviews everything in the morning. Don't wait
for him and don't ask him anything: decide, record why, and list what only he can decide in your output.

## Where things are
- Repo: `/Users/williamvernon/Documents/Personal Projects/willvernon-online`, branch `overnight/project-sheets`
  (off `v3`). Never switch branch, never touch `v3` or `main`, never deploy, never upload to R2.
- Dev server: http://localhost:3000 (Nuxt HMR, already running; don't start another). If it's down, start it with
  `cd <repo> && COREPACK_ENABLE_DOWNLOAD_PROMPT=0 corepack pnpm dev --port 3000` in the background.
- The ticket and history: `.scratch/v1-launch/tickets/08-project-sheet.md`, the base matrix
  `.scratch/v1-launch/project-sheet-matrix.md` (criteria 1–14, rounds 1–2, verdicts), the round-2 prototype
  (`app/composables/useSheetProto.ts`, `app/components/Sheet*.vue`, `content/stories/amplified-spaces.json`).
- Will's references and taste: `references/REFERENCES.md` (keepers, Avoid list, dropped sites); round-2 reference
  shots `references/shots/r4/` (Lusion, Obys, Kenta Toshikura, Rejouice).
- Per-project work dir: `.scratch/v1-launch/overnight/<slug>/` (story.md, matrix.md, stills, notes).
- Media: `public/proto-media/<slug>/` (gitignored, dev only). Keep a `public/proto-media/<slug>/UPLOAD.md` listing
  each file a page uses, for Will's R2 upload in the morning.

## Will's PC (sources)
`ssh -o BatchMode=yes <user>@<will-pc>` (Tailscale, key login). Default shell is cmd; run PowerShell as
`powershell -NoProfile -EncodedCommand <b64>` (UTF-16LE base64 of a script you write to /tmp/claude-501/).
`scp -o BatchMode=yes "<user>@<will-pc>:C:/path/file" <local>` copies a file (plain path, no inner quotes).
READ-ONLY: never write, move or delete on the PC. Scope C:, D:, E:, but never open credential-like files
(keys, passwords, tokens, .env, `Keys.txt`), his employer or private messages.
Source map (survey 2026-10-06): `C:\Users\wvern\Documents\website\projects\NN_<slug>\` (assets, `documents\`
process books), `...\website\AI\`, `...\website\experiments\`; uni modules in `D:\UNIVERSITY\Graphic Design\<year>\<module>\`:
Smuggler's Outpost = 3rd Year\Major Project (6001, process books V1–V4); The World Plays Here = 3rd Year 6003 D&AD;
Handheld Stories = 3rd Year 6004 ISTD; Powersurge = 3rd Year Collab Project 6002 (guess; verify); Amplified Spaces =
2nd Year 5006; Marimekko = 1st Year 5014; Remnants = 1st Year 4002 / Old Submissions; Topography = website\experiments\01_topography,
2nd Year 5015 Cargo, `C:\Users\wvern\Documents\TopographyTestAV*.toe`; AI work (Monolith, Dredge, Synthetic Corals)
= outcome media only, maybe prompts under `D:\d drive backup\ai` or `E:\Creative`.
PDFs: python `fitz` (PyMuPDF) is installed for text and images.

## The shared shell (fixed for every Sheet)
The card-to-Sheet grow and close (`useSheetMotion`, `easeGrow`, the 20ms-capped flight clock), the Landing falling
away, the dots visible in the margins, no blur, the Sections' docked header while open, the Sections panel's edges,
no gaps between blocks, the close button, a credits block, all accessibility and `/work/<slug>` URL behaviour, the
harness hooks. Only the body inside varies per project.

## The bodies (what varies)
Each project gets its own layout, chosen by its own Karpathy loop. Will: "Type stage had the best, but having the
scroll type behind an asset got repetitive. So vary it, find other creative ways of showing work, use existing
inspiration across the internet. Impress me." So: no two projects share a body layout, and within one Sheet the
beats shouldn't all use the same device. Amplified Spaces keeps T (Will's favourite) but polishes it and varies its
beats. Look for inspiration on the web (Awwwards, Will's keepers' project pages, Lusion, Obys, Rejouice, Kenta
Toshikura, studios doing case studies for 3D/AV/AI/print work); never re-suggest Will's dropped sites. Smoothness and
performance are hard requirements (Avoid list: jank, heavy pages). Media lazy-loads; videos play only in view.

## Copy
WILL, 2026-10-07 (overrides anything below and any earlier build): minimal and brutalist. Only the interesting
stuff worth showing, never a full write-up. Cut every beat that isn't interesting; let the work carry the page.
Run every string through the `no-ai-slop` skill (invoke it with the Skill tool) before you finish. Judges: long or
padded copy, or AI tells, cost points on c10 and c14.
Short and plain, in Will's voice from his process books, 1–3 lines per beat, facts only from the sources, every
string marked PLACEHOLDER (`"_status": "PLACEHOLDER copy, not approved by Will"`). Tom Vernon may be called Will's
brother. Collaborators are credited as the sources credit them. Work with no write-up: the Sheet opens to the
outcome (outcome media, title, year, tools), still in a layout of its own.

## Teasers
If the sources hold a better teaser (video or image) than the strip's current one, change it in `content/strip.json`
(posters go in `public/img/posters/`; a new teaser video that isn't on R2 yet points at `/proto-media/...` and goes
on the upload list). Record old → new and why.

## Scoring
The matrix per project is the base matrix (criteria 1–14) plus 15: phones at 375×812, no horizontal scroll, text
readable, open and close work (0–2). /30. Machine criteria come from the harness (headless Chrome via playwright-core
at `/Users/williamvernon/code/site-intelligence-tool/app/node_modules/playwright-core`, Chrome at
`/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`, 1440×900 dark; the in-app browser pane reports hidden
and won't animate). By-eye criteria (9 reads as this site, 14 tells the story / creative, 15's readability) are judged
by a separate reviewer that didn't build, pairwise in both orders. A round's variants stop when the best reaches 30/30
or a round improves the best by less than 1 point (plateau). Record every round in the project's matrix.md and its
results log.

## Git
Commit after each round and after each project (`git add -A`; message names the project and round; end with
`Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`), then `git push`. The repo is public: never commit
files from the PC (they stay in gitignored `public/proto-media/`), never commit credentials.
