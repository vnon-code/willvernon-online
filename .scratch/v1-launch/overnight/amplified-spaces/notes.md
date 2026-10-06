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
