'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';

type Variant = 'primary' | 'ghost' | 'link';
type Size = 'md' | 'lg';

type ButtonProps = {
  children: ReactNode;
  href?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  onClick?: () => void;
  type?: 'button' | 'submit';
};

const BASE =
  'group relative inline-flex items-center justify-center gap-2 font-body font-medium ' +
  // 44px is the floor a thumb reliably lands on. The padded variants clear it
  // on their own at default type sizes, but the header overrides padding with
  // `!px-5 !py-2.5` and the `link` variant has no padding at all, so the floor
  // is declared here rather than left to whatever each caller happens to set.
  'min-h-[44px] ' +
  'transition-[transform,background-color,color,border-color] duration-fast ease-out-expo ' +
  'will-change-transform hover:-translate-y-[2px] active:translate-y-0 ' +
  'motion-reduce:transform-none motion-reduce:transition-none';

const VARIANTS: Record<Variant, string> = {
  // Solid accent — the single loudest element on any surface it appears on.
  primary:
    'rounded-full bg-[var(--accent-fg)] text-[var(--bg)] hover:brightness-110',
  // Outline that fills on hover. Reads correctly on both surfaces.
  ghost:
    'rounded-full border border-[var(--line)] text-[var(--fg)] ' +
    'hover:border-[var(--fg)] hover:bg-[var(--fg)] hover:text-[var(--bg)]',
  // Underline-on-hover text link with an arrow.
  link: 'text-[var(--fg)] underline-offset-[6px] hover:underline decoration-[var(--accent-fg)]',
};

const SIZES: Record<Size, string> = {
  md: 'px-6 py-3 text-[0.95rem]',
  lg: 'px-8 py-4 text-[1.02rem]',
};

/**
 * Per 05-animation-spec.md §6 the CTA's hover is a small, satisfying
 * micro-interaction — handled here in CSS rather than a scroll timeline, and
 * neutralised under `motion-reduce`.
 */
export function Button({
  children,
  href,
  variant = 'primary',
  size = 'md',
  className = '',
  onClick,
  type = 'button',
}: ButtonProps) {
  const classes = [
    BASE,
    VARIANTS[variant],
    variant === 'link' ? '' : SIZES[size],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const content = (
    <>
      {children}
      {variant === 'link' && (
        <span
          aria-hidden="true"
          className="inline-block transition-transform duration-fast ease-out-expo group-hover:translate-x-1 motion-reduce:transition-none"
        >
          &rarr;
        </span>
      )}
    </>
  );

  if (href) {
    const offsite = href.startsWith('http');
    const external = offsite || href.startsWith('mailto:') || href.startsWith('tel:');
    if (external) {
      return (
        <a
          href={href}
          className={classes}
          onClick={onClick}
          // Only a real off-site destination opens in a new tab. `tel:` and
          // `mailto:` hand off to the OS and must stay in the same tab, or the
          // visitor is left staring at a blank one after the dialer opens.
          {...(offsite ? { target: '_blank', rel: 'noopener' } : null)}
        >
          {content}
        </a>
      );
    }
    return (
      <Link href={href} className={classes} onClick={onClick}>
        {content}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {content}
    </button>
  );
}

export default Button;
