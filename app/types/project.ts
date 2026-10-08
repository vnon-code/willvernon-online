// One piece of a Sheet's media: a still (the local derived webp where one exists) or a video with its poster.
// PROTOTYPE (Project Sheet rework, round 1)
export interface SheetMediaItem {
  type: 'image' | 'video'
  src: string
  poster?: string
  alt?: string
  caption?: string // PROTOTYPE round 2: overlaid on the media
  aspect?: number // width / height, where known (stories; video posters)
}

// PROTOTYPE (Project Sheet rework, round 2): a project's story, from content/stories/<slug>.json (prerender only).
// Amplified Spaces has one (its Sheet reads it); the other Sheets carry their facts in their own story.ts.
export interface StoryTrack {
  id: string
  title: string
  subtitle?: string
  light?: string
  sound: string
  visual: string
  room: string
  video?: SheetMediaItem
  art?: SheetMediaItem | null
  frames: SheetMediaItem[]
  network: SheetMediaItem[]
  build?: SheetMediaItem
  splash?: SheetMediaItem
  renders: SheetMediaItem[]
}
export interface StoryPhase { id: string, title: string, text: string, media: SheetMediaItem[] }
export interface SheetStory {
  slug: string
  title: string
  hook: string
  intro?: string
  credits: { k: string, v: string }[]
  stats: string[]
  tracks: StoryTrack[]
  process: StoryPhase[]
  outcome?: { text: string, media: SheetMediaItem[] } | null
  brief?: { k: string, v: string }[] // overnight run: the brief, as label / value lines
  problems?: string[] // overnight run: problems met, from the process book
  context?: string[] // overnight run: the work looked at first
}

// A strip card's text, looked up from content/*.json at prerender. `long`, `process`, `outcome` and `gallery` feed
// the project Sheet only (case studies have them; AI and experiment entries leave them empty).
export interface ProjectText {
  title: string
  summary: string
  tools: string[]
  long: string
  process: { title: string, text: string, media?: SheetMediaItem }[]
  outcome?: SheetMediaItem | null
  // The project's renders from content/media.json, matched by its asset folder (projects/01_amplified-spaces/)
  gallery: SheetMediaItem[]
  story?: SheetStory | null
}

export type ProjectCard = ProjectText & {
  id: string
  from: string
  discipline: string
  poster: string
  teaser?: string | null
}

// Opening a Sheet: the card, the rect it grows from and (when there is one) the element it grew out of, so the
// close can fold back into that element's current rect
export interface SheetOpen {
  card: ProjectCard
  from: DOMRect
  el?: HTMLElement
}
