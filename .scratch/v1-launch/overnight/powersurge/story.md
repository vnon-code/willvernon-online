# Powersurge: the story from the source material

Read 2026-10-06 from Will's PC (Tailscale SSH, read-only). Sheet copy drawn from this is PLACEHOLDER until Will approves.

## Sources
- `D:\UNIVERSITY\Graphic Design\3rd Year\Collab Project\Submission\6002ProcessBookWV.pdf` (21pp, main source; Will's voice, first person)
- Website folder `C:\Users\wvern\Documents\website\projects\04_powersurge\` (README, final film `assets\PowerSurgeFINAL_1.mp4` 89MB 1080p, gifs, stills, .toe files)
- `...\Collab Project\TD\` (TouchDesigner versions V1-V5 .mov, backups, SS3/SS4 stills), `Submission\` (SC1-3 screen captures, 818MB original film)
- Repo: `content/projects.json` slug powersurge (descShort/descLong/process 01-03), `content/strip.json`
- Not read: `.toe` files, `D:\...\3rd Year\6002ProcessBook.indd`, `collabproject.abc`

## The project
- GDES6002 Collaboration (Level 6, 3rd year); source files dated Nov-Dec 2024 (final film exported 13 Dec 2024). Book subtitle: "Reflecting on the Past, Exploring the Future". Brief: visual communication to be received by a future public.
- Title "Power Surge" (film title card), by Suyash Sunar & Will Vernon. Film tagline: "A visual journey through the exponential growth of computing power."
- No client. Two-person collaboration.

## The idea
- Inspired by Mike Luan's ".senses" data portraits: let a live data stream drive generative art, so the image carries a hidden meaning. Quote opening the book: environmental data streams as "live portrait of its existence".
- Topic chosen as a reflection on how fast technology still advances: Moore's Law (Gordon Moore, 1965, transistors double about every two years). Data: "Our World in Data" graph of FLOPs over 30 years. A data portrait of it "would be a representation of the digitalisation of the human race."
- Made dynamic rather than static: a video, every ten seconds = one year (Will built a spreadsheet to turn the data into a timeline). Film runs about 5:35, 1997 to 2021, FLOPs scale labelled 124 FLOPS to 1.2 gigaFLOPS.

## Process beats
1. Context and data (pp.3-6): data portraits, Moore's Law research, the FLOPs graph.
2. Timeline and inspiration (p.7): spreadsheet; particle-system work (Iago Mota, Blender advanced particles) as a starting point.
3. First attempt in Blender (p.8): number of particles and force strength tied to FLOPs; unworkable CPU bottleneck, file no longer opens. Data plotted along the timeline: almost flat for 75% of the video, dramatic at the end.
4. Switch to TouchDesigner (pp.9-10): built from the "Exploding Star" tutorial by supermarket sallad. Cylinder emitter, feedback loop, transform for rotation, bloom for glow, normalising points constricts the particles into a sphere, level operator for colour.
5. Experiments (p.11): three experiment videos on form, colour, flow; Will "fell in love with the bloom effect".
6. Modifications (pp.12-13): Animation CHOP with a locked timeline so the video matches the data every run (noise still makes each render different). The graph drives size (Math multiply), a renamed "Chaos" parameter (Post Add inverts the shape), and colour (blue fixed; red and green rise, red tint then white at the end so the bloom shows). Each parameter has operators to constrain its range.
7. Versions (pp.14-16): V1 size 8-1, speed 0.02-0.08, lifetime 1, 1000 particles; V2 size 10-2, speed 0.02-0.2, lifetime 20; V5 FINAL.
8. Music (p.17): ambient, builds across ~5 min; many tried, "The End" by C418 fitted best.
9. After Effects (p.18): FLOPs timeline, a white circle keyframed along X by the same data.
10. Premiere (p.19): FLOPs timeline nested, labels either side; Year animation by Suyash top-left, bottom timeline; typeface chosen by Suyash for the title, reused for all text; fades for intro/outro.
11. Experiment tool (p.21): the TD project turned into a slider tool (form tab, colour tab) so Suyash or anyone can explore the parameters.

## Problems met
Blender CPU bottleneck (abandoned); exponential data means a quiet sphere for most of the film; noise makes every render differ (locked timeline to keep data consistent); parameters each needed their own limits to stay balanced.

## Outcome
Final data-portrait film "Power Surge" (~5:35, 1080p): a blue sphere that is barely moving through the 1990s-2010s, then bursts into purple then red-white feedback chaos from about 2018-2021, with year counter and FLOPs timeline. Credits card: "Made by Suyash Sunar & Will Vernon". Plus an interactive experiment tool (TouchDesigner) and stills/gifs.

## Collaborators (as credited)
Suyash Sunar (project partner; Year animation, title typeface). Credit line in the film: "Made by Suyash Sunar & Will Vernon". Music: "The End" by C418. Tutorial: "Exploding Star" by supermarket sallad. Inspiration: Mike Luan (.senses), Iago Mota. Data: Our World in Data. Tools: TouchDesigner, After Effects, Premiere Pro, Blender (abandoned), Excel.

## Media manifest (`public/proto-media/powersurge/`, 31 files, 15MB; see UPLOAD.md)
- Video: `teaser-360.mp4` (10s burst, 4.3MB), `climax-360.mp4` (20s, 9MB). Full 1080p film to upload as-is: PowerSurgeFINAL_1.mp4 (89MB, on PC).
- Stills: `ss1-4`, `ss2-transformed`, `film-2s/60s/285s/300s`, `flops-timeline`, `td-network`.
- Process pages `pb-p03 05 06 07 08 09 10 11 12 13 14 15 16 18 19 20 21`.
- Existing: strip poster `/img/powersurge/PowerSurgeSS.png`, teaser `/img/powersurge/powersurgegif.gif` (15.6MB gif).
