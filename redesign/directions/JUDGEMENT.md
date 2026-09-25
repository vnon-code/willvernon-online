# Judgement: direction panel

Judged against `redesign/REFERENCES.md` §1 (Awwwards bar) and §3 (anti-patterns), plus the content JSON and INVENTORY.md.
Every type clamp was resolved at 390 and 1440, and every colour token was recomputed with the WCAG relative-luminance formula (python).

## Scores (1–10; weighted 40/30/20/10)

| Direction | Design | Usability | Creativity | Content | **Weighted** |
|---|---|---|---|---|---|
| A: Signal Console | 8.0 | 8.0 | 8.0 | 8.5 | **8.05** |
| B: Editorial Brutalist Grid | 7.0 | 8.0 | 6.0 | 7.0 | **7.10** |
| C: Waveform Studio | 7.5 | 6.5 | 9.0 | 6.5 | **7.40** |

## Gates

| Gate | A | B | C |
|---|---|---|---|
| Personality fit (HUD/technical kept) | PASS (strongest: live scope, readouts wired to state) | WEAK PASS (HUD cut back to captions) | PASS |
| Content parity feasible | PASS* | PASS* (/work hub turned into the project index; stems implied for every track) | PASS* (stems claimed for all 5 tracks) |
| a11y (contrast, cursor, reduced motion) | PASS after judge fixes | PASS (1:1 cursor), one wrong ratio | PASS on contrast; cursor lags; body text 15px at 390 |
| WebGL perf cost | PASS (~14KB OGL, after LCP, 30fps and 3 traces on mobile) | RISK (a new GL context and shader compile on every hover; nothing on touch) | RISK (decodes a multi-MB stem before init; off below 768) |
| GSAP-only (no Motion) | PASS | PASS | PASS (plus native View Transitions, 0KB) |
| Build cost within ~$150 | PASS (low–medium) | PASS (medium) | FAIL/RISK (self-declared highest cost: decode pipeline, watchdog, sitewide transport) |

\*None of the three specifies `/about` (Education, Experience, Design Skills, Design Personality) or the AI page's
"Ethos: Artificial Acceptance" section, and none handles `TRACKS_DATABASE[].colors`: 5 tracks × 3 HSL colours, including blue (hue 220).
These are inventory items. Whichever direction wins must place them.

## Contrast verification (judge's own calc)

| Token | Claimed | Computed | Verdict |
|---|---|---|---|
| A `--text-muted` #7D838A / #050505 | 5.32 | 5.32 (4.75 on `--surface-2`) | OK |
| A `--accent` #FF3B30 / #050505 | 5.75 | 5.75 | OK |
| B `--accent` #FF3B30 / #0A0A0A | 5.58 | 5.58 (4.80 on `--surface-2`) | OK |
| B `--surface-2` #1C1C1C vs `--surface` | 1.36 | **1.08** | WRONG (structural only, no a11y impact) |
| C `--text-muted` #9A9A97 / #050505 | 7.2 | 7.22 | OK |
| C `--accent` #FF4433 / #050505 | 5.95 | 5.95 | OK |
| Baseline #D91C1C / #6B7280 on #000 | 4.12 / 4.33 | 4.12 / 4.33 | audit confirmed |

## Weakest claim per direction (adversarial)

- **A:** "Every colour clears 4.5:1" is true but beside the point. Its palette adds **neon green #39FF88 and neon cyan #5CE1E6**,
  which is the banned "neon-cyan" trope and breaks item 4 (red has one job). It also claimed to clear item 1 while shipping **3 font
  families** (Big Shoulders, Archivo and JetBrains Mono). Also: a 0.5s-lag cursor ring (banned: "lag behind it"), a "kicker" above the AI H2
  (eyebrow ban), three.js put at "35–45KB gzip" (it is well over 100KB), and a "Flip into the case study" that cannot cross an Astro MPA
  hard navigation.
