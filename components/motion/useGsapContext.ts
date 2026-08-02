'use client';

import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from 'react';
import { isAnimReady, loadGsap, type GsapBundle } from '@/lib/gsap';

/**
 * Layout effect on the client, plain effect on the server (where useLayoutEffect
 * warns and does nothing useful).
 *
 * The distinction matters for teardown, not setup. React detaches a deleted
 * subtree's DOM during the mutation phase, but passive (`useEffect`) cleanups for
 * that subtree run later — so a ScrollTrigger pin, which reparents its section
 * into a `.pin-spacer`, would still be in place when React tried to remove the
 * section from its original parent. That throws "removeChild: the node to be
 * removed is not a child of this node" and aborts the route transition, which is
 * what left every industry page rendering an empty document. Layout-effect
 * cleanup runs before the detach, so the pin is unwound in time.
 */
const useIsomorphicLayoutEffect =
  typeof window !== 'undefined' ? useLayoutEffect : useEffect;

type SetupFn = (
  bundle: GsapBundle,
  scope: HTMLElement,
) => void | (() => void);

/**
 * Scoped GSAP context with guaranteed cleanup.
 *
 * Everything animated inside `setup` is created within a `gsap.context()` bound
 * to `scopeRef`, so `ctx.revert()` on unmount removes the tweens, the inline
 * styles they wrote, and any ScrollTriggers they created. Without this, a
 * client-side route change leaves orphaned ScrollTriggers holding stale pin
 * spacers — the usual cause of "scroll breaks after navigating back".
 *
 * When the document is not animation-capable (JS-disabled is moot here, but
 * `prefers-reduced-motion: reduce` is not) `setup` never runs and GSAP is never
 * even downloaded. Content is already visible in that state — see the
 * `.anim-ready` gating in app/globals.css.
 */
export function useGsapContext(
  scopeRef: RefObject<HTMLElement | null>,
  setup: SetupFn,
  deps: unknown[] = [],
) {
  // `setup` is typically an inline closure; keeping it in a ref stops the
  // effect from re-running on every render while still calling the latest one.
  const setupRef = useRef(setup);
  setupRef.current = setup;

  useIsomorphicLayoutEffect(() => {
    const scope = scopeRef.current;
    if (!scope || !isAnimReady()) return;

    let cancelled = false;
    let ctx: ReturnType<GsapBundle['gsap']['context']> | undefined;

    loadGsap().then((bundle) => {
      if (cancelled || !scopeRef.current) return;
      ctx = bundle.gsap.context(
        // Returning a cleanup from the context callback lets a primitive tear
        // down things GSAP doesn't own (matchMedia, listeners) on revert.
        () => setupRef.current(bundle, scopeRef.current as HTMLElement),
        scopeRef.current,
      );
    });

    return () => {
      cancelled = true;
      ctx?.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}

/**
 * Reactive reduced-motion state for components that must render *differently*
 * (not just animate differently) — e.g. the proof counters, which render their
 * final value immediately instead of tweening from zero.
 *
 * Starts `false` so server and first client render agree, then corrects in an
 * effect. Because the non-animated branch is the fully-readable one, a visitor
 * with reduced motion never sees a broken intermediate state.
 */
export function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(mq.matches);

    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

/** True once the component has mounted on the client. */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}
