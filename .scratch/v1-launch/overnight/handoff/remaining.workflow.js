export const meta = {
  name: 'project-sheets-remaining',
  description: 'Handoff run on Will\'s desktop: fact-check Remnants and Handheld Stories, finish the remaining Project Sheets, build curated pages, QA, review page',
  phases: [
    { title: 'Check', detail: 'scorer works here; fact-check the two projects whose research failed' },
    { title: 'Projects', detail: 'per project: build 3, measure, 2 judges, record, until plateau' },
    { title: 'Curate', detail: 'build the 7+ candidates behind ?proto' },
    { title: 'Review', detail: 'QA pass and the review page' },
  ],
}

const A = args
const REPO = A.repo
const OV = `${REPO}/.scratch/v1-launch/overnight`
const CAP = A.safetyCap
const PRE = `You are part of Will Vernon's autonomous Project Sheet run on his portfolio site (willvernon-online, Nuxt 4), continued on his Windows desktop (handoff from his MacBook, 2026-10-07). Never ask questions, decide and record why.
READ FIRST: ${OV}/BRIEF.md (rules: copy minimal/brutalist through no-ai-slop, the shared shell AND the shared title/info/numbering/contents in app/components/sheets/_shared/, scoring /30, git), then ${OV}/TOOLS.md (scorer, registry, shared components) and ${OV}/handoff/HANDOFF.md.
ON THIS MACHINE: the BRIEF's SSH/scp instructions are void — Will's source files (C:, D:, E:) are local; read them in place, READ-ONLY, never write/move/delete outside the repo, never open credential-like files (Keys.txt, keys, tokens, .env, passwords), his employer or private messages. Copy sources you need into ${OV}/_src/ (gitignored). Media goes in public/proto-media/<slug>/ (gitignored).
Hard rules: stay on branch overnight/project-sheets; never touch v3/main, never deploy, never upload to R2, never commit files from the source drives. Dev server: http://localhost:3000 (check it answers before use; if down, start it in the background from the repo with: corepack pnpm dev --port 3000).`
// ---------- schemas ----------
const SETUP_S = { type: 'object', properties: { ok: { type: 'boolean' }, tools: { type: 'string' }, notes: { type: 'string' } }, required: ['ok', 'tools'] }
const RESEARCH_S = { type: 'object', properties: {
  slug: { type: 'string' }, hasWriteup: { type: 'boolean' }, storyPath: { type: 'string' }, mediaCount: { type: 'number' },
  teaser: { type: 'string', description: 'proposed teaser change old -> new and why, or "keep"' },
  collaborators: { type: 'string' }, gaps: { type: 'string' } }, required: ['slug', 'hasWriteup', 'storyPath', 'teaser'] }
const BUILD_S = { type: 'object', properties: {
  variants: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, layout: { type: 'string', description: 'one line: the body layout and the devices it uses, and the web inspiration' } }, required: ['id', 'layout'] } },
  notes: { type: 'string' } }, required: ['variants'] }
const MEASURE_S = { type: 'object', properties: {
  variants: { type: 'array', items: { type: 'object', properties: {
    id: { type: 'string' }, machineTotal: { type: 'number', description: 'out of 23 (criteria 1-8, 11-13 at 0-2 each, plus 15 machine part 0-1)' },
    failures: { type: 'string' }, stills: { type: 'array', items: { type: 'string' } } }, required: ['id', 'machineTotal', 'stills'] } } },
  required: ['variants'] }
const JUDGE_S = { type: 'object', properties: {
  scores: { type: 'array', items: { type: 'object', properties: {
    id: { type: 'string' }, c9: { type: 'number' }, c10: { type: 'number' }, c14: { type: 'number' }, c15read: { type: 'number' }, why: { type: 'string' } },
    required: ['id', 'c9', 'c10', 'c14', 'c15read', 'why'] } },
  pairwise: { type: 'array', items: { type: 'object', properties: { a: { type: 'string' }, b: { type: 'string' }, winner: { type: 'string' } }, required: ['a', 'b', 'winner'] } },
  nextRound: { type: 'string', description: 'concrete changes that would raise the best variant' } },
  required: ['scores', 'pairwise', 'nextRound'] }
