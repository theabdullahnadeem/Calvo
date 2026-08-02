'use client';

import { useRef, type ReactNode } from 'react';
import { useGsapContext } from './useGsapContext';

type MagneticProps = {
  children: ReactNode;
  className?: string;
  /** How far the element travels toward the pointer, as a share of the offset. */
  strength?: number;
  /** Pointer distance, in px beyond the element's bounds, that starts the pull. */
  radius?: number;
};

/**
 * Pulls its child toward the pointer as the pointer approaches.
 *
 * The k72 lineage's most useful micro-interaction: it makes a target feel like
 * it wants to be clicked, and it genuinely helps aim because the button moves
 * to meet the cursor. Applied only to primary CTAs — used on everything it
 * becomes noise.
 *
 * Inner content moves at a fraction of the wrapper's travel, so the label
 * appears to lag slightly inside the button rather than the whole thing sliding
 * rigidly. Snaps home on leave.
 */
export function Magnetic({
  children,
  className,
  strength = 0.32,
  radius = 90,
}: MagneticProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useGsapContext(
    ref,
    ({ gsap }, scope) => {
      // Pointer-driven, so it is meaningless without a real pointer.
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

      const inner = scope.firstElementChild as HTMLElement | null;
      const moveX = gsap.quickTo(scope, 'x', { duration: 0.5, ease: 'power3' });
      const moveY = gsap.quickTo(scope, 'y', { duration: 0.5, ease: 'power3' });
      const innerX = inner
        ? gsap.quickTo(inner, 'x', { duration: 0.7, ease: 'power3' })
        : null;
      const innerY = inner
        ? gsap.quickTo(inner, 'y', { duration: 0.7, ease: 'power3' })
        : null;

      const onMove = (e: PointerEvent) => {
        const r = scope.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        const dx = e.clientX - cx;
        const dy = e.clientY - cy;

        const inRange =
          Math.abs(dx) < r.width / 2 + radius &&
          Math.abs(dy) < r.height / 2 + radius;

        if (inRange) {
          moveX(dx * strength);
          moveY(dy * strength);
          innerX?.(dx * strength * 0.4);
          innerY?.(dy * strength * 0.4);
        } else {
          moveX(0);
          moveY(0);
          innerX?.(0);
          innerY?.(0);
        }
      };

      window.addEventListener('pointermove', onMove, { passive: true });
      return () => window.removeEventListener('pointermove', onMove);
    },
    [strength, radius],
  );

  return (
    <div ref={ref} className={className} style={{ willChange: 'transform' }}>
      {children}
    </div>
  );
}

export default Magnetic;
