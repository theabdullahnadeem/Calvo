# Calvo — Build Prompt (for Claude Code)

Copy everything below the line into Claude Code as the initial build instruction, with the full doc set (`00-README.md` through `05-animation-spec.md` and `01-info.json`) available in the repo root or attached.

---

Build the Calvo marketing website from scratch as a Next.js 15 (App Router, TypeScript) project.

**Before writing code:** read `00-README.md`, `01-info.json`, `02-design-brief.md`, `03-tech-stack.md`, `04-file-structure.md`, and `05-animation-spec.md` in full. These are the complete spec — content, design direction, stack, structure, and animation behavior are all defined there. Follow the file structure in `04-file-structure.md` exactly.

**Content:** all copy must be sourced from `01-info.json` via a typed content loader (see `lib/content.ts` in the file structure doc) — do not hardcode English strings for real site copy directly in components. This is a hard requirement, not a preference.

**Design direction:** k72.ca crossed with apple.com — see `02-design-brief.md` for the full breakdown. Spectacle in scroll transitions, restraint in resting states. Spatial UI via layered parallax/depth, not literal WebGL/3D unless I explicitly ask for that separately.

**Animation:** GSAP + ScrollTrigger for all scroll-driven work, Lenis for smooth scroll, Framer Motion only for small hover/micro-interactions (not scroll timelines). Follow `05-animation-spec.md` section by section — it defines the exact trigger/behavior/rationale for each part of the homepage. Do not add animation beyond what's specified without flagging it to me first.

**Hard constraints — do not violate these even if it means simpler execution elsewhere:**
1. Brand positioning stays vertical-neutral on the core site. CPA-firm proof point is shown but explicitly framed as "one client example," never restructuring the whole page's identity around accounting. See `05-animation-spec.md` section 5 for exactly how to handle this.
2. Lighthouse Performance ≥ 85 on mobile for the homepage despite the animation load. Use the specific techniques listed in `03-tech-stack.md` (lazy ScrollTrigger init, next/image, self-hosted fonts, scoped/cleaned-up GSAP contexts).
3. `prefers-reduced-motion` must have a real, fully-functional fallback per the spec at the bottom of `05-animation-spec.md` — not just "one animation turned off."
4. Semantic HTML and proper heading hierarchy throughout, even where the visual layout is unconventional — this is a crawlability/SEO requirement.
5. The current logo icon (audio waveform) is a placeholder, not final — build the `Logo` component so the icon can be swapped via a single prop/asset reference, not hand-coded into multiple places.

**Build order:**
1. Scaffold the project per `04-file-structure.md`
2. Set up the design token system (`styles/tokens.css`, `tailwind.config.ts`) from the palette/type spec in `02-design-brief.md` and `01-info.json`
3. Build the typed content loader from `01-info.json`
4. Build the reusable `motion/` primitives (`ScrollReveal`, `ParallaxLayer`, `PinnedSection`) before building individual sections — sections should compose these, not reimplement GSAP logic each time
5. Build homepage sections in the order listed in `05-animation-spec.md`
6. Build the four vertical landing pages, reusing homepage section components with vertical-specific content swapped in from `info.json`
7. Accessibility and reduced-motion pass
8. Performance pass — run Lighthouse, fix anything under the 85 threshold before calling it done

**When something in the spec is ambiguous or you'd need to make a judgment call that affects brand positioning (not just implementation detail), stop and ask rather than guessing** — especially anything touching the vertical-neutral constraint, which is easy to accidentally violate under normal "make it look good" instincts.

After the initial build, take screenshots of each section at both desktop and mobile widths and self-critique against `02-design-brief.md` before presenting it as done.