const FINAL_S = { type: 'object', properties: {
  slug: { type: 'string' }, winner: { type: 'string' }, winnerScore: { type: 'number' }, rounds: { type: 'number' },
  runnersUp: { type: 'array', items: { type: 'object', properties: { id: { type: 'string' }, score: { type: 'number' }, layout: { type: 'string' } }, required: ['id', 'score'] } },
  layout: { type: 'string' }, whyWon: { type: 'string' }, teaserChange: { type: 'string' },
  copyToApprove: { type: 'array', items: { type: 'string' } }, uploadList: { type: 'array', items: { type: 'string' } },
  decisionsForWill: { type: 'array', items: { type: 'string' } }, tryUrl: { type: 'string' }, stills: { type: 'array', items: { type: 'string' } } },
  required: ['slug', 'winner', 'winnerScore', 'rounds', 'whyWon', 'tryUrl'] }
const SURVEY_S = { type: 'object', properties: { candidates: { type: 'array', items: { type: 'object', properties: {
  name: { type: 'string' }, source: { type: 'string' }, kind: { type: 'string' }, previews: { type: 'array', items: { type: 'string' } }, info: { type: 'string' } },
  required: ['name', 'source', 'previews'] } } }, required: ['candidates'] }
const VISIT_S = { type: 'object', properties: { scored: { type: 'array', items: { type: 'object', properties: {
  name: { type: 'string' }, craft: { type: 'number' }, originality: { type: 'number' }, fit: { type: 'number' }, score: { type: 'number', description: 'overall /10' }, why: { type: 'string' } },
  required: ['name', 'score', 'why'] } } }, required: ['scored'] }

// ---------- a small limiter so ~4 agents run at once ----------
function limiter(n) {
  let active = 0; const q = []
  const next = () => {
    if (active >= n || !q.length) return
    active++
    const { fn, res } = q.shift()
    fn().then(res, () => res(null)).finally(() => { active--; next() })
  }
  return fn => new Promise(res => { q.push({ fn, res }); next() })
}
const lim = limiter(2) // research + curation alongside the one project loop

const TERSE = `\nBe token-lean: read only the files you need, delegate nothing, don't paste large files back, and keep any free-text in your result under 300 words.`

phase('Check')
const ok = await agent(`${PRE}${TERSE}

TASK (Check): confirm the frozen scorer runs on this machine: node .scratch/v1-launch/overnight/tools/score.cjs amplified-spaces T2b --out desktop-check (see TOOLS.md "Portability"; install playwright-core with npm i --no-save inside .scratch/v1-launch/overnight/tools/ if needed). It should read 23/23 machine (criteria 7-8 are timing-noisy; one re-run allowed). Don't change what the scorer measures. Return ok true/false and the machineTotal in tools.`, { label: 'check:scorer', phase: 'Check', schema: SETUP_S, model: 'sonnet', effort: 'medium' })
if (!ok || !ok.ok) { log('Scorer does not run on this machine; stopping'); return { ok } }

const facts = await parallel(['remnants', 'handheld-stories'].map(slug => () => agent(`${PRE}${TERSE}

TASK (Fact-check "${slug}"): this project's research step failed on the Mac, so its Sheet (the default in app/components/sheets/${slug}/meta.json) was built from repo content only. Find its sources on this machine (Remnants: D:\\UNIVERSITY\\Graphic Design\\1st Year\\4002 or Old Submissions; Handheld Stories: D:\\UNIVERSITY\\Graphic Design\\3rd Year\\6004 ISTD; also C:\\Users\\wvern\\Documents\\website\\projects\\). Write ${OV}/${slug}/story.md if missing. Check every fact and credit the Sheet states against the sources; fix wrong ones in its story.ts/content (PLACEHOLDER, minimal, through no-ai-slop); make sure it uses the shared title/info/numbering/contents. Re-score it, must not drop. Commit only your files ("Project Sheet ${slug}: fact-check against sources") and push. Return a 3-line summary.`, { label: `factcheck:${slug}`, phase: 'Check', model: 'sonnet', effort: 'high' })))
log(`Fact-check: ${facts.filter(Boolean).length}/2 done`)

const researchOf = {}
for (const slug of A.projects) researchOf[slug] = Promise.resolve(A.research[slug] || null)
const visitP = Promise.resolve(A.visitor)

