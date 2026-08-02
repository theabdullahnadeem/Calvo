'use client';

import {
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactNode,
} from 'react';
import { useGsapContext } from './useGsapContext';

type ScrollRevealProps = {
  children: ReactNode;
  /** Rendered element. Defaults to a div — pass `as="ul"` etc. to keep semantics. */
  as?: ElementType;
  className?: string;
  style?: CSSProperties;
  /**
   * Selector for descendants to reveal in sequence. Omit to reveal this
   * element itself. Matched elements must carry `data-reveal` in the markup so
   * their hidden start state is applied by CSS before hydration — otherwise
   * they flash visible and then jump.
   */
  selector?: string;
  /** Travel distance in px. 0 gives a pure opacity fade. */
  y?: number;
  /** Depth to rise from, in px. Non-zero switches the reveal into CSS 3D. */
  z?: number;
  /** Tip back on the X axis, in degrees. Non-zero switches into CSS 3D. */
  rotateX?: number;
  /**
   * Swing on the Y axis, in degrees. Non-zero switches into CSS 3D.
   * Accepts GSAP's function form so staggered targets can differ — used to open
   * alternating grid columns from opposite sides. When a function is passed, the
   * matching CSS start state must be set per element via `--reveal-ry`.
   */
  rotateY?: number | ((index: number, target: Element) => number);
  /** Viewing distance for the 3D reveal. Lower is a more extreme perspective. */
  perspective?: number;
  stagger?: number;
  delay?: number;
  duration?: number;
  /** ScrollTrigger start. Default fires a little before the element is centred. */
  start?: string;
  id?: string;
};

/**
 * The workhorse reveal: content rises and fades as it enters view, optionally
 * arriving through depth.
 *
 * The 3D mode is the mechanism 03-tech-stack.md specifies — real CSS 3D
 * transforms with GSAP driving the values. Perspective is applied per element
 * via GSAP's `transformPerspective` rather than as `perspective` on a shared
 * ancestor, which deliberately avoids nested `preserve-3d` contexts: those are
 * the documented Safari failure case the same doc warns about, and sidestepping
 * them entirely is cheaper than testing around them.
 *
 * Runs `once` — the reveal is an entrance, not an ambient effect, and
 * non-reversing triggers are cheaper (03-tech-stack.md perf requirement).
 */
export function ScrollReveal({
  children,
  as: Tag = 'div',
  className,
  style,
  selector,
  y = 24,
  z = 0,
  rotateX = 0,
  rotateY = 0,
  perspective = 1000,
  stagger = 0.09,
  delay = 0,
  duration = 0.85,
  start = 'top 82%',
  id,
}: ScrollRevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const is3d =
    z !== 0 || rotateX !== 0 || typeof rotateY === 'function' || rotateY !== 0;

  useGsapContext(
    ref,
    ({ gsap }, scope) => {
      const targets: Element[] = selector
        ? Array.from(scope.querySelectorAll(selector))
        : [scope];

      if (!targets.length) return;

      const clearHiddenState = () => {
        targets.forEach((t) => t.removeAttribute('data-reveal'));
        gsap.set(targets, { clearProps: 'opacity,transform' });
      };

      // fromTo, not to: the start state is written by CSS, and getComputedStyle
      // hands GSAP a flattened matrix rather than the individual rotate/translate
      // values. Declaring both ends keeps GSAP authoritative over every channel.
      gsap.fromTo(
        targets,
        {
          opacity: 0,
          y,
          z,
          rotateX,
          rotateY,
          transformPerspective: is3d ? perspective : 0,
        },
        {
          opacity: 1,
          y: 0,
          z: 0,
          rotateX: 0,
          rotateY: 0,
          transformPerspective: is3d ? perspective : 0,
          duration,
          delay,
          stagger: selector ? stagger : 0,
          ease: 'power3.out',
          // The hidden start state comes from a CSS rule keyed on [data-reveal].
          // Clearing the inline styles without also dropping that attribute hands
          // the element straight back to the rule that hid it, and it vanishes the
          // frame after it finishes arriving. Drop the attribute first, then clear
          // — both in the same callback, so nothing paints in between.
          onComplete: clearHiddenState,
          scrollTrigger: {
            trigger: scope,
            start,
            once: true,
          },
        },
      );
    },
    // Intentionally narrow. The motion values are authored per usage and never
    // change at runtime, while `rotateY` may be an inline function whose
    // identity changes every render — including it would rebuild the timeline
    // on every parent re-render for no benefit. The setup closure is always the
    // latest one (see useGsapContext), so a changed value still applies on the
    // next genuine remount.
    [selector, start],
  );

  const selfRevealProps = selector
    ? {}
    : {
        'data-reveal': is3d ? '3d' : y === 0 ? 'fade' : 'up',
      };

  const revealVars = {
    ['--reveal-y' as string]: `${y}px`,
    ...(is3d
      ? {
          ['--reveal-z' as string]: `${z}px`,
          ['--reveal-rx' as string]: `${rotateX}deg`,
          ['--reveal-ry' as string]: `${rotateY}deg`,
          ['--reveal-persp' as string]: `${perspective}px`,
        }
      : null),
  } as CSSProperties;

  return (
    <Tag
      ref={ref as React.Ref<HTMLElement>}
      id={id}
      className={className}
      style={{ ...style, ...revealVars }}
      {...selfRevealProps}
    >
      {children}
    </Tag>
  );
}

export default ScrollReveal;
