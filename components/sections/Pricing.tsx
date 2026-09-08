'use client';

import { useRef } from 'react';
import { content, contact } from '@/lib/content';
import { useGsapContext } from '@/components/motion/useGsapContext';
import ScrollReveal from '@/components/motion/ScrollReveal';
import Magnetic from '@/components/motion/Magnetic';
import Button from '@/components/ui/Button';

/**
 * Pricing.
 *
 * The tiers are 3D cards: they arrive tipped back and offset in z, then square
 * up, and on a fine pointer each one tilts toward the cursor while it is hovered.
 * The `popular` tier sits nearer the viewer than the other two and stays there,
 * so the recommendation is carried by depth as well as colour.
 *
 * Two badge slots, deliberately separate: `badge` is the tier's own framing
 * ("Best for first-timers", "Peak Season") and sits top-left, while `popular` is
 * the recommendation and sits top-right. Pro carries both, so they must not
 * compete for the same corner.
 *
 * Every figure comes from info.json.
 */
export function Pricing() {
  const ref = useRef<HTMLElement | null>(null);
  const p = content.pricing;

  useGsapContext(ref, ({ gsap }, scope) => {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

    const cards = gsap.utils.toArray<HTMLElement>(
      scope.querySelectorAll('[data-tier-card]'),
    );

    const cleanups = cards.map((card) => {
      gsap.set(card, { transformPerspective: 900, transformStyle: 'preserve-3d' });

      const rotX = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3' });
      const rotY = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3' });
      const lift = gsap.quickTo(card, 'z', { duration: 0.6, ease: 'power3' });

      const onMove = (e: PointerEvent) => {
        const r = card.getBoundingClientRect();
        const nx = (e.clientX - r.left) / r.width - 0.5;
        const ny = (e.clientY - r.top) / r.height - 0.5;
        rotY(nx * 11);
        rotX(-ny * 11);
        lift(46);
      };
      const onLeave = () => {
        rotX(0);
        rotY(0);
        lift(0);
      };

      card.addEventListener('pointermove', onMove);
      card.addEventListener('pointerleave', onLeave);
      return () => {
        card.removeEventListener('pointermove', onMove);
        card.removeEventListener('pointerleave', onLeave);
      };
    });

    return () => cleanups.forEach((fn) => fn());
  }, []);

  return (
    <section
      ref={ref as React.Ref<HTMLElement>}
      id="pricing"
      data-surface="paper"
      aria-labelledby="pricing-heading"
      className="surface-paper relative overflow-hidden py-28 sm:py-36"
    >
      <div className="shell">
        <ScrollReveal>
          <p className="eyebrow">{p.eyebrow}</p>
          <h2
            id="pricing-heading"
            className="mt-6 max-w-[20ch] font-display text-step-3 font-medium tracking-display"
          >
            {p.heading}
          </h2>
          <p className="mt-6 max-w-[52ch] text-[var(--muted)] text-step-0">
            {p.support}
          </p>
        </ScrollReveal>

        {/* One block per product. They are sold differently — self-configure
            versus built-and-run — so each gets its own heading, its own CTA
            target, and its own row rather than being flattened into a single
            six-across ladder that would read as one escalating price list. */}
        {p.groups.map((group) => (
        <div key={group.id} id={`pricing-${group.id}`}>
        <ScrollReveal className="mt-16 border-t border-[var(--line)] pt-10 sm:mt-20">
          <p className="eyebrow">{group.label}</p>
          <h3 className="mt-5 max-w-[22ch] font-display text-step-2 font-medium tracking-display">
            {group.heading}
          </h3>
          <p className="mt-4 max-w-[56ch] text-[var(--muted)] text-step-0">
            {group.body}
          </p>
        </ScrollReveal>

        <ScrollReveal
          as="ul"
          selector="[data-reveal]"
          stagger={0.12}
          start="top 80%"
          y={44}
          z={-260}
          rotateX={14}
          rotateY={(i) => (i - 1) * 8}
          perspective={1200}
          duration={1}
          className="mt-10 grid gap-6 lg:grid-cols-3"
        >
          {group.tiers.map((tier) => (
            <li key={tier.name} data-reveal="3d" className="flex">
              <article
                data-tier-card
                className={[
                  'flex w-full flex-col rounded-2xl border p-8 will-change-transform',
                  tier.popular
                    ? 'border-[var(--accent-fg)] bg-[var(--panel)] shadow-[0_30px_70px_-40px_rgba(11,14,17,0.5)]'
                    : 'border-[var(--line)]',
                ].join(' ')}
              >
                {/* Reserved whether or not this tier has a badge, so the three
                    cards' names stay on one baseline across the row. */}
                <div className="flex min-h-[1.75rem] items-start justify-between gap-3">
                  {tier.badge ? (
                    <span className="rounded-full border border-[var(--line)] px-2.5 py-1 font-mono text-[9px] uppercase tracking-mono text-[var(--muted)]">
                      {tier.badge}
                    </span>
                  ) : (
                    <span aria-hidden="true" />
                  )}
                  {tier.popular && (
                    <span className="whitespace-nowrap rounded-full bg-[var(--accent-fg)] px-2.5 py-1 font-mono text-[9px] uppercase tracking-mono text-[var(--bg)]">
                      {p.popularLabel}
                    </span>
                  )}
                </div>

                <h4 className="mt-5 font-display text-step-2 font-medium tracking-display">
                  {tier.name}
                </h4>
                <p className="mt-1.5 text-[0.9rem] text-[var(--muted)]">
                  {tier.description}
                </p>

                <p className="mt-7 flex items-baseline gap-2">
                  <span className="font-display text-step-4 font-medium leading-none tracking-display [font-variant-numeric:tabular-nums]">
                    {tier.price}
                  </span>
                  <span className="text-[0.9rem] text-[var(--muted)]">
                    {tier.period}
                  </span>
                </p>

                <p className="mt-4 flex items-center gap-2.5 text-[0.9rem]">
                  <span
                    aria-hidden="true"
                    className="h-px w-4 flex-none bg-[var(--accent-fg)]"
                  />
                  <span className="text-[var(--fg)]">{tier.minutes}</span>
                </p>

                <ul className="mt-8 flex flex-1 flex-col gap-3 border-t border-[var(--line)] pt-7">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-3 text-[0.95rem]">
                      <span
                        aria-hidden="true"
                        className="mt-[0.55em] h-px w-3 flex-none bg-[var(--accent-fg)]"
                      />
                      <span className="text-[var(--muted)]">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* NOTE: for the self-configure group this is a sign-in link,
                    NOT a purchase flow. Account provisioning is admin-side, so
                    there is currently no path from "visitor with a card" to a
                    live account. Pending a product decision — do not wire this
                    to checkout until that is settled. */}
                <Button
                  href={group.ctaHref}
                  variant={tier.popular ? 'primary' : 'ghost'}
                  className="mt-9 w-full"
                >
                  {tier.ctaText ?? group.ctaLabel}
                </Button>

                {tier.finePrint && (
                  <p className="mt-4 text-center text-[0.78rem] leading-relaxed text-[var(--muted)]">
                    {tier.finePrint}
                  </p>
                )}
              </article>
            </li>
          ))}
        </ScrollReveal>

        {group.ctaNote && (
          <ScrollReveal className="mt-6" y={14} duration={0.5}>
            <p className="max-w-[56ch] text-[0.9rem] text-[var(--muted)]">
              {group.ctaNote}
            </p>
          </ScrollReveal>
        )}
        </div>
        ))}

        {/* Price justification. Reuses the pillar grid's hairline-and-type
            treatment rather than introducing a card, so it reads as part of the
            pricing block instead of a fifth section. Every claim here is an
            inclusion already listed in the tiers above. */}
        <ScrollReveal className="mt-16 border-t border-[var(--line)] pt-12 sm:mt-20">
          <h3 className="max-w-[24ch] font-display text-step-2 font-medium tracking-display">
            {p.managedHeading}
          </h3>
          <p className="mt-5 max-w-[58ch] text-[var(--muted)] text-step-0">
            {p.managedBody}
          </p>
        </ScrollReveal>

        <ScrollReveal
          as="ul"
          selector="[data-reveal]"
          stagger={0.1}
          start="top 82%"
          y={30}
          z={-140}
          rotateX={10}
          perspective={1100}
          className="mt-12 grid gap-x-[clamp(2rem,5vw,4rem)] gap-y-10 md:grid-cols-2"
        >
          {p.managedItems.map((item) => (
            <li key={item.title} data-reveal="3d">
              <span
                aria-hidden="true"
                className="block h-px w-full bg-[var(--line)]"
              />
              <span
                aria-hidden="true"
                className="mt-[-1px] block h-px w-10 bg-[var(--accent-fg)]"
              />
              <h4 className="mt-6 max-w-[22ch] font-display text-step-1 font-medium tracking-display">
                {item.title}
              </h4>
              <p className="mt-3 max-w-[44ch] text-[0.95rem] text-[var(--muted)]">
                {item.body}
              </p>
            </li>
          ))}
        </ScrollReveal>

        <ScrollReveal className="mt-14 flex flex-col gap-6 border-t border-[var(--line)] pt-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h3 className="font-display text-step-1 font-medium tracking-display">
              {p.customHeading}
            </h3>
            <p className="mt-3 max-w-[54ch] text-[var(--muted)]">
              {p.customBody}
            </p>
          </div>
          <Magnetic className="flex-none">
            <Button href={`mailto:${contact.email}`} variant="ghost" size="lg">
              {contact.email}
            </Button>
          </Magnetic>
        </ScrollReveal>
      </div>
    </section>
  );
}

export default Pricing;
