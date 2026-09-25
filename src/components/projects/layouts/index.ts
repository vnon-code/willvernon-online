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
import MarimekkoFourArtists from './marimekko-exhibition/FourArtists.astro';
import MarimekkoExhibitionIdentity from './marimekko-exhibition/ExhibitionIdentity.astro';
import MarimekkoPosters from './marimekko-exhibition/Posters.astro';
import MarimekkoBillboards from './marimekko-exhibition/Billboards.astro';
import TwphWorkspaceMatrix from './the-world-plays-here/WorkspaceMatrix.astro';
import TwphOutcomeReel from './the-world-plays-here/OutcomeReel.astro';
import TwphOOHWall from './the-world-plays-here/OOHWall.astro';
import TwphDeviceGrid from './the-world-plays-here/DeviceGrid.astro';
import SmugDuneReferences from './smugglers-outpost/DuneReferences.astro';
import SmugAIDrafts from './smugglers-outpost/AIDrafts.astro';
import SmugFinalRenders from './smugglers-outpost/FinalRenders.astro';
import HandheldAssetPreview from './handheld-stories/AssetPreview.astro';
import AmplifiedExhibitionGallery from './amplified-spaces/ExhibitionGallery.astro';
import RemnantsCaptionedGrid from './remnants/CaptionedGrid.astro';
import RemnantsGlyphGrid from './remnants/GlyphGrid.astro';
import RemnantsInteractiveBreakdown from './remnants/InteractiveBreakdown.astro';
import PowersurgeFeedbackExperiments from './powersurge/FeedbackExperiments.astro';
import PowersurgeFinalAssembly from './powersurge/FinalAssembly.astro';

export const LAYOUT_OVERRIDES: Record<string, unknown> = {
  'marimekko-exhibition:1': MarimekkoFourArtists,
  'marimekko-exhibition:2': MarimekkoExhibitionIdentity,
  'marimekko-exhibition:3': MarimekkoPosters,
  'marimekko-exhibition:4': MarimekkoBillboards,
  'the-world-plays-here:1': TwphWorkspaceMatrix,
  'the-world-plays-here:2': TwphOutcomeReel,
  'the-world-plays-here:3': TwphOOHWall,
  'the-world-plays-here:4': TwphDeviceGrid,
  'smugglers-outpost:0': SmugDuneReferences,
  'smugglers-outpost:1': SmugAIDrafts,
  'smugglers-outpost:4': SmugFinalRenders,
  'handheld-stories:1': HandheldAssetPreview,
  'amplified-spaces:4': AmplifiedExhibitionGallery,
  'remnants:0': RemnantsCaptionedGrid,
  'remnants:2': RemnantsGlyphGrid,
  'remnants:3': RemnantsCaptionedGrid,
  'remnants:4': RemnantsInteractiveBreakdown,
  'powersurge:2': PowersurgeFeedbackExperiments,
  'powersurge:3': PowersurgeFinalAssembly,
};
