# Landing background — spec

Signed off by Will, 2026-10-04. Terms as in `GLOSSARY.md`. Visual reference (throwaway; rebuild, don't promote): `prototype/backgrounds.html`. This replaces the image point cloud: Will tried it across four rounds, then chose a dot field whose colours alone come from the project.

## What it is
A full-screen grid of round dots behind the Landing that carries on from the Gate's dot grid. A slowly warping noise field sets each dot's size and colour. The centred project's teaser sets the **palette only**, never the shapes: no outline of the video ever shows through.

## Look
- **Grid:** 6px cells (× device pixel ratio, capped at 2), one round dot per cell, antialiased over 1px. Empty cells show the page colour `#0A0A0A`.
- **Dot size:** radius from 0.08 to 0.46 of the cell, following the field value.
- **Field:** 5-octave fbm, domain-warped once (`p + warp·q`), about the screen centre, so zoom scales from the middle. The value is mapped through `smoothstep(.35, .65)` (contrast 0.3).
- **Colour:** field value → 5-stop palette (below), saturation ×1.2.

## Palette from the teaser
- Source: the centred project's teaser video, or its still until the video plays (or when it has no teaser, e.g. Synthetic Corals and Powersurge). It crossfades over 1.2s when the strip moves.
- Every 150ms a 1/32-scale frame is read back and reduced to 5 stops:
  - four luminance quartiles, dark → light, each a saturation-weighted mean so a small strong colour (Monolith's red visor) isn't averaged into grey;
  - the most saturated 15% of pixels as the accent, at stop 4 of 5.
- **Auto-level:** the palette is scaled so its lightest stop sits at ~0.85 luminance (scale clamped to ×0.7–2.2). This replaces a brightness setting, which couldn't suit near-white Monolith and dark-grey DREDGE at once.
- **Palette ease:** stops glide to new values with a 0.35s time constant. This covers project changes and cuts inside a teaser.
- The teaser `<video>` needs `crossorigin="anonymous"`; R2 sends `Access-Control-Allow-Origin: *`. Don't reuse a no-CORS copy of the video already loaded by the strip.

## Values
| | Dream off | Dream full |
|---|---|---|
| Zoom (field features per screen height) | 3.9 | 0.85 |
| Warp | 2.15 | 3.35 |
| Speed (× base drift) | 2.35 | 0.55 |
| Palette ease (s) | 0.35 | 0.35 |
| Grid / smallest / largest | 6px / 0.08 / 0.46 | unchanged |

## DREAM
The HUD's DREAM band blends the values above from "off" to "full":
- the band position runs through `cubic-bezier(.65, 0, .35, 1)`: little change near either end, most of it mid-travel;
- zoom blends in log space, so each step zooms by the same ratio; the others blend linearly;
- the time step uses the blended speed, so the motion slows without jumping.

## Not in this piece
- Phones, the light theme and low-end GPU cost: not yet checked.
- What the background does between the Gate and the Landing (the Gate spec says "the point cloud fades up from black ~1s"; this field takes its place).
