'use client';

import Link from 'next/link';
import { otherVerticals, sections } from '@/lib/content';
import ScrollReveal from '@/components/motion/ScrollReveal';

/**
 * Cross-links to the other vertical pages.
 *
 * Structural, not decorative: a visitor who lands on a vertical page from
 * search sees, on that page, that Calvo answers for several kinds of business.
 * That is the positioning model from 01-info.json working in both directions —
 * specific language on the page, category-level brand around it.
 */
export function OtherIndustries({ currentSlug }: { currentSlug: string }) {
  const copy = sections.verticalPages;
  const others = otherVerticals(currentSlug);

  if (!others.length) return null;

  return (
    <section
      data-surface="paper"
      aria-labelledby="other-industries-heading"
      className="surface-paper border-t border-[var(--line)] py-24 sm:py-28"
    >
      <ScrollReveal className="shell">
        <h2
          id="other-industries-heading"
          className="eyebrow eyebrow--bare"
        >
          {copy.otherIndustriesHeading}
        </h2>

        <ul className="mt-8 flex flex-wrap gap-x-10 gap-y-4">
          {others.map((vertical) => (
            <li key={vertical.slug}>
              <Link
                href={`/${vertical.slug}`}
                className="group inline-flex min-h-[44px] items-baseline gap-2 font-display text-step-2 tracking-display transition-colors duration-fast hover:text-[var(--accent-fg)]"
              >
                {vertical.shortName}
                <span
                  aria-hidden="true"
                  className="text-[0.5em] transition-transform duration-fast ease-out-expo group-hover:translate-x-1 motion-reduce:transition-none"
                >
                  &rarr;
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </ScrollReveal>
    </section>
  );
}

export default OtherIndustries;
