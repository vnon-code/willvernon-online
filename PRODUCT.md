# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users
Primary: creative studios, agencies and tech teams scanning for a generative-design / creative-tech hire (Will, 2026-10-04). They judge fast and look for range and craft. Other audiences (clients commissioning work, peers, vnon listeners) are welcome but not designed for first.

## Product Purpose
Portfolio of William Vernon: generative design, creative tech, 3D, AI and music (as "vnon"), shown as an app-like experience with live sound. Success: a hiring visitor opens projects and comes away convinced of the craft.

## Positioning
The site is itself a piece of the work: a live, audio-reactive, generative interface (stem mixer, dot field driven by the projects) made by the person it presents.

## Operating Context
Gate (enter with or without sound) → Landing (dot background, project carousel, music and visuals mixers) → project detail. On the Landing, project info is a hook into the project, not the explanation; detail lives in the expanded project (the Sheet, chosen 2026-10-04).

## Capabilities and Constraints
- Nuxt, prerendered, deployed to Cloudflare; heavy media on R2 (URLs must keep working).
- All copy comes from `content/*.json`; `content/INVENTORY.md` is the parity checklist.
- Will approves every visual decision; unapproved choices are labelled PLACEHOLDER.

## Brand Commitments
Name William Vernon / Will Vernon; music alias vnon; monogram logo (`public/img/monogram-*-trans.png`).

## Evidence on Hand
Case studies (`content/projects.json`: title, short and long description, software, process steps, outcome video), AI work (`content/ai.json`), experiments (`content/experiments.json`), tool logos for AI tools, Blender and TouchDesigner (`public/img/logos/`, `content/toolset.json`). No logos yet for After Effects, Premiere Pro, Photoshop or Illustrator. No testimonials or client list: never invent them.

## Product Principles
- The work leads; interface recedes until asked.
- Every Landing element earns a click into a project.
- The site should feel made by its author: generative, sound-aware, precise.
