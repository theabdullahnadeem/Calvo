'use client';

import { content, sections } from '@/lib/content';
import ScrollReveal from '@/components/motion/ScrollReveal';
import ParallaxLayer from '@/components/motion/ParallaxLayer';
import dynamic from 'next/dynamic';

/** Split for the same reason as the hero panel — see Hero.tsx. */
const PillarVisual = dynamic(
  () => import('@/components/dashboard/PillarVisual'),
);

/**
 * Section 4 — Product pillars.
 *
 * A staggered, layered reveal rather than a flat grid: the second column sits
 * lower and the four blocks drift at slightly different rates as the section
 * passes, which keeps the depth language from the hero alive on what is
 * otherwise straightforward grid content (05-animation-spec.md §4).
 *
 * No numbered markers — these four are not a sequence, and 02-design-brief.md
 * rules out numbering content that isn't.
 *
 * The pillar copy itself is still separated by hairline rules and type, not by
 * a box. What changed is that each pillar now carries a dashboard view of the
 * thing it describes, which is a deliberate reversal of the original "no card
 * boxes" note: the frame belongs to the product screenshot, not to the text.
 * See components/dashboard/PillarVisual.tsx for what each variant may depict —
 * the list is constrained to capabilities info.json actually claims.
 */
export function ProductPillars() {
  const copy = sections.pillars;
  const pillars = content.productPillars;
  // One visual per pillar, matched by index. Zod guarantees both arrays exist;
  // a short visuals array simply leaves later pillars as type-only, which is
  // the pre-existing presentation and still correct.
  const visuals = content.productDemo.pillarVisuals;

  // Alternating drift rates. Small on purpose — this should register as depth,
  // not as elements visibly sliding around.
  const speeds = [0.05, -0.06, -0.04, 0.07];

  return (
    <section
      id="what-you-get"
      data-surface="paper"
      aria-labelledby="pillars-heading"
      className="surface-paper relative overflow-hidden py-28 sm:py-36"
    >
      <div className="shell">
        <ScrollReveal>
          <p className="eyebrow">{copy.eyebrow}</p>
          <h2
            id="pillars-heading"
            className="mt-6 max-w-[20ch] font-display text-step-3 font-medium tracking-display"
          >
            {copy.heading}
          </h2>
          <p className="mt-6 max-w-[46ch] text-[var(--muted)] text-step-0">
            {copy.support}
          </p>
        </ScrollReveal>

        {/* Cards arrive through depth — tipped back and set behind the page
            plane, then squaring up. Alternating rotateY means the two columns
            open from opposite sides, which reads as a layered space rather than
            a grid of identical fades. */}
        <ScrollReveal
          as="ul"
          selector="[data-reveal]"
          stagger={0.1}
          start="top 78%"
          y={40}
          z={-180}
          rotateX={12}
          rotateY={(i) => (i % 2 === 0 ? -9 : 9)}
          perspective={1100}
          duration={1}
          className="mt-20 grid gap-x-[clamp(2rem,5vw,5rem)] gap-y-16 sm:mt-24 md:grid-cols-2"
        >
          {/* `min-w-0` below is load-bearing, not tidying. A grid item defaults
              to `min-width: auto`, so the track is sized by the item's
              min-content — and the dashboard mockup inside contains deliberately
              non-wrapping text (the truncated transcript lines, the "example
              view" badge). Below the `md` breakpoint there is no explicit
              `grid-template-columns` to impose `minmax(0, 1fr)`, so that
              min-content won: every card rendered 448px wide inside a 335px
              column and the section's `overflow-hidden` silently cut the
              right-hand third off on every phone. */}
          {pillars.map((pillar, i) => (
            <li
              key={pillar.title}
              className={`min-w-0 ${i % 2 === 1 ? 'md:mt-24' : ''}`}
            >
              <ParallaxLayer
                speed={speeds[i % speeds.length]}
                triggerSelector="#what-you-get"
                scrub={0.7}
              >
                <article
                  data-reveal="3d"
                  style={
                    {
                      ['--reveal-ry' as string]: `${i % 2 === 0 ? -9 : 9}deg`,
                    } as React.CSSProperties
                  }
                >
                  <span
                    aria-hidden="true"
                    className="block h-px w-full bg-[var(--line)]"
                  />
                  <span
                    aria-hidden="true"
                    className="mt-[-1px] block h-px w-10 bg-[var(--accent-fg)]"
                  />
                  <h3 className="mt-8 max-w-[18ch] font-display text-step-2 font-medium tracking-display">
                    {pillar.title}
                  </h3>
                  <p className="mt-4 max-w-[42ch] text-[var(--muted)] text-step-0">
                    {pillar.description}
                  </p>

                  {/* The dashboard view for this pillar. It is a dark frame on
                      a paper section on purpose — a product screenshot reads as
                      a screenshot, and the ink/paper rhythm app/page.tsx sets up
                      stays intact rather than the section going dark. */}
                  {visuals[i] && (
                    <div className="mt-8">
                      <PillarVisual visual={visuals[i]} />
                    </div>
                  )}
                </article>
              </ParallaxLayer>
            </li>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}

export default ProductPillars;
