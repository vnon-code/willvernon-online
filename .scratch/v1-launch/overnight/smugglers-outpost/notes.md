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

## Round 2 (2026-10-06)
- Teaser kept again (old = new): the 10s film is still the strongest piece; the viewport build lives in the Sheet
  (SD's bento plays viewport-build.mp4 in view; SA2 and SE rebuild the shot from the clean solid/wireframe stills).
- New media (read-only copies from the PC, gitignored, listed in UPLOAD.md): clean renders, clean concept, cropped
  process-book images (pb/cNNN, auto-cropped by pixel density; c058, c063, c067 cropped by hand), feature crops x-*.
- Story data for r2 in `story.ts` (`SO2`, `SO_PLACE`, `SO_TRIES`); SA's own data untouched.
- Performance finding (applies to every Sheet with scroll timelines): `view-timeline`/`animation-timeline` attached
  during the grow or fold cost ~80 slow frames and ~950ms opens in headless Chrome. Gating the animation longhands on
  `html[data-sheet='open']` brings it to 1 frame. Use longhands, not the `animation` shorthand: the shorthand resets
  `animation-range` (it broke SE's stage and SA2's step labels until the range rules out-ranked it).
  Container-query units (`cqw`) on the pinned reel added ~250ms to the open; replaced.
- SD problems: struck through only where the sources record what fixed it; HDRIs and slow renders / messy scene
  are marked Open (no fix in the sources).
- Pins on clean-1 match render-1's framing (same shot); one pin added (Sky, for the HDRI problem).

## Only Will can decide (r2 additions)
- Shared shell: on phones the floating ✕ covers body copy as it scrolls past. Bodies here pad their text columns
  (52px right) as a stopgap; a shell-level top-right safe area would fix it for every Sheet.
- SD's crop pairs (which part of the concept and render stands for each prompt phrase) are placed by eye.

## Round 3 (2026-10-07)
- Teaser kept (old = new, R2 `VIDSmugglersOutpost_1.mp4`): still the strongest piece; the viewport build lives in the Sheets.
- New media (gitignored, in UPLOAD.md): `vp-solid/vp-wire.webp` (clean passes cropped to the subject), `vp-render.webp`
  (frame 4.5s of viewport-build.mp4, same camera and crop, so solid > wireframe > render lands in one frame),
  `x-dust.webp` (dust render cut from p.100; Blender's 3D-cursor dot filled in, it is viewport UI, not the render).
- SA3 can't shorten the hero: the shell owns it. The wipe is a 21:9 band so it shows sooner.
- SE2's quote phrases scroll the Sheet to the stage's slot on the pinned run (computed from the view-timeline range).
- Copy run through no-ai-slop; all PLACEHOLDER.
- Seen in devserver.log, not from these variants: amplified-spaces T2b throws "reading 'title'" in SheetShell during SSR.
