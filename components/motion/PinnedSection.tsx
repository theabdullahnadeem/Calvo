'use client';

import { useRef, type ReactNode } from 'react';
import type { GsapBundle } from '@/lib/gsap';
import { useGsapContext } from './useGsapContext';

type BuildArgs = GsapBundle & {
  /** Scrubbed timeline already wired to the pin. Add tweens at 0–1 progress. */
  tl: gsap.core.Timeline;
  scope: HTMLElement;
};

type PinnedSectionProps = {
  children: ReactNode;
  className?: string;
  id?: string;
  /** Pin length in viewport heights. 3 means "scroll three screens while held". */
  distance?: number;
  /**
   * Pinning is skipped below this width. Pinned scroll-jacking on a phone
   * fights the browser's own URL-bar behaviour and reads as broken; small
   * screens get the plain stacked layout instead.
   */
  pinAbove?: number;
  /** Build the scrubbed timeline. Only called when the section actually pins. */
  build: (args: BuildArgs) => void;
  as?: 'section' | 'div';
  'aria-labelledby'?: string;
  /** Read by Header to re-theme itself against the surface beneath it. */
  'data-surface'?: 'ink' | 'paper';
};

/**
 * Pin-and-scrub container for k72-style held sequences.
 *
 * Three states, all of which must show the same content:
 *   1. pinned + scrubbed  — desktop, motion allowed
 *   2. plain stacked      — narrow screens (below `pinAbove`)
 *   3. plain stacked      — reduced motion or no JS, since useGsapContext
 *                           never runs and the layout is authored unpinned
 *
 * Consumers must therefore author children so the *unanimated* layout is the
 * readable one, and let `build` transform it. That is what makes the
 * reduced-motion fallback in 05-animation-spec.md real rather than cosmetic.
 */
export function PinnedSection({
  children,
  className,
  id,
  distance = 3,
  pinAbove = 768,
  build,
  as: Tag = 'section',
  ...rest
}: PinnedSectionProps) {
  const ref = useRef<HTMLElement | null>(null);

  useGsapContext(
    ref,
    (bundle, scope) => {
      const { gsap } = bundle;
      const mm = gsap.matchMedia();

      mm.add(`(min-width: ${pinAbove}px)`, () => {
        const tl = gsap.timeline({
          defaults: { ease: 'none' },
          scrollTrigger: {
            trigger: scope,
            start: 'top top',
            end: () => `+=${window.innerHeight * distance}`,
            pin: true,
            pinSpacing: true,
            scrub: 0.6,
            anticipatePin: 1,
            invalidateOnRefresh: true,
          },
        });

        build({ ...bundle, tl, scope });
      });

      // Below the pin threshold the timeline never runs — so anything the
      // markup pre-hid for it has to be revealed here instead. Without this,
      // narrow viewports would show an empty section. The primitive owns this
      // guarantee so no consumer can forget it.
      mm.add(`(max-width: ${pinAbove - 1}px)`, () => {
        const wordGroups = scope.querySelectorAll('[data-word-reveal]');
        const hidden = scope.querySelectorAll(
          '[data-reveal], [data-word-reveal] .word-inner',
        );
        if (!hidden.length) return;

        gsap.to(hidden, {
          opacity: 1,
          yPercent: 0,
          y: 0,
          duration: 0.8,
          stagger: 0.06,
          ease: 'power3.out',
          // Both attributes have to go before the inline styles are cleared.
          // The hidden state is two CSS rules — one keyed on [data-reveal], one
          // on [data-word-reveal] .word-inner — and clearing props while either
          // still matches hands the element straight back to the rule that hid
          // it, leaving a headline clipped to slivers inside its own masks.
          onComplete: () => {
            hidden.forEach((el) => el.removeAttribute('data-reveal'));
            wordGroups.forEach((el) => el.removeAttribute('data-word-reveal'));
            gsap.set(hidden, { clearProps: 'opacity,transform' });
          },
          scrollTrigger: { trigger: scope, start: 'top 80%', once: true },
        });
      });

      // Deliberately no `return () => mm.revert()`.
      //
      // A matchMedia created inside a gsap.context is registered with that
      // context and reverted by it. Reverting it here as well unwound the pin
      // twice: the first pass moved the section back out of ScrollTrigger's
      // pin-spacer, the second tried to unwrap a spacer that was already gone.
      // React then failed to unmount the route with "removeChild: the node to
      // be removed is not a child of this node", and every client-side
      // navigation to an industry page rendered an empty document.
    },
    [distance, pinAbove],
  );

  return (
    <Tag
      ref={ref as React.Ref<HTMLElement & HTMLDivElement>}
      id={id}
      className={className}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export default PinnedSection;
