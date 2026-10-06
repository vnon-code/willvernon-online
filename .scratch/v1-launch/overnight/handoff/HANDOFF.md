# Handoff: Project Sheet run, MacBook → Windows desktop (2026-10-07)

The overnight run (`wf_4c900ae2-5cd`, on the MacBook) was stopped cleanly after Handheld Stories. This picks it up on
Will's desktop. Every rule is in `../BRIEF.md`; the tools are in `../TOOLS.md`.

## State at handoff
- Done (winner is each project's default in `app/components/sheets/<slug>/meta.json`): see `args.json` → `finalsDone`.
  Amplified Spaces' default is **T2b** (29.5/30 after the mains-power rescore), not the T2 its finalize recorded.
- Shared title / info / numbering / contents: `app/components/sheets/_shared/` (Will 2026-10-07). Every Sheet uses them.
- Copy rule (Will 2026-10-07): minimal, brutalist, only the interesting stuff, every string through `no-ai-slop`.
- Left: synthetic_corals, marimekko-exhibition, powersurge; build the curated page(s) scoring 7+ (Cargo 5015);
  fact-check Remnants and Handheld Stories (their research step failed); QA; review page; publish it.
- Media (`public/proto-media/`, gitignored) was copied from the Mac into this repo over SSH; it never goes in git.

## Steps (Claude on the desktop does these)
1. In `C:\Users\wvern\Documents\Personal Projects\willvernon-online`: `git status` (stop if there are local changes),
   `git fetch`, `git checkout overnight/project-sheets`, `git pull`, `corepack pnpm install`.
2. Check `public/proto-media/` holds the 12 folders (04, _candidates, amplified-spaces, dredge, handheld-stories,
   marimekko-exhibition, monolith, powersurge, remnants, smugglers-outpost, synthetic_corals, the-world-plays-here).
3. Start the dev server in the background: `corepack pnpm dev --port 3000`; check http://localhost:3000 answers.
4. Run the Workflow tool with `scriptPath` = this folder's `remaining.workflow.js` and `args` = the contents of
   `args.json` passed as a JSON object (not a string). Will has already opted into this workflow.
5. When it finishes: load the `artifact-design` skill, check `../review/index.html` (Amplified Spaces must show T2b),
   publish it as a private Artifact and give Will the link. Update the ticket and MAP.md with the verdicts.
