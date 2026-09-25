/**
 * /projects index — row preview media, mega-title wdth hover, the
 * software/discipline filter bar, and view-transition tagging
 * (D-brutalist-grid.md §4.2, §5.7; Phase 4 task brief).
 *
 * Preview video: the same hover-intent (fine pointer) / inline-on-touch
 * pattern as src/scripts/home/featured-work.ts — src stays empty
 * (preload="none") until real hover intent or, on touch/<1024, until the
 * row is in view, and playback never starts under prefers-reduced-motion
 * (a `#t=0.1` metadata fragment paints one still frame instead). Preview
 * image: no loading to gate — a real <img loading="lazy"> that reveals on
 * plain CSS :hover/:focus-visible (see ProjectRows.astro).
 *
 * Mega title: on row hover (fine pointer) or keyboard focus, the title's
 * `--wdth` custom property springs from its resting 100 (--fset-title)
 * toward 122 via gsap.quickTo, then back on leave/blur — a discrete "raw"
 * width kick, distinct from kinetic.ts's scroll-scrubbed 125→75 (D §4.2/
 * §4.3 are two different motions on the same axis).
 *
 * Filters: software/discipline toggle chips (aria-pressed), OR within a
 * group, AND between groups. A filtered-out row's <li> (row + its leading
 * Rule) fades out (steps(4)) then leaves the flow; reduced motion toggles
 * `display` instantly instead, with no tween. Reset restores every row.
 * The status line announces the visible count — see ProjectFilters.astro's
 * header for why that text isn't INVENTORY-sourced.
 *
 * View Transitions (D §3.3 data-vt): the clicked row's title and preview
 * are tagged `cs-title-<slug>` / `cs-media-<slug>` right before the browser
 * navigates, so the native cross-document transition morphs them into the
 * matching case-study hero — set on the clicked row only, never statically
 * for all 7 at once.
 */
import { gsap, ScrollTrigger } from '../../motion/gsap';
import { EASE_STEP, EASE_SPRING, DUR } from '../../motion/eases';
import { setViewTransitionName } from '../../motion/transition';

const INTENT_MS = 150;

function initPreviews(): void {
  const rows = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-pi-row]'));
  if (!rows.length) return;

  const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fineMq = window.matchMedia('(min-width: 1024px) and (hover: hover) and (pointer: fine)');

  const withVideo = new Map<HTMLElement, { video: HTMLVideoElement; src: string }>();

  rows.forEach((row) => {
    const video = row.querySelector<HTMLVideoElement>('[data-pi-video]');
    const src = video?.dataset.piSrc;
    if (!video || !src) return;
    let timer = 0;
    withVideo.set(row, { video, src });

    video.addEventListener('playing', () => {
      if (fineMq.matches) row.classList.add('is-playing');
    });

    const stop = () => {
      window.clearTimeout(timer);
      row.classList.remove('is-playing');
      if (!fineMq.matches || !video.getAttribute('src')) return;
      video.pause();
      video.removeAttribute('src');
      video.load();
    };

    row.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse' || reduceMq.matches || !fineMq.matches) return;
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        video.src = src;
        void video.play().catch(() => {});
      }, INTENT_MS);
    });
    row.addEventListener('pointerleave', stop);
  });

  if (!('IntersectionObserver' in window) || !withVideo.size) return;
  const io = new IntersectionObserver(
    (entries) => {
      if (fineMq.matches) return;
      entries.forEach((entry) => {
        const item = withVideo.get(entry.target as HTMLElement);
        if (!item) return;
        const { video, src } = item;
        if (entry.isIntersecting) {
          if (!video.getAttribute('src')) {
            video.preload = 'metadata';
            video.src = `${src}#t=0.1`;
          }
          if (!reduceMq.matches) void video.play().catch(() => {});
        } else {
          video.pause();
        }
      });
    },
    { threshold: 0.5 },
  );
  withVideo.forEach((_item, row) => io.observe(row));
}

function initTitleHover(): void {
  const rows = Array.from(document.querySelectorAll<HTMLElement>('[data-pi-row]'));
  if (!rows.length) return;

  const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  const fineMq = window.matchMedia('(hover: hover) and (pointer: fine)');

  rows.forEach((row) => {
    const title = row.querySelector<HTMLElement>('[data-pi-title]');
    if (!title) return;
    const setWdth = gsap.quickTo(title, '--wdth', { duration: 0.4, ease: EASE_SPRING });

    const widen = () => {
      if (reduceMq.matches) return;
      // 112, not the display axis's full 125: a bigger jump risks a
      // one-line title wrapping to two on hover (the row has no fixed
      // block-size to pin against, unlike kinetic.ts's LCP heading).
      setWdth(112);
    };
    const rest = () => setWdth(100);

    row.addEventListener('pointerenter', (e) => {
      if (e.pointerType !== 'mouse' || !fineMq.matches) return;
      widen();
    });
    row.addEventListener('pointerleave', rest);
    row.addEventListener('focus', widen);
    row.addEventListener('blur', rest);
  });
}

