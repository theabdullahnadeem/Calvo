# Calvo — Tech Stack

## Core stack

| Layer | Choice | Why |
|---|---|---|
| Framework | Next.js 15 (App Router) | Server-rendered by default, good for SEO/crawlability, deploys natively to Vercel |
| Language | TypeScript | Type safety across content schema (info.json) and components |
| Styling | Tailwind CSS | Fast iteration, easy to enforce design tokens (color/type scale) via config |
| Animation (scroll) | GSAP + ScrollTrigger | Explicitly requested; industry standard for this level of scroll choreography, better performance and control than Framer Motion for complex scroll-linked timelines |
| Animation (micro-interaction) | Framer Motion (optional, sparingly) | Fine for hover states / simple component transitions; GSAP remains the system for scroll-driven work — don't mix both for the same effect |
| Smooth scroll | Lenis (studio-freight) | Pairs cleanly with GSAP ScrollTrigger, lightweight, actively maintained |
| Hosting/Deploy | Vercel | Already in use, native Next.js support, good CWV tooling built in |
| Content source | `info.json` (typed via a Zod schema) | Single source of truth per your request — content never hardcoded in components |
| Fonts | Self-hosted via `next/font` | Avoids render-blocking external font requests, critical for performance target |

## Spatial UI mechanism: CSS 3D transforms + GSAP

"Spatial UI" is implemented via native CSS 3D transforms (`transform-style: preserve-3d`, `perspective`, `rotateX/Y/Z`, `translateZ`), with GSAP driving those transform values over scroll (through ScrollTrigger). GSAP is the animation engine; CSS 3D transforms are what it's animating — these are not alternatives to each other, they're used together.

**Required cross-browser testing:** CSS 3D transforms have known inconsistencies across browsers, especially nested `preserve-3d` contexts, Safari-specific rendering quirks, and z-fighting on overlapping elements at certain angles. This is a real, documented pain point, not hypothetical. Test explicitly in Safari (desktop and iOS) during the build, not just Chrome — do not treat Safari as an edge case. If a 3D effect renders inconsistently in Safari, simplify it rather than shipping a broken experience for a meaningful share of visitors.

## Explicitly NOT using (and why)

- **No WebGL/Three.js by default.** "Spatial UI" is being implemented via CSS 3D transforms + GSAP (see above), not a 3D rendering engine, to keep performance realistic and avoid WebGL's steeper complexity/browser-support/performance-tuning burden. If true WebGL-driven 3D is wanted later, it's a separate, larger scope decision — don't let an agent silently add Three.js because "spatial" sounds 3D.
- **No heavy Lottie/After Effects JSON exports unless file-size budgeted.** After Effects was requested for the *look* of the motion (the polish/easing quality), not necessarily meaning literal .json Lottie exports embedded everywhere — those can be heavy. Prefer GSAP-driven CSS/SVG animation for most moments; reserve Lottie for a small number of hero moments if truly needed, and budget file size explicitly.
- **No CMS for v1.** `info.json` is the source of truth per your request. A CMS (Sanity, Contentful) can be layered in later if content updates become frequent — don't over-engineer v1.

## Performance requirements (non-negotiable per design brief)

- Lighthouse Performance ≥ 85 on mobile for the homepage
- All below-the-fold animations lazy-init (ScrollTrigger `once` where appropriate, GSAP contexts scoped and cleaned up on unmount)
- Images served via `next/image`, properly sized, AVIF/WebP
- `prefers-reduced-motion` media query respected with a genuine fallback, not just disabling one animation
- No layout shift (CLS) caused by animation init — reserve space for animated elements before JS runs

## SEO requirements

- Server-rendered content — no critical copy hidden entirely behind client-side-only animation that a crawler can't see in the initial HTML
- Proper meta titles/descriptions per page, pulling from `info.json`, following the keyword strategy: brand name + category term (e.g. "Calvo — AI Calling Agents for Every Business")
- Vertical landing pages (`/for-cpa-firms`, `/for-restaurants`, etc.) each with their own targeted meta content
- Semantic HTML structure preserved even where visual layout is unconventional (proper heading hierarchy, not div-soup)
