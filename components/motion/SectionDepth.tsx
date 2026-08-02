'use client';

import { useRef, type ReactNode } from 'react';
import { useGsapContext } from './useGsapContext';

type SectionDepthProps = {
  children: ReactNode;
  className?: string;
  /** Degrees the block tips back as it leaves the top of the viewport. */
  exitRotate?: number;
  /** Distance it travels away from the viewer on exit, in px. */
  exitZ?: number;
  /** Opacity it fades to. */
  exitOpacity?: number;
};

/**
 * Recedes its contents into depth as they scroll off the top.
 *
 * The hero already does this on its own; applying the same treatment to every
 * following block is what turns a stack of sections into one continuous space —
 * each screen tips back and travels away as the next rises through the gap it
 * leaves. It is the effect that keeps a long page feeling like it is unrolling
 * rather than paging.
 *
 * IMPORTANT: never wrap a pinned section in this. A transformed ancestor breaks
 * `position: fixed`, which is how ScrollTrigger pins, and the pin silently stops
 * working. Pinned sections carry their own depth choreography instead.
 */
export function SectionDepth({
  children,
  className,
  exitRotate = 7,
  exitZ = -420,
  exitOpacity = 0.25,
}: SectionDepthProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useGsapContext(
    ref,
    ({ gsap }, scope) => {
      const inner = scope.firstElementChild as HTMLElement | null;
      if (!inner) return;

      gsap.set(inner, {
        transformPerspective: 1500,
        transformOrigin: '50% 100%',
        force3D: true,
      });

      gsap.fromTo(
        inner,
        { rotateX: 0, z: 0, opacity: 1 },
        {
          rotateX: exitRotate,
          z: exitZ,
          opacity: exitOpacity,
          ease: 'none',
          scrollTrigger: {
            trigger: scope,
            // Only starts once the block is genuinely on its way out, so it
            // never dims content someone is still reading.
            start: 'bottom 88%',
            end: 'bottom top',
            scrub: 0.5,
            invalidateOnRefresh: true,
          },
        },
      );
    },
    [exitRotate, exitZ, exitOpacity],
  );

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}

export default SectionDepth;
