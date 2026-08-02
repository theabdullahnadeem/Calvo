'use client';

import type { gsap as GsapType } from 'gsap';
import type { ScrollTrigger as ScrollTriggerType } from 'gsap/ScrollTrigger';

export type GsapBundle = {
  gsap: typeof GsapType;
  ScrollTrigger: typeof ScrollTriggerType;
};

let loader: Promise<GsapBundle> | null = null;

/**
 * GSAP + ScrollTrigger are loaded on demand, never as part of the initial
 * bundle. The hero's load-in is pure CSS (see app/globals.css), so nothing
 * above the fold waits on this — which is what makes the Lighthouse ≥ 85
 * mobile target in 03-tech-stack.md realistic alongside the animation load.
 *
 * The promise is memoised so every primitive on the page shares one download
 * and one registration.
 */
export function loadGsap(): Promise<GsapBundle> {
  if (!loader) {
    loader = Promise.all([import('gsap'), import('gsap/ScrollTrigger')]).then(
      ([gsapMod, stMod]) => {
        const gsap = gsapMod.gsap ?? gsapMod.default;
        const ScrollTrigger = stMod.ScrollTrigger ?? stMod.default;

        gsap.registerPlugin(ScrollTrigger);

        // Shared config: one place that decides how the whole site feels.
        gsap.defaults({ ease: 'power3.out', duration: 0.9 });
        ScrollTrigger.config({
          // iOS Safari fires resize on URL-bar show/hide; refreshing on that
          // causes visible jumps inside pinned sections.
          ignoreMobileResize: true,
        });

        // Dev-only handles for inspecting trigger positions from devtools.
        // Stripped from production builds.
        if (process.env.NODE_ENV !== 'production') {
          Object.assign(window as object, { gsap, ScrollTrigger });
        }

        return { gsap, ScrollTrigger };
      },
    );
  }
  return loader;
}

/** True when the visitor has asked the OS to reduce motion. */
export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * The document is flagged animation-capable by the inline bootstrap in
 * app/layout.tsx. Primitives check this rather than re-deriving it, so the
 * pre-hidden CSS state and the JS that undoes it can never disagree.
 */
export function isAnimReady(): boolean {
  if (typeof document === 'undefined') return false;
  return document.documentElement.classList.contains('anim-ready');
}
