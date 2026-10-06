# Dredge: finalized (overnight, 2026-10-06)

Winner: DA (Edit bay), 30/30, 1 round. Runners-up: DC Campaign 29.8, DB Descent 27.3.
Default in `app/components/sheets/dredge/meta.json` is DA. Checked: /work/dredge?sheet=DA opens at desktop and 375px, no console errors, no broken images, no horizontal overflow. No fixes needed.

Layout: the film in a dark edit-bay monitor with a live timecode, a 15-frame strip you scrub by pointing, the kit as 4 numbered hotspots with close-ups, then the old-site prompt beside the 9:16 whale clip with a switchable 2.35:1 guide.

Why it won: it is the only layout where the interaction (scrubbing the film, opening the kit) is the content, and it fits an all-portrait set of files. DC was close but its pointer-following still is weaker on phones; DB's stacked cards cost more in the open flight.

Teaser change: none (strip.json unchanged).

PLACEHOLDER copy to approve (app/components/sheets/dredge/story.ts, DA.vue): hook, kit, ratio, scrub, clips lines; credits ("Concept, images, film: William Vernon (solo)"); Info ("Module: Personal experiment", tools line); hotspot labels and close-up captions in DA.vue.

Upload list (DA uses): clip-whale.mp4, poster-film.webp, poster-clip-whale.webp, strip-00..14.webp, mj-gloves-dark, mj-hood-closeup, mj-gloves-red, mj-fabric-strap, mj-red-zip-pocket (each .webp plus -sm.webp). Film and teaser are already on R2.

Will decides: tools line (Midjourney/Nano Banana/Premiere vs old site's Luma and frame interpolation); "Personal experiment" module; whether 2.35:1 prompt vs 9:16 files is shown as is.

Try: http://localhost:3000/work/dredge?sheet=DA (click Enter without sound at the Gate first).
Stills: .scratch/v1-launch/overnight/dredge/stills/r1/DA-d0.png, DA-d2.png, DA-p0.png
