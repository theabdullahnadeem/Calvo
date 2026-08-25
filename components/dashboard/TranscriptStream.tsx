'use client';

import { productDemo, type Transcript } from '@/lib/content';
import useStaggerReveal from './useStaggerReveal';

type TranscriptStreamProps = {
  transcript: Transcript;
  className?: string;
};

/**
 * A call transcript arriving line by line.
 *
 * Laid out as a transcript — a speaker column beside the line — rather than as
 * opposed chat bubbles. Two reasons: opposed bubbles read as a two-party
 * messaging thread, which is the inbox metaphor this redesign has to stay clear
 * of, and the stacked-label version was 344px tall, which pushed the hero panel
 * past the fold on every viewport tested.
 *
 * Motion.dev drives the entrance rather than GSAP: it is component-level state
 * (in-view -> play) with no tie to scroll position, which is the split
 * lib/anime.ts documents for the three engines on this site.
 *
 * The hidden start state comes from the `.anim-ready [data-mock-reveal]` rule
 * in globals.css, so nothing is hidden in the server-rendered HTML; the reveal
 * runs imperatively from an effect. See useStaggerReveal for why the
 * declarative form cannot work against a CSS start state.
 *
 * What this depicts is what info.json already claims: the agent answers,
 * qualifies, and routes. There is no draft, no approval step, and nothing to
 * send — the transcript is a record of a voice call, which is the only thing
 * Calvo produces.
 */
export function TranscriptStream({
  transcript,
  className,
}: TranscriptStreamProps) {
  const scope = useStaggerReveal({
    selector: '[data-mock-reveal="line"]',
    amount: 0.3,
    each: 0.42,
  });
  const copy = productDemo.transcript;

  return (
    <div ref={scope} className={className}>
      <div className="flex items-center justify-between gap-3">
        <span className="font-mono text-[10px] uppercase tracking-mono text-[var(--muted)]">
          {copy.eyebrow}
        </span>
        <span className="font-mono text-[10px] text-[var(--muted)]">
          {transcript.context}
        </span>
      </div>

      <ol className="mt-3 flex flex-col gap-2">
        {transcript.lines.map((line, i) => {
          const isAgent = line.speaker === 'agent';

          return (
            <li
              key={i}
              data-mock-reveal="line"
              className="grid grid-cols-[3.6rem_1fr] items-baseline gap-x-3"
            >
              <span
                className={[
                  'font-mono text-[9px] uppercase tracking-mono',
                  isAgent ? 'text-[var(--accent-fg)]' : 'text-[var(--muted)]',
                ].join(' ')}
              >
                {isAgent ? copy.agentLabel : copy.callerLabel}
              </span>
              <p
                className={[
                  'text-[0.8rem] leading-snug',
                  isAgent ? 'text-[var(--fg)]' : 'text-[var(--muted)]',
                ].join(' ')}
              >
                {line.text}
              </p>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default TranscriptStream;
