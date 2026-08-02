'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { allVerticals, cta, site } from '@/lib/content';
import Logo from '@/components/ui/Logo';
import Button from '@/components/ui/Button';

type Surface = 'ink' | 'paper';

/**
 * Fixed header that re-themes to whatever surface is beneath it.
 *
 * The page alternates ink and paper sections, so a single fixed colour would be
 * unreadable half the time. Rather than a blend mode (which would also invert
 * the accent CTA) each section declares `data-surface`, and a 1px detection
 * band at the header's own height reports which one is currently under it.
 * IntersectionObserver rather than GSAP: this has to keep working for
 * reduced-motion visitors, who never load the animation layer at all.
 */
export function Header() {
  const [surface, setSurface] = useState<Surface>('ink');
  const [open, setOpen] = useState(false);
  const [industriesOpen, setIndustriesOpen] = useState(false);
  const pathname = usePathname();
  const industriesRef = useRef<HTMLDivElement>(null);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('[data-surface]');
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const value = entry.target.getAttribute('data-surface');
          if (value === 'ink' || value === 'paper') setSurface(value);
        });
      },
      // Collapses the viewport to a thin band level with the header.
      { rootMargin: '-56px 0px -100% 0px', threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  // Route change closes anything left open.
  useEffect(() => {
    setOpen(false);
    setIndustriesOpen(false);
  }, [pathname]);

  const closeMenu = useCallback(() => {
    setOpen(false);
    menuButtonRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open && !industriesOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (open) closeMenu();
      setIndustriesOpen(false);
    };

    const onPointerDown = (event: PointerEvent) => {
      if (!industriesOpen) return;
      if (industriesRef.current?.contains(event.target as Node)) return;
      setIndustriesOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [open, industriesOpen, closeMenu]);

  // Lock the page behind the full-screen menu and move focus into it.
  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  const onInk = surface === 'ink';

  return (
    <>
      {/* The header sits outside every surface wrapper, so it has to adopt the
          detected surface's whole token set — not just the text colour. Getting
          only --fg right would leave the CTA rendering the paper accent on top
          of a dark section, a shade away from the hero's own button. */}
      <header
        className="fixed inset-x-0 top-0 z-50 text-[var(--fg)] transition-colors duration-500 ease-out-expo"
        style={
          onInk
            ? ({
                '--bg': 'var(--ink)',
                '--fg': 'var(--paper)',
                '--muted': 'var(--ash-dim)',
                '--accent-fg': 'var(--accent-on-ink)',
                '--line': 'rgba(250,250,248,0.14)',
                '--panel': 'rgba(250,250,248,0.05)',
              } as React.CSSProperties)
            : ({
                '--bg': 'var(--paper)',
                '--fg': 'var(--ink)',
                '--muted': 'var(--ash)',
                '--accent-fg': 'var(--accent-on-paper)',
                '--line': 'rgba(11,14,17,0.12)',
                '--panel': 'rgba(11,14,17,0.04)',
              } as React.CSSProperties)
        }
      >
        <div className="shell flex h-14 items-center justify-between gap-6 sm:h-16">
          <Logo size="md" />

          <nav
            aria-label="Main"
            className="hidden items-center gap-8 md:flex"
          >
            {site.nav.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-[0.9rem] opacity-75 transition-opacity duration-fast hover:opacity-100"
              >
                {link.label}
              </Link>
            ))}

            <div className="relative" ref={industriesRef}>
              <button
                type="button"
                aria-expanded={industriesOpen}
                aria-haspopup="true"
                onClick={() => setIndustriesOpen((v) => !v)}
                className="flex items-center gap-1.5 text-[0.9rem] opacity-75 transition-opacity duration-fast hover:opacity-100"
              >
                {site.nav.industriesLabel}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 10 6"
                  className={`h-[5px] w-[9px] transition-transform duration-fast ease-out-expo ${
                    industriesOpen ? 'rotate-180' : ''
                  }`}
                >
                  <path
                    d="M1 1l4 4 4-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>

              {industriesOpen && (
                <ul className="surface-ink absolute right-0 top-[calc(100%+14px)] min-w-[230px] rounded-lg border border-[var(--line)] p-2 shadow-2xl">
                  {allVerticals.map((vertical) => (
                    <li key={vertical.slug}>
                      <Link
                        href={`/${vertical.slug}`}
                        className="block rounded px-3 py-2.5 text-[0.9rem] transition-colors duration-fast hover:bg-[var(--panel)]"
                      >
                        {vertical.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </nav>

          <div className="flex items-center gap-3">
            <Button
              href="/#book-a-demo"
              variant="primary"
              className="hidden !px-5 !py-2.5 text-[0.85rem] sm:inline-flex"
            >
              {cta.primary}
            </Button>

            <button
              ref={menuButtonRef}
              type="button"
              className="flex h-10 w-10 flex-col items-end justify-center gap-[5px] md:hidden"
              aria-expanded={open}
              onClick={() => setOpen(true)}
            >
              <span className="sr-only">{site.nav.menuOpenLabel}</span>
              <span
                aria-hidden="true"
                className="block h-[1.5px] w-6 bg-current"
              />
              <span
                aria-hidden="true"
                className="block h-[1.5px] w-4 bg-current"
              />
            </button>
          </div>
        </div>
      </header>

      {/* Full-screen menu — small screens only. */}
      <div
        className={[
          'surface-ink fixed inset-0 z-[60] md:hidden',
          'transition-[opacity,visibility] duration-500 ease-out-expo',
          open ? 'visible opacity-100' : 'invisible opacity-0',
        ].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label={site.nav.industriesLabel}
        hidden={!open}
      >
        <div className="shell flex h-full flex-col justify-between py-4">
          <div className="flex h-14 items-center justify-between">
            <Logo size="md" />
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeMenu}
              className="font-mono text-[11px] uppercase tracking-mono opacity-70"
            >
              {site.nav.menuCloseLabel}
            </button>
          </div>

          <nav aria-label="Menu" className="flex flex-col gap-1 py-8">
            {site.nav.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="font-display text-step-3 tracking-display"
              >
                {link.label}
              </Link>
            ))}

            <p className="eyebrow mt-8">{site.nav.industriesLabel}</p>
            <ul className="mt-3 flex flex-col gap-2">
              {allVerticals.map((vertical) => (
                <li key={vertical.slug}>
                  <Link
                    href={`/${vertical.slug}`}
                    onClick={() => setOpen(false)}
                    className="text-[1.05rem] opacity-80"
                  >
                    {vertical.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <Button href="/#book-a-demo" variant="primary" size="lg" className="w-full">
            {cta.primary}
          </Button>
        </div>
      </div>
    </>
  );
}

export default Header;
