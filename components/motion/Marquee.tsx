'use client';

import { useRef } from 'react';
import { useGsapContext } from './useGsapContext';

type MarqueeProps = {
  items: string[];
  className?: string;
  /** Baseline drift, in px per second. */
  speed?: number;
  /** Separator glyph between items. */
  separator?: string;
};

const COPIES = 3;

/**
 * Velocity-reactive marquee band.
 *
 * The band always drifts, but scrolling drives it: scroll down and it surges,
 * scroll up and it runs backwards, then it eases back to its baseline. That
 * coupling is the point — it turns the scroll wheel into a control surface,
 * which is the k72 trick that makes a page feel like it is responding to you
 * rather than playing at you.
 *
 * Three copies of the row wrapped with `gsap.utils.wrap`, so the loop is
 * seamless in both directions with no re-measuring per frame.
 *
 * Decorative: the words repeat claims made in full elsewhere on the page, so the
 * band is hidden from assistive tech rather than read out on a loop.
 */
export function Marquee({
  items,
  className = '',
  speed = 55,
  separator = '—',
}: MarqueeProps) {
  const ref = useRef<HTMLDivElement | null>(null);

  useGsapContext(
    ref,
    ({ gsap, ScrollTrigger }, scope) => {
      const rows = gsap.utils.toArray<HTMLElement>(
        scope.querySelectorAll('[data-marquee-row]'),
      );
      if (!rows.length) return;

      const rowWidth = rows[0].offsetWidth;
      if (!rowWidth) return;

      gsap.set(rows, { x: (i: number) => i * rowWidth });
      const wrap = gsap.utils.wrap(-rowWidth, rowWidth * (rows.length - 1));

      let direction = 1;
      let boost = 1;

      const tick = (_time: number, deltaTime: number) => {
        const step = (speed * boost * direction * deltaTime) / 1000;
        rows.forEach((row) => {
          const x = gsap.getProperty(row, 'x') as number;
          gsap.set(row, { x: wrap(x - step) });
        });
        // Decay back to the baseline so the surge reads as a reaction, not a
        // permanent speed change.
        boost += (1 - boost) * 0.045;
      };

      gsap.ticker.add(tick);

      const trigger = ScrollTrigger.create({
        trigger: scope,
        start: 'top bottom',
        end: 'bottom top',
        onUpdate: (self) => {
          const v = self.getVelocity();
          if (v !== 0) direction = v < 0 ? -1 : 1;
          boost = Math.min(7, Math.max(boost, 1 + Math.abs(v) / 700));
        },
      });

      return () => {
        gsap.ticker.remove(tick);
        trigger.kill();
      };
    },
    [speed],
  );

  const content = items.map((item) => (
    <span key={item} className="flex items-center">
      <span className="px-[0.5em]">{item}</span>
      <span className="text-[var(--accent-fg)]">{separator}</span>
    </span>
  ));

  return (
    <div
      ref={ref}
      className={`relative overflow-hidden ${className}`}
      aria-hidden="true"
    >
      {/* Invisible copy gives the band its height without a magic number. */}
      <span className="flex items-center whitespace-nowrap opacity-0">
        {content}
      </span>

      {Array.from({ length: COPIES }, (_, i) => (
        <span
          key={i}
          data-marquee-row
          className="absolute left-0 top-0 flex flex-none items-center whitespace-nowrap will-change-transform"
        >
          {content}
        </span>
      ))}
    </div>
  );
}

export default Marquee;
