'use client';

import { useEffect } from 'react';
import { stagger, useAnimate, useInView } from 'motion/react';

type Options = {
  /** Which descendants to reveal. Distinct per component so nested scopes
   *  (the transcript inside the hero panel) never drive each other's rows. */
  selector: string;
  amount?: number;
  startDelay?: number;
  each?: number;
};

/**
 * Reveals a scope's rows once, staggered, when it scrolls into view.
 *
 * Imperative on purpose, and the reason is worth keeping. The declarative form
 * — `initial={false}` with a conditional `animate` prop — does not work against
 * a CSS-supplied start state. With no target at mount Motion registers nothing,
 * and when `animate` later becomes an object it never writes a style: verified
 * with the element sitting in the viewport and `getAttribute('style')` still
 * null, leaving every row stuck at the `opacity: 0` the `.anim-ready` gate gave
 * it. Permanently invisible content is a worse failure than no animation.
 *
 * Running it from an effect also keeps the whole mechanism out of render, so
 * there is no SSR'd inline style and no hydration surface — the markup a
 * crawler or a no-JS visitor receives is exactly the visible content.
 *
 * Keyframes are explicit (`[0, 1]`, not a bare `1`) so Motion never has to
 * infer a start value by decomposing a computed transform matrix.
 */
export function useStaggerReveal({
  selector,
  amount = 0.3,
  startDelay = 0.1,
  each = 0.09,
}: Options) {
  const [scope, animate] = useAnimate<HTMLDivElement>();
  const inView = useInView(scope, { once: true, amount });

  useEffect(() => {
    const root = scope.current;
    if (!inView || !root) return;

    // Without `.anim-ready` the CSS never hid these: the visitor either has
    // reduced motion on or has no JS-driven animation layer at all. The rows
    // are already visible and must stay that way.
    if (!document.documentElement.classList.contains('anim-ready')) return;

    const targets = root.querySelectorAll(selector);
    if (!targets.length) return;

    animate(
      targets,
      { opacity: [0, 1], y: [10, 0] },
      {
        duration: 0.45,
        delay: stagger(each, { startDelay }),
        ease: [0.16, 1, 0.3, 1],
      },
    );
  }, [inView, animate, scope, selector, each, startDelay]);

  return scope;
}

export default useStaggerReveal;
