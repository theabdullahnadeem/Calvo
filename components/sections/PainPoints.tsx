'use client';

import { sections, type Vertical } from '@/lib/content';
import ScrollReveal from '@/components/motion/ScrollReveal';

/**
 * Vertical-page problem block.
 *
 * The homepage's ProblemStatement is deliberately abstract because the core
 * brand has to stay vertical-neutral. This is where the specific language is
 * allowed to live: named pain points, in that industry's own terms, on a page
 * that is explicitly about that industry (01-info.json → positioning.proofLayer).
 */
export function PainPoints({ vertical }: { vertical: Vertical }) {
  const copy = sections.verticalPages;

  return (
    <section
      id="the-problem"
      data-surface="ink"
      aria-labelledby="pain-points-heading"
      className="surface-ink py-28 sm:py-36"
    >
      <div className="shell">
        <ScrollReveal>
          <p className="eyebrow">{copy.painPointsEyebrow}</p>
          <h2
            id="pain-points-heading"
            className="mt-6 max-w-[18ch] font-display text-step-3 font-medium tracking-display"
          >
            {vertical.painPointsHeading}
          </h2>
        </ScrollReveal>

        <ScrollReveal
          as="ul"
          selector="[data-reveal]"
          stagger={0.12}
          start="top 80%"
          y={26}
          z={-160}
          rotateX={14}
          perspective={1100}
          duration={0.95}
          className="mt-16 grid gap-px border-t border-[var(--line)] sm:mt-20"
        >
          {vertical.painPoints.map((point) => (
            <li
              key={point}
              data-reveal="3d"
              className="border-b border-[var(--line)] py-8"
            >
              <p className="max-w-[46ch] font-display text-step-1 tracking-display">
                {point}
              </p>
            </li>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}

export default PainPoints;
