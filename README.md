# Calvo — marketing site

Next.js 15 (App Router) + TypeScript + Tailwind + GSAP/ScrollTrigger + Lenis.

Built from the spec set in [`docs/`](docs/). Those files are the brief; this
README covers how the build implements them and what still needs a decision.

```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # stop the dev server first — both write to .next/
npm run typecheck
```

## Content

**Every user-facing string comes from [`content/info.json`](content/info.json).**
Components never hardcode copy. The file is parsed through a Zod schema in
[`lib/content.ts`](lib/content.ts) at module load, so a malformed or incomplete
`info.json` fails the build rather than shipping an empty section.

`content/info.json` originates from `docs/01-info.json` — the original keys are
preserved verbatim, with site copy, pricing, and legal text added alongside.

## Structure

```
app/                    routes; one thin file per page, metadata from info.json
components/motion/      reusable animation primitives — build on these, not raw GSAP
components/sections/    page sections, composed from the primitives
components/layout/      header, footer, preloader, smooth scroll
components/ui/          Logo, LogoMark, Button
lib/                    content loader, gsap loader, design constants
styles/tokens.css       design tokens — the source of truth for colour and type
docs/                   the original brief and the two HTML motion references
```

## How the animation layer is put together

- **GSAP is never on the critical path.** It is dynamically imported by
  `lib/gsap.ts` on first use and memoised. The preloader and the hero's load-in
  are pure CSS, so nothing above the fold waits for a tween engine.
- **`useGsapContext`** scopes every animation to a `gsap.context` and reverts it
  on unmount, using a *layout* effect. That timing is load-bearing: ScrollTrigger
  reparents pinned sections into a `.pin-spacer`, and a passive effect would run
  its cleanup after React had already tried to detach the section.
- **Hidden-before-reveal states come from CSS**, gated on an `.anim-ready` class
  that an inline script in `<head>` only sets when JS is running *and* reduced
  motion is off. Content is therefore visible by default — for crawlers, for
  no-JS, and for reduced motion — and is only ever hidden for someone who will
  actually see it animate.
  - Consequence worth knowing: anything that clears GSAP's inline styles must
    remove the `data-reveal` / `data-word-reveal` attribute **first**, or the CSS
    rule takes the element straight back to hidden.
- **CSS 3D uses per-element `transformPerspective`**, not `perspective` on a
  shared ancestor. That deliberately avoids nested `preserve-3d` contexts, which
  `docs/03-tech-stack.md` flags as the documented Safari failure case.
- **`SectionDepth` must never wrap a pinned section.** A transformed ancestor
  breaks the `position: fixed` that ScrollTrigger pins with.

### Dev-only handles

`window.__lenis`, `window.gsap`, and `window.ScrollTrigger` are exposed in
development for driving the page from devtools. `?holdLoader=1` freezes the
preloader so it can be inspected. All three are stripped from production builds.

## Product mockups

`components/dashboard/` renders the dark "app view" panels — the hero live-call
panel and the four views attached to the product pillars.

**What they are allowed to show is constrained, and the constraint is the point.**
Every element depicts a capability `content/info.json` already claims: the agent
answers, qualifies, routes, escalates, transcribes, logs the call, and syncs to
the CRM. The call-log columns (time, duration, outcome) are the exact fields the
privacy policy commits to. Nothing resembling an inbox, a draft/approve/send
step, an unread count, or a multi-channel message queue belongs in this
directory — Calvo is inbound voice, and a mockup is a product claim.

**The "example view" labels are load-bearing.** info.json makes no concurrency
claim anywhere; the only occurrence of "simultaneously" in the file is a
restaurant pain point about human staff. So the hero counter is labelled as
illustrative twice — once in the frame chrome, once beside the number — and
`AppFrame` renders that badge on every panel. Removing those labels turns an
illustration into a fabricated live metric. If real figures ever exist, replace
the numbers *and* the labels together.

**Surfaces.** The panels carry `.surface-ink`, which re-declares the whole
semantic token set for their subtree. That is what lets a dark product view sit
inside a paper section without a hardcoded colour, so the ink/paper rhythm in
`app/page.tsx` survives. Elevation comes from `--elev-1/2/3` in
`styles/tokens.css`, shared with the pricing cards so every raised panel matches.

### Three animation engines, and which owns what

