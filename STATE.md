# State — v3

**Goal:** rebuild willvernon.online from scratch, piece by piece, with Will approving every visual choice.

**Decisions (2026-10-02)**
- Fresh start on orphan branch `v3`. Kept only `public/`, `content/`, `content/INVENTORY.md` and the deploy files.
- Will disliked both the legacy site and redesign/v2: the look, the heavy motion, the page structure and the costly phase process.
- Stack and motion approach are still open. Colour and type are decided; see below and references/REFERENCES.md.

**Open items**
- Stack choice (decide when the landing page needs code).
- `node_modules/` and `.astro/` are leftovers from the old Astro build (gitignored); delete once the stack is picked.
- `v3` isn't pushed to GitHub yet.

**Reference collection** (`references/REFERENCES.md`): 12 keepers over rounds 1–2. Visual system decided (2026-10-03):
- Colour: near-black #0A0A0A, off-white #F2F2EF, Race red #E10600 (accents and large text only). Both themes.
- Type: Host Grotesk for UI and body; Archivo Expanded Black for the hero name, set as WILL VERNON in caps; red on the line underneath.

**Landing concept, round 1 (Will, 2026-10-03)**
- Main job: show the work first.
- One carousel mixes design, AI and music projects. Separate non-project deep-dive pages for Design, Music and AI.
- Opening: an enter-with / enter-without-sound gate before the page.
- Sound on the landing: interactive stems, plus track switching and a volume control.
- Opening motion: Pacôme-style, built from per-project teaser videos. How the work is shown and moves is still open.
- Repeat visits: the full intro plays every time (Will: it stays short).

**Landing concept, round 2 (Will, 2026-10-03)**
- Carousel: horizontal strip driven by vertical scroll; the centred card plays its teaser and grows. Counter + title + category underneath.
- Stems: the visitor can toggle or control stems. Background visuals react to the audio; their colour and form are procedurally generated, influenced by the hovered project.
- No nav, or a transparent one. It should feel like an app, not a website.

**Landing concept, round 3 (Will, 2026-10-03)**
- Sound controls: floating HUD along the bottom edge — stem toggles, track name with prev/next, volume.
- Chrome: monogram top-left, menu button top-right (opens a full-screen index), filter chips (All / Design / Music / AI) for the strip.
- WILL VERNON + the red line live on the gate screen only, not on the landing (Will, 2026-10-03).
- Landing: filter chips sit directly above the project strip, both centred on screen.
- Variant B is now a full-screen point cloud of each project's image (Will: point clouds of 3D images, filling the screen at all times). Depth is faked from brightness for now.
- DREAM slider next to the stems: more reverb, delay, low-pass and a slight slow-down (Will's ask: dreamy, cinematic, ambient). The visuals slow and soften with it.
- Variant C (mixed): one point cloud for all projects. "Gradient" projects feed the live field into it, laid flat with large points, so moving between cloud and gradient is one morph. Points sit at real depth; the camera drifts along a slow loop with mouse parallax and scroll dolly. Which projects are gradient is a placeholder: Amplified Spaces and Silver Linings.
- Depth maps: Depth Anything V2 Small only (Apache-2.0; Base/Large are CC-BY-NC). Prototype maps go in `prototype/depth/<image name>.png`, white = near. Will's Blender exports can replace them later for hero projects. The 4 maps for Will's picks are generated (Python venv in the session scratchpad; ComfyUI wasn't running). The Amplified Spaces map is weak: a flat dish with no real shape.
- Point-cloud images, picked by Will (2026-10-03) from the teaser-video stills in `public/img/posters/`: Smuggler's Outpost `assets-vidsmugglersoutpost-1`, Amplified Spaces `video-trailers-b17av2-1`, Monolithic Survival `ai-monolith-preview-v2`, Topographic AV `renders-cinematic-trailer-upscaled`. Silver Linings has no image, so it's always a gradient. Claude's earlier picks were rejected: poor, and some came from the wrong project.
- R2 serves `Access-Control-Allow-Origin: *`, so full-res R2 images and teaser videos can feed WebGL directly.
- **Background decided (Will, 2026-10-03): variant C, mixed.** Will is happy with the prototype. A (field only) and B (cloud only) are dropped.
- Top-left uses Will's real logo, `public/img/monogram-white-trans.png`.
- To check: which projects have a teaser video. Only ai_trailer, experiments_trailer, fading_away, Dredge and monolith previews are named so far.

**Prototype status:** saved on local branch `prototype/landing-bg` (not pushed; `git checkout prototype/landing-bg` to view). `prototype/landing-bg.html` is approved as the reference for the landing, with `prototype/pick-images.html` and `prototype/depth/`. It defaults to C with the switcher hidden; `?variant=A|B|C` brings the switcher back. Serve it with the "prototype" config in `../.claude/launch.json` (python http.server on :5173). It is throwaway code: rebuild it properly, don't promote it.

**Next step:** pick the stack, since the landing now needs real code.
