'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { brand, site } from '@/lib/content';
import Logo from '@/components/ui/Logo';

const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/**
 * How long the counter takes to reach 100.
 *
 * Kept deliberately short. The hero headline is the LCP element, and it cannot
 * paint until the curtain lifts — every millisecond here lands directly on
 * Largest Contentful Paint. 05-animation-spec.md caps the whole load sequence at
 * a second for the same reason from the other direction: nobody should wait to
 * find out what Calvo does.
 */
const COUNT_MS = 620;
/** Longest we will wait for `window.load` after the count finishes. */
const LOAD_GRACE_MS = 400;
/** Time for the column curtain to clear before the loader leaves the DOM. */
const WIPE_MS = 1000;

/**
 * First-load sequence.
 *
 * Rendered in the server HTML rather than mounted on the client, so it covers
 * the page from the very first paint instead of flashing in after hydration.
 * CSS decides whether it is ever seen:
 *   - no `anim-ready` (reduced motion, or JS off) → never displayed
 *   - `intro-seen` (already visited this session) → never displayed
 * so it costs nothing for the people the spec says should skip it.
 *
 * Deliberately runs on CSS transitions plus one rAF loop instead of GSAP. The
 * loader is the first thing painted; putting the animation library on that
 * critical path would trade the Lighthouse budget in 03-tech-stack.md for a
 * curtain, and the curtain does not need a tween engine. GSAP stays where it
 * earns its weight — the scroll and 3D work.
 *
 * Content underneath is real DOM the whole time: this hides nothing from
 * crawlers and delays nothing for assistive tech, which skips it via aria-hidden.
 */
export function Preloader() {
  const [gone, setGone] = useState(false);
  const numberRef = useRef<HTMLSpanElement>(null);

  useIsomorphicLayoutEffect(() => {
    const root = document.documentElement;

    // React is alive, so this component owns the curtain from here. The inline
    // bootstrap's fail-safe was only there to cover the case where it isn't.
    const failsafe = (window as unknown as { __calvoIntroFailsafe?: number })
      .__calvoIntroFailsafe;
    if (failsafe) window.clearTimeout(failsafe);

    // Not shown at all in these states — leave immediately so it never lingers
    // in the tree as an invisible fixed layer.
    if (
      !root.classList.contains('anim-ready') ||
      root.classList.contains('intro-seen')
    ) {
      root.classList.add('intro-done');
      setGone(true);
      return;
    }

    // Dev affordance: `?holdLoader=1` freezes the curtain so the sequence can
    // be inspected. It lasts under a second by design, which makes it otherwise
    // impossible to review in a screenshot. Stripped from production builds.
    if (
      process.env.NODE_ENV !== 'production' &&
      new URLSearchParams(window.location.search).has('holdLoader')
    ) {
      if (numberRef.current) numberRef.current.textContent = '073';
      return;
    }

    let raf = 0;
    let removeTimer = 0;
    let graceTimer = 0;
    let settled = false;
    const started = performance.now();

    const finish = () => {
      if (settled) return;
      settled = true;
      root.classList.add('intro-done');
      removeTimer = window.setTimeout(() => setGone(true), WIPE_MS);
    };

    // Hold the curtain until the document is actually done, but never longer
    // than the grace window — a slow third-party request must not strand the
    // visitor behind a loading screen.
    const waitForLoad = () => {
      if (document.readyState === 'complete') {
        finish();
        return;
      }
      window.addEventListener('load', finish, { once: true });
      graceTimer = window.setTimeout(finish, LOAD_GRACE_MS);
    };

    const tick = (now: number) => {
      const t = Math.min(1, (now - started) / COUNT_MS);
      const eased = 1 - Math.pow(1 - t, 3);
      if (numberRef.current) {
        numberRef.current.textContent = String(Math.round(eased * 100)).padStart(
          3,
          '0',
        );
      }
      if (t < 1) raf = requestAnimationFrame(tick);
      else waitForLoad();
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(removeTimer);
      window.clearTimeout(graceTimer);
      window.removeEventListener('load', finish);
    };
  }, []);

  if (gone) return null;

  return (
    <div className="loader" aria-hidden="true">
      <div className="loader-cols">
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>

      <div className="loader-in">
        <Logo href={false} size="md" className="loader-logo" />

        <div>
          <div className="flex items-end justify-between gap-6">
            <span className="loader-num" ref={numberRef}>
              000
            </span>
            <span className="loader-label">{site.sections.hero.eyebrow}</span>
          </div>
          <div className="loader-bar">
            <i />
          </div>
          <span className="sr-only">Loading {brand.name}</span>
        </div>
      </div>
    </div>
  );
}

export default Preloader;
