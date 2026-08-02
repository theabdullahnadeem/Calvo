/**
 * Design tokens that JS needs to know about.
 * Values mirror styles/tokens.css — keep the two in sync when either changes.
 */

export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
} as const;

/** Easing curves shared between GSAP timelines and CSS transitions so hover
 *  states and scroll choreography read as one motion system. */
export const EASE = {
  outExpo: 'expo.out',
  outQuint: 'power4.out',
  inOut: 'power2.inOut',
} as const;

export const DURATION = {
  fast: 0.24,
  base: 0.5,
  slow: 0.9,
} as const;

/**
 * Wordmark asset. An alpha-only mask traced from the supplied lockup
 * (public/assets/logo/calvo-lockup.png) so the delivered letterforms can be
 * painted in `currentColor` and invert with the surface they sit on.
 *
 * Single reference point: swapping the wordmark means changing this path, or
 * passing `wordmarkSrc` to <Logo />. The mark itself lives in
 * components/ui/LogoMark.tsx for the same reason.
 */
export const WORDMARK_MASK_SRC = '/assets/logo/calvo-wordmark-mask.png';

/** Intrinsic 697x200 of the mask above — used to derive width from height. */
export const WORDMARK_ASPECT = 3.485;

export const SITE_URL = 'https://getcalvo.com';
