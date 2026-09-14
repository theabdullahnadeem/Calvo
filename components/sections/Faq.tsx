import { faq } from '@/lib/content';
import ScrollReveal from '@/components/motion/ScrollReveal';

/**
 * Visible FAQ.
 *
 * This content already existed in content/info.json as the chat widget's
 * grounding corpus, where no crawler could reach it. Rendering it is the
 * cheapest organic-reach change available to the site: it is the only place
 * that answers the long-tail, pre-purchase questions people actually type
 * ("how much does an AI receptionist cost", "does it sound like a robot"), and
 * it is the source for the FAQPage JSON-LD that goes with it.
 *
 * Built on <details>/<summary> rather than a JS accordion, deliberately:
 *
 *  - The answers are in the DOM whether or not the item is open, so they are
 *    indexed either way. A height-animated accordion that mounts its panel on
 *    click would put this entire section behind JS execution.
 *  - It works with no client bundle at all, which keeps a section this long off
 *    the page's hydration cost.
 *  - Keyboard and screen-reader behaviour is the platform's, not ours.
 *
 * No `name` attribute grouping the items: closing someone's current answer to
 * open another is a worse reading experience on a page people scan.
 */
export function Faq() {
  return (
    <section
      id="faq"
      data-surface="paper"
      aria-labelledby="faq-heading"
      className="surface-paper border-t border-[var(--line)] py-28 sm:py-36"
    >
      <div className="shell">
        <ScrollReveal>
          <p className="eyebrow">{faq.eyebrow}</p>
          <h2
            id="faq-heading"
            className="mt-6 max-w-[20ch] font-display text-step-3 font-medium tracking-display"
          >
            {faq.heading}
          </h2>
          <p className="mt-6 max-w-[52ch] text-[var(--muted)] text-step-0">
            {faq.support}
          </p>
        </ScrollReveal>

        <ScrollReveal
          as="ul"
          selector="[data-reveal]"
          stagger={0.04}
          start="top 85%"
          y={16}
          duration={0.6}
          className="mt-14 max-w-[80ch] border-t border-[var(--line)]"
        >
          {faq.items.map((item) => (
            <li key={item.q} data-reveal="up" className="border-b border-[var(--line)]">
              <details className="group">
                <summary
                  className="flex min-h-[44px] cursor-pointer list-none items-start justify-between gap-6 py-5 text-left font-display text-step-1 tracking-display marker:content-none [&::-webkit-details-marker]:hidden"
                >
                  <h3 className="min-w-0 font-display text-step-1 font-medium tracking-display">
                    {item.q}
                  </h3>
                  {/* A rotating cross, so the control reads the same open or
                      closed without swapping glyphs mid-interaction. */}
                  <span
                    aria-hidden="true"
                    className="relative mt-[0.35em] h-3 w-3 flex-none text-[var(--accent-fg)] transition-transform duration-fast ease-out-expo group-open:rotate-45 motion-reduce:transition-none"
                  >
                    <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-current" />
                    <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-current" />
                  </span>
                </summary>

                <p className="max-w-[62ch] pb-6 pr-10 text-[var(--muted)] text-step-0">
                  {item.a}
                </p>
              </details>
            </li>
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}

export default Faq;
