'use client';

import { useEffect } from 'react';
import { isAnimReady, loadGsap } from '@/lib/gsap';

/**
 * Lenis smooth scroll, wired into GSAP's ticker and ScrollTrigger.
 *
 * Notes on the tuning: `lerp: 0.11` with a 1.05 wheel multiplier lands close to
 * native weight. 05-animation-spec.md explicitly warns against the "molasses
 * scroll" some sites ship — this is deliberately on the quick side.
 *
 * Skipped entirely under `prefers-reduced-motion` (isAnimReady is false), which
 * also means Lenis is never downloaded for those visitors: hijacking scroll
 * inertia is exactly the kind of motion the setting is asking us not to do.
 */
export function SmoothScrollProvider() {
  useEffect(() => {
    if (!isAnimReady()) return;

    // Coarse pointers already have momentum scrolling from the OS; layering
    // Lenis on top of it fights the platform and hurts iOS Safari in particular.
    if (window.matchMedia('(pointer: coarse)').matches) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    Promise.all([import('lenis'), loadGsap()]).then(
      ([{ default: Lenis }, { gsap, ScrollTrigger }]) => {
        if (cancelled) return;

        const lenis = new Lenis({
          lerp: 0.11,
          wheelMultiplier: 1.05,
          smoothWheel: true,
          touchMultiplier: 1.6,
        });

        lenis.on('scroll', ScrollTrigger.update);

        // Lenis intercepts window.scrollTo, so anything driving the page from
        // outside (devtools, screenshot tooling, e2e) needs the instance.
        // Dev only — dead-code-eliminated from production builds.
        if (process.env.NODE_ENV !== 'production') {
          (window as unknown as { __lenis?: unknown }).__lenis = lenis;
        }

        const raf = (time: number) => lenis.raf(time * 1000);
        gsap.ticker.add(raf);
        gsap.ticker.lagSmoothing(0);

        // In-page anchors must still work with Lenis owning the scroll position.
        const onAnchorClick = (event: MouseEvent) => {
          const anchor = (event.target as HTMLElement | null)?.closest?.(
            'a[href*="#"]',
          ) as HTMLAnchorElement | null;
          if (!anchor) return;

          const url = new URL(anchor.href, window.location.href);
          if (url.pathname !== window.location.pathname || !url.hash) return;

          const target = document.querySelector(url.hash);
          if (!target) return;

          event.preventDefault();
          lenis.scrollTo(target as HTMLElement, { offset: -24 });
          // Keep the keyboard focus ring in step with the visual jump.
          (target as HTMLElement).setAttribute('tabindex', '-1');
          (target as HTMLElement).focus({ preventScroll: true });
          window.history.pushState(null, '', url.hash);
        };

        document.addEventListener('click', onAnchorClick);

        cleanup = () => {
          document.removeEventListener('click', onAnchorClick);
          gsap.ticker.remove(raf);
          lenis.destroy();
        };
      },
    );

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return null;
}

export default SmoothScrollProvider;
