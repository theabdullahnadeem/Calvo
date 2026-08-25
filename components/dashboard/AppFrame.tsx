'use client';

import type { ReactNode } from 'react';
import { productDemo } from '@/lib/content';

type AppFrameProps = {
  title?: string;
  /** Sits at the right of the chrome bar, before the illustrative badge. */
  aside?: ReactNode;
  children: ReactNode;
  className?: string;
};

/**
 * Dark application chrome for the product mockups.
 *
 * The frame carries `.surface-ink`, which re-declares the whole semantic token
 * set (--fg, --muted, --line, --panel, --accent-fg) for everything inside it.
 * That is what lets a dark product view sit on a light section without a single
 * hardcoded colour: the section stays paper, the frame is ink, and the
 * ink/paper rhythm documented in app/page.tsx survives intact.
 *
 * The "example view" badge is load-bearing, not decoration, and must not be
 * removed. content/info.json makes no claim about live call volume anywhere, so
 * every mockup says in the UI that it is illustrative rather than leaving the
 * visitor to assume these are real numbers.
 */
export function AppFrame({ title, aside, children, className }: AppFrameProps) {
  const demo = productDemo;

  return (
    <div
      className={[
        'surface-ink overflow-hidden rounded-xl border border-[var(--line)]',
        // --elev-2 from styles/tokens.css — the same ramp the pricing cards
        // use, so every raised panel on the site shares one elevation language.
        'shadow-[var(--elev-2)]',
        className ?? '',
      ].join(' ')}
    >
      <div className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-3">
        <span
          aria-hidden="true"
          className="h-2 w-2 flex-none rounded-full bg-[var(--accent-fg)]"
        />
        <span className="truncate font-mono text-[10px] uppercase tracking-mono text-[var(--muted)]">
          {title ?? demo.frameTitle}
        </span>

        <span className="ml-auto flex items-center gap-2.5">
          {aside}
          {/* Stated in the interface, not just in a code comment. */}
          <span className="whitespace-nowrap rounded-full border border-[var(--line)] px-2.5 py-1 font-mono text-[9px] uppercase tracking-mono text-[var(--muted)]">
            {demo.illustrativeLabel}
          </span>
        </span>
      </div>

      <div className="p-4">{children}</div>
    </div>
  );
}

export default AppFrame;
