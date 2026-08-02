# Calvo — Design Brief

## Reference direction

**k72.ca** — narrative, scroll-driven storytelling; bold typographic moments; unexpected transitions between sections; motion that feels art-directed, not templated.

**apple.com** — restraint around the motion; confident whitespace; product-first framing even when the "product" is abstract (a voice agent, not a physical object); typography does more work than decoration.

The synthesis: **spectacle in the transitions, restraint in the resting states.** Each section should land clean and confident when scroll stops — the motion is how you get there, not a constant ambient effect layered on top of everything.

## Spatial UI direction

Sections should feel like they exist in a shallow 3D space, not a flat stacked page:
- Layered depth via parallax (background/midground/foreground moving at different scroll speeds)
- Elements that scale, rotate slightly, or shift in z-index as they enter/exit viewport
- Avoid literal 3D/WebGL unless explicitly decided — "spatial" here means *implied* depth through layering, scale, and parallax, not necessarily a 3D engine. (If a real 3D layer is wanted, that's a bigger scope decision — flag before building.)

## Tone-of-voice for visual design (not copy)

Calvo is B2B infrastructure sold to skeptical, time-poor business owners (CPA firm partners, restaurant/cafe owners). The site can be spectacular in craft while staying legible and fast to parse:
- No effect should ever obscure or delay the reader from understanding what Calvo does
- The hero must communicate the core value prop within the first viewport, even before any scroll interaction — motion enhances comprehension, it doesn't gate it
- Every scroll-triggered reveal should have a clear "why here" — motion tied to actual content logic (a step revealing, a number counting, a call transcript animating in), not decoration for its own sake

## Explicit constraints (do not violate)

1. **Vertical-neutral core brand.** No visual motif tied specifically to accounting, restaurants, or any single vertical on the homepage or core brand pages. Vertical-specific imagery belongs only on `/for-[vertical]` pages.
2. **Performance is a requirement, not a nice-to-have.** Target Lighthouse Performance ≥ 85 on the homepage despite heavy animation. This is achievable but requires deliberate choices — see `03-tech-stack.md` and `06-build-prompt.md` for the specific techniques required (lazy-loading below-fold animation, `will-change` used sparingly, GSAP timeline cleanup, no unoptimized video/Lottie bloat).
3. **Reduced-motion respected.** A `prefers-reduced-motion` fallback is required — not optional — that still communicates the full page content without the scroll-driven animation layer.
4. **Accessible despite the motion.** Keyboard navigation and screen reader users must be able to access all content and CTAs without relying on scroll-triggered reveals working correctly for them.
5. **Icon mark is not final.** Build the site using the wordmark only, or the current placeholder icon clearly marked as swappable — do not hardcode the current generic waveform icon deep into multiple components in a way that's expensive to replace later.

## Color

- Base: near-black (#0B0E11) on off-white (#FAFAF8), inverted for dark sections
- Accent: placeholder forest green — **not yet confirmed as final**. Build with the accent as a CSS variable / design token, not hardcoded, so it can be swapped in one place once confirmed.

## Typography

- Display face: geometric sans-serif matching the wordmark (e.g. a licensed or free equivalent to what the logo uses — Neue Montreal, General Sans, or similar; confirm exact license before shipping)
- Body face: a complementary, highly legible sans for paragraph copy — do not use the display face for body text at small sizes
- Large type is a primary design tool here (per k72/Apple reference) — don't default to small, timid type sizes for headline moments

## What NOT to do

- No default AI-generated-site tropes: no warm cream + terracotta palette, no generic acid-green-on-black, no numbered-marker (01/02/03) sections unless the content is genuinely sequential (the "How it works" section legitimately is — most others are not)
- No stock photography of generic "business people on phones"
- No fake/placeholder testimonials — leave testimonial sections empty or clearly marked TODO until real ones exist
- No animation that exists purely to prove GSAP was used — every motion choice should be justifiable by "this helps the visitor understand or feel X"
