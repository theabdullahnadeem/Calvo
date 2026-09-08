'use client';

import { useRef, type CSSProperties } from 'react';
import { brand, cta, sections } from '@/lib/content';
import { useGsapContext } from '@/components/motion/useGsapContext';
import MaskedWords from '@/components/motion/MaskedWords';
import PointerDepth from '@/components/motion/PointerDepth';
import Magnetic from '@/components/motion/Magnetic';
import Button from '@/components/ui/Button';
import dynamic from 'next/dynamic';

/**
 * The panel still server-renders — the transcript has to be in the HTML for
 * crawlers, for no-JS and for reduced motion — but its client chunk, and the
 * Motion.dev runtime it pulls in, are split out of the route's first load.
 * Motion in the initial bundle cost 44 kB, which the Lighthouse >= 85
 * requirement in 02-design-brief.md has no room for.
 */
const LiveCallPanel = dynamic(
  () => import('@/components/dashboard/LiveCallPanel'),
);

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
  /** Which example transcript the hero panel plays. CPA language stays on
   *  /for-cpa-firms — 02-design-brief.md keeps the homepage vertical-neutral. */
  demoVariant?: 'neutral' | 'cpa';
};

export function Hero({
  eyebrow,
  headline,
  subheadline,
  secondaryHref = '/#how-it-works',
  demoVariant = 'neutral',
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

        {/* Two columns from lg: the argument on the left, the product view on
            the right. Below lg the panel stacks under the CTAs, so a phone
            still opens on the headline and the primary action rather than on a
            mockup. The headline steps down from --step-5 to --step-4 to make
            room for the panel; it is still the largest type on the page. */}
        <div className="my-[clamp(2rem,5vh,3.5rem)] grid items-center gap-y-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,27rem)] lg:gap-x-[clamp(2rem,5vw,5rem)]">
          <div>
            <h1
              id="hero-heading"
              className="intro-words max-w-[15ch] font-display text-step-4 font-medium tracking-display"
            >
              <MaskedWords text={headline ?? brand.tagline} />
            </h1>

            <p
              data-intro
              style={introDelay(0.62)}
              className="mt-8 max-w-[42ch] text-[var(--muted)] text-step-0"
            >
              {subheadline ?? brand.shortDescription}
            </p>

            <div
              data-intro
              style={introDelay(0.72)}
              className="mt-9 flex flex-wrap items-center gap-3"
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

          <div data-intro style={introDelay(0.84)} className="w-full">
            <LiveCallPanel variant={demoVariant} />
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
