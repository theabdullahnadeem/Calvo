'use client';

import { motion, useReducedMotion } from 'motion/react';
import {
  productDemo,
  type PillarVisual as PillarVisualData,
} from '@/lib/content';
import AppFrame from './AppFrame';
import Waveform from './Waveform';
import useStaggerReveal from './useStaggerReveal';

/**
 * The dashboard view attached to each product pillar.
 *
 * One variant per pillar, in pillar order, so converting "What you get" to
 * cards did not require dropping or rewording a single pillar — the copy in
 * info.json is untouched and the visual is added beside it.
 *
 * Everything depicted is a capability info.json already claims:
 *  - config      agent trained on services, hours, pricing logic, escalation rules
 *  - callLog     calls logged with time, duration and outcome (the exact fields
 *                the privacy policy commits to), including escalation
 *  - voice       a natural conversation rather than an IVR menu
 *  - visibility  transcripts plus real-time CRM sync
 *
 * There is no inbox variant, no draft or approval variant, and no message
 * queue, because Calvo does none of those things.
 *
 * Rows carry `data-mock-reveal="row"` and are revealed imperatively by
 * useStaggerReveal — see that file for why the declarative Motion form leaves
 * them permanently invisible.
 */
export function PillarVisual({ visual }: { visual: PillarVisualData }) {
  const scope = useStaggerReveal({ selector: '[data-mock-reveal="row"]' });

  return (
    <div ref={scope}>
      <AppFrame title={visual.title}>
        {visual.kind === 'config' && (
          <ul className="flex flex-col gap-1.5">
            {visual.rows.map((label) => (
              <li
                key={label}
                data-mock-reveal="row"
                className="flex items-center gap-3 rounded-lg bg-[var(--panel)] px-3 py-2"
              >
                <Check />
                <span className="text-[0.82rem] text-[var(--fg)]">{label}</span>
                <span className="ml-auto font-mono text-[9px] uppercase tracking-mono text-[var(--accent-fg)]">
                  {visual.statusLabel}
                </span>
              </li>
            ))}
          </ul>
        )}

        {visual.kind === 'callLog' && (
          <>
            <div className="grid grid-cols-[auto_auto_1fr] gap-x-4 border-b border-[var(--line)] pb-2">
              {visual.columns.map((col) => (
                <span
                  key={col}
                  className="font-mono text-[9px] uppercase tracking-mono text-[var(--muted)] last:text-right"
                >
                  {col}
                </span>
              ))}
            </div>

            <ul className="mt-1 flex flex-col">
              {visual.rows.map((r, i) => {
                const escalated = r.outcome === 'Escalated';

                return (
                  <li
                    key={`${r.time}-${i}`}
                    data-mock-reveal="row"
                    className="grid grid-cols-[auto_auto_1fr] items-center gap-x-4 border-b border-[var(--line)] py-2 last:border-0"
                  >
                    <span className="font-mono text-[0.72rem] text-[var(--muted)] [font-variant-numeric:tabular-nums]">
                      {r.time}
                    </span>
                    <span className="font-mono text-[0.72rem] text-[var(--muted)] [font-variant-numeric:tabular-nums]">
                      {r.duration}
                    </span>
                    {/* Escalation is the outcome worth seeing, so it is the
                        only one that takes the accent. */}
                    <span
                      className={[
                        'text-right text-[0.78rem]',
                        escalated
                          ? 'text-[var(--accent-fg)]'
                          : 'text-[var(--fg)]',
                      ].join(' ')}
                    >
                      {r.outcome}
                    </span>
                  </li>
                );
              })}
            </ul>

            <p className="mt-3 text-[0.76rem] leading-relaxed text-[var(--muted)]">
              {visual.escalationNote}
            </p>
          </>
        )}

        {visual.kind === 'voice' && (
          <div className="flex flex-col gap-4 py-2">
            <Waveform bars={28} className="h-12 w-full [&>span]:flex-1" />
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1">
              <span className="font-mono text-[10px] uppercase tracking-mono text-[var(--accent-fg)]">
                {visual.waveformLabel}
              </span>
              <span className="text-[0.78rem] text-[var(--muted)]">
                {visual.note}
              </span>
            </div>
          </div>
        )}

        {visual.kind === 'visibility' && (
          <>
            <p className="font-mono text-[9px] uppercase tracking-mono text-[var(--muted)]">
              {visual.transcriptLabel}
            </p>

            <div className="mt-2 flex flex-col gap-1.5">
              {productDemo.transcript.neutral.lines.slice(0, 2).map((l, i) => (
                <p
                  key={i}
                  data-mock-reveal="row"
                  className={[
                    'truncate rounded-md px-2.5 py-1.5 text-[0.76rem]',
                    l.speaker === 'agent'
                      ? 'border border-[var(--accent-fg)]/25 bg-[var(--accent-fg)]/10 text-[var(--fg)]'
                      : 'bg-[var(--panel)] text-[var(--muted)]',
                  ].join(' ')}
                >
                  {l.text}
                </p>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-[var(--line)] pt-3">
              <span className="font-mono text-[9px] uppercase tracking-mono text-[var(--muted)]">
                {visual.syncTitle}
              </span>
              <span className="font-mono text-[9px] uppercase tracking-mono text-[var(--accent-fg)]">
                {visual.realTimeLabel}
              </span>
            </div>

            <ul className="mt-2 flex flex-col gap-1.5">
              {visual.syncRows.map((r) => (
                <li
                  key={r.label}
                  data-mock-reveal="row"
                  className="flex items-center gap-3"
                >
                  {r.state === 'Synced' ? <Check /> : <Pulse />}
                  <span className="text-[0.78rem] text-[var(--muted)]">
                    {r.label}
                  </span>
                  <span className="ml-auto font-mono text-[9px] uppercase tracking-mono text-[var(--muted)]">
                    {r.state}
                  </span>
                </li>
              ))}
            </ul>
          </>
        )}
      </AppFrame>
    </div>
  );
}

function Check() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 12 12"
      className="h-3 w-3 flex-none text-[var(--accent-fg)]"
      fill="none"
    >
      <path
        d="M2.5 6.4 4.9 8.8 9.5 3.4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * In-flight state for a row that is still syncing.
 *
 * This one stays declarative: its `animate` target is always defined, so Motion
 * has a value from mount and the problem described in useStaggerReveal does not
 * apply.
 */
function Pulse() {
  // Holds steady under reduced motion — an indefinitely repeating pulse is
  // exactly what that preference is asking not to see.
  const still = useReducedMotion();

  return (
    <motion.span
      aria-hidden="true"
      className="h-1.5 w-1.5 flex-none rounded-full bg-[var(--accent-fg)]"
      animate={still ? undefined : { opacity: [1, 0.25, 1] }}
      transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
    />
  );
}

export default PillarVisual;
