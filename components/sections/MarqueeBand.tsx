'use client';

import { sections } from '@/lib/content';
import Marquee from '@/components/motion/Marquee';

/**
 * Full-bleed band between the explanatory middle of the page and the proof.
 *
 * It exists to break the rhythm — every section around it is a block of type on
 * a static surface, and this one moves with the scroll. Short claims already
 * made in full elsewhere, so nothing depends on reading it.
 */
export function MarqueeBand() {
  return (
    <div
      data-surface="ink"
      className="surface-ink overflow-hidden border-y border-[var(--line)] py-7 sm:py-9"
    >
      <Marquee
        items={sections.marquee.items}
        className="font-display text-[clamp(1.6rem,4.2vw,3.4rem)] font-medium tracking-display"
      />
    </div>
  );
}

export default MarqueeBand;
