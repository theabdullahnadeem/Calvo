'use client';

import { useLayoutEffect, useRef } from 'react';
import { isAnimReady } from '@/lib/gsap';
import { useGsapContext } from './useGsapContext';

type CountUpProps = {
  from: number;
  to: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
  className?: string;
};

const format = (value: number, prefix = '', suffix = '') =>
  `${prefix}${Math.round(value)}${suffix}`;

/**
 * Number tween for the proof stats.
 *
 * Server-renders the *final* value, so the real figure is in the initial HTML
 * for crawlers and is what reduced-motion visitors see — per
 * 05-animation-spec.md, they get the number, not a tween starting at zero.
 *
 * When motion is allowed, a layout effect rewinds the text to the start value
 * before the browser paints the hydrated frame, and the tween runs on scroll-in.
 */
export function CountUp({
  from,
  to,
  prefix = '',
  suffix = '',
  duration = 1.6,
  className,
}: CountUpProps) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useLayoutEffect(() => {
    if (!isAnimReady() || !ref.current) return;
    ref.current.textContent = format(from, prefix, suffix);
  }, [from, prefix, suffix]);

  useGsapContext(
    ref,
    ({ gsap }, scope) => {
      const counter = { value: from };

      gsap.to(counter, {
        value: to,
        duration,
        ease: 'power2.out',
        snap: { value: 1 },
        onUpdate: () => {
          scope.textContent = format(counter.value, prefix, suffix);
        },
        scrollTrigger: {
          trigger: scope,
          start: 'top 85%',
          once: true,
        },
      });
    },
    [from, to, prefix, suffix, duration],
  );

  return (
    <span ref={ref} className={className}>
      {format(to, prefix, suffix)}
    </span>
  );
}

export default CountUp;
