'use client';

import { contact, sections } from '@/lib/content';
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

        {/* The phone number is the primary action here, not a fallback. This
            section exists to produce a call, and the number is the only control
            on the page that produces one in a single tap. `mailto:` used to sit
            in this slot pointing at an address nobody reads — see the note on
            `contact` in content/info.json. */}
        <div className="mt-12 flex flex-wrap items-center gap-x-8 gap-y-5">
          <Button href={contact.phoneHref} variant="primary" size="lg">
            {contact.phoneLabel} — {contact.phone}
          </Button>

          <Button href={contact.whatsappHref} variant="ghost" size="lg">
            {contact.whatsappLabel} — {contact.whatsapp}
          </Button>
        </div>

        {/* Two numbers, two jobs. Saying which is which here is cheaper than
            fielding a WhatsApp message on the voice line. */}
        <p className="mt-6 text-[0.95rem] text-[var(--muted)]">
          {copy.whatsappLabel}
        </p>
      </ScrollReveal>
    </section>
  );
}

export default CTASection;
