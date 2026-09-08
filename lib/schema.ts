import { allTiers, brand, contact, content, site } from '@/lib/content';
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
    email: contact.email,
    telephone: contact.phone,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_URL}/assets/logo/calvo-app-icon.png`,
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: contact.phone,
      email: contact.email,
      contactType: 'sales',
      availableLanguage: 'English',
    },
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
export function serviceSchema() {
  const tiers = allTiers;
  const amounts = tiers
    .map((t) => Number(t.price.replace(/[^0-9.]/g, '')))
    .filter((n) => Number.isFinite(n) && n > 0);

  return {
    '@type': 'Service',
    '@id': `${SITE_URL}/#service`,
    name: 'Calvo AI Receptionist',
    serviceType: 'AI receptionist and phone answering service',
    provider: { '@id': ORG_ID },
    description: site.meta.description,
    areaServed: 'US',
    audience: {
      '@type': 'Audience',
      audienceType: content.verticals.primary.name,
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
