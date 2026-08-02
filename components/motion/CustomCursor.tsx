'use client';

import { useEffect, useRef } from 'react';
import { isAnimReady, loadGsap } from '@/lib/gsap';

/**
 * Cursor treatment, k72 side of the reference.
 *
 * A small filled dot that tracks precisely, and a ring that trails behind it and
 * swells over anything interactive. Kept restrained per 05-animation-spec.md —
 * a subtle scale and colour shift, not a large custom graphic that replaces the
 * pointer and makes the site harder to use.
 *
 * `mix-blend-mode: difference` means one cursor works on both the ink and paper
 * surfaces without being re-themed per section.
 *
 * Never rendered for coarse pointers (there is no cursor to replace) or when
 * motion is reduced.
 */
export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAnimReady()) return;
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    let cancelled = false;
    let cleanup: (() => void) | undefined;

    loadGsap().then(({ gsap }) => {
      if (cancelled || !dotRef.current || !ringRef.current) return;

      const dot = dotRef.current;
      const ring = ringRef.current;
      gsap.set([dot, ring], { xPercent: -50, yPercent: -50, opacity: 0 });

      // quickTo gives each layer its own follow rate — the dot is nearly
      // instant, the ring lags, and that difference is what reads as weight.
      const dotX = gsap.quickTo(dot, 'x', { duration: 0.12, ease: 'power3' });
      const dotY = gsap.quickTo(dot, 'y', { duration: 0.12, ease: 'power3' });
      const ringX = gsap.quickTo(ring, 'x', { duration: 0.5, ease: 'power3' });
      const ringY = gsap.quickTo(ring, 'y', { duration: 0.5, ease: 'power3' });

      let shown = false;
      const onMove = (e: PointerEvent) => {
        if (!shown) {
          shown = true;
          gsap.to([dot, ring], { opacity: 1, duration: 0.3 });
        }
        dotX(e.clientX);
        dotY(e.clientY);
        ringX(e.clientX);
        ringY(e.clientY);
      };

      const INTERACTIVE = 'a, button, [role="button"], input, summary';
      const onOver = (e: PointerEvent) => {
        const hit = (e.target as HTMLElement | null)?.closest?.(INTERACTIVE);
        gsap.to(ring, {
          scale: hit ? 2.1 : 1,
          borderColor: hit
            ? 'rgba(255,255,255,1)'
            : 'rgba(255,255,255,0.55)',
          duration: 0.35,
          ease: 'power3.out',
        });
      };

      const onLeave = () => {
        shown = false;
        gsap.to([dot, ring], { opacity: 0, duration: 0.2 });
      };

      window.addEventListener('pointermove', onMove, { passive: true });
      window.addEventListener('pointerover', onOver, { passive: true });
      document.addEventListener('pointerleave', onLeave);

      cleanup = () => {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerover', onOver);
        document.removeEventListener('pointerleave', onLeave);
        gsap.killTweensOf([dot, ring]);
      };
    });

    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, []);

  return (
    <div aria-hidden="true">
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </div>
  );
}

export default CustomCursor;
