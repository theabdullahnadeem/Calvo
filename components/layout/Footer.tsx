import Link from 'next/link';
import { allVerticals, brand, contact, legalDocs, site } from '@/lib/content';
import Logo from '@/components/ui/Logo';

export function Footer() {
  const year = new Date().getFullYear();
  const f = site.footer;

  return (
    <footer
      className="surface-ink border-t border-[var(--line)]"
      data-surface="ink"
    >
      <div className="shell py-16 sm:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Logo size="lg" href={false} />
            <p className="mt-5 max-w-[34ch] text-[0.95rem] text-[var(--muted)]">
              {f.wordmarkNote}
            </p>
          </div>

          <nav aria-labelledby="footer-industries">
            <h2 id="footer-industries" className="eyebrow eyebrow--bare">
              {f.industriesHeading}
            </h2>
            <ul className="mt-3 flex flex-col gap-0.5">
              {allVerticals.map((vertical) => (
                <li key={vertical.slug}>
                  <Link
                    href={`/${vertical.slug}`}
                    className="footer-link"
                  >
                    {vertical.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-labelledby="footer-company">
            <h2 id="footer-company" className="eyebrow eyebrow--bare">
              {f.companyHeading}
            </h2>
            <ul className="mt-3 flex flex-col gap-0.5">
              {site.nav.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="footer-link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h2 className="eyebrow eyebrow--bare mt-8">{f.legalHeading}</h2>
            <ul className="mt-3 flex flex-col gap-0.5">
              {legalDocs.map((doc) => (
                <li key={doc.slug}>
                  <Link href={`/${doc.slug}`} className="footer-link">
                    {doc.navLabel}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow eyebrow--bare">{f.contactHeading}</h2>
            <a
              href={contact.phoneHref}
              className="mt-3 -mx-2 flex min-h-[44px] w-fit items-center rounded px-2 font-display text-step-1 tracking-display underline-offset-[6px] hover:underline"
            >
              {contact.phone}
            </a>
            <p className="px-0 font-mono text-[10px] uppercase tracking-mono text-[var(--muted)]">
              {contact.phoneNote}
            </p>
            {/* WhatsApp, not email. The published address was never a live
                mailbox — see the note on `contact` in content/info.json. */}
            <a
              href={contact.whatsappHref}
              target="_blank"
              rel="noopener"
              className="mt-1 -mx-2 flex min-h-[44px] w-fit items-center rounded px-2 font-display text-step-1 tracking-display underline-offset-[6px] hover:underline"
            >
              {contact.whatsapp}
            </a>
            <p className="font-mono text-[10px] uppercase tracking-mono text-[var(--muted)]">
              {contact.whatsappLabel}
            </p>
            <p className="mt-6 text-[0.85rem] text-[var(--muted)]">
              {f.formerNameLine}
            </p>
          </div>
        </div>

        <div className="mt-16 flex flex-col-reverse gap-4 border-t border-[var(--line)] pt-7 text-[0.8rem] text-[var(--muted)] sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {year} {brand.name}. {f.rightsLine}
          </p>
          <a
            href="#main"
            className="-mx-2 inline-flex w-fit items-center rounded px-2 min-h-[44px] font-mono text-[10px] uppercase tracking-mono transition-colors duration-fast hover:text-[var(--fg)]"
          >
            {f.backToTop}
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
