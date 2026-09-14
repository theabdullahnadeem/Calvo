'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Reports taps on the two channels that actually produce business.
 *
 * The site's whole conversion goal is a phone call, and GA4 counts none of them
 * on its own: a `tel:` or `wa.me` tap hands off to the OS and never becomes a
 * pageview, so the analytics showed traffic arriving and nothing happening.
 * Without this there is no way to tell which page — or which keyword — is
 * producing calls, which is the only number that says whether the SEO work paid
 * off.
 *
 * One delegated listener on the document rather than a handler per link. The
 * call and WhatsApp CTAs appear in the header, hero, footer, pricing, the
 * closing section and the mobile menu, several of them mounted conditionally;
 * binding per-link means every new CTA silently goes untracked.
 *
 * `capture: true` so the event is recorded before any handler can stop
 * propagation, and nothing here ever calls `preventDefault` — the navigation
 * must happen whether or not analytics loaded.
 */
export function CallTracking() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const link = target?.closest?.('a[href]');
      if (!link) return;

      const href = link.getAttribute('href') ?? '';
      const channel = href.startsWith('tel:')
        ? 'phone'
        : href.startsWith('https://wa.me/')
          ? 'whatsapp'
          : null;
      if (!channel) return;

      // Absent when the GA script is blocked, still loading, or the visitor
      // runs an ad blocker. Not a failure — the link still works.
      window.gtag?.('event', 'contact_click', {
        contact_channel: channel,
        // Which page earned the call is the whole point of tracking it.
        page_path: window.location.pathname,
      });
    };

    document.addEventListener('click', onClick, { capture: true });
    return () =>
      document.removeEventListener('click', onClick, { capture: true });
  }, []);

  return null;
}

export default CallTracking;
