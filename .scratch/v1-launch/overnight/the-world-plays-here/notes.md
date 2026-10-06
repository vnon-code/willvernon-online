# The World Plays Here: notes (overnight run)

## Teaser
Kept: `https://assets.willvernon.online/projects/07_the-world-plays-here/assets/TheWorldPlaysHere2_1.mp4` (poster
`/img/posters/assets-theworldplayshere2-1.webp`) -> no change. `content/strip.json` untouched.
Why not the proposed `logo-wrap.mp4`: the card is 16:9 and the loop is square, with the sphere filling only about a
third of the frame, so on the card it would be a small globe on black; the current teaser is the finished film with the
slogan, which is the copy-led point of the brief. The card already loops it muted (the "plays once" note was wrong:
the strip sets `loop`). It is also already on R2. The loop goes into every body instead.

## Round 1 build (WA, WB, WC)
- Ids WA–WC, not A–C: those are shared body ids (TOOLS.md §1), as monolith MA–MC and 04 TA–TF.
- Shared facts in `app/components/sheets/the-world-plays-here/story.ts`, credits in `TwCredits.vue`; the loop plays
  through monolith's `useOpenPlay` (in view, 1.2 s after the Sheet settles), `preload="none"`, lazy images.
- The hero is the outcome film (teaser), so no body repeats it.
- New dev media: `poster-logo-wrap.webp` (the loop's 6 s frame: the green logo over the XBOX wordmark; the loop starts
  there with `#t=6`). Added to UPLOAD.md.
- Inspiration: WA, D&AD New Blood archive entries (e.g. dandad.org/work/new-blood-archive/every-screen-is-an-xbox), a
  copy deck, an OOH media plan. WB, brand-identity case pages (Pentagram, Koto, Collins) and a ballot paper. WC,
  Lusion's project pages (one object at the centre), orbit diagrams, VFX before/after sliders.
- Copy through `no-ai-slop` (detect): "I wanted the people: connection, inclusion, belonging" (colon reveal, abstract
  triad) -> "I wanted it about the people who play"; "A green line under PLAYS, not a green PLAY" (binary contrast) ->
  "The green moved to a line under PLAYS"; the YouTube fragments joined into one sentence; "A post in the feed" ->
  "A feed post, on a phone"; curly apostrophes straightened.
- Fixes after r1 stills: WA shelter tile cropped the slogan (now `contain` on black); WC fan's end card clipped at
  the frame edge (tilt ±9° -> ±6°, narrower cards) and the loop's globe was small in the orbit (scaled 1.45 inside
  its circle).

## For Will
- Year: the book gives none; 2025 is inferred (it mentions the 2025 grad show). Confirm.
- Credits say solo work and "Brief: D&AD, for Xbox"; no collaborators in the sources.
- The colour swatches in WB are named (Space, Xbox green, White), not quoted from the book; the hexes are placeholders.
- Grade slider (WC) pairs bp9 (bright green) with bp10 (toned); the two captures aren't framed identically.
