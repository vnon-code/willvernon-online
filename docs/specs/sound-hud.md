# Sound HUD — spec

Signed off by Will, 2026-10-03. Terms as in `GLOSSARY.md`. Visual reference (throwaway; rebuild, don't promote): `prototype/sound-hud.html?v=A`. Interaction reference: the dkton.at Leistungen faders (`references/REFERENCES.md`).

## What it is
A floating panel at the bottom of the Landing that mixes the opening track live: one fader band per stem, a DREAM band, a volume band, and the track card underneath. Only Silver Linings (vnon Bootleg) for now; no track switching until more tracks have stems.

## Look (layout A · Console)
- Centred on the bottom edge, 16px up. Background at 72% of the page colour with a 14px backdrop blur, 1px border at 18% of the type colour, 8px padding.
- **Top row:** five stem bands (Drums, Bass, Melody, Atmos, Vocals, names from `content/stems.json`), a 1px divider, then **DREAM** and **VOL**. Bands are 52×128px with 4px gaps, 1px border.
- **Band face:** label top-left, value bottom-left, 10px Host Grotesk 500, uppercase, 0.06em tracking. The fill rises from the bottom to the level in the type colour, and the text inverts over it (dkton). Value reads 0–100, or "off" at 0. A stem at 0 shows its label greyed.
- **DREAM** fills in Race red with off-white text. It's the only red in the HUD apart from the meters.
- **Live meter:** a 2px Race red line on each stem band's left edge, rising with the stem's live level (fast rise, ~0.9/frame decay). Not on DREAM or VOL.
- **Track card** under a 1px rule: 40px square artwork, title (12px/500) and description (11px, 55% grey) from `content/tracks.json`, each one line with an ellipsis. The card's right end stays empty: it's reserved for prev/next once track switching exists. No mute button: VOL at 0 is mute. The card never widens the panel.
- **Phones (≤640px):** the panel spans the width with 16px margins and the bands share it equally.
- Follows the OS theme like the Gate.

## Faders
- **Drag** up or down anywhere on a band; the full band height = 0–100%. A drag starts after 3px of movement.
- **Click** (no drag) toggles the band off, and on again to its last level.
- **Keyboard:** each band is a slider. Up/Right +5%, Down/Left −5%, PageUp/PageDown ±20%, Home = off, End = 100%, Enter/Space toggles. Screen readers hear the value ("80%", "off", or the bass cutoff).
- Level changes glide over ~40ms so nothing clicks.

## What each band does
- **Drums, Melody, Atmos, Vocals:** volume, level² (so the middle of the travel sounds like the middle). Drums start off; Melody, Atmos and Vocals at 80%.
- **Bass:** a low-pass filter cutoff, exponential from 30 Hz (0%) to 8 kHz (100%); the readout shows Hz ("2.6k", "87"). At 0 the stem is cut completely. Starts at 100 Hz (~22% of the travel), so only the sub comes through.
- **DREAM** (starts at 0, so the background opens on its dream-off look; Will, 2026-10-04): low-pass on the whole mix from 20 kHz down to 700 Hz, reverb (3.2s generated tail) up to 70% wet, a 0.42s feedback delay up to 32% wet, dry down to 65%, and every stem slowed to 92% (the same rate on all stems keeps them in sync). It also drives the Landing background (`docs/specs/landing-background.md`).
- **VOL**: master volume, level². It is also the mute: 0 = silent, and a click toggles off/on like any band.

## UI sounds
Quiet synthesised blips (no audio files), on their own output so DREAM doesn't affect them, and silent while muted:
- grab on press, release on let go;
- a tick every 10% of travel, stronger at 0, 50% and 100%.

## States
- **Entered with sound:** the Gate click unlocks the audio. VOL stays at 0 through the HUD entrance, then rises to 80% over 3s (ease-in-out; the fader and the music move together). Touching VOL stops the rise. (Will, 2026-10-03; the 3s is a placeholder.)
- **Entered without sound:** the stems are loaded but silent; VOL starts at off. Clicking VOL (back to 80%) or dragging it up starts the music instantly.
- Fader positions can be changed while muted and apply when sound comes on.

## Not in this piece
- Track switching (prev/next): waits for more tracks with stems.
- Connecting DREAM to the background: built with the background (`docs/specs/landing-background.md`). The meters stay HUD-only; audio reactivity was dropped (2026-10-03).

## Entrance: "Build" (Will's pick, revised 2026-10-03)
Reference: `prototype/hud-entrance.html?o=2`. Starts once the Landing has faded up (1s after the Gate). All on cubic-bezier(0.16, 1, 0.3, 1) unless noted.
- 0ms: the glass panel fades in, 500ms ease-out.
- 150ms: each band grows up from its bottom edge (a clip from the bottom), 600ms, 60ms apart left to right. The divider fades in at 300ms.
- 450ms: each band's fill rises from 0 to its level, 800ms, 60ms apart.
- 700ms: the track card fades in and rises 10px, 600ms.
- Reduced motion: the whole panel fades in over 300ms with the bands already at their levels. No UI sounds during the entrance.
