'use client';

import { useEffect, type ReactNode } from 'react';
import { useAnimate, useInView } from 'motion/react';

/**
 * Draws a strike across a "before" figure as it scrolls in.
 *
 * The proof stat already counted 32 -> 5; this is what makes it read as a
 * transition rather than two unrelated numbers. The rule is drawn left to
 * right, timed to land while the counter beside it is still moving.
 *
 * Same visibility contract as the rest of the site: the undrawn start state
 * lives in the `.anim-ready [data-strike]` rule in globals.css, so a crawler, a
 * no-JS visitor and a reduced-motion visitor all get the line already drawn and
 * the before/after comparison never depends on the animation running.
 *
 * Driven imperatively for the same reason as the dashboard rows — see
 * components/dashboard/useStaggerReveal.ts. A declarative `animate` prop that
 * starts undefined never writes a style, which would leave the rule at
 * scaleX(0) forever and silently delete the "before" figure's strike.
 */
export function StrikeThrough({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const [scope, animate] = useAnimate<HTMLSpanElement>();
  const inView = useInView(scope, { once: true, amount: 0.6 });

  useEffect(() => {
    const root = scope.current;
    if (!inView || !root) return;
    if (!document.documentElement.classList.contains('anim-ready')) return;

    const line = root.querySelector('[data-strike]');
    if (!line) return;

    animate(
      line,
      { scaleX: [0, 1] },
      { duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] },
    );
  }, [inView, animate, scope]);

  return (
    <span
      ref={scope}
      className={['relative inline-block', className ?? ''].join(' ')}
    >
      {children}
      {/* Positioned with `top`, not a translate: the animation owns the
          `transform` property here, so a Tailwind translate utility would be
          overwritten the moment the scaleX tween starts. */}
      <span
        aria-hidden="true"
        data-strike
        className="absolute left-0 top-[calc(50%-1px)] h-[2px] w-full origin-left rounded-full bg-current"
      />
    </span>
  );
}

export default StrikeThrough;
