# Dredge: matrix (base criteria 1–14 + 15 phone, /30)

## Round 1 (2026-10-06): machine scores (`tools/score.cjs`, stills in `stills/r1/`)

| Variant | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 11 | 12 | 13 | 15m | Machine /23 | Notes |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| DA Edit bay | 2 | 2 (94%) | 2 | 2 | 2 | 2 | 2 (622/443) | 2 (1) | 2 | 2 | 2 | 1 | 23 | an earlier run read 3 slow frames (22) |
| DB Descent | 2 | 2 (93%) | 2 | 2 | 2 | 2 | 2 (623/419) | 2 (1) | 2 | 2 | 2 | 1 | 23 | first run 20 (hover clip decoding in flight; fixed) |
| DC Campaign | 2 | 2 (93%) | 2 | 2 | 2 | 2 | 2 (670/445) | 2 (1) | 2 | 2 | 2 | 1 | 23 | |

Judged criteria (9, 14, 15 readability): pending the reviewer.

## Round 1: scores (machine /23 + judged /7)

| Variant | Machine /23 | Eye /7 | Total /30 | Wins |
|---|---|---|---|---|
| DA | 23 | 7 | 30 | 2 |
| DC | 23 | 6.75 | 29.8 | 1 |
| DB | 23 | 4.25 | 27.3 | 0 |

## Results log (r1)

- r1 DA (Edit bay: the film in a dark edit-bay monitor with a live timecode, a strip of 15 film frames you scrub by pointing with a red playhead, the kit as 4 numbered hotspots each opening a close-up, then the old-site prompt beside the 9:16 whale clip with a switchable 2.35:1 framing guide): 30/30. Inspiration: Premiere's source monitor and thumbnail track, Apple's scroll-scrubbed product films, feature hotspots on Your Majesty's Rottefella site and Arc'teryx's technical lookbooks.
- r1 DC (Campaign: the film on the left page of a magazine spread with two stills, the kit as a big-type index of 7 looks with the hovered still following the pointer, the whale clip as a wide billboard with the prompt under it in small mono): 29.8/30. Inspiration: hover-reveal indexes on Obys and Rejouice, SSENSE and Arc'teryx System_A lookbooks, billboard mock-ups on agency case pages.
- r1 DB (Descent: the film in a wall of four tall screens with 3 clips, the world as sticky stacked cards on plates from white sky to black water, the day as an hour bar chart): 27.3/30. Inspiration: Arc'teryx's 2016 vertical-scroll lookbook, stacked-card chapters on Awwwards, Your Majesty's FILA Explore stories.
- Best DA 30/30; gain n/a (first round); stop: 30/30. DA is the default in meta.json.

## Judges' notes (r1)

**Judge 1:** DA: shared head, info, numbering and contents intact; dark, red only on playhead, active hotspot, section numbers and the --ar tag; three different devices, all specific to the project; prompt-vs-ratio beat from story.md. Small issues: monitor crops the 9:16 film to near-square, '9:16' tag clipped at the top of the whale panel (d3), '44.7 s' twice in the caption; phone reads well. DB: wall of screens and hour chart are good, but six near-full-height plates with a huge word on an empty half-plate repeat one device (the image-text rhythm Will dislikes); plates 1-2 light grey break from the dark site; plates 3-5 (#8b9399, #3d454b, #1b2024, DB.vue:51-53) blue-grey, not monochrome + red; on phones the next sticky card covers the labels first. DC: spread, hover index (Obys/Rejouice keeper pattern, red on the active look) and billboard are three beats; billboard crops the portrait clip to wide and looks soft (d3); hover still covers the descriptor column ('wet', 'strap' cut off, d2); whale line repeats the world copy; phone inline thumbnails work well.
Next round (DA): 1 show the film at true 9:16 in the monitor, fill the empty right side with timecode and caption; 2 fix the clipped '9:16' tag and the empty band above the prompt, align prompt top with the clip; 3 drop the duplicate '44.7 s' ('Midjourney clips, five seconds each. Cut in Premiere Pro.'); 4 touch: 'Drag the strip', make sure it scrubs on drag at 375px (thumbs about 22px); 5 show the 2.35:1 guide once on scroll-in, then toggle; 6 optionally borrow DC's large look-name type for the hotspot labels. Keep red to playhead, active hotspot and --ar tag.

**Judge 2:** DA: shared shell and credits; dark with red accents; scrub strip + timecode, four hotspots, prompt with 2.35:1 vs 9:16 toggle: tells the AI-process story without image-text alternation; copy short and checks against story.md; '44.7 s' twice. Faults: dead black above the prompt, '9:16' tag clipped under the header, film window opening on a logo frame. DC: shared shell, monochrome + red; three distinct beats, but the hover index is a stock Obys/Rejouice pattern and shows the kit more than how the film was made; phone index with inline thumbnails clean. DB: big light-grey plates (#e8eaeb, #c3c8cb) break the dark look; blue-tinted greys (#8b9399, #3d454b, #1b2024) not monochrome, no red; same device (giant one-word label + one image) six times, mostly empty plate, no story on the plates; hour chart a nice fact; phone holds.
Next round (DA, DA.vue + story.ts): 1 start the film window and poster on a strong frame (figure on the slab or the whale), not the logo at 0:01; 2 fill the empty top half of the timecode panel on desktop (name the clip under the playhead: Orbit / Whale / Fabric); 3 remove repeated '44.7 s'; 4 prompt beat (d3): remove ~200px dead space above '02 / 02', centre text against the whale clip, keep the '9:16' tag clear of the docked header; 5 phones: 15 thumbs at 375px give ~23px; make it a drag/scroll strip with bigger frames or a range input; 6 fill the empty right hero tile during the grow (d0); 7 optionally a closing whale beat. DB needs a rethink: dark range, red accents, a line of copy per plate, fewer repeats.

Stopped at 30/30; the notes above are for any later polish.
