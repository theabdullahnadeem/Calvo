'use client';

import type { animate, createTimeline, stagger, svg, utils } from 'animejs';

export type AnimeBundle = {
  animate: typeof animate;
  createTimeline: typeof createTimeline;
  stagger: typeof stagger;
  svg: typeof svg;
  utils: typeof utils;
};

let loader: Promise<AnimeBundle> | null = null;

/**
 * Anime.js is loaded on demand and memoised, exactly like `lib/gsap.ts`.
 *
 * Two engines now run on this site and the split is deliberate, not accidental:
 * GSAP owns anything bound to scroll position (ScrollTrigger pins the
 * How-it-works track and drives every section reveal), while Anime.js owns
 * self-contained timelines that play on their own clock — the transcript
 * typing sequence, the SVG call-flow draw, the waveform.
 *
 * Nothing above the fold waits on this. The hero's load-in is still pure CSS,
 * and every caller here is gated behind an IntersectionObserver or a
 * post-hydration effect, so the download happens after first paint. Keeping it
 * off the critical path is what protects the Lighthouse >= 85 requirement in
 * 02-design-brief.md that the third engine otherwise threatens.
 */
export function loadAnime(): Promise<AnimeBundle> {
  if (!loader) {
    loader = import('animejs').then((m) => ({
      animate: m.animate,
      createTimeline: m.createTimeline,
      stagger: m.stagger,
      svg: m.svg,
      utils: m.utils,
    }));
  }
  return loader;
}