function initViewTransitions(): void {
  const rows = Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-pi-row]'));
  rows.forEach((row) => {
    const slug = row.dataset.piSlug;
    if (!slug) return;
    row.addEventListener('click', () => {
      const title = row.querySelector<HTMLElement>('[data-pi-title]');
      const media = row.querySelector<HTMLElement>('.pi-row-preview');
      if (title) setViewTransitionName(title, `cs-title-${slug}`);
      if (media) setViewTransitionName(media, `cs-media-${slug}`);
    });
  });
}

interface FilterState {
  software: Set<string>;
  discipline: Set<string>;
}

function initFilters(): void {
  const bar = document.querySelector<HTMLElement>('[data-pi-filters]');
  const rows = Array.from(document.querySelectorAll<HTMLElement>('[data-pi-row]'));
  if (!bar || !rows.length) return;

  const chips = Array.from(bar.querySelectorAll<HTMLButtonElement>('[data-pi-chip]'));
  const resetBtn = bar.querySelector<HTMLButtonElement>('[data-pi-reset]');
  const status = bar.querySelector<HTMLElement>('[data-pi-status]');
  const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');

  const state: FilterState = { software: new Set(), discipline: new Set() };

  const rowData = rows.map((row) => ({
    li: (row.closest('li') ?? row) as HTMLElement,
    software: JSON.parse(row.dataset.piSoftware ?? '[]') as string[],
    discipline: JSON.parse(row.dataset.piDisciplines ?? '[]') as string[],
  }));

  function matches(item: (typeof rowData)[number]): boolean {
    const swOk = state.software.size === 0 || item.software.some((s) => state.software.has(s));
    const discOk = state.discipline.size === 0 || item.discipline.some((d) => state.discipline.has(d));
    return swOk && discOk;
  }

  function announce(count: number): void {
    if (!status) return;
    status.textContent = `${count} of ${rowData.length} case ${rowData.length === 1 ? 'study' : 'studies'} shown`;
  }

  // Filtering changes the page height, so the grid-line master trigger's
  // cached rule/frame tops (src/motion/lines.ts) and the reveal batches go
  // stale: refresh once the reflow has settled (debounced across quick
  // chip toggles, never inside a scroll path).
  let refreshTimer = 0;
  const scheduleRefresh = (delayMs: number) => {
    window.clearTimeout(refreshTimer);
    refreshTimer = window.setTimeout(() => ScrollTrigger.refresh(), delayMs);
  };

  function apply(): void {
    let visible = 0;
    const instant = reduceMq.matches;
    rowData.forEach((item) => {
      const show = matches(item);
      if (show) visible += 1;
      const el = item.li;
      const isHidden = el.classList.contains('is-filtered-out');
      if (show === !isHidden) return;

      // A quick re-toggle must cancel a pending hide, or its onComplete
      // would set display:none on a row that is meant to be visible.
      gsap.killTweensOf(el);

      if (instant) {
        el.classList.toggle('is-filtered-out', !show);
        el.style.display = show ? '' : 'none';
        return;
      }

      if (show) {
        el.classList.remove('is-filtered-out');
        el.style.removeProperty('display');
        gsap.fromTo(el, { opacity: 0 }, { opacity: 1, duration: DUR.reveal, ease: EASE_STEP });
      } else {
        el.classList.add('is-filtered-out');
        gsap.to(el, {
          opacity: 0,
          duration: DUR.reveal,
          ease: EASE_STEP,
          onComplete: () => {
            el.style.display = 'none';
          },
        });
      }
    });
    announce(visible);
    scheduleRefresh(instant ? 0 : DUR.reveal * 1000 + 50);
  }

  chips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const group = chip.dataset.filterGroup as keyof FilterState | undefined;
      const value = chip.dataset.value;
      if (!group || !value) return;
      const set = state[group];
      const pressed = chip.getAttribute('aria-pressed') === 'true';
      if (pressed) {
        set.delete(value);
        chip.setAttribute('aria-pressed', 'false');
      } else {
        set.add(value);
        chip.setAttribute('aria-pressed', 'true');
      }
      apply();
    });
  });

  resetBtn?.addEventListener('click', () => {
    state.software.clear();
    state.discipline.clear();
    chips.forEach((chip) => chip.setAttribute('aria-pressed', 'false'));
    apply();
  });
}

let initialized = false;

export function initProjectsIndex(): void {
  if (initialized) return;
  initialized = true;
  initPreviews();
  initTitleHover();
  initViewTransitions();
  initFilters();
}
