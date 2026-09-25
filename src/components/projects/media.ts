/**
 * Resolves a projects.json MediaItem (image/video/gif) against the shared
 * pre-baked manifest (src/data/media.json — dims, posters, derived webp,
 * animated-gif webm+poster) plus a small local fallback
 * (src/data/projects-media-fallback.json) for the URLs that manifest never
 * covers: it only ever indexed local /img/... paths, never R2 image URLs,
 * and R2 gifs aren't in its `gifs` map either. The fallback was captured by
 * reading each asset's own header bytes (PNG IHDR / JPEG SOF / GIF logical
 * screen descriptor, or an MP4 tkhd for the one video) over HTTPS — a
 * one-off, not part of the build; see redesign/PROGRESS.md's Phase 4 notes
 * for the exact 8 URLs it covers and how to re-derive it if content changes.
 *
 * Every resolver keeps the ORIGINAL url as `full` (the lightbox/data-full
 * target and the R2 video src — R2 URLs are never rewritten, CLAUDE.md), and
 * only swaps in a derivative for the *displayed* src where the manifest
 * actually has one.
 */
import media from '../../data/media.json';
import fallback from '../../data/projects-media-fallback.json';

interface Dim {
  w: number;
  h: number;
}

interface ImageEntry extends Dim {
  bytes?: number;
  derived?: { src: string; w: number; h: number; bytes?: number };
}

interface PosterEntry extends Dim {
  src: string;
}

interface GifEntry extends Dim {
  webm: string;
  poster: string;
}

const IMAGES = media.images as unknown as Record<string, ImageEntry>;
const POSTERS = media.posters as unknown as Record<string, PosterEntry>;
const GIFS = media.gifs as unknown as Record<string, GifEntry>;
const FALLBACK_IMAGES = fallback.images as unknown as Record<string, Dim>;
const FALLBACK_VIDEOS = fallback.videos as unknown as Record<string, Dim & { poster: string | null }>;

/** Used only when a URL is in none of the above — keeps layout stable
 * (a wrong-but-plausible box) rather than an unsized <img>/<video>. */
const UNKNOWN_DIM: Dim = { w: 1600, h: 1000 };

export interface ResolvedImage extends Dim {
  /** What actually goes in src: a derived webp when one exists, else the
   * original URL untouched. */
  displaySrc: string;
  /** Always the original, unmodified URL — the lightbox target. */
  full: string;
  isGif: boolean;
}

export function resolveImage(src: string): ResolvedImage {
  if (src.toLowerCase().endsWith('.gif')) {
    const gif = GIFS[src];
    if (gif) return { displaySrc: gif.poster, full: src, w: gif.w, h: gif.h, isGif: true };
    const dim = FALLBACK_IMAGES[src] ?? UNKNOWN_DIM;
    // No webm derivative for this one (R2 gif the manifest never covered):
    // fall back to the gif itself, which every browser renders natively.
    return { displaySrc: src, full: src, w: dim.w, h: dim.h, isGif: false };
  }

  const entry = IMAGES[src];
  if (entry) {
    if (entry.derived) {
      return { displaySrc: entry.derived.src, full: src, w: entry.derived.w, h: entry.derived.h, isGif: false };
    }
    return { displaySrc: src, full: src, w: entry.w, h: entry.h, isGif: false };
  }
  const dim = FALLBACK_IMAGES[src] ?? UNKNOWN_DIM;
  return { displaySrc: src, full: src, w: dim.w, h: dim.h, isGif: false };
}

/** A gif rendered as a muted/looping video (its manifest `gifs` entry). */
export function resolveGifVideo(src: string): { webm: string; poster: string } & Dim {
  const gif = GIFS[src];
  if (!gif) throw new Error(`resolveGifVideo: no gifs[] entry for ${src}`);
  return { webm: gif.webm, poster: gif.poster, w: gif.w, h: gif.h };
}

export function hasGifVideo(src: string): boolean {
  return src.toLowerCase().endsWith('.gif') && !!GIFS[src];
}

export interface ResolvedVideo extends Dim {
  poster: string | null;
}

export function resolveVideo(src: string): ResolvedVideo {
  const poster = POSTERS[src];
  if (poster) return { poster: poster.src, w: poster.w, h: poster.h };
  const fb = FALLBACK_VIDEOS[src];
  if (fb) return { poster: fb.poster, w: fb.w, h: fb.h };
  return { poster: null, w: UNKNOWN_DIM.w, h: UNKNOWN_DIM.h };
}
