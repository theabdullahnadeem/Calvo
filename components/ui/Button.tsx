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
    const external = href.startsWith('http') || href.startsWith('mailto:');
    if (external) {
      return (
        <a href={href} className={classes} onClick={onClick}>
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