- **B:** The type maths is wrong. `clamp(3.5rem, 2rem + 9vw, 11.25rem)` resolves to **161.6px at 1440, not 180**, so display/body
  is **8.98×. That fails item 1 (≥10×).** At 390 it gives 67px, not 72. H1 is 90px, not 96. "2 families in play" is false:
  Archivo, Inter and JetBrains Mono make three. The WebGL moment is the most generic trope in the brief (a cursor displacement
  hover) and is not "authored for this person" (item 11). Desktop nav shows only Work/Music/About, so Projects, AI and Experiments stay one
  level down, which is today's audit problem again.
- **C:** "Each of the 5 tracks expands into the 5-channel stem mixer." **Stems exist only for Silver Linings**
  (`STEMS_CONFIG`, 5 MP3s), so this cannot be built. The hero is an additive-sprite **point cloud**, one step from the banned
  "stock particle field", and it decodes a real multi-MB stem buffer before init. Positions must be pre-baked. Process steps on a
  **horizontal scrub timeline** fight the text-heavy `PROJECTS_DATA[].process` copy and pinning on mobile. Amber is sold as
  "not a new hue". Body text is 15px at 390, and the cursor lerps at 0.15, which is the lag anti-pattern.

## Recommendation: **A, Signal Console** (with the fixes applied)

A has the strongest usability and the most honest HUD, where every readout is tied to real state. Its WebGL module is small and authored:
the scope traces run on noise at idle and on `AnalyserNode` data in audio mode, one module in two modes. It scopes the stem mixer correctly
to the featured bootleg, and it has the lowest build cost. Its failures were token-level, not structural, so they are fixed in its file:

**Fixes applied in `A-signal-console.md` (each tagged *[Judge fix]*):**
1. The type moved to 2 families. Archivo variable at `wdth` 62–75, weight 800/900, is the display face, which replaces Big Shoulders. JetBrains Mono stays as the mono.
2. The 390 ratio was corrected from 4.68× to **4.62×**, because the body clamp resolves to 16.2px there. The desktop ratio sits at exactly 10.0×, so the maxes are frozen.
3. `--signal-green` and `--signal-cyan` were removed. Channels are now told apart by trace value and line style, and amber is capped to the same 5% budget.
4. The three.js size claim was corrected (from 35–45KB to well over 100KB gzip). The OGL choice stands.
5. The cursor now tracks 1:1 instead of lagging 0.5s, and the AI-section kicker became a data readout instead of an eyebrow label.

## Grafts from the runners-up

1. **(C) Native View Transitions for index → case study.** Put `view-transition-name` on the row title and thumbnail, because Astro MPA
   pages cannot share a Flip across a hard navigation. Keep Flip for in-page moves only: filter reflow, lightbox, and the mobile
   row expand.
2. **(C) BPM-locked telemetry.** When a track is armed, the HUD tick and ScrambleText glyph interval lock to `60000 / bpm`. The corner
   readout gains transport time, BPM and key, and the footer status dot reads `vnon // online · 174 BPM`, which makes the HUD musical.
3. **(B) The case-study right-rail detail panel per process step.** This fills the Julienne gap in REFERENCES. It pairs with A's
   scrubbed calibration ruler, and the steps stay **vertical** (C's horizontal timeline is rejected).
4. **(B) ScrambleText on mono metadata only**, never headings or body. The hero H1 is SSR text with a SplitText reveal only, so the LCP
   element never scrambles. B's discipline chips (Generative/3D/AI/Audio) and INDEX/INFORMATION toggle go on `/work`.
5. **(C) Pre-baked data from the real vnon stems.** A's idle scope traces are seeded from a pre-computed amplitude envelope of the Silver
   Linings stems (a JSON of about 4KB, made at build time), not simplex noise. The "authored for this person" credit comes with no
   runtime decode.

**The winner still owes:** an `/about` spec, the AI "Ethos" section, and a decision on the per-track HSL palettes. Keep them as data driving the
2D audio canvases only, clamped to the red/amber range, or document them as retired data.
