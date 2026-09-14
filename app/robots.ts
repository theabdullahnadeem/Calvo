import type { MetadataRoute } from 'next';
import { SITE_URL } from '@/lib/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Nothing under /api renders a page — /api/lead and /api/chat are
      // POST-only endpoints that answer a crawler's GET with a 405. Letting a
      // crawler discover and retry them spends crawl budget on two URLs that
      // can never be indexed, and puts 405s in the Search Console coverage
      // report where real problems should be.
      disallow: '/api/',
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
