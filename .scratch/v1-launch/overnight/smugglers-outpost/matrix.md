# Smuggler's Outpost: Sheet matrix (criteria 1–15, /30)

Machine /23 from `tools/score.cjs`; 9, 14 and 15's readability (/7) are judged by the reviewer, not here.

## Round 1 (2026-10-06)

| Variant | Layout | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 11 | 12 | 13 | 15m | Machine /23 | Judged /7 | Total |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| SA | Concept to canyon | 2 | 2 (93%) | 2 | 2 | 2 (0.65) | 2 | 2 (615/421) | 2 (1–2) | 2 | 2 | 2 | 1 | 22 | 6 | 28 |
| SB | Process book | 2 | 2 (92%) | 2 | 2 | 2 (0.66) | 2 | 2 (639/426) | 2 (2) | 2 | 2 | 2 | 1 | 23 | 5 | 28 |
| SC | Scene breakdown | 2 | 2 (93%) | 2 | 2 | 2 (0.66) | 2 | 2 (629/425) | 2 (1–2) | 2 | 2 | 2 | 1 (1px) | 23 | 4 | 27 |

Results log: stills and JSON in `stills/r1/` (first runs; SB's fix tries) and `stills/r1b/` (final run of each).
SB runs: 20 (video band, 55 frames) → 20 (no fan shadows, 49) → 23 with a still (diagnosis) → 22 (crossfade, 3 frames)
→ 23 / 21 (crossfade paused until open; open 699 / 709ms) → 23 (r1b: 639ms, 2 frames). SA and SC: 22 → 23 (r1b).

Machine totals above are the scorer's final read after each variant's own fixes; SA's was 22 on its last run (c10 off-token monospace, slowFrames=3).

### Results log

| Variant | Try | Score | Kept | Why |
|---|---|---|---|---|
| SA | 1 | 28 | kept, default | most varied beats; pins on render-1 standout; loses c10 (monospace only in SA.vue) and 3 slow frames |
| SB | 1 | 28 | kept | process-book idea fits; white pages break the dark site; build runs page, caption, page, caption |
| SC | 1 | 27 | kept | strong stats, sticky step and shot list; log and build repeat the same text-left, white-page-right device |

### Judges' notes

**Judge 1 (SA > SB > SC):** SA has the most varied beats; process pages stay small so the page keeps the dark look. Loses a c10 point: monospace appears only in the three sheet components, not the site CSS, plus slowFrames=3. SB: large white pages fill the width in the build beat and break the dark site; image-text rhythm Will rejected. SC: stat block, sticky step name and shot list are strong, but the AI log and build are back-to-back white pages beside text; heaviest monospace; phone build is image, caption, image, caption.

**Judge 2 (SA > SB > SC):** SA reads most like the site; numbered pins over render-1 are the standout; c10 loses a point for off-token system monospace (SA.vue:353,417,660; tokens.css only has --font-ui Host Grotesk). SB: fits the source, devices vary, but the build slides into image-text-image-text and white scans take over d2; same off-token mono; facts check out (p.53, p.58, p.60). SC: opening and shot list look right; command-line log adds a look the site lacks and uses the most mono; two middle beats are the same layout twice; stats match sources.

### Next-round changes for SA (not built; round 2 to decide)

1. c10: replace the system monospace in SA.vue (353, 417, 660) with Host Grotesk, tabular-nums and wider tracking; or label it PLACEHOLDER.
2. c14: make the concept/render diptych a keyboard-operable drag or scroll wipe.
3. Frame budget (slowFrames=3): word-by-word prompt lighting animates only transform/opacity; decoding=async and width/height on filmstrip and pinned render; viewport video starts only in view.
4. Use the clean Dune*.png renders and concept image, not the poster copies with the burned-in title (hero strip, 2x2 grid, phone pin image).
5. Link pins and legend (hover/focus lights the row in red, and back); on phone, legend directly under the render or tap-to-reveal.
6. Filmstrip: crop scans to the image inside the page or give a dark frame; keep page number as caption.
7. Problems table: hang each problem off its pin, or keep compact. Outcome viewport video as scroll-scrubbed solid, wireframe, render.
8. Shell (not this body): fixed close X covers body copy on phone at 375px; add top-right safe padding.
