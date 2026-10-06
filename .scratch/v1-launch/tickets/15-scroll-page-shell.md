---
title: Scroll page shell
labels: [wayfinder:prototype]
status: closed
assignee: claude (Will)
blocked_by: []
---

## Question

Build the one-page structure from [Site navigation](05-site-navigation.md), with placeholder Sections:
- The Landing with its scroll locked to project stepping.
- The Index drawer at bottom centre ("Explore" collapsed, the Section list open). The transition scrolls down while the drawer morphs into the content panel.
- The content panel: solid background, dot field visible in the margins, Visual and Sound drawers still usable.
- Scroll back past the first Section snaps to the Landing and re-locks; the monogram returns home from anywhere.
- Routing: `/<section>` scrolls to it and the URL follows the scroll; `/work/<slug>` opens the Sheet; deep links go through the Gate first; every path is prerendered.

Work it as a loop with Will (the "Karpathy loop" from rounds 7–8): build several variants in Nuxt, on the real page with real content, show them all, Will picks or mutates, repeat. If one session is not enough, close with what is locked and open a follow-up ticket for the next part. The drawer-to-panel morph is the part to iterate on most.

## Progress (2026-10-05)

**Round 1, morph variants (A ride / B grow / C sheet):** Will picked none. Primary source: local branch `prototype/scroll-shell-morph-abc` (546a0a0).

**Grilled and locked (Will, 2026-10-05):**
- No menu. A **Learn More** button at the bottom centre of the Landing scrolls straight to the first Section. It leaves with the Landing. (GLOSSARY: Learn More button replaces Index drawer.)
- The whole Landing scrolls up 1:1. The dots and their colour carry on in the margins of a solid panel and scroll with the page.
- The header (monogram, burger, mute) stays and snaps on a background (~200ms fade) once the Landing has left.
- The burger links go to the Sections: About me, Music, AI, Contact (for now).
- The Landing's wheel stays locked to project stepping. Pulling the first Section down about 50px snaps home and re-locks; the monogram does the same.

**Built on `v3` (uncommitted):** `useScrollPage.ts`, `TheSections.vue`, Learn More in `app.vue`, the header links and background, the dot-field scroll offset (`uOff`), and prerender routes for every path.

**Round 2 (header background):** Will picked C, solid with a lit bottom edge, and mutated it. Past the Landing the monogram drops its circle and the burger becomes inline text links (phones keep the burger: Claude's call, since four links don't fit at 375px). The mute button is unchanged. The Landing monogram is bigger in its circle (5px inset, a placeholder value). The prototype switcher is removed.

**Surfaced, not decided:**
- Sections render only after the Gate (client side), so the prerendered `/music` etc. hold no Section text. This matters for SEO and per-path metadata.
- The experiment card's slug is `04` (`/work/04`).

## Resolution (Will, 2026-10-05)

The shell is built on `v3` as locked above and verified in the dev browser: the Gate goes first on deep links, Learn More goes to About me, the burger and inline links scroll to Sections, the URL follows the scroll, `/work/<slug>` follows the Sheet, pulling down about 50px snaps home and re-locks, the monogram goes home, and `pnpm generate` prerenders all 15 paths. ADR-0002 still holds; two of its details changed: there is no Index drawer, and the Landing scrolls instead of sitting fixed under the panel.

## Round 3, transition polish (Will, 2026-10-06)

- **No glass:** drawers, tabs, buttons and plates are filled solid with the `--fill` token (black lifted 6%; a placeholder). The HUD drawers are pure black, since the lift read grey over their large area.
- **Return:** scrolling up is free all the way to the top; there's no snap any more. The Landing re-locks on arrival, and 350ms later the strip takes the wheel again and Learn More rises back in (420ms on the drawer curve).
- **Feel:** Will picked C, "smooth + depth", over A (native) and B (smooth). Lenis glides the wheel (lerp 0.085), and the Landing scrolls at 0.6× behind the rising panel at full opacity. It's clipped at the panel's top edge (`--cut`), so no strip shows beside the panel. Verified at 0px overlap frame by frame, in both directions.

## Round 4, header and plate (Will, 2026-10-06)

- **Header in:** fades in with the scroll over the last 120px before the panel docks (`--dock`, smoothstep), while the monogram's circle fades out. Tested against a slide-down: the slide dragged a hard edge through the monogram and strip, so Claude picked the fade. Then the burger fades out where it stands and the links slide into its place (transforms only).
- **Header out:** holds solid the whole way back up. At the top it fades out over 400ms, the circle returns, and Learn More rises 350ms later. Lenis's last 2px finish instantly, saving ~220ms of lingering.
- **About me plate:** 12px top corners (placeholder) that square off with `--dock`; they reach 0px exactly as the panel docks.
- **Learn More:** dark (`--c-bg`).
- **Depth layers:** the side cards sink at 0.35×, the centre card at 0.6×, the info row at 0.7× and the chips at 0.75× (placeholders, `--plx-*` in `TheProjectStrip.vue`).

## Rounds 5–7, scored (Will, 2026-10-06)

Scored against a written matrix with frame-sampled Playwright harnesses: `.scratch/v1-launch/scroll-back-matrix.md`, `scroll-back-harness.js`, `round6-harness.js`, `round7-harness.js`. The "lock broken" report was a stale `?variant=C` URL; the lock holds on every path.

- **Scroll back: D, "part + recede" (16/16).** The stage clip is gone. Instead the side cards part outward (`--plx-out` 0.7), and the Landing shrinks up to 8% as it falls behind (`--land`). Heading up through the last 120px, the page glides home in 0.45s, replacing Lenis's ~630ms crawl, so it reaches home 1.47s → 0.98s after a flick.
- **Header on Learn More: H3, "long fade, early swap" (11/12, tied with H2).** The header docks as the panel enters the last 240px, so the links swap in early. The background follows the scroll (`--hdr`, held at 1 until home) and is done ~250ms before the scroll lands. This fixes the burger sitting over CONTACT mid-swap.
- **Plates back home: P5, "Deal" (15/16).** Off the Landing, the plates tuck behind the centre card. Back home they slide out from its edges, and the tag and tools fan out from behind the name. Done 618ms after home, with no fade. Will asked for more options after P3 (a clip-path unfold) read as "just a mask".
- **Sound (Will: "add sound effects to all the stuff we worked on"):** all PLACEHOLDER, not yet heard by Will.
  - New: `deal` (three ticks as the plates land) and `section` (a tick per Section passing under the header).
  - Reused cues: the monogram clicks like the menu; header links click like a chip; hover ticks on Learn More, the monogram and the AI cards.
- **Whooshes cut, ticks in (Will, 2026-10-06):** the whooshes "sound out of place"; `depart` is now 4 falling ticks (0/60/140/260ms) and `arrive` 3 rising ticks (0/70/170ms), "more tactile". PLACEHOLDER.
