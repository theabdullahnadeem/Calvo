'use client';

import { useRef, type CSSProperties, type ReactNode } from 'react';
import { useGsapContext } from './useGsapContext';

type ParallaxLayerProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /**
   * Drift rate. Positive values lag behind the scroll (reads as further away),
   * negative values lead it (reads as closer). Expressed as a percentage of the
   * layer's own height so it scales with the element rather than the viewport.
   */
  speed?: number;
  /**
   * Static push along the z axis, in px. Needs an ancestor with `.stage`
   * (perspective) to have any effect. This is the "spatial UI" mechanism from
   * 03-tech-stack.md — implied depth via CSS 3D, not a WebGL scene.
   */
  depth?: number;
  /** Element the scroll range is measured against. Defaults to this layer. */
  triggerSelector?: string;
  /** Scrub smoothing in seconds. Higher trails the scroll more softly. */
  scrub?: number;
};

/**
 * Depth layer. Background/midground/foreground move at different rates as the
 * section passes through the viewport, which is what makes stacked sections
 * read as a shallow 3D space instead of a flat page.
 *
 * The `depth` translateZ is applied as a plain inline style, so it survives
 * even when the scroll tween never runs (reduced motion): the spatial layering
 * is still there, it just doesn't animate.
 */
export function ParallaxLayer({
  children,
  className,
  style,
  speed = 0.15,
  depth = 0,
  triggerSelector,
  scrub = 0.5,
}: ParallaxLayerProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useGsapContext(
    ref,
    ({ gsap }, scope) => {
      const trigger = triggerSelector
        ? (scope.closest(triggerSelector) as HTMLElement | null) ??
          document.querySelector<HTMLElement>(triggerSelector)
        : scope;

      if (!trigger) return;

      const shift = speed * 100;

      gsap.fromTo(
        scope,
        { yPercent: -shift / 2 },
        {
          yPercent: shift / 2,
          ease: 'none',
          scrollTrigger: {
            trigger,
            start: 'top bottom',
            end: 'bottom top',
            scrub,
            invalidateOnRefresh: true,
          },
        },
      );
    },
    [speed, triggerSelector, scrub],
  );

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        ...(depth ? { transform: `translateZ(${depth}px)` } : null),
      }}
    >
      {children}
    </div>
  );
}

export default ParallaxLayer;
