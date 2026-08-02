# Calvo — Animation Spec

Section-by-section behavior. Each entry: what triggers, what happens, why (tie to content, per design brief rule that motion must be justified).

## Global

- **Spatial/depth mechanism:** CSS 3D transforms (`perspective`, `translateZ`, `rotateX/Y`), values driven by GSAP via ScrollTrigger. Test in Safari desktop and iOS specifically during build — CSS 3D has known Safari rendering quirks and z-fighting risk on overlapping layered elements; simplify rather than ship a broken Safari experience.
- **Smooth scroll** via Lenis wrapping the whole page, tuned to a natural (not sluggish) easing — avoid the overly heavy "molasses scroll" feel some sites over-apply.
- **Custom cursor** (optional, k72-influenced): subtle cursor treatment on interactive elements — a small scale/color shift on hover, not a large distracting custom cursor graphic. Keep restrained per Apple-side of the reference.
- **Page load sequence:** brief, confident load-in on first paint (logo/wordmark settles into place, hero headline fades/slides up) — under 1 second total, never a long intro animation that delays access to content. Skippable/instant for repeat visitors (respect session storage so it doesn't replay every navigation).

## 1. Hero

- **Trigger:** page load, no scroll needed
- **Behavior:** Headline (tagline from info.json) sets in with a confident, quick reveal — staggered word or line reveal, not letter-by-letter (letter-by-letter reads as try-hard/dated). Subheadline and primary CTA follow immediately after, all within ~1s.
- **Scroll-linked:** as user starts scrolling, hero content parallax-recedes (scales down slightly, moves back in z-space) while the next section's content begins rising underneath — this is the first "spatial" moment establishing the depth language for the rest of the page.
- **Why:** communicates value prop instantly (per design brief constraint — comprehension isn't gated behind scroll), then rewards scrolling with the first depth cue.

## 2. Problem Statement

- **Trigger:** scroll into view
- **Behavior:** A single strong statement about missed calls / cost of not answering (pull real stat from info.json proof points, but framed vertical-neutral — e.g. "Every missed call is a customer who called someone else"). Large type, pinned briefly (short pin-and-hold, not a long scroll-jack) while a supporting visual element (abstract, not literal-vertical) builds in behind/around it.
- **Why:** this is the emotional stakes-setting moment — deserves a beat of pinned attention before moving on, in the k72 tradition of a held dramatic statement.

## 3. How It Works

- **Trigger:** scroll into view, pinned section
- **Behavior:** The 4 steps from info.json reveal sequentially as the user scrolls through a pinned viewport — each step's content swaps in as a horizontal or depth-layered transition (not a simple fade), giving the sense of moving through a process in space. This is the one section where numbered markers are legitimate per the design brief (it's a real sequence).
- **Why:** genuinely sequential content — the pin-and-step pattern is earned here, not decorative.

## 4. Product Pillars

- **Trigger:** scroll into view
- **Behavior:** The 4 pillars from info.json enter as a staggered grid/layered reveal — each card offsetting slightly in the z-plane (spatial UI depth), subtle parallax on scroll so cards drift at slightly different rates.
- **Why:** reinforces the spatial/depth visual language established in the hero, applied to a straightforward content grid so it doesn't feel flat.

## 5. Vertical Proof (CPA case study)

- **Trigger:** scroll into view
- **Behavior:** The proof point (32%→5% missed calls, 13% revenue lift) animates in as counting numbers (GSAP number tween), framed carefully as "here's what happened for one of our clients" rather than "this is who we serve" — must read as an example/proof point, not a redefinition of the brand as accounting-only. Consider a small label like "Real result: CPA firm client" to keep the vertical-neutral framing explicit and prevent this section from unintentionally narrowing the brand's perceived positioning.
- **Why:** strongest current proof point, needs to be shown, but the design brief's vertical-neutral constraint has to be actively protected here — this is the section most likely to accidentally over-index the whole page toward "accounting tool."

## 6. CTA Section

- **Trigger:** scroll into view, likely final section before footer
- **Behavior:** Confident, clean, Apple-style close — large type, primary CTA button with a satisfying hover micro-interaction (Framer Motion is fine here — small scale/color shift, not a GSAP scroll timeline). Minimal competing motion — this section should feel like the "resting state" landing point after the spectacle above it.
- **Why:** per design brief's "restraint in the resting states" principle — the final conversion moment should be the clearest, calmest point on the page, not another spectacle beat. Competing for attention here works against conversion.

## Reduced motion fallback

For every section above: when `prefers-reduced-motion: reduce` is detected, replace scroll-triggered/pinned behavior with simple opacity fade-ins on view, no pinning, no parallax, no counting-number tweens (numbers just display final value). All content must still be fully present and readable — reduced motion removes the choreography, never the content.
