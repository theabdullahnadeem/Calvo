import type { MetadataRoute } from 'next';
import { allVerticals, legalDocs } from '@/lib/content';
import { SITE_URL } from '@/lib/constants';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: SITE_URL, lastModified, changeFrequency: 'monthly', priority: 1 },
    ...allVerticals.map((vertical) => ({
      url: `${SITE_URL}/${vertical.slug}`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...legalDocs.map((doc) => ({
      url: `${SITE_URL}/${doc.slug}`,
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.2,
    })),
  ];
}
