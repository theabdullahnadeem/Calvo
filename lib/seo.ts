import type { Metadata } from 'next';
import { brand, site } from '@/lib/content';
import { SITE_URL } from '@/lib/constants';

/**
 * The social card, referenced explicitly.
 *
 * `app/opengraph-image.tsx` covers the root route, but Next replaces a parent's
 * `openGraph` object wholesale when a child page declares its own rather than
 * merging field by field — and it resolves the image file convention per
 * segment. Every page here declares `openGraph` (they each need their own
 * canonical `url`), and none of them has an `opengraph-image` file of its own,
 * so all five vertical and legal routes were shipping with no `og:image` at all:
 * every share of them rendered as a bare text link.
 *
 * The hashless path is the same asset Next serves at the hashed URL. Naming it
 * here means one image for the whole site and no per-route file to forget.
 */
const OG_IMAGE = `${SITE_URL}/opengraph-image`;

type PageMetaInput = {
  title: string;
  description: string;
  /** Route path with a leading slash, or '' for the homepage. */
  path: string;
};

/**
 * One builder for every page's metadata, so canonical, Open Graph and Twitter
 * can never disagree about what page they describe. Adding a route means
 * calling this, not copying a block.
 */
export function pageMetadata({
  title,
  description,
  path,
}: PageMetaInput): Metadata {
  const url = `${SITE_URL}${path}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: 'website',
      siteName: brand.name,
      locale: site.meta.locale,
      title,
      description,
      url,
      images: [
        {
          url: OG_IMAGE,
          width: 1200,
          height: 630,
          alt: site.meta.ogAlt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [OG_IMAGE],
    },
  };
}
