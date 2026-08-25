'use client';

import { useEffect, useRef } from 'react';
import { loadAnime } from '@/lib/anime';
import { isAnimReady } from '@/lib/gsap';

type WaveformProps = {
  bars?: number;
  className?: string;
  /** Paused bars sit at their resting height — used for calls not on audio. */
  active?: boolean;
};

/**
 * Audio-level bars for a call that is currently connected.
 *
 * Anime.js rather than GSAP by design: this is a self-contained loop on its own
 * clock with a per-bar stagger, which is exactly what `stagger()` is for, and it
 * has no relationship to scroll position. GSAP stays the engine for anything
 * ScrollTrigger drives.
 *
 * The heights are a fixed pseudo-random series, not `Math.random()`, so the
 * server and client render identical markup and React does not warn about a
 * hydration mismatch.
 */
const RESTING = [0.35, 0.6, 0.28, 0.82, 0.45, 0.7, 0.32, 0.55, 0.9, 0.4, 0.66, 0.3];

export function Waveform({ bars = 12, className, active = true }: WaveformProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!active || !isAnimReady() || !ref.current) return;

    const scope = ref.current;
    let cleanup: (() => void) | undefined;
    let cancelled = false;

    loadAnime().then(({ animate, stagger }) => {
      if (cancelled) return;
      const targets = scope.querySelectorAll<HTMLElement>('[data-bar]');
      if (!targets.length) return;

      const animation = animate(targets, {
        scaleY: [
          { to: 0.25, duration: 0 },
          { to: 1, duration: 460 },
          { to: 0.4, duration: 520 },
        ],
        ease: 'inOutSine',
        loop: true,
        alternate: true,
        delay: stagger(70, { from: 'center' }),
      });

      cleanup = () => animation.revert();
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [active]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className={['flex h-6 items-center gap-[3px]', className ?? ''].join(' ')}
    >
      {Array.from({ length: bars }, (_, i) => (
        <span
          key={i}
          data-bar
          style={{
            height: `${Math.round(RESTING[i % RESTING.length] * 100)}%`,
            transformOrigin: 'center',
          }}
          className={[
            'w-[3px] flex-none rounded-full',
            active ? 'bg-[var(--accent-fg)]' : 'bg-[var(--line)]',
          ].join(' ')}
        />
      ))}
    </div>
  );
}

export default Waveform;
