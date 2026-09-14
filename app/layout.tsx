import type { Metadata, Viewport } from 'next';
import { Inter, Inter_Tight, JetBrains_Mono } from 'next/font/google';
import Script from 'next/script';
import './globals.css';
import { brand, site } from '@/lib/content';
import { SITE_URL } from '@/lib/constants';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import Preloader from '@/components/layout/Preloader';
import SmoothScrollProvider from '@/components/layout/SmoothScrollProvider';
import CustomCursor from '@/components/motion/CustomCursor';
import ChatWidget from '@/components/chat/ChatWidget';
import CallTracking from '@/components/analytics/CallTracking';

/**
 * Self-hosted at build time by next/font — no render-blocking request to a
 * third-party font host, which 03-tech-stack.md calls out as critical to the
 * performance target. `display: swap` plus preload keeps the hero readable
 * even on a cold cache.
 */
/**
 * Display face is a grotesque, not the geometric 02-design-brief.md assumed.
 * The brief's actual criterion is "matching the wordmark", and the delivered
 * wordmark is a neo-grotesque — flat-terminal double-storey 'a', angled 'c'
 * terminals — so Inter Tight is the closer match. It is a display-optimised cut,
 * which keeps it distinct from Inter at body sizes as the brief requires.
 */
const display = Inter_Tight({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-display',
  display: 'swap',
});

const body = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-body',
  display: 'swap',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: site.meta.titleDefault,
    template: `%s`,
  },
  description: site.meta.description,
  applicationName: brand.name,
  openGraph: {
    type: 'website',
    siteName: brand.name,
    title: site.meta.titleDefault,
    description: site.meta.description,
    url: SITE_URL,
    locale: site.meta.locale,
  },
  twitter: {
    card: 'summary_large_image',
    title: site.meta.titleDefault,
    description: site.meta.description,
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  themeColor: '#0B0E11',
  colorScheme: 'light',
};

/**
 * Runs before first paint.
 *
 *  - `anim-ready` gates every rule that hides content pre-animation. It is only
 *    added when JS is live AND reduced motion is off, so a crawler, a no-JS
 *    visitor, or someone with the OS setting on receives fully visible content
 *    and never depends on JS to reveal it.
 *  - `intro-seen` collapses the hero's load-in for repeat visits within the
 *    session, per the page-load note in 05-animation-spec.md.
 *  - The trailing timeout is a dead-man's switch for the first-load curtain: if
 *    React never hydrates, `intro-done` still lands and the page is usable. The
 *    loader must never be able to strand a visitor behind it. Preloader clears
 *    the handle once it mounts, since from that point the component owns the
 *    lifecycle and has its own bounded timers — leaving both armed would cut a
 *    genuinely slow load's curtain mid-count.
 */
const BOOTSTRAP = `(function(){var d=document.documentElement;try{
if(!window.matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('anim-ready');}
if(sessionStorage.getItem('calvo:intro')){d.classList.add('intro-seen');}else{sessionStorage.setItem('calvo:intro','1');}
}catch(e){}
window.__calvoIntroFailsafe=setTimeout(function(){d.classList.add('intro-done');},4000);})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${display.variable} ${body.variable} ${mono.variable}`}
      // Opt in to Next.js keeping smooth scrolling out of route transitions.
      data-scroll-behavior="smooth"
      // The bootstrap script below stamps `anim-ready` / `intro-seen` onto this
      // element before React hydrates, so its className legitimately differs
      // from the server HTML. Suppressing here is scoped to this element only.
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: BOOTSTRAP }} />
      </head>
      <body className="surface-paper antialiased">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-8VK1GRS0MR"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-8VK1GRS0MR');
          `}
        </Script>
        <Preloader />

        <a className="skip-link" href="#main">
          {site.nav.skipToContent}
        </a>

        <SmoothScrollProvider />
        <CustomCursor />
        <Header />

        <main id="main">{children}</main>

        <Footer />

        <ChatWidget />
        <CallTracking />

        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