- **GSAP** — anything tied to scroll position: every ScrollTrigger reveal, the
  pinned How-it-works track, the section depth choreography, and `CountUp`.
- **Motion.dev** (`motion/react`) — component-level state: the in-view entrance
  of transcript lines and dashboard rows, and the strike drawn across the "before"
  figure in the proof stat.
- **Anime.js** (`lib/anime.ts`) — self-contained timelines on their own clock
  with a per-element stagger: the call-audio waveform.

Both Motion and Anime are lazy: `lib/anime.ts` memoises a dynamic import the
same way `lib/gsap.ts` does, and the Motion-dependent components are pulled in
through `next/dynamic` so the runtime lands in a deferred chunk rather than the
route's first load. Importing Motion directly cost **+44 kB** on first load;
splitting it brought that to **+3 kB** (137 kB → 140 kB). Keep it that way — this
site has a hard Lighthouse >= 85 requirement and LCP is already the constraint.

Entrance states follow the existing contract: the hidden state is CSS, gated on
`.anim-ready` (`[data-mock-reveal]`, `[data-strike]` in `app/globals.css`), never
an SSR'd inline style. Verified in the production HTML — the transcript, the call
rows and the counter's final value are all present as plain visible markup, so
crawlers, no-JS and reduced-motion visitors get the content, not an empty frame.

## Reduced motion

Not a switch on one animation — the whole layer is skipped. With
`prefers-reduced-motion: reduce`: GSAP and Lenis are never downloaded, no
preloader renders, no section pins, the How-it-works track lays out as a plain
vertical list, and the proof counters render their final values. Verified: 25
animated elements, 0 left invisible, 0 pin-spacers.

## Measured

Production build, mobile emulation:

| | |
|---|---|
| Lighthouse Performance | **89** (requirement: ≥ 85) |
| | *measured before the product-mockup pass — re-run before shipping* |
| Best Practices / SEO | 100 / 100 |
| Accessibility | 92 → fixes applied since, re-audit after next build |
| CLS | 0.008 |

LCP is the constraint (hero headline, held behind the preloader curtain). If more
headroom is needed, the loader's `COUNT_MS` is the direct lever.

## Open decisions

These need a human, and are deliberately visible rather than silently guessed:

1. **Legal text is an unreviewed draft.** `/privacy` and `/terms` render a
   "draft for review" banner. Delete `legal.reviewNotice` once counsel signs off.
   The registered entity name, governing jurisdiction, subprocessor list, and
   retention periods are all still unset.
2. **Brand accent is derived, not supplied.** `#3E846B` was sampled from the
   square in the delivered mark. The per-surface variants (`--accent-on-paper`,
   `--accent-on-ink`) exist because the raw green only reaches 4.3:1 on the paper
   background, short of AA for body text. Change `--brand-green` in
   `styles/tokens.css` and both derive from it.
3. **The mark is redrawn, not embedded.** `components/ui/LogoMark.tsx` is a
   measured vector reproduction of the supplied rasters (ink coverage matches the
   source to 0.14pp). The originals are kept in `public/assets/logo/`. It is
   vector because the mark has to sit on both surfaces at 15–44px, and the
   supplied PNGs are opaque on an off-white ground.
4. **The wordmark is a mask, not live text.** `calvo-wordmark-mask.png` is an
   alpha-only trace of the supplied lockup, painted with `currentColor` so it
   inverts per surface. Swap via `WORDMARK_MASK_SRC` in `lib/constants.ts`.
5. **Display face is a grotesque, not the geometric the brief assumed.** The
   delivered wordmark is a neo-grotesque, so Inter Tight was chosen to match it
   rather than the geometric `docs/02-design-brief.md` describes.
6. **Safari has not been tested.** `docs/03-tech-stack.md` requires explicit
   Safari desktop and iOS testing of the 3D work. The per-element perspective
   approach above was chosen to avoid the known failure mode, but that is a
   mitigation, not a test.

## Vertical-neutral constraint

The core brand stays category-level; vertical language lives only on
`/for-[vertical]` pages. The homepage proof section is the place this is most
easily lost, so it is structurally defended: the client label sits *above* the
numbers, the heading reads "One client example", and a framing line names the
other verticals explicitly. Do not reorder those without re-reading
`docs/05-animation-spec.md` §5.
