# Amplified Spaces: overnight notes

## Round 1 build (T1–T3: T polished, its beats varied)
Files: `app/components/sheets/amplified-spaces/{T1,T2,T3}.vue`, shared lead block `AsLead.vue` (not a variant).
Copy added to `content/stories/amplified-spaces.json` (PLACEHOLDER, from the story notes): `brief`, `context`,
`problems`; the type gained the three optional fields (`app/types/project.ts`).

| Id | Layout | Machine /23 (r1, final runs) |
|---|---|---|
| T1 | rooms index strip → Develop film strip panned while pinned → Define in two lines of big type → one pinned stage (room + its visual inset) swapped by the tracks' words → problems as a counted list → outcome | 23 (slow frames 1) |
| T2 | visuals index strip → Discover: the question big beside Tom + album art → Develop contact sheet → Define: B17 pinned, wiping network → visual → room → track switcher tabs (video, visual/room slider, renders, facts) → problems grid → outcome | 23 (slow frames 1–2) |
| T3 | phases index strip → sticky double-diamond rail beside Discover (type list), Develop (swipe strip), Define (split halves), Deliver (room columns, one open), Problems → T's type stage once, for the B17 crit video, then the rooms fanned | 23 (one noisy run 21: open 821ms under load avg 14; rerun 23) |

Decisions:
- The first block under the hero is media (a 3–4 tile index strip), so the first view is ≥ 55% media (T read 0.47).
- The lead block fades in on its own 360ms delay (CSS) with the shell's `[data-build]` fade on an inner wrapper, so
  the body arrives once the hero has mostly landed (criterion 2: 87–93%, T read 53–55%) and still fades on close.
- Sticky stages use `top: -16px`, not `var(--header-h)`: the layer's padding (header + 16px) already insets the
  sticky rect, so `top: var(--header-h)` pins 80px too low and clips the stage's foot. **Shared `SheetT.vue` (and
  any round-2 body using `top: var(--header-h)`) has this bug**: T's facts foot sits ~80px below the fold. Not
  fixed there (baseline, outside this ticket).
- Swapping stages (T1, T2) use one `<video>` whose source swaps, played by their own IntersectionObserver
  (`usePlayInView` only sees videos present at mount).

## Teaser
Kept: `B17AV2_1.mp4` (the final crit video, poster `video-trailers-b17av2-1.webp`). The pulled media are stills
(renders, splashes, process-book pages); none beats the only outcome video as a moving teaser. old -> new: none.

## For Will
- Tom Vernon is credited as "Tom Vernon, house producer" (as before); not called your brother anywhere yet.
- Album-art mapping (p36-1 Onjuku, p36-2 Fading Away) is still a guess.
- Upload list: `public/proto-media/amplified-spaces/UPLOAD.md`.

## Round 2 build (2026-10-07): T4 (T1 refined), T5, T6 (challengers). Baseline T1 (29/30) unchanged.
Files: `app/components/sheets/amplified-spaces/{T4,T5,T6}.vue`, the slider part `AsCompare.vue` (not a variant).
All three use the shared SheetHead / SheetContents / SheetSectionNo (01–05: Discover, Develop, Define, Three rooms or
Deliver, Problems); info = Year 2024, Module GDES5006 Integrated Projects 2, Client, Role, Tools from the story credits.
Copy is per variant (a COPY const, `_status` PLACEHOLDER), run through no-ai-slop; the licence cap and the beat fix
appear once, in Problems.

| Id | Layout | Machine /23 (r2) |
|---|---|---|
| T4 | rooms strip (cropped to the lit room; phone: 3:4 tiles, label under) → Discover: Tom + the question → Develop: two-row film strip filling the pinned view, 2-line copy → Define: two lines of big type over the Blender hand-off → one pinned stage filling the view, Fading Away's turn swaps the inset video for the visual/room slider → counted problems → B17 crit video last | 23 (slow 2) |
| T5 | visuals strip crossfading to the room on hover → Discover: the question huge over Tom + album art → Develop: a deck of sticky cards that stack → Define: a signal matrix (In / Visual / Room per track) → Deliver: rooms in a native scroll-snap carousel, visual inset → counted problems → B17 crit video last | 23 (slow 2) |
| T6 | T2b + judge 2: contact sheet of 7 stills (networks out; the kick network sits with its problem), Deliver opens on room + inset visual with a Compare toggle, taller phone tiles with labels under, close = "Final crit" crossing once behind the pinned crit video | 23 (slow 2) |

Decisions: T4 picks Fading Away for the slider (its visual frame and room are both 16:9). T1's 230px void came from a
centred stage shorter than the view; T4's stage is a 3-row grid (count / room / name) filling the view. The single-row
film strip with cells at full height panned ~10px per scroll px, so it became two rows. T6 keeps T3's crossing type
although one rescore judge wanted it cut (split vote; Will decides).

## Teaser (round 2)
Kept `B17AV2_1.mp4`. old -> new: none. The pulled media are stills; the crit video is still the only moving outcome.
