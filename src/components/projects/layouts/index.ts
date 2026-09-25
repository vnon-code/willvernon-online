/**
 * Per-slug bespoke mockup-layout registry (D-brutalist-grid.md §5.7: "the
 * specialised mockup layouts are a later per-case-study job"). Empty today —
 * every media.layout ('grid' | 'carousel' | 'background' | 'custom') falls
 * through CaseMedia.astro's generic ruled-grid renderer, which is honest to
 * the 19 mockup groups' items[]/captions[] but not to their retired
 * `_raw_html` <style> staging (13 legacy blocks — see build_content.py's
 * parse_media_blob and each item's `_todo`/`_raw_html`).
 *
 * To add a bespoke layout for one case study: export a `.astro` component
 * here taking the same `{ media, slug, stepIndex }` props as CaseMedia, then
 * register it below keyed by "<slug>" (every group on that case study) or
 * "<slug>:<stepIndex>" (one process step only). CaseMedia.astro checks this
 * map before falling back to its generic grid — see its header comment.
 */
export const LAYOUT_OVERRIDES: Record<string, unknown> = {};