// ---------- Projects, one at a time ----------
phase('Projects')
const order = A.projects
const finals = [...A.finalsDone]
const takenLayouts = [...A.takenLayouts]
for (const slug of order) {
  const research = await researchOf[slug]
  const story = research ? research.storyPath : `${OV}/${slug}/story.md`
  const isAS = slug === 'amplified-spaces'
  let best = null, bestScore = -1, prevBest = -1, round = 0, feedback = '', history = []
  while (true) {
    round++
    const tag = `${slug} r${round}`
    const build = await agent(`${PRE}${TERSE}

TASK (Build, ${tag}): build Sheet body variants for "${slug}" in the real app using the per-project registry (TOOLS.md).
Story and media: ${story} (and ${REPO}/public/proto-media/${slug}/). Research notes: ${JSON.stringify(research)}.
${isAS
  ? `Amplified Spaces keeps variant T (Will's favourite, round 2) but POLISHED and VARIED WITHIN: Will found the scroll type behind an asset repetitive. Build 3 variants (ids like T1, T2, T3) that each vary T's beats with different devices (e.g. a pinned media stage with captions that swap, a horizontal process film strip, a split before/after, a node-graph-to-render reveal, a track switcher for the three rooms…), keeping T's type-stage character.`
  : `Will: "find other creative ways of showing work, use existing inspiration across the internet. Impress me." Build 3 variants (ids A, B, C for round 1; new letters later) whose body layouts differ from each other AND from the layouts already chosen for other projects tonight: ${JSON.stringify(takenLayouts)}. Within one Sheet, don't use one device for every beat. Research the web for real case-study pages of similar work (Awwwards, studios doing 3D/AV/print/AI case studies; Will's keepers in references/REFERENCES.md; never his dropped sites) and name your inspiration per variant.`}
${research && research.hasWriteup === false ? 'This project has no write-up: the Sheet opens straight to the outcome (outcome media, title, year, tools), in a layout of its own.' : 'Tell the story from the sources: brief, process beats, problems, outcome.'}
${round > 1 ? `Round ${round}: keep the current best (${best}, ${bestScore}/30) as the baseline, unchanged. Build 1 refined version of it applying the judges' feedback, plus 2 new challengers. Judges' feedback: ${feedback}` : ''}
Teaser: ${research ? research.teaser : 'keep'} — apply it in content/strip.json if it is genuinely better, record old -> new in ${OV}/${slug}/notes.md.
Copy: short, plain, PLACEHOLDER-marked, facts only from the sources, collaborators credited as the sources credit them. Shell stays as is (BRIEF). Performance is a hard requirement: lazy media, videos play only in view, no jank.
Before returning, run the scorer on each new variant yourself and fix anything under the machine thresholds (up to 3 tries each; keep a try only if it scores higher). Never edit the scorer. Don't commit.
Return the ids you built (not the baseline) and a one-line layout description each.`, { label: `build:${tag}`, phase: 'Projects', schema: BUILD_S, model: 'opus', effort: 'high' })
    if (!build || !build.variants.length) { log(`${tag}: build failed`); if (best) break; else { round = CAP; break } }
    const ids = [...(best ? [best] : isAS ? ['T'] : []), ...build.variants.map(v => v.id)]
    const layouts = Object.fromEntries(build.variants.map(v => [v.id, v.layout]))

    const measure = await agent(`${PRE}${TERSE}

TASK (Measure, ${tag}): run the frozen scorer (TOOLS.md) for project "${slug}" on variants ${JSON.stringify(ids)}, stills labelled r${round}. Don't change any code. If a run errors or a reading looks impossible, re-run once and report it. Return per variant machineTotal /23, failed criteria with values, and the still paths (desktop and phone).`, { label: `measure:${tag}`, phase: 'Projects', schema: MEASURE_S, model: 'haiku' })
    if (!measure) { log(`${tag}: measure failed`); break }

    const judgePrompt = (order2) => `${PRE}${TERSE}

TASK (Judge, ${tag}): you did not build these. Judge the by-eye criteria for project "${slug}" from the stills (Read every image) and by opening each variant live at http://localhost:3000/?sheet=<id> if useful: c9 reads as this site (0-2), c10 Will's rules (0-2: no blur, monochrome + race red accents only, Host Grotesk UI type, smooth, not heavy, nothing he has rejected — see references/REFERENCES.md Avoid list and the matrix), c14 tells the story / creative presentation (0-2; Will wants something that impresses, not image-text-image-text, and not the same device every beat), c15read phone text readable and layout sound at 375px (0-1).
Compare pairwise in THIS order: ${JSON.stringify(order2)} (for each pair, which presents the work better). Story for fact-checking copy: ${story}. Layouts: ${JSON.stringify(layouts)}. Machine results: ${JSON.stringify(measure.variants.map(v => ({ id: v.id, machineTotal: v.machineTotal, failures: v.failures, stills: v.stills })))}.
Also give concrete feedback that would raise the best one.`
    const [jf, jr] = await parallel([
      () => agent(judgePrompt(ids), { label: `judge-fwd:${tag}`, phase: 'Projects', schema: JUDGE_S, agentType: 'reviewer' }),
      () => agent(judgePrompt([...ids].reverse()), { label: `judge-rev:${tag}`, phase: 'Projects', schema: JUDGE_S, agentType: 'reviewer' }),
    ])
    const judges = [jf, jr].filter(Boolean)
    const eye = id => {
      if (!judges.length) return 0
      const per = judges.map(j => { const s = j.scores.find(x => x.id === id); return s ? s.c9 + s.c10 + s.c14 + s.c15read : 0 })
      return per.reduce((a, b) => a + b, 0) / per.length
    }
    const pairWins = id => { // a win counts only if both orders agree
      if (judges.length < 2) return 0
      let w = 0
      for (const p of jf.pairwise) {
        if (p.winner !== id) continue
        const other = p.a === id ? p.b : p.a
        if (jr.pairwise.some(q => [q.a, q.b].includes(id) && [q.a, q.b].includes(other) && q.winner === id)) w++
      }
      return w
    }
    const table = measure.variants.map(v => ({ id: v.id, machine: v.machineTotal, eye: eye(v.id), total: Math.round((v.machineTotal + eye(v.id)) * 10) / 10, wins: pairWins(v.id), stills: v.stills, layout: layouts[v.id] || 'baseline' }))
      .sort((a, b) => b.total - a.total || b.wins - a.wins)
    const top = table[0]
    prevBest = bestScore
    if (top.total > bestScore || !best) { best = top.id; bestScore = top.total }
    feedback = judges.map(j => j.nextRound).join(' | ')
    history.push({ round, table })
    const gain = bestScore - prevBest
    const plateau = round > 1 && gain < 1
    const done = bestScore >= 30 || plateau || round >= CAP
    if (round >= CAP && !plateau && bestScore < 30) log(`${slug}: safety cap ${CAP} rounds reached (still gaining ${gain.toFixed(1)}); logged`)

    await agent(`${PRE}${TERSE}

TASK (Record, ${tag}): write round ${round} for "${slug}" into ${OV}/${slug}/matrix.md (create it from the base matrix's criteria 1-14 + 15 if missing): the scores table, the results log lines, and the judges' notes. Data: ${JSON.stringify({ table: table.map(({ stills, ...t }) => t), judgeNotes: judges.map(j => ({ scores: j.scores.map(x => ({ id: x.id, why: x.why })), nextRound: j.nextRound })), best, bestScore, gain: round > 1 ? gain : null, stop: done ? (bestScore >= 30 ? '30/30' : plateau ? 'plateau' : 'safety cap') : 'continue' })}.
Set this project's variant scores in the registry so the options panel shows them${done ? `, and make "${best}" the project's default Sheet` : ''}. Then git add -A, commit "Project Sheet ${slug}: round ${round}${done ? ' (final, ' + best + ' ' + bestScore + '/30)' : ''}" and push. If push fails, retry once after git pull --rebase; report.`, { label: `record:${tag}`, phase: 'Projects', model: 'sonnet', effort: 'low' })
    log(`${tag}: best ${best} ${bestScore}/30${round > 1 ? ` (gain ${gain.toFixed(1)})` : ''}${done ? ' — done' : ''}`)
    if (done) break
  }
  if (!best) { finals.push({ slug, winner: 'none', winnerScore: 0, rounds: round, whyWon: 'build failed', tryUrl: '' }); continue }
  const fin = await agent(`${PRE}${TERSE}

TASK (Finalize, "${slug}"): the loop chose "${best}" at ${bestScore}/30 after ${round} rounds. History: ${JSON.stringify(history.map(h => ({ round: h.round, table: h.table.map(t => ({ id: t.id, total: t.total, layout: t.layout })) })))}.
Check the winner is the project's default and opens cleanly at http://localhost:3000 (desktop and 375px); fix only real breakage. Write ${OV}/${slug}/SUMMARY.md and return: winner, score, rounds, runners-up (top 2 others), the winner's layout in one line, why it won (plain, 2-3 sentences), the teaser change (from ${OV}/${slug}/notes.md, or "none"), the PLACEHOLDER copy strings Will must approve, the upload list (from public/proto-media/${slug}/UPLOAD.md, only files the winner uses), decisions only Will can make, a try URL (e.g. http://localhost:3000/work/${slug}?sheet=${best} — check what actually works), and the winner's best 2-3 still paths.`, { label: `finalize:${slug}`, phase: 'Projects', schema: FINAL_S, model: 'sonnet', effort: 'medium' })
  finals.push(fin || { slug, winner: best, winnerScore: bestScore, rounds: round, whyWon: '(finalize failed)', tryUrl: '' })
  takenLayouts.push(`${slug}: ${(fin && fin.layout) || best}`)
}

// ---------- Curate: build pages for 7+ ----------
phase('Curate')
const visit = await visitP
const picked = (visit && visit.scored || []).filter(c => c.score >= 7)
log(`Curation: ${picked.length} of ${(visit && visit.scored || []).length} candidates scored 7+`)
const newPages = []
for (const c of picked) {
  const r = await agent(`${PRE}${TERSE}

TASK (Curate, build "${c.name}"): a visitor-reviewer scored this find ${c.score}/10 (${c.why}). Give it a project page behind ?proto: a strip card that only shows when the URL has ?proto, and a Sheet using the shared shell. It's outcome-only unless a write-up exists: the Sheet opens straight to the outcome. Use a layout unlike these: ${JSON.stringify(takenLayouts)}. Sources and previews: ${OV}/curation/survey.md (pull any further media read-only to public/proto-media/${c.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/, with UPLOAD.md). Copy PLACEHOLDER, facts only. Score it with the frozen scorer, fix to pass, write ${OV}/curation/<slug>.md, commit "Proto page: ${c.name}" and push. Return slug, score, try URL, copy to approve, upload list, decisions for Will.`, { label: `curate:build:${c.name}`, phase: 'Curate', schema: FINAL_S, model: 'opus', effort: 'high' })
  if (r) newPages.push({ ...r, visitor: c })
}

// ---------- Review ----------
phase('Review')
const qa = await agent(`${PRE}${TERSE}

TASK (QA, read and run only, fix only real breakage): on http://localhost:3000 (and ?proto) open every project's default Sheet desktop and 375px via headless Chrome: no console errors, no horizontal scroll, open/close/back work, strip and Landing unchanged otherwise, no file from the PC committed (git ls-files | grep proto-media must be empty), no credentials in the diff since ${A.baseCommit}. Run corepack pnpm build in a temp copy or as a check if feasible (don't deploy). Fix only breakage, commit "Overnight QA fixes" and push if you changed anything. Return a short plain report.`, { label: 'review:qa', phase: 'Review', model: 'sonnet', effort: 'high' })

const page = await agent(`${PRE}${TERSE}

TASK (Review page): write Will's morning review page as one self-contained HTML file at ${OV}/review/index.html (inline CSS, no external scripts; Host Grotesk from Google Fonts is fine; colour tokens on :root with a dark-mode override; body background set; works at 375px). Embed still images as small inline webp data URIs (resize to ≤900px wide, keep the file under ~12MB total) since the page will be published privately and can't reach localhost.
Sections, in strip order: per project — winner + score, runners-up with scores, the winner's layout, why it won, teaser change, copy to approve (PLACEHOLDER), R2 upload list, decisions for Will, the try URL (localhost, note the dev server must be running), and 2-3 stills. Then the curated new pages (visitor scores, including the ones that did not make 7 and why). Then the QA report and a short "how the loop ran" (rounds per project, plateau/cap stops, criteria /30). Lead with a 5-line summary at the top. Plain, short sentences.
Data: ${JSON.stringify({ finals, newPages, visitor: visit, qa })}
Return the file path.`, { label: 'review:page', phase: 'Review', model: 'sonnet', effort: 'medium' })

return { finals, newPages, visitor: visit, qa, page }
