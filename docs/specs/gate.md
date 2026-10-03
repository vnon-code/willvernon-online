# Gate — spec

Signed off by Will, 2026-10-03; revised twice the same day: first the entrance, name typeface and dot matrix; then the lockup, name-to-monogram intro, rotating word, button layout C and logo void. Terms as in `GLOSSARY.md`. Visual reference (throwaway; rebuild, don't promote): `prototype/gate-intro.html` at its default settings.

## What it is
The first screen of every visit, including repeat visits. The visitor picks **Enter with sound** or **Enter without sound**. The Landing then fades in behind it.

## Look
- Background: near-black #0A0A0A, type off-white #F2F2EF. Follows the OS theme: in light mode the background is off-white and the type near-black.
- Dot matrix: 2px dots on an 18px grid at 12% of the type colour.
- **Logo void (full bleed):** dots inside a monogram silhouette are not drawn. The silhouette is exactly the viewport height, so its top and bottom touch the browser edges, and it is centred on the mark. On portrait screens it is wider than the viewport and crops at the sides; only the top and bottom V notches show. (Whether to keep this or turn the void off on portrait is still open.)
- **Lockup**, centred on one line, with the monogram at the exact viewport centre:
  - Left: **WILL VERNON**, Host Grotesk 600, 13px, uppercase, 0.16em tracking.
  - Centre: the monogram as an SVG polygon, 96px tall (the hero; the name and word read as its captions). Fixed 22px gaps either side, which don't scale with the mark, so the three parts read as one lockup.
  - Right: the rotating word (below), in a slot as wide as the name, so both sides balance. The word is grey (65% of the type colour).
- **Choices (button layout C):** **Enter with sound** as a compact corner-bracket button 44px under the mark (its 11px label sets the width, ~164px, a little wider than the mark). Its label is 11px, and its clickable area is at least 44px tall (extended invisibly when the visible box is smaller); **Enter without sound** as a quiet 10px text link pinned to the bottom edge. No red. Until loading finishes, the primary button's slot is the loader (see Loading).

## Rotating word
- Words: **Portfolio, Designer, AI + Digital, Creative Tech** (in `content/gate.json`).
- Each word stays 3s, then changes with **Roll**: each letter rolls up out of its mask while the next word rolls up from below. 490ms per letter, 60ms stagger.
- Letter spacing stretches each word to the name's width, capped at 1.5–4px. Long words match exactly; short words fall a little short.
- Screen readers get the first word only (no live announcements).

## Mouse interaction (dot matrix)
Mouse only: off for touch/pen, on screens without hover, and with reduced motion. Nothing reacts until the dots have finished sliding in. Dots inside the logo void stay hidden. All effects fade out smoothly with distance from the cursor (falloff (1 − d/radius)²). The cursor position eases at 0.25 per frame, and the effect fades in or out over ~0.5s as the mouse enters or leaves the window.
- **Spotlight:** within 140px of the cursor, dots gain up to +80% opacity.
- **Lens:** dots grow up to 1.5× (2px → 3px) under the cursor.
- **Repel:** dots push up to 1px away from the cursor on a stiff spring (stiffness 0.4, damping 0.72 per frame), a subtle shimmer rather than visible movement.
- **Ripple (click only):** a click sends a ring outward at 550px/s, 30px wide, fading over 1s. The ring adds +45% opacity and +0.5px dot radius. Up to 6 rings at once.

## Entrance (about 4.2s)
1. 0–0.65s: black. No seed dot and no dots yet.
2. 0.65s: **WILL VERNON** rises large (clamp 34–72px) letter by letter, as real glyph outlines.
3. 1.9s: every letter except W and V squeezes shut.
4. 2.7s: W and V morph into the monogram (a true shape morph, not a fade).
   - 3.5s, once the morph is complete: the dot matrix arrives. The silhouette splits the dots into pieces, and each slides in from its own browser edge, all at once, over 2.4s on cubic-bezier(0.77, 0, 0.175, 1):
     - the left and right regions from the sides (each including the triangle that bites into the X);
     - the two top V notches from the top;
     - the bottom notch from the bottom.
   - The void is never cleared; it is the negative space the pieces leave. On portrait screens only the top V's and the bottom notch exist.
5. 3.55s: WILL VERNON unfolds to the left of the mark and the first word to the right.
6. 4.2s: the primary slot rises, as the finished button or as the loader (see Loading); the button takes focus once loading is done. The word starts rotating.

## Loading
- Real progress is tracked over: fonts, the first project's point-cloud image + depth map, and the stems for the opening track. Loading starts at once, under the entrance. Progress is never faked.
- **The loader lives in the primary button.** At 4.2s, if loading isn't finished, the primary button's slot appears in a loading state: same box and position as the finished button, with a small muted tabular-figure percentage ("42%") centred in it.
  - The outline is a 1px line in the type colour tracing the box's full perimeter, drawn clockwise from the top-left corner in proportion to progress. The drawn amount eases towards the real value, so it never jumps or goes backwards.
  - At 100%: the outline retracts to the four corner brackets; the % rolls up and out and **Enter with sound** rolls in (the word's Roll: 490ms, 60ms stagger). Then the button becomes interactive and takes focus, and **Enter without sound** fades up at the bottom edge.
  - If loading is already done by 4.2s (cached visit), the finished button shows straight away.
  - While loading, the slot is a progress bar for screen readers ("Loading", 0–100), not a button, and can't be focused. Nobody can choose before the site is loaded.

## Transition (after a choice)
1. The gate fades out (~0.6s).
2. The dot background (`docs/specs/landing-background.md`) fades up from black (~1s).
3. Sound path: the music fades in with step 2.

## No-sound path
- The stems are already loaded but don't play. The Sound HUD starts muted; one click unmutes instantly.
- Audio-reactive visuals run on a gentle synthetic pulse until sound is on.

## Defaults (not discussed; standard practice)
- Keyboard: the primary button gets focus when it appears; both choices work with Enter/Space.
- `prefers-reduced-motion`: no bloom, morph, roll or wave; the final lockup, void and choices cross-fade in over 0.2s; the word changes by cross-fade. The loader outline still tracks progress (with no easing); at 100% the brackets and label cross-fade in over 0.2s.
- The AudioContext is created or resumed inside the click handler (browser autoplay rules).
