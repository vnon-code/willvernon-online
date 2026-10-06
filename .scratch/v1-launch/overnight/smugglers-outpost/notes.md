# Smuggler's Outpost: notes (overnight run)

## Teaser (r1, 2026-10-06)
Kept: `content/strip.json` unchanged (old = new = R2 `VIDSmugglersOutpost_1.mp4`, poster `assets-vidsmugglersoutpost-1.webp`).
Why: the 10s film with sound is the only outcome video and the strongest piece; the viewport build (solid to wireframe
to render) is a process beat, so it lives inside the Sheet instead (SA outcome, SB build chapter, SC passes).

## Build decisions (r1)
- Variant ids SA, SB, SC, not A, B, C: TOOLS.md §1 forbids shared ids (A–C are shared bodies).
- Shared data in `app/components/sheets/smugglers-outpost/story.ts` and credits in `SoCredits.vue` (not variants).
- SB first tried the viewport video playing in its cinemascope band: 50–55 slow frames and a 650ms close in headless
  Chrome (a second video decoding during the flight). Replaced by a CSS crossfade of the solid / wireframe / render
  stills that runs only once the Sheet is open; the video moved down to the build chapter (plays only in view).
- SA's prompt words lost their spaces (Vue trims them): 682px phone overflow; fixed.
- Copy is PLACEHOLDER (story.ts `_status`). Facts only from story.md; the HDRI problem has no fix line (none in sources).
- Pins on render-1 (SA) are placed by eye.

## Only Will can decide
- Copy, the four render names, and whether "Frames 0001 to 0300" (from the render file name) belongs on the page.
- Credits for the ornithopter model, HDRIs and sounds (not named in what was read).
