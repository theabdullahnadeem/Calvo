import { contact, legal, type LegalDoc } from '@/lib/content';
import ScrollReveal from '@/components/motion/ScrollReveal';

/**
 * Shared body for /privacy and /terms.
 *
 * Long-form reading, so it gets none of the choreography the marketing pages
 * use — one quiet fade per block and nothing else. Someone opening a privacy
 * policy wants to read it, and 02-design-brief.md is explicit that no effect
 * should ever come between a reader and the content.
 */
export function LegalPage({ doc }: { doc: LegalDoc }) {
  return (
    <article
      data-surface="paper"
      className="surface-paper pb-28 pt-36 sm:pb-36 sm:pt-44"
    >
      <div className="shell">
        <ScrollReveal className="max-w-[70ch]" y={16} duration={0.6}>
          <p className="eyebrow">{doc.eyebrow}</p>
          <h1 className="mt-6 font-display text-step-4 font-medium tracking-display">
            {doc.title}
          </h1>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-mono text-[var(--muted)]">
            {legal.lastUpdatedLabel} {legal.lastUpdated}
          </p>

          {legal.reviewNotice && (
            <p
              role="note"
              className="mt-8 border-l-2 border-[var(--accent-fg)] bg-[var(--panel)] px-5 py-4 text-[0.95rem] text-[var(--muted)]"
            >
              {legal.reviewNotice}
            </p>
          )}

          <p className="mt-10 text-step-1 text-[var(--muted)]">{doc.intro}</p>
        </ScrollReveal>

        <div className="mt-16 max-w-[70ch] border-t border-[var(--line)]">
          {doc.sections.map((section) => (
            <ScrollReveal
              key={section.heading}
              as="section"
              className="border-b border-[var(--line)] py-10"
              y={18}
              duration={0.6}
              start="top 88%"
            >
              <h2 className="font-display text-step-2 font-medium tracking-display">
                {section.heading}
              </h2>
              <div className="mt-5 flex flex-col gap-4">
                {section.body.map((paragraph) => (
                  <p key={paragraph} className="text-[var(--muted)]">
                    {paragraph}
                  </p>
                ))}
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal className="mt-14 max-w-[70ch]" y={16} duration={0.6}>
          <h2 className="font-display text-step-2 font-medium tracking-display">
            {legal.contactHeading}
          </h2>
          <p className="mt-4 text-[var(--muted)]">
            {legal.contactBody}{' '}
            {/* A privacy policy has to name a channel that actually reaches
                someone. Both of these do; the old address did not. */}
            <a
              href={contact.phoneHref}
              className="text-[var(--fg)] underline decoration-[var(--accent-fg)] underline-offset-[5px]"
            >
              {contact.phone}
            </a>{' '}
            <span className="text-[var(--muted)]">or</span>{' '}
            <a
              href={contact.whatsappHref}
              target="_blank"
              rel="noopener"
              className="text-[var(--fg)] underline decoration-[var(--accent-fg)] underline-offset-[5px]"
            >
              {contact.whatsappLabel} {contact.whatsapp}
            </a>
          </p>
        </ScrollReveal>
      </div>
    </article>
  );
}

export default LegalPage;
