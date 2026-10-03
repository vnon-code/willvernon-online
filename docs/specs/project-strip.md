# Project strip — spec

Signed off by Will, 2026-10-03 (placeholders as listed). Terms as in `GLOSSARY.md`. Visual reference (throwaway; rebuild, don't promote): `prototype/project-strip.html?v=insidebig&auto=step&sides=mono`. Numbers below are the prototype's, measured at 1280×800.

## What it is
The Landing's way to show the work: an endless ring of project cards seen from inside, centred on screen with the filter chips above and a caption below. The centred card is large, in colour and plays its teaser; the rest are black and white. Vertical scroll turns the ring; left alone, it steps to the next project every 10s. Music is not in the strip (it lives in the Sound HUD).

## Projects
- 11 cards, picked by Will (2026-10-03). Order is "strongest first, mixed" (approved by Will, 2026-10-03):
  1. Smuggler's Outpost · 2. Monolith Survival · 3. Amplified Spaces · 4. Topography AV Test · 5. The World Plays Here · 6. DREDGE · 7. Remnants · 8. Handheld Stories · 9. Synthetic Corals · 10. Marimekko Exhibition · 11. Powersurge
- The list and order live in a new `content/strip.json` (slug, chip, poster, teaser), pointing into the existing `content/*.json`. No copy is retyped.
- **Chips:** All (11) / Project (7: the case studies) / Experiment (4: DREDGE, Monolith Survival, Synthetic Corals, Topography AV Test).
- **Media per card:** a poster still (`public/img/posters/`), plus a teaser video on R2. Powersurge has no video: its GIF plays instead. Synthetic Corals has no video: poster only.

## Look
- **Stack:** chips, strip, caption, centred together on screen.
- **Card:** 16:9, width = the smaller of 32% of the viewport width and 71% of its height (40% × 16/9). 2px corners. Image/video cover-fills the card.
- **Ring (Inside):** the camera stands inside a ring of radius 55% of the viewport width. Cards sit one card-width apart along it (1.04 × width), turn to face the centre, and the sides curve towards the viewer. Perspective 1600px. Cards fade out between 1.0 and 1.35 radians from the centre, so about 3 cards show at once on desktop.
- **Big centre:** the centred card grows to 1.6× and its neighbours move out by 30% of a card width, so nothing overlaps. Size and push ease in and out as a card passes the centre (ease-in-out).
- **Side cards are mono:** black and white at full brightness, contrast +10%. Colour eases back in over the last card-width before the centre. No darkening.
- **Stacking:** cards are positioned in 2D from a hand-made perspective projection and stacked by depth. No CSS `preserve-3d` (it re-sorted the card planes itself and made cards pop forward).
- **Caption:** counter `03 / 11` (current number in Race red, tabular figures, 12px/500), title (Host Grotesk 600, 22–34px fluid, −0.02em), discipline below it (Design / AI / Experiment, 12px/500 uppercase, 50% grey). Title and discipline roll up into place on change (550ms, cubic-bezier(0.16, 1, 0.3, 1)).
- **Chips:** 12px/500 uppercase pills with a small count; the active one is filled with the type colour.
- **Short screens: Fit** (Claude's pick, Will delegated, 2026-10-03): the stack centres in the space above the Sound HUD and keeps 24px clear above the chips and below the caption. When the 1.6× centre card wouldn't fit, cards shrink with the height; the strip area is at most 2× card height.
- **Phones (under 640px wide): Peek** (Claude's pick, Will delegated, 2026-10-03): card 72% of the width, no centre growth or push, a flatter ring (radius 1.6× the width), so a ~28px sliver of each neighbour shows at the edges (fade 0.55–0.8 rad).
- Follows the OS theme like the Gate.

## Motion and input
- **Scroll** (wheel or trackpad, vertical or horizontal) turns the ring: 1 card per ~360px of wheel travel. 140ms after the last wheel event it snaps to the nearest card.
- **Drag** (mouse or touch, either axis): 1 card per 28% of the viewport width; snaps on release.
- **Keys:** →/↓ next, ←/↑ previous.
- **Click a side card:** turn the ring to it the short way round. **Click the centre card:** PLACEHOLDER, does nothing until project pages exist.
- Smoothing: the ring eases towards the target each frame (8.5% per frame at 60fps). It's endless: after the last card comes the first.
- **Auto: Step** (Will). After 10s on a card, glide to the next. Auto restarts 3s after the last scroll, drag, key or click, and pauses while the pointer is on the centre card.
- **Teaser:** starts 250ms after a card becomes the centre (muted, looping, inline) and fades in over 600ms once it's playing; stops when the card leaves. Only one video plays at a time.
- **Filter change: Sweep** (Claude's pick, Will delegated, 2026-10-03): the old set fades out over 220ms while turning on 0.6 of a card, the ring rebuilds, and the new set fades in over 380ms while spinning in from 2.2 cards to the right, settling on its first card. The caption shows the new first card straight away (it doesn't count through the cards passing by). Reduced motion: a cut.

## Accessibility
- The strip is a labelled region; the caption is a live region so screen readers hear the new project.
- Cards are buttons named by project title; arrow keys work as above once the strip has focus.
- Reduced motion: no auto-step, no smoothing (the ring jumps to the card), teasers don't autoplay (poster only).

## Performance
- Only the centre card loads its video; posters load up front. Videos are created on first use and paused, not destroyed, when they leave.
- The ring animates `transform`, `opacity` and `filter` only. The frame loop runs only while the ring is moving, auto is counting down or a drag is active.

## Open (not blocking the build)
- **Teaser files:** the prototype plays the full outcome/trailer videos from R2, some of them large. Shorter teaser cuts per project would load faster; until then the existing R2 files are used as they are.
- **Entrance:** how the strip appears after the Gate. Not designed yet; PLACEHOLDER: fades up with the Landing.

## Not in this piece
- Project pages and what the centre-card click opens.
- Linking the centred project to the background palette: built with the background (`docs/specs/landing-background.md`). Colour only, not form.
