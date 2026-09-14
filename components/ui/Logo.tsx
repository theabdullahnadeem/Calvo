import Link from 'next/link';
import type { CSSProperties, ReactNode } from 'react';
import { brand } from '@/lib/content';
import { WORDMARK_ASPECT, WORDMARK_MASK_SRC } from '@/lib/constants';
import LogoMark from './LogoMark';

type LogoProps = {
  /** `lockup` = mark + wordmark, `wordmark` = type only, `mark` = mark only. */
  variant?: 'lockup' | 'wordmark' | 'mark';
  /**
   * Override the mark with a custom element. Defaults to <LogoMark />, which is
   * the only place the mark's geometry lives — swapping the identity means
   * editing that one component or passing a different node here, never touching
   * the places the logo is used.
   */
  mark?: ReactNode;
  /** Override the wordmark asset. Defaults to WORDMARK_MASK_SRC. */
  wordmarkSrc?: string;
  /** Renders as a link to home unless false (the footer uses the static form). */
  href?: string | false;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
};

const SIZES = {
  sm: { mark: 15, gap: '0.5em' },
  md: { mark: 19, gap: '0.52em' },
  lg: { mark: 34, gap: '0.55em' },
} as const;

/**
 * The wordmark is painted as a CSS mask over `currentColor` rather than drawn as
 * an <img>. The supplied files are opaque PNGs on an off-white ground, which
 * would show as a light box on every dark section; masking keeps the delivered
 * letterforms exactly while letting them invert with the surface, and the mask
 * is a 17KB alpha-only asset traced from the highest-resolution lockup.
 */
export function Logo({
  variant = 'lockup',
  mark,
  wordmarkSrc = WORDMARK_MASK_SRC,
  href = '/',
  className = '',
  size = 'md',
}: LogoProps) {
  const s = SIZES[size];
  // The wordmark is optically a touch shorter than the mark in the real lockup.
  const wordmarkHeight = Math.round(s.mark * 0.78);

  const inner = (
    <>
      {variant !== 'wordmark' && (mark ?? <LogoMark className="logo-mark" />)}
      {variant !== 'mark' && (
        <span
          className="logo-wordmark"
          style={
            {
              WebkitMaskImage: `url(${wordmarkSrc})`,
              maskImage: `url(${wordmarkSrc})`,
              height: `${wordmarkHeight}px`,
              width: `${Math.round(wordmarkHeight * WORDMARK_ASPECT)}px`,
            } as CSSProperties
          }
        />
      )}
    </>
  );

  // `min-h-[44px]` only affects the hit area — the mark and wordmark are
  // vertically centred inside it and render at exactly the size they did.
  // Without it the only link in the header is a 19px-tall tap target.
  const classes = `logo inline-flex min-h-[44px] items-center leading-none ${className}`;
  const style = {
    ['--logo-mark-size' as string]: `${s.mark}px`,
    gap: s.gap,
  } as CSSProperties;

  if (href === false) {
    // role="img" is required, not decoration: aria-label is prohibited on a
    // bare <span>, and without a role the accessible name is dropped. The
    // lockup is a picture of the brand name, so img is the honest role.
    return (
      <span className={classes} style={style} role="img" aria-label={brand.name}>
        {inner}
      </span>
    );
  }

  return (
    <Link
      href={href}
      className={classes}
      style={style}
      aria-label={`${brand.name} — home`}
    >
      {inner}
    </Link>
  );
}

export default Logo;
