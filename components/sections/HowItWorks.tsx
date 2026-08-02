'use client';

import type { CSSProperties } from 'react';
import { content, sections } from '@/lib/content';
import PinnedSection from '@/components/motion/PinnedSection';

/**
 * Section 3 — How it works.
 *
 * The one section where a pin-and-step sequence is earned: the content is
 * genuinely sequential, so moving through it horizontally reads as moving
 * through a process (05-animation-spec.md §3). Numbered markers are legitimate
 * here for the same reason, and only here.
 *
 * Layout is authored as a plain vertical list. The horizontal track only exists
 * under `.anim-ready` at ≥768px — so reduced-motion visitors, narrow screens
 * and anything without JS get the same four steps stacked and readable, with no
 * separate fallback markup to keep in sync.
 *
 * Depth is scale + opacity rather than rotateY. Nested `preserve-3d` inside a
 * horizontally translated track is exactly the case 03-tech-stack.md flags as
 * unreliable in Safari, and the brief says simplify rather than ship it broken.
 */
export function HowItWorks() {
  const copy = sections.howItWorks;
  const steps = content.howItWorks;

  return (
    <PinnedSection
      id="how-it-works"
      aria-labelledby="how-it-works-heading"
      data-surface="paper"
      distance={3}
      className="surface-paper relative flex min-h-[100svh] flex-col justify-center overflow-hidden py-24 md:py-0"
      build={({ gsap, tl, scope }) => {
        const track = scope.querySelector<HTMLElement>('[data-steps-track]');
        const panels = gsap.utils.toArray<HTMLElement>(
          scope.querySelectorAll('[data-step-panel]'),
        );
        const progress = scope.querySelector<HTMLElement>('[data-steps-progress]');
        const count = panels.length;
        if (!track || count < 2) return;

        // A step needs a beat where nothing moves, or the first one starts
        // sliding away the instant the section pins and nobody reads it.
        const DWELL = 0.55;
        const MOVE = 1;

        // Each panel is its own 3D card: it swings in from the right on the Y
        // axis while sitting further back in z, then squares up to the viewer.
        // That is the "depth-layered transition, not a simple fade" the spec
        // asks for — you are moving through the process in space rather than
        // watching slides cross-fade.
        //
        // Perspective is set per panel, so the horizontally translated track
        // never becomes a preserve-3d parent. Nested preserve-3d inside a moving
        // container is precisely the Safari case 03-tech-stack.md flags, and the
        // per-element form avoids it rather than testing around it.
        const RECESSED = { z: -420, rotateY: 26, opacity: 0.18 };
        const PRESENT = { z: 0, rotateY: 0, opacity: 1 };

        gsap.set(panels, {
          transformPerspective: 1400,
          transformOrigin: '50% 50%',
          force3D: true,
        });

        // Everything but the first step starts recessed, set immediately rather
        // than at the head of its own tween — otherwise a panel pops from full
        // presence down to recessed the moment its transition begins.
        panels.forEach((panel, i) => {
          if (i > 0) gsap.set(panel, RECESSED);
        });

        let at = DWELL;
        for (let i = 0; i < count - 1; i++) {
          tl.to(
            track,
            { xPercent: -(100 * (i + 1)) / count, duration: MOVE },
            at,
          );
          // Outgoing swings away from the viewer, incoming squares up.
          tl.to(
            panels[i],
            { ...RECESSED, rotateY: -26, duration: MOVE },
            at,
          );
          tl.to(panels[i + 1], { ...PRESENT, duration: MOVE }, at);

          if (progress) {
            tl.fromTo(
              progress,
              { scaleX: (i + 1) / count },
              { scaleX: (i + 2) / count, duration: MOVE },
              at,
            );
          }
          at += MOVE + DWELL;
        }

        // Empty tail tween so the final step gets the same dwell as the others
        // before the pin releases.
        tl.to({}, { duration: DWELL }, at - DWELL);
      }}
    >
      {/* Static, not a ScrollReveal: this heading is the fixed frame the panels
          move behind, and a reveal trigger nested inside a pinned container
          resolves its start against a position the element never scrolls
          through — it would simply never fire. */}
      <div className="shell w-full md:pt-28">
        <p className="eyebrow">{copy.eyebrow}</p>
        <h2
          id="how-it-works-heading"
          className="mt-6 max-w-[18ch] font-display text-step-3 font-medium tracking-display"
        >
          {copy.heading}
        </h2>
      </div>

      <div
        className="steps-viewport mt-14 md:mt-0"
        style={{ ['--steps' as string]: steps.length } as CSSProperties}
      >
        <ol data-steps-track className="steps-track">
          {steps.map((step, i) => (
            <li key={step.step} data-step-panel className="steps-panel">
              <div className="steps-panel-inner flex items-center justify-between gap-12">
                <div>
                  <span
                    aria-hidden="true"
                    className="font-mono text-[11px] uppercase tracking-mono text-[var(--accent-fg)]"
                  >
                    {copy.stepLabel} {String(i + 1).padStart(2, '0')}
                  </span>
                  <h3 className="mt-5 max-w-[20ch] font-display text-step-2 font-medium tracking-display">
                    {step.step}
                  </h3>
                  <p className="mt-4 max-w-[44ch] text-[var(--muted)] text-step-0">
                    {step.description}
                  </p>
                </div>

                {/* Counterweight for the empty half of a full-viewport panel,
                    and a second read on where you are in the sequence. Ghosted
                    so it never competes with the step's own heading. */}
                <span
                  aria-hidden="true"
                  className="hidden select-none font-display text-step-6 font-medium leading-none tracking-display text-[var(--fg)] opacity-[0.05] lg:block"
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Progress rail — only meaningful while the section is pinned, so it is
          hidden on the stacked layout where the list order already shows it. */}
      <div className="shell hidden w-full pb-28 md:block">
        <div
          role="progressbar"
          aria-label={copy.progressLabel}
          aria-valuemin={1}
          aria-valuemax={steps.length}
          aria-valuenow={1}
          className="mt-12 h-px w-full bg-[var(--line)]"
        >
          <span
            data-steps-progress
            className="block h-full origin-left bg-[var(--accent-fg)]"
            style={{ transform: `scaleX(${1 / steps.length})` }}
          />
        </div>
      </div>
    </PinnedSection>
  );
}

export default HowItWorks;
