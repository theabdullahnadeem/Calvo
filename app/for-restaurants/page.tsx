import type { Metadata } from 'next';
import { getVerticalBySlug } from '@/lib/content';
import { SITE_URL } from '@/lib/constants';
import VerticalLanding from '@/components/sections/VerticalLanding';

const SLUG = 'for-restaurants';
const vertical = getVerticalBySlug(SLUG)!;

export const metadata: Metadata = {
  title: vertical.meta.title,
  description: vertical.meta.description,
  alternates: { canonical: `${SITE_URL}/${SLUG}` },
  openGraph: {
    title: vertical.meta.title,
    description: vertical.meta.description,
    url: `${SITE_URL}/${SLUG}`,
  },
};

export default function RestaurantsPage() {
  return <VerticalLanding slug={SLUG} />;
}
