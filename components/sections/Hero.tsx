'use client';

import { useRef, type CSSProperties } from 'react';
import { brand, cta, sections } from '@/lib/content';
import { useGsapContext } from '@/components/motion/useGsapContext';
import MaskedWords from '@/components/motion/MaskedWords';
import PointerDepth from '@/components/motion/PointerDepth';
import Magnetic from '@/components/motion/Magnetic';
import Button from '@/components/ui/Button';

/**
 * Section 1 — Hero.
 *
 * Comprehension is never gated behind scroll (02-design-brief.md): the tagline,
 * the one-line description and the primary CTA are all in the first viewport
 * and all readable before any interaction.
 *
 * Two motion layers, both justified by content:
 *  - Load: words rise into place (CSS, no JS dependency).
 *  - Scroll: the whole hero recedes in z while the section below rises through
 *    it. This is the moment that establishes the depth language the rest of the
 *    page reuses.
 *
 * The ring field is the only "imagery" — concentric signal arcs, abstract and
 * vertical-neutral by design. No industry motif belongs in the core brand.
 */
type HeroProps = {
  /** Vertical pages pass their own copy; the homepage uses the brand defaults. */
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  /** Vertical heroes point their secondary CTA at that page's own problem block. */
  secondaryHref?: string;
};

export function Hero({
  eyebrow,
  headline,
  subheadline,
  secondaryHref = '/#how-it-works',
}: HeroProps = {}) {
  const ref = useRef<HTMLElement | null>(null);
  const copy = sections.hero;

  useGsapContext(ref, ({ gsap }, scope) => {
    const content = scope.querySelector('[data-hero-content]');
    const rings = scope.querySelectorAll<HTMLElement>('[data-ring-layer]');

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: scope,
        start: 'top top',
        end: 'bottom top',
        scrub: 0.4,
        invalidateOnRefresh: true,
      },
    });

    // Recede: the hero tips back and travels away from the viewer along z as
    // the next section rises through the space it leaves. Real CSS 3D —
    // translateZ plus rotateX against a perspective — not a scale standing in
    // for depth. This is the moment that sets the spatial language for the page,
    // so it is the one place the 3D is allowed to be pronounced.
    if (content) {
      tl.to(
        content,
        {
          y: -60,
          z: -320,
          rotateX: 7,
          opacity: 0.2,
          transformOrigin: '50% 100%',
          force3D: true,
        },
        0,
      );
    }

    // Ring layers sit at their own depths and move at their own rates, so the
    // field reads as a space the hero is receding into rather than one flat
    // image sliding behind it.
    rings.forEach((layer, i) => {
      tl.to(
        layer,
        { yPercent: -8 - i * 9, z: 60 + i * 90, rotateX: -3 - i * 2 },
        0,
      );
    });
  }, []);

  return (
    <section
      ref={ref as React.Ref<HTMLElement>}
      data-surface="ink"
      aria-labelledby="hero-heading"
      className="surface-ink stage relative isolate flex min-h-[100svh] flex-col overflow-hidden"
    >
      {/* The ring field is the layer that carries the pointer response: the
          scene has a viewing angle, and moving the mouse changes it. Wrapping
          the field rather than the copy keeps the headline dead steady while
          the space behind it moves. */}
      <PointerDepth className="absolute inset-0 z-0" tilt={7} perspective={1000}>
        <RingField />
      </PointerDepth>

      <div
        data-hero-content
        className="stage-3d shell relative z-10 flex min-h-[100svh] flex-col justify-between pb-[max(2rem,env(safe-area-inset-bottom))] pt-24 sm:pt-28"
      >
        <p className="eyebrow" data-intro style={introDelay(0.05)}>
          {eyebrow ?? copy.eyebrow}
        </p>

        <h1
          id="hero-heading"
          className="intro-words my-[clamp(2.5rem,7vh,5rem)] max-w-[17ch] font-display text-step-5 font-medium tracking-display"
        >
          <MaskedWords text={headline ?? brand.tagline} />
        </h1>

        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <p
            data-intro
            style={introDelay(0.62)}
            className="max-w-[42ch] text-[var(--muted)] text-step-0"
          >
            {subheadline ?? brand.shortDescription}
          </p>

          <div
            data-intro
            style={introDelay(0.72)}
            className="flex flex-wrap items-center gap-3"
          >
            <Magnetic>
              <Button href="/#book-a-demo" variant="primary" size="lg">
                {cta.primary}
              </Button>
            </Magnetic>
            <Button href={secondaryHref} variant="ghost" size="lg">
              {cta.secondary}
            </Button>
          </div>
        </div>

        <div
          data-intro
          style={introDelay(0.9)}
          className="mt-10 flex items-center gap-3 lg:mt-14"
          aria-hidden="true"
        >
          <span className="scroll-cue-line" />
          <span className="font-mono text-[10px] uppercase tracking-mono text-[var(--muted)]">
            {copy.scrollCue}
          </span>
        </div>
      </div>
    </section>
  );
}

const introDelay = (seconds: number) =>
  ({ ['--intro-delay' as string]: `${seconds}s` }) as CSSProperties;

/**
 * Concentric signal arcs — the abstract stand-in for a voice on a line.
 * Three layers so they can separate under parallax. Pure stroked SVG: no
 * raster asset, no layout cost, negligible paint at this opacity.
 */
function RingField() {
  const layers = [
    { radii: [520, 640, 760], opacity: 0.5 },
    { radii: [300, 380, 450], opacity: 0.75 },
    { radii: [110, 170, 235], opacity: 1 },
  ];

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-0 overflow-hidden"
    >
      <div className="absolute left-1/2 top-1/2 h-0 w-0 -translate-y-[8%] translate-x-[18%] sm:translate-x-[26%]">
        {layers.map((layer, i) => (
          <div
            key={i}
            data-ring-layer
            data-depth={0.4 + i * 0.9}
            className="absolute left-0 top-0"
            style={{ opacity: layer.opacity }}
          >
            <svg
              width="1600"
              height="1600"
              viewBox="-800 -800 1600 1600"
              className="absolute left-[-800px] top-[-800px] max-w-none"
              fill="none"
            >
              {layer.radii.map((r) => (
                <circle
                  key={r}
                  cx="0"
                  cy="0"
                  r={r}
                  stroke="currentColor"
                  strokeOpacity="0.13"
                  strokeWidth="1"
                />
              ))}
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Hero;
