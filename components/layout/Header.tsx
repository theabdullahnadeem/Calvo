'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { allVerticals, contact, cta, site } from '@/lib/content';
import { useGsapContext } from '@/components/motion/useGsapContext';
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
  const menuRef = useRef<HTMLDivElement | null>(null);
  const menuTlRef = useRef<gsap.core.Timeline | null>(null);
  // Read inside the GSAP setup, which may resolve after a click has already
  // toggled the state.
  const openRef = useRef(open);
  openRef.current = open;

  /**
   * Mobile menu choreography, following the pattern in
   * docs/kinetik-v2.html: an ink curtain scales down from the top edge, the
   * links slide up from behind their own masks in sequence while it is still
   * arriving, then the surrounding chrome fades in.
   *
   * One paused timeline, played forward to open and reversed to close. Closing
   * runs at 1.7x — the asymmetry is the point. An entrance should feel
   * deliberate; a dismissal should feel immediate, and replaying the same
   * curve at the same speed backwards makes leaving feel sluggish.
   */
  useGsapContext(menuRef, ({ gsap }, scope) => {
    const bg = scope.querySelector('[data-menu-bg]');
    const lines = scope.querySelectorAll('[data-menu-link] > span');
    const tail = scope.querySelectorAll('[data-menu-tail]');

    const tl = gsap
      .timeline({ paused: true })
      .set(scope, { visibility: 'visible' })
      .to(bg, { scaleY: 1, duration: 0.85, ease: 'expo.inOut' })
      // Both `y` and `yPercent` on both ends. The hidden state is a CSS
      // `translateY(118%)`, and getComputedStyle resolves that percentage to
      // pixels before GSAP ever sees it — so GSAP reads y=116px/yPercent=0 and
      // tweening yPercent alone leaves the pixel offset untouched, stranding
      // every link at exactly half travel. Declaring both channels puts GSAP in
      // charge of the whole transform.
      .fromTo(
        lines,
        { yPercent: 118, y: 0 },
        { yPercent: 0, y: 0, duration: 0.85, stagger: 0.06, ease: 'expo.out' },
        '-=0.42',
      )
      .fromTo(tail, { opacity: 0 }, { opacity: 1, duration: 0.5 }, '-=0.5');

    menuTlRef.current = tl;

    // The timeline is built asynchronously with GSAP, so honour a menu that was
    // already opened while the library was still downloading.
    if (openRef.current) tl.play();

    return () => {
      menuTlRef.current = null;
    };
  }, []);

  useEffect(() => {
    const tl = menuTlRef.current;
    // No timeline means reduced motion or GSAP not yet loaded. CSS keys the
    // menu's visibility off `data-open` in that case, so it still opens.
    if (!tl) return;

    if (open) {
      tl.timeScale(1).play();
    } else {
      tl.timeScale(1.7).reverse();
      tl.eventCallback('onReverseComplete', () => {
        if (menuRef.current) menuRef.current.style.visibility = 'hidden';
      });
    }
  }, [open]);

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
                className="flex min-h-[44px] items-center text-[0.9rem] opacity-75 transition-opacity duration-fast hover:opacity-100"
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
                className="flex min-h-[44px] items-center gap-1.5 text-[0.9rem] opacity-75 transition-opacity duration-fast hover:opacity-100"
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
                        className="flex min-h-[44px] items-center rounded px-3 text-[0.9rem] transition-colors duration-fast hover:bg-[var(--panel)]"
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
            {/* Same ghost/primary pairing already used in the hero, at the
                compact header sizing. Held back until lg so it never crowds
                the nav on tablet widths. */}
            <Button
              href={contact.phoneHref}
              variant="ghost"
              className="hidden !px-5 !py-2.5 text-[0.85rem] lg:inline-flex"
            >
              {contact.phone}
            </Button>
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
              // 44px square: the bars stay the size they were, the hit area
              // grows to the minimum a thumb reliably lands on. The negative
              // margin keeps the icon optically flush with the gutter.
              className="-mr-2 flex h-11 w-11 flex-col items-center justify-center gap-[5px] md:hidden"
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

      {/* Full-screen menu — small screens only.
          Not unmounted or `hidden` when closed: both would cut the closing
          animation off at frame one. Visibility is owned by the timeline (and
          by CSS via `data-open` when there is no timeline), and `inert` keeps
          it out of the tab order the whole time it is not open. */}
      <div
        ref={menuRef}
        className="menu md:hidden"
        data-open={open}
        role="dialog"
        aria-modal="true"
        aria-label={site.nav.menuOpenLabel}
        inert={!open}
      >
        <div data-menu-bg className="menu-bg" />

        <div className="menu-in shell flex h-full flex-col justify-between py-4">
          <div
            data-menu-tail
            className="flex h-14 flex-none items-center justify-between"
          >
            <Logo size="md" />
            <button
              ref={closeButtonRef}
              type="button"
              onClick={closeMenu}
              className="-mr-2 inline-flex min-h-[44px] items-center rounded px-2 font-mono text-[11px] uppercase tracking-mono opacity-70"
            >
              {site.nav.menuCloseLabel}
            </button>
          </div>

          <nav aria-label="Menu" className="flex flex-col py-8">
            {site.nav.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                data-menu-link
                className="menu-link font-display text-step-3 tracking-display"
              >
                <span>{link.label}</span>
              </Link>
            ))}

            <div data-menu-tail>
              <p className="eyebrow mt-8">{site.nav.industriesLabel}</p>
              <ul className="mt-1 flex flex-col">
                {allVerticals.map((vertical) => (
                  <li key={vertical.slug}>
                    <Link
                      href={`/${vertical.slug}`}
                      onClick={() => setOpen(false)}
                      className="menu-sublink"
                    >
                      {vertical.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div data-menu-tail className="flex-none">
            <Button
              href={contact.phoneHref}
              variant="ghost"
              size="lg"
              className="w-full"
              onClick={() => setOpen(false)}
            >
              {contact.phone}
            </Button>
            <Button
              href="/#book-a-demo"
              variant="primary"
              size="lg"
              className="mt-3 w-full"
              onClick={() => setOpen(false)}
            >
              {cta.primary}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

export default Header;
