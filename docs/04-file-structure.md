# Calvo — File Structure

```
calvo-site/
├── app/
│   ├── layout.tsx                 # Root layout, fonts, global providers (Lenis)
│   ├── page.tsx                   # Homepage
│   ├── globals.css                # Tailwind base + design tokens (CSS variables)
│   ├── for-cpa-firms/
│   │   └── page.tsx               # CPA vertical landing page
│   ├── for-restaurants/
│   │   └── page.tsx               # Restaurant vertical landing page
│   ├── for-cafes/
│   │   └── page.tsx               # Cafe vertical landing page
│   ├── for-businesses/
│   │   └── page.tsx               # General/catch-all vertical page
│   └── api/                       # (only if needed — e.g. demo booking form handler)
│
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   ├── Footer.tsx
│   │   └── SmoothScrollProvider.tsx   # Lenis wrapper
│   │
│   ├── sections/                  # Homepage sections, one component per scroll "chapter"
│   │   ├── Hero.tsx
│   │   ├── ProblemStatement.tsx
│   │   ├── HowItWorks.tsx
│   │   ├── ProductPillars.tsx
│   │   ├── VerticalProof.tsx      # CPA case study proof point, vertical-neutral framing
│   │   ├── CTASection.tsx
│   │   └── ...
│   │
│   ├── motion/                    # Reusable animation primitives
│   │   ├── ScrollReveal.tsx       # Wraps children in a GSAP ScrollTrigger reveal
│   │   ├── ParallaxLayer.tsx      # Depth/parallax wrapper
│   │   ├── PinnedSection.tsx      # For pin-and-animate scroll sequences (k72-style)
│   │   └── useGsapContext.ts      # Hook: scoped GSAP context + cleanup on unmount
│   │
│   ├── ui/                        # Small reusable primitives
│   │   ├── Button.tsx
│   │   ├── Logo.tsx                # Wordmark + icon lockup, icon swappable via prop
│   │   └── ...
│   │
├── content/
│   └── info.json                  # The single source of truth (see 01-info.json)
│
├── lib/
│   ├── content.ts                 # Typed loader for info.json (Zod schema + parse)
│   ├── gsap.ts                    # GSAP + ScrollTrigger registration, shared config
│   └── constants.ts               # Design tokens referenced in JS (breakpoints etc.)
│
├── public/
│   ├── assets/
│   │   ├── logo/
│   │   │   ├── calvo-wordmark-light.svg
│   │   │   ├── calvo-wordmark-dark.svg
│   │   │   ├── calvo-icon-placeholder.svg   # current generic icon — swappable
│   │   │   └── favicon.ico
│   │   └── fonts/
│   └── og-image.png
│
├── styles/
│   └── tokens.css                 # Design token definitions (color, type scale) as CSS custom properties
│
├── tailwind.config.ts             # Tailwind config referencing tokens.css values
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md                      # Points back to this doc set for full context
```

## Notes on structure decisions

- **One component per scroll "chapter"** in `sections/` — matches how k72-style sites are actually built: each section owns its own ScrollTrigger timeline, scoped and cleaned up independently. Prevents one giant unmaintainable animation file.
- **`motion/` primitives are reusable** — `ScrollReveal`, `ParallaxLayer`, `PinnedSection` should be generic enough that any new section can compose them without writing raw GSAP from scratch each time.
- **`content/info.json` is the only place copy lives.** No component should have hardcoded English strings for real site copy — pull from the typed loader in `lib/content.ts`. This directly satisfies the "info is not lost" requirement — regenerating the site content is a matter of editing one file.
- **Vertical pages are structurally identical but content-swapped** — same section components, different `info.json` vertical data passed in, so building `/for-restaurants` after `/for-cpa-firms` is fast, not a rebuild.
