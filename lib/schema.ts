import { allTiers, brand, contact, content, faq, site } from '@/lib/content';
import { SITE_URL } from '@/lib/constants';

/**
 * JSON-LD builders.
 *
 * Everything here is derived from content/info.json — the same single source the
 * visible copy comes from — so the markup can never drift from the page.
 *
 * Deliberately absent: `aggregateRating` and `review`. Both would have to be
 * invented, both are what Google's structured-data spam policy targets, and a
 * manual action for fabricated review markup costs far more than the rich
 * result is worth. They go in the day there are real reviews to cite.
 */

const ORG_ID = `${SITE_URL}/#organization`;
const SITE_ID = `${SITE_URL}/#website`;

export function organizationSchema() {
  return {
    '@type': 'Organization',
    '@id': ORG_ID,
    name: brand.name,
    alternateName: brand.formerName,
    url: SITE_URL,
    description: brand.longDescription,
    telephone: contact.phone,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/assets/logo/calvo-app-icon.png`,
    },
    /**
     * Two contact points, no `email`. Schema.org contact data is exactly what
     * Google surfaces to someone looking for a way to reach the business, so
     * publishing an unmonitored address here is worse than publishing none —
     * see the note on `contact` in content/info.json.
     */
    contactPoint: [
      {
        '@type': 'ContactPoint',
        telephone: contact.phone,
        contactType: 'sales',
        areaServed: 'US',
        availableLanguage: 'English',
      },
      {
        '@type': 'ContactPoint',
        telephone: contact.whatsapp,
        contactType: 'customer support',
        areaServed: 'US',
        availableLanguage: 'English',
      },
    ],
  };
}

export function websiteSchema() {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    url: SITE_URL,
    name: brand.name,
    description: site.meta.description,
    publisher: { '@id': ORG_ID },
  };
}

/**
 * The product itself, with the published tiers as real offers.
 *
 * Prices are the live figures from info.json. `serviceType` uses the vocabulary
 * buyers actually search — "AI receptionist", "answering service" — rather than
 * internal product language.
 */
export function serviceSchema({
  /** Vertical pages narrow the audience and the name to the industry they
   *  address, so each one describes the service a searcher on that page is
   *  actually looking for rather than repeating the homepage's generic node. */
  name = 'Calvo AI Receptionist',
  audienceType = content.verticals.primary.name,
  description = site.meta.description,
  id = `${SITE_URL}/#service`,
}: {
  name?: string;
  audienceType?: string;
  description?: string;
  id?: string;
} = {}) {
  const tiers = allTiers;
  const amounts = tiers
    .map((t) => Number(t.price.replace(/[^0-9.]/g, '')))
    .filter((n) => Number.isFinite(n) && n > 0);

  return {
    '@type': 'Service',
    '@id': id,
    name,
    serviceType: 'AI receptionist and phone answering service',
    provider: { '@id': ORG_ID },
    description,
    areaServed: { '@type': 'Country', name: 'United States' },
    audience: {
      '@type': 'Audience',
      audienceType,
    },
    offers: {
      '@type': 'AggregateOffer',
      priceCurrency: 'USD',
      lowPrice: Math.min(...amounts),
      highPrice: Math.max(...amounts),
      offerCount: tiers.length,
      offers: tiers.map((tier) => ({
        '@type': 'Offer',
        name: `${brand.name} ${tier.name}`,
        description: `${tier.description} — ${tier.minutes}`,
        price: Number(tier.price.replace(/[^0-9.]/g, '')),
        priceCurrency: 'USD',
        url: `${SITE_URL}/#pricing`,
        availability: 'https://schema.org/InStock',
      })),
    },
  };
}

/**
 * FAQPage, built from the same 18 entries the visible section renders.
 *
 * Google's policy is that FAQ markup must correspond to content actually on the
 * page — markup for answers a visitor cannot see is a structured-data
 * violation. Both surfaces read `faq.items`, so they cannot drift: adding a
 * question adds it to the page and to the markup in the same edit.
 *
 * Rich results for FAQ are now limited to a narrow set of sites, so this is not
 * here for the SERP accordion. It is here because it is the cleanest
 * machine-readable statement of what the business does and costs, which is what
 * AI answer engines quote from.
 */
export function faqSchema() {
  return {
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/#faq`,
    mainEntity: faq.items.map((item) => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: { '@type': 'Answer', text: item.a },
    })),
  };
}

export function breadcrumbSchema(trail: { name: string; path: string }[]) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: trail.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.path}`,
    })),
  };
}

/** Wraps one or more nodes into a single @graph document. */
export function graph(...nodes: object[]) {
  return { '@context': 'https://schema.org', '@graph': nodes };
}
