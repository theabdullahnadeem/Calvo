'use client';

import { content, sections, type Stat } from '@/lib/content';
import ScrollReveal from '@/components/motion/ScrollReveal';
import CountUp from '@/components/motion/CountUp';
import Button from '@/components/ui/Button';

type VerticalProofProps = {
  stats?: Stat[];
  /** Set false on the CPA page itself, where the vertical framing is the point. */
  showFraming?: boolean;
  showLink?: boolean;
  heading?: string;
};

/**
 * Section 5 — Vertical proof.
 *
 * This is the section 05-animation-spec.md warns is most likely to quietly
 * re-centre the whole brand on accounting, so the vertical-neutral constraint is
 * enforced in the copy structure itself, not left to tone:
 *
 *  - the heading is "One client example", not a claim about who Calvo serves
 *  - the client label sits *above* the numbers, so the scope of the result is
 *    read before the result is
 *  - a framing line explicitly names the other verticals and states that these
 *    are one client's numbers rather than a category claim
 *  - the link out is labelled as a breakdown of that client, not a destination
 *
 * Numbers count on scroll-in. Where a stat has a real starting value it stays
 * on screen next to the result, so the before/after is legible without the
 * tween — reduced-motion visitors get the whole story, not just the endpoint.
 */
export function VerticalProof({
  stats = content.verticals.primary.stats,
  showFraming = true,
  showLink = true,
  heading,
}: VerticalProofProps) {
  const copy = sections.proof;

  return (
    <section
      id="results"
      data-surface="ink"
      aria-labelledby="proof-heading"
      className="surface-ink relative overflow-hidden py-28 sm:py-36"
    >
      <div className="shell">
        <ScrollReveal>
          <p className="eyebrow">{copy.eyebrow}</p>

          {/* Scope of the claim, stated before the claim.
              `flex w-fit`, not `inline-flex`: .eyebrow above is itself
              inline-flex, so an inline-level sibling shares its line. */}
          <p className="mt-6 flex w-fit items-center rounded-full border border-[var(--line)] px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-mono text-[var(--muted)]">
            {copy.clientLabel}
          </p>

          <h2
            id="proof-heading"
            className="mt-7 max-w-[16ch] font-display text-step-3 font-medium tracking-display"
          >
            {heading ?? copy.heading}
          </h2>
        </ScrollReveal>

        {/* Stats tip up into place from behind the page plane — the numbers
            arrive rather than appear, which is what makes the count read as a
            result being presented. */}
        <ScrollReveal
          as="dl"
          selector="[data-reveal]"
          stagger={0.14}
          start="top 80%"
          y={34}
          z={-220}
          rotateX={16}
          perspective={1200}
          duration={1}
          className="mt-16 grid gap-12 sm:mt-20 sm:grid-cols-2 sm:gap-x-[clamp(2rem,6vw,6rem)]"
        >
          {stats.map((stat) => (
            <div key={stat.label} data-reveal="3d">
              <dt className="font-mono text-[11px] uppercase tracking-mono text-[var(--muted)]">
                {stat.label}
              </dt>

              <dd className="mt-5 flex flex-wrap items-baseline gap-x-4 gap-y-2">
                {/* A non-zero start is a real "before" figure and stays visible.
                    A zero start is only the tween's origin, so it is not shown. */}
                {stat.from !== 0 && (
                  <span className="font-display text-step-2 tracking-display text-[var(--muted)] line-through decoration-[1.5px]">
                    {stat.prefix ?? ''}
                    {stat.from}
                    {stat.suffix ?? ''}
                  </span>
                )}

                <CountUp
                  from={stat.from}
                  to={stat.to}
                  prefix={stat.prefix}
                  suffix={stat.suffix}
                  className="font-display text-step-5 font-medium leading-none tracking-display text-[var(--accent-fg)] [font-variant-numeric:tabular-nums]"
                />

                {/* Inside the <dd>, not beside it: a div wrapper in a <dl> may
                    only contain dt/dd pairs, so a sibling <p> here makes the
                    definition list invalid. */}
                {stat.caption && (
                  <span className="mt-4 block w-full text-[0.9rem] text-[var(--muted)]">
                    {stat.caption}
                  </span>
                )}
              </dd>
            </div>
          ))}
        </ScrollReveal>

        {(showFraming || showLink) && (
          <ScrollReveal className="mt-16 flex flex-col gap-8 border-t border-[var(--line)] pt-10 lg:flex-row lg:items-start lg:justify-between">
            {showFraming && (
              <p className="max-w-[58ch] text-[var(--muted)] text-step-0">
                {copy.framing}
              </p>
            )}
            {showLink && (
              <Button
                href={`/${content.verticals.primary.slug}`}
                variant="link"
                className="flex-none"
              >
                {copy.linkLabel}
              </Button>
            )}
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}

export default VerticalProof;
