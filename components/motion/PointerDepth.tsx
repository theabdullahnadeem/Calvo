'use client';

import { useRef, type ReactNode } from 'react';
import { useGsapContext } from './useGsapContext';

type PointerDepthProps = {
  children: ReactNode;
  className?: string;
  /** Max tilt, in degrees, at the far edge of the container. */
  tilt?: number;
  /** Viewing distance. Lower is a more extreme perspective. */
  perspective?: number;
  /**
   * Selector for layers inside that should slide independently. Each matched
   * element takes a `data-depth` multiplier — higher moves further.
   */
  layerSelector?: string;
};

/**
 * Tilts its contents toward the pointer, and slides tagged layers by their own
 * depth.
 *
 * This is the half of "spatial UI" that scroll alone cannot deliver: the scene
 * has a viewing angle, and moving the pointer changes it. Combined with the
 * scroll-driven z-travel, the hero stops being a picture of depth and starts
 * behaving like a space.
 *
 * Pointer-only by definition, so it is skipped on touch, and skipped entirely
 * when motion is reduced (useGsapContext never runs). Rotation is small — this
 * is a parallax cue, not a toy.
 */
export function PointerDepth({
  children,
  className,
  tilt = 5,
  perspective = 1200,
  layerSelector = '[data-depth]',
}: PointerDepthProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useGsapContext(
    ref,
    ({ gsap }, scope) => {
      if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

      const stage = scope.querySelector<HTMLElement>('[data-pointer-stage]');
      if (!stage) return;

      gsap.set(stage, {
        transformPerspective: perspective,
        transformStyle: 'preserve-3d',
      });

      const rotX = gsap.quickTo(stage, 'rotationX', {
        duration: 0.9,
        ease: 'power3',
      });
      const rotY = gsap.quickTo(stage, 'rotationY', {
        duration: 0.9,
        ease: 'power3',
      });

      const layers = gsap.utils.toArray<HTMLElement>(
        scope.querySelectorAll(layerSelector),
      );
      const layerX = layers.map((el) =>
        gsap.quickTo(el, 'x', { duration: 1.1, ease: 'power3' }),
      );
      const layerY = layers.map((el) =>
        gsap.quickTo(el, 'y', { duration: 1.1, ease: 'power3' }),
      );

      const onMove = (e: PointerEvent) => {
        // -1..1 across the viewport, so the effect is consistent regardless of
        // where the section sits on screen.
        const nx = (e.clientX / window.innerWidth) * 2 - 1;
        const ny = (e.clientY / window.innerHeight) * 2 - 1;

        rotY(nx * tilt);
        rotX(-ny * tilt * 0.6);

        layers.forEach((el, i) => {
          const depth = parseFloat(el.dataset.depth || '1');
          layerX[i](-nx * depth * 26);
          layerY[i](-ny * depth * 18);
        });
      };

      window.addEventListener('pointermove', onMove, { passive: true });
      return () => window.removeEventListener('pointermove', onMove);
    },
    [tilt, perspective, layerSelector],
  );

  return (
    <div ref={ref} className={className}>
      {/* The tilt is applied to this wrapper rather than to `children`, so a
          child that already carries its own scroll-driven transform is never
          fighting this one for the same style property. */}
      <div data-pointer-stage className="h-full w-full">
        {children}
      </div>
    </div>
  );
}

export default PointerDepth;
