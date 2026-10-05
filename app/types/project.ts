// A strip card's text, looked up from content/*.json at prerender. `long` and `process` feed the project Sheet only
// (case studies have them; AI and experiment entries leave them empty).
export interface ProjectText {
  title: string
  summary: string
  tools: string[]
  long: string
  process: { title: string, text: string }[]
}

export type ProjectCard = ProjectText & {
  id: string
  from: string
  discipline: string
  poster: string
  teaser?: string | null
}
