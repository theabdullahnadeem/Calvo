'use client';

import { motion, useReducedMotion } from 'motion/react';
import { productDemo, type CallStatus } from '@/lib/content';
import CountUp from '@/components/motion/CountUp';
import AppFrame from './AppFrame';
import Waveform from './Waveform';
import TranscriptStream from './TranscriptStream';
import useStaggerReveal from './useStaggerReveal';

type LiveCallPanelProps = {
  /** Homepage passes the neutral transcript; /for-cpa-firms passes the CPA one. */
  variant?: 'neutral' | 'cpa';
  className?: string;
};

/**
 * The hero product view: several calls being handled at once, and one of them
 * transcribed live.
 *
 * On the counter — content/info.json makes no concurrency claim anywhere. The
 * only occurrence of "simultaneously" in the whole file is a restaurant pain
 * point about human staff. So this counter is presented as an example view and
 * says so twice: once in the frame chrome, once beside the number itself. It
 * illustrates the claim that is real ("answers instantly, every time,
 * regardless of call volume") without inventing a live production figure.
 *
 * Structural note: the counter row is a <div>, not a <p>. Waveform renders a
 * <div>, and block content inside a <p> is invalid HTML — the parser closes the
 * <p> early, hydration mismatches, React regenerates the tree, and the re-render
 * of <html> strips the `anim-ready` class the head bootstrap added. That silently
 * kills every animation on the site. Do not turn it back into a <p>.
 *
 * Deliberately absent: any inbox, any draft or approval step, any send action,
 * any channel other than voice. Every row here is a phone call in one of the
 * four states the agent actually moves a call through.
 */
export function LiveCallPanel({
  variant = 'neutral',
  className,
}: LiveCallPanelProps) {
  // Scoped to the call rows only. The transcript nested below runs its own
  // scope with its own selector, so neither drives the other's elements.
  const scope = useStaggerReveal({
    selector: '[data-mock-reveal="call"]',
    amount: 0.25,
    startDelay: 0.15,
    each: 0.12,
  });

  const demo = productDemo;
  const live = demo.liveCall;
  const transcript = variant === 'cpa' ? demo.transcript.cpa : demo.transcript.neutral;

  return (
    <div ref={scope} className={className}>
      <AppFrame>
        {/* Counter. CountUp is the site's existing number tween — it
            server-renders the final value and skips the tween under reduced
            motion, so this reuses that behaviour rather than adding a second
            counting implementation. */}
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-2">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-mono text-[var(--muted)]">
              {live.counterLabel}
            </p>
            <div className="mt-2 flex items-baseline gap-3">
              <CountUp
                from={live.counterFrom}
                to={live.counterTo}
                duration={1.1}
                className="font-display text-step-2 font-medium leading-none tracking-display text-[var(--accent-fg)] [font-variant-numeric:tabular-nums]"
              />
              <Waveform bars={9} className="h-5 translate-y-[-2px]" />
            </div>
          </div>

          {/* Second statement of the same caveat, at the number rather than in
              the chrome. Do not remove — see the note above. */}
          <p className="font-mono text-[9px] uppercase tracking-mono text-[var(--muted)]">
            {live.illustrativeNote}
          </p>
        </div>

        <ul className="mt-4 flex flex-col gap-1 border-t border-[var(--line)] pt-3">
          {demo.callQueue.map((call) => (
            <li
              key={call.line}
              data-mock-reveal="call"
              className="flex items-center gap-2.5 rounded-lg bg-[var(--panel)] px-2.5 py-1.5 sm:gap-3 sm:px-3"
            >
              <StatusDot status={call.status} />
              <span className="flex-none font-mono text-[10px] uppercase tracking-mono text-[var(--muted)]">
                {call.line}
              </span>
              {/* The status is the one part of the row that may give ground on
                  a narrow screen — the line number and the duration are both
                  short and fixed, so letting this truncate keeps four real
                  columns on a 320px phone rather than blowing the frame out. */}
              <span className="min-w-0 truncate text-[0.8rem] text-[var(--fg)]">
                {live.statuses[call.status]}
              </span>
              <span className="ml-auto flex-none font-mono text-[10px] text-[var(--muted)] [font-variant-numeric:tabular-nums]">
                {call.duration}
              </span>
            </li>
          ))}
        </ul>

        <TranscriptStream
          transcript={transcript}
          className="mt-4 border-t border-[var(--line)] pt-3"
        />
      </AppFrame>
    </div>
  );
}

/** Only a call actually on audio gets the pulsing treatment. */
function StatusDot({ status }: { status: CallStatus }) {
  // Reduced motion switches the whole animation layer off on this site, not
  // just the scroll work — an indefinitely repeating pulse is exactly what that
  // preference is asking not to see. The dot still renders, it just holds.
  const still = useReducedMotion();
  const live = !still && (status === 'answering' || status === 'qualifying');

  return (
    <span aria-hidden="true" className="relative flex h-1.5 w-1.5 flex-none">
      {live && (
        <motion.span
          className="absolute inset-0 rounded-full bg-[var(--accent-fg)]"
          animate={{ opacity: [0.7, 0, 0.7], scale: [1, 2.4, 1] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeOut' }}
        />
      )}
      <span
        className={[
          'relative h-1.5 w-1.5 rounded-full',
          live ? 'bg-[var(--accent-fg)]' : 'bg-[var(--muted)]',
        ].join(' ')}
      />
    </span>
  );
}

export default LiveCallPanel;
