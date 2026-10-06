# Synthetic Corals: the story from the source material

Read 2026-10-06 from the repo's content and Will's PC (Tailscale SSH, read-only). Sheet copy drawn from this is PLACEHOLDER until Will approves it.
hasWriteup = false: no process book, presentation or notes exist for this. AI work; the Sheet should open straight to the outcome.

## Sources
- `content/strip.json` card `synthetic_corals` (from `ai`, chip Experiment, discipline AI): poster `/img/posters/ai-coral-rotate.webp`, teaser `null` (poster only).
- `content/ai.json` projects[key=synthetic_corals] (INVENTORY AI.js.148 on): title, meta `[ COMFYUI_NODE // HIDREAM_CORE // CLOUDFLARE_R2 ]`, tags ComfyUI / HiDream weights / Flux.1 Dev / Bioluminescent / Multi-Outcome, desc, prompt, engine, ar, style, upscale. Card blurb (AI.copy.063): "Generating imaginary coral reef structures using a custom ComfyUI workflow. Each run produced wildly different results, from bleached calcification to glowing bioluminescent forms." Card tag shown: AntiGravity.
- `C:\Users\wvern\Documents\website\AI\`: `coral_rotate.mp4`, `coral_rotate_vertical.mp4`, `synthetic_corals_{1,2,4,5,Preview}` (all dated 23 May 2026, copied for the site).
- Searched C:, D:, E: (Documents, E:\Creative, E:\Adobe, D backup) for "coral": nothing else. `E:\Creative\AI` holds only Fooocus and sd.webui installs (tools, no coral outputs). No ComfyUI workflow file, no node-graph export found.

## The project
- Date: files 23 May 2026; no earlier date in any source. Personal experiment, no brief, no module, no client.
- The idea (Will, ai.json): a custom ComfyUI workflow to generate imaginary coral reef structures. Interest: how small changes to node settings give completely different organic forms. One run gave bleached white calcified shapes, the next glowing cyan tendrils.
- Process: five separate test runs from the same base pipeline (the site numbers outputs 1, 2, 4, 5 plus a preview; run 3 is not on the site). Outputs range from volcanic rock grafts to delicate bioluminescent polyps. Two short rotating clips show a coral turning.
- Setup as recorded: ComfyUI node + HiDream core (Flux.1 Dev base); node loader `flux1-dev-fp8.safetensors`, shifted ModelSamplingSD3 noise coordinates, KSampler cfg 4.5, VAE `ae.safetensors`. Aspect ratio 1:1 / 16:9 multi-resolution. Style "Design-Directed Flow (DDF)". Upscale "Upscaled Subtle (Ultrasharp 4x Model)".
- Prompt shown on the old site: "intricate synthetic coral structures, glowing neon cyan and purple veins, hyper-detailed bioluminescent reef, octane render, complex mathematics organic formations, 8k --ar 16:9". (The "--ar" and "octane render" are Midjourney-style wording on a ComfyUI run; show as written, don't tidy.)
- Problems met: not recorded in any source. Do not invent.
- Outcome: five stills (square-ish) and two rotating videos (square and portrait).

## Collaborators
None credited. Credit Will only.

## Media manifest (`public/proto-media/synthetic_corals/`, see UPLOAD.md; all also on R2 as originals)
- Videos: `coral_rotate.mp4` (square), `coral_rotate_vertical.mp4` (portrait). R2: `ai/coral_rotate.mp4`, `ai/coral_rotate_vertical.mp4`.
- Stills (webp): `coral-1` white calcification (839x873), `coral-2` bioluminescent cyan blue, `coral-4` polyps bouquet, `coral-5` volcanic coral graft, `coral-preview` (1024 square each).
- Sheet ideas: mostly square media; the two videos are the hero, the four stills read as a "same pipeline, different run" set (bleached vs glowing contrast).

## Teaser
Strip card has no teaser video. Propose `https://assets.willvernon.online/ai/coral_rotate.mp4` (2.6 MB, already on R2, no upload; the poster already is its first frame). Nothing stronger exists.
