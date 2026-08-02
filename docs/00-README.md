# Calvo — Website Rebuild Doc Set

This folder contains everything Claude Code (or any dev/agent) needs to build the new Calvo marketing site from scratch, with zero prior context.

## Read order

1. `00-README.md` — this file
2. `01-info.json` — single source of truth for brand, copy, and site content. If content is ever lost or the site needs rebuilding, this file is what to regenerate from.
3. `02-design-brief.md` — visual direction, tone, references, what NOT to do
4. `03-tech-stack.md` — stack choices and why
5. `04-file-structure.md` — folder/file layout for the repo
6. `05-animation-spec.md` — GSAP/ScrollTrigger behavior spec, section by section
7. `06-build-prompt.md` — the actual prompt to hand to Claude Code to build the site

## Important context Claude Code should know before starting

- **Brand name:** Calvo (formerly Digivixo)
- **Domain:** getcalvo.com
- **What Calvo does:** AI voice/calling agents, custom-trained per business. NOT a single-vertical product — currently serves CPA/accounting firms (primary vertical, strongest traction), restaurants, cafes, and general service businesses.
- **Positioning constraint:** the brand identity (logo, hero, homepage) must stay vertical-neutral. Vertical-specific proof and language belongs on dedicated landing pages (`/for-cpa-firms`, `/for-restaurants`, etc.), not baked into the core brand.
- **Design reference:** k72.ca (motion, scroll-driven storytelling, art direction) crossed with apple.com (restraint, spatial product presentation, confident whitespace). Heavy GSAP/ScrollTrigger use expected — see `05-animation-spec.md`.
- **Known tension to manage, not ignore:** motion-heavy sites can hurt Core Web Vitals/LCP and SEO crawlability if built carelessly. The build must treat performance and accessibility as requirements, not afterthoughts — see the constraints in `03-tech-stack.md` and `06-build-prompt.md`. Do not sacrifice these for animation polish.
- **Logo assets:** wordmark + light/dark lockups exist (see `/assets/logo/` — to be dropped in before build). Icon mark is currently a placeholder (audio waveform) and is known to be generic — flagged as not final. Do not treat the icon as locked; wordmark and color system are locked.

## What "done" looks like

A production-ready Next.js site, deployed to Vercel, with:
- A scroll-driven homepage matching the animation spec
- Vertical-neutral core brand messaging
- Fast enough Lighthouse/CWV scores that SEO isn't structurally harmed by the motion work
- All copy sourced from `01-info.json`, not hardcoded in components
