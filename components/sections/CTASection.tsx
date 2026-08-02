'use client';

import { contact, cta, sections } from '@/lib/content';
import ScrollReveal from '@/components/motion/ScrollReveal';
import Button from '@/components/ui/Button';

/**
 * Section 6 — Close.
 *
 * Deliberately the quietest section on the page. Per 02-design-brief.md's
 * "restraint in the resting states" and 05-animation-spec.md §6, the conversion
 * moment gets no parallax, no pin, no counters — one plain fade in, and the only
 * motion left is the button's own hover. Competing for attention here works
 * against the thing the section exists to do.
 */
export function CTASection() {
  const copy = sections.cta;

  return (
    <section
      id="book-a-demo"
      data-surface="paper"
      aria-labelledby="cta-heading"
      className="surface-paper border-t border-[var(--line)] py-32 sm:py-44"
    >
      <ScrollReveal className="shell" y={18} duration={0.7}>
        <p className="eyebrow">{copy.eyebrow}</p>

        <h2
          id="cta-heading"
          className="mt-8 max-w-[14ch] font-display text-step-4 font-medium tracking-display"
        >
          {copy.heading}
        </h2>

        <p className="mt-8 max-w-[52ch] text-[var(--muted)] text-step-1">
          {copy.support}
        </p>

        <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-5">
          <Button href={`mailto:${contact.email}`} variant="primary" size="lg">
            {cta.primary}
          </Button>

          <p className="text-[0.95rem] text-[var(--muted)]">
            {copy.emailLabel}{' '}
            <a
              href={`mailto:${contact.email}`}
              className="text-[var(--fg)] underline decoration-[var(--accent-fg)] underline-offset-[5px]"
            >
              {contact.email}
            </a>
          </p>
        </div>
      </ScrollReveal>
    </section>
  );
}

export default CTASection;
