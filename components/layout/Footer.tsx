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
            <ul className="mt-5 flex flex-col gap-3">
              {allVerticals.map((vertical) => (
                <li key={vertical.slug}>
                  <Link
                    href={`/${vertical.slug}`}
                    className="text-[0.95rem] text-[var(--muted)] transition-colors duration-fast hover:text-[var(--fg)]"
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
            <ul className="mt-5 flex flex-col gap-3">
              {site.nav.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[0.95rem] text-[var(--muted)] transition-colors duration-fast hover:text-[var(--fg)]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <h2 className="eyebrow eyebrow--bare mt-8">{f.legalHeading}</h2>
            <ul className="mt-5 flex flex-col gap-3">
              {legalDocs.map((doc) => (
                <li key={doc.slug}>
                  <Link
                    href={`/${doc.slug}`}
                    className="text-[0.95rem] text-[var(--muted)] transition-colors duration-fast hover:text-[var(--fg)]"
                  >
                    {doc.navLabel}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h2 className="eyebrow eyebrow--bare">{f.contactHeading}</h2>
            <a
              href={`mailto:${contact.email}`}
              className="mt-5 block w-fit font-display text-step-1 tracking-display underline-offset-[6px] hover:underline"
            >
              {contact.email}
            </a>
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
            className="font-mono text-[10px] uppercase tracking-mono transition-colors duration-fast hover:text-[var(--fg)]"
          >
            {f.backToTop}
          </a>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
