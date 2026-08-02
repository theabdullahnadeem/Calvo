'use client';

import { sections } from '@/lib/content';
import PinnedSection from '@/components/motion/PinnedSection';
import MaskedWords from '@/components/motion/MaskedWords';

/**
 * Section 2 — Problem statement.
 *
 * The stakes-setting beat, held briefly on a pin so the sentence gets a moment
 * of undivided attention (05-animation-spec.md §2). Short hold — one and a bit
 * screens of scroll, not a long scroll-jack.
 *
 * The supporting visual is a call log filling with unanswered calls: two mono
 * columns that scroll past while the statement is held, with the failures
 * marked in accent. Abstract and vertical-neutral — a phone log belongs to
 * every business on the list, not to one industry.
 */
export function ProblemStatement() {
  const copy = sections.problem;

  return (
    <PinnedSection
      id="the-problem"
      aria-labelledby="problem-heading"
      data-surface="ink"
      distance={1.4}
      className="surface-ink relative isolate flex min-h-[100svh] items-center overflow-hidden"
      build={({ gsap, tl, scope }) => {
        const words = scope.querySelectorAll('[data-word-reveal] .word-inner');
        const columns = scope.querySelectorAll<HTMLElement>('[data-log-column]');
        const support = scope.querySelector('[data-reveal]');
        const plate = scope.querySelector<HTMLElement>('[data-statement-plate]');

        // The whole statement block tips up out of the page plane as it lands.
        // Applied to the plate rather than the words: the words sit inside
        // overflow-hidden masks, and rotating them individually would clip
        // against the mask edges at an angle.
        if (plate) {
          gsap.set(plate, {
            transformPerspective: 1300,
            transformOrigin: '0% 100%',
          });
          tl.fromTo(
            plate,
            { rotateX: 13, z: -260 },
            { rotateX: 0, z: 0, duration: 0.6 },
            0,
          );
        }

        // 0 → 0.45: the sentence lands, word by word.
        //
        // fromTo, not to: the hidden state comes from CSS as `translate3d(0,
        // 105%, 0)`, and getComputedStyle hands GSAP a matrix with that 105%
        // already resolved to pixels. Tweening `yPercent` alone would leave the
        // pixel offset untouched and the words would never arrive. Declaring
        // both ends here puts GSAP in charge of the whole transform.
        tl.fromTo(
          words,
          { yPercent: 105, y: 0 },
          { yPercent: 0, y: 0, duration: 0.45, stagger: 0.035 },
          0,
        );

        // The log keeps scrolling for the whole hold — it is the thing that
        // does not stop while you read.
        columns.forEach((column, i) => {
          tl.fromTo(
            column,
            { yPercent: i % 2 === 0 ? 4 : -4 },
            { yPercent: i % 2 === 0 ? -34 : -26, duration: 1 },
            0,
          );
        });

        // Support copy arrives after the statement has had its beat.
        if (support) {
          tl.to(support, { opacity: 1, y: 0, duration: 0.3 }, 0.5);
        }
      }}
    >
      <CallLog entries={copy.ticker} />

      <div data-statement-plate className="shell relative z-10 py-16 sm:py-20">
        <p className="eyebrow">{copy.eyebrow}</p>

        <h2
          id="problem-heading"
          data-word-reveal
          className="mt-8 max-w-[20ch] font-display text-step-4 font-medium tracking-display"
        >
          <MaskedWords text={copy.statement} />
        </h2>

        <p
          data-reveal="up"
          className="mt-9 max-w-[46ch] text-[var(--muted)] text-step-0"
        >
          {copy.support}
        </p>
      </div>
    </PinnedSection>
  );
}

/**
 * Two columns of call outcomes, kept deliberately quiet.
 *
 * It has to read as something happening in the background while you take in the
 * sentence — never as a second thing to read. Hence the low base opacity, the
 * gradient mask that dissolves it top, bottom and toward the headline, and the
 * near-invisible treatment of the "ring" entries so only the failures register.
 *
 * Decorative, so it is hidden from assistive tech; the statement and support
 * copy carry all the meaning. Dropped entirely below `lg`, where there is no
 * room for it to sit beside the text without competing.
 */
function CallLog({ entries }: { entries: string[] }) {
  const column = [...entries, ...entries, ...entries];
  const isFailure = (entry: string) => entry.toLowerCase() !== 'ring';

  return (
    <div
      aria-hidden="true"
      className="call-log pointer-events-none absolute inset-0 z-0 hidden justify-end gap-[5vw] pr-[var(--gutter)] lg:flex"
    >
      {[0, 1].map((columnIndex) => (
        <ul
          key={columnIndex}
          data-log-column
          className="flex flex-none flex-col gap-5 pt-10 font-mono text-[11px] uppercase tracking-mono"
        >
          {column.map((entry, i) => (
            <li
              key={`${entry}-${i}`}
              className={
                isFailure(entry)
                  ? 'text-[var(--accent-fg)]'
                  : 'text-[var(--muted)] opacity-30'
              }
            >
              <span className="mr-3 opacity-40">
                {String((i % 12) * 7 + columnIndex * 3 + 1).padStart(2, '0')}
              </span>
              {entry}
            </li>
          ))}
        </ul>
      ))}
    </div>
  );
}

export default ProblemStatement;
