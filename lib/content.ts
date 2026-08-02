import { z } from 'zod';
import raw from '@/content/info.json';

/**
 * Typed loader for content/info.json.
 *
 * Per 06-build-prompt.md this is a hard requirement: no component may hardcode
 * real site copy. Parsing through Zod at module load means a malformed or
 * incomplete info.json fails the build rather than shipping empty sections.
 */

const metaSchema = z.object({
  title: z.string(),
  description: z.string(),
});

const heroCopySchema = z.object({
  eyebrow: z.string(),
  headline: z.string(),
  subheadline: z.string(),
});

const statSchema = z.object({
  label: z.string(),
  from: z.number(),
  to: z.number(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
  caption: z.string().optional(),
});

const verticalBaseSchema = z.object({
  name: z.string(),
  slug: z.string(),
  status: z.string(),
  shortName: z.string(),
  painPoints: z.array(z.string()).min(1),
  meta: metaSchema,
  hero: heroCopySchema,
  painPointsHeading: z.string(),
});

const primaryVerticalSchema = verticalBaseSchema.extend({
  proofPoint: z.object({
    metric: z.string(),
    metric2: z.string(),
  }),
  proofHeading: z.string(),
  stats: z.array(statSchema).min(1),
});

const legalDocSchema = z.object({
  slug: z.string(),
  navLabel: z.string(),
  eyebrow: z.string(),
  title: z.string(),
  meta: metaSchema,
  intro: z.string(),
  sections: z
    .array(
      z.object({
        heading: z.string(),
        body: z.array(z.string()).min(1),
      }),
    )
    .min(1),
});

const infoSchema = z.object({
  brand: z.object({
    name: z.string(),
    formerName: z.string(),
    domain: z.string(),
    tagline: z.string(),
    shortDescription: z.string(),
    longDescription: z.string(),
    positioning: z.object({
      core: z.string(),
      proofLayer: z.string(),
      doNotDo: z.string(),
    }),
  }),
  verticals: z.object({
    primary: primaryVerticalSchema,
    secondary: z.array(verticalBaseSchema).min(1),
  }),
  productPillars: z
    .array(z.object({ title: z.string(), description: z.string() }))
    .min(1),
  howItWorks: z
    .array(z.object({ step: z.string(), description: z.string() }))
    .min(1),
  cta: z.object({ primary: z.string(), secondary: z.string() }),
  pricing: z.object({
    eyebrow: z.string(),
    heading: z.string(),
    support: z.string(),
    minutesLabel: z.string(),
    popularLabel: z.string(),
    /** Fallback CTA label for tiers that don't set their own `ctaText`. */
    ctaLabel: z.string(),
    customHeading: z.string(),
    customBody: z.string(),
    tiers: z
      .array(
        z.object({
          name: z.string(),
          description: z.string(),
          /** Optional overline, e.g. seasonal or audience framing. */
          badge: z.string().optional(),
          price: z.string(),
          period: z.string(),
          minutes: z.string(),
          features: z.array(z.string()).min(1),
          /** Drives the recommended treatment — at most one tier should set it. */
          popular: z.boolean(),
          ctaText: z.string().optional(),
          finePrint: z.string().optional(),
        }),
      )
      .min(1),
  }),
  contact: z.object({ email: z.string().email() }),
  brandVoice: z.object({
    tone: z.string(),
    vocabularyRules: z.array(z.string()),
  }),
  design: z.object({
    wordmark: z.string(),
    colorPalette: z.object({
      primary: z.string(),
      background: z.string(),
      accent: z.string(),
      accentOnPaper: z.string(),
      accentOnInk: z.string(),
    }),
    iconStatus: z.string(),
    assets: z.record(z.string()),
  }),
  site: z.object({
    meta: z.object({
      titleDefault: z.string(),
      titleTemplate: z.string(),
      description: z.string(),
      ogAlt: z.string(),
      locale: z.string(),
    }),
    nav: z.object({
      links: z.array(z.object({ label: z.string(), href: z.string() })),
      industriesLabel: z.string(),
      menuOpenLabel: z.string(),
      menuCloseLabel: z.string(),
      skipToContent: z.string(),
    }),
    footer: z.object({
      wordmarkNote: z.string(),
      industriesHeading: z.string(),
      companyHeading: z.string(),
      contactHeading: z.string(),
      formerNameLine: z.string(),
      rightsLine: z.string(),
      backToTop: z.string(),
      legalHeading: z.string(),
    }),
    sections: z.object({
      hero: z.object({ eyebrow: z.string(), scrollCue: z.string() }),
      problem: z.object({
        eyebrow: z.string(),
        statement: z.string(),
        support: z.string(),
        ticker: z.array(z.string()).min(1),
      }),
      howItWorks: z.object({
        eyebrow: z.string(),
        heading: z.string(),
        stepLabel: z.string(),
        progressLabel: z.string(),
      }),
      pillars: z.object({
        eyebrow: z.string(),
        heading: z.string(),
        support: z.string(),
      }),
      marquee: z.object({ items: z.array(z.string()).min(2) }),
      proof: z.object({
        eyebrow: z.string(),
        clientLabel: z.string(),
        heading: z.string(),
        framing: z.string(),
        linkLabel: z.string(),
      }),
      cta: z.object({
        eyebrow: z.string(),
        heading: z.string(),
        support: z.string(),
        emailLabel: z.string(),
      }),
      verticalPages: z.object({
        painPointsEyebrow: z.string(),
        otherIndustriesHeading: z.string(),
        backToHomeLabel: z.string(),
      }),
    }),
  }),
  legal: z.object({
    /**
     * Present while the policy text is still a draft. Rendering it is
     * deliberate: unreviewed legal copy that looks final is worse than copy
     * that says what it is. Delete the key in info.json once counsel signs off
     * and the banner disappears everywhere.
     */
    reviewNotice: z.string().optional(),
    lastUpdatedLabel: z.string(),
    lastUpdated: z.string(),
    contactHeading: z.string(),
    contactBody: z.string(),
    privacy: legalDocSchema,
    terms: legalDocSchema,
  }),
});

export type Info = z.infer<typeof infoSchema>;
export type LegalDoc = z.infer<typeof legalDocSchema>;
export type Vertical = z.infer<typeof verticalBaseSchema>;
export type PrimaryVertical = z.infer<typeof primaryVerticalSchema>;
export type Stat = z.infer<typeof statSchema>;
export type Pillar = Info['productPillars'][number];
export type HowItWorksStep = Info['howItWorks'][number];

const parsed = infoSchema.safeParse(raw);

if (!parsed.success) {
  throw new Error(
    `content/info.json failed validation:\n${JSON.stringify(
      parsed.error.flatten(),
      null,
      2,
    )}`,
  );
}

export const content: Info = parsed.data;

/** Convenience accessors so components read intent, not JSON paths. */
export const brand = content.brand;
export const site = content.site;
export const sections = content.site.sections;
export const cta = content.cta;
export const contact = content.contact;
export const legal = content.legal;

/** Legal pages in footer order. */
export const legalDocs: LegalDoc[] = [content.legal.privacy, content.legal.terms];

/** All verticals in nav order, primary first. */
export const allVerticals: Vertical[] = [
  content.verticals.primary,
  ...content.verticals.secondary,
];

export function getVerticalBySlug(slug: string): Vertical | undefined {
  return allVerticals.find((v) => v.slug === slug);
}

/** Only the primary vertical carries a real proof point — nothing is invented
 *  for the others (02-design-brief.md: no fake/placeholder proof). */
export function getStatsForSlug(slug: string): Stat[] | undefined {
  return slug === content.verticals.primary.slug
    ? content.verticals.primary.stats
    : undefined;
}

export function otherVerticals(slug: string): Vertical[] {
  return allVerticals.filter((v) => v.slug !== slug);
}
