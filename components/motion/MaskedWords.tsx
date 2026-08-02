import type { CSSProperties } from 'react';

type MaskedWordsProps = {
  text: string;
  className?: string;
  /** Index the stagger starts from, for headlines split across two elements. */
  startIndex?: number;
};

/**
 * Wraps each word in an overflow-hidden mask so it can slide up from behind
 * its own baseline.
 *
 * Word-level, deliberately — 05-animation-spec.md rules out letter-by-letter
 * ("reads as try-hard/dated"). Rendered on the server as ordinary inline text
 * with real spaces between the masks, so the sentence is intact for crawlers,
 * for copy/paste, and for screen readers, which read the spans as one string.
 *
 * The hidden start state and the reveal are pure CSS (see app/globals.css) and
 * only apply under `.anim-ready` — the hero never waits on JS to become legible.
 */
export function MaskedWords({
  text,
  className,
  startIndex = 0,
}: MaskedWordsProps) {
  const words = text.split(' ');

  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`}>
          <span
            className="word-mask"
            style={{ ['--i' as string]: i + startIndex } as CSSProperties}
          >
            <span className="word-inner" data-word="">
              {word}
            </span>
          </span>
          {i < words.length - 1 ? ' ' : ''}
        </span>
      ))}
    </span>
  );
}

export default MaskedWords;
